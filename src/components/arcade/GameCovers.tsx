// Cover art for the game picker: small hand-built SVG scenes in each game's
// palette, on the same dark stage colour the games use.

import type { ReactElement, ReactNode } from "react";
import { GEM_COLORS, gemPath } from "./cascade/gems";

const BG = "#0a0e1a";

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 320 180" width="100%" height="100%" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill={BG} />
      {children}
    </svg>
  );
}

/** Concentric translucent discs: a glow without filters or gradients. */
function Glow({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} opacity={0.08} />
      <circle cx={x} cy={y} r={r * 0.66} fill={color} opacity={0.12} />
      <circle cx={x} cy={y} r={r * 0.4} fill={color} opacity={0.2} />
    </g>
  );
}

export function SokobanCover() {
  const tiles: ReactElement[] = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 7; x++) {
      tiles.push(
        <rect
          key={`${x}-${y}`}
          x={20 + x * 40}
          y={30 + y * 40}
          width={38}
          height={38}
          rx={5}
          fill={(x + y) % 2 ? "#141b33" : "#10162b"}
        />,
      );
    }
  }
  return (
    <Frame label="Sokoban: a robot pushing crates onto targets">
      <g>{tiles}</g>
      <Glow x={219} y={89} r={40} color="#5a97db" />
      <circle cx={219} cy={89} r={13} fill="none" stroke="#5a97db" strokeWidth={3} />
      <circle cx={219} cy={89} r={4} fill="#5a97db" />
      {/* crate being pushed */}
      <rect x={144} y={73} width={34} height={34} rx={5} fill="#b5743f" stroke="#6b3d1e" strokeWidth={2.5} />
      <path d="M150 79 L172 101" stroke="#8a5230" strokeWidth={4} strokeLinecap="round" />
      {/* crate already home */}
      <Glow x={99} y={129} r={36} color="#34d399" />
      <rect x={82} y={112} width={34} height={34} rx={5} fill="#3fb86a" stroke="#1e6b31" strokeWidth={2.5} />
      <path d="M88 118 L110 140" stroke="#2f8f46" strokeWidth={4} strokeLinecap="round" />
      {/* robot */}
      <circle cx={119} cy={83} r={11} fill="#5a97db" stroke="#1c467a" strokeWidth={2} />
      <circle cx={115} cy={82} r={2.6} fill="#fff" />
      <circle cx={123} cy={82} r={2.6} fill="#fff" />
      <rect x={110} y={95} width={18} height={14} rx={4} fill="#2e6eb8" stroke="#1c467a" strokeWidth={2} />
      <path d="M119 72 L119 66" stroke="#1c467a" strokeWidth={2} />
      <circle cx={119} cy={64} r={2.5} fill="#22c55e" />
    </Frame>
  );
}

export function CircuitCover() {
  const sockets: ReactElement[] = [];
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 7; x++) {
      sockets.push(<rect key={`${x}-${y}`} x={22 + x * 40} y={12 + y * 40} width={36} height={36} rx={6} fill="#0f1529" />);
    }
  }
  // Powered links (cell centres at 40 + 40x, 30 + 40y).
  const link = (x1: number, y1: number, x2: number, y2: number, color: string, key: string) => (
    <g key={key}>
      <line x1={40 + x1 * 40} y1={30 + y1 * 40} x2={40 + x2 * 40} y2={30 + y2 * 40} stroke={color} strokeWidth={14} opacity={0.18} strokeLinecap="round" />
      <line x1={40 + x1 * 40} y1={30 + y1 * 40} x2={40 + x2 * 40} y2={30 + y2 * 40} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <line x1={40 + x1 * 40} y1={30 + y1 * 40} x2={40 + x2 * 40} y2={30 + y2 * 40} stroke="#fff" strokeWidth={2} opacity={0.8} strokeLinecap="round" />
    </g>
  );
  const lamp = (x: number, y: number, color: string) => (
    <g key={`lamp-${x}-${y}`}>
      <Glow x={40 + x * 40} y={30 + y * 40} r={26} color={color} />
      <circle cx={40 + x * 40} cy={30 + y * 40} r={8} fill={color} />
      <circle cx={40 + x * 40} cy={30 + y * 40} r={3.5} fill="#fff" />
    </g>
  );
  return (
    <Frame label="Circuit: glowing power lines lighting lamps across a grid">
      <g>{sockets}</g>
      <Glow x={160} y={110} r={90} color="#22d3ee" />
      {link(3, 2, 1, 2, "#22d3ee", "a")}
      {link(1, 2, 1, 0, "#60a5fa", "b")}
      {link(1, 0, 0, 0, "#818cf8", "c")}
      {link(3, 2, 3, 1, "#38bdf8", "d")}
      {link(3, 1, 5, 1, "#a78bfa", "e")}
      {link(5, 1, 5, 3, "#e879f9", "f")}
      {link(5, 3, 6, 3, "#f472b6", "g")}
      {link(5, 1, 6, 1, "#c084fc", "h")}
      {/* unpowered */}
      <line x1={80} y1={150} x2={160} y2={150} stroke="#2a3354" strokeWidth={8} strokeLinecap="round" />
      <circle cx={80} cy={150} r={7} fill="#141a33" stroke="#3b4570" strokeWidth={2} />
      {lamp(0, 0, "#818cf8")}
      {lamp(6, 3, "#f472b6")}
      {lamp(6, 1, "#c084fc")}
      <polygon points="160,94 174,102 174,118 160,126 146,118 146,102" fill="#e6fcff" stroke="#22d3ee" strokeWidth={3} />
      <circle cx={160} cy={110} r={5} fill="#22d3ee" />
    </Frame>
  );
}

