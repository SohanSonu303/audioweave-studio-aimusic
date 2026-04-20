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
            className="w-[14px] h-[14px] rounded-full flex items-center justify-center"
            style={{ border: "1.5px solid var(--aw-accent)" }}
          >
            <Icon d={icons.plus} size={8} color="var(--aw-accent)" />
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
            className="w-[14px] h-[14px] rounded-full flex items-center justify-center"
            style={{ border: "1.5px solid rgba(224,96,96,0.7)" }}
          >
            <Icon d={icons.close} size={8} color="rgba(224,96,96,0.8)" />
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
