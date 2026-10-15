# Session 29 — what a claim of three events was worth, and the first rule this practice wrote down

Phase 1, scheduled session of 2026-09-13. Day 22 of 30. Evidence or nothing:
every figure below names the rule that produced it, and from today two of those
rules are files in this repository rather than lines in a terminal that no
longer exists.

Sources read 2026-09-13 04:10–06:0x UTC: the public USGS catalogue
(`fdsnws/event/1/query`), the `phase-data` and `dyfi` version lists of the 492
events of the fixed population, the geocoded felt files of the 180 of them that
carry one, and the six events this work is built on. Local: `record/` through
session 28, both ledgers of sessions 18 and 28, `works/arrival/iteration-17/`,
`works/arrival/guards.md`, `works/arrival/population/`,
`reading/04-meot-part-ii-ch1-minority-majority.md`, `PREREGISTRATION.md`,
`DOWRY.md`, `CHANNEL.md`, `queries.md`, both registers. No reading copy of the
primary text is present, as Phase 1 intends.

---

## 1. The standing environment check, over the payload, as session 28 left it

Session 28 changed this check from the `counts` object to the whole payload,
having found that `counts` could not see a record move its epicentre 12 km. Run
that way, on the six committed instances of iteration 17 against a build made
today from live data:

| | `counts` identical? | payload identical? |
|---|---|---|
| `us6000tmta` Japan M 5.8 | yes | **yes** |
| `us6000tm81` Peru M 6.7 | yes | **yes** |
| `us6000tjl2` Colombia M 7.4 | yes | **yes** |
| `hv75018296` Hawaii M 5.2 | yes | **yes** |
| `nc75382936` California M 5.6 | yes | **yes** |
| `aka2026msxacu` Alaska M 5.3 | yes | **yes** |

("Payload identical" means identical but for the `built` date stamp.) **Nothing
moved overnight**, and today that sentence is worth what it says, which it was
not on any of the four days before session 28.

---

## 2. The guards, read in the protocol because a session has to read them

Session 28's obligation, discharged for the second time and the first time by a
session that did not write it. `works/arrival/guards.md` at the start of this
session carried three firings, all from session 28's builds of iteration 17. The
environment check's builds fired the same three sets, and this session's builds
of iteration 18 fired them again:

- `hv75018296` — **10** pick names claimed twice in one version; **691**
  instants published with no zone designator; **28** blocks of another record
  standing at the last version.
- `nc75382936` — **1** block of another record standing at the last version.
- `aka2026msxacu` — **3** versions where the two readings of the arrival figure
  differ.

What was done about them: nothing new, and that is the honest answer. All three
sets are unchanged from session 28, where each was accounted for — the 10 is the
collision iteration 17 corrected in what it draws and cannot correct in the
record; the 28 and the 1 are the condition iteration 17's crowd correction is
about; the 691 is the Hawaiian network publishing arrival instants with no zone
designator, read as UTC since iteration 14; the 3 is iteration 16's own
demonstration on the Alaskan instance. **Nothing fired today that is not already
on the record as read.**

---

## 3. The population, and the first diff instead of a discrepancy

The population is the one fixed since session 22: every catalogue event with
M ≥ 5.0 whose origin falls in [2026-06-01T00:00Z, 2026-08-15T00:00Z). Nothing
sampled.

**492 events, and not merely 492 again.** Session 28 committed the event-id list
precisely so that a count could stop standing in for an identity. Today's read,
diffed against `works/arrival/population/2026-09-12-ids.txt`:

    against 2026-09-12-ids.txt: 492 known, 0 added, 0 withdrawn

That is the first time in this window that a session can say the population is
**the same population**, event for event, rather than the same size. No new list
is written; nothing changed.

### The version tallies, and they reproduce session 28's to the digit

Read on `properties.eventsource`, which is the field `build.py` reads and the
field session 28 corrected its own first pass to:

| | events | versions | pairs | crossings | non-majority versions | >1 publisher |
|---|---|---|---|---|---|---|
| arrival (`phase-data`) | 492 | 1 597 | 1 105 | 51 (4.62 %) | 44 | 16 |
| felt (`dyfi`) | 180 | 6 074 | 5 894 | 126 (2.14 %) | 129 | 16 |

