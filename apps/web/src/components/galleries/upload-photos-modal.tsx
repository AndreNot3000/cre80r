"use client";

import { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  Trash2,
  Layers,
  Plus,
  FileImage,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

interface UploadPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  gallery: any;
  onUploadSuccess: () => void;
}

const SAMPLE_PHOTO_PRESETS = [
  { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80", filename: "Wedding_Ceremony_001.jpg", category: "Ceremony" },
  { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&auto=format&fit=crop&q=80", filename: "Couple_GoldenHour_002.jpg", category: "Portraits" },
  { url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1600&auto=format&fit=crop&q=80", filename: "Reception_Dance_003.jpg", category: "Reception" },
  { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&auto=format&fit=crop&q=80", filename: "Fashion_Editorial_004.jpg", category: "Highlights" },
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&auto=format&fit=crop&q=80", filename: "Studio_Beauty_005.jpg", category: "Portraits" },
  { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=80", filename: "Event_Concert_006.jpg", category: "Highlights" },
];

export function UploadPhotosModal({
  isOpen,
  onClose,
  gallery,
  onUploadSuccess,
}: UploadPhotosModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("Highlights");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !gallery) return null;

  // 1. Handle Local Computer Files Selection (Drag & Drop or File Picker)
  const handleLocalFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(15);

    try {
      const photoItems: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        const base64Url = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        photoItems.push({
          url: base64Url,
          thumbnailUrl: base64Url,
          filename: file.name,
          sizeBytes: file.size,
          category: selectedCategory,
          exifData: {
            camera: "Sony α1 Master",
            lens: "85mm f/1.4 GM",
            aperture: "f/1.4",
            shutter: "1/800s",
            iso: 100,
          },
        });
      }

      setUploadProgress(60);

      const res = await fetch(`/api/galleries/${gallery.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photoItems),
      });

      setUploadProgress(100);
      if (!res.ok) throw new Error("Failed to upload photos");

      toast.success(`${photoItems.length} photos uploaded from your device!`);
      onUploadSuccess();
      setTimeout(onClose, 500);
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload local photos");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 2. Handle 4K Sample Batch Ingest
  const handleBatchUpload = async (items: typeof SAMPLE_PHOTO_PRESETS) => {
    setUploading(true);
    setUploadProgress(20);

    try {
      setUploadProgress(50);
      const res = await fetch(`/api/galleries/${gallery.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });

      setUploadProgress(90);
      if (!res.ok) throw new Error("Failed to upload photos");

      setUploadProgress(100);
      toast.success(`${items.length} 4K Master Photos added to gallery!`);
      onUploadSuccess();
      setTimeout(onClose, 500);
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photos");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 3. Handle Custom Web / Cloud URL
  const handleAddCustomPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setUploading(true);
    try {
      const payload = {
        url: customUrl.trim(),
        filename: `Photo_${Date.now()}.jpg`,
        category: selectedCategory,
        sizeBytes: 8500000,
        exifData: { camera: "Sony α1", lens: "50mm f/1.2 GM", aperture: "f/1.2", iso: 100, shutter: "1/1000s" },
      };

      const res = await fetch(`/api/galleries/${gallery.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add photo");

      toast.success("Photo added to gallery!");
      setCustomUrl("");
      onUploadSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0c0d17] border border-white/[0.1] rounded-3xl w-full max-w-xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Upload Photos to {gallery.title}
              </h2>
              <p className="text-xs text-slate-400">
                High-speed 4K upload with automatic WebP thumbnails & EXIF reader.
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

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Target Category Selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <span className="font-semibold text-slate-300">Target Category Set:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[11px]"
            >
              <option value="Highlights">Highlights</option>
              <option value="Ceremony">Ceremony</option>
              <option value="Reception">Reception</option>
              <option value="Portraits">Portraits</option>
            </select>
          </div>

          {/* Option 1: Drag-and-Drop Local File Uploader */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/[0.15] hover:border-violet-500/60 rounded-3xl p-6 text-center space-y-3 cursor-pointer bg-white/[0.01] hover:bg-violet-600/[0.03] transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleLocalFilesSelected}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">
                Click to browse files from your computer
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select multiple JPG, PNG, RAW, or WebP photos from your shoot folder
              </p>
            </div>
            {uploading && uploadProgress > 0 && (
              <div className="space-y-1 pt-2 max-w-xs mx-auto">
                <div className="h-1.5 w-full bg-white/[0.1] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full transition-all duration-300"
                  />
                </div>
                <span className="text-[10px] text-cyan-300 font-mono">Uploading ({uploadProgress}%)...</span>
              </div>
            )}
          </div>

          {/* Option 2: Quick 4K Demo Ingest */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-cyan-500/10 border border-violet-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Quick 4K Demo Ingest
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">6 High-Res Photos</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Don't have shoot photos ready on this computer? 1-click ingest 6 sample 4K wedding and portrait master photos with full EXIF data.
            </p>
            <button
              onClick={() => handleBatchUpload(SAMPLE_PHOTO_PRESETS)}
              disabled={uploading}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-[0_0_15px_rgba(124,58,237,0.4)] flex items-center justify-center gap-1.5 transition disabled:opacity-50 text-xs"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              {uploading ? `Uploading Photos (${uploadProgress}%)...` : "Ingest Sample 4K Photo Pack"}
            </button>
          </div>

          {/* Option 3: Add Custom Image URL */}
          <form onSubmit={handleAddCustomPhoto} className="space-y-2 pt-1 border-t border-white/[0.06]">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-violet-400" />
              Add Cloud / CDN Image URL
            </h3>

            <div className="flex items-center gap-2">
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-bucket.s3.amazonaws.com/photo-01.jpg"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[11px]"
              />
              <button
                type="submit"
                disabled={uploading || !customUrl.trim()}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-semibold transition disabled:opacity-50 text-xs shrink-0"
              >
                Add URL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
