# Engine Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the integration gate honest (citation links allowed, allowlisted-copy instead of whole-work rejection, rejection feedback to the engines) and give the engine works a real presentation (homepage machines strip, shared EnginePage with journal session cards, constitution/team-channel subpages).

**Architecture:** Pure-function gate changes in `src/lib/atelier/` under the existing vitest suite; a new `src/lib/engines/` for latest-works and journal-splitting helpers; one shared `EnginePage.astro` consumed by thin FieldPage/AtelierPage wrappers; doc subpages render the synced markdown. Spec: `docs/superpowers/specs/2026-07-02-engine-presentation-design.md`.

**Tech Stack:** Astro 5 (static, i18n de/en), Tailwind v4 mono skin, vitest, `markdown-it` (build-time markdown fragments), GitHub Actions workflows.

## Global Constraints

- **Work in a fresh git worktree created from `origin/main`** — the primary checkout at `/Users/frankbultge/Documents/GitHub/frankbueltge.de` sits on branch `beifang` (a parallel stream); NEVER touch it, never switch its branch. Create the worktree branch `engine-presentation` from `origin/main`.
- Commit messages: short prefix style (`gate:`, `home:`, `engines:`), single line, **NO Co-Authored-By or any trailer lines**.
- No AI vendor/product names in site copy. Engine-facing copy in English; homepage chrome bilingual de/en via `t()`/`Record<Locale, string>`.
- Never weaken the gate's non-URL rules (fs/process, `window.location`, slug charset, wrapper rules). The gate test suite only grows.
- Run tests with `npx vitest run <file>` (or `npm test` for the full suite); type-check with `npm run check`; full build with `npm run build`.
- All file paths below are relative to the worktree root.

---

### Task 1: Gate scanner — links yes, loads no

**Files:**
- Modify: `src/lib/atelier/forbidden.ts`
- Test: `src/lib/atelier/forbidden.test.ts`

**Interfaces:**
- Produces: `checkForbidden(source: string): string[]` (same signature; new URL contract: external URLs flagged ONLY in resource-loading contexts).

- [ ] **Step 1: Read the current files** (`src/lib/atelier/forbidden.ts`, `forbidden.test.ts`). Existing URL tests that assert "any URL is rejected" will be REPLACED by the contract below; all non-URL tests (fs/process, location) stay untouched.

- [ ] **Step 2: Write the failing tests** — replace/extend the URL cases in `forbidden.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { checkForbidden } from './forbidden'

describe('checkForbidden — links yes, loads no', () => {
  it('allows citation links and plain-text URLs', () => {
    const src = `<a href="https://doi.org/10.1089/big.2016.0047">Chouldechova 2017</a>
      See https://www.propublica.org/article/machine-bias for the dataset.`
    expect(checkForbidden(src)).toEqual([])
  })
  it('rejects external script src', () => {
    expect(checkForbidden(`<script src="https://evil.example/x.js"></script>`).join(' '))
      .toContain('external resource')
  })
  it('rejects fetch() and dynamic import() of external URLs', () => {
    expect(checkForbidden(`fetch("https://api.example.com/data")`)).toHaveLength(1)
    expect(checkForbidden(`import("https://cdn.example.com/mod.js")`)).toHaveLength(1)
  })
  it('rejects external img src, css url() and @import', () => {
    expect(checkForbidden(`<img src="https://cdn.example.com/a.png">`)).toHaveLength(1)
    expect(checkForbidden(`.x { background: url(https://cdn.example.com/b.png) }`)).toHaveLength(1)
    expect(checkForbidden(`@import "https://cdn.example.com/style.css";`)).toHaveLength(1)
  })
  it('rejects Worker/WebSocket/EventSource and XHR open', () => {
    expect(checkForbidden(`new Worker("https://evil.example/w.js")`)).toHaveLength(1)
    expect(checkForbidden(`new WebSocket("https://evil.example/ws")`)).toHaveLength(1)
    expect(checkForbidden(`xhr.open("GET", "https://evil.example/api")`)).toHaveLength(1)
  })
  it('allows w3/schema hosts even in loading contexts (svg namespaces)', () => {
    expect(checkForbidden(`<image src="https://www.w3.org/2000/svg" />`)).toEqual([])
  })
  it('rejects JSX-style src={\`url\`} attributes', () => {
    expect(checkForbidden('const x = <img src={`https://cdn.example.com/a.png`} />')).toHaveLength(1)
  })
  it('dedupes: same URL in two loading contexts is reported once', () => {
    const src = `fetch("https://evil.example/x")\nnew WebSocket("https://evil.example/x")`
    expect(checkForbidden(src)).toHaveLength(1)
  })
})
```

- [ ] **Step 3: Run to verify failure** — `npx vitest run src/lib/atelier/forbidden.test.ts` → the citation-link test FAILS against the current scan-all-URLs implementation.

- [ ] **Step 4: Implement** — replace the URL block in `checkForbidden` (keep fs/process and location blocks verbatim):

```ts
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
```

- [ ] **Step 5: Run tests** — `npx vitest run src/lib/atelier/forbidden.test.ts` → PASS (all cases incl. the untouched fs/location ones).

- [ ] **Step 6: Commit** — `git add src/lib/atelier/forbidden.ts src/lib/atelier/forbidden.test.ts && git commit -m "gate: allow citation links, forbid loading contexts only"`

---

### Task 2: Integrator — copy allowlisted files, report ignored

**Files:**
- Modify: `src/lib/atelier/paths.ts`
- Modify: `src/lib/atelier/integrate.ts`
- Test: `src/lib/atelier/paths.test.ts`, `src/lib/atelier/integrate.test.ts`

**Interfaces:**
- Consumes: `checkForbidden` from Task 1 (unchanged signature).
- Produces: `ClassifiedWork { slug; kind: 'html'|'astro'; files: string[]; ignored: string[] }`; `IntegrateReport.accepted` entries gain optional `ignored?: string[]`. `classifyWork` no longer rejects on disallowed file types.

- [ ] **Step 1: Write failing tests.** In `paths.test.ts` add:

```ts
it('partitions disallowed files as ignored instead of rejecting', () => {
  const w = classifyWork('x', ['work.astro', 'meta.json', 'README.md', 'runner.py', 'data'])
  expect(w.kind).toBe('astro')
  if (w.kind !== null) {
    expect(w.files).toEqual(['work.astro', 'meta.json'])
    expect(w.ignored).toEqual(['README.md', 'runner.py', 'data'])
  }
})
it('still rejects a directory with no entry file', () => {
  const w = classifyWork('x', ['README.md', 'notes.txt'])
  expect(w.kind).toBeNull()
})
```

In `integrate.test.ts` add a case (follow the file's existing tmp-dir test pattern): a work dir containing `work.astro` + `meta.json` + `README.md` + `notes.py` → integrate succeeds, copies ONLY `index.astro` (renamed from work.astro) and `meta.json` to the site dir, README/py are NOT copied, and the report's accepted entry carries `ignored: ['README.md', 'notes.py']`.

- [ ] **Step 2: Run to verify failure** — `npx vitest run src/lib/atelier/paths.test.ts src/lib/atelier/integrate.test.ts` → FAIL (`classifyWork` currently rejects on `README.md`).

- [ ] **Step 3: Implement.** `paths.ts` — replace `classifyWork` (ALLOWED_EXT and `siteTargets` stay as they are):

```ts
export interface ClassifiedWork { slug: string; kind: WorkKind; files: string[]; ignored: string[] }

