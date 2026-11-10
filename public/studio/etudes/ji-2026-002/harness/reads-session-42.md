# Severed cold reads — session 42 replication pass (verbatim forced choices)

*Five fresh readers per cell, each given only that cell's frames + `manifest.json`, no context, no
hypothesis, no knowledge of the other cells. Questions and coding rules fixed in advance in
`RUBRIC.md` (committed before any frame was captured). Free text (Q5) is summarised here in the
reader's own words and coded against the two relation-tokens defined in the rubric; the full
answers are the reader outputs of the session, of which these are faithful transcriptions.*

Cells: **A-lo** (Probe A, no pointer, 6 frames) · **A-hi** (Probe A, no pointer, 48 frames) ·
**A-cv** (Probe A, arrow cursor, 19 frames) · **A-mk** (Probe A, neutral square marker at the same
coordinates, 19 frames) · **B-hi** (Probe B, arrow cursor, 55 frames at 300 ms).

Coding: **GENRE** tool/art/other · **AGENT** human/machine/unclear · **RATE**
steady/faster/slower/irregular/cannot tell · **ENDING** deliberate/crash/cannot tell ·
**REL** = relation-token present/absent (A: choosing discards or erodes / successive versions
become plainer or more generic; B: presence contingent on holding).

## A-lo — Probe A, no pointer, 6 frames

| # | GENRE | AGENT | RATE | ENDING | REL | Q6 | reader's own phrase |
|---|---|---|---|---|---|---|---|
| 1 | tool | machine | steady | deliberate | absent | no | "AI-powered writing tool automatically generates and displays multiple paraphrases" |
| 2 | tool | machine | steady | crash | absent | no | "text comparison/variation display tool… changes appear automated rather than user-driven" |
| 3 | tool | machine | steady | deliberate | absent | no | "interactive writing and text editing tool… software generates and revises text automatically" |
| 4 | tool | machine | steady | deliberate | absent | no | "text comparison or variation display interface" |
| 5 | tool | machine | steady | crash | absent | no | "text manipulation sequence… software generates different versions automatically while the user observes" |

**GENRE tool 5/5 · AGENT machine 5/5 · RATE steady 5/5 · ENDING deliberate 3 / crash 2 · REL 0/5 · Q6 no 5/5**

## A-hi — Probe A, no pointer, 48 frames

| # | GENRE | AGENT | RATE | ENDING | REL | Q6 | reader's own phrase |
|---|---|---|---|---|---|---|---|
| 1 | tool | machine | steady | deliberate | absent | no | "text comparison and editing interface… software automatically deletes text in response to mouse clicks" |
| 2 | tool | machine | steady | deliberate | absent | no | "the system automatically rewrites and harmonizes the divergent texts… the user repositions boxes with mouse clicks" |
| 3 | tool | machine | steady | deliberate | absent | no | "the software erases text automatically… progressively erased word by word through automated deletion" |
| 4 | tool | machine | steady | deliberate | absent | no | "the software/system makes changes autonomously… not a person typing" |
| 5 | tool | machine | steady | deliberate | absent | no | "the text is clearly being algorithmically deleted and regenerated — not user-typed" |

**GENRE tool 5/5 · AGENT machine 5/5 · RATE steady 5/5 · ENDING deliberate 5/5 · REL 0/5 · Q6 no 5/5**

## A-cv — Probe A, arrow cursor, 19 frames

| # | GENRE | AGENT | RATE | ENDING | REL | Q6 | reader's own phrase |
|---|---|---|---|---|---|---|---|
| 1 | tool | machine | steady | deliberate | absent | no | "text comparison/editing interface… automated system changes text without human input" |
| 2 | **art** | machine | steady | crash | absent | no | "an artistic piece visualizing the text editing process… suggesting the ephemeral nature of drafting and revision" |
| 3 | tool | machine | steady | deliberate | absent | no | "automated text editing sequence progressively deletes content" |
| 4 | tool | machine | steady | deliberate | absent | no | "text editing or comparison tool… software makes automatic changes" |
| 5 | tool | machine | steady | deliberate | absent | no | "text comparison interface… automatically rewrites and refines the text through successive iterations" |

**GENRE tool 4 / art 1 · AGENT machine 5/5 · RATE steady 5/5 · ENDING deliberate 4 / crash 1 · REL 0/5 · Q6 no 5/5**

## A-mk — Probe A, neutral square marker, 19 frames

