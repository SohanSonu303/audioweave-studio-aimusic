"use client";

import {
  RotateCcw, GitCompareArrows,
  Scissors, Wind, Repeat, Split, Shuffle, Layers, BarChart3,
  Sun, Wand2, Crop, Crown, Target, Mic, Sparkles,
} from "lucide-react";
import { useEditStore, type OperationType } from "@/stores/edit-store";

// ─── Operation definitions ────────────────────────────────────────────────────

interface OpDef {
  id: OperationType;
  label: string;
  description: string;
  icon: React.ElementType;
  ai: boolean;
}

const OPERATIONS: OpDef[] = [
  { id: "cut",             label: "Cut",             description: "Remove a section from your track",                         icon: Scissors,   ai: false },
  { id: "fade",            label: "Fade",            description: "Apply fade-in / fade-out to the edges",                    icon: Wind,       ai: false },
  { id: "loop",            label: "Loop",            description: "Repeat a section seamlessly to fill a duration",           icon: Repeat,     ai: false },
  { id: "split",           label: "Split",           description: "Split the track into two clips at a marker",               icon: Split,      ai: false },
  { id: "mix",             label: "Mix",             description: "Blend two tracks with level + crossfade",                  icon: Shuffle,    ai: false },
  { id: "overlay",         label: "Overlay",         description: "Stack a clip on top of another at a timestamp",            icon: Layers,     ai: false },
  { id: "eq",              label: "EQ",              description: "Adjust frequency balance (lows / mids / highs)",           icon: BarChart3,  ai: false },
  { id: "ai_warmth",       label: "AI Warmth",       description: "Add analog warmth, saturation and tube character",         icon: Sun,        ai: true  },
  { id: "style_enhance",   label: "Style Enhance",   description: "Lift production quality toward a chosen style",            icon: Wand2,      ai: true  },
  { id: "auto_trim",       label: "Auto Trim",       description: "Beat-aware trim + loop to a target duration",              icon: Crop,       ai: true  },
  { id: "master",          label: "Master",          description: "One-click mastering for Spotify / YouTube / TikTok",       icon: Crown,      ai: true  },
  { id: "reference_match", label: "Reference Match", description: "Make your track sound like a reference (EQ + dynamics)",   icon: Target,     ai: true  },
  { id: "podcast",         label: "Podcast",         description: "Clean speech, duck music, attach intro/outro",             icon: Mic,        ai: true  },
];

// ─── Op button ────────────────────────────────────────────────────────────────

