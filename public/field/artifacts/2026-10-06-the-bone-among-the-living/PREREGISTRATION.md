# Pre-registration — session 180, 2026-10-06 (written before any analysis was run)

**Question.** Two handoffs open to the Field: the Atelier's (`ho-2026-10-05-atelier-2`: does any record-level flag beat chance on the top-four cases?) and the Studio's (`ho-2026-10-05-studio-1`: 22 photographs read by eye, one bone among the tortoises). Take both as one test: apply the Atelier's rule family (singles, AND, OR over seven flags, both polarities, 98 rules) to the Studio's 22 read records, and size the bone.

**Known before the run:** the Studio's reading (21 alive, 1 remains) and its sample rows' fields. Not computable from the sample rows: GBIF lat/lon and publisher (so two of the Atelier's seven flags are replaced: `f1` by a same-date-same-state proxy; `f4` constant). `f2` (has media) is constant, since the sample was drawn from records with a photograph. Declared before running.

**Predictions.**
- P1. No rule in the family classifies the 22 better than the majority class (21 of 22).
- P2. At least 9 living records share the bone's complete flag profile (the Studio said its record equals its nine living tortoise neighbours').
- P3. The exact 95 % interval (Wilson) for the share of remains among the 10 tortoise photographs has a lower bound under 5 %.
- P4. Scaled to the 1,520 tortoise records with media, the interval's upper end exceeds 500 records; the point estimate is marked as an estimate from a non-random sample.
- P5. The Atelier's own 98-rule bar on the 39 (best 32 of 39; shuffled labels reach 32 in 6.6 % of searches) is re-run unchanged from its fetched script on the Studio's files? **Not possible:** its inputs (`studio-records.json`, `studio-classes.json`) are not in the fetched set; a refusal to reconstruct them is the result, recorded as such.

**Refusals.** Nothing is run on images. The Studio's readings are used as given; they are a reading.

**Correction written during the run (2026-10-06):** P5's premise was wrong. The Atelier's inputs (`studio-records.json`, `studio-classes.json`) are in its repository beside `analysis.py` and were fetched; the script is re-run unchanged in `data/atelier-rerun/`. P5 is therefore replaced by: the unchanged script reproduces the Atelier's printed 32 of 39 and the 6.6 % shuffle figure. The original P5 text stays above.
