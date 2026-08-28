"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  Eye,
  Sparkles,
  Trash2,
  ExternalLink,
  Copy,
  TrendingUp,
  DollarSign,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type Quote = {
  id: string;
  quoteNumber: string;
  clientId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  discountAmount: string;
  total: string;
  currency: string;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  lineItems: any[];
  notes: string | null;
  createdAt: string;
};

const STATUS_TABS = ["all", "draft", "sent", "accepted"] as const;

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "sent" | "accepted">("all");

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error("Failed to load quotes");
      const data = await res.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading quotes:", err);
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleSendQuote = async (id: string, quoteNumber: string) => {
    try {
      const res = await fetch(`/api/quotes/${id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send quote");

      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "sent" } : q))
      );
      toast.success(`Proposal ${quoteNumber} marked as sent!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update quote");
    }
  };

  const handleAcceptQuote = async (id: string, quoteNumber: string) => {
    try {
      const res = await fetch(`/api/quotes/${id}/accept`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept quote");

      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "accepted" } : q))
      );
      toast.success(`Proposal ${quoteNumber} accepted by client!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update quote");
    }
  };

  const handleDeleteQuote = async (id: string, quoteNumber: string) => {
    if (!confirm(`Are you sure you want to delete proposal ${quoteNumber}?`)) return;

    try {
      const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete quote");

      setQuotes((prev) => prev.filter((q) => q.id !== id));
      toast.success(`Proposal ${quoteNumber} deleted`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete quote");
    }
  };

  const handleCopyLink = (id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/q/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Public client proposal link copied to clipboard!");
  };

  // Filter quotes
  const filtered = quotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      (q.clientName && q.clientName.toLowerCase().includes(search.toLowerCase())) ||
      (q.notes && q.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesTab = activeTab === "all" || q.status === activeTab;

    return matchesSearch && matchesTab;
  });

  // Calculate metrics
  const totalValue = quotes.reduce((sum, q) => sum + Number(q.total || 0), 0);
  const acceptedValue = quotes
    .filter((q) => q.status === "accepted")
    .reduce((sum, q) => sum + Number(q.total || 0), 0);
  const pendingCount = quotes.filter((q) => q.status === "sent" || q.status === "draft").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Proposals & Quotes
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quotes & Proposals</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build itemized production proposals with live auto-math, milestones, and client approvals.
          </p>
        </div>

        <Link
          href="/quotes/new"
          className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl font-semibold transition shadow-[0_0_20px_rgba(124,58,237,0.4)] self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Proposal
        </Link>
      </div>

      {/* ─── Metric Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Quoted Value</span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ₦{totalValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all issued proposals</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Accepted Revenue</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ₦{acceptedValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Confirmed client bookings</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Review</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {pendingCount} Proposals
          </div>
          <p className="text-[11px] text-cyan-300 mt-1">In draft or awaiting client signature</p>
        </div>
      </div>

      {/* ─── Search & Tab Filters ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0d17] p-3 rounded-2xl border border-white/[0.08]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by quote #, client name, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl capitalize transition border ${
                activeTab === tab
                  ? "bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                  : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
              }`}
            >
              {tab === "all" ? "All Quotes" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Quotes Table ───────────────────────────────────────────────────── */}
      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-7 h-7 text-violet-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading quotes & proposals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-4 p-8">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No proposals found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {search || activeTab !== "all"
                  ? "Try changing your search terms or status filter."
                  : "Create and send your first professional proposal with automatic math and milestones."}
              </p>
            </div>
            <Link
              href="/quotes/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Proposal
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Quote #</th>
                  <th className="py-3.5 px-6">Client / Scope</th>
                  <th className="py-3.5 px-6">Total Investment</th>
                  <th className="py-3.5 px-6">Date Created</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {filtered.map((quote) => {
                  const lineItemsCount = Array.isArray(quote.lineItems) ? quote.lineItems.length : 0;
                  const firstItem = Array.isArray(quote.lineItems) && quote.lineItems[0]?.description;

                  return (
                    <tr key={quote.id} className="hover:bg-white/[0.02] transition group">
                      {/* Quote Number */}
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {quote.quoteNumber}
                      </td>

                      {/* Client / Scope */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">
                          {quote.clientName || "Direct Prospect"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                          {firstItem || `${lineItemsCount} Deliverable Items`}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6 font-mono font-bold text-emerald-400 text-sm">
                        ₦{Number(quote.total).toLocaleString()}
                      </td>

                      {/* Date Created */}
                      <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                        {new Date(quote.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {quote.status === "accepted" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted
                          </span>
                        )}
                        {quote.status === "sent" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            <Clock className="w-3 h-3" />
                            Sent / Pending
                          </span>
                        )}
                        {quote.status === "draft" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                            Draft
                          </span>
                        )}
                        {quote.status === "declined" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            Declined
                          </span>
                        )}
                      </td>

                      {/* Action Triggers */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Link */}
                          <button
                            onClick={() => handleCopyLink(quote.id)}
                            title="Copy Client Proposal Link"
                            className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-cyan-500/10 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Send Trigger */}
                          {quote.status === "draft" && (
                            <button
                              onClick={() => handleSendQuote(quote.id, quote.quoteNumber)}
                              title="Mark as Sent"
                              className="p-1.5 text-violet-400 hover:text-violet-300 rounded-lg hover:bg-violet-500/10 transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Accept Trigger */}
                          {quote.status === "sent" && (
                            <button
                              onClick={() => handleAcceptQuote(quote.id, quote.quoteNumber)}
                              title="Mark as Accepted"
                              className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded-lg hover:bg-emerald-500/10 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Action */}
                          <button
                            onClick={() => handleDeleteQuote(quote.id, quote.quoteNumber)}
                            title="Delete Proposal"
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
