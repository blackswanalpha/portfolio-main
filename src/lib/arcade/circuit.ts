// Circuit: rotate tiles until every lamp on the grid is powered.
//
// Pure engine, no React or DOM. A puzzle is a random spanning tree over the
// grid (randomized Prim from the centre "core", at most three links per tile),
// built from a fixed seed so every level is the same for every player. Each
// tile is then turned a random number of quarter turns. Because rotation keeps
// every tile's number of links, the grid always has exactly 2·(n−1) link ends.
// So "every tile powered" (connected to the core through matching links)
// means every link end is matched, and the level is solved.

import { mulberry32, randInt, type Rng } from "./rng";

/** Link bits: north, east, south, west. */
export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;

export const SIDES = [
  { bit: N, dx: 0, dy: -1, opp: 2 },
  { bit: E, dx: 1, dy: 0, opp: 3 },
  { bit: S, dx: 0, dy: 1, opp: 0 },
  { bit: W, dx: -1, dy: 0, opp: 1 },
] as const;

export interface CircuitLevelDef {
  id: number;
  name: string;
  cols: number;
  rows: number;
  seed: number;
}

export interface CircuitPuzzle {
  id: number;
  name: string;
  cols: number;
  rows: number;
  /** Cell index of the power core. */
  source: number;
  /** Link mask per cell in the generated (solved) orientation. */
  solution: number[];
  /** Clockwise quarter turns applied to each tile at the start. */
  scramble: number[];
  /** Fewest clockwise taps that restore the generated solution. */
  par: number;
}

export interface CircuitState {
  /** Clockwise quarter turns per tile, 0-3. */
  rot: number[];
  moves: number;
  solved: boolean;
}

export interface PowerMap {
  powered: Uint8Array;
  /** Steps from the core along powered links (-1 when unpowered). */
  dist: Int16Array;
  /** Side index (0-3) the power entered from, -1 for the core or unpowered. */
  from: Int8Array;
  count: number;
  maxDist: number;
}

export const CIRCUIT_LEVELS: CircuitLevelDef[] = [
  { id: 1, name: "First light", cols: 4, rows: 4, seed: 1103 },
  { id: 2, name: "Relay", cols: 4, rows: 4, seed: 2207 },
  { id: 3, name: "Branches", cols: 5, rows: 5, seed: 3301 },
  { id: 4, name: "Crossroads", cols: 5, rows: 5, seed: 4409 },
  { id: 5, name: "Switchback", cols: 6, rows: 5, seed: 5503 },
  { id: 6, name: "Lattice", cols: 6, rows: 6, seed: 6607 },
  { id: 7, name: "Substation", cols: 6, rows: 6, seed: 7703 },
  { id: 8, name: "Junction box", cols: 7, rows: 6, seed: 8807 },
  { id: 9, name: "Night grid", cols: 7, rows: 7, seed: 9901 },
  { id: 10, name: "Mainline", cols: 7, rows: 7, seed: 10103 },
  { id: 11, name: "Power plant", cols: 8, rows: 7, seed: 11213 },
  { id: 12, name: "Citywide", cols: 8, rows: 8, seed: 12301 },
];

export const CIRCUIT_TOTAL = CIRCUIT_LEVELS.length;

/** Rotate a link mask clockwise by `turns` quarter turns (N→E→S→W). */
export function rotateMask(mask: number, turns: number): number {
  let m = mask & 15;
  const t = ((turns % 4) + 4) % 4;
  for (let i = 0; i < t; i++) m = ((m << 1) | (m >> 3)) & 15;
  return m;
}

export const linkCount = (mask: number) =>
  (mask & 1) + ((mask >> 1) & 1) + ((mask >> 2) & 1) + ((mask >> 3) & 1);

/** Current link mask of tile `i`. */
export function maskAt(puzzle: CircuitPuzzle, rot: number[], i: number): number {
  return rotateMask(puzzle.solution[i], rot[i]);
}

function neighbour(cols: number, rows: number, i: number, side: number): number {
  const x = (i % cols) + SIDES[side].dx;
  const y = Math.floor(i / cols) + SIDES[side].dy;
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return y * cols + x;
}

