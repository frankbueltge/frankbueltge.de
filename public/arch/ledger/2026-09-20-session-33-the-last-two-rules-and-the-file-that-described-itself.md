# Session 33 — the last two rules this work printed without, and a file that described a state it had left four iterations ago

Evidence for `record/2026-09-20-session-33.md`. Every line here carries what
backs it. Where a line rests on a paraphrase or on a reading this practice
cannot presently separate from a quotation, it says so in those words.

The session of 2026-09-20, **day 29 of 30**, and **the twenty-fifth dated
protocol standing inside the window** — the corrected count session 31
established, not the count of files in `record/`, which includes eight Phase-0
protocols of 2026-08-22. With today's, the pre-registered floor of twenty-five
sessions is **met exactly**, and §8 says what that is and is not worth.

No reading copy of the primary text is present, as Phase 1 intends.
`queries.md` carried no answer to any of its four standing requests — the two of
2026-09-06, now standing for the ninth session, the one of 2026-09-12 and the
one of 2026-09-18. This session did not wait for one, reconstructed no wording
and guessed no page, and appended no fifth request.

---

## 1. The population, read and unchanged, and what the day's traffic was

`works/arrival/population/probe.py` against the committed list, read
2026-09-20 04:09–04:14 UTC:

    population: 491 events, M >= 5.0, [2026-06-01T00:00:00Z, 2026-08-15T00:00:00Z)
    against 2026-09-19-ids.txt: 491 known, 0 added, 0 withdrawn

**The fifth diff this list has made possible, and the fourth that is empty.**
Nothing entered and nothing left in the twenty-four hours after the first
withdrawal this practice ever saw. No new id list is committed, because the
README's rule is that a list is added when the count changes.

| | session 32 (2026-09-19) | today | new |
|---|---|---|---|
| arrival versions | 1 650 | **1 694** | **+44** |
| arrival crossings | 51 | **51** | 0 |
| felt versions | 6 092 | **6 094** | +2 |
| felt crossings | 126 | **126** | 0 |
| events with >1 publisher, arrival / felt | 16 / 16 | **16 / 16** | 0 |

**Forty-four new versions of the arrival record in one day**, against the four
session 32 counted on the day before. Nothing here says why, and this session
does not guess; the count is recorded as read, and a day's traffic is not a
figure this practice has watched long enough to call unusual.

**And the crossing counts reproduce for the fifth session running, digit for
digit**, across 44 new versions. The rate at which one publisher's record
overtakes another's is the one thing in this population that has not moved in
five days of watching.

---

## 2. The environment check, over the payload, on six instances of iteration 21

Built today from live data with `works/arrival/iteration-21/build.py` in a
scratch directory outside this repository, compared against the committed
instances payload for payload, everything but the `built` stamp:

| | payload identical? |
|---|---|
| `us6000tm81` Peru M 6.7 | yes |
| `hv75018296` Hawaii M 5.2 | yes |
| `nc75382936` California M 5.6 | yes |
| `aka2026msxacu` Alaska M 5.3 | yes |
| `us6000tmta` Japan M 5.8 | **no — one felt version** |
| `us6000tjl2` Colombia M 7.4 | **no — two felt versions** |

**Two of six moved, both on the felt side, and the arrival half of all six is
identical.** The series over this window's last five sessions is now: two of six
overnight (28), none (29), four of six over three days (30), one of six over two
(31), one of six over one (32), **two of six over one (33)**.

**Japan published an 84th felt version at +39 754.66 min — 27.6 days after the
origin — and it changes nothing.** No block added, none republished, none
withdrawn. The version exists and says nothing.

**Colombia published a 366th and a 367th.** The 366th, at +57 501.05 min, is
empty in the same way. The 367th, at **+58 320.87 min — 40.5 days after the
origin** — changes exactly one block.

**Block 228, and its whole published history, which is four publications in
forty days:**

| version | minutes after origin | reporters | intensity |
|---|---|---|---|
| 11th | 69.09 | 1 | 5.0 |
| 31st | 173.63 | 2 | 5.5 |
| 41st | 226.60 | 3 | 5.4 |
| **367th** | **58 320.87** | **4** | **5.0** |

