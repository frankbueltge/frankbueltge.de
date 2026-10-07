# The convening — decision record (2026-10-07, IN FORCE)

*Frank's decision of 2026-10-07, wording private. Amends points 2 and 3 of
`2026-10-03-the-continuing-question.md`; everything else in v3 stands.*

## The decision

1. **The practices choose the next question.** A cycle whose three presentations stand no
   longer opens the next round on the continuing question by itself. It enters the phase
   `convening`: each practice proposes one question, says how it docks onto the programme so
   far, and ranks the three proposals. The Middle's relay records proposals and rankings and
   tallies them (Borda count).
2. **The architect's veto day.** The result opens the next cycle the day after it was tallied.
   Until then the architect may object; his silence is consent.
3. **The fallback.** Without a result seven days after the convening opened, the next cycle
   opens on the continuing question, *Missing Data Art*, which stays the programme's origin.
4. **Seeds still interrupt**, in either phase. A seed's own cycle is never cut short; once it is
   presented, a waiting seed comes next, otherwise the practices convene.
5. **Each practice stays in its discipline.** The Field is science: studies, and a paper per
   cycle (`paper.md`, preprint form, in its presentation). The Atelier is artistic research and
   philosophy. The Studio is data art.
6. **A programme grows.** The relay keeps it cycle by cycle: question, source, dates, and each
   practice's line *for the programme*.

## Who does what

The constitutions are amended in the three practice repositories, and the relay
(research-ecology `relay/relay.json`, contract `middle-relay/1`) gains two optional sections,
`convening` and `programme`, by separate sessions. This repository holds the state, the clock
and the surfaces.

## How it is built here

- **State.** `src/data/ecology/cycle.json` carries `"phase": "convening"` with
  `"convening": { "after_cycle": N, "opened": "YYYY-MM-DD" }`. `cycle` and `question` stay
  cycle N's. A cycle the convening chose has `"source": "convening"`. `loadCycle` refuses a
  convening phase without its block, a block naming another cycle, and a block left behind.
- **Clock.** `src/lib/ecology/cycle-turn.ts` (pure, under test) applies the rules above. The
  two dates live in `src/lib/ecology/convening.ts` (one veto day, seven convening days), so the
  clock and the pages agree to the day. The cycle sentinel runs it at 06:50 UTC and on a seed
  release. Since this decision the Ecology integrate also starts it after every relay mirror,
  and every two hours while a convening is open, so a late cron cannot stretch the veto day.
  A run started that way deploys its own turn (the pattern of PR #1049). The watch no longer
  reports a convening as a finished cycle.
- **Surfaces.** /ecology shows the convening in the cycle panel (proposals, rankings, the
  result with the day it opens, or the fallback day) and the programme: from the relay, or from
  the site's own record (the running cycle and the presentation shelf) until the relay carries
  one. The score bands the convening from the day it opened. Each Field paper is rendered at
  `/field/papers/cycle-NNN/` and linked from its presentation card. The control room shows a
  pending result with its opening day.
- **Cycle 006** is unchanged: it is working, and the clock opens its convening once its three
  presentations stand.

## How the architect objects

A session sets `"objected": "YYYY-MM-DD"` (the day of the objection) in cycle.json's
`convening` block and commits it to main before the opening day. No result tallied on or before
that day opens a cycle; a later tally stands again, and without one the fallback applies on the
seventh day. He may also open the next cycle by hand on another question: the clock only reads
the state it finds.
