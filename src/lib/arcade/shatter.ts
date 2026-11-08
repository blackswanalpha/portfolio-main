// Shatter: keep the ball in play and break every brick.
//
// Pure simulation, no React or DOM. The world is a plain mutable object in
// fixed logical units (480 x 600) advanced by `stepWorld` at a fixed timestep
// (STEP, 1/240 s). At 240 Hz the fastest ball moves under 2.5 units per step,
// well below its radius, so it cannot tunnel through a brick or the paddle.
// Everything the UI reacts to (sounds, particles, HUD numbers) is reported
// through `world.events`, which the UI drains each frame.

import { mulberry32, type Rng } from "./rng";

export const WORLD_W = 480;
export const WORLD_H = 600;
export const STEP = 1 / 240;

export const PADDLE_Y = 552;
export const PADDLE_H = 12;
const PADDLE_W = 84;
const WIDE_W = 128;
export const BALL_R = 7;
const TOP_WALL = 0;

const BRICK_COLS = 10;
export const BRICK_H = 18;
const BRICK_GAP = 4;
const SIDE_MARGIN = 16;
const BRICK_TOP = 64;
const BRICK_W = (WORLD_W - SIDE_MARGIN * 2 - BRICK_GAP * (BRICK_COLS - 1)) / BRICK_COLS;

const KEY_SPEED = 560; // paddle units/s from the keyboard
const POINTER_SPEED = 2200; // paddle units/s chasing the pointer
const PICKUP_SPEED = 150;
const MAX_BALLS = 8;
const MAX_LIVES = 5;
const START_LIVES = 3;
const CLEAR_PAUSE = 1.6; // seconds between levels

export type PickupKind = "wide" | "multi" | "slow" | "life";

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Brick {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  row: number;
  hp: number;
  maxHp: number;
  alive: boolean;
}

export interface Pickup {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
}

export type ShatterEvent =
  | { type: "brick"; x: number; y: number; row: number; maxHp: number; hp: number; destroyed: boolean; combo: number; points: number }
  | { type: "paddle"; x: number; y: number }
  | { type: "wall"; x: number; y: number }
  | { type: "pickup"; kind: PickupKind; x: number; y: number }
  | { type: "lifeLost"; lives: number }
  | { type: "levelClear"; level: number; bonus: number }
  | { type: "levelStart"; level: number }
  | { type: "gameOver"; score: number; level: number }
  | { type: "launch" };

export type Phase = "serve" | "play" | "cleared" | "over";

export interface ShatterWorld {
  phase: Phase;
  level: number;
  lives: number;
  score: number;
  /** Simulated seconds; pauses with the game. */
  time: number;
  paddleX: number;
  paddleW: number;
  balls: Ball[];
  bricks: Brick[];
  pickups: Pickup[];
  wideUntil: number;
  slowUntil: number;
  clearTimer: number;
  /** Grows with each paddle hit, reset per life. */
  rally: number;
  /** Bricks broken since the ball last touched the paddle. */
  combo: number;
  nextId: number;
  events: ShatterEvent[];
  rng: Rng;
}

export interface ShatterInput {
  /** Keyboard steering, -1 (left) to 1 (right). */
  axis: number;
  /** Pointer x in world units, or null when the pointer isn't steering. */
  pointerX: number | null;
  /** Launch the served ball (edge-triggered by the UI). */
  launch: boolean;
}

// Six original layouts: "." empty, digit = hits to break. After the sixth they
// repeat with a faster ball.
const LAYOUTS: string[][] = [
  ["1111111111", "1111111111", "1111111111", "1111111111"],
  ["....22....", "...2112...", "..211112..", ".21111112.", "..211112..", "...2112...", "....22...."],
  ["3..3..3..3", "2..2..2..2", "1111111111", "2..2..2..2", "1111111111"],
  ["2.2.2.2.2.", ".2.2.2.2.2", "1.1.1.1.1.", ".1.1.1.1.1", "2.2.2.2.2.", ".2.2.2.2.2"],
  ["3........3", "23......32", "123....321", ".123..321.", "..123321..", "...1221..."],
  ["3333333333", "3111111113", "3122222213", "3121111213", "3122222213", "3111111113"],
];

