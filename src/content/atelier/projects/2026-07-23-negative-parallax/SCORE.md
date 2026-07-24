---
project_id: 2026-07-23-negative-parallax
title: "Negative parallax — the impossible distance the catalogue is instructed to keep"
status: ACTIVE
kind: work-line
initiated_by: Ulysses (dispatcher tick under Protocol v4, cascade b — outward initiation)
declared_work_line: 2026-07-24 (Ulysses, Protocol v5 §10.1 transition — first work-line)
responsible_human: Frank Bültge
protocol_version: 5
standing_delegation_version: 2
mandate_check: PASS
created: 2026-07-23
work_line:
  work_intention: >
    A work that holds the three-level displacement of error together — that error is
    not lodged in the number but in the relation between a value and its own claimed
    precision — and that shows the same involuntary residue twice re-functionalised
    (as information, via the posterior; as instrument, via the matched-negative
    sample). Direction, not deadline.
  material_territory: >
    The negative-parallax population as documented (not bulk-downloaded); the verbatim
    passages from Luri 2018, Bailer-Jones 2015, Fabricius 2021, Rybizki 2021,
    Lindegren 2021; the 1/ϖ operation; the two-regime boundary (noise-negatives vs
    significance-negatives, drawn in units of the value's own uncertainty).
  horizon: open (months; §6 phase budgets, not a life-timer)
  refrain_aspect: home  # consolidating Expose into a stable territory; opening deferred
disposition:
publication_approved_by:
publication_approved_at:
---

# Project score — Negative parallax

## 1. Source situation

**Concrete object, encounter, material or technical condition**

A specific class of numbers in the world's largest star catalogue: the **negative
parallaxes** in the *Gaia* astrometric data. Parallax (ϖ) is the tiny angular shift of a
star against the background as the Earth orbits the Sun; distance is nominally 1/ϖ. A
*negative* parallax inverts to a **negative distance** — a star "behind" the observer, a
physically meaningless value. These are not rare typos: they are a systematic, expected
population of the catalogue. For faint or distant sources — and for quasars, whose true
parallax is essentially zero — roughly half the measured parallaxes come out negative,
because the measurement noise is comparable to or larger than the true signal.

The consequential technical condition is not the negative value itself but the **instruction
attached to it**. The Gaia team's own guidance paper is explicit that the tempting fix — drop
the impossible values, invert the rest to distances, and call the remainder a "clean" sample
— is *itself the error*, because deleting the negatives biases the result. Verbatim, from the
primary (Luri et al. 2018, §4.2):

> "As discussed in Sect. 3.1, negative parallaxes are a natural result of the Gaia
> measurement process (and of astrometry in general). Since inverting negative parallaxes
> leads to physically meaningless negative distances we are tempted to just get rid of these
> values and form a 'clean' sample. This results in a biased sample, however."

And the worked case it gives (same source, on AllWISE quasars):

> "These objects have a near zero true parallax, and the distribution of its observed values
> shown in the figure corresponds to this, with a mean of −10 μas, close to zero. However, if
> we remove the negative parallaxes from this sample, deeming them 'unphysical', the mean of
> the observed values would be significantly positive, about 0.8 mas. This is completely
> unrealistic for quasars; in removing the negative parallaxes we have significantly biased
> the observed parallax set for these objects."

So the world's astrometry has institutionalised a working method in which an impossible,
uncorrectable-looking value must be **kept exactly as measured** — not inverted, not deleted,
not tidied — because the obvious correction is the actual mistake.

A second, temporal condition stacks on this. *Gaia* stopped acquiring science data on **15
January 2025** and the spacecraft was passivated and retired on **27 March 2025**. The
instrument that produced these numbers no longer exists. The current public catalogue is
**Gaia DR3** (2022); **DR4** is scheduled for **2 December 2026**. DR4 will re-derive the
astrometry from a longer baseline of the *same, now-closed* set of scans — it can sharpen the
existing negatives but cannot add a single new observation. The negative parallaxes in the
catalogue are becoming the fixed residue of a dead instrument.

**Provenance and version**

Verified this run (2026-07-23), one full-text extraction spent on the load-bearing primary:

- **Luri, X., et al. 2018**, "Gaia Data Release 2: Using Gaia parallaxes," *Astronomy &
  Astrophysics* **616**, A9 — full HTML at
  https://www.aanda.org/articles/aa/full_html/2018/08/aa32964-18/aa32964-18.html (arXiv
  preprint 1804.09376). The two block quotes above were read at this source this run, not
  paraphrased from memory. §3.1 (why negatives arise from the linearised least-squares source
  model) and §4.2 (why deletion biases) are the load-bearing sections.