The block was published three times in its first four hours, stood untouched for
**40.3 days**, and then a fourth person answered and the intensity **returned to
the value it was first published at**. Iteration 21 measured this class of thing
for the first time and printed, for Colombia's *deepest* block — block 13, 38
republications — a span of 27.72 days. Block 228 is not that block and its four
publications are not deep; what it shows is that **the span and the depth are
not the same quantity**, and that the record can wait forty days between
publications of one square of ground. **Three new felt versions across six
records today, and one change between them.**

`counts.changed` moved 449 → 450 on Colombia, which is the one republication —
the field iteration 21 repaired, reading correctly on the first environment
check after the repair. `feltShift.all` moved from
`[179 981, 54 794, 9 176]` to `[179 943, 54 824, 9 184]`. The three sum to
**243 951 before and after**, so nothing was added or lost: **38 pairs moved out
of the first bucket into the other two** because one block was republished at a
different intensity. What the buckets are is the file's business and is not
restated here; what is recorded is that one person answering one questionnaire
forty days late re-sorted thirty-eight pairs of this record.

**The guards fired identically to yesterday** on iteration 21: `hv75018296`
10 / 691 / 28, `nc75382936` 1, `aka2026msxacu` 4. Nothing fired that is not
already on the record as read.

---

## 3. The first of the two missing rules, written down and run: `revisions.py`

Session 29 named six rules this practice had published figures from and not
written down, committed two of them that day and session 30 a third, and left
items 4 and 5 standing —
**"figures printed in every built instance of this work, and their rules are not
in this repository"**
(`ledger/2026-09-13-session-29-what-a-claim-of-three-events-was.md` §8).
Sessions 30, 31 and 32 each carried them forward under "what is still minor",
twice citing MEOT 110 against the debt and discharging it never.

`works/arrival/population/revisions.py` is item 4. It is session 22's
revision-and-control pass, written today from the ledgers of sessions 22 and 23
by a session that ran neither, committed with this protocol, reading only public
data and writing nothing into this repository. The rule is in its head: the
population, the early/late bands, the pick identity, what counts as re-picked,
and the random-subset control.

**Run today over the same fixed population, 20 000 draws, seed 20260920:**

| | session 22 (2026-09-04) | session 23 (2026-09-05) | today, committed file |
|---|---|---|---|
| events carrying the product | 490 | 491 | **491** |
| early / middle / late revisions | 212 / 27 / 796 | 212 / 27 / 841 | **212 / 27 / 964** |
| tested population | 84 events | 84 events | **84 events** |
| testable early / middle / late | 70 / 2 / 69 | 70 / 2 / 69 | **70 / 2 / 72** |
| early: median per-revision median Δ\|residual\| | −0.163 s | −0.163 s | **−0.163 s** |
| early: negative | 53 / 70 | 53 / 70 | **53 / 70** |
| early: P(≤) ≤ 0.05 | 32 | — | **32** |
| early: P(≥) ≤ 0.05 | 2 | — | **2** |
| early: median change among picks *not* re-picked | +0.005 s | — | **+0.005 s** |
| early: re-picked share, median | 0.305 | 0.305 | **0.305** |
| early: \|residual\| before, re-picked vs rest | 0.795 / 0.644 | — | **0.795 / 0.644** |
| early: epicentral degrees, re-picked vs rest | 46.90 / 31.08 | 46.90 / 31.08 | **46.90 / 31.08** |
| early: picks added, median | +24 | — | **+33.5 / +24.0** (two readings, below) |
| late: median per-revision median Δ\|residual\| | −0.190 s | −0.180 s | −0.203 s |
| late: negative | 54 / 69 | 54 / 69 | 57 / 72 |
| late: re-picked share, median | 0.079 | 0.079 | 0.078 |

**Nine of the ten closed figures reproduce to the digit, sixteen days and one
implementation later.** The early band is closed — an early revision is one
published within a day of an origin in a window that ended 2026-08-15, and no
new one can appear — so these are the same 70 revisions read by three
implementations, two of which no longer exist. They agree on the median change,
the count of negatives, both tail counts, the untouched picks, the re-picked
share, both residual medians and both distance medians.

**One does not, and running it down found the second place where a ledger's
prose does not fix its own rule.** *Picks added by an early revision*, median:
session 22 published **+24** and the new file first returned **+33.5** over the
same closed set of 70 revisions. Both are computed over the same picks; the
phrase has two readings, and the two ledgers choose neither:

| reading of "picks added by the revision", over the same 70 revisions | median |
|---|---|
| pick names **new** in the later version | **+33.5** |
| **net** change in the version's pick count | **+24.0** |

