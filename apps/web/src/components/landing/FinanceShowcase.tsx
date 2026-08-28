import { CreditCard, DollarSign, ShieldCheck, CheckCircle2, ArrowRight, FileText } from "lucide-react";

export function FinanceShowcase() {
  return (
    <section className="py-20 border-t border-white/[0.06] relative bg-[#090b14]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Mockup */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-2xl border border-emerald-500/20 bg-[#0a0d16] p-5 sm:p-6 shadow-[0_20px_50px_rgba(16,185,129,0.1)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Invoice #INV-802911 • Ade & Tolu</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Paystack Verified ✓
                </span>
              </div>

              {/* Line Items Table Preview */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white/[0.02] flex items-center justify-between">
                  <span className="text-slate-300">Wedding Cinema Package (Full Day)</span>
                  <span className="font-semibold text-white">₦1,850,000</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] flex items-center justify-between">
                  <span className="text-slate-300">4K Drone Aerial Cinematography</span>
                  <span className="font-semibold text-white">₦250,000</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] flex items-center justify-between">
                  <span className="text-slate-300">Second Camera Operator (Day Rate)</span>
                  <span className="font-semibold text-white">₦150,000</span>
                </div>
              </div>

              {/* Total & Payout Card */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Total Invoice (70% Deposit Paid)</div>
                  <div className="text-lg font-bold text-white">₦2,250,000</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    Paid via Paystack Link
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <CreditCard className="w-4 h-4" />
              African & Global Finance
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Get paid fast with native Paystack & Stripe integrations.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              No more awkward manual bank transfer screenshots on WhatsApp. Send elegant online payment links that allow your clients to pay with Debit Cards, Bank Transfer, Apple Pay, and USSD.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">✓</span>
                Native multi-currency support: ₦ (NGN), GHS, KES, ZAR, USD, GBP
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">✓</span>
                Automated deposit, split payments, and final balance release
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">✓</span>
                Instant payment reconciliation with automatic contract execution
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
