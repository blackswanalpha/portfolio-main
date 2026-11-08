"use client";

import { useCallback, useSyncExternalStore } from "react";

// One MediaQueryList per query string, shared by every subscriber, instead of
// a new matchMedia() object on each snapshot read.
const lists = new Map<string, MediaQueryList>();

function getList(query: string): MediaQueryList {
  let list = lists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    lists.set(query, list);
  }
  return list;
}

const getServerSnapshot = () => false;

/**
 * Reactive matchMedia via useSyncExternalStore. Hydration-safe: the server
 * render and the hydration pass both use the server snapshot (`false`), then
 * React re-renders with the real value. No state is set in an effect.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = getList(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => getList(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
