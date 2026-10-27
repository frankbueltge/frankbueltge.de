// src/lib/analytics/opt-out.ts — "don't count this browser": the switch behind /analytics-opt-out.
//
// The site counts visits with a self-hosted Umami, loaded first-party from /stats/script.js
// (src/layouts/Base.astro). Umami's tracker sends nothing while the browser's local storage holds
// a value under `umami.disabled` (umami-software/umami, src/tracker/index.js). This module sets
// and clears exactly that one entry: the opt-out page uses the tracker's own off-switch rather
// than a second mechanism, so the two cannot disagree about whether a browser is counted.
//
// Local storage belongs to one browser and one origin: frankbueltge.de and www.frankbueltge.de
// each keep their own, and clearing a site's data removes the entry with everything else.
//
// PURE: the functions take the storage as an argument. The page script reads window.localStorage
// itself, inside a try, because a browser that blocks site data throws on the mere access.

/** The local-storage key Umami's tracker checks before it sends anything. */
export const OPT_OUT_KEY = 'umami.disabled'

/** True when this browser is not counted. Any non-empty value switches the tracker off, so any
 *  non-empty value counts here too. A storage that cannot be read reports false: if the page
 *  cannot read the entry, neither can the tracker. */
export function isOptedOut(storage: Pick<Storage, 'getItem'> | null): boolean {
  if (!storage) return false
  try {
    return Boolean(storage.getItem(OPT_OUT_KEY))
  } catch {
    return false
  }
}

/** Stop counting this browser. */
export function optOut(storage: Pick<Storage, 'setItem'>): void {
  storage.setItem(OPT_OUT_KEY, '1')
}

/** Count this browser again. */
export function optIn(storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem(OPT_OUT_KEY)
}
