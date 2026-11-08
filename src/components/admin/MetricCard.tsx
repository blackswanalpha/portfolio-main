"use client";

import { Box, Skeleton, Text } from "@chakra-ui/react";

export type MetricTrend = "up" | "down" | "neutral";

export interface MetricCardProps {
    label: string;
    /** Pre-formatted figure (tabular). */
    value: string;
    /** Change with what it compares to, e.g. "+12%" + " vs previous 30 days". */
    change?: { text: string; tone: MetricTrend };
    /** Short context line shown after the change, or alone. */
    hint?: string;
    loading?: boolean;
}

const TONE_COLOR: Record<MetricTrend, string> = {
    up: "green.700",
    down: "red.700",
    neutral: "text.secondary",
};

/** The one stat card used on every admin screen: label, figure, change. */
export function MetricCard({ label, value, change, hint, loading = false }: MetricCardProps) {
    return (
        <Box bg="surface" border="1px solid" borderColor="border" rounded="xl" p={5} minW={0}>
            <Text textStyle="label" color="text.secondary" lineClamp={1}>
                {label}
            </Text>
            {loading ? (
                <>
                    <Skeleton h={7} w={16} mt={2} rounded="sm" />
                    <Skeleton h={3.5} w="70%" mt={2} rounded="sm" />
                </>
            ) : (
                <>
                    <Text
                        mt={1}
                        fontSize="2xl"
                        fontWeight={600}
                        lineHeight="1.25"
                        color="text.primary"
                        fontVariantNumeric="tabular-nums"
                    >
                        {value}
                    </Text>
                    {change || hint ? (
                        <Text textStyle="meta" color="text.secondary" mt={1} lineClamp={1}>
                            {change ? (
                                <Box as="span" color={TONE_COLOR[change.tone]} fontWeight={500}>
                                    {change.text}
                                </Box>
                            ) : null}
                            {change && hint ? " " : null}
                            {hint}
                        </Text>
                    ) : null}
                </>
            )}
        </Box>
    );
}
