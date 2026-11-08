"use client";

import { Box, VisuallyHidden } from "@chakra-ui/react";
import { useCallback, useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { LuPause, LuPlay, LuRefreshCw } from "react-icons/lu";
import { hasModifier, isForeignTarget } from "@/lib/arcade/input";
import { recordKeys, submitRecord } from "@/lib/arcade/records";
import { randomSeed } from "@/lib/arcade/rng";
import { playSfx, unlockAudio } from "@/lib/arcade/sound";
import {
  STEP,
  WORLD_H,
  WORLD_W,
  createWorld,
  stepWorld,
  type ShatterInput,
  type ShatterWorld,
} from "@/lib/arcade/shatter";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { fitCanvas } from "../shared/fx";
import { useElementWidth, useGameLoop, useRecords } from "../shared/hooks";
import {
  ArcadeHud,
  HudButton,
  SoundToggle,
  Stage,
  StageOverlay,
  StagePrimaryButton,
  StageSecondaryButton,
  StageText,
} from "../shared/ui";
import { PICKUP_STYLE, applyEvents, createShatterFx, drawShatter, updateFx, type ShatterFx } from "./drawShatter";

type Status = "ready" | "playing" | "paused" | "over";

interface Hud {
  score: number;
  lives: number;
  level: number;
}

interface Result {
  score: number;
  level: number;
  /** Best score before this game (undefined on a first game). */
  previous?: number;
  newBest: boolean;
}

const MAX_STEPS_PER_FRAME = 24;
const START_HUD: Hud = { score: 0, lives: 3, level: 1 };

export default function ShatterGame() {
  // A new key remounts the run: fresh world, effects and listeners.
  const [run, setRun] = useState(0);
  const [autoStart, setAutoStart] = useState(false);
  return (
    <ShatterRun
      key={run}
      autoStart={autoStart}
      onRestart={() => {
        setAutoStart(true);
        setRun((r) => r + 1);
      }}
    />
  );
}

function ShatterRun({ autoStart, onRestart }: { autoStart: boolean; onRestart: () => void }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const records = useRecords();
  const best = records[recordKeys.shatterScore];
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = useElementWidth(stageRef);
  const helpId = useId();

  const worldRef = useRef<ShatterWorld | null>(null);
  const fxRef = useRef<ShatterFx | null>(null);
  const accRef = useRef(0);
  const keysRef = useRef({ left: false, right: false });
  const pointerRef = useRef<number | null>(null);
  const launchRef = useRef(false);
  // When play last started or resumed: the second click of a double-click on
  // Play, Resume or Play again must not land on the field and launch the ball.
  const startedAtRef = useRef(autoStart ? Number.POSITIVE_INFINITY : 0);
  const hudRef = useRef<Hud>(START_HUD);

  const [status, setStatus] = useState<Status>(autoStart ? "playing" : "ready");
  // Handlers and the frame loop read the live status here; React state drives
  // the overlays.
  const statusRef = useRef<Status>(status);
  const [hud, setHud] = useState<Hud>(START_HUD);
  const [result, setResult] = useState<Result | null>(null);
  const [announce, setAnnounce] = useState("");

  const world = useCallback(() => (worldRef.current ??= createWorld(randomSeed())), []);
  const fx = useCallback(() => (fxRef.current ??= createShatterFx()), []);

  const go = useCallback((next: Status) => {
    statusRef.current = next;
    setStatus(next);
    if (next !== "playing") {
      keysRef.current.left = keysRef.current.right = false;
      launchRef.current = false;
    }
  }, []);

  const start = useCallback(() => {
    unlockAudio();
    startedAtRef.current = performance.now();
    go("playing");
    fieldRef.current?.focus({ preventScroll: true });
    // The whole field has to be on screen to play.
    stageRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [go]);

  // A restarted run (Play again) starts playing straight away.
  useEffect(() => {
    if (!autoStart) return;
    startedAtRef.current = performance.now();
    fieldRef.current?.focus({ preventScroll: true });
    stageRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [autoStart]);

  // Leaving the tab or the window pauses the game instead of letting it run
  // (or jump ahead) unseen.
  useEffect(() => {
    const pause = () => {
      if (statusRef.current === "playing") go("paused");
    };
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    // Typing in the chat (or any field or dialog) also pauses: the ball
    // shouldn't drain lives while the player is looking elsewhere.
    const onFocusIn = (e: FocusEvent) => {
      if (isForeignTarget(e.target)) pause();
    };
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [go]);

  // Keyboard. Steering keys are tracked on keydown/keyup; launch and pause are
  // edge-triggered.
  useEffect(() => {
    const steer = (key: string): "left" | "right" | null =>
      key === "ArrowLeft" || key === "a" || key === "A" ? "left" : key === "ArrowRight" || key === "d" || key === "D" ? "right" : null;

    const onDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || hasModifier(e)) return;
      if (isForeignTarget(e.target, rootRef.current)) return;
      const s = statusRef.current;
      const onButton = e.target instanceof Element && e.target.closest("button, a") !== null;
      const dir = steer(e.key);
      if (dir && s === "playing") {
        e.preventDefault();
        keysRef.current[dir] = true;
        pointerRef.current = null;
        return;
      }
      if (e.key === " " && s === "playing" && !onButton) {
        e.preventDefault();
        if (!e.repeat) {
          unlockAudio();
          launchRef.current = true;
        }
        return;
      }
      if ((e.key === "p" || e.key === "P" || e.key === "Escape") && (s === "playing" || s === "paused")) {
        e.preventDefault();
        if (s === "playing") go("paused");
        else start();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const dir = steer(e.key);
      if (dir) keysRef.current[dir] = false;
    };
    const onBlur = () => {
      keysRef.current.left = keysRef.current.right = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [go, start]);

  const toWorldX = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return rect.width > 0 ? ((e.clientX - rect.left) / rect.width) * WORLD_W : null;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || statusRef.current !== "playing") return;
    if (performance.now() - startedAtRef.current < 300) return;
    unlockAudio();
    pointerRef.current = toWorldX(e);
    if (e.pointerType !== "mouse") e.currentTarget.setPointerCapture?.(e.pointerId);
    launchRef.current = true;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || statusRef.current !== "playing") return;
    // A finger steers only while it is down; a mouse steers whenever it is over the field.
    if (e.pointerType !== "mouse" && e.buttons === 0) return;
    pointerRef.current = toWorldX(e);
  };

  const releasePointer = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") pointerRef.current = null;
  };

  const finish = useCallback((score: number, level: number) => {
    const { previous, improved } = submitRecord(recordKeys.shatterScore, score);
    submitRecord(recordKeys.shatterLevel, level);
    setResult({ score, level, previous, newBest: improved && previous !== undefined });
    setAnnounce(`Game over. ${score} points, level ${level}.`);
    go("over");
  }, [go]);

  useGameLoop(
    (dt) => {
      const canvas = canvasRef.current;
      if (!canvas || width === 0) return;
      const w = world();
      const f = fx();

      if (statusRef.current === "playing") {
        accRef.current = Math.min(accRef.current + dt, STEP * MAX_STEPS_PER_FRAME);
        const input: ShatterInput = {
          axis: (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0),
          pointerX: pointerRef.current,
          launch: launchRef.current,
        };
        let stepped = false;
        while (accRef.current >= STEP && w.phase !== "over") {
          stepWorld(w, input, STEP);
          input.launch = false;
          accRef.current -= STEP;
          stepped = true;
        }
        // A launch pressed between steps waits for the next one.
        if (stepped) launchRef.current = false;

        if (w.events.length > 0) {
          const events = w.events.splice(0, w.events.length);
          applyEvents(f, w, events, reduced);
          for (const e of events) {
            if (e.type === "brick") playSfx(e.destroyed ? "brick" : "crack", Math.min(e.combo, 10));
            else if (e.type === "paddle") playSfx("paddle");
            else if (e.type === "wall") playSfx("wall");
            else if (e.type === "pickup") {
              playSfx("powerup");
              setAnnounce(PICKUP_STYLE[e.kind].name);
            }
            else if (e.type === "launch") playSfx("launch");
            else if (e.type === "lifeLost") {
              playSfx(e.lives > 0 ? "lifeLost" : "gameOver");
              setAnnounce(e.lives > 0 ? `Ball lost. ${e.lives} ${e.lives === 1 ? "life" : "lives"} left.` : "");
            } else if (e.type === "levelClear") {
              playSfx("win");
              setAnnounce(`Level ${e.level} clear.`);
            }
          }
          const over = events.find((e) => e.type === "gameOver");
          if (over && over.type === "gameOver") finish(over.score, over.level);
        }
        updateFx(f, w, dt);

        const h = hudRef.current;
        if (h.score !== w.score || h.lives !== w.lives || h.level !== w.level) {
          hudRef.current = { score: w.score, lives: w.lives, level: w.level };
          setHud(hudRef.current);
        }
      } else if (statusRef.current === "over") {
        // Let the last particles settle under the result card.
        updateFx(f, w, dt);
      }

      fitCanvas(canvas, width, (width * WORLD_H) / WORLD_W);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const prompt =
        statusRef.current === "playing" && w.phase === "serve" ? "Click, tap or press Space to launch" : null;
      drawShatter(ctx, canvas, w, f, reduced, prompt);
    },
    width > 0,
    stageRef,
  );

  const overlay =
    status === "ready" ? (
      <StageOverlay
        title="Shatter"
        live={false}
        actions={
          <StagePrimaryButton onClick={start}>
            <LuPlay aria-hidden /> Play
          </StagePrimaryButton>
        }
      >
        <StageText>
          Keep the ball in play and break every brick. Catch the falling capsules: wide paddle,
          multi-ball, slow ball and extra life.
        </StageText>
      </StageOverlay>
    ) : status === "paused" ? (
      <StageOverlay
        title="Paused"
        autoFocus
        actions={
          <>
            <StagePrimaryButton onClick={start}>
              <LuPlay aria-hidden /> Resume
            </StagePrimaryButton>
            <StageSecondaryButton onClick={onRestart}>
              <LuRefreshCw aria-hidden /> Restart
            </StageSecondaryButton>
          </>
        }
      >
        <StageText>Press P or Escape to carry on.</StageText>
      </StageOverlay>
    ) : status === "over" && result ? (
      <StageOverlay
        title="Game over"
        autoFocus
        actions={
          <StagePrimaryButton onClick={onRestart}>
            <LuRefreshCw aria-hidden /> Play again
          </StagePrimaryButton>
        }
      >
        <StageText>
          {result.score.toLocaleString("en-US")} points · level {result.level}
          {result.newBest
            ? " · New best"
            : result.previous !== undefined
              ? ` · best ${result.previous.toLocaleString("en-US")}`
              : ""}
        </StageText>
      </StageOverlay>
    ) : null;

  return (
    <Box ref={rootRef} w="full" display="flex" flexDirection="column" gap={5}>
      <ArcadeHud
        title="Shatter"
        subtitle={`Level ${hud.level}`}
        stats={[
          { label: "Score", value: hud.score.toLocaleString("en-US"), highlight: true },
          { label: "Lives", value: hud.lives },
          ...(best !== undefined ? [{ label: "Best", value: best.toLocaleString("en-US") }] : []),
        ]}
        actions={
          <>
            <HudButton
              onClick={() => (status === "playing" ? go("paused") : start())}
              disabled={status === "ready" || status === "over"}
              aria-keyshortcuts="P"
            >
              {status === "paused" ? <LuPlay aria-hidden /> : <LuPause aria-hidden />}
              {status === "paused" ? "Resume" : "Pause"}
            </HudButton>
            <SoundToggle />
          </>
        }
      />

      <Stage ref={stageRef} aspect={WORLD_W / WORLD_H} maxW="480px" overlay={overlay}>
        <Box
          ref={fieldRef}
          position="absolute"
          inset={0}
          tabIndex={0}
          role="application"
          aria-label="Shatter playfield"
          aria-describedby={helpId}
          rounded="sm"
          overflow="hidden"
          outline="none"
          cursor={status === "playing" ? "none" : "default"}
          _focusVisible={{ outline: "2px solid", outlineColor: "primary.300", outlineOffset: "6px" }}
          // Dragging steers the paddle, so touches here must not scroll the page.
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={releasePointer}
          onPointerCancel={releasePointer}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") pointerRef.current = null;
          }}
        >
          <canvas ref={canvasRef} aria-hidden style={{ width: "100%", height: "100%", display: "block" }} />
        </Box>
      </Stage>

      <VisuallyHidden id={helpId}>
        Move the paddle with the mouse, by dragging a finger, or with the left and right arrow keys.
        Click, tap or press Space to launch the ball. P or Escape pauses.
      </VisuallyHidden>
      <VisuallyHidden aria-live="polite">{announce}</VisuallyHidden>
    </Box>
  );
}