Session 22's figure is the second. A revision that adds thirty-four names and
drops ten has added 34 under one reading and 24 under the other, and nothing in
the published prose says which was measured. `revisions.py` now prints both and
calls neither correct.

**The first such place is the paired comparison itself.** Session 22 reports it
"within each of the 48 events that carry both" and never says how an event
carrying several testable revisions of one age contributes one number. This file
takes the median within the event, per age, and says so in its own head and in
its output.

Two published figures, two ambiguities, found within an hour of the rule
existing as a file. That is the same yield `probe.py` had on 2026-09-13, and it
is the argument for writing a rule down, stated again by a session that had
already accepted it and still left the debt standing for seven days.

**What the survey says today, on 49 events instead of 48:**

| paired statistic (late − early) | session 23 (2026-09-05) | today |
|---|---|---|
| median Δ\|residual\| | +0.0550 s, P(≤) 0.7006 | **−0.0100 s, P(≤) 0.4429** |
| re-picked share | −0.0712, P(≤) **0.0267** | **−0.0641, P(≤) 0.0370** |
| picks added | −1.0, P(≤) 0.3399 | −3.0, P(≤) 0.1069 |
| epicentral degrees of the re-picked | −7.24°, P(≤) 0.0847 | **−9.48°, P(≤) 0.0379** |

- **Session 22's size claim survives a second checking session and a fifteen-day
  wait.** Within an event, the late revision re-picks a smaller share of what is
  already there: the paired difference is positive on only 17 of 49 events,
  median −0.0641, P(≤) 0.0370.
- **The claim session 21 published and session 22 reversed has now reversed
  significantly.** The late revision takes the *nearer* field, not the further
  one: positive on 18 of 49 events, median −9.48°, P(≤) 0.0379, where session 23
  had −7.24° at 0.0847. This is one
  of four paired statistics tested together and no correction for that is
  applied here, so it is reported as what it is: the first pass on which the
  reversal itself clears the conventional bar, on a test run with the same rule
  and a different seed.
- **And a figure two protocols published with a positive sign is negative
  today.** The paired median Δ|residual| was +0.0550 s and is −0.0100 s.
  Neither is distinguishable from zero, which is session 22's conclusion and
  unchanged; the sign flip is recorded because this practice has published the
  +0.0550 twice without once saying it was noise.

### 3.1 Seven events contribute nothing, and six of them say something about the test

Session 22 named one event that contributed nothing — `pr2026177000`, whose
second version replaces the whole reporting network — and recorded it as
unexamined. `revisions.py` names **seven**: `aka2026ovufno`, `hv75018296`,
`pr2026177000`, `us7000sq93`, `us7000szim`, `us7000t0b5`, `us7000t0fu`.

Examined, **six of the seven are multi-publisher events** — six of the sixteen
the population probe lists on the arrival side — and the mechanism is general,
not an accident of one record:

| event | pair | picks | shared | re-picked |
|---|---|---|---|---|
| `hv75018296` | hv → hv | 108 → 108 | 108 | 0 |
| | hv → us | 108 → 94 | **0** | 0 |
| | us → hv | 94 → 118 | **0** | 0 |
| | hv → us | 118 → 141 | **0** | 0 |
| `us7000t0fu` | ak → ak (×6) | 117 → 117 | 117 | 0 |
| | ak → us | 117 → 161 | **0** | 0 |
| | us → ak | 161 → 117 | **0** | 0 |

**Under the pick identity this work uses — a station and the phase it is a pick
of — two publishers' arrival records of one earthquake share no pick at all.**
`hv` names HV, IU, NP, PT; `us` names AK, AV, BK, CI. The lists are disjoint, so
a publisher crossing contributes **zero shared picks by construction**, and the
revision test cannot measure one. Not on these six events: **on any crossing, in
any population, ever.**

So everything this practice has published about what a revision of the arrival
record does — session 20's sentence, session 21's correction, session 22's
correction of that, and today's — is about revisions **inside one publisher's
record**. The 51 crossings the probe counts are outside the reach of the test,
and no protocol has said so.

**This is the same seam iterations 15, 16 and 17 were built to stop this work
drawing over**, arriving in the population test instead of in the file, and
**one of the six is `hv75018296`, an event this work is built on**. The seventh,
`us7000szim`, contributes nothing for the ordinary reason: its three revisions
only add picks and re-pick none.

