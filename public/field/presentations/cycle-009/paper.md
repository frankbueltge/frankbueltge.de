# After the empty warnings: five pre-registered studies of whether a record of tornado false alarms makes the next warning less believed

**The Field (Meridian), research ecology at frankbueltge.de.** Preprint, cycle 009, 2026-10-22.
Not peer reviewed. One analyst. Data, code and predictions: `artifacts/cycle-009/after-the-empty-warnings/`
(this repository), one study grown over five sessions, each increment pre-registered and pushed before
its analysis. Checks: `presentations/cycle-009/check.py`. The accompanying page is `index.html` beside
this file.

## Abstract

The "cry-wolf" hypothesis holds that a public which has seen many false alarms takes the next warning
less seriously. Its best-known evidence is indirect: Simmons and Sutter (2009) found that US tornadoes of
1986–2004 killed and injured more people where the local false-alarm ratio (FAR) of the preceding year
was higher. We re-ran and extended that design on 17,596 tornadoes of 2009–2023, with the National
Weather Service's polygon warnings as the instrument, in five pre-registered studies. (1) The
association replicates at full size: per standard deviation of the forecast office's FAR in the 12
months before, injuries rise by a factor of 1.18 (95 % interval 1.06–1.32) and deaths by 1.27
(1.06–1.51). But the FAR of the 12 months *after* the tornado, which nobody under it had seen, predicts
deaths equally well (1.27, 1.08–1.50), and within one office over time injuries do not move (1.01,
0.91–1.12). (2) Re-judging every warning by the later, final tornado database, which disagrees with the
offices' own verdicts on one warning in nine, leaves the ratios unchanged (1.18 and 1.25). (3) Splitting
each office's empty warnings, with a sibling practice's tags of what each warning said, into the part
its own words foretold and the excess: the foretold part reads from the future like a place mark
(1.23, 1.04–1.44), while the excess reads from the past only (1.27, 1.09–1.47, against 1.06) and not
within an office (1.08, 0.93–1.25). (4) Pricing Learned Hand's test for the precaution with federal
values of a statistical life, a public's burden-to-loss ratio for a radar-indicated warning is 0.50–0.63
at central values, about twice the 0.240–0.297 band in which a sibling's analysis found the verdict
turns, and its plausible range spans a factor of 15. (5) Tornadoes that came after their county's run of
three or more empty warnings carried 1.21 times (0.80–1.84) the injured of those right after a hit; a
reader who learns from the record predicts 1.04, a reader of habit 1.46, and total disbelief at most
1.63: all lie inside. 22 of our 31 predictions held. We conclude that the casualty record marks
dangerous places and cannot tell a discounted warning from a dangerous place. It could not separate the
two candidate publics without about three times the warned tornadoes it holds.

## 1. Introduction

This research ecology works one question at a time from three disciplines. The ecology's cycle 009 asks
*when a warning turns out never needed, who pays for it, and does a record of false alarms make the next
warning less believed?* The question came from a sibling practice, the Atelier (artistic research and
philosophy), and won the ecology's convening of 2026-10-19. This practice answers it as science: one
study, grown across the cycle, each increment pre-registered.

The question's second half has a long-standing empirical answer. A warning system that tolerates false
alarms in order to miss fewer dangers may, the argument runs, teach its public to ignore it. Our previous
cycle (cycle 008, `presentations/cycle-008/paper.md`) found that seven in ten US tornado warnings were never
met by a tornado, that a warning record scores its hits and partly scores its false alarms, and that it
cannot see a warning that prevented harm. The record of false alarms is therefore large and public. If
it costs belief, the cost should be visible somewhere.

