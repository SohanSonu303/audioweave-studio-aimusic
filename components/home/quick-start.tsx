"use client";

import Link from "next/link";
import { Icon, icons } from "@/components/ui/icon";

const QUICK_ACTIONS = [
  { label: "Generate a Song", sub: "Describe mood, theme, vocal style", href: "/generate", color: "#e8a055" },
  { label: "Score a Script", sub: "AI maps music to your scenes", href: "/album", color: "#a070e0" },
  { label: "Separate Stems", sub: "Isolate vocals, bass, drums", href: "/stems", color: "#60c090" },
] as const;

export function QuickStart() {
  return (
    <div>
      <div className="text-[14px] font-semibold text-[color:var(--aw-text)] mb-[14px]">Quick start</div>
      <div className="flex flex-col gap-2">
        {QUICK_ACTIONS.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex items-center gap-3 px-[14px] py-3 rounded-[12px] bg-[color:var(--aw-card)] border border-[color:var(--aw-border)] cursor-pointer text-left transition-all duration-150 block"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--aw-card-hi)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = `${q.color}35`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--aw-card)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--aw-border)";
            }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: q.color, boxShadow: `0 0 6px ${q.color}` }}
            />
            <div className="flex-1">
              <div className="text-[12px] font-medium text-[color:var(--aw-text)]">{q.label}</div>
              <div className="text-[11px] text-[color:var(--aw-text-3)] mt-[2px]">{q.sub}</div>
            </div>
            <Icon d={icons.chevronR} size={13} color="var(--aw-text-3)" />
          </Link>
        ))}
      </div>
    </div>
  );
}
