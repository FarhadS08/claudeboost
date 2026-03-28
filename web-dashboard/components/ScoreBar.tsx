"use client";

interface ScoreBarProps {
  label: string;
  before: number;
  after: number;
}

export function ScoreBar({ label, before, after }: ScoreBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 font-medium w-24">{label}</span>
        <span className="text-zinc-500 tabular-nums">
          {before} → {after}
        </span>
      </div>
      <div className="flex gap-1.5 h-2">
        <div className="flex-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-500/40 rounded-full"
            style={{ width: `${(before / 5) * 100}%` }}
          />
        </div>
        <div className="flex-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${(after / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
