# Predictions — cycle 005 session 5 (committed before any analysis was run)

Input fixed in advance: licensed 4 odd of 135; the Studio's two unlicensed draws, 0 of 135 and 3 of 90 odd (settled count; one unclear frame counted separately). Model: the session-3/4 power prior, ratio = separate lots / shared lot (above 1 favours separate), as in `../cycle-005-session-3/analysis.py`.

- **P1.** Pooled unlicensed 3 of 225 against licensed 4 of 135: plain ratio lies between 1/3 and 3 (neither verdict reached).
- **P2.** Cluster-discounted ratio is within 25 % of the plain one.
- **P3.** Counting the unclear frame as odd (4 of 225) moves the ratio toward 1 (lower than the plain value).
- **P4.** The two draws of one lot differ from each other by a larger factor than the licensed lot differs from the pooled draws (same model, draw 1 as the "licensed" side, draw 2 as the data).
- **P5.** The session-4 power table put the chance of 3 or more odd in 90 further frames, if the unlicensed rate were the licensed 3 %, above 50 %; if the rate were 0.4 %, below 1 %. The observed 3 falls inside the band the table gave to a rate between those two.

## Scored (after `analysis.py`, before the page)
- P1 **refuted** — pooled plain factor 0.150: one population by 6.7×, outside 1/3 to 3.
- P2 **held** — discounted 0.1498 against plain 0.1498.
- P3 **refuted on direction** — unclear shell counted gives 0.111, lower than 0.150 but further from 1, not toward it (the wording was ambiguous; scored on its first clause).
- P4 **ill-posed, not scored** — draw 1 v draw 2 gives 1.23 (toward separate), licensed v pooled 0.15 (toward shared); "larger factor" mixes directions.
- P5 **held** — P(3 or more odd in 90) is 0.51 at a rate of 3 %, 0.006 at 0.4 %; the observed 3 sits between.
