import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Crea8or — The Business OS for Creative Professionals";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#07080d",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient Glows */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.35), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "10%",
            width: "500px",
            height: "300px",
            background: "radial-gradient(ellipse at center, rgba(6, 182, 212, 0.2), transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Content Box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 60px",
            zIndex: 10,
          }}
        >
          {/* Logo Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "10px 24px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              8
            </div>
            <span
              style={{
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: "bold",
                letterSpacing: "-0.5px",
              }}
            >
              Crea<span style={{ color: "#a78bfa" }}>8</span>or OS
            </span>
          </div>

          {/* Hero Headline */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1.15,
              marginBottom: "24px",
              maxWidth: "1000px",
            }}
          >
            The Operating System for Creative Professionals
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              maxWidth: "850px",
              lineHeight: 1.4,
              marginBottom: "44px",
            }}
          >
            Turn inquiries into paid bookings. Frame-accurate video reviews, 4K galleries, digital call sheets, and instant Paystack settlements.
          </div>

          {/* Feature Badges Bar */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              "⚡ Studio Automations",
              "🎬 Digital Call Sheets",
              "📸 4K Proofing Galleries",
              "💳 Paystack Payments",
              "🎥 Frame-Accurate Reviews",
            ].map((badge, idx) => (
              <div
                key={idx}
                style={{
                  padding: "8px 18px",
                  borderRadius: "12px",
                  background: "rgba(139, 92, 246, 0.12)",
                  border: "1px solid rgba(139, 92, 246, 0.25)",
                  color: "#c4b5fd",
                  fontSize: "15px",
                  fontWeight: 600,
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
