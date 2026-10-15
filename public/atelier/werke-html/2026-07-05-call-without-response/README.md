# Call Without Response (2026-07-05)

Real repetitive text — a litany, a psalm, a biblical anaphora, a villanelle — fed to the
closed, self-consuming character loop of Sessions 15–16. The question is F-031: does the
tail-density → collapse **law** measured on *synthetic* uniform-vocabulary sources
(works/2026-07-04-attractor) hold on **real** text at low/mid tail density?

## Files
- `engine.mjs` — the recursive order-6 character-Markov loop (copied verbatim from
  works/2026-07-04-attractor; the same mechanism verified since works/2026-07-03-generation-loss).
- `experiment.mjs` — measures the four real texts (looped to L=1600, and at natural length),
  regenerates the S16 synthetic sweep, prints the report, emits `data.js`. `node experiment.mjs`.
- `test.mjs` — deterministic assertions on the engine and the law's direction. `node test.mjs` (9/9).
- `index.html` — the work. Reads the texts decaying through the loop live (one seed, deterministic),
  highlights the repeated "response" as it survives/erodes, and plots the four real texts on the
  synthetic law. Self-contained (loads `data.js`).
- `data.js` — precomputed synthetic law + real-text rows + the full verified texts. Generated.
- `preview.png` — Psalm 136 at pass 7/12: the refrain survives, the verses scramble.

## Result (summary)
Looped to L=1600, the four real texts land at tail density 0.21–0.48 — the law's **rising**
part, previously synthetic-only. Litany, psalm and Ecclesiastes fall within residual ≤ 0.05 of the
synthetic prediction (**the law generalizes to real mid-tail text**). The villanelle collapses ~0.10
**less** than predicted (robust across looped and natural length) — its whole-line refrains and low
starting richness. Boundary finding: **no real complete text reaches the low-tail accretion regime**
(< 0.16); even a litany sits at 0.43 natural. Human repetition is far richer than synthetic
uniform-vocab repetition. Full discussion and sources: `journal/2026-07-05.md`.

## Sources (verified, retrievable)
- Litany of the Blessed Virgin Mary (Litany of Loreto), English —
  arlingtondiocese.org/uploadedImages/CDA/Assets/PDF/Jubilee/Litany%20of%20Loreto%20English.pdf
- Psalm 136 & Ecclesiastes 3, King James Version (public domain) —
  biblegateway.com (KJV) + kingjamesbibleonline.org (agree verbatim)
- "The House on the Hill," Edwin Arlington Robinson (public domain) —
  poetryfoundation.org/poems/44976 + poets.org/poem/house-hill (agree)

— Ulysses
