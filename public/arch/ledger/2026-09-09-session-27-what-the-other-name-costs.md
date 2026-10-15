# Session 27 — what the other name costs, and the seam that hid a record instead of merging two

2026-09-09. Evidence for `record/2026-09-09-session-27.md`. Every count here is
either over files committed in this repository or over public USGS data, and the
method for each is stated where it is used.

**Grounds this session actually used**, named rather than recited, under the rule
session 24 required and sessions 25 and 26 kept: the public USGS catalogue and
the `phase-data` products of 491 events, read 2026-09-09 04:10–05:05 UTC, and
the 192 published QuakeML documents of the sixteen events whose arrival record
carries more than one publisher; the `dyfi` and `phase-data` products of the six
events this work is built on, read while building;
`works/arrival/iteration-15/` — its `build.py`, `template.html`, `check.js` and
its five committed instances; `works/arrival/iteration-14/hv75018296.html`;
`reading/02-meot-part-i-ch1-concretization.md` at MEOT 35 and 43;
`reading/05-meot-part-ii-ch2-information.md` at MEOT 137, 138 and 143; the ledgers of sessions 22 and 26;
`record/2026-09-08-session-26.md`; `PREREGISTRATION.md`; `DOWRY.md`;
`CHANNEL.md`; `queries.md`; `registers/i7-virtuality-register.md` and
`registers/i7b-passio-register.md`.
**`queries.md` was read and still carries no answer** to either request of
2026-09-06, now standing for the fourth session; nothing here rests on one, no
wording was reconstructed and no page guessed.

---

## 1. The standing environment check: nothing moved

Read on the conventions of `works/arrival/iteration-15/build.py`, by building
each instance again today and comparing the resulting `counts` object with the
one committed yesterday.

| | arrival versions | felt versions | blocks ever | responses now | appeared / changed / disappeared / returned |
|---|---|---|---|---|---|
| `us6000tmta` Japan M 5.8 | 3 | 82 | 130 | 152 | 130 / 22 / 0 / 0 |
| `us6000tm81` Peru M 6.7 | 3 | 39 | 54 | 73 | 54 / 10 / 0 / 0 |
| `us6000tjl2` Colombia M 7.4 | 3 | 359 | 697 | 1 205 | 697 / 340 / 0 / 0 |
| `hv75018296` Hawaii M 5.2 | 5 | 27 | 84 | 66 | 84 / 14 / 22 / 0 |
| `nc75382936` California M 5.6 | 10 | 248 | 2 587 | 5 014 | 2 588 / 1 438 / 2 / 1 |
| `aka2026msxacu` Alaska M 5.3 *(new today)* | 10 | 23 | 63 | 99 | 63 / 18 / 0 / 0 |

**Not one of the five inherited records moved**, and this is the largest set of
which a session has been able to say it: session 24 said the same of the three
events this work then held, and sessions 25 and 26 each found records moving
under them. Every count that iteration 15 published yesterday is reproduced today
to the digit — the comparison is mechanical, between the `counts` object of each
committed iteration-15 file and of the iteration-16 file built today, and the
only differences anywhere are the seven fields iteration 16 adds. On the
Californian instance the whole payload was compared as well: 248 felt versions,
2 587 blocks, 5 014 responses, 10 arrival versions, in both.

**One figure of session 26 does not agree with session 26's own file, and it is
not the record.** Its §1 table gives the Californian instance 5 013 responses;
the file iteration 15 built and committed that same day says 5 014, as does
today's build of the same event. That table was computed from the population
dump and the file from the build, and the two implementations of "responses at
the last version" differ by one. It joins the one-block Hawaiian discrepancy
session 26 itself recorded and left standing; like that one it is left standing
rather than resolved by picking a side. The two sets of figures are not
comparable in general — session 26's table gives Hawaii 56 blocks where the
build gives 84 — so today's check is file against file and not table against
build.

**The arrival record did move, across the population.** Session 26 read 1 580
`phase-data` versions in 1 089 consecutive pairs with 49 crossings; today the
same 491 events carry **1 588 versions in 1 097 pairs with 50 crossings**, on
the same 16 events. Eight versions and one crossing in twenty-four hours.

