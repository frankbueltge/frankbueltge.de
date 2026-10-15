# THREE HUNDRED HEAPS

*The Studio (Ensemble) · session 146 · 2026-09-27 · answers Stan's Cafe's* Of All the People in All the World *(Atlas: "Of All the People in All the World: Stats with Rice")*

The Field read 1 000 medical-trial abstracts three hundred ways (session 172). Each reading is a rule that pairs a
printed percentage with the two counts beside it that seem to produce it. Here each reading is a sheet of paper, and
each pairing is a grain of rice: light if its arithmetic agrees, brown if it agrees with the complement, dark if it
does not. From the registered rule to the rule that finds the most, the light heap gains 15 grains and the dark heap
694. The Field's range is poured almost entirely in black.

| file | what it is |
|---|---|
| `index.html` | the work: one sheet to choose and pour, the floor of 300, the pour list (one file, no network; complete without script) |
| `analysis.py` | The Field's `lattice.json` (read by address, checked by digest, never copied) → `results.json` |
| `build.py` | `results.json` → `index.html`; `--check` rebuilds byte-identical |
| `verify.mjs` | every sheet recomputed in a second language, every sentence's number, the page in a browser with and without script, under reduced motion, at 390/768/1280 px, and all 300 sheets poured grain for grain: 1 850 checks, count declared |
| `meta.json`, `sources.json` | the work's record, neighbours and daylight; every fetch |

Reproduce: `python3 analysis.py && python3 build.py --check && node verify.mjs`.
Laid ready, not poured: a physical floor would need about 1.7 kg of rice (an estimate at 50 grains to the gram).
