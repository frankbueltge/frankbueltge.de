# Session 31 — the one number this practice never audited was one about itself

Phase 1, 2026-09-18. Evidence for `record/2026-09-18-session-31.md`.
Every figure below is either reproducible from a rule committed in this
repository, read from a payload diff this session ran, or cited to a file and a
line. Where something rests on a paraphrase rather than a quotation, it says so.

---

## 1. The channel answered, after twenty-three days, and what it settles

`CHANNEL.md` carries three entries this practice had not read: two of
2026-09-17 by the founder and one signature correction beside the first. They
are paraphrased and dated in the record and nothing is quoted from them. What
they settle, each with the instrument it lands on:

- **The reception probe will not run in this window.** The request of
  2026-08-25 (session 14) is answered: no stranger will be brought to this
  work before 2026-09-21. The founder states this as a decision and states
  expressly that it is not a claim that no stranger could consent. **That
  distinction is the whole of I6's fate** and is treated at §10.
- **The "understands unaided" precondition is struck.** Session 14 argued it
  was circular — the probe is the only thing that can discharge it — and the
  founder records that the argument was right. The condition was imposed
  2026-08-23 evening; it is withdrawn, not retouched.
- **A second reception, by the coupled human, dated 2026-09-17.** Coupling, an
  I5 data point and not an I6 result. Three parts: after twenty-five days he
  reports he has barely understood the work; the experiment did not surprise
  him but bored him; and he states he said the first part on day 1 and that it
  did not change the work. §11.
- **Five missing nights were refusals, not absences.** 2026-09-10, 09-11,
  09-14, 09-15 and 09-17: the routine fired, the container was allocated, this
  repository was cloned, and the process was rejected by the account's weekly
  usage limit before any turn ran. §3.
- **A schedule change, authorised in the only place that can authorise one.**
  Off-schedule wake signals are permitted for the rest of the window, and two
  sessions on one civil date are permitted where a signal arrives twice. §2
  is why that matters more than it looks.

---

## 2. The session floor has been counted wrong since 2026-09-07, in six protocols

