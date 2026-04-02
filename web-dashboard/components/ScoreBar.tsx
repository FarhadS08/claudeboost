"use client";

interface ScoreBarProps {
  label: string;
  before: number;
  after: number;
  accent?: string;
}

export function ScoreBar({ label, before, after, accent }: ScoreBarProps) {
  const improved = after > before;
  const delta = after - before;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-zinc-300 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-mono tabular-nums">{before.toFixed(1)}</span>
          <span className="text-zinc-600">{"\u2192"}</span>
          <span className="text-[11px] text-zinc-300 font-mono tabular-nums">{after.toFixed(1)}</span>
          {delta !== 0 && (
            <span className={`text-[10px] font-mono tabular-nums ${improved ? "text-emerald-400" : "text-red-400"}`} style={improved && accent ? { color: accent } : undefined}>
              {improved ? "+" : ""}{delta.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div className="relative h-6 flex items-center gap-1">
        {/* Before bar */}
        <div className="flex-1 h-3 bg-zinc-800/80 rounded overflow-hidden">
          <div
            className="h-full bg-zinc-500/40 rounded transition-all duration-700"
            style={{ width: `${(before / 5) * 100}%` }}
          />
        </div>
        {/* After bar — uses accent color if provided */}
        <div className="flex-1 h-3 bg-zinc-800/80 rounded overflow-hidden">
          <div
            className="h-full rounded transition-all duration-700"
            style={{
              width: `${(after / 5) * 100}%`,
              backgroundColor: improved && accent ? accent : improved ? "#10b981" : "rgba(113,113,122,0.5)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
