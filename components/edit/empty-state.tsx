"use client";

import { useState } from "react";
import { Link2, Sparkles } from "lucide-react";
import { DropZone } from "@/components/ui/drop-zone";
import { useEditStore } from "@/stores/edit-store";

export function EmptyState() {
  const setSource = useEditStore((s) => s.setPrimarySource);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");

  const handleFiles = (files: File[]) => {
    if (files.length > 0) setSource({ kind: "file", file: files[0] });
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) setSource({ kind: "url", url: urlInput.trim() });
  };

  return (
    <div className="max-w-[640px] mx-auto w-full flex flex-col items-center text-center gap-8 py-8">
      <div className="flex flex-col items-center gap-3">
        <span
          className="flex items-center gap-2 px-3 py-1 rounded-full border uppercase tracking-[0.2em] text-[9px] font-light"
          style={{ color: "var(--aw-accent)", borderColor: "rgba(232,160,85,0.3)" }}
        >
          <Sparkles size={10} />
          AI Auto Trim
        </span>
        <h1 className="font-display text-[44px] font-light leading-[1.1] text-aw-text">
          Find the perfect moment.
        </h1>
        <p className="text-[14px] text-aw-text-2 max-w-[440px] leading-relaxed">
          Upload a track and let AI isolate the drop, hook, or loop — beat-matched,
          crossfaded, and ready to drop into your mix.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 mx-auto bg-white/5 border border-aw-border rounded-full p-1">
          <button
            onClick={() => setMode("file")}
            className={`px-5 py-1.5 text-[11px] font-medium rounded-full uppercase tracking-wider transition-all ${
              mode === "file"
                ? "bg-aw-accent text-black shadow-[0_1px_4px_rgba(232,160,85,0.3)]"
                : "text-aw-text-2 hover:text-aw-text"
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setMode("url")}
            className={`px-5 py-1.5 text-[11px] font-medium rounded-full uppercase tracking-wider transition-all ${
              mode === "url"
                ? "bg-aw-accent text-black shadow-[0_1px_4px_rgba(232,160,85,0.3)]"
                : "text-aw-text-2 hover:text-aw-text"
            }`}
          >
            Paste URL
          </button>
        </div>

        {mode === "file" ? (
          <DropZone onFiles={handleFiles} hint="MP3, WAV · up to 50 MB" />
        ) : (
          <form
            onSubmit={handleUrlSubmit}
            className="flex gap-2 bg-[#111] border border-aw-border rounded-xl p-2"
          >
            <div className="flex items-center pl-3 text-aw-text-3">
              <Link2 size={15} />
            </div>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/audio.mp3"
              className="flex-1 px-2 py-2 bg-transparent text-[13px] text-aw-text placeholder-aw-text-3 outline-none"
              required
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-aw-accent text-black text-[12px] font-semibold hover:opacity-90 transition-opacity uppercase tracking-wider"
            >
              Load
            </button>
          </form>
        )}

        <p className="text-[11px] text-aw-text-3 mt-2">
          Tip — on the right, describe what you want (<span className="italic">&ldquo;punchy 30s drop&rdquo;</span>).
          AI will auto-fill parameters for you.
        </p>
      </div>
    </div>
  );
}
