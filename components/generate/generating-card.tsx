import { Waveform } from "@/components/audio/waveform";

interface GeneratingCardProps {
  progress: number;
  tab: string;
}

export function GeneratingCard({ progress, tab }: GeneratingCardProps) {
  const variationCount = 2;
  return (
    <div
      className="rounded-[var(--radius-xl)] border border-[color:var(--aw-border)] overflow-hidden fade-in mb-4"
      style={{ background: "var(--aw-card)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="p-6 flex flex-col gap-3">
        <div className="flex items-center gap-[10px]">
          <div
            className="w-[18px] h-[18px] rounded-full border-2 border-[color:var(--aw-accent)] border-t-transparent"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <span className="text-[13px] text-[color:var(--aw-text-2)]">
            Generating your {tab.toLowerCase()}…
          </span>
          <span className="text-[11px] text-[color:var(--aw-text-3)] ml-auto">{progress}%</span>
        </div>
        <div className="h-1 bg-[color:var(--aw-card-hi)] rounded-[4px]">
          <div
            className="h-full rounded-[4px] transition-[width] duration-100"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--aw-accent), rgba(232,160,85,0.6))",
              boxShadow: "0 0 8px var(--aw-accent)",
              animation: "progress-glow 1.5s ease infinite",
            }}
          />
        </div>
        <div className="flex gap-3">
          {Array.from({ length: variationCount }).map((_, v) => (
            <div
              key={v}
              className="flex-1 bg-[color:var(--aw-card-hi)] rounded-[10px] p-[12px_14px] border border-[color:var(--aw-border)]"
            >
              <div className="text-[11px] text-[color:var(--aw-text-3)] mb-[6px]">
                Generating variation {v + 1}
              </div>
              <div className="h-7">
                <Waveform bars={40} color="rgba(232,160,85,0.3)" dim />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
