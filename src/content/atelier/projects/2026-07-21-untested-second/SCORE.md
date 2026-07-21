---
project_id: 2026-07-21-untested-second
title: "The untested second — a correction specified for fifty-four years, never performed, and scheduled for review before it fires"
status: ACTIVE
initiated_by: Ulysses (dispatcher tick under Protocol v4, §5 cascade b — outward initiation)
responsible_human: Frank Bültge
protocol_version: 4
standing_delegation_version: 2
mandate_check: PASS
created: 2026-07-21
resource_budget:
  model_calls_max: 5 dispatcher ticks
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 21
disposition:
publication_approved_by:
publication_approved_at:
---

# Project score — The untested second

## 1. Source situation

**Concrete object, encounter, material or technical condition**

The **negative leap second**: an error-correction operation of civil time (UTC) that has
existed in specification since the leap-second system began in 1972, and has **never once
been executed**. Every leap second ever applied has been an insertion; the deletion — a
minute of fifty-nine seconds, ending at 23:59:58 — is an operation the world's shared clock
carries as pure specification. This is a technical condition of live infrastructure, not a
metaphor, and it is datable and measurable through the bulletins that govern it.

Three primary documents were read at source **this run (2026-07-21)**:

1. **IERS Bulletin C 72** (Paris, 06 July 2026): *"NO leap second will be introduced at the
   end of December 2026"*; *"from 2017 January 1, 0h UTC, until further notice : UTC-TAI =
   -37 s"*. — https://datacenter.iers.org/data/latestVersion/bulletinC.txt
2. **IERS Bulletin A, Vol. XXXIX No. 029** (16 July 2026): the most recent measured value
   UT1−UTC = **+0.011544 s ± 0.000009 s** at MJD 61237 (2026 July 16); the bulletin's own
   prediction has UT1−UTC **crossing zero to negative values around late September 2026**
   and reaching ≈ **−0.07236 s by mid-2027** (prediction formula: UT1-UTC = −0.0199 −
   0.00011 (MJD − 61245) − (UT2−UT1)); broadcast **DUT1 = 0.0 s since 09 April 2026**.
   — https://datacenter.iers.org/data/latestVersion/bulletinA.txt
3. **CGPM 2022, Resolution 4** (BIPM): the General Conference *"decides that the maximum
   value for the difference (UT1-UTC) will be increased in, or before, 2035"*, with the CIPM
   directed to propose a new maximum ensuring *"the continuity of UTC for at least a
   century"* and to draft a resolution **for the 28th CGPM meeting — which convenes in
   2026**. — https://www.bipm.org/en/cgpm-2022/resolution-4

Around these documents, a live media event (this very week): coverage reports 10 July 2026
as the year's shortest measured day (a rotation ~1.36 ms under 86,400 s) with 22 July and
5 August 2026 predicted nearly as short, framed by headlines about Earth "spinning faster"
and an approaching, unprecedented subtraction of a second (ABC News, space.com, National
Geographic, IFLScience, timeanddate — all located by search this run, **search-level only,
not yet read at their sources**).

**Provenance and version**

The two IERS bulletins and the BIPM resolution are the canonical public record of exactly
this apparatus, fetched from their issuing institutions this run; quotes above are verbatim
from those fetches. The following load-bearing claims are **provisional until read at their
own primaries** (the discipline the `retraction-signature` kill taught):

- (a) The specification of the negative leap second itself — **ITU-R TF.460-6** (the
  recommendation defining positive and negative leap seconds and the 23:59:58 minute-end).
  Not yet read at source; declared as this project's next operation.
- (b) The count "27 leap seconds, all positive, 1972–2016." Partially derivable from
  Bulletin C's UTC−TAI = −37 s given the 1972 initial 10 s offset, but the offset and the
  count are to be confirmed at a primary, not asserted from memory.
- (c) **Agnew (2024)**, *A global timekeeping problem postponed by global warming*, Nature —
  reported as arguing that meltwater redistribution has postponed the projected need for a
  negative leap second by several years. Identified, **unread**; to be read at primary
  before any of its claims are used.
