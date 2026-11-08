"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";

interface Entry<T> {
  /** The request key (path + reload counter) this entry belongs to. */
  key: string;
  data?: T;
  error?: Error;
}

export interface ApiQuery<T> {
  /** Data for the CURRENT path only. Never the previous path's data. */
  data: T | undefined;
  /** Error for the current path (ApiError carries `.status`). */
  error: Error | undefined;
  /** True until the current path has resolved (first load or after the path changed). */
  loading: boolean;
  /** True while a background re-fetch runs with data already on screen. */
  refreshing: boolean;
  /** 404 from the API — render a not-found state rather than a generic error. */
  notFound: boolean;
  /** Re-fetch the current path (retry button, after a mutation). */
  reload: () => void;
  /** Patch the current data locally (optimistic update / apply a mutation response). */
  setData: (update: T | ((prev: T | undefined) => T | undefined)) => void;
}

/**
 * Race-safe GET for client components.
 *
 * - State is keyed by path, so a response for an old path (fast filter/route
 *   switching) can never overwrite the current one, and a path change never
 *   shows the previous entity's data while the new one loads.
 * - Superseded requests are aborted.
 * - `revalidateOnFocus` re-fetches when the tab becomes visible again, so a
 *   change made elsewhere (another tab, the admin) is picked up without a reload.
 * - Pass `null` as the path to skip fetching (e.g. until a param is known).
 *
 * setState only happens in async callbacks, which keeps the React Compiler /
 * react-hooks/set-state-in-effect lint rule satisfied.
 */
export function useApi<T>(
  path: string | null,
  options: { revalidateOnFocus?: boolean } = {},
): ApiQuery<T> {
  const { revalidateOnFocus = false } = options;
  const [reloadCount, setReloadCount] = useState(0);
  const [entry, setEntry] = useState<Entry<T> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const key = path === null ? null : `${path}#${reloadCount}`;
  const pathRef = useRef(path);
  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  useEffect(() => {
    if (path === null || key === null) return;
    const controller = new AbortController();
    api
      .get<T>(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setEntry({ key, data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setEntry({ key, error: error instanceof Error ? error : new Error(String(error)) });
      })
      .finally(() => {
        if (!controller.signal.aborted) setRefreshing(false);
      });
    return () => controller.abort();
  }, [path, key]);

  const reload = useCallback(() => {
    setRefreshing(true);
    setReloadCount((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!revalidateOnFocus) return;
    const onVisible = () => {
      if (document.visibilityState === "visible" && pathRef.current !== null) reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [revalidateOnFocus, reload]);

  // While a reload for the same path is in flight, keep showing the last data
  // for that path (background refresh) instead of flashing a loader.
  const samePath = entry !== null && path !== null && entry.key.startsWith(`${path}#`);
  const current = entry && entry.key === key ? entry : samePath && refreshing ? entry : null;

  const setData = useCallback(
    (update: T | ((prev: T | undefined) => T | undefined)) => {
      setEntry((prev) => {
        if (!prev) return prev;
        const next =
          typeof update === "function"
            ? (update as (p: T | undefined) => T | undefined)(prev.data)
            : update;
        return { ...prev, data: next, error: undefined };
      });
    },
    [],
  );

  const error = current?.error;
  return {
    data: current?.data,
    error,
    loading: path !== null && current === null,
    refreshing: refreshing && current !== null,
    notFound: error instanceof ApiError && error.status === 404,
    reload,
    setData,
  };
}
