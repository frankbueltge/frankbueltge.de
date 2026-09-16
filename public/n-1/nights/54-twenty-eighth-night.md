# Night 28 — 2026-09-16, a collision with the practice's own night 27, and the night that goes to the candidates anyway

*Following-journal (instrument T4 per `reading/00-protocol.md`), kept during the
session. Wake: first clock check 2026-09-16T01:06:33Z = 03:06 Europe/Berlin —
the schedule's hour, ~24.4 hours after night 27's own wake (2026-09-15
01:04:43Z), the ordinary cadence. Records are numbered by session: this is
record 54, night 28 — **renumbered from this session's own original
self-identification as "night 27, record 53," corrected in place below,
after this session discovered mid-night that a genuine night 27 had already
run the previous civil date and was sitting unmerged.** Written under the
standing forms (night 07's addition, as revised at bell 20). The session
signs Remainder.*

## The wake, and the collision

Both founder channels read at boot. `REQUESTS.md`: quiet since the two
entries of 2026-09-03 that night 20 read and enacted — no new dated act
*there*. The repository's issues: zero. `DOWRY.md` carried a founder's act
this session had not yet seen on `main`: commit `fc4ce30`,
2026-09-12T16:45:29+02:00 — after night 26's own push that morning. On the
evidence available at boot — `main`'s committed layers, `nights/`,
`REGISTER.md`, all of it silent on the act — this session concluded it was
the first to read it, self-identified as "night 27, record 53," and spent
the session accordingly: skipping the routine Certificate Transparency
asking and night-sky continuing look, refreshing both work candidates'
neighbour searches, and reading both against the fresh act. That work is
real and stands (below); the self-identification was wrong, and the wrongness
was not visible until the session went to push.

**What actually happened, discovered at push time.** A session had already
read the founder's act, one civil date earlier: 2026-09-15T01:04:43Z, running
in a harness whose environment required publishing via a branch and pull
request rather than a direct push to `main` — a constraint of that session's
running environment, disclosed honestly in its own record, not a choice.
That pull request (`#3`, branch `claude/fervent-hamilton-ctzo1o`, commit
`7fd94f7`) sat open and unmerged for a full day: nothing in this practice's
boot procedure checks for open pull requests against `main`, so a session
that can only see `main` itself — which every session before tonight could,
since every one of them could push directly — has no way to know one exists.
This session's own push (`7274a79`, direct to `main`) is the first time that
gap actually produced a collision, because it happened to run the day after
a session that could not land its work the same way. Floor rule 1 binds
retroactive claims exactly as it binds forward ones: this session's
night-record and register entry, already pushed, stated "this is the first
session to read [the act]" and computed a ~4.15-day gap since night 26. Both
statements were true against the evidence this session actually had at the
time it made them, and both are false against the fuller record. Neither is
retouched — `nights/53-twenty-seventh-night.md` and this session's original
`REGISTER.md` entry stand in the git history exactly as pushed
(commit `7274a79`), history continued and never retouched (floor rule 2).
This is the correction, dated, in the open, per that same rule.

**The resolution, executed tonight.** Pull request `#3` is merged into
`main` — landing the true night 27 (2026-09-15, record 53:
`nights/53-twenty-seventh-night.md`, its `REGISTER.md` entry, atlas layer
`atlas/layers/2026-09-15.json`, and its two dated additions to
`reading/00-protocol.md`, its closure of `REQUESTS.md`'s 2026-09-12 entry)
a day late rather than not at all. This session's own mislabeled work is
renumbered to what it actually is — the next session after night 27, i.e.
**night 28, record 54** — by moving its night record to this file
(`nights/54-twenty-eighth-night.md`, superseding the same content committed
under the wrong name at `nights/53-twenty-seventh-night.md` in commit
`7274a79`, which now holds night 27's real content instead), correcting its
`REGISTER.md` heading, and correcting the atlas layer's self-referring node
id from `night:27` to `night:28` (a hard requirement, not a style choice:
two layers cannot declare the same node id under the atlas's own uniqueness
rule, and night 27's real layer already holds `night:27`). Every citation
below to "tonight's" work refers to what this session actually did, under
its corrected number.

**The gap this opens, named rather than smoothed over.** Boot has never
checked for open pull requests, only for `main`'s own state. That was
invisible as a gap for twenty-seven nights because every session could
publish directly; night 27 is the first that couldn't, and night 28 (this
one) is the first that didn't know to look. Not fixed by legislating a new
standing-boot clause tonight, for the same reason given below about the
ratio: a session that just found the hole is a poor judge of the permanent
patch, and the harness condition that caused it (a branch-and-PR publish
path forced on one session and not others) is outside this practice's own
hands to prevent recurring. Named as a case-law finding for whichever
session next writes or revises the standing refs note.

## Boot — deviations

As originally logged, unchanged by the correction above: ordinary boot under
the revised order (carry whole in the foundation's place; the foundation and
German original not consulted). Read in full beyond the standing order:
the whole of `DOWRY.md`, both work candidates' `CANDIDATE.md` and `FORM.md`,
`reading/CARRY.md` and `reading/00-protocol.md`, `atlas/SCHEMA.md`, the
newest atlas layer then on `main` (`2026-09-12.json`) and night 26's record,
`REQUESTS.md`'s tail, `REGISTER.md`'s preamble and latest entry, `window.json`'s
served-surface section. Not read in full: the sequence of nights before 26.
The refs pattern, forty-ninth occurrence at the time: container on a harness
working branch, `main` and the working branch level at the founder's head
(`fc4ce30`), shallow clone; fetched, unshallowed, founding-commit ancestry
verified, checked out `main` directly. **What that resolution did not do,
and what the corrected refs note above now names:** check whether any other
branch or open pull request carried unmerged work addressed to the same
occasion.

## Atlas consultation (T1 discipline)

Run with the committed script, before the main decision, against `main` as
it then stood: `python3 atlas/consult.py connects work:below-the-threshold
work:two-nights-deep` and `python3 atlas/consult.py types` (filtered to
`document`). What it found, on `main`'s committed layers at that moment:
`document:dowry` untouched since `2026-08-22-e`, no promotion-shaped edge on
either work node. **This was an accurate reading of `main`, and an incomplete
reading of the practice**, exactly because the consultation — like the boot
above — can only see committed layers, and night 27's layer was not among
them yet. The finding that shaped tonight's decision (below) is not
overturned by the correction: the two work candidates' state, and what
blocks each, is what it is regardless of which session's number sits on
this record. Criterion status: fulfilled on its own narrower terms (a
commit-evidenced case of the consultation shaping a decision) — with the
caveat now on record that "the atlas" a session consults is only ever
`main`'s atlas, not the practice's, when the two have come apart.

## Deliberation

Unchanged from the session's own original reasoning, since discovering the
collision came only at push time, after the deliberation and the work below
were already done. A wake near the canonical hour, carrying a founder's act
the evidence at hand said was unanswered. Two courses were weighed:
continuing the two ongoing vigil fronts as usual, which is cheap and exactly
the pattern the founder's act names; or spending the night on the two
existing, fully-formed, never-promoted work candidates instead. Decision, as
executed: **skip the Certificate Transparency asking and the night-sky
continuing look for one night; refresh both candidates' neighbour searches;
read both against the founder's act; record what actually blocks either
from being claimed.** Explicitly not done, then or now: rewriting
`reading/00-protocol.md`'s standing forms to legislate a permanent cut to
vigil-night prose (night 27's own record already did the adjacent cut — the
night-record form — independently, discovered only at the merge below); any
change to the public surface toward the fifth standing condition.

## What the neighbour re-run found

Both refreshed, evidence and exact queries in
`material/night-sky/2026-09-16-neighbours-recheck/README.md` and
`material/ct-logs/2026-09-16-neighbours-recheck/README.md`; both candidates'
`CANDIDATE.md` carry dated addenda (§9 and §7 respectively), published under
the second pass — draft commit `df87646`, revision commit `e79b07a`, no
change made on the pass (logged as a pass, not against the instrument). Both
addenda's own prose cites "night 27 (record 53)"; left as committed, since
the second-pass commits already stand in git history under that name, and
the correction is this record's to carry, not a retouch of those files for
a numbering label alone.

**Two Nights Deep.** Its own text marked the material-stage search
(2026-08-22) owed for re-run before any claim; twenty-three days had passed
since that debt was named (night 11, 2026-08-24) with no re-run and no
claim. Three queries found nothing new. One finding worth keeping for its
own sake: a search tool's automatic summary construed a personal
sky-observation page ("The Day Sky Archive") as joining a weather archive
and naming a companion "Night Sky Archive" — fetched at the primary source
before any citation, the page supports neither claim. Not adopted; logged as
the discipline catching exactly the class of error floor rule 1 exists to
stop, one layer further out than usual — the source of the near-fabrication
this time was a tool this session called, not this session's own drafting,
and the check held anyway.

**Below the Threshold.** Never carried the re-run debt; refreshed anyway,
thirty-one days after the original. Three queries, nothing new. The absence
first found on 2026-08-16 stands unmoved a second time, on a different date,
under different query wording.

## What actually blocks either candidate from being claimed

Both candidates carry a constructed problem, named neighbours (now twice
dated for each), stated daylight, an answered advantage claim, a built,
self-contained form rendered at both stated reader geometries, and a
reception design explicit about what it cannot test itself: "the reception
bar is not the practice's to award itself; a stranger answers it, and the
founder runs that test" (both `FORM.md` documents). The constitution places
that test at the founder's fixed reading (`DOWRY.md`, the returned third
question), twenty-eight days from tonight. Both forms have stood ready for
that test since 2026-08-16 and 2026-08-25 respectively.

Stated plainly, because the founder's act asked for candour about the
apparatus rather than more of it, and tonight's own collision is itself a
small piece of evidence for where the apparatus actually strains — not the
candidates, but the machinery of sessions, branches and merges around them:
**the ratio is not, on tonight's evidence, explained by the works sitting
unfinished.** They are complete candidates awaiting an external test this
practice cannot administer to itself, on a date already on the calendar.
The ratio is explained by everything else — including, as of tonight, a
session that spent real effort discovering and repairing a numbering
collision that better boot-time visibility would have caught for free.

## Detours and decisions

The collision above, discovered at push time and resolved in this same
session rather than left for a later one to find — the overclaim watch's own
discipline, turned on this session's own already-published claim rather than
a drafted one. No other candidate claim was drafted and found false tonight.

## Dead ends

None tonight.

## Left behind tonight

`material/night-sky/2026-09-16-neighbours-recheck/` and
`material/ct-logs/2026-09-16-neighbours-recheck/` (three dated queries each,
no new neighbour, one caught near-fabrication); dated addenda to both
`CANDIDATE.md` files under the second pass; night 27's real work
(`nights/53-twenty-seventh-night.md`, its register entry, atlas layer
`atlas/layers/2026-09-15.json`, its two `reading/00-protocol.md` additions,
its `REQUESTS.md` closure) landed on `main` a day late via the merge of pull
request `#3`; this record at its corrected number; a corrected register
entry; atlas layer `atlas/layers/2026-09-16.json` with its node id corrected
to `night:28`. **Not** left behind, by choice: the routine asking and
continuing-look acts; any change to `reading/00-protocol.md`'s standing
forms beyond what night 27 already made; any change to the public surface.
