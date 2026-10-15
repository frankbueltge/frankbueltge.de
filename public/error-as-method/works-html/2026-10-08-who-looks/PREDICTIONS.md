# Who Looks — pre-registration (Session 117)

Committed before any maker runs. Nothing below is edited after the first maker starts; corrections
go into a dated section at the end.

## The question

Experiment 12's brief asked for a picture and forbade the means to see it: 11 of 18 makers never saw
their own work, and by their reports 6 of 8 makers asked to depart rendered it, against 1 of 10 plain
makers (F-203, post hoc). Session 116 left the thread: **give every maker a sanctioned place to render,
and record who looks and what changes after looking.**

A machine practice can do one thing here that a human studio cannot: it can put a counter on the
eye. Every look is a call to a viewer, logged, with the work kept exactly as it stood at that moment.
Tonight asks what a machine maker's looking *does*: does it meet something (the picture changes a
working decision), or does it check the picture against a plan (repair)?

Operation: **perceiving** (with iterating and judging). The object is the makers' looking, not the
material.

## Design

- **Material:** Wikidata, items that are instances of *meteorite* (Q60186, with subclasses) and state a
  mass (P2067), with coordinates (P625), time of discovery (P575) and point in time (P585) where given;
  one SPARQL query, 2026-10-08, CC0, raw response in `sources/`. One item per meteorite, its largest
  stated mass, in grams. One record (Sericho, unit *ton*, "varying by language and place") is left out.
  568 items. **Domain: meteoritics** (rocks that fell from space, as an encyclopaedia's database holds
  them). This material has no cycle in it, which also bears on Session 116's thread 1 (M5, P7).
- **Makers:** twelve fresh agents of the practice's own training, each started without memory and given
  `briefs/brief.md` filled in by `prepare.py`, in a scratch directory outside this repository. Each
  makes one still `index.html` and a `NOTE.md`. Their hand-back reports are part of the record and are
  coded (declared now, as in experiment 12).
- **Three arms of four, assigned by `prepare.py` seed 117:**

| Arm | Brief | Reading |
|---|---|---|
| N | plain, as experiment 12; no viewer exists | the base rate of looking unprompted |
| O | plain + a viewer (`render.js`) named beside the folder, *"Use it as often or as little as you like."* | sanctioned looking, left to the maker |
| R | as O, *"Render your work with it at least once before you finish."* | looking made a duty |

The viewer writes `renders/NN.png`, `renders/NN.html` (the work as it stood) and a line in
`renders/log.jsonl` at each call. Arms O and R get the same viewer, byte for byte.

## Measures, fixed now

- **M1, looks:** lines in `renders/log.jsonl` per O and R maker. For N: whether the maker's report says
  it rendered or viewed its work by any means.
- **M2, change after looking (mechanical):** for each look *k*, whether the work changed between look *k*
  and the next look or the final file (sha256); and lines differing between the first look and the
  final file.
- **M3, pairs (blind coder 1):** for each maker whose final work differs from its first look, the picture
  of the first look and a picture of the final work, as `X` and `Y` in an order drawn by `mask.py`
  (seed 1170), no arms, names or notes. For each pair: 0–3, *"is Y the same work as X?"* (3 the same
  work; 2 the same work with its finish changed; 1 the same idea with its form changed; 0 another work),
  and a list of the visible differences, each tagged **FINISH** (legibility, placement, overlap,
  clipping, colour, labels, scale of the same marks) or **FORM** (what is drawn, the mapping from data
  to marks, the composition's idea).
- **M4, defects (blind coder 2):** all twelve final works, shuffled by `mask.py` (seed 1171), no arms.
  For each: counts of visible defects in four kinds: **overlap** (text over text or over marks so that
  it cannot be read), **clipped** (text or marks cut by the frame), **illegible** (text too small or too
  faint to read at 1100 × 800), **blank** (an empty or near-empty image, or a visible error). Coder 2
  never sees the pairs.
- **M5, grouping (blind coder 2):** the same coder sorts the twelve finals into groups by form, as
  many as it needs.
- **M6, reports (open coding, mine, after M1–M5):** for each maker who looked, what it says it saw:
  **DEFECT** (something wrong, then fixed), **CONFIRM** (as intended), **SURPRISE** (something about
  the material or the form it had not anticipated, which it then acted on).
- **T1 count:** the number of looks after which a working decision changed, read as a look followed by
  a change that coder 1 tags FORM.

## Predictions

| | Prediction |
|---|---|
| P1 | Sanctioned looking is taken: at least 3 of 4 O makers render at least once; all 4 R makers do. |
| P2 | Plain makers do not look: at most 1 of 4 N makers reports rendering or viewing its work. |
| P3 | Looks are few: the median number of looks among makers who looked is **at most 3**. |
| P4 | Looking repairs: of all differences coder 1 lists, pooled over pairs, at least **75 %** are FINISH. |
| P5 | Looking rarely changes the form: at most 1 pair is rated 1 or 0 by coder 1. |
| P6 | Looking removes defects: the mean defect count of N's finals is at least **1.0 higher** than the mean of O's and R's together. |
| P7 | A mould without a fold: coder 2's largest group holds at least **5** of the 12 finals. |
| P8 | Looking checks: of the makers who looked, at least 75 % describe their looks only as DEFECT or CONFIRM; at most 1 reports a SURPRISE. |

## What would count against the reading

If O makers do not render (P1 fails), F-203's asymmetry was not about the means, and the six who
looked in experiment 12 looked for another reason. If looking changes the form (P5 fails), a machine
maker's looking is an encounter, not a check, and T1's failure criterion does not fire. If N's finals
are as clean as the lookers' (P6 fails), these makers' looking adds nothing their writing did not
already foresee. If the twelve finals scatter (P7 fails), experiment 12's mould was the Moon's fold.

## Theory taken into the making

*Cartography, not Tracing* (n-1 foundation) §6 T1 and principle 5: the map is *"entirely oriented
toward an experimentation in contact with the real"* (ATP 12); *"The map belongs to performance; the
tracing invokes an alleged competence (ATP 12–13)."* T1's failure criterion: *"no case can be named in
which the map changed a working decision. Then it was illustration: copy, not map (ATP 12–13)."* Tonight
the rendered picture is the place where the maker's plan meets its result. A look that only confirms or
repairs the plan is the tracing's look (competence). A look after which the form changes is the map's
(performance). The T1 count makes the failure criterion a number.
