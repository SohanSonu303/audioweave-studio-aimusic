"use client";

import Link from "next/link";
import { useAlbums } from "@/lib/api/album";
import { AlbumCard } from "@/components/album/album-card";
import { EmptyState } from "@/components/album/empty-state";

export default function AlbumPage() {
  const { data: albums, isLoading, error } = useAlbums();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-8 pt-8 pb-2 flex items-end justify-between">
        <div>
          <h1
            className="font-light text-[28px] tracking-[-0.3px] text-[color:var(--aw-text)] mb-[4px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Albums
          </h1>
          <p className="text-[12px] text-[color:var(--aw-text-2)]">
            AI-composed multi-track soundtracks from your scripts
          </p>
        </div>

        <Link
          href="/album/new"
          className="flex items-center gap-[6px] px-5 py-[9px] rounded-[9999px] text-[12px] font-semibold text-black tracking-[0.01em] transition-opacity duration-150 hover:opacity-85 flex-shrink-0"
          style={{
            background: "var(--aw-accent)",
            boxShadow: "0 2px 12px rgba(232,160,85,0.25)",
          }}
        >
          ✦ New Album
        </Link>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {isLoading ? (
          /* Loading skeletons */
          <div className="grid grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[16px] overflow-hidden"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="skeleton w-full aspect-[16/9]" />
                <div className="bg-[color:var(--aw-card)] px-4 py-3 border border-t-0 border-[color:var(--aw-border)] rounded-b-[16px]">
                  <div className="skeleton h-[14px] w-3/5 mb-2" />
                  <div className="skeleton h-[11px] w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="text-[14px] text-[color:var(--aw-red)]">
              Failed to load albums
            </div>
            <div className="text-[12px] text-[color:var(--aw-text-3)]">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
            </div>
          </div>
        ) : !albums || albums.length === 0 ? (
          <EmptyState />
        ) : (
          /* Album grid */
          <div className="grid grid-cols-3 gap-5">
            {albums.map((album, i) => (
              <AlbumCard key={album.id} album={album} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
