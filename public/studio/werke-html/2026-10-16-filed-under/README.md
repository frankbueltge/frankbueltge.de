# FILED UNDER — Ensemble, 2026-10-16 (sessions 175–176, cycle 008) · in progress, increment 2 of 3

The cycle's one work, grown over sessions 3–5 of cycle 008 (see `SCORE.md`). A real warning that a local keeper (not the National Weather Service) sent the public through FEMA's alert system arrives on the desk, with its words, place, keeper, and everything the record holds after it. The visitor files it under **heeded**, **ignored**, **never needed** or **the record can't say**. The record answers: **backed**, **contradicted**, **no word**, or **agrees**.

- **Increment 2 (session 176): the critique, answered** (`CRITIQUE.md`). The record is sealed until the visitor files. The tally separates verdicts from "can't say". Filed warnings lock. Four bands, one per drawer. Each card carries the keeper's clock, from the Field.
- 13,371 warnings are dealt, of 23,154. Not dealt: 8,142 withheld by THE KEEPER'S WORD's person rule, 963 more by the wider rule of session 176, and 678 whose shown words are a cancel or an all-clear.
- **Heeded, ignored:** the record can back none and refute none. Neither archive says who received a warning or what anyone did.
- **Never needed:** the record can contradict **2,404**: a disaster was declared in the warning's counties, with an incident begun from 7 days before to 3 days after it, and the warning's words name that kind of danger. It can back **none**. Session 175 counted one, whose cancel carried words of error. Read by hand, that error was an earlier message's, and the warning was a lookout for a described person, so the wider rule withholds it.
- **Can't say:** always agrees, counted on the page as declined.
- **The keeper's clock** comes from the Field: study 17, `warnings.tsv`, handoff ho-2026-10-15-field-3. It is joined by message id: 13,371 of 13,371 joined, and every lifetime agrees with the message's own expiry. 2,620 carry the minute of their first cancel.

**Superseded (session 175, kept in its commit):** 15,012 dealt; never needed contradicted 2,679, backed 1.

Rebuild: `python3 -I fetch.py RAW && python3 -I fetch_followups.py RAW && python3 -I fetch_declarations.py DECL && python3 -I build.py RAW DECL FIELD_WARNINGS_TSV && node verify_browser.mjs`

- `fetch*.py`: copied unchanged from THE KEEPER'S WORD and THE UNSENT. Raw files stay outside the repository; hashes in `raw-manifest.json` (pages 0–7 identical to session 173's).
- `build.py`: the archive read as it stood before 2026-10-14T06:00Z (82,754 messages; asserted), the rules of the two earlier works copied unchanged (asserts 23,154 warnings and 8,142 withheld), and the record's answers, fixed before counting. Writes `data.js`, `long.json` (full message texts, loaded on demand) and `summary.json`.
- `verify_browser.mjs`: 27 checks each at 390 px light and 1100 px dark, 54/54 (session 176). Among them: every card's answer to every drawer recomputed from the data (0 off); card 1 (the Rockaways evacuation, Hurricane Sandy) sealed, then contradicted; no dealt card carrying the person words; a filed card locked after a reload; the stale answer cancelled; the keeper's clock on every card; the CSV. FIELD_WARNINGS_TSV is `artifacts/2026-10-15-the-end-written-in-advance/data/warnings.tsv` in the Field's repository (fetched 2026-10-16, sha256 in `raw-manifest.json`).

Limits: one channel (sirens, phone lists and door-to-door are not in it); word lists read text mechanically and the card shows the words; the visitor's filings stay in their browser. Source: FEMA, OpenFEMA (public domain). Third-party code: d3, topojson-client, us-atlas (ISC), in `vendor/`.
