"use client";

import { Box, Flex, Heading, HStack, Image, LinkBox, LinkOverlay, Skeleton, Text } from "@chakra-ui/react";
import Link from "next/link";
import { LuArrowRight, LuArrowUpRight, LuFolderOpen } from "react-icons/lu";
import { mediaUrl, type Project } from "@/lib/api";
import { CATEGORY_LABEL, projectYear } from "./shared";

/** Quiet raised-card hover: hairline darkens, small neutral shadow. No lift, no zoom. */
export const CARD_HOVER = {
    borderColor: "blackAlpha.200",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.16)",
} as const;

export function ProjectCard({ project, variant = "grid" }: { project: Project; variant?: "grid" | "mini" }) {
    const thumb = mediaUrl(project.thumbnail_url);
    const mini = variant === "mini";
    const year = projectYear(project);

    return (
        <LinkBox
            as="article"
            className="group"
            position="relative"
            display="flex"
            flexDirection="column"
            h="full"
            bg="surface"
            rounded="2xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="border"
            transitionProperty="border-color, box-shadow"
            transitionDuration="moderate"
            transitionTimingFunction="ease-out"
            _hover={CARD_HOVER}
            _focusWithin={CARD_HOVER}
        >
            <Box position="relative" overflow="hidden" aspectRatio={16 / 10} bg="primary.50">
                {thumb ? (
                    <Image src={thumb} alt="" loading="lazy" objectFit="cover" w="full" h="full" />
                ) : (
                    <Flex w="full" h="full" align="center" justify="center" color="primary.300">
                        <LuFolderOpen size={mini ? 28 : 36} aria-hidden="true" />
                    </Flex>
                )}
            </Box>

            <Flex direction="column" flex="1" p={mini ? 5 : 6} gap={mini ? 2 : 3}>
                <Text textStyle="meta" color="text.muted">
                    {CATEGORY_LABEL[project.category] ?? project.category}
                    {year && ` · ${year}`}
                    {project.featured && " · Featured"}
                </Text>

                <Heading
                    as="h3"
                    textStyle="cardTitle"
                    color="text.primary"
                    transitionProperty="color"
                    transitionDuration="fast"
                    _groupHover={{ color: "primary.600" }}
                >
                    <LinkOverlay asChild>
                        <Link href={`/projects/${project.id}`}>{project.title}</Link>
                    </LinkOverlay>
                </Heading>

                {!mini && (project.short_description || project.description) && (
                    <Text fontSize="sm" color="text.secondary" lineClamp={2}>
                        {project.short_description || project.description}
                    </Text>
                )}

                <Flex align="center" justify="space-between" gap={4} mt="auto" pt={mini ? 1 : 2}>
                    <Text fontSize="xs" color="text.muted" lineClamp={1} minW={0}>
                        {!mini && project.technologies.slice(0, 5).join(" / ")}
                    </Text>
                    <HStack gap={2} flexShrink={0}>
                        {!mini && project.demo_url && (
                            <Box
                                asChild
                                position="relative"
                                zIndex={1}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                boxSize={8}
                                rounded="md"
                                borderWidth="1px"
                                borderColor="border"
                                color="text.secondary"
                                transitionProperty="color, background-color, border-color"
                                transitionDuration="fast"
                                _hover={{ bg: "primary.500", borderColor: "primary.500", color: "white" }}
                                _active={{ bg: "primary.600", borderColor: "primary.600", color: "white" }}
                            >
                                <a
                                    href={project.demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Open the live demo of ${project.title}`}
                                >
                                    <LuArrowUpRight size={14} aria-hidden="true" />
                                </a>
                            </Box>
                        )}
                        <Box color="primary.500" aria-hidden="true">
                            <LuArrowRight size={mini ? 14 : 16} />
                        </Box>
                    </HStack>
                </Flex>
            </Flex>
        </LinkBox>
    );
}

/** Placeholder with the card's exact proportions, so loading doesn't shift layout. */
export function ProjectCardSkeleton({ variant = "grid" }: { variant?: "grid" | "mini" }) {
    const mini = variant === "mini";
    return (
        <Box h="full" bg="surface" rounded="2xl" overflow="hidden" borderWidth="1px" borderColor="border" aria-hidden="true">
            <Skeleton aspectRatio={16 / 10} rounded="none" />
            <Flex direction="column" p={mini ? 5 : 6} gap={mini ? 2 : 3}>
                <Skeleton h="4" w="28" />
                <Skeleton h="6" w="70%" />
                {!mini && <Skeleton h="10" w="full" />}
                <Skeleton h="4" w="40%" mt={mini ? 1 : 2} />
            </Flex>
        </Box>
    );
}