export const LAYOUT_COUNT = LAYOUTS.length;

function buildBricks(level: number, world: { nextId: number }): Brick[] {
  const layout = LAYOUTS[(level - 1) % LAYOUTS.length];
  const bricks: Brick[] = [];
  layout.forEach((line, row) => {
    for (let col = 0; col < BRICK_COLS; col++) {
      const ch = line[col];
      if (!ch || ch === ".") continue;
      const hp = Number(ch);
      bricks.push({
        id: world.nextId++,
        x: SIDE_MARGIN + col * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + row * (BRICK_H + BRICK_GAP),
        w: BRICK_W,
        h: BRICK_H,
        row,
        hp,
        maxHp: hp,
        alive: true,
      });
    }
  });
  return bricks;
}

/** Ball speed for a level: faster each level and each lap of the layouts. */
function baseSpeed(level: number): number {
  return Math.min(300 + (level - 1) * 14, 470);
}

function currentSpeed(w: ShatterWorld): number {
  const slow = w.time < w.slowUntil ? 0.72 : 1;
  return baseSpeed(w.level) * (1 + Math.min(w.rally, 30) * 0.012) * slow;
}

function servedBall(w: ShatterWorld): Ball {
  return { id: w.nextId++, x: w.paddleX, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0 };
}

