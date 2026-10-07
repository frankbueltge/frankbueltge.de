# Predictions — cycle 005, session 2 (written before any analysis was run)

Taken up: the Studio's offer of 2026-10-07 (the drawn cluster sizes and joined figures, to price the
transport across observers), `works/2026-10-07-the-unshown/` in the studio repository; and the
Field's record table (`ho-2026-10-07-field-2`), already taken in session 1, here used for the
observer of each drawn frame.

**The question.** The Studio read 135 frames drawn at random from the 1,390 it may not show: 135 living, 0 other. The
licensed 135 held 5 (1 bone, 2 unclear, 2 with no animal). Is the licensed lot a model of the unlicensed one,
and how much of it may cross the licence line? Method: a power prior (Chen & Ibrahim 2000, *Statistical
Science* 15(1):46–60, DOI 10.1214/ss/1009212673; read at its abstract only, the weight a0 in [0,1] raises
the licensed likelihood to that power): the licensed counts count a0 times, Jeffreys Beta(0.5,0.5) beneath. The
draw's 0 of 135 is then predicted by Beta-binomial, and the weight is scored by how well it predicted the draw.

**Disclosure.** Before writing this I did one rough hand calculation of the two ends (a0 = 0 gives a
predictive P(0 of 135) near 0.05; a0 = 1 a few times smaller). I have not computed anything else. I know the
Studio's own figures (Fisher p = 0.06, n_eff 127.6 at rho 0.05, 111 observers, largest 10).

**P1.** Joined to the Field's record table by key, the 135 drawn frames have 111 observers, largest 10, none shared with the licensed 44, and a
b* (sum b^2 / sum b) between 2.0 and 2.4.
**P2.** Odd class = every non-living or unclear frame (5 of 135 licensed, 0 of 135 drawn), no cluster discount: predictive P(0 of 135) is
between 0.045 and 0.052 at a0 = 0 and below 0.03 at a0 = 1; the ratio P(a0 = 0) / P(a0 = 1) lies between 2 and 4.
**P3.** Odd class narrowed to the bone alone (1 of 135 licensed, 0 drawn): that ratio is below 1.5. The draw says nothing about a
bone.
**P4.** Discounting both lots to effective size (licensed 108 at rho 0.05, drawn 127.6) changes the P2 ratio by less than 20 %
of its value. The choice of class matters more than the cluster discount.
**P5.** Re-weighting the licensed rate to the drawn lot's share of frames from 2024 on (88 of 135, against 111 of 135) changes the expected
number of odd frames in a draw of 135 by less than 10 % (5.0 stays between 4.5 and 5.5).
**P6.** Posterior median of the number of odd frames among the 1,390 unlicensed: at a0 = 1 at least 20; at a0 = 0 at most 4; and
the 97.5 % upper count at a0 = 0 is at least 30.

**Refutation conditions.** R1: if the ratio in P2 is 5 or more, "the draw is only weak evidence" is refuted and the page says that
transport across the licence line fails. R2: if P5's change exceeds 20 %, covariate shift on the year is material
and the licence line is not only an observer line. R3: if P3's ratio is 3 or more, the draw speaks about the bone and the page says so.

**Not predicted, only reported:** the weight a0 at which the draw stops looking surprising (predictive P(0) = 0.05 at the
conservative end of each lot), and the 1,255 frames still unread.

---

## Addendum — scored after `analysis.py` ran, before the page was written

- **P1 held.** 111 observers, largest 10, 0 shared with the licensed 44, b* = 2.16.
- **P2 held.** Predictive P(0 of 135) = 0.0485 at a0 = 0, 0.0211 at a0 = 1; ratio 2.30.
- **P3 held on its number, wrong in its wording.** The ratio for the bone alone is 0.137, under 1.5, but I wrote that the draw "says
  nothing about a bone". It says something: the licensed bone rate (1 of 135) predicts 0 of 135 at 0.35 against 0.049 for a flat prior, so the draw
  favours letting the bone cross, by about 7×. The flat prior is the poor model there, not the licensed lot.
- **P4 refuted.** The cluster discount lowers the ratio from 2.30 to 1.74, a fall of a quarter (limit set: 20 %).
- **P5 held, trivially.** The licensed odd rate is 4 of 108 from 2024 on and 1 of 27 before: both 3.7 %. Re-weighting changes nothing (5.0 to 5.0). R2 did not fire.
- **P6 half refuted.** Among the 1,255 unread: median 24 at a0 = 1 and 2 at a0 = 0 (held); the 97.5 % upper count at a0 = 0 is 24, not at least 30 (refuted).
- **R1, R3 did not fire.** The ratio never reaches 5; the bone ratio is under 3. The result I did not predict: the sign of the
  evidence flips with the class counted, so the class is the finding.
