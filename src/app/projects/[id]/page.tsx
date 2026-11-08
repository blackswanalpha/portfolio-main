"use client";

import {
    Box,
    Button,
    Container,
    Flex,
    Grid,
    GridItem,
    Heading,
    HStack,
    Image,
    SimpleGrid,
    Skeleton,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import { LuArrowLeft, LuCode, LuExternalLink, LuFolderOpen } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper, { PageEntrance } from "@/components/PageWrapper";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { api, ApiError, mediaUrl, type Paginated, type Project } from "@/lib/api";
import { CATEGORY_LABEL, parseRouteId, projectYear, sortProjects, timelineLabel } from "@/components/projects/shared";
import { ProjectCard, ProjectCardSkeleton } from "@/components/projects/ProjectCard";
import { ArrowLink, BackLink, Pager } from "@/components/projects/DetailNav";

const PROJECTS_PATH = "/projects/?published_only=true&page_size=100";

const SpecLabel = ({ children }: { children: ReactNode }) => (
    <Text textStyle="label" color="text.muted" mb={1.5}>
        {children}
    </Text>
);

export default function ProjectDetailsPage() {
    const params = useParams<{ id: string }>();
    // "/projects/abc" is a not-found, not a request (the API answers 422).
    const id = parseRouteId(params?.id);
    const { data: project, error, loading, refreshing, notFound, reload, setData } = useApi<Project>(
        id !== null ? `/projects/id/${id}` : null
    );
    // Related projects + prev/next. Supplementary: on failure the section is simply left out.
    const index = useApi<Paginated<Project>>(id !== null ? PROJECTS_PATH : null);

    const isNotFound = id === null || notFound || (error instanceof ApiError && error.status === 422);

    // Count one view per visit to this id. The ref survives Strict Mode's
    // double effect run and background reloads; a new visit remounts the page.
    const countedId = useRef<number | null>(null);
    const loadedId = project?.id ?? null;
    useEffect(() => {
        if (loadedId === null || countedId.current === loadedId) return;
        countedId.current = loadedId;
        api.post<{ id: number; view_count: number }>(`/projects/${loadedId}/increment-view`)
            .then((res) => {
                // Show the server's count, not a local +1.
                setData((prev) => (prev && prev.id === res.id ? { ...prev, view_count: res.view_count } : prev));
            })
            .catch(() => {
                /* best-effort; never block the page on it */
            });
    }, [loadedId, setData]);

    const nav = useMemo(() => {
        const all = index.data?.items ?? [];
        if (!project || all.length === 0) {
            return { related: [] as Project[], prev: null as Project | null, next: null as Project | null };
        }
        const ordered = sortProjects(all, "newest");
        const idx = ordered.findIndex((p) => p.id === project.id);
        const sameCategory = ordered.filter((p) => p.id !== project.id && p.category === project.category);
        const fill = ordered.filter((p) => p.id !== project.id && p.category !== project.category);
        return {
            related: [...sameCategory, ...fill].slice(0, 3),
            prev: idx > 0 ? ordered[idx - 1] : null,
            next: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null,
        };
    }, [index.data, project]);

    const paragraphs = useMemo(() => {
        const raw = project?.description || project?.short_description || "No description provided yet.";
        return raw
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean);
    }, [project]);

    const thumb = project ? mediaUrl(project.thumbnail_url) : "";

    return (
        <PageWrapper>
            <Box minH="100vh" bg="background">
                <Navbar />

                <PageEntrance as="main">
                    <Container maxW="7xl" pt={{ base: 28, md: 36 }} pb={20} px={{ base: 4, sm: 6, lg: 8 }}>
                        {isNotFound ? (
                            <Box py={{ base: 8, md: 16 }}>
                                <EmptyState
                                    icon={<LuFolderOpen />}
                                    title="Project not found"
                                    description="It may be unpublished, or the link may be wrong."
                                    action={
                                        <Button asChild variant="outline" rounded="md" size="sm">
                                            <Link href="/projects">
                                                <LuArrowLeft aria-hidden="true" /> All projects
                                            </Link>
                                        </Button>
                                    }
                                />
                            </Box>
                        ) : loading ? (
                            <DetailSkeleton />
                        ) : error || !project ? (
                            <Box py={{ base: 8, md: 16 }}>
                                <ErrorState
                                    title="Couldn't load this project"
                                    description={errorMessage(error)}
                                    onRetry={reload}
                                    retrying={refreshing}
                                />
                            </Box>
                        ) : (
                            <>
                                <BackLink href="/projects">All projects</BackLink>

                                {/* Masthead */}
                                <Box mb={{ base: 8, md: 10 }}>
                                    <Text textStyle="meta" color="text.muted" mb={3}>
                                        {CATEGORY_LABEL[project.category] ?? project.category}
                                        {project.featured && " · Featured"}
                                    </Text>
                                    <Heading as="h1" textStyle="detailTitle" color="text.primary" maxW="4xl">
                                        {project.title}
                                    </Heading>
                                    {project.short_description && (
                                        <Text textStyle="lead" color="text.secondary" maxW="3xl" mt={5}>
                                            {project.short_description}
                                        </Text>
                                    )}
                                </Box>

                                {/* Specs strip */}
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
                                        <SpecLabel>Timeline</SpecLabel>
                                        <Text textStyle="meta" fontWeight={500} color="text.primary">
                                            {timelineLabel(project)}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <SpecLabel>Category</SpecLabel>
                                        <Text fontSize="sm" fontWeight={500} color="text.primary">
                                            {CATEGORY_LABEL[project.category] ?? project.category}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <SpecLabel>Views</SpecLabel>
                                        <Text textStyle="meta" fontWeight={500} color="text.primary">
                                            {project.view_count.toLocaleString("en-US")}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <SpecLabel>Links</SpecLabel>
                                        <HStack gap={2} flexWrap="wrap">
                                            {project.source_code_url && (
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="xs"
                                                    rounded="md"
                                                    gap={1.5}
                                                    borderColor="border"
                                                    color="text.secondary"
                                                    _hover={{ color: "text.primary", bg: "blackAlpha.50" }}
                                                    _active={{ bg: "blackAlpha.100" }}
                                                >
                                                    <a href={project.source_code_url} target="_blank" rel="noopener noreferrer">
                                                        <LuCode aria-hidden="true" /> Source
                                                    </a>
                                                </Button>
                                            )}
                                            {project.demo_url && (
                                                <Button
                                                    asChild
                                                    size="xs"
                                                    rounded="md"
                                                    bg="primary.500"
                                                    color="white"
                                                    gap={1.5}
                                                    _hover={{ bg: "primary.600" }}
                                                    _active={{ bg: "primary.700" }}
                                                >
                                                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                                                        <LuExternalLink aria-hidden="true" /> Live demo
                                                    </a>
                                                </Button>
                                            )}
                                            {!project.source_code_url && !project.demo_url && (
                                                <Text fontSize="sm" color="text.muted">
                                                    —
                                                </Text>
                                            )}
                                        </HStack>
                                    </Box>
                                </Grid>

                                {/* Hero media */}
                                <Box
                                    position="relative"
                                    overflow="hidden"
                                    rounded="2xl"
                                    borderWidth="1px"
                                    borderColor="border"
                                    aspectRatio={16 / 9}
                                    bg="primary.50"
                                    mb={{ base: 12, md: 16 }}
                                >
                                    {thumb ? (
                                        <Image src={thumb} alt={project.title} objectFit="cover" w="full" h="full" />
                                    ) : (
                                        <Flex w="full" h="full" align="center" justify="center" color="primary.300">
                                            <LuFolderOpen size={56} aria-hidden="true" />
                                        </Flex>
                                    )}
                                </Box>

                                {/* Body */}
                                <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={{ base: 12, lg: 16 }} mb={{ base: 14, md: 20 }}>
                                    <GridItem colSpan={{ base: 1, lg: 8 }}>
                                        <Box as="section">
                                            <Heading as="h2" textStyle="sectionTitle" color="text.primary" mb={6}>
                                                Overview
                                            </Heading>
                                            <VStack align="stretch" gap={5} maxW="70ch">
                                                {paragraphs.map((para, i) => (
                                                    <Text
                                                        key={i}
                                                        textStyle="body"
                                                        color="text.secondary"
                                                        whiteSpace="pre-wrap"
                                                        css={
                                                            i === 0
                                                                ? {
                                                                      "&::first-letter": {
                                                                          fontFamily: "var(--font-fraunces), Georgia, serif",
                                                                          fontSize: "3.2em",
                                                                          float: "left",
                                                                          lineHeight: "0.9",
                                                                          paddingRight: "0.12em",
                                                                          color: "var(--chakra-colors-text-primary)",
                                                                      },
                                                                  }
                                                                : undefined
                                                        }
                                                    >
                                                        {para}
                                                    </Text>
                                                ))}
                                            </VStack>
                                        </Box>
                                    </GridItem>

                                    <GridItem colSpan={{ base: 1, lg: 4 }}>
                                        <Box
                                            position="sticky"
                                            top={24}
                                            as="aside"
                                            borderLeftWidth={{ lg: "1px" }}
                                            borderColor="border"
                                            pl={{ lg: 8 }}
                                        >
                                            <VStack align="stretch" gap={8}>
                                                {project.technologies.length > 0 && (
                                                    <Box>
                                                        <SpecLabel>Tech stack</SpecLabel>
                                                        <Flex gap={2} flexWrap="wrap" mt={3}>
                                                            {project.technologies.map((tech) => (
                                                                <Box
                                                                    key={tech}
                                                                    px={3}
                                                                    py={1}
                                                                    fontSize="xs"
                                                                    fontWeight={500}
                                                                    color="text.secondary"
                                                                    borderWidth="1px"
                                                                    borderColor="border"
                                                                    rounded="md"
                                                                >
                                                                    {tech}
                                                                </Box>
                                                            ))}
                                                        </Flex>
                                                    </Box>
                                                )}
                                                {project.tags.length > 0 && (
                                                    <Box>
                                                        <SpecLabel>Tags</SpecLabel>
                                                        <Text fontSize="sm" color="text.secondary" mt={3} lineHeight="1.8">
                                                            {project.tags.join(" / ")}
                                                        </Text>
                                                    </Box>
                                                )}
                                                <Box>
                                                    <SpecLabel>Year</SpecLabel>
                                                    <Text textStyle="meta" fontWeight={500} color="text.primary" mt={3}>
                                                        {projectYear(project) || "—"}
                                                    </Text>
                                                </Box>
                                            </VStack>
                                        </Box>
                                    </GridItem>
                                </Grid>

                                {/* Related */}
                                {index.loading ? (
                                    <Box as="section" mb={{ base: 14, md: 20 }} aria-busy="true">
                                        <Skeleton h="9" w="64" mb={8} />
                                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                                            {[0, 1, 2].map((i) => (
                                                <ProjectCardSkeleton key={i} variant="mini" />
                                            ))}
                                        </SimpleGrid>
                                    </Box>
                                ) : nav.related.length > 0 ? (
                                    <Box as="section" mb={{ base: 14, md: 20 }}>
                                        <Flex align="baseline" justify="space-between" gap={4} mb={8}>
                                            <Heading as="h2" textStyle="sectionTitle" color="text.primary">
                                                More projects
                                            </Heading>
                                            <ArrowLink href="/projects">All projects</ArrowLink>
                                        </Flex>
                                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                                            {nav.related.map((p) => (
                                                <ProjectCard key={p.id} project={p} variant="mini" />
                                            ))}
                                        </SimpleGrid>
                                    </Box>
                                ) : null}

                                {/* Prev / Next */}
                                {(nav.prev || nav.next) && (
                                    <Pager
                                        label="More projects"
                                        prev={nav.prev ? { href: `/projects/${nav.prev.id}`, title: nav.prev.title } : null}
                                        next={nav.next ? { href: `/projects/${nav.next.id}`, title: nav.next.title } : null}
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

/** Masthead, specs strip and hero in their loaded proportions. */
function DetailSkeleton() {
    return (
        <Box aria-busy="true" aria-label="Loading project">
            <Skeleton h="5" w="28" mb={6} />
            <Box mb={{ base: 8, md: 10 }}>
                <Skeleton h="4" w="32" mb={3} />
                <Skeleton h={{ base: "10", md: "14" }} w="70%" />
                <Skeleton h="6" w="55%" mt={5} />
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
