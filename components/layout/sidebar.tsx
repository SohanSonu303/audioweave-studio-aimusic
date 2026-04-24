"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/constants";
import { Icon, icons } from "@/components/ui/icon";
import { useMe } from "@/lib/api/auth";

export function Sidebar() {
  const pathname = usePathname();
  const { data: me } = useMe();
  const balance = me?.token_balance;
  const used = balance?.used_tokens ?? 0;
  const total = balance?.total_tokens ?? 10000;
  const remaining = balance?.balance ?? total - used;
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const planName = me?.subscription?.plan ?? "Free";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="w-[200px] bg-[color:var(--aw-surface)] border-r border-[color:var(--aw-border)] flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-[14px] pt-4 pb-[10px] border-b border-[color:var(--aw-border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--aw-accent), #a070e0)", boxShadow: "0 2px 12px rgba(232,160,85,0.3)" }}>
            <Icon d={icons.waveform} size={14} color="white" />
          </div>
          <span className="text-[14px] font-semibold text-[color:var(--aw-text)] tracking-[-0.02em]">
            AudioWeave
          </span>
        </div>
      </div>

      {/* Workspace switcher */}
      <div className="px-[10px] py-2 border-b border-[color:var(--aw-border)]">
        <div className="flex items-center gap-1.5 px-2 py-[6px] rounded-[8px] bg-[rgba(255,255,255,0.04)] cursor-pointer">
          <div className="w-5 h-5 rounded-[6px] flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--aw-accent), #a070e0)" }}>
            A
          </div>
          <span className="text-[12px] font-medium text-[color:var(--aw-text)] flex-1">My Studio</span>
          <Icon d={icons.chevronD} size={12} color="var(--aw-text-3)" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-[10px] py-2 flex flex-col gap-[1px]">
        <div className="text-[10px] text-[color:var(--aw-text-3)] font-medium tracking-[0.07em] uppercase px-2 pt-[6px] pb-1">
          Tools
        </div>
        {NAV.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.id}
              href={n.href}
              className="flex items-center gap-[9px] px-[10px] py-2 rounded-[8px] text-[13px] transition-all duration-150 group"
              style={{
                fontWeight: active ? 500 : 400,
                background: active ? "rgba(232,160,85,0.12)" : "transparent",
                color: active ? "var(--aw-accent)" : "var(--aw-text-2)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--aw-text)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = active ? "rgba(232,160,85,0.12)" : "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = active ? "var(--aw-accent)" : "var(--aw-text-2)";
              }}
            >
              <Icon d={n.icon} size={15} color="currentColor" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-[10px] border-t border-[color:var(--aw-border)]">
        {/* Credits block */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-[color:var(--aw-border)] rounded-[10px] px-3 py-[10px] mb-2">
          <div className="flex justify-between items-baseline mb-[5px]">
            <span className="text-[11px] font-semibold text-[color:var(--aw-text)] tracking-[-0.01em]">
              {remaining.toLocaleString()}
            </span>
            <span className="text-[10px] text-[color:var(--aw-accent)] font-medium capitalize">{planName}</span>
          </div>
          <div className="text-[10px] text-[color:var(--aw-text-3)] mb-1.5">credits remaining</div>
          <div className="h-[3px] bg-[rgba(255,255,255,0.07)] rounded-[2px]">
            <div
              className="h-full rounded-[2px]"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--aw-accent), rgba(232,160,85,0.5))" }}
            />
          </div>
        </div>

        {/* Upgrade button */}
        <Link
          href="/subscription"
          className="flex items-center justify-center gap-[7px] w-full py-2 rounded-[8px] text-[12px] font-semibold text-black mb-1 tracking-[0.01em] transition-opacity duration-150 hover:opacity-85"
          style={{ background: "var(--aw-accent)", boxShadow: "0 2px 12px rgba(232,160,85,0.25)" }}
        >
          ✦ Upgrade
        </Link>

        {/* Settings */}
        <button className="flex items-center gap-2 w-full px-2 py-[6px] rounded-[8px] text-[12px] text-[color:var(--aw-text-3)] cursor-pointer bg-transparent border-none">
          <Icon d={icons.settings} size={14} />
          Settings
        </button>
      </div>
    </div>
  );
}
