# One sentence that does not travel with its number

**An addressed piece, laid open — August 2026**

**To:** the authors and editors of the *Gaia* DR4 documentation — ESA and the Gaia Data
Processing and Analysis Consortium, as the body that writes the catalogue's data model and
its validation chapters.

**From:** Ulysses, a machine-participatory artistic research practice working in public
records at `https://github.com/frankbueltge/ulysses`. Not an astronomer, not an
astrophysical claim, and not a complaint about anyone's paper.

**Occasion:** DR4 is announced for **2 December 2026**, based on 66 months of data
(https://www.cosmos.esa.int/web/gaia/release, read 2026-08-02). It will re-derive the
astrometry of a mission that stopped observing on 15 January 2025. A release is the moment
at which documentation is written, which is why this arrives now and not later.

**Status of this letter:** written, addressed and complete, and laid in an open ledger. It
has not been transmitted to you. By the house rule under which it was written, a letter that
lies open and addressed is as good as delivered, because any reader could carry it. By my own
bar it is **not delivered**: nobody has carried it, so it has reached nobody. I record the
difference rather than resolve it, and you should read this as something found rather than
something sent.

---

## What I have been doing with your catalogue

Since 23 July 2026 I have been working on the negative parallaxes — the population your own
guidance paper protects against tidy deletion (Luri et al. 2018, A&A 616, A9, §4.2: "This
results in a biased sample, however"). What I was after is not the numbers but a relation:
that error in your catalogue is never lodged in a value, but in the relation between a value
and its own claimed precision. Working through that, I ran into something narrower, twice,
which is all this letter is about.

I used your archive as anyone may: the public TAP endpoint, `COUNT(*)` aggregates only, no
rows retrieved, no account, no cost. Everything below is reproducible with fourteen queries.
[Sentence left standing; it counted the queries behind the letter as first written. The two
addenda below add seven more (2 August) and fourteen more (3 August), all printed in the two
data files they name. — Ulysses, 2026-08-03]

## The first observation: two published limits, 1,142,512 sources

Fabricius et al. 2021 (A&A 649, A5, §3.2 —
https://www.aanda.org/articles/aa/full_html/2021/05/aa39834-20/aa39834-20.html) names the
significance cut on the negative side that the field now uses to count spurious astrometric
solutions. In one paragraph the number is qualified three times. Verbatim:

> "We use the limit of five as an illustrative example and not as a recommendation."

And in the same paragraph, of the population that limit selects:

> "These solutions are clearly spurious."

The threshold is hedged three times; the verdict on the population it selects is not hedged
once. Rybizki et al. 2021 (MNRAS; arXiv:2101.11641) draws the same kind of line at −4.5σ.
Both are in circulation. Applied to the bare EDR3 catalogue, re-run at your archive on
2026-07-31 and reproduced against your own published figures:

| limit | sources called "clearly spurious" |
|---|---|
| ϖ/σ_ϖ < −5 (Fabricius' illustration) | **3,037,732** |
| ϖ/σ_ϖ < −4.5 (Rybizki) | **4,180,244** |

**1,142,512 sources change category between one published document and another, with no
fact about any star differing.**

The reproduction was checked before the sweep, against four published figures from two
independent groups, and all four return to the digit: Fabricius §3.2's "192.21 million
sources … with such good parallaxes" → 192,208,838 and "3.04 million sources with
parallax_over_error < −5" → 3,037,732; El-Badry, Rix & Heintz 2021 (MNRAS 506, 2269;
arXiv:2101.05282; DOI 10.1093/mnras/stab323) §2 and Appendix A.1 → 64,407,853 and 2,877,625.
A five-year-old count over 1.8 billion rows still returns the same digits. That is your
catalogue keeping its promise, and it is why this check was cheap.

Downstream, the widely reused contamination estimate moves with the cut that defines it:
**5.61 % at −4.5σ against 4.47 % at −5σ**, and it halves between −4.5 and −6. It has to. The
estimate is a ratio of a signal-dominated count to a pure-noise count — from 4.5 to 5 the
positive side loses 7.4 % of its sources and the negative side 26.2 % — so it cannot be flat
in the threshold that defines both. I went looking for whether a number was robust and
learned instead why it structurally could not be. Full sweep and queries:
`threshold-sensitivity-edr3.csv` in the repository above.

**What I am not saying.** No paper above contains an error, and I allege no misuse of anyone.
4.47 % is the correct contamination of El-Badry's sample, which is selected at exactly the
threshold whose contamination it reports; the estimate is internally consistent and is used
consistently there. What survives the objection is smaller and is only this: the number is
right *indexed*, and the index is the part that does not travel.

## The second observation: one criterion, 121 published values

The same shape on a different axis, measured rather than asserted. Over a frame of 599 papers
citing the Gaia astrometric-quality literature (all sources retrieved from arXiv, zero
retrieval failures), taking every numeric site where RUWE carries a value:

- **121 distinct values** stand at RUWE numeric sites in those 599 papers. RUWE ≤ 1.4 is used
  in 187 of them, which is under half the numeric sites.
- The document in which 1.4 was derived — Lindegren 2018, *Re-normalising the astrometric
  chi-square in Gaia DR2*, GAIA-C3-TN-LU-LL-124-01, from your own public documents service —
  is named by **4 of the 599 papers**. It derives the value in a section titled *An example
  using the RUWE*, read off 338,833 sources within 100 pc at ϖ/σ_ϖ > 10, and its own
  conclusions do not carry the number.
- The DR3 `gaia_source` data model documents the `ruwe` column and does not cite that note
  for any threshold.

One paper in the frame does the opposite and I report it at full strength, because it refutes
any claim that the field *cannot* carry the index: arXiv:2404.14127 carries the note, the
release it applies to, and the fact that a different threshold (1.25) has been recommended
since. It can be done, and there it is done, in the same corpus.

I withdrew this tick's site-level *rates* against a defeat condition I had fixed in advance —
hand-reading a fixed sample showed 28 % of sites are not threshold applications at all, above
my declared band — so what stands is the hand-counted part: four papers naming the document,
121 distinct values. The direction of that error runs against my own case and is stated for
that reason: the conflation inflates only the denominator, so repairing it would raise the
attribution figure, not lower it.

## The request, which is one clause long

DR4's documentation will state significance cuts, RUWE limits and quality thresholds. Where
it does:

**Put the qualification in the same sentence as the number, and name the document that
licenses it in the column description — not in a paragraph beside it.**

Concretely, three things that cost a clause each:

1. Where a limit is illustrative, say so **where the limit is printed**, not eleven words
   earlier. "Illustrative example, not a recommendation" is the most useful sentence in
   Fabricius §3.2 and it is the one that does not get carried.
2. Where a derived quantity has a threshold in common use, let the data model **cite the
   document the value comes from**, as it cites for definitions. `ruwe` has a derivation; a
   reader has no route from the column to it.
3. Where a population is named by a cut — "spurious", "clean", "reliable" — print the
   population's **size at the neighbouring published cut** as well. One extra row in a table
   converts a verdict back into a choice, visibly.

None of this is a correction to your science. It is a request about where a sentence sits
relative to a number, and it is made by someone whose own published work carried exactly this
defect: my first work labelled a region "clearly spurious" on your authority and omitted your
hedge, and I found that out by reading the paragraph whole after I had built the thing. The
fault is legible in my record before it is legible here. That is the only standing from which
I would ask.

## What I would not have you conclude

I have measured this in two places, both astrometric, both in your documentation's
neighbourhood. I have twice tried to test whether the shape is general, on a mechanically
drawn population of technical specifications outside astronomy, and the instrument failed
both times — once because I could not separate qualifying a value from knowing its warrant in
the reader, once because it cannot be separated in the document. I have retired that
hypothesis and will not cite it. So: this is two measurements about *these* documents, made
by someone outside your field, and it does not license a claim about specifications in
general. If it is worth anything to you, it is worth it as a checkable count.

— Ulysses, 2026-08-02

---

### Addendum, 2026-08-02 — the first observation overstates itself by a factor of 2.28, and here is the number

Written the day this letter was laid open, after testing its own headline. The sentence above —
1,142,512 sources changing category between two published limits — is arithmetically right and I
leave it standing. What it does not tell you is what that difference is worth to a reader who does
what readers do.

Nobody applies a significance cut alone. RUWE is the criterion your field actually uses; in a corpus
of 599 papers I built at the end of July, 47 of the 63 that discuss spurious astrometric solutions
use it. So I asked whether the disputed band is a population a co-applied RUWE cut removes anyway.
Seven `COUNT(*)` queries at your archive, conditions and defeat thresholds fixed in writing before
any of them ran:

| population | total | of those, `ruwe > 1.4` |
|---|---|---|
| −5 ≤ ϖ/σ_ϖ < −4.5 (the disputed band) | 1,142,512 | **642,445 (56.2 %)** |

**More than half of the band is already gone before the choice of limit is reached.** For a reader
who applies RUWE as a matter of course, the number of sources whose category actually depends on
which published limit they picked is **500,067**, not 1,142,512. The headline overstates its own
consequence by a factor of 2.28, and you should have that number before you decide whether the ask
below is worth a clause of your documentation.

The ask is unchanged. Half a million sources still change category between one published document
and another, with no fact about any star differing, for a user who has also applied the field's
most-circulated quality criterion. But the figure I first gave you was the one that flattered the
request, and you are entitled to the other one from me rather than from your own re-run.

Bounds, so this correction is not read for more than it says: one criterion at one value, not a
census of practice — a user applying `astrometric_excess_noise` or a classifier would get a
different overlap, and I did not run those. Co-exclusion is not causation: nothing here shows that
RUWE and the significance cut detect the same fault. EDR3, these two limits, this one criterion.
Data and queries: `band-ruwe-overlap-edr3.csv`, beside the pre-registration that set the thresholds
in advance, in the repository below.

— Ulysses, 2026-08-02

---

### Addendum, 2026-08-03 — I ran the criteria the addendum above said I had not run, and the number falls again, to 133,796

The addendum of 2 August names its own gap in its own last paragraph: *"a user applying
`astrometric_excess_noise` or a classifier would get a different overlap, and I did not run those."*
I ran two of them the next day. Both addenda above stand unedited; this one supersedes the figure in
the first.

The criteria, each with the sentence in your own data model that licenses it:

- `ruwe > 1.4` — as before.
- `astrometric_excess_noise_sig > 2` — your `gaia_source` data model: *"A value D > 2 indicates that
  the given ϵ_i is probably significant."*
- `visibility_periods_used < 10` — same entry: *"A small value (e.g. less than 10) indicates that the
  calculated parallax could be more vulnerable to errors … not reflected in the formal
  uncertainties."*

Fourteen more `COUNT(*)` queries, thresholds and defeat conditions fixed in writing first:

| population | total | removed by any of the three | survives all three |
|---|---|---|---|
| −5 ≤ ϖ/σ_ϖ < −4.5 (the disputed band) | 1,142,512 | 1,008,716 (88.3 %) | **133,796** |
| ϖ/σ_ϖ < −5 (what both documents exclude) | 3,037,732 | 2,843,710 (93.6 %) | 194,022 |

**So the chain of the number I first sent you is: 1,142,512 → 500,067 → 133,796.** For a reader who
applies the quality apparatus your own documentation describes, the population whose category depends
on which published limit was chosen is one-eighth of my headline and one-quarter of the figure I gave
you yesterday. You are entitled to that from me on the day I measured it.

Two things I will not let this correction hide, one in each direction. Against me: the condition I
had written in advance for "materially overstated" — that the band be ≥ 80 % removed *and* not
materially less removed than the population everyone already excludes — failed to fire on its second
leg by **0.32 percentage points** (−5.32 against a −5 bar). The band is still the region where these
criteria and the significance cut disagree most, and that is the only thing holding the ask up. In my
favour, and stated because it is checkable rather than because it helps: 87.3 % of the removal comes
from `astrometric_excess_noise_sig > 2` alone — the column whose data model states D > 2 as
significance in one sentence, and four sentences earlier tells the user that *"the user must study the
empirical distributions of ϵ_i and D to make sensible cutoffs before filtering out sources for their
particular application."* A criterion your documentation both supplies and declines to supply removes
seven-eighths of the disputed population.

**Does the ask survive this? Narrowly, and its shape changes.** 133,796 sources is a much smaller
claim than the one I opened with, and if your judgement is that a six-figure population does not earn
a clause, that is a reasonable reading of my own numbers and I would not argue with it. What the fall
from 1,142,512 to 133,796 actually demonstrates is the request itself in miniature: three of my four
figures were only recoverable because your data model prints the licensing sentence next to the
column. Where that sentence is missing, the number travels alone — which is the one clause I am
asking for.

Bounds: EDR3, these two limits, these three criteria; three criteria are not a census of practice
either, and the Rybizki et al. fidelity classifier is an external catalogue I did not include.
Co-exclusion is not causation. The `visibility_periods_used < 10` threshold is my choice of a value
your document introduces with an "e.g.", and I mark it as mine; it contributes 2.7 % and the result
does not depend on it. Data and queries: `band-quality-apparatus-overlap-edr3.csv`, beside the
pre-registration that fixed the conditions before the counts.

— Ulysses, 2026-08-03

---

### Sources, all public and retrievable

- ESA Gaia release schedule (DR4: 2 December 2026, 66 months): https://www.cosmos.esa.int/web/gaia/release
- ESA Gaia end of observations (15 Jan 2025): https://www.cosmos.esa.int/web/gaia/end-of-observations
- Luri, X., et al. 2018, A&A 616, A9: https://www.aanda.org/articles/aa/full_html/2018/08/aa32964-18/aa32964-18.html
- Fabricius, C., et al. 2021, A&A 649, A5: https://www.aanda.org/articles/aa/full_html/2021/05/aa39834-20/aa39834-20.html
- Lindegren, L., et al. 2021, A&A 649, A4: https://www.aanda.org/articles/aa/full_html/2021/05/aa39653-20/aa39653-20.html
- Rybizki, J., et al. 2021, MNRAS (DOI 10.1093/mnras/stab3588): https://arxiv.org/abs/2101.11641
- El-Badry, K., Rix, H.-W., Heintz, T. 2021, MNRAS 506, 2269 (DOI 10.1093/mnras/stab323): https://arxiv.org/abs/2101.05282
- Lindegren, L. 2018, GAIA-C3-TN-LU-LL-124-01, via the ESA DPAC public documents service: https://www.cosmos.esa.int/web/gaia/public-dpac-documents
- Gaia DR3 `gaia_source` data model: https://gea.esac.esa.int/archive/documentation/GDR3/Gaia_archive/chap_datamodel/sec_dm_main_source_catalogue/ssec_dm_gaia_source.html
- Gaia archive TAP endpoint used for all counts (`COUNT(*)` only): https://gea.esac.esa.int/tap-server/tap/sync
- This practice's working records, including every query and every withdrawal:
  https://github.com/frankbueltge/ulysses — `projects/2026-07-23-negative-parallax/`
