#!/usr/bin/env python3
"""Build one instance of the work "Arrival", iteration 17, from public USGS data.

The work is a single self-contained HTML file: no network access at
encounter time, no external assets, no libraries. This script is the
pipeline that makes one; running it again on another event makes another.

Usage:
    python3 build.py                 # most recent qualifying event
    python3 build.py us6000tmta      # a named event

Sources, all public and unauthenticated:
    fdsnws event detail, with `includesuperseded=true`
                             -> every version ever published of every product,
                                each with the instant it was published
    product `phase-data`     -> QuakeML picks: station, arrival instant,
                                distance, time residual, evaluation mode
    product `dyfi`           -> geocoded felt reports: outline, distance,
                                intensity, number of responses in the block

**What iteration 17 changes here: the one count that still crossed the seam,
and it crossed inside a single version.**

Session 27 left this standing as reasoned and not measured: whether a publisher
crossing can reach the *crowd* — how many other marks stand within a chosen
distance of a mark — and argued it cannot, because the crowd is computed inside
one version. Measured, the argument points the wrong way. Being inside one
version is not protection on the felt half; it is the mechanism. A felt
version's standing population is every block the record has not withdrawn, and
where two publishers publish a felt record of the same ground under one event
id, that population holds both. So a block was counted against the other
record's blocks covering the same cells.

On the two instances of this work whose felt record carries two publishers:

- `nc75382936`: **one** block of the second record stands, among 2 586 — and it
  changes **2 581** of the counts drawn at the widest rung, 1 019 at the next.
  Over the whole history, 12 902 of 610 328 published block-counts change.
- `hv75018296`: 28 of the 62 blocks standing belong to the second record, and
  **all 62** counts change at the widest rung, 18 at the narrowest. Over the
  history, 146 of 1 214.

The file has said the other thing since its twelfth iteration — in the
disclosure under the figure ("how many marks of *its own record* were standing
within a distance of it"), in the figure's own description for a reader who
cannot see it, and in the comment beside the code. Three statements and one
implementation, and the implementation was the odd one out. Iteration 17 makes
the implementation the one that changes; the sentence stands and is corrected
beside itself for having been false of the blocks.

**The arrival half was never affected, and not by a rule.** A version of the
arrival record is one publisher's whole list of picks; this apparatus never
mixes two publishers inside one version, so a pick's company is its own
record's by construction. That is now said in the file rather than left to be
inferred, and it is checked on every build.

**Two more things the file said and did not do.** The rule drawn on each strip
claimed its upper tick was "the most any mark of this record ever had at this
rung"; it is the most any mark in the *file* ever had, and on `aka2026msxacu`
that is 279 against the in-force record's own 82. The maximum stays pooled —
the file's oldest discipline is that moving the instant must not rescale an
axis, and a per-record maximum would rescale it at every crossing — and the
rule now says whose height it is drawn to. And the first sentence a reader
meets counted every version in the list as one record's ("the arrival record
was published N times") and gave the seismometer count from the largest version
whoever published it. That was the last place in the file where the reading
iterations 6 to 14 used survived; iteration 16 left it deliberately, and this
version takes it. On `aka2026msxacu` the old sentence said 390 seismometers and
ten versions; the record in force is a different network's, published twice,
its largest version carrying 291.

**And the guards get a channel that outlives the terminal.** Iteration 16 put
every fired guard on its own line in the build output, in answer to MEOT 143,
and its own protocol said what that does not do: a line in a build log is read
by whoever runs the build. From this version a firing is also appended to
`works/arrival/guards.md`, dated, with the event and the iteration — so it
enters the repository, which is what a session reads — and a build on which a
guard fires exits non-zero. Neither makes a session read it. What would is an
obligation in the protocol, and that is written into the record, not here.
See `ledger/2026-09-12-session-28-what-a-fixed-scale-is-fixed-over.md`.

**What iteration 16 changed here: the pick's name carries its record too, and
the seam this work has been drawing over since its ninth iteration is drawn.**

Iteration 15 gave the block's name its publisher and stopped reading one
publisher's version as a revision of another's — on the felt half only. The
arrival half kept the name iteration 9 gave it, the published network and
station code with the published phase label, and went on looking for a pick's
previous position in every earlier version whoever published it. Run over the
same 491-event catalogue on 2026-09-09, that is a seam seven times denser than
the felt record's: **1 588 published `phase-data` versions in 1 097 consecutive
pairs, 16 events carrying more than one publisher, and 50 pairs crossing from
one publisher to another — 4.6 %, against 0.61 % in the felt record.**

What a crossing does to that name is not what it does to a block's, and the
difference is the whole of this iteration:

- **A block's name is common ground and survives a crossing.** It is the
  rounded centre of a published outline — geometry, which both publishers
  compute the same way — so the second record's blocks matched the first's, and
  reading one as a revision of the other produced 90.8 % of the withdrawals
  iteration 14 published.
- **A pick's name is each publisher's own vocabulary and does not survive one
  at all.** Median survival across the 50 crossings is **0.000** — 8 037 of
  8 097 names dropped and 8 784 added — against a median of 1.000 within one
  publisher (118 dropped of 22 468). Two reasons, both published: the regional
  networks label every arrival `P` or `S` while `us` labels the same ground
  `Pn`, `Pg`, `Sn`, `Sg`; and only about a third of the stations are common at
  all (median station survival 0.354).

**So the seam has not been corrupting this work's arrival arithmetic. It has
been truncating it.** Where a crossing falls, the earlier record simply stops
existing for the count, and the file says the picks standing now have no
before — while telling the reader they were compared against "the arrival
record's N versions", counting versions of a record they were never in. Both
seam instances of iteration 15 are affected and neither is wrong: on
`hv75018296` and `nc75382936` **not one name survives any of their eight
crossings**, so every figure those two files publish about their arrival record
is identical read either way, at every version in force. This iteration
computes both readings and puts the check in the file rather than the claim.

Where the name does survive, it survives into a falsehood. In the whole
population **60 names survive a crossing, on three events, and all 60 publish a
different arrival instant** — which is exactly the condition under which this
work draws its `repick` tail and says *"this station published a different
arrival instant, so the pick itself was remade"*. It was not remade; two
publishers hold two readings of one station. On `us7000t2wx` four of them go
further: `AK.G19K`, `AK.J19K`, `AK.L22K` and `AV.STLK` are published at one
instant by `us`, at another by `ak` for twenty-three versions, and then at the
first instant again — a remaking and an unremaking, neither of which happened.
That event has no felt record at all (93 km off Adak; nobody was there to feel
it), so this work cannot draw the event that shows its own defect best. The
sixth instance is built on `aka2026msxacu`, which carries 42 of the 60.

The change itself is small and is the same rule twice instead of two rules: a
pick is named by its publisher with the station code and phase label its record
publishes, and a version is a revision only of the previous version of its own
publisher. Nothing is filtered; the other record's versions stay in the list and
in the timeline, drawn as another record.

**What iteration 15 changed here: a block's name now carries the record that
published it, and no version is read as a revision of another publisher's.**

Iteration 14 found that the version list the apparatus serves for one event id
can contain more than one publisher's felt record, said so in the file, and
counted how many versions came from elsewhere — and then went on comparing each
version with the one before it whoever published it. This version stops. A block
is named by its publisher and the rounded centre of its published outline, and a
version is a revision only of the previous version *of its own publisher*. The
seam between two publishers is drawn as a seam: neither record withdraws the
other's blocks, and neither is read as having changed the other's mind.

What that is worth, over the same 176-event catalogue as iterations 13 and 14
(now 4 295 published versions, read on 2026-09-08):

- **16 of the 176 events carry more than one publisher** in their felt version
  list; 33 versions of the 4 295 (0.77 %) were published by a non-majority
  publisher, and 25 of the 4 119 consecutive pairs cross from one publisher to
  another.
- **Those 25 pairs carry 2 661 of the 2 931 withdrawals iteration 14 published
  — 90.8 %.** Read as the records they contain, the population withdraws **294**
  blocks, not 2 931, and republishes **51**, not 2 680.
- **And four of the eight counterexamples iteration 13 was built on are the same
  artifact.** Session 23 measured 8 published intensity changes at an unchanged
  reporter count over this catalogue, of which 4 are on the Hawaiian event
  below — and all 4 of those stand at one crossing from `us/6000tk56` to
  `hv/75018296`. They are not one record changing its mind about a block with
  nobody reporting; they are two publishers disagreeing about the same ground.
  Read this way the catalogue says **4 of 2 878**, on three events, and the
  Hawaiian event is not one of them.

**So the number this work put in its own fourth instance yesterday was the
artifact.** Iteration 14's Hawaiian instance opens *"17 unreported moves, 4 in
intensity — 22 withdrawn by the record"*: the 4 are the seam, and 28 of that
instance's 50 withdrawals and all 28 of its returns are the seam. Built by this
pipeline the same event says **0 in intensity**, 22 withdrawn, 0 returned.
Iteration 14 stays frozen with its figures, in the open.

That the two publishers disagree is itself published, and it is counted here
rather than described: where a version of one publisher and a version of another
name the same cell, this file counts how often they give it a different
intensity at the same reporter count. On the Hawaiian event that is 4 of the 34
name-pairs across its two crossings, and within either publisher's own record it
is 0.
See `ledger/2026-09-08-session-26-what-a-seam-costs.md`.

**What iteration 14 changed here: the block's name is checked, the way the
pick's name has been checked since iteration 9.**

Since iteration 6 this pipeline has recognised a block across versions by the
rounded centre of its published outline, and iteration 9's note says of the
*pick's* name that it "is checked, not assumed: two arrivals in one version
claiming the same name would make the identity meaningless, so they are counted
and the count travels into the file." The block's name never got that check. One
half of it was made — a block republished with a different outline is counted as
`ringDisagree` — and the other half, two blocks in one published version
claiming one name, was not counted anywhere. The identity is older than the
pick's and everything drawn below the axis rests on it.

It holds. Run over the same catalogue as the last two iterations — every
M >= 5.0 event of the fixed ten-week window that published a geocoded felt
record more than once, 176 events, 4 293 published versions, 10 429 blocks —
**no version anywhere gives one name to two blocks, no block is ever
republished under a different outline, and no published outline ever receives
two names.** The nearest two distinct names in an event are a median 0.999 km
apart on a grid whose cells are about 1 km. The check is added because it was
missing, not because it fails, and it now travels with the file so a reader can
see that rather than take it.

The same catalogue says three things this work had no way to know from three
events, and two of them the drawing had no way to say:

- **The felt record can take a block back.** 2 931 blocks are withdrawn across
  18 of the 176 events; the block count falls at 18 transitions on 15 events.
- **And give it back.** 2 680 withdrawn blocks are later republished under the
  same name, on 11 events.
- **And the largest of those withdrawals are not withdrawals.** On a M 5.6 in
  Redwood Valley, California, 2 586 blocks vanish at one version and 2 584 come
  back at the next. That version was published under a different event source —
  `us/6000t7uu` where the other 247 are `nc/75382936` — and carries one block
  and one response. The same earthquake was catalogued twice, by a regional
  network and by the national one, the two were associated afterwards, and the
  apparatus now serves both publishers' felt records in one version list. Every
  event in the population that sheds blocks at scale has more than one event
  source in that list, and it interleaves rather than hands over: the Hawaiian
  event goes hv, ..., us, hv, and an Alaskan one alternates four times.
- On the three events this work was built on, none of that ever happens, which
  is why the accretion line has always read zero.

So a withdrawn block is no longer deleted from the replay. It is kept, drawn
where the record last published it, and marked as something the record has taken
back. And two counts are added beside the existing ones: how many blocks were
withdrawn and later republished, and how many pairs of distinct blocks stand
closer together than half of one cell. The second is the one place in 10 429
blocks where the grid is not a partition: the felt record is geocoded in UTM,
and where an event straddles a zone boundary both zones publish their own cells,
so two full-size cells can be published across each other. It happens on one
event of the 176 — a M 5.0 near Suez, on the 30° E boundary between zones 35 and
36, where two cells about a kilometre across stand 0.342 km apart. Everywhere
else the nearest two names in an event are a whole cell apart. The measure is a
distance between centres and not an overlap of outlines: a UTM square projected
into latitude and longitude is not a rectangle, so the bounding boxes of two
*adjacent* cells overlap by about ten metres, which is a fact about the
projection and not about the record. That was tried first, counted 29 pairs on
the Japanese event, and is recorded here as the wrong measure rather than left
out.

**And three numbers stated in this work are corrected, beside themselves.**
Iteration 13's note below, and the comment carried into all three of its built
instances, state the catalogue measurement as *3 710 published versions,
1 741 542 block-to-block transitions, 8 of 2 632 intensity changes*. The ledger
they both cite states *4 286*, *1 967 066* and *8 of 2 890*. The difference is
one event: `us6000t7zp`, M 7.5, Venezuela, which the ledger records as having
returned HTTP 503 on the first pass and been read on its own afterwards. It
carries 576 versions, 225 524 block transitions and 258 intensity changes, and
4 286 - 576, 1 967 066 - 225 524 and 2 890 - 258 give the three numbers in the
file exactly. **What iteration 13 published is the measurement from the pass in
which one event of its population was missing**, and the complete figures appear
nowhere in its instances. The finding is unchanged in direction and in size —
8 in 2 890 rather than 8 in 2 632 — and that is not why it is corrected.
Iteration 13 stays frozen with it, in the open.
See `ledger/2026-09-07-session-25-what-a-name-holds.md`.

**What iteration 13 changed here: nothing.** This pipeline is iteration 10's,
unedited apart from this note and the title above it. Three iterations running,
the change has been in what the template draws from the same data, and three
times running the occasion has been a measurement this practice published and
had to take back. This one is the third and the mildest: the claim that a felt
block's intensity never moves unless a person reports from it again, measured 0
of 360 times on the three events this work is built on, is false over a
catalogue of 176 events and 3 710 published versions — 8 of 2 632 — and the
exception is very largely the instrument network moving the origin under the
felt record. Nothing in the data this pipeline pins had to change for that: the
file already carried every version of both records and every block's reporter
count in each. What changed is that the drawing stops relying on the sentence.
See `ledger/2026-09-05-session-23-what-a-catalogue-says.md`.

**What iteration 12 changed here: nothing.** This pipeline is iteration 10's,
unedited apart from this note and the one above it. What changed is again what
the template draws from the same data, and again the occasion is a measurement
this practice had published and had to withdraw.

The lower strip has drawn each felt block at two published values since
iteration 3 — across, how many people reported it; up, how many other blocks of
this record stood within a chosen distance of it at the instant on show. The
vertical coordinate was put there because two sessions of this practice had
measured that it separated the blocks the record goes on to revise from the
blocks it leaves alone. On 2026-09-04 that measurement was run against the
control both sessions had named and neither had run, and it did not survive:
once each block's company **in the last version this file was built from** is
held fixed, the company standing around it at the moment it first appeared
separates nothing at all. The quantity is the place, not the moment.

So the strip stops presenting that coordinate as a bare position and draws its
motion, on exactly the rule the upper strip has used since iteration 11: a path
through consecutive published positions, up to the instant on show, consecutive
repeats collapsed. Nothing is added to what the record publishes; what is added
is that a viewer can see how much of a block's height is the place filling in
around it and how much is the block's own.
See `ledger/2026-09-04-session-22-what-the-company-was.md`.

**What iteration 11 changed here: nothing.** This pipeline is iteration 10's,
unedited apart from this note. What changed is what the template draws from the
same data: a mark that has been published at more than two positions is drawn as
the path it took, consecutive position to consecutive position, instead of a fan
from every earlier position to the present one. The fan was a true drawing of a
record that had published its arrivals twice; on 2026-09-02 the Peruvian record
this work is built on published a third version, and the fan stopped being true.
Nothing here had to change for that, which is the one thing this note records:
the pipeline already read every version the apparatus serves, and it was the
drawing that was carrying an assumption about how many there would be.
See `ledger/2026-09-03-session-21-what-a-second-revision-is.md`.

**What iteration 10 changed here: a pick gets a place on the ground.**

Every iteration to the ninth has known where a felt block is — the felt record
publishes an outline, and a point on the ground is what an outline is. It has
never known where a seismometer is. The arrival record publishes each pick's
epicentral distance *and* its azimuth from the epicentre in force, and those
two with the epicentre name a point exactly as the outline does. So this
pipeline runs the great circle it already uses forwards instead of backwards
and gives a pick a published position, `la`/`lo`. Nothing is looked up in a
station inventory; a pick with no published azimuth gets no position, and the
count of those travels into the file as `noAz` (0 on both work events).

What forced it is measured in `ledger/2026-09-01-session-20-what-a-crowd-is.md`.
Session 19 established that the felt record's intensity moves only when a
person answers a second time. This session asked which blocks those are, and
the answer is not the earthquake: on the Japanese event the blocks that ever
gain a second reporter are the ones standing in the record's own crowd — a
median of 12 other blocks already published within 10 km of them when they
first appeared, against 3 for the blocks that never move — while their
distance from the epicentre and their published intensity separate nothing at
all. The same question asked of the arrival record answers differently: a
station is re-picked where the record already disagreed with itself, not where
stations are dense, and no radius on either event makes crowding matter there.
Asking that question of both records in the same units is what needs a pick to
have a place, and this is where it gets one.

**What iteration 9 changed here: two things, and both are identity claims.**

Every iteration since the sixth has read the whole publication history of both
records, and every one of them has drawn each version as though it had no
predecessor. A block already had a name across versions — the rounded centre of
its published outline, `outline_centre` below — because the felt half is stored
as a list of changes and a change needs something to be a change *of*. A pick
had no such name: the arrival half was stored as a flat list per version, and
nothing in the file said that a station in the second version was the same
station as in the first. So iteration 9 gives a pick an identity across
versions, and checks it rather than assuming it: the key is the published
network and station code with the published phase label, and the number of
times two arrivals in one version claim the same key travels into the file as
`pickKeyCollisions`. On the two work events it is 0 and 0.

Second, a pick now carries the instant it was published at as well as the
travel time derived from it — `a`, seconds from the event origin instant, which
is fixed and not any version's own. That is what makes it possible to say
whether a station published a *different observation* or the same one. It is
the field this pipeline has been reading since iteration 1 to compute a travel
time, and then discarding.

What forced both is measured in `ledger/2026-08-31-session-19-what-a-jolt-is.md`.
The felt record revises 15 blocks of 129 across 80 publications, and never once
without a new reporter: 0 of 79 transitions on Japan and 0 of 36 on Peru
contain an intensity that moved at an unchanged reporter count. The arrival
record publishes twice, and at its single revision 118 of 121 published
residuals changed — 105 of them at stations that published exactly the same
arrival instant as before. One record's own measurement moves only when a
person acts; the other's moves for nearly everyone when nobody observed
anything.

**Corrected in iteration 13, beside the paragraph above and not in place of
it.** Two of its sentences are no longer true and each is wrong in a different
way. *"Moves only when a person acts"* is a general claim drawn from two events:
over 176 events and 4 286 published versions of the felt record it is false — 8
of 2 890 published intensity changes stand at an unchanged reporter count — and
overwhelming as a tendency, the two rates differing by a factor of about
158 000. Six of the eight sit across a version in which the instrument network
moved the origin under the felt record, one of them by handing the event to
another network outright, so the exception is the other record. *"The arrival
record publishes twice"* was a statement about the Japanese record at the time,
and it published a third version on 2026-09-04, twelve days after the second.
Iterations 9 to 12 keep both sentences, unedited, in the open. See
`ledger/2026-09-05-session-23-what-a-catalogue-says.md`.

What forced iteration 8, and stands unchanged:
`ledger/2026-08-30-session-18-what-it-owns.md`: the felt record publishes
exactly three things per block that owe the instrument network nothing — the
outline, the number of people who reported, and the intensity they reported.
Iterations 2 to 7 drew the lower half as a running count of reports inside a
distance, which is a census of the network rather than a measurement of the
earthquake, and made the reporter count the human-side control. On the Japanese
event that control takes four distinct values across the whole published
history and 112 of 129 blocks sit in the first of them; the instrument-side
control takes 164. The intensity takes 22, and was drawn nowhere.

**What iteration 7 changed here, and why**
(`record/2026-08-29-session-17.md`, `ledger/2026-08-29-session-17-what-it-costs.md`):

Iteration 6 showed that the felt record does not own the coordinate it is drawn
on, and left the next question standing: what does that cost it. The cost is
measurable, and it is measurable against something the felt record does own —
the size of its own cells. A block is published as a 1 km cell. On the Japanese
event the instrument network's one revision moved every block by a median of
1.21 km; on the Peruvian event by 8.97 km, against a cell 1.4 km across. The
human record is displaced by about its own resolution, or by six times it, by
an act nobody in it performed.

Iteration 6 could not show that, because it drew each block at one number — the
centre of its outline — and said the rest in the footer:

    "A block is published as a 1 km cell, so no position here is finer than
     that, and none is drawn nearer the epicentre than half a cell."

That sentence is prose standing in for a picture, and the clamp it describes
never once fired on either event. Both are struck. Here a block is drawn across
the distances it actually occupies: from the nearest published vertex of its own
outline to the farthest, measured from the epicentre in force. On a logarithmic
axis that makes the near field wide and the far field a hairline, so the human
record's own imprecision is drawn where it is large — which is exactly where
this work's most consequential figure, the inner edge, has always been read.

The same act is performed on the other network, because since iteration 3 every
demand this work makes is made of both: a pick is drawn from the instant it
arrived to the instant the fitted solution predicted for it, which is its
published residual. At this figure's scale that mark is under a pixel on both
events at every state. Drawing both to one scale and letting one of them vanish
is the finding, not a failure to draw it.

One further thing iteration 6 asserted and this iteration reads: the identity
line named the solution the *arrival* record then carried, while the felt half
below can still be standing on an older one — the felt product carries the
solution of its own last publication. On the two work events that gap is open at
1 instant of 82 and 2 of 39, and at those instants the file now says that its
shared axis is not shared.

Derived quantities, and no others: a pick's travel time (its published arrival
instant minus the origin instant published in the same version); a felt block's
two epicentral distances (great-circle from the epicentre published in the
version that carries it to the nearest and to the farthest vertex of the
outline published for it, on a sphere of R = 6371.0 km — a published vertex,
never a point interpolated between two); the same published arrival instant
counted from the event's own origin instant, which belongs to no version; a
pick's place on the ground, from its own published epicentral distance and its
own published azimuth about the epicentre its version published, on that same
sphere; and the degree/kilometre conversion used for display. The file itself
derives one more, and says so: how many of a record's own marks stand within a
given distance of one of them, counted over the population standing at the
instant being read. A block's published distance travels into the file beside
its computed ones, as in iterations 5 and 6, so the two coordinates can be
compared rather than conflated.

Only standard library. Written for Python 3.9+.
"""

