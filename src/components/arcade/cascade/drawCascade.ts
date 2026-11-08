"use client";

import { COLS, ROWS, colOf, rowOf, type Gem, type Step } from "@/lib/arcade/cascade";
import {
  Floaters,
  NEON,
  Particles,
  Shake,
  clamp01,
  drawGlow,
  easeOutCubic,
  roundRectPath,
} from "../shared/fx";
import { GEM_COLORS, gemPath } from "./gems";

// Canvas renderer and step player for Cascade. Logical units: one cell = 100.
//
// The engine has already resolved the whole move; this module only plays the
// returned steps back, one after another, by moving gem sprites (keyed by gem
// id) between cells. When the queue is empty the sprites are reconciled with
// the real board, so playback can never leave the picture out of sync.

const CELL = 100;
const GRAVITY = 90; // cells / s²

export interface GemSprite {
  id: number;
  gem: Gem;
  /** Position in cell units (column, row). */
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  t0: number;
  dur: number;
  ease: "out" | "in" | "inout";
  /** Swap there and back (invalid move). */
  pingpong: boolean;
  dying: boolean;
  dieAt: number;
  bornAt: number;
  landedAt: number;
}

interface Beam {
  kind: "row" | "col" | "ring" | "bolt";
  x: number;
  y: number;
  x2: number;
  y2: number;
  color: string;
  t0: number;
  life: number;
}

export interface StepHooks {
  onSwap(valid: boolean): void;
  onClear(points: number, combo: number, blasts: number): void;
  onShuffle(): void;
}

export interface CascadeVisual {
  clock: number;
  sprites: Map<number, GemSprite>;
  queue: Step[];
  step: Step | null;
  stepEnd: number;
  particles: Particles;
  floaters: Floaters;
  shake: Shake;
  beams: Beam[];
  selected: number;
  cursor: number;
  showCursor: boolean;
  hover: number;
  hint: [number, number] | null;
  cache: Map<string, HTMLCanvasElement>;
  cachePx: number;
}

const cellX = (i: number) => colOf(i);
const cellY = (i: number) => rowOf(i);

function makeSprite(gem: Gem, x: number, y: number, now: number): GemSprite {
  return {
    id: gem.id,
    gem,
    x,
    y,
    fromX: x,
    fromY: y,
    toX: x,
    toY: y,
    t0: now,
    dur: 0,
    ease: "out",
    pingpong: false,
    dying: false,
    dieAt: 0,
    bornAt: -1,
    landedAt: -1,
  };
}

export function createCascadeVisual(board: Gem[]): CascadeVisual {
  const sprites = new Map<number, GemSprite>();
  board.forEach((gem, i) => sprites.set(gem.id, makeSprite(gem, cellX(i), cellY(i), 0)));
  return {
    clock: 0,
    sprites,
    queue: [],
    step: null,
    stepEnd: 0,
    particles: new Particles(700),
    floaters: new Floaters(),
    shake: new Shake(),
    beams: [],
    selected: -1,
    cursor: 27,
    showCursor: false,
    hover: -1,
    hint: null,
    cache: new Map(),
    cachePx: 0,
  };
}

export const isBusy = (vis: CascadeVisual) => vis.step !== null || vis.queue.length > 0;

export function enqueueSteps(vis: CascadeVisual, steps: Step[]) {
  vis.queue.push(...steps);
}

function tween(s: GemSprite, toX: number, toY: number, now: number, dur: number, ease: GemSprite["ease"], pingpong = false) {
  s.fromX = s.x;
  s.fromY = s.y;
  s.toX = toX;
  s.toY = toY;
  s.t0 = now;
  s.dur = Math.max(0.0001, dur);
  s.ease = ease;
  s.pingpong = pingpong;
}

/** The live sprite whose destination is cell `i`. */
function spriteAt(vis: CascadeVisual, i: number): GemSprite | undefined {
  const x = cellX(i);
  const y = cellY(i);
  for (const s of vis.sprites.values()) {
    if (!s.dying && s.toX === x && s.toY === y) return s;
  }
  return undefined;
}

const colorOf = (gem: Gem) => (gem.color >= 0 ? GEM_COLORS[gem.color].base : NEON.white);

