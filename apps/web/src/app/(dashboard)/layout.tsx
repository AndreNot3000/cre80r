"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Calendar,
  Package,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  FolderKanban,
  Sparkles,
  Receipt,
  MessageSquare,
  Image as ImageIcon,
  Menu,
  X,
  ChevronRight,
  Globe,
  ExternalLink,
  Zap,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects Hub", href: "/projects", icon: FolderKanban },
  { name: "4K Galleries", href: "/galleries", icon: ImageIcon },
  { name: "Public Showroom", href: "SHOWROOM", icon: Globe, external: true },
  { name: "Leads & Inquiries", href: "/leads", icon: KanbanSquare },
  { name: "Clients Directory", href: "/clients", icon: Users },
  { name: "Bookings & Calendar", href: "/bookings", icon: Calendar },
  { name: "Client Messages", href: "/messages", icon: MessageSquare },
  { name: "Studio Automations", href: "/automations", icon: Zap },
  { name: "Services & Packages", href: "/services", icon: Package },
  { name: "Quotes & Proposals", href: "/quotes", icon: FileText },
  { name: "Invoices & Payments", href: "/invoices", icon: CreditCard },
  { name: "Expenses & P&L", href: "/expenses", icon: Receipt },
];

const mobileBottomNav = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Leads", href: "/leads", icon: KanbanSquare },
  { name: "Clients", href: "/clients", icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orgSlug, setOrgSlug] = useState<string>("apexvisuals");
  const { data: session } = useSession();
  const user = session?.user;
  const displayName = user?.name || "Creator";
  const displayEmail = user?.email || "creator@studio.com";

  // Fetch real user studio slug
  useEffect(() => {
    fetch("/api/organization")
      .then((res) => res.json())
      .then((data) => {
        if (data?.slug) setOrgSlug(data.slug);
      })
      .catch(() => {});
  }, []);

  // Calculate initials from user's real name
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CR";

  const handleSignOut = async () => {
    document.cookie = "crea8or_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    try {
      await authClient.signOut();
    } catch {}
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-[#07080d] text-white selection:bg-violet-500 font-sans overflow-hidden">
      {/* ─── Desktop Sidebar (md+) ────────────────────────────────────────── */}
      <aside className="w-64 border-r border-white/[0.08] bg-[#0c0d17] flex flex-col justify-between hidden md:flex z-20 shrink-0">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-white/[0.08]">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xs shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:scale-105 transition-transform">
                8
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Crea<span className="text-violet-400">8</span>or
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
            {navigation.map((item) => {
              const Icon = item.icon;
              const targetHref = item.href === "SHOWROOM" ? `/p/${orgSlug}` : item.href;
              const isActive = pathname === targetHref || pathname.startsWith(`${targetHref}/`);
              return (
                <Link
                  key={item.name}
                  href={targetHref}
                  target={item.external ? "_blank" : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-violet-600/15 text-violet-300 font-semibold border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.external && <ExternalLink className="w-3 h-3 text-slate-500" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Real User Profile Pill & Sidebar Footer */}
        <div className="p-3.5 border-t border-white/[0.08] space-y-3 bg-[#090a12]">
          <div className="p-3 bg-gradient-to-br from-violet-950/40 to-indigo-950/30 rounded-2xl border border-violet-500/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI Creative Assistant
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Auto-generate quotes, contracts & shoot timelines in seconds.
            </p>
          </div>

          {/* User Account Bar */}
          <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-2">
            <Link href="/settings" className="flex items-center gap-2.5 min-w-0 flex-1 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.3)] group-hover:scale-105 transition-transform">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate group-hover:text-violet-300 transition">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {displayEmail}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-0.5 shrink-0">
              <Link
                href="/settings"
                title="Settings"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Slide-over Drawer Backdrop & Panel (< md) ──────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-[280px] bg-[#0c0d17] border-r border-white/[0.1] shadow-2xl flex flex-col justify-between z-50">
            <div>
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.08]">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xs shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                    8
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white">
                    Crea<span className="text-violet-400">8</span>or
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const targetHref = item.href === "SHOWROOM" ? `/p/${orgSlug}` : item.href;
                  const isActive = pathname === targetHref || pathname.startsWith(`${targetHref}/`);
                  return (
                    <Link
                      key={item.name}
                      href={targetHref}
                      target={item.external ? "_blank" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? "bg-violet-600/15 text-violet-300 font-semibold border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.external && <ExternalLink className="w-3 h-3 text-slate-500" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="p-3 border-t border-white/[0.08] bg-[#090a12] space-y-2">
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 min-w-0 flex-1"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{displayEmail}</p>
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#07080d] relative">
        {/* Ambient Top Radial Glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0c0d17]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
          {/* Left: Mobile Hamburger + Badges */}
          <div className="flex items-center gap-3">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 md:hidden flex items-center justify-center transition"
            >
              <Menu className="w-4 h-4" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-bold text-white text-[10px]">
                8
              </div>
              <span className="text-base font-bold text-white">
                Crea<span className="text-violet-400">8</span>or
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 flex items-center gap-1.5">
                <span>🇳🇬</span> Africa/Lagos
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                Studio OS v2.0
              </span>
            </div>
          </div>

          {/* Right: Booking preview & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/p/${orgSlug}`}
              target="_blank"
              className="text-xs border border-violet-500/30 bg-violet-600/10 hover:bg-violet-600/20 px-3 py-1.5 rounded-xl text-violet-300 hover:text-white font-semibold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
              title="Open your public studio portfolio & booking portal"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public Showroom ↗</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] transition group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shadow-[0_0_12px_rgba(124,58,237,0.4)]">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-semibold text-white group-hover:text-violet-300 transition leading-tight">
                  {displayName}
                </span>
                <span className="block text-[10px] text-cyan-400 font-mono leading-tight">
                  Pro Studio
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8 z-10">
          {children}
        </main>

        {/* ─── Mobile Bottom Nav Bar (< md) ─────────────────────────────────── */}
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-[#0c0d17]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 z-40 flex items-center justify-around">
          {mobileBottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
                  isActive ? "text-violet-300 font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-slate-400 hover:text-white transition"
          >
            <Menu className="w-4 h-4 text-slate-400" />
            <span className="text-[10px]">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
