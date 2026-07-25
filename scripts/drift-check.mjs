#!/usr/bin/env node
// Drift-Wächter (Aktualitäts-Regel, Frank 2026-07-25): die Website muss stets den
// neuesten Stand der Entwicklung zeigen — dieses Script macht die mechanisch prüfbaren
// Teile der Regel zu einem harten Check statt einer Erinnerung.
//
//   1. Zurückgezogene Wortlaute (schwarze Liste aus docs/wording-kanon.md) dürfen in der
//      Site-Stimme nicht wieder auftauchen (Quellen: src/pages, src/components, src/config,
//      src/lib, README.md — ohne Werk-Spiegel: die sind signierte Artefakte der Engines).
//   2. Namens-Regel: „by Frank Bültge"-Prosa nur an den erlaubten Orten (about, Impressum).
//   3. CSP-Regel: keine Inline-style-Attribute in Templates/SVG-Buildern — die Site-CSP
//      führt Style-Hashes, Inline-Styles werden vom Browser verworfen (Befund 25.07.:
//      die e2e-automation-Balken standen deshalb alle auf 100 %).
//   4. (nur mit DRIFT_NETWORK=1) Spiegel-Frische: gespiegelte Engine-Verfassungen gegen
//      die Engine-Repos auf GitHub — Abweichung heißt, die Site erzählt einen alten Stand.
//
// Läuft statisch in CI bei jedem Push und komplett (mit Netz) im Nightly drift-watch.

import { readFileSync, readdirSync, statSync, existsSync, appendFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const findings = []

function* walk(dir, exts) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) yield* walk(p, exts)
    else if (exts.some((e) => name.endsWith(e))) yield p
  }
}

const isWerkMirror = (rel) => /\/(werke|werke-html)\//.test(rel) || /src\/content\//.test(rel)

// ——— 1. Zurückgezogene Wortlaute ———————————————————————————————————————————
const RETIRED = [
  'Die Akte der Gegenwart',
  'the whole lab',
  'Data & AI Engineer',
  'data artist',
  'Datenkünstler',
  'locally constituted',
  'wherever the apparatus permits',
  'Error is the method',
  'Error as method',
  'rarely, and always on the record',
  'artistic research with data and AI',
  '(private) website repository',
]
const voiceFiles = [
  ...walk(join(ROOT, 'src/pages'), ['.astro', '.ts']),
  ...walk(join(ROOT, 'src/components'), ['.astro', '.ts']),
  ...walk(join(ROOT, 'src/config'), ['.ts']),
  ...walk(join(ROOT, 'src/lib'), ['.ts']),
  join(ROOT, 'README.md'),
]
for (const f of voiceFiles) {
  const rel = relative(ROOT, f)
  if (isWerkMirror(rel)) continue
  const text = readFileSync(f, 'utf8')
  for (const phrase of RETIRED) {
    // Kommentarzeilen, die die Regel selbst dokumentieren, sind erlaubt (z. B. „nicht
    // ‚Data & AI Engineer'"); geprüft wird nur Nicht-Kommentar-Text.
    const lines = text.split('\n')
    lines.forEach((line, i) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('#')) return
      if (line.includes(phrase)) findings.push(`${rel}:${i + 1} — retired phrase: "${phrase}"`)
    })
  }
}

// ——— 2. Namens-Regel ————————————————————————————————————————————————————————
const NAME_ALLOWED = /(AboutPage|impressum|datenschutz|about)/
const NAME_PATTERNS = ['by Frank Bültge', 'von Frank Bültge', 'Frank Bültge decides', 'Frank Bültge approved']
for (const f of voiceFiles) {
  const rel = relative(ROOT, f)
  if (isWerkMirror(rel) || NAME_ALLOWED.test(rel)) continue
  const text = readFileSync(f, 'utf8')
  for (const pat of NAME_PATTERNS) {
    const idx = text.indexOf(pat)
    if (idx !== -1) {
      const line = text.slice(0, idx).split('\n').length
      findings.push(`${rel}:${line} — name in prose ("${pat}") — roles speak on subpages, the name lives on /about and the hub's conductor line`)
    }
  }
}

// ——— 3. CSP-Regel: keine Inline-Styles ——————————————————————————————————————
for (const f of voiceFiles) {
  const rel = relative(ROOT, f)
  if (isWerkMirror(rel)) continue
  const text = readFileSync(f, 'utf8')
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return
    if (/style=["{]/.test(line)) {
      findings.push(`${rel}:${i + 1} — inline style attribute (CSP drops it silently; use compiled classes or SVG attributes)`)
    }
  })
}

// ——— 4. Spiegel-Frische (Netz, nur im Nightly) ———————————————————————————————
if (process.env.DRIFT_NETWORK === '1') {
  const MIRRORS = [
    ['ulysses', 'src/content/atelier/PROTOCOL.md'],
    ['field-research', 'src/content/field/PROTOCOL.md'],
    ['studio', 'src/content/studio/PROTOCOL.md'],
  ]
  for (const [repo, mirrorPath] of MIRRORS) {
    const local = join(ROOT, mirrorPath)
    if (!existsSync(local)) continue
    try {
      const res = await fetch(`https://raw.githubusercontent.com/frankbueltge/${repo}/main/PROTOCOL.md`)
      if (!res.ok) {
        findings.push(`${mirrorPath} — mirror check could not fetch engine original (${repo}: HTTP ${res.status})`)
        continue
      }
      const remote = await res.text()
      if (remote.trim() !== readFileSync(local, 'utf8').trim()) {
        findings.push(`${mirrorPath} — STALE: differs from ${repo}/main PROTOCOL.md — run the ${repo === 'ulysses' ? 'atelier' : repo === 'field-research' ? 'field' : 'studio'}-integrate workflow`)
      }
    } catch (e) {
      findings.push(`${mirrorPath} — mirror check failed (${repo}): ${e.message}`)
    }
  }
}

// ——— Report ————————————————————————————————————————————————————————————————
if (findings.length) {
  console.error(`DRIFT: ${findings.length} finding(s)\n`)
  for (const f of findings) console.error('  ✗ ' + f)
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Drift-Wächter: ${findings.length} Befund(e)\n\n` + findings.map((f) => `- \`${f}\``).join('\n') + '\n',
    )
  }
  process.exit(1)
}
console.log('drift-check: clean' + (process.env.DRIFT_NETWORK === '1' ? ' (incl. mirror freshness)' : ' (static only)'))