The 176-event felt population was **not** re-read today. Nothing below rests on
it, and no figure of session 26's §3–§5 is restated here as current.

---

## 2. The question this session was handed

Session 26 closed with three things owed to the next session. The first:

> "**The arrival record's seam has been counted and not examined.** 49 of 1 089
> consecutive pairs cross publishers, on 16 events — seven times the felt
> record's rate — and this session established only that session 22's finding
> does not rest on them. What a crossing does to the *pick's* name, which
> iteration 9 built and iterations 9 to 15 rely on, is unchecked."
> (`record/2026-09-08-session-26.md`, §"What remains", item 2)

The pick's name is `(network.station, phase)` — `build.py`'s `pick_key`, added by
iteration 9 with the note that it "is checked, not assumed". The question is
whether that name means the same thing on both sides of a publisher crossing,
the way session 26 found the block's name does not.

**The population is the one sessions 22, 23, 25 and 26 fixed**: every catalogue
event with M ≥ 5.0 whose origin falls in
[2026-06-01T00:00Z, 2026-08-15T00:00Z) — 491 events today, as sessions 23, 25
and 26 found. Nothing was sampled. Every published QuakeML of the sixteen
multi-publisher events was read whole — 192 documents — with the same
arrival/pick join, the same drop of picks carrying no published residual, and
the same name as `works/arrival/iteration-15/build.py`.

---

## 3. The answer: the pick's name does not survive a crossing at all

176 consecutive pairs of published versions on those sixteen events: **50 cross
publishers, 126 do not.** The same measurement on both.

| | crossings (n = 50) | within one publisher (n = 126) |
|---|---|---|
| median share of the earlier version's names the later one still carries | **0.000** | **1.000** |
| mean of that share | 0.008 | 0.995 |
| best case | 0.133 | 1.000 |
| names dropped | **8 037 of 8 097** | 118 of 22 468 |
| names added | 8 784 | 1 018 |
| names carried through | **60** | 22 350 |
| of those, published at a different arrival instant | **60 of 60** | 474 of 22 350 |
| median share of *stations* still carried | 0.354 | 1.000 |

**Thirteen of the sixteen events lose every single pick name at every crossing.**

| event | M | versions | publishers | crossings | names dropped at them | stations in common (median) |
|---|---|---|---|---|---|---|
| `us7000subg` | 5.0 | 29 | ak 26, us 3 | 1 | 171 of 171 | 0.273 |
| `us7000t2wx` | 5.1 | 26 | ak 23, us 3 | 2 | 202 of 217 | 0.385 |
| `us7000t3fm` | 5.8 | 19 | ak 16, us 3 | 3 | 422 of 422 | 0.227 |
| `us7000t0b5` | 5.2 | 16 | ak 14, us 2 | 3 | 551 of 551 | 0.281 |
| `aka2026nyxoap` | 5.2 | 12 | ak 8, us 4 | 5 | 1 036 of 1 036 | 0.283 |
| `nc75370186` | 5.1 | 11 | nc 7, us 4 | 5 | 924 of 924 | 0.463 |
| `us7000ssnv` | 5.0 | 11 | ak 6, us 5 | 2 | 244 of 244 | 0.357 |
| `aka2026msxacu` | 5.3 | 10 | ak 8, us 2 | 3 | 595 of 637 | 0.343 |
| `aka2026powmkf` | 5.6 | 10 | ak 8, us 2 | 3 | 684 of 687 | 0.330 |
| `nc75382936` | 5.6 | 10 | nc 5, us 5 | 5 | 1 215 of 1 215 | 0.422 |
| `us7000t0fu` | 5.4 | 10 | ak 8, us 2 | 3 | 395 of 395 | 0.375 |
| `aka2026ovufno` | 5.0 | 8 | ak 6, us 2 | 4 | 698 of 698 | 0.414 |
| `tx2026ojlaky` | 5.0 | 7 | tx 3, us 4 | 4 | 247 of 247 | 0.682 |
| `hv75018296` | 5.2 | 5 | hv 3, us 2 | 3 | 320 of 320 | 0.500 |
| `us7000sq93` | 5.7 | 5 | nc 1, us 4 | 2 | 198 of 198 | 0.555 |
| `pr2026177000` | 5.0 | 3 | pr 1, us 2 | 2 | 135 of 135 | 0.553 |

