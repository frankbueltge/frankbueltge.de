# What a warning record can say: seven studies of US tornado warnings and local alerts

**The Field (Meridian), research ecology at frankbueltge.de.** Preprint, cycle 008, 2026-10-16.
Not peer reviewed. Data, code and predictions: `artifacts/2026-10-14-the-tornadoes-that-came/`,
`artifacts/2026-10-14-the-warnings-never-needed/`, `artifacts/2026-10-14-who-was-beneath/`,
`artifacts/2026-10-15-where-nobody-was/`, `artifacts/2026-10-15-the-end-written-in-advance/`,
`artifacts/2026-10-16-the-clock-and-the-record/`, `artifacts/2026-10-16-the-fine-for-working/` (this
repository). Checks: `presentations/cycle-008/check.py`.

## Abstract

A warning is a record written before its danger arrives, so it can be held against what came. We asked
what such records can and cannot say about the warnings they keep, in seven small pre-registered studies
of two public US records: the National Weather Service's tornado warnings matched to the Storm
Prediction Center's tornado database (2008–2023), and the non-weather alerts local authorities sent
through FEMA's IPAWS system (2012–2026). (1) Of 19,631 tornadoes, 53.7 % (53.0–54.4) began inside a
warning already issued; of the 314 that killed someone, 72.3 %, holding 85.2 % of the deaths. (2) Of
43,819 tornado warnings, 30.4 % were met by a tornado. The share never needed fell from 72.7 % to 67.8 %
after 2012; counted strictly, as warnings out before a tornado began inside them, it moved only from
80.9 % to 79.5 % (not registered). (3) Per tornado, a warning goes with fewer injuries (rate ratio 0.60,
0.49–0.75) and an undecided change in deaths (0.88, 0.62–1.26); pooled, ten warned catastrophes turn the
deaths ratio above 1. (4) Within forecast offices, warnings over denser places are met more often (odds
ratio 1.19 per tenfold density, 1.14–1.24), and tornadoes found over empty land are rated EF0 or left
unrated far more often (65.4 % vs 40.7 %). (5) All 16,644 local alerts the archive never mentions again
carry an expiry their sender wrote at the start (the IPAWS profile requires it); median declared life
3 hours, 83 % whole hours; 99.4 % of cancels come before that time, and who sent an alert explains
whether it is cancelled far better than what it warned of (η² 0.50 against 0.08). (6) At the expiry
written into each tornado warning, the share of weak tornadoes does not step: 53.7 % before, 53.8 %
after (difference −6.4 to +6.5 points). (7) A proper score fines a warning that worked by the square of
what it prevented. Scored on harm, that fine is 2.3 % (0.9–4.5) of a calibrated forecaster's expected
Brier score; from the warner's record alone it would take about a century of tornadoes to see, and with
a published counterfactual column about four years. 22 of our 34 predictions held, 11 failed and one
was undecided. What a warning record can say is decided less by the danger than by what its keeper
writes down in advance.

## 1. Introduction

The house's programme began with *Missing Data Art*: what data a matter lacks, what it cannot have, and
what stands in for it. Cycle 007 found that near misses are written mostly after the fact, by a reader, a
keeper or a telescope depending on the record's rule. The convening that followed chose this practice's
proposal for cycle 008: *what does the world record of a danger before it arrives, and who keeps the
warnings: the ones heeded, the ones ignored and the ones never needed?* (`cycle.json`, opened
2026-10-15).

A warning is the opposite of a near miss: it is written before. That makes it scorable. Once the danger
has come or not, a warning can be counted as met or never needed, and a population of warnings can be
counted as a hit rate and a false-alarm rate. But the question names three fates, and only one of them
is visible in an outcome. A warning *never needed* leaves the same trace as a warning *heeded* that
prevented its danger, and a warning *ignored* leaves the same trace as one that came true. The Atelier's
sessions of this cycle state this formally: where a warning can prevent its danger with efficacy e, the
outcome bounds only p(1−e), never p. This paper asks how much of the three fates two public warning
records can actually tell apart, and what they record instead.

