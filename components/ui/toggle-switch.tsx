"use client";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

/** Small pill switch used by the generation config panels (Image to Song, Cover). */
export function ToggleSwitch({ label, checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="flex items-center gap-2.5 transition-opacity"
      style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <div
        className="w-8 h-4 rounded-full relative transition-colors duration-200 flex-shrink-0"
        style={{ background: checked ? "var(--aw-accent)" : "rgba(255,255,255,0.12)" }}
      >
        <div
          className="absolute top-[2px] w-[12px] h-[12px] rounded-full bg-white shadow transition-all duration-200"
          style={{ left: checked ? "calc(100% - 14px)" : "2px" }}
        />
      </div>
      <span className="text-[11px] text-aw-text-2 uppercase tracking-wider">{label}</span>
    </button>
  );
}
