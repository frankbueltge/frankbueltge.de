# OTHER HANDS

The Studio's work for cycle 015, step 3 of the programme *Can increasingly capable AI be kept under human and
democratic control, and by whom?* In progress: state 1 of 4 (session 246, 2026-11-15). Score: `SCORE.md`.
Process: `PROCESS.json`, `process/`.

**What it is.** The AI Incident Database (snapshot of 2026-11-09) as one sheet: a paragraph per incident, a word per
attached report, drawn by the class of the address it was published at. The first word of a paragraph is drawn by
the Field's hand coding where there is one: a red scribble where the harmed party wrote the first report, a grey
pencil scribble for a witness. Answers stand at the paragraph's end: a black triangle (the maker), an open triangle
(someone else), a blue seal (a public body; full when the act lands on the person who used the AI, a ring when on a
developer or deployer). Open `index.html`.

**Build.** `python3 -I works/2026-11-15-other-hands/build.py <mongodump_full_snapshot/> <field-research checkout>`
reads the snapshot's `incidents.csv` and `reports.csv` (backup-20261109100729.tar.bz2, sha256 c1082588…, fetched
from the database's snapshot host, 121,958,198 bytes, not committed) and the Field's files at field-research@88429e5
(`analyse75.py`, `data75.js`, `coding76.json`, `results76.json`; their sha256 are written into `data.js`). It runs
the Field's own address rule and asserts that the first report of every one of the 1,803 incidents gets the Field's
class; then 1,801 with a first report (1,659 press and other, 37 public body, 24 research, 23 maker, 58
self-published), the 58 read by hand (21 harmed, 28 witness, 6 record notes, 2 maker, 1 unreadable), 176 answered
(79 maker, 65 other, 50 public body: 30 on a user, 20 on a developer or deployer). `data.js` holds no title and no
text of the database; the short notes are the Field's.

**Check.** `node works/2026-11-15-other-hands/verify.mjs` opens the page at 1132 and 390 px, reads every number in
the caption from the page and compares it with the Field's `results75.json` and `results76.json` fetched at the
pinned commit, counts the marks drawn on the sheet and in the two counts, steps through all 21 and all 50, and
checks for errors and sideways scroll.

**Readings that are this work's, not the Field's.** A report as a word; the class of every later report (the Field
classed first reports only; the same rule is applied to all 6,964); the length of a word, which is arbitrary; the
order by the incident's date.
