"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Scissors, Wind, Repeat, Split, Shuffle, Layers, BarChart3,
  Sun, Wand2, Crop, Crown, Target, Mic, Sparkles, Upload,
  Link2, AlertTriangle, RefreshCw, ChevronDown, Check, Copy,
} from "lucide-react";
import { useEditStore } from "@/stores/edit-store";
import type { OperationType, SourceState } from "@/stores/edit-store";
import { DropZone } from "@/components/ui/drop-zone";
import { decodeAudioB64 } from "@/lib/utils";

// ─── API hooks ────────────────────────────────────────────────────────────────
import { useCut, useFade, useLoop, useSplit, useMix, useOverlay, useEq, useAiWarmth, useStyleEnhance } from "@/lib/api/edit-ops";
import { useSuggest, usePreview, useTrim, useAnalyze } from "@/lib/api/auto-edit";
import { useMasterProcess } from "@/lib/api/master";
import { useRefMatchAnalyze, useRefMatchProcess, useVibePrompt } from "@/lib/api/reference-match";
import { usePodcastProduce } from "@/lib/api/podcast";
import { usePlatforms } from "@/lib/api/master";
import { ENERGY_PREFERENCES, CROSSFADE_BEATS, STRICTNESS_LEVELS } from "@/lib/constants";
import { CandidateCard } from "@/components/edit/candidate-card";
import { formatTimeWithDecimal } from "@/lib/utils";

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelCls = "block text-[10px] uppercase tracking-[0.12em] mb-2 font-light text-aw-text-2/80";
const inputCls = "w-full px-4 py-2.5 rounded-md bg-[#111] border border-aw-border-md text-[13px] text-aw-text font-mono outline-none focus:border-aw-accent transition-all";
const selectCls = `${inputCls} appearance-none pr-9 cursor-pointer font-sans`;

// ─── Source upload widget (reused per op) ─────────────────────────────────────

interface SourceUploadProps {
  label: string;
  hint?: string;
  source: SourceState;
  onSource: (s: SourceState) => void;
}

