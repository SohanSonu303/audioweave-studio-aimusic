export default function MarketplacePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-[5px] pl-2 mb-5"
          style={{ background: "rgba(232,160,85,0.12)", border: "1px solid rgba(232,160,85,0.25)" }}
        >
          <span
            className="text-[10px] font-bold text-black rounded-[4px] px-[6px] py-[1px] tracking-[0.04em]"
            style={{ background: "var(--aw-accent)" }}
          >
            SOON
          </span>
          <span className="text-[12px]" style={{ color: "var(--aw-accent)" }}>Music Marketplace</span>
        </div>
        <h1 className="text-[40px] font-bold tracking-[-0.03em] mb-3" style={{ color: "var(--aw-text)" }}>
          Coming Soon
        </h1>
        <p className="text-[14px] max-w-[340px] mx-auto leading-relaxed" style={{ color: "var(--aw-text-3)" }}>
          The AudioWeave Marketplace is on its way. Stay tuned.
        </p>
      </div>
    </div>
  );
}