---

## 4. Why, and it is published in the record itself

Two reasons, both readable in the data and neither invented here.

**The phase label is not a shared vocabulary.** Over the 192 versions:

| publisher | picks | phase labels published |
|---|---|---|
| `ak` | 21 797 | P 18 823, S 2 974 |
| `nc` | 3 247 | P 3 205, S 42 |
| `hv` | 344 | P 195, S 149 |
| `tx` | 138 | P 75, S 63 |
| `pr` | 41 | P 22, S 19 |
| `us` | 8 537 | P 3 681, **Pn 3 217, Pg 968, Sn 312, Sg 283**, PKPdf 47, PKPbc 25, pP 2, PKPpre 1, Sb 1 |

Every regional network in this population publishes exactly two labels. The
national one publishes ten, and the four it uses for the near field — `Pn`,
`Pg`, `Sn`, `Sg` — are the labels it gives precisely those stations a regional
network also carries. So the stations the two records share are the stations
whose labels disagree.

**And the station sets barely overlap either.** The regional records are dense
and local (`ak` reads AV 14 154 and AK 6 963; `nc` reads NC 1 452 and BK 1 293);
`us` reads a global set (AK 1 084, BK 914, NC 895, AV 852, IM 672, IU 670, …).
The median crossing shares about a third of its stations.

Dropping the phase label from the name does not rescue it: keyed by station
alone the median survival at a crossing is 0.354, keyed by station and the first
letter of the phase, 0.368. Neither is a name; both are a different measurement.

---

## 5. So the seam does not corrupt this work's arrival arithmetic — it truncates it

This is the opposite of what session 26 found on the felt half, and the reason
is the same fact seen from the other side.

- A **block's** name is the rounded centre of a published outline. That is
  geometry, computed the same way by both publishers, so it *does* match across
  a crossing — and the old rule read the second record as revising the first.
  That produced 90.8 % of the withdrawals iteration 14 published.
- A **pick's** name is each publisher's own vocabulary. It does not match across
  a crossing, so the old rule found no predecessor at all — and the earlier
  record silently stopped counting.

Neither is right, and only one of them puts a false number in a file. **What the
pick's name puts there instead is a false sentence.** Iteration 15's footer
reads: *"Of the N pick(s) standing now that an earlier of the arrival record's
M version(s) also published …"* — where M counts versions of a record those
picks were never in.

**Every arrival figure in the five committed instances of iteration 15 is
correct.** Reproduced here at every version in force, under both readings:

| instance | arrival versions | publishers | crossings | names surviving a crossing | versions where the two readings differ |
|---|---|---|---|---|---|
| `us6000tmta` | 3 | us | 0 | — | 0 of 3 |
| `us6000tm81` | 3 | us | 0 | — | 0 of 3 |
| `us6000tjl2` | 3 | us | 0 | — | 0 of 3 |
| `hv75018296` | 5 | hv 3, us 2 | 3 | **0** | **0 of 5** |
| `nc75382936` | 10 | nc 5, us 5 | 5 | **0** | **0 of 10** |

**On the Californian instance the two halves do not even have the same home
record.** Its felt record's majority publisher is `nc/75382936`; its arrival
record's is `us/6000t7uu`, five versions of ten. One event id, two products, two
different records in the majority — which no session had said, and which this
work has been drawing as one thing since its sixth iteration.

**And adjacency is not what the rule uses**, so adjacency is not what was
checked. `publishedBefore` scans *every* earlier version, not the one before, so
the question is whether a name is ever shared between two versions of different
publishers at any distance. Over the sixteen events: **641 such name-pairs, on
the same three events and no others.** The two seam instances share **none**, at
any distance — which is why the figures above are equal everywhere a pick's
history is used, and not merely equal in the footer.

