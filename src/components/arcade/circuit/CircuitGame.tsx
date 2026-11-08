"use client";

import { Box, VisuallyHidden } from "@chakra-ui/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type MouseEvent } from "react";
import { LuChevronRight, LuLayoutGrid, LuRotateCcw } from "react-icons/lu";
import {
  CIRCUIT_LEVELS,
  CIRCUIT_TOTAL,
  circuitStars,
  computePower,
  createCircuitState,
  linkCount,
  makePuzzle,
  rotateTile,
  type CircuitPuzzle,
  type CircuitState,
} from "@/lib/arcade/circuit";
import { hasModifier, isForeignTarget } from "@/lib/arcade/input";
import { recordKeys, submitRecord, type Records } from "@/lib/arcade/records";
import { playSfx, unlockAudio } from "@/lib/arcade/sound";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { fitCanvas } from "../shared/fx";
import { useElementWidth, useGameLoop, useMountGuard, useRecords } from "../shared/hooks";
import {
  ArcadeHud,
  HudButton,
  LevelGrid,
  SoundToggle,
  Stage,
  StageOverlay,
  StagePrimaryButton,
  StageSecondaryButton,
  StageStars,
  StageText,
} from "../shared/ui";
import {
  createCircuitVisual,
  drawCircuit,
  lampBurst,
  startWinWave,
  type CircuitVisual,
} from "./drawCircuit";

interface WinInfo {
  moves: number;
  stars: number;
  newBest: boolean;
}

// Pars for the level grid, built once on first use (12 small generations).
let parCache: number[] | null = null;
const levelPars = () => (parCache ??= CIRCUIT_LEVELS.map((l) => makePuzzle(l).par));

function unlockedFrom(records: Records): number {
  return Math.min(CIRCUIT_TOTAL, Math.max(1, records[recordKeys.circuitUnlocked] ?? 1));
}

/** The first unlocked level without a result, else the last unlocked one. */
function defaultLevel(records: Records): number {
  const unlocked = unlockedFrom(records);
  for (let id = 1; id <= unlocked; id++) {
    if (records[recordKeys.circuitMoves(id)] === undefined) return id;
  }
  return unlocked;
}

export default function CircuitGame() {
  const records = useRecords();
  const [view, setView] = useState<"play" | "levels">("play");
  // null until the player picks or finishes a level; until then the level
  // follows their saved progress.
  const [chosen, setChosen] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const levelsHeading = useRef<HTMLHeadingElement>(null);

  const levelId = chosen ?? defaultLevel(records);
  const puzzle = useMemo(() => makePuzzle(CIRCUIT_LEVELS[levelId - 1]), [levelId]);

  const handleWin = useCallback((id: number, moves: number) => {
    // Pin the level first so the saved unlock below doesn't swap the board
    // out from under the win animation.
    setChosen(id);
    const { previous, improved } = submitRecord(recordKeys.circuitMoves(id), moves);
    submitRecord(recordKeys.circuitUnlocked, Math.min(CIRCUIT_TOTAL, id + 1));
    return previous !== undefined && improved;
  }, []);

  const play = useCallback((id: number) => {
    setChosen(id);
    setRun((r) => r + 1);
    setView("play");
  }, []);

  useEffect(() => {
    if (view === "levels") levelsHeading.current?.focus({ preventScroll: true });
  }, [view]);

  if (view === "levels") {
    const unlocked = unlockedFrom(records);
    const pars = levelPars();
    const nextUp = defaultLevel(records);
    return (
      <LevelGrid
        headingRef={levelsHeading}
        title="Choose a grid"
        description="Turn the tiles until every lamp is lit. Solve a grid to unlock the next."
        onSelect={play}
        levels={CIRCUIT_LEVELS.map((l, i) => {
          const best = records[recordKeys.circuitMoves(l.id)];
          return {
            id: l.id,
            name: l.name,
            locked: l.id > unlocked,
            stars: best === undefined ? 0 : circuitStars(best, pars[i]),
            meta: best === undefined ? `${l.cols}×${l.rows} · par ${pars[i]}` : `Best ${best} · par ${pars[i]}`,
            next: l.id === nextUp && best === undefined,
          };
        })}
      />
    );
  }

  return (
    <CircuitPlay
      key={`${levelId}-${run}`}
      autoFocus={run > 0}
      puzzle={puzzle}
      best={records[recordKeys.circuitMoves(levelId)]}
      onWin={handleWin}
      onNext={() => play(Math.min(CIRCUIT_TOTAL, levelId + 1))}
      onReplay={() => play(levelId)}
      onLevels={() => setView("levels")}
    />
  );
}

