"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Eye,
  Download,
  Share2,
  Heart,
  Lock,
  Sparkles,
  CheckCircle2,
  UploadCloud,
  Edit2,
  Trash2,
  KeyRound,
  ShieldAlert,
  Loader2,
  FolderKanban,
  Camera,
  Layers,
  Film,
  MessageSquare,
  Play,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { CreateGalleryModal } from "@/components/galleries/create-gallery-modal";
import { UploadPhotosModal } from "@/components/galleries/upload-photos-modal";
import { CreateReviewModal } from "@/components/reviews/create-review-modal";
import { GalleryCarouselModal } from "@/components/galleries/gallery-carousel-modal";

type Gallery = {
  id: string;
  slug: string;
  title: string;
  coverPhoto: string | null;
  status: "published" | "draft" | "archived";
  watermarkEnabled: boolean;
  allowDownloads: boolean;
  password: string | null;
  downloadPin: string | null;
  createdAt: string;
  clientName: string | null;
  clientEmail: string | null;
  projectName: string | null;
  photoCount: number;
};

type VideoReviewItem = {
  id: string;
  title: string;
  version: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  status: "in_review" | "approved" | "changes_requested";
  approvedAt: string | null;
  createdAt: string;
  projectId: string | null;
  projectName: string | null;
  commentCount: number;
};

