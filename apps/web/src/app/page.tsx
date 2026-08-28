import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustSection } from "@/components/landing/TrustSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { Features } from "@/components/landing/Features";
import { CRMShowcase } from "@/components/landing/CRMShowcase";
import { BookingShowcase } from "@/components/landing/BookingShowcase";
import { ProjectShowcase } from "@/components/landing/ProjectShowcase";
import { GalleryShowcase } from "@/components/landing/GalleryShowcase";
import { VideoReviewShowcase } from "@/components/landing/VideoReviewShowcase";
import { FinanceShowcase } from "@/components/landing/FinanceShowcase";
import { AIShowcase } from "@/components/landing/AIShowcase";
import { AutomationShowcase } from "@/components/landing/AutomationShowcase";
import { CreatorTypes } from "@/components/landing/CreatorTypes";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07080d] text-white selection:bg-violet-500 selection:text-white relative overflow-x-hidden font-sans antialiased">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section with Live Mockup */}
      <Hero />

      {/* Social Proof & Metrics */}
      <TrustSection />

      {/* The 7-Tool Chaos vs Unified OS */}
      <ProblemSection />

      {/* Core OS Capabilities Bento Grid */}
      <Features />

      {/* Deep-Dive Domain Showcases */}
      <CRMShowcase />
      <BookingShowcase />
      <ProjectShowcase />
      <GalleryShowcase />
      <VideoReviewShowcase />
      <FinanceShowcase />

      {/* AI Assistant & Automation Engine */}
      <AIShowcase />
      <AutomationShowcase />

      {/* Workflow Customization by Creator Type */}
      <CreatorTypes />

      {/* Pricing Tiers & Billing */}
      <Pricing />

      {/* Interactive FAQ */}
      <FAQ />

      {/* High-Impact Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
