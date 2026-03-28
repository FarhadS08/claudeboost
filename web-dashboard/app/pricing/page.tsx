"use client";

import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { useState } from "react";

const YEARLY_DISCOUNT = 0.35; // 35% off

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    period: "forever",
    description: "Try ClaudeBoost with no commitment",
    cta: "Start Free",
    ctaStyle: "border border-border text-foreground hover:bg-muted/50",
    features: [
      { text: "20 boosts per month", included: true },
      { text: "Light boost level only", included: true },
      { text: "3 domain classifications", included: true },
      { text: "Basic quality scoring", included: true },
      { text: "Community support", included: true },
      { text: "RLHF personalization", included: false },
      { text: "Domain constraints", included: false },
      { text: "Analytics dashboard", included: false },
    ],
    highlighted: false,
    perUser: false,
  },
  {
    name: "Pro",
    monthlyPrice: 2.49,
    period: "/month",
    description: "Everything you need. Seriously, that's the price.",
    cta: "Get Pro",
    ctaStyle:
      "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90",
    badge: "Most Popular",
    features: [
      { text: "Unlimited boosts", included: true },
      { text: "All 3 boost levels (light, medium, full)", included: true },
      { text: "All 7 domain classifications", included: true },
      { text: "Advanced 6-dimension quality scoring", included: true },
      { text: "RLHF personalization (learns your style)", included: true },
      { text: "Custom domain constraints", included: true },
      { text: "Full analytics dashboard", included: true },
      { text: "Priority support", included: true },
    ],
    highlighted: true,
    perUser: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: 1.90,
    period: "/user/month",
    description: "For teams of 3+. Add as many seats as you need.",
    cta: "Start Enterprise",
    ctaStyle:
      "bg-gradient-to-r from-secondary to-emerald-500 text-white shadow-lg shadow-secondary/25 hover:opacity-90",
    badge: "Best Per-Seat Value",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Minimum 3 users, no maximum", included: true },
      { text: "Shared domain constraints across team", included: true },
      { text: "Team analytics & reporting", included: true },
      { text: "Custom playbook rules", included: true },
      { text: "SSO / SAML authentication", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA guarantee (99.9% uptime)", included: true },
    ],
    highlighted: false,
    perUser: true,
  },
];

