# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**AudioWeave Studio** — an AI music generation UI app. **This repo is the frontend only.**

The **FastAPI backend already exists as a separate service** (separate repo, separate deployment). Do not add Python, server-side business logic, or API implementations here. Never scaffold a backend in this repo. All server work belongs in the other service; this repo only *consumes* its HTTP API via React Query.

## Stack

**Core**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

**Data & State**
- Zustand — global UI state only (player, theme, modals, etc.)
- React Query — all server data (fetching, caching, mutations against the FastAPI backend)

**Forms & Validation**
- React Hook Form
- Zod

**Auth & Payments**
- Clerk (auth)

**Media**
- Wavesurfer.js (waveform rendering + playback)

**UX Polish**
- Framer Motion

## Architecture Rules

- **Frontend-only repo.** Business logic lives in the separately-maintained FastAPI backend. Next.js handles rendering, interaction, and calls the API via React Query. Next.js API routes should only be used for BFF concerns (auth token forwarding, file upload proxying) — never for real business logic.
- **Server Components** for layout and static shells.
- **Client Components** for interactivity — anything touching Wavesurfer, the player, forms, or Zustand stores.
- **Do not mix Zustand and React Query.** Zustand is *not* a server cache. If data comes from the backend, it belongs in React Query. If it's ephemeral UI (is-playing, current-track-id, sidebar-open), it belongs in Zustand.

## Folder structure

Scaffolded and kept in sync with [plan.md](plan.md). Empty dirs hold a `.gitkeep` until code lands.

```
app/                  # Next.js App Router
  layout.tsx          # Fonts, providers, sidebar shell
  page.tsx            # Home (/)
  providers.tsx       # QueryClientProvider, ThemeProvider, (Clerk)
  globals.css         # Tailwind + CSS variables (design tokens)
  generate/           # /generate
  library/            # /library
  album/              # /album
  stems/              # /stems
  edit/               # /edit — audio editing workspace
  subscription/       # /subscription

components/
  ui/                 # shadcn primitives + our additions (icon, pill, segmented, drop-zone)
  audio/              # waveform, play-button, track-thumbnail, player-bar
  layout/             # sidebar, app-shell, tweaks-panel
  home/               # announcement-banner, greeting, quick-tool-grid, recent-list, quick-start, credits-summary
  generate/           # generate-header, lyrics-card, prompt-bar, style-picker, generating-card, variation-card, history-panel
  library/            # library-header, library-table, library-row
  album/              # album-card, album-detail, album-header, album-waveform-player,
                      # create-form, empty-state, failed-view, generate-bar, generating-view,
                      # planning-view, results-view, review-view, token-confirm-dialog,
                      # track-edit-card, track-result-card
  stems/              # stems-header, track-info-bar, playback-bar, stem-row
  edit/               # tool-console, inspector-panel, playback-deck, track-header,
                      # source-waveform, result-waveform, waveform-timeline,
                      # candidate-card, empty-state, trim-loading-overlay
  subscription/       # credits-cards, plan-card

lib/
  api/                # React Query hooks, one file per backend resource
                      # client.ts, generations.ts, library.ts, album.ts, stems.ts, subscription.ts
                      # auto-edit.ts, edit-ops.ts, master.ts, podcast.ts, reference-match.ts
  types.ts            # Shared TS types (mirror FastAPI schemas)
  constants.ts        # STYLE_TAGS, STEMS, PLANS, NAV
  utils.ts            # cn(), formatTime(), getGreeting()
  audio-source-form-data.ts  # Helper: builds FormData from File or URL string

stores/               # Zustand — UI state only
  player-store.ts     # Current track, isPlaying, playhead
  ui-store.ts         # Sidebar collapsed, tweaks-panel open, accent override
  generate-draft-store.ts   # Draft prompt/styles (persists across nav)
  edit-store.ts       # Edit page: selected op, sources, result, A/B mode, analysis/preview state

hooks/                # Cross-cutting React hooks (use-player, use-waveform)
  use-edit-ab-player.ts  # A/B waveform player sync for the Edit page

public/               # Static assets
```

**Placement rule:** page-scoped components live under their page's folder. Anything used by 2+ pages moves to `audio/`, `layout/`, or `ui/`.

