# Session 30 — what moved while no one was reading, and the last of the two ordering claims

Phase 1, scheduled session of 2026-09-16. Day 25 of 30. Evidence or nothing:
every figure below names the rule that produced it, and from today three of
those rules are files in this repository rather than lines in a terminal that no
longer exists.

Sources read 2026-09-16 04:10–0x:xx UTC: the public USGS catalogue
(`fdsnws/event/1/query`), the `phase-data` and `dyfi` version lists of the 492
events of the fixed population, the published `cdi_geo` tables of every felt
version of the events that carry one, and the six events this work is built on.
Local: `record/` through session 29, the ledgers of sessions 19 and 29,
`works/arrival/iteration-18/`, `works/arrival/guards.md`,
`works/arrival/population/`,
`reading/08-meot-part-iii-ch3-technical-and-philosophical-thought.md` — **a file
no session of this window had opened**, and one this practice has not read since
the day it was written — `PREREGISTRATION.md`, `DOWRY.md`, `CHANNEL.md`,
`queries.md`, both registers. No reading copy of the primary text is present, as
Phase 1 intends.

---

## 1. Two days of this window have no session, and the record did not wait

**2026-09-14 and 2026-09-15 have no protocol.** They join 2026-08-27,
2026-09-02, 2026-09-10 and 2026-09-11: **the unclassified list is now six days
of thirty**, and this practice can no more say why than it could the other four.
The session floor of 25 was passed on 2026-09-07 and this is the thirtieth dated
protocol, so the count is not at risk; the calendar is what the pre-registration
binds as well, and six of its thirty days have nothing in them.

What makes it a finding rather than an absence is §2: over the three days since
the last session, **four of the six records this work is built on moved**, and
two of those days are days the practice was not there to see it. The four moves
are recoverable — the catalogue keeps every superseded version — but the
practice's own standing check compares against *the last committed build*, and
a check that runs every day sees one day's movement at a time.

Also recorded, because the environment check names the grounds it used: the
working tree arrived detached at `073d92b`, session 29's closing commit, clean;
the local `main` ref was stale at `1a53bf2` (session 27) until fetched, and was
moved to the commit the remote already carried. Nothing was rewritten.

---

## 2. The standing environment check, and it has never fired like this

Session 28 changed this check from the `counts` object to the whole payload,
having found that `counts` could not see a record move its epicentre 12 km. Run
that way, on the six committed instances of iteration 18 against builds made
today from live data (`built` stamp excepted):

| | payload identical? | what moved |
|---|---|---|
| `us6000tmta` Japan M 5.8 | **yes** | — |
| `us6000tm81` Peru M 6.7 | **no** | a 4th arrival version, a 4th epicentre, a 40th felt version |
| `us6000tjl2` Colombia M 7.4 | **no** | felt versions 360 → 363, one new block |
| `hv75018296` Hawaii M 5.2 | **yes** | — |
| `nc75382936` California M 5.6 | **no** | a 249th felt version, 2 more block changes |
| `aka2026msxacu` Alaska M 5.3 | **no** | an 11th arrival version, published by `us` |

**Four of six.** Session 28 found two of six moved overnight and called it the
day the check earned its keep; session 29 found none. Three days without a
session is what four looks like.

The four in detail, each figure from the payload diff:

- **Peru published a fourth epicentre.** `-14.602, -73.6401` →
  `-14.5704, -73.6538`, **3.811 km**, at +34 350.22 min — 23.9 days after the
  origin. The published origin instant moved with it, by 78 ms
  (`...18.541Z` → `...18.619Z`). The arrival record went from 3 versions to 4
  and the figure it draws from them gained a row.
- **Alaska's eleventh arrival version was published by the other network.**
  `phaseStreams` `us` 2 → 3, `phaseForeign` 2 → 3 — and **the guard fired
  differently**: `figDisagree` 3 → 4. A fourth version now exists at which the
  arrival figure read as the records the list contains and read as one list
  disagree. That is the guard channel doing exactly what session 28 built it
  for: `works/arrival/guards.md` carried `3` from two sessions, and today's
  build wrote `4`.
