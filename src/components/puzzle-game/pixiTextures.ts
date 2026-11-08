"use client";

import type { Renderer, Texture } from "pixi.js";

/**
 * Vector-drawn tile art for the Sokoban board, rasterized to textures at the
 * exact cell size (× device pixel ratio) so tiles stay crisp from 24px up to
 * 56px cells. No binary assets — everything is Pixi Graphics primitives,
 * regenerated whenever the cell size changes. The caller owns the returned
 * textures and must call `destroy()` (which also frees the GPU render targets)
 * before the renderer itself is destroyed.
 */

type PixiModule = typeof import("pixi.js");

export interface BoardTextures {
  floorA: Texture;
  floorB: Texture;
  wall: Texture;
  goal: Texture;
  crate: Texture;
  crateOnGoal: Texture;
  player: Texture;
  spark: Texture;
  destroy(): void;
}

const PALETTE = {
  floorA: 0xf5f1e8,
  floorB: 0xede7d9,
  floorEdge: 0x000000,
  wallBase: 0xc9a36a,
  wallLight: 0xdebd85,
  wallDark: 0xa2814a,
  wallMortar: 0x8a6c3c,
  goal: 0x2e6eb8, // primary.500
  crateFrame: 0x8a5230,
  crateFrameEdge: 0x5c3318,
  cratePlank: 0xa86a3d,
  crateSeam: 0x6b3d1e,
  crateNail: 0x3f2412,
  goalFrame: 0x2f8f46,
  goalFrameEdge: 0x1e6b31,
  goalPlank: 0x53a860,
  goalSeam: 0x2e7a3d,
  robotBody: 0x2e6eb8, // primary.500
  robotHead: 0x5a97db, // primary.400
  robotEdge: 0x1c467a, // primary.700
  antennaTip: 0x22c55e,
} as const;

