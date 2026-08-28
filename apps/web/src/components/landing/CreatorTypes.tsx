"use client";

import { useState } from "react";
import { Camera, Film, Sparkles, Heart, Building2, CheckCircle2 } from "lucide-react";

export function CreatorTypes() {
  const [activeType, setActiveType] = useState(0);

  const creators = [
    {
      role: "Photographer",
      icon: Camera,
      tagline: "CRM → Booking → Shoot → 4K Gallery → Payout",
      bullets: [
        "Branded client photo galleries with high-speed zip downloads",
        "Watermark protection & client favorite selection for album curation",
        "Automated booking page with travel stipend calculations",
      ],
    },
    {
      role: "Videographer & Filmmaker",
      icon: Film,
      tagline: "CRM → Booking → Call Sheet → Video Review → Final Delivery",
      bullets: [
        "Frame-accurate video timestamp feedback (Frame.io replacement)",
        "Side-by-side video version compare (Cut V1 vs Cut V2)",
        "Client approval trigger with automatic final balance invoice",
      ],
    },
    {
      role: "Wedding Specialist",
      icon: Heart,
      tagline: "Inquiry → Questionnaire → Contract → Timeline → Gallery → Reviews",
      bullets: [
        "Custom wedding questionnaire (couple prefs, family photo list)",
        "Day-of wedding minute-by-minute timeline builder",
        "Multi-payment split (30% save-the-date, 40% pre-shoot, 30% delivery)",
      ],
    },
    {
      role: "Content Creator",
      icon: Sparkles,
      tagline: "CRM → Brand Deals → AI Content Generator → Analytics",
      bullets: [
        "AI caption generator, hashtag groups, and video hook scripts",
        "Brand deal deliverables tracker & invoice generator",
        "Public rate card & media kit landing page",
      ],
    },
    {
      role: "Creative Studio & Agency",
      icon: Building2,
      tagline: "CRM → Multi-Client → Crew Delegation → Profit & Loss",
      bullets: [
        "Crew role assignments (Photographer, Drone Op, Editor, Assistant)",
        "Multi-workspace organization with role-based permissions",
        "Comprehensive agency revenue, expense, and profit margin reporting",
      ],
    },
  ];

  return (
    <section className="py-24 border-t border-white/[0.06] relative bg-[#090a12]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Tailored To Your Craft
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Custom workflows for every creative discipline.
          </p>
          <p className="text-slate-400 text-base sm:text-lg">
            Whether you&apos;re a solo wedding photographer or running a 10-person commercial production agency.
          </p>
        </div>

        {/* Creator Type Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {creators.map((c, i) => {
            const Icon = c.icon;
            const isSelected = activeType === i;
            return (
              <button
                key={i}
                onClick={() => setActiveType(i)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(124,58,237,0.4)] scale-105"
                    : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {c.role}
              </button>
            );
          })}
        </div>

        {/* Active Workflow Card */}
        {(() => {
          const current = creators[activeType] || creators[0]!;
          return (
            <div className="max-w-4xl mx-auto rounded-3xl border border-violet-500/30 bg-[#0e101c] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                    Optimized Operating Workflow
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {current.role} OS
                  </h3>
                </div>
                <span className="text-xs text-violet-300 font-mono bg-violet-500/15 border border-violet-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
                  {current.tagline}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {current.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
