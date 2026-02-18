"use client";

import {
    Box,
    Container,
    Grid,
    VStack,
    HStack,
    Text,
    Heading,
    Image,
    Span,
    Flex,
    Button,
    Separator,
    Center
} from "@chakra-ui/react";
import { LuCode, LuDownload, LuTerminal, LuPalette, LuCamera, LuHeadphones, LuDumbbell, LuMapPin, LuBriefcase, LuMail, LuHistory } from "react-icons/lu";

const About = () => {
    return (
        <Box id="about" gap={24} py={{ base: 12, lg: 20 }} display="flex" flexDirection="column">
            {/* Hero & Bio Section */}
            <Box as="section">
                <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={{ base: 12, lg: 16 }} alignItems="flex-start">
                        {/* Left Column: Heading & Avatar */}
                        <Box gridColumn={{ base: "span 1", lg: "span 4" }} display="flex" flexDirection="column" alignItems={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }} gap={8}>
                            {/* Title Block */}
                            <Box position="relative">
                                <Heading fontSize={{ base: "5xl", lg: "7xl" }} fontWeight="extrabold" color="text.primary" letterSpacing="tight">
                                    About <Span color="primary.500">Me</Span>
                                </Heading>
                                {/* Decorative Futuristic Underline */}
                                <Box h="1.5" w="32" bg="primary.500" mt={2} rounded="full" position="relative" overflow="hidden" mx={{ base: "auto", lg: 0 }}>
                                    <Box position="absolute" inset={0} bg="white/30" animation="pulse 2s infinite" />
                                </Box>
                                <Box display={{ base: "none", lg: "block" }} position="absolute" left="-6" top="50%" transform="translateY(-50%)" w="1.5" h="16" bg="primary.500/20" rounded="full" />
                            </Box>

                            {/* Profile Image */}
                            <Box position="relative" className="group">
                                <Box position="absolute" inset={0} bg="primary.500/20" rounded="full" filter="blur(20px)" transition="transform 0.5s" _groupHover={{ transform: "scale(1.05)" }} />
                                <Image
                                    alt="Professional portrait of Victor Mbugua"
                                    w={{ base: "64", lg: "80" }}
                                    h={{ base: "64", lg: "80" }}
                                    objectFit="cover"
                                    rounded="full"
                                    borderWidth="4px"
                                    borderColor="white"
                                    _dark={{ borderColor: "gray.800" }}
                                    shadow="2xl"
                                    position="relative"
                                    zIndex={10}
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXV1cHamGtNxtcs8U_SfblvAPSGR2TbEuXg5tUN8L0aGNijZtSTXNvkNcZnMJe3F6KQpG1SI1DCb1zt8rylYIe_hzVih7mkAHmpyHxs44q1E4XoW5tDD6MVq5ZD8NSGH6h2LCV0p9u2tChgVKtVnpcJIY4lg5qW3QSc5TjMJcJzDlMnMcGxDANNYkuvYP1JQfc9kD9C5VbAzHV_-3RVGnWGF58ptCpoIF-sXgzzQ2VsfQO5q1Fmgz6NZq9Ih2kaTR4r70MFuyLfYQj"
                                />
                                {/* Decorative Badge */}
                                <Center position="absolute" bottom={{ base: 4, lg: 8 }} right={{ base: 4, lg: 8 }} zIndex={20} bg="primary.500" color="white" p={3} rounded="full" shadow="lg" border="4px solid" borderColor="white" _dark={{ borderColor: "gray.800" }}>
                                    <LuCode size={24} />
                                </Center>
                            </Box>
                        </Box>

                        {/* Right Column: Biography & Info */}
                        <Box gridColumn={{ base: "span 1", lg: "span 8" }} display="flex" flexDirection="column" justifyContent="center" gap={10}>
                            <VStack align="flex-start" gap={4}>
                                <Heading fontSize="2xl" fontWeight="bold" color="text.primary">
                                    I'm Victor Mbugua, a Full Stack Developer & UI/UX Designer crafting high-end digital experiences.
                                </Heading>
                                <Text color="text.secondary" lineHeight="relaxed">
                                    With over 5 years of experience in the tech industry, I specialize in bridging the gap between functional complexity and aesthetic simplicity. My journey began with a curiosity for how things work on the web, which quickly evolved into a passion for building robust applications that don't just work well but look exceptional.
                                </Text>
                                <Text color="text.secondary" lineHeight="relaxed">
                                    Based in Nairobi, I work with startups and established enterprises to transform abstract ideas into tangible, user-centric products. When I'm not writing clean, scalable code or adjusting pixels in Figma, you can find me exploring the latest in tech trends or mentoring aspiring developers.
                                </Text>
                            </VStack>

                            {/* Info Grid */}
                            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={6}>
                                <InfoItem icon={<LuMapPin />} label="Location" value="Nairobi, Kenya" />
                                <InfoItem icon={<LuBriefcase />} label="Availability" value="Open for Contract" />
                                <InfoItem icon={<LuMail />} label="Email" value="hello@victor.dev" />
                                <InfoItem icon={<LuHistory />} label="Experience" value="5+ Years" />
                            </Grid>

                            {/* CTA Button */}
                            <Box pt={4}>
                                <Button bg="primary.500" _hover={{ bg: "primary.600" }} color="white" fontWeight="semibold" h="auto" px={8} py={4} rounded="lg" shadow="0 10px 15px -3px rgba(46, 110, 184, 0.3)" transition="all 0.3s" _active={{ transform: "translateY(1px)" }}>
                                    <HStack gap={2}>
                                        <LuDownload />
                                        <Text>Download Resume</Text>
                                    </HStack>
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </Container>
            </Box>

            {/* Timeline Section */}
            <Box as="section" id="experience">
                <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                    <HStack gap={4} mb={10} w="full">
                        <Heading fontSize="2xl" fontWeight="bold" color="text.primary" whiteSpace="nowrap">Experience Timeline</Heading>
                        <Separator flex={1} />
                    </HStack>

                    {/* Horizontal Scroll Container */}
                    <Box position="relative">
                        {/* Decorative background line */}
                        <Box display={{ base: "none", md: "block" }} position="absolute" top="8" left="0" right="0" h="0.5" bg="border.DEFAULT" w="full" />
                        <Flex flexDirection={{ base: "column", md: "row" }} gap={{ base: 8, md: 0 }} overflowX="auto" pb={8} css={{ '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }} justifyContent="space-between">
                            <TimelineItem year="2024" role="Senior Full Stack Dev" company="TechCorp Solutions" description="Leading a team of 5 developers to build scalable SaaS products using React and AWS." active />
                            <TimelineItem year="2022" role="UI/UX Lead" company="CreativeAgency" description="Spearheaded the design system overhaul and implemented user-centered design practices." />
                            <TimelineItem year="2020" role="Freelance Developer" company="Self-Employed" description="Delivered 20+ custom websites and web applications for international clients." />
                        </Flex>
                    </Box>
                </Container>
            </Box>

            {/* Skills Section */}
            <Box as="section">
                <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 12, lg: 24 }}>
                        {/* Technical Skills */}
                        <Box>
                            <Heading fontSize="xl" fontWeight="bold" color="text.primary" mb={8} display="flex" alignItems="center" gap={2}>
                                <Span color="primary.500"><LuTerminal /></Span>
                                Development Stack
                            </Heading>
                            <VStack gap={6} align="stretch">
                                <SkillBar skill="React & Next.js" percentage={95} />
                                <SkillBar skill="Node.js & Express" percentage={85} />
                                <SkillBar skill="PostgreSQL / MongoDB" percentage={80} />
                                <SkillBar skill="Python" percentage={70} />
                            </VStack>
                        </Box>
                        {/* Design Skills */}
                        <Box>
                            <Heading fontSize="xl" fontWeight="bold" color="text.primary" mb={8} display="flex" alignItems="center" gap={2}>
                                <Span color="primary.500"><LuPalette /></Span>
                                Design & Tools
                            </Heading>
                            <VStack gap={6} align="stretch">
                                <SkillBar skill="Figma" percentage={90} />
                                <SkillBar skill="Adobe Creative Suite" percentage={85} />
                                <SkillBar skill="Prototyping" percentage={95} />
                            </VStack>
                        </Box>
                    </Grid>
                </Container>
            </Box>

            {/* Interests Section */}
            <Box as="section">
                <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                    <Box position="relative" py={12} px={4} rounded="3xl" overflow="hidden" className="glass-panel">
                        {/* Background Abstract Blobs */}
                        <Box position="absolute" top="0" right="0" w="96" h="96" bg="primary.500/20" rounded="full" filter="blur(64px)" zIndex={-1} transform="translate(50%, -50%)" />
                        <Box position="absolute" bottom="0" left="0" w="72" h="72" bg="blue.400/20" rounded="full" filter="blur(64px)" zIndex={-1} transform="translate(-50%, 50%)" />

                        <Heading fontSize="2xl" fontWeight="bold" color="text.primary" mb={8} textAlign="center">Interests & Hobbies</Heading>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                            <InterestCard icon={<LuCamera />} title="Photography" description="Capturing urban landscapes and street life during my travels." />
                            <InterestCard icon={<LuHeadphones />} title="Music Production" description="Creating lo-fi beats to code to in my spare time." />
                            <InterestCard icon={<LuDumbbell />} title="Fitness" description="Passionate about staying active through cycling and gym sessions." />
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <HStack gap={4} p={4} rounded="xl" bg="surface.light" _dark={{ bg: "gray.800/50" }} shadow="sm" border="1px solid" borderColor="border.subtle">
        <Center boxSize={12} bg="primary.500/10" rounded="lg" color="primary.500">
            {icon}
        </Center>
        <Box>
            <Text fontSize="sm" color="text.muted" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">{label}</Text>
            <Text fontSize="lg" fontWeight="bold" color="text.primary">{value}</Text>
        </Box>
    </HStack>
);