function CircuitPlay({
  autoFocus,
  puzzle,
  best,
  onWin,
  onNext,
  onReplay,
  onLevels,
}: {
  /** Started by a button (Next, Replay, a level card): focus the board. */
  autoFocus: boolean;
  puzzle: CircuitPuzzle;
  best?: number;
  onWin: (id: number, moves: number) => boolean;
  onNext: () => void;
  onReplay: () => void;
  onLevels: () => void;
}) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = useElementWidth(stageRef);
  const helpId = useId();
  const justMounted = useMountGuard();

  const [state, setState] = useState<CircuitState>(() => createCircuitState(puzzle));
  // Handlers read and write the latest state here, so two inputs in one frame
  // never act on a stale render.
  const stateRef = useRef(state);
  const visRef = useRef<CircuitVisual | null>(null);
  const [win, setWin] = useState<WinInfo | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [cursor, setCursor] = useState(puzzle.source);

  const { cols, rows } = puzzle;
  const power = useMemo(() => computePower(puzzle, state.rot), [puzzle, state.rot]);
  const lamps = useMemo(
    () => puzzle.solution.flatMap((m, i) => (i !== puzzle.source && linkCount(m) === 1 ? [i] : [])),
    [puzzle],
  );
  const lampCount = lamps.length;
  const lit = lamps.filter((i) => power.powered[i]).length;

  const vis = useCallback(() => {
    if (!visRef.current) visRef.current = createCircuitVisual(puzzle, stateRef.current);
    return visRef.current;
  }, [puzzle]);

  const rotate = useCallback(
    (index: number, dir: 1 | -1) => {
      const prev = stateRef.current;
      const next = rotateTile(prev, puzzle, index, dir);
      if (next === prev) return;
      stateRef.current = next;
      setState(next);
      const v = vis();
      v.target[index] += dir * (Math.PI / 2);
      playSfx("rotate");

      const before = computePower(puzzle, prev.rot);
      const after = computePower(puzzle, next.rot);
      let litNow = 0;
      let newly = 0;
      for (const i of v.lamps) {
        if (!after.powered[i]) continue;
        litNow++;
        if (!before.powered[i]) {
          newly++;
          if (!reduced) lampBurst(v, puzzle, i, 188 + 132 * (after.maxDist ? after.dist[i] / after.maxDist : 0));
        }
      }
      if (newly > 0 && !next.solved) playSfx("connect", litNow);

      if (next.solved) {
        const newBest = onWin(puzzle.id, next.moves);
        startWinWave(v, puzzle, after);
        playSfx("win");
        setWin({ moves: next.moves, stars: circuitStars(next.moves, puzzle.par), newBest });
      }
    },
    [puzzle, onWin, reduced, vis],
  );

  const reset = useCallback(() => {
    const prev = stateRef.current;
    if (prev.solved || prev.moves === 0) return;
    const next = createCircuitState(puzzle);
    stateRef.current = next;
    setState(next);
    const v = vis();
    for (let i = 0; i < next.rot.length; i++) {
      // Keep the visual angle continuous: snap the target to the equivalent
      // turn nearest the current angle.
      const base = next.rot[i] * (Math.PI / 2);
      const turns = Math.round((v.angle[i] - base) / (Math.PI * 2));
      v.target[i] = base + turns * Math.PI * 2;
    }
  }, [puzzle, vis]);

  useEffect(() => {
    if (!autoFocus) return;
    boardRef.current?.focus({ preventScroll: true });
    stageRef.current?.scrollIntoView({ block: "nearest" });
  }, [autoFocus]);

  // The result card waits for the win wave to play out.
  useEffect(() => {
    if (!win) return;
    const t = window.setTimeout(() => setShowResult(true), reduced ? 150 : 1150);
    return () => window.clearTimeout(t);
  }, [win, reduced]);

  // Keyboard: only while playing, and only for keys aimed at this game.
  useEffect(() => {
    if (win) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || hasModifier(e)) return;
      // Only with focus inside this game (board or its buttons): with focus
      // on the page, arrows and Space keep scrolling it.
      const root = rootRef.current;
      if (!root || !(e.target instanceof Node) || !root.contains(e.target)) return;
      if (isForeignTarget(e.target, root)) return;
      const onButton = e.target instanceof Element && e.target.closest("button, a") !== null;
      const v = vis();
      const move = (dx: number, dy: number) => {
        const x = Math.min(cols - 1, Math.max(0, (v.cursor % cols) + dx));
        const y = Math.min(rows - 1, Math.max(0, Math.floor(v.cursor / cols) + dy));
        v.cursor = y * cols + x;
        v.showCursor = true;
        setCursor(v.cursor);
      };
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          move(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          move(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          move(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          move(1, 0);
          break;
        case " ":
        case "Enter":
          if (onButton) return; // the focused button handles its own activation
          if (e.repeat) break;
          v.showCursor = true;
          rotate(v.cursor, e.shiftKey ? -1 : 1);
          break;
        case "e":
        case "E":
          v.showCursor = true;
          rotate(v.cursor, 1);
          break;
        case "q":
        case "Q":
          v.showCursor = true;
          rotate(v.cursor, -1);
          break;
        case "r":
        case "R":
          reset();
          break;
        default:
          return;
      }
      e.preventDefault();
      unlockAudio();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [win, cols, rows, rotate, reset, vis]);

  const tileAt = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return -1;
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * rows);
    if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
    return y * cols + x;
  };

  const onBoardClick = (e: MouseEvent<HTMLDivElement>, dir: 1 | -1) => {
    if (win || justMounted()) return;
    unlockAudio();
    const i = tileAt(e);
    if (i < 0) return;
    const v = vis();
    v.showCursor = false;
    v.cursor = i;
    rotate(i, dir);
  };

  useGameLoop(
    (dt) => {
      const canvas = canvasRef.current;
      if (!canvas || width === 0) return;
      fitCanvas(canvas, width, (width * rows) / cols);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawCircuit(ctx, canvas, puzzle, stateRef.current, vis(), dt, reduced);
    },
    width > 0,
    stageRef,
  );

  const hasNext = puzzle.id < CIRCUIT_TOTAL;
  const maxW = `${Math.min(cols * 120, Math.round((600 * cols) / rows))}px`;

  return (
    <Box ref={rootRef} w="full" display="flex" flexDirection="column" gap={5}>
      <ArcadeHud
        title={puzzle.name}
        subtitle={`Level ${puzzle.id} of ${CIRCUIT_TOTAL} · ${cols}×${rows}`}
        stats={[
          { label: "Moves", value: state.moves, highlight: true },
          { label: "Par", value: puzzle.par },
          { label: "Lamps", value: `${lit}/${lampCount}` },
          ...(best !== undefined ? [{ label: "Best", value: best }] : []),
        ]}
        actions={
          <>
            <HudButton onClick={reset} aria-disabled={state.moves === 0 || state.solved} aria-keyshortcuts="R">
              <LuRotateCcw aria-hidden /> Reset
            </HudButton>
            <HudButton variant="ghost" color="text.secondary" onClick={onLevels}>
              <LuLayoutGrid aria-hidden /> Levels
            </HudButton>
            <SoundToggle />
          </>
        }
      />

      <Stage
        ref={stageRef}
        aspect={cols / rows}
        maxW={maxW}
        overlay={
          win && showResult ? (
            <StageOverlay
              title={hasNext ? "Grid powered" : "Every grid powered"}
              autoFocus
              actions={
                <>
                  {hasNext ? (
                    <StagePrimaryButton onClick={onNext}>
                      Next grid <LuChevronRight aria-hidden />
                    </StagePrimaryButton>
                  ) : null}
                  <StageSecondaryButton onClick={onReplay}>
                    <LuRotateCcw aria-hidden /> Replay
                  </StageSecondaryButton>
                  <StageSecondaryButton onClick={onLevels}>
                    <LuLayoutGrid aria-hidden /> Levels
                  </StageSecondaryButton>
                </>
              }
            >
              <StageStars n={win.stars} />
              <StageText>
                {win.moves} moves · par {puzzle.par}
                {win.newBest ? " · New best" : ""}
              </StageText>
            </StageOverlay>
          ) : null
        }
      >
        <Box
          ref={boardRef}
          position="absolute"
          inset={0}
          tabIndex={0}
          role="application"
          aria-label={`Circuit board, level ${puzzle.id}: ${puzzle.name}`}
          aria-describedby={helpId}
          cursor={win ? "default" : "pointer"}
          rounded="sm"
          outline="none"
          _focusVisible={{ outline: "2px solid", outlineColor: "primary.300", outlineOffset: "6px" }}
          style={{ touchAction: "manipulation" }}
          onClick={(e) => onBoardClick(e, e.shiftKey ? -1 : 1)}
          onContextMenu={(e) => {
            e.preventDefault();
            onBoardClick(e, -1);
          }}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            vis().hover = tileAt(e);
          }}
          onPointerLeave={() => {
            vis().hover = -1;
          }}
        >
          <canvas ref={canvasRef} aria-hidden style={{ width: "100%", height: "100%", display: "block" }} />
        </Box>
      </Stage>

      <VisuallyHidden id={helpId}>
        Click a tile to turn it clockwise, right-click or Shift-click to turn it back. With the
        keyboard, arrow keys move between tiles, Space turns clockwise, Shift-Space or Q turns
        counter-clockwise, and R resets.
      </VisuallyHidden>
      <VisuallyHidden aria-live="polite">
        {state.solved
          ? `Grid powered in ${state.moves} moves.`
          : `${lit} of ${lampCount} lamps lit. Tile row ${Math.floor(cursor / cols) + 1}, column ${(cursor % cols) + 1}${power.powered[cursor] ? ", powered" : ""}.`}
      </VisuallyHidden>
    </Box>
  );
}
