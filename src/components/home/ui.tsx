"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { Box, HStack, Skeleton, type ButtonProps, type SkeletonProps, type SystemStyleObject } from "@chakra-ui/react";
import { LuArrowRight, LuArrowUpRight, LuStar } from "react-icons/lu";

/* Shared building blocks for the home page sections. Soft surfaces, one 6px
   radius everywhere ("md"), one accent, neutral offset shadows, no glow. */

export const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

/** The one load entrance: a short fade and 8px rise, staggered by index. Pure CSS, so it never depends on JS. */
export function entrance(index: number): SystemStyleObject {
    return {
        animation: `fade-in 520ms ${EASE_OUT} both, slide-from-bottom 520ms ${EASE_OUT} both`,
        animationDelay: `${Math.min(index, 6) * 70}ms`,
        _motionReduce: { animation: "none" },
    };
}

const controlBase: ButtonProps = {
    h: "11",
    px: "5",
    borderRadius: "md",
    fontWeight: "500",
    fontSize: "md",
    whiteSpace: "nowrap",
    gap: "2",
    focusRingColor: "primary.500",
    transition: `background-color 160ms ${EASE_OUT}, border-color 160ms ${EASE_OUT}, color 160ms ${EASE_OUT}, transform 120ms ${EASE_OUT}`,
    _active: { transform: "translateY(1px)" },
    _disabled: { opacity: 0.6, cursor: "not-allowed", transform: "none" },
};

export const primaryButton: ButtonProps = {
    ...controlBase,
    bg: "primary.500",
    color: "white",
    _hover: { bg: "primary.600" },
    _active: { bg: "primary.700", transform: "translateY(1px)" },
};

export const secondaryButton: ButtonProps = {
    ...controlBase,
    bg: "surface",
    color: "text.primary",
    borderWidth: "1px",
    borderColor: "border",
    shadow: "xs",
    _hover: { borderColor: "primary.300", color: "primary.600" },
    _active: { bg: "primary.50", transform: "translateY(1px)" },
};

/** Card surface: 6px radius ("md"), neutral offset shadow (Chakra's shadow tokens carry a hairline ring). */
export const card: SystemStyleObject = {
    bg: "surface",
    borderRadius: "md",
    shadow: "sm",
};

/** Plain text link with a trailing arrow; for in-site routes use `href` starting with "/". */
export function ArrowLink({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
    const Icon = external ? LuArrowUpRight : LuArrowRight;
    const content = (
        <>
            {children}
            <Icon aria-hidden="true" />
        </>
    );
    const style: SystemStyleObject = {
        display: "inline-flex",
        alignItems: "center",
        gap: "1.5",
        color: "primary.600",
        fontWeight: "500",
        whiteSpace: "nowrap",
        textDecoration: "underline",
        textDecorationColor: "transparent",
        textUnderlineOffset: "4px",
        borderRadius: "md",
        transition: `text-decoration-color 160ms ${EASE_OUT}, color 160ms ${EASE_OUT}`,
        _hover: { color: "primary.700", textDecorationColor: "currentColor" },
        _active: { color: "primary.800" },
        "& svg": { transition: `transform 160ms ${EASE_OUT}` },
        "&:hover svg": { transform: external ? "translate(1px, -1px)" : "translateX(2px)" },
    };
    if (external || !href.startsWith("/")) {
        return (
            <Box asChild css={style}>
                <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {content}
                </a>
            </Box>
        );
    }
    return (
        <Box asChild css={style}>
            <NextLink href={href}>{content}</NextLink>
        </Box>
    );
}

/** Five stars, filled up to `rating`, in the text colour. */
export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
    const rounded = Math.max(0, Math.min(5, Math.round(rating)));
    return (
        <HStack gap="0.5" color="text.primary" role="img" aria-label={`Rated ${rounded} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Box
                    key={n}
                    as="span"
                    display="inline-flex"
                    // Filled stars gold (#b7791f, >=3:1 on white so it reads); empty stay grey.
                    color={n <= rounded ? "#b7791f" : "gray.300"}
                    css={{ "& svg": { fill: n <= rounded ? "currentColor" : "none" } }}
                    aria-hidden="true"
                >
                    <LuStar size={size} strokeWidth={1.75} />
                </Box>
            ))}
        </HStack>
    );
}

/** Loading block. The pulse is functional and stops under reduced motion. */
export function Placeholder(props: SkeletonProps) {
    return <Skeleton variant="pulse" borderRadius="md" css={{ _motionReduce: { animation: "none" } }} {...props} />;
}

const LOOPBACK = /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0)$/i;

/**
 * Props for backend media in next/image. Next 16's optimizer refuses local IP
 * hosts (images.dangerouslyAllowLocalIP is off) and any host missing from
 * remotePatterns, so those are served as-is instead of breaking.
 */
export function backendImage(url: string): { src: string; unoptimized: boolean } {
    try {
        const { hostname } = new URL(url);
        const allowed = hostname === "lh3.googleusercontent.com" || hostname === "images.unsplash.com";
        return { src: url, unoptimized: LOOPBACK.test(hostname) || !allowed };
    } catch {
        return { src: url, unoptimized: true };
    }
}
