"use client";

import { Box, type BoxProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface PageWrapperProps {
    children: ReactNode;
    className?: string;
}

/**
 * Page root. It used to fade the whole page in from opacity 0 and out again on
 * route change, which hid above-the-fold content (and the LCP element) until
 * JS ran and delayed every navigation by the exit fade. It is now a plain
 * wrapper. A page opts into its one entrance with <PageEntrance>.
 */
export default function PageWrapper({ children, className }: PageWrapperProps) {
    return <div className={className}>{children}</div>;
}

/**
 * The single entrance a page gets: an 8px rise, transform only. Content is
 * fully visible from the first paint (opacity never changes), it runs in CSS
 * so it never waits on JS, and it is off under prefers-reduced-motion.
 *
 * Wrap the main content, not the Navbar: a translate creates a containing
 * block, so a position:fixed descendant would ride along while it runs.
 */
export function PageEntrance(props: BoxProps) {
    return (
        <Box
            _motionSafe={{
                animationName: "slide-from-bottom",
                animationDuration: "0.45s",
                animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            {...props}
        />
    );
}
