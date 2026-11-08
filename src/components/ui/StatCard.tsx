"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface StatCardProps {
  /** Optional lucide icon, shown small and muted next to the label. */
  icon?: ReactNode;
  value: string;
  label: string;
  sublabel?: string;
}

/**
 * A number with its label. Solid surface and hairline border; no glass, no
 * gradient hover wash, no lift, no scroll-in fade.
 */
export default function StatCard({ icon, value, label, sublabel }: StatCardProps) {
  return (
    <Box p={6} borderRadius="xl" bg="surface" borderWidth="1px" borderColor="border">
      <Flex align="center" gap={2} color="text.secondary">
        {icon ? (
          <Box color="text.muted" fontSize="16px" lineHeight={0} aria-hidden>
            {icon}
          </Box>
        ) : null}
        <Text textStyle="label">{label}</Text>
      </Flex>
      <Text
        mt={3}
        fontSize={{ base: "3xl", md: "4xl" }}
        fontWeight={600}
        lineHeight="1"
        color="text.primary"
        fontVariantNumeric="tabular-nums"
      >
        {value}
      </Text>
      {sublabel ? (
        <Text textStyle="meta" color="text.muted" mt={2}>
          {sublabel}
        </Text>
      ) : null}
    </Box>
  );
}
