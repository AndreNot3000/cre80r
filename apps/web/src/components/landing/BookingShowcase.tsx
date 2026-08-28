import { Calendar, Clock, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

export function BookingShowcase() {
  return (
    <section className="py-20 border-t border-white/[0.06] relative bg-[#090a12]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Mockup */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0b0d17] p-5 sm:p-6 shadow-[0_20px_50px_rgba(6,182,212,0.1)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Public Booking Flow: crea8or.app/andre
                </div>
                <span className="text-[10px] bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                  Live Page
                </span>
              </div>

              {/* Package selector preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-violet-500/40 bg-violet-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Full-Day Wedding Cinema</span>
                    <span className="text-xs font-extrabold text-violet-300">₦1,850,000</span>
                  </div>
                  <p className="text-[11px] text-slate-400">10 Hours • 2 Cinematographers • 4K Drone • Teaser Reel</p>
                </div>

                <div className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Commercial Brand Campaign</span>
                    <span className="text-xs font-extrabold text-slate-300">₦2,500,000</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Full Studio Crew • Lighting • Color Grade • Social Cuts</p>
                </div>
              </div>

              {/* Add-on pills */}
              <div className="pt-2 border-t border-white/[0.04] space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Selected Add-ons</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    Express 48-Hour Delivery (+₦200,000)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    Second Camera Operator (+₦150,000)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <Calendar className="w-4 h-4" />
              Automated Bookings & Calendar
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Let clients book and pay deposits 24/7 without back-and-forth emails.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Showcase your custom packages, calculate travel fees automatically, lock in dates on your calendar, and instantly request Paystack deposits upon booking.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">✓</span>
                Custom booking URL (`crea8or.app/yourname`) for your bio link
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">✓</span>
                Automatic buffer times between multi-day shoots
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">✓</span>
                Google Calendar & Apple Calendar bidirectional synchronization
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
