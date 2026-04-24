"use client";

import Link from "next/link";
import { useMe } from "@/lib/api/auth";

export function CreditsSummary() {
  const { data: me } = useMe();
  const tokenBalance = me?.token_balance;
  const remaining = tokenBalance?.balance ?? 0;
  const total = tokenBalance?.total_tokens ?? 10000;
  const remainingPct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const planName = me?.subscription?.plan ?? "Free";

  return (
    <div className="mt-4 px-4 py-[14px] rounded-[12px] bg-[color:var(--aw-card)] border border-[color:var(--aw-border)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-[color:var(--aw-text)]">Credits left</span>
        <Link href="/subscription" className="text-[10px] text-[color:var(--aw-accent)] bg-transparent border-none cursor-pointer font-medium">
          Upgrade ↗
        </Link>
      </div>
      <div className="h-1 bg-[rgba(255,255,255,0.07)] rounded-[3px] mb-[6px]">
        <div
          className="h-full rounded-[3px]"
          style={{
            width: `${remainingPct}%`,
            background: "linear-gradient(90deg, var(--aw-accent), rgba(232,160,85,0.5))",
          }}
        />
      </div>
      <div className="text-[10px] text-[color:var(--aw-text-3)]">
        {remaining.toLocaleString()} credits left · {planName} Plan
      </div>
    </div>
  );
}