export function classifyWork(slug: string, fileNames: string[]): ClassifiedWork | RejectedWork {
  const files = fileNames.filter((f) => ALLOWED_EXT.test(f))
  const ignored = fileNames.filter((f) => !ALLOWED_EXT.test(f))
  if (files.includes('work.astro')) return { slug, kind: 'astro', files, ignored }
  if (files.includes('index.html')) return { slug, kind: 'html', files, ignored }
  return { slug, kind: null, reason: 'no work.astro or index.html' }
}
```

`integrate.ts` — three changes: (a) report type `accepted: { slug: string; kind: 'html' | 'astro'; ignored?: string[] }[]`; (b) the forbidden-scan loop iterates `work.files` instead of `files` (ignored files are never read): `for (const f of work.files.filter((f) => CODE_EXT.test(f)))`; (c) the accepted push becomes:

```ts
report.accepted.push({ slug, kind: work.kind, ...(work.ignored.length ? { ignored: work.ignored } : {}) })
```

- [ ] **Step 4: Run tests** — `npx vitest run src/lib/atelier/paths.test.ts src/lib/atelier/integrate.test.ts` → PASS. Then the full suite once: `npm test` (wrapper/sort/werke tests must stay green).

- [ ] **Step 5: Commit** — `git add src/lib/atelier/paths.ts src/lib/atelier/integrate.ts src/lib/atelier/paths.test.ts src/lib/atelier/integrate.test.ts && git commit -m "gate: copy allowlisted files only, report ignored instead of rejecting"`

---

### Task 3: Rejection feedback helper + CLI

**Files:**
- Create: `src/lib/atelier/feedback.ts`
- Create: `scripts/atelier/rejection-feedback.ts`
- Test: `src/lib/atelier/feedback.test.ts`

**Interfaces:**
- Consumes: `IntegrateReport` from `./integrate` (Task 2 shape).
- Produces: `rejectionFeedback(report: IntegrateReport, ns: string, date: string): string | null` — null when nothing was rejected; else a complete markdown feedback file body. CLI: `npx tsx scripts/atelier/rejection-feedback.ts <report.json> <ns>` prints the markdown to stdout (empty output when no rejections).

- [ ] **Step 1: Write failing tests** (`src/lib/atelier/feedback.test.ts`):

```ts
import { describe, expect, it } from 'vitest'
import { rejectionFeedback } from './feedback'

describe('rejectionFeedback', () => {
  it('returns null when nothing was rejected', () => {
    expect(rejectionFeedback({ accepted: [], rejected: [] }, 'field', '2026-07-02')).toBeNull()
  })
  it('renders one line per rejected work with slug and reason', () => {
    const md = rejectionFeedback(
      { accepted: [], rejected: [{ slug: 'a-work', reason: 'external resource (fetch/import()): https://x' }] },
      'field', '2026-07-02',
    )
    expect(md).toContain('# Integration feedback 2026-07-02')
    expect(md).toContain('`works/a-work`')
    expect(md).toContain('external resource')
    expect(md).toContain('NOT on the site')
  })
})
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run src/lib/atelier/feedback.test.ts` → FAIL (module missing).

- [ ] **Step 3: Implement** `src/lib/atelier/feedback.ts`:

```ts
// src/lib/atelier/feedback.ts
// Rejections inside a GREEN build were invisible to the engines — this renders the feedback
// file the workflow pushes into the engine repo so the next session can react.
import type { IntegrateReport } from './integrate'

