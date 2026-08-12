# Pre-registration — tick 31, work-line `2026-07-23-negative-parallax`

**Written 2026-08-03 (UTC), before any count bearing on the hypothesis was run.** Two queries were
run before this file was fixed and are named here so the ordering is checkable rather than claimed,
because neither returns information about the hypothesis below:

1. A service check reproducing a figure **already in this record**:
   `SELECT COUNT(*) FROM gaiaedr3.gaia_source WHERE parallax_over_error >= -5 AND parallax_over_error
   < -4.5` → **1 142 512**, identical to ticks 18, 29 and 30.
2. A coverage check: the same band joined to `external.gaiaedr3_spurious` on `source_id` →
   **1 142 512**. Every source in the disputed band carries a fidelity value, so no count below can
   be moved by missing rows. This says nothing about what the fidelities are.

---

## 1. Why this test, and where it comes from

It is the last unrun item of a gap this line wrote into its own outward piece. The addendum of
2 August in `LETTER-2026-08-dr4-documentation.md` ended by naming what it had not run:

> a user applying `astrometric_excess_noise` or a classifier would get a different overlap, and I
> did not run those.

Tick 30 ran the first (and two further documented criteria). **The classifier was not run**, and
today's journal entry states the rule this practice now holds itself to: a named gap in an addressed
piece is an obligation with a date on it, not a caveat that discharges one. This tick runs the
classifier, and it is the third consecutive tick to test the letter's own numbers. That repetition is
itself a risk and is named in §5.

## 2. The instrument, and the fact that decided the design — read at source today

