import { cn } from "@/lib/utils";

const THUMB_GRADIENTS = [
  "linear-gradient(135deg,#c8702a,#7b3fa0)",
  "linear-gradient(135deg,#2a6ec8,#20a06a)",
  "linear-gradient(135deg,#a02a5a,#c87820)",
  "linear-gradient(135deg,#206090,#60a040)",
  "linear-gradient(135deg,#7030c0,#3060c0)",
  "linear-gradient(135deg,#c04040,#804090)",
  "linear-gradient(135deg,#205060,#40a080)",
  "linear-gradient(135deg,#805020,#206040)",
  "linear-gradient(135deg,#602080,#c07030)",
];

interface TrackThumbnailProps {
  index?: number;
  gradient?: string;
  size?: number;
  barCount?: number;
  className?: string;
}

export function TrackThumbnail({ index = 0, gradient, size = 38, barCount = 10, className }: TrackThumbnailProps) {
  const bg = gradient ?? THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];

  return (
    <div
      className={cn("rounded-[8px] flex-shrink-0 relative overflow-hidden", className)}
      style={{ width: size, height: size, background: bg }}
    >
      <div className="absolute inset-0 flex items-center px-[6px] py-[4px] gap-[1px]">
        {Array.from({ length: barCount }).map((_, j) => {
          const h = 30 + Math.abs(Math.sin((j + index * 3) * 0.9)) * 55;
          return (
            <div
              key={j}
              className="flex-1 rounded-[1px]"
              style={{ height: `${h}%`, background: "rgba(255,255,255,0.5)" }}
            />
          );
        })}
      </div>
    </div>
  );
}
