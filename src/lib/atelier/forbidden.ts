// src/lib/atelier/forbidden.ts
export function checkForbidden(source: string): string[] {
  const out: string[] = []
  const node = source.match(/\b(node:fs|node:child_process|child_process|process\.env|process\.exit)\b/g)
  if (node) for (const m of new Set(node)) out.push(`node/fs/process access: ${m}`)
  // bare fs import: import ... from 'fs'
  if (/from\s+['"]fs['"]/.test(source)) out.push('node/fs/process access: fs')
  // external URLs (anything not same-origin / not @/ alias)
  const urls = source.match(/https?:\/\/[^\s"'`)]+/g)
  if (urls) for (const u of new Set(urls)) {
    if (!/(?:^|\.)w3\.org|schema\.org/.test(u)) out.push(`external resource: ${u}`) // xmlns/schema ok
  }
  if (/\b(window\.location|location\.href|location\.assign|location\.replace)\b/.test(source))
    out.push('navigation: window.location')
  return out
}
