import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper, { PageEntrance } from "@/components/PageWrapper";
import ArcadeHub from "@/components/arcade/ArcadeHub";

// The page used to fade in with GSAP from `.reveal-onload` (opacity 0 in CSS),
// so it stayed blank until JavaScript ran, and GSAP's leftover inline transform
// trapped the win dialog's fixed backdrop inside the game area. It now uses the
// site's CSS-only entrance, which never hides content.
export default function PuzzleGamePage() {
  return (
    <PageWrapper>
      <Box minH="100vh" bg="background" pb={20}>
        <Navbar />

        <PageEntrance as="main">
          <Container
            maxW="5xl"
            pt={{ base: 32, md: 40 }}
            pb={{ base: 16, md: 24 }}
            px={{ base: 4, sm: 6, lg: 8 }}
          >
            <VStack align={{ base: "center", md: "start" }} gap={4} mb={10}>
              <Heading
                as="h1"
                textStyle="pageTitle"
                color="text.primary"
                textAlign={{ base: "center", md: "left" }}
              >
                Arcade
              </Heading>
              <Text
                textStyle="lead"
                color="text.secondary"
                maxW="2xl"
                textAlign={{ base: "center", md: "left" }}
              >
                Four small games, built from scratch for the browser: two puzzles, a match-three and
                a brick breaker. Pick one and play. Progress and best scores stay on this device.
              </Text>
            </VStack>

            <ArcadeHub />
          </Container>
        </PageEntrance>

        <Footer />
      </Box>
    </PageWrapper>
  );
}
