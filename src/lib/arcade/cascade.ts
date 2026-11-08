// Cascade: swap neighbouring gems to make lines of three or more.
//
// Pure engine, no React or DOM. `applySwap` resolves a whole move at once
// (swap, every cascade wave, gravity, refills, and a reshuffle when no move is
// left) and returns the final state plus the list of steps that got there.
// The UI commits the final state immediately and only *plays back* the steps,
// so an animation can never race the game logic.
//
// Specials:
//   4 in a line     -> line gem: clears its row (horizontal match) or column
//   L, T or + shape -> burst gem: clears the 3x3 around it
//   5+ in a line    -> nova: swap it with a gem to clear every gem of that colour
// Two specials swapped together both go off. Specials caught in a clear or a
// blast go off too, so chains can run across the board.

import { randInt, shuffleInPlace, type Rng } from "./rng";

export const COLS = 8;
export const ROWS = 8;
export const COLORS = 6;
export const START_MOVES = 20;
const SIZE = COLS * ROWS;

export type Special = "none" | "row" | "col" | "burst" | "nova";

export interface Gem {
  id: number;
  /** 0..COLORS-1, or -1 for a nova (it has no colour). */
  color: number;
  special: Special;
}

export interface CascadeState {
  board: Gem[];
  nextId: number;
  score: number;
  movesLeft: number;
}

export interface Blast {
  index: number;
  special: Special;
  color: number;
}

export type Step =
  | { kind: "swap"; a: number; b: number; valid: boolean }
  | {
      kind: "clear";
      combo: number;
      cleared: Array<{ index: number; gem: Gem }>;
      created: Array<{ index: number; gem: Gem }>;
      blasts: Blast[];
      points: number;
    }
  | {
      kind: "fall";
      moves: Array<{ id: number; from: number; to: number }>;
      /** `from` is a virtual row above the board (-1, -2, ...) in the same column. */
      spawns: Array<{ gem: Gem; to: number; fromRow: number }>;
    }
  | { kind: "shuffle"; board: Gem[] };

export interface MoveResult {
  state: CascadeState;
  steps: Step[];
  /** Waves of clears this move produced (1 = no cascade). */
  combo: number;
  points: number;
}

export const rowOf = (i: number) => Math.floor(i / COLS);
export const colOf = (i: number) => i % COLS;
export const areAdjacent = (a: number, b: number) =>
  a >= 0 && b >= 0 && a < SIZE && b < SIZE &&
  Math.abs(rowOf(a) - rowOf(b)) + Math.abs(colOf(a) - colOf(b)) === 1;

/**
 * Score thresholds for one, two and three stars in a 20-move run. Calibrated
 * by simulation: random play has a median near 1,500 and greedy play reaches
 * 2,400 about one run in four, so three stars needs specials used on purpose.
 */
export const STAR_SCORES = [1200, 2400, 3600] as const;

export function cascadeStars(score: number): number {
  return STAR_SCORES.filter((s) => score >= s).length;
}

// --- matching ------------------------------------------------------------------

interface Run {
  cells: number[];
  dir: "h" | "v";
  color: number;
}

interface Group {
  cells: Set<number>;
  runs: Run[];
  color: number;
}

const colorAt = (board: Array<Gem | null>, i: number) => board[i]?.color ?? -1;

function findRuns(board: Array<Gem | null>): Run[] {
  const runs: Run[] = [];
  for (let r = 0; r < ROWS; r++) {
    let start = 0;
    for (let c = 1; c <= COLS; c++) {
      const prev = colorAt(board, r * COLS + c - 1);
      const cur = c < COLS ? colorAt(board, r * COLS + c) : -2;
      if (cur === prev && prev >= 0) continue;
      if (prev >= 0 && c - start >= 3) {
        runs.push({ cells: Array.from({ length: c - start }, (_, k) => r * COLS + start + k), dir: "h", color: prev });
      }
      start = c;
    }
  }
  for (let c = 0; c < COLS; c++) {
    let start = 0;
    for (let r = 1; r <= ROWS; r++) {
      const prev = colorAt(board, (r - 1) * COLS + c);
      const cur = r < ROWS ? colorAt(board, r * COLS + c) : -2;
      if (cur === prev && prev >= 0) continue;
      if (prev >= 0 && r - start >= 3) {
        runs.push({ cells: Array.from({ length: r - start }, (_, k) => (start + k) * COLS + c), dir: "v", color: prev });
      }
      start = r;
    }
  }
  return runs;
}

