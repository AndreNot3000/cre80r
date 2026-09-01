"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Camera,
  Film,
  Plus,
  Minus,
  Check,
  Loader2,
  DollarSign,
  User,
  Mail,
  Phone,
  Instagram,
  FileText,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Download,
  Copy,
  ExternalLink,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

type PackageItem = {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  durationHours: number | null;
  currency?: string;
  addOns?: { name: string; price: number }[] | null;
};

type ShowroomResponse = {
  organization: {
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    currency?: string;
    location?: string;
    whatsapp?: string;
  };
  services: PackageItem[];
};

type ConfirmedBookingData = {
  reference: string;
  booking: {
    id: string;
    status: string;
    eventDate: string;
    location: string;
    packageName: string;
    totalAmount: number;
    depositAmount: number;
    depositMode: string;
    currency: string;
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    total: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  organization: {
    name: string;
    slug: string;
    whatsapp: string;
  };
};

const DEFAULT_ADD_ONS = [
  { id: "def-add-1", name: "Same-Day Social Media Teaser Reel (Reels/TikTok)", price: 150000, desc: "Delivered within 6 hours of shoot wrap" },
  { id: "def-add-2", name: "4K Cinema Drone Aerial Operator (DJI Inspire/Mavic)", price: 120000, desc: "FAA/CAA licensed pilot + 4K ProRes aerials" },
  { id: "def-add-3", name: "Additional Second DP / Camera Operator", price: 180000, desc: "Ensures dual-angle multi-camera coverage" },
  { id: "def-add-4", name: "Raw Master Footage 1TB SSD Archive Delivery", price: 200000, desc: "Uncompressed B-Roll & raw clips on Samsung T7 SSD" },
  { id: "def-add-5", name: "Behind-The-Scenes 4K Mini-Documentary", price: 175000, desc: "Candid production moments & director commentary" },
];

function BookingPortalContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const initialServiceId = searchParams.get("service");

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showroom, setShowroom] = useState<ShowroomResponse | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wizard State (1: Package, 2: Add-Ons, 3: Client Details, 4: Confirmed / Checkout)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Package & Schedule
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [shootDate, setShootDate] = useState<string>("");
  const [timeOfDay, setTimeOfDay] = useState<string>("full_day");
  const [locationCity, setLocationCity] = useState<string>("");

  // Step 2: Add-Ons & Extra Hours
  const [selectedAddOnNames, setSelectedAddOnNames] = useState<string[]>([]);
  const [extraHours, setExtraHours] = useState<number>(0);
  const extraHourRate = 75000;

  // Step 3: Client Details & Brief
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientInstagram, setClientInstagram] = useState("");
  const [creativeBrief, setCreativeBrief] = useState("");
  const [depositMode, setDepositMode] = useState<"50" | "100">("50");

  // Step 4: Submission & Confirmation
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBookingData | null>(null);
  const [isDepositPaid, setIsDepositPaid] = useState(false);
  const [processingPaystack, setProcessingPaystack] = useState(false);

  // Load Showroom Packages
  useEffect(() => {
    if (!slug) return;

    fetch(`/api/public/showroom/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setShowroom(data);
        if (data.services && data.services.length > 0) {
          if (initialServiceId && data.services.some((s: any) => s.id === initialServiceId)) {
            setSelectedPkgId(initialServiceId);
          } else {
            setSelectedPkgId(data.services[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load booking packages:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, initialServiceId]);

  const org = showroom?.organization;
  const packages = showroom?.services || [];
  const currencySymbol = org?.currency === "USD" ? "$" : "₦";

  const currentPkg = useMemo(() => {
    return packages.find((p) => p.id === selectedPkgId) || packages[0];
  }, [packages, selectedPkgId]);

  // Combine package-defined add-ons with creator defaults
  const availableAddOns = useMemo(() => {
    const list = [...DEFAULT_ADD_ONS];
    if (currentPkg?.addOns && Array.isArray(currentPkg.addOns)) {
      currentPkg.addOns.forEach((a, idx) => {
        if (!list.some((item) => item.name.toLowerCase() === a.name.toLowerCase())) {
          list.unshift({
            id: `pkg-add-${idx}`,
            name: a.name,
            price: Number(a.price),
            desc: "Custom package add-on",
          });
        }
      });
    }
    return list;
  }, [currentPkg]);

  // Pricing Calculations
  const basePrice = Number(currentPkg?.basePrice || 0);
  const addOnsTotal = useMemo(() => {
    return selectedAddOnNames.reduce((sum, name) => {
      const match = availableAddOns.find((a) => a.name === name);
      return sum + (match ? match.price : 0);
    }, 0);
  }, [selectedAddOnNames, availableAddOns]);

  const extraHoursTotal = extraHours * extraHourRate;
  const totalShootAmount = basePrice + addOnsTotal + extraHoursTotal;
  const depositDue = depositMode === "50" ? Math.round(totalShootAmount * 0.5) : totalShootAmount;

  // Toggle Add-on
  const toggleAddOn = (name: string) => {
    setSelectedAddOnNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Step Navigation Validation
  const handleProceedToStep2 = () => {
    if (!selectedPkgId) {
      toast.error("Please select a creative package");
      return;
    }
    if (!shootDate) {
      toast.error("Please select your preferred shoot date");
      return;
    }
    if (!locationCity.trim()) {
      toast.error("Please specify your shoot city or location");
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProceedToStep3 = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Booking to API (Card 7.3)
  const handleConfirmAndCreateBooking = async () => {
    if (!clientName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      toast.error("Please provide a valid email address");
      return;
    }
    if (!clientPhone.trim()) {
      toast.error("Please provide a contact phone number for WhatsApp");
      return;
    }

    setSubmitting(true);
    try {
      const selectedAddOnObjects = selectedAddOnNames.map((name) => {
        const match = availableAddOns.find((a) => a.name === name);
        return { name, price: match?.price || 0 };
      });

      const payload = {
        slug: slug || "apexvisuals",
        serviceId: currentPkg?.id,
        packageName: currentPkg?.name || "Custom Production Package",
        eventDate: shootDate,
        timeOfDay: timeOfDay,
        location: locationCity,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim().toLowerCase(),
        clientPhone: clientPhone.trim(),
        clientInstagram: clientInstagram.trim() || undefined,
        notes: creativeBrief.trim() || undefined,
        selectedAddOns: selectedAddOnObjects,
        extraHours: extraHours,
        totalAmount: totalShootAmount,
        depositAmount: depositDue,
        depositMode: depositMode,
        currency: (org?.currency as any) || "NGN",
      };

      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create booking");
      }

      const result: ConfirmedBookingData = await res.json();
      setConfirmedBooking(result);
      setCurrentStep(4);
      toast.success("Shoot reservation created! Date held on calendar.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Booking error:", err);
      toast.error(err?.message || "Failed to create shoot booking");
    } finally {
      setSubmitting(false);
    }
  };

  // Paystack Deposit Checkout Simulator
  const handlePaystackCheckout = () => {
    setProcessingPaystack(true);
    setTimeout(() => {
      setIsDepositPaid(true);
      setProcessingPaystack(false);
      toast.success("Payment verified! Deposit confirmed via Paystack.");
    }, 1800);
  };

  // Copy reference
  const handleCopyRef = () => {
    if (confirmedBooking) {
      navigator.clipboard.writeText(confirmedBooking.reference);
      toast.success("Booking reference copied!");
    }
  };

  // Add to Google Calendar
  const handleGoogleCalendar = () => {
    if (!shootDate) return;
    const title = encodeURIComponent(`${org?.name || "Studio"} Shoot • ${currentPkg?.name || "Production"}`);
    const details = encodeURIComponent(
      `Official Shoot with ${org?.name}.\nPackage: ${currentPkg?.name}\nLocation: ${locationCity}\nRef: ${confirmedBooking?.reference}`
    );
    const location = encodeURIComponent(locationCity);
    const dateFormatted = shootDate.replace(/-/g, "");
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}/${dateFormatted}&details=${details}&location=${location}`;
    window.open(gCalUrl, "_blank");
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-xs text-slate-400 tracking-wider uppercase font-semibold">
          Loading Booking Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-white selection:bg-violet-500 font-sans pb-32">
      {/* ─── Top Studio Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#07080d]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={`/p/${slug || "apexvisuals"}`}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 text-violet-400" />
            <span>Back to {org?.name || "Studio Showroom"}</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-white">Instant Booking Portal</span>
          </div>
        </div>
      </header>

      {/* ─── Main Booking Container ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Step Indicator Breadcrumb (Steps 1-3) */}
        {currentStep < 4 && (
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/[0.08] -z-0" />

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    currentStep >= 1
                      ? "bg-violet-600 text-white ring-4 ring-violet-500/20 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                      : "bg-[#151624] text-slate-400 border border-white/[0.08]"
                  }`}
                >
                  1
                </div>
                <span className={`text-[11px] font-semibold ${currentStep >= 1 ? "text-white" : "text-slate-500"}`}>
                  Package & Date
                </span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    currentStep >= 2
                      ? "bg-violet-600 text-white ring-4 ring-violet-500/20 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                      : "bg-[#151624] text-slate-400 border border-white/[0.08]"
                  }`}
                >
                  2
                </div>
                <span className={`text-[11px] font-semibold ${currentStep >= 2 ? "text-white" : "text-slate-500"}`}>
                  Customize Add-Ons
                </span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    currentStep === 3
                      ? "bg-violet-600 text-white ring-4 ring-violet-500/20 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                      : "bg-[#151624] text-slate-400 border border-white/[0.08]"
                  }`}
                >
                  3
                </div>
                <span className={`text-[11px] font-semibold ${currentStep === 3 ? "text-white" : "text-slate-500"}`}>
                  Client Details
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Confirmed Booking & Paystack Checkout Screen ──────────── */}
        {currentStep === 4 && confirmedBooking && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Success Header Banner */}
            <div className="bg-gradient-to-b from-emerald-500/10 to-transparent p-8 rounded-3xl border border-emerald-500/30 text-center space-y-3 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {isDepositPaid ? "Shoot Booking Confirmed!" : "Reservation Created & Date Held!"}
                </h1>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                  {isDepositPaid
                    ? `Your date has been officially locked on ${org?.name || "the studio"}'s master production calendar.`
                    : `Settle your commitment deposit below to lock the date on ${org?.name || "the studio"}'s calendar.`}
                </p>
              </div>

              {/* Reference Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151624] border border-white/[0.1] text-xs font-mono">
                <span className="text-slate-400">Booking Ref:</span>
                <span className="text-white font-bold">{confirmedBooking.reference}</span>
                <button
                  onClick={handleCopyRef}
                  className="text-slate-400 hover:text-white transition ml-1"
                  title="Copy Reference"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Paystack Checkout Card */}
            <div className="bg-[#0c0d17] p-6 rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Paystack Secure Commitment Deposit</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Protected by Paystack 256-bit SSL encryption.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Amount Due Now</span>
                  <span className="text-xl font-mono font-extrabold text-emerald-400">
                    {currencySymbol}{confirmedBooking.booking.depositAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Status / Action */}
              {isDepositPaid ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300">
                      Payment Verified • {currencySymbol}{confirmedBooking.booking.depositAmount.toLocaleString()} Received
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Receipt generated & sent to {confirmedBooking.client.email}.
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handlePaystackCheckout}
                  disabled={processingPaystack}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-98 disabled:opacity-50"
                >
                  {processingPaystack ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>
                    {processingPaystack
                      ? "Verifying with Paystack Gateway..."
                      : `Pay ${currencySymbol}${confirmedBooking.booking.depositAmount.toLocaleString()} with Paystack`}
                  </span>
                </button>
              )}
            </div>

            {/* Production Details Card */}
            <div className="bg-[#0c0d17] p-6 rounded-3xl border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-bold text-white">Event & Production Summary</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" /> Event Date
                  </span>
                  <div className="font-bold text-white">
                    {new Date(confirmedBooking.booking.eventDate).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Shoot Location
                  </span>
                  <div className="font-bold text-white truncate">
                    {confirmedBooking.booking.location}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-pink-400" /> Selected Package
                  </span>
                  <div className="font-bold text-white truncate">
                    {confirmedBooking.booking.packageName}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Shoot Value
                  </span>
                  <div className="font-bold text-emerald-300 font-mono">
                    {currencySymbol}{confirmedBooking.booking.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Post-Booking Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleGoogleCalendar}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                <span>Add to Google Cal</span>
              </button>

              <a
                href={`https://wa.me/${(confirmedBooking.organization.whatsapp || "+2348030001122").replace(/[^0-9]/g, "")}?text=Hi!%20I%20just%20reserved%20a%20shoot%20with%20booking%20reference%20${confirmedBooking.reference}.`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>

              <Link
                href={`/i/${confirmedBooking.invoice.id}`}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Invoice</span>
              </Link>
            </div>
          </div>
        )}

        {/* ─── STEPS 1-3: Booking Form Layout ────────────────────────────────── */}
        {currentStep < 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ─── Left Column: Wizard Steps ──────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* ─── STEP 1: Package Selection & Schedule ─────────────────────── */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      1. Select Your Creative Package
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Choose the base package that fits your production scope.
                    </p>
                  </div>

                  {/* Package Cards */}
                  <div className="space-y-3">
                    {packages.map((pkg) => {
                      const isSelected = selectedPkgId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPkgId(pkg.id)}
                          className={`p-5 rounded-3xl border cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isSelected
                              ? "bg-violet-600/15 border-violet-500 ring-1 ring-violet-500/40 shadow-[0_0_30px_rgba(124,58,237,0.2)]"
                              : "bg-[#0c0d17] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                                  isSelected
                                    ? "border-violet-400 bg-violet-600 text-white"
                                    : "border-white/[0.2] bg-white/[0.05]"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <h3 className="text-sm font-bold text-white">{pkg.name}</h3>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed pl-7">
                              {pkg.description || "Master 4K production coverage with cinematic color grading & audio sync."}
                            </p>

                            {pkg.durationHours && (
                              <div className="pl-7 pt-1 flex items-center gap-1.5 text-[11px] text-cyan-300">
                                <Clock className="w-3 h-3" />
                                <span>{pkg.durationHours} Hours Dedicated Coverage</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right pl-7 sm:pl-0 sm:border-l sm:border-white/[0.06] sm:pl-6 shrink-0">
                            <span className="text-xs text-slate-400 block font-medium">Starting from</span>
                            <span className="text-lg font-extrabold text-white font-mono">
                              {currencySymbol}{Number(pkg.basePrice).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shoot Schedule & Location Inputs */}
                  <div className="bg-[#0c0d17] p-6 rounded-3xl border border-white/[0.08] space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-violet-400" />
                      <span>Shoot Date & Production Location</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Preferred Event Date <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="date"
                          value={shootDate}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => setShootDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#151624] text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Time of Day
                        </label>
                        <select
                          value={timeOfDay}
                          onChange={(e) => setTimeOfDay(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#151624] text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        >
                          <option value="full_day">Full Day Coverage (07:00 AM - Late)</option>
                          <option value="morning">Morning Session (08:00 AM - 01:00 PM)</option>
                          <option value="afternoon">Afternoon Session (01:00 PM - 05:00 PM)</option>
                          <option value="golden_hour">Golden Hour & Evening (04:30 PM - 08:30 PM)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Shoot Location / Venue <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Landmark Centre, Victoria Island, Lagos or Private Soundstage"
                        value={locationCity}
                        onChange={(e) => setLocationCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                      />

                      {/* Quick suggestion chips */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                        <span className="text-slate-500">Popular:</span>
                        {["Victoria Island, Lagos", "Lekki Phase 1", "Ikoyi", "Abuja", "Accra, Ghana", "London, UK"].map(
                          (city) => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => setLocationCity(city)}
                              className="px-2 py-0.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition"
                            >
                              {city}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Action Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleProceedToStep2}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center gap-2 transition hover:scale-105 active:scale-95"
                    >
                      <span>Proceed to Customize Add-Ons</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: Customize Add-Ons & Extra Hours ──────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        2. Customize Shoot Add-Ons
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Elevate your production with aerial drones, fast turnaround reels, or second cameras.
                      </p>
                    </div>

                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Step 1
                    </button>
                  </div>

                  {/* Add-Ons List */}
                  <div className="space-y-3">
                    {availableAddOns.map((item) => {
                      const isSelected = selectedAddOnNames.includes(item.name);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleAddOn(item.name)}
                          className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                            isSelected
                              ? "bg-violet-600/15 border-violet-500 ring-1 ring-violet-500/40"
                              : "bg-[#0c0d17] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                                isSelected
                                  ? "border-violet-400 bg-violet-600 text-white"
                                  : "border-white/[0.2] bg-white/[0.05]"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{item.name}</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                            </div>
                          </div>

                          <div className="text-right font-mono font-bold text-xs text-emerald-400 shrink-0">
                            +{currencySymbol}{Number(item.price).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Extra Coverage Hours Stepper */}
                  <div className="bg-[#0c0d17] p-5 rounded-2xl border border-white/[0.08] flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Additional Overtime Hours</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        +{currencySymbol}{Number(extraHourRate).toLocaleString()} per extra hour of crew on set.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-[#151624] px-3 py-1.5 rounded-xl border border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => setExtraHours((h) => Math.max(0, h - 1))}
                        disabled={extraHours === 0}
                        className="w-6 h-6 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center transition disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="font-mono font-bold text-xs w-6 text-center text-white">
                        {extraHours} hr{extraHours !== 1 ? "s" : ""}
                      </span>

                      <button
                        type="button"
                        onClick={() => setExtraHours((h) => Math.min(8, h + 1))}
                        className="w-6 h-6 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center justify-center transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Step 2 Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold transition"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToStep3}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(124,58,237,0.4)] flex items-center gap-2 transition hover:scale-105 active:scale-95"
                    >
                      <span>Proceed to Client Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 3: Client Details & Creative Vision ─────────────────── */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        3. Client Contact & Creative Brief
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Provide your contact information so the studio can generate your official production agreement.
                      </p>
                    </div>

                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Step 2
                    </button>
                  </div>

                  <div className="bg-[#0c0d17] p-6 rounded-3xl border border-white/[0.08] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-violet-400" />
                          Full Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Adeola Balogun"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          Email Address <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="adeola@example.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          WhatsApp / Phone <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="+234 803 123 4567"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                          <Instagram className="w-3.5 h-3.5 text-pink-400" />
                          Instagram Handle (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="@adeola_b"
                          value={clientInstagram}
                          onChange={(e) => setClientInstagram(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        Creative Brief / Special Requests
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe your vision, schedule, key moments, or special moodboard ideas..."
                        value={creativeBrief}
                        onChange={(e) => setCreativeBrief(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                      />
                    </div>
                  </div>

                  {/* Deposit Option Selector */}
                  <div className="bg-[#0c0d17] p-6 rounded-3xl border border-white/[0.08] space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Select Payment Commitment</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setDepositMode("50")}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          depositMode === "50"
                            ? "bg-emerald-600/15 border-emerald-500 ring-1 ring-emerald-500/40"
                            : "bg-[#151624] border-white/[0.08] text-slate-400"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">50% Commitment Deposit</div>
                          <div className="text-[11px] text-slate-400">Lock shoot date on calendar</div>
                        </div>
                        <span className="font-mono font-bold text-xs text-emerald-300">
                          {currencySymbol}{Math.round(totalShootAmount * 0.5).toLocaleString()}
                        </span>
                      </div>

                      <div
                        onClick={() => setDepositMode("100")}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          depositMode === "100"
                            ? "bg-emerald-600/15 border-emerald-500 ring-1 ring-emerald-500/40"
                            : "bg-[#151624] border-white/[0.08] text-slate-400"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">100% Full Payment</div>
                          <div className="text-[11px] text-slate-400">Settle full production in advance</div>
                        </div>
                        <span className="font-mono font-bold text-xs text-emerald-300">
                          {currencySymbol}{totalShootAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold transition"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmAndCreateBooking}
                      disabled={submitting}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-2 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      <span>{submitting ? "Locking Reservation..." : "Confirm & Proceed to Checkout"}</span>
                      {!submitting && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Right Column: Live Sticky Order Summary ────────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-[#0c0d17] p-6 rounded-3xl border border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.6)] space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">
                    Live Shoot Summary
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {currentPkg?.name || "Creative Package"}
                  </h3>
                </div>

                {/* Date & Location Badges */}
                {(shootDate || locationCity) && (
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1.5 text-xs text-slate-300">
                    {shootDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>
                          {new Date(shootDate).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {locationCity && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{locationCity}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-white/[0.06] text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Base Package</span>
                    <span className="font-mono font-semibold text-white">
                      {currencySymbol}{basePrice.toLocaleString()}
                    </span>
                  </div>

                  {selectedAddOnNames.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Selected Add-Ons ({selectedAddOnNames.length}):
                      </span>
                      {selectedAddOnNames.map((name) => {
                        const item = availableAddOns.find((a) => a.name === name);
                        return (
                          <div key={name} className="flex items-center justify-between text-[11px] text-slate-400 pl-2">
                            <span className="truncate max-w-[150px]">• {name}</span>
                            <span className="font-mono text-emerald-400">
                              +{currencySymbol}{Number(item?.price || 0).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {extraHours > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                      <span>Extra Hours ({extraHours} hrs)</span>
                      <span className="font-mono text-emerald-400">
                        +{currencySymbol}{extraHoursTotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total & Commitment Deposit Due */}
                <div className="pt-4 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Total Production Value</span>
                    <span className="font-mono text-sm font-bold text-white">
                      {currencySymbol}{totalShootAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">
                        {depositMode === "50" ? "50% Commitment Deposit" : "Full Payment Due"}
                      </span>
                      <span className="font-mono font-extrabold text-base text-emerald-400">
                        {currencySymbol}{depositDue.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-200/80">
                      Secures shoot date on {org?.name || "studio"}'s calendar.
                    </p>
                  </div>
                </div>

                {/* Studio Direct Contact */}
                {org?.whatsapp && (
                  <div className="pt-2 text-center">
                    <a
                      href={`https://wa.me/${org.whatsapp.replace(/[^0-9]/g, "")}?text=Hi!%20I'm%20customizing%20a%20shoot%20booking%20on%20your%20portal.`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-400 hover:text-emerald-400 transition inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Have a question? Chat with creator</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicBookingPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-xs text-slate-400 tracking-wider uppercase font-semibold">
            Loading Booking Engine...
          </p>
        </div>
      }
    >
      <BookingPortalContent />
    </Suspense>
  );
}

