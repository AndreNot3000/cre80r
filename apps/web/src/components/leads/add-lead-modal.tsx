"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeadSchema } from "@crea8or/validators";
import { z } from "zod";
import { X, Sparkles, UserPlus, Mail, Phone, Calendar, DollarSign, Tag, FileText, Send } from "lucide-react";
import { toast } from "sonner";

type LeadFormValues = z.infer<typeof createLeadSchema>;

const SOURCES = [
  { value: "inquiry_form", label: "Website Inquiry" },
  { value: "instagram_dm", label: "Instagram DM" },
  { value: "referral", label: "Client Referral" },
  { value: "whatsapp", label: "WhatsApp Direct" },
  { value: "walk_in", label: "Studio Walk-in" },
];

const SERVICE_SUGGESTIONS = [
  "Wedding Cinematography & 4K Photo",
  "Commercial / Brand Campaign Video",
  "Fashion & Lookbook Editorial",
  "Executive Portrait Session",
  "Music Video Production",
  "Event Live Stream & Multi-Cam",
];

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLead: any) => void;
}

export function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      status: "new",
      source: "inquiry_form",
      currency: "NGN",
      budget: 500000,
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: LeadFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create lead");
      }

      const created = await res.json();
      toast.success(`Inquiry from "${created.name}" added to pipeline!`);
      reset();
      onSuccess(created);
      onClose();
    } catch (err: any) {
      console.error("Add lead error:", err);
      toast.error(err?.message || "Failed to add lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0c0d17] border border-white/[0.1] rounded-3xl w-full max-w-lg shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">New Pipeline Inquiry</h2>
              <p className="text-xs text-slate-400">Log incoming lead, client interest, and budget estimate.</p>
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
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Prospect / Client Name <span className="text-rose-400">*</span>
            </label>
            <input
              {...register("name")}
              required
              placeholder="e.g. Adeola Williams or Zikora Media"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name.message}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="prospect@email.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                Phone Number
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+234 802 345 6789"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          {/* Service Interest */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-violet-400" />
              Service / Project Interest
            </label>
            <input
              {...register("serviceInterest")}
              placeholder="e.g. Wedding Cinematography & 4K Photo"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 mb-1.5"
            />
            <div className="flex flex-wrap gap-1">
              {SERVICE_SUGGESTIONS.slice(0, 3).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue("serviceInterest", s)}
                  className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Budget & Target Event Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                Estimated Budget (₦)
              </label>
              <input
                {...register("budget")}
                type="number"
                step="10000"
                placeholder="750000"
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                Target Shoot / Event Date
              </label>
              <input
                {...register("eventDate")}
                type="date"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          {/* Lead Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Inquiry Source / Channel
            </label>
            <select
              {...register("source")}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Message / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              Inquiry Message / Special Requests
            </label>
            <textarea
              {...register("message")}
              rows={2}
              placeholder="e.g. Looking for a full day coverage in Victoria Island with drone..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
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
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Adding..." : "Add to Pipeline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
