"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
  const [visible, setVisible]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Only show navbar once the user has truly scrolled past the hero (> 80px).
      // During the hero lens expansion the page is locked at scrollY = 0,
      // so the navbar stays completely invisible until expansion is done.
      setVisible(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Platform",        href: "#features"  },
    { name: "Workflows",       href: "#workflows" },
    { name: "Client Delivery", href: "#delivery"  },
    { name: "AI Assistant",    href: "#ai"        },
    { name: "Pricing",         href: "#pricing"   },
    { name: "FAQ",             href: "#faq"       },
  ];

  return (
    <header
      style={{
        position:        "fixed",
        top:             0,
        left:            0,
        right:           0,
        zIndex:          200,
        // Slide + fade in only when past the hero
        opacity:         visible ? 1 : 0,
        transform:       visible ? "translateY(0)" : "translateY(-12px)",
        pointerEvents:   visible ? "auto" : "none",
        transition:      "opacity 0.35s ease, transform 0.35s ease",
        // Frosted dark glass look
        background:      "rgba(9, 10, 16, 0.75)",
        backdropFilter:  "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom:    "1px solid rgba(255,255,255,0.07)",
        boxShadow:       "0 4px 30px rgba(0,0,0,0.5)",
        fontFamily:      "Arial, Helvetica, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* ── Brand Logo ─────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 group" style={{ textDecoration: "none" }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0c0d15] rounded-[11px] flex items-center justify-center">
              <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">
                8
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Crea<span className="text-violet-400">8</span>or
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 ml-1.5">
                OS
              </span>
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav Links ───────────────────────── */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group py-1"
              style={{ textDecoration: "none" }}
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* ── Action Buttons ──────────────────────────── */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors hover:bg-white/[0.04]"
            style={{ textDecoration: "none" }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(124,58,237,0.7)] hover:scale-[1.02]"
            style={{ textDecoration: "none" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 transition-all duration-300 group-hover:opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-1.5">
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        {/* ── Mobile Hamburger ────────────────────────── */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ───────────────────────────────── */}
      <div
        style={{
          overflow:   "hidden",
          maxHeight:  mobileMenuOpen ? "480px" : "0",
          opacity:    mobileMenuOpen ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.25s ease",
        }}
        className="md:hidden bg-[#0a0b12]/95 backdrop-blur-2xl border-b border-white/[0.08]"
      >
        <div className="px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-200 hover:text-violet-400 py-2"
              style={{ textDecoration: "none" }}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-white/[0.05] border border-white/[0.08]"
              style={{ textDecoration: "none" }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600"
              style={{ textDecoration: "none" }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
