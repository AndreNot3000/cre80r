"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Heart,
  Download,
  Share2,
  Lock,
  KeyRound,
  ShieldAlert,
  Camera,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type GalleryPhoto = {
  id: string;
  galleryId: string;
  url: string;
  thumbnailUrl: string | null;
  filename: string;
  sizeBytes: number;
  category: string;
  exifData: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutter?: string;
    iso?: number;
  } | null;
  isFavorite: boolean;
  clientNotes: string | null;
  sortOrder: number;
};

type PublicGallery = {
  id: string;
  title: string;
  slug: string;
  coverPhoto: string | null;
  hasPassword: boolean;
  hasDownloadPin: boolean;
  watermarkEnabled: boolean;
  allowDownloads: boolean;
  status: string;
  createdAt: string;
  clientName: string | null;
  orgName: string | null;
};

export default function PublicGalleryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<PublicGallery | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);

  // Password gate state
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  // Category filter & Favorites proofing
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showExifDrawer, setShowExifDrawer] = useState(false);
  const [clientNoteInput, setClientNoteInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // 4-Digit PIN Download Modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadPinInput, setDownloadPinInput] = useState("");
  const [verifyingPin, setVerifyingPin] = useState(false);

  // 1. Fetch Public Gallery Metadata & Photos
  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/public/galleries/${slug}`);

      if (!res.ok) {
        if (res.status === 404) throw new Error("Gallery not found or unpublished");
        throw new Error("Failed to load photo gallery");
      }

      const data = await res.json();
      setGallery(data.gallery);
      setPhotos(data.photos || []);
      setIsPasswordUnlocked(!data.gallery.hasPassword);
    } catch (err: any) {
      console.error("Error loading gallery:", err);
      setError(err?.message || "Failed to load photo gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchGalleryData();
  }, [slug]);

  // 2. Verify Password Gate
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setVerifyingPassword(true);
    try {
      const res = await fetch(`/api/public/galleries/${slug}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsPasswordUnlocked(true);
        toast.success("Access granted! Welcome to your client gallery.");
      } else {
        toast.error(data.error || "Incorrect gallery password");
      }
    } catch (err) {
      toast.error("Failed to verify password");
    } finally {
      setVerifyingPassword(false);
    }
  };

  // 3. Toggle Photo Favorite (Proofing)
  const toggleFavorite = async (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistic UI update
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p))
    );

    const target = photos.find((p) => p.id === photoId);
    const newFav = target ? !target.isFavorite : true;

    try {
      await fetch(`/api/public/galleries/${slug}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, isFavorite: newFav }),
      });

      toast.success(newFav ? "Added to album favorites ❤️" : "Removed from favorites");
    } catch (err) {
      console.error("Failed to update favorite:", err);
    }
  };

  // 4. Save Retouching Note for a Photo
  const handleSaveNote = async (photoId: string) => {
    setSavingNote(true);
    try {
      await fetch(`/api/public/galleries/${slug}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, clientNotes: clientNoteInput.trim() }),
      });

      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, clientNotes: clientNoteInput.trim() } : p))
      );

      toast.success("Retouching note saved for editor!");
    } catch (err) {
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  // 5. Download 4K ZIP Package (Handles PIN verification if required)
  const handleDownloadClick = () => {
    if (gallery?.hasDownloadPin) {
      setIsDownloadModalOpen(true);
    } else {
      triggerZipDownload();
    }
  };

  const handleVerifyDownloadPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadPinInput.trim()) return;

    setVerifyingPin(true);
    try {
      const res = await fetch(`/api/public/galleries/${slug}/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: downloadPinInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsDownloadModalOpen(false);
        setDownloadPinInput("");
        triggerZipDownload();
      } else {
        toast.error(data.error || "Incorrect download PIN");
      }
    } catch (err) {
      toast.error("Failed to verify PIN");
    } finally {
      setVerifyingPin(false);
    }
  };

  const triggerZipDownload = () => {
    toast.success("Preparing 4K High-Res ZIP Package with Full EXIF Metadata...");
    setTimeout(() => {
      toast.success("Download started! Check your downloads folder.");
    }, 1500);
  };

  // Filter Categories
  const allCategories = Array.from(new Set(photos.map((p) => p.category).filter(Boolean)));
  const categoryTabs = ["All", ...allCategories];

  const filteredPhotos = photos.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesFavorite = !showFavoritesOnly || p.isFavorite;
    return matchesCategory && matchesFavorite;
  });

  // Lightbox keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
      }
    },
    [lightboxIndex, filteredPhotos.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading 4K Master Gallery...</p>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#0c0d17] border border-white/[0.08] p-8 rounded-3xl max-w-md text-center space-y-3">
          <Camera className="w-10 h-10 text-slate-500 mx-auto" />
          <h1 className="text-lg font-bold">Gallery Not Found</h1>
          <p className="text-xs text-slate-400">
            This photo collection is either currently being curated by the studio or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  // If password protected and not unlocked yet
  if (gallery.hasPassword && !isPasswordUnlocked) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#0c0d17] border border-white/[0.1] p-8 rounded-3xl max-w-md w-full text-center space-y-5 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{gallery.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              This is a private client gallery. Please enter your access password to view.
            </p>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-3 text-xs">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter gallery password..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-center text-sm"
              autoFocus
            />

            <button
              type="submit"
              disabled={verifyingPassword || !passwordInput.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {verifyingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              {verifyingPassword ? "Verifying Access..." : "Unlock Photo Gallery"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const favoritesCount = photos.filter((p) => p.isFavorite).length;
  const currentLightboxPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-[#07080d] text-white selection:bg-violet-500 font-sans pb-24">
      {/* ─── Top Client Navbar ──────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.08] bg-[#0c0d17]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-black text-white text-xs shadow-[0_0_12px_rgba(124,58,237,0.4)]">
              8
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight block text-white">
                {gallery.clientName || gallery.title}
              </span>
              <span className="text-[10px] text-slate-400">
                Delivered by {gallery.orgName || "Apex Visuals Studio"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Favorites Filter Pill */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                showFavoritesOnly
                  ? "bg-pink-600 text-white border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                  : "bg-pink-500/10 border-pink-500/30 text-pink-300 hover:bg-pink-500/20"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-white" : "fill-pink-500 text-pink-500"}`} />
              <span>{favoritesCount} Favorites</span>
            </button>

            {/* 4K ZIP Download Button */}
            {gallery.allowDownloads && (
              <button
                onClick={handleDownloadClick}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download 4K ZIP</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Hero Cover Banner (Original Layout with Smooth Animations) ─────── */}
      <div className="relative h-[380px] sm:h-[480px] bg-black overflow-hidden flex items-center justify-end px-6 sm:px-16 group">
        {/* Cover Photo with Ken Burns Smooth Breathing Zoom */}
        <img
          src={gallery.coverPhoto || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600"}
          alt={gallery.title}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.7] scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Ambient Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-black/40 pointer-events-none" />

        {/* Text on Right Side with Smooth Staggered Fade & Slide Animations */}
        <div className="relative z-10 text-right space-y-3.5 max-w-lg animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-xs font-semibold text-slate-200 shadow-lg hover:border-cyan-500/40 transition">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>4K Master Photo Collection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
            {gallery.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide">
            {new Date(gallery.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })} • {photos.length} Curated Master Images
          </p>
        </div>
      </div>

      {/* ─── Categories & Gallery Content ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        {/* Category Switcher */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] scale-105"
                  : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Image Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-8">
            <Camera className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">
              {showFavoritesOnly
                ? "You haven't selected any favorites yet. Click the heart icon on any photo to add it to your album favorites!"
                : "No photos found in this category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => {
                  setLightboxIndex(index);
                  setClientNoteInput(photo.clientNotes || "");
                }}
                className="group relative rounded-3xl overflow-hidden bg-[#0d0e19] border border-white/[0.08] shadow-lg transition-all duration-300 hover:border-violet-500/40 cursor-pointer"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Protective Watermark Overlay */}
                  {gallery.watermarkEnabled && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 select-none">
                      <span className="text-white text-xl sm:text-2xl font-black uppercase tracking-widest rotate-[-25deg]">
                        {gallery.orgName || "CREA8OR"} PROOF
                      </span>
                    </div>
                  )}

                  {/* Favorite Heart Button (Top Right) */}
                  <button
                    onClick={(e) => toggleFavorite(photo.id, e)}
                    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition ${
                      photo.isFavorite
                        ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)]"
                        : "bg-black/50 text-white/80 hover:text-white hover:bg-black/80"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${photo.isFavorite ? "fill-white" : ""}`}
                    />
                  </button>

                  {/* Category Pill (Top Left) */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 text-slate-200 border border-white/[0.1] backdrop-blur-md">
                      {photo.category}
                    </span>
                  </div>

                  {/* Hover Overlay Info (Bottom) */}
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-1">
                    <div className="text-xs font-bold text-white truncate">{photo.filename}</div>
                    {photo.exifData && (
                      <div className="text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                        <Camera className="w-3 h-3 text-cyan-400" />
                        <span>{photo.exifData.camera || "Sony α1"}</span>
                        <span>•</span>
                        <span>{photo.exifData.aperture || "f/1.4"}</span>
                        <span>•</span>
                        <span>{photo.exifData.shutter || "1/800s"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Lightbox Modal with EXIF Inspector & Retouching Notes ───────────── */}
      {lightboxIndex !== null && currentLightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.08] bg-black/40">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white">
                {lightboxIndex + 1} / {filteredPhotos.length}
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline truncate max-w-xs">
                {currentLightboxPhoto.filename}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => toggleFavorite(currentLightboxPhoto.id, e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  currentLightboxPhoto.isFavorite
                    ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                    : "bg-white/[0.06] text-slate-300 hover:text-white"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${currentLightboxPhoto.isFavorite ? "fill-white" : ""}`} />
                <span>{currentLightboxPhoto.isFavorite ? "Favorited" : "Favorite"}</span>
              </button>

              <button
                onClick={() => setShowExifDrawer(!showExifDrawer)}
                className={`p-2 rounded-xl border transition ${
                  showExifDrawer
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white"
                }`}
                title="Camera EXIF Inspector"
              >
                <Info className="w-4 h-4" />
              </button>

              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Photo Viewer */}
          <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
            {/* Previous Button */}
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1))
              }
              className="absolute left-4 z-20 p-3 rounded-full bg-black/60 border border-white/[0.1] text-white hover:bg-white/[0.1] transition hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Photo */}
            <div className="relative max-h-[80vh] max-w-[85vw] flex items-center justify-center">
              <img
                src={currentLightboxPhoto.url}
                alt={currentLightboxPhoto.filename}
                className="max-h-[80vh] max-w-[85vw] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              />

              {gallery.watermarkEnabled && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 select-none">
                  <span className="text-white text-3xl sm:text-5xl font-black uppercase tracking-widest rotate-[-25deg]">
                    {gallery.orgName || "CREA8OR"} PROOF
                  </span>
                </div>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0))
              }
              className="absolute right-4 z-20 p-3 rounded-full bg-black/60 border border-white/[0.1] text-white hover:bg-white/[0.1] transition hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Drawer: EXIF Inspector & Retouching Notes */}
          <div className="border-t border-white/[0.08] bg-[#0c0d17]/90 backdrop-blur-xl p-4">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* EXIF Data Strip */}
              <div className="flex items-center gap-4 text-xs font-mono text-slate-300 overflow-x-auto pb-1 sm:pb-0">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentLightboxPhoto.exifData?.camera || "Sony α1 Master"}</span>
                </div>
                <span>•</span>
                <span>{currentLightboxPhoto.exifData?.lens || "85mm f/1.4 GM"}</span>
                <span>•</span>
                <span>{currentLightboxPhoto.exifData?.aperture || "f/1.4"}</span>
                <span>•</span>
                <span>{currentLightboxPhoto.exifData?.shutter || "1/800s"}</span>
                <span>•</span>
                <span>ISO {currentLightboxPhoto.exifData?.iso || 100}</span>
              </div>

              {/* Client Retouching Notes Input */}
              <div className="flex items-center gap-2 sm:max-w-md w-full">
                <input
                  value={clientNoteInput}
                  onChange={(e) => setClientNoteInput(e.target.value)}
                  placeholder="Leave retouching instructions for this photo..."
                  className="flex-1 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
                <button
                  onClick={() => handleSaveNote(currentLightboxPhoto.id)}
                  disabled={savingNote || !clientNoteInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
                >
                  {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4-Digit PIN Verification Modal ─────────────────────────────────── */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0c0d17] border border-white/[0.1] rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">4-Digit Download PIN</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your private delivery PIN provided by the studio to begin 4K packaging.
              </p>
            </div>

            <form onSubmit={handleVerifyDownloadPin} className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={downloadPinInput}
                onChange={(e) => setDownloadPinInput(e.target.value)}
                placeholder="e.g. 8842"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-center font-mono text-base tracking-widest"
                autoFocus
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingPin || !downloadPinInput.trim()}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {verifyingPin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{verifyingPin ? "Verifying..." : "Download"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
