# Handoff: Homepage Redesign — "Ops Room" (frankbueltge.de)

## Overview
Redesign of the frankbueltge.de homepage (the hub entrance). The page becomes an **ops room**: a live status board of everything running on the site — the standing question as hero, the commit pulse as an instrument, one board for all running systems, a signal log of the newest works, and a dashboard of live experiments with their current daily readings. Less text than the current homepage, more instrument.

## About the Design Files
The files in this bundle are **design references created in HTML** (a Design Component prototype), not production code. The task is to **recreate the chosen design in the existing codebase** — Astro 5, fully static, at `frankbueltge/frankbueltge.de` — using its established patterns: copy in `src/config/naming.ts`-style config, data derived at build time from committed snapshots, no numbers hard-coded in copy (site canon: numbers are rendered from data, never typed into wording).

Open `Homepage Entwürfe.dc.html` in a browser (keep `support.js` next to it). It contains all design rounds; **Runde 3 (top section)** is the relevant one:
- **Option 3a — Ops Room** (id `3a`): the primary design.
- **Option 3c — Monochrom** (id `3c`): identical to 3a, previewed through `filter: grayscale(1)`. If chosen, implement real monochrome tokens (map the cyan accent and practice colors to gray/white steps) instead of a CSS filter.
- **Option 3b — Observatorium** (id `3b`): alternative direction (serif plates), not the primary.

## Fidelity
**High-fidelity** for layout, spacing, typography, color and copy structure. **All data values shown (readings, counts, dates, sparkline shapes) are plausible placeholders** — in production every one must be rendered from the repo's committed snapshots (pulse.json, werke data, per-experiment day records). If a value has no committed source yet, omit the tile rather than fake the number.

## Page Structure (Option 3a, top to bottom)

### 1. Top bar
- 52px high, border-bottom `#1c2624`, padding 0 40px, three groups (space-between):
  - Left: 7px round LED (`#7fd0e8`, pulse animation 2.6s) + "Frank Bültge" (14px, 600).
  - Center nav (13.5px, `#8fa09b`): **Projects ▾ · Lab · About · Contact** — must stay derived from the real `TopBar.astro` nav (Projects dropdown with Research projects / Other projects sections).
  - Right: live UTC clock, JetBrains Mono 11px, `#7fd0e8`, format `YYYY-MM-DD HH:MM:SS UTC`, ticking every second.

### 2. Hero — question + pulse instrument
- Grid `1fr 440px`, gap 48px, padding `60px 40px 56px`, border-bottom `#1c2624`.
- Left:
  - Kicker: "THE STANDING QUESTION" — JetBrains Mono 11px, letter-spacing 0.22em, `#7fd0e8`.
  - H1: `what machines are actually better at` (from `NAMING.title`, lowercase) — Space Grotesk 47px/700, letter-spacing −0.02em, line-height 1.08, max-width 16ch.
  - Sub (15.5px/1.6, `#8fa09b`, max 50ch): "Constant attention, nightly measurement, evidence at scale — and whether machines can research on their own and produce work that holds up. Every claim leads back to its evidence. Git is the archive." (Condensed from `NAMING.sub` — final wording goes through naming.ts approval.)
  - Two mono 12px links: "enter the ecology →" (cyan, underline rgba(127,208,232,0.35)) · "tonight's works →" (`#8fa09b`).
- Right — the pulse instrument (border `#1c2624`, bg `rgba(13,21,19,0.85)`, radius 8, header/footer strips in JetBrains Mono 9.5px `#5f6f6a`):
  - Header: "PULSE · COMMITS, ALL 7 REPOSITORIES" / "ONE LINE PER WEEK · W27–W32".
  - Body 200px: **Joy-Division-style stack** — 14 ridgelines, drawn back-to-front, each `fill:#0d1513` (occludes lines behind), `stroke: rgba(223,230,226,0.85)`, width 1. Data: each of the 6 most recent ISO weeks from `src/data/pulse/pulse.json` split into two half-week lines (42 bins), one smoothing pass (moving average of 3), edge taper `sin(π·t)^0.55` so energy sits mid-line, per-line peak normalization, baseline `36 + i·12.6` in a 1000×220 viewBox (preserveAspectRatio none), amplitude 58.
  - **Wandering dots**: ~6 dots (r 2.4, `#7fd0e8`, opacities 0.4–0.95) travel along different lines; position from `(time·speed + phase) mod 1` evaluated on the line's polyline; speeds 0.009–0.027 cycles/s; update ~10 fps with `transition: cx/cy 0.12s linear`.
  - Footer: "2-HOUR BINS · MA ×2" / "AS OF <pulse.as_of>".

