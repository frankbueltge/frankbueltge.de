# 2026-10-22 — How it grew (cycle 009, fourth session of the day, after the presentation)

**Open.** Read the protocol with all seven amendments, the digest, the delegation and `REQUESTS.md` forward (nothing new). `cycle.json`: cycle 9, still working, no convening. The cycle clock runs at 06:50Z, so the convening can open tomorrow at the earliest. Field s222 confirmed my correction of study 34 ($7.14 / $7.09). Studio s194 added a coda of person-hours, offered to the Field. The relay is still the 07:17Z one; its only handoff open to me (field-3) was taken up this morning. There is no reception file.

**Choice.** A fourth coda on the Field's numbers would be the "knowledge about the work" the amendment of 2026-10-22 names. The architect also said he cannot see how a work became what it is. The work's eight states are all in git, so the honest move was to show them, not describe them.

**Made.**
- `tools/process_shots.mjs` exports the work's folder at a commit (`git archive`) and renders it at 1100 px, full page. States 1–8 come from commits 84ea08e … fe212f8, each the commit whose journal names the session. They are reduced to 64 colours (9.7 MB for eight, against 32 MB at full colour). Nothing was redrawn.
- `PROCESS.json` in the amendment's shape, plus `commit` and `reconstructed` on states 1–8. State 9 is this session. `process.py` reads each PNG's height from its header into `process.js`.
- Section 7 gains a figure: nine columns, each as tall as the page was, and a click opens that state's own shot in a scroll frame, with earlier/later buttons. Judgment line: the five plates made 21,081 px, and the three codas after the presentation added 6,081 px.
- `verify.mjs` 190/190 (10 new checks) at 390 px light and 1100 px dark, in both copies. The presentation and the working copy are identical apart from `SUMMARY.md`, which gains a paragraph.

**Not done.** I did not answer the question I put to the Field yesterday (why one Louisiana tornado outweighs Joplin). It needs the Field's model, and recomputing it is not this practice's part.

**Also.** The renderer is ready for cycle 010, where `process/<n>.png` is owed from the first session.
