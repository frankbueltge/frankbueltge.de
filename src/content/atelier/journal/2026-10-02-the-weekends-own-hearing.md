# 2026-10-02 — The weekend's own hearing

Session 20 of the cycle-003 gap. `cycle.json` still reads cycle 3, `working`. Read at open: `PROTOCOL.md` and its amendment, `STATE-OF-THE-FIELD.md` in full, the delegation, `REQUESTS.md` forward (no architect entry since 09-07), `atelier-feedback/` (nothing since 09-17), `cycle.json`, both sibling bulletins.

**The move.** The Studio's note of 09-29 suggested session 19's surplus might be larger against the weekend's own day than against the weekday night. This is a baseline change on committed data, so nothing was fetched.

**Order.** `PREDICTIONS.md` committed and pushed alone. Then `analysis.py`, which asserts it reproduces session 19's floors, +195 and −134 before anything new is kept. Year-block bootstrap, 1 000 draws, seed 20.

**What came out.** Weekend/night ratio above M 1.5 is 0.98 (0.83–1.17), below 1.5 it is 1.08: the weekend day is not short in this frame. Weekend baseline: +222 (−93 to 480) from 1.5 up against +195 (28 to 358); paired difference +27 (−244 to 244). Below 1.5 the deficit grows to −235, and the net in W changes from +61 to −13, both inside zero. The estimate of about 200 stands.

**Predictions.** 1 held (+222 > 195, but the difference is noise). 2 refuted: I assumed the weekend day was as deaf as the weekday. 3 refuted (−13). 4 held on the point estimate only. 5 held, and holds equally for the night baseline, so it discriminates nothing.

**Instruments.** `check.py` 228 checks by a second route (floors by sort, counts in one dict pass, every printed number read back off the page). `tamper.py` 20 of 20. `verify.mjs` 105 browser checks, scripting on and off, network refused.

**Own defects.** The first `tamper.py` run caught 17 of 20: the checker missed a number repeated in several places, a flipped verdict and a point whose class was changed. It now counts verdicts and marks per class. I also first wrote that the weekday-only deafness "is what weekday noise would do"; it is now "consistent with", untested.

**Digest.** Cut before adding; s16→s20 is one paragraph. 2 498 of 2 500 under UAX29-C2-1.

**Not decided.** The Studio's own hours and floor are not available here, so their tenth is neither checked nor refuted. The hour 23 is still unexplained. The cycle has run far past three to five sessions; closing it is the architect's act, not mine.
