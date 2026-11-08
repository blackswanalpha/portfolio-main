"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Box, Container, Flex, HStack, Link as ChakraLink, SimpleGrid, Separator, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import type { IconType } from "react-icons";
import { LuHeart } from "react-icons/lu";
import { SOCIAL_LINKS } from "@/lib/socialLinks";
import { usePublicSettings } from "@/hooks/usePublicSettings";

// The current year, read on the client only. The server snapshot (also used
// for the hydration render) is a constant, so a page prerendered last year
// never mismatches; the year fills in right after hydration.
const subscribeNever = () => () => {};
const readYear = () => new Date().getFullYear();
const readYearOnServer = () => null;

const Footer = () => {
    const year = useSyncExternalStore(subscribeNever, readYear, readYearOnServer);
    const settings = usePublicSettings();

    return (
        <Box as="footer" bg="surface" pt={16} pb={8} borderTopWidth="1px" borderColor="border">
            <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={12} mb={16}>
                    {/* Brand */}
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
                                fontWeight={600}
                                fontSize="lg"
                                aria-hidden="true"
                            >
                                VM
                            </Box>
                            <Text fontFamily="serif" fontWeight={600} fontSize="xl" letterSpacing="-0.01em" color="text.primary">
                                Victor Mbugua
                            </Text>
                        </HStack>
                        <Text color="text.secondary" fontSize="sm" lineHeight="1.6" maxW="xs">
                            Crafting high-end digital experiences that blend aesthetic beauty with robust engineering.
                        </Text>
                        <HStack gap={3}>
                            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                                <SocialIcon key={label} icon={Icon} href={href} label={label} />
                            ))}
                        </HStack>
                    </VStack>

                    {/* Explore: every label names the real page or section it opens */}
                    <FooterColumn title="Explore">
                        <FooterLink href="/">Home</FooterLink>
                        <FooterLink href="/#about">About</FooterLink>
                        <FooterLink href="/projects">Projects</FooterLink>
                        <FooterLink href="/experience">Experience</FooterLink>
                        <FooterLink href="/gallery">Gallery</FooterLink>
                        <FooterLink href="/blog">Blog</FooterLink>
                        <FooterLink href="/testimonials">Testimonials</FooterLink>
                    </FooterColumn>

                    {/* Services (follows the admin's services toggle, like the home section).
                        One link per real destination; no labels that share an anchor. */}
                    {settings.show_freelance && (
                        <FooterColumn title="Services">
                            <FooterLink href="/#services">Services</FooterLink>
                            <FooterLink href="/#pricing">Packages</FooterLink>
                            <FooterLink href="/#contact">Start a project</FooterLink>
                        </FooterColumn>
                    )}

                    {/* Contact */}
                    <FooterColumn title="Get in touch">
                        <Text fontSize="sm" color="text.secondary">
                            Nairobi, Kenya
                        </Text>
                        <ChakraLink
                            href="mailto:kamandembugua18@gmail.com"
                            fontSize="sm"
                            color="text.secondary"
                            rounded="sm"
                            transitionProperty="color"
                            transitionDuration="fast"
                            _hover={{ color: "primary.600" }}
                            _active={{ color: "primary.700" }}
                        >
                            kamandembugua18@gmail.com
                        </ChakraLink>
                        {settings.available_for_work && (
                            <HStack gap={2} pt={1} fontSize="sm" color="text.primary">
                                <Box w={2} h={2} rounded="full" bg="green.600" aria-hidden="true" />
                                <Text>Available for new projects</Text>
                            </HStack>
                        )}
                    </FooterColumn>
                </SimpleGrid>

                <Separator borderColor="border" mb={8} />

                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align="center"
                    gap={4}
                    textStyle="meta"
                    color="text.muted"
                >
                    <Text>
                        &copy; {year !== null ? `${year} ` : ""}Victor Mbugua.
                        <Text as="span" display={{ base: "none", sm: "inline" }}>
                            {" "}
                            All rights reserved.
                        </Text>
                    </Text>
                    <Flex align="center" gap={1}>
                        <Text>Made with</Text>
                        <LuHeart size={12} aria-label="love" role="img" />
                        <Text>in Nairobi</Text>
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
};

const FooterColumn = ({ title, children }: { title: string; children: ReactNode }) => (
    <VStack align="flex-start" gap={4}>
        <Text textStyle="label" color="text.primary">
            {title}
        </Text>
        <VStack align="flex-start" gap={3}>
            {children}
        </VStack>
    </VStack>
);

const FooterLink = ({ href, children }: { href: string; children: ReactNode }) => (
    <ChakraLink
        asChild
        fontSize="sm"
        color="text.secondary"
        rounded="sm"
        transitionProperty="color"
        transitionDuration="fast"
        _hover={{ color: "primary.600" }}
        _active={{ color: "primary.700" }}
    >
        <Link href={href}>{children}</Link>
    </ChakraLink>
);

const SocialIcon = ({ icon: Icon, href, label }: { icon: IconType; href: string; label: string }) => (
    <ChakraLink
        href={href}
        aria-label={label}
        target="_blank"
        rel="noopener noreferrer"
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxSize={10}
        rounded="md"
        borderWidth="1px"
        borderColor="border"
        color="text.secondary"
        transitionProperty="color, background-color, border-color"
        transitionDuration="fast"
        _hover={{ color: "primary.600", bg: "primary.50", borderColor: "primary.200" }}
        _active={{ bg: "primary.100" }}
    >
        <Icon size={18} aria-hidden="true" />
    </ChakraLink>
);

export default Footer;