export function makeTextures(
  pixi: PixiModule,
  renderer: Renderer,
  cell: number,
): BoardTextures {
  const { Graphics, Rectangle } = pixi;
  const c = cell;
  const frame = new Rectangle(0, 0, c, c);

  const generate = (draw: (g: InstanceType<typeof Graphics>) => void): Texture => {
    const g = new Graphics();
    draw(g);
    const texture = renderer.generateTexture({
      target: g,
      resolution: renderer.resolution,
      frame,
    });
    g.destroy();
    return texture;
  };

  const drawFloor = (g: InstanceType<typeof Graphics>, base: number) => {
    g.rect(0, 0, c, c).fill(base);
    // faint inset edge so the checker reads as tiles
    g.rect(0.5, 0.5, c - 1, c - 1).stroke({
      width: 1,
      color: PALETTE.floorEdge,
      alpha: 0.05,
    });
    // fixed speckles for a paper-grain feel
    g.circle(c * 0.28, c * 0.34, c * 0.015).fill({ color: PALETTE.floorEdge, alpha: 0.06 });
    g.circle(c * 0.72, c * 0.62, c * 0.015).fill({ color: PALETTE.floorEdge, alpha: 0.06 });
    g.circle(c * 0.5, c * 0.82, c * 0.012).fill({ color: PALETTE.floorEdge, alpha: 0.05 });
  };

  const floorA = generate((g) => drawFloor(g, PALETTE.floorA));
  const floorB = generate((g) => drawFloor(g, PALETTE.floorB));

  const wall = generate((g) => {
    const m = Math.max(1, c * 0.04); // mortar width
    g.rect(0, 0, c, c).fill(PALETTE.wallBase);
    // bevel: light top/left, dark bottom/right
    g.rect(0, 0, c, c * 0.12).fill({ color: PALETTE.wallLight, alpha: 0.8 });
    g.rect(0, 0, c * 0.08, c).fill({ color: PALETTE.wallLight, alpha: 0.4 });
    g.rect(0, c * 0.88, c, c * 0.12).fill({ color: PALETTE.wallDark, alpha: 0.7 });
    g.rect(c * 0.92, 0, c * 0.08, c).fill({ color: PALETTE.wallDark, alpha: 0.4 });
    // brick mortar: one horizontal course, staggered vertical seams
    g.rect(0, c * 0.5 - m / 2, c, m).fill({ color: PALETTE.wallMortar, alpha: 0.55 });
    g.rect(c * 0.55 - m / 2, 0, m, c * 0.5).fill({ color: PALETTE.wallMortar, alpha: 0.45 });
    g.rect(c * 0.25 - m / 2, c * 0.5, m, c * 0.5).fill({ color: PALETTE.wallMortar, alpha: 0.45 });
    // outer edge
    g.rect(0.5, 0.5, c - 1, c - 1).stroke({ width: 1, color: PALETTE.wallDark, alpha: 0.6 });
  });

  const goal = generate((g) => {
    // target pad: tinted disc + ring + center dot, on transparent floor
    g.circle(c / 2, c / 2, c * 0.34).fill({ color: PALETTE.goal, alpha: 0.1 });
    g.circle(c / 2, c / 2, c * 0.24).fill({ color: PALETTE.goal, alpha: 0.16 });
    g.circle(c / 2, c / 2, c * 0.19).stroke({
      width: Math.max(1.5, c * 0.035),
      color: PALETTE.goal,
      alpha: 0.75,
    });
    g.circle(c / 2, c / 2, c * 0.055).fill({ color: PALETTE.goal, alpha: 0.85 });
  });

  const drawCrate = (
    g: InstanceType<typeof Graphics>,
    frameColor: number,
    frameEdge: number,
    plank: number,
    seam: number,
  ) => {
    const pad = c * 0.07;
    const size = c - pad * 2;
    const r = c * 0.1;
    const inset = c * 0.1;

    // frame
    g.roundRect(pad, pad, size, size, r).fill(frameColor);
    // inner plank area
    const ix = pad + inset;
    const iw = size - inset * 2;
    g.rect(ix, ix, iw, iw).fill(plank);
    // horizontal plank seams
    const seamW = Math.max(1, c * 0.03);
    g.rect(ix, ix + iw / 3 - seamW / 2, iw, seamW).fill({ color: seam, alpha: 0.9 });
    g.rect(ix, ix + (2 * iw) / 3 - seamW / 2, iw, seamW).fill({ color: seam, alpha: 0.9 });
    // diagonal brace
    g.moveTo(ix, ix)
      .lineTo(ix + iw, ix + iw)
      .stroke({ width: Math.max(2, c * 0.07), color: frameColor, alpha: 0.85, cap: "round" });
    // corner nails
    const nr = Math.max(1, c * 0.025);
    const off = pad + inset / 2;
    g.circle(off, off, nr).fill(PALETTE.crateNail);
    g.circle(c - off, off, nr).fill(PALETTE.crateNail);
    g.circle(off, c - off, nr).fill(PALETTE.crateNail);
    g.circle(c - off, c - off, nr).fill(PALETTE.crateNail);
    // specular highlight
    g.roundRect(pad + c * 0.04, pad + c * 0.04, size * 0.4, c * 0.07, c * 0.035).fill({
      color: 0xffffff,
      alpha: 0.22,
    });
    // frame outline
    g.roundRect(pad, pad, size, size, r).stroke({
      width: Math.max(1.5, c * 0.035),
      color: frameEdge,
    });
  };

  const crate = generate((g) =>
    drawCrate(g, PALETTE.crateFrame, PALETTE.crateFrameEdge, PALETTE.cratePlank, PALETTE.crateSeam),
  );

  // The green crate alone signals "on target"; no halo ring around it.
  const crateOnGoal = generate((g) =>
    drawCrate(g, PALETTE.goalFrame, PALETTE.goalFrameEdge, PALETTE.goalPlank, PALETTE.goalSeam),
  );

  const player = generate((g) => {
    const edge = Math.max(1.5, c * 0.03);
    // antenna
    g.moveTo(c * 0.5, c * 0.22)
      .lineTo(c * 0.5, c * 0.1)
      .stroke({ width: Math.max(1.5, c * 0.03), color: PALETTE.robotEdge, cap: "round" });
    g.circle(c * 0.5, c * 0.09, c * 0.045).fill(PALETTE.antennaTip);
    // head dome
    g.circle(c * 0.5, c * 0.4, c * 0.21).fill(PALETTE.robotHead);
    g.circle(c * 0.5, c * 0.4, c * 0.21).stroke({ width: edge, color: PALETTE.robotEdge });
    // eyes
    g.circle(c * 0.42, c * 0.38, c * 0.05).fill(0xffffff);
    g.circle(c * 0.58, c * 0.38, c * 0.05).fill(0xffffff);
    g.circle(c * 0.42, c * 0.385, c * 0.022).fill(PALETTE.robotEdge);
    g.circle(c * 0.58, c * 0.385, c * 0.022).fill(PALETTE.robotEdge);
    // body
    g.roundRect(c * 0.3, c * 0.56, c * 0.4, c * 0.3, c * 0.07).fill(PALETTE.robotBody);
    g.roundRect(c * 0.3, c * 0.56, c * 0.4, c * 0.3, c * 0.07).stroke({
      width: edge,
      color: PALETTE.robotEdge,
    });
    // chest light
    g.circle(c * 0.5, c * 0.68, c * 0.045).fill({ color: 0xffffff, alpha: 0.85 });
  });

  const spark = generate((g) => {
    g.circle(c / 2, c / 2, c * 0.06).fill(0xffffff);
  });

  const all = [floorA, floorB, wall, goal, crate, crateOnGoal, player, spark];

  return {
    floorA,
    floorB,
    wall,
    goal,
    crate,
    crateOnGoal,
    player,
    spark,
    destroy() {
      for (const t of all) t.destroy(true);
    },
  };
}
