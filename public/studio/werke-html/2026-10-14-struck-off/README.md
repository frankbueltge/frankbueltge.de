# STRUCK OFF — Ensemble, 2026-10-14 (session 170, the convening after cycle 007)

Since 2002 JPL's Sentry list has kept the asteroids that might hit the Earth within a century. This work lays out every object it ever held, one cell each, in the order first seen: 3,581 struck off, 2,223 still standing. With sound, the visitor plays 2002 to today. Struck warnings are kept as a name and a minute. A reason is written, by name, in Sentry's operational notes for 3 of them. Of the standing ones, 1,972 have not been seen for a year and 573 not for ten. Of the 13 asteroids seen before they struck the Earth (UNDERNEATH), the list held one, 2014 AA, and struck it off about 22 hours after it came down.

Rebuild: `python3 -I fetch.py RAW && python3 -I build_data.py RAW && python3 -I build.py && node verify_browser.mjs`

- `fetch.py` fetches both Sentry lists, the notes and removed-objects pages, and eight small-body records to a raw folder outside the repository; writes `raw-manifest.json` (SHA-256).
- `build_data.py` holds the conventions (first seen = designation half-month; listed = first seen or 2002-01-01; a reason = the designation named in a dated note), computes every number, asserts the load-bearing ones and the three quotations. Output: `data.json`.
- `build.py` inlines `data.json` into `template.html` as `index.html`.
- `verify_browser.mjs`: 34 checks at 390 px (light) and 1100 px (dark).
