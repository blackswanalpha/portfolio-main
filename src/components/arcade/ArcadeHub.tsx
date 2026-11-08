"use client";

import { Box, Flex, Kbd, Text, chakra } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import {
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { CIRCUIT_TOTAL } from "@/lib/arcade/circuit";
import { recordKeys, type Records } from "@/lib/arcade/records";
import { TOTAL_LEVELS } from "@/lib/sokoban/levels";
import {
  getProgressSnapshot,
  getServerProgressSnapshot,
  subscribeProgress,
} from "@/lib/sokoban/storage";
import type { Progress } from "@/lib/sokoban/types";
import { CascadeCover, CircuitCover, ShatterCover, SokobanCover } from "./GameCovers";
import { STAGE_BG } from "./shared/fx";
import { useRecords } from "./shared/hooks";

function GameLoading() {
  return (
    <Flex
      h={{ base: "420px", md: "560px" }}
      bg={STAGE_BG}
      rounded="md"
      align="center"
      justify="center"
      aria-busy="true"
    >
      <Text textStyle="meta" color="whiteAlpha.700">
        Loading game…
      </Text>
    </Flex>
  );
}

// Each game is its own chunk, and only the selected one is mounted, so there
// is never more than one game loop, canvas and key listener on the page.
const SokobanGame = dynamic(() => import("@/components/puzzle-game/SokobanGame"), { loading: GameLoading });
const CircuitGame = dynamic(() => import("./circuit/CircuitGame"), { loading: GameLoading });
const CascadeGame = dynamic(() => import("./cascade/CascadeGame"), { loading: GameLoading });
const ShatterGame = dynamic(() => import("./shatter/ShatterGame"), { loading: GameLoading });

interface GameEntry {
  id: "sokoban" | "circuit" | "cascade" | "shatter";
  name: string;
  kind: string;
  Cover: ComponentType;
  Game: ComponentType;
  controls: ReactNode;
  stat: (progress: Progress, records: Records) => string;
}

const GAMES: GameEntry[] = [
  {
    id: "sokoban",
    name: "Sokoban",
    kind: "Puzzle",
    Cover: SokobanCover,
    Game: SokobanGame,
    controls: (
      <>
        Arrow keys or <Kbd>W</Kbd> <Kbd>A</Kbd> <Kbd>S</Kbd> <Kbd>D</Kbd> move, <Kbd>U</Kbd> undoes,{" "}
        <Kbd>R</Kbd> resets. On a phone, use the on-screen pad.
      </>
    ),
    stat: (p) => `${Object.keys(p.best).length}/${TOTAL_LEVELS} cleared`,
  },
  {
    id: "circuit",
    name: "Circuit",
    kind: "Puzzle",
    Cover: CircuitCover,
    Game: CircuitGame,
    controls: (
      <>
        Click or tap a tile to turn it. Right-click or <Kbd>Shift</Kbd>-click turns it back. Keyboard:
        arrows move, <Kbd>Space</Kbd> turns, <Kbd>Q</Kbd> turns back, <Kbd>R</Kbd> resets.
      </>
    ),
    stat: (_, r) => {
      let solved = 0;
      for (let id = 1; id <= CIRCUIT_TOTAL; id++) if (r[recordKeys.circuitMoves(id)] !== undefined) solved++;
      return `${solved}/${CIRCUIT_TOTAL} powered`;
    },
  },
  {
    id: "cascade",
    name: "Cascade",
    kind: "Match three",
    Cover: CascadeCover,
    Game: CascadeGame,
    controls: (
      <>
        Drag a gem onto a neighbour, or click two neighbours. Keyboard: arrows move, <Kbd>Space</Kbd>{" "}
        picks a gem up, an arrow swaps it.
      </>
    ),
    stat: (_, r) => {
      const best = r[recordKeys.cascadeScore];
      return best === undefined ? "20 moves" : `Best ${best.toLocaleString("en-US")}`;
    },
  },
  {
    id: "shatter",
    name: "Shatter",
    kind: "Arcade",
    Cover: ShatterCover,
    Game: ShatterGame,
    controls: (
      <>
        Steer with the mouse, a finger or <Kbd>←</Kbd> <Kbd>→</Kbd>. <Kbd>Space</Kbd> or a tap launches
        the ball, <Kbd>P</Kbd> pauses.
      </>
    ),
    stat: (_, r) => {
      const best = r[recordKeys.shatterScore];
      return best === undefined ? "3 lives" : `Best ${best.toLocaleString("en-US")}`;
    },
  },
];

export default function ArcadeHub() {
  const [selected, setSelected] = useState<GameEntry["id"]>("sokoban");
  const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot);
  const records = useRecords();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();
  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = `${baseId}-panel`;
  const active = GAMES.find((g) => g.id === selected) ?? GAMES[0];
  const Game = active.Game;

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const n = GAMES.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % n;
    else if (e.key === "ArrowLeft") next = (index - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setSelected(GAMES[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <Box w="full">
      <Box
        role="tablist"
        aria-label="Games"
        display="grid"
        gridTemplateColumns={{ base: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }}
        gap={{ base: 3, md: 4 }}
      >
        {GAMES.map((g, i) => {
          const isActive = g.id === selected;
          return (
            <chakra.button
              key={g.id}
              ref={(el: HTMLButtonElement | null) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={tabId(g.id)}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setSelected(g.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              display="block"
              w="full"
              textAlign="left"
              bg="surface"
              borderWidth="1px"
              borderColor={isActive ? "primary.500" : "border"}
              boxShadow={isActive ? "0 0 0 1px var(--chakra-colors-primary-500)" : "none"}
              rounded="md"
              overflow="hidden"
              cursor="pointer"
              transition="border-color 0.15s ease"
              _hover={isActive ? undefined : { borderColor: "border.controlHover" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" }}
            >
              <Box aspectRatio={16 / 9} bg={STAGE_BG} lineHeight={0} aria-hidden>
                <g.Cover />
              </Box>
              <Box px={{ base: 3, md: 4 }} py={3}>
                <Flex justify="space-between" align="baseline" gap={2}>
                  <Text textStyle="label" fontSize="md" color="text.primary">
                    {g.name}
                  </Text>
                  <Text textStyle="meta" fontSize="xs" color="text.muted" display={{ base: "none", sm: "block" }}>
                    {g.kind}
                  </Text>
                </Flex>
                <Text textStyle="meta" fontSize="xs" color={isActive ? "primary.600" : "text.muted"} mt={0.5}>
                  {g.stat(progress, records)}
                </Text>
              </Box>
            </chakra.button>
          );
        })}
      </Box>

      <Box role="tabpanel" id={panelId} aria-labelledby={tabId(active.id)} mt={{ base: 8, md: 10 }}>
        <Game key={active.id} />
        <Text textStyle="meta" color="text.muted" mt={4} textAlign={{ base: "center", md: "left" }}>
          {active.controls}
        </Text>
      </Box>
    </Box>
  );
}
