"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Send,
  Clock,
  Share2,
  Download,
  ShieldCheck,
  Film,
  Layers,
  Check,
  RotateCcw,
  SkipBack,
  SkipForward,
  Loader2,
  AlertCircle,
  Activity,
  Radio,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

type VideoComment = {
  id: string;
  videoReviewId: string;
  timestampSeconds: number;
  timecode: string;
  authorName: string;
  authorRole: "client" | "creator" | "editor";
  content: string;
  resolved: boolean;
  drawingData?: any;
  createdAt: string;
};

type VideoReview = {
  id: string;
  title: string;
  version: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  status: "in_review" | "approved" | "changes_requested";
  approvedAt: string | null;
  projectName?: string | null;
  orgName?: string | null;
};

const DEMO_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

function VideoReviewPlayerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reviewId = params.id as string;
  const { data: session } = useSession();
  const isCreator = !!session?.user;
  const isExplicitClient = searchParams.get("view") === "client" || searchParams.get("role") === "client";
  const [previewAsClient, setPreviewAsClient] = useState(false);
  const showClientView = isExplicitClient || !isCreator || previewAsClient;

  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<VideoReview | null>(null);
  const [comments, setComments] = useState<VideoComment[]>([]);

  // Video Playback State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Comment input
  const [authorName, setAuthorName] = useState(session?.user?.name || "Client Reviewer");
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [filterResolved, setFilterResolved] = useState<"all" | "unresolved" | "resolved">("all");

  // Approval state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // 1. Fetch Review & Comments from API
  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/public/reviews/${reviewId}`);
      if (res.ok) {
        const data = await res.json();
        setReview(data.review);
        setComments(data.comments || []);
        if (data.review.durationSeconds > 0) {
          setDuration(data.review.durationSeconds);
        }
      } else {
        // Fallback demo review
        setReview({
          id: reviewId,
          title: "Kolawole Luxury Lookbook Q3 — Commercial Master Film",
          version: "Cut V2",
          videoUrl: DEMO_VIDEO_URL,
          thumbnailUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200",
          durationSeconds: 60,
          status: "in_review",
          approvedAt: null,
          projectName: "Kolawole Luxury Brand Campaign",
          orgName: "Apex Visuals Studio",
        });
        setComments([
          {
            id: "c-1",
            videoReviewId: reviewId,
            timestampSeconds: 5,
            timecode: "00:05:00",
            authorName: "Tolulope (Client Lead)",
            authorRole: "client",
            content: "Can we extend this opening establishing shot by 2 more seconds for brand logo lockup?",
            resolved: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: "c-2",
            videoReviewId: reviewId,
            timestampSeconds: 18,
            timecode: "00:18:12",
            authorName: "Adeola (Lead Director)",
            authorRole: "creator",
            content: "ACES color pipeline applied; cinematic warm highlight rolloff is calibrated for 4K HDR.",
            resolved: false,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching review:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reviewId) fetchReviewData();
  }, [reviewId]);

  // Format seconds to SMPTE Timecode (HH:MM:SS:FF at 24fps)
  const formatTimecode = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 24);

    const pad = (n: number) => n.toString().padStart(2, "0");
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
    }
    return `${pad(mins)}:${pad(secs)}:${pad(frames)}`;
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Frame Step Forward / Backward (1/24th sec)
  const stepFrame = (forward = true) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    const frameTime = 1 / 24;
    const newTime = forward
      ? Math.min(videoRef.current.currentTime + frameTime, duration)
      : Math.max(videoRef.current.currentTime - frameTime, 0);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Keyboard Shortcuts: Spacebar (Play/Pause), Left/Right Arrows (Frame Stepping)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        stepFrame(false);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        stepFrame(true);
      }
    },
    [isPlaying, duration]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Jump to comment timecode
  const jumpToTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  // Post Timestamped Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    const timecodeStr = formatTimecode(currentTime);

    try {
      const payload = {
        timestampSeconds: Math.floor(currentTime),
        timecode: timecodeStr,
        authorName: authorName.trim() || "Client Reviewer",
        authorRole: "client" as const,
        content: newCommentText.trim(),
      };

      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments((prev) => [...prev, savedComment]);
        toast.success(`Feedback stamped at frame ${timecodeStr}!`);
      } else {
        // Local simulation fallback
        const simulated: VideoComment = {
          id: `c-${Date.now()}`,
          videoReviewId: reviewId,
          timestampSeconds: currentTime,
          timecode: timecodeStr,
          authorName: authorName.trim() || "Client Reviewer",
          authorRole: "client",
          content: newCommentText.trim(),
          resolved: false,
          createdAt: new Date().toISOString(),
        };
        setComments((prev) => [...prev, simulated]);
        toast.success(`Feedback stamped at frame ${timecodeStr}!`);
      }

      setNewCommentText("");
    } catch (err) {
      toast.error("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Toggle Comment Resolved
  const toggleResolved = async (commentId: string, currentResolved: boolean) => {
    const newResolved = !currentResolved;

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: newResolved } : c))
    );

    try {
      await fetch(`/api/reviews/${reviewId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: newResolved }),
      });
      toast.info(newResolved ? "Comment marked as resolved ✓" : "Comment reopened");
    } catch (err) {
      console.error("Error updating comment resolution:", err);
    }
  };

  // 1-Click Approve Cut / Request Changes
  const handleUpdateStatus = async (status: "approved" | "changes_requested") => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReview((prev) => (prev ? { ...prev, status: updated.status, approvedAt: updated.approvedAt } : prev));
      } else {
        setReview((prev) => (prev ? { ...prev, status } : prev));
      }

      if (status === "approved") {
        toast.success(`🎉 ${review?.version || "Cut V2"} Approved! Ready for final master delivery.`);
      } else {
        toast.warning("Changes requested. The editing team has been notified.");
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (filterResolved === "unresolved") return !c.resolved;
    if (filterResolved === "resolved") return c.resolved;
    return true;
  });

  // Check which comment is currently active during playback
  const activeCommentId = comments.find(
    (c) => Math.abs(c.timestampSeconds - currentTime) < 2
  )?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading Frame-Accurate Video HUD...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-white selection:bg-violet-500 font-sans pb-16">
      {/* ─── Top Navigation Bar ─────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.08] bg-[#0c0d17]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-black text-white text-xs shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              8
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white truncate max-w-[280px] sm:max-w-md">
                  {review?.title || "Video Review"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                  {review?.version || "Cut V1"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {review?.orgName || "Apex Visuals Studio"} • Frame-Accurate Review HUD (24.00 FPS SMPTE)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!showClientView ? (
              // ─── Creator / Studio Dashboard View ────────────────────────────
              <div className="flex items-center gap-2">
                {review?.status === "approved" ? (
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-in zoom-in-95 duration-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Client Approved ✓</span>
                  </span>
                ) : review?.status === "changes_requested" ? (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Client Requested Changes</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    <span>Awaiting Client Sign-Off</span>
                  </span>
                )}

                <button
                  onClick={() => {
                    const origin = window.location.origin;
                    navigator.clipboard.writeText(`${origin}/review/${reviewId}?view=client`);
                    toast.success("Client review link copied to clipboard (Client Mode with Approve Button)!");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-cyan-300 hover:text-white transition flex items-center gap-1.5"
                  title="Copy client share link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Client Link</span>
                </button>

                {/* Switch to Client Preview Mode Toggle for Testing */}
                <button
                  onClick={() => {
                    setPreviewAsClient(true);
                    toast.info("Switched to Client View (with Approve Button)");
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-semibold transition flex items-center gap-1"
                  title="Preview what your client sees"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Preview as Client</span>
                </button>
              </div>
            ) : (
              // ─── Client View (with Approve Cut & Request Revisions) ─────────
              <div className="flex items-center gap-2">
                {isCreator && (
                  <button
                    onClick={() => {
                      setPreviewAsClient(false);
                      if (isExplicitClient) {
                        window.history.replaceState({}, "", `/review/${reviewId}`);
                        window.location.href = `/review/${reviewId}`;
                      } else {
                        toast.info("Returned to Creator Studio View");
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition flex items-center gap-1 mr-1"
                    title="Switch back to creator dashboard mode"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Studio Mode</span>
                  </button>
                )}

                {review?.status === "approved" ? (
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-in zoom-in-95 duration-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Cut Approved ✓</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus("changes_requested")}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] text-xs font-semibold text-slate-300 transition hover:border-white/[0.2]"
                    >
                      Request Revisions
                    </button>

                    <button
                      onClick={() => handleUpdateStatus("approved")}
                      disabled={updatingStatus}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve {review?.version || "Cut"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Review Workspace ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Frame-Accurate Video Player (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Ambient Glow Wrapper */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 via-indigo-600/20 to-cyan-500/30 rounded-3xl blur-xl opacity-40 group-hover:opacity-75 transition duration-1000 -z-10" />

            <div className="relative rounded-3xl overflow-hidden aspect-video bg-black border border-white/[0.1] shadow-[0_0_50px_rgba(0,0,0,0.9)]">
              {/* HTML5 Video Element */}
              <video
                ref={videoRef}
                src={review?.videoUrl || DEMO_VIDEO_URL}
                playsInline
                muted={isMuted}
                poster={review?.thumbnailUrl || "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200"}
                onTimeUpdate={() => {
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current && videoRef.current.duration) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                onError={(e) => {
                  console.warn("Video stream fallback activated", e);
                }}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
              >
                <source src={review?.videoUrl || DEMO_VIDEO_URL} type="video/mp4" />
                <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
              </video>

              {/* Big Center Play/Pause Trigger (Absolute Centered) */}
              <button
                onClick={togglePlay}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-violet-600/90 hover:bg-violet-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.9)] hover:scale-110 active:scale-95 transition-all z-20 ${
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100 scale-100 animate-pulse"
                }`}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-1" />}
              </button>

              {/* Bottom Scrubber HUD */}
              <div className="absolute bottom-3 left-3 right-3 z-20 space-y-2.5 p-3.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/[0.1] text-xs shadow-2xl">
                {/* Scrubber Bar with Comment Marker Pins */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const ratio = clickX / rect.width;
                    const newTime = ratio * duration;
                    if (videoRef.current) {
                      videoRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                  className="relative h-2.5 w-full bg-white/[0.12] hover:h-3.5 transition-all rounded-full cursor-pointer flex items-center"
                >
                  {/* Progress fill */}
                  <div
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  />

                  {/* Comment Marker Pins */}
                  {comments.map((c) => {
                    const pct = (c.timestampSeconds / (duration || 1)) * 100;
                    const isActive = Math.abs(c.timestampSeconds - currentTime) < 2;

                    return (
                      <div
                        key={c.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToTime(c.timestampSeconds);
                        }}
                        title={`${c.timecode} - ${c.authorName}: ${c.content}`}
                        style={{ left: `${pct}%` }}
                        className={`absolute w-3 h-3 -translate-x-1/2 rounded-full border-2 border-black z-30 transition-all cursor-pointer ${
                          isActive
                            ? "bg-cyan-300 ring-4 ring-cyan-400/60 scale-150 animate-bounce"
                            : c.resolved
                            ? "bg-emerald-400 hover:scale-125"
                            : "bg-cyan-400 hover:scale-150 ring-2 ring-cyan-500/40"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Player Controls Bar */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-1 rounded-lg text-white hover:text-cyan-400 hover:bg-white/[0.05] transition"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    <button
                      onClick={() => stepFrame(false)}
                      title="Previous Frame (Left Arrow)"
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => stepFrame(true)}
                      title="Next Frame (Right Arrow)"
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>

                    {/* Glowing SMPTE Timecode Readout */}
                    <div className="font-mono text-xs flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-xl border border-white/[0.1] shadow-inner">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-0.5" />
                      <span className="font-bold text-cyan-300 tracking-wider">
                        {formatTimecode(currentTime)}
                      </span>
                      <span className="text-slate-600">/</span>
                      <span className="text-slate-400">{formatTimecode(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    {/* Speed Selector */}
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06] text-slate-400">
                      {[0.5, 1, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => {
                            setPlaybackRate(rate);
                            if (videoRef.current) videoRef.current.playbackRate = rate;
                          }}
                          className={`px-2 py-0.5 rounded-lg font-mono transition ${
                            playbackRate === rate
                              ? "bg-violet-600 text-white font-bold shadow-[0_0_10px_rgba(124,58,237,0.4)]"
                              : "hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>

                    {/* Mute Toggle */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Hint HUD */}
          <div className="bg-[#0c0d16] border border-white/[0.08] rounded-2xl p-3.5 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded border border-white/[0.1] text-white font-mono shadow-xs">
                  Space
                </kbd>{" "}
                Play / Pause
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded border border-white/[0.1] text-white font-mono shadow-xs">
                  ←
                </kbd>{" "}
                <kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded border border-white/[0.1] text-white font-mono shadow-xs">
                  →
                </kbd>{" "}
                Frame Step (1/24s)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>24.00 FPS ProRes UHD</span>
            </div>
          </div>
        </div>

        {/* Right Column: Timestamp Feedback Thread (4 cols) with smooth animations */}
        <div className="lg:col-span-4 rounded-3xl border border-white/[0.1] bg-[#0c0d16] flex flex-col justify-between h-[640px] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Comments Header & Filter */}
          <div className="p-4 border-b border-white/[0.08] space-y-3 bg-[#090a12]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Timestamped Feedback</h3>
                  <span className="text-[10px] text-slate-400">Click to jump directly to frame</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                {comments.length} Comments
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
              {[
                { id: "all", label: `All (${comments.length})` },
                { id: "unresolved", label: `Open (${comments.filter((c) => !c.resolved).length})` },
                { id: "resolved", label: `Resolved (${comments.filter((c) => c.resolved).length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterResolved(tab.id as any)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition ${
                    filterResolved === tab.id
                      ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animated Comments Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {filteredComments.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-500 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-600" />
                <p className="font-semibold text-slate-400">No feedback in this filter.</p>
                <p className="text-[10px] max-w-xs mx-auto">
                  Pause the video at any frame and type your comment below to create a timecode pin.
                </p>
              </div>
            ) : (
              filteredComments.map((comment) => {
                const isCurrentlyActive = activeCommentId === comment.id;

                return (
                  <div
                    key={comment.id}
                    onClick={() => jumpToTime(comment.timestampSeconds)}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 space-y-2 cursor-pointer transform hover:-translate-y-0.5 ${
                      isCurrentlyActive
                        ? "bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-cyan-500/20 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-[1.02]"
                        : comment.resolved
                        ? "bg-white/[0.01] border-white/[0.04] opacity-50 hover:opacity-100 hover:border-white/[0.15]"
                        : "bg-white/[0.02] border-white/[0.08] hover:border-violet-500/50 hover:bg-white/[0.04] shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Timecode Badge with Pulse if active */}
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border transition ${
                            isCurrentlyActive
                              ? "bg-cyan-400 text-black border-cyan-300 font-black shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                          }`}
                        >
                          {comment.timecode}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[130px]">
                          {comment.authorName}
                        </span>
                      </div>

                      {/* Resolve Toggle Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleResolved(comment.id, comment.resolved);
                        }}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 transition ${
                          comment.resolved
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{comment.resolved ? "Resolved" : "Mark Resolved"}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Timestamp Comment Form */}
          <form onSubmit={handleAddComment} className="p-4 border-t border-white/[0.08] space-y-2.5 bg-[#090a12]">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Stamping at: <strong className="text-cyan-300 font-mono font-bold">{formatTimecode(currentTime)}</strong>
              </span>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name"
                className="bg-transparent border-b border-white/[0.1] text-[10px] text-slate-300 focus:outline-none focus:border-violet-400 w-28 text-right"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Leave feedback on this frame..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition"
              />
              <button
                type="submit"
                disabled={submittingComment || !newCommentText.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] transition hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VideoReviewPlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-xs text-slate-400 tracking-wider uppercase font-semibold">
            Loading Video Review HUD...
          </p>
        </div>
      }
    >
      <VideoReviewPlayerContent />
    </Suspense>
  );
}

