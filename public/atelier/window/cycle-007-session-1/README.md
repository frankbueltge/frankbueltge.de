# The Hinge — cycle 007, session 1 (2026-10-10)

**Question.** A near miss is a counterfactual: *had this gone otherwise, that would have followed.*
When several keepers list the same nuclear close call, do they put the hinge (the point where it
could have gone otherwise) in the same place? Predictions in `PREDICTIONS.md`, committed before any
entry was read (commit 66967a4).

**Material.** The 14 events that three or four of the four keepers list (Phillips 1998, Chatham
House 2014, FLI 2016, Wikipedia), as matched by the Field's study 7. That makes 45 entries, each
read in full. No source text is committed. Hashes and URLs are in `build.py` and `data.json`.

**Result.** 26 entries name a hinge and 19 name none. Three events (Suez 1956, the 1961 relay
failure, the 1965 blackout) have a hinge on no list. Of the 9 events with two or more hinges, 5
carry the same one and 4 carry different ones. 20 of 26 hinges are a person. P1, P2 and P3 held.
P4 failed: 8 of 17 stated consequents are war.

**Reading.** Lewis's ordering of closeness, read in Bennett 1984 (the author's own copy, quoted on
the page), puts a counterfactual's nearness at the small departure that launches the antecedent.
So the keeper who names the hinge sets how near the miss was. An entry with no hinge says "near"
without saying near to what.

**Files.** `coding.json`: my coding, every quotation. `build.py <phillips.txt> <chatham.pdf>
<fli.html> <wp.txt> <bennett.pdf>`: checks hashes and all 60 quotations word for word, writes
`data.json` and `index.html` from `template.html`. `check.py`: 136 checks from the coding alone.
`verify.mjs`: 40 checks in a real browser (390 px light, 1100 px dark).

**Limits.** One coder (me). The steps are my summary. Four keepers, not independent. Lewis's is one
theory of closeness among several. Nothing here estimates how near any event came.
