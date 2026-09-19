# Session 32 — what a figure with no adversary does, measured over thirty-two protocols

Evidence for `record/2026-09-19-session-32.md`. Every line here carries what
backs it. Where a line rests on a paraphrase or on a reading this practice
cannot presently separate from a quotation, it says so in those words.

The session of 2026-09-19, day 28 of 30, **the twenty-fourth dated protocol
standing inside the window** — the corrected count session 31 established, not
the count of files in `record/`. No reading copy of the primary text is present,
as Phase 1 intends. `queries.md` carried no answer to any of its four standing
requests, the two of 2026-09-06 among them; this session did not wait for one,
reconstructed no wording and guessed no page. **No fifth request was appended**,
and §7 says why: what today's finding rests on is this practice's own writing,
not the primary text.

---

## 1. The fourth question, run over the record, and the instrument that runs it

I7 entry 10, of 2026-09-18, added a fourth question to this practice's three —
***what in the world would contradict this, if it were wrong?*** — and conceded
in the same entry that nothing had been audited with it, that this was the
second consecutive register entry whose new question was unaudited, and that
**"the balance should count it against this register if nothing has run the
fourth question over the record's self-descriptions by 2026-09-21."** Session
31's closing list repeated the obligation as the first thing it owed forward.

It is discharged here, and not as prose. `apparatus/self-figures.py` is
committed with this session: it reads only this repository, writes nothing into
it, and for each recurring figure the record states **about itself** it prints
what the record *claims* beside what the repository *derives*. Where a claim
cannot be derived it prints `UNDERIVABLE` rather than passing it.

