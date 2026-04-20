"use client";

import Link from "next/link";
import { Icon, icons } from "@/components/ui/icon";

const QUICK_TOOLS = [
  { label: "Generate", icon: icons.bolt, color: "#e8a055", href: "/generate", desc: "Create music & songs with AI" },
  { label: "Library", icon: icons.library, color: "#6090e0", href: "/library", desc: "Your saved generations" },
  { label: "Album", icon: icons.film, color: "#a070e0", href: "/album", desc: "Score your script with AI" },
  { label: "Stem Separation", icon: icons.scissors, color: "#60c090", href: "/stems", desc: "Isolate audio layers" },
] as const;

export function QuickToolGrid() {
  return (
    <div className="grid grid-cols-4 gap-3 mb-9">
      {QUICK_TOOLS.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="rounded-[16px] bg-[color:var(--aw-card)] border border-[color:var(--aw-border)] p-[20px_16px_16px] text-left cursor-pointer transition-all duration-200 relative overflow-hidden block"
          style={{ boxShadow: "var(--shadow-card)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--aw-card-hi)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = `${tool.color}40`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--aw-card)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--aw-border)";
          }}
        >
          {/* Background glow */}
          <div
            className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${tool.color}15, transparent 70%)` }}
          />
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-[14px]"
            style={{
              background: `${tool.color}18`,
              border: `1px solid ${tool.color}30`,
            }}
          >
            <Icon d={tool.icon} size={18} color={tool.color} />
          </div>
          <div className="text-[13px] font-semibold text-[color:var(--aw-text)] mb-1">{tool.label}</div>
          <div className="text-[11px] text-[color:var(--aw-text-3)] leading-[1.4]">{tool.desc}</div>
        </Link>
      ))}
    </div>
  );
}
