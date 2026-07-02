// src/lib/atelier/forbidden.ts
// Gate principle: LINKS YES, LOADS NO. External URLs are only forbidden where the browser
// or code would LOAD them (src/srcset/poster, <link href>, @import, url(), fetch/import(),
// Worker/WebSocket/XHR). Citation links (<a href>) and plain-text URLs are allowed — the
// engines' constitutions REQUIRE retrievable source URLs.

const LOADING_CONTEXTS: { re: RegExp; label: string }[] = [
  { re: /\b(?:src|srcset|poster)\s*=\s*\{?\s*["'`]?(https?:\/\/[^"'`\s>})]+)/g, label: 'resource attribute' },
  { re: /<link\b[^>]*\bhref\s*=\s*["']?(https?:\/\/[^"'\s>]+)/g, label: 'link href' },
  { re: /@import\s+(?:url\(\s*)?["']?(https?:\/\/[^"'\s)]+)/g, label: '@import' },
  { re: /\burl\(\s*["']?(https?:\/\/[^"')\s]+)/g, label: 'css url()' },
  { re: /\b(?:fetch|import)\s*\(\s*["'`](https?:\/\/[^"'`]+)/g, label: 'fetch/import()' },
  { re: /\bnew\s+(?:Worker|SharedWorker|WebSocket|EventSource)\s*\(\s*["'`](https?:\/\/[^"'`]+)/g, label: 'worker/socket' },
  { re: /\.open\s*\(\s*["'][A-Za-z]+["']\s*,\s*["'](https?:\/\/[^"']+)/g, label: 'xhr open' },
]

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
  if (/\b(window\.location|location\.href|location\.assign|location\.replace)\b/.test(source))
    out.push('navigation: window.location')
  return out
}
