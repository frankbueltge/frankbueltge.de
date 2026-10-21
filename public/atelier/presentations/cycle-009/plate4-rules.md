# Plate IV, *The Burden and the Loss* — rules and predictions

*Written 2026-10-21 and committed before either opinion was read past its title, citation, date and
judges, and before any of the Studio's 400 statements was read. It is revised only by dated lines below.*

**Reach outside (protocol §5, point 3).** This practice has never worked law, as distinct from the
regulations it read in cycle 008. Two primary texts: *United States v. Carroll Towing Co.*, 159 F.2d 169
(2d Cir. 1947), opinion by L. Hand, and *Brown v. United States*, 790 F.2d 199 (1st Cir. 1986), opinion
by Bailey Aldrich, with Pettine concurring. Both are US court opinions, in the public domain. Source: the
Caselaw Access Project's static files (static.case.law, `f2d/159/cases/0169-01.json` and
`f2d/790/cases/0199-01.json`, sha256 asserted in `plate4.py`, not committed). Every quotation is
asserted verbatim in `plate4.py`.

**Material taken up:** the Studio's `works/2026-10-20-take-cover-again/words.json` (s189, offered
2026-10-20: "400 statements that took a tornado warning back early, none saying it was not needed").
Plate III's `plate3.json`, for the chance of each stated word.

**The rule of the made thing (Hand's line).** A class of warnings, by the stated word, is *owed* at a
ratio b = B/L (the burden of one sheltering against the loss it averts when a tornado comes) when its
chance P exceeds b. That chance is plate III's: at the hour, or in the later record. An empty warning in
an owed class is a burden the formula requires the public to bear. An empty warning in a class below the
line is over-warning, and the formula charges it to the warner. The visitor sets b, because neither
opinion supplies one. The rest is arithmetic on plate III's published counts, so it predicts nothing,
and the page says so.

**Predictions on the texts:**
- **R1.** Neither opinion in *Brown* names a cost that an unneeded forecast or warning puts on the
  public. Operationally: none of "false alarm", "unnecessar", "needless", "over-warn", "overwarn",
  "cry wolf" occurs, and my reading of every passage on what a forecast does to its users finds no
  such cost.
- **R2.** *Brown* grounds immunity in discretion and the forecast's uncertainty, not in weighing the
  burden of a precaution against the expected loss. It never states a B < PL test and never cites
  *Carroll Towing*.
- **R3.** *Carroll Towing* states the formula with named letters P, L and B, and its B is a burden on
  the party whose precaution is at issue, not on third parties.
- **R4.** None of the Studio's 400 statements states a chance. Operationally: no match of
  `\d+ ?%`, `percent`, `probab`, `chance`, `likel`.
