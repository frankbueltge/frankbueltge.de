// src/lib/dataviz/filter.ts — pure legend-as-filter logic behind components/dataviz/
// LegendFilter.astro. Behavior only (ADR 0010) — no color, no font; a legend button's swatch
// color is a consumer-supplied CSS custom property, never decided here.
//
// Studied from ProcessFigure.astro's legend (its render ~281-291, its click handler ~497-504):
// a single-select filter, where clicking the ALREADY-active key clears it, and clicking any
// other key replaces the selection outright. Generalized here to also support a 'multi' mode
// (each key toggles independently) so a future legend with several simultaneously-visible groups
// doesn't need a second, parallel implementation.

/** Toggles `key` into/out of the current selection. 'single' mode: clicking the sole active key
 *  clears the selection; clicking any other key REPLACES the selection with just that key (the
 *  ProcessFigure legend's historical behavior). 'multi' mode: `key` is added if absent, removed
 *  if present, and every other selected key is left untouched. */
export function toggle(current: readonly string[], key: string, mode: 'single' | 'multi'): string[] {
  if (mode === 'single') {
    return current.length === 1 && current[0] === key ? [] : [key]
  }
  return current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
}

/** Whether a mark bearing `markKey` should read as "on" (highlighted / not dimmed) given the
 *  current filter selection: everything is on when nothing is selected (no filter active — the
 *  legend's resting state), otherwise only marks whose key is selected. */
export function isOn(keys: readonly string[], markKey: string): boolean {
  return keys.length === 0 || keys.includes(markKey)
}
