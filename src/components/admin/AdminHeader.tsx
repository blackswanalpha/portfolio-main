"use client";

import { Flex, IconButton, Text } from "@chakra-ui/react";
import { LuMenu } from "react-icons/lu";
import { secondaryButton } from "./AdminUI";

/**
 * Small-screen top bar: opens the navigation drawer. On large screens the
 * sidebar is always visible and each page carries its own title, so this
 * renders nothing there.
 */
export function AdminHeader({ onMenuClick, menuOpen = false }: { onMenuClick?: () => void; menuOpen?: boolean }) {
    return (
        <Flex as="header" display={{ base: "flex", lg: "none" }} align="center" gap={3} mb={6}>
            <IconButton
                aria-label="Open navigation"
                aria-controls="admin-sidebar"
                aria-expanded={menuOpen}
                onClick={onMenuClick}
                size="sm"
                {...secondaryButton}
            >
                <LuMenu />
            </IconButton>
            <Text fontWeight={600} color="text.primary">
                Victor Mbugua
            </Text>
        </Flex>
    );
}
