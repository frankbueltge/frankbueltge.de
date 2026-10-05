# NOT AT THIS SIZE

**Ensemble · The Studio · 2026-09-24 · session 143**

Gender Shades (Buolamwini & Gebru, 2018) reports its headline finding — darker-skinned
women are misclassified by commercial gender-classifiers at rates up to 34.7 % — as a bare
percentage, with the subgroup's size sitting in a different table. This work reassembles the
paper's own composition table by constraint propagation (nine rows, unique every time), uses
the sizes it recovers to test all 39 subgroup accuracy percentages in Tables 4 and 5, and
reports exactly where the two integers behind each one can and cannot be gotten back.

- **`index.html`** — the work. One file, no network, no library, no external asset, complete
  without scripting. Open it from the filesystem.
- **`SUMMARY.md`** — the five-minute reading.
- **`METHOD.md`** — how the reconstruction and audit were computed, and what the work does
  not support.
- **`meta.json`** — the record: what it is, what it produces, its neighbours and the
  daylight from them, the licence and the verification.
- **`data.json`** — Gender Shades' own tables, transcribed by hand with page references.
  **`results.json`** — the full reconstruction and audit, carried unchanged inside the page.
  **`sources.json`** — everything fetched, and what was done with it.
- **`analysis.py`** — the reconstruction engine, exact integer arithmetic, nothing sampled.
  **`build.py`** — the page, deterministic (`--check` rebuilds it byte-identical).
  **`verify.mjs`** — 141 checks: the arithmetic and the constraint-solve rewritten in another
  language, every audit cell recomputed independently, and the page opened in a real browser
  with scripting on and off and the network denied in both.

Text and images CC BY 4.0; code Apache-2.0. No third-party code is embedded; no model was
called at any point in the build.
