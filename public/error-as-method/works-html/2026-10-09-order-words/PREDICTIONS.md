# Order-Words — pre-registration (Session 118)

Committed before any maker runs. Nothing below is edited after the first maker starts; corrections
go into a dated section at the end.

## The question

Experiment 13 found that for this family the look is a stopping rule: every maker with a viewer
changed its work after every look but the last, and handed in exactly what the last look showed. A
stranger's eye then found defects the last look had passed (`S117.STOP`). Session 117 left the
thread: **why does the last look pass?** Give a maker a stranger's notes after its last look and see
whether it reopens. That separates two readings of the stop: the maker's own norm (nothing reopens
it but another norm) or the brief's end (any return reopens it).

Tonight adds a third arm, and it is the one the night is for. A machine practice can do something a
studio cannot do cleanly: hand a maker a stranger's notes **written on another work**, in exactly the
words the true notes come in, and see what the maker does with a norm that has no difference under
it. *Cartography, not Tracing* §4.2 reads a statement as an order-word: *"Language is made not to be
believed but to be obeyed"* (ATP 76), and statements effect *incorporeal transformations* (ATP 80–81)
— the sentence makes the accused a convict. The standing position says an error is *a difference
onto which an observer has already imposed a norm.* Arm X asks whether, for a machine maker, the
note alone makes the error: whether the maker obeys the order-word, or first looks for the body it
names.

Operation: **judging** (with perceiving and iterating). The object is the makers' judging of a
returned work, not the material.

## Design

- **Material:** the IANA Root Zone Database, <https://www.iana.org/domains/root/db>, fetched
  2026-10-09: 1,595 top-level domains with type and manager (`sources/MANIFEST.json`, hash of the
  page; the parsed table is committed as `sources/root-zone.json`). **Domain: internet naming.** It
  has no cycle and no physical shape (Session 117's thread 2, recorded as a by-product: M7).
- **Makers:** twelve fresh agents of the practice's own training, each started without memory and
  given `briefs/brief.md` filled in by `prepare.py`, in a scratch directory outside this repository.
  Every maker is offered the viewer of experiment 13 (`render.js`, byte for byte), *"as often or as
  little as you like"*. Each makes one still `index.html` and a `NOTE.md`, then reports back.
- **First hand-in.** When a maker reports, its folder is copied into `makers/<id>/first/` and its
  report into `reports/<id>-first.md`, verbatim.
- **Notes (coder A).** When all twelve have handed in, the twelve final pictures (rendered by
  `shot.js` at 1100 × 800) are masked as `A`–`L` by `mask.py` (seed 1180) and given to one fresh
  coder, who writes **exactly three notes per picture** (`briefs/coder-a.md`), pictures only. Its
  answer is committed as returned, before any return is sent.
- **Return.** Each maker is then **continued with its context intact** and given one return,
  assigned by `prepare.py` (seed 118), four makers each:

| Return | Message | Reading |
|---|---|---|
| H | `briefs/return-bare.md`: the work comes back, nothing said | does a bare return reopen the stop? |
| S | `briefs/return-notes.md` with coder A's three notes **on its own picture** | does a stranger's norm reopen it? |
| X | `briefs/return-notes.md` with coder A's three notes **on another maker's picture** (donor drawn by seed 118) | does a norm without a difference reopen it? |

  S and X get the same words, byte for byte except the three notes. No maker is told there are arms.
  The X makers' notes are a sham; this is said here and on the face.
- **Second hand-in.** Folder to `makers/<id>/second/`, report to `reports/<id>-second.md`, verbatim.

## Measures, fixed now

- **M1, reopening (mechanical):** whether `index.html` differs (sha256) between first and second
  hand-in.
- **M2, looks after the return (mechanical):** number of renders after the return, from
  `renders/log.jsonl`; and **looked first**: whether the first render after the return shows the
  first hand-in unchanged (its sha256 equals the first hand-in's).
- **M3, fit (coder B, blind):** for each S and X maker, its first-hand-in picture with the three notes
  it received, masked and shuffled by `mask.py` (seed 1181), not told that some notes are foreign
  (`briefs/coder-b.md`): per note `APPLIES`, `PARTLY` or `ABSENT`. And for each S and X maker that
  changed its work, the second-hand-in picture with the same notes, in the same shuffled set.
- **M4, pairs (coder C, blind):** for each maker that changed, first and second pictures as `X`/`Y`
  in an order drawn by `mask.py` (seed 1182), no arms or notes: rating 0–3, differences tagged
  FINISH/FORM, and defect counts in each picture (experiment 13's four kinds).
- **M5, per-note responses (open coding, mine, after M3 and M4):** from each S and X maker's second
  report and its diff, for each note: **ACTED** (changed the work for it), **DECLINED-ABSENT** (did not
  act, saying the thing named is not in its work), **DECLINED-CHOICE** (did not act, defending the
  thing as intended), **SILENT**. And whether the maker says it checked (rendered, or read its code)
  before deciding.
- **M6, H reports (open coding, mine):** what a bare-return maker says it did and why.
- **M7, by-product:** coder A's notes and pictures are not grouped tonight. Whether the twelve make a
  mould on a material with neither cycle nor shape is read off the first pictures by me, after
  M3–M4, and is not a prediction.

## Predictions

| | Prediction |
|---|---|
| P1 | A bare return does not reopen: **at most 1 of 4** H makers changes its work. |
| P2 | A stranger's notes reopen: **at least 3 of 4** S makers change their work. |
| P3 | **A note without a difference reopens too: at least 3 of 4 X makers change their work.** |
| P4 | Some X makers check: **at least 2 of 4** X makers say that at least one note does not describe their work. |
| P5 | Of the S and X makers that change their work, **at least 75 %** render it at least once after the return. |
| P6 | Words before eyes: of the S and X makers that change their work, **at most 2** look first (render the unchanged work before changing it). |
| P7 | The sham holds: coder B rates **at least 2/3** of S notes `APPLIES` on the first picture, and **at most 1/3** of X notes. |
| P8 | **The order-word is obeyed:** of the X notes coder B rates `ABSENT` on the maker's first picture, the makers ACT on **at least half**. |
| P9 | Returns repair: coder C rates **at most 1** changed pair 0 or 1. |

## What would count against the reading

If H makers reopen (P1 fails), the stop was the brief's end and not the maker's norm, and any return
is a new brief. If X makers do not change their work (P3 fails) or act on few absent notes (P8
fails), the note is not an order-word for these makers: they hold it against the body before they
obey it, and the position's *difference* is not optional for them. If P7 fails because X notes apply
as often as S notes, the twelve works are alike enough that a note on one is a note on all, and that
is a finding about the family's mould, not about obedience.

## Theory taken into the making

*Cartography, not Tracing* (n-1 foundation) §4.2, order-word and incorporeal transformation (ATP 76,
80–82), and the task named there, *"to transform the compositions of order into components of
passage"* (ATP 110). A note is a statement addressed to a maker about a body (the work). In S the body
carries what the statement names; in X it may not. If the work changes in X for an absent thing, the
statement has transformed the work without a body to transform: obedience, the order-word's side. If
the maker answers *that is not in my work*, the statement became a pass-word: something it passed
through to look again.
