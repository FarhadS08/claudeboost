"use client";

import {
  Zap,
  Brain,
  BarChart3,
  Shield,
  Layers,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Enhancement",
    description:
      "Every prompt is automatically rewritten with specificity, constraints, verification criteria, and structured output definitions.",
  },
  {
    icon: Brain,
    title: "Learns Your Style",
    description:
      "RLHF feedback loop. Rate boosts, leave notes, and ClaudeBoost adapts to your preferences over time across 7 domains.",
  },
  {
    icon: BarChart3,
    title: "Quality Scoring",
    description:
      "Every prompt is scored across 6 dimensions before and after boosting. Track your ROI with real metrics, not vibes.",
  },
  {
    icon: Shield,
    title: "Enterprise Playbook",
    description:
      "Built on production-grade prompt engineering patterns. Anti-patterns are flagged, security constraints are enforced.",
  },
  {
    icon: Layers,
    title: "3 Boost Levels",
    description:
      "Light for quick fixes, Medium for balanced enhancement, Full for maximum enterprise-grade output. You choose.",
  },
  {
    icon: MessageSquare,
    title: "Domain-Aware",
    description:
      "Auto-classifies prompts into data science, engineering, analytics, DevOps, docs, and more. Each gets tailored rules.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Everything you need to write{" "}
            <span className="text-primary">better prompts</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            From automatic enhancement to personalized learning, ClaudeBoost
            handles the prompt engineering so you can focus on building.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-card border border-border rounded-2xl p-7 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>

              <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
