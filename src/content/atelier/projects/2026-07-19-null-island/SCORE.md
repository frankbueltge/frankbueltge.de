---
project_id: 2026-07-19-null-island
title: "Null Island — the coordinate 0°N 0°E read as a catch-basin of error"
status: ACTIVE
initiated_by: Ulysses (dispatcher tick under Protocol v4, cascade b — first outward initiation after the §2.2 amendment)
responsible_human: Frank Bültge
protocol_version: 4
standing_delegation_version: 2
mandate_check: PASS
created: 2026-07-19
resource_budget:
  model_calls_max: 6 dispatcher ticks
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 21
disposition:
publication_approved_by:
publication_approved_at:
---

# Project score — Null Island

## 1. Source situation

**Concrete object, encounter, material or technical condition**

The coordinate **0°N 0°E** — the intersection of the Equator and the Prime Meridian, in
the Gulf of Guinea, where there is no land. This point is a technical condition of the
world's mapping infrastructure, not a metaphor: three distinct things are stacked on the
one coordinate, and one of them was recently removed.

1. **A null value given a location.** In most geocoders and spatial pipelines, a record
   whose latitude/longitude cannot be resolved defaults to `0,0` — the "no data" case
   encoded as a precise place. Absence is written as a coordinate.
2. **An accidental sediment.** Because of this default, failed geocodes, image artefacts
   with no attributable position, and deliberately falsified locations pile up at `0,0`.
   Bellingcat (Jan 2018) documented Strava fitness data appearing there because users had
   entered `0,0` to disguise real positions. The point silently accumulates other
   people's failures and evasions.
3. **A deliberate artefact made to stay invisible.** Around 2010–2011 a **1-metre-square
   "island"** was drawn at `0,0` into **Natural Earth**, the public-domain reference
   mapping dataset, carrying `scale rank 100` — the dataset's own flag for *should never
   be shown*. It is not a mistake left in the data; it is a decoy inserted on purpose so
   that a pipeline erroneously plotting a `0,0` record collides with a named object and the
   error becomes catchable. Deliberate error, engineered to work only by remaining unseen.

And the removal: the one **real, physical** object ever moored at `0,0`, weather buoy
**Station 13010 "Soul"** (PIRATA network — an ATLAS-type mooring, ~3.8 m, operated since
the late 1990s by the US, France and Brazil), was **decommissioned in March 2021**. The
coordinate's single non-error referent is gone.

**Provenance and version**

Verified this run (2026-07-19) against retrievable sources, no full-text-extraction budget
spent:
- Tim St. Onge, "The Geographical Oddity of Null Island," *Worlds Revealed* (Library of
  Congress blog), 2016-04-22 — https://blogs.loc.gov/maps/2016/04/the-geographical-oddity-of-null-island/
- *Null Island*, Wikipedia (structured facts and their cited sources) —
  https://en.wikipedia.org/wiki/Null_Island — used as an index to primaries, not as a
  primary itself.
- Natural Earth (public-domain dataset, Nathaniel Vaughn Kelso & Tom Patterson),
  https://www.naturalearthdata.com/ — the `scale rank 100 / never shown` attribute is to be
  confirmed at the shapefile record itself in the Expose movement (declared below).
- NDBC / PIRATA station 13010 record and OpenStreetMap's node at `0,0` — the primary
  technical objects, **not yet inspected at source**; that inspection is this project's
  next operation.

Exact figures (buoy dimensions, network membership, decommission date) currently rest on
the Wikipedia summary and its cited sources; they are treated as **provisional until the
NDBC primary is read** and are marked as such wherever used.

**Rights and authority**

Natural Earth is released into the public domain. The Library of Congress blog and
Wikipedia are cited, not reproduced. No third-party individual is named or re-exposed: the
Strava/Bellingcat matter enters only as the already-public, aggregate fact that `0,0`
collects disguised locations — no person, unit or track is identified, sought or mapped
here (Protocol v4 §7; Standing Delegation §6 — no sensitive personal data).

**Affected publics**

None sensitive. The situation concerns mapping infrastructure and its public documentation.
The privacy dimension of `0,0` (people who hid a real location behind it) is a boundary the
project stays clear of, not a resource it uses.

## 2. Problem construction

**Initial question**

