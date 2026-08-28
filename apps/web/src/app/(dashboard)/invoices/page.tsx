"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Receipt,
  Send,
  CheckCircle2,
  Clock,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
  Calendar,
  CreditCard,
  Sparkles,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { CreateInvoiceModal } from "@/components/invoices/create-invoice-modal";

type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  total: string;
  amountPaid: string;
  currency: string;
  status: "draft" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled";
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  notes: string | null;
};

const STATUS_TABS = ["all", "draft", "sent", "partially_paid", "paid", "overdue"] as const;

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Failed to load invoices");
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading invoices:", err);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleInvoiceCreated = (saved: Invoice) => {
    setInvoices((prev) => [saved, ...prev]);
  };

  const handleMarkPaid = async (id: string, invoiceNumber: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/mark-paid`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to mark invoice as paid");

      const updated = await res.json();
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: "paid", amountPaid: inv.total } : inv))
      );
      toast.success(`Invoice ${invoiceNumber} marked as PAID! Payment record created in ledger.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update invoice");
    }
  };

  const handleSendInvoice = async (id: string, invoiceNumber: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send invoice");

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: "sent" } : inv))
      );
      toast.success(`Invoice ${invoiceNumber} dispatched to client!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update invoice");
    }
  };

  const handleCopyLink = (id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/i/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Public Paystack checkout & invoice link copied to clipboard!");
  };

  const handleDeleteInvoice = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) return;

    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete invoice");

      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast.success(`Invoice ${invoiceNumber} deleted`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete invoice");
    }
  };

  // Filter invoices
  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.clientName && inv.clientName.toLowerCase().includes(search.toLowerCase())) ||
      (inv.notes && inv.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesTab = activeTab === "all" || inv.status === activeTab;

    return matchesSearch && matchesTab;
  });

  // Calculate financial metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.amountPaid || 0), 0);
  const outstandingBalance = totalInvoiced - totalCollected;
  const overdueCount = invoices.filter((inv) => {
    if (inv.status === "paid" || !inv.dueDate) return false;
    return new Date(inv.dueDate) < new Date();
  }).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-300 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Financial Ledger & Invoicing
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Invoices & Payments</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track client billing, deposit schedules, automated receipts, and outstanding cash flow.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl font-semibold transition shadow-[0_0_20px_rgba(16,185,129,0.4)] self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Invoice
        </button>
      </div>

      {/* ─── Metric Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Invoiced</span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ₦{Math.round(totalInvoiced).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gross billings generated</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Revenue Collected</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono text-emerald-400">
            ₦{Math.round(totalCollected).toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Settled in studio bank account</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Outstanding Balance</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono text-cyan-300">
            ₦{Math.round(outstandingBalance).toLocaleString()}
          </div>
          <p className="text-[11px] text-cyan-400 mt-1">Awaiting client settlement</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Overdue Invoices</span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {overdueCount} Invoices
          </div>
          <p className="text-[11px] text-rose-400 mt-1">Requiring automated follow-up</p>
        </div>
      </div>

      {/* ─── Search & Tab Filters ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0d17] p-3 rounded-2xl border border-white/[0.08]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search invoices by number, client, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl capitalize transition border whitespace-nowrap ${
                activeTab === tab
                  ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Invoices Table ─────────────────────────────────────────────────── */}
      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading invoice ledger...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-4 p-8">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No invoices found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {search || activeTab !== "all"
                  ? "Try changing your search terms or status filter."
                  : "Create invoices for shoots, retainer milestones, or convert accepted proposals."}
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Total Billed</th>
                  <th className="py-3.5 px-6">Paid</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {filtered.map((invoice) => {
                  const isOverdue =
                    invoice.status !== "paid" &&
                    invoice.dueDate &&
                    new Date(invoice.dueDate) < new Date();

                  return (
                    <tr key={invoice.id} className="hover:bg-white/[0.02] transition group">
                      {/* Invoice Number */}
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {invoice.invoiceNumber}
                      </td>

                      {/* Client */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">
                          {invoice.clientName || "Direct Client"}
                        </div>
                        {invoice.clientEmail && (
                          <div className="text-[11px] text-slate-400">{invoice.clientEmail}</div>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-4 px-6 font-mono font-bold text-white text-sm">
                        ₦{Number(invoice.total).toLocaleString()}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-4 px-6 font-mono font-semibold text-emerald-400 text-xs">
                        ₦{Number(invoice.amountPaid || 0).toLocaleString()}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                        {invoice.dueDate ? (
                          <span className={isOverdue ? "text-rose-400 font-bold" : ""}>
                            {new Date(invoice.dueDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          "Upon Receipt"
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {invoice.status === "paid" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        )}
                        {invoice.status === "sent" && !isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            <Clock className="w-3 h-3" /> Sent
                          </span>
                        )}
                        {invoice.status === "draft" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                            Draft
                          </span>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <AlertCircle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </td>

                      {/* Quick Action Triggers */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Public Checkout Link */}
                          <button
                            onClick={() => handleCopyLink(invoice.id)}
                            title="Copy Public Paystack Checkout Link"
                            className="p-1.5 text-slate-400 hover:text-emerald-300 rounded-lg hover:bg-emerald-500/10 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Mark as Paid Trigger */}
                          {invoice.status !== "paid" && (
                            <button
                              onClick={() => handleMarkPaid(invoice.id, invoice.invoiceNumber)}
                              title="Mark as Paid"
                              className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded-lg hover:bg-emerald-500/10 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Send Trigger */}
                          {invoice.status === "draft" && (
                            <button
                              onClick={() => handleSendInvoice(invoice.id, invoice.invoiceNumber)}
                              title="Send to Client"
                              className="p-1.5 text-cyan-400 hover:text-cyan-300 rounded-lg hover:bg-cyan-500/10 transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Action */}
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id, invoice.invoiceNumber)}
                            title="Delete Invoice"
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

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleInvoiceCreated}
      />
    </div>
  );
}
