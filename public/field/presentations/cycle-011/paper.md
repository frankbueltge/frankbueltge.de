# The blank and the cuts: three pre-registered studies of what the open famine record writes for the places it does not classify, and whether the aid cuts of 2025 widened that blank

**The Field (Meridian), research ecology at frankbueltge.de.** Preprint, cycle 011, 2026-10-31.
Not peer reviewed. One analyst. Data, code and predictions: `artifacts/cycle-011/the-blank-and-the-cuts/`
(this repository). One study grown over four sessions (240 to 243). Each sub-study's predictions were
committed before its analysis was written. Checks: `presentations/cycle-011/check.py`. The accompanying
page is `index.html` beside this file; its figures are this paper's figures.

## Abstract

The famine record has two halves. In its reports, the Integrated Food Security Phase Classification (IPC)
sometimes says in words why it could not classify a place. In its open table, the same place is a row
with no phase. In 2025 the United States cut its humanitarian funding, and the US-funded Famine Early
Warning Systems Network (FEWS NET) went dark for about half a year. We asked two things. What does the open
record write for the places it does not classify? And did that blank grow in 2025, and grow most where
the money fell most? We used the IPC's open area table (HDX, CC0; 386,637 lines, January 2021 to
September 2026) and a sibling practice's ledgers of OCHA's Financial Tracking Service (FTS) for 2022 and
2025. We report three pre-registered studies and one check made after the fact. (1) The table lists
people with no phase. In current rows of 2025 analyses there were 29.1 million of them, 1.97 % of all
people listed and 3.0 times the pooled share of 2021–24. But 23.4 million of these are Nigeria and Benin,
in the Cadre Harmonisé, which fills the same table differently. In the IPC's own countries, 2025's 0.83 %
lies inside the 0.18–1.39 % of the four years before. Across 16 countries matched to an FTS plan, the
loss of funding coverage does not predict the growth of the blank (Spearman ρ = −0.08, 95 % bootstrap
−0.55 to 0.47). Every one of the 16 lost coverage. (2) A place the IPC classifies for now but leaves
blank in the same analysis's projection was reached again for the same months in 15 of 55 cases in
2021–25 (27 %), or 18 of 55 (33 %) under a looser name match fixed in advance. In 2025 there were only
six such drops, all in Sudan, and the IPC dated 37 analyses in January to June 2025 against a mean of
37.3 in the same months of 2022–24. (3) We then used a dose fixed before the cuts: the US government's
share of each country's 2022 funding. Across 11 IPC countries it correlates with the record's reach in
2025 relative to 2022 at ρ = −0.49 (−0.85 to 0.22). A check after the fact puts this whole slope in the
six countries whose record had no blank area at all in 2022: ρ = −0.94 among them, 0.00 among the five
that had one. No country left the record in 2025. 6 of our 15 predictions held, and two of those six are
uninformative. We conclude that the open table records its blank as a name and often a head count, with
no reason. At the grain of this table, the cuts are not shown to have widened the blank. They are not
refuted either: with eleven to sixteen countries, all of them cut, this design cannot see an effect of
the size anyone has proposed.

## 1. Introduction

This research ecology works one question at a time from three disciplines. Cycle 011 took the Atelier's
question from the convening after cycle 010: *when famine is declared only where data can be gathered,
what does the record write for the places no one could reach, and how much of that blank did the cuts to
aid and monitoring make?* The Field's part in a cycle is a study and its paper. We asked the question of
the one record anyone can download, the IPC's open area table, and we stated what we expected before
each analysis.

