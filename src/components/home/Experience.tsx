"use client";

import { Box, Container, Flex, Grid, Heading, Stack, Text } from "@chakra-ui/react";
import { useApi } from "@/hooks/useApi";
import type { Paginated, WorkExperience } from "@/lib/api";
import { ErrorState, errorMessage } from "@/components/ui/states";
import { ArrowLink, Placeholder } from "./ui";
import { formatDateRange } from "./format";

const PATH = "/work-experience/?public_only=true&page_size=4";

function RoleSkeleton() {
    return (
        <Stack as="ul" gap="0" aria-hidden="true">
            {[0, 1, 2].map((i) => (
                <Box as="li" key={i} py="6" borderTopWidth={i === 0 ? "0" : "1px"} borderColor="border">
                    <Flex justify="space-between" gap="4" wrap="wrap">
                        <Stack gap="2" flex="1" minW="12rem">
                            <Placeholder h="5" w="60%" />
                            <Placeholder h="4" w="40%" />
                        </Stack>
                        <Placeholder h="4" w="8rem" />
                    </Flex>
                    <Placeholder h="4" w="90%" mt="4" />
                </Box>
            ))}
        </Stack>
    );
}

function Role({ role, first }: { role: WorkExperience; first: boolean }) {
    const range = formatDateRange(role.start_date, role.end_date, role.is_current);
    return (
        <Box as="li" py="6" borderTopWidth={first ? "0" : "1px"} borderColor="border">
            <Flex justify="space-between" align="baseline" columnGap="6" rowGap="1" wrap="wrap">
                <Box minW="0" flex="1 1 16rem">
                    <Heading as="h3" textStyle="cardTitle" color="text.primary">
                        {role.position}
                    </Heading>
                    <Text textStyle="body" color="text.secondary">
                        {role.company}
                        {role.location ? ` · ${role.location}` : ""}
                    </Text>
                </Box>
                {range ? (
                    <Text textStyle="meta" color="text.muted" whiteSpace="nowrap">
                        {range}
                    </Text>
                ) : null}
            </Flex>
            {role.description ? (
                <Text textStyle="body" color="text.secondary" mt="3" maxW="62ch">
                    {role.description}
                </Text>
            ) : null}
            {role.technologies.length > 0 ? (
                <Text textStyle="meta" color="text.muted" mt="3">
                    {role.technologies.join(" · ")}
                </Text>
            ) : null}
        </Box>
    );
}

/** Work history from the admin (public roles only). Hidden when there is none. */
export default function Experience() {
    const { data, error, loading, refreshing, reload } = useApi<Paginated<WorkExperience>>(PATH);
    const roles = data?.items ?? [];

    if (!loading && !error && roles.length === 0) return null;

    return (
        <Box as="section" id="experience" aria-labelledby="experience-title" py={{ base: "16", lg: "24" }}>
            <Container maxW="7xl" px={{ base: "4", sm: "6", lg: "8" }}>
                <Grid
                    templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 4fr) minmax(0, 8fr)" }}
                    gap={{ base: "8", lg: "16" }}
                >
                    <Stack gap="4" alignSelf="start" minW="0">
                        <Heading
                            as="h2"
                            id="experience-title"
                            textStyle="sectionTitle"
                            color="text.primary"
                            textDecorationLine="underline"
                            textDecorationColor="primary.500"
                            textDecorationThickness="3px"
                            textUnderlineOffset="7px"
                            css={{ textDecorationSkipInk: "none" }}
                        >
                            Experience
                        </Heading>
                        <Text textStyle="body" color="text.secondary" maxW="28rem">
                            The roles I&rsquo;ve held most recently and what I worked on.
                        </Text>
                        <Box>
                            <ArrowLink href="/experience">Full history</ArrowLink>
                        </Box>
                    </Stack>

                    <Box minW="0" aria-busy={loading || refreshing}>
                        {loading ? (
                            <RoleSkeleton />
                        ) : error ? (
                            <ErrorState
                                compact
                                title="Couldn't load my experience"
                                description={errorMessage(error)}
                                onRetry={reload}
                                retrying={refreshing}
                            />
                        ) : (
                            <Box as="ol" listStyleType="none">
                                {roles.map((role, index) => (
                                    <Role key={role.id} role={role} first={index === 0} />
                                ))}
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Container>
        </Box>
    );
}
