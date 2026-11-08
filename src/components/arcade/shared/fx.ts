"use client";

// Canvas helpers shared by the arcade games: backing-store sizing, the stage
// palette, cached glow sprites, particles, floating score text and screen
// shake. Everything draws in each game's own logical units; the caller sets
// the transform.

/** Stage background behind every canvas. */
export const STAGE_BG = "#0a0e1a";

export const NEON = {
  cyan: "#22d3ee",
  sky: "#38bdf8",
  blue: "#60a5fa",
  violet: "#a78bfa",
  fuchsia: "#e879f9",
  pink: "#f472b6",
  rose: "#fb7185",
  orange: "#fb923c",
  amber: "#fbbf24",
  lime: "#a3e635",
  emerald: "#34d399",
  white: "#f8fafc",
} as const;

export const hsl = (h: number, s: number, l: number, a = 1) =>
  `hsla(${h.toFixed(1)}, ${s}%, ${l}%, ${a})`;

/**
 * Size the canvas backing store for its CSS box at the device pixel ratio
 * (capped at 2). Only touches width/height when they change, because writing
 * them clears the canvas and resets its state.
 */
export function fitCanvas(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number): boolean {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(cssWidth * dpr));
  const h = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width === w && canvas.height === h) return false;
  canvas.width = w;
  canvas.height = h;
  return true;
}

let fontFamily: string | null = null;
/** The page's text face (next/font registers it under a generated name). */
export function canvasFont(weight: number, size: number): string {
  if (fontFamily === null) {
    fontFamily = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  }
  return `${weight} ${size}px ${fontFamily}`;
}

const glowCache = new Map<string, HTMLCanvasElement>();
/** A soft radial glow in `color`, 128px, drawn scaled. Cached per colour. */
export function glowSprite(color: string): HTMLCanvasElement {
  let sprite = glowCache.get(color);
  if (sprite) return sprite;
  sprite = document.createElement("canvas");
  sprite.width = sprite.height = 128;
  const g = sprite.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, color);
  grad.addColorStop(0.25, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.globalAlpha = 1;
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  glowCache.set(color, sprite);
  return sprite;
}

/** Draw a glow of `radius` centred at x, y (additive when the caller sets it). */
export function drawGlow(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, radius: number, alpha = 1) {
  if (alpha <= 0 || radius <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(glowSprite(color), x - radius, y - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
}

// --- particles ------------------------------------------------------------------

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  gravity: number;
  drag: number;
  kind: "spark" | "shard" | "ring";
  rot: number;
  vr: number;
}

export class Particles {
  list: Particle[] = [];
  constructor(private cap = 600) {}

  add(p: Partial<Particle> & Pick<Particle, "x" | "y" | "color">) {
    if (this.list.length >= this.cap) this.list.shift();
    this.list.push({
      vx: 0,
      vy: 0,
      life: 0.6,
      max: p.life ?? 0.6,
      size: 6,
      gravity: 0,
      drag: 2,
      kind: "spark",
      rot: 0,
      vr: 0,
      ...p,
    });
  }

  /** Radial burst of `count` particles. */
  burst(
    x: number,
    y: number,
    color: string,
    count: number,
    { speed = 260, life = 0.6, size = 6, gravity = 0, kind = "spark" as Particle["kind"], spread = 1 } = {},
  ) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      const v = speed * (0.45 + Math.random() * 0.55 * spread);
      this.add({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: life * (0.7 + Math.random() * 0.5),
        size: size * (0.6 + Math.random() * 0.7),
        color,
        gravity,
        kind,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 14,
      });
    }
  }

  ring(x: number, y: number, color: string, size: number, life = 0.45) {
    this.add({ x, y, color, size, life, kind: "ring", drag: 0 });
  }

  update(dt: number) {
    const next: Particle[] = [];
    for (const p of this.list) {
      p.life -= dt;
      if (p.life <= 0) continue;
      const k = Math.max(0, 1 - p.drag * dt);
      p.vx *= k;
      p.vy = p.vy * k + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      next.push(p);
    }
    this.list = next;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.list.length === 0) return;
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.list) {
      const t = p.life / p.max; // 1 -> 0
      if (p.kind === "ring") {
        const r = p.size * (1.6 - t * 0.6) * (1 + (1 - t) * 1.2);
        ctx.globalAlpha = t * 0.9;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, p.size * 0.12 * t);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === "shard") {
        ctx.globalAlpha = Math.min(1, t * 1.4);
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const s = p.size * (0.5 + t * 0.5);
        ctx.fillRect(-s / 2, -s / 4, s, s / 2);
        ctx.restore();
      } else {
        drawGlow(ctx, p.color, p.x, p.y, p.size * (0.6 + t), t);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = prev;
  }

  clear() {
    this.list = [];
  }
}

// --- floating text ----------------------------------------------------------------

interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  max: number;
}

export class Floaters {
  list: Floater[] = [];

  add(x: number, y: number, text: string, color: string, size: number, life = 0.9) {
    if (this.list.length > 24) this.list.shift();
    this.list.push({ x, y, text, color, size, life, max: life });
  }

  update(dt: number) {
    this.list = this.list.filter((f) => (f.life -= dt) > 0);
  }

  draw(ctx: CanvasRenderingContext2D, rise: number) {
    if (this.list.length === 0) return;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const f of this.list) {
      const t = 1 - f.life / f.max; // 0 -> 1
      const y = f.y - rise * Math.min(1, t * 1.6);
      ctx.globalAlpha = t < 0.75 ? 1 : (1 - t) / 0.25;
      ctx.font = canvasFont(700, f.size);
      ctx.lineWidth = f.size * 0.18;
      ctx.strokeStyle = "rgba(5, 8, 18, 0.85)";
      ctx.strokeText(f.text, f.x, y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, y);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.list = [];
  }
}

// --- screen shake -------------------------------------------------------------------

/** Trauma-based shake: offset grows with trauma², trauma decays linearly. */
export class Shake {
  trauma = 0;
  x = 0;
  y = 0;

  add(amount: number) {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  update(dt: number, maxOffset: number) {
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    const k = this.trauma * this.trauma * maxOffset;
    this.x = (Math.random() * 2 - 1) * k;
    this.y = (Math.random() * 2 - 1) * k;
  }

  reset() {
    this.trauma = this.x = this.y = 0;
  }
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Rounded-rect path (no fill/stroke). */
export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
