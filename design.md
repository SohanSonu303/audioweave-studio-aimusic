# AudioWeave Studio — Design System

Source of visual truth: [sample.html](sample.html) `:root` block + component styles.
This doc captures the tokens and patterns; implementation lives in `tailwind.config.ts` and `app/globals.css`.

---

## Design language

**Mood:** dark, cinematic, editorial. Warm amber accent against near-black canvas. Editorial display serif (Cormorant Garamond) for page titles; sans (Inter) for body; mono (JetBrains Mono) for timecodes.

**Vibe references:** Linear's information density + Arc's warmth + ChatGPT's focused prompt layout.

---

## Color tokens

Port to `tailwind.config.ts` under `theme.extend.colors`, and emit as CSS variables in `globals.css` so runtime theme tweaks still work.

```css
:root {
  /* Surfaces */
  --bg:          #0a0a0a;  /* App background */
  --surface:     #111111;  /* Sidebar */
  --card:        #161616;  /* Default card */
  --card-hi:     #1d1d1d;  /* Hover / elevated card */

  /* Borders */
  --border:      rgba(255,255,255,0.07);
  --border-md:   rgba(255,255,255,0.11);

  /* Text */
  --text:        #eeeeee;  /* Primary */
  --text-2:      #888888;  /* Secondary / labels */
  --text-3:      #505050;  /* Tertiary / placeholder */

  /* Accent (warm amber) */
  --accent:       #e8a055;
  --accent-dim:   rgba(232,160,85,0.18);
  --accent-glow:  rgba(232,160,85,0.06);
  --warm:         rgba(255,180,80,0.08);
  --warm-border:  rgba(255,180,80,0.15);

  /* Semantic (used for type pills, scene colors) */
  --red:    #e06060;
  --green:  #60c090;
  --blue:   #6090e0;
  --purple: #a070e0;
}
```

**Tailwind mapping (suggested):**
- `bg-background` → `--bg`
- `bg-surface` → `--surface`
- `bg-card` / `bg-card-hover` → `--card` / `--card-hi`
- `text-foreground` / `text-muted` / `text-subtle` → `--text` / `--text-2` / `--text-3`
- `border-subtle` / `border-default` → `--border` / `--border-md`
- `text-accent` / `bg-accent` → `--accent`

---

## Typography

```css
--font-display: 'Cormorant Garamond', Georgia, serif;  /* Page titles: weight 300, letter-spacing -0.3 to -0.5px */
--font-body:    'Inter', system-ui, sans-serif;         /* Everything else */
--font-mono:    'JetBrains Mono', monospace;            /* Timecodes, script textarea */
```

**Load via `next/font/google`** in `app/layout.tsx`:

```ts
import { Inter, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';
```

**Scale observed in sample:**
- 10px uppercase labels (letter-spacing 0.06–0.07em)
- 11px hints / timestamps
- 12px body secondary
- 13px body primary
- 14px section headers
- 22px empty-state display
- 28px page titles (display serif, weight 300)
- 38px home greeting (display serif)

---

## Shape & elevation

```css
--radius-pill: 9999px;   /* Buttons, tags, tabs */
--radius-card: 16px;     /* Cards */
--radius-sm:   8px;      /* Inputs, small containers */

--shadow-card: 0 0 0 0.5px rgba(255,255,255,0.05) inset,
               0 1px 2px rgba(0,0,0,0.4),
               0 4px 16px rgba(0,0,0,0.25);
--shadow-pill: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.4);
```

---

## Motion

All animations defined in sample, port verbatim:

- **`waveform-pulse`** (0.5s–1s staggered per bar) — bars scale Y when track is playing.
- **`shimmer`** (1.8s infinite) — skeleton loading.
- **`spin`** (0.8–1s linear infinite) — loading spinners on Generate / Analyse.
- **`fadeIn`** (0.35s ease) — row/card entry; stagger with `animation-delay` = `i * 60ms`.
- **`progress-glow`** (1.5s ease infinite) — accent glow on active progress bars.

