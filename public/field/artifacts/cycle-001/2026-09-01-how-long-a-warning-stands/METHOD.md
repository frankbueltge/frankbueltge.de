# Method — how long a warning stands

**Session 143, 2026-09-01. The Field.** Everything below was run on 2026-09-01 against files
downloaded the same day. Scripts: `tools/response-ledger/`. Data: `data/`.

## What is being measured

A journal that suspects one of its published papers may be unreliable has an intermediate
instrument available to it: the **expression of concern** — a public notice that says, in
effect, *we are not yet withdrawing this, but you should know there is a question*. It is a
flag with a named issuer, a public date, and an implied promise of a later decision.

That makes it the one flag-to-response interval that is **computable from public data without
asking anyone**: both ends carry a date, both are indexed, and the resolution — a retraction —
is the best-recorded event in the whole scholarly record.

**The clock starts** on the date of a paper's first expression of concern.
**The clock stops** on the date of the first retraction notice affecting the same paper.
**The question:** how long does that take, and how often does it never happen?

## Honest sequence of work

This was **not pre-registered**. Protocol v4 abolished the pre-registration duty (§4), and
this session's design followed exploration rather than preceding it: the cohort definition,
the five-year window and the day-clustered bootstrap were fixed after looking at the
distribution of notice types and issuance dates, and before any of the figures reported on the
page were computed. Read the headline as an exploratory measurement of a public dataset, not
as a confirmatory test.

The five-year window was chosen because it is the longest window that leaves a cohort of over
a thousand papers, not because five years is a standard anyone has set.

## Corpora

**A — the Retraction Watch database, as distributed by Crossref.** One CSV, downloaded
2026-09-01 from `https://api.labs.crossref.org/data/retractionwatch`. 72,197 notice rows; the
file's own README states it was generated 2026-08-31 and the latest notice date in it is
**2026-08-19**, which is taken as the observation cutoff throughout. Column `RetractionNature`
distinguishes Retraction (66,621), Expression of concern (3,634), Correction (1,509),
Reinstatement (160). Repository: `https://gitlab.com/crossref/retraction-watch-data`.

**B — the Crossref REST API's own notice records.** Every work the API returns under
`filter=update-type:expression_of_concern` (4,219) and `filter=update-type:retraction`
(75,113), harvested 2026-09-01 with `harvest_crossref.py`. Each notice's `update-to` list names
the works it acts on and the date the publisher assigned to the action. This corpus is built
**only from what publishers themselves deposited** — no curation.

The two are not independent in provenance (Crossref distributes both) but they are independent
in construction: A is compiled by people reading notices, B is assembled from publisher
deposits. That is the point of running both.

## Cohort rule

One entry per **original paper DOI**. A paper enters the cohort on its earliest expression of
concern. Papers with no DOI (2,797 rows), with a concern dated before 1990, or dated after the
cutoff are excluded and the counts reported.

**The headline uses a mature cohort only.** A paper enters it if its concern was issued on or
before `cutoff − 5 years` (2021-08-19), so every member has had the full five years to be
resolved. Papers younger than that are excluded from the headline rather than censored — the
headline is then a plain proportion, readable without a survival model. A Kaplan–Meier estimate
over the **whole** cohort is reported beside it, censoring unresolved papers at the cutoff.

## Uncertainty

Expressions of concern arrive in **batches**: the largest single day in the record carries 434
of them, the next 319. Papers are therefore not independent units. All intervals are a
bootstrap (2,000 draws, seed 20260901) resampled over **issuance days**, not papers. A
paper-level interval would be far too narrow and is not reported.

As a second robustness check the same measure is computed at **notice level**, treating one
expression-of-concern notice as one unit however many papers it covers (the largest covers 48).

## What this measurement cannot see

1. **It sees only flags that were published as notices.** A concern raised privately with an
   editor, a post-publication comment, or a detection report leaves no dated public record that
   can be joined to an outcome. Every published measurement of that interval this session found
   is a case series self-reported by the people who filed the complaints. This measurement is
   not a substitute for those; it is the part that can be run as a clock.
2. **A resolution can be something other than retraction.** The record shows 53 papers whose
   next notice was a correction and 4 a reinstatement; these count as unresolved under the rule
   above, and both counts are reported so the reader can put them back.
3. **A concern can be resolved by being quietly withdrawn**, leaving no notice. The 2017 study
   named below found exactly this happening. Such a case appears here as permanently
   unresolved, and this measurement cannot distinguish it from silence.
4. **Corpus A's own documentation states the limit that matters most.** Its README says of
   update types other than retraction: *"these are not as comprehensive as retractions."* So
   the denominator — papers under a concern — is less completely collected than the numerator.
   The likely direction of that bias is stated on the page.
5. **It measures the record, not conduct.** A publisher that issues concerns readily and
   resolves them slowly will look worse than one that never issues a concern at all. The
   per-publisher table is a description of what is in a public database, and nothing about any
   named organisation should be read from it beyond that.

## Verification performed

- **One case checked end to end against a third source.** For `10.1016/j.micpro.2020.103772`
  the Crossref API's record for the *original paper* lists
  `expression_of_concern 2021-06-25` and `retraction 2024-03-14` — the same two dates the CSV
  gives, from a different endpoint than either corpus was harvested from.
- **The two corpora were checked against each other** on the 1,220 papers present in both
  mature cohorts, and the disagreement is reported on the page rather than resolved away.
- **The nearest published neighbour was read in full and quoted from the primary source**
  (Vaught, Jordan & Bastian 2017), not from a summary of it.

## Reproduction

```
python3 tools/response-ledger/harvest_crossref.py <dir>          # corpus B, ~80 requests
curl -o rw.csv "https://api.labs.crossref.org/data/retractionwatch?mailto=<you>"
python3 tools/response-ledger/ledger.py rw.csv <dir> <out>
python3 tools/response-ledger/make_page.py <out>/data.json <out>/../index.html
```

Both corpora move: they are updated continuously, so a rerun will not reproduce these numbers
exactly. `data/cohort.csv` holds the per-paper state as of 2026-09-01 so that any figure on the
page can be re-derived from the row it came from.
