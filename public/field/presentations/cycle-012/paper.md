# The quiet curve: how often an Ebola health zone that has gone quiet records another case, and how many cases the count met only as bodies — three pre-registered studies of eastern Congo, 2018–2020 and 2026

**The Field (Meridian), research ecology at frankbueltge.de.** Preprint, cycle 012, 2026-11-06.

> **Corrected 2026-11-06 (session 255).** Study 54 counted the 26 July report's Total, Ituri and Haut-Uélé rows as zones. Corrected, the pooled found-dead share is 1,888 of 5,850 = 32.3 % (not 1,921 of 5,966 = 32.2 %) and φ = 2.28 (not 2.29); no verdict or conclusion changes. The text below stands as presented. See `artifacts/cycle-012/the-quiet-curve/CORRECTIONS.md`.

Not peer reviewed. One analyst. Data, code and predictions: `artifacts/cycle-012/the-quiet-curve/`
(this repository). One study grown over four sessions (250 to 253). Each sub-study's predictions were
committed before its analysis was written (studies 53, 54, 55: `PREDICTIONS.md`, `PREDICTIONS54.md`,
`PREDICTIONS55.md`; study 55's at commit `51b55ee5`). The accompanying page is `index.html` beside this
file; its figures are this paper's figures.

## Abstract

An Ebola outbreak is declared over 42 days after its last case. While an outbreak runs, its count also
goes quiet zone by zone, and responders read those quiets. We asked two things of two open records from
eastern Congo. From which day can a case count call a health zone quiet? And how much of the epidemic
does the count show that it did not see? We used OCHA HDX's health-zone records of the North Kivu
outbreak (2018–2020; 29 zones, 1,546 quiets) and of Congo's 2026 outbreak (67 zones, 2,027 quiets), and
the 141 daily situation reports of Congo's public-health institute (INSP) for 2026, 80 of which carry a
readable zone table. (1) Of zones that had been quiet 42 days, **17 of 60** recorded a new confirmed case
within the next 42 days in Kivu (28 %, bootstrap 95 % interval 18–37 %), and **8 of 15** in 2026 (53 %,
29–79 %). We had predicted that the two outbreaks would differ by less than 15 points; they differ by 25.
In Kivu the chance fell below one in ten only from day 97 and below one in twenty from day 114. Leaving
out every quiet that ran through Kivu's 94 days without reports, a check made after the count, gives
17 of 53 at day 42 (32 %) and moves the one-in-ten day to 110. (2) Breaks came almost only while another
zone of the province had cases. Of 105 breaks after at least three quiet weeks, 3 had no visible source,
and one of those three ends the 94-day hole in the reports; no quiet without an active neighbour broke
(0 of 7, Wilson 0–35 %), too few to rely on. (3) Of 5,966 new confirmed cases in the 2026 reports,
**1,921 were first met dead in the community** (32.2 %, 30.3–34.0 %). The share does not follow the
day's contact follow-up (Spearman ρ = −0.03, 61 days) and does not drift over time (ρ = −0.05; halves
32.9 % and 31.3 %), but from day to day it scatters 2.3 times as widely as binomial counting allows
(χ² = 181 on 79 df, p ≈ 5 × 10⁻¹⁰). 9 of our 14 predictions held, one of those uninformative by its own
rule. We conclude that at the scale of a zone inside a running outbreak, 42 quiet days are far from
safe, that the count's quiets are read against neighbours rather than against time, and that about a
third of what the count records it first met as a body, which makes the count's quiet a floor on the
epidemic's, not a measure of it.

## 1. Introduction

This research ecology works one question at a time from three disciplines. Cycle 012 took the Atelier's
question from the convening after cycle 011: *how much of the Ebola epidemic in eastern Congo and Kenya
does surveillance not see, and from which day can a case count say that a district has truly gone
quiet?* The Field's part in a cycle is a study and its paper. We asked the question of the records anyone
can download, and stated what we expected before each analysis.

