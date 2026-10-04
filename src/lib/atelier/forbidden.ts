// src/lib/atelier/forbidden.ts
// The scan of a NATIVE Astro work (work.astro), whose code becomes part of a page of the house
// and runs under the house's own CSP. A standalone work (index.html) is not scanned: it is
// served bare under the practices' shared policy (src/lib/engines/practice-policy.ts).
//
// Gate principle: LINKS YES, FOREIGN CODE AND ASSETS NO. External URLs are only forbidden where
// the browser or code would LOAD them as code or as an asset of the page (src/srcset/poster,
// <link href>, @import, url(), import(), Worker). Citation links (<a href>) and plain-text URLs
// are allowed — the engines' constitutions REQUIRE retrievable source URLs.
//
// Reading DATA from another host is allowed since 2026-10-05: fetch(), XHR, WebSocket and
// EventSource. The house's own CSP has carried `connect-src 'self' https: wss:` since
// 2026-09-04 (Frank's decision, wording private), so this scan was the last thing still
// refusing a live feed in an Astro work — and live data from public APIs is one of the forms
// Frank's decision of 2026-10-05 names for the practices.

const LOADING_CONTEXTS: { re: RegExp; label: string }[] = [
  { re: /\b(?:src|poster)\s*=\s*\{?\s*["'`]?(https?:\/\/[^"'`\s>})]+)/g, label: 'resource attribute' },
  { re: /<link\b[^>]*\bhref\s*=\s*["']?(https?:\/\/[^"'\s>]+)/g, label: 'link href' },
  { re: /@import\s+(?:url\(\s*)?["']?(https?:\/\/[^"'\s)]+)/g, label: '@import' },
  { re: /\burl\(\s*["']?(https?:\/\/[^"')\s]+)/g, label: 'css url()' },
  { re: /\bimport\s*\(\s*["'`](https?:\/\/[^"'`]+)/g, label: 'import()' },
  { re: /\bnew\s+(?:Worker|SharedWorker)\s*\(\s*["'`](https?:\/\/[^"'`]+)/g, label: 'worker' },
  { re: /<(?:object|embed)\b[^>]*\b(?:data|src)\s*=\s*["']?(https?:\/\/[^"'\s>]+)/g, label: 'object/embed' },
]

// srcset can carry multiple comma-separated URL candidates (e.g. `a.png 1x, b.png 2x`);
// the other resource-attribute regex only ever captures the first, so it is scanned separately here.
const SRCSET_ATTR_RE = /\bsrcset\s*=\s*["']([^"']+)["']/g
const URL_IN_VALUE_RE = /https?:\/\/[^\s,"'`]+/g

const META_REFRESH_RE = /<meta\b[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*\burl\s*=\s*(https?:\/\/[^"'\s>]+)/gi

function hostAllowed(u: string): boolean {
  try {
    const host = new URL(u).hostname
    return host === 'w3.org' || host.endsWith('.w3.org') || host === 'schema.org' || host.endsWith('.schema.org')
  } catch {
    return false
  }
}

export function checkForbidden(source: string): string[] {
  const out: string[] = []
  const node = source.match(/\b(node:fs|node:child_process|child_process|process\.env|process\.exit)\b/g)
  if (node) for (const m of new Set(node)) out.push(`node/fs/process access: ${m}`)
  if (/from\s+['"]fs['"]/.test(source)) out.push('node/fs/process access: fs')
  const flagged = new Set<string>()
  for (const { re, label } of LOADING_CONTEXTS) {
    for (const m of source.matchAll(re)) {
      const url = m[1]
      if (!hostAllowed(url) && !flagged.has(url)) {
        flagged.add(url)
        out.push(`external resource (${label}): ${url}`)
      }
    }
  }
  for (const attr of source.matchAll(SRCSET_ATTR_RE)) {
    for (const urlMatch of attr[1].matchAll(URL_IN_VALUE_RE)) {
      const url = urlMatch[0]
      if (!hostAllowed(url) && !flagged.has(url)) {
        flagged.add(url)
        out.push(`external resource (resource attribute): ${url}`)
      }
    }
  }
  for (const m of source.matchAll(META_REFRESH_RE)) {
    const url = m[1]
    if (!hostAllowed(url) && !flagged.has(url)) {
      flagged.add(url)
      out.push(`external resource (meta refresh): ${url}`)
    }
  }
  if (/\b(window\.location|location\.href|location\.assign|location\.replace)\b/.test(source))
    out.push('navigation: window.location')
  return out
}