export function rejectionFeedback(report: IntegrateReport, ns: string, date: string): string | null {
  if (report.rejected.length === 0) return null
  const lines = report.rejected.map((r) => `- \`works/${r.slug}\` — ${r.reason}`)
  return [
    `# Integration feedback ${date}`,
    '',
    `The site build was green, but ${report.rejected.length} work(s) did not pass the ${ns} integration gate and are NOT on the site:`,
    '',
    ...lines,
    '',
    'Rules: only allowlisted files (work.astro/index.html, meta.json, data.json, .css/.svg/.ts/.js) are copied — anything else is ignored, not fatal. External URLs are welcome as citation links but must not be loaded (no external script/img/fetch/import/Worker).',
    'Fix the work in `works/<slug>/` and commit again — the next integration picks it up automatically.',
    '',
  ].join('\n')
}
```

And `scripts/atelier/rejection-feedback.ts`:

```ts
// scripts/atelier/rejection-feedback.ts — CLI for the integrate workflows.
// Usage: npx tsx scripts/atelier/rejection-feedback.ts /tmp/report.json field
// Prints markdown to stdout when the report contains rejections; prints nothing otherwise.
import { readFileSync } from 'node:fs'
import { rejectionFeedback } from '../../src/lib/atelier/feedback'

const [, , reportPath, ns] = process.argv
if (!reportPath) {
  console.error('usage: rejection-feedback.ts <report.json> <ns>')
  process.exit(2)
}
const report = JSON.parse(readFileSync(reportPath, 'utf8'))
const date = new Date().toISOString().slice(0, 10)
const md = rejectionFeedback(report, ns ?? 'atelier', date)
if (md) process.stdout.write(md)
```

- [ ] **Step 4: Run tests** — `npx vitest run src/lib/atelier/feedback.test.ts` → PASS. Smoke the CLI: `echo '{"accepted":[],"rejected":[{"slug":"x","reason":"r"}]}' > /tmp/r.json && npx tsx scripts/atelier/rejection-feedback.ts /tmp/r.json field` → prints markdown; with `{"accepted":[],"rejected":[]}` → prints nothing.

- [ ] **Step 5: Commit** — `git add src/lib/atelier/feedback.ts src/lib/atelier/feedback.test.ts scripts/atelier/rejection-feedback.ts && git commit -m "gate: rejection feedback renderer + CLI"`

---

### Task 4: Workflows — push rejection feedback to the engines

**Files:**
- Modify: `.github/workflows/field-integrate.yml`
- Modify: `.github/workflows/atelier-integrate.yml`

**Interfaces:**
- Consumes: the CLI from Task 3; existing secrets `FIELD_BOT_TOKEN` / `ATELIER_BOT_TOKEN`; `/tmp/report.json` written by the integrate step.

- [ ] **Step 1: Read both workflow files.** In `field-integrate.yml`, add this step directly AFTER the "Commit + let deploy-cf rebuild (on success)" step (same indentation level):

```yaml
      - name: Rejection feedback to the engine repo (green builds too)
        if: success()
        env:
          BOT_TOKEN: ${{ secrets.FIELD_BOT_TOKEN }}
        run: |
          FEEDBACK=$(npx tsx scripts/atelier/rejection-feedback.ts /tmp/report.json field || true)
          if [ -n "$FEEDBACK" ] && [ -n "$BOT_TOKEN" ]; then
            DATE=$(date -u +%F)
            (
              git clone --depth 1 "https://x-access-token:${BOT_TOKEN}@github.com/frankbueltge/field-research" /tmp/fb-rej
              mkdir -p /tmp/fb-rej/field-feedback
              printf '%s\n' "$FEEDBACK" > "/tmp/fb-rej/field-feedback/${DATE}-rejections.md"
              cd /tmp/fb-rej && git config user.name "Field-Integrate" && git config user.email "field-integrate@users.noreply.github.com"
              git add field-feedback && git commit -m "feedback: works rejected at the gate ${DATE}" && git push
            ) || echo "rejection feedback skipped (non-fatal)"
          else
            echo "no rejections (or no BOT_TOKEN) — nothing to feed back"
          fi
```

- [ ] **Step 2:** Add the equivalent step to `atelier-integrate.yml` — replace `FIELD_BOT_TOKEN`→`ATELIER_BOT_TOKEN`, `field-research`→`irrtum-als-methode`, `field-feedback`→`atelier-feedback`, `field`→`atelier` (CLI arg and commit identity `Atelier-Integrate`, matching the file's existing identity strings — read the file first and mirror its conventions).

- [ ] **Step 3: Validate YAML** — `npx tsx -e "console.log('yaml ok')"` is not a YAML check; instead run `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/field-integrate.yml')); yaml.safe_load(open('.github/workflows/atelier-integrate.yml')); print('yaml ok')"` → `yaml ok`.

- [ ] **Step 4: Commit** — `git add .github/workflows/field-integrate.yml .github/workflows/atelier-integrate.yml && git commit -m "gate: feed silent rejections back to the engine repos"`

---

### Task 5: Latest-works helper

**Files:**
- Create: `src/lib/engines/latest.ts`
- Test: `src/lib/engines/latest.test.ts`

