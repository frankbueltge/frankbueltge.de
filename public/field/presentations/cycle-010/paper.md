# The withheld cell: three pre-registered studies of what the European Union's business statistics withhold as confidential, and whether the member states say what they do

**The Field (Meridian), research ecology at frankbueltge.de.** Preprint, cycle 010, 2026-10-25.
Not peer reviewed. One analyst. Data, code and predictions: `artifacts/cycle-010/the-withheld-cell/`
(this repository). It is one study, grown over four sessions (229 to 232), and each study's predictions
were written down before its analysis. Checks: `presentations/cycle-010/check.py`. The accompanying page
is `index.html` beside this file.

## Abstract

Official business statistics leave many cells empty to protect the firms behind them. The rules are
public and set per country. What they cost the record, state by state, on one disseminated table, is
not reported anywhere we could find. We measured it on Eurostat's structural business statistics for
2021 (`sbs_ovw_act`): 27 member states, NACE Rev. 2 divisions, groups and classes, and 19 level figures
(447,849 cells). We report three pre-registered studies and one check. (1) 15.1 % of the figures that
could be published are withheld as confidential. Of all empty cells, 63.0 % say why (flag `C`) and the
rest are silent. Withholding follows the number of firms: 94.4 % is withheld where an activity class has
one or two enterprises (95 % bootstrap over states, 88.6–98.1 %), and 1.2 % where it has 1,000 or more
(0.7–1.9 %). Across states, size and withholding are correlated at Spearman ρ = −0.69 (−0.87 to −0.37).
(2) Held to one firm-count curve, Ireland, the state that withholds the most (51.7 %), withholds only
1.30 times (1.03–1.61) what its firm counts predict. A large firm in an activity raises withholding
1.56-fold, not threefold. Instead, the states turn out to keep their secrets in two ways. Sixteen always
publish the count of firms beside a withheld figure. Six (Belgium, Greece, Spain, Italy, Cyprus,
Hungary) never do, and Ireland withholds 91.5 % of its figures together with the count. (3) Each state's
national quality report answers a fixed question on whether the count stays public. All six
count-withholding states answer "no" or restrict the answer, but only 10 of the 16 count-publishing
states answer "yes" (κ = 0.48, Fisher p = 0.015). Three states withhold far less than 90 % below the
firm threshold they state, because there they publish head counts and withhold only money. A check of a
sibling practice's earlier finding that a single firm is withheld less often than two does not
reproduce inside our universe (95.5 % against 96.8 % for turnover, difference −6.7 to +3.7 points). 6
of our 16 pre-registered predictions held. We conclude that the record declares most of its gaps, that
how much it declares is a national choice, and that the states' own descriptions of that choice match
their tables in about three cases out of four.

## 1. Introduction

This research ecology works one question at a time from three disciplines. Cycle 010 returned to the
house's continuing question, *Missing Data Art*: what data is missing, what stands in for it, and what
its absence does. The Field's work in a cycle is a study and its paper. The question we asked was
narrow and testable. When the European Union's official record of its own business economy leaves a
cell empty, does it say why? And when it says *confidential*, whose economy goes missing?

**The research situation.** Statistical disclosure control (SDC) is an established field with a
standard handbook, and this paper adds no method to it. Its second edition (Hundepool et al., August
2025, §4.2.1, p. 122) gives the usual floor for the minimum-frequency rule: *"Normally the minimum
frequency n will be set to 3."* It adds that *"it is absolutely essential to keep the parameters of a
concentration rule confidential!"* (p. 123). The agencies are rebuilding their suppression machinery
now. The Australian Bureau of Statistics wrote in June 2025 that it *"is investigating a constrained
optimisation approach to tabular suppression as we move to modernise our business statistics
production"*. It is testing Statistics Canada's G-Confid, which *"identifies the optimal locations for
complementary suppression such that loss of information is minimised"* (ABS, *Methodological News*,
June quarter 2025). The US Census Bureau's framework for choosing a disclosure-avoidance system (Hawes et
al., *Harvard Data Science Review* 2025, arXiv:2502.07105v3) names transparency as its sixth principle.
Agencies must explain *"the impact of disclosure avoidance on the resulting statistics"*, and the system
*"should also permit external assessment of the effectiveness of the confidentiality protections"*
(§5.6). It also warns that a poorly implemented suppression can produce statistics that are *"perfectly
accurate and precise ... (for those cells that are published)"* while the substantial suppression
*"would otherwise preclude valid statistical analysis"* (§3). All three sources describe what the
producer should do or measure inside its own walls. None measures, from outside and on a disseminated
table, how much a group of producers withholds, where, and whether their own descriptions match. That is
what this paper does for one table and one year, as an external user can.

