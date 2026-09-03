# Method — Who may hide a prompt

## Cohort

Twelve source URLs read at source on 2026-09-03, comprising nine
venue-year policy documents (some venue-years span multiple URLs — ICML
2026 has four URLs read as one policy corpus; CVPR 2026 has two). The
cohort was fixed in `PREREGISTRATION.md` before any URL was coded.

Excluded on purpose: AAAI 2026 (runs a conference-managed AI-assisted
review; a different object than "human reviewer using an LLM"). Named
in the pre-registration; not scored.

## Fetching

Each URL was fetched through this session's web tool. For four URLs
(ICML 2026 Peer Review Ethics, NeurIPS 2026 Main Track Handbook,
SIGGRAPH 2025 Technical Papers, and the ICML 2025 page whose fetched
content was cross-verified against the sentence-level query), a
second fetch with a sharpened query was made to obtain verbatim
passages or to confirm the absence of a passage the first pass had
paraphrased. The second-pass results are the ones written into the
evidence files.

## Coding

Each of the four axes (A1 author-side rule, A2 reviewer-side LLM rule,
A3 venue-embedded probe, A4 accountability) was coded from the
verbatim passages archived in `data/policy_pages/<venue-year>-<slug>.md`.
A row's code on an axis is a function of the passages archived under
its `evidence_files` column in `data/cohort.csv`. `check.py` enforces
that every non-`silent` code carries a non-empty `evidence_<axis>`
field.

## A3-external

For A3 only, a fifth line of evidence is admitted: an identifiable
named source at a named venue, in a masthead-carrying outlet. In this
session, one such source qualifies: The Transmitter's article
attributing venue-embedded probes to ICML 2026 (already `deployed` at
own record) and NeurIPS 2026 (own record `silent`). Filed under
`data/policy_pages/attributions/`.

## Kill conditions

Two, pre-registered:

- **Door-census kill:** if ≥ 7/9 A1 codes are
  `explicit-forbidden-with-consequence`, the receiver door is
  universal, and the publishers-have-no-door frame does not carry to
  venues.
- **Link kill:** if ≥ 3/9 A1 codes are pure `silent`, a share of the
  cohort has not articulated the receiver side at all.

## Prediction

If at least one venue-year both forbids authors on A1 and either
`deploys` or `permits-not-deployed` on A3, the rule turns on the
identity of the actor at that venue.

## Falsifier

If every venue-owned probe were restricted to a category no author is
permitted (e.g., passive detection without steering the review), the
rule would be on the act, not the actor, and the boundary-of-consent
frame would not carry.

## What is not attempted

- No count of how many prompt injections were detected in reality.
- No claim about effectiveness or deterrence.
- No policy recommendation.
- No claim about venues outside the cohort.

## Reproducibility

`python3 check.py` re-derives every headline number and verifies the
evidence-presence rule. A green run is a necessary but not sufficient
condition for the numbers on the artifact page — a reader who wishes
to verify at source should open each URL in `data/policy_pages/`
and check the quoted passage against the current live page. Silent
policy edits at the venue will not be caught by the check; they
require re-fetching.
