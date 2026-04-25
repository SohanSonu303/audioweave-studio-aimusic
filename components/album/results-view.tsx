"use client";

import { useState } from "react";
import Link from "next/link";
import type { AlbumResponse } from "@/lib/api/album";
import { useRegenerateTrack } from "@/lib/api/album";
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

interface ResultsViewProps {
  album: AlbumResponse;
}

export function ResultsView({ album }: ResultsViewProps) {
  const tracks = album.tracks ?? [];
  const tracksWithTask = tracks.filter((t) => t.task_id);

  return (
    <div className="flex flex-col gap-4 pb-8">
      {tracksWithTask.map((track, i) => (
        <div
          key={track.id}
          className="fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <TrackResultCard track={track} albumId={album.id} />
        </div>
      ))}

      {/* Regenerate confirm dialog */}
      <RegenerateDialog albumId={album.id} />
    </div>
  );
}

/* ── Regenerate single track dialog ── */
function RegenerateDialog({ albumId }: { albumId: string }) {
  const trackId = useAlbumStore((s) => s.regenerateDialogTrackId);
  const setTrackId = useAlbumStore((s) => s.setRegenerateDialogTrackId);

  return (
    <Dialog open={!!trackId} onOpenChange={(open) => { if (!open) setTrackId(null); }}>
      {trackId && (
        <RegenerateDialogContent
          albumId={albumId}
          trackId={trackId}
          onClose={() => setTrackId(null)}
        />
      )}
    </Dialog>
  );
}

/* Mounts only when trackId is a real string — hook gets a valid URL */
function RegenerateDialogContent({
  albumId,
  trackId,
  onClose,
}: {
  albumId: string;
  trackId: string;
  onClose: () => void;
}) {
  const { data: me } = useMe();
  const regenerate = useRegenerateTrack(albumId, trackId);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  const balance = me?.token_balance?.balance ?? 0;
  const canAfford = balance >= TOKENS_PER_ALBUM_TRACK;

  const handleConfirm = async () => {
    setIsRegenerating(true);
    setRegenError(null);
    try {
      await regenerate.mutateAsync();
      onClose();
    } catch (err) {
      const { ApiError } = await import("@/lib/api/client");
      if (err instanceof ApiError && err.status === 402) {
        setRegenError("Insufficient credits. Upgrade your plan to continue.");
      } else {
        setRegenError(
          err instanceof Error ? err.message : "Regeneration failed — try again",
        );
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Regenerate Track</DialogTitle>
        <DialogDescription>
          Regenerating this track costs <strong>{TOKENS_PER_ALBUM_TRACK}</strong> tokens. You have{" "}
          <strong>{balance.toLocaleString()}</strong> tokens.
        </DialogDescription>
      </DialogHeader>

      {!canAfford && (
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

      {regenError && (
        <div
          className="rounded-[8px] px-4 py-3 text-[12px] border"
          style={{
            background: "rgba(224,96,96,0.08)",
            borderColor: "rgba(224,96,96,0.2)",
            color: "var(--aw-red)",
          }}
        >
          {regenError}
        </div>
      )}

      <DialogFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-[8px] text-[12px] text-[color:var(--aw-text-2)] border border-[color:var(--aw-border)] bg-transparent transition-colors duration-150 hover:bg-[rgba(255,255,255,0.04)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canAfford || isRegenerating}
          className="px-5 py-2 rounded-[8px] text-[12px] font-semibold transition-opacity duration-150 hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canAfford ? "var(--aw-accent)" : "rgba(232,160,85,0.2)",
            color: canAfford ? "#000" : "var(--aw-accent)",
          }}
        >
          {isRegenerating ? "Regenerating…" : "Confirm"}
        </button>
      </DialogFooter>
    </DialogContent>
  );
}