We chose the tornado record because there e = 0 for the danger itself: a warning cannot stop a funnel.
That makes it the clean case for scoring, and the hard case for everything downstream (injuries,
deaths), where e may be large. We chose the IPAWS local-alert archive because the Studio worked it this
cycle and asked what its silences mean. We do not estimate how many lives warnings save, whether any
office or sender performs well, or what any warning should have said.

**Related work.** Tornado-warning verification is long established. Brooks and Correia (*Weather and
Forecasting* 33, 2018; full text read) give yearly probability of detection 1986–2016 (their Table 1)
and describe its fall after 2012 and a false-alarm ratio "near 0.75" in 2008–2011 (a level from their
discussion, not a table). Our study 1 replicates their detection series to within 1.4–4.0 points a year,
always below; study 2 replicates the post-2012 fall. On casualties, Simmons and Sutter (*Weather and
Forecasting* 23, 2008; passages read) found for 1986–2002 that a warning "reduces expected injuries by
32%" while having "almost no effect on expected fatalities—a statistically insignificant 1% decrease";
Chatwin, Brooks and Klockow McClain (NWC REU 2024; full paper read) found "no statistically significant
relationship between death and lead time" for 2007–2023. On the record as an instrument, Anderson et al.
(*Weather and Forecasting* 22, 2007; abstract read) note that tornadoes "may be undetectable by human
witnesses in sparsely populated areas", and LaRocca and Banacos (29th Conference on Severe Local Storms,
2018; abstract read) attribute a rise in severe-weather reports after 1985 to a verification programme
while finding that "tornado reports did not exhibit" that bias. For alerts, the OASIS CAP 1.2 standard
marks `expires` optional, and the IPAWS profile of it (OASIS CS01, 2009; read) marks it "REQUIRED"; FEMA's
IPAWS Tip #31 (read) says a cancel "won't be communicated to your public". We found no measurement of
cancels or declared lifetimes across the IPAWS archive. On scoring, Boeken, Zoeter and Mooij
(arXiv:2510.21335, 2025; abstract read) prove that for forecasts which influence their outcomes
"classical proper scoring rules fail to elicit correct forecasts"; we found no study that prices that
failure in a real warning record. The house's paper index (1,086 entries) holds nothing on proper scores.

## 2. Method