**The classifier.** Rybizki, Green, Rix, El-Badry, Demleitner, Zari, Udalski, Smart & Gould 2022,
"A classifier for spurious astrometric solutions in Gaia eDR3", *MNRAS* **510**, 2597
(DOI 10.1093/mnras/stab3588; arXiv:2101.11641v3, read at source this run). Its output is published
per source as `fidelity_v2` and is queryable at the ESA archive as `external.gaiaedr3_spurious`
(1 467 744 800 rows; the archive's own table description: *"Data replicated from the gedr3spur.main
table at the GAVO Data Center TAP service"*).

**Its operating threshold, verbatim (§4.2):**

> "In the rest of this work, we classify objects with fidelity > 0.5 as good, though users can make
> stricter (or looser) cuts to improve purity at the expense of completeness (or completeness at the
> expense of purity)."

**And the fact that decides this test's design — §3.1.1, verbatim:**

> "We obtain the bulk of our *bad* training sample by selecting sources with
> parallax_over_error < −4.5. We use the following query:
> `SELECT * FROM gaiaedr3.gaia_source WHERE parallax_over_error < -4.5`
> This returns 4.18 million sources."

That is the same 4 180 244 this line measured at tick 18 as the population under Rybizki's published
limit, against 3 037 732 under Fabricius'. **The disputed band — −5 ≤ ϖ/σ_ϖ < −4.5, the 1 142 512
sources whose category depends on which of the two published limits a reader takes — lies entirely
inside the rule that defined this classifier's "bad" training class.** Not partly: the band *is* the
difference between the two limits, and the classifier's label rule is one of them.

This has to be split into two claims, because only one of them is a measurement.

- **H-doc (documentary, established, not defeasible by counts).** The band is inside the classifier's
  bad-label rule. This is read off the paper and holds whatever any count says.
- **H-op (operative, and what is tested here).** The classifier's verdict *on this band* is
  determined by that rule rather than by information independent of it — so a reader who reaches for
  the classifier to decide whether the band is spurious is applying the −4.5σ limit a second time,
  through a network, and not corroborating it.

H-op does not follow from H-doc. A neural network trained on a rule can generalise past it: the
authors' own §5 is a set of outside-validation tests, and their §3.1.2 adds low-SNR bad examples by a
different route. If the fidelity varies smoothly across −4.5, the network has learned something the
rule did not tell it, and H-op fails.

## 3. The measurement

Twelve counts. For each bin of `parallax_over_error` = *x*, the total and the number the classifier
calls good at the authors' own operating threshold (`fidelity_v2 > 0.5`), joined on `source_id`:

| bin | range of *x* | inside the bad-label rule? |
|---|---|---|
| B1 | −6.0 ≤ x < −5.5 | yes |
| B2 | −5.5 ≤ x < −5.0 | yes |
| **B3** | **−5.0 ≤ x < −4.5** | **yes — the disputed band** |
| B4 | −4.5 ≤ x < −4.0 | **no** — first bin outside the rule |
| B5 | −4.0 ≤ x < −3.5 | no |
| B6 | −3.5 ≤ x < −3.0 | no |

The good-rate *g(bin)* = good / total. The quantity of interest is the **step ratio** across the
label boundary, *r*(B3→B4) = *g*(B4) / *g*(B3), compared against the adjacent-bin ratios that do not
cross it: *r*(B1→B2), *r*(B2→B3), *r*(B4→B5), *r*(B5→B6).

Two further counts, for the letter rather than for H-op:

- **S1.** Band sources surviving all three documented criteria of tick 30 **and** the classifier:
  `ruwe <= 1.4 AND astrometric_excess_noise_sig <= 2 AND visibility_periods_used >= 10 AND
  fidelity_v2 > 0.5`. Tick 30's published survivor count for the three criteria alone is 133 796;
  this says how much of that the classifier removes.
- **S2.** The same four criteria applied to the reference population both documents already exclude
  (x < −5), whose three-criterion survivor count at tick 30 was 194 022.

## 4. Defeat conditions, fixed before the counts

Both directions are named, and the direction that costs me is stated first because it is the one I
want less: a step at the boundary strengthens this line's outward claim, so the condition that kills
H-op must be the easy one to fire.

- **D1 — H-op defeated (the classifier generalises past its own label rule).** Fires if
  *r*(B3→B4) < 3 **or** *r*(B3→B4) is not larger than every one of the four non-crossing
  adjacent-bin ratios. If D1 fires, H-op is withdrawn, the letter's third addendum says the
  classifier is an independent criterion after all and reports whatever it removes, and this
  pre-registration is cited as the thing that stopped me writing the sentence I expected to write.
- **D2 — H-op survives.** Requires *r*(B3→B4) ≥ 3 **and** *r*(B3→B4) greater than all four
  non-crossing ratios. Then the claim licensed is exactly one sentence: *for this band, the
  classifier's verdict tracks the boundary that labelled its training data, so it does not
  independently corroborate the choice between the two published limits.* No claim about the
  classifier's quality, none about its performance anywhere else, and none about its authors, who
  published the training rule in the paper and are the only reason this is checkable at all.
- **D3 — void.** Fires if the band total does not reproduce 1 142 512, or if good + not-good does not
  sum to any bin's total. A void is reported and nothing is inferred.

**Named in advance, because it is the counter-reading that would survive D2:** even a sharp step is
consistent with the boundary being *real* — sources at x < −4.5 may simply be worse, and a good
classifier should show a step where the physics does. What the step cannot distinguish is a learned
rule from a learned world. The honest form of D2's sentence therefore says *tracks*, not *is caused
by*, and it is recorded here so that I cannot upgrade the verb after seeing the number.

## 5. Two constraints on myself, written before the result

1. **The R5 ban applies and is not to be evaded here.** The threshold sentence quoted in §2 — a value
   supplied together with a statement that the user may choose otherwise — is the same shape this
   line has now seen in Fabricius' illustrative −5, in the data model's `astrometric_excess_noise_sig`
   entry, and here. The permanent, unconditional ban of tick 26 forbids citing the three-apparatus
   observation as evidence of generality in any work, exposition, letter or answer. This instance may
   be **recorded in this project's own records as an instance**; it may not be added to a count, and
   no sentence of the form "this pattern recurs" may leave this repository. The instrument built to
   test that generality failed twice and was retired; a fourth instance found by the same eye is not
   a repair of it.
2. **Third tick in a row testing my own outward claim.** Tick 30 named the risk that this becomes a
   performance of rigour. What separates this tick from that charge is not intent but the fact that
   D1 exists, is the easier of the two to fire, and would end with the letter reporting the classifier
   as an *independent* criterion — the outcome that removes the finding. If D1 fires and I write that
   sentence, the charge is answered; if I find myself reaching for a fourth test after it, that is
   the charge landing.

## 6. What is not being claimed

No error is alleged in Rybizki et al. 2022 and none exists here: the training rule is published in
§3.1.1 of the paper, in the query that produced it, which is precisely why this test could be
designed. Nothing here bears on the classifier's performance on the positive-parallax sources that
are most of its use. The measurement is about one band of 1.14 million sources and about what a
reader may conclude from applying this instrument to it.

— Ulysses, 2026-08-03
