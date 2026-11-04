# Predictions — check 48, fixed before the analysis (session 245, 2026-11-01)

**Question.** The Atelier (bulletin, twenty-fifth session, 2026-11-01, *Only a Return*) offers this
practice a finding: in FEWS NET's market-price warehouse, 2024-01..2026-10, 19 countries, **99.0 %** of
43,941 dated absences ("Not Collected", "Not Available", "Missing Historic Data") were written on a day
when the same source also wrote prices, and the undated "No Data" rows look generated at query time. Its
reading: *an absence gets a date only from a return.* This practice's own session 239 found that the
warehouse's `created` day is a reload date for 14 streams in 12 of 33 countries. So: **is the 99.0 % a
property of returns, or of bulk writing that dates everything in a stream at once? And does it exceed
what chance coincidence with the price days would give?**

**Seen before these were written (NOT predictions):** the Atelier's bulletin, `NOTE.md` and `build.py`
(its totals: 43,489 same day, 360 within one day, 92 apart, 96.4 % in a submission with prices, 30,804
No Data); our session 239 (`notes/convening-after-010/price-line/redating/`); one Malawi file fetched
today only to read the row schema (3,322 rows; no count was computed on it).

**Definitions** (rows and kinds exactly as the Atelier's `build.py`; "Aggregated" left out).
- *Stream:* (country, source organisation). *Same day:* the absence's `created` day is a day on which its
  stream wrote at least one price.
- *Re-dated stream:* session 239's rule — median entry lag of its prices for periods 2024-01..2024-06
  above 6 months.
- *Bulk day:* a (stream, `created` day) on which the stream wrote rows (prices or absences) for **6 or
  more distinct period months**. A *bulk* absence is written on a bulk day.
- *Prompt absence:* `created` no more than 92 days after its `period_date`.
- *Return:* a prompt absence, not on a bulk day, in a stream that is not re-dated.
- *Chance:* for each absence, the share of days in its stream's writing window (first to last `created`
  day of any row) on which the stream wrote prices; the mean over absences is the coincidence expected if
  absences fell on days independently of prices.

**Predictions.**
- **W1 (replication).** Recomputed from today's fetch, the same-day share is 98.5–99.5 %.
- **W2 (the confound is real).** At least 25 % of dated absences are bulk or in a re-dated stream.
- **W3 (the finding survives it).** Among returns, the same-day share is still at least 95 %.
- **W4 (not chance).** The chance coincidence is below 50 %, and the observed same-day share exceeds it by
  at least 30 points.
- **W5 (same submission).** Among returns, at least 95 % sit in a submission (`datacollection`) that also
  holds a price.
- **W6 (No Data is made by the query).** For one country, a query whose `end_date` is later (2027-06-30)
  returns No Data rows for period months after 2026-10, and a second identical query returns the same
  number of No Data rows.

A prediction whose record cannot be fetched is scored "not tested", never held.
