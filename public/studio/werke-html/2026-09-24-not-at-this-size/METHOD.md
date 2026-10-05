# METHOD

## What was transcribed, and how

`data.json` holds every number this work uses, copied by hand from Buolamwini & Gebru's
"Gender Shades" (PMLR 81:1–15, 2018), read in full at its own address
(`proceedings.mlr.press/v81/buolamwini18a/buolamwini18a.pdf`) rather than from an abstract or
secondary summary. Table 2 (page 7), Table 3 (page 7), Table 4 (page 9) and Table 5 (page 10)
are transcribed exactly as printed, to the one decimal place the paper itself uses. Page 8's
prose sentence stating South Africa's lighter/darker split as counts as well as percentages is
transcribed separately, as the one independent check this reconstruction has against the
paper's own words rather than against itself.

No number here is estimated, interpolated, or drawn from any source outside those five
locations in one paper.

## The rounding rules

A percentage printed to one decimal place is the output of some rule applied to a fraction
k/n. Three rules are in ordinary use, and Gender Shades never states which one it followed
(this is not unusual — this house's own OF HOW MANY, the night before this work, found that
the choice among these three rules only ever changes the printed digit for four denominators
in the world at one decimal place, which is exactly why it is so rarely stated and so rarely
missed):

- **round-half-up** — the everyday convention, ties rounding away from zero;
- **round-half-to-even** ("banker's rounding") — ties rounding to the nearest even digit;
- **truncation** — the fractional digit dropped outright, no rounding at all.

`analysis.py`'s `printed_value(k, n, rule)` implements exactly these three, in exact
`Fraction` arithmetic — no floating-point number appears anywhere in this work's computation,
because floating-point rounding is a fourth rule of its own and a different subject (as OF HOW
MANY noted).

## Part one: reconstructing a table from its own marginals

For a single percentage, `candidates(pct, n, rule)` finds every integer k in [0, n] that
prints exactly that percentage under that rule — usually one or two counts, occasionally more
near a rounding boundary, sometimes none if the percentage cannot arise at that size at all
(which never happens in Table 2, since every percentage there was computed from a real count
at that exact size).

Table 2's rows are not single percentages, though — each row states eight, and the eight are
bound together by four arithmetic identities that don't depend on anything outside the row:

    DF + DM = Darker      LF + LM = Lighter
    DF + LF = F           DM + LM = M
    DF + DM + LF + LM = n

`solve_row()` finds every quadruple (DF, DM, LF, LM), drawn only from each count's own
candidate set, that satisfies all four identities simultaneously. On every one of Table 2's
nine rows, exactly one quadruple survives — even though five of the nine rows have at least
one individually ambiguous percentage. The ambiguity is real at the level of one percentage
and gone at the level of the row.

This is a stronger method than testing a single percentage against a single hypothesised
denominator (this house's OF HOW MANY, 2026-09-23): it recovers what a whole table's own
internal structure will bear, using nothing from outside the table.

## Part two: auditing what the composition licenses

Table 4 and Table 5 report each classifier's true positive rate (TPR) by subgroup. TPR, unlike
the error rate and false-positive rate columns also printed there, is the one quantity that is
directly count-over-size for its own subgroup (error rate is simply 100 minus the printed TPR,
a derived column rather than an independent measurement; false-positive rate for one gender is
the error rate of the *other* gender, by the metrics' own definition — testing either against
a subgroup's own size would be testing the wrong thing). TPR is what `audit_cell()` tests.

Each of the 39 TPR cells (27 in Table 4 across nine subgroups and three classifiers, 12 in
Table 5 across the four intersectional subgroups) is checked against the denominator Part One
recovered for that subgroup. A cell is:

- **ok** — printable under round-half-up or round-half-to-even (the two conventions that
  agree everywhere except at an exact tie, which the census in OF HOW MANY showed occurs for
  only four denominators in the world at this precision, and none of the sizes in this work
  are among them);
- **trunc-only** — not printable by rounding, but printable if the paper truncated;
- **broken** — not printable under any of the three, at this exact size.

For every broken cell, `nearest_denominator()` searches outward from the stated size (both
directions, closest first) for the nearest population at which the printed percentage becomes
exactly printable, under each rule separately, within a window of 80.

## What was checked, and what would show this method wrong

- The South Africa row's reconstructed counts (154, 192, 27, 64 for DF/DM/LF/LM) were checked
  against the paper's own prose statement of 346 darker and 91 lighter faces — the only place
  in the whole paper where a count appears outside a percentage. They agree exactly. If they
  had not, the reconstruction method itself would have been shown broken, not just this one
  application of it — and the whole page would say so instead of proceeding.
- Every one of the nine Table 2 rows was solved independently; had any row admitted zero or
  more than one consistent quadruple, that row's own composition would be irrecoverable and the
  page would report an ambiguity rather than a single set of counts. None did.
- `verify.mjs` rewrites the rounding rule, the row-solver and the full 39-cell audit from
  scratch in JavaScript, with no import from `analysis.py`, and checks its own results against
  `results.json` cell by cell. It also opens `index.html` in a real Chromium browser with
  scripting on and with scripting off, confirms nothing is fetched over the network in either
  state, and works the page's one control (a pair of CSS radio tabs) by hand.

## What this method does not, and cannot, establish

- **Cause.** A subgroup accuracy figure whose printable denominator differs by one to four
  faces from the demographic count is consistent with several ordinary explanations — a face a
  classifier's own detector failed to return a result for, a rounding convention different from
  the one the rest of the table happens to satisfy, a transcription error in a paper written
  under a conference deadline. This work has no way to distinguish among these, and does not
  claim to. It reports only that the demographic denominator, taken at face value, does not
  reproduce the printed figure — and how far off the nearest one that would is.
- **Anything about the classifiers' actual fairness.** The paper's central finding — that all
  three classifiers perform far worse on darker-skinned women than on any other group — does
  not depend on the exact denominator in the way this work tests; a discrepancy of one to four
  faces changes an error rate by well under a percentage point at these sizes. This work is
  about whether a number can be checked, not about whether the disparity it describes is real.
- **Anything about the other 34 cells beyond "this arithmetic is consistent with what was
  printed."** Consistency is not proof that the reported figure is correct — only that it is
  not arithmetically impossible at the size in question, which is a much weaker claim, and the
  one this house's OF HOW MANY made carefully the night before.
