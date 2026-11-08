"use client";

import { Box, Button, Container, Flex, Heading, HStack, Image, Skeleton, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LuBriefcase, LuCircleCheck, LuMapPin } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper, { PageEntrance } from "@/components/PageWrapper";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { mediaUrl, type Paginated, type WorkExperience } from "@/lib/api";
import { dateKey, yearOf } from "@/components/projects/shared";

type Filter = "all" | "current" | "past";

const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "All roles" },
    { value: "current", label: "Current" },
    { value: "past", label: "Past" },
];

const EXPERIENCE_PATH = "/work-experience/?public_only=true&page_size=100";

/** Map a backend WorkExperience onto what the timeline renders. */
function toView(x: WorkExperience) {
    const start = yearOf(x.start_date);
    const end = x.is_current ? "Present" : yearOf(x.end_date) || "Present";
    return {
        id: x.id,
        range: start ? `${start} – ${end}` : end,
        endLabel: end,
        role: x.position,
        company: x.company,
        location: x.location ?? "",
        description: x.description ?? "",
        achievements: x.responsibilities ?? [],
        technologies: x.technologies ?? [],
        isCurrent: x.is_current,
        logo: mediaUrl(x.company_logo_url),
    };
}

export default function ExperiencePage() {
    const { data, error, loading, refreshing, reload } = useApi<Paginated<WorkExperience>>(EXPERIENCE_PATH);
    const [filter, setFilter] = useState<Filter>("all");

    const items = useMemo(
        () =>
            [...(data?.items ?? [])].sort(
                (a, b) => a.order - b.order || dateKey(b.start_date).localeCompare(dateKey(a.start_date))
            ),
        [data]
    );

    const filtered = items
        .filter((x) => (filter === "all" ? true : filter === "current" ? x.is_current : !x.is_current))
        .map(toView);

    return (
        <PageWrapper>
            <Box minH="100vh" bg="background">
                <Navbar />

                <PageEntrance as="main">
                    <Container maxW="7xl" pt={{ base: 32, md: 40 }} pb={20} px={{ base: 4, sm: 6, lg: 8 }}>
                        {/* Header */}
                        <VStack align="center" gap={6} mb={{ base: 14, md: 20 }} textAlign="center">
                            <Heading as="h1" textStyle="pageTitle" color="text.primary">
                                My professional journey
                            </Heading>
                            <Text textStyle="lead" color="text.secondary" maxW="3xl">
                                Crafting high-performance web applications and intuitive user interfaces. A timeline of
                                innovation, leadership, and technical mastery.
                            </Text>

                            {/* Filter */}
                            <HStack role="group" aria-label="Filter roles" p={1} bg="surface" rounded="md" borderWidth="1px" borderColor="border">
                                {FILTERS.map((f) => {
                                    const active = filter === f.value;
                                    return (
                                        <Button
                                            key={f.value}
                                            size="sm"
                                            rounded="md"
                                            px={5}
                                            variant="ghost"
                                            aria-pressed={active}
                                            bg={active ? "primary.500" : "transparent"}
                                            color={active ? "white" : "text.secondary"}
                                            _hover={active ? { bg: "primary.600" } : { color: "text.primary", bg: "blackAlpha.50" }}
                                            _active={active ? { bg: "primary.700" } : { bg: "blackAlpha.100" }}
                                            onClick={() => setFilter(f.value)}
                                        >
                                            {f.label}
                                        </Button>
                                    );
                                })}
                            </HStack>
                        </VStack>

                        {/* Timeline */}
                        {loading ? (
                            <TimelineSkeleton />
                        ) : error ? (
                            <ErrorState
                                title="Couldn't load the experience timeline"
                                description={errorMessage(error)}
                                onRetry={reload}
                                retrying={refreshing}
                            />
                        ) : items.length === 0 ? (
                            <EmptyState
                                icon={<LuBriefcase />}
                                title="No experience to show yet"
                                description="Roles will appear here once they're published."
                                action={
                                    <Button asChild size="sm" variant="outline" rounded="md">
                                        <Link href="/projects">Browse projects</Link>
                                    </Button>
                                }
                            />
                        ) : filtered.length === 0 ? (
                            <EmptyState
                                icon={<LuBriefcase />}
                                title={filter === "current" ? "No current roles" : "No past roles"}
                                description="Switch the filter to see the rest of the timeline."
                                action={
                                    <Button size="sm" variant="outline" rounded="md" onClick={() => setFilter("all")}>
                                        Show all roles
                                    </Button>
                                }
                            />
                        ) : (
                            <Box position="relative">
                                {/* Spine */}
                                <Box
                                    position="absolute"
                                    left={{ base: "8", md: "50%" }}
                                    transform={{ base: "none", md: "translateX(-50%)" }}
                                    top="0"
                                    bottom="0"
                                    w="1px"
                                    bg="blackAlpha.200"
                                    aria-hidden="true"
                                />

                                <VStack as="ol" gap={16} align="stretch" position="relative">
                                    {filtered.map((exp, index) => {
                                        const left = index % 2 === 0;
                                        return (
                                            <Flex
                                                as="li"
                                                key={exp.id}
                                                direction={{ base: "column", md: "row" }}
                                                align={{ base: "flex-start", md: "center" }}
                                                gap={8}
                                                position="relative"
                                            >
                                                {/* Node */}
                                                <Box
                                                    position="absolute"
                                                    left={{ base: "8", md: "50%" }}
                                                    transform="translate(-50%, -50%)"
                                                    top={{ base: "2.5rem", md: "50%" }}
                                                    boxSize="3"
                                                    rounded="full"
                                                    bg={exp.isCurrent ? "primary.500" : "surface"}
                                                    borderWidth="2px"
                                                    borderColor="primary.500"
                                                    zIndex={1}
                                                    aria-hidden="true"
                                                />

                                                {/* Dates */}
                                                <Box
                                                    w={{ base: "full", md: "50%" }}
                                                    textAlign={{ base: "left", md: left ? "right" : "left" }}
                                                    order={{ base: 1, md: left ? 1 : 2 }}
                                                    pl={{ base: 16, md: left ? 0 : 12 }}
                                                    pr={{ base: 0, md: left ? 12 : 0 }}
                                                >
                                                    <Text fontFamily="serif" fontSize="2xl" fontWeight={600} lineHeight="1.2" color="text.primary">
                                                        {exp.endLabel}
                                                    </Text>
                                                    <Text textStyle="meta" color="text.muted" mt={1}>
                                                        {exp.range}
                                                    </Text>
                                                    {exp.location && (
                                                        <HStack
                                                            justify={{ base: "flex-start", md: left ? "flex-end" : "flex-start" }}
                                                            gap={1.5}
                                                            color="text.muted"
                                                            fontSize="sm"
                                                            mt={1}
                                                        >
                                                            <LuMapPin size={14} aria-hidden="true" />
                                                            <Text>{exp.location}</Text>
                                                        </HStack>
                                                    )}
                                                </Box>

                                                {/* Card */}
                                                <Box
                                                    w={{ base: "full", md: "50%" }}
                                                    order={{ base: 2, md: left ? 2 : 1 }}
                                                    pl={{ base: 12, md: left ? 12 : 0 }}
                                                    pr={{ base: 0, md: left ? 0 : 12 }}
                                                >
                                                    <Box bg="surface" p={6} rounded="2xl" borderWidth="1px" borderColor="border">
                                                        <Flex align="center" gap={4} mb={5}>
                                                            <Flex
                                                                boxSize={14}
                                                                flexShrink={0}
                                                                p={2}
                                                                rounded="xl"
                                                                bg="background"
                                                                borderWidth="1px"
                                                                borderColor="border"
                                                                align="center"
                                                                justify="center"
                                                                color="text.muted"
                                                            >
                                                                {exp.logo ? (
                                                                    <Image src={exp.logo} alt="" objectFit="contain" w="full" h="full" rounded="md" />
                                                                ) : (
                                                                    <LuBriefcase size={22} aria-hidden="true" />
                                                                )}
                                                            </Flex>
                                                            <Box minW={0}>
                                                                <Heading as="h2" textStyle="cardTitle" color="text.primary">
                                                                    {exp.role}
                                                                </Heading>
                                                                <HStack gap={2} flexWrap="wrap" mt={0.5}>
                                                                    <Text fontWeight={500} color="text.secondary">
                                                                        {exp.company}
                                                                    </Text>
                                                                    {exp.isCurrent && (
                                                                        <Text
                                                                            as="span"
                                                                            fontSize="xs"
                                                                            fontWeight={500}
                                                                            color="primary.700"
                                                                            bg="primary.50"
                                                                            px={2}
                                                                            py={0.5}
                                                                            rounded="md"
                                                                        >
                                                                            Current role
                                                                        </Text>
                                                                    )}
                                                                </HStack>
                                                            </Box>
                                                        </Flex>

                                                        {(exp.description || exp.achievements.length > 0) && (
                                                            <VStack align="flex-start" gap={4}>
                                                                {exp.description && (
                                                                    <Text textStyle="body" color="text.secondary">
                                                                        {exp.description}
                                                                    </Text>
                                                                )}
                                                                {exp.achievements.length > 0 && (
                                                                    <VStack as="ul" align="flex-start" gap={3}>
                                                                        {exp.achievements.map((ach, i) => (
                                                                            <HStack as="li" key={i} align="flex-start" gap={3} color="text.primary" fontSize="sm">
                                                                                <Box mt={0.5} color="text.muted" flexShrink={0}>
                                                                                    <LuCircleCheck size={16} aria-hidden="true" />
                                                                                </Box>
                                                                                <Text>{ach}</Text>
                                                                            </HStack>
                                                                        ))}
                                                                    </VStack>
                                                                )}
                                                            </VStack>
                                                        )}

                                                        {exp.technologies.length > 0 && (
                                                            <Box borderTopWidth="1px" borderColor="border" mt={6} pt={5}>
                                                                <Text textStyle="label" color="text.muted" mb={3}>
                                                                    Technologies
                                                                </Text>
                                                                <Flex gap={2} flexWrap="wrap">
                                                                    {exp.technologies.map((tech) => (
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
                                                    </Box>
                                                </Box>
                                            </Flex>
                                        );
                                    })}
                                </VStack>
                            </Box>
                        )}

                        {/* Call to action. There is no resume file to download yet, so it
                            points at the contact form instead of a dead button. */}
                        <Box mt={{ base: 20, md: 32 }} textAlign="center" py={{ base: 14, md: 20 }} borderTopWidth="1px" borderColor="border">
                            <Heading as="h2" textStyle="sectionTitle" color="text.primary" mb={4}>
                                Want to dive deeper?
                            </Heading>
                            <Text textStyle="lead" color="text.secondary" mb={8} maxW="2xl" mx="auto">
                                Get in touch for my full resume, with more detail on my projects, certifications, and educational
                                background.
                            </Text>
                            <Button
                                asChild
                                size="lg"
                                rounded="md"
                                px={8}
                                bg="primary.500"
                                color="white"
                                _hover={{ bg: "primary.600" }}
                                _active={{ bg: "primary.700" }}
                            >
                                <Link href="/#contact">Get in touch</Link>
                            </Button>
                        </Box>
                    </Container>
                </PageEntrance>

                <Footer />
            </Box>
        </PageWrapper>
    );
}

/** Two timeline rows in their loaded proportions. */
function TimelineSkeleton() {
    return (
        <VStack gap={16} align="stretch" aria-busy="true" aria-label="Loading experience">
            {[0, 1].map((i) => {
                const left = i % 2 === 0;
                return (
                    <Flex key={i} direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "center" }} gap={8}>
                        <Box
                            w={{ base: "full", md: "50%" }}
                            order={{ base: 1, md: left ? 1 : 2 }}
                            pl={{ base: 16, md: left ? 0 : 12 }}
                            pr={{ base: 0, md: left ? 12 : 0 }}
                        >
                            <VStack align={{ base: "flex-start", md: left ? "flex-end" : "flex-start" }} gap={2}>
                                <Skeleton h="7" w="24" />
                                <Skeleton h="4" w="28" />
                            </VStack>
                        </Box>
                        <Box
                            w={{ base: "full", md: "50%" }}
                            order={{ base: 2, md: left ? 2 : 1 }}
                            pl={{ base: 12, md: left ? 12 : 0 }}
                            pr={{ base: 0, md: left ? 0 : 12 }}
                        >
                            <Box bg="surface" p={6} rounded="2xl" borderWidth="1px" borderColor="border">
                                <Flex align="center" gap={4} mb={5}>
                                    <Skeleton boxSize={14} rounded="xl" />
                                    <VStack align="stretch" gap={2} flex="1">
                                        <Skeleton h="5" w="60%" />
                                        <Skeleton h="4" w="40%" />
                                    </VStack>
                                </Flex>
                                <Skeleton h="16" w="full" />
                            </Box>
                        </Box>
                    </Flex>
                );
            })}
        </VStack>
    );
}
