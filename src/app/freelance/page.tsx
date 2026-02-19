"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    SimpleGrid,
    VStack,
    HStack,
    Icon,
    Button,
    Circle
} from "@chakra-ui/react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    LuTerminal,
    LuRocket,
    LuSearch,
    LuExternalLink,
    LuBriefcase,
    LuCpu,
    LuBrainCircuit,
    LuLayoutDashboard
} from "react-icons/lu";

gsap.registerPlugin(ScrollTrigger);

export default function FreelancePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Reveal animations for sections
            const sections = gsap.utils.toArray<HTMLElement>(".reveal-section");
            sections.forEach((section) => {
                gsap.from(section, {
                    y: 40,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <Box
            ref={containerRef}
            minH="100vh"
            bg="background.light"
            _dark={{ bg: "background.dark" }}
            fontFamily="display"
            transition="colors"
            transitionDuration="300ms"
            position="relative"
            overflowX="hidden"
        >
            <Navbar />

            {/* Hero Section */}
            <Box as="section" pt="32" pb="16" position="relative" overflow="hidden">
                {/* Background Decorative Elements */}
                <Box
                    position="absolute"
                    top="0"
                    right="0"
                    transform="translateY(-50%) translateX(33%)"
                    w="96"
                    h="96"
                    bg="primary.500"
                    opacity="0.1"
                    rounded="full"
                    filter="blur(64px)"
                />
                <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    transform="translateY(50%) translateX(-33%)"
                    w="96"
                    h="96"
                    bg="primary.500"
                    opacity="0.05"
                    rounded="full"
                    filter="blur(64px)"
                />

                <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} textAlign="center" className="reveal-section">
                    {/* Availability Badge */}
                    <HStack
                        display="inline-flex"
                        bg="white"
                        _dark={{ bg: "slate.800", borderColor: "primary.800" }}
                        border="1px solid"
                        borderColor="primary.200"
                        rounded="full"
                        px="4"
                        py="1.5"
                        shadow="sm"
                        mb="8"
                        gap={2}
                    >
                        <Box position="relative" display="flex" h="3" w="3">
                            <Circle className="animate-ping" position="absolute" size="full" bg="green.400" opacity="0.75" />
                            <Circle size="3" bg="green.500" position="relative" />
                        </Box>
                        <Text fontSize="xs" fontWeight="semibold" color="text.secondary" _dark={{ color: "text.dark.secondary" }} textTransform="uppercase" letterSpacing="wide">
                            Available for new projects
                        </Text>
                    </HStack>

                    <Heading
                        fontSize={{ base: "4xl", md: "7xl" }}
                        fontWeight="bold"
                        letterSpacing="tight"
                        mb="6"
                        lineHeight="shorter"
                        bgClip="text"
                        color="transparent"
                        backgroundImage="linear-gradient(to right, var(--chakra-colors-primary-900), var(--chakra-colors-primary-500), var(--chakra-colors-primary-900))"
                        _dark={{
                            backgroundImage: "linear-gradient(to right, white, var(--chakra-colors-primary-300), white)"
                        }}
                    >
                        Designing the Future,<br /> One Pixel at a Time.
                    </Heading>
                    <Text mt="4" maxW="2xl" mx="auto" fontSize="lg" color="text.muted" _dark={{ color: "text.dark.muted" }}>
                        Premium digital product design and full-stack engineering for startups and established brands looking to level up.
                    </Text>
                </Container>
            </Box>

            {/* Services Section */}
            <Box as="section" py="16" position="relative" className="reveal-section">
                <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                        <ServiceCard
                            icon={LuTerminal}
                            title="Web Development"
                            description="High-performance React & Node applications built for scale and speed."
                            price="$5,000"
                            priceLabel="Starting at"
                        />
                        <ServiceCard
                            icon={LuLayoutDashboard}
                            title="UI/UX Design"
                            description="User-centric interfaces and comprehensive design systems for cohesive branding."
                            price="$3,500"
                            priceLabel="Starting at"
                        />
                        <ServiceCard
                            icon={LuBrainCircuit}
                            title="Tech Consulting"
                            description="Strategic architectural decisions, code audits, and technical leadership."
                            price="$150/hr"
                            priceLabel="Hourly Rate"
                        />
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Process Section */}
            <Box
                as="section"
                py="20"
                bg="surface.light"
                _dark={{ bg: "surface.dark", borderColor: "border.dark" }}
                className="reveal-section"
            >
                <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                    <VStack textAlign="center" mb="16" gap={4}>
                        <Heading size="3xl" fontWeight="bold">The Process</Heading>
                        <Text color="text.muted" _dark={{ color: "text.dark.muted" }} maxW="xl">From chaos to clarity. A structured approach ensures we hit every milestone with precision.</Text>
                    </VStack>

                    {/* Horizontal Process Flow (Desktop) */}
                    <Box display={{ base: "none", md: "flex" }} justifyContent="space-between" alignItems="center" position="relative">
                        <Box position="absolute" top="50%" left="0" w="full" h="0.5" bg="slate.200" _dark={{ bg: "slate.700" }} transform="translateY(-50%)" zIndex="0" />
                        <Box
                            position="absolute"
                            top="50%"
                            left="0"
                            w="75%"
                            h="0.5"
                            bgGradient="to-r"
                            gradientFrom="primary.500"
                            gradientTo="transparent"
                            transform="translateY(-50%)"
                            zIndex="0"
                            opacity="0.5"
                            boxShadow="0 0 10px rgba(19, 120, 236, 0.4)"
                        />

                        <ProcessStep icon={LuSearch} title="Discovery" subtitle="Week 1" />
                        <ProcessStep icon={LuCpu} title="Strategy" subtitle="Week 2" />
                        <ProcessStep icon={LuTerminal} title="Build" subtitle="Weeks 3-6" />
                        <ProcessStep icon={LuRocket} title="Launch" subtitle="Week 7+" isLast />
                    </Box>

                    {/* Vertical Process Flow (Mobile) */}
                    <Box display={{ base: "block", md: "none" }} spaceY="8" position="relative" pl="8" borderLeft="2px solid" borderColor="border.light" _dark={{ borderColor: "border.dark" }} ml="4">
                        <VStack align="flex-start" position="relative" gap={1}>
                            <Circle
                                position="absolute"
                                left="-41px"
                                top="0"
                                size="10"
                                bg="surface.light"
                                _dark={{ bg: "surface.dark" }}
                                border="2px solid"
                                borderColor="primary.500"
                                shadow="0 0 15px rgba(19, 120, 236, 0.3)"
                            >
                                <Icon as={LuSearch} color="primary.500" boxSize={4} />
                            </Circle>
                            <Heading size="md" fontWeight="bold">Discovery</Heading>
                            <Text fontSize="sm" color="text.muted" _dark={{ color: "text.dark.muted" }}>Understanding requirements and user needs.</Text>
                        </VStack>
                    </Box>
                </Container>
            </Box>

            {/* Timeline Section */}
            <Box as="section" py="20" className="reveal-section">
                <Container maxW="5xl" px={{ base: 4, sm: 6, lg: 8 }}>
                    <Heading size="xl" fontWeight="bold" mb="12" display="flex" alignItems="center" gap={3}>
                        <Box w="2" h="8" bg="primary.500" rounded="full" />
                        Recent Engagements
                    </Heading>

                    <VStack gap={12} align="stretch">
                        <TimelineItem
                            date="Oct 2023 - Present"
                            icon={LuBriefcase}
                            logoText="AS"
                            title="FinTech Dashboard Overhaul"
                            client="AlphaStream Financial"
                            description="Redesigned the entire investor portal, improving load times by 40% and increasing user retention. Implemented a new design system."
                            tags={["React", "TypeScript"]}
                        />
                    </VStack>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box as="section" py="24" position="relative" overflow="hidden" bg="surface.light" _dark={{ bg: "surface.dark" }} mt="auto" className="reveal-section">
                <Box position="absolute" top="0" left="50%" transform="translateX(-50%)" w="2/3" h="1" bgGradient="to-r" gradientFrom="transparent" gradientVia="primary.500" gradientTo="transparent" opacity="0.3" filter="blur(4px)" />
                <Container maxW="4xl" px="4" textAlign="center" position="relative" zIndex="10">
                    <Heading size="4xl" fontWeight="bold" mb="6" letterSpacing="tight">Ready to build something extensive?</Heading>
                    <Text fontSize="lg" color="text.muted" _dark={{ color: "text.dark.muted" }} mb="10" maxW="2xl" mx="auto">
                        I'm currently accepting new projects. Let's discuss how we can elevate your brand with precision engineering and design.
                    </Text>
                    <Flex direction={{ base: "column", sm: "row" }} gap="4" justify="center" align="center">
                        <Button
                            size="lg"
                            bg="primary.500"
                            _hover={{ bg: "primary.600" }}
                            color="white"
                            rounded="lg"
                            px="8"
                            fontWeight="bold"
                            shadow="lg"
                            _dark={{ shadow: "0 10px 15px -3px rgba(46, 110, 184, 0.4)" }}
                            transition="all"
                            display="flex"
                            alignItems="center"
                            gap={2}
                        >
                            Let's Work Together
                            <Icon as={LuExternalLink} />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            bg="transparent"
                            color="text.primary"
                            _dark={{ color: "text.dark.primary" }}
                            rounded="lg"
                            px="8"
                            fontWeight="bold"
                        >
                            View Full Portfolio
                        </Button>
                    </Flex>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
}

const ServiceCard = ({ icon, title, description, price, priceLabel }: any) => (
    <Box
        role="group"
        position="relative"
        bg="surface.light"
        rounded="xl"
        p="8"
        border="1px solid"
        borderColor="border.light"
        _dark={{ bg: "surface.dark", borderColor: "border.dark" }}
        _hover={{ borderColor: "primary.500", shadow: "xl", transform: "translateY(-4px)" }}
        transition="all"
        transitionDuration="300ms"
    >
        <Box
            position="absolute"
            inset="0"
            bgGradient="to-b"
            gradientFrom="primary.500"
            gradientTo="transparent"
            opacity="0"
            _groupHover={{ opacity: "0.05" }}
            transition="opacity"
            rounded="xl"
        />
        <Box position="relative" zIndex="10">
            <Circle
                size="14"
                bg="primary.50"
                _dark={{ bg: "primary.900" }}
                color="primary.500"
                mb="6"
                _groupHover={{ bg: "primary.500", color: "white" }}
                transition="colors"
            >
                <Icon as={icon} boxSize={8} />
            </Circle>
            <Heading size="md" mb="3" fontWeight="bold">{title}</Heading>
            <Text color="text.muted" _dark={{ color: "text.dark.muted" }} mb="6" minH="48px">{description}</Text>
            <Flex align="center" justify="space-between" borderTop="1px solid" borderColor="border.light" _dark={{ borderColor: "border.dark" }} pt="4">
                <Text fontSize="sm" fontWeight="medium" color="text.muted" _dark={{ color: "text.dark.muted" }}>{priceLabel}</Text>
                <Text fontSize="lg" fontWeight="bold" color="primary.500">{price}</Text>
            </Flex>
        </Box>
    </Box>
);

const ProcessStep = ({ icon, title, subtitle, isLast }: any) => (
    <VStack position="relative" zIndex="10" role="group" cursor="default" gap={1}>
        <Circle
            size="16"
            bg="surface.light"
            border="2px solid"
            borderColor={isLast ? "slate.300" : "primary.500"}
            _dark={{ bg: "surface.dark", borderColor: isLast ? "slate.600" : "primary.500" }}
            shadow={!isLast ? "0 0 15px rgba(19, 120, 236, 0.3)" : "none"}
            mb="4"
            _hover={{ transform: "scale(1.1)", shadow: "0 0 15px rgba(19, 120, 236, 0.3)", borderColor: "primary.500" }}
            transition="all"
            transitionDuration="300ms"
        >
            <Icon as={icon} color={isLast ? "slate.400" : "primary.500"} boxSize={6} _groupHover={{ color: "primary.500" }} />
        </Circle>
        <Heading size="sm" fontWeight="bold">{title}</Heading>
        <Text fontSize="xs" color="text.muted" _dark={{ color: "text.dark.muted" }} textTransform="uppercase" letterSpacing="wider">{subtitle}</Text>
    </VStack>
);

const TimelineItem = ({ date, icon, logoText, title, client, description, tags }: any) => (
    <Box position="relative" pl={{ base: 8, md: 0 }}>
        <Box position="absolute" left="0" top="0" bottom="0" w="px" bg="border.light" _dark={{ bg: "border.dark" }} display={{ base: "block", md: "none" }} />
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} alignItems="flex-start" position="relative">
            <Box display={{ base: "none", md: "block" }} textAlign="right" pt="2">
                <Text display="inline-block" px="3" py="1" rounded="md" bg="slate.100" color="text.secondary" _dark={{ bg: "slate.800", color: "text.dark.secondary" }} fontSize="sm" fontWeight="medium">
                    {date}
                </Text>
            </Box>
            <VStack display={{ base: "none", md: "flex" }} h="full" gap={2}>
                <Circle size="10" bg="surface.light" _dark={{ bg: "surface.dark" }} border="2px solid" borderColor="primary.500" zIndex="10">
                    <Icon as={icon} color="primary.500" boxSize={4} />
                </Circle>
                <Box flex="1" w="px" bg="border.light" _dark={{ bg: "border.dark" }} />
            </VStack>
            <Box bg="surface.light" p="6" rounded="xl" border="1px solid" borderColor="border.light" _dark={{ bg: "surface.dark", borderColor: "border.dark" }} shadow="sm">
                <Flex align="center" gap={4} mb="4">
                    <Circle size="12" bg="blue.100" color="primary.500" fontWeight="bold">{logoText}</Circle>
                    <VStack align="flex-start" gap={0}>
                        <Heading size="md" fontWeight="bold">{title}</Heading>
                        <Text color="primary.500" fontSize="sm" fontWeight="medium">{client}</Text>
                    </VStack>
                </Flex>
                <Text color="text.secondary" _dark={{ color: "text.dark.secondary" }} fontSize="sm" mb="4" lineHeight="relaxed">{description}</Text>
                <HStack gap={2} flexWrap="wrap">
                    {tags.map((tag: string) => (
                        <Box
                            key={tag}
                            px="2"
                            py="1"
                            rounded="md"
                            bg="blue.50"
                            color="blue.600"
                            _dark={{
                                bg: "blue.900/20",
                                color: "blue.300",
                                borderColor: "blue.900/30"
                            }}
                            fontSize="xs"
                            fontWeight="medium"
                            border="1px solid"
                            borderColor="blue.100"
                        >
                            {tag}
                        </Box>
                    ))}
                </HStack>
            </Box>
        </SimpleGrid>
    </Box>
);
