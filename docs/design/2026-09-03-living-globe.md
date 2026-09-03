# Living Globe — one globe over everything this house measures on the earth

**Status:** G0 shipped 2026-09-03 (the ground, the crosswalk, the gates); G1 shipped 2026-09-03 (the room: layers, the day, the receipts); G2 shipped 2026-09-03 (three guided stories, and a focus that moves camera, day and layers); G3 evening 1 of 3 shipped 2026-09-03 (the three country layers, the tessellation check, the antimeridian stitch). The rest of G3, then G4.
**Decision:** Frank's decision of 2026-09-03, wording private.
**Surfaces:** `/globe` · `/werke/globe` · `/globe/layers.json` · `/globe/layers/<id>.json` ·
`/globe/countries.json` (since G3 the country polygons keyed by alpha-3, stitched and rounded ready to
draw, not the raw topology). **Data:** `src/data/globe/`. **Code:** `src/lib/globe/`.
(`/globe/model.json` was retired with G1: the orbital elements the sky's newest frame is propagated
from now ride in that layer's own feed, so nothing read the separate model feed any more.)

## 1. Occasion

The entrance globe of 2026-09-02 draws two records on a sphere: the earth-observation fleet and
one night of the ghost fleet. Meanwhile this house measures dozens of things on the earth every
night — satellites overhead, vessels that switch their transponders off, fourteen readings of the
planet's condition, the world's press counted country by country, the years that press invokes,
the pages institutions quietly removed, hosts by top-level domain, disasters and battles admitted
late into two registers. Each of those is read alone, on its own page, in its own figure. Nothing
anywhere puts them on one earth with one time axis and a receipt behind every mark.

Frank's judgement of 2026-09-03 (wording private): the entrance globe is dull for exactly that
reason, and the interesting object is the one that does not exist yet. Build it as a work of the
lab, comprehensively planned, with a method sheet, a neighbour audit and an entry on
`/experiments`; the entrance keeps a compact version that leads there.

## 2. Hypothesis

**A globe of live data is a genre. A globe of one house's own dated archive, where every mark
carries the committed file and the position inside it, is not.**

Everything worth testing sits in that second half. The value is not that the sphere spins; it is
that a reader can point at a dot, read which file it came from, open that file in the repository,
and recompute the mark. That makes the globe falsifiable in a way a live map is not — and it makes
the honesty rules load-bearing rather than decorative: a country stands at the centroid of its
polygon and says so, an institution's reading stands at the seat that publishes it and says so, a
day the archive does not hold draws nothing and says why.

If the hypothesis is wrong, it will be wrong in one of two ways: either somebody already publishes
a multi-source globe over a committed, recomputable archive with per-mark receipts (see §4), or
nobody looks at it, in which case the receipts were a private virtue.

## 3. Milestones and the kill reading

| Gate | What must stand | When |
|---|---|---|
| G0 | contract, registry, crosswalk, countries, seats, three adapters, the no-JS floor, feeds, the page, the method sheet, the audit | 2026-09-03 ✅ |
| G1 | the island: layers on and off, the time scrubber over the whole archive, cards with receipts, the compact entrance | 2026-09-03 ✅ |
| G2 | guided stories — scripted camera tours on the existing tour engine | 2026-09-03 ✅ |
| G3 | the remaining layers: the press, the invoked years, the removals, the hosts, the registers | evening 1 of 3: 2026-09-03 ✅ |
| G4 | method sheet complete, the projection room, and this document's kill reading filled in | |

**G2, shipped 2026-09-03 — three of six stories, and the three that wait.** `FocusState` gained
three optional fields (a camera, a day of the model, the set of layers to have on), the island
honours them in that order and hands the pointer the last word, and three stories ride on them: **A
night of the ghost fleet** (the longest silence of 2026-08-16, ending on that gap's own card), **The
sky over the reader** (the fleet at this moment, over the house's fixed vantage in Berlin, reading no
location of the visitor) and **The planet's minutes** (a season of nightly readings, from the first
night on file to the newest, ending on the carbon-dioxide mark). The other three the plan named —
**balance**, **consensus** and **redaction** — are **not written and deliberately not stubbed**:
each is about a layer that arrives with G3, a story may only name a registered layer id, and
`globe-stories.test.ts` asserts that those three ids are NOT in the registry today. So the promise
is kept by a test rather than by a note, and the stories will be written when the layers they are
about exist. Details in the decision-log row of 2026-09-03.

**G3, evening 1 of 3 — 2026-09-03.** Three layers whose records name a country rather than a place:
**Balance** as country fills carrying the tone gap `/balance` headlines, **Invoked Past** as points at
the centroids of the countries that invoked the day's most-invoked year, and **Consensus, by domain**
as points at the countries the day's most-echoed phrase was registered in — under the rule that a
top-level domain is a registration and not a location, so a domain with no country in it is counted,
stated in words and drawn nowhere. The tessellation check happened here and came out for the raised
resolution: at deck.gl's default of ten degrees the grid cut leaves notches inside Ghana, Nigeria and
Saudi Arabia; at four they are gone and no chord cuts the sphere, so the pure clip this plan held in
reserve was not written. The seam this plan sent to this evening turned out NOT to be the sea polygon
— the sea is the very colour of the stage behind it and cannot show an artefact at all — but the
land: four rings of the committed Natural Earth land cross the antimeridian as a jump across the
longitude plane, which a globe subdivides into a band around the whole earth. Unwrapping each ring
(and closing the one that encircles a pole through it) removed the line south of the equator, the
three rings at the north pole and the missing south polar cap in one move. Owed to evenings 2 and 3:
the removals (Redaction), the registers (the two disaster and battle registers), and the layers
whose owners have not said yes (Arch's felt blocks, Machine Attention's coordinates — §6).
Decision-log row of 2026-09-03.

**Kill reading — a dated reading, not a feeling.** On **2026-10-15** this document gets a section
written from committed analytics snapshots only, answering three questions: did anyone open
`/globe`; did anyone open a layer (the feeds are separate routes, so a fetch is a fact, not an
inference); did anyone finish a story once G2 has shipped. If no snapshot exists that can answer
them, the reading says **"no reading possible"** in those words rather than reaching for an
impression. Three outcomes, decided in advance:

- **Keep** — the globe is opened and layers are toggled: continue to G3/G4.
- **Rework** — the page is opened and no layer ever is: the layers are the wrong unit; the globe
  becomes a set of scripted views and the toggles go.
- **Archive** — neither: `/globe` is dated and archived like any other experiment of this house,
  the entrance keeps the compact figure, and the layer contract survives as library code, because
  the crosswalk and the seats are worth keeping either way.

## 4. Pre-registered neighbour search (registered before the build, 2026-09-03)

Registered **before** the audit was written, so the verdict cannot be fitted to what was
convenient to find. The candidates, named in advance:

NASA Worldview · Global Fishing Watch map · Windy · MarineTraffic · Flightradar24 · GDELT GeoGlobe
· Google Earth Engine Timelapse · earth.nullschool.net · Our World in Data · The Pudding.

Search terms, registered in advance:

1. "interactive globe multiple live data layers time slider provenance every mark cites source file"
2. "NASA Worldview earth.nullschool Global Fishing Watch map limitations no per-mark citation archive of own measurements"
3. "globe visualisation committed git archive recomputable open data receipts per mark"
4. "multi-source data globe personal archive daily snapshots deck.gl time scrubber"

**Runs performed on 2026-09-03:** terms 1 and 2 were run and their findings are written into
`docs/audits/2026-08-09-usp-audit.md` §20. **Terms 3 and 4 are owed** and must be run before the
verdict is sealed at the end of G4 — the verdict there is marked provisional for exactly that
reason. One finding from run 1 belongs here as well as in the audit: an academic tool named
**Living Globe** already exists (Cardoso et al., arXiv 1607.05946) — a 3D globe over world
demographic data with a time slider. It is a name collision, not a method collision, and it is
named in the audit rather than quietly ignored. Whether the name stays is Frank's call (§7).

## 5. Cost ceiling

Build time only, and no cloud service at all. No GCP step, no model, no GPU, nothing computed when
a visitor opens the page: the plate, the manifest and every feed are produced during the site
build from files already in the repository. The only cost a visitor pays is transfer, and it is
bounded by a test rather than by intention — every layer feed is gzipped inside the suite and
fails over **150 KB gz**; after G3's first evening the six layers measure 37.8 / 38.2 / 16.4 / 38.7 /
2.6 / 4.3 KB gz, and the country polygons a fill is drawn from add 50.7 KB gz, fetched once and only
by a visitor who switches a country layer on. The bundle
ceiling for the island (G1) stays at the measured 320 KB gz of `globe-deck.`, unchanged by G0,
which ships no JavaScript at all.

## 6. What waits for Frank

- **The name.** "Living Globe" collides with an existing academic tool (§4). Keeping it is
  defensible — different field, different method — but it is a naming call, not a build call.
- **The two houses that are asked, not taken.** Arch's felt-block centroids are opt-in after its
  preregistration closes on 2026-09-21; Machine Attention's GDACS coordinates stay upstream until
  its channel answers. Neither is touched by G0 and neither will be drawn without a yes.
- **The entrance.** G1 replaced the entrance island with the compact form of this one, as planned.
  Nothing the hero showed on 2026-09-02 was given up: the fleet is still propagated to the
  visitor's present and still walks its orbits, the gaps still stand in the Field's recorded hue,
  and both layers keep their own colour at full weight, because the emphasis rule is the room's
  arithmetic about ten layers and not a rule against two. The strip still says "positions at your
  now", and it is still exact.

## 7. What this is not

- **Not a live map.** Nothing is fetched at page time. The newest thing on this globe is the
  newest committed file, and on a day the pipelines fail it is a day older — visibly, with the
  date stated.
- **Not a tracker.** The arcs are gaps in a record, drawn as the shortest path between two points.
  The globe never claims to know where a vessel went, and the card says so.
- **Not a country map.** A country's mark is the centroid of its polygon, said in those words. The
  globe holds no claim about anything happening at those coordinates.
- **Not a forecast.** The satellites are drawn only on the day their elements were taken. Nothing
  here is propagated into a day the archive does not hold.
- **Not one more dashboard.** There is no aggregate score, no ranking of countries, no index that
  compresses the layers into a single number. The layers stay separate, because what they measure
  is not commensurable.
