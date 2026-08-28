"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");

  const plans = [
    {
      name: "Starter",
      tagline: "For emerging creators getting their first paid bookings",
      priceNGN: 0,
      priceUSD: 0,
      period: "forever free",
      popular: false,
      cta: "Get Started Free",
      features: [
        "Up to 3 active clients",
        "2 active project workspaces",
        "Paystack & Stripe online invoicing",
        "Public booking link (`crea8or.app/username`)",
        "Digital contract generator",
        "Standard email notifications",
      ],
    },
    {
      name: "Creator Pro",
      tagline: "For busy full-time photographers, videographers & creators",
      priceNGN: isAnnual ? 8500 : 10500,
      priceUSD: isAnnual ? 15 : 19,
      period: "per month",
      popular: true,
      cta: "Start 14-Day Free Trial",
      features: [
        "Unlimited clients & projects",
        "100 GB Branded 4K Photo Galleries",
        "Frame-accurate Video Review (Cut V1 vs V2)",
        "AI Creator Assistant (Quotes, Shot Lists, Contracts)",
        "Automated WhatsApp & Email Reminders",
        "Watermark protection & client photo favorites",
        "Instant Paystack payment reconciliation",
      ],
    },
    {
      name: "Studio & Agency",
      tagline: "For multi-crew production studios & creative agencies",
      priceNGN: isAnnual ? 24500 : 29500,
      priceUSD: isAnnual ? 45 : 55,
      period: "per month",
      popular: false,
      cta: "Upgrade to Studio",
      features: [
        "Everything in Creator Pro",
        "5 Team & Crew Member Seats",
        "1 TB Ultra-Fast Cloud Storage",
        "Custom Subdomain (`studio.crea8or.app`)",
        "Equipment inventory & checkout tracking",
        "Advanced Agency P&L Financial Reporting",
        "Dedicated WhatsApp & VIP Priority Support",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Simple, Transparent Pricing
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Invest in your creative business operating system.
          </p>
          <p className="text-slate-400 text-base sm:text-lg">
            Save over $180/mo by replacing 7 disconnected subscriptions with Crea8or.
          </p>

          {/* Toggle Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Monthly / Annual Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#0f111d] border border-white/[0.08]">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  !isAnnual ? "bg-white/[0.08] text-white" : "text-slate-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isAnnual
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
                    : "text-slate-400"
                }`}
              >
                Annual Billing
                <span className="text-[9px] font-bold bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-400/30">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center p-1 rounded-xl bg-[#0f111d] border border-white/[0.08]">
              <button
                onClick={() => setCurrency("NGN")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currency === "NGN" ? "bg-white/[0.08] text-white" : "text-slate-400"
                }`}
              >
                ₦ NGN
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currency === "USD" ? "bg-white/[0.08] text-white" : "text-slate-400"
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-b from-[#141629] via-[#0f111f] to-[#0c0d18] border-2 border-violet-500 shadow-[0_0_50px_rgba(124,58,237,0.25)] lg:-translate-y-3"
                  : "bg-[#0d0e19] border border-white/[0.08] hover:border-white/[0.18]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">
                    {plan.priceNGN === 0
                      ? "Free"
                      : currency === "NGN"
                      ? `₦${plan.priceNGN.toLocaleString()}`
                      : `$${plan.priceUSD}`}
                  </span>
                  {plan.priceNGN > 0 && (
                    <span className="text-xs text-slate-400">/{plan.period}</span>
                  )}
                </div>

                <div className="pt-6 border-t border-white/[0.06] space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Included Features:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            plan.popular ? "text-violet-400" : "text-slate-400"
                          }`}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/register"
                  className={`w-full py-3.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:scale-[1.02]"
                      : "bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
