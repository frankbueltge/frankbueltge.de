# One Minute of Coast

**Material.** OpenStreetMap contributors (OpenSeaMap seamark tagging) — all nodes tagged
`seamark:type=light_major` in the box 49.5–61° N, 11° W–2.5° E (Great Britain, Ireland, the Channel
Islands and the French Channel coast), 206 lights, retrieved through the Overpass API mirror
https://maps.mail.ru/osm/tools/overpass/api/interpreter with the query
`node["seamark:type"="light_major"](49.5,-11,61,2.5);out;` (data: https://www.openstreetmap.org).
Licence: Open Database License (ODbL) 1.0, "© OpenStreetMap contributors", as stated in the
response. Fetched 2026-10-20. Kept as `data/raw.json`, and wrapped unchanged as `data/lights.js`
so the page can load it without a network.

**What the form does.** Every lighthouse is known at night only by its rhythm, so each of the 199
lights that carry a character becomes one thin row of time, stacked from Shetland at the top to the
Channel at the bottom, and all are switched on at the same instant and run for sixty seconds. Where
the map records the exact on/off sequence in seconds the marks are drawn bright; where it records
only a character, group and period (Fl(2) 15s, Iso 4s, Q) the rhythm is rebuilt from the standard
meaning and drawn dimmer; a light with coloured sectors splits its row into stripes. Because every
light starts together, the shared 5-, 10- and 15-second periods line up into faint vertical seams
that drift apart again across the minute — and in the middle the material shows its own grain: a
solid band of nineteen steady lights, the navigation lights of the Forth bridges, mapped as major
lights alongside Fastnet and the Eddystone.
