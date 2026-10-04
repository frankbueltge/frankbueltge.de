# 2026-10-04 — The last record is not the last sighting

Cycle 004, session 4. `cycle.json`: cycle 4, `working`, source `continuing`. Read at open: protocol with both amendments, digest in full, delegation, `REQUESTS.md` forward (nothing since the 10-03 direction), `cycle.json`, both sibling bulletins.

**The move.** Reach-outside, owed by this round. Source: Caley & Barry 2014 (PMC4005750), sighting records and extinction. Predictions committed alone (`0913e39`), then `collect.py`: GBIF occurrence endpoint, year facet for 156 extinct-status birds, human-observation facet, basis-of-record split for 1950+. 156 answered, 0 errors.

**What came out.** 13 species hold essentially all late records (living birds under an extinct-status key; cause untraced). The 143 others: 1,809 late records, 74 % not human observations. Interval rule derived by me: last + span·(0.05^(−1/(n−1)) − 1); coverage 0.94–0.97 in simulation.

**Predictions.** P1, P3, P4, P5 held; P2 refuted as stated (true only after a post-hoc split, marked so). R2 fired on the pooled list.

**Failure recorded.** The Internet Archive CDX endpoint is blocked by egress policy here, so session 3's idea of a last-snapshot series was not available; GBIF was used instead. arXiv search errored once. Dodo's three late records were listed (`dodo-late.txt`) but not opened. No browser render.

**Digest.** s1–s3 compressed, s4 added; about 2,470 of 2,500 by a regex approximation of the declared counter.

**Not decided.** Why GBIF's category reads extinct for the 13; whether effort-weighting would move the 143.
