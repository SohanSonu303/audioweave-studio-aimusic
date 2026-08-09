"use client";

import { useState } from "react";
import { ChevronDown, Info, Lock, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import type { CoverCharacterLimits, VocalGender } from "@/lib/api/cover";

const labelCls = "block text-[10px] uppercase tracking-[0.12em] mb-2 font-light text-aw-text-2/80";
const inputCls =
  "w-full px-4 py-2.5 rounded-md bg-[#111] border border-aw-border-md text-[13px] text-aw-text placeholder-aw-text-3 outline-none focus:border-aw-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed";
const selectCls = `${inputCls} appearance-none pr-9 cursor-pointer`;
const textareaCls =
  "w-full bg-[#111] border border-aw-border-md rounded-md px-4 py-3 text-[13px] text-aw-text placeholder-aw-text-3 resize-none outline-none focus:border-aw-accent transition-all leading-relaxed disabled:opacity-40 disabled:cursor-not-allowed";
// Prompt is the one field people write paragraphs into — let it grow, both by
// drag handle and by the expand toggle. `min-height` (not `height`) is what the
// toggle drives so a manual drag isn't clobbered on the next render.
const promptTextareaCls = `${textareaCls.replace("resize-none", "resize-y")} max-h-[70vh]`;

export interface CoverConfigValues {
  model: string;
  customMode: boolean;
  instrumental: boolean;
  prompt: string;
  style: string;
  title: string;
  negativeTags: string;
  vocalGender: VocalGender | "";
  styleWeight: number | null;
  weirdnessConstraint: number | null;
  audioWeight: number | null;
}

interface CoverConfigPanelProps {
  values: CoverConfigValues;
  models: string[];
  limits: CoverCharacterLimits;
  nonCustomPromptMax: number;
  loadingOptions: boolean;
  onChange: <K extends keyof CoverConfigValues>(key: K, value: CoverConfigValues[K]) => void;
}

/** Counter that turns red once the model's limit is exceeded. */
function Counter({ length, max }: { length: number; max: number }) {
  const over = length > max;
  return (
    <span
      className="text-[10px] font-mono tabular-nums"
      style={{ color: over ? "var(--aw-red)" : "var(--aw-text-3)" }}
    >
      {length}/{max}
    </span>
  );
}

/** 0–1 slider that stays unset ("Auto") until the user moves it. */
function WeightSlider({
  label,
  hint,
  value,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  value: number | null;
  disabled?: boolean;
  onChange: (v: number | null) => void;
}) {
  return (
    <div style={{ opacity: disabled ? 0.4 : 1 }}>
      <div className="flex items-center justify-between mb-2">
        <label className={labelCls + " mb-0"}>{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tabular-nums text-aw-accent">
            {value == null ? "AUTO" : value.toFixed(2)}
          </span>
          {value != null && !disabled && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-aw-text-3 hover:text-aw-accent transition-colors"
              aria-label={`Reset ${label} to auto`}
            >
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value ?? 0.5}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-aw-accent disabled:cursor-not-allowed"
      />
      <p className="text-[10px] text-aw-text-3 mt-1 leading-relaxed">{hint}</p>
    </div>
  );
}

export function CoverConfigPanel({
  values,
  models,
  limits,
  nonCustomPromptMax,
  loadingOptions,
  onChange,
}: CoverConfigPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);

  const { customMode, instrumental } = values;

  // The required-field matrix, expressed as render conditions
  const showDescription = !customMode;
  const showLyrics = customMode && !instrumental;
  const showStyleAndTitle = customMode;
  const promptMax = customMode ? limits.prompt : nonCustomPromptMax;
  // Collapsed heights match the old rows={6} / rows={4}
  const promptMinHeight = promptExpanded ? 420 : showLyrics ? 148 : 104;

  return (
    <div className="flex flex-col gap-6">
      {/* Model */}
      <div>
        <label className={labelCls}>Model</label>
        <div className="relative">
          <select
            value={values.model}
            disabled={loadingOptions || models.length === 0}
            onChange={(e) => onChange("model", e.target.value)}
            className={selectCls}
          >
            {models.length === 0 && <option value="">Loading…</option>}
            {models.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, ".")}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-aw-text-3" />
        </div>
      </div>

      {/* Mode switches — these drive every field below */}
      <div className="flex flex-col gap-4 py-4 border-y border-aw-border">
        <ToggleSwitch
          label="Custom mode"
          checked={customMode}
          onChange={(v) => onChange("customMode", v)}
        />
        <ToggleSwitch
          label="Instrumental"
          checked={instrumental}
          onChange={(v) => onChange("instrumental", v)}
        />
        <p className="text-[10px] text-aw-text-3 leading-relaxed">
          {customMode
            ? instrumental
              ? "Custom · instrumental — set a style and title. No lyrics."
              : "Custom · vocals — your lyrics are sung verbatim, word for word."
            : "Simple mode — describe the cover you want and the AI decides the rest."}
        </p>
      </div>

      {/* Style + Title (custom mode only) */}
      {showStyleAndTitle && (
        <>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls + " mb-0"}>Style</label>
              <Counter length={values.style.length} max={limits.style} />
            </div>
            <textarea
              value={values.style}
              onChange={(e) => onChange("style", e.target.value)}
              placeholder="e.g. acoustic folk, warm fingerpicked guitar, intimate"
              rows={2}
              className={textareaCls}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls + " mb-0"}>Title</label>
              <Counter length={values.title.length} max={limits.title} />
            </div>
            <input
              type="text"
              value={values.title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="Name your cover"
              className={inputCls}
            />
          </div>
        </>
      )}

      {/* Prompt — a description in simple mode, a lyric sheet in custom + vocals */}
      {(showDescription || showLyrics) && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls + " mb-0"}>
              {showLyrics ? "Lyrics to sing" : "Describe the cover"}
            </label>
            <div className="flex items-center gap-2">
              <Counter length={values.prompt.length} max={promptMax} />
              <button
                type="button"
                onClick={() => setPromptExpanded((e) => !e)}
                className="text-aw-text-3 hover:text-aw-accent transition-colors"
                aria-label={promptExpanded ? "Shrink the text box" : "Expand the text box"}
                aria-pressed={promptExpanded}
                title={promptExpanded ? "Shrink" : "Expand"}
              >
                {promptExpanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
              </button>
            </div>
          </div>
          <textarea
            value={values.prompt}
            onChange={(e) => onChange("prompt", e.target.value)}
            placeholder={
              showLyrics
                ? "Write the exact words to be sung…"
                : "e.g. turn this into a slow piano ballad with soft vocals"
            }
            style={{ minHeight: promptMinHeight }}
            className={promptTextareaCls}
          />
          {showLyrics && (
            <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-md" style={{ background: "rgba(232,160,85,0.06)" }}>
              <Info size={11} className="text-aw-accent mt-[2px] flex-shrink-0" />
              <p className="text-[10px] text-aw-text-2 leading-relaxed">
                These words are sung exactly as written — this is not a description.
                Describe the sound in <span className="text-aw-accent">Style</span> instead.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Advanced — custom mode only; the backend 422s on these otherwise */}
      <div className="border-t border-aw-border pt-5">
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="flex items-center justify-between w-full group"
        >
          <span className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.12em] font-light text-aw-text-2/80">
              Advanced
            </span>
            {!customMode && <Lock size={10} className="text-aw-text-3" />}
          </span>
          <ChevronDown
            size={14}
            className="text-aw-text-3 transition-transform duration-200 group-hover:text-aw-text-2"
            style={{ transform: advancedOpen ? "rotate(180deg)" : "none" }}
          />
        </button>

        {advancedOpen && (
          <div className="flex flex-col gap-6 mt-5">
            {!customMode && (
              <p className="text-[10px] text-aw-text-3 leading-relaxed px-3 py-2 rounded-md" style={{ background: "rgba(255,255,255,0.03)" }}>
                Turn on <span className="text-aw-text-2">Custom mode</span> to use these controls.
              </p>
            )}

            <div>
              <label className={labelCls}>Exclude (negative tags)</label>
              <input
                type="text"
                value={values.negativeTags}
                disabled={!customMode}
                onChange={(e) => onChange("negativeTags", e.target.value)}
                placeholder="e.g. heavy metal, distortion"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Vocal gender</label>
              <div className="relative">
                <select
                  value={values.vocalGender}
                  disabled={!customMode}
                  onChange={(e) => onChange("vocalGender", e.target.value as VocalGender | "")}
                  className={selectCls}
                >
                  <option value="">Auto</option>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-aw-text-3" />
              </div>
            </div>

            <WeightSlider
              label="Style weight"
              hint="How hard to push the style description."
              value={values.styleWeight}
              disabled={!customMode}
              onChange={(v) => onChange("styleWeight", v)}
            />
            <WeightSlider
              label="Weirdness"
              hint="Higher values take more creative risks."
              value={values.weirdnessConstraint}
              disabled={!customMode}
              onChange={(v) => onChange("weirdnessConstraint", v)}
            />
            <WeightSlider
              label="Audio weight"
              hint="How closely to follow the uploaded track."
              value={values.audioWeight}
              disabled={!customMode}
              onChange={(v) => onChange("audioWeight", v)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
