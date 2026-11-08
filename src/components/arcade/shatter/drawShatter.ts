"use client";

import {
  BALL_R,
  PADDLE_H,
  PADDLE_Y,
  WORLD_H,
  WORLD_W,
  type PickupKind,
  type ShatterEvent,
  type ShatterWorld,
} from "@/lib/arcade/shatter";
import { Floaters, NEON, Particles, Shake, canvasFont, clamp01, drawGlow, roundRectPath } from "../shared/fx";

// Canvas renderer and effects for Shatter, in world units (480 x 600).

const ROW_COLORS = [NEON.rose, NEON.orange, NEON.amber, NEON.lime, NEON.emerald, NEON.cyan, NEON.sky, NEON.violet];

export const PICKUP_STYLE: Record<PickupKind, { color: string; label: string; name: string }> = {
  wide: { color: NEON.lime, label: "W", name: "Wide paddle" },
  multi: { color: NEON.fuchsia, label: "M", name: "Multi-ball" },
  slow: { color: NEON.sky, label: "S", name: "Slow ball" },
  life: { color: NEON.rose, label: "+", name: "Extra life" },
};

export interface ShatterFx {
  clock: number;
  particles: Particles;
  floaters: Floaters;
  shake: Shake;
  trails: Map<number, Array<{ x: number; y: number }>>;
  flash: Map<number, number>;
  banner: { text: string; sub: string; t0: number } | null;
  hurtAt: number;
  background: HTMLCanvasElement | null;
  backgroundPx: number;
}

export function createShatterFx(): ShatterFx {
  return {
    clock: 0,
    particles: new Particles(700),
    floaters: new Floaters(),
    shake: new Shake(),
    trails: new Map(),
    flash: new Map(),
    banner: null,
    hurtAt: -10,
    background: null,
    backgroundPx: 0,
  };
}

const brickColor = (row: number) => ROW_COLORS[row % ROW_COLORS.length];

/** Turn simulation events into particles, text and shake. */
export function applyEvents(fx: ShatterFx, w: ShatterWorld, events: ShatterEvent[], reduced: boolean) {
  const now = fx.clock;
  for (const e of events) {
    switch (e.type) {
      case "brick": {
        const color = brickColor(e.row);
        if (e.destroyed) {
          if (!reduced) {
            fx.particles.burst(e.x, e.y, color, 12, { speed: 240, life: 0.7, size: 7, kind: "shard", gravity: 700 });
            fx.particles.burst(e.x, e.y, color, 6, { speed: 160, life: 0.45, size: 16 });
            fx.shake.add(0.12);
          }
          fx.floaters.add(e.x, e.y, `+${e.points}`, e.combo >= 4 ? NEON.amber : NEON.white, e.combo >= 4 ? 20 : 16, 0.8);
        } else if (!reduced) {
          fx.particles.burst(e.x, e.y, color, 4, { speed: 120, life: 0.35, size: 5, kind: "shard", gravity: 500 });
        }
        break;
      }
      case "paddle":
        if (!reduced) fx.particles.ring(e.x, e.y, NEON.cyan, 14, 0.3);
        break;
      case "pickup": {
        const style = PICKUP_STYLE[e.kind];
        fx.floaters.add(e.x, PADDLE_Y - 30, style.name, style.color, 18, 1.1);
        if (!reduced) fx.particles.burst(w.paddleX, PADDLE_Y, style.color, 16, { speed: 260, life: 0.6, size: 12 });
        break;
      }
      case "lifeLost":
        fx.hurtAt = now;
        if (!reduced) fx.shake.add(0.6);
        fx.trails.clear();
        break;
      case "levelClear":
        fx.banner = { text: "Level clear", sub: `+${e.bonus.toLocaleString("en-US")} bonus`, t0: now };
        if (!reduced) {
          for (let i = 0; i < 5; i++) {
            fx.particles.burst(60 + i * 90, 220 + (i % 2) * 60, ROW_COLORS[i * 2 % ROW_COLORS.length], 18, {
              speed: 300,
              life: 0.9,
              size: 14,
            });
          }
        }
        fx.trails.clear();
        break;
      case "levelStart":
        if (e.level > 1) fx.banner = { text: `Level ${e.level}`, sub: "Get ready", t0: now };
        break;
      default:
        break;
    }
  }
}

