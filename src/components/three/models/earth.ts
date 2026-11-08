import * as THREE from "three";

/** Nairobi, Kenya. */
export const NAIROBI = { lat: -1.2921, lng: 36.8219 };

/** Direction toward the sun in view space terms: upper left, in front of the globe. */
export const SUN_DIRECTION = new THREE.Vector3(-0.9, 0.3, 0.9).normalize();

/** Earth's axial tilt plus a slight lean toward the viewer. */
export const EARTH_TILT = new THREE.Euler(0.2, 0, -0.41);

/**
 * Unit vector for a latitude/longitude on THREE.SphereGeometry's UV layout
 * (u = 0 at -180 degrees, increasing eastward).
 */
export function latLngToVector(lat: number, lng: number, radius = 1) {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lng + 180) * Math.PI) / 180;
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
    );
}

/**
 * Spin (rotation about the tilted axis) that puts a point at the front of the
 * globe, nudged left by `offset` radians so it sits in the sunlit half.
 */
export function spinToFace(lat: number, lng: number, offset = 0.3) {
    const n = latLngToVector(lat, lng);
    return Math.atan2(n.z, n.x) - (Math.PI / 2 + offset);
}

export interface EarthTextures {
    day: THREE.Texture;
    bump: THREE.Texture;
    roughness: THREE.Texture;
    night: THREE.Texture;
}

/** Configure loaded textures: colour maps are sRGB, data maps stay linear. */
export function prepareEarthTextures({ day, bump, roughness, night }: EarthTextures, anisotropy = 8) {
    day.colorSpace = THREE.SRGBColorSpace;
    night.colorSpace = THREE.SRGBColorSpace;
    bump.colorSpace = THREE.NoColorSpace;
    roughness.colorSpace = THREE.NoColorSpace;
    for (const texture of [day, bump, roughness, night]) {
        texture.anisotropy = anisotropy;
        texture.needsUpdate = true;
    }
}

/**
 * Physically based Earth surface: Blue Marble albedo, SRTM relief as a bump
 * map, a land/water mask driving roughness (satin oceans at 0.5, matte land at
 * 0.9), and city lights that only show on the night side of the terminator.
 *
 * `sunDirectionView` must hold the sun direction in view space; update it when
 * the camera moves.
 */
export function createEarthMaterial(textures: EarthTextures, sunDirectionView: { value: THREE.Vector3 }) {
    const material = new THREE.MeshPhysicalMaterial({
        // Half the default dielectric reflectance: the sun on the oceans reads
        // as a soft sheen rather than a bright hot spot.
        specularIntensity: 0.45,
        map: textures.day,
        bumpMap: textures.bump,
        bumpScale: 2.5,
        roughnessMap: textures.roughness,
        roughness: 1,
        metalness: 0,
        emissiveMap: textures.night,
        emissive: new THREE.Color("#ffc98a"),
        emissiveIntensity: 1.6,
    });
    material.onBeforeCompile = (shader) => {
        shader.uniforms.uSunDirView = sunDirectionView;
        shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", "#include <common>\nuniform vec3 uSunDirView;")
            .replace(
                "#include <emissivemap_fragment>",
                `#ifdef USE_EMISSIVEMAP
                    vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
                    float sunFacing = dot( normalize( vNormal ), uSunDirView );
                    float nightSide = 1.0 - smoothstep( -0.12, 0.08, sunFacing );
                    totalEmissiveRadiance *= emissiveColor.rgb * nightSide;
                #endif`,
            );
    };
    material.customProgramCacheKey = () => "earth-night-lights";
    return material;
}

/** A small, quiet map pin standing on the surface at a lat/lng. */
export function createPin(lat: number, lng: number, color = "#2e6eb8") {
    const normal = latLngToVector(lat, lng);
    const pin = new THREE.Group();
    pin.name = "pin";
    pin.position.copy(normal);
    pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    const stemHeight = 0.05;
    const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0035, 0.0035, stemHeight, 12),
        new THREE.MeshStandardMaterial({ color: "#d9dde3", roughness: 0.3, metalness: 0.6 }),
    );
    stem.position.y = stemHeight / 2;
    pin.add(stem);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 24, 16),
        new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0 }),
    );
    head.position.y = stemHeight;
    pin.add(head);
    return pin;
}
