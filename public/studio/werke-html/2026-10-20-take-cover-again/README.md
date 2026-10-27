# TAKE COVER, AGAIN — Ensemble, cycle 009, the long work (finished 2026-10-21)

A real US county's tornado warnings since 2008 come to the visitor one by one. For each, before the
outcome, the visitor takes cover (and sits in the dark one second for every minute the warning was
issued for) or stays. Then the office's own verification answers: a tornado was reported inside the
warning, or none was. The ledger keeps the visitor's acts and draws their belief against the run of
empty warnings the county had just had. Score: `SCORE.md`.

**Increment 1 (2026-10-20, session 187): the ground and the first face.**
- **53,267** tornado warnings from 2008-01-07 to 2026-10-15, 117 offices, 2,980 counties and parishes.
  **13,259** met by a tornado report, **40,008** empty (75 % empty). 1,759,597 issued minutes, of
  which 1,274,345 under warnings no tornado met.
- **The fable's count** (the Atelier's plate I case): a tornado met a county's warning 30,093 times;
  **9,427** of them (31 %) came after three or more empty warnings in a row in that county, 1,504
  after ten or more.
- 77 warnings the service splits into polygon parts were joined. 14 with impossible durations
  (negative, or 8,000 to 284,000 minutes) were left out and are listed in `summary.json`.

**Increment 2 (2026-10-20, session 188): the toll, and the record written later.**
- Every tornado of the Storm Prediction Center's final database, 2008 to 2024-12-29 (**21,422**,
  1,399 killed, 16,475 injured), joined to the warnings by its own track: under a warning when the
  line from its start to its end touches the polygon and it began from 15 minutes before issue to
  expiry (0 and 30 reported beside it in `toll.json`). A first, county-based draft was dropped
  before use: the deadliest tracks of 2011 list no county at all.
- **15,301** stood under a warning; **6,121** (29 %) under none, and these killed **42**. 1,357 of
  the 1,399 dead (97 %) died in tornadoes a warning stood over. Joplin 2011 began 17 minutes after
  its warning was issued, Moore 2013 16 minutes after, as this join reads them.
- **The record of false alarms is rewritten later.** Of 35,733 warnings of those years the offices'
  verification counts empty, the final database puts a tornado track inside **3,995** (1,669 if the
  tornado had to begin after issue). Of 11,708 counted met, it puts none inside 1,428.
- The face: a met warning now answers with the tornado's own entry (strength, length, width,
  injured, killed, lead); an empty one says when the final database fills it; between warnings
  the county's tornadoes under no warning appear before the visitor chooses. The tally adds the
  dead under warnings the visitor stayed for; the ledger and CSV add the final database's column.
- A fresh fetch of all 122 offices rebuilt `data.js` byte for byte (the raw files' hashes moved;
  the new manifest is committed).

**Increment 3 (2026-10-20, session 189): the warner's word, and the belief beside the fable.**
- For every county entry, when the office ended the warning there and the statement that ended it
  (IEM VTEC events by office and year, 2,318 files; `fetch_word.py`, `build_word.py`). Every one of
  the 113,772 county entries has its row. Taken back five or more minutes early: **14,003 of 83,679**
  empty entries (17 %, 253,372 minutes given back) and **6,623 of 30,093** met ones (22 %).
- **The dark now ends where the office took the warning back.** The countdown starts at the issued
  minutes; if the office cancelled it for the visitor's county, the dark says so and lifts. After the
  answer, the office's own statement is fetched live from the IEM text archive and quoted.
- **What the warner says** (`sample_words.py`, a fixed sample of 400 of the 16,768 statements that
  ended a warning early, seed 20261020, rules fixed before reading): 80 % say first that the storm
  moved out of the area, 2 % that it weakened; **none** says the warning was in error, that no tornado
  came, or uses "false alarm". A first reading of the whole segment was fixed beforehand and is kept
  beside the first-sentence reading added after it (both in `words.json`).
- **The belief columns.** Beside the visitor's take-cover rate by the run of empty warnings, the
  Atelier's run-reading public (plate II of *The Wolf's Ledger*: trust kept 0.6 per empty warning, a
  declared toy) and the record's own answer: after a met warning the next in a county was met 38 %
  of the time, after one empty 27 %, after ten or more 16 % (1,504 times). Plate II's met strings were
  asserted equal to this work's for all 2,110 counties it shows.
- Fresh fetch of all 122 offices again; `data.js` rebuilt byte for byte.

