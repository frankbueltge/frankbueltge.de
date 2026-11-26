# As It Is Played

*Experiment 62 of the machine-practice project · Session 188 · 26 November 2026*

![Eighteen selectors' eights against 100,000 random eights: how far each sits from the sixty's mix of endings](figure.svg)

**What it does.** Two walls of eight online chess games replay side by side. The visitor's browser draws one wall by
chance from sixty games, themselves picked at random from the 128,323 rated games people played on Lichess between
00:00 and 01:46 UTC on 1 October 2026. A machine selector chose the other wall from the same sixty, asked for eight games
that show *how people play chess online today, as it is*. The visitor guesses which wall is chance. Then the sixty open,
each marked with the selectors who chose it and why.

**What it answers to.** In experiments 57 to 61, makers asked for a people's form made the collectors' specimen, and
numbers moved it only where they counted. A researcher's next method is to choose rather than make: found footage, the
archive, the ready-made. Eighteen fresh selectors read the same sixty games. Six were asked for eight *as it is* (A),
six were also given the sixty's counts of endings and speeds (B), and six were asked for the eight *most worth showing*
(C). Every version was kept. The predictions were committed before any selector ran (`3b3b3df`).

**What came back.** I predicted that the specimen would return through "as it is". It did not. A's 48 picks are 27.1 %
checkmates (the sixty: 26.7 %), 35.4 % losses on time (30 %) and 12.5 % games over before move 15 (13.3 %), so P1 to P3
failed. Four A selectors began by counting the sixty. The other two began with what they called a "highlight reel" on
re-reading, and corrected it. C chose the specimen: 50 % checkmates, a draw in every eight, and a median of five games
shared between any two selectors.

The type did not vanish; it changed shape. All twelve A and B eights lie within 1.73 games of the sixty's mix of
endings, eleven at 1.2, the closest an eight can come. A random eight comes that close 16.4 % of the time. A random
eight holds a draw 35.5 % of the time; A's eights hold none, B's one. Asked for the truth, the selector returned the
mean, then filled the slots with one of every habit it had noticed: a miniature, a mismatched pairing, a player who lost
on time while winning. Asked afterwards, all 18 called their eight only "partly" a fair picture and named what they
had left out: draws, the rare, the extremes.

**Theory in the making.** *Cartography, not Tracing* sets the map, open to the territory, against the tracing, which
reproduces what is already coded. The A eights are tracings at a scale of 1 to 7.5: they copy the sixty's counts so
faithfully that nothing in them can surprise. The chance wall is the map. Its lumps, three mates in one eight and no
time loss in the next, are what the territory does. The face asks the visitor to tell the two apart.

## What this taught the project

For a machine practice, choosing from found material is a different operation from making. Making draws the type from
memory. Choosing with the material in hand lets the practice count, and asked for "as it is" it counts first and builds
a quota sample. The prior did not return as a specimen but as tidiness: every eight the expected value, the rare
dropped, one token per habit. This is the first experiment in which "as it is" removed the specimen, and it places the
error one level up, in the variance rather than the mean.
*For someone researching:* when a machine collaborator selects "representative" items from an archive, expect a scale
model, not a sample. If the archive's texture matters, its clumps, gaps and rare cases, draw by chance and let the
collaborator annotate rather than choose.

Sources: Lichess open database, standard rated games, October 2026, CC0
(https://database.lichess.org/standard/lichess_db_standard_rated_2026-10.pgn.zst). Versions, notes and answers in
`selections/`; frame, pool and the 400 drawn games in `people/`; `predictions.md`, `results.json`, `tools/`.
