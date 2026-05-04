import type { ReactNode } from "react";

const LOGO_BARS = [5, 9, 14, 11, 8, 13, 9, 6];

const DECO_BARS = [
  18, 32, 48, 38, 55, 42, 65, 52, 38, 72, 45, 62, 35, 55, 68, 42, 58, 30, 65,
  48, 72, 38, 55, 42, 65, 48, 35, 58, 45, 68, 38, 52, 72, 45, 38, 62, 28, 55,
  65, 42, 58, 35, 72, 48, 38, 65, 42, 55, 32, 68, 45, 38, 58, 72, 42, 55, 38,
  65, 48, 35,
];

const FEATURES = [
  "AI music & song generation",
  "Professional stem separation",
  "Beat-aware audio editing",
  "Platform-targeted mastering",
  "Album composer with AI scripts",
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen w-full"
      style={{ background: "#0a0a0a", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between flex-shrink-0 relative overflow-hidden"
        style={{ width: 480, borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 15% 55%, rgba(232,160,85,0.09) 0%, transparent 58%)",
          }}
        />

        {/* Wordmark */}
        <div className="relative z-10 p-10">
          <div className="flex items-start gap-2.5">
            <div className="flex items-end gap-[2px]" style={{ height: 20, marginTop: 4 }}>
              {LOGO_BARS.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: h,
                    background: "#e8a055",
                    borderRadius: 2,
                    opacity: 0.9,
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 22,
                  fontWeight: 300,
                  color: "#eeeeee",
                  letterSpacing: "-0.3px",
                  lineHeight: 1,
                }}
              >
                AudioWeave
              </span>
              <p
                style={{
                  fontSize: 10,
                  color: "#505050",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: 3,
                }}
              >
                Studio
              </p>
            </div>
          </div>
        </div>

        {/* Tagline + features */}
        <div className="relative z-10 px-10">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 44,
              fontWeight: 300,
              lineHeight: 1.12,
              letterSpacing: "-0.5px",
              color: "#eeeeee",
              marginBottom: 16,
            }}
          >
            Create music
            <br />
            with the power
            <br />
            of <span style={{ color: "#e8a055" }}>AI</span>
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#888888",
              lineHeight: 1.65,
              maxWidth: 310,
              marginBottom: 28,
            }}
          >
            Generate, edit, and master professional-quality audio — songs,
            soundtracks, stem separations, and more.
          </p>

          <div className="flex flex-col gap-[10px]">
            {FEATURES.map((feat) => (
              <div key={feat} className="flex items-center gap-2.5">
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#e8a055",
                    flexShrink: 0,
                    opacity: 0.75,
                  }}
                />
                <span style={{ fontSize: 13, color: "#888888" }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="relative z-10 px-10 pb-8">
          <p style={{ fontSize: 11, color: "#505050" }}>© 2026 AudioWeave Studio</p>
        </div>

        {/* Decorative waveform */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-end pointer-events-none px-6 gap-[2px]"
          style={{ height: 80, opacity: 0.09 }}
        >
          {DECO_BARS.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${(h / 72) * 80}px`,
                background: "#e8a055",
                borderRadius: "2px 2px 0 0",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
