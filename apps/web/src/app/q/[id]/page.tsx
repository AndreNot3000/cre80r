"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Printer,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Mail,
  Loader2,
  ChevronRight,
  AlertCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface PublicProposalPageProps {
  params: Promise<{ id: string }>;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  GHS: "GH₵",
  KES: "KSh",
  ZAR: "R",
};

export default function PublicProposalPage({ params }: PublicProposalPageProps) {
  const resolvedParams = use(params);
  const quoteId = resolvedParams.id;

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signerName, setSignerName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/public/quotes/${quoteId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Proposal not found");
        return res.json();
      })
      .then((data) => {
        setQuote(data);
        if (data.clientName) setSignerName(data.clientName);
      })
      .catch((err) => {
        console.error("Error loading proposal:", err);
        toast.error("Failed to load proposal details");
      })
      .finally(() => setLoading(false));
  }, [quoteId]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) {
      toast.error("Please enter your full legal name to sign");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Please agree to the production terms & creative agreement");
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch(`/api/public/quotes/${quoteId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName: signerName.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to accept proposal");
      }

      const result = await res.json();
      setQuote(result.quote);
      if (result.invoice?.id) {
        setCreatedInvoiceId(result.invoice.id);
      }
      toast.success("🎉 Proposal accepted & digitally signed successfully!");
    } catch (err: any) {
      console.error("Accept error:", err);
      toast.error(err?.message || "Failed to accept proposal");
    } finally {
      setAccepting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading production proposal...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h1 className="text-lg font-bold">Proposal Not Found</h1>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
          This proposal link may have expired or been archived by the studio.
        </p>
        <Link
          href="/"
          className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
        >
          Return to Home ↗
        </Link>
      </div>
    );
  }

  const sym = CURRENCY_SYMBOLS[quote.currency] || "₦";
  const lineItems = Array.isArray(quote.lineItems) ? quote.lineItems : [];
  const subtotal = Number(quote.subtotal || 0);
  const taxAmount = Number(quote.taxAmount || 0);
  const discountAmount = Number(quote.discountAmount || 0);
  const total = Number(quote.total || 0);
  const depositMilestone = Math.round(total * 0.5);
  const finalMilestone = total - depositMilestone;
  const isAccepted = quote.status === "accepted";

  return (
    <div className="min-h-screen bg-[#07080d] text-white selection:bg-violet-500 font-sans p-4 sm:p-8 md:p-12 print:bg-white print:text-black print:p-0">
      {/* Ambient Top Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none print:hidden" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Top Floating Action Bar */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white text-[10px]">
                8
              </span>
              {quote.studioName || "Creative Studio"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* ─── Main Proposal Document Card ───────────────────────────────────── */}
        <div className="bg-[#0c0d17] border border-white/[0.1] rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/[0.08] print:border-gray-300">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 print:hidden">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Production & Creative Proposal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight print:text-black">
                {quote.studioName || "Creative Studio"}
              </h1>
              <p className="text-xs text-slate-400">
                Prepared exclusively for:{" "}
                <span className="text-white font-bold text-sm block sm:inline print:text-black">
                  {quote.clientName || "Valued Client"}
                </span>
              </p>
            </div>

            <div className="sm:text-right space-y-1 text-xs">
              <div className="font-mono text-base font-bold text-white print:text-black">
                {quote.quoteNumber}
              </div>
              <div className="text-slate-400 text-[11px]">
                Date:{" "}
                {new Date(quote.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div>
                {isAccepted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Accepted & Signed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    <Clock className="w-3 h-3" /> Awaiting Client Approval
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Deliverables Line Items Table */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Scope of Deliverables & Production Schedule
            </h2>

            <div className="border border-white/[0.08] rounded-2xl overflow-hidden print:border-gray-300">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold text-slate-400 uppercase print:bg-gray-100 print:text-black">
                    <th className="py-3 px-4">Item & Scope Description</th>
                    <th className="py-3 px-4 text-center w-16">Qty</th>
                    <th className="py-3 px-4 text-right w-28">Unit Price</th>
                    <th className="py-3 px-4 text-right w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] print:divide-gray-200">
                  {lineItems.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block print:text-black">
                          {item.description}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-300 font-mono">
                        {sym}{Number(item.unitPrice).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-white font-mono font-bold print:text-black">
                        {sym}{Number(item.total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Milestone Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Notes & Terms */}
            <div className="space-y-3">
              {quote.notes && (
                <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl space-y-1 print:border-gray-300">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Production Terms & Notes
                  </span>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed print:text-black">
                    {quote.notes}
                  </p>
                </div>
              )}

              {quote.terms && (
                <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl space-y-1 print:border-gray-300">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Creative Agreement & Licensing
                  </span>
                  <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed print:text-gray-700">
                    {quote.terms}
                  </p>
                </div>
              )}
            </div>

            {/* Price Calculations & Milestones */}
            <div className="space-y-3">
              <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl space-y-3 print:border-gray-300">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white print:text-black font-semibold">
                    {sym}{subtotal.toLocaleString()}
                  </span>
                </div>

                {taxAmount > 0 && (
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>VAT / Tax ({quote.taxRate}%)</span>
                    <span className="font-mono text-white print:text-black font-semibold">
                      +{sym}{taxAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Discount</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      -{sym}{discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-white/[0.08] flex justify-between items-baseline print:border-gray-300">
                  <span className="text-sm font-bold text-white print:text-black">Total Investment</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight print:text-black">
                    {sym}{total.toLocaleString()}
                  </span>
                </div>

                {/* Milestone Schedule */}
                <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs print:border-gray-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Payment Schedule:
                  </span>
                  <div className="flex justify-between p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-200">
                    <span className="font-semibold">50% Booking Deposit</span>
                    <span className="font-mono font-bold">{sym}{depositMilestone.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between px-2.5 py-1 text-slate-400">
                    <span>50% Final Settlement</span>
                    <span className="font-mono">{sym}{finalMilestone.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Digital Acceptance & Signature Section ──────────────────────── */}
          <div className="pt-6 border-t border-white/[0.08] print:border-gray-300">
            {isAccepted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Proposal Officially Accepted & Signed</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Thank you! Your shoot date is reserved. The studio team has been notified.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleAccept}
                className="bg-gradient-to-br from-violet-950/30 to-indigo-950/20 border border-violet-500/20 rounded-3xl p-6 sm:p-8 space-y-5 print:hidden"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Digital Approval & Signature
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  By signing below, you approve the itemized scope of deliverables and agree to the
                  production terms and deposit schedule.
                </p>

                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Legal Signer Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="e.g. Adeola Williams"
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-violet-600 bg-white/[0.04] border-white/[0.1] focus:ring-violet-500/40"
                    />
                    <span className="text-xs text-slate-300 leading-normal">
                      I confirm that I am authorized to approve this proposal, and I agree to the
                      production terms, deliverables, and 50% deposit reservation schedule.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={accepting}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {accepting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {accepting ? "Processing Signature..." : "Accept Proposal & Sign Agreement"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