/** Runs that share a cell (L, T and + shapes) merge into one group. */
function findGroups(board: Array<Gem | null>): Group[] {
  const runs = findRuns(board);
  const parent = runs.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const owner = new Map<number, number>();
  runs.forEach((run, i) => {
    for (const cell of run.cells) {
      const j = owner.get(cell);
      if (j === undefined) owner.set(cell, i);
      else parent[find(i)] = find(j);
    }
  });
  const groups = new Map<number, Group>();
  runs.forEach((run, i) => {
    const root = find(i);
    let g = groups.get(root);
    if (!g) {
      g = { cells: new Set(), runs: [], color: run.color };
      groups.set(root, g);
    }
    g.runs.push(run);
    run.cells.forEach((cell) => g!.cells.add(cell));
  });
  return [...groups.values()];
}

function specialFor(group: Group): Special {
  const longest = Math.max(...group.runs.map((r) => r.cells.length));
  if (longest >= 5) return "nova";
  const hasH = group.runs.some((r) => r.dir === "h");
  const hasV = group.runs.some((r) => r.dir === "v");
  if (hasH && hasV) return "burst";
  if (longest === 4) return group.runs[0].dir === "h" ? "row" : "col";
  return "none";
}

/** Where a new special appears: the swapped cell if it is in the group, else the shape's centre. */
function creationCell(group: Group, preferred: number[]): number {
  for (const p of preferred) if (group.cells.has(p)) return p;
  if (group.runs.length > 1) {
    // The crossing cell of an L/T/+ shape.
    const seen = new Set<number>();
    for (const run of group.runs) {
      for (const cell of run.cells) {
        if (seen.has(cell)) return cell;
        seen.add(cell);
      }
    }
  }
  const longest = group.runs.reduce((a, b) => (b.cells.length > a.cells.length ? b : a));
  return longest.cells[Math.floor((longest.cells.length - 1) / 2)];
}

/** Does `i` sit in a line of three or more of its own colour? */
function matchesAt(board: Array<Gem | null>, i: number): boolean {
  const color = colorAt(board, i);
  if (color < 0) return false;
  const r = rowOf(i);
  const c = colOf(i);
  let h = 1;
  for (let x = c - 1; x >= 0 && colorAt(board, r * COLS + x) === color; x--) h++;
  for (let x = c + 1; x < COLS && colorAt(board, r * COLS + x) === color; x++) h++;
  if (h >= 3) return true;
  let v = 1;
  for (let y = r - 1; y >= 0 && colorAt(board, y * COLS + c) === color; y--) v++;
  for (let y = r + 1; y < ROWS && colorAt(board, y * COLS + c) === color; y++) v++;
  return v >= 3;
}

const isSpecial = (g: Gem | null | undefined) => !!g && g.special !== "none";

/** Is swapping a and b a legal move on this board? */
export function isLegalSwap(board: Gem[], a: number, b: number): boolean {
  if (!areAdjacent(a, b)) return false;
  const ga = board[a];
  const gb = board[b];
  if (ga.special === "nova" || gb.special === "nova") return true;
  if (isSpecial(ga) && isSpecial(gb)) return true;
  const next = board.slice();
  next[a] = gb;
  next[b] = ga;
  return matchesAt(next, a) || matchesAt(next, b);
}

/** Every legal swap as [a, b] pairs (a < b). */
export function findMoves(board: Gem[]): Array<[number, number]> {
  const moves: Array<[number, number]> = [];
  for (let i = 0; i < SIZE; i++) {
    if (colOf(i) < COLS - 1 && isLegalSwap(board, i, i + 1)) moves.push([i, i + 1]);
    if (rowOf(i) < ROWS - 1 && isLegalSwap(board, i, i + COLS)) moves.push([i, i + COLS]);
  }
  return moves;
}

// --- board setup --------------------------------------------------------------

function newGem(state: { nextId: number }, color: number, special: Special = "none"): Gem {
  return { id: state.nextId++, color, special };
}

