// The 10 puzzle levels, in ascending difficulty (by optimal move count). Maps
// use the standard XSB legend (see types.ts). These are original, compact
// Sokoban puzzles in the spirit of David W. Skinner's public-domain "Microban"
// set — small, fair, and always solvable. Every map is verified solvable and
// its `par` (optimal move count) is computed by scripts/verify-levels.mjs.
// KEEP THE map template literals as the single source of truth — that script
// reads them directly by matching the "map:" property.

import type { LevelDef } from "./types";

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "First push",
    par: 3,
    map: `
#######
#@  $.#
#######`,
  },
  {
    id: 2,
    name: "Nudge",
    par: 4,
    map: `
#######
#@    #
#.$   #
#######`,
  },
  {
    id: 3,
    name: "Tandem",
    par: 5,
    map: `
######
#@   #
# $$ #
# .. #
######`,
  },
  {
    id: 4,
    name: "Down & over",
    par: 6,
    map: `
#######
#@    #
# $   #
#   . #
#######`,
  },
  {
    id: 5,
    name: "The pair",
    par: 8,
    map: `
#######
#@ $ .#
#  $ .#
#######`,
  },
  {
    id: 6,
    name: "Triple left",
    par: 9,
    map: `
#######
#.$  @#
#.$   #
#.$   #
#######`,
  },
  {
    id: 7,
    name: "The comb",
    par: 10,
    map: `
########
#@     #
# $ $ $#
# . . .#
########`,
  },
  {
    id: 8,
    name: "Quartet",
    par: 11,
    map: `
########
#@     #
# $$$$ #
# .... #
########`,
  },
  {
    id: 9,
    name: "The cross",
    par: 11,
    map: `
#######
# .  .#
# $  $#
#  @  #
# $  $#
# .  .#
#######`,
  },
  {
    id: 10,
    name: "Long haul",
    par: 18,
    map: `
#########
#@      #
# $$$$  #
#       #
# ....  #
#########`,
  },
];

export const TOTAL_LEVELS = LEVELS.length;