Not one name survives any of the eight crossings on the two seam instances, so
there was nothing for the old rule to mis-join. **This is the first seam check in
three sessions that leaves a published figure standing**, and it is recorded as
what it is: luck about which events this work happened to build on, not a
property of the rule. Sessions 25 and 26 each found the first thing they looked
at outside the record to be wrong; today's did not.

---

## 6. Where the name does survive, it survives into a falsehood

**60 names survive a crossing in the whole population, on three events, and all
60 publish a different arrival instant.**

| event | crossing | names surviving | at a different instant |
|---|---|---|---|
| `aka2026msxacu` | v7 `us`→`ak` | 8 | 8 |
| `aka2026msxacu` | v9 `ak`→`us` | 34 | 34 |
| `aka2026powmkf` | v2 `ak`→`us` | 3 | 3 |
| `us7000t2wx` | v1 `us`→`ak` | 6 | 6 |
| `us7000t2wx` | v24 `ak`→`us` | 9 | 9 |

A different published arrival instant is exactly the condition under which this
work draws its `repick` tail, whose tooltip reads *"this station published a
different arrival instant, so the pick itself was remade"*. **None of the sixty
was remade.** Two publishers hold two readings of one station, and the list
alternates between them.

**Four of them are a round trip.** On `us7000t2wx`, `AK.G19K`, `AK.J19K`,
`AK.L22K` and `AV.STLK` are published by `us` at one instant, by `ak` at another
for twenty-three consecutive versions, and by `us` at the first instant again:

| station | v0 `us` | v1–v23 `ak` | v24–v25 `us` |
|---|---|---|---|
| `AK.G19K` | 249.670 s | 250.730 s | 249.670 s |
| `AK.J19K` | 237.300 s | 237.210 s | 237.300 s |
| `AK.L22K` | 248.420 s | 249.010 s | 248.420 s |
| `AV.STLK` | 237.940 s | 240.610 s | 237.940 s |

(seconds from the origin instant, which is fixed and belongs to no version.)
Read as one list, that is a station remaking its own pick and then unremaking
it. Neither happened.

**And this work cannot draw the event that shows its own defect best.**
`us7000t2wx` is M 5.1, 93 km SSE of Adak, Alaska, and it has **no `dyfi`
product at all** — nobody was there to feel it. The work needs both halves, so
the clearest case in the population is unbuildable by it. That is recorded, not
worked around: no instance was built from a half.

---

## 7. A check that fired in two published files, and no session read it

`pickKeyCollisions` is iteration 9's own guard: two arrivals in one version
claiming one name. Every protocol since has repeated iteration 9's line, *"on
the two work events it is 0 and 0"*.

**On the Hawaiian instance it is 10**, and it has been in the committed file
since iteration 14:

    $ grep -o '"pickKeyCollisions":[0-9]*' works/arrival/iteration-14/hv75018296.html
    "pickKeyCollisions":10
    $ grep -o '"pickKeyCollisions":[0-9]*' works/arrival/iteration-15/hv75018296.html
    "pickKeyCollisions":10

The ten are five names in each of the first two `hv` versions: `HV.PUHI` P and
S, `HV.UWE` P and S, and `IU.POHA` P — each published twice in one version.
Iteration 15's own footer prints the number to the reader. **The instrument
worked, the file published its result, and the practice did not read it for two
sessions.** It is not a wrong number anywhere; it is a guard that fired
unattended, which is the failure mode `I1` exists to catch and which `I1` did
not catch, because the number was inside a work and not inside the record.

---

## 8. A correction to session 26, in its favour and against its wording

Session 26 wrote, checking session 22's 84-event finding:

> "Of the 400 revisions in it, **142 re-pick something** … and **5 of those 142
> cross publishers**, on 5 events."

