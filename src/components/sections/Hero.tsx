"use client";

import NextLink from "next/link";
import Image from "next/image";
import { Box, Button, Container, Flex, Grid, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { LuArrowRight } from "react-icons/lu";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import StageSlot from "@/components/three/stage/StageSlot";
import OfficeRive from "@/components/hero-rive/OfficeRive";
import { entrance, primaryButton, secondaryButton } from "@/components/home/ui";

/** Live status from the admin settings. The row keeps its height either way, so nothing below it moves. */
function Availability({ available }: { available: boolean }) {
    return (
        <Box minH="6" css={entrance(3)}>
            {available ? (
                <HStack gap="2" textStyle="label" color="text.secondary">
                    <Box as="span" boxSize="2" borderRadius="full" bg="green.500" flexShrink={0} aria-hidden="true" />
                    <Text as="span">Available for new projects</Text>
                </HStack>
            ) : null}
        </Box>
    );
}

/**
 * "Working from Nairobi": the photoreal globe with its Nairobi pin, beside a
 * short location note. Self-contained so it can move anywhere inside the
 * page's StageProvider; the globe slot registers with the shared renderer by id.
 */
export function LocationBand() {
    return (
        <Box as="section" aria-labelledby="location-title" pb={{ base: "10", lg: "12" }}>
            <Container maxW="7xl" px={{ base: "4", sm: "6", lg: "8" }}>
                <Grid
                    templateColumns={{ base: "minmax(0, 1fr)", md: "minmax(0, 5fr) minmax(0, 6fr)" }}
                    gap={{ base: "8", md: "12", lg: "16" }}
                    alignItems="center"
                >
                    <StageSlot
                        id="globe"
                        poster="/images/home/globe-poster.webp"
                        posterSizes="(min-width: 768px) 40vw, 100vw"
                        label="Photoreal globe of the Earth with a small pin on Nairobi, Kenya"
                        aspectRatio="1 / 1"
                        w="full"
                        maxW="34rem"
                        mx={{ base: "auto", md: "0" }}
                    />
                    <Stack gap="4" maxW="32rem" minW="0">
                        <Heading
                            as="h2"
                            id="location-title"
                            textStyle="sectionTitle"
                            color="text.primary"
                            textDecorationLine="underline"
                            textDecorationColor="primary.500"
                            textDecorationThickness="3px"
                            textUnderlineOffset="7px"
                            css={{ textDecorationSkipInk: "none" }}
                        >
                            Working from Nairobi
                        </Heading>
                        <Text textStyle="lead" color="text.secondary">
                            I&rsquo;m based in Nairobi, Kenya, on East Africa Time (UTC+3), and I work with clients
                            remotely.
                        </Text>
                        <Text textStyle="meta" color="text.muted">
                            Nairobi &middot; 1.29&deg; S, 36.82&deg; E
                        </Text>
                    </Stack>
                </Grid>
            </Container>
        </Box>
    );
}

export default function Hero() {
    const settings = usePublicSettings();

    return (
        <>
            <Box as="section" aria-labelledby="hero-title" pt={{ base: "28", md: "32" }} pb={{ base: "16", lg: "20" }}>
                <Container maxW="7xl" px={{ base: "4", sm: "6", lg: "8" }}>
                    <Grid
                        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 7fr) minmax(0, 5fr)" }}
                        gap={{ base: "12", lg: "16" }}
                        alignItems="center"
                    >
                        <Stack gap="6" minW="0">
                            {/* Name group: circular portrait on the left, name and intro beside it. */}
                            <Flex
                                direction={{ base: "column", sm: "row" }}
                                align={{ base: "start", sm: "center" }}
                                gap={{ base: "5", sm: "6", lg: "8" }}
                                minW="0"
                            >
                                <Box
                                    position="relative"
                                    flexShrink={0}
                                    boxSize={{ base: "24", sm: "28", lg: "32" }}
                                    borderRadius="full"
                                    overflow="hidden"
                                    bg="primary.100"
                                    shadow="md"
                                    css={entrance(0)}
                                >
                                    <Image
                                        src="/images/victor-avatar.webp"
                                        alt="Portrait of Victor Mbugua"
                                        fill
                                        sizes="(min-width: 1024px) 160px, (min-width: 640px) 128px, 96px"
                                        style={{ objectFit: "cover" }}
                                    />
                                </Box>
                                {/* Sized as a container so the name can shrink to stay on one line. */}
                                <Stack gap="3" flex="1" minW="0" w={{ base: "full", sm: "auto" }} css={{ containerType: "inline-size" }}>
                                    <Heading
                                        as="h1"
                                        id="hero-title"
                                        textStyle="heroTitle"
                                        fontSize="min(clamp(3rem, 2rem + 4vw, 4.5rem), 12.5cqi)"
                                        whiteSpace="nowrap"
                                        color="text.primary"
                                        css={entrance(0)}
                                    >
                                        Victor{" "}
                                        <Box as="span" color="primary.500">
                                            Mbugua
                                        </Box>
                                    </Heading>
                                    <Text textStyle="lead" color="text.primary" fontWeight="500" css={entrance(1)}>
                                        Full-stack developer and UI/UX designer in Nairobi, Kenya
                                    </Text>
                                </Stack>
                            </Flex>
                            <Text textStyle="lead" color="text.secondary" maxW="36rem" css={entrance(2)}>
                                I design and build web products end to end: the database, the API, the interface and the AI
                                features inside it.
                            </Text>
                            <Availability available={settings.available_for_work} />
                            <Flex gap="3" wrap="wrap" css={entrance(4)}>
                                <Button asChild {...primaryButton}>
                                    <NextLink href="/projects">
                                        View projects
                                        <LuArrowRight aria-hidden="true" />
                                    </NextLink>
                                </Button>
                                <Button asChild {...secondaryButton}>
                                    <a href="#contact">Get in touch</a>
                                </Button>
                            </Flex>
                        </Stack>

                        <Box
                            position="relative"
                            w="full"
                            maxW={{ base: "28rem", lg: "none" }}
                            mx={{ base: "auto", lg: "0" }}
                            aspectRatio="4 / 5"
                            borderRadius="md"
                            overflow="hidden"
                        >
                            <OfficeRive sizes="(min-width: 1024px) 470px, (min-width: 480px) 448px, 100vw" />
                        </Box>
                    </Grid>
                </Container>
            </Box>
        </>
    );
}
