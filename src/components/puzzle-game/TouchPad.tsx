"use client";

import { Box, IconButton } from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
  LuArrowDown,
  LuArrowLeft,
  LuArrowRight,
  LuArrowUp,
} from "react-icons/lu";
import type { Direction } from "@/lib/sokoban/types";

function PadButton({
  label,
  dir,
  onMove,
  children,
}: {
  label: string;
  dir: Direction;
  onMove: (d: Direction) => void;
  children: ReactNode;
}) {
  return (
    <IconButton
      aria-label={label}
      onClick={() => onMove(dir)}
      size="lg"
      rounded="lg"
      bg="surface"
      color="text.secondary"
      borderWidth="1px"
      borderColor="border"
      // Fast taps must not trigger double-tap zoom.
      touchAction="manipulation"
      _hover={{ bg: "background" }}
      _active={{ bg: "background", transform: "scale(0.96)" }}
      transition="transform 0.08s ease, background-color 0.15s ease"
    >
      {children}
    </IconButton>
  );
}

export default function TouchPad({
  onMove,
}: {
  onMove: (d: Direction) => void;
}) {
  return (
    <Box
      role="group"
      aria-label="Direction controls"
      display="grid"
      gridTemplateColumns="repeat(3, auto)"
      gap={2}
      w="fit-content"
      mx="auto"
    >
      <Box />
      <PadButton label="Move up" dir="up" onMove={onMove}>
        <LuArrowUp />
      </PadButton>
      <Box />

      <PadButton label="Move left" dir="left" onMove={onMove}>
        <LuArrowLeft />
      </PadButton>
      <Box />
      <PadButton label="Move right" dir="right" onMove={onMove}>
        <LuArrowRight />
      </PadButton>

      <Box />
      <PadButton label="Move down" dir="down" onMove={onMove}>
        <LuArrowDown />
      </PadButton>
      <Box />
    </Box>
  );
}
