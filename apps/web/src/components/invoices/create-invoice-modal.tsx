"use client";

import { useState, useEffect } from "react";
import {
  X,
  Receipt,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Percent,
  Layers,
  Send,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ClientOption {
  id: string;
  name: string;
  email: string | null;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedInvoice: any) => void;
}

const CURRENCIES = [
  { code: "NGN", symbol: "₦", label: "Nigerian Naira (NGN)" },
  { code: "USD", symbol: "$", label: "US Dollar (USD)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP)" },
  { code: "GHS", symbol: "GH₵", label: "Ghanaian Cedi (GHS)" },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling (KES)" },
  { code: "ZAR", symbol: "R", label: "South African Rand (ZAR)" },
];

export function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState(
    "Please make payments to: GTBank | Apex Film & Visuals | 0123456789. Kindly quote the invoice number on your payment reference."
  );
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "Cinema Production Retainer Fee", quantity: 1, unitPrice: 1000000, total: 1000000 },
  ]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/clients")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setClients(data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sym = CURRENCIES.find((c) => c.code === currency)?.symbol || "₦";

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

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * Number(taxRate || 0)) / 100;
  const total = Math.max(0, subtotal + taxAmount - Number(discountAmount || 0));

  const handleSubmit = async (targetStatus: "draft" | "sent") => {
    if (!clientId) {
      toast.error("Please select a client from your directory");
      return;
    }
    if (lineItems.some((i) => !i.description.trim())) {
      toast.error("Please provide descriptions for all line items");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clientId,
        lineItems: lineItems.map((i) => ({
          description: i.description.trim(),
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.quantity * i.unitPrice,
        })),
        taxRate: Number(taxRate || 0),
        discountAmount: Number(discountAmount || 0),
        currency: currency as any,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create invoice");
      }

      const created = await res.json();

      if (targetStatus === "sent") {
        await fetch(`/api/invoices/${created.id}/send`, { method: "POST" });
        toast.success(`Invoice ${created.invoiceNumber} created and marked as sent!`);
      } else {
        toast.success(`Draft invoice ${created.invoiceNumber} saved!`);
      }

      onSuccess(created);
      onClose();
    } catch (err: any) {
      console.error("Create invoice error:", err);
      toast.error(err?.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0c0d17] border border-white/[0.1] rounded-3xl w-full max-w-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Create New Invoice</h2>
              <p className="text-xs text-slate-400">Generate itemized billing for clients with auto-math.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Client & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3 text-violet-400" />
                Select Client <span className="text-rose-400">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.email ? `(${c.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#151624] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>

          {/* Line Items */}
          <div className="pt-2 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <Layers className="w-3 h-3 text-violet-400" />
                Line Items ({lineItems.length})
              </label>
            </div>

            <div className="space-y-2.5">
              {lineItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    value={item.description}
                    onChange={(e) => updateLineItem(index, "description", e.target.value)}
                    placeholder="Deliverable / service description..."
                    className="flex-1 w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                      className="w-14 px-2 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-mono text-center focus:outline-none"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                      placeholder="Price"
                      className="w-28 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-mono text-right focus:outline-none"
                    />
                    <span className="w-24 text-right font-mono font-bold text-white text-xs">
                      {sym}{(item.quantity * item.unitPrice).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold pt-1 transition"
            >
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>

          {/* Financial Auto-Math */}
          <div className="pt-2 border-t border-white/[0.06] space-y-2 bg-white/[0.02] p-4 rounded-2xl">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono font-bold text-white">{sym}{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3 text-slate-500" />
                VAT / Tax (%)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  className="w-16 px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-mono text-right focus:outline-none"
                />
                <span className="font-mono text-white w-20 text-right">+{sym}{Math.round(taxAmount).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Discount</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  className="w-24 px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-mono text-right focus:outline-none"
                />
                <span className="font-mono text-emerald-400 w-20 text-right">-{sym}{discountAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-between items-baseline font-bold text-sm">
              <span className="text-white">Total Invoiced</span>
              <span className="font-black text-emerald-400 font-mono text-lg">{sym}{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Payment Instructions & Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-white/[0.08] bg-white/[0.01]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
            className="px-4 py-2 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("sent")}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Create & Send
          </button>
        </div>
      </div>
    </div>
  );
}
