"use client";

import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    Button,
    Image,
    VStack,
    HStack,
    SimpleGrid,
    Icon,
    Badge,
    Separator,
} from "@chakra-ui/react";
import { LuStar, LuUser, LuPlus, LuChevronRight, LuMessageSquare, LuQuote } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper from "@/components/PageWrapper";
import ScrollReveal from "@/components/ScrollReveal";
import StaggeredList from "@/components/animations/StaggeredList";

const testimonials = [
    // ...
    {
        name: "David Chen",
        role: "Founder at StartUp Inc.",
        content: "Working with Victor was a breath of fresh air. He understood the brand guidelines immediately and translated them into a pixel-perfect React application. The animations are buttery smooth.",
        stars: 5,
        date: "2 days ago",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKI4gfNDdl3RqfRdpmPnKjHae35DWe7w7nxAjbfVktVWvkv1jIQxyvUKEWvA4-uZpnCfLZdvFrjEmmbDBx6RR39NlXMH_lGxvZ_db7cVoztWhb_hW-Zom58R307HT9iCOQ4eUpbO0TiW7TMNh-n3EiziTds2roXfUE68mx2qzbOCWB21p2QQAuhH4U3FWXivSUTxN5JgG1l1Da07ppIxsvJizYEmnQy-QJj3UrA0IK1fKwxdMt6VVxiFTtb3GGuKW81FbyHqDQO_J4",
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0kfZoeXkp70Y_Kj9qhqXqQYc3mECmhNsYivQQQ-gIG7zLk7ET_ijxqEW1lGe-lmszx432BXe6Urc-V4QxsQWYl4PDNrb3RHW8Gq1BDZ1zTkHSPSDYGpAJdQrE93Q9bpIgnDCZAZ368t7KYk10aSNoF-bTzk2golCffXaw7Tb_jMRei89tYXvx8p5eGvLn0lpcVPNWkUanuLUVHiOaAfKVKYXaSk4gWhXOJ-ky9_zj5YEFUtKbZqvODqNwgfOkdyCQ_JPibZLvEjIf"
    },
    {
        name: "Emily Rossi",
        role: "CTO at FinEdge",
        content: "Exceptional delivery speed without compromising quality. The backend architecture he proposed saved us 30% on cloud costs. Highly recommended for complex integrations.",
        stars: 5,
        date: "1 week ago",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDw3loR239CsSduh0POKAfNU3qnGZcBE091UIyCZ-nvkJRScZIF1RdI4_5x5fF5J5ic6rnTE9I_wUn34SVL71amH9ji2-0Lg_OKE39lBucjxpWBVZgKO3XwObGg5dQ5zKFXnftlHOxO9uPnYYdBnrCXngB7BKpilw8QeKBxJOTtMn6Yr_7mbJjGvjrpKUkuVmFO9UnwMmtizK0sSyqdLnOKvcRr6S4ZCJV8YN1FJat2TMh-c9ViqoXBCGWPM6rgrP-w4aUudmjyZU8B",
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtBsC8I5Jscl1E8Uea2BnNU8PBjYqILTl9NEL899dJniQk0oW99qm_LpwR9B6XCxDuAzcU5TnvsOD-Yg0x2YMxKMmzSgkngMW5Z0WVWWvklpefKvr0XqToeECuQOA41xwp-AhMp5v5GouXXz64ny5mKF-0bXIIQWQDnS68AXGJUDMfdl_0jQ_Ho6YFhMq8OZS7DZxmwJElxN8Ma0WzOPjhOnw0tW86Lh2iIvGgJx3mFZRNPEtFrh_niryT1DVReomJsfXmheC7PR8k"
    },
    {
        name: "Marcus Johnson",
        role: "Product Manager",
        content: "Victor is a rare find. A developer with a designer's eye. He caught several UX issues in our initial mockups that we missed. The final product is stunning.",
        stars: 4,
        date: "2 weeks ago",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3bfSXaWnKeDAWzxLWi4rIub__PobwuzwgfNpQkzryIuzX0dnbLOQnfuo-9RZDakF9-jl4tzgMIH_mbmM3fUBK-LtzkODWDQ3q_V3oM6FM_LZk9Ydj4e4h-jAIFf9TS-P1-IL4DHg-sQ1sY5hZcXFR2imj_-xdqxvesnORdwFcKwkAsPEvuQr4F2FaxL9L3VN8LdrNC6i88wA4ncl3ke9SJM_1gVm6v5fZX-47A08S2UZQzFvcqBDoWPyBGGL7-Q-whIs6da5bRfqC",
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWCrUCa_s4YAXHnd2WnCDPS8o_oaBdErcnFBwLsjsqr4xPTvHYv7xdv-yShj0QOSo-EVt0UXW_y21l9m57rsCzxt7vMdBlykwaifCixb6SS3k3hEOxkJ3DL35hLOWVXhKuvLWLkM38vzhMkucJ1UGd-mA6E3TTZxmMA7ELSY2_Grjy6Ep037CEONuRQyTbMrayi1xHYCpJ5ZAYCULkdH5qS1GQmO4NeqiXHt_quikNFlJ6SIkulO0bmkN2-vYJyhJUFFGvsfV3xZXt"
    }
];