### 3. THE BOARD — all running systems
- Section head (mono 11px, 0.22em): bold white "THE BOARD" + "· WHAT IS RUNNING HERE, LIVE FROM THE RECORD"; right link "maschinenraum →".
- Two groups, each: group label (mono 9.5px, 0.2em, `#5f6f6a`) + bordered table (`#1c2624`, radius 8, bg `rgba(13,21,19,0.7)`).
  - Group 1 "THE RESEARCH ECOLOGY · FOUR STATIONS, ONE GATE — MACHINE-RUN, PUBLISHED UNEDITED": The Atelier (resident: Ulysses), The Field (resident: Meridian), The Studio (resident: Ensemble), The Middle (no resident — kept by the conductor).
  - Group 2 "BESIDE THE ECOLOGY · SAME LAW, DIFFERENT BETS": Machine Attention (the counter-experiment), Error as Method (forked from the Atelier).
- Row grid: `14px 200px 1fr 96px 200px 74px`, gap 14px, padding 13px 18px, hairline row separators, hover bg `rgba(127,208,232,0.045)`.
  - Cells: pulsing LED (practice color, glow `box-shadow 0 0 8px`) · name 14.5px/600 + resident line (mono 10px `#5f6f6a`) · one-line what (13px `#8fa09b`) · sparkline (96×26 svg, practice color, from that repo's recent commit bins) · last output title (mono 11px) + date (mono 10px) · status chip (mono 9.5px right-aligned: NIGHTLY/RECORDING/RUNNING).
  - One-liners and last-work data must come from `naming.ts` doors + the works register (`src/data/werke.ts` / practice meta.json) — never retyped.
- Practice colors (dark-bg variants): Atelier `#a89bf0`, Field `#6db3ec`, Studio `#e8825a`, Middle `#8fa09b`, Machine Attention `#7fd0e8`, Error as Method `#d8b96a`.

### 4. SIGNAL LOG — newest works
- Head: "SIGNAL LOG · WHAT LANDED LAST, NEWEST FIRST"; right "works register →".
- 5 rows (same bordered-list style): date (mono 11px `#5f6f6a`, 6.5em) · practice tag (mono 10px uppercase, practice color, 7em) · title (14px/600) · kind right-aligned (work/instrument/premiere, mono 10px). Staggered rise-in on load (0.08s steps).
- Source: same feed as the current LATEST section (works register, newest first).
- Below: "next sessions: tonight, before dawn UTC" + blinking cursor `▍` (cyan, step-end 1.1s).

### 5. LIVE EXPERIMENTS — current readings
- Head: "LIVE EXPERIMENTS · CURRENT READINGS — EVERYTHING THAT SHIPS DATA, DAILY"; right "lab →".
- **Include only experiments with `live: true` in `src/data/werke.ts`** (plus Machine Attention's two surfaces). 12 tiles, grid 4 columns, gap 14px.
- Tile anatomy (border `#1c2624`, radius 8, bg `rgba(13,21,19,0.7)`, padding 16px 18px 14px, hover border `#5f6f6a`):
  - Name row: mono 10px 0.16em `#8fa09b` + small pulsing LED.
  - **Big reading**: JetBrains Mono 25px/500 `#dfe6e2` — the experiment's actual current daily figure, rendered from its committed day snapshot.
  - Sub: 11.5px/1.5 `#8fa09b`, min-height 51px.
  - Mini-viz: 26px-high svg (line / bars / squares / dotted line / line-with-gap), cyan `rgba(127,208,232,0.75)` + dim `#26413d`.
  - Stamp: mono 9px 0.12em `#5f6f6a`.
- The 12 tiles and their reading semantics (placeholder values in the mock; wire each to its snapshot):
  1. MACHINE ATTENTION · THE FOREKNOWN — open warnings on the ledger ("87 clocks"), closed overnight + lead-time verdicts.
  2. MACHINE ATTENTION · OBSERVATORY — TED notices preserved last night ("+214"), candidates at the six-criteria gate.
  3. THE PROTOCOL — today's agenda items ("12 items"), sources with "Feststellung entfällt".
  4. THE CONSENSUS — outlets that ran today's most-copied sentence ("38 outlets").
  5. ICEBERG THEORY — language editions silent on today's contested topic ("2 silent" of 5).
  6. THE POLICY — today's climate premium vs. 1998 ("+179%").
  7. EDITORIAL DEADLINE — today's most substantive removal ("−412 words").
  8. THE GHOST FLEET — vessels in deliberate AIS silence today ("23 dark"), most striking case.
  9. ROUND NUMBERS — today's Benford verdicts ("2 / 2 flagged").
  10. PATTERNS — today's strongest self-mined correlation ("r = 0.83"), permutation-test caveat.
  11. ALL ALONG THE WATCHTOWER — satellites in view now ("31 in view") — computed client-side, location never leaves the browser.
  12. ATLAS OF DATA ART — catalogued works count ("203 works") from `src/data/atlas/werke.json`.
- Below the grid, one mono 11px line: "catalogues, grown by machine: Dataset Register · Paper Catalogue · Works Register" (links).

### 6. THE OTHER HOUSES
- Head: "THE OTHER HOUSES · INDEPENDENT — WORKS TRAVEL BOTH WAYS".
- Two cards (border/bg as tiles, padding 18px 20px): datavism.org and data-snack.com, name 16px/600 + `↗`, one-liner 13px `#8fa09b`. Copy from `NAMING.travel` (data-snack card keeps the Plenum line).

### 7. Footer
- Border-top `#1c2624`, bg `#070c0a`, padding 26px 40px, mono 10.5px `#5f6f6a`, space-between:
  "© 2026 Frank Bültge · a federated research ecology" / "code Apache 2.0 · works CC BY 4.0 · data CC0 · Git is the archive".

## Interactions & Behavior
- UTC clock ticks every second.
- Pulse dots wander continuously (~10 fps update is enough; keep it requestAnimationFrame-driven so throttled tabs recover).
- LEDs pulse (opacity 1 → 0.3 → 1, 2.6s ease-in-out infinite).
- Signal-log rows stagger in on first paint (translateY 10px → 0, 0.6s, 0.08s delay steps).
- Blinking cursor: step-end 1.1s.
- Hovers: board/log rows get `rgba(127,208,232,0.045)` bg; cards get border `#5f6f6a`.
- All motion is ambient — no carousel/rotation on this design; respect `prefers-reduced-motion` (freeze dots, LEDs and cursor).

## State Management
- Clock + dot positions: one shared timer (rAF, throttled to ~100ms).
- Everything else is static build output (Astro). Board rows, signal log, tiles: derived at build time from committed data; the page has no client data fetching.

## Design Tokens (3a)
- Background: `#0b1210`; panel: `rgba(13,21,19,0.7–0.85)`, `#0d1513` (pulse fill); footer `#070c0a`.
- Hairline: `#1c2624` (row separators at 0.7 alpha).
- Text: `#dfe6e2`; muted `#8fa09b`; faint `#5f6f6a`.
- Accent (live/cyan): `#7fd0e8`; dim accent `#26413d`; accent washes `rgba(127,208,232,0.02–0.09)`.
- Practice colors: see §3.
- Subtle background grid on the page: two 1px `rgba(127,208,232,0.022)` linear-gradients, 48px cell.
- Type: Space Grotesk (display/body), JetBrains Mono (labels, readings, stamps). Sizes as specified per section.
- Radius: 8px panels/tiles, 9999px LEDs. Monochrome variant (3c): map cyan → `#e8edec`, practice colors → gray steps, keep everything else.

## Assets
None — no images. All graphics (pulse stack, sparklines, tile mini-vizzes) are inline SVG drawn from data.

## Files
- `Homepage Entwürfe.dc.html` — all design rounds; Runde 3 = options 3a (primary), 3c (mono), 3b (alternative). Logic class at the bottom of the file contains the pulse-stack construction, dot math and all row/tile data.
- `support.js` — runtime needed to open the prototype in a browser (not part of the design).