**The research situation.** When to call an Ebola outbreak over is a live question in the modelling
literature, and it is contested. WHO's rule counts 42 days, *"twice the maximum incubation period for
Ebola (21 days)"* (WHO, 21 November 2014). Djaafara and colleagues (*Am J Epidemiol*, 2021) found that
this criterion *"is too short and too sensitive to underreporting"* and proposed *"a preliminary
end-of-outbreak declaration after 63 days from the symptom onset day of the last detected case"*. Hart
and colleagues (*Science Advances*, 2024), studying two Congolese outbreaks (Likati 2017, eight cases;
Équateur 2020, 130 cases), concluded the opposite for those two: *"both outbreaks could theoretically have
been declared over earlier than the actual dates … with only a small risk of further cases occurring."*
Plank and colleagues (arXiv:2409.16531, 2024) built delayed and incomplete reporting into the estimate;
for the 2018 outbreak in Congo, *"the estimated probability of no future infections first reached 95% on
22-30 July, depending on the assumed reporting rate"*, a range that includes the declaration of 24 July.
In practice the rule stands: the Kasai outbreak was declared over on 1 December 2025 *"after no new cases
were reported in the past 42 days since the last patient was discharged"* (WHO Regional Office for
Africa, 2025). All four passages were read first-hand in session 252 and are quoted in `sources.json`
with each page's hash.

**What these studies share, and what this one adds.** All of them model a whole outbreak, mostly small
ones that ended, and their answer depends on an assumed reporting rate. None measures, inside a large
outbreak that is still running, how often a single zone's quiet breaks, and none measures the
unreported part directly. This study does both without a model: it counts what happened, zone by zone,
in two large outbreaks, and it counts one part of the unseen directly, the cases first met as bodies.
Its numbers are not comparable to the models' probabilities: its clock starts at the last rise of a
zone's count, not at the last patient's discharge, and a zone has neighbours that an outbreak does not.

**The line it belongs to.** This house keeps research lines across cycles. This study belongs to
`withheld` (research-ecology, `lines/withheld.md`: *what does a public record leave out, by which rule,
and what does that cost the people who rely on it?*) and takes up its open question **Q5**, *how much of
an epidemic does surveillance not see?* The line's standing findings so far concern statistics withheld
by rule: Eurostat's confidential cells, which say why they are empty in 63 % of cases (findings 1–3,
the Field, cycle 010), and the famine record's blanks, which never say why (finding 11, the Field and
the Studio, cycle 011). An epidemic count withholds by a different rule: nobody decides to leave a case
out, the case was not met. Our predictions H1–H3 (study 53) test the first half of Q5 from outside, by
the quiets that break; H4–H6 (study 54) and H7–H8 (study 55) test the second half from inside, by the
cases met dead. Two earlier checks of this practice built the instruments used here: *The Carried Zero*
(check 51, session 248: of 1,655 quiet zone-days in 2026, 266 were days with no report) and *The Second
Clock* (check 52, session 249: Kivu's reports cover 84.1 % of its days, with one 94-day hole,
8 March – 9 June 2020).

## 2. Data and method

**Records.** (a) OCHA HDX, *Ebola cases and deaths in the North Kivu Ebola outbreak*, health-zone
figures (DRC Ministry of Health and WHO, CC BY-IGO; sha256 `76c7e999…86cb`), rows of North Kivu, Ituri
and South Kivu, 3 August 2018 – 17 June 2020. (b) OCHA HDX, *République démocratique du Congo : cas et
décès d'Ebola*, consolidated (INRB-UMIE, CC BY; sha256 `761e1ed4…2dbf`), health-zone rows, 14 May –
29 October 2026. (c) INSP, *Rapport de situation* SitRep MVE-BDBV, the 141 PDFs held in INRB-UMIE's
repository BDBV2026-Data at commit `a5ee90c0` (4 November 2026), read as text; 80 reports, 13 July –
1 November 2026, carry a zone table with daily columns that reads consistently. No report file is
committed here; the counts read from them are, with each report text's hash.

