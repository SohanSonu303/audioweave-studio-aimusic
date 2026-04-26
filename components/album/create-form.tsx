"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAlbum } from "@/lib/api/album";
import { useAlbumStore } from "@/stores/album-store";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";

/* ── Validation ── */
const schema = z
  .object({
    script: z.string().min(1, "Script is required"),
    songs: z.number().int().min(0).max(20),
    background_scores: z.number().int().min(0).max(20),
    instrumentals: z.number().int().min(0).max(20),
  })
  .refine(
    (d) => {
      const total = d.songs + d.background_scores + d.instrumentals;
      return total >= 1 && total <= 20;
    },
    { message: "Total tracks must be between 1 and 20", path: ["songs"] },
  );

type FormValues = z.infer<typeof schema>;

/* ── Component ── */
export function CreateAlbumForm() {
  const router = useRouter();
  const createAlbum = useCreateAlbum();

  const draftScript = useAlbumStore((s) => s.draftScript);
  const draftCounts = useAlbumStore((s) => s.draftCounts);
  const setDraftScript = useAlbumStore((s) => s.setDraftScript);
  const setDraftCounts = useAlbumStore((s) => s.setDraftCounts);
  const resetDraft = useAlbumStore((s) => s.resetDraft);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      script: draftScript,
      songs: draftCounts.songs,
      background_scores: draftCounts.background_scores,
      instrumentals: draftCounts.instrumentals,
    },
  });

  const songs = watch("songs");
  const bgScores = watch("background_scores");
  const instrumentals = watch("instrumentals");
  const script = watch("script");
  const total = (songs || 0) + (bgScores || 0) + (instrumentals || 0);

  /* Persist drafts back to Zustand on change */
  useEffect(() => {
    setDraftScript(script ?? "");
  }, [script, setDraftScript]);

  useEffect(() => {
    setDraftCounts({
      songs: songs || 0,
      background_scores: bgScores || 0,
      instrumentals: instrumentals || 0,
    });
  }, [songs, bgScores, instrumentals, setDraftCounts]);

  /* ── Submit ── */
  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const album = await createAlbum.mutateAsync({
        project_id: crypto.randomUUID(),
        script: data.script,
        songs: data.songs,
        background_scores: data.background_scores,
        instrumentals: data.instrumentals,
      });

      // Navigate to the new album
      resetDraft();
      router.push(`/album/${album.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setSubmitError("insufficient_credits");
      } else {
        setSubmitError(
          err instanceof Error ? err.message : "Something went wrong",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalValid = total >= 1 && total <= 20;
  const canSubmit = (script?.trim().length ?? 0) > 0 && totalValid && !isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Script textarea */}
      <div>
        <label className="block text-[10px] text-[color:var(--aw-text-3)] font-medium tracking-[0.07em] uppercase mb-2">
          Script
        </label>
        <textarea
          {...register("script")}
          rows={12}
          placeholder="Paste your screenplay, story, or narrative here…"
          className="w-full rounded-[8px] border border-[color:var(--aw-border)] bg-[color:var(--aw-card)] text-[13px] text-[color:var(--aw-text)] px-4 py-3 resize-y placeholder:text-[color:var(--aw-text-3)] focus:outline-none focus:border-[color:var(--aw-accent)] transition-colors duration-150"
          style={{ fontFamily: "var(--font-mono)", minHeight: "200px" }}
        />
        {errors.script && (
          <p className="text-[11px] text-[color:var(--aw-red)] mt-1">
            {errors.script.message}
          </p>
        )}
        <p className="text-[10px] text-[color:var(--aw-text-3)] mt-1">
          {(script?.length ?? 0).toLocaleString()} characters
        </p>
      </div>

      {/* Track counts */}
      <div>
        <label className="block text-[10px] text-[color:var(--aw-text-3)] font-medium tracking-[0.07em] uppercase mb-3">
          Track Composition
        </label>

        <div className="grid grid-cols-3 gap-4">
          <CountInput
            label="Songs"
            description="Vocal tracks with lyrics"
            color="var(--aw-green)"
            value={songs}
            onChange={(v) => setValue("songs", v, { shouldValidate: true })}
          />
          <CountInput
            label="Background Scores"
            description="Cinematic / ambient"
            color="var(--aw-purple)"
            value={bgScores}
            onChange={(v) => setValue("background_scores", v, { shouldValidate: true })}
          />
          <CountInput
            label="Instrumentals"
            description="Structured, no vocals"
            color="var(--aw-blue)"
            value={instrumentals}
            onChange={(v) => setValue("instrumentals", v, { shouldValidate: true })}
          />
        </div>

        {/* Total label */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className="text-[12px] font-medium"
            style={{
              color: totalValid ? "var(--aw-text-2)" : "var(--aw-red)",
            }}
          >
            Total: {total} track{total !== 1 ? "s" : ""}
          </span>
          {!totalValid && (
            <span className="text-[11px] text-[color:var(--aw-red)]">
              (must be 1–20)
            </span>
          )}
        </div>

        {errors.songs && errors.songs.message?.includes("Total") && (
          <p className="text-[11px] text-[color:var(--aw-red)] mt-1">
            {errors.songs.message}
          </p>
        )}
      </div>

      {/* Error banner */}
      {submitError && (
        <div
          className="rounded-[8px] px-4 py-3 text-[12px] border"
          style={{
            background: "rgba(224, 96, 96, 0.08)",
            borderColor: "rgba(224, 96, 96, 0.2)",
            color: "var(--aw-red)",
          }}
        >
          {submitError === "insufficient_credits" ? (
            <>
              Insufficient credits to create this album.{" "}
              <Link href="/subscription" className="underline font-medium">
                Upgrade your plan →
              </Link>
            </>
          ) : (
            submitError
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="self-end flex items-center gap-2 px-6 py-[10px] rounded-[9999px] text-[13px] font-semibold tracking-[0.01em] transition-all duration-150"
        style={{
          background: canSubmit ? "var(--aw-accent)" : "rgba(232,160,85,0.2)",
          color: canSubmit ? "#000" : "var(--aw-accent)",
          boxShadow: canSubmit
            ? "0 2px 12px rgba(232,160,85,0.25)"
            : "none",
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
      >
        {isSubmitting ? (
          <>
            <span
              className="w-4 h-4 border-2 rounded-full"
              style={{
                borderColor: "transparent",
                borderTopColor: canSubmit ? "#000" : "var(--aw-accent)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Creating…
          </>
        ) : (
          "Create Album"
        )}
      </button>
    </form>
  );
}

/* ── Number input sub-component ── */
function CountInput({
  label,
  description,
  color,
  value,
  onChange,
}: {
  label: string;
  description: string;
  color: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const clamp = (n: number) => Math.max(0, Math.min(20, n));

  return (
    <div
      className="rounded-[12px] border border-[color:var(--aw-border)] bg-[color:var(--aw-card)] px-4 py-3 transition-colors duration-150 hover:border-[color:var(--aw-border-md)]"
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <span className="text-[12px] font-medium text-[color:var(--aw-text)]">
          {label}
        </span>
      </div>
      <p className="text-[10px] text-[color:var(--aw-text-3)] mb-3">
        {description}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= 0}
          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[14px] text-[color:var(--aw-text-2)] border border-[color:var(--aw-border)] bg-transparent transition-colors duration-150 hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span
          className="w-8 text-center text-[16px] font-medium"
          style={{ color }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= 20}
          className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[14px] text-[color:var(--aw-text-2)] border border-[color:var(--aw-border)] bg-transparent transition-colors duration-150 hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
}
