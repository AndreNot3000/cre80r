"use client";

import React, { useEffect, useRef } from "react";

export function AuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let t = 0;

    // High performance 2D Canvas Aurora with elegant, focused celestial stream
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      t += 0.005;
      const w = canvas.width;
      const h = canvas.height;

      // Deep, pitch-black space background
      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, w, h);

      // ── Main Celestial Aurora Beam (Sweeps diagonally like Kexsio) ──
      const bx = w * 0.78 + Math.sin(t * 0.6) * (w * 0.08);
      const by = h * 0.38 + Math.cos(t * 0.5) * (h * 0.08);
      const beamRadius = Math.max(w, h) * 0.58;

      const beamGrad = ctx.createRadialGradient(bx, by, 40, bx, by, beamRadius);
      beamGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");  // Electric Sky Blue
      beamGrad.addColorStop(0.25, "rgba(14, 165, 233, 0.28)"); // Deep Cyan
      beamGrad.addColorStop(0.55, "rgba(99, 102, 241, 0.14)"); // Indigo Shimmer
      beamGrad.addColorStop(1, "rgba(5, 6, 10, 0)");

      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Secondary Soft Violet Ethereal Glow ──
      const vx = w * 0.42 + Math.cos(t * 0.5) * (w * 0.1);
      const vy = h * 0.72 + Math.sin(t * 0.6) * (h * 0.1);
      const vRadius = Math.max(w, h) * 0.52;

      const vGrad = ctx.createRadialGradient(vx, vy, 30, vx, vy, vRadius);
      vGrad.addColorStop(0, "rgba(139, 92, 246, 0.25)");  // Soft Violet
      vGrad.addColorStop(0.45, "rgba(79, 70, 229, 0.12)"); // Royal Purple
      vGrad.addColorStop(1, "rgba(5, 6, 10, 0)");

      ctx.fillStyle = vGrad;
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
  );
}
