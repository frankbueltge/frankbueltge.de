# Arrival

A work candidate, in twelve iterations. Current: **iteration 12**, built
2026-09-04 (session 22).

This file is for continuing the work, not for explaining it. The work is the
HTML file; if it needs this README to be understood, it has failed its own
test (`material/operative-model.md`, I5/I6), and that failure belongs in the
record, not in a longer README.

## Rebuilding

    cd iteration-12
    python3 build.py                 # most recent event carrying both products
    python3 build.py us6000tmta      # a named event

Standard library only, Python 3.9+. `build.py` writes `<eventid>.html` next to
itself from `template.html`. Each build is a new instance from live public
data, not a re-render of stored output; the built file embeds its data, its
source URLs and the product revision ids it was built from, and makes no
network request when opened.

Requirements on an event: it must carry both a `phase-data` product (the
instrument arrivals) and a `dyfi` product (the human reports). Not every event
has both — `build.py` with no argument walks recent M ≥ 5 events until it
finds one that does. Of the 60 most recent M ≥ 5 events surveyed on
2026-08-23, 22 carried both.

## The lineage

Earlier iterations are kept whole and are not edited (`DOWRY.md`, floor rule
5). Each directory holds its own generator, template and built instances, and
still runs.

- **`iteration-1/`** — session 11. One linear distance axis, travel time
  against distance, the felt reports carried in a magnification wedge out of
  the 2.3 % of the axis they occupy. Pair-click any two seismometers for the
  apparent surface speed between them.
  Instance: `us6000tmta.html`.

- **`iteration-2/`** — session 12. Both networks against **one shared
  logarithmic distance axis** — the only coordinate they share, because no
  arrival time is published for a felt report — with seconds above the axis
  and a count of felt reports below it, and the threshold for what counts as a
  felt report handed to whoever opens the file. Pair-click retained.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru,
  M 6.7).

  Struck between iterations 1 and 2: the magnification wedge, the inset box and
  its leader lines, the coaching prompt, and the fixed reach ratio. What forced
  the change is in `ledger/2026-08-23-session-12-threshold-and-a-second-event.md`
  and `registers/i7b-passio-register.md`.

- **`iteration-3/`** — session 13. Both networks get a corroboration control,
  not just the human one. The instruments answer to a threshold on each pick's
  published **time residual** (its disagreement with the fitted origin); the
  felt reports answer to a threshold on the **number of reporters** per block.
  The same act — demand more corroboration — is now performed on both networks,
  and the work shows what it costs each: demand the same evidence fraction and
  the instrument reach barely moves while the human reach collapses. Each pick's
  QuakeML `evaluationMode` is carried as published provenance, quoted and not
  made a control. Pair-click is struck; the two thresholds are the work.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru,
  M 6.7).

  Struck between iterations 2 and 3: the single (human-only) threshold, and
  with it iteration 2's silent treatment of the instrument reach as unquestioned
  ground. What forced the change is in
  `ledger/2026-08-24-session-13-strictness.md`.

- **`iteration-4/`** — session 14. The two measures are shown instead of
  explained. Iteration 3 set both thresholds with the same widget and needed a
  caption to say that the two measures behind them are not the same measure;
  here each threshold is set on a drawing of the population it cuts — every
  pick at its own published residual on a signed axis in seconds, and one cell
  per felt block stacked in the column for the number of people who reported
  from it. The act stays shared and stands once, above both. Each record's
  publication instant is carried in the footer as published, so a reader can see
  that the arrivals and the felt reports stopped at different times.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru,
  M 6.7).

  Struck between iterations 3 and 4: the caption that explained the two
  measures, and the symmetric pair of widgets that had made it necessary. What
  forced the change is in `ledger/2026-08-25-session-14-two-measures.md`.

