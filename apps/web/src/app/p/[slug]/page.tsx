"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Film,
  Star,
  MapPin,
  Calendar,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  ExternalLink,
  Instagram,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Layers,
  Clock,
  DollarSign,
  MessageCircle,
  Share2,
  ChevronRight,
  Eye,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

type ShowroomData = {
  organization: {
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    bio?: string;
    location?: string;
    currency?: string;
    instagram?: string;
    whatsapp?: string;
    email?: string;
    heroShowreelUrl?: string;
    heroPosterUrl?: string;
    stats?: {
      shootsCompleted: number;
      awardsCount: number;
      clientRating: number;
      experienceYears: number;
    };
  };
  services: {
    id: string;
    name: string;
    description: string | null;
    basePrice: string;
    durationHours: number | null;
    currency?: string;
    addOns: { name: string; price: number }[] | null;
  }[];
  galleries: {
    id: string;
    title: string;
    slug: string;
    coverPhoto: string | null;
    category?: string;
    photoCount?: number;
  }[];
  videoReviews: {
    id: string;
    title: string;
    version: string;
    videoUrl: string;
    thumbnailUrl: string | null;
    durationSeconds: number | null;
  }[];
  testimonials: {
    id: string;
    authorName: string;
    authorRole: string;
    authorAvatar?: string;
    rating: number;
    quote: string;
    date: string;
    eventType: string;
  }[];
};