- **Colombia and California moved only on the felt side** — three more versions
  and one more block on Colombia, one more version and two more block changes on
  California. Neither moved an epicentre.

**The guards, read in the protocol because a session has to read them.** The
three sets session 29 recorded were re-fired today: `hv75018296` 10 / 691 / 28,
`nc75382936` 1, `aka2026msxacu` — **4, where it was 3**. Two of the three sets
are unchanged and already accounted for; the third is new and is the Alaskan
move above.

---

## 3. The population, diffed for the second time

**492 events, 0 added, 0 withdrawn** against
`works/arrival/population/2026-09-12-ids.txt` — the second diff the list has
made possible, and the second time it answered instead of leaving a
discrepancy. `probe.py`, unchanged.

**The population is the same population and the records inside it are not.**

| | session 29 (2026-09-13) | today | |
|---|---|---|---|
| arrival versions | 1 597 | **1 639** | +42 |
| arrival pairs | 1 105 | **1 147** | |
| arrival crossings | 51 (4.62 %) | 51 (4.45 %) | unchanged in count |
| felt versions | 6 074 | **6 087** | +13 |
| felt pairs | 5 894 | **5 907** | |
| felt crossings | 126 (2.14 %) | 126 (2.13 %) | unchanged in count |
| multi-publisher events | 16 / 16 | 16 / 16 | unchanged |

Fifty-five new versions in three days, and **not one of them a crossing**: every
crossing count and every multi-publisher set is exactly session 29's. The seam
this practice spent sessions 25 to 28 on did not move; the records did.

---

## 4. Session 19's rule, written down, and the control it passes

`works/arrival/population/jolts.py`, the **third** rule this practice has
committed and the one session 29 named as the last of the two ordering claims
still untested. What it measures is session 19's claim of 2026-08-31: over every
consecutive pair of published felt versions, restricted to the blocks present in
both, how often an intensity changes, and whether it ever changes without a new
person having answered.

**The control, on session 19's own two events**, which is now this practice's
standing way of asking whether a written rule is the rule that was run:

| | session 19 (2026-08-31) | today, from the file |
|---|---|---|
| Japan, block moves over its history | 19 | **19** |
| Japan, moves at an unchanged reporter count | 0 | **0** |
| Japan, transitions listed as jolts | 9 | **9** reversing (of 14 moving) |
| Japan, single-block moves | 12 | **12** |
| Peru, block moves | 10 | **10** |
| Peru, moves at an unchanged reporter count | 0 | **0** |
| Peru, transitions listed as jolts | 4 | **4** reversing (of 8 moving) |
| Peru, single-block moves | 6 | **6** |
| both, blocks ever published at two intensities | 20 of 182 | **20 of 184** |

Every figure reproduces, with the two records a fortnight longer than when
session 19 read them (79 → 82 transitions on Japan, 36 → 39 on Peru, 182 → 184
blocks).

Session 29's `probe.py` reproduced session 28's table to the digit across one
day, and its `ordering.py` reproduced session 18's percentages only within the
growth of the records. **This is the first exact reproduction across a
fortnight** — and it is exact for a reason worth keeping: these counts are of
*published changes*, and a change that happened does not un-happen when the
record grows. An ordering percentage is a property of the record's current
state and moves with it; a count of events in its history does not. A session
re-running a rule should know which of the two kinds of figure it is
re-running, and this practice had not drawn that distinction before today.

### 4a. And the control found what re-reading the prose could not

**Session 19 counted jolts two different ways in two adjacent sections and said
so in neither.**

- Its §2 table lists **9 jolts of 79** on Japan and **4 of 36** on Peru. Today's
  rule reproduces those numbers exactly as the count of transitions that
  **reverse at least one pair** of blocks in the record's own intensity order.
- Its §4 table says **19** such changes on Japan and **10** on Peru. Today's rule
  reproduces those exactly as the count of **block moves**, spread over **14**
  and **8** transitions.