export function CascadeCover() {
  const layout = [
    [0, 3, 1, 4, 2, 5, 0],
    [2, 2, 5, 2, 1, 3, 4],
    [4, 1, 3, 0, 5, 0, 1],
    [3, 5, 0, 4, 3, 2, 5],
  ];
  const gems: ReactElement[] = [];
  layout.forEach((row, y) =>
    row.forEach((color, x) => {
      const cx = 40 + x * 40;
      const cy = 30 + y * 40;
      const lit = y === 1 && x <= 3;
      gems.push(
        <g key={`${x}-${y}`} transform={`translate(${cx} ${cy})`}>
          {lit ? <Glow x={0} y={0} r={26} color={GEM_COLORS[color].base} /> : <g />}
          <path d={gemPath(color, 15)} fill={GEM_COLORS[color].base} stroke={GEM_COLORS[color].dark} strokeWidth={2} />
          <path d={gemPath(color, 8)} fill={GEM_COLORS[color].light} opacity={0.55} transform="translate(-2 -3)" />
        </g>,
      );
    }),
  );
  return (
    <Frame label="Cascade: a board of bright gems with a line about to clear">
      <rect x={18} y={8} width={284} height={164} rx={8} fill="#0f1529" />
      <g>{gems}</g>
      <rect x={20} y={56} width={160} height={28} rx={14} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={2} />
      <circle cx={186} cy={52} r={3} fill="#fff" />
      <circle cx={196} cy={44} r={2} fill="#fff" opacity={0.8} />
      <circle cx={178} cy={40} r={1.6} fill="#fff" opacity={0.7} />
    </Frame>
  );
}

export function ShatterCover() {
  const colors = ["#fb7185", "#fb923c", "#fbbf24", "#a3e635", "#22d3ee"];
  const bricks: ReactElement[] = [];
  colors.forEach((color, row) => {
    for (let col = 0; col < 8; col++) {
      if (row === 3 && (col === 4 || col === 5)) continue; // a gap the ball broke
      bricks.push(
        <rect key={`${row}-${col}`} x={20 + col * 36} y={18 + row * 15} width={33} height={12} rx={3} fill={color} opacity={0.92} />,
      );
    }
  });
  return (
    <Frame label="Shatter: a ball breaking through rows of neon bricks">
      <g>{bricks}</g>
      <Glow x={176} y={70} r={30} color="#a3e635" />
      <rect x={166} y={68} width={7} height={4} fill="#a3e635" transform="rotate(25 166 68)" />
      <rect x={192} y={78} width={6} height={3} fill="#a3e635" transform="rotate(-30 192 78)" />
      <rect x={180} y={86} width={5} height={3} fill="#a3e635" transform="rotate(60 180 86)" />
      {/* ball trail */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={120 - i * 12} cy={128 + i * 9} r={6 - i} fill="#e0f2fe" opacity={0.5 - i * 0.09} />
      ))}
      <Glow x={132} y={119} r={22} color="#e0f2fe" />
      <circle cx={132} cy={119} r={6.5} fill="#ffffff" />
      <Glow x={110} y={164} r={40} color="#22d3ee" />
      <rect x={78} y={159} width={64} height={9} rx={4.5} fill="#22d3ee" />
    </Frame>
  );
}
