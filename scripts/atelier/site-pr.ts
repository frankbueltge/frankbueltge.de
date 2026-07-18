// scripts/atelier/site-pr.ts — CLI der PR-Schleuse (engine-site-pr.yml; wie
// integrate.ts liegt das geteilte Engine-Tooling unter scripts/atelier/).
// Usage: tsx scripts/atelier/site-pr.ts <engineDir> <slug> <siteDir>
// Liest site-prs/<slug>/ aus dem Engine-Checkout, prüft die Pfad-Grenze und kopiert
// bei ok die Dateien in den Site-Checkout. Druckt den JSON-Report; Exit 0 immer —
// der Workflow entscheidet anhand von .ok.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { classifySitePr } from '../../src/lib/atelier/sitepr'

const MAX_BYTES = 2 * 1024 * 1024

const [, , engineDir, slug, siteDir] = process.argv
if (!engineDir || !slug || !siteDir) {
  console.error('usage: site-pr.ts <engineDir> <slug> <siteDir>')
  process.exit(2)
}

const root = join(engineDir, 'site-prs', slug)
const filesRoot = join(root, 'files')

// Nur reguläre Dateien einsammeln — Symlinks und Sonstiges werden ignoriert.
function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p))
    else if (e.isFile()) out.push(relative(filesRoot, p))
  }
  return out
}

const prMdPath = join(root, 'PR.md')
const prMd = existsSync(prMdPath) ? readFileSync(prMdPath, 'utf8') : null
const paths = walk(filesRoot).sort()

let report = classifySitePr(slug, prMd, paths)
if (report.ok) {
  const tooBig = paths.filter((p) => statSync(join(filesRoot, p)).size > MAX_BYTES)
  if (tooBig.length) report = { ok: false, slug, reasons: tooBig.map((p) => `${p}: größer als 2 MB`) }
}
if (report.ok) {
  for (const f of report.files) {
    const target = join(siteDir, f.to)
    mkdirSync(dirname(target), { recursive: true })
    copyFileSync(join(engineDir, f.from), target)
  }
}
console.log(JSON.stringify(report, null, 2))