function SourceUpload({ label, hint, source, onSource }: SourceUploadProps) {
  const [mode, setMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");

  if (source) {
    const name = source.kind === "file" ? source.file.name : source.url;
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-md bg-[rgba(96,192,144,0.08)] border border-[rgba(96,192,144,0.2)]">
        <div className="flex items-center gap-2 min-w-0">
          <Check size={12} style={{ color: "var(--aw-green)" }} className="shrink-0" />
          <span className="text-[11px] text-aw-text truncate">{name}</span>
        </div>
        <button
          onClick={() => onSource(null)}
          className="text-[10px] text-aw-text-3 hover:text-aw-text shrink-0 uppercase tracking-wider"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className={labelCls + " mb-0"}>{label}</label>
        {hint && <span className="text-[9px] text-aw-text-3">{hint}</span>}
      </div>
      <div className="flex items-center gap-1 bg-white/5 border border-aw-border rounded-full p-0.5 w-fit">
        {(["file", "url"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 text-[10px] font-medium rounded-full uppercase tracking-wider transition-all ${mode === m ? "bg-aw-accent text-black" : "text-aw-text-2 hover:text-aw-text"
              }`}
          >
            {m === "file" ? "Upload" : "URL"}
          </button>
        ))}
      </div>

      {mode === "file" ? (
        <DropZone
          onFiles={(files) => { if (files[0]) onSource({ kind: "file", file: files[0] }); }}
          hint="MP3, WAV · up to 50 MB"
          compact
        />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (urlInput.trim()) { onSource({ kind: "url", url: urlInput.trim() }); }
          }}
          className="flex gap-2 bg-[#111] border border-aw-border rounded-xl p-2"
        >
          <div className="flex items-center pl-2 text-aw-text-3">
            <Link2 size={13} />
          </div>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/audio.mp3"
            className="flex-1 px-2 py-1.5 bg-transparent text-[12px] text-aw-text placeholder-aw-text-3 outline-none"
            required
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-md bg-aw-accent text-black text-[11px] font-semibold hover:opacity-90 uppercase tracking-wider"
          >
            Load
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Format toggle ─────────────────────────────────────────────────────────────

function FormatToggle({
  value, onChange,
}: {
  value: "mp3" | "wav";
  onChange: (f: "mp3" | "wav") => void;
}) {
  return (
    <section>
      <label className={labelCls}>Export Format</label>
      <div className="flex gap-1 p-1 rounded-md bg-[#111] border border-aw-border-md">
        {(["mp3", "wav"] as const).map((fmt) => (
          <button
            key={fmt}
            onClick={() => onChange(fmt)}
            className={`flex-1 py-2 text-[11px] rounded font-medium transition-all ${value === fmt ? "bg-aw-accent text-black shadow-sm" : "text-aw-text-3 hover:text-aw-text-2"
              }`}
          >
            {fmt.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Error bar ────────────────────────────────────────────────────────────────

function ErrorBar({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-2 text-[11px] text-aw-red bg-[rgba(224,96,96,0.08)] border border-[rgba(224,96,96,0.2)] px-3 py-2.5 rounded-md">
      <div className="flex items-start gap-1.5">
        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
        <span>{msg}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 shrink-0 text-aw-text-2 hover:text-aw-text">
          <RefreshCw size={10} />Try Again
        </button>
      )}
    </div>
  );
}

// ─── Execute button ───────────────────────────────────────────────────────────

function ExecButton({
  label, icon: Icon, disabled, loading, accent, onClick,
}: {
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
  loading?: boolean;
  accent?: string;
  onClick: () => void;
}) {
  const bg = accent ?? "var(--aw-accent)";
  const textColor = accent === "var(--aw-purple)" ? "#0a0012" : "#1a0c00";
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full font-sans text-[13px] font-semibold py-3.5 rounded-md flex items-center justify-center gap-2.5 transition-all hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      style={{ background: bg, color: textColor, boxShadow: `0 0 15px ${bg}44` }}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon size={16} />
      )}
      {label}
    </button>
  );
}

// ─── useOpExecutor — shared execute logic ─────────────────────────────────────

function useOpExecutor() {
  const { setPrimarySource, setSecondarySource, setProcessing, setResult } = useEditStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const run = async (
    op: OperationType,
    fn: () => Promise<{ audio_b64: string; audio_format: string; report?: Record<string, unknown> }>,
    msg = "Processing audio…"
  ) => {
    setErrorMsg(null);
    setProcessing(true, msg);
    try {
      const res = await fn();
      const blob = decodeAudioB64(res.audio_b64, res.audio_format);
      const blobUrl = URL.createObjectURL(blob);
      setResult({
        blobUrl, audioB64: res.audio_b64,
        audioFormat: res.audio_format as "mp3" | "wav",
        op, report: res.report,
      });
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  const clearSources = () => {
    setPrimarySource(null);
    setSecondarySource(null);
  };

  return { run, errorMsg, setErrorMsg, clearSources };
}

// ─── CUT ──────────────────────────────────────────────────────────────────────

function CutPanel() {
  const { primarySource, setPrimarySource } = useEditStore();
  const [startS, setStartS] = useState(0);
  const [endS, setEndS] = useState(5);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const { run, errorMsg } = useOpExecutor();
  const mut = useCut();

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Source Audio" source={primarySource} onSource={setPrimarySource} />
      <hr className="border-aw-border" />
      <section className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Start Time (s)</label>
          <input type="number" min={0} step={0.1} value={startS} onChange={(e) => setStartS(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>End Time (s)</label>
          <input type="number" min={0} step={0.1} value={endS} onChange={(e) => setEndS(Number(e.target.value))} className={inputCls} />
        </div>
      </section>
      <FormatToggle value={fmt} onChange={setFmt} />
      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label="Execute Cut" icon={Scissors}
        disabled={!primarySource || endS <= startS}
        loading={mut.isPending}
        onClick={() => run("cut", () => mut.mutateAsync({
          source: primarySource!.kind === "file" ? primarySource!.file : primarySource!.url,
          start_ms: Math.round(startS * 1000), end_ms: Math.round(endS * 1000), output_format: fmt,
        }), "Cutting audio…")}
      />
    </div>
  );
}

// ─── FADE ─────────────────────────────────────────────────────────────────────

function FadePanel() {
  const { primarySource, setPrimarySource } = useEditStore();
  const [fadeInS, setFadeInS] = useState(1);
  const [fadeOutS, setFadeOutS] = useState(1);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const { run, errorMsg } = useOpExecutor();
  const mut = useFade();

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Source Audio" source={primarySource} onSource={setPrimarySource} />
      <hr className="border-aw-border" />
      <section className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Fade In (s)</label>
          <input type="number" min={0} step={0.1} value={fadeInS} onChange={(e) => setFadeInS(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Fade Out (s)</label>
          <input type="number" min={0} step={0.1} value={fadeOutS} onChange={(e) => setFadeOutS(Number(e.target.value))} className={inputCls} />
        </div>
      </section>
      <FormatToggle value={fmt} onChange={setFmt} />
      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label="Apply Fade" icon={Wind}
        disabled={!primarySource}
        loading={mut.isPending}
        onClick={() => run("fade", () => mut.mutateAsync({
          source: primarySource!.kind === "file" ? primarySource!.file : primarySource!.url,
          fade_in_ms: Math.round(fadeInS * 1000), fade_out_ms: Math.round(fadeOutS * 1000), output_format: fmt,
        }), "Applying fade…")}
      />
    </div>
  );
}

// ─── LOOP ─────────────────────────────────────────────────────────────────────

function LoopPanel() {
  const { primarySource, setPrimarySource } = useEditStore();
  const [loopCount, setLoopCount] = useState(2);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const { run, errorMsg } = useOpExecutor();
  const mut = useLoop();

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Source Audio" source={primarySource} onSource={setPrimarySource} />
      <hr className="border-aw-border" />
      <section>
        <label className={labelCls}>Loop Count</label>
        <input type="number" min={2} max={32} value={loopCount} onChange={(e) => setLoopCount(Number(e.target.value))} className={inputCls} />
        <p className="text-[10px] text-aw-text-3 mt-1">Total length = source × {loopCount}</p>
      </section>
      <FormatToggle value={fmt} onChange={setFmt} />
      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label="Generate Loop" icon={Repeat}
        disabled={!primarySource || loopCount < 2}
        loading={mut.isPending}
        onClick={() => run("loop", () => mut.mutateAsync({
          source: primarySource!.kind === "file" ? primarySource!.file : primarySource!.url,
          count: loopCount, output_format: fmt,
        }), "Generating loop…")}
      />
    </div>
  );
}

// ─── SPLIT ────────────────────────────────────────────────────────────────────

function SplitPanel() {
  const { primarySource, setPrimarySource } = useEditStore();
  const [splitS, setSplitS] = useState(30);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const { run, errorMsg } = useOpExecutor();
  const mut = useSplit();

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Source Audio" source={primarySource} onSource={setPrimarySource} />
      <hr className="border-aw-border" />
      <section>
        <label className={labelCls}>Split Point (s)</label>
        <input type="number" min={0} step={0.1} value={splitS} onChange={(e) => setSplitS(Number(e.target.value))} className={inputCls} />
      </section>
      <FormatToggle value={fmt} onChange={setFmt} />
      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label="Execute Split" icon={Split}
        disabled={!primarySource || splitS <= 0}
        loading={mut.isPending}
        onClick={() => run("split", () => mut.mutateAsync({
          source: primarySource!.kind === "file" ? primarySource!.file : primarySource!.url,
          split_ms: Math.round(splitS * 1000), output_format: fmt,
        }), "Splitting audio…")}
      />
    </div>
  );
}

// ─── MIX ──────────────────────────────────────────────────────────────────────

function MixPanel() {
  const { primarySource, secondarySource, setPrimarySource, setSecondarySource } = useEditStore();
  const [gain1, setGain1] = useState(0);
  const [gain2, setGain2] = useState(-3);
  const [crossfadeS, setCrossfadeS] = useState(0);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const { run, errorMsg } = useOpExecutor();
  const mut = useMix();

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Track A (Primary)" source={primarySource} onSource={setPrimarySource} />
      <SourceUpload label="Track B (Secondary)" source={secondarySource} onSource={setSecondarySource} />
      <hr className="border-aw-border" />
      <section className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Track A Gain (dB): {gain1 >= 0 ? "+" : ""}{gain1}</label>
          <input type="range" min={-12} max={6} step={0.5} value={gain1} onChange={(e) => setGain1(Number(e.target.value))} className="w-full accent-aw-accent" />
        </div>
        <div>
          <label className={labelCls}>Track B Gain (dB): {gain2 >= 0 ? "+" : ""}{gain2}</label>
          <input type="range" min={-12} max={6} step={0.5} value={gain2} onChange={(e) => setGain2(Number(e.target.value))} className="w-full accent-aw-accent" />
        </div>
        <div>
          <label className={labelCls}>Crossfade (s)</label>
          <input type="number" min={0} max={5} step={0.1} value={crossfadeS} onChange={(e) => setCrossfadeS(Number(e.target.value))} className={inputCls} />
        </div>
      </section>
      <FormatToggle value={fmt} onChange={setFmt} />
      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label="Generate Mix" icon={Shuffle}
        disabled={!primarySource || !secondarySource}
        loading={mut.isPending}
        onClick={() => run("mix", () => mut.mutateAsync({
          source1: primarySource!.kind === "file" ? primarySource!.file : primarySource!.url,
          source2: secondarySource!.kind === "file" ? secondarySource!.file : secondarySource!.url,
          track1_gain_db: gain1, track2_gain_db: gain2, crossfade_ms: Math.round(crossfadeS * 1000), output_format: fmt,
        }), "Mixing tracks…")}
      />
    </div>
  );
}

// ─── OVERLAY ──────────────────────────────────────────────────────────────────

function OverlayPanel() {
  const { primarySource, secondarySource, setPrimarySource, setSecondarySource } = useEditStore();
  const [insertS, setInsertS] = useState(0);
  const [gainDb, setGainDb] = useState(-6);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const { run, errorMsg } = useOpExecutor();
  const mut = useOverlay();

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Base Track" source={primarySource} onSource={setPrimarySource} />
      <SourceUpload label="Overlay Clip" source={secondarySource} onSource={setSecondarySource} />
      <hr className="border-aw-border" />
      <section className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Insert Point (s)</label>
          <input type="number" min={0} step={0.1} value={insertS} onChange={(e) => setInsertS(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Overlay Gain (dB): {gainDb >= 0 ? "+" : ""}{gainDb}</label>
          <input type="range" min={-24} max={6} step={0.5} value={gainDb} onChange={(e) => setGainDb(Number(e.target.value))} className="w-full accent-aw-accent" />
        </div>
      </section>
      <FormatToggle value={fmt} onChange={setFmt} />
      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label="Apply Overlay" icon={Layers}
        disabled={!primarySource || !secondarySource}
        loading={mut.isPending}
        onClick={() => run("overlay", () => mut.mutateAsync({
          base: primarySource!.kind === "file" ? primarySource!.file : primarySource!.url,
          overlay: secondarySource!.kind === "file" ? secondarySource!.file : secondarySource!.url,
          position_ms: Math.round(insertS * 1000), overlay_gain_db: gainDb, output_format: fmt,
        }), "Overlaying audio…")}
      />
    </div>
  );
}

// ─── EQ ───────────────────────────────────────────────────────────────────────

const EQ_PRESETS = [
  { label: "Low Shelf (200 Hz)", freq: 200 },
  { label: "Low-Mid (500 Hz)", freq: 500 },
  { label: "Mid Peak (1 kHz)", freq: 1000 },
  { label: "Upper-Mid (2 kHz)", freq: 2000 },
  { label: "Presence (4 kHz)", freq: 4000 },
  { label: "High Shelf (8 kHz)", freq: 8000 },
  { label: "Air (16 kHz)", freq: 16000 },
];

function EqPanel() {
  const { primarySource, setPrimarySource } = useEditStore();
  const [freq, setFreq] = useState(1000);
  const [gain, setGain] = useState(0);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const { run, errorMsg } = useOpExecutor();
  const mut = useEq();

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Source Audio" source={primarySource} onSource={setPrimarySource} />
      <hr className="border-aw-border" />
      <section className="flex flex-col gap-5">
        <div>
          <label className={labelCls}>Frequency Band</label>
          <div className="relative">
            <select
              value={freq}
              onChange={(e) => setFreq(Number(e.target.value))}
              className={selectCls}
            >
              {EQ_PRESETS.map((p) => (
                <option key={p.freq} value={p.freq}>{p.label}</option>
              ))}
              <option value={freq} hidden>{freq} Hz (custom)</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-aw-text-3" />
          </div>
          <div className="flex gap-2 mt-2 items-center">
            <input
              type="number"
              min={20}
              max={20000}
              step={1}
              value={freq}
              onChange={(e) => setFreq(Number(e.target.value))}
              className={inputCls + " font-mono"}
            />
            <span className="text-[11px] text-aw-text-3 shrink-0">Hz</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls + " mb-0"}>Gain</label>
            <span className="text-[11px] text-aw-accent font-mono">{gain >= 0 ? "+" : ""}{gain} dB</span>
          </div>
          <input type="range" min={-12} max={12} step={0.5} value={gain} onChange={(e) => setGain(Number(e.target.value))} className="w-full accent-aw-accent" />
          <div className="flex justify-between text-[9px] text-aw-text-3 mt-0.5">
            <span>−12 dB</span><span>0</span><span>+12 dB</span>
          </div>
        </div>
      </section>
      <FormatToggle value={fmt} onChange={setFmt} />
      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label="Apply EQ" icon={BarChart3}
        disabled={!primarySource}
        loading={mut.isPending}
        onClick={() => run("eq", () => mut.mutateAsync({
          source: primarySource!.kind === "file" ? primarySource!.file : primarySource!.url,
          freq, gain, output_format: fmt,
        }), "Applying EQ…")}
      />
    </div>
  );
}

// ─── AI WARMTH ────────────────────────────────────────────────────────────────

function AiWarmthPanel() {
  const { primarySource, setPrimarySource } = useEditStore();
  const [warmth, setWarmth] = useState(0.5);
  const [vocalMode, setVocalMode] = useState(false);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const { run, errorMsg } = useOpExecutor();
  const mut = useAiWarmth();
  const labels = ["Cool & Clean", "Subtle Glow", "Balanced", "Warm Analog", "Tube Saturation"];
  const labelIdx = Math.round(warmth * 4);

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Source Audio" source={primarySource} onSource={setPrimarySource} />
      <hr className="border-aw-border" />
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls + " mb-0"}>Warmth Intensity</label>
          <span className="text-[10px] text-aw-accent">{labels[labelIdx]}</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={warmth} onChange={(e) => setWarmth(Number(e.target.value))} className="w-full accent-aw-accent" />
        <div className="flex justify-between text-[9px] text-aw-text-3 mt-1">
          <span>Clean</span><span>Saturated</span>
        </div>
      </section>
      <section>
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input type="checkbox" checked={vocalMode} onChange={(e) => setVocalMode(e.target.checked)} className="accent-aw-accent" />
          <span className="text-[12px] text-aw-text-2">Vocal mode <span className="text-aw-text-3 text-[10px]">(optimise for voice)</span></span>
        </label>
      </section>
      <FormatToggle value={fmt} onChange={setFmt} />
      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label="Apply AI Warmth" icon={Sun} accent="var(--aw-purple)"
        disabled={!primarySource}
        loading={mut.isPending}
        onClick={() => run("ai_warmth", () => mut.mutateAsync({
          source: primarySource!.kind === "file" ? primarySource!.file : primarySource!.url,
          intensity: warmth, vocal_mode: vocalMode, output_format: fmt,
        }), "Adding AI warmth…")}
      />
    </div>
  );
}

// ─── STYLE ENHANCE ────────────────────────────────────────────────────────────

const STYLE_PRESETS = [
  { value: "lofi", label: "Lo-Fi" },
  { value: "edm", label: "EDM" },
  { value: "cinematic", label: "Cinematic" },
  { value: "pop", label: "Pop" },
  { value: "chill", label: "Chill" },
  { value: "vintage", label: "Vintage" },
];

function StyleEnhancePanel() {
  const { primarySource, setPrimarySource } = useEditStore();
  const [preset, setPreset] = useState("lofi");
  const [intensity, setIntensity] = useState(0.7);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const { run, errorMsg } = useOpExecutor();
  const mut = useStyleEnhance();

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Source Audio" source={primarySource} onSource={setPrimarySource} />
      <hr className="border-aw-border" />
      <section>
        <label className={labelCls}>Preset</label>
        <div className="relative">
          <select value={preset} onChange={(e) => setPreset(e.target.value)} className={selectCls}>
            {STYLE_PRESETS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-aw-text-3" />
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls + " mb-0"}>Intensity</label>
          <span className="text-[10px] text-aw-accent font-mono">{intensity.toFixed(2)}</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full accent-aw-accent" />
        <div className="flex justify-between text-[9px] text-aw-text-3 mt-1">
          <span>Subtle</span><span>Heavy</span>
        </div>
      </section>
      <FormatToggle value={fmt} onChange={setFmt} />
      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label="Enhance Style" icon={Wand2} accent="var(--aw-purple)"
        disabled={!primarySource}
        loading={mut.isPending}
        onClick={() => run("style_enhance", () => mut.mutateAsync({
          source: primarySource!.kind === "file" ? primarySource!.file : primarySource!.url,
          preset, intensity, output_format: fmt,
        }), "Enhancing style…")}
      />
    </div>
  );
}

// ─── AUTO TRIM ────────────────────────────────────────────────────────────────

function AutoTrimPanel() {
  const {
    primarySource, setPrimarySource, sourceDurationSec, setSourceDuration,
    analysis, setAnalysis, preview, setPreview, setProcessing, setResult, result,
  } = useEditStore();

  const [description, setDescription] = useState("");
  const [targetDuration, setTargetDuration] = useState(30);
  const [energyPreference, setEnergyPreference] = useState<string | null>(null);
  const [strictness, setStrictness] = useState(0.5);
  const [crossfadeBeats, setCrossfadeBeats] = useState(1);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suggestExplain, setSuggestExplain] = useState<string | null>(null);

  const suggest = useSuggest();
  const previewMut = usePreview();
  const trimMut = useTrim();
  const analyzeMut = useAnalyze();

  const src = primarySource?.kind === "file" ? primarySource.file : primarySource?.url;

  const handleAutoFill = async () => {
    if (!description) return;
    setErrorMsg(null);
    try {
      const res = await suggest.mutateAsync({ description, source_duration: sourceDurationSec ?? undefined });
      if (res.target_duration) setTargetDuration(res.target_duration);
      if (res.energy_preference) setEnergyPreference(res.energy_preference);
      if (res.strictness !== undefined) setStrictness(res.strictness);
      if (res.crossfade_beats !== undefined) setCrossfadeBeats(res.crossfade_beats);
      if (res.explanation) setSuggestExplain(res.explanation);
    } catch (e: unknown) { setErrorMsg((e as Error).message); }
  };

  const handleFindBest = async () => {
    if (!src || !description) return;
    setErrorMsg(null);
    setProcessing(true, "Finding best section…");
    try {
      const sRes = await suggest.mutateAsync({ description, source_duration: sourceDurationSec ?? undefined });
      const td = sRes.target_duration ?? targetDuration;
      if (sRes.target_duration) setTargetDuration(sRes.target_duration);
      if (sRes.energy_preference) setEnergyPreference(sRes.energy_preference);
      const pRes = await previewMut.mutateAsync({ source: src, target_duration: td, energy_preference: sRes.energy_preference, strictness: sRes.strictness, user_description: description });
      setPreview({ chosenIndex: pRes.chosen_index, windowStart: pRes.window_start, windowEnd: pRes.window_end, reasoning: pRes.agent_reasoning });
    } catch (e: unknown) { setErrorMsg((e as Error).message); } finally { setProcessing(false); }
  };

  const handleTrim = async (chosenIndex?: number) => {
    if (!src || targetDuration <= 0) return;
    setErrorMsg(null);
    setProcessing(true, "Running Auto Trim…");
    try {
      const res = await trimMut.mutateAsync({ source: src, target_duration: targetDuration, energy_preference: energyPreference, strictness, crossfade_beats: crossfadeBeats, output_format: fmt, chosen_window_index: chosenIndex ?? preview?.chosenIndex, user_description: description });
      const blob = decodeAudioB64(res.audio_b64, res.audio_format);
      const blobUrl = URL.createObjectURL(blob);
      if (result?.blobUrl) URL.revokeObjectURL(result.blobUrl);
      setResult({
        blobUrl, audioB64: res.audio_b64, audioFormat: res.audio_format as "mp3" | "wav", op: "auto_trim",
        actualDuration: res.actual_duration, bpm: res.bpm, beatDeviationMs: res.beat_deviation_ms,
        wasLooped: res.was_looped, windowStart: res.window_start, windowEnd: res.window_end,
        chosenIndex: res.chosen_index, candidates: res.candidates,
        agentReasoning: res.agent_reasoning, qualityWarning: res.quality_warning,
      });
      if (res.candidates?.length > 0 && !analysis) {
        setAnalysis({ bpm: res.bpm, duration: 0, segments: [], candidates: res.candidates, used_beat_fallback: res.used_fallback });
      }
    } catch (e: unknown) { setErrorMsg((e as Error).message); } finally { setProcessing(false); }
  };

  const handleAnalyze = async () => {
    if (!src) return;
    setErrorMsg(null);
    setProcessing(true, "Analysing audio…");
    try {
      const res = await analyzeMut.mutateAsync({ source: src, target_duration: targetDuration, energy_preference: energyPreference, strictness });
      setAnalysis({ bpm: res.bpm, duration: res.duration, segments: res.segments, candidates: res.candidates, used_beat_fallback: res.used_beat_fallback });
      setSourceDuration(res.duration);
    } catch (e: unknown) { setErrorMsg((e as Error).message); } finally { setProcessing(false); }
  };

  const candidates = result?.op === "auto_trim"
    ? (result.candidates?.length ? result.candidates : analysis?.candidates ?? [])
    : (analysis?.candidates ?? []);

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Source Audio" source={primarySource} onSource={setPrimarySource} />
      <hr className="border-aw-border" />

      <section className="flex flex-col gap-3">
        <label className={labelCls}>Creative Intent</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. punchy 30s drop for my DJ mix"
          className="w-full bg-[#111] border border-aw-border-md rounded-md px-4 py-3 text-[13px] text-aw-text placeholder-aw-text-3 resize-none outline-none focus:border-aw-accent transition-all min-h-[68px] leading-relaxed"
          rows={3}
        />
        {suggestExplain && (
          <div className="text-[11px] text-aw-text-2 bg-[rgba(232,160,85,0.06)] border border-[rgba(232,160,85,0.15)] px-3 py-2 rounded-md leading-relaxed">
            <span className="text-aw-accent font-medium">AI:</span> {suggestExplain}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleAutoFill}
            disabled={!description || suggest.isPending}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-aw-border text-[11px] font-medium text-aw-text-2 hover:text-aw-text transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {suggest.isPending ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Wand2 size={11} />}
            Auto-fill
          </button>
          <button
            onClick={handleFindBest}
            disabled={!description || !primarySource || previewMut.isPending}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-medium"
            style={{ background: "rgba(96,192,144,0.08)", borderColor: "rgba(96,192,144,0.2)", color: "var(--aw-green)" }}
          >
            {previewMut.isPending ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Target size={11} />}
            Find Best
          </button>
        </div>
      </section>

      <section>
        <label className={labelCls}>Target Duration (seconds)</label>
        <input type="number" min={1} value={targetDuration || ""} onChange={(e) => setTargetDuration(Number(e.target.value) || 0)} className={inputCls} />
      </section>

      <section>
        <label className={labelCls}>Energy Preference</label>
        <div className="relative">
          <select value={energyPreference || ""} onChange={(e) => setEnergyPreference(e.target.value || null)} className={selectCls}>
            <option value="">Auto</option>
            {ENERGY_PREFERENCES.map((ep) => <option key={ep} value={ep}>{ep.replace(/_/g, " ")}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-aw-text-3" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls + " mb-0"}>Strictness</label>
          <span className="text-[10px] text-aw-accent">{STRICTNESS_LEVELS.find((s) => s.value === strictness)?.label ?? "Custom"}</span>
        </div>
        <input type="range" min={0} max={1} step={0.5} value={strictness} onChange={(e) => setStrictness(Number(e.target.value))} className="w-full accent-aw-accent" />
        <div className="flex justify-between text-[9px] text-aw-text-3 mt-1"><span>Musical</span><span>Balanced</span><span>Precise</span></div>
      </section>

      <section>
        <label className={labelCls}>Crossfade</label>
        <div className="relative">
          <select value={crossfadeBeats} onChange={(e) => setCrossfadeBeats(Number(e.target.value))} className={selectCls}>
            {CROSSFADE_BEATS.map((cb) => <option key={cb.value} value={cb.value}>{cb.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-aw-text-3" />
        </div>
      </section>

      <FormatToggle value={fmt} onChange={setFmt} />

      {result?.op === "auto_trim" && (
        <>
          <hr className="border-aw-border" />
          <section className="flex flex-col gap-2">
            <label className={labelCls}>Result</label>
            <div className="bg-[#111] border border-aw-border rounded-md p-3 flex flex-col gap-2">
              {result.bpm && <div className="flex items-center justify-between text-[11px]"><span className="text-aw-text-3 uppercase tracking-wider">BPM</span><span className="text-aw-text font-mono">{Math.round(result.bpm)}</span></div>}
              {result.actualDuration && <div className="flex items-center justify-between text-[11px]"><span className="text-aw-text-3 uppercase tracking-wider">Duration</span><span className="text-aw-text font-mono">{formatTimeWithDecimal(result.actualDuration)}</span></div>}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {result.beatDeviationMs !== undefined && (
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wider" style={result.beatDeviationMs <= 15 ? { background: "rgba(96,192,144,0.08)", color: "var(--aw-green)", borderColor: "rgba(96,192,144,0.2)" } : { background: "rgba(234,179,8,0.08)", color: "#eab308", borderColor: "rgba(234,179,8,0.2)" }}>
                    {Math.round(result.beatDeviationMs)}ms off-beat
                  </span>
                )}
                {result.wasLooped && <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[rgba(160,112,224,0.1)] text-aw-purple border border-[rgba(160,112,224,0.2)] uppercase tracking-wider">Looped</span>}
              </div>
              {result.qualityWarning && <div className="flex items-start gap-2 text-[11px] text-yellow-400 bg-[rgba(234,179,8,0.07)] border border-yellow-500/20 px-2.5 py-2 rounded mt-1"><AlertTriangle size={11} className="mt-0.5 shrink-0" /><p>{result.qualityWarning}</p></div>}
              {result.agentReasoning && <p className="text-[11px] leading-relaxed pt-1"><Sparkles size={10} className="inline mr-1 text-aw-accent" /><span className="text-aw-text-2">{result.agentReasoning}</span></p>}
            </div>
          </section>
        </>
      )}

      {candidates.length > 0 && (
        <>
          <hr className="border-aw-border" />
          <section className="flex flex-col gap-3">
            <label className={labelCls}>Candidate Windows</label>
            <div className="flex flex-col gap-2.5">
              {candidates.map((cand) => (
                <CandidateCard key={cand.index} candidate={cand}
                  isSelected={cand.index === (result?.chosenIndex ?? preview?.chosenIndex)}
                  onUseThis={cand.index !== (result?.chosenIndex ?? preview?.chosenIndex) ? () => handleTrim(cand.index) : undefined}
                  disabled={trimMut.isPending}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {errorMsg && <ErrorBar msg={errorMsg} onRetry={() => handleTrim()} />}

      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={!primarySource || analyzeMut.isPending}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md border text-[11px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "rgba(96,192,144,0.08)", borderColor: "rgba(96,192,144,0.2)", color: "var(--aw-green)" }}
        >
          {analyzeMut.isPending ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
          Analyze First
        </button>
        <ExecButton
          label={result?.op === "auto_trim" ? "Re-Trim" : "Run Auto Trim"}
          icon={Crop}
          disabled={!primarySource || targetDuration <= 0}
          loading={trimMut.isPending}
          onClick={() => handleTrim()}
        />
      </div>
    </div>
  );
}

// ─── MASTER ───────────────────────────────────────────────────────────────────

function MasterPanelFull() {
  const {
    primarySource, setPrimarySource,
    masterOutputFormat, setMasterOutputFormat,
    masterSelectedPlatform, setMasterSelectedPlatform,
    setProcessing, setResult, result
  } = useEditStore();

  const { data: platforms } = usePlatforms();
  const masterMut = useMasterProcess();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (platforms && !masterSelectedPlatform) {
      const def = platforms.find(p => p.id === "spotify")?.id || platforms[0]?.id;
      if (def) setMasterSelectedPlatform(def);
    }
  }, [platforms, masterSelectedPlatform, setMasterSelectedPlatform]);

  const handleMaster = async () => {
    if (!primarySource) return;
    setErrorMsg(null);
    setProcessing(true, "Mastering audio…");
    try {
      const src = primarySource.kind === "file" ? primarySource.file : primarySource.url;
      const res = await masterMut.mutateAsync({
        source: src,
        platform: masterSelectedPlatform || "spotify",
        output_format: masterOutputFormat
      });
      const blob = decodeAudioB64(res.audio_b64, res.audio_format);
      const blobUrl = URL.createObjectURL(blob);
      if (result?.blobUrl) URL.revokeObjectURL(result.blobUrl);
      setResult({ blobUrl, audioB64: res.audio_b64, audioFormat: res.audio_format, op: "master", report: res.report as unknown as Record<string, unknown> });
    } catch (e: unknown) { setErrorMsg((e as Error).message); } finally { setProcessing(false); }
  };

  const report = result?.op === "master" ? result.report : null;

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Source Audio" source={primarySource} onSource={setPrimarySource} />
      <section>
        <label className={labelCls}>Target Platform</label>
        <div className="relative">
          <select
            value={masterSelectedPlatform || ""}
            onChange={(e) => setMasterSelectedPlatform(e.target.value)}
            className={selectCls}
          >
            {platforms?.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.target_lufs} LUFS)</option>
            )) || (
              ['spotify', 'youtube', 'tiktok', 'podcast', 'apple', 'soundcloud'].map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))
            )}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-aw-text-3" />
        </div>
      </section>

      <FormatToggle value={masterOutputFormat} onChange={setMasterOutputFormat} />

      {report && (
        <>
          <hr className="border-aw-border" />
          <section className="flex flex-col gap-3">
            <label className={labelCls}>Mastering Report</label>
            <div className="bg-[#111] border border-aw-border rounded-md p-3 flex flex-col gap-2.5 text-[11px]">
              {["lufs", "true_peak_db"].map((key) => {
                const rpt = report as Record<string, Record<string, number>>;
                const before = rpt?.before?.[key] ?? 0;
                const after = rpt?.after?.[key] ?? 0;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-aw-text-3 uppercase tracking-wider">{key === "lufs" ? "LUFS" : "True Peak"}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-aw-text-2">{before.toFixed(1)}</span>
                      <span className="text-aw-text-3">→</span>
                      <span className="text-aw-text">{after.toFixed(1)}{key === "lufs" ? "" : " dB"}</span>
                    </div>
                  </div>
                );
              })}
              {(report as Record<string, unknown>)?.gain_applied_db !== undefined && (
                <div className="flex items-center justify-between pt-1 border-t border-aw-border">
                  <span className="text-aw-text-3 uppercase tracking-wider">Gain Applied</span>
                  <span className="text-aw-text font-mono">{Number((report as Record<string, unknown>).gain_applied_db) >= 0 ? "+" : ""}{Number((report as Record<string, unknown>).gain_applied_db).toFixed(2)} dB</span>
                </div>
              )}
              {Array.isArray((report as Record<string, unknown>)?.changes) && (
                <ul className="flex flex-col gap-1.5 pt-2 border-t border-aw-border">
                  {((report as Record<string, unknown[]>).changes as string[]).map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-aw-text-2">
                      <Sparkles size={9} className="mt-1 shrink-0" style={{ color: "var(--aw-purple)" }} />{c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}

      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label={result?.op === "master" ? "Re-Master" : "Master Now"}
        icon={Crown} accent="var(--aw-purple)"
        disabled={!primarySource}
        loading={masterMut.isPending}
        onClick={handleMaster}
      />
    </div>
  );
}

// ─── REFERENCE MATCH ──────────────────────────────────────────────────────────

function ReferenceMatchPanel() {
  const { primarySource, secondarySource, setPrimarySource, setSecondarySource, setProcessing, setResult, result } = useEditStore();
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const [vibePrompt, setVibePrompt] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<{ reference_fingerprint: { bpm: number; key: string; mode: string } } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); }, []);

  const analyzeMut = useRefMatchAnalyze();
  const processMut = useRefMatchProcess();
  const vibeMut = useVibePrompt();

  const ref = secondarySource;
  const target = primarySource;

  const handleAnalyze = async () => {
    if (!ref) return;
    setErrorMsg(null);
    setProcessing(true, "Analysing reference…");
    try {
      const refSrc = ref.kind === "file" ? ref.file : ref.url;
      const tgtSrc = target ? (target.kind === "file" ? target.file : target.url) : undefined;
      const res = await analyzeMut.mutateAsync({ ref: refSrc, target: tgtSrc });
      setAnalyzeResult(res);
    } catch (e: unknown) { setErrorMsg((e as Error).message); } finally { setProcessing(false); }
  };

  const handleMatch = async () => {
    if (!ref || !target) return;
    setErrorMsg(null);
    setProcessing(true, "Matching to reference…");
    try {
      const res = await processMut.mutateAsync({
        ref: ref.kind === "file" ? ref.file : ref.url,
        target: target.kind === "file" ? target.file : target.url,
        output_format: fmt,
      });
      const blob = decodeAudioB64(res.audio_b64, res.audio_format);
      const blobUrl = URL.createObjectURL(blob);
      if (result?.blobUrl) URL.revokeObjectURL(result.blobUrl);
      setResult({ blobUrl, audioB64: res.audio_b64, audioFormat: res.audio_format, op: "reference_match", report: res.report as unknown as Record<string, unknown> });
    } catch (e: unknown) { setErrorMsg((e as Error).message); } finally { setProcessing(false); }
  };

  const handleVibePrompt = async () => {
    if (!ref) return;
    setErrorMsg(null);
    setProcessing(true, "Generating vibe prompt…");
    try {
      const res = await vibeMut.mutateAsync({ ref: ref.kind === "file" ? ref.file : ref.url });
      setVibePrompt(res.prompt);
    } catch (e: unknown) { setErrorMsg((e as Error).message); } finally { setProcessing(false); }
  };

  const handleCopy = () => {
    if (!vibePrompt) return;
    navigator.clipboard.writeText(vibePrompt);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Your Track (Target)" source={primarySource} onSource={setPrimarySource} />
      <SourceUpload label="Reference Track" hint="20s+ clip" source={secondarySource} onSource={setSecondarySource} />
      <hr className="border-aw-border" />
      <FormatToggle value={fmt} onChange={setFmt} />

      {analyzeResult && (
        <div className="bg-[#111] border border-aw-border rounded-md p-3 text-[11px]">
          <label className={labelCls}>Reference Fingerprint</label>
          <div className="flex items-center gap-2 flex-wrap">
            {["bpm", "key", "mode"].map((k) => (
              <span key={k} className="px-2 py-0.5 rounded-full border text-[9px] uppercase tracking-wider" style={{ color: "var(--aw-accent)", background: "rgba(232,160,85,0.08)", borderColor: "rgba(232,160,85,0.2)" }}>
                {k}: {String((analyzeResult.reference_fingerprint as Record<string, unknown>)[k])}
              </span>
            ))}
          </div>
        </div>
      )}

      {vibePrompt && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className={labelCls + " mb-0"}>Vibe Prompt</label>
            <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-aw-text-2 hover:text-aw-text transition-colors">
              {copied ? <><Check size={10} />Copied!</> : <><Copy size={10} />Copy</>}
            </button>
          </div>
          <textarea readOnly value={vibePrompt} className="w-full bg-[#111] border border-aw-border-md rounded-md px-4 py-3 text-[12px] text-aw-text-2 resize-none outline-none min-h-[80px] leading-relaxed italic" rows={4} />
        </div>
      )}

      {result?.op === "reference_match" && result.report && (
        <>
          <hr className="border-aw-border" />
          <section className="flex flex-col gap-2">
            <label className={labelCls}>Match Report</label>
            {Array.isArray((result.report as Record<string, unknown>)?.changes_summary) && (
              <ul className="flex flex-col gap-1.5">
                {((result.report as Record<string, string[]>).changes_summary).map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-aw-text-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: "var(--aw-purple)" }} />{c}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {errorMsg && <ErrorBar msg={errorMsg} />}

      <div className="flex flex-col gap-2">
        <button
          onClick={handleAnalyze}
          disabled={!ref || analyzeMut.isPending}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md border text-[11px] font-medium transition-all disabled:opacity-40"
          style={{ background: "rgba(232,160,85,0.08)", borderColor: "rgba(232,160,85,0.2)", color: "var(--aw-accent)" }}
        >
          {analyzeMut.isPending ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
          Analyze Reference
        </button>
        <ExecButton
          label="Match to Reference" icon={Target} accent="var(--aw-purple)"
          disabled={!ref || !target}
          loading={processMut.isPending}
          onClick={handleMatch}
        />
        <button
          onClick={handleVibePrompt}
          disabled={!ref || vibeMut.isPending}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md border text-[11px] font-medium transition-all disabled:opacity-40"
          style={{ background: "rgba(160,112,224,0.08)", borderColor: "rgba(160,112,224,0.2)", color: "var(--aw-purple)" }}
        >
          {vibeMut.isPending ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Sparkles size={11} />}
          Generate Vibe Prompt
        </button>
      </div>
    </div>
  );
}

// ─── PODCAST ──────────────────────────────────────────────────────────────────

function PodcastPanel() {
  const { primarySource, secondarySource, setPrimarySource, setSecondarySource, setProcessing, setResult, result } = useEditStore();
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [voiceEq, setVoiceEq] = useState(true);
  const [addMusic, setAddMusic] = useState(true);
  const [duckDb, setDuckDb] = useState(-18);
  const [introDur, setIntroDur] = useState(8);
  const [outroDur, setOutroDur] = useState(8);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mut = usePodcastProduce();

  const handleProduce = async () => {
    if (!primarySource) return;
    setErrorMsg(null);
    const msg = noiseReduction ? "Producing episode — vocal separation running, this may take a while…" : "Producing podcast episode…";
    setProcessing(true, msg);
    try {
      const speech = primarySource.kind === "file" ? primarySource.file : primarySource.url;
      const music = secondarySource ? (secondarySource.kind === "file" ? secondarySource.file : secondarySource.url) : undefined;
      const res = await mut.mutateAsync({ speech, music, noise_reduction: noiseReduction, voice_eq: voiceEq, add_music: addMusic, duck_db: duckDb, intro_duration_s: introDur, outro_duration_s: outroDur, output_format: fmt });
      const blob = decodeAudioB64(res.audio_b64, res.audio_format);
      const blobUrl = URL.createObjectURL(blob);
      if (result?.blobUrl) URL.revokeObjectURL(result.blobUrl);
      setResult({ blobUrl, audioB64: res.audio_b64, audioFormat: res.audio_format, op: "podcast", report: res.report as Record<string, unknown> });
    } catch (e: unknown) { setErrorMsg((e as Error).message); } finally { setProcessing(false); }
  };

  const CheckRow = ({ label, value, onChange, warn }: { label: string; value: boolean; onChange: (v: boolean) => void; warn?: string }) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${value ? "bg-aw-accent" : "bg-white/10"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      <div>
        <span className="text-[12px] text-aw-text">{label}</span>
        {warn && value && <p className="text-[10px] text-yellow-400 mt-0.5">{warn}</p>}
      </div>
    </label>
  );

  return (
    <div className="p-7 flex flex-col gap-6">
      <SourceUpload label="Speech Recording" source={primarySource} onSource={setPrimarySource} />
      <SourceUpload label="Background Music (optional)" hint="Will be looped and ducked" source={secondarySource} onSource={setSecondarySource} />
      <hr className="border-aw-border" />

      <section className="flex flex-col gap-4">
        <label className={labelCls}>Processing Options</label>
        <CheckRow label="Noise Reduction" value={noiseReduction} onChange={setNoiseReduction} warn="⚠ May take 5–15 min for long audio" />
        <CheckRow label="Voice EQ & Leveling" value={voiceEq} onChange={setVoiceEq} />
        <CheckRow label="Attach Intro / Outro Music" value={addMusic} onChange={setAddMusic} />
      </section>

      {addMusic && (
        <section className="flex flex-col gap-4 pl-2 border-l-2 border-aw-border">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls + " mb-0"}>Music Duck Level</label>
              <span className="text-[10px] text-aw-accent font-mono">{duckDb} dB</span>
            </div>
            <input type="range" min={-24} max={-6} step={1} value={duckDb} onChange={(e) => setDuckDb(Number(e.target.value))} className="w-full accent-aw-accent" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelCls}>Intro Duration (s)</label>
              <input type="number" min={0} max={30} value={introDur} onChange={(e) => setIntroDur(Number(e.target.value))} className={inputCls} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Outro Duration (s)</label>
              <input type="number" min={0} max={30} value={outroDur} onChange={(e) => setOutroDur(Number(e.target.value))} className={inputCls} />
            </div>
          </div>
        </section>
      )}

      {result?.op === "podcast" && result.report && (
        <>
          <hr className="border-aw-border" />
          <div className="bg-[#111] border border-aw-border rounded-md p-3 text-[11px] flex flex-col gap-2">
            {(result.report as Record<string, unknown>)?.before_lufs !== undefined && (
              <div className="flex items-center justify-between"><span className="text-aw-text-3 uppercase tracking-wider">LUFS</span><span className="text-aw-text font-mono">{Number((result.report as Record<string, unknown>).before_lufs).toFixed(1)} → {Number((result.report as Record<string, unknown>).after_lufs).toFixed(1)}</span></div>
            )}
            {Array.isArray((result.report as Record<string, unknown>)?.processing_chain) && (
              <ul className="flex flex-col gap-1 mt-1">
                {((result.report as Record<string, string[]>).processing_chain).map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-aw-text-2"><span className="mt-1 w-1 h-1 rounded-full bg-aw-purple shrink-0" />{c}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <FormatToggle value={fmt} onChange={setFmt} />
      {errorMsg && <ErrorBar msg={errorMsg} />}
      <ExecButton
        label="Produce Episode" icon={Mic} accent="var(--aw-purple)"
        disabled={!primarySource}
        loading={mut.isPending}
        onClick={handleProduce}
      />
    </div>
  );
}

// ─── InspectorPanel (root) ────────────────────────────────────────────────────

const OP_LABEL: Record<OperationType, string> = {
  cut: "Cut", fade: "Fade", loop: "Loop", split: "Split", mix: "Mix", overlay: "Overlay",
  eq: "EQ", ai_warmth: "AI Warmth", style_enhance: "Style Enhance", auto_trim: "Auto Trim",
  master: "Master", reference_match: "Reference Match", podcast: "Podcast",
};

const OP_DESCRIPTION: Record<OperationType, string> = {
  cut: "Trim your audio to a precise time range. Set start and end points to extract the exact section you need.",
  fade: "Smoothly ease audio in and out. Set fade-in and fade-out durations for seamless transitions.",
  loop: "Repeat your audio clip multiple times. Perfect for creating seamless loops and extending short samples.",
  split: "Divide audio into two parts at a precise timestamp. Great for isolating intros, verses, or outros.",
  mix: "Blend two audio tracks together with independent volume control and optional crossfade between them.",
  overlay: "Layer a secondary clip on top of a base track at a specific point, with adjustable overlay volume.",
  eq: "Shape your sound with a 3-band equaliser. Boost or cut lows, mids, and highs to sculpt the tone.",
  ai_warmth: "Add analog warmth and subtle saturation using AI. Emulates vintage tape and tube character.",
  style_enhance: "Apply AI-driven genre presets to transform your track's sonic character — Lo-Fi, EDM, Cinematic, and more.",
  auto_trim: "Intelligently find and extract the best section of your audio using AI-powered beat and energy analysis.",
  master: "Professional AI mastering for music platforms ( Spotify, Apple Music, youtube, etc.) — optimise loudness, dynamics, and clarity for any streaming platform.",
  reference_match: "Match your track's tonal profile to a reference song using AI, or describe the vibe you want.",
  podcast: "AI-powered podcast production — enhance speech, reduce noise, and balance multi-speaker audio.",
};

const AI_OPS: OperationType[] = ["ai_warmth", "style_enhance", "auto_trim", "master", "reference_match", "podcast"];

function BodyForOp({ op }: { op: OperationType }) {
  switch (op) {
    case "cut": return <CutPanel />;
    case "fade": return <FadePanel />;
    case "loop": return <LoopPanel />;
    case "split": return <SplitPanel />;
    case "mix": return <MixPanel />;
    case "overlay": return <OverlayPanel />;
    case "eq": return <EqPanel />;
    case "ai_warmth": return <AiWarmthPanel />;
    case "style_enhance": return <StyleEnhancePanel />;
    case "auto_trim": return <AutoTrimPanel />;
    case "master": return <MasterPanelFull />;
    case "reference_match": return <ReferenceMatchPanel />;
    case "podcast": return <PodcastPanel />;
  }
}

export function InspectorPanel() {
  const { selectedOperation } = useEditStore();
  const isAi = AI_OPS.includes(selectedOperation);
  const [width, setWidth] = useState(340);
  const isResizing = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 300 && newWidth <= 600) {
      setWidth(newWidth);
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleMouseMove]);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [handleMouseMove, stopResizing]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
    };
  }, [handleMouseMove, stopResizing]);

  return (
    <aside
      className="border-l border-aw-border flex flex-col shrink-0 relative"
      style={{ background: "#0a0a0a", width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={startResizing}
        className="absolute left-[-2px] top-0 bottom-0 w-4 cursor-col-resize z-50 group"
      >
        <div className="absolute left-[1px] top-0 bottom-0 w-[1px] bg-transparent group-hover:bg-aw-accent/30 transition-colors" />
        <div className="absolute left-[1px] top-1/2 -translate-y-1/2 w-[2px] h-12 bg-aw-border group-hover:bg-aw-accent rounded-full opacity-0 group-hover:opacity-100 transition-all" />
      </div>

      {/* Header */}
      <div className="px-7 py-6 border-b border-aw-border">
        <h3 className="font-display text-[22px] text-aw-text mb-1 leading-none">Track Inspector</h3>
        <p
          className="text-[10px] uppercase tracking-[0.15em] font-light flex items-center gap-1.5"
          style={{ color: isAi ? "var(--aw-purple)" : "var(--aw-accent)" }}
        >
          {isAi && <Sparkles size={9} />}
          {OP_LABEL[selectedOperation]} Operation
        </p>
        <p className="text-[11px] text-aw-text-3 leading-relaxed mt-2.5">
          {OP_DESCRIPTION[selectedOperation]}
        </p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <BodyForOp op={selectedOperation} />
      </div>
    </aside>
  );
}
