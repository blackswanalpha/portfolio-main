// Core types for the Sokoban puzzle game. Kept framework-free so the engine in
// `engine.ts` can be unit-tested / verified by a plain Node script.

export type Vec = { x: number; y: number };

export type Direction = "up" | "down" | "left" | "right";

/** A level as authored: an XSB ASCII map plus metadata. `par` (optimal move
 *  count) is computed offline by scripts/verify-levels.mjs and baked in here. */
export interface LevelDef {
  id: number; // 1-based
  name: string;
  map: string; // XSB legend: # wall · space floor · . goal · @ player · + player-on-goal · $ box · * box-on-goal
  par: number; // optimal number of player moves to solve
}

/** A parsed level split into an immutable static layer (walls/goals) and the
 *  starting dynamic state (player + boxes). */
export interface ParsedLevel {
  id: number;
  name: string;
  par: number;
  width: number;
  height: number;
  walls: boolean[][]; // [y][x]
  goals: Vec[];
  start: { player: Vec; boxes: Vec[] };
}

/** A reversible step recorded before every successful move so Undo can restore
 *  the exact prior state (including the move/push counters). */
export interface Snapshot {
  player: Vec;
  boxes: Vec[];
  moves: number;
  pushes: number;
}

export interface GameState {
  player: Vec;
  boxes: Vec[];
  moves: number;
  pushes: number;
  history: Snapshot[];
  solved: boolean;
}

/** Persisted to localStorage. `unlocked` is the highest level id the player may
 *  open; `best` maps level id -> fewest moves used to clear it. */
export interface Progress {
  unlocked: number;
  best: Record<number, number>;
}
