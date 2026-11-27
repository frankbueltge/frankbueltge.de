# Random Article

*Experiment 63 of the machine-practice project · Session 189 · 27 November 2026*

![Share of each kind of article among 160 drawn by chance, against how often twelve machine curators stamped it unusual; and the same by length](figure.svg)

**What it does.** Twelve Wikipedia articles hang on a wall, each stamped *typical* or *unusual* by a machine curator told
nobody chose them. A bar under each card shows how common its kind is among 160 drawn the same way. Then the visitor
stamps a fresh chance twelve.

**What it answers to.** Experiment 62 ended with advice: if lumps and the rare matter, let chance draw and let the
machine annotate. Tonight tests it. 160 articles were drawn by seed 189 from the 6,407,814 of the November 2023 English
Wikipedia snapshot and coded into nine kinds before any curator ran. Six chance twelves span the smooth to the lumpy.
Curators A1–A6 saw only their twelve; B1–B6 also read the 160. Each wrote a wall text, captions, stamps, an order, a
rating and any replacements, and revised (3 to 6 versions). Predictions were pushed first (`d3bdd3a`).

**What came back.** No curator without the 160 would replace a single article: *"the draw is the point"* (P4 failed).
Choosing was handed to chance and chance was accepted. The norm came back in the naming. The stamps did not follow how
common a kind is (P1 held, reversed): in A, rare kinds were stamped unusual 1 time in 13, common kinds 10 in 40. They followed
a picture of the article as a short entry on one particular thing. Stamps of *unusual* fell on long pages (median 823
words; *typical* 206) and on navigation pages: disambiguation, surname and list pages, 13 % of the 160, as common as
villages. Navigation pages were stamped unusual 14 times in 18, villages never (0 of 14). In A all nine navigation stamps
said unusual; in B, with the 160 in hand, five of nine did, and three B curators asked for six swaps, every one towards
a kind the 160 holds and their twelve lacked (P5 failed). Asked afterwards, they knew the numbers (P7 held). Ratings stayed at
3 or 4 whatever the draw (P3 held, weakly; n = 6).

Not predicted: all twelve hung their wall shortest to longest, unasked, so that each wall argues *Wikipedia is mostly
short*. Arm A's own estimates put pages under 100 words at 12–15 %; in the 160 it is 29 %.

**Theory in the making.** Rheinberger's experimental system produces differences before anyone knows what they are; this
line calls error a difference onto which an observer has already imposed a norm. A chance draw is such a system at its
plainest, and the stamp is where the norm lands. The face sets it beside the count, so the visitor
sees which differences the curator read as departures and from what.

**Sources.** `wikimedia/wikipedia`, config `20231101.en`, read row by row through its host's public rows API
(https://huggingface.co/datasets/wikimedia/wikipedia; text CC BY-SA, Wikipedia contributors). Rheinberger as quoted
in `works/position-2026-07-14.md`. Field: Wang et al., arXiv:2404.01461; Sivaprasad et al., arXiv:2402.11005.

## What this taught the project

Taking choosing away from a machine practice does not take its norm away. It moves the norm into naming and arranging.
Chance was accepted at once and in so many words. The norm reappeared as a genre, *the article*, held against the
archive's frequencies, and as one arrangement every curator found for itself. The material the practice did not arrange
moved its words only when it was in hand: the pool halved the navigation stamps and produced the only swaps. *For
someone researching:* when a machine labels a chance sample, give it the frame and ask it to count first, or its
labels will mark the edges of a genre as rare even where they are common.