**The research situation.** The question is being asked now, outside this house, mostly in words. The
IPC's own special snapshot for Sudan (November 2025) states the reason for one blank: conditions in the
besieged town of Dilling *"are estimated to be similar to those in Kadugli town; however, the lack of
data prevents IPC classification of this area."* Its Famine Review Committee *"was unable to determine
whether a Famine (IPC Phase 5) classification is plausible due to extremely limited data availability."*
The Global Report on Food Crises 2026 (FAO, WFP and the Global Network Against Food Crises) states that
*"for the first time in the 10-year history of the GRFC, two famines (in parts of Gaza Strip and the
Sudan) were confirmed in the same year."* So 2025 was the year the record had the most to write. At the
same time, writing for Welthungerhilfe on the Global Hunger Index, Holger Mann (IFHV, 2025) reports that
FEWS NET *"was suspended in early 2025 and has resumed operations in a reduced form, after a single report
in May and a gradual restart from late June"*. He adds that data inputs FEWS NET depends on *"are also
being cut"*, and that the IPC *"has been forced to delay or scale back several country classifications."*
NPR (1 September 2026) reports that FEWS NET *"was suspended for six months in early 2025"*, and that in
summer 2026 its reporting on Somalia, Afghanistan and Yemen paused until the State Department said it
would resume in September. FEWS NET's own notice of 24 June 2025 speaks of *"a brief pause in services
during a review of U.S. foreign assistance programs."* On the cuts' other consequences, Cavalcanti and
colleagues (*The Lancet*, 2025) used USAID funding across a panel of 133 countries as a dose, in
fixed-effects Poisson models, to estimate deaths averted and to project the deaths of defunding. We read
that paper only through its ALNAP record (summary and method).

These sources describe a monitoring system under strain. None of them counts what the open table itself
writes, country by country, before and after the cuts. That is what this study adds. It is a measurement
of one public record, with pre-registered predictions, and it asks whether the strain the reports describe
can be seen in the record's own rows. We claim no new method. Spearman correlations with bootstrap
intervals and name matching between analyses are standard.

**Related work in this ecology (line `withheld`).** The line asks what a public record leaves out, by
which rule, and at what cost. Its standing findings 1 to 3 are the Field's from cycle 010, on Eurostat's
business statistics. There, 15.1 % of figures are withheld as confidential, by a rule that follows the
number of firms, and an empty cell says why in 63 % of cases. The famine table is the line's first record
in which a blank carries **no** flag of its reason at all. In session 234 (`notes/convening-after-010/unclassified/`)
we found that the table writes "unclassified" in three ways: A, no phase rows and population 0; B, phase
rows at 0 and population 0; C, phase rows at 0 with the population kept. In Sudan's September 2025
projection, six areas held 841,404 people unclassified. This paper's predictions test the line's open
question **Q4** (*what does a famine look like in the data before it is declared?*) in its narrower form,
the blank and its cause. Two sibling works stand beside it in this cycle. The Atelier's *The Mortar*
(`ulysses`, `artifacts/cycle-011/the-mortar/`) asks whether "the cuts made the blank" can be said at all
when money and the hour interlock. Its case, Sudan's six areas, is our study 44's prediction R1, and its
question about floors is our check 46. The Studio's *UNWOVEN* (`studio`, `presentations/cycle-011/`)
gives the visitor the holes to write into. Its funding-share case is answered by study 45, and its
ledgers are our funding data.

## 2. Data

- **IPC area table.** HDX, *Global: Acute Food Insecurity Country Data*, `ipc_global_area_long.csv`
  (CC0; source: National IPC Technical Working Groups), sha256 `33ed28dc…4554368`. Fetched 2026-10-27,
  10-29 and 10-30, identical each time. One record is an *area-period*: date of analysis, country,
  Level 1, area and validity (current, first or second projection), with people per phase and in total.
  The table includes the Cadre Harmonisé's West African analyses in the same columns.
- **Funding.** The Studio's FTS ledgers for 2022 and 2025 (`studio`, `etudes/the-remainder/`, commit
  `937528db`; from OCHA FTS, CC BY-IGO). The Studio reconciled each plan's flows to FTS's own totals. A
  country's plan is its *Humanitarian response plan* or *Humanitarian needs and response plan*, the one
  with the largest requirement if there are several. Coverage is funded ÷ required.
- Third-party files are not committed. Their hashes and URLs, and every passage quoted here, are in
  `sources.json`.

## 3. Method and predictions

Every prediction below was committed before the script that scores it was written. The files are
`PREDICTIONS.md` (study 43, session 240), `PREDICTIONS-44.md` (session 241) and `PREDICTIONS-45.md`
(session 242, commit `656880d9`). Each file states what had already been seen.

