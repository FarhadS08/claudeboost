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
        <span className="text-muted-foreground font-medium w-24">{label}</span>
        <span className="text-muted-foreground tabular-nums font-mono">
          {before} &#8594; {after}
        </span>
      </div>
      <div className="flex gap-1.5 h-2.5">
        <div className="flex-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/30 rounded-full"
            style={{ width: `${(before / 5) * 100}%` }}
          />
        </div>
        <div className="flex-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${(after / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