function startStep(vis: CascadeVisual, step: Step, reduced: boolean, hooks: StepHooks) {
  const now = vis.clock;
  const k = reduced ? 0.5 : 1;
  let dur = 0;
  switch (step.kind) {
    case "swap": {
      const sa = spriteAt(vis, step.a);
      const sb = spriteAt(vis, step.b);
      dur = (step.valid ? 0.17 : 0.3) * k;
      if (sa) tween(sa, cellX(step.b), cellY(step.b), now, dur, "inout", !step.valid);
      if (sb) tween(sb, cellX(step.a), cellY(step.a), now, dur, "inout", !step.valid);
      hooks.onSwap(step.valid);
      break;
    }
    case "clear": {
      dur = 0.3 * k;
      let sx = 0;
      let sy = 0;
      for (const { gem } of step.cleared) {
        const s = vis.sprites.get(gem.id);
        if (!s) continue;
        s.dying = true;
        s.dieAt = now;
        sx += s.x;
        sy += s.y;
        if (!reduced) {
          const px = (s.x + 0.5) * CELL;
          const py = (s.y + 0.5) * CELL;
          vis.particles.burst(px, py, colorOf(gem), 7, { speed: 330, life: 0.55, size: 18 });
          vis.particles.burst(px, py, GEM_COLORS[Math.max(0, gem.color)].light, 3, {
            speed: 220,
            life: 0.7,
            size: 12,
            kind: "shard",
            gravity: 900,
          });
        }
      }
      for (const blast of step.blasts) {
        const bx = (cellX(blast.index) + 0.5) * CELL;
        const by = (cellY(blast.index) + 0.5) * CELL;
        const color = blast.color >= 0 ? GEM_COLORS[blast.color].base : NEON.fuchsia;
        if (blast.special === "row") {
          vis.beams.push({ kind: "row", x: 0, y: by, x2: COLS * CELL, y2: by, color, t0: now, life: 0.45 });
        } else if (blast.special === "col") {
          vis.beams.push({ kind: "col", x: bx, y: 0, x2: bx, y2: ROWS * CELL, color, t0: now, life: 0.45 });
        } else if (blast.special === "burst") {
          vis.beams.push({ kind: "ring", x: bx, y: by, x2: 0, y2: 0, color, t0: now, life: 0.5 });
        } else if (blast.special === "nova") {
          for (const { index } of step.cleared) {
            vis.beams.push({
              kind: "bolt",
              x: bx,
              y: by,
              x2: (cellX(index) + 0.5) * CELL,
              y2: (cellY(index) + 0.5) * CELL,
              color: NEON.white,
              t0: now,
              life: 0.4,
            });
          }
        }
        if (!reduced) vis.shake.add(blast.special === "nova" ? 0.55 : 0.32);
      }
      for (const { index, gem } of step.created) {
        const s = makeSprite(gem, cellX(index), cellY(index), now);
        s.bornAt = now + dur * 0.55;
        vis.sprites.set(gem.id, s);
      }
      const n = Math.max(1, step.cleared.length);
      const fx = (sx / n + 0.5) * CELL;
      const fy = (sy / n + 0.5) * CELL;
      vis.floaters.add(fx, fy, `+${step.points}`, NEON.white, step.combo > 1 ? 46 : 38);
      if (step.combo > 1) {
        vis.floaters.add((COLS * CELL) / 2, (ROWS * CELL) / 2 - 30, `Combo ×${step.combo}`, NEON.amber, 64, 1.1);
        if (!reduced && step.combo >= 3) vis.shake.add(0.2);
      }
      hooks.onClear(step.points, step.combo, step.blasts.length);
      break;
    }
    case "fall": {
      for (const m of step.moves) {
        const s = vis.sprites.get(m.id);
        if (!s) continue;
        const d = cellY(m.to) - s.y;
        const t = Math.sqrt((2 * Math.max(d, 0.01)) / GRAVITY) * k;
        tween(s, cellX(m.to), cellY(m.to), now, t, "in");
        s.landedAt = now + t;
        dur = Math.max(dur, t);
      }
      for (const sp of step.spawns) {
        const s = makeSprite(sp.gem, cellX(sp.to), sp.fromRow, now);
        const d = cellY(sp.to) - sp.fromRow;
        const t = Math.sqrt((2 * d) / GRAVITY) * k;
        tween(s, cellX(sp.to), cellY(sp.to), now, t, "in");
        s.landedAt = now + t;
        vis.sprites.set(sp.gem.id, s);
        dur = Math.max(dur, t);
      }
      break;
    }
    case "shuffle": {
      dur = 0.5 * k;
      step.board.forEach((gem, i) => {
        const s = vis.sprites.get(gem.id);
        if (s) tween(s, cellX(i), cellY(i), now, dur, "inout");
      });
      hooks.onShuffle();
      vis.floaters.add((COLS * CELL) / 2, (ROWS * CELL) / 2, "No moves: shuffling", NEON.cyan, 44, 1.2);
      break;
    }
  }
  vis.step = step;
  vis.stepEnd = now + dur;
}

