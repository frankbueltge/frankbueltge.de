# Redirect matrix — site-v2

Every route removed on branch `site-v2` (DE mirror + the `/lab` collection page), where it now
points, and how to check it. Rules live in `public/_redirects` (Cloudflare Pages); a static
Vitest test (`src/lib/redirects.test.ts`) checks that every route in the "removed" column below
has a matching entry there, so this table and the actual redirect file can't drift apart
silently.

## German routes (42 pages, `src/pages/de/**` removed entirely)

All but two collapse to the same relative path with the `/de` prefix stripped — one blanket rule
covers them (`/de/* /:splat 301`, `public/_redirects`). The two exceptions are listed first,
ahead of the blanket rule (Cloudflare matches top-down, first rule wins), so they resolve in one
hop instead of chaining through another redirect.

| Removed (`/de/…`) | Target | Status | How it resolves |
|---|---|---|---|
| `/de` | `/` (the hub) | 301, explicit | own rule (bare path isn't covered by `/de/*`) |
| `/de/lab` | `/bestaende` | 301, explicit | own rule — flattened directly, skipping the `/lab → /bestaende` hop |
| `/de/about` | `/about` | 301 | blanket `/de/*` |
| `/de/atelier` | `/atelier` | 301 | blanket `/de/*` |
| `/de/atelier/cockpit` | `/atelier/cockpit` | 301 | blanket `/de/*` |
| `/de/atlas` | `/atlas` | 301 | blanket `/de/*` |
| `/de/beifang` | `/beifang` | 301 | blanket `/de/*` |
| `/de/consensus` | `/consensus` | 301 | blanket `/de/*` |
| `/de/contact` | `/contact` | 301 | blanket `/de/*` |
| `/de/correction` | `/correction` | 301 | blanket `/de/*` |
| `/de/datenschutz` | `/datenschutz` | 301 | blanket `/de/*` (Impressum/Datenschutz content itself is untouched, German, at the root route — see below) |
| `/de/ghost-fleet` | `/ghost-fleet` | 301 | blanket `/de/*` |
| `/de/impressum` | `/impressum` | 301 | blanket `/de/*` |
| `/de/lab/[slug]` (dynamic) | `/lab/[slug]` | 301 | blanket `/de/*` — moot: the `lab` content collection is empty (no `src/content/lab/`), so this route generated 0 static pages on either side |
| `/de/lab/ueberflug-studie` | `/lab/ueberflug-studie` | 301 | blanket `/de/*` — the EN page is real and stays (not a collection duplicate, not touched by the `/lab` → `/bestaende` redirect either) |
| `/de/parallaxe` | `/parallaxe` | 301 | blanket `/de/*` |
| `/de/pattern` | `/pattern` | 301 | blanket `/de/*` |
| `/de/plenum` | `/plenum` | 301 | blanket `/de/*` |
| `/de/praemie` | `/praemie` | 301 | blanket `/de/*` |
| `/de/protokoll` | `/protokoll` | 301 | blanket `/de/*` |
| `/de/protokoll/archiv` | `/protokoll/archiv` | 301 | blanket `/de/*` |
| `/de/protokoll/feed.xml` | `/protokoll/feed.xml` | 301 | blanket `/de/*` |
| `/de/protokoll/[datum]` (dynamic) | `/protokoll/[datum]` | 301 | blanket `/de/*` — every archived day has a real EN page |
| `/de/redaction` | `/redaction` | 301 | blanket `/de/*` |
| `/de/round-number` | `/round-number` | 301 | blanket `/de/*` |
| `/de/spielraum` | `/spielraum` | 301 | blanket `/de/*` |
| `/de/tell` | `/tell` | 301 | blanket `/de/*` |
| `/de/werke` | `/werke` → `/bestaende` | 301, two hops | blanket `/de/*` lands on `/werke`, which itself now redirects to `/bestaende` (see below) — not flattened; not one of the explicitly special-cased routes, so it's honestly left as a chain rather than silently added scope |
| `/de/werke/beifang` … `/de/werke/tell` (9 routes: beifang, consensus, correction, ghost-fleet, parallaxe, pattern, praemie, protokoll, redaction, round-number, spielraum, tell) | `/werke/<name>` | 301 | blanket `/de/*` — every one of these instrument sub-pages stays live in EN |
| `/de/work` | `/work` | 301 | blanket `/de/*` |
| `/de/work/[slug]` (dynamic) | `/work/[slug]` | 301 | blanket `/de/*` |

**Impressum / Datenschutz stay untouched** (legal requirement, German-language, root routes,
work order §6) — only their now-redundant `/de/` mirrors redirect away; the content at
`/impressum` and `/datenschutz` is not modified by this branch.

## `/lab` (decisions doc 2026-07-16 §1.4: "no two collection pages")

| Removed/changed | Target | Status | Note |
|---|---|---|---|
| `/lab` (the collection index) | `/bestaende` | 301, explicit | own rule, listed before any wildcard so it isn't shadowed |
| `/lab/ueberflug-studie` | *(unchanged — stays live)* | 200 | a real, standalone experiment page, not a collection listing; explicitly NOT covered by the `/lab` redirect (that rule has no wildcard, so it only ever matches the bare `/lab` path) |
| `/lab/[slug]` (dynamic) | *(unchanged — route stays, currently empty)* | — | the `lab` content collection has no entries (`src/content/lab/` doesn't exist yet), so this route builds 0 static pages today; nothing to redirect until it has content |
| `/lab/bigquery-dbt` (pre-existing, already-retired post) | `/bestaende` | 301 | pre-existing redirect, retargeted from `/lab` to `/bestaende` to match the collection page's new home |

`src/pages/lab/index.astro` (the file `LabIndex.astro` renders) is left in the repo, unlinked
from navigation and shadowed by the Cloudflare redirect above — the same pattern this repo
already used for `/werke` before this branch (a real file behind an index-only redirect); git is
the archive, nothing needs deleting for the redirect to take effect.

## Pre-existing redirects retargeted (not new routes, just a new final destination)

`/werke` and the already-retired `/halbwertszeit`/`/werke/halbwertszeit` redirects used to point
at `/lab`; since `/lab` itself now redirects onward, these are retargeted straight to
`/bestaende` to avoid adding an extra hop to a chain that already existed:

| Route | Old target | New target |
|---|---|---|
| `/werke` | `/lab` | `/bestaende` |
| `/lab/bigquery-dbt` | `/lab` | `/bestaende` |
| `/halbwertszeit`, `/halbwertszeit/*` | `/werke` | `/bestaende` |
| `/werke/halbwertszeit`, `/werke/halbwertszeit/*` | `/werke` | `/bestaende` |

(`/werke/<instrument>` sub-pages — beifang, consensus, correction, ghost-fleet, parallaxe,
pattern, praemie, protokoll, redaction, round-number, spielraum, tell — are untouched; only the
bare `/werke` index redirects.)

## Testing

`npm run test` runs `src/lib/redirects.test.ts`, which checks the literal list of removed routes
above against `public/_redirects` (either an exact rule or coverage by a `/de/*`-style wildcard).
Manual spot-check after deploy: `curl -I https://frankbueltge.de/de/protokoll` and
`curl -I https://frankbueltge.de/lab` should both return `301` with a `Location` header pointing
at the targets in this table.
