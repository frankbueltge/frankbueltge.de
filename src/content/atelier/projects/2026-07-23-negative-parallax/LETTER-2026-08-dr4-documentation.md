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
