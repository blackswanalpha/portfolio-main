"use client";

import {
    Box,
    Container,
    Heading,
    Text,
    Flex,
    VStack,
    HStack,
    Image,
    Badge,
    Icon,
    Button,
    Separator,
    Center,
    SimpleGrid
} from "@chakra-ui/react";
import { LuBriefcase, LuCircleCheck, LuDownload, LuMapPin, LuCalendar } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const experiences = [
    {
        year: "2022 - Now",
        role: "Lead Full Stack Engineer",
        company: "NexStream Solutions",
        location: "Nairobi, Kenya",
        description: "Spearheading the architectural migration of legacy systems to a microservices architecture. Leading a team of 8 developers to build scalable fintech solutions impacting 500k+ users daily.",
        achievements: [
            "Reduced server costs by 40% through optimized AWS Lambda implementations.",
            "Designed and implemented a comprehensive Design System reducing UI dev time by 30%.",
            "Mentored junior developers leading to 3 internal promotions within 12 months."
        ],
        technologies: ["React", "Node.js", "TypeScript", "AWS", "GraphQL", "Docker"],
        isCurrent: true,
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIKxzpsyWlK9pGXYz9TJdlA6psz2FY4VuF8I70yrucXoHw7mxJ7nLoWIVq6d16-nkXSJYEq34bTH3b3yH2yYvdoLbr8E9UABj5ZhlvKGEB69cOb-uOpyOy64roBWNies7lWIRPd_7bwcO--yX19SWFdN7ZzoZCQ6-nyh2bWR2m1FI2hB-Sluuj9j8PtSZTJGv6Jcv0kNIRQziSUwMao73xHShnH5f4uX7-esR3cYpQfDwwHXJublqzEl_yb2QW5s0l1_oHxYNxeKz6"
    },
    {
        year: "2019 - 2022",
        role: "Senior UI/UX Designer",
        company: "Elevate Digital",
        location: "San Francisco, CA",
        description: "Led the complete redesign of the agency's flagship e-commerce platform. Conducted user research, wireframing, and high-fidelity prototyping.",
        achievements: [
            "Increased conversion rates by 25% post-redesign.",
            "Established accessibility standards (WCAG 2.1) across all client projects."
        ],
        technologies: ["Figma", "Adobe XD", "Prototyping", "User Research"],
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfPvttszUxMdozunzbBexhn3RhbGEgiwjVw7w5F2vIpbOA7tjfQMJkrV4bVzWQY6QSQZeNzFC50C4iD7F1_-gJW8NHuhcd1c9ArC5OLgvtQlcubnEGJfmriT57We53a4WXbrI4D-31fZ8SktNY49IO22DtaGPXnzYdzvpIQnthM8TPl6wWOVzyH5A48QTCAafb9xtFy8R9XZX3jSgOuiCxkUlhy1VujM6PZSkObpjjLa8gu6oF8PDN1eokFnPpCcinCgHlD8gTLv4B"
    },
    {
        year: "2017 - 2019",
        role: "Frontend Developer",
        company: "StartUp Inc.",
        location: "Remote",
        description: "Developed responsive and interactive web applications for early-stage startups. Collaborated closely with backend engineers to integrate RESTful APIs.",
        achievements: [
            "Built the MVP for a logistics dashboard acquired for $2M.",
            "Optimized page load times by 50% using modern bundling strategies."
        ],
        technologies: ["Vue.js", "SCSS", "Webpack", "Git"],
        logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYzJBkWpUyA7MYwDFRLQ0obuaDwJ9vJ3tzAhBZybl0eNXC2OhI9nmzZsxXo_z_liRQKjuzCWFsjh95AlWDuC4hxG8AXVQnPSVJsC2HN3Uy3cmpIbk_iRv1c8jWepQPCjch_ODHNlP_Djn9nAOnXvOvmP-EhXdGQlHEW4QKmO1dNRVWhI4au-l2clgniAoNKSfMnViSd12QEQrOY8EhsFMAN43eK_iKl8wuOM-Jfuf1zD-RVV24CoJimJBQMvhpZDxsFyBIstCaYeA4"
    }
];