function finishStep(vis: CascadeVisual) {
  const step = vis.step;
  vis.step = null;
  if (step?.kind === "clear") {
    for (const { gem } of step.cleared) {
      const s = vis.sprites.get(gem.id);
      if (s?.dying) vis.sprites.delete(gem.id);
    }
  }
}

/** Snap the sprites to the real board (run whenever playback is idle). */
export function reconcile(vis: CascadeVisual, board: Gem[]) {
  const live = new Set<number>();
  board.forEach((gem, i) => {
    live.add(gem.id);
    const s = vis.sprites.get(gem.id);
    if (!s) {
      vis.sprites.set(gem.id, makeSprite(gem, cellX(i), cellY(i), vis.clock));
    } else if (s.toX !== cellX(i) || s.toY !== cellY(i) || s.dying) {
      s.dying = false;
      tween(s, cellX(i), cellY(i), vis.clock, 0.12, "out");
    }
    if (s) s.gem = gem;
  });
  for (const id of [...vis.sprites.keys()]) if (!live.has(id)) vis.sprites.delete(id);
}

const easeIn = (t: number) => t * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function updateCascade(vis: CascadeVisual, dt: number, reduced: boolean, hooks: StepHooks) {
  vis.clock += dt;
  const now = vis.clock;

  if (vis.step && now >= vis.stepEnd) finishStep(vis);
  while (!vis.step && vis.queue.length > 0) {
    startStep(vis, vis.queue.shift()!, reduced, hooks);
    if (vis.stepEnd <= now) finishStep(vis);
  }

  for (const s of vis.sprites.values()) {
    const t = clamp01((now - s.t0) / s.dur);
    let e = s.ease === "in" ? easeIn(t) : s.ease === "inout" ? easeInOut(t) : easeOutCubic(t);
    if (s.pingpong) e = t < 0.5 ? easeInOut(t * 2) : easeInOut((1 - t) * 2);
    s.x = s.fromX + (s.toX - s.fromX) * e;
    s.y = s.fromY + (s.toY - s.fromY) * e;
    if (s.pingpong && t >= 1) {
      // An invalid swap returns home: the destination is where it started.
      s.x = s.toX = s.fromX;
      s.y = s.toY = s.fromY;
      s.pingpong = false;
    }
  }

  vis.particles.update(dt);
  vis.floaters.update(dt);
  vis.shake.update(dt, 14);
  vis.beams = vis.beams.filter((b) => now - b.t0 < b.life);
}

// --- drawing ---------------------------------------------------------------------