export function updateFx(fx: ShatterFx, w: ShatterWorld, dt: number) {
  fx.clock += dt;
  fx.particles.update(dt);
  fx.floaters.update(dt);
  fx.shake.update(dt, 10);
  // Ball trails: the last few positions of every live ball.
  const live = new Set<number>();
  for (const b of w.balls) {
    live.add(b.id);
    let trail = fx.trails.get(b.id);
    if (!trail) {
      trail = [];
      fx.trails.set(b.id, trail);
    }
    trail.push({ x: b.x, y: b.y });
    if (trail.length > 12) trail.shift();
  }
  for (const id of [...fx.trails.keys()]) if (!live.has(id)) fx.trails.delete(id);
  if (fx.banner && fx.clock - fx.banner.t0 > 1.8) fx.banner = null;
}

function paintBackground(fx: ShatterFx, px: number, pxH: number) {
  if (fx.background && fx.backgroundPx === px) return fx.background;
  const c = document.createElement("canvas");
  c.width = px;
  c.height = pxH;
  const g = c.getContext("2d")!;
  const s = px / WORLD_W;
  g.scale(s, s);
  const grad = g.createLinearGradient(0, 0, 0, WORLD_H);
  grad.addColorStop(0, "#0d1330");
  grad.addColorStop(1, "#060913");
  g.fillStyle = grad;
  g.fillRect(0, 0, WORLD_W, WORLD_H);
  g.strokeStyle = "rgba(120, 140, 255, 0.05)";
  g.lineWidth = 1;
  for (let x = 0; x <= WORLD_W; x += 40) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, WORLD_H);
    g.stroke();
  }
  for (let y = 0; y <= WORLD_H; y += 40) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(WORLD_W, y);
    g.stroke();
  }
  const glow = g.createRadialGradient(WORLD_W / 2, WORLD_H * 0.3, 0, WORLD_W / 2, WORLD_H * 0.3, WORLD_W * 0.8);
  glow.addColorStop(0, "rgba(167, 139, 250, 0.16)");
  glow.addColorStop(1, "rgba(167, 139, 250, 0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, WORLD_W, WORLD_H);
  fx.background = c;
  fx.backgroundPx = px;
  return c;
}

