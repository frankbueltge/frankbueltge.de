# First to mind

1. The world's lighthouses and their light characteristics (flash periods, ranges) from OpenStreetMap.
2. Sunspot numbers since the 1700s (SILSO, Royal Observatory of Belgium).
3. The Old Faithful geyser eruption intervals.

# Chosen

The first of the three: lighthouses and their light characteristics. I tried to fetch every
OpenStreetMap lighthouse carrying a `seamark:light:period` tag through the Overpass API, but the
main server reset the connection and two mirrors returned 502. So I went to the authoritative
source behind such charts: the US National Geospatial-Intelligence Agency's List of Lights, Radio
Aids and Fog Signals, which its Maritime Safety Information site serves as JSON. I took
Publication 114 (British Isles, English Channel and North Sea), 3,002 lighted aids, each with
position, characteristic (colour, period, and the exact flash and eclipse durations) and range.

URL: https://msi.nga.mil/api/publications/ngalol/lights-buoys?volume=114&includeRemovals=false&output=json
(publication page: https://msi.nga.mil/Publications/NGALOL)