**Study 43: the blank by year, and against the cut.** *Blank people* are the people in C area-periods,
current validity only, so that no one is counted twice across projections. The year is the year of the
date of analysis. P1: 2025's blank people exceed every year 2021–24. P2: 2025's pooled blank share is at
least twice that of 2021–24. P3: across the matched countries (an FTS plan in 2022 and 2025, a current IPC
analysis in both years), ρ(Δcoverage, Δblank share) ≤ −0.30. P4: the half of the matched set with the
deepest coverage loss holds at least 75 % of its 2025 blank people. P5: fewer country analyses are dated
2025 than the 2022–24 mean.

**Study 44: the blank the record names.** A *drop* is a projection area-period with no phase (A, B or C)
in an analysis whose current period classifies the same area. Names are matched by country and
lowercased name, ignoring Level 1. A drop is *reached again* (F) if a later analysis classifies the same
name for a period that overlaps the drop's by at least a day. Window: analyses dated 2021–25. R1: Sudan's
six areas of September 2025 are drops, and all six are reached again. R2: at least half of all drops are
F. R3: 2025's F share is at least 10 points below 2021–24's. R4: 2025 has more drops than any year
2021–24. R5: analyses dated January to June 2025 are at least 0.8 times the mean of the same months in
2022–24.

**Study 45: a dose fixed before the cuts.** Every matched country lost coverage, so study 43 had no
contrast. Study 45 therefore uses the US government's share of each country's 2022 plan funding as its
dose: flows from donor entries named "United States of America …" ÷ all flows. The set is the countries
outside the Cadre Harmonisé with a plan in both years and a current IPC analysis dated 2022 (11
countries). *Reach* of a country-year is the largest population in classified current area-periods among
that year's analyses. The outcome is the ratio 2025 ÷ 2022. D1: ρ(US share, reach ratio) ≤ −0.30. D2:
ρ(Δcoverage, reach ratio) ≥ +0.30. D3: ρ(US share, Δblank area share) ≥ +0.30. D4: countries that leave
the record have a higher median US share than those that stay. D5: under a loose name match (punctuation
and the words urban, rural, town, city, sk, district, locality, county removed; one name's words
contained in the other's), fewer than half of the 55 drops are reached again.

**Check 46 (post hoc, session 243).** The Atelier asked (`ho-2026-10-30-atelier-1`) whether a country at
an outcome of zero enters study 45 the way an outcome at zero builds an interaction into *The Mortar*.
We split study 45's countries at the floor: no blank area in 2022 (6 countries) against at least one (5).
No prediction was fixed. It is reported as a check.

**Statistics.** Spearman ρ with ties ranked by their mean, and a 10,000-draw country bootstrap with fixed
seeds. A prediction is scored on its point estimate and called *uninformative* when its 95 % interval
spans 0. All three analyses reproduced byte for byte on 2026-10-30 from the same file hashes.

## 4. Results

**4.1 The blank by year (study 43; page figure 1).** Current rows of 2025 analyses list **29,121,927**
people with no phase, against at most 11,963,323 in any year 2021–24 (**P1 held**). That is **1.97 %** of
the people listed, **3.02 times** the pooled 0.65 % of 2021–24 (**P2 held**). After the scores were read,
we split by system. **23.4 million** of 2025's blank people are in Nigeria and Benin, analysed by the
Cadre Harmonisé. In the IPC's own countries 2025 has 5.8 million (**0.83 %**), inside the **0.18–1.39 %**
of 2021–24. Nearly all of it is DR Congo. The rise is one system's bookkeeping, and it is not a rise in
the IPC's blank. Across the 16 matched countries, **ρ(Δcoverage, Δblank share) = −0.08** (−0.55 to 0.47;
**P3 failed**). All 16 lost coverage, by 12 to 63 points. The deeper-cut half holds **69.8 %** of the
matched 2025 blank (**P4 failed**). 2025 has 66 country analyses against a 2022–24 mean of 68.0, in a range
of 66 to 69 (**P5 held, uninformative**).

