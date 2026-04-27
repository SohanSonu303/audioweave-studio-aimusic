"use client";

import { useAlbumPlanningPoll } from "@/lib/api/album";
import { AlbumHeader } from "@/components/album/album-header";
import { PlanningView } from "@/components/album/planning-view";
import { ReviewView } from "@/components/album/review-view";
import { GeneratingView } from "@/components/album/generating-view";
import { ResultsView } from "@/components/album/results-view";
import { FailedView } from "@/components/album/failed-view";

interface AlbumDetailClientProps {
  albumId: string;
}

export function AlbumDetailClient({ albumId }: AlbumDetailClientProps) {
  const { data: album, isLoading, error } = useAlbumPlanningPoll(albumId);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[900px] mx-auto">
          {/* Skeleton header */}
          <div className="skeleton h-4 w-24 mb-4" />
          <div className="skeleton h-8 w-72 mb-2" />
          <div className="flex gap-2 mb-8">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-24 rounded-full" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
          {/* Skeleton body */}
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="skeleton h-24 rounded-[12px]"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] text-[color:var(--aw-red)] mb-1">
            Failed to load album
          </p>
          <p className="text-[12px] text-[color:var(--aw-text-3)]">
            {error instanceof Error ? error.message : "Album not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[900px] mx-auto">
        <AlbumHeader album={album} />

        {/* Status-driven view */}
        {album.status === "PLANNING" && <PlanningView />}
        {album.status === "PLANNED" && <ReviewView album={album} />}
        {album.status === "GENERATING" && <GeneratingView albumId={album.id} />}
        {album.status === "COMPLETED" && <ResultsView album={album} />}
        {album.status === "FAILED" && <FailedView album={album} />}
      </div>
    </div>
  );
}
