import { Waveform } from "@/components/audio/waveform";

interface GeneratingCardProps {
  progress: number;
  tab: string;
}

export function GeneratingCard({ progress, tab }: GeneratingCardProps) {
  const variationCount = 2;
  const pct = Math.round(progress);

  return (
    <div
      className="relative rounded-[var(--radius-xl)] border border-[color:var(--aw-border)] overflow-hidden fade-in mb-4"
      style={{
        background:
          "radial-gradient(120% 120% at 0% 0%, rgba(232,160,85,0.08) 0%, transparent 55%), var(--aw-card)",
        boxShadow: "var(--shadow-card), 0 0 0 1px rgba(232,160,85,0.08)",
      }}
    >
      {/* Accent sweep at top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--aw-accent), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2.4s linear infinite",
          opacity: 0.7,
        }}
      />

      <div className="p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          {/* Equalizer indicator */}
          <div className="flex items-end gap-[2px] h-[16px]">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  background: "var(--aw-accent)",
                  borderRadius: 2,
                  height: "68%",
                  transformOrigin: "bottom",
                  animation: `eq-bar ${1.4 + i * 0.35}s ease-in-out infinite`,
                  animationDelay: `${i * 0.28}s`,
                }}
              />
            ))}
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-[13px] text-[color:var(--aw-text)] font-medium">
              Generating your {tab.toLowerCase()}
            </span>
            <span className="text-[11px] text-[color:var(--aw-text-2)] mt-[2px]">
              Composing audio — this usually takes a minute.
            </span>
          </div>

          <span
            className="ml-auto text-[12px] font-mono font-medium tabular-nums"
            style={{ color: "var(--aw-accent)" }}
          >
            {pct}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="relative h-[6px] rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-[width] duration-150"
            style={{
              width: `${pct}%`,
              background:
                "linear-gradient(90deg, rgba(232,160,85,0.7), var(--aw-accent))",
              boxShadow: "0 0 10px rgba(232,160,85,0.55)",
            }}
          />
          <div
            className="absolute top-0 left-0 h-full rounded-full pointer-events-none"
            style={{
              width: `${pct}%`,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.6s linear infinite",
              mixBlendMode: "overlay",
            }}
          />
        </div>

        {/* Variation placeholders */}
        <div className="flex gap-[10px] mt-1">
          {Array.from({ length: variationCount }).map((_, v) => (
            <div
              key={v}
              className="flex-1 rounded-[10px] p-[12px_14px] border border-[color:var(--aw-border)] relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0))",
              }}
            >
              {/* Subtle accent shimmer sweep */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(232,160,85,0.07) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: `shimmer ${2 + v * 0.5}s linear infinite`,
                }}
              />
              <div className="relative flex items-center justify-between mb-2">
                <span className="text-[11px] text-[color:var(--aw-text-2)] font-medium">
                  Variation {v + 1}
                </span>
                <div
                  className="w-[6px] h-[6px] rounded-full"
                  style={{
                    background: "var(--aw-accent)",
                    boxShadow: "0 0 8px var(--aw-accent)",
                    animation: `waveform-pulse ${1.2 + v * 0.3}s ease-in-out infinite`,
                  }}
                />
              </div>
              <div className="relative h-9">
                <Waveform bars={50} playing color="var(--aw-accent)" />
              </div>
              <div className="relative flex justify-between mt-[6px] text-[10px] text-[color:var(--aw-text-3)]">
                <span>—</span>
                <span>—</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