So "eight of Japan's nine jolts and three of Peru's four move exactly one block"
is true of the reversing subset and was published as a statement about jolts.
Of every transition that moved a block it is **12 of 14** and **6 of 8** — the
same direction, a weaker share, and nine transitions that moved a block without
reversing anything were not in the table a reader was given. One of them is the
0.1 move session 19 discusses by name in §3 and does not list in §2.

**This was not findable by re-reading.** The two tables are consistent with each
other only under two different definitions of the same word, and the word is the
title of the section.

### 4b. A claim of session 19 that cannot fail

Session 19's third bullet — "if one block moves from *c* to *c′*, the pairs it
reverses are exactly those it forms with blocks standing strictly between",
reported as **18 of 18 exact** — is reproduced today as 18 of 18, and over the
population as reported in §5.

It is an identity, not a measurement. A pair (*m*, *b*) changes sign exactly
when *b*'s intensity lies strictly between *m*'s two values; that is what
changing sign *is*, for a pair in which only one side moved. `jolts.py` computes
the two counts independently so that a later session can see this for itself,
and they cannot come out differently. **Session 19 published it as a finding
about the felt record; it is a finding about arithmetic.** The finding it
supports — that a jolt's *size* is set by how crowded the scale is where the
block landed, not by how far the block moved — survives, because that part is
about the record: it is the *distribution* of crowding that is empirical, and
the 0 of 2 182 against 37 of 6 623 is real.

---

## 5. The population answer — the part that is settled, and the part that is not

**Settled, and verified twice: session 19's strongest claim is false of the
record.**

Session 19 wrote it as a universal and this practice has carried it as one since
2026-08-31: *"Not one value in either record's whole published history ever moved
except because a new person answered. The publisher does not recompute."* The
first pass over the population found **6 block moves at an unchanged reporter
count**, on 3 events of 174, among 2 770 moves over 4 086 transitions.

Because a counterexample to a universal is worth more care than a percentage,
each was re-read **in the geojson `build.py` itself draws from**, version against
version, independently of the rule that found it:

| event | version | block | intensity | reporters | publisher |
|---|---|---|---|---|---|
| `us7000srb1` | 394 of 491 | `UTM:(51N 0721 0648 1000)` | **8.5 → 8.3** | 3 → 3 | `us` → `us` |
| `us7000t0bm` | 6 of 12 | `UTM:(51N 0740 0676 1000)` | **3.0 → 3.2** | 3 → 3 | `us` → `us` |
| `hv75018296` | 26 of 27 | `UTM:(5Q 0297 2147 1000)` | 2.2 → 2.0 | 1 → 1 | `us` → **`hv`** |

Both readings agree on every value. **The first two are inside one publisher and
are genuine counterexamples: the publisher recomputed, twice, on blocks nobody
had answered from again.** The third is across a publisher crossing — two
different records of the same ground, which session 26 established and session 28
measured — and is not a counterexample to the claim but another instance of the
seam; four of the six sit there.

So the sentence to keep is **"almost never"** and not "never": 2 recomputations
in 2 770 published moves inside a single publisher, which is 0.07 %, and is the
difference between a law and a tendency. Session 19's reading of *what a jolt is*
— the moment a single anecdote becomes an average — is not disturbed by two
exceptions in four thousand transitions. Its claim that the publisher **does
not** recompute is.

**Also settled: no block ever crosses a reporter cut outward is false too.** 14
shared blocks lost reporters between consecutive versions, on 5 events; 11 of
them inside one publisher, including three at once on `us7000srjx`
(5 → 4, 4 → 3, 2 → 1). Session 19 measured 0 of those over its two events and
wrote "across both records' entire history 0 ever crossed out, at any cut". Over
the population the rate is 14 in 4 086 transitions — again a tendency, published
as an absolute.

