"use client";

import { useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { Box, Button, Container, Flex, Grid, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { LuMessageSquareQuote, LuPenLine } from "react-icons/lu";
import { useApi } from "@/hooks/useApi";
import { mediaUrl, type Paginated, type TestimonialListItem } from "@/lib/api";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { ArrowLink, Placeholder, StarRating, backendImage, card, primaryButton, secondaryButton } from "@/components/home/ui";
import ReviewDrawer from "./ReviewDrawer";

/** Public GET /testimonials/stats (published reviews only). */
interface TestimonialStats {
    total_count: number;
    average_rating: number;
    rating_distribution: Record<string, number>;
}

const LIST = "/testimonials/?page_size=4";
const STATS = "/testimonials/stats";
// The public list returns an excerpt capped at this many characters.
const EXCERPT_LIMIT = 200;

function excerpt(text: string) {
    const clean = text.trim();
    if (clean.length < EXCERPT_LIMIT) return clean;
    const space = clean.lastIndexOf(" ", EXCERPT_LIMIT - 1);
    const cut = clean.slice(0, space > 0 ? space : EXCERPT_LIMIT).replace(/[\s,;:.!?-]+$/, "");
    return `${cut}…`;
}

function initials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

function Avatar({ name, photo }: { name: string; photo?: string | null }) {
    const src = mediaUrl(photo);
    if (src) {
        return (
            <Box position="relative" boxSize="10" borderRadius="md" overflow="hidden" bg="primary.50" flexShrink={0}>
                <Image {...backendImage(src)} alt="" fill sizes="40px" style={{ objectFit: "cover" }} />
            </Box>
        );
    }
    return (
        <Flex
            boxSize="10"
            borderRadius="md"
            bg="primary.50"
            color="primary.700"
            align="center"
            justify="center"
            textStyle="label"
            flexShrink={0}
            aria-hidden="true"
        >
            {initials(name)}
        </Flex>
    );
}

function ReviewCard({ review }: { review: TestimonialListItem }) {
    const byline = [review.client_position, review.client_company].filter(Boolean).join(", ");
    return (
        <Box as="figure" display="flex" flexDirection="column" gap="5" h="full" p={{ base: "6", md: "7" }} css={card}>
            <StarRating rating={review.rating} />
            <Box as="blockquote" flex="1">
                <Text textStyle="body" color="text.primary">
                    &ldquo;{excerpt(review.content)}&rdquo;
                </Text>
            </Box>
            <HStack as="figcaption" gap="3" minW="0">
                <Avatar name={review.client_name} photo={review.client_photo_url} />
                <Box minW="0">
                    <Text textStyle="label" color="text.primary" overflowWrap="anywhere">
                        {review.client_name}
                    </Text>
                    {byline ? (
                        <Text textStyle="meta" color="text.muted" overflowWrap="anywhere">
                            {byline}
                        </Text>
                    ) : null}
                </Box>
            </HStack>
        </Box>
    );
}

function ReviewSkeleton() {
    return (
        <Grid templateColumns={{ base: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }} gap="5" aria-hidden="true">
            {[0, 1].map((i) => (
                <Stack key={i} gap="5" p={{ base: "6", md: "7" }} css={card}>
                    <Placeholder h="4" w="24" />
                    <Stack gap="2">
                        <Placeholder h="4" w="100%" />
                        <Placeholder h="4" w="95%" />
                        <Placeholder h="4" w="70%" />
                    </Stack>
                    <HStack gap="3">
                        <Placeholder boxSize="10" borderRadius="md" />
                        <Stack gap="1.5" flex="1">
                            <Placeholder h="4" w="40%" />
                            <Placeholder h="3" w="55%" />
                        </Stack>
                    </HStack>
                </Stack>
            ))}
        </Grid>
    );
}

/** Rating summary from real published reviews. The row keeps its height while loading. */
function Summary({ stats }: { stats: TestimonialStats | undefined }) {
    const count = stats?.total_count ?? 0;
    return (
        <Box minH="6">
            {stats && count > 0 ? (
                <HStack gap="3" wrap="wrap">
                    <StarRating rating={stats.average_rating} />
                    <Text textStyle="meta" color="text.secondary">
                        {stats.average_rating.toFixed(1)} average from {count} review{count === 1 ? "" : "s"}
                    </Text>
                </HStack>
            ) : null}
        </Box>
    );
}

export default function Testimonials() {
    const [open, setOpen] = useState(false);
    // Focus goes back to whichever button opened the drawer (Safari doesn't focus buttons on click).
    const opener = useRef<HTMLElement | null>(null);
    const openReview = (event: MouseEvent<HTMLElement>) => {
        opener.current = event.currentTarget;
        setOpen(true);
    };
    const list = useApi<Paginated<TestimonialListItem>>(LIST, { revalidateOnFocus: true });
    // The summary is a nice-to-have: if it fails it simply stays hidden.
    const stats = useApi<TestimonialStats>(STATS, { revalidateOnFocus: true });
    const reviews = list.data?.items ?? [];
    const total = list.data?.total ?? 0;

    return (
        <Box as="section" id="testimonials" aria-labelledby="testimonials-title" py={{ base: "16", lg: "24" }}>
            <Container maxW="7xl" px={{ base: "4", sm: "6", lg: "8" }}>
                <Grid
                    templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 4fr) minmax(0, 8fr)" }}
                    gap={{ base: "8", lg: "16" }}
                >
                    <Stack gap="5" alignSelf="start" minW="0">
                        <Heading
                            as="h2"
                            id="testimonials-title"
                            textStyle="sectionTitle"
                            color="text.primary"
                            textDecorationLine="underline"
                            textDecorationColor="primary.500"
                            textDecorationThickness="3px"
                            textUnderlineOffset="7px"
                            css={{ textDecorationSkipInk: "none" }}
                        >
                            Kind words
                        </Heading>
                        <Text textStyle="body" color="text.secondary" maxW="28rem">
                            What people I&rsquo;ve worked with say. New reviews show up here once I&rsquo;ve approved
                            them.
                        </Text>
                        <Summary stats={stats.error ? undefined : stats.data} />
                        <Flex gap="4" rowGap="3" wrap="wrap" align="center">
                            <Button {...secondaryButton} onClick={openReview}>
                                <LuPenLine aria-hidden="true" />
                                Leave a review
                            </Button>
                            {total > 0 ? <ArrowLink href="/testimonials">Read all reviews</ArrowLink> : null}
                        </Flex>
                    </Stack>

                    <Box minW="0" aria-busy={list.loading || list.refreshing}>
                        {list.loading ? (
                            <ReviewSkeleton />
                        ) : list.error ? (
                            <ErrorState
                                title="Couldn't load reviews"
                                description={errorMessage(list.error)}
                                onRetry={list.reload}
                                retrying={list.refreshing}
                            />
                        ) : reviews.length === 0 ? (
                            <EmptyState
                                icon={<LuMessageSquareQuote />}
                                title="No reviews yet"
                                description="If we've worked together, I'd be glad to hear how it went. Your review appears here after a quick approval."
                                action={
                                    <Button {...primaryButton} onClick={openReview}>
                                        Leave the first review
                                    </Button>
                                }
                            />
                        ) : (
                            <Grid
                                as="ul"
                                templateColumns={{ base: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }}
                                gap="5"
                                listStyleType="none"
                            >
                                {reviews.map((review) => (
                                    <Box as="li" key={review.id} minW="0">
                                        <ReviewCard review={review} />
                                    </Box>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Grid>
            </Container>

            <ReviewDrawer isOpen={open} onClose={() => setOpen(false)} returnFocusTo={() => opener.current} />
        </Box>
    );
}
