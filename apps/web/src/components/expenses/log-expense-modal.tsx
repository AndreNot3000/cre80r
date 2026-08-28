"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExpenseSchema } from "@crea8or/validators";
import { z } from "zod";
import {
  X,
  Receipt,
  FolderKanban,
  DollarSign,
  Loader2,
  CheckCircle2,
  UploadCloud,
  Layers,
  Calendar,
  Building2,
  Camera,
  Users,
  Car,
  Film,
  Sparkles,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

type ExpenseFormValues = z.infer<typeof createExpenseSchema>;

interface ProjectOption {
  id: string;
  name: string;
}

interface LogExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedExpense: any) => void;
  editingExpense?: any | null;
}

const CATEGORY_OPTIONS = [
  { value: "crew_fees", label: "Crew & Freelancer Fees", icon: Users, color: "text-violet-400" },
  { value: "gear_rentals", label: "Camera & Gear Rentals", icon: Camera, color: "text-cyan-400" },
  { value: "transport_logistics", label: "Transport & Logistics", icon: Car, color: "text-amber-400" },
  { value: "studio_rental", label: "Studio & Location Rental", icon: Building2, color: "text-emerald-400" },
  { value: "post_production", label: "Post-Production & VFX", icon: Film, color: "text-rose-400" },
  { value: "props_styling", label: "Props & Wardrobe Styling", icon: Sparkles, color: "text-pink-400" },
  { value: "software_subscriptions", label: "Software & Cloud Services", icon: Layers, color: "text-blue-400" },
  { value: "other", label: "General Studio Expense", icon: Receipt, color: "text-slate-400" },
];

export function LogExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  editingExpense,
}: LogExpenseModalProps) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      category: "gear_rentals",
      amount: 50000,
      currency: "NGN",
      paymentMethod: "bank_transfer",
      isPaid: true,
      isReimbursable: false,
    },
  });

  const selectedCategory = watch("category");

  // Load Projects
  useEffect(() => {
    if (isOpen) {
      fetch("/api/projects")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setProjects(data);
        })
        .catch(() => {});

      if (editingExpense) {
        setValue("description", editingExpense.description);
        setValue("amount", Number(editingExpense.amount));
        setValue("category", editingExpense.category || "gear_rentals");
        setValue("projectId", editingExpense.projectId || undefined);
        setValue("vendor", editingExpense.vendor || "");
        setValue("currency", editingExpense.currency || "NGN");
        setValue("paymentMethod", editingExpense.paymentMethod || "bank_transfer");
        setValue("isReimbursable", editingExpense.isReimbursable || false);
        setValue("isPaid", editingExpense.isPaid ?? true);
        setValue("notes", editingExpense.notes || "");
        setValue("receiptUrl", editingExpense.receiptUrl || "");
        if (editingExpense.expenseDate) {
          setValue("expenseDate", new Date(editingExpense.expenseDate).toISOString().slice(0, 10));
        }
      } else {
        reset({
          category: "gear_rentals",
          amount: 50000,
          currency: "NGN",
          paymentMethod: "bank_transfer",
          isPaid: true,
          isReimbursable: false,
          expenseDate: new Date().toISOString().slice(0, 10),
        });
        setReceiptFileName(null);
      }
    }
  }, [isOpen, editingExpense, setValue, reset]);

  // Handle local receipt upload
  const handleReceiptPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setValue("receiptUrl", reader.result as string);
      toast.success(`Receipt "${file.name}" attached!`);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const onSubmit = async (data: ExpenseFormValues) => {
    setSubmitting(true);
    try {
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses";
      const method = editingExpense ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save expense");
      }

      const result = await res.json();
      toast.success(editingExpense ? "Expense updated successfully!" : "Expense logged successfully!");
      reset();
      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error("Save expense error:", err);
      toast.error(err?.message || "Failed to save expense");
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
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {editingExpense ? "Edit Studio Expense" : "Log Studio Expense"}
              </h2>
              <p className="text-xs text-slate-400">
                Track gear rentals, crew day rates, logistics, and shoot overheads.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Category Selector Grid */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Expense Category <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.value;
                return (
                  <div
                    key={cat.value}
                    onClick={() => setValue("category", cat.value as any)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col items-center justify-center text-center gap-1.5 ${
                      isSelected
                        ? "bg-violet-600/20 border-violet-500 ring-1 ring-violet-500/40 text-white"
                        : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    <span className="text-[10px] font-semibold leading-tight">{cat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Description <span className="text-rose-400">*</span>
            </label>
            <input
              {...register("description")}
              required
              placeholder="e.g. Sony FX6 Camera Body + 24-70mm GM II 2-Day Rental"
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            {errors.description && <p className="text-rose-400 text-[11px] mt-1">{errors.description.message}</p>}
          </div>

          {/* Amount & Currency & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block font-semibold text-slate-300 mb-1.5">
                Amount <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                {...register("amount")}
                required
                placeholder="150000"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-sm font-bold"
              />
              {errors.amount && <p className="text-rose-400 text-[11px] mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Currency
              </label>
              <select
                {...register("currency")}
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="GHS">GHS (GH₵)</option>
                <option value="KES">KES (KSh)</option>
                <option value="ZAR">ZAR (R)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Expense Date
              </label>
              <input
                type="date"
                {...register("expenseDate")}
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          {/* Linked Project & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <FolderKanban className="w-3 h-3 text-cyan-400" />
                Link Shoot Project
              </label>
              <select
                {...register("projectId")}
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="">-- General Studio Expense --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Vendor / Payee
              </label>
              <input
                {...register("vendor")}
                placeholder="e.g. Lagos Cine Rentals / Chidi Eze"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          {/* Payment Method & Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Payment Method
              </label>
              <select
                {...register("paymentMethod")}
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="bank_transfer">Direct Bank Transfer</option>
                <option value="debit_card">Debit Card / POS</option>
                <option value="cash">Petty Cash</option>
                <option value="paystack">Paystack</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isPaid"
                {...register("isPaid")}
                className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.05] text-violet-600 focus:ring-violet-500"
              />
              <label htmlFor="isPaid" className="text-slate-300 font-medium cursor-pointer">
                Mark as Paid
              </label>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isReimbursable"
                {...register("isReimbursable")}
                className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.05] text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="isReimbursable" className="text-slate-300 font-medium cursor-pointer">
                Client Reimbursable
              </label>
            </div>
          </div>

          {/* Receipt Attachment */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Receipt / Proof of Payment
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleReceiptPicked}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl border border-dashed border-white/[0.15] hover:border-violet-500/50 bg-white/[0.02] hover:bg-violet-600/[0.05] cursor-pointer flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <Paperclip className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs truncate max-w-[250px]">
                  {receiptFileName || (watch("receiptUrl") ? "Receipt image attached" : "Click to attach receipt / invoice image")}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded">
                Browse
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Notes
            </label>
            <input
              {...register("notes")}
              placeholder="e.g. Includes generator fuel surcharge for night shoot"
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Receipt className="w-3.5 h-3.5" />
              )}
              {submitting ? "Saving Expense..." : editingExpense ? "Save Changes" : "Log Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
