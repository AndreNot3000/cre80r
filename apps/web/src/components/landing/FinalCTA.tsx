import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[350px] bg-gradient-to-r from-violet-600/30 via-indigo-600/20 to-cyan-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-b from-[#121426] via-[#0d0f1c] to-[#090a12] p-8 sm:p-14 text-center shadow-[0_0_80px_rgba(124,58,237,0.25)] space-y-8 relative overflow-hidden">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Join Hundreds of Modern Creators & Studios
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Ready to run your creative business like a real studio?
            </h2>

            <p className="text-slate-400 text-sm sm:text-lg max-w-xl mx-auto">
              Get started in less than 2 minutes. Free forever on the Starter plan. No credit card required.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto relative group inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl text-base font-semibold text-white overflow-hidden shadow-[0_0_35px_rgba(124,58,237,0.6)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(124,58,237,0.9)] hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
              <span className="relative z-10 flex items-center gap-2">
                Create Your Account Free
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-colors"
            >
              Sign In to Existing Workspace
            </Link>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant setup in 2 minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cancel or upgrade anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
