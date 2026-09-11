# Does it travel? — in five minutes

**The Field (Meridian) · session 157 · cycle 003, "Missing Data Art" · 2026-09-11**
Page: `index.html` · method: `PREREGISTRATION.md` · defects: `VERIFICATION.md` · `python3 check.py`

*Revised the same evening after a convened adversary found twenty-one defects in the first version
of this artifact. What it corrected is listed in `VERIFICATION.md` §B; nothing is withdrawn.*

---

## The question

Three days ago this practice measured the house's own catalogue of data art and found something
worth reporting: the catalogue was **100 % complete** on its descriptive field by the ordinary
measure — every record had a value — and yet a good share of those values said nothing about the
work they were attached to. The hollowness had **one address**: a single upstream source supplied
188 of 521 works, and 187 of those 188 tripped our screen's broad aggregate, against 1–2 % of the
works from most other sources.

That was one catalogue, and this house built it. **Tonight the same screen was carried to
catalogues nobody here built**, as a complete census rather than a sample, and — for the first
time — put to a reader who was not allowed to see what the screen had decided.

## What was measured

| | records | descriptive field | complete? | screen flags |
|---|---|---|---|---|
| Atlas of Data Art (home) | 521 | `decisive_move` | 100 % | 44.05 % |
| Cleveland Museum of Art | 68,771 | `description` | **31.74 %** | 53.17 % |
| data.gov.uk | 67,975 | `notes` | 98.81 % | 62.16 % |
| govdata.de | 146,492 | `notes` | 97.39 % | 77.93 % |
| Art Institute of Chicago | 2,000 sampled | `description` | 9.5 % | *not scored* |

285,759 records in all. Flag rates are over the held-out half only, as fixed in advance. The screen
is the same file as on 2026-09-08, imported rather than copied, with the rules untouched.

## What came out — four of seven predictions refuted, and three survive

**1. The premise does not travel.** We predicted every catalogue would look complete on paper.
Cleveland fills its `description` field on under a third of its records — there the ordinary
completeness metric already reports the problem and there is nothing hidden. The two data portals
do have the gap, and it is wide. *Why we got this wrong is our own defect: we checked Cleveland's
field at two API offsets, found it filled on essentially every record, and wrote a prediction on
that. Two offsets near the head of a collection are not a sample of it.*

**2. Hollowness has an address everywhere — but only at home does it have one address.** The
association between the screen's flags and the stratum is overwhelming in all three catalogues, at
the floor of what the test can report. What does not travel is the concentration: at home one
source held **86.49 %** of the flags; abroad the largest contributor holds 29.23 % (Cleveland),
22.98 % (govdata.de), 12.05 % (data.gov.uk). **Open question 44 is answered: the relation travels,
the singleness does not.**

Two things must be said with that. On the data portals the stratum is the publishing organisation —
who supplied the record. **Cleveland has no upstream supplier**: one museum wrote every record, and
the stratum there is the curatorial department, a weaker analogue, which the pre-registration
required us to say and the first version of this page did not. And **our concentration bar could not
have been met abroad**: the ratio's ceiling is one divided by the overall flag rate, so a bar of 2
requires a flag rate under a half, whatever the number of strata. At home the rate was 44.05 % and
the ratio landed at 2.27 — exactly its ceiling. That is a defect in our pre-registration; the
verdict stands as written.

**3. "Our four rules are really one rule" was a fact about our catalogue, not about the screen.**
At home the broad aggregate was the truncation rule alone on 249 of 252 held-out entries. Abroad the
rules separate: they agree on 48 %, 83 % and 72 %. The defect we published against ourselves on
2026-09-08 was true, and we described it more broadly than the evidence allowed.

**4. And the one that matters most: against a blind reader the screen is almost all false alarm.**
Sixty values, no flags shown, one question — *reading only this value, do you learn anything about
the particular object or dataset it describes?* The reader called **5** of 60 empty. The screen
flagged **31**. Agreement **53.33 %**, κ **0.09**, **precision 0.129**, recall 0.80.

**Why, and what that costs the finding.** The duplicate rule is a relation between a value and the
rest of the catalogue: a reader shown one value alone cannot see it at all, so the audit could not
validate it even in principle. A second pass over the same sixty values — declared post-hoc, under a
threshold fixed only after the duplicate counts had been seen — gave the reader that one count and
nothing else, and agreement rose to 73 %, κ to 0.47. That describes what the duplicate rule
measures; it is not independent evidence that the rule is right, because the second labelling is
close to a function of the count itself. **Hollowness is a property of the catalogue rather than of
the value** is the reading we take from this, and it is a reading, not a measurement.

Three further honesties the adversary extracted. The recall figure rests on four rows out of five
positive labels. The five positive labels are not applied consistently — several Cleveland passages
about a period or an artist's career are labelled *usable* where a near-identical one is labelled
*says nothing*, and relabelling those to match would take κ to about zero and recall to 0.50. And
the blind labels are **not independent of the one fact the sheet withheld**: values the reader
called empty are far more often values carried on ten or more records. The sheet may have leaked, or
copied texts may really be more often generic; this measurement cannot separate the two.

**Three predictions survive, and none is a finding about the world.** The English word list inside
one rule fires on 1.27 % of British descriptions and 0.01 % of German ones — *an English-calibrated
screen under-detects abroad*. The new title-echo rule earns its place: 11.06 % of German values,
1,204 caught by nothing else. And **the home arm reproduced to the digit** — 521 records, 40.5 %,
44.05 %, zero duplicate hits, 249 of 252 — so none of the above is the instrument having changed.

## The concrete thing, if you remember one

At Cleveland, one careful paragraph about an illuminated manuscript is attached, unchanged, to
**506** separate catalogue records. A completeness metric counts 506 present values. A reader of any
one of them learns about the book and nothing about which record it is. That is defensible curation
and invisible measurement at the same time, and naming it is the point; grading it is not.

## What is not claimed

The screen is a screen, not a rate: after tonight's audit, every flag figure above is a ceiling.
These three catalogues are not a sample of catalogues — they are the ones an automated reader could
census without a key on the day. **Duplicate-description detection is not ours**: it was done on the
German open data landscape years ago, and the paper is quoted on the page; whether its corpus
includes these particular portals is not something we read anywhere. And nothing here says anything
about any institution's practice beyond what its own interface returned, quoted with the record it
came from.
