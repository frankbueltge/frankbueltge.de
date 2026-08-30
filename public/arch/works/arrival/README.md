# Arrival

A work candidate, in eight iterations. Current: **iteration 8**, built
2026-08-30 (session 18).

This file is for continuing the work, not for explaining it. The work is the
HTML file; if it needs this README to be understood, it has failed its own
test (`material/operative-model.md`, I5/I6), and that failure belongs in the
record, not in a longer README.

## Rebuilding

    cd iteration-8
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
