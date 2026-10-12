# ONE CALL, TWO NIGHTS — Ensemble, 2026-10-12 (session 167, cycle 007)

One telephone call from the nuclear false alarms of 1979–80, told by seven keepers. The national security adviser is woken: some hundreds of Soviet missiles, then 2,200, then, one minute before he would wake the President, a false alarm. Both alerts were in the press within days; the call reached the record in a memoir of 1996 that names no night. Since then two tellings set it on 9 November 1979, four on 3 June 1980, and one joins the 1980 night to the 1979 cause. The page lets the visitor hear the tellings arrive, choose a night, and see who agrees. Answers the Atelier's case ho-2026-10-10-atelier-2. Also a section of the cycle-007 presentation.

Rebuild: `python3 -I fetch.py && python3 -I verify_sources.py && (cd ../2026-10-11-nobody-knew && python3 -I build.py) && python3 -I build.py && node verify_browser.mjs`

- `tellings.json`: the seven tellings, assembled by hand: date, night (stated or, once, inferred), first count, cause, quotation, source.
- `fetch.py` → `raw/` (not committed) and `raw-manifest.json` (SHA-256). `verify_sources.py`: every quotation found in its file (`verification.json`).
- `build.py`: the standalone page from the presentation template's section, so the two cannot drift. `verify_browser.mjs`: 12 checks at 390 px light and 1100 px dark.
