"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Seed-based pseudo-random for deterministic waveform bars ─── */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* ─── Scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Typing animation hook ─── */
const PROMPTS = [
  "a chill lo-fi beat with warm piano and rain in the background…",
  "cinematic orchestral, slow build, distant choir, dawn breaking…",
  "punchy 30-second EDM drop for a TikTok edit",
  "melancholic solo piano in A minor, intimate close-mic feel",
  "upbeat indie-pop, hopeful, summer road-trip, conversational",
  "dark synthwave, 110 BPM, neon city, slow chase scene",
  "old wooden door creaking open, slight echo, dusty room",
];

function useTyping() {
  const [text, setText] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing");
  const charRef = useRef(0);

  useEffect(() => {
    const target = PROMPTS[promptIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (charRef.current < target.length) {
        timeout = setTimeout(() => {
          charRef.current++;
          setText(target.slice(0, charRef.current));
        }, 38);
      } else {
        timeout = setTimeout(() => setPhase("pause"), 2200);
      }
    } else if (phase === "pause") {
      timeout = setTimeout(() => setPhase("erasing"), 400);
    } else {
      if (charRef.current > 0) {
        timeout = setTimeout(() => {
          charRef.current--;
          setText(target.slice(0, charRef.current));
        }, 18);
      } else {
        setPromptIdx((i) => (i + 1) % PROMPTS.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [text, phase, promptIdx]);

  return text;
}

/* ─── Waveform bars ─── */
const rand = makeRng(7);
const HERO_BARS = Array.from({ length: 80 }, (_, i) => {
  const r = rand();
  const heightPct = 0.15 + r * 0.85;
  const played = i / 80 < 0.28;
  return { heightPct, played, dur: 0.7 + (i % 5) * 0.14, del: (i % 11) * 0.07 };
});

/* ─── Reveal wrapper ─── */
function Reveal({
  children,
  dir = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  dir?: "up" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  const anim =
    dir === "left" ? "reveal-left" : dir === "right" ? "reveal-right" : "reveal-up";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        animation: visible
          ? `${anim} 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}s both`
          : "none",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--aw-accent)",
        marginBottom: 16,
      }}
    >
      {children}
    </p>
  );
}

/* ─── Section title ─── */
function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 300,
        fontSize: "clamp(40px,5.5vw,72px)",
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color: "var(--aw-text)",
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

/* ─── Sub text ─── */
function Sub({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p
      style={{
        fontSize: 17,
        color: "var(--aw-text-2)",
        lineHeight: 1.65,
        maxWidth: 600,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/* ─── Section wrapper ─── */
function Section({
  id,
  children,
  style,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={className}
      style={{ padding: "100px 40px", maxWidth: 1280, margin: "0 auto", ...style }}
    >
      {children}
    </section>
  );
}

/* ──────────────────────────────────────────────
   NAV
─────────────────────────────────────────────── */
function Nav({ scrolled }: { scrolled: boolean }) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "18px 40px",
        display: "flex",
        alignItems: "center",
        gap: 40,
        backdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
        background: scrolled ? "rgba(10,10,10,0.8)" : "rgba(10,10,10,0.55)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid transparent",
        transition: "all 0.3s",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, var(--aw-accent), #a070e0)",
            boxShadow: "0 2px 12px rgba(232,160,85,0.3)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M2 12h2l3-8 3 16 3-12 3 8 2-4h4" />
          </svg>
        </div>
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: "var(--aw-text)",
            fontFamily: "var(--font-body)",
            letterSpacing: "-0.02em",
          }}
        >
          AudioWeave
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 28, flex: 1 }}>
        {["Features", "How it works", "Pricing", "Showcase"].map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
            style={{
              fontSize: 13,
              color: "var(--aw-text-2)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--aw-text)")}
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "var(--aw-text-2)")
            }
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link
          href="/sign-in"
          style={{
            fontSize: 13,
            color: "var(--aw-text-2)",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: 9999,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--aw-text)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--aw-text-2)")
          }
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#000",
            background: "var(--aw-accent)",
            padding: "9px 18px",
            borderRadius: 9999,
            textDecoration: "none",
            boxShadow: "0 2px 12px rgba(232,160,85,0.25)",
            transition: "opacity 0.15s",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Start free
        </Link>
      </div>
    </nav>
  );
}

