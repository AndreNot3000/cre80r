import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07080d] text-white selection:bg-violet-500 flex flex-col justify-between p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,58,237,0.22),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Brand Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full pt-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] group-hover:scale-105 transition-transform">
            8
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Crea<span className="text-violet-400">8</span>or
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]"
        >
          ← Back to Homepage
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="relative z-10 w-full max-w-md mx-auto py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-500 pb-4">
        © 2026 Crea8or OS. Enterprise-grade Creative Business Infrastructure.
      </footer>
    </div>
  );
}
