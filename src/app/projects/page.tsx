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
    Input,
    LinkBox,
    LinkOverlay,
    Skeleton,
    Text,
    VStack,
    chakra,
} from "@chakra-ui/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LuArrowRight, LuArrowUpRight, LuFolderOpen, LuSearch } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper, { PageEntrance } from "@/components/PageWrapper";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { mediaUrl, type Paginated, type Project, type ProjectCategory } from "@/lib/api";
import { CATEGORY_LABEL, matchesQuery, sortProjects, timelineLabel, type SortKey } from "@/components/projects/shared";
import { CARD_HOVER, ProjectCard, ProjectCardSkeleton } from "@/components/projects/ProjectCard";

const PROJECTS_PATH = "/projects/?published_only=true&page_size=100";

/** Alternating 7/5 rhythm on large screens. */
const spanFor = (i: number) => (i % 4 === 0 || i % 4 === 3 ? 7 : 5);

export default function ProjectsPage() {
    const { data, error, loading, refreshing, reload } = useApi<Paginated<Project>>(PROJECTS_PATH);
    const [category, setCategory] = useState<ProjectCategory | "all">("all");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("newest");

    const projects = useMemo(() => data?.items ?? [], [data]);

    // Only offer tabs for categories that exist in the data.
    const categories = useMemo(() => Array.from(new Set(projects.map((p) => p.category))), [projects]);

    const visible = useMemo(
        () =>
            sortProjects(
                projects.filter((p) => (category === "all" || p.category === category) && matchesQuery(p, query)),
                sort
            ),
        [projects, category, query, sort]
    );

    const totalViews = useMemo(() => projects.reduce((sum, p) => sum + p.view_count, 0), [projects]);

    // The spotlight only anchors the unfiltered index; any filter collapses it into the grid.
    const showSpotlight = category === "all" && query.trim() === "";
    const spotlight = showSpotlight ? visible.find((p) => p.featured) ?? visible[0] ?? null : null;
    const gridItems = spotlight ? visible.filter((p) => p.id !== spotlight.id) : visible;

    const resetFilters = () => {
        setCategory("all");
        setQuery("");
        setSort("newest");
    };

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
                                        Projects portfolio
                                    </Heading>
                                    <Text textStyle="lead" color="text.secondary" maxW="2xl" mt={4}>
                                        A selection of my recent work in engineering and design — from full-stack applications to
                                        intuitive mobile interfaces.
                                    </Text>
                                </Box>
                                {/* Fixed height so the counts don't shift the masthead when they arrive. */}
                                <Box minH="5" flexShrink={0}>
                                    {ready ? (
                                        <Text textStyle="meta" color="text.muted">
                                            {projects.length} {projects.length === 1 ? "project" : "projects"} ·{" "}
                                            {totalViews.toLocaleString("en-US")} {totalViews === 1 ? "view" : "views"}
                                        </Text>
                                    ) : loading ? (
                                        <Skeleton h="4" w="40" />
                                    ) : null}
                                </Box>
                            </Flex>
                        </Box>

                        {/* Controls: category / search / sort */}
                        <Flex
                            direction={{ base: "column", lg: "row" }}
                            justify="space-between"
                            align={{ base: "stretch", lg: "center" }}
                            gap={5}
                            mb={{ base: 10, md: 14 }}
                        >
                            <HStack
                                role="group"
                                aria-label="Filter by category"
                                overflowX="auto"
                                gap={6}
                                className="no-scrollbar"
                                minH="8"
                                pb={{ base: 1, lg: 0 }}
                            >
                                {(["all", ...categories] as const).map((cat) => {
                                    const active = category === cat;
                                    return (
                                        <chakra.button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            aria-pressed={active}
                                            position="relative"
                                            flexShrink={0}
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
                                            {cat === "all" ? "All" : CATEGORY_LABEL[cat] ?? cat}
                                        </chakra.button>
                                    );
                                })}
                            </HStack>

                            <HStack gap={5} w={{ base: "full", lg: "auto" }}>
                                <Box position="relative" w={{ base: "full", lg: "64" }}>
                                    <Input
                                        type="search"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search projects"
                                        aria-label="Search projects"
                                        variant="flushed"
                                        pl={7}
                                        fontSize="sm"
                                        borderBottomColor="border"
                                        _focusVisible={{ borderBottomColor: "primary.500", boxShadow: "0 1px 0 0 var(--chakra-colors-primary-500)" }}
                                    />
                                    <Box position="absolute" left={0} top="50%" transform="translateY(-50%)" color="text.muted" pointerEvents="none">
                                        <LuSearch size={16} aria-hidden="true" />
                                    </Box>
                                </Box>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as SortKey)}
                                    aria-label="Sort projects"
                                    style={{
                                        padding: "8px 4px",
                                        background: "transparent",
                                        borderBottom: "1px solid rgba(0,0,0,0.08)",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        color: "var(--chakra-colors-text-secondary)",
                                    }}
                                >
                                    <option value="newest">Newest</option>
                                    <option value="views">Most viewed</option>
                                    <option value="featured">Featured first</option>
                                </select>
                            </HStack>
                        </Flex>

                        {/* Index body */}
                        {loading ? (
                            <ProjectsSkeleton />
                        ) : error ? (
                            <ErrorState
                                title="Couldn't load the projects"
                                description={errorMessage(error)}
                                onRetry={reload}
                                retrying={refreshing}
                            />
                        ) : projects.length === 0 ? (
                            <EmptyState
                                icon={<LuFolderOpen />}
                                title="No projects yet"
                                description="Published projects will appear here."
                                action={
                                    <Button asChild size="sm" variant="outline" rounded="md">
                                        <Link href="/experience">See my experience</Link>
                                    </Button>
                                }
                            />
                        ) : visible.length === 0 ? (
                            <EmptyState
                                icon={<LuSearch />}
                                title="No projects match"
                                description="Try another category or search term."
                                action={
                                    <Button onClick={resetFilters} size="sm" variant="outline" rounded="md">
                                        Reset filters
                                    </Button>
                                }
                            />
                        ) : (
                            <VStack gap={{ base: 10, md: 16 }} align="stretch">
                                {spotlight && <Spotlight project={spotlight} />}

                                {gridItems.length > 0 && (
                                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(12, 1fr)" }} gap={8}>
                                        {gridItems.map((project, i) => (
                                            <GridItem key={project.id} colSpan={{ base: 1, md: 1, lg: spanFor(i) }}>
                                                <ProjectCard project={project} />
                                            </GridItem>
                                        ))}
                                    </Grid>
                                )}
                            </VStack>
                        )}
                    </Container>
                </PageEntrance>

                <Footer />
            </Box>
        </PageWrapper>
    );
}