const faqs = [
  {
    q: "Wait, $2.49/month? What's the catch?",
    a: "No catch. ClaudeBoost is a lightweight MCP plugin — it runs locally on your machine, enhances prompts via the Claude API, and stores data in ~/.claudeboost/. Low infrastructure cost means we can price it honestly. We'd rather 10,000 developers use it at $2.49 than 100 at $49.",
  },
  {
    q: "How does Enterprise pricing work?",
    a: "Enterprise is $1.90/user/month (or $1.24/user/month billed yearly). Start with a minimum of 3 users and add as many seats as you want — no maximum. Every user gets the full Pro feature set plus team-wide shared constraints, analytics, SSO, and a dedicated account manager.",
  },
  {
    q: "Can I switch between monthly and yearly?",
    a: "Yes. Switch anytime from your billing settings. When switching to yearly, the 35% discount applies immediately and you're billed for the remaining months at the lower rate. When switching to monthly, the change takes effect at your next billing cycle.",
  },
  {
    q: "How does it integrate with Claude Code?",
    a: "ClaudeBoost registers as an MCP server. Run 'claude mcp add claudeboost' and restart Claude Code — that's it. Every prompt you type is automatically enhanced before Claude sees it. Use /boost for manual control, --raw to skip a single prompt.",
  },
  {
    q: "Do I need my own Anthropic API key?",
    a: "No. ClaudeBoost handles the enhancement API calls. You just need Claude Code installed — your existing Claude subscription works as usual for executing prompts.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Month-to-month, no contracts, no cancellation fees. Cancel in one click and you keep access until the end of your billing period. Your local data stays on your machine forever.",
  },
  {
    q: "What data do you collect?",
    a: "All boost history, ratings, and preferences are stored locally in ~/.claudeboost/ on your machine. We don't send your prompt content to any third-party analytics. The only data that leaves your machine is the prompt text sent to Claude API for enhancement.",
  },
  {
    q: "Can I add or remove Enterprise seats anytime?",
    a: "Yes. Add seats instantly — they're prorated for the current billing period. When removing seats, the change takes effect at the next billing cycle (minimum 3 seats always applies).",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [seats, setSeats] = useState(5);

  function getDisplayPrice(plan: (typeof plans)[number]): string {
    if (plan.monthlyPrice === 0) return "0";
    const price = annual
      ? plan.monthlyPrice * (1 - YEARLY_DISCOUNT)
      : plan.monthlyPrice;
    return price.toFixed(2);
  }

  function getYearlySavings(plan: (typeof plans)[number]): string {
    if (plan.monthlyPrice === 0) return "0";
    const saved = plan.monthlyPrice * YEARLY_DISCOUNT * 12;
    return saved.toFixed(2);
  }

  const enterprisePlan = plans[2];
  const enterpriseMonthly = annual
    ? enterprisePlan.monthlyPrice * (1 - YEARLY_DISCOUNT)
    : enterprisePlan.monthlyPrice;
  const enterpriseTotal = enterpriseMonthly * seats;

  return (
    <>
      <LandingNavbar />
      <main className="pt-24 pb-12">
        {/* Header */}
        <section className="text-center px-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Less than a coffee per month
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              $2.49/mo
            </span>{" "}
            individual &middot;{" "}
            <span className="bg-gradient-to-r from-secondary to-emerald-400 bg-clip-text text-transparent">
              $1.90/seat
            </span>{" "}
            enterprise
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Enterprise-grade prompt engineering for the price of a small snack.
            Save 35% with yearly billing.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span
              className={`text-sm font-medium transition-colors ${
                !annual ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                annual ? "bg-emerald-500" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${
                  annual ? "translate-x-7" : "translate-x-0.5"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${
                annual ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Yearly{" "}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold ml-1">
                -35%
              </span>
            </span>
          </div>
        </section>

        {/* Plans */}
        <section className="max-w-6xl mx-auto px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => {
              const displayPrice = getDisplayPrice(plan);
              const isEnterprise = plan.name === "Enterprise";

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 ${
                    plan.highlighted
                      ? "bg-card border-2 border-primary shadow-xl shadow-primary/10 scale-[1.02]"
                      : isEnterprise
                      ? "bg-card border-2 border-secondary/50 shadow-xl shadow-secondary/10"
                      : "bg-card/50 border border-border"
                  }`}
                >
                  {plan.badge && (
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold ${
                        isEnterprise
                          ? "bg-gradient-to-r from-secondary to-emerald-500 text-white"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold tracking-tight">
                        ${displayPrice}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    </div>
                    {annual && plan.monthlyPrice > 0 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-muted-foreground line-through">
                          ${plan.monthlyPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-emerald-400 font-semibold">
                          Save ${getYearlySavings(plan)}/year
                          {isEnterprise ? " per user" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Seat selector for Enterprise */}
                  {isEnterprise && (
                    <div className="my-4 p-4 bg-muted/30 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          Team size
                        </span>
                        <span className="text-xs text-muted-foreground">
                          min 3 users
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSeats(Math.max(3, seats - 1))}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-accent transition-colors text-lg font-medium"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center">
                          <input
                            type="number"
                            min={3}
                            value={seats}
                            onChange={(e) =>
                              setSeats(Math.max(3, parseInt(e.target.value) || 3))
                            }
                            className="w-16 bg-transparent text-center text-2xl font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <p className="text-[10px] text-muted-foreground -mt-0.5">
                            users
                          </p>
                        </div>
                        <button
                          onClick={() => setSeats(seats + 1)}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-accent transition-colors text-lg font-medium"
                        >
                          +
                        </button>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {seats} users &times; ${enterpriseMonthly.toFixed(2)}
                        </span>
                        <span className="text-sm font-bold text-secondary">
                          ${enterpriseTotal.toFixed(2)}
                          <span className="text-xs text-muted-foreground font-normal">
                            /{annual ? "mo" : "mo"}
                          </span>
                        </span>
                      </div>
                      {annual && (
                        <div className="mt-1 text-right">
                          <span className="text-[10px] text-emerald-400">
                            ${(enterpriseTotal * 12).toFixed(2)}/year total
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div className={isEnterprise ? "" : "mt-4"}>
                    <Link
                      href={plan.name === "Free" ? "/dashboard" : "#"}
                      className={`block w-full text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all ${plan.ctaStyle}`}
                    >
                      {plan.cta}
                    </Link>
                  </div>

                  {/* Features */}
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.text}
                        className="flex items-start gap-3 text-sm"
                      >
                        {feature.included ? (
                          <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                          <Minus className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
                        )}
                        <span
                          className={
                            feature.included
                              ? "text-muted-foreground"
                              : "text-zinc-600"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Cost comparison bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-lg">&#9749;</span>
              <span>Latte: $5.50</span>
            </div>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">&#127871;</span>
              <span>Snack: $3.00</span>
            </div>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">&#128225;</span>
              <span>ChatGPT: $20</span>
            </div>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">&#9889;</span>
              <span className="text-emerald-400 font-bold">
                ClaudeBoost: ${annual ? "1.62" : "2.49"}
                {annual && (
                  <span className="text-zinc-500 font-normal line-through ml-1">
                    $2.49
                  </span>
                )}
              </span>
            </div>
          </div>
        </section>

        {/* ROI section */}
        <section className="max-w-4xl mx-auto px-6 mb-24">
          <div className="bg-card/50 border border-border rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-center mb-8">
              The math is simple
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-primary">+12 pts</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Average score improvement per prompt (out of 30)
                </p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-400">93%</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Of users prefer the boosted version over their original
                </p>
              </div>
              <div>
                <p className="text-4xl font-bold text-secondary">15 min</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Saved per better prompt = pays for a whole year of ClaudeBoost
                </p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-muted/30 rounded-xl text-center">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">Enterprise teams:</span>{" "}
                A 10-person team at ${annual ? "1.24" : "1.90"}/user costs just{" "}
                <span className="text-secondary font-bold">
                  ${annual ? (1.24 * 10).toFixed(2) : (1.90 * 10).toFixed(2)}/mo
                </span>{" "}
                — less than a single SaaS tool. One improved prompt per developer per week saves hundreds of engineering hours per year.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
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
            <h2 className="text-3xl font-bold mb-2">
              Ready to boost your prompts?
            </h2>
            <p className="text-muted-foreground mb-8">
              Two commands. 30 seconds. From $1.90/user/month.
            </p>
            <div className="inline-block bg-card border border-border rounded-xl px-6 py-4 font-mono text-sm space-y-1 text-left">
              <div>
                <span className="text-emerald-500">&#10095;</span>{" "}
                <span className="text-zinc-300">claude mcp add claudeboost</span>
              </div>
              <div>
                <span className="text-emerald-500">&#10095;</span>{" "}
                <span className="text-zinc-300">claude</span>{" "}
                <span className="text-zinc-600"># you&apos;re boosted</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
