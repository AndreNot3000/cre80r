"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  Building2,
  CreditCard,
  Bell,
  Globe,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  Fingerprint,
  ExternalLink,
  Instagram,
  Phone,
  Film,
  MapPin,
  Loader2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  // Studio Organization States
  const [businessName, setBusinessName] = useState("Apex Visuals Cinema Studio");
  const [handle, setHandle] = useState("apexvisuals");
  const [tagline, setTagline] = useState("4K Cinematic Commercials, Luxury Weddings & Editorial Lookbooks");
  const [bio, setBio] = useState("Award-winning creative production studio based in Lagos & London. Specializing in high-end 4K cinematography, commercial lookbooks, and luxury wedding films.");
  const [location, setLocation] = useState("Victoria Island, Lagos, Nigeria • London, UK");
  const [currency, setCurrency] = useState("NGN");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [instagram, setInstagram] = useState("apexvisuals.ng");
  const [whatsapp, setWhatsapp] = useState("+2348030001122");
  const [heroShowreelUrl, setHeroShowreelUrl] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
  const [heroPosterUrl, setHeroPosterUrl] = useState("https://images.unsplash.com/photo-1519741497674-611481863552?w=1600");
  const [paystackKey, setPaystackKey] = useState("pk_test_9812490218abcdef");
  const [autoWhatsApp, setAutoWhatsApp] = useState(true);
  const [autoEmail, setAutoEmail] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing organization profile
  useEffect(() => {
    fetch("/api/organization")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          if (data.name) setBusinessName(data.name);
          if (data.slug) setHandle(data.slug);
          if (data.tagline) setTagline(data.tagline);
          if (data.bio) setBio(data.bio);
          if (data.location) setLocation(data.location);
          if (data.currency) setCurrency(data.currency);
          if (data.timezone) setTimezone(data.timezone);
          if (data.instagram) setInstagram(data.instagram);
          if (data.whatsapp) setWhatsapp(data.whatsapp);
          if (data.heroShowreelUrl) setHeroShowreelUrl(data.heroShowreelUrl);
          if (data.heroPosterUrl) setHeroPosterUrl(data.heroPosterUrl);
          if (data.paystackPublicKey) setPaystackKey(data.paystackPublicKey);
        }
      })
      .catch((err) => {
        console.error("Failed to load organization:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: businessName.trim(),
        slug: handle.toLowerCase().trim().replace(/[^a-z0-9-]/g, ""),
        tagline: tagline.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        currency: currency as any,
        timezone: timezone,
        instagram: instagram.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        heroShowreelUrl: heroShowreelUrl.trim() || undefined,
        heroPosterUrl: heroPosterUrl.trim() || undefined,
        paystackPublicKey: paystackKey.trim() || undefined,
      };

      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update studio profile");
      }

      toast.success("Studio branding & public showroom updated successfully!");
    } catch (err: any) {
      console.error("Save settings error:", err);
      toast.error(err?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const copyShowroomLink = () => {
    const url = `${window.location.origin}/p/${handle}`;
    navigator.clipboard.writeText(url);
    toast.success("Public showroom link copied to clipboard!");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CR";

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading Studio Preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ─── Header & Top Actions ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Settings & Studio Branding
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize your public portfolio showroom, currency, Paystack gateway, and contact identity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/p/${handle}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600/10 border border-violet-500/30 hover:bg-violet-600/20 text-violet-300 hover:text-white text-xs font-semibold shadow-xs transition"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Live Showroom ↗</span>
          </Link>
        </div>
      </div>

      {/* ─── Settings Sub-Navigation Tabs ──────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.15)] shrink-0"
        >
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Studio Branding & Profile</span>
        </Link>
        <Link
          href="/settings/security"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent transition shrink-0"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Security & 2FA</span>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Account & Identity Overview */}
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Creator Account & Identity</h2>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Authenticated Session
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-[0_0_20px_rgba(124,58,237,0.3)] shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">
                  {user?.name || "Creator"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  Creator Pro
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {user?.email || "creator@studio.com"}
                </span>
                {user?.id && (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                    <Fingerprint className="w-3 h-3 text-slate-600" />
                    ID: {user.id.slice(0, 12)}...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-slate-300">Account Security & Two-Factor Authentication</span>
            </div>
            <Link
              href="/settings/security"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 underline underline-offset-4 flex items-center gap-1 transition"
            >
              Configure 2FA & Password →
            </Link>
          </div>
        </div>

        {/* 2. Public Studio Profile & Showroom Branding */}
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Public Studio Branding & Showroom Profile</h2>
                <p className="text-xs text-slate-400">Controls what clients see when visiting your public portfolio link.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={copyShowroomLink}
              className="text-xs font-semibold text-violet-300 hover:text-white flex items-center gap-1 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Studio / Business Name <span className="text-rose-400">*</span>
              </label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Visuals Cinema Studio"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Public URL Handle (Slug) <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-white/[0.08] px-3.5 py-2.5 text-xs text-slate-500 bg-white/[0.03]">
                <span>/p/</span>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="apexvisuals"
                  required
                  className="bg-transparent text-cyan-400 font-mono font-semibold focus:outline-none flex-1 pl-1"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Studio Tagline / Headline
            </label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. 4K Cinematic Commercials, Luxury Weddings & Editorial Lookbooks"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Studio Bio / Creative Story
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your studio's creative vision, camera gear, and experience..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Operating Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lagos, Nigeria • London, UK"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Direct Chat
              </label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+234 803 000 1122"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                Instagram Handle
              </label>
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@apexvisuals.ng"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          {/* Hero Showreel Video URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-violet-400" />
                Hero Showreel Video URL (.mp4 / WebM / CDN)
              </label>
              <input
                value={heroShowreelUrl}
                onChange={(e) => setHeroShowreelUrl(e.target.value)}
                placeholder="https://commondatastorage.googleapis.com/.../reel.mp4"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Video Poster / Cover Photo URL
              </label>
              <input
                value={heroPosterUrl}
                onChange={(e) => setHeroPosterUrl(e.target.value)}
                placeholder="https://images.unsplash.com/.../cover.jpg"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* 3. Currency & Regional Localization */}
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Regional Currency & Operating Timezone</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Studio Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-500/40 bg-[#151624] text-white"
              >
                <option value="NGN">₦ Nigerian Naira (NGN)</option>
                <option value="GHS">GH₵ Ghanaian Cedi (GHS)</option>
                <option value="KES">KSh Kenyan Shilling (KES)</option>
                <option value="ZAR">R South African Rand (ZAR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="GBP">£ British Pound (GBP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Operating Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-500/40 bg-[#151624] text-white"
              >
                <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                <option value="Africa/Accra">Africa/Accra (GMT+0)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Payment Gateway Configuration (Paystack) */}
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Paystack Gateway Configuration</h2>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Active Connection
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Paystack Public Key
            </label>
            <input
              type="text"
              value={paystackKey}
              onChange={(e) => setPaystackKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Enables clients to pay deposit commitments via Debit Card, Bank Transfer, Apple Pay, and USSD.
            </p>
          </div>
        </div>

        {/* 5. Automated Notifications */}
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <Bell className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-white">Automated Client Notifications</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoWhatsApp}
                onChange={(e) => setAutoWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500"
              />
              <div>
                <div className="text-xs font-semibold text-white">
                  Automated WhatsApp Booking Confirmations & Reminders
                </div>
                <div className="text-[11px] text-slate-400">
                  Sends digital call sheets and payment reminders directly to client WhatsApp numbers.
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoEmail}
                onChange={(e) => setAutoEmail(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500"
              />
              <div>
                <div className="text-xs font-semibold text-white">
                  Resend Transactional Invoices & Contract E-Sign Emails
                </div>
                <div className="text-[11px] text-slate-400">
                  Dispatches branded PDF invoices with instant online payment links.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href={`/p/${handle}`}
            target="_blank"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preview Public Showroom (/p/{handle})</span>
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? "Saving Changes..." : "Save Studio Branding"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
