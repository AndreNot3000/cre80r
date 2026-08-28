"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createServiceSchema } from "@crea8or/validators";
import { z } from "zod";
import { X, Sparkles, Package, Plus, Trash2, Clock, DollarSign, Tag, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type ServiceFormValues = z.infer<typeof createServiceSchema>;

interface AddOnItem {
  name: string;
  price: number;
}

const POPULAR_ADDONS: AddOnItem[] = [
  { name: "Drone 4K Aerial Pilot Coverage", price: 250000 },
  { name: "48-Hour Expedited Delivery", price: 150000 },
  { name: "Raw Footage 1TB SSD Hard Drive", price: 80000 },
  { name: "Second Cinematographer / Camera Operator", price: 200000 },
  { name: "Luxury Flush-Mount Photobook Album", price: 180000 },
  { name: "Live Stream Multi-Cam Broadcast", price: 350000 },
];

const CURRENCIES = [
  { code: "NGN", symbol: "₦", label: "Nigerian Naira (NGN)" },
  { code: "USD", symbol: "$", label: "US Dollar (USD)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP)" },
  { code: "GHS", symbol: "GH₵", label: "Ghanaian Cedi (GHS)" },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling (KES)" },
  { code: "ZAR", symbol: "R", label: "South African Rand (ZAR)" },
];

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedService: any) => void;
  editingService?: any | null;
}

export function AddServiceModal({ isOpen, onClose, onSuccess, editingService }: AddServiceModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [addOns, setAddOns] = useState<AddOnItem[]>([]);
  const [newAddOnName, setNewAddOnName] = useState("");
  const [newAddOnPrice, setNewAddOnPrice] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      currency: "NGN",
      isActive: true,
      durationHours: 8,
      basePrice: 500000,
    },
  });

  const selectedCurrency = watch("currency") || "NGN";
  const currencySymbol = CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || "₦";

  useEffect(() => {
    if (editingService) {
      setValue("name", editingService.name);
      setValue("description", editingService.description || "");
      setValue("basePrice", Number(editingService.basePrice));
      setValue("currency", editingService.currency || "NGN");
      setValue("durationHours", editingService.durationHours || 8);
      setValue("isActive", editingService.isActive ?? true);
      setAddOns(Array.isArray(editingService.addOns) ? editingService.addOns : []);
    } else {
      reset({
        currency: "NGN",
        isActive: true,
        durationHours: 8,
        basePrice: 500000,
        name: "",
        description: "",
      });
      setAddOns([]);
    }
  }, [editingService, setValue, reset, isOpen]);

  if (!isOpen) return null;

  const handleAddCustomAddOn = () => {
    if (!newAddOnName.trim() || !newAddOnPrice) return;
    const priceNum = Number(newAddOnPrice);
    if (isNaN(priceNum) || priceNum < 0) return;

    setAddOns([...addOns, { name: newAddOnName.trim(), price: priceNum }]);
    setNewAddOnName("");
    setNewAddOnPrice("");
  };

  const handleQuickAddAddOn = (item: AddOnItem) => {
    if (addOns.some((a) => a.name === item.name)) return;
    setAddOns([...addOns, item]);
  };

  const handleRemoveAddOn = (index: number) => {
    setAddOns(addOns.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ServiceFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        addOns: addOns.length > 0 ? addOns : null,
      };

      const url = editingService ? `/api/services/${editingService.id}` : "/api/services";
      const method = editingService ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save service package");
      }

      const result = await res.json();
      toast.success(
        editingService
          ? `Package "${result.name}" updated successfully!`
          : `Package "${result.name}" added to catalog!`
      );
      reset();
      setAddOns([]);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error("Save service error:", err);
      toast.error(err?.message || "Failed to save package");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0c0d17] border border-white/[0.1] rounded-3xl w-full max-w-xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {editingService ? "Edit Service Package" : "Create Service Package"}
              </h2>
              <p className="text-xs text-slate-400">Configure pricing, deliverables, and optional add-ons.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Package Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Package Title <span className="text-rose-400">*</span>
            </label>
            <input
              {...register("name")}
              required
              placeholder="e.g. Signature Wedding Cinematography & 4K Photo"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name.message}</p>}
          </div>

          {/* Currency & Base Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                Base Investment / Price <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs">
                <span className="text-slate-400 font-mono pr-1.5">{currencySymbol}</span>
                <input
                  {...register("basePrice")}
                  type="number"
                  step="10000"
                  required
                  placeholder="1500000"
                  className="bg-transparent text-white font-mono focus:outline-none flex-1"
                />
              </div>
              {errors.basePrice && <p className="text-rose-400 text-[11px] mt-1">{errors.basePrice.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Currency
              </label>
              <select
                {...register("currency")}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration & Active Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Estimated Coverage / Duration (Hours)
              </label>
              <input
                {...register("durationHours")}
                type="number"
                min="1"
                max="72"
                placeholder="8"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Showroom Status
              </label>
              <div className="flex items-center gap-3 pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register("isActive")}
                    type="checkbox"
                    className="w-4 h-4 rounded text-violet-600 bg-white/[0.04] border-white/[0.1] focus:ring-violet-500/40"
                  />
                  <span className="text-xs text-slate-300 font-medium">Active (Visible to clients in booking page)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description & Deliverables Scope */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              Scope of Deliverables & Equipment Summary
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="e.g. 2 Cinema 4K Cameras, Drone operator, 5-7 min Highlight Film, 60-min Full Documentary, 300 edited color-graded high-res photos delivered via 4K online gallery."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none leading-relaxed"
            />
          </div>

          {/* Dynamic Add-Ons Builder */}
          <div className="pt-2 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Optional Add-On Deliverables ({addOns.length})
              </label>
            </div>

            {/* Configured Add-Ons List */}
            {addOns.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {addOns.map((addon, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs"
                  >
                    <span className="text-slate-200 font-medium">{addon.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-emerald-400 font-semibold">
                        +{currencySymbol}{Number(addon.price).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddOn(index)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Suggestion Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1">
                {POPULAR_ADDONS.map((p) => {
                  const isAdded = addOns.some((a) => a.name === p.name);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleQuickAddAddOn(p)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                        isAdded
                          ? "bg-violet-500/10 text-violet-300 border-violet-500/20 opacity-50 cursor-not-allowed"
                          : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
                      }`}
                    >
                      + {p.name} ({currencySymbol}{p.price.toLocaleString()})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Add-On Input Row */}
            <div className="flex items-center gap-2 pt-1">
              <input
                value={newAddOnName}
                onChange={(e) => setNewAddOnName(e.target.value)}
                placeholder="Custom add-on name (e.g. Polaroid Booth)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white/[0.02] border border-white/[0.06] text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
              <input
                type="number"
                value={newAddOnPrice}
                onChange={(e) => setNewAddOnPrice(e.target.value)}
                placeholder="Price"
                className="w-24 px-3 py-1.5 text-xs font-mono rounded-xl bg-white/[0.02] border border-white/[0.06] text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
              <button
                type="button"
                onClick={handleAddCustomAddOn}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.04] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Package className="w-3.5 h-3.5" />
              {submitting ? "Saving Package..." : editingService ? "Update Package" : "Save Package to Catalog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
