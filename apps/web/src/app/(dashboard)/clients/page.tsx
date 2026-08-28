"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Mail,
  Phone,
  MoreHorizontal,
  Instagram,
  MapPin,
  Users,
  TrendingUp,
  Download,
  Trash2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Tag,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { AddClientModal } from "@/components/clients/add-client-modal";
import { ClientDetailDrawer } from "@/components/clients/client-detail-drawer";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  tags: string[] | null;
  projectsCount: number;
  lifetimeSpend: number;
  currency: string;
  createdAt: string;
};

const FILTER_TAGS = ["All", "VIP", "Wedding", "Commercial", "Fashion", "Corporate", "Retainer", "Portrait"];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "spend" | "projects" | "newest">("newest");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading clients:", err);
      toast.error("Failed to load client directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientCreated = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleClientUpdated = (updatedClient: any) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? { ...c, ...updatedClient } : c))
    );
  };

  const handleArchiveClient = async (id: string, name?: string) => {
    const clientToArchive = clients.find((c) => c.id === id);
    const clientName = name || clientToArchive?.name || "Client";
    if (!confirm(`Are you sure you want to archive "${clientName}"?`)) return;

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to archive client");

      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Client "${clientName}" has been archived`);
      if (selectedClientId === id) {
        setIsDetailDrawerOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to archive client");
    }
  };

  const openClientDrawer = (id: string) => {
    setSelectedClientId(id);
    setIsDetailDrawerOpen(true);
  };

  // Filter & Search logic
  const filtered = clients
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search)) ||
        (c.city && c.city.toLowerCase().includes(search.toLowerCase()));

      const matchesTag =
        selectedTag === "All" || (c.tags && c.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "spend") return b.lifetimeSpend - a.lifetimeSpend;
      if (sortBy === "projects") return b.projectsCount - a.projectsCount;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Calculate high-level summary metrics
  const totalLifetimeRevenue = clients.reduce((sum, c) => sum + (c.lifetimeSpend || 0), 0);
  const totalProjectsCount = clients.reduce((sum, c) => sum + (c.projectsCount || 0), 0);

  // CSV Export
  const exportToCSV = () => {
    if (filtered.length === 0) {
      toast.info("No client records to export");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Instagram", "City", "Country", "Projects", "Lifetime Spend", "Tags"];
    const rows = filtered.map((c) => [
      `"${c.name}"`,
      `"${c.email || ""}"`,
      `"${c.phone || ""}"`,
      `"${c.instagram || ""}"`,
      `"${c.city || ""}"`,
      `"${c.country || ""}"`,
      c.projectsCount,
      c.lifetimeSpend,
      `"${(c.tags || []).join(", ")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crea8or_clients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filtered.length} clients to CSV`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            CRM & Client Relations
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clients Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your high-value client directory, contact information, and lifetime spending history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-slate-300 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl font-semibold transition shadow-[0_0_20px_rgba(124,58,237,0.4)]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Client
          </button>
        </div>
      </div>

      {/* ─── Metric Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Clients</span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{clients.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active client relationships</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Lifetime Spend Recorded</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ₦{totalLifetimeRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">From all completed client projects</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Projects & Shoots</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{totalProjectsCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Productions across all client rosters</p>
        </div>
      </div>

      {/* ─── Search & Tag Filters Bar ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0c0d17] p-3 rounded-2xl border border-white/[0.08]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-xl whitespace-nowrap transition border ${
                selectedTag === tag
                  ? "bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                  : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 whitespace-nowrap hidden lg:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-[#151624] border border-white/[0.08] text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            <option value="newest">Newest Added</option>
            <option value="spend">Highest Lifetime Spend</option>
            <option value="projects">Most Projects</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* ─── Clients Table ──────────────────────────────────────────────────── */}
      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading client directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No clients found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {search || selectedTag !== "All"
                  ? "Try changing your search terms or filter tags."
                  : "Start by adding your first client or connecting your booking page."}
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Client / Brand</th>
                  <th className="py-3.5 px-6">Contact & Socials</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6 text-center">Shoots</th>
                  <th className="py-3.5 px-6">Lifetime Spend</th>
                  <th className="py-3.5 px-6">Tags</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {filtered.map((client) => {
                  const initials = client.name
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  const cleanPhone = client.phone ? client.phone.replace(/[^0-9]/g, "") : "";

                  return (
                    <tr
                      key={client.id}
                      onClick={() => openClientDrawer(client.id)}
                      className="hover:bg-white/[0.03] transition group cursor-pointer"
                    >
                      {/* Name & Initials */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-[0_0_12px_rgba(124,58,237,0.3)] shrink-0 group-hover:scale-105 transition-transform">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate group-hover:text-violet-300 transition">
                              {client.name}
                            </span>
                            {client.notes ? (
                              <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                {client.notes}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <a href={`mailto:${client.email}`} className="hover:text-violet-300 truncate">
                                {client.email}
                              </a>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <a href={`tel:${client.phone}`} className="hover:text-violet-300">
                                {client.phone}
                              </a>
                            </div>
                          )}
                          {client.instagram && (
                            <div className="flex items-center gap-1.5 text-cyan-400">
                              <Instagram className="w-3 h-3" />
                              <a
                                href={`https://instagram.com/${client.instagram.replace("@", "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline text-[11px]"
                              >
                                @{client.instagram.replace("@", "")}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{client.city || client.country || "Nigeria"}</span>
                        </div>
                      </td>

                      {/* Projects Count */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                          {client.projectsCount} {client.projectsCount === 1 ? "shoot" : "shoots"}
                        </span>
                      </td>

                      {/* Lifetime Spend */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-white font-mono">
                          ₦{client.lifetimeSpend.toLocaleString()}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {client.tags && client.tags.length > 0 ? (
                            client.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08]"
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-500">—</span>
                          )}
                        </div>
                      </td>

                      {/* Action Triggers */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Direct WhatsApp Trigger */}
                          {client.phone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Email Trigger */}
                          {client.email && (
                            <a
                              href={`mailto:${client.email}`}
                              title="Send Email"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Open Drawer */}
                          <button
                            onClick={() => openClientDrawer(client.id)}
                            title="View Full Profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive/Delete Action */}
                          <button
                            onClick={() => handleArchiveClient(client.id, client.name)}
                            title="Archive Client"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
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

      {/* ─── Add Client Modal ──────────────────────────────────────────────── */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleClientCreated}
      />

      {/* ─── Client Profile & History Drawer ───────────────────────────────── */}
      <ClientDetailDrawer
        clientId={selectedClientId}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onClientUpdated={handleClientUpdated}
        onClientArchived={handleArchiveClient}
      />
    </div>
  );
}
