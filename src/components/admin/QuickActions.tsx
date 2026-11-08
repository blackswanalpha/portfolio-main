"use client";

import { Box, Grid, Text } from "@chakra-ui/react";
import Link from "next/link";
import type { IconType } from "react-icons";
import { LuFolderPlus, LuInbox, LuPenLine, LuWrench } from "react-icons/lu";
import { Panel, SectionTitle } from "./AdminUI";

const ACTIONS: { href: string; label: string; icon: IconType }[] = [
    { href: "/admin/projects/create", label: "Add project", icon: LuFolderPlus },
    { href: "/admin/blog/create", label: "Write blog post", icon: LuPenLine },
    { href: "/admin/services/create", label: "New service", icon: LuWrench },
    { href: "/admin/inquiries", label: "Inquiries", icon: LuInbox },
];

export function QuickActions() {
    return (
        <Panel>
            <SectionTitle title="Quick actions" />
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                {ACTIONS.map(({ href, label, icon: Icon }) => (
                    <Box
                        key={href}
                        asChild
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                        p={4}
                        rounded="lg"
                        border="1px solid"
                        borderColor="border"
                        bg="background"
                        color="text.secondary"
                        transition="background-color 0.15s ease-out, color 0.15s ease-out"
                        _hover={{ bg: "gray.100", color: "text.primary" }}
                        _active={{ bg: "gray.200" }}
                    >
                        <Link href={href}>
                            <Icon size={18} aria-hidden />
                            <Text as="span" fontSize="sm" fontWeight={500} textAlign="center">
                                {label}
                            </Text>
                        </Link>
                    </Box>
                ))}
            </Grid>
        </Panel>
    );
}
