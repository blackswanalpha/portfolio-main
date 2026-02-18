"use client";

import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    Image,
    Badge,
    Flex,
    HStack,
    Button,
    VStack,
    Input,
    Icon,
    Link as ChakraLink
} from "@chakra-ui/react";
import Link from "next/link";
import { LuSearch, LuExternalLink, LuChevronRight, LuArrowUpRight } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const projects = [
    {
        id: 1,
        title: "Vanguard Analytics",
        category: "Full Stack",
        description: "A comprehensive SaaS dashboard for visualizing marketing data with real-time reporting features.",
        tags: ["React", "Node.js", "D3.js"],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFhrWvygCiEiBVZEk7Kq_oPya7gS3cd3-GjI8SFsRYqwOMj0kKG0MXVIZTa2sKMTFkpbqgK4rJhlZ6-U-mkRsc01l2Eyv7iAVYxIYy2XNNnQ6oZCm7TCoqsppV1-at0FbsQrP-QTj7HRpLyTjIJ8ZVAoXaHgpjhfSKkJi9JXk8j-gnqFOcmExnZqI4UBD8GsyqgLbuaEpjPi-KSQlzPRfMNc9s0XuNUJGBfi21mAzScxb8SCAVHVXKr0P9yThMuB5pxoJjKoXLgKjF",
    },
    {
        id: 2,
        title: "FitTrack Pro",
        category: "Mobile App",
        description: "A cross-platform fitness tracking application with social features and personalized workout plans.",
        tags: ["Flutter", "Firebase", "Dart"],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1Uhas6WbEG9Qq-jQGVR9hHF5c7G39tJuIVsSeBMb-Ey0GeFzjzwAkbeyA4q05ILx4jpiFkVmkxbRGJFZNoCcS8tlh2plpcbxVim7ooR0yhoS3DMvukQ_8z_yCoz7HuqiN4ClhxdpzmjrbrMFVdKK-W0W06RlyZXJivsRxgqujhoozILnCEXuU2YNl3ABsKvwzfEAiVDnU9Cbq-8nU-h7sOMY2zUk2oy6HhoxpEtfm8IJqvfS2h2elecXjhwEZGILQ8280rp8Vw0Gk",
    },
    {
        id: 3,
        title: "NeoBank System",
        category: "UI/UX Design",
        description: "A complete design system and high-fidelity prototype for a next-generation digital banking platform.",
        tags: ["Figma", "Design System"],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEgvXzqNcuiL3C3w0K_qsil5LjNhhuyt93zrrG8FSMtekP7OHYYyX1S27zkDW3Wm0mfDrDpw5VwL7rnBJWS3yX8grpsbb5nKfwXheDgFAcdeyUCpwTRY4VDisX2y9CuyKTMlwwtOaPBwmqfIbSlVTTqKlJmpzfZ4gKwtnTLcFXomGqmBmHYfS1unJbVq6UCFCnVr1CTlm3O4w39c7PoQ6C9tYktaL1CgYNaB0MI6yHfCSoOYemWOnBF2KJT6GTYYSR61Yc1O5lb8Jm",
    },
    {
        id: 4,
        title: "TaskFlow Enterprise",
        category: "Web App",
        description: "Collaborative project management tool designed for remote teams with real-time sync.",
        tags: ["Vue.js", "Supabase", "Tailwind"],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6buFbSEIk-VXe8uLP11sMJagyFNs4LqeYFQ-pLpywPYNnGUO2GbhaJOtpNYCA31QqOiOGxyNOJwOSJXWEykPKT7RxVtdriMcMZCRRLKrFA9AkHGhHJrRRnbcBKH3CO-z9C29BKTV-RHhhLrPxKXOIB7TUBWDNC-sac6i19cZubwOFd-3Ul7UaLS7WmnzIG6vMjpVMFTTbvWo8yPb4tRMky9m0Ek7EEqQnhA0euwJrrqsDkSYbhmVWK4qYxPFlAl9syhOaaY-YcMMy",
    },
    {
        id: 5,
        title: "Brew Master",
        category: "E-Commerce",
        description: "Headless e-commerce solution for a specialty coffee roaster, featuring subscription management.",
        tags: ["Next.js", "Shopify", "GraphQL"],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKBeW9ZZBv0V5AiZfzXby2kWusTcrNcjE3gqQnNDtsExeIRjSzgfJXksCO13u_xymWnQeUKnFW5viqd1O9sJgxtK8YHFJijVK9orh4Lmh3om-DqC5_ZxVAHyMgjE6l45mBOpg8i4174pEFGSgcfrrUp5B_Hr0EUXLA2OMJmPgBpRBBkB3yGNj_GjBAGA5e1n-6go0fIsO5_6LQEvY6zNp8t9sK_bwkJnfHAA4mXZGPB0O41B5Nwy2W7Lnhshs3nRQtz41FaWBRnJNE",
    },
    {
        id: 6,
        title: "Neural Art Gen",
        category: "Experimental",
        description: "A web interface leveraging Stable Diffusion to generate art assets for game developers.",
        tags: ["Python", "Flask", "React"],
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVsDusDOKMlB9emUM4KC3wk__fWaUSWzlB0I6XjBJr5r8czJ-p-TajqjuL0zX1FAU0MGw9ZTs8uwlfMHiQhqMY1MYi7JkGcgSNqnceCiDj5WB7VzsiqZcTDMkzkIyIY8fLwdFymk-Xh7ZOItZUNiBS-IIzLuSE_tgivbn97kCc-ZrcbjoY6QQTOrhi0L303rLnHkABi1Km0bCnIy6zXTouFbEinZfAeh8zGu_XKD_jKPdixOfaDJb-NWBx3wxzdB4Fpm9bESODznKP",
    },
];

