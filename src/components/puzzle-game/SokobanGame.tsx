"use client";

import { Box, VStack, VisuallyHidden } from "@chakra-ui/react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { parseLevel } from "@/lib/sokoban/engine";
import { LEVELS, TOTAL_LEVELS } from "@/lib/sokoban/levels";
import {
  getProgressSnapshot,
  getServerProgressSnapshot,
  recordWin,
  subscribeProgress,
  updateProgress,
} from "@/lib/sokoban/storage";
import type { Direction, ParsedLevel, Vec } from "@/lib/sokoban/types";
import { hasModifier, isForeignTarget } from "@/lib/arcade/input";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import PixiBoard from "./PixiBoard";
import GameHud from "./GameHud";
import LevelSelect from "./LevelSelect";
import TouchPad from "./TouchPad";
import WinModal, { type WinSummary } from "./WinModal";
import { useSokoban } from "./useSokoban";

const KEY_ACTIONS: Record<string, Direction | "undo" | "reset"> = {
  arrowup: "up",
  w: "up",
  arrowdown: "down",
  s: "down",
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right",
  u: "undo",
  r: "reset",
};

function PlayView({
  level,
  best,
  reducedMotion,
  paused,
  onWin,
  onMenu,
}: {
  level: ParsedLevel;
  best?: number;
  reducedMotion: boolean;
  paused: boolean;
  onWin: (level: ParsedLevel, moves: number) => void;
  onMenu: () => void;
}) {
  const { game, move, undo, reset } = useSokoban(level);
  const wonRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const helpId = useId();

  const goalSet = useMemo(
    () => new Set(level.goals.map((g: Vec) => `${g.x},${g.y}`)),
    [level],
  );
  const boxesOnGoal = game.boxes.filter((b) =>
    goalSet.has(`${b.x},${b.y}`),
  ).length;

  // A run is only ever mounted by a user action (level card, Next, Replay), so
  // focus goes to the board: keyboard and screen-reader users land in the game.
  useEffect(() => {
    boardRef.current?.focus({ preventScroll: true });
    // The run replaces the taller level grid, so bring the whole board on screen.
    boardRef.current?.scrollIntoView({ block: "nearest" });
  }, []);

  // Fire the win callback exactly once when the level becomes solved.
  useEffect(() => {
    if (game.solved && !wonRef.current) {
      wonRef.current = true;
      onWin(level, game.moves);
    }
  }, [game.solved, game.moves, level, onWin]);

  // Keyboard controls, only while actively playing (not under the win dialog).
  useEffect(() => {
    if (paused) return;
    // Keys first pressed during this run. Auto-repeat from a key that was
    // already held when the run started (the arrow that solved the previous
    // level) is ignored instead of moving the new level's player.
    const pressed = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || hasModifier(e)) return;
      // Keys aimed at another widget (the game tabs, the chat, a text field)
      // are not moves. Focus on the page body or inside this game still is.
      if (isForeignTarget(e.target, rootRef.current)) return;
      const k = e.key.toLowerCase();
      const action = KEY_ACTIONS[k];
      if (!action) return;
      e.preventDefault();
      if (e.repeat && !pressed.has(k)) return;
      pressed.add(k);
      if (action === "undo") undo();
      else if (action === "reset") reset();
      else move(action);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      pressed.delete(e.key.toLowerCase());
    };
    const onBlur = () => pressed.clear();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [paused, move, undo, reset]);

  return (
    <VStack ref={rootRef} gap={5} w="full">
      <GameHud
        level={level}
        game={game}
        best={best}
        onUndo={undo}
        onReset={reset}
        onMenu={onMenu}
      />
      <PixiBoard
        ref={boardRef}
        level={level}
        game={game}
        reducedMotion={reducedMotion}
        describedBy={helpId}
      />
      <VisuallyHidden id={helpId}>
        Arrow keys or W, A, S and D move. U undoes the last move, R resets the level.
      </VisuallyHidden>
      {/* On-screen pad only where there's no keyboard */}
      <Box display={{ base: "block", md: "none" }}>
        <TouchPad onMove={move} />
      </Box>
      {/* Screen-reader game state announcements */}
      <VisuallyHidden aria-live="polite">
        {game.solved
          ? `Level solved in ${game.moves} moves.`
          : `Move ${game.moves}. ${boxesOnGoal} of ${level.goals.length} boxes on goals.`}
      </VisuallyHidden>
    </VStack>
  );
}

export default function SokobanGame() {
  const progress = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [view, setView] = useState<"menu" | "play">("menu");
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [playToken, setPlayToken] = useState(0); // bump to remount PlayView (replay)
  // The finished run shown by the win dialog. A snapshot, so the dialog never
  // reads the next level's data while it animates out.
  const [win, setWin] = useState<WinSummary | null>(null);
  // The win the dialog's buttons act on. Cleared by the first button press, so
  // a second press (double-click, or Enter while the dialog animates out) is a
  // no-op instead of advancing again or replaying twice.
  const winRef = useRef<WinSummary | null>(null);
  const [returnedToMenu, setReturnedToMenu] = useState(false);

  const parsed = useMemo(
    () => parseLevel(LEVELS[currentLevelId - 1]),
    [currentLevelId],
  );

  const handleWin = useCallback((level: ParsedLevel, moves: number) => {
    // `previous` is the merged stored progress before this run, so the dialog
    // compares against the real previous best (also across tabs).
    const { previous } = updateProgress((p) => recordWin(p, level.id, moves, TOTAL_LEVELS));
    const summary = { level, moves, previousBest: previous.best[level.id] };
    winRef.current = summary;
    setWin(summary);
  }, []);

  const startLevel = useCallback((id: number) => {
    if (id < 1 || id > getProgressSnapshot().unlocked) return;
    winRef.current = null;
    setWin(null);
    setCurrentLevelId(id);
    setPlayToken((t) => t + 1);
    setView("play");
  }, []);

  const handleNext = useCallback(() => {
    const current = winRef.current;
    if (!current) return;
    // Next is the level after the one just won, and only if it is unlocked.
    const nextId = current.level.id + 1;
    if (nextId > TOTAL_LEVELS || nextId > getProgressSnapshot().unlocked) return;
    winRef.current = null;
    setWin(null);
    setCurrentLevelId(nextId);
    setPlayToken((t) => t + 1);
  }, []);

  const handleReplay = useCallback(() => {
    if (!winRef.current) return;
    winRef.current = null;
    setWin(null);
    setPlayToken((t) => t + 1);
  }, []);

  const handleMenu = useCallback(() => {
    winRef.current = null;
    setWin(null);
    setReturnedToMenu(true);
    setView("menu");
  }, []);

  return (
    <Box w="full">
      {view === "menu" ? (
        <LevelSelect
          progress={progress}
          onSelect={startLevel}
          focusHeading={returnedToMenu}
        />
      ) : (
        <PlayView
          key={`${currentLevelId}-${playToken}`}
          level={parsed}
          best={progress.best[currentLevelId]}
          reducedMotion={reducedMotion}
          paused={win !== null}
          onWin={handleWin}
          onMenu={handleMenu}
        />
      )}

      <WinModal
        result={win}
        onNext={handleNext}
        onReplay={handleReplay}
        onMenu={handleMenu}
      />
    </Box>
  );
}
