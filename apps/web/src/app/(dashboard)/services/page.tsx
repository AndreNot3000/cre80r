"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Copy,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { AddServiceModal } from "@/components/services/add-service-modal";

type Service = {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  currency: string;
  durationHours: number | null;
  isActive: boolean;
  addOns: { name: string; price: number }[] | null;
  createdAt: string;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  GHS: "GH₵",
  KES: "KSh",
  ZAR: "R",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "inactive">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [expandedAddOns, setExpandedAddOns] = useState<Record<string, boolean>>({});

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading services:", err);
      toast.error("Failed to load service packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleServiceSaved = (saved: Service) => {
    setServices((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      if (exists) {
        return prev.map((s) => (s.id === saved.id ? saved : s));
      }
      return [saved, ...prev];
    });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const newStatus = !currentStatus;
      const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: newStatus } : s))
      );
      toast.success(`"${name}" is now ${newStatus ? "Active in Showroom" : "Inactive"}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update package status");
    }
  };

  const handleDuplicate = async (service: Service) => {
    try {
      const payload = {
        name: `${service.name} (Copy)`,
        description: service.description || undefined,
        basePrice: Number(service.basePrice),
        currency: service.currency || "NGN",
        durationHours: service.durationHours ? Number(service.durationHours) : undefined,
        isActive: service.isActive,
        addOns: Array.isArray(service.addOns) && service.addOns.length > 0 ? service.addOns : undefined,
      };

      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to duplicate package");
      }

      const duplicated = await res.json();
      setServices((prev) => [duplicated, ...prev]);
      toast.success(`Duplicated "${service.name}" successfully!`);
    } catch (err: any) {
      console.error("Duplicate package error:", err);
      toast.error(err?.message || "Failed to duplicate package");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete package");

      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Package "${name}" deleted`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete package");
    }
  };

  const toggleAddOnsExpand = (id: string) => {
    setExpandedAddOns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter services
  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));

    const matchesTab =
      filterTab === "all" ||
      (filterTab === "active" && s.isActive) ||
      (filterTab === "inactive" && !s.isActive);

    return matchesSearch && matchesTab;
  });

  // Calculate metrics
  const activePackages = services.filter((s) => s.isActive);
  const totalAddOnsConfigured = services.reduce(
    (sum, s) => sum + (Array.isArray(s.addOns) ? s.addOns.length : 0),
    0
  );
  const avgPackagePrice =
    services.length > 0
      ? services.reduce((sum, s) => sum + Number(s.basePrice || 0), 0) / services.length
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Pricing & Service Catalog
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Services & Packages Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardize your production rates, deliverables scope, and custom optional add-ons.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingService(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl font-semibold transition shadow-[0_0_20px_rgba(124,58,237,0.4)]"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Package
        </button>
      </div>

      {/* ─── Metric Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Showroom Packages</span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {activePackages.length} Packages
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Live on your client booking showroom</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Average Package Value</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ₦{Math.round(avgPackagePrice).toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Across all service tiers</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Add-On Deliverables</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {totalAddOnsConfigured} Add-Ons
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Configured for upsell in proposals</p>
        </div>
      </div>

      {/* ─── Search & Tab Filters ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0d17] p-3 rounded-2xl border border-white/[0.08]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search packages by title, scope, or equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "active", "inactive"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl capitalize transition border ${
                filterTab === tab
                  ? "bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                  : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
              }`}
            >
              {tab === "all" ? "All Packages" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Packages Grid ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-7 h-7 text-violet-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading service catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-8">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No service packages found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {search || filterTab !== "all"
                ? "Try changing your search terms or filter."
                : "Create standard packages so you can send professional proposals and quotes in 1 click."}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingService(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_15px_rgba(124,58,237,0.3)]"
          >
            <Plus className="w-3.5 h-3.5" />
            Create First Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((service) => {
            const sym = CURRENCY_SYMBOLS[service.currency] || "₦";
            const addOnsList = Array.isArray(service.addOns) ? service.addOns : [];
            const isExpanded = expandedAddOns[service.id];

            return (
              <div
                key={service.id}
                className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-5 space-y-4 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-violet-500/40 transition group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            service.isActive ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-slate-600"
                          }`}
                        />
                        <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition truncate">
                          {service.name}
                        </h3>
                      </div>
                      {service.durationHours ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1">
                          <Clock className="w-2.5 h-2.5 text-cyan-400" />
                          {service.durationHours} Hours Coverage
                        </span>
                      ) : null}
                    </div>

                    {/* Active Toggle Switch */}
                    <button
                      onClick={() => handleToggleActive(service.id, service.isActive, service.name)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition ${
                        service.isActive
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-white/[0.02] text-slate-500 border-white/[0.06]"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {/* Price Banner */}
                  <div className="pt-3 pb-2">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Base Investment</span>
                    <span className="text-2xl font-bold text-white font-mono tracking-tight block">
                      {sym}{Number(service.basePrice).toLocaleString()}
                    </span>
                  </div>

                  {/* Deliverables Scope Description */}
                  {service.description && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
                      {service.description}
                    </p>
                  )}

                  {/* Add-Ons Section */}
                  {addOnsList.length > 0 && (
                    <div className="pt-3 border-t border-white/[0.06] space-y-2">
                      <button
                        onClick={() => toggleAddOnsExpand(service.id)}
                        className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-white font-semibold transition"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          {addOnsList.length} Add-On Deliverables
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="space-y-1.5 pt-1">
                          {addOnsList.map((a, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                            >
                              <span className="text-slate-300 truncate max-w-[180px]">{a.name}</span>
                              <span className="font-mono text-emerald-400 font-semibold">
                                +{sym}{Number(a.price).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <Link
                    href={`/quotes/new?serviceId=${service.id}`}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-[0_0_15px_rgba(124,58,237,0.3)] transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Create Quote with Package
                  </Link>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <button
                      onClick={() => handleDuplicate(service)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition"
                      title="Duplicate package"
                    >
                      <Copy className="w-3 h-3" /> Duplicate
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingService(service);
                          setIsAddModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition"
                        title="Edit package"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Add/Edit Package Modal ────────────────────────────────────────── */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingService(null);
        }}
        onSuccess={handleServiceSaved}
        editingService={editingService}
      />
    </div>
  );
}
