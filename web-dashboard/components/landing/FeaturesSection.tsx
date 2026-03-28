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
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "Learns Your Style",
    description:
      "RLHF feedback loop. Rate boosts, leave notes, and ClaudeBoost adapts to your preferences over time across 7 domains.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: BarChart3,
    title: "Quality Scoring",
    description:
      "Every prompt is scored across 6 dimensions before and after boosting. Track your ROI with real metrics, not vibes.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Shield,
    title: "Enterprise Playbook",
    description:
      "Built on production-grade prompt engineering patterns. Anti-patterns are flagged, security constraints are enforced.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Layers,
    title: "3 Boost Levels",
    description:
      "Light for quick fixes, Medium for balanced enhancement, Full for maximum enterprise-grade output. You choose.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
  {
    icon: MessageSquare,
    title: "Domain-Aware",
    description:
      "Auto-classifies prompts into data science, engineering, analytics, DevOps, docs, and more. Each gets tailored rules.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
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

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative bg-card/50 border border-border rounded-2xl p-7 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>

              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
