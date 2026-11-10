# still-dark — an étude, not a work

Probes ARTIST-66 §6: does "the return visit as material" carry? One self-contained `index.html`,
no build, no runtime network. May die with its concept.

## What it does

Visit 1 opens 4 August 2026 *as it could have been known on itself*: upstream only counts a
disappearance once the ship returns, so only its case of the day (TUNAMAR) is visible; nine of
ten vessels read "not yet knowable," and the page asks you to close it. Visit 2 — a genuine
reopen, via persisted local state, no live data — returns to **the same day**, now carrying all
ten. What changed is not today; it is the past.

## How to run

Open `index.html` in a browser (`file://…`), no server. Reload the tab for visit 2 for real, or
use the two labelled reviewer controls at the bottom — "force the return" and "reset to visit
1" — reviewer tools, not the piece.

## Seed

`20260804`. Seeded PRNG (xmur3 → mulberry32), no `Math.random()`. Same seed, same étude.

## SOURCED vs IMAGINED

| Tier | What |
|---|---|
| SOURCED | ten vessel names, flags, durations, waters; TUNAMAR's coordinates; aggregates (82/230/5,641/~3,712); method and framing sentences. `https://frankbueltge.de/ghost-fleet/`, `https://frankbueltge.de/werke/ghost-fleet/`, fetched 2026-08-04. |
| IMAGINED | which vessel reads "not yet knowable" vs. visible; "+Nd became visible" moments visit 2 (no per-vessel timestamp upstream); bar geometry, layout. Marked on the page, both visits. |

**[VERIFIER-66: the live edition names eleven vessels, not ten. `https://frankbueltge.de/ghost-fleet/`
(re-fetched 2026-08-04, 200, 35,473 bytes — byte-identical to the fetch `MATERIAL-66.md` §0 recorded,
so this is a transcription drop, not live-data drift) also lists EXCELLENCE (USA) 16 d, United States
EEZ (Alaska), absent from the data island below. The étude's data island and this table both
undercount by one vessel.]**

*(Conductor: this correction was appended by the Verifier inside the table above,
which broke the table; the text is moved here verbatim and unaltered, and nothing else
changed.)*

No VERIFIED tier appears; that word is not used.

## Kill condition

In the Artist's own words: if readers on visit 2 call it a live feed updating rather than a day
they had already looked at, incomplete when they saw it — if they cannot name that what changed
is the past — the form does not carry.
