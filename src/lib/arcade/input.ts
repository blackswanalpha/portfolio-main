// Keyboard scoping shared by every game on /puzzle-game.

/**
 * True when a key event belongs to something other than the game: a text
 * field, a dialog (the chat panel, a win dialog), or, when `scope` is given,
 * any focused element outside the game's own region (the game tabs, the
 * navbar). Keys pressed with nothing focused (the body) still reach the game.
 *
 * Without this, typing "what" in the chat moved the Sokoban player, and the
 * arrow keys that move between game tabs also moved the active game.
 */
export function isForeignTarget(target: EventTarget | null, scope?: Element | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  if (target.closest("input, textarea, select, [role='dialog']") !== null) return true;
  if (!scope) return false;
  if (target === document.body || target === document.documentElement) return false;
  return !scope.contains(target);
}

/** Ctrl/Cmd/Alt chords and IME composition are never game input. */
export function hasModifier(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.metaKey || e.altKey || e.isComposing;
}