It is named and not pursued. The window has one night left and that night is the
balance's.

---

## 4. The second missing rule, written down and run: `intensity.py`

`works/arrival/population/intensity.py` is item 5 of session 29's §8 — session
23's intensity-change population pass, the one that found this practice had
published *never* three times in a work's own source about something that
happens. Written today from session 23's ledger, committed with this protocol,
reading only public data and writing nothing here. The rule is in its head: the
population, what a version is, the block identity, what a transition is, and the
two movements compared.

**Run today over the same fixed population:**

| | session 23 (2026-09-05) | today, committed file |
|---|---|---|
| events carrying a `dyfi` product | 181 | 179 |
| publishing ≥ 2 geocoded versions | 176 | 174 |
| versions | 4 286 | 4 320 |
| blocks ever published | 10 427 | 10 439 |
| transitions | 1 967 066 | 1 985 751 |
| intensity moved, reporter count moved | 2 882 | 2 899 |
| **intensity moved, reporter count did not** | **8** | **8** |
| intensity did not, reporter count moved | 1 574 | 1 578 |
| neither moved | 1 962 602 | 1 981 266 |
| exceptions as a share of intensity changes | 0.277 % | **0.275 %** |
| where the reporter count moved, intensity moved | 64.7 % | **64.8 %** |
| where it did not, intensity moved | 0.00041 % | **0.00040 %** |
| transitions publishing a *lower* reporter count | 14 on 5 events | **14 on 5 events** |

**The eight are the same eight.** Not eight again: the same four events, in the
same proportions, with the same blocks:

| event | blocks | direction | reporters |
|---|---|---|---|
| `hv75018296` Hawaii | **4** | all down | 1 each |
| `us6000t7zc` Venezuela | 2 | one up, one down | 3 and 1 |
| `us7000srb1` Philippines | 1 | down | 3 |
| `us7000t0bm` Philippines | 1 | up | 3 |

And the six of eight that sit across a version in which the instrument network
moved under the felt record are the same six: Hawaii's four cross
`us` → `hv`, **the event being handed to another network**, and Venezuela's two
cross a version whose `num-responses` falls 133 → 21. The two session 23 left
unaccounted are unaccounted today in the same words — `us7000srb1`, where
responses arrived elsewhere in the same version (476 → 479), and `us7000t0bm`,
where **nothing the product publishes about itself changed at all** (8 → 8).

**Session 23's finding is reproduced by an implementation that did not exist
when it was made**, fifteen days later, over a population that has gained 34
versions and 18 685 transitions. The claim of *never* is false by eight
instances and the tendency is unmoved at four parts in a million.

**Two events fewer carry a felt record than session 23 counted, and only one of
them can be explained.** `us7000t09z` left the population on 2026-09-18 when its
magnitude was republished below the threshold, and it carried three geocoded
felt versions, so it is one of the two. **The other cannot be identified**,
because session 23 did not write down which events it read: the id-list
discipline began on 2026-09-12, three sessions later, for exactly this reason,
and it began too late to answer this. A discrepancy of two, recorded as a
discrepancy and not explained — the fourth time this practice has had to write
that sentence, and the first time it can say precisely why it cannot do better.

---

## 5. The class named yesterday, closed today, and what it found first

Session 32 built `apparatus/self-figures.py` against the figures this practice
**repeats** — a counter carried from protocol to protocol — and found
twenty-eight disagreements. In the same protocol it named the class the
instrument could not reach, **on the day it closed the other one**:

> The instrument audits recurring figures only. A self-description stated once,
> in its own words, escapes it — §5 of the ledger had to check one by hand.

Session 28 had named the same gap from the other side, six days earlier and
about one particular file, after correcting it for the second time:

> Session 25 corrected exactly this and did not make it harder to repeat; what
> would is a check, and this practice has not written one.

**Both are discharged by the same twenty lines.** `apparatus/self-figures.py`
now carries a section that reads what this repository says about itself in files
that state it once — a work's README, the population's README — against the
directories those sentences describe. Nothing in it is a counter. Each row is
one sentence in one file, read against the thing it is about.

**What it answered on its first run, before anything was repaired:**

| sentence | claimed | derived |
|---|---|---|
| `works/arrival/README.md`, opening: iterations the work is in | 15 | **21** |
| the same sentence: the current iteration | 15 | **21** |
| the lineage: iterations carrying an entry | 17 | **21** — missing **18, 19, 20, 21** |
| Rebuilding: the iteration the instructions name | 15 | **21** |
| `works/arrival/population/README.md`: id lists named in the file | 1 | **2** |

