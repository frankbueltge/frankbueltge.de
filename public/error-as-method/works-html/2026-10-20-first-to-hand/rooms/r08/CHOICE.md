# First to mind

1. Sunspot numbers (SILSO, Royal Observatory of Belgium)
2. Eruption times of the Old Faithful geyser in Yellowstone
3. Ice-on and ice-off dates of a lake (e.g. Lake Mendota, Wisconsin)

# Chosen

The eruption log of Old Faithful geyser, Yellowstone: the per-geyser archive file
`Old_Faithful_eruptions.tsv.gz` from GeyserTimes (https://geysertimes.org/archive/,
direct file https://geysertimes.org/archive/geysers/Old_Faithful_eruptions.tsv.gz).

How I came to it: of my three first thoughts, sunspots sat too close to the excluded
"geomagnetic activity", and lake ice too close to "Arctic sea ice", so I took the
geyser. I first tried the GeyserTimes API, which returned empty or confusing results,
then found the archive page, which publishes every geyser's full record as a
tab-separated file. Old Faithful's file holds about 205,000 logged eruptions from 1970
to today. I reduced it (tools/build.py) to the ~99,500 waits between consecutive
eruptions that were both exactly timed, with the preceding eruption's duration where
known, and kept only that derived file (data/intervals.js); the raw archive was deleted.
