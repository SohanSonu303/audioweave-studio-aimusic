# AudioWeave Studio

AI music generation frontend built with Next.js. Connects to a separately-deployed FastAPI backend.

## Prerequisites

- Node.js 18+
- A running instance of the AudioWeave FastAPI backend
- A [Clerk](https://clerk.com) account for authentication

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment variables**

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key — from [dashboard.clerk.com](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk secret key — from [dashboard.clerk.com](https://dashboard.clerk.com) |

**3. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev        # Development server with hot reload
npm run build      # Production build
npm run start      # Start production build locally
npm run lint       # ESLint
npm run gen:types  # Regenerate lib/types.ts from FastAPI OpenAPI schema
```

## Stack

- **Next.js 16** (App Router) — TypeScript
- **Tailwind CSS** + **shadcn/ui** — styling
- **React Query** — all server data / API calls
- **Zustand** — ephemeral UI state (player, sidebar, edit workspace)
- **Clerk** — authentication
- **Wavesurfer.js** — waveform rendering & playback
- **Framer Motion** — animations

## Features

| Route | Description |
|-------|-------------|
| `/` | Home dashboard — recent tracks, credits summary, quick tools |
| `/generate` | AI music generation with style picker and variation cards |
| `/library` | Paginated track library with waveform previews |
| `/stems` | Stem separation — upload audio, poll for 4 isolated stems (vocals, drums, bass, other) |
| `/edit` | Audio editing workspace — cut, fade, loop, split, mix, overlay, EQ, AI warmth, style enhance, AI auto-trim, mastering, reference match, podcast production |
| `/album` | Album Composer — script-driven multi-track album generation with planning → review → generating → results flow |
| `/subscription` | Plan management and credits |

### Edit Page (`/edit`)

Three-panel layout with a bottom playback deck:
- **Tool Console** (left) — select one of 13 operations
- **Waveform Canvas** (center) — source waveform with candidate region overlays; result waveform rendered below after processing; A/B toggle compares original vs. processed in sync
- **Inspector Panel** (right) — operation-specific controls (source upload/URL, parameters, run button)

**Operations:** `auto_trim`, `cut`, `fade`, `loop`, `split`, `mix`, `overlay`, `eq`, `ai_warmth`, `style_enhance`, `master`, `reference_match`, `podcast`

**AI Auto-Trim flow:** natural language description → LLM suggests params → BPM analysis + candidate windows → AI picks best window with reasoning → beat-aligned trim with optional crossfade.

**Mastering:** platform-targeted LUFS normalization (Spotify, YouTube, etc.) with before/after report.

**Reference Match:** EQ + dynamics match a target track to a reference audio fingerprint; also generates a music-gen prompt from any reference track ("Vibe Prompt").

**Podcast Production:** combines speech + background music with noise reduction, voice EQ, and configurable ducking.

### Album Composer (`/album`)

Generate a full album from a script or concept. The flow:

1. **Create** — submit a script/prompt, backend kicks off planning.
2. **Planning** — backend analyses the script and proposes a track list (`PLANNING`). UI polls every 10 s.
3. **Review** — once `PLANNED`, user reviews / edits / replans individual tracks before approval.
4. **Generating** — on approval (`GENERATING`), backend produces each track. Progress endpoint reports per-track status; UI shows a live progress bar and per-track state.
5. **Results** — on `COMPLETED`, results view renders the playable album. Failed albums fall through to a `FailedView`.

### Stem Separation (`/stems`)

Upload audio → backend splits into 4 stems (vocals, drums, bass, other). Polled every 10 s while `PENDING`/`IN_PROGRESS`; cost is 300 tokens per job.

## Performance & memory

The app is hardened for long-lived editing sessions and concurrent users. Key invariants (see [performace_impro.md](performace_impro.md) and [CLAUDE.md](CLAUDE.md) for details):

- Edit-page blob URLs and base64 payloads are revoked / freed on every operation, source, or result transition — no per-tab memory growth across consecutive edits.
- Clerk JWT cached in memory for 50 s with single-shot 401 retry — a 4-step auto-edit flow makes ≤1 token fetch.
- All long-running queries poll on a uniform 10 s cadence and pause completely on hidden tabs (`refetchIntervalInBackground: false`).
- Album status polling is split across phases: `useAlbumPlanningPoll` covers `PLANNING`, `useAlbumProgress` covers `GENERATING` — never both at once.
- Library list rows and stem rows are `React.memo`-wrapped; WaveSurfer instances are explicitly destroyed on cleanup.
- `next.config.ts` enables `optimizePackageImports` for `lucide-react` and `@base-ui/react`, plus `reactStrictMode: true`.

## Project Structure

```
app/               # Next.js App Router pages
  edit/            # Audio editing workspace
  generate/        # AI music generation
  library/         # Track library
  stems/           # Stem separation
  album/           # Album Composer
  subscription/    # Plans & credits
components/
  edit/            # tool-console, inspector-panel, playback-deck,
                   # source-waveform, result-waveform, waveform-timeline,
                   # candidate-card, trim-loading-overlay, track-header
  audio/           # waveform, play-button, track-thumbnail, player-bar
  (other feature folders…)
lib/
  api/             # React Query hooks (one file per backend resource)
                   # Includes: auto-edit.ts, edit-ops.ts, master.ts,
                   #           podcast.ts, reference-match.ts, stems.ts
  audio-source-form-data.ts  # Normalises File | URL → FormData for edit APIs
  types.ts         # TypeScript types generated from FastAPI OpenAPI spec
  constants.ts     # Shared constants (style tags, plans, nav)
  utils.ts         # Helpers (cn, formatTime, getGreeting)
stores/
  edit-store.ts    # Edit page state (op, sources, result, A/B mode, analysis)
  player-store.ts  # Global player state
  ui-store.ts      # Sidebar / UI state
  generate-draft-store.ts
hooks/
  use-edit-ab-player.ts  # A/B waveform sync for Edit page
  (use-player, use-wavesurfer…)
public/            # Static assets
```

## Notes

- **Frontend only.** This repo has no backend code. All business logic lives in the FastAPI service.
- **Dark mode only.** No light theme.
- **Desktop-first.** Minimum width ~1024px.
- API types are auto-generated — run `npm run gen:types` after backend schema changes.
- Edit API responses may be JSON `{audio_b64, audio_format}` or raw binary audio — both are handled transparently by `parseEditResponse` in `lib/api/edit-ops.ts`.
- Stem separation costs 300 tokens per job; mastering and edit operations have their own token costs defined in the backend.