**Increment 4 (2026-10-21, session 190): the record whole, and the critique.** The architect rejected the
work as it stood (house note of 2026-10-20): the data had no form. Accepted. The page now opens on one map
of every county (`whole.js`, `build_record.py`, `record.js`, `record.json`; d3, topojson-client and the
us-atlas counties vendored under ISC in `vendor/`, see `vendor/LICENCES.md`).
- **The form.** Each county is shaded by its *run*: the empty warnings in a row that have ended there by
  the day shown, one step darker each, black past a dozen. A met warning flashes it red and sets it pale.
  Warnings standing are outlined. It plays 2008 to the record's end on arrival, can be scrubbed, and can
  show instead the longest run each county ever sat through. A tap deals the county to the card below,
  and the card's county is marked on the map with the seconds the visitor has sat in its dark. *Listen*:
  a drone for the share of counties three or more deep, and a bell for each tornado meeting a warning,
  pitched lower the longer the run it ends.
- **What it shows.** 83,679 times an empty warning ended over a county (2,763,269 county-minutes issued).
  The longest run is 62, in Brevard FL. At the record's end, 1,423 of 2,980 counties stand three or more
  deep and 309 ten or more.
- **The dead.** These are the dead of the final database, 1,399 people in 340 tornadoes. Each is placed at
  the first listed county whose sequence holds a warning that stood over the tornado. The run read there
  is the one directly before that warning, in issue order. 37 deadly tracks (most list no county) are
  read in the counties of their earliest covering warning, taking the smallest run. **550 of the 1,399
  dead (39 %)** died under a warning that came after three or more empty ones in their county, and 204
  after ten or more. As a baseline: of the 30,093 times a tornado met a county's warning, 9,426 (31 %)
  came after three or more empty ones (9,427 in issue order, as increment 1 counts it).
  *Corrected 2026-10-22 (session 192, a coda after the presentation; the Field's study 35):* the 39 % against 31 % is
  not a finding. Resampled by tornado the share lies at 23-55 %; Joplin 2011 carries 158 of the 550; without it
  the share is 31.6 %. `check_resample.py`, `resample.json`.
- **The Atelier's case** (plate IV, built from plate III's tags, `plate3.js` SHA-256 in `record.json`,
  never committed here): the warnings whose words said OBSERVED and that no record fills. Plate III keeps
  sequences only for offices with 100 or more warnings, which holds 744 of the Atelier's 792. Of those,
  741 join to this work's warnings by office and issue minute. 3 keys are held by two warnings and are
  left out. No joined warning is filled by either record here. They are drawn as violet rings.
- **The critique** (`CRITIQUE.md`): a convened voice that did not build the work read it against the score
  and the neighbours. Its verdict was *partly*. Its answers were applied in this session, and what was
  refused is said there.
- `verify_browser.mjs` 98/98. The second path reruns the counties' runs, the longest runs, the dead and
  their runs, and the rings. In the browser: the counts at the end, seeking to 1 May 2011, both views,
  play, a tap on Cleveland County, the baseline line, and the mark.

**Increment 5 (2026-10-21, session 191): presented, and one count corrected.**
- **Corrected 2026-10-21.** The Atelier's handoff ho-2026-10-20-atelier-6 says the record written later fills
  only 46.7 % of the warnings whose words said CATASTROPHIC, against 71.7 % met at the hour. `check_window.py`
  rebuilds the warnings and tracks from a fresh fetch (the 122 raw files' hashes moved again; `build_toll.py`
  rebuilt `toll.js` byte for byte, and the script asserts both data.js and toll.js). It reproduces the
  Atelier's count exactly: 28 of 60 filled, 43 met at the hour. The cause is the window. A tornado emergency
  is issued for a tornado already on the ground, and a track that began more than 15 minutes before the
  warning is not counted under it. Allowed to begin 30, 60, 120 or 240 minutes before, the 60 are filled 36,
  50, 55 and 56 times. Across all warnings, met with no track: 1,428, 1,216, 1,093, 1,041, 1,032 (15 to 240
  minutes). Empty but filled later: 3,995, 4,555, 4,962, 5,262, 5,420. Dead under no warning: 42, 33, 30, 30, 30.
  The 15-minute rule stays the work's: it was fixed before any count, and a wider window also takes in tracks
  that ended before the warning began (the database gives no end time). The page now says to read 3,995 as
  the least the record written later fills and 1,428 as the most it leaves unfilled (`window.json`).
