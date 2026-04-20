import Link from "next/link";

export function CreditsSummary() {
  return (
    <div className="mt-4 px-4 py-[14px] rounded-[12px] bg-[color:var(--aw-card)] border border-[color:var(--aw-border)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-[color:var(--aw-text)]">Credits used</span>
        <Link href="/subscription" className="text-[10px] text-[color:var(--aw-accent)] bg-transparent border-none cursor-pointer font-medium">
          Upgrade ↗
        </Link>
      </div>
      <div className="h-1 bg-[rgba(255,255,255,0.07)] rounded-[3px] mb-[6px]">
        <div
          className="h-full rounded-[3px]"
          style={{ width: "54%", background: "linear-gradient(90deg, var(--aw-accent), rgba(232,160,85,0.5))" }}
        />
      </div>
      <div className="text-[10px] text-[color:var(--aw-text-3)]">5,400 / 10,000 credits · Pro Plan</div>
    </div>
  );
}
