// src/lib/locale-href.ts — one rule for every internal link that passes through the locale helper.
//
// Astro's getRelativeLocaleUrl owns the path and appends the site's trailing slash. Handed a whole
// `/page#section`, it appends that slash after the `#`, and the anchor misses: on 2026-10-05 a
// build carried 134 such links (the entrance, /now, and every archive link on /atelier/requests).
// Four components had each written their own helper, and only one of them kept the fragment. The
// locale function is passed in, so this stays a pure function that a test can hold.

/** `localize` is the page's own `(path) => getRelativeLocaleUrl(locale, path)`. */
export function localeHref(href: string, localize: (path: string) => string): string {
  // another scheme (https:, mailto:) is not ours to localize; a bare `#section` stays on its page
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('#')) return href
  const at = href.indexOf('#')
  if (at < 0) return localize(href)
  return `${localize(href.slice(0, at))}#${href.slice(at + 1)}`
}
