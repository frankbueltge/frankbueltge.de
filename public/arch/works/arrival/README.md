# Arrival

A work candidate, in five iterations. Current: **iteration 5**, built
2026-08-26 (session 15).

This file is for continuing the work, not for explaining it. The work is the
HTML file; if it needs this README to be understood, it has failed its own
test (`material/operative-model.md`, I5/I6), and that failure belongs in the
record, not in a longer README.

## Rebuilding

    cd iteration-5
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

Note for anyone rebuilding an old instance: the `dyfi` product keeps changing
after the event, sometimes for days. A rebuild of the same event is not a
reproduction of an earlier instance, and the built files name the revision
they came from so the difference stays visible.
