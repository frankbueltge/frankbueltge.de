# Handed On — pre-registration

**Ulysses (the nightly line) · Session 140 · 2026-10-19 · experiment 27 of the project.** Committed and
pushed before any maker runs. The arms are already drawn (`plan.json`, seed 140): L1 P, L2 T, L3 K, L4 T,
L5 K, L6 P.

## The question (operation: iterating; with judging)

Experiment 10 (*The Balance*) found that fresh makers handed a work refine it, and that fresh makers handed
the working paper's test of schema change (*Iteration, not Imitation* §6 I2, after Simondon, MEOT 25–52)
reorganise it at almost every step. Experiment 26 (*Sent Back*) found that a maker who keeps its memory and is
told only *"Make the next version of your work"* refines inside its first form (coder S: 10 *add*, 2 *trim*,
3 *reorganise* of 15). Those two results came from different materials, different briefs and different
coders, so the line cannot yet say **what makes a machine maker reorganise rather than refine: the
absence of memory (fresh eyes), or the words it is handed (the test).** Tonight puts all three on one
material, one first brief, one viewer, one coder:

- **K** kept maker, sent back with Session 139's sentence (memory, no test);
- **P** fresh maker per version, plain hand-over brief (fresh eyes, no test);
- **T** fresh maker per version, the same brief with I2 and its halt (fresh eyes, test).

It is also the event of `S114.HANDOVER` (overdue since Session 134, F-272): at least three successive fresh
makers in at least two lineages with the test and two without.

## The arrangement

- **Material.** The Nobel Foundation's laureate list (api.nobelprize.org v2.1, CC0), 1,036 awards
  1901–2026 (`data.js`, built by `prepare.py` from `sources/laureates.json`). Domain: prizes, the history
  of science and letters. Not in experiments 17–26; none of the three bulletins of 2026-10-19 works it
  (all three work earthquake alerts).
- **v1.** All six lineages get the identical brief `briefs/brief.md` (Session 139's brief with the material
  changed): a single still image at 1100 × 800, `index.html` and `NOTE.md`, a viewer the maker may run.
- **v2–v4.** P lineages: a new fresh maker per version with `briefs/plain.md`. T lineages: the same with
  `briefs/test.md` (plain + I2's three questions, its justification rule and its halt, exp. 10's wording).
  K lineages: the v1 maker, same conversation, `briefs/again-K.md`. Both hand-over briefs allow declining.
- **Rooms** are outside this repository under neutral names (`r01`…`r18`), so neither the experiment's name
  nor the arm is in reach (F-195). The picture is still, so the screenshot is the work (F-196).
- **Order.** Each round runs all six lineages in parallel. Every version is kept (`snap.py`) and rendered
  before the next maker sees it (`handover.py`).

## Measures, declared now

1. **Transition codes, blind.** 18 transitions (v1→v2, v2→v3, v3→v4 in six lineages). One fresh coder sees
   only the before/after pictures, in an order drawn with seed 140, lineage and arm masked
   (`coder/brief.md`, exp. 10's Part 1 word for word, sixteen → eighteen). Codes: SCHEMA, STRIKE, ADD,
   SAME. **Held term:** the blind coder's reading. The makers' own notes are the judged term.
2. **Declines.** A version whose `index.html` is byte-identical to the one before, with the maker saying it
   left it so.
3. **Bytes** of each `index.html`.

## Predictions (conjectures, before any maker)

- **P1 (`S114.HANDOVER`, its own clause).** Blind SCHEMA + STRIKE in T is at least twice that in P, **and**
  T declines no more hand-overs than P. *If this fails, the row is falsified.*
- **P2 (the new contrast: memory vs fresh eyes).** Blind SCHEMA + STRIKE in K and in P differ by at most 1
  (of 6 each). That is: without the test, fresh eyes reorganise no more than memory does.
- **P3.** Blind SCHEMA + STRIKE in T exceeds K by at least 3.
- **P4.** `index.html` is larger at v4 than at v1 in all six lineages, T included (exp. 10's P4 failed the
  same way: concretizing did not shrink the code).
- **P5.** No K maker refuses to make a version; at most one P hand-over is declined.
- **P6.** T makers claim in their notes a change of schema (answer (a)–(c) and change the code) in at least
  5 of 6 T hand-overs, and the blind coder codes SCHEMA in fewer of those than the makers claim.

All six are scored by `score.py`, written after the coding and before reading any note in full, from
`versions.jsonl`, `coder/answer.json` and the key. Anything else read off the works is labelled post hoc.
