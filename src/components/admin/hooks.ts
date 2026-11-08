"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { errorMessage } from "@/components/ui/states";

/**
 * Per-row pending state for list actions.
 *
 * `run(key, action, task)` ignores a second call for the same row while the
 * first is in flight, so rapid clicks can't interleave two mutations on one
 * row. The ref is the synchronous lock (state updates land a render later);
 * the state drives the spinners.
 */
export function useRowPending<K extends string | number = number>() {
    const lock = useRef(new Set<K>());
    const [pending, setPending] = useState<ReadonlyMap<K, string>>(() => new Map());

    const run = useCallback(async (key: K, action: string, task: () => Promise<void>) => {
        if (lock.current.has(key)) return;
        lock.current.add(key);
        setPending((prev) => new Map(prev).set(key, action));
        try {
            await task();
        } finally {
            lock.current.delete(key);
            setPending((prev) => {
                const next = new Map(prev);
                next.delete(key);
                return next;
            });
        }
    }, []);

    return {
        /** The action running for this row, if any. */
        pendingAction: (key: K): string | undefined => pending.get(key),
        run,
    };
}

/**
 * State for an in-page confirmation (ConfirmDialog). `ask(target)` opens it,
 * `confirm(task)` runs the destructive call once; on failure the dialog stays
 * open with the error so the admin can retry or cancel.
 */
export function useConfirmAction<T>() {
    const lock = useRef(false);
    // The target is kept after closing so the dialog text doesn't vanish
    // during its exit animation.
    const [state, setState] = useState<{ target: T | null; open: boolean }>({ target: null, open: false });
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ask = useCallback((t: T) => {
        setError(null);
        setState({ target: t, open: true });
    }, []);

    const cancel = useCallback(() => {
        if (lock.current) return;
        setState((s) => ({ ...s, open: false }));
        setError(null);
    }, []);

    const confirm = async (task: (t: T) => Promise<void>) => {
        const { target, open } = state;
        if (!open || target === null || lock.current) return;
        lock.current = true;
        setPending(true);
        setError(null);
        try {
            await task(target);
            setState((s) => ({ ...s, open: false }));
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            lock.current = false;
            setPending(false);
        }
    };

    return { target: state.target, open: state.open, pending, error, ask, cancel, confirm };
}

/** Ref that is true while the component is mounted (for async work that navigates). */
export function useMountedRef() {
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    return mounted;
}

// A shared minute clock for relative times ("5 min ago"). Reading Date.now()
// during render is impure; this subscribes to a timer instead.
const MINUTE = 60_000;
let clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;
let clockNow = 0;

function subscribeClock(listener: () => void) {
    clockListeners.add(listener);
    if (clockTimer === null) {
        clockTimer = setInterval(() => {
            clockNow = Date.now();
            clockListeners.forEach((l) => l());
        }, MINUTE);
    }
    return () => {
        clockListeners.delete(listener);
        if (clockListeners.size === 0 && clockTimer !== null) {
            clearInterval(clockTimer);
            clockTimer = null;
            clockListeners = new Set();
        }
    };
}

function readClock() {
    // Refresh lazily so the first read after mount is current, then stays
    // stable within the minute (useSyncExternalStore needs a stable snapshot).
    const now = Date.now();
    if (now - clockNow >= MINUTE) clockNow = now;
    return clockNow;
}

/** Current time in ms, updated once a minute. 0 on the server. */
export function useMinuteClock(): number {
    return useSyncExternalStore(subscribeClock, readClock, () => 0);
}

// ---------------------------------------------------------------------------
// Applying mutation results to a cached page (useApi setData)
// ---------------------------------------------------------------------------

interface Page<T> {
    items: T[];
    total: number;
}

/** Replace one item (by id) in a paginated response. */
export function patchItem<T extends { id: number }, P extends Page<T>>(prev: P | undefined, id: number, patch: (item: T) => T): P | undefined {
    if (!prev) return prev;
    return { ...prev, items: prev.items.map((item) => (item.id === id ? patch(item) : item)) };
}

/** Drop one item (by id) from a paginated response. */
export function dropItem<T extends { id: number }, P extends Page<T>>(prev: P | undefined, id: number): P | undefined {
    if (!prev) return prev;
    const items = prev.items.filter((item) => item.id !== id);
    return { ...prev, items, total: Math.max(0, prev.total - (prev.items.length - items.length)) };
}

/** "1 project", "3 projects". */
export function countLabel(n: number, singular: string, plural = `${singular}s`): string {
    return `${new Intl.NumberFormat("en-US").format(n)} ${n === 1 ? singular : plural}`;
}
