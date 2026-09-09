"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS  ← Camera Lens Experience
───────────────────────────────────────────────────────────── */

// Front element of a camera lens (aperture view) inside the central card
const LENS_IMAGE_SRC =
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=90";

// Cinematic photographer background with moody studio atmosphere
const HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=2400&q=90";

const BREAKPOINT = 768;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function CinematicHero() {
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const progressRef = useRef(0);
  const expandedRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  /* ── detect mobile ──────────────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── apply progress ─────────────────────────────────── */
  const applyProgress = useCallback((p: number) => {
    const clamped = clamp(p, 0, 1);
    progressRef.current = clamped;
    setProgress(clamped);

    if (clamped >= 1 && !expandedRef.current) {
      expandedRef.current = true;
      document.body.style.overflow          = "";
      document.body.style.overscrollBehavior = "";
    } else if (clamped < 1 && expandedRef.current) {
      expandedRef.current = false;
      document.body.style.overflow          = "hidden";
      document.body.style.overscrollBehavior = "none";
    }
  }, []);

  /* ── lock body initially ────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow          = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow          = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  /* ── wheel ──────────────────────────────────────────── */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (expandedRef.current) {
        if (window.scrollY <= 0 && e.deltaY < 0) {
          e.preventDefault();
          applyProgress(progressRef.current + e.deltaY * 0.0009);
          window.scrollTo(0, 0);
        }
        return;
      }
      e.preventDefault();
      window.scrollTo(0, 0);
      applyProgress(progressRef.current + e.deltaY * 0.0009);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [applyProgress]);

  /* ── touch ──────────────────────────────────────────── */
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const delta = touchStartY.current - e.touches[0].clientY;
      touchStartY.current = e.touches[0].clientY;
      if (expandedRef.current) {
        if (window.scrollY <= 0 && delta < -20) {
          e.preventDefault();
          applyProgress(progressRef.current + delta * 0.008);
          window.scrollTo(0, 0);
        }
        return;
      }
      e.preventDefault();
      window.scrollTo(0, 0);
      applyProgress(progressRef.current + delta * (delta > 0 ? 0.005 : 0.008));
    };
    const onTouchEnd = () => { touchStartY.current = null; };

    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });
    window.addEventListener("touchend",   onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, [applyProgress]);

  /* ═══════════════════════════════════════════════════════
     DERIVED VISUAL VALUES
  ═══════════════════════════════════════════════════════ */
  const vw = typeof window !== "undefined" ? window.innerWidth  : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;

  // ── Card dimensions ──────────────────────────────────
  const rawW = isMobile
    ? 300 + progress * 650
    : 300 + progress * 1250;
  const rawH = isMobile
    ? 400 + progress * 200
    : 400 + progress * 400;

  const maxW   = 0.95 * vw;
  const maxH   = 0.85 * vh;
  const mediaW = Math.min(rawW, maxW);
  const mediaH = Math.min(rawH, maxH);

  // ── LENS IRIS: starts as a tight circular aperture, opens into widescreen rect ──
  const borderR = Math.max(8, lerp(150, 8, progress));

  // ── Inner media ZOOM: starts zoomed in, pulls back as lens "opens" ──
  const innerScale = lerp(1.45, 1.0, progress);

  // ── Lens glow shadow: amber/gold at rest, deep cinematic at full ──
  const glowR     = Math.round(lerp(255, 0, progress));
  const glowG     = Math.round(lerp(185, 0, progress));
  const glowB     = Math.round(lerp(30,  0, progress));
  const glowAlpha = lerp(0.65, 0, progress);
  const glowBlur  = lerp(80, 0, progress);
  const lensGlow  = `0 0 ${glowBlur}px rgba(${glowR},${glowG},${glowB},${glowAlpha})`;
  const baseShadow = `0 30px 100px rgba(0,0,0,${lerp(0.3, 0.55, progress)})`;
  const shadow     = `${lensGlow}, ${baseShadow}`;

  // ── Aperture ring: decorative outer ring that fades as it expands ──
  const ringOpacity = lerp(0.7, 0, Math.min(progress * 2.5, 1));
  const ringSize    = lerp(1.0, 1.4, Math.min(progress * 1.5, 1));

  // ── Background ───────────────────────────────────────
  const bgOpacity = 1 - progress;
  const bgScale   = 1 + progress * 0.05;

  // ── Overlay on media ─────────────────────────────────
  const mediaOverlay = lerp(0.55, 0.20, progress);

  // ── Title split movement ──────────────────────────────
  const titleMove = isMobile ? 180 : 150;
  const titleX    = progress * titleMove;

  // ── Scroll indicator position ─────────────────────────
  const displayedH    = Math.min(rawH, maxH);
  const indicatorTop  = vh / 2 + displayedH / 2 + 34;
  const showIndicator = progress < 0.16;

  // ── Title copy (camera/creative themed) ───────────────
  const line1 = "Frame";
  const line2 = "the Moment";

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", overflowX: "hidden" }}>

      {/* ══════════ HERO ══════════ */}
      <section
        style={{
          position:  "relative",
          minHeight: "100dvh",
          width:     "100%",
          overflow:  "hidden",
          background: "#0a0a0a",
        }}
      >
        {/* ── Full-screen background ───────────────────── */}
        <div
          style={{
            position:  "absolute",
            inset:     0,
            zIndex:    0,
            opacity:   bgOpacity,
            transform: `scale(${bgScale})`,
            transition:"transform 0.1s linear",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_BG_IMAGE}
            alt=""
            style={{
              width:          "100%",
              height:         "100%",
              objectFit:      "cover",
              objectPosition: "center",
              display:        "block",
            }}
          />
          {/* Dark tint */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        </div>

        {/* ── Subtle radial vignette always present ─────── */}
        <div
          style={{
            position:   "absolute",
            inset:      0,
            zIndex:     1,
            background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.72) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Title (mix-blend-mode: difference floats over media) ── */}
        <div
          style={{
            position:       "absolute",
            inset:          0,
            zIndex:         20,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "8px",
            padding:        "0 16px",
            pointerEvents:  "none",
            mixBlendMode:   "difference",
          }}
        >
          <span
            style={{
              display:       "block",
              fontSize:      "clamp(2.5rem, 6vw, 6rem)",
              fontWeight:    700,
              lineHeight:    0.9,
              letterSpacing: "-0.06em",
              textAlign:     "center",
              color:         "#dbeafe",
              transform:     `translateX(-${titleX}vw)`,
              willChange:    "transform",
              transition:    "transform 0.08s linear",
            }}
          >
            {line1}
          </span>
          <span
            style={{
              display:       "block",
              fontSize:      "clamp(2.5rem, 6vw, 6rem)",
              fontWeight:    700,
              lineHeight:    0.9,
              letterSpacing: "-0.06em",
              textAlign:     "center",
              color:         "#dbeafe",
              transform:     `translateX(${titleX}vw)`,
              willChange:    "transform",
              transition:    "transform 0.08s linear",
            }}
          >
            {line2}
          </span>
        </div>

        {/* ── Aperture decorative outer ring (fades as it expands) ── */}
        <div
          style={{
            position:     "absolute",
            top:          "50%",
            left:         "50%",
            transform:    `translate(-50%, -50%) scale(${ringSize})`,
            width:        `${mediaW + 32}px`,
            height:       `${mediaH + 32}px`,
            borderRadius: `${borderR + 18}px`,
            border:       `1px solid rgba(255, 185, 30, ${ringOpacity * 0.5})`,
            boxShadow:    `0 0 40px rgba(255,185,30,${ringOpacity * 0.25}), inset 0 0 40px rgba(255,185,30,${ringOpacity * 0.12})`,
            zIndex:       9,
            pointerEvents:"none",
            transition:   "all 0.1s linear",
          }}
        />

        {/* ── Second aperture tick ring ─────────────────── */}
        <div
          style={{
            position:     "absolute",
            top:          "50%",
            left:         "50%",
            transform:    `translate(-50%, -50%) scale(${ringSize * 1.07})`,
            width:        `${mediaW + 32}px`,
            height:       `${mediaH + 32}px`,
            borderRadius: `${borderR + 18}px`,
            border:       `1px solid rgba(255, 185, 30, ${ringOpacity * 0.2})`,
            zIndex:       8,
            pointerEvents:"none",
            transition:   "all 0.1s linear",
          }}
        />

        {/* ── Central media card (the LENS IRIS) ───────── */}
        <div
          style={{
            position:     "absolute",
            top:          "50%",
            left:         "50%",
            transform:    "translate(-50%, -50%)",
            width:        `${mediaW}px`,
            height:       `${mediaH}px`,
            borderRadius: `${borderR}px`,
            overflow:     "hidden",
            boxShadow:    shadow,
            zIndex:       10,
            transition:   "border-radius 0.08s linear, width 0.08s linear, height 0.08s linear",
          }}
        >
          {/* Inner wrapper that SCALES (zoom-through-lens) */}
          <div
            style={{
              width:     "100%",
              height:    "100%",
              transform: `scale(${innerScale})`,
              transition:"transform 0.08s linear",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={LENS_IMAGE_SRC}
              src={LENS_IMAGE_SRC}
              alt="Camera lens aperture"
              style={{
                width:         "100%",
                height:        "100%",
                objectFit:     "cover",
                display:       "block",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Media overlay */}
          <div
            style={{
              position:      "absolute",
              inset:         0,
              background:    `rgba(0,0,0,${mediaOverlay})`,
              transition:    "background 0.1s linear",
              pointerEvents: "none",
            }}
          />

          {/* Lens reflection sheen (only visible at low progress) */}
          <div
            style={{
              position:      "absolute",
              inset:         0,
              background:    `radial-gradient(ellipse at 35% 35%, rgba(255,220,100,${lerp(0.10, 0, progress * 3)}) 0%, transparent 60%)`,
              pointerEvents: "none",
              mixBlendMode:  "screen",
            }}
          />
        </div>

        {/* ── "LENS" label under card at rest (fades fast) ── */}
        <div
          style={{
            position:     "absolute",
            top:          "50%",
            left:         "50%",
            transform:    `translate(-50%, calc(-50% + ${mediaH / 2 + 14}px))`,
            zIndex:       30,
            opacity:      Math.max(0, lerp(0.55, 0, progress * 5)),
            pointerEvents:"none",
            transition:   "opacity 0.1s linear",
          }}
        >
          <span style={{
            fontSize:      "10px",
            fontWeight:    600,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color:         "rgba(255,185,30,0.8)",
          }}>
            ƒ / 1.8 · ISO 100 · 1/1000s
          </span>
        </div>

        {/* ── Scroll indicator ──────────────────────────── */}
        <AnimatePresence>
          {showIndicator && (
            <motion.div
              key="scroll-indicator"
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12, transition: { duration: 0.25, ease: "easeOut" } }}
              style={{
                position:      "absolute",
                left:          "50%",
                top:           `${indicatorTop}px`,
                transform:     "translateX(-50%)",
                zIndex:        30,
                pointerEvents: "none",
              }}
            >
              <div style={{
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                gap:            "12px",
                color:          "#fff",
              }}>
                <span style={{
                  fontSize:      "11px",
                  fontWeight:    600,
                  textTransform: "uppercase",
                  letterSpacing: "0.32em",
                  color:         "rgba(255,185,30,0.9)",
                }}>
                  SCROLL
                </span>
                <div style={{
                  width:          "28px",
                  height:         "44px",
                  border:         "1px solid rgba(255,255,255,0.5)",
                  borderRadius:   "999px",
                  padding:        "6px",
                  display:        "flex",
                  justifyContent: "center",
                }}>
                  <motion.div
                    animate={{ y: [0, 20, 0], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      width:        "6px",
                      height:       "6px",
                      borderRadius: "9999px",
                      background:   "#fff",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
