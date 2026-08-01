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
//   3b. Dieselbe CSP-Regel über den Werk-Spiegel — dort gilt die Voice-Ausnahme nicht,
//      denn ob ein Style-Attribut die Policy überlebt, ist eine Tatsache über die Seite und
//      keine Meinung über das Werk (angeboten von field-research, Issue #254). Die bereits
//      betroffenen Werke stehen datiert mit Zählstand in Quarantäne: Neues und Wachstum
//      sind harte Befunde, Repariertes verlangt seine Streichung aus der Liste.
//   4. (nur mit DRIFT_NETWORK=1) Spiegel-Frische: gespiegelte Engine-Verfassungen gegen
//      die Engine-Repos auf GitHub — Abweichung heißt, die Site erzählt einen alten Stand.
//   5. (nur mit DRIFT_NETWORK=1) MRR-Journal-Frische: die Runtime-Linie wird nicht
//      gespiegelt, sie wird von Hand nachgetragen (src/data/meridian/runtime-log.json) —
//      also prüfen wir, ob meridian-runtime seit dem jüngsten Eintrag weitergearbeitet hat.
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

// ——— 3b. CSP rule, extended over the mirrored works —————————————————————————
// Offered by field-research on 2026-07-31 (site issue #254) and adopted here. Rule 3 skips
// the werk mirror because a work is the engine's signed artefact — that reason is about
// VOICE, and it does not carry over to the CSP: whether a style attribute survives the
// policy is a fact about the page, not an opinion about the work. The practice's own
// constitution has forbidden inline `style=` in works since before its oldest commit, and
// nothing ever checked the works written before the rule — "a rule enforced by memory,
// which is the kind that fails quietly for thirty days" (their words).
//
// What the count is NOT: proof of an invisible figure. field-research corrected its own
// finding the same day — six of the eight affected works draw their charts anyway, because
// their shapes carry fill=/stroke= presentation attributes, which no style-src directive
// reaches; two of twenty actually lose the drawing. The gate is still right, for the reason
// they gave when they let the offer stand: it is the CLASS of defect a gate can catch, not
// its severity. So this rule counts inert attributes, and says nothing about what is visible.
//
// It cannot hard-fail the whole mirror today: 286 attributes across 7 works are already
// live, the fix belongs in the engine repo (this mirror is wiped and re-copied on every
// integrate run), and a red gate here would block every nightly sync and every deploy.
// So the known-affected are quarantined WITH THEIR COUNTS, dated — anything new fails, any
// regression fails, and a repaired work fails until it is struck from the list, so the list
// cannot quietly rot into an allowlist. The tally prints on every run: visible debt, never
// a silent cap.
const WERK_INLINE_STYLE_QUARANTINE = {
  // Measured 2026-08-01. Shrinking is free; growing is a finding; reaching 0 means: delete the line.
  'src/components/field/werke/2026-07-01-the-edition/index.astro': 95,
  'src/components/field/werke/2026-07-01-plausibility-engine/index.astro': 54,
  'src/components/field/werke/2026-07-01-score-horizon/index.astro': 34,
  'src/components/field/werke/2026-07-01-digit-mirror/index.astro': 33,
  'src/components/field/werke/2026-07-01-naive-detector/index.astro': 32,
  'src/components/field/werke/2026-07-01-provenance-horizon/index.astro': 32,
  'src/components/field/werke/2026-07-01-fairness-trap/index.astro': 6,
}
const werkInlineTally = []
for (const f of walk(join(ROOT, 'src/components'), ['.astro'])) {
  const rel = relative(ROOT, f)
  if (!/\/werke\//.test(rel)) continue
  let count = 0
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue
    const hits = line.match(/style=["{]/g)
    if (hits) count += hits.length
  }
  const allowed = WERK_INLINE_STYLE_QUARANTINE[rel]
  if (allowed === undefined) {
    if (count > 0) {
      findings.push(
        `${rel} — ${count} inline style attribute(s) in a mirrored work (the CSP carries style hashes and no 'unsafe-hashes', so the browser drops them and whatever they carry has no effect; use a component <style> block, which the build hashes)`,
      )
    }
  } else if (count > allowed) {
    findings.push(
      `${rel} — inline style attributes grew from ${allowed} (quarantined 2026-08-01) to ${count}; the repair moves one way only`,
    )
  } else if (count === 0) {
    findings.push(`${rel} — repaired, no inline styles left: strike it from WERK_INLINE_STYLE_QUARANTINE so the list stays honest`)
  } else {
    werkInlineTally.push(`${rel}: ${count}/${allowed}`)
  }
}
if (werkInlineTally.length) {
  const total = werkInlineTally.reduce((s, l) => s + Number(l.split(': ')[1].split('/')[0]), 0)
  console.log(
    `drift-check: ${total} inert inline style attribute(s) still quarantined in ${werkInlineTally.length} mirrored work(s) — ` +
      `the attributes have no effect on the page; whether a figure still draws depends on its fill=/stroke= ` +
      `attributes, so this is the defect class, not a count of invisible charts. The fix belongs in the engine repo:\n  ` +
      werkInlineTally.join('\n  '),
  )
}

// ——— 6. Dataviz primitives carry no appearance (ADR 0010 guard) ———————————————
// src/{components,lib}/dataviz/ is the shared behaviour+structure layer under the practice
// figures. A hex literal there would be a shared visual grammar through the back door — the
// one thing ADR 0010 forbids. Colours live in the practice stylesheets and are RECORDED in
// src/lib/dataviz/palette.ts (whose test re-derives the validator maths, so it and its test
// are the two sanctioned homes for hex values).
const DATAVIZ_HEX_EXEMPT = /\/palette(\.test)?\.ts$/
for (const f of [
  ...walk(join(ROOT, 'src/components/dataviz'), ['.astro', '.ts']),
  ...walk(join(ROOT, 'src/lib/dataviz'), ['.ts']),
]) {
  const rel = relative(ROOT, f)
  if (DATAVIZ_HEX_EXEMPT.test(rel)) continue
  const lines = readFileSync(f, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (/#[0-9a-fA-F]{3,8}\b/.test(line)) {
      findings.push(`${rel}:${i + 1} — hex literal in the dataviz layer (appearance belongs to the practice skins; record sets in palette.ts)`)
    }
  })
}

// ——— 7. Identity-colour blocks name their palette record ————————————————————
// Every categorical identity token (--*-c-* / --*-out-*) that carries a hex must sit under a
// "PALETTE: <set-id>" marker whose id exists in src/lib/dataviz/palette.ts — so a colour can
// never ship "validated" by assertion alone (the 2026-07-31 finding: a CSS comment claimed
// all six checks passed while the quartet failed CVD at deutan ΔE 1.3).
const paletteSource = existsSync(join(ROOT, 'src/lib/dataviz/palette.ts'))
  ? readFileSync(join(ROOT, 'src/lib/dataviz/palette.ts'), 'utf8')
  : ''
const knownSetIds = new Set([...paletteSource.matchAll(/id: '([a-z0-9-]+)'/g)].map((m) => m[1]))
const IDENTITY_TOKEN = /--[\w-]*(?:-c-|-out-)[\w-]*:\s*#[0-9a-fA-F]{3,8}/
const MARKER_WINDOW = 30
for (const f of [...walk(join(ROOT, 'src/styles'), ['.css']), ...voiceFiles.filter((p) => p.endsWith('.astro'))]) {
  const rel = relative(ROOT, f)
  if (isWerkMirror(rel)) continue
  const lines = readFileSync(f, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (!IDENTITY_TOKEN.test(line)) return
    const windowText = lines.slice(Math.max(0, i - MARKER_WINDOW), i).join('\n')
    const marker = /PALETTE: ([a-z0-9-]+)/.exec(windowText)
    if (!marker) {
      findings.push(`${rel}:${i + 1} — identity colour without a "PALETTE: <set-id>" marker in the ${MARKER_WINDOW} lines above`)
    } else if (!knownSetIds.has(marker[1])) {
      findings.push(`${rel}:${i + 1} — PALETTE marker names "${marker[1]}", which is not a set id in src/lib/dataviz/palette.ts`)
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

  // ——— 5. MRR-Journal-Frische ———————————————————————————————————————————————
  // Die Runtime-Linie hat keinen Spiegel: /on-record zeigt EINEN committeten Export und
  // steht bei dessen Datum still (die Ableitung ist deterministisch — kein Nightly kann
  // sie erneuern). Was die Runtime danach tut, trägt runtime-log.json von Hand nach.
  // Mechanisch prüfbar ist deshalb nur: hat das Repo seit dem jüngsten Eintrag
  // weitergearbeitet? Die Karenz verhindert, dass jeder Zwischencommit sofort rot färbt.
  const MRR_GRACE_DAYS = 7
  const logPath = 'src/data/meridian/runtime-log.json'
  const logFile = join(ROOT, logPath)
  if (existsSync(logFile)) {
    try {
      const entries = JSON.parse(readFileSync(logFile, 'utf8')).entries ?? []
      const newest = entries.map((e) => e.date).sort().at(-1)
      const res = await fetch('https://github.com/frankbueltge/meridian-runtime/commits/main.atom')
      if (!res.ok) {
        findings.push(`${logPath} — freshness check could not fetch meridian-runtime feed (HTTP ${res.status})`)
      } else if (!newest) {
        findings.push(`${logPath} — no entries: the runtime line has no dated record on the site`)
      } else {
        const updated = /<updated>([^<]+)<\/updated>/.exec(await res.text())?.[1]
        if (!updated) {
          findings.push(`${logPath} — freshness check could not read a commit date from the meridian-runtime feed`)
        } else {
          const behindDays = Math.floor((Date.parse(updated) - Date.parse(`${newest}T23:59:59Z`)) / 86_400_000)
          if (behindDays > MRR_GRACE_DAYS) {
            findings.push(
              `${logPath} — STALE: meridian-runtime last moved ${updated.slice(0, 10)}, ` +
              `newest logged entry is ${newest} (${behindDays} days behind, grace ${MRR_GRACE_DAYS}) — ` +
              `add the entry for what happened since, naming its commit`,
            )
          }
        }
      }
    } catch (e) {
      findings.push(`${logPath} — freshness check failed: ${e.message}`)
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