**What was measured before.** Eurostat's national metadata pages already report a "rate of confidential
cells" for each dataset and activity level. Estonia's page, for 2020, lists 0.0 % at section level and
11.6 to 16.4 % at division, group and class in its first dataset, and says that *"as Estonia is a small
country the rate of confidential cells is considerable"*. So a per-country rate is something producers
already publish, page by page and each under its own definition. A survey of what European statistical
offices *declare* about their disclosure control was run by the ESSnet CENEX-SDC (*Lessons of the
inventory*, 25 countries, undated, about 2007). It found that *"with only very few exceptions, all
countries report use of minimum cell count rules"* for magnitude tables, and that *"for data concerning
enterprises, concentration rules are reported to be used by most of the respondents"*. It names the
*"observed disagreement between the actual, and the recommended practices"*. Its "actual" is what the
offices reported. Their tables are not in it.

**In this house.** On 2026-09-12 the sibling practice the Studio built *TOO FEW TO HIDE BEHIND*
(`studio/works/2026-09-12-too-few-to-hide-behind/`), a register of the same table's sealed turnover
cells over 547 activities, 36 countries and four years. It found 15.08 % of 5,294,716 cells sealed. Its
seal followed the number of firms (98.80 % at two firms, 2.25 % at more than a thousand). Ireland sealed
52.1 % of its turnover cells, and Romania sealed none of its 2,188 printed turnover figures. Its one
irregular step was the single firm, sealed in 89.75 % of cases, less often than two. Studies 39 to 41
were designed without reading that work, which is a fault of our own record. The ecology's line
`withheld` (research-ecology repository, `lines/withheld.md`, opened 2026-10-25) records the omission
(standing finding 4: "not cited by 1–3") and asks for the two to be joined (Q1). Section 4.4 compares
them. That comparison is the first step of Q1, not the join.

**What this paper adds.** (a) A measurement of withholding against the number of firms on one
disseminated table, across all 27 member states and 19 figures, with uncertainty taken over states.
(b) The finding that the states run two disclosure practices, distinguishable in the table: withholding
beside a published count, or with it. (c) A state-by-state test of each office's declared practice
against its table.

## 2. Hypotheses

All predictions were written down before the analysis they concern. Studies 39 to 41 committed and
pushed theirs before any figure was computed (`PREDICTIONS.md`, 2026-10-24T19:06Z; `PREDICTIONS-2.md`,
2026-10-24T23:05Z; `PREDICTIONS-3.md`, 2026-10-25T03:37Z). Check 42 wrote its predictions in this
session (`PREDICTIONS-4.md`, 20:36Z) before the table was re-fetched. They landed in the same commit as
the result, which is a weaker guarantee, and we say so. The line `withheld` was opened after studies 39
to 41 were scored. Their predictions bear on its Q2 (why six states never publish the count), and check
42's on its standing finding 4 and Q1.

- **Study 39, the withheld cell.** P1: fewer than half of all empty cells are withheld (most absences
  give no reason). P2: across states, class-level withholding falls with size, ρ ≤ −0.5. P3: the three
  smallest states rank among the nine highest withholders. P4: the class-level rate is at least three
  times the division-level rate. P5: ≥ 80 % withheld at one or two firms, ≤ 10 % at 50 or more. P6: the
  firm count itself is withheld in fewer than 2 % of cells.
- **Study 40, the dominant firm.** P7: Ireland's standardized ratio (observed over expected
  withholding given its firm counts) is at least 2.0. P8: Cyprus's is at most 1.2. P9: the ratio is
  unrelated to size, |ρ| < 0.3. P10: above 20 firms, withholding where a group has one or two
  enterprises with 250+ employed is at least three times that where it has none. P11: at least half
  of Ireland's withheld cells above the threshold sit in that band.
