"use client";

import { Box } from "@chakra-ui/react";
import { useEffect, useRef, useState, useSyncExternalStore, type Ref } from "react";
import gsap from "gsap";
import type { Container, Sprite } from "pixi.js";
import { ErrorState } from "@/components/ui/states";
import type { GameState, ParsedLevel, Vec } from "@/lib/sokoban/types";
import { makeTextures, type BoardTextures } from "./pixiTextures";

/**
 * Render-only PixiJS board. All game logic stays in the pure engine
 * (src/lib/sokoban) and the React layer (SokobanGame/useSokoban); this
 * component mirrors `game` into a Pixi scene and tweens pieces with GSAP.
 *
 * Lifecycle: one Application per mount. It is created after the async
 * `app.init()` resolves and only if the component is still mounted, and it is
 * destroyed (canvas, renderer, ticker, scene, generated textures and the GSAP
 * hooks) on unmount. A level change remounts this component, so it never
 * reuses an app across levels.
 */

const keyOf = (v: Vec) => `${v.x},${v.y}`;

const MOVE_DURATION = 0.13;

/** clamp(24px, min(82vw, 460px) / width, 56px), in whole pixels. */
function computeCell(levelWidth: number, viewportWidth: number): number {
  const target = Math.min(0.82 * viewportWidth, 460) / levelWidth;
  return Math.round(Math.min(Math.max(target, 24), 56));
}

