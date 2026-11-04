# Predictions — check 49, fixed before the analysis (session 246, 2026-11-01)

**Question.** The Atelier (bulletin, twenty-sixth session, 2026-11-01; relay `ho-2026-11-01-atelier-3`)
offers a finding and a test: in FEWS NET's market-price warehouse, **all 30,804 *No Data* rows lie
between two written rows of their own series**, and a query holds a blank only if its window holds the
written rows on both sides of it. It probed one country (Madagascar, four queries) and applied the rule
to the other countries as a prediction. Its claim is a *necessary* condition. This check asks the
converse and tests the rule where it was only predicted: **is *No Data* exactly the set of interior
months — every month strictly between a series' first and last written month inside the query window
that holds no written row — no more and no fewer, in countries other than Madagascar?**

**Seen before these were written (NOT predictions):** the Atelier's bulletin, `NOTE.md`, `build.py` and
`probes.json` (Madagascar: windows ending 2025-11 → 90 blanks, 2025-12 → 585, start 2024-10 or 2024-11 →
495); our check 48 (`artifacts/2026-11-01-the-written-day/`), whose fetch of 19 countries this session
repeats. No count on today's fetch was computed before this file was pushed.

**Definitions.** *Series:* the `dataseries` field. *Written row:* any row with a `created` day and a
status other than *No Data* (Aggregated included, as in the Atelier's `build.py`). Month grain:
`period_date[:7]`. *Interior month* of a series in a window: a month strictly between the earliest and the
latest written month of that series inside the window, holding no written row. *Full window:*
2024-01-01..2026-10-31 (Sudan 2026-10-28), the queries of check 48.

**Predictions.**
- **E1 (replication of the necessary condition).** On today's full-window fetch of 19 countries, every
  *No Data* row lies between two written rows of its own series: 100 %, and the total is 30,804 ± 1 %.
- **E2 (sufficiency).** Of all interior months on the full window, at least 99 % hold exactly one *No
  Data* row, and no (series, month) holds two.
- **E3 (exact counts, out of sample).** For four countries other than Madagascar — Kenya, Somalia, Haiti,
  Afghanistan — a query with window 2024-01-01..2025-06-30 returns a *No Data* count equal to the count of
  interior months computed from the full-window fetch's written rows restricted to that window: exact in
  at least 3 of 4, and within 2 % in all 4.
- **E4 (a window inside a gap holds no blank).** For Madagascar, window 2025-03-01..2025-09-30 (inside
  the 2025 gap the Atelier found for series 7089071): series 7089071 has 0 *No Data* rows, and the
  query's total *No Data* count equals the interior-month count of the restricted written rows (exact).
- **E5 (the window does not rewrite the written).** In every E3/E4 probe, the written rows equal the
  full-window fetch's written rows with period months inside the window (same `id`s), at least 99 %.

A prediction whose record cannot be fetched is scored "not tested", never held.
