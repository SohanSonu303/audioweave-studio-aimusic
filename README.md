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
- **Zustand** — ephemeral UI state (player, sidebar)
- **Clerk** — authentication
- **Wavesurfer.js** — waveform rendering & playback
- **Framer Motion** — animations

## Project Structure

```
app/               # Next.js App Router pages
components/        # UI components grouped by feature
lib/
  api/             # React Query hooks (one file per backend resource)
  types.ts         # TypeScript types generated from FastAPI OpenAPI spec
  constants.ts     # Shared constants (style tags, plans, nav)
  utils.ts         # Helpers (cn, formatTime, getGreeting)
stores/            # Zustand stores (player, ui, generate-draft)
hooks/             # Shared React hooks
public/            # Static assets
```

## Notes

- **Frontend only.** This repo has no backend code. All business logic lives in the FastAPI service.
- **Dark mode only.** No light theme.
- **Desktop-first.** Minimum width ~1024px.
- API types are auto-generated — run `npm run gen:types` after backend schema changes.
