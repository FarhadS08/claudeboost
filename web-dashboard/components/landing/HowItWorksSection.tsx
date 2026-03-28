"use client";

const steps = [
  {
    number: "01",
    title: "Write your prompt",
    description:
      "Just type naturally. \"build me an API\" or \"fix the login bug\" — however you normally prompt Claude.",
    visual: (
      <div className="font-mono text-sm bg-muted/30 rounded-lg p-4 border border-border">
        <span className="text-muted-foreground">$</span>{" "}
        <span className="text-zinc-300">build me an API endpoint for user auth</span>
      </div>
    ),
  },
  {
    number: "02",
    title: "ClaudeBoost enhances it",
    description:
      "Your prompt is auto-classified into a domain, scored on 6 dimensions, then rewritten with enterprise playbook rules.",
    visual: (
      <div className="flex items-center gap-3">
        {["Specificity", "Context", "Constraints", "Tests", "Structure", "Output"].map(
          (dim, i) => (
            <div key={dim} className="flex-1">
              <div className="h-16 bg-muted/30 rounded-md border border-border relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/40 to-primary/10 rounded-b-md"
                  style={{ height: `${50 + i * 8}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground mt-1 text-center truncate">
                {dim}
              </p>
            </div>
          )
        )}
      </div>
    ),
  },
  {
    number: "03",
    title: "Review & execute",
    description:
      "See the original vs boosted side-by-side with scores. Use the boost, refine it, or keep your original. You're always in control.",
    visual: (
      <div className="flex gap-3">
        <div className="flex-1 bg-muted/30 rounded-lg p-3 border border-border">
          <p className="text-[10px] text-muted-foreground mb-1">Original</p>
          <div className="text-xs text-zinc-400 leading-relaxed">
            build me an API endpoint...
          </div>
          <p className="text-xs font-semibold text-red-400 mt-2">12/30</p>
        </div>
        <div className="flex-1 bg-primary/5 rounded-lg p-3 border border-primary/30">
          <p className="text-[10px] text-primary mb-1">Boosted</p>
          <div className="text-xs text-zinc-300 leading-relaxed">
            Build a REST API with JWT auth...
          </div>
          <p className="text-xs font-semibold text-emerald-400 mt-2">27/30</p>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    title: "It learns from you",
    description:
      "Rate boosts, leave feedback, set domain constraints. ClaudeBoost injects your preferences into future enhancements. It gets better the more you use it.",
    visual: (
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-lg ${star <= 4 ? "text-amber-400" : "text-zinc-600"}`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="h-8 w-px bg-border" />
        <p className="text-xs text-muted-foreground italic">
          &quot;Always use TypeScript, prefer Zod for validation&quot;
        </p>
      </div>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-32 px-6 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Four steps to{" "}
            <span className="text-secondary">10x better prompts</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`flex flex-col md:flex-row items-center gap-12 ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Text */}
              <div className="flex-1 space-y-4">
                <span className="text-6xl font-bold text-muted/60 font-mono">
                  {step.number}
                </span>
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Visual */}
              <div className="flex-1 w-full">{step.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