/** Gem art for one colour/special, rendered once per cell size. */
function gemSprite(vis: CascadeVisual, gem: Gem, px: number): HTMLCanvasElement {
  if (vis.cachePx !== px) {
    vis.cache.clear();
    vis.cachePx = px;
  }
  const key = `${gem.color}:${gem.special}`;
  let c = vis.cache.get(key);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;
  const r = px * 0.39;
  g.translate(px / 2, px / 2);

  if (gem.special === "nova") {
    for (let k = 0; k < 6; k++) {
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, r, (k / 6) * Math.PI * 2, ((k + 1) / 6) * Math.PI * 2);
      g.closePath();
      g.fillStyle = GEM_COLORS[k].base;
      g.fill();
    }
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.lineWidth = px * 0.035;
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.stroke();
    const core = g.createRadialGradient(0, 0, 0, 0, 0, r * 0.6);
    core.addColorStop(0, "rgba(255,255,255,1)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = core;
    g.beginPath();
    g.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    g.fill();
    vis.cache.set(key, c);
    return c;
  }

  const pal = GEM_COLORS[gem.color];
  const body = new Path2D(gemPath(gem.color, r));
  const grad = g.createLinearGradient(-r, -r, r, r);
  grad.addColorStop(0, pal.light);
  grad.addColorStop(0.38, pal.base);
  grad.addColorStop(1, pal.dark);
  g.fillStyle = grad;
  g.fill(body);
  g.lineWidth = px * 0.03;
  g.strokeStyle = pal.dark;
  g.stroke(body);
  // Inner facet and a specular glint.
  g.save();
  g.translate(-r * 0.08, -r * 0.12);
  g.globalAlpha = 0.45;
  g.fillStyle = pal.light;
  g.fill(new Path2D(gemPath(gem.color, r * 0.5)));
  g.restore();
  g.beginPath();
  g.ellipse(-r * 0.32, -r * 0.42, r * 0.17, r * 0.09, -0.6, 0, Math.PI * 2);
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.fill();

  if (gem.special === "row" || gem.special === "col") {
    g.save();
    g.clip(body);
    g.fillStyle = "rgba(255,255,255,0.85)";
    for (const off of [-0.32, 0, 0.32]) {
      if (gem.special === "row") g.fillRect(-r, off * r - px * 0.025, r * 2, px * 0.05);
      else g.fillRect(off * r - px * 0.025, -r, px * 0.05, r * 2);
    }
    g.restore();
  } else if (gem.special === "burst") {
    g.beginPath();
    g.arc(0, 0, r * 1.12, 0, Math.PI * 2);
    g.lineWidth = px * 0.045;
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.stroke();
    g.beginPath();
    g.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    g.fillStyle = "#ffffff";
    g.fill();
  }
  vis.cache.set(key, c);
  return c;
}

