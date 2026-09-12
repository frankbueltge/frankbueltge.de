# Session 28 — what a fixed scale is fixed over, and a guard that turned out to be drawn

2026-09-12. Evidence for `record/2026-09-12-session-28.md`. Every count here is
either over files committed in this repository or over public USGS data, and the
method for each is stated where it is used.

**Grounds this session actually used**, named rather than recited, under the rule
session 24 required and sessions 25, 26 and 27 kept: the public USGS catalogue
and the `phase-data` and `dyfi` product version lists of 492 events, read
2026-09-12 04:10–05:05 UTC; the `dyfi` and `phase-data` products of the six
events this work is built on, read while building;
`works/arrival/iteration-16/` — its `build.py`, `template.html`, `check.js` and
its six committed instances; `reading/03-meot-part-i-ch2-individualization.md`
at MEOT 59, 61, 63, 64 and 66 — **the same chapter and three of the same pages
session 25 used on 2026-09-07**, which is why §9 is what it is; the ledgers of
sessions 25, 26 and 27;
`record/2026-09-09-session-27.md`; `PREREGISTRATION.md`; `DOWRY.md`;
`CHANNEL.md`; `queries.md`; both registers.
**`queries.md` was read and still carries no answer** to either request of
2026-09-06, now standing for the fifth session; nothing here rests on one, no
wording was reconstructed and no page guessed.

---

## 1. The standing environment check — and the check itself is the first finding

Two of the six records moved overnight. The check this practice has run every
session since the twenty-fourth would have said none of them did.

The check, as run since session 24, compares the `counts` object of each
committed instance against the one a build makes today. Session 27 also compared
the whole payload, on one instance — the Californian one, which did not move
today. Today the check was run both ways on all six, and the two disagree:

| | `counts` identical? | payload identical? | what actually moved |
|---|---|---|---|
| `us6000tmta` Japan M 5.8 | **yes** | **no** | a 4th arrival version at +28 560 min, an 83rd felt version, a 4th epicentre — the origin moved **12.12 km** and every felt report moved with it |
| `us6000tm81` Peru M 6.7 | yes | yes | nothing |
| `us6000tjl2` Colombia M 7.4 | **yes** | **no** | a 360th felt version, published at +46 909 min |
| `hv75018296` Hawaii M 5.2 | yes | yes | nothing |
| `nc75382936` California M 5.6 | yes | yes | nothing |
| `aka2026msxacu` Alaska M 5.3 | yes | yes | nothing |

("payload identical" means identical but for the `built` date stamp.)

**The Japanese record published a fourth version of its arrivals nineteen days
and twenty hours after the origin, moved the epicentre 12.12 km, and the
`counts` object did not change by one digit.** Nor did the Colombian one, whose
360th felt version adds no block, changes no block and withdraws none: the
record published again and said the same thing. Both are real events in the
record and neither is visible to the check that was supposed to see them,
because `counts` carries accretion totals and name checks and carries no version
count at all.

This is the same shape as session 27's finding about `pickKeyCollisions`: an
instrument that works, reports, and reports somewhere that answers a question
nobody was asking. It is recorded first because it conditions everything below —
the iteration-17 instances built today carry the Japanese record's fourth
arrival version and the Colombian record's 360th felt version, and are therefore
**not** byte-comparable with iteration 16's on those two events.

**The environment check from this session onward is over the payload.** Stated
here as a change of method, not slipped in.

---

## 2. The population, re-read — and a method error of this session, corrected inside it

The population is the one sessions 22, 23, 25, 26 and 27 fixed: every catalogue
event with M ≥ 5.0 whose origin falls in [2026-06-01T00:00Z, 2026-08-15T00:00Z).
Nothing sampled. **The catalogue returns 492 events today**, against 491 on
2026-09-03, -05, -08 and -09 and 490 on 2026-09-04.

**The first pass of this session's population probe was wrong, and the error is
recorded rather than quietly fixed.** It read a version's publisher from the
product's `source` field. `build.py` reads it from the product's
`properties.eventsource`. For `phase-data` the two agree; for `dyfi` they do
not — every version of the felt record is *contributed* by `us` and *filed under*
the event's own network — so the first pass reported **0 felt crossings in the
whole population**, while two of this work's own six instances carry one. The
probe was corrected to the field `build.py` uses and the population re-read in
full. Nothing below rests on the first pass.