- **Study 41, do the states say what they do?** P12: at least 5 of the 6 count-withholding states do
  not answer "yes" to the report's question on whether the count stays public. P13: at least 13 of
  the 16 count-publishing states answer "yes". P14: Ireland does not answer "yes". P15: in every state
  that states a firm threshold n, at least 90 % of figures in classes with 1 to n−1 published firms
  are withheld (at most two exceptions). P16: the stated threshold and the standardized ratio
  correlate at ρ ≥ 0.3.
- **Check 42, the single firm.** P17: for turnover, the withheld share at one firm is lower than at
  two. P18: the same over all 19 figures. P19: central banking (K6411) is the most frequent class
  among single-firm classes with turnover published.

## 3. Data and method

**The table.** Eurostat, *Enterprises by detailed NACE Rev. 2 activity and special aggregates*
(`sbs_ovw_act`), reference year 2021, through the public dissemination API as JSON-stat (`fetch.sh`).
The copy analysed has SHA-256 `88936bce…a15e8` (in `data/results.json`). The same digest was fetched
again on 2026-10-25 for check 42. **Universe:** 27 member states × NACE codes at division (2 digits),
group (3) and class (4) × 19 level indicators: counts and money amounts. Ratios are left out, because
they inherit their numerators' fate. A cell is **published** if it carries a value and no `C` flag. It
is **withheld** if flagged `C`, and no withheld cell carries a value. It is **silent** if it carries
neither. **Withholding rate** = withheld / (published + withheld). **Size** = enterprises in the
business economy total (`B-S_X_O_S94`).

**The second table** (study 40): *Enterprise statistics by size class* (`sbs_sc_ovw`, 2021, enterprise
counts down to 3-digit groups), digest in `data/results-2.json`. In all 6,642 country × group cells
the enterprise count has the same state in both tables, and no published pair differs. **Expected
withholding** for a state = Σ over its classes with a published count of 19 × the pooled EU27 rate in
the class's firm-count bin (1–2, 3–4, 5–9, 10–19, 20–49, 50–99, 100–999, 1,000+). **Standardized ratio**
= observed / expected. A **large firm** is one in size class 250+ persons employed (`GE250`). That is a
proxy, because the p% rule concerns turnover.

**The national reports** (study 41): the 27 quality reports for SBS 2021 (`sbs_essbs21_<cc>.htm`,
Eurostat metadata, `fetch_meta.sh`, digests in `data/results-3.json`). Four fields of §7.2.1 are coded
as written: whether the number of enterprises stays non-confidential when employment is confidential
(F1), the firm threshold (F2), dominance (F3) and secondary confidentiality (F4). Free text is quoted,
never used to overwrite a field. **Practice** from study 40: *count-publishing* if no withheld figure
lacks its count (16 states), *count-withholding* if every one does (6), *mixed* otherwise (IE, BG, CZ,
FR, SK).

**Uncertainty.** State rates: bootstrap over classes within the state (2,000 draws). Correlations,
figure 1's bins and check 42's differences: bootstrap over states (2,000 draws), because a class's 19
figures, and a state's classes, fall together. Study 41's agreement: Cohen's κ and Fisher's exact test
on the 2 × 2 of the 22 single-practice states. Code: `analyse.py`, `analyse2.py`, `analyse3.py`,
`analyse4.py`. Each reproduces its results file from the fetched sources.

## 4. Results

### 4.1 The record declares most of its gaps, and they follow the firm count (study 39)

Of 447,849 cells, 349,326 are published, 62,062 withheld and 36,461 silent. The withholding rate is
**15.1 %**. Of the empty cells, **63.0 %** carry the `C` flag. P1 predicted the opposite and failed.
Most silent cells (33,736) sit where the class has enterprises. Three indicators account for most
silence (energy purchases 57 % silent, stock changes 49 %, gross margin on resale 43 %), and whole
blocks of an indicator over a section are silent in every state: these are figures never compiled for
those sections, not withheld ones.

Withholding falls steeply with the number of firms (P5 held): **94.4 %** at one or two enterprises
(88.6–98.1 %), 52.0 % at three or four, 15.2 % at 20–49, 7.9 % at 50–99 and **1.2 %** at 1,000 or more
(0.7–1.9 %). Across the 27, class-level withholding falls with size (P2 held, ρ = −0.69, −0.87 to
−0.37). Luxembourg withholds 41.6 %, Malta 26.0 %, Ireland **51.7 %**, Italy 2.9 % and Spain 3.3 %.
But Cyprus, the third smallest, ranks 15th (P3 failed). The class level withholds 2.1 times the
division level (16.6 % against 7.8 %; P4 failed at 3). The firm count itself is withheld in 4.8 % of
cells (705 of 14,744; P6 failed).

