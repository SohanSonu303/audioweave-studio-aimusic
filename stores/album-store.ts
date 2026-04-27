import { create } from "zustand";

/**
 * Per-track inline edits the user makes on the PLANNED review view.
 * Only changed fields are sent to the API on approve.
 */
export interface TrackEdit {
  prompt?: string;
  music_style?: string;
  lyrics?: string;
  make_instrumental?: boolean;
  gender?: string;
  output_length?: number | null;
}

export interface DraftCounts {
  songs: number;
  background_scores: number;
  instrumentals: number;
}

interface AlbumStore {
  /* ── Create form drafts (session-only) ── */
  draftScript: string;
  draftCounts: DraftCounts;
  setDraftScript: (script: string) => void;
  setDraftCounts: (patch: Partial<DraftCounts>) => void;
  resetDraft: () => void;

  /* ── Inline track edits (PLANNED review) ── */
  edits: Record<string, TrackEdit>;
  setEdit: (trackId: string, patch: Partial<TrackEdit>) => void;
  clearEdits: () => void;

  /* ── In-flight indicators ── */
  replanningTrackId: string | null;
  regeneratingTrackId: string | null;
  setReplanningTrackId: (id: string | null) => void;
  setRegeneratingTrackId: (id: string | null) => void;

  /* ── Dialog state ── */
  approveDialogOpen: boolean;
  retryDialogOpen: boolean;
  regenerateDialogTrackId: string | null;
  setApproveDialogOpen: (open: boolean) => void;
  setRetryDialogOpen: (open: boolean) => void;
  setRegenerateDialogTrackId: (id: string | null) => void;
}

const DEFAULT_COUNTS: DraftCounts = {
  songs: 2,
  background_scores: 1,
  instrumentals: 0,
};

export const useAlbumStore = create<AlbumStore>((set) => ({
  /* ── Create form drafts ── */
  draftScript: "",
  draftCounts: { ...DEFAULT_COUNTS },

  setDraftScript: (script) => set({ draftScript: script }),
  setDraftCounts: (patch) =>
    set((s) => ({ draftCounts: { ...s.draftCounts, ...patch } })),
  resetDraft: () =>
    set({ draftScript: "", draftCounts: { ...DEFAULT_COUNTS } }),

  /* ── Inline track edits ── */
  edits: {},
  setEdit: (trackId, patch) =>
    set((s) => ({
      edits: {
        ...s.edits,
        [trackId]: { ...s.edits[trackId], ...patch },
      },
    })),
  clearEdits: () => set({ edits: {} }),

  /* ── In-flight indicators ── */
  replanningTrackId: null,
  regeneratingTrackId: null,
  setReplanningTrackId: (id) => set({ replanningTrackId: id }),
  setRegeneratingTrackId: (id) => set({ regeneratingTrackId: id }),

  /* ── Dialog state ── */
  approveDialogOpen: false,
  retryDialogOpen: false,
  regenerateDialogTrackId: null,
  setApproveDialogOpen: (open) => set({ approveDialogOpen: open }),
  setRetryDialogOpen: (open) => set({ retryDialogOpen: open }),
  setRegenerateDialogTrackId: (id) => set({ regenerateDialogTrackId: id }),
}));
