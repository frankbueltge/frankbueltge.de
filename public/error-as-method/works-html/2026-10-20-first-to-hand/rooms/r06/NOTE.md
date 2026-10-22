# Long Exposure

**Material.** U.S. National Geospatial-Intelligence Agency (NGA), Maritime Safety Information:
*List of Lights, Radio Aids and Fog Signals*, Publication 114 — British Isles, English Channel and
North Sea (3,002 lighted aids). Fetched as JSON from
https://msi.nga.mil/api/publications/ngalol/lights-buoys?volume=114&includeRemovals=false&output=json
(publication page https://msi.nga.mil/Publications/NGALOL). Licence: no licence is stated with the
data; it is a U.S. Government work published for free public download, generally not subject to
copyright in the United States. Fetched 20 October 2026. Raw file kept as `data/pub114_raw.json`;
`tools/prep.py` reduces it to `data/lights.js` (2,851 lights after dropping radar beacons/Morse
RACONs and entries without position).

**What the form does.** Every light is placed at its charted position and allowed to glow out to
its nominal range, at true scale (a nautical mile is a minute of latitude), with its own colour —
sector lights split their light among their colours. The brightness each light deposits is
proportional to its duty cycle, the fraction of its period it is actually lit, worked out from the
listed flash and eclipse durations (fixed lights count as always on; where phases are not listed,
a typical value for the rhythm is assumed, and lights with no stated range are drawn at one mile).
The deposits are summed and tone-mapped like a photograph left open all night. The coastline of
northwest Europe draws itself out of light, but turned inside out: the small steady red and green
harbour lights burn in hard, while the famous offshore lighthouses — Bishop Rock, flashing a tenth
of a second every fifteen — survive only as wide, faint haze over the water.
