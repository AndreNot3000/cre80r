"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ShieldCheck, ArrowRight, KeyRound, Sparkles, Loader2 } from "lucide-react";

export default function TwoFactorChallengePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      toast.error("Please enter your verification code");
      return;
    }

    setLoading(true);
    try {
      if (useBackupCode) {
        const res = await authClient.twoFactor.verifyBackupCode({
          code: cleanCode,
        });
        if (res?.error) {
          toast.error(res.error.message || "Invalid backup recovery code");
          return;
        }
      } else {
        if (cleanCode.length !== 6) {
          toast.error("Please enter a valid 6-digit authentication code");
          return;
        }
        const res = await authClient.twoFactor.verifyTotp({
          code: cleanCode,
        });
        if (res?.error) {
          toast.error(res.error.message || "Invalid 6-digit authenticator code");
          return;
        }
      }

      toast.success("Two-factor authentication verified! Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("2FA verify error:", err);
      toast.error(err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0c0d17]/85 backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(124,58,237,0.3)]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Two-Factor Challenge</h2>
          <p className="text-xs text-slate-400 mt-1">
            Open your Authenticator app (Google Authenticator, 1Password, Authy) and enter your 6-digit security code.
          </p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
            {useBackupCode ? "Emergency Backup Code (8 characters)" : "6-Digit Authenticator Code"}
          </label>
          <input
            required
            maxLength={useBackupCode ? 12 : 6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={useBackupCode ? "abc12345" : "123456"}
            className="w-full text-center tracking-[0.3em] text-2xl font-mono px-3.5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 font-bold transition uppercase"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Verifying Code...
            </>
          ) : (
            "Authenticate & Access Studio →"
          )}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setCode("");
            }}
            className="text-[11px] text-violet-400 hover:text-violet-300 underline underline-offset-4 transition"
          >
            {useBackupCode
              ? "Use 6-digit Authenticator App code instead"
              : "Lost authenticator? Use an emergency backup code"}
          </button>
        </div>
      </form>
    </div>
  );
}
