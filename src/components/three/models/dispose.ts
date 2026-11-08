import * as THREE from "three";

const TEXTURE_KEYS = [
    "map",
    "normalMap",
    "bumpMap",
    "roughnessMap",
    "metalnessMap",
    "emissiveMap",
    "aoMap",
    "alphaMap",
    "clearcoatNormalMap",
    "sheenColorMap",
] as const;

/**
 * Free the GPU resources of an object tree built imperatively (geometries,
 * materials and their textures). R3F only disposes what it created from JSX, so
 * the procedural models and loaded assets go through this on unmount.
 */
export function disposeObject(root: THREE.Object3D) {
    root.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const materials = mesh.material
            ? Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material]
            : [];
        for (const material of materials) {
            const record = material as unknown as Record<string, unknown>;
            for (const key of TEXTURE_KEYS) {
                const texture = record[key];
                if (texture instanceof THREE.Texture) texture.dispose();
            }
            material.dispose();
        }
    });
}