export function drawShatter(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  w: ShatterWorld,
  fx: ShatterFx,
  reduced: boolean,
  prompt: string | null,
) {
  const scale = canvas.width / WORLD_W;
  const now = fx.clock;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(paintBackground(fx, canvas.width, canvas.height), 0, 0);
  const sx = reduced ? 0 : fx.shake.x;
  const sy = reduced ? 0 : fx.shake.y;
  ctx.setTransform(scale, 0, 0, scale, sx * scale, sy * scale);

  // Bricks.
  for (const b of w.bricks) {
    if (!b.alive) continue;
    const color = brickColor(b.row);
    ctx.globalCompositeOperation = "lighter";
    drawGlow(ctx, color, b.x + b.w / 2, b.y + b.h / 2, b.w * 0.75, 0.16);
    ctx.globalCompositeOperation = "source-over";
    roundRectPath(ctx, b.x, b.y, b.w, b.h, 4);
    ctx.fillStyle = color;
    ctx.globalAlpha = b.maxHp === 1 ? 0.95 : 0.55 + 0.45 * (b.hp / b.maxHp);
    ctx.fill();
    ctx.globalAlpha = 1;
    // top light, bottom shade
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(b.x + 3, b.y + 2, b.w - 6, 3);
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.fillRect(b.x + 2, b.y + b.h - 4, b.w - 4, 3);
    if (b.maxHp > 1) {
      // tougher bricks: an inner frame, plus cracks once hit
      roundRectPath(ctx, b.x + 3, b.y + 3, b.w - 6, b.h - 6, 3);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = b.maxHp === 3 ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.45)";
      ctx.stroke();
      if (b.hp < b.maxHp) {
        ctx.strokeStyle = "rgba(10, 12, 24, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(b.x + b.w * 0.3, b.y + 2);
        ctx.lineTo(b.x + b.w * 0.42, b.y + b.h * 0.55);
        ctx.lineTo(b.x + b.w * 0.36, b.y + b.h - 2);
        if (b.hp < b.maxHp - 1) {
          ctx.moveTo(b.x + b.w * 0.7, b.y + 2);
          ctx.lineTo(b.x + b.w * 0.62, b.y + b.h * 0.5);
          ctx.lineTo(b.x + b.w * 0.74, b.y + b.h - 2);
        }
        ctx.stroke();
      }
    }
  }

  // Pickups.
  for (const p of w.pickups) {
    const style = PICKUP_STYLE[p.kind];
    ctx.globalCompositeOperation = "lighter";
    drawGlow(ctx, style.color, p.x, p.y, 30, 0.5);
    ctx.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.translate(p.x, p.y);
    if (!reduced) ctx.rotate(Math.sin(now * 5 + p.id) * 0.15);
    roundRectPath(ctx, -16, -9, 32, 18, 9);
    ctx.fillStyle = style.color;
    ctx.fill();
    ctx.fillStyle = "#0a0e1a";
    ctx.font = canvasFont(700, 13);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(style.label, 0, 1);
    ctx.restore();
  }

  // Paddle.
  {
    const wide = w.time < w.wideUntil;
    const color = wide ? NEON.lime : NEON.cyan;
    const x = w.paddleX - w.paddleW / 2;
    ctx.globalCompositeOperation = "lighter";
    drawGlow(ctx, color, w.paddleX, PADDLE_Y + PADDLE_H / 2, w.paddleW * 0.75, 0.45);
    ctx.globalCompositeOperation = "source-over";
    roundRectPath(ctx, x, PADDLE_Y, w.paddleW, PADDLE_H, PADDLE_H / 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillRect(x + 8, PADDLE_Y + 2, w.paddleW - 16, 2.5);
  }

  // Ball trails, then balls.
  ctx.globalCompositeOperation = "lighter";
  const slow = w.time < w.slowUntil;
  const ballGlow = slow ? NEON.sky : "#e0f2fe";
  if (!reduced) {
    for (const trail of fx.trails.values()) {
      trail.forEach((pt, i) => {
        const t = (i + 1) / trail.length;
        drawGlow(ctx, ballGlow, pt.x, pt.y, BALL_R * (0.6 + 1.6 * t), t * 0.22);
      });
    }
  }
  for (const b of w.balls) drawGlow(ctx, ballGlow, b.x, b.y, BALL_R * 4, 0.55);
  ctx.globalCompositeOperation = "source-over";
  for (const b of w.balls) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  fx.particles.draw(ctx);
  fx.floaters.draw(ctx, 36);

  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  // Life lost: a brief red wash.
  const hurt = clamp01(1 - (now - fx.hurtAt) / 0.45);
  if (hurt > 0) {
    ctx.fillStyle = `rgba(251, 113, 133, ${0.22 * hurt})`;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (fx.banner) {
    const t = (now - fx.banner.t0) / 1.8;
    const a = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;
    ctx.globalAlpha = clamp01(a);
    ctx.font = canvasFont(700, 40);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(fx.banner.text, WORLD_W / 2, WORLD_H * 0.52);
    ctx.font = canvasFont(500, 17);
    ctx.fillStyle = NEON.amber;
    ctx.fillText(fx.banner.sub, WORLD_W / 2, WORLD_H * 0.52 + 36);
    ctx.globalAlpha = 1;
  }
  if (prompt) {
    ctx.globalAlpha = reduced ? 0.9 : 0.6 + 0.3 * (0.5 + 0.5 * Math.sin(now * 3.5));
    ctx.font = canvasFont(500, 16);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(prompt, WORLD_W / 2, PADDLE_Y - 64);
    ctx.globalAlpha = 1;
  }
}
