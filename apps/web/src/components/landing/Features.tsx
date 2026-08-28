import {
  Users,
  Calendar,
  FolderKanban,
  Image,
  Video,
  CreditCard,
  Sparkles,
  Zap,
  ArrowUpRight,
} from "lucide-react";

export function Features() {
  const bentoItems = [
    {
      title: "Client CRM & Lead Engine",
      tagline: "Never lose a high-budget inquiry again",
      desc: "Visual Kanban pipelines, custom inquiry forms, and complete client relationship histories with lifetime value tracking.",
      icon: Users,
      badge: "CRM",
      colSpan: "lg:col-span-8",
      accent: "from-violet-600/20 via-purple-600/10 to-transparent",
      highlight: "Track inquiries from initial DM to signed 70% deposit.",
    },
    {
      title: "Smart Booking Calendar",
      tagline: "Automated availability & packages",
      desc: "Send clients your custom booking page with packages, travel fees, and automated date locking.",
      icon: Calendar,
      badge: "Bookings",
      colSpan: "lg:col-span-4",
      accent: "from-cyan-600/20 via-blue-600/10 to-transparent",
      highlight: "Zero double-bookings with auto buffer times.",
    },
    {
      title: "Branded 4K Client Galleries",
      tagline: "High-speed photo viewing & delivery",
      desc: "Stunning, high-resolution galleries with watermarks, client favorite selection, and 1-click cloud zip downloads.",
      icon: Image,
      badge: "Delivery",
      colSpan: "lg:col-span-4",
      accent: "from-pink-600/20 via-rose-600/10 to-transparent",
      highlight: "Custom creator branding on every client link.",
    },
    {
      title: "Frame-Accurate Video Review",
      tagline: "Frame.io alternative built right in",
      desc: "Upload video cuts. Clients leave timestamped comments (e.g. 01:42) and approve revisions without leaving the portal.",
      icon: Video,
      badge: "Video Review",
      colSpan: "lg:col-span-8",
      accent: "from-indigo-600/20 via-violet-600/10 to-transparent",
      highlight: "Cut review cycles in half with version comparison.",
    },
    {
      title: "African Payments & Invoicing",
      tagline: "Paystack (₦, GHS, KES, ZAR) + Stripe",
      desc: "Send itemized quotes, collect automated deposits, and track profit/loss with automated receipts.",
      icon: CreditCard,
      badge: "Finance",
      colSpan: "lg:col-span-6",
      accent: "from-emerald-600/20 via-teal-600/10 to-transparent",
      highlight: "Direct bank payouts with instant confirmation.",
    },
    {
      title: "AI Creative Business Assistant",
      tagline: "Powered by deep creative intelligence",
      desc: "Auto-generate contracts, custom shot lists, wedding timelines, and social media captions with one click.",
      icon: Sparkles,
      badge: "AI Layer",
      colSpan: "lg:col-span-6",
      accent: "from-amber-600/20 via-orange-600/10 to-transparent",
      highlight: "Trained specifically on creative production briefs.",
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Engineered For Creative Excellence
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Every feature built around the creative professional&apos;s workflow.
          </p>
          <p className="text-slate-400 text-base sm:text-lg">
            From pre-production checklists to final video approvals and Paystack payouts.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {bentoItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`${item.colSpan} relative rounded-3xl bg-[#0e101a] border border-white/[0.08] p-8 overflow-hidden group hover:border-white/[0.2] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between`}
              >
                {/* Background Gradient Accent */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none`}
                />

                {/* Card Top */}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-violet-400 mt-1">
                      {item.tagline}
                    </p>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Card Bottom Highlight Pill */}
                <div className="relative z-10 pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Zap className="w-3.5 h-3.5" />
                    {item.highlight}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
