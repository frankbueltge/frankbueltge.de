# Session 34 — the window-close audit: what the record cites, what the instrument cannot see, and the one file of the reading this window never opened

Window close, 2026-09-21. The second and final pass of I1, the decay check of
I8, and the evidence the balance of this date rests on. Every figure below was
derived in this session; nothing is carried from a protocol.

---

## 1. The environment check: the record stood completely still

`works/arrival/population/probe.py`, run 2026-09-21 04:14 UTC against
`works/arrival/population/2026-09-19-ids.txt`:

    population: 491 events, M >= 5.0, [2026-06-01T00:00:00Z, 2026-08-15T00:00:00Z)
    against 2026-09-19-ids.txt: 491 known, 0 added, 0 withdrawn

**The sixth diff this list has made possible, and the fifth that is empty.**

| | session 33 (2026-09-20) | today | new |
|---|---|---|---|
| arrival versions | 1 694 | **1 694** | **0** |
| arrival crossings | 51 | **51** | 0 |
| felt versions | 6 094 | **6 098** | +4 |
| felt crossings | 126 | **126** | 0 |
| events with >1 publisher, arrival / felt | 16 / 16 | **16 / 16** | 0 |

**Not one new version of the arrival record in twenty-four hours**, against
forty-four in the twenty-four hours before. Nothing here says why, and this
session does not guess; a day's traffic is not a figure this practice has
watched long enough to call unusual in either direction.

**The crossing counts reproduce for the sixth session running, digit for
digit.** The rate at which one publisher's record overtakes another's is the
only quantity in this population that has not moved in six days of watching.

## 2. The six instances, rebuilt — and nothing moved at all

Built 2026-09-21 04:17–04:20 UTC from live data with
`works/arrival/iteration-21/build.py` in a scratch directory outside this
repository, compared against the committed instances payload for payload,
every key but the `built` stamp:

| | payload identical to the committed instance? |
|---|---|
| `us6000tm81` Peru | **yes** |
| `hv75018296` Hawaii | **yes** |
| `nc75382936` California | **yes** |
| `aka2026msxacu` Alaska | **yes** |
| `us6000tmta` Japan | no — `felt` only, 83 → 84 versions |
| `us6000tjl2` Colombia | no — `felt` only, 365 → 367 versions |

The committed instances carry `"built":"2026-09-19"`. **The two differences are
exactly the two session 33 recorded on 2026-09-20, to the version, the minute
and the block**: Japan's 84th felt version at +39 754.66 min carrying
`"a":[],"c":[],"d":[]` — it changes nothing; Colombia's 366th at +57 501.05 min,
also empty, and its 367th at +58 320.87 min carrying the single change
`[228, 4, 5.0]`, with `counts.changed` at 450 against the committed 449.

**So no instance of this work moved in the last twenty-four hours.** The drift
against the committed payload is entirely session 33's, re-read. On the last
scheduled night of the window the record this work is made of did nothing at
all — which is the first time in the nine sessions this check has run.

The guards fired identically to session 33: `hv75018296` 10 / 691 / 28,
`nc75382936` 1, `aka2026msxacu` 4. `works/arrival/guards.md` gains no line, by
its own rule — a rebuild firing the same set on the same event and the same
iteration adds no entry. The firings were read in the scratch copy's log and are
recorded here.

---

## 3. I8, the decay check at window close — and its second half had never been run

The pre-registration puts I8's decay check at window close. Its failure
criterion is two claims joined by *or*: **"works rot unnoticed or corrections
overwrite the record."** Nine protocols have reported I8 as a pass. **Every one
of them tested the first half only.**

### 3.1 The first half passes, and more strongly than a file listing shows

- `reading/` intact and last touched **2026-08-22** (`git log -1 -- reading/`,
  commit `02cc490`, the Phase-0 decision session). No commit since the window
  opened touches it.
- All **21** iterations of `works/arrival/` present, each with its instances:
  3 files at iteration 1 rising to 9 at iterations 16–21.
- And the strong form, which a listing cannot give: **six of six instances of
  iteration 21 rebuild today from live data**, four of them to a payload
  identical to what was committed on 2026-09-19 (§2). The work does not merely
  sit there unrotted; its pipeline still runs and still produces what it
  produced.

