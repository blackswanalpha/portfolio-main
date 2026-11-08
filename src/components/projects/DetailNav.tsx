"use client";

import { Box, Grid, Heading, HStack, LinkBox, LinkOverlay, Text } from "@chakra-ui/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

/** "← All projects" style link back to an index page. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Box mb={6}>
            <Link href={href}>
                <HStack
                    as="span"
                    display="inline-flex"
                    gap={2}
                    textStyle="label"
                    color="text.secondary"
                    transitionProperty="color"
                    transitionDuration="fast"
                    _hover={{ color: "primary.600" }}
                    _active={{ color: "primary.700" }}
                >
                    <LuArrowLeft size={16} aria-hidden="true" /> {children}
                </HStack>
            </Link>
        </Box>
    );
}

/** Accent text link with a trailing arrow ("All projects →"). */
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href}>
            <HStack
                as="span"
                gap={1.5}
                fontSize="sm"
                fontWeight={600}
                color="primary.600"
                whiteSpace="nowrap"
                transitionProperty="color"
                transitionDuration="fast"
                _hover={{ color: "primary.700" }}
            >
                <Text as="span">{children}</Text>
                <LuArrowRight size={16} aria-hidden="true" />
            </HStack>
        </Link>
    );
}

export type PagerTarget = { href: string; title: string } | null;

/** Previous / next strip at the end of a detail page. */
export function Pager({
    prev,
    next,
    label,
    prevLabel = "Previous",
    nextLabel = "Next",
}: {
    prev: PagerTarget;
    next: PagerTarget;
    label: string;
    prevLabel?: string;
    nextLabel?: string;
}) {
    return (
        <Grid
            as="nav"
            aria-label={label}
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            borderWidth="1px"
            borderColor="border"
            rounded="2xl"
            overflow="hidden"
            bg="surface"
        >
            {prev ? <PagerCell target={prev} kicker={prevLabel} isNext={false} /> : <Box display={{ base: "none", md: "block" }} />}
            {next ? <PagerCell target={next} kicker={nextLabel} isNext /> : <Box display={{ base: "none", md: "block" }} />}
        </Grid>
    );
}

function PagerCell({ target, kicker, isNext }: { target: { href: string; title: string }; kicker: string; isNext: boolean }) {
    return (
        <LinkBox
            className="group"
            p={{ base: 6, md: 8 }}
            textAlign={isNext ? "right" : "left"}
            borderColor="border"
            borderRightWidth={isNext ? 0 : { base: 0, md: "1px" }}
            borderBottomWidth={isNext ? 0 : { base: "1px", md: 0 }}
            transitionProperty="background-color"
            transitionDuration="fast"
            _hover={{ bg: "blackAlpha.50" }}
            _focusWithin={{ bg: "blackAlpha.50" }}
        >
            <HStack gap={2} justify={isNext ? "flex-end" : "flex-start"} textStyle="meta" color="text.muted" mb={2}>
                {!isNext && <LuArrowLeft size={14} aria-hidden="true" />}
                <Text>{kicker}</Text>
                {isNext && <LuArrowRight size={14} aria-hidden="true" />}
            </HStack>
            <Heading
                as="h3"
                textStyle="cardTitle"
                color="text.primary"
                transitionProperty="color"
                transitionDuration="fast"
                _groupHover={{ color: "primary.600" }}
            >
                <LinkOverlay asChild>
                    <Link href={target.href}>{target.title}</Link>
                </LinkOverlay>
            </Heading>
        </LinkBox>
    );
}