export default function GalleriesPage() {
  // Main Tab: "photos" | "videos"
  const [activeMainTab, setActiveMainTab] = useState<"photos" | "videos">("photos");

  // Photos State
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loadingGalleries, setLoadingGalleries] = useState(true);

  // Videos State
  const [videoReviews, setVideoReviews] = useState<VideoReviewItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modals
  const [isCreateGalleryOpen, setIsCreateGalleryOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [uploadTargetGallery, setUploadTargetGallery] = useState<Gallery | null>(null);
  const [carouselTargetGallery, setCarouselTargetGallery] = useState<Gallery | null>(null);
  const [isCreateReviewOpen, setIsCreateReviewOpen] = useState(false);

  // Fetch Photo Galleries
  const fetchGalleries = async () => {
    try {
      setLoadingGalleries(true);
      const res = await fetch("/api/galleries");
      if (!res.ok) throw new Error("Failed to load galleries");
      const data = await res.json();
      setGalleries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching galleries:", err);
      toast.error("Failed to load photo galleries");
    } finally {
      setLoadingGalleries(false);
    }
  };

  // Fetch Video Reviews
  const fetchVideoReviews = async () => {
    try {
      setLoadingVideos(true);
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setVideoReviews(data);
          return;
        }
      }
      // Demo fallback if no reviews in DB yet
      setVideoReviews([
        {
          id: "demo-lookbook",
          title: "Kolawole Luxury Lookbook Q3 — Commercial Master Film",
          version: "Cut V2",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200",
          durationSeconds: 60,
          status: "in_review",
          approvedAt: null,
          createdAt: new Date().toISOString(),
          projectId: null,
          projectName: "Kolawole Brand Campaign",
          commentCount: 2,
        },
      ]);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
    fetchVideoReviews();
  }, []);

  const handleGallerySaved = (saved: Gallery) => {
    setGalleries((prev) => {
      const exists = prev.some((g) => g.id === saved.id);
      if (exists) {
        return prev.map((g) => (g.id === saved.id ? { ...g, ...saved } : g));
      }
      return [{ ...saved, photoCount: 0 }, ...prev];
    });
  };

  const handleReviewSaved = (saved: VideoReviewItem) => {
    setVideoReviews((prev) => [{ ...saved, commentCount: 0 }, ...prev]);
  };

  const handleDeleteGallery = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete gallery "${title}"?`)) return;

    try {
      const res = await fetch(`/api/galleries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete gallery");

      setGalleries((prev) => prev.filter((g) => g.id !== id));
      toast.success(`Gallery "${title}" deleted`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete gallery");
    }
  };

  const handleDeleteReview = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete video cut "${title}"?`)) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete video review");

      setVideoReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Video cut "${title}" deleted`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete review");
    }
  };

  const handleCopyLink = (urlPath: string, label: string) => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    navigator.clipboard.writeText(`${origin}${urlPath}`);
    toast.success(`${label} link copied to clipboard!`);
  };

  // Filtered Photo Galleries
  const filteredGalleries = galleries.filter((g) => {
    const matchesStatus = filterStatus === "all" || g.status === filterStatus;
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.slug.toLowerCase().includes(search.toLowerCase()) ||
      (g.clientName && g.clientName.toLowerCase().includes(search.toLowerCase())) ||
      (g.projectName && g.projectName.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Filtered Video Reviews
  const filteredVideos = videoReviews.filter((v) => {
    const matchesStatus = filterStatus === "all" || v.status === filterStatus;
    const matchesSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.version.toLowerCase().includes(search.toLowerCase()) ||
      (v.projectName && v.projectName.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const totalPhotos = galleries.reduce((acc, g) => acc + (Number(g.photoCount) || 0), 0);
  const watermarkedCount = galleries.filter((g) => g.watermarkEnabled).length;
  const approvedVideosCount = videoReviews.filter((v) => v.status === "approved").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ─── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Pixieset & Frame.io Creative Hub
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Client Photo Galleries & Video Reviews
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deliver luxury branded 4K photo collections with proofing, and precision video review HUDs with frame-accurate timecodes.
          </p>
        </div>

        {/* Action Button depending on active tab */}
        {activeMainTab === "photos" ? (
          <button
            onClick={() => {
              setEditingGallery(null);
              setIsCreateGalleryOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold transition shadow-[0_0_20px_rgba(124,58,237,0.4)] self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Photo Gallery
          </button>
        ) : (
          <button
            onClick={() => setIsCreateReviewOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold transition shadow-[0_0_20px_rgba(124,58,237,0.4)] self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            New Video Review Cut
          </button>
        )}
      </div>

      {/* ─── Main Section Switcher Tabs ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] pb-1">
        <button
          onClick={() => setActiveMainTab("photos")}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeMainTab === "photos"
              ? "border-violet-500 text-white shadow-xs"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-violet-400" />
          <span>4K Photo Galleries ({galleries.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab("videos")}
          className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeMainTab === "videos"
              ? "border-cyan-400 text-white shadow-xs"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Film className="w-4 h-4 text-cyan-400" />
          <span>Video Review HUDs ({videoReviews.length})</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            Frame.io
          </span>
        </button>
      </div>

      {/* ─── Metric Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Photo Collections</span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {galleries.length} Published
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Branded client portals</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">4K Photos Delivered</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-300 tracking-tight">
            {totalPhotos} Master Photos
          </div>
          <p className="text-[11px] text-cyan-400 mt-1">Full EXIF & Proofing</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Video Review Cuts</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Film className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-300 tracking-tight">
            {videoReviews.length} Active Cuts
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">{approvedVideosCount} approved by clients</p>
        </div>

        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Watermark Protection</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            {watermarkedCount} Protected
          </div>
          <p className="text-[11px] text-amber-400 mt-1">IP & proofing security</p>
        </div>
      </div>

      {/* ─── Search & Status Filters ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0d17] p-3 rounded-2xl border border-white/[0.08]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={
              activeMainTab === "photos"
                ? "Search photo galleries by title, client, or slug..."
                : "Search video cuts by title, version, or project..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Items" },
            { id: "published", label: "Published / Approved" },
            { id: "in_review", label: "In Review" },
            { id: "draft", label: "Drafts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition border whitespace-nowrap ${
                filterStatus === tab.id
                  ? "bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(124,58,237,0.2)]"
                  : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: 4K Photo Galleries Grid ─────────────────────────────────── */}
      {activeMainTab === "photos" && (
        <>
          {loadingGalleries ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-violet-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading photo galleries...</p>
            </div>
          ) : filteredGalleries.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-8">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No photo galleries found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Create a branded 4K gallery for your wedding, fashion, or corporate clients.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingGallery(null);
                  setIsCreateGalleryOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_15px_rgba(124,58,237,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Gallery
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredGalleries.map((gal) => {
                const cover = gal.coverPhoto || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200";

                return (
                  <div
                    key={gal.id}
                    className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-violet-500/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    {/* Cover Image with Badges & Clickable Carousel Trigger */}
                    <div
                      onClick={() => setCarouselTargetGallery(gal)}
                      className="relative aspect-video bg-black/50 overflow-hidden cursor-pointer group/cover"
                    >
                      <img
                        src={cover}
                        alt={gal.title}
                        className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d17] via-transparent to-transparent pointer-events-none" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-xs capitalize">
                          {gal.status}
                        </span>
                        {gal.watermarkEnabled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-cyan-300 border border-cyan-500/30 backdrop-blur-md flex items-center gap-1">
                            <ShieldAlert className="w-2.5 h-2.5" /> Watermarked
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                        {gal.password && (
                          <div className="w-6 h-6 rounded-full bg-black/70 border border-white/[0.1] text-amber-300 flex items-center justify-center backdrop-blur-md" title="Password Protected">
                            <Lock className="w-3 h-3" />
                          </div>
                        )}
                        {gal.downloadPin && (
                          <div className="w-6 h-6 rounded-full bg-black/70 border border-white/[0.1] text-cyan-300 flex items-center justify-center backdrop-blur-md" title="PIN Locked Downloads">
                            <KeyRound className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
                        <span className="font-semibold truncate">{gal.clientName || "Direct Client"}</span>
                        <span className="text-[11px] font-mono opacity-90">{gal.photoCount} Photos</span>
                      </div>
                    </div>

                    {/* Details & Actions */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3
                          onClick={() => setCarouselTargetGallery(gal)}
                          className="text-base font-bold text-white group-hover:text-violet-300 transition line-clamp-1 cursor-pointer"
                        >
                          {gal.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>
                            {new Date(gal.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {gal.projectName && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-300 truncate max-w-[150px]">{gal.projectName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setUploadTargetGallery(gal)}
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(124,58,237,0.3)] transition flex items-center justify-center gap-1.5"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload Photos</span>
                          </button>

                          <Link
                            href={`/g/${gal.slug}`}
                            target="_blank"
                            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-cyan-300 hover:text-white text-xs font-semibold transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Portal</span>
                          </Link>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <button
                            onClick={() => handleCopyLink(`/g/${gal.slug}`, "Client gallery")}
                            className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] transition"
                          >
                            <Share2 className="w-3 h-3 text-cyan-400" />
                            Copy Link
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingGallery(gal);
                                setIsCreateGalleryOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition"
                              title="Edit gallery settings"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGallery(gal.id, gal.title)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete gallery"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: Video Reviews & Cuts Grid ───────────────────────────────── */}
      {activeMainTab === "videos" && (
        <>
          {loadingVideos ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading video review cuts...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-8">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-cyan-400 flex items-center justify-center mx-auto">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No video reviews found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Upload or link a video cut to enable frame-accurate timestamped client reviews.
                </p>
              </div>
              <button
                onClick={() => setIsCreateReviewOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_15px_rgba(124,58,237,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                Launch First Video Cut
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredVideos.map((reviewItem) => {
                const thumb =
                  reviewItem.thumbnailUrl ||
                  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200";

                return (
                  <div
                    key={reviewItem.id}
                    className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video bg-black/60 overflow-hidden">
                      <img
                        src={thumb}
                        alt={reviewItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d17] via-transparent to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/90 text-white shadow-xs">
                          {reviewItem.version}
                        </span>
                        {reviewItem.status === "approved" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-xs flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/90 text-black shadow-xs">
                            In Review
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-semibold truncate">{reviewItem.projectName || "Commercial Video"}</span>
                        <span className="text-[11px] font-mono opacity-90 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-cyan-400" />
                          {reviewItem.commentCount || 0} Comments
                        </span>
                      </div>
                    </div>

                    {/* Details & Actions */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                          {reviewItem.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>
                            {new Date(reviewItem.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span>•</span>
                          <span className="text-cyan-300 font-mono">
                            {reviewItem.durationSeconds || 60}s Duration
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                        <Link
                          href={`/review/${reviewItem.id}`}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Open Review HUD</span>
                        </Link>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <button
                            onClick={() => handleCopyLink(`/review/${reviewItem.id}?view=client`, "Client video review")}
                            className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] transition"
                          >
                            <Share2 className="w-3 h-3 text-cyan-400" />
                            Copy Review Link
                          </button>

                          <button
                            onClick={() => handleDeleteReview(reviewItem.id, reviewItem.title)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete video review"
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
        </>
      )}

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}
      <CreateGalleryModal
        isOpen={isCreateGalleryOpen}
        onClose={() => {
          setIsCreateGalleryOpen(false);
          setEditingGallery(null);
        }}
        onSuccess={handleGallerySaved}
        editingGallery={editingGallery}
      />

      <UploadPhotosModal
        isOpen={!!uploadTargetGallery}
        onClose={() => setUploadTargetGallery(null)}
        gallery={uploadTargetGallery}
        onUploadSuccess={fetchGalleries}
      />

      <CreateReviewModal
        isOpen={isCreateReviewOpen}
        onClose={() => setIsCreateReviewOpen(false)}
        onSuccess={handleReviewSaved}
      />

      <GalleryCarouselModal
        isOpen={!!carouselTargetGallery}
        onClose={() => setCarouselTargetGallery(null)}
        gallery={carouselTargetGallery}
        onOpenUpload={(gal) => setUploadTargetGallery(gal)}
      />
    </div>
  );
}
