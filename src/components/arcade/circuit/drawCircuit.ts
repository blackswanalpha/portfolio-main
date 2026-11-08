"use client";

import {
  SIDES,
  computePower,
  linkCount,
  type CircuitPuzzle,
  type CircuitState,
  type PowerMap,
} from "@/lib/arcade/circuit";
import { NEON, Particles, clamp01, drawGlow, hsl, roundRectPath } from "../shared/fx";

// Canvas renderer for Circuit. Logical units: one tile = 100. The renderer
// only reads the game state; per-tile angles ease toward the logical rotation,
// so rapid taps simply queue more turn on the same tile.

const CELL = 100;
const HALF = CELL / 2;
const QUARTER = Math.PI / 2;

export interface CircuitVisual {
  angle: Float32Array;
  target: Float32Array;
  particles: Particles;
  hover: number;
  cursor: number;
  showCursor: boolean;
  /** Seconds since the level was solved, or -1. */
  winClock: number;
  /** Pending lamp bursts during the win wave: [tile, seconds until it fires]. */
  pending: Array<[number, number]>;
  lamps: number[];
  power: PowerMap | null;
  powerOf: number[] | null;
  clock: number;
}

export function createCircuitVisual(puzzle: CircuitPuzzle, state: CircuitState): CircuitVisual {
  const n = puzzle.cols * puzzle.rows;
  const angle = new Float32Array(n);
  for (let i = 0; i < n; i++) angle[i] = state.rot[i] * QUARTER;
  const lamps: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i !== puzzle.source && linkCount(puzzle.solution[i]) === 1) lamps.push(i);
  }
  return {
    angle,
    target: Float32Array.from(angle),
    particles: new Particles(500),
    hover: -1,
    cursor: puzzle.source,
    showCursor: false,
    winClock: -1,
    pending: [],
    lamps,
    power: null,
    powerOf: null,
    clock: 0,
  };
}

const tileCenter = (puzzle: CircuitPuzzle, i: number) => ({
  x: ((i % puzzle.cols) + 0.5) * CELL,
  y: (Math.floor(i / puzzle.cols) + 0.5) * CELL,
});

/** Hue along the powered network: cyan at the core through violet to pink. */
const hueFor = (dist: number, maxDist: number) => 188 + 132 * (maxDist > 0 ? dist / maxDist : 0);

export function lampBurst(vis: CircuitVisual, puzzle: CircuitPuzzle, i: number, hue: number) {
  const { x, y } = tileCenter(puzzle, i);
  vis.particles.burst(x, y, hsl(hue, 100, 66), 14, { speed: 260, life: 0.65, size: 16 });
  vis.particles.ring(x, y, hsl(hue, 100, 72), 26, 0.5);
}

export function startWinWave(vis: CircuitVisual, puzzle: CircuitPuzzle, power: PowerMap) {
  vis.winClock = 0;
  vis.pending = vis.lamps.map((i) => [i, 0.08 + power.dist[i] * 0.055] as [number, number]);
  const { x, y } = tileCenter(puzzle, puzzle.source);
  vis.particles.ring(x, y, NEON.cyan, 40, 0.8);
}

