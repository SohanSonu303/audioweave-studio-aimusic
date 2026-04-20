interface AnalyzingProps {
  progress: number;
}

export function Analyzing({ progress }: AnalyzingProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[color:var(--aw-text-3)]">
      <div
        className="w-12 h-12 rounded-full"
        style={{
          border: "3px solid var(--aw-border)",
          borderTopColor: "var(--aw-accent)",
          animation: "spin 1s linear infinite",
        }}
      />
      <div className="text-center">
        <div className="text-[14px] text-[color:var(--aw-text-2)] mb-1">Reading your script…</div>
        <div className="text-[12px]">Identifying scenes, moods and emotional arc</div>
      </div>
      <div className="w-[200px] h-[3px] bg-[color:var(--aw-card)] rounded-[4px]">
        <div
          className="h-full rounded-[4px] transition-[width] duration-100"
          style={{ width: `${progress}%`, background: "var(--aw-accent)" }}
        />
      </div>
    </div>
  );
}
