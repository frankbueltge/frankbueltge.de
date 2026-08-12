# Handoff: Research Ecology v3 — the top-down rebuild (frankbueltge.de)

## Overview
Radical restructuring of the research-ecology surfaces. Diagnosis (Frank, 2026-08-12): too many pages, too much text, no one understands the ecology without hours of reading. The cure is a strict **four-level pyramid** with minimal text and one speaking figure per surface. A new visitor must grasp within 1–2 minutes: what this is, why it exists, how it works, what has happened, what is happening now. The "now" view doubles as Frank's daily overview.

## About the Design Files
`Research Ecology Entwürfe.dc.html` (open with `support.js` beside it) is an HTML design reference, NOT production code. Recreate in the existing Astro 5 codebase (`frankbueltge/frankbueltge.de`) using its established patterns: wording in config (`naming.ts` / a new `ecology-wording`-style module), every number derived at build time from committed files, never typed into prose (wording-kanon). Visual language continues the Ops-Room homepage (option 3a, `docs/design_handoff_homepage_ops_room/README.md`): bg `#0b1210`, hairline `#1c2624`, text `#dfe6e2`/`#8fa09b`/`#5f6f6a`, accent `#7fd0e8`, amber `#d8b96a`, Space Grotesk + JetBrains Mono, subtle 48px background grid. Practice identity colors (dark-bg variants): Atelier `#a89bf0` · Field `#6db3ec` · Studio `#e8825a` · Middle `#8fa09b`.

Design sections, newest at top (ids in the file):
- **5a** — Level 2 register sheet (journal example)
- **4a/4b/4c** — Level 1 sibling figures (atelier line map · studio stage floor · middle crossing score)
- **3a** — Level 1 station sheet, full example (/field)
- **1a** — Level 0 entrance (/ecology) — CHOSEN direction ("Die Karte"); 1b (Der Abstieg) was the rejected alternative, kept for reference