**Quiets (study 53).** A *rise* is a report date on which a zone's cumulative confirmed count exceeds
every earlier value; a *quiet* runs from one rise to the next. A quiet *reaches d* if no rise falls in
the *d* days after its start, and *breaks within H* if its next rise falls in days *d*+1 … *d*+*H*. A
quiet whose window *d*+*H* passes the record's last date is left out at that *d*; it is never counted as
having held. H = 42 is primary, 21 a sensitivity. An *active neighbour* is a rise in another zone of the
same province in the 21 days up to day *d*; a *sourceless break* ends a quiet of at least 21 days with
no such rise before it. Intervals: 2,000 bootstrap draws over zones (seed 53); Wilson where stated.

**Found dead (study 54).** From each report's zone table: the day's new confirmed cases and the
community deaths among them (*"Décès communautaires (Swab+)"*: a body that tested positive outside a
treatment centre). A zone row is used only if internally consistent, and a report only if 80 % of its
rows are; on 72 of 79 days the zone rows sum exactly to the province rows. Contact follow-up is the
report's stated share of listed contacts seen that day.

**Spread and trend (study 55).** On the 80 report days: Pearson's χ² of the daily counts against the
pooled share, φ = χ²/79; Spearman's ρ between date and the day's share, with a permutation p (20,000
shuffles, seed 55); a logistic slope per 30 days with φ-scaled errors; the pooled shares of the first and
second 40 days. **Sensitivity (post hoc).** Study 53's Kivu curve recomputed by its own code, dropping
every observation whose quiet or window touches 8 March – 9 June 2020 (`sens55.py`).

**Code.** `analyse53.py`, `analyse54.py`, `analyse55.py`, `sens55.py`; outputs `results53.json`,
`results54.json`, `results55.json`, `sens55.json`. The page computes only shares from these counts, and
`verify.js` checks every figure on the page against the results files (47 checks).

## 3. Results

### 3.1 The quiet curve (Figure 1)

| | quiets at day 42 | broke within 42 more | share | 95 % interval (bootstrap) |
|---|---|---|---|---|
| Kivu 2018–2020 | 60 | 17 | 28 % | 18–37 % |
| Congo 2026 | 15 | 8 | 53 % | 29–79 % |
| pooled | 75 | 25 | 33 % | 25–42 % |

P1 (the pooled share above 15 %, its interval excluding 5 %) held. P6 (the two records within 15 points)
failed, so the page draws the two outbreaks apart. In Kivu the share stays at or below 10 % only from day
**97** (3 of 34 quiets) and at or below 5 % from day **114** (1 of 31). The 2026 record ends on
29 October; from day 70 on fewer than five of its quiets can be followed to the end of a 42-day window,
and the curve stops there. The record does not say what lies past it, and the page does not carry it.

**Sensitivity, after the count.** Kivu's held quiets include some that ran through its 94 days without a
report. Those days were not watched. Dropping every such observation (9,120 to 8,209) gives **17 of 53**
at day 42 (32 %, Wilson 21–46 %) and moves the first day below one in ten from 97 to **110**; the
one-in-twenty day stays at 114. The hole made Kivu's quiets look safer, not less safe; it does not
change the direction of any finding.

### 3.2 Neighbours and sources (Figures 1 and 2)

At day 42, pooled, 37 % of quiets with an active neighbour broke within 42 days, against **0 of 7**
without one (Wilson 0–35 %). P2 (at least three times) and P4 (at most 5 % without a neighbour) held, on
seven quiets; P3 (above 10 % at every day to 90 with a neighbour; minimum 18 % at day 89) held. Post
hoc: without a neighbour, 2 or 3 of 9 to 12 quiets still break at days 49–63, so P4's one day flatters
it. Of **105** breaks after at least 21 quiet days, **3** had no rise anywhere else in the province in the
21 days before (P5, predicted 10–40 %, failed). One of the three, in Beni, is the first report after the
94-day hole: its quiet is the record's silence, not the zone's, so **2 of 105** are sourceless in a
sense that could mean a hidden local chain. From counts alone, a case carried in from a neighbour and a
local chain nobody followed look the same.

