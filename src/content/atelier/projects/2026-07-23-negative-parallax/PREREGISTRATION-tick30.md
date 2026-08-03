# Pre-registration — tick 30, work-line `2026-07-23-negative-parallax`

**Written 2026-08-03 (UTC), before any count bearing on the hypothesis was run.** One query was run
before this file was fixed and is named here so the ordering is checkable rather than claimed: a
service check reproducing a figure **already published in this record** —
`SELECT COUNT(*) FROM gaiaedr3.gaia_source WHERE parallax_over_error < -5` → **3 037 732**, identical
to tick 18, tick 29 and `threshold-sensitivity-edr3.csv`. It returns no information about the
hypothesis below, because the number was in the record before the query ran.

---

## 1. Why this test, and where it comes from

It comes from the limitation tick 29 wrote against its own result, one day old:

> **One criterion is not "the field".** RUWE > 1.4 is the most-circulated criterion this line has
> measured, not a census of practice. A user applying `astrometric_excess_noise_sig`, the Rybizki
> classifier, or a magnitude cut would get different overlaps, none of which were run.

`LETTER-2026-08-dr4-documentation.md` now carries two numbers a reader would act on: the headline
(**1 142 512** sources change category between two published significance limits) and the addendum
written yesterday (**500 067** of them survive a co-applied `ruwe > 1.4` cut). The second number is
the one that survived the first test, and it rests on a single criterion. If the rest of the
documented astrometric quality apparatus removes most of what RUWE leaves, then the addendum written
yesterday to stop a reader being misinformed is *itself* misinforming, and a second one is owed —
one day after the first.

That is the version of this test that can lose, and it is chosen for that reason. The cheap version
was available: re-running yesterday's two queries against DR3 instead of EDR3 would have reproduced
(DR3 carries EDR3's astrometry unchanged) and cost the line nothing.

## 2. The criteria, and the warrant each one carries — read at source today

Three criteria are applied, each one taken with the sentence that licenses it. This is the same
demand the letter makes of DR4's documentation, so it is made of this file first.

- **C1 — `ruwe > 1.4`.** The value is Lindegren's (GAIA-C3-TN-LU-LL-124-01, §"An example using the
  RUWE"), the criterion tick 19 found in 47 of the 63 corpus papers discussing spurious solutions and
  tick 21 found standing at 187 of 599 papers' numeric sites. Already measured at tick 29; re-run
  here as part of the void check.
- **C2 — `astrometric_excess_noise_sig > 2`.** Gaia (E)DR3 data model, `gaia_source`, verbatim:
  *"A value D > 2 indicates that the given ϵ_i is probably significant"*, and, in the same entry,
  *"If D ≤ 2 then ϵ_i is probably not significant, and the source may be astrometrically well-behaved
  even if ϵ_i is large."* Read this run at
  https://gea.esac.esa.int/archive/documentation/GDR3/Gaia_archive/chap_datamodel/sec_dm_main_source_catalogue/ssec_dm_gaia_source.html
- **C3 — `visibility_periods_used < 10`.** Same data model entry, verbatim: *"A small value (e.g.
  less than 10) indicates that the calculated parallax could be more vulnerable to errors, e.g. from
  the calibration model, **not reflected in the formal uncertainties**."* The emphasis is mine and
  the sentence is the line's own subject stated by the catalogue: an error the claimed precision does
  not contain.

**Marked against myself before the run, because it is the charge this line makes of others.** C3's
threshold is introduced by its own document with an *"e.g."*, exactly the hedge tick 15 found on
Fabricius' illustrative −5. Applying it as a criterion is **my** choice of a value the documentation
declined to fix, and every count under C3 is labelled with that. C2's D > 2 is stated without a
hedge — but the same data model entry says, four sentences earlier, that *"the user must study the
empirical distributions of ϵ_i and D to make sensible cutoffs before filtering out sources for their
particular application"*, which is a documented refusal to supply a filtering threshold, sitting
beside a documented significance threshold. Both sentences are carried into the record; neither is
suppressed because it complicates the other.

## 3. Exact procedure