**Interfaces:**
- Produces: `latestWorks(input: { ns: EngineNs; metas: Record<string, EngineWorkMeta> }[], limit?: number): LatestWork[]` with `type EngineNs = 'field' | 'atelier'`, `interface EngineWorkMeta { title?: string; date?: string; embodies?: string; verkoerpert?: string }`, `interface LatestWork { ns: EngineNs; slug: string; title: string; date: string; blurb?: string; href: string }`. Consumed by Task 6 (MachinesStrip, WerkeStrip).

- [ ] **Step 1: Write failing tests** (`src/lib/engines/latest.test.ts`):

```ts
import { describe, expect, it } from 'vitest'
import { latestWorks } from './latest'

const field = {
  ns: 'field' as const,
  metas: {
    '/src/components/field/werke/2026-07-02-standing-docket/meta.json': { title: 'The Standing Docket', date: '2026-07-02', embodies: 'A recurring conviction record.' },
    '/src/components/field/werke/2026-07-01-calibration-gap/meta.json': { title: 'Calibration Certificate' },
  },
}
const atelier = {
  ns: 'atelier' as const,
  metas: { '/src/components/atelier/werke/2026-07-01-x/meta.json': { title: 'X', date: '2026-07-01' } },
}

describe('latestWorks', () => {
  it('merges namespaces, sorts date-desc, applies the limit', () => {
    const out = latestWorks([field, atelier], 2)
    expect(out).toHaveLength(2)
    expect(out[0]).toMatchObject({ ns: 'field', slug: '2026-07-02-standing-docket', href: '/field/werke/2026-07-02-standing-docket' })
  })
  it('falls back to the slug date prefix when meta.date is missing', () => {
    const out = latestWorks([field], 10)
    expect(out.find((w) => w.slug === '2026-07-01-calibration-gap')?.date).toBe('2026-07-01')
  })
  it('uses embodies as blurb and slug as title fallback', () => {
    const out = latestWorks([field], 1)
    expect(out[0].blurb).toBe('A recurring conviction record.')
  })
})
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run src/lib/engines/latest.test.ts` → FAIL (module missing).

- [ ] **Step 3: Implement** `src/lib/engines/latest.ts`:

```ts
// src/lib/engines/latest.ts
// Newest engine works across namespaces — pure and testable; the Astro components pass in
// their import.meta.glob results (globs cannot be parameterised).
export type EngineNs = 'field' | 'atelier'
export interface EngineWorkMeta { title?: string; date?: string; embodies?: string; verkoerpert?: string }
export interface LatestWork { ns: EngineNs; slug: string; title: string; date: string; blurb?: string; href: string }

export function latestWorks(
  input: { ns: EngineNs; metas: Record<string, EngineWorkMeta> }[],
  limit = 4,
): LatestWork[] {
  const all: LatestWork[] = []
  for (const { ns, metas } of input) {
    for (const [path, meta] of Object.entries(metas)) {
      const slug = path.match(/\/(?:werke|works)\/([^/]+)\//)?.[1]
      if (!slug) continue
      const date = meta.date ?? slug.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? ''
      all.push({
        ns, slug, date,
        title: meta.title ?? slug,
        blurb: meta.embodies ?? meta.verkoerpert,
        href: `/${ns}/werke/${slug}`,
      })
    }
  }
  return all
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug))
    .slice(0, limit)
}
```

- [ ] **Step 4: Run tests** — `npx vitest run src/lib/engines/latest.test.ts` → PASS.
- [ ] **Step 5: Commit** — `git add src/lib/engines/latest.ts src/lib/engines/latest.test.ts && git commit -m "engines: latest-works helper"`

---

### Task 6: Homepage — machines strip + latest lines + copy fix

**Files:**
- Create: `src/components/MachinesStrip.astro`
- Modify: `src/components/Home.astro` (insert section after WerkeStrip)
- Modify: `src/components/WerkeStrip.astro` (latest line on engine entries)
- Modify: `src/i18n/ui.ts` (new keys), `src/data/werke.ts` (field copy: nightly→collective)

**Interfaces:**
- Consumes: `latestWorks` (Task 5).
- Produces: UI only. i18n keys added: `machines.kicker` (de `Aus den Maschinen`, en `From the machines`), `machines.lead` (de `Die neuesten Werke der autonomen Engines`, en `The newest works of the autonomous engines`), `machines.latest` (de `zuletzt`, en `latest`).

- [ ] **Step 1:** Add the three keys to BOTH locale blocks in `src/i18n/ui.ts` (mirror the existing `werke.*` key style).

- [ ] **Step 2:** Create `src/components/MachinesStrip.astro`:

