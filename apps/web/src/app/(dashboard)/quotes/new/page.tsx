"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Trash2,
  Sparkles,
  Send,
  Save,
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Package,
  CheckCircle2,
  FileText,
  Percent,
  Layers,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type ClientOption = {
  id: string;
  name: string;
  email: string | null;
};

type ServiceOption = {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  currency: string;
  addOns: { name: string; price: number }[] | null;
};

function QuoteBuilderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("serviceId");
  const preselectedClientId = searchParams.get("clientId");

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || "");
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId || "");

  const [notes, setNotes] = useState(
    "50% retainer deposit is required to reserve the production date. Remaining 50% balance is due upon delivery of final master files."
  );
  const [terms, setTerms] = useState(
    "Standard creative license applies. All RAW files and high-resolution master deliverables are archived for 90 days."
  );
  const [currency, setCurrency] = useState("NGN");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      description: "Full-Day Cinema Production (4K UHD Multi-Cam)",
      quantity: 1,
      unitPrice: 1850000,
      total: 1850000,
    },
  ]);

  // Load clients and services
  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
      })
      .catch(() => {});

    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch(() => {});
  }, []);

  // Handle service package import
  useEffect(() => {
    if (selectedServiceId && services.length > 0) {
      const pkg = services.find((s) => s.id === selectedServiceId);
      if (pkg) {
        setCurrency(pkg.currency || "NGN");
        const items: LineItem[] = [
          {
            description: `${pkg.name} — ${pkg.description || "Primary Production Scope"}`,
            quantity: 1,
            unitPrice: Number(pkg.basePrice),
            total: Number(pkg.basePrice),
          },
        ];

        if (Array.isArray(pkg.addOns) && pkg.addOns.length > 0) {
          pkg.addOns.forEach((addon) => {
            items.push({
              description: `[Add-On] ${addon.name}`,
              quantity: 1,
              unitPrice: Number(addon.price),
              total: Number(addon.price),
            });
          });
        }

        setLineItems(items);
        toast.info(`Imported deliverables from "${pkg.name}"`);
      }
    }
  }, [selectedServiceId, services]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, val: string | number) => {
    const updated = [...lineItems];
    const item = { ...updated[index]! };

    if (field === "description") item.description = String(val);
    else if (field === "quantity") {
      item.quantity = Math.max(1, Number(val) || 1);
      item.total = item.quantity * item.unitPrice;
    } else if (field === "unitPrice") {
      item.unitPrice = Math.max(0, Number(val) || 0);
      item.total = item.quantity * item.unitPrice;
    }

    updated[index] = item;
    setLineItems(updated);
  };

  // Financial auto-math
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * Number(taxRate || 0)) / 100;
  const total = Math.max(0, subtotal + taxAmount - Number(discountAmount || 0));

  // Milestone splits
  const depositMilestone = Math.round(total * 0.5);
  const finalMilestone = total - depositMilestone;

  const handleAiDraft = () => {
    setLineItems([
      { description: "2-Day Commercial Film Direction & Cinema Crew (4K ProRes)", quantity: 1, unitPrice: 2500000, total: 2500000 },
      { description: "4K Aerial Drone Cinematography & Licensed Pilot", quantity: 1, unitPrice: 350000, total: 350000 },
      { description: "High-End Color Grading & Sound Master Suite", quantity: 1, unitPrice: 450000, total: 450000 },
      { description: "5x 4K Social Media Reel Cuts & Teasers", quantity: 1, unitPrice: 250000, total: 250000 },
    ]);
    setNotes("50% booking deposit required. Remaining 50% due on delivery of master edits. Includes 2 rounds of creative revisions.");
    toast.success("AI loaded comprehensive production proposal!");
  };

  const handleSaveQuote = async (status: "draft" | "sent") => {
    if (lineItems.some((i) => !i.description.trim())) {
      toast.error("Please provide descriptions for all line items");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clientId: selectedClientId || undefined,
        lineItems: lineItems.map((item) => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
        taxRate: Number(taxRate || 0),
        discountAmount: Number(discountAmount || 0),
        currency: currency as any,
        notes: notes.trim() || undefined,
        terms: terms.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      };

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create quote");
      }

      const created = await res.json();

      if (status === "sent") {
        await fetch(`/api/quotes/${created.id}/send`, { method: "POST" });
        toast.success(`Proposal ${created.quoteNumber} created and marked as sent!`);
      } else {
        toast.success(`Draft proposal ${created.quoteNumber} saved!`);
      }

      router.push("/quotes");
    } catch (err: any) {
      console.error("Save quote error:", err);
      toast.error(err?.message || "Failed to save proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Proposals
        </button>

        <button
          type="button"
          onClick={handleAiDraft}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 transition shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          AI Auto-Fill Commercial Proposal
        </button>
      </div>

      {/* Quote Header: Client & Package Selection */}
      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-base font-bold text-white tracking-tight">Proposal & Quote Builder</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3 h-3 text-violet-400" />
              Recipient Client / Brand
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="">-- Select Client from Directory --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.email ? `(${c.email})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Service Package Quick Importer */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Package className="w-3 h-3 text-cyan-400" />
              Import Service Package Deliverables
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="">-- Import from Service Catalog --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (₦{Number(s.basePrice).toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Line Items Builder */}
      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            Itemized Production Deliverables
          </h2>
          <span className="text-xs font-mono text-cyan-400 font-medium">Currency: {currency}</span>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <input
                  required
                  value={item.description}
                  onChange={(e) => updateLineItem(index, "description", e.target.value)}
                  placeholder="Deliverable / service item description..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="w-16">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-center font-mono"
                    title="Quantity"
                  />
                </div>

                <div className="w-32">
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                    placeholder="Unit Price"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-right"
                  />
                </div>

                <div className="w-32 text-right text-xs font-mono font-bold text-white">
                  ₦{(item.quantity * item.unitPrice).toLocaleString()}
                </div>

                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addLineItem}
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold pt-2 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Line Item
        </button>
      </div>

      {/* Financial Breakdown & Milestone Schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Terms & Expiration */}
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Terms & Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, deposit schedule, delivery timelines..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              Proposal Validity / Expiration Date
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>
        </div>

        {/* Auto-Math Breakdown */}
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-3.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Deliverables Subtotal</span>
            <span className="font-mono font-bold text-white">₦{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-slate-500" />
              VAT / Tax Rate (%)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-mono text-right focus:outline-none"
              />
              <span className="font-mono text-white text-xs w-20 text-right">+₦{Math.round(taxAmount).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Special Client Discount</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-mono text-right focus:outline-none"
              />
              <span className="font-mono text-emerald-400 text-xs w-20 text-right">-₦{discountAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex justify-between items-baseline">
            <span className="text-sm font-bold text-white">Total Proposal Investment</span>
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              ₦{total.toLocaleString()}
            </span>
          </div>

          {/* Payment Milestone Split */}
          <div className="pt-3 border-t border-white/[0.06] bg-white/[0.02] p-3 rounded-2xl space-y-1.5 text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Suggested Payment Schedule:</span>
            <div className="flex justify-between text-slate-300">
              <span>50% Booking Deposit</span>
              <span className="font-mono font-bold text-cyan-300">₦{depositMilestone.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>50% Final Delivery Settlement</span>
              <span className="font-mono font-bold text-slate-300">₦{finalMilestone.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => handleSaveQuote("draft")}
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          Save as Draft
        </button>

        <button
          type="button"
          onClick={() => handleSaveQuote("sent")}
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          Create & Mark as Sent
        </button>
      </div>
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading quote builder...</div>}>
      <QuoteBuilderForm />
    </Suspense>
  );
}