/** Random colours with no starting matches and at least one legal move. */
export function createCascadeState(rng: Rng): CascadeState {
  const counter = { nextId: 1 };
  for (;;) {
    const board: Gem[] = [];
    for (let i = 0; i < SIZE; i++) {
      const r = rowOf(i);
      const c = colOf(i);
      const banned = new Set<number>();
      if (c >= 2 && board[i - 1].color === board[i - 2].color) banned.add(board[i - 1].color);
      if (r >= 2 && board[i - COLS].color === board[i - 2 * COLS].color) banned.add(board[i - COLS].color);
      const options = Array.from({ length: COLORS }, (_, k) => k).filter((k) => !banned.has(k));
      board.push(newGem(counter, options[randInt(rng, options.length)]));
    }
    if (findMoves(board).length > 0) {
      return { board, nextId: counter.nextId, score: 0, movesLeft: START_MOVES };
    }
  }
}

// --- resolving a move ---------------------------------------------------------

function mostCommonColor(board: Array<Gem | null>): number {
  const counts = new Array<number>(COLORS).fill(0);
  for (const g of board) if (g && g.color >= 0) counts[g.color]++;
  let best = 0;
  for (let k = 1; k < COLORS; k++) if (counts[k] > counts[best]) best = k;
  return best;
}

/** Cells a special clears when it goes off at `i`. */
function effectCells(board: Array<Gem | null>, i: number, gem: Gem, novaTarget: number | undefined): number[] {
  const r = rowOf(i);
  const c = colOf(i);
  const out: number[] = [];
  switch (gem.special) {
    case "row":
      for (let x = 0; x < COLS; x++) out.push(r * COLS + x);
      break;
    case "col":
      for (let y = 0; y < ROWS; y++) out.push(y * COLS + c);
      break;
    case "burst":
      for (let y = r - 1; y <= r + 1; y++) {
        for (let x = c - 1; x <= c + 1; x++) {
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) out.push(y * COLS + x);
        }
      }
      break;
    case "nova": {
      // -2: two novas swapped together clear the whole board.
      const target = novaTarget ?? mostCommonColor(board);
      for (let k = 0; k < SIZE; k++) {
        const g = board[k];
        if (g && (target === -2 || g.color === target)) out.push(k);
      }
      break;
    }
    default:
      break;
  }
  return out;
}

const POINTS_PER_GEM = 10;
const POINTS_PER_BLAST = 50;

/** Drop gems into gaps and refill from above. Mutates `board`. */
function settle(board: Array<Gem | null>, counter: { nextId: number }, rng: Rng): Extract<Step, { kind: "fall" }> {
  const moves: Array<{ id: number; from: number; to: number }> = [];
  const spawns: Array<{ gem: Gem; to: number; fromRow: number }> = [];
  for (let c = 0; c < COLS; c++) {
    let write = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      const i = r * COLS + c;
      const g = board[i];
      if (!g) continue;
      if (r !== write) {
        const to = write * COLS + c;
        board[to] = g;
        board[i] = null;
        moves.push({ id: g.id, from: i, to });
      }
      write--;
    }
    for (let r = write, k = 0; r >= 0; r--, k++) {
      const gem = newGem(counter, randInt(rng, COLORS));
      board[r * COLS + c] = gem;
      spawns.push({ gem, to: r * COLS + c, fromRow: -1 - k });
    }
  }
  return { kind: "fall", moves, spawns };
}

/** Rearrange the same gems until there is a move and no ready-made match. */
function reshuffle(board: Gem[], rng: Rng, counter: { nextId: number }): Gem[] {
  for (let attempt = 0; attempt < 200; attempt++) {
    const next = shuffleInPlace(rng, board.slice());
    if (findGroups(next).length === 0 && findMoves(next).length > 0) return next;
  }
  // Pathological colour mix: recolour from scratch (keeps specials out).
  return createCascadeState(rng).board.map((g) => newGem(counter, g.color));
}

/**
 * Try a swap. Returns null when the move is not allowed at all (not adjacent,
 * or no moves left). An adjacent swap that makes no match returns the same
 * state with a single invalid "swap" step, so the UI can show it bounce back.
 */
