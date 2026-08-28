"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientSchema } from "@crea8or/validators";
import { z } from "zod";
import { X, UserPlus, Sparkles, Instagram, Mail, Phone, MapPin, Tag, FileText } from "lucide-react";
import { toast } from "sonner";

type ClientFormValues = z.infer<typeof createClientSchema>;

const SUGGESTED_TAGS = ["VIP", "Wedding", "Commercial", "Fashion", "Corporate", "Retainer", "Portrait", "Events"];

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newClient: any) => void;
}

export function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      country: "Nigeria",
      city: "Lagos",
      tags: [],
    },
  });

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customTag.trim()) {
      e.preventDefault();
      const formatted = customTag.trim();
      if (!selectedTags.includes(formatted)) {
        setSelectedTags([...selectedTags, formatted]);
      }
      setCustomTag("");
    }
  };

  const onSubmit = async (data: ClientFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        tags: selectedTags,
      };

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create client");
      }

      const created = await res.json();
      toast.success(`Client "${created.name}" added to your directory!`);
      reset();
      setSelectedTags([]);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      console.error("Add client error:", err);
      toast.error(err?.message || "Failed to add client. Please try again.");
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
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Add New Client</h2>
              <p className="text-xs text-slate-400">Save client contact details, tags, and project preferences.</p>
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
          {/* Client Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Client / Couple / Brand Name <span className="text-rose-400">*</span>
            </label>
            <input
              {...register("name")}
              required
              placeholder="e.g. Adeola & Tolu Wedding or Kolawole Luxury"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name.message}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                Work Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="client@company.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              {errors.email && <p className="text-rose-400 text-[11px] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                Phone (WhatsApp Ready)
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+234 801 234 5678"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          {/* Instagram & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Instagram className="w-3 h-3 text-cyan-400" />
                Instagram Handle
              </label>
              <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs">
                <span className="text-slate-500">@</span>
                <input
                  {...register("instagram")}
                  placeholder="handle"
                  className="bg-transparent text-white focus:outline-none flex-1 pl-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                City / Location
              </label>
              <input
                {...register("city")}
                placeholder="e.g. Lagos, Abuja, London"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          {/* Tags Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-violet-400" />
              Client Category Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUGGESTED_TAGS.map((t) => {
                const isSelected = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition ${
                      isSelected
                        ? "bg-violet-600/20 text-violet-300 border-violet-500/40 shadow-[0_0_10px_rgba(124,58,237,0.2)]"
                        : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white"
                    }`}
                  >
                    {isSelected ? `✓ ${t}` : `+ ${t}`}
                  </button>
                );
              })}
            </div>
            <input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={addCustomTag}
              placeholder="Type custom tag & press Enter..."
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/[0.02] border border-white/[0.06] text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              Private Notes & Preferences
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="e.g. Prefers cinematic video tone, loves natural lighting, key anniversary date..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-xs font-semibold text-slate-300 hover:bg-white/[0.04] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {submitting ? "Saving Client..." : "Save Client to Directory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