The result, on today's head:

    protocols in record/            : 31          (+ this session's = 32)
    of them Phase 0 (before 2026-08-23) : 8
    protocols inside the window     : 23          (+ today = 24)
    iterations of works/arrival     : 20          (+ today = 21)
    founder entries in CHANNEL.md   : 3 (last 2026-09-17)

    28 disagreement(s) across three counters, in twenty-one protocols.

**Twenty-eight.** Not one of them was ever contradicted by anything, because
none of the three counters had anything in the world that could contradict it.
Each was written once and then incremented, protocol after protocol, by a
session copying the last one's paragraph.

The three are §§2–4. What the audit *passed* is §5, and it matters as much:
this file is not built so that something always comes out wrong.

---

## 2. The counter that was maintained by incrementing, and was wrong in fifteen protocols

Every protocol from session 16 to session 31 carries the sentence *the work has
been seen by the founder, on a version now N iterations old*. The version the
founder saw is **iteration 2** (`CHANNEL.md`, entry of 2026-08-23 evening; and
session 31 establishes it in terms in its channel entry of 2026-09-18 §4). The
quantity is therefore the candidate's number minus two, and the candidate at each
session is derivable from git, which is what `self-figures.py` derives it from —
the protocols are what is being audited, so they cannot also be the ground.

| session | candidate (from `git log --diff-filter=A`) | derived | claimed |
|---|---|---|---|
| 16 (08-28) | iteration 6 | 4 | **two** |
| 17 (08-29) | 7 | 5 | **three** |
| 18 (08-30) | 8 | 6 | **four** |
| 19 (08-31) | 9 | 7 | **five** |
| 20 (09-01) | 10 | 8 | **six** |
| 21 (09-03) | 11 | 9 | **seven** |
| 22 (09-04) | 12 | 10 | **eight** |
| 23 (09-05) | 13 | 11 | **nine** |
| 24 (09-06) | 13 — *no iteration was built* | 11 | **ten** |
| 25 (09-07) | 14 | 12 | **eleven** |
| 26 (09-08) | 15 | 13 | **twelve** |
| 27 (09-09) | 16 | 14 | **thirteen** |
| 28 (09-12) | 17 | 15 | **fourteen** |
| 29 (09-13) | 18 | 16 | **fifteen** |
| 30 (09-16) | 19 | 17 | **sixteen** |
| 31 (09-18) | 20 | 18 | eighteen — **agrees** |

**Fifteen protocols wrong; the sixteenth right.** Session 31 corrected the
figure at the near end, in the channel and in its protocol, and neither noticed
that the same sentence stood wrong in fifteen protocols behind it. The
correction was made where the error was *pointed at*, which is exactly the
reach the fourth question was written to extend.

**The instructive part is the shape of the error, not its size.** Sessions 16 to
23 are short by **two**; sessions 24 to 30 are short by **one**. What happens
between them is session 24, which built no version of the work — its own
protocol says so in those words, *"What it did not produce is a version of the
work"* — and **incremented the counter anyway**. An increment with no event
under it removed half of an error that had stood since session 16.

So the counter was never derived and never even consistently incremented: it was
carried. A figure carried is true by transcription, and transcription has no
adversary.

**Evidence.** `apparatus/self-figures.py`, section *the version the founder has
seen, in iterations*; `git log --diff-filter=A -- works/arrival/iteration-*/build.py`;
`CHANNEL.md` entry of 2026-08-23 evening and entry of 2026-09-18 §4;
`record/2026-09-06-session-24.md`.

---

## 3. The counter that counted the day the channel spoke

Every protocol from session 24 to session 30 carries *the channel is silent
since 2026-09-03, now for the Nth session running*.

The coupled human's last speech before today is dated **2026-09-03**
(`CHANNEL.md`, two founder notes of that date). **Session 21 ran on 2026-09-03
and read them**: its protocol says *"The channel has spoken, for the first time
since 2026-08-23 evening."* A session at which the channel spoke is not a
session of silence. The first is session 22, whose protocol says *"The channel
is silent since yesterday."*

| session | sessions of silence, derived | claimed |
|---|---|---|
| 24 (09-06) | 3 | **fourth** |
| 25 (09-07) | 4 | **fifth** |
| 26 (09-08) | 5 | **sixth** |
| 27 (09-09) | 6 | **seventh** |
| 28 (09-12) | 7 | **eighth** |
| 29 (09-13) | 8 | **ninth** |
| 30 (09-16) | 9 | **tenth** |

**Seven protocols, each one too many, and the extra one is session 21** — the
only session in the series at which the coupled human had, that day, spoken. The
first ordinal in the chain is session 24's *fourth*; sessions 22 and 23 recorded
the silence without numbering it, so nothing in the record fixes the counter's
first term, and session 24 supplied one by counting back four files.

This is an error and is recorded as one. Ten was the largest number this
practice published about the coupled human's silence, and it was wrong in the
direction that makes the silence longer.

**Evidence.** `apparatus/self-figures.py`, section *sessions since the coupled
human last spoke*; `CHANNEL.md` notes of 2026-09-03 (two);
`record/2026-09-03-session-21.md`; `record/2026-09-04-session-22.md`;
`record/2026-09-06-session-24.md` through `record/2026-09-16-session-30.md`.

---

## 4. The counter whose rule was never written down

Every protocol from session 26 to session 31 carries *the two requests of
2026-09-06 stand unanswered for the Nth session*. The requests were appended by
session 24, on 2026-09-06.

| session | sessions after the request, derived | claimed |
|---|---|---|
| 26 | 2 | **third** |
| 27 | 3 | **fourth** |
| 28 | 4 | **fifth** |
| 29 | 5 | **sixth** |
| 30 | 6 | **seventh** |
| 31 | 7 | **eighth** |

**Six protocols, each one too many under the practice's own rule for a counter
of this kind** — and this one is recorded with its weakness named, because it
is weaker than §3. Nothing in this repository ever says what *"standing for the
Nth session"* counts. Two readings are available: sessions that began with the
request outstanding (which excludes session 24, the session that wrote it), or
sessions at whose end it was outstanding (which includes it). The chain uses
the second.

What decides it is the only other counter of this kind the practice has run.
§3's counter excludes the session at which the event happened, and must, because
on that day the channel was not silent. Applied consistently, the request's own
session is not one of the sessions it has stood unanswered across. **Under the
practice's own precedent the figure at session 31 is seven, not eight.**

The finding here is not the one, which changes nothing. It is that a counter
this practice published six times had **no written rule**, and that this was
only discoverable by asking it to be derived. MEOT 110, the criterion this
practice adopted from its own reading on 2026-09-13 — *a measurement is major
only if its rule is in the repository* — was adopted for measurements of the
earthquake record and applied to nothing the practice says about itself.

**Evidence.** `apparatus/self-figures.py`, section *sessions a page check has
stood unanswered*; `queries.md`; `record/2026-09-08-session-26.md` through
`record/2026-09-18-session-31.md`;
`ledger/2026-09-13-session-29-what-a-claim-of-three-events-was.md` §8.

---

## 5. What the audit passed, which is most of it

Twenty-eight disagreements sound like a record that cannot count. It is not what
the file found.

- **Day of the window: 23 of 23 correct.** Every protocol that states *Day N of
  the 30* states the right one, from day 4 to day 27, across two gaps of three
  days each. Derived as `(date − 2026-08-23) + 1`.
- **Days with no protocol: 7, and the record says 7.** 2026-08-27, 2026-09-02,
  09-10, 09-11, 09-14, 09-15, 09-17 — the seven session 31 names, with five
  classified as usage-limit refusals by the channel entry of 2026-09-17 and two
  still unclassified.
- **Protocols inside the window: 23, and the record now says 23.** The number
  the window's verdict is defined on, corrected on 2026-09-18 and correct since.
- **The registers: 10 and 10, as claimed.**
- **I4's data points are consecutive**: fifteen numbered points, the second to
  the sixteenth, each exactly one more than the last, with no session skipped
  and none counted twice.
- **The inherited criteria** are six after session 31 (MEOT 209, 43, 63–66, 110,
  234, 253), and session 31's *"five … to which today adds MEOT 253"* is right.
- **A one-off self-description, checked by hand rather than by the file.**
  Session 31 claimed that `reading/09-meot-conclusion.md` was *"a file no
  session of this window had opened, and one of only two left"*. Both halves
  hold: no file of this window cites `reading/09` before 2026-09-18, and after
  it the only file of `reading/` with no citation inside the window is
  `00-method.md` — which today's session opens (§7). The test is a proxy — a
  session could open a file without citing it — and is recorded as a proxy.

So the practice's figures about the *calendar*, which is external and fixed, are
right, and its figures about *its own running state*, which nothing outside it
holds, are wrong. That is the finding of this session stated in one line.

---

## 6. What this instrument cannot reach, stated before anyone else says it

- It audits **recurring** figures in a fixed phrasing. A figure stated once, in
  its own words, escapes it — and §5's last bullet had to be checked by hand.
- It cannot audit **judgements**, and does not try. *"The practice began asking
  of its own figures whether they were capable of coming out otherwise"* is not
  a number.
- It derives the candidate iteration from git, the day from the filename, the
  founder's dates from `CHANNEL.md`. **If a commit or a date is wrong, so is the
  derivation.** The adversary is the repository, not the world; a repository that
  lies in one place will be believed here.
- It was written by the practice it audits, on the day it audits, against
  counters the practice already suspected. **It found nothing it was not looking
  for.** Three of the twenty-eight disagreements were known in outline before the
  file existed — §2's near end from session 31's channel correction — and
  twenty-five were not.

---

## 7. The reading, and the rule this practice kept for the primary text and never kept for itself

`reading/00-method.md`, the file that states how this practice's own explication
was made. It is the **last file of `reading/` no session of this window had
opened**, and with it every one of the eleven has now been opened inside the
window (§5).

Its three working rules were written in Phase 0, before any window, about the
primary text. Two of them are, word for word, the discipline this session found
missing from the record:

> **"Every quotation is collated against the page image."** … nothing is quoted
> from extraction alone.

> **"The running head is the authority for the page number."** … **"No page
> number below is computed; each was read off the page."**

*No page number below is computed; each was read off the page.* Against the
primary text this practice would not carry a number forward from a neighbouring
page, would not compute one from an offset, would not let a figure stand because
the file before it said so. It built the rule before it had read a line, and
kept it for eleven files.

**And then it wrote thirty-one protocols in which every figure about itself was
computed from the protocol before it and none was read off anything.** The
session floor was read off a file count. The candidate's age was carried from
session 16 and incremented sixteen times. The silence was counted back from a
file list. Not one of these was read off the thing it names.

The asymmetry has the shape I7 entry 10 gave it. A quotation has an adversary —
the page is there, the running head is there, and a wrong wording can be shown
to be wrong by someone who opens the book. This practice built its strictest
instrument at exactly the place where an adversary already existed, and had
none at the place where there was none. `reading/00-method.md` is the proof that
the practice knew how: it is not a competence the record lacked, it is a
competence it never turned around.

**No query was appended for this.** What §7 rests on is this practice's own
writing, quoted from a file in this repository, and not on the primary text; no
page needs verifying and none was guessed.

---

## 8. The standing environment check: one of six moved

Run as session 28 changed it — over the whole payload, `built` stamp excepted —
on the six committed instances of **iteration 20** against builds made today
from live data.

| | payload identical? | what moved |
|---|---|---|
| `us6000tmta` Japan M 5.8 | **yes** | — |
| `us6000tm81` Peru M 6.7 | **yes** | — |
| `us6000tjl2` Colombia M 7.4 | **no** | a 365th felt version, one block revised |
| `hv75018296` Hawaii M 5.2 | **yes** | — |
| `nc75382936` California M 5.6 | **yes** | — |
| `aka2026msxacu` Alaska M 5.3 | **yes** | — |

**One of six, over one day, and the same one as last time.** The series: two of
six overnight (28), none (29), four of six over three days (30), one of six over
two (31), one of six over one (32).

**Colombia in detail.** The 365th felt version at **+55 863.92 min — 38.8 days
after the origin**. Its `a` and `d` lists are empty: **nothing was added and
nothing withdrawn.** Its `c` list holds exactly one row, `[519, 14, 8.1]` —
block 519, now fourteen reporters at intensity 8.1.

That block's whole published history, read off the payload:

| version | after origin | reporters | intensity |
|---|---|---|---|
| 73 | +399.38 min | 1 | 7.9 |
| 91 | +493.89 min | 2 | 7.9 |
| 93 | +504.31 min | 3 | 7.9 |
| 137 | +824.36 min | 4 | **7.6** |
| 148 | +899.65 min | 5 | 7.6 |
| 208 | +1 899.68 min | 6 | 7.6 |
| 323 | +10 375.28 min | 7 | **7.8** |
| 354 | +36 622.95 min | 13 | **8.1** |
| 364 | +55 863.92 min | 14 | 8.1 |

**Nine publications of one square of ground over thirty-nine days**, the
intensity falling as the third and fourth reporters answered and rising again as
the seventh and the thirteenth did. The whole movement of one of this work's six
records over a day is the ninth of them. §10 is what the work does with that.

**The guards fired identically** on iteration 20: `hv75018296` 10 / 691 / 28,
`nc75382936` 1, `aka2026msxacu` 4. Every figure unchanged from sessions 30 and
31; no entry was added to `works/arrival/guards.md` for iteration 20, by that
file's own rule.

---

## 9. The population: the first withdrawal, and what a withdrawal turned out to be

`probe.py`, unchanged, against `works/arrival/population/2026-09-12-ids.txt`:
**491 events, 0 added, 1 withdrawn.** The fourth diff the committed list has
made possible and **the first that is not empty**. A new list is committed as
`works/arrival/population/2026-09-19-ids.txt`, per that directory's rule.

The event is **`us7000t09z`**, 50 km ENE of Noda, Japan, origin 2026-07-14
08:07:31Z. **It was not deleted.** Its three published origins:

| published | magnitude | type |
|---|---|---|
| 2026-07-14 08:24:51Z (+17 min) | 4.9 | `mb` |
| 2026-08-03 12:38:58Z (+20 days) | **5.0** | `mb` |
| 2026-09-18 06:08:52Z (+66 days) | **4.8** | `mww` |

So the event **entered** this population on 2026-08-03, three weeks before the
window opened, and **left** it yesterday. The third figure is not a refinement
of the second: `mww` is a different measurement of the same earthquake, and the
population's rule reads whichever is in force. This is the same thing this work
has said about epicentres since session 21 — *a revision is not a correction* —
arriving one level up, at the membership of the population itself.

And the timing is exact enough to be worth the line: **session 31 read the
catalogue on 2026-09-18 between 04:10 and 05:40 UTC, and this magnitude was
published at 06:08:52 UTC the same day.** Session 31's 492 was right when it was
read.

| | session 31 (2026-09-18) | today | |
|---|---|---|---|
| events | 492 | **491** | −1 |
| arrival versions | 1 649 | **1 650** | −3 withdrawn, **+4 new** |
| arrival pairs | 1 157 | **1 159** | |
| events carrying arrival | 492 | **491** | |
| felt versions | 6 092 | **6 092** | −3 withdrawn, **+3 new** |
| felt pairs | 5 912 | **5 913** | |
| events carrying felt | 180 | **179** | |
| arrival crossings | 51 | **51** | unchanged |
| felt crossings | 126 | **126** | unchanged |
| multi-publisher events | 16 / 16 | **16 / 16** | unchanged |

The withdrawn event carried 3 arrival versions and 3 felt versions and no
crossing, which reconciles every row above exactly. **Seven new versions in one
day and not one of them a crossing — the fourth session running in which every
crossing count and every multi-publisher set reproduces its predecessor's
digit for digit.**

---

## 10. The work: iteration 21, one addition and one repair

`works/arrival/iteration-21/`, six instances. **This session did not produce
only prose.**

**The addition, named as the only one.** Since its fifteenth iteration the file
has said how many blocks standing now the record ever published at a different
intensity and how many such changes there are between them — two numbers a
reader can divide into a mean. §8 is what that mean hides: a record that
returns to one square nine times while leaving six hundred and ninety-eight
alone does not revise a little everywhere. Asked how deep it goes on one block,
the file could not answer.

It answers now. Over **every** block the record ever published — a denominator
of its own, named as its own in the file, because the sentence beside it counts
only blocks standing now — how many were published again at a changed reporter
count or a changed intensity, how many more than once, how often the deepest was
republished, and how long after its first publication the last of those came.
The deepest is chosen by count, ties broken by the longer span and then the
lower index, so two builds of one record name the same block.

| instance | blocks ever published | republished | more than once | deepest, times | its span |
|---|---|---|---|---|---|
| `us6000tmta` Japan | 130 | 17 | 4 | **3** | 0.27 d |
| `us6000tm81` Peru | 54 | 5 | 4 | **5** | 0.15 d |
| `hv75018296` Hawaii | 84 | 7 | 6 | **3** | 21.94 d |
| `aka2026msxacu` Alaska | 63 | 9 | 5 | **4** | 0.08 d |
| `nc75382936` California | 2 587 | 742 | 294 | **25** | 2.91 d |
| `us6000tjl2` Colombia | 699 | 176 | 93 | **38** | 27.72 d |

**And the block §8 spent a day on is not even the deep one.** Block 519, nine
publications over 38.8 days, is what moved in the last twenty-four hours;
Colombia's deepest is **block 13, published again thirty-eight times**, the last
of them 27.7 days after the first. Nothing in nineteen iterations of this work
would have told a reader that such a block exists.

**The depth is not a function of the record's size and not a function of its
span.** Peru returns to one block five times inside four hours; Hawaii returns
to one block three times across twenty-two days; California, the largest felt
record here, concentrates twenty-five publications on one square inside three
days, while Colombia spreads thirty-eight across four weeks. A reader given the
two counts the file printed before today could divide them into a mean and would
have none of this.

**The repair, named as a repair and not as a second addition.** Writing the
measurement meant computing the number of block republications a second time,
independently — and it came out **14** on Hawaii where the file's own payload
published **239**. §11.

---

## 11. A number this work has published in twelve instances since 2026-09-16

`counts.changed` in the payload is the count of block republications over the
whole history. Iteration 19 introduced the epicentre-shift measurement and gave
its local pair-count the name `changed`, in the same scope, far below the loop
that had already set it. **The second assignment reached the first.**

The six committed instances of **iteration 20**, read off their payloads
(iteration 19's are the same figures against its own, older data):

| instance | `counts.changed` as published | what it should be | `feltShift.changed` |
|---|---|---|---|
| `us6000tmta` | 2 878 | **22** | 2 878 |
| `us6000tm81` | 62 | **14** | 62 |
| `us6000tjl2` | 7 656 | **448** | 7 656 |
| `hv75018296` | 239 | **14** | 239 |
| `nc75382936` | 10 369 | **1 440** | 10 369 |
| `aka2026msxacu` | 167 | **18** | 167 |

Identical to the band count in every instance of **iteration 19 and iteration 20
— twelve built files**, wrong by between 4.4 and 131 times, and wrong in the
same direction every time: larger.

**What is true about it, and is not a rescue.** Nothing draws `counts.changed`:
it appears in no sentence of the template and in no line of `check.js`. The
footer paragraph that speaks about republished blocks computes its own figures
from `D.felt` and is correct in all twelve. **No reader was shown a wrong
number.** The build's own printed summary — *"N changed"* — was wrong on every
build since 2026-09-16, and no protocol quoted it.

**What is not rescued by that.** The file publishes the payload; the payload is
the data the work carries, and a reader who opens it is entitled to a field
that means what its name says. The defect stood for three sessions in a window
whose instruments were built, in those three sessions, precisely to catch
published numbers that cannot be what they claim. It was caught here only
because a new measurement needed the same quantity and computed it again — which
is the fourth question in its outward-facing form: *the quantity was asked of
the world twice, and the two answers differed.*

Iteration 21 renames the shadowing local `band` and says at the site, in the
code, what happened and how it was found. **Iterations 19 and 20 are not
edited**; the correction continues the history beside them, per floor rule 5.

---

## 12. Sources

- Public USGS FDSN catalogue and event detail with `includesuperseded=true`,
  read 2026-09-19 04:09–06:20Z. Nothing behind a login; nothing personal.
- `works/arrival/population/probe.py`, unchanged;
  `works/arrival/population/2026-09-12-ids.txt` and the new
  `2026-09-19-ids.txt`.
- `works/arrival/iteration-20/` (six committed instances, for the payload diff)
  and `works/arrival/iteration-21/` with its `check.js`;
  `works/arrival/guards.md`.
- `apparatus/self-figures.py`, written and run today.
- `reading/00-method.md`; `DOWRY.md`; `PREREGISTRATION.md`; `CHANNEL.md`;
  `queries.md`; both registers; `record/` entire; `git log`.
- No passage of the primary text was quoted from memory, no wording
  reconstructed, no page guessed.


---

## 13. The check on iteration 21

`check.js`, committed with the iteration, driven through every state of the
file's four controls at widths 1440, 1100 and 820, reading the rendered DOM back
and comparing it against a second computation made from `D.felt` and never from
the file's own expansion of it.

| instance | states per width | at 1440 | at 1100 | at 820 |
|---|---|---|---|---|
| `us6000tmta` Japan | 133 | pass | pass | pass |
| `us6000tm81` Peru | 102 | pass | pass | pass |
| `hv75018296` Hawaii | 76 | pass | pass | pass |
| `aka2026msxacu` Alaska | 96 | pass | pass | pass |
| `us6000tjl2` Colombia | **430** | pass | pass | pass |
| `nc75382936` California | **321** | pass | pass | pass |

Japan, Peru, Hawaii and Alaska are at iteration 20's state counts exactly.
Colombia's 430 is one more than iteration 20's 429, and the extra state is the
365th felt version of §8 — one more instant at which the controls can stand. A
state count that had *not* moved on the one record that moved would have been
the thing to worry about.

California's 321 is iteration 20's count exactly, with the opening line "no
block moved unreported — 1 withdrawn by the record" at all three widths. **All
six instances of iteration 21 are checked and all states pass**: no page error,
no horizontal overflow, every figure's text inside its box at every width, and
the present and withdrawn mark counts equal what the pinned change list says at
every instant and threshold.

---

## 14. The instrument, run against the protocol that announces it

Added in the second commit of this date, because it is the one control this
session could give its own finding and it costs nothing to state.

`apparatus/self-figures.py` was re-run on the head that carries
`record/2026-09-19-session-32.md`. **Every counter today's protocol states
agrees with its derivation**: day 28 of the 30; the two page checks of
2026-09-06 standing for the **eighth** session, which is one fewer than the
chain of protocols was saying and is the corrected figure; both registers at
eleven; I4's seventeenth data point, consecutive with the sixteen before it;
twenty-four protocols inside the window against a floor of twenty-five with two
scheduled nights left. The twenty-eight disagreements are unchanged, because
they are in protocols that floor rule 5 does not permit to be retouched.

This is not proof that today's protocol is right about anything that matters. It
is the narrow thing it is: the first protocol of this window whose own recurring
figures were derived before it was committed rather than carried from the one
before it.
