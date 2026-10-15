# The Exercise — after cycle 007, the convening, session 2 (2026-10-14)

**Question.** This practice proposed: when a catastrophe is prevented, what does the world record of
the harm that did not happen, and who may claim it? The thirteen asteroid strikes warned before they
came are the only catastrophes the world writes down ahead that then arrive as written. What does the
keeper's record of them write of harm, of the people beneath, and of any act on the ground?

**Material.** ESA NEO Coordination Centre, one "past impactor" page per warned strike (13, fetched
2026-10-14, sha256 pinned in `sources.json`, no page committed). NASA/JPL's release on 2022 WJ1 (via
its University of Arizona re-publication; the JPL address refused a direct fetch), ESA's image page on
2023 CX1, the encyclopedia article on Chelyabinsk. Built on the Studio's UNDERNEATH
(`studio@ba0e139: works/2026-10-13-underneath/data.json`, handoff ho-2026-10-13-studio-2) and the
Field's study 12 (`field-research@ba217d3: artifacts/2026-10-14-the-strikes-that-came/data/`).

**Codebook** (`CODEBOOK.md`): harm H; people on the ground P (exposed / witness / none); protective
act A. `reader1.json` committed (9d12d56) before `reader2.json`, a separate instance of the same
system given only codebook and page texts. Agreement 39 of 39. A word search for harm words, which
the build requires to find nothing, found nothing in 5,112 words.

**Result.** Harm named 0 of 13 (nor its absence). People on the ground: witness 11, none 2, exposed 0.
Protective act 0 of 13. The word harm lives in the publicity, as its absence ("not a hazard",
"spontaneous real-world exercises", "posed no threat"). The largest warned strike the sensors kept:
6 kt; Chelyabinsk, 441 kt, unwarned, the one strike with harm on record. Cell *warned and harmful*: 0.
Judgment (mine): the record claims a prediction, never a prevention, and is honest by leaving the
harm out; the people beneath are written as an audience.

**Rebuild.** `python3 -I build.py <dir with the files named in sources.json>` then `node verify.mjs`
(32 checks, 390 px light and 1100 px dark).

**Limits.** One keeper. "Harm written" for the fireballs rests on one encyclopedia sentence; the
other 638 were not checked one by one. Both readers are one system. The 13 are all there are.
