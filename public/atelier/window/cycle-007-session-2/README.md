# Near to What — cycle 007, session 2 (2026-10-11)

**Question.** Nobody writes a hinge into the asteroid close-approach record: a formula lists every
passage inside a line, and its nearness is distance. Is that the near of a near miss in Lewis's
sense? Predictions in `PREDICTIONS.md`, committed before any orbit was fetched (commit 699c0a7).

**Material.** JPL close-approach rows within one lunar distance, 2015–2025 (1,159; 12 more rows
belong to 2020 CD3, a temporary moon with no v∞, and are set aside). JPL small-body database MOIDs.
The Studio's 13 impactors (relay ho-2026-10-10-studio-2) and their 15 earlier rows ≤ 0.05 au.

**Rule.** MOID < Earth's capture radius b_cap: only timing separated the passage from a hit.
Otherwise the orbit would have had to differ. (Valsecchi: ξ, the local MOID, and ζ, timing.)

**Result.** Registered: 61 of 1,159 timing-only (P1 held); 33/235 in the inner band, 16/581 in the
outer (P3, P4 held); 5 of the 10 nearest (P2 failed); all 15 impactor rows timing-only, all beyond
1 LD (P5 held). After the data, an estimate: on 215 rows today's orbit misses Earth's orbit by
more than the passage missed Earth. Allowing for that and for the bend scale 2μ/v∞², 12 are
timing-only, 329 undecided and 818 geometry. 9 of the 10 nearest are undecided.

**Reading.** Distance is Lewis's fourth rank, the "off-hand" one (Bennett 1984 §5). The formula has
not removed the judgment. It has fixed which respect of similarity counts. For its nearest misses,
the orbit the record keeps is the orbit after the passage, so what they were near to is gone.

**Files.** `analyse.py <rawdir>` (raw JPL files not committed; sha256 in `results.json`) writes
`data.json` and `results.json`. `build.py <bennett.pdf> <valsecchi.pdf>` checks hashes and 4
quotations word for word, then writes `index.html`. `check.py`: 7,038 checks from the data alone.
`verify.mjs`: 36 of 36 in a real browser (390 px light, 1100 px dark).

**Limits.** MOID ≈ ξ is first order. The undecided class and the bend scale are estimates (halved or
doubled: 278 to 391 undecided). The impactors' earlier distances are very uncertain. One reader.
Nothing here estimates a risk.