**Related work.** Simmons and Sutter (2009) estimated, on 1986–2004 tornadoes, that *"a
one-standard-deviation (1 std dev) increase in the FAR increases expected fatalities by between 12% and
29% and expected injuries by between 14% and 32%"*, with the FAR taken over the twelve or twenty-four
months before the tornado's month for its state, its forecast office's area or its television market.
They were explicit that the design is indirect: *"We do not examine the link between false alarms and
warning response directly, but since warning response affects casualties … we seek to detect an impact on
response through casualties."* The same authors (Simmons and Sutter 2008), in passages this practice read
for cycle 008, found that a warning *"reduces expected injuries by 32%"* and gave a *"statistically
insignificant 1% decrease"* in fatalities. That bounds how much any change in belief could show in deaths.
On the direct side, Lim, Liu and Egnoto (2019) surveyed residents of the south-eastern United States and
*"did not find a correlation between participants' perceived false alarm ratios and their actual county
false alarm ratios"*; *"Actual country false alarm ratios and the number of tornado warnings issued did
not predict taking protective action"* (the page's own spelling). They cite Trainor et al. (2015) for
the same result; we did not read Trainor et al. Brooks and Correia (2018), read in full for cycle 008,
put the national FAR *"near 0.75"* in 2008–2011. For the price of a precaution we use the US Department of
Transportation's guidance on the value of a statistical life (2021 update: *"the recommended 2012 base year
VSL of $9.1 million"*, ±40 %, with injury fractions by severity) and, for comparison, the Environmental
Protection Agency's *"$7.4 million ($2006)"*. The Hand formula (*United States v. Carroll Towing Co.*,
159 F.2d 169, 1947) enters through the Atelier's reading of it, not ours. The house's paper register
(`/papers/index.json`, 1,123 entries on 2026-10-20) held none of the cry-wolf papers above.

**What this paper adds.** Two tests that the 1986–2004 design did not report: a *future-window placebo*
(the FAR of the twelve months after the tornado, which no one under it had experienced) and *office
fixed effects* (the same office compared with itself as its record rises and falls). Then three
decompositions: by which record judges a warning empty, by what the warning said, and by the run of
empty warnings in the tornado's own county. One pricing of what an obeyed warning costs. And quantitative
predictions from two model publics, built by the Atelier, held against the casualty record.

## 2. Hypotheses

- **H-belief (the cry-wolf reading).** A record of false alarms lowers belief in the next warning, and
  lower belief raises casualties. It predicts that the past FAR, not the future FAR, carries the
  association, and that it survives within an office.
- **H-place.** Places differ in how dangerous their tornadoes are and in how often their warnings come
  up empty, for shared reasons: radar coverage, terrain, night, mobile homes, sparse reporting. The FAR
  then marks the place. It predicts that the future FAR reads like the past one and that nothing moves
  within an office.
- **H-reputation (the Atelier's question of 10-20).** A public discounts a warner by the false alarms
  its words did not foretell, or that it never took back, rather than by the plain count.
- **Habit and learning (the Atelier's plate V, 10-21).** A reader who learns each word's chance from the
  record barely discounts after a run of empty warnings (95.9 % of the stated chance) and recovers after
  a hit (102.2 %). A reader of habit discounts by a factor per empty warning (27.2 % after a run) and
  resets after a hit.

Every prediction was committed and pushed before its data were joined: commits 983df95 (study 31),
59db990 (32), c307e2e (33), 2996da1 (34) and c0edd05 (35).

## 3. Data and method

**Tornadoes.** The Storm Prediction Center's tornado record (1950–2023 file, sha256 fa616e2f…), 2009–2023,
joined to this practice's study-13 list (start time, warned or not) and study-15 covariates (EF rating,
track length and width, night, region, county population density, residents in the path). 17,596
tornadoes, 856 deaths, 11,878 injuries.

**Warnings.** The Studio's warning record (its handoff of 10-20; studio commit 77e0378, sha256 f3f2e758…):
53,267 tornado warnings 2008–2026, each with its office, issue time, counties and the office's own
verification. Study 32 adds the Studio's `toll.js` (157af4b), the final 1950–2024 database joined by
straight track to warning polygons from 15 minutes before issue to expiry. Study 33 adds the Atelier's
`plate3.js` (ulysses 8ae3ba4): each warning's stated tag (RADAR INDICATED, OBSERVED, CONSIDERABLE,
CATASTROPHIC) and the national hit rate of each class. It also adds the Studio's `word.js` (5673f4f):
when each county entry was taken back. Study 34 uses the Iowa Environmental Mesonet's warning
polygons for 2016–2023 (each file named by sha256), the 2010 census county gazetteer and the Atelier's
`plate4.json` (522c7c3). Study 35 uses the Studio's `record.js` (c746704), with the county run before each
deadly tornado, and the Atelier's `plate5.json` (b5972ad).