/* ──────────────────────────────────────────────
   HERO
─────────────────────────────────────────────── */
function Hero() {
  const typedText = useTyping();

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "140px 40px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background radial gradients */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 50% 35%, rgba(232,160,85,0.14), transparent 60%),
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(160,112,224,0.06), transparent 70%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* H1 */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 300,
          fontSize: "clamp(56px,9vw,110px)",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: "var(--aw-text)",
          marginBottom: 28,
          animation: "heroIn 1.2s cubic-bezier(0.22,1,0.36,1) 0s both",
          maxWidth: 900,
        }}
      >
        The studio where
        <br />
        <em style={{ fontStyle: "italic", color: "var(--aw-accent)" }}>music</em> is woven
        <br />
        <span
          style={{
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(238,238,238,0.4)",
            fontFamily: "var(--font-display)",
          }}
        >
          from
        </span>{" "}
        words.
      </h1>

      {/* Subheading */}
      <p
        style={{
          fontSize: 17,
          color: "var(--aw-text-2)",
          lineHeight: 1.65,
          maxWidth: 580,
          marginBottom: 36,
          animation: "heroIn 1.2s cubic-bezier(0.22,1,0.36,1) 0.15s both",
        }}
      >
        Generate, edit, and master full tracks, lyrics, sound effects, and entire
        albums — all from a single prompt-driven studio. No DAW required.
      </p>

      {/* CTA buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 48,
          animation: "heroIn 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s both",
        }}
      >
        <Link
          href="/sign-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 26px",
            borderRadius: 9999,
            background: "var(--aw-accent)",
            color: "#000",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            boxShadow: "0 2px 20px rgba(232,160,85,0.35)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 28px rgba(232,160,85,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 20px rgba(232,160,85,0.35)";
          }}
        >
          ✦ Make your first track
        </Link>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 26px",
            borderRadius: 9999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.11)",
            color: "var(--aw-text)",
            fontSize: 14,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")
          }
        >
          ▶ Listen to demo
        </button>
      </div>

      {/* Prompt mock */}
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          background: "rgba(13,13,13,0.85)",
          border: "1px solid rgba(255,255,255,0.11)",
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
          textAlign: "left",
          animation: "heroIn 1.2s cubic-bezier(0.22,1,0.36,1) 0.45s both",
          backdropFilter: "blur(16px)",
        }}
      >
        <p style={{ fontSize: 14, color: "var(--aw-text)", lineHeight: 1.55, minHeight: 48 }}>
          {typedText}
          <span
            style={{
              display: "inline-block",
              width: 1,
              height: 16,
              background: "var(--aw-accent)",
              verticalAlign: -2,
              animation: "blink 1s steps(2) infinite",
              marginLeft: 1,
            }}
          />
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 14,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { label: "★ Enhance", active: false },
              { label: "✦ Quick Idea", active: false },
            ].map(({ label, active }) => (
              <span
                key={label}
                style={{
                  padding: "5px 11px",
                  borderRadius: 9999,
                  fontSize: 11,
                  background: active ? "rgba(232,160,85,0.18)" : "rgba(255,255,255,0.05)",
                  color: active ? "var(--aw-accent)" : "var(--aw-text-2)",
                  border: `1px solid ${active ? "rgba(255,180,80,0.15)" : "rgba(255,255,255,0.07)"}`,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {label}
              </span>
            ))}
          </div>
          <button
            style={{
              background: "var(--aw-accent)",
              color: "#000",
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 9999,
              fontSize: 12,
              boxShadow: "0 2px 12px rgba(232,160,85,0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              border: "none",
            }}
          >
            ★ Generate
          </button>
        </div>
      </div>

      {/* Waveform player mock */}
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          background: "rgba(22,22,22,0.9)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 14,
          padding: "14px 18px",
          animation: "heroIn 1.2s cubic-bezier(0.22,1,0.36,1) 0.55s both",
          backdropFilter: "blur(16px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--aw-text)", letterSpacing: "-0.01em" }}>
              Thorn Crown
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--aw-text-2)", letterSpacing: "0.05em" }}>
              AudioWeave · Music · Cinematic, Orchestral
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {[
              { label: "Music", accent: true },
              { label: "Generated · 02:34", accent: false },
              { label: "Mastered −14 LUFS", accent: false },
            ].map(({ label, accent }) => (
              <span
                key={label}
                style={{
                  padding: "3px 8px",
                  borderRadius: 9999,
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  background: accent ? "rgba(232,160,85,0.18)" : "rgba(255,255,255,0.05)",
                  color: accent ? "var(--aw-accent)" : "var(--aw-text-2)",
                  border: `1px solid ${accent ? "rgba(255,180,80,0.15)" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Waveform bars */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, height: 56, marginBottom: 8 }}>
          {HERO_BARS.map((bar, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${bar.heightPct * 100}%`,
                borderRadius: 2,
                background: bar.played ? "linear-gradient(180deg, #e8a055, #c87a30)" : "rgba(255,255,255,0.12)",
                transformOrigin: "center",
                animation: `wavepulse ${bar.dur}s ease-in-out ${bar.del}s infinite`,
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <div style={{ display: "flex", gap: 14 }}>
            {["92 BPM", "A minor"].map((tag) => (
              <span key={tag} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--aw-text-2)" }}>
                {tag}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--aw-green)", display: "inline-block" }} />
            {["STEMS", "REMIX", "DOWNLOAD"].map((label) => (
              <span
                key={label}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--aw-text-2)",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   TRUST STRIP
─────────────────────────────────────────────── */
function TrustStrip() {
  return (
    <div
      style={{
        padding: "32px 40px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "var(--aw-surface)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 40,
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--aw-text-3)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Trusted by makers at
        </span>
        {["Pixelhouse", "North Star FM", "Neon Tape", "Loopfield", "Quiet River", "Caldera Studios"].map(
          (name) => (
            <span
              key={name}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 15,
                color: "var(--aw-text-3)",
                letterSpacing: "-0.01em",
                fontStyle: "italic",
              }}
            >
              {name}
            </span>
          )
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   THREE PILLARS
─────────────────────────────────────────────── */
const PILLARS = [
  {
    title: "Generation",
    color: "var(--aw-accent)",
    bgColor: "rgba(232,160,85,0.18)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    ),
    desc: "Turn a sentence into a song. Or a story into an album. Or a photo into a soundtrack.",
    features: [
      { text: "Music Generation", label: "2 takes" },
      { text: "Lyrics Generation", label: "style + tone" },
      { text: "Sound FX", label: "any length" },
      { text: "Album Generation", label: "1–20 tracks" },
      { text: "Image to Song", label: "vibe match" },
      { text: "Inpaint · Extend · Remix", label: "refine" },
    ],
  },
  {
    title: "Editing",
    color: "var(--aw-purple)",
    bgColor: "rgba(160,112,224,0.18)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h3l3-9 4 18 3-9h5" />
      </svg>
    ),
    desc: "Shape audio in the browser with a live waveform — no DAW, no plugins, no friction.",
    features: [
      { text: "Cut · Fade · Loop · Split", label: "core" },
      { text: "Mix · Overlay · EQ", label: "polish" },
      { text: "AI Analog Warmth", label: "7 stages" },
      { text: "AI Style Enhancer", label: "6 presets" },
      { text: "AI Music Editing", label: "prompt + length" },
      { text: "Stem Separation", label: "4 stems" },
    ],
  },
  {
    title: "Production",
    color: "var(--aw-green)",
    bgColor: "rgba(96,192,144,0.18)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
    desc: "Master to platform spec. Match a reference. Ship a podcast. All in a few clicks.",
    features: [
      { text: "Platform Mastering", label: "7 targets" },
      { text: "Reference Track Match", label: "vibe lock" },
      { text: "Podcast Producer", label: "one-stop" },
      { text: "Loudness · Tone · Width", label: "tuned" },
      { text: "Export MP3 / WAV", label: "broadcast" },
      { text: "Project + Library", label: "synced" },
    ],
  },
];

function PillarCard({ pillar, idx }: { pillar: typeof PILLARS[0]; idx: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal dir="up" delay={idx * 0.1}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "var(--aw-card-hi)" : "var(--aw-card)",
          border: `1px solid ${hovered ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 20,
          padding: 32,
          height: "100%",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: hovered
            ? "0 0 0 0.5px rgba(255,255,255,0.1) inset, 0 12px 40px rgba(0,0,0,0.4)"
            : "0 0 0 0.5px rgba(255,255,255,0.05) inset, 0 1px 2px rgba(0,0,0,0.4), 0 8px 30px rgba(0,0,0,0.25)",
          cursor: "default",
          transform: hovered ? "translateY(-3px)" : "none",
        }}
      >
        {/* Top edge glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${pillar.color}, transparent)`,
            opacity: hovered ? 0.8 : 0.4,
            transition: "opacity 0.3s",
          }}
        />

        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: pillar.bgColor,
            color: pillar.color,
            display: "grid",
            placeItems: "center",
            marginBottom: 22,
          }}
        >
          {pillar.icon}
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 30,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--aw-text)",
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          {pillar.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: 14,
            color: "var(--aw-text-2)",
            lineHeight: 1.55,
            marginBottom: 24,
          }}
        >
          {pillar.desc}
        </p>

        {/* Feature list */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {pillar.features.map((feat, fi) => (
            <li
              key={feat.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderTop: fi === 0 ? "none" : "1px solid rgba(255,255,255,0.07)",
                fontSize: 13,
                color: "var(--aw-text)",
                transition: `all 0.2s`,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: pillar.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>{feat.text}</span>
              <small
                style={{
                  color: "var(--aw-text-3)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginLeft: "auto",
                }}
              >
                {feat.label}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}



function ThreePillars() {
  return (
    <section
      id="features"
      style={{
        padding: "100px 40px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "var(--aw-surface)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow>// The full pipeline</Eyebrow>
            <SectionTitle>
              Three rooms in <em>one studio</em>.
            </SectionTitle>
            <Sub style={{ maxWidth: 560, margin: "20px auto 0", textAlign: "center" }}>
              From the spark of an idea to a release-ready master. AudioWeave handles every step a
              producer used to need a dozen tools for.
            </Sub>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {PILLARS.map((pillar, idx) => (
            <PillarCard key={pillar.title} pillar={pillar} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   CAPABILITIES MARQUEE
─────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "Music Generation",
  "Lyrics",
  "Sound FX",
  "Album Composer",
  "Stem Separation",
  "AI Music Editing",
  "Platform Mastering",
  "Reference Match",
  "Analog Warmth",
  "Podcast Producer",
  "Inpaint & Extend",
  "Style Enhancer",
];

function CapabilitiesMarquee() {
  return (
    <div
      style={{
        padding: "60px 0",
        background: "var(--aw-surface)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: "marquee-scroll 60s linear infinite",
        }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 56,
              fontWeight: 300,
              letterSpacing: "-0.02em",
              color: "var(--aw-text-3)",
              padding: "0 40px",
              whiteSpace: "nowrap",
            }}
          >
            {item}
            <span
              style={{
                color: "var(--aw-accent)",
                marginLeft: 40,
                fontSize: 24,
                verticalAlign: "middle",
              }}
            >
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   FEATURE SECTION — reusable layout
─────────────────────────────────────────────── */
function FeatureSection({
  id,
  eyebrow,
  title,
  sub,
  features,
  reverse = false,
  mock,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
  features: { icon: React.ReactNode; title: string; desc: string }[];
  reverse?: boolean;
  mock: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{ padding: "120px 40px", maxWidth: 1280, margin: "0 auto" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.1fr",
          gap: 80,
          alignItems: "center",
          direction: reverse ? "rtl" : "ltr",
        }}
      >
        <div style={{ direction: "ltr" }}>
          <Reveal dir={reverse ? "right" : "left"}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(36px, 4.5vw, 60px)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: "var(--aw-text)",
                marginBottom: 18,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                color: "var(--aw-text-2)",
                fontSize: 15,
                lineHeight: 1.6,
                marginBottom: 26,
                maxWidth: 460,
              }}
            >
              {sub}
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                maxWidth: 480,
              }}
            >
              {features.map((feat, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    transition: "all 0.18s",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(232,160,85,0.18)",
                      color: "var(--aw-accent)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {feat.icon}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--aw-text)",
                        marginBottom: 2,
                      }}
                    >
                      {feat.title}
                    </strong>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--aw-text-2)",
                        lineHeight: 1.5,
                      }}
                    >
                      {feat.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <div style={{ direction: "ltr" }}>
          <Reveal dir={reverse ? "left" : "right"} delay={0.1}>
            {mock}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Mock card base ─── */
function MockCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--aw-card)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 16,
        padding: 20,
        boxShadow:
          "0 0 0 0.5px rgba(255,255,255,0.05) inset, 0 4px 32px rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   FEATURE: Generation
─────────────────────────────────────────────── */
const STYLE_TAGS = [
  "Cinematic",
  "Orchestral",
  "A Minor",
  "Slow Build",
  "Ambient",
  "Electronic",
  "Choir",
  "Brushed Percussion",
  "Emotional",
  "Score",
];

function GenerationMock() {
  return (
    <MockCard>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--aw-text-2)",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--aw-accent)",
            display: "inline-block",
          }}
        />
        Prompt
      </div>
      <div
        style={{
          background: "rgba(13,13,13,0.7)",
          border: "1px solid rgba(255,255,255,0.11)",
          borderRadius: 10,
          padding: 14,
          marginBottom: 14,
          fontSize: 13,
          color: "var(--aw-text)",
          lineHeight: 1.55,
        }}
      >
        A cinematic orchestral piece in A minor — slow build, distant choir, brushed percussion, the feeling of dawn breaking over an empty city
        <span
          style={{
            display: "inline-block",
            width: 1,
            height: 14,
            background: "var(--aw-accent)",
            verticalAlign: -2,
            animation: "blink 1s steps(2) infinite",
            marginLeft: 1,
          }}
        />
      </div>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--aw-text-2)",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--aw-accent)",
            display: "inline-block",
          }}
        />
        Exclude
      </div>
      <div
        style={{
          background: "rgba(13,13,13,0.7)",
          border: "1px solid rgba(255,255,255,0.11)",
          borderRadius: 10,
          padding: 14,
          marginBottom: 14,
          fontSize: 13,
          color: "var(--aw-text-3)",
          lineHeight: 1.55,
        }}
      >
        vocals, drums, bright colors, fast tempo
      </div>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--aw-text-2)",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--aw-accent)",
            display: "inline-block",
          }}
        />
        Style
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {STYLE_TAGS.map((tag, i) => (
          <span
            key={tag}
            style={{
              padding: "5px 11px",
              borderRadius: 9999,
              fontSize: 11,
              background: i < 2 ? "rgba(232,160,85,0.18)" : "rgba(255,255,255,0.04)",
              color: i < 2 ? "var(--aw-accent)" : "var(--aw-text-2)",
              border: `1px solid ${i < 2 ? "rgba(255,180,80,0.15)" : "rgba(255,255,255,0.07)"}`,
              transition: "all 0.15s",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          style={{
            background: "var(--aw-accent)",
            color: "#000",
            fontWeight: 600,
            padding: "9px 18px",
            borderRadius: 9999,
            fontSize: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 12px rgba(232,160,85,0.3)",
          }}
        >
          ★ Generate
        </button>
      </div>
    </MockCard>
  );
}

/* ──────────────────────────────────────────────
   FEATURE: Stem Separation
─────────────────────────────────────────────── */
const STEMS = [
  { label: "Vocals", color: "var(--aw-accent)" },
  { label: "Drums", color: "var(--aw-blue)" },
  { label: "Bass", color: "var(--aw-green)" },
  { label: "Other", color: "var(--aw-purple)" },
];

function StemMock() {
  return (
    <MockCard>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: "var(--aw-text)", fontWeight: 500 }}>
            Thorn Crown (Instrumental)
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--aw-text-2)",
              marginTop: 3,
            }}
          >
            4 stems · 04:15 · Ready
          </div>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "var(--aw-green)",
            background: "rgba(96,192,144,0.12)",
            border: "1px solid rgba(96,192,144,0.2)",
            padding: "3px 8px",
            borderRadius: 4,
          }}
        >
          SEPARATED
        </span>
      </div>

      {STEMS.map((stem) => (
        <div
          key={stem.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: `${stem.color}22`,
              border: `1px solid ${stem.color}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: stem.color,
              flexShrink: 0,
            }}
          >
            ♪
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "var(--aw-text)", marginBottom: 4 }}>
              {stem.label}
            </div>
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${50 + Math.random() * 40}%`,
                  background: stem.color,
                  borderRadius: 2,
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
          <button
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "var(--aw-text-2)",
              cursor: "pointer",
            }}
          >
            ↓
          </button>
        </div>
      ))}
    </MockCard>
  );
}

