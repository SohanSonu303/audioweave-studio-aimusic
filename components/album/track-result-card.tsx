"use client";

import { useState } from "react";
import { useDownloadPoll, type TrackItem } from "@/lib/api/library";
import type { AlbumTrackResponse } from "@/lib/api/album";
import { AlbumWaveformPlayer } from "@/components/album/album-waveform-player";
import { useAlbumStore } from "@/stores/album-store";

/** Semantic colors per track type */
const TYPE_BORDER: Record<string, string> = {
  song: "var(--aw-green)",
  background_score: "var(--aw-purple)",
  instrumental: "var(--aw-blue)",
};

const TYPE_LABEL: Record<string, string> = {
  song: "Song",
  background_score: "BG Score",
  instrumental: "Instrumental",
};

interface TrackResultCardProps {
  track: AlbumTrackResponse;
  albumId: string;
}

export function TrackResultCard({ track, albumId }: TrackResultCardProps) {
  const borderColor = TYPE_BORDER[track.track_type] ?? "var(--aw-accent)";
  const typeLabel = TYPE_LABEL[track.track_type] ?? track.track_type;

  const setRegenerateDialogTrackId = useAlbumStore((s) => s.setRegenerateDialogTrackId);

  const [scriptOpen, setScriptOpen] = useState(false);

  // Poll download for this track's task_id
  const { data: dlData, isLoading: dlLoading } = useDownloadPoll(track.task_id ?? null);

  // Variants from the download response (expect up to 2 entries)
  const variants: TrackItem[] = [
    ...(dlData?.tracks ?? []),
    ...(dlData?.sounds ?? []),
  ].filter(
    (t) => t.status === "COMPLETED" && t.audio_url,
  );

  const hasScriptContext = !!(track.script_excerpt || track.scene_description);

  return (
    <div
      className="rounded-[12px] border border-[color:var(--aw-border)] bg-[color:var(--aw-card)] overflow-hidden fade-in"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: borderColor,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[10px] font-bold"
            style={{ background: `${borderColor}20`, color: borderColor }}
          >
            {track.track_number}
          </span>
          <span
            className="px-[8px] py-[2px] rounded-[9999px] text-[10px] font-medium uppercase tracking-[0.04em]"
            style={{
              background: `${borderColor}15`,
              color: borderColor,
              border: `1px solid ${borderColor}22`,
            }}
          >
            {typeLabel}
          </span>
          {track.prompt && (
            <span className="text-[11px] text-[color:var(--aw-text-2)] truncate flex-1">
              {track.prompt}
            </span>
          )}
        </div>

        {/* Script context section */}
        {hasScriptContext && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setScriptOpen(!scriptOpen)}
              className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[color:var(--aw-text-3)] transition-colors duration-150 hover:text-[color:var(--aw-text-2)] mb-2"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className="transition-transform duration-200"
                style={{
                  transform: scriptOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                <path
                  d="M3.5 2L6.5 5L3.5 8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>📜</span>
              Script Reference
            </button>

            {scriptOpen && (
              <div
                className="rounded-[8px] overflow-hidden border fade-in"
                style={{
                  borderColor: `${borderColor}22`,
                  background: "rgba(255,255,255,0.015)",
                }}
              >
                {/* Script excerpt */}
                {track.script_excerpt && (
                  <div
                    className="px-4 py-3"
                    style={{
                      borderLeft: `3px solid ${borderColor}`,
                      background: `${borderColor}08`,
                    }}
                  >
                    <p
                      className="text-[11px] text-[color:var(--aw-text-2)] leading-[1.65] whitespace-pre-wrap"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {track.script_excerpt}
                    </p>
                  </div>
                )}

                {/* Scene description + chips */}
                {(track.scene_description || track.suggested_mood || track.suggested_style || track.suggested_tempo) && (
                  <div
                    className="px-4 py-3 border-t"
                    style={{ borderColor: `${borderColor}15` }}
                  >
                    {track.scene_description && (
                      <p className="text-[11px] text-[color:var(--aw-text-3)] italic leading-[1.5] mb-2">
                        {track.scene_description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-[6px]">
                      {track.suggested_mood && <Chip label={track.suggested_mood} />}
                      {track.suggested_style && <Chip label={track.suggested_style} />}
                      {track.suggested_tempo && <Chip label={track.suggested_tempo} />}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Variant players */}
        {dlLoading ? (
          <div className="flex flex-col gap-3">
            <div className="skeleton h-[120px] rounded-[10px]" />
            <div className="skeleton h-[120px] rounded-[10px]" />
          </div>
        ) : variants.length > 0 ? (
          <div className="flex flex-col gap-3">
            {variants.map((v, i) => (
              <AlbumWaveformPlayer
                key={v.id}
                label={`Version ${String.fromCharCode(65 + i)}`}
                title={v.title}
                audioUrl={v.audio_url}
                duration={v.duration}
              />
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-[12px] text-[color:var(--aw-text-3)]">
            {track.task_id ? "Audio is still processing…" : "No audio generated"}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[color:var(--aw-border)]">
          <button
            type="button"
            onClick={() => setRegenerateDialogTrackId(track.id)}
            className="px-3 py-[5px] rounded-[6px] text-[11px] text-[color:var(--aw-text-3)] border border-[color:var(--aw-border)] bg-transparent transition-colors duration-150 hover:bg-[rgba(255,255,255,0.04)] hover:text-[color:var(--aw-text-2)]"
          >
            Regenerate
          </button>

        </div>
      </div>
    </div>
  );
}

/* Small chip for suggested values */
function Chip({ label }: { label: string }) {
  return (
    <span className="px-[8px] py-[3px] rounded-[9999px] text-[10px] text-[color:var(--aw-text-2)] bg-[rgba(255,255,255,0.05)] border border-[color:var(--aw-border)]">
      {label}
    </span>
  );
}
