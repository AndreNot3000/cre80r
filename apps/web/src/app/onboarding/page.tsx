"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Sparkles, ArrowRight, CheckCircle2, DollarSign, Globe, Building2, User } from "lucide-react";
import { toast } from "sonner";

type OnboardingFormData = {
  businessName: string;
  slug: string;
  currency: "NGN" | "GHS" | "KES" | "ZAR" | "USD" | "GBP";
  city: string;
  country: string;
  phone: string;
  instagram: string;
  primaryService: string;
  startingRate: number;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    defaultValues: {
      currency: "NGN",
      country: "Nigeria",
      city: "Lagos",
      startingRate: 350000,
    },
  });

  const businessName = watch("businessName");
  const slug = watch("slug");
  const currency = watch("currency");

  const handleNext = async () => {
    if (step === 1) {
      const valid = await trigger(["businessName", "slug", "city", "country"]);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await trigger(["primaryService", "startingRate", "currency"]);
      if (valid) setStep(3);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setLoading(true);
    try {
      // In production, sends to /api/organizations setup endpoint
      toast.success("Workspace configured successfully! Welcome to Crea8or.");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error("Failed to complete setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-white flex items-center justify-center p-4 selection:bg-violet-500">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/10 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-xl">
        {/* Top Logo & Stepper */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#0c0d15] rounded-[11px] flex items-center justify-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">
                8
              </div>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Crea<span className="text-violet-400">8</span>or
            </span>
          </div>

          <p className="text-xs text-slate-400">Step {step} of 3 • Setting up your creative business</p>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto pt-2">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-white/[0.1]"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-white/[0.1]"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step === 3 ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-white/[0.1]"}`} />
          </div>
        </div>

        {/* Form Container */}
        <div className="rounded-3xl border border-white/[0.1] bg-[#0d0e19] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* STEP 1: STUDIO / CREATOR IDENTITY */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Your Business & Public Handle</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    This will appear on your public booking page, quotes, and client invoices.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Business or Studio Name
                    </label>
                    <input
                      {...register("businessName", { required: "Business name is required" })}
                      placeholder="e.g. Apex Visuals Studio"
                      onChange={(e) => {
                        register("businessName").onChange(e);
                        const autoSlug = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                          .replace(/^-|-$/g, "");
                        setValue("slug", autoSlug);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    {errors.businessName && (
                      <p className="text-rose-400 text-xs mt-1">{errors.businessName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Custom Public URL
                    </label>
                    <div className="flex items-center rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-400">
                      <span>crea8or.app/b/</span>
                      <input
                        {...register("slug", { required: "Public handle is required" })}
                        placeholder="yourname"
                        className="bg-transparent text-white focus:outline-none flex-1 pl-1 font-mono text-xs"
                      />
                    </div>
                    {errors.slug && (
                      <p className="text-rose-400 text-xs mt-1">{errors.slug.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                      <input
                        {...register("city")}
                        placeholder="Lagos / Nairobi"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Country</label>
                      <input
                        {...register("country")}
                        placeholder="Nigeria / Kenya"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition mt-6"
                >
                  Continue to Services →
                </button>
              </div>
            )}

            {/* STEP 2: PRICING & SERVICES */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Default Currency & Packages</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Set up your primary service and local billing currency.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Billing Currency
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["NGN", "GHS", "KES", "ZAR", "USD", "GBP"] as const).map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setValue("currency", curr)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                            currency === curr
                              ? "bg-violet-600 border-violet-500 text-white"
                              : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:text-white"
                          }`}
                        >
                          {curr === "NGN" ? "₦ NGN" : curr === "USD" ? "$ USD" : curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Primary Service Name
                    </label>
                    <input
                      {...register("primaryService", { required: "Service name is required" })}
                      placeholder="e.g. Full Day Wedding Photography"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Base Package Price ({currency})
                    </label>
                    <input
                      type="number"
                      {...register("startingRate", { valueAsNumber: true })}
                      placeholder="350000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-xl border border-white/[0.1] text-xs font-semibold text-slate-300 hover:bg-white/[0.05]"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
                  >
                    Continue to Launch →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRMATION & LAUNCH */}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                  <Sparkles className="w-7 h-7" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">Your Workspace is Ready!</h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    We have generated your custom booking page, client directory, and Paystack invoicing pipelines.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Business:</span>
                    <span className="font-semibold text-white">{businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking URL:</span>
                    <span className="font-mono text-cyan-300">crea8or.app/b/{slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Currency:</span>
                    <span className="font-semibold text-emerald-400">{currency}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 font-bold text-white text-sm shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:scale-[1.01] transition disabled:opacity-50"
                >
                  {loading ? "Launching Workspace..." : "Enter Creator Dashboard 🚀"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
