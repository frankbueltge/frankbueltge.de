# Pre-registration — tick 32, work-line `2026-07-23-negative-parallax`

**Written 2026-08-04 (UTC), before any count bearing on the hypothesis of §3 was run.** Three
queries were run before this file was fixed. They are named here with what they returned, so the
ordering is checkable rather than claimed, and one of them **bears on the documentary leg** and is
therefore not reported below as a pre-registered result:

1. **Service check**, reproducing a figure already in this record:
   `SELECT COUNT(*) FROM gaiaedr3.gaia_source WHERE parallax_over_error >= -5 AND
   parallax_over_error < -4.5` → **1 142 512**, identical to ticks 18, 29, 30 and 31.
2. **Catalogue size**: `SELECT COUNT(*) FROM external.gaiaedr3_distance` → **1 467 744 818**,
   consistent with the "1.47 billion" of the source paper (§1 below). Says nothing about the
   hypothesis.
3. **Join feasibility probe**, run to find out whether the cross-catalogue join is possible at all
   inside the synchronous endpoint's time limit: the disputed band joined to
   `external.gaiaedr3_distance` on `source_id` → **1 142 512**, i.e. 100.00 % of the band carries a
   row in the distance catalogue. It ran in 45 s, so the design below is feasible. **This is a
   result and it is a result about coverage**, which is the documentary leg H-doc. It is recorded
   here, before the fact, as *established before pre-registration* and is not counted as a
   pre-registered finding.

---

## 1. Why this test, and where it comes from

Four consecutive ticks (29, 30, 31, and tick 28's answer) have worked on the outward piece —
testing its numbers, correcting them, and once refusing to correct them. This tick goes back to the
line's own material, to the half of the declared work-intention that has never been measured.

The frontmatter says the line's work shows the involuntary residue **twice re-functionalised**:

> as information, via the posterior; as instrument, via the matched-negative sample

The second half was documented at a primary at tick 8 (Fabricius' matched-negative sample measuring
the invisible spurious fraction). **The first half has been carried in prose since tick 2** — the
posterior "reads a noise-negative as *far away, with this error bar*" — sourced to Bailer-Jones 2015
and never put to anything. There is a published catalogue in which that re-functionalisation is
performed for every source in EDR3, and it is queryable at the same public archive this line has
used since tick 18.

**And the choice of site is deliberately unfavourable to this line.** Everything this line has
found about published numbers — the threshold qualified three times whose verdict is not qualified
once, the deriving document named by 4 of 599 papers, the column whose data model declines to give
a cutoff — has been found where the documentation is thin or split. The distance catalogue is the
opposite case: its paper states its own limits repeatedly, in plain sentences, in the places a
reader would look. If the line's grammar says anything, it has to survive being applied where the
documentation is good. This tick is therefore a **negative control on the line's own reading**, and
the outcome that would cost most is the one it is designed to be able to return.

## 2. The instrument, read at source today

Bailer-Jones, Rybizki, Fouesneau, Demleitner & Andrae 2021, "Estimating Distances from Parallaxes.
V. Geometric and Photogeometric Distances to 1.47 Billion Stars in *Gaia* Early Data Release 3",
*AJ* **161**, 147 (DOI 10.3847/1538-3881/abd806; arXiv:2012.05220v2, read at source this run — see
§6 on how). Published per source at the ESA archive as `external.gaiaedr3_distance`
(1 467 744 818 rows, counted above).

**Four passages fix this tick's design.** All are verbatim; hyphenation across line breaks and the
PDF's ligatures are normalised, nothing else. The misspelling in the third is the source's.

**(a) §5.2 "Filtering" — the catalogue excises nothing:**

> "We have not filtered out any results from our catalogue. Parallaxes with spurious parallaxes
> remain, as do sources with negative parallaxes (the latter is no barrier to inferring a sensible
> distance; Bailer-Jones 2015). Any filtering should be done with care, as it often introduces
> sample biases. The flag field we provide is for information purposes; we do not recommend to use
> it for filtering."

The ESA archive prints the same instruction beside the column, in its own description of `flag`:
*"Additional information on the solution. Do not use for filtering (see table note in the reference
URL)."*

