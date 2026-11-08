"use client";

import { Suspense, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import type { Stage, SlotId } from "./stage";
import EarthGlobe, { EARTH_VIEW, releaseEarthAssets } from "@/components/sections/Hero3DBackground";
import HobbyStillLife, { releaseStillLifeAssets } from "@/components/three/Hobby3D";
import { STILL_LIFE, FLOOR_Y } from "@/components/three/models/stillLife";

const scratch = new THREE.Vector2();

interface ViewCamera {
    fov: number;
    position: readonly [number, number, number];
    target: readonly [number, number, number];
    near: number;
    far: number;
}

/**
 * Renders one portal scene into the bottom-left corner of the shared canvas,
 * then copies those pixels into the slot's inline 2D canvas.
 */
function SlotRenderer({ id, stage }: { id: SlotId; stage: Stage }) {
    useFrame((state) => {
        const slot = stage.slots.get(id);
        if (!slot || !slot.visible || slot.width < 2 || slot.height < 2) return;
        // Keep the poster until every asset of this scene is in.
        if (!stage.isSceneReady(id)) return;
        const { gl, scene } = state;
        const camera = state.camera as THREE.PerspectiveCamera;
        const size = gl.getSize(scratch);
        // The shared canvas is resized to the largest slot; wait for that to land.
        if (slot.width > size.x + 0.5 || slot.height > size.y + 0.5) return;

        const width = slot.width;
        const height = slot.height;
        const aspect = width / height;
        if (Math.abs(camera.aspect - aspect) > 1e-4) {
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
        }

        gl.setViewport(0, 0, width, height);
        gl.setScissor(0, 0, width, height);
        gl.setScissorTest(true);
        gl.render(scene, camera);
        gl.setScissorTest(false);

        const ratio = gl.getPixelRatio();
        const sw = Math.round(width * ratio);
        const sh = Math.round(height * ratio);
        const target = slot.canvas;
        if (target.width !== sw || target.height !== sh) {
            target.width = sw;
            target.height = sh;
        }
        const source = gl.domElement;
        slot.ctx.clearRect(0, 0, sw, sh);
        slot.ctx.drawImage(source, 0, source.height - sh, sw, sh, 0, 0, sw, sh);
        slot.onFrame();
    }, 1);
    return null;
}

/** A separate scene and camera for one slot, rendered by SlotRenderer. */
function StageView({ id, stage, view, children }: { id: SlotId; stage: Stage; view: ViewCamera; children: ReactNode }) {
    const [scene] = useState(() => new THREE.Scene());
    const [camera] = useState(() => {
        const camera = new THREE.PerspectiveCamera(view.fov, 1, view.near, view.far);
        camera.position.set(...view.position);
        camera.lookAt(...view.target);
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
        return camera;
    });
    return createPortal(
        <>
            <SlotRenderer id={id} stage={stage} />
            {children}
        </>,
        scene,
        { camera },
    );
}

/**
 * Wires the renderer to the stage: invalidation and context loss. R3F's
 * defaults give ACES tone mapping and sRGB output, which is what both scenes
 * were tuned against; the clear is set fully transparent on creation so every
 * view floats on whatever sits behind its slot.
 */
function StageBridge({ stage }: { stage: Stage }) {
    const gl = useThree((state) => state.gl);
    const invalidate = useThree((state) => state.invalidate);

    useEffect(() => {
        stage.setInvalidator(() => invalidate());

        const canvas = gl.domElement;
        const onLost = (event: Event) => {
            event.preventDefault();
            stage.fail();
        };
        canvas.addEventListener("webglcontextlost", onLost);
        return () => {
            canvas.removeEventListener("webglcontextlost", onLost);
            stage.setInvalidator(null);
        };
    }, [gl, invalidate, stage]);

    return null;
}

/**
 * The single WebGL context for the home page. Hidden, sized to the largest
 * slot, and only ever drawn into the inline slot canvases.
 */
export default function HomeStage({ stage }: { stage: Stage }) {
    const sizeKey = useSyncExternalStore(stage.subscribe, stage.getSizeKey, () => "1x1");
    const [width, height] = sizeKey.split("x").map(Number);

    // Loaded assets live in module caches; free them when the page goes away.
    useEffect(
        () => () => {
            releaseEarthAssets();
            releaseStillLifeAssets();
        },
        [],
    );

    return (
        <div
            aria-hidden="true"
            style={{
                position: "fixed",
                left: 0,
                top: 0,
                width,
                height,
                visibility: "hidden",
                pointerEvents: "none",
                zIndex: -1,
                contain: "strict",
            }}
        >
            <Canvas
                frameloop="demand"
                dpr={[1, 2]}
                resize={{ scroll: false }}
                gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
                onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
            >
                <StageBridge stage={stage} />
                <StageView id="globe" stage={stage} view={EARTH_VIEW}>
                    <Suspense fallback={null}>
                        <EarthGlobe stage={stage} />
                    </Suspense>
                </StageView>
                <StageView
                    id="hobbies"
                    stage={stage}
                    view={{
                        fov: STILL_LIFE.view.fov,
                        position: [
                            STILL_LIFE.view.position[0],
                            STILL_LIFE.view.position[1] + FLOOR_Y,
                            STILL_LIFE.view.position[2],
                        ],
                        target: [
                            STILL_LIFE.view.target[0],
                            STILL_LIFE.view.target[1] + FLOOR_Y,
                            STILL_LIFE.view.target[2],
                        ],
                        near: 0.05,
                        far: 20,
                    }}
                >
                    <Suspense fallback={null}>
                        <HobbyStillLife stage={stage} />
                    </Suspense>
                </StageView>
            </Canvas>
        </div>
    );
}
