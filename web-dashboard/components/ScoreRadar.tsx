"use client";

import { ScoreBreakdown } from "@/lib/types";

interface ScoreRadarProps {
  before: ScoreBreakdown | null;
  after: ScoreBreakdown | null;
  accent: string;
  size?: number;
}

const DIMS: (keyof ScoreBreakdown["dimensions"])[] = [
  "specificity", "verification", "context",
  "constraints", "structure", "output_definition",
];

function polarToXY(angle: number, radius: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function shapePath(scores: Record<string, number>, maxR: number, cx: number, cy: number): string {
  return DIMS.map((dim, i) => {
    const angle = (360 / DIMS.length) * i;
    const val = (scores[dim] || 1) / 5;
    const { x, y } = polarToXY(angle, val * maxR, cx, cy);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

export function ScoreRadar({ before, after, accent, size = 56 }: ScoreRadarProps) {
  if (!before && !after) return null;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 4;

  const beforeDims = before?.dimensions || { specificity: 1, verification: 1, context: 1, constraints: 1, structure: 1, output_definition: 1 };
  const afterDims = after?.dimensions || beforeDims;

  const beforePath = shapePath(beforeDims, maxR, cx, cy);
  const afterPath = shapePath(afterDims, maxR, cx, cy);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {/* Grid rings */}
      {[0.33, 0.66, 1].map((r) => (
        <polygon
          key={r}
          points={DIMS.map((_, i) => {
            const angle = (360 / DIMS.length) * i;
            const { x, y } = polarToXY(angle, r * maxR, cx, cy);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="0.5"
        />
      ))}

      {/* Axis lines */}
      {DIMS.map((_, i) => {
        const angle = (360 / DIMS.length) * i;
        const { x, y } = polarToXY(angle, maxR, cx, cy);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />;
      })}

      {/* Before shape */}
      <path d={beforePath} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      {/* After shape with glow */}
      <defs>
        <filter id={`glow-${accent.replace('#', '')}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={afterPath}
        fill={`${accent}15`}
        stroke={accent}
        strokeWidth="1.5"
        filter={`url(#glow-${accent.replace('#', '')})`}
        className="transition-all duration-700"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="1.5" fill={accent} opacity="0.6" />
    </svg>
  );
}
