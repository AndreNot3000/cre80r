"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Phone,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Sun,
  Navigation,
  CheckCircle2,
  Printer,
  Share2,
  Loader2,
  Film,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

export default function PublicCallSheetPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/public/callsheet/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Call sheet not found");
        return res.json();
      })
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || "Failed to load call sheet");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const text = `🎬 *Official Shoot Call Sheet*\n📍 *Location:* ${data?.callSheet?.locationName}\n⏰ *Call Time:* ${data?.callSheet?.generalCallTime}\n\nView live schedule & GPS navigation:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05060b] text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading production call sheet...</p>
      </div>
    );
  }

  if (error || !data?.callSheet) {
    return (
      <div className="min-h-screen bg-[#05060b] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#0c0d17] border border-white/[0.08] p-8 rounded-3xl max-w-md text-center space-y-3">
          <Film className="w-10 h-10 text-slate-500 mx-auto" />
          <h1 className="text-lg font-bold">Call Sheet Not Found</h1>
          <p className="text-xs text-slate-400">
            This shoot call sheet is either still being drafted by production or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  const { callSheet, project } = data;
  const shootDateFormatted = new Date(callSheet.shootDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#05060b] text-white print:bg-white print:text-black">
      {/* Top Banner (Screen Only) */}
      <header className="border-b border-white/[0.08] bg-[#0c0d17]/80 backdrop-blur-md sticky top-0 z-30 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-tight text-white">
              CREA<span className="text-cyan-400">8</span>OR
            </span>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full font-semibold">
              Live On-Set HUD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Crew</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Call Sheet Document */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 print:p-0 print:space-y-4">
        {/* Title Header */}
        <div className="bg-[#0c0d17] print:bg-transparent rounded-3xl border border-white/[0.08] print:border-b-2 print:border-black print:rounded-none p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 print:text-black block mb-1">
                Official Production Call Sheet
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white print:text-black tracking-tight">
                {callSheet.title}
              </h1>
              {project?.name && (
                <p className="text-xs text-slate-400 print:text-slate-700 mt-1">
                  Project: <span className="font-semibold text-slate-200 print:text-black">{project.name}</span>
                </p>
              )}
            </div>

            <div className="sm:text-right bg-white/[0.02] print:bg-transparent p-3 rounded-2xl border border-white/[0.04] print:border-none">
              <span className="text-[10px] uppercase font-bold text-slate-500 print:text-slate-700 block">General Crew Call</span>
              <div className="text-2xl font-black text-cyan-400 print:text-black font-mono mt-0.5">
                {callSheet.generalCallTime}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.08] print:border-black text-xs">
            <div className="flex items-center gap-2 text-slate-300 print:text-black">
              <Calendar className="w-4 h-4 text-cyan-400 print:text-black shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 print:text-slate-700 block">Shoot Date</span>
                <span className="font-semibold">{shootDateFormatted}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300 print:text-black">
              <Sun className="w-4 h-4 text-amber-400 print:text-black shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 print:text-slate-700 block">Weather Forecast</span>
                <span className="font-semibold">{callSheet.weatherForecast || "Sunny / Clear Skies"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300 print:text-black">
              <ShieldAlert className="w-4 h-4 text-rose-400 print:text-black shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 print:text-slate-700 block">Nearest Hospital</span>
                <span className="font-semibold">{callSheet.nearestHospital || "Evercare Hospital Lekki"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location & GPS Navigation Card */}
        <div className="bg-[#0c0d17] print:bg-transparent rounded-3xl border border-white/[0.08] print:border print:border-black p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white print:text-black flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400 print:text-black" />
              Location & Set Navigation
            </h2>
            {callSheet.locationMapsUrl && (
              <a
                href={callSheet.locationMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 print:hidden"
              >
                <Navigation className="w-3.5 h-3.5" />
                Open GPS Map
              </a>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] print:bg-transparent border border-white/[0.04] print:border-none space-y-1.5 text-xs">
            <div className="font-bold text-white print:text-black text-sm">{callSheet.locationName}</div>
            {callSheet.locationAddress && (
              <div className="text-slate-400 print:text-black">{callSheet.locationAddress}</div>
            )}
            {callSheet.parkingNotes && (
              <div className="text-amber-300 print:text-slate-800 pt-1 text-[11px]">
                🚗 <strong>Parking / Arrival Notes:</strong> {callSheet.parkingNotes}
              </div>
            )}
          </div>
        </div>

        {/* Shooting Schedule Timeline */}
        {Array.isArray(callSheet.schedule) && callSheet.schedule.length > 0 && (
          <div className="bg-[#0c0d17] print:bg-transparent rounded-3xl border border-white/[0.08] print:border print:border-black p-6 space-y-4">
            <h2 className="text-sm font-bold text-white print:text-black flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400 print:text-black" />
              Day Shoot Timeline & Schedule
            </h2>

            <div className="space-y-2 text-xs">
              {callSheet.schedule.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white/[0.02] print:bg-transparent border border-white/[0.04] print:border-b print:border-slate-300 flex items-start gap-4"
                >
                  <span className="font-mono font-bold text-cyan-300 print:text-black whitespace-nowrap w-20 shrink-0">
                    {item.time}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-white print:text-black">{item.scene}</div>
                    {item.notes && (
                      <div className="text-[11px] text-slate-400 print:text-slate-700 mt-0.5">{item.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crew Department Call Times */}
        {Array.isArray(callSheet.crew) && callSheet.crew.length > 0 && (
          <div className="bg-[#0c0d17] print:bg-transparent rounded-3xl border border-white/[0.08] print:border print:border-black p-6 space-y-4">
            <h2 className="text-sm font-bold text-white print:text-black flex items-center gap-1.5">
              <Users className="w-4 h-4 text-violet-400 print:text-black" />
              Crew Call Times & Department Contacts
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {callSheet.crew.map((member: any, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white/[0.02] print:bg-transparent border border-white/[0.04] print:border print:border-slate-300 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-white print:text-black">{member.name}</div>
                    <div className="text-[11px] text-cyan-400 print:text-slate-700">{member.role}</div>
                    {member.phone && (
                      <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono mt-0.5">
                        {member.phone}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Call Time</span>
                    <span className="font-mono font-bold text-amber-300 print:text-black text-sm">
                      {member.callTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment & Gear Checklist */}
        {Array.isArray(callSheet.gearList) && callSheet.gearList.length > 0 && (
          <div className="bg-[#0c0d17] print:bg-transparent rounded-3xl border border-white/[0.08] print:border print:border-black p-6 space-y-4">
            <h2 className="text-sm font-bold text-white print:text-black flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-400 print:text-black" />
              Equipment & Technical Gear Manifest
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {callSheet.gearList.map((gear: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/[0.02] print:bg-transparent border border-white/[0.04] print:border-b print:border-slate-200 flex items-center justify-between"
                >
                  <span className="text-slate-300 print:text-black font-medium">{gear.item}</span>
                  <span className="text-[10px] font-mono text-cyan-300 print:text-slate-700 bg-white/[0.04] px-2 py-0.5 rounded-md">
                    {gear.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contacts & Notes */}
        <div className="bg-[#0c0d17] print:bg-transparent rounded-3xl border border-white/[0.08] print:border print:border-black p-6 space-y-3 text-xs">
          <h2 className="text-sm font-bold text-white print:text-black flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 print:text-black" />
            Safety Protocol & Emergency Contacts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-rose-500/10 print:bg-transparent border border-rose-500/20 print:border print:border-slate-300">
              <span className="text-[10px] uppercase font-bold text-rose-400 print:text-black block">Nearest Hospital</span>
              <span className="font-semibold text-white print:text-black">
                {callSheet.nearestHospital || "Evercare Hospital Lekki"}
              </span>
            </div>

            {Array.isArray(callSheet.emergencyContacts) && callSheet.emergencyContacts.length > 0 && (
              <div className="p-3 rounded-xl bg-white/[0.02] print:bg-transparent border border-white/[0.04] print:border print:border-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-500 print:text-black block">On-Set Lead Producer</span>
                <span className="font-semibold text-white print:text-black">
                  {callSheet.emergencyContacts[0]?.name} ({callSheet.emergencyContacts[0]?.phone})
                </span>
              </div>
            )}
          </div>

          {callSheet.notes && (
            <div className="p-3 rounded-xl bg-white/[0.02] print:bg-transparent border border-white/[0.04] text-slate-400 print:text-black text-[11px] leading-relaxed">
              <strong>General Production Notes:</strong> {callSheet.notes}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
