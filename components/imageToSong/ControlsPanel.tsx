"use client";

import { ChevronDown } from "lucide-react";

const MUSIC_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const labelCls = "block text-[10px] uppercase tracking-[0.12em] mb-2 font-light text-aw-text-2/80";
const inputCls = "w-full px-4 py-2.5 rounded-md bg-[#111] border border-aw-border-md text-[13px] text-aw-text font-mono outline-none focus:border-aw-accent transition-all";
const selectCls = `${inputCls} appearance-none pr-9 cursor-pointer font-sans`;

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

export function ControlsPanel({
  prompt, lyrics, negativeTags, makeInstrumental, vocalOnly, bpm, musicKey, voiceId,
  onPromptChange, onLyricsChange, onNegativeTagsChange, onMakeInstrumentalChange,
  onVocalOnlyChange, onBpmChange, onKeyChange, onVoiceIdChange,
}: ControlsPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Prompt */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls + " mb-0"}>Creative Prompt</label>
          <span className="text-[10px] text-aw-text-3 font-mono">{prompt.length}/300</span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value.slice(0, 300))}
          placeholder="Describe the mood, genre, or scene..."
          rows={3}
          className="w-full bg-[#111] border border-aw-border-md rounded-md px-4 py-3 text-[13px] text-aw-text placeholder-aw-text-3 resize-none outline-none focus:border-aw-accent transition-all leading-relaxed"
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-6 flex-wrap">
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls + " mb-0"}>Lyrics</label>
            <span className="text-[10px] text-aw-text-3 font-mono">{lyrics.length}/3000</span>
          </div>
          <textarea
            value={lyrics}
            onChange={(e) => onLyricsChange(e.target.value.slice(0, 3000))}
            placeholder="Paste custom lyrics here..."
            rows={4}
            className="w-full bg-[#111] border border-aw-border-md rounded-md px-4 py-3 text-[13px] text-aw-text placeholder-aw-text-3 resize-none outline-none focus:border-aw-accent transition-all leading-relaxed"
          />
        </div>
      )}

      {/* Negative Tags */}
      <div>
        <label className={labelCls}>Exclude (Negative Tags)</label>
        <input
          type="text"
          value={negativeTags}
          onChange={(e) => onNegativeTagsChange(e.target.value)}
          placeholder="e.g. heavy metal, distortion"
          className={inputCls}
        />
      </div>

      {/* BPM & Key */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>BPM</label>
          <input
            type="number"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => onBpmChange(e.target.value)}
            placeholder="Auto"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Key</label>
          <div className="relative">
            <select
              value={musicKey}
              onChange={(e) => onKeyChange(e.target.value)}
              className={selectCls}
            >
              <option value="">Auto</option>
              {MUSIC_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-aw-text-3" />
          </div>
        </div>
      </div>

      {/* Voice ID section hidden as requested */}
    </div>
  );
}