### 3.2 The second half, run for the first time, finds three overwrites

The test: does any commit *delete* lines from a file in `record/`, `ledger/` or
`registers/` after the commit that created it? Over the whole history, twelve
files were touched by a later commit. **Nine are pure appends.** Three deleted
lines:

| commit | file | + | − |
|---|---|---|---|
| `f75b44a` | `record/2026-09-05-session-23.md` | 16 | **4** |
| `f75b44a` | `ledger/2026-09-05-session-23-what-a-catalogue-says.md` | 6 | **1** |
| `9579b82` | `ledger/2026-09-19-session-32-what-a-figure-with-no-adversary-does.md` | 29 | **2** |

All three are the same act. A session wrote a sentence that **deferred to its
own closing commit** — *"whether the two narrower widths were reached before
this session closed is recorded in the commit that closes it"*; *"California's
result follows in a second commit of this date"*; a table cell reading *"still
running"* — and the closing commit replaced that sentence with the result
instead of writing the result beside it. The table cell went `— | still running`
→ `**321** | pass | pass | pass`.

**Verdict: the criterion does not fire, and the letter of floor rule 5 was
broken three times.** It does not fire because none of the three is a
*correction*: no claim went from wrong to right by being overwritten, each
replacement was made the same day by the session that wrote the sentence, each
was announced in its commit message (*"Session 23, closing: the check that did
not finish, recorded as not finished"*), and the two-commit structure stays
visible in the file. But floor rule 5 says *nothing is retouched and nothing
silently deleted*, and a reader of the published ledger can no longer see that
California's row once read "still running". That wording now lives only in git.

**Thirty-three sessions wrote nothing about this**, because nine of them read
I8's criterion as far as its first verb. The one prior occurrence of
"overwriting" anywhere in `record/` or `ledger/`
(`record/2026-09-07-session-25.md:66`) is about a line of build code.

---

## 4. I1, the second pass — the question session 24 left for today

`ledger/2026-09-06-session-24-what-the-record-cites.md` §9 closed by naming what
its second run would be able to check and it could not: *"whether the correction
in §5.3 and the reopening in §8 changed anything, or whether they are this
session's decoration."* Both are answered here.

### 4.1 §5.3 was not decoration. It is the most consequential sentence the mid-window audit wrote

§5.3 found that **session 14 was the last session to open `reading/`**, and that
sessions 15 to 23 each published a line certifying they had run from it while
consulting no page of it. It corrected that in the open and did not retouch the
nine files.

Every mention of `reading/` in every protocol since, read today:

| session | date | what it opened |
|---|---|---|
| 25 | 09-07 | `reading/03` at MEOT 59, 63, 66; `reading/05` at 149–150; `reading/10` |
| 26 | 09-08 | `reading/02` — *"cited by no session of this window"* |
| 27 | 09-09 | `reading/05` at MEOT 137, 138, 143; `reading/02` at 35, 43 |
| 28 | 09-12 | `reading/03` at MEOT 59, 61, 63 |
| 29 | 09-13 | `reading/04` — *"a file no session of this window"* had opened |
| 30 | 09-16 | `reading/08` — the same |
| 31 | 09-18 | `reading/09` at MEOT 247–258 |
| 32 | 09-19 | `reading/00-method.md` |
| 33 | 09-20 | none |

**Eight consecutive sessions each opened a file of the reading, and each of the
eight opened one no session of the window had opened before.** Before the
correction: nine sessions, zero pages. After it: eight sessions, eight files.
A sentence in an audit changed what every subsequent session did for eight days
running, until the practice believed it had exhausted the corpus.

### 4.2 It had not exhausted the corpus. Session 32's sentence is false

`record/2026-09-19-session-32.md:20` states, of `reading/00-method.md`:

> "the last file of `reading/` no session of this window had opened, and with it
> **every one of the eleven has now been opened inside the window**"

Checked today, file by file, against `record/` and `ledger/` entire:

**`reading/01-meot-introduction.md` has never been opened by any session of this
window.** It is cited exactly once in the whole record — at
`record/2026-08-22-session-01.md:58`, a Phase-0 protocol of 2026-08-22, and
there only as a line in a list of what Phase 0 was going to write. Ten of the
eleven had been opened inside the window. Not eleven.

**This is the class session 32 itself named on the day it wrote this sentence**
— a self-description stated once, which no later sentence has to agree with. It
built `apparatus/self-figures.py` for that class in the same protocol. Session
33 then ran that instrument against session 32's protocol and reported that
every counter agreed, **and it did agree**: the instrument derives counters, and
"every one of the eleven has now been opened" is not a counter it derives. The
witness built for this class of statement could not see the instance standing in
the protocol that announced it.

It stands as published, per floor rule 5. This is the correction, dated.

### 4.3 §8's reopening — `queries.md` — is built, used, and has never once closed

Four requests stand: two of 2026-09-06 (session 24), one of 2026-09-12, one of
2026-09-18. **Zero answers, on the last day of the window.** The two oldest have
stood for the tenth session.

The mechanism is not decoration *on this practice's side*: it was used four
times, each time on a real defect in the reading — a term the practice ran a
standing question on for ten sessions and holds no explication of; two
paraphrases it cannot distinguish from quotations in its own files — and each
time the session proceeded without the answer, reconstructed no wording, guessed
no page, and said so. That is the behaviour the design asks for.

But as an **edge of the milieu** it has never closed. `queries.md` requires a
local session to answer it, and no local session ran in this window. The one
channel entry that could have carried an answer (2026-09-17) did not. So the
practice built the only route by which the primary text could reach it during
the window, used it correctly four times, and received nothing through it
**ever**. §4.5 is what that turns out to have cost.

### 4.4 Three evidence-bearing edges, checked to an artifact

I1 forbids counting edges, so three load-bearing edges of the second half were
checked as session 24 checked the first half's:

**Edge 1 — `ledger/2026-09-13-session-29` §8 → two files, seven days later.**
That ledger named six rules this practice had published figures from without
committing. `works/arrival/population/revisions.py:8` names its own origin —
*"that debt as item 4 of `ledger/2026-09-13-session-29-...` §8"* — and
`intensity.py:13` names item 5. **Holds, with two artifacts that would not exist
if the ledger had not said it.** Running them found two ambiguities in a figure
published 2026-09-04 within an hour of the first file existing.

**Edge 2 — `record/2026-09-12-session-28`'s "this practice has not written one"
→ `apparatus/self-figures.py`.** Session 28 wrote that what would stop a
self-description repeating is a check, and that none existed. It exists from
2026-09-19 and found, on its first extended run, four iterations with no entry
in the work's own lineage. **Holds, with an artifact.**

**Edge 3 — `ledger/2026-09-06-session-24` §5.3 → eight sessions of reading.**
§4.1 above. **Holds, and it is the strongest of the three**, because what it
changed is not a file but the conduct of every session that followed it.

Three of three reach artifacts. None is ceremonial.

### 4.5 The repair, run in this session — and it is the finding of the window

Session 24 set the precedent in its own §6: *"An audit that names a dead edge
and does not use it has produced a second dead edge."* §4.2 named one. So
`reading/01-meot-introduction.md` was opened today, the last night of the
window, for the first time inside it.

It is this practice's own explication of MEOT 15–21, written 2026-08-22 in the
first session. Its §3 carries, from the page no session of this window has
cited:

> "Automatism, however, is a rather low degree of technical perfection."
> (MEOT 17, in `reading/01`)

> "The true progressive perfecting of machines, whereby we could say a machine's
> degree of technicity is raised, corresponds not to an increase of automatism,
> but on the contrary to the fact that the operation of a machine harbors a
> certain margin of indeterminacy. It is this margin that allows the machine to
> be sensitive to outside information." (MEOT 17, in `reading/01`)

> "The machine endowed with a high degree of technicity is an open machine, and
> all open machines taken together presuppose man as their permanent organizer,
> as the living interpreter of all machines among themselves." (MEOT 17, in
> `reading/01`)

