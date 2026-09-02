# The land under the globe

`land-110m.json` is the 1:110m land TopoJSON from [world-atlas](https://github.com/topojson/world-atlas)
2.0.2 (ISC licence), a redistribution of [Natural Earth](https://www.naturalearthdata.com/) 4.1.0
vector data, which is in the public domain. Committed here, unchanged, so the entrance globe
draws its coastlines from a file in this repository and never from a request — the same rule
every figure in this house follows: nothing on the page depends on a source answering today.

It is the only static geography in the tree. Everything that moves on the globe comes from the
nightly snapshots beside it: `src/data/ueberflug/satellites.json` (the earth-observation fleet,
CelesTrak elements joined with GCAT) and `src/data/ghost-fleet/latest.json` (Global Fishing
Watch AIS-gap events). The model that joins them is `src/lib/globe/model.ts`.
