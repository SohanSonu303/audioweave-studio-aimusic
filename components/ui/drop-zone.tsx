"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { Icon, icons } from "@/components/ui/icon";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  hint?: string;
  className?: string;
}

export function DropZone({ onFiles, accept = "audio/*", hint = "MP3, WAV, FLAC, AIFF · up to 200MB", className }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center text-center cursor-pointer rounded-[20px] px-20 py-[60px] transition-all duration-200 border-2 border-dashed",
        dragging
          ? "border-[color:var(--aw-accent)] bg-[color:var(--aw-warm)]"
          : "border-[rgba(255,255,255,0.12)] bg-transparent",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={handleChange}
      />

      <div className="w-[52px] h-[52px] rounded-full bg-[rgba(255,255,255,0.05)] border border-[color:var(--aw-border)] flex items-center justify-center mb-4">
        <Icon d={icons.upload} size={22} color="var(--aw-text-3)" />
      </div>

      <p className="font-[family-name:var(--font-display)] font-light text-[22px] mb-1.5 text-[color:var(--aw-text)]">
        Drop your audio here
      </p>
      <p className="text-[12px] text-[color:var(--aw-text-3)] mb-5">{hint}</p>

      <button
        type="button"
        className="px-[22px] py-[9px] rounded-[var(--radius-pill)] text-[12px] font-medium bg-[rgba(255,255,255,0.07)] text-[color:var(--aw-text-2)] border border-[color:var(--aw-border-md)] cursor-pointer"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
      >
        Browse files
      </button>
    </div>
  );
}