function subscribeViewport(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

interface Scene {
  cell: number;
  textures: BoardTextures;
  root: Container;
  player: Sprite;
  boxes: Sprite[];
  boxOnGoal: boolean[];
  particles: Set<Sprite>;
}

interface BoardController {
  setCell(cell: number): void;
  sync(game: GameState): void;
}

export default function PixiBoard({
  level,
  game,
  reducedMotion,
  describedBy,
  ref,
}: {
  level: ParsedLevel;
  game: GameState;
  reducedMotion: boolean;
  /** id of the element describing the controls */
  describedBy?: string;
  /** the focusable board frame (PlayView focuses it when a run starts) */
  ref?: Ref<HTMLDivElement>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<BoardController | null>(null);
  const gameRef = useRef(game);
  const reducedRef = useRef(reducedMotion);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // The cell size follows the viewport through an external store. The host
  // reserves the board's exact size before Pixi has initialised (no layout jump
  // while the chunk loads) and resizes reach the scene through `setCell`.
  const cell = useSyncExternalStore(
    subscribeViewport,
    () => computeCell(level.width, window.innerWidth),
    () => 0,
  );

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  // --- Pixi lifecycle -------------------------------------------------------
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      let pixi: typeof import("pixi.js");
      try {
        pixi = await import("pixi.js");
      } catch {
        if (!disposed) setFailed(true);
        return;
      }
      // Unmounted while the chunk loaded: never create an app at all.
      if (disposed) return;

      const { Application, Container, Sprite } = pixi;
      const initCell = computeCell(level.width, window.innerWidth);
      const app = new Application();
      try {
        await app.init({
          backgroundAlpha: 0,
          antialias: true,
          // No render loop: the scene is static between moves, so frames are
          // drawn on demand from the GSAP ticker (see `flush`).
          autoStart: false,
          width: initCell * level.width,
          height: initCell * level.height,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
          // Pixi's own a11y layer listens for Tab on window and injects an
          // overlay div. The board's accessibility is handled in React (focusable
          // frame, label, live region), so keep Pixi's off.
          accessibilityOptions: { activateOnTab: false, enabledByDefault: false },
        });
      } catch {
        // init rejected (no WebGL). The app never initialised, so it must not
        // be destroyed.
        if (!disposed) setFailed(true);
        return;
      }
      if (disposed) {
        // Strict Mode double mount or a fast unmount finished first. The app is
        // initialised but was never attached: destroy it and stop.
        app.destroy(true, { children: true, texture: true, textureSource: true });
        return;
      }

      // Pixi's event system sets `touch-action: none` on the canvas (so a swipe
      // over the board cannot scroll the page on phones) and adds document
      // pointer listeners plus a system-ticker hook. The board takes no pointer
      // input, so detach it. The typings say HTMLElement, but null is the
      // documented way to unbind (EventSystem.destroy() does the same).
      app.renderer.events.setTargetElement(null as unknown as HTMLElement);

      const goalSet = new Set(level.goals.map(keyOf));

      let dirty = true;
      const invalidate = () => {
        dirty = true;
      };
      const flush = () => {
        if (!dirty) return;
        dirty = false;
        app.render();
      };

      const center = (pos: Vec, c: number) => ({
        x: (pos.x + 0.5) * c,
        y: (pos.y + 0.5) * c,
      });

      /** Build the whole scene (static tiles + pieces) at the given cell size. */
      const build = (c: number): Scene => {
        const textures = makeTextures(pixi, app.renderer, c);
        const root = new Container();
        app.stage.addChild(root);

        // static layer: checker floor inside the playfield, walls, goal pads
        for (let y = 0; y < level.height; y++) {
          for (let x = 0; x < level.width; x++) {
            const tile = new Sprite(
              level.walls[y][x]
                ? textures.wall
                : (x + y) % 2 === 0
                  ? textures.floorA
                  : textures.floorB,
            );
            tile.position.set(x * c, y * c);
            root.addChild(tile);
          }
        }
        for (const gpos of level.goals) {
          const pad = new Sprite(textures.goal);
          pad.position.set(gpos.x * c, gpos.y * c);
          root.addChild(pad);
        }

        // dynamic pieces at the CURRENT game state (not the level start)
        const state = gameRef.current;
        const boxes: Sprite[] = [];
        const boxOnGoal: boolean[] = [];
        for (const b of state.boxes) {
          const onGoal = goalSet.has(keyOf(b));
          const s = new Sprite(onGoal ? textures.crateOnGoal : textures.crate);
          s.anchor.set(0.5);
          const p = center(b, c);
          s.position.set(p.x, p.y);
          boxes.push(s);
          boxOnGoal.push(onGoal);
          root.addChild(s);
        }
        const player = new Sprite(textures.player);
        player.anchor.set(0.5);
        const pp = center(state.player, c);
        player.position.set(pp.x, pp.y);
        root.addChild(player);

        return { cell: c, textures, root, player, boxes, boxOnGoal, particles: new Set() };
      };

      const destroyScene = (s: Scene) => {
        const targets: object[] = [s.player, s.player.scale];
        for (const b of s.boxes) targets.push(b, b.scale);
        for (const p of s.particles) targets.push(p);
        // One target per call. With an array, GSAP only interrupts tweens that
        // have already rendered: a tween created this frame (still lazy) would
        // survive, initialise on a destroyed sprite and throw on every GSAP
        // tick, freezing every GSAP animation on the page.
        for (const target of targets) gsap.killTweensOf(target);
        s.particles.clear();
        app.stage.removeChild(s.root);
        s.root.destroy({ children: true });
        // Textures last: they back the sprites destroyed above, and freeing
        // their render targets needs the renderer, which is still alive here.
        s.textures.destroy();
      };

      /** Small burst of green sparks where a crate lands on a goal. */
      const spawnSparks = (s: Scene, x: number, y: number) => {
        const count = 6;
        for (let i = 0; i < count; i++) {
          const spark = new Sprite(s.textures.spark);
          spark.anchor.set(0.5);
          spark.tint = 0x22c55e;
          spark.position.set(x, y);
          spark.alpha = 0.9;
          s.root.addChild(spark);
          s.particles.add(spark);
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
          const dist = s.cell * (0.5 + Math.random() * 0.4);
          gsap.to(spark, {
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            alpha: 0,
            duration: 0.45,
            ease: "power2.out",
            onUpdate: invalidate,
            onComplete: () => {
              s.particles.delete(spark);
              spark.destroy();
              invalidate();
            },
          });
        }
      };

      // The viewport may have changed while init was pending.
      let scene = build(computeCell(level.width, window.innerWidth));
      if (scene.cell !== initCell) {
        app.renderer.resize(scene.cell * level.width, scene.cell * level.height);
      }
      let shown = gameRef.current;

      // First frame before the canvas is attached, so it never shows blank.
      app.render();
      dirty = false;
      const canvas = app.canvas;
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.display = "block";
      host.appendChild(canvas);
      gsap.ticker.add(flush);

      const controller: BoardController = {
        setCell(next) {
          if (next <= 0 || next === scene.cell) return;
          destroyScene(scene);
          app.renderer.resize(next * level.width, next * level.height);
          scene = build(next);
          shown = gameRef.current;
          invalidate();
        },

        sync(next) {
          const prev = shown;
          shown = next;
          if (prev === next) return;

          const s = scene;
          const c = s.cell;
          const reduced = reducedRef.current;
          const forward = next.moves > prev.moves;

          // Tween one-cell steps. Snap anything that jumps further (reset) and
          // everything under reduced motion.
          const place = (sprite: Sprite, from: Vec, to: Vec) => {
            const { x, y } = center(to, c);
            const steps = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
            if (reduced || steps > 1) {
              gsap.killTweensOf(sprite);
              sprite.position.set(x, y);
              invalidate();
            } else {
              gsap.to(sprite, {
                x,
                y,
                duration: MOVE_DURATION,
                ease: "power2.out",
                overwrite: true,
                onUpdate: invalidate,
              });
            }
          };

          place(s.player, prev.player, next.player);

          next.boxes.forEach((b, i) => {
            const sprite = s.boxes[i];
            const before = prev.boxes[i];
            if (!sprite || !before) return;
            if (before.x !== b.x || before.y !== b.y) place(sprite, before, b);

            const onGoal = goalSet.has(keyOf(b));
            if (onGoal === s.boxOnGoal[i]) return;
            s.boxOnGoal[i] = onGoal;
            sprite.texture = onGoal ? s.textures.crateOnGoal : s.textures.crate;
            invalidate();
            if (onGoal && forward && !reduced) {
              // landing feedback: a short settle + sparks
              gsap.fromTo(
                sprite.scale,
                { x: 1.12, y: 1.12 },
                {
                  x: 1,
                  y: 1,
                  duration: 0.25,
                  ease: "power2.out",
                  delay: MOVE_DURATION,
                  overwrite: "auto",
                  onUpdate: invalidate,
                },
              );
              spawnSparks(s, (b.x + 0.5) * c, (b.y + 0.5) * c);
            }
          });

          if (next.solved && !prev.solved && !reduced) {
            s.boxes.forEach((sprite, i) => {
              gsap.fromTo(
                sprite.scale,
                { x: 1.1, y: 1.1 },
                {
                  x: 1,
                  y: 1,
                  duration: 0.35,
                  ease: "power2.out",
                  delay: MOVE_DURATION + 0.05 * i,
                  overwrite: "auto",
                  onUpdate: invalidate,
                },
              );
            });
          }
        },
      };
      controllerRef.current = controller;

      teardown = () => {
        if (controllerRef.current === controller) controllerRef.current = null;
        gsap.ticker.remove(flush);
        destroyScene(scene);
        // Removes the canvas, destroys the stage, the renderer (which loses
        // its WebGL context) and the app ticker.
        app.destroy(true, { children: true, texture: true, textureSource: true });
      };
    })();

    return () => {
      disposed = true;
      teardown?.();
      teardown = null;
    };
  }, [level, attempt]);

  // --- Viewport -> cell size --------------------------------------------------
  useEffect(() => {
    controllerRef.current?.setCell(cell);
  }, [cell]);

  // --- Mirror game state into the scene ---------------------------------------
  useEffect(() => {
    gameRef.current = game; // the scene build reads this if init is still pending
    controllerRef.current?.sync(game);
  }, [game]);

  const width = cell > 0 ? `${cell * level.width}px` : undefined;
  const height = cell > 0 ? `${cell * level.height}px` : undefined;

  return (
    <Box
      ref={ref}
      tabIndex={0}
      role="application"
      aria-label={`Sokoban board, level ${level.id}: ${level.name}`}
      aria-describedby={describedBy}
      bg="surface"
      borderWidth="1px"
      borderColor="border"
      rounded="2xl"
      p={{ base: 3, md: 5 }}
      display="inline-block"
      maxW="full"
      // Clear the fixed navbar when the board is scrolled into view.
      scrollMarginTop={{ base: "96px", md: "112px" }}
      scrollMarginBottom="24px"
    >
      {failed ? (
        <Box w={width} minW="16rem">
          <ErrorState
            compact
            title="Couldn't start the board"
            description="This browser couldn't create a WebGL canvas for the game."
            onRetry={() => {
              setFailed(false);
              setAttempt((n) => n + 1);
            }}
          />
        </Box>
      ) : (
        <Box
          ref={hostRef}
          w={width}
          h={height}
          userSelect="none"
          rounded="lg"
          overflow="hidden"
          style={{ touchAction: "manipulation", lineHeight: 0 }}
        />
      )}
    </Box>
  );
}
