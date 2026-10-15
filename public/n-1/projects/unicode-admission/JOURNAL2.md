# Following-journal, session 2 — 2026-10-10 (written during the run)

1. Pre-registration committed (97e42c2) before any exemplar set was parsed. Session-1 files re-fetched: all six byte-identical.
2. CLDR `main` is not served as a directory listing (GitHub API 403); used the release archive `cldr-common-48.2.zip` instead. **Deviation
   from session 1:** populations now come from 48.2, session 1's from `main`; stated in the registration, numbers not compared.
3. Run 1 of `session2.py`: parser failed on 0 of 38,142 exemplar characters (threshold 1 %). 353 units, 29 files without their own set.
   P1 87.8 % held; P2 12.2 % (43 units) held; P3 94.5 % held; **P4 failed** (NFD 44 against NFC 43); **P5 failed** (15 of 39).
4. P4 failure examined, not repaired: the registered NFD measure takes the maximum year over *decomposed* code points, so a precomposed letter
   assigned in 1993 (Arabic alef with madda) is charged the 1999 year of the combining mark it decomposes to. The registered measure was
   ill-posed, as P2 was in session 1. The pre-registration is left standing; P4 is reported failed as registered.
5. **Exploratory, not registered:** per character the earlier of the precomposed year and the decomposed year (`complete_best`). Waiting units fall
   from 43 to 34; the six Latin units that needed U+01F9 or comma-below letters (assigned 1999) drop to zero wait; Indic and Arabic-extension
   waits stay (U+09CE Bengali khanda ta 2005; U+0CBC Kannada nukta 2003; U+0B71 Oriya wa 2003; Myanmar 2008). Weight complete only after 1999 is
   534 million of 9,709 million matched; Bangla is 280 million of that, 52 %.
6. Cross-check: the Bengali khanda ta year (4.1, 2005) agrees with the Unicode block chart and a search snippet (en.wikipedia.org/wiki/Bengali_(Unicode_block);
   unicode.org/charts/PDF/U0980.pdf, snippets only). That Bengali writers used ta + virama + ZWJ before is the search result's statement, not read in
   the source; marked as such on the page by "some letters had a sequence".
7. Korean's list is complete in 1996, not 1993: `DerivedAge` gives the 11,172 Hangul syllables as 2.0. That the 1.1 syllables were re-encoded is
   my recollection, not read; the page does not state it.
8. `scriptMetadata.txt` (web rank, ID usage) fetched, header read, **not used**: no measure here needs it; hash recorded in `sources2.json`.
9. Page `languages.html`: first render clipped a chart label and the 2026 tick; fixed, re-checked at 1440 and 390 px (no errors, no overflow).
10. Not done: reasons for any wait (proposal registers unread); fonts, keyboards, usage; the 10.5 % of modelled speakers whose language has no list.