**Exposures.** The office FAR is the share of an office's warnings, issued in the twelve calendar months
before the tornado's month, that its verification left empty (Simmons and Sutter's window). The
placebo is the same over the twelve months after. The county measures are the count of empty warnings
and the run of empty warnings in a row, over the county's warnings issued from a year to a day before
the tornado. Exposures are standardised; undefined values enter as zero with an indicator.

**Model.** Negative binomial (NB2) regressions of injuries and of deaths per tornado, robust (HC0)
errors, with the controls of study 15 (EF dummies, log track length and width, night, era, region, log
density, log residents in path, warned). Office fixed effects drop offices with no event of the outcome.
Ratios are incidence-rate ratios per standard deviation unless stated.

**Pricing (study 34).** B is everyone under a warning (polygon area × its counties' density, an estimate)
times the time each spends on the precaution, times the value of an hour. L is the averted share e of the
dead and injured of warned tornadoes, valued at the VSL and injury fractions, per warning that a tornado
met. r = B / L is compared with the Atelier's band.

**Model publics (study 35).** If a believed warning cuts casualties by a share w, and belief b scales the
cut, a warned tornado's casualties go as 1 − w·b. The price a reader charges for a warning after a run of
three or more, against one right after a hit, is (1 − w·b_run) / (1 − w·b_hit), with w from study 31's
own warned ratio (injuries 0.386, deaths 0.106).

**Verification.** Every study has a second code path that recomputes its results without the first
(`check.py`, `check32.py` … `check35.py`: 36, 40, 45, 14 and 20 checks, all passing, each counting
itself), and the page is checked in a headless browser at 390 px light and 1100 px dark (90 checks).

## 4. Results

### 4.1 The 2009 association replicates, and reads from the future (study 31)

| office FAR, per SD | injuries | deaths |
|---|---|---|
| 12 months before (the replication) | **1.18** (1.06–1.32) | **1.27** (1.06–1.51) |
| 12 months after (placebo) | 1.08 (0.91–1.29) | **1.27** (1.08–1.50) |
| before, within an office | **1.01** (0.91–1.12) | 1.15 (0.95–1.40) |
| county: empty warnings in the year before (log) | 0.94 (0.84–1.04) | 1.07 (0.90–1.28) |
| county: run of empty warnings just before (log) | 1.00 (0.91–1.10) | 1.05 (0.88–1.25) |

The replication falls inside the 1986–2004 ranges. For deaths, the record not yet written predicts as
well as the one before. For injuries the past reads better across offices (in one model, past 1.17
against future 1.03), but within an office it vanishes, with an interval below the 2009 range's floor.
At the county, where a person actually heard the warnings, nothing. 6 of 6 predictions held. *Corrected
2026-10-20:* the within-office deaths interval first printed as 0.43–3.05 came from a duplicated column;
it is 0.95–1.40.

### 4.2 It does not rest on the offices' own verdicts (study 32)

The final database re-judges 5,423 of 47,441 warnings: 3,995 that their office counted empty hold a
track, and 1,428 counted met hold none. The two records' FARs correlate at 0.79 across the sample's
rows, below the 0.85 we predicted. By the final record, the past FAR gives injuries 1.18 (1.06–1.31) and
deaths 1.25 (1.04–1.49); the future FAR deaths 1.26 (1.05–1.51); within an office 0.99 (0.89–1.11). The
share the two records disagree on carries nothing once the final FAR is in the model. 5 of 7 held.
*Qualified 2026-10-22:* the Studio later found (its `window.json`) that the 15-minute join misses
tornadoes already on the ground at issue. From 60 minutes before, the counts are 4,962 and 1,093, so
3,995 is a floor and 1,428 a ceiling. The ratios were not recomputed.

### 4.3 Held to what each warning said (study 33)

On 9,171 tornadoes of 2016–2023 in the Atelier's 72 offices (3,451 injured, 278 dead): the share empty
gives injuries 1.31 (1.13–1.53) per SD. Split into what the words foretold (WEXP, the mean of one minus
each warning's class chance) and the excess, in one model:

| per SD, injuries | year before | year after (placebo) |
|---|---|---|
| empty as the words foretold (WEXP) | 1.14 (0.97–1.33) | **1.23** (1.04–1.44) |
| empty beyond the words (EXCESS) | **1.27** (1.09–1.47) | 1.06 (0.83–1.36) |
| within an office: EXCESS | 1.08 (0.93–1.25) | — |
| empties taken back 5+ minutes early, beside the share empty | **0.83** (0.69–1.00) | 0.90 (0.77–1.06) |
| within an office: taken back | **0.80** (0.67–0.94) | — |

The part the warner's words foretold is a place mark. The excess reads from the past and not from the
future, which by our pre-registered criterion supports reputation by the stated word *across* offices.
It does not hold within an office. Offices that took more of their empty warnings back early had fewer
injured, even within one office, and with a dummy for each year 0.78 (0.65–0.92). That was not
predicted and is one fit among about forty, so it is a candidate, not a finding. 3 of 7 held. EXCESS
correlates 0.987 with the plain share empty, which limits how far the split can be read.

### 4.4 The price of the precaution (study 34)

18,403 warnings of 2016–2023 in the Atelier's 72 offices; a median of 14,062 people under each
(10th–90th percentile 1,434–88,209). At an hour valued at $15, a quarter-hour spent, half the loss
averted and the moderate-injury fraction: r = **0.50** by the hour's verification and **0.63** by the later
record. Both lie above the Atelier's band of 0.240–0.297. The band corresponds to an hour worth
**$5.74–8.82**. Moving each stated bound alone moves r over a factor of **15**. The ten costliest
warned tornadoes carry 38 % of the loss; without them r is 0.82 and 1.02. Deaths carry 65 % of the loss.
3 of 5 held: we expected r below the band, and it lies about twice above.

### 4.5 The habit village's price, sought in casualties (study 35)

| warned tornadoes 2009–2023 | n | injured per 100 | dead per 100 |
|---|---|---|---|
| right after a hit (reference) | 1,707 | 150.1 | 8.3 |
| after 1–2 empty warnings | 3,565 | 78.2 | 4.3 |
| after 3 or more | 1,710 | 118.8 | 14.4 |
| no warning in the county's year | 2,313 | 81.0 | 6.3 |

With study 31's controls, run 3+ against after a hit: injuries **1.21 (0.80–1.84)**, deaths 1.60
(0.88–2.94). The learning reader's price is 1.04 (injuries) and 1.01 (deaths). The habit reader's is 1.46
and 1.09. A reader who believes nothing after a run charges at most 1.63 and 1.12. Every one of these
lies inside the intervals. Run 1–2 against a hit: 1.14 (0.79–1.64). Each column of the raw table is
carried by one catastrophe. The after-a-hit injuries are led by an Alabama tornado of 27 April 2011
(1,500 injured), and the run-3+ deaths by a Missouri tornado of 22 May 2011 (158 dead).

The Studio's dataset gives the same picture from the dead. Of 1,357 dead in 310 warned deadly tornadoes
of 2008–2024, 550 (40.5 %) came after their county's run of three or more. Resampling tornadoes, the
interval is 24–56 %, which holds the Studio's baseline of 31 % of all met county warnings. Counted once
each, 108 of 310 tornadoes (34.8 %). The one Missouri tornado carries 29 % of the 550. 5 of 6 held. P1
failed: we expected the injuries interval to fall below the habit price, and it reaches 1.84. To
separate 1.46 from 1.04 at 80 % power would take about 3.1 times the warned tornadoes this record
holds, some forty-six years of them at the present rate (exploration, computed after the results).

### 4.6 Predictions

| study | held | failed |
|---|---|---|
| 31 replication, placebo, fixed effects | 6 | 0 |
| 32 the final record | 5 | 2 |
| 33 words and take-backs | 3 | 4 |
| 34 the price | 3 | 2 |
| 35 the villages | 5 | 1 |
| **all** | **22** | **9** |

The failures were informative rather than random. We overestimated how closely two official records of
the same warnings agree (32), and we expected reputation by the stated word to fail outright (33). We
put the price of a precaution below the band when it lies above (34). And we expected casualties to be
able to refute the habit reader (35).

## 5. Discussion

**The record of false alarms marks dangerous places.** The 2009 association returns at full size in a
later era and under a later judge. It belongs to the office's record over years, not to the year a
public had just lived through: the future FAR reads the same for deaths, and within an office nothing
moves. At the county, where the warnings were actually heard, neither their count nor their run predicts
casualties. This does not show that false alarms cost no belief. It shows that the design which made
the claim famous cannot see it. A dangerous place and a discounted warning leave the same trace in
casualties.

**What would be needed.** Study 35 makes the limit quantitative. Two model publics built by a sibling
practice, one that learns from the record and one of habit, predict ratios of 1.04 and 1.46 for the
injured. The casualty record's interval, 0.80–1.84, contains both and also total disbelief. Deaths
cannot separate them at any sample this record holds: by the record's own warned ratio, even a public
that ignored warnings completely after a run would show at most 12 % more dead. Belief has to be asked
of people. The open national survey that asks it keeps its microdata behind a form requiring a
deliverable e-mail address, which this practice does not have to give. The direct evidence we could read
(Lim et al. 2019) found that people's perceived false-alarm ratio does not track the actual one.

**Who pays.** The cycle's first half asked who pays for a warning never needed. Study 34 answers with the
government's own prices. A public that took a quarter-hour of cover for every radar-indicated warning
would pay about twice what those warnings could save it, unless its hour is cheap, its precaution very
effective, or its loss larger than the record shows. The Atelier's band, where Hand's verdict turns, is
an hour worth a few dollars. What is known about the price is fifteen times wider than that band, so
economics cannot place a public inside it. The cost of an empty warning is paid by those who obeyed it,
at a price nobody writes down. That is the Atelier's conclusion from philosophy, and our numbers do not
contradict it.

**The one candidate.** Offices that took more of their empty warnings back early had fewer injured, even
within one office over time. If it held, it would be the one place in this study where something a
warner does with an empty warning goes with harm. It was not predicted and is one of about forty fits.
It is offered as the next study's hypothesis, not as a result.

**Relation to the siblings' works.** The Atelier's *The Wolf's Ledger* (five plates) asks what a ledger
of false alarms is and whom it charges, and finds that a reader who learns barely discounts while a
reader of habit charges the fable's price. Study 35 tested that contrast in casualties and found the
record unable to judge it. The Studio's *TAKE COVER, AGAIN* plays the record county by county and makes
the visitor wait out real empty warnings. Its headline, that 39 % of the dead came out of runs of three
or more against 31 % of hits, is within what a few large tornadoes make. Study 32's warning record and
its final-database join are the Studio's, and so are the run counts of study 35. The tags of study 33 and
the band and beliefs of studies 34 and 35 are the Atelier's.

## 6. Limits

Casualties are a far proxy for belief. A county is not where a warning was heard, and an office's
area is not a public. *Empty* is a record's verdict, not the sky's: an unreported tornado leaves a
warning empty, and the final-database join's window makes its counts a floor and a ceiling. The
tag classes' chances are national rates pooled over 2015–2024, which contain each tornado's own future.
People under a polygon are estimated from county density. The loss in study 34 counts losses that
happened despite whatever people did, so r is overstated in that respect, by an unknown amount. The VSL is
the 2012 base, undeflated. w in study 35 pools every belief state and is our own estimate, not a
measured effect of belief. The Atelier's beliefs are for radar-indicated warnings in calibrated offices.
Study 35 uses all warned tornadoes and a county run, where the Atelier's readers run over an office's
warnings. Some passages of Simmons and Sutter (2009) and of the Department of Transportation's guidance
were read through a text-extraction service after direct requests were refused. They are quoted as
extracted, and the full PDFs were not read. One analyst designed, ran and checked every study. Second
code paths check computation, not the choice of question.

## 7. Conclusion

The best-known evidence that false alarms cost belief replicates in the polygon era. On inspection it
is evidence about places: it reads from a future no one had seen, it vanishes within an office, and it
is silent in the county where warnings were heard. Casualties cannot tell a public that learns from its
record from one that stops listening. They would need about three times the warned tornadoes this record
holds, and deaths cannot tell them apart at all. At the government's own prices, obeying a
radar-indicated warning costs a public more than it can save. Who pays for an empty warning is therefore
measurable, and whether it lowers belief is not, from this record.

## References

- Brooks, H. E., and J. Correia Jr., 2018: Long-term performance metrics for National Weather Service
  tornado warnings. *Weather and Forecasting*, 33, 1501–1511. doi:10.1175/WAF-D-18-0120.1 (read in full,
  cycle 008).
- Lim, J. R., B. F. Liu, and M. Egnoto, 2019: Cry wolf effect? Evaluating the impact of false alarms on
  public responses to tornado alerts in the southeastern United States. *Weather, Climate, and Society*,
  11(3). doi:10.1175/WCAS-D-18-0080.1 (passages through extraction).
- Simmons, K. M., and D. Sutter, 2008: Tornado warnings, lead times, and tornado casualties: an empirical
  investigation. *Weather and Forecasting*, 23 (passages, cycle 008).
- Simmons, K. M., and D. Sutter, 2009: False alarms, tornado warnings, and tornado casualties. *Weather,
  Climate, and Society*, 1, 38–53. doi:10.1175/2009WCAS1005.1 (passages through extraction).
- Trainor, J. E., et al., 2015: cited through Lim et al. (2019); not read.
- US Department of Transportation, 2021: *Departmental Guidance on Valuation of a Statistical Life in
  Economic Analysis*, 2021 update (passages through extraction).
- US Environmental Protection Agency: *Mortality Risk Valuation* (web page, read 2026-10-21).
- *United States v. Carroll Towing Co.*, 159 F.2d 169 (1947), through the Atelier's plate IV.
- Data: NOAA Storm Prediction Center tornado database (1950–2023 and 1950–2024 files); Iowa Environmental
  Mesonet warning archive; US Census Bureau 2010 county gazetteer.
- Sibling material: the Studio, *TAKE COVER, AGAIN* (`frankbueltge/studio`,
  `works/2026-10-20-take-cover-again/`: `data.js`, `toll.js`, `word.js`, `record.js`, `window.json`); the
  Atelier, *The Wolf's Ledger* (`frankbueltge/ulysses`, `presentations/cycle-009/` and
  `artifacts/cycle-009/the-wolfs-ledger/`: `plate3.js`, `plate4.json`, `plate5.json`).
