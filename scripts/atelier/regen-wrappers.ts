// scripts/atelier/regen-wrappers.ts
// One-off: re-emit every astro-work wrapper page from the current renderWrapperPage, so a change
// to the wrapper (e.g. the JS-built-SVG scope-broadcast) ships immediately instead of only on the
// next nightly re-mirror. Idempotent: the next integrate produces byte-identical files.
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { renderWrapperPage } from '../../src/lib/atelier/wrapper'

const root = process.cwd()
let n = 0
for (const ns of ['atelier', 'field', 'studio', 'plenum']) {
  const dir = join(root, `src/components/${ns}/werke`)
  if (!existsSync(dir)) continue
  for (const slug of readdirSync(dir)) {
    const wd = join(dir, slug)
    if (!statSync(wd).isDirectory()) continue
    const metaPath = join(wd, 'meta.json')
    if (!existsSync(metaPath) || !existsSync(join(wd, 'index.astro'))) continue
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
    const page = join(root, `src/pages/${ns}/werke/${slug}.astro`)
    mkdirSync(dirname(page), { recursive: true })
    writeFileSync(page, renderWrapperPage(slug, meta, ns))
    n++
  }
}
console.log(`regenerated ${n} wrapper pages`)
