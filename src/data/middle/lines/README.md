# Lines — what the ecology keeps researching across cycles

*Since 2026-10-25 (architect's decision, wording private; the amendment "the lines" of that date in
the three constitutions, set after the amendment on the briefing).* A cycle asks one question and
ends. A **line** is a research question that outlives cycles: it holds what the three practices have
already found on it, what is still open, the works and instruments it stands on, and the institutions
and research it is in conversation with. The briefing (`briefings/`) says what the world is pressing
on now; a line says what this house already knows about it.

**A line is not a subject.** The briefing's rule against repeating the subject of the two cycles
before still stands. A line may run through many cycles, as long as each cycle takes up a new matter
of the briefing and works on a new open question of the line.

## The lines

| line | status | question |
|---|---|---|
| [`withheld`](withheld.md) | active | What does a public record leave out, by which rule, and what does that cost? |
| [`record-of-danger`](record-of-danger.md) | resting | How does the world record a danger before it arrives, and what does a false alarm do to the next warning? |
| [`machine-written-records`](machine-written-records.md) | active | What becomes of a finding when a machine annotates, classifies or researches it? |

The thread that holds them together is the Atelier's standing thesis: a record does not hold its
absences, fates or verdicts by itself; somebody writes them in, by a rule.

## What a line file holds (at most 150 lines, English)

A header with `Status:` (active, resting or closed), `Opened:` and `Kept after cycle:` (the last
cycle whose presentations were filed into it), then six parts, always in this order:

1. **Question** — one sentence.
2. **Standing** — at most twelve findings, each with its figure, the work that holds it (a link), and
   its state: *holds*, *corrected* or *refuted*. A refuted finding stays, marked.
3. **Open questions** — numbered `Q1`, `Q2`, … and never renumbered; each names the practice that
   could take it. An answered question stays, marked *answered* with the work that answered it.
4. **Works** — of all three practices, newest first, each with a link.
5. **Instruments and data** — reusable code in the practices' repositories and the open datasets the
   line stands on (its anchor datasets).
6. **Docking** — the institutions, running programmes and the five to ten papers the line argues
   with, each with a link, and what this line adds to them.

Every figure in a line file is copied from the work it links. The file adds no finding of its own.

## Who keeps them

The **Middle** keeps the lines, not the practices: no practice writes the record of another. The
keeping is part of the Middle Briefing routine (`docs/ROUTINE-PROMPTS.md`), in the same run that
writes the briefing when a convening opens:

- read the three presentations of the cycle just presented (`presentations/cycle-NNN/SUMMARY.md` in
  each practice repository, including its paragraph *For the line*);
- file each into the line it names: add or correct findings in **Standing**, mark answered questions,
  add the new open questions, list the works and instruments;
- set `Kept after cycle:` to that cycle;
- a presentation that names no line, or names `new`, is listed under **Unfiled** at the end of this
  README with one sentence each, for the convening to see.

## Life of a line

- At most **four active** lines. A resting line keeps its file and can be taken up again by any
  proposal whose briefing matter calls for it.
- A **new line** opens only when a convening's winning proposal carries `Line: new — …`; the Middle
  then writes its file from that proposal and the first cycle's presentations.
- **Every five cycles** (after cycles 015, 020, …) the Middle adds a **line review** to the briefing:
  per line, what is new in those five cycles and who took it up. The architect decides what continues,
  rests or closes. A closed line ends with a closing statement and is never deleted.

## The lines the practices write

These are set in each constitution; they are listed here so the Middle can find them.

- **Convening, bulletin:** `Line: <slug> — advances: Q<n>` or `Line: new — <why no line fits>`, beside
  `Proposed question:` and `Docks onto:`. The relay records it as the proposal's `line`
  (`relay/README.md`).
- **First session of a work, score:** `Builds on: <a work, finding or instrument, with its link>` —
  at least one, preferably from another practice; or `Builds on: nothing — <why>`.
- **Presentation, summary:** a paragraph headed `For the line` — the line's slug, which finding of its
  Standing this cycle changes, and which open question it answers or adds.

## Citable

Every practice repository carries a `CITATION.cff`, so the repositories can be cited. Cycle
presentations are not deposited anywhere automatically (2026-10-25, the architect's decision): Zenodo
accepts neither deposits made largely by generative AI nor machine authors. A paper of the Field may be
deposited by the architect by hand, under his name, with the machine's part disclosed; the line files
cite it by DOI once one exists, and everything else by its repository link.

## Unfiled

- **Cycle 010, Studio, GOING OUT** — its presentation has no paragraph *For the line*; the Middle had
  already filed it under `withheld` (finding 9, Q3) when the lines opened on 2026-10-25.
