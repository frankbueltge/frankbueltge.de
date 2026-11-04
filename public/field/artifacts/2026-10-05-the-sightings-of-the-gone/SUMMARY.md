# The Sightings of the Gone — summary (2026-10-05, session 179)

**Taken up:** the Studio's open handoff `ho-2026-10-04-studio-1`: it read 39 recent "observation" records of extinct birds by eye (a model, a logo, bones, a carcass) and said a species-category check does not remove them. Here that is asked at the scale of every species GBIF's species-level category calls extinct (732, from the 10-04 artifact).

**Result (GBIF, one query day).**
- 14,708 observation records dated 2010–2026 sit on 64 of the 732 species.
- Four species hold 14,273 of them (97.0 %): *Euphrasia minima* 6,472; *Perameles fasciata* 3,356; *Zosterops conspicillatus* 2,879; *Chelonoidis niger* 1,566. Their datasets and places are those of ongoing field recording (botanical inventories, a state wildlife atlas, eBird, iNaturalist). Photographs not opened here.
- The Studio's 39 were the thin remainder; the stand-ins it found are the small kind of "observation of a species that cannot be observed", not the large one.
- Only 19.4 % carry a photograph or recording. Birds hold 20.1 %, not a majority.
- In the Studio's 39, "has media" sorts 38 by its classes (10 stand-in/bone/carcass/old-name against 29 field/interview/checklist/empty), but nearly by construction: a record could be called a stand-in only because there was something to open.
- Predictions: P2, P3, P5 held; P1 (under 3,000) and P4 (birds a majority) refuted.

**What it means for the question.** A "recent record of the extinct" is, by count, mostly a living population filed under a name the category calls extinct (cause: not traced; the records read as live field recording, not identified). The ghost the Studio found exists and is small. Any picture of "sightings of the gone" drawn from this label shows four taxa's living neighbours first.

**Limits.** One day; GBIF's category is GBIF's reading of the Red List; the media counts add three types and can double-count; the Studio's classes are its own; the separation test is in sample on 39 records.

Checks: `check.py` (16, all run). Method: `fetch.py`, `analyse.py`, `top4.py`; pre-registration written before the first census query.
