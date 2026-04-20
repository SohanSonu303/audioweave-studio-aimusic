"use client";

import { useState } from "react";
import { ScriptInput } from "@/components/album/script-input";
import { EmptyState } from "@/components/album/empty-state";
import { Analyzing } from "@/components/album/analyzing";
import { SceneTimeline, type SceneSuggestion } from "@/components/album/scene-timeline";
import { SceneCard } from "@/components/album/scene-card";
import { ExportFooter } from "@/components/album/export-footer";

const SAMPLE_SCRIPT = `INT. COFFEE SHOP - MORNING

Sarah enters nervously, clutching her guitar case. The café is quiet, just a few early regulars. She finds a corner table.

SARAH
(whispering to herself)
You can do this.

She sets up and begins to play. The melody is tentative at first, then grows in confidence.

EXT. CITY STREET - LATER

Sarah walks through the bustling city, headphones in, lost in her music. The world moves around her in a blur of color and noise.

INT. RECORDING STUDIO - NIGHT

Sarah and producer MARCUS sit behind a mixing board. Lights dim, the booth lit only by warm studio lights. Magic is happening.

MARCUS
That's it. That's the one.

A moment of pure joy. The song they've been working toward for months finally comes together.`;

const SCENES: SceneSuggestion[] = [
  { section: "Opening Scene", start: 0, end: 3, suggestion: "Soft acoustic guitar, fingerpicked, gentle and intimate — mirrors Sarah's nervousness.", mood: "Nervous / Hopeful", genre: "Acoustic Folk", color: "#6090e0", bpm: "72 BPM" },
  { section: "Coffee Shop Performance", start: 3, end: 7, suggestion: "Melody builds from sparse to warm — piano joins the guitar, emotional swell.", mood: "Hopeful / Confident", genre: "Indie Folk", color: "#60c090", bpm: "84 BPM" },
  { section: "City Street Montage", start: 7, end: 11, suggestion: "Upbeat, rhythmic indie pop. Driving beat, layered synths — the city comes alive.", mood: "Energetic / Free", genre: "Indie Pop", color: "#e8a055", bpm: "110 BPM" },
  { section: "Studio Session", start: 11, end: 16, suggestion: "Warm, low-key R&B groove. Late-night studio vibes. Bass-forward, subtle keys.", mood: "Focused / Creative", genre: "R&B / Soul", color: "#a070e0", bpm: "90 BPM" },
  { section: "Climax Moment", start: 16, end: 20, suggestion: "Full orchestral swell with the acoustic theme from the opening. Triumphant resolution.", mood: "Triumphant / Joyful", genre: "Cinematic", color: "#e06060", bpm: "96 BPM" },
];

export default function AlbumPage() {
  const [script, setScript] = useState(SAMPLE_SCRIPT);
  const [analysed, setAnalysed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [generating, setGenerating] = useState<number | null>(null);
  const [generated, setGenerated] = useState<Record<number, boolean>>({});

  const analyze = () => {
    if (!script.trim()) return;
    setAnalyzing(true);
    setAnalysed(false);
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setAnalyzing(false);
          setAnalysed(true);
          return 100;
        }
        return p + 3;
      });
    }, 50);
  };

  const generateScene = (idx: number) => {
    setGenerating(idx);
    setTimeout(() => {
      setGenerated((g) => ({ ...g, [idx]: true }));
      setGenerating(null);
    }, 2500);
  };

  const anyGenerated = Object.keys(generated).length > 0;

  return (
    <div className="flex-1 flex overflow-hidden">
      <ScriptInput
        script={script}
        onChange={setScript}
        analyzing={analyzing}
        progress={progress}
        onAnalyze={analyze}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {!analysed ? (
          analyzing ? <Analyzing progress={progress} /> : <EmptyState />
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-5">
              <div
                className="font-light text-[28px] tracking-[-0.3px] mb-1 text-[color:var(--aw-text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Scene Analysis
              </div>
              <p className="text-[12px] text-[color:var(--aw-text-2)]">
                {SCENES.length} scenes identified · Full emotional arc mapped
              </p>
            </div>

            <SceneTimeline scenes={SCENES} selected={selected} onSelect={setSelected} />

            <div className="flex flex-col gap-[10px]">
              {SCENES.map((s, i) => (
                <SceneCard
                  key={i}
                  scene={s}
                  index={i}
                  selected={selected === i}
                  generating={generating === i}
                  generated={!!generated[i]}
                  onSelect={() => setSelected(selected === i ? null : i)}
                  onGenerate={() => generateScene(i)}
                />
              ))}
            </div>

            {anyGenerated && <ExportFooter />}
          </div>
        )}
      </div>
    </div>
  );
}