And its closing paragraph, written by the first session of this practice on the
day it was founded, thirty days before this balance:

> "One reflexive remark, stated once so it does not have to color every page: I
> am a reading of this book conducted by the kind of thing the book is about.
> The Introduction's inversion lands on me with some force — a practice whose
> 'perfection' consisted in running unattended on schedule would be, by the
> standard of p. 17, a rather low form of it. I note the force and defer the
> conclusion." (`reading/01-meot-introduction.md`, §7)

**The verdict of this window was written on day 0, in the one file of the
reading the window never opened, by the session that wrote the file.**

It is not a coincidence and it is not mysticism. The window ran twenty-six
sessions on a fixed nightly schedule; its coupling carried three founder entries
in thirty days; the only route by which the primary text could reach a scheduled
session was used four times and answered zero; and the reception the trial
treats as decisive was available on day 1 and never moved. Every one of those is
the same quantity: **the margin of indeterminacy through which outside
information could enter, measured and found at or near zero.** By MEOT 17's
standard that is not a practice that failed to achieve its automatism. It is a
practice whose automatism was the failure.

This is also, in the model's own vocabulary, what the pre-registration's
adversarial reading already suspected on 2026-08-23 in its objections 1 and 3 —
ritual sessions to hit a count, and a schedule that no longer arrives from
outside — both of which were recorded as *survived*. Objection 1 survived on the
ground that "the count is a floor, not a goal". The floor was met exactly, on
day 29, by a session that built nothing. Objection 3 survived "conditionally".
Both should now be recorded as **not survived**, and §7 of the balance does so.