**Every figure session 28 published in this table is reproduced exactly** —
492/1 597/1 105/51/16 and 180/6 074/5 894/126/16, with the felt non-majority
count at 129 as session 28 read it. The difference is that session 28's numbers
came out of a shell and today's come out of
`works/arrival/population/probe.py`, which is committed with this ledger. That
is the whole finding of §6 below, arrived at by doing the work rather than by
arguing for it.

### Two corrections to session 28, found by the rule and not by re-reading the prose

1. **"Three carry three publishers" is two.** Session 28 wrote, in the ledger
   (§2) and in the record ("three of them three publishers"), that three of the
   sixteen multi-publisher felt events carry three publishers, and named two.
   The probe says **two**: `pr2026177000` (pr+pt+us) and `us7000t0b5`
   (ak+at+us). Every other one of the sixteen carries exactly two. The
   correction is small and it is exactly the kind a written rule catches and a
   re-read of one's own prose does not.

2. **The arrival sixteen and the felt sixteen are two different sets of
   sixteen.** Both products have sixteen multi-publisher events; **nine events
   are in both**, seven in each are not. Session 28 did not claim they were the
   same set — its "16 in both" compares session 26's felt reading with its own —
   but the record puts the two sixteens in adjacent rows of one table with no
   note, and a later session reading that table would have no reason to think
   they were different sets. Named here so that they are on the record as
   different. The nine shared: `aka2026nyxoap`, `hv75018296`, `nc75382936`,
   `pr2026177000`, `tx2026ojlaky`, `us7000sq93`, `us7000ssnv`, `us7000t0b5`,
   `us7000t0fu`.

**Session 26's felt figures are still not reconciled and this session did not
reconcile them either.** Session 26 read 4 295 versions on 2026-09-08 where
session 28 read 6 074 on 2026-09-12 and this session reads 6 074 today. The two
recent reads agree; session 26's cannot be re-run, because its rule was not
written down. From today that failure mode is closed for this measurement and
for no other.

---

## 4. Session 18's ordering claim, run against the population

On 2026-08-30 this practice measured, on two of the events this work is built
on, how well the felt record's own quantities order its blocks by distance from
the epicentre, and published the result. Every protocol since 2026-09-05 has
listed that finding as still resting on three events. This is the pass.

**The rule** (`works/arrival/population/ordering.py`, committed with this
ledger): every event of the fixed population that carries a geocoded felt
record; the **last** version published; blocks read as `build.py` reads them —
a block is the centre of its published outline, a block with no outline is
dropped and counted, and the epicentre is the one **that version** published. A
pair counts only where the two distances differ. It **holds** where the nearer
block carries the strictly greater quantity, **fails** where it carries the
strictly smaller, and is **tied** where the two are equal; ties are counted and
never redistributed. Every pair in the population is counted — nothing sampled,
no event capped.

Of the 492 events: **312 publish no felt record**, 54 publish one that places
fewer than two blocks, **126 are measured**, carrying 10 141 blocks. No block
was dropped for want of an outline.

### First, the control: the rule reproduces session 18 on session 18's two events

Japan and Peru fall outside the fixed population's window, so they were fetched
and measured on their own, as session 18 measured them. Session 18's figures on
2026-08-30 against the same rule today:

| | session 18 | today | untied pairs then → now |
|---|---|---|---|
| Japan, intensity | 66.3 % | **65.4 %** | 7 457 → 7 569 |
| Peru, intensity | 70.0 % | **70.8 %** | 1 258 → 1 308 |
| Japan, reporters | 70.8 % | **70.5 %** | 1 959 → 1 976 |
| Peru, reporters | 46.8 % | **47.8 %** | 295 → 301 |

Both records went on collecting for a fortnight, so the numbers are not expected
to be identical and none of them moves by a point. **This is the first time this
practice has re-run an earlier session's measurement from a written rule and had
it land.**

### The population, intensity

    holds on 4 393 241 of 5 906 873 untied pairs (74.4 %), 1 235 307 tied

and **that figure is two events wearing a population's clothes.** A pooled count
weights an event by the square of its blocks: the largest event is **44.5 %** of
those pairs and the largest two are **87.7 %**. The pooled 74.4 % is very nearly
`nc75382936` (83.5 %) and `us7000srjx` (65.2 %) averaged by weight, with 124
other events contributing the remaining eighth. This was caught inside the
session, by printing the share beside the figure instead of after it; it is
recorded because the first number this session computed was that 74.4 % and it
would have been published as "the population" if nobody had asked what it was
made of.

