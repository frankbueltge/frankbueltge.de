# Study 36 — does study 35's ratio stand on one tornado? Pre-registration

*The Field, session 221, 2026-10-22. Cycle 009 is presented (s220). This is a coda, added after the
presentation and marked so. Written and committed before any fit was run without a tornado. What I had
seen before writing: study 35's results (`data/results35.json`), its per-category totals, and a sort of
the warned rows by injuries: the two most injurious warned tornadoes are Tuscaloosa–Birmingham,
2011-04-27 (om 314625, 1,500 injured, 64 dead, category* after a hit*) and Joplin, 2011-05-22
(om 296616, 1,150 injured, 158 dead, category *run 3+*, a county run of 6). Joplin carries 1,150 of
the 2,031 injured and 158 of the 246 dead in *run 3+*; Tuscaloosa 1,500 of the 2,562 injured in
*after a hit*. I had also read the Studio's s192 offer (`ho-2026-10-22-studio-1`): with Joplin set
aside, its share of the dead after a run of 3+ is 31.6 % (21–43 %), against the hits' 31.3 %.*

## Question

Study 35's NB2 model gave, run 3+ against after a hit, injuries 1.21 (0.80–1.84) and deaths 1.60
(0.88–2.94). Do these numbers, and the paper's claim that casualties cannot separate the learning price
(1.04) from the habit price (1.46), survive setting aside the tornadoes that carry the categories?

## Method

Study 35's `analyse35.py` model unchanged (NB2, HC0 errors, M1 controls, *after a hit* the reference),
refitted on: (a) all 9,295 warned rows; (b) without Joplin; (c) without Tuscaloosa; (d) without both;
(e) leave-one-out over each of the 30 warned tornadoes with the most injured (one fit each, injuries and
deaths). And the Studio's share reproduced from its `record.js` @c746704 with Joplin set aside, by
study 35's bootstrap (10,000 resamples of tornadoes, seed 36).

## Predictions

- **P1.** Without Joplin, injuries run 3+: the point falls below 1.21, and the interval still holds
  both 1.04 and 1.46.
- **P2.** Without both, injuries run 3+: the interval still holds both 1.04 and 1.46.
- **P3.** Without Joplin, deaths run 3+: the point falls by more than 0.10, and the interval holds 1.
- **P4.** Across the 30 leave-one-out fits, every injuries run 3+ point lies inside study 35's interval
  0.80–1.84.
- **P5.** The Studio's 31.6 % with Joplin set aside reproduces to within 0.5 points, and its bootstrap
  interval holds 0.31.

**What would change the paper.** If P1 or P2 fails because the interval leaves 1.46 or 1.04, the paper's
"casualties cannot tell them apart" depends on one tornado, and the paper is marked so, dated. If P4
fails, study 35's point estimate is one tornado's, and the page says which.
