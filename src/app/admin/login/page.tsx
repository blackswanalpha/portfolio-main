"use client";

import Link from "next/link";
import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    Icon,
    Button,
    Input,
    Checkbox
} from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";
import {
    LuMail,
    LuLock,
    LuEye,
    LuShieldCheck,
    LuArrowLeft,
    LuLogIn,
    LuCode
} from "react-icons/lu";
import PageWrapper from "@/components/PageWrapper";
import ScrollReveal from "@/components/ScrollReveal";

export default function LoginPage() {
    return (
        <PageWrapper>
            <Box
                minH="100vh"
                bg="background.light"
                _dark={{ bg: "background.dark" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                p="4"
                position="relative"
                overflow="hidden"
                fontFamily="display"
                transition="colors"
                transitionDuration="300ms"
            >
                {/* Mesh Background Effect */}
                <Box position="fixed" inset="0" pointerEvents="none" zIndex="0" overflow="hidden">
                    <Box position="absolute" top="0" left="0" w="full" h="full" opacity="0.5" _dark={{ opacity: "0.2" }} mixBlendMode="overlay">
                        <Box
                            position="absolute"
                            top="0"
                            left="0"
                            w="full"
                            h="full"
                            bg="radial-gradient(at 0% 0%, hsla(212, 85%, 90%, 1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(212, 85%, 96%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(212, 85%, 90%, 1) 0, transparent 50%)"
                            _dark={{
                                bg: "radial-gradient(at 0% 0%, hsla(212, 85%, 12%, 1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(212, 85%, 8%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(212, 85%, 12%, 1) 0, transparent 50%)"
                            }}
                        />
                    </Box>
                </Box>

                <Box position="fixed" top="4" right="4" zIndex="50">
                    <ColorModeButton />
                </Box>

                {/* Main Container */}
                <Box as="main" w="full" maxW="md" position="relative" zIndex="10">
                    {/* Logo & Brand Header */}
                    <ScrollReveal width="100%">
                        <VStack textAlign="center" mb="8" gap={1}>
                            <Box
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                                w="12"
                                h="12"
                                rounded="xl"
                                bg="primary.50"
                                _dark={{ bg: "primary.900" }}
                                color="primary.500"
                                mb="4"
                            >
                                <Icon as={LuCode} boxSize={6} />
                            </Box>
                            <Heading size="xl" fontWeight="bold" letterSpacing="tight" color="text.primary" _dark={{ color: "text.dark.primary" }}>
                                Victor Mbugua
                            </Heading>
                            <Text color="text.muted" _dark={{ color: "text.dark.muted" }} fontSize="sm" fontWeight="medium" letterSpacing="wide">
                                PORTFOLIO CMS
                            </Text>
                        </VStack>
                    </ScrollReveal>

                    {/* Login Card */}
                    <ScrollReveal width="100%" transition={{ delay: 0.2 }}>
                        <Box
                            bg="surface.light"
                            _dark={{ bg: "surface.dark", shadow: "none", borderColor: "border.dark" }}
                            rounded="xl"
                            shadow="xl"
                            border="1px solid"
                            borderColor="border.light"
                            overflow="hidden"
                            position="relative"
                        >
                            {/* Decorative Top Line */}
                            <Box h="1" w="full" bgGradient="to-r" gradientFrom="transparent" gradientVia="primary.500" gradientTo="transparent" opacity="0.7" />

                            <Box p="8">
                                <HStack gap={2} mb="6" color="text.primary" _dark={{ color: "text.dark.primary" }}>
                                    <Icon as={LuShieldCheck} color="primary.500" boxSize={5} />
                                    <Heading size="md" fontWeight="semibold">Admin Portal Access</Heading>
                                </HStack>

                                <form action="#" onSubmit={(e) => e.preventDefault()}>
                                    <VStack gap={6} align="stretch">
                                        {/* Email Field */}
                                        <VStack align="flex-start" gap={1}>
                                            <Text as="label" fontSize="sm" fontWeight="medium" color="text.secondary" _dark={{ color: "text.dark.secondary" }}>Email Address</Text>
                                            <Box position="relative" w="full">
                                                <Box position="absolute" insetY="0" left="0" pl="3" display="flex" alignItems="center" pointerEvents="none" zIndex="1">
                                                    <Icon as={LuMail} color="text.muted" _dark={{ color: "text.dark.muted" }} boxSize={5} />
                                                </Box>
                                                <Input
                                                    pl="10"
                                                    py="2.5"
                                                    bg="background.light"
                                                    _dark={{ bg: "background.dark", borderColor: "border.dark" }}
                                                    borderColor="border.light"
                                                    rounded="lg"
                                                    _focus={{ ring: "2", ringColor: "primary.500/20", borderColor: "primary.500" }}
                                                    placeholder="admin@victormbugua.com"
                                                    required
                                                    type="email"
                                                />
                                            </Box>
                                        </VStack>

                                        {/* Password Field */}
                                        <VStack align="flex-start" gap={1}>
                                            <Text as="label" fontSize="sm" fontWeight="medium" color="text.secondary" _dark={{ color: "text.dark.secondary" }}>Password</Text>
                                            <Box position="relative" w="full">
                                                <Box position="absolute" insetY="0" left="0" pl="3" display="flex" alignItems="center" pointerEvents="none" zIndex="1">
                                                    <Icon as={LuLock} color="text.muted" _dark={{ color: "text.dark.muted" }} boxSize={5} />
                                                </Box>
                                                <Input
                                                    pl="10"
                                                    pr="10"
                                                    py="2.5"
                                                    bg="background.light"
                                                    _dark={{ bg: "background.dark", borderColor: "border.dark" }}
                                                    borderColor="border.light"
                                                    rounded="lg"
                                                    _focus={{ ring: "2", ringColor: "primary.500/20", borderColor: "primary.500" }}
                                                    placeholder="••••••••"
                                                    required
                                                    type="password"
                                                />
                                                <Button
                                                    position="absolute"
                                                    insetY="0"
                                                    right="0"
                                                    variant="ghost"
                                                    color="text.muted"
                                                    _dark={{ color: "text.dark.muted", _hover: { color: "text.dark.primary" } }}
                                                    _hover={{ color: "text.primary", bg: "transparent" }}
                                                    px="3"
                                                >
                                                    <Icon as={LuEye} boxSize={5} />
                                                </Button>
                                            </Box>
                                        </VStack>

                                        {/* Remember Me & Forgot Password Row */}
                                        <Flex align="center" justify="space-between" pt="1">
                                            <HStack gap={2}>
                                                <Checkbox.Root id="remember-me">
                                                    <Checkbox.HiddenInput />
                                                    <Checkbox.Control>
                                                        <Checkbox.Indicator />
                                                    </Checkbox.Control>
                                                    <Checkbox.Label fontSize="sm" color="text.secondary" _dark={{ color: "text.dark.secondary" }} cursor="pointer" userSelect="none">
                                                        Remember this device
                                                    </Checkbox.Label>
                                                </Checkbox.Root>
                                            </HStack>
                                            <Link href="#" className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
                                                Forgot password?
                                            </Link>
                                        </Flex>

                                        {/* Submit Button */}
                                        <Button
                                            size="lg"
                                            bg="primary.500"
                                            _hover={{ bg: "primary.600", shadow: "lg" }}
                                            color="white"
                                            rounded="lg"
                                            shadow="sm"
                                            fontWeight="medium"
                                            transition="all"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            gap={2}
                                            type="submit"
                                        >
                                            <Icon as={LuLogIn} boxSize={5} />
                                            Secure Login
                                        </Button>
                                    </VStack>
                                </form>
                            </Box>

                            {/* Bottom Card Footer (Security Badge) */}
                            <Box bg="background.light" _dark={{ bg: "background.dark", borderTopColor: "border.dark" }} px="8" py="4" borderTop="1px solid" borderColor="border.light">
                                <HStack justify="center" gap={1} color="text.muted" _dark={{ color: "text.dark.muted" }}>
                                    <Icon as={LuShieldCheck} boxSize={4} />
                                    <Text fontSize="xs">256-bit SSL Encrypted Connection</Text>
                                </HStack>
                            </Box>
                        </Box>
                    </ScrollReveal>

                    {/* Back Link */}
                    <Box mt="8" textAlign="center">
                        <Link href="/" className="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                            <Icon as={LuArrowLeft} mr="1" transition="transform" transitionDuration="200ms" _groupHover={{ transform: "translateX(-4px)" }} />
                            Back to Portfolio
                        </Link>
                    </Box>
                </Box>
            </Box>
        </PageWrapper>
    );
}
