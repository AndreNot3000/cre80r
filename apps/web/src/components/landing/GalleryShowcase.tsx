import { Image, Download, Heart, Share2, Shield, Sparkles } from "lucide-react";

export function GalleryShowcase() {
  return (
    <section id="delivery" className="py-20 border-t border-white/[0.06] relative bg-[#080910]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Mockup */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-2xl border border-pink-500/20 bg-[#0c0d16] p-5 sm:p-6 shadow-[0_20px_50px_rgba(236,72,153,0.1)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Image className="w-4 h-4 text-pink-400" />
                    Client Gallery: Ade & Tolu (420 Photos)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/[0.1] text-[11px] text-slate-200 flex items-center gap-1">
                    <Download className="w-3 h-3 text-pink-400" /> Download Full Zip (4.2 GB)
                  </button>
                </div>
              </div>

              {/* Photo Grid Preview Mockup */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { tag: "Bride & Groom", favs: "38 Favorites" },
                  { tag: "Ceremony & Rings", favs: "54 Favorites" },
                  { tag: "Reception Party", favs: "72 Favorites" },
                ].map((photo, i) => (
                  <div
                    key={i}
                    className="h-36 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-800 border border-white/[0.06] p-3 flex flex-col justify-between relative group overflow-hidden"
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[9px] font-semibold text-slate-300 bg-black/60 px-1.5 py-0.5 rounded">
                        {photo.tag}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
                        <Heart className="w-3 h-3 fill-pink-400" />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium z-10">
                      {photo.favs}
                    </div>
                    <div className="absolute inset-0 bg-pink-500/5 group-hover:bg-pink-500/10 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-pink-400">
              <Image className="w-4 h-4" />
              Branded Client Galleries
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Deliver your photos with high-end luxury aesthetic.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Ditch generic WeTransfer links that expire. Deliver high-speed cloud galleries featuring your studio branding, watermark preview options, client photo selection for album prints, and 1-click downloads.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs">✓</span>
                Client favorite selections for wedding album curation
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs">✓</span>
                Custom watermark overlays with download pin protection
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs">✓</span>
                High-speed CDN delivering zero-lag viewing on mobile & web
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