export function drawCascade(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  vis: CascadeVisual,
  reduced: boolean,
) {
  const scale = canvas.width / (COLS * CELL);
  const now = vis.clock;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, reduced ? 0 : vis.shake.x * scale, reduced ? 0 : vis.shake.y * scale);

  // Board and cells.
  roundRectPath(ctx, 0, 0, COLS * CELL, ROWS * CELL, 18);
  ctx.fillStyle = "#0e1428";
  ctx.fill();
  for (let i = 0; i < COLS * ROWS; i++) {
    const x = colOf(i) * CELL;
    const y = rowOf(i) * CELL;
    roundRectPath(ctx, x + 4, y + 4, CELL - 8, CELL - 8, 12);
    ctx.fillStyle = (colOf(i) + rowOf(i)) % 2 ? "#141b35" : "#111830";
    ctx.fill();
  }

  // Hint: two cells breathing gently.
  if (vis.hint && !isBusy(vis)) {
    const a = reduced ? 0.5 : 0.3 + 0.25 * (0.5 + 0.5 * Math.sin(now * 4));
    for (const i of vis.hint) {
      roundRectPath(ctx, colOf(i) * CELL + 4, rowOf(i) * CELL + 4, CELL - 8, CELL - 8, 12);
      ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.35})`;
      ctx.fill();
    }
  }

  // Selection.
  if (vis.selected >= 0) {
    const x = colOf(vis.selected) * CELL;
    const y = rowOf(vis.selected) * CELL;
    roundRectPath(ctx, x + 4, y + 4, CELL - 8, CELL - 8, 12);
    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.stroke();
  }

  // Gems: clip to the board so spawns slide in from the top edge.
  const px = Math.max(16, Math.round(CELL * scale));
  ctx.save();
  roundRectPath(ctx, 0, 0, COLS * CELL, ROWS * CELL, 18);
  ctx.clip();
  for (const s of vis.sprites.values()) {
    let size = 1;
    let alpha = 1;
    if (s.dying) {
      const t = clamp01((now - s.dieAt) / 0.22);
      size = 1 + 0.35 * easeOutCubic(t);
      alpha = 1 - t;
      if (alpha <= 0) continue;
    } else if (s.bornAt >= 0) {
      if (now < s.bornAt) continue;
      size = easeOutCubic(clamp01((now - s.bornAt) / 0.18));
    }
    let sx = 1;
    let sy = 1;
    if (!reduced && s.landedAt >= 0 && now >= s.landedAt) {
      const t = (now - s.landedAt) / 0.12;
      if (t < 1) {
        const q = Math.sin(t * Math.PI) * 0.08;
        sx = 1 + q;
        sy = 1 - q;
      }
    }
    if (vis.selected >= 0 && !s.dying && s.toX === colOf(vis.selected) && s.toY === rowOf(vis.selected)) {
      size *= reduced ? 1.06 : 1.06 + 0.03 * Math.sin(now * 6);
    }
    const cx = (s.x + 0.5) * CELL;
    const cy = (s.y + 0.5) * CELL;
    if (s.gem.special !== "none") {
      ctx.globalCompositeOperation = "lighter";
      const glow = s.gem.special === "nova" ? NEON.white : GEM_COLORS[s.gem.color].base;
      drawGlow(ctx, glow, cx, cy, CELL * (reduced ? 0.7 : 0.7 + 0.08 * Math.sin(now * 3 + s.id)), 0.55 * alpha);
      ctx.globalCompositeOperation = "source-over";
    }
    if (s.dying) {
      ctx.globalCompositeOperation = "lighter";
      drawGlow(ctx, colorOf(s.gem), cx, cy, CELL * 0.9 * size, alpha * 0.8);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.translate(cx, cy);
    if (s.gem.special === "nova" && !reduced) ctx.rotate(now * 1.2);
    ctx.scale(size * sx, size * sy);
    ctx.drawImage(gemSprite(vis, s.gem, px), -CELL / 2, -CELL / 2, CELL, CELL);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // Blast effects.
  ctx.globalCompositeOperation = "lighter";
  for (const b of vis.beams) {
    const t = clamp01((now - b.t0) / b.life);
    const a = 1 - t;
    if (b.kind === "row" || b.kind === "col") {
      const w = CELL * (0.9 - 0.6 * t);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = a * 0.35;
      if (b.kind === "row") ctx.fillRect(0, b.y - w / 2, COLS * CELL, w);
      else ctx.fillRect(b.x - w / 2, 0, w, ROWS * CELL);
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = "#ffffff";
      if (b.kind === "row") ctx.fillRect(0, b.y - w * 0.12, COLS * CELL, w * 0.24);
      else ctx.fillRect(b.x - w * 0.12, 0, w * 0.24, ROWS * CELL);
    } else if (b.kind === "ring") {
      ctx.globalAlpha = a;
      ctx.lineWidth = 14 * a + 2;
      ctx.strokeStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, CELL * (0.4 + 1.6 * easeOutCubic(t)), 0, Math.PI * 2);
      ctx.stroke();
      drawGlow(ctx, b.color, b.x, b.y, CELL * 1.8, a * 0.6);
    } else {
      ctx.globalAlpha = a;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      const mx = (b.x + b.x2) / 2 + Math.sin(b.t0 * 97 + b.x2) * 30;
      const my = (b.y + b.y2) / 2 + Math.cos(b.t0 * 89 + b.y2) * 30;
      ctx.quadraticCurveTo(mx, my, b.x2, b.y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = "source-over";

  vis.particles.draw(ctx);
  vis.floaters.draw(ctx, 70);

  // Hover and keyboard cursor (drawn last, above the gems).
  const outline = (i: number, alpha: number, width: number) => {
    roundRectPath(ctx, colOf(i) * CELL + 3, rowOf(i) * CELL + 3, CELL - 6, CELL - 6, 13);
    ctx.lineWidth = width;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.stroke();
  };
  if (vis.hover >= 0 && vis.hover !== vis.selected) outline(vis.hover, 0.25, 3);
  if (vis.showCursor) outline(vis.cursor, reduced ? 0.9 : 0.6 + 0.3 * (0.5 + 0.5 * Math.sin(now * 5)), 5);
}