export function createWorld(seed: number): ShatterWorld {
  const w: ShatterWorld = {
    phase: "serve",
    level: 1,
    lives: START_LIVES,
    score: 0,
    time: 0,
    paddleX: WORLD_W / 2,
    paddleW: PADDLE_W,
    balls: [],
    bricks: [],
    pickups: [],
    wideUntil: 0,
    slowUntil: 0,
    clearTimer: 0,
    rally: 0,
    combo: 0,
    nextId: 1,
    events: [],
    rng: mulberry32(seed),
  };
  w.bricks = buildBricks(1, w);
  w.balls = [servedBall(w)];
  w.events.push({ type: "levelStart", level: 1 });
  return w;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

function setVelocity(ball: Ball, angleFromUp: number, speed: number) {
  ball.vx = speed * Math.sin(angleFromUp);
  ball.vy = -speed * Math.cos(angleFromUp);
}

/** Keep the speed exact and the path from going too flat to ever come back. */
function normalise(ball: Ball, speed: number) {
  const len = Math.hypot(ball.vx, ball.vy) || 1;
  ball.vx = (ball.vx / len) * speed;
  ball.vy = (ball.vy / len) * speed;
  const minVy = speed * 0.3;
  if (Math.abs(ball.vy) < minVy) {
    ball.vy = (ball.vy < 0 ? -1 : 1) * minVy;
    ball.vx = (ball.vx < 0 ? -1 : 1) * Math.sqrt(speed * speed - minVy * minVy);
  }
}

function dropPickup(w: ShatterWorld, x: number, y: number) {
  if (w.pickups.length >= 3 || w.rng() > 0.13) return;
  const roll = w.rng();
  const kind: PickupKind = roll < 0.36 ? "wide" : roll < 0.66 ? "multi" : roll < 0.92 ? "slow" : "life";
  w.pickups.push({ id: w.nextId++, kind, x, y });
}

function applyPickup(w: ShatterWorld, p: Pickup) {
  switch (p.kind) {
    case "wide":
      w.wideUntil = w.time + 12;
      break;
    case "slow":
      w.slowUntil = w.time + 8;
      break;
    case "life":
      w.lives = Math.min(MAX_LIVES, w.lives + 1);
      break;
    case "multi": {
      const speed = currentSpeed(w);
      const clones: Ball[] = [];
      for (const b of w.balls) {
        for (const turn of [-0.4, 0.4]) {
          if (w.balls.length + clones.length >= MAX_BALLS) break;
          const cos = Math.cos(turn);
          const sin = Math.sin(turn);
          const c: Ball = { id: w.nextId++, x: b.x, y: b.y, vx: b.vx * cos - b.vy * sin, vy: b.vx * sin + b.vy * cos };
          normalise(c, speed);
          clones.push(c);
        }
      }
      w.balls.push(...clones);
      break;
    }
  }
  w.events.push({ type: "pickup", kind: p.kind, x: p.x, y: p.y });
}

function hitBrick(w: ShatterWorld, brick: Brick) {
  brick.hp--;
  const destroyed = brick.hp <= 0;
  let points = 5;
  if (destroyed) {
    brick.alive = false;
    w.combo++;
    points = Math.round(25 * brick.maxHp * (1 + 0.2 * Math.min(w.combo - 1, 10)));
    dropPickup(w, brick.x + brick.w / 2, brick.y + brick.h / 2);
  }
  w.score += points;
  w.events.push({
    type: "brick",
    x: brick.x + brick.w / 2,
    y: brick.y + brick.h / 2,
    row: brick.row,
    maxHp: brick.maxHp,
    hp: brick.hp,
    destroyed,
    combo: w.combo,
    points,
  });
}

/** Move one ball one step. Returns false when it fell out of the world. */
function stepBall(w: ShatterWorld, ball: Ball, dt: number, speed: number): boolean {
  const prevY = ball.y;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - BALL_R < 0) {
    ball.x = BALL_R;
    ball.vx = Math.abs(ball.vx);
    w.events.push({ type: "wall", x: ball.x, y: ball.y });
  } else if (ball.x + BALL_R > WORLD_W) {
    ball.x = WORLD_W - BALL_R;
    ball.vx = -Math.abs(ball.vx);
    w.events.push({ type: "wall", x: ball.x, y: ball.y });
  }
  if (ball.y - BALL_R < TOP_WALL) {
    ball.y = TOP_WALL + BALL_R;
    ball.vy = Math.abs(ball.vy);
    w.events.push({ type: "wall", x: ball.x, y: ball.y });
  }

  // Paddle: only from above, and only while moving down, so a ball can never
  // be caught inside it or bounced twice.
  const half = w.paddleW / 2;
  if (
    ball.vy > 0 &&
    prevY + BALL_R <= PADDLE_Y + 1 &&
    ball.y + BALL_R >= PADDLE_Y &&
    ball.x >= w.paddleX - half - BALL_R &&
    ball.x <= w.paddleX + half + BALL_R
  ) {
    const offset = clamp((ball.x - w.paddleX) / (half + BALL_R), -1, 1);
    w.rally++;
    w.combo = 0;
    setVelocity(ball, offset * 1.05, currentSpeed(w));
    ball.y = PADDLE_Y - BALL_R;
    w.events.push({ type: "paddle", x: ball.x, y: PADDLE_Y });
    return true;
  }

  // Bricks: resolve against the closest overlapping brick only. The others
  // get their turn next step, after the ball has moved away.
  let hit: Brick | null = null;
  let hitDx = 0;
  let hitDy = 0;
  let best = BALL_R * BALL_R;
  for (const brick of w.bricks) {
    if (!brick.alive) continue;
    const cx = clamp(ball.x, brick.x, brick.x + brick.w);
    const cy = clamp(ball.y, brick.y, brick.y + brick.h);
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 <= best) {
      best = d2;
      hit = brick;
      hitDx = dx;
      hitDy = dy;
    }
  }
  if (hit) {
    if (hitDx === 0 && hitDy === 0) {
      // Centre inside the brick (only possible at a corner graze): bounce back
      // the way it came vertically.
      ball.vy = prevY < hit.y + hit.h / 2 ? -Math.abs(ball.vy) : Math.abs(ball.vy);
    } else if (Math.abs(hitDx) > Math.abs(hitDy)) {
      ball.vx = Math.sign(hitDx) * Math.abs(ball.vx);
      ball.x = (hitDx > 0 ? hit.x + hit.w : hit.x) + Math.sign(hitDx) * BALL_R;
    } else {
      ball.vy = Math.sign(hitDy) * Math.abs(ball.vy);
      ball.y = (hitDy > 0 ? hit.y + hit.h : hit.y) + Math.sign(hitDy) * BALL_R;
    }
    hitBrick(w, hit);
  }

  normalise(ball, speed);
  return ball.y - BALL_R <= WORLD_H;
}

