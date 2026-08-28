import { Zap, ArrowDown, FileText, FolderKanban, MessageSquare, Calendar, CheckCircle2 } from "lucide-react";

export function AutomationShowcase() {
  const steps = [
    {
      type: "TRIGGER",
      title: "Client Books Wedding Package & Pays 70% Deposit",
      desc: "Paystack webhook confirms deposit payment in NGN instantly.",
      icon: Zap,
      accent: "border-cyan-500/40 bg-cyan-950/20 text-cyan-400",
    },
    {
      type: "ACTION 1",
      title: "Generate E-Sign Contract with Client & Pricing Data",
      desc: "Auto-fills wedding date, cancellation terms, and sends digital signature link.",
      icon: FileText,
      accent: "border-violet-500/40 bg-violet-950/20 text-violet-400",
    },
    {
      type: "ACTION 2",
      title: "Create Production Workspace & Assign Crew Tasks",
      desc: "Sets up shoot checklist, equipment call sheet, and assigns 2nd shooter.",
      icon: FolderKanban,
      accent: "border-indigo-500/40 bg-indigo-950/20 text-indigo-400",
    },
    {
      type: "ACTION 3",
      title: "Send WhatsApp Questionnaire & Calendar Invitation",
      desc: "Sends venue questionnaire link directly to the couple on WhatsApp.",
      icon: MessageSquare,
      accent: "border-emerald-500/40 bg-emerald-950/20 text-emerald-400",
    },
  ];

  return (
    <section className="py-20 border-t border-white/[0.06] relative bg-[#0a0b12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
            <Zap className="w-3.5 h-3.5" />
            No-Code Automation Engine
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Automate your busywork from booking to delivery.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Build powerful automated trigger-and-action chains that run your business while you focus on shooting.
          </p>
        </div>

        {/* Visual Workflow Chain */}
        <div className="max-w-3xl mx-auto space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-full p-5 rounded-2xl border ${step.accent} backdrop-blur-xl flex items-center justify-between shadow-lg`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                        {step.type}
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">{step.title}</div>
                      <div className="text-xs text-slate-400 mt-1">{step.desc}</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 hidden sm:block" />
                </div>
                {i < steps.length - 1 && (
                  <div className="py-2 text-slate-600">
                    <ArrowDown className="w-4 h-4 animate-bounce" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
