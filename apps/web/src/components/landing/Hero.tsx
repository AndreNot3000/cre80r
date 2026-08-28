"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Calendar,
  DollarSign,
  Video,
  ShieldCheck,
  Zap,
  TrendingUp,
  Image as ImageIcon,
  FileText,
  Sliders,
  Maximize2,
  Clock,
  Camera,
  Layers,
  Heart,
  Download,
} from "lucide-react";

export function Hero() {
  const [activeTab, setActiveTab] = useState<"video" | "gallery" | "callsheet" | "invoice">("video");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden">
      {/* ─── Ambient Subtle Studio Glows ────────────────────────────────────── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-gradient-to-tr from-violet-600/15 via-indigo-600/10 to-cyan-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Subtle Studio Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Hero Headline & Value Prop ───────────────────────────────────── */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-200 tracking-wide">
              The Creative Business Operating System
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
              v2.0
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] sm:leading-[1.08]">
            Run your creative business. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300">
              Create more. Manage less.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Replace the chaos of 7 disconnected tools. Client CRM, calendar bookings,
            shoot timelines, frame-accurate video review, 4K galleries, and Paystack
            invoicing — unified into one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              href="/register"
              className="w-full sm:w-auto relative group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm sm:text-base font-semibold text-white overflow-hidden shadow-[0_0_35px_rgba(124,58,237,0.5)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(124,58,237,0.8)] hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/b/demo"
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm sm:text-base font-medium text-slate-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] backdrop-blur-md transition-all duration-300"
            >
              <Play className="w-4 h-4 text-violet-400 fill-violet-400/20" />
              Explore Live Booking Demo
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Native Paystack & Stripe support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Free forever on Starter plan</span>
            </div>
          </div>
        </div>

        {/* ─── Interactive Creative Studio Workspace Canvas ─────────────────── */}
        <div className="mt-16 sm:mt-20 relative max-w-5xl mx-auto">
          {/* Outer Studio Chassis */}
          <div className="rounded-3xl border border-white/[0.12] bg-[#0c0d16]/95 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Top Workspace Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#080910]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-xs font-mono text-slate-400 pl-2 border-l border-white/[0.08]">
                  Kolawole Luxury Brand Campaign Q3 • Project Hub
                </span>
              </div>

              {/* Interactive Mode Tabs */}
              <div className="flex items-center gap-1 bg-[#121422] p-1 rounded-xl border border-white/[0.06] self-start sm:self-auto overflow-x-auto">
                <button
                  onClick={() => setActiveTab("video")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === "video"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Review</span>
                </button>
                <button
                  onClick={() => setActiveTab("gallery")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === "gallery"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>4K Gallery</span>
                </button>
                <button
                  onClick={() => setActiveTab("callsheet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === "callsheet"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Call Sheet</span>
                </button>
                <button
                  onClick={() => setActiveTab("invoice")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === "invoice"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
              </div>
            </div>

            {/* Canvas Body by Tab */}
            <div className="p-4 sm:p-6 bg-[#0a0b12] min-h-[380px] sm:min-h-[420px] flex flex-col justify-between">
              {/* TAB 1: FRAME-ACCURATE VIDEO REVIEW */}
              {activeTab === "video" && (
                <div className="space-y-4">
                  {/* Video Monitor Frame */}
                  <div className="relative rounded-2xl bg-gradient-to-b from-[#111322] to-[#080911] border border-white/[0.08] p-4 sm:p-6 overflow-hidden">
                    {/* Header Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Commercial_Cut_V2_4K.mov</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          ProRes 422 HQ • 24fps
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="text-emerald-400 font-bold">01:42:18</span> / 03:30:00
                      </div>
                    </div>

                    {/* Visual Waveform & Timeline Track */}
                    <div className="space-y-3">
                      {/* Audio Waveform Bars Simulation */}
                      <div className="h-16 rounded-xl bg-black/40 border border-white/[0.04] p-3 flex items-center justify-between gap-1 overflow-hidden relative">
                        {Array.from({ length: 48 }).map((_, i) => {
                          const height = [40, 65, 85, 30, 90, 50, 75, 95, 35, 60, 80, 45][i % 12];
                          const isActive = i <= 24;
                          return (
                            <div
                              key={i}
                              style={{ height: `${height}%` }}
                              className={`w-1 rounded-full transition-all ${
                                isActive ? "bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" : "bg-white/[0.1]"
                              }`}
                            />
                          );
                        })}
                        {/* Playhead marker */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)]" />
                      </div>

                      {/* Scrubber Timeline with Comment Pins */}
                      <div className="relative pt-1">
                        <div className="h-1.5 w-full bg-white/[0.1] rounded-full overflow-hidden">
                          <div className="h-full w-1/2 bg-gradient-to-r from-violet-600 to-cyan-400" />
                        </div>
                      </div>
                    </div>

                    {/* Client Timestamp Feedback Thread */}
                    <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          01:42
                        </span>
                        <span className="text-slate-300 font-medium">
                          &ldquo;Color grade on this scene looks incredible. Ready to sign off!&rdquo;
                        </span>
                        <span className="text-[11px] text-slate-500">• Kolawole (Client)</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Approved ✓
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 4K CLIENT GALLERY & EXIF */}
              {activeTab === "gallery" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <div className="text-xs font-bold text-white">Client Delivery • 4K High-Res Gallery</div>
                      <div className="text-[11px] text-slate-400">384 Selected Photos • Full Copyright License</div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-semibold flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      Download 4K ZIP (4.8 GB)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { title: "Lookbook Hero Editorial", exif: "Sony α7 IV • 85mm f/1.4 GM • ISO 100", favs: "42 Client Favorites" },
                      { title: "Runway Runway Golden Hour", exif: "Sony FX3 • 24-70mm f/2.8 • ISO 160", favs: "38 Client Favorites" },
                      { title: "Accessories Macro Shot", exif: "Sony α1 • 90mm Macro f/2.8 • ISO 80", favs: "29 Client Favorites" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3 hover:border-pink-500/30 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded">
                            RAW + 4K JPEG
                          </span>
                          <Heart className="w-4 h-4 text-pink-400 fill-pink-400/30" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{item.title}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.exif}</div>
                        </div>
                        <div className="pt-2 border-t border-white/[0.04] text-[10px] font-medium text-pink-300">
                          {item.favs}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CALL SHEET & TIMELINE */}
              {activeTab === "callsheet" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <div className="text-xs font-bold text-white">Production Call Sheet • Day 1 of 2</div>
                      <div className="text-[11px] text-slate-400">Studio 8, Ikeja GRA • Crew Call: 07:30 AM</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Weather: Clear 29°C (Sunset 18:42)
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-violet-300">08:00 AM</span>
                        <div>
                          <div className="font-semibold text-white">Lighting Grid & Camera Rig Prep</div>
                          <div className="text-[10px] text-slate-400">Aputure 600d + 85mm Prime Rig • Lead DP (Emeka)</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold">Done ✓</span>
                    </div>

                    <div className="p-3 rounded-xl bg-violet-950/25 border border-violet-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-cyan-300">11:30 AM</span>
                        <div>
                          <div className="font-semibold text-white">Scene 1: High-Fashion Studio Runway Track</div>
                          <div className="text-[10px] text-slate-400">Ronin Gimbal Tracking Shot • 4K 60fps Slow Motion</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-bold animate-pulse">Live Now</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-500">04:30 PM</span>
                        <div>
                          <div className="font-semibold text-slate-300">Scene 2: Rooftop Golden Hour Campaign</div>
                          <div className="text-[10px] text-slate-500">DJI Inspire 3 Drone Establishing Shot • 85mm Portrait</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">Scheduled</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PAYSTACK SMART INVOICE */}
              {activeTab === "invoice" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <div className="text-xs font-bold text-white">Invoice #INV-802912 • Kolawole Luxury Wear</div>
                      <div className="text-[11px] text-slate-400">Commercial Production Retainer Q3</div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Paid via Paystack ✓
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] flex items-center justify-between">
                      <span className="text-slate-300">2-Day Commercial Film Direction & Crew (4K ProRes)</span>
                      <span className="font-semibold text-white">₦2,500,000</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] flex items-center justify-between">
                      <span className="text-slate-300">High-End Color Grading & Sound Design Suite</span>
                      <span className="font-semibold text-white">₦450,000</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] flex items-center justify-between">
                      <span className="text-slate-300">Express 48-Hour Social Media Cuts (5 Reels)</span>
                      <span className="font-semibold text-white">₦250,000</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">Total Project Value (100% Settled)</div>
                      <div className="text-lg font-extrabold text-white">₦3,200,000</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-400 font-medium">Bank Payout Confirmed</div>
                      <div className="text-xs font-mono text-slate-400">Ref: PSTK_9812490218</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Canvas Footer Status */}
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All 8 Modules Active
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>Direct Bank Payouts in ₦ NGN, GHS, KES, USD</span>
                </div>
                <div className="text-[11px] font-mono text-violet-300">
                  Switch tabs above to preview modules ↗
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
