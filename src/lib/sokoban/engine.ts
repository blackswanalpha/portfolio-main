// Pure, immutable Sokoban rules engine. No React, no DOM — every function
// returns a fresh state (or the same reference when a move is illegal, so the
// UI can cheaply skip re-rendering). The matching BFS solver used to verify
// levels and compute `par` lives in scripts/verify-levels.mjs (dev-only).

import type { Direction, GameState, LevelDef, ParsedLevel, Vec } from "./types";

export const DIRS: Record<Direction, Vec> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const keyOf = (v: Vec): string => `${v.x},${v.y}`;
const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
const eq = (a: Vec, b: Vec): boolean => a.x === b.x && a.y === b.y;

/** Parse an XSB map string into walls / goals / starting player+boxes. */
export function parseLevel(def: LevelDef): ParsedLevel {
  // Drop a single leading/trailing newline from the template literal, but keep
  // interior rows verbatim (leading spaces in a row are significant).
  const raw = def.map.replace(/^\n/, "").replace(/\n$/, "");
  const lines = raw.split("\n");
  const width = lines.reduce((w, l) => Math.max(w, l.length), 0);
  const height = lines.length;

  const walls: boolean[][] = [];
  const goals: Vec[] = [];
  const boxes: Vec[] = [];
  let player: Vec | null = null;

  for (let y = 0; y < height; y++) {
    walls[y] = [];
    const line = lines[y] ?? "";
    for (let x = 0; x < width; x++) {
      const ch = line[x] ?? " ";
      walls[y][x] = ch === "#";
      if (ch === "." || ch === "+" || ch === "*") goals.push({ x, y });
      if (ch === "$" || ch === "*") boxes.push({ x, y });
      if (ch === "@" || ch === "+") player = { x, y };
    }
  }

  if (!player) throw new Error(`Level "${def.name}" has no player (@).`);
  if (boxes.length !== goals.length) {
    throw new Error(
      `Level "${def.name}" has ${boxes.length} boxes but ${goals.length} goals.`,
    );
  }

  return {
    id: def.id,
    name: def.name,
    par: def.par,
    width,
    height,
    walls,
    goals,
    start: { player, boxes },
  };
}

/** True when every goal cell is covered by a box. */
export function isSolved(boxes: Vec[], goals: Vec[]): boolean {
  if (boxes.length !== goals.length) return false;
  const boxSet = new Set(boxes.map(keyOf));
  return goals.every((g) => boxSet.has(keyOf(g)));
}

/** Fresh game state at the start of a level. */
export function createState(level: ParsedLevel): GameState {
  const boxes = level.start.boxes.map((b) => ({ ...b }));
  return {
    player: { ...level.start.player },
    boxes,
    moves: 0,
    pushes: 0,
    history: [],
    solved: isSolved(boxes, level.goals),
  };
}

const outOfBounds = (level: ParsedLevel, v: Vec): boolean =>
  v.y < 0 || v.y >= level.height || v.x < 0 || v.x >= level.width;

/** A wall or the void outside the map blocks movement. */
const blocked = (level: ParsedLevel, v: Vec): boolean =>
  outOfBounds(level, v) || level.walls[v.y][v.x];

/**
 * Apply a move. Returns the SAME state reference when the move is illegal
 * (walking into a wall, or pushing a box into a wall / another box).
 */
export function move(
  state: GameState,
  level: ParsedLevel,
  dir: Direction,
): GameState {
  if (state.solved) return state;

  const d = DIRS[dir];
  const target = add(state.player, d);
  if (blocked(level, target)) return state;

  let boxes = state.boxes;
  let pushes = state.pushes;

  const boxIdx = state.boxes.findIndex((b) => eq(b, target));
  if (boxIdx >= 0) {
    const beyond = add(target, d);
    if (blocked(level, beyond)) return state;
    if (state.boxes.some((b) => eq(b, beyond))) return state;
    boxes = state.boxes.map((b, i) => (i === boxIdx ? beyond : b));
    pushes += 1;
  }

  const history = [
    ...state.history,
    {
      player: state.player,
      boxes: state.boxes,
      moves: state.moves,
      pushes: state.pushes,
    },
  ];

  return {
    player: target,
    boxes,
    moves: state.moves + 1,
    pushes,
    history,
    solved: isSolved(boxes, level.goals),
  };
}

/** Step back to the state before the last move. No-op with empty history. */
export function undo(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const history = state.history.slice();
  const prev = history.pop()!;
  return {
    player: prev.player,
    boxes: prev.boxes,
    moves: prev.moves,
    pushes: prev.pushes,
    history,
    solved: false, // undoing from a solved state is impossible; a restored prior state is never solved
  };
}
