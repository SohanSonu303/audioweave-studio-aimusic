"use client";

import { useState } from "react";
import Link from "next/link";
import type { AlbumResponse } from "@/lib/api/album";
import { useApproveAlbum } from "@/lib/api/album";
import { useMe } from "@/lib/api/auth";
import { TrackResultCard } from "@/components/album/track-result-card";
import { useAlbumStore } from "@/stores/album-store";
import { TOKENS_PER_ALBUM_TRACK } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface FailedViewProps {
  album: AlbumResponse;
}

export function FailedView({ album }: FailedViewProps) {
  const tracks = album.tracks ?? [];
  const completedTracks = tracks.filter(
    (t) => t.status === "COMPLETED" && t.task_id,
  );
  const failedTracks = tracks.filter(
    (t) => t.status === "FAILED" || t.status === "ERROR",
  );

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Banner */}
      <div
        className="rounded-[10px] px-5 py-4 border"
        style={{
          background: "rgba(224,96,96,0.06)",
          borderColor: "rgba(224,96,96,0.15)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[16px]">⚠</span>
          <div>
            <p className="text-[13px] font-medium text-[color:var(--aw-red)] mb-[2px]">
              Generation failed for {failedTracks.length} track{failedTracks.length !== 1 ? "s" : ""}
            </p>
            <p className="text-[11px] text-[color:var(--aw-text-3)]">
              {completedTracks.length > 0
                ? `${completedTracks.length} track${completedTracks.length !== 1 ? "s" : ""} completed successfully. You can retry the failed ones.`
                : "You can retry all tracks."}
            </p>
          </div>
        </div>
      </div>

      {/* Completed tracks — keep their players */}
      {completedTracks.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] text-[color:var(--aw-text-3)] font-medium uppercase tracking-[0.07em]">
            Completed
          </h3>
          {completedTracks.map((track, i) => (
            <div key={track.id} className="fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <TrackResultCard track={track} albumId={album.id} />
            </div>
          ))}
        </div>
      )}

      {/* Failed tracks — show status */}
      {failedTracks.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[10px] text-[color:var(--aw-text-3)] font-medium uppercase tracking-[0.07em]">
            Failed
          </h3>
          {failedTracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-3 px-4 py-[10px] rounded-[8px] border border-[color:var(--aw-border)] bg-[color:var(--aw-card)]"
            >
              <span className="w-5 h-5 rounded-[4px] flex items-center justify-center text-[10px] font-bold bg-[rgba(224,96,96,0.15)] text-[color:var(--aw-red)] flex-shrink-0">
                {track.track_number}
              </span>
              <span className="flex-1 text-[12px] text-[color:var(--aw-text-2)]">
                Track {track.track_number} — {track.track_type}
              </span>
              <span className="px-[10px] py-[3px] rounded-[9999px] text-[10px] font-medium bg-[rgba(224,96,96,0.12)] text-[color:var(--aw-red)]">
                ✗ Failed
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Retry button */}
      <RetryButton failedCount={failedTracks.length} />

      {/* Regenerate dialog (reused from results-view context) */}
      <RetryDialog albumId={album.id} failedCount={failedTracks.length} />
    </div>
  );
}

/* ── Retry button ── */
function RetryButton({ failedCount }: { failedCount: number }) {
  const setRetryDialogOpen = useAlbumStore((s) => s.setRetryDialogOpen);

  return (
    <div className="flex justify-center pt-2">
      <button
        type="button"
        onClick={() => setRetryDialogOpen(true)}
        className="flex items-center gap-2 px-6 py-[10px] rounded-[9999px] text-[13px] font-semibold text-black tracking-[0.01em] transition-opacity duration-150 hover:opacity-85"
        style={{
          background: "var(--aw-accent)",
          boxShadow: "0 2px 12px rgba(232,160,85,0.25)",
        }}
      >
        ✦ Retry Failed Tracks ({failedCount})
      </button>
    </div>
  );
}

/* ── Retry dialog ── */
function RetryDialog({
  albumId,
  failedCount,
}: {
  albumId: string;
  failedCount: number;
}) {
  const { data: me } = useMe();
  const open = useAlbumStore((s) => s.retryDialogOpen);
  const setOpen = useAlbumStore((s) => s.setRetryDialogOpen);
  const approveAlbum = useApproveAlbum(albumId);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const cost = failedCount * TOKENS_PER_ALBUM_TRACK;
  const balance = me?.token_balance?.balance ?? 0;
  const canAfford = balance >= cost;

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryError(null);
    try {
      await approveAlbum.mutateAsync({ track_updates: [] });
      setOpen(false);
    } catch (err) {
      const { ApiError } = await import("@/lib/api/client");
      if (err instanceof ApiError && err.status === 402) {
        setRetryError("insufficient_credits");
      } else {
        setRetryError(
          err instanceof Error ? err.message : "Retry failed — try again",
        );
      }
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Retry Failed Tracks</DialogTitle>
          <DialogDescription>
            Retrying <strong>{failedCount}</strong> failed track{failedCount !== 1 ? "s" : ""} costs{" "}
            <strong>{cost.toLocaleString()}</strong> tokens. You have{" "}
            <strong>{balance.toLocaleString()}</strong> tokens.
          </DialogDescription>
        </DialogHeader>

        {(!canAfford || retryError === "insufficient_credits") && (
          <div
            className="rounded-[8px] px-4 py-3 text-[12px] border"
            style={{
              background: "rgba(224,96,96,0.08)",
              borderColor: "rgba(224,96,96,0.2)",
              color: "var(--aw-red)",
            }}
          >
            Insufficient tokens.{" "}
            <Link href="/subscription" className="underline font-medium">
              Upgrade your plan →
            </Link>
          </div>
        )}

        {retryError && retryError !== "insufficient_credits" && (
          <div
            className="rounded-[8px] px-4 py-3 text-[12px] border"
            style={{
              background: "rgba(224,96,96,0.08)",
              borderColor: "rgba(224,96,96,0.2)",
              color: "var(--aw-red)",
            }}
          >
            {retryError}
          </div>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-[8px] text-[12px] text-[color:var(--aw-text-2)] border border-[color:var(--aw-border)] bg-transparent transition-colors duration-150 hover:bg-[rgba(255,255,255,0.04)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRetry}
            disabled={!canAfford || isRetrying}
            className="px-5 py-2 rounded-[8px] text-[12px] font-semibold transition-opacity duration-150 hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canAfford ? "var(--aw-accent)" : "rgba(232,160,85,0.2)",
              color: canAfford ? "#000" : "var(--aw-accent)",
            }}
          >
            {isRetrying ? "Retrying…" : "Confirm & Retry"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
