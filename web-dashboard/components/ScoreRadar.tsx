"use client";

import { useEffect, useState, useId, useRef, useCallback } from "react";
import { ScoreBreakdown } from "@/lib/types";

interface ScoreRadarProps {
  before: ScoreBreakdown | null;
  after: ScoreBreakdown | null;
  accent: string;
  size?: number;
  showLabels?: boolean;
  interactive?: boolean;
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

const DIM_FULL: Record<string, string> = {
  specificity: "Specificity",
  verification: "Verification",
  context: "Context",
  constraints: "Constraints",
  structure: "Structure",
  output_definition: "Output",
};

function polarToXY(angle: number, radius: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function shapePath(scores: Record<string, number>, maxR: number, cx: number, cy: number, rotation: number = 0): string {
  return DIMS.map((dim, i) => {
    const angle = (360 / DIMS.length) * i + rotation;
    const val = (scores[dim] || 1) / 5;
    const { x, y } = polarToXY(angle, val * maxR, cx, cy);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

function centerPath(cx: number, cy: number): string {
  return DIMS.map(() => `${cx.toFixed(1)},${cy.toFixed(1)}`).map((p, i) => `${i === 0 ? "M" : "L"}${p}`).join(" ") + " Z";
}

export function ScoreRadar({ before, after, accent, size = 56, showLabels = false, interactive = false }: ScoreRadarProps) {
  const [animated, setAnimated] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hoveredDim, setHoveredDim] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, angle: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, angle: rotation });
  }, [interactive, rotation]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    const dx = e.clientX - dragStart.x;
    setRotation(dragStart.angle + dx * 0.5);
  }, [isDragging, dragStart, interactive]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const up = () => setIsDragging(false);
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, [isDragging]);

  if (!before && !after) return null;

  const svgSize = size + (showLabels ? 56 : 0);
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const maxR = size / 2 - 4;

  const beforeDims = before?.dimensions || { specificity: 1, verification: 1, context: 1, constraints: 1, structure: 1, output_definition: 1 };
  const afterDims = after?.dimensions || beforeDims;

  const beforePath = shapePath(beforeDims, maxR, cx, cy, rotation);
  const afterPath = shapePath(afterDims, maxR, cx, cy, rotation);
  const zeroPath = centerPath(cx, cy);

  const filterId = `glow-${uid}`;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className={`shrink-0 ${interactive ? "cursor-grab" : ""} ${isDragging ? "cursor-grabbing" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsDragging(false); setHoveredDim(null); }}
      >
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
        {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
          <polygon
            key={r}
            points={DIMS.map((_, i) => {
              const angle = (360 / DIMS.length) * i + rotation;
              const { x, y } = polarToXY(angle, r * maxR, cx, cy);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
        ))}

        {/* Axis lines */}
        {DIMS.map((dim, i) => {
          const angle = (360 / DIMS.length) * i + rotation;
          const { x, y } = polarToXY(angle, maxR, cx, cy);
          const isHovered = hoveredDim === dim;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={isHovered ? `${accent}60` : "rgba(255,255,255,0.05)"} strokeWidth={isHovered ? 1.5 : 0.5} />
              {interactive && (
                <line x1={cx} y1={cy} x2={x} y2={y} stroke="transparent" strokeWidth="20"
                  onMouseEnter={() => setHoveredDim(dim)} onMouseLeave={() => setHoveredDim(null)} style={{ cursor: "pointer" }} />
              )}
            </g>
          );
        })}

        {/* Labels */}
        {showLabels && DIMS.map((dim, i) => {
          const angle = (360 / DIMS.length) * i + rotation;
          const labelR = maxR + 16;
          const { x, y } = polarToXY(angle, labelR, cx, cy);
          const improved = (afterDims[dim] || 0) > (beforeDims[dim] || 0);
          const isHovered = hoveredDim === dim;
          return (
            <text key={dim} x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fill={isHovered ? "#fff" : improved ? accent : "rgba(255,255,255,0.35)"}
              fontSize={isHovered ? "11" : "9"} fontWeight={isHovered ? "800" : improved ? "600" : "400"} fontFamily="Inter, sans-serif"
              style={{ opacity: animated ? 1 : 0, transition: `opacity 0.4s ease ${0.3 + i * 0.05}s, font-size 0.2s ease, fill 0.2s ease`, cursor: interactive ? "pointer" : undefined }}
              onMouseEnter={() => interactive && setHoveredDim(dim)} onMouseLeave={() => interactive && setHoveredDim(null)}
            >
              {DIM_SHORT[dim]}
            </text>
          );
        })}

        {/* Before shape */}
        <path d={animated ? beforePath : zeroPath} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 2"
          style={{ opacity: animated ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }} />

        {/* After shape with glow */}
        <path d={animated ? afterPath : zeroPath} fill={`${accent}18`} stroke={accent} strokeWidth="1.5" filter={`url(#${filterId})`}
          style={{ opacity: animated ? 1 : 0, transition: "opacity 0.5s ease 0.2s" }} />

        {/* Dots on after shape */}
        {showLabels && DIMS.map((dim, i) => {
          const angle = (360 / DIMS.length) * i + rotation;
          const val = (afterDims[dim] || 1) / 5;
          const { x, y } = polarToXY(angle, val * maxR, cx, cy);
          const isHovered = hoveredDim === dim;
          return (
            <circle key={`dot-${dim}`} cx={animated ? x : cx} cy={animated ? y : cy} r={isHovered ? 5 : 2.5}
              fill={isHovered ? "#fff" : accent} opacity={animated ? 0.9 : 0}
              style={{ transition: `cx 0.15s ease, cy 0.15s ease, r 0.2s ease, opacity 0.4s ease ${0.3 + i * 0.06}s`, cursor: interactive ? "pointer" : undefined }}
              onMouseEnter={() => interactive && setHoveredDim(dim)} onMouseLeave={() => interactive && setHoveredDim(null)}
            >
              {!interactive && <animate attributeName="r" values="2.5;4;2.5" dur="0.5s" begin={`${0.7 + i * 0.06}s`} repeatCount="1" />}
            </circle>
          );
        })}

        <circle cx={cx} cy={cy} r="1.5" fill={accent} opacity={animated ? 0.5 : 0} style={{ transition: "opacity 0.3s ease" }} />
      </svg>

      {/* Hover tooltip */}
      {interactive && hoveredDim && (
        <div className="absolute top-0 right-0 bg-[rgba(0,0,0,0.85)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 pointer-events-none z-10 animate-fade-in" style={{ minWidth: 140 }}>
          <p className="text-[11px] font-bold text-white mb-2">{DIM_FULL[hoveredDim]}</p>
          <div className="flex items-center gap-3 text-[11px]">
            <div>
              <span className="text-zinc-500">Before</span>
              <span className="ml-2 font-mono font-bold text-zinc-300">{(beforeDims[hoveredDim as keyof typeof beforeDims] || 0).toFixed(1)}</span>
            </div>
            <span className="text-zinc-600">{"\u2192"}</span>
            <div>
              <span className="text-zinc-500">After</span>
              <span className="ml-2 font-mono font-bold" style={{ color: accent }}>{(afterDims[hoveredDim as keyof typeof afterDims] || 0).toFixed(1)}</span>
            </div>
          </div>
          <div className="mt-1.5 w-full h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${((afterDims[hoveredDim as keyof typeof afterDims] || 0) / 5) * 100}%`, backgroundColor: accent }} />
          </div>
        </div>
      )}
    </div>
  );
}