export default function TestimonialsPage() {
    return (
        <PageWrapper>
            <Box minH="screen" bg="background">
                <Navbar />

                <Container maxW="7xl" pt={{ base: 32, md: 40 }} pb={24} px={{ base: 4, sm: 6, lg: 8 }}>
                    {/* Header and Aggregate Stats */}
                    <ScrollReveal width="100%">
                        <Flex direction={{ base: "column", lg: "row" }} gap={12} align="center" mb={20}>
                            <VStack align="flex-start" gap={6} flex="1">
                                <Badge colorScheme="primary" variant="subtle" px={3} py={1} rounded="full" textTransform="uppercase">
                                    Client Success Stories
                                </Badge>
                                <Heading as="h1" fontSize={{ base: "4xl", md: "5xl" }} fontWeight="extrabold" color="text.primary">
                                    Trusted by <Text as="span" color="primary.500">innovators</Text> worldwide.
                                </Heading>
                                <Text fontSize="lg" color="text.secondary" lineHeight="relaxed">
                                    I partner with ambitious brands to build high-end digital products. Here is what my clients have to say about our collaboration.
                                </Text>
                                <HStack pt={4} gap={4}>
                                    <Button bg="gray.900" _dark={{ bg: "white", color: "gray.900" }} color="white" px={6} py={6} rounded="lg" fontWeight="medium" gap={2}>
                                        <LuPlus size={18} /> Submit a Review
                                    </Button>
                                    <HStack gap={-3} position="relative" w="40">
                                        {/* Visual overlap placeholder for logos */}
                                        <Box boxSize={10} bg="white" rounded="full" border="2px solid white" zIndex={10} />
                                        <Box boxSize={10} bg="gray.100" rounded="full" border="2px solid white" ml={-4} zIndex={5} />
                                        <Box boxSize={10} bg="gray.200" rounded="full" border="2px solid white" ml={-4} zIndex={1} />
                                        <Text ml={2} fontSize="xs" fontWeight="medium" color="text.muted">and 20+ others</Text>
                                    </HStack>
                                </HStack>
                            </VStack>

                            <Box flex="1.2" w="full" bg="white" _dark={{ bg: "gray.800" }} p={8} rounded="2xl" shadow="xl" border="1px solid" borderColor="border.subtle">
                                <Flex direction={{ base: "column", md: "row" }} gap={8} align="center">
                                    <VStack textAlign={{ base: "center", md: "left" }} minW="140px">
                                        <Text fontSize="6xl" fontWeight="black" color="text.primary" letterSpacing="tighter">4.9</Text>
                                        <HStack color="amber.400" my={2}>
                                            {[1, 2, 3, 4].map(i => <Icon key={i} as={LuStar} fill="currentColor" />)}
                                            <Icon as={LuStar} />
                                        </HStack>
                                        <Text fontSize="sm" color="text.muted" fontWeight="medium">Based on 42 reviews</Text>
                                    </VStack>

                                    <VStack align="stretch" flex="1" gap={3} w="full">
                                        {[
                                            { star: 5, perc: 85 },
                                            { star: 4, perc: 12 },
                                            { star: 3, perc: 3 },
                                            { star: 2, perc: 0 },
                                            { star: 1, perc: 0 },
                                        ].map(item => (
                                            <HStack key={item.star} gap={3} fontSize="sm">
                                                <Text w="3" fontWeight="bold" color="text.primary">{item.star}</Text>
                                                <Box flex="1" h="2" bg="gray.100" _dark={{ bg: "gray.700" }} rounded="full" overflow="hidden">
                                                    <Box h="full" bg="primary.500" w={`${item.perc}%`} transition="width 1s ease" />
                                                </Box>
                                                <Text w="8" textAlign="right" color="text.muted">{item.perc}%</Text>
                                            </HStack>
                                        ))}
                                    </VStack>
                                </Flex>
                            </Box>
                        </Flex>
                    </ScrollReveal>

                    {/* Featured Testimonial */}
                    <ScrollReveal width="100%" transition={{ delay: 0.2 }}>
                        <Box
                            position="relative"
                            bgGradient="to-br"
                            gradientFrom="primary.500"
                            gradientTo="primary.700"
                            rounded="3xl"
                            p={{ base: 8, md: 12 }}
                            overflow="hidden"
                            shadow="2xl"
                            color="white"
                            mb={20}
                        >
                            {/* Abstract Decorations */}
                            <Box position="absolute" top="-16" right="-16" boxSize="64" bg="white/10" rounded="full" filter="blur(64px)" />
                            <Box position="absolute" bottom="-16" left="-16" boxSize="40" bg="black/10" rounded="full" filter="blur(48px)" />

                            <Icon as={LuQuote} position="absolute" top={8} left={8} fontSize="9xl" opacity={0.1} />

                            <Flex direction={{ base: "column", md: "row" }} gap={{ base: 8, md: 12 }} align={{ base: "center", md: "flex-start" }} position="relative" zIndex={10}>
                                <Box flexShrink={0} position="relative" boxSize={{ base: 32, md: 40 }}>
                                    <Image
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKrCTZsjPeMFZTX2Cwa0c_cWnI1ruj5UGx9JT4WswPBpn8OHqdktwjO-NbgQ1ghl4_tNqfXE62Rem-qsjsnMZvpXc_5CIbZh_HhbE2RYvgXUfWfxD-aEpf3cqduPPKEcy24RTMjj_p3e8dkJhFgVjGotlMCdCvcagV18rLUVTpC_NLPFs8ecey4Wj8TKCodjqg865X-FCivOq1wRSnKR_EeXm0gjJ-KsdyT0ZkSXwFHEUtn1Ybc68CRz43zmNLEYcr6ihIsnq7MaWM"
                                        alt="Sarah Jenkins"
                                        objectFit="cover"
                                        rounded="xl"
                                        borderWidth="4px"
                                        borderColor="white/20"
                                        shadow="lg"
                                        w="full"
                                        h="full"
                                    />
                                    <Box position="absolute" bottom={-3} right={-3} bg="white" color="black" p={2} rounded="lg" shadow="sm">
                                        <Icon as={LuStar} fill="currentColor" color="amber.400" />
                                    </Box>
                                </Box>

                                <VStack align={{ base: "center", md: "flex-start" }} textAlign={{ base: "center", md: "left" }}>
                                    <HStack color="amber.300" mb={4}>
                                        {[1, 2, 3, 4, 5].map(i => <Icon key={i} as={LuStar} fill="currentColor" />)}
                                    </HStack>
                                    <Heading as="blockquote" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="medium" lineHeight="relaxed" mb={6}>
                                        "Victor didn't just write code; he architected a solution that scaled with our user base. His ability to bridge the gap between complex backend logic and beautiful UI is simply unmatched."
                                    </Heading>
                                    <Box>
                                        <Text fontWeight="bold" fontSize="lg">Sarah Jenkins</Text>
                                        <Text opacity={0.8} fontSize="sm">VP of Engineering at Spotify</Text>
                                    </Box>
                                </VStack>
                            </Flex>
                        </Box>
                    </ScrollReveal>

                    {/* Toolbar */}
                    <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align="center" mb={10} gap={4}>
                        <Heading size="md" color="text.primary">Recent Reviews</Heading>
                        <HStack gap={3}>
                            <Box position="relative" w="40">
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
                                    <option>Most Recent</option>
                                    <option>Highest Rated</option>
                                </select>
                                <Box position="absolute" right={3} top="50%" transform="translateY(-50%)" color="gray.400" pointerEvents="none">
                                    <LuChevronRight style={{ transform: 'rotate(90deg)' }} />
                                </Box>
                            </Box>
                            <HStack bg="white" _dark={{ bg: "gray.800" }} p={1} rounded="lg" border="1px solid" borderColor="border.subtle">
                                <Button size="xs" variant="solid" bg="primary.500" color="white" rounded="md">All</Button>
                                <Button size="xs" variant="ghost" color="text.muted">Dev</Button>
                                <Button size="xs" variant="ghost" color="text.muted">Design</Button>
                            </HStack>
                        </HStack>
                    </Flex>

                    {/* Testimonials Grid */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                        {testimonials.map((t, i) => (
                            <ScrollReveal key={i} width="100%" transition={{ delay: 0.1 * i }}>
                                <Box
                                    bg="white"
                                    _dark={{ bg: "gray.800" }}
                                    p={8}
                                    rounded="2xl"
                                    border="1px solid"
                                    borderColor="border.subtle"
                                    _hover={{ shadow: "lg", borderColor: "primary.300" }}
                                    transition="all 0.3s"
                                    display="flex"
                                    flexDirection="column"
                                    h="full"
                                >
                                    <Flex justify="space-between" align="center" mb={6}>
                                        <HStack gap={1} color="amber.400">
                                            {Array.from({ length: t.stars }).map((_, j) => <Icon key={j} as={LuStar} fill="currentColor" fontSize="xs" />)}
                                        </HStack>
                                        <Text fontSize="xs" color="text.muted">{t.date}</Text>
                                    </Flex>

                                    <Text color="text.secondary" fontSize="sm" lineHeight="relaxed" mb={8} flex="1">
                                        "{t.content}"
                                    </Text>

                                    <Separator mb={6} />

                                    <Flex align="center" gap={3}>
                                        <Image src={t.avatar} alt={t.name} boxSize={10} rounded="full" objectFit="cover" />
                                        <Box>
                                            <Text fontWeight="bold" fontSize="sm" color="text.primary">{t.name}</Text>
                                            <Text fontSize="xs" color="text.muted">{t.role}</Text>
                                        </Box>
                                        <Image src={t.logo} alt="company" boxSize={5} ml="auto" filter="grayscale(1)" opacity={0.5} _hover={{ filter: "none", opacity: 1 }} transition="all 0.3s" />
                                    </Flex>
                                </Box>
                            </ScrollReveal>
                        ))}
                    </SimpleGrid>

                    <Flex mt={12} justify="center">
                        <Button variant="outline" rounded="lg" size="md" color="text.secondary">Load More Reviews</Button>
                    </Flex>
                </Container>

                <Footer />
            </Box>
        </PageWrapper>
    );
}