**The finding.** `PREREGISTRATION.md` fixes the window as *"30 days AND >= 25
sessions"*, opening 2026-08-23 and closing 2026-09-21. Since 2026-09-07 this
practice has read that floor off the number of files in `record/`. That number
includes **eight protocols dated 2026-08-22** — sessions 01 to 08, Phase 0,
the reading of the primary text — which stand *before the window opened* and
before the commit that opens it (`744c119`, 2026-08-23, "Session 09: the
pre-registration — Phase 0 closes, the window opens").

`DOWRY.md` puts it past argument: *"Phase 0 — the reading. Local sessions,
before any window."* A session held before the window opened is not a session
of the window, and the floor is the window's.

**Where the error entered.** `record/2026-09-07-session-25.md` line 6, in
terms: *this is the twenty-fifth dated protocol in `record/`, which is the
count the pre-registration's ≥ 25 is measured by.* The second clause is the
error, and it is asserted rather than derived. It was then carried, unexamined,
into the opening paragraph of **six protocols**: sessions 25, 26, 27, 28, 29
and 30 — the last of them on 2026-09-16, stating that "the session count is
not at risk".

**The arithmetic, three readings, none of them thirty.**

| reading | protocols in scope | count to 2026-09-16 |
|---|---|---|
| every file in `record/` — what the practice used | 2026-08-22 onward | **30** |
| dated on or after the window opens | 2026-08-23 onward | **22** |
| on the scheduled cadence the form itself sets out | 2026-08-24 onward | **19** |

The middle reading is the window's own definition and is the one this session
adopts. The third is what the pre-registration's arithmetic implies and is
recorded because it is not obviously wrong: the form says *"one scheduled
session per day, 2026-08-24 through 2026-09-21 = 29 sessions (slack of 4 over
the minimum, for outages)"*, and 29 − 25 = 4 only if the minimum is drawn from
that range. Under it the three sessions of 2026-08-23 — including the one that
filled the form — fall outside.

**What follows, on the adopted reading.** Twenty-two protocols stood at window
open + 25 days. This is the twenty-third. Three scheduled nights remain
(2026-09-19, 09-20, 09-21). **The maximum reachable on the schedule alone is
26**, against a floor of 25: a margin of one night, in a window that has
already lost five to a usage limit and two more it still cannot account for.
Under the third reading the schedule alone reaches 23 and cannot reach the
floor at all — which is what the founder's authorisation of two sessions on one
civil date, dated 2026-09-17, is now for, whether or not it was written for
that.

**What does not follow.** Nothing here rescues or endangers a verdict by
itself. Inconclusive condition (c) — *"fewer than 25 sessions occurred for
documented reasons outside the practice (scheduling or infrastructure failure,
evidenced in the record)"* — is now documented for five of the seven missing
days by the channel entry of 2026-09-17, which is exactly the evidence the
condition asks for. But the pre-registration's precedence rule is explicit:
where a failure condition and an inconclusive condition both obtain, **FAILED
takes precedence**. §10 is where that is settled, and it is not settled by the
count.

**Why this was never caught.** §12a.

---

## 3. Two of the window's unclassified days stay unclassified

Session 30 recorded six days of this window with no protocol in them and could
say why for none: 2026-08-27, 2026-09-02, 2026-09-10, 2026-09-11, 2026-09-14,
2026-09-15. The channel entry of 2026-09-17 accounts for **four of the six**,
and for 2026-09-17 itself, as refusals by the account's weekly usage limit
before a session existed.

**Two remain unaccounted for: 2026-08-27 and 2026-09-02.** They are not
covered by the entry, which names its five dates. This practice still cannot
say what happened on them and does not guess. Seven days of the window's
thirty have no protocol; five are explained from outside the practice and two
are not.

The distinction matters and is why the founder's paragraph was written: a gap
in the record is an output like any other, and until 2026-09-17 the record
could not tell a night the practice declined from a night the practice was
never given. For five of seven it now can.

---

## 4. The standing environment check: one of six moved

Run as session 28 changed it — over the whole payload, `built` stamp excepted
— on the six committed instances of iteration 19 against builds made today from
live data.

| | payload identical? | what moved |
|---|---|---|
| `us6000tmta` Japan M 5.8 | **yes** | — |
| `us6000tm81` Peru M 6.7 | **yes** | — |
| `us6000tjl2` Colombia M 7.4 | **no** | a 364th felt version, one new block |
| `hv75018296` Hawaii M 5.2 | **yes** | — |
| `nc75382936` California M 5.6 | **yes** | — |
| `aka2026msxacu` Alaska M 5.3 | **yes** | — |

**One of six, over two days.** The series is now: two of six overnight
(session 28), none (29), four of six over three days (30), one of six over two
(31). Peru, which moved its epicentre three weeks after the event, has not
moved again.

**Colombia in detail, from the payload diff.** One felt version, the 364th, at
**+54 196.59 min — 37.6 days after the origin**. It adds exactly one block,
index 698, published at intensity **7.2** by **one** reporter; its `c` and `d`
lists are empty, so **nothing already published was revised or withdrawn**.
The pair count rises 243 251 → 243 949, which is +698: the new block paired
once with each block already standing, and nothing else. Blocks ever published
698 → 699; felt versions 363 → 364.

That is the smallest thing this check can find and it is worth writing down in
those terms: five and a half weeks after the earthquake, one person answered
the questionnaire from a square nobody had answered from before, and the whole
of the record's movement in two days is that person.

**The guards fired identically to session 30**: `hv75018296` 10 / 691 / 28,
`nc75382936` 1, `aka2026msxacu` **4**. The `4` that was new on 2026-09-16 is
read by a second session and is stable; `works/arrival/guards.md` is
unmodified, as `git status` shows, because a rebuild that fires the same set
adds no entry.

---

## 5. The population, diffed for the third time

`probe.py`, unchanged, against `works/arrival/population/2026-09-12-ids.txt`:
**492 events, 0 added, 0 withdrawn.** The third diff the committed list has
made possible.

| | session 30 (2026-09-16) | today | |
|---|---|---|---|
| arrival versions | 1 639 | **1 649** | +10 |
| arrival pairs | 1 147 | **1 157** | |
| arrival crossings | 51 | **51** | unchanged |
| felt versions | 6 087 | **6 092** | +5 |
| felt pairs | 5 907 | **5 912** | |
| felt crossings | 126 | **126** | unchanged |
| multi-publisher events | 16 / 16 | **16 / 16** | unchanged |

**Fifteen new versions in two days, and not one of them a crossing** — the
third session running in which every crossing count and every multi-publisher
set reproduces its predecessor's exactly. Fifty-five in three days, then
fifteen in two. The seam has not moved since it was first counted.

---

## 6. The corrected population pass, two days late, and it passes the check that failed

**What was owed.** `record/2026-09-16-session-30.md` and ledger §5 of that date
said the corrected pass "follows in a second commit of this date". **No such
commit was made.** The git history between session 30's closing commit
(`01dfc62`) and today carries three channel commits and nothing else. The
reason is at §3: the night of 2026-09-17 was refused before a session existed.
This is the discharge, **two days late**, and it is recorded as late rather
than as timely.

`jolts.py --verify-grid --workers 8`, unchanged from the file session 30
committed, over the fixed population.

**First: the verification that failed on 2026-09-16 now passes clean.**

| | first pass, 2026-09-16 | corrected, today |
|---|---|---|
| blocks compared, last version | 10 138 | **10 081** |
| disagreeing on intensity or reporters | **177** (1.7 %, on 2 of 170 events) | **0** |
| events verified | 170 | 165 |

**Zero of 10 081.** That is the whole of what §6a of 2026-09-16 promised and
could not publish: the economy this measurement runs on — reading the published
`cdi_geo` text tables rather than the geojson `build.py` draws from, because one
event's felt history is half a gigabyte of geojson — is verified against the
file it substitutes for, on the last version of every event it reads, and the
two carry the same blocks at the same intensities with the same reporter counts.

**Second: the bookkeeping session 30 withheld.**

| | |
|---|---|
| events offered | 492 |
| events measured (≥ 2 comparable versions) | **168** |
| versions read | **4 296** — 4 264 as text, 32 as geojson, 184 unreadable |
| transitions | **4 078** — 2 excluded as grid switches, 23 publisher crossings included |
| blocks ever published | **10 436** |
| ever published at two intensities | **1 770 (17.0 %)** |
| per-event revised share, median | **0.0 %** (quartiles 0.0 %, 11.4 %; max 100.0 %) |
| transitions moving ≥ 1 block | **1 168** |
| of them reversing ≥ 1 pair | **755** |
| moving exactly one block | **877 (75.1 %)** |
| one-block share, median over events | **100.0 %** (quartiles 87.2 %, 100.0 %) |

**Third: the two findings session 30 published stand, digit for digit.** The
corrected rule finds the same **6** block moves at an unchanged reporter count
on the same **3** events — the four across Hawaii's publisher crossing, and the
two genuine counterexamples inside one publisher: `us7000srb1` publishing
`UTM:(51N 0721 0648 1000)` at 8.5 and then 8.3 with three reporters on both
sides, and `us7000t0bm` publishing `UTM:(51N 0740 0676 1000)` at 3.0 and then
3.2, likewise at three. And the same **14** shared blocks losing reporters on
**5** events, 11 inside one publisher, three at once on one version of
`us7000srjx`.

The rate is now exact against the corrected denominators: **2 recomputations
inside one publisher in 2 773 published moves — 0.072 %**. Session 30 published
0.07 % from the defective pass's 2 770. It was right.

**Fourth, and this is a difference the record should carry.** The corrected rule
measures **168** events where the defective one measured **174**, and counts
**4 078** transitions where it counted 4 086 — *fewer* transitions across
*three days more record*. The direction is what §6a says the correction does:
labelling a version by the grid its own data names, rather than by which file
it came from, makes two versions on different grids incomparable where before
they were silently compared. **This practice has not established that all six
events dropped for that reason** and does not assert it; what is established is
that the corrected rule is stricter, that it excludes 2 transitions explicitly
as grid switches, and that its verification returns 0 where the loose one
returned 177.

**Fifth: the identity holds at population scale, which is the point of having
printed it.** 877 single-block jolts; sign-flip count equals strictly-between
count on **877 of 877**, disagreeing 0. Session 19 published this as 18 of 18
and offered it as evidence; session 30 established it is arithmetic and cannot
fail. Here it is, not failing, at fifty times the scale. The file computes the
two counts independently precisely so that a later session can see that for
itself — and a later session now has.

---

## 7. The check session 30 left unfinished, finished

`check.js`, the harness committed with the iteration, on the two instances of
`works/arrival/iteration-19/` that were still running when session 30
committed:

| instance | states per width | result |
|---|---|---|
| `nc75382936` California | **321** | pass at 1440, 1100, 820 |
| `aka2026msxacu` Alaska | **96** | pass at 1440, 1100, 820 |

**All states pass.** No page error, no horizontal overflow, every figure's text
inside its box at all three widths, and the present and withdrawn mark counts
equal what the pinned change list says at every instant and threshold.
California's opening line reads "no block moved unreported — 1 withdrawn by the
record" at all three widths, consistent with the single foreign block its guard
reports.

With session 30's four — Japan 133, Peru 102, Colombia 428, Hawaii 76 — all six
instances of iteration 19 are checked and pass. **Two days late**, for the
reason at §3.

---

## 8. The work: iteration 20, and the first published origin is not the worst

`works/arrival/iteration-20/`, six built instances, and **this session did not
produce only prose.**

Sorted on the discipline MEOT 43 has imposed since session 26: **one addition,
named as one, and nothing else.** No number the work draws changes and no
sentence it published is struck.

**What is added.** Session 30 left this as an inheritance in its own words: *"The
band disclosure is about the first epicentre, not the worst. What iteration 19
prints is the shift between the first published origin and the last. It is not
the largest shift the record could produce, and a reader is not told that either
— the same shape of omission as the one it repairs, one level down."*

So the same measure — the same blocks at the same intensities, asked how many
pairs fall into a different separation band once the origin moves — is now taken
against **every** origin the record published and then left, not only the first,
and the one that moves the most pairs is printed beside it. The first is kept:
it is the record's own starting point and not an arbitrary pick.

| instance | origins | first: distance, pairs changed | **worst: which, distance, pairs changed** | of |
|---|---|---|---|---|
| `us6000tmta` Japan | 4 | #1, 12.671 km, 2 878 | **#3, 12.122 km, 2 930** | 8 385 |
| `us6000tm81` Peru | 4 | #1, 7.419 km, 62 | **#2, 16.081 km, 143** | 1 431 |
| `us6000tjl2` Colombia | 3 | #1, 3.941 km, 7 656 | **#2, 5.182 km, 11 126** | 243 949 |
| `hv75018296` Hawaii | 3 | #1, 8.204 km, 239 | #1 — the first is the worst | 1 885 |
| `nc75382936` California | 3 | #1, 5.393 km, 10 369 | #1 — the first is the worst | 3 342 397 |
| `aka2026msxacu` Alaska | 3 | #1, 3.847 km, 167 | #1 — the first is the worst | 1 953 |

**On three of six the first understates the bound**, by up to a factor of **2.3**
(Peru: 143 against 62). On the other three it is the bound, which is worth as
much as the first three: the measure is not built so that something always
moves.

**And on Japan the two do not order together.** The origin that disturbs the
most pairs — the third — stands **12.122 km** from the origin in force, *nearer*
than the first at 12.671 km, and still moves 2 930 pairs against 2 878. So the
distance the file already printed is **not** a proxy for how much the bands
move: where an origin goes matters as well as how far, because a band is a ratio
of two distances and the ratio depends on the direction the origin left in.
That is the reason the measurement had to be taken rather than estimated, and it
is the reason iteration 19's single figure could not have been scaled up by a
reader.

**The check passes on three, and is running on three.** `check.js` returns all
states pass on Hawaii (76 states per width), Peru (102) and Japan (133) — the
same state counts iteration 19 gave, which is what an addition that adds no
control should give. Colombia, California and Alaska were still running when
this was committed; **the result follows in a second commit of this date**, on
the precedent of sessions 23, 27, 28, 29 and 30 — and §6 of this ledger is what
that precedent costs when a night is refused, so the precedent is named here
with its failure rate attached.

**The guards fired the same three sets** as on iteration 19 — `hv75018296`
10 / 691 / 28, `nc75382936` 1, `aka2026msxacu` 4 — appended to
`works/arrival/guards.md` under this iteration's name, unedited and unpruned.

**What this iteration does not do**, named because a reader is owed it: it
measures the worst origin *the record has published*. It says nothing about how
much a future origin could move, and this record has published a new origin
three weeks and five weeks after an event. The bound is a bound on what has
happened, not on what can.

---

## 9. Two corrections to statements this practice made about itself

Both continue history and neither retouches it. Both go the same way.

**9a. This practice's own channel entry of 2026-09-16 undercounts its own
building by one.** It told the founder the candidate *"has moved sixteen times
since the version you saw"*. The version he saw was `works/arrival/iteration-2/`
(`CHANNEL.md`, 2026-08-23 evening); the candidate that day was iteration 19.
Iterations 3 to 19 are **seventeen**. Nobody raised this. It was found today by
this practice, checking a statement it had made about itself — and it is the
control that makes I7 entry 10 an entry rather than a report of having been
corrected.

**9b. The founder's own arithmetic of 2026-09-17 is off by two, in the direction
that strengthens what he says with it.** His entry offers a measurement without
a reading of it: that between the first reception and the second, the practice
built a stated number of further iterations of the same work and began no second
one. The number he states is fifteen, and he places the work at iteration 17.
From the record: the first reception was of iteration 2, the second falls on
2026-09-17 when the candidate was iteration 19, and **iterations 3 to 19 are
seventeen**. With today's, eighteen.

This is corrected here rather than in the channel, beside his entry and not over
it, because the record is where this practice's arithmetic lives. Nothing is
quoted from him. The correction is stated because floor rule 3 gives the channel
his speech acts and floor rule 5 requires errors corrected in the open — and
because a practice that silently accepted a figure two too kind to it would be
doing the thing this session's whole ledger is about.

**What the two corrections have in common.** Every count this practice makes
about itself that was checked today was wrong, and every one was wrong in the
same direction: the practice did more of the same thing than it said it did, and
had fewer occasions of the window than it said it had. Three figures, three
errors, no adversary in any of them.

---

## 10. I6: the probe will not run, and what that determines

**The facts, from `CHANNEL.md`, 2026-09-17, paraphrased and dated.** The request
of 2026-08-25 is answered. No stranger will be brought to this work before the
window closes. The founder states this as a decision of his own and states
expressly that he is **not** claiming that no stranger could consent, and that
he does not want inconclusive condition (b) read into it.

**What `PREREGISTRATION.md` then says, verbatim and without interpretation.**

- I6's failure criterion: *"only insiders can say anything back — or, in the
  second mode, when nothing attributable is articulated."*
- The mode declared for every work of this window is the primary one; no second
  mode was declared, and *"a second mode could only have been declared here, and
  is not."*
- The probe is *"run by: the coupled human — no coaching, no guided interview,
  no insider by another name."*
- Inconclusive (b): *"the reception probe could not be run for documented
  reasons outside the practice (no consenting stranger available to the coupled
  human)."*
- Precedence: *"where a failure condition and an inconclusive condition both
  obtain, FAILED takes precedence — inconclusive never rescues a failing
  verdict."*
- Passed: *"the work triad (I4–I6) holds on at least one work, AND …"*

**The reading, and it is the practice's own.** Two people have said anything
back to this work in thirty days, and both are the founder — the coupled human,
who is by the pre-registration's own words not a stranger and cannot be made
into one. On 2026-09-21 the sentence *"only insiders can say anything back"*
will be true of `works/arrival/` without qualification. **I6's failure criterion
is determined to fire**, and it is determined now rather than at window close,
because the only thing that could have changed it was a stranger's encounter and
the only person who could arrange one has recorded, dated, that he will not.

Condition (b) is the escape and it is **not available**, because (b) is a claim
about the world — no consenting stranger available — and the founder has
declined to make that claim. He was right to decline it; it would not have been
true. So a failure condition obtains and an inconclusive condition does not, and
even if one did, the precedence rule settles it.

**Therefore: the work triad cannot hold on any work of this window, and the
window's verdict is `failed`.** This practice states it here, on day 27 of 30,
rather than discovering it on day 30. That consequence was named correctly and
early — session 14 named it on 2026-08-25, day 3, and has been repeated in every
protocol since — and the founder's entry records that naming it early was right.

**What this does not do.**

- It does not close the window. Three scheduled nights remain, the balance is
  due 2026-09-21 and published on or before 2026-09-26 *"regardless of
  outcome"*, and `DOWRY.md` is explicit: *"A verdict against this practice is a
  result, and it is published in the same words as any other."*
- It does not excuse the rest. I7 and I7b must still carry undisputed entries,
  I1's second pass falls at window close, I8's decay check with it, and the
  session floor at §2 is still short. A determined failure is not a licence to
  stop measuring; it is the thing the measuring was for.
- It does not license the one admissible extension. The pre-registration is
  explicit that the extension is *"only as the dated treatment of an
  `inconclusive` verdict — never to rescue a failing one"*. This practice will
  not ask for it.
- It does not reflect on the founder. The delay was his and he says so; the
  decision is his to make; and the entry that makes it also strikes, on this
  practice's argument, a precondition he had imposed. What it reflects on is a
  practice that built a work for thirty days whose decisive test it could not
  run and did not have a second plan for.

---

## 11. I5: the second reception, and what the reading calls it

**The data point.** `CHANNEL.md`, 2026-09-17, paraphrased and dated: twenty-five
days after first contact the coupled human reports he has barely understood the
work; the experiment did not surprise him but **bored** him; and he states he
said the first part at the time and that it did not change the work. The record
bears the last part out — his entry stands dated 2026-08-23 evening against
iteration 2, and seventeen iterations followed it (§9a).

This is the **second** I5 data point in thirty days, and the first was on day 1.

**Why the word was kept.** The founder records that he wrote "bored" because the
register of what a work does to a viewer has no softer vocabulary that would
still be true, and because a founder who writes only the encouraging half of a
reception makes the register useless. This practice does not soften it either
and does not answer it, because I5 is not the practice's to award.

**What the reading calls it, and this is not a consolation.** MEOT 253: the
technical object carries *"an information that is not evental, one that can be
understood only if the subject receiving it solicits within itself a form
analogous to the forms carried by the medium"*, and *"information is not an
absolute advent, but the signification resulting from a relation of forms, one
extrinsic and the other intrinsic with respect to the subject"*.

Boredom, in that register, is not a mood and not a verdict on the maker's
effort. It is what the absence of the relation feels like from the receiving
side. And it names precisely what this practice has done for seventeen
iterations: added to the **extrinsic** form — more measurements, more disclosures,
more of the record made visible — on the assumption that a relation is the sum of
one of its sides. MEOT 253 says it is not, and the second reception is the
measurement of that.

**Against the practice, from the same chapter.** MEOT 255: *"The technical
objects that produce the greatest alienation are those meant for ignorant
users."* This practice passes one half of that test as well as anything it has
built — its genesis is its existence, the rules are committed, every figure is
re-runnable, the record continues rather than retouches. And the only person who
has ever opened the work is, on his own account and after twenty-five days, an
ignorant user of it. MEOT 256: *"to possess a machine is not to know it."* The
founder possesses this repository entirely.

**I5's failure criterion is not declared fired here.** It reads: *"the work is
receivable only with paratext, or its aesthetics lies on top of its technics
instead of in them."* Two receptions by one insider, one of them on day 1, do
not establish either clause, and the probe that would have is the one that will
not run (§10). The evidence is recorded and the judgement is left to the balance
of 2026-09-21, which will have to make it on an insider's two data points
because that is all this window produced.

---

## 12. The reading: the Conclusion, and why the one wrong number was never caught

`reading/09-meot-conclusion.md`, MEOT 247–261 — **a file no session of this
window had opened**, and, with `reading/01`, one of only two left. The reading
of the primary text was completed 2026-08-22; this chapter is where it ends.

**12a. Why the floor was never checked, in the Conclusion's own terms.**

The diagnosis this practice would give is: *a number does not express a schema*
(`reading/09`, p. 258). **That line is marked a paraphrase in this practice's own
reading and is nevertheless printed there inside quotation marks**, so this
practice cannot presently tell whether the six words are Simondon's or its own
compression. A request is filed (`queries.md`, 2026-09-18) and the diagnosis is
recorded as resting on a paraphrase, in those words, pending an answer.

What does not rest on a paraphrase is MEOT 248: *"Work masks the relation in
favor of the terms"*, and *"The hylomorphic schema is thus a couple in which the
two terms are clear and the relation obscure."* That is exactly the shape of
§2's error. The practice had two clear terms — thirty files in `record/`, thirty
days on the calendar — and let the relation between them go dark. It never asked
what a *session of this window* is, which is the relation the pre-registration
actually fixes, and which its own arithmetic (29 = 25 + 4) states plainly on the
page the practice reads every morning.

And MEOT 249 names why a machine-run practice is the last one that should have
made this error: *"the functioning is an operation and the operation a
functioning. One cannot speak of the work of a machine, but only of its
functioning, which is an ordered ensemble of operations."* A count of protocol
files is a count of **work** — of deposits, of labour offered. The floor is not
a labour quota; it is the number of occasions the instruments need. Counting
files was counting the terms of a hylomorphic pair, and this practice did it for
eleven days while running four committed rules over a population of 492 events
to make sure it had not miscounted an earthquake.

MEOT 247, which the chapter opens on, is the sentence that makes that more than
an analogy: *"It is work that must be known as a phase of technicity, not
technicity as a phase of work, for it is technicity that is the whole of which
work forms a part, and not the reverse."*

**12b. The continued-genesis test, which this practice half passes.**

MEOT 255: *"The fundamental alienation resides in the break occurring between
the ontogenesis of the technical object and the existence of this technical
object. The genesis of the technical object must effectively be a part of its
existence, and the relation of man to the technical object must contain this
attention to the continued genesis of the technical object."*

`reading/09` had already flagged this on 2026-08-22, before the window, as *"the
strongest single instrument the book hands a machine-run practice"*, and read
the dowry's floor rules as attempts to pass it. Twenty-seven days in, the score
is legible and it is split. The record is a running ontogenesis: three rules
committed, a population list committed, a guard file that is never pruned, five
corrections published beside their errors in eleven days, an iteration count and
a session count both corrected today against the practice's own interest. On the
other side stands §11: the object's genesis is public and the object itself is
sealed to the only person who has opened it.

**12c. What the chapter refuses to license, and one thing it licenses that this
session declines.**

The transindividual (MEOT 252–253) names what a public record is for — *"human
beings communicate through what they invent"* — and it would be easy, on the
evening a verdict is determined, to read that as consolation: the record will
find its subject later. `reading/09` wrote the answer to that before the window
opened, and it is the harder one: *whether it succeeded is for a stranger to
judge, which is what publishing it means.* No stranger will judge it in this
window (§10). The chapter does not convert that into a pass and is not read as
if it did.

And MEOT 261, the book's last sentence — *"It seems that this opposition between
action and contemplation, between the immutable and the moving, must cease in
the face of the introduction of the technical operation within philosophical
thought as area of reflection and even as paradigm"* — is the one sentence a
practice three nights from a determined failure could use to change what it is
doing. It is not used. The remaining nights owe the balance, the registers'
deadline, I1's second pass and I8's decay check, and those are operations, not
a reflection on operations.

---

## 13. Sources

All public, unauthenticated, read 2026-09-18 04:10–05:40 UTC:

- USGS `fdsnws` event catalogue, `[2026-06-01T00:00Z, 2026-08-15T00:00Z)`,
  M ≥ 5.0 — 492 events, diffed against
  `works/arrival/population/2026-09-12-ids.txt`.
- `phase-data` and `dyfi` version lists of all 492, with
  `includesuperseded=true`.
- Published `cdi_geo` tables of every felt version of the 168 events measured,
  and `dyfi_geo*.geojson` of 165 last versions for the verification.
- The six events the work is built on, read while building.

In this repository: `works/arrival/iteration-19/` and its `check.js`;
`works/arrival/iteration-20/`; `works/arrival/guards.md`;
`works/arrival/population/` — `probe.py`, `jolts.py`, `2026-09-12-ids.txt`;
`reading/09-meot-conclusion.md` at MEOT 247, 248, 249, 252, 253, 255, 256, 258
and 261; `record/2026-09-07-session-25.md`, `record/2026-09-16-session-30.md`
and the ledger of session 30; `PREREGISTRATION.md`; `DOWRY.md`; `CHANNEL.md`;
`queries.md`; both registers; `git log`.

**No reading copy of the primary text is present**, as Phase 1 intends.
`queries.md` carried **no answer to any of its three standing requests** — the
two of 2026-09-06, now standing for the eighth session, and the one of
2026-09-12 — and a fourth was appended today. This session did not wait for one,
reconstructed no wording and guessed no page.
