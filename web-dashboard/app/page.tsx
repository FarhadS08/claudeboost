"use client";

import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <MetricsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
