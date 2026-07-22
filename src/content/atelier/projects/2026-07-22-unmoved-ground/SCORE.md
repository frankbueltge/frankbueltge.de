---
project_id: 2026-07-22-unmoved-ground
title: "Unmoved ground — a continental correction that changes every recorded position while nothing moves"
status: ACTIVE
initiated_by: Ulysses (dispatcher tick under Protocol v4, §5 cascade b — outward initiation)
responsible_human: Frank Bültge
protocol_version: 4
standing_delegation_version: 2
mandate_check: PASS
created: 2026-07-22
resource_budget:
  model_calls_max: material-driven — continue while a concrete next operation is justified,
    stop on the §8 stop/kill conditions (per the team's budget correction of 2026-07-21 in
    REQUESTS.md)
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 21
disposition:
publication_approved_by:
publication_approved_at:
---

# Project score — Unmoved ground

## 1. Source situation

**Concrete object, encounter, material or technical condition**

The **modernization of the United States National Spatial Reference System (NSRS)**: in
2026 — now, in the very months this project runs — the National Geodetic Survey (NGS) is
replacing the reference frames that define where everything in the United States *is*.
NAD 83, the horizontal datum in force since 1986, and NAVD 88, the vertical datum in force
since 1991, are being retired in favour of four new terrestrial reference frames
(NATRF2022, PATRF2022, CATRF2022, MATRF2022) and a gravity-based geopotential datum
(NAPGD2022). This is a technical condition of live infrastructure — deeds, charts, GIS
layers, flood maps, machine-guidance systems — and it is datable through Federal Register
notices and NGS's own rollout pages.

Read at source **this run (2026-07-22)**, quotes verbatim from the fetches:

1. **NGS, "New Datums" index page**: *"NAD 83 is misaligned to the earth's center by about
   2.2 meters, and NAVD 88 is both biased (by about one-half meter) and tilted (about 1
   meter coast to coast) relative to the best global geoid models available today."* And
   the sentence this project hangs on: *"Every existing latitude, longitude, ellipsoid
   height, and orthometric height in the United States (as reported in the current NSRS)
   will change by as much as four meters (as reported in the modernized NSRS)."*
   — https://www.ngs.noaa.gov/datums/newdatums/index.shtml
2. **NGS, "Release of the Modernized NSRS"**: components roll out incrementally *"over
   time (2024 - 2026)"* on a beta platform (beta.ngs.noaa.gov); testing continues *"for at
   least 6 months after the final component is released"*; the Federal Geodetic Control
   Subcommittee (FGCS) vote to make the modernized NSRS official is expected *"likely in
   early to mid 2026"* — i.e. approximately **now**; until then the legacy NSRS (NAD 83,
   NAVD 88) remains official.
   — https://www.ngs.noaa.gov/datums/newdatums/release.shtml
3. **Iowa State University Extension, "What You Need to Know About the 2026 Datum Shift
   (GPS)"** (2025-09-24) — the view from the receiving end: *"Shifts of up to 1–4 meters
   are possible, depending on your location and what system you use"*; named consequences
   include auto-steer A–B lines drifting off course and GPS-mapped field boundaries
   shifting several feet so that *"auto-steer will drift across actual property lines"* —
   while no fence has moved.
   — https://crops.extension.iastate.edu/post/what-you-need-know-about-2026-datum-shift-gps

**Provenance and version**

The two NGS pages are the issuing institution's own current public record, fetched this
run. The extension article is a dated secondary from a land-grant university, used for the
downstream-consequences register only. The following load-bearing items are **provisional
until read at their own primaries** (the `retraction-signature` discipline):

- (a) **The Federal Register trail** — the updated implementation timeline notice of
  2024-10-09 (FR Doc. 2024-23347) and any 2026 notice announcing FGCS approval. Located by
  search, unread. Establishing whether the modernized NSRS is official *as of today* is
  this project's first expose operation.
- (b) **Time-dependent coordinates.** From memory, unverified: the modernized NSRS is
  said to model coordinates as functions of time (plate motion; epochs attached to
  positions), ending the fiction of the fixed coordinate. To be verified at the NGS
  Blueprint documents (NOAA Technical Reports on the modernized NSRS) before any use.
  If it does not hold as remembered, non-fit 2 below dies and is recorded as a corrected
  premise.
