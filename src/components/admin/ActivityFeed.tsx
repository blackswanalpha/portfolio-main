"use client";

import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { LuFileText, LuFolderOpen, LuImage, LuMail, LuMessageSquareQuote } from "react-icons/lu";
import type { DashboardActivityItem, DashboardActivityType } from "@/lib/api";
import { Panel, PanelNote, SectionTitle } from "./AdminUI";
import { formatDateTime, formatRelative } from "./format";
import { useMinuteClock } from "./hooks";

const ACTIVITY_ICON: Record<DashboardActivityType, IconType> = {
    project: LuFolderOpen,
    blog: LuFileText,
    contact: LuMail,
    testimonial: LuMessageSquareQuote,
    gallery: LuImage,
};

export function ActivityFeed({ items, loading = false }: { items: DashboardActivityItem[]; loading?: boolean }) {
    const now = useMinuteClock();

    return (
        <Panel>
            <SectionTitle title="Recent activity" />

            {loading ? (
                <Flex direction="column" gap={4} aria-hidden>
                    {Array.from({ length: 4 }, (_, i) => (
                        <Flex key={i} gap={3} align="center">
                            <Skeleton w={8} h={8} rounded="md" flexShrink={0} />
                            <Box flex={1}>
                                <Skeleton h={3.5} w="80%" rounded="sm" />
                                <Skeleton h={3} w="30%" rounded="sm" mt={2} />
                            </Box>
                        </Flex>
                    ))}
                </Flex>
            ) : items.length === 0 ? (
                <PanelNote title="No recent activity" description="New messages, testimonials and content changes show up here." />
            ) : (
                <Box as="ul" listStyleType="none" maxH="80" overflowY="auto" className="scroll-area" mr={-2} pr={2}>
                    {items.map((item, i) => {
                        const Icon = ACTIVITY_ICON[item.type] ?? LuFolderOpen;
                        return (
                            <Flex as="li" key={`${item.type}-${item.timestamp}-${i}`} gap={3} align="flex-start" _notFirst={{ mt: 4 }}>
                                <Flex
                                    w={8}
                                    h={8}
                                    rounded="md"
                                    bg="gray.100"
                                    color="text.secondary"
                                    align="center"
                                    justify="center"
                                    flexShrink={0}
                                    aria-hidden
                                >
                                    <Icon size={16} />
                                </Flex>
                                <Box minW={0}>
                                    <Text fontSize="sm" color="text.primary" lineClamp={2}>
                                        {item.title}
                                    </Text>
                                    <Text asChild textStyle="meta" fontSize="xs" color="text.secondary">
                                        <time dateTime={item.timestamp} title={formatDateTime(item.timestamp)}>
                                            {formatRelative(item.timestamp, now)}
                                        </time>
                                    </Text>
                                </Box>
                            </Flex>
                        );
                    })}
                </Box>
            )}
        </Panel>
    );
}
