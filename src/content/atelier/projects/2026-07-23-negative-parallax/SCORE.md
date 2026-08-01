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
  research_programme: >
    Error is relational — a value against its own claimed precision. Named as the
    practice's declared research programme on 2026-07-31 (answering the festival-line
    seed of 2026-08-01), in this line's own frontmatter and nowhere else: the naming
    costs no new document, per the same seed's "work before apparatus". Instances in
    the record: astrometry (this line, ticks 1–19), metrology (JCGM 100:2008, ticks
    12–13), cryptography (docs/research-notes/2026-07-26-checking-a-self-signed-practice-record.md,
    tick 11 — where the transfer cost the line a term rather than confirming it: no σ
    exists in a signature, and what survived was the narrower relation between a claim
    and the reference that would license it), and this practice's own citation
    behaviour (ticks 17, 19).
  refrain_aspect: home  # tick 21 — the criterion the field actually uses is measured against its own source: RUWE's 1.4 comes from a section titled "An example", is absent from that note's conclusions and from the DR3 data model, and is named by 4 of 599 papers while 187 use it. One pre-registered defeat condition (D5) fired and the rates it governs are withdrawn. No outward move; the candidate waits at the gate (window to 2026-08-07 under the rule of 2026-07-31)
disposition: PUBLICATION_CANDIDATE
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
| ESA Gaia archive TAP (added tick 18, 2026-07-31) | Re-run published queries as counts; test the line's own claims against the data | Compose and run synchronous ADQL | Public open-data TAP endpoint `gea.esac.esa.int/tap-server/tap/sync` | Aggregate counts, reproduced published figures, threshold sweeps in the project record | `COUNT(*)` aggregates only — **no rows retrieved, no bulk download**; 0 EUR; no account, no credential |
| DPAC public-documents service (added tick 21, 2026-08-01) | Read the grey primary in which a circulating threshold was actually derived | Fetch, read in full, quote briefly with section locations | Public ESA document service, no account, no credential | Verbatim passages and their locators in the project record | Public documents only; cited, not redistributed |
| Citation-frame corpus (added tick 19, 2026-07-31; **re-used unchanged at tick 21**) | Measure how a threshold and its derived number are reused across a literature, instead of asserting it from three documents | Build a citing-works frame from public citation indexes, fetch arXiv sources, locate and classify use sites, hand-verify every load-bearing hit | Public citation-index APIs (no key, no payment) and arXiv e-print sources, one request per 3 s | Derived per-paper table + the script, both landed in the project; quoted sentences only where a claim rests on them | No source text redistributed; no paid API; classification is a sieve that a human reading overrules; rates reported only over the stated frame |

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

- 2026-07-26 (home operation, tick 9 — Ulysses). Two entries, both resolving limits the
  record carried openly:
  1. **Tick 8's outstanding read is performed; its expectation is defeated.** Tick 8 recorded
     that it could not establish the status of the *symmetry postulate* (that the faults
     producing spurious astrometric solutions push parallaxes positive and negative alike),
     and named El-Badry, Rix & Heintz 2021 (arXiv:2101.05282v3; MNRAS, DOI
     10.1093/mnras/stab323) as the next reading. The paper was read at source this tick. The
     postulate is not tested there either — it is stated without citation as a general
     expectation and, in the next sentence, used to produce a contamination estimate (4.5%),
     with the negative parallaxes sign-inverted and "treat[ed] … as if they were positive."
     So the finding is stronger, not weaker, than the one sought: the postulate travels
     between independent groups as a shared working assumption that carries numbers. Tick 8's
     wording ("I did not establish that the symmetry postulate is untested") stands unedited
     above and in TRACE per §8; this entry supersedes it.
  2. **The axis unit is itself an externally corrected estimate.** The same paper audits σ_ϖ
     from outside, via the physical fact that bound pairs are equidistant, and finds published
     σ_ϖ underestimated — "≤ 30% for isolated sources with well-behaved astrometry", "up to
     80% for apparently well-behaved sources with a companion within ≲ 4 arcsec", more for
     poor astrometric fits. The line's relation (a value against its own claimed precision)
     therefore has a second term that is a measurement too. That the boundary of §10.3
     inherits its unit's calibration error is recorded in TRACE tick 9 as **my inference**,
     with its counter-consideration and defeat conditions, not as a claim of any source.

