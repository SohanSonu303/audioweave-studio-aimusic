import { Icon, icons } from "@/components/ui/icon";

interface TrackInfoBarProps {
  fileName: string;
  stemCount: number;
  duration: string;
  separating: boolean;
  separated: boolean;
  progress: number;
}

export function TrackInfoBar({ fileName, stemCount, duration, separating, separated, progress }: TrackInfoBarProps) {
  return (
    <div className="px-7 py-[10px] border-b border-[color:var(--aw-border)] flex items-center gap-3 flex-shrink-0 bg-[rgba(255,255,255,0.015)]">
      <div
        className="w-8 h-8 rounded-[8px] flex items-center justify-center"
        style={{ background: "var(--aw-accent-dim)", border: "1px solid rgba(232,160,85,0.2)" }}
      >
        <Icon d={icons.note[0]} size={14} color="var(--aw-accent)" />
      </div>
      <div>
        <div className="text-[13px] font-medium text-[color:var(--aw-text)]">{fileName}</div>
        <div className="text-[11px] text-[color:var(--aw-text-3)]">
          {separated
            ? `${stemCount} stems · ${duration}`
            : separating
            ? `Separating… ${Math.round(progress)}%`
            : ""}
        </div>
      </div>
      {separating && (
        <div className="flex-1 h-[3px] bg-[color:var(--aw-card)] rounded-[4px] ml-3">
          <div
            className="h-full rounded-[4px] transition-[width] duration-[50ms]"
            style={{
              width: `${progress}%`,
              background: "var(--aw-accent)",
              boxShadow: "0 0 8px rgba(232,160,85,0.4)",
            }}
          />
        </div>
      )}
      {separated && (
        <span className="text-[11px] ml-1" style={{ color: "rgba(150,200,130,0.9)" }}>
          ✓ Ready
        </span>
      )}
    </div>
  );
}
