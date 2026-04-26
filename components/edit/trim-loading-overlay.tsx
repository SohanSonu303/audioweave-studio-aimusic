"use client";

import { useEditStore } from "@/stores/edit-store";

export function ProcessingOverlay() {
  const { isProcessing, processingMsg } = useEditStore();

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="bg-aw-card border border-aw-border rounded-2xl px-8 py-8 flex flex-col items-center max-w-xs w-full mx-4"
        style={{ boxShadow: "var(--shadow-card), 0 0 80px rgba(0,0,0,0.6)" }}
      >
        {/* Animated bars */}
        <div className="flex items-end gap-0.5 h-10 mb-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-aw-accent rounded-full"
              style={{ animation: "eq-bar 1.2s ease-in-out infinite", animationDelay: `${i * 0.12}s`, height: "100%" }}
            />
          ))}
        </div>

        <h3 className="text-base font-display font-light text-aw-text mb-2">Processing</h3>
        <p className="text-xs text-aw-text-2 text-center leading-relaxed max-w-[220px]">
          {processingMsg}
        </p>
        <p className="text-[10px] text-aw-text-3 mt-3 uppercase tracking-widest">
          Please don&apos;t navigate away
        </p>

        {/* Progress bar (indeterminate) */}
        <div className="w-full h-0.5 bg-aw-border rounded-full mt-5 overflow-hidden">
          <div
            className="h-full bg-aw-accent rounded-full"
            style={{ width: "60%", animation: "slide-progress 1.8s ease-in-out infinite alternate" }}
          />
        </div>
      </div>
    </div>
  );
}

// Keep old export name for backwards-compat
export { ProcessingOverlay as TrimLoadingOverlay };
