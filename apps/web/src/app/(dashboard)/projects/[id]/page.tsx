"use client";

import { useState, useEffect, useMemo } from "react";
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
  Phone,
  CheckCheck,
  Search,
  ExternalLink,
  PackageCheck,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  X,
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
  const id = (params?.id as string) || "";

  const [project, setProject] = useState<any>(null);
  const [callSheet, setCallSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"callsheet" | "tasks" | "overview" | "finance" | "review">("callsheet");
  const [tasks, setTasks] = useState<TaskItem[]>(defaultTasks);
  const [taskPhase, setTaskPhase] = useState<string>("all");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPhase, setNewTaskPhase] = useState<TaskItem["phase"]>("Shoot Day");
  const [gearList, setGearList] = useState<any[]>([]);
  const [gearCategory, setGearCategory] = useState<string>("all");
  const [gearSearch, setGearSearch] = useState<string>("");
  const [projectExpenses, setProjectExpenses] = useState<any[]>([]);
  const [projectInvoices, setProjectInvoices] = useState<any[]>([]);

  // Modals for adding Crew, Schedule Beat, and Gear
  const [isAddCrewModalOpen, setIsAddCrewModalOpen] = useState(false);
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState("Camera Operator");
  const [newCrewCallTime, setNewCrewCallTime] = useState("07:00 AM");
  const [newCrewPhone, setNewCrewPhone] = useState("");

  const [isAddBeatModalOpen, setIsAddBeatModalOpen] = useState(false);
  const [newBeatTime, setNewBeatTime] = useState("09:00 AM");
  const [newBeatScene, setNewBeatScene] = useState("");
  const [newBeatNotes, setNewBeatNotes] = useState("");

  const [isAddGearModalOpen, setIsAddGearModalOpen] = useState(false);
  const [newGearItem, setNewGearItem] = useState("");
  const [newGearCategory, setNewGearCategory] = useState("Camera");

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

  const handleBulkPack = (packed: boolean) => {
    const updated = gearList.map((g) => ({ ...g, packed }));
    setGearList(updated);

    fetch(`/api/projects/${id}/callsheet`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gearList: updated }),
    }).catch(() => {
      toast.error("Failed to sync equipment status");
    });
    toast.success(packed ? "All gear marked as PACKED ✅" : "Gear checklist reset 🔄");
  };

  const handleWhatsAppDispatch = () => {
    if (!callSheet) {
      toast.error("No call sheet generated yet to dispatch");
      return;
    }
    const crewSummary = Array.isArray(callSheet.crew)
      ? callSheet.crew.map((c: any) => `• ${c.role}: ${c.name} (${c.callTime})`).join("\n")
      : "";
    const shootDateFormatted = new Date(callSheet.shootDate).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const message = `🎬 *OFFICIAL CALL SHEET: ${callSheet.title || project?.name}*\n\n` +
      `📅 *Date:* ${shootDateFormatted}\n` +
      `⏰ *General Call Time:* ${callSheet.generalCallTime || "07:30 AM"}\n` +
      `📍 *Location:* ${callSheet.locationName || ""}\n` +
      `🗺 *Google Maps:* ${callSheet.locationMapsUrl || "N/A"}\n` +
      `🚗 *Parking:* ${callSheet.parkingNotes || "Free crew parking"}\n` +
      `☀️ *Weather:* ${callSheet.weatherForecast || "Sunny"}\n\n` +
      `👥 *Crew Call Times:*\n${crewSummary}\n\n` +
      `📱 *Live Digital Call Sheet HUD:* ${origin}/c/${id}\n` +
      `🚨 *Emergency / Hospital:* ${callSheet.nearestHospital || "Evercare Hospital"}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    toast.success("Opening WhatsApp for Crew Dispatch!");
  };

  const handleWhatsAppCrewMember = (member: any) => {
    if (!member.phone) {
      toast.error(`No phone number available for ${member.name}`);
      return;
    }
    const cleanPhone = member.phone.replace(/[^0-9]/g, "");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = `Hi ${member.name}! Here is your call details for *${project?.name || "the shoot"}*:\n\n` +
      `⏰ *Your Call Time:* ${member.callTime}\n` +
      `📍 *Location:* ${callSheet?.locationName || ""}\n` +
      `🗺 *Map:* ${callSheet?.locationMapsUrl || ""}\n` +
      `🔗 *Full Digital Call Sheet:* ${origin}/c/${id}`;

    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleAddCrewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrewName.trim()) {
      toast.error("Please enter crew member's name");
      return;
    }
    const newMember = {
      name: newCrewName.trim(),
      role: newCrewRole.trim() || "Crew",
      callTime: newCrewCallTime.trim() || "07:30 AM",
      phone: newCrewPhone.trim() || null,
    };

    const currentCrew = Array.isArray(callSheet?.crew) ? callSheet.crew : [];
    const updatedCrew = [...currentCrew, newMember];

    setCallSheet((prev: any) => ({ ...prev, crew: updatedCrew }));
    setIsAddCrewModalOpen(false);
    setNewCrewName("");
    setNewCrewPhone("");

    try {
      const res = await fetch(`/api/projects/${id}/callsheet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crew: updatedCrew }),
      });
      if (!res.ok) throw new Error("Failed to save crew member");
      toast.success(`${newMember.name} added to Crew Roster!`);
    } catch (err) {
      toast.error("Failed to sync crew roster with server");
      setCallSheet((prev: any) => ({ ...prev, crew: currentCrew }));
    }
  };

  const handleDeleteCrewMember = async (index: number) => {
    const currentCrew = Array.isArray(callSheet?.crew) ? callSheet.crew : [];
    const memberToDelete = currentCrew[index];
    const updatedCrew = currentCrew.filter((_: any, i: number) => i !== index);

    setCallSheet((prev: any) => ({ ...prev, crew: updatedCrew }));

    try {
      const res = await fetch(`/api/projects/${id}/callsheet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crew: updatedCrew }),
      });
      if (!res.ok) throw new Error("Failed to delete crew member");
      toast.success(`Removed ${memberToDelete.name}`);
    } catch (err) {
      toast.error("Failed to sync deletion");
      setCallSheet((prev: any) => ({ ...prev, crew: currentCrew }));
    }
  };

  const handleAddScheduleBeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeatScene.trim()) {
      toast.error("Please enter scene description or beat title");
      return;
    }
    const newBeat = {
      time: newBeatTime.trim() || "08:00 AM",
      scene: newBeatScene.trim(),
      notes: newBeatNotes.trim() || null,
    };

    const currentSchedule = Array.isArray(callSheet?.schedule) ? callSheet.schedule : [];
    const updatedSchedule = [...currentSchedule, newBeat];

    setCallSheet((prev: any) => ({ ...prev, schedule: updatedSchedule }));
    setIsAddBeatModalOpen(false);
    setNewBeatScene("");
    setNewBeatNotes("");

    try {
      const res = await fetch(`/api/projects/${id}/callsheet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: updatedSchedule }),
      });
      if (!res.ok) throw new Error("Failed to save schedule beat");
      toast.success("Schedule beat added to timeline!");
    } catch (err) {
      toast.error("Failed to sync schedule beat");
      setCallSheet((prev: any) => ({ ...prev, schedule: currentSchedule }));
    }
  };

  const handleDeleteScheduleBeat = async (index: number) => {
    const currentSchedule = Array.isArray(callSheet?.schedule) ? callSheet.schedule : [];
    const updatedSchedule = currentSchedule.filter((_: any, i: number) => i !== index);

    setCallSheet((prev: any) => ({ ...prev, schedule: updatedSchedule }));

    try {
      const res = await fetch(`/api/projects/${id}/callsheet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: updatedSchedule }),
      });
      if (!res.ok) throw new Error("Failed to delete beat");
      toast.success("Schedule beat removed");
    } catch (err) {
      toast.error("Failed to sync schedule deletion");
      setCallSheet((prev: any) => ({ ...prev, schedule: currentSchedule }));
    }
  };

  const handleAddGearItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGearItem.trim()) {
      toast.error("Please enter equipment name");
      return;
    }
    const newItem = {
      category: newGearCategory.trim() || "Camera",
      item: newGearItem.trim(),
      packed: false,
    };

    const updatedGear = [...gearList, newItem];
    setGearList(updatedGear);
    setIsAddGearModalOpen(false);
    setNewGearItem("");

    try {
      const res = await fetch(`/api/projects/${id}/callsheet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gearList: updatedGear }),
      });
      if (!res.ok) throw new Error("Failed to save gear item");
      toast.success(`${newItem.item} added to gear checklist!`);
    } catch (err) {
      toast.error("Failed to sync gear checklist");
      setGearList(gearList);
    }
  };

  const handleDeleteGearItem = async (index: number) => {
    const itemToDelete = gearList[index];
    const updatedGear = gearList.filter((_: any, i: number) => i !== index);
    setGearList(updatedGear);

    try {
      const res = await fetch(`/api/projects/${id}/callsheet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gearList: updatedGear }),
      });
      if (!res.ok) throw new Error("Failed to delete gear");
      toast.success(`Removed ${itemToDelete.item}`);
    } catch (err) {
      toast.error("Failed to sync gear deletion");
      setGearList(gearList);
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
      phase: newTaskPhase,
      title: newTaskTitle.trim(),
      assignee: "Production Crew",
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    toast.success(`Task added to ${newTaskPhase} checklist`);
  };

  const handleCopyCrewLink = () => {
    if (typeof window === "undefined") return;
    const publicUrl = `${window.location.origin}/c/${id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public on-set crew call sheet link copied to clipboard!");
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const gearCategories = useMemo(() => {
    const cats = new Set<string>();
    gearList.forEach((g) => {
      if (g.category) cats.add(g.category);
    });
    return ["all", ...Array.from(cats)];
  }, [gearList]);

  const filteredGear = useMemo(() => {
    return gearList.filter((g) => {
      const matchCat =
        gearCategory === "all" || (g.category || "").toLowerCase() === gearCategory.toLowerCase();
      const matchSearch =
        !gearSearch.trim() ||
        (g.item || "").toLowerCase().includes(gearSearch.toLowerCase().trim());
      return matchCat && matchSearch;
    });
  }, [gearList, gearCategory, gearSearch]);

  const packedGearCount = useMemo(() => {
    return gearList.filter((g) => g.packed).length;
  }, [gearList]);

  const filteredTasks = useMemo(() => {
    if (taskPhase === "all") return tasks;
    return tasks.filter((t) => t.phase === taskPhase);
  }, [tasks, taskPhase]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-pulse">
        {/* Skeleton Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/[0.05] rounded" />
            <div className="h-8 w-64 bg-white/[0.08] rounded-xl" />
            <div className="h-3 w-48 bg-white/[0.04] rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-44 bg-white/[0.06] rounded-xl" />
            <div className="h-10 w-32 bg-white/[0.06] rounded-xl" />
          </div>
        </div>

        {/* Skeleton Milestone Progress */}
        <div className="bg-[#0c0d18]/85 rounded-3xl border border-white/[0.08] p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-44 bg-white/[0.06] rounded" />
            <div className="h-4 w-28 bg-white/[0.06] rounded" />
          </div>
          <div className="h-2 w-full bg-white/[0.05] rounded-full" />
        </div>

        {/* Skeleton Tabs */}
        <div className="flex gap-2 border-b border-white/[0.08] pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-32 bg-white/[0.05] rounded-xl" />
          ))}
        </div>

        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-[#0c0d18]/85 rounded-3xl border border-white/[0.08]" />
          <div className="h-72 bg-[#0c0d18]/85 rounded-3xl border border-white/[0.08]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ─── Breadcrumb & Actions Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Projects Hub
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {project?.name || "Production Workspace"}
            </h1>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 uppercase tracking-wider">
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

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleWhatsAppDispatch}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 transition shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            title="Send formatted shoot call sheet to WhatsApp"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Crew Dispatch</span>
          </button>

          <button
            onClick={handleCopyCrewLink}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Copy Link</span>
          </button>

          <Link
            href={`/c/${id}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Call Sheet</span>
          </Link>
        </div>
      </div>

      {/* ─── Production Completion Bar ───────────────────────────────────────── */}
      <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-2.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-cyan-400" />
            <span>Production Milestone Deliverables</span>
          </div>
          <span className="font-mono text-cyan-400">
            {completedTasks} of {tasks.length} Completed ({progressPercent}%)
          </span>
        </div>
        <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden p-[1px]">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
          />
        </div>
      </div>

      {/* ─── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto">
        {[
          { id: "callsheet", label: "🎬 Shoot Call Sheet & Timeline" },
          { id: "review", label: "🎥 Video Review Cuts" },
          { id: "tasks", label: `📋 Tasks (${completedTasks}/${tasks.length})` },
          { id: "overview", label: "💡 Project Scope & Brief" },
          { id: "finance", label: "💳 Financials & P&L" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] border border-violet-400/30"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white border border-transparent"
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
            <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-12 text-center space-y-4 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                <Film className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No Call Sheet Generated Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  Generate an official on-set digital call sheet with crew call times, GPS location, shooting schedule, weather forecast, and gear manifest.
                </p>
              </div>
              <button
                onClick={handleInitCallSheet}
                className="inline-flex items-center gap-2 text-xs font-semibold px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition shadow-[0_0_25px_rgba(124,58,237,0.4)]"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Generate Official Call Sheet</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Call Sheet Overview Bar */}
              <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block mb-1">
                      Live Production Day Dispatch
                    </span>
                    <h2 className="text-xl font-black text-white">{callSheet.title}</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleWhatsAppDispatch}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 transition"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dispatch All Crew</span>
                    </button>
                    <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06] text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">General Crew Call</span>
                      <span className="text-xl font-black text-cyan-400 font-mono">{callSheet.generalCallTime}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.08] text-xs">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Shoot Date</span>
                      <span className="font-semibold text-white">
                        {new Date(callSheet.shootDate).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Weather Forecast</span>
                      <span className="font-semibold text-white">{callSheet.weatherForecast || "Sunny • 29°C"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Emergency Hospital</span>
                      {callSheet.nearestHospital ? (
                        <a
                          href={`tel:${callSheet.nearestHospital.replace(/[^0-9+]/g, "")}`}
                          className="font-semibold text-rose-300 hover:underline flex items-center gap-1"
                        >
                          {callSheet.nearestHospital}
                        </a>
                      ) : (
                        <span className="font-semibold text-white">Evercare Hospital Lekki</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-3">
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

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1.5">
                  <div className="font-bold text-white text-sm">{callSheet.locationName}</div>
                  <div className="text-slate-400">{callSheet.locationAddress}</div>
                  {callSheet.parkingNotes && (
                    <div className="text-amber-300 text-[11px] pt-1 flex items-center gap-1">
                      <span>🚗</span>
                      <span><strong>Parking Instructions:</strong> {callSheet.parkingNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column Layout: Schedule & Crew */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Schedule Timeline */}
                <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      Shooting Schedule Timeline
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {Array.isArray(callSheet.schedule) ? callSheet.schedule.length : 0} Planned Beats
                      </span>
                      <button
                        onClick={() => setIsAddBeatModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Beat</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative pl-3 space-y-3 text-xs before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/[0.08]">
                    {Array.isArray(callSheet.schedule) &&
                      callSheet.schedule.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="relative pl-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-cyan-500/30 transition group"
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-[17px] top-4 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />

                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                                {item.scene}
                              </div>
                              {item.notes && <div className="text-[11px] text-slate-400 mt-0.5">{item.notes}</div>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-bold text-cyan-300 text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                                {item.time}
                              </span>
                              <button
                                onClick={() => handleDeleteScheduleBeat(i)}
                                className="w-6 h-6 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                title="Delete beat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Crew Roster */}
                <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-violet-400" />
                      Crew Call Times & Contacts
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {Array.isArray(callSheet.crew) ? callSheet.crew.length : 0} Assigned Crew
                      </span>
                      <button
                        onClick={() => setIsAddCrewModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 hover:bg-violet-500/25 text-violet-300 text-xs font-semibold transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Crew</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {Array.isArray(callSheet.crew) &&
                      callSheet.crew.map((member: any, i: number) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-3 hover:border-white/[0.1] transition group"
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{member.name}</span>
                              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded">
                                {member.callTime}
                              </span>
                            </div>
                            <div className="text-[11px] text-cyan-400">{member.role}</div>
                            {member.phone && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{member.phone}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {member.phone && (
                              <>
                                <button
                                  onClick={() => handleWhatsAppCrewMember(member)}
                                  className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 flex items-center justify-center transition"
                                  title={`WhatsApp ${member.name}`}
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={`tel:${member.phone.replace(/[^0-9+]/g, "")}`}
                                  className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 flex items-center justify-center transition"
                                  title={`Call ${member.name}`}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteCrewMember(i)}
                              className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-rose-500/15 hover:border-rose-500/30 text-slate-500 hover:text-rose-300 flex items-center justify-center transition"
                              title={`Remove ${member.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Equipment & Gear Checklist with Category Filter, Search & Bulk Actions */}
              {gearList.length > 0 && (
                <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-400" />
                        Equipment & Gear Checklist
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Verify pack status before on-location departure.
                      </p>
                    </div>

                    {/* Bulk Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setIsAddGearModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-500/15 border border-violet-500/30 hover:bg-violet-500/25 text-violet-300 transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Gear</span>
                      </button>
                      <button
                        onClick={() => handleBulkPack(true)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 transition flex items-center gap-1"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Pack All</span>
                      </button>
                      <button
                        onClick={() => handleBulkPack(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-white transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                      <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        {packedGearCount}/{gearList.length} Packed
                      </span>
                    </div>
                  </div>

                  {/* Gear Progress Bar */}
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${gearList.length > 0 ? (packedGearCount / gearList.length) * 100 : 0}%`,
                      }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                    />
                  </div>

                  {/* Category Pills & Search */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {gearCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setGearCategory(cat)}
                          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition capitalize ${
                            gearCategory === cat
                              ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                              : "bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white"
                          }`}
                        >
                          {cat === "all" ? "All Gear" : cat}
                        </button>
                      ))}
                    </div>

                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        value={gearSearch}
                        onChange={(e) => setGearSearch(e.target.value)}
                        placeholder="Search gear..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500/40 placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Gear Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                    {filteredGear.map((gear, i) => {
                      const actualIdx = gearList.findIndex((g) => g.item === gear.item);
                      return (
                        <div
                          key={i}
                          onClick={() => toggleGearPacked(actualIdx >= 0 ? actualIdx : i)}
                          className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer select-none group ${
                            gear.packed
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                              : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:border-white/[0.15]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {gear.packed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            <span className={gear.packed ? "font-semibold" : ""}>{gear.item}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400">
                              {gear.category}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGearItem(actualIdx >= 0 ? actualIdx : i);
                              }}
                              className="w-6 h-6 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              title="Delete gear item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
          <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
              <div>
                <h2 className="text-base font-bold text-white">Production Deliverables & Timeline Tasks</h2>
                <p className="text-xs text-slate-400">Track and assign milestones across all production phases.</p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 self-start sm:self-auto">
                {completedTasks} of {tasks.length} Completed ({progressPercent}%)
              </span>
            </div>

            {/* Phase Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(["all", "Pre-Production", "Shoot Day", "Post-Production", "Delivery"] as const).map((phase) => (
                <button
                  key={phase}
                  onClick={() => setTaskPhase(phase)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                    taskPhase === phase
                      ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                      : "bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white"
                  }`}
                >
                  {phase === "all" ? "All Phases" : phase}
                </button>
              ))}
            </div>

            {/* New Task Form with Phase Selector */}
            <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add new shoot task or deliverable..."
                className="flex-1 px-4 py-2.5 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
              />
              <select
                value={newTaskPhase}
                onChange={(e) => setNewTaskPhase(e.target.value as any)}
                className="px-3 py-2.5 text-xs bg-[#161726] border border-white/[0.08] text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="Pre-Production">Pre-Production</option>
                <option value="Shoot Day">Shoot Day</option>
                <option value="Post-Production">Post-Production</option>
                <option value="Delivery">Delivery</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:from-violet-500 hover:to-indigo-500 transition whitespace-nowrap"
              >
                Add Task
              </button>
            </form>

            {/* Task Items List */}
            <div className="space-y-2 pt-2">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer select-none ${
                    task.completed
                      ? "bg-white/[0.01] border-white/[0.04] text-slate-500 line-through"
                      : "bg-white/[0.02] border-white/[0.06] text-white hover:border-violet-500/40 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="text-xs font-medium">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">{task.assignee}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium border ${
                        task.phase === "Pre-Production"
                          ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
                          : task.phase === "Shoot Day"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                          : task.phase === "Post-Production"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {task.phase}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: VIDEO REVIEW CUTS (FRAME.IO HUD) ────────────────────────────── */}
      {activeTab === "review" && (
        <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-5">
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
        <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
          <h2 className="text-base font-bold text-white">Project Scope & Creative Brief</h2>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-300 leading-relaxed space-y-3">
            <p>
              <strong className="text-white">Project Name:</strong> {project?.name}
            </p>
            <p>
              <strong className="text-white">Creative Scope:</strong> {project?.description || "Full-scale cinematic production coverage, multi-camera 4K setup, aerial drone captures, and social cuts."}
            </p>
            <p>
              <strong className="text-white">Location Notes:</strong> {project?.notes || "No extra location notes provided."}
            </p>
            {project?.shootDate && (
              <p>
                <strong className="text-white">Scheduled Shoot Date:</strong>{" "}
                {new Date(project.shootDate).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
            {project?.deliveryDate && (
              <p>
                <strong className="text-white">Final Master Delivery Deadline:</strong>{" "}
                {new Date(project.deliveryDate).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
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
              <div className="bg-[#0c0d18]/85 backdrop-blur-xl p-5 rounded-3xl border border-white/[0.08] border-t-cyan-500/40 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                <span className="text-xs text-slate-400 font-medium">Invoiced Revenue</span>
                <div className="text-2xl font-bold text-white tracking-tight mt-1">
                  ₦{totalRevenue.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                  ₦{totalPaid.toLocaleString()} collected
                </span>
              </div>

              <div className="bg-[#0c0d18]/85 backdrop-blur-xl p-5 rounded-3xl border border-white/[0.08] border-t-rose-500/40 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                <span className="text-xs text-slate-400 font-medium">Shoot Expenses</span>
                <div className="text-2xl font-bold text-rose-300 tracking-tight mt-1">
                  ₦{totalExpenses.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {projectExpenses.length} logged expense items
                </span>
              </div>

              <div className="bg-[#0c0d18]/85 backdrop-blur-xl p-5 rounded-3xl border border-white/[0.08] border-t-emerald-500/40 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                <span className="text-xs text-slate-400 font-medium">Project Net Margin</span>
                <div className="text-2xl font-bold text-emerald-300 tracking-tight mt-1">
                  ₦{netProfit.toLocaleString()}
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 mt-1 inline-block">
                  {marginPct}% Net Profit Margin
                </span>
              </div>
            </div>

            {/* Shoot Expenses Section */}
            <div className="bg-[#0c0d18]/85 backdrop-blur-xl rounded-3xl border border-white/[0.08] border-t-white/[0.18] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Shoot Expenses for this Project</h3>
                  <p className="text-xs text-slate-400">Gear rentals, crew fees, and transport costs linked to this shoot.</p>
                </div>
                <Link
                  href="/expenses"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Expense</span>
                </Link>
              </div>

              {projectExpenses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center text-xs text-slate-400">
                  No expenses linked to this project yet. Log gear rentals or crew day rates from the expenses hub.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06] text-xs">
                  {projectExpenses.map((exp) => (
                    <div key={exp.id} className="py-3.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{exp.description}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
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

      {/* ─── MODAL: ADD CREW MEMBER ────────────────────────────────────────── */}
      {isAddCrewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0c0d18]/95 backdrop-blur-2xl border border-white/[0.12] border-t-white/[0.25] rounded-3xl w-full max-w-md shadow-[0_24px_80px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-white/[0.01]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-300 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Crew Member</h3>
                  <p className="text-xs text-slate-400">Assign role and arrival call time for shoot day.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCrewModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCrewMember} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  placeholder="e.g. Tunde Adeleke"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Department / Role</label>
                  <select
                    value={newCrewRole}
                    onChange={(e) => setNewCrewRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#161726] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  >
                    <option value="Director of Photography">Director of Photography (DP)</option>
                    <option value="Camera Operator">Camera Operator</option>
                    <option value="Focus Puller / 1st AC">Focus Puller / 1st AC</option>
                    <option value="Aerial Drone Pilot">Aerial Drone Pilot</option>
                    <option value="Sound Recordist / Boom">Sound Recordist / Boom</option>
                    <option value="Gaffer / Lighting Lead">Gaffer / Lighting Lead</option>
                    <option value="Key Grip">Key Grip</option>
                    <option value="Production Assistant">Production Assistant (PA)</option>
                    <option value="Hair & Makeup Artist">Hair & Makeup Artist (HMUA)</option>
                    <option value="Wardrobe Stylist">Wardrobe Stylist</option>
                    <option value="DIT / Media Manager">DIT / Media Manager</option>
                    <option value="BTS Shooter">BTS Photographer / Videographer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Individual Call Time</label>
                  <input
                    value={newCrewCallTime}
                    onChange={(e) => setNewCrewCallTime(e.target.value)}
                    placeholder="e.g. 07:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Phone Number (for WhatsApp Dispatch)
                </label>
                <input
                  value={newCrewPhone}
                  onChange={(e) => setNewCrewPhone(e.target.value)}
                  placeholder="e.g. +234 803 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddCrewModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-400 hover:text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Crew</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD SCHEDULE BEAT ────────────────────────────────────────── */}
      {isAddBeatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0c0d18]/95 backdrop-blur-2xl border border-white/[0.12] border-t-white/[0.25] rounded-3xl w-full max-w-md shadow-[0_24px_80px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-white/[0.01]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Schedule Beat</h3>
                  <p className="text-xs text-slate-400">Schedule a scene, briefing, or setup milestone.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBeatModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddScheduleBeat} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Scheduled Time <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  value={newBeatTime}
                  onChange={(e) => setNewBeatTime(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Scene / Activity Title <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  value={newBeatScene}
                  onChange={(e) => setNewBeatScene(e.target.value)}
                  placeholder="e.g. Scene 3: Bride Entrance & Family Blessings"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Location / Specific Stage Notes
                </label>
                <input
                  value={newBeatNotes}
                  onChange={(e) => setNewBeatNotes(e.target.value)}
                  placeholder="e.g. Main Hall - Center Aisle"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddBeatModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-400 hover:text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Beat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD EQUIPMENT / GEAR ────────────────────────────────────── */}
      {isAddGearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0c0d18]/95 backdrop-blur-2xl border border-white/[0.12] border-t-white/[0.25] rounded-3xl w-full max-w-md shadow-[0_24px_80px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-white/[0.01]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Equipment to Manifest</h3>
                  <p className="text-xs text-slate-400">Track equipment packing before departure.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddGearModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGearItem} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Equipment / Gear Name <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  value={newGearItem}
                  onChange={(e) => setNewGearItem(e.target.value)}
                  placeholder="e.g. Sony FX6 Cinema Camera or Aputure 600d"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Category</label>
                <select
                  value={newGearCategory}
                  onChange={(e) => setNewGearCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#161726] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                  <option value="Camera">Camera</option>
                  <option value="Lenses">Lenses</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Audio">Audio</option>
                  <option value="Drone">Drone</option>
                  <option value="Power">Power & Batteries</option>
                  <option value="Grip">Grip & Support</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddGearModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-400 hover:text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Equipment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