/** Randomized Prim spanning tree with at most three links per tile. */
function buildTree(cols: number, rows: number, source: number, rng: Rng): number[] | null {
  const n = cols * rows;
  const masks = new Array<number>(n).fill(0);
  const inTree = new Uint8Array(n);
  const frontier: Array<[number, number]> = [];
  const addEdges = (i: number) => {
    for (let s = 0; s < 4; s++) {
      const j = neighbour(cols, rows, i, s);
      if (j >= 0 && !inTree[j]) frontier.push([i, s]);
    }
  };
  inTree[source] = 1;
  let count = 1;
  addEdges(source);
  while (frontier.length > 0) {
    const k = randInt(rng, frontier.length);
    const [from, side] = frontier[k];
    frontier[k] = frontier[frontier.length - 1];
    frontier.pop();
    const to = neighbour(cols, rows, from, side);
    if (inTree[to] || linkCount(masks[from]) >= 3) continue;
    masks[from] |= SIDES[side].bit;
    masks[to] |= SIDES[SIDES[side].opp].bit;
    inTree[to] = 1;
    count++;
    addEdges(to);
  }
  return count === n ? masks : null;
}

/** Fewest clockwise quarter turns that bring a tile back to `target`. */
function turnsToSolve(target: number, rot: number): number {
  for (let t = 0; t < 4; t++) {
    if (rotateMask(target, rot + t) === target) return t;
  }
  return 0;
}

/** Build a level deterministically from its seed. */
export function makePuzzle(def: CircuitLevelDef): CircuitPuzzle {
  const rng = mulberry32(def.seed);
  const n = def.cols * def.rows;
  const source = Math.floor(def.rows / 2) * def.cols + Math.floor(def.cols / 2);
  let solution: number[] | null = null;
  for (let attempt = 0; attempt < 200 && !solution; attempt++) {
    solution = buildTree(def.cols, def.rows, source, rng);
  }
  if (!solution) throw new Error(`Circuit level ${def.id} could not be generated.`);

  // Scramble until at least half the tiles need turning, so no level opens
  // nearly solved.
  let scramble: number[] = [];
  let par = 0;
  for (let attempt = 0; attempt < 200; attempt++) {
    scramble = Array.from({ length: n }, () => randInt(rng, 4));
    par = 0;
    let off = 0;
    for (let i = 0; i < n; i++) {
      const t = turnsToSolve(solution[i], scramble[i]);
      par += t;
      if (t > 0) off++;
    }
    if (off >= n / 2 && computePower({ cols: def.cols, rows: def.rows, source, solution }, scramble).count < n) {
      break;
    }
  }
  return { id: def.id, name: def.name, cols: def.cols, rows: def.rows, source, solution, scramble, par };
}

/** Flood power out from the core along links that match on both sides. */
export function computePower(
  puzzle: Pick<CircuitPuzzle, "cols" | "rows" | "source" | "solution">,
  rot: number[],
): PowerMap {
  const { cols, rows, source, solution } = puzzle;
  const n = cols * rows;
  const powered = new Uint8Array(n);
  const dist = new Int16Array(n).fill(-1);
  const from = new Int8Array(n).fill(-1);
  const masks = solution.map((m, i) => rotateMask(m, rot[i]));
  const queue = [source];
  powered[source] = 1;
  dist[source] = 0;
  let count = 1;
  let maxDist = 0;
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    for (let s = 0; s < 4; s++) {
      if (!(masks[i] & SIDES[s].bit)) continue;
      const j = neighbour(cols, rows, i, s);
      if (j < 0 || powered[j]) continue;
      if (!(masks[j] & SIDES[SIDES[s].opp].bit)) continue;
      powered[j] = 1;
      dist[j] = dist[i] + 1;
      from[j] = SIDES[s].opp;
      maxDist = Math.max(maxDist, dist[j]);
      count++;
      queue.push(j);
    }
  }
  return { powered, dist, from, count, maxDist };
}

export function createCircuitState(puzzle: CircuitPuzzle): CircuitState {
  return { rot: puzzle.scramble.slice(), moves: 0, solved: false };
}

/**
 * Turn one tile a quarter turn (dir 1 = clockwise, -1 = counter-clockwise).
 * A solved board is final: further turns return the same state.
 */
export function rotateTile(
  state: CircuitState,
  puzzle: CircuitPuzzle,
  index: number,
  dir: 1 | -1,
): CircuitState {
  if (state.solved || index < 0 || index >= state.rot.length) return state;
  const rot = state.rot.slice();
  rot[index] = (rot[index] + dir + 4) % 4;
  const solved = computePower(puzzle, rot).count === rot.length;
  return { rot, moves: state.moves + 1, solved };
}

/** 3 stars at or under par, 2 within 1.5× par, otherwise 1. */
export function circuitStars(moves: number, par: number): number {
  if (moves <= par) return 3;
  if (moves <= Math.ceil(par * 1.5)) return 2;
  return 1;
}
