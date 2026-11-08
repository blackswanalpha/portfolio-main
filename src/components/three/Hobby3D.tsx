"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { Stage } from "@/components/three/stage/stage";
import SceneReady from "@/components/three/stage/SceneReady";
import { usePrefersReducedMotion } from "@/components/three/stage/usePrefersReducedMotion";
import { createHeadphones } from "@/components/three/models/headphones";
import { createDumbbell } from "@/components/three/models/dumbbell";
import { disposeObject } from "@/components/three/models/dispose";
import { FLOOR_Y, LENS_GLASS, STILL_LIFE } from "@/components/three/models/stillLife";

/*
 * The hobbies still life: a film camera (Poly Haven Camera_01, CC0), studio
 * headphones and a hex dumbbell (both modelled here), lit by soft studio
 * light panels with contact shadows on a seamless floor. Rendered through the
 * home page's shared stage.
 */

const CAMERA_URL = STILL_LIFE.camera.url;

function withMeshopt(loader: GLTFLoader) {
    loader.setMeshoptDecoder(MeshoptDecoder);
}

/** Drop the loader cache so the decoded model can be collected. */
export function releaseStillLifeAssets() {
    useLoader.clear(GLTFLoader, CAMERA_URL);
}

function FilmCamera() {
    const gltf = useLoader(GLTFLoader, CAMERA_URL, withMeshopt);
    const { model, lens } = useMemo(() => {
        const model = gltf.scene.clone(true);
        // The asset's lens uses transmission, which costs an extra scene pass.
        // Dark coated glass reads the same at this size.
        const lens = new THREE.MeshPhysicalMaterial({ ...LENS_GLASS, metalness: 0 });
        model.traverse((node) => {
            const mesh = node as THREE.Mesh;
            if (!mesh.isMesh) return;
            const material = mesh.material as THREE.Material;
            if (material.name === "Camera_01_lens") mesh.material = lens;
        });
        return { model, lens };
    }, [gltf]);

    useEffect(
        () => () => {
            lens.dispose();
            disposeObject(gltf.scene);
        },
        [gltf, lens],
    );

    return (
        <primitive
            object={model}
            position={STILL_LIFE.camera.position}
            rotation-y={STILL_LIFE.camera.rotationY}
        />
    );
}

/** Eases the view a few degrees toward the pointer while it is over the slot. */
function PointerParallax({ stage }: { stage: Stage }) {
    const camera = useThree((state) => state.camera);
    const reduced = usePrefersReducedMotion();
    const base = useMemo(() => camera.position.clone(), [camera]);
    const target = useMemo(
        () =>
            new THREE.Vector3(
                STILL_LIFE.view.target[0],
                STILL_LIFE.view.target[1] + FLOOR_Y,
                STILL_LIFE.view.target[2],
            ),
        [],
    );
    const goal = useRef(new THREE.Vector3());

    useFrame((state, delta) => {
        const slot = stage.slots.get("hobbies");
        const pointer = slot?.pointer;
        const active = !reduced && !!slot?.visible && !!pointer?.active;
        goal.current.copy(base);
        if (active && pointer) {
            goal.current.x += pointer.x * 0.07;
            goal.current.y += -pointer.y * 0.035;
        }
        const cam = state.camera;
        const distance = cam.position.distanceTo(goal.current);
        if (distance < 1e-4) return;
        const t = 1 - Math.exp(-Math.min(delta, 1 / 30) * 6);
        cam.position.lerp(goal.current, t);
        cam.lookAt(target);
        cam.updateMatrixWorld();
        state.invalidate();
    });

    return null;
}

export default function HobbyStillLife({ stage }: { stage: Stage }) {
    const headphones = useMemo(() => createHeadphones(), []);
    const dumbbell = useMemo(() => createDumbbell(), []);

    useEffect(
        () => () => {
            disposeObject(headphones);
            disposeObject(dumbbell);
        },
        [headphones, dumbbell],
    );

    const { environment, shadows } = STILL_LIFE;

    return (
        <>
            <Environment resolution={environment.resolution} frames={1}>
                <color attach="background" args={[environment.background]} />
                {environment.lightformers.map((light, index) => (
                    <Lightformer
                        key={index}
                        form="rect"
                        intensity={light.intensity}
                        color={light.color}
                        position={light.position}
                        scale={light.scale}
                        target={[0, 0, 0]}
                    />
                ))}
            </Environment>

            <group position-y={FLOOR_Y}>
                <primitive
                    object={headphones}
                    position={STILL_LIFE.headphones.position}
                    rotation-y={STILL_LIFE.headphones.rotationY}
                />
                <primitive
                    object={dumbbell}
                    position={STILL_LIFE.dumbbell.position}
                    rotation-y={STILL_LIFE.dumbbell.rotationY}
                />
                {/* Shadows render once, after the camera model is in; then the view may replace its poster. */}
                <Suspense fallback={null}>
                    <FilmCamera />
                    <ContactShadows
                        frames={1}
                        position-y={0.0005}
                        scale={shadows.scale}
                        blur={shadows.blur}
                        far={shadows.far}
                        opacity={shadows.opacity}
                        color={shadows.color}
                        resolution={shadows.resolution}
                    />
                    <SceneReady id="hobbies" stage={stage} />
                </Suspense>
            </group>

            <PointerParallax stage={stage} />
        </>
    );
}
