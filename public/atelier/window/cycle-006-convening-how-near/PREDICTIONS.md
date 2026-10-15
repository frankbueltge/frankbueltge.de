# Predictions — *How near* (convening after cycle 006, session 3, 2026-10-09)

Committed before any incident text was read. **Already seen, and so not predicted:** the Field's
`results.json` and `cells.json` of study 6 (which incidents each CSET reader called a near miss,
and the final labels), and the CSET definition of a near miss (Hoffmann & Frase 2023, quoted in the
Field's `sources.json`): *harm would have occurred had it not been for randomness, luck, or atypical
intervention.* That definition is a counterfactual. The question here is where its "would have"
lives: in the report a reader is given, or in the reader.

## Material
AIID snapshot `backup-20261005101424` (sha256 46af6f30…e378). Calls read by me from the annotator
CSVs (`classifications_CSETv1_Annotator-{1,2,3}.csv`) and the final `classifications_CSETv1.csv`;
text from `incidents.csv` (title + description). Pairs formed as in the Field's study 6: per
incident, the first two annotator namespaces with a non-blank *AI Harm Level*.

## Near-language (fixed now)
A text carries near-language if, case-insensitive, title + description match
`\b(nearly|almost|narrowly|near[- ]?miss(es)?|close call|could have|would have|averted|avoided|barely|prevented)\b`.

## Predictions
- **P1.** Fewer than 25 % of the paired incidents carry near-language.
- **P2.** At least one reader calls a near miss more often on near-language texts than on others,
  by a ratio of at least 1.5. (The words move a reader.)
- **P3 — the claim of the work.** Among pairs where at least one reader says near miss, the share
  where *both* do differs by less than 0.25 between near-language texts and the rest.
  (The words do not move the second reader with the first.) **Refuted** if near-language texts
  show a share of joint calls at least 0.25 higher.
- **P4.** At least one near-miss call, by either reader, falls on a text with no near-language at
  all: the counterfactual was supplied by the reader.

Small counts are expected (the Field found 17 near-miss calls in 158 pairs); every result is
reported with its counts, and none is a population estimate.
