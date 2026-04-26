"use client";

import { CreateAlbumForm } from "@/components/album/create-form";
import Link from "next/link";
import { Icon, icons } from "@/components/ui/icon";

export default function NewAlbumPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[720px] mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/album"
          className="inline-flex items-center gap-1 text-[12px] text-[color:var(--aw-text-3)] mb-6 transition-colors duration-150 hover:text-[color:var(--aw-text-2)]"
        >
          <Icon d={icons.chevronR} size={12} className="rotate-180" />
          Back to Albums
        </Link>

        {/* Page title */}
        <h1
          className="font-light text-[28px] tracking-[-0.3px] text-[color:var(--aw-text)] mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          New Album
        </h1>
        <p className="text-[12px] text-[color:var(--aw-text-2)] mb-8">
          Paste your script and choose how many tracks to generate. AI will analyse the narrative and compose a full soundtrack.
        </p>

        <CreateAlbumForm />
      </div>
    </div>
  );
}
