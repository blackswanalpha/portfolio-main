"use client";

import {
    Box,
    Container,
    Grid,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    Image,
    Span,
    Flex,
    Icon
} from "@chakra-ui/react";
import { LuArrowRight, LuDownload } from "react-icons/lu";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero3DBackground from "./Hero3DBackground";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "power3.out", duration: 1 }
            });

            tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.8 })
                .from(".hero-title", { y: 40, opacity: 0, duration: 1 }, "-=0.6")
                .from(".hero-subtitle", { y: 20, opacity: 0, duration: 0.8 }, "-=0.7")
                .from(".hero-description", { y: 20, opacity: 0, duration: 0.8 }, "-=0.7")
                .from(".hero-buttons", { y: 20, opacity: 0, duration: 0.8 }, "-=0.7")
                .from(".hero-social", { opacity: 0, y: 10, stagger: 0.1, duration: 0.6 }, "-=0.5")
                .from(".hero-image-wrapper", { scale: 0.9, opacity: 0, duration: 1.5, ease: "power2.out" }, 0)
                .from(".stat-card", {
                    y: 40,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: ".stats-container",
                        start: "top 85%",
                    }
                }, "-=0.5");
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <Box
            ref={containerRef}
            as="section"
            position="relative"
            zIndex={10}
            pt={32}
            pb={16}
            px={{ base: 4, sm: 6, lg: 8 }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            minH="calc(100vh - 120px)"
            overflow="hidden"
        >
            {/* 3D Background */}
            <Hero3DBackground />

            <Container maxW="7xl" p={0} position="relative" zIndex={1}>
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={{ base: 12, lg: 8 }} alignItems="center">
                    {/* Hero Text Content */}
                    <VStack
                        order={{ base: 2, lg: 1 }}
                        alignItems="flex-start"
                        gap={8}
                    >
                        <VStack alignItems="flex-start" gap={4} w="full">
                            <HStack
                                className="hero-badge"
                                gap={2}
                                px={3}
                                py={1}
                                rounded="full"
                                bg="primary.500/10"
                                color="primary.500"
                                fontSize="xs"
                                fontWeight="semibold"
                                textTransform="uppercase"
                                letterSpacing="wider"
                                w="fit-content"
                            >
                                <Box w={2} h={2} rounded="full" bg="primary.500" animation="pulse 2s infinite" />
                                <Text>Available for hire</Text>
                            </HStack>

                            <Heading
                                as="h1"
                                className="hero-title"
                                fontSize={{ base: "5xl", sm: "6xl", lg: "7xl" }}
                                fontWeight="extrabold"
                                color="text.primary"
                                letterSpacing="tight"
                                lineHeight="tight"
                            >
                                Victor <br />
                                <Span
                                    className="text-transparent bg-clip-text"
                                    bgGradient="to-r"
                                    gradientFrom="primary.500"
                                    gradientTo="blue.400"
                                >
                                    Mbugua
                                </Span>
                            </Heading>

                            <Text
                                className="hero-subtitle"
                                fontSize={{ base: "xl", sm: "2xl" }}
                                fontWeight="medium"
                                color="text.secondary"
                            >
                                Full Stack Developer & UI/UX Designer
                            </Text>

                            <Text
                                className="hero-description"
                                fontSize="lg"
                                color="text.muted"
                                maxW="lg"
                                lineHeight="relaxed"
                            >
                                I craft high-end digital experiences that blend aesthetic beauty with robust engineering. Specialized in building scalable web applications and intuitive user interfaces for forward-thinking brands.
                            </Text>
                        </VStack>

                        <Flex className="hero-buttons" flexDirection={{ base: "column", sm: "row" }} gap={4} pt={2} w={{ base: "full", sm: "auto" }}>
                            <Button
                                size="xl"
                                px={8}
                                py={4}
                                bg="primary.500"
                                color="white"
                                fontWeight="semibold"
                                rounded="lg"
                                shadow="0 10px 15px -3px rgba(46, 110, 184, 0.3)"
                                _hover={{
                                    bg: "primary.600",
                                    shadow: "0 10px 15px -3px rgba(46, 110, 184, 0.5)",
                                    transform: "translateY(-2px)"
                                }}
                                transition="all 0.3s"
                            >
                                <HStack gap={2}>
                                    <Text>View Projects</Text>
                                    <LuArrowRight />
                                </HStack>
                            </Button>

                            <Button
                                size="xl"
                                px={8}
                                py={4}
                                bg="surface.light"
                                _dark={{ bg: "surface.dark" }}
                                color="text.secondary"
                                fontWeight="semibold"
                                rounded="lg"
                                border="1px solid"
                                borderColor="border.DEFAULT"
                                _hover={{
                                    borderColor: "primary.500",
                                    color: "primary.500",
                                    transform: "translateY(-2px)",
                                    shadow: "md"
                                }}
                                transition="all 0.3s"
                            >
                                <HStack gap={2}>
                                    <LuDownload />
                                    <Text>Download CV</Text>
                                </HStack>
                            </Button>
                        </Flex>

                        {/* Social Proof / Trusted By (Mini) */}
                        <Flex
                            className="hero-social-container"
                            pt={8}
                            borderTop="1px solid"
                            borderColor="border.DEFAULT"
                            flexWrap="wrap"
                            gap={6}
                            opacity={0.8}
                        >
                            <HStack className="hero-social" gap={2} filter="grayscale(100%)" _hover={{ filter: "none" }} transition="all 0.3s" cursor="default">
                                <Text className="material-icons" fontSize="3xl" color="text.muted">code</Text>
                                <Text fontWeight="bold" color="text.muted">TechCorp</Text>
                            </HStack>
                            <HStack className="hero-social" gap={2} filter="grayscale(100%)" _hover={{ filter: "none" }} transition="all 0.3s" cursor="default">
                                <Text className="material-icons" fontSize="3xl" color="text.muted">layers</Text>
                                <Text fontWeight="bold" color="text.muted">DesignStudio</Text>
                            </HStack>
                            <HStack className="hero-social" gap={2} filter="grayscale(100%)" _hover={{ filter: "none" }} transition="all 0.3s" cursor="default">
                                <Text className="material-icons" fontSize="3xl" color="text.muted">rocket_launch</Text>
                                <Text fontWeight="bold" color="text.muted">StartUp Inc</Text>
                            </HStack>
                        </Flex>
                    </VStack>

                    {/* Hero Image / Visual */}
                    <Box
                        order={{ base: 1, lg: 2 }}
                        display="flex"
                        justifyContent={{ base: "center", lg: "flex-end" }}
                        position="relative"
                    >
                        {/* Abstract Background shapes */}
                        <Box
                            position="absolute"
                            inset={0}
                            bgGradient="to-tr"
                            gradientFrom="primary.500/20"
                            gradientTo="transparent"
                            rounded="full"
                            filter="blur(64px)"
                            transform="translate(40px, 40px)"
                        />

                        <Box
                            className="hero-image-wrapper"
                            position="relative"
                            w="full"
                            maxW="md"
                            aspectRatio="4/5"
                            rounded="2xl"
                            overflow="hidden"
                            shadow="0 25px 50px -12px rgba(46, 110, 184, 0.2)"
                        >
                            <Box position="absolute" inset={0} bg="primary.500/10" mixBlendMode="overlay" zIndex={10} />
                            <Box
                                position="absolute"
                                inset={0}
                                bgGradient="to-t"
                                gradientFrom="primary.500/30"
                                gradientTo="transparent"
                                opacity={0.6}
                                zIndex={10}
                            />

                            <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT5_dWN6zO0LnGaqhstmOlnbTXyILn53iOOc4B9SB5v2HlRrA9KjsXGRGhfhpRahG3H0feiASv_lTf4296lI_mDH9Tw8IqtAUhmfaRLG-3Jv8lozRetR2D1ab0vwxzDDoGq2e9DgjxRYj03-eaB3Z2aHGrw7aWXqsaOwDWtV1vMsRAX1YBRDekz7L7ViHOxCGQUxKijcqIpFEOU16hezXOtWkySNdgW7lohHXJD2e-oDwVxkHS1YwLAL-Yv5tmziL9tHa0TGPrhx3R"
                                alt="Victor Mbugua"
                                w="full"
                                h="full"
                                objectFit="cover"
                                transition="transform 0.7s"
                                _hover={{ transform: "scale(1.05)" }}
                            />

                            {/* Floating Badge */}
                            <Box position="absolute" bottom={6} left={6} right={6} zIndex={20}>
                                <Flex
                                    className="glass-panel"
                                    p={4}
                                    rounded="lg"
                                    shadow="lg"
                                    align="center"
                                    justify="space-between"
                                    borderLeft="4px solid"
                                    borderLeftColor="primary.500"
                                >
                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase">Current Status</Text>
                                        <Text fontSize="sm" fontWeight="semibold" color="text.primary">Accepting New Projects</Text>
                                    </Box>
                                    <Box
                                        h={3}
                                        w={3}
                                        bg="green.500"
                                        rounded="full"
                                        animation="pulse 2s infinite"
                                        boxShadow="0 0 8px rgba(34,197,94,0.6)"
                                    />
                                </Flex>
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                {/* Quick Stats Row */}
                <Box mt={{ base: 20, lg: 24 }} className="stats-container">
                    <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
                        <StatCard icon="schedule" value="5+" label="Years Experience" sub="Building digital products" />
                        <StatCard icon="folder_special" value="40+" label="Projects Completed" sub="Web, Mobile & Design" />
                        <StatCard icon="people" value="25+" label="Happy Clients" sub="Worldwide collaborations" />
                        <StatCard icon="integration_instructions" value="12+" label="Technologies" sub="Mastered & deployed" />
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

const StatCard = ({ icon, value, label, sub }: { icon: string, value: string, label: string, sub: string }) => (
    <Box
        className="glass-panel stat-card"
        p={6}
        rounded="xl"
        shadow="sm"
        _hover={{ transform: "translateY(-4px)" }}
        transition="all 0.3s"
        bg="glass.bg"
    >
        <Flex align="flex-start" justify="space-between" mb={4}>
            <Box
                className="stat-icon-wrapper"
                p={2}
                bg="primary.500/10"
                rounded="lg"
                color="primary.500"
                transition="all 0.3s"
            >
                <Text className="material-icons" fontSize="xl">{icon}</Text>
            </Box>
            <Text fontSize="4xl" fontWeight="bold" color="text.primary">{value}</Text>
        </Flex>
        <Text as="h3" fontSize="sm" fontWeight="semibold" color="text.muted" textTransform="uppercase" letterSpacing="wide">{label}</Text>
        <Text fontSize="xs" color="text.muted" mt={1}>{sub}</Text>
    </Box>
);

export default Hero;
