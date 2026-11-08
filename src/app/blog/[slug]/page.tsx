"use client";

import { Badge, Box, Button, Container, Grid, Heading, HStack, Image, Skeleton, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LuArrowLeft, LuCalendar, LuCheck, LuEye, LuFileText, LuLink, LuLinkedin, LuTwitter } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper, { PageEntrance } from "@/components/PageWrapper";
import Markdown from "@/components/Markdown";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { api, mediaUrl, type BlogPost } from "@/lib/api";
import { formatDay } from "@/components/projects/shared";

function decodeSlug(raw: string | string[] | undefined): string | null {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) return null;
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

const shareIcon = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSize: "10",
    rounded: "md",
    borderWidth: "1px",
    borderColor: "border",
    bg: "surface",
    color: "text.secondary",
    transitionProperty: "color, border-color",
    transitionDuration: "fast",
    _hover: { color: "primary.600", borderColor: "primary.300" },
    focusRingColor: "primary.500",
} as const;

// The page URL, read on the client only. The server snapshot is empty, so the icons render after hydration.
const subscribeNever = () => () => {};
const readHref = () => window.location.href;
const readHrefOnServer = () => "";

/** Share this article: LinkedIn, X and copy link. */
function ShareIcons({ title }: { title: string }) {
    const url = useSyncExternalStore(subscribeNever, readHref, readHrefOnServer);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!copied) return;
        const id = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(id);
    }, [copied]);

    if (!url) return null;
    const encoded = encodeURIComponent(url);
    const copy = () => {
        navigator.clipboard?.writeText(url).then(() => setCopied(true), () => {});
    };

    return (
        <HStack as="ul" gap="2" listStyleType="none" aria-label="Share this article">
            <Box as="li">
                <Box asChild {...shareIcon}>
                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on LinkedIn"
                        title="Share on LinkedIn"
                    >
                        <LuLinkedin size={18} aria-hidden="true" />
                    </a>
                </Box>
            </Box>
            <Box as="li">
                <Box asChild {...shareIcon}>
                    <a
                        href={`https://x.com/intent/post?url=${encoded}&text=${encodeURIComponent(title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on X"
                        title="Share on X"
                    >
                        <LuTwitter size={18} aria-hidden="true" />
                    </a>
                </Box>
            </Box>
            <Box as="li">
                <Box asChild {...shareIcon}>
                    <button type="button" onClick={copy} aria-label="Copy link" title="Copy link" style={{ cursor: "pointer" }}>
                        {copied ? <LuCheck size={18} aria-hidden="true" /> : <LuLink size={18} aria-hidden="true" />}
                    </button>
                </Box>
            </Box>
            <Box as="li" aria-live="polite" textStyle="meta" color="text.muted">
                {copied ? "Link copied" : ""}
            </Box>
        </HStack>
    );
}

export default function BlogPostPage() {
    const params = useParams<{ slug: string }>();
    const slug = decodeSlug(params?.slug);
    const path = slug ? `/blog/${encodeURIComponent(slug)}` : null;
    const { data: post, error, loading, refreshing, notFound, reload, setData } = useApi<BlogPost>(path);

    // One view per visit to this slug. The ref survives Strict Mode's double
    // effect run and background reloads; a new visit remounts the page.
    const countedSlug = useRef<string | null>(null);
    const loadedSlug = post?.slug ?? null;
    useEffect(() => {
        if (loadedSlug === null || countedSlug.current === loadedSlug) return;
        countedSlug.current = loadedSlug;
        api.post<{ slug: string; view_count: number }>(`/blog/${encodeURIComponent(loadedSlug)}/increment-view`)
            .then((res) => {
                setData((prev) => (prev && prev.slug === res.slug ? { ...prev, view_count: res.view_count } : prev));
            })
            .catch(() => {
                /* best-effort */
            });
    }, [loadedSlug, setData]);

    const cover = post ? mediaUrl(post.cover_image) : "";

    return (
        <PageWrapper>
            <Box minH="100vh" bg="background">
                <Navbar />

                <PageEntrance as="main">
                    <Container maxW="6xl" pt={{ base: 32, md: 40 }} pb={24} px={{ base: 4, sm: 6, lg: 8 }}>
                        <Box mb={8}>
                            <Link href="/blog">
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
                                    <LuArrowLeft size={16} aria-hidden="true" /> All articles
                                </HStack>
                            </Link>
                        </Box>

                        {!slug || notFound ? (
                            <EmptyState
                                icon={<LuFileText />}
                                title="Article not found"
                                description="It may have been moved or unpublished."
                                action={
                                    <Button asChild size="sm" variant="outline" rounded="md">
                                        <Link href="/blog">Back to the blog</Link>
                                    </Button>
                                }
                            />
                        ) : loading ? (
                            <PostSkeleton />
                        ) : error || !post ? (
                            <ErrorState
                                title="Couldn't load this article"
                                description={errorMessage(error)}
                                onRetry={reload}
                                retrying={refreshing}
                            />
                        ) : (
                            /* Book spread: the left page holds the cover, title, date and icons; the right page holds the text. */
                            <Grid
                                as="article"
                                templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 7fr)" }}
                                columnGap={{ lg: 0 }}
                                rowGap={{ base: 10, lg: 0 }}
                            >
                                <Box
                                    as="header"
                                    minW="0"
                                    alignSelf="start"
                                    pr={{ lg: 12 }}
                                    position={{ lg: "sticky" }}
                                    top={{ lg: 28 }}
                                >
                                    {cover && (
                                        <Box mb={8} overflow="hidden" rounded="md" borderWidth="1px" borderColor="border">
                                            <Image src={cover} alt="" w="full" aspectRatio={4 / 3} objectFit="cover" />
                                        </Box>
                                    )}
                                    <Heading as="h1" textStyle="detailTitle" color="text.primary" mb={4}>
                                        {post.title}
                                    </Heading>
                                    <HStack gap={5} flexWrap="wrap" textStyle="meta" color="text.muted" mb={5}>
                                        <HStack as="span" gap={1.5}>
                                            <LuCalendar size={14} aria-hidden="true" />
                                            <time dateTime={post.published_at || post.created_at}>
                                                {formatDay(post.published_at || post.created_at, "long")}
                                            </time>
                                        </HStack>
                                        <HStack as="span" gap={1.5}>
                                            <LuEye size={14} aria-hidden="true" />
                                            {post.view_count.toLocaleString("en-US")} {post.view_count === 1 ? "view" : "views"}
                                        </HStack>
                                    </HStack>
                                    {post.tags?.length > 0 && (
                                        <HStack gap={2} flexWrap="wrap" mb={6}>
                                            {post.tags.map((tag) => (
                                                <Badge key={tag} variant="subtle" colorPalette="gray" fontSize="xs" fontWeight={500} px={2} py={0.5} rounded="md">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </HStack>
                                    )}
                                    <ShareIcons title={post.title} />
                                </Box>

                                <Box
                                    minW="0"
                                    pl={{ lg: 12 }}
                                    borderLeftWidth={{ lg: "1px" }}
                                    borderColor="border"
                                    css={{
                                        "& .markdown-body > p:first-of-type": { display: "flow-root" },
                                        "& .markdown-body > p:first-of-type::first-letter": {
                                            float: "left",
                                            fontFamily: "var(--chakra-fonts-serif)",
                                            fontWeight: 600,
                                            fontSize: "3.6em",
                                            lineHeight: 0.85,
                                            marginTop: "0.08em",
                                            marginRight: "0.12em",
                                            color: "var(--chakra-colors-primary-600)",
                                        },
                                    }}
                                >
                                    <Markdown>{post.content || ""}</Markdown>
                                </Box>
                            </Grid>
                        )}
                    </Container>
                </PageEntrance>

                <Footer />
            </Box>
        </PageWrapper>
    );
}

function PostSkeleton() {
    return (
        <Grid
            aria-busy="true"
            aria-label="Loading article"
            templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 7fr)" }}
            rowGap={{ base: 10, lg: 0 }}
            alignItems="start"
        >
            <Box pr={{ lg: 12 }}>
                <Skeleton aspectRatio={4 / 3} rounded="md" mb={8} />
                <Skeleton h={{ base: "10", md: "12" }} w="85%" mb={4} />
                <Skeleton h="4" w="44" mb={5} />
                <HStack gap={2}>
                    <Skeleton h="10" w="10" />
                    <Skeleton h="10" w="10" />
                    <Skeleton h="10" w="10" />
                </HStack>
            </Box>
            <VStack align="stretch" gap={3} pl={{ lg: 12 }} borderLeftWidth={{ lg: "1px" }} borderColor="border">
                <Skeleton h="4" w="full" />
                <Skeleton h="4" w="95%" />
                <Skeleton h="4" w="90%" />
                <Skeleton h="4" w="70%" />
            </VStack>
        </Grid>
    );
}
