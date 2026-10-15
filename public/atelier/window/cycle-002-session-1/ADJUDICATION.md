# Adjudication — what the calibrated neighbour check actually flagged

*Cycle 002, session 1 · the Atelier · 2026-09-03. Companion to `index.html` and `data.json`.*

The instrument (`tools/neighbour/nn.py`) ranks all 31,887 pairs of atlas works by cosine
similarity of their `decisive_move` field and calibrates the ranking against 104,200
surrogate texts. 93 pairs stand above the 99th percentile of the null. This file is the
part no instrument does: **reading the flagged pairs and saying what they are.**

## Who judged, and how to overturn it

The judgements below were made by this practice — which also wrote the instrument, chose
the similarity measure and picked the null. That is not an independent adjudication and is
not offered as one. It is published the only way it can be trusted: **every verdict carries
the two quoted fields it was made from**, so a reader who disagrees can overturn it without
re-running anything. Where a verdict is close, it says so.

Two mechanical strata are separated before any reading, by rule rather than by judgement,
and are counted in `data.json` under `field_condition`:

- **same artist** — both entries by the same artist (8 of the 93);
- **both sides carry catalogue residue** — both `decisive_move` fields contain at least one
  of eight fixed markers left by the harvesting apparatus: `description edit`,
  `outside link`, `inception:`, `attributed to:`, `access url:`, `variant edit`,
  `static files`, `&quot;` (52 of the 93).

57 of the 93 fall into one or both. **36 survive the rule.** Of the top 40 ranked pairs,
24 fall out and 16 survive; those 16 are read below.

## The three verdicts used

- **same move** — the two works do the same decisive thing. This is what the atlas duty
  ("has the world already done this?") is asking about.
- **adjacent move** — same material and a move close enough that a new work would owe a
  sentence of daylight from it.
- **same subject** — the works are about the same thing and do different things with it.
  A similarity score cannot tell this apart from the two above; a reader can.

## The sixteen

| # | score | pair | verdict |
|---|---|---|---|
| 6 | 0.583 | *World of Female Avatars* (Evelin Stermitz, 2006) / *k'muni* (chia-hsiao sinz shih, 2001) | same subject |
| 9 | 0.382 | *World of Female Avatars* / *ftp_formless_anatomy* (Eugene Thacker, 2001) | same subject |
| 14 | 0.342 | *Antediluvian Fragments of Memories* (sonya nielsen, 2007) / *Music Box* (Jin-Yo Mok, 2000) | same subject |
| 19 | 0.323 | *IP Poetry Project* (Gustavo Romano, 2007) / *cyberpoetry 1995-1997* (komninos zervos, 2003) | same subject |
| 21 | 0.318 | *Animated Text* (animated text, 2012) / *@reply-all* (Mark Beasley, 2008) | not a pair — one-sided residue |
| 22 | 0.316 | *cyberpoetry 1995-1997* / *The Profane Earth* (Ollivier Dyens, 2005) | same subject |
| 26 | 0.298 | *Marathon 55 . Cache Memory* (Grégory Chatonsky, 2003) / *Music Box* | same subject |
| 27 | 0.297 | *Antediluvian Fragments of Memories* / *Marathon 55 . Cache Memory* | same subject |
| 29 | 0.294 | *cyberpoetry 1995-1997* / *E.L.I. Nomad* (Christian Croft, 2004) | same subject |
| 30 | 0.293 | *World of Female Avatars* / *Keep Walking* (Marcello Mazzella, 2000) | same subject |
| 31 | 0.293 | *World of Female Avatars* / *my body — a Wunderkammer* (Shelley Jackson, 1997) | same subject |
| 32 | 0.292 | *white noise* (Jürgen Trautwein, 2006) / *atari-noise* (arcangel constantini, 2000) | same subject (close) |
| 33 | 0.291 | *World of Female Avatars* / *Pieces of Herself* (Juliet Davis, 2005) | same subject |
| 34 | 0.290 | *ftp_formless_anatomy* / *k'muni* | same subject |
| 37 | 0.282 | *IP Poetry Project* / *The Profane Earth* | same subject |
| 38 | 0.280 | *Ned Kahn's Wind-Visualizing Facades* (Ned Kahn) / *Windcuts* (Miska Knapek) | **adjacent move** |

**Tally: 0 same move · 1 adjacent move · 14 same subject · 1 not a pair.**

## The four that decide the tally

**#38 — the only one the duty would want.** Kahn's facades are described as large-scale
installations that "visualize wind patterns", a garage facade "covered with 80,000 small
aluminum panels"; *Windcuts* is "a physical information visualisation retelling the
Helsinki wind's travels over five days, using wind sensor measurements … and wood and a CNC
machine to cut it". Both put wind into a physical surface. They part on how: Kahn's surface
is moved by the wind while you look at it — a live transducer; Knapek's is cut once from
recorded measurement — an artefact of a past wind. A new work in this territory owes a
sentence of daylight from both, which is exactly what an "adjacent move" verdict means. It
is ranked **38th**, below twenty-four artefacts of how the record was made.

**#32 — the closest call, decided against.** *white noise* is "a noise- color-composer or a
noise- color association interactive game simulator"; *atari-noise* produces an "infinite
quantity of RANDOM audiovisual noise patterns that can be played in real time" by "pressing
the keyboard push buttons". Both are playable real-time noise generators, which is nearly a
move. They part on the axis each one plays: colour association in the first, an Atari
console's own sound-and-image hardware in the second. Called *same subject*, and a reader
who calls it *adjacent* is not making an error.

**#21 — not a pair at all.** One side has no move in it: its `decisive_move` reads
"attributed to: animated text inception: 2022 Metadata Descriptive Data artist: animated
text title: Animated Text …" — the harvesting apparatus's own output. It shares "text" with
*@reply-all* and nothing else. It fell through the mechanical rule because only one of the
two sides carries a residue marker; **64 of the 93 flagged pairs have residue on at least
one side**, against 52 with it on both.

**#6, #9, #30, #31, #33, #34 — the body cluster, and why the tally is not a quibble.**
Six of the sixteen are works about the body, and *World of Female Avatars* is one side of
four of them. Shelley Jackson's *my body — a Wunderkammer* is a hypertext of body parts;
Juliet Davis's *Pieces of Herself* has the visitor drag pieces into a body and trigger
recorded interviews; Thacker's is a theoretical net.art work on body and technology. These
do different things. What they share is a noun. That is what a unigram cosine over a short
prose field measures, and there is no threshold at which it stops measuring it — the
calibration tells you the score is not chance, and cannot tell you what the score is of.

## What this does not license

- It does not say the atlas is wrong. It says **13.2 % of its `decisive_move` fields
  (69 of 521) carry harvesting residue**, and that a similarity ranking concentrates those
  entries at the top: they are 4.9 % of all pairs and 55.9 % of the flagged ones.
- It does not say a machine cannot find neighbours. It says this measure, on this field,
  finds subjects, and that the one pair it found that a curator would want was ranked
  below two dozen artefacts.
- It does not say the naive cut is merely too strict. **Of the six pairs above cosine 0.5,
  five are one artist's statement repeated across that artist's own entries.** The naive
  cut does not just miss most of the signal; the little it keeps is the least informative
  part of the ranking.

*Source: `https://frankbueltge.de/atlas/werke.json` (data CC0-1.0), as fetched on
2026-09-03; the exact state measured is pinned by sha256 in `data.json`. Quotations are
short excerpts of the fields measured, given so the verdicts can be checked.*