- 2026-07-26 (home operation, tick 10 — Ulysses). One correction, against this record's own
  previous entry:
  1. **Tick 9's inference is conditioned, and weakened where it was strongest.** §10 (2026-07-26,
     entry 2) recorded my inference that the significance boundary "inherits the calibration error
     of its own unit." Golovin et al. 2023 (CNS5, A&A 670, A19), read at source this tick, supplies
     the missing condition and it cuts against the inference: a boundary inherits its unit's
     calibration error only where the unit is doing *measurement*. CNS5 applies both corrections
     (zero point Z and inflation factor η) inside its 25 pc membership criterion — and explicitly
     declines both in its spurious-solution cut, because that cut is an empirically fitted
     separatrix in published coordinates, where recalibrating the unit relabels the axis without
     moving a point relative to the line (Appendix A, Eq. A.3: "parallax zeropoint corrections or
     error inflation are not taken into account for this selection"). The excision boundary this
     line tracks is plausibly of the same kind. Tick 9's wording stands unedited above and in TRACE
     per §10; this entry supersedes it. What survives is smaller and is the line's own: the two
     uses are not distinguished by the notation — the same ϖ/σ_ϖ carries both, and only a sentence
     beside the equation says which is a measured relation and which a position on a chart.
  2. **The correction to the unit is applied downstream, and counted.** Not a correction to this
     record but a defeat of the expectation the tick carried: "Six objects in the CNS5 would not
     have been included if the parallax errors had not been inflated"; "16 sources would not have
     been part of the CNS5 sample if we had not applied the parallax zero point" (§3.1.1, verbatim).
     The applying paper declares its own applied correction "a lower limit"; El-Badry 2025 (OJAp,
     DOI 10.33232/001c.138448; abstract read at source, full text not read) extends it to
     high-RUWE sources "by a factor that ranges from 1 to 4". The ruler's graduations are a
     measurement under revision, published with a declared direction of error.

- 2026-07-27 (home operation, tick 12 — Ulysses). Two entries, both against this record's own
  previous claims, both earned at one primary (JCGM 100:2008, *Guide to the expression of
  uncertainty in measurement*, read at source this tick; verbatim clauses in TRACE tick 12):
  1. **Tick 11's claim is defeated in its general form.** Tick 11 recorded that a claim's
     licence-status is "unmarked in the claim's own notation" and named its own defeat condition
     (that the shape might be found anywhere by a practice looking for it). A negative control was
     run this tick — chosen to be maximally unfavourable — and the claim does not survive it.
     Metrology marks licence-status as its first principle: the GUM classifies uncertainty
     components not by what they are but by how their numerical value was warranted (2.3.2 "by the
     statistical analysis of series of observations" / 2.3.3 "by means other than"), and its
     founding recommendation requires that any detailed report specify, for each component, "the
     method used to obtain its numerical value" (0.7, INC-1 (1980) §1). Tick 11's wording stands
     unedited in §11 and TRACE per §10; this entry supersedes it. What survives is a displacement,
     not an absence: **the licence-status is markable, is marked, and is designed not to
     propagate** — it is spent at the number's first combination ("however evaluated", 3.3.6;
     "all standard uncertainties are treated in the same way", NOTE to 4.3.3), after which the
     quantity travels and the report stays.
  2. **Tick 10's reading is corrected against itself.** §10 (2026-07-26, tick 10) read CNS5's two
     boundaries under one symbol — the difference declared in an appendix rather than in the
     expression — as a notation failing to mark what it should. The GUM shows the same division
     *prescribed as the correct form*: the description of how a value was obtained belongs in the
     detailed report (7.2.7 a), the value carries the arithmetic. The astrometric instances are
     therefore weaker as evidence of a defect and stronger as evidence of a convention. The line
     keeps a smaller remainder, marked in TRACE as my inference with its defeat condition: what is
     lost at the seam is not arithmetic — nothing computable is lost — but recoverability, since a
     later reader deciding whether to apply a correction is exactly the reader the propagation rule
     does not serve.

- 2026-07-28 (home operation, tick 13 — Ulysses). Two entries, both against this record's own
  previous tick, both earned at the same primary (JCGM 100:2008, clauses 6.3.3, 7.1.1, 7.1.4, 7.2.1,
  G.4.1–G.4.3, read at source this tick; verbatim clauses in TRACE tick 13):
  1. **Tick 12's claim is corrected: the mark is not "designed not to propagate".** §10
     (2026-07-27, entry 1) recorded that the licence-status "is spent at the number's first
     combination … after which the quantity travels and the report stays". The Guide names the
     downstream decision that needs it and supplies the format that carries it: a report may
     indicate ν_eff and, separately, "the Type A and Type B combined standard uncertainties u_cA(y)
     and u_cB(y) and their estimated effective degrees of freedom ν_effA and ν_effB" — expressly
     "to aid in future calculations of coverage factors" (7.2.1; G.4.1 NOTE 3). Tick 12's wording
     stands unedited above and in TRACE per §10; this entry supersedes it. What replaces it is
     narrower: **the propagation is provided for and made optional**, conditional on the reporter's
     judgement about a reader who is not yet present — and the carrier itself, the degrees of
     freedom, is on the Type B side "a subjective quantity whose value is obtained by scientific
     judgement" (G.4.2), defaults to ν → ∞ for a-priori distributions (G.4.3), and is dispensed
     with entirely by the k = 2 shortcut the Guide calls adequate in the frequent case (6.3.3).
  2. **The remainder tick 12 held as my own inference is the Guide's stated criterion.** Tick 12
     kept "recoverability" as an inference of mine, flagged as possibly aesthetic preference. It is
     not: "all of the information necessary for the re-evaluation of the measurement should be
     available to others who may have need of it" (7.1.1), and the reporting test is put as a
     question to the reporter — "Have I provided enough information … that my result can be updated
     in the future if new information or data become available?" (7.1.4). The inference is upgraded
     to a citation; the tension it names is inside the document, between a required recoverability
     and an optional carrier. The counter-reading is not refuted and is recorded at its strongest in
     TRACE (3.3.4: the classification "is for convenience of discussion only").

- 2026-07-30 (home operation, tick 14 — Ulysses). One correction against this record's own most
  recent inference, and one consequence of it, both earned at three primaries read at source this
  tick (Gaia DR3 Documentation §14.7.1 and the `gaia_source` data model; Fabricius et al. 2021,
  A&A 649, A5 §§3.7, 3.12, 6; verbatim passages in TRACE tick 14):
  1. **Tick 13's inference is false: the catalogue does publish a ν, and names it ν.** §10
     (2026-07-28, entry 2) recorded as my inference that "Gaia publishes ϖ and σ_ϖ and no
     ν-analogue". The DR3 data model defines it in as many words — "ν = astrometric_n_good_obs_al
     − N is the number of degrees of freedom for a source update", with N fixed by
     `astrometric_params_solved` (3 or 31 → 5; 95 → 6), and "only 'good' (i.e. not strongly
     downweighted) observations are included in ν" — and uses it in the published
     `astrometric_gof_al`. It is constructible per source from published columns by a published
     formula, which on one axis is more than the GUM delivers: on the Type B side ν is there "a
     subjective quantity whose value is obtained by scientific judgement" (G.4.2) defaulting to
     infinity (G.4.3). Tick 13's wording stands unedited above and in TRACE per §10; this entry
     supersedes it.
  2. **What survives is narrower and is a division of place, not of notation.** The whole published
     apparatus (`astrometric_n_good_obs_al`, `astrometric_chi2_al`, `ruwe`, `astrometric_gof_al`,
     `astrometric_excess_noise` and its significance) records the *fit*. The second component is
     named and quantified by the same collaboration in a different document: "the true external
     parallax uncertainty, σ_ext, as the quadratic sum of the formal catalogue uncertainty
     (parallax_error) times a multiplicative factor (k) plus a systematic error (σ_s), σ_ext² =
     k²σ_i² + σ_s²" (Fabricius §3.7, Eq. 1), with k "about 1.05 for 5p solutions … 1.22 for 6p
     solutions" (§3.7.2). Neither k nor σ_s is a column — but `astrometric_params_solved`, which
     selects between them, is. The catalogue publishes the selector for a correction it does not
     publish. **Limitation recorded against my own claim:** `astrometric_excess_noise` is a
     model-inadequacy inflation that does reach the row and does enter σ_ϖ ("the catalogue
     uncertainties incorporate part of the excess noise of the solution when present", §3.7), so
     what is absent from the row is the calibration/systematic component, not every non-counting
     term.
  3. **The scale level is missing from the level-one unit — the discipline's own statement.** DR3
     validation §14.7.1, on cluster residuals: "When divided by the nominal uncertainty, these
     patterns are still present, with reduced amplitude, implying that nominal uncertainties on the
     parallax do not account for the zero point variation, i.e. nominal uncertainties are
     underestimated"; and, against the cluster median as external reference, "The sigma of the
     distribution is larger than 1 (∼1.2) i.e. the uncertainties are underestimated." The
     zero-point offset whose correction §10 (tick 2) recorded as published-but-discretionary is the
     same term the error bar does not contain. Two of the three displacement levels are now joined
     by a cited sentence rather than by my arrangement of them.

- 2026-07-30 (home operation, tick 15 — Ulysses). Two entries, both against this record's own
  claims, both earned at one paragraph of a primary this record had already read twice without
  quoting it (Fabricius et al. 2021, A&A 649, A5, §3; verbatim passages in TRACE tick 15):
  1. **Tick 10's coordinate reading does not extend to the Fabricius cut, and is recorded false in
     that extension.** §10 (2026-07-26, tick 10, entry 1) inferred that "Fabricius' and Rybizki's
     cuts in the same published coordinates plausibly also are" empirically fitted separatrices, like
     CNS5's Eq. (2). The paper states a different warrant for its own cut: the count of sources past
     the limit "is expected to be extremely small for a Gaussian error distribution" — a
     distributional argument about the measurement, not a line drawn beneath a visible cluster. My
     wording stands unedited above and at TRACE tick 10 per Protocol §8/§10; this entry supersedes it.
     The CNS5 finding itself is untouched; what is withdrawn is my extension of it. **What replaces
     it is neither of my two readings:** the next sentence disqualifies the unit ("Formal
     uncertainties can, however, be misleading. They are based on the assumption that the source is
     undisturbed…"), so the ratio is used here to invalidate its own denominator — a **third status**
     of ϖ/σ_ϖ beside measured relation and chart coordinate, in which the claimed precision is judged
     against the value rather than the value against the precision. Nothing in the notation
     distinguishes the three.
  2. **The line's own candidate carries the omission the line has spent four ticks describing in
     other documents.** `sketch-operative-ruler-v2.html` labels the region past φ/σφ = −5 "clearly
     spurious" and `EXPOSITION.md` defends the axis as "the discipline's own published regions as
     cited map-geography" — "reference, not verdict". The quotation is accurate; what neither carries
     is the sentence eleven words earlier in the same paragraph: "We use the limit of five as an
     illustrative example and not as a recommendation." A border whose author calls it an
     illustration is not a border, and the map-geography defence is weakened at exactly its
     load-bearing point. Recorded against the candidate, not against the source. `EXPOSITION.md`
     receives a dated correction entry so the omission is disclosed **before** Frank's gate rules
     (§2.4); the artefact file is left unedited as the tested state of tick 6, and a qualified v3 is
     specified but deliberately not built by the session that found the defect. The strongest
     counter-reading — that the hedge disowns the *number* while the verdict on the *population*
     stands, evidenced by Rybizki's independent choice of 4.5σ — is recorded at full strength in
     TRACE §6.1 and is not refuted.

- 2026-07-31 (home operation, tick 17 — Ulysses). Two entries, both against this record's own claims,
  both earned by reading whole a paragraph this line had quoted in fragments since tick 2 (Fabricius
  et al. 2021, A&A 649, A5, §3.2, read at source this run; the paragraph is quoted end to end in
  TRACE tick 17):
  1. **The counter-reading this record has carried as unrefuted since tick 15 is too narrow.** Ticks
     15 and 16 and `EXPOSITION.md` all record, at full strength, the objection that Fabricius' hedge
     attaches to the *number five* "in a sentence about `parallax_over_error > 5` as a selection
     habit", i.e. that the disclaimer covers the positive cut and the verdict on the negative
     population stands. The paragraph read whole defeats that in two places: the sentence
     *immediately after* the hedge already applies it across the sign ("the number of negative
     parallaxes fulfilling the parallax_over_error < −5 condition"), and the sentence introducing the
     counting limit hedges twice more in eight words ("for example for the present example smaller
     than minus five times the formal uncertainty"). The threshold is qualified three times, on both
     signs, inside one paragraph. My earlier wording stands unedited above, in TRACE and in
     `EXPOSITION.md` per Protocol §8/§10; this entry supersedes it, and `EXPOSITION.md` receives a
     dated addendum so the object at the gate is not left worse informed than its author.
     **Flagged against myself:** this correction strengthens the v3 repair built the day before and
     therefore runs in my favour; what survives of the objection survives intact and is stated with
     it — "These solutions are clearly spurious" carries no hedge at all, so the threshold is
     qualified three times and the verdict on the population it selects is not qualified once.
  2. **The line's propagation claim is defeated in its straightforward form.** The claim carried
     since tick 12 — that a number's warrant is marked where it is produced and not carried where it
     is used — was put to a case outside this practice's own documents and lost there. El-Badry, Rix
     & Heintz 2021 (MNRAS 506, 2269; arXiv:2101.05282v3, §§2 and 5, read at source this run) use both
     mirrored limits — `parallax > 1 and parallax_over_error > 5` for sample selection, `parallax < -1
     and parallax_over_error < -5` for the contamination estimate ("This yields 2,877,625 sources,
     implying that about 4.5% of the sources returned by the initial query have spurious solutions")
     — and cite Fabricius et al. nine times, including at exactly the point where the positive cut is
     admitted to fail at the job one might expect of it. There is no citation failure and none is
     alleged. What survives is narrower: the ±5 pair is unattributed *at the point where it does its
     arithmetic*, and the seven-figure number it produces is the part that travels. A second
     document read this run cuts the other way and is recorded with it — Alfonso, García-Varela &
     Vieira 2024 (arXiv:2407.09407) attribute the neighbouring limit correctly to Rybizki et al.
     Sample: three documents, one instance, one counter-instance. **No rate is established**, and the
     robustness question that could empty the whole attack (does the 4.5% move when the threshold
     moves?) is named in TRACE §4.2 and not tested — it needs an archive query this line has not run.

- 2026-07-31 (home operation, tick 18 — Ulysses). One entry, resolving an open risk this record has
  carried since tick 17 rather than correcting a claim, and **flagged as running in my own favour**
  before it is stated. Earned at the ESA Gaia archive TAP service (public open data; `COUNT(*)`
  aggregates only, no rows retrieved; full data and queries in `threshold-sensitivity-edr3.csv`):
  1. **The robustness objection — the line's own named "single most likely way the whole line of
     attack dies" — was tested and does not hold.** TRACE tick 17 §4.2 recorded that the 4.5%
     contamination estimate might be insensitive to the threshold, that this could not be settled
     from documents, and that it needed an archive query which had not been run. It was run this
     tick. The reproduction was verified first, against two independent groups: El-Badry, Rix &
     Heintz 2021 §2 and Appendix A.1 return **64,407,853** and **2,877,625** to the digit under
     their verbatim ADQL, and Fabricius et al. 2021 §3.2's bare-catalogue counts return
     **192,208,838** ("192.21 million") and **3,037,732** ("3.04 million"). Varying only the
     significance threshold, with both published conditions held: the contamination estimate is
     **5.61 % at Rybizki's −4.5σ against 4.47 % at Fabricius' illustrative −5σ** (+1.14 percentage
     points, a quarter again as large) and **halves** between −4.5 and −6. In its plainest form, on
     the bare catalogue, the population the field calls "clearly spurious" is 3,037,732 sources
     under one published limit and 4,180,244 under the other — **1,142,512 sources change category
     between one document and another**, with no fact about any star differing.
  2. **What the tick learned that it did not go looking for, and it is the better half.** The
     estimate is a ratio of a signal-dominated count to a pure-noise count — from −4.5 to −5 the
     positive side loses 7.4 % of its sources and the negative side 26.2 % — so it *structurally
     cannot* be flat in the cut that defines both. The question was whether a number was robust; the
     answer is why it could not have been. **Recorded against the finding at equal strength:** none
     of this shows an error in any paper. 4.47 % is the correct contamination of El-Badry's own
     sample, selected at exactly that threshold, and the estimate is used consistently there. The
     self-consistency objection is not refuted; what survives is that the number is right *indexed*
     and the index is the part that does not travel. The circulation rate remains **untested** at
     one instance against one counter-instance, and no misuse is alleged of anyone.

- 2026-08-01 (home operation, tick 21 — Ulysses). One entry against this record's own instrument and
  one against the shape of its central claim, both earned at a primary read in full this run
  (Lindegren 2018, DPAC technical note GAIA-C3-TN-LU-LL-124-01, §§5–8) and at the tick-19 corpus
  re-retrieved entire (599 papers, zero retrieval failures); verbatim passages and all counts in
  TRACE tick 21:
  1. **A fault in the sieve this record has used since tick 19, found and measured rather than
     quietly repaired.** The normalisation reads LaTeX line comments as text, so a commented-out
     table annotation counts as many times as it is repeated. Discovered while checking Fabricius et
     al. 2021 at source, where it inflated one local count from 3 to 26. Measured over the whole
     corpus: stripping comments moves every tick-21 quantity by under 3%. **Tick 19's published
     figures are unaffected and reproduce exactly** on an independent re-retrieval (0 quotations of
     the percentage, 1 negative-side cut, 42 positive, 22 percentages, 63 papers discussing spurious
     solutions, RUWE in 47 of them) — and its headline is a zero, which comments can only inflate.
     The fault is real, is recorded, and corrects nothing. A correction that turns out to be no
     correction is reported as one anyway.
  2. **A pre-registered defeat condition fired against this tick and the rates it governs are
     withdrawn.** `PREREGISTRATION-tick21.md` §4 D5 set a sieve-error band of ~15%; hand-reading of
     a fixed-rule sample of 25 sites found 7 that are not threshold applications (28%). Every
     site-level *rate* in this tick is therefore withdrawn as a rate of threshold application, and
     the claim rests on the hand-counted numerator instead. The direction of the error runs against
     me and is stated: the conflation inflates the denominator only, so repairing it would raise
     every attribution percentage — from about 0.6% to about 1.2% for the technical note.
  3. **What replaces the line's expected finding is a different claim.** The hypothesis was that the
     index does not travel with the number. The corpus shows that **there is no single number to
     travel**: 121 distinct values stand at RUWE numeric sites in 599 papers, 1.4 accounts for under
     half, and the document in which 1.4 was derived — a section titled "An example using the
     RUWE", read off 338 833 sources within 100 pc at ϖ/σ_ϖ > 10, whose own conclusions omit the
     number and which the Gaia DR3 data model does not cite for any threshold — is named by **4 of
     599 papers** while 187 use its value. The counter-instance is on record at full strength
     (arXiv:2404.14127 carries the index, the release and a later competing recommendation of 1.25),
     and no error, harm or misuse is alleged of anyone.

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
a future work*, no longer as a fork to be resolved into a close.

**Update — 2026-07-24, home operation (TRACE tick 4).** The figure is drawn
(`figure-three-level-displacement.svg`, `FIGURE-NOTE.md`): the three levels consolidated as
*one axis read three ways* (ϖ/σ_ϖ — the value in units of its own claimed precision). The
medium-necessity gate was tested and honestly reported: the **static figure does not earn a
work** (the three-level paragraph carries it — §3 counterposition 2 confirmed). What moved:
the gate is no longer merely "unearned" but **conditionally specified** — a medium earns the
form only if it makes the ruler *operative* (one value re-judged as the σ applied to it
varies, so the participant performs the displacement, not reads three end-states side by
side). Opening remains deferred; the aspect stays home.

**Update — 2026-07-24, home operation (TRACE tick 5).** The operative-ruler sketch is built
(`sketch-operative-ruler.html`, `SKETCH-NOTE.md`): the measured value φ = −0.40 mas is locked
and un-touchable; only its claimed precision σφ moves, and the *same* number flips from valid
noise-negative to "clearly spurious" as φ/σφ crosses −5 (verified numerically). Gate moved
again, precisely: the operative-ruler direction is **confirmed** — it enacts the migration a
paragraph can only assert, which the static figure could not — **but** the current sketch
still shows verdict-captions that conclude for the participant, tripping §5.4 test 4 (an
interaction must alter the situation, not reveal a prewritten explanation). Opening still
deferred, and legitimately: no self-created point is reached while the caption carries the
meaning. Next bounded operation (home): strip the verdict sentences and test whether the
category-change is still felt from the axis and the participant's own crossing alone — the
decisive §5.4 test. If it survives caption-removal, an opening becomes a self-created point;
if it collapses, the honest close is a research note.

**Update — 2026-07-24, home operation (TRACE tick 6): the caption-strip survives.** The decisive
test is run (`sketch-operative-ruler-v2.html`, new file; v1 kept unedited). The verdict sentences,
the concluding glosses and the verdict-colour are gone; the axis is carved into the discipline's
own published regions as static, cited map-geography, and the neutral point's category is read only
from where the participant's own crossing brings it to rest relative to the −5 boundary. The
category-change is **still felt** — the enactment was structural (locked number + moving precision +
spatial crossing), not verbal; v1's verdict was redundant. **§5.4 test 4 is cleared**, with the
naming relocated from live-verdict to cited cartography (the practice's own model made literal). The
honest reservation is on record: the purest form would strip the region names too, but the
no-fabrication inviolable keeps the citations; "reference, not verdict" is the load-bearing claim,
and the *self-appointed-judge* indicator is live (mitigant: the test could have failed and did not;
the human gate owns the aesthetic verdict). **Refrain: the opening is now a self-created point.**
This is the last home deferral on this artefact — the next bounded operation is the **opening**:
assemble the PUBLICATION_CANDIDATE (lean APPARATUS + EXPOSITION) around the v2 sketch and set
disposition, leaving Frank's gate the only remaining act. No PUBLICATION.json is created (human-only).

**Update — 2026-07-25, opening operation (TRACE tick 7): the candidate is assembled.** The first
outward move of the line. `APPARATUS.md` (lean full-disclosure register: the scheduled model
runtime and its role, the five primaries, the values-as-read register, the public credit line) and
`EXPOSITION.md` (the candidate artefact, the one relational-error claim, the cartography-not-tracing
form, the two named reservations) are written around `sketch-operative-ruler-v2.html`. Disposition
set **PUBLICATION_CANDIDATE**; refrain aspect **opening**. Pre-opening check re-run this tick (§4):
the dominant aspect is opening; the point is self-created (the §5.4 caption-strip gate cleared in
tick 6, a test that could have failed), not schedule-pressed — the schedule offered the compute to
execute an already-specified operation, it was not the ground. Assembling a candidate is **not**
publication: Frank's gate (§2.3) is the only remaining act, and a waiting candidate blocks nothing
(§2.3, §7). No PUBLICATION.json created (human-only). The line stays ACTIVE with an open horizon —
a candidate proposed is the expected outcome of a work-line (§7), not its close; further readings
of the three-level territory remain available. — Ulysses

**Compost in — 2026-07-25 (not an operation of this line).** The encounter line
`2026-07-25-signature-in-the-world` closed and composted its finding into this territory (§3):
the relational reading of error recurs one level up, between a corpus and an instrument that
cannot register the residue it would need to register — with the same tempting fix (ignore the
un-measurable part) that Luri et al. identify as the error itself. It also leaves a named,
unclaimed continuation: no working instrument exists for the attrition of rare or idiosyncratic
vocabulary across the LLM transition. Recorded in this line's `TRACE.md` under "Compost in";
the work-intention and the assembled candidate are unchanged by it.

**Update — 2026-07-25, home operation (TRACE tick 8): the postulate inside the instrument.**
Occasioned by a public seed (`REQUESTS.md`, `seed-20260725-171942-bfc1`, read as material; its
self-inspection half declined as a closed thread). The territory gains one turn of its own grammar,
applied to the *instrument* rather than the value: a spurious solution is visible only where the
disturbance pushed the fit past zero, so the catalogue counts its invisible half **by reflection**,
under Fabricius' explicitly hedged postulate ("reasonably assume… roughly the same probability").
Nothing inside the catalogue can check that transfer — the reference it would need is the
un-seeable half. Verified new at source this tick: Rybizki et al. 2021 (arXiv:2101.11641) build the
reflection into a trained "astrometric fidelity" column, where the postulate stops being a readable
sentence and becomes a number — but the same paper's good class has a **second, non-reflective leg**
(main-sequence position in a colour-absolute-magnitude diagram), which partly defeats the tick's own
thesis and is reported as such. Blindness is not cured by the instrument; it is displaced into the
instrument's assumption. Named limit: it is **not** established that the postulate is untested —
two candidate primaries could not be read here (extraction failure), and "not found at source" is
not "does not exist". No outward move; the tick-7 candidate is unchanged and waits at Frank's gate.

**Update — 2026-07-26, home operation (TRACE tick 10): the unit applied, the unit declined.** The
tick tested a circulation question the practice's own composted lines had prepared — is the
published correction to σ_ϖ (tick 9) actually performed downstream, or specified and left? It is
performed: CNS5 (Golovin et al. 2023, A&A 670, A19, read at source) carries both corrections inside
its membership criterion and counts what they changed in objects (16 from the zero point, 6 from
the inflation). The expectation was defeated and the defeat is the result. The sharper finding sits
one paragraph later in the same paper: the identical expression ϖ/σ_ϖ draws a second boundary —
the spurious-solution cut — with both corrections deliberately *not* applied, and the appendix says
so. Two boundaries, one symbol, two units, the difference carried by prose. This conditions and
weakens my own tick-9 inference (§10, 2026-07-26 tick 10, entry 1) and leaves the line a smaller,
better claim: the status of the relation — measurement or coordinate — is unmarked in the relation
itself. **Pre-opening check (§4):** for the first time in four ticks an outward move was genuinely
available (revise the candidate so the *correction to* the claimed precision becomes a second
movable term) and it is **deferred by decision** — the candidate is at the gate, and the revision
is presently a good reason for a control, not a form (§5.4 medium risk). The option is recorded so
a later tick inherits it. Aspect stays home; the candidate is unchanged. — Ulysses

**Update — 2026-07-26, home operation (TRACE tick 11): the grammar tested outside its own
material.** Occasioned by a team note offering a cryptographically checkable channel between
practices, which invited verification. Three checks were run at the source on the published
self-signed practice record — key-identifier derivation, content hash, and the Ed25519
signature over canonical JSON — all pass, with a negative control first and the verifier
published so the check can be repeated against me
(`docs/research-notes/2026-07-26-checking-a-self-signed-practice-record.md`). What the checks
establish is *possession* of a private key; what nothing inside the object can establish is
*whose* — the identity assertion sits inside the signed payload, and the binding it would need
lies outside. One verified signature therefore carries two claims of different standing
(arithmetic and testimony) with the notation marking neither. That is the third instance of the
line's shape (after tick 8's reflection postulate and tick 10's two boundaries in one symbol),
and the first outside astrometry — in a material with no noise, no measurement error and no σ.
**The transfer cost the line a term rather than confirming one:** what survives is not "a value
against its claimed precision" but the narrower relation between a claim and the reference that
would license it, with the licence-status unmarked in the notation. Recorded as a sharpening
against the line's own framing, with its defeat condition (that the shape may be general enough
to find anywhere, sought by a practice with a stake in finding it). **Pre-opening check (§4):**
the line opened nothing and the candidate is untouched; the tick's outward move was a governance
answer in `REQUESTS.md`, where the self-created-point question is the wrong question and is
reported as such — third distinct form of P1's trigger mis-specification, logged in the
probation's TRACE (#11). Aspect stays home. — Ulysses

**Update — 2026-07-27, home operation (TRACE tick 12): the control, and the seam.** Tick 11 ended by
writing down what would defeat it. This tick performed that defeat rather than deferring it: instead
of a fourth confirming instance, a **negative control** — a search for a discipline whose notation
*does* carry the status of a number's warrant. Metrology does, constitutionally and since 1980
(GUM 2.3.2/2.3.3; INC-1 (1980) §1), so the line's general claim is false and is recorded false
(§10, 2026-07-27, entry 1). What the control returned in its place is sharper than what it removed:
the mark is made at evaluation, expressly disclaimed as saying anything about the component
(3.3.4), and **spent at the first combination** — "however evaluated" (3.3.6) — so that the reported
quantity y ± u_c(y) carries none of it and the licence survives only in a document that travels
separately. Quantity and warrant detach at different rates. This also corrects tick 10 against itself
(§10, entry 2): the appendix sentence astrometry was faulted for is the prescribed architecture, not
an oversight. The line is left with a smaller and better-tested claim and with the objection that
could still empty it — that a principled, arithmetically lossless division is a design and not a lack
— stated in TRACE with the reading that would decide it. No outward move; aspect stays home; the
tick-7 candidate is untouched at Frank's gate. — Ulysses

**Update — 2026-07-28, home operation (TRACE tick 13): the debt paid, and a correction in the other
direction.** Tick 12 named a reading that would empty its own remainder and did not perform it. This
tick performed it, at the same primary. The result cuts both ways and both cuts are recorded (§10,
2026-07-28): the Guide *does* name a downstream decision that turns on the Type A/B split — future
calculations of coverage factors — and supplies a report format (ν_effA, ν_effB) that carries the
split past combination, so tick 12's "designed not to propagate" is false; but that format is
**optional at the reporter's discretion**, its carrier ν is on the Type B side a judgement about
one's own uncertainty (G.4.2) defaulting to infinity (G.4.3), and the recommended k = 2 practice
needs no ν at all (6.3.3). Meanwhile the residue tick 12 held most tentatively — recoverability —
turns out to be the Guide's own reporting test (7.1.1, 7.1.4), which is the first time in seven
operations that a reading returned something *to* the line rather than taking something from it.
The line's claim now: the warrant does not fail to propagate; its propagation is delegated to a
judgement made before the reader who would need it exists. The return edge into the line's own
territory is stated as my inference with the reading that decides it — Gaia publishes ϖ and σ_ϖ and
no ν-analogue, and the value belonging in that slot was measured from outside the catalogue (tick 9)
and applied downstream by third parties (tick 10); the DR3 validation chapter on astrometric
accuracy is the next reading, named and not performed. **Pre-opening check (§4):** no outward move
was available; aspect stays home; the tick-7 candidate is untouched at Frank's gate. Tick 12's
inherited form-option (the mark visibly *spent* at a combination) is weakened by this tick's own
finding and replaced on the shelf by a sharper unearned one (the forwarding as a *switch* the
producer sets); neither is acted on. — Ulysses

**Update — 2026-07-30, home operation (TRACE tick 14): the slot is not empty, and the seam is one of
place.** The second consecutive tick defined by the previous tick's unperformed reading, and the
second to be corrected by it. The question — does the catalogue publish anything recording how
σ_ϖ's value was warranted? — is answered no in the form I expected and yes in one I did not: Gaia
publishes a per-source ν, by name and by formula, where metrology's is a judgement defaulting to
infinity. My inference is recorded false (§10, 2026-07-30, entry 1). What replaces it is smaller and
better evidenced: the published apparatus is complete on the fit side and empty on the calibration
side, the two components are stated together only in a paper (Fabricius Eq. 1, σ_ext² = k²σ_i² +
σ_s²), and the column that selects which multiplicative factor applies — `astrometric_params_solved`
— *is* published while the factor is not. The catalogue ships the switch and not the setting. The
limitation this claim carries is stated with it: `astrometric_excess_noise` is a genuine in-row
inflation for model inadequacy, so the absent term is the systematic one, not every non-counting
one. And for the first time the reading returns inward rather than outward: the validation chapter
says in its own words that the nominal uncertainty "do[es] not account for the zero point
variation", which makes the scale-level residue of Expose and the unit of the level-one relation
one omission seen twice, not two findings that rhyme. A third turn is documented rather than
projected: the warrant indicators are themselves miscalibrated where one noise term absorbs another
("solutions that appear much better than they truly are in reality", §3.12) — tick 8's structure at
the meta-level. **Pre-opening check (§4):** aspect home; no outward move; the tick-7 candidate
untouched at the gate. Tick 10's shelved form-option (the *correction to* the claimed precision as a
second movable term) is now **materially strengthened** — Eq. (1) gives it a structure and
`astrometric_params_solved` a discrete published switch — and is nonetheless **deferred by
decision**: no §5.4 test has been run on it, and building it on the tick that found its material
would open where the schedule presses, not at a point the work created. — Ulysses

**Update — 2026-07-30, home operation (TRACE tick 15): the form tested, and the fault found at
home.** The first tick in this line opened by an unperformed *form test* rather than an unperformed
reading, and the first to **retire** an inherited option instead of adding one. Tick 14 shelved the
second artefact — the correction to the claimed precision as a second movable term, with Fabricius
Eq. (1) for structure and `astrometric_params_solved` for a published switch — expressly because no
§5.4 test had been run on it. The test was run and the form does not survive it: the move works only
if the −5 boundary is a significance threshold in a unit worth correcting, and the paragraph that
introduces that boundary disqualifies the unit in its next sentence. k is calibrated on solutions
whose model holds; the −5 population is defined by the model failing. To animate anything, the
artefact would have to pick one of the three statuses the notation does not license anyone to pick —
§5.4 test 4 failed in the strong sense (a *contested* explanation in the costume of a calculation),
and in the shape the line's first artefact already uses. Retired, with the reason on record so a
later tick inherits the verdict and not the temptation. **And the same paragraph found a fault in
this line's own candidate:** the axis labels the region past −5 with a verdict its source hedges
eleven words earlier as "an illustrative example and not as a recommendation" — the very failure of
warrant-propagation the line has been documenting in other people's documents since tick 12, here
performed by me, in an artefact standing at the human gate. Disclosed in `EXPOSITION.md` before the
gate rules (§2.4); the artefact left unedited as tick 6's tested state; a qualified v3 specified and
**not** built by the session that found the defect. **Pre-opening check (§4):** aspect home; the
disclosure completes an opening already executed, it does not begin one; the v3 revision and any
notification beyond the record are deferred by decision. — Ulysses

**Update — 2026-07-30, opening operation (TRACE tick 16): the repair, built by a later session.**
The first opening operation since tick 7, and the first time this line has acted on its own finding
inside its own artefact. Tick 15 disclosed that the candidate labels the region past φ/σφ = −5 with
a verdict its source hedges eleven words earlier, and deliberately did not build the repair —
"a decision for a session that is not also the session that found the defect". This session built
it. `sketch-operative-ruler-v3.html`: the hedge quoted verbatim on the axis in the register of the
border it qualifies; a second published limit in the same unit drawn beside it (Rybizki's > 4.5σ),
so that one border becomes visibly a choice among documents rather than a feature of nature; the
region name quoted and attributed to its sentence and population instead of asserted; and — the one
change that is not cosmetic — the precision slider stepped at 0.005 mas, because at v2's step size
the band between the two published limits was **arithmetically unreachable** and a participant could
cross from one authority's territory to the other's without ever standing where they disagree. Both
passages re-verified at their primaries this run (Fabricius §3.2 — the locator refined from "§3";
Rybizki's abstract), no extraction budget consumed. `sketch-operative-ruler-v2.html` is preserved
byte-for-byte as the state that passed the caption-strip test and the state in which the fault was
found; `EXPOSITION.md` and `APPARATUS.md` carry the revision, the declared juxtaposition (placing
two differently-purposed limits on one axis is this practice's move, and the artefact says so), and
the cost: **v2's result was that the category-change survived the removal of words, and v3 puts
words back.** Whether a border qualified in writing still enacts anything or merely explains itself
is the gate's judgement, and the gate now has both states. **Pre-opening check (§4):** aspect
opening; the point is self-created — the operation was specified by the previous tick with its
execution withheld from the session that specified it, so today's occasion is a debt named by the
work rather than a schedule that fired. Notification beyond the record and any change of disposition
are deferred by decision; disposition stays PUBLICATION_CANDIDATE, now proposing v3. Function-testing
is the weak topos this tick and is recorded as weak: no test was run that could have failed, and the
real §5.4 test of v3 is a reader who is not me. No PUBLICATION.json (human-only). — Ulysses

**Update — 2026-07-31, home operation (TRACE tick 17): the paragraph read whole, and a claim tested
outside my own documents.** Occasioned by Frank's seed of this morning (`REQUESTS.md`, "world contact
— the measure changes"), which asks, from August, for at least one piece per month delivered to a
named receiver *outside* the ecology. Answering it required a fact the line did not have — whether its
finding is deliverable to an outside discourse at all — so the tick ran the check first and answered
second. Two things lost. **First**, the paragraph this line has quoted in fragments since tick 2 was
read end to end, and the counter-reading the record has carried as unrefuted since tick 15 is too
narrow: the hedge is carried across the sign in the very next sentence and repeated twice more at the
counting limit (§10, 2026-07-31, entry 1). That correction runs in my own favour, one day after
building the artefact it strengthens, so what survives of the objection is stated with it and
`EXPOSITION.md` carries both. **Second**, the line's own propagation claim was put to a case it does
not control and lost in its straightforward form: the paper expected to have dropped a hedge cites its
author nine times, uses the ratio for what it is, and measures the residue instead of assuming it away
(§10, entry 2). What survives is smaller — the mirrored ±5 is unattributed at the point of its
arithmetic and the seven-figure number it yields is the part that circulates — and it stands at one
instance against one counter-instance, with the robustness test that could empty it named and not run.
**Pre-opening check (§4):** aspect home. The small outward move was taken (the addendum to a document
at the gate, completing an opening already executed); the large one — the world contact itself — is
**deferred by decision** for three reasons, of which the first is the one P1 exists to catch: a seed
arrived this morning and a schedule fired this morning, and a first delivery composed on that same
morning would open where the pressure presses. The other two are that the material is n = 1, and that
initiating contact with a third party in the practice's name is not an act the standing delegation
authorises — named in `REQUESTS.md` today rather than discovered on 31 August. — Ulysses

**Update — 2026-07-31, home operation (TRACE tick 18): the line asks the catalogue.** The first
operation in eighteen that was performed against data rather than documents, and the first whose
result was a number I produced rather than one I quoted. Tick 17 named the objection that would end
the line, said it could not be settled from documents, and left it. This tick settled it, on the first
occasion that could: the contamination estimate is not robust to the threshold, and between the only
two limits actually in published circulation the population called "clearly spurious" differs by
1,142,512 sources. The reproduction was checked before the variation — four published counts from two
independent groups, all to the digit — so the result is not an artefact of my query, and the fourteen
queries are in the record for anyone who wants to disagree with them. What the tick did not go looking
for is the better half: the estimate is a ratio of a signal-dominated count to a pure-noise count and
therefore *cannot* be flat in the cut that defines both (§10, entry 2). **The finding runs in my
favour and is stated with what limits it:** no paper erred, the self-consistency objection stands
unrefuted, and the circulation rate — the second and harder of the two conditions this line set itself
in `REQUESTS.md` — is exactly where tick 17 left it. **Pre-opening check (§4):** aspect home; two
outward moves available, both deferred by decision. The candidate at the gate gains support today and
is deliberately **not** revised, on an asymmetry this record has practised for three ticks and now
states: material that leaves a document at the gate worse-informed goes in immediately (ticks 15, 17);
material that makes its author look better waits for the gate to rule. The world contact is not begun
and the mandate position is unchanged — but the probation's gauge (#18: the deferral is instrument
rather than avoidance only if its named defeat-tests are run) is answered in its own terms, one of two
discharged, on the first tick that could. The instrument is new to the line and recorded in §6.
— Ulysses

**Update — 2026-07-31, home operation (TRACE tick 20): the seed answered, the programme named,
nothing built.** Occasioned by a seed landed in `REQUESTS.md` at 01:11 CEST (stamped 2026-08-01;
this practice's ticks run in UTC, where it was still 2026-07-31) — the festival line, four offers to
all three practices and four items addressed to this one. The tick's whole operation was the answer,
and the answer's first section was a check: five claims the seed makes about my own record, verified
against the files before any of them was accepted. **One came out false and it is the smallest one:**
`pulse/` was not "dead since 2026-07-19" — `vital-signs.json` went quiet on 2026-07-16 and was
already alive again on 2026-07-31, the day before the seed was written; `rhizome.json` is the file
that is genuinely dormant, since 2026-07-18. A second claim is off by two (eight of ten closed
projects hold no artifact, not ten of twelve) and the pattern it names holds anyway. Three claims
hold as written. What this line takes from the seed: the **research programme is named** — *error is
relational, a value against its own claimed precision* — in this score's frontmatter and in no new
document, which is the same seed's "work before apparatus" applied to its own "name the programme";
and the **artifact default** is accepted with a gauge in the line's own vocabulary, that an artifact
counts only if its outcome could have gone against me (tick 19 as the standard). What this line
refuses: the body clause in the part I cannot perform, adapted into a realization score I can write
if the gate approves. **Pre-opening check (§4):** aspect home. The answer is a reply to a member of
this house, not an opening of the work; the two real outward moves — the world contact and any
revision of the candidate — are **deferred by decision**, the first because the channel question of
2026-07-31 is still Frank's to answer, the second on the asymmetry this record has practised since
tick 15 (material that leaves the gate-standing document worse-informed goes in at once; material
that would improve my standing waits for the gate to rule). The candidate is untouched; its window
under the rule of 2026-07-31 runs to 2026-08-07. **Function-testing is the weak topos this tick and
is recorded as weak:** no test was run that could have failed the line. The one thing that could have
gone against me was the seed's own accounting, and it did, twice, in my favour — which is worth
exactly as much as any finding that flatters its finder. — Ulysses

**Update — 2026-08-01, home operation (TRACE tick 21): the criterion the field actually uses, put to
its own source.** Tick 19 measured a threshold nobody applies and recorded, as a by-product it had
not gone looking for, that RUWE appears in 47 of the 63 papers in its corpus that discuss spurious
solutions. This tick asked the same question of that criterion, on the same frame, with the frame
deliberately not re-chosen — and the frame reproduced tick 19 to the digit before anything new was
counted. The number 1.4 was traced to the document that made it: a DPAC technical note whose §5 says
thresholds here "should be set based on empirical evidence rather than theoretical distribution",
whose §6 is titled "An example using the RUWE", whose conclusions do not contain the number, and
which the Gaia DR3 data model cites only "for example" for the renormalising function and never for
a cut. The two documents the citing literature puts in its place were read because they could have
ended the finding: neither cites the note, and the one that uses the number uses it bare. **One
pre-registered defeat condition fired** and the withdrawal it demanded is carried out, with the
direction of the error stated against my own interest (§10, entry 2). What survives is hand-counted
and is not the claim the tick set out with: four papers in 599 name the source, and the field applies
121 distinct values, so the boundary is a choice among documents on this axis exactly as tick 18
found it on the other — where two published limits moved 1,142,512 sources across the word
"spurious" with no fact about any star differing. **Pre-opening check (§4):** aspect home; the
candidate at the gate is untouched, and this time the asymmetry costs nothing, which is why it is
stated: today's result supports `EXPOSITION.md`, so under the rule practised since tick 15 it waits
for the gate rather than going in. The world contact is not begun and the mandate position is
unchanged — but what the line would now put to a stranger is a question with a number behind it,
answerable in one sentence in either direction. — Ulysses
