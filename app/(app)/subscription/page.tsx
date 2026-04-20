import { CreditsCards } from "@/components/subscription/credits-cards";
import { PlanCard } from "@/components/subscription/plan-card";
import { PLANS } from "@/lib/constants";

export default function SubscriptionPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-7 py-4 border-b border-[color:var(--aw-border)] flex-shrink-0">
        <h1
          className="font-light text-[32px] tracking-[-0.4px] mb-[2px] text-[color:var(--aw-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Subscription
        </h1>
        <p className="text-[12px] text-[color:var(--aw-text-2)]">Manage your plan and billing</p>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6">
        <CreditsCards />

        <div className="mb-5">
          <span className="text-[12px] text-[color:var(--aw-text-3)] px-3 py-[5px] bg-[color:var(--aw-card)] border border-[color:var(--aw-border)] rounded-[8px]">
            Monthly billing
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} {...plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