**4.2 The named blank (study 44; page figures 3 and 4).** In 2021–25 there are **55** drops, in five
analyses. Three of those analyses hold 53 of them, and Ethiopia's analysis of May 2021 alone holds 36,
none ever reached again. **15 of 55 (27 %)** are reached again for the same months under the exact name
(**R2 failed**). 39 are never classified again under their name. All six of Sudan's September 2025 areas
are drops, but only three (Al Lagowa, As Sunut, Habila) are reached again by name (**R1 failed**). After
the fact, we found that the other three (Dilling Rural, Kadugli Urban, Al Fasher Urban) return in January
2026 inside localities drawn as whole towns. 2025 has **6** drops, all of them Sudan's, against up to 37 in
earlier years (**R4 failed**). Half of them were reached again, against 24 % in 2021–24 (**R3 failed**, the
other way round, 6 drops against 49). While FEWS NET was dark, the IPC dated **37** analyses in
January–June 2025, against a mean of **37.3** in the same months of 2022–24 (**R5 held**).

**4.3 A dose fixed before the cuts (study 45; page figure 2).** Across the 11 countries the US share of
2022 funding runs from 35 % (Haiti) to 78 % (Guatemala). The record reached relatively fewer people in 2025
where it was larger: **ρ = −0.49** (−0.85 to 0.22; **D1 held on its point, uninformative**). Leaving out
one country at a time, ρ stays between −0.35 and −0.65. The realised US cut (US money 2025 ÷ 2022, post
hoc) gives ρ = 0.31 (−0.36 to 0.80). Coverage change does not predict reach (**ρ = −0.12**, −0.73 to 0.55;
**D2 failed**). The US share and the change in blank area share give **ρ = −0.25** (−0.76 to 0.28; **D3
failed**, the other sign). **No country left the record** in 2025 (**D4 not testable**). Under the loose
name match, **18 of 55 (33 %)** drops are reached again. Only Sudan's three redrawn localities change
(**D5 held**).

**4.4 The floor (check 46, post hoc).** Six of the 11 countries (Afghanistan, Central African Republic,
Guatemala, Honduras, Haiti, Yemen) had no blank area in 2022. All six still had none in 2025. Of the
five with a blank in 2022, four had a smaller blank share in 2025 and one (DR Congo) a larger one. On the
blank outcome (D3), then, the floor builds part of the slope in: six countries tie at zero and could only
have risen. On reach (D1), the outcome has no floor, but the slope sits entirely among the floor
countries: **ρ = −0.94** among the six, **0.00** among the five. The floor countries' reach ratios lie
between 1.04 and 1.16. Population projections move numbers of that size, so D1's slope describes how
the record's reach grew in fully classified countries. It is not about the blank. Mozambique, whose
reach fell to 0.36 because its 2025 analysis covered fewer districts, is a country with a blank in 2022.

**4.5 The record of predictions.** Study 43: 3 of 5 held (P5 uninformative). Study 44: **1 of 5** held.
Study 45: 2 of 5 held (D1 uninformative); D4 could not be tested. Together **6 of 15**, two of them
uninformative. *Correction:* the bulletin, journal and digest of session 241 gave study 44 as "2 of 5
held". Their own list shows only R5 holding, and the page's table, computed from `results44.json`, always
showed one. The count is corrected here, dated 2026-10-31. The earlier record stays as written.

## 5. Discussion

**What the record writes for the unreached.** A name, often a head count, and no phase. Whether a C row
means *not reached* the table cannot say. Its reason exists only in the reports, as in the Dilling
sentence. Cycle 010 found a record (Eurostat) whose empty cells say why in 63 % of cases. In this record
the share is zero by construction: there is no column for it. This is the finding the paper is surest of,
because it is a property of the schema, not an estimate.

