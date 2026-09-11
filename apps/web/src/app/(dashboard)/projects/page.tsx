"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Video,
  Camera,
  ArrowRight,
  Sparkles,
  Edit2,
  Trash2,
  ChevronRight,
  Layers,
  Film,
  RotateCcw,
  LayoutGrid,
  Kanban,
  ArrowUpDown,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CreateProjectModal } from "@/components/projects/create-project-modal";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: "pre_production" | "shoot" | "editing" | "client_review" | "delivery" | "completed";
  shootDate: string | null;
  deliveryDate: string | null;
  notes: string | null;
  createdAt: string;
  clientId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
};

const STAGES = [
  {
    id: "pre_production",
    label: "Pre-Production",
    shortLabel: "Pre-Prod",
    step: 1,
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    dotColor: "bg-cyan-400",
    badgeBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  },
  {
    id: "shoot",
    label: "Shoot Day",
    shortLabel: "On-Set",
    step: 2,
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    dotColor: "bg-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  },
  {
    id: "editing",
    label: "In Editing",
    shortLabel: "Editing",
    step: 3,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    dotColor: "bg-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  {
    id: "client_review",
    label: "Client Review",
    shortLabel: "Review",
    step: 4,
    color: "text-violet-400 border-violet-500/30 bg-violet-500/10",
    dotColor: "bg-violet-400",
    badgeBg: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  },
  {
    id: "delivery",
    label: "Delivery",
    shortLabel: "Handoff",
    step: 5,
    color: "text-teal-400 border-teal-500/30 bg-teal-500/10",
    dotColor: "bg-teal-400",
    badgeBg: "bg-teal-500/10 text-teal-300 border-teal-500/30",
  },
  {
    id: "completed",
    label: "Completed",
    shortLabel: "Archived",
    step: 6,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    dotColor: "bg-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
] as const;

const NEXT_STAGE_MAP: Record<string, typeof STAGES[number]["id"] | null> = {
  pre_production: "shoot",
  shoot: "editing",
  editing: "client_review",
  client_review: "delivery",
  delivery: "completed",
  completed: null,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");
  const [sortBy, setSortBy] = useState<"shoot_soonest" | "updated" | "name" | "stage">("shoot_soonest");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading projects:", err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectSaved = (saved: Project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p));
      }
      return [saved, ...prev];
    });
  };

  // Optimistic stage progression with automatic rollback on error
  const handleAdvanceStage = async (id: string, currentStatus: string, name: string) => {
    const nextStatus = NEXT_STAGE_MAP[currentStatus];
    if (!nextStatus) return;

    const prevProjects = projects;
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
    );

    const nextLabel = STAGES.find((s) => s.id === nextStatus)?.label;
    toast.success(`"${name}" advanced to ${nextLabel}!`);

    try {
      const res = await fetch(`/api/projects/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to advance project stage");
    } catch (err: any) {
      setProjects(prevProjects);
      toast.error(err?.message || "Failed to advance stage. Reverting...");
    }
  };

  // Optimistic deletion
  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) return;

    const prevProjects = projects;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success(`Project "${name}" deleted`);

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
    } catch (err: any) {
      setProjects(prevProjects);
      toast.error(err?.message || "Failed to delete project. Restoring...");
    }
  };

  // Memoized filter and sort for 60fps performance
  const filtered = useMemo(() => {
    const list = projects.filter((p) => {
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.clientName && p.clientName.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.notes && p.notes.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === "shoot_soonest") {
        if (!a.shootDate) return 1;
        if (!b.shootDate) return -1;
        return new Date(a.shootDate).getTime() - new Date(b.shootDate).getTime();
      }
      if (sortBy === "updated") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "stage") {
        const stepA = STAGES.find((s) => s.id === a.status)?.step || 0;
        const stepB = STAGES.find((s) => s.id === b.status)?.step || 0;
        return stepA - stepB;
      }
      return 0;
    });
  }, [projects, search, filterStatus, sortBy]);

  // Operational Metrics
  const { activeCount, shootScheduledCount, inPostCount, completedCount } = useMemo(() => {
    return {
      activeCount: projects.filter((p) => p.status !== "completed").length,
      shootScheduledCount: projects.filter(
        (p) => p.status === "pre_production" || p.status === "shoot"
      ).length,
      inPostCount: projects.filter(
        (p) => p.status === "editing" || p.status === "client_review"
      ).length,
      completedCount: projects.filter((p) => p.status === "completed").length,
    };
  }, [projects]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Shoot Logistics & Studio Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Project Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track multi-stage shoot workflows from digital call sheets to video reviews & master handoff.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#0c0d18]/90 backdrop-blur-xl border border-white/[0.08] shadow-inner">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "grid"
                  ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "kanban"
                  ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Visual Kanban Pipeline"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pipeline</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingProject(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs sm:text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold transition shadow-[0_0_25px_rgba(124,58,237,0.45)] hover:shadow-[0_0_35px_rgba(124,58,237,0.65)] hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Launch New Project
          </button>
        </div>
      </div>

      {/* ─── Metric Cards (Smoked Obsidian Glass) ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Productions */}
        <div className="bg-[#0c0d18]/85 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/[0.08] border-t-violet-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden group hover:border-violet-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Productions</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {activeCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Live production pipeline
          </div>
        </div>

        {/* Shoots Scheduled */}
        <div className="bg-[#0c0d18]/85 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/[0.08] border-t-rose-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Shoots Scheduled</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-200 tracking-tight">
            {shootScheduledCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Pre-production & on-set
          </div>
        </div>

        {/* In Post-Production */}
        <div className="bg-[#0c0d18]/85 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/[0.08] border-t-amber-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">In Post-Production</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-200 tracking-tight">
            {inPostCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Editing & client proofing
          </div>
        </div>

        {/* Completed & Delivered */}
        <div className="bg-[#0c0d18]/85 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/[0.08] border-t-emerald-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Archived Masters</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-200 tracking-tight">
            {completedCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Final handoff completed
          </div>
        </div>
      </div>

      {/* ─── Search, Stage Filters & Sorting Control Bar ─────────────────────── */}
      <div className="bg-[#0c0d18]/85 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-white/[0.08] border-t-white/[0.16] shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects by title, client, or location notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Dropdown & Results Counter */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-[11px] font-mono text-slate-400">
              Showing <strong className="text-white">{filtered.length}</strong> of {projects.length}
            </span>

            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] px-2.5 py-1.5 rounded-xl text-slate-300">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="shoot_soonest" className="bg-[#0e101c] text-white">
                  Shoot Date (Soonest)
                </option>
                <option value="updated" className="bg-[#0e101c] text-white">
                  Recently Updated
                </option>
                <option value="name" className="bg-[#0e101c] text-white">
                  Project Title (A-Z)
                </option>
                <option value="stage" className="bg-[#0e101c] text-white">
                  Production Stage
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Stage Filter Pills with Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none pt-1 border-t border-white/[0.04]">
          <button
            onClick={() => setFilterStatus("all")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition border whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === "all"
                ? "bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(124,58,237,0.25)]"
                : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
            }`}
          >
            <span>All Projects</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterStatus === "all" ? "bg-violet-500/30 text-white" : "bg-white/[0.05] text-slate-400"
              }`}
            >
              {projects.length}
            </span>
          </button>

          {STAGES.map((s) => {
            const count = projects.filter((p) => p.status === s.id).length;
            const isSelected = filterStatus === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setFilterStatus(s.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition border whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(124,58,237,0.25)]"
                    : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`} />
                <span>{s.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-violet-500/30 text-white" : "bg-white/[0.05] text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Projects Display ───────────────────────────────────────────────── */}
      {loading ? (
        /* Shimmering Skeleton Loader */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 space-y-4 animate-pulse shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-white/[0.06] rounded-full" />
                <div className="h-4 w-28 bg-white/[0.04] rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-48 bg-white/[0.08] rounded-md" />
                <div className="h-3 w-32 bg-white/[0.04] rounded-md" />
              </div>
              <div className="h-10 bg-white/[0.02] rounded-xl" />
              <div className="h-2 w-full bg-white/[0.04] rounded-full" />
              <div className="flex gap-2 pt-2">
                <div className="h-9 flex-1 bg-white/[0.04] rounded-xl" />
                <div className="h-9 w-24 bg-white/[0.06] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Context-Aware Empty State */
        <div className="py-16 text-center space-y-4 bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.16] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {projects.length === 0 ? "No projects yet" : "No matching projects found"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {projects.length === 0
                ? "Launch your first project workspace to track shoot dates, digital call sheets, and editing stages."
                : search || filterStatus !== "all"
                ? `No projects found${
                    filterStatus !== "all"
                      ? ` in "${STAGES.find((s) => s.id === filterStatus)?.label || filterStatus}"`
                      : ""
                  }${search ? ` matching "${search}"` : ""}. Try resetting your filters.`
                : "No projects found in this view."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {projects.length > 0 && (search || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterStatus("all");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                Reset Filters
              </button>
            )}
            <button
              onClick={() => {
                setEditingProject(null);
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              {projects.length === 0 ? "Launch First Project" : "Launch New Project"}
            </button>
          </div>
        </div>
      ) : viewMode === "kanban" ? (
        /* ─── KANBAN PIPELINE VIEW ─────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageProjects = filtered.filter((p) => p.status === stage.id);
            return (
              <div
                key={stage.id}
                className="bg-[#0c0d18]/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] border-t-white/[0.16] p-3 space-y-3 min-w-[200px] shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                    <span className="text-xs font-bold text-white tracking-tight">
                      {stage.shortLabel}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.05] text-slate-400">
                    {stageProjects.length}
                  </span>
                </div>

                {/* Stage Cards */}
                <div className="space-y-2.5">
                  {stageProjects.length === 0 ? (
                    <div className="py-6 text-center text-[11px] text-slate-600 font-mono">
                      Empty stage
                    </div>
                  ) : (
                    stageProjects.map((project) => {
                      const nextStage = NEXT_STAGE_MAP[project.status];
                      const nextStageLabel = STAGES.find((s) => s.id === nextStage)?.shortLabel;

                      return (
                        <div
                          key={project.id}
                          className="bg-black/40 hover:bg-black/60 p-3 rounded-xl border border-white/[0.06] hover:border-violet-500/40 transition group space-y-2.5 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <Link
                              href={`/projects/${project.id}`}
                              className="text-xs font-bold text-white group-hover:text-violet-300 transition line-clamp-2 leading-snug"
                            >
                              {project.name}
                            </Link>
                          </div>

                          <div className="text-[10px] text-slate-400 flex items-center justify-between">
                            <span className="truncate max-w-[110px] text-slate-300 font-medium">
                              {project.clientName || "Direct"}
                            </span>
                            {project.shootDate && (
                              <span className="font-mono text-cyan-400">
                                {new Date(project.shootDate).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            )}
                          </div>

                          {/* Quick Advance / Action */}
                          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between gap-1">
                            <Link
                              href={`/projects/${project.id}`}
                              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 font-medium"
                            >
                              <span>Hub</span>
                              <ChevronRight className="w-3 h-3 text-slate-500" />
                            </Link>

                            {nextStage ? (
                              <button
                                onClick={() =>
                                  handleAdvanceStage(project.id, project.status, project.name)
                                }
                                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-violet-600/30 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 transition flex items-center gap-1"
                                title={`Move to ${nextStageLabel}`}
                              >
                                <span>→ {nextStageLabel}</span>
                              </button>
                            ) : (
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                Done ✓
                              </span>
                            )}
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
      ) : (
        /* ─── CARDS GRID VIEW ─────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((project) => {
            const currentStageObj = STAGES.find((s) => s.id === project.status) || STAGES[0]!;
            const progressPercent = Math.round((currentStageObj.step / 6) * 100);
            const nextStage = NEXT_STAGE_MAP[project.status];
            const nextStageLabel = STAGES.find((s) => s.id === nextStage)?.label;

            // Shoot Countdown
            let shootCountdown = "Date not set";
            let isShootSoon = false;
            let isPast = false;
            if (project.shootDate) {
              const diffDays = Math.ceil(
                (new Date(project.shootDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              if (diffDays === 0) {
                shootCountdown = "Shoot is TODAY!";
                isShootSoon = true;
              } else if (diffDays > 0) {
                shootCountdown = `Shoot in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
                if (diffDays <= 3) isShootSoon = true;
              } else {
                shootCountdown = "Shoot Completed";
                isPast = true;
              }
            }

            return (
              <div
                key={project.id}
                className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-6 space-y-5 flex flex-col justify-between shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-violet-500/40 transition-all duration-300 group hover:-translate-y-0.5"
              >
                <div className="space-y-4">
                  {/* Top Row: Stage Chip & Shoot Countdown Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentStageObj.badgeBg} flex items-center gap-1`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${currentStageObj.dotColor}`} />
                      {currentStageObj.label}
                    </span>

                    {project.shootDate && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isShootSoon
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse"
                            : isPast
                            ? "bg-white/[0.02] text-slate-500 border-white/[0.06]"
                            : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                        }`}
                      >
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        {shootCountdown}
                      </span>
                    )}
                  </div>

                  {/* Title & Client Info */}
                  <div>
                    <Link href={`/projects/${project.id}`} className="block group">
                      <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition">
                        {project.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-slate-200">
                        {project.clientName || "Direct Client"}
                      </span>
                      {project.clientEmail && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="truncate max-w-[180px]">{project.clientEmail}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Description / Scope */}
                  {project.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
                      {project.description}
                    </p>
                  )}

                  {/* 6-Stage Progress Stepper */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Production Progress</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        Stage {currentStageObj.step}/6 ({progressPercent}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5">
                      {STAGES.map((s) => {
                        const isDone = s.step <= currentStageObj.step;
                        const isCurrent = s.step === currentStageObj.step;
                        return (
                          <div
                            key={s.id}
                            title={s.label}
                            className={`h-2 rounded-full transition-all ${
                              isCurrent
                                ? "bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_8px_rgba(124,58,237,0.6)]"
                                : isDone
                                ? "bg-violet-600/60"
                                : "bg-white/[0.06]"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Timeline Dates */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400">
                    <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">
                        Shoot Date
                      </span>
                      <span className="text-white font-medium">
                        {project.shootDate
                          ? new Date(project.shootDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Not scheduled"}
                      </span>
                    </div>

                    <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">
                        Final Delivery Target
                      </span>
                      <span className="text-emerald-400 font-medium">
                        {project.deliveryDate
                          ? new Date(project.deliveryDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "TBD"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Advance Stage Button */}
                    {nextStage ? (
                      <button
                        onClick={() => handleAdvanceStage(project.id, project.status, project.name)}
                        className="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-violet-600/20 border border-white/[0.08] hover:border-violet-500/40 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        <span>Advance to {nextStageLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
                      </button>
                    ) : (
                      <div className="flex-1 py-2 text-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Project Finalized
                      </div>
                    )}

                    {/* Open Call Sheet / Workspace */}
                    <Link
                      href={`/projects/${project.id}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(124,58,237,0.3)] transition flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>Call Sheet</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-1">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition"
                      title="Edit project details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
        }}
        onSuccess={handleProjectSaved}
        editingProject={editingProject}
      />
    </div>
  );
}
