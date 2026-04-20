import { Icon, icons } from "@/components/ui/icon";

export function CreditsCards() {
  return (
    <div className="flex gap-3 mb-6">
      {/* Credits used */}
      <div className="flex-1 bg-[color:var(--aw-card)] border border-[color:var(--aw-border)] rounded-[14px] p-[16px_20px]">
        <div className="flex items-center justify-between mb-[10px]">
          <span className="text-[13px] font-medium text-[color:var(--aw-text-2)]">Credits used</span>
          <span className="text-[12px] font-semibold text-[color:var(--aw-text)]">
            5,400{" "}
            <span className="text-[color:var(--aw-text-3)] font-normal">/ 10,000 credits</span>
          </span>
        </div>
        <div className="h-[5px] bg-[rgba(255,255,255,0.07)] rounded-[4px]">
          <div
            className="h-full rounded-[4px]"
            style={{
              width: "54%",
              background: "linear-gradient(90deg, var(--aw-accent), rgba(232,160,85,0.5))",
              boxShadow: "0 0 8px rgba(232,160,85,0.3)",
            }}
          />
        </div>
      </div>

      {/* Current plan */}
      <div className="flex-1 bg-[color:var(--aw-card)] border border-[color:var(--aw-border)] rounded-[14px] p-[16px_20px] flex items-center justify-between">
        <div>
          <div className="text-[12px] text-[color:var(--aw-text-3)] mb-1">Current plan</div>
          <div className="text-[14px] font-semibold text-[color:var(--aw-text)]">Pro Plan</div>
        </div>
        <button className="flex items-center gap-[6px] px-4 py-[7px] rounded-[8px] text-[12px] font-medium bg-[rgba(255,255,255,0.06)] border border-[color:var(--aw-border)] text-[color:var(--aw-text-2)] cursor-pointer">
          <Icon d={icons.settings} size={13} /> Billing
        </button>
      </div>
    </div>
  );
}
