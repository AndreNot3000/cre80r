"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckSquare,
  Square,
  Film,
  Camera,
  Download,
  Share2,
  Sparkles,
  Plus,
  Send,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Navigation,
  Sun,
  ShieldAlert,
  Loader2,
  Printer,
  Copy,
  ChevronRight,
  CheckCircle2,
  Play,
} from "lucide-react";
import { toast } from "sonner";

type TaskItem = {
  id: string;
  phase: "Pre-Production" | "Shoot Day" | "Post-Production" | "Delivery";
  title: string;
  assignee: string;
  completed: boolean;
};

const defaultTasks: TaskItem[] = [
  { id: "t-1", phase: "Pre-Production", title: "Creative brief & moodboard finalized", assignee: "Creative Lead", completed: true },
  { id: "t-2", phase: "Pre-Production", title: "Location scouted & permits approved", assignee: "Producer", completed: true },
  { id: "t-3", phase: "Pre-Production", title: "Call sheet generated & distributed to crew", assignee: "Lead DP", completed: true },
  { id: "t-4", phase: "Shoot Day", title: "Camera & lighting setup at location", assignee: "Camera Dept", completed: false },
  { id: "t-5", phase: "Shoot Day", title: "Capture primary scenes & drone aerials", assignee: "Drone Pilot", completed: false },
  { id: "t-6", phase: "Shoot Day", title: "32-bit float audio check & lav mics", assignee: "Sound Dept", completed: false },
  { id: "t-7", phase: "Post-Production", title: "Footage ingest & 3-2-1 secure backup", assignee: "Editor", completed: false },
  { id: "t-8", phase: "Post-Production", title: "Color grade & sound mastering in DaVinci", assignee: "Colorist", completed: false },
  { id: "t-9", phase: "Delivery", title: "Upload Cut V1 for client frame review", assignee: "Post Lead", completed: false },
  { id: "t-10", phase: "Delivery", title: "4K Master export & gallery delivery", assignee: "Lead Creator", completed: false },
];

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [callSheet, setCallSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"callsheet" | "tasks" | "overview" | "finance" | "review">("callsheet");
  const [tasks, setTasks] = useState<TaskItem[]>(defaultTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [gearList, setGearList] = useState<any[]>([]);
  const [projectExpenses, setProjectExpenses] = useState<any[]>([]);
  const [projectInvoices, setProjectInvoices] = useState<any[]>([]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, callRes, expRes, invRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/callsheet`),
        fetch(`/api/expenses?projectId=${id}`),
        fetch(`/api/invoices?projectId=${id}`),
      ]);

      if (projRes.ok) {
        const projData = await projRes.json();
        setProject(projData);
      }

      if (callRes.ok) {
        const callData = await callRes.json();
        if (callData.callSheet) {
          setCallSheet(callData.callSheet);
          if (Array.isArray(callData.callSheet.gearList)) {
            setGearList(callData.callSheet.gearList);
          }
        }
      }

      if (expRes.ok) {
        const expData = await expRes.json();
        if (Array.isArray(expData)) setProjectExpenses(expData);
      }

      if (invRes.ok) {
        const invData = await invRes.json();
        if (Array.isArray(invData)) setProjectInvoices(invData);
      }
    } catch (err) {
      console.error("Error loading project:", err);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjectData();
  }, [id]);

  const handleInitCallSheet = async () => {
    try {
      const payload = {
        title: `${project?.name || "Production"} Official Call Sheet`,
        shootDate: project?.shootDate || new Date().toISOString(),
        generalCallTime: "07:30 AM",
        locationName: "Landmark Event Centre, Victoria Island, Lagos",
        locationAddress: "Water Corporation Drive, Oniru, Lagos, Nigeria",
        locationMapsUrl: "https://maps.google.com/?q=Landmark+Centre+Lagos",
        parkingNotes: "Free VIP crew parking available at Gate 2.",
        weatherForecast: "Partly Cloudy • 29°C (Golden Hour 06:45 PM)",
        nearestHospital: "Evercare Hospital Lekki (+234 813 985 0710)",
        crew: [
          { name: "Emeka Obi", role: "Director of Photography", callTime: "07:00 AM", phone: "+234 803 111 2222" },
          { name: "Chidi Eze", role: "Aerial Drone Pilot", callTime: "07:30 AM", phone: "+234 802 333 4444" },
          { name: "Ngozi Bakare", role: "Sound Engineer", callTime: "07:15 AM", phone: "+234 805 555 6666" },
          { name: "Kayode Alabi", role: "Gaffer / Lighting Lead", callTime: "07:00 AM", phone: "+234 809 777 8888" },
        ],
        schedule: [
          { time: "07:00 AM", scene: "Crew Arrival & Gear Staging", notes: "Main Production Area" },
          { time: "08:30 AM", scene: "Pre-Shoot Briefing & Talent Mic Check", notes: "Green Room" },
          { time: "09:30 AM", scene: "Scene 1: Principal Photography & Wide Cinema Shots", notes: "Stage A" },
          { time: "01:00 PM", scene: "Catered Lunch Break", notes: "VIP Lounge" },
          { time: "02:00 PM", scene: "Scene 2: Close-ups, Interviews & B-Roll", notes: "Stage B" },
          { time: "05:45 PM", scene: "Golden Hour Oceanfront Aerial Drone Sequences", notes: "Oceanfront Deck" },
          { time: "07:30 PM", scene: "Wrap & Secure Footage Offload", notes: "DIT Station" },
        ],
        gearList: [
          { category: "Camera", item: "Sony FX6 4K Full-Frame Cinema Camera", packed: true },
          { category: "Camera", item: "Sony FX3 B-Cam (ProRes 4:2:2)", packed: true },
          { category: "Lenses", item: "Sony G-Master 24-70mm f/2.8 & 85mm f/1.4", packed: true },
          { category: "Drone", item: "DJI Inspire 3 (4K CinemaDNG)", packed: true },
          { category: "Lighting", item: "Aputure 600d Pro + Light Dome III", packed: true },
          { category: "Audio", item: "Rode Wireless PRO 32-Bit Float Dual Kit", packed: true },
          { category: "Power", item: "6x V-Mount 190Wh Batteries & Charger", packed: false },
        ],
        emergencyContacts: [
          { role: "Executive Producer", name: "Production Dispatch", phone: "+234 800 000 0000" },
        ],
        notes: "Strict 10-bit S-Log3 / S-Gamut3.Cine color profile. Dual backup to SanDisk Extreme Pro SSDs before wrap.",
      };

      const res = await fetch(`/api/projects/${id}/callsheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to initialize call sheet");

      const created = await res.json();
      setCallSheet(created);
      setGearList(created.gearList || []);
      toast.success("Official digital call sheet generated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to initialize call sheet");
    }
  };

  const toggleGearPacked = (index: number) => {
    const updated = [...gearList];
    updated[index].packed = !updated[index].packed;
    setGearList(updated);

    fetch(`/api/projects/${id}/callsheet`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gearList: updated }),
    }).catch(() => {});
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      phase: "Shoot Day",
      title: newTaskTitle.trim(),
      assignee: "Production Crew",
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    toast.success("Task added to production timeline");
  };

  const handleCopyCrewLink = () => {
    if (typeof window === "undefined") return;
    const publicUrl = `${window.location.origin}/c/${id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public on-set crew call sheet link copied to clipboard!");
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading project workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ─── Breadcrumb & Actions Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Projects Hub
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project?.name || "Production Workspace"}
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 uppercase">
              {project?.status?.replace("_", " ") || "In Production"}
            </span>
          </div>
          {project?.clientName && (
            <p className="text-xs text-slate-400">
              Client: <span className="font-semibold text-slate-200">{project.clientName}</span>
              {project.clientPhone && ` • ${project.clientPhone}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyCrewLink}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            Share WhatsApp Link
          </button>

          <Link
            href={`/c/${id}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Printable View
          </Link>
        </div>
      </div>

      {/* ─── Production Completion Bar ───────────────────────────────────────── */}
      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-300">
          <span>Production Milestone Progress</span>
          <span className="font-mono text-cyan-400">
            {completedTasks} of {tasks.length} Deliverables Completed ({progressPercent}%)
          </span>
        </div>
        <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* ─── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.08] pb-2 overflow-x-auto">
        {[
          { id: "callsheet", label: "🎬 Shoot Call Sheet & Timeline" },
          { id: "review", label: "🎥 Video Review Cuts" },
          { id: "tasks", label: `📋 Tasks & Deliverables (${completedTasks}/${tasks.length})` },
          { id: "overview", label: "💡 Project Scope & Brief" },
          { id: "finance", label: "💳 Project Invoicing & Deposit" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: CALL SHEET & ON-SET OPERATIONS ───────────────────────────── */}
      {activeTab === "callsheet" && (
        <div className="space-y-6">
          {!callSheet ? (
            <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-12 text-center space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Call Sheet Generated Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Generate an official on-set digital call sheet with crew call times, GPS location, shooting schedule, and gear manifest.
                </p>
              </div>
              <button
                onClick={handleInitCallSheet}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition shadow-[0_0_20px_rgba(124,58,237,0.4)]"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                Generate On-Set Call Sheet
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Call Sheet Overview Bar */}
              <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block mb-1">
                      Live Production Day Dispatch
                    </span>
                    <h2 className="text-xl font-bold text-white">{callSheet.title}</h2>
                  </div>

                  <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06] text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">General Crew Call</span>
                    <span className="text-xl font-black text-cyan-400 font-mono">{callSheet.generalCallTime}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.08] text-xs">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Shoot Date</span>
                      <span className="font-semibold text-white">
                        {new Date(callSheet.shootDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Weather Forecast</span>
                      <span className="font-semibold text-white">{callSheet.weatherForecast || "Sunny 29°C"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Nearest Hospital</span>
                      <span className="font-semibold text-white">{callSheet.nearestHospital || "Evercare Hospital"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    Location & Set Navigation
                  </h3>
                  {callSheet.locationMapsUrl && (
                    <a
                      href={callSheet.locationMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Open Google Maps
                    </a>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="font-bold text-white text-sm">{callSheet.locationName}</div>
                  <div className="text-slate-400">{callSheet.locationAddress}</div>
                  {callSheet.parkingNotes && (
                    <div className="text-amber-300 text-[11px] pt-1">
                      🚗 <strong>Parking Instructions:</strong> {callSheet.parkingNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column Layout: Schedule & Crew */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Schedule */}
                <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Shooting Schedule
                  </h3>

                  <div className="space-y-2 text-xs">
                    {Array.isArray(callSheet.schedule) &&
                      callSheet.schedule.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-start gap-3"
                        >
                          <span className="font-mono font-bold text-cyan-300 text-xs w-20 shrink-0">
                            {item.time}
                          </span>
                          <div>
                            <div className="font-bold text-white">{item.scene}</div>
                            {item.notes && <div className="text-[11px] text-slate-400 mt-0.5">{item.notes}</div>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Crew Roster */}
                <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-violet-400" />
                    Crew Call Times & Contacts
                  </h3>

                  <div className="space-y-2 text-xs">
                    {Array.isArray(callSheet.crew) &&
                      callSheet.crew.map((member: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-bold text-white">{member.name}</div>
                            <div className="text-[11px] text-cyan-400">{member.role}</div>
                            {member.phone && (
                              <div className="text-[10px] text-slate-400 font-mono">{member.phone}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Call Time</span>
                            <span className="font-mono font-bold text-amber-300 text-xs">{member.callTime}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Gear Checklist with Interactive Toggles */}
              {gearList.length > 0 && (
                <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      Equipment & Gear Checklist
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      {gearList.filter((g) => g.packed).length} of {gearList.length} Packed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {gearList.map((gear, i) => (
                      <div
                        key={i}
                        onClick={() => toggleGearPacked(i)}
                        className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                          gear.packed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                            : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:border-white/[0.12]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {gear.packed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                          <span className={gear.packed ? "font-medium" : ""}>{gear.item}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400">
                          {gear.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: PRODUCTION TASKS ─────────────────────────────────────────── */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h2 className="text-sm font-bold text-white">Production Deliverables Checklist</h2>
              <span className="text-xs font-mono text-cyan-400">
                {completedTasks} of {tasks.length} Done
              </span>
            </div>

            <form onSubmit={addTask} className="flex gap-2">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add new shoot task or deliverable..."
                className="flex-1 px-4 py-2.5 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-[0_0_15px_rgba(124,58,237,0.4)] whitespace-nowrap"
              >
                Add Task
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    task.completed
                      ? "bg-white/[0.01] border-white/[0.04] text-slate-500 line-through"
                      : "bg-white/[0.03] border-white/[0.08] text-white hover:border-violet-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-xs">{task.title}</span>
                  </div>
                  <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                    {task.phase}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: VIDEO REVIEW CUTS (FRAME.IO HUD) ────────────────────────────── */}
      {activeTab === "review" && (
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-semibold text-cyan-300 mb-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Frame.io Review Engine
              </div>
              <h2 className="text-base font-bold text-white">Video Review Cuts & Version Approvals</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Share SMPTE frame-accurate review cuts with clients for timestamped comments and 1-click approvals.
              </p>
            </div>

            <Link
              href="/galleries"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_15px_rgba(124,58,237,0.3)] self-start sm:self-auto"
            >
              <Film className="w-3.5 h-3.5" />
              Manage All Video Cuts
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/40 transition space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Cut V2 (Latest)
                  </span>
                  <span className="text-xs font-bold text-white">Commercial Master Film (ProRes 4K)</span>
                </div>
                <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-medium">
                  In Review
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Fine cut with color grading and sound mix. 2 timestamped client comments on timeline.
              </p>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <Link
                  href="/review/demo-lookbook"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                >
                  <Play className="w-3.5 h-3.5 fill-cyan-400" />
                  Launch Review HUD ↗
                </Link>

                <button
                  onClick={() => {
                    const origin = window.location.origin;
                    navigator.clipboard.writeText(`${origin}/review/demo-lookbook?view=client`);
                    toast.success("Client review link copied to clipboard (Client Mode)!");
                  }}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3 text-cyan-400" />
                  Copy Client Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: PROJECT BRIEF & SCOPE ────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
          <h2 className="text-sm font-bold text-white">Project Scope & Deliverables</h2>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-300 leading-relaxed space-y-3">
            <p>
              <strong className="text-white">Project Name:</strong> {project?.name}
            </p>
            <p>
              <strong className="text-white">Creative Scope:</strong> {project?.description || "Full-scale production coverage."}
            </p>
            <p>
              <strong className="text-white">Location Notes:</strong> {project?.notes || "No notes provided."}
            </p>
          </div>
        </div>
      )}

      {/* ─── TAB 4: FINANCE & PROJECT P&L ──────────────────────────────────── */}
      {activeTab === "finance" && (() => {
        const totalRevenue = projectInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
        const totalPaid = projectInvoices.reduce((sum, inv) => sum + Number(inv.amountPaid || 0), 0);
        const totalExpenses = projectExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
        const netProfit = (totalPaid > 0 ? totalPaid : totalRevenue) - totalExpenses;
        const marginPct = (totalPaid > 0 ? totalPaid : totalRevenue) > 0
          ? Math.round((netProfit / (totalPaid > 0 ? totalPaid : totalRevenue)) * 100)
          : 0;

        return (
          <div className="space-y-6">
            {/* Project Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08]">
                <span className="text-xs text-slate-400 font-medium">Invoiced Revenue</span>
                <div className="text-2xl font-bold text-white tracking-tight mt-1">
                  ₦{totalRevenue.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                  ₦{totalPaid.toLocaleString()} paid via Paystack
                </span>
              </div>

              <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08]">
                <span className="text-xs text-slate-400 font-medium">Shoot Expenses</span>
                <div className="text-2xl font-bold text-rose-300 tracking-tight mt-1">
                  ₦{totalExpenses.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {projectExpenses.length} logged expense items
                </span>
              </div>

              <div className="bg-[#0c0d17] p-5 rounded-3xl border border-white/[0.08]">
                <span className="text-xs text-slate-400 font-medium">Project Net Margin</span>
                <div className="text-2xl font-bold text-emerald-300 tracking-tight mt-1">
                  ₦{netProfit.toLocaleString()}
                </div>
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 mt-1 inline-block">
                  {marginPct}% Net Profit Margin
                </span>
              </div>
            </div>

            {/* Shoot Expenses Section */}
            <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Shoot Expenses for this Project</h3>
                  <p className="text-xs text-slate-400">Gear rentals, crew fees, and transport costs linked to this shoot.</p>
                </div>
                <Link
                  href="/expenses"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Expense</span>
                </Link>
              </div>

              {projectExpenses.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center text-xs text-slate-400">
                  No expenses linked to this project yet. Log gear rentals or crew day rates from the expenses hub.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06] text-xs">
                  {projectExpenses.map((exp) => (
                    <div key={exp.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{exp.description}</div>
                        <div className="text-[11px] text-slate-400">
                          {exp.vendor || "Direct"} • <span className="capitalize">{exp.category.replace("_", " ")}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-white">
                        ₦{Number(exp.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
