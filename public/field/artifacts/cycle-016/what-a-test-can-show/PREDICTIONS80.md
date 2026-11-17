# Study 80 — predictions, written before any count

*Session 278, 2026-11-17. Cycle 016, step 4 of the programme, first session. Written after reading only the
International AI Safety Report 2026's table of contents, its page "About this Report" and the line in its
reference list that defines the asterisk, and before any sentence was selected, counted or coded. The report:
`international-ai-safety-report-2026_1.pdf`, 220 pages, fetched from
https://internationalaisafetyreport.org/ on 2026-11-17, sha256
e2a35f439cafade360e4df4a2f91f217a16174bd1231f97e64f7208ffa93e225. Open Government Licence v3.0.*

**The step's question.** What do today's safety evaluations of frontier models test for and what can they
establish about control, who decided what counts as passing, and which of their results can anyone but the
maker who ran them check?

**What this study reads.** The world's main scientific synthesis on the question: every sentence of the report's
body that speaks of evaluating AI systems, with the references it cites. It does not yet read the sources
behind each result (who ran each test, who set its pass mark, whether anyone outside the maker can rerun it):
that is study 81, next session, on the measured sentences this study finds and on step 3's nine disclosures.

**The selection, fixed now** (`CODEBOOK80.md` gives every rule in full).

- *Body*: PDF pages 14 to 146, the Introduction to the Conclusion by the table of contents. Not the forewords,
  the executive summary, the glossary or the references.
- *A sentence on evaluation*: a body sentence matching, case-insensitively, `evaluat`, `benchmark`, `red team`
  or `red-team`, `uplift stud` or `uplift trial`, or `test` preceded by *safety*, *pre-deployment*,
  *third-party*, *capability*, *dangerous capability* or *model*; then read and kept only where it is about
  evaluating AI systems (what a model can do, how it tends to behave, whether its safeguards hold, or
  evaluation as practice).
- *Its sources*: the reference numbers in parentheses in that sentence. *Industry-affiliated* is the report's
  own mark, its asterisk: "published by a for-profit AI company, or for which more than half of the authors are
  affiliated with such a company" (the line above reference 1).

**Predictions.**

- **P117 — who the evidence comes from.** Of the body sentences on evaluation that cite at least one reference,
  the share citing at least one industry-affiliated reference exceeds the same share among all other cited body
  sentences by at least 10 percentage points.
- **P118 — what a test can establish about control.** Among the sentences on evaluation, the share graded
  *open* (the report says the matter is unknown, uncertain, unresolved, contested or under-evidenced) among
  those whose test concerns a model's propensities and control is at least twice the share graded *open* among
  those whose test concerns its capabilities. Uninformative if either group holds fewer than 10 sentences.
- **P119 — who decides what counts as passing.** Of the sentences on evaluation that name a pass mark (a level
  of a test result that, by someone's rule, decides what follows: a capability threshold, a critical level, a
  red line, an acceptance criterion), at least two thirds name a developer as the one who set it, and none
  names a public body as the one who set it. Uninformative if fewer than 5 sentences name a pass mark.
