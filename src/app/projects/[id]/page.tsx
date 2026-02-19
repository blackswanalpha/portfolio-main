"use client";

import {
    Box,
    Container,
    Heading,
    Text,
    Flex,
    HStack,
    VStack,
    Image,
    Badge,
    Grid,
    GridItem,
    Button,
    Icon,
    Separator,
    Link as ChakraLink
} from "@chakra-ui/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LuCode, LuExternalLink, LuLayers, LuStore, LuShield, LuCpu, LuDatabase, LuGlobe, LuArrowLeft, LuArrowRight } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper from "@/components/PageWrapper";
import ScrollReveal from "@/components/ScrollReveal";

// Mock data for the demonstration
const projectData = {
    "1": {
        title: "Vanguard Analytics Engine",
        version: "v2.4.0",
        status: "Production Ready",
        description: "A high-performance, scalable backend infrastructure designed to handle peak traffic loads with 99.9% uptime. Features distributed caching and event-driven architecture.",
        role: "Lead Backend Engineer",
        timeline: "Oct 2022 - Mar 2023",
        team: "4 Developers, 1 PM",
        techStack: [
            { name: "TypeScript Node.js", description: "Utilized for its strong typing system to reduce runtime errors across 15+ microservices.", icon: "TS" },
            { name: "PostgreSQL", description: "Primary relational store with partitioning enabled for historical order data > 5TB.", icon: <LuDatabase /> },
            { name: "Redis", description: "Implemented for session management and caching hot product data to achieve sub-5ms reads.", icon: <LuCpu /> },
            { name: "AWS (ECS & Lambda)", description: "Container orchestration via Fargate for services; Lambda for image processing triggers.", icon: <LuGlobe /> },
        ],
        metrics: [
            { label: "Uptime SLA", value: "99.9%" },
            { label: "Avg Latency", value: "28ms" },
            { label: "Req / Sec", value: "10k+" },
            { label: "Cost Reduction", value: "45%" },
        ],
        challenges: [
            {
                title: "Ensuring Data Consistency in Distributed Transactions",
                challenge: "With microservices for Inventory, Payment, and Orders, a failure in one service left the others in an inconsistent state.",
                solution: "Implemented the Saga Pattern (Orchestration-based). If the payment succeeds but inventory reservation fails, a compensating transaction is triggered to refund the payment automatically."
            },
            {
                title: "Handling Sudden Traffic Spikes during Flash Sales",
                challenge: "Concurrent users jumping from 1k to 50k in seconds caused database connection pool exhaustion.",
                solution: "Deployed a read-replica strategy for PostgreSQL and implemented rate-limiting at the API Gateway level using Token Buckets. Critical \"buy\" actions were offloaded to a queue (RabbitMQ) to flatten the peak load."
            }
        ]
    }
};