- (d) Reported operational failures during *practiced, positive* leap seconds (e.g. the
  widely reported 2012 and 2017 service outages). From general knowledge only; to be
  verified at retrievable postmortems before any use, or dropped.

**Rights and authority**

IERS bulletins and BIPM resolutions are public institutional documents intended for exactly
this kind of citation. No third-party private material; no licence issue; quotation within
fair bounds with attribution.

**Affected publics**

No individuals. The institutions involved (IERS, BIPM, ITU) are engaged solely through
their public documents. No sensitive data exists in this domain.

## 2. Problem construction

**Initial question**

What kind of thing is a correction that its apparatus has specified for fifty-four years,
performed zero times, demonstrably fears (the practiced direction alone has broken
infrastructure), and is now scheduled to review — possibly retiring it before it ever runs?
And what exactly is the world's rotation doing against that specification *this month*,
when the public narrative (record-short days, imminent subtraction) and the governing
bulletin's own prediction may point in different directions?

**Consequential non-fit**

Two non-fits, stacked on the same object:

1. **The specification/practice non-fit.** UTC's error-correction has two directions. One
   has been performed dozens of times and still causes documented breakage; the other is an
   **untested path in the world's shared clock** — code and procedure that exist everywhere
   (every NTP implementation, every kernel that honours leap flags) and have never run in
   production once, anywhere, in half a century. Meanwhile the CGPM has already decided the
   tolerance that would trigger it will be loosened "in, or before, 2035," with the concrete
   proposal due at the 28th CGPM in 2026: the correction may be **repealed untested** — or
   forced to run exactly once, for the first and last time, before its retirement.
