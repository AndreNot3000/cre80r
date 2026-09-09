"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type MediaMode = "video" | "image";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const VIDEO_URL = "https://www.pexels.com/download/video/17828727/";
const VIDEO_BG  = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2400&q=90";
const IMAGE_SRC = "https://images.unsplash.com/photo-1682687982501-1e58ab814714?q=85&w=1800&auto=format&fit=crop";
const IMAGE_BG  = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=85&w=2400&auto=format&fit=crop";

const BREAKPOINT = 768;

/* ─────────────────────────────────────────────────────────────
   HELPER
───────────────────────────────────────────────────────────── */
function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function CinematicHero() {
  const [progress, setProgress] = useState(0);       // 0 → 1
  const [mode, setMode]         = useState<MediaMode>("video");
  const [expanded, setExpanded] = useState(false);   // fully expanded flag
  const [isMobile, setIsMobile] = useState(false);

  const progressRef  = useRef(0);
  const expandedRef  = useRef(false);
  const touchStartY  = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── detect mobile ───────────────────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── sync progress → expandedRef ────────────────────────── */
  const applyProgress = useCallback((p: number) => {
    const clamped = clamp(p, 0, 1);
    progressRef.current = clamped;
    setProgress(clamped);

    if (clamped >= 1 && !expandedRef.current) {
      expandedRef.current = true;
      setExpanded(true);
      document.body.style.overflow     = "";
      document.body.style.overscrollBehavior = "";
    } else if (clamped < 1 && expandedRef.current) {
      expandedRef.current = false;
      setExpanded(false);
      document.body.style.overflow     = "hidden";
      document.body.style.overscrollBehavior = "none";
    }
  }, []);

  /* ── lock / unlock body scroll ──────────────────────────── */
  useEffect(() => {
    document.body.style.overflow        = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow        = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  /* ── wheel handler ───────────────────────────────────────── */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (expandedRef.current) {
        // allow normal scrolling once expanded —
        // but intercept upward scroll at top to collapse
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

  /* ── touch handler ───────────────────────────────────────── */
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const currentY = e.touches[0].clientY;
      const deltaY   = touchStartY.current - currentY; // positive = swipe up
      touchStartY.current = currentY;

      if (expandedRef.current) {
        if (window.scrollY <= 0 && deltaY < -20) {
          e.preventDefault();
          applyProgress(progressRef.current + deltaY * 0.008);
          window.scrollTo(0, 0);
        }
        return;
      }
      e.preventDefault();
      window.scrollTo(0, 0);
      const sensitivity = deltaY > 0 ? 0.005 : 0.008;
      applyProgress(progressRef.current + deltaY * sensitivity);
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

  /* ── switch mode: reset progress & scroll to top ────────── */
  const switchMode = (m: MediaMode) => {
    if (m === mode) return;
    window.scrollTo(0, 0);
    document.body.style.overflow        = "hidden";
    document.body.style.overscrollBehavior = "none";
    expandedRef.current = false;
    setExpanded(false);
    progressRef.current = 0;
    setProgress(0);
    setMode(m);
  };

  /* ─────────────────────────────────────────────────────────
     DERIVED DIMENSIONS
  ───────────────────────────────────────────────────────────*/
  const vw = typeof window !== "undefined" ? window.innerWidth  : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;

  const rawW = isMobile
    ? 300 + progress * 650
    : 300 + progress * 1250;
  const rawH = isMobile
    ? 400 + progress * 200
    : 400 + progress * 400;

  const maxW = 0.95 * vw;
  const maxH = 0.85 * vh;

  const mediaW  = Math.min(rawW, maxW);
  const mediaH  = Math.min(rawH, maxH);
  const borderR = 16 - progress * 14;   // 16px → ~2px as it expands

  /* ── title movement ─────────────────────────────────────── */
  const titleMove = isMobile ? 180 : 150;
  const titleX    = progress * titleMove;

  /* ── scroll indicator position ──────────────────────────── */
  const displayedH      = Math.min(rawH, maxH);
  const indicatorTop    = vh / 2 + displayedH / 2 + 34;
  const showIndicator   = progress < 0.16;

  /* ── background fade ────────────────────────────────────── */
  const bgOpacity = 1 - progress;
  const bgScale   = 1 + progress * 0.05;

  /* ── video overlay opacity ──────────────────────────────── */
  const videoOverlayOpacity = mode === "video"
    ? 0.42 - progress * 0.26
    : 0.50 - progress * 0.28;

  /* ── titles ─────────────────────────────────────────────── */
  const line1 = mode === "video" ? "Beyond"      : "Into";
  const line2 = mode === "video" ? "the Visible" : "the Unknown";

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────*/
  return (
    <div
      style={{ fontFamily: "Arial, Helvetica, sans-serif", overflowX: "hidden" }}
    >
      {/* ══════════ HERO SECTION ══════════ */}
      <section
        ref={containerRef}
        style={{
          position:  "relative",
          minHeight: "100dvh",
          width:     "100%",
          overflow:  "hidden",
          background: "#000",
        }}
      >
        {/* ── Full-screen background ── */}
        <motion.div
          style={{
            position:   "absolute",
            inset:      0,
            zIndex:     0,
            opacity:    bgOpacity,
            scale:      bgScale,
            transition: "none",
          }}
          transition={{ duration: 0.1, ease: "linear" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mode === "video" ? VIDEO_BG : IMAGE_BG}
            alt=""
            style={{
              width:          "100%",
              height:         "100%",
              objectFit:      "cover",
              objectPosition: "center",
              display:        "block",
            }}
          />
          {/* Black tint overlay 20% */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.20)" }} />
        </motion.div>

        {/* ── Top-right media switch ── */}
        <div
          style={{
            position:       "fixed",
            top:            16,
            right:          16,
            zIndex:         100,
            display:        "flex",
            flexDirection:  "row",
            alignItems:     "center",
            padding:        "6px",
            borderRadius:   "12px",
            border:         "1px solid rgba(255,255,255,0.2)",
            background:     "rgba(0,0,0,0.25)",
            backdropFilter: "blur(16px)",
            boxShadow:      "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {(["video", "image"] as MediaMode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  padding:      "10px 20px",
                  borderRadius: "8px",
                  fontSize:     "14px",
                  fontWeight:   500,
                  border:       "none",
                  cursor:       "pointer",
                  transition:   "all 300ms",
                  background:   active ? "#fff" : "transparent",
                  color:        active ? "#000" : "rgba(255,255,255,0.7)",
                  boxShadow:    active ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                  fontFamily:   "inherit",
                }}
              >
                {m === "video" ? "Video" : "Image"}
              </button>
            );
          })}
        </div>

        {/* ── Title (above media, pointer-events none) ── */}
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
          <motion.span
            style={{
              display:       "block",
              fontSize:      "clamp(2.5rem, 6vw, 6rem)",
              fontWeight:    700,
              lineHeight:    0.9,
              letterSpacing: "-0.06em",
              textAlign:     "center",
              color:         "#dbeafe",  /* blue-100 */
              x:             `-${titleX}vw`,
              willChange:    "transform",
            }}
            transition={{ duration: 0.1, ease: "linear" }}
          >
            {line1}
          </motion.span>
          <motion.span
            style={{
              display:       "block",
              fontSize:      "clamp(2.5rem, 6vw, 6rem)",
              fontWeight:    700,
              lineHeight:    0.9,
              letterSpacing: "-0.06em",
              textAlign:     "center",
              color:         "#dbeafe",
              x:             `${titleX}vw`,
              willChange:    "transform",
            }}
            transition={{ duration: 0.1, ease: "linear" }}
          >
            {line2}
          </motion.span>
        </div>

        {/* ── Central media card ── */}
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
            boxShadow:    "0 30px 100px rgba(0,0,0,0.42)",
            zIndex:       10,
          }}
        >
          {/* Media */}
          {mode === "video" ? (
            <video
              key={VIDEO_URL}
              src={VIDEO_URL}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{
                width:          "100%",
                height:         "100%",
                objectFit:      "cover",
                display:        "block",
                pointerEvents:  "none",
                background:     "transparent",
              }}
              disablePictureInPicture
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={IMAGE_SRC}
              src={IMAGE_SRC}
              alt=""
              style={{
                width:         "100%",
                height:        "100%",
                objectFit:     "cover",
                display:       "block",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Video/image overlay */}
          <div
            style={{
              position:   "absolute",
              inset:      0,
              background: `rgba(0,0,0,${videoOverlayOpacity})`,
              transition: "background 0.1s linear",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* ── Scroll indicator ── */}
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
              <div
                style={{
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            "12px",
                  color:          "#fff",
                }}
              >
                {/* SCROLL label */}
                <span
                  style={{
                    fontSize:      "11px",
                    fontWeight:    600,
                    textTransform: "uppercase",
                    letterSpacing: "0.32em",
                    textAlign:     "center",
                    color:         "#fff",
                  }}
                >
                  SCROLL
                </span>

                {/* Mouse outline */}
                <div
                  style={{
                    width:          "28px",
                    height:         "44px",
                    border:         "1px solid rgba(255,255,255,0.5)",
                    borderRadius:   "999px",
                    padding:        "6px",
                    display:        "flex",
                    justifyContent: "center",
                  }}
                >
                  {/* Animated dot */}
                  <motion.div
                    animate={{
                      y:       [0, 20, 0],
                      opacity: [0.35, 1, 0.35],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat:   Infinity,
                      ease:     "easeInOut",
                    }}
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

      {/* ══════════ CONTENT SECTION ══════════ */}
      <motion.section
        animate={expanded
          ? { opacity: 1, y: 0, pointerEvents: "auto" as const }
          : { opacity: 0, y: 40, pointerEvents: "none" as const }
        }
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:    "#fff",
          width:         "100%",
        }}
      >
        <div
          style={{
            maxWidth:  "896px",
            margin:    "0 auto",
            padding:   isMobile ? "48px 32px" : "96px 64px",
          }}
        >
          {/* Label */}
          <p
            style={{
              fontSize:      "12px",
              fontWeight:    600,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color:         "rgba(0,0,0,0.45)",
              marginBottom:  "16px",
            }}
          >
            ABOUT THE EXPERIENCE
          </p>

          {/* Heading */}
          <h2
            style={{
              fontSize:      isMobile ? "36px" : "60px",
              fontWeight:    600,
              letterSpacing: "-0.05em",
              color:         "#000",
              marginBottom:  "32px",
              maxWidth:      "768px",
              lineHeight:    1.1,
            }}
          >
            A visual story that unfolds through movement.
          </h2>

          {/* Two-column text */}
          <div
            style={{
              display:             isMobile ? "block" : "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:                 "32px",
            }}
          >
            <p
              style={{
                fontSize:     "18px",
                lineHeight:   "32px",
                color:        "rgba(0,0,0,0.70)",
                marginBottom: isMobile ? "24px" : 0,
              }}
            >
              {mode === "video"
                ? "This interactive hero transforms a focused visual moment into a full-screen cinematic experience. Scrolling expands the media while the surrounding typography separates, allowing the visual to take over the page."
                : "The same cinematic expansion works with still imagery, transforming a compact editorial frame into an immersive visual environment controlled directly by the viewer."}
            </p>
            <p
              style={{
                fontSize:   "18px",
                lineHeight: "32px",
                color:      "rgba(0,0,0,0.70)",
              }}
            >
              {mode === "video"
                ? "Use this interaction for campaign films, product launches, editorial stories, portfolios, immersive case studies or premium landing-page introductions."
                : "This version is ideal for photography portfolios, destinations, architecture projects, visual essays and high-end creative campaigns."}
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              marginTop:  "80px",
              height:     "1px",
              background: "rgba(0,0,0,0.10)",
            }}
          />

          {/* Metadata three columns */}
          <div
            style={{
              display:             isMobile ? "block" : "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap:                 "40px",
              padding:             "64px 0",
            }}
          >
            {[
              { label: "INTERACTION", value: "Scroll controlled" },
              { label: "EXPERIENCE",  value: "Fully responsive" },
              { label: "MEDIA",       value: mode === "video" ? "Video" : "Image" },
            ].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: isMobile ? "40px" : 0 }}>
                <p
                  style={{
                    fontSize:      "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    color:         "rgba(0,0,0,0.40)",
                    marginBottom:  "12px",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize:   "18px",
                    fontWeight: 500,
                    color:      "#000",
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