import datetime as dt
import json
import math
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET

BED = "{http://quakeml.org/xmlns/bed/1.2}"
FDSN = "https://earthquake.usgs.gov/fdsnws/event/1/query"
KM_PER_DEG = 111.195  # great-circle degree at the surface
R_KM = 6371.0         # the sphere the block distances are computed on
UA = {"User-Agent": "arch-practice/arrival (public data, unauthenticated)"}

FELT_FILES = (
    ("dyfi_geo_1km.geojson", 1.0),
    ("dyfi_geo_10km.geojson", 10.0),
)


def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r:
        raw = r.read()
    return raw if binary else raw.decode("utf-8")


# How many guards fired on the last build, so that `__main__` can make the
# process say so in its exit code. From iteration 17.
GUARDS_FIRED = [0]

HEADER = (
    "# Guards that fired\n\n"
    "Appended by `build.py` from iteration 17 onward: a guard that fires belongs"
    " in the repository, which is what the next session reads, and not only in"
    " the terminal of the session that ran the build. Nothing here is ever"
    " edited or pruned. What is recorded is what the guards *say* — a rebuild"
    " that fires the same set on the same event and the same iteration adds no"
    " entry; one that fires a different set does. A line here is not a defect:"
    " it is a reading of the record that someone has to make.\n")

