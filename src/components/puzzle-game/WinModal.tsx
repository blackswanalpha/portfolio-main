"use client";

import { Box, Button, HStack, Heading, Portal, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, MotionConfig, motion, useIsPresent } from "framer-motion";
import { useEffect, useId, useRef } from "react";
import { LuChevronRight, LuLayoutGrid, LuRotateCcw } from "react-icons/lu";
import { TOTAL_LEVELS } from "@/lib/sokoban/levels";
import type { ParsedLevel } from "@/lib/sokoban/types";
import { useScrollLock } from "@/lib/scrollLock";
import { Stars, starCount } from "./LevelSelect";

/** Snapshot of a finished run, taken when the level was solved. */
export interface WinSummary {
  level: ParsedLevel;
  moves: number;
  /** Best move count BEFORE this win was recorded (undefined on a first clear). */
  previousBest?: number;
}

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/**
 * Win dialog. It renders only from `result`, never from live game state, so
 * while it animates out after Next/Replay it keeps showing the run it
 * announced instead of the next level's name or par.
 */
export default function WinModal({
  result,
  onNext,
  onReplay,
  onMenu,
}: {
  result: WinSummary | null;
  onNext: () => void;
  onReplay: () => void;
  onMenu: () => void;
}) {
  useScrollLock(result !== null);

  // Portaled to <body>: an ancestor with a transform (the page entrance, or a
  // leftover GSAP translate) becomes the containing block for position:fixed,
  // which clipped the backdrop to the game area instead of the viewport.
  return (
    <Portal>
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {result && (
            <WinDialog
              key="win"
              result={result}
              onNext={onNext}
              onReplay={onReplay}
              onMenu={onMenu}
            />
          )}
        </AnimatePresence>
      </MotionConfig>
    </Portal>
  );
}

function WinDialog({
  result,
  onNext,
  onReplay,
  onMenu,
}: {
  result: WinSummary;
  onNext: () => void;
  onReplay: () => void;
  onMenu: () => void;
}) {
  const { level, moves, previousBest } = result;
  const stars = starCount(moves, level.par);
  // Strict improvement only: matching an old best is not a new best.
  const isNewBest = previousBest !== undefined && moves < previousBest;
  const hasNext = level.id < TOTAL_LEVELS;
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();
  // False while animating out: keys are no longer handled then, so an Escape
  // pressed during the exit cannot also send the player to the level menu.
  const isPresent = useIsPresent();

  // Focus moves into the dialog. When it closes, the view that replaces the
  // board (the next run's board, or the level-select heading) takes focus.
  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isPresent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onMenu();
        return;
      }
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const items = root.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!root.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPresent, onMenu]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(15, 23, 42, 0.5)",
        // While animating out the buttons must not take a second click
        // (a double-click on Next would otherwise advance twice).
        pointerEvents: isPresent ? "auto" : "none",
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 380 }}
      >
        <Box
          bg="surface"
          borderWidth="1px"
          borderColor="border"
          rounded="xl"
          boxShadow="0 16px 40px -12px rgba(15, 23, 42, 0.28)"
          p={{ base: 6, md: 8 }}
          textAlign="center"
        >
          <VStack gap={4}>
            <Box>
              <Heading as="h2" id={titleId} textStyle="sectionTitle" color="text.primary">
                {hasNext ? "Level complete" : "All levels cleared"}
              </Heading>
              <Text id={descId} textStyle="body" color="text.secondary" mt={1}>
                {hasNext ? level.name : "You solved every puzzle"}
              </Text>
            </Box>

            <Stars n={stars} size={28} />

            <HStack gap={6} justify="center" textStyle="meta" color="text.secondary">
              <Text>
                <Box as="span" fontWeight="semibold" color="text.primary">
                  {moves}
                </Box>{" "}
                moves
              </Text>
              <Text>
                Par{" "}
                <Box as="span" fontWeight="semibold" color="text.primary">
                  {level.par}
                </Box>
              </Text>
              {isNewBest && (
                <Text fontWeight="medium" color="green.700">
                  New best
                </Text>
              )}
            </HStack>

            <VStack gap={2} w="full" pt={2}>
              {hasNext && (
                <Button
                  ref={primaryRef}
                  w="full"
                  gap={1.5}
                  bg="primary.500"
                  color="white"
                  _hover={{ bg: "primary.600" }}
                  onClick={onNext}
                >
                  Next level <LuChevronRight aria-hidden />
                </Button>
              )}
              <HStack gap={2} w="full">
                <Button
                  ref={hasNext ? undefined : primaryRef}
                  flex={1}
                  variant="outline"
                  gap={1.5}
                  onClick={onReplay}
                >
                  <LuRotateCcw aria-hidden /> Replay
                </Button>
                <Button
                  flex={1}
                  variant="ghost"
                  gap={1.5}
                  color="text.secondary"
                  onClick={onMenu}
                >
                  <LuLayoutGrid aria-hidden /> Levels
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </motion.div>
    </motion.div>
  );
}