## Features implemented

### Edit Page (`/edit`)
Full audio editing workspace. Three-panel layout: Tool Console (left) → waveform canvas (center) → Inspector Panel (right), with a Playback Deck at the bottom.

**Operations available (`stores/edit-store.ts` → `OperationType`):**
- `auto_trim` — AI-powered beat-aware trim (analyze → preview → trim flow via `/auto-edit/*`)
- `cut` / `fade` / `loop` / `split` — basic destructive edits via `/test-edit/*`
- `mix` / `overlay` — multi-source operations
- `eq` / `ai_warmth` / `style_enhance` — audio enhancement
- `master` — platform-targeted LUFS mastering via `/master/*`
- `reference_match` — EQ/dynamics match to a reference track via `/reference-match/*`
- `podcast` — speech + music ducking production via `/podcast/produce`

**A/B comparison:** `use-edit-ab-player.ts` syncs two WaveSurfer instances (source vs. result). Toggling A/B keeps playhead position aligned across the window boundary.

**Source inputs:** every operation accepts either a `File` (upload) or a URL string. `lib/audio-source-form-data.ts` normalises this into `FormData` for every API call.

**Edit store** (`stores/edit-store.ts`): Zustand — holds selected op, primary/secondary sources, processing state, result blob, A/B mode, auto-trim analysis/preview data, and master platform selection. Operation change resets all per-op state and generates a new `projectId`.

### Auto-Edit / AI Trim (`lib/api/auto-edit.ts`)
Four-step AI trim flow against `/auto-edit/*`:
1. `useSuggest` — LLM infers target duration + energy preference from a plain-English description.
2. `useAnalyze` — BPM detection, beat grid, segment labels, scored candidate windows.
3. `usePreview` — AI agent picks the best window with plain-English reasoning.
4. `useTrim` — executes the trim (with optional beat-aligned crossfade), returns base64 audio + metadata.

### Mastering (`lib/api/master.ts`)
- `usePlatforms` — fetches available platform profiles (Spotify, YouTube, etc.) with LUFS targets.
- `useMasterProcess` — processes audio against a selected platform profile.
- `useMasterSave` — persists the mastered file to the backend.

### Reference Match (`lib/api/reference-match.ts`)
- `useRefMatchAnalyze` — fingerprints a reference track (BPM, key, mode, EQ projection).
- `useRefMatchProcess` — applies EQ + dynamics to make a target track match the reference.
- `useVibePrompt` — generates a music generation prompt from a reference track's fingerprint.

### Podcast Production (`lib/api/podcast.ts`)
- `usePodcastProduce` — combines speech + optional music with noise reduction, voice EQ, and configurable music ducking.

### Album Composer (`/album`, `lib/api/album.ts`)
Script-driven multi-track album generation. Status flow: `PLANNING` → `PLANNED` → `GENERATING` → `COMPLETED` | `FAILED`. Status-driven view in [components/album/album-detail.tsx](components/album/album-detail.tsx) renders one of `PlanningView`, `ReviewView`, `GeneratingView`, `ResultsView`, or `FailedView`.

**Polling rules — do not change without re-reading [performace_impro.md](performace_impro.md) §2.1:**
- `useAlbumPlanningPoll` polls `/album/{id}` every 10 s **only while `PLANNING`**.
- `useAlbumProgress` polls `/album/{id}/progress` every 10 s **only while `GENERATING`** and is the single source of status during generation; it invalidates `["album", id]` when status flips out of `GENERATING`, which causes `album-detail` to re-render with the new view.
- Adding `GENERATING` back to the planning poll, or mounting both polls in parallel, doubles backend traffic during the longest album phase.

### Stem Separation (`/stems`, `lib/api/stems.ts`)
- `useSeparateStems` — uploads audio + project_id, kicks off a background job.
- `useSeparationStatus` — polls `/separate/{taskId}` every 10 s while `PENDING` or `IN_PROGRESS`; returns 4 stem URLs on `COMPLETED`.

## Performance & memory invariants (don't regress)

These were established in [performace_impro.md](performace_impro.md). Future work must preserve them:

- **Edit-store frees blob URLs on every result transition.** `freeResult(state.result)` is called inside `setSelectedOperation`, `setPrimarySource`, `setResult`, and `resetAll` in [stores/edit-store.ts](stores/edit-store.ts). Don't bypass these setters.
- **Edit page download builds a one-shot blob URL.** [app/(app)/edit/page.tsx](app/(app)/edit/page.tsx) `handleDownload` decodes `audioB64` into a fresh URL and revokes it; do **not** reuse `result.blobUrl` for the download — the result waveform is still using it.
- **Clerk JWT is cached for 50 s with 401-retry.** [hooks/use-api.ts](hooks/use-api.ts) holds the token in a ref. New API hooks should go through `useApi`, not call `getToken()` directly (the one exception is `useSeparateStems` which uses `fetch` for multipart upload).
- **All polling intervals are 10 s.** Five hooks: `useGeneration`, `useAlbumPlanningPoll`, `useAlbumProgress`, `useSeparationStatus`, `useDownloadPoll`. Do not introduce shorter intervals without a coordination story.
- **QueryClient defaults** in [app/providers.tsx](app/providers.tsx): `staleTime: 30s`, `gcTime: 60s`, `refetchOnWindowFocus: false`, `refetchIntervalInBackground: false`. Background tabs do not poll.
- **Library invalidation** in [lib/api/generations.ts](lib/api/generations.ts) uses default `refetchType: "active"` — only refetches when `/library` is mounted. Don't add `refetchType: "none"` (silently stale UI) or switch to `setQueryData` without matching the `LibraryResponse` shape exactly.
- **List rows are memoized.** `LibraryRow` and `StemRow` are wrapped in `React.memo`; inline `style` objects are lifted to `useMemo`. Don't pass new object/function references through props on every render.
- **WaveSurfer instances are explicitly destroyed.** [hooks/use-edit-ab-player.ts](hooks/use-edit-ab-player.ts) calls `.destroy()` before clearing refs; A/B mutual-pause handlers are wrapped in `try/catch` to handle the destroyed-between-events race.
- **`reactStrictMode: true`** is on. Effects double-mount in dev — any new effect must have a clean teardown.

## Locked decisions (don't re-litigate)

Full rationale in [plan.md](plan.md) § Resolved decisions. Summary so future sessions don't re-ask:

- **Backend already exists** — separate FastAPI service. Never scaffold backend code here.
- **Clerk wired from day one** — `<ClerkProvider>` in `app/providers.tsx`, routes protected via `middleware.ts`. Auth header is `Authorization: Bearer ${await auth().getToken()}`.
- **API types generated from OpenAPI** via `openapi-typescript` → `lib/types.ts`. Run `npm run gen:types` to refresh.
- **Generation progress: polling** (React Query `refetchInterval`). No SSE / WebSocket client.
- **Player scope: page-local.** No sidebar mini-player.
- **Visual fidelity: pixel-perfect port of `sample.html`.** Sample is the spec; re-theme shadcn to match.
- **Dark mode only.** No `next-themes`, no light palette.
- **Desktop-only** for v1. Fixed 200px sidebar, `body { overflow: hidden }`, min width ~1024px.
- **Tweaks panel dropped.** Theme is fixed.
- **Marketplace** and **Album Composer** are real product names / real routes.
- **Edit API responses** can be either JSON (`{audio_b64, audio_format}`) or raw binary audio. `parseEditResponse` in `lib/api/edit-ops.ts` handles both transparently.
- **Edit operations reset state on op change** — switching the selected operation clears sources, result, analysis, and generates a fresh `projectId`. This is intentional; do not persist cross-op state in `edit-store`.
- **Auto-trim `candidates[]` capped at 20** in `setAnalysis`. The UI only renders a handful; long files were producing tens of MB of unused candidate data.
- **Album status is the routing key.** `album-detail` switches views purely on `album.status`. New states must be added to the switch in [components/album/album-detail.tsx](components/album/album-detail.tsx) and to the polling condition in [lib/api/album.ts](lib/api/album.ts).

## Commands

Once scaffolded (e.g. `npx create-next-app@latest`):

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npm test          # Run tests
```

Single test file:
```bash
npx jest path/to/file.test.ts
```

## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