const TimelineItem = ({ year, role, company, description, active = false }: { year: string, role: string, company: string, description: string, active?: boolean }) => (
    <Box position="relative" w={{ base: "full", md: "1/3" }} display="flex" flexDirection={{ base: "row", md: "column" }} alignItems={{ base: "flex-start", md: "center" }} gap={{ base: 4, md: 6 }} className="group">
        <Box display={{ base: "block", md: "none" }} position="absolute" left="19px" top="10" bottom="0" w="0.5" bg="border.DEFAULT" />
        {/* Node */}
        <Center
            position="relative"
            zIndex={10}
            flexShrink={0}
            boxSize={{ base: 10, md: 16 }}
            rounded="full"
            shadow="lg"
            transition="transform 0.3s"
            _groupHover={{ transform: "scale(1.1)", borderColor: "primary.500" }}
        >
            <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} color={active ? "primary.500" : "text.muted"} transition="colors" _groupHover={{ color: "primary.500" }}>{year}</Text>
        </Center>
        {/* Content */}
        <Box bg="surface.light" _dark={{ bg: "gray.800" }} p={6} rounded="xl" shadow="md" border="1px solid" borderColor="border.subtle" w="full" textAlign={{ base: "left", md: "center" }} mx={{ base: 0, md: 4 }} transition="transform 0.3s" _hover={{ transform: "translateY(-4px)" }}>
            <Heading fontSize="lg" fontWeight="bold" color="text.primary">{role}</Heading>
            <Text color="primary.500" fontWeight="medium" fontSize="sm" mb={2}>{company}</Text>
            <Text fontSize="sm" color="text.muted">{description}</Text>
        </Box>
    </Box>
);

