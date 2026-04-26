"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";

const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"];
const ACCEPTED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

interface UploadBoxProps {
  file: File | null;
  imageUrl: string;
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  error?: string | null;
}

export function UploadBox({ file, imageUrl, onFileChange, onUrlChange, error }: UploadBoxProps) {
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState<"file" | "url">("file");
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = file ? URL.createObjectURL(file) : null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && ACCEPTED.includes(dropped.type)) {
      onFileChange(dropped);
      onUrlChange("");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (picked) {
      onFileChange(picked);
      onUrlChange("");
    }
  };

  const handleUrlChange = (val: string) => {
    onUrlChange(val);
    if (val) onFileChange(null);
  };

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div
        className="flex gap-1 p-[3px] rounded-[10px]"
        style={{ background: "rgba(255,255,255,0.05)", width: "fit-content" }}
      >
        {(["file", "url"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-[6px] rounded-[8px] text-[12px] font-medium transition-all duration-150 cursor-pointer"
            style={{
              background: tab === t ? "rgba(232,160,85,0.15)" : "transparent",
              color: tab === t ? "var(--aw-accent)" : "var(--aw-text-3)",
              border: tab === t ? "1px solid rgba(232,160,85,0.25)" : "1px solid transparent",
            }}
          >
            {t === "file" ? "Upload Image" : "Image URL"}
          </button>
        ))}
      </div>

      {tab === "file" ? (
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
            accept={ACCEPTED_EXT.join(",")}
            className="hidden"
            onChange={handleFileInput}
          />

          {preview ? (
            <div className="relative w-full h-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-[12px]"
              />
              <button
                onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                <Icon d="M18 6L6 18M6 6l12 12" size={12} color="white" />
              </button>
              <div className="absolute bottom-2 left-3 text-[11px] text-white/70 font-medium" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                {file?.name}
              </div>
            </div>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center"
                style={{ background: "rgba(232,160,85,0.1)", border: "1px solid rgba(232,160,85,0.2)" }}
              >
                <Icon d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" size={22} color="var(--aw-accent)" />
              </div>
              <div className="text-center">
                <div className="text-[13px] font-medium text-[color:var(--aw-text)]">
                  Drop image here or <span style={{ color: "var(--aw-accent)" }}>browse</span>
                </div>
                <div className="text-[11px] text-[color:var(--aw-text-3)] mt-1">
                  JPG, PNG, GIF, BMP, WEBP
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 rounded-[10px] text-[13px] outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${error ? "rgba(255,100,100,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: "var(--aw-text)",
            }}
          />
          {imageUrl && (
            <div
              className="w-full rounded-[12px] overflow-hidden border"
              style={{ borderColor: "rgba(255,255,255,0.08)", maxHeight: 160 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="URL Preview" className="w-full object-cover max-h-[160px]" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px]" style={{ color: "rgba(255,100,100,0.9)" }}>{error}</p>
      )}
    </div>
  );
}
