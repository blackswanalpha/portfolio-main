"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { authed, checked } = useRequireAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Escape closes the mobile drawer.
    useEffect(() => {
        if (!sidebarOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSidebarOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [sidebarOpen]);

    if (!checked || !authed) {
        return (
            <Flex minH="100vh" align="center" justify="center" gap={3} bg="background" role="status" aria-live="polite">
                <Spinner size="sm" color="primary.500" />
                <Text fontSize="sm" color="text.secondary">
                    Checking your session
                </Text>
            </Flex>
        );
    }

    return (
        <Flex minH="100vh" bg="background">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {/* Backdrop for the mobile drawer */}
            <Box
                display={{ base: sidebarOpen ? "block" : "none", lg: "none" }}
                position="fixed"
                inset={0}
                bg="blackAlpha.500"
                zIndex={19}
                onClick={() => setSidebarOpen(false)}
                aria-hidden
            />
            <Box
                as="main"
                className="scroll-area"
                flex={1}
                minW={0}
                ml={{ base: 0, lg: "256px" }}
                px={{ base: 4, md: 8 }}
                py={{ base: 4, md: 8 }}
                overflowY="auto"
                h="100vh"
            >
                <AdminHeader menuOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
                {children}
            </Box>
        </Flex>
    );
}
