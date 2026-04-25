import Link from "next/link";
import { Icon, icons } from "@/components/ui/icon";

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-[color:var(--aw-text-3)]">
      <div
        className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(232,160,85,0.12), rgba(160,112,224,0.10))",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Icon d={icons.film} size={32} color="var(--aw-text-3)" />
      </div>
      <div className="text-center max-w-[320px]">
        <div
          className="font-light text-[22px] text-[color:var(--aw-text-2)] mb-[6px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          No albums yet
        </div>
        <div className="text-[12px] leading-[1.5] mb-4">
          Create your first album — paste a script and let AI compose a multi-track soundtrack.
        </div>
        <Link
          href="/album/new"
          className="inline-flex items-center gap-[6px] px-5 py-[9px] rounded-[9999px] text-[12px] font-semibold text-black tracking-[0.01em] transition-opacity duration-150 hover:opacity-85"
          style={{
            background: "var(--aw-accent)",
            boxShadow: "0 2px 12px rgba(232,160,85,0.25)",
          }}
        >
          ✦ New Album
        </Link>
      </div>
    </div>
  );
}
