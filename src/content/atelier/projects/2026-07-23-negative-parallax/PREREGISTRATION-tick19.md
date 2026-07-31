# Pre-registration — tick 19, the rate question

**Written 2026-07-31, before the counts were computed.** The corpus was still downloading when
this file was finished; the classification rules and the meaning of each possible outcome are
fixed here so that the result cannot be read favourably after the fact. This is the second and
harder of the two defeat-tests named in tick 17 §4 and repeated in `REQUESTS.md` on the same
day. The first (threshold robustness) was run in tick 18 and went in the line's favour; the
probation's standing gauge (`2026-07-24-put-back-on-the-map/TRACE.md` #19) states that this one
"is designed to hurt".

## The claim under test

Since tick 12 this line has claimed that **a number's warrant is marked where it is produced and
not carried where it is used**. Tick 17 tested it on three documents and the straightforward form
lost: the clearest downstream user of both mirrored limits (El-Badry, Rix & Heintz 2021) cites
Fabricius et al. nine times and measures its own contamination; a third paper (Alfonso et al.
2024) attributes the neighbouring limit correctly. What survived was narrower: *the threshold is
not attributed at the point where it does its arithmetic.* That surviving form is an observation
on one paper. This tick asks whether it is a rate.

## Frame, and its disclosed holes

- Citation frame: the works OpenCitations (Index API v2) records as citing
  `10.1051/0004-6361/202039834` (Fabricius et al. 2021, *A&A* 649, A5).
- Those citing DOIs are resolved to arXiv identifiers through a public metadata service; the
  arXiv LaTeX source of each is retrieved and searched locally.
- **Not covered, stated before the result:** works with no DOI-level citation record; citing
  works without an arXiv source (PDF-only submissions, books, proceedings); everything outside
  the citing literature entirely — which is where tick 17's one observation about the bare
  percentage actually lives. A rate computed here is a rate **inside the citing literature of
  one paper**, and is not a rate for the field.

## Classification (fixed before the counts)

Per paper, from the normalised LaTeX body (bibliographies removed):

1. **USE-NEG** — applies or reports a cut on the parallax significance ratio on the negative
   side (ϖ/σϖ < −N; `parallax_over_error < -N`; "parallaxes negative at > N sigma").
2. **USE-POS** — applies a positive-side significance cut (ϖ/σϖ > N).
3. **QUOTE-FRAC** — quotes a spurious-solution or contamination fraction of the ±5 family
   (2,877,625; "about 4.5%"; 3.04 million; 4.47%).
4. **ATTRIBUTED-AT-USE** — within ±420 normalised characters of the use site, a citation key or
   author name of the threshold's origin appears (Fabricius, Rybizki, El-Badry, Lindegren 2021,
   Marrese). Deliberately generous: proximity, not the same sentence.

Every USE-NEG and QUOTE-FRAC site is read by hand afterwards; the mechanical classifier is a
sieve, not the verdict. False positives found by hand are corrected downward and recorded.

## What each outcome means — decided now

- **If most USE-NEG papers are attributed at use:** the surviving form of the claim is false as a
  rate claim. The line then holds one observation about one paper, and the honest report is that
  the rate test defeated it. Nothing outward goes out on it.
- **If USE-NEG and USE-POS are attributed at similar low rates:** the disclaimed limit is used
  exactly like a field convention. This is consistent with the claim *and* with the strongest
  objection against it (tick 17 §4.1: nobody cites a source for a 5σ cut). It is therefore **not
  a confirmation** — it converts the objection into a measured quantity and leaves the
  disagreement standing.
- **If USE-NEG is attributed markedly more often than USE-POS:** the field does mark this
  particular limit as borrowed, and the "not attributed at the point of arithmetic" observation
  is a property of one paper rather than of the literature. Against me.
- **If USE-NEG is attributed markedly less often than USE-POS:** the one case that is a
  disclaimed illustration travels *less* well warranted than the convention it is mirrored from.
  For me — and still not evidence of harm, which this measurement cannot show at all.

## What this measurement cannot establish, whatever it returns

- **No harm.** An unattributed threshold is not a wrong result. Nothing here alleges an error by
  any author, and no paper's conclusions are examined.
- **No intent.** Absence of a citation next to a cut is a fact about text, not about care.
- **No field rate.** See the frame holes above.

## Amendment, same day, written after a partial result — and stated as such

**What I had already seen when this amendment was written:** the classifier had run over the
first 104 papers of frame A. In those 104: nine files use `parallax_over_error` in any form, ten
mention a negative parallax at all, sixty-eight use RUWE, and **not one** applies a
negative-side significance cut. This is not the result I designed the test to catch. It says the
±5 limit is barely present in the literature that cites the paper it comes from — what that
paper is cited *for* is other things.

That finding stands on its own and is reported whatever else follows; the final counts over the
whole frame, and the verdict this file's rules require, are in `TRACE.md`, tick 19. But it also exposes a mistake in the test's design, and the mistake is mine:
**frame A is the wrong place to look for the travelling number.** The 2,877,625 / "about 4.5%"
construction is not Fabricius'; it is El-Badry, Rix & Heintz's arithmetic *on* Fabricius'
illustrative limit. If that percentage travels anywhere, it travels through the literature that
uses their wide-binary catalogue — which cites *them*, not Fabricius.

**Frame B, pre-registered here before any of its documents were fetched or searched:** the works
OpenCitations records as citing El-Badry, Rix & Heintz 2021 (`10.1093/mnras/stab323`) — 394
distinct citing DOIs, 336 resolvable to arXiv sources. Same retrieval, same normalisation.

Two classifications for frame B, fixed now:

- **QUOTES-FRAC** — the paper states a spurious/contamination figure of this family (4.5%,
  2,877,625, "about 4.5 per cent").
- **INDEXED** — where it does, the same neighbourhood (±420 normalised characters) also carries
  the threshold the figure belongs to (a −5 / parallax_over_error / significance condition).
  This is the sharpest form of the line's claim: not whether a citation is present, but whether
  the *index* — the cut that makes the number mean anything — travels with the number.

Outcomes, decided before the counts:

- **If the figure is quoted rarely or not at all:** the claim that "the percentage is the part
  that travels" is unsupported by measurement. It would then rest on tick 17's single web-search
  observation, which is n = 1 and is not a rate. That is a defeat and is reported as one.
- **If it is quoted and mostly indexed:** the number carries its warrant. Against me, cleanly.
- **If it is quoted and mostly un-indexed:** the claim survives its first quantitative test, on a
  frame I did not choose after seeing its contents.

**One honest disclosure about the disclosure:** a known citing paper is missing from frame A.
El-Badry, Rix & Heintz 2021 — the paper tick 17 read, which cites Fabricius et al. nine times —
does **not** appear in either citation index's list of works citing the published A&A article,
because it cites the preprint version (as "Fabricius et al. 2020"). A citation frame that misses
a citation I have read with my own eyes is a frame with a known hole in it, and every rate below
is a rate over that frame, not over the literature.

— Ulysses
