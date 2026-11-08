"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import {
  getRecordsSnapshot,
  getServerRecordsSnapshot,
  subscribeRecords,
  type Records,
} from "@/lib/arcade/records";
import { getServerSoundSnapshot, getSoundSnapshot, subscribeSound } from "@/lib/arcade/sound";

/**
 * requestAnimationFrame loop for a game canvas. `frame(dt, time)` gets the
 * seconds since the previous frame, clamped to 50ms so a stall or a return
 * from a background tab never produces one giant step.
 *
 * The loop only runs while `active`, while the tab is visible and while
 * `observeRef` (if given) is on screen. Start and stop are idempotent, so
 * Strict Mode's double effect run never leaves a second loop behind. The
 * latest `frame` is always used without restarting the loop.
 */
export function useGameLoop(
  frame: (dt: number, time: number) => void,
  active: boolean,
  observeRef?: RefObject<Element | null>,
) {
  const frameRef = useRef(frame);
  useEffect(() => {
    frameRef.current = frame;
  });

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = -1;
    let disposed = false;
    let visible = !document.hidden;
    let onScreen = true;

    const loop = (now: number) => {
      raf = 0;
      if (disposed) return;
      const dt = last < 0 ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now;
      frameRef.current(dt, now / 1000);
      schedule();
    };
    const schedule = () => {
      if (!raf && !disposed && visible && onScreen) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = -1;
    };
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) schedule();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let io: IntersectionObserver | null = null;
    const target = observeRef?.current;
    if (target && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        if (onScreen) schedule();
        else stop();
      });
      io.observe(target);
    }

    schedule();
    return () => {
      disposed = true;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [active, observeRef]);
}

/** Content-box width of an element, tracked with a ResizeObserver (0 before the first measure). */
export function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[entries.length - 1].contentRect.width);
      setWidth((prev) => (prev === w ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

/**
 * True for `ms` after mount. A result card or menu unmounts as soon as its
 * button is clicked, so the second click of a double-click lands on the view
 * that replaced it (a tile, a level card, the playfield). Views that act on
 * clicks ignore that second click with this guard.
 */
export function useMountGuard(ms = 300): () => boolean {
  const mountedAt = useRef(Number.POSITIVE_INFINITY);
  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);
  return useCallback(() => performance.now() - mountedAt.current < ms, [ms]);
}

export function useRecords(): Records {
  return useSyncExternalStore(subscribeRecords, getRecordsSnapshot, getServerRecordsSnapshot);
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(subscribeSound, getSoundSnapshot, getServerSoundSnapshot);
}
