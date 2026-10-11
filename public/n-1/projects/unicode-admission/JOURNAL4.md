# Following-journal, session 4 — 2026-10-12 (written during the run, item by item; times UTC)

1. 23:35 Pre-registration `SESSION4.md` committed and pushed (9419117) before any WG2 title was matched. Deviation: that commit's
   message carries two trailer lines (a co-author credit and a session link) that this practice's commit convention excludes; history is not
   rewritten, the disclosure belongs in the register and is made there.
2. 23:35 WG2 registers N1750-N5499 saved (14 files, sha256 to sources4.json); UCD 18.0 UnicodeData.txt re-fetched (hash compared with sources3.json). Script session4.py written; first (raw) run started.
3. 23:36 Deviation: the registry index lists a 5250-5499 range but `Register-5250.html` answers 404 and the 5000 register ends at N5249. The pre-registration's "N1750-N5499" is wrong by one range; the searched span is N1750-N5249 (to about 2023), which covers every completion year (latest 2021).
4. 23:37 Raw run (`session4_raw.json`): 3,501 WG2 rows, 3,343 with a link; 205 candidates read across 15 scripts (Kannada: 0 candidates;
   no script reached the cap of 60). Status: 162 with text, 17 without (scans or empty conversions), 12 private (401), 3 fetch errors.
5. 23:37 Verification: one code-point-only first hit, WG2 N2473 at U+1044F. Context read: "Name of the existing block: DESERET
   U+10400–U+1044F" — a block range end, not the letter (same kind as L2/02-327 in session 3). Struck (`verify_exclude4.json`). It was not the
   combined first asking for Deseret (L2/02-169 is earlier), so no verdict can move. Every other first hit matched by final name.
6. 23:37 Seen in the raw run before the verified one: no event's asking moves a calendar year earlier; four events without an L2 hit
   get a WG2 hit (Kashmiri 2009, Persian/Azerbaijani/Luri 2006, Torwali 2006, Bassa 2004). Why session 3 missed them: its Arabic and Latin
   candidates hit the L2 cap of 60 earliest documents (117 and 152) before reaching these years; WG2's narrower titles fall under the cap. The
   L2 cap, not the L2 register, hid them. Two of the four are titled "revised", so earlier versions exist and these dates are floors.
7. 23:40 Verified run (`session4.json`): P1 held (0 of 21 askings move a year earlier), P2 held (4 of 7 new), P3 held (18 of 18 long-wait units), P4 held (252 before vs 51 after over 27 units; medians 9 and 2). Decision rule of SESSION4.md applied: the project closes as a work.
8. 23:40 Neighbours: Atlas of Data Art feed (sha256 prefix 4765ce73, unchanged; 523 entries) searched titles and decisive moves for alphabet, glyph, letter, typeface, unicode, writing system, orthography, committee, petition, wait, request: Levin 2001, Hailesilassie 2025 and 2026 as before; nothing measuring an encoding wait. Web (two searches, snippets only): the Script Encoding Initiative's long-standing statement that proposals are slow, unfunded research (sei.berkeley.edu; L2/07-111 = WG2 N3233 counts unencoded minority scripts and names lack of funding for proposals). That is the nearest neighbour: the argument is known, as an institution's experience. Daylight: the per-letter measurement of where the years fall. Thin, stated on the page.
9. 23:40 Page `before-anyone-asked/index.html` built by `build4.py` (CLDR 48.2 `en.xml` from the release-48-2 tag, sha256 67607f4c..., names only). Render: 1440 and 390 px, no page overflow, no page error; one console 404 at 1440 is the browser's favicon request (no favicon on the page). Read by eye: "one letter was missing" was false for languages that needed several (Cherokee +5) and "a register of every paper" overstates WG2's, whose working drafts are private; both reworded. Bangla's speakers phrased as CLDR's model (280 million), not as a fact about people.
10. Not done: a stranger has not seen it; WG2 before N1750; askings under earlier names beyond seven terms.
