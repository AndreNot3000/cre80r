"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Plus, CheckCircle2, ChevronLeft, ChevronRight, User, Sparkles } from "lucide-react";

type BookingItem = {
  id: string;
  client: string;
  event: string;
  date: string;
  time: string;
  location: string;
  amount: string;
  status: "confirmed" | "deposit_paid" | "pending";
};

const demoBookings: BookingItem[] = [
  {
    id: "bk-1",
    client: "Ade & Tolu Wedding",
    event: "Luxury Wedding Cinema & Drone Coverage",
    date: "Saturday, 22 Aug 2026",
    time: "08:00 AM - 10:00 PM",
    location: "Landmark Event Centre, VI, Lagos",
    amount: "₦2,400,000",
    status: "deposit_paid",
  },
  {
    id: "bk-2",
    client: "Kolawole Luxury Wear",
    event: "Commercial Lookbook Shoot & 4K Video",
    date: "Tuesday, 25 Aug 2026",
    time: "10:00 AM - 06:00 PM",
    location: "Studio 8, Ikeja GRA, Lagos",
    amount: "₦1,500,000",
    status: "confirmed",
  },
  {
    id: "bk-3",
    client: "Zikora Film Collective",
    event: "Music Video Production",
    date: "Friday, 28 Aug 2026",
    time: "02:00 PM - 09:00 PM",
    location: "Eko Atlantic, Lagos",
    amount: "₦1,200,000",
    status: "pending",
  },
];

export default function BookingsPage() {
  const [bookings] = useState<BookingItem[]>(demoBookings);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bookings & Production Calendar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your shoot schedule, blocked dates, and upcoming client productions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl font-semibold transition shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <Plus className="w-3.5 h-3.5" />
            Add Manual Booking
          </button>
        </div>
      </div>

      {/* Mini Calendar / Month Bar */}
      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-4 flex items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-bold text-white">August 2026</span>
          <span className="text-xs text-slate-400 font-mono">• 3 Confirmed Productions</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.06] text-slate-400 hover:text-white transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.06] text-slate-400 hover:text-white transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bookings List Cards */}
      <div className="space-y-3">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-violet-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{b.client}</span>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    b.status === "confirmed"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : b.status === "deposit_paid"
                      ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {b.status === "confirmed" ? "Confirmed" : b.status === "deposit_paid" ? "Deposit Paid" : "Pending Approval"}
                </span>
              </div>

              <div className="text-xs text-cyan-300 font-medium">{b.event}</div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1.5 font-mono">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{b.date}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{b.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{b.location}</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:self-center self-start flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
              <div className="text-base font-extrabold text-white font-mono">{b.amount}</div>
              <button className="text-xs text-violet-400 hover:text-violet-300 font-semibold mt-1">
                View Call Sheet →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
