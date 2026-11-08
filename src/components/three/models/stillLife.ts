/*
 * Shared layout for the hobbies still life, in metres. Object positions are
 * relative to the floor; the floor sits at FLOOR_Y so drei's ContactShadows
 * (whose blur plane is drawn at the world origin) stays inside its camera range.
 * The offline render that produced the poster used these exact values.
 */

export type Vec3 = [number, number, number];

export const FLOOR_Y = -0.1;

export const STILL_LIFE = {
    aspect: 3 / 2,
    view: { fov: 30, position: [0.02, 0.32, 0.92] as Vec3, target: [0.02, 0.06, 0] as Vec3 },
    camera: { position: [-0.15, 0, 0.04] as Vec3, rotationY: 0.5, url: "/models/camera_01/camera_01.glb" },
    headphones: { position: [0.005, 0, -0.1] as Vec3, rotationY: -0.25 },
    dumbbell: { position: [0.19, 0, -0.015] as Vec3, rotationY: -1.0 },
    shadows: { scale: 0.9, blur: 2, far: 0.35, opacity: 0.85, color: "#1b2430", resolution: 512 },
    environment: {
        background: "#4a525e",
        resolution: 256,
        lightformers: [
            // key softbox, upper left
            { intensity: 5.2, position: [-2.5, 3.5, 2.5] as Vec3, scale: [3, 2.2, 1] as Vec3, color: "#ffffff" },
            // fill, right
            { intensity: 1.56, position: [3, 1.5, 2.2] as Vec3, scale: [2.5, 2.5, 1] as Vec3, color: "#ffffff" },
            // rim strip behind
            { intensity: 3.9, position: [0.5, 2.2, -3.5] as Vec3, scale: [4, 0.8, 1] as Vec3, color: "#ffffff" },
            // overhead
            { intensity: 1.95, position: [0, 5, 0] as Vec3, scale: [3, 3, 1] as Vec3, color: "#ffffff" },
            // soft bounce from the floor
            { intensity: 0.78, position: [0, -2, 0.5] as Vec3, scale: [4, 4, 1] as Vec3, color: "#d5e1ee" },
        ],
    },
} as const;

/** Lens glass replaces the asset's transmissive lens so no transmission pass is needed. */
export const LENS_GLASS = { color: "#0c0f14", roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03, ior: 1.6 } as const;
