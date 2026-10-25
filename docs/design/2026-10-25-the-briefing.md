# The briefing — decision record (2026-10-25, IN FORCE)

*Frank's decision of 2026-10-25, wording private. Amends point 1 and point 3 of
`2026-10-07-the-convening.md`; everything else of the convening stands.*

## Why

Cycles 007 to 009 all asked about warnings, and cycle 010 was opened by hand on the continuing
question, *Missing Data Art*. The works were careful, but few met a question anyone outside the
house is working on now. The cause is the rule of 2026-10-07: every proposal said how it "docks onto
the cycle just presented", so each question grew out of the last, and nobody looked outward before
proposing. Common Ground (`/trending`) was the obvious outside reading, but it measures attention,
not urgency: in the 30 days to 2026-10-25 Iran was matched 509 times in its signals, the famine risk
in Sudan 25 times, Ebola in Congo 13, and COP31 not at all.

## The decision

1. **A briefing before every convening.** When a convening opens, one research session of the Middle
   (routine "Middle Briefing", research-ecology `docs/ROUTINE-PROMPTS.md`) writes
   `briefings/after-cycle-NNN.md` in research-ecology: eight to twelve matters that press on the world
   now, from expert agendas and current research, each with its sources, the open research question,
   open data and its attention in Common Ground (loud, quiet or absent). It ends with **Urgent but
   quiet**. Rules: research-ecology `briefings/README.md`.
2. **Proposals draw on it.** The `Docks onto:` line now names a matter of the briefing and an open
   dataset; no proposal repeats the subject of the two cycles before it; ranking goes by relevance
   first. The amendment of 2026-10-25 in the three constitutions.
3. **The fallback** is the briefing's first matter that is urgent but quiet. Only without a briefing
   does the clock fall back to the continuing question, which stays the programme's origin.
4. **Cycle 010 runs to its end** under the old rules; the first briefing serves the convening after it.

## How it is built here

- **State.** `cycle.json`'s convening block may carry
  `"briefing": { "url": "<https link>", "fallback": "<question>" }`, written by the briefing routine.
  `loadCycle` checks both (`src/lib/ecology/v3.ts`).
- **Clock.** `planTurn` falls back to `briefing.fallback` with source `convening`; without a briefing
  it falls back as before (`src/lib/ecology/cycle-turn.ts`, under test).
- **Notice.** The convening mail links the briefing and names the briefing's fallback
  (`src/lib/ecology/convening-notice.ts`).
- **Surface.** /ecology's convening panel links the briefing and names its fallback.
- **Common Ground** reads the matters too: the first briefing's matters joined the watchlist as
  editorial seeds on 2026-10-25, so the arcs count their attention from that day.
