import { Users, Filter, ArrowRight, ShieldCheck, Mail, Phone, Tag } from "lucide-react";

export function CRMShowcase() {
  return (
    <section className="py-20 border-t border-white/[0.06] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-400">
              <Users className="w-4 h-4" />
              Client Relationship Management
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Turn cold inquiries into high-value repeat clients.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Every client gets a dedicated portal. Track their budget, previous shoots,
              signed contracts, unpaid invoices, and preferences without rummaging through old email threads.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs">✓</span>
                Embeddable lead inquiry forms for your Instagram bio & portfolio
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs">✓</span>
                Custom tags: VIP, Commercial Retainer, Wedding, Fashion
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs">✓</span>
                Automatic client spending analytics & relationship timeline
              </li>
            </ul>
          </div>

          {/* Right Visual Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/[0.1] bg-[#0c0d15] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-4">
              {/* Client Profile Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 text-white font-bold flex items-center justify-center text-sm">
                    KW
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      Kolawole Luxury Wear
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        VIP Client
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">press@kolawole.ng • Lagos, Nigeria</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Lifetime Spend</div>
                  <div className="text-sm font-bold text-emerald-400">₦4,750,000</div>
                </div>
              </div>

              {/* History Timeline preview */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Recent Interactions
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-200">Contract Signed (Q3 Lookbook)</div>
                      <div className="text-[10px] text-slate-500">Signed on Aug 18 • IP: 102.89.44.12</div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-200">Paystack Invoice #INV-802912 Paid</div>
                      <div className="text-[10px] text-slate-500">70% Initial Deposit</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400">₦1,200,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
