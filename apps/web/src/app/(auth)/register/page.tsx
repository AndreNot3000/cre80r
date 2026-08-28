"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerSchema } from "@crea8or/validators";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";
import { Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";

const CREATOR_TYPES = [
  { value: "photographer", label: "📷 Photographer", desc: "Portraits, Fashion, Events, Weddings" },
  { value: "videographer", label: "🎬 Videographer & Filmmaker", desc: "Commercials, 4K Films, Music Videos" },
  { value: "wedding_specialist", label: "💍 Wedding Specialist", desc: "Cinematography, Photo & Planning" },
  { value: "agency", label: "🏢 Creative Studio & Agency", desc: "Multi-crew, Full Production Agency" },
  { value: "content_creator", label: "✍️ Digital Content Creator", desc: "Reels, YouTube, Brand Deals" },
] as const;

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      creatorType: "photographer",
    },
  });

  const selectedType = watch("creatorType");
  const password = watch("password") || "";

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

  const goToStep2 = async () => {
    const valid = await trigger(["name", "email", "password"]);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        name: data.name.trim(),
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to create account. Please check your credentials.");
        return;
      }

      toast.success("Account created! Let's configure your studio workspace.");
      router.push("/onboarding");
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
      });
    } catch (err: unknown) {
      toast.error("Google sign up failed. Please try again.");
    }
  };

  return (
    <div className="bg-[#0c0d17]/85 backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
      {step === 1 ? (
        <>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-3">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Creator Workspace Onboarding
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
            <p className="text-xs text-slate-400 mt-1">
              Start running your creative business like a real venture-backed production studio.
            </p>
          </div>

          {/* Google 1-Click Signup */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-slate-200 transition shadow-sm hover:border-white/[0.15]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign up with Google
          </button>

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

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                {...register("name")}
                placeholder="Emeka Obi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
              />
              {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email Address</label>
              <input
                {...register("email")}
                type="email"
                placeholder="emeka@apexvisuals.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
              />
              {errors.email && <p className="text-rose-400 text-[11px] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
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
              {errors.password && <p className="text-rose-400 text-[11px] mt-1">{errors.password.message}</p>}

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1 h-1">
                    <div className={`flex-1 rounded-full ${strengthScore >= 1 ? "bg-rose-500" : "bg-white/[0.1]"}`} />
                    <div className={`flex-1 rounded-full ${strengthScore >= 2 ? "bg-amber-500" : "bg-white/[0.1]"}`} />
                    <div className={`flex-1 rounded-full ${strengthScore >= 3 ? "bg-cyan-500" : "bg-white/[0.1]"}`} />
                    <div className={`flex-1 rounded-full ${strengthScore >= 4 ? "bg-emerald-500" : "bg-white/[0.1]"}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1">
                    <span className={hasMinLength ? "text-cyan-400 font-semibold" : ""}>
                      {hasMinLength ? "✓" : "○"} 8+ characters
                    </span>
                    <span className={hasUpper ? "text-cyan-400 font-semibold" : ""}>
                      {hasUpper ? "✓" : "○"} 1 uppercase letter
                    </span>
                    <span className={hasLower ? "text-cyan-400 font-semibold" : ""}>
                      {hasLower ? "✓" : "○"} 1 lowercase letter
                    </span>
                    <span className={hasNumber ? "text-cyan-400 font-semibold" : ""}>
                      {hasNumber ? "✓" : "○"} 1 number
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={goToStep2}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center justify-center gap-1.5"
            >
              Continue to Discipline →
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-white font-semibold transition"
            >
              ← Back
            </button>
            <span className="text-[11px] text-slate-500 font-mono">Step 2 of 2</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">What is your primary craft?</h2>
            <p className="text-xs text-slate-400 mt-1">We will optimize your dashboard, call sheets & quotes for your discipline.</p>
          </div>

          <div className="space-y-2.5">
            {CREATOR_TYPES.map((type) => {
              const isSelected = selectedType === type.value;
              return (
                <div
                  key={type.value}
                  onClick={() => setValue("creatorType", type.value)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? "border-violet-500 bg-violet-600/10 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{type.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{type.desc}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                      isSelected ? "bg-violet-600 border-violet-600 text-white font-bold" : "border-white/[0.2]"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? "Creating Workspace..." : "Complete Signup & Launch 🚀"}
          </button>
        </form>
      )}
    </div>
  );
}