export function drawCircuit(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  puzzle: CircuitPuzzle,
  state: CircuitState,
  vis: CircuitVisual,
  dt: number,
  reduced: boolean,
) {
  const { cols, rows } = puzzle;
  const n = cols * rows;
  vis.clock += dt;
  const t = vis.clock;

  // Power is recomputed only when the rotations change.
  if (vis.powerOf !== state.rot || !vis.power) {
    vis.power = computePower(puzzle, state.rot);
    vis.powerOf = state.rot;
  }
  const power = vis.power;

  // Ease every tile toward its target angle.
  const k = reduced ? 1 : 1 - Math.exp(-dt * 24);
  for (let i = 0; i < n; i++) {
    const d = vis.target[i] - vis.angle[i];
    vis.angle[i] = Math.abs(d) < 0.002 ? vis.target[i] : vis.angle[i] + d * k;
  }

  if (vis.winClock >= 0) {
    vis.winClock += dt;
    vis.pending = vis.pending.filter(([i, at]) => {
      if (vis.winClock < at) return true;
      if (!reduced) lampBurst(vis, puzzle, i, hueFor(power.dist[i], power.maxDist));
      return false;
    });
  }
  vis.particles.update(dt);

  const scale = canvas.width / (cols * CELL);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  // Ambient light, centred on the board and fading out before its edges so
  // the canvas bounds never show as a hard line.
  const core = tileCenter(puzzle, puzzle.source);
  ctx.globalCompositeOperation = "lighter";
  drawGlow(ctx, "rgba(34, 211, 238, 0.55)", (cols * CELL) / 2, (rows * CELL) / 2, (Math.min(cols, rows) * CELL) / 2, 0.2);
  ctx.globalCompositeOperation = "source-over";

  // Sockets.
  for (let i = 0; i < n; i++) {
    const x = (i % cols) * CELL;
    const y = Math.floor(i / cols) * CELL;
    const on = power.powered[i] === 1;
    const hue = hueFor(power.dist[i], power.maxDist);
    roundRectPath(ctx, x + 5, y + 5, CELL - 10, CELL - 10, 14);
    ctx.fillStyle = on ? hsl(hue, 70, 11) : "#0f1529";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = on ? hsl(hue, 90, 60, 0.22) : "rgba(148, 163, 255, 0.07)";
    ctx.stroke();
  }

  // Win wave: tiles flash outward from the core.
  if (vis.winClock >= 0 && !reduced) {
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < n; i++) {
      const local = vis.winClock - power.dist[i] * 0.055;
      if (local < 0 || local > 0.45) continue;
      const a = 0.32 * (1 - local / 0.45);
      roundRectPath(ctx, (i % cols) * CELL + 5, Math.floor(i / cols) * CELL + 5, CELL - 10, CELL - 10, 14);
      ctx.fillStyle = hsl(hueFor(power.dist[i], power.maxDist), 100, 70, a);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // Links, drawn in each tile's own frame and rotated by its eased angle.
  ctx.lineCap = "butt";
  for (let i = 0; i < n; i++) {
    const mask = puzzle.solution[i];
    const { x, y } = tileCenter(puzzle, i);
    const on = power.powered[i] === 1;
    const hue = hueFor(power.dist[i], power.maxDist);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(vis.angle[i]);

    const strokeLinks = (width: number, style: string, cap: CanvasLineCap = "butt") => {
      ctx.lineWidth = width;
      ctx.strokeStyle = style;
      ctx.lineCap = cap;
      ctx.beginPath();
      for (let s = 0; s < 4; s++) {
        if (!(mask & SIDES[s].bit)) continue;
        ctx.moveTo(0, 0);
        ctx.lineTo(SIDES[s].dx * HALF, SIDES[s].dy * HALF);
      }
      ctx.stroke();
    };

    if (on) {
      ctx.globalCompositeOperation = "lighter";
      strokeLinks(40, hsl(hue, 100, 58, 0.12), "round");
      strokeLinks(26, hsl(hue, 100, 60, 0.18), "round");
      ctx.globalCompositeOperation = "source-over";
      strokeLinks(17, hsl(hue, 95, 58));
      strokeLinks(6, hsl(hue, 100, 88, 0.95));
    } else {
      strokeLinks(20, "#1b2140");
      strokeLinks(10, "#333d63");
    }

    // Moving energy, flowing away from the core.
    if (on && !reduced && i !== puzzle.source) {
      const entry = (power.from[i] - state.rot[i] + 8) % 4;
      ctx.globalCompositeOperation = "lighter";
      ctx.setLineDash([12, 20]);
      ctx.lineDashOffset = -((t * 70) % 32);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      for (let s = 0; s < 4; s++) {
        if (!(mask & SIDES[s].bit)) continue;
        const ex = SIDES[s].dx * HALF;
        const ey = SIDES[s].dy * HALF;
        if (s === entry) {
          ctx.moveTo(ex, ey);
          ctx.lineTo(0, 0);
        } else {
          ctx.moveTo(0, 0);
          ctx.lineTo(ex, ey);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalCompositeOperation = "source-over";
    }

    // Junction node.
    if (linkCount(mask) > 1 && i !== puzzle.source) {
      ctx.beginPath();
      ctx.arc(0, 0, on ? 11 : 10, 0, Math.PI * 2);
      ctx.fillStyle = on ? hsl(hue, 100, 80) : "#333d63";
      ctx.fill();
    }
    ctx.restore();
  }

  // Lamps.
  for (const i of vis.lamps) {
    const { x, y } = tileCenter(puzzle, i);
    if (power.powered[i]) {
      const hue = hueFor(power.dist[i], power.maxDist);
      const pulse = reduced ? 0.6 : 0.55 + 0.15 * Math.sin(t * 3 + i);
      ctx.globalCompositeOperation = "lighter";
      drawGlow(ctx, hsl(hue, 100, 62), x, y, 78, pulse);
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fillStyle = hsl(hue, 100, 64);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 21, 0, Math.PI * 2);
      ctx.fillStyle = "#141a33";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#3b4570";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#2a3354";
      ctx.fill();
    }
  }

  // Power core.
  {
    const pulse = reduced ? 0.8 : 0.7 + 0.2 * Math.sin(t * 2.4);
    ctx.globalCompositeOperation = "lighter";
    drawGlow(ctx, NEON.cyan, core.x, core.y, 105, pulse);
    ctx.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.translate(core.x, core.y);
    ctx.rotate(reduced ? 0 : t * 0.5);
    ctx.beginPath();
    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * Math.PI * 2;
      if (s === 0) ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30);
      else ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30);
    }
    ctx.closePath();
    ctx.fillStyle = "#e6fcff";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = NEON.cyan;
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(core.x, core.y, 11, 0, Math.PI * 2);
    ctx.fillStyle = NEON.cyan;
    ctx.fill();
  }

  vis.particles.draw(ctx);

  // Hover and keyboard cursor.
  const outline = (i: number, alpha: number, width: number) => {
    roundRectPath(ctx, (i % cols) * CELL + 4, Math.floor(i / cols) * CELL + 4, CELL - 8, CELL - 8, 15);
    ctx.lineWidth = width;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.stroke();
  };
  if (vis.hover >= 0 && vis.winClock < 0) outline(vis.hover, 0.22, 3);
  if (vis.showCursor && vis.winClock < 0) {
    const a = reduced ? 0.9 : 0.65 + 0.3 * clamp01(0.5 + 0.5 * Math.sin(t * 5));
    outline(vis.cursor, a, 5);
  }
}