```astro
---
// Aus den Maschinen — die neuesten Werke über beide Engines hinweg, build-time aus den
// integrierten meta.json. Aktualisiert sich mit jedem Integrate von selbst.
import { t } from '@/i18n/ui'
import type { Locale } from '@/lib/site'
import { latestWorks, type EngineWorkMeta } from '@/lib/engines/latest'

interface Props { locale: Locale }
const { locale } = Astro.props

const fieldMeta = import.meta.glob('/src/components/field/werke/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>
const atelierMeta = import.meta.glob('/src/components/atelier/werke/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>
const fieldHtmlMeta = import.meta.glob('/src/content/field/works/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>
const atelierHtmlMeta = import.meta.glob('/src/content/atelier/works/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>

const latest = latestWorks([
  { ns: 'field', metas: { ...fieldMeta, ...fieldHtmlMeta } },
  { ns: 'atelier', metas: { ...atelierMeta, ...atelierHtmlMeta } },
], 4)
---

{latest.length > 0 && (
  <div class="rounded-[14px] border border-line bg-panel panel-raised p-6">
    <p class="mb-1 font-mono text-xs uppercase tracking-[0.18em] text-fg-faint">{t(locale, 'machines.kicker')}</p>
    <p class="mb-4 text-sm text-fg-muted">{t(locale, 'machines.lead')}</p>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {latest.map((w) => (
        <a href={w.href} class="group rounded-[10px] border border-line p-4 transition-colors hover:border-fg-faint">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint">{w.ns} · {w.date}</p>
          <p class="mt-1 font-semibold leading-snug transition-opacity group-hover:opacity-70">{w.title}</p>
          {w.blurb && <p class="mt-1 line-clamp-3 text-xs leading-relaxed text-fg-muted">{w.blurb}</p>}
        </a>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3:** In `src/components/Home.astro`, insert after the WerkeStrip section:

```astro
    <!-- Aus den Maschinen — neueste Engine-Werke (Spec 2026-07-02-engine-presentation-design.md) -->
    <section class="col-span-12 mt-4">
      <MachinesStrip locale={locale} />
    </section>
```

and add `import MachinesStrip from '@/components/MachinesStrip.astro'` to the frontmatter imports.

- [ ] **Step 4:** In `src/components/WerkeStrip.astro`: import the same glob+helper pattern (both `werke` globs only, one call per ns with `limit 1`), build `const latestByNs = new Map(...)` for `field` and `atelier`, and inside the entry loop render after the subtitle span:

```astro
        {(werk.id === 'field' || werk.id === 'atelier') && latestByNs.get(werk.id) && (
          <span class="block font-mono text-[11px] text-fg-faint">
            ↳ {t(locale, 'machines.latest')}: {latestByNs.get(werk.id)!.title} · {latestByNs.get(werk.id)!.date}
          </span>
        )}
```

(Frontmatter addition:)

```ts
import { latestWorks, type EngineWorkMeta } from '@/lib/engines/latest'
const fieldMeta = import.meta.glob('/src/components/field/werke/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>
const atelierMeta = import.meta.glob('/src/components/atelier/werke/*/meta.json', { eager: true, import: 'default' }) as Record<string, EngineWorkMeta>
const latestByNs = new Map([
  ['field', latestWorks([{ ns: 'field', metas: fieldMeta }], 1)[0]],
  ['atelier', latestWorks([{ ns: 'atelier', metas: atelierMeta }], 1)[0]],
])
```

- [ ] **Step 5:** In `src/data/werke.ts`, update the `field` entry copy (subtitle de+en AND description de+en): replace "An autonomous machine researching…" with "A machine collective researching where data, AI and power meet — it names itself" and the description with: "Meridian — an autonomous machine collective — holds research sessions twice a week: proposer, skeptic, verifier and chronicler investigate the live field where data, AI and power meet, build verifiable instruments, and publish only what survives their own gauntlet. Unedited, public — measurement turned on itself." (identical string for de and en, as today).

- [ ] **Step 6: Validate** — `npm run check` → 0 errors; `npx vitest run src/data/werke.test.ts` → PASS; `npm run build` → green.
- [ ] **Step 7: Commit** — `git add src/components/MachinesStrip.astro src/components/Home.astro src/components/WerkeStrip.astro src/i18n/ui.ts src/data/werke.ts && git commit -m "home: machines strip + latest engine works + collective copy"`

---

### Task 7: Journal session splitter + markdown renderer

**Files:**
- Create: `src/lib/engines/journal.ts`
- Test: `src/lib/engines/journal.test.ts`
- Modify: `package.json` (deps)

**Interfaces:**
- Produces: `splitSessions(body: string): RawSession[]` with `interface RawSession { heading: string; text: string }` (heading '' when the file has no `# Session N` headings — whole body becomes one session); `sessionMeta(text: string): { move: string | null; voices: string | null }`; `renderMarkdown(text: string): string` (markdown-it, `html:false`, `linkify:true`, plus `markDeliberation`: `<h2>` headings containing "critique" or "verdict" get `class="deliberation-mark"`). Consumed by Task 9.

- [ ] **Step 1: Install** — `npm install markdown-it && npm install -D @types/markdown-it` (markdown-it runs at build time inside Astro frontmatter).

- [ ] **Step 2: Write failing tests** (`src/lib/engines/journal.test.ts`):

```ts
import { describe, expect, it } from 'vitest'
import { renderMarkdown, sessionMeta, splitSessions } from './journal'

const twoSessions = `# Session 01 — 2026-07-01
**Convened:** Proposer (sub-agent). No other roles convened.
**Move:** build — instrument 009
alpha body

# Session 02 — 2026-07-01 (same day)
beta body`

describe('splitSessions', () => {
  it('splits on # Session N headings and keeps heading text', () => {
    const s = splitSessions(twoSessions)
    expect(s).toHaveLength(2)
    expect(s[0].heading).toBe('Session 01 — 2026-07-01')
    expect(s[1].text).toContain('beta body')
    expect(s[1].text).not.toContain('# Session 02')
  })
  it('returns the whole body as one heading-less session when no session headings exist', () => {
    const s = splitSessions('# A note\njust text')
    expect(s).toHaveLength(1)
    expect(s[0].heading).toBe('')
    expect(s[0].text).toContain('just text')
  })
})

describe('sessionMeta', () => {
  it('extracts move badge and voices line tolerantly', () => {
    const m = sessionMeta(splitSessions(twoSessions)[0].text)
    expect(m.move).toBe('build')
    expect(m.voices).toContain('Proposer')
  })
  it('returns nulls when the lines are absent', () => {
    expect(sessionMeta('plain text')).toEqual({ move: null, voices: null })
  })
})

describe('renderMarkdown', () => {
  it('renders markdown, escapes raw HTML, links URLs', () => {
    const html = renderMarkdown('**bold** <script>x</script> https://example.com')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('<a href="https://example.com"')
  })
  it('marks critique/verdict h2 headings', () => {
    const html = renderMarkdown("## Interlocutor's critique — Instrument 009\ntext")
    expect(html).toContain('class="deliberation-mark"')
  })
})
```

- [ ] **Step 3: Run to verify failure** — `npx vitest run src/lib/engines/journal.test.ts` → FAIL (module missing).

- [ ] **Step 4: Implement** `src/lib/engines/journal.ts`:

```ts
// src/lib/engines/journal.ts
// Splits an engine's journal-day markdown into sessions (the constitutions mandate
// `# Session NN` headings) and renders fragments at build time. Tolerant by design:
// files without session headings render as one card (pre-collective back-catalog).
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true })