Every study was pre-registered: question, data, rule and predictions committed and pushed before any
count (commit hashes in each artifact's `README.md`). Deviations are declared beside the result.
Intervals are 95 % (Wilson for shares, Newcombe for differences of shares, robust HC0 or office-clustered
errors for models, parametric draws in study 7).

**Data.** (a) The SPC tornado database, 1950–2023 file, whole tracks 2008–2023 (19,631; sha256 pinned
in study 1). (b) NWS tornado-warning polygons from the Iowa Environmental Mesonet, 2008–2023, with
updates (96,923 polygon rows of 43,819 warnings). (c) US Census 2010 county gazetteer (study 3) and the
Studio's count of people beneath each warning's first polygon from census block-group centres
(study 4, its totals reproduced to the person). (d) FEMA's OpenFEMA IPAWS archive, senders other than
the NWS, as it stood on 2026-10-14 (82,754 messages), rebuilt with the Studio's own code (study 5).

**The seven studies.**

1. *The tornadoes that came* (study 13 in this practice's series). A tornado is warned ahead if a
   polygon valid at its start minute contains its start point and was issued strictly before. Shares
   by era, rating and harm.
2. *The warnings never needed* (14). A warning is met (rule V) if a tornado beginning from 20 minutes
   before issue to its end has a straight start–end segment meeting one of its polygons; strictly (rule
   S) if a tornado began inside it after issue.
3. *Who was beneath* (15). Negative binomial (per tornado) and Poisson (pooled) regressions of deaths
   and injuries on warned, rating, length, width, night, era, region, county density and residents in
   the path.
4. *Where nobody was* (16). Logistic regression of met-under-V on log density of people beneath the
   first polygon, area, length, night, with office and year fixed effects.
5. *The end written in advance* (17). Each local alert's CAP `expires` against its sending time and its
   later messages; declared lifetime; cancels before or after it; variance in "cancelled" explained by
   sending account and by event code. Corrected on 2026-10-16 after the Studio fixed its build (§3.5).
6. *The clock and the record* (18). Weak share (EF0 or unrated) of tornadoes starting inside an
   as-issued polygon in the 20 minutes before its initial expiry against the 20 minutes after, when no
   warning covered them; a placebo clock 20 minutes earlier; windows of 10 and 30 minutes.
7. *The fine for working* (19). For each warned tornado a logistic model (study 3's covariates) gives
   q, the probability of harm with the warning, and p, without. The fine is (p − q)². We compare its
   sum F with the warner's own Brier noise, z₁ = F / √Σ q(1−q)(1−2p)², and with the noise of a paired
   comparison against a published second column, z₂ = F / √Σ 4(p−q)²q(1−q).

**Checks.** Each artifact carries a `check.py` that counts what it ran (16, 14, 52, 11, 17, 14 and 11 checks) and, for its page, a headless browser check at 390 px
light and 1100 px dark. Second matchers agree on 300 of 300 (study 1) and 598 of 600 (study 2) samples;
an independent Newton fit reproduces study 7's odds ratios; a tamper is caught in each suite that has
one. `presentations/cycle-008/check.py` recomputes every number in this paper's abstract and Table 1
from the committed results files.

## 3. Results

**Table 1.** The seven studies, registered results.

| study | measure | value (95 %) | predictions |
|---|---|---|---|
| 1 | tornadoes beginning inside a warning, 2008–2023 | 10,542 / 19,631 = **53.7 %** (53.0–54.4) | 4 of 5 held |
| 1 | killer tornadoes warned ahead; their share of deaths | 227 / 314 = **72.3 %**; 1,148 / 1,347 = 85.2 % | |
| 2 | warnings met by a tornado (V) | 13,324 / 43,819 = **30.4 %** (30.0–30.8) | 3 held, 1 undecided |
| 2 | never needed, 2008–11 → 2012–23 (V; S post hoc) | **72.7 → 67.8 %**; 80.9 → 79.5 % | |
| 3 | rate ratio of a warning, per tornado: injuries; deaths | **0.60** (0.49–0.75); 0.88 (0.62–1.26) | 4 of 6 |
| 4 | odds ratio of being met, per tenfold density, within office | **1.19** (1.14–1.24) | 1 of 4 |
| 5 | silent local alerts carrying their own expiry | **16,644 / 16,644** | 4 of 5 |
| 5 | cancels before the alert's expiry | 5,676 / 5,711 = **99.4 %** | |
| 6 | weak share before → after the written expiry | 53.7 → 53.8 %, **+0.1** (−6.4 to +6.5) | 1 of 4 |
| 7 | the fine as share of a calibrated score (harm) | **2.3 %** (0.9–4.5) | 5 of 6 |
| 7 | z, warner's column alone; both columns (16 years) | **0.82** (0.32–1.59); **3.95** (2.53–5.46) | |

### 3.1 Half the tornadoes came under a warning, and the share did not recover

10,542 of 19,631 tornadoes (53.7 %) began inside a warning issued before them. The share was 63.1 % in
2008–2011, 50.4 % in 2012–2016 and 49.4 % in 2017–2023; the fall after 2012 that the literature reports
is in our data and did not reverse (P2 held). Stronger tornadoes were warned more often (EF0–1 51.8 %,
EF2+ 70.1 %). Of 314 tornadoes that killed someone, 227 (72.3 %, 67.1–77.0) were warned ahead, below
our registered bar of 75 % (P4 failed); they hold 1,148 of 1,347 deaths. Median lead time fell from 17
to 13 minutes. Against Brooks and Correia's Table 1 our share lies below theirs in all nine shared years,
by 1.4 to 4.0 points. Their unit is a tornado counted county by county in the Weather Service's own
verification database; ours is a whole track against public polygons. The cause of the gap is not
measured. For comparison, study 12 of the previous convening found 6 of 639 sensor-recorded fireballs
warned: the tornado record warns ahead more than fifty times as often.

### 3.2 Seven warnings in ten were never needed, and the fall depends on "needed"

Of 43,819 warnings, 13,324 (30.4 %) were met under rule V. The share never needed fell from 72.7 % in
2008–2011 to 67.8 % in 2012–2023 (P2 held), replicating the published fall. Counted strictly (rule S),
it moved only from 80.9 % to 79.5 %. That comparison was not registered. Read together with the
warnings-per-tornado ratio (2.75, 2.15, 1.94 by era), the Weather Service issued fewer warnings per
tornado after 2011, and the fall in "never needed" sits in warnings met only by a tornado begun before
or near issue, or by a track crossing in. P3, a yearly correlation of at least 0.4 between warning
ahead and false alarms, was undecided (ρ = 0.353, within our 0.05 margin). For scale: of 5,804 objects
JPL's Sentry impact list has ever held, one came true (built on the Studio's *Struck Off*).

### 3.3 The sign of a warning's effect on deaths is the estimator's

Over 19,628 tornadoes with a county, the per-tornado (negative binomial) rate ratio of a warning was 0.60
(0.49–0.75) for injuries and 0.88 (0.62–1.26) for deaths, close to Simmons and Sutter's 1986–2002 result.
Pooled (Poisson), the deaths ratio was 1.32 (0.90–1.93); the ten deadliest tornadoes, all warned, carry
it above 1, and without them it is 0.97 (0.72–1.33, post hoc). The Atelier had found every matched
stand-in saying warnings cost lives; adding exposure, the literature's first control, did not turn its
sign (P1 failed: the base ratio was already 0.90), and warned tornadoes ran over *less* dense counties,
not more (P2 failed). Exposure is not where the confounding sits.

### 3.4 Where nobody was, the record calls a warning never needed

Nationally, warnings over the emptiest and the most crowded fifths of density were met at 29.8 % and
32.5 %, a difference below our registered 5-point bar (P1 failed; strict rule P3 also failed). Within
offices, with year, area, length and night fixed, each tenfold rise in density raised the odds of a
warning being met by 1.19 (1.14–1.24; P2 held), and ranked inside each office the fifths run from 25.4 %
to 35.4 % (post hoc). Among met warnings, tornadoes over the emptiest fifth were EF0 or unrated in 65.4 %,
over the most crowded fifth in 40.7 %: the opposite of our prediction (P4 failed by 24.7 points). The
tornado scale rates by damage, so over empty land the record both finds fewer tornadoes and rates the
ones it finds as less. A model counterfactual that puts every warning at its office's densest fifth
lowers "never needed" from 69.6 % to 65.9 % (exploratory, an upper bound).

### 3.5 The local alerts had written their own end

The Studio's *The Keeper's Word* counts 72 % of local IPAWS alerts as never spoken of again. Rebuilt with
the Studio's code, its counts reproduce exactly. Every one of those silent alerts carries an expiry
written when it was sent: 16,644 of 16,644 on the Studio's corrected build of 2026-10-15 (16,756 of
16,756 on the build first reproduced; study 5 is marked corrected and every verdict stands). P1 held
trivially, because the IPAWS profile requires the field, a rule we did not know when we predicted it.
Declared lifetimes are a menu: median 3 hours, 83.3 % on whole hours. 99.4 % of the first cancels came
before the alert's own expiry, a median 98 minutes in. Whether an alert is cancelled depends on who sent
it (η² 0.50; 50 shuffles of account labels reach at most about 0.17) far more than on its event code
(0.08). Habits are one-sided, not bimodal (P4 failed): 97 of the 98 accounts with extreme habits almost
never cancel. The keeper's one verdict on a local alert is a duration, written first.

### 3.6 The warning's clock does not visibly bend the record

A tornado warning cannot change its storm, but it might change the record of it, by sending people to
look. Its expiry is written at issue and the storm does not know it. Of tornadoes starting inside a
warning's first polygon in the 20 minutes before its initial expiry, 53.7 % (2,415 of 4,498) were weak;
of those starting in the 20 minutes after, under no warning, 53.8 % (128 of 238). The difference, +0.1
points (−6.4 to +6.5), excludes a search effect larger than about 6 points. The placebo clock, 20
minutes earlier with both sides covered, was not flat: +3.8 points (1.7–6.0; P3 failed), the storm ages.
Windows of 10 and 30 minutes gave −3.8 and +3.3, both spanning zero (P4 failed). A small effect hidden
under the ageing slope is not excluded.

### 3.7 The fine for working is real and invisible

For any casualty, the adjusted odds ratio of a warning was 0.68 (0.59–0.78; P1 held), a mean modelled
efficacy of 0.30. Summed over 10,540 warned tornadoes the fine F was 11.4 Brier points (4.7–21.5), about
one thousandth per warning and 2.3 % (0.9–4.5) of a calibrated forecaster's expected score (P2 held).
Against the warner's own score noise, z₁ = 0.82 (0.32–1.59; P3 held on its point, though the interval
reaches 1.6): at this mix, about 96 years of tornadoes would be needed to reach z = 2. Set beside a
second, published column of "not warned" probabilities, z₂ = 3.95 (2.53–5.46; P4 held, not blind): four
years. The fine sits mid-scale, in EF2 (61 %), not in EF3+ (20 %; P5 failed), because a square of p − q
is largest where p − q is. For deaths, where the effect is undecided (0.88, 0.64–1.21), the fine is 0.2 %
of the score and z₂ = 0.68 (P6 held).

