"use client";

import { useState } from "react";
import { Sparkles, FileText, Film, Share2, Zap, ArrowRight } from "lucide-react";

export function AIShowcase() {
  const [activeTab, setActiveTab] = useState<"quote" | "contract" | "timeline" | "social">("quote");

  const aiFeatures = {
    quote: {
      title: "AI Smart Quote & Estimator",
      prompt: "Generate an itemized quote for a 2-day destination fashion campaign in Cape Town with 4K video, 2 models, lighting crew, and drone.",
      response: "✅ Generated itemized quote with subtotal of ₦4,200,000 including travel stipend, drone permit fees, 70% deposit split, and 48hr delivery add-on.",
    },
    contract: {
      title: "AI Contract & Terms Drafter",
      prompt: "Draft an 8-page commercial videography agreement with strict copyright ownership until full invoice payment, plus bad-weather postponement terms.",
      response: "✅ Created legally binding contract with dynamic IP protection clauses, electronic signature placeholders, and automatic cancellation breakdown.",
    },
    timeline: {
      title: "AI Shoot Timeline & Shot List",
      prompt: "Create a 12-hour wedding day call sheet for a Catholic ceremony in Lekki followed by a 600-guest reception, including drone establishing shots.",
      response: "✅ Generated minute-by-minute timeline from 07:30 AM bridal prep to 10:00 PM sparkler exit with specific lens assignments (85mm f/1.4 & 24-70mm).",
    },
    social: {
      title: "AI Social Media Repurposing",
      prompt: "Turn our 3-minute brand video deliverable into 5 high-converting Instagram Reels hooks, TikTok captions, and a LinkedIn case study post.",
      response: "✅ Generated 5 video hook scripts, viral caption variations, trending hashtag clusters, and a client testimonial announcement.",
    },
  };

  return (
    <section id="ai" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            AI Creative Assistant Layer
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            An AI assistant specifically built for creative workflows.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Not a generic chatbot. Crea8or AI understands shoot production briefs, equipment rates, contract clauses, and creative delivery.
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Tab Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#0f111d] border border-white/[0.08]">
            <button
              onClick={() => setActiveTab("quote")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "quote"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              AI Quote Generator
            </button>
            <button
              onClick={() => setActiveTab("contract")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "contract"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              AI Contract Drafter
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "timeline"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              AI Shoot Timelines
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "social"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Social Media Repurposing
            </button>
          </div>

          {/* AI Terminal Output Card */}
          <div className="rounded-3xl border border-violet-500/30 bg-[#0d0e19] p-6 sm:p-8 shadow-[0_20px_60px_rgba(139,92,246,0.15)] space-y-6">
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
                Creator Prompt
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
                &ldquo;{aiFeatures[activeTab].prompt}&rdquo;
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Crea8or AI Realtime Output
              </div>
              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed">
                {aiFeatures[activeTab].response}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