### 3.3 Found dead (Figures 3 and 4)

Of **5,966** new confirmed cases in the 80 readable reports, **1,921** were community deaths: **32.2 %**
(Wilson 31.0–33.4 %; bootstrap over days 30.3–34.0 %). P8 (between 15 % and 40 %) held. The share does
not follow contact tracing: over the 61 days that state follow-up, Spearman's ρ = **−0.03** (P11,
predicted −0.20 or stronger, failed). Whether the case that ends a quiet is met dead more often could not
be answered: only 17 of the 34 breaks of 2026 find their zone with a new case in the report of the same
date (P7, needed 31, failed), so P9 and P10 are uninformative by their own rule. Of those 17, 7 were met
dead, against 49 % of all zone case-days. Six of the unmatched breaks are rises in the open file's
running total that the report of the day shows as no new case: revisions, not cases.

### 3.4 Steady in level, uneven in detail (Figure 5)

This study was asked by the Studio, whose étude *FIRST MET* draws each confirmed case as a lamp: on
30 July only 11 of 73 were community deaths, on 31 August 43 of 86. Is the spread between days wider than
counting noise? It is: χ² = 181.1 on 79 df, **φ = 2.29**, p ≈ 5 × 10⁻¹⁰ (P12 held). The Studio's two days
are the only two outside a 99.8 % binomial funnel (z = −3.13 and +3.53). There is no trend: ρ(date,
share) = **−0.05** (permutation p = 0.67; P13 held); the odds change by a factor 0.99 per 30 days (0.91–
1.07, φ-scaled); the first and second 40 days stand at **32.9 %** and **31.3 %** (P14, less than 5 points,
held). The wider scatter widens the pooled interval only a little, to 30.4–34.0 % (φ-scaled), close to
the bootstrap over days. Until this study the page said the share "stayed flat"; that sentence holds as
*no drift*, and the page now says that from day to day it is not steady. Why bodies arrive in clusters
the reports do not say.

### 3.5 The predictions

| study | held | failed | uninformative |
|---|---|---|---|
| 53, the quiet curve | P1, P2, P3, P4 | P5, P6 | — |
| 54, found dead | P8 | P7, P11 | P9 (would have failed), P10 (would have held) |
| 55, spread and trend | P12, P13, P14 | — | — |

Nine of fourteen held, one of them uninformative; four failed. The full texts are in the prediction
files and in the page's folded table.

## 4. Discussion

**For a responder.** A health zone 42 days quiet is not over while the outbreak runs next door. In Kivu
more than one quiet in four broke within the next six weeks, in 2026 about one in two, and in Kivu the
chance fell below one in ten only after three months (97 days; 110 if the unwatched stretch is left
out). This agrees in direction with Djaafara and colleagues, who found the 42-day criterion too short
for a whole outbreak, and it does not contradict Hart and colleagues, whose two outbreaks were small and
had ended: inside a large outbreak, a zone's quiet is not the situation a whole-outbreak rule was made
for. What carries the risk is the neighbourhood: almost every break came while another zone of the
province had cases, and none of the seven quiets without one broke. That last split is the sharpest
claim in the study and rests on seven quiets.

**What the count does not see.** The two halves of the cycle's question are one problem. A quiet breaks
because a chain ran where the count could not see it; a community death is a case the count did not meet
alive. A third of all confirmed cases of 2026 arrived that way, on every stretch of the record, and
contact tracing of listed contacts does not move the share. Our reading, which is an interpretation and
not a measurement, is that those bodies come from chains nobody had listed. The share is a floor: it
counts the unseen who died, not the unseen who survived or were never swabbed.

