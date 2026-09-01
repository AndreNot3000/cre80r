"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordSchema } from "@crea8or/validators";
import { z } from "zod";
import { ShieldCheck, CheckCircle2, Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";

type ResetForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  const password = watch("password") || "";
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

  const onSubmit = async (data: ResetForm) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password updated successfully! Please sign in with your new credentials.");
      router.push("/login");
    }, 900);
  };

  return (
    <div className="bg-[#0c0d17]/85 backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 max-w-md mx-auto">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-3">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Credential Security Update
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Set new password</h2>
        <p className="text-xs text-slate-400 mt-1">
          Choose a strong, unique password to safeguard your studio client data.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} value={token} />

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            New Password
          </label>
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
          {errors.password && (
            <p className="text-rose-400 text-[11px] mt-1">{errors.password.message}</p>
          )}

          {/* Strength Bar */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1 h-1">
                <div className={`flex-1 rounded-full ${strengthScore >= 1 ? "bg-rose-500" : "bg-white/[0.1]"}`} />
                <div className={`flex-1 rounded-full ${strengthScore >= 2 ? "bg-amber-500" : "bg-white/[0.1]"}`} />
                <div className={`flex-1 rounded-full ${strengthScore >= 3 ? "bg-cyan-500" : "bg-white/[0.1]"}`} />
                <div className={`flex-1 rounded-full ${strengthScore >= 4 ? "bg-emerald-500" : "bg-white/[0.1]"}`} />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? "Updating Password..." : "Update Password & Sign In"}
        </button>

        {!token && (
          <p className="text-[11px] text-rose-400 text-center">
            Missing or invalid reset token. Please request a new link from the forgot password page.
          </p>
        )}
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
