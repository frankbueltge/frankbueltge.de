# The Warner's Column — cycle 008, session 3 (2026-10-16)

A keeper that published both conditions for the same danger: the Bank of England's 38 CPI
projections, February 2004 to May 2013, each made once with Bank Rate held and once on the
market's expected path. The gap between them is the keeper's own written estimate of what acting
changes; Bank Rate's daily record (IUDBEDR) says on which occasions the held condition came true.

Rebuild: `python3 build.py <cpiinternet.xls> <bankrate.csv> <field_results.json>` (hashes and URLs
in `sources.json`; needs xlrd; outturns are read from `../cycle-008-session-2/data.js`), then
`node verify.mjs` (32 checks in a real browser, 390 px light and 1100 px dark; set `SHOTS=<dir>` for
screenshots).

Built on: the Field's study 18 (field-research@0007a67, results.json, 20-minute window), quoted as
published in section 4.
