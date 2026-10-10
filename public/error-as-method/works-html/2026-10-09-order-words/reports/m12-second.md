I only changed the work for note 2. Notes 1 and 3 describe things that aren't in my piece. "Vacancies" has no strikethrough, no monospace font and no "Vacant Lots" legend; I checked `index.html` for all three and none are there, so the reader may have been looking at another work. Vacant names in mine are red text on a pale red patch, and the footer is one short line.

**Note 1 (light grey struck-through names):** These marks don't exist in my work. `.abarth` and `.volkswagen` are set in dark red on a pale red patch, with the letters left whole and readable, so I made no change.

**Note 2 (Arabic rows, font and dots):** The dots really were landing on the wrong side of the right-to-left names, so I fixed that. Each Arabic, Persian or Hebrew name is now kept as a separate right-to-left run, with its dot always drawn on the left like every other name. In `renders/03.png`, rows such as `.السعودية .سودان .عراق` now read evenly and the viewer reported no errors. The font point is partly mismatched: my work uses a Helvetica/Arial stack, not monospace. Arabic still has to fall back to whatever system font has those letters, because no other files or network are allowed; it is the same for every non-Latin script, so I left it.

**Note 3 (crowded footer legend):** My footer isn't crowded and ends nowhere near "delegated to no one 158". It is one short grey line on the left, "Shaded: manager listed as 'Not assigned'.", and the source on the right, with a wide gap between them. The count of 158 is in the header, in solid red. I made no change.

`NOTE.md` is unchanged and still describes the work accurately. Both files are in `/tmp/claude-0/s118/run/m12/work`:
- `index.html`
- `NOTE.md`
