# First to mind

1. Daily sunspot numbers (SILSO, Royal Observatory of Belgium)
2. Ship logbook weather observations from the 18th–19th century (CLIWOC)
3. Lighthouses and their light characteristics — flash rhythm, period, colour, range (OpenStreetMap seamark tags)

# Chosen

The lights of the major lighthouses around Great Britain, Ireland and the French Channel coast, as
mapped in OpenStreetMap with OpenSeaMap seamark tags: every node tagged `seamark:type=light_major`
inside the box 49.5–61° N, 11° W–2.5° E, with its light character (Fl, Oc, Iso, Q, F), group,
period, colour, sectors and — often — the exact on/off sequence in seconds.

Fetched through the Overpass API: https://maps.mail.ru/osm/tools/overpass/api/interpreter
(query: `node["seamark:type"="light_major"](49.5,-11,61,2.5);out;`), after overpass-api.de and
overpass.kumi.systems refused or timed out. Data: https://www.openstreetmap.org (ODbL).

How I came to it: the first two ideas were close to things already taken (sunspots sit next to
geomagnetic activity; ship-log weather sits among the atmospheric sets), while a lighthouse's light
is a thing whose whole identity is a rhythm in time — each light is told apart at night only by its
pattern of flashes. A query for `seamark:type=lighthouse` came back empty; OpenSeaMap tags
lighthouses as `light_major`, and that query returned 206 lights.
