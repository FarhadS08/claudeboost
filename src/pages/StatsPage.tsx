import { useMemo } from "react";
import { MOCK_HISTORY, DOMAINS, Domain, DOMAIN_COLORS } from "@/lib/data";
import DomainBadge from "@/components/DomainBadge";

const StatsPage = () => {
  const entries = MOCK_HISTORY;

  const acceptanceRate = useMemo(() => {
    const withChoice = entries.filter((e) => e.chosen !== null);
    if (withChoice.length === 0) return null;
    const boosted = withChoice.filter((e) => e.chosen === "boosted").length;
    return Math.round((boosted / withChoice.length) * 100);
  }, [entries]);

  const ratingsByDomain = useMemo(() => {
    const map: Partial<Record<Domain, { sum: number; count: number }>> = {};
    entries.forEach((e) => {
      if (e.rating !== null) {
        if (!map[e.domain]) map[e.domain] = { sum: 0, count: 0 };
        map[e.domain]!.sum += e.rating;
        map[e.domain]!.count += 1;
      }
    });
    return Object.entries(map).map(([domain, data]) => ({
      domain: domain as Domain,
      avg: data!.sum / data!.count,
    }));
  }, [entries]);

  const feedbackCoverage = useMemo(() => {
    const withFeedback = entries.filter(
      (e) => e.rating !== null || e.feedback.trim() !== ""
    ).length;
    return { count: withFeedback, total: entries.length };
  }, [entries]);

  const dailyActivity = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = entries.filter(
        (e) => e.timestamp.split("T")[0] === dateStr
      ).length;
      result.push({
        day: days[d.getDay()],
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      });
    }
    return result;
  }, [entries]);

  const maxDaily = Math.max(...dailyActivity.map((d) => d.count), 1);
  const feedbackPct =
    feedbackCoverage.total > 0
      ? Math.round((feedbackCoverage.count / feedbackCoverage.total) * 100)
      : 0;

  // Donut SVG params
  const donutRadius = 50;
  const donutStroke = 10;
  const circumference = 2 * Math.PI * donutRadius;
  const dashOffset = circumference - (feedbackPct / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-20 pb-12">
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">Stats</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Evaluation metrics for your prompt boosts
      </p>

      <div className="space-y-8">
        {/* Acceptance Rate */}
        <section className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up">
          <h2 className="font-display text-sm font-semibold text-foreground mb-1">
            Boost Acceptance Rate
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            How often you chose the boosted prompt over your original
          </p>
          {acceptanceRate !== null ? (
            <>
              <div className="font-display text-5xl font-bold text-secondary mb-4">
                {acceptanceRate}%
              </div>
              <div className="w-full h-2 bg-muted rounded-sm overflow-hidden">
                <div
                  className="h-full bg-primary animate-bar-grow rounded-sm"
                  style={{ width: `${acceptanceRate}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No data yet — start boosting prompts in Claude Code
            </p>
          )}
        </section>

        {/* Rating by Domain */}
        <section className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="font-display text-sm font-semibold text-foreground mb-1">
            Average Rating by Domain
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Star ratings left on boosted prompts, grouped by domain
          </p>
          {ratingsByDomain.length > 0 ? (
            <div className="space-y-3">
              {ratingsByDomain.map(({ domain, avg }) => (
                <div key={domain} className="flex items-center gap-3">
                  <DomainBadge domain={domain} />
                  <div className="flex-1 h-3 bg-muted rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-primary animate-bar-grow rounded-sm"
                      style={{ width: `${(avg / 5) * 100}%` }}
                    />
                  </div>
                  <span className="font-display text-sm text-foreground min-w-[50px] text-right">
                    {avg.toFixed(1)} ★
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet</p>
          )}
        </section>

        {/* Feedback Coverage */}
        <section className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up" style={{ animationDelay: "200ms" }}>
          <h2 className="font-display text-sm font-semibold text-foreground mb-1">
            Feedback Coverage
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Percentage of boosts that have user feedback
          </p>
          <div className="flex flex-col items-center">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={donutRadius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={donutStroke}
              />
              <circle
                cx="60"
                cy="60"
                r={donutRadius}
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth={donutStroke}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                className="transition-all duration-700"
              />
              <text
                x="60"
                y="60"
                textAnchor="middle"
                dominantBaseline="central"
                className="font-display text-lg font-bold fill-foreground"
              >
                {feedbackCoverage.total > 0 ? `${feedbackPct}%` : "—"}
              </text>
            </svg>
            <p className="text-sm text-muted-foreground mt-3">
              {feedbackCoverage.count} of {feedbackCoverage.total} prompts have feedback
            </p>
          </div>
        </section>

        {/* Daily Activity */}
        <section className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up" style={{ animationDelay: "300ms" }}>
          <h2 className="font-display text-sm font-semibold text-foreground mb-1">
            Daily Activity — Last 7 Days
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Number of boosts per day
          </p>
          <div className="flex items-end justify-between gap-2 h-40">
            {dailyActivity.map((day) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-2 group relative"
              >
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-primary rounded-t-sm transition-all animate-bar-grow"
                    style={{
                      height: `${day.count > 0 ? (day.count / maxDaily) * 100 : 4}%`,
                      minHeight: day.count > 0 ? "8px" : "2px",
                      opacity: day.count > 0 ? 1 : 0.3,
                    }}
                  />
                </div>
                <span className="font-display text-[11px] text-muted-foreground">
                  {day.day}
                </span>
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-2 py-1 text-[11px] font-display text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {day.date}: {day.count}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatsPage;
