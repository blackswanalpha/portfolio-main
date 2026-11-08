"use client";

import { Box, Button, Flex, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { LuLayoutGrid, LuRotateCcw, LuUndo2 } from "react-icons/lu";
import { TOTAL_LEVELS } from "@/lib/sokoban/levels";
import type { GameState, ParsedLevel } from "@/lib/sokoban/types";

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <VStack gap={0} align="center" minW="11">
      <Text
        fontSize="lg"
        fontWeight="semibold"
        lineHeight="1.1"
        fontVariantNumeric="tabular-nums"
        color={highlight ? "primary.600" : "text.primary"}
      >
        {value}
      </Text>
      <Text fontSize="xs" color="text.muted">
        {label}
      </Text>
    </VStack>
  );
}

export default function GameHud({
  level,
  game,
  best,
  onUndo,
  onReset,
  onMenu,
}: {
  level: ParsedLevel;
  game: GameState;
  best?: number;
  onUndo: () => void;
  onReset: () => void;
  onMenu: () => void;
}) {
  return (
    <Flex
      bg="surface"
      borderWidth="1px"
      borderColor="border"
      rounded="xl"
      px={{ base: 4, md: 5 }}
      py={3}
      align="center"
      justify="space-between"
      gap={4}
      wrap="wrap"
      w="full"
    >
      <Box minW={0}>
        <Heading as="h2" textStyle="cardTitle" color="text.primary" lineClamp={1}>
          {level.name}
        </Heading>
        <Text textStyle="meta" color="text.muted">
          Level {level.id} of {TOTAL_LEVELS}
        </Text>
      </Box>

      <HStack gap={{ base: 3, md: 5 }}>
        <Stat label="Moves" value={game.moves} highlight />
        <Stat label="Pushes" value={game.pushes} />
        <Stat label="Par" value={level.par} />
        {best !== undefined && <Stat label="Best" value={best} />}
      </HStack>

      {/* aria-disabled, not disabled: a button that disables itself after use
          (Undo back to the start, Reset) must keep keyboard focus. The reducer
          ignores those no-op actions. */}
      <HStack gap={2}>
        <Button
          size="sm"
          variant="outline"
          gap={1.5}
          onClick={onUndo}
          aria-disabled={game.history.length === 0 || game.solved}
          aria-keyshortcuts="U"
        >
          <LuUndo2 aria-hidden /> Undo
        </Button>
        <Button
          size="sm"
          variant="outline"
          gap={1.5}
          onClick={onReset}
          aria-disabled={game.moves === 0 || game.solved}
          aria-keyshortcuts="R"
        >
          <LuRotateCcw aria-hidden /> Reset
        </Button>
        <Button
          size="sm"
          variant="ghost"
          gap={1.5}
          color="text.secondary"
          onClick={onMenu}
        >
          <LuLayoutGrid aria-hidden /> Levels
        </Button>
      </HStack>
    </Flex>
  );
}
