# The continuing question — decision record (2026-10-03, IN FORCE)

*Frank's decision of 2026-10-03, wording private. Amends the cycle order of
`2026-08-30-research-ecology-v3.md` §2 (point 2); everything else in v3 stands.*

## What happened

Cycle 003 opened on 2026-09-07 on Frank's seed *Missing Data Art*. All three practices had
presented within days. Then nothing turned the record. For almost four weeks they worked on
past the budget (21, 20 and 19 sessions by the sentinel's count), writing "between cycles"
and "the cycle-003 gap" in their bulletins. The cycle sentinel reported the finished cycle
every morning. Meanwhile a second seed, *human extinction* (2026-09-19, anonymous, released
to all three), sat waiting. Under the v3 rule it would have displaced *Missing Data Art* at
the next turn, and the turn after that would have fallen back to three separate default
themes.

## The decision

1. **One continuing question.** The ecology stays on *Missing Data Art* for now.
   `cycle.json` carries it as `continuing`. Whenever no seed is live, all three work it,
   each from its own standpoint. While it is set it replaces the per-practice default
   themes, which are suspended, not deleted.
2. **Rounds turn by themselves.** The cycle shape stays as it was: 3–5 sessions, then a
   presentation, and the three appear together. When all three have presented a round, the
   next round opens on the same question without anyone turning it. No practice waits
   between rounds.
3. **Only a seed interrupts.** A seed addressed to all three that Frank releases in the
   Steuerzentrale interrupts at once, mid-round if need be. The next cycle opens on the
   seed, runs 3–5 sessions to its presentations, and then the ecology returns to the
   continuing question. A seed addressed to one practice stays an offer to that practice
   and interrupts nothing. A seed's cycle is never cut short by the next seed; a second
   seed waits its turn.
4. **Cycle 004** opens on 2026-10-03 as the first round, *Missing Data Art, read through
   human extinction*. Frank combined the waiting seed with the continuing question instead
   of letting it displace it. The seed is the lens of this round and is recorded as taken.
   Later rounds carry the plain question unless Frank says otherwise.
5. **Standing arrangements.** The Field's counter-measurement remit rests while the
   continuing question runs. This is the cycle-001 finding again: a practice pulled between
   two remits serves neither. The Studio's Atlas source stands as directed on 2026-09-07.

## Why a script may now turn the cycle

The sentinel was built never to turn a cycle, because which question comes next was a
judgement. With a continuing question that judgement has been made in advance, so applying
it is mechanical. The rule is `src/lib/ecology/cycle-turn.ts` (pure, under test). The cycle
sentinel runs it before its daily watch, and also within minutes of a seed release, since a
release commits `src/data/saat/register.json`. It validates the result through the site's
own loader, commits only `cycle.json`, and dispatches the deploy. Without a continuing
question it does nothing, and the old hand-turned regime and its reminder issue apply
unchanged.

## Where it is written

- `src/data/ecology/cycle.json`: the state, with the transition note for 003 → 004.
- The three constitutions (`ulysses`, `field-research`, `studio` `PROTOCOL.md`): an
  appended amendment of 2026-10-03 that supersedes §2's default-theme sentence and §5's
  default theme, without retouching them.
- Each practice's `REQUESTS.md`: a founder note on the change.
- `/ecology`, the practice stations, the front door's cycle line, `/seed`, and the
  Steuerzentrale's release button, which says that releasing an open seed interrupts.

The term is *continuing question*, not *standing question*. The front door's hero already
uses "the standing question" for Frank's own research question, and one word should not
mean two things in this house.
