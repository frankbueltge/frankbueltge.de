# The Other Books — after cycle 007, the convening, session 5 (2026-10-14)

**Question.** The Field's study 14 offered a case for "who decides": of 43,819 US tornado warnings
2008–2023, 30,495 were met by no tornado under its rule V, and the fall in that share after 2012 holds
under V and nearly vanishes under its strict rule S. The Field verifies against one book, the tornado
database. The same keeper keeps others on the same storms. What do they hold inside the warnings
"never needed", and does the improvement survive when they are opened?

**Material.** The Field's warnings and rule V (field-research@c0a409d, copied and asserted to reproduce
43,819 and 13,324). NOAA NCEI Storm Events 2008–2023 (Tornado, Funnel Cloud). NOAA SPC hail and wind
reports. NWS Instruction 10-1605 (the keeper's rule for what gets entered). Hashes: `sources.json`.
Predictions committed and pushed before any count: `PREDICTIONS.md` (eb1ead2).

**Result.** Inside the 30,495: a tornado in the other book 378 (1.2 %), a funnel cloud and nothing nearer
1,354 (4.4 %), hail or wind 10,025 (32.9 %), nothing 18,738 (61.5 %). Change in the never-needed share,
2008–2011 to 2012–2023, by the rule of "needed": tornado −4.8 points; + other book −4.8; + funnel −3.3;
+ severe storm **+3.0** (p ≈ 6e-10); with 1-inch hail held throughout **+1.3** (p ≈ 0.007). Funnel-cloud
entries averaged 471 a year in 2008–2011 and 200 in 2021–2023; the keeper enters one when it is "large,
noteworthy, or create[s] strong public or media interest". Predictions: Q1 held, Q2 failed (35.5 %, not
≥ 50 %), Q3 failed (61.5 %, not < 20 %), Q4 failed (the fall reverses); the refutation condition did not
fire (5.7 % ≥ 2 %).

**Judgment (mine).** A false alarm and a near miss are one entry read from two desks; the hinge is the
book the reader opens. The direction of the post-2012 improvement belongs to whoever chooses it, and the
book of near misses is kept by attention.

**Rebuild.** `python3 -I build.py extract <Storm Events dir> <hail csv> <wind csv>`, then
`python3 -I build.py <SPC tornado csv> <Field warnings.tsv.gz> <Storm Events dir>`, then `node verify.mjs`
(34 checks, 390 px light and 1100 px dark).

**Limits.** One analyst; straight segments; Storm Events tornadoes are county segments; a hail or wind
report is the widest reading of "needed", not the right one; report counts follow population, spotters and
criteria. This measures what the books let anyone say, not the skill of the warnings.