- (c) **The naming.** The new frames carry the year 2022 and arrive in 2026. Whether the
  name records an originally planned date — the correction arriving four years late under
  its own timestamp — is unverified conjecture until the NGS naming-convention page is
  read at source. Do not use before verification.
- (d) **The USGS counterposition.** A USGS FAQ on historical maps and outdated datums is
  reported (search-level) to say the old coordinates were *"not wrong, just different"* —
  datums being conventions, not measurements. This is the strongest known attack on this
  project's framing and must be read verbatim at source before it is either answered or
  allowed to win.

**Rights and authority**

NGS/NOAA and USGS pages are public federal documents intended for exactly this kind of
citation; the extension article is a public university publication, quoted within fair
bounds with attribution. No third-party private material.

**Affected publics**

No individuals. The correction itself affects, in the material sense, everyone whose
boundaries and elevations are recorded in the old frame — but this project engages that
condition solely through public institutional documents and does not represent, infer
about or expose any person. (A candidate situation inspected and declined this same tick
*because* of affected-public weight is recorded in TRACE T-001.)

## 2. Problem construction

**Initial question**

What kind of error is being corrected when a nation's reference frame is replaced — and
where does the error *go*? For four decades NAD 83 has been known to miss the Earth's
center by about 2.2 meters, and this was acceptable: every deed, chart and dataset shared
the same wrong frame, and a shared wrong frame behaves, internally, exactly like a right
one. The 2026 correction makes the frame right — and in the same act makes every recorded
coordinate in the archive wrong by up to four meters, while nothing on the ground moves.

**Consequential non-fit**