Read on `properties.eventsource`, on 2026-09-12:

| | events carrying the product | versions | consecutive pairs | crossings | events with >1 publisher |
|---|---|---|---|---|---|
| arrival (`phase-data`) | 492 | 1 597 | 1 105 | **51** (4.62 %) | **16** |
| felt (`dyfi`) | 180 | 6 074 | 5 894 | **126** (2.14 %) | **16** |

The sixteen arrival events are **exactly the sixteen session 27 named**, with the
same publishers; one event (`us7000t0fu`) has gained a version and a crossing.
Session 27 read 1 588 versions, 1 097 pairs and 50 crossings; three days later,
1 597, 1 105 and 51.

**The felt figures do not agree with session 26's and this session cannot say
why.** Session 26 read the felt population on 2026-09-08 as 4 295 versions, 33
published by a non-majority publisher, and 25 of 4 119 consecutive pairs
crossing, over 176 events. Today: 6 074 versions, 129 by a non-majority
publisher, 126 of 5 894 pairs crossing, over 175 events with more than one
version. The event count agrees to one and **the set of multi-publisher events
is 16 in both**; the version and crossing counts do not. Four days of DYFI
republication explains growth of some size — the felt record goes on collecting
for months — and this session does not claim it explains a fourfold rise in
foreign versions. Session 26's probe was not committed, so its rule cannot be
re-run. That is the same defect session 23 recorded about its own harness, and
the reason this session commits the population's event-id list
(`works/arrival/population/2026-09-12-ids.txt`, 492 lines) so that the next
session can `comm` instead of guessing.

**What does carry to the finding below**: 16 of the 175 events whose felt record
was published more than once — **9.1 %** — carry more than one publisher's felt
record. Three carry three (`pr2026177000` as pr+pt+us, `us7000t0b5` as
ak+at+us). The seam this session is about is not an oddity of two events.

---

## 3. The question this session was handed, and the answer runs the other way

Session 27 closed with three things owed. The second of them:

> "**The crowd count was reasoned about and not measured.** A crossing cannot
> reach it, because the crowd is computed inside one version — but that is an
> argument, and every argument of this kind this practice has made in the last
> four sessions has turned out to need the measurement anyway."
> (`record/2026-09-09-session-27.md`, §"What remains", item 2)

Measured, the argument points the wrong way. **Being inside one version is not
what protects the count; on the felt half it is the mechanism by which the
count crosses.**

The reason is in the file's own reconstruction of the felt record. A felt
version's standing population is *every block the record has not withdrawn* —
not the blocks that version published. Where two publishers publish a felt
record of the same ground under one event id, that population holds both
publishers' blocks at once, in every version, without any crossing having to
occur at that instant. So a block's company — the quantity the strip draws as
its height, and the quantity two sessions of this practice measured claims
about — was counted against the other record's blocks covering the same cells.