- **`iteration-5/`** — session 15. The axis is corrected and the question
  changes with it. Iterations 2 to 4 put the two networks on "one shared axis"
  that was not one: a pick's published distance is to the **epicentre**, a felt
  block's to the **hypocentre**, and on a deep event the whole of that
  difference falls on the near field — Japan's human network begins at 0.079°
  and had been drawn at 0.549°. Each block is now placed at the epicentral
  distance computed from the outline its own product publishes for it. On the
  corrected axis each network is an interval, and the shared axis carries a
  strip saying who was present at each distance: above the line the machines,
  below it the people. The demand for corroboration then does something the
  earlier iterations could not show — it takes the human network's far edge and
  the instrument network's near edge, so the two retreat from each other until
  no distance is left at which both stand. Of the 48 threshold states Japan
  admits, 3 keep a shared region.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru,
  M 6.7).

  Struck between iterations 4 and 5: the mixed axis; the reach ratio the work
  had carried as its headline since iteration 2; and the "reaches / of its full
  reach" table, which measured only outer edges and thereby hid the finding.
  What forced the change is in `ledger/2026-08-26-session-15-two-origins.md`
  and `registers/i7b-passio-register.md`.

- **`iteration-6/`** — session 16. The instant of reading is handed over too.
  Iterations 1 to 5 were each built from the current version of each product and
  carried, in the footer, a sentence saying that the two records had last moved
  at different times — an apology for comparing two records as though both were
  finished. The apparatus publishes every version it ever served, so the
  apology becomes material: this iteration is built from all of them, and the
  encounterer moves through the whole publication history on a strip drawn in the
  figure's own convention, machines above the line and people below it. Two
  seismometer publications above; eighty felt publications below. Moving through
  it shows what no earlier iteration could: that waiting extends the human
  network and never corroborates it — Japan's two-reporter interval stops moving
  seven hours after the event and does not move again in the following 2.9 days,
  46 publications and 46 reports; and that the epicentre, the depth and the
  origin instant a felt report is measured from are computed by the instrument
  network and revised under it, so that every felt report moves although nobody
  reported anything.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru,
  M 6.7).

  Struck between iterations 5 and 6: the footer sentence about when each record
  last moved, and the single-revision provenance line it stood on; and the
  identity line's static epicentre and depth, which this iteration shows are not
  properties of the earthquake. What forced the change is in
  `ledger/2026-08-28-session-16-two-becomings.md` and
  `registers/i7-virtuality-register.md`.

- **`iteration-7/`** — session 17. No mark is a point. Iteration 6 showed that
  the felt record does not own the coordinate it is drawn on, and left standing
  the question of what that costs it; the cost is measurable against the one
  thing the felt record does own, the size of its own cells. A block is
  published as a 1 km cell, 1.41 km across, and the instrument network's single
  revision displaced the median Japanese block by 1.21 km and the median
  Peruvian block by 8.97 km — about one whole block, or about six and a half.
  So a block is now drawn across the distances its published outline actually
  occupies, nearest published vertex to farthest, which on a logarithmic axis
  makes the near field wide and the far field a hairline; the count inside a
  distance becomes a band between a certainly-inside and a possibly-inside
  staircase; and the same act is performed on the other network, where a pick is
  drawn from the instant it arrived to the instant the fit predicted for it. At
  this scale that mark is under a pixel on both events at every state, and that
  is the finding rather than a failure to draw it. The identity line now reads
  both solutions, because the felt half can still be standing on an older one
  than the arrival half — on these two events at 1 instant of 82 and 2 of 39.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru,
  M 6.7).

  Struck between iterations 6 and 7: the footer sentence "A block is published
  as a 1 km cell, so no position here is finer than that, and none is drawn
  nearer the epicentre than half a cell", and the clamp in `build.py` it
  described — which never once fired on either event. What forced the change is
  in `ledger/2026-08-29-session-17-what-it-costs.md`.

