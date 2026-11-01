# The checked briefing — decision record (2026-11-01, IN FORCE)

*Frank's decision of 2026-11-01, wording private. Amends `2026-10-25-the-briefing.md`; everything else
of it stands.*

## Why

The briefing is the house's account of what presses on the world. The practices propose from it,
the fallback question comes from it, and two public works took their facts from it. One session wrote it
and merged it alone. On 2026-11-01 every claim of the briefing after cycle 011 was read against its
linked page: of 69 claims 42 held, and 27 were wrong, out of date, overstated or not on the page. Among
them the state of the Strait of Hormuz as of early September, stated as current, and a "38 reporting
countries" that one matter's whole title rested on. Ducking repeated them aloud for some hours.

## The decision

1. **Original sources.** A figure comes from the body that made it wherever that body publishes it. A
   report on it is used only where the original cannot be reached, and says so. Every figure carries
   the date it is true of. Rules: research-ecology `briefings/README.md`.
2. **A second session.** The first writes a draft to `briefings/drafts/`, which nobody reads. A second
   routine ("Ecology: Lagebild prüfen") reads every claim against its source, corrects or drops what
   fails, writes the file to `briefings/` with the count of what it found, and only then links it in
   `cycle.json`. A session that finds no briefing linked does not propose, so nothing unchecked reaches
   a practice.
3. **The clock.** The two routines run twice a day, late morning and late afternoon, so that a convening
   opened after breakfast loses no night. Until now it lost one.
4. **One count.** `npm run briefing:attention` counts a briefing's matters by Third Reading's rule, over the
   thirty days to the briefing, and reads the result by a fixed rule: converged is loud, ten signals is
   quiet, below that absent. The briefing copies the table. A number now means the same in a briefing, on
   Third Reading and on Ducking.
5. **A data file.** Beside `after-cycle-NNN.md` stands `after-cycle-NNN.json`, contract `briefing/1`
   (`src/lib/briefing/briefing.ts`): the same matters with their terms, a fader's label, the readings in
   spoken form, Third Reading's estimates, and the record of the check. `.github/workflows/briefing-round.yml`
   turns it into a round of Third Reading, a round of Ducking and new seeds on the watchlist, and records
   the desk's voices on the runner.

## What a machine cannot do

`briefingProblems` refuses a file with no record of a check, no primary source, or a digit a voice would
have to guess at. It cannot tell that a figure is true. The second session can be wrong too, and it reads
what the first one chose to include; a matter nobody listed stays unlisted.

## Limits

Third Reading now moves to a new round with every briefing, as its design always said, so a round may
gather few readings. Its floor stands: below thirty readings it words no comparison. The readings of a
new round are written by a model and checked by a model, and no person reads them first. Frank decided
that on 2026-10-28 for the practices' studies; it holds here for the same reason.
