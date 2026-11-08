"use client";

import { Box, Button, Center, Container, Flex, Heading, HStack, Image, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useMemo, useRef, useState, type MouseEvent } from "react";
import { LuArrowRight, LuPlus, LuQuote, LuStar } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReviewDrawer from "@/components/sections/ReviewDrawer";
import PageWrapper, { PageEntrance } from "@/components/PageWrapper";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { mediaUrl, type Paginated, type Testimonial, type TestimonialListItem } from "@/lib/api";
import { formatMonth } from "@/components/projects/shared";

const TESTIMONIALS_PATH = "/testimonials/?page_size=100";

/** Compose "<position> at <company>" from whatever the testimonial provides. */
function roleLabel(position?: string | null, company?: string | null): string {
    return [position, company].filter(Boolean).join(" at ");
}

/** Up to two uppercase initials from a name. */
function initials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function clampRating(rating: number): number {
    return Math.max(0, Math.min(5, Math.round(rating)));
}

export default function TestimonialsPage() {
    const { data, error, loading, refreshing, reload } = useApi<Paginated<TestimonialListItem>>(TESTIMONIALS_PATH);
    const all = useMemo(() => data?.items ?? [], [data]);

    const featuredItem = useMemo(() => all.find((t) => t.is_featured) ?? all[0] ?? null, [all]);
    // The list truncates content to an excerpt; the detail endpoint has the full text.
    const featuredFull = useApi<Testimonial>(featuredItem ? `/testimonials/${featuredItem.id}` : null);
    const gridItems = useMemo(() => (featuredItem ? all.filter((t) => t.id !== featuredItem.id) : []), [all, featuredItem]);

    const summary = useMemo(() => {
        const n = all.length;
        const total = data?.total ?? n;
        const avg = n ? all.reduce((sum, t) => sum + t.rating, 0) / n : 0;
        const fourPlus = n ? Math.round((all.filter((t) => t.rating >= 4).length / n) * 100) : 0;
        const fiveStar = n ? Math.round((all.filter((t) => t.rating === 5).length / n) * 100) : 0;
        return {
            total,
            avg,
            stats: [
                { value: String(total), label: "Reviews", sub: "Approved and published" },
                { value: avg.toFixed(1), label: "Average rating", sub: "Out of 5" },
                { value: `${fourPlus}%`, label: "Rated 4 or 5", sub: "Share of all ratings" },
                { value: `${fiveStar}%`, label: "Five-star", sub: "Share of all ratings" },
            ],
        };
    }, [all, data]);

    const hasReviews = all.length > 0;

    // "Submit a review" opens the same "Share your experience" drawer as the home page.
    // Focus returns to whichever button opened it.
    const [reviewOpen, setReviewOpen] = useState(false);
    const reviewOpener = useRef<HTMLElement | null>(null);
    const openReview = (event: MouseEvent<HTMLElement>) => {
        reviewOpener.current = event.currentTarget;
        setReviewOpen(true);
    };

    return (
        <PageWrapper>
            <Box minH="100vh" bg="background">
                <Navbar />

                <PageEntrance as="main">
                    {/* ============================ HERO ============================ */}
                    <Box as="section" pt={{ base: 32, md: 44 }} pb={{ base: 10, md: 16 }}>
                        <Container maxW="4xl" px={{ base: 4, sm: 6, lg: 8 }} textAlign="center">
                            <Heading as="h1" textStyle="pageTitle" color="text.primary" mb={6}>
                                Loved by the teams I build with
                            </Heading>

                            <Text textStyle="lead" mx="auto" maxW="2xl" color="text.secondary">
                                I partner with ambitious brands to ship high-end digital products. Here&apos;s what the people behind
                                them have to say about the work.
                            </Text>

                            {/* Rating summary + CTA */}
                            <Flex direction={{ base: "column", sm: "row" }} align="center" justify="center" gap={5} mt={10}>
                                <HStack gap={2.5} px={5} h={11} rounded="md" bg="surface" borderWidth="1px" borderColor="border" minW="56" justify="center">
                                    {loading ? (
                                        <Skeleton h="4" w="40" />
                                    ) : hasReviews ? (
                                        <>
                                            <Box color="yellow.600" aria-hidden="true">
                                                <LuStar size={16} fill="currentColor" />
                                            </Box>
                                            <Text fontWeight={600} color="text.primary" fontVariantNumeric="tabular-nums">
                                                {summary.avg.toFixed(1)}
                                            </Text>
                                            <Text fontSize="sm" color="text.muted">
                                                average from {summary.total} {summary.total === 1 ? "review" : "reviews"}
                                            </Text>
                                        </>
                                    ) : (
                                        <Text fontSize="sm" color="text.muted">
                                            {error ? "Reviews unavailable" : "No reviews yet"}
                                        </Text>
                                    )}
                                </HStack>

                                <Button
                                    size="lg"
                                    rounded="md"
                                    px={6}
                                    gap={2}
                                    bg="primary.500"
                                    color="white"
                                    _hover={{ bg: "primary.600" }}
                                    _active={{ bg: "primary.700" }}
                                    onClick={openReview}
                                >
                                    <LuPlus aria-hidden="true" /> Submit a review
                                </Button>
                            </Flex>
                        </Container>
                    </Box>

                    {loading ? (
                        <ReviewsSkeleton />
                    ) : error ? (
                        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} py={{ base: 10, md: 14 }}>
                            <ErrorState
                                title="Couldn't load the reviews"
                                description={errorMessage(error)}
                                onRetry={reload}
                                retrying={refreshing}
                            />
                        </Container>
                    ) : !hasReviews || !featuredItem ? (
                        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} py={{ base: 10, md: 14 }}>
                            <EmptyState
                                icon={<LuQuote />}
                                title="No reviews yet"
                                description="Worked with me? Your review would be the first one here."
                                action={
                                    <Button size="sm" variant="outline" rounded="md" onClick={openReview}>
                                        Submit a review
                                    </Button>
                                }
                            />
                        </Container>
                    ) : (
                        <>
                            {/* ============================ STATS ============================ */}
                            <Box as="section" aria-label="Ratings summary" py={{ base: 10, md: 14 }}>
                                <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                                    <SimpleGrid as="dl" columns={{ base: 2, md: 4 }} gap={6}>
                                        {summary.stats.map((st) => (
                                            <VStack
                                                key={st.label}
                                                gap={1}
                                                p={{ base: 6, md: 8 }}
                                                rounded="2xl"
                                                bg="surface"
                                                borderWidth="1px"
                                                borderColor="border"
                                                textAlign="center"
                                            >
                                                <Text as="dt" order={2} fontWeight={500} color="text.primary" mt={2}>
                                                    {st.label}
                                                </Text>
                                                <Text
                                                    as="dd"
                                                    order={1}
                                                    fontSize={{ base: "4xl", md: "5xl" }}
                                                    fontWeight={600}
                                                    lineHeight="1"
                                                    color="text.primary"
                                                    fontVariantNumeric="tabular-nums"
                                                >
                                                    {st.value}
                                                </Text>
                                                <Text as="dd" order={3} textStyle="meta" fontSize="xs" color="text.muted">
                                                    {st.sub}
                                                </Text>
                                            </VStack>
                                        ))}
                                    </SimpleGrid>
                                </Container>
                            </Box>

                            {/* ========================== FEATURED ========================== */}
                            <Box as="section" aria-label="Featured review" py={{ base: 14, md: 20 }}>
                                <Container maxW="5xl" px={{ base: 4, sm: 6, lg: 8 }}>
                                    <VStack
                                        as="figure"
                                        gap={8}
                                        textAlign="center"
                                        bg="surface"
                                        rounded="3xl"
                                        borderWidth="1px"
                                        borderColor="border"
                                        p={{ base: 8, md: 16 }}
                                    >
                                        <Stars rating={featuredFull.data?.rating ?? featuredItem.rating} size={18} />
                                        <Text
                                            as="blockquote"
                                            fontFamily="serif"
                                            fontSize={{ base: "xl", md: "2xl" }}
                                            fontWeight={400}
                                            lineHeight="1.5"
                                            color="text.primary"
                                            maxW="3xl"
                                        >
                                            “{featuredFull.data?.content || featuredItem.content}”
                                        </Text>
                                        <HStack as="figcaption" gap={4}>
                                            <Avatar name={featuredItem.client_name} photo={featuredItem.client_photo_url} size={12} />
                                            <VStack align="flex-start" gap={0} textAlign="left">
                                                <Text fontWeight={600} color="text.primary">
                                                    {featuredItem.client_name}
                                                </Text>
                                                {roleLabel(featuredItem.client_position, featuredItem.client_company) && (
                                                    <Text fontSize="sm" color="text.muted">
                                                        {roleLabel(featuredItem.client_position, featuredItem.client_company)}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </HStack>
                                    </VStack>
                                </Container>
                            </Box>

                            {/* ============================ GRID ============================ */}
                            {gridItems.length > 0 && (
                                <Box as="section" py={{ base: 16, md: 24 }}>
                                    <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                                        <VStack gap={4} textAlign="center" mb={{ base: 12, md: 16 }}>
                                            <Heading as="h2" textStyle="sectionTitle" color="text.primary">
                                                Words from the people I&apos;ve shipped with
                                            </Heading>
                                            <Text textStyle="lead" color="text.secondary" maxW="2xl">
                                                Founders, engineers and designers on what it&apos;s like to build together.
                                            </Text>
                                        </VStack>

                                        <SimpleGrid as="ul" columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                                            {gridItems.map((t) => (
                                                <Box as="li" key={t.id}>
                                                    <TestimonialCard item={t} />
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    </Container>
                                </Box>
                            )}
                        </>
                    )}

                    {/* ============================= CTA ============================= */}
                    <Box as="section" py={{ base: 24, md: 32 }}>
                        <Container maxW="5xl" px={{ base: 4, sm: 6, lg: 8 }}>
                            <VStack rounded="3xl" p={{ base: 10, md: 20 }} textAlign="center" bg="primary.700" gap={6}>
                                <Heading as="h2" textStyle="sectionTitle" color="white">
                                    Let&apos;s write your success story
                                </Heading>
                                <Text textStyle="lead" color="whiteAlpha.900" maxW="2xl">
                                    Join the founders and teams who turned an idea into a product people love. Tell me what you&apos;re
                                    building.
                                </Text>
                                <Flex direction={{ base: "column", sm: "row" }} gap={3} justify="center" pt={2}>
                                    <Button
                                        asChild
                                        size="lg"
                                        rounded="md"
                                        px={7}
                                        gap={2}
                                        bg="white"
                                        color="primary.700"
                                        _hover={{ bg: "primary.50" }}
                                        _active={{ bg: "primary.100" }}
                                    >
                                        <Link href="/#contact">
                                            Start a project <LuArrowRight aria-hidden="true" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        rounded="md"
                                        px={7}
                                        variant="outline"
                                        color="white"
                                        borderColor="whiteAlpha.500"
                                        _hover={{ bg: "whiteAlpha.200", borderColor: "white" }}
                                        _active={{ bg: "whiteAlpha.300" }}
                                    >
                                        <Link href="/projects">See the work</Link>
                                    </Button>
                                </Flex>
                            </VStack>
                        </Container>
                    </Box>
                </PageEntrance>

                <Footer />

                <ReviewDrawer
                    isOpen={reviewOpen}
                    onClose={() => setReviewOpen(false)}
                    returnFocusTo={() => reviewOpener.current}
                />
            </Box>
        </PageWrapper>
    );
}

// ---------------------------------------------------------------------------
// Presentational sub-components
// ---------------------------------------------------------------------------

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
    const filled = clampRating(rating);
    return (
        <HStack gap={0.5} role="img" aria-label={`Rated ${filled} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} color={i < filled ? "yellow.600" : "blackAlpha.300"} aria-hidden="true">
                    <LuStar size={size} fill={i < filled ? "currentColor" : "none"} />
                </Box>
            ))}
        </HStack>
    );
}

function Avatar({ name, photo, size }: { name: string; photo?: string | null; size: number }) {
    const src = mediaUrl(photo);
    return src ? (
        <Image src={src} alt="" boxSize={size} rounded="md" objectFit="cover" flexShrink={0} />
    ) : (
        <Center boxSize={size} rounded="md" bg="primary.50" color="primary.700" fontWeight={600} fontSize="sm" flexShrink={0} aria-hidden="true">
            {initials(name)}
        </Center>
    );
}

/** The list endpoint cuts content to a 200-character excerpt; mark the cut. */
const EXCERPT_LENGTH = 200;

function TestimonialCard({ item }: { item: TestimonialListItem }) {
    const role = roleLabel(item.client_position, item.client_company);
    const date = formatMonth(item.created_at);
    const text = item.content.length >= EXCERPT_LENGTH ? `${item.content.trimEnd()}…` : item.content;
    return (
        <Flex as="figure" direction="column" h="full" bg="surface" rounded="2xl" p={8} borderWidth="1px" borderColor="border">
            <Flex justify="space-between" align="center" mb={6}>
                <Stars rating={item.rating} />
                {date && (
                    <Text textStyle="meta" fontSize="xs" color="text.muted">
                        {date}
                    </Text>
                )}
            </Flex>

            <Text as="blockquote" color="text.secondary" fontSize="sm" lineHeight="1.7" mb={8} flex="1">
                “{text}”
            </Text>

            <HStack as="figcaption" gap={3} borderTopWidth="1px" borderColor="border" pt={6}>
                <Avatar name={item.client_name} photo={item.client_photo_url} size={10} />
                <Box minW={0}>
                    <Text fontWeight={600} fontSize="sm" color="text.primary">
                        {item.client_name}
                    </Text>
                    {role && (
                        <Text fontSize="xs" color="text.muted">
                            {role}
                        </Text>
                    )}
                </Box>
            </HStack>
        </Flex>
    );
}

/** Stats row, featured quote and two cards in their loaded proportions. */
function ReviewsSkeleton() {
    return (
        <Box aria-busy="true" aria-label="Loading reviews">
            <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} py={{ base: 10, md: 14 }}>
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={6}>
                    {[0, 1, 2, 3].map((i) => (
                        <VStack key={i} gap={3} p={{ base: 6, md: 8 }} rounded="2xl" bg="surface" borderWidth="1px" borderColor="border">
                            <Skeleton h="12" w="20" />
                            <Skeleton h="4" w="28" />
                        </VStack>
                    ))}
                </SimpleGrid>
            </Container>
            <Container maxW="5xl" px={{ base: 4, sm: 6, lg: 8 }} py={{ base: 14, md: 20 }}>
                <VStack gap={6} bg="surface" rounded="3xl" borderWidth="1px" borderColor="border" p={{ base: 8, md: 16 }}>
                    <Skeleton h="5" w="28" />
                    <Skeleton h="7" w="full" />
                    <Skeleton h="7" w="75%" />
                    <Skeleton h="12" w="48" />
                </VStack>
            </Container>
        </Box>
    );
}
