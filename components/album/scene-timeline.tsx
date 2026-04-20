"use client";

export interface SceneSuggestion {
  section: string;
  start: number;
  end: number;
  suggestion: string;
  mood: string;
  genre: string;
  color: string;
  bpm: string;
}

interface SceneTimelineProps {
  scenes: SceneSuggestion[];
  selected: number | null;
  onSelect: (i: number | null) => void;
}

export function SceneTimeline({ scenes, selected, onSelect }: SceneTimelineProps) {
  return (
    <div className="flex h-2 rounded-[6px] overflow-hidden mb-6 gap-[2px]">
      {scenes.map((s, i) => (
        <div
          key={i}
          title={s.section}
          className="cursor-pointer transition-opacity duration-200 rounded-[2px]"
          style={{
            flex: s.end - s.start,
            background: s.color,
            opacity: selected === i ? 1 : 0.5,
          }}
          onClick={() => onSelect(selected === i ? null : i)}
        />
      ))}
    </div>
  );
}
