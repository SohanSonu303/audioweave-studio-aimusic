"use client";

import { Icon } from "@/components/ui/icon";

const MUSIC_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

interface ControlsPanelProps {
  prompt: string;
  lyrics: string;
  negativeTags: string;
  makeInstrumental: boolean;
  vocalOnly: boolean;
  bpm: string;
  musicKey: string;
  voiceId: string;
  onPromptChange: (v: string) => void;
  onLyricsChange: (v: string) => void;
  onNegativeTagsChange: (v: string) => void;
  onMakeInstrumentalChange: (v: boolean) => void;
  onVocalOnlyChange: (v: boolean) => void;
  onBpmChange: (v: string) => void;
  onKeyChange: (v: string) => void;
  onVoiceIdChange: (v: string) => void;
}

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="flex items-center gap-2.5 transition-opacity"
      style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <div
        className="w-9 h-5 rounded-full relative transition-colors duration-200 flex-shrink-0"
        style={{ background: checked ? "rgba(232,160,85,0.9)" : "rgba(255,255,255,0.12)" }}
      >
        <div
          className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow transition-all duration-200"
          style={{ left: checked ? "calc(100% - 17px)" : "3px" }}
        />
      </div>
      <span className="text-[12px] text-[color:var(--aw-text-2)]">{label}</span>
    </button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-medium text-[color:var(--aw-text-3)] uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-[9px] text-[12px] outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          color: "var(--aw-text)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(232,160,85,0.4)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
      />
    </div>
  );
}

export function ControlsPanel({
  prompt, lyrics, negativeTags, makeInstrumental, vocalOnly, bpm, musicKey, voiceId,
  onPromptChange, onLyricsChange, onNegativeTagsChange, onMakeInstrumentalChange,
  onVocalOnlyChange, onBpmChange, onKeyChange, onVoiceIdChange,
}: ControlsPanelProps) {
  return (
    <div className="space-y-5">
      {/* Prompt */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium text-[color:var(--aw-text-3)] uppercase tracking-wide">Prompt</label>
          <span className="text-[10px] text-[color:var(--aw-text-3)]">{prompt.length}/300</span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value.slice(0, 300))}
          placeholder="Describe the mood, genre, or scene to inspire the music…"
          rows={3}
          className="w-full px-3 py-2.5 rounded-[9px] text-[12px] outline-none transition-all resize-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "var(--aw-text)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(232,160,85,0.4)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-5 flex-wrap">
        <Toggle
          label="Instrumental"
          checked={makeInstrumental}
          onChange={(v) => { onMakeInstrumentalChange(v); if (v) onVocalOnlyChange(false); }}
        />
        <Toggle
          label="Vocal Only"
          checked={vocalOnly}
          onChange={(v) => { onVocalOnlyChange(v); if (v) onMakeInstrumentalChange(false); }}
        />
      </div>

      {/* Lyrics */}
      {!makeInstrumental && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-[color:var(--aw-text-3)] uppercase tracking-wide">Lyrics</label>
            <span className="text-[10px] text-[color:var(--aw-text-3)]">{lyrics.length}/3000</span>
          </div>
          <textarea
            value={lyrics}
            onChange={(e) => onLyricsChange(e.target.value.slice(0, 3000))}
            placeholder="Optional: paste custom lyrics…"
            rows={4}
            className="w-full px-3 py-2.5 rounded-[9px] text-[12px] outline-none transition-all resize-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "var(--aw-text)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(232,160,85,0.4)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
          />
        </div>
      )}

      {/* Negative Tags */}
      <Input
        label="Exclude (Negative Tags)"
        value={negativeTags}
        onChange={onNegativeTagsChange}
        placeholder="e.g. heavy metal, distortion, bass drop"
      />

      {/* BPM & Key */}
      <div className="grid grid-cols-2 gap-3">
        <Input label="BPM" value={bpm} onChange={onBpmChange} placeholder="e.g. 120" type="number" />
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[color:var(--aw-text-3)] uppercase tracking-wide">Key</label>
          <select
            value={musicKey}
            onChange={(e) => onKeyChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-[9px] text-[12px] outline-none transition-all cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "var(--aw-text)",
            }}
          >
            <option value="">Any</option>
            {MUSIC_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* Voice ID — disabled when vocal_only */}
      <div style={{ opacity: vocalOnly ? 0.4 : 1 }}>
        <Input
          label={`Voice ID${vocalOnly ? " (disabled with Vocal Only)" : ""}`}
          value={voiceId}
          onChange={vocalOnly ? () => {} : onVoiceIdChange}
          placeholder="Optional voice ID"
        />
      </div>
    </div>
  );
}