- **`iteration-8/`** — session 18. Below the axis, a measurement instead of a
  census. Session 17 found that the instrument network's revision barely
  disturbs the human record's ordering, and left standing the question of what
  structure the human record has that it does not borrow. It has one: the felt
  record publishes three things per block that owe the instrument network
  nothing — the outline, the number of people who reported, and the intensity
  they reported — and the last of those is an ordering it makes of itself. That
  ordering is not the borrowed one: "nearer the epicentre is stronger" holds on
  66.3 % of untied pairs on Japan and 70.0 % on Peru, and between blocks within
  a quarter of each other's distance it holds on 52.7 % and 56.2 %, which is no
  ordering at all. The felt record resolves the radial structure at about a
  factor of three in distance and no finer, on an axis ruled to its own 1.4 km.
  So the lower half stops counting records inside a distance and draws what the
  people published: a block stands at its own published intensity, spanning the
  distances its outline occupies as in iteration 7. Both halves are then a
  measurement its own network made — seconds above the line, intensity below —
  and the figure shows, without a caption, that one of them lies near a curve
  and the other does not. The footer says why: a solution was fitted to put the
  arrivals there, and nothing is fitted to the intensities. `build.py` is
  unchanged apart from its header: the intensity has been fetched, parsed and
  written into every instance since iteration 1 and was drawn nowhere.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru,
  M 6.7).

  Struck between iterations 7 and 8: the cumulative-count staircase, the
  possibly-inside/certainly-inside band it was drawn as, and the axis label
  "felt reports within". Corrected in 8: iteration 7's depth tick printed a
  single number for how many blocks lie inside the source depth, one iteration
  after the work struck that same false precision everywhere else — on Japan 89
  lie wholly inside, 91 reach in, 90 do by their centres. What forced the change
  is in `ledger/2026-08-30-session-18-what-it-owns.md`.

- **`iteration-9/`** — session 19. No mark has always stood where it stands.
  Session 18 left standing the question of what happens at a jolt — the felt
  record's own ordering does not drift but reorders at 9 of 79 publications on
  Japan and 4 of 36 on Peru. A jolt is one person: eight of Japan's nine and
  three of Peru's four move exactly one block, and over 115 transitions across
  both events not one intensity ever moved at an unchanged reporter count. The
  same question asked of the other network inverts the comparison the last four
  sessions were built on. The arrival record's own measurement of itself is the
  residual, and its single revision reversed 10.3 % of that ordering on Japan
  and 20.6 % on Peru — 8.7 % and 20.6 % counting only the picks whose station
  published an identical arrival instant, where nothing was observed at all.
  One record's values move when a person acts; the other's move when a fit
  moves. So both halves of the figure, and the residual strip beside it, now
  draw where each mark has already been published, at or before the instant
  being read: below the axis a block's earlier intensity and earlier distances,
  in the strip a pick's earlier residual with a tail, in the file's own colour
  for something that changed while nothing was observed. Above the axis the
  same act is performed and the trace is a fraction of a pixel, which is drawn
  rather than hidden. `build.py` changes for the first time since iteration 6,
  and both changes are identity claims: a pick gets a name that survives
  republication, checked not assumed, and carries its arrival instant counted
  from an origin that belongs to no version.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru,
  M 6.7).

  Struck between iterations 8 and 9: the footer sentence "At each revision every
  felt report in this file moved, although nobody reported anything" — prose
  standing in for a picture, on the ground iteration 7 struck the 1 km cell
  sentence. What forced the change is in
  `ledger/2026-08-31-session-19-what-a-jolt-is.md` and
  `registers/i7-virtuality-register.md`.

- **`iteration-10/`** — session 20. The strips beneath the figure stop
  counting themselves. Session 19 found that the felt record's intensity moves
  only when a second person answers, and left open which blocks those are. They
  are not chosen by the earthquake: neither distance from the epicentre nor
  published intensity separates them, on either event. On the Japanese event
  they are chosen by the record's own crowd — a median of 12 other blocks
  already published within 10 km of them when they first appeared, against 3 for
  the blocks that never move — and they stand close together, 11.3 km apart
  against 33.2 km for random sets drawn from the same versions. On the Peruvian
  event, five blocks and nothing measurable. The same question asked of the
  other network answers differently: a station is re-picked where the record
  already disagreed with itself, not where stations are dense, and the re-pick
  does not remove the disagreement that selected it — 5 of 13 picks ended nearer
  zero and the median per-pick change was +0.12 s. So both strips stop stacking
  their populations, which was a tally, and stand each mark at how many marks of
  its own record were standing within a distance of it; that distance is handed
  over, on a ladder of the felt record's own cell size by powers of ten, because
  it is a constant neither record justifies. Below the axis the right-hand
  columns then stand high on one event and scatter on the other; above it the
  heights say nothing about the residual, which is the finding rather than a
  failure to draw it. `build.py` changes for the second time since iteration 6:
  a pick gets a place on the ground, from the epicentral distance and the
  azimuth its own version publishes about the epicentre that version published,
  looked up in no station inventory.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru,
  M 6.7).

  Struck between iterations 9 and 10: the packing levels in the residual strip
  and the column stack in the felt strip — both of them tallies of how many
  marks were beside a mark, which is the habit iteration 8 struck above the axis
  and left standing below it. What forced the change is in
  `ledger/2026-09-01-session-20-what-a-crowd-is.md`.

