"use client";

import { Icon, icons } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { STYLE_TAGS } from "@/lib/constants";

type GenTab = "Song" | "Music" | "Sound FX";

interface StylePickerProps {
  tab: GenTab;
  included: string[];
  excluded: string[];
  onToggleInclude: (tag: string) => void;
  onToggleExclude: (tag: string) => void;
}

export function StylePicker({ tab, included, excluded, onToggleInclude, onToggleExclude }: StylePickerProps) {
  const tags = STYLE_TAGS[tab] ?? [];

  return (
    <div className="mt-3 flex flex-col gap-2">
      {/* Include row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-[5px] flex-shrink-0 w-16">
          <div
            className="w-[15px] h-[15px] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--aw-accent)" }}
          >
            <Icon d={icons.plus} size={9} color="rgba(0,0,0,0.75)" stroke={2.5} />
          </div>
          <span className="text-[10px] font-medium text-[color:var(--aw-text-3)] tracking-[0.07em] uppercase">
            Include
          </span>
        </div>
        <div className="flex flex-wrap gap-[5px]">
          {tags.map((tag) => (
            <Pill key={tag} active={included.includes(tag)} onClick={() => onToggleInclude(tag)}>
              {tag}
            </Pill>
          ))}
        </div>
      </div>

      {/* Exclude row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-[5px] flex-shrink-0 w-16">
          <div
            className="w-[15px] h-[15px] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(220,80,80,0.85)" }}
          >
            <Icon d={icons.close} size={9} color="white" stroke={2.5} />
          </div>
          <span className="text-[10px] font-medium text-[color:var(--aw-text-3)] tracking-[0.07em] uppercase">
            Exclude
          </span>
        </div>
        <div className="flex flex-wrap gap-[5px]">
          {tags.slice(0, 8).map((tag) => (
            <Pill key={tag} variant="exclude" active={excluded.includes(tag)} onClick={() => onToggleExclude(tag)}>
              {tag}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}