2. **The narrative/arithmetic non-fit (found in this run's own fetches).** This week's
   coverage narrates acceleration: record-short days, the subtraction approaching. But
   Bulletin A's year-ahead prediction walks UT1−UTC *downward* through zero to −0.07 s —
   and on the standard sawtooth convention (positive leap seconds fire as UT1−UTC drifts
   toward the negative bound; a negative leap second would fire near the positive bound),
   downward is the direction of the **practiced** correction, *away* from the untested one.
   **This sign-reading is the practice's own reasoning and is flagged as conjecture until
   verified against the historical EOP series** — but if it holds, the live situation is:
   the media anticipate the untested second while the bulletin's own arithmetic is currently
   retreating from it. Record-breaking *days* and a retreating *annual drift* can coexist
   (seasonal terms vs. secular trend); whether they do here is exactly what the data can
   answer.

**Not yet determined**

- Whether the sign-convention reading above is correct, and what the actual historical
  sawtooth (UT1−UTC since 1972, its closest-ever approach to the untested trigger) looks
  like — resolvable from the retrievable IERS EOP series, not from anyone's summary.
- Whether the post-2020 rotation speedup has peaked (the downward Bulletin A slope suggests
  the mean day is currently *longer* than 86,400 s again) — and whether any institution has
  said so publicly.
- What ITU-R TF.460-6 actually specifies for the negative case, in its own words.
- Which typed outcome is honest: an **exposed apparatus condition** (the untested path of
  civil time; DUT1 = 0.0 as the quiet zero-marker); a **local distinction** (practiced
  correction vs. specified-but-never-performed correction — the dead letter of an error
  regime); a **situated observation** (the narrative/arithmetic divergence of July 2026,
  timestamped); or a **negative result** (it all deflates to routine metrology, fully
  pre-empted by existing coverage).

**What must be stabilised**

Every number and quote above with its source; the conjecture flags (the sign-reading, the
provisional claims (a)–(d)); the prohibition on presenting a prediction as a measurement.
Whether any composed work is warranted stays open until Construct and Expose earn it.

## 3. Research position

**Relevant sources and practices**

- The three primaries read this run (IERS Bulletins C 72 and A Vol. XXXIX No. 029; CGPM
  2022 Resolution 4) — the apparatus speaking in its own registers: announcement, forecast,
  legislation.
- ITU-R TF.460-6 — the specification itself; next operation.
- Agnew (2024), Nature — the strongest known scientific account of the *postponement* of
  the untested second; also evidence that predictions in this domain have a documented
  history of being revised, which disciplines any claim this project builds on Bulletin A's
  forecast. To be read at primary.
- The practice's own neighbours, consulted for continuity not repetition: `null-island`
  (ARCHIVE_AS_STUDY — a sentinel address that *collects* errors; the untested second is a
  different object: an operation that *never fires*), `vegetative-em` (ARCHIVE_AS_STUDY —
  closed because its distinction was pre-empted by its own sources and paragraph-replaceable;
  the explicit pre-emption test below inherits from that close). Foundation dossiers are
  consulted selectively if and when a §5.4 test is too close to call (Protocol §3).

**Counterposition, limitation or incompatible reading**

1. **The deflation (default).** This is routine metrology plus a slow standards process;
   "never executed" is trivially explained (Earth spent five decades slowing, so only
   insertions were needed), and the whole situation is a paragraph, not a project. The
   timeanddate/leap-second-watch genre and Agnew's paper may already say everything sayable
   — in which case the honest close is a negative result or a thin archive, exactly as with
   `vegetative-em`.
2. **The repeal reading may be backwards.** CGPM Resolution 4 raises a *tolerance*; it does
   not abolish the UT1–UTC relation. Framing it as "the correction dies untested" could be
   the project romanticising a bounded engineering decision. The resolution's actual words —
   continuity of UTC "for at least a century" — must be allowed to defeat the elegiac frame.
3. **The prediction is not the world.** Bulletin A's year-ahead UT1−UTC is a model output
   with real error bars, in a domain whose decade-scale predictions have publicly shifted
   (the reported Agnew postponement). Any claim built on "crossing zero in late September
   2026" is a claim about a forecast, and must be typed as such.

**Limited intended contribution**

One typed claim (Protocol v4 §3), explicitly limited: an exposed apparatus condition, a
local distinction, a situated observation — or a corrected premise / negative result if the
counterpositions hold. Explicitly NOT: a theory of time, a countdown product, a prediction
of when (or whether) the negative leap second occurs, or any claim beyond what the cited
record supports. Scale is not seriousness.

## 4. Artistic operation

**Primary strategy or methodological hypothesis**

Deliberately undecided at initiation (the practice's precedent): first settle the
determinations in §2 against the real data and the specification text; only then decide
whether a composition is necessary. Default: **no artefact** until Construct and Expose
earn one.

**Material**

The bulletins (their language as much as their numbers: "NO leap second," "until further
notice," DUT1 = 0.0); the EOP data series; the TF.460 specification of the never-run
minute; the resolution text scheduling the review.

**Medium necessity**

Undecided, with the caution flagged now (Protocol §5.4): the obvious forms — a countdown
clock, a live UT1−UTC dial, an explanatory timeline — are exactly the explanatory dashboard
the protocol warns against, and a "clock" work about clocks is the kind of literal-minded
default that must be refused unless the project makes it necessary. If no form passes the
§5.4 tests, the project closes as a study without an artefact.

**Viewer or participant relation**

Undecided; admitted only if a later movement earns it.

**Differential consistency**

The tension to hold without resolving: an operation can be entirely real (specified,
implemented, feared, budgeted for) and entirely unperformed at once — and the same week can
honestly produce both "shortest day ever measured" and a forecast drifting away from the
subtraction. A form that resolved either tension into a single story ("it's coming!" /
"it's nothing") would fail.

**Unresolved remainder**

Whether the untested second ever fires is genuinely undetermined — by anyone. That
undecidedness is the remainder; the project must not close it rhetorically.

## 5. Resistance and correction

**External, material or formal resistance path**

The retrievable data and specification texts themselves: the IERS EOP series can defeat the
sign-reading and the divergence observation; TF.460-6 can defeat the "pure specification"
framing (perhaps the negative case is specified more contingently than assumed); Agnew
(2024) can defeat any reliance on the forecast; the CGPM 28 documents can defeat the repeal
frame. Each next operation is chosen because its result can break a premise.

**What could defeat the premise?**

- The sign-convention reading is wrong → the narrative/arithmetic non-fit evaporates →
  corrected premise, recorded as such.
- The existing public literature (Agnew; the leap-second commentariat) already articulates
  the practiced/unpracticed asymmetry as a named observation → pre-emption → the
  contribution shrinks or dies (the `vegetative-em` close, applied honestly).
- TF.460-6 turns out to make the negative leap second something other than a standing
  mandate (e.g. purely permissive language) → the "correction the apparatus requires but
  has never performed" frame must be corrected to the specification's actual modality.

**Correction route**

Failed premises and their corrections preserved side by side in TRACE.md; no overwriting.
Boundary crossing → `mandate_check: ESCALATE`, stop landing this project.

## 6. Bounded machine delegation

| Runtime or tool | Delegated role | Permitted freedom | Inputs and access | Output use | Hard limit |
|---|---|---|---|---|---|
| Scheduled model runtime (this practice) | Read, verify, compute against public data, compose score and traces | Choose sources, frame distinctions, decide typed outcome | Public bulletins, EOP data files, specification texts | Research records under `projects/**`, `journal/**` | ≤5 dispatcher ticks; 0 EUR |
| Web search / fetch | Locate and read primaries and coverage | Query freely within the topic | Public URLs (IERS, BIPM, ITU, journals, press) | Cited, attributed, provisional-marked | Search/fetch first; full-text extraction only for a load-bearing primary (likely: Agnew 2024, if paywalled routes fail) |
| Local computation (repo sandbox) | Parse/plot the EOP series to answer §2's determinations | Standard numeric processing of the public data files | Downloaded IERS data | Figures/numbers in TRACE, reproducible from committed code if kept | Within a tick; no external service |

**Standing-delegation clauses used**

§3 (identify concrete source situations and initiate projects; read and annotate public
sources; run non-production computation), §4 (create/modify files in auto-land-eligible
paths). No external cost; no protected path touched.

**Is model identity conceptually relevant?**

No. The subject is metrological and infrastructural; the model runtime is an instrument
here, disclosed per Protocol §4.2 in the apparatus record if the project reaches
exposition.

**Is substitution or comparison required?**

No.

## 7. Traces

Preserve: the verbatim bulletin/resolution quotes with fetch dates; the conjecture flags
and their later resolutions; any premise defeated (especially the sign-reading, whichever
way it falls); the pre-emption test result against existing coverage.

Do not collect: bulk mirrors of IERS data beyond what the determinations need; a running
"countdown" log (the project is not a vigil); coverage clippings beyond the few needed to
establish the narrative side of the non-fit.

## 8. Failure and stopping

**Kill condition**

Killed if (a) the sign-reading is corrected AND the remaining material supports no typed
claim beyond "standards processes are slow" (deflation complete); or (b) the pre-emption
test shows every candidate claim already articulated in the public record with nothing
un-pre-empted and non-paragraph-replaceable remaining.

**Stop condition**

Budget exhausted (≤5 ticks / 0 EUR / 21 days — note: the 28th CGPM's decision falls outside
this window and is expressly NOT a reason to keep the project open waiting), or a typed
outcome reached and recorded. A publishable-quality outcome marks `PUBLICATION_CANDIDATE`;
it does not authorise publication.

## 9. Mandate self-check

- [x] Fits current monthly and per-project budgets (0 EUR; ticks within the routine)
- [x] Fits concurrent-project limit (1 of ≤2 active; all prior projects CLOSED)
- [x] Uses only permitted tools, data classes and actions (public institutional documents
  and data; no sensitive data exists in this domain)
- [x] Changes only permitted research paths (`projects/**`, `journal/**`)
- [x] No escalation trigger is present
- [x] Rights and affected-public status are acceptable (no individuals; public documents of
  public institutions)
- [x] Machine permissions are bounded (see §6)

`mandate_check: PASS`.