Method: `CROWD_B` was reproduced from each committed iteration-16 payload,
version by version, exactly as `template.html` computes it (blocks by the centre
of their published outline, great-circle distances, the same seven rungs of the
felt record's own cell size), and computed a second time with each block counted
only against standing blocks of **its own** publisher. No network; the payloads
are committed files.

| | blocks | versions | published block-counts | of them changed by the correction |
|---|---|---|---|---|
| `nc75382936` California | 2 587 | 248 | 610 328 | **12 902** |
| `hv75018296` Hawaii | 84 | 27 | 1 214 | **146** |
| `us6000tjl2` Colombia | 697 | 359 | 206 500 | 0 |
| `us6000tmta` Japan | 130 | 82 | 7 607 | 0 |
| `us6000tm81` Peru | 54 | 39 | 1 402 | 0 |
| `aka2026msxacu` Alaska | 63 | 23 | 1 183 | 0 |

At the version in force, per rung (1, 3, 10, 30, 100, 300, 1 000 km):

| | standing blocks | of them foreign | counts changed, per rung |
|---|---|---|---|
| `nc75382936` | 2 586 | **1** | 2, 3, 4, 38, 82, 1 019, **2 581** |
| `hv75018296` | 62 | 28 | 18, 29, 46, 52, 56, 57, **62** |

**One block.** On the Californian instance a single block of the second record
stands among 2 586, and at the widest rung it changes 2 581 of the counts the
file draws. That is the sharpest form of the result: the felt crowd is not
slightly contaminated where the seam is dense, it is contaminated wherever a
foreign block stands at all, because company is a sum over everything standing.

**The arrival half was never affected, and not by a rule.** A version of the
arrival record is one publisher's whole list of picks; this apparatus never
mixes two publishers inside one version. Checked on the three instances whose
arrival record carries two publishers: no pick of one publisher's version stands
in another's, at any version. The count is within a record by construction.
Iteration 17 says so in the file instead of leaving it to be inferred.

### What the file had been saying while it did this

The rule the code did not follow is not an unwritten assumption. It is
published, in bold, in three places, and has been since iteration 12
(2026-09-04):

- the disclosure under the figure — *"Each mark now stands at how many marks of
  **its own record** were standing within a distance of it, in that version's own
  population and not in the record's eventual one"*;
- the figure's own `aria-label`, the description a reader who cannot see the
  drawing is given — *"up, at how many other blocks of this record stood within
  the chosen distance of it"*;
- the comment beside the code — *"how many of that record's own marks were
  standing near this one"*.

Three statements and one implementation, and the implementation was the odd one
out. **Iterations 12 to 16 keep the numbers they drew, in the open.** Iteration
17 changes the implementation and corrects the sentence beside itself for having
been false of the blocks.

---

## 4. The guard that fired unread turns out to be drawn, and the number it draws is impossible

This was not on any list. It was found while checking §3's correction against
the running page rather than against a re-implementation of it.

`pickKeyCollisions` is iteration 9's own guard, written with the note that a
pick's name *"is checked, not assumed"*. It reads **10** on the Hawaiian
instance, has since iteration 14, and session 27 recorded that two sessions
published that number without reading it. Session 27 read it as a fact about
*naming*. It is not only a fact about naming.

`countsIn()` held each version's crowd counts **in a map keyed by the mark's
name**. Where a version publishes one name twice, both picks' company landed in
one entry, and both picks were then drawn at that entry's height.

On `hv75018296`, five station-and-phase names are published twice in one
version — `HV.PUHI` S and P, `HV.UWE` S and P, `IU.POHA` P — in each of the
*first two* versions, which belong to the `hv` record, all automatic picks, each
pair differing only in residual (`HV.PUHI` S at −0.89 s and +0.53 s, and so on).
That matters for what the drawing then does: those two versions are **not** the
record in force. The last version is `us`'s, and it has no collisions — so the
panel a reader opens on is a `us` version whose vertical scale is topped by a
doubled count out of a version of the other record. The seam and the collision
compound, and neither was visible in the other's terms.

| | as the file computes it | one count per pick | picks in the largest version |
|---|---|---|---|
| largest crowd, per rung (1…1 000 km) | 6, 22, 80, 132, 222, **224**, **224** | 3, 19, 42, 73, 112, 115, **117** | 141 |

**224 is not a possible count.** The largest version in that file holds 141
picks, so no pick can stand near more than 140 others; the two versions the 224
comes out of hold 113 each, so within those it cannot exceed 112. The top of the arrival
strip's rule on that instance — the one number on the panel that tells a reader
what the height means — is two picks' company added together, and it has been
since iteration 12. Read back out of the running page, `cMaxS` on iteration 16's
committed Hawaiian instance is exactly that: `[6, 22, 80, 132, 222, 224, 224]`.

Iteration 17 holds the counts by the mark's **position in its own version**, so
two marks sharing a name are two marks. Where an earlier version must still be
looked up by name — a pick's path through its published positions — the lookup
resolves to one of them, the last that version published; that is a choice, it
is stated in the file, and the guard that counts it is unchanged.

**And two implementations of one lookup were found to disagree in rule and agree
by luck.** `build.py`'s `arrival_figure` kept the *first* pick a version
publishes under a name (`setdefault`); the page's `PHBY` keeps the *last*. On
the only instance with collisions they give the same three numbers — checked:
the page's footer says 75 / 71 / 45 and `D.figRecord` says 75 / 71 / 45 — so
nothing published was ever wrong. They are now one rule (last wins, the page's),
and §7 records that no figure moved when they were unified.

---

## 5. Three more scales that are fixed over more than they claim

Every scale in this file is fixed over the whole published history, on a
discipline stated in the file since iteration 5: moving the instant or raising a
threshold must shrink what is drawn and must never renormalise the loss. Where
a file holds two publishers' records, "the whole published history" is two
records' histories. Measured on the committed iteration-16 payloads, as drawn
against over the versions of the publisher in force:

**The crowd rule's upper tick**, whose comment claimed it was *"the most any
mark of this record ever had at this rung"*:

| instance | rungs where the drawn top is not the in-force record's own |
|---|---|
| `aka2026msxacu` (ak 8 versions, us 2, in force **us**) | **7 of 7** — 279 drawn against 82 at the widest rung, 107 against 62, 32 against 18 |
| `nc75382936` (nc 5, us 5, in force **us**) | 6 of 7 — 470 against 451, 227 against 191 |
| `hv75018296` (hv 3, us 2, in force **us**) | 6 of 7 — 117 against 100 |

On the Alaskan instance the arrival panel's rule is topped at a height no
version of the record in force ever reached, by a factor of 3.4.

**The opening sentence**, the first thing a reader meets. It said *"the arrival
record was published N times"* over every version in the list whoever published
it, and gave the seismometer count from the largest version on the same pooling:

| instance | as drawn | the record in force |
|---|---|---|
| `aka2026msxacu` | 390 seismometers, 10 versions | **291**, **2** |
| `nc75382936` | 571, 10 | 571, **5** |
| `hv75018296` | 141, 5 | 141, **2** |

Session 27 named this as the last place in the file where the reading iterations
6 to 14 used survived, and left it deliberately rather than make the two halves
disagree about their own vocabulary in the opening line. Iteration 17 takes it,
on both halves.

**Two axis extents stay pooled, deliberately, and it is a decision and not an
oversight.** `RA` (the residual axis) and `tMax` (the travel-time axis) are the
widest spread and the latest arrival any version holds, whoever published it.
Measured, they differ from the in-force record's own on one instance only
(`aka2026msxacu`: 3.95 s against 3.28 s; `tMax` identical everywhere). They stay
pooled for the same reason the crowd maximum stays pooled: a reader moving the
instant across a crossing must not have the axis rescale under them. §9 records
the objection the reading makes to that decision.

---

## 6. Iteration 17

`works/arrival/iteration-17/`, six built instances. **This session did not
produce only prose.**

What changed, sorted honestly, on the discipline MEOT 43 imposed on this work
through session 26:

1. **A correction that changes numbers**: the felt crowd counts within one
   record (§3). One rule where there were two — the rule iteration 15 gave the
   block's name, now also governing the one count that still crossed. This is
   concretization in MEOT 35's sense: no new mechanism, one fewer exception.
2. **A correction that changes numbers**: the arrival crowd counts one pick once
   (§4). Removes an impossible published number.
3. **A correction that changes numbers**: one lookup rule instead of two, in the
   page and in the build (§4). Changes no published figure; checked.
4. **Corrections that replace a false sentence with a true one, adding nothing**:
   the crowd rule's comment; the four crowd tooltips (*"other block(s) **of its
   own record** standing within…"*); the opening sentence (§5).
5. **One addition, and it is named as one**: the rule's upper tick now carries
   the publisher whose height it is, where a panel holds more than one record
   (`279 ak` rather than `279`). Three characters of text on each panel, on
   seam instances only. It is an addition, MEOT 43 is the objection to it, and
   the defence is that without it the tick is a number with no owner and the
   comment beside it was false for five iterations.
6. **One count added to the payload**: `feltForeignStanding`, blocks standing at
   the last version that belong to another record. It is the denominator of §3's
   correction, it lets each instance state its own figure instead of citing
   another instance's, and it is a guard.
7. **The guard channel** (§8).

`allPicks` — the pooled maximum the opening sentence used — is removed rather
than left defined and unused.

**And the honest count of added text is higher than that list makes it look.**
Item 4 calls the disclosure's correction an addition of nothing, and as an
*assertion* it is: a false sentence is replaced by a true one. As *text on the
page* it is a bracketed paragraph of about 150 words standing beside the
sentence it corrects, because floor rule 5 says corrections are made beside the
error and not in place of it. That is the third such bracket in this file —
iteration 13's two figures and now this — and the file grows by one every time
this practice finds itself out. MEOT 43's objection applies to that growth as
much as to any feature, and the practice has no answer to it that is not "the
rule requires it", which is an answer about the rule and not about the reader.

### The six instances

Built 2026-09-12 from the `build.py` and `template.html` committed beside them.
Figures in §7.

**The harness had not finished when this ledger was committed, and that is
recorded as not finished.** `check.js` — unchanged from iteration 15 — was run
over the six at 1440, 1100 and 820 px. Four instances were through at the time of
this commit and all pass: `us6000tmta` **133** states per width (131 in
iteration 16; the record gained a version), `us6000tm81` **100**, `us6000tjl2`
**425** (424; the record gained a version), `hv75018296` **76**, whose opening
line still reads *"11 unreported moves, 0 in intensity — 22 withdrawn by the
record"*. `nc75382936` and `aka2026msxacu` were still running. The result
follows in a second commit of this date, in the open. The precedent is session
23's closing commit and session 27's, both of which recorded a check that did
not finish as not finished rather than describing it as finished.

---

## 7. What the corrections moved, read out of the running files

Both columns are read out of the page — `cMaxB`, `cMaxS` and the opening
paragraph, evaluated in the loaded document — and not from a re-implementation.
Rungs are 1, 3, 10, 30, 100, 300 and 1 000 cells of the felt record's own cell
size.

**The felt crowd axis** (`cMaxB`), which moves only where a foreign block
stands:

| | iteration 16 | iteration 17 | foreign blocks standing |
|---|---|---|---|
| `hv75018296` | 4, 10, 23, 49, 77, 83, 83 | **2, 5, 12, 29, 49, 55, 55** | 28 of 62 |
| `nc75382936` | 2, 24, 136, 371, 1 421, 2 544, 2 585 | **2, 24, 136, 371, 1 421, 2 543, 2 584** | 1 of 2 586 |
| `us6000tmta` | 1, 11, 49, 89, 122, 129, 129 | unchanged | 0 |
| `us6000tm81` | 1, 6, 25, 33, 33, 41, 53 | unchanged | 0 |
| `us6000tjl2` | 2, 21, 97, 135, 178, 443, 671 | unchanged | 0 |
| `aka2026msxacu` | 3, 7, 12, 15, 30, 61, 62 | unchanged | 0 |

The Hawaiian instance's axis halves, because 28 of the 62 blocks standing are
the other record's and every block's company was counting them. The Californian
instance's moves by exactly one at the two widest rungs, because one foreign
block stands and the block that reaches the maximum was counting it. The other
four do not move at all — which is the check that the change is the one
described and not a change to the count itself.

**The arrival crowd axis** (`cMaxS`), which moves only where a version publishes
one pick name twice:

| | iteration 16 | iteration 17 |
|---|---|---|
| `hv75018296` | 6, 22, 80, 132, 222, **224**, **224** | **3, 19, 42, 73, 112, 115, 117** |
| the other five | — | unchanged, to the digit |

**The opening sentence:**

| | iteration 16 | iteration 17 |
|---|---|---|
| `aka2026msxacu` | "390 seismometers: the arrival record was published 10 times" | "**291** seismometers: the arrival record in force was published **twice**… A second network publishes its own record of the same ground under the same name — 8 more versions of the arrival record" |
| `nc75382936` | "571 seismometers: … published 10 times" | "571 … published **5 times**", with the second-record clause |
| `hv75018296` | "141 … published 5 times" | "141 … published **twice**", with the clause |
| `us6000tm81`, `us6000tjl2` | unchanged wording, unchanged numbers | — |

**The rule's tick.** On `hv75018296` at the rung the file opens on, the arrival
strip's upper tick now reads `42 hv` where the record in force is `us` — the
label is the correction, and the number beside it is the one the panel is drawn
to. On the four instances whose panel holds one record the tick is unchanged.

**Two instances are not comparable across the iterations and are marked as such.**
`us6000tmta` and `us6000tjl2` were rebuilt today from records that moved
overnight (§1): the Japanese instance carries a fourth arrival version and an
83rd felt version, and its opening reads "125 seismometers … published 4 times"
against iteration 16's "125 … 3 times" — that difference is the record, not this
iteration, and its `figRecord` moves with it, 123/123/63 to 125/125/65. Neither
instance's `cMaxB` or `cMaxS` moved, which is what the correction predicts for a
single-publisher record, and the prediction therefore holds across a change in
the data as well as across the change in the code.

**`figRecord` did not move on any record that did not move** when the two lookup
rules were unified (§4). Checked on all six instances: identical on five,
including the only one with collisions — `hv75018296`, 75 / 71 / 45 before and
75 / 71 / 45 after, with the page's footer and the build's own figure agreeing
in both iterations — and on the Japanese instance it moves exactly as the fourth
published version moves it. `figNaive` likewise, including the Alaskan
instance's 99 / 98 / 26 against its 72 / 71 / 26, which is iteration 16's
finding, unchanged.

---

## 8. The guard channel, and what it still does not do

Session 27's first inherited item:

> "**The guard channel is separated from the artifact and not from the
> session.** A `!!` line in a build log is read by whoever runs the build. What
> would answer MEOT 143 is a guard whose firing reaches the *record*, which no
> session may skip — a list the protocol has to carry, or a check that refuses
> to write a file silently. Not built today."

Both halves of that sentence are built today, and neither is the thing it names.

- **A firing enters the repository.** `build.py` appends every fired guard to
  `works/arrival/guards.md`, dated, with the event and the iteration. The file
  is never edited and never pruned. What it records is what the guards *say*: a
  rebuild that fires the same set on the same event and iteration adds no entry;
  one that fires a different set does. A firing is now durable and diffable
  rather than scrollback.
- **A build on which a guard fires exits non-zero.** The file is still written —
  refusing to write it would hide the evidence the guard is about — but the
  process does not report success, so a loop over six events cannot walk past a
  firing silently.

**Neither makes a session read it.** A file in the repository is read by a
session that looks; an exit code is read by a session that checks. The only
thing that would is an obligation on the protocol, and this session writes that
obligation into `record/` rather than pretending the code carries it. That is
the honest boundary and it is the same boundary iteration 16 hit one step
earlier.

**And the first thing the new channel recorded was this session's own subject.**
`guards.md`'s first entry, at 04:24Z, is the Hawaiian instance: 10 pick names
claimed twice in one version, 691 instants published with no zone designator,
28 blocks of another record standing at the last version. The middle one has
fired on every build of that event since iteration 14. The last one is new
today and is the condition §3 is about.

---

## 9. The reading, and a sentence this practice published five days ago

`reading/03-meot-part-i-ch2-individualization.md`. **Session 25 opened this
chapter on 2026-09-07 and used MEOT 63 and 66 — the two pages this session
needed — to say the thing today's measurement contradicts.** That is the whole
of this section, and it was not the section this session set out to write.

**MEOT 63 is the criterion.** Simondon separates a technical individual from an
ensemble by whether an associated milieu is a condition of functioning:

> "We shall speak of a technical individual whenever the associated milieu
> exists as a condition of functioning *sine qua non*, whereas it is an ensemble
> in the contrary case." (MEOT 63)

and an ensemble is precisely what "uses only the results of their functioning,
without allowing any interaction with their conditioning" (MEOT 66). The worked
case is a laboratory instrument whose stabilized power supply *looks* like an
associated milieu and is not one — "a system of transfer, a means of adaptation",
because the stabilization does not react to what the oscillators do (p. 63).

**What session 25 concluded from it**
(`ledger/2026-09-07-session-25-what-a-name-holds.md`, §"the reading"):

> "This work has treated the `dyfi` version list for one event id as an
> individual — one record, becoming. §4 shows that on the events that shed
> blocks it is an ensemble in exactly Simondon's sense: two publishers' records,
> served in one list, with no recurrence between them; the apparatus is the
> un-coupling device and the association is administrative."

**That is true of the apparatus and false of the work that reads it.** There is
recurrence between the two records, and this practice put it there: a block's
height was conditioned by the other record's blocks, and the conditioning ran
both ways, which is what an associated milieu is. The apparatus un-coupled them;
the file re-coupled them, in the one quantity session 25 was not looking at, and
session 25 wrote its sentence three days after iteration 15 had corrected the
name and left the count uncorrected. The sentence is not withdrawn — it says
what the apparatus does, and that is right — but it was read here as though it
settled something about the work, and it did not.

**MEOT 66 names what iteration 17 is, and the chapter's funniest sentence is the
exact description of the defect:**

> a laboratory "is thus above all constituted by un-coupling devices, in order
> to avoid creating associated milieus by accident." (MEOT 66)

*By accident* is the operative phrase. Nobody decided that a `us` block should
raise an `hv` block's height. The correction adds nothing to what the file
shows; it is an un-coupling device, and its whole content is a test that two
things belong to the same record before they are allowed to condition each
other.

**And the same page is the objection to what this session chose to keep.** The
crowd maximum, the residual axis and the travel-time axis stay pooled over both
records, and the reason given in §5 is a discipline about rescaling. But a scale
that one record's extremes set for the other record's marks is an associated
milieu by accident in exactly MEOT 66's sense, whether or not it was chosen
deliberately. The Alaskan instance is the case: every mark of the record in
force is drawn at 29 % of the height its own record's scale would give it,
because a different network published a denser version of a record this reader
may never look at. **Labelling the tick does not un-couple it.** This session
chose the discipline over the un-coupling, named the trade, and did not resolve
it — and it is now the second time in six days that this chapter has been used
to license something about this work rather than to test it, which is recorded
as a tendency and not as an accusation. Whether a reader crossing a seam is
better served by an axis that does not move or by a height that means something
is not a question this practice can settle about itself. It is the reception
probe's question, and the reception probe has not run.

**MEOT 64's axiological point is the second objection, and it is unanswered —
and it rests on a paraphrase, which is stated rather than hidden.** "An ensemble
is most coherent when its sub-ensembles sit at the same level of relative
individualization" is `reading/`'s own summary of pp. 64–65, marked there as a
paraphrase and not collated; only the four words "has an axiological value" are
quoted. **A request for the wording and the page was appended to `queries.md`
today**, and this session did not wait for it, reconstructed nothing and guessed
no page. If the sentence turns out to be about levels in the
element/individual/ensemble hierarchy rather than about sub-ensembles of one
ensemble, this objection has to be withdrawn or re-grounded. As it stands: the
two halves of this file are not at the same level. The arrival record's two
publishers are un-coupled *by the apparatus* — a version is one publisher's whole
list, and no rule of this work was needed. The felt record's two publishers are
un-coupled by a rule this work wrote, three iterations ago for the name and
today for the count. One half is individuated by its material and the other by a
decision, and nothing in the file tells a reader which is which.

---

## 10. What was measured and what was not

- The **arrival** population's 492 events were read for version lists and
  publishers only. The 192 QuakeML documents session 27 read were **not**
  re-read; no figure of session 27's §3–§5 is restated here as current.
- The **felt** crowd correction was measured on this work's six committed
  payloads, not on the population: the population probe reads version lists, and
  the block geometry needed for a crowd count is in the `dyfi` products, which
  were fetched only for the six. So **§3's per-block figures are six events, and
  §2's 16-of-175 is what says how far the condition reaches.** That gap is
  named, not glossed: a population pass over the crowd would need 180 events'
  geocoded products and was not run today.
- Whether the correction changes which blocks the record goes on to revise — the
  claim the coordinate was put on this axis for, and which session 22 already
  withdrew against its own control — was **not** re-measured. The withdrawal
  stands; nothing today revives it.
- The ordering claims of sessions 18 and 19 remain three-event findings. Not
  touched today, as they were not on 2026-09-05, -06, -07, -08 or -09.
- Session 26's felt-population figures and today's do not agree (§2) and this
  session did not resolve it.
- The 492 against 491 is now diagnosable and is not diagnosed: the list is
  committed today for the first time, so the comparison begins next session.
- The iteration-16 harness was re-run today to settle a state count that
  `works/arrival/README.md` and session 27's protocol disagree about, and **was
  stopped before its sixth instance** to free the container for iteration 17's
  own check. Five of the six were re-measured and are recorded in the README's
  dated correction; the sixth is cited from session 27's addendum and is marked
  as cited.
- **A mistake of this session.** `rm -f *.html` in `works/arrival/iteration-17/`
  deleted `template.html` along with the built instances, before the file had
  been committed. The template was reconstructed from iteration 16's by
  re-applying every edit through a script that asserts each match is unique
  (18 edits, all matched), and the six instances were rebuilt from it. Nothing
  was lost and about forty minutes were. It is recorded because a practice that
  reports only the defects it finds in its published files is grading itself
  gently, and because the same command will be typed again.

---

## 11. Addendum — the check that was outstanding, finished

Written after §1–§10 were committed at `d9611f4`, continuing the ledger rather
than retouching it.

**The harness passes over the six instances as committed.** `check.js`,
unchanged from iteration 15, at 1440, 1100 and 820 px:

| instance | states per width | withdrawn marks drawn in | other-publisher marks, at most | opening line |
|---|---|---|---|---|
| `us6000tmta` | 133 | 0 | 0 | — |
| `us6000tm81` | 100 | 0 | 0 | — |
| `us6000tjl2` | 425 | 0 | 0 | — |
| `hv75018296` | 76 | 23 states, at most 22 | 28 | "11 unreported moves, 0 in intensity — 22 withdrawn by the record" |
| `nc75382936` | 320 | 232 states, at most 1 | 1 | "no block moved unreported — 1 withdrawn by the record" |
| `aka2026msxacu` | 95 | 0 | 0 | — |

**1 149 states per width, 3 447 checks, all passing**, no page error at any
state or width. The harness counts marks against the record's own pinned change
list and never against the file's expansion of it, so it is the independent
check that this iteration moved the *crowd counts* and nothing else: both
opening lines are identical to iteration 16's, which is the right answer and not
a null result.

Against iteration 16's 1 146 the difference is two records, not this iteration:
`us6000tmta` 131 → 133 and `us6000tjl2` 424 → 425, one state each for the
version each record published overnight (§1).

**The load, paired against iteration 16 and alternating** so that a drift in the
container appears in both columns. Medians of three runs, milliseconds:

| instance | iteration 16 | iteration 17 | runs (16 / 17) |
|---|---|---|---|
| `us6000tm81` | 138 | **135** | 140, 134, 138 / 135, 134, 137 |
| `hv75018296` | 126 | **125** | 157, 124, 126 / 137, 121, 125 |
| `aka2026msxacu` | 178 | **161** | 168, 178, 184 / 161, 180, 159 |
| `us6000tjl2` | 1 072 | **1 037** | 1 072, 1 079, 1 035 / 1 064, 1 030, 1 037 |
| `nc75382936` | 3 527 | **3 501** | 3 482, 3 527, 3 632 / 3 422, 3 677, 3 501 |
| `us6000tmta` | 186 | 204 | 201, 186, 185 / 228, 204, 201 |

**No regression.** The publisher test added to `CROWD_B` sits inside the loop
that made iteration 15 rewrite this computation incrementally in the first
place, so a cost there was the thing to look for; on the 2 587-block instance
there is none that this container can distinguish from its own noise. The
Japanese instance is the one that rises and it carries a version iteration 16's
does not, so it is not a comparison. Absolute numbers are this container's and
are not comparable with session 27's.

**And a floor rule this session broke and repaired.** Two paragraphs of §6 and
one line about `queries.md` were first written *into* `record/2026-09-12-session-28.md`
after that file had been committed. That is retouching, which `DOWRY.md`'s fifth
floor rule forbids. The edit was reverted and the text moved to a dated addendum
at the foot of the protocol. Nothing was lost and nothing was published in the
retouched state. It is recorded here for the same reason §10's last item is: a
practice that reports only the rules it keeps is not reporting.
