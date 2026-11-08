"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Reference-counted body scroll lock shared by every overlay (mobile menu,
 * review drawer, chat panel, win modal).
 *
 *   const release = lockScroll(); // take a lock
 *   release();                    // idempotent; the last release unlocks
 *   useScrollLock(active);        // hook form: held while `active`, released on unmount
 *   resetScrollLocks();           // force-release every lock (route changes)
 *   useScrollLockRouteReset();    // calls resetScrollLocks() on each route change; mount once at the root
 *
 * The first lock sets `overflow: hidden` on <body>, which keeps the scroll
 * position. The layout keeps its width: if the browser supports
 * `scrollbar-gutter`, <html> reserves the scrollbar gutter (so fixed elements
 * stay put too). Otherwise <body> gets padding equal to the scrollbar width.
 * The last release restores the exact inline styles from before the first lock.
 */

interface SavedStyles {
  overflow: string;
  paddingRight: string;
  scrollbarGutter: string;
}

let lockCount = 0;
// Bumped by resetScrollLocks() so releases from locks taken before a reset
// cannot decrement the count of locks taken after it.
let generation = 0;
let saved: SavedStyles | null = null;

function supportsScrollbarGutter(): boolean {
  return typeof CSS !== "undefined" && CSS.supports?.("scrollbar-gutter", "stable") === true;
}

function applyLock() {
  const { body, documentElement: html } = document;
  const gap = window.innerWidth - html.clientWidth;
  saved = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
    scrollbarGutter: html.style.scrollbarGutter,
  };
  if (gap > 0) {
    if (supportsScrollbarGutter()) {
      html.style.scrollbarGutter = "stable";
    } else {
      const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + gap}px`;
    }
  }
  body.style.overflow = "hidden";
}

function restoreStyles() {
  if (!saved) return;
  const { body, documentElement: html } = document;
  body.style.overflow = saved.overflow;
  body.style.paddingRight = saved.paddingRight;
  html.style.scrollbarGutter = saved.scrollbarGutter;
  saved = null;
}

/** Take a scroll lock. Returns its release function (safe to call more than once). */
export function lockScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  if (lockCount === 0) applyLock();
  lockCount++;

  const owner = generation;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (owner !== generation) return; // already released by a reset
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) restoreStyles();
  };
}

/** Release every lock at once and restore the page styles. */
export function resetScrollLocks(): void {
  if (typeof document === "undefined") return;
  generation++;
  lockCount = 0;
  restoreStyles();
}

/** Lock body scroll while `active` is true; always released on unmount. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    return lockScroll();
  }, [active]);
}

/**
 * Safety net: an overlay that forgets to release cannot keep the next page
 * locked. Overlays that live across routes (the chat panel) close on navigation.
 */
export function useScrollLockRouteReset() {
  const pathname = usePathname();
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    resetScrollLocks();
  }, [pathname]);
}
