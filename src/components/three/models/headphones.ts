import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/*
 * Over-ear headphones, modelled to scale in metres and resting upright on the
 * floor (y = 0). Satin cream shell, brushed aluminium sliders and yokes,
 * protein-leather cushions, open-mesh fabric inside the cups.
 */

const CUP_RADIUS = 0.04;
const CUP_THICKNESS = 0.04;
const CUP_SCALE_Y = 1.15; // oval cups: 92 mm tall
const CUP_SCALE_Z = 0.97; // 78 mm deep
const CUP_X = 0.062;
const CUP_Y = CUP_RADIUS * CUP_SCALE_Y;
const YOKE_RADIUS = 0.05;
const YOKE_TUBE = 0.0032;
const BAND_HALF_WIDTH = 0.078;
const BAND_END_Y = 0.13;
const BAND_TOP_Y = 0.215;

/** Lathe profile of a puck with rounded rims, ordered bottom to top. */
function roundedDiscProfile(radius: number, thickness: number, edge: number, steps = 10) {
    const half = thickness / 2;
    const points: THREE.Vector2[] = [new THREE.Vector2(0, -half)];
    for (let i = 0; i <= steps; i++) {
        const a = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
        points.push(new THREE.Vector2(radius - edge + edge * Math.cos(a), -half + edge + edge * Math.sin(a)));
    }
    for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * (Math.PI / 2);
        points.push(new THREE.Vector2(radius - edge + edge * Math.cos(a), half - edge + edge * Math.sin(a)));
    }
    points.push(new THREE.Vector2(0, half));
    return points;
}

/** Rounded-rectangle cross-section, centred on the origin. */
function roundedRectShape(width: number, height: number, radius: number) {
    const x = -width / 2;
    const y = -height / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
}

/** Half-ellipse in the XY plane, used as the headband's extrusion path. */
class EllipseArc extends THREE.Curve<THREE.Vector3> {
    constructor(
        private readonly a: number,
        private readonly b: number,
        private readonly centerY: number,
        private readonly t0: number,
        private readonly t1: number,
    ) {
        super();
    }

    getPoint(u: number, target = new THREE.Vector3()) {
        const t = this.t0 + (this.t1 - this.t0) * u;
        return target.set(this.a * Math.cos(t), this.centerY + this.b * Math.sin(t), 0);
    }
}

function rodBetween(from: THREE.Vector3, to: THREE.Vector3, radius: number, material: THREE.Material) {
    const length = from.distanceTo(to);
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
    const rod = new THREE.Mesh(geometry, material);
    rod.position.copy(from).add(to).multiplyScalar(0.5);
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
    return rod;
}

export function createHeadphones(): THREE.Group {
    const shell = new THREE.MeshPhysicalMaterial({
        name: "satin-shell",
        color: "#e6e0d5",
        roughness: 0.46,
        metalness: 0,
        clearcoat: 0.25,
        clearcoatRoughness: 0.55,
    });
    const leather = new THREE.MeshPhysicalMaterial({
        name: "protein-leather",
        color: "#b9a588",
        roughness: 0.4,
        metalness: 0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.42,
        sheen: 0.25,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color("#e9dcc6"),
    });
    const aluminium = new THREE.MeshPhysicalMaterial({
        name: "brushed-aluminium",
        color: "#c9cdd3",
        roughness: 0.3,
        metalness: 1,
    });
    const fabric = new THREE.MeshStandardMaterial({
        name: "mesh-fabric",
        color: "#34312d",
        roughness: 0.95,
        metalness: 0,
    });

    const headphones = new THREE.Group();
    headphones.name = "headphones";

    const cupGeometry = new THREE.LatheGeometry(roundedDiscProfile(CUP_RADIUS, CUP_THICKNESS, 0.011), 64);
    cupGeometry.rotateZ(-Math.PI / 2); // lathe axis Y -> X, outer face at +X

    for (const side of [-1, 1] as const) {
        const cup = new THREE.Group();
        cup.position.set(side * CUP_X, CUP_Y, 0);
        if (side < 0) cup.rotation.y = Math.PI; // mirror: outer face points away from the centre

        const oval = new THREE.Group();
        oval.scale.set(1, CUP_SCALE_Y, CUP_SCALE_Z);
        cup.add(oval);

        oval.add(new THREE.Mesh(cupGeometry, shell));

        // Aluminium trim ring on the outer face.
        const trim = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.0016, 10, 64), aluminium);
        trim.rotation.y = Math.PI / 2;
        trim.position.x = CUP_THICKNESS / 2 + 0.0002;
        oval.add(trim);

        // Cushion on the inner face, with the fabric baffle inside it.
        const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.029, 0.0115, 20, 64), leather);
        cushion.rotation.y = Math.PI / 2;
        cushion.position.x = -CUP_THICKNESS / 2 - 0.007;
        oval.add(cushion);

        const baffle = new THREE.Mesh(new THREE.CircleGeometry(0.024, 48), fabric);
        baffle.rotation.y = -Math.PI / 2;
        baffle.position.x = -CUP_THICKNESS / 2 - 0.002;
        oval.add(baffle);

        // Yoke: a half ring over the cup, pinned at the front and back.
        const yoke = new THREE.Mesh(new THREE.TorusGeometry(YOKE_RADIUS, YOKE_TUBE, 10, 48, Math.PI), aluminium);
        yoke.rotation.y = Math.PI / 2;
        cup.add(yoke);
        for (const end of [-1, 1]) {
            const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.012, 16), aluminium);
            pin.rotation.x = Math.PI / 2;
            pin.position.z = end * (YOKE_RADIUS - 0.006);
            cup.add(pin);
        }

        headphones.add(cup);

        // Slider rod from the yoke up into the hinge block at the band end.
        const yokeTop = new THREE.Vector3(side * CUP_X, CUP_Y + YOKE_RADIUS + YOKE_TUBE * 0.5, 0);
        const bandEnd = new THREE.Vector3(side * BAND_HALF_WIDTH, BAND_END_Y - 0.006, 0);
        headphones.add(rodBetween(yokeTop, bandEnd, 0.0026, aluminium));

        const hinge = new THREE.Mesh(new RoundedBoxGeometry(0.013, 0.02, 0.03, 3, 0.004), shell);
        hinge.position.set(side * BAND_HALF_WIDTH, BAND_END_Y - 0.002, 0);
        headphones.add(hinge);
    }

    // Headband: satin outer band with a leather pad underneath.
    const bandPath = new EllipseArc(BAND_HALF_WIDTH, BAND_TOP_Y - BAND_END_Y, BAND_END_Y, 0, Math.PI);
    const band = new THREE.Mesh(
        new THREE.ExtrudeGeometry(roundedRectShape(0.032, 0.01, 0.0045), {
            steps: 96,
            bevelEnabled: false,
            extrudePath: bandPath,
        }),
        shell,
    );
    headphones.add(band);

    const padInset = 0.0105;
    const padPath = new EllipseArc(
        BAND_HALF_WIDTH - padInset,
        BAND_TOP_Y - BAND_END_Y - padInset,
        BAND_END_Y,
        0.42,
        Math.PI - 0.42,
    );
    const pad = new THREE.Mesh(
        new THREE.ExtrudeGeometry(roundedRectShape(0.026, 0.011, 0.005), {
            steps: 72,
            bevelEnabled: false,
            extrudePath: padPath,
        }),
        leather,
    );
    headphones.add(pad);

    headphones.traverse((node) => {
        node.castShadow = true;
    });
    return headphones;
}
