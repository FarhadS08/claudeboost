import { useState } from "react";
import { DOMAINS, MOCK_CONSTRAINTS, Constraints } from "@/lib/data";
import DomainBadge from "@/components/DomainBadge";

const ConstraintsPage = () => {
  const [constraints, setConstraints] = useState<Constraints>({ ...MOCK_CONSTRAINTS });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-20 pb-12">
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">
        Domain Constraints
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Rules ClaudeBoost will always apply when enhancing prompts in each domain.
        These are injected into every boost for that domain.
      </p>

      {/* Info callout */}
      <div className="bg-card border-l-[3px] border-l-secondary border border-border rounded-lg p-4 mb-8 animate-fade-slide-up">
        <p className="text-sm text-muted-foreground">
          💡 Example: For data_science, set{" "}
          <span className="text-foreground font-display text-xs">
            &apos;Always use Python and sklearn. Never use R.&apos;
          </span>{" "}
          — ClaudeBoost will apply this to every data science boost automatically.
        </p>
      </div>

      {/* Constraint cards */}
      <div className="space-y-4">
        {DOMAINS.map((domain, i) => (
          <div
            key={domain}
            className="bg-card border border-border rounded-lg p-4 animate-fade-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <DomainBadge domain={domain} />
              <span className="font-display text-sm font-bold text-foreground">
                {domain.replace(/_/g, " ")}
              </span>
            </div>
            <textarea
              value={constraints[domain]}
              onChange={(e) =>
                setConstraints((prev) => ({ ...prev, [domain]: e.target.value }))
              }
              placeholder="No constraints set. Add rules here to customize how this domain is boosted."
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-3 font-display text-[13px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full mt-6 h-12 rounded-lg font-display text-base font-bold transition-colors ${
          saved
            ? "bg-success/20 text-success"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {saved ? "✓ Constraints Saved" : "Save All Constraints"}
      </button>
    </div>
  );
};

export default ConstraintsPage;