NAIVE_INSTANTS = [0]


def iso(s):
    """A published instant, read as published.

    From iteration 14, because a fourth event broke this. Every arrival instant
    on the three events this work was built on is published with a `Z`; the
    Hawaiian network publishes them with no zone designator at all —
    `2026-08-12T03:48:33.32` — and until this version that made the arrival
    half of the file unbuildable on those events, with a type error and no
    diagnosis. QuakeML's instants are UTC, so a missing designator is an
    omission by the publisher and not a different zone, and it is read as UTC.
    That is an assumption about someone else's record, so it is counted and the
    count travels into the file rather than being made silently.
    """
    t = dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
    if t.tzinfo is None:
        NAIVE_INSTANTS[0] += 1
        t = t.replace(tzinfo=dt.timezone.utc)
    return t


def gc_km(lat1, lon1, lat2, lon2):
    """Great-circle surface distance, kilometres, on a sphere of R_KM."""
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dl = math.radians(lon2 - lon1)
    a = (math.sin(p1) * math.sin(p2)
         + math.cos(p1) * math.cos(p2) * math.cos(dl))
    return R_KM * math.acos(max(-1.0, min(1.0, a)))


def forward(lat0, lon0, deg, az):
    """Where a pick stands, from its own published distance and azimuth.

    The inverse of `gc_km`, on the same sphere: given the epicentre a version
    published, the epicentral distance that version published for a pick and
    the azimuth it published from that epicentre to the station, this returns
    the point those three name. It derives nothing the record does not already
    say; it only says it in the coordinate the felt blocks are already in, so
    that the same question can be asked of both records.
    """
    d = math.radians(deg)
    th = math.radians(az)
    p0 = math.radians(lat0)
    la = math.asin(max(-1.0, min(1.0,
        math.sin(p0) * math.cos(d) + math.cos(p0) * math.sin(d) * math.cos(th))))
    lo = math.radians(lon0) + math.atan2(
        math.sin(th) * math.sin(d) * math.cos(p0),
        math.cos(d) - math.sin(p0) * math.sin(la))
    return math.degrees(la), (math.degrees(lo) + 540.0) % 360.0 - 180.0


