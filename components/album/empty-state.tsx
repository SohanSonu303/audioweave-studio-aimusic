import { Icon, icons } from "@/components/ui/icon";

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[color:var(--aw-text-3)]">
      <Icon d={icons.film} size={40} color="var(--aw-text-3)" />
      <div className="text-center">
        <div
          className="font-light text-[22px] text-[color:var(--aw-text-2)] mb-[6px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Paste a script to begin
        </div>
        <div className="text-[12px]">AI will identify scenes and suggest music for each moment</div>
      </div>
    </div>
  );
}
