// Puzzle progress persisted in localStorage, exposed as an external store for
// useSyncExternalStore. Nothing here touches `window` during the server render:
// the server snapshot is a constant, and storage is only read from the client
// snapshot, subscriptions and event handlers.

import { TOTAL_LEVELS } from "./levels";
import type { Progress } from "./types";

const STORAGE_KEY = "vm-sokoban-progress-v1";

export const defaultProgress = (): Progress => ({ unlocked: 1, best: {} });

/** Positive integer from a number or numeric string (older saves), else null. */
function toPositiveInt(value: unknown): number | null {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : NaN;
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Coerce anything read from storage into a valid Progress. Never throws.
 * Unknown level ids and non-positive or fractional move counts are dropped, and
 * `unlocked` is clamped to the level count but never below the level after the
 * highest cleared one.
 */
export function sanitizeProgress(value: unknown): Progress {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultProgress();
  }
  const raw = value as { unlocked?: unknown; best?: unknown };

  const best: Record<number, number> = {};
  let highestCleared = 0;
  if (raw.best && typeof raw.best === "object" && !Array.isArray(raw.best)) {
    for (const [key, moves] of Object.entries(raw.best as Record<string, unknown>)) {
      const id = toPositiveInt(key);
      const count = toPositiveInt(moves);
      if (id === null || id > TOTAL_LEVELS || count === null) continue;
      best[id] = count;
      highestCleared = Math.max(highestCleared, id);
    }
  }

  const unlocked = Math.min(
    TOTAL_LEVELS,
    Math.max(1, toPositiveInt(raw.unlocked) ?? 1, highestCleared + 1),
  );
  return { unlocked, best };
}

/** Combine two progress records without losing either: max unlock, min best. */
function mergeProgress(a: Progress, b: Progress): Progress {
  const best: Record<number, number> = { ...a.best };
  for (const [key, moves] of Object.entries(b.best)) {
    const id = Number(key);
    best[id] = best[id] === undefined ? moves : Math.min(best[id], moves);
  }
  return sanitizeProgress({ unlocked: Math.max(a.unlocked, b.unlocked), best });
}

function sameProgress(a: Progress, b: Progress): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function readStored(): Progress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : defaultProgress();
  } catch {
    // Corrupt JSON, or storage blocked (private mode, sandboxed iframe).
    return defaultProgress();
  }
}

function writeStored(progress: Progress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Quota or blocked storage. The in-memory copy still holds the progress.
  }
}

/**
 * Record a level clear: keep the fewest-moves best score and unlock the next
 * level. Pure; persist the result through `updateProgress`.
 */
export function recordWin(
  progress: Progress,
  levelId: number,
  moves: number,
  totalLevels: number,
): Progress {
  const prevBest = progress.best[levelId];
  const best = prevBest === undefined ? moves : Math.min(prevBest, moves);
  const unlocked = Math.min(totalLevels, Math.max(progress.unlocked, levelId + 1));
  return {
    unlocked,
    best: { ...progress.best, [levelId]: best },
  };
}

// --- External store --------------------------------------------------------

let cache: Progress | null = null;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT: Progress = defaultProgress(); // stable reference for SSR

const notify = () => listeners.forEach((listener) => listener());

/**
 * Merge what is stored now into the in-memory copy (merging never drops a
 * result). Returns true when that changed the snapshot.
 */
function syncFromStorage(): boolean {
  if (cache === null) return false; // the first snapshot read loads it anyway
  const next = mergeProgress(cache, readStored());
  if (sameProgress(cache, next)) return false;
  cache = next;
  return true;
}

/** Another tab saved progress. */
function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  if (syncFromStorage()) notify();
}

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorage);
    // Saves from other tabs while nothing here was subscribed (the player was
    // on another page of this site) fired no event: pick them up now so the
    // level select never shows a stale best.
    if (syncFromStorage()) notify();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** Client snapshot, cached so repeat reads return the same reference. */
export function getProgressSnapshot(): Progress {
  if (cache === null) cache = readStored();
  return cache;
}

export function getServerProgressSnapshot(): Progress {
  return SERVER_SNAPSHOT;
}

/**
 * Read-modify-write against the freshest data: the in-memory copy merged with
 * what is stored now, so two quick wins, or wins in two tabs, never overwrite
 * each other. Returns the progress before and after the update.
 */
export function updateProgress(update: (current: Progress) => Progress): {
  previous: Progress;
  next: Progress;
} {
  const previous = mergeProgress(getProgressSnapshot(), readStored());
  const next = sanitizeProgress(update(previous));
  cache = next;
  writeStored(next);
  notify();
  return { previous, next };
}