def outline_ring(geom):
    """The distinct published vertices of a block's outline, as (lat, lon).

    A block is a published cell, not a point. Iterations 5 and 6 took its
    centre and said in the footer that no position was finer than the cell;
    iteration 7 keeps the vertices, because the cell's two edges on this axis
    are computed from them and are what gets drawn.
    """
    if not geom:
        return None
    t, c = geom.get("type"), geom.get("coordinates")
    if t == "Point":
        return [(c[1], c[0])]
    ring = c[0] if t == "Polygon" else (c[0][0] if t == "MultiPolygon" else None)
    if not ring:
        return None
    pts = ring[:-1] if len(ring) > 2 and ring[0] == ring[-1] else ring
    return [(p[1], p[0]) for p in pts]


def outline_centre(geom):
    """Centre of a published block outline: the mean of its distinct vertices.

    Kept as the block's identity across versions — a block is recognised by
    where it is, and the centre is the cheapest stable name for that. It is no
    longer where the block is drawn.
    """
    pts = outline_ring(geom)
    if not pts:
        return None
    return (sum(p[0] for p in pts) / len(pts),
            sum(p[1] for p in pts) / len(pts))


def outline_edges(pts, lat0, lon0):
    """The near and far edge of a published block on the epicentral axis.

    The whole cell stands at a range of distances from the epicentre, and the
    range is published: it is the outline. The nearest and farthest vertices
    give it. Nothing is derived beyond the great circle already in use.
    """
    ds = [gc_km(lat0, lon0, p[0], p[1]) for p in pts]
    return min(ds), max(ds)


def pick_event(eventid=None):
    """The detail GeoJSON of an event carrying both products, all versions."""
    sup = "&includesuperseded=true"
    if eventid:
        return json.loads(get(f"{FDSN}?format=geojson&eventid={eventid}{sup}"))
    listing = json.loads(
        get(f"{FDSN}?format=geojson&limit=40&minmagnitude=5&orderby=time")
    )
    for feat in listing["features"]:
        detail = json.loads(
            get(f"{FDSN}?format=geojson&eventid={feat['id']}{sup}"))
        products = detail["properties"]["products"]
        if "phase-data" in products and "dyfi" in products:
            return detail
    raise SystemExit("no recent event carries both phase-data and dyfi")


def read_phase_version(product, t_event_ms):
    """One published version of the arrival record, read whole.

    Each version carries its own origin, so each version's travel times are
    computed against the origin instant that version published — never against
    a later one.

    From iteration 9 each pick also carries `a`, the instant the station's
    arrival was published at, in seconds from the event origin instant. That
    reference is fixed across versions and belongs to none of them, which is
    the point: the travel time `t` moves when the fitted origin moves, and `a`
    moves only when the station's own published arrival moves. Keeping both is
    what lets the file distinguish a re-picked station from a re-fitted one.
    """
    url = product["contents"]["quakeml.xml"]["url"]
    root = ET.fromstring(get(url, binary=True))
    origin = root.find(".//" + BED + "origin")
    t0 = iso(origin.find(BED + "time/" + BED + "value").text)
    t_event = dt.datetime.fromtimestamp(t_event_ms / 1000, dt.timezone.utc)

    picks = {p.get("publicID"): p for p in root.findall(".//" + BED + "pick")}
    rows = []
    for arrival in root.findall(".//" + BED + "arrival"):
        pid = arrival.findtext(BED + "pickID")
        deg = arrival.findtext(BED + "distance")
        pick = picks.get(pid)
        if pick is None or not deg:
            continue
        instant = pick.find(BED + "time/" + BED + "value").text
        wf = pick.find(BED + "waveformID")
        res = arrival.findtext(BED + "timeResidual")
        az = arrival.findtext(BED + "azimuth")
        rows.append({
            "sta": f"{wf.get('networkCode')}.{wf.get('stationCode')}",
            "deg": round(float(deg), 4),
            "az": round(float(az), 3) if az is not None else None,
            "t": round((iso(instant) - t0).total_seconds(), 2),
            "a": round((iso(instant) - t_event).total_seconds(), 3),
            "ph": arrival.findtext(BED + "phase") or "",
            "res": round(float(res), 2) if res is not None else None,
            "mode": pick.findtext(BED + "evaluationMode") or "",
        })
    # A pick with no published residual cannot be filtered by one and is not
    # silently given a favourable value: it is dropped, and the count of what
    # was dropped travels into the file so the omission stays visible.
    dropped = sum(1 for r in rows if r["res"] is None)
    rows = [r for r in rows if r["res"] is not None]
    rows.sort(key=lambda r: r["deg"])

    props = product["properties"]

    def num(k):
        v = props.get(k)
        return None if v is None else float(v)

    # A pick's place on the ground, from what its own version publishes about
    # it: the epicentre in force, the pick's published epicentral distance and
    # its published azimuth from that epicentre. This is the same great circle
    # already in use for a block's distance, run forward instead of backward,
    # on the same sphere. Nothing is looked up in a station inventory and no
    # coordinate is invented — a pick with no published azimuth simply has no
    # position, and the count of those travels into the file.
    lat0, lon0 = num("latitude"), num("longitude")
    no_az = 0
    for r in rows:
        if r["az"] is None or lat0 is None or lon0 is None:
            r["la"] = r["lo"] = None
            no_az += 1
            continue
        la, lo = forward(lat0, lon0, r["deg"], r["az"])
        r["la"], r["lo"] = round(la, 4), round(lo, 4)

    return {
        "rev": int(product["updateTime"]),
        # From iteration 16 an arrival version carries the record that published
        # it, in the same shape the felt half has carried since iteration 14.
        # The apparatus serves more than one publisher's arrival record under
        # one event id more often than it does for felt reports, and until this
        # version nothing in this half of the file knew that.
        "src": f"{props.get('eventsource')}/{props.get('eventsourcecode')}",
        "min": round((int(product["updateTime"]) - t_event_ms) / 60000.0, 2),
        "t0": t0.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "lat": lat0, "lon": lon0, "depth": num("depth"),
        "status": props.get("review-status") or props.get("evaluation-status") or "",
        "picks": rows,
        "noRes": dropped,
        "noAz": no_az,
        "url": url,
    }


