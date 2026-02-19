"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Link as ChakraLink,
  Container,
  HStack,
  VisuallyHidden
} from "@chakra-ui/react";
import Link from "next/link";
import { LuMenu } from "react-icons/lu";
import MobileMenu from "./MobileMenu";
import { ColorModeButton } from "@/components/ui/color-mode";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Experience", href: "/experience" },
    { label: "Projects", href: "/projects" },
    { label: "Freelance", href: "/freelance" },
    { label: "Testimonials", href: "/testimonials" },
  ];

  return (
    <>
      <Box
        as="nav"
        position="fixed"
        top="0"
        w="full"
        zIndex={50}
        transition="all 0.3s"
        px={{ base: 4, sm: 6, lg: 8 }}
        pt={4}
      >
        <Container maxW="7xl" p={0}>
          <Flex
            className="glass-panel"
            rounded="xl"
            shadow="sm"
            px={6}
            py={isScrolled ? 3 : 4}
            align="center"
            justify="space-between"
            transition="all 0.3s"
            bg={isScrolled ? "glass.bg" : "rgba(255, 255, 255, 0.4)"}
            _dark={{
              bg: isScrolled ? "glass.bg" : "rgba(19, 25, 31, 0.4)"
            }}
          >
            {/* Logo */}
            <HStack gap={2}>
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
                shadow="0 10px 15px -3px rgba(46, 110, 184, 0.3)"
              >
                VM
              </Box>
              <Text
                fontWeight="bold"
                fontSize="lg"
                letterSpacing="tight"
                display={{ base: "none", sm: "block" }}
                color="text.primary"
              >
                Victor Mbugua
              </Text>
            </HStack>

            {/* Desktop Menu */}
            <HStack display={{ base: "none", md: "flex" }} gap={8}>
              {navLinks.map((link) => (
                <ChakraLink
                  asChild
                  key={link.label}
                  fontSize="sm"
                  fontWeight="medium"
                  color="text.secondary"
                  _hover={{ color: "primary.500" }}
                  transition="colors"
                >
                  <Link href={link.href}>{link.label}</Link>
                </ChakraLink>
              ))}
            </HStack>

            {/* Actions */}
            <HStack gap={{ base: 2, md: 4 }}>
              <ColorModeButton />

              <Box display={{ base: "none", md: "block" }}>
                <ChakraLink
                  asChild
                  fontSize="sm"
                  fontWeight="medium"
                  color="text.muted"
                  _hover={{ color: "primary.500" }}
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Link href="/admin/login">
                    <Text as="span" className="material-icons" fontSize="base">settings</Text>
                    Admin Login
                  </Link>
                </ChakraLink>
              </Box>

              {/* Mobile menu button */}
              <Box display={{ base: "block", md: "none" }}>
                <IconButton
                  variant="ghost"
                  aria-label="Open Menu"
                  onClick={() => setIsMobileMenuOpen(true)}
                  color="text.secondary"
                  _hover={{ color: "primary.500", bg: "transparent" }}
                >
                  <LuMenu size={24} />
                </IconButton>
              </Box>
            </HStack>
          </Flex>
        </Container>
      </Box>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default Navbar;