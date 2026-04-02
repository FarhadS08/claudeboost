"use client";

interface ScoreBarProps {
  label: string;
  before: number;
  after: number;
}

export function ScoreBar({ label, before, after }: ScoreBarProps) {
  const improved = after > before;
  const delta = after - before;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-zinc-300 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-mono tabular-nums">{before.toFixed(1)}</span>
          <span className="text-zinc-600">&#8594;</span>
          <span className="text-[11px] text-zinc-300 font-mono tabular-nums">{after.toFixed(1)}</span>
          {delta !== 0 && (
            <span className={`text-[10px] font-mono tabular-nums ${improved ? "text-emerald-400" : "text-red-400"}`}>
              {improved ? "+" : ""}{delta.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div className="relative h-6 flex items-center gap-1">
        {/* Before bar */}
        <div className="flex-1 h-3 bg-zinc-800/80 rounded overflow-hidden">
          <div
            className="h-full bg-zinc-500/50 rounded transition-all duration-700"
            style={{ width: `${(before / 5) * 100}%` }}
          />
        </div>
        {/* After bar */}
        <div className="flex-1 h-3 bg-zinc-800/80 rounded overflow-hidden">
          <div
            className={`h-full rounded transition-all duration-700 ${improved ? "bg-emerald-500" : "bg-zinc-500/50"}`}
            style={{ width: `${(after / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
