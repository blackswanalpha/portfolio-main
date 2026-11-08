"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { Badge, Box, Container, Grid, HStack, IconButton, Link as ChakraLink, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuGamepad2, LuMenu } from "react-icons/lu";
import MobileMenu from "./MobileMenu";
import { usePublicSettings } from "@/hooks/usePublicSettings";

const MENU_ID = "site-mobile-menu";

const NAV_LINKS: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
    { label: "Experience", href: "/experience" },
    { label: "Projects", href: "/projects" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Testimonials", href: "/testimonials" },
];

// Scroll position as an external store: no setState in an effect, the server
// snapshot is "top of page", and the value is right even when the page loads
// already scrolled (refresh, back/forward, anchor jump).
function subscribeScroll(onChange: () => void) {
    window.addEventListener("scroll", onChange, { passive: true });
    return () => window.removeEventListener("scroll", onChange);
}
const readScrolled = () => window.scrollY > 20;
const readScrolledOnServer = () => false;

const Navbar = () => {
    const pathname = usePathname();
    const settings = usePublicSettings();
    const isScrolled = useSyncExternalStore(subscribeScroll, readScrolled, readScrolledOnServer);

    // The menu belongs to the route it was opened on, so any navigation
    // (link, back/forward) closes it without an effect.
    const [menuPath, setMenuPath] = useState<string | null>(null);
    const isMenuOpen = menuPath !== null && menuPath === pathname;
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const closeMenu = useCallback(() => {
        setMenuPath(null);
        menuButtonRef.current?.focus();
    }, []);

    return (
        <>
            <Box as="nav" aria-label="Main" position="fixed" top="0" insetX="0" zIndex={50} px={{ base: 4, sm: 6, lg: 8 }} pt={4}>
                <Container maxW="7xl" p={0}>
                    {/* Three columns from lg: the links stay centred no matter
                        how wide the logo side (badge) or the actions side is. */}
                    <Grid
                        templateColumns={{ base: "1fr auto", lg: "1fr auto 1fr" }}
                        alignItems="center"
                        columnGap={6}
                        px={{ base: 4, md: 6 }}
                        py={3}
                        rounded="xl"
                        bg="surface"
                        borderWidth="1px"
                        borderColor="border"
                        boxShadow={
                            isScrolled
                                ? "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.18)"
                                : "0 1px 2px rgba(15, 23, 42, 0.04)"
                        }
                        transitionProperty="box-shadow"
                        transitionDuration="moderate"
                        transitionTimingFunction="ease-out"
                    >
                        {/* Logo + availability */}
                        <HStack gap={3} minW={0}>
                            <ChakraLink
                                asChild
                                display="inline-flex"
                                alignItems="center"
                                gap={2}
                                rounded="lg"
                                textDecoration="none"
                                _hover={{ textDecoration: "none" }}
                            >
                                <Link href="/" aria-label="Victor Mbugua, home">
                                    <Box
                                        w={10}
                                        h={10}
                                        flexShrink={0}
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
                                    <Text
                                        as="span"
                                        fontFamily="serif"
                                        fontWeight={600}
                                        fontSize="lg"
                                        letterSpacing="-0.01em"
                                        whiteSpace="nowrap"
                                        display={{ base: "none", sm: "block" }}
                                        color="text.primary"
                                    >
                                        Victor Mbugua
                                    </Text>
                                </Link>
                            </ChakraLink>
                            {settings.available_for_work && (
                                <Badge
                                    colorPalette="green"
                                    variant="subtle"
                                    rounded="md"
                                    px={2.5}
                                    py={1}
                                    fontSize="xs"
                                    fontWeight={500}
                                    whiteSpace="nowrap"
                                    // Hidden at lg, where the centred links leave too little room.
                                    display={{ base: "none", sm: "inline-flex", lg: "none", xl: "inline-flex" }}
                                    alignItems="center"
                                    gap={1.5}
                                >
                                    <Box as="span" w={1.5} h={1.5} rounded="full" bg="green.600" aria-hidden="true" />
                                    Open to work
                                </Badge>
                            )}
                        </HStack>

                        {/* Desktop links */}
                        <HStack as="ul" display={{ base: "none", lg: "flex" }} gap={6}>
                            {NAV_LINKS.map((link) => (
                                <Box as="li" key={link.href}>
                                    <ChakraLink
                                        asChild
                                        display="inline-flex"
                                        alignItems="center"
                                        fontSize="sm"
                                        fontWeight={500}
                                        whiteSpace="nowrap"
                                        color="text.secondary"
                                        rounded="sm"
                                        textDecoration="none"
                                        transitionProperty="color"
                                        transitionDuration="fast"
                                        _hover={{ color: "primary.600", textDecoration: "none" }}
                                        _active={{ color: "primary.700" }}
                                    >
                                        <Link href={link.href}>{link.label}</Link>
                                    </ChakraLink>
                                </Box>
                            ))}
                        </HStack>

                        {/* Actions */}
                        <HStack gap={2} justifySelf="end">
                            <IconButton
                                asChild
                                display={{ base: "none", lg: "inline-flex" }}
                                variant="ghost"
                                aria-label="Arcade"
                                color="text.secondary"
                                _hover={{ color: "text.primary", bg: "blackAlpha.50" }}
                                _active={{ bg: "blackAlpha.100" }}
                            >
                                <Link href="/puzzle-game" title="Arcade">
                                    <LuGamepad2 size={20} aria-hidden="true" />
                                </Link>
                            </IconButton>

                            <IconButton
                                ref={menuButtonRef}
                                display={{ base: "inline-flex", lg: "none" }}
                                variant="ghost"
                                aria-label="Open menu"
                                aria-haspopup="dialog"
                                aria-expanded={isMenuOpen}
                                aria-controls={isMenuOpen ? MENU_ID : undefined}
                                onClick={() => setMenuPath(pathname)}
                                color="text.secondary"
                                _hover={{ color: "text.primary", bg: "blackAlpha.50" }}
                                _active={{ bg: "blackAlpha.100" }}
                            >
                                <LuMenu size={20} />
                            </IconButton>
                        </HStack>
                    </Grid>
                </Container>
            </Box>
            <MobileMenu id={MENU_ID} isOpen={isMenuOpen} onClose={closeMenu} />
        </>
    );
};

export default Navbar;
