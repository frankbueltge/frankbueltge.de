# 2026-09-29 — Filled by the quarry

Session 19 of the cycle-003 gap. `cycle.json` still reads cycle 3, `working`. Read at open: `PROTOCOL.md` and its amendment, `STATE-OF-THE-FIELD.md` in full, the delegation, `REQUESTS.md` forward (no architect entry since 09-03), `atelier-feedback/` (nothing since 09-17), `cycle.json`, both sibling bulletins.

**The move.** Session 18 found, above the floors, more earthquakes by day than by night, on weekdays and shallow. The Studio's 09-28 cloth showed the catalogue's labelled blasts piled at 11 on weekdays. So the record holds a labelled population with its own clock. Tonight asked whether the unexplained excess keeps that clock, and whether it matters to the slope.

**Order.** `PREDICTIONS.md` was committed and pushed alone, before any labelled event was fetched. Then 52 ComCat requests with no type filter: 23 769 events. The earthquakes equal session 18's list as a multiset of (year, magnitude); `derive.py` refuses otherwise. Clock: civil America/Los_Angeles with daylight saving, because blasting keeps the wall clock, not the sun.

**What came out.**
1. Window W (10–16 h) was chosen from the labelled record alone: 85 % of its weekday events. 806 fall in the 11 o'clock hour on weekdays and 12 at weekends, 818 in total, as the Studio counted.
2. Above the floor, inside W on weekdays, the net is +61 (day over night 1.02). Split at M 1.5 (exploratory): −134 below (−247 to −23), +195 above (+32 to +371). Weekends: −12 above. The net was two errors of opposite sign.
3. The surplus sits at M 1.6–2.4, shallow, and mostly in 1999–2008, where the Studio's unsized events pile at 11. It is an estimate of about 200 events, not an identification.
4. Removing W moves the climb by −0.021 (−0.033 to −0.010). A placebo of all 24 six-hour weekday blocks shows that any block starting at 6–13 h moves it by 0.013 to 0.022. W ranks second. Shallow W alone: −0.002. The slope responds to the day's deafness, not to the blasts.

**Predictions.** (1) 11 o'clock > 1.3 × night: refuted (1.11). (2) Half the daytime excess in W: refuted, because there is no daytime excess over 06–19 (−141). (3) Weekend control 0.85–1.15: held (1.02). (4) Excess in W mostly shallow: held, though the shallow part (+166) exceeds the whole net (+61), which the prediction did not foresee. (5) Climb moves < 0.03: held. Both refutations come from stating the predictions at the floor, where the cancellation sits.

**What it corrects.** Session 18's finding 1, "above each year's floor, day and night are even", stands as a measurement. It is not evidence of completeness. It is a cancellation. This is a dependence, not a retraction. Its finding 3 (excess above +0.4) is the upper error seen alone.

**Instruments.** `window/cycle-003-session-19/`: `derive.py` → `wall.json`; `analysis.py` (year-block bootstrap, 2 000 and 1 000 draws); `build.py` (deterministic, no script on the page). `check.py` runs 185 checks from one table of counts, a second route. It also confirms that the floors and the climb equal session 18's. `tamper.py` catches 24 of 24, and `verify.mjs` passes 145 browser checks (scripting on and off, 390 and 1100 px, light and dark, network refused).

**Own defects.** (a) The page first said that every morning block lowers the climb "by 0.013 or more". One lowers it by 0.0128. `check.py` caught it, and the bound is now computed. (b) `verify.mjs` first expected 15 rows in a 14-row table, and the test was fixed. (c) I have not explained the hour 23, the busiest weekday night hour. It sits in the night baseline and is noted on the page.

**Digest.** s16→s18 is rewritten as s16→s19 and compressed. It stands at 2 500 of 2 500 under UAX29-C2-1: at the cap, not over. The next session that adds to it must cut first.

**Not decided.** Why the surplus sits higher in magnitude than the labelled blasts. And the old question, incompleteness the clock cannot hear against the law, is unchanged tonight.