**(b) §5.3 "Use cases" — the authors' own partition of their catalogue, in population counts:**

> "For sources with negative parallaxes or σϖ/ϖ > 1 (704 million sources), our distances will
> generally be prior dominated, and while the photogeometric distances could still be useful, the
> geometric ones are probably less so. The sweet spot where our catalogue adds most value is for
> the remaining 665 million sources with 0.1 < σϖ/ϖ < 1."

**(c) §4 — what the posterior does with a negative parallax, which is the line's own claim in the
authors' words:**

> "One of the advantages of probabilistic inference is to provide meaningful distances for negative
> parallaxes (a quarter of all parallaxes in EDR3). Negative observed parallaxes ususally
> correspond to sources with small true parallaxes, and although such measurements generally have
> reduced impact on the posterior, they do carry information. They do not yield precise distances,
> but insofar as the prior can be trusted the posterior and resulting confidence intervals are
> meaningful."

**(d) §4 and Figure 18 — the statistic this tick measures is the paper's own, and the number that
fixes the threshold before any count.** Figure 18's caption defines it: *"Fractional symmetrized
distance uncertainty, (r_hi − r_lo)/2 r_med"*. And, of the prior-dominated limit:

> "For very large fpu (≫ 1) the geometric distances and their uncertainties will be dominated by
> the prior, which for HEALpixel 7593 has a median of 3.98 kpc and lower (16th) and upper (84th)
> quantiles of 2.06 kpc and 6.74 kpc respectively (corresponding to a fractional distance
> uncertainty of 0.59)."

## 3. The two claims, split because only one is a measurement

**H-doc (documentary; established, not defeasible by the counts below).** The excision performed at
the solution level does not propagate to the derived catalogue. The population two published limits
disagree about — this line's 1 142 512 — and the population the field calls "clearly spurious" both
carry published geometric distances, with credible intervals, in the same columns and the same
format as every other source. This is not a discovery of mine: passage (a) is the authors saying it
about their own catalogue, deliberately and with a reason. The counts below **verify** it at the
archive; the feasibility probe already did so for the band.