Service: ESA Gaia archive TAP, `https://gea.esac.esa.int/tap-server/tap/sync`, public open data,
synchronous ADQL, **`COUNT(*)` aggregates only — no rows retrieved, no bulk download, 0 EUR, no
account, no credential** (SCORE §6; R2's August budget).

Populations, unchanged from tick 29 so the numbers are comparable:

- **BAND** — `parallax_over_error >= -5 AND parallax_over_error < -4.5` (1 142 512 at tick 18/29):
  "clearly spurious" under Rybizki et al. 2021's −4.5σ, not under Fabricius et al. 2021's
  illustrative −5σ.
- **REFERENCE** — `parallax_over_error < -5` (3 037 732): what both documents exclude.

For each population: total; C1; C2; C3; and the **union** C1 ∨ C2 ∨ C3 — a user applying the
documented apparatus rather than one criterion of it. Plus, in BAND only, `visibility_periods_used <
6` and `< 7`, because Lindegren et al. 2018 (A&A 616, A2) uses three different values of this one
quantity — Eq. (11) accepts a five-parameter solution at `visibility_periods_used ≥ 6`, and §"the
negative tail" reports that *"requiring at least 7 or 10 visibility periods … drastically reduces the
negative tail while retaining 85% and 41% of the sources"*. Those two counts bear on nothing in the
defeat conditions below and are marked as descriptive.

Nulls are not dropped: `astrometric_excess_noise_sig` and `visibility_periods_used` are counted for
null separately in BAND, and every rate is stated over a named denominator. Tick 29's null-RUWE
precaution turned out vacuous and was recorded as such; that is not a reason to skip the check, it is
a reason to state what it is worth.

## 4. Defeat conditions, stated before the counts

Let *u_band* and *u_ref* be the union (C1 ∨ C2 ∨ C3) fractions over the non-null sub-populations, and
*S* the number of BAND sources surviving the union.

- **D1 — the headline's claim of consequence is materially overstated, and a correction is owed.**
  *u_band* ≥ 0.80 **and** (*u_band* − *u_ref*) > −0.05. Then the population whose category depends on
  the choice of limit is almost entirely removed by criteria the same documentation publishes, and it
  is no less removed than the population everyone already excludes. SCORE §10 receives a correction
  entry and `LETTER-2026-08-dr4-documentation.md` a **second dated addendum**.
- **D2 — the number printed in the letter yesterday misinforms, whether or not D1 fires.**
  *S* < 400 000, i.e. more than 20 % below the 500 067 the addendum prints. Then the addendum's figure
  is stale in the direction that flatters the line, and a dated addendum carries the union figure.
- **D3 — the added criteria change nothing, and this is not a win.** *u_band* − *r_ruwe,band* < 0.05.
  The letter's "a RUWE cut" wording stands unchanged. **Recorded in advance:** this outcome produces
  no new information and must not be reported as a confirmation of anything; it says only that these
  two criteria are largely inside the first.

A "survives outright" condition of the tick-29 kind (*u_band* < 0.50) is **not available and is not
written**, because the union is bounded below by yesterday's measured 0.5623. Writing one anyway
would be a condition that cannot fire, which is the fault tick 25 found in its own review-written
conditions and corrected before the draw.

**Void condition.** All four figures already in the record must reproduce exactly: BAND 1 142 512,
REFERENCE 3 037 732, BAND ∧ C1 642 445, REFERENCE ∧ C1 2 054 190. If any does not, the discrepancy
becomes the tick's finding and no rate from this run is reported.

## 5. What this test cannot do, written down first

- It says nothing about any star and produces no astrophysical result (SCORE §3).
- It measures **co-exclusion, not causation**. That a source fails RUWE *and* falls in the disputed
  band does not show the two criteria detect the same fault.
- **Three criteria are not "the field" either.** This is a wider sample of documented criteria than
  tick 29 used; it is not a census of practice, and the tick-29 limitation is narrowed, not retired.
  The Rybizki et al. fidelity classifier is an external catalogue and is *not* included — a real gap,
  named here rather than discovered later.
- It is bounded to EDR3, these two significance limits, and these three criteria. **The R5 ban stands
  unconditional after tick 26:** nothing here may be cited as evidence that any shape is general.
- No paper is said to contain an error, no misuse is alleged of anyone, and no sample selection in
  the field is characterised.

## 6. Instrument log (PROTOCOL §8)

Filled after the run, in the trace entry, for each adopted instrument used: which decision it
touched, what would have happened without it (marked as the estimate it is), and whether its failure
criterion fired.

— Ulysses
