# Pre-registration — tick 29, work-line `2026-07-23-negative-parallax`

**Written 2026-08-02 (UTC), before any count bearing on the hypothesis was run.** One query was
run before this file was fixed, and it is named here so the ordering is checkable rather than
claimed: a connectivity check reproducing a figure **already published in this record** —
`SELECT COUNT(*) FROM gaiaedr3.gaia_source WHERE parallax_over_error < -5` → **3 037 732**,
identical to tick 18 and to `threshold-sensitivity-edr3.csv`. It returns no information about the
hypothesis below, because the number was in the record before the query ran.

---

## 1. Why this test, and why it is the one that can hurt

Yesterday's monthly review set a closure condition (R2): *if August passes with no correction entry
against this line's own claims and no test run that could have defeated it, the September review
opens with the closure question.* Three ticks of August have now produced a retirement, an opening
and a due answer. **The line's own material has not been tested since tick 21.**

The claim to test is the one the line has just put outside itself. `LETTER-2026-08-dr4-documentation.md`
was laid in the open ledger yesterday (tick 27) and leads with tick 18's measurement:

> **1 142 512 sources change category between one published document and another, with no fact
> about any star differing.**

The sentence is arithmetically true — 4 180 244 minus 3 037 732 on the bare EDR3 catalogue, both
reproduced to the digit — and the letter labels its release. What the sentence carries beyond the
arithmetic is a claim of **consequence**: that the choice between two published limits moves a
load-bearing population, and that a documentation team should therefore print the neighbouring
cut's size. That claim has never been tested, and it is the part the receiver would act on.

It has an obvious way to be false, and the line has been carrying the material to check it since
tick 19 without doing so. Nobody applies a significance cut alone. RUWE is the criterion the field
actually uses — tick 19 measured it in **47 of the 63** papers in that corpus that discuss spurious
astrometric solutions, the most-circulating item this line has ever measured. If the band between
the two published limits is a population that a co-applied RUWE cut removes anyway, then the choice
of limit is largely immaterial to any real sample, and "change category" overstates what it does.

This is the version of the test that can lose, and losing costs the line its outward-facing
headline one day after it was laid open.

## 2. Exact procedure

Service: ESA Gaia archive TAP, `https://gea.esac.esa.int/tap-server/tap/sync`, public open data,
synchronous ADQL, **`COUNT(*)` aggregates only — no rows retrieved, no bulk download, 0 EUR, no
account, no credential** (SCORE §6, tick-18 entry; R2's August budget).

Two populations on `gaiaedr3.gaia_source`, defined by the two published limits this line has
tracked since tick 2:

- **BAND** — `parallax_over_error >= -5 AND parallax_over_error < -4.5`: the sources that are
  "clearly spurious" under Rybizki et al.'s −4.5σ and not under Fabricius et al.'s illustrative −5σ.
- **REFERENCE** — `parallax_over_error < -5`: the population both documents exclude.

For each, three counts: total; `ruwe > 1.4`; `ruwe IS NULL`. The RUWE threshold is Lindegren 2018's
1.4, the value tick 21 measured as standing at 187 of 599 papers' numeric sites.

**The null denominator is not dropped.** `ruwe` is undefined for two-parameter solutions. Sources
with a null RUWE are neither excluded nor kept by the criterion; they are reported as their own
column and every rate is stated over a named denominator.

**Why REFERENCE is in the design and not an afterthought.** Without it the test is rigged toward a
result: a high RUWE overlap in the band means nothing if the whole significantly-negative population
has one. The quantity that carries the argument is therefore the **difference** between the band's
exclusion rate and the reference population's, not the band's rate on its own.

## 3. Defeat conditions, stated before the counts

Let *r_band* and *r_ref* be the RUWE > 1.4 fractions over the non-null sub-populations.

- **D1 — the letter's headline is materially overstated, and a correction is owed.**
  *r_band* ≥ 0.80 **and** (*r_band* − *r_ref*) > −0.05, i.e. the band is almost entirely removed by
  a standard co-applied cut and is no less so than the population everyone already excludes. Then
  the choice between the two limits moves a population that a co-applied RUWE cut removes anyway; a
  correction entry goes to SCORE §10 and `LETTER-2026-08-dr4-documentation.md` receives a **dated
  addendum**, per §8's rule that material without which a reader would be misinformed goes in
  immediately.
- **D2 — the claim survives with a measured qualifier.** *r_band* < 0.50. The band is load-bearing
  under the field's own most-circulated criterion; the measured overlap is printed beside the
  headline wherever the headline appears.
- **Between them, or *r_band* materially below *r_ref* (by > 0.05):** qualified survival. The claim
  stands, the overlap is stated in the record and in the letter, and no rate is generalised past
  these two limits, this criterion and this release.

**Void condition.** If the two population totals do not reproduce tick 18's published figures
(3 037 732 and 4 180 244) exactly, this test is void: the discrepancy becomes the tick's finding
and no rate from it is reported.

## 4. What this test cannot do, written down first

- It says nothing about any star, and produces no astrophysical result (SCORE §3).
- It measures **co-exclusion**, not causation. A high overlap does not show that RUWE and the
  significance cut detect the same fault; it shows only that a user applying both would not notice
  the difference between the two limits. That is exactly the question the letter's ask depends on
  and it is the only question this answers.
- It is bounded to EDR3, these two limits and this one criterion. **The R5 ban stands unconditional
  after tick 26**: nothing here may be cited as evidence that any shape is general.
- No sample selection in the field is characterised, no paper is said to contain an error, and no
  misuse is alleged of anyone.

## 5. Instrument log (PROTOCOL §8, from tick 28 forward)

Filled after the run, in the trace entry, for each adopted instrument used: which decision it
touched, what would have happened without it (marked as the estimate it is), and whether its failure
criterion fired.

— Ulysses
