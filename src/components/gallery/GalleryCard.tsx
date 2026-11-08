"use client";

import { Box, Center, Flex, Heading, Image, LinkBox, LinkOverlay, Skeleton, Text } from "@chakra-ui/react";
import Link from "next/link";
import { LuArrowRight, LuPlay } from "react-icons/lu";
import { mediaUrl, type GalleryItem } from "@/lib/api";
import { CARD_HOVER } from "@/components/projects/ProjectCard";
import { TYPE_META, galleryYear } from "./shared";

/* Deterministic bar heights (percent): no Math.random, so SSR markup matches. */
const BAR_HEIGHTS = [34, 58, 42, 72, 50, 64, 38, 76, 46, 60, 40, 68, 52, 44, 70, 36];

/** Static waveform used as cover art for audio without a thumbnail. */
export function Soundwave({ bars = 16 }: { bars?: number }) {
    return (
        <Flex align="center" justify="center" gap={1.5} w="full" h="full" bg="primary.600" aria-hidden="true">
            {BAR_HEIGHTS.slice(0, bars).map((h, i) => (
                <Box key={i} w="4px" h={`${h * 0.6}%`} bg="white/70" rounded="full" />
            ))}
        </Flex>
    );
}

function PlayBadge() {
    return (
        <Center position="absolute" inset={0} pointerEvents="none" aria-hidden="true">
            <Center boxSize={12} rounded="md" bg="white" color="primary.600" boxShadow="0 2px 8px rgba(15, 23, 42, 0.18)">
                <LuPlay size={20} style={{ marginLeft: 2 }} />
            </Center>
        </Center>
    );
}

function CardMedia({ item, mini }: { item: GalleryItem; mini: boolean }) {
    const poster = mediaUrl(item.thumbnail_url);
    const src = mediaUrl(item.media_url);

    // Mini cards keep a uniform 4/3 crop so related rows stay tidy.
    if (mini) {
        const cover = item.media_type === "image" ? src : poster;
        return (
            <Box position="relative" overflow="hidden" aspectRatio={4 / 3} bg="primary.50">
                {cover ? (
                    <Image src={cover} alt="" loading="lazy" objectFit="cover" w="full" h="full" />
                ) : item.media_type === "audio" ? (
                    <Soundwave bars={10} />
                ) : (
                    <Box w="full" h="full" bg="primary.800" />
                )}
                {item.media_type !== "image" && <PlayBadge />}
            </Box>
        );
    }

    if (item.media_type === "video") {
        return (
            <Box position="relative" overflow="hidden" aspectRatio={16 / 9} bg="primary.800">
                {poster ? <Image src={poster} alt="" loading="lazy" objectFit="cover" w="full" h="full" /> : null}
                <PlayBadge />
            </Box>
        );
    }

    if (item.media_type === "audio") {
        // Album-cover square.
        return (
            <Box position="relative" overflow="hidden" aspectRatio={1} bg="primary.600">
                {poster ? <Image src={poster} alt="" loading="lazy" objectFit="cover" w="full" h="full" /> : <Soundwave />}
                <PlayBadge />
            </Box>
        );
    }

    // Image pieces keep their natural aspect; that's what gives the wall its rhythm.
    return (
        <Box position="relative" overflow="hidden" bg="primary.50">
            <Image src={src} alt={item.title} loading="lazy" w="full" h="auto" display="block" />
        </Box>
    );
}

export function GalleryCard({ item, variant = "wall" }: { item: GalleryItem; variant?: "wall" | "mini" }) {
    const mini = variant === "mini";
    const meta = TYPE_META[item.media_type];
    const year = galleryYear(item);

    return (
        <LinkBox
            as="article"
            className="group"
            display="block"
            css={{ breakInside: "avoid" }}
            mb={mini ? 0 : 8}
            bg="surface"
            rounded="2xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="border"
            transitionProperty="border-color, box-shadow"
            transitionDuration="moderate"
            transitionTimingFunction="ease-out"
            _hover={CARD_HOVER}
            _focusWithin={CARD_HOVER}
        >
            <CardMedia item={item} mini={mini} />

            <Flex direction="column" p={mini ? 4 : 5} gap={1.5}>
                <Flex align="center" gap={1.5} textStyle="meta" color="text.muted">
                    <meta.icon size={14} aria-hidden="true" />
                    <Text as="span">
                        {item.category || meta.label}
                        {year && ` · ${year}`}
                    </Text>
                </Flex>
                <Flex align="center" justify="space-between" gap={3}>
                    <Heading
                        as="h3"
                        textStyle="cardTitle"
                        color="text.primary"
                        transitionProperty="color"
                        transitionDuration="fast"
                        _groupHover={{ color: "primary.600" }}
                    >
                        <LinkOverlay asChild>
                            <Link href={`/gallery/${encodeURIComponent(item.slug)}`}>{item.title}</Link>
                        </LinkOverlay>
                    </Heading>
                    <Box color="primary.500" flexShrink={0} aria-hidden="true">
                        <LuArrowRight size={16} />
                    </Box>
                </Flex>
            </Flex>
        </LinkBox>
    );
}

/** Wall placeholder: same frame as a card, with a media block of the given height. */
export function GalleryCardSkeleton({ mediaH }: { mediaH: string | number }) {
    return (
        <Box
            css={{ breakInside: "avoid" }}
            mb={8}
            bg="surface"
            rounded="2xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="border"
            aria-hidden="true"
        >
            <Skeleton h={mediaH} rounded="none" />
            <Flex direction="column" p={5} gap={2}>
                <Skeleton h="4" w="28" />
                <Skeleton h="6" w="70%" />
            </Flex>
        </Box>
    );
}
