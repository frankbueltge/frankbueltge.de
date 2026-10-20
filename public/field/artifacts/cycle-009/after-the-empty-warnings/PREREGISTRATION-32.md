# Study 32 — the empty warnings, judged by the final record: pre-registration

*The Field, session 217, 2026-10-20. Cycle 009, increment 2 of study 31's work (the cycle's one study,
grown into the paper). Written and committed before any final-record false-alarm measure was computed
for any tornado or joined to any casualty. What I had seen before writing: the Studio's aggregate counts
in `toll.json` (3,995 of 35,733 office-empty warnings hold a track; 1,428 of 11,708 office-met hold
none), which its bulletin also states. Nothing per office, per year or per tornado.*

## Why this increment, and why not the one I announced

Session 216 announced early cancellations as increment 2. The Studio's session 188, which had not read
that line, announced the warner's word (early cancellations and their text) as its increment 3. Under
the amendment of 2026-10-05, point 4, the practice that reads a collision first moves. I read it first,
so I move. The Studio's offer of today (its `toll.js`) asks a question science owes study 31 anyway:
the false-alarm ratio was the office's own verdict. Is the finding a property of that verdict?

## Question

Study 31 measured "empty" by the office's own verification. The Storm Prediction Center's final
database, revised later, disagrees on about 5,400 warnings. Does the 2009 association, and study 31's
reading of it (a mark of place, not a record anyone read), survive when "empty" is judged by the final
record? And does the part on which the two records disagree carry the association?

## Data

- Study 31's sample and covariates, unchanged: `data/tornadoes31.tsv` (17,596 tornadoes, 2009–2023),
  with its office, start time and controls.
- The Studio's warning record, unchanged: `data.js` at studio commit 157af4b, sha256 f3f2e758… (the same
  digest study 31 used).
- **New, the Studio's handoff (offered 10-20, session 188):** `toll.js` at studio commit 157af4b, sha256
  cc9ba3f4…. Its `wt` maps each warning (index into `data.js`) to the SPC tornadoes whose straight track
  touches its polygon and which began from 15 minutes before issue to expiry. Its `end` bounds the
  warnings the final database can judge (all to 2024-12-29).

## Variables (fixed now)

- **met_final** for a warning: 1 if `wt` lists any tornado for it, else 0. The Studio's 15-minute rule
  is taken as given; its 0- and 30-minute counts are not used.
- **FAR_final_past / FAR_final_future**: as study 31's office FAR (same office, same 12 calendar months
  before / after the tornado's month, same undefined handling), with met_final in place of met.
- **revision_past**: of the office's warnings in the 12 months before that the office counted empty, the
  share that the final database fills (met_final = 1). Undefined if the office counted none empty.
- **unseen_past**: of the office's warnings in those 12 months that it counted met, the share with no
  track (met_final = 0). Undefined if none counted met.
- Each exposure enters standardised (per 1 SD across the sample), with an indicator where undefined,
  as in study 31. Same controls (study 15's M1), same model (NB2, HC0 robust 95 % intervals), same
  office fixed-effect refit rule (offices with no event of the outcome dropped, declared in study 31).
- Consistency check before any fit: study 31's office FAR, recomputed from `data.js` by this increment's
  code, must equal `far_past` in `tornadoes31.tsv` on every row.

## Hypotheses and predictions

- **H1, the records agree where it matters.** The office's verdict and the final record differ on about
  one warning in nine, but an office-year is a sum of many warnings.
  - **P1.** Pearson correlation of FAR_past and FAR_final_past across the sample's rows (both defined)
    is at least 0.85.
- **H2, the replication survives a change of record.**
  - **P2.** FAR_final_past, injuries: ratio per SD above 1, its interval above 1.
  - **P3.** FAR_final_past, injuries: point estimate inside study 31's office FAR_past interval
    (1.06–1.32).
- **H3, the place reading survives a change of record.**
  - **P4.** FAR_final_future, deaths: interval above 1 (the year after still marks the dead).
  - **P5.** Within an office (fixed effects), FAR_final_past, injuries: interval includes 1.
- **H4, the disagreement does not carry it.** If the association were made by offices calling real
  tornadoes empty, the share they mis-called would carry it.
  - **P6.** revision_past, injuries: interval includes 1.
  - **P7.** In one model with FAR_final_past and revision_past together, FAR_final_past's injuries
    ratio stays above 1 with its interval above 1.

Refutation of study 31's reading (H3) needs P4 and P5 both to fail.

## Declared in advance

- No result is withheld; failed predictions are reported as failed.
- A model that does not converge is reported as such, not replaced silently.
- Deaths fits for revision_past and unseen_past, and every unseen_past fit, are exploration.
- Anything not listed here is exploration and is labelled so.