/* ──────────────────────────────────────────────
   FEATURE: Album Generation
─────────────────────────────────────────────── */
const ALBUM_TRACKS = [
  { num: 1, title: "SCENE 01: The Departure", type: "Score", bpm: "92 BPM", note: "Calm opening" },
  { num: 2, title: "SCENE 02: North of the Beam", type: "Score", bpm: "88 BPM", note: "Hopeful, synth-led" },
  { num: 3, title: "SCENE 03: Storm in the Walls", type: "Score", bpm: "120 BPM", note: "Cinematic, percussive" },
  { num: 4, title: "SCENE 04: A Letter Half-Written", type: "Score", bpm: "70 BPM", note: "Intimate, piano" },
  { num: 5, title: "SCENE 05: The Final Watch", type: "Score", bpm: "105 BPM", note: "Drifting, ambient" },
];

function AlbumMock() {
  return (
    <MockCard>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 16,
              letterSpacing: "-0.01em",
              color: "var(--aw-text)",
            }}
          >
            The Lighthouse Cycles
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--aw-text-2)",
              marginTop: 3,
            }}
          >
            8 scenes · 28 min · Cinematic
          </div>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "var(--aw-accent)",
            background: "rgba(232,160,85,0.12)",
            border: "1px solid rgba(255,180,80,0.15)",
            padding: "3px 8px",
            borderRadius: 4,
          }}
        >
          GENERATING
        </span>
      </div>

      {ALBUM_TRACKS.map((track) => (
        <div
          key={track.num}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "7px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--aw-text-3)",
              width: 16,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {track.num}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--aw-text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {track.title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--aw-text-3)",
                marginTop: 2,
              }}
            >
              {track.type} · {track.bpm} · {track.note}
            </div>
          </div>
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background:
                track.num <= 2
                  ? "rgba(96,192,144,0.2)"
                  : track.num === 3
                    ? "rgba(232,160,85,0.15)"
                    : "rgba(255,255,255,0.04)",
              border: `1px solid ${track.num <= 2 ? "rgba(96,192,144,0.3)" : track.num === 3 ? "rgba(255,180,80,0.2)" : "rgba(255,255,255,0.08)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              color:
                track.num <= 2
                  ? "var(--aw-green)"
                  : track.num === 3
                    ? "var(--aw-accent)"
                    : "var(--aw-text-3)",
              flexShrink: 0,
            }}
          >
            {track.num <= 2 ? "✓" : track.num === 3 ? "⟳" : "·"}
          </span>
        </div>
      ))}
    </MockCard>
  );
}

/* ──────────────────────────────────────────────
   FEATURE: AI Music Editing
─────────────────────────────────────────────── */
function AIEditMock() {
  return (
    <MockCard>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--aw-text-2)",
          marginBottom: 10,
        }}
      >
        THE VIBE
      </div>
      <div
        style={{
          background: "rgba(13,13,13,0.7)",
          border: "1px solid rgba(255,255,255,0.11)",
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 16,
          fontSize: 13,
          color: "var(--aw-text)",
        }}
      >
        punchy 30-second drop for my DJ mix
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--aw-text-3)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            THE LENGTH
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-text)" }}>30s</div>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--aw-text-3)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ENERGY
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--aw-text)" }}>High</div>
        </div>
      </div>

      <div
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          background: "rgba(232,160,85,0.08)",
          border: "1px solid rgba(232,160,85,0.15)",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "var(--aw-text-2)" }}>Optimizing cut...</span>
          <span style={{ fontSize: 11, color: "var(--aw-accent)", fontFamily: "var(--font-mono)" }}>
            88%
          </span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
          <div
            style={{
              height: "100%",
              width: "88%",
              background: "var(--aw-accent)",
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      <button
        style={{
          width: "100%",
          background: "var(--aw-accent)",
          color: "#000",
          fontWeight: 600,
          padding: "10px",
          borderRadius: 8,
          fontSize: 12,
          border: "none",
          cursor: "pointer",
          marginTop: 16,
          boxShadow: "0 2px 12px rgba(232,160,85,0.25)",
        }}
      >
        ★ Use this 30s clip
      </button>
    </MockCard>
  );
}

/* ──────────────────────────────────────────────
   FEATURE: Platform Mastering
─────────────────────────────────────────────── */
const PLATFORMS = [
  { name: "Spotify", lufs: "−14 LUFS" },
  { name: "YouTube", lufs: "−14 LUFS" },
  { name: "TikTok / Reels", lufs: "−13 LUFS" },
  { name: "Podcast", lufs: "−16 LUFS" },
  { name: "Apple Music", lufs: "−14 LUFS" },
  { name: "SoundCloud", lufs: "−14 LUFS" },
];

function MasteringMock() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % PLATFORMS.length);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <MockCard>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--aw-text-2)",
          marginBottom: 12,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        PLATFORM
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
        {PLATFORMS.map((p, i) => {
          const active = i === activeIdx;
          return (
            <div
              key={p.name}
              onClick={() => setActiveIdx(i)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 8,
                background: active ? "rgba(232,160,85,0.1)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${active ? "rgba(255,180,80,0.2)" : "rgba(255,255,255,0.06)"}`,
                cursor: "pointer",
                transition: "background 0.25s, border-color 0.25s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: active ? "var(--aw-accent)" : "rgba(255,255,255,0.15)",
                    flexShrink: 0,
                    transition: "background 0.25s",
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: active ? "var(--aw-text)" : "var(--aw-text-2)",
                    transition: "color 0.25s",
                  }}
                >
                  {p.name}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: active ? "var(--aw-accent)" : "var(--aw-text-3)",
                  transition: "color 0.25s",
                }}
              >
                {p.lufs}
              </span>
            </div>
          );
        })}
      </div>

      <button
        style={{
          width: "100%",
          background: "var(--aw-accent)",
          color: "#000",
          fontWeight: 600,
          padding: "10px",
          borderRadius: 9999,
          fontSize: 12,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          boxShadow: "0 2px 12px rgba(232,160,85,0.25)",
        }}
      >
        ★ Master Now — {PLATFORMS[activeIdx].name}
      </button>
    </MockCard>
  );
}

