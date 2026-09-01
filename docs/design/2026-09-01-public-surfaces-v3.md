# Public surfaces v3 — the three practice pages on one template (decision record)

**Date:** 2026-09-01 · **Commissioned by:** Frank Bültge as part of the public-surfaces
refresh (wording private, paraphrased here) · **Follows:** the currency pass (#804) and the
v3 wording canon with the new door one-liners (#805) · **Order in force:**
`docs/design/2026-08-30-research-ecology-v3.md`.

## What changed

`/field`, `/atelier` and `/studio` were rebuilt on **one shared template**,
`src/components/ecology/PracticeStation.astro`, in the design language of the v3 entrance
(`EcologyV3Entrance.astro`) and The Middle (`MiddleV3.astro`) — so the ecology's surfaces
read as one instrument, and what differs between the three pages is the practices' record,
never the layout. The pages themselves became thin: per-practice data assembly (the last
sessions, read from each practice's own kind of record) and one `<PracticeStation>`.

Each station shows, top to bottom:

1. **Header** — kicker (name · persona · corner, read from `ECOLOGY_V3.practices`), the door
   one-liner as H1 and standfirst (`splitDoorLine` over `NAMING.doors` — a station cannot
   describe its practice differently from the door that leads to it), one identity paragraph
   from the new `PRACTICE_V3` wording, and a sibling strip.
2. **NOW** — the cycle chip (`loadCycle`, wording reused from `ECOLOGY_V3.cycle`), the
   question this practice works (the seed's question, else its standing theme), the **latest
   bulletin** rendered through a new markdown-lite reader
   (`src/lib/ecology/bulletin-render.ts` — headings, list items, paragraphs, inline emphasis
   via `segments()` from `middle.ts`; rendering emphasis the practice itself wrote is not
   paraphrase), and the last sessions with a link to the whole journal.
3. **MADE** — the newest works from the works register (withdrawn marked, as on `/works`), a
   counted line whose number is an argument, the link into the practice's register room, and
   the current cycle's artifacts (`loadArtifacts`), absence drawn.
4. **Figure slot** — only the Atelier keeps a figure: its line map, in its own
   instrument-panel language, on the `id="figure"` anchor the door's tour link and a retired
   route's 301 still land on.
5. **DOORS** — `DOORS[id]` + `windowDoor(id)`, unchanged, which keeps the archived record
   (e.g. `/atelier/archive/cockpit`) reachable.
6. **Foot** — the dated lineage line and the way back to `/ecology` and `/seed`.

Invariants carried over from the surfaces around it: **no typed number** (copy that wraps a
number is a function taking it), **no client fetching**, **absence is drawn**, **appearance
via classes only** (the CSP drops inline styles). The per-practice accent is the validated
`--hub-c-*` voice token from `hub-triptych.css`, keyed by `data-voice`, and appears exactly
twice per page: a hairline and the cycle LED.

## What was retired, and where it went

The **station sheets of 2026-08-12** left the three routes. `StationSheet.astro`,
`GateStrip.astro`, `Gauntlet.astro`, `StageFloor.astro`, `ClaimFigure.astro` and the
`field-plate.css` claim-host bridge from #804 are no longer imported by the pages — they
stay in the repository unlinked, per the house rule that superseded things are archived, not
deleted (git is the archive). `buildStationSheet` and the rest of the pyramid libraries stay
and stay tested; `splitDoorLine`, `DOORS`, `windowDoor` and `readConstitution` are
load-bearing for the new template too. `PYRAMID.stationSeo` remains in the repo but the
pages now read `PRACTICE_V3.seo`.

With the Field's and the Studio's figures gone from their pages, the **tour targets moved**:
`NAMING.doors` sends meridian to `/field/instruments` and ensemble to `/studio/works`
(ulysses keeps `/atelier#figure`); the triptych cards follow their doors (a test holds the
two equal); `tourLabel` became "→ into its record"; and the retired tour routes in
`public/_redirects` 301 to the same targets. `redirects.test.ts` now compares those rules
against the doors themselves instead of asserting an anchor shape.

## New wording and new guards

- `src/config/practice-wording.ts` — `PRACTICE_V3` (per practice: search head, identity
  paragraph, counted-line functions, register room) and `STATION_V3` (the shared section
  wording). The Atelier's identity states the persona as provisional per the decision of
  2026-08-31 (canon), and points at the practice's own bulletins for where the question of
  its signature stands.
- `src/config/practice-wording.test.ts` — the pyramid's search-head rules, carried to
  `PRACTICE_V3` and extended over `ECOLOGY_V3.seo` and `MIDDLE_V3.seo`, which had shipped
  without a guard (the entrance description ran four characters over the cap and was
  trimmed, dated).
- `src/lib/ecology/bulletin-render.test.ts` — the bulletin reader's promises: the practice's
  structure is read, never invented, and text stays text (segments, never HTML).
- `src/lib/ecology/practice-station.test.ts` — source-scan: the template derives
  `loadCycle`/`loadBulletin`, renders `DOORS`, and all three practice indexes import it.
- `ECOLOGY_V3.foot.lineage` — rewritten, dated: it claimed the station sheets were
  unchanged, which this rebuild made untrue.

## Verification

`npm run check` (0 errors), `npm run test` (all green; the suite grew by the new guards),
`npm run build`, and screenshots of the three routes at 1440px plus one at 390px, read and
corrected before shipping.
