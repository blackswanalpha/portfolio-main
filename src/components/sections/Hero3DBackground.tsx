"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import type { Stage } from "@/components/three/stage/stage";
import SceneReady from "@/components/three/stage/SceneReady";
import { usePrefersReducedMotion } from "@/components/three/stage/usePrefersReducedMotion";
import { disposeObject } from "@/components/three/models/dispose";
import {
    EARTH_TILT,
    NAIROBI,
    SUN_DIRECTION,
    createEarthMaterial,
    createPin,
    prepareEarthTextures,
    spinToFace,
} from "@/components/three/models/earth";

/*
 * Photoreal Earth with a pin on Nairobi. Rendered through the home page's
 * shared stage (see components/three/stage), never as a page background.
 *
 * Textures are self-hosted NASA public-domain imagery (public/textures/earth,
 * sources in LICENSE.txt): Blue Marble albedo, SRTM relief, the Blue Marble
 * land/water mask as roughness, and DMSP city lights for the night side.
 */

const TEXTURES = [
    "/textures/earth/earth-day-2k.jpg",
    "/textures/earth/earth-bump-2k.jpg",
    "/textures/earth/earth-roughness-2k.jpg",
    "/textures/earth/earth-night-2k.jpg",
];

/** One turn every two minutes. */
const SPIN_SPEED = (Math.PI * 2) / 120;

export const EARTH_VIEW = {
    fov: 30,
    position: [0, 0, 4.8] as const,
    target: [0, 0, 0] as const,
    near: 0.1,
    far: 50,
};

const SUN_POSITION = SUN_DIRECTION.clone().multiplyScalar(10);

/** Drop the loader cache so the decoded images can be collected. */
export function releaseEarthAssets() {
    useLoader.clear(THREE.TextureLoader, TEXTURES);
}

export default function EarthGlobe({ stage }: { stage: Stage }) {
    const [day, bump, roughness, night] = useLoader(THREE.TextureLoader, TEXTURES);
    const spinRef = useRef<THREE.Group>(null);
    const reduced = usePrefersReducedMotion();
    // Running count of slow frames. A device that can't keep the spin smooth
    // (software WebGL, a very weak GPU) settles on the still frame instead.
    const slowFrames = useRef(0);
    const settled = useRef(false);

    const { material, sunView } = useMemo(() => {
        const textures = { day, bump, roughness, night };
        prepareEarthTextures(textures);
        const sunView = { value: new THREE.Vector3() };
        return { material: createEarthMaterial(textures, sunView), sunView };
    }, [day, bump, roughness, night]);

    const pin = useMemo(() => createPin(NAIROBI.lat, NAIROBI.lng), []);
    const initialSpin = useMemo(() => spinToFace(NAIROBI.lat, NAIROBI.lng), []);

    useEffect(
        () => () => {
            material.dispose();
            for (const texture of [day, bump, roughness, night]) texture.dispose();
            disposeObject(pin);
        },
        [material, pin, day, bump, roughness, night],
    );

    useFrame((state, delta) => {
        // The camera never moves, but keep the night-side mask honest if it does.
        sunView.value.copy(SUN_DIRECTION).transformDirection(state.camera.matrixWorldInverse);

        const slot = stage.slots.get("globe");
        if (reduced || settled.current || !slot?.visible || !spinRef.current) return;
        slowFrames.current = delta > 0.1 ? slowFrames.current + 1 : Math.max(0, slowFrames.current - 1);
        if (slowFrames.current > 20) {
            settled.current = true;
            return;
        }
        spinRef.current.rotation.y += Math.min(delta, 1 / 30) * SPIN_SPEED;
        state.invalidate();
    });

    return (
        <>
            <ambientLight intensity={0.1} color="#b9c8e6" />
            <directionalLight position={SUN_POSITION} intensity={3.2} color="#fff4e6" />
            <group rotation={EARTH_TILT}>
                <group ref={spinRef} rotation-y={initialSpin}>
                    <mesh material={material}>
                        <sphereGeometry args={[1, 128, 96]} />
                    </mesh>
                    <primitive object={pin} />
                </group>
            </group>
            <SceneReady id="globe" stage={stage} />
        </>
    );
}
