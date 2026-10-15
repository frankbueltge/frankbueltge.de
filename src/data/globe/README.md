# The ground under the globe

Three files, and the rule they share: nothing on the page depends on a source answering today.
Every one of them is committed here, so a figure can be redrawn from this repository alone.

## The geography

`land-110m.json` and `countries-110m.json` are the 1:110m TopoJSON files from
[world-atlas](https://github.com/topojson/world-atlas) 2.0.2 (ISC licence), a redistribution of
[Natural Earth](https://www.naturalearthdata.com/) 4.1.0 vector data, which is in the public
domain. Both are copied **unchanged** out of `node_modules/world-atlas/` — the same bytes, so a
reader can verify them with one checksum against the published package:

| File | What it holds |
|---|---|
| `land-110m.json` | one `land` object — the coastlines the plate and the globe draw under everything |
| `countries-110m.json` | 177 country polygons, each carrying its ISO 3166-1 **numeric** id and Natural Earth's own name |

Regenerate either with `cp node_modules/world-atlas/<file> src/data/globe/<file>` after a version
bump of the dependency, and note the bump in the method sheet's change log.

**What is derived from `countries-110m.json`:** the country centroids in `src/lib/globe/geo.ts`.
They are `d3-geo`'s spherical `geoCentroid` over each polygon, rounded once to three decimals —
derived points, never places, which is why every record built from one carries
`labelKind: 'centroid'` and every card says "centroid of" instead of printing a pair of numbers.
Two consequences a reader should know: a country with distant overseas territories gets a
centroid in open water (France's lands at sea off the Spanish coast, because French Guiana and
the Pacific territories pull it there), and the 1:110m cut draws no Monaco, no Singapore and no
Vatican, so a lookup for those answers `null` rather than inventing a point.

## The crosswalk

`crosswalk.json` joins the country-code systems this house's records are written in — GDELT's
FIPS 10-4, ISO 3166-1 alpha-2/alpha-3/numeric, the ccTLD, and the country's name as GDELT, UCDP,
EM-DAT and Natural Earth each spell it. It is a derived file: it carries its own `derivation` and
`regenerate` lines, and `npx tsx scripts/build-globe-crosswalk.ts --check` fails when the
committed file and a fresh build disagree. Its base table is `iso-fips.csv`, whose header states
the Wikidata query it came from.

## The seats

`seats.json` is where an institution stands. Most of what this house measures is published
rather than sensed: a price index has no coordinate, a refugee count has no coordinate, and the
honest point for both is the seat of the body that publishes them. A handful are real
instruments at real sites (Mauna Loa), and those are marked `station` instead of `seat` — the
distinction is the whole reason the file exists. Coordinates come from **Wikidata's coordinate
location (P625)** on each institution's own item, or, where the item carries none, from the item
its headquarters-location (P159) points at — every row says which in its `note`, and every row
carries the Wikidata QID it was read from, so a row without a checkable identity fails the test
rather than shipping as an invented dot. Regenerate with
`npx tsx scripts/build-globe-seats.ts` (the only script here that needs the network; the
committed file is the archive).
