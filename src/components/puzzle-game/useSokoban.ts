"use client";

import { useCallback, useReducer } from "react";
import {
  createState,
  move as engineMove,
  undo as engineUndo,
} from "@/lib/sokoban/engine";
import type { Direction, GameState, ParsedLevel } from "@/lib/sokoban/types";

type Action =
  | { type: "move"; dir: Direction; level: ParsedLevel }
  | { type: "undo" }
  | { type: "reset"; level: ParsedLevel };

// The engine returns the SAME reference for an illegal move, so React bails out
// of re-rendering automatically when nothing changed. A solved level is final:
// moves, undo and reset are all ignored so a held key or a fast tap that lands
// after the winning move cannot change the board behind the win dialog.
function reducer(game: GameState, action: Action): GameState {
  if (game.solved) return game;
  switch (action.type) {
    case "move":
      return engineMove(game, action.level, action.dir);
    case "undo":
      return engineUndo(game);
    case "reset":
      return game.moves === 0 ? game : createState(action.level);
    default:
      return game;
  }
}

/**
 * Game-state hook for a single level. Mount the component that uses it with a
 * `key` tied to the level (and replay count) so every run gets a fresh reducer
 * and a clean history.
 */
export function useSokoban(level: ParsedLevel) {
  const [game, dispatch] = useReducer(reducer, level, createState);

  const move = useCallback(
    (dir: Direction) => dispatch({ type: "move", dir, level }),
    [level],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const reset = useCallback(
    () => dispatch({ type: "reset", level }),
    [level],
  );

  return { game, move, undo, reset };
}