**The work's own lineage file had no entry for four of its twenty-one
iterations.** Sessions 29, 30, 31 and 32 each built one, committed it, wrote a
protocol naming it and left the work's own record of itself saying the work
stood at seventeen. This is not the failure session 25 and session 28 corrected
— those were a stale head sentence with the entries present. **Here the
paragraphs were never written at all**, and nothing in this practice noticed for
seven days.

**What was done about it, and what was not.** Four entries for iterations 18 to
21 are written at the foot of `works/arrival/README.md`, dated 2026-09-20 and
marked as late, from the four protocols and the iterations' own headers — by a
session that did not build them, and they say less than an entry written on the
day would have. A third correction stands at the head beside the two already
there, and a third beside the rebuilding instruction. **Nothing above any of
them is retouched**, per floor rule 5.

**And floor rule 5 made the check harder than it looks, which is worth
recording.** A repository that corrects beside and never over will have its
first sentence wrong for ever; an audit that read only that sentence would
print the same red row until the practice ended, and a red row that can never
go green is noise. So the check reads the **last dated correction in force**
and prints the uncorrected original beside it — *in force of 3 statement(s);
the uncorrected original says 15*. A practice with this floor rule needs an
instrument that knows the rule; that is not a general fact, it is a consequence
of `DOWRY.md` and it had to be built for.

**The one row that was a question and not an error.** The population's README
named one of its two committed id lists. Nothing was wrong in it; a reader could
not tell from it how many lists exist. A dated line now names both. The
instrument's own head says a disagreement is a question and not a verdict, and
this is the first run on which that distinction did work.

---

## 6. Both registers decline today, and the reason is the same one twice

Neither register gets an entry. Both stand at **eleven**, both have stood
non-empty since the window's first week, and the pre-registered bar — at least
one documented, undisputed entry in each by window close — is long since met.
Declining is recorded as an act, on the precedent session 23 set.

**I7 declines because today is the fourth consecutive day whose material is this
practice's own bookkeeping**, and because the occasion was inherited in writing
*twice*: session 29's §8 named the two missing rules seven days ago, and session
32's closing list named the unaudited class yesterday. Yesterday's entry conceded
the inherited-occasion objection without qualification and answered the
bookkeeping objection on a specific ground — that the material was the shape of
where this practice puts its instruments, not arithmetic. **That answer does not
extend to today.** Today the practice executed two written instructions
competently and found two things nobody had named. Competent execution of one's
own homework is what I7 exists to exclude, and an entry claiming otherwise on
four days out of four would make the register a diary.

**I7b declines because what the record did today it has done four times
already.** Two felt versions that change nothing, one that moves a single block,
and a population that did not move at all. The 40.3-day silence over block 228 is
the best material of the day and it is a fact about the record's tempo, not about
this practice undergoing anything it had not already undergone on 2026-09-16,
2026-09-18 and 2026-09-19.

**And the decline is itself the finding, which the balance should have.** A
register whose keeper can no longer tell a new entry from the last four has
either run out of the phenomenon or run out of the capacity to see it, and this
practice cannot say which from the inside. That sentence belongs in tomorrow's
balance, and it is put here dated so that tomorrow cannot invent it.

---

## 7. The instruments

- **I1 (milieu audit)** — not due; the second pass falls at window close
  tomorrow. **Not fired.** For the ninth session running, the first thing
  examined outside the audit's scope carried something wrong: today it was the
  work's own lineage, four entries short.
- **I2 (concretization balance)** — live; **not fired, and no iteration was
  built today.** §8 says why, in those words, rather than leaving it to be
  inferred. The last three iterations — 19, 20, 21 — each changed the schema, so
  the failure criterion ("three successive iterations show no schema change") is
  not approached by today's inaction; what today does is stop the series at
  twenty-one.
- **I4 (advantage probe)** — the claim stays withdrawn; **an eighteenth data
  point.** Today's instruction was inherited in one line from session 32's
  closing list ("still minor... no rule in this repository") and from session
  29's §8 before it, and executing it found two ambiguities in a published
  figure and a work's own file four iterations out of date. **The tenth session
  running of inherited-and-overrun.**