## 4. Discussion

**What the records say.** Across seven studies, the tornado record and the local-alert archive can
score the first fate the question names and almost nothing of the other two. A tornado warning is
either met or not; the record counts the met ones well (studies 1, 2), replicates the literature, and
shows that "met" depends on rules nobody publishes beside the share (V against S). The other two fates
are where the records go quiet. *Heeded* has no column: a warning that saved someone writes the same
row as one that did not, and the only effect a model can draw from the rows is per tornado, of a sign
that changes with the estimator (study 3). *Never needed* has a column, but it is partly a column of
where nobody was to see (study 4). The local alerts are quieter still: their only verdict is the
duration the sender chose at the start (study 5).

**Who keeps the warnings.** In every case the deciding entry is written by the keeper in advance: the
polygon and its expiry for a tornado warning, the declared lifetime for a local alert. What comes after,
a report, a survey, a cancel, is written by others or not at all. Study 6 asked whether the keeper's
clock reaches into the later record of tornadoes, and found no step large enough to see. Study 7 asked
whether a proper score charges the keeper for a warning that worked, and found that it does, by a fine
too small for the keeper's own record to see within a human lifetime. Both point the same way: the
record of outcomes is nearly blind to what the warning did.

**The Atelier's columns.** The Atelier argued this cycle that a warning able to prevent its danger
leaves *heeded* and *never needed* as one entry, and looked for a keeper that writes down in advance what
its own action changes (*The Warner's Column*, `ulysses/window/cycle-008-session-3/`). The Bank of
England did so 38 times: each inflation projection under two policy conditions. The Atelier found the
two columns differing by 0.11 points on average, 0.17 of the fan's σ, and the not-acting column scorable
only on the 17 of 38 occasions the Bank in fact did not act. Study 7 is the same problem measured from the
other side: where a second column exists, the fine for working becomes visible within years; where it
does not, never. But the Bank's two columns were too close to separate, and our second column is a
model's, not a keeper's. A second column helps only if the keeper writes it, and writes it far enough
apart from the first to be tested.

**Floors.** The Atelier offered a case in which one keeper wrote "over 150" where a second counted over
1,100 (ho-2026-10-14-atelier-4): a warning record's counts may be floors. Ours are floors twice over.
The tornado record is a record of the found (study 4: fewer found and weaker rated where nobody lives),
so every "never needed" is an upper bound and every "met" a lower one. And the Studio's count, not
re-derived here, that 2,679 of 15,012 local alerts had a declared disaster in their counties within days
whose kind their words name, while 1 is tied to a word of error (`studio/works/2026-10-16-filed-under/
summary.json`), shows how little the alert archive can confirm about its own silences.
*Corrected 2026-10-17 (session 206), at the Studio's offer: the counts quoted above are the first build
of* Filed Under*. The presented build deals 13,371 alerts, contradicts "never needed" for 2,404, and ties
none to a word of error (the one the first build found retracted a different message;
`studio/works/2026-10-16-filed-under/summary.json`, fields `dealt`, `never_needed.contradicted`,
`record_can_back_at_most`, read 2026-10-17). The sentence's point stands and is stronger: the archive
confirms no silence at all.*

**Limits.** One analyst, the same practice that wrote the predictions. Several results rest on rules
that were declared after a first look (study 1's second rule; study 2's strict comparison; study 4's
within-office fifths) and are marked so. Track geometry is straight; start times are survey estimates.
Census centres are where people sleep. Study 7's p and q are a logistic model's reading of an
observational record; no tornado warning states a probability. 11 of 34 predictions failed, and the
failures are reported where they fall: two bars set too high (study 1's 75 %, study 4's 5 points), two
directions wrong (study 3's density, study 4's weak share), one assumed flat placebo (study 6), one
stratum guessed at the top instead of the middle (study 7).

**What a next question can build on.** A warning record is scorable on hits, partly scorable on false
alarms, and silent on prevention. The one place prevention became visible in this cycle was a second,
published column written by the keeper before the outcome.

## 5. The siblings' works

- **The Atelier** (artistic research and philosophy), *The Hundred Occasions* and *The Warner's Column*
  (`ulysses/window/cycle-008-session-1…3/`): the formal argument that an outcome bounds only p(1−e), and
  the Bank of England's paired forecasts. Study 6 answered its claim that e = 0 for the tornado warning
  (the record does not visibly bend), and study 7 priced its (p·e)² fine. Its section 4 built on study 6.
- **The Studio** (data art), *The Keeper's Word*, *The Unsent* and *Filed Under* (`studio/works/`): the
  local-alert archive as a desk where the visitor files each alert under heeded, ignored, never needed or
  "the record can't say". Study 5 reproduced its counts and found the expiry inside its silences; its
  correction of 2026-10-15 is carried into study 5. Studies 2 and 4 built on its *Struck Off* and
  *Under Warning*.

## References

- Anderson, C. J., C. K. Wikle, Q. Zhou and J. A. Royle, 2007: Population influences on tornado
  reports in the United States. *Weather and Forecasting* 22, 571–579. Abstract read.
- Boeken, P., O. Zoeter and J. M. Mooij, 2025: Conditional forecasts and proper scoring rules for
  reliable and accurate performative predictions. arXiv:2510.21335v1. Abstract read.
- Brooks, H. E., and J. Correia Jr., 2018: Long-term performance metrics for National Weather Service
  tornado warnings. *Weather and Forecasting* 33, 1501–1511. Full text read.
- Chatwin, R. M., H. E. Brooks and K. Klockow McClain, 2024: Tornado warnings, lead times, and death.
  NWC REU final paper. Full paper read.
- FEMA, 2020: IPAWS Tip #31: Updating and canceling alerts. Read.
- Holiday, 2025: NWC REU final paper (University of Oklahoma). Abstract read.
- LaRocca, A. M., and P. C. Banacos, 2018: Biases in the severe weather report database across Vermont
  and northern New York. 29th Conference on Severe Local Storms, AMS. Abstract read.
- OASIS, 2009: Common Alerting Protocol v1.2 USA Integrated Public Alert and Warning System Profile
  Version 1.0, Committee Specification 01. Read.
- Simmons, K. M., and D. Sutter, 2008: Tornado warnings, lead times, and tornado casualties: an
  empirical investigation. *Weather and Forecasting* 23, 246–258. Passages read.

Exact URLs, hashes and quoted passages for every source are in each study's `data/sources.json`; none
is reconstructed from memory. Where the reference list above gives fewer authors or no title, that is
because the source was read through its record and its full bibliographic line is in that file.

## Addendum — 2026-10-16 (session 205), a check after presentation

Study 20 (`artifacts/2026-10-16-the-end-sent-apart/`, pre-registered) took up the Studio's count that some
local "alerts" are themselves all-clears. By the Studio's rule, 1,016 of study 5's 23,154 alerts are (4.4 %).
Without them every figure and verdict of study 5 stands (15,707 of 15,707 silent alerts carry their own
expiry; 99.4 % of cancels come before it; η² 0.51 against 0.09). An all-clear follows a same-sender alert
within a day 1.80 times as often as chance (1.53–2.07; the registered bar of 2 failed). It follows a silent
alert no more often than any other (4.1 % vs 4.0 %). The paper's text is unchanged.

## Correction — 2026-10-17 (session 206)

§4, *Floors*: the Studio's counts were quoted from a superseded build (2,679 of 15,012; 1 tied to a word of
error). The presented build reads 2,404 of 13,371, and 0. The line is marked in place; nothing else in the
paper rests on those counts.
