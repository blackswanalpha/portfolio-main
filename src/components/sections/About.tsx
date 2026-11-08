"use client";

import Image from "next/image";
import { Box, Button, Container, Grid, Heading, HStack, Link, Stack, Text } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import { SOCIAL_LINKS } from "@/lib/socialLinks";
import Experience from "@/components/home/Experience";
import Toolkit from "@/components/home/Toolkit";
import OffTheClock from "@/components/home/OffTheClock";
import { RESUME_URL } from "@/components/home/format";
import { EASE_OUT, primaryButton } from "@/components/home/ui";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Box py="3" borderTopWidth="1px" borderColor="border" minW="0">
            <Text as="dt" textStyle="meta" color="text.muted">
                {label}
            </Text>
            <Box as="dd" textStyle="body" color="text.primary" overflowWrap="anywhere">
                {children}
            </Box>
        </Box>
    );
}

/** Icon links to the social profiles in lib/socialLinks (new entries show up here automatically). */
function SocialRow() {
    return (
        <HStack as="ul" gap="2" listStyleType="none" aria-label="Social profiles">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <Box as="li" key={label}>
                    <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        title={label}
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        boxSize={{ base: "10", sm: "11" }}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="border"
                        bg="surface"
                        color="text.secondary"
                        transition={`color 160ms ${EASE_OUT}, border-color 160ms ${EASE_OUT}, transform 120ms ${EASE_OUT}`}
                        _hover={{ color: "primary.600", borderColor: "primary.300" }}
                        _active={{ transform: "translateY(1px)" }}
                        focusRingColor="primary.500"
                    >
                        <Icon size={18} aria-hidden="true" />
                    </Link>
                </Box>
            ))}
        </HStack>
    );
}

export default function About({ hasResume = false }: { hasResume?: boolean }) {
    const settings = usePublicSettings();

    return (
        <>
            <Box as="section" id="about" aria-labelledby="about-title" pt={{ base: "16", lg: "20" }} pb={{ base: "16", lg: "24" }}>
                <Container maxW="7xl" px={{ base: "4", sm: "6", lg: "8" }}>
                    <Grid
                        templateColumns={{ base: "minmax(0, 1fr)", md: "minmax(0, 5fr) minmax(0, 7fr)" }}
                        gap={{ base: "10", md: "12", lg: "20" }}
                        alignItems={{ base: "center", md: "start", lg: "center" }}
                    >
                        <Box
                            position="relative"
                            w="full"
                            maxW={{ base: "26rem", md: "none" }}
                            mx={{ base: "auto", md: "0" }}
                            aspectRatio="1 / 1"
                            borderRadius="md"
                            overflow="hidden"
                            bg="primary.100"
                            shadow="md"
                        >
                            <Image
                                src="/images/victor-mbugua-portrait.jpg"
                                alt="Victor Mbugua"
                                fill
                                sizes="(min-width: 768px) 40vw, 26rem"
                                style={{ objectFit: "cover" }}
                            />
                        </Box>

                        <Stack gap="5" minW="0" maxW="40rem">
                            <Heading
                                as="h2"
                                id="about-title"
                                textStyle="sectionTitle"
                                color="text.primary"
                                textDecorationLine="underline"
                                textDecorationColor="primary.500"
                                textDecorationThickness="3px"
                                textUnderlineOffset="7px"
                                css={{ textDecorationSkipInk: "none" }}
                            >
                                About me
                            </Heading>
                            <Text textStyle="lead" color="text.primary">
                                I&rsquo;m a full-stack developer, DevOps engineer and UI/UX designer, and I build AI
                                features too. I like owning a product end to end, from the database and the deploy
                                pipeline to the design system and the model.
                            </Text>
                            <Text textStyle="body" color="text.secondary">
                                Day to day I ship web applications, automate the cloud setup that runs them, design the
                                screens people use and wire in the AI behind them. I work from Nairobi with startups and
                                established companies, turning rough ideas into products that are ready for real users.
                            </Text>
                            <Text textStyle="body" color="text.secondary">
                                Away from client work I use AI as a creative medium for visual art, music and short
                                films, and I mentor people who are just starting out.
                            </Text>

                            <Grid
                                as="dl"
                                templateColumns={{ base: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }}
                                columnGap="8"
                                mt="2"
                            >
                                <Fact label="Location">Nairobi, Kenya</Fact>
                                <Fact label="Email">
                                    <Link
                                        href="mailto:kamandembugua18@gmail.com"
                                        color="primary.600"
                                        textDecoration="underline"
                                        textDecorationColor="transparent"
                                        textUnderlineOffset="4px"
                                        transition={`text-decoration-color 160ms ${EASE_OUT}`}
                                        _hover={{ textDecorationColor: "currentColor" }}
                                        focusRingColor="primary.500"
                                    >
                                        kamandembugua18@gmail.com
                                    </Link>
                                </Fact>
                                {settings.available_for_work ? <Fact label="Status">Available for new projects</Fact> : null}
                            </Grid>

                            {/* One row: social icons under Location, the CV button under Email (same columns as the facts). */}
                            <Box
                                display={{ base: "flex", sm: "grid" }}
                                flexWrap="wrap"
                                gap="3"
                                gridTemplateColumns={{ sm: "repeat(2, minmax(0, 1fr))" }}
                                columnGap={{ sm: "8" }}
                                alignItems="center"
                                pt="1"
                            >
                                <SocialRow />
                                {hasResume ? (
                                    <Box>
                                        <Button asChild {...primaryButton} shadow="none" px={{ base: "3.5", sm: "5" }}>
                                            <a href={RESUME_URL} download="Victor-Mbugua-CV.pdf">
                                                <LuDownload aria-hidden="true" />
                                                Download CV
                                            </a>
                                        </Button>
                                    </Box>
                                ) : null}
                            </Box>
                        </Stack>
                    </Grid>
                </Container>
            </Box>

            <Experience />
            <Toolkit />
            <OffTheClock />
        </>
    );
}
