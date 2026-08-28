"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Film,
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
  { id: "pre_production", label: "Pre-Production", step: 1, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
  { id: "shoot", label: "Shoot Day", step: 2, color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
  { id: "editing", label: "In Editing", step: 3, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { id: "client_review", label: "Client Review", step: 4, color: "text-violet-400 border-violet-500/30 bg-violet-500/10" },
  { id: "delivery", label: "Delivery", step: 5, color: "text-teal-400 border-teal-500/30 bg-teal-500/10" },
  { id: "completed", label: "Completed", step: 6, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
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

  const handleAdvanceStage = async (id: string, currentStatus: string, name: string) => {
    const nextStatus = NEXT_STAGE_MAP[currentStatus];
    if (!nextStatus) return;

    try {
      const res = await fetch(`/api/projects/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to advance project stage");

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );

      const nextLabel = STAGES.find((s) => s.id === nextStatus)?.label;
      toast.success(`"${name}" advanced to ${nextLabel}!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to advance stage");
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");

      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Project "${name}" deleted`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete project");
    }
  };

  // Filter projects
  const filtered = projects.filter((p) => {
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Calculate Operational Metrics
  const activeCount = projects.filter((p) => p.status !== "completed").length;
  const shootScheduledCount = projects.filter((p) => p.status === "pre_production" || p.status === "shoot").length;
  const inPostCount = projects.filter((p) => p.status === "editing" || p.status === "client_review").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Shoot Logistics & Project Hub
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Project Operations Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track multi-stage shoot workflows from pre-production call sheets to client reviews & final handoff.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProject(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold transition shadow-[0_0_20px_rgba(124,58,237,0.4)] self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Launch New Project
        </button>
      </div>

      {/* ─── Metric Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Productions</span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {activeCount} Projects
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Currently in production pipeline</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Shoots Scheduled</span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-300 tracking-tight">
            {shootScheduledCount} Shoots
          </div>
          <p className="text-[11px] text-rose-400 mt-1">Pre-production & on-set</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">In Post-Production</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Film className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            {inPostCount} Projects
          </div>
          <p className="text-[11px] text-amber-400 mt-1">Editing & client review</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Completed & Delivered</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-300 tracking-tight">
            {completedCount} Delivered
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Archived masters</p>
        </div>
      </div>

      {/* ─── Search & Stage Filters ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0d17] p-3 rounded-2xl border border-white/[0.08]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by title, client, or location notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus("all")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition border whitespace-nowrap ${
              filterStatus === "all"
                ? "bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
            }`}
          >
            All Projects
          </button>
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition border whitespace-nowrap ${
                filterStatus === s.id
                  ? "bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                  : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Projects Grid ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-7 h-7 text-violet-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading production workspaces...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-8">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No projects found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {search || filterStatus !== "all"
                ? "Try changing your search terms or status filter."
                : "Launch a new project workspace to track shoot dates, digital call sheets, and editing stages."}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_15px_rgba(124,58,237,0.3)]"
          >
            <Plus className="w-3.5 h-3.5" />
            Launch First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((project) => {
            const currentStageObj = STAGES.find((s) => s.id === project.status) || STAGES[0]!;
            const progressPercent = Math.round((currentStageObj.step / 6) * 100);
            const nextStage = NEXT_STAGE_MAP[project.status];
            const nextStageLabel = STAGES.find((s) => s.id === nextStage)?.label;

            // Shoot Countdown
            let shootCountdown = "Date not set";
            let isShootSoon = false;
            if (project.shootDate) {
              const diffDays = Math.ceil(
                (new Date(project.shootDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              if (diffDays === 0) {
                shootCountdown = "Shoot is TODAY!";
                isShootSoon = true;
              } else if (diffDays > 0) {
                shootCountdown = `Shoot in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
                if (diffDays <= 3) isShootSoon = true;
              } else {
                shootCountdown = "Shoot Completed";
              }
            }

            return (
              <div
                key={project.id}
                className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 space-y-5 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-violet-500/40 transition group"
              >
                <div className="space-y-4">
                  {/* Top Row: Status Badge & Shoot Countdown */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentStageObj.color}`}>
                      {currentStageObj.label}
                    </span>

                    {project.shootDate && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isShootSoon
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse"
                            : "bg-white/[0.03] text-slate-400 border-white/[0.08]"
                        }`}
                      >
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        {shootCountdown}
                      </span>
                    )}
                  </div>

                  {/* Title & Client */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-slate-200">
                        {project.clientName || "Direct Client"}
                      </span>
                      {project.clientEmail && (
                        <>
                          <span>•</span>
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
                    <div className="bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Shoot Date</span>
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

                    <div className="bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Final Delivery Target</span>
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
                      title="Edit project"
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
