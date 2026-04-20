# AudioWeave Studio — Build Plan

Reference prototype: [sample.html](sample.html). All structural decisions trace back to it.

Stack & architecture rules live in [CLAUDE.md](CLAUDE.md).
Visual tokens, typography, animations, spacing live in [design.md](design.md).

---

## Component inventory (extracted from sample.html)

Mapping every distinct React node in the prototype to a component we need to build.

### Primitives (pure UI, shadcn-style)
| From sample | Becomes | Notes |
|---|---|---|
| `<Icon>` + `icons` map | `components/ui/icon.tsx` | Keep the centralized path dict; export `Icon name="..."` |
| `<Pill>` | `components/ui/pill.tsx` | Wrapper around shadcn `Button` with accent/active variant |
| `<Card>` | shadcn `Card` (wrapped) | Add hover variant via `data-hover` attribute |
| Accent button (Generate / Upgrade / Download album) | shadcn `Button` variant=`accent` | |
| Inline segmented tab (`Song / Music / Sound FX`, `History / Favorites`, `Generations / Saved / History`) | `components/ui/segmented.tsx` | Used 3× — worth its own component |
| Skeleton + shimmer | shadcn `Skeleton` | |
| Drop-zone (stems upload) | `components/ui/drop-zone.tsx` | Reusable: drag state, click-to-browse, accepts any mime |

### Audio primitives
| From sample | Becomes |
|---|---|
| `<Waveform bars playing color dim>` | `components/audio/waveform.tsx` — SVG bars for now; swap to Wavesurfer.js per-row later |
| Play/pause circle button (used 6+ places at different sizes) | `components/audio/play-button.tsx` with `size` prop |
| Thumbnail-with-tiny-waveform (library row) | `components/audio/track-thumbnail.tsx` |

### Layout
| From sample | Becomes |
|---|---|
| `<Sidebar>` (logo, workspace, nav, credits, upgrade, settings) | `components/layout/sidebar.tsx` |
| Per-page top bar | each page renders its own header; no shared `<Topbar>` yet |
| `<App>` root flex shell | `app/layout.tsx` + `components/layout/app-shell.tsx` |
| Tweaks floating panel | `components/layout/tweaks-panel.tsx` (scope TBD — see design questions) |

### Home page
| From sample | Becomes |
|---|---|
| NEW marketplace banner | `components/home/announcement-banner.tsx` |
| Greeting header | `components/home/greeting.tsx` (uses `getGreeting()` util) |
| Quick tool grid (4 cards) | `components/home/quick-tool-grid.tsx` |
| "Latest from library" list | `components/home/recent-list.tsx` (reuses `TrackThumbnail`) |
| Quick start action rows | `components/home/quick-start.tsx` |
| Credits mini-card | `components/home/credits-summary.tsx` |

### Generate page
| From sample | Becomes |
|---|---|
| Top bar with Untitled + Song/Music/FX segmented + Enhance | `components/generate/generate-header.tsx` |
| Lyrics card (Song tab only) | `components/generate/lyrics-card.tsx` |
| Generating skeleton + progress | `components/generate/generating-card.tsx` |
| Variation result cards | `components/generate/variation-card.tsx` |
| Prompt composer (textarea + variations counter + mic + Generate button) | `components/generate/prompt-bar.tsx` |
| Include/Exclude style pill rows | `components/generate/style-picker.tsx` |
| History/Favorites right panel | `components/generate/history-panel.tsx` |

### Library page
| From sample | Becomes |
|---|---|
| Header (title + search + filter + sort) | `components/library/library-header.tsx` |
| Tabs (Generations/Saved/History) + type pills | merged into header |
| Table column headers | `components/library/library-table.tsx` |
| Track row (thumbnail, title, tags, waveform, duration, BPM, actions) | `components/library/library-row.tsx` |

### Album page
| From sample | Becomes |
|---|---|
| Script input (left panel, textarea + Analyse button) | `components/album/script-input.tsx` |
| Empty state (right panel, pre-analysis) | `components/album/empty-state.tsx` |
| Analyzing state (spinner + progress) | `components/album/analyzing.tsx` |
| Scene timeline bar (colored segments) | `components/album/scene-timeline.tsx` |
| Scene card (genre/BPM/mood chips + Generate) | `components/album/scene-card.tsx` |
| Export footer (Export All Stems / Download Album Pack) | `components/album/export-footer.tsx` |

### Stems page
| From sample | Becomes |
|---|---|
| Header (title + Upload new + Export all) | `components/stems/stems-header.tsx` |
| Track info strip (filename + progress or ✓ Ready) | `components/stems/track-info-bar.tsx` |
| Empty drop zone | reuses `ui/drop-zone.tsx` |
| Global playback bar (play, playhead slider, timecodes) | `components/stems/playback-bar.tsx` |
| Stem row (label + waveform w/ playhead line + volume slider + S/M/DL) | `components/stems/stem-row.tsx` |

