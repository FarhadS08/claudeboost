"use client";

import { HeroSection } from "@/components/landing/HeroSection";
import { PromptTransformBanner } from "@/components/landing/PromptTransformBanner";
import { CLIShowcase } from "@/components/landing/CLIShowcase";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { CTASection } from "@/components/landing/CTASection";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <PromptTransformBanner />
        <CLIShowcase />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <MetricsSection />
        <div id="pricing">
          <PricingTeaser />
        </div>
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
