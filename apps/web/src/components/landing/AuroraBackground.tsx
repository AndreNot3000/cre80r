"use client";

import React, { useEffect, useRef } from "react";

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AuroraBackground({ children, className = "" }: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let t = 0;

    // High performance 2D Canvas Aurora with flowing multi-colored waves
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      t += 0.008;
      const w = canvas.width;
      const h = canvas.height;

      // Base space backdrop
      ctx.fillStyle = "#05060b";
      ctx.fillRect(0, 0, w, h);

      // ── Wave 1: Electric Cyan Aurora Stream (Slanted Top-Right) ──
      const x1 = w * 0.72 + Math.sin(t * 0.7) * (w * 0.15);
      const y1 = h * 0.35 + Math.cos(t * 0.5) * (h * 0.12);
      const r1 = Math.max(w, h) * 0.55;
      const g1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, r1);
      g1.addColorStop(0, "rgba(0, 240, 255, 0.55)");
      g1.addColorStop(0.35, "rgba(56, 189, 248, 0.28)");
      g1.addColorStop(0.7, "rgba(14, 165, 233, 0.12)");
      g1.addColorStop(1, "rgba(5, 6, 11, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // ── Wave 2: Vivid Violet & Cosmic Purple (Center Flow) ──
      const x2 = w * 0.38 + Math.cos(t * 0.6) * (w * 0.18);
      const y2 = h * 0.58 + Math.sin(t * 0.8) * (h * 0.14);
      const r2 = Math.max(w, h) * 0.58;
      const g2 = ctx.createRadialGradient(x2, y2, 20, x2, y2, r2);
      g2.addColorStop(0, "rgba(168, 85, 247, 0.52)");
      g2.addColorStop(0.4, "rgba(124, 58, 237, 0.25)");
      g2.addColorStop(0.75, "rgba(79, 70, 229, 0.1)");
      g2.addColorStop(1, "rgba(5, 6, 11, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // ── Wave 3: Emerald & Teal Shimmer (Right Flow) ──
      const x3 = w * 0.82 + Math.sin(t * 0.9) * (w * 0.12);
      const y3 = h * 0.72 + Math.cos(t * 0.6) * (h * 0.12);
      const r3 = Math.max(w, h) * 0.45;
      const g3 = ctx.createRadialGradient(x3, y3, 10, x3, y3, r3);
      g3.addColorStop(0, "rgba(16, 185, 129, 0.45)");
      g3.addColorStop(0.45, "rgba(6, 182, 212, 0.2)");
      g3.addColorStop(1, "rgba(5, 6, 11, 0)");
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);

      // ── Wave 4: Deep Royal Indigo (Bottom-Left Glow) ──
      const x4 = w * 0.2 + Math.sin(t * 0.4) * (w * 0.1);
      const y4 = h * 0.85 + Math.cos(t * 0.5) * (h * 0.1);
      const r4 = Math.max(w, h) * 0.5;
      const g4 = ctx.createRadialGradient(x4, y4, 20, x4, y4, r4);
      g4.addColorStop(0, "rgba(99, 102, 241, 0.4)");
      g4.addColorStop(0.5, "rgba(67, 56, 202, 0.15)");
      g4.addColorStop(1, "rgba(5, 6, 11, 0)");
      ctx.fillStyle = g4;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={`relative w-full overflow-hidden bg-[#05060b] text-white ${className}`}>
      {/* ── Fixed Aurora Canvas Background (Always visible across all content) ── */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      />

      {/* ── CSS Aurora Ambient Glow Layers (Reinforces luminescence & depth) ── */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
        {/* Glowing Aurora Ribbon 1 */}
        <div
          className="absolute -top-[10%] right-[-5%] w-[55vw] h-[600px] rounded-full opacity-60 blur-[100px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0, 240, 255, 0.8) 0%, rgba(56, 189, 248, 0.3) 50%, transparent 80%)",
            animation: "auroraPulse 18s ease-in-out infinite alternate",
          }}
        />

        {/* Glowing Aurora Ribbon 2 */}
        <div
          className="absolute top-[35%] -left-[10%] w-[50vw] h-[650px] rounded-full opacity-55 blur-[110px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at center, rgba(168, 85, 247, 0.75) 0%, rgba(99, 102, 241, 0.3) 50%, transparent 80%)",
            animation: "auroraPulse 22s ease-in-out infinite alternate-reverse",
          }}
        />

        {/* Soft Noise Texture to eliminate banding */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Subtle grid accent */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes auroraPulse {
          0% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translate3d(-50px, 30px, 0) scale(1.15) rotate(5deg);
            opacity: 0.75;
          }
          100% {
            transform: translate3d(30px, -40px, 0) scale(0.95) rotate(-3deg);
            opacity: 0.55;
          }
        }
      `}</style>

      {/* ── Foreground Content ── */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