/* ──────────────────────────────────────────────
   WORKFLOW
─────────────────────────────────────────────── */
const WORKFLOW_STEPS = [
  {
    num: "01",
    label: "Prompt",
    title: "The Target",
    desc: "A single prompt, an image, a brief, or a script. Quick Idea and Prompt Enhancer turn a fragment into a full direction.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
    )
  },
  {
    num: "02",
    label: "Segment",
    title: "Two Takes",
    desc: "The engine returns two complete tracks per request. Pick one, remix one, or send either to Edit for surgery.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
    )
  },
  {
    num: "03",
    label: "Refine",
    title: "Shape It",
    desc: "Inpaint, extend, trim, separate stems, add warmth or genre character — all on a live waveform in your browser.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
    )
  },
  {
    num: "04",
    label: "Master",
    title: "The Star",
    desc: "Master to platform spec, match a reference track, or run the podcast pipeline. Export and you're done.",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    )
  },
];

function Workflow() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: "100px 40px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "var(--aw-surface)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow>// THE WORKFLOW</Eyebrow>
            <SectionTitle>Four steps to a release.</SectionTitle>
            <Sub style={{ maxWidth: 540, margin: "20px auto 0", textAlign: "center" }}>
              A single thread runs from prompt to master. Every step is reversible, every artifact
              stays in your library.
            </Sub>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {WORKFLOW_STEPS.map((step, i) => (
            <Reveal key={step.num} dir="up" delay={i * 0.1}>
              <div
                style={{
                  background: "var(--aw-card)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: 24,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--aw-text-3)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      color: "var(--aw-accent)",
                      fontSize: 11,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {step.icon}
                    {step.num}
                  </span>
                  <span>— {step.label}</span>
                </div>
                <h4
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    color: "var(--aw-text)",
                    marginBottom: 10,
                  }}
                >
                  {step.title}
                </h4>
                <p style={{ fontSize: 13, color: "var(--aw-text-2)", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   TESTIMONIAL
─────────────────────────────────────────────── */
function Testimonial() {
  return (
    <section style={{ padding: "100px 40px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <Eyebrow>// Field notes</Eyebrow>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <blockquote
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "clamp(24px,3.5vw,44px)",
                fontWeight: 300,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                color: "var(--aw-text)",
                marginBottom: 28,
                quotes: "none",
              }}
            >
              "I scored a six-episode podcast in an afternoon. AudioWeave wrote the prompts, the
              lyrics for the title theme, and mastered every cue. I just listened, approved, and
              shipped."
            </blockquote>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e8a055, #c97a30)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#000",
                }}
              >
                M
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--aw-text)" }}>
                  Marin Voss
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--aw-text-2)",
                  }}
                >
                  Producer · Quiet River Studios
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   SAMPLER / SHOWCASE
─────────────────────────────────────────────── */
const SAMPLES = [
  { genre: "Cinematic", bpm: "92 BPM", key: "Amin", title: "Thorn Crown", sub: "Orchestral · Slow build", color: "var(--aw-accent)", src: "/Thorn_Crown.mp3" },
  { genre: "Gothic", bpm: "110 BPM", key: "Dmin", title: "Gothic Pursuit", sub: "Dark Score · Action, tension", color: "#e06060", src: "/Gothic_Pursuit.mp3" },
  { genre: "Epic", bpm: "128 BPM", key: "Fmin", title: "Taiko Stand", sub: "Percussion · Ritual, drums", color: "var(--aw-purple)", src: "/Taiko_Stand.mp3" },
  { genre: "Pop", bpm: "102 BPM", key: "Gmaj", title: "Love Song", sub: "Song · Vocal, summer", color: "var(--aw-green)", src: "/Love_Song.mp3" },
  { genre: "Regal", bpm: "72 BPM", key: "Cmaj7", title: "Crimson Throne", sub: "Cinematic · Royal, slow", color: "var(--aw-blue)", src: "/Crimson_Throne.mp3" },
];

function Sampler() {
  const [playing, setPlaying] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (playing !== null) {
      if (!audio.src.endsWith(SAMPLES[playing].src)) {
        audio.src = SAMPLES[playing].src;
        audio.load(); // Forces browser to evaluate source
      }
      if (!isPaused) {
        audio.play().catch(e => console.error("Playback failed:", e));
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
      audio.src = "";
    }
  }, [playing, isPaused]);

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleCardClick = (i: number) => {
    if (playing === i) {
      togglePlayPause();
    } else {
      setPlaying(i);
      setIsPaused(false);
      setCurrentTime(0);
    }
  };

  return (
    <section
      id="showcase"
      style={{
        padding: "100px 40px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "var(--aw-surface)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow>// Listen first</Eyebrow>
            <SectionTitle>A few tracks woven here.</SectionTitle>
            <Sub style={{ maxWidth: 520, margin: "20px auto 0", textAlign: "center" }}>
              Five genres, five seconds of setup, five complete tracks. Every sample was generated
              from a single prompt inside AudioWeave.
            </Sub>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 16,
          }}
        >
          {SAMPLES.map((sample, i) => {
            const isPlaying = playing === i;
            return (
              <Reveal key={sample.title} dir="up" delay={i * 0.08}>
                <div
                  style={{
                    background: "var(--aw-card)",
                    border: `1px solid ${isPlaying ? `${sample.color}33` : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 14,
                    padding: 16,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => handleCardClick(i)}
                >
                  {/* Mini waveform */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      height: 40,
                      marginBottom: 14,
                    }}
                  >
                    {Array.from({ length: 24 }, (_, j) => {
                      const progress = isPlaying ? (currentTime / duration) : 0;
                      const isPast = (j / 24) < progress;
                      const h = 0.2 + Math.sin((j * 0.7 + i * 1.3)) * 0.4 + 0.4;
                      return (
                        <div
                          key={j}
                          style={{
                            flex: 1,
                            height: `${(h * 100).toFixed(2)}%`,
                            borderRadius: 1,
                            background: isPlaying ? (isPast ? sample.color : "rgba(255,255,255,0.15)") : "rgba(255,255,255,0.15)",
                            animation: isPlaying && !isPaused && !isPast
                              ? `samplePulse ${0.5 + (j % 4) * 0.15}s ease-in-out ${j * 0.04}s infinite`
                              : "none",
                            transition: "background 0.2s",
                          }}
                        />
                      );
                    })}
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: sample.color,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {sample.genre}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      letterSpacing: "-0.01em",
                      color: "var(--aw-text)",
                      marginBottom: 4,
                      lineHeight: 1.2,
                    }}
                  >
                    {sample.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--aw-text-3)",
                      marginBottom: 10,
                    }}
                  >
                    {sample.bpm} · {sample.key}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--aw-text-2)",
                    }}
                  >
                    {sample.sub}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <button
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        background: isPlaying ? sample.color : "rgba(255,255,255,0.05)",
                        color: isPlaying ? "#000" : "var(--aw-text)",
                        border: `1px solid ${isPlaying ? "transparent" : "rgba(255,255,255,0.1)"}`,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "all 0.2s",
                      }}
                    >
                      {isPlaying ? (isPaused ? "▶ Resume" : "▐▌ Playing") : "▶ Play"}
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Global Bottom Player */}
      {playing !== null && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              width: "calc(100% - 48px)",
              maxWidth: 480,
              background: "rgba(10,10,10,0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${SAMPLES[playing].color}40`,
              borderRadius: 16,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 40px ${SAMPLES[playing].color}15`,
              animation: "heroIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both",
            }}
          >
          {/* Progress Bar Background */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.05)", borderRadius: "0 0 16px 16px", overflow: "hidden" }}>
             <div style={{ height: "100%", background: SAMPLES[playing].color, width: `${(currentTime / duration) * 100}%`, transition: "width 0.1s linear" }} />
          </div>

          <div style={{ width: 36, height: 36, borderRadius: "50%", background: SAMPLES[playing].color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
             </svg>
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
             <div style={{ fontSize: 14, fontWeight: 600, color: "var(--aw-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
               {SAMPLES[playing].title}
             </div>
             <div style={{ fontSize: 11, color: "var(--aw-text-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
               {SAMPLES[playing].sub}
             </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
             <button onClick={() => seek(-15)} style={{ background: "transparent", border: "none", color: "var(--aw-text)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>-15s</button>
             <button 
                onClick={togglePlayPause} 
                style={{ 
                  width: 36, height: 36, borderRadius: "50%", background: "var(--aw-text)", color: "#000", 
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" 
                }}
             >
                {isPaused ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>}
             </button>
             <button onClick={() => seek(15)} style={{ background: "transparent", border: "none", color: "var(--aw-text)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>+15s</button>
          </div>

          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 4px", flexShrink: 0 }} />
          
          <button onClick={() => setPlaying(null)} style={{ background: "transparent", border: "none", color: "var(--aw-text-3)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, flexShrink: 0 }}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        </div>
      )}

      <audio 
        ref={audioRef} 
        onEnded={() => setIsPaused(true)} 
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </section>
  );
}

/* ──────────────────────────────────────────────
   PRICING
─────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Studio Pass",
    tag: "Free",
    price: "$0",
    period: "/ mo",
    desc: "For trying everything and finishing your first few tracks.",
    tokens: "10,000 / month",
    features: ["All generation features", "Browser editing toolkit", "Personal use only"],
    cta: "Start free",
    href: "/sign-up",
    featured: false,
  },
  {
    name: "Producer",
    tag: "Most popular",
    price: "$24",
    period: "/ mo",
    desc: "For creators shipping a steady stream of original work.",
    tokens: "200,000 / month",
    features: [
      "Stem separation + AI Music Editing",
      "Platform mastering · all targets",
      "Commercial license",
      "Priority queue",
    ],
    cta: "Start 14-day trial",
    href: "/sign-up",
    featured: true,
  },
  {
    name: "Atelier",
    tag: "Studio",
    price: "$79",
    period: "/ mo",
    desc: "For teams scoring films, games, podcasts, and full albums.",
    tokens: "1,000,000 / month",
    features: [
      "Album Generation up to 20 tracks",
      "Reference track matching",
      "Shared projects + roles",
      "Dedicated support",
    ],
    cta: "Talk to us",
    href: "/sign-up",
    featured: false,
  },
];

function Pricing() {
  return (
    <section
      id="pricing"
      style={{
        padding: "100px 40px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow>// Pricing</Eyebrow>
            <SectionTitle>Transparent tokens. No surprises.</SectionTitle>
            <Sub style={{ maxWidth: 480, margin: "20px auto 0", textAlign: "center" }}>
              Every feature has a clear token cost. See your balance, your history, and what you
              spent — anytime.
            </Sub>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} dir="up" delay={i * 0.1}>
              <div
                style={{
                  background: plan.featured
                    ? "linear-gradient(180deg, rgba(232,160,85,0.07), var(--aw-card))"
                    : "var(--aw-card)",
                  border: `1px solid ${plan.featured ? "rgba(232,160,85,0.25)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16,
                  padding: 28,
                  position: "relative",
                  boxShadow: plan.featured
                    ? "0 0 0 1px rgba(232,160,85,0.1) inset, 0 4px 40px rgba(232,160,85,0.08)"
                    : "0 0 0 0.5px rgba(255,255,255,0.05) inset",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Tag */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      fontWeight: 400,
                      letterSpacing: "-0.02em",
                      color: "var(--aw-text)",
                    }}
                  >
                    {plan.name}
                  </h3>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: plan.featured ? "#000" : "var(--aw-text-2)",
                      background: plan.featured ? "var(--aw-accent)" : "rgba(255,255,255,0.06)",
                      padding: "3px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {plan.tag}
                  </span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 16 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 52,
                      fontWeight: 300,
                      letterSpacing: "-0.03em",
                      color: "var(--aw-text)",
                      lineHeight: 1,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--aw-text-2)", marginLeft: 4 }}>
                    {plan.period}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: "var(--aw-text-2)", lineHeight: 1.6, marginBottom: 16 }}>
                  {plan.desc}
                </p>

                {/* Tokens */}
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: plan.featured ? "var(--aw-accent)" : "var(--aw-text-3)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: plan.featured ? "var(--aw-accent)" : "var(--aw-text-2)",
                    }}
                  >
                    {plan.tokens}
                  </span>
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "5px 0",
                        fontSize: 13,
                        color: "var(--aw-text-2)",
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ color: "var(--aw-accent)", marginTop: 1, flexShrink: 0 }}>·</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    background: plan.featured ? "var(--aw-accent)" : "rgba(255,255,255,0.06)",
                    color: plan.featured ? "#000" : "var(--aw-text)",
                    border: plan.featured ? "none" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: plan.featured ? "0 2px 12px rgba(232,160,85,0.25)" : "none",
                    transition: "opacity 0.15s",
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FAQ
─────────────────────────────────────────────── */
const FAQS = [
  {
    q: "How does the token system work?",
    a: "Tokens are the currency of AudioWeave. A standard track generation costs 500 tokens. Stem separation costs 200 tokens. Your balance resets every month based on your plan.",
  },
  {
    q: "Who owns the copyright to the generated music?",
    a: "On Producer and Atelier plans, you own the full commercial copyright to everything you generate. On the Studio Pass (Free), music is for personal use only.",
  },
  {
    q: "Can I use my own samples or reference tracks?",
    a: "Yes. You can upload any audio file to use as a reference for style matching, or as a base for stem separation and AI-powered editing.",
  },
  {
    q: "Is there a limit on how many tracks I can generate?",
    a: "Only your token balance. There are no daily limits or artificial throttling. If you need more tokens, you can upgrade your plan at any time.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="questions"
      style={{
        padding: "100px 40px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "var(--aw-surface)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow>// Questions</Eyebrow>
            <SectionTitle>Things people ask first</SectionTitle>
            <Sub style={{ maxWidth: 480, margin: "20px auto 0", textAlign: "center" }}>
              Short answers to the most common questions about how AudioWeave works, what it costs,
              and what you can do with what you make.
            </Sub>
          </div>
        </Reveal>

        <div
          style={{
            maxWidth: 880,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {FAQS.map((faq, i) => (
            <Reveal key={i} dir="up" delay={i * 0.05}>
              <div
                style={{
                  background: "var(--aw-card)",
                  border: `1px solid ${open === i ? "rgba(232,160,85,0.2)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%",
                    padding: "18px 22px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{ fontSize: 15, color: "var(--aw-text)", fontWeight: 400, lineHeight: 1.4 }}
                  >
                    {faq.q}
                  </span>
                  <span
                    style={{
                      color: "var(--aw-accent)",
                      fontSize: 18,
                      flexShrink: 0,
                      marginLeft: 16,
                      transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                      display: "inline-block",
                    }}
                  >
                    +
                  </span>
                </button>
                {open === i && (
                  <div
                    style={{
                      padding: "0 22px 18px",
                      fontSize: 14,
                      color: "var(--aw-text-2)",
                      lineHeight: 1.7,
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      paddingTop: 14,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FINAL CTA
─────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section
      style={{
        padding: "120px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(232,160,85,0.1), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(48px,7vw,96px)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: "var(--aw-text)",
              marginBottom: 20,
            }}
          >
            Make something nobody else has heard.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            style={{
              fontSize: 17,
              color: "var(--aw-text-2)",
              lineHeight: 1.65,
              maxWidth: 440,
              margin: "0 auto 40px",
            }}
          >
            10,000 free tokens. No credit card. The first track lands in about 90 seconds.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link
              href="/sign-up"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                borderRadius: 9999,
                background: "var(--aw-accent)",
                color: "#000",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 2px 24px rgba(232,160,85,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 6px 32px rgba(232,160,85,0.55)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 2px 24px rgba(232,160,85,0.4)";
              }}
            >
              ✦ Open the studio
            </Link>
            <Link
              href="/sign-in"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.11)",
                color: "var(--aw-text)",
                fontSize: 15,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")
              }
            >
              Read the docs
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FOOTER
─────────────────────────────────────────────── */
const FOOTER_LINKS = {
  Product: ["Generation", "Stems", "Album", "Editing", "Mastering"],
  Resources: ["Community", "Docs", "Pricing", "API"],
  Company: ["About", "Blog", "Legal", "Twitter"],
};

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "var(--aw-surface)",
        padding: "60px 40px 32px",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr repeat(4, 1fr)",
            gap: 40,
            marginBottom: 50,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: "linear-gradient(135deg, #e8a055, #c97a30)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: "var(--aw-text)",
                }}
              >
                AudioWeave
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--aw-text-2)", lineHeight: 1.65, maxWidth: 220 }}>
              The studio where music is woven from words. Generate, edit, and master full tracks
              from a single prompt-driven workspace.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--aw-text-2)",
                  marginBottom: 16,
                }}
              >
                {heading}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {links.map((link) => (
                  <li key={link} style={{ marginBottom: 10 }}>
                    <a
                      href="#"
                      style={{
                        fontSize: 13,
                        color: "var(--aw-text-2)",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.color = "var(--aw-text)")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.color = "var(--aw-text-2)")
                      }
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--aw-text-3)" }}>
            © 2026 AudioWeave Studio
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--aw-text-3)",
              letterSpacing: "0.06em",
            }}
          >
            Woven in dark mode · v 2.4
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────
   ROOT LANDING PAGE
─────────────────────────────────────────────── */
export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Allow scrolling on the landing page, restore when leaving */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = "";
    };
  }, []);

  /* Nav scroll detection */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ minHeight: "100vh", background: "var(--aw-bg)", color: "var(--aw-text)" }}
    >
      <Nav scrolled={scrolled} />
      <Hero />
      <TrustStrip />
      <ThreePillars />
      <CapabilitiesMarquee />

      <FeatureSection
        id="generation"
        eyebrow="// Generation"
        title={
          <>
            Two takes. <em>One sentence.</em>
          </>
        }
        sub="Describe a feeling, a scene, a tempo — anything. Music Generation returns two complete tracks per request, each with title, audio, and lyrics ready to download or refine."
        features={[
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            ),
            title: "Quick Idea",
            desc: "280 characters in. A focused, ready-to-prompt concept out.",
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18M3 12h18" />
              </svg>
            ),
            title: "Prompt Enhancer",
            desc: "Rough direction in. Production-ready musical detail out.",
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12l3 3 5-6" />
              </svg>
            ),
            title: "Inpaint & Extend",
            desc: "Fix a weak section. Or stretch a 60s demo into a 3-minute track.",
          },
        ]}
        mock={<GenerationMock />}
      />

      <FeatureSection
        id="stems"
        eyebrow="// Stem Separation"
        title={
          <>
            Pull <em>any track</em> apart.
          </>
        }
        sub="Vocals, drums, bass, and everything else — cleanly isolated and individually mixable. Want an instrumental, an a-cappella, or just the kick? It's already there."
        features={[
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            ),
            title: "Four clean stems",
            desc: "Mix, mute, solo, and download each track independently.",
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            ),
            title: "Live waveform mixer",
            desc: "See and hear each stem in real time as you balance the mix.",
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            ),
            title: "Export to anywhere",
            desc: "Drop stems into your DAW or remix them inside AudioWeave.",
          },
        ]}
        reverse
        mock={<StemMock />}
      />

      {/* Album Generation announce banner */}
      <Reveal>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 40px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 9999,
              border: "1px solid rgba(232,160,85,0.25)",
              background: "rgba(232,160,85,0.08)",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.1em",
                color: "#000",
                background: "var(--aw-accent)",
                padding: "2px 7px",
                borderRadius: 4,
              }}
            >
              NEW
            </span>
            <span style={{ fontSize: 13, color: "var(--aw-text-2)" }}>
              Album Generation — score a whole story in one workflow
            </span>
          </div>
        </div>
      </Reveal>

      <FeatureSection
        id="album"
        eyebrow="// Album Generation"
        title={
          <>
            Score a <em>whole story</em>.
          </>
        }
        sub="Paste a script, a treatment, a chapter list. AudioWeave reads it, segments it into scenes, and writes a tailored prompt and lyrics for every track — up to 20 of them — so the whole album moves as one piece."
        features={[
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            ),
            title: "Scene-by-scene plan",
            desc: "Review and edit prompts and lyrics before a single track is generated.",
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M5 9l7-7 7 7M5 15l7 7 7-7" />
              </svg>
            ),
            title: "Coherent emotional arc",
            desc: "The planner picks a style palette so every track belongs to the same world.",
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            ),
            title: "Re-plan anything",
            desc: "Regenerate any track that doesn't land. The rest of the album stays put.",
          },
        ]}
        mock={<AlbumMock />}
      />

      <FeatureSection
        id="ai-edit"
        eyebrow="// AI Music Editing"
        title={
          <>
            Tell it the <em>vibe</em>. Tell it the <em>length</em>.
          </>
        }
        sub='Type a plain-English brief — "punchy 30-second drop for a TikTok" or "60-second chorus loop for a podcast intro" — and AI Music Editing finds the best section of any track, trimmed to the exact length, locked to the beat.'
        features={[
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h10M4 18h16" />
              </svg>
            ),
            title: "Prompt-driven",
            desc: "Describe what you want. The model picks the right moment for you.",
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            ),
            title: "Exact target length",
            desc: "15s, 30s, 60s, 3 minutes — to the beat. Loops cleanly when needed.",
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h3l3-9 4 18 3-9h5" />
              </svg>
            ),
            title: "Beat-synced crossfades",
            desc: "No awkward cuts. Override the AI's pick with one click if you want.",
          },
        ]}
        reverse
        mock={<AIEditMock />}
      />

      <FeatureSection
        id="mastering"
        eyebrow="// Platform Mastering"
        title={
          <>
            Tuned for <em>where it plays</em>.
          </>
        }
        sub="Spotify wants −14 LUFS. Cinema wants something else entirely. Pick a target and AudioWeave masters loudness, dynamics, and tone to spec — so your track sits right wherever it lands."
        features={[
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13M9 13a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM21 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
              </svg>
            ),
            title: "Reference Track Match",
            desc: "Point at a song you love. Get a master that lands closer to its feel.",
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6l4 2" />
              </svg>
            ),
            title: "AI Analog Warmth",
            desc: 'Adaptive 7-stage chain that strips the cold, brittle "AI" character.',
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1v6M12 17v6M4.2 4.2l4.3 4.3M15.5 15.5l4.3 4.3M1 12h6M17 12h6M4.2 19.8l4.3-4.3M15.5 8.5l4.3-4.3" />
              </svg>
            ),
            title: "Podcast Producer",
            desc: "Spoken-word in. Polished, distribution-ready episode out.",
          },
        ]}
        mock={<MasteringMock />}
      />

      <Workflow />
      <Testimonial />
      <Sampler />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
