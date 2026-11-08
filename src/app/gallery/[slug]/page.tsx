"use client";

import { Box, Button, Container, Flex, Grid, Heading, Image, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { LuArrowLeft, LuImage } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper, { PageEntrance } from "@/components/PageWrapper";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { mediaUrl, type GalleryItem, type Paginated } from "@/lib/api";
import { GalleryCard, Soundwave } from "@/components/gallery/GalleryCard";
import { TYPE_META, formatMonth } from "@/components/gallery/shared";
import { ArrowLink, BackLink, Pager } from "@/components/projects/DetailNav";

const GALLERY_PATH = "/gallery/?page_size=100";

const SpecLabel = ({ children }: { children: ReactNode }) => (
    <Text textStyle="label" color="text.muted" mb={1.5}>
        {children}
    </Text>
);

function decodeSlug(raw: string | string[] | undefined): string | null {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) return null;
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

/**
 * Stop and release a media element when it unmounts. A detached <video> or
 * <audio> that was playing keeps playing (and buffering) until it is garbage
 * collected. A source change on a mounted element needs nothing: the browser
 * drops the old source itself.
 *
 * Only a real unmount releases: React detaches the node before passive
 * cleanups run, while Strict Mode's simulated unmount leaves it in the
 * document (releasing then would strip the src for good).
 */
function useReleaseMedia<T extends HTMLMediaElement>() {
    const ref = useRef<T>(null);
    useEffect(() => {
        const el = ref.current;
        return () => {
            if (!el || el.isConnected) return;
            el.pause();
            el.removeAttribute("src");
            el.load();
        };
    }, []);
    return ref;
}

function VideoStage({ src, poster }: { src: string; poster: string }) {
    const ref = useReleaseMedia<HTMLVideoElement>();
    return (
        <Box overflow="hidden" rounded="2xl" borderWidth="1px" borderColor="border" bg="black" aspectRatio={16 / 9}>
            <video
                ref={ref}
                controls
                preload="metadata"
                poster={poster || undefined}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                src={src}
            />
        </Box>
    );
}

function AudioStage({ item, src, poster }: { item: GalleryItem; src: string; poster: string }) {
    const ref = useReleaseMedia<HTMLAudioElement>();
    return (
        <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            gap={{ base: 6, md: 10 }}
            overflow="hidden"
            rounded="2xl"
            borderWidth="1px"
            borderColor="border"
            bg="surface"
            p={{ base: 6, md: 10 }}
        >
            <Box w={{ base: "full", md: "300px" }} maxW="300px" flexShrink={0} overflow="hidden" rounded="xl" aspectRatio={1}>
                {poster ? <Image src={poster} alt="" objectFit="cover" w="full" h="full" /> : <Soundwave />}
            </Box>
            <VStack align="stretch" gap={4} flex="1" w="full">
                <Text textStyle="cardTitle" color="text.primary">
                    {item.title}
                </Text>
                <audio ref={ref} controls preload="metadata" style={{ width: "100%" }} src={src} />
            </VStack>
        </Flex>
    );
}

/* The artwork itself, staged by medium. */
function Stage({ item }: { item: GalleryItem }) {
    const src = mediaUrl(item.media_url);
    const poster = mediaUrl(item.thumbnail_url);

    if (item.media_type === "video") return <VideoStage src={src} poster={poster} />;
    if (item.media_type === "audio") return <AudioStage item={item} src={src} poster={poster} />;

    // Image: shown at its natural aspect, like a framed print.
    return (
        <Box overflow="hidden" rounded="2xl" borderWidth="1px" borderColor="border" bg="primary.50">
            <Image src={src} alt={item.title} w="full" h="auto" display="block" />
        </Box>
    );
}

export default function GalleryDetailPage() {
    const params = useParams<{ slug: string }>();
    const slug = decodeSlug(params?.slug);
    const { data: item, error, loading, refreshing, notFound, reload } = useApi<GalleryItem>(
        slug ? `/gallery/${encodeURIComponent(slug)}` : null
    );
    // Related pieces + prev/next. Supplementary: on failure the section is left out.
    const collection = useApi<Paginated<GalleryItem>>(slug ? GALLERY_PATH : null);

    const nav = useMemo(() => {
        const all = collection.data?.items ?? [];
        if (!item || all.length === 0) {
            return { related: [] as GalleryItem[], prev: null as GalleryItem | null, next: null as GalleryItem | null };
        }
        const idx = all.findIndex((g) => g.id === item.id);
        const sameMedium = all.filter((g) => g.id !== item.id && g.media_type === item.media_type);
        const fill = all.filter((g) => g.id !== item.id && g.media_type !== item.media_type);
        return {
            related: [...sameMedium, ...fill].slice(0, 3),
            prev: idx > 0 ? all[idx - 1] : null,
            next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
        };
    }, [collection.data, item]);

    const paragraphs = useMemo(
        () =>
            (item?.description ?? "")
                .split(/\n{2,}/)
                .map((p) => p.trim())
                .filter(Boolean),
        [item]
    );

    const meta = item ? TYPE_META[item.media_type] : null;
    const pieceHref = (g: GalleryItem) => `/gallery/${encodeURIComponent(g.slug)}`;

    return (
        <PageWrapper>
            <Box minH="100vh" bg="background">
                <Navbar />

                <PageEntrance as="main">
                    <Container maxW="6xl" pt={{ base: 28, md: 36 }} pb={20} px={{ base: 4, sm: 6, lg: 8 }}>
                        {!slug || notFound ? (
                            <Box py={{ base: 8, md: 16 }}>
                                <EmptyState
                                    icon={<LuImage />}
                                    title="Piece not found"
                                    description="It may be unpublished, or the link may be wrong."
                                    action={
                                        <Button asChild variant="outline" rounded="md" size="sm">
                                            <Link href="/gallery">
                                                <LuArrowLeft aria-hidden="true" /> Back to the gallery
                                            </Link>
                                        </Button>
                                    }
                                />
                            </Box>
                        ) : loading ? (
                            <DetailSkeleton />
                        ) : error || !item || !meta ? (
                            <Box py={{ base: 8, md: 16 }}>
                                <ErrorState
                                    title="Couldn't load this piece"
                                    description={errorMessage(error)}
                                    onRetry={reload}
                                    retrying={refreshing}
                                />
                            </Box>
                        ) : (
                            <>
                                <BackLink href="/gallery">The gallery</BackLink>

                                {/* Masthead */}
                                <Box mb={{ base: 8, md: 10 }}>
                                    <Flex align="center" gap={1.5} textStyle="meta" color="text.muted" mb={3}>
                                        <meta.icon size={14} aria-hidden="true" />
                                        <Text as="span">
                                            {meta.label}
                                            {item.category && ` · ${item.category}`}
                                        </Text>
                                    </Flex>
                                    <Heading as="h1" textStyle="detailTitle" color="text.primary" maxW="4xl">
                                        {item.title}
                                    </Heading>
                                </Box>

                                {/* Plaque strip */}
                                <Grid
                                    templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                                    gap={{ base: 6, md: 8 }}
                                    borderTopWidth="1px"
                                    borderBottomWidth="1px"
                                    borderColor="border"
                                    py={6}
                                    mb={{ base: 10, md: 14 }}
                                >
                                    <Box>
                                        <SpecLabel>Medium</SpecLabel>
                                        <Text fontSize="sm" fontWeight={500} color="text.primary">
                                            {meta.label}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <SpecLabel>Category</SpecLabel>
                                        <Text fontSize="sm" fontWeight={500} color="text.primary">
                                            {item.category || "—"}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <SpecLabel>Published</SpecLabel>
                                        <Text textStyle="meta" fontWeight={500} color="text.primary">
                                            {formatMonth(item.published_at ?? item.created_at) ?? "—"}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <SpecLabel>Tags</SpecLabel>
                                        <Text fontSize="sm" color={item.tags.length > 0 ? "text.secondary" : "text.muted"} lineHeight="1.8">
                                            {item.tags.length > 0 ? item.tags.join(" / ") : "—"}
                                        </Text>
                                    </Box>
                                </Grid>

                                {/* The stage */}
                                <Box mb={{ base: 12, md: 16 }}>
                                    <Stage item={item} />
                                </Box>

                                {/* About this piece */}
                                {paragraphs.length > 0 && (
                                    <Box as="section" maxW="3xl" mb={{ base: 14, md: 20 }}>
                                        <Heading as="h2" textStyle="sectionTitle" color="text.primary" mb={6}>
                                            About this piece
                                        </Heading>
                                        <VStack align="stretch" gap={5}>
                                            {paragraphs.map((para, i) => (
                                                <Text key={i} textStyle="body" color="text.secondary" whiteSpace="pre-wrap">
                                                    {para}
                                                </Text>
                                            ))}
                                        </VStack>
                                    </Box>
                                )}

                                {/* Related */}
                                {collection.loading ? (
                                    <Box as="section" mb={{ base: 14, md: 20 }} aria-busy="true">
                                        <Skeleton h="9" w="72" mb={8} />
                                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                                            {[0, 1, 2].map((i) => (
                                                <Box key={i} bg="surface" rounded="2xl" overflow="hidden" borderWidth="1px" borderColor="border">
                                                    <Skeleton aspectRatio={4 / 3} rounded="none" />
                                                    <VStack align="stretch" gap={2} p={4}>
                                                        <Skeleton h="4" w="24" />
                                                        <Skeleton h="5" w="70%" />
                                                    </VStack>
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    </Box>
                                ) : nav.related.length > 0 ? (
                                    <Box as="section" mb={{ base: 14, md: 20 }}>
                                        <Flex align="baseline" justify="space-between" gap={4} mb={8}>
                                            <Heading as="h2" textStyle="sectionTitle" color="text.primary">
                                                More from the collection
                                            </Heading>
                                            <ArrowLink href="/gallery">Full collection</ArrowLink>
                                        </Flex>
                                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                                            {nav.related.map((g) => (
                                                <GalleryCard key={g.id} item={g} variant="mini" />
                                            ))}
                                        </SimpleGrid>
                                    </Box>
                                ) : null}

                                {/* Prev / Next */}
                                {(nav.prev || nav.next) && (
                                    <Pager
                                        label="More pieces"
                                        prevLabel="Previous piece"
                                        nextLabel="Next piece"
                                        prev={nav.prev ? { href: pieceHref(nav.prev), title: nav.prev.title } : null}
                                        next={nav.next ? { href: pieceHref(nav.next), title: nav.next.title } : null}
                                    />
                                )}
                            </>
                        )}
                    </Container>
                </PageEntrance>

                <Footer />
            </Box>
        </PageWrapper>
    );
}

function DetailSkeleton() {
    return (
        <Box aria-busy="true" aria-label="Loading piece">
            <Skeleton h="5" w="28" mb={6} />
            <Box mb={{ base: 8, md: 10 }}>
                <Skeleton h="4" w="32" mb={3} />
                <Skeleton h={{ base: "10", md: "12" }} w="60%" />
            </Box>
            <Grid
                templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                gap={{ base: 6, md: 8 }}
                borderTopWidth="1px"
                borderBottomWidth="1px"
                borderColor="border"
                py={6}
                mb={{ base: 10, md: 14 }}
            >
                {[0, 1, 2, 3].map((i) => (
                    <Box key={i}>
                        <Skeleton h="4" w="20" mb={2} />
                        <Skeleton h="5" w="28" />
                    </Box>
                ))}
            </Grid>
            <Skeleton aspectRatio={16 / 9} rounded="2xl" />
        </Box>
    );
}
