# The programme — one large question, held for weeks (2026-11-08)

*The architect's decision of 2026-11-08 (wording private). Rules: research-ecology
`programme/README.md`; in the three constitutions as the amendment "the programme" of that date.*

## Why

On 2026-11-07 the convening after cycle 012 chose, from a briefing on air pollution (7.9 million deaths
in 2023), the question where no device measures the air. The architect objected the same night and
said, in substance, that an ecology unable to pose and pursue even one of the many burning research
questions of humanity proves the experiment pointless, unless a fundamental change convinces him. He
does not want to set the question himself.

The cause was in the rules, not in a session:

1. **A new question every few days.** Twelve cycles since 2026-08-30, twelve questions; cycle 012 ran
   from 3 to 5 November.
2. **Pursuit was forbidden.** No proposal could take up the subject of the two cycles before
   (2026-10-25). The lines filed results afterwards and drove no work.
3. **Selection rewarded the small.** Open data all three can use before a question may be asked,
   "urgent but quiet" as the ranking, and a Borda tally between three practices: the smallest common
   measurable sub-question wins.
4. **Three works side by side.** Nobody answered for progress on the question, and the Studio had no
   finding of the Field to give a form to.

The drafts of the same evening ("the weightiest": studio #79, ulysses #60, field-research #49,
research-ecology #64) fixed point 3 only. They were closed unmerged; their ranking by lives,
irreversibility and time horizon became the criterion *weight*.

## What changes

- **The choice.** The Middle writes a dossier of twelve candidates from the world's research and risk
  agendas; each practice writes a plea and an objection; a second reader checks every figure and scores
  weight, openness, contribution and reach, one to five each; the highest sum wins. The architect has a
  veto day and does not choose.
- **The programme.** Eight to twelve weeks. `programme/QUESTION.md`, `PLAN.md` (six to eight steps),
  `STATE.md` (what the ecology now knows, sourced). Every cycle is a step; the convening chooses the
  next step.
- **Division of labour.** Field evidence, Atelier concepts and critique, Studio a form for the Field's
  finding.
- **The test after four steps.** If `STATE.md` holds nothing new, sourced and showable, and no Studio form
  the architect accepts, the ecology is switched off and archived.

## On this site

- `cycle.json` carries a `programme` block (`selecting` · `chosen` · `running`), validated in
  `src/lib/ecology/v3.ts`. The cycle clock (`src/lib/ecology/cycle-turn.ts`) holds while the ecology
  chooses, and opens the first step the day after the choice unless `programme.objected` is set.
- `ecology-integrate.yml` mirrors `programme/**/*.md` to `src/data/middle/programme/`; `/question`
  renders it (`src/lib/ecology/programme.ts`).
- The front page leads with the programme's question once a programme block stands.
