"use client";

import React from "react";

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AuroraBackground({ children, className = "" }: AuroraBackgroundProps) {
  return (
    <div className={`relative w-full overflow-hidden bg-[#06070b] text-white ${className}`}>
      {/* ─── Ambient Aurora Canvas Layer (Fixed/Absolute Background) ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Deep base vignette */}
        <div className="absolute inset-0 bg-[#06070b]/90 z-[1]" />

        {/* ── Aurora Wave 1: Cyan / Emerald Ribbon (Top-Right / Slanted Flow) ── */}
        <div
          className="absolute -top-[15%] right-[-10%] w-[70vw] h-[900px] rounded-[100%] opacity-40 blur-[120px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0, 212, 255, 0.85) 0%, rgba(56, 189, 248, 0.45) 45%, rgba(16, 185, 129, 0.2) 75%, transparent 100%)",
            animation: "auroraDriftOne 24s ease-in-out infinite alternate",
            transformOrigin: "center right",
          }}
        />

        {/* ── Aurora Wave 2: Electric Indigo / Violet Ribbon (Center-Left Flow) ── */}
        <div
          className="absolute top-[25%] -left-[15%] w-[65vw] h-[850px] rounded-[100%] opacity-35 blur-[130px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.8) 0%, rgba(99, 102, 241, 0.45) 40%, rgba(14, 165, 233, 0.2) 75%, transparent 100%)",
            animation: "auroraDriftTwo 28s ease-in-out infinite alternate-reverse",
            transformOrigin: "center left",
          }}
        />

        {/* ── Aurora Wave 3: Cyan & Ice Blue Stream (Mid-Lower Section) ── */}
        <div
          className="absolute top-[55%] right-[-5%] w-[60vw] h-[800px] rounded-[100%] opacity-30 blur-[140px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(38, 198, 218, 0.75) 0%, rgba(79, 70, 229, 0.4) 45%, rgba(6, 182, 212, 0.15) 75%, transparent 100%)",
            animation: "auroraDriftThree 30s ease-in-out infinite alternate",
            transformOrigin: "center right",
          }}
        />

        {/* ── Aurora Wave 4: Deep Royal Purple (Pricing & CTA Bottom Section) ── */}
        <div
          className="absolute bottom-[-10%] left-[10%] w-[80vw] h-[900px] rounded-[100%] opacity-35 blur-[130px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.75) 0%, rgba(56, 189, 248, 0.35) 45%, rgba(16, 185, 129, 0.15) 80%, transparent 100%)",
            animation: "auroraDriftOne 26s ease-in-out infinite alternate-reverse",
          }}
        />

        {/* ── Micro-Grid & Ambient Star Dust Overlay ── */}
        <div
          className="absolute inset-0 z-[2] opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* ── Subtle Film Grain (prevents color banding, creates luxury texture) ── */}
        <div
          className="absolute inset-0 z-[3] opacity-[0.025] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ── Keyframe Animations for Fluid Organic Flow ── */}
      <style jsx global>{`
        @keyframes auroraDriftOne {
          0% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 0.35;
          }
          50% {
            transform: translate3d(-60px, 40px, 0) scale(1.12) rotate(4deg);
            opacity: 0.5;
          }
          100% {
            transform: translate3d(40px, -50px, 0) scale(0.95) rotate(-3deg);
            opacity: 0.38;
          }
        }

        @keyframes auroraDriftTwo {
          0% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translate3d(80px, -40px, 0) scale(1.15) rotate(-5deg);
            opacity: 0.45;
          }
          100% {
            transform: translate3d(-30px, 60px, 0) scale(0.92) rotate(3deg);
            opacity: 0.32;
          }
        }

        @keyframes auroraDriftThree {
          0% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 0.28;
          }
          50% {
            transform: translate3d(-70px, -50px, 0) scale(1.08) rotate(6deg);
            opacity: 0.42;
          }
          100% {
            transform: translate3d(50px, 30px, 0) scale(0.96) rotate(-4deg);
            opacity: 0.3;
          }
        }
      `}</style>

      {/* ─── Foreground Content ─── */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
