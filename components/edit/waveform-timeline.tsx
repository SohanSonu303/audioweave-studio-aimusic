"use client";

import { formatTimeWithDecimal } from "@/lib/utils";

interface WaveformTimelineProps {
  duration: number;
  majorCount?: number;
}

export function WaveformTimeline({ duration, majorCount = 4 }: WaveformTimelineProps) {
  if (!duration || duration <= 0) {
    return <div className="h-8 border-b border-aw-border" style={{ background: "#111" }} />;
  }

  const majorTicks = majorCount + 1;
  const majorValues = Array.from({ length: majorTicks }, (_, i) => (duration * i) / (majorTicks - 1));
  const minorBetween = 4;
  const totalTicks = (majorTicks - 1) * minorBetween + 1;

  return (
    <div
      className="h-8 border-b border-aw-border flex items-end px-6 relative opacity-70 select-none"
      style={{ background: "#0f0f0f" }}
    >
      <div className="absolute inset-0 flex items-end px-6">
        {Array.from({ length: totalTicks }, (_, i) => {
          const isMajor = i % minorBetween === 0;
          const height = isMajor ? 10 : i % 2 === 0 ? 6 : 4;
          const majorIdx = isMajor ? i / minorBetween : -1;
          return (
            <div key={i} className="flex-1 relative border-l" style={{
              height: `${height}px`,
              borderColor: isMajor ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.18)",
            }}>
              {isMajor && majorIdx > 0 && majorIdx < majorTicks - 1 && (
                <span
                  className="absolute -top-4 -translate-x-1/2 text-[9px] font-mono"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {formatTimeWithDecimal(majorValues[majorIdx]).replace(/\.\d$/, "")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
