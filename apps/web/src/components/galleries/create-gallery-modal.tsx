"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGallerySchema } from "@crea8or/validators";
import { z } from "zod";
import {
  X,
  Image as ImageIcon,
  User,
  FolderKanban,
  Lock,
  KeyRound,
  ShieldAlert,
  Sparkles,
  Download,
  Loader2,
  CheckCircle2,
  FolderOpen,
  UploadCloud,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

type GalleryFormValues = z.infer<typeof createGallerySchema>;

interface ClientOption {
  id: string;
  name: string;
  email: string | null;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface CreateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedGallery: any) => void;
  editingGallery?: any | null;
}

const PRESET_COVERS = [
  { label: "Luxury Wedding", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80" },
  { label: "Commercial Fashion", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80" },
  { label: "Editorial Studio", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80" },
  { label: "Event Festival", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80" },
];

export function CreateGalleryModal({
  isOpen,
  onClose,
  onSuccess,
  editingGallery,
}: CreateGalleryModalProps) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCover, setSelectedCover] = useState<string>(PRESET_COVERS[0]!.url);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GalleryFormValues>({
    resolver: zodResolver(createGallerySchema),
    defaultValues: {
      watermarkEnabled: false,
      allowDownloads: true,
      status: "published",
      coverPhoto: PRESET_COVERS[0]!.url,
    },
  });

  const watermarkEnabled = watch("watermarkEnabled");
  const allowDownloads = watch("allowDownloads");

  useEffect(() => {
    if (isOpen) {
      // Fetch clients and projects
      fetch("/api/clients")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setClients(data);
        })
        .catch(() => {});

      fetch("/api/projects")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setProjects(data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingGallery) {
      setValue("title", editingGallery.title);
      setValue("slug", editingGallery.slug || "");
      setValue("clientId", editingGallery.clientId || "");
      setValue("projectId", editingGallery.projectId || "");
      setValue("coverPhoto", editingGallery.coverPhoto || PRESET_COVERS[0]!.url);
      setSelectedCover(editingGallery.coverPhoto || PRESET_COVERS[0]!.url);
      setValue("password", editingGallery.password || "");
      setValue("downloadPin", editingGallery.downloadPin || "");
      setValue("watermarkEnabled", editingGallery.watermarkEnabled ?? false);
      setValue("allowDownloads", editingGallery.allowDownloads ?? true);
      setValue("status", editingGallery.status || "published");
      setCoverFileName(null);
    } else {
      reset({
        title: "",
        slug: "",
        clientId: "",
        projectId: "",
        coverPhoto: PRESET_COVERS[0]!.url,
        password: "",
        downloadPin: "",
        watermarkEnabled: false,
        allowDownloads: true,
        status: "published",
      });
      setSelectedCover(PRESET_COVERS[0]!.url);
      setCoverFileName(null);
    }
  }, [editingGallery, setValue, reset, isOpen]);

  // Handle choosing cover photo from local computer / device
  const handleLocalCoverSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedCover(result);
      setValue("coverPhoto", result);
      setCoverFileName(file.name);
      toast.success(`Custom cover "${file.name}" selected from device!`);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const onSubmit = async (data: GalleryFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        title: data.title.trim(),
        slug: data.slug?.trim() || undefined,
        clientId: data.clientId || undefined,
        projectId: data.projectId || undefined,
        coverPhoto: selectedCover || data.coverPhoto || undefined,
        password: data.password?.trim() || undefined,
        downloadPin: data.downloadPin?.trim() || undefined,
        watermarkEnabled: data.watermarkEnabled,
        allowDownloads: data.allowDownloads,
        status: data.status || "published",
      };

      const url = editingGallery ? `/api/galleries/${editingGallery.id}` : "/api/galleries";
      const method = editingGallery ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save gallery");
      }

      const result = await res.json();
      toast.success(
        editingGallery
          ? `Gallery "${result.title}" updated!`
          : `4K Client Gallery "${result.title}" published!`
      );
      reset();
      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error("Save gallery error:", err);
      toast.error(err?.message || "Failed to save gallery");
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
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {editingGallery ? "Configure Photo Gallery" : "Create 4K Client Photo Gallery"}
              </h2>
              <p className="text-xs text-slate-400">
                Pixieset-style luxury delivery portal with proofing and PIN downloads.
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
          {/* Gallery Title */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Gallery Title <span className="text-rose-400">*</span>
            </label>
            <input
              {...register("title")}
              required
              placeholder="e.g. Adeola & Tolulope Traditional Wedding (4K Master)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            {errors.title && <p className="text-rose-400 text-[11px] mt-1">{errors.title.message}</p>}
          </div>

          {/* Client & Linked Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3 text-violet-400" />
                Assign Client / Couple
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
                <FolderKanban className="w-3 h-3 text-cyan-400" />
                Link Shoot Project
              </label>
              <select
                {...register("projectId")}
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="">-- No Linked Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ─── Cover Photo Selector (Presets + Local Computer Picker) ───────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-300">
                Gallery Cover Photo
              </label>
              {coverFileName && (
                <span className="text-[10px] text-cyan-300 font-mono truncate max-w-[200px]">
                  Loaded: {coverFileName}
                </span>
              )}
            </div>

            {/* Hidden Local File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLocalCoverSelected}
              className="hidden"
            />

            {/* Cover Presets Grid + Browse Button */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              {/* Option to Upload From Computer */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-white/[0.15] hover:border-violet-500/60 bg-white/[0.02] hover:bg-violet-600/[0.05] cursor-pointer flex flex-col items-center justify-center p-2 text-center transition group"
              >
                <FolderOpen className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[9px] font-bold text-slate-300 group-hover:text-white leading-tight">
                  Browse PC
                </span>
              </div>

              {/* 4 Presets */}
              {PRESET_COVERS.map((preset, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedCover(preset.url);
                    setValue("coverPhoto", preset.url);
                    setCoverFileName(null);
                  }}
                  className={`aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition relative ${
                    selectedCover === preset.url
                      ? "border-violet-500 ring-2 ring-violet-500/40"
                      : "border-white/[0.08] hover:border-white/[0.2]"
                  }`}
                  title={preset.label}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  {selectedCover === preset.url && (
                    <div className="absolute inset-0 bg-violet-600/30 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Direct Image URL fallback */}
            <input
              {...register("coverPhoto")}
              value={selectedCover}
              onChange={(e) => {
                setSelectedCover(e.target.value);
                setCoverFileName(null);
              }}
              placeholder="Or paste custom image / CDN URL..."
              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[11px]"
            />
          </div>

          {/* Privacy & Security Settings */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Privacy & Download Security
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Private Access Password (Optional)
                </label>
                <input
                  {...register("password")}
                  placeholder="e.g. Adeola2026"
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  4-Digit Download PIN (Optional)
                </label>
                <input
                  {...register("downloadPin")}
                  maxLength={6}
                  placeholder="e.g. 8842"
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[11px] font-mono"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("watermarkEnabled")}
                  className="rounded border-white/[0.2] bg-white/[0.05] text-violet-600 focus:ring-violet-500"
                />
                <span className="text-slate-300 font-medium">Enable Protective Studio Watermark</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("allowDownloads")}
                  className="rounded border-white/[0.2] bg-white/[0.05] text-violet-600 focus:ring-violet-500"
                />
                <span className="text-slate-300 font-medium">Allow 4K Downloads</span>
              </label>
            </div>
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
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              {submitting
                ? "Saving Gallery..."
                : editingGallery
                ? "Update Gallery"
                : "Publish 4K Gallery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
