"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "@crea8or/validators";
import { z } from "zod";
import {
  X,
  FolderKanban,
  User,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  Loader2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

type ProjectFormValues = z.infer<typeof createProjectSchema>;

interface ClientOption {
  id: string;
  name: string;
  email: string | null;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedProject: any) => void;
  editingProject?: any | null;
}

const STAGES = [
  { value: "pre_production", label: "Pre-Production (Planning & Prep)" },
  { value: "shoot", label: "Shoot Day (On-Location / Set)" },
  { value: "editing", label: "Editing (Post-Production & Grading)" },
  { value: "client_review", label: "Client Review (Proofing)" },
  { value: "delivery", label: "Delivery (Final Master Asset Handoff)" },
  { value: "completed", label: "Completed & Archived" },
];

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
  editingProject,
}: CreateProjectModalProps) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      status: "pre_production",
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/clients")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setClients(data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingProject) {
      setValue("name", editingProject.name);
      setValue("description", editingProject.description || "");
      setValue("clientId", editingProject.clientId || "");
      setValue("status", editingProject.status || "pre_production");
      setValue(
        "shootDate",
        editingProject.shootDate ? new Date(editingProject.shootDate).toISOString().split("T")[0] : ""
      );
      setValue(
        "deliveryDate",
        editingProject.deliveryDate
          ? new Date(editingProject.deliveryDate).toISOString().split("T")[0]
          : ""
      );
      setValue("notes", editingProject.notes || "");
    } else {
      reset({
        status: "pre_production",
        name: "",
        description: "",
        clientId: "",
        shootDate: "",
        deliveryDate: "",
        notes: "",
      });
    }
  }, [editingProject, setValue, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: ProjectFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        clientId: data.clientId || undefined,
        status: data.status,
        shootDate: data.shootDate ? new Date(data.shootDate).toISOString() : undefined,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString() : undefined,
        notes: data.notes?.trim() || undefined,
      };

      const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";
      const method = editingProject ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save project");
      }

      const result = await res.json();
      toast.success(
        editingProject
          ? `Project "${result.name}" updated successfully!`
          : `Production project "${result.name}" launched!`
      );
      reset();
      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error("Save project error:", err);
      toast.error(err?.message || "Failed to save project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0c0d17] border border-white/[0.1] rounded-3xl w-full max-w-xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {editingProject ? "Edit Project Workspace" : "Launch New Production Project"}
              </h2>
              <p className="text-xs text-slate-400">
                Setup shoot timelines, client assignment, and production stages.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Project Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Project Title <span className="text-rose-400">*</span>
            </label>
            <input
              {...register("name")}
              required
              placeholder="e.g. Ade & Tolu Luxury Wedding Cinema Film"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name.message}</p>}
          </div>

          {/* Client & Production Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3 text-violet-400" />
                Assign Client / Brand
              </label>
              <select
                {...register("clientId")}
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="">-- Select Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.email ? `(${c.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                Production Stage
              </label>
              <select
                {...register("status")}
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shoot Date & Delivery Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-rose-400" />
                Shoot Date
              </label>
              <input
                {...register("shootDate")}
                type="date"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                Final Delivery Target
              </label>
              <input
                {...register("deliveryDate")}
                type="date"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              Creative Scope & Deliverables
            </label>
            <textarea
              {...register("description")}
              rows={2}
              placeholder="e.g. 4K Cinema cameras, aerial drone, 5-min highlight film, 45-min documentary edit."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
            />
          </div>

          {/* Production Notes / Call Details */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Production Notes & Location Details
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="e.g. Landmark Centre, Lagos. Call time 07:00 AM. Venue drone permit approved."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FolderKanban className="w-3.5 h-3.5" />
              )}
              {submitting
                ? "Launching Project..."
                : editingProject
                ? "Update Project"
                : "Launch Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