export default function ExperiencePage() {
    return (
        <Box minH="screen" bg="background">
            <Navbar />

            <Container maxW="7xl" pt={{ base: 32, md: 40 }} pb={20} px={{ base: 4, sm: 6, lg: 8 }}>
                {/* Header */}
                <VStack align="center" gap={6} mb={20} textAlign="center">
                    <HStack gap={2} px={4} py={2} rounded="full" bg="primary.50" _dark={{ bg: "primary.900/20" }} color="primary.500" fontWeight="semibold" fontSize="sm">
                        <Box position="relative" display="flex" h="2" w="2">
                            <Box as="span" animation="ping 1.5s infinite" position="absolute" inset={0} rounded="full" bg="primary.400" opacity={0.75} />
                            <Box as="span" position="relative" rounded="full" h="2" w="2" bg="primary.500" />
                        </Box>
                        <Text>Open to Opportunities</Text>
                    </HStack>
                    <Heading as="h1" fontSize={{ base: "4xl", md: "5xl" }} fontWeight="bold" color="text.primary" letterSpacing="tight">
                        My Professional Journey
                    </Heading>
                    <Text fontSize="lg" color="text.secondary" maxW="3xl">
                        Over 8 years of crafting high-performance web applications and intuitive user interfaces. A timeline of innovation, leadership, and technical mastery.
                    </Text>

                    {/* Category Filter */}
                    <HStack p={1.5} bg="white" _dark={{ bg: "gray.800" }} rounded="full" border="1px solid" borderColor="border.subtle" shadow="sm">
                        <Button size="sm" rounded="full" bg="primary.500" color="white" px={6}>All Roles</Button>
                        <Button size="sm" rounded="full" variant="ghost" color="text.muted" _hover={{ color: "primary.500", bg: "primary.50" }} px={6}>Engineering</Button>
                        <Button size="sm" rounded="full" variant="ghost" color="text.muted" _hover={{ color: "primary.500", bg: "primary.50" }} px={6}>Design</Button>
                    </HStack>
                </VStack>

                {/* Timeline */}
                <Box position="relative">
                    {/* Vertical Line */}
                    <Box
                        position="absolute"
                        left={{ base: "8", md: "50%" }}
                        transform={{ base: "none", md: "translateX(-50%)" }}
                        top="0"
                        bottom="0"
                        w="0.5"
                        bgGradient="to-b"
                        gradientFrom="primary.500"
                        gradientTo="gray.200"
                        _dark={{ gradientTo: "gray.800" }}
                    />

                    <VStack gap={16} align="stretch" position="relative" zIndex={10}>
                        {experiences.map((exp, index) => (
                            <Flex key={index} direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "center" }} gap={8} position="relative" className="group">
                                {/* Timeline Node */}
                                <Box
                                    position="absolute"
                                    left={{ base: "8", md: "50%" }}
                                    transform="translate(-50%, -50%)"
                                    top={{ base: "2.5rem", md: "50%" }}
                                    boxSize={exp.isCurrent ? "6" : "4"}
                                    rounded="full"
                                    bg={exp.isCurrent ? "primary.500" : "white"}
                                    border="4px solid"
                                    borderColor="primary.500"
                                    shadow={exp.isCurrent ? "lg" : "none"}
                                    zIndex={20}
                                />

                                {/* Date/Label Column */}
                                <Box
                                    w={{ base: "full", md: "50%" }}
                                    textAlign={{ base: "left", md: index % 2 === 0 ? "right" : "left" }}
                                    order={{ base: 1, md: index % 2 === 0 ? 1 : 2 }}
                                    pl={{ base: 16, md: index % 2 === 0 ? 0 : 12 }}
                                    pr={{ base: 0, md: index % 2 === 0 ? 12 : 0 }}
                                >
                                    <Heading fontSize="2xl" color="primary.500">{exp.isCurrent ? "Present" : exp.year.split(' - ')[1]}</Heading>
                                    <Text color="text.muted" fontWeight="medium">{exp.year}</Text>
                                    <HStack justify={{ base: "flex-start", md: index % 2 === 0 ? "flex-end" : "flex-start" }} color="text.muted" fontSize="sm" mt={1}>
                                        <LuMapPin size={14} />
                                        <Text>{exp.location}</Text>
                                    </HStack>
                                </Box>

                                {/* Card Column */}
                                <Box
                                    w={{ base: "full", md: "50%" }}
                                    order={{ base: 2, md: index % 2 === 0 ? 2 : 1 }}
                                    pl={{ base: 12, md: index % 2 === 0 ? 12 : 0 }}
                                    pr={{ base: 0, md: index % 2 === 0 ? 0 : 12 }}
                                >
                                    <Box
                                        bg="white"
                                        _dark={{ bg: "gray.800", borderColor: exp.isCurrent ? "primary.900/30" : "transparent" }}
                                        _hover={{ borderColor: "primary.300", shadow: "xl" }}
                                        transition="all 0.3s"
                                        position="relative"
                                        overflow="hidden"
                                    >
                                        {exp.isCurrent && (
                                            <Box position="absolute" top="0" right="0" bg="primary.500" color="white" fontSize="xs" fontWeight="bold" px={4} py={1.5} roundedBottom="lg">
                                                Current Role
                                            </Box>
                                        )}

                                        <Flex align="center" gap={4} mb={6}>
                                            <Box boxSize={16} p={2} rounded="xl" bg="gray.50" _dark={{ bg: "gray.900" }} border="1px solid" borderColor="border.subtle">
                                                <Image src={exp.logo} alt={exp.company} objectFit="contain" w="full" h="full" rounded="lg" />
                                            </Box>
                                            <Box>
                                                <Heading fontSize="xl" color="text.primary">{exp.role}</Heading>
                                                <Text color="primary.500" fontWeight="semibold">{exp.company}</Text>
                                            </Box>
                                        </Flex>

                                        <VStack align="flex-start" gap={4} mb={8}>
                                            <Text color="text.secondary" fontSize="md" lineHeight="relaxed">
                                                {exp.description}
                                            </Text>
                                            <VStack align="flex-start" gap={3}>
                                                {exp.achievements.map((ach, i) => (
                                                    <HStack key={i} align="flex-start" gap={3} color="text.primary" fontSize="sm">
                                                        <Box mt={1} color="primary.500"><LuCircleCheck size={18} /></Box>
                                                        <Text>{ach}</Text>
                                                    </HStack>
                                                ))}
                                            </VStack>
                                        </VStack>

                                        <Separator mb={6} />

                                        <VStack align="flex-start" gap={3}>
                                            <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider">Technologies</Text>
                                            <HStack gap={2} flexWrap="wrap">
                                                {exp.technologies.map((tech) => (
                                                    <Badge key={tech} variant="subtle" bg="primary.50" _dark={{ bg: "primary.900/20" }} color="primary.600" px={3} py={1.5} rounded="full" textTransform="none">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </HStack>
                                        </VStack>
                                    </Box>
                                </Box>
                            </Flex>
                        ))}
                    </VStack>
                </Box>

                {/* Call to Action */}
                <Box mt={32} textAlign="center" py={20} borderTop="1px solid" borderColor="border.subtle">
                    <Heading size="xl" mb={4} color="text.primary">Want to dive deeper?</Heading>
                    <Text color="text.secondary" mb={8} maxW="2xl" mx="auto">
                        Download my full resume to see more details about my projects, certifications, and educational background.
                    </Text>
                    <Button bg="primary.500" color="white" size="xl" px={10} h="auto" py={5} rounded="full" fontWeight="bold" shadow="lg" shadowColor="primary.200" _hover={{ bg: "primary.600", transform: "translateY(-2px)" }} transition="all 0.3s" gap={3}>
                        <LuDownload size={22} /> Download Resume (PDF)
                    </Button>
                </Box>
            </Container>

            <Footer />
        </Box>
    );
}
