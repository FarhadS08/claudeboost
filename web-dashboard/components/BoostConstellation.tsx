"use client";

import { useEffect, useRef, useState } from "react";
import { HistoryEntry, Domain } from "@/lib/types";
import { DOMAIN_COLORS, DOMAIN_LABELS } from "@/lib/constants";

interface BoostConstellationProps {
  entries: HistoryEntry[];
  height?: number;
}

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  domain: Domain;
  score: number;
  delta: number;
  radius: number;
  original: string;
  accent: string;
}

const DOMAIN_CENTERS: Record<string, { x: number; y: number }> = {
  data_science: { x: 0.2, y: 0.3 },
  data_engineering: { x: 0.5, y: 0.15 },
  business_analytics: { x: 0.8, y: 0.3 },
  general_coding: { x: 0.3, y: 0.7 },
  documentation: { x: 0.7, y: 0.7 },
  devops: { x: 0.5, y: 0.85 },
  other: { x: 0.5, y: 0.5 },
};

export function BoostConstellation({ entries, height = 400 }: BoostConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState<Node | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: height });

  // Initialize nodes from entries
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.parentElement?.clientWidth || 800;
    setDimensions({ w, h: height });
    canvas.width = w * 2; // retina
    canvas.height = height * 2;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${height}px`;

    nodesRef.current = entries.map((entry, i) => {
      const dc = DOMAIN_COLORS[entry.domain] || DOMAIN_COLORS.other;
      const center = DOMAIN_CENTERS[entry.domain] || DOMAIN_CENTERS.other;
      const delta = entry.boosted_score && entry.original_score
        ? entry.boosted_score.total - entry.original_score.total : 5;
      const score = entry.boosted_score?.total || 15;

      return {
        id: entry.id,
        x: center.x * w + (Math.random() - 0.5) * w * 0.15,
        y: center.y * height + (Math.random() - 0.5) * height * 0.15,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        domain: entry.domain,
        score,
        delta,
        radius: Math.max(4, Math.min(16, delta * 1.2 + 3)),
        original: entry.original.slice(0, 50) + (entry.original.length > 50 ? "..." : ""),
        accent: dc.accent,
      };
    });
  }, [entries, height]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = dimensions.w;
    const h = dimensions.h;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w * 2, h * 2);
      ctx.save();
      ctx.scale(2, 2); // retina

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      // Physics: attract to domain centers, repel from each other, drift
      for (const node of nodes) {
        const center = DOMAIN_CENTERS[node.domain] || DOMAIN_CENTERS.other;
        const cx = center.x * w;
        const cy = center.y * h;

        // Attract to domain center
        node.vx += (cx - node.x) * 0.001;
        node.vy += (cy - node.y) * 0.001;

        // Mouse repulsion
        if (mouse) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80 && dist > 0) {
            const force = (80 - dist) / 80 * 2;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }
        }

        // Repel from other nodes
        for (const other of nodes) {
          if (other.id === node.id) continue;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = node.radius + other.radius + 4;
          if (dist < minDist && dist > 0) {
            const force = (minDist - dist) / minDist * 0.5;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }
        }

        // Damping
        node.vx *= 0.95;
        node.vy *= 0.95;

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounds
        node.x = Math.max(node.radius, Math.min(w - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(h - node.radius, node.y));
      }

      // Draw connections between same-domain nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].domain !== nodes[j].domain) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `${nodes[i].accent}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        // Glow
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3);
        grad.addColorStop(0, `${node.accent}20`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${node.accent}90`;
        ctx.fill();

        // Inner bright dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `${node.accent}`;
        ctx.fill();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [dimensions]);

  // Mouse tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current = { x, y };

    // Find hovered node
    const nodes = nodesRef.current;
    let found: Node | null = null;
    for (const node of nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 5) {
        found = node;
        break;
      }
    }
    setHovered(found);
  };

  const handleMouseLeave = () => {
    mouseRef.current = null;
    setHovered(null);
  };

  if (entries.length === 0) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.06)]">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full cursor-crosshair"
        style={{ height }}
      />

      {/* Domain legend */}
      <div className="absolute bottom-3 left-4 flex flex-wrap gap-3">
        {Object.entries(
          entries.reduce<Record<string, number>>((acc, e) => {
            acc[e.domain] = (acc[e.domain] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1]).map(([domain, count]) => {
          const dc = DOMAIN_COLORS[domain as Domain] || DOMAIN_COLORS.other;
          return (
            <div key={domain} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dc.accent }} />
              <span className="text-[9px] text-zinc-500 font-medium">{DOMAIN_LABELS[domain as Domain]} ({count})</span>
            </div>
          );
        })}
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none bg-[rgba(0,0,0,0.9)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 z-10"
          style={{
            left: Math.min(hovered.x, dimensions.w - 200),
            top: Math.max(0, hovered.y - 70),
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hovered.accent }} />
            <span className="text-[10px] font-bold" style={{ color: hovered.accent }}>{DOMAIN_LABELS[hovered.domain]}</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">{hovered.original}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-mono text-zinc-500">{hovered.score}/30</span>
            {hovered.delta > 0 && (
              <span className="text-[10px] font-mono font-bold text-emerald-400">+{hovered.delta}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
