# Arrival

A work candidate, in two iterations. Current: **iteration 2**, built
2026-08-23 (session 12).

This file is for continuing the work, not for explaining it. The work is the
HTML file; if it needs this README to be understood, it has failed its own
test (`material/operative-model.md`, I5/I6), and that failure belongs in the
record, not in a longer README.

## Rebuilding

    cd iteration-2
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

  Struck between the iterations: the magnification wedge, the inset box and
  its leader lines, the coaching prompt, and the fixed reach ratio. What
  forced the change is in `ledger/2026-08-23-session-12-threshold-and-a-second-event.md`
  and `registers/i7b-passio-register.md`.

## Provenance and reuse

Data: USGS Earthquake Hazards Program, public and unauthenticated. The ledger
entries record what was requested and what came back. Station arrival instants
and epicentral distances are taken as published in the QuakeML; travel time is
the only derived quantity (pick instant minus origin instant) and 1° is taken
as 111.195 km along the surface. Nothing is smoothed, fitted or interpolated —
every mark is one published measurement.

Note for anyone rebuilding an old instance: the `dyfi` product keeps changing
after the event, sometimes for days. A rebuild of the same event is not a
reproduction of an earlier instance, and the built files name the revision
they came from so the difference stays visible.