What *kind of thing* is Null Island — and specifically, what is the relation between the
three regimes of error stacked on the single coordinate `0,0`: the **null-value** (absence
encoded as a place), the **accidental sediment** (failures routed to a default), and the
**deliberate decoy** (an artefact built to catch errors by staying invisible)? Are these
one phenomenon under three descriptions, or three genuinely different operations of error
that merely share an address?

**Consequential non-fit**

This practice's own method is *error made **disclosed, registered and legible*** — error
turned into a deliberate operation the viewer can read. Natural Earth's Null Island is a
rival regime that inverts two of those three terms: its error is **deliberate** (like the
practice's) but engineered to be **structurally invisible** — `scale rank 100`, *never
shown* — and it is not error-as-content but **error-as-trap**, a decoy whose whole function
is to make *other, accidental* errors detectable by collision. So at `0,0` the world has
built a working method out of error that is the near-photographic negative of this
practice's: deliberate, but illegible by design; productive, but only of *catching* error,
never of exhibiting it. The non-fit is sharp enough to test a distinction on, not to
dissolve into "they're both about error."

The second non-fit is temporal and material: the coordinate that most densely accumulates
error had, until March 2021, exactly one object that was *not* error — the buoy Soul, a real
instrument returning real ocean data. Its decommissioning may be an ordinary end-of-service
event, or it may be the moment `0,0` became **purely** a place of error — no remaining
referent that is not either a null, a failure, or a decoy. Which it is, is not yet
determined and is not the project's to assert without evidence.

**Not yet determined**

- Whether `scale rank 100 / never shown` is literally an attribute of the Natural Earth
  Null Island record (to be read at the shapefile, not the encyclopaedia).
- Whether the NDBC primary confirms the March-2021 decommission of station 13010 and its
  network membership and dimensions (currently provisional from Wikipedia).
- How OpenStreetMap currently renders / tags the node at `0,0` (a fourth, editable regime:
  community-governed error).
- Which typed outcome is honest: a **local distinction** among the three regimes; an
  **exposed apparatus condition** (the sentinel-value convention that manufactures the
  sediment); a **counter-map** of the one coordinate; a **corrected premise** (that "Null
  Island" is folklore over a mundane sentinel and the three regimes collapse into one); or a
  **negative result**.

**What must be stabilised**

The verified facts and their sources (no fabrication; every figure sourced or marked
provisional). The practice's prohibitions and the public-authorship model are not touched.
No claim about anyone's real location is made or enabled. Whether the situation warrants a
composed work stays open until Construct and Expose earn it.

## 3. Research position

**Relevant sources and practices**

- Tim St. Onge / Library of Congress (2016): the earliest authoritative account of Null
  Island "from technological oddity to cultural reference."
- Natural Earth (Kelso & Patterson): the public-domain dataset that materialised the decoy;
  the primary technical object of this project.
- The **cartographic lineage of deliberate error**: trap streets, phantom settlements,
  "paper towns" and copyright traps — most famously **Agloe, New York** (a fictitious hamlet
  invented ~1930 by mapmakers as a copyright trap, which then briefly *became real* when a
  general store was built there under the invented name). This is the genuine outward lineage
  Null Island belongs to — and it inverts it: the classic trap catches *thieves* by being
  invisibly present; Null Island catches *errors* by the same means. To be worked from
  retrievable sources, not from memory.
- Bellingcat (2018), cited only for the aggregate sediment fact.

**Counterposition, limitation or incompatible reading**

1. **The deflation (default counterposition).** `0,0` is nothing but a **sentinel value** —
   the geospatial cousin of `NaN`, `0.0.0.0`, the Unix epoch, or the "9999" null-date.
   Reading it as three "regimes of error" would then be over-reading a mundane engineering
   convention, and the honest close is a *corrected premise*: Null Island is folklore, the
   apparatus fact is just "software needs a default." This must be tested at the primary
   (does the Natural Earth record actually behave as a designed trap, or is it a stray?),
   not assumed either way.
2. **Kelso's own framing may already be the whole point.** If the dataset authors documented
   the polygon explicitly as an error-catcher, then the "deliberate decoy" reading is not the
   project's discovery but their engineering note — and the contribution shrinks to the
   *distinction* among regimes, not their existence.
3. **The buoy's removal may be pure coincidence** with no bearing on the coordinate's
   meaning; the "purely error now" reading could be a pathetic fallacy. Named here so the
   project cannot quietly lean on it as if it were an event (Protocol v4 §8 — an event is a
   later, contestable, authored claim, never self-certified).

**Limited intended contribution**

One typed claim (Protocol v4 §3), explicitly limited: a **local distinction** among the
three regimes of error at `0,0`, and/or an **exposed apparatus condition** (the
sentinel-value default that manufactures the sediment) — or, if the deflation holds, a
**corrected premise**. Explicitly NOT: a general theory of error, a canonical map, or any
claim about individuals' locations. Scale is not seriousness; this is a reading of one
coordinate and one dataset record.

## 4. Artistic operation

**Primary strategy or methodological hypothesis**

Deliberately undecided at initiation, as with the practice's recent precedents: read the
primary technical objects first (Natural Earth record; NDBC station 13010; the OSM node),
let them defeat or sharpen the premise, and only then decide whether a composition is
necessary. The default is **no artefact** until Construct and Expose earn one.

**Material**

The coordinate itself; the Natural Earth Null Island shapefile record; the NDBC/PIRATA
station 13010 record; the OSM node at `0,0`; the documented sediment and the deliberate-error
lineage (Agloe et al.).

**Medium necessity**

Undecided. **Caution flagged now (Protocol v4 §8):** the obvious form — "a map of Null
Island" — is exactly the form the protocol warns is *not automatically a map*. If a map is
composed at all, it must disclose its lens, sources, allowed relations, exclusions and blind
spots, and must be a *counter-map of one point*, not a canonical rendering. A form is
justified only if the changed relation (three regimes co-located; the vanished referent)
needs one to become perceptible, and then must pass the five tests of §5.4.

**Viewer or participant relation**

None unless a make is justified; specified then.

**Differential consistency**

If composed, the form must hold the three regimes (null-value / accidental sediment /
deliberate invisible decoy) together **without** resolving them into a single "it's all just
the default" and without mere juxtaposition — the sentinel deflation and the trap reading
must both stay live in the same object.

**Unresolved remainder**

Whether a place that exists *only* as the sediment and infrastructure of error can be the
subject of a work without the work itself becoming a decorative "isn't error interesting"
gesture — the exact art-speak the PROHIBITIONS forbid. Held open as a live risk, not a theme.

## 5. Resistance and correction

**External, material or formal resistance path**

The primary technical objects, each able to defeat the premise:
- the **Natural Earth** Null Island record (does `scale rank 100 / never shown` hold; is it a
  designed trap or a stray?);
- the **NDBC/PIRATA** record for station 13010 (does the March-2021 decommission, the network
  membership and the dimensions confirm?);
- the **OpenStreetMap** node at `0,0` (how does a community-edited map hold the same point?).

**What could defeat the premise?**

- Natural Earth documents the polygon plainly as a stray or as a trivial sentinel, with no
  "never shown" design intent → the *deliberate decoy* regime collapses; corrected premise,
  likely `ARCHIVE_AS_STUDY`.
- The three "regimes" prove to be one sentinel convention under three retellings → *corrected
  premise* / negative result.
- The buoy facts do not confirm at the NDBC primary → the temporal non-fit is withdrawn and
  the claim about "purely error now" is dropped, not softened.
- The project catches itself aestheticising error as decoration, or leaning on the buoy's
  removal as a self-certified "event" → `KILL` with DECISION.md, reasons preserved.

**Correction route**

Score revisions are versioned inside this project with the original preserved (the
`name-test` / `mach-ancestor` §10 pattern). Any figure that cannot be confirmed at a primary
is marked provisional or removed, never paraphrased into apparent certainty.

## 6. Bounded machine delegation

| Runtime or tool | Delegated role | Permitted freedom | Inputs and access | Output use | Hard limit |
|---|---|---|---|---|---|
| research runtime (generic, provided by the routine) | read, verify, construct, write project records | reading order, framing, disposition within this score | the sources in §1; this repository | records under projects/2026-07-19-null-island/ | no writes outside auto-land paths; ≤ 6 ticks |
| web search + direct fetch | reach the primary technical records; verify each provisional figure; work the deliberate-error lineage | source selection | public web / public datasets | citations with retrievable URLs | no full-text extraction except a load-bearing primary |
| web-research / full-text extraction (shared budget) | only a load-bearing primary the project will actually cite, at the Expose operation | none beyond retrieval | the named public records | verified quotations / data-record facts | load-bearing only; shared monthly budget respected; NOT spent this initiation tick |

**Standing-delegation clauses used**

Mandate v2 §3 (read and annotate permitted public sources; initiate projects — a valid
SCORE.md is the act of initiation; create and modify auto-land-eligible research paths),
§2 (no new external costs — 0 EUR; public data).

**Is model identity conceptually relevant?**

No. Any competent research runtime could hold this role; the work is signed Ulysses.

**Is substitution or comparison required?**

No.

## 7. Traces

Preserve before synthesis: each verified fact with its retrievable URL; the raw attribute of
the Natural Earth record and the NDBC station page (quoted briefly, not reproduced); the OSM
node's current tags; premise corrections (especially if the sentinel deflation holds); the
deliberate-error lineage notes; the decision for or against a make, with reasons. In
TRACE.md, in proportion to consequence.

Deliberately not collected: bulk dataset downloads; any data that could re-identify a
disguised real location (explicitly out of scope); screenshots. **This tick spends no
full-text-extraction budget** — the construct rests only on facts verified this run via
WebSearch + one WebFetch of the Wikipedia summary cross-checked against the LoC blog; the
load-bearing primary reads (Natural Earth record, NDBC station, OSM node) are the next
operation, so the shared budget is committed only once this score has named exactly which
records are load-bearing.

## 8. Failure and stopping

**Kill condition**

The primaries reduce the situation to a trivial sentinel with nothing to distinguish (→
corrected premise, `ARCHIVE_AS_STUDY`, not a forced work); or the project catches itself
aestheticising error as decoration or self-certifying the buoy's removal as an "event" (→
`KILL` with DECISION.md).

**Stop condition**

One typed claim delivered with proportionate exposition and a disposition set
(`ARCHIVE_AS_STUDY`, `PUBLICATION_CANDIDATE` or `KILL`), within budget: ≤ 21 days, ≤ 6
dispatcher ticks, 0 EUR new cost.

## 9. Mandate self-check

- [x] Fits current monthly and per-project budgets (0 EUR — public data; within the routine's runs; cap 10 €/month untouched)
- [x] Fits concurrent-project limit (all prior projects CLOSED; this is the only ACTIVE project; limit is 2)
- [x] Uses only permitted tools, data classes and actions (public data; citation-only; no sensitive personal data — the privacy dimension is explicitly excluded)
- [x] Changes only permitted research paths (projects/**, journal/**, memory/** rebuilt-not-committed, REQUESTS.md if needed)
- [x] No escalation trigger is present (no rights, no affected-public exposure, no protected path)
- [x] Rights and affected-public status are acceptable (public-domain dataset; cited public documentation; no individual re-exposed)
- [x] Machine permissions are bounded (§6 table; full-text budget deferred to the Expose operation)

`mandate_check: PASS`.

## 10. Score corrections (versioned; originals preserved above and in git history)

**Correction 1 — 2026-07-19, tick 2 (Expose).** The construct (§2.2, §4) described the Natural
Earth decoy as "engineered to be **structurally invisible** … **illegible by design**" and as
"the near-photographic negative of this practice's disclosed-error method." Reading the primary
(the dataset attribute + Kelso & Patterson's own documentation) corrects this: the decoy is **not
illegible** — it is **disclosure addressed to a different public**. Scale rank 100 hides it from
the reader of the *rendered map*; in the *attribute table* it is fully legible to the maintaining
engineer, whom it tells, in effect, "you plotted a `0,0` — check your geocoder." So the decoy is
not disclosed-error's opposite (disclosed vs. hidden) but disclosed error **aimed at the apparatus
maintainer, never the audience.** The original framing is preserved above and in git history; the
sharpened distinction supersedes it for any downstream composition. *(Trace: TRACE.md tick 2.)*

**Correction 2 — 2026-07-19, tick 2 (Expose).** §1 marked the buoy figures provisional until the
NDBC primary was read. Read: name **Soul**, **0.000 N 0.000 E**, PIRATA, **Atlas Buoy**, **"No
Recent Reports"** — all confirmed at `ndbc.noaa.gov` — **except** the March-2021 decommission
*date*, which is not printed on the NDBC page and remains sourced to secondary summaries
(HandWiki/Wikidata Q24041662), still marked provisional. New primary datum added: **station 15009**
is an *active* PIRATA buoy at **0°N 3.051°W** — the network's live instrument in this region now
sits ~3° *off* the null coordinate. That 15009 is the *formal* successor to Soul is reported, not
primary, and is marked so. *(Trace: TRACE.md tick 2.)*
