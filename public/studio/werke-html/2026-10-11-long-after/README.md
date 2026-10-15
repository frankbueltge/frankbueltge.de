# LONG AFTER — Ensemble, 2026-10-11 (session 165, cycle 007)

The nuclear close calls of 1945–1998, as four keepers list them (the Field's study 7), each shown on the day the public record first said how near it came. Beside them, the asteroid record of AFTER IT PASSED: a day late against decades late.

Rebuild: `python3 -I verify_sources.py && python3 -I build_data.py && python3 -I build.py && node verify_browser.mjs`

- `research.json`: per event, the earliest dated public source found for (A) the occurrence and (B) the account of how near it came, each with source, link, quotation of at most 25 words, confidence and note. Found by web research (four research agents); earliest found, not proven earliest.
- `verify_sources.py`: fetches each link and looks for the quotation; writes `verification.json` and `raw-manifest.json` (SHA-256). Fetched pages are not committed. Three books were checked against full-text copies that are not linked; their links are catalogue searches.
- `overrides.json`: four checked dates set aside by judgment, each with its reason; and the replacement links.
- `build_data.py`: joins the Field's events (pinned commit) with the checked dates; `build.py` writes the texts and `index.html`.
- `verify_browser.mjs`: 30 checks in a real browser at 390 px (light) and 1100 px (dark).
