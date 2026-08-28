"use client";

import { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Receipt,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Printer,
  CreditCard,
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface PublicInvoicePageProps {
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

function PublicInvoiceContent({ invoiceId }: { invoiceId: string }) {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const simulatedPay = searchParams.get("simulated_pay");

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [justPaid, setJustPaid] = useState(false);

  useEffect(() => {
    fetch(`/api/public/invoices/${invoiceId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Invoice not found");
        return res.json();
      })
      .then((data) => {
        setInvoice(data);

        // Check if returning from simulated payment or callback
        if (reference && (simulatedPay === "true" || data.status !== "paid")) {
          fetch(`/api/payments/verify/${reference}?simulated=true&invoiceId=${invoiceId}`)
            .then((r) => r.json())
            .then((verifyRes) => {
              if (verifyRes.success) {
                setJustPaid(true);
                setInvoice((prev: any) => ({ ...prev, status: "paid", amountPaid: prev.total }));
                toast.success("🎉 Payment verified and recorded successfully!");
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error("Error loading invoice:", err);
        toast.error("Failed to load invoice details");
      })
      .finally(() => setLoading(false));
  }, [invoiceId, reference, simulatedPay]);

  const handlePaystackCheckout = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/payments/checkout/${invoiceId}`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to initialize payment");
      }

      const data = await res.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.error("Unable to generate payment checkout URL");
      }
    } catch (err: any) {
      console.error("Payment init error:", err);
      toast.error(err?.message || "Failed to initialize payment");
      setPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading secure checkout...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h1 className="text-lg font-bold">Invoice Not Found</h1>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
          This invoice link may have expired or been deleted.
        </p>
        <Link href="/" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
          Return to Home ↗
        </Link>
      </div>
    );
  }

  const sym = CURRENCY_SYMBOLS[invoice.currency] || "₦";
  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  const subtotal = Number(invoice.subtotal || 0);
  const taxAmount = Number(invoice.taxAmount || 0);
  const discountAmount = Number(invoice.discountAmount || 0);
  const total = Number(invoice.total || 0);
  const isPaid = invoice.status === "paid" || justPaid;

  return (
    <div className="min-h-screen bg-[#07080d] text-white selection:bg-emerald-500 font-sans p-4 sm:p-8 md:p-12 print:bg-white print:text-black print:p-0">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none print:hidden" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-[10px]">
                8
              </span>
              {invoice.studioName || "Creative Studio"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save Receipt
            </button>
          </div>
        </div>

        {/* ─── Main Invoice Document Card ─────────────────────────────────────── */}
        <div className="bg-[#0c0d17] border border-white/[0.1] rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/[0.08] print:border-gray-300">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-300 print:hidden">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Official Studio Invoice
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight print:text-black">
                {invoice.studioName || "Creative Studio"}
              </h1>
              <p className="text-xs text-slate-400">
                Billed to:{" "}
                <span className="text-white font-bold text-sm block sm:inline print:text-black">
                  {invoice.clientName || "Valued Client"}
                </span>
                {invoice.clientEmail && (
                  <span className="block text-[11px] text-slate-500 mt-0.5">{invoice.clientEmail}</span>
                )}
              </p>
            </div>

            <div className="sm:text-right space-y-1 text-xs">
              <div className="font-mono text-base font-bold text-white print:text-black">
                {invoice.invoiceNumber}
              </div>
              <div className="text-slate-400 text-[11px]">
                Date:{" "}
                {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Paid in Full
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Clock className="w-3 h-3" /> Payment Due
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Billed Deliverables & Services
            </h2>

            <div className="border border-white/[0.08] rounded-2xl overflow-hidden print:border-gray-300">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold text-slate-400 uppercase print:bg-gray-100 print:text-black">
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center w-16">Qty</th>
                    <th className="py-3 px-4 text-right w-28">Unit Price</th>
                    <th className="py-3 px-4 text-right w-32">Amount</th>
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

          {/* Financial Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Notes & Bank Details */}
            <div className="space-y-3">
              {invoice.notes && (
                <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl space-y-1 print:border-gray-300">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Payment Instructions
                  </span>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed print:text-black">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Total Calculation */}
            <div className="space-y-3">
              <div className="bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl space-y-3 print:border-gray-300">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white font-semibold print:text-black">
                    {sym}{subtotal.toLocaleString()}
                  </span>
                </div>

                {taxAmount > 0 && (
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>VAT / Tax</span>
                    <span className="font-mono text-white font-semibold print:text-black">
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
                  <span className="text-sm font-bold text-white print:text-black">Total Invoiced</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight print:text-black">
                    {sym}{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Paystack Online Checkout Section ────────────────────────────── */}
          <div className="pt-6 border-t border-white/[0.08] print:hidden">
            {isPaid ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Invoice Paid & Settled</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Thank you for your payment! An automated receipt has been archived for your records.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-950/30 to-teal-950/20 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Pay Online via Paystack
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300">
                      Secure checkout supporting Debit Card, Direct Bank Transfer, Apple Pay, USSD, and Mobile Money.
                    </p>
                  </div>

                  <button
                    onClick={handlePaystackCheckout}
                    disabled={paying}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {paying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {paying ? "Opening Secure Checkout..." : `Pay ${sym}${total.toLocaleString()} Now`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicInvoicePage({ params }: PublicInvoicePageProps) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07080d] text-white flex items-center justify-center text-xs text-slate-400">Loading invoice...</div>}>
      <PublicInvoiceContent invoiceId={resolvedParams.id} />
    </Suspense>
  );
}
