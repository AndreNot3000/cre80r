"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid work email address");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      // Attempt Better Auth sign in
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.error) {
        toast.error(result.error.message || "Invalid email or password");
        return;
      }

      toast.success("Welcome back! Loading your studio workspace...");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Sign in error:", err);
      toast.error(err?.message || "Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: unknown) {
      toast.error("Google sign in failed. Please try again.");
    }
  };

  return (
    <div className="bg-[#0c0d17]/85 backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-3">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Studio Workspace Sign In
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
        <p className="text-xs text-slate-400 mt-1">
          Access your bookings, 4K galleries, call sheets, and financial margins.
        </p>
      </div>

      {/* Google 1-Click Login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-slate-200 transition shadow-sm hover:border-white/[0.15]"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-[#0c0d17] px-3 text-slate-500 font-semibold tracking-wider">
            Or with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Work Email Address
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="creator@studio.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-cyan-400 hover:text-cyan-300 transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 font-mono transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-slate-400 hover:text-white" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In to Studio OS →"
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-xs text-slate-400 pt-2">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4">
          Create one free
        </Link>
      </p>
    </div>
  );
}
