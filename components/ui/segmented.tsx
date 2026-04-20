"use client";

import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Segmented<T extends string>({ options, value, onChange, className }: SegmentedProps<T>) {
  return (
    <div
      className={cn(
        "flex gap-0.5 bg-[rgba(255,255,255,0.04)] rounded-[8px] p-[3px]",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-[14px] py-[5px] rounded-[6px] text-[12px] font-medium transition-all duration-150 cursor-pointer border",
              active
                ? "bg-[color:var(--aw-card-hi)] text-[color:var(--aw-text)] border-[color:var(--aw-border-md)]"
                : "bg-transparent text-[color:var(--aw-text-2)] border-transparent",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
