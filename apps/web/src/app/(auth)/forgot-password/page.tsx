"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { forgotPasswordSchema } from "@crea8or/validators";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

type ForgotForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch("email");

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Password reset instructions dispatched");
    }, 800);
  };

  return (
    <div className="bg-[#0c0d17]/85 backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 max-w-md mx-auto">
      {submitted ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Check your inbox</h2>
            <p className="text-xs text-slate-400 mt-1">
              We have sent a secure password reset link to <span className="font-semibold text-cyan-300">{email}</span>.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block text-xs font-semibold text-violet-400 hover:text-violet-300 underline underline-offset-4 pt-2"
          >
            ← Return to Sign In
          </Link>
        </div>
      ) : (
        <>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold mb-3 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
            <h2 className="text-2xl font-bold text-white tracking-tight">Reset your password</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your registered work email and we will send you a one-time cryptographic reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="creator@studio.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
              />
              {errors.email && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link →"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