def read_felt_version(product, t_event_ms):
    """One published version of the felt record, read whole.

    Returns the blocks keyed by their published outline, and the epicentre
    **this version** published — which is the point its own distances were
    measured from, and which the instrument network can move under it.
    """
    contents = product["contents"]
    name, cell_km = next(
        ((n, c) for n, c in FELT_FILES if n in contents), (None, None))
    if name is None:
        return None
    props = product["properties"]
    lat0, lon0 = float(props["latitude"]), float(props["longitude"])
    depth0 = float(props["depth"])

    blocks, no_outline, collisions = {}, 0, 0
    for b in json.loads(get(contents[name]["url"]))["features"]:
        p = b["properties"]
        if p.get("dist") is None:
            continue
        ring = outline_ring(b.get("geometry"))
        centre = outline_centre(b.get("geometry"))
        if centre is None:
            # Without a published outline the block cannot be placed on the
            # picks' coordinate, and it is not placed by its hypocentral
            # distance instead. It is dropped, visibly.
            no_outline += 1
            continue
        key = (round(centre[0], 4), round(centre[1], 4))
        if key in blocks:
            # From iteration 14, and for the same reason iteration 9 counted it
            # for the picks: two blocks in one published version claiming one
            # name would make the identity meaningless, and one of them would be
            # dropped here without a trace. Counted, not assumed away.
            collisions += 1
        blocks[key] = {"n": int(p["nresp"]), "cdi": float(p["cdi"]),
                       "km": round(float(p["dist"]), 1), "ring": ring}
    return {
        "keyCollisions": collisions,
        "src": f"{props.get('eventsource')}/{props.get('eventsourcecode')}",
        "rev": int(product["updateTime"]),
        "min": round((int(product["updateTime"]) - t_event_ms) / 60000.0, 2),
        "lat": lat0, "lon": lon0, "depth": depth0,
        "cellKm": cell_km, "file": name,
        "blocks": blocks, "noOutline": no_outline,
        "url": contents[name]["url"],
    }


