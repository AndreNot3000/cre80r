import { Video, MessageSquare, CheckCircle, Clock, Play, RotateCcw } from "lucide-react";

export function VideoReviewShowcase() {
  return (
    <section className="py-20 border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
              <Video className="w-4 h-4" />
              Frame-Accurate Video Review
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Cancel your Frame.io subscription. Video review is built-in.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Upload your video cuts directly to the client project. Clients click anywhere on the playback timeline to leave frame-accurate revision requests, resolve comments, and provide official approval.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">✓</span>
                Exact timestamp notes (e.g., 01:42 &quot;Cut this transition 0.5s faster&quot;)
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">✓</span>
                Side-by-side version comparison (Cut V1 vs Cut V2)
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">✓</span>
                Official client approval trigger with automatic final invoice generation
              </li>
            </ul>
          </div>

          {/* Right Visual Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-indigo-500/30 bg-[#0c0e18] p-5 sm:p-6 shadow-[0_20px_50px_rgba(99,102,241,0.15)] space-y-4">
              {/* Video Player Frame Mockup */}
              <div className="h-52 sm:h-64 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border border-white/[0.08] relative flex items-center justify-center overflow-hidden">
                <div className="w-14 h-14 rounded-full bg-indigo-600/80 text-white flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.6)] cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-black/60 px-3 py-1.5 rounded-lg">
                  <span>02:14 / 04:30 (4K UHD)</span>
                  <span className="text-emerald-400 font-bold">Cut V2 Approved</span>
                </div>
              </div>

              {/* Timestamp Comments Thread */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Client Timestamp Feedback
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
                      01:18
                    </span>
                    <span className="text-slate-300">
                      &quot;Increase audio volume on groom&apos;s vow exchange slightly.&quot;
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Resolved ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