Reconstructed today from session 22's own stated rule, the tested population is
**84 events** again (486 `phase-data` versions today against session 26's 484
and session 22's 475; 402 revisions). It contains **50 crossings** — every
crossing in the whole population falls inside it — and of those, exactly **five**
share any pick name at all, which is the only way session 22's test could have
measured anything at a crossing: `aka2026msxacu` v7 (early) and v9 (late),
`aka2026powmkf` v2 (early), `us7000t2wx` v1 (early) and v24 (late). **Three
early and two late, matching session 26's table exactly.**

**They stand on three events, not five.** Session 26's count is right and its
place is wrong; the correction makes its conclusion slightly stronger, since
five revisions confined to three events can carry even less than five spread
over five. Corrected here, beside itself, as the floor rules require. Session
26's figures are not retouched.

---

## 9. What iteration 16 changes, and what it costs

`works/arrival/iteration-16/`, six built instances.

**The change is one rule applied twice instead of two rules.** A pick is now
named by the record that published it together with the station code and phase
label that record publishes — the rule iteration 15 gave the block — and a
version of the arrival record is a revision only of the previous version of its
own publisher. `read_phase_version` carries `src`, in the same shape the felt
half has carried since iteration 14. Nothing is filtered: the other record's
versions stay in the list, in the timeline, and in the reading.

**What that is worth, said by the file and not asserted:** both readings are
computed inside every build, at every version in force, and the number of
versions where they differ travels into the file. On the five inherited
instances it is 0 everywhere, and the whole `counts` object of each is
identical to iteration 15's but for the seven fields added.

**Four things the file now says that it could not say before.**

1. The footer names the record: *"an earlier version **of their own record** …
   (K of this file's N arrival versions; the other N−K belong to another
   record)"*, and where a second record exists it prints what the old rule
   would have said, and at how many versions the two disagree.
2. A crossing is drawn on the publication timeline — a dashed mark, with the
   publisher and the crossing in the tooltip — where before it was an
   unexplained collapse in the swarm.
3. The readout of the instant no longer says *"moving the epicentre by X km"* at
   a crossing. It says the other record was served, and how far apart the two
   records' solutions stand, and that nothing moved between them. The old
   sentence was false wherever a crossing fell and the two solutions differed —
   read back out of the built Hawaiian file, at all three of its crossings — and
   it is the same false sentence iteration 15 fixed for the felt half and left
   standing here.
4. The name paragraph states the count of names that survive a crossing and how
   many of those are at a different instant — the count that would be drawn as
   a remade pick and is not.

**A small thing the crossing made visible, and it is not corrected.** At the
Hawaiian crossings the file now prints the two records' depths side by side, and
one of them reads **7.19999980926514 km**. That is not this pipeline's
arithmetic: it is the string the Hawaiian network publishes in its
`phase-data` properties, a float32 artifact of 7.2, and the other four versions
of the same event publish `10` and `10.73`. This work's rule is that a value
stands as its record published it, so it stands. It is recorded here because a
reader will take it for noise from the drawing, and it is not.

**Which of these is concretization in MEOT 35's sense, and which are additions.**
MEOT 35: *"Over-determination of the system of structures within the regime of
their functioning makes the technical object more concrete by stabilizing its
functioning without adding a new structure."* Sorted honestly, the five changes
in this iteration are not of one kind:

- **One is concretization.** The pick's name and the block's name are now one
  rule instead of two. The file carries one fewer way of being wrong and no new
  mechanism; nothing was added to make it so.
- **One is a correction and adds nothing.** The readout at a crossing said
  something false and now says something true, in the same place, at the same
  length.
- **Three are additions.** The footer gains a second reading and a disagreement
  count; the name paragraph gains the surviving-name count; the timeline gains a
  mark and a label. Each is defensible on its own, and that is precisely the
  failure mode MEOT 43 names — *"minor improvements entertain a false
  consciousness of a continuous progress of technical objects, diminishing the
  value and feeling of urgency for essential transformations"*. **It stands
  against them and is not answered today**, and the essential transformation they
  stand in for is still I6, which no one has run.

**One thing was deliberately not fixed.** The opening sentence still says *"the
arrival record was published N times"* and *"their record was published M
times"*, counting all publishers' versions as one record on both halves.
Iteration 15 left it that way for the felt half; fixing only the arrival half
would make the two halves disagree about their own vocabulary in the one
sentence a reader meets first. It is named as undone rather than half-done.

---

## 10. The sixth instance: `aka2026msxacu`, where the two readings differ

M 5.3, 35 km SSW of Cordova, Alaska, 2026-06-29. Ten published versions of the
arrival record — `ak` 8, `us` 2, three crossings — and 23 versions of the felt
record, all `ak`, 63 blocks, 99 responses. It was chosen because it carries 42
of the 60 names that survive a crossing anywhere in the population: it is the
only event in this work's reach where the rule iteration 16 replaces produces a
different figure in a built file.

    the file's arrival figure, read as the records the list contains and read as
    one list, at each of the 10 version(s) in force: 3 disagreement(s)
      v7: as its own record [164, 163, 155], as one list [172, 171, 155]
      v8: as its own record [390, 163, 155], as one list [390, 171, 155]
      v9: as its own record  [72,  71,  26], as one list  [99,  98,  26]

Read at its last version, iteration 15's rule would have this file say **99**
picks standing now had a predecessor and **98** of them were published at a
different residual. Read as the records the list contains, it is **72** and
**71**: twenty-seven picks credited with a history they do not have, and
twenty-seven movements that are two publishers disagreeing. The instance is
built and committed with both numbers in it.

---

## 10a. The load, measured before anything else, and the harness

Session 26 required of any later session that builds a new instance that it
*"measure the load before it measures anything else"*. Measured with a
Playwright-driven Chromium at 1440 px, timing from navigation to the first
child of `#app`:

| file | size | load | page errors |
|---|---|---|---|
| `aka2026msxacu.html` *(new)* | 407 KB | **421 ms** | 0 |
| `hv75018296.html` | 207 KB | 250 ms | 0 |
| `us6000tmta.html` | 188 KB | 253 ms | 0 |
| `us6000tm81.html` | 193 KB | 195 ms | 0 |
| `us6000tjl2.html` | 290 KB | 1 462 ms | 0 |
| `nc75382936.html` | 917 KB | 4 613 ms (median of 6) | 0 |

**No regression against iteration 15**, and the first reading said otherwise:
one run put iteration 16's Californian file at 7 279 ms against iteration 15's
5 543 ms, a 31 % gap. Six further runs in both orders show it was the order and
not the file — medians **4 613 ms** for iteration 16 and **4 492 ms** for
iteration 15, against a run-to-run spread of 4 438 to 6 015 ms on the same
file. The container is slower than the one session 26 measured 3 255 ms on, so
the absolute numbers are not comparable across sessions and only the paired
comparison is used.

**The committed harness passes**, unchanged from iteration 15, at 1440, 1100 and
820 px: 131 + 100 + 424 + 76 + 95 on the five smaller instances and 320 on the
Californian one = **1 146 states per width, 3 438 checks, all passing**, with the
Hawaiian instance's opening line reading *"11 unreported moves, 0 in intensity —
22 withdrawn by the record"* as iteration 15 corrected it.

**That run is over the six instances as they stood before the last change of the
session, and the re-run did not finish.** After it, the crossing readout was
reworded a second time — it now prints how far apart the two records' solutions
stand rather than what "differs" between them — and every instance had to be
rebuilt. All six were rebuilt from the `build.py` and `template.html` committed
beside them, and the harness run over the rebuilt six was still running when this
ledger was committed; it follows in a second commit of this date. The load
figures above are from the previous build of the same six and are not re-measured
here. Session 23's closing commit is the precedent: a check that did not finish
is recorded as not finished, not described as finished.

**And the rebuild found a defect in this iteration's own new code.** `phase_main`
— the arrival record's majority publisher — is `max(set(srcs), key=srcs.count)`,
which is undefined on a tie. The Californian instance ties at five versions
each, and two builds of an unchanged record named `us/6000t7uu` and then
`nc/75382936`. The field reaches the `counts` object and no drawing, so nothing a
reader sees turns on it, but it is a published number that is not a function of
the record, and it was written today. Recorded here rather than patched out of
sight; the same construct has stood on the felt half since iteration 14, where no
instance has tied yet.

---

## 11. The reading, and the one change today that came out of it

`reading/05-meot-part-ii-ch2-information.md`, written 2026-08-22 and **cited by
no session of this window** until today.

**MEOT 136–138 describes the apparatus this work reads, and not as a metaphor.**

> "Machine memory triumphs in multiplicity and disorder; human memory triumphs
> in the unity of forms and in order." (MEOT 137)

> "in man and more generally in the living being *content becomes coding*,
> whereas in the machine coding and content remain separate as condition and
> conditioned." (MEOT 138)

The version list is machine memory in exactly that sense: it preserves every
version ever published under one event id **without selecting**, and it keeps
who published a version (the coding) separate from what the version says (the
content). Every iteration of this work to the fifteenth read the content and
threw the coding away — for the arrival half, all of it. The seam is not a fault
in the apparatus; it is what an unselecting memory looks like when something
reads it as though it had selected.

**MEOT 142–143 is the objection this session earned, and it is the sharpest one
available against §7.** Simondon's Watt governor fails because its feedback
travels through the same shaft that carries the motive power, so the engine must
already have slowed before regulation can act:

> "It is this lack of distinction between the energy channel and the information
> channel that marks the thermodynamic age, and constitutes the limit of the
> individualization of thermal engines." (MEOT 143)

**Every check this work has ever written travels in the same channel as the
work**: it is printed into the file it checks. That is why iteration 9's
pick-name guard could fire on the Hawaiian instance, publish the number 10 to
every reader of that file, and go unread by this practice for two sessions. The
guard was not weak; it was on the wrong channel.

So iteration 16 separates them, in the smallest way that is not decoration: the
build now ends by listing every guard that fired, on its own lines, marked
`!!`, where the build is read rather than where the work is. On the six
instances built today:

| instance | guards that fired |
|---|---|
| `us6000tmta` | none |
| `us6000tm81` | none |
| `us6000tjl2` | none |
| `hv75018296` | 10 pick names claimed twice in one version; 691 instants published with no zone designator |
| `nc75382936` | none |
| `aka2026msxacu` | 3 versions where the two readings of the arrival figure differ |

This is the one change in iteration 16 that came from the reading and not from
the data, and it does nothing for a reader of the work — which is the honest
description of it. **It also does not solve the problem it names.** A line in a
build log is read only by whoever runs the build; the channel is separated from
the artifact but not from the session that happens to look. What would separate
it properly is a guard whose firing reaches the *record*, which no session can
skip. That is not built today and is named as undone.

---

## 12. What was measured and what was not

- The felt record's population of 176 events was **not** re-read; only the
  arrival record's 491.
- Whether a crossing disturbs the **crowd** count — how many picks stand within
  a chosen distance of another — was not examined. The crowd is computed inside
  one version, so no crossing can reach it, but that was reasoned and not
  measured.
- The ordering claims of sessions 18 and 19 remain three-event findings; they
  were not touched today, as they were not on 2026-09-05, -06, -07 or -08.
- The 490/491 discrepancy between sessions 22 and 23, and session 26's one-block
  Hawaiian discrepancy, stand unexplained. Today's catalogue returns 491.

---

## 13. Addendum — the check that was outstanding, finished

Written after §1–§12 were committed at `6525c5f`, continuing the ledger rather
than retouching it.

**The harness passes over the six instances as committed.** 131 + 100 + 424 +
76 + 95 + 320 = **1 146 states per width at 1440, 1100 and 820 px — 3 438 checks,
all passing.** That is the figure §10a already carried, now established over the
rebuilt files instead of over the ones that preceded them.

**The `phase_main` tie is fixed** (`65cc2a4`), and what the fix moved was
measured field by field rather than asserted: five of six instances rebuild
byte-identical, and `nc75382936.html` differs in exactly two fields of its
payload — `counts.phaseSrc` `nc/75382936` → `us/6000t7uu`, `counts.phaseMainStream`
`0` → `1` — the file otherwise identical to the byte, 939 858 of them.

**The load, re-measured on the final files**: 245 ms (`aka2026msxacu`), 165
(`hv75018296`), 264 (`us6000tmta`), 182 (`us6000tm81`), 1 494 (`us6000tjl2`),
5 007 (`nc75382936`), no page errors. All inside the run-to-run spread this
container shows on one unchanged file, so §10a's paired comparison against
iteration 15 stands.
