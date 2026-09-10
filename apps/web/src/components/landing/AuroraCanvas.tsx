"use client";

import React, { useEffect, useRef } from "react";

export function AuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try WebGL2 / WebGL
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = (canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    } catch {
      gl = null;
    }

    // ─── 2D Canvas Fallback (if WebGL unavailable) ───
    if (!gl) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let animId: number;
      let t = 0;

      const render2D = () => {
        t += 0.012;
        const w = (canvas.width = window.innerWidth);
        const h = (canvas.height = window.innerHeight);

        // Deep cosmic space base
        ctx.fillStyle = "#05060b";
        ctx.fillRect(0, 0, w, h);

        // Cyan/Teal Aurora Ribbon
        const g1 = ctx.createRadialGradient(
          w * 0.7 + Math.sin(t * 0.7) * 150,
          h * 0.35 + Math.cos(t * 0.5) * 120,
          30,
          w * 0.65,
          h * 0.4,
          w * 0.65
        );
        g1.addColorStop(0, "rgba(0, 240, 255, 0.55)");
        g1.addColorStop(0.4, "rgba(56, 189, 248, 0.25)");
        g1.addColorStop(1, "rgba(5, 6, 11, 0)");
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);

        // Electric Violet/Purple Ribbon
        const g2 = ctx.createRadialGradient(
          w * 0.35 + Math.cos(t * 0.6) * 180,
          h * 0.6 + Math.sin(t * 0.8) * 140,
          40,
          w * 0.35,
          h * 0.6,
          w * 0.6
        );
        g2.addColorStop(0, "rgba(168, 85, 247, 0.5)");
        g2.addColorStop(0.45, "rgba(99, 102, 241, 0.22)");
        g2.addColorStop(1, "rgba(5, 6, 11, 0)");
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);

        // Emerald Ribbon
        const g3 = ctx.createRadialGradient(
          w * 0.85 + Math.sin(t * 0.9) * 100,
          h * 0.75 + Math.cos(t * 0.6) * 90,
          30,
          w * 0.8,
          h * 0.75,
          w * 0.5
        );
        g3.addColorStop(0, "rgba(16, 185, 129, 0.45)");
        g3.addColorStop(0.5, "rgba(6, 182, 212, 0.18)");
        g3.addColorStop(1, "rgba(5, 6, 11, 0)");
        ctx.fillStyle = g3;
        ctx.fillRect(0, 0, w, h);

        animId = requestAnimationFrame(render2D);
      };

      render2D();
      return () => cancelAnimationFrame(animId);
    }

    // ─── WebGL Shader Implementation ───
    const vertShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      // Noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = uv;
        p.x *= aspect;

        float t = u_time * 0.22;

        // Base obsidian black
        vec3 color = vec3(0.02, 0.024, 0.038);

        // Diagonal aurora angle (flowing from top-right down across screen)
        vec2 rotated = vec2(p.x * 0.72 + p.y * 0.68, p.y * 0.72 - p.x * 0.68);

        // ── Stream 1: Electric Cyan & Aqua Aurora Beam ──
        float n1 = snoise(rotated * 1.4 + vec2(t * 0.6, -t * 0.4));
        float wave1 = sin(p.y * 3.2 + n1 * 2.2 + t) * 0.5 + 0.5;
        float beam1 = smoothstep(0.85, 0.12, abs(uv.x - 0.72 + n1 * 0.24));
        vec3 cyan = vec3(0.0, 0.92, 1.0) * beam1 * wave1 * 1.15;

        // ── Stream 2: Vivid Violet & Cosmic Purple ──
        float n2 = snoise(rotated * 1.9 - vec2(t * 0.45, t * 0.5));
        float wave2 = sin(p.x * 2.6 + n2 * 2.0 - t * 1.1) * 0.5 + 0.5;
        float beam2 = smoothstep(0.85, 0.1, abs(uv.x - 0.42 + n2 * 0.26));
        vec3 violet = vec3(0.68, 0.28, 1.0) * beam2 * wave2 * 1.05;

        // ── Stream 3: Emerald & Teal Shimmer ──
        float n3 = snoise(p * 2.2 + vec2(-t * 0.35, t * 0.35));
        float wave3 = sin(p.y * 2.8 + n3 * 1.6 + t * 0.8) * 0.5 + 0.5;
        float beam3 = smoothstep(0.75, 0.08, abs(uv.x - 0.82 + n3 * 0.18));
        vec3 emerald = vec3(0.08, 0.95, 0.62) * beam3 * wave3 * 0.85;

        // ── Stream 4: Deep Royal Indigo (adds richness in center) ──
        float n4 = snoise(rotated * 1.1 + vec2(t * 0.3, t * 0.2));
        float beam4 = smoothstep(0.9, 0.15, abs(uv.x - 0.55 + n4 * 0.2));
        vec3 indigo = vec3(0.25, 0.38, 1.0) * beam4 * 0.65;

        color += cyan + violet + emerald + indigo;

        // Subtle vignette at window edges
        float vig = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y);
        vig = clamp(pow(16.0 * vig, 0.22), 0.0, 1.0);

        gl_FragColor = vec4(color * vig, 1.0);
      }
    `;

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error(glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, "a_position");
    const resUniform = gl.getUniformLocation(program, "u_resolution");
    const timeUniform = gl.getUniformLocation(program, "u_time");

    let animId: number;
    const startTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl?.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = (now: number) => {
      if (!gl) return;
      const elapsed = (now - startTime) * 0.001;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resUniform, canvas.width, canvas.height);
      gl.uniform1f(timeUniform, elapsed);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

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
