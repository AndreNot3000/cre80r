import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  const productLinks = [
    { name: "Client CRM & Leads", href: "#features" },
    { name: "Online Booking Calendar", href: "#features" },
    { name: "Shoot Call Sheets", href: "#workflows" },
    { name: "Branded 4K Galleries", href: "#delivery" },
    { name: "Video Review & Approval", href: "#delivery" },
    { name: "Paystack & Stripe Invoicing", href: "#features" },
    { name: "AI Creator Assistant", href: "#ai" },
  ];

  const workflowLinks = [
    { name: "For Photographers", href: "#workflows" },
    { name: "For Videographers", href: "#workflows" },
    { name: "For Wedding Specialists", href: "#workflows" },
    { name: "For Creative Agencies", href: "#workflows" },
    { name: "For Content Creators", href: "#workflows" },
  ];

  const resourceLinks = [
    { name: "Pricing & Plans", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "System Status", href: "#" },
    { name: "Security & Encryption", href: "#" },
  ];

  return (
    <footer className="border-t border-white/[0.08] bg-[#07080d] pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-bold text-white text-sm">
                8
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Crea<span className="text-violet-400">8</span>or
              </span>
            </Link>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The all-in-one business operating system built for modern African and global creative professionals, filmmakers, photographers, and studios.
            </p>

            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (API, Payments & Storage)</span>
            </div>
          </div>

          {/* Product Col */}
          <div className="space-y-3">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Platform
            </div>
            <ul className="space-y-2">
              {productLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Workflows Col */}
          <div className="space-y-3">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Workflows
            </div>
            <ul className="space-y-2">
              {workflowLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Col */}
          <div className="space-y-3">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Resources
            </div>
            <ul className="space-y-2">
              {resourceLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Crea8or Technologies Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">
              Security & Paystack PCI-DSS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