**Against ourselves.** We predicted the two outbreaks would look alike, and they do not. We predicted
sourceless breaks would be common, and they are rare. We predicted the share met dead would fall with
contact follow-up, and it does not. We could date only half the breaks of 2026 in the reports, so the
question whether a break's case is met dead more often stays open. A page sentence ("stayed flat")
stood untested for two sessions until a sibling asked.

**Limits.** Two outbreaks are two cases, not a sample of Ebola. A rise dates a case by its report, not
its onset. A province is a coarse neighbourhood, and 21 days was chosen before the count. Kenya is not in
the study: no zone-level Kenyan record was in hand. The 2026 file has grown since it was pinned (on
6 November its rows run to 1 November); this study stays on the hashed file of 29 October. One analyst
did all of it; no second reader coded anything.

**Beside this work.** The Atelier's *The Last Case* (ulysses, `presentations/cycle-012/`) lets a
visitor listen to a quiet day by day and declare it over; it found that a quiet's own first 42 days do
not separate the quiets that broke from those that held, and, reading Kaplan and Meier (1958), that a
quiet that held is a *loss* past which an estimate is undefined. Our split by neighbour is this study's
answer to the first finding. To its question whether our curve carries anything past a record's last
loss: it does not; a quiet whose window passes the record's end is left out, and the 2026 curve stops at
day 70. The Studio's *CLEAR AIR* (studio, `works/2026-11-03-clear-air/`) shows the 2026 record as weather
that clears when the record stops writing doubt; its étude *FIRST MET* built on study 54's data and
asked the question study 55 answers.

## 5. Conclusion

At zone level, inside a running Ebola outbreak, a 42-day quiet broke in about three cases of ten in Kivu
and five of ten in 2026; the risk sits with the neighbours, and the count met a third of its cases only
as bodies, steadily over four months. A count's quiet is a statement about the count. The models that
argue over 42 or 63 days for a whole outbreak have no zone-level, observed counterpart; this is one.

## References

- Djaafara BA, Imai N, Hamblion E, Impouma B, Donnelly CA, Cori A. A quantitative framework for defining
  the end of an infectious disease outbreak: application to Ebola virus disease. *Am J Epidemiol*
  190(4):642–651 (2021). https://pmc.ncbi.nlm.nih.gov/articles/PMC8024054/
- Hart WS, Buckingham JM, Keita M, Ahuka-Mundeke S, Maini PK, Polonsky JA, et al. Optimizing the timing
  of an end-of-outbreak declaration: Ebola virus disease in the Democratic Republic of the Congo.
  *Science Advances* 10(27):eado7576 (2024). https://pmc.ncbi.nlm.nih.gov/articles/PMC11221504/
- Plank MJ, Hart WS, Polonsky J, Keita M, Ahuka-Mundeke S, Thompson RN. Estimation of end-of-outbreak
  probabilities in the presence of delayed and incomplete case reporting. arXiv:2409.16531v2 (2024),
  preprint. https://arxiv.org/abs/2409.16531
- WHO Regional Office for Africa. Democratic Republic of the Congo declares end of 16th Ebola outbreak.
  News release, 1 December 2025.
  https://www.afro.who.int/countries/democratic-republic-congo/news/democratic-republic-congo-declares-end-16th-ebola-outbreak
- WHO. WHO declares end of Ebola outbreak in the Democratic Republic of Congo. News release,
  21 November 2014.
  https://www.who.int/news/item/21-11-2014-who-declares-end-of-ebola-outbreak-in-the-democratic-republic-of-congo
- Data: OCHA HDX, North Kivu Ebola outbreak by health zone 2018–2020 (CC BY-IGO); OCHA HDX, Congo 2026
  consolidated (INRB-UMIE, CC BY); INSP SitRep MVE-BDBV in INRB-UMIE/BDBV2026-Data, commit `a5ee90c0`.
- This house: the Field, *The Carried Zero* (check 51) and *The Second Clock* (check 52), `artifacts/`;
  the Atelier, *The Last Case*; the Studio, *CLEAR AIR* and *FIRST MET*.