- **`iteration-11/`** — session 21. A mark that has moved twice is drawn as a
  path, not as a fan. The reproduction check that opens every session returned,
  for the first time, a record that had moved: the Peruvian arrival record
  published a **third** version on 2026-09-02, twelve days after the second, and
  the felt record recomputed itself sixty-four seconds later, moving every one of
  its 53 blocks by a median of 12.66 km — nine block-widths — while nobody
  reported anything. Iterations 9 and 10 drew each earlier position of a mark
  with a line straight to the position it holds now, and listed each position at
  most once. Both were true of a record that had published its arrivals exactly
  twice; with three versions the fan says a mark revised at two revisions made
  two independent moves out of the past, which is not what the record says. Each
  segment now joins two **consecutive** published positions, in the residual strip
and   in both halves of the figure, and a mark that came back to a position it had
  left is drawn there twice. What that lets the file show is what the session
  measured: the two revisions are not the same act. The first, published within
  the hour, takes the picks the record already disagreed with and leaves them
  **further** from the fit (Japan, median per-pick change +0.120 s, P(random ≥
  obs) 0.0214); the one published a fortnight later takes the far field
  (72.65° against 23.54°, P 0.0000), roughly doubles the picks, and moves what it
  touches **nearer** (−0.390 s, 35 of 51, P(random ≤ obs) 0.0058) while
  everything it does not touch drifts away. Session 20's sentence — that the
  arrival record's revision is a selection and not a correction — is corrected
  beside itself: it is true of a first revision and false of that late one.
  Corrected here too: a defect dating from iteration 5, where the scales were
  first fixed over the whole publication history, which passed every published
  value to `Math.min` as an argument and overflowed the call stack on the first
  record long enough to reach it. It never fired on the two work events and it
  is why a third could not be built until today.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru, M 6.7),
  and — the first new event since session 12 — `us6000tjl2.html` (Colombia,
  M 7.4, 678 blocks, 1167 responses, 354 published versions of the felt record),
  on which session 20's crowd finding replicates in direction and scale.

  Struck between iterations 10 and 11: the fan of lines from every earlier
  position to the present one, and the rule that listed a position once however
  often a mark stood there. What forced the change is in
  `ledger/2026-09-03-session-21-what-a-second-revision-is.md`.