export default function ProjectDetailsPage() {
    const params = useParams();
    const id = typeof params?.id === 'string' ? params.id : "1";
    const project = projectData[id as keyof typeof projectData] || projectData["1"];

    return (
        <PageWrapper>
            <Box minH="screen" bg="background">
                <Navbar />

                <Container maxW="7xl" pt={{ base: 28, md: 36 }} pb={20} px={{ base: 4, sm: 6, lg: 8 }}>
                    {/* Back Button */}
                    <Button asChild variant="ghost" size="sm" mb={8} gap={2} rounded="lg" color="text.secondary" _hover={{ color: "primary.500", bg: "primary.50" }}>
                        <Link href="/projects">
                            <LuArrowLeft /> Back to Projects
                        </Link>
                    </Button>

                    <ScrollReveal width="100%">
                        {/* Header Section */}
                        <Box bg="white" _dark={{ bg: "gray.800" }} rounded="2xl" border="1px solid" borderColor="border.subtle" p={{ base: 6, md: 10 }} shadow="sm" mb={12}>
                            <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "flex-start", lg: "center" }} gap={8} mb={8}>
                                <VStack align="flex-start" gap={3}>
                                    <HStack gap={3}>
                                        <Badge colorScheme="green" variant="subtle" px={2.5} py={0.5} rounded="md">
                                            {project.status}
                                        </Badge>
                                        <Text fontSize="sm" color="text.muted" fontFamily="mono">{project.version}</Text>
                                    </HStack>
                                    <Heading as="h1" fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="text.primary">
                                        {project.title}
                                    </Heading>
                                    <Text fontSize="lg" color="text.secondary" maxW="3xl">
                                        {project.description}
                                    </Text>
                                </VStack>

                                <HStack gap={4} w={{ base: "full", lg: "auto" }}>
                                    <Button variant="outline" flex={{ base: 1, lg: "none" }} gap={2} rounded="lg">
                                        <LuCode /> Source Code
                                    </Button>
                                    <Button bg="primary.500" color="white" flex={{ base: 1, lg: "none" }} gap={2} rounded="lg" _hover={{ bg: "primary.600" }} shadow="lg" shadowColor="primary.200">
                                        <LuExternalLink /> Live Demo
                                    </Button>
                                </HStack>
                            </Flex>

                            <Separator mb={8} />

                            <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={8}>
                                <VStack align="flex-start" gap={1}>
                                    <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider">Role</Text>
                                    <Text fontWeight="semibold" color="text.primary">{project.role}</Text>
                                </VStack>
                                <VStack align="flex-start" gap={1}>
                                    <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider">Timeline</Text>
                                    <Text fontWeight="semibold" color="text.primary">{project.timeline}</Text>
                                </VStack>
                                <VStack align="flex-start" gap={1}>
                                    <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider">Team Size</Text>
                                    <Text fontWeight="semibold" color="text.primary">{project.team}</Text>
                                </VStack>
                                <VStack align="flex-start" gap={1}>
                                    <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider">Stack Overview</Text>
                                    <HStack gap={3} color="primary.500">
                                        <LuLayers size={18} />
                                        <LuDatabase size={18} />
                                        <LuShield size={18} />
                                    </HStack>
                                </VStack>
                            </Grid>
                        </Box>
                    </ScrollReveal>

                    <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={12}>
                        {/* Left Column: Content */}
                        <GridItem colSpan={{ base: 1, lg: 8 }}>
                            <VStack align="stretch" gap={16}>
                                {/* System Architecture */}
                                <Box as="section">
                                    <HStack gap={3} mb={6}>
                                        <Box w="1" h="6" bg="primary.500" rounded="full" />
                                        <Heading size="lg" color="text.primary">System Architecture</Heading>
                                    </HStack>
                                    <Box bg="blue.50/50" _dark={{ bg: "gray.900/30" }} rounded="2xl" border="1px solid" borderColor="primary.100" _dark={{ borderColor: "primary.900/30" }} p={8}>
                                        <Box bg="white" _dark={{ bg: "gray.800" }} rounded="xl" shadow="sm" border="1px solid" borderColor="border.subtle" overflow="hidden" position="relative" aspectRatio={16 / 9}>
                                            <Image
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEscR0aOFYwjYpiHQC9UZEZS-Jc-OdFYGecLdW6O5JkDWROVr7DFlfq8W0btRUe7BL7Uap2NvMB8O0AGhkYohwpFP094AIYlrjJAwYSeJQeIqHks4FIignVbB4xjQp2JPGnv4p0-_cr0z3za9lWLtMKzQrNhmq4v-Zw_MF_OGiQcklmkOQw5Io7-_LkQma70D7NLc3sh0KaP4tsHRp8qyPTNurJKfhlKX9zKMBJj-nT1sqnUQitEjDMXzhCJhKIfgwdpNIX4NTtnv0"
                                                alt="System Architecture"
                                                objectFit="cover"
                                                w="full"
                                                h="full"
                                                opacity={0.9}
                                            />
                                            <Flex position="absolute" inset={0} align="center" justify="center" bg="black/40" opacity={0} _hover={{ opacity: 1 }} transition="opacity 0.3s">
                                                <Badge bg="white" color="black" px={3} py={1} rounded="md">View Interactive Diagram</Badge>
                                            </Flex>
                                        </Box>
                                        <Text mt={6} fontSize="sm" color="text.secondary" textAlign="center" lineHeight="relaxed">
                                            <Text as="span" fontWeight="bold" color="primary.500">Figure 1.1:</Text> The request lifecycle begins at the NGINX load balancer, distributing traffic across three availability zones. Redis clusters intercept 85% of read requests.
                                        </Text>
                                    </Box>
                                </Box>

                                {/* Core Implementation */}
                                <Box as="section">
                                    <HStack gap={3} mb={6}>
                                        <Box w="1" h="6" bg="primary.500" rounded="full" />
                                        <Heading size="lg" color="text.primary">Search Optimization</Heading>
                                    </HStack>
                                    <Text color="text.secondary" mb={8} lineHeight="relaxed">
                                        The standard database query was introducing a 400ms latency during peak loads. By implementing an inverted index strategy combined with in-memory caching, we reduced the average search query time to under 15ms.
                                    </Text>
                                    <Box bg="gray.900" rounded="xl" overflow="hidden" shadow="2xl" border="1px solid" borderColor="gray.800" fontFamily="mono" fontSize="sm">
                                        <Flex bg="gray.950" px={4} py={3} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.800">
                                            <HStack gap={2}>
                                                <Box boxSize={3} rounded="full" bg="red.500" />
                                                <Box boxSize={3} rounded="full" bg="yellow-500" />
                                                <Box boxSize={3} rounded="full" bg="green-500" />
                                            </HStack>
                                            <Text color="gray.400" fontSize="xs">cacheMiddleware.ts</Text>
                                            <Text color="gray.500" fontSize="xs">TypeScript</Text>
                                        </Flex>
                                        <Box p={6} overflowX="auto">
                                            <pre style={{ margin: 0 }}>
                                                <code style={{ color: '#e2e8f0' }}>
                                                    {`async function checkCache(req: Request, res: Response, next: NextFunction) {
    const { query } = req.body;
    const cacheKey = \`search:\${hash(query)}\`;

    // 1. Attempt to retrieve from Redis cluster
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
        // Hit: Return cached JSON immediately
        console.log('Cache HIT');
        return res.status(200).json(JSON.parse(cachedResult));
    }

    // Miss: Attach interceptor to response write method
    const originalSend = res.send;
    res.send = (body) => {
        redisClient.setex(cacheKey, 3600, body); // TTL 1 hour
        return originalSend.call(res, body);
    };

    next();
}`}
                                                </code>
                                            </pre>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Challenges */}
                                <Box as="section">
                                    <HStack gap={3} mb={6}>
                                        <Box w="1" h="6" bg="primary.500" rounded="full" />
                                        <Heading size="lg" color="text.primary">Engineering Challenges</Heading>
                                    </HStack>
                                    <VStack gap={4} align="stretch" w="full">
                                        {project.challenges.map((item, index) => (
                                            <Box
                                                key={index}
                                                bg="white"
                                                _dark={{ bg: "gray.800" }}
                                                p={6}
                                                rounded="xl"
                                                border="1px solid"
                                                borderColor="border.subtle"
                                                _hover={{ borderColor: "primary.300", shadow: "sm" }}
                                                transition="all 0.3s"
                                            >
                                                <Heading fontSize="md" color="text.primary" mb={4}>{item.title}</Heading>
                                                <VStack align="flex-start" gap={3}>
                                                    <Box>
                                                        <Text as="span" fontWeight="bold" color="text.primary" fontSize="sm">Challenge: </Text>
                                                        <Text as="span" color="text.secondary" fontSize="sm">{item.challenge}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text as="span" fontWeight="bold" color="primary.500" fontSize="sm">Solution: </Text>
                                                        <Text as="span" color="text.secondary" fontSize="sm">{item.solution}</Text>
                                                    </Box>
                                                </VStack>
                                            </Box>
                                        ))}
                                    </VStack>
                                </Box>
                            </VStack>
                        </GridItem>

                        {/* Right Column: Sidebar */}
                        <GridItem colSpan={{ base: 1, lg: 4 }}>
                            <VStack gap={8} align="stretch" position="sticky" top={24}>
                                {/* Tech Stack */}
                                <Box bg="white" _dark={{ bg: "gray.800" }} p={6} rounded="2xl" shadow="sm" border="1px solid" borderColor="border.subtle">
                                    <Heading size="md" mb={6} display="flex" align="center" gap={3}>
                                        <Icon as={LuLayers} color="primary.500" />
                                        Tech Stack
                                    </Heading>
                                    <VStack gap={5} align="stretch">
                                        {project.techStack.map((tech, index) => (
                                            <Box key={index} className="group" p={4} rounded="xl" bg="gray.50" _dark={{ bg: "gray.900" }} border="1px solid" borderColor="transparent" _hover={{ borderColor: "primary.200", bg: "primary.50/50" }} transition="all 0.3s">
                                                <HStack gap={4} mb={2}>
                                                    <Flex boxSize={10} rounded="lg" bg="white" _dark={{ bg: "gray.800" }} align="center" justify="center" shadow="sm" fontWeight="bold" fontSize="xs" color="primary.500">
                                                        {tech.icon}
                                                    </Flex>
                                                    <Text fontWeight="bold" fontSize="sm" color="text.primary">{tech.name}</Text>
                                                </HStack>
                                                <Text fontSize="xs" color="text.secondary" lineHeight="relaxed">
                                                    {tech.description}
                                                </Text>
                                            </Box>
                                        ))}
                                    </VStack>
                                </Box>

                                {/* Metrics Grid */}
                                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                    {project.metrics.map((metric, index) => (
                                        <Box key={index} bg="white" _dark={{ bg: "gray.800" }} p={4} rounded="2xl" border="1px solid" borderColor="border.subtle" textAlign="center">
                                            <Text fontSize="2xl" fontWeight="bold" color="primary.500" mb={1}>{metric.value}</Text>
                                            <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="widest">{metric.label}</Text>
                                        </Box>
                                    ))}
                                </Grid>

                                {/* CTA Blog */}
                                <Box bg="primary.50" _dark={{ bg: "primary.900/10" }} p={6} rounded="2xl" border="1px solid" borderColor="primary.100" _dark={{ borderColor: "primary.900/40" }} textAlign="center">
                                    <Heading size="sm" mb={2}>Interested in the details?</Heading>
                                    <Text fontSize="xs" color="text.secondary" mb={4}>I've written a detailed blog post covering the database migration strategy.</Text>
                                    <Button variant="ghost" color="primary.500" fontSize="sm" gap={2}>
                                        Read Technical Blog <LuArrowRight />
                                    </Button>
                                </Box>
                            </VStack>
                        </GridItem>
                    </Grid>
                </Container>

                <Footer />
            </Box>
        </PageWrapper>
    );
}
