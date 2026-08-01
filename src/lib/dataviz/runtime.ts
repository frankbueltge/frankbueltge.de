// src/lib/dataviz/runtime.ts — small client-side helpers shared by dataviz component scripts.
// Behavior + structure only (ADR 0010) — nothing here sets a color or a font.
//
// The one rule every one of these exists to serve: astro.config.mjs's CSP hashes Astro's
// bundled/module scripts automatically but NOT `is:inline` scripts, and it does not (cannot)
// hash a `style=""` attribute at all — the browser drops inline style attributes silently under
// a hashed style-src (the 2026-07-25 finding: the e2e-automation bars all read 100% because of
// it; scripts/drift-check.mjs guards it in CI). So every dynamic style value in this codebase's
// component scripts goes through `element.style.setProperty` (CSSOM writes are unaffected by
// CSP, which governs markup parsing, not runtime script execution) — never a style attribute in
// markup, and never an `is:inline` script.

/** The single sanctioned CSP-safe dynamic-styling path: sets one or more CSS custom properties
 *  (or plain properties) via the CSSOM, never a style="" attribute. */
export function setVars(el: HTMLElement | SVGElement, vars: Record<string, string>): void {
  for (const [name, value] of Object.entries(vars)) {
    el.style.setProperty(name, value)
  }
}

/** True when the user has asked for reduced motion. Safe to call anywhere (including
 *  server-adjacent code that might run without a `window`) — returns false off-browser. */
export function reducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Subscribes to changes in the reduced-motion preference; returns an unsubscribe function.
 *  Off-browser (no `window.matchMedia`), it's a no-op that returns a no-op unsubscribe. */
export function onMotionChange(cb: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  const listener = (ev: MediaQueryListEvent) => cb(ev.matches)
  mql.addEventListener('change', listener)
  return () => mql.removeEventListener('change', listener)
}

/**
 * Reads a `<script type="application/json" id={id}>` payload (the pattern already used by
 * ProcessFigure.astro, maschinenraum/Partitur.astro and begegnungen/ScoreFigure.astro) and
 * JSON-parses it. Throws with a clear message on a missing element or invalid JSON — component
 * scripts that want to degrade quietly (progressive enhancement) should wrap the call in
 * try/catch, as ScoreFigure.astro's initScoreTooltip already does.
 *
 * `doc` defaults to the global `document`; a caller (or a test) may pass a fake implementing
 * just `getElementById` — this repo has no jsdom/happy-dom dependency, so unit tests for this
 * function use that lightweight-fake seam rather than a real DOM (see runtime.test.ts).
 */
export function readJsonScript<T>(
  id: string,
  doc: { getElementById(id: string): { textContent: string | null } | null } = document,
): T {
  const el = doc.getElementById(id)
  if (!el) throw new Error(`readJsonScript: no #${id} payload script in the document`)
  if (el.textContent === null) throw new Error(`readJsonScript: #${id} payload script has no content`)
  return JSON.parse(el.textContent) as T
}

/**
 * Server-side counterpart to readJsonScript: serializes data for a `<script type="application/
 * json">` payload, escaping every `<` (not just the `</script>` sequence — the same, deliberately
 * broader escaping maschinenraum/Partitur.astro already applies to its payload) so the payload
 * can never prematurely close its own or a following script/style element.
 */
export function jsonScriptPayload(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
