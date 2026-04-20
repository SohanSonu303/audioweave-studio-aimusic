"use client";

interface PlanCardProps {
  id: string;
  name: string;
  price: number;
  credits: string;
  projects: number;
  current: boolean;
  popular: boolean;
  features: readonly string[];
}

export function PlanCard({ name, price, current, popular, features }: PlanCardProps) {
  return (
    <div
      className="rounded-[16px] p-[20px_16px] flex flex-col relative"
      style={{
        background: popular ? "rgba(232,160,85,0.06)" : "var(--aw-card)",
        border: `1px solid ${popular ? "rgba(232,160,85,0.3)" : current ? "rgba(255,255,255,0.15)" : "var(--aw-border)"}`,
      }}
    >
      {popular && (
        <div
          className="absolute top-[-10px] left-1/2 -translate-x-1/2 text-[10px] font-bold px-[10px] py-[3px] rounded-[var(--radius-pill)] tracking-[0.04em] text-black"
          style={{ background: "var(--aw-accent)" }}
        >
          Popular
        </div>
      )}

      <div className="text-[14px] font-semibold text-[color:var(--aw-text)] mb-2">{name}</div>

      <div className="mb-4">
        <span
          className="font-light text-[28px] tracking-[-0.5px] text-[color:var(--aw-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {price === 0 ? "$0" : `$${price}`}
        </span>
        <span className="text-[11px] text-[color:var(--aw-text-3)]">/mo</span>
      </div>

      <button
        className="w-full py-[9px] rounded-[8px] text-[12px] font-semibold mb-4 transition-opacity duration-150 border"
        style={{
          background: popular ? "var(--aw-accent)" : current ? "transparent" : "rgba(255,255,255,0.07)",
          color: popular ? "#000" : current ? "var(--aw-text-3)" : "var(--aw-text)",
          borderColor: current ? "var(--aw-border)" : "transparent",
          cursor: current ? "default" : "pointer",
        }}
        onMouseEnter={(e) => { if (!current) (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
      >
        {current ? "✓ Current plan" : "Upgrade"}
      </button>

      <div className="flex flex-col gap-[7px]">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex items-start gap-[7px] text-[11px] leading-[1.4]"
            style={{ color: i === features.length - 1 && f.startsWith("Everything") ? "var(--aw-text-3)" : "var(--aw-text-2)" }}
          >
            <span
              className="flex-shrink-0 text-[12px] mt-[-1px]"
              style={{ color: popular ? "var(--aw-accent)" : "rgba(255,255,255,0.3)" }}
            >
              {f.startsWith("Everything") ? "+" : "✓"}
            </span>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
