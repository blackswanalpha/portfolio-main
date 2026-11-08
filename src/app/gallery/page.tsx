"use client";

import { Box, Button, Container, Flex, Heading, HStack, Skeleton, Text, chakra } from "@chakra-ui/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LuImage } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper, { PageEntrance } from "@/components/PageWrapper";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { type GalleryItem, type Paginated } from "@/lib/api";
import { GalleryCard, GalleryCardSkeleton } from "@/components/gallery/GalleryCard";

const GALLERY_PATH = "/gallery/?page_size=100";

const FILTERS = [
    { key: "all", label: "All work" },
    { key: "image", label: "Art" },
    { key: "video", label: "Videos" },
    { key: "audio", label: "Music" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

/** Media heights for the loading wall, so it has the masonry rhythm of the real one. */
const SKELETON_HEIGHTS = ["72", "56", "64", "48", "60", "52"];

export default function GalleryPage() {
    const { data, error, loading, refreshing, reload } = useApi<Paginated<GalleryItem>>(GALLERY_PATH);
    const [filter, setFilter] = useState<FilterKey>("all");

    const items = useMemo(() => data?.items ?? [], [data]);

    const counts = useMemo(() => {
        const c: Record<FilterKey, number> = { all: items.length, image: 0, video: 0, audio: 0 };
        for (const item of items) c[item.media_type] += 1;
        return c;
    }, [items]);

    const filtered = useMemo(() => (filter === "all" ? items : items.filter((i) => i.media_type === filter)), [items, filter]);

    const ready = !loading && !error && data !== undefined;

    return (
        <PageWrapper>
            <Box minH="100vh" bg="background">
                <Navbar />

                <PageEntrance as="main">
                    <Container maxW="7xl" pt={{ base: 32, md: 40 }} pb={20} px={{ base: 4, sm: 6, lg: 8 }}>
                        {/* Masthead */}
                        <Box borderBottomWidth="1px" borderColor="border" pb={{ base: 8, md: 10 }} mb={{ base: 6, md: 8 }}>
                            <Flex
                                direction={{ base: "column", md: "row" }}
                                justify="space-between"
                                align={{ base: "flex-start", md: "flex-end" }}
                                gap={6}
                            >
                                <Box>
                                    <Heading as="h1" textStyle="pageTitle" color="text.primary">
                                        AI art gallery
                                    </Heading>
                                    <Text textStyle="lead" color="text.secondary" maxW="2xl" mt={4}>
                                        A living collection of my generative work — music, video, and visual art created with AI.
                                    </Text>
                                </Box>
                                {/* Fixed height so the counts don't shift the masthead when they arrive. */}
                                <Box minH="5" flexShrink={0}>
                                    {ready ? (
                                        <Text textStyle="meta" color="text.muted">
                                            {counts.all} {counts.all === 1 ? "piece" : "pieces"} · {counts.image} art · {counts.video} video ·{" "}
                                            {counts.audio} music
                                        </Text>
                                    ) : loading ? (
                                        <Skeleton h="4" w="56" />
                                    ) : null}
                                </Box>
                            </Flex>
                        </Box>

                        {/* Medium filter */}
                        <HStack
                            role="group"
                            aria-label="Filter by medium"
                            className="no-scrollbar"
                            overflowX="auto"
                            gap={6}
                            mb={{ base: 10, md: 14 }}
                            pb={1}
                        >
                            {FILTERS.map((f) => {
                                const active = filter === f.key;
                                return (
                                    <chakra.button
                                        key={f.key}
                                        type="button"
                                        onClick={() => setFilter(f.key)}
                                        aria-pressed={active}
                                        position="relative"
                                        flexShrink={0}
                                        display="inline-flex"
                                        alignItems="baseline"
                                        gap={1.5}
                                        py={1.5}
                                        fontSize="sm"
                                        fontWeight={active ? 600 : 500}
                                        color={active ? "primary.600" : "text.secondary"}
                                        cursor="pointer"
                                        rounded="sm"
                                        transitionProperty="color"
                                        transitionDuration="fast"
                                        _hover={{ color: "primary.600" }}
                                        _active={{ color: "primary.700" }}
                                        _after={{
                                            content: '""',
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            height: "2px",
                                            bg: "primary.500",
                                            transform: active ? "scaleX(1)" : "scaleX(0)",
                                            transformOrigin: "left",
                                            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                                        }}
                                    >
                                        {f.label}
                                        {/* Always rendered (blank while loading) so the tabs keep their width. */}
                                        <Text as="span" textStyle="meta" fontSize="xs" color="text.muted" minW="2ch">
                                            {ready ? counts[f.key] : ""}
                                        </Text>
                                    </chakra.button>
                                );
                            })}
                        </HStack>

                        {/* Wall */}
                        {loading ? (
                            <Box className="columns-1 sm:columns-2 lg:columns-3 gap-8" aria-busy="true" aria-label="Loading the gallery">
                                {SKELETON_HEIGHTS.map((h, i) => (
                                    <GalleryCardSkeleton key={i} mediaH={h} />
                                ))}
                            </Box>
                        ) : error ? (
                            <ErrorState
                                title="Couldn't load the gallery"
                                description={errorMessage(error)}
                                onRetry={reload}
                                retrying={refreshing}
                            />
                        ) : items.length === 0 ? (
                            <EmptyState
                                icon={<LuImage />}
                                title="No pieces yet"
                                description="New work will appear here when it's published."
                                action={
                                    <Button asChild size="sm" variant="outline" rounded="md">
                                        <Link href="/projects">Browse projects</Link>
                                    </Button>
                                }
                            />
                        ) : filtered.length === 0 ? (
                            <EmptyState
                                icon={<LuImage />}
                                title="Nothing in this category yet"
                                description="Try another medium."
                                action={
                                    <Button onClick={() => setFilter("all")} size="sm" variant="outline" rounded="md">
                                        View all work
                                    </Button>
                                }
                            />
                        ) : (
                            <Box className="columns-1 sm:columns-2 lg:columns-3 gap-8">
                                {filtered.map((item) => (
                                    <GalleryCard key={item.id} item={item} />
                                ))}
                            </Box>
                        )}
                    </Container>
                </PageEntrance>

                <Footer />
            </Box>
        </PageWrapper>
    );
}