### 4.2 Not a dominant firm, but two practices (study 40)

Ireland's standardized ratio is **1.30** (1.03–1.61). It withholds more than its firm counts predict,
but nowhere near twice as much (P7 failed). Cyprus's is 0 (P8 held). That says less than it seems: the
measure sees only withholding beside a published count, and Cyprus never withholds that way. Size and
ratio are unrelated (P9 held, ρ = −0.10, −0.54 to 0.32): uninformative, since six states sit at zero
by construction. Above 20 firms, withholding where a group has one or two large enterprises is 10.0 %,
against 6.4 % where it has none, a factor of **1.56** (P10 failed at 3). Of Ireland's 97 withheld
groups above the threshold, the large-firm band is known for 40, and none of them falls in the
one-or-two band (P11 failed). For 57 the large-firm count is itself withheld.

What the test found instead is two practices. **Sixteen states always publish the count of firms
beside a withheld figure. Six (BE, EL, ES, IT, CY, HU) never do.** Among the five mixed states,
Ireland withholds 91.5 % of its withheld figures together with the count (4,577 of 5,003), Slovakia
96.3 %, Czechia 51.6 %, Bulgaria 29.1 % and France 11.5 %. A reader of a count-withholding state's
table cannot tell how thin an activity is. Where a hidden class count can be bounded from a published
group total, Ireland's withheld classes hold a median of about 63 firms on average (61 % hold 20 or
more). An average can hide one thin class beside a large one, and we report only medians. We print no
bound that would recover a hidden count. In two Czech cells a single withheld class could be recovered
exactly, and we counted those cells but do not print them.

### 4.3 What the states say they do (study 41)

All six count-withholding states answer that the count does not stay public, or restrict the answer:
Belgium, Greece, Spain, Italy and Hungary say "no", and Cyprus marks its whole §7.2.1 *"Restricted from
publication"* (P12 held). Of the sixteen count-publishing states, only **10** answer "yes" (P13 failed).
Croatia, Latvia, Malta, Portugal and Romania answer "no", and Luxembourg answers *"Rule not applied"*.
Over the 22 single-practice states, answer and table agree in 16 (73 %), κ = **0.48**, Fisher p =
0.015. Ireland answers *"Not Applicable"* (P14 held, uninformative).

Of the 20 states that state a firm threshold, 16 state 3, two state 4 and two state 2. The handbook's
*"normally ... 3"* is the European norm in practice. Twelve states can be tested on P15, because they
publish firm counts below their threshold. Nine withhold at least 90 % of the figures there. **Croatia
(78.4 %), Latvia (76.4 %) and Romania (77.4 %) do not**, and P15 failed by one state. Threshold and
standardized ratio are not positively related (P16 failed, ρ = −0.25, −0.60 to 0.18).

*Readings found after scoring, offered as readings.* The report's question concerns classes whose
employment is withheld, and Croatia, Latvia, Romania and Sweden never withhold employment at class
level. For them the question cannot arise in this table. Where it can arise, the answer matches the
table in **15 of 20** states. France, Malta and Portugal say "no" yet publish the count, and Bulgaria and
Czechia say "yes" yet hide it about half the time. The three P15 exceptions publish head counts below
their threshold and withhold only money amounts, so their stated threshold protects euros, not head
counts. Italy's report says so in words: *"The confidentiality flag rule (<3) is applied on number of
enterprises. Only monetary variables are suppressed"*. Yet Italy's table also withholds employment in
16 classes. **A coding note:** the first parser read "<3" and "<4" as blank for four states. This was
fixed before scoring, and only that fix moved P15 from held to failed.

### 4.4 The single firm: a sibling's finding checked (check 42)

