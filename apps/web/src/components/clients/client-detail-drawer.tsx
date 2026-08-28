"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Mail,
  Phone,
  Instagram,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  FolderKanban,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  Trash2,
  Receipt,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface ClientDetailDrawerProps {
  clientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated: (updatedClient: any) => void;
  onClientArchived: (clientId: string) => void;
}

export function ClientDetailDrawer({
  clientId,
  isOpen,
  onClose,
  onClientUpdated,
  onClientArchived,
}: ClientDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "invoices" | "notes">("projects");
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (clientId && isOpen) {
      fetchClientDetails(clientId);
    }
  }, [clientId, isOpen]);

  const fetchClientDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) throw new Error("Failed to load client details");
      const data = await res.json();
      setClientData(data);
      setNotes(data.notes || "");
    } catch (err) {
      console.error("Error loading client:", err);
      toast.error("Failed to load client profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!clientId) return;
    try {
      setSavingNotes(true);
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) throw new Error("Failed to save notes");
      const updated = await res.json();
      toast.success("Client notes updated successfully");
      setClientData((prev: any) => ({ ...prev, notes }));
      onClientUpdated({ ...clientData, notes });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update notes");
    } finally {
      setSavingNotes(false);
    }
  };

  if (!isOpen || !clientId) return null;

  const initials = clientData?.name
    ? clientData.name
        .split(" ")
        .filter(Boolean)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CL";

  const cleanPhone = clientData?.phone ? clientData.phone.replace(/[^0-9]/g, "") : "";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#0c0d17] border-l border-white/[0.1] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] bg-[#0d0e19] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  Client Profile
                </span>
                {clientData?.city && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {clientData.city}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-[0_0_20px_rgba(124,58,237,0.3)] shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <h2 className="text-xl font-bold text-white tracking-tight truncate">
                  {clientData?.name || "Loading..."}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {clientData?.email && (
                    <a href={`mailto:${clientData.email}`} className="hover:text-violet-300 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {clientData.email}
                    </a>
                  )}
                  {clientData?.phone && (
                    <a href={`tel:${clientData.phone}`} className="hover:text-violet-300 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {clientData.phone}
                    </a>
                  )}
                  {clientData?.instagram && (
                    <a
                      href={`https://instagram.com/${clientData.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Instagram className="w-3 h-3" />
                      @{clientData.instagram.replace("@", "")}
                    </a>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {clientData?.tags?.map((t: string) => (
                    <span
                      key={t}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Lifetime Spend</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                  ₦{(clientData?.lifetimeSpend || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Projects</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                  {clientData?.projectsCount || 0}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Status</span>
                <span className="text-xs font-semibold text-emerald-400 mt-0.5 block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active Client
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] pt-2">
              <button
                onClick={() => setActiveTab("projects")}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "projects"
                    ? "border-violet-500 text-violet-300"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                Shoots & Projects ({clientData?.projects?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "invoices"
                    ? "border-violet-500 text-violet-300"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                Invoices & Payments ({clientData?.invoices?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "notes"
                    ? "border-violet-500 text-violet-300"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Private Notes
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading client details...</div>
            ) : activeTab === "projects" ? (
              <div className="space-y-3">
                {clientData?.projects && clientData.projects.length > 0 ? (
                  clientData.projects.map((proj: any) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{proj.name}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 uppercase">
                          {proj.status.replace("_", " ")}
                        </span>
                      </div>
                      {proj.description && <p className="text-[11px] text-slate-400">{proj.description}</p>}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-white/[0.04]">
                        <span className="font-mono text-cyan-300 font-semibold">
                          Budget: ₦{Number(proj.budget || 0).toLocaleString()}
                        </span>
                        <Link
                          href={`/projects/${proj.id}`}
                          className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-0.5"
                        >
                          Open Workspace ↗
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <FolderKanban className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">No active shoot projects linked to this client yet.</p>
                    <Link
                      href={`/projects?newFor=${clientData?.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 pt-1"
                    >
                      <Plus className="w-3 h-3" /> Create First Project
                    </Link>
                  </div>
                )}
              </div>
            ) : activeTab === "invoices" ? (
              <div className="space-y-3">
                {clientData?.invoices && clientData.invoices.length > 0 ? (
                  clientData.invoices.map((inv: any) => (
                    <div
                      key={inv.id}
                      className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{inv.invoiceNumber}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            inv.status === "paid"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-400">Total: ₦{Number(inv.total).toLocaleString()}</span>
                        <span className="text-emerald-400 font-mono font-semibold">
                          Paid: ₦{Number(inv.amountPaid || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">No invoices issued for this client yet.</p>
                    <Link
                      href={`/quotes/new?clientId=${clientData?.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 pt-1"
                    >
                      <Plus className="w-3 h-3" /> Send Quote / Invoice
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Private Creative & Style Preferences
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  placeholder="Record client style notes, preferred color grades, key family members, anniversary dates, or custom terms..."
                  className="w-full p-3.5 text-xs rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none leading-relaxed"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingNotes ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#090a12] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {clientData?.phone && (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat on WhatsApp
                </a>
              )}
              <button
                onClick={() => onClientArchived(clientData?.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Archive Client"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <Link
              href={`/quotes/new?clientId=${clientData?.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Proposal / Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
