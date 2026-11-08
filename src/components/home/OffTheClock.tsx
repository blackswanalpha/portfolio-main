"use client";

import { Box, Container, Grid, Heading, Stack, Text } from "@chakra-ui/react";
import StageSlot from "@/components/three/stage/StageSlot";

const HOBBIES = [
    { title: "Photography", text: "Capturing urban landscapes and street life when I travel." },
    { title: "Music production", text: "Making lo-fi beats to code to in my spare time." },
    { title: "Fitness", text: "Staying active with cycling and gym sessions." },
];

export default function OffTheClock() {
    return (
        <Box as="section" aria-labelledby="hobbies-title" py={{ base: "16", lg: "24" }}>
            <Container maxW="7xl" px={{ base: "4", sm: "6", lg: "8" }}>
                <Grid
                    templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 7fr)" }}
                    gap={{ base: "10", lg: "16" }}
                    alignItems="center"
                >
                    <Stack gap="6" minW="0" maxW="30rem">
                        <Heading
                            as="h2"
                            id="hobbies-title"
                            textStyle="sectionTitle"
                            color="text.primary"
                            textDecorationLine="underline"
                            textDecorationColor="primary.500"
                            textDecorationThickness="3px"
                            textUnderlineOffset="7px"
                            css={{ textDecorationSkipInk: "none" }}
                        >
                            Off the clock
                        </Heading>
                        <Stack as="ul" gap="5" listStyleType="none">
                            {HOBBIES.map((hobby) => (
                                <Box as="li" key={hobby.title}>
                                    <Heading as="h3" textStyle="cardTitle" color="text.primary">
                                        {hobby.title}
                                    </Heading>
                                    <Text textStyle="body" color="text.secondary" mt="1">
                                        {hobby.text}
                                    </Text>
                                </Box>
                            ))}
                        </Stack>
                    </Stack>
                    <StageSlot
                        id="hobbies"
                        poster="/images/home/hobbies-poster.webp"
                        posterSizes="(min-width: 1024px) 700px, 100vw"
                        label="A film camera, studio headphones and a hex dumbbell on a pale studio floor"
                        aspectRatio="3 / 2"
                        w="full"
                        bg="primary.50"
                        borderRadius="md"
                        shadow="sm"
                        trackPointer
                    />
                </Grid>
            </Container>
        </Box>
    );
}