- **`iteration-12/`** — session 22. The lower strip draws the path device the
  upper strip has carried since iteration 11, on the same rule: consecutive
  published position to consecutive published position, in publication order, up
  to the instant on show and never past it, consecutive repeats collapsed. Its
  two colours carry the one distinction this strip can make and the one above
  cannot — a segment across which the block's own published reporter count
  changed (someone reported from it) against one across which only its company
  changed (nobody did, and the record filled in around it). The disclosure line
  gains the count that separates them.

  **Why it gains it is a withdrawal, not a discovery.** That strip's vertical
  coordinate — a block's company within the chosen distance at the instant on
  show — was placed there because sessions 20 and 21 had measured that it
  separated the blocks the record goes on to revise from the blocks it leaves
  alone. Run against the control both of those sessions had named and neither had
  run — hold fixed how crowded each block's place is in the last published
  version, and ask what the company standing there at the moment adds — the
  separation is gone: conditioning on when the block appeared leaves it
  (P 0.0000), conditioning on the block's own first reporter count leaves it
  (P 0.0000), conditioning on the place removes it entirely (P 0.9992 at 10 km,
  1.0000 at 3 km). It was the place all along. The coordinate stays, because the
  record publishes it; what it may no longer do is stand as a bare position with
  a withdrawn claim behind it.

  **And a sentence is struck from the template.** Iteration 11 carried, in its
  own source, the claim that the first revision selects the picks the record
  already disagreed with while the late one takes the far field and moves it
  nearer. Measured over every M ≥ 5.0 event of a fixed ten-week window that
  published both an early and a late revision — 84 events, 475 versions, 139
  testable revisions, nothing sampled — neither half survives: revisions of both
  ages move the picks they touch toward the fit by about the same amount (median
  −0.163 s early, −0.190 s late; paired within event, P 0.7623), and the late one
  takes the **nearer** field, not the further. What separates them is size, not
  kind — a late revision re-picks a median 7.9 % of what is already there against
  an early revision's 30.5 %. Late revisions are also not rare: 473 of the 490
  events in that window carry one.
  Instances: `us6000tmta.html` (Japan, M 5.8), `us6000tm81.html` (Peru, M 6.7),
  `us6000tjl2.html` (Colombia, M 7.4).

  Struck between iterations 11 and 12: the sentence above, and the lower strip's
  standing as a coordinate without a drawing of its own motion. What forced the
  change is in `ledger/2026-09-04-session-22-what-the-company-was.md`.

## Provenance and reuse

Data: USGS Earthquake Hazards Program, public and unauthenticated. The ledger
entries record what was requested and what came back. Station arrival instants
and epicentral distances are taken as published in the QuakeML. From iteration
5 three quantities are derived and no others: a pick's travel time (pick
instant minus origin instant); a felt block's epicentral distance (great-circle
from the epicentre its own product publishes to the outline that product
publishes for the block, on a sphere of 6371 km); and 1° taken as 111.195 km
along the surface, for showing one unit in the other. Iterations 1 to 4 derive
only the first two of those, and place a felt block by dividing its published
distance by 111.195 — which is the defect iteration 5 exists to correct, and
they are kept as they were. Nothing is smoothed, fitted or interpolated — every
mark is one published measurement.

From iteration 7 a block's two epicentral distances are computed — to the
nearest and to the farthest vertex of its published outline — and a vertex is
never interpolated between two published ones, so the file still contains no
interpolation. Iterations 5 and 6 derive one distance, to the outline's centre,
and clamp it at half a cell.

Iteration 8 derives nothing further. It draws a block's published intensity,
which every iteration since the first has carried into the file and none has
drawn. Neither quantity now drawn as a mark's height is raw, and neither is
this practice's: a pick's residual is computed by whoever fitted the solution,
a block's intensity by whoever runs the questionnaire. Each is taken as its own
record published it, unrounded and unbinned, exactly as the arrival instants
and the outlines are.

From iteration 6 the source is the same apparatus asked for its whole history
(`includesuperseded=true`), and the derived quantities are the same three, with
each computed against the version that published its inputs: a pick's travel
time against the origin instant published in its own version, a felt block's
epicentral distance against the epicentre published in the version that carries
it.

Note for anyone rebuilding an old instance: the `dyfi` product keeps changing
after the event, sometimes for days. A rebuild of the same event is not a
reproduction of an earlier instance, and the built files name the revision
they came from so the difference stays visible. From iteration 6 that note is
no longer a caveat about the work but the subject of it.

Iteration 11 derives nothing further and adds no quantity; it changes only what
is drawn from the ones already there, and corrects the whole-history extremes so
that a record with hundreds of published versions can be built at all.

Iteration 10 derives two more and says so in the file: a pick's place on the
ground, from its own published epicentral distance and its own published
azimuth about the epicentre its version published, on the same sphere and by the
same great circle run forwards; and the number of a record's own marks standing
within a distance of one of them, counted over the population standing at the
instant being read. Neither is looked up anywhere: a pick with no published
azimuth would get no place and be counted rather than placed, and on both work
events that count is zero. Iteration 10 is also the first to let a control
rescale an axis — the neighbourhood rung, and only the two strips' vertical
rule — which the file discloses at every state by drawing both ends of that
rule.