Transitions: interactive elements use `transition: all 0.15s` (pills, buttons) or `0.2s` (cards). Framer Motion only where CSS transitions aren't enough (page transitions, list reorders).

---

## Layout constants

```css
--sidebar-w: 200px;   /* Fixed width; the sample never collapses */
```

**Canvas rule:** `html, body, #root { height: 100%; overflow: hidden; }` — page-level scrolling is always in a nested `overflow-y: auto` container, never the body. Preserve this.

**Content max-width for centered prompts:** `720px` (Generate page). Library and Stems pages use full width.

---

## Component patterns

### Cards
- Background `--card`, hover swaps to `--card-hi`.
- Border `--border`, 16px radius, shadow `--shadow-card`.
- For scene cards & active variations: colored **left border** (`border-left: 3px solid <themeColor>`).

### Pills (tags, filters, segmented tabs)
- Inactive: `rgba(255,255,255,0.05)` bg, `--text-2`, `--border`.
- Active: `rgba(232,160,85,0.2)` bg, `--accent` text, accent border, 12px glow.
- Exclude/negative pills: red instead of amber (see Generate page Exclude row).

### Primary button
- `--accent` bg, `#000` text, pill radius, weight 600.
- Disabled: `rgba(232,160,85,0.2)` bg, `--accent` text.
- Glow shadow when prominent: `0 2px 12px rgba(232,160,85,0.25)`.

### Secondary button
- `rgba(255,255,255,0.06)` bg, `--border`, `--text-2`.

### Play button (3 sizes)
- **xs (22–24px):** library row thumbnails, history items.
- **sm (26–32px):** inline playback, stems global bar.
- **md (variation card):** `--accent` solid fill, white icon.

### Waveform
Props: `bars` (30–90), `playing` (bool), `color`, `dim` (bool).
Deterministic heights from a ref-held seed (no re-roll on render).
Gap: 2px, min-height: 2px, border-radius: 2px, opacity 0.85 (dim → 0.5).

### Table rows (library, stems)
- Grid-based, not flex, to keep columns aligned.
- Library: `32px 1fr 1fr 180px 60px 80px 80px` (play / title+thumb / tags / waveform / duration / BPM / actions).
- Stems: `160px 1fr 130px 90px` (label / waveform / volume / S-M-DL).
- Hover: `rgba(255,255,255,0.03)` background.
- Borders between rows: `rgba(255,255,255,0.04)` (lighter than card borders).

### Scrollbars
```css
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
```

---

## Icon system

All icons live in `components/ui/icon.tsx` as a single `icons` record mapping name → SVG path string or array of paths. Matches sample exactly — **do not add an icon lib (lucide etc.) until we outgrow this**. The curated set is intentional and keeps bundle size tiny.

---

## Semantic color usage

Pages use the semantic palette for **content type** — don't use amber for everything:

- **Music** → `--accent` (amber)
- **Song** → `--green`
- **Sound FX** → `--purple`
- **Ballad / emotional** → `--red`

Scene cards in Album page pick from this palette cyclically; library rows derive thumbnail gradient + type chip color from item type.

---

## Accessibility notes (to enforce once coding starts)

- Buttons must have text labels or `aria-label` (icon-only buttons in sample don't).
- Color contrast: `--text-3` on `--bg` is ~3.0:1 — fine for labels, not for meaningful body text.
- Play/pause must be keyboard-operable and announce state.
- Sliders (volume, playhead) need proper `<input type="range">` semantics — sample already does this.
- Focus rings: design a visible ring tied to `--accent` (sample omits this; we will add it).

---

## Open design questions

Tracked in [plan.md](plan.md) under "Open questions". The ones that directly shape this doc:
- Whether to keep or drop the **Tweaks panel** runtime overrides.
- **Dark-only** vs light mode too (doubles every token).
- **Responsive** scope (affects whether sidebar becomes a drawer).
