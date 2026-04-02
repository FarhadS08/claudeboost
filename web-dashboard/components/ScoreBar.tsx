"use client";

import { useEffect, useState, useRef } from "react";

interface ScoreBarProps {
  label: string;
  before: number;
  after: number;
  accent?: string;
}

export function ScoreBar({ label, before, after, accent }: ScoreBarProps) {
  const improved = after > before;
  const delta = after - before;
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="group" ref={ref}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-zinc-300 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-mono tabular-nums">{before.toFixed(1)}</span>
          <span className="text-zinc-600">{"\u2192"}</span>
          <span className="text-[11px] text-zinc-300 font-mono tabular-nums">{after.toFixed(1)}</span>
          {delta !== 0 && (
            <span
              className="text-[10px] font-mono tabular-nums"
              style={{ color: improved ? (accent || "#10b981") : "#ef4444" }}
            >
              {improved ? "+" : ""}{delta.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div className="relative h-6 flex items-center gap-1">
        <div className="flex-1 h-3 bg-zinc-800/80 rounded overflow-hidden">
          <div
            className="h-full bg-zinc-500/40 rounded"
            style={{
              width: visible ? `${(before / 5) * 100}%` : "0%",
              transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
            }}
          />
        </div>
        <div className="flex-1 h-3 bg-zinc-800/80 rounded overflow-hidden">
          <div
            className="h-full rounded"
            style={{
              width: visible ? `${(after / 5) * 100}%` : "0%",
              backgroundColor: improved ? (accent || "#10b981") : "rgba(113,113,122,0.5)",
              transition: "width 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
            }}
          />
        </div>
      </div>
    </div>
  );
}
