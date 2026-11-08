"use client";

import { Badge, Box, Button, Container, Flex, Heading, HStack, Image, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { LuArrowRight, LuFileText } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper, { PageEntrance } from "@/components/PageWrapper";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { mediaUrl, type BlogPost, type Paginated } from "@/lib/api";
import { CARD_HOVER } from "@/components/projects/ProjectCard";
import { formatDay } from "@/components/projects/shared";

const BLOG_PATH = "/blog/?page_size=50";

export default function BlogPage() {
    const { data, error, loading, refreshing, reload } = useApi<Paginated<BlogPost>>(BLOG_PATH);
    const posts = data?.items ?? [];

    return (
        <PageWrapper>
            <Box minH="100vh" bg="background">
                <Navbar />

                <PageEntrance as="main">
                    <Container maxW="7xl" pt={{ base: 32, md: 40 }} pb={20} px={{ base: 4, sm: 6, lg: 8 }}>
                        <VStack align={{ base: "center", md: "start" }} gap={4} mb={12} textAlign={{ base: "center", md: "left" }}>
                            <Heading as="h1" textStyle="pageTitle" color="text.primary">
                                Writing &amp; articles
                            </Heading>
                            <Text textStyle="lead" color="text.secondary" maxW="2xl">
                                Notes on engineering, design, and building with AI.
                            </Text>
                        </VStack>

                        {loading ? (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} aria-busy="true" aria-label="Loading articles">
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <PostCardSkeleton key={i} />
                                ))}
                            </SimpleGrid>
                        ) : error ? (
                            <ErrorState
                                title="Couldn't load the articles"
                                description={errorMessage(error)}
                                onRetry={reload}
                                retrying={refreshing}
                            />
                        ) : posts.length === 0 ? (
                            <EmptyState
                                icon={<LuFileText />}
                                title="No articles yet"
                                description="New writing will appear here when it's published."
                                action={
                                    <Button asChild size="sm" variant="outline" rounded="md">
                                        <Link href="/projects">Browse projects</Link>
                                    </Button>
                                }
                            />
                        ) : (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </SimpleGrid>
                        )}
                    </Container>
                </PageEntrance>

                <Footer />
            </Box>
        </PageWrapper>
    );
}

function PostCard({ post }: { post: BlogPost }) {
    const cover = mediaUrl(post.cover_image);
    return (
        <Box
            asChild
            className="group"
            bg="surface"
            rounded="2xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="border"
            display="flex"
            flexDirection="column"
            transitionProperty="border-color, box-shadow"
            transitionDuration="moderate"
            transitionTimingFunction="ease-out"
            _hover={CARD_HOVER}
            _focusVisible={CARD_HOVER}
        >
            <Link href={`/blog/${encodeURIComponent(post.slug)}`}>
                <Box position="relative" overflow="hidden" aspectRatio={16 / 9} bg="blackAlpha.50">
                    {cover ? (
                        <Image src={cover} alt="" loading="lazy" objectFit="cover" w="full" h="full" />
                    ) : (
                        <Flex w="full" h="full" align="center" justify="center" color="text.muted">
                            <LuFileText size={32} aria-hidden="true" />
                        </Flex>
                    )}
                </Box>

                <Flex p={6} flex="1" direction="column">
                    <Text textStyle="meta" color="text.muted" mb={2}>
                        {formatDay(post.published_at || post.created_at)}
                    </Text>
                    <Heading
                        as="h2"
                        textStyle="cardTitle"
                        color="text.primary"
                        mb={2}
                        lineClamp={2}
                        transitionProperty="color"
                        transitionDuration="fast"
                        _groupHover={{ color: "primary.600" }}
                    >
                        {post.title}
                    </Heading>
                    {post.excerpt && (
                        <Text fontSize="sm" color="text.secondary" mb={4} lineClamp={3}>
                            {post.excerpt}
                        </Text>
                    )}

                    <HStack gap={2} mt="auto" justify="space-between">
                        <HStack gap={2} flexWrap="wrap">
                            {post.tags?.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="subtle" colorPalette="gray" fontSize="xs" fontWeight={500} px={2} py={0.5} rounded="md">
                                    {tag}
                                </Badge>
                            ))}
                        </HStack>
                        <Box color="primary.500" flexShrink={0} aria-hidden="true">
                            <LuArrowRight size={16} />
                        </Box>
                    </HStack>
                </Flex>
            </Link>
        </Box>
    );
}

function PostCardSkeleton() {
    return (
        <Box bg="surface" rounded="2xl" overflow="hidden" borderWidth="1px" borderColor="border" aria-hidden="true">
            <Skeleton aspectRatio={16 / 9} rounded="none" />
            <VStack align="stretch" gap={3} p={6}>
                <Skeleton h="4" w="24" />
                <Skeleton h="6" w="80%" />
                <Skeleton h="12" w="full" />
                <Skeleton h="5" w="32" />
            </VStack>
        </Box>
    );
}
