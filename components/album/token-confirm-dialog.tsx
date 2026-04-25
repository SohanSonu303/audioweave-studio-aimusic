"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMe } from "@/lib/api/auth";
import { useApproveAlbum } from "@/lib/api/album";
import type { TrackUpdate } from "@/lib/api/album";
import { useAlbumStore, type TrackEdit } from "@/stores/album-store";
import { TOKENS_PER_ALBUM_TRACK } from "@/lib/constants";

interface TokenConfirmDialogProps {
  albumId: string;
  trackCount: number;
  trackIds: string[];
}

export function TokenConfirmDialog({
  albumId,
  trackCount,
  trackIds,
}: TokenConfirmDialogProps) {
  const { data: me } = useMe();
  const approveAlbum = useApproveAlbum(albumId);

  const open = useAlbumStore((s) => s.approveDialogOpen);
  const setOpen = useAlbumStore((s) => s.setApproveDialogOpen);
  const edits = useAlbumStore((s) => s.edits);
  const clearEdits = useAlbumStore((s) => s.clearEdits);

  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const cost = trackCount * TOKENS_PER_ALBUM_TRACK;
  const balance = me?.token_balance?.balance ?? 0;
  const canAfford = balance >= cost;

  const handleConfirm = async () => {
    setIsApproving(true);
    setApproveError(null);
    try {
      // Build track_updates from edits — only include tracks the user touched
      const trackUpdates: TrackUpdate[] = [];
      for (const tid of trackIds) {
        const edit: TrackEdit | undefined = edits[tid];
        if (!edit) continue;
        const update: TrackUpdate = { id: tid };
        if (edit.prompt !== undefined) update.prompt = edit.prompt;
        if (edit.music_style !== undefined) update.music_style = edit.music_style;
        if (edit.lyrics !== undefined) update.lyrics = edit.lyrics;
        if (edit.make_instrumental !== undefined) update.make_instrumental = edit.make_instrumental;
        if (edit.gender !== undefined) update.gender = edit.gender;
        if (edit.output_length !== undefined) update.output_length = edit.output_length;
        trackUpdates.push(update);
      }

      await approveAlbum.mutateAsync(
        trackUpdates.length > 0 ? { track_updates: trackUpdates } : { track_updates: [] },
      );
      clearEdits();
      setOpen(false);
    } catch (err) {
      const { ApiError } = await import("@/lib/api/client");
      if (err instanceof ApiError && err.status === 402) {
        setApproveError("insufficient_credits");
      } else if (err instanceof ApiError && err.status === 400) {
        // Wrong status — album state changed; close and let refetch handle it
        setOpen(false);
      } else {
        setApproveError(
          err instanceof Error ? err.message : "Generation failed — try again",
        );
      }
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Generation</DialogTitle>
          <DialogDescription>
            Generating <strong>{trackCount}</strong> track{trackCount !== 1 ? "s" : ""} costs{" "}
            <strong>
              {trackCount} × {TOKENS_PER_ALBUM_TRACK} = {cost.toLocaleString()}
            </strong>{" "}
            tokens. You have <strong>{balance.toLocaleString()}</strong> tokens.
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

        {approveError && approveError !== "insufficient_credits" && (
          <div
            className="rounded-[8px] px-4 py-3 text-[12px] border"
            style={{
              background: "rgba(224,96,96,0.08)",
              borderColor: "rgba(224,96,96,0.2)",
              color: "var(--aw-red)",
            }}
          >
            {approveError}
          </div>
        )}

        {approveError === "insufficient_credits" && canAfford && (
          <div
            className="rounded-[8px] px-4 py-3 text-[12px] border"
            style={{
              background: "rgba(224,96,96,0.08)",
              borderColor: "rgba(224,96,96,0.2)",
              color: "var(--aw-red)",
            }}
          >
            Insufficient credits.{" "}
            <Link href="/subscription" className="underline font-medium">
              Upgrade your plan →
            </Link>
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
            onClick={handleConfirm}
            disabled={!canAfford || isApproving}
            className="px-5 py-2 rounded-[8px] text-[12px] font-semibold transition-opacity duration-150 hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canAfford ? "var(--aw-accent)" : "rgba(232,160,85,0.2)",
              color: canAfford ? "#000" : "var(--aw-accent)",
            }}
          >
            {isApproving ? "Approving…" : "Confirm & Generate"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