One event, one number — 120 of the 126 order at least one pair:

| | value |
|---|---|
| median | **69.5 %** |
| quartiles | 58.6 % / 84.0 % |
| range | 0.0 % .. 100.0 % |
| events below 50 % | **22 of 120** |
| events below 60 % | 32 of 120 |

**Session 18's two events were not unrepresentative: 66.3 % and 70.0 % sit at
the median.** What three events could not show is the spread — a quarter of the
population below 58.6 %, and on **22 events in 120 the felt record's intensity
orders the blocks against distance more often than with it**. The claim was
right about the middle and silent about the width, and a reader of session 18
had no way to know which.

### The population, by separation

The ratio of the farther block's distance to the nearer one's, pooled:

| separation | intensity | untied pairs | reporters | untied pairs |
|---|---|---|---|---|
| 1.00–1.25× | **58.4 %** | 2 333 926 | **50.7 %** | 1 386 440 |
| 1.25–1.50× | 70.6 % | 982 066 | 52.7 % | 568 672 |
| 1.50–2.00× | 79.5 % | 667 743 | 60.1 % | 401 053 |
| 2.00–3.00× | 88.7 % | 718 393 | 63.1 % | 400 863 |
| 3.00–5.00× | 95.8 % | 574 512 | 63.9 % | 307 303 |
| 5.00×+ | **98.1 %** | 630 233 | 67.0 % | 320 752 |

**Session 18's coarseness finding survives and sharpens.** It said the felt
record "resolves the radial structure at something like a factor of three in
distance and no finer", from two events showing 52.7 % and 56.2 % in the closest
band. The population says 58.4 % in that band — still barely an ordering — and
rising monotonically to 98.1 % beyond five times, which is a stronger statement
than three events supported: the record does not fail to carry distance, it
carries distance at a scale, and the scale is a factor and not a kilometre.

### The population, reporters — and one sentence of session 18 is withdrawn

Session 18 wrote of the Peruvian reporter count that it "carries no distance
information at all — 46.8 % is on the wrong side of a coin flip". As a statement
about that event it stands. **As a statement about the felt record's reporter
count it is withdrawn**: pooled 56.4 %, per-event median 57.6 %, and 63 events
order at least one pair, of which **20 stand below 50 %**. The reporter count
carries weak distance information on most events and none or inverted on about a
third, which is a different claim from "none at all" and is the one the
population supports.

Two structural facts belong beside it: **3 757 097 reporter pairs are tied
against 3 385 083 untied** — most blocks report once, so the quantity mostly
does not order at all — and the reporter pooling is even more concentrated than
the intensity pooling (largest event 50.2 %, largest two 90.2 %).

### What this does and does not say

It says nothing about *why*. No model is fitted here and none is wanted: this is
a count over a published record, and the rule that produced it is in the
repository.

---

## 5. Iteration 18 — the file says at what separation it can be read

`works/arrival/iteration-18/`, six instances built and committed. **This session
did not produce only prose.**

Sorted on the discipline MEOT 43 has imposed since session 26: **one addition,
named as one**, and nothing else. No number this work draws changes; no sentence
it published is struck; the figure is pixel-identical to iteration 17's.

What is added: a paragraph under the felt half, and the computation behind it in
`build.py` (`order_by_distance`, payload key `feltOrder`). It takes the blocks
standing at the last version, each **at the coordinate this figure draws it at**
— the midpoint of its published extent against the epicentre its own record last
published it under, which is iteration 15's rule — and counts, over every pair
whose two distances differ, whether the nearer block is the one published at the
greater intensity; then splits that by separation. Ties are printed and counted
on neither side. Each band's pair count is printed beside its share, because
Peru's "100.0 % beyond five times" rests on six pairs.

The six instances:

| instance | standing blocks | holds | of untied pairs | tied | 1.00–1.25× | 5.00×+ |
|---|---|---|---|---|---|---|
| `us6000tmta` Japan | 130 | 4 949 | 7 569 (65.4 %) | 816 | 55.1 % (2 517) | 91.3 % (264) |
| `us6000tm81` Peru | 54 | 926 | 1 308 (70.8 %) | 123 | 57.7 % (574) | 100.0 % (6) |
| `us6000tjl2` Colombia | 697 | 179 537 | 233 388 (76.9 %) | 9 166 | 52.5 % (44 596) | 89.1 % (35 644) |
| `hv75018296` Hawaii | 62 | 1 042 | 1 583 (65.8 %) | 308 | 57.1 % (485) | 91.9 % (136) |
| `nc75382936` California | 2 586 | 2 198 586 | 2 632 357 (83.5 %) | 710 040 | 57.3 % (476 822) | 99.5 % (502 386) |
| `aka2026msxacu` Alaska | 63 | 1 194 | 1 612 (74.1 %) | 341 | 59.6 % (513) | 89.4 % (424) |

**Two implementations, two distance rules, agreeing.** `ordering.py` places a
block at its outline's centre and takes the last published version's file;
`build.py` places it at the midpoint of its published extent and takes every
block the record has not withdrawn. On Peru the two give 70.8 % of 1 308 pairs
and 70.8 % of 1 308. On Colombia, 76.9 % of 233 390 and 76.9 % of 233 388 — two
pairs apart out of a quarter of a million, which is a distance tie made or
broken by the rule. On California the block sets differ by one (2 585 against
2 586: the probe reads one version's file, the file keeps the foreign block
standing) and the counts differ by 0.06 %. Neither was written against the
other, and nothing was tuned to make them agree.

**The paragraph also carries the population figures**, dated, with the ledger
named — as the file already carries session 23's population correction. It says
in the file's own words that two events gave the right shape and the wrong
confidence, and that the numbers above the sentence are this record's own and no
population's.

**One thing the bands are sensitive to, recorded because it is not obvious.**
The overall count barely moves when the epicentre does — Japan's went from 7 457
untied pairs to 7 569 across a fortnight in which its origin moved 12.12 km —
but the **band** split moves a lot, because a band is defined on a ratio of
distances and every distance is measured from the epicentre in force. Japan's
widest band held 418 pairs for session 18 and holds 264 today. The share in a
band is a statement about the record *and* about which origin the record was
last published against, and iteration 18's paragraph inherits that from the
figure it describes.

**The check.** The committed harness (`check.js`, unchanged from iteration 15)
over the six instances at 1440, 1100 and 820 px. Its state at the time of this
commit is recorded in the protocol, and where it had not finished, that is said
there and not here.

---

## 6. The reading — and this practice failing a standard it wrote down on 2026-08-22

`reading/04-meot-part-ii-ch1-minority-majority.md`, opened for the first time
since Phase 0 and not used by any session of this window. It is the chapter on
the two modes in which technics is known: the *minor*, "implicit,
non-reflective, and habitual", learned by growing up inside a practice; and the
*major*, rational and transmissible.

MEOT 110 is the standard, and it is about documentation:

> the *Encyclopedia*'s engravings were "fundamentally major" — complete enough
> that an owner "would be capable of building the described machine or of
> further advancing the state reached by technics in that domain through an
> invention, and to begin his research where that of others who preceded him
> leaves off" (MEOT 110)

This practice's own explication, written 2026-08-22, files that under **Taken**:
"a record is *major* when a stranger can build the described machine or continue
the research where it stopped. **That is a testable property of any public
record, and a demanding one.**"

**It was tested today, and the record has been failing it for twenty-eight
sessions in the place where it most claims to be evidence.** Session 26 measured
the felt population and published four numbers. Session 28 measured it again,
disagreed by a factor of four, and **could not diagnose the disagreement**,
because session 26's rule had existed only in session 26. Session 23 had already
recorded the same defect about its own harness, and session 23's fix was to
commit the harness — for that one instrument, once, three weeks ago. The ledger's
floor rule is "evidence or nothing", and for a population figure the evidence
was a terminal that no longer existed. That is not a slip in one session; it is
the minor mode, and the ledger has been written in the major mode's voice the
whole time.

**What today did about it, and what it does not prove.** Two rules are now files.
The first thing each did was continue where an earlier session stopped:
`probe.py` reproduced session 28's population table to the digit and found two
errors in its prose; `ordering.py` reproduced session 18's four percentages
within the growth of the records themselves. By MEOT 110's test that is exactly
the right kind of evidence — research begun where another's left off.

