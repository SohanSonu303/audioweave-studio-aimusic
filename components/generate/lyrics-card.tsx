"use client";

interface LyricsCardProps {
  value: string;
  onChange: (v: string) => void;
}

export function LyricsCard({ value, onChange }: LyricsCardProps) {
  return (
    <div
      className="mb-3 p-4 rounded-[var(--radius-xl)] border border-[color:var(--aw-border)]"
      style={{ background: "var(--aw-card)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="text-[11px] font-medium text-[color:var(--aw-text-3)] mb-2 uppercase tracking-[0.06em]">
        Lyrics
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your lyrics here, or leave blank to let AI write them…"
        rows={5}
        className="w-full bg-transparent border-none outline-none resize-none text-[color:var(--aw-text)] text-[14px] leading-[1.6] tracking-[0.01em] placeholder:text-[color:var(--aw-text-3)]"
      />
    </div>
  );
}