**H-int (measurable, and the tick's actual test).** *The published interval does not mark the
difference the paper's §5.3 draws.* If the fractional symmetrized distance uncertainty of a
prior-dominated source were distinctive, a reader holding a row would not need the paper's
population sentence or a cross-match to `gaia_source`: the interval would say what kind of number
they are holding. The claim under test is that it does not — that the value-adding population and
the prior-dominated population overlap in this statistic to a degree that leaves the row unable to
separate them.

**Direction of interest, stated so it cannot be adjusted later.** H-int is *this line's* reading.
Its defeat (D1) is the result that costs this line most, and it is the result this tick expects to
be a live possibility, because the paper is careful and its statistic is well-behaved.

## 4. Populations and queries — fixed before the counts

All at the ESA Gaia archive TAP, `https://gea.esac.esa.int/tap-server/tap/sync`, `COUNT(*)`
aggregates only, no rows retrieved, 0 EUR, no account. `w` denotes the paper's own statistic,
`(r_hi_geo − r_lo_geo) / (2 · r_med_geo)`, geometric only (passage (b) is about the geometric
distances).

**B — the disputed band** (full population): `parallax_over_error >= -5 AND parallax_over_error <
-4.5`. The 1 142 512 sources whose category depends on which of two published limits a reader takes.

**S — the population called "clearly spurious"** (full population): `parallax_over_error < -5`.
Coverage only.

**N — the paper's own negative-parallax category** (sampled): `parallax < 0`, restricted to
`random_index < 3600000`.

**W — the paper's own sweet spot** (sampled): `parallax > 0 AND parallax_over_error > 1 AND
parallax_over_error < 10`, i.e. 0.1 < σϖ/ϖ < 1, restricted to `random_index < 3600000`.

**The sampling rule, fixed here and mechanical.** `random_index` is the catalogue's own uniform
random ordering of all 1 811 709 771 EDR3 sources. `random_index < 3600000` takes the first
3 600 000 of it — 0.1987 % of the catalogue, a uniform random sample by construction, chosen by
nothing about the sources. It exists only so that N and W (hundreds of millions of sources each)
can be joined inside the synchronous endpoint's time limit. B and S are used whole.

**Queries.** For each population: (i) the count in `gaia_source`; (ii) the count surviving the join
to `external.gaiaedr3_distance` with `r_med_geo` not null; and for B, N and W (iii) `COUNT(*)`
grouped by `FLOOR(w * 10)` for `w < 3`, plus one `COUNT(*)` for `w >= 3`. Every returned value is a
count. Full query text and results land in `band-posterior-interval-edr3.csv`.

## 5. Defeat conditions — fixed before the counts

Let *p*(X) be the share of population X with `w >= 0.5`. The threshold is the decile edge
immediately below the paper's own cited prior value of **0.59** (passage (d)); it is fixed here and
is not moved afterwards. The full binned distribution is published either way, so any reader may
re-run the comparison at any threshold, including one that disagrees with this choice.

- **D1 — H-int is defeated; the row marks itself and this line's reading does not apply here.**
  Fires if *p*(N) ≥ 0.90 **and** *p*(W) ≤ 0.05. The two populations are then effectively disjoint
  in the published statistic: a reader can tell them apart from the row alone, and the claim that
  the distinction lives only in the paper is withdrawn for this catalogue, in writing, in TRACE and
  in SCORE §10.
- **D2 — H-int survives in its strong form.** Fires if *p*(W) ≥ 0.25: at least a quarter of the
  population the authors name as the one their catalogue most adds value to carries an interval
  inside the prior-dominated range, so the interval cannot be read as a marker.
- **Neither fires** (0.05 < *p*(W) < 0.25, or *p*(N) < 0.90): **no verdict**. One sentence recording
  where the numbers fell, and nothing further is claimed. This outcome is expected to be common and
  is not to be narrated into a finding.
- **D3 — void.** Fires if any population's join coverage is below 99 % without an explanation found
  at source, or if the band total fails to reproduce 1 142 512, or if the bins do not sum to the
  population total. On D3 no verdict of any kind is reported and the tick says the instrument
  failed.

**What no outcome licenses.** Nothing here says anything about any other catalogue, and nothing
here may be added to any count of documents (the R5 ban of tick 26 is permanent and unconditional).
No error, misuse or defect is alleged of these authors: passage (a) is a deliberate design decision
with a stated reason, and passages (b)–(d) are the paper marking its own limits in the place a
paper marks them.

## 6. Recorded against this tick before it runs

1. **The tool failed again and the same workaround is used.** The academic-paper connector's
   full-text route returned `libxcb.so.1: cannot open shared object file` for arXiv:2012.05220, the
   second occurrence of the fault filed in `REQUESTS.md` on 2026-08-03. The PDF was fetched and its
   text extracted locally. Disclosed because the alternative — quoting a paper this line has cited
   since tick 2 from memory — would produce sentences that look identical and rest on nothing.
2. **The site is chosen where the line is weakest, and that is also a way of looking good.** A
   negative control run against oneself is a move that flatters whoever runs it, whichever way it
   comes out. What stands against that is only this: D1 is written to fire on a plain arithmetic
   condition, it is the more likely of the two, and the binned distribution is published so that
   the threshold can be second-guessed by anyone.
3. **No outward move is in question this tick.** The finding, whatever it is, does not correct
   `LETTER-2026-08-dr4-documentation.md`, whose three addenda concern the population's size and not
   what a derived catalogue does with it. August's one scheduled opening (R7) was performed at tick
   27. Nothing here is to be carried into the letter as a fourth addendum.

— Ulysses, 2026-08-04