const SkillBar = ({ skill, percentage }: { skill: string, percentage: number }) => (
    <Box className="group" w="full">
        <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="semibold" color="text.secondary">{skill}</Text>
            <Text fontSize="sm" fontWeight="bold" color="primary.500">{percentage}%</Text>
        </Flex>
        <Box h="2.5" w="full" bg="bg.muted" rounded="full" overflow="hidden">
            <Box
                h="full"
                bg="primary.500"
                rounded="full"
                transition="width 1s ease-out, background-color 0.3s"
                _groupHover={{ bg: "blue.500" }}
                position="relative"
                overflow="hidden"
                w={`${percentage}%`}
            >
                <Box position="absolute" inset={0} bg="white/20" w="full" h="full" animation="shimmer 2s infinite" />
            </Box>
        </Box>
    </Box>
);

const InterestCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <VStack
        className="glass-panel"
        p={6}
        rounded="2xl"
        textAlign="center"
        transition="transform 0.3s"
        _hover={{ transform: "scale(1.05)" }}
        bg="glass.bg"
    >
        <Center boxSize={12} bg="primary.500/10" rounded="full" color="primary.500" mb={4}>
            {icon}
        </Center>
        <Heading as="h4" fontWeight="bold" color="text.primary" mb={2}>{title}</Heading>
        <Text fontSize="sm" color="text.secondary">{description}</Text>
    </VStack>
);

export default About;
