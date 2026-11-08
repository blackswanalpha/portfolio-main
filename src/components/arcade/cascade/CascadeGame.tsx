"use client";

import { Box, VisuallyHidden } from "@chakra-ui/react";
import { useCallback, useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { LuRefreshCw } from "react-icons/lu";
import {
  COLS,
  ROWS,
  START_MOVES,
  STAR_SCORES,
  applySwap,
  areAdjacent,
  cascadeStars,
  createCascadeState,
  findHint,
  type CascadeState,
} from "@/lib/arcade/cascade";
import { hasModifier, isForeignTarget } from "@/lib/arcade/input";
import { recordKeys, submitRecord } from "@/lib/arcade/records";
import { mulberry32, randomSeed, type Rng } from "@/lib/arcade/rng";
import { playSfx, unlockAudio } from "@/lib/arcade/sound";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { fitCanvas } from "../shared/fx";
import { useElementWidth, useGameLoop, useMountGuard, useRecords } from "../shared/hooks";
import {
  ArcadeHud,
  HudButton,
  SoundToggle,
  Stage,
  StageOverlay,
  StagePrimaryButton,
  StageStars,
  StageText,
} from "../shared/ui";
import { GEM_COLORS } from "./gems";
import {
  createCascadeVisual,
  drawCascade,
  enqueueSteps,
  isBusy,
  reconcile,
  updateCascade,
  type CascadeVisual,
  type StepHooks,
} from "./drawCascade";

const HINT_AFTER = 6; // seconds idle before a hint shows

export default function CascadeGame() {
  // A new key remounts the run: fresh board, visuals and timers.
  const [run, setRun] = useState(0);
  return <CascadeRun key={run} autoFocus={run > 0} onRestart={() => setRun((r) => r + 1)} />;
}

interface Result {
  score: number;
  stars: number;
  /** Best score before this game (undefined on a first game). */
  previous?: number;
  newBest: boolean;
}

function describe(state: CascadeState, i: number): string {
  const gem = state.board[i];
  if (!gem) return "";
  const name = gem.special === "nova" ? "Nova" : `${GEM_COLORS[gem.color].name}`;
  const extra =
    gem.special === "row" ? ", clears its row" : gem.special === "col" ? ", clears its column" : gem.special === "burst" ? ", burst" : "";
  return `Row ${Math.floor(i / COLS) + 1}, column ${(i % COLS) + 1}: ${name}${extra}.`;
}

function CascadeRun({ autoFocus, onRestart }: { autoFocus: boolean; onRestart: () => void }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const records = useRecords();
  const best = records[recordKeys.cascadeScore];
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const justMounted = useMountGuard();
  const width = useElementWidth(stageRef);
  const helpId = useId();

  // "Play again" replaced the focused button: hand focus to the new board.
  useEffect(() => {
    if (!autoFocus) return;
    boardRef.current?.focus({ preventScroll: true });
    stageRef.current?.scrollIntoView({ block: "nearest" });
  }, [autoFocus]);

  // The board is random, so it is created once per run in this initializer.
  // Nothing about it reaches the DOM before the canvas draws, so the server
  // and client never disagree on markup.
  // The same seeded stream keeps feeding the refills after the opening board.
  const [initial] = useState<{ state: CascadeState; rng: Rng }>(() => {
    const rng = mulberry32(randomSeed());
    return { state: createCascadeState(rng), rng };
  });
  const stateRef = useRef<CascadeState>(initial.state);
  const visRef = useRef<CascadeVisual | null>(null);
  const idleRef = useRef(0);
  const wasBusyRef = useRef(false);
  const overRef = useRef(false);
  const dragRef = useRef<{ id: number; start: number; x0: number; y0: number; done: boolean; wasSelected: boolean } | null>(null);

  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(START_MOVES);
  const [result, setResult] = useState<Result | null>(null);
  const [announce, setAnnounce] = useState("");

  const vis = useCallback(() => {
    if (!visRef.current) visRef.current = createCascadeVisual(stateRef.current.board);
    return visRef.current;
  }, []);

  const hooks: StepHooks = {
    onSwap: (valid) => playSfx(valid ? "swap" : "invalid"),
    onClear: (points, combo, blasts) => {
      setScore((s) => s + points);
      playSfx("pop", combo - 1);
      if (blasts > 0) playSfx("special");
    },
    onShuffle: () => playSfx("shuffle"),
  };

  const trySwap = useCallback(
    (a: number, b: number) => {
      const v = vis();
      if (overRef.current || isBusy(v) || !areAdjacent(a, b)) return;
      const res = applySwap(stateRef.current, a, b, initial.rng);
      if (!res) return;
      v.selected = -1;
      v.hint = null;
      idleRef.current = 0;
      enqueueSteps(v, res.steps);
      if (res.state !== stateRef.current) {
        stateRef.current = res.state;
        setMovesLeft(res.state.movesLeft);
      }
    },
    [initial.rng, vis],
  );

  const select = useCallback(
    (i: number) => {
      const v = vis();
      if (overRef.current || isBusy(v)) return;
      idleRef.current = 0;
      v.hint = null;
      if (v.selected >= 0 && areAdjacent(v.selected, i)) {
        trySwap(v.selected, i);
        return;
      }
      v.selected = v.selected === i ? -1 : i;
      if (v.selected >= 0) playSfx("select");
    },
    [trySwap, vis],
  );

  // Keyboard: arrows move the cursor, Space picks a gem up, an arrow then swaps.
  useEffect(() => {
    if (result) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || hasModifier(e)) return;
      // Only with focus inside this game (board or its buttons): with focus
      // on the page, arrows and Space keep scrolling it.
      const root = rootRef.current;
      if (!root || !(e.target instanceof Node) || !root.contains(e.target)) return;
      if (isForeignTarget(e.target, root)) return;
      const onButton = e.target instanceof Element && e.target.closest("button, a") !== null;
      const v = vis();
      const dirs: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
      };
      const d = dirs[e.key];
      if (d) {
        const from = v.selected >= 0 ? v.selected : v.cursor;
        const x = (from % COLS) + d[0];
        const y = Math.floor(from / COLS) + d[1];
        e.preventDefault();
        unlockAudio();
        if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
        const to = y * COLS + x;
        v.showCursor = true;
        if (v.selected >= 0) {
          trySwap(v.selected, to);
        } else {
          v.cursor = to;
          setAnnounce(describe(stateRef.current, to));
        }
        return;
      }
      if ((e.key === " " || e.key === "Enter") && !onButton) {
        e.preventDefault();
        if (e.repeat) return;
        unlockAudio();
        v.showCursor = true;
        select(v.cursor);
        setAnnounce(v.selected >= 0 ? `Picked up. ${describe(stateRef.current, v.cursor)} Press an arrow to swap.` : "Put down.");
        return;
      }
      if (e.key === "Escape" && v.selected >= 0) {
        e.preventDefault();
        v.selected = -1;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, select, trySwap, vis]);

  const cellAt = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return -1;
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * COLS);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return -1;
    return y * COLS + x;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || e.button > 0 || result || justMounted()) return;
    unlockAudio();
    const i = cellAt(e);
    if (i < 0) return;
    const v = vis();
    v.showCursor = false;
    v.cursor = i;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const wasSelected = v.selected === i;
    dragRef.current = { id: e.pointerId, start: i, x0: e.clientX, y0: e.clientY, done: false, wasSelected };
    if (wasSelected) return; // a tap on the picked gem puts it down on release
    const before = v.selected;
    select(i);
    if (before >= 0 && areAdjacent(before, i)) dragRef.current.done = true;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const v = vis();
    if (e.pointerType === "mouse") v.hover = cellAt(e);
    const drag = dragRef.current;
    if (!drag || drag.done || e.pointerId !== drag.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const threshold = (rect.width / COLS) * 0.32;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
    drag.done = true;
    const x = (drag.start % COLS) + (Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0);
    const y = Math.floor(drag.start / COLS) + (Math.abs(dx) > Math.abs(dy) ? 0 : Math.sign(dy));
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
    trySwap(drag.start, y * COLS + x);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.id) return;
    dragRef.current = null;
    if (!drag.done && drag.wasSelected) vis().selected = -1;
  };

  useGameLoop(
    (dt) => {
      const canvas = canvasRef.current;
      if (!canvas || width === 0) return;
      const v = vis();
      updateCascade(v, dt, reduced, hooks);
      const busy = isBusy(v);
      if (wasBusyRef.current && !busy) {
        // Playback finished: line the sprites up with the real board.
        reconcile(v, stateRef.current.board);
        setScore(stateRef.current.score);
        setAnnounce(`Score ${stateRef.current.score}. ${stateRef.current.movesLeft} moves left.`);
      }
      wasBusyRef.current = busy;

      if (!busy && !overRef.current) {
        if (stateRef.current.movesLeft <= 0) {
          overRef.current = true;
          const final = stateRef.current.score;
          const { previous, improved } = submitRecord(recordKeys.cascadeScore, final);
          setScore(final);
          setResult({ score: final, stars: cascadeStars(final), previous, newBest: improved && previous !== undefined });
          playSfx(cascadeStars(final) > 0 ? "win" : "gameOver");
        } else {
          idleRef.current += dt;
          if (idleRef.current > HINT_AFTER && !v.hint) v.hint = findHint(stateRef.current.board);
        }
      }

      fitCanvas(canvas, width, width);
      const ctx = canvas.getContext("2d");
      if (ctx) drawCascade(ctx, canvas, v, reduced);
    },
    width > 0,
    stageRef,
  );

  return (
    <Box ref={rootRef} w="full" display="flex" flexDirection="column" gap={5}>
      <ArcadeHud
        title="Cascade"
        subtitle={`Stars at ${STAR_SCORES.map((s) => s.toLocaleString("en-US")).join(" / ")}`}
        stats={[
          { label: "Score", value: score.toLocaleString("en-US"), highlight: true },
          { label: "Moves", value: movesLeft },
          ...(best !== undefined ? [{ label: "Best", value: best.toLocaleString("en-US") }] : []),
        ]}
        actions={
          <>
            <HudButton onClick={onRestart}>
              <LuRefreshCw aria-hidden /> New game
            </HudButton>
            <SoundToggle />
          </>
        }
      />

      <Stage
        ref={stageRef}
        aspect={1}
        maxW="600px"
        overlay={
          result ? (
            <StageOverlay
              title={result.stars > 0 ? "Out of moves" : "So close"}
              autoFocus
              actions={
                <StagePrimaryButton onClick={onRestart}>
                  <LuRefreshCw aria-hidden /> Play again
                </StagePrimaryButton>
              }
            >
              <StageStars n={result.stars} />
              <StageText>
                {result.score.toLocaleString("en-US")} points
                {result.newBest
                  ? " · New best"
                  : result.previous !== undefined
                    ? ` · best ${result.previous.toLocaleString("en-US")}`
                    : ""}
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
          aria-label="Cascade board, 8 by 8 gems"
          aria-describedby={helpId}
          cursor={result ? "default" : "pointer"}
          rounded="sm"
          outline="none"
          _focusVisible={{ outline: "2px solid", outlineColor: "primary.300", outlineOffset: "6px" }}
          // Drags swap gems, so the board must not scroll the page on touch.
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") vis().hover = -1;
          }}
        >
          <canvas ref={canvasRef} aria-hidden style={{ width: "100%", height: "100%", display: "block" }} />
        </Box>
      </Stage>

      <VisuallyHidden id={helpId}>
        Swap two neighbouring gems to line up three or more of a kind. Drag a gem, or click it and
        then a neighbour. With the keyboard, arrows move, Space picks a gem up and an arrow swaps it.
        You have {START_MOVES} moves.
      </VisuallyHidden>
      <VisuallyHidden aria-live="polite">{result ? `Out of moves. Final score ${result.score}.` : announce}</VisuallyHidden>
    </Box>
  );
}