### Subscription page
| From sample | Becomes |
|---|---|
| Credits-used card + current-plan card | `components/subscription/credits-cards.tsx` |
| Plan card (name, price, features, current/popular states) | `components/subscription/plan-card.tsx` |

---

## Folder structure

Directories marked ✅ exist on disk (with `.gitkeep` placeholders). Files listed inside them are planned, not yet written.

```
audioweave-studio-aimusic/
├── app/                              ✅
│   ├── layout.tsx                    # Fonts, providers, sidebar
│   ├── page.tsx                      # Home
│   ├── providers.tsx                 # QueryClientProvider, ThemeProvider, (Clerk)
│   ├── globals.css                   # Tailwind + CSS variables
│   ├── generate/  ✅  → page.tsx
│   ├── library/   ✅  → page.tsx
│   ├── album/     ✅  → page.tsx
│   ├── stems/     ✅  → page.tsx
│   └── subscription/ ✅ → page.tsx
├── components/                       ✅
│   ├── ui/            ✅  # shadcn + our primitives (icon, pill, segmented, drop-zone)
│   ├── audio/         ✅  # waveform, play-button, track-thumbnail
│   ├── layout/        ✅  # sidebar, app-shell, tweaks-panel
│   ├── home/          ✅  # announcement-banner, greeting, quick-tool-grid, recent-list, quick-start, credits-summary
│   ├── generate/      ✅  # generate-header, lyrics-card, prompt-bar, style-picker, generating-card, variation-card, history-panel
│   ├── library/       ✅  # library-header, library-table, library-row
│   ├── album/         ✅  # script-input, empty-state, analyzing, scene-timeline, scene-card, export-footer
│   ├── stems/         ✅  # stems-header, track-info-bar, playback-bar, stem-row
│   └── subscription/  ✅  # credits-cards, plan-card
├── lib/                              ✅
│   ├── api/           ✅  # React Query hooks, one file per backend resource
│   │                      #   client.ts, generations.ts, library.ts, album.ts, stems.ts, subscription.ts
│   ├── types.ts           # Shared TS types (mirror FastAPI schemas, ideally generated)
│   ├── constants.ts       # STYLE_TAGS, STEMS, PLANS, NAV
│   └── utils.ts           # cn(), formatTime(), getGreeting()
├── stores/                           ✅
│   ├── player-store.ts                   # Current track, isPlaying, playhead (global)
│   ├── ui-store.ts                       # Sidebar open, tweaks open, accent override
│   └── generate-draft-store.ts           # Draft prompt/styles (persists when user leaves page)
├── hooks/                            ✅
│   ├── use-player.ts
│   └── use-waveform.ts
├── public/                           ✅
├── CLAUDE.md
├── design.md
├── plan.md
└── sample.html                       # Reference prototype (do not delete)
```

**Rule of thumb:** page-scoped components live under their page's folder. Anything used by ≥2 pages moves to `audio/`, `layout/`, or `ui/`.

> Note: `.gitkeep` files will be deleted as real files land in each folder.

---

## Phased TODO

Checkpoints; complete a phase before starting the next.

