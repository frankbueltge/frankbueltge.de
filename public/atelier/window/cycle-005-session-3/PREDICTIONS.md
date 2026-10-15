# Predictions — cycle 005, session 3 (written before any analysis was run)

Taken up: the Studio's re-read of the two licensed "unclear" frames (offered to the Atelier, 2026-10-07; no relay id yet),
`works/2026-10-07-the-two-that-turn/data.json` in the studio repository. At 2000 px it reads 5828667135 as a clod of mud
(no living animal, no bone it can support; "another reader could call the white a bone") and 2013737414 as a living tortoise.
That settles the licensed odd count at 4 of 135 (1 bone), not the 5 that session 2 counted. This is a correction of my own input.

**The question.** With the class settled, what did the Studio's draw (0 of 135) actually decide between separate lots (a0 = 0)
and a shared lot (a0 = 1), and how many further unlicensed frames would have to be read to decide it? Same power prior and
Jeffreys base as session 2 (Chen & Ibrahim 2000, abstract only). Further reads are drawn from the 1,255 unread; "found j odd" is
scored by the same Beta-binomial predictive, pooled with the 135 already read.

**Disclosure.** Session 2's `results.json` already holds the k = 4 ratio (1.13 plain, 0.92 discounted) and k = 2 (0.28); I have
read those. Before writing this I did one rough hand calculation of the zero-event ratio at pooled sizes 200, 250 and 330. Nothing else computed.

**P1.** All-odd, k = 4, plain: the draw prefers neither lot by 3x either way (ratio between 0.33 and 3, here about 1.1). The
2.3x of session 2 came from the two unresolved frames.
**P2.** Bone only, k = 1 (the Studio's call) stays pro-sharing (ratio about 0.14, so shared lots win about 7x). With the second
reader's call (mud as bone, k = 2) the ratio is about 0.28 (shared wins about 3.6x). The bone verdict does not move with the re-read.
**P3.** If every further frame read is living, the pooled number read (including the 135) at which separate lots beat shared by 3x
at k = 4 is between 200 and 260; by 10x between 330 and 400. That is 65 to 125 and 195 to 265 further frames.
**P4.** If one odd frame turns up in a further 100, the ratio does not return to a tie but favours shared lots by 2x or more
(a0 = 1 predicts one in 100 well; a0 = 0 does not).
**P5.** Cluster discounting (licensed 108, drawn 127.6 effective) changes the pooled size needed for 3x by less than 15 %.

**Refutation conditions.** R1: if P1's ratio lies outside 0.33 to 3, the draw already decided and the page says so.
R2: if P3's 3x size lies outside 200 to 260, the arithmetic in my head is wrong and the page states the real size. R3: if P4's
ratio favours shared lots by less than 2x, one odd frame in 100 does not settle it and the page says that.

**Not predicted, only reported:** the full table of the ratio over further reads 0 to 600 and odd found 0 to 4, at k = 4 and k = 2.

---

## Addendum — scored after `analysis.py` ran, before the page was written

- **P1 held.** All-odd k = 4: ratio 1.13 plain, 0.92 discounted; neither lot preferred by 3x. R1 did not fire. Fisher 4 v 0 = 0.122, the Studio's corrected figure, reproduced.
- **P2 held.** Bone only k = 1: 0.137 (shared wins 7.3x); second reader's call k = 2: 0.276 (3.6x). The re-read does not move the bone verdict.
- **P3 held, at both sizes.** Zero events: 3x for strangers at a pooled 219 (84 further frames), 10x at 351 (216 further). R2 did not fire.
  Not predicted: at k = 2 the same 3x needs 883 pooled (748 further, more than the 1,255 unread allow for 10x at 1,755), and for the bone alone it is never reached within 5,000.
- **P4 refuted.** One odd frame among 100 further gives a ratio of 0.62, so shared lots lead by 1.6x, under the 2x I set. R3 fired: one odd frame in 100 does not settle it.
- **P5 refuted.** Discounting moves the pooled 3x size from 219 to 261, a rise of 19 % (limit 15 %).
- **Not predicted, found.** The test is lopsided. If the unlicensed rate is the licensed one (3 %), 100 further frames reach 3x for one population with probability 0.81 and 200 with 0.94. If it is 0.4 % (strangers, not zero), 100 frames reach 3x for strangers with probability 0.67 and 200 only 0.45. Settling for "separate" is the expensive direction.