export function applySwap(state: CascadeState, a: number, b: number, rng: Rng): MoveResult | null {
  if (state.movesLeft <= 0 || !areAdjacent(a, b)) return null;
  if (!isLegalSwap(state.board, a, b)) {
    return { state, steps: [{ kind: "swap", a, b, valid: false }], combo: 0, points: 0 };
  }

  const board: Array<Gem | null> = state.board.slice();
  const ga = board[a]!;
  const gb = board[b]!;
  board[a] = gb;
  board[b] = ga;
  const counter = { nextId: state.nextId };
  const steps: Step[] = [{ kind: "swap", a, b, valid: true }];

  // Swaps that go off without a match: a nova, or two specials together.
  const forced = new Set<number>();
  const novaTargets = new Map<number, number>();
  if (ga.special === "nova" || gb.special === "nova") {
    if (ga.special === "nova" && gb.special === "nova") {
      novaTargets.set(a, -2);
      novaTargets.set(b, -2);
      forced.add(a).add(b);
    } else {
      const novaAt = ga.special === "nova" ? b : a;
      const partner = ga.special === "nova" ? gb : ga;
      novaTargets.set(novaAt, partner.color);
      forced.add(novaAt);
    }
  } else if (isSpecial(ga) && isSpecial(gb)) {
    forced.add(a).add(b);
  }

  let combo = 0;
  let total = 0;
  for (let wave = 0; wave < 64; wave++) {
    const groups = findGroups(board);
    if (groups.length === 0 && forced.size === 0) break;
    combo++;

    const toClear = new Set<number>(forced);
    forced.clear();
    const created: Array<{ index: number; gem: Gem }> = [];
    const createdAt = new Set<number>();
    for (const group of groups) {
      group.cells.forEach((cell) => toClear.add(cell));
      const special = specialFor(group);
      if (special === "none") continue;
      const at = creationCell(group, wave === 0 ? [b, a] : []);
      if (createdAt.has(at)) continue;
      createdAt.add(at);
      created.push({ index: at, gem: newGem(counter, special === "nova" ? -1 : group.color, special) });
    }

    // Specials caught in the clear go off, and can set off more specials.
    const blasts: Blast[] = [];
    const queue = [...toClear];
    const fired = new Set<number>();
    while (queue.length > 0) {
      const i = queue.pop()!;
      const gem = board[i];
      if (!gem || gem.special === "none" || fired.has(i)) continue;
      fired.add(i);
      blasts.push({ index: i, special: gem.special, color: gem.color });
      for (const cell of effectCells(board, i, gem, novaTargets.get(i))) {
        if (!toClear.has(cell)) {
          toClear.add(cell);
          queue.push(cell);
        }
      }
    }
    novaTargets.clear();

    const cleared: Array<{ index: number; gem: Gem }> = [];
    toClear.forEach((i) => {
      const gem = board[i];
      if (gem) cleared.push({ index: i, gem });
      board[i] = null;
    });
    for (const p of created) board[p.index] = p.gem;

    const points = (cleared.length * POINTS_PER_GEM + blasts.length * POINTS_PER_BLAST) * combo;
    total += points;
    steps.push({ kind: "clear", combo, cleared, created, blasts, points });
    steps.push(settle(board, counter, rng));
  }

  let finalBoard = board as Gem[];
  if (findMoves(finalBoard).length === 0) {
    finalBoard = reshuffle(finalBoard, rng, counter);
    steps.push({ kind: "shuffle", board: finalBoard.slice() });
  }

  return {
    state: {
      board: finalBoard,
      nextId: counter.nextId,
      score: state.score + total,
      movesLeft: state.movesLeft - 1,
    },
    steps,
    combo,
    points: total,
  };
}

/** A legal move to suggest: the one that clears the most gems right away. */
export function findHint(board: Gem[]): [number, number] | null {
  let best: [number, number] | null = null;
  let bestSize = -1;
  for (const [a, b] of findMoves(board)) {
    const next = board.slice();
    next[a] = board[b];
    next[b] = board[a];
    let size = 0;
    for (const g of findGroups(next)) size += g.cells.size;
    if (board[a].special !== "none" || board[b].special !== "none") size += 4;
    if (size > bestSize) {
      bestSize = size;
      best = [a, b];
    }
  }
  return best;
}
