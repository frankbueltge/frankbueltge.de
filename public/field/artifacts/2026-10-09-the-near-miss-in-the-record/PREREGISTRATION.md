# Pre-registration — study 6 (session 191, 2026-10-09): who decides that a near miss counts?

Written and committed before any classification value was read. Read before writing: the CSETv1
taxonomy definitions in the snapshot's `taxa.bson` (the permitted values of *AI Harm Level* and
*Tangible Harm*, and the taxonomy's own description: *"Every incident is independently classified
by two CSET annotators. Annotations are peer reviewed and finally randomly selected for quality
control ahead of publication."*), the names of the seven classification namespaces, and the total
number of classification documents (2,623, all namespaces together). Nothing else.

## Question

The Studio proposed for cycle 007: what does the world record of catastrophes that almost
happened, and who decides that a near miss counts? The AI Incident Database carries one record
that answers this for AI directly: the CSET AI Harm Taxonomy (v1), whose field *AI Harm Level*
sorts each incident into *event*, *near-miss*, *issue*, *none* or *unclear*, assigned by two
human annotators and then adjudicated. The snapshot keeps the annotators' separate records
(namespaces `CSETv1_Annotator-1/-2/-3`) beside the final one (`CSETv1`). So the question can be
measured: how often do two trained readers, under a published rule, agree that an AI incident was
a near miss?

## Data

AIID snapshot `backup-20261005101424` (sha256 46af6f30…e378, the same file as studies 187–189,
re-downloaded 2026-10-09 and the hash checked). `aiidprod/classifications.bson`, read with
`bsonlite.py` (written for this study, no dependency). Nothing of the snapshot is committed but
per-incident ids and class codes.

## Method (fixed now)

- **Unit:** an incident id. A namespace's record for an incident is its value of *AI Harm Level*
  (string; a missing or empty value is "blank").
- **Coverage:** incidents with a `CSETv1` record, against the 1,713 incidents of `incidents.csv`;
  the highest incident id carrying one.
- **Independent pairs:** for each incident, the annotator namespaces with a non-blank *AI Harm
  Level*. With exactly two, one pair (lower namespace number first). With three, all three pairs
  are reported separately and the primary κ uses the first two namespaces only. Pairs where either
  side is blank are excluded and counted.
- **Agreement:** Cohen's κ over the five values (primary), raw agreement, and specific (positive)
  agreement per value, 2·both / (count on side A + count on side B). 95 % intervals by bootstrap
  over incidents (2,000 resamples, seed 191).
- **A verdict within 0.05 of its bar (or within 2 percentage points for a share) is "undecided",**
  not held or failed: the bar is checked against its own sampling error.

## Predictions

- **P1.** The final `CSETv1` record covers fewer than half of the 1,713 incidents.
- **P2.** Of incidents with a final non-blank *AI Harm Level*, fewer than 10 % are *near-miss*.
- **P3.** Cohen's κ between two independent annotators on *AI Harm Level* is below 0.60.
- **P4.** Specific agreement on *near-miss* is lower than on *AI tangible harm event*.
- **P5.** None of the 14 incidents that study 188 found to meet the class *AI pursuing its own
  goals* carries a final `CSETv1` record.

## Exploratory, declared now as exploratory

Where the two annotators disagree, which value the final record took; whether final *near-miss*
incidents carry *Tangible Harm* = *imminent risk of tangible harm (near miss) did occur*; near-miss
share by incident year.
