import { FolderKanban, CheckSquare, Clock, MapPin, Users, Film } from "lucide-react";

export function ProjectShowcase() {
  return (
    <section id="workflows" className="py-20 border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-400">
              <FolderKanban className="w-4 h-4" />
              Production & Shoot Planning
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Execute flawless shoot days with smart call sheets & shot lists.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Never forget a vital lens or miss a golden-hour shot. Build interactive production timelines, assign crew tasks to second shooters, and keep client briefs in your pocket.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs">✓</span>
                Interactive Shot List & Call Sheet mobile generator
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs">✓</span>
                Dedicated wedding questionnaire with couple preferences & family lists
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs">✓</span>
                Crew permissions: Photographer, Drone Operator, Editor & Assistant roles
              </li>
            </ul>
          </div>

          {/* Right Visual Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/[0.1] bg-[#0c0d16] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-violet-400" />
                  Production Hub: Ade & Tolu Wedding (Day-of Timeline)
                </div>
                <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded border border-violet-500/30">
                  Live Call Sheet
                </span>
              </div>

              {/* Timeline Items */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-cyan-300">08:00 AM</span>
                    <div>
                      <div className="text-xs font-semibold text-white">Bridal Prep & Detail Shots</div>
                      <div className="text-[10px] text-slate-400">Dress, rings, stationery • Lead Photographer (Emeka)</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">Completed</span>
                </div>

                <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-violet-300">01:30 PM</span>
                    <div>
                      <div className="text-xs font-semibold text-white">Church Ceremony & Vow Exchange</div>
                      <div className="text-[10px] text-slate-400">Audio recorder on Pastor • 4K Drone establishing shots</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded animate-pulse">In Progress</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400">05:30 PM</span>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Couples Sunset Golden Hour Portraits</div>
                      <div className="text-[10px] text-slate-400">Balcony location • 85mm f/1.4 Lens + Softbox</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
