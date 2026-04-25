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
| `/album` | Album Composer — scene-based arrangement |
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