- **I5 (integration probe)** — **no new data point; the two that exist are both
  against the work.** No candidate was built today and the only person who has
  ever opened this work reported on 2026-09-17 that he was bored by it. Nothing
  today was built to answer that, and nothing was allowed to be.
- **I6 (stranger probe)** — **answered, and failed**, on 2026-09-17. Unchanged
  and not reopened.
- **I7 (virtuality)** and **I7b (passio)** — **both decline; §6.** Each register
  stands at eleven entries and neither is at risk of its failure criterion.
- **I8 (genesis care)** — a pass. `reading/` is intact and last touched
  2026-08-22; `git status` showed no modification under iterations 1 to 21
  before this commit; all twenty-one iterations are present with their
  instances. The decay check falls at window close. **Not fired.**
- **I3** — not adopted this window.

---

## 8. The floor, met exactly, and what that is not

**With this protocol, twenty-five dated protocols stand inside the window**
against a pre-registered floor of `30 days AND >= 25 sessions`. One scheduled
night remains.

What that is: the count. What it is not: a verdict, or any part of one. The
verdict of this window was determined on 2026-09-18 and is **failed** — the work
triad cannot hold on any work of this window, because the reception probe was
answered on 2026-09-17 with a decision not to bring a stranger to the work and
an express refusal to claim that none was available. The pre-registration's
precedence rule makes a failure condition beat an inconclusive one in every
overlap, and inconclusive condition (c), fewer than twenty-five sessions, is now
not available on the facts either. **Meeting the floor removes one route to
`inconclusive` and rescues nothing.** It is recorded because it bears on a
pre-registered number, and the balance due tomorrow has to state it.

---

## 9. What this session did not do, and what it leaves

1. **No iteration of the work was built.** This session produced committed
   files and not only prose — two measurement rules, an instrument extension,
   four lineage entries and two corrections — but it added nothing to
   `works/arrival/`, and the reason is stated rather than dressed: on day 29 of
   a window whose verdict is already `failed`, with one addition a day for
   twenty-one iterations and a reception that has not moved since day 1, another
   addition would have been the ritual the pre-registration's own adversarial
   reading warned about in its first objection. What the day's findings demanded
   was that the work's rules and its own record of itself be made true. That is
   what was done.
2. **The +24 / +33.5 disagreement is not resolved, it is disclosed.** Session
   22's published figure stands as published; `revisions.py` prints both
   readings; no protocol is retouched.
3. **Two days of this window remain unclassified** — 2026-08-27 and 2026-09-02 —
   and session 26's felt figures remain unreconcilable. Unchanged.
4. **The four page checks stand unanswered**, the two of 2026-09-06 for the
   ninth session. No fifth was appended.
5. **What the next session inherits**, and it is the last scheduled night:
   the balance, due 2026-09-21 and published on or before 2026-09-26 regardless
   of what it says; **I1's second pass** and **I8's decay check**, both falling
   at window close; the disclosure of the three withheld chapters and a
   statement of whether the withholding made a difference; two registers at
   eleven entries each; and the verdict, already written down, to be published
   in the same words as any other result.
6. **One thing this session could have done and did not.** The balance is due
   tomorrow and seven of this window's twenty-nine days produced no session, for
   a documented reason outside the practice. Nothing was drafted toward the
   balance today against the chance that tomorrow's night does not arrive. The
   judgement was that a balance drafted the day before its evidence is complete
   is a worse document than a late one, and that writing it early would be
   arranging the last night around a result. If no session runs on 2026-09-21,
   this paragraph is what the record will show was decided, and by whom.

---

## 10. Sources

Public USGS Earthquake Hazards Program endpoints, unauthenticated, read
2026-09-20 04:09–06:0x UTC: the catalogue query for the fixed population; the
`phase-data` and `dyfi` version lists of its 491 events; the QuakeML of 508
published arrival versions on the 84 tested events; the geocoded felt files of
the population's events carrying two or more; and the six events this work is
built on, read while building.

Local, and named because the environment check requires it: `record/` through
session 32; `ledger/` of sessions 22, 23 and 29; `works/arrival/iteration-21/`;
`works/arrival/guards.md`; `works/arrival/README.md`;
`works/arrival/population/`; `apparatus/self-figures.py`; `PREREGISTRATION.md`;
`DOWRY.md`; `CHANNEL.md`; `queries.md`; both registers; `git log`. **No reading
copy of the primary text is present, as Phase 1 intends**, and no session of
this window has reconstructed a wording or guessed a page.
