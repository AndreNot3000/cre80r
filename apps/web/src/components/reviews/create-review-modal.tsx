"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVideoReviewSchema } from "@crea8or/validators";
import { z } from "zod";
import {
  X,
  Film,
  FolderKanban,
  Sparkles,
  Loader2,
  CheckCircle2,
  Layers,
  Clock,
  FolderOpen,
  UploadCloud,
  FileVideo,
} from "lucide-react";
import { toast } from "sonner";

type ReviewFormValues = z.infer<typeof createVideoReviewSchema>;

interface ProjectOption {
  id: string;
  name: string;
}

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedReview: any) => void;
  defaultProjectId?: string;
}

const PRESET_VIDEOS = [
  {
    label: "African Heritage Commercial (60s ProRes)",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumb: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200",
    duration: 60,
  },
  {
    label: "Luxury Wedding Cinema Trailer (4K)",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumb: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    duration: 15,
  },
];

export function CreateReviewModal({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId,
}: CreateReviewModalProps) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(0);
  const [localVideoFileName, setLocalVideoFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(createVideoReviewSchema),
    defaultValues: {
      version: "Cut V2",
      status: "in_review",
      videoUrl: PRESET_VIDEOS[0]!.url,
      thumbnailUrl: PRESET_VIDEOS[0]!.thumb,
      durationSeconds: PRESET_VIDEOS[0]!.duration,
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/projects")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setProjects(data);
        })
        .catch(() => {});

      if (defaultProjectId) {
        setValue("projectId", defaultProjectId);
      }
    }
  }, [isOpen, defaultProjectId, setValue]);

  // Handle selecting local video file from PC
  const handleLocalVideoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedPreset(null);
    setLocalVideoFileName(file.name);

    // Read as Data URL or Object URL for browser video playback
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setValue("videoUrl", dataUrl);

      // Auto-detect duration from video element
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      tempVideo.src = dataUrl;
      tempVideo.onloadedmetadata = () => {
        const detectedDuration = Math.round(tempVideo.duration) || 60;
        setValue("durationSeconds", detectedDuration);
      };

      // Set fallback thumbnail
      setValue(
        "thumbnailUrl",
        "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200"
      );

      // If title is blank, default to file name without extension
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
      setValue("title", cleanTitle);

      toast.success(`Video "${file.name}" loaded from your computer!`);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const onSubmit = async (data: ReviewFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        title: data.title.trim(),
        version: data.version.trim() || "Cut V1",
        projectId: data.projectId || undefined,
        videoUrl: data.videoUrl.trim(),
        thumbnailUrl: data.thumbnailUrl?.trim() || undefined,
        durationSeconds: Number(data.durationSeconds) || 60,
        status: data.status || "in_review",
      };

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create video review");
      }

      const result = await res.json();
      toast.success(`Video Review "${result.title}" created!`);
      reset();
      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error("Create review error:", err);
      toast.error(err?.message || "Failed to create review");
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
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                New Video Review Cut
              </h2>
              <p className="text-xs text-slate-400">
                Frame.io alternative with SMPTE timecode sync & frame-accurate client approvals.
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
          {/* Review Title */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Cut Title <span className="text-rose-400">*</span>
            </label>
            <input
              {...register("title")}
              required
              placeholder="e.g. Kolawole Luxury Lookbook Q3 — Commercial Master"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            {errors.title && <p className="text-rose-400 text-[11px] mt-1">{errors.title.message}</p>}
          </div>

          {/* Version & Linked Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                Cut Version
              </label>
              <select
                {...register("version")}
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="Cut V1">Cut V1 (Assembly / Rough)</option>
                <option value="Cut V2">Cut V2 (Director / Fine Cut)</option>
                <option value="Cut V3">Cut V3 (Color & Sound Mix)</option>
                <option value="Final Master">Final Master (4K Delivery)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <FolderKanban className="w-3 h-3 text-violet-400" />
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

          {/* ─── Video File Selection (Local File Picker + Quick Presets) ───── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-300">
                Choose Video Source
              </label>
              {localVideoFileName && (
                <span className="text-[10px] text-cyan-300 font-mono truncate max-w-[200px]">
                  Loaded: {localVideoFileName}
                </span>
              )}
            </div>

            {/* Hidden Video File Picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleLocalVideoSelected}
              className="hidden"
            />

            {/* Local File Browser Button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-2xl border-2 border-dashed border-white/[0.15] hover:border-violet-500/60 bg-white/[0.02] hover:bg-violet-600/[0.05] cursor-pointer flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">
                    {localVideoFileName ? "Change video from computer" : "Choose video file from computer"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Supports MP4, WebM, QuickTime MOV exports
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition">
                Browse PC
              </span>
            </div>

            {/* Quick Demo Presets */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">
                Or pick a quick demo video stream:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_VIDEOS.map((preset, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedPreset(i);
                      setLocalVideoFileName(null);
                      setValue("videoUrl", preset.url);
                      setValue("thumbnailUrl", preset.thumb);
                      setValue("durationSeconds", preset.duration);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition ${
                      selectedPreset === i
                        ? "bg-violet-600/15 border-violet-500 ring-1 ring-violet-500/40"
                        : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.2]"
                    }`}
                  >
                    <div className="font-semibold text-white truncate text-[11px]">{preset.label}</div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{preset.duration}s Duration</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Video URL Fallback */}
            <input
              {...register("videoUrl")}
              required
              placeholder="Or paste direct video stream URL (MP4 / WebM / CDN)..."
              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-[11px]"
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
                <Film className="w-3.5 h-3.5" />
              )}
              {submitting ? "Publishing Cut..." : "Launch Review Cut"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