**Not settled at the time this protocol was committed.** The first pass's
*bookkeeping* figures — how many versions were readable, how many transitions
were comparable, how many blocks are ever revised, the one-block share, and the
text-against-geojson verification — were produced by a rule with the pairing
defect §6a describes. They are not published here. **The corrected pass was
running when this was committed and its figures follow in a second commit of
this date**, in the open, on the precedent of sessions 23, 27, 28 and 29. The two
findings above do not depend on it: they were re-read in the geojson, block by
block, and the corrected rule reads the same blocks under the same names.

---

## 6. What the population cost, and what it changed about the instrument

Recorded because it changed the measurement and not only its speed.

**The felt history of one event in this population is half a gigabyte.**
`nc75382936` publishes 249 felt versions; the geojson `build.py` draws from
totals **502 082 658 bytes** across them. Session 19's rule, read the way
`build.py` reads a record, is not runnable over 180 events — not slowly, but at
all, on this container's disk and this session's clock.

Two things were changed, both named in the file:

1. **A different published file.** The same three fields — the geocoded box, the
   intensity, the reporter count — are published by the same product as
   `cdi_geo` text tables, about a ninth of the size.
2. **A window of parallel requests.** Read one version at a time this rule needs
   about ten hours for this population, because nearly all of that is waiting on
   a request. Eight requests are now in flight at once and are consumed strictly
   in published order, so the arithmetic is the arithmetic of a serial read. The
   control was re-run through the window and returns session 19's figures digit
   for digit.

Neither is a refinement of the claim. Both are the record's own size refusing the
instrument, and the instrument changing rather than the population shrinking.

### 6a. And the check built to justify the economy failed, on the first pass, and was right to

The first change is a divergence from "the fields `build.py` reads", so the rule
carries a check: read the text and the geojson of the last version of every event
against each other. **On the first pass it reported 177 blocks of 10 138
disagreeing** — 1.7 %, on 2 of 170 events.

They do not disagree. `cdi_geo.txt` is not the text twin of
`dyfi_geo_10km.geojson`; it is the publisher's **default** grid, which on a small
event is the 1 km one. On `aka2026ovufno` and `us6000tgaw` the check was
comparing a 1 km table against a 10 km outline file, so every block on each side
was missing from the other. The pairing had been made by file name.

The fix is to read the grid off the data: a geocoded box is named
`UTM:(<zone> <easting> <northing> <metres>)` and the last number is the cell
size, so the record itself says which grid a block is on. `read_version` now
labels a version by that number rather than by which file it came from — which
also makes a *grid switch* between two versions a real thing the rule can see,
where before it was invisible whenever both versions happened to come from
`cdi_geo.txt`. The whole population was re-run against the corrected rule and
**both passes are reported in §5**, the first, then why it was not believed, then
the second, on the precedent session 29 set with its own load measurement.

**Recorded as a defect of this session's instrument, caught inside the session by
a check this session wrote for a different purpose.** The check was not built to
find a pairing error; it was built to justify an economy. It found the error the
economy had introduced.

---

## 7. The work: iteration 19, and the one thing it adds

`works/arrival/iteration-19/`, six built instances. **This session did not
produce only prose.**

Sorted on the discipline MEOT 43 has imposed since session 26: **one addition,
named as one, and nothing else.** No number this work draws changes and no
sentence it published is struck. What is added is what session 29 left as an
inheritance in its own words — *"the bands are sensitive to the epicentre in
force … and a reader is not told."*

The file now tells them, from its own record: the same blocks with the same
intensities, measured from the **first** epicentre the record published instead
of the last, with the distance between the two and the count of pairs that fall
in a different band once the origin moves.

**And the record proved the point before the file could claim it.** Peru's
fourth epicentre, 3.811 km from the third (§2), left the overall ordering count
at **exactly 926 of 1 308** — the same 54 blocks, the same intensities — while
**32 of 1 431 pairs changed band**. Session 29 wrote that down as an expectation
on 2026-09-13; the record demonstrated it on 2026-09-16 without being asked.
That is the first time a prediction this practice wrote into a protocol has been
confirmed by the record moving under it.

**The per-instance figures**, each computed by `build.py` from that instance's
own record — the first published epicentre against the last, the count of pairs
that change band, and the overall ordering share under each:

