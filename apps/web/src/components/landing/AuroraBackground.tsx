"use client";

import React from "react";
import { AuroraCanvas } from "./AuroraCanvas";

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AuroraBackground({ children, className = "" }: AuroraBackgroundProps) {
  return (
    <div className={`relative w-full overflow-hidden bg-[#05060a] text-white ${className}`}>
      {/* ─── Ethereal Aurora Canvas Layer ─── */}
      <AuroraCanvas />

      {/* ─── Subtle Texture Overlays ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Soft Noise Texture to eliminate banding */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Ultra-subtle micro dot grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ─── Foreground Content ─── */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
