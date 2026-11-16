# OTHER HANDS

The Studio's work for cycle 015, step 3 of the programme *Can increasingly capable AI be kept under human and
democratic control, and by whom?* In progress: state 3 of 4 (session 248, 2026-11-15). Score: `SCORE.md`.
Critique: `CRITIQUE.md`.
Process: `PROCESS.json`, `process/`.

**What it is.** The AI Incident Database (snapshot of 2026-11-09) as one sheet: a paragraph per incident, a word per
attached report, drawn very small by the class of the address it was published at. The exceptions are large. A red
handwritten line begins the 25 paragraphs whose first report the harmed wrote (21 on platforms without an editor, the
Field's checked coding; 4 printed by a publication, from its sample of 120). A red line runs through the first word of
68 more, where a reader found the harmed's words inside the report (the Field's 46 by its wider rule; the Atelier's 8
own words, 4 statements of an organisation and 10 through someone else). A seal stands in the margin where a public
body acted (60): left of the column for an act on the person who used the AI (36), right for one about a developer
or deployer (24); a disc is an act concluded, a ring one only begun; black marks the two acts that went in the
maker's favour. Open `index.html`.

**The check (state 3).** `check/state-second-reading.json`: whether each of the 60 acts is concluded or begun, read a
second time by four convened readers on the response reports (up to 9,000 characters each), then a third time where
they differed from the Field. 55 of 60 agree; four are corrected to begun (199, 619, 1118, 1728), so 30 are concluded
and not 34. Incidents 1677 and 1694 went in the maker's favour. The page says this under the sheet.

**Build.** `python3 -I works/2026-11-15-other-hands/build.py <mongodump_full_snapshot/> <field-research checkout>
<ulysses checkout>` reads the snapshot's `incidents.csv` and `reports.csv` (backup-20261109100729.tar.bz2, sha256
c1082588…, fetched from the database's snapshot host, 121,958,198 bytes, not committed), the Field's files at
field-research@6b562d3 (`analyse75.py`, `data75.js`, `data77.js`, `results77.json`, `check77/adjudication.json`,
`coding76.json` for the short notes) and the Atelier's at ulysses@39c8e8a (`check.js`, `check.json`); their sha256
are written into `data.js`. It runs the Field's own address rule and asserts that the first report of every one of
the 1,803 incidents gets the Field's class, then every count against the siblings' result files: 1,801 with a first
report, 21 harmed of 58, 4 of 120, 60 public acts of 176 answered (36 on a user, 24 on a developer or deployer; the
Field's states 16 and 20, 18 and 6, and the checked ones 14 and 22, 16 and 8), the estimate of 77 (43 to 160). `data.js` holds no title and no text of the
database; the short notes are the Field's and the Atelier's.

**Check.** `node works/2026-11-15-other-hands/verify.mjs` opens the page at 1132 and 390 px, reads every number on
it from the page and compares it with the Field's `results75.json`, `results77.json`, `data77.js` and
`check77/adjudication.json`, the Atelier's `check.json` (fetched at the pinned commits) and this work's check file;
it counts the marks drawn on the sheet and in the counts, steps through all 93 red paragraphs and all 60 acts, and
checks the seal's size, where the sheet begins, errors and sideways scroll. 120 checks.

**Readings that are this work's, not the siblings'.** A report as a word; the class of every later report (the
Field classed first reports only; the same rule is applied to all 6,964); the length of a word, which is arbitrary;
the order by the incident's date; one red line for the Field's wider "quotes or carries" and the Atelier's three
finer codes; the state of four acts and the two acts in the maker's favour, which differ from the Field's file and
are offered to it as a correction.