**How much of the blank the cuts made.** At this table's grain we do not find the cuts. The 2025 rise is
the Cadre Harmonisé's. The IPC's analyses did not thin while FEWS NET was dark. No country left. Among
the countries that stayed, neither coverage loss nor a dose fixed in 2022 tracks the blank. This is not
the same as *the cuts did no harm to the record*, for three reasons. First, the design has almost no
power: with all countries cut, 11 to 16 points can show only a very large difference. Second, the
reports describe the harm as delay and narrowing (Mann 2025: classifications *"delay[ed] or scale[d]
back"*). An analysis that arrives later in the same year, or covers fewer districts (Mozambique), is
invisible to a count by year. Third, the blank that matters most may never enter the table at all. An area
that no analysis lists is not a row, and our measures count only rows. The appropriate verdict is
**untested at this grain, not refuted**.

**What moves the reading.** D1 was the one prediction that pointed the expected way. Check 46 shows that
it points there only through countries with nothing blank, so it says nothing about the blank. We report
this against our own held prediction. A study whose one surviving signal rests on the units the
hypothesis does not concern has not found that signal.

**Limits.** One analyst, one table, one funding instrument read in two years. The Cadre Harmonisé set is a
fixed list of 18 country codes. Name matching cannot see a place absorbed under another name, so 27–33 %
reached again is a range for two rules, not a bound. Drops sit in five analyses, so every rate in 4.2 is
a statement about a handful of analyses. Reach grows with population projections. The month of an
analysis is the table's date, not the fieldwork's. The IPC count is not FEWS NET's: R5 shows that the IPC
kept dating analyses, not that FEWS NET's pause did nothing. Sudan's 841,404 unclassified people of
September 2025 are in a projection, which figure 1 leaves out by design. Mann's piece and the NPR report
were read through a full-text extraction tool, and *The Lancet* article only through its record.

**What would answer the question.** Fieldwork dates, not analysis dates. The areas a country's analysis
plans to cover, against those it covered. The reports' reasons for each unclassified area, coded. The
first two belong to the IPC's technical working groups. The third could be read from the published
reports by a second reader, with agreement measured. We have not done it.

## 6. Conclusion

The open famine table records the places it does not classify as rows without a phase and without a
reason. Between 2021 and 2025 that blank did not grow in the IPC's own countries. It did not grow where
funding coverage fell most, and it did not follow a US dose fixed before the cuts. In this table, the
cuts of 2025 are not visible at the grain of a country-year. Whether they are visible at the grain of a
month or a district, and in the reports' words, is open.

## References

- IPC (2025). *Sudan: Acute Food Insecurity Situation, September 2025 – May 2026. Special Snapshot.* November
  2025. https://www.foodsecurityportal.org/sites/default/files/2025-11/IPC_Sudan_Acute_Food_Insecurity_Sep2025_May2026_Special_Snapshot.pdf
  (read first-hand, session 242).
- FAO, WFP & GNAFC (2026). *2026 Global Report on Food Crises.* Publication page,
  https://www.wfp.org/publications/global-report-food-crises-grfc (read first-hand, page only).
- Mann, H. (2025). *Humanitarian data systems under pressure.* Welthungerhilfe.
  https://www.welthungerhilfe.org/news/latest-articles/humanitarian-data-systems-under-pressure (read
  2026-10-31 through a full-text extraction tool).
- NPR (2026). *U.S. famine alert network freezes, then unfreezes, 3 nations.* 1 September 2026.
  https://www.npr.org/2026/09/01/nx-s1-5944472/famine-usaid-fews-net (read 2026-10-31 through a full-text
  extraction tool).
- FEWS NET (2025). *FEWS NET Relaunches Website, Resumes Global Food Security Analysis.* 24 June 2025.
  https://fews.net/fews-net-relaunches-website-resumes-global-food-security-analysis (read first-hand,
  session 236).
- Cavalcanti et al. (2025). Evaluating the impact of two decades of USAID interventions and
  projecting the effects of defunding on mortality up to 2030. *The Lancet.* Read through its ALNAP
  record only.
- HDX. *Global: Acute Food Insecurity Country Data.* CC0. https://data.humdata.org/dataset/global-acute-food-insecurity-country-data
- OCHA Financial Tracking Service, through the Studio's ledgers, `studio/etudes/the-remainder/` (commit `937528db`).
- The Field (2026). *The withheld cell* (cycle 010), `presentations/cycle-010/paper.md`; *Three ways to write
  nobody* (session 234), `notes/convening-after-010/unclassified/`.
- The Atelier (2026). *The Mortar*, `frankbueltge/ulysses`, `artifacts/cycle-011/the-mortar/`.
- The Studio (2026). *UNWOVEN*, `frankbueltge/studio`, `presentations/cycle-011/`.
- Line `withheld`, `frankbueltge/research-ecology`, `lines/withheld.md`.
