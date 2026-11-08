"use client";

import { Box, Flex, IconButton, Text, VisuallyHidden } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import type { IconType } from "react-icons";
import {
    LuBriefcase,
    LuChartLine,
    LuFileText,
    LuFolderOpen,
    LuHistory,
    LuImage,
    LuLayoutDashboard,
    LuLogOut,
    LuMail,
    LuMessageSquareQuote,
    LuSettings,
    LuWrench,
} from "react-icons/lu";
import { useAuthStore } from "@/store/auth";
import { useTestimonialBadge } from "@/store/testimonialBadge";

interface NavLink {
    href: string;
    label: string;
    icon: IconType;
    /** Show the testimonials "pending review" count on this link. */
    badge?: "testimonials-pending";
}

const SECTIONS: { title: string; links: NavLink[] }[] = [
    {
        title: "Overview",
        links: [{ href: "/admin", label: "Dashboard", icon: LuLayoutDashboard }],
    },
    {
        title: "Content",
        links: [
            { href: "/admin/projects", label: "Projects", icon: LuFolderOpen },
            { href: "/admin/blog", label: "Blog", icon: LuFileText },
            { href: "/admin/gallery", label: "Gallery", icon: LuImage },
            { href: "/admin/services", label: "Services", icon: LuWrench },
        ],
    },
    {
        title: "Business",
        links: [
            { href: "/admin/freelance", label: "Freelance", icon: LuBriefcase },
            { href: "/admin/inquiries", label: "Inquiries", icon: LuMail },
        ],
    },
    {
        title: "Site",
        links: [
            { href: "/admin/experience", label: "Experience", icon: LuHistory },
            { href: "/admin/testimonials", label: "Testimonials", icon: LuMessageSquareQuote, badge: "testimonials-pending" },
        ],
    },
    {
        title: "System",
        links: [
            { href: "/admin/analytics", label: "Analytics", icon: LuChartLine },
            { href: "/admin/settings", label: "Settings", icon: LuSettings },
        ],
    },
];

interface SidebarProps {
    /** Mobile drawer state. Ignored at lg and up, where the sidebar is static. */
    isOpen: boolean;
    onClose: () => void;
}

function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);
    const pendingCount = useTestimonialBadge((s) => s.pendingCount);
    const refreshBadge = useTestimonialBadge((s) => s.refresh);

    // Refresh the pending-review count on mount and on every route change.
    useEffect(() => {
        refreshBadge();
    }, [pathname, refreshBadge]);

    const handleLogout = () => {
        onClose();
        logout();
        router.push("/admin/login");
    };

    const isActive = (href: string) =>
        href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

    const displayName = user?.full_name || user?.username || "Admin";

    return (
        <Box
            as="aside"
            id="admin-sidebar"
            aria-label="Admin navigation"
            w="256px"
            bg="surface"
            borderRight="1px solid"
            borderColor="border"
            display="flex"
            flexDirection="column"
            position="fixed"
            h="full"
            zIndex={20}
            transition="transform 0.2s ease-out, visibility 0.2s"
            transform={{
                base: isOpen ? "translateX(0)" : "translateX(-100%)",
                lg: "translateX(0)",
            }}
            // Off-canvas links must not be reachable by Tab on small screens.
            visibility={{ base: isOpen ? "visible" : "hidden", lg: "visible" }}
        >
            <Flex h={16} align="center" gap={3} px={5} borderBottom="1px solid" borderColor="border" flexShrink={0}>
                <Flex w={8} h={8} rounded="lg" bg="primary.500" align="center" justify="center" color="white" fontWeight={600} aria-hidden>
                    V
                </Flex>
                <Text fontWeight={600} color="text.primary">
                    Victor Mbugua
                </Text>
            </Flex>

            <Box as="nav" flex={1} overflowY="auto" px={3} pt={4} pb={6}>
                {SECTIONS.map((section, si) => (
                    <Box key={section.title} mt={si === 0 ? 0 : 6}>
                        <Text px={3} mb={1} fontSize="xs" fontWeight={500} color="text.muted">
                            {section.title}
                        </Text>
                        <Box as="ul" listStyleType="none">
                            {section.links.map((link) => {
                                const active = isActive(link.href);
                                const LinkIcon = link.icon;
                                const showBadge = link.badge === "testimonials-pending" && pendingCount > 0;
                                return (
                                    <Box as="li" key={link.href} mt={0.5}>
                                        <Box
                                            asChild
                                            display="flex"
                                            alignItems="center"
                                            gap={2.5}
                                            h={9}
                                            px={3}
                                            rounded="lg"
                                            fontSize="sm"
                                            fontWeight={500}
                                            bg={active ? "primary.50" : "transparent"}
                                            color={active ? "primary.700" : "text.secondary"}
                                            transition="background-color 0.15s ease-out, color 0.15s ease-out"
                                            _hover={active ? undefined : { bg: "gray.100", color: "text.primary" }}
                                            _active={{ bg: active ? "primary.100" : "gray.200" }}
                                        >
                                            <Link href={link.href} onClick={onClose} aria-current={active ? "page" : undefined}>
                                                <Box as="span" color={active ? "primary.600" : "text.muted"} lineHeight={0} aria-hidden>
                                                    <LinkIcon size={18} />
                                                </Box>
                                                {link.label}
                                                {showBadge ? (
                                                    <Box
                                                        as="span"
                                                        ml="auto"
                                                        minW={5}
                                                        h={5}
                                                        px={1.5}
                                                        display="inline-flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        rounded="md"
                                                        bg={active ? "primary.100" : "gray.100"}
                                                        color={active ? "primary.700" : "text.primary"}
                                                        fontSize="xs"
                                                        fontWeight={500}
                                                        fontVariantNumeric="tabular-nums"
                                                    >
                                                        {pendingCount}
                                                        <VisuallyHidden> pending review</VisuallyHidden>
                                                    </Box>
                                                ) : null}
                                            </Link>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                ))}
            </Box>

            <Flex align="center" gap={3} p={4} borderTop="1px solid" borderColor="border" flexShrink={0}>
                <Flex
                    w={9}
                    h={9}
                    rounded="md"
                    bg="gray.100"
                    color="text.secondary"
                    align="center"
                    justify="center"
                    fontSize="xs"
                    fontWeight={600}
                    flexShrink={0}
                    aria-hidden
                >
                    {initialsOf(displayName)}
                </Flex>
                <Box flex={1} minW={0}>
                    <Text fontSize="sm" fontWeight={500} color="text.primary" truncate>
                        {displayName}
                    </Text>
                    <Text fontSize="xs" color="text.secondary" truncate>
                        Admin
                    </Text>
                </Box>
                <IconButton
                    aria-label="Log out"
                    title="Log out"
                    size="sm"
                    variant="ghost"
                    rounded="md"
                    color="text.secondary"
                    focusRingColor="primary.500"
                    transition="background-color 0.15s ease-out, color 0.15s ease-out"
                    _hover={{ bg: "gray.100", color: "text.primary" }}
                    _active={{ bg: "gray.200" }}
                    onClick={handleLogout}
                >
                    <LuLogOut />
                </IconButton>
            </Flex>
        </Box>
    );
}
