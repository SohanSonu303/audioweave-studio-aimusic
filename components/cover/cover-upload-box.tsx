"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, X, Clock, HardDrive } from "lucide-react";
import { Icon, icons } from "@/components/ui/icon";
import { formatTime } from "@/lib/utils";

export const MAX_COVER_BYTES = 100 * 1024 * 1024;

interface CoverUploadBoxProps {
  file: File | null;
  duration: number | null;
  maxSeconds: number;
  allowedExtensions: string[];
  onFileChange: (file: File | null) => void;
  onDurationChange: (seconds: number | null) => void;
  error?: string | null;
}

function extensionOf(name: string) {
  return name.slice(name.lastIndexOf(".") + 1).toLowerCase();
}

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

export function CoverUploadBox({
  file,
  duration,
  maxSeconds,
  allowedExtensions,
  onFileChange,
  onDurationChange,
  error,
}: CoverUploadBoxProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Read duration locally so an over-length track is caught before the upload
  useEffect(() => {
    if (!file) {
      onDurationChange(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const probe = new Audio();
    const handleLoaded = () => onDurationChange(Number.isFinite(probe.duration) ? probe.duration : null);
    const handleError = () => onDurationChange(null);

    probe.addEventListener("loadedmetadata", handleLoaded);
    probe.addEventListener("error", handleError);
    probe.preload = "metadata";
    probe.src = url;

    return () => {
      probe.removeEventListener("loadedmetadata", handleLoaded);
      probe.removeEventListener("error", handleError);
      probe.src = "";
      URL.revokeObjectURL(url);
    };
  }, [file, onDurationChange]);

  const accept = allowedExtensions.map((e) => `.${e}`).join(",");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  const overSize = !!file && file.size > MAX_COVER_BYTES;
  const overLength = duration != null && duration > maxSeconds;
  const badFormat =
    !!file && allowedExtensions.length > 0 && !allowedExtensions.includes(extensionOf(file.name));

  if (file) {
    return (
      <div className="space-y-3">
        <div
          className="w-full rounded-[14px] border px-6 py-5 flex items-center gap-5"
          style={{
            background: "rgba(232,160,85,0.04)",
            borderColor: overSize || overLength || badFormat ? "rgba(255,100,100,0.4)" : "rgba(232,160,85,0.2)",
          }}
        >
          <div
            className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(232,160,85,0.1)", border: "1px solid rgba(232,160,85,0.2)" }}
          >
            <Music2 size={22} className="text-aw-accent" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-aw-text truncate">{file.name}</div>
            <div className="flex items-center gap-4 mt-1.5">
              <span className="flex items-center gap-1.5 text-[11px] text-aw-text-3 font-mono tabular-nums">
                <Clock size={11} />
                {duration != null ? formatTime(Math.round(duration)) : "—:—"}
                <span className="opacity-60">/ {formatTime(maxSeconds)} max</span>
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-aw-text-3 font-mono tabular-nums">
                <HardDrive size={11} />
                {formatBytes(file.size)}
              </span>
            </div>
          </div>

          <button
            onClick={() => onFileChange(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 flex-shrink-0"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}
            aria-label="Remove file"
          >
            <X size={14} className="text-aw-text-2" />
          </button>
        </div>

        {(error || overSize || overLength || badFormat) && (
          <p className="text-[11px]" style={{ color: "rgba(255,100,100,0.9)" }}>
            {overSize
              ? "File is too large — max 100 MB."
              : overLength
              ? `Track is too long — max ${Math.round(maxSeconds / 60)} minutes.`
              : badFormat
              ? `Unsupported format — use ${allowedExtensions.join(", ").toUpperCase()}.`
              : error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="relative cursor-pointer rounded-[14px] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-200"
        style={{
          borderColor: dragging ? "var(--aw-accent)" : error ? "rgba(255,100,100,0.5)" : "rgba(255,255,255,0.12)",
          background: dragging ? "rgba(232,160,85,0.05)" : "rgba(255,255,255,0.02)",
          minHeight: 200,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept || "audio/*"}
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />

        <div
          className="w-12 h-12 rounded-[12px] flex items-center justify-center"
          style={{ background: "rgba(232,160,85,0.1)", border: "1px solid rgba(232,160,85,0.2)" }}
        >
          <Icon d={icons.upload} size={22} color="var(--aw-accent)" />
        </div>
        <div className="text-center">
          <div className="text-[13px] font-medium text-[color:var(--aw-text)]">
            Drop the track here or <span style={{ color: "var(--aw-accent)" }}>browse</span>
          </div>
          <div className="text-[11px] text-[color:var(--aw-text-3)] mt-1">
            {(allowedExtensions.length ? allowedExtensions.join(", ").toUpperCase() : "MP3, WAV, M4A, FLAC, OGG")}
            {" · up to "}
            {Math.round(maxSeconds / 60)} min · 100 MB
          </div>
        </div>
      </div>

      {error && <p className="text-[11px]" style={{ color: "rgba(255,100,100,0.9)" }}>{error}</p>}
    </div>
  );
}
