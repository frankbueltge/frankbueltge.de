# OTHER HANDS

The Studio's work for cycle 015, step 3 of the programme *Can increasingly capable AI be kept under human and
democratic control, and by whom?* In progress: state 2 of 4 (session 247, 2026-11-15). Score: `SCORE.md`.
Critique: `CRITIQUE.md`.
Process: `PROCESS.json`, `process/`.

**What it is.** The AI Incident Database (snapshot of 2026-11-09) as one sheet: a paragraph per incident, a word per
attached report, drawn by the class of the address it was published at. The first word of a paragraph is drawn by
what readers found in it. On platforms without an editor (58, the Field's checked coding): a red scribble where the
harmed party wrote, a grey pencil scribble for a witness. From edited addresses (149 read: the Field's 120 drawn by
lot, the Atelier's 30, one read by both): a red scribble in a frame where the harmed wrote and a publication
printed it (4), a red line through the word where the harmed speak in their own words (8, the Atelier's rule), a
dashed red line where their words are quoted or carried (60: the Field's 46 by its wider rule, the Atelier's 4
statements of an organisation and 10 through someone else), a thin outline where nothing of theirs was found (77).
Answers stand at the paragraph's end: a black triangle (the maker), an open triangle (someone else), a blue seal (a
public body). A disc lands on the person who used the AI, a ring on a developer or deployer; a whole seal is an act
concluded in the record, half a seal one only begun; a square in the ring means the party acted on is itself a
public body; a double ring marks the five acts concerning a maker of a general model. Open `index.html`.

**Build.** `python3 -I works/2026-11-15-other-hands/build.py <mongodump_full_snapshot/> <field-research checkout>
<ulysses checkout>` reads the snapshot's `incidents.csv` and `reports.csv` (backup-20261109100729.tar.bz2, sha256
c1082588…, fetched from the database's snapshot host, 121,958,198 bytes, not committed), the Field's files at
field-research@6b562d3 (`analyse75.py`, `data75.js`, `data77.js`, `results77.json`, `check77/adjudication.json`,
`coding76.json` for the short notes) and the Atelier's at ulysses@39c8e8a (`check.js`, `check.json`); their sha256
are written into `data.js`. It runs the Field's own address rule and asserts that the first report of every one of
the 1,803 incidents gets the Field's class, then every count against the siblings' result files: 1,801 with a first
report, 21 harmed of 58, 4 of 120, 60 public acts of 176 answered (36 on a user: 16 concluded, 20 begun; 24 on a
developer or deployer: 18 and 6), the estimate of 77 (43 to 160). `data.js` holds no title and no text of the
database; the short notes are the Field's and the Atelier's.

**Check.** `node works/2026-11-15-other-hands/verify.mjs` opens the page at 1132 and 390 px, reads every number in
the caption from the page and compares it with the Field's `results75.json`, `results77.json` and
`check77/adjudication.json` and the Atelier's `check.json`, fetched at the pinned commits; it reads the numbers in
the page's sentences and in the two lifted readings, counts the marks drawn on the sheet and in the counts, steps
through all 93 red paragraphs and all 60 acts, and checks for errors and sideways scroll.

**Readings that are this work's, not the siblings'.** A report as a word; the class of every later report (the
Field classed first reports only; the same rule is applied to all 6,964); the length of a word, which is arbitrary;
the order by the incident's date; drawing the Field's wider "quotes or carries" and the Atelier's "through someone
else" and "an organisation's statement" as one dashed line; half a seal for an act the record shows only begun.
