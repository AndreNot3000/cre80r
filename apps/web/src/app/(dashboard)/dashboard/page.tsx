"use client";

import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  Users,
  Clock,
  ArrowUpRight,
  Plus,
  CreditCard,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  Film,
  Mail,
  UserCheck,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const displayName = user?.name || "Creator";
  const displayEmail = user?.email || "";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ─── Header & Quick Actions ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Studio Operations Live
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-violet-300">{displayName}</span> 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            {displayEmail ? (
              <>
                <span className="text-slate-300 font-medium">{displayEmail}</span>
                <span>•</span>
              </>
            ) : null}
            <span>Here is what&apos;s happening with your creative business today.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/galleries"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] text-slate-200 px-3.5 py-2 rounded-xl transition"
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            4K Galleries
          </Link>
          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] text-slate-200 px-3.5 py-2 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5 text-violet-400" />
            New Proposal
          </Link>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.4)] transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Invoices & Paystack
          </Link>
        </div>
      </div>

      {/* ─── Metric Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-violet-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Revenue (This Month)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">₦1,450,000</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18% vs last month</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-violet-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Upcoming Shoots</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">4 Shoots</div>
          <div className="text-xs text-slate-400 mt-2">Next: Wedding in Lekki (Sat)</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-violet-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Active Leads</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">7 Inquiries</div>
          <div className="text-xs text-cyan-400 mt-2">3 Quotes pending review</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-violet-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Pending Invoices</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">₦620,000</div>
          <div className="text-xs text-amber-400 mt-2">2 due this week</div>
        </div>
      </div>

      {/* ─── Main Columns: Recent Activity & Quick Timeline ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings / Shoots */}
        <div className="lg:col-span-2 bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-bold text-white">
                Upcoming Production Schedule & Shoots
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Call sheets, crew assignments, and logistics</p>
            </div>
            <Link
              href="/bookings"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
            >
              View Calendar →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Adeola & Tolulope Traditional Wedding",
                type: "Wedding Cinematography & 4K Photo",
                date: "Saturday, 22 Aug • 08:00 AM",
                location: "Landmark Event Centre, VI",
                status: "Confirmed",
                statusClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
              },
              {
                title: "Kolawole Luxury Lookbook Q3 Campaign",
                type: "Fashion / Commercial Film",
                date: "Tuesday, 25 Aug • 11:00 AM",
                location: "Studio 8, Ikeja GRA",
                status: "Deposit Paid (Paystack)",
                statusClass: "bg-violet-500/15 text-violet-300 border-violet-500/30",
              },
              {
                title: "AfroTech Summit Keynote Coverage",
                type: "Multi-cam Live & Highlights",
                date: "Friday, 28 Aug • 09:00 AM",
                location: "Eko Hotels & Suites, Lagos",
                status: "Pending Contract",
                statusClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
              },
            ].map((shoot, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] transition gap-3"
              >
                <div>
                  <h3 className="text-xs font-bold text-white">
                    {shoot.title}
                  </h3>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-1">
                    <span className="text-cyan-300 font-medium">{shoot.type}</span>
                    <span>•</span>
                    <span>{shoot.date}</span>
                    <span>•</span>
                    <span>{shoot.location}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border self-start sm:self-auto ${shoot.statusClass}`}>
                  {shoot.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries & Lead Pipeline Quick View */}
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-bold text-white">New Inquiries</h2>
              <p className="text-xs text-slate-400 mt-0.5">Leads from booking showroom</p>
            </div>
            <Link
              href="/leads"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
            >
              Pipeline →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                name: "Chidinma Nwosu",
                service: "Wedding Photography & 4K Reel",
                budget: "₦850,000",
                time: "2 hours ago",
              },
              {
                name: "Zikora Studios",
                service: "Commercial Video Direction",
                budget: "₦1,200,000",
                time: "5 hours ago",
              },
              {
                name: "Folake Bakare",
                service: "Executive Portrait Session",
                budget: "₦250,000",
                time: "Yesterday",
              },
            ].map((inquiry, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-cyan-500/30 hover:bg-white/[0.04] transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {inquiry.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{inquiry.time}</span>
                </div>
                <div className="text-[11px] text-slate-400">{inquiry.service}</div>
                <div className="text-xs font-semibold text-cyan-300 font-mono">
                  Budget: {inquiry.budget}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
