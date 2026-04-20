"use client";

import { useRef } from "react";
import { Icon, icons } from "@/components/ui/icon";

interface StemsHeaderProps {
  separated: boolean;
  onUpload: (file: File) => void;
}

export function StemsHeader({ separated, onUpload }: StemsHeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="px-7 pt-4 pb-[14px] border-b border-[color:var(--aw-border)] flex-shrink-0 flex items-center gap-4">
      <div>
        <h1
          className="font-light text-[28px] tracking-[-0.3px] mb-[2px] text-[color:var(--aw-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Stem Separation
        </h1>
        <p className="text-[12px] text-[color:var(--aw-text-2)]">
          Isolate vocals, drums, bass, melody and more from any track.
        </p>
      </div>
      <div className="ml-auto flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-[6px] px-4 py-2 rounded-[var(--radius-pill)] text-[12px] font-medium bg-[rgba(255,255,255,0.06)] border border-[color:var(--aw-border)] text-[color:var(--aw-text-2)] cursor-pointer"
        >
          <Icon d={icons.upload} size={13} /> Upload new
        </button>
        {separated && (
          <button className="flex items-center gap-[6px] px-4 py-2 rounded-[var(--radius-pill)] text-[12px] font-medium border cursor-pointer"
            style={{
              background: "var(--aw-accent-dim)",
              borderColor: "rgba(232,160,85,0.25)",
              color: "var(--aw-accent)",
            }}
          >
            <Icon d={icons.download} size={13} /> Export all stems
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
        }}
      />
    </div>
  );
}
