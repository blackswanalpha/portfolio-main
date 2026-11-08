"use client";

import { Box, Button, Container, Heading, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageWrapper, { PageEntrance } from "@/components/PageWrapper";

/**
 * App-wide 404 (unknown URLs and notFound()). Same chrome as every page, one
 * calm message and two ways back in.
 */
export default function NotFound() {
    return (
        <PageWrapper>
            <title>Page not found · Victor Mbugua</title>
            <Box minH="100vh" bg="background" display="flex" flexDirection="column">
                <Navbar />
                <PageEntrance as="main" flex="1">
                    <Container maxW="3xl" pt={{ base: 36, md: 44 }} pb={{ base: 24, md: 32 }} px={{ base: 4, sm: 6, lg: 8 }}>
                        <Heading as="h1" textStyle="pageTitle" color="text.primary">
                            Page not found
                        </Heading>
                        <Text textStyle="lead" color="text.secondary" mt={5} maxW="xl">
                            This page doesn&apos;t exist or has moved.
                        </Text>
                        <HStack gap={3} mt={10} flexWrap="wrap">
                            <Button
                                asChild
                                size="lg"
                                rounded="md"
                                px={6}
                                bg="primary.500"
                                color="white"
                                _hover={{ bg: "primary.600" }}
                                _active={{ bg: "primary.700" }}
                            >
                                <Link href="/">Back to home</Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                rounded="md"
                                px={6}
                                variant="outline"
                                borderColor="border"
                                color="text.primary"
                                _hover={{ bg: "blackAlpha.50", borderColor: "blackAlpha.200" }}
                                _active={{ bg: "blackAlpha.100" }}
                            >
                                <Link href="/projects">
                                    Browse projects <LuArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                        </HStack>
                    </Container>
                </PageEntrance>
                <Footer />
            </Box>
        </PageWrapper>
    );
}
