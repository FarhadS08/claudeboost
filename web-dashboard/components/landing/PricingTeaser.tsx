"use client";

import Link from "next/link";
import { Check, Users, User } from "lucide-react";

export function PricingTeaser() {
  return (
    <section className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3">
          Pricing
        </p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Less than a coffee.{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-secondary bg-clip-text text-transparent">
            Every month.
          </span>
        </h2>
        <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">
          Enterprise-grade prompt engineering starting at $1.90/user. Save 35% with yearly billing.
        </p>

        {/* Two price cards side by side */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Pro */}
          <div className="relative bg-card border-2 border-primary rounded-2xl p-7 shadow-xl shadow-primary/10 text-left">
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              Individual
            </div>
            <div className="flex items-center gap-2 mb-4 mt-1">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Pro</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight">$2.49</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1">$1.62/mo billed yearly (save 35%)</p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-5">
              {[
                "Unlimited boosts",
                "All boost levels",
                "RLHF learning",
                "6-dim scoring",
                "Domain constraints",
                "Full dashboard",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-1.5 text-xs">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-muted-foreground">{feat}</span>
                </div>
              ))}
            </div>

            <Link
              href="/pricing"
              className="mt-5 block w-full text-center px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Get Pro
            </Link>
          </div>

          {/* Enterprise */}
          <div className="relative bg-card border-2 border-secondary/50 rounded-2xl p-7 shadow-xl shadow-secondary/10 text-left">
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-secondary to-emerald-500 text-white text-[10px] font-bold">
              Teams of 3+
            </div>
            <div className="flex items-center gap-2 mb-4 mt-1">
              <Users className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold">Enterprise</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight">$1.90</span>
              <span className="text-muted-foreground text-sm">/user/month</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1">$1.24/user/mo billed yearly (save 35%)</p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-5">
              {[
                "Everything in Pro",
                "Unlimited seats",
                "Shared constraints",
                "Team analytics",
                "SSO / SAML",
                "SLA guarantee",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-1.5 text-xs">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-muted-foreground">{feat}</span>
                </div>
              ))}
            </div>

            <Link
              href="/pricing"
              className="mt-5 block w-full text-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-emerald-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Start Enterprise
            </Link>
          </div>
        </div>

        {/* Cost comparison */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-lg">&#9749;</span>
            <span>Coffee: ~$5</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">&#127828;</span>
            <span>Lunch: ~$15</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">&#9889;</span>
            <span className="text-emerald-400 font-semibold">ClaudeBoost: from $1.24/user</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Free tier available &middot; No credit card to start &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
}
