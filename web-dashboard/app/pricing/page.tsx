"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "forever",
    description: "For developers exploring prompt enhancement",
    cta: "Get Started Free",
    ctaStyle: "border border-border text-foreground hover:bg-muted/50",
    features: [
      "50 boosts per month",
      "Light boost level only",
      "3 domain classifications",
      "Basic quality scoring",
      "Community support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "19",
    period: "/month",
    description: "For professional developers and small teams",
    cta: "Start Pro Trial",
    ctaStyle: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90",
    badge: "Most Popular",
    features: [
      "Unlimited boosts",
      "All 3 boost levels",
      "All 7 domain classifications",
      "Advanced quality scoring (6 dimensions)",
      "RLHF personalization",
      "Domain constraints",
      "Analytics dashboard",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Team",
    price: "49",
    period: "/month",
    description: "For engineering teams that want consistency",
    cta: "Contact Sales",
    ctaStyle: "border border-border text-foreground hover:bg-muted/50",
    features: [
      "Everything in Pro",
      "Up to 25 team members",
      "Shared domain constraints",
      "Team analytics & reporting",
      "Custom playbook rules",
      "SSO / SAML authentication",
      "Dedicated support",
      "SLA guarantee",
    ],
    highlighted: false,
  },
];

const faqs = [
  {
    q: "How does ClaudeBoost work?",
    a: "ClaudeBoost is an MCP plugin for Claude Code. It intercepts your prompts, classifies them into a domain, scores them on 6 quality dimensions, then rewrites them using enterprise playbook rules. You see the original vs boosted side-by-side and choose which to use.",
  },
  {
    q: "Do I need my own API key?",
    a: "The Starter plan uses shared infrastructure. Pro and Team plans can use our hosted API or bring your own Anthropic API key for maximum control and privacy.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, all plans are month-to-month with no contracts. Cancel anytime and you'll retain access until the end of your billing period.",
  },
  {
    q: "What happens to my data?",
    a: "All boost history and preferences are stored locally in ~/.claudeboost/ on your machine. We never send your prompt content to third-party analytics. Pro and Team dashboards read from your local data.",
  },
  {
    q: "Does it work with other AI tools?",
    a: "ClaudeBoost is designed specifically for Claude Code via the MCP protocol. It hooks directly into your workflow — no copy-pasting between tools.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <LandingNavbar />
      <main className="pt-24 pb-12">
        {/* Header */}
        <section className="text-center px-6 mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
            Pricing
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Simple,{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              transparent
            </span>{" "}
            pricing
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span
              className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                annual ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                  annual ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}
            >
              Annual{" "}
              <span className="text-xs text-emerald-400 font-semibold">Save 20%</span>
            </span>
          </div>
        </section>

        {/* Plans */}
        <section className="max-w-6xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => {
              const displayPrice =
                plan.price === "0"
                  ? "0"
                  : annual
                  ? Math.round(Number(plan.price) * 0.8).toString()
                  : plan.price;

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 ${
                    plan.highlighted
                      ? "bg-card border-2 border-primary shadow-xl shadow-primary/10 scale-[1.02]"
                      : "bg-card/50 border border-border"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {plan.badge}
                    </div>
                  )}

                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 mb-6">
                    <span className="text-5xl font-bold tracking-tight">
                      ${displayPrice}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      {plan.period}
                    </span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={plan.name === "Team" ? "#" : "/dashboard"}
                    className={`block w-full text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </Link>

                  {/* Features */}
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm"
                      >
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-card/50 border border-border rounded-xl p-6"
              >
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center px-6 py-16 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4">Ready to boost your prompts?</h2>
            <p className="text-muted-foreground mb-8">
              Install ClaudeBoost in 30 seconds. No credit card required.
            </p>
            <div className="inline-block bg-card border border-border rounded-xl px-6 py-4 font-mono text-sm">
              <span className="text-muted-foreground">$</span>{" "}
              <span className="text-emerald-400">pip install claudeboost</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