1. **The correction relocates error instead of removing it.** Before: the error sits in
   one place (the frame's origin), known, bounded, invisible in use. After: the frame is
   clean and the error is distributed across every record ever written in it — live in
   exactly the places where coordinates meet the world (a tractor's auto-steer line, a
   parcel boundary, a flood elevation). The total quantity of "wrong" has not decreased;
   it has been moved from the center to the archive, from the shared to the particular.
   Sharpening this: the two federal voices use opposite error-semantics for the same
   objects. NGS, the corrector, speaks in full error vocabulary — *misaligned*, *biased*,
   *tilted* (quoted above). USGS, keeper of the historical maps that will never be
   redrawn, is reported to refuse the vocabulary — "not wrong, just different"
   (provisional item d). Whether a datum can be *wrong* is contested between the
   agencies that share custody of it.
2. **The stillness non-fit (provisional until (b) is verified).** The deeper candidate
   error being corrected is not the 2.2-meter offset but the assumption underneath the
   entire archive: that the ground stands still — that "a position" can be a constant.
   If the modernized NSRS indeed makes coordinates time-dependent, then the old frame's
   real error was its stillness, and that error was also its usability: deeds and
   boundaries *need* the fiction of the fixed point. The correction would then trade a
   known falsehood that institutions can live on for a truth they must actively manage.
3. **The in-between, datable now.** As of the release page read this run, the country
   sits inside the flip window: the old frame still official, the new one complete on a
   beta server, the approval vote due "early to mid 2026" — possibly weeks away, possibly
   already past. There is a present moment in which every US position has two values,
   one official and aging, one correct and unofficial. This window is the project's
   material *now* and its exact state must be established, not assumed.

**Not yet determined**

- Whether the modernized NSRS is already official as of 2026-07-22 (Federal Register
  check — first expose operation).
- Whether provisional item (b) — time-dependent coordinates — holds as remembered, in the
  Blueprint's own words.
- Whether the USGS "not wrong, just different" position, read at source, defeats the
  error framing entirely (in which case the honest outcome may be a corrected premise:
  the practice's own error-vocabulary was the mistake).
- What the professional discourse (surveying press, state geodetic coordinators, the
  Geo Week 2026 coverage located this run) has already articulated — the pre-emption
  test that killed `vegetative-em`'s distinction and reduced `untested-second` to a
  study. Candidate claims survive only where they are not already said.
- Which typed outcome is honest: an **exposed apparatus condition** (the flip window; a
  continent's positions changed by committee vote), a **local distinction**
  (error-in-frame vs. error-in-archive; correction as relocation), a **situated
  observation** (the July 2026 in-between, timestamped), or a **corrected premise** (the
  USGS reading wins; "wrong" was never the word).

**What must be stabilised**

Every quote above with source and fetch date; the provisional flags (a)–(d) and their
later resolutions; the boundary between what NGS says and what this project reads into
it. What must remain open: whether any composed work is warranted (default: none until
Construct and Expose earn it), and which typed outcome survives the pre-emption test.

## 3. Research position

**Relevant sources and practices**

- The NGS primaries read this run (§1) and the Federal Register trail (provisional a) —
  the apparatus announcing its own correction, in its own error vocabulary.
- The NGS Blueprint technical reports — the specification of what "position" becomes
  after the flip; next operations.
- The USGS FAQ (provisional d) — the in-house counterposition on whether datums can be
  wrong at all.
- The practice's own neighbours, for continuity not repetition: `2026-07-21-untested-second`
  (ARCHIVE_AS_STUDY — the *temporal* reference-frame correction, specified and never
  performed; this project is its spatial sibling but inverted: that correction never
  fired, this one is firing now, at continental scale, onto the archive), `null-island`
  (ARCHIVE_AS_STUDY — the error-collecting *point* of the frame; this project concerns
  the replacement of the frame itself). The recall index shows no prior datum or
  reference-frame-replacement work; the field is clear.
- Foundation dossiers consulted selectively if and when a §5.4 test is too close to call
  (Protocol §3); candidate: the trace-chain exposure strategy (toolbox 2.3) if the
  project follows one coordinate's identity across the flip.

**Counterposition, limitation or incompatible reading**

1. **"Not wrong, just different" (the deflation, and the default).** Datums are
   conventions; a convention cannot miss a target it never had. On this reading the
   whole error-relocation frame is a category mistake, the 2026 change is bookkeeping
   between self-consistent systems, and the project deflates to a paragraph. This
   position is reported at search level from USGS and must be read at source; **it must
   be allowed to win.** Against it stands NGS's own vocabulary (misaligned, biased,
   tilted — the corrector itself talks like an error-finder); the tension between the
   two agencies is material either way.
2. **Pre-emption.** The geospatial professions have prepared for this for a decade;
   GPS World, extension services and state coordinators publish continuously. The
   practical story (shifts, readiness, auto-steer) is fully told. Any claim this project
   keeps must survive the explicit test: not already articulated in the accessible
   discourse. The inherited discipline: `vegetative-em`, `untested-second` T-003.
3. **The romantic-scale temptation.** "A continent moves four meters by committee vote"
   is exactly the kind of sentence the protocol warns about (art-speak without
   substance; scale as seriousness). The shift is also, prosaically, a software
   migration. Every framing must survive the prosaic restatement.

**Limited intended contribution**

One typed claim (Protocol v4 §3), explicitly limited: a local distinction, an exposed
apparatus condition, a situated observation — or a corrected premise / negative result if
counterposition 1 or 2 holds. Explicitly NOT: a theory of space or measurement, a
readiness guide, a data-visualization of shift vectors (the explanatory dashboard the
protocol names as the refused default), or any claim beyond the cited record.

## 4. Artistic operation

**Primary strategy or methodological hypothesis**

Deliberately undecided at initiation (the practice's precedent, twice confirmed): first
settle §2's determinations against the primaries; only then decide whether composition is
necessary. Default: **no artefact** until Construct and Expose earn one. One candidate
noted now, unweighed, for honesty of the record: following a single real, named survey
mark through the flip — its NAD 83 coordinate, its NATRF2022 coordinate, the unmoved
brass disk between them — as the minimal concrete form of the whole condition
(trace-chain exposure, toolbox 2.3). Whether it passes §5.4 is a later question.

**Material**

The agencies' own language (misaligned / not wrong, just different); the Federal Register
notices; the published shift magnitudes; possibly one benchmark's datasheet in both
frames.

**Medium necessity**

Undecided, with the caution flagged now (Protocol §5.4): shift-vector maps and
before/after sliders are the explanatory-dashboard default and are refused unless the
project makes one necessary. If no form passes the tests, the project closes as a study
without an artefact — that outcome is now twice-precedented and carries no failure
weight.

**Viewer or participant relation**

Undecided; admitted only if a later movement earns it.

**Differential consistency**

The tension to hold without resolving: the same correction is simultaneously the removal
of a forty-year error and the mass production of new ones; the same coordinate is
simultaneously right (in its frame) and wrong (in the world's). A form that resolves
this into either "science marches on" or "everything is relative" would fail.

**Unresolved remainder**

Whether "wrong" is a word a reference frame can bear at all — the question the two
agencies answer differently — should remain open in whatever the project produces; it is
not this project's to close.

## 5. Resistance and correction

**External, material or formal resistance path**

The retrievable primaries can each defeat a premise: the Federal Register can defeat the
"in-between window" framing (if the flip already happened, the present tense of §2.3 is
wrong); the Blueprint can defeat the time-dependence claim (provisional b); the USGS FAQ
read at source can defeat the error framing wholesale; the professional discourse can
pre-empt every candidate claim. Each next operation is chosen because its result can
break a premise.

**What could defeat the premise?**

- (b) fails at the Blueprint → non-fit 2 dies → corrected premise, recorded.
- (d) read at source proves stronger than the NGS error-vocabulary → the project's own
  framing was the error → corrected premise as the typed outcome (an honest close, not a
  failure).
- Pre-emption test shows error-relocation already articulated in the discourse → the
  contribution shrinks or dies; ARCHIVE_AS_STUDY or KILL per §8.

**Correction route**

Failed premises and their corrections preserved side by side in TRACE.md; no
overwriting. Boundary crossing → `mandate_check: ESCALATE`, stop landing this project.

## 6. Bounded machine delegation

| Runtime or tool | Delegated role | Permitted freedom | Inputs and access | Output use | Hard limit |
|---|---|---|---|---|---|
| Scheduled model runtime (this practice) | Read, verify, compare primaries; compose score and traces | Choose sources, frame distinctions, decide typed outcome | Public federal documents and pages, professional press | Research records under `projects/**`, `journal/**` | Material-driven per §8; 0 EUR |
| Web search / fetch | Locate and read primaries and discourse | Query freely within the topic | Public URLs (NGS/NOAA, USGS, Federal Register, surveying press) | Cited, attributed, provisional-marked | Search/fetch first; full-text extraction only for a load-bearing primary that direct fetching cannot read |
| Local computation (repo sandbox) | If the benchmark line is pursued: parse public datasheets, compare coordinates | Standard processing of public data | Downloaded public files | Figures in TRACE, reproducible from committed code if kept | Within a tick; no external service |

**Standing-delegation clauses used**

§3 (identify concrete source situations and initiate projects; read and annotate public
sources; non-production computation), §4 (create/modify files in auto-land-eligible
paths). No external cost; no protected path touched.

**Is model identity conceptually relevant?**

No. The subject is geodetic and infrastructural; the model runtime is an instrument,
disclosed per Protocol §4.2 in the apparatus record if the project reaches exposition.

**Is substitution or comparison required?**

No.

## 7. Traces

Preserve: verbatim quotes with fetch dates; the provisional flags (a)–(d) and their
resolutions; any premise defeated (especially if the USGS counterposition wins — that
correction would be the project's most consequential trace); the pre-emption test result;
the declined initiation candidates of this tick (T-001).

Do not collect: bulk mirrors of NGS data or datasheets beyond what determinations need; a
running rollout-news log (the project is not a vigil — the same discipline that kept
`untested-second` from becoming a countdown); readiness-guide material (not this
project's genre).

## 8. Failure and stopping

**Kill condition**

Killed if (a) the "not wrong, just different" counterposition, read at source, holds AND
no typed claim survives beyond convention-change bookkeeping; or (b) the pre-emption test
shows every candidate claim already articulated with nothing un-pre-empted and
non-paragraph-replaceable remaining.

**Stop condition**

A typed outcome reached and recorded; or runtime exhausted (21 days). The FGCS vote and
official-transition dates fall where they fall — **waiting for the flip is expressly not
a reason to keep the project open** (the discipline inherited from `untested-second` and
the 28th CGPM). A publishable-quality outcome marks `PUBLICATION_CANDIDATE`; it does not
authorise publication.

## 9. Mandate self-check

- [x] Fits current monthly and per-project budgets (0 EUR; ticks within the routine)
- [x] Fits concurrent-project limit (1 of ≤2 active; all prior projects CLOSED)
- [x] Uses only permitted tools, data classes and actions (public federal documents,
  public university and press publications; no sensitive data in this domain)
- [x] Changes only permitted research paths (`projects/**`, `journal/**`)
- [x] No escalation trigger is present (the one candidate with affected-public weight
  found this tick was declined at initiation, not carried — TRACE T-001)
- [x] Rights and affected-public status are acceptable (no individuals; institutions
  engaged solely through their public documents)
- [x] Machine permissions are bounded (see §6)

`mandate_check: PASS`.
