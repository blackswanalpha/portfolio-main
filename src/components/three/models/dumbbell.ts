import * as THREE from "three";

/*
 * A 290 mm rubber hex dumbbell, modelled to scale in metres and lying on one
 * flat of its hex heads (y = 0). Chrome handle with a knurled grip, rubber
 * heads, chrome end caps.
 */

const HEAD_LENGTH = 0.075;
const HEAD_ACROSS_FLATS = 0.105;
const HEAD_BEVEL = 0.004;
const HANDLE_RADIUS = 0.0165;
const INNER_HALF = 0.065; // handle half-length between the heads
const GRIP_HALF = 0.05; // knurled section half-length
const AXIS_Y = HEAD_ACROSS_FLATS / 2;

/**
 * Tangent-space normal map of a diamond knurl: two sets of 45 degree grooves
 * forming small pyramids. Repeat it around and along the grip.
 */
export function createKnurlNormalMap(size = 64, strength = 2.2): THREE.DataTexture {
    const height = new Float32Array(size * size);
    const tri = (x: number) => 1 - Math.abs(2 * (x - Math.floor(x)) - 1);
    for (let j = 0; j < size; j++) {
        for (let i = 0; i < size; i++) {
            const u = i / size;
            const v = j / size;
            height[j * size + i] = Math.min(tri(u + v), tri(u - v));
        }
    }
    const data = new Uint8Array(size * size * 4);
    const at = (i: number, j: number) => height[((j + size) % size) * size + ((i + size) % size)];
    for (let j = 0; j < size; j++) {
        for (let i = 0; i < size; i++) {
            const dx = (at(i + 1, j) - at(i - 1, j)) * strength;
            const dy = (at(i, j + 1) - at(i, j - 1)) * strength;
            const n = new THREE.Vector3(-dx, -dy, 1).normalize();
            const o = (j * size + i) * 4;
            data[o] = Math.round((n.x * 0.5 + 0.5) * 255);
            data[o + 1] = Math.round((n.y * 0.5 + 0.5) * 255);
            data[o + 2] = Math.round((n.z * 0.5 + 0.5) * 255);
            data[o + 3] = 255;
        }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
}

function hexHeadGeometry() {
    // Flat-bottomed hexagon; ExtrudeGeometry grows the outline by the bevel,
    // so the profile is inset to keep the real across-flats size.
    const circumradius = (HEAD_ACROSS_FLATS / 2 - HEAD_BEVEL) / Math.cos(Math.PI / 6);
    const shape = new THREE.Shape();
    for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        const x = circumradius * Math.cos(a);
        const y = circumradius * Math.sin(a);
        if (k === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    const depth = HEAD_LENGTH - 2 * HEAD_BEVEL;
    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: HEAD_BEVEL,
        bevelSize: HEAD_BEVEL,
        bevelSegments: 3,
        curveSegments: 1,
    });
    geometry.translate(0, 0, -depth / 2);
    geometry.rotateY(Math.PI / 2); // extrusion axis Z -> X, flat face stays at the bottom
    geometry.computeVertexNormals();
    return geometry;
}

export function createDumbbell(): THREE.Group {
    const knurl = createKnurlNormalMap();
    // Circumference ~104 mm and grip 100 mm: a ~3 mm pitch reads at this scale.
    knurl.repeat.set(34, 32);

    const chrome = new THREE.MeshPhysicalMaterial({
        name: "chrome",
        color: "#dfe3e8",
        metalness: 1,
        roughness: 0.12,
    });
    const knurled = new THREE.MeshPhysicalMaterial({
        name: "knurled-steel",
        color: "#d3d7dc",
        metalness: 1,
        roughness: 0.34,
        normalMap: knurl,
        normalScale: new THREE.Vector2(0.9, 0.9),
    });
    const rubber = new THREE.MeshPhysicalMaterial({
        name: "rubber",
        color: "#27292e",
        metalness: 0,
        roughness: 0.62,
        sheen: 0.35,
        sheenRoughness: 0.7,
        sheenColor: new THREE.Color("#3a3d44"),
    });

    const dumbbell = new THREE.Group();
    dumbbell.name = "dumbbell";

    const axis = new THREE.Group();
    axis.position.y = AXIS_Y;
    dumbbell.add(axis);

    const grip = new THREE.Mesh(new THREE.CylinderGeometry(HANDLE_RADIUS, HANDLE_RADIUS, GRIP_HALF * 2, 48), knurled);
    grip.rotation.z = Math.PI / 2;
    axis.add(grip);

    const head = hexHeadGeometry();
    for (const side of [-1, 1]) {
        const collar = new THREE.Mesh(
            new THREE.CylinderGeometry(HANDLE_RADIUS + 0.0012, HANDLE_RADIUS + 0.0012, INNER_HALF - GRIP_HALF, 48),
            chrome,
        );
        collar.rotation.z = Math.PI / 2;
        collar.position.x = side * (GRIP_HALF + (INNER_HALF - GRIP_HALF) / 2);
        axis.add(collar);

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.021, 0.0028, 12, 48), chrome);
        ring.rotation.y = Math.PI / 2;
        ring.position.x = side * (INNER_HALF + 0.0008);
        axis.add(ring);

        const hex = new THREE.Mesh(head, rubber);
        hex.position.x = side * (INNER_HALF + HEAD_LENGTH / 2);
        axis.add(hex);

        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.003, 48), chrome);
        cap.rotation.z = Math.PI / 2;
        cap.position.x = side * (INNER_HALF + HEAD_LENGTH + 0.0012);
        axis.add(cap);
    }

    dumbbell.traverse((node) => {
        node.castShadow = true;
    });
    return dumbbell;
}
