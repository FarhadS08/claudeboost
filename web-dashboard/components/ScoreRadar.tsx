"use client";

import { useEffect, useState, useId } from "react";
import { ScoreBreakdown } from "@/lib/types";

interface ScoreRadarProps {
  before: ScoreBreakdown | null;
  after: ScoreBreakdown | null;
  accent: string;
  size?: number;
  showLabels?: boolean;
}

const DIMS: (keyof ScoreBreakdown["dimensions"])[] = [
  "specificity", "verification", "context",
  "constraints", "structure", "output_definition",
];

const DIM_SHORT: Record<string, string> = {
  specificity: "Spec",
  verification: "Verify",
  context: "Context",
  constraints: "Bounds",
  structure: "Struct",
  output_definition: "Output",
};

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

function centerPath(cx: number, cy: number): string {
  return DIMS.map((_, i) => {
    const angle = (360 / DIMS.length) * i;
    return `${i === 0 ? "M" : "L"}${cx.toFixed(1)},${cy.toFixed(1)}`;
  }).join(" ") + " Z";
}

export function ScoreRadar({ before, after, accent, size = 56, showLabels = false }: ScoreRadarProps) {
  const [animated, setAnimated] = useState(false);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!before && !after) return null;

  const svgSize = size + (showLabels ? 56 : 0);
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const maxR = size / 2 - 4;

  const beforeDims = before?.dimensions || { specificity: 1, verification: 1, context: 1, constraints: 1, structure: 1, output_definition: 1 };
  const afterDims = after?.dimensions || beforeDims;

  const beforePath = shapePath(beforeDims, maxR, cx, cy);
  const afterPath = shapePath(afterDims, maxR, cx, cy);
  const zeroPath = centerPath(cx, cy);

  const filterId = `glow-${uid}`;

  return (
    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="shrink-0">
      <defs>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

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
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.5"
        />
      ))}

      {/* Axis lines */}
      {DIMS.map((_, i) => {
        const angle = (360 / DIMS.length) * i;
        const { x, y } = polarToXY(angle, maxR, cx, cy);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />;
      })}

      {/* Dimension labels */}
      {showLabels && DIMS.map((dim, i) => {
        const angle = (360 / DIMS.length) * i;
        const labelR = maxR + 16;
        const { x, y } = polarToXY(angle, labelR, cx, cy);
        const improved = (afterDims[dim] || 0) > (beforeDims[dim] || 0);
        return (
          <text
            key={dim}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={improved ? accent : "rgba(255,255,255,0.35)"}
            fontSize="9"
            fontWeight={improved ? "600" : "400"}
            fontFamily="Inter, sans-serif"
            style={{ opacity: animated ? 1 : 0, transition: `opacity 0.4s ease ${0.3 + i * 0.05}s` }}
          >
            {DIM_SHORT[dim]}
          </text>
        );
      })}

      {/* Before shape — fades in */}
      <path
        d={beforePath}
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
        strokeDasharray="3 2"
        style={{ opacity: animated ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}
      />

      {/* After shape — blooms from center */}
      <path
        d={animated ? afterPath : zeroPath}
        fill={`${accent}18`}
        stroke={accent}
        strokeWidth="1.5"
        filter={`url(#${filterId})`}
        style={{ transition: "d 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, opacity 0.5s ease 0.2s", opacity: animated ? 1 : 0 }}
      />

      {/* Dots on after shape — appear with stagger + pulse */}
      {showLabels && DIMS.map((dim, i) => {
        const angle = (360 / DIMS.length) * i;
        const val = (afterDims[dim] || 1) / 5;
        const { x, y } = polarToXY(angle, val * maxR, cx, cy);
        return (
          <circle
            key={`dot-${dim}`}
            cx={animated ? x : cx}
            cy={animated ? y : cy}
            r="2.5"
            fill={accent}
            opacity={animated ? 0.9 : 0}
            style={{ transition: `cx 0.7s cubic-bezier(0.16,1,0.3,1) ${0.25 + i * 0.06}s, cy 0.7s cubic-bezier(0.16,1,0.3,1) ${0.25 + i * 0.06}s, opacity 0.4s ease ${0.3 + i * 0.06}s` }}
          >
            {/* Pulse once */}
            <animate attributeName="r" values="2.5;4;2.5" dur="0.5s" begin={`${0.7 + i * 0.06}s`} repeatCount="1" />
          </circle>
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="1.5" fill={accent} opacity={animated ? 0.5 : 0} style={{ transition: "opacity 0.3s ease" }} />
    </svg>
  );
}