export default function ProjectsPage() {
    return (
        <Box minH="screen" bg="background" pb={20}>
            <Navbar />

            <Container maxW="7xl" pt={{ base: 32, md: 40 }} px={{ base: 4, sm: 6, lg: 8 }}>
                {/* Page Header */}
                <VStack align={{ base: "center", md: "start" }} gap={4} mb={12}>
                    <Heading as="h1" fontSize={{ base: "3xl", md: "5xl" }} fontWeight="extrabold" color="text.primary" letterSpacing="tight">
                        Projects Portfolio
                    </Heading>
                    <Text fontSize="lg" color="text.secondary" maxW="2xl" textAlign={{ base: "center", md: "left" }}>
                        A selection of my recent work in Engineering and Design. From full-stack applications to intuitive mobile interfaces.
                    </Text>
                </VStack>

                {/* Filter & Search Bar */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align="center"
                    bg="white"
                    _dark={{ bg: "gray.800" }}
                    p={4}
                    rounded="xl"
                    shadow="sm"
                    border="1px solid"
                    borderColor="border.subtle"
                    mb={10}
                    gap={4}
                >
                    {/* Category Tabs */}
                    <HStack overflowX="auto" pb={{ base: 2, md: 0 }} w={{ base: "full", md: "auto" }} gap={2} className="no-scrollbar">
                        <Button size="sm" variant="solid" bg="primary.500" color="white" rounded="lg">All Projects</Button>
                        <Button size="sm" variant="ghost" color="text.secondary" _hover={{ bg: "primary.50" }} rounded="lg">Web Development</Button>
                        <Button size="sm" variant="ghost" color="text.secondary" _hover={{ bg: "primary.50" }} rounded="lg">Mobile Apps</Button>
                        <Button size="sm" variant="ghost" color="text.secondary" _hover={{ bg: "primary.50" }} rounded="lg">UI/UX Design</Button>
                    </HStack>

                    {/* Search & Sort */}
                    <HStack w={{ base: "full", md: "auto" }} gap={3}>
                        <Box position="relative" w={{ base: "full", md: "64" }}>
                            <Input
                                placeholder="Search projects..."
                                pl={10}
                                size="md"
                                rounded="lg"
                                bg="gray.50"
                                _dark={{ bg: "gray.900" }}
                            />
                            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
                                <LuSearch />
                            </Box>
                        </Box>
                        <Box position="relative" w={{ base: "full", md: "40" }}>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '8px 40px 8px 16px',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    border: '1px solid #cbd5e1',
                                    appearance: 'none',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option>Newest First</option>
                                <option>Oldest First</option>
                                <option>Alphabetical</option>
                            </select>
                            <Box position="absolute" right={3} top="50%" transform="translateY(-50%)" color="gray.400" pointerEvents="none">
                                <LuChevronRight style={{ transform: 'rotate(90deg)' }} />
                            </Box>
                        </Box>
                    </HStack>
                </Flex>

                {/* Projects Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
                    {projects.map((project) => (
                        <Box
                            key={project.id}
                            className="group"
                            bg="white"
                            _dark={{ bg: "gray.800" }}
                            rounded="xl"
                            overflow="hidden"
                            border="1px solid"
                            borderColor="border.subtle"
                            _hover={{ borderColor: "primary.300", shadow: "xl" }}
                            transition="all 0.3s"
                            display="flex"
                            flexDirection="column"
                            h="full"
                        >
                            <Box position="relative" overflow="hidden" aspectRatio={4 / 3}>
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    objectFit="cover"
                                    w="full"
                                    h="full"
                                    transition="transform 0.5s"
                                    _groupHover={{ transform: "scale(1.05)" }}
                                />
                                <Box position="absolute" top={4} left={4}>
                                    <Badge bg="white/90" _dark={{ bg: "black/80" }} color="primary.500" px={2.5} py={1} rounded="md" shadow="sm">
                                        {project.category}
                                    </Badge>
                                </Box>
                                <Box position="absolute" inset={0} bg="black/0" _groupHover={{ bg: "black/10" }} transition="all 0.3s" />
                            </Box>

                            <Box p={6} flex="1" display="flex" flexDirection="column">
                                <Heading size="md" mb={2} color="text.primary" _groupHover={{ color: "primary.500" }} transition="colors">
                                    {project.title}
                                </Heading>
                                <Text fontSize="sm" color="text.secondary" mb={4} lineClamp={2}>
                                    {project.description}
                                </Text>

                                <HStack gap={2} mb={6} flexWrap="wrap">
                                    {project.tags.map((tag) => (
                                        <Badge key={tag} variant="subtle" colorScheme="gray" fontSize="xs" px={2} py={1} rounded="md">
                                            {tag}
                                        </Badge>
                                    ))}
                                </HStack>

                                <HStack gap={3} mt="auto">
                                    <Button asChild flex="1" variant="outline" size="sm" rounded="lg">
                                        <Link href={`/projects/${project.id}`}>Details</Link>
                                    </Button>
                                    <Button flex="1" bg="primary.500" color="white" size="sm" rounded="lg" _hover={{ bg: "primary.600" }} gap={1}>
                                        Live Demo <Icon as={LuArrowUpRight} fontSize="xs" />
                                    </Button>
                                </HStack>
                            </Box>
                        </Box>
                    ))}
                </SimpleGrid>

                {/* Pagination placeholder */}
                <Flex mt={12} justify="center">
                    <HStack gap={2}>
                        <Button size="sm" variant="outline" rounded="lg" disabled>1</Button>
                        <Button size="sm" variant="ghost" rounded="lg">2</Button>
                        <Button size="sm" variant="ghost" rounded="lg">3</Button>
                    </HStack>
                </Flex>
            </Container>

            <Footer />
        </Box>
    );
}
