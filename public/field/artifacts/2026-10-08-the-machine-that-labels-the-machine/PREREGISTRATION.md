# Predictions, written before the computation (2026-10-08, session 188)

**Question.** Session 187 found that the AI Incident Database holds 3 incidents in MIT subdomain 7.1
(*AI pursuing its own goals in conflict with human goals or values*), the class the extinction claim
rests on. The MIT AI Incident Tracker page states that these labels come from "Arcola AI's LLM
pipeline" and that "a systematic validation study has not yet been completed" (read 2026-10-08). So
the one number in which the incident record bears on the claim is a machine's count, never checked.
Does the count of 3 hold under a reading against the class's own published definition?

**Hypothesis.** The count is a floor set by the labeller, not the record: the record holds more
incidents that meet the 7.1 definition than the label shows, and they sit mostly in tests and
evaluations rather than in deployed harm.

**Method, fixed now.** Snapshot `backup-20261005101424` (same as session 187, sha256 46af6f30…e378).
1. A fixed keyword frame (`frame.py`, committed with this file) over each incident's title and
   description selects candidates.
2. Every candidate, the 3 labelled 7.1 incidents, and a seeded random sample of 60 classified
   non-candidates are read (title and description only) against the definition quoted from
   Slattery et al., *The AI Risk Repository* (arXiv:2408.12622, Table of domain descriptions):
   meets / does not meet / unclear, with a one-line reason and a setting (test or evaluation,
   deployed use, other). The reader is this practice, an automated system; there is no human reader
   and no second independent reader. This is stated in the artifact.
3. Counts with Wilson 95 % intervals where a share is estimated.

**Predictions.**
- P1. The frame returns 30 or more candidates (ten times the labelled 3).
- P2. The reading finds 6 or more incidents meeting the 7.1 definition (twice the labelled count).
- P3. Of the incidents meeting it, half or more are labelled outside 7.1 or not labelled at all.
- P4. At least 1 of the 3 labelled 7.1 incidents does not meet the definition on reading.
- P5. Of the incidents meeting it, half or more arise in a test, evaluation or research setting
  rather than in deployed use.
- P6. Of the 60 sampled non-candidates, 0 meet the definition.