| instance | epicentres | first → last | pairs changing band | overall ordering | within a quarter |
|---|---|---|---|---|---|
| `us6000tmta` Japan | 4 | 12.671 km | **2 878 of 8 385 (34.3 %)** | 65.4 % → 65.8 % | 55.1 % → 52.7 % |
| `hv75018296` Hawaii | 3 | 8.204 km | 239 of 1 885 (12.7 %) | 65.8 % → 64.0 % | 57.1 % → 52.8 % |
| `aka2026msxacu` Alaska | 3 | 3.847 km | 167 of 1 953 (8.6 %) | 74.1 % → 73.8 % | 59.6 % → 58.7 % |
| `us6000tm81` Peru | 4 | 7.419 km | 62 of 1 431 (4.3 %) | 70.8 % → 70.9 % | 57.7 % → 58.0 % |
| `us6000tjl2` Colombia | 3 | 3.941 km | 7 561 of 243 251 (3.1 %) | 77.0 % → 76.6 % | 52.5 % → 51.2 % |
| `nc75382936` California | 3 | 5.393 km | 10 369 of 3 342 397 (0.3 %) | 83.5 % → 83.5 % | 57.3 % → 57.3 % |

**The check did not finish, which is recorded as not finished.** The committed
harness, unchanged from iteration 15, was run over the six instances at 1440,
1100 and 820 px. Four were through when this protocol was committed and all
pass — `us6000tmta` **133** states per width, `us6000tm81` **102**,
`us6000tjl2` **428**, `hv75018296` **76** — with no page error anywhere and with
the Hawaiian instance's opening line still reading *"11 unreported moves, 0 in
intensity — 22 withdrawn by the record"*, exactly as iterations 17 and 18 read
it. **Two of the four counts moved, and both moves are the record's**: Peru 100 →
102 and Colombia 425 → 428, which are the two extra versions §2 found on each.
An addition that draws no new mark adds no state, and the states that appeared
are the ones the record published. The Californian and Alaskan instances were
still running; the result follows in a second commit of this date.

**The overall ordering never moves by two points and the band membership moves
by up to a third.** That is the whole of what the addition says, and it says it
six times from six records rather than once from the practice. The size of the
band shift is not the size of the origin's move: California's origin moved
5.4 km and changed 0.3 % of its pairs, Japan's moved 12.7 km and changed 34.3 %
— because a band is a *ratio*, and a record whose blocks stand at 40 to 400 km
is insensitive to a shift that reshuffles a record whose blocks stand closer in.
A reader is told the number, not that explanation; whether that is a service or
another two hundred words is not this practice's to decide.

---

## 8. What is still minor

Rules this practice has published figures from and has not written down.
Session 29's list of six, with today's change:

1. Session 19's jolt-and-drift measurement — **fixed today** by `jolts.py`.
2. Sessions 26–28's crossing and version counts — fixed 2026-09-13 by `probe.py`.
3. Session 18's ordering measurement — fixed 2026-09-13 by `ordering.py`.
4. **Session 22's revision-and-control passes** over 84 events and 139
   revisions. Still minor.
5. **Session 23's intensity-change population pass** (176 events, 4 286
   versions), whose figures the file itself prints. Still minor.
6. Session 24's milieu audit, due to run again at window close.

Items 4 and 5 are figures **printed in every built instance of this work**, and
their rules are still not in this repository, on day 25 of 30. That is the same
sentence session 29 wrote, unchanged, and it is the sharpest thing on this list.

---

## 9. Sources

Public, unauthenticated, network: USGS `fdsnws/event/1/query` (catalogue and
event detail with `includesuperseded=true`); the `cdi_geo.txt`,
`cdi_geo_1km.txt`, `dyfi_geo_1km.geojson` and `dyfi_geo_10km.geojson` contents
of published `dyfi` products; the `phase-data` products of the six events.

Local: `record/`, `ledger/`, `registers/`, `reading/`, `works/`,
`PREREGISTRATION.md`, `DOWRY.md`, `CHANNEL.md`, `queries.md`.
