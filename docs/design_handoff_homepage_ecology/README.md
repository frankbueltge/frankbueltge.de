# Handoff: frankbueltge.de homepage + research ecology redesign

## Overview
Redesign of two surfaces of frankbueltge.de (Astro repo `frankbueltge/frankbueltge.de`, ecology data in `frankbueltge/research-ecology`):

1. **Homepage** (`/`, today `src/components/pages/OpsRoom.astro`): the ops room made clearer. In order: site nav, standing question, commit pulse, a "since yesterday / since your last visit" bar, the lead (the newest ecology cycle and that night's three pieces) beside a timetable of who worked when, the other systems, readings, what is new, and an index.
2. **Research ecology** (`/ecology`, `/studio`, `/field`, `/atelier`, `/encounters`). The cycle is drawn as a **score**: three staves (one per practice), one bar per night since v3 (30 Aug 2026), sessions as noteheads, presentations as bars, and the Middle's relations as slurs. Each practice page shows its own part, with the siblings as ghost staves.

**Arch is removed everywhere and archived.** **"Error as Method" is labelled "Ulysses"** (that is its name; the route stays `/error-as-method`).

## About the design files
The `.dc.html` files are **design references built in HTML**: prototypes that show the intended look and behaviour. They are not production code. Recreate them in the existing Astro codebase, using its patterns: `NAMING` config for all copy, `src/lib/ops/*` and `src/lib/ecology/*` for derivations, build-time rendering, and small client scripts only for pointer and clock. Open a file directly in a browser to see it; `support.js` is the prototype runtime and is not part of the deliverable.

The data in `eco/*.json` is a **snapshot from 2026-10-10 ~12:46 UTC**, merged by hand for the prototype. In production every number must come from the existing derivations, never typed (house rule: *no number is typed*).

## Fidelity
**High-fidelity** for the desktop files at 1440 px and the homepage mobile file at 390 px: colours, type, spacing and interactions are final. The ecology pages exist only at desktop size; derive their mobile layout from the homepage mobile patterns described below.

## House rules to keep (from the codebase)
- No typed numbers. Copy that wraps a number is a function in `NAMING`.
- No client data fetching. Everything is rendered at build time from committed snapshots. The prototypes `fetch()` a JSON file only because they have no build step.
- Absence is drawn. A system with nothing in its record still appears and says so.
- The name eyebrow `FRANK BÜLTGE · DATA ENGINEERING & ANALYTICS` must stay on the homepage (SEO, see the comments in `src/pages/index.astro`).
- `prefers-reduced-motion`: no moving dots, and the clock text still updates.

---

## Design tokens

| Token | Value | Use |
|---|---|---|
| ground | `#f3efe6` | page background (cream), all pages; pulse ridge fill |
| ground-2 | `#ebe6da` | ecology "how a cycle works" band, selected rows |
| ink | `#161412` (home) / `#1b1915` (ecology) | text, rules; unify to `#161412` |
| ink-2 | `#3a352d` | body copy |
| muted | `#6a645a` (home) / `#6b655a` (ecology) | secondary text; unify to `#6a645a` |
| rule | `#d8d2c4` / `#d3ccbc` | hairlines |
| rule-light | `#e3ddcf` | row separators |
| accent | `#d2401f` | new-since markers, pulse dots, hover hairline, homepage kicker |
| shade-new | `#f0d9cf` | timetable cells since the reference point |
| The Field | `#2c6aa3` | practice identity |
| The Atelier | `#6650c4` | practice identity |
| The Studio | `#bf5427` | practice identity |

**Type**
- Display/serif: **Literata** (Google Fonts, opsz 7–72, 400/500/600, italic 400/500).
- UI/sans: **Schibsted Grotesk** 400/500/600/700. Also used for all small labels: uppercase, letter-spacing .08–.18em, 10.5–12 px, weight 600.
- Homepage H1: Literata italic 500, 72 px (mobile 40 px), line-height 1, letter-spacing −.015em, one line on desktop.
- Section titles: Literata 24–26 px (mobile 22 px).
- Ecology: former Instrument Serif sizes ×0.84 in Literata (e.g. H1 64 px, section 34 px, score mark text 12 px italic).

**Rules and frames**: 1 px solid ink for panels; `3px double` ink for major section breaks (masthead top, before "Overnight" and the index). No radii. One shadow only, on the dropdown: `0 18px 40px -18px rgba(22,20,18,.45)`.

**Spacing**: page gutter 64 px (desktop) or 16 px (mobile). Section gap 26–34 px. Row padding 8–12 px vertical.

---

## Screens

### 1. Site nav — `Site Nav.dc.html` (shared on every page)
- 40 px bar, ground background, bottom rule `#d8d2c4`, padding 0 64 px.
- Left: the name eyebrow (link to `/`), Schibsted 600 12 px, letter-spacing .08em.
- Right, gap 24 px: `PROJECTS ▾` (button), `LAB` → `/experiments`, `ABOUT` → `/about`, `CONTACT` → `/contact`.
- **Projects dropdown**: opens on hover and on click, closes on mouse leave. A 600 px panel, right-aligned to the button with a 6 px gap (the gap is padding inside the hover area, so the panel does not close on the way down). Ground background, 1 px ink border, shadow above. Two columns, 1.5fr and 1fr, gap 28 px:
  - **RESEARCH PROJECTS**, each as name (Literata 17 px) plus line (12 px muted):
    - The research ecology: *three practices, one shared question* → `/ecology`
    - Machine Attention: *the counter-experiment* → `/machine-attention`
    - Atlas: *contemporary data art, source-cited* → `/atlas`
    - n-1: *the Atelier’s third line* → `/n-1`
    - Ulysses: *Error as Method, the Atelier’s nightly line* → `/error-as-method`
  - **OTHER PROJECTS**: data-snack.com → `/work/data-snack`, datavism.org → `/work/datavism`, then `all projects →` → `/work`.
- In code this belongs in `TopBar.astro`. The lists come from `NAMING`, with no Arch entry.

### 2. Homepage desktop — `Home B Edition v2.dc.html` (1440 px)
1. **Masthead** (centred). `THE STANDING QUESTION` (12 px, .18em, muted), then H1 *what machines are actually better at*. Below it a dateline bar with a 3 px double top rule and a 1 px bottom rule: the date on the left (`Saturday, 10 October 2026`), `now HH:MM:SS UTC` on the right, tabular numerals, live.
2. **Pulse** (port of `src/lib/ops/stack.ts`, keep its maths). A 1 px ink frame with a strip above and below the 240 px figure.
   - Head strip: `PULSE · {n} REPOSITORIES` on the left; `{W35–W41} · TWO LINES/WEEK` on the right, muted.
   - Foot strip: `2-HOUR BINS · TAPERED · ONE LINE PER HALF WEEK, OLDEST AT THE TOP`; `AS OF {as_of}`.
   - SVG viewBox 1000×220 with `preserveAspectRatio="none"`. 14 ridges (7 ISO weeks × 2 halves), each filled with the ground colour and stroked 1 px ink with `vector-effect: non-scaling-stroke`, painted oldest first so each ridge occludes the ones behind it.
   - Smoothing, taper, peak normalisation, monotone curve and the 6 dots exactly as in `stack.ts`. Dots are accent-coloured and painted right after their ridge; draw them as ellipses (rx 2, ry 2.4) to compensate for the aspect ratio. Seed each dot at its phase at build time.
   - Hover over a ridge: the ridge stroke turns accent at 1.6 px, a 1 px accent hairline follows the pointer, and a chip at top right reads `W41 · SAT 10:00 UTC · 14 COMMITS` (the raw bin, not the tapered height).
   - **Arch's bins are subtracted** from the aggregate, so the label says 9 repositories.
3. **Since bar**: ink background, ground-coloured text, 10 px × 16 px padding.
   - Left: Literata 17 px, either `Since your last visit, on Wednesday 7 October: 3 days, 38 arrivals across the house.` or `Since yesterday: N arrivals across the house.`
   - Right, in order: a note (11.5 px, `#cfc8b8`), a dashed-border toggle `○ remember my visits` / `● remembering your visits`, and, only when a reference exists, two mode buttons (`since your last visit` / `since yesterday`; the active one is ground-filled with ink text).
4. **Lead + timetable**: grid `minmax(0,1fr) 1px 470px`, gap 28 px; the 1 px column is an ink rule.
   - Lead: kicker `THE RESEARCH ECOLOGY · CYCLE 007 OPENED TODAY` (12 px 600 .14em accent). The cycle question in Literata 500 44 px, `text-wrap: balance`. A standfirst in Literata 18 px. Three briefs in 3 columns under a 1 px ink rule, each: practice name (11.5 px 600 .1em, practice colour), title (Literata 22 px), `{kind} · today` (12.5 px muted). Then links `Enter the ecology →` and `Every work and artifact →`.
   - **Timetable** ("who worked when · UTC"): rows are the 8 systems, columns the last 7 days. Each cell is the first–last active two-hour block of that day (`02–08`), or `·` (`#b9b2a3`) when nothing ran. Today's column is bold; cells since the reference point are shaded `#f0d9cf`. Hovering a cell shows a readout below, e.g. `Ulysses · Friday 9 October: 84 commits in 5 of 12 two-hour blocks (00 06 08 20 22)`. A footnote states the rule. **Only what has run is shown, with no forecast.**
5. **Overnight, house by house**: 4 columns (Machine Attention, Ulysses, n-1, Lab & catalogues) with 1 px rules between them. Each shows name and status (accent; muted if closed), the last delivered item (Literata 19 px), and a meta line: date · commits in seven nights · relation.
6. **Readings + since list**: grid 1.25fr / 1fr, gap 40 px.
   - Readings: rows of `190px | 1fr | 160px`; the figure is Literata 20 px, right-aligned, `nowrap`. These are the 10 tiles from `src/lib/ops/tiles.ts`.
   - Since list: titled `Since your last visit` or `Since yesterday`. Grouped by day under `FRIDAY 9 OCTOBER · 7 ARRIVALS` (accent), showing at most 7 items per day and then `and N more in the longer log`.
7. **Index/footer**: 3 px double rule, then 6 columns: the 4 catalogues (Atlas of Data Art, Dataset Register, Paper Catalogue, Works Register → `/ecology#register`) and 2 other houses (datavism.org, data-snack.com, external ↗). Licence line below.

### 3. Homepage mobile — `Home Mobile.dc.html` (390 px)
- **Sticky top bar** (56 px). The name in two lines (`FRANK BÜLTGE` / `DATA ENGINEERING & ANALYTICS`, 11 px). A `MENU` button, at least 64×44 px, that inverts to `CLOSE` while open. The menu expands inline: research list (Literata 19 px rows, at least 44 px tall), other projects, `all projects →`, then a 3-up grid of LAB / ABOUT / CONTACT buttons, 44 px tall.
- H1 40 px italic; the dateline as on desktop.
- **Pulse** 170 px tall. Dots are ellipses rx 5.6, ry 2.6. `pointermove` on the ridges, `touch-action: pan-y`. The readout moves into the foot strip, left side, accent.
- **Since bar** stacked: text, then buttons (at least 40 px tall, wrapping), then the note.
- **Timetable**: name column 84 px, 7 day cells. Each cell is a **mini strip of 12 bars** (bar height 3 + √n·3 px, max 16) instead of time text. Tap a cell for the readout.
- Every other section is stacked in one column with the same type at a smaller scale. The index uses 2 columns.

### 4. Ecology `/ecology` — `Ecology Score.dc.html` (`Ecology Score Dark.dc.html` is the same page on a dark ground; optional)
- Site nav, then a 48 px sub-nav: `the research ecology` (anchor), the score, how a cycle works, the three voices, the programme, the middle, works register, and on the right `pose a question →` (→ `/seed`).
- **Hero**: H1 *One question, three voices.* with a v3 intro. On the right a "NOW · CYCLE 007" box with the current question and its origin.
- **The score**: 1312×336 px.
  - Staves: three 5-line staves (Field y78, Atelier y162, Studio y246; line spacing 6 px), x from 150 to 1290. One bar per day from 2026-08-30 to today. Cycle boundaries are 1.5 px barlines with boxed rehearsal numbers and the question as an italic caption when the cycle is wide enough. A dashed "today" line.
  - Notes: one notehead per journal session (10×7 px ellipse rotated −20°, stacked upwards when there are several sessions on one day). Filled when that night left a work or artifact, hollow otherwise.
  - Presentations: a 4×24 px bar in the practice colour on the closing day of each cycle.
  - Slurs: a quadratic curve from the giver's stave to the taker's. Styles: `built_on` solid 1.5 px, `answered` dashed `4 3`, `noted` dotted `1 3`. Filter buttons: all / built on / answered / hide.
  - Every notehead and slur has a hover tooltip (dark chip, 300 px wide). Clicking a cycle band selects it; outside the selection, notes drop to opacity .35.
- **Cycle detail** below the score: question, the findings per practice, presentation links, and a 3×3 stat grid (sessions and works per practice, Middle counts).
- **How a cycle works**: 5 steps, using the real 006 → 007 turn as the example. Then the convening: three proposals with each practice's ranking and the tally score; the winner is marked `● won · opens cycle 007`.
- **The three voices**: one card per practice with the bulletin **verbatim**. Collapsed to its first paragraph, `read the whole bulletin · N lines ↓` expands it.
- **The programme**: all cycles newest first; a click selects the cycle in the score and scrolls up.
- **Works register**: search, then practice / kind / cycle filters and date sort; rows link out. Atelier windows have no date in their path and are listed by cycle.

### 5. Practice pages — `Ecology Studio / Field / Atelier.dc.html` (one template, parameterised by `ME` and `SIB`)
- Hero in the practice colour (6 px top border), with a "station status" box.
- **The part**: this practice's own stave at full size (9 px line spacing), the siblings as faint ghost staves (4 px), slurs only to and from this practice. A slur is drawn in the sibling's colour when this practice took something, in its own colour when a sibling took from it.
- Latest work with an image slot (placeholder; use the work's real still); the bulletin verbatim with a fold; handoffs (offered to / offered by, with status); journal (newest 8); works by cycle as chips, presentations outlined in ink.

### 6. The Middle — `Ecology Middle.dc.html`
- A giver × taker matrix (3×3, diagonal empty; cell tint scales with the count) with built-on / answered / noted counts.
- Crossings night by night as stacked bars since 7 Sep, with cycle markers.
- A log filterable by kind and taker; handoffs as a status bar plus the list of open handoffs; the longest-running threads.

---

## Interactions & state

| State | Where | Notes |
|---|---|---|
| `menuOpen` | Site Nav, mobile header | hover/click; close on leave |
| clock | homepage | 1 s tick, UTC; one rAF loop also drives the pulse dots (~10 fps), skipped under reduced motion |
| pulse hover `{line, x, text}` | homepage | reads the raw bins from data attributes, as `OpsRoom.astro` does today |
| `mode` | homepage | `visit` or `yesterday` |
| remembered visits | homepage | see below |
| selected cycle, relation filter, open bulletins, register filters | ecology | all client-side over build-time data |

### "Since your last visit": opt-in, browser-only
- **Default: nothing is stored** and the page shows "since yesterday".
- `remember my visits` (an explicit user request) writes **one localStorage entry**, `fb-home-visits = {"ref": <ms|null>, "seen": <ms>}`. Nothing is sent anywhere, and no cookie is set.
- On each load, when the entry exists: if `now − seen > 6 h`, this is a new session and `ref = seen`; otherwise `ref` stays. Then `seen = now` is written back. A reload therefore does not reset the reference point.
- Clicking again (`● remembering your visits`) **removes the entry** and falls back to "since yesterday".
- "New" means: signal-log entries whose date is after `ref` (day precision), and commit bins whose block ends after `ref` (two-hour precision).
- Reason: § 25 TDDDG allows storage on the device without consent only when it is strictly necessary for a service the user explicitly requested, hence opt-in. Proposed privacy-policy line (German): *„Startseite – ‚remember my visits‘: Nur wenn Sie diese Funktion einschalten, speichert die Seite im lokalen Speicher Ihres Browsers einen Zeitstempel Ihres letzten Besuchs, um Neues seitdem zu markieren. Er wird nicht an uns übertragen und lässt sich jederzeit mit einem weiteren Klick löschen.“* Have it legally checked.
- The prototype's Tweaks prop `lastVisit` (`yesterday` / `3 days ago` / `a week ago`) only simulates this for review. Drop it in production.

## Data sources (what to wire in production)

| Element | Source in repo |
|---|---|
| pulse | `src/data/pulse/pulse.json` via `src/lib/ops/stack.ts` (subtract `by_repo.arch`, or drop arch from `scripts/fetch-pulse.ts` REPOS) |
| timetable bins | `pulse.json` `weeks[].by_repo[repo]`, 84 two-hour bins per ISO week; repo → system mapping as in `NAMING.opsRoom.board.groups` (without arch) |
| board / overnight | `src/lib/ops/board.ts` `buildBoard()` |
| signal log, since list | `src/lib/ops/house-feed.ts` `buildHouseFeed()` |
| readings | `src/lib/ops/tiles.ts` `readTiles()` |
| lead (cycle question, three pieces) | `src/data/ecology/cycle.json` + newest artifact/work per practice from the register |
| score, programme, convening, relations, handoffs | `research-ecology/relay/relay.json` (`programme`, `convening`, `relations`, `handoffs`) |
| sessions (notes) | `src/content/{field,atelier,studio}/journal/*`; a filled note means the register has a dated work/artifact that day |
| bulletins | `src/content/{field,atelier,studio}/BULLETIN.md`, verbatim |
| works register | `src/lib/engines/register.ts` `allWorks()` |

## Assets
No images other than the latest-work slot on the practice pages (use the work's own still). Fonts: Literata and Schibsted Grotesk from Google Fonts (self-host them in production, in line with the site's CSP).

## Files in this bundle
- `Site Nav.dc.html`: shared top bar with the Projects dropdown
- `Home B Edition v2.dc.html`: homepage, desktop
- `Home Mobile.dc.html`: homepage, mobile
- `Ecology Score.dc.html`, `Ecology Score Dark.dc.html`: `/ecology`
- `Ecology Studio.dc.html`, `Ecology Field.dc.html`, `Ecology Atelier.dc.html`: practice pages
- `Ecology Middle.dc.html`: `/encounters`
- `eco/home.json`, `eco/ecology.json`: data snapshots for the prototypes only
- `support.js`: prototype runtime (not for production)