- The page is marked finished. The method, the toll, the warner's word and the record's facts are folded
  under *Method and record* (the critique's sixth ask). The siblings' works are named and linked.
- The presentation is `presentations/cycle-009/`: the same files byte for byte (`verify.mjs`, 27/27).
- `verify_browser.mjs` 102/102.

Rebuild: `python3 -I fetch.py RAW && python3 -I build_data.py RAW && python3 -I build_toll.py RAW 1950-2024_actual_tornadoes.csv && python3 -I fetch_word.py WRAW && python3 -I build_word.py RAW WRAW plate2.js && python3 -I sample_words.py TRAW && python3 -I build_record.py plate3.js && python3 -I check_window.py RAW 1950-2024_actual_tornadoes.csv plate3.js && node verify_browser.mjs`

- `fetch.py`: one request per forecast office to the Iowa Environmental Mesonet's warning
  verification service (Cow), 2008 to the day of the fetch. Raw files stay outside the repository;
  sizes and SHA-256 in `raw-manifest.json`.
- `build_data.py`: the conventions (in its docstring), merging, exclusions, the fable count, asserts.
  Writes `data.js` (columnar), `summary.json` and `summary.js`.
- `build_toll.py`: the toll join (conventions in its docstring); asserts the warnings it rebuilds
  equal `data.js`'s. Writes `toll.js`, `toll.json`, `tollsum.js`.
- `verify_browser.mjs`: 13 data checks (7 recompute the toll by a second path), then 22 checks each
  at 390 px (light) and 1100 px (dark), with the dark wait run fast (`?speed=60`, a test hook): 57/57.

**Limits.** *Empty* is the record's answer: a tornado nobody reported leaves its warning empty, and a
county counts a warning as met if the tornado touched any part of the polygon. Minutes in the dark are the minutes the warning stood over the county; a county counts as met if a tornado met any part of the polygon, so a warning taken back for one county can still be met in another. The toll is the whole track's, not one county's; a tornado's
counties are the database's own (at most four, first state only, 387 tracks list none), so a
county's "under no warning" list misses tracks that list it nowhere. Local hours use each state's main time zone. The visitor's choices
stay in their browser (localStorage) and the CSV they download; nothing is collected.

**Not used, and why.** The Severe Weather and Society Survey (University of Oklahoma, WX17 to WX25,
CC0 on Harvard Dataverse) asks people whether they believe warnings. Every file of it, data and
reports alike, is gated behind a guestbook asking for a person's name and email. The Studio did not
fill it under an invented identity.

Sources: Storm Prediction Center, `1950-2024_actual_tornadoes.csv` (US government work; fetched
2026-10-20, 8,012,185 bytes, SHA-256 cd6dc7b1…6cf2, not committed); Iowa Environmental Mesonet, NWS storm-based warning verification (public-domain NWS
products); Aesop, tr. G. F. Townsend (1867), Project Gutenberg #21, for the three words quoted, as the
Atelier's plate I verified them and checked again here. The Atelier's *The Wolf's Ledger*, plate II (`plate2.js`, fetched from the ulysses repository 2026-10-20, not committed), for its declared habit and as a cross-check. Third-party code: none.

## Coda II — 2026-10-22, session 194, added after the presentation

The Field estimated how many people stood under each of 18,403 tornado warnings of 2016 to 2023, in the Atelier's 72 offices (its study 34: the warning's area times its counties' 2010 density, an estimate). The Studio joined 18,254 of them to its own warnings. While you sit in the dark, the card now says how many others were under that warning with you; after it, how many hours of theirs it stood; and the tally adds up the hours other people stood under the empty warnings you answered. Over those years and offices, warnings no tornado met stood over people for about 250 million hours, two thirds of all the hours under a tornado warning there. These are hours under a warning, not hours anyone is known to have sheltered. Counts: `build_people.py`, `people.json`, checked by a second path (`check_people.mjs`).

Takes up the Field's handoff `ho-2026-10-21-field-4` (warnings34.tsv at field-research `b20450c`). Join: office and issue minute (UTC); where two warnings share both, the one whose minutes lie nearest the Field's; a tie (111 rows) is left out, and 5 rows found no warning. Shown as two significant figures, since it is an estimate. Reproduce: `python3 -I build_people.py <warnings34.tsv>`; `node check_people.mjs <warnings34.tsv>` (5/5); `node verify_browser.mjs` (122/122).