export default function PublicShowroomPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [data, setData] = useState<ShowroomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Video Reel state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/public/showroom/${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => {
        console.error("Failed to load showroom:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const org = data?.organization;
  const services = data?.services || [];
  const galleries = data?.galleries || [];
  const testimonials = data?.testimonials || [];

  const currencySymbol = org?.currency === "USD" ? "$" : "₦";

  // Share profile
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: org?.name || "Studio Showroom",
          text: `Check out ${org?.name || "this studio"}'s portfolio and book shoots directly on Crea8or.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Showroom link copied to clipboard!");
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-xs text-slate-400 tracking-wider uppercase font-semibold">
          Loading Creator Showroom...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-white selection:bg-violet-500 font-sans pb-28">
      {/* ─── Top Studio Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#07080d]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#0c0d17] rounded-[15px] flex items-center justify-center">
                <Camera className="w-4 h-4 text-violet-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">
                  {org?.name || "Apex Visuals Cinema Studio"}
                </span>
                <span title="Verified Creator">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {org?.location || "Lagos, Nigeria • London, UK"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5"
              title="Share portfolio"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <Link
              href={`/b/${slug || "demo"}`}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Shoot</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Cinematic Showreel & Studio Brand Identity ────────────────────── */}
      <section className="relative pt-8 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="space-y-8">
          {/* Studio Brand Intro */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>{org?.tagline || "4K Cinematic Commercials, Luxury Weddings & Editorial Lookbooks"}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Crafting Unforgettable Visual Stories
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {org?.bio ||
                "Award-winning creative production studio based in Lagos & London. Specializing in high-end 4K cinematography, anamorphic lens optics, commercial campaign lookbooks, and luxury wedding films across Africa and the diaspora."}
            </p>

            {/* Quick Contact & Socials */}
            <div className="flex items-center justify-center gap-4 pt-2 text-xs text-slate-400">
              {org?.instagram && (
                <a
                  href={`https://instagram.com/${org.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-pink-400 transition"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@{org.instagram.replace("@", "")}</span>
                </a>
              )}
              {org?.whatsapp && (
                <a
                  href={`https://wa.me/${org.whatsapp.replace(/[^0-9]/g, "")}?text=Hi!%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20inquire%20about%20a%20shoot.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-400 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Chat</span>
                </a>
              )}
              <div className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{org?.location || "Lagos • London"}</span>
              </div>
            </div>
          </div>

          {/* Hero Cinematic Video Player Showcase */}
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black aspect-video max-h-[520px] w-full">
            <video
              src={org?.heroShowreelUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
              poster={org?.heroPosterUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600"}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  4K SHOWREEL REEL
                </span>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition"
                  title={isMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    2026 Master Production Showreel
                  </h3>
                  <p className="text-xs text-slate-300">
                    Cinema optics, anamorphic flares, 10-bit color science & sound design.
                  </p>
                </div>

                <Link
                  href={`/b/${slug || "demo"}`}
                  className="px-5 py-2.5 rounded-2xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition flex items-center gap-2 self-start sm:self-auto shadow-xl"
                >
                  <span>Check Availability</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Studio Verified Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0c0d17] p-4 rounded-2xl border border-white/[0.08] text-center">
              <div className="text-xl font-extrabold text-white font-mono">140+</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Shoots Delivered</div>
            </div>
            <div className="bg-[#0c0d17] p-4 rounded-2xl border border-white/[0.08] text-center">
              <div className="text-xl font-extrabold text-amber-300 font-mono flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.98</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">5-Star Client Rating</div>
            </div>
            <div className="bg-[#0c0d17] p-4 rounded-2xl border border-white/[0.08] text-center">
              <div className="text-xl font-extrabold text-cyan-400 font-mono">4K 10-Bit</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Cinema Master Files</div>
            </div>
            <div className="bg-[#0c0d17] p-4 rounded-2xl border border-white/[0.08] text-center">
              <div className="text-xl font-extrabold text-emerald-400 font-mono">&lt; 5 Days</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Fast Turnaround</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Curated 4K Photo & Video Showcase ─────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">
              Featured Portfolio
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Curated Client Deliverables
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["all", "Wedding", "Commercial", "Music Video", "Portraits"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === cat
                    ? "bg-white text-black font-bold"
                    : "bg-[#0c0d17] text-slate-400 hover:text-white border border-white/[0.08]"
                }`}
              >
                {cat === "all" ? "All Works" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry / Grid Deliverables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleries
            .filter((g) => activeCategory === "all" || (g.category && g.category === activeCategory))
            .map((gal) => (
              <Link
                key={gal.id}
                href={`/g/${gal.slug}`}
                className="group relative bg-[#0c0d17] rounded-3xl border border-white/[0.08] overflow-hidden hover:border-violet-500/40 transition flex flex-col justify-between"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-black/40 relative">
                  <img
                    src={gal.coverPhoto || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"}
                    alt={gal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white flex items-center gap-1">
                    <Camera className="w-3 h-3 text-cyan-400" />
                    <span>4K Gallery</span>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition line-clamp-1">
                    {gal.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{gal.category || "Editorial"}</span>
                    <span className="text-violet-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* ─── Service Packages & Instant Booking ─────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <div>
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            Transparent Pricing
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Studio Service Packages
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a tailored creative package or customize with shoot add-ons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((serv, index) => {
            const isFeatured = index === 0;
            return (
              <div
                key={serv.id}
                className={`bg-[#0c0d17] rounded-3xl p-6 border flex flex-col justify-between transition relative ${
                  isFeatured
                    ? "border-violet-500/50 shadow-[0_0_40px_rgba(124,58,237,0.15)] ring-1 ring-violet-500/20"
                    : "border-white/[0.08] hover:border-white/[0.15]"
                }`}
              >
                {isFeatured && (
                  <span className="absolute -top-3 left-6 text-[10px] font-bold px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{serv.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                      {serv.description || "Full coverage with master grade, lighting, and frame review sign-off."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-white font-mono">
                        {currencySymbol}{Number(serv.basePrice).toLocaleString()}
                      </span>
                    </div>
                    {serv.durationHours && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>Up to {serv.durationHours} Hours Production</span>
                      </span>
                    )}
                  </div>

                  {serv.addOns && serv.addOns.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Available Add-Ons:
                      </span>
                      {serv.addOns.map((add, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-[11px] truncate max-w-[170px]">{add.name}</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            +{currencySymbol}{Number(add.price).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-4 border-t border-white/[0.06]">
                  <Link
                    href={`/b/${slug || "demo"}?service=${serv.id}`}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 ${
                      isFeatured
                        ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08]"
                    }`}
                  >
                    <span>Book Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Client Testimonials & Social Proof ─────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <div>
          <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Social Proof
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            What Clients Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#0c0d17] p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                {t.authorAvatar && (
                  <img
                    src={t.authorAvatar}
                    alt={t.authorName}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                )}
                <div>
                  <div className="text-xs font-bold text-white">{t.authorName}</div>
                  <div className="text-[10px] text-slate-400">{t.authorRole}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Sticky Mobile Bottom Booking Bar ──────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#07080d]/90 backdrop-blur-xl border-t border-white/[0.1] sm:hidden flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {org?.whatsapp && (
            <a
              href={`https://wa.me/${org.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
          <div>
            <div className="text-xs font-bold text-white">{org?.name}</div>
            <div className="text-[10px] text-emerald-400">Available for Bookings</div>
          </div>
        </div>

        <Link
          href={`/b/${slug || "demo"}`}
          className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
        >
          <span>Book Shoot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
