"use client";

import { useEffect, useRef, useState } from "react";

function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
  duration = 2000,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);

  return (
    <div ref={ref} className="text-5xl md:text-6xl font-bold tabular-nums">
      {prefix}
      {value}
      {suffix}
    </div>
  );
}

const metrics = [
  {
    value: 93,
    suffix: "%",
    label: "Boost acceptance rate",
    sublabel: "Users prefer the boosted version",
  },
  {
    value: 12,
    prefix: "+",
    label: "Avg score improvement",
    sublabel: "Points gained out of 30",
  },
  {
    value: 6,
    suffix: "x",
    label: "More specific prompts",
    sublabel: "Dimension score increase",
  },
  {
    value: 50,
    suffix: "ms",
    label: "Enhancement latency",
    sublabel: "Near-instant prompt rewriting",
  },
];

export function MetricsSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
            Results
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Numbers that{" "}
            <span className="text-primary">speak for themselves</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="text-center space-y-2 p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors"
            >
              <div className="text-primary">
                <AnimatedCounter
                  end={metric.value}
                  suffix={metric.suffix}
                  prefix={metric.prefix}
                />
              </div>
              <p className="text-sm font-semibold">{metric.label}</p>
              <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