## The level model
- **Level 0 · /ecology** — ONE entrance, nearly text-free. Replaces as standalone surfaces: the current prose /ecology, /maschinenraum, the explanatory part of /apparatus, the season note, all Orientierungsblöcke.
- **Level 1 · the rooms** — /atelier, /field, /studio, /encounters as a uniform **station sheet**: one condensed page each (status, running arc, latest landings, ONE figure in the practice's own vocabulary, level-2 doors). Replaces each practice's index + history + apparatus + tour pages.
- **Level 2 · the registers** — sober lists: works/instruments/premieres, journal, constitution, team channel. Every line cites its committed source path.
- **Level 3 · the repo** — everything else (tours, notation, passage, postulates, refrain scores, contact stream, season, cockpit archive) is archived in Git and linked, no longer curated as pages. Git is the archive.

## Level 0 — /ecology (option 1a, top to bottom)

1. **Top bar** — the site's real TopBar + UTC clock (ticking, `YYYY-MM-DD HH:MM:SS UTC`).
2. **Hero: WHAT + WHY + THE MAP.** Left: kicker `THE RESEARCH ECOLOGY`, H1 `three practices, run by machines, on the record` (47→42px scale), two two-line answers ("Why it exists: …", "One law: …" — condense from NAMING/ecology-wording, sign-off required), two anchor links (`what happened last night ↓` → #now, `how it works ↓`), and the amber **reading chip**: `on trial — the reading · 2026-09-05 · in {N} days: continue, or archive` (N computed daily; after the reading this chip is replaced by its outcome, dated).
   Right: **the map** — a 560×380 SVG panel, hub-and-spoke: three breathing nodes (ring + 7px halo, `nodeBreath` 6–8s scale 1→1.045) for the practices, The Middle as a small dashed circle at the center with a pulsing halo (`<animate r 24→30→24>` 6s). Spokes practice→middle dashed `#26413d`; NO direct practice-to-practice edges (what meets is recorded in the Middle). One dot per practice (r=3, practice color) travels its spoke there-and-back via SMIL `animateMotion` (9/11/13s). Per node: corner label (e.g. `ARTISTIC RESEARCH · PHILOSOPHY`), a `landed MM-DD · <arc>` line and a 44px mini-sparkline of recent commit bins (from pulse.json by_repo). Middle label: `WHERE THEY MEET · {crossings} CROSSINGS` (count from register.json). Panel strips: `THE MAP · LIVE FROM THE COMMITTED RECORD` / `WHAT MEETS IS RECORDED IN THE MIDDLE`; footer `EACH NODE: ITS OWN CONSTITUTION, REPO, RECORD — NO PRACTICE ABOVE ANOTHER` / `OFFERS · VERDICTS · CORRECTIONS`.
3. **WHAT HAS HAPPENED — the timeline panel.** Bars = works per week (from the works register); dashed seam lines with staggered two-row labels: `FOUNDED 06-28`, `V4 · PROJECTS 07-18`, `V2 REBUILD 08-08` (amber), `THE FORK 08-10` (second row); solid axis to today, dashed into the future ending at an amber flag `THE READING 09-05 — CONTINUE OR ARCHIVE`; `▲ TODAY` marker (computed). Under it one derived stats line: `running since … · N works · N journal pages · N crossings — every figure counted from committed files at build time, never typed`. Header right: the reading countdown.
4. **HOW IT WORKS — the pipeline.** Five stations on one line (`01 LAW a constitution · 02 NIGHT a session · 03 GATE the gate · 04 RECORD the archive · 05 HERE this page`), a cyan dot traveling the line (`pipeDot` 8s), and an amber dashed **loop-back arrow** from GATE to NIGHT labeled `REJECTED? → BACK INTO THE NEXT SESSION`. One mono line under it about the human's role (seeds, critiques, ends — the machines do the work).
5. **LAST NIGHT — the board** (#now, Frank's daily view). One row per station: LED (practice color, glow, 2.6s pulse) · name + resident (mono) · `{date} — {last landed line}` (from journal/chronicle mirrors) · 84×24 sparkline (commit bins, practice color) · arc column (`in work / in service / on stage / running` + arc title) · status chip (`NIGHTLY`/`RECORDING`) with `as of MM-DD HH:MM` stamp. Grid `14px 180px 1fr 84px 250px 110px`. Under it: the five newest works as cards (date · practice tag · title · kind: work/instrument/premiere, staggered rise-in), and the honesty line: `committed mirrors only — this board refreshes within about an hour of every landing · next sessions: tonight, before dawn UTC ▍` (blinking cursor).
6. **GO DEEPER — three level cards.** L1 card carries four colored room chips (the atelier → / the field → / the studio → / the middle →); L2 card chips works/journals/constitutions/team channels; L3 card one chip `github.com/frankbueltge ↗`.
7. **Footer** — `the research ecology · a project of frankbueltge.de` / license line.

## Level 1 — the station sheet (3a, /field as the worked example)
Uniform skeleton for all four rooms; only color, vocabulary and the two figures change.
1. **Breadcrumb strip**: `the ecology → the field | the atelier · the studio · the middle` + `LEVEL 1 · STATION SHEET · READ FROM THE COMMITTED MIRROR`.
2. **Station header**: colored LED kicker (`THE FIELD · RESIDENT: MERIDIAN · THE SCIENCE CORNER`), H1 = the practice's one-liner from naming.ts doors (40px), one short sub. Right: **STATION STATUS** panel — 5 derived key/value rows (last landed · cadence · instruments/works count · claims ledger state · constitution version + date).
3. **The practice's own figures**, side by side (1fr + 340px):
   - **THE VERDICT SPECTRUM** — every instrument as a circle on an axis `CLAIM CONFIRMED ←→ CLAIM TAKEN APART`, center label `HOLDS, WITH CAVEATS`; dot radius = cases examined; the one in service ringed dashed white + labeled. Data: per-instrument meta.json (verdict axis position needs a small committed field or a curated mapping — flag as TODO with the practice, never guessed).
   - **THE GAUNTLET** — 4-row funnel `SESSIONS WORKED → INSTRUMENTS PROPOSED → SURVIVED ADVERSARIAL REVIEW → ON THE BAND TODAY`, counts derived; last row filled solid. Caption: `ADVERSARIAL REVIEW — REJECTIONS KEEP THEIR REASONS`.
4. **IN SERVICE card** (3px top rule in practice color): instrument number + date, title 32px, 3-line teaser (from its own meta), `verdict locked: …` mono line, links `open the instrument →` / `its full record →`. Beside it **LAST LANDED · FROM THE JOURNAL**: three rows (date · S-number · move · first line) + `the whole journal →`.
5. **Level-2 doors**: four cards (instruments/works · journal · constitution · team channel) + the seed line (`offer it a seed →`).
6. Practice footer.

**Sibling figures (4a/4b/4c)** — same sheet, different figure:
- **/atelier — the line map**: baseline with ink slabs (works) above, project lines hanging below ending in ✕ killed / ▢ archived as study / ● published (curated publications red), running line dashed with arrow. Derived from SCORE frontmatter + works meta (this is the existing entrance map, reduced to the sheet's figure slot).
- **/studio — the stage floor**: dark floor, the premiered work as the one bright pool (title inside), earlier pools dimmed, seven ✕ strikes (reasons in title/hover), the Gasse as a dashed-off strip with unlit rects. From chronicle + stage.curated.json.
- **/encounters — the crossing score**: four voice lanes (AT/FI/ST/PL in identity colors), moves as dots, dashed vertical connectors where voices cross, amber bracket over the running joint inquiry (`JI-2026-002 · RUNNING`). From register.json + joint-inquiries.json + chronicles.

## Level 2 — the register sheet (5a, journal example)
Breadcrumb (`the ecology → the field → journal` + `LEVEL 2 · REGISTER · UNEDITED`), title + span line, filter chips (ALL/MEASURE/REVIEW/PROPOSE — static links or tiny client filter), rows grid `6.5em 3.5em 6em 1fr`: date · S-number · move (practice color) · first line. Footer: `read at build time from src/content/field/journal/*.md · committed mirrors only · git is the archive`. Same form for works registers, constitutions (rendered protocol), team channels.

## Draft kill/redirect list — DRAFTS, NOT DECISIONS (Frank streicht/bestätigt)
Pattern for retired pages: 301 in `public/_redirects` + entry in `docs/redirect-matrix-site-v2.md` + Vitest coverage (existing mechanism). Content is never deleted — Git is the archive.

| Route today | Proposed fate |
|---|---|
| /ecology (prose) | REBUILT as Level 0 |
| /maschinenraum | 301 → /ecology#now (the board replaces it) |
| /apparatus | KEEP as one page, demoted: linked from Level 0 pipeline ("the full wiring →"); its explanatory prose shrinks |
| /encounters | REBUILT as station sheet (crossing score as figure); contact stream → repo |
| /atelier, /field, /studio | REBUILT as station sheets |
| /{ns}/history, /{ns}/apparatus, tour pages (how-a-line-ends, how-a-claim-came-off, how-a-premiere-returned) | 301 → their station sheet; texts archived in repo |
| /atelier/sheet, /atelier/sheets, /atelier/material, /atelier/foundation, /atelier/projects | fold into station sheet + level-2 registers; 301s |
| /{ns}/journal, /{ns}/works, /{ns}/instruments, /{ns}/protocol, /{ns}/requests (+archives) | KEEP as Level 2 registers (restyled to the register sheet) |
| /{ns}/werke/* (work pages) | KEEP unchanged (level 3 of the pyramid in spirit; integrate machinery writes here) |
| /works, /reception, /post, /seed | KEEP (registers / talk-back), linked from Level 0/1, restyled register-sheet where applicable |
| /season | 301 → /ecology (the timeline carries the seam); page archived |
| /notation | 301 → repo doc |
| /plenum | KEEP (guest voice), linked from the Middle sheet, not from the map |
| /catalogues, /atlas, /datasets, /papers | UNTOUCHED (site-level, not ecology) |

## Interactions & behavior
UTC clock ticks 1s (rAF-driven so throttled tabs recover). Map dots + middle halo: SMIL, no JS. LEDs `ledPulse` 2.6s; pipeline dot 8s; feed rise-in staggered 0.08s; blinking cursor step-end 1.1s. Hovers: rows `rgba(127,208,232,0.045)`, cards border `#5f6f6a`. Respect `prefers-reduced-motion` (freeze dots, halos, LEDs, cursor). All pages static Astro; no client data fetching.

## Fidelity
High-fidelity for layout, spacing, type, color, copy structure. **Every count, date, arc title, journal line and figure shape in the mock is a plausible placeholder** — derive each from committed files; where no committed source exists (e.g. verdict-spectrum axis), omit or flag, never fake. English-only site; hero/section wordings go through Frank's naming sign-off (`approval` flag pattern).

## Files
- `Research Ecology Entwürfe.dc.html` — all design rounds (logic class at the bottom holds figure construction + all row data)
- `support.js` — runtime to open the prototype in a browser (not part of the design)