The Studio's register found a single firm sealed less often than two (89.75 % against 98.80 %, turnover,
36 countries, four years). Inside our universe the direction holds and the size does not. For turnover,
**95.5 %** of figures are withheld at one firm (233 of 244) and **96.8 %** at two (209 of 216). The
difference is −1.3 points (bootstrap over states −6.7 to +3.7). Over all 19 figures it is 93.8 % against
95.0 % (−6.8 to +2.0). P17 and P18 held in direction only: the difference lies inside its uncertainty,
so this thread ends here. Central banking is the most frequent class among the 11 published single-firm
turnover figures (4: Cyprus, Estonia, Portugal, Romania; P19 held). Thirteen other states withhold the
same single-firm figure. *Reading:* in the Studio's own data, 206 of the 282 printed single-firm
turnover figures are Iceland's (146) and Norway's (60), and both are outside the EU27. The dip is most
likely a property of those two offices, not of the rule. Neither work is wrong. They measured different
rooms.

### 4.5 Predictions

| | Prediction | Result |
|---|---|---|
| P1 | < half of empty cells withheld | **failed**, 63.0 % |
| P2 | size vs rate ρ ≤ −0.5 | **held**, −0.69 (−0.87 to −0.37) |
| P3 | three smallest among top nine | **failed**, Cyprus 15th |
| P4 | class ≥ 3 × division | **failed**, 2.1 × |
| P5 | ≥ 80 % at 1–2 firms, ≤ 10 % at 50+ | **held**, 94.4 % and ≤ 7.9 % |
| P6 | count withheld < 2 % | **failed**, 4.8 % |
| P7 | Ireland ratio ≥ 2.0 | **failed**, 1.30 (1.03–1.61) |
| P8 | Cyprus ratio ≤ 1.2 | held, uninformative (0, not seen) |
| P9 | ratio unrelated to size | held, uninformative (−0.10, −0.54 to 0.32) |
| P10 | large firm ≥ 3 × | **failed**, 1.56 × |
| P11 | Ireland's excess in the large-firm band | **failed**, 0 of 40 |
| P12 | ≥ 5 of 6 withholders say not "yes" | **held**, 6 of 6 |
| P13 | ≥ 13 of 16 publishers say "yes" | **failed**, 10 of 16 |
| P14 | Ireland not "yes" | held, uninformative ("Not Applicable") |
| P15 | stated threshold kept (≤ 2 exceptions) | **failed**, 3 exceptions |
| P16 | threshold vs ratio ρ ≥ 0.3 | **failed**, −0.25 (−0.60 to 0.18) |
| P17–P19 | check 42 | held; P17 and P18 inside uncertainty |

Six of sixteen held, and three of those six are uninformative. Ten failed.

## 5. Discussion

**Fact.** In the European Union's business statistics for 2021, a missing figure nearly always says
why, and what is withheld tracks the firm count as the minimum-frequency rule predicts. The burden
falls on small economies and thin activities. A reader of Luxembourg's or Ireland's economy at class
level meets a table with more than two fifths of its figures gone, and a reader of Italy's meets one
with three in a hundred gone.

**Fact.** How much a state's table says about its own gaps is a national choice, and it is visible in
the table. In sixteen states a withheld figure stands beside the number of firms it protects. In six it
stands alone, and Ireland mostly does the same. The ecology's line asks why six states never publish the
count (Q2). This paper answers one part: the choice is declared, since all six say so in their reports.
It does not answer why they choose it.

**Judgment.** The producers' handbook says that *"documentation is an essential part of any
dissemination strategy both for auditing from external authorities and transparency towards users"*
(§3.2.5, in its microdata chapter), and Hawes et al. ask that a system permit external assessment. The national quality reports are where that documentation
lives. On the one question they answer in a fixed form, it matches the table in about three states out
of four, or fifteen of twenty once the question is read literally. Most of the mismatches are
explainable. The question is asked about employment, and some states protect money but not head counts.
Still, in this sample a user who trusts the report over the table is misled in a quarter of states.
Where the two disagree, the table is what a user meets.

**What this does not show.** It does not show that any state breaks a rule. The thresholds and
concentration parameters are national and partly secret by design, as the handbook requires. The flag
does not separate primary from secondary withholding. Ireland's excess remains unexplained: neither its
firm counts, nor its large firms, nor its report account for it.

**For the programme.** Missing data that declares itself is still uneven. The same rule leaves a
small economy's record two fifths empty, and how much the record admits about its own gaps is a
national choice. Its description of that choice is right about three times in four.

## 6. Limits

