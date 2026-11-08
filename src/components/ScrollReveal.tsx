"use client";

import type { Transition, Variant } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    /** @deprecated Ignored. Content is no longer hidden until scrolled into view. */
    variants?: {
        hidden: Variant;
        visible: Variant;
    };
    /** @deprecated Ignored. */
    transition?: Transition;
}

/**
 * Formerly hid its children (opacity 0, 75px down) until an IntersectionObserver
 * saw them. Anything already above the viewport on load, or skipped by an
 * anchor jump, never intersected and stayed invisible. It now renders its
 * children as-is; the page's one entrance comes from <PageEntrance>.
 */
export default function ScrollReveal({ children, width = "fit-content" }: ScrollRevealProps) {
    return <div style={{ position: "relative", width }}>{children}</div>;
}