/** The featured (or newest) entry, oversized. */
function Spotlight({ project }: { project: Project }) {
    const thumb = mediaUrl(project.thumbnail_url);
    return (
        <LinkBox as="article" className="group" position="relative">
            <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={{ base: 6, lg: 10 }} alignItems="center">
                <GridItem colSpan={{ base: 1, lg: 7 }}>
                    <Box
                        position="relative"
                        overflow="hidden"
                        rounded="2xl"
                        borderWidth="1px"
                        borderColor="border"
                        aspectRatio={16 / 10}
                        bg="primary.50"
                        transitionProperty="border-color, box-shadow"
                        transitionDuration="moderate"
                        _groupHover={CARD_HOVER}
                    >
                        {thumb ? (
                            <Image src={thumb} alt="" objectFit="cover" w="full" h="full" />
                        ) : (
                            <Flex w="full" h="full" align="center" justify="center" color="primary.300">
                                <LuFolderOpen size={48} aria-hidden="true" />
                            </Flex>
                        )}
                    </Box>
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 5 }}>
                    <VStack align="flex-start" gap={4}>
                        <Text textStyle="meta" color="text.muted">
                            {project.featured ? "Featured" : "Latest"} · {CATEGORY_LABEL[project.category] ?? project.category}
                        </Text>
                        <Heading
                            as="h2"
                            textStyle="sectionTitle"
                            color="text.primary"
                            transitionProperty="color"
                            transitionDuration="fast"
                            _groupHover={{ color: "primary.600" }}
                        >
                            <LinkOverlay asChild>
                                <Link href={`/projects/${project.id}`}>{project.title}</Link>
                            </LinkOverlay>
                        </Heading>
                        {(project.short_description || project.description) && (
                            <Text textStyle="body" color="text.secondary" lineClamp={3}>
                                {project.short_description || project.description}
                            </Text>
                        )}
                        {project.technologies.length > 0 && (
                            <Text fontSize="sm" color="text.muted">
                                {project.technologies.slice(0, 6).join(" / ")}
                            </Text>
                        )}
                        <HStack gap={4} textStyle="meta" color="text.muted">
                            <Text>{timelineLabel(project)}</Text>
                            <Text>
                                {project.view_count.toLocaleString("en-US")} {project.view_count === 1 ? "view" : "views"}
                            </Text>
                        </HStack>
                        <HStack gap={4} pt={2} flexWrap="wrap">
                            <HStack gap={2} color="primary.600" fontWeight={600} fontSize="sm">
                                <Text>Read the case study</Text>
                                <LuArrowRight size={16} aria-hidden="true" />
                            </HStack>
                            {project.demo_url && (
                                <Button
                                    asChild
                                    size="sm"
                                    rounded="md"
                                    bg="primary.500"
                                    color="white"
                                    _hover={{ bg: "primary.600" }}
                                    _active={{ bg: "primary.700" }}
                                    position="relative"
                                    zIndex={1}
                                    gap={1.5}
                                >
                                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                                        Live demo <LuArrowUpRight size={14} aria-hidden="true" />
                                    </a>
                                </Button>
                            )}
                        </HStack>
                    </VStack>
                </GridItem>
            </Grid>
        </LinkBox>
    );
}

/** Same shapes as the loaded index: spotlight row, then the 7/5 card grid. */
function ProjectsSkeleton() {
    return (
        <VStack gap={{ base: 10, md: 16 }} align="stretch" aria-busy="true" aria-label="Loading projects">
            <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={{ base: 6, lg: 10 }} alignItems="center">
                <GridItem colSpan={{ base: 1, lg: 7 }}>
                    <Skeleton aspectRatio={16 / 10} rounded="2xl" />
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 5 }}>
                    <VStack align="stretch" gap={4}>
                        <Skeleton h="4" w="32" />
                        <Skeleton h="10" w="80%" />
                        <Skeleton h="16" w="full" />
                        <Skeleton h="4" w="48" />
                    </VStack>
                </GridItem>
            </Grid>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(12, 1fr)" }} gap={8}>
                {[0, 1, 2, 3].map((i) => (
                    <GridItem key={i} colSpan={{ base: 1, md: 1, lg: spanFor(i) }}>
                        <ProjectCardSkeleton />
                    </GridItem>
                ))}
            </Grid>
        </VStack>
    );
}
