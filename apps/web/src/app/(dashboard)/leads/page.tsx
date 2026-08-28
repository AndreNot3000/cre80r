"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Tag,
  Users,
  MessageCircle,
  Trash2,
  TrendingUp,
  FolderKanban,
  Loader2,
  ChevronRight,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { AddLeadModal } from "@/components/leads/add-lead-modal";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  serviceInterest: string | null;
  eventDate: string | null;
  budget: string | null;
  currency: string;
  status: "new" | "contacted" | "quote_sent" | "negotiating" | "booked" | "lost";
  source: string | null;
  message: string | null;
  notes: string | null;
  clientId: string | null;
  createdAt: string;
};

const STAGES = [
  {
    key: "new",
    label: "New Inquiries",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    glow: "border-cyan-500/30",
    dot: "bg-cyan-400",
  },
  {
    key: "contacted",
    label: "Contacted",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    glow: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  {
    key: "quote_sent",
    label: "Quote Sent",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    glow: "border-violet-500/30",
    dot: "bg-violet-400",
  },
  {
    key: "negotiating",
    label: "Negotiating",
    badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    glow: "border-indigo-500/30",
    dot: "bg-indigo-400",
  },
  {
    key: "booked",
    label: "Booked & Paid",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    glow: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  {
    key: "lost",
    label: "Lost / Declined",
    badge: "bg-white/[0.04] text-slate-400 border-white/[0.08]",
    glow: "border-white/[0.08]",
    dot: "bg-slate-500",
  },
] as const;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading leads:", err);
      toast.error("Failed to load leads pipeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleLeadCreated = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleStageChange = async (leadId: string, newStage: Lead["status"]) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStage }),
      });

      if (!res.ok) throw new Error("Failed to update stage");

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStage } : l))
      );
      toast.success(`Moved lead to "${STAGES.find((s) => s.key === newStage)?.label}"`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update lead status");
    }
  };

  const handleConvertLead = async (leadId: string, leadName: string) => {
    try {
      setConvertingId(leadId);
      const res = await fetch(`/api/leads/${leadId}/convert`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to convert lead");

      const data = await res.json();
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: "booked", clientId: data.client.id } : l))
      );

      toast.success(`🎉 Converted "${leadName}" to an active Client & Shoot Project!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to convert lead");
    } finally {
      setConvertingId(null);
    }
  };

  const handleDeleteLead = async (leadId: string, leadName: string) => {
    if (!confirm(`Delete inquiry for "${leadName}"?`)) return;

    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete lead");

      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      toast.success("Lead removed from pipeline");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete lead");
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email && l.email.toLowerCase().includes(search.toLowerCase())) ||
      (l.serviceInterest && l.serviceInterest.toLowerCase().includes(search.toLowerCase()));

    const matchesSource = sourceFilter === "all" || l.source === sourceFilter;

    return matchesSearch && matchesSource;
  });

  // Calculate Pipeline Metrics
  const totalPipelineValue = leads
    .filter((l) => l.status !== "lost")
    .reduce((sum, l) => sum + Number(l.budget || 0), 0);

  const bookedValue = leads
    .filter((l) => l.status === "booked")
    .reduce((sum, l) => sum + Number(l.budget || 0), 0);

  const activeInquiries = leads.filter((l) => l.status === "new" || l.status === "contacted").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            CRM & Visual Deals Pipeline
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads & Inquiries Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track inquiries from initial showroom contact, quote negotiation, to paid shoot deposit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl font-semibold transition shadow-[0_0_20px_rgba(124,58,237,0.4)]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Inquiry
          </button>
        </div>
      </div>

      {/* ─── Metric Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Pipeline Value</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ₦{totalPipelineValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all active negotiation stages</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Booked Revenue</span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ₦{bookedValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Converted into confirmed shoots</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Inquiries</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{activeInquiries} Deals</div>
          <p className="text-[11px] text-cyan-300 mt-1">Requiring creative follow-up</p>
        </div>
      </div>

      {/* ─── Search & Source Filters ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0d17] p-3 rounded-2xl border border-white/[0.08]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads by name, service, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">Channel:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#151624] border border-white/[0.08] text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            <option value="all">All Sources</option>
            <option value="inquiry_form">Website Form</option>
            <option value="instagram_dm">Instagram DM</option>
            <option value="referral">Referral</option>
            <option value="whatsapp">WhatsApp Direct</option>
            <option value="walk_in">Walk-in</option>
          </select>
        </div>
      </div>

      {/* ─── Kanban Board Columns ───────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-7 h-7 text-violet-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading deal stages and live inquiries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {STAGES.map((stage, colIdx) => {
            const columnLeads = filteredLeads.filter((l) => l.status === stage.key);
            const columnBudgetTotal = columnLeads.reduce((sum, l) => sum + Number(l.budget || 0), 0);

            return (
              <div
                key={stage.key}
                className="flex flex-col rounded-3xl bg-[#0a0b12] border border-white/[0.06] p-3 space-y-3 min-w-[240px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                    <h3 className="text-xs font-bold text-white tracking-tight">{stage.label}</h3>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Budget Total */}
                <div className="text-[10px] text-slate-500 font-mono px-1">
                  ₦{columnBudgetTotal.toLocaleString()}
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-360px)] pr-0.5">
                  {columnLeads.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-white/[0.04] rounded-2xl">
                      <span className="text-[10px] text-slate-600 block">No leads in stage</span>
                    </div>
                  ) : (
                    columnLeads.map((lead) => {
                      const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";
                      const isConverting = convertingId === lead.id;

                      return (
                        <div
                          key={lead.id}
                          className="bg-[#0f101d] rounded-2xl border border-white/[0.08] p-3.5 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-violet-500/40 transition group relative"
                        >
                          {/* Top Card Info */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-white leading-tight">
                              {lead.name}
                            </h4>
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.name)}
                              className="text-slate-600 hover:text-rose-400 p-0.5 transition"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Service Interest */}
                          {lead.serviceInterest && (
                            <div className="text-[11px] text-cyan-300 font-medium">
                              {lead.serviceInterest}
                            </div>
                          )}

                          {/* Message / Scope excerpt */}
                          {lead.message && (
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                              {lead.message}
                            </p>
                          )}

                          {/* Budget & Target Date */}
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/[0.04]">
                            <span className="font-mono font-bold text-emerald-400 text-xs">
                              ₦{Number(lead.budget || 0).toLocaleString()}
                            </span>
                            {lead.eventDate && (
                              <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                                <Calendar className="w-2.5 h-2.5" />
                                {new Date(lead.eventDate).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            )}
                          </div>

                          {/* Contact Shortcuts */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              {lead.phone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-md text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              )}
                              {lead.email && (
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="p-1 rounded-md text-slate-400 bg-white/[0.03] hover:text-white transition"
                                  title="Email"
                                >
                                  <Mail className="w-3 h-3" />
                                </a>
                              )}
                            </div>

                            {/* Source attribution badge */}
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-white/[0.02] text-slate-500 border border-white/[0.04]">
                              {lead.source?.replace("_", " ") || "web"}
                            </span>
                          </div>

                          {/* 1-Click Convert or Stage Advancement */}
                          <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                            {lead.status !== "booked" ? (
                              <button
                                onClick={() => handleConvertLead(lead.id, lead.name)}
                                disabled={isConverting}
                                className="w-full py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[10px] shadow-[0_0_12px_rgba(124,58,237,0.3)] transition flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                {isConverting ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3 text-cyan-300" />
                                    Convert to Client & Project
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-400 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Converted & Booked
                              </div>
                            )}

                            {/* Stage Step Navigation Controls */}
                            <div className="flex items-center justify-between pt-0.5">
                              {colIdx > 0 ? (
                                <button
                                  onClick={() => handleStageChange(lead.id, STAGES[colIdx - 1].key)}
                                  className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5 p-0.5"
                                  title="Move to previous stage"
                                >
                                  <ArrowLeft className="w-2.5 h-2.5" /> Back
                                </button>
                              ) : <span />}

                              {colIdx < STAGES.length - 1 && lead.status !== "booked" ? (
                                <button
                                  onClick={() => handleStageChange(lead.id, STAGES[colIdx + 1].key)}
                                  className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-0.5 p-0.5"
                                  title="Advance to next stage"
                                >
                                  Advance <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Add Lead Modal ────────────────────────────────────────────────── */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleLeadCreated}
      />
    </div>
  );
}
