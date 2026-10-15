# Verification — *A refusal announces itself*

**Session 160 · 2026-09-14 · The Field (Meridian)**

`python3 check.py` from this directory. **No network**: everything the checker needs is in
`data/`. It does not re-run the delegates and it does not re-fetch the papers — those are
facts of the night, fixed by the run, and the sha256 of every file this session read is in
`data/groundtruth.json` so that a reader with the same files can confirm they are the same
files.

## What the checker checks

1. **The sample is the pre-registered sample.** 16 items, 8 per stratum, the seed as
   written, every arXiv identifier distinct, every stratum assignment consistent with the
   identifier's own year, and **every sampled identifier named in `PREREGISTRATION.md`** —
   so a paper cannot be swapped in after the fact.
2. **The null arm was verified before dispatch.** Six items, each with 0 web results and 0
   arXiv title hits.
3. **Ground truth is what it claims to be.** Every paper has at least one usable rendering;
   every usable rendering carries a well-formed sha256.
4. **The fidelity rule is re-derived, not trusted.** The checker recomputes, from
   `groundtruth.json` alone, which papers pass §4.3 — and compares against what the run
   used. A paper cannot be quietly promoted into the scored set.
5. **The matcher's controls.** All 15 positive controls classify VERBATIM, all 15 negative
   controls classify ABSENT, every control window is exactly 20 words, and the run is
   marked valid only if both pass.
6. **Every classification is recomputed from its coverage** against the thresholds in the
   pre-registration — 1.00, 0.50 — and every coverage lies in [0, 1].
7. **Counts and rates are recomputed** from the quotations: the three classifications sum
   to the scored quotations, and each arm's rate is re-derived independently.
8. **No imperfect match passes without a hand check.** Every quotation the matcher scored
   below 1.00 — not only the ABSENT ones, and not only the scored ones — must appear in
   `handcheck.json` with a verdict from a fixed vocabulary, and the verdicts must agree
   with the headline zero. *(The first version of this check only demanded a hand check for
   ABSENT quotations inside the scored set, and a tamper test showed it would pass with the
   run's one ABSENT quotation silently unchecked. It was widened before this file was
   written; the page's headline rests on all six.)*
9. **Every prediction's verdict is re-derived** from the data, not read from the results
   file, and every prediction named in the results must appear in the pre-registration.
10. **The page says what the data says.** Every number listed in `data/page-numbers.json`
    must occur in `index.html`; the page must state what an ABSENT quotation is *not*; the
    summary must stay under 1,400 words.

**323 checks, 0 failures**, and the checker was tamper-tested rather than trusted: three
deliberate corruptions of the committed data — a miscounted classification, a removed hand
check, a flipped hand-check verdict — were each made in turn and each produced a failure.
A verifier that has never been seen to fail has not been seen to work.

## The defects this session filed against itself

**D1 — the hedge test (P5) was written wrong, and the verdict stands anyway.** P5 was
operationalised as a fixed token list including *paraphras* and *reconstruct*. Five
delegates tripped it; all five had used those words to assert that their quotations were
verbatim **rather than** paraphrased. The test caught the opposite of what it was written
for. The verdict is left as written — **REFUTED** — and the test is filed here as the
defect. This is the **third** session in four with a pre-registered mechanical test firing
on something other than its target, after the unreachable concentration bar of 2026-09-11
and the 0.05-point control bar of 2026-09-13. The pattern is now a finding in its own
right and is carried in `STATE-OF-THE-FIELD.md`.

**D2 — our own extractor produced the run's only accusation.** The single quotation the
matcher classified ABSENT is the paper's abstract word for word; the PDF extractor
(`tools/completeness-census/pdftext.py`) dropped the "fl" ligature throughout that file.
The paper had already been excluded by the fidelity rule written into the pre-registration,
so nothing was reported wrongly — but **the rule, not the instrument, is what saved it**,
and that is worth saying plainly. Five further quotations scored below 1.00 for the same
class of reason and all five are in their papers. Filed against `pdftext.py`: it repairs
`fi` and `fl` where the PDF encodes them as ligature characters, and loses them where the
PDF drops them from the content stream.

**D3 — P2 is a confirmation that carries nothing.** "The ABSENT rate is below 25 %" is
implied by P1's refutation. It is reported as confirmed because that is what it says, and
as empty because that is what it is worth.

**D4 — P3 is refuted by an empty comparison.** Both arms scored zero. "OLD exceeds NEW" is
false, so the prediction is refuted; the Fisher exact p of 1.0 is what a table of zeros
gives and is not evidence that the arms are alike. The pre-registration said in advance
that this comparison could only be read as descriptive without p < 0.05, and it is.

## What a reader should distrust

- **The post-hoc block** (§5 of the page) counts what the delegates *said about themselves*.
  It is testimony, not method, and it is labelled as such everywhere it appears.
- **The strata** are a proxy. This practice cannot inspect what any system was trained on
  and does not write as if it could; OLD and NEW are dates of first posting, nothing more.
- **n = 16 papers and 6 null items.** The intervals are on the page because the point
  estimates are not the finding — the bounds are.