export interface RawSession { heading: string; text: string }

export function splitSessions(body: string): RawSession[] {
  const chunks = ('\n' + body).split(/\n(?=# Session \d)/).map((c) => c.replace(/^\n/, ''))
  const sessions: RawSession[] = []
  for (const chunk of chunks) {
    if (!chunk.trim()) continue
    const m = chunk.match(/^# (Session \d+[^\n]*)/)
    if (m) sessions.push({ heading: m[1].trim(), text: chunk.replace(/^# [^\n]*\n?/, '') })
    else sessions.push({ heading: '', text: chunk })
  }
  return sessions.length ? sessions : [{ heading: '', text: body }]
}

export function sessionMeta(text: string): { move: string | null; voices: string | null } {
  const moveLine = text.match(/\*\*Move:\*\*\s*([^\n]+)/)?.[1]?.trim() ?? null
  const voices = text.match(/\*\*Convened:\*\*\s*([^\n]+)/)?.[1]?.trim() ?? null
  const move = moveLine ? (moveLine.split(/[\s—–(]/)[0] || null) : null
  return { move, voices }
}

/** h2 headings that carry the gauntlet's load get a hook for restrained highlighting. */
function markDeliberation(html: string): string {
  return html.replace(/<h2>([^<]*(?:critique|verdict)[^<]*)<\/h2>/gi, '<h2 class="deliberation-mark">$1</h2>')
}

export function renderMarkdown(text: string): string {
  return markDeliberation(md.render(text))
}
```

- [ ] **Step 5: Run tests** — `npx vitest run src/lib/engines/journal.test.ts` → PASS.
- [ ] **Step 6: Commit** — `git add package.json package-lock.json src/lib/engines/journal.ts src/lib/engines/journal.test.ts && git commit -m "engines: journal session splitter + fragment renderer"`

---

### Task 8: Shared EnginePage — parity refactor

**Files:**
- Create: `src/components/pages/EnginePage.astro`
- Modify: `src/components/pages/FieldPage.astro` (becomes thin wrapper)
- Modify: `src/components/pages/AtelierPage.astro` (becomes thin wrapper)
- Modify: `src/styles/global.css` (add `.engine-prose` block)

**Interfaces:**
- Consumes: `sortJournal`/`sortWorks` (`@/lib/atelier/sort`, unchanged).
- Produces: `EnginePage` props: `{ config: EngineConfig; entries: { id: string; body?: string }[] & collection entries; works: SortedWork[] }` — concretely, the wrappers pass `all` (their `getCollection(ns)` result) and the merged works array; EnginePage does journal/md filtering, sorting and rendering. `EngineConfig` (exported from EnginePage): `{ ns: 'field' | 'atelier'; repo: string; txt: { eyebrow: string; note: string; title: string; lede: string; worksH: string; journalH: string; source: string; sourceCode: string; sources: string; sandboxNote: string; empty: string; constitution: string; teamChannel: string } }`. **This task keeps journal rendering IDENTICAL to today** (astro `render()` per entry, one prose block per day) — the session cards land in Task 9, so this task is a pure parity refactor a reviewer can verify by diffing build output.
- Doc links: the header renders `Constitution` → `/{ns}/protocol` and `Team channel` → `/{ns}/requests` (routes come in Task 10; the links may 404 in this task's preview — acceptable, noted for the reviewer).

- [ ] **Step 1:** Add the `.engine-prose` block to `src/styles/global.css` — copy the 15 `.field-prose :global(...)` rules from `FieldPage.astro` verbatim, rewritten as plain global CSS (`.engine-prose h1 { … }` etc., no `:global()` wrapper needed in a plain stylesheet).

- [ ] **Step 2:** Create `EnginePage.astro`: move the ENTIRE body of today's `FieldPage.astro` (header, works gallery incl. iframe branch, md-works section, journal section) into it, with these mechanical replacements: every `txt.` stays (txt now comes from `config.txt`); `/field/werke/` → `` `/${config.ns}/werke/` ``; `REPO` → `config.repo`; `class="field-prose …"` → `class="engine-prose …"`; delete the component `<style>` block (styles now global). Header gains, after the source link paragraph:

```astro
    <p class="mt-1 font-mono text-xs text-fg-faint">
      <a href={`/${config.ns}/protocol`} class="underline transition-colors hover:text-fg">{config.txt.constitution}</a>
      · <a href={`/${config.ns}/requests`} class="underline transition-colors hover:text-fg">{config.txt.teamChannel}</a>
    </p>
```

Frontmatter: `interface Props { config: EngineConfig; all: any[]; works: { slug: string; kind: 'html' | 'astro'; date?: string; meta: any }[] }`; journal/mdWorks filtering + `render()` calls move here unchanged.

- [ ] **Step 3:** Shrink `FieldPage.astro` to a wrapper: keep its `getCollection('field')` + both `import.meta.glob` calls + `sortWorks` merge (globs cannot move — they are literal), build the config object with today's exact `txt` strings plus `constitution: 'Constitution'`, `teamChannel: 'Team channel'`, and render `<EnginePage config={config} all={all} works={works} />`.

- [ ] **Step 4:** Same for `AtelierPage.astro`: keep `locale` prop, `getCollection('atelier')`, its globs and its bilingual `txt` object (add `constitution: de ? 'Verfassung' : 'Constitution'`, `teamChannel: de ? 'Team-Kanal' : 'Team channel'`, `title` and `note` from its current h1 markup), then `<EnginePage …/>`. NOTE: AtelierPage today may render works sections with slightly different section headings (`interactiveH`) — preserve its strings by passing them through `txt`; where AtelierPage's markup genuinely differs from FieldPage's, FieldPage's structure wins (that's the shared page), but every atelier STRING must survive.

- [ ] **Step 5: Validate** — `npm run check` → 0 errors; `npm run build` → green; spot-check `dist/field/index.html` and `dist/atelier/index.html` still contain their works and journal text.

- [ ] **Step 6: Commit** — `git add src/components/pages/EnginePage.astro src/components/pages/FieldPage.astro src/components/pages/AtelierPage.astro src/styles/global.css && git commit -m "engines: shared EnginePage (parity refactor)"`

---

### Task 9: Journal session cards in EnginePage

**Files:**
- Modify: `src/components/pages/EnginePage.astro` (journal section)
- Modify: `src/styles/global.css` (session-card + deliberation styles)

**Interfaces:**
- Consumes: `splitSessions`, `sessionMeta`, `renderMarkdown` (Task 7); journal entries' RAW markdown via `entry.body` (astro:content glob-loader entries carry `.body`).

- [ ] **Step 1:** In `EnginePage.astro` frontmatter, replace the journal `render()` mapping with:

```ts
import { splitSessions, sessionMeta, renderMarkdown } from '@/lib/engines/journal'

const journalDays = journal.map((e) => {
  const sessions = splitSessions(e.body ?? '')
    .map((s) => ({ ...s, ...sessionMeta(s.text), html: renderMarkdown(s.text) }))
    .reverse() // file order is chronological; display newest session first
  return { id: e.id, sessions }
})
```

(The md-works and doc rendering keep astro `render()` — only the journal switches to fragments.)

- [ ] **Step 2:** Replace the journal section markup with:

```astro
  <section>
    <h2 class="mb-5 font-mono text-xs uppercase tracking-widest text-fg-faint">{config.txt.journalH}</h2>
    {journalDays.length === 0 && <p class="text-fg-faint">{config.txt.empty}</p>}
    {journalDays.map(({ id, sessions }, dayIdx) => (
      <div class="mb-10">
        <p class="mb-3 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-wider text-fg-faint">{dayLabel(id)}</p>
        {sessions.map((s, i) => (
          <details class="engine-session mb-3 rounded-[14px] border border-line bg-panel panel-raised" open={dayIdx === 0 && i === 0}>
            <summary class="cursor-pointer select-none px-5 py-3.5">
              <span class="font-semibold">{s.heading || dayLabel(id)}</span>
              {s.move && <span class="ml-2 inline-block rounded border border-line px-1.5 py-0.5 align-middle font-mono text-[10px] uppercase tracking-wider text-fg-muted">{s.move}</span>}
              {s.voices && <span class="mt-1 block font-mono text-[11px] normal-case tracking-normal text-fg-faint">Convened: {s.voices}</span>}
            </summary>
            <div class="engine-prose border-t border-line px-5 pb-5 pt-2" set:html={s.html} />
          </details>
        ))}
      </div>
    ))}
  </section>
```

- [ ] **Step 3:** Add to `global.css`:

```css
/* Engine journal — session cards + restrained deliberation highlighting */
.engine-session > summary { list-style: none; }
.engine-session > summary::-webkit-details-marker { display: none; }
.engine-session > summary::before { content: '▸'; margin-right: 0.5em; font-size: 0.8em; opacity: 0.6; }
.engine-session[open] > summary::before { content: '▾'; }
.engine-prose h2.deliberation-mark {
  border-left: 2px solid color-mix(in srgb, currentColor 45%, transparent);
  padding-left: 0.6em;
}
```

- [ ] **Step 4: Validate** — `npm run check` → 0 errors; `npm run build` → green. Spot-check `dist/field/index.html`: contains `<details` cards, exactly one `open` attribute across the journal, `Session 01` through `Session 09` appear as separate summaries for 2026-07-01, and the critique h2 carries `deliberation-mark`. `npm test` full suite → PASS.

- [ ] **Step 5: Commit** — `git add src/components/pages/EnginePage.astro src/styles/global.css && git commit -m "engines: journal renders as session cards (newest open)"`

---

### Task 10: Doc subpages — constitution + team channel

**Files:**
- Create: `src/pages/field/protocol.astro`, `src/pages/field/requests.astro`
- Create: `src/pages/atelier/protocol.astro`, `src/pages/atelier/requests.astro`

**Interfaces:**
- Consumes: `getCollection('field'|'atelier')` doc entries (ids `PROTOCOL`/`REQUESTS`, tolerant of a `.md` suffix), `.engine-prose` styles (Task 8).

- [ ] **Step 1:** Create `src/pages/field/protocol.astro`:

```astro
---
import { getCollection, render } from 'astro:content'
import Page from '@/layouts/Page.astro'

const all = await getCollection('field')
const doc = all.find((e) => e.id === 'PROTOCOL' || e.id === 'PROTOCOL.md')
const { Content } = doc ? await render(doc) : { Content: null }
---

<Page title="Constitution — Field Research" description="The standing instruction the autonomous research collective runs on. Written and maintained by the machine. Unedited.">
  <main id="main" class="mx-auto max-w-3xl px-4 py-14">
    <p class="font-mono text-xs uppercase tracking-[0.2em] text-fg-faint">Lab · autonomous research · constitution</p>
    <p class="mb-8 mt-2 font-mono text-[11px] text-fg-faint">
      Written and maintained by the machine · unedited · <a href="/field" class="underline transition-colors hover:text-fg">back to the field →</a>
    </p>
    {Content ? <article class="engine-prose"><Content /></article> : <p class="text-fg-faint">Not synced yet.</p>}
  </main>
</Page>
```

- [ ] **Step 2:** Create the three siblings by the same pattern: `field/requests.astro` (doc id `REQUESTS`, title "Team channel — Field Research", description "Requests and seeds between the collective and its human counterpart. Unedited.", eyebrow suffix `team channel`); `atelier/protocol.astro` and `atelier/requests.astro` (collection `atelier`, back link `/atelier`, title suffix "— Irrtum als Methode", chrome strings via `Astro.currentLocale === 'de'` ternaries: `Verfassung`/`Constitution`, `Team-Kanal`/`Team channel`, back label `zurück ins Atelier →`/`back to the studio →`; the doc TEXT renders verbatim, untranslated).

- [ ] **Step 3: Validate** — `npm run build` → green; `dist/field/protocol/index.html` contains "Research Protocol" (the constitution's own H1) and the unedited note; `dist/atelier/protocol/index.html` and both `requests` pages exist. Header links from Task 8 now resolve.

- [ ] **Step 4: Commit** — `git add src/pages/field/protocol.astro src/pages/field/requests.astro src/pages/atelier/protocol.astro src/pages/atelier/requests.astro && git commit -m "engines: constitution + team-channel subpages"`

---

### Task 11: Full validation

**Files:** none (verification only; fixes belong to the task that owns the file).

- [ ] **Step 1:** `npm run check` → 0 errors, 0 warnings beyond the pre-existing hints.
- [ ] **Step 2:** `npm test` → full suite green (gate, feedback, latest, journal, sort, werke, wrapper, integrate).
- [ ] **Step 3:** `npm run build` → green; page count ≥ previous build +4 (two protocol + two requests pages).
- [ ] **Step 4:** Grep the built site for leaks: `grep -ril "claude\|anthropic" dist/ | grep -v "\.js\.map" | head` → no engine-content hits (tolerate unrelated pre-existing matches only if they already exist on origin/main builds — report anything found).
- [ ] **Step 5:** Commit any stray fixes in their owning files (message `fix: <what>`), then report the branch ready for final review.

## Post-merge verification (controller, after push to main)

1. Trigger both workflows once: `gh workflow run field-integrate.yml --repo frankbueltge/frankbueltge.de` and `gh workflow run atelier-integrate.yml --repo frankbueltge/frankbueltge.de`; wait for green.
2. Verify live: `/field` shows The Standing Docket AND The Fairness Trap in Works; homepage shows the machines strip (docket first) and latest-lines in the field/atelier entries; `/field` journal shows collapsible session cards (S01–S09 separate); `/field/protocol` renders the constitution.
3. The integrate report should list the docket's README/py/data as `ignored`, and `rejected` should be empty — if anything is still rejected, the rejection-feedback step must have written `field-feedback/<date>-rejections.md` to the engine repo (that's the mechanism working, not a failure).

## Self-Review (plan ↔ spec)

- Part 1 gate: links-not-loads ✓ (Task 1) · copy-allowlisted + ignored report ✓ (Task 2) · rejection feedback helper+workflows ✓ (Tasks 3–4) · tests extended not weakened ✓ (Tasks 1–3).
- Part 2 homepage: MachinesStrip ✓ + WerkeStrip latest line ✓ + shared helper ✓ (Tasks 5–6) · stale werke.ts copy fixed ✓ (Task 6 Step 5).
- Part 3 EnginePage: shared component ✓ (Task 8) · session cards, newest open, badges/voices, markdown-it, fallback for heading-less files ✓ (Tasks 7+9) · deliberation highlighting restrained ✓ (Task 9) · sort helpers stay in `src/lib/atelier/sort.ts` (deviation from spec's "move to lib/engines" — a pure rename adds risk without value; both pages already share them; noted here deliberately).
- Part 4 doc subpages ✓ (Task 10) · FIELD.md/SITE-API.md not rendered ✓.
- Acceptance ✓ (Task 11 + post-merge section). Worktree/beifang guard ✓ (Global Constraints).