function OpButton({ op, selected, onSelect }: { op: OpDef; selected: boolean; onSelect: () => void }) {
  const Icon = op.icon;
  const aiColor = "var(--aw-purple)";

  return (
    <button
      onClick={onSelect}
      title={op.label}
      className="group relative w-10 h-10 rounded-md flex items-center justify-center transition-all"
      style={
        selected
          ? { background: "rgba(160,112,224,0.2)", color: aiColor, border: "1px solid rgba(160,112,224,0.45)", boxShadow: "0 0 8px rgba(160,112,224,0.15)" }
          : op.ai
          ? { color: "rgba(160,112,224,0.6)", border: "1px solid rgba(160,112,224,0.18)", borderRadius: "8px" }
          : { color: "var(--aw-text-3)" }
      }
    >
      <span className="flex items-center justify-center w-full h-full rounded-md group-hover:bg-white/5 transition-colors relative">
        <Icon size={16} />
        {op.ai && !selected && (
          <Sparkles size={7} className="absolute top-[5px] right-[5px]" style={{ color: aiColor, opacity: 0.8 }} />
        )}
      </span>

      {/* Tooltip */}
      <div
        className="absolute left-full ml-2 px-3 py-2 bg-[#111] border border-aw-border rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl flex flex-col gap-1 max-w-[240px]"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-1.5">
          {op.ai && <Sparkles size={9} style={{ color: aiColor }} />}
          <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: selected ? aiColor : op.ai ? aiColor : "var(--aw-text)" }}>
            {op.label}
          </span>
        </div>
        <p className="text-[10px] leading-relaxed normal-case tracking-normal whitespace-normal" style={{ color: "var(--aw-text-2)" }}>
          {op.description}
        </p>
      </div>
    </button>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionBtn({ icon, label, description, active, disabled, accentColor, onClick }: {
  icon: React.ReactNode; label: string; description?: string;
  active?: boolean; disabled?: boolean; accentColor?: string; onClick?: () => void;
}) {
  const color = accentColor ?? "var(--aw-text)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={description ? `${label} — ${description}` : label}
      className="group relative w-10 h-10 rounded-md flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      style={active ? { background: "rgba(160,112,224,0.15)", color, border: `1px solid ${color}33` } : { color: "var(--aw-text-2)" }}
    >
      <span className="flex items-center justify-center transition-colors group-hover:bg-white/5 group-hover:text-white w-full h-full rounded-md" style={active ? { color } : undefined}>
        {icon}
      </span>
      <div
        className="absolute left-full ml-2 px-3 py-2 bg-[#111] border border-aw-border rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl flex flex-col gap-1 max-w-[240px] whitespace-nowrap"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color }}>{label}</span>
        {description && <p className="text-[10px] leading-relaxed normal-case tracking-normal whitespace-normal" style={{ color: "var(--aw-text-2)" }}>{description}</p>}
      </div>
    </button>
  );
}

function Divider() {
  return <div className="w-6 h-[1px] self-center" style={{ background: "var(--aw-border)" }} />;
}

// ─── ToolConsole ──────────────────────────────────────────────────────────────

export function ToolConsole() {
  const { result, abMode, setAbMode, resetAll, selectedOperation, setSelectedOperation } = useEditStore();

  const hasResult = !!result;

  const handleAbToggle = () => {
    if (!hasResult) return;
    setAbMode(abMode === "processed" ? "original" : "processed");
  };

  const standardOps = OPERATIONS.filter((o) => !o.ai);
  const aiOps = OPERATIONS.filter((o) => o.ai);

  return (
    <div
      className="w-14 flex flex-col items-center py-5 gap-1 shrink-0 border-r overflow-y-auto"
      style={{ background: "var(--aw-surface)", borderColor: "var(--aw-border)" }}
    >
      {/* Reset — always at top */}
      <ActionBtn
        icon={<RotateCcw size={16} />}
        label="Reset"
        description="Clear source and start over"
        onClick={resetAll}
      />

      <Divider />

      {/* Section label */}
      <span className="text-[8px] uppercase tracking-[0.18em] font-light mb-1" style={{ color: "var(--aw-text-3)" }}>
        OP
      </span>

      {/* Standard operations */}
      <div className="flex flex-col gap-1 w-full px-2">
        {standardOps.map((op) => (
          <OpButton key={op.id} op={op} selected={selectedOperation === op.id} onSelect={() => setSelectedOperation(op.id)} />
        ))}
      </div>

      <Divider />

      {/* AI-powered operations */}
      <div className="flex flex-col gap-1 w-full px-2">
        {aiOps.map((op) => (
          <OpButton key={op.id} op={op} selected={selectedOperation === op.id} onSelect={() => setSelectedOperation(op.id)} />
        ))}
      </div>

      <Divider />

      {/* A/B Compare — only utility that stays */}
      <div className="flex flex-col gap-2 w-full px-2">
        <ActionBtn
          icon={<GitCompareArrows size={16} />}
          label={abMode === "original" ? "A/B · Original" : "A/B Compare"}
          description="Toggle between the result and the original source"
          active={abMode === "original"}
          accentColor="var(--aw-purple)"
          onClick={handleAbToggle}
          disabled={!hasResult}
        />
      </div>
    </div>
  );
}