def build(eventid=None):
    detail = pick_event(eventid)
    props = detail["properties"]
    lon, lat, depth = detail["geometry"]["coordinates"]
    t_event_ms = int(props["time"])

    phase_products = sorted(props["products"]["phase-data"],
                            key=lambda p: p["updateTime"])
    felt_products = sorted(props["products"]["dyfi"],
                           key=lambda p: p["updateTime"])

    print(f"event    {detail['id']}  M{props['mag']}  {props['place']}")
    print(f"reading  {len(phase_products)} published version(s) of the arrival"
          f" record, {len(felt_products)} of the felt record", flush=True)

    phases = [read_phase_version(p, t_event_ms) for p in phase_products]

    # ---- the arrival record, as a history ----------------------------------
    # A pick gets a name that survives republication, for the same reason a
    # block has one: without it no version can be a revision of another, and
    # every iteration to the eighth drew the arrival half as though each
    # version stood alone. The name is what the record itself publishes — the
    # network and station code with the phase label — and it is checked, not
    # assumed: two arrivals in one version claiming the same name would make
    # the identity meaningless, so they are counted and the count travels into
    # the file. Nothing is merged or reconciled; a name is only an index.
    #
    # From iteration 16 the name carries the record that published it, which is
    # the rule iteration 15 gave the block. It matters for the opposite reason.
    # A block's name is geometry and survives a crossing, so the old rule read
    # two publishers' blocks as one record revising itself; a pick's name is
    # each publisher's own vocabulary and does not survive one, so the old rule
    # read the earlier record as though it had never been published. Both
    # readings are computed here and the difference travels into the file: this
    # work has published five instances on the old rule and none of their
    # figures is disturbed, and saying so is worth more than asserting it.
    pick_streams, pick_stream_index = [], {}
    for ph in phases:
        s = ph["src"].split("/")[0]
        if s not in pick_stream_index:
            pick_stream_index[s] = len(pick_streams)
            pick_streams.append({"src": s, "versions": 0})
        ph["s"] = pick_stream_index[s]
        pick_streams[ph["s"]]["versions"] += 1
    phase_srcs = [ph["src"] for ph in phases]
    # "Majority" is not always defined, and this pipeline found that out on the
    # day it was written: the Californian record's arrival half is five versions
    # each, and `max(set(...), key=count)` returned a different publisher on two
    # builds of the same unchanged record. A tie is broken by the record in
    # force — the publisher of the last published version — which is the record
    # every figure in the file is drawn from anyway, and which is a fact about
    # the record rather than about the iteration order of a set.
    phase_main = None
    if phase_srcs:
        top = max(phase_srcs.count(s) for s in set(phase_srcs))
        tied = [s for s in set(phase_srcs) if phase_srcs.count(s) == top]
        phase_main = phase_srcs[-1] if phase_srcs[-1] in tied else sorted(tied)[0]
    phase_foreign = sum(1 for s in phase_srcs if s != phase_main)
    phase_crossings = sum(1 for a, b in zip(phase_srcs, phase_srcs[1:]) if a != b)

    pick_key, pick_key_collisions = {}, 0
    naive_key = {}
    for ph in phases:
        seen = set()
        for r in ph["picks"]:
            key = (ph["s"], r["sta"], r["ph"])
            if key in seen:
                pick_key_collisions += 1
            seen.add(key)
            if key not in pick_key:
                pick_key[key] = len(pick_key)
            r["k"] = pick_key[key]
            nk = (r["sta"], r["ph"])
            if nk not in naive_key:
                naive_key[nk] = len(naive_key)
            r["nk"] = naive_key[nk]

    # What the two names disagree about, counted rather than described. A name
    # that survives a crossing is one station-and-phase two publishers both
    # claim; where the two publish a different arrival instant for it, the rule
    # this work used to iteration 15 draws it as the station having remade its
    # own pick, and it is not that.
    seam_pick_names = seam_pick_instants = 0
    for a, b in zip(phases, phases[1:]):
        if a["s"] == b["s"]:
            continue
        am = {}
        for r in a["picks"]:
            am.setdefault(r["nk"], r)
        for r in b["picks"]:
            q = am.get(r["nk"])
            if q is None:
                continue
            seam_pick_names += 1
            if q["a"] != r["a"]:
                seam_pick_instants += 1

    # Both readings of the file's own arrival figure, at every version in force,
    # computed the way the template computes it and compared here. `naive` is
    # the rule of iterations 9 to 15; the other is this iteration's. Where the
    # two agree the file says so; where they differ it publishes both.
    def arrival_figure(keyf):
        out = []
        by = []
        for ph in phases:
            m = {}
            for r in ph["picks"]:
                # From iteration 17: the *last* pick a version publishes under a
                # name wins, not the first. Where a version publishes one name
                # twice — which happens, and which iteration 9's guard counts —
                # this and `PHBY` in the page were two rules for one lookup, and
                # they agreed on the one instance that has collisions only
                # because the two picks give the same answer there. One rule
                # now. Checked on all six instances: no published figure moves.
                m[keyf(r)] = r
            by.append(m)
        for up_to, ph in enumerate(phases):
            elig = moved = silent = 0
            for s in ph["picks"]:
                k = keyf(s)
                if not any(k in by[j] for j in range(up_to)):
                    continue
                elig += 1
                path, prev = [], None
                for j in range(up_to):
                    q = by[j].get(k)
                    if q is None:
                        continue
                    sig = (q["deg"], q["t"], q["res"])
                    if prev == sig:
                        continue
                    prev = sig
                    path.append(q)
                pr = [q for q in path if q["res"] != s["res"]]
                if pr:
                    moved += 1
                    if all(q["a"] == s["a"] for q in pr):
                        silent += 1
            out.append([elig, moved, silent])
        return out

    fig_record = arrival_figure(lambda r: r["k"])
    fig_naive = arrival_figure(lambda r: r["nk"])
    fig_disagree = sum(1 for a, b in zip(fig_record, fig_naive) if a != b)

    # The old name has done its work here and is not carried into the file: the
    # comparison is a check on this pipeline, not a second index the drawing
    # could use.
    for ph in phases:
        for r in ph["picks"]:
            del r["nk"]

    # ---- the felt record, as a history -------------------------------------
    # Blocks are identified by their published outline. Each distinct published
    # epicentre gets an index; a block's geometry is computed once per
    # epicentre, because that is the only thing it depends on.
    raw = []
    for p in felt_products:
        v = read_felt_version(p, t_event_ms)
        if v is not None:
            raw.append(v)
    if not raw:
        raise SystemExit("no felt version carries a geocoded block file")

    epis, epi_index = [], {}
    for v in raw:
        key = (v["lat"], v["lon"], v["depth"])
        if key not in epi_index:
            epi_index[key] = len(epis)
            epis.append({"lat": v["lat"], "lon": v["lon"], "depth": v["depth"],
                         "rev": v["rev"], "min": v["min"]})
        v["e"] = epi_index[key]

    # From iteration 15: the name carries the record that published it.
    #
    # Since iteration 6 a block has been named by the rounded centre of its
    # published outline alone, and iteration 14 verified that this name holds —
    # over 176 events no version gives one name to two blocks and no outline
    # ever receives two names. What that check could not see is that the list it
    # ran over is not always one record: where the same earthquake was
    # catalogued by a regional network and by the national one, the apparatus
    # serves both publishers' felt records under one event id. A name shared
    # between two publishers is then two measurements of one piece of ground by
    # two records, and reading the second as a revision of the first is what
    # produced 90.8 % of the withdrawals iteration 14 published and all four of
    # the unreported intensity moves in its Hawaiian instance. So the publisher
    # is part of the name. Nothing is filtered and nothing is merged: both
    # records are drawn, each as itself.
    streams, stream_index = [], {}
    for v in raw:
        s = v["src"].split("/")[0]
        if s not in stream_index:
            stream_index[s] = len(streams)
            streams.append({"src": s, "versions": 0})
        v["s"] = stream_index[s]
        streams[v["s"]]["versions"] += 1

    order, blocks, rings = {}, [], {}
    for v in raw:
        for key, b in v["blocks"].items():
            bk = (v["s"], key[0], key[1])
            if bk not in order:
                order[bk] = len(blocks)
                rings[bk] = b["ring"]
                blocks.append({"c": [key[0], key[1]], "s": v["s"],
                               "lo": [None] * len(epis),
                               "hi": [None] * len(epis),
                               "km": [None] * len(epis)})
    cell_km = raw[-1]["cellKm"]
    km_disagree = 0
    ring_disagree = 0
    block_key_collisions = sum(v["keyCollisions"] for v in raw)

    # From iteration 14, and it is the reason the withdrawals below are drawn
    # rather than only counted. This file has read the versions the apparatus
    # serves for one event id as one record's history since iteration 6. On some
    # events they are not one record's history: the same earthquake is
    # catalogued by a regional network and by the national one, the two are
    # associated afterwards, and both publishers' felt records are then served
    # in one list. Where that happens the list interleaves them — on the
    # Hawaiian event below it goes hv, hv, ..., us, hv — and a version of the
    # other publisher's record, with its own much smaller set of blocks, reads
    # here as this record withdrawing almost everything and giving it back.
    # Which publisher a version came from is published; it is counted here and
    # travels into the file, so the withdrawals a reader sees can be told apart
    # from the ones that are an artifact of two records served as one. Nothing
    # is filtered out: this file still draws every version the apparatus serves.
    srcs = [v["src"] for v in raw]
    main_src = max(set(srcs), key=srcs.count)
    foreign_versions = sum(1 for s in srcs if s != main_src)
    src_changes = sum(1 for a, b in zip(srcs, srcs[1:]) if a != b)

    # From iteration 14: two distinct blocks standing closer together than half
    # of one cell. The felt record's grid is geocoded in UTM, and where an event
    # straddles a zone boundary both zones publish their own cells, so two
    # full-size cells can be published across each other. Adjacent cells of one
    # zone stand about a whole cell apart; two that stand closer than half a cell
    # are not two cells of one grid. Neither name is wrong and neither block is
    # dropped — what is no longer assumed is that these cells partition the
    # ground. Over the catalogue this measure fires on one event of 176, a M 5.0
    # near Suez, where two cells about a kilometre across stand 0.342 km apart.
    #
    # From iteration 15 the measure runs inside each publisher's record and not
    # across the two. Two publishers who both geocode the same ground publish
    # cells with the same centres; the distance between those is zero and says
    # nothing about whether either publisher's grid partitions anything.
    near_names, near_min = 0, None
    bucket = {}
    for k in rings:
        bucket.setdefault((k[0], int(k[1] * 50), int(k[2] * 50)), []).append(k)
    for (bs, bi, bj), ks in bucket.items():
        cand = []
        for di in (-1, 0, 1):
            for dj in (-1, 0, 1):
                cand.extend(bucket.get((bs, bi + di, bj + dj), ()))
        for a in ks:
            for b in cand:
                if a >= b:
                    continue
                d = gc_km(a[1], a[2], b[1], b[2])
                if near_min is None or d < near_min:
                    near_min = d
                if d < cell_km / 2.0:
                    near_names += 1
    for v in raw:
        e = v["e"]
        for key, b in v["blocks"].items():
            bk = (v["s"], key[0], key[1])
            i = order[bk]
            if b["ring"] != rings[bk]:
                # the same block republished with a different outline would
                # invalidate the identity this file is built on; counted, not
                # assumed away.
                ring_disagree += 1
            if blocks[i]["lo"][e] is None:
                # A block is a published cell standing at a range of distances
                # from the epicentre, not at one. Both edges of that range are
                # computed from the published outline, against the epicentre
                # this version published. Iterations 5 and 6 kept the centre
                # and clamped it at half a cell; the clamp never once fired,
                # and the range it stood in for is drawn here instead.
                lo, hi = outline_edges(rings[bk], epis[e]["lat"],
                                       epis[e]["lon"])
                blocks[i]["lo"][e] = round(lo, 3)
                blocks[i]["hi"][e] = round(hi, 3)
                blocks[i]["km"][e] = b["km"]
            elif blocks[i]["km"][e] != b["km"]:
                km_disagree += 1
                blocks[i]["km"][e] = b["km"]

    # The history as what it is: a list of changes. A version's entry says what
    # appeared, what changed, and what went away; nothing is stored twice.
    #
    # From iteration 15 `prev` is per publisher: a version is a revision of the
    # previous version of its own record, and of nothing else. Where the list
    # crosses from one publisher to the other, neither record withdraws the
    # other's blocks and neither changes the other's counts — the crossing is
    # drawn as what it is, one record publishing while the other stands.
    versions, prev, added, changed, removed = [], {}, 0, 0, 0
    # From iteration 14: a block the record withdrew and later published again.
    # Over the catalogue, read as iteration 15 reads it, this happens 51 times
    # on 7 events of 176; iteration 14 published 2 680 on 11, of which 2 629
    # were a version of another publisher's record standing in the list. On the
    # three events this work was first built on it has never happened once,
    # which is why no earlier iteration had to have a word for it.
    ever, returned = set(), 0
    for v in raw:
        add, chg, gone = [], [], []
        mine = prev.get(v["s"], {})
        here = set()
        for key, b in v["blocks"].items():
            i = order[(v["s"], key[0], key[1])]
            here.add(i)
            was = mine.get(i)
            if was is None:
                if i in ever:
                    returned += 1
                add.append([i, b["n"], b["cdi"]])
            elif was[0] != b["n"] or was[1] != b["cdi"]:
                chg.append([i, b["n"], b["cdi"]])
        for i in mine:
            if i not in here:
                gone.append(i)
        added += len(add)
        changed += len(chg)
        removed += len(gone)
        ever |= here
        versions.append({"rev": v["rev"], "min": v["min"], "e": v["e"],
                         "s": v["s"], "a": add, "c": chg, "d": gone})
        prev[v["s"]] = {order[(v["s"], k[0], k[1])]: (b["n"], b["cdi"])
                        for k, b in v["blocks"].items()}

    # From iteration 15, and the reason it exists: the same history read the way
    # every iteration from the sixth to the fourteenth read it — one list, each
    # version a revision of the one before it whoever published it — so that a
    # reader of this file can see the difference rather than take this note's
    # word for it. Nothing below is used to draw anything; these are counts.
    naive_removed = naive_returned = naive_moved = 0
    naive_prev, naive_ever = {}, set()
    for v in raw:
        cur = {k: (b["n"], b["cdi"]) for k, b in v["blocks"].items()}
        for k, nb in cur.items():
            was = naive_prev.get(k)
            if was is None:
                if k in naive_ever:
                    naive_returned += 1
            elif was[1] != nb[1] and was[0] == nb[0]:
                naive_moved += 1
        naive_removed += len(set(naive_prev) - set(cur))
        naive_ever |= set(cur)
        naive_prev = cur

    # And what the two publishers say about each other, where they name the same
    # ground on either side of a crossing: how many of those names they publish
    # at a different intensity, and how many of those at the same reporter count
    # — which is the case iteration 13's footer count was built to find inside
    # one record, and which iteration 14 counted across two without knowing it.
    seam_pairs = seam_names = seam_cdi = seam_cdi_same_n = 0
    for a, b in zip(raw, raw[1:]):
        if a["s"] == b["s"]:
            continue
        seam_pairs += 1
        for k in set(a["blocks"]) & set(b["blocks"]):
            seam_names += 1
            x, y = a["blocks"][k], b["blocks"][k]
            if x["cdi"] != y["cdi"]:
                seam_cdi += 1
                if x["n"] == y["n"]:
                    seam_cdi_same_n += 1

    # Did any block's count ever go down? The work claims accretion; the claim
    # is checked here rather than assumed, and the answer travels into the file.
    decreases = 0
    state = {}
    for ver in versions:
        for i, n, _c in ver["a"]:
            state[i] = n
        for i, n, _c in ver["c"]:
            if n < state.get(i, 0):
                decreases += 1
            state[i] = n

    # How many of the blocks standing at the last version belong to a record
    # other than the one in force. Added by iteration 17, because it is the
    # denominator of the defect that iteration corrects: a block's company was
    # being counted against every block standing, and where this number is not
    # zero, some of that company is another publisher's record of the same
    # ground. One is enough to matter — on the Californian event one foreign
    # block among 2 586 changes 2 581 of the drawn counts at the widest rung.
    standing = {}
    for ver in versions:
        for i, n, _c in ver["a"]:
            standing[i] = n
        for i, n, _c in ver["c"]:
            standing[i] = n
        for i in ver["d"]:
            standing.pop(i, None)
    main_stream = stream_index[main_src.split("/")[0]]
    felt_foreign_standing = sum(1 for i in standing
                                if blocks[i]["s"] != main_stream)

    payload = {
        "id": detail["id"],
        "place": props["place"],
        "mag": props["mag"],
        "origin": dt.datetime.fromtimestamp(t_event_ms / 1000, dt.timezone.utc)
                    .strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "lat": lat, "lon": lon, "depth": depth,
        "kmPerDeg": KM_PER_DEG, "rKm": R_KM,
        "cellKm": cell_km,
        "feltFile": raw[-1]["file"],
        "noOutline": raw[-1]["noOutline"],
        "epis": epis,
        "streams": streams,
        "blocks": blocks,
        "felt": versions,
        "phases": phases,
        "counts": {"added": added, "changed": changed, "removed": removed,
                   "decreases": decreases, "kmDisagree": km_disagree,
                   "ringDisagree": ring_disagree,
                   "blockKeyCollisions": block_key_collisions,
                   "noZone": NAIVE_INSTANTS[0],
                   "feltSrc": main_src,
                   "mainStream": main_stream,
                   "feltForeign": foreign_versions,
                   "feltForeignStanding": felt_foreign_standing,
                   "feltSrcChanges": src_changes,
                   "blockNearNames": near_names,
                   "blockNearestKm": None if near_min is None else round(near_min, 3),
                   "returned": returned,
                   "naiveRemoved": naive_removed,
                   "naiveReturned": naive_returned,
                   "naiveMoved": naive_moved,
                   "seamPairs": seam_pairs,
                   "seamNames": seam_names,
                   "seamCdi": seam_cdi,
                   "seamCdiSameN": seam_cdi_same_n,
                   "pickKeyCollisions": pick_key_collisions,
                   "phaseSrc": phase_main,
                   "phaseMainStream": pick_stream_index[phase_main.split("/")[0]],
                   "phaseForeign": phase_foreign,
                   "phaseCrossings": phase_crossings,
                   "seamPickNames": seam_pick_names,
                   "seamPickInstants": seam_pick_instants,
                   "figDisagree": fig_disagree,
                   "noAz": sum(p["noAz"] for p in phases)},
        "phaseStreams": pick_streams,
        "figRecord": fig_record,
        "figNaive": fig_naive,
        "sources": {
            "detail": f"{FDSN}?format=geojson&eventid={detail['id']}"
                      f"&includesuperseded=true",
            "phase": phases[-1]["url"],
            "felt": raw[-1]["url"],
        },
        "built": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d"),
    }

    here = __file__.rsplit("/", 1)[0]
    with open(f"{here}/template.html", encoding="utf-8") as f:
        html = f.read()
    html = html.replace(
        "/*DATA*/null/*DATA*/", json.dumps(payload, separators=(",", ":")))
    out = f"{here}/{detail['id']}.html"
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)

    # ---- what the history says, printed so the build is checkable ----------
    last = phases[-1]
    print(f"origin   {payload['origin']}  depth {depth} km")
    print(f"arrivals {len(phases)} version(s): "
          + ", ".join(f"+{p['min']:.1f} min ({len(p['picks'])} picks,"
                      f" {p['picks'][0]['deg']}..{p['picks'][-1]['deg']}deg)"
                      for p in phases))
    print(f"         last arrival record published +{last['min']:.1f} min"
          f" = +{last['min']/1440:.2f} d after the origin")
    print(f"         publisher: {phase_main}, {phase_foreign} version(s)"
          f" published under another event source, {phase_crossings} crossing(s);"
          f" {seam_pick_names} name(s) survive a crossing, {seam_pick_instants}"
          f" of them at a different published arrival instant")
    print(f"         the file's arrival figure, read as the records the list"
          f" contains and read as one list, at each of the {len(phases)}"
          f" version(s) in force: {fig_disagree} disagreement(s)")
    if fig_disagree:
        for j, (a, b) in enumerate(zip(fig_record, fig_naive)):
            if a != b:
                print(f"           v{j}: as its own record {a}, as one list {b}")
    f0, fN = versions[0], versions[-1]
    total = sum(n for ver in versions for _i, n, _c in ver["a"]) \
        if False else None
    # From iteration 15 a block stands against the epicentre **its own record**
    # last published it under. Where two publishers' records are served in one
    # list, one of them revising the origin does not move the other's blocks:
    # they were never published against that origin, and this file computes no
    # position the record did not publish.
    st, st_e = {}, {}
    for ver in versions:
        for i, n, _c in ver["a"]:
            st[i] = n
            st_e[i] = ver["e"]
        for i, n, _c in ver["c"]:
            st[i] = n
            st_e[i] = ver["e"]
        for i in st:
            if blocks[i]["s"] == ver["s"]:
                st_e[i] = ver["e"]
        for i in ver["d"]:
            st.pop(i, None)
            st_e.pop(i, None)
    print(f"felt     {len(versions)} version(s): first +{f0['min']:.1f} min,"
          f" last +{fN['min']:.1f} min = +{fN['min']/1440:.2f} d")
    print(f"         {len(blocks)} blocks ever published,"
          f" {sum(st.values())} responses at the last version")
    print(f"         accretion check: {added} block(s) appeared,"
          f" {changed} changed, {removed} disappeared,"
          f" {returned} came back, {decreases} count(s) went down")
    print(f"         publisher: {main_src}, {foreign_versions} version(s)"
          f" published under another event source, {src_changes} change(s)")
    print(f"         read as one list, as iterations 6 to 14 read it:"
          f" {naive_removed} disappeared, {naive_returned} came back,"
          f" {naive_moved} intensity move(s) at an unchanged reporter count")
    print(f"         the crossings: {seam_pairs} pair(s) of versions cross"
          f" publishers, naming {seam_names} block(s) in common, of which"
          f" {seam_cdi} are published at a different intensity by the two"
          f" and {seam_cdi_same_n} of those at the same reporter count")
    print(f"         name check: {block_key_collisions} block name collision(s)"
          f" in a version, {ring_disagree} outline disagreement(s),"
          f" {NAIVE_INSTANTS[0]} instant(s) published with no zone,"
          f" {near_names} pair(s) of names closer than half a cell"
          f" (nearest {0.0 if near_min is None else near_min:.3f} km),"
          f" {pick_key_collisions} pick name collision(s)")
    print(f"         {len(epis)} distinct published epicentre(s)")
    for i, e in enumerate(epis[1:], start=1):
        moved = gc_km(epis[i - 1]["lat"], epis[i - 1]["lon"], e["lat"], e["lon"])
        print(f"         at +{e['min']:.1f} min the origin moved {moved:.2f} km"
              f" and every felt report moved with it")
    lo = [blocks[i]["lo"][st_e[i]] for i in st]
    hi = [blocks[i]["hi"][st_e[i]] for i in st]
    wid = sorted(h - l for l, h in zip(lo, hi))
    print(f"         final epicentral extent {min(lo):.2f} .. {max(hi):.2f} km,"
          f" every edge a published vertex")
    print(f"         each block occupies {wid[0]:.3f} .. {wid[-1]:.3f} km of that"
          f" axis (median {wid[len(wid)//2]:.3f} km);"
          f" {ring_disagree} outline(s) were ever republished differently")
    if len(epis) > 1:
        e0, e1 = fN["e"] - 1, fN["e"]
        if e1 > 0:
            mv = sorted(abs(((blocks[i]["lo"][e1] + blocks[i]["hi"][e1]) / 2)
                            - ((blocks[i]["lo"][e0] + blocks[i]["hi"][e0]) / 2))
                        for i in st
                        if blocks[i]["lo"][e0] is not None
                        and blocks[i]["lo"][e1] is not None)
            if mv:
                print(f"         the last revision moved {len(mv)} of these blocks"
                      f" by {mv[0]:.3f} .. {mv[-1]:.3f} km"
                      f" (median {mv[len(mv)//2]:.3f} km) —"
                      f" against a block's own width of"
                      f" {wid[len(wid)//2]:.3f} km")
    print(f"wrote    {out}")

    # ---- the guards, on their own channel ----------------------------------
    # From iteration 16, and it is the one change here that came from the
    # reading rather than from the data. MEOT 143 names the limit of the Watt
    # governor: its feedback travels through the same shaft that carries the
    # motive power, so the engine must already have slowed before regulation
    # can act. Every check this work has ever written travels in the same
    # channel as the work — it is printed into the file it checks — and on
    # 2026-09-09 that cost exactly what the page says it costs: iteration 9's
    # pick-name guard fired on the Hawaiian instance, the number 10 was
    # published in the file by iterations 14 and 15, and for two sessions
    # nobody read it. A guard that fires now says so where the build is read,
    # not only where the work is.
    #
    # **Iteration 17 gives the channel somewhere to arrive.** Iteration 16's own
    # protocol named what a build log does not do: it is read by whoever runs
    # the build, and the next session reads the repository. So a firing is also
    # appended to `works/arrival/guards.md` — dated, with the event and the
    # iteration — and the build exits non-zero. The first makes the firing
    # durable and diffable; the second makes it hard to produce an instance
    # without seeing it. Neither makes a session read it, and that is said here
    # rather than left to look solved: the only thing that could is an
    # obligation on the protocol, which lives in `record/` and not in this file.
    guards = [
        ("pick names claimed twice in one version", pick_key_collisions),
        ("block names claimed twice in one version", block_key_collisions),
        ("outlines republished differently", ring_disagree),
        ("instants published with no zone designator", NAIVE_INSTANTS[0]),
        ("picks with no published azimuth", sum(p["noAz"] for p in phases)),
        ("picks dropped for having no published residual",
         sum(p["noRes"] for p in phases)),
        ("distinct block names closer than half a cell", near_names),
        ("versions where the two readings of the arrival figure differ",
         fig_disagree),
        ("blocks of another record standing at the last version",
         felt_foreign_standing),
    ]
    fired = [(n, v) for n, v in guards if v]
    if fired:
        print(f"!! {len(fired)} guard(s) fired on this build, and a guard that"
              f" fires is a thing to read, not a thing to publish:")
        for n, v in fired:
            print(f"!!   {v} {n}")
        log = f"{here}/../guards.md"
        iteration = here.rsplit("/", 1)[-1]
        stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%MZ")
        body = "".join(f"- **{v}** {n}\n" for n, v in fired)
        # What this file records is what the guards say, not how many times the
        # script was run: a rebuild that fires the same guards on the same event
        # and the same iteration adds nothing and is not appended. A rebuild
        # that fires a *different* set is a change in the record and is.
        prev = ""
        if os.path.exists(log):
            old = open(log, encoding="utf-8").read()
            mark = f" — {detail['id']} — {iteration}\n"
            if mark in old:
                prev = old.rsplit(mark, 1)[1].lstrip("\n")
        if prev.split("\n##")[0].strip() == body.strip():
            print(f"!! unchanged since the last build of this event on this"
                  f" iteration, so {log} is not appended to")
        else:
            fresh = not os.path.exists(log)
            with open(log, "a", encoding="utf-8") as f:
                if fresh:
                    f.write(HEADER)
                f.write(f"\n## {stamp} — {detail['id']} — {iteration}\n\n")
                f.write(body)
            print(f"!! appended to {log}")
        print("!! this build exits non-zero, so that a firing is not something"
              " a script can walk past")
        GUARDS_FIRED[0] = len(fired)
    else:
        print("         no guard fired on this build")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else None)
    # A guard that fired leaves the process, not only the log. The file is
    # written either way — refusing to write it would hide the evidence the
    # guard is about — but the build does not report success.
    sys.exit(2 if GUARDS_FIRED[0] else 0)
