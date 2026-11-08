"use client";

import { Box, Flex, HStack, Heading, SimpleGrid, Text, VStack, chakra } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { LuLock, LuPlay, LuStar } from "react-icons/lu";
import { LEVELS, TOTAL_LEVELS } from "@/lib/sokoban/levels";
import type { Progress } from "@/lib/sokoban/types";
import { useMountGuard } from "@/components/arcade/shared/hooks";

/** Stars are based on moves-vs-par: 3 = optimal, 2 = within 1.5x, else 1. */
export function starCount(best: number | undefined, par: number): number {
  if (best === undefined) return 0;
  if (best <= par) return 3;
  if (best <= Math.ceil(par * 1.5)) return 2;
  return 1;
}

export function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <HStack gap={0.5} role="img" aria-label={`${n} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <Box key={i} as="span" lineHeight={0} color={i <= n ? "yellow.600" : "gray.300"}>
          <LuStar
            size={size}
            strokeWidth={1.5}
            fill={i <= n ? "currentColor" : "none"}
            aria-hidden
          />
        </Box>
      ))}
    </HStack>
  );
}

export default function LevelSelect({
  progress,
  onSelect,
  focusHeading = false,
}: {
  progress: Progress;
  onSelect: (id: number) => void;
  /** Move focus to the heading on mount (when returning from a level). */
  focusHeading?: boolean;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Coming back from the win dialog: its "Levels" button sat where a level
  // card now is, so a double-click must not start that level.
  const justMounted = useMountGuard();
  // The next level to play (unlocked, not cleared yet) is the only accent.
  const nextUp = LEVELS.find(
    (lvl) => lvl.id <= progress.unlocked && progress.best[lvl.id] === undefined,
  )?.id;

  useEffect(() => {
    if (focusHeading) headingRef.current?.focus({ preventScroll: true });
  }, [focusHeading]);

  return (
    <VStack gap={6} w="full" align="stretch">
      <Box>
        <Heading
          ref={headingRef}
          tabIndex={-1}
          as="h2"
          textStyle="sectionTitle"
          color="text.primary"
          mb={1}
          _focus={{ outline: "none" }}
        >
          Choose a level
        </Heading>
        <Text textStyle="body" color="text.secondary">
          Push every crate onto a target.{" "}
          {progress.unlocked >= TOTAL_LEVELS
            ? "All levels are unlocked. Now chase a 3-star run."
            : "Clear a level to unlock the next."}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} gap={{ base: 3, md: 4 }}>
        {LEVELS.map((lvl) => {
          const locked = lvl.id > progress.unlocked;
          const best = progress.best[lvl.id];
          const stars = starCount(best, lvl.par);
          return (
            <chakra.button
              key={lvl.id}
              type="button"
              disabled={locked}
              onClick={() => {
                if (!justMounted()) onSelect(lvl.id);
              }}
              aria-label={
                locked
                  ? `Level ${lvl.id}, ${lvl.name}, locked`
                  : best !== undefined
                    ? `Play level ${lvl.id}, ${lvl.name}. Best ${best} moves, par ${lvl.par}, ${stars} of 3 stars`
                    : `Play level ${lvl.id}, ${lvl.name}. Par ${lvl.par}`
              }
              display="block"
              w="full"
              textAlign="left"
              bg="surface"
              borderWidth="1px"
              borderColor="border"
              rounded="xl"
              p={4}
              cursor="pointer"
              transition="border-color 0.15s ease, background-color 0.15s ease"
              _hover={locked ? undefined : { borderColor: "primary.500" }}
              _disabled={{ bg: "background", cursor: "not-allowed" }}
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text
                  fontSize="xl"
                  fontWeight="semibold"
                  lineHeight="1"
                  fontVariantNumeric="tabular-nums"
                  color={locked ? "text.muted" : "text.primary"}
                >
                  {lvl.id}
                </Text>
                <Box
                  lineHeight={0}
                  color={locked ? "text.muted" : lvl.id === nextUp ? "primary.600" : "text.muted"}
                  aria-hidden
                >
                  {locked ? (
                    <LuLock size={16} />
                  ) : best !== undefined ? (
                    <Stars n={stars} />
                  ) : (
                    <LuPlay size={16} />
                  )}
                </Box>
              </Flex>
              <Text
                textStyle="label"
                color={locked ? "text.secondary" : "text.primary"}
                lineClamp={1}
              >
                {lvl.name}
              </Text>
              <Text textStyle="meta" fontSize="xs" color="text.muted" mt={0.5}>
                {best !== undefined
                  ? `Best ${best} · par ${lvl.par}`
                  : locked
                    ? "Locked"
                    : `Par ${lvl.par}`}
              </Text>
            </chakra.button>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
}
