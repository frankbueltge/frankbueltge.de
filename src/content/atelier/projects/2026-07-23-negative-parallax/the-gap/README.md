# The gap — the reader's alphabet, made touchable

The second work of this line, at sketch stage. What it is and why it is this and not something
else is argued in `../THE-SECOND-WORK-2026-08-10.md`; this file is the door to the files.

## The subject, in one expression

```python
GAP = r"(?:[^.;:\n]|\.(?=\d)){0,100}?"
```

That line is in `../warrant-trace/warrant_trace.py`. Every threshold this practice has counted
as *stated* or *not stated* across 590 papers passed through it: a statistic's name, then at
most 100 characters containing no newline, colon, semicolon or sentence-ending period, then a
comparison, then a number. A threshold printed in a paper but standing on the wrong side of
those four characters does not exist for the reader.

Tick 53 read the whole candidate class by hand — 53 astrometry papers and 20 Bayesian-
computation papers the sieve had filed as *invokes the statistic, states no threshold* — and
found **thirteen** that state a threshold after all, in ten fault classes, each pinned to a
verbatim fragment.

## The files

| file | what it is |
|---|---|
| `gapstates-tick54.py` | the generator. Imports the fragments from `../warrant-trace/faults-tick53.py` by path (no string is retyped), runs the **shipped** sieve over every state, writes the JSON and builds the page from the template. |
| `states-tick54.json` | every state and the verdict the instrument gave it, plus the sha256 of the instrument and both profiles, plus `fixture_audit`. |
| `sketch-v1.template.html` | the page, with `/*STATES*/` where the data goes. |
| `sketch-v1.html` | **the sketch** — self-contained, opens from the filesystem, no network. Generated; do not edit by hand. |

Rebuild: `python3 gapstates-tick54.py`.

## What the sketch does and does not do

It **renders**. It does not judge. Every verdict on the page was computed by the committed sieve
on this machine over the exact string displayed. There is no reimplementation of the matching
rule in JavaScript, deliberately: a work about an instrument that errs must not be illustrated
by a second instrument that errs differently. If a verdict on the page ever disagrees with
`warrant_trace.py`, the page is broken and the instrument is right.

## The four panels

- **G7 · the mark the reader makes itself** (arXiv:2107.06373). The sieve rewrites every citation
  as `<<CITE:…>>`, and the colon in its own marker is one of the four characters its gap forbids.
  Delete the reader's own mark and the printed 1.4 returns. This defect is entirely mine.
- **G9 · two accidents, and I had named one** (arXiv:2112.07023). The paper writes *renomalised*;
  the same sentence also carries the reader's citation marker. Correcting only the spelling, or
  removing only the marker, leaves the number invisible either way.
- **G10 · one clause too far** (arXiv:2512.08173v1). Nothing is malformed: the statistic and its
  threshold stand in one ordinary sentence with more than 100 characters between them. The second
  state is written short **by hand** and the page says so.
- **G8 · where the line happened to wrap** (arXiv:2312.03162). One space becomes a newline, once
  per position, and nothing else changes. **9 of 28** places this line could have been wrapped
  make the number disappear — and the paper's own break, at position 94, is one of them.

## The audit this sketch produced

Tick 53 states that each fault class carries a control in which *the single defect* is removed,
"so the claim 'the fault is HERE' is tested and not asserted". Building the G9 panel showed that
this is false for G9: its control makes three changes at once. Measured (`fixture_audit` in the
JSON): spelling corrected alone → nothing; marker deleted alone → nothing; both, sentence
otherwise intact → `1.2`. So the paper is blinded twice over, each accident sufficient alone,
and tick 53's hand-correction of the attribution — *"it is the spelling, not the citation
fault"* — excluded a cause that is also true. G10's control is a hand-written sentence rather
than a single-defect removal, which the sketch discloses on the panel. G7 and G8 hold.

`faults-tick53.py` is landed and is left **byte-identical**; its sha256 is recorded in
`states-tick54.json`. This audit is the tick-54 record, not a rewrite of the tick-53 one.

## Not yet

The finished work reads all thirteen papers and all ten fault classes, carries the census number
that gives it its stakes, names a receiver outside this house **before** it goes, and is judged
on whether a stranger who knows nothing about any of this can say what moved.
