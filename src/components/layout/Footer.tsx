"use client";

import {
    Box,
    Container,
    Flex,
    VStack,
    HStack,
    Text,
    Heading,
    Link as ChakraLink,
    Icon,
    Separator,
    SimpleGrid
} from "@chakra-ui/react";
import Link from "next/link";
import { LuGithub, LuTwitter, LuLinkedin, LuDribbble, LuHeart } from "react-icons/lu";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box as="footer" bg="surface.light" _dark={{ bg: "slate.900" }} pt={16} pb={8} borderTop="1px solid" borderColor="border.subtle">
            <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={12} mb={16}>
                    {/* Brand Column */}
                    <VStack align="flex-start" gap={6}>
                        <HStack gap={3}>
                            <Box
                                w={10}
                                h={10}
                                bg="primary.500"
                                color="white"
                                rounded="lg"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontWeight="bold"
                                fontSize="xl"
                                shadow="lg"
                            >
                                VM
                            </Box>
                            <Text fontWeight="bold" fontSize="xl" letterSpacing="tight" color="text.primary">
                                Victor Mbugua
                            </Text>
                        </HStack>
                        <Text color="text.muted" fontSize="sm" lineHeight="relaxed">
                            Crafting high-end digital experiences that blend aesthetic beauty with robust engineering.
                        </Text>
                        <HStack gap={4}>
                            <SocialIcon icon={LuGithub} href="#" label="GitHub" />
                            <SocialIcon icon={LuTwitter} href="#" label="Twitter" />
                            <SocialIcon icon={LuLinkedin} href="#" label="LinkedIn" />
                            <SocialIcon icon={LuDribbble} href="#" label="Dribbble" />
                        </HStack>
                    </VStack>

                    {/* Quick Links */}
                    <VStack align="flex-start" gap={6}>
                        <Heading size="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="text.primary">
                            Explore
                        </Heading>
                        <VStack align="flex-start" gap={3}>
                            <FooterLink href="/">Home</FooterLink>
                            <FooterLink href="#about">About Me</FooterLink>
                            <FooterLink href="#projects">Portfolio</FooterLink>
                            <FooterLink href="#experience">Experience</FooterLink>
                        </VStack>
                    </VStack>

                    {/* Services */}
                    <VStack align="flex-start" gap={6}>
                        <Heading size="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="text.primary">
                            Services
                        </Heading>
                        <VStack align="flex-start" gap={3}>
                            <FooterLink href="#">Web Development</FooterLink>
                            <FooterLink href="#">UI/UX Design</FooterLink>
                            <FooterLink href="#">Consultation</FooterLink>
                            <FooterLink href="#">SAAS Solutions</FooterLink>
                        </VStack>
                    </VStack>

                    {/* Contact Info */}
                    <VStack align="flex-start" gap={6}>
                        <Heading size="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="text.primary">
                            Get in Touch
                        </Heading>
                        <VStack align="flex-start" gap={3}>
                            <Text fontSize="sm" color="text.muted">Nairobi, Kenya</Text>
                            <ChakraLink href="mailto:hello@victordev.com" color="text.secondary" _hover={{ color: "primary.500" }} fontSize="sm">
                                hello@victordev.com
                            </ChakraLink>
                            <Box pt={2}>
                                <Box className="glass-panel" p={3} rounded="lg" border="1px solid" borderColor="border.subtle">
                                    <Text fontSize="xs" fontWeight="bold" color="primary.500" textTransform="uppercase">Status</Text>
                                    <Text fontSize="sm" color="text.primary">Available for Projects</Text>
                                </Box>
                            </Box>
                        </VStack>
                    </VStack>
                </SimpleGrid>

                <Separator borderColor="border.subtle" mb={8} />

                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align="center"
                    gap={4}
                    fontSize="sm"
                    color="text.muted"
                >
                    <HStack gap={1}>
                        <Text>&copy; {currentYear} Victor Mbugua.</Text>
                        <Text display={{ base: "none", sm: "block" }}>All rights reserved.</Text>
                    </HStack>

                    <HStack gap={6}>
                        <ChakraLink href="#" _hover={{ color: "primary.500" }}>Privacy Policy</ChakraLink>
                        <ChakraLink href="#" _hover={{ color: "primary.500" }}>Terms of Service</ChakraLink>
                    </HStack>

                    <Flex align="center" gap={1}>
                        <Text>Made with</Text>
                        <Icon as={LuHeart} color="red.500" boxSize={3} />
                        <Text>in Nairobi</Text>
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <ChakraLink
        asChild
        fontSize="sm"
        color="text.muted"
        _hover={{ color: "primary.500", transform: "translateX(4px)" }}
        transition="all 0.2s"
    >
        <Link href={href}>{children}</Link>
    </ChakraLink>
);

const SocialIcon = ({ icon, href, label }: { icon: any; href: string; label: string }) => (
    <ChakraLink
        href={href}
        aria-label={label}
        className="glass-panel"
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxSize={10}
        rounded="full"
        border="1px solid"
        borderColor="border.subtle"
        color="text.secondary"
        _hover={{ bg: "primary.500", color: "white", borderColor: "primary.500", transform: "translateY(-2px)" }}
        transition="all 0.3s"
    >
        <Icon as={icon} boxSize={5} />
    </ChakraLink>
);

export default Footer;