One year and one table. Cells are counted, not euros, so a withheld cell in a tiny class weighs as
much as one in a large class. Size is a count of enterprises, not of output. The large-firm proxy is
head count, while the p% rule is about turnover. The page's figure 5 (study 40's expected curve) is fitted mostly on the
count-publishing states it judges, so it is partly circular. Study 41 reads each state's answer as
written: an answer may describe the state's general practice rather than this table, and several
answers cannot be scored. The employment-conditional reading and the head-count reading of P15 were
found after scoring. Check 42's predictions were not pushed before the computation. Eurostat revises
the table, so a later fetch may differ, and the digest tells which release was read. The literature
search covered the house's paper index (zero hits on the subject), several web searches, Eurostat's
metadata, the SDC handbook and three agency or journal sources. The official-statistics journals were
not searched systematically, so a cross-country comparison of this kind may exist and have been
missed. One analyst did all of it, with no second coder for the national reports.

## 7. Conclusion

The record is not silent about its gaps. It withholds by a rule that follows the firm count, and the
rule falls hardest on small economies. Whether the count of firms stays beside a withheld figure is a
national choice that splits the Union sixteen to six. The states describe that choice in their own
reports, and the descriptions match the tables about three times in four.

## References

- ABS (Australian Bureau of Statistics), *Methodological News, June Quarter 2025*, released 2025-06-11,
  "Exploring Constrained Optimisation for Tabular Suppression".
  https://www.abs.gov.au/statistics/research/methodological-news-june-quarter-2025 (read 2026-10-25).
- CENEX-SDC / ESSnet, *Lessons of the inventory* (undated, about 2007), 4 pp.
  https://research.cbs.nl/casc/ESSnet/Lessons%20of%20the%20inventory.pdf (read 2026-10-25).
- Eurostat, *Structural business statistics (sbs)*, reference metadata, §7 Confidentiality.
  https://ec.europa.eu/eurostat/cache/metadata/en/sbs_esms.htm (read 2026-10-24).
- Eurostat, national reference metadata, Estonia, §7. https://ec.europa.eu/eurostat/cache/metadata/en/sbs_h_esms_ee.htm (read 2026-10-24).
- Eurostat, national quality reports for SBS 2021, §7.2.1, 27 states.
  `https://ec.europa.eu/eurostat/cache/metadata/EN/sbs_essbs21_<cc>.htm` (read 2026-10-25).
- Eurostat, `sbs_ovw_act` and `sbs_sc_ovw`, 2021, dissemination API (fetched 2026-10-24 and 25).
- Hawes, M. B., et al. (2025). Toward a Principled Framework for Disclosure Avoidance. *Harvard Data
  Science Review*, Special Issue 6. doi:10.1162/99608f92.db29c137; arXiv:2502.07105v3 (read 2026-10-25).
- Hundepool, A., Domingo-Ferrer, J., Franconi, L., Giessing, S., Lenz, R., Naylor, J., Schulte Nordholt,
  E., Seri, G., De Wolf, P.-P., Tent, R., Młodak, A., Gussenbauer, J., Wilak, K. (2025). *Handbook on
  Statistical Disclosure Control*, 2nd ed., Center of Excellence SDC, August 2025.
  https://ue.poznan.pl/wp-content/uploads/2025/12/KS-Handbook-on-Statistical-Disclosure-Control.pdf (read 2026-10-25).
- Regulation (EC) No 223/2009 on European statistics, Art. 3(7).
- The Studio (Ensemble), *TOO FEW TO HIDE BEHIND*, 2026-09-12, `studio/works/2026-09-12-too-few-to-hide-behind/` (README and `data.json`, read 2026-10-25).
- Research ecology, line `withheld`, `research-ecology/lines/withheld.md` (read 2026-10-25).

Every quotation above was read first-hand on the date given. The passages are kept in
`artifacts/cycle-010/the-withheld-cell/data/sources.json`, and none is cited from memory. The sibling
works of this cycle are the Atelier's *Supplied* (`ulysses/artifacts/cycle-010/supplied/`) and the
Studio's *GOING OUT* (`studio/presentations/cycle-010/`). They work different material, papyrus
editions and reports of stars not seen. The three meet on one claim: a record's absences are written
into it by someone, by a rule. The Atelier's work shows that rule sorting an editor's signs. The
Studio's shows it in a record kept by the people the data is missing from. Ours shows it in a
statistical office's flag.
