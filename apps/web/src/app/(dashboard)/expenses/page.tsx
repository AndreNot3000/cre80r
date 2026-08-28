"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  ArrowUpRight,
  Sparkles,
  Camera,
  Users,
  Car,
  Building2,
  Film,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  ExternalLink,
  Download,
  Loader2,
  FolderKanban,
  PieChart,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { LogExpenseModal } from "@/components/expenses/log-expense-modal";

type ExpenseItem = {
  id: string;
  category: string;
  description: string;
  vendor: string | null;
  amount: string;
  currency: string;
  receiptUrl: string | null;
  expenseDate: string;
  paymentMethod: string | null;
  isReimbursable: boolean;
  isPaid: boolean;
  notes: string | null;
  createdAt: string;
  projectId: string | null;
  projectName: string | null;
};

type PnlData = {
  grossRevenue: number;
  totalInvoiced: number;
  totalExpenses: number;
  netProfit: number;
  netMarginPct: number;
  categoryBreakdown: {
    category: string;
    total: number;
    count: number;
    percentage: number;
  }[];
  projectMargins: {
    projectId: string;
    projectName: string;
    status: string;
    revenue: number;
    expenses: number;
    netProfit: number;
    marginPct: number;
  }[];
};

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  crew_fees: { label: "Crew Fees", icon: Users, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  gear_rentals: { label: "Gear Rentals", icon: Camera, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  transport_logistics: { label: "Transport", icon: Car, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  studio_rental: { label: "Studio Rental", icon: Building2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  post_production: { label: "Post-Production", icon: Film, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  props_styling: { label: "Props & Styling", icon: Sparkles, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  software_subscriptions: { label: "Software", icon: Layers, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  other: { label: "General Overhead", icon: Receipt, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
};

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<"ledger" | "pnl">("ledger");
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [pnl, setPnl] = useState<PnlData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>("all");

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [receiptViewerUrl, setReceiptViewerUrl] = useState<string | null>(null);

  // 1. Fetch Expenses & P&L
  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, pnlRes] = await Promise.all([
        fetch("/api/expenses"),
        fetch("/api/expenses/pnl"),
      ]);

      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(Array.isArray(expData) ? expData : []);
      }

      if (pnlRes.ok) {
        const pnlData = await pnlRes.json();
        setPnl(pnlData);
      }
    } catch (err) {
      console.error("Error loading expenses:", err);
      toast.error("Failed to load studio expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchCat = selectedCategory === "all" || exp.category === selectedCategory;
      const matchProj = selectedProjectFilter === "all" || exp.projectId === selectedProjectFilter;
      const matchSearch =
        !search ||
        exp.description.toLowerCase().includes(search.toLowerCase()) ||
        (exp.vendor && exp.vendor.toLowerCase().includes(search.toLowerCase())) ||
        (exp.projectName && exp.projectName.toLowerCase().includes(search.toLowerCase())) ||
        (exp.notes && exp.notes.toLowerCase().includes(search.toLowerCase()));

      return matchCat && matchProj && matchSearch;
    });
  }, [expenses, selectedCategory, selectedProjectFilter, search]);

  // Unique Projects for Filter Dropdown
  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const exp of expenses) {
      if (exp.projectId && exp.projectName) {
        map.set(exp.projectId, exp.projectName);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [expenses]);

  // Delete Expense
  const handleDeleteExpense = async (id: string, description: string) => {
    if (!confirm(`Are you sure you want to delete "${description}"?`)) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete expense");

      toast.success("Expense deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  // Top Cost Center
  const topCostCenter = useMemo(() => {
    if (!pnl?.categoryBreakdown || pnl.categoryBreakdown.length === 0) return null;
    const sorted = [...pnl.categoryBreakdown].sort((a, b) => b.total - a.total);
    const top = sorted[0];
    if (!top) return null;
    const catInfo = CATEGORY_MAP[top.category] || { label: top.category, color: "text-violet-400" };
    return { ...top, ...catInfo };
  }, [pnl]);

  // Export CSV
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      toast.error("No expenses to export");
      return;
    }
    const headers = ["Date", "Category", "Description", "Vendor", "Amount", "Currency", "Project", "Payment Method", "Paid", "Reimbursable", "Notes"];
    const rows = expenses.map((e) => [
      new Date(e.expenseDate).toLocaleDateString("en-GB"),
      e.category,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${(e.vendor || '').replace(/"/g, '""')}"`,
      e.amount,
      e.currency,
      `"${(e.projectName || 'General Studio').replace(/"/g, '""')}"`,
      e.paymentMethod || "bank_transfer",
      e.isPaid ? "Yes" : "No",
      e.isReimbursable ? "Yes" : "No",
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crea8or_studio_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Expenses exported to CSV!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-16">
      {/* ─── Header & Top Actions ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Studio Expenses & P&L Margins
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              Live Margins
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track shoot overheads, gear rentals, crew day rates, and real-time net profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
            title="Download CSV spreadsheet for accounting"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingExpense(null);
              setIsLogModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* ─── 4 Hero Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Gross Revenue */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Gross Invoiced Revenue</span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ₦{(pnl?.totalInvoiced || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            ₦{(pnl?.grossRevenue || 0).toLocaleString()} collected in bank
          </p>
        </div>

        {/* 2. Total Expenses */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Studio Expenses</span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-300 tracking-tight">
            ₦{(pnl?.totalExpenses || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {expenses.length} logged expense items
          </p>
        </div>

        {/* 3. Net Profit & Margin */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Net Profit (Take-Home)</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-300 tracking-tight flex items-baseline gap-2">
            <span>₦{(pnl?.netProfit || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              {(pnl?.netMarginPct || 0)}% Margin
            </span>
            <span className="text-[11px] text-slate-400">after all shoot costs</span>
          </div>
        </div>

        {/* 4. Top Cost Center */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Top Cost Center</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <PieChart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-300 tracking-tight truncate">
            {topCostCenter ? topCostCenter.label : "None Yet"}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {topCostCenter
              ? `${topCostCenter.percentage}% of costs (₦${topCostCenter.total.toLocaleString()})`
              : "Log expenses to track breakdown"}
          </p>
        </div>
      </div>

      {/* ─── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 border-b border-white/[0.08]">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === "ledger"
              ? "border-violet-500 text-white shadow-xs"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Receipt className="w-4 h-4 text-violet-400" />
          <span>Expenses Ledger ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pnl")}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === "pnl"
              ? "border-emerald-400 text-white shadow-xs"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Project Net Margins & P&L</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Analytics
          </span>
        </button>
      </div>

      {/* ─── TAB 1: Expenses Ledger ─────────────────────────────────────────── */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0d17] p-3 rounded-2xl border border-white/[0.08]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by description, vendor, project, or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {projectOptions.length > 0 && (
                <select
                  value={selectedProjectFilter}
                  onChange={(e) => setSelectedProjectFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-[#151624] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                  <option value="all">All Projects</option>
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === "all"
                  ? "bg-white text-black shadow-xs font-bold"
                  : "bg-[#0c0d17] text-slate-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              All Categories
            </button>
            {Object.entries(CATEGORY_MAP).map(([key, cat]) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-violet-600 text-white shadow-xs font-bold"
                      : "bg-[#0c0d17] text-slate-400 hover:text-white border border-white/[0.08]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Expenses Table */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-violet-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading studio expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-8">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No expenses logged</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Log gear rentals, assistant camera day rates, location bookings, or fuel costs.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setIsLogModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_15px_rgba(124,58,237,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                Log First Expense
              </button>
            </div>
          ) : (
            <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Description & Vendor</th>
                      <th className="py-3.5 px-4">Shoot Project</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-slate-300">
                    {filteredExpenses.map((exp) => {
                      const catInfo = CATEGORY_MAP[exp.category] || CATEGORY_MAP.other!;
                      const Icon = catInfo.icon;
                      const formattedDate = new Date(exp.expenseDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <tr key={exp.id} className="hover:bg-white/[0.02] transition group">
                          {/* Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                            {formattedDate}
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${catInfo.bg} ${catInfo.color}`}>
                              <Icon className="w-3 h-3" />
                              <span>{catInfo.label}</span>
                            </span>
                          </td>

                          {/* Description & Vendor */}
                          <td className="py-3.5 px-4 max-w-[280px]">
                            <div className="font-semibold text-white truncate">{exp.description}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              {exp.vendor && <span className="text-cyan-300 truncate">{exp.vendor}</span>}
                              {exp.receiptUrl && (
                                <button
                                  onClick={() => setReceiptViewerUrl(exp.receiptUrl)}
                                  className="text-violet-400 hover:text-violet-300 flex items-center gap-0.5 text-[10px]"
                                >
                                  <Paperclip className="w-2.5 h-2.5" /> Receipt
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Project */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {exp.projectName ? (
                              <span className="text-cyan-300 font-medium truncate max-w-[160px] inline-block">
                                {exp.projectName}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">General Studio</span>
                            )}
                          </td>

                          {/* Payment status & method */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {exp.isPaid ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                  Paid
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  Unpaid
                                </span>
                              )}
                              {exp.isReimbursable && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" title="Reimbursable by client">
                                  Reimbursable
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-white">
                            {exp.currency === "USD" ? "$" : "₦"}
                            {Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                              <button
                                onClick={() => {
                                  setEditingExpense(exp);
                                  setIsLogModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                                title="Edit expense"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(exp.id, exp.description)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Delete expense"
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
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: Project Net Profit Margins (P&L Analytics) ───────────────── */}
      {activeTab === "pnl" && (
        <div className="space-y-6">
          {/* Top Category Distribution Bar */}
          {pnl?.categoryBreakdown && pnl.categoryBreakdown.length > 0 && (
            <div className="bg-[#0c0d17] p-6 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                <span>Cost Center Distribution</span>
              </h3>

              {/* Progress Stack Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/[0.05]">
                {pnl.categoryBreakdown.map((cat, i) => {
                  const colors = [
                    "bg-violet-500",
                    "bg-cyan-400",
                    "bg-emerald-400",
                    "bg-amber-400",
                    "bg-rose-400",
                    "bg-pink-400",
                    "bg-blue-400",
                  ];
                  return (
                    <div
                      key={cat.category}
                      style={{ width: `${cat.percentage}%` }}
                      className={`${colors[i % colors.length]} h-full transition-all duration-500`}
                      title={`${cat.category}: ${cat.percentage}%`}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {pnl.categoryBreakdown.map((cat) => {
                  const catInfo = CATEGORY_MAP[cat.category] || CATEGORY_MAP.other!;
                  const Icon = catInfo.icon;
                  return (
                    <div key={cat.category} className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Icon className={`w-3.5 h-3.5 ${catInfo.color}`} />
                        <span className="font-semibold">{catInfo.label}</span>
                      </div>
                      <div className="text-sm font-bold text-white font-mono">
                        ₦{cat.total.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        {cat.percentage}% of total costs
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Project Margins Table */}
          <div className="bg-[#0c0d17] p-6 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-violet-400" />
                  <span>Project Net Margins Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculates real net margin by subtracting gear rentals, crew fees, and shoot logistics from invoice revenue.
                </p>
              </div>
            </div>

            {!pnl?.projectMargins || pnl.projectMargins.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No shoot projects found. Create a project in the Projects Hub to track its margins.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Shoot Project</th>
                      <th className="py-3 px-4 text-right">Invoiced Revenue</th>
                      <th className="py-3 px-4 text-right">Shoot Costs</th>
                      <th className="py-3 px-4 text-right">Net Profit</th>
                      <th className="py-3 px-4">Net Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-slate-300">
                    {pnl.projectMargins.map((p) => {
                      const isHighMargin = p.marginPct >= 65;
                      const isMediumMargin = p.marginPct >= 40 && p.marginPct < 65;

                      return (
                        <tr key={p.projectId} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white truncate">{p.projectName}</div>
                            <span className="text-[10px] text-slate-400 capitalize">{p.status.replace("_", " ")}</span>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                            ₦{p.revenue.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-rose-300">
                            ₦{p.expenses.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-300">
                            ₦{p.netProfit.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 w-48">
                            <div className="flex items-center gap-2.5">
                              <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden">
                                <div
                                  style={{ width: `${Math.max(5, Math.min(100, p.marginPct))}%` }}
                                  className={`h-full rounded-full ${
                                    isHighMargin
                                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                      : isMediumMargin
                                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                                      : "bg-gradient-to-r from-rose-500 to-red-400"
                                  }`}
                                />
                              </div>
                              <span
                                className={`font-mono font-bold text-xs ${
                                  isHighMargin ? "text-emerald-400" : isMediumMargin ? "text-amber-400" : "text-rose-400"
                                }`}
                              >
                                {p.marginPct}%
                              </span>
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
      )}

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}
      <LogExpenseModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingExpense(null);
        }}
        onSuccess={fetchData}
        editingExpense={editingExpense}
      />

      {/* Receipt Viewer Lightbox */}
      {receiptViewerUrl && (
        <div
          onClick={() => setReceiptViewerUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-xl bg-[#0c0d17] border border-white/[0.1] rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col items-center"
          >
            <button
              onClick={() => setReceiptViewerUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-xs font-bold text-white mb-3">Attached Receipt</h4>
            <img
              src={receiptViewerUrl}
              alt="Receipt"
              className="max-h-[70vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