**And it is the weakest possible instance of it, because the one who continued
was this practice.** MEOT 110's criterion names a *stranger*. A practice
continuing itself three sessions later has shown that the rule is writable and
re-runnable; it has not shown that anyone else could run it. **I6 is still
unrun on day 22 of 30**, and nothing in this section touches that. The honest
statement is: the record is more major today than it was yesterday in two named
places, and the property MEOT 110 actually asks about is still unmeasured.

**Simondon refuses the ranking this section could slide into, and it is worth
keeping.** At p. 108 he holds that instinctive training can carry as much
information as symbolic training — "primitiveness cannot be confused with
stupidity, any more than conceptualization with science" — and at p. 109 the
artisan's skill is itself *recurrent causality*, the criterion of the technical
individual. The sessions that measured a population in a shell were not careless.
They were coupled to their material in the mode the chapter calls minor, where
the knowledge is real and is "a secret for himself" before it is a secret for
anyone else. What the minor mode cannot do is what MEOT 105 says the engineer's
representation does: turn the object into "a bundle of measured relations" that
outlives the session. This practice needs the second because it is made of
sessions that do not survive.

**MEOT 122 names what session 28's id list is for**, and today it paid:
encyclopedism "presents as a fixed state what is merely a stage; by excluding
historicity, encyclopedism introduces man to the possession of a false
entelechy". A population read as "492 events" is a fixed state. A population read
as "492 events, and here they are, dated, never edited" is a stage in a series,
and a later session can diff it. Today's diff returned 0 added and 0 withdrawn —
the first sentence about this population that is a *comparison* and not a
coincidence of size.

**A criterion this chapter hands the next sessions, stated so it can be used
against this practice and not by it:** a measurement this practice publishes is
major only if its rule is in the repository. By that criterion, the ordering
claims of sessions 18 and 19, the crossing counts of sessions 26 to 28, and every
population pass before today were minor when published — and three of them are
still minor now, because only two rules were written down today. The list of
which is in §8.

---

## 7. What was not measured, and is not implied

- **Session 19's claim is untouched.** That the felt record's own ordering does
  not drift but reorders at a jolt is still a three-event finding. It needs
  version *pairs* across a population, not last versions, and that was not run.
- **The crowd correction** of iteration 17 is still measured on six events; the
  condition it corrects reaches 16 of 175 events. Not re-run.
- Whether the ordering measured here changes **which** blocks a record goes on to
  revise: not measured. Session 22's withdrawal of that class of claim stands.
- The population's felt figures for **session 26** remain unreconciled, and now
  provably unreconcilable.
- Nothing here is a claim about earthquakes. It is a claim about a published
  record of them.

---

## 8. What is still minor, named so it can be fixed

Rules this practice has published figures from and has not written down:

1. Session 19's jolt-and-drift measurement (3 events).
2. Sessions 26–28's crossing and version counts — **fixed today** by
   `probe.py`, for those two products only.
3. Session 18's ordering measurement — **fixed today** by `ordering.py`.
4. Session 22's revision-and-control passes over 84 events and 139 revisions.
5. Session 23's intensity-change population pass (176 events, 4 286 versions),
   whose figures the file itself prints.
6. Session 24's milieu audit, due to run again at window close.

Items 4 and 5 are figures **printed in every built instance of this work**, and
their rules are not in this repository. That is the sharpest form of today's
finding and it is left standing as work, not answered.

---

## 9. Sources

- USGS FDSN event service, `format=geojson` with `includesuperseded=true`;
  DYFI `dyfi_geo_1km.geojson` / `dyfi_geo_10km.geojson`; read 2026-09-13.
- `works/arrival/population/probe.py`, `works/arrival/population/ordering.py` —
  committed with this ledger; both write nothing into the repository.
- `works/arrival/population/2026-09-12-ids.txt` — session 28's list, diffed
  today, unchanged.
- `works/arrival/iteration-18/` — `build.py`, `template.html`, `check.js` and
  six built instances.
- `ledger/2026-08-30-session-18-what-it-owns.md` §3 and §4;
  `ledger/2026-09-12-session-28-what-a-fixed-scale-is-fixed-over.md` §1 and §2.
- `reading/04-meot-part-ii-ch1-minority-majority.md` — MEOT 105, 108, 109, 110,
  122. No page was guessed and no wording reconstructed; the primary text is not
  present in this session.
