"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  CheckCircle2,
  Lock,
  QrCode,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type SessionDevice = {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
};

const initialSessions: SessionDevice[] = [
  {
    id: "sess-1",
    device: "MacBook Pro 16-inch (M3 Max)",
    browser: "Google Chrome 127.0",
    location: "Lagos, Nigeria",
    ip: "102.89.44.12",
    lastActive: "Active Now",
    current: true,
  },
  {
    id: "sess-2",
    device: "iPhone 15 Pro Max",
    browser: "Mobile Safari 17.5",
    location: "Lagos, Nigeria",
    ip: "105.112.98.54",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "sess-3",
    device: "iPad Pro 12.9-inch",
    browser: "Mobile Safari 17.4",
    location: "London, United Kingdom",
    ip: "86.142.110.4",
    lastActive: "3 days ago",
    current: false,
  },
];

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<SessionDevice[]>(initialSessions);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPass, setUpdatingPass] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const revokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    toast.success("Device session revoked successfully");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setUpdatingPass(true);
    setTimeout(() => {
      setUpdatingPass(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Security credentials updated! All other sessions require new sign in.");
    }, 800);
  };

  const handleEnable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) {
      toast.error("Enter the 6-digit code from your authenticator app");
      return;
    }
    setTwoFactorEnabled(true);
    setShowQrModal(false);
    setTotpCode("");
    toast.success("Two-factor authentication is now active on your workspace!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to General Settings
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Security & Authentication</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your password credentials, 2-factor authentication, and active logged-in device sessions.
        </p>
      </div>

      {/* 1. TWO-FACTOR AUTHENTICATION */}
      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</h2>
              <p className="text-xs text-slate-400">
                Protect your creator account with an extra security layer using TOTP Authenticator apps.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              twoFactorEnabled
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-white/[0.04] text-slate-400 border-white/[0.08]"
            }`}
          >
            {twoFactorEnabled ? "Active & Protected ✓" : "Disabled"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            When enabled, signing into your Crea8or workspace will require your password plus a 6-digit verification code generated by Google Authenticator, 1Password, or Authy.
          </p>

          <button
            onClick={() => {
              if (twoFactorEnabled) {
                setTwoFactorEnabled(false);
                toast.info("Two-factor authentication disabled");
              } else {
                setShowQrModal(true);
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              twoFactorEnabled
                ? "border border-white/[0.1] text-slate-300 hover:bg-white/[0.05]"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            }`}
          >
            {twoFactorEnabled ? "Disable 2FA" : "Set Up 2FA Authenticator"}
          </button>
        </div>
      </div>

      {/* 2FA QR Code Setup Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.1] p-6 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
              <h2 className="text-base font-bold text-white">Configure Authenticator App</h2>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="text-center space-y-3 py-2">
              <div className="w-40 h-40 bg-white/[0.03] border-2 border-dashed border-white/[0.15] rounded-2xl mx-auto flex flex-col items-center justify-center text-slate-400 p-2">
                <QrCode className="w-16 h-16 text-cyan-400" />
                <span className="text-[10px] text-slate-400 font-mono mt-2">Scan with Authenticator</span>
              </div>

              <div className="text-xs text-slate-400">
                Or enter secret manually: <br />
                <span className="font-mono font-bold text-violet-300 text-xs">JBSWY3DPEHPK3PXP</span>
              </div>
            </div>

            <form onSubmit={handleEnable2FA} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter 6-digit code from app
                </label>
                <input
                  required
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="123456"
                  className="w-full text-center font-mono font-bold text-lg px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                >
                  Verify & Activate 2FA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CHANGE PASSWORD */}
      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Change Password</h2>
            <p className="text-xs text-slate-400">
              Ensure your password has at least 8 characters with numbers and uppercase symbols.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={updatingPass}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] transition disabled:opacity-50"
          >
            {updatingPass ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* 3. ACTIVE DEVICE SESSIONS */}
      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Active Device Sessions</h2>
              <p className="text-xs text-slate-400">
                You are currently logged into {sessions.length} devices across your workspace.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSessions(sessions.filter((s) => s.current));
              toast.success("All other sessions terminated");
            }}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
          >
            Log Out All Other Devices
          </button>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {sessions.map((sess) => (
            <div key={sess.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-300 flex items-center justify-center">
                  {sess.device.includes("iPhone") || sess.device.includes("iPad") ? (
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Laptop className="w-4 h-4 text-violet-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{sess.device}</span>
                    {sess.current && (
                      <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Current Device
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {sess.browser} • {sess.location} • <span className="font-mono text-slate-500">{sess.ip}</span>
                  </div>
                </div>
              </div>

              {!sess.current && (
                <button
                  onClick={() => revokeSession(sess.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold p-1 transition"
                >
                  Revoke Session
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