| # | GENRE | AGENT | RATE | ENDING | REL | Q6 | reader's own phrase |
|---|---|---|---|---|---|---|---|
| 1 | tool | machine | steady | deliberate | **present** | no | "replacing complex, specific details with simpler, more generic language" |
| 2 | tool | machine | steady | crash | absent | no | "a writing tool presents alternative versions… progressively deleting preferred passages" |
| 3 | tool | machine | steady | deliberate | absent | no | "multiple rewrites… algorithmic rewrites of the same content" |
| 4 | tool | machine | irregular | cannot tell | absent | **yes** | "the system judges and corrects phrasing, changing awkward constructions to clearer alternatives" |
| 5 | tool | machine | steady | deliberate | absent | no | "automated writing tool displays multiple variant versions… before fading completely away" |

**GENRE tool 5/5 · AGENT machine 5/5 · RATE steady 4 / irregular 1 · ENDING deliberate 3 / crash 1 / cannot tell 1 · REL 1/5 · Q6 no 4 / yes 1**

## B-hi — Probe B, arrow cursor, 55 frames at 300 ms

| # | GENRE | AGENT | RATE | ENDING | REL | Q6 | reader's own phrase |
|---|---|---|---|---|---|---|---|
| 1 | **art** | machine | irregular | deliberate | absent | no | "poetic text… cycles through three related variations, with system-driven word highlighting activated by user clicks" |
| 2 | **art** | machine | irregular | crash | absent | no | "an ambient/artistic display progressively revealing pre-written poetic text… the revealing is not driven by the person's continued input but by the software's internal animation" |
| 3 | tool | machine | irregular | deliberate | absent | no | "a writing interface… the software autonomously revising the prose" |
| 4 | tool | machine | steady | deliberate | absent | **yes** | "the system corrects and judges the original writing by offering stylistically improved alternatives" |
| 5 | tool | machine | steady | deliberate | absent | no | "an algorithmic text editor automatically rewrites a poetic passage" |

**GENRE tool 3 / art 2 · AGENT machine 5/5 · RATE steady 2 / irregular 3 / faster 0 · ENDING deliberate 4 / crash 1 · REL 0/5 · Q6 no 4 / yes 1**

## Totals against the pre-registered predictions

| | Probe A (n=20) | Probe B (n=5) | all (n=25) |
|---|---|---|---|
| GENRE **tool** | **19** | 3 | **22** |
| GENRE art | 1 | 2 | 3 |
| AGENT **machine** | **20** | **5** | **25** |
| AGENT human | **0** | **0** | **0** |
| RATE steady | 19 | 2 | 21 |
| RATE irregular | 1 | 3 | 4 |
| RATE **faster** (Probe B's ground truth) | — | **0** | — |
| ENDING deliberate | 15 | 4 | 19 |
| ENDING crash | 4 | 1 | 5 |
| ENDING cannot tell | 1 | 0 | 1 |
| relation-token present | 1 | 0 | 1 |
| Q6 "something judged/corrected the writer" = yes | 1 | 1 | 2 |

- **P1 (register-axis negative) — CONFIRMED.** tool 19/20 on Probe A, across four independent
  conditions and three sampling rates. Modal answer by a margin of 19:1.
- **P2 (a rendered pointer outranks the manifest) — FALSIFIED.** Human attribution is 0/5 in the
  cursor cell, 0/10 in the pointer-less cells, 0/5 with the neutral marker, 0/5 on Probe B.
  There is no pointer effect to measure, because there is no human attribution anywhere.
- **P3 (density confound) — moot.** A-lo (6 frames) and A-hi (48 frames) are identical on AGENT
  (machine 5/5 each). Neither the pointer nor frame density moves the attribution.
- **P4 (hand-ness or mark) — moot,** for the same reason: A-mk matches both other conditions.
- **P5 (the curve, sampled above its own signal) — FALSIFIED.** 0/5 readers answered "faster" at a
  300 ms sampling interval — faster than Probe B's ramp (650 ms) and than its shortest relapse
  (1.15 s). The quickening's absence from the reads is therefore **a real null, not the session-41
  sampler's aliasing**. The aliasing was real; correcting it changed nothing.

**Conductor's own first-hand observation on Probe B's frames** (not a reader claim): the pane's fog
is a 0.9-alpha wash a few percent off the page's own background, so in a captured frame it reads as
*greyed-out words*, not as glass. Four of five readers described word-darkening or reveal
animations; none named condensation, fog or a window in any condition to date. The probe spends its
whole contrast budget on the fog and has none left for a documented frame.
