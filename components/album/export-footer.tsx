export function ExportFooter() {
  return (
    <div className="mt-4 flex justify-end gap-[10px]">
      <button className="px-5 py-[10px] rounded-[var(--radius-pill)] text-[13px] font-medium bg-[rgba(255,255,255,0.06)] border border-[color:var(--aw-border)] text-[color:var(--aw-text-2)] cursor-pointer">
        Export All Stems
      </button>
      <button
        className="px-5 py-[10px] rounded-[var(--radius-pill)] text-[13px] font-semibold border-none cursor-pointer"
        style={{ background: "var(--aw-accent)", color: "#000" }}
      >
        Download Album Pack
      </button>
    </div>
  );
}
