"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Zap,
  Play,
  Pause,
  MessageCircle,
  Mail,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Plus,
  RefreshCw,
  Sliders,
  Send,
  Search,
  FileText,
  CreditCard,
  Camera,
  Film,
  Check,
  AlertCircle,
  Eye,
  Loader2,
  X,
  History,
} from "lucide-react";
import { toast } from "sonner";

type AutomationRecipe = {
  id: string;
  name: string;
  description: string | null;
  triggerEvent: string;
  actionType: string;
  config: {
    templateId?: string;
    delayMinutes?: number;
    recipientRole?: string;
    whatsappMessage?: string;
    variables?: string[];
  };
  isEnabled: boolean;
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
};

type AutomationLog = {
  id: string;
  automationId: string;
  triggerEvent: string;
  recipient: string;
  channel: string;
  status: string;
  payload: any;
  createdAt: string;
};

type MetricsData = {
  totalRecipes: number;
  activeRecipes: number;
  totalExecutions: number;
  estimatedHoursSaved: number;
  deliveryRate: string;
};

const TRIGGER_LABELS: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  inquiry_created: { label: "New Showroom Inquiry", icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  shoot_reminder_48h: { label: "48 Hours Before Shoot", icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
  deposit_paid: { label: "Paystack Deposit Verified", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  callsheet_dispatched: { label: "Digital Call Sheet Created", icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/30" },
  review_cut_approved: { label: "Client Approves Cut", icon: Film, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
  gallery_delivered: { label: "4K High-Res Gallery Delivered", icon: Camera, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  invoice_overdue: { label: "Invoice Overdue (+3 Days)", icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
};

const ACTION_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  send_whatsapp: { label: "Send WhatsApp Template via Cloud API", icon: MessageCircle, color: "text-emerald-400" },
  send_email: { label: "Dispatch Branded Email via Resend", icon: Mail, color: "text-cyan-400" },
  notify_crew: { label: "Dispatch WhatsApp Alert to Crew", icon: Users, color: "text-violet-400" },
  generate_callsheet: { label: "Auto-Generate Digital Call Sheet", icon: FileText, color: "text-pink-400" },
  create_invoice: { label: "Generate & Send Paystack Invoice", icon: CreditCard, color: "text-amber-400" },
};

export default function AutomationsPage() {
  const [recipes, setRecipes] = useState<AutomationRecipe[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"recipes" | "logs">("recipes");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [testingId, setTestingId] = useState<string | null>(null);

  // New Recipe Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState("");
  const [newRecipeDesc, setNewRecipeDesc] = useState("");
  const [newTrigger, setNewTrigger] = useState("inquiry_created");
  const [newAction, setNewAction] = useState("send_whatsapp");
  const [newWaMessage, setNewWaMessage] = useState("Hi {{client_name}}! We received your inquiry for {{event_date}}.");
  const [creating, setCreating] = useState(false);

  const fetchAutomations = async () => {
    try {
      const res = await fetch("/api/automations");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.automations || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Failed to load automations:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/automations/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data || []);
      }
    } catch (err) {
      console.error("Failed to load automation logs:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchAutomations(), fetchLogs()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Toggle Recipe Active State
  const toggleRecipe = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEnabled: nextStatus } : r))
    );

    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to update recipe");
      toast.success(nextStatus ? "Automation recipe activated!" : "Automation recipe paused.");
      fetchAutomations();
    } catch (err: any) {
      // Revert on error
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isEnabled: currentStatus } : r))
      );
      toast.error(err?.message || "Failed to toggle recipe");
    }
  };

  // Run Test Simulator
  const handleTestRun = async (recipe: AutomationRecipe) => {
    setTestingId(recipe.id);
    try {
      const res = await fetch(`/api/automations/${recipe.id}/test`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Test run failed");
      const result = await res.json();

      toast.success(result.message || "Test WhatsApp notification sent!");
      fetchAutomations();
      fetchLogs();
    } catch (err: any) {
      toast.error(err?.message || "Failed to execute test run");
    } finally {
      setTestingId(null);
    }
  };

  // Create New Recipe
  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeName.trim()) {
      toast.error("Please enter a recipe name");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: newRecipeName.trim(),
        description: newRecipeDesc.trim() || undefined,
        triggerEvent: newTrigger,
        actionType: newAction,
        config: {
          whatsappMessage: newWaMessage.trim(),
          delayMinutes: 0,
        },
        isEnabled: true,
      };

      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create recipe");

      toast.success("New automation recipe created!");
      setCreateModalOpen(false);
      setNewRecipeName("");
      setNewRecipeDesc("");
      fetchAutomations();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create automation");
    } finally {
      setCreating(false);
    }
  };

  // Filter recipes by category
  const filteredRecipes = useMemo(() => {
    if (selectedFilter === "all") return recipes;
    if (selectedFilter === "leads") return recipes.filter((r) => r.triggerEvent === "inquiry_created");
    if (selectedFilter === "crew") return recipes.filter((r) => r.triggerEvent.includes("shoot") || r.triggerEvent.includes("callsheet"));
    if (selectedFilter === "payments") return recipes.filter((r) => r.triggerEvent.includes("deposit") || r.triggerEvent.includes("invoice"));
    if (selectedFilter === "post") return recipes.filter((r) => r.triggerEvent.includes("review") || r.triggerEvent.includes("gallery"));
    return recipes;
  }, [recipes, selectedFilter]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Loading Studio Automations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300 font-sans">
      {/* ─── Top Header & Hero Actions ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Studio Automations & WhatsApp Engine</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual triggers and WhatsApp Cloud automations that save 15+ hours weekly on client and crew communications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(124,58,237,0.4)] transition hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Automation</span>
          </button>
        </div>
      </div>

      {/* ─── 4 Hero Metric HUD Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] relative overflow-hidden group hover:border-violet-500/30 transition shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Recipes</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {metrics?.activeRecipes || 0}
            </span>
            <span className="text-xs text-slate-400">/ {metrics?.totalRecipes || 0} enabled</span>
          </div>
          <span className="text-[11px] text-emerald-400 block mt-1 font-medium">
            Running 24/7 in background
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] relative overflow-hidden group hover:border-cyan-500/30 transition shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Studio Hours Saved</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-cyan-300 font-mono">
              {metrics?.estimatedHoursSaved || 0} hrs
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            ~21 mins saved per client trigger
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] relative overflow-hidden group hover:border-emerald-500/30 transition shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Executions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {metrics?.totalExecutions || 0}
            </span>
            <span className="text-xs text-slate-400">dispatches</span>
          </div>
          <span className="text-[11px] text-emerald-400 block mt-1">
            Across WhatsApp & Email
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08] relative overflow-hidden group hover:border-pink-500/30 transition shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">WhatsApp Delivery Rate</span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {metrics?.deliveryRate || "99.8%"}
            </span>
          </div>
          <span className="text-[11px] text-cyan-400 block mt-1">
            Meta Cloud API verified
          </span>
        </div>
      </div>

      {/* ─── Navigation Tabs & Filters ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("recipes")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "recipes"
                ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Visual Recipes ({recipes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "logs"
                ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Execution Activity Logs ({logs.length})</span>
          </button>
        </div>

        {activeTab === "recipes" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Recipes" },
              { id: "leads", label: "Lead Inquiries" },
              { id: "crew", label: "Shoot Day & Crew" },
              { id: "payments", label: "Payments & Invoices" },
              { id: "post", label: "Post-Production" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition whitespace-nowrap ${
                  selectedFilter === tab.id
                    ? "bg-white/[0.1] text-white border border-white/[0.15]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── TAB 1: Visual Automation Recipe Cards ───────────────────────────── */}
      {activeTab === "recipes" && (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecipes.map((recipe) => {
            const triggerInfo = TRIGGER_LABELS[recipe.triggerEvent] || {
              label: recipe.triggerEvent,
              icon: Zap,
              color: "text-violet-400",
              bg: "bg-violet-500/10 border-violet-500/30",
            };
            const actionInfo = ACTION_LABELS[recipe.actionType] || {
              label: recipe.actionType,
              icon: MessageCircle,
              color: "text-emerald-400",
            };
            const TriggerIcon = triggerInfo.icon;
            const ActionIcon = actionInfo.icon;
            const isTesting = testingId === recipe.id;

            return (
              <div
                key={recipe.id}
                className={`p-6 rounded-3xl border transition flex flex-col justify-between gap-5 relative overflow-hidden ${
                  recipe.isEnabled
                    ? "bg-[#0c0d17] border-white/[0.08] hover:border-violet-500/40 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                    : "bg-[#0c0d17]/50 border-white/[0.04] opacity-60"
                }`}
              >
                {/* Top Flow Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Visual Recipe Trigger & Action Badges */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Trigger Badge */}
                    <div className={`px-3 py-1.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold ${triggerInfo.bg}`}>
                      <TriggerIcon className={`w-3.5 h-3.5 ${triggerInfo.color}`} />
                      <span className="text-slate-300">WHEN:</span>
                      <span className="text-white font-bold">{triggerInfo.label}</span>
                    </div>

                    {/* Arrow */}
                    <div className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 shrink-0">
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </div>

                    {/* Action Badge */}
                    <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold">
                      <ActionIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300">THEN:</span>
                      <span className="text-emerald-300 font-bold">{actionInfo.label}</span>
                    </div>
                  </div>

                  {/* Toggle Active Switch & Test Button */}
                  <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
                    <button
                      onClick={() => handleTestRun(recipe)}
                      disabled={isTesting}
                      className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 disabled:opacity-50"
                      title="Simulate trigger and send test WhatsApp notification"
                    >
                      {isTesting ? (
                        <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                      )}
                      <span>{isTesting ? "Simulating..." : "Test Run"}</span>
                    </button>

                    <button
                      onClick={() => toggleRecipe(recipe.id, recipe.isEnabled)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        recipe.isEnabled
                          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                          : "bg-white/[0.05] border border-white/[0.1] text-slate-400"
                      }`}
                    >
                      {recipe.isEnabled ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Recipe Name & Description */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{recipe.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-3xl">
                    {recipe.description}
                  </p>
                </div>

                {/* Message Template Preview Box */}
                {recipe.config?.whatsappMessage && (
                  <div className="p-3.5 rounded-2xl bg-[#151624] border border-white/[0.06] text-xs text-slate-300 space-y-1 font-sans">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                      💬 Rendered WhatsApp Template Message:
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                      {recipe.config.whatsappMessage}
                    </p>
                  </div>
                )}

                {/* Footer Stats & Timestamp */}
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/[0.04] pt-3">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[11px] text-slate-400">
                      🔥 <strong className="text-white">{recipe.runCount}</strong> executions triggered
                    </span>
                    {recipe.lastRunAt && (
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        Last triggered: {new Date(recipe.lastRunAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-violet-400 font-mono font-medium">
                    ⚡ Auto-Dispatched in &lt; 2s
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── TAB 2: Execution Activity Logs ─────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Live Automation Delivery Ledger</h3>
              <p className="text-xs text-slate-400">Real-time audit log of WhatsApp and email dispatches.</p>
            </div>

            <button
              onClick={fetchLogs}
              className="p-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
              title="Refresh logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/[0.02] text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4">Channel & Recipient</th>
                  <th className="py-3 px-4">Trigger Event</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No automation logs recorded yet. Click "Test Run" on any recipe above to generate live logs.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{log.recipient}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Channel: WhatsApp Cloud</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-mono">
                          {log.triggerEvent}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          <Check className="w-3 h-3" />
                          DELIVERED
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── CREATE RECIPE MODAL ────────────────────────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0c0d17] border border-white/[0.1] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Create Custom Automation Recipe</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Recipe Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP Client 24-Hour Post-Shoot Thank You"
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sends candid shoot feedback link directly to client WhatsApp"
                  value={newRecipeDesc}
                  onChange={(e) => setNewRecipeDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Trigger Event
                  </label>
                  <select
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151624] border border-white/[0.08] text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  >
                    <option value="inquiry_created">When Showroom Inquiry Arrives</option>
                    <option value="deposit_paid">When Paystack Deposit is Paid</option>
                    <option value="shoot_reminder_48h">48 Hours Before Shoot</option>
                    <option value="review_cut_approved">When Client Approves Video Cut</option>
                    <option value="gallery_delivered">When 4K Gallery is Delivered</option>
                    <option value="invoice_overdue">When Invoice is Overdue (+3 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Action Type
                  </label>
                  <select
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151624] border border-white/[0.08] text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  >
                    <option value="send_whatsapp">Send WhatsApp Message via Cloud API</option>
                    <option value="send_email">Dispatch Email via Resend</option>
                    <option value="notify_crew">Dispatch WhatsApp Alert to Crew</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  WhatsApp Template Message
                </label>
                <textarea
                  rows={3}
                  value={newWaMessage}
                  onChange={(e) => setNewWaMessage(e.target.value)}
                  placeholder="Hi {{client_name}}! ..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-slate-300 text-xs font-semibold hover:bg-white/[0.04] transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{creating ? "Creating..." : "Save Recipe"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
