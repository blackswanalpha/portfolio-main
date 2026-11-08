"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollLockRouteReset } from "@/lib/scrollLock";

/**
 * Drives the custom themed scrollbar defined in globals.css. Mounted once in
 * the root provider. Renders nothing; it animates two CSS variables on <html>:
 *  - `--sb-progress` (0->1) follows scroll position via ONE ScrollTrigger on
 *    <body>, tinting the thumb within the blue palette. Page height changes
 *    (client navigation, late content) refresh that trigger instead of adding
 *    new ones.
 *  - `--sb-alpha` eases up while scrolling and back down when idle (GSAP
 *    `quickTo`). The scroll listener uses the capture phase so it also fires for
 *    inner scroll containers (e.g. the admin `<main>` panel).
 *
 * Everything runs inside `gsap.matchMedia()` for no-preference motion: turning
 * on reduced motion (or unmounting) kills the trigger and tweens and removes
 * the inline variables, so the stylesheet defaults apply and the thumb is never
 * left at the boosted opacity.
 *
 * It also hosts the scroll-lock route reset (see lib/scrollLock.ts).
 */
const IDLE_ALPHA = 0.3;
const ACTIVE_ALPHA = 0.78;
const IDLE_DELAY_MS = 900;

export default function ScrollbarController() {
  useScrollLockRouteReset();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = document.documentElement;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let active = true;

      const trigger = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (active) root.style.setProperty("--sb-progress", self.progress.toFixed(4));
        },
      });

      // Ease the thumb opacity through a proxy object so we don't depend on
      // GSAP's CSS-variable handling.
      const alpha = { v: IDLE_ALPHA };
      const tweenAlpha = gsap.quickTo(alpha, "v", {
        duration: 0.4,
        ease: "power2.out",
        onUpdate: () => {
          if (active) root.style.setProperty("--sb-alpha", alpha.v.toFixed(3));
        },
      });

      let idleTimer: number | undefined;
      const reveal = () => {
        tweenAlpha(ACTIVE_ALPHA);
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => tweenAlpha(IDLE_ALPHA), IDLE_DELAY_MS);
      };
      document.addEventListener("scroll", reveal, { capture: true, passive: true });

      // The observer also fires once right away, which replaces the initial
      // post-mount refresh.
      let frame = 0;
      const observer = new ResizeObserver(() => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          trigger.refresh();
        });
      });
      observer.observe(document.body);

      return () => {
        active = false;
        cancelAnimationFrame(frame);
        observer.disconnect();
        document.removeEventListener("scroll", reveal, { capture: true });
        window.clearTimeout(idleTimer);
        gsap.killTweensOf(alpha);
        root.style.removeProperty("--sb-alpha");
        root.style.removeProperty("--sb-progress");
      };
    });

    // Kills the ScrollTrigger and quickTo tween created above, then runs the
    // cleanup returned from mm.add.
    return () => mm.revert();
  }, []);

  return null;
}
