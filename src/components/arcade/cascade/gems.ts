// Gem palette and silhouettes for Cascade, shared by the canvas renderer
// (through Path2D) and the SVG cover. Every colour also has its own shape, so
// gems stay distinguishable without relying on colour.

export const GEM_COLORS = [
  { name: "Ruby", base: "#ff4d6d", light: "#ffc2cd", dark: "#a3122f" },
  { name: "Topaz", base: "#ffb020", light: "#ffe8b0", dark: "#a36500" },
  { name: "Emerald", base: "#34e07f", light: "#c8ffe0", dark: "#0b8a45" },
  { name: "Aqua", base: "#22d3ee", light: "#c9f7ff", dark: "#0b7f91" },
  { name: "Sapphire", base: "#6d7bff", light: "#dadeff", dark: "#2c35b8" },
  { name: "Amethyst", base: "#e05cff", light: "#f6d1ff", dark: "#8a1fa8" },
] as const;

const f = (n: number) => n.toFixed(2);

function polygon(points: Array<[number, number]>): string {
  return `M${points.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} Z`;
}

/** SVG path for gem `color` centred on 0,0 with outer radius `r`. */
export function gemPath(color: number, r: number): string {
  switch (color) {
    case 0: // diamond
      return polygon([
        [0, -r],
        [r * 0.82, 0],
        [0, r],
        [-r * 0.82, 0],
      ]);
    case 1: // round
      return `M${f(-r)} 0 A${f(r)} ${f(r)} 0 1 0 ${f(r)} 0 A${f(r)} ${f(r)} 0 1 0 ${f(-r)} 0 Z`;
    case 2: // hexagon
      return polygon(
        Array.from({ length: 6 }, (_, k) => {
          const a = ((-90 + 60 * k) * Math.PI) / 180;
          return [Math.cos(a) * r, Math.sin(a) * r] as [number, number];
        }),
      );
    case 3: // triangle
      return polygon([
        [0, -r],
        [r * 0.96, r * 0.74],
        [-r * 0.96, r * 0.74],
      ]);
    case 4: {
      // rounded square
      const s = r * 0.8;
      const c = r * 0.24;
      return (
        `M${f(-s + c)} ${f(-s)} L${f(s - c)} ${f(-s)} Q${f(s)} ${f(-s)} ${f(s)} ${f(-s + c)} ` +
        `L${f(s)} ${f(s - c)} Q${f(s)} ${f(s)} ${f(s - c)} ${f(s)} L${f(-s + c)} ${f(s)} ` +
        `Q${f(-s)} ${f(s)} ${f(-s)} ${f(s - c)} L${f(-s)} ${f(-s + c)} Q${f(-s)} ${f(-s)} ${f(-s + c)} ${f(-s)} Z`
      );
    }
    default: // five-point star
      return polygon(
        Array.from({ length: 10 }, (_, k) => {
          const a = ((-90 + 36 * k) * Math.PI) / 180;
          const rr = k % 2 === 0 ? r : r * 0.5;
          return [Math.cos(a) * rr, Math.sin(a) * rr + r * 0.06] as [number, number];
        }),
      );
  }
}