function loadLevel(w: ShatterWorld, level: number) {
  w.level = level;
  w.bricks = buildBricks(level, w);
  w.pickups = [];
  w.wideUntil = 0;
  w.slowUntil = 0;
  w.rally = 0;
  w.combo = 0;
  w.balls = [servedBall(w)];
  w.phase = "serve";
  w.events.push({ type: "levelStart", level });
}

/** Advance the world by one fixed step. A finished game ignores further steps. */
export function stepWorld(w: ShatterWorld, input: ShatterInput, dt: number = STEP): void {
  if (w.phase === "over") return;
  w.time += dt;

  // Paddle width eases toward its target; position follows input.
  const targetW = w.time < w.wideUntil ? WIDE_W : PADDLE_W;
  const dw = targetW - w.paddleW;
  w.paddleW += clamp(dw, -240 * dt, 240 * dt);
  if (input.pointerX !== null) {
    const dx = input.pointerX - w.paddleX;
    w.paddleX += clamp(dx, -POINTER_SPEED * dt, POINTER_SPEED * dt);
  } else if (input.axis !== 0) {
    w.paddleX += clamp(input.axis, -1, 1) * KEY_SPEED * dt;
  }
  w.paddleX = clamp(w.paddleX, w.paddleW / 2, WORLD_W - w.paddleW / 2);

  if (w.phase === "cleared") {
    w.clearTimer -= dt;
    if (w.clearTimer <= 0) loadLevel(w, w.level + 1);
    return;
  }

  if (w.phase === "serve") {
    const ball = w.balls[0] ?? servedBall(w);
    w.balls = [ball];
    ball.x = w.paddleX;
    ball.y = PADDLE_Y - BALL_R - 1;
    if (input.launch) {
      w.phase = "play";
      setVelocity(ball, (w.rng() - 0.5) * 0.7, currentSpeed(w));
      w.events.push({ type: "launch" });
    }
    return;
  }

  // phase === "play"
  const speed = currentSpeed(w);
  w.balls = w.balls.filter((ball) => stepBall(w, ball, dt, speed));

  for (const p of w.pickups) {
    p.y += PICKUP_SPEED * dt;
  }
  const half = w.paddleW / 2;
  w.pickups = w.pickups.filter((p) => {
    const caught =
      p.y + 9 >= PADDLE_Y && p.y - 9 <= PADDLE_Y + PADDLE_H && Math.abs(p.x - w.paddleX) <= half + 14;
    if (caught) applyPickup(w, p);
    return !caught && p.y - 10 <= WORLD_H;
  });

  // A level cleared by the same step that lost the last ball still counts as
  // cleared: bricks are checked before lives.
  if (!w.bricks.some((b) => b.alive)) {
    const bonus = 250 * w.level + 100 * w.lives;
    w.score += bonus;
    w.phase = "cleared";
    w.clearTimer = CLEAR_PAUSE;
    w.balls = [];
    w.pickups = [];
    w.events.push({ type: "levelClear", level: w.level, bonus });
    return;
  }

  if (w.balls.length === 0) {
    w.lives--;
    w.pickups = [];
    w.wideUntil = 0;
    w.slowUntil = 0;
    w.rally = 0;
    w.combo = 0;
    if (w.lives <= 0) {
      w.lives = 0;
      w.phase = "over";
      w.events.push({ type: "lifeLost", lives: 0 });
      w.events.push({ type: "gameOver", score: w.score, level: w.level });
      return;
    }
    w.events.push({ type: "lifeLost", lives: w.lives });
    w.phase = "serve";
    w.balls = [servedBall(w)];
  }
}

export const bricksLeft = (w: ShatterWorld) => w.bricks.reduce((n, b) => n + (b.alive ? 1 : 0), 0);
