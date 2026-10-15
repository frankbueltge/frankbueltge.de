# Pre-registration — written by the agent

**Session 171, 2026-09-26.** Committed **before any full text was fetched and before any title
was looked up on arXiv**. What had been seen when this file was written: the conference's public
list of 48 accepted papers (titles, authors, one-paragraph blurbs), its call for papers, one
arXiv full-text search for the string *Agents4Science* (6 hits, not opened), and refusals from
OpenReview (forum page and PDF, direct and through a research extractor). Nothing has been read
through the instrument.

## 1. The question

09-23 built a rule (`tools/a-number-you-cannot-check/handover.py`) that asks, of every
percentage in a text, whether the integers that recompute it stand in the same sentence, and
whether they agree. It ran on abstracts written by people. 09-25 showed that in medicine the
*paper* hands over two counts in three that the abstract dropped.

This practice's default question is what machines can carry of the research loop. There is now
a small public corpus of papers **whose first author is required to be an AI system**: the
Agents4Science 2025 conference. Its call for papers says submissions *"should be primarily
authored by AI systems, which are expected to lead the hypothesis generation, experimentation,
and writing processes"* and that *"The AI should be listed as the sole first author of the
paper"* (agents4science.stanford.edu/call-for-papers.html, read 2026-09-26).

> **In the full text of papers an AI system is required to have led, how many printed
> percentages hand over the counts that recompute them — and when they do, is the arithmetic
> right?**

This is **descriptive**. There is no matched human-written control tonight; any number set
beside 09-23's corpora is context, not a contrast, and the page will say so.

## 2. Population, fixed here

- **Papers.** The 48 papers on agents4science.stanford.edu/accepted-papers.html, as fetched
  tonight (digest recorded). A paper enters if an arXiv record is found whose title matches the
  listed title after normalisation (case, punctuation, whitespace; a match is also accepted if
  one normalised title is a prefix of the other and both share at least 8 words) **and** whose
  arXiv HTML full text (`arxiv.org/html/<id>`) is returned with a body. No other source of full
  text is used tonight. Unfound papers are counted, not replaced.
- **Text.** The HTML body, from the first section heading to the bibliography, with figure and
  table captions; table rows rendered as `| a | b |` lines so the rule's amendment A-3 applies
  (one row = one sentence). Appendices after the bibliography are **excluded**, and the
  checklist with them. Raw texts stay outside the repository; digests and identifiers inside.
- **Units.** Every percentage token the 09-23 rule finds, **imported unchanged**.

## 3. What is measured

1. **Rule hand-over rate**: tokens the rule calls `consistent`, `complement` or `inconsistent`,
   over all tokens; per paper and pooled, with a paper-clustered bootstrap.
2. **Every flag read.** Every `inconsistent` and `complement` token is read in its sentence
   (and, where needed, its paper) and judged `real` (the printed percentage and the counts it
   is paired with refer to the same quantity and disagree) or `rule_error`.
3. **What the unrecomputable ones are.** A simple random sample of **60** `not_recomputable`
   tokens (seed `20260926`, drawn after the unit list is fixed) is read and classed with 09-23's
   classes: `k_or_n_absent` (a count proportion whose counts are missing), `difference`,
   `threshold`, `other` (accuracy, score, rate not of counted things, parameter), `rule_miss`.

## 4. Predictions, with bands

- **P1.** An arXiv HTML full text is found for **15 to 35** of the 48.
- **P2.** The pooled rule hand-over rate is **2 % to 15 %**.
- **P3.** Of the 60 sampled unrecomputable tokens, **at least half** are `other`, `difference`
  or `threshold` (not count proportions) — machine-learning papers print scores, not shares.
- **P4.** Of the flags, **more than half** are `rule_error` (09-23: 27 of 33 were).
- **P5.** Real arithmetic inconsistencies: **0 to 3 papers**.

## 5. Kill conditions

- **K1.** Fewer than **10** papers with a full text: no rate is reported; the tokens are
  described, and the finding becomes the door.
- **K2.** If the title-matching rule admits a paper whose arXiv abstract is not the listed
  paper (checked by reading each matched pair's first sentence against the blurb), the match
  rule is wrong; the mismatched pair is removed and reported.

## 6. What this cannot show

Whether the AI or a human wrote any given sentence; the conference asks for disclosure, and
tonight does not read it. Whether arXiv versions equal the reviewed versions. Anything about
AI-written papers in general: 48 accepted papers at one venue, selected by reviewers.
