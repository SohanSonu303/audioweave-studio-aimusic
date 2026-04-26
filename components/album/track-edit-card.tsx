"use client";

import { useState } from "react";
import type { AlbumTrackResponse } from "@/lib/api/album";
import { useReplanTrack } from "@/lib/api/album";
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

interface TrackEditCardProps {
  track: AlbumTrackResponse;
  albumId: string;
}

export function TrackEditCard({ track, albumId }: TrackEditCardProps) {
  const borderColor = TYPE_BORDER[track.track_type] ?? "var(--aw-accent)";
  const typeLabel = TYPE_LABEL[track.track_type] ?? track.track_type;

  const edits = useAlbumStore((s) => s.edits[track.id]);
  const setEdit = useAlbumStore((s) => s.setEdit);
  const replanningTrackId = useAlbumStore((s) => s.replanningTrackId);
  const setReplanningTrackId = useAlbumStore((s) => s.setReplanningTrackId);

  const isReplanning = replanningTrackId === track.id;

  const [replanOpen, setReplanOpen] = useState(false);
  const [replanExcerpt, setReplanExcerpt] = useState("");
  const [replanError, setReplanError] = useState<string | null>(null);

  const replanTrack = useReplanTrack(albumId, track.id);

  // Merged values: user edit takes priority over AI-suggested
  const prompt = edits?.prompt ?? track.prompt ?? "";
  const musicStyle = edits?.music_style ?? track.music_style ?? "";
  const lyrics = edits?.lyrics ?? track.lyrics ?? "";
  const gender = edits?.gender ?? track.gender ?? "Male";
  const outputLength = edits?.output_length ?? track.output_length ?? null;
  const isInstrumental = edits?.make_instrumental ?? track.make_instrumental;
  const promptLen = prompt.length;

  const handleReplan = async () => {
    setReplanningTrackId(track.id);
    setReplanError(null);
    try {
      await replanTrack.mutateAsync(
        replanExcerpt.trim()
          ? { custom_script_excerpt: replanExcerpt.trim() }
          : undefined,
      );
      setReplanOpen(false);
      setReplanExcerpt("");
    } catch (err) {
      setReplanError(
        err instanceof Error ? err.message : "Replan failed — try again",
      );
    } finally {
      setReplanningTrackId(null);
    }
  };

  return (
    <div
      className="relative rounded-[12px] border border-[color:var(--aw-border)] bg-[color:var(--aw-card)] overflow-hidden transition-colors duration-150"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: borderColor,
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Replan overlay */}
      {isReplanning && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.5)] rounded-[12px]">
          <div
            className="w-6 h-6 border-2 rounded-full"
            style={{
              borderColor: "transparent",
              borderTopColor: "var(--aw-accent)",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      )}

      <div className="px-5 py-4">
        {/* Top row */}
        <div className="flex items-center gap-3 mb-3">
          {/* Track number */}
          <span
            className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[10px] font-bold"
            style={{ background: `${borderColor}20`, color: borderColor }}
          >
            {track.track_number}
          </span>

          {/* Type pill */}
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

          {/* Energy bar */}
          {track.energy_level != null && (
            <div className="flex items-center gap-1 ml-1">
              <span className="text-[10px] text-[color:var(--aw-text-3)]">Energy</span>
              <div className="flex gap-[2px]">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[4px] h-[10px] rounded-[1px]"
                    style={{
                      background:
                        i < (track.energy_level ?? 0)
                          ? borderColor
                          : "rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Replan button */}
          <button
            type="button"
            onClick={() => setReplanOpen(!replanOpen)}
            className="ml-auto text-[11px] text-[color:var(--aw-text-3)] px-3 py-[4px] rounded-[6px] border border-[color:var(--aw-border)] bg-transparent transition-colors duration-150 hover:bg-[rgba(255,255,255,0.04)] hover:text-[color:var(--aw-text-2)]"
          >
            Replan Track
          </button>
        </div>

        {/* Context block */}
        {(track.scene_description || track.suggested_mood || track.suggested_style || track.suggested_tempo) && (
          <div className="mb-4 pb-3 border-b border-[color:var(--aw-border)]">
            {track.scene_description && (
              <p className="text-[12px] text-[color:var(--aw-text-3)] italic mb-2 leading-[1.5]">
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

        {/* Editable fields */}
        <div className="flex flex-col gap-3">
          {/* Prompt */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <label className="text-[10px] text-[color:var(--aw-text-3)] font-medium uppercase tracking-[0.07em]">
                Prompt
              </label>
              <span
                className="text-[10px] font-mono"
                style={{ color: promptLen > 280 ? "var(--aw-red)" : "var(--aw-text-3)" }}
              >
                {promptLen}/280
              </span>
            </div>
            <input
              type="text"
              value={prompt}
              maxLength={280}
              onChange={(e) => setEdit(track.id, { prompt: e.target.value })}
              className="w-full rounded-[6px] border border-[color:var(--aw-border)] bg-[rgba(255,255,255,0.03)] text-[12px] text-[color:var(--aw-text)] px-3 py-2 focus:outline-none focus:border-[color:var(--aw-accent)] transition-colors duration-150"
            />
          </div>

          {/* Music Style */}
          <div>
            <label className="block text-[10px] text-[color:var(--aw-text-3)] font-medium uppercase tracking-[0.07em] mb-1">
              Music Style
            </label>
            <input
              type="text"
              value={musicStyle}
              onChange={(e) => setEdit(track.id, { music_style: e.target.value })}
              className="w-full rounded-[6px] border border-[color:var(--aw-border)] bg-[rgba(255,255,255,0.03)] text-[12px] text-[color:var(--aw-text)] px-3 py-2 focus:outline-none focus:border-[color:var(--aw-accent)] transition-colors duration-150"
            />
          </div>

          {/* Lyrics + Gender — only for non-instrumental */}
          {!isInstrumental && (
            <>
              <div>
                <label className="block text-[10px] text-[color:var(--aw-text-3)] font-medium uppercase tracking-[0.07em] mb-1">
                  Lyrics
                </label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setEdit(track.id, { lyrics: e.target.value })}
                  rows={4}
                  className="w-full rounded-[6px] border border-[color:var(--aw-border)] bg-[rgba(255,255,255,0.03)] text-[12px] text-[color:var(--aw-text)] px-3 py-2 resize-y focus:outline-none focus:border-[color:var(--aw-accent)] transition-colors duration-150"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>

              <div>
                <label className="block text-[10px] text-[color:var(--aw-text-3)] font-medium uppercase tracking-[0.07em] mb-1">
                  Gender
                </label>
                <div className="flex gap-1">
                  {["Male", "Female"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEdit(track.id, { gender: g })}
                      className="px-4 py-[5px] rounded-[6px] text-[11px] font-medium transition-all duration-150"
                      style={{
                        background:
                          gender === g
                            ? "rgba(232,160,85,0.15)"
                            : "rgba(255,255,255,0.04)",
                        color:
                          gender === g ? "var(--aw-accent)" : "var(--aw-text-3)",
                        border:
                          gender === g
                            ? "1px solid rgba(232,160,85,0.3)"
                            : "1px solid var(--aw-border)",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Output length */}
          <div>
            <label className="block text-[10px] text-[color:var(--aw-text-3)] font-medium uppercase tracking-[0.07em] mb-1">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={outputLength ?? ""}
              placeholder="auto"
              onChange={(e) =>
                setEdit(track.id, {
                  output_length: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-28 rounded-[6px] border border-[color:var(--aw-border)] bg-[rgba(255,255,255,0.03)] text-[12px] text-[color:var(--aw-text)] px-3 py-2 focus:outline-none focus:border-[color:var(--aw-accent)] transition-colors duration-150"
            />
          </div>
        </div>

        {/* Inline replan panel */}
        {replanOpen && (
          <div className="mt-4 pt-4 border-t border-[color:var(--aw-border)]">
            <label className="block text-[10px] text-[color:var(--aw-text-3)] font-medium uppercase tracking-[0.07em] mb-1">
              Custom Script Excerpt (optional, max 500 chars)
            </label>
            <textarea
              value={replanExcerpt}
              onChange={(e) =>
                setReplanExcerpt(e.target.value.slice(0, 500))
              }
              rows={3}
              placeholder="Paste a specific excerpt for AI to re-analyse this track…"
              className="w-full rounded-[6px] border border-[color:var(--aw-border)] bg-[rgba(255,255,255,0.03)] text-[12px] text-[color:var(--aw-text)] px-3 py-2 resize-y mb-2 focus:outline-none focus:border-[color:var(--aw-accent)] transition-colors duration-150"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            <div className="flex items-center gap-2 justify-between">
              <span className="text-[10px] text-[color:var(--aw-text-3)]">
                {replanExcerpt.length}/500
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplanOpen(false);
                    setReplanExcerpt("");
                  }}
                  className="px-3 py-[5px] rounded-[6px] text-[11px] text-[color:var(--aw-text-3)] border border-[color:var(--aw-border)] bg-transparent transition-colors duration-150 hover:text-[color:var(--aw-text-2)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReplan}
                  disabled={isReplanning}
                  className="px-4 py-[5px] rounded-[6px] text-[11px] font-medium text-black transition-opacity duration-150 hover:opacity-85 disabled:opacity-50"
                  style={{
                    background: "var(--aw-accent)",
                  }}
                >
                  {isReplanning ? "Replanning…" : "Replan"}
                </button>
              </div>
            </div>
            {replanError && (
              <p className="text-[11px] text-[color:var(--aw-red)] mt-1">
                {replanError}
              </p>
            )}
          </div>
        )}
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
