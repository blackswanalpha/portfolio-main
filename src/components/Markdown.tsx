"use client";

import { Box } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { ComponentPropsWithoutRef } from "react";

// Markdown headings start one level below the page's own h1.
// react-markdown passes a `node` prop that must not reach the DOM.
type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";
function demoteTo(Tag: HeadingTag) {
    return function DemotedHeading({ node, ...props }: ComponentPropsWithoutRef<"h2"> & { node?: unknown }) {
        void node;
        return <Tag {...props} />;
    };
}

const DEMOTED_HEADINGS: Components = {
    h1: demoteTo("h2"),
    h2: demoteTo("h3"),
    h3: demoteTo("h4"),
    h4: demoteTo("h5"),
    h5: demoteTo("h6"),
    h6: demoteTo("h6"),
};

/**
 * Renders markdown (GitHub-flavored) with typography that matches the site.
 * Styling is applied via descendant selectors so we don't have to map every
 * element to a Chakra component (and so react-markdown's `node` prop never
 * reaches the DOM). Headings follow the site scale: Fraunces 600 for the two
 * top levels, Space Grotesk 600 below; nothing heavier than 600, no italics.
 */
export default function Markdown({ children }: { children: string }) {
    return (
        <Box
            className="markdown-body"
            color="text.secondary"
            fontSize={{ base: "md", md: "lg" }}
            lineHeight="1.75"
            css={{
                "& h1, & h2, & h3, & h4, & h5, & h6": {
                    color: "var(--chakra-colors-text-primary)",
                    fontWeight: 600,
                    lineHeight: 1.25,
                    marginBottom: "0.75rem",
                },
                // Space above a heading only when something precedes it, so a
                // leading heading sits flush (sibling combinator, SSR-safe).
                "& * + h1, & * + h2, & * + h3, & * + h4, & * + h5, & * + h6": { marginTop: "2.25rem" },
                "& h1, & h2": {
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    letterSpacing: "-0.015em",
                },
                "& h1": { fontSize: "1.875rem" },
                "& h2": { fontSize: "1.5rem" },
                "& h3": { fontSize: "1.25rem" },
                "& h4, & h5, & h6": { fontSize: "1.0625rem" },
                "& p": { marginBottom: "1.25rem" },
                "& strong": { fontWeight: 600, color: "var(--chakra-colors-text-primary)" },
                "& a": {
                    color: "var(--chakra-colors-primary-600)",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    textDecorationThickness: "1px",
                    transition: "color 0.15s ease-out",
                },
                "& a:hover": { color: "var(--chakra-colors-primary-700)" },
                "& ul, & ol": { paddingLeft: "1.5rem", marginBottom: "1.25rem" },
                "& ul": { listStyleType: "disc" },
                "& ol": { listStyleType: "decimal" },
                "& li": { marginBottom: "0.4rem" },
                "& li::marker": { color: "var(--chakra-colors-text-muted)" },
                "& blockquote": {
                    borderLeft: "2px solid rgba(15, 23, 42, 0.12)",
                    paddingLeft: "1rem",
                    margin: "1.5rem 0",
                    color: "var(--chakra-colors-text-primary)",
                },
                "& code": {
                    fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
                    fontSize: "0.875em",
                    background: "rgba(15, 23, 42, 0.05)",
                    padding: "0.15em 0.4em",
                    borderRadius: "6px",
                },
                "& pre": {
                    background: "rgba(15, 23, 42, 0.04)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    padding: "1rem",
                    borderRadius: "6px",
                    overflowX: "auto",
                    marginBottom: "1.25rem",
                    lineHeight: 1.6,
                },
                "& pre code": { background: "transparent", padding: 0 },
                "& img": {
                    maxWidth: "100%",
                    borderRadius: "6px",
                    margin: "1.5rem 0",
                },
                "& hr": {
                    border: "none",
                    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                    margin: "2.5rem 0",
                },
                "& table": {
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "1.25rem",
                    fontVariantNumeric: "tabular-nums",
                    fontSize: "0.9375em",
                },
                "& th, & td": {
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    padding: "0.5rem 0.75rem",
                    textAlign: "left",
                },
                "& th": { fontWeight: 600, color: "var(--chakra-colors-text-primary)" },
            }}
        >
            {/* The page already owns the h1 (post or project title), so Markdown
                headings start one level down: `#` renders as h2, `##` as h3… */}
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={DEMOTED_HEADINGS}>
                {children}
            </ReactMarkdown>
        </Box>
    );
}
