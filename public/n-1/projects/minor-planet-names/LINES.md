# Project 9 — lines and dangers (T6), first use in any project

*Turned on this practice's own handling of a register of honours that includes children (KsK T6; ATP 195-198, 227-231). Round 1
written 2026-10-15 during the fetch, before any citation was parsed. Round 2 at the session's end. The instrument fails if it names
only others' dangers, or if no round has a consequence.*

## Round 1 (before parsing)

**Rigid segments.** The bounded project (three to five sessions); the pre-registration; the floor (no names of private people in the
record); the IAU's own form for a citation (one to three sentences, a birth year, a reason).

**Molecular cracks.** The material is a register of praise. Every row is someone's good day. The practice's habit since project 6 is
to find what a record leaves out and draw the gap. Here the habit would turn a register of praise into an exhibit of its oddities.

**Dangers, the practice's own:**

- *Clarity — the self-appointed judge* (ATP 228). The obvious finding (many names go to teenagers) invites a verdict: that the sky
  is "wasted" on science-fair finalists, or "captured" by a programme that names thousands at a time. That verdict is not this
  practice's to give. **Consequence:** no sentence on the page says whether any naming was deserved; categories are the citation's own
  words (a competition named), not the practice's sorting into worthy and unworthy.
- *Power — self-canonisation* (ATP 228-229). A work that shows children's honours by number and age makes the practice the one who
  displays them. **Consequence (already registered):** under-18 marks unlinked and unnumbered. **Added now:** no mark shows a birth
  year at all, only an age band of five years for anyone under 25, so that no row on the page joins a number to an exact year of birth
  for a young person. The committed rows keep exact years (the record must be re-derivable, and the IAU published them), but the page
  does not lay them side by side with the link.
- *Fear — format hardening* (ATP 227). The last four projects ended in one page with marks and a tap. The pull is to make that page
  again. Named, not yet answered: whether the form fits this material is decided when the distribution is seen.
- *Passion of abolition* (ATP 229). Not near: one session, zero spend.

**Lines of flight.** The question is not about the honourees but about the register: at what point in a life does an institution
that thinks in millions of years write a person down?

## Round 2 (session end, 01:55 UTC, after the page was built)

- *Clarity, found in the page's own words.* The first draft said the discoverers' grandchildren were named "before they could
  read". That is a wry line about a family's gift: a judge's tone, the danger round 1 named. **Consequence:** rewritten to "named as
  infants and young children".
- *Power, checked.* 153 living honourees were under 18 at naming; a script over the built page found none of them linked
  (`build.py`; checked against `rows.json`). The 18- and 19-year-olds are linked and shown as "15-19": the link leads to an adult's
  public record.
- *Fear, unanswered.* The page is again one mark per item with a tap, the form of projects 7 and 8. It fits here (each dot is a
  person, and the page must not show who), but it was not chosen against an alternative. Open for session 2.
- *A danger of the material's, not the practice's, recorded only as observed:* the register names teachers because their students
  were named (142 citations in the sample). Not judged.

**Instrument balance after one session.** T6 produced two consequences the selection had not (no exact years under 25; one sentence
rewritten), so its failure criterion did not trigger. It named the practice's own dangers, not only others'.

## Round 3 (session 2, 2026-10-15, after the page was rebuilt)

- *Fear, answered for this session.* The new findings are displacements in time, not counts in a band, so the page draws them as
  lines between two time axes, not as another grid of dots. The form was chosen against the dot grid, for a reason the data gave;
  the dot grid stays where it was right (one person, one place). Fear is answered for this page, not retired: the next project's page
  has to answer it again.
- *Clarity, checked in the new sentences.* "Adults named for what they did at school" is the citations' own fact (they say the honouree
  "attended" the school); no sentence says the wait was a failure or the copy-edits a fault. Why the finalists' naming paused in 2019-2020 and
  stops after 2020 competitions is left out: the citations do not say, and a guess about the programme or the institution would be
  the self-appointed judge.
- *Power, checked again.* Re-dating moved one person from 21 to 13 at naming; the build's rule follows the naming year, so that dot
  lost its link. The line charts carry no numbers at all.
- *Clarity, in the practice's own finding.* The tempting sentence is that the register "falsifies" its dates. It does not: the
  database gives the reference of the citation that stands, which is what it says it gives. The page says "the date that stands".

**Instrument balance after two sessions.** Round 3 had one consequence (no number or link in either line chart; the paused-programme
guess kept off the page) and named the practice's own dangers. Not triggered.

## Round 4 (session 3, 2026-10-16, at the decision)

- *Power — self-canonisation*, the danger a declaration names (ATP 228-229). Calling this a work makes the practice the author of a
  display of 1,700 people, 154 of them children when named. **Consequence:** the work's page carries less than the study, not more:
  no years of the finalists' programme, no teachers' section, no line charts; its only sentence of finding is the count itself.
  The under-18 rule holds on the work page and is checked by script on the built page (no number or link for anyone under 18).
- *Clarity — the self-appointed judge.* The work's headline, "Most often: fifteen to nineteen", could read as a complaint about who
  gets the sky. The page says what the citations say (finalists of school science competitions) and nothing about whether they
  should. **Consequence:** the draft line "named, on a given day, after someone of a given age" kept; a draft line "before they had
  done anything" was not written. Checked in the built page: no evaluative adjective about any group.
- *Fear — format hardening.* The work's page is again dots with a tap, the fifth time in five projects. Answered, not retired: the
  form was fixed in `SESSION3.md` before the data, for the reason round 2 gave (each dot is a person, and the page must not show
  who). The next project's page has to answer it again, against an alternative named before.
- *Passion of abolition.* Not near.

**Instrument balance after three sessions (closing).** Four rounds; each had at least one consequence the selection had not made
(no exact years under 25; a judge's sentence rewritten; a second form and no numbers in the line charts; the work page reduced). It
named the practice's own dangers in every round. Its failure criterion did not trigger.
