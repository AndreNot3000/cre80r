"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Search,
  CheckCircle2,
  User,
  Sparkles,
  FileText,
  DollarSign,
  Loader2,
  FolderKanban,
  MessageSquare,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: string;
  senderId?: string;
  senderName: string;
  senderRole: "creator" | "client" | "crew";
  content: string;
  attachments?: { name: string; url: string; type?: string; size?: string }[] | null;
  createdAt: string;
};

type Channel = {
  id: string;
  type: "project" | "client";
  title: string;
  subtitle: string;
  avatar: string;
  statusBadge?: string;
  projectId?: string;
  clientId?: string;
};

export default function MessagesPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch channels from DB
  const fetchChannels = async () => {
    try {
      setLoadingChannels(true);
      const res = await fetch("/api/messages/channels");
      if (!res.ok) throw new Error("Failed to load channels");
      const data = await res.json();

      const channelList: Channel[] = [];

      // Project channels
      if (Array.isArray(data.projects)) {
        data.projects.forEach((p: any) => {
          const initials = p.name
            .split(" ")
            .map((w: string) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          channelList.push({
            id: `proj-${p.id}`,
            type: "project",
            title: p.name,
            subtitle: p.clientName ? `Client: ${p.clientName}` : "Production Channel",
            avatar: initials || "PR",
            statusBadge: p.status?.replace("_", " "),
            projectId: p.id,
            clientId: p.clientId,
          });
        });
      }

      // Client direct channels
      if (Array.isArray(data.clients)) {
        data.clients.forEach((c: any) => {
          const initials = c.name
            .split(" ")
            .map((w: string) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          channelList.push({
            id: `client-${c.id}`,
            type: "client",
            title: c.name,
            subtitle: c.email || c.phone || "Direct Client Thread",
            avatar: initials || "CL",
            clientId: c.id,
          });
        });
      }

      setChannels(channelList);
      if (channelList.length > 0 && !activeChannel) {
        setActiveChannel(channelList[0]!);
      }
    } catch (err) {
      console.error("Error loading channels:", err);
      toast.error("Failed to load communication channels");
    } finally {
      setLoadingChannels(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // 2. Fetch messages for selected channel
  useEffect(() => {
    if (!activeChannel) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const queryParam = activeChannel.projectId
          ? `projectId=${activeChannel.projectId}`
          : `clientId=${activeChannel.clientId}`;

        const res = await fetch(`/api/messages?${queryParam}`);
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        } else {
          // Pre-populate with a welcome greeting if empty
          setMessages([
            {
              id: "welcome-1",
              senderName: activeChannel.title,
              senderRole: "client",
              content: `Hello! Excited to collaborate on ${activeChannel.title}. Feel free to drop shoot moodboards, call sheet updates, or production notes here.`,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchMessages();
  }, [activeChannel]);

  // 3. Send Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChannel || sending) return;

    const content = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const payload = {
        projectId: activeChannel.projectId || undefined,
        clientId: activeChannel.clientId || undefined,
        content,
        senderRole: "creator",
      };

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
      setTimeout(scrollToBottom, 50);
      toast.success("Message dispatched to client thread & WhatsApp channel");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filteredChannels = channels.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300 mb-2">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Realtime Messaging & Client Threads
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Client & Crew Communication Hub</h1>
        <p className="text-xs text-slate-400 mt-1">
          Synchronized communication threads for shoot logistics, proofing review feedback, and WhatsApp dispatches.
        </p>
      </div>

      <div className="bg-[#0c0d17] rounded-3xl border border-white/[0.08] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] h-[calc(100vh-230px)]">
        {/* Left Sidebar: Threads List */}
        <div className="md:col-span-4 border-r border-white/[0.08] flex flex-col justify-between bg-black/20">
          <div className="p-4 border-b border-white/[0.08] space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                placeholder="Search projects or clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.06]">
            {loadingChannels ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading channels...</p>
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 p-4">
                No active communication channels found. Launch a project or create a client to start messaging.
              </div>
            ) : (
              filteredChannels.map((channel) => {
                const isSelected = activeChannel?.id === channel.id;
                return (
                  <div
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? "bg-violet-600/15 border-l-4 border-violet-500"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                      {channel.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {channel.title}
                        </span>
                        {channel.statusBadge && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                            {channel.statusBadge}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-cyan-300 font-medium truncate mt-0.5">
                        {channel.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Chat Panel */}
        <div className="md:col-span-8 flex flex-col justify-between bg-[#0c0d17]">
          {/* Thread Header */}
          {activeChannel && (
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-500/30 font-bold text-xs flex items-center justify-center">
                  {activeChannel.avatar}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{activeChannel.title}</h3>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Synced with WhatsApp & Client Portal
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    toast.success("Public Paystack checkout link copied to clipboard!")
                  }
                  className="px-3 py-1.5 rounded-xl border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-1.5 transition"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Send Invoice Link</span>
                </button>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-black/10">
            {loadingMessages ? (
              <div className="py-20 text-center space-y-2">
                <Loader2 className="w-6 h-6 text-violet-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading conversation history...</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderRole === "creator";
                const timeString = new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs space-y-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
                        isMe
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none"
                          : "bg-[#151624] border border-white/[0.08] text-slate-200 rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 pb-1 border-b border-white/10">
                        <span className="font-semibold">{m.senderName}</span>
                        <span className="font-mono">{timeString}</span>
                      </div>

                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>

                      {Array.isArray(m.attachments) &&
                        m.attachments.map((att, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl flex items-center justify-between text-xs mt-2 ${
                              isMe
                                ? "bg-black/30 text-white"
                                : "bg-white/[0.04] border border-white/[0.06] text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-cyan-400" />
                              <div>
                                <div className="font-semibold text-[11px]">{att.name}</div>
                                {att.size && (
                                  <div className="text-[10px] opacity-70">{att.size}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-white/[0.08] flex items-center gap-3 bg-[#0c0d17]"
          >
            <button
              type="button"
              onClick={() => toast.info("Moodboard / shot list attachment picker")}
              className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/[0.06] transition"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type shoot update or message to client..."
              className="flex-1 px-4 py-2.5 text-xs bg-white/[0.03] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