### Phase 0 — Scaffold (blocks everything)
- [x] Create empty folder tree (`app/*`, `components/*`, `lib/api`, `stores`, `hooks`, `public`) with `.gitkeep` placeholders
- [ ] `npx create-next-app@latest` into this repo (TypeScript, Tailwind, App Router, `src/` = no, ESLint = yes)
- [ ] Install runtime: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `framer-motion`, `wavesurfer.js`, `@clerk/nextjs`
- [ ] Install dev: `openapi-typescript` + `tsx` (for the type-gen script)
- [ ] Add `npm run gen:types` script: `openapi-typescript $NEXT_PUBLIC_API_URL/openapi.json -o lib/types.ts`
- [ ] Install shadcn/ui and init: `npx shadcn@latest init`
- [ ] Add base shadcn components: `button card input textarea tabs slider skeleton dialog tooltip scroll-area separator avatar`
- [ ] Configure fonts in `app/layout.tsx` via `next/font/google` (Inter, Cormorant Garamond, JetBrains Mono)
- [ ] Port design tokens from `sample.html` `:root` into `globals.css` + `tailwind.config.ts` (see design.md) — **dark-only**, no light palette
- [ ] Set up `lib/api/client.ts` — fetch wrapper that attaches `Authorization: Bearer ${await auth().getToken()}` from Clerk
- [ ] Wire `app/providers.tsx` with `<ClerkProvider>` > `<QueryClientProvider>` > devtools
- [ ] Add Clerk middleware (`middleware.ts`) protecting all routes except `/sign-in`, `/sign-up`
- [ ] Add `.env.local.example` with `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

### Phase 1 — Design primitives
- [ ] `components/ui/icon.tsx` — port `icons` dict from sample verbatim
- [ ] `components/ui/pill.tsx`
- [ ] `components/ui/segmented.tsx`
- [ ] `components/ui/drop-zone.tsx`
- [ ] `components/audio/waveform.tsx` — start with the SVG-bars implementation from sample; identical API
- [ ] `components/audio/play-button.tsx`
- [ ] `components/audio/track-thumbnail.tsx`
- [ ] Verify all primitives visually against sample.html in isolation (Storybook optional, not required)

### Phase 2 — Layout shell
- [ ] `components/layout/sidebar.tsx` (NAV constant in `lib/constants.ts`)
- [ ] `app/layout.tsx` renders sidebar + `{children}` flex shell, hides body scroll
- [ ] Set up routing: `/`, `/generate`, `/library`, `/album`, `/stems`, `/subscription`
- [ ] Active-nav detection via `usePathname()`
- [ ] `stores/ui-store.ts` — sidebar collapsed state (future-proof; not urgent)

### Phase 3 — Pages (build in this order; each page is a separate PR-sized chunk)
1. [ ] **Home** — static content, wires `onNavigate` via `<Link>`
2. [ ] **Library** — table renders from mock data first, swap to React Query once API contract is known
3. [ ] **Generate** — hardest page; break into PromptBar → StylePicker → HistoryPanel → VariationCard
4. [ ] **Stems** — upload flow + stem mixer (mute/solo/volume in local state; no real DSP yet)
5. [ ] **Album** — script textarea + scene analysis list
6. [ ] **Subscription** — pricing grid, static PLANS constant until Stripe

### Phase 4 — State + backend integration
- [ ] `stores/player-store.ts` — page-local player coordination (only one track plays at a time within a page)
- [ ] `stores/generate-draft-store.ts` — prompt/styles persist across nav
- [ ] Replace mock data page-by-page with React Query hooks under `lib/api/*`
- [ ] Generation progress via React Query `refetchInterval` polling
- [ ] Marketplace banner → links to `/marketplace` stub page

### Phase 5 — Payments (Clerk already wired in Phase 0)
- [ ] Stripe: defer until backend exposes a checkout-session endpoint
- [ ] Stems upload flow: revisit with backend team; pick between pre-signed URL vs proxied route

### Phase 6 — Polish
- [ ] Framer Motion page transitions (match the `fade-in` keyframe in sample)
- [ ] Real waveforms via Wavesurfer.js on library rows & stems page
- [ ] Keyboard shortcuts (⌘↵ already in prompt bar — formalize)
- [ ] Empty / error / loading states for every React Query hook
- [ ] ~~Responsive breakpoints~~ — out of scope for v1 (desktop-only)

---

## Resolved decisions

All Phase-0 blockers answered. Recorded here so future sessions can't re-litigate.

**Architectural**
1. **Backend** already exists as a separate FastAPI service. This repo is UI only — never scaffold backend code here.
2. **Auth:** Clerk wired from **day one**. `<ClerkProvider>` wraps the app; all routes protected except `/sign-in`, `/sign-up`. User avatar lives in the sidebar. Auth header is **Clerk JWT**: `Authorization: Bearer ${await getToken()}`.
3. **Generation progress:** **polling** via React Query `refetchInterval` on `/generations/:id` while status is in-progress. No SSE/WebSocket client needed.
4. **Stems upload:** **deferred.** Use static sample data in the stems page for now. Decide upload flow when we actually wire that page to the backend.
5. **Player scope:** **page-local only.** Each page manages its own currently-playing track. No sidebar mini-player. `stores/player-store.ts` is still global-ish (a single "nothing else plays while this plays" guard) but no persistent playback across routes.

**API typing**
6. **Types auto-generated from OpenAPI** via `openapi-typescript`. Script in `package.json`: `pnpm gen:types` reads `${NEXT_PUBLIC_API_URL}/openapi.json` and writes `lib/types.ts`. Run in CI + pre-commit.

**Design**
7. **Visual fidelity:** **pixel-perfect port** of `sample.html`. Tokens (`#0a0a0a` bg, `#e8a055` accent, Cormorant Garamond display, etc.) are the spec. Re-theme shadcn to match — never accept shadcn defaults where the sample has an opinion.
8. **Theme:** **dark only.** No light mode, no `next-themes`. Saves a full duplicate token set.
9. **Responsive:** **desktop-only** for v1. Fixed 200px sidebar, `body { overflow: hidden }`, min width ~1024px. Mobile is a future project, not Phase 6.
10. **Tweaks panel:** **dropped.** Not ported. Theme is fixed in CSS variables.
11. **Marketplace banner:** **real upcoming feature.** Port the banner with a live link to `/marketplace`. Stub the page with a "Coming soon" placeholder for now.
12. **Album Composer:** **real product name.** Nav label "Album", page title "Album Composer", route `/album`.

## Still open (non-blocking)

- `NEXT_PUBLIC_API_URL` base URL — set in `.env.local` when backend handoff happens.
- Stems upload flow (question #4) — revisit when we wire the stems page.
- Stripe checkout endpoint — revisit when backend exposes it.