- **ESA / Gaia end-of-observations** — 15 Jan 2025; passivation/retirement 27 Mar 2025:
  https://www.cosmos.esa.int/web/gaia/end-of-observations (facts confirmed via web research
  this run; the ESA page is the primary to read at Expose).
- **Gaia DR4 date** — 2 Dec 2026 (ESA release schedule; to be re-read at the ESA primary at
  Expose).
- Not yet read at source, and therefore provisional wherever used below: **Bailer-Jones,
  C.A.L. 2015**, "Estimating distances from parallaxes," *PASP* **127**, 994 (the
  don't-invert / infer-distance-as-a-Bayesian-posterior argument), and the derived distance
  catalogues (**Bailer-Jones et al.**, "Estimating Distance from Parallaxes IV," *AJ* 2018,
  DOI 10.3847/1538-3881/aacb21, and the EDR3 successor); the **parallax zero-point offset**
  (Lindegren et al.; a *systematic* global shift of order −17 μas) is named as a distinct,
  collective-error layer to be confirmed at source, not stated as a number I have re-read.

**Rights and authority**

Gaia data and its documentation are public (ESA open-data policy; the A&A guidance paper is
open access). Papers and pages are cited, not reproduced beyond short quotation for
commentary. No third-party individual is named or characterised. No sensitive or personal
data of any kind is involved (Protocol v4 §7; Standing Delegation §6).

**Affected publics**

None sensitive. The situation concerns scientific measurement infrastructure and its public
documentation. There is no community-governed, Indigenous or personal material here.

## 2. Problem construction

**Initial question**

What *kind of thing* is a negative parallax — and what is the exact relation between it and
this practice's own method? "Error as method" here meets a discipline that has already built,
and published as an instruction, a method around a value that looks like error: keep the
impossible number, refuse the obvious correction. Is that the same operation this practice
performs, an inverse of it, or a third thing that only shares the word "error"?

**Consequential non-fit**

This practice's method is *error made **disclosed, registered and legible*** — an error
deliberately produced and turned into readable content. Null Island (`2026-07-19`) found a
rival regime that inverted two terms: deliberate error engineered to be **invisible**, a trap
that catches *other* errors by collision. The negative parallax inverts a **different** pair
of terms and is therefore a genuinely new case, not a re-run:

- It is **involuntary**, not deliberate. No one puts a negative parallax into the catalogue on
  purpose; it falls out of an unbiased least-squares fit when noise ≳ signal. Yet —
- it is **load-bearing exactly as it stands**, and the correction is the corruption. The
  practice discloses error to make it legible; astrometry is instructed to **leave the error
  un-disclosed as "error" at all** — to treat the impossible value as a valid measurement and
  never round it toward the physical. Legibility and correction, the practice's two moves, are
  the two things the catalogue's instruction forbids.

So the sharp non-fit: at the level of the datum, negative parallax looks like the practice's
material (error kept, not hidden); at the level of the *instruction*, it is the practice's
opposite (the community insists it is **not** error but a correct measurement, and that the
category "error" is the naive user's mistake). The project exists to decide which level is
telling the truth — and that decision is a real risk to the premise, not a foregone
illustration of it.

**Not yet determined**

- Whether "error as method" even applies, or whether the honest close is a **corrected
  premise**: that a negative parallax is not error at all but a *correct* measurement whose
  1σ interval straddles zero, and that the whole appearance of "error" is an artefact of one
  illegitimate operation (division, ϖ → 1/ϖ) applied where it does not belong.
- The exact figures to be confirmed at source: the fraction of negative parallaxes as a
  function of magnitude/source type in DR3 (not just the DR2 quasar case read this run); the
  zero-point offset value and its own uncertainty; whether Bailer-Jones's framing is
  "don't invert" (ally) or something the project must argue against.
- Which typed outcome (Protocol v4 §3) is honest: a **local distinction** (three species of
  kept error — the practice's disclosed-content error, Null Island's invisible trap, and the
  negative parallax's involuntary-but-necessary residue); an **exposed apparatus condition**
  (the 1/ϖ reflex that manufactures the "impossibility"); a **corrected premise** (it is not
  error); or a **negative result**.

**What must be stabilised**

The verified facts and their sources; the two verbatim quotes; the prohibition on fabricating
any figure (every number sourced or marked provisional). The practice's prohibitions and the
public-authorship model are untouched. Whether a composed work is warranted stays open until
Expose earns it. The temporal layer must **not** be leaned on as an "event" (§8): the
instrument's death is a scheduled end-of-fuel, not self-certified as meaning-making.

## 3. Research position

**Relevant sources and practices**

- **Luri et al. 2018** (primary, read this run): the discipline's own published instruction
  — *how* negatives arise (linearised source model, §3.1) and *why* deletion biases (§4.2).
- **Bailer-Jones 2015 and the derived distance catalogues** (to read at Expose): the
  statistical case that distance is a *posterior to be inferred*, never 1/ϖ; the negatives are
  simply the tail where the likelihood puts weight at ϖ ≤ 0. If this fully holds, it is the
  strongest form of the deflation below.
- **The zero-point offset literature** (Lindegren et al., to confirm at source): a *second,
  collective* not-to-be-naively-corrected value — the whole parallax scale carries a small
  systematic offset that is itself uncertain. A different grammar of "error you must not just
  subtract," useful as contrast, not to be conflated with the per-source negatives.
- **Sentinel-value lineage from Null Island** carried as this practice's own prior finding
  (`2026-07-19-null-island`): there the kept-error was a *rule* (a default). Here it is a
  *residue* (a fit). Naming the link; **not** reopening that project.

**Counterposition, limitation or incompatible reading**

1. **The deflation (default, and strong here).** A negative parallax is not an error; it is a
   perfectly valid measurement of a source whose true parallax is near zero and whose noise is
   larger than the signal. Luri et al. say exactly this ("negative parallaxes are a natural
   result … perfectly valid"). On this reading the practice's whole entry point is a category
   mistake imported from the naive 1/ϖ reflex, and the honest outcome is a *corrected premise*,
   not a demonstration of "error as method." This must be taken seriously enough that it can
   win.
2. **The medium risk (Protocol §5.4).** The obvious form — a scatter of "impossible stars," a
   histogram of the negative tail, an interactive that inverts ϖ to show the meaningless
   negative distance — is precisely the explanatory-dashboard form the protocol warns is *not*
   the default. If nothing but such a chart is available, the non-replaceability test (a
   paragraph would carry it entirely) very likely defeats composition, and the honest close is
   a research note, not a work.
3. **Discipline mismatch.** Astrometry's "keep the value" is a statistical-honesty norm, not an
   aesthetic or epistemic stance about error. Reading it as kin to an artistic method may be a
   projection. Named here so the project cannot quietly assume the kinship it is meant to test.

**Limited intended contribution**

At most one typed claim (Protocol v4 §3), explicitly limited: either a **local distinction**
among species of kept error, or an **exposed apparatus condition** (the 1/ϖ operation as the
manufacturer of "impossibility"), or — if the deflation holds — a **corrected premise** that
what looked like error was a category mistake. Explicitly NOT: a general theory of error, a
claim about astronomy's philosophy, or any new astrophysical result. Scale is not seriousness.

## 4. Artistic operation

**Primary strategy or methodological hypothesis**

Deliberately undecided at initiation, per this practice's recent precedents. Read the primary
methodological sources first (Luri §3.1/§4.2 already in hand; Bailer-Jones; the zero-point
literature; the DR3 fraction-negative figures at the Gaia archive documentation), let them
sharpen or defeat the premise, and only then decide whether any composition is necessary. The
default is **no artefact** until Expose earns one. A candidate toolbox strategy will be
selected and recorded (with its use-condition and failure test per
`docs/foundation/tranche-5-final/10-TOOLBOX-CANDIDATES-V0.3.md`) only if and
when a composition is actually chosen — not pre-committed here.

**Material**

The negative-parallax population itself (as documented, not as bulk-downloaded); the two
Luri passages; the DR3 documentation of the negative fraction; the 1/ϖ operation; the
end-of-mission and DR4-schedule facts.

**Medium necessity**

Undecided, and flagged as the live risk (see counterposition 2). If a work is composed at
all, the medium must do work a paragraph cannot — the mere *display* of impossible values is
explicitly not enough.

**Viewer or participant relation**

Undetermined; only considered if composition is earned. Any interaction must alter the
operative situation, not reveal a prewritten explanation (§5.4 test 4).

**Differential consistency**

If composed, the form would have to hold three things together without collapsing them: the
*datum* (a kept impossible number), the *instruction* (do not correct it), and the *category
dispute* (is it error at all?) — without resolving the dispute into a slogan.

**Unresolved remainder**

Whether the practice's method and astrometry's norm are kin, inverse, or merely homonymous.
That is the project's question, not its assumption.

## 5. Resistance and correction

**External, material or formal resistance path**

Primary sources capable of defeating the premise: Luri et al. §3.1/§4.2 (in hand);
Bailer-Jones 2015 and the distance catalogues; the Gaia archive documentation on the observed
negative fraction by magnitude/type in DR3; the zero-point-offset papers. These are external,
retrievable, and their plain reading can send the project to a corrected premise or a negative
result.

**What could defeat the premise?**

If the discipline's own framing ("valid measurement, not error; the error is only in the naive
1/ϖ") holds without remainder, then "error as method" does not apply and the honest outcome is
a corrected premise — the project reports that it mistook a statistical honesty norm for an
error-method, and says so plainly (this would not be a failure but a typed negative outcome).

**Correction route**

Provisional figures are marked as such and confirmed or withdrawn at the primary in Expose;
any correction is registered in SCORE §10 and TRACE, never silently overwritten (Protocol §10).

## 6. Bounded machine delegation

| Runtime or tool | Delegated role | Permitted freedom | Inputs and access | Output use | Hard limit |
|---|---|---|---|---|---|
| Scheduled model runtime (this dispatcher) | Construct/Expose/Judge the project | Read sources, reason, write records, decide typed outcome within mandate | Public Gaia docs & open-access papers via web research / academic-paper tools | Research records in auto-land paths | ≤5 ticks; 0 EUR; no bulk data download; no publication |
| Web research / WebSearch / WebFetch | Retrieve & verify primary sources | Fetch, quote briefly, cite | Public URLs, arXiv, A&A | Sourced facts & short quotes | Full-text extraction only for load-bearing primaries |
| Academic-paper tool (Arxiv) | Locate methodological papers | Search, read abstracts/full text of cited primaries | arXiv | Citations, methodological grounding | Papers actually cited only |

**Standing-delegation clauses used**

§2 (capacity/budget: 0 EUR, within routine cadence), §3 (identify situations, read/annotate
public sources, auto-land research records), §4 (auto-land paths), §6 (no sensitive personal
data — trivially satisfied).

**Is model identity conceptually relevant?**

No. No claim depends on which model runtime performed the reading; the operation is
source-reading and judgement, not generation whose provenance is the subject.

**Is substitution or comparison required?**

No. No multi-model comparison is part of the wager.

## 7. Traces

Consequential enough to preserve before synthesis: the two verbatim Luri passages and their
section locations; each provisional figure and whether it was confirmed or withdrawn at
source; the decision of which typed outcome is honest and why; any correction to the construct
earned at a primary. These matter because altering them changes the object or the
responsibility relation.

Deliberately not collected: no bulk download of the Gaia catalogue (no data-class need — the
documented population and its instruction are the material, not the rows); no exhaustive
literature census (only sources actually cited); no logging of intermediate search snippets
that bear on nothing.

## 8. Failure and stopping

**Kill condition**

Killed if the deflation (counterposition 1) holds without remainder at the primaries AND no
typed outcome beyond "this is ordinary statistics" survives — i.e. there is neither a
defensible distinction, nor an apparatus condition worth exposing, nor an honest corrected
premise that says anything the discipline has not already said in its own instruction. A kill
is recorded with DECISION.md; it is not silently reinterpreted as a work about failure.

**Stop condition**

Budget exhausted (≤5 ticks / 0 EUR / 21 days) or a typed outcome is reached and recorded
(local distinction / exposed apparatus condition / corrected premise / negative result), and —
only if composition is genuinely earned under the §5.4 tests — a proportionate work register.

## 9. Mandate self-check

- [x] Fits current monthly and per-project budgets (0 EUR; within routine cadence)
- [x] Fits concurrent-project limit (0 ACTIVE projects before this; max 2)
- [x] Uses only permitted tools, data classes and actions (public docs, open-access papers)
- [x] Changes only permitted research paths (`projects/**`, `journal/**`)
- [x] No escalation trigger is present (no rights/consent/personal-data/cost/infrastructure)
- [x] Rights and affected-public status are acceptable (public scientific data; none sensitive)
- [x] Machine permissions are bounded (table above; no publication, no bulk download)

`mandate_check: PASS`.

## 10. Corrections

- 2026-07-24 (Expose, tick 2 — Ulysses). §1/§3 carried three provisionals; resolved at
  primaries this tick (evidence and verbatim passages in TRACE tick 2):
  1. **Bailer-Jones 2015 — confirmed**, and stronger than the construct's "don't-invert
     ally" framing: within the posterior frame negative parallaxes are not merely kept but
     *informative* ("they imply the distance is likely to be large"). Original wording in
     §1/§3 stands as written; the "kept impossible value" phrasing of §2 is now known to
     mislabel the value level (nothing impossible is kept once 1/ϖ is dropped) — retained
     unedited above per Protocol §10, ruled on at Judge.
  2. **Zero-point offset — confirmed** at Lindegren et al. 2021 (A&A 649, A4): quasar
     median ≈ −17 μas, weighted mean ≈ −21 μas; correction explicitly non-definitive, "to
     be used at the researcher's discretion." The provisional "order −17 μas" was accurate.
  3. **"DR3 fraction-negative by magnitude/type" — withdrawn as posed.** No such single
     documented figure is the discipline's own carving. Superseded by the two-regime
     finding (TRACE tick 2): noise-negatives (valid, protected) vs significance-negatives
     (ϖ < −4.5σ / parallax_over_error < −5; 3.04 million in EDR3, "clearly spurious" —
     Fabricius et al. 2021, A&A 649, A5; Rybizki et al. 2021, MNRAS), the boundary drawn in
     units of the value's own claimed uncertainty.

## 11. Work-line declaration (Protocol v5, 2026-07-24)

This project is declared the practice's **first work-line** under the transition clause
(PROTOCOL v5 §10.1). What was, under v4, an ACTIVE project heading toward a single typed
outcome and a probable close, is re-read under v5: its Expose finding is not a verdict to
be filed but a **territory to be built**. The v4 budget clauses (≤5 ticks, 21 days) are
superseded by §6 (phase budgets, renewed at the monthly review); the line is not killed by
a timer. Work-intention, material territory and open horizon are set in the frontmatter.

**Refrain reading (aspect: home).** The line is consolidating, not opening. Expose
(TRACE tick 2) surfaced a stable structure the construct had not seen: error is *displaced
across three levels* — dissolved at the value level (Bailer-Jones: a negative parallax
"does not correspond to a negative distance, because r > 0 by definition"; nothing
impossible is kept once 1/ϖ is dropped), re-erected at the solution level (significance-
negatives excised as "clearly spurious", made the training ground-truth of an error
classifier), and left unresolved at the scale level (the −17/−21 μas zero-point offset,
whose correction the discipline publishes as *discretionary*, declining to institutionalise
it). Across all three, error is never in the number; it is in the relation between the
number and its own claimed precision. And the residue is twice **re-functionalised**: as
information (the posterior reads a noise-negative as "far away, with this error bar") and as
instrument (Fabricius' matched-negative sample measures the invisible spurious fraction
among the plausible positives — the Null-Island move, now documented at a primary, not
projected). That is the territory. It is not yet a work.

**Pre-opening check (P1, adopted §4).** No outward move is made this tick. The dominant
aspect is home; the medium-necessity question (SCORE §3 counterposition 2 — can a paragraph
carry it?) is *not yet earned* and would, if forced now, open where the old pressure
presses (the schedule fired), not at a self-created point. Opening is therefore **deferred**,
by decision, and legitimately (§4). The next operations build the territory; a work is
proposed only when the medium does what a paragraph cannot.

**Five topoi (adopted §5, prose, symmetrical).**
- *Connectivity.* Strong and generative. The line already connects at a primary to
  `2026-07-19-null-island` (kept error re-used as a trap/instrument), to the practice's own
  "error as method", and outward to the measurement-theoretic claim that error is relational,
  not substantival. The material produces further edges rather than terminating.
- *Consistency.* Each of the three displacement levels is anchored at a named, retrievable
  primary with verbatim passages (Luri, Bailer-Jones, Fabricius/Rybizki, Lindegren); every
  provisional figure is resolved or withdrawn (§10). The registers are held apart, not
  flattened.
- *Function-testing.* The premise was genuinely tested and *partly defeated*: "kept
  impossible value" mislabels the value level. Per §2.2 a defeated premise is an event
  inside the work — and here the correction (error is relational) is stronger than the
  premise it replaced. The function-test did its work; the line survived on a remainder, not
  on a save.
- *New-production.* Genuine, not relabeling. The discipline says "keep the negatives"; it
  does not say error migrates value → solution → scale and the residue is twice
  re-functionalised. That framing is the line's own production, not a restatement of Luri's
  instruction.
- *Caution balance.* The live caution is the §5.4 medium risk: a work must earn a form a
  paragraph cannot carry. The stratum is kept — budget 0 EUR, no bulk download, gates
  intact. **Reverse question (symmetry rule):** what does the line lose by closing now? It
  loses the strongest material the practice has yet found on error, at the exact moment the
  remainder surfaced — closing here would repeat the v4 kill-grinding this protocol was
  written to correct. Continuing costs little and forecloses nothing; closing forecloses the
  work.

**Deliberated outcome: continue, build the territory.** The typed-outcome frame (local
distinction / apparatus condition / corrected premise) is retained as *readings available to
a future work*, no longer as a fork to be resolved into a close. Next bounded operation
(home): draw the three-level displacement as a single stable figure and test which
candidate medium, if any, could carry it — the medium-necessity gate, not yet the medium.
