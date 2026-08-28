import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";

export function ProblemSection() {
  const fragmentedTools = [
    { tool: "HoneyBook / Dubsado", issue: "Expensive US dollar subscriptions with zero African payment support" },
    { tool: "Google Drive & WeTransfer", issue: "Links expire, storage limits hit, unbranded delivery feels amateur" },
    { tool: "Frame.io ($45/mo)", issue: "Overpriced standalone video review tool disconnected from your client invoices" },
    { tool: "WhatsApp & DM Chaos", issue: "Lost shot lists, buried contracts, and awkward payment reminder follow-ups" },
    { tool: "Calendly & Excel", issue: "Double-booked shoots, manual travel fee math, and zero automated workflows" },
  ];

  const unifiedSolutions = [
    { title: "Native Paystack & Stripe", desc: "Collect ₦, GHS, KES, ZAR, USD deposits directly into your bank account with instant receipts." },
    { title: "Branded Client Galleries", desc: "Deliver 4K photos & videos with high-speed downloads, watermarking, and client favorites." },
    { title: "Built-in Video Timestamp Review", desc: "Clients comment on exact video frames (e.g. 01:24) with zero extra subscriptions." },
    { title: "Automated Production Call Sheets", desc: "Shot lists, location details, timeline builders, and crew role assignments in one view." },
    { title: "AI Creator Business Assistant", desc: "Auto-draft itemized quotes, legally binding contracts, and social media captions in seconds." },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400">
            The Fragmentation Problem
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Stop stitching together 7 different tools to run one creative business.
          </p>
          <p className="text-slate-400 text-base sm:text-lg">
            Creative professionals lose over 15+ hours every week juggling files, chasing invoice payments on WhatsApp, and fighting expired download links.
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Old Way */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12131c]/60 border border-rose-500/20 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <span className="p-1 rounded-md bg-rose-500/10">
                <XCircle className="w-5 h-5" />
              </span>
              The Disconnected Nightmare
            </div>

            <div className="space-y-4">
              {fragmentedTools.map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-black/30 border border-white/[0.04] space-y-1">
                  <div className="text-xs font-bold text-slate-200">{item.tool}</div>
                  <div className="text-xs text-rose-300/80 leading-relaxed">{item.issue}</div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.06] text-xs text-slate-500 font-medium flex justify-between items-center">
              <span>Estimated Cost: $180+/month</span>
              <span className="text-rose-400 font-bold">15+ wasted hours/wk</span>
            </div>
          </div>

          {/* New Way — Crea8or OS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-violet-950/40 via-[#0e101b] to-[#0c0d15] border border-violet-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(124,58,237,0.15)] space-y-6 relative overflow-hidden">
            {/* Top Glow Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/20 to-transparent blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                <span className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                </span>
                The Crea8or Unified OS
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                All-in-One
              </span>
            </div>

            <div className="space-y-4">
              {unifiedSolutions.map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/30 transition-colors space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-300/90 leading-relaxed pl-3.5">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.06] text-xs text-slate-300 font-medium flex justify-between items-center">
              <span>All 8 Modules Included</span>
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                Zero Fragmented Subscriptions
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
