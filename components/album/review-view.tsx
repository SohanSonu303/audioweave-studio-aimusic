"use client";

import type { AlbumResponse } from "@/lib/api/album";
import { TrackEditCard } from "@/components/album/track-edit-card";
import { GenerateBar } from "@/components/album/generate-bar";
import { TokenConfirmDialog } from "@/components/album/token-confirm-dialog";

interface ReviewViewProps {
  album: AlbumResponse;
}

export function ReviewView({ album }: ReviewViewProps) {
  const tracks = album.tracks ?? [];
  const trackIds = tracks.map((t) => t.id);

  return (
    <div className="flex flex-col">
      {/* Track cards */}
      <div className="flex flex-col gap-4 pb-20">
        {tracks.map((track, i) => (
          <div
            key={track.id}
            className="fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <TrackEditCard track={track} albumId={album.id} />
          </div>
        ))}
      </div>

      {/* Sticky footer */}
      <GenerateBar trackCount={tracks.length} />

      {/* Approve confirm dialog */}
      <TokenConfirmDialog
        albumId={album.id}
        trackCount={tracks.length}
        trackIds={trackIds}
      />
    </div>
  );
}