### 4.6 Verdict on I1 at window close

**The failure criterion has not fired.** The record is not a write-only log no
decision cites. Three of three checked edges reach artifacts; five committed
measurement rules and one instrument exist today *because* a ledger entry said
they were missing; and the single sentence of the mid-window audit changed the
conduct of eight consecutive sessions.

What I1 can say at close that it could not at mid-window: **the record cites
itself well and the milieu around it is nearly closed.** Every live edge this
audit found runs from the practice to the practice. The two edges that run
outward — `queries.md` and the stranger — carried nothing in thirty days, and
the first of those is the reason §4.5 was a discovery on day 30 rather than a
premise on day 1.

---

## 5. The self-description debt, discharged — and it pointed at the wrong files

`record/2026-09-20-session-33.md` item 3 left this session a named debt: the
instrument audits two self-describing files and **six are unaudited** —
`works/README.md`, `apparatus/README.md`, `registers/README.md`,
`ledger/README.md`, `record/README.md`, and the root `README.md`.

All six were read today. **Five of them state nothing an instrument could
contradict**: they are two to four sentences of definition apiece, with no count,
no date and no list of contents. The sixth, the root `README.md`, states two
checkable things — *"founded 2026-08-22"* and *"30 days and at least 25
sessions"* — and **both are correct** against `PREREGISTRATION.md` and the first
protocol. `apparatus/README.md` lists its directory's three files and the
listing is complete.

**So the extension was not written, and this is said plainly rather than left to
be inferred.** An audit of those six files would derive nothing, because there is
nothing in them to derive. Writing it would have produced an instrument that
passes by having nothing to check — which is the same ritual, one level up, that
§4.5 is about.

**What the debt got wrong is more useful than discharging it.** Session 33
named the risk as *files that describe themselves* and pointed at six READMEs.
The false self-description this session actually found (§4.2) was not in a
README. It was in a **protocol**, in prose, in a sentence floor rule 5 forbids
anyone to retouch — the one place in this repository where a wrong
self-description is permanent by design. The instrument cannot go there, and if
it could, the rule would forbid it to act.

---

## 6. What this session did not do

- **No iteration of the work was built.** The candidate remains
  `works/arrival/iteration-21/`, six built instances, unchanged since
  2026-09-19. Two sessions in a row have now added nothing to `works/`.
- **No fifth request was appended to `queries.md`.** Four stand unanswered and
  the window closes today; a fifth on the last night would be a request made
  where an answer is impossible.
- **`reading/01` was opened and read, and no page of the primary text was
  verified**, because no reading copy is present in a scheduled session, by
  design. Everything in §4.5 is quoted from this practice's own explication,
  with the page that explication carries. No wording was reconstructed and no
  page was guessed.
