"use client";

import NextLink from "next/link";
import Image from "next/image";
import { Box, Container, Flex, Grid, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { useApi } from "@/hooks/useApi";
import { mediaUrl, type Project, type ProjectCategory } from "@/lib/api";
import { ErrorState, errorMessage } from "@/components/ui/states";
import { ArrowLink, EASE_OUT, Placeholder, backendImage } from "./ui";
import { formatDateRange } from "./format";

const PATH = "/projects/featured?limit=4";

const CATEGORY: Record<ProjectCategory, string> = {
    web_app: "Web app",
    mobile_app: "Mobile app",
    desktop_app: "Desktop app",
    api: "API",
    library: "Library",
    tool: "Tool",
    other: "Other",
};

function RowSkeleton() {
    return (
        <Stack gap={{ base: "14", lg: "20" }} aria-hidden="true">
            {[0].map((i) => (
                <Grid
                    key={i}
                    templateColumns={{ base: "minmax(0, 1fr)", md: "minmax(0, 7fr) minmax(0, 5fr)" }}
                    gap={{ base: "6", md: "10", lg: "14" }}
                    alignItems="center"
                >
                    <Placeholder aspectRatio="16 / 10" borderRadius="md" order={{ base: 0, md: i % 2 }} />
                    <Stack gap="4" order={{ base: 1, md: i % 2 === 1 ? 0 : 1 }}>
                        <Placeholder h="6" w="70%" />
                        <Placeholder h="4" w="100%" />
                        <Placeholder h="4" w="85%" />
                        <Placeholder h="4" w="50%" />
                    </Stack>
                </Grid>
            ))}
        </Stack>
    );
}

function ProjectRow({ project, flip }: { project: Project; flip: boolean }) {
    const thumbnail = mediaUrl(project.thumbnail_url);
    const dates = formatDateRange(project.start_date, project.end_date, project.is_ongoing);
    const meta = [CATEGORY[project.category] ?? null, dates].filter(Boolean).join(" · ");
    const href = `/projects/${project.id}`;

    return (
        <Grid
            as="li"
            templateColumns={{ base: "minmax(0, 1fr)", md: thumbnail ? "minmax(0, 7fr) minmax(0, 5fr)" : "minmax(0, 1fr)" }}
            gap={{ base: "6", md: "10", lg: "14" }}
            alignItems="center"
        >
            {thumbnail ? (
                <Box
                    order={{ base: 0, md: flip ? 1 : 0 }}
                    position="relative"
                    aspectRatio="16 / 10"
                    borderRadius="md"
                    overflow="hidden"
                    bg="primary.50"
                    shadow="sm"
                >
                    <Image
                        {...backendImage(thumbnail)}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 56vw, 100vw"
                        style={{ objectFit: "cover" }}
                    />
                </Box>
            ) : null}

            <Stack gap="3" order={{ base: 1, md: flip ? 0 : 1 }} minW="0" maxW="34rem">
                <Heading as="h3" textStyle="cardTitle" color="text.primary">
                    <Link
                        asChild
                        color="inherit"
                        textDecoration="underline"
                        textDecorationColor="transparent"
                        textUnderlineOffset="4px"
                        transition={`color 160ms ${EASE_OUT}, text-decoration-color 160ms ${EASE_OUT}`}
                        _hover={{ color: "primary.600", textDecorationColor: "currentColor" }}
                        focusRingColor="primary.500"
                    >
                        <NextLink href={href}>{project.title}</NextLink>
                    </Link>
                </Heading>
                {meta ? (
                    <Text textStyle="meta" color="text.muted">
                        {meta}
                    </Text>
                ) : null}
                {project.short_description ? (
                    <Text textStyle="body" color="text.secondary" lineClamp={4}>
                        {project.short_description}
                    </Text>
                ) : null}
                {project.technologies.length > 0 ? (
                    <Text textStyle="meta" color="text.muted">
                        {project.technologies.join(" · ")}
                    </Text>
                ) : null}
                {project.demo_url || project.source_code_url ? (
                <Flex gap="5" rowGap="2" wrap="wrap" pt="1">
                    {project.demo_url ? (
                        <ArrowLink href={project.demo_url} external>
                            Live site
                        </ArrowLink>
                    ) : null}
                    {project.source_code_url ? (
                        <ArrowLink href={project.source_code_url} external>
                            Source code
                        </ArrowLink>
                    ) : null}
                </Flex>
                ) : null}
            </Stack>
        </Grid>
    );
}

/** Featured projects from the admin. Hidden when nothing is featured. */
export default function FeaturedProjects() {
    const { data, error, loading, refreshing, reload } = useApi<Project[]>(PATH);
    // The home page shows one featured project; the rest live on /projects.
    const projects = (data ?? []).slice(0, 1);

    if (!loading && !error && projects.length === 0) return null;

    return (
        <Box as="section" id="projects" aria-labelledby="projects-title" py={{ base: "16", lg: "24" }}>
            <Container maxW="7xl" px={{ base: "4", sm: "6", lg: "8" }}>
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "start", md: "end" }}
                    gap="4"
                    mb={{ base: "10", lg: "14" }}
                >
                    <Stack gap="3" maxW="36rem">
                        <Heading
                            as="h2"
                            id="projects-title"
                            textStyle="sectionTitle"
                            color="text.primary"
                            textDecorationLine="underline"
                            textDecorationColor="primary.500"
                            textDecorationThickness="3px"
                            textUnderlineOffset="7px"
                            css={{ textDecorationSkipInk: "none" }}
                        >
                            Selected work
                        </Heading>
                        <Text textStyle="body" color="text.secondary">
                            A project I&rsquo;ve built recently, with a link to the details.
                        </Text>
                    </Stack>
                    <ArrowLink href="/projects">All projects</ArrowLink>
                </Flex>

                <Box aria-busy={loading || refreshing}>
                    {loading ? (
                        <RowSkeleton />
                    ) : error ? (
                        <ErrorState
                            title="Couldn't load projects"
                            description={errorMessage(error)}
                            onRetry={reload}
                            retrying={refreshing}
                        />
                    ) : (
                        <Stack as="ol" gap={{ base: "14", lg: "20" }} listStyleType="none">
                            {projects.map((project, index) => (
                                <ProjectRow key={project.id} project={project} flip={index % 2 === 1} />
                            ))}
                        </Stack>
                    )}
                </Box>
            </Container>
        </Box>
    );
}
