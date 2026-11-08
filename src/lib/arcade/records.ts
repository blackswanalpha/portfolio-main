// Personal bests for the arcade games, persisted in localStorage and exposed as
// an external store for useSyncExternalStore (same contract as
// lib/sokoban/storage.ts). The server snapshot is a constant and storage is
// only read on the client, so hydration never mismatches.
//
// Every record is one positive integer under a known key, and each key says
// whether higher or lower is better. Merging two copies (memory and storage,
// or two tabs) keeps the better value per key, so no result is ever lost.

const STORAGE_KEY = "vm-arcade-records-v1";

export type Records = Readonly<Record<string, number>>;
type Rule = "max" | "min";

export const recordKeys = {
  circuitMoves: (levelId: number) => `circuit:moves:${levelId}`,
  circuitUnlocked: "circuit:unlocked",
  cascadeScore: "cascade:score",
  shatterScore: "shatter:score",
  shatterLevel: "shatter:level",
} as const;

function ruleFor(key: string): Rule | null {
  if (/^circuit:moves:\d{1,3}$/.test(key)) return "min";
  if (
    key === recordKeys.circuitUnlocked ||
    key === recordKeys.cascadeScore ||
    key === recordKeys.shatterScore ||
    key === recordKeys.shatterLevel
  ) {
    return "max";
  }
  return null;
}

const better = (rule: Rule, a: number, b: number) => (rule === "max" ? Math.max(a, b) : Math.min(a, b));

/** Keep only known keys holding positive safe integers. Never throws. */
export function sanitizeRecords(value: unknown): Records {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (ruleFor(key) === null) continue;
    if (typeof raw !== "number" || !Number.isSafeInteger(raw) || raw <= 0) continue;
    out[key] = raw;
  }
  return out;
}

function mergeRecords(a: Records, b: Records): Records {
  const out: Record<string, number> = { ...a };
  for (const [key, value] of Object.entries(b)) {
    const rule = ruleFor(key);
    if (!rule) continue;
    out[key] = out[key] === undefined ? value : better(rule, out[key], value);
  }
  return out;
}

function sameRecords(a: Records, b: Records): boolean {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => a[k] === b[k]);
}

function readStored(): Records {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeRecords(JSON.parse(raw)) : {};
  } catch {
    return {}; // corrupt JSON or blocked storage
  }
}

function writeStored(records: Records): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Quota or blocked storage: the in-memory copy still holds the records.
  }
}

// --- External store ----------------------------------------------------------

let cache: Records | null = null;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT: Records = Object.freeze({});

const notify = () => listeners.forEach((listener) => listener());

function syncFromStorage(): boolean {
  if (cache === null) return false;
  const next = mergeRecords(cache, readStored());
  if (sameRecords(cache, next)) return false;
  cache = next;
  return true;
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  if (syncFromStorage()) notify();
}

export function subscribeRecords(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorage);
    if (syncFromStorage()) notify();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getRecordsSnapshot(): Records {
  if (cache === null) cache = readStored();
  return cache;
}

export function getServerRecordsSnapshot(): Records {
  return SERVER_SNAPSHOT;
}

/**
 * Submit a result. Read-modify-write against memory merged with storage, so
 * results from two tabs or two quick runs never overwrite each other.
 * `previous` is the best before this result (undefined on a first result) and
 * `improved` is true only for a strictly better value.
 */
export function submitRecord(key: string, value: number): { previous?: number; improved: boolean } {
  const rule = ruleFor(key);
  const merged = mergeRecords(getRecordsSnapshot(), readStored());
  const previous = merged[key];
  if (!rule || !Number.isSafeInteger(value) || value <= 0) {
    return { previous, improved: false };
  }
  const improved = previous === undefined || better(rule, previous, value) !== previous;
  const next = improved ? { ...merged, [key]: value } : merged;
  if (!sameRecords(getRecordsSnapshot(), next)) {
    cache = next;
    writeStored(next);
    notify();
  }
  return { previous, improved };
}
