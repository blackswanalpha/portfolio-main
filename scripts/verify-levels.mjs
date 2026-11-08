// Dev-only level verifier. Reads the `map:` template literals straight out of
// src/lib/sokoban/levels.ts (single source of truth), then runs a breadth-first
// search over (player, boxes) states to prove each level is solvable and to
// compute its optimal move count (`par`). Run with:
//
//     node scripts/verify-levels.mjs
//
// Exits non-zero if any level is unsolvable or exceeds the state cap.

import { readFileSync } from "node:fs";

const LEVELS_PATH = new URL("../src/lib/sokoban/levels.ts", import.meta.url);
const STATE_CAP = 5_000_000;

const DIRS = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];

function parse(map) {
  const raw = map.replace(/^\n/, "").replace(/\n$/, "");
  const lines = raw.split("\n");
  const width = lines.reduce((w, l) => Math.max(w, l.length), 0);
  const height = lines.length;
  const walls = [];
  const goals = [];
  const boxes = [];
  let player = null;
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
  return { width, height, walls, goals, boxes, player };
}

const blocked = (lvl, x, y) =>
  y < 0 || y >= lvl.height || x < 0 || x >= lvl.width || lvl.walls[y][x];

// Canonical key: player position + box positions sorted by (y, x).
function keyOf(player, boxes) {
  const sorted = [...boxes].sort((a, b) => a.y - b.y || a.x - b.x);
  let s = `${player.x},${player.y}|`;
  for (const b of sorted) s += `${b.x},${b.y};`;
  return s;
}

function solved(boxes, goalSet) {
  for (const b of boxes) if (!goalSet.has(`${b.x},${b.y}`)) return false;
  return true;
}

/** BFS over player moves -> optimal move count, or a failure reason. */
function solve(lvl) {
  const goalSet = new Set(lvl.goals.map((g) => `${g.x},${g.y}`));
  if (solved(lvl.boxes, goalSet)) return { ok: true, par: 0 };

  const start = { player: lvl.player, boxes: lvl.boxes };
  const visited = new Set([keyOf(start.player, start.boxes)]);
  let frontier = [start];
  let dist = 0;

  while (frontier.length) {
    dist++;
    const next = [];
    for (const state of frontier) {
      for (const d of DIRS) {
        const tx = state.player.x + d.x;
        const ty = state.player.y + d.y;
        if (blocked(lvl, tx, ty)) continue;

        let boxes = state.boxes;
        const bi = state.boxes.findIndex((b) => b.x === tx && b.y === ty);
        if (bi >= 0) {
          const bx = tx + d.x;
          const by = ty + d.y;
          if (blocked(lvl, bx, by)) continue;
          if (state.boxes.some((b) => b.x === bx && b.y === by)) continue;
          boxes = state.boxes.map((b, i) => (i === bi ? { x: bx, y: by } : b));
        }

        const player = { x: tx, y: ty };
        const k = keyOf(player, boxes);
        if (visited.has(k)) continue;
        if (bi >= 0 && solved(boxes, goalSet)) return { ok: true, par: dist };
        visited.add(k);
        if (visited.size > STATE_CAP) {
          return { ok: false, reason: `state cap (${STATE_CAP}) exceeded` };
        }
        next.push({ player, boxes });
      }
    }
    frontier = next;
  }
  return { ok: false, reason: "no solution (unsolvable)" };
}

// --- Extract maps + names + declared par from levels.ts -------------------
const src = readFileSync(LEVELS_PATH, "utf8");
// Anchor to line starts so prose / comments can never be matched as data.
const maps = [...src.matchAll(/^\s*map:\s*`([\s\S]*?)`/gm)].map((m) => m[1]);
const names = [...src.matchAll(/^\s*name:\s*"([^"]*)"/gm)].map((m) => m[1]);
const declaredPars = [...src.matchAll(/^\s*par:\s*(\d+)/gm)].map((m) =>
  Number(m[1]),
);

if (maps.length !== 10) {
  console.error(`Expected 10 maps, found ${maps.length}.`);
  process.exit(1);
}

console.log(`Verifying ${maps.length} levels...\n`);
let failures = 0;
const results = [];

maps.forEach((map, i) => {
  const lvl = parse(map);
  const name = names[i] ?? `Level ${i + 1}`;
  const counts = `${lvl.boxes.length}b/${lvl.goals.length}g`;
  if (!lvl.player) {
    console.error(`L${i + 1} "${name}": NO PLAYER`);
    failures++;
    return;
  }
  if (lvl.boxes.length !== lvl.goals.length) {
    console.error(`L${i + 1} "${name}": box/goal mismatch (${counts})`);
    failures++;
    return;
  }
  const res = solve(lvl);
  if (!res.ok) {
    console.error(`L${i + 1} "${name}": UNSOLVABLE — ${res.reason}`);
    failures++;
    return;
  }
  const declared = declaredPars[i];
  const flag = declared === res.par ? "" : `  (declared par ${declared} -> should be ${res.par})`;
  results.push({ i: i + 1, name, par: res.par, size: `${lvl.width}x${lvl.height}`, counts });
  console.log(
    `L${String(i + 1).padStart(2)} "${name}"`.padEnd(28) +
      `${lvl.width}x${lvl.height}  ${counts}  par=${res.par}${flag}`,
  );
});

console.log("");
if (failures) {
  console.error(`\n${failures} level(s) failed verification.`);
  process.exit(1);
}
console.log("All levels solvable. Suggested par order (ascending):");
console.log(
  results
    .slice()
    .sort((a, b) => a.par - b.par)
    .map((r) => `  ${r.par}  L${r.i} ${r.name}`)
    .join("\n"),
);
