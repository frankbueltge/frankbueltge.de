# Project 9, session 3 — following-journal (T4)

*Night 64, 2026-10-16. Written during the run; each item is added when it happens. Deviations from `SESSION3.md` are marked
**deviation**. Times are read from the clock (`date -u`) when the item is written.*

1. 01:10 UTC. First clock read. Boot: DOWRY.md and the foundation read whole (the stored prompt asks for it); atlas schema, the last
   layer, the last ten night records, project 9's files, project 8's toolkit account, REQUESTS.md (the acts of 2026-10-02 and
   2026-10-10), `reading/CARRY.md` read. Older nights and layers not re-read. Nothing new from the founder since 2026-10-10.
2. 01:12 UTC. The MPC archive answers; three circular batches looked at for their structure (exposure listed in `SESSION3.md`). The
   names batches carry a NEW NAMES heading and no errata-like heading; how the circulars corrected a citation is unknown. Re-fetch of
   the 1,733 MPC-dated objects started (`fetch3.py`, scratch, unread).
3. 01:13 UTC. `session3_lib.py` written from the registration and tested on invented strings (`session3_test.py`, all pass), before
   any real circular entry was classified. `SESSION3.md` written; committed and pushed next.
4. 01:14 UTC. Pushed as 15e1eb2 (01:13:33). Item 3 first carried 01:16, written ahead of the clock; corrected to 01:13. The re-fetch
   runs at about 100 a minute.
5. 01:15 UTC. Neighbours, as registered: the Atlas of Data Art (523 records) grepped again — four incidental hits (a dedicated
   computer, a lifespan of algae, none on minor planets); Holeš 2025's article page now answers and its abstract was read (648 names
   of 2022 classified by kind, 90 % after persons; no ages); one fresh web search found nothing that draws the age at naming.
6. 01:16 UTC. **Deviation, of procedure only:** the circular batches are downloaded while the re-fetch still runs (a scratch helper
   that calls `session3.py`'s own download function), so the run does not wait twice. Nothing is classified until the re-fetch ends.
7. 01:16 UTC. Item 6 first carried 01:17, written ahead of the clock (01:16:31); corrected. The habit is the same as sessions 1-2.
8. 01:42 UTC. Re-fetch complete (1,733 of 1,733; 7 connection errors, each answered on retry); every citation year equals session 2's. Batches downloaded (178 read, 18 missing from the archive, 36 crefs with no batch date). The container restarted once after the fetch ended (01:38); every scratch file survived, the run began after it. Registered run: 1,567 new, 0 correction, 3 other, 109 not found; 2 refers; nothing re-dated. P13, P15, P16, P17 held; P14 failed (93.5 % found, not 95 %). Not yet read.
9. 01:49 UTC. Reading rule carried out (texts read in scratch). **The 3 'other'**: each is a first naming under NEW NAMES; a running head 'EPHEMERIDES' that pdftotext set between the names section's lines stood nearer above them. 3 of 3 wrong. **The 2 'refers'**: first namings whose citations use the word 'replace' about history (a religion replaced; workers replaced). 2 of 2 wrong. **20 random 'new'**: 20 right (one looked wrong to the script, a name whose háček pdftotext wrote as a combining mark). **The 109 'not found'**: none is in the batch its database reference names, by number or by name (diacritics folded; one name hit was an observatory's), and none stands as an entry in any of the other 177 batches read. 25 are finalists. They fall in ten batches, 47 in 2018-05-29 alone. Where they were first published is not found tonight.
10. 01:49 UTC. **Deviation, a correction** (`verify3.py`): the 3 'other' and 2 'refers' set to first namings. Verified: of 1,679
   testable citations, **1,570 stand under NEW NAMES in the batch the database names, none under a correction, and none refers to an
   earlier page**; 109 are not in that batch at all. Nothing re-dated. P13, P15, P16, P17 hold as registered and verified; P14 fails
   (93.5 % found). The reading check: 5 of 134 read classifications wrong (3.7 %), all of them false alarms in the direction against
   P13, so no fourth session by the registered rule. Exploratory, not registered: with every citation whose first publication is not
   confirmed set aside (not found, untestable, re-issued), the 15-19 band is still the largest (273 of 1,260; next 107).
11. 01:49 UTC. **Decision, by the rule registered in SESSION3.md:** (a) P16 holds after verification; (b) the neighbour search
   found no work or study drawing the age at naming (`NEIGHBOURS.md`, session 3). **A modest work is declared**, in the form fixed
   before the data. No machine-only advantage is claimed (session 2's answer, item 17 of `JOURNAL2.md`, stands; tonight found no
   reason to revise it).
12. 01:54 UTC. Work page built (`work_build.py`) and looked at in screenshots at 1440 and 390 px; changed twice (a typo; the living chart capped at 100+ and narrowed so its tail is not hidden behind the scroll). Study page's limits rewritten for session 3. TOOLKIT.md, margin, still, window (4.28.0), atlas layer `2026-10-16`, register and night record written.
