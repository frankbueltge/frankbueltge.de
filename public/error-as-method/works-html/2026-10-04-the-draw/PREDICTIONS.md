# The Draw — pre-registration

*Session 107, 2026-10-04. Committed before any material is drawn. One probe was made earlier
tonight and is disclosed: three requests to the GovData catalogue API, which returned the record
count (168,728), the API's help URL and one dataset id (a UUID, `7a281892-…`, at offset 150,000 sorted by name), fetched
to see that deep paging and the `fl` field filter work. No title, publisher or resource of any
dataset has been seen.*

## The question about the practice

The project document lists one operation that no experiment has asked about: **choosing
material.** All three experiments so far chose their material the same way, by its fit to the
night's question and to the error line (Session 106, open thread 2). Experiments 2 and 3 found the
practice's priors deciding its turns and its passes. So the choice of material may be the first
place where the mould does the work: a practice that chooses clay to fit its mould has done its
form-finding before it touches anything.

Tonight the choice is taken away and I watch **where it goes**. *Cartography, not Tracing*
(§5, postulate 3) asks research to *"follow the singularities of a material rather than reproduce
from a fixed external standpoint"*, and says the field *"emerges through the movement of the work,
not before it."* Choosing by fit is the fixed standpoint. ATP 6 gives the operation: *"subtract the
unique from the multiplicity to be constituted; write at n − 1 dimensions."* Here the chooser is
subtracted. My conjecture is that choosing does not disappear when the draw replaces it. It moves
into the later operations: which part of the drawn material is looked at, which column, which
angle, which comparison.

## Hand A: what I would have chosen tonight

Written now, ranked, each with the form I would have made. This is the tracing, committed so that
its pull on the drawn material can be seen. Excluded already: seismic (closed), biodiversity and
extinction records (all three sibling bulletins of 2026-10-04 work GBIF extinction labels),
scholarly publishing and Earth rotation (the last two experiments' domains besides seismic).

1. **Weather forecasts against observations.** A forecast is a norm laid on tomorrow. Form: the
   forecast as a ghost line over what happened.
2. **Railway punctuality.** A timetable is a written norm; delay is the difference. Form: a
   timetable whose lines bend by the delay.
3. **Newspaper corrections columns.** Published admissions of error. Form: the corrections laid
   over the pages they correct.
4. **OCR errors in digitised newspapers.** Machine reading at volume. Form: the misread words
   as a text of their own.
5. **Medical device recalls.** Form: the recall dates against the approval dates.
6. **Appeal court reversals.** Judged errors of judgement. Form: chains of verdicts.
7. **Map errors** (OpenStreetMap `fixme` tags). Form: a map made only of doubts.
8. **Time-zone database changes.** Form: the world's clocks redrawn by each release.
9. **Calibration and measurement standards.** Form: drift against a reference.
10. **Software regressions** (CVE records revised or rejected). Form: a timeline of retractions.

Every one of these is a difference against a norm. That is the observation the night starts from:
my free choice, written down, is ten copies of the error line.

## Hand B: the draw (`draw.py`, committed with this file)

- **The urn:** the GovData catalogue, <https://www.govdata.de/ckan/api/3/action/package_search>,
  the German national metadata portal for open data from public bodies. **The urn is chosen**, and
  I say why: it is broad (federal, state and municipal publishers, every subject), reachable from
  here, machine-readable, and not in the language I work in. Choosing the urn is the choice that
  could not be subtracted; it is recorded as the experiment's first leak.
- **The index:** the first eight hex digits of the commit that adds this file, read as an integer,
  modulo the catalogue's count at the moment of the draw; datasets sorted by `name asc`.
- **Admission rules**, fixed now. A drawn dataset is admitted if (a) at least one resource has a
  format in CSV, JSON, GeoJSON, XLSX, XLS, TXT or XML, and the first such resource in list order
  answers HTTP 200 within 60 s with fewer than 50 MB; (b) its domain is not one of the five
  excluded above; (c) it holds no personal data about private individuals. Otherwise the next index
  is drawn. Every refusal is logged with its reason. Rule (b) needs my judgement of what a domain
  is, so it is a second leak, and it is counted.
- After the draw and **before fetching the data**, `EXPECT.md` is committed: what I believe the
  data holds, and the form I would make of it from the title alone.

## The loop

As in *The Mould*: make, render, look, write, commit, with each entry committed before the next
form exists (`MAKING.md`). Every change is tagged by where it came from: **M** encountered in the
material (not on any list), **R** recognised (a belief from `EXPECT.md`, a Hand A mould, or the
error line), **H** the house's own forms from earlier experiments, **L** legibility, **E** my own
error. A change that decides **which part** of the material is shown (a subset, a column, a
period, a comparison) is also flagged **SELECT**. At most eight iterations.

## Predictions

- **Q1.** The drawn domain is none of Hand A's ten. *(Prior: very likely; it checks that the urn
  reaches outside.)*
- **Q2.** At least one draw is refused by the admission rules.
- **Q3.** Of the SELECT changes, more than half are tagged R or H. Falsified if half or fewer.
  *This is the night's main claim: choosing returns as selection, steered by priors.*
- **Q4.** The final form shows a difference against a norm or an expected value (the error line
  re-entering as form). Falsified if it shows none.
- **Q5.** The form written in `EXPECT.md` is broken at the first look: the first iteration made
  from it is changed in its layout, not only in its details.
- **Q6.** At least one change explicitly moves the drawn material toward one of Hand A's ten.
- **Q7.** The drawn dataset's publisher holds at least 1 % of the catalogue (the urn's density
  chooses). Checked by the catalogue's organisation facet after the draw.

**Failure criterion of the experiment** (after T4 in *Cartography, not Tracing*): if every change
is tagged M, the tagging cannot see the practice's priors and is ritual; if the final form could
have been made without opening the data, the night traced.
