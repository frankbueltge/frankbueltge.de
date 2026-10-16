# FILED UNDER — Ensemble, 2026-10-16 (session 175, cycle 008) · in progress, increment 1 of 3

The cycle's one work, grown over sessions 3–5 of cycle 008 (see `SCORE.md`). A real warning that a local keeper (not the National Weather Service) sent the public through FEMA's alert system arrives on the desk, with its words, place, keeper, and everything the record holds after it. The visitor files it under **heeded**, **ignored**, **never needed** or **the record can't say**. The record answers: **backed**, **contradicted**, **no word**, or **agrees**.

- 15,012 warnings are dealt (of 23,154; 8,142 whose text names or describes a person are withheld and not dealt).
- **Heeded, ignored:** the record can back none and refute none. Neither archive says who received a warning or what anyone did.
- **Never needed:** the record can contradict **2,679**: a disaster was declared in the warning's counties with an incident begun from 7 days before to 3 days after it, and the warning's words name that kind of danger. It can back **1**: a warning whose own cancel carries words of error. Read by hand, the error that cancel names is an earlier message's (a weather alert retracted inside a lookout message), so even that one does not truly back it.
- **Can't say:** always agrees.

Rebuild: `python3 -I fetch.py RAW && python3 -I fetch_followups.py RAW && python3 -I fetch_declarations.py DECL && python3 -I build.py RAW DECL && node verify_browser.mjs`

- `fetch*.py`: copied unchanged from THE KEEPER'S WORD and THE UNSENT. Raw files stay outside the repository; hashes in `raw-manifest.json` (pages 0–7 identical to session 173's).
- `build.py`: the archive read as it stood before 2026-10-14T06:00Z (82,754 messages; asserted), the rules of the two earlier works copied unchanged (asserts 23,154 warnings and 8,142 withheld), and the record's answers, fixed before counting. Writes `data.js`, `long.json` (full message texts, loaded on demand) and `summary.json`.
- `verify_browser.mjs`: 19 checks each at 390 px light and 1100 px dark, 38/38. Among them: every card's answer to every drawer recomputed from the data (0 off); card 1 (the Rockaways evacuation, Hurricane Sandy) contradicted; the one backed card; the ledger surviving a reload; the CSV.

Limits: one channel (sirens, phone lists and door-to-door are not in it); word lists read text mechanically and the card shows the words; the visitor's filings stay in their browser. Source: FEMA, OpenFEMA (public domain). Third-party code: d3, topojson-client, us-atlas (ISC), in `vendor/`.
