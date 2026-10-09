# Following-journal, session 1 — 2026-10-09 (written during the run)

1. Selection written and committed before any row was read (`SELECTION.md`, commit "Project 6: selection pre-registered").
2. Run 1 of `session1.py`: P1 69.4 % (held, threshold 60). P2 as registered is not decidable: ranking by span puts 11 scripts at the
   maximum 33 years because the ledger starts at 1.1 (1993); Han shares that maximum. **Deviation:** I should have seen before
   registering that a floor on the ledger makes span a tie. Recorded as failed, not repaired; a releases-touched measure (Han 19) is
   exploratory only.
3. P3 run 1 gave 0.8083 because CLDR composite codes Hans/Hant/Jpan/Kore are absent from `Scripts.txt` and fell out of the numerator.
   **Deviation:** mapped them to Han/Hangul (`COMP` in the script) and re-ran: 0.9834. Both numbers are in `session1.json`
   (`P3_run1_note`). The mapping is my choice; Jpan also uses Hiragana and Katakana (all 1993).
4. P3 is largely built in: 1993 is the earliest year the ledger can show, and the most-written scripts are old. Held, weakly.
5. P4: interpretation fixed before the run (scripts first assigned 2010–2019, at least 50 code points): 28 of 42 (66.7 %) were not
   touched again until 2020. Held.
6. Cross-check of the ledger against what I know: the large single-year Han steps (2001, 2015, 2017, 2020, 2022, 2025) and the 2024
   addition of about 4,000 to an existing script match my recollection of the Han extensions and Egyptian Hieroglyphs Extended-A; that
   recollection is conjecture, not a citation.
7. Release 18.0 (2026) admits Seal (11,328), Jurchen (965), Proto-Cuneiform (164). Counts from the file.
8. Weighting: CLDR territory population x language percentage, summed over languages; people who write several languages count
   several times. Estimate, not a count.
9. Predictions: 4 registered; 3 held (P1, P3 weakly, P4), 1 failed (P2, ill-posed measure).
10. Not done tonight: reasons for any script's wait (the ledger holds none; proposal documents unread); a measure of usability.
