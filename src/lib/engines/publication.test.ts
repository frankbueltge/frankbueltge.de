// The publication rule of 2026-10-17 (Frank's decision, wording private): the site publishes the
// practices' finished works and cycle presentations, nothing else of theirs. This file holds the
// rule (publication.mjs), the prune that applies it to dist/ (publication-prune.mjs), the 301s
// that keep every retired address working (public/_redirects), and the links that name a
// practice's newest piece (publication-links.ts) to what was decided that day.
//
// Two kinds of evidence, on purpose. The rule and the prune are tested on FIXTURES, so a night in
// which a practice mirrors something new can never turn this file red. The redirect file is tested
// as committed, against fixed example addresses: every route retired that day, and a list of files
// that must stay published. Whether the live mirrors hold a file a redirect would shadow is not a
// test — a practice can make that true any night, and a red suite would stop every practice's
// deploy — the build reports it instead (publication-prune.mjs, the shadow warning).

import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
  BUILD_READS,
  MIRRORS,
  REPOSITORY_DOORS,
  classify,
  compilePattern,
  isInProgress,
  isPublished,
  isReadByBuild,
  isWorkingMaterial,
  loadedAssets,
  matchRedirect,
  n1MarginWorks,
  openCycleOf,
  parseRedirects,
  publishedHref,
  redirectBudget,
  repoPlaceOf,
  servedAt,
  workFolderOf,
} from './publication.mjs'
import publicationPrune, { prunePublication, summaryLine, withOpenCycleRewrites } from './publication-prune.mjs'
import { sessionHref } from './publication-links'

const GH = 'https://github.com/frankbueltge'
const rules = parseRedirects(readFileSync('public/_redirects', 'utf8'))
const go = (path: string) => matchRedirect(rules, path)?.location ?? null

// ── the rule ──────────────────────────────────────────────────────────────────────────────────

describe('the rule, file by file', () => {
  it('publishes the presentations and closing reports whole — working files included', () => {
    for (const path of [
      'atelier/presentations/cycle-008/index.html',
      'atelier/presentations/cycle-008/build.py',
      'field/presentations/cycle-006/paper.md',
      'field/closing-report/index.html',
      'studio/presentations/cycle-008/meta.json',
      'studio/closing-report/reach/run.sh',
    ]) {
      expect(isPublished(path), path).toBe(true)
    }
  })

  it('publishes the window’s front page and none of its session folders', () => {
    expect(isPublished('atelier/window/index.html')).toBe(true)
    expect(isPublished('atelier/window/cycle-008-session-5/index.html')).toBe(false)
    expect(isPublished('atelier/window/cycle-001/figure.svg')).toBe(false)
    // the Field and the Studio keep no published window
    expect(isPublished('field/window/index.html')).toBe(false)
    expect(isPublished('studio/window/index.html')).toBe(false)
  })

  it('publishes the works, and not the Field’s session artifacts', () => {
    expect(isPublished('studio/werke-html/2026-10-16-filed-under/index.html')).toBe(true)
    expect(isPublished('atelier/werke-html/2026-07-04-attractor/index.html')).toBe(true)
    expect(isPublished('error-as-method/works-html/2026-10-16-told-true/index.html')).toBe(true)
    expect(isPublished('error-as-method/2026-10-16-told-true/figure.svg')).toBe(true)
    expect(isPublished('arch/works/arrival/iteration-15/us6000tmta.html')).toBe(true)
    expect(isPublished('field/artifacts/2026-10-16-the-end-sent-apart/index.html')).toBe(false)
    expect(isPublished('field/artifacts/cycle-001/2026-08-31-links-in-the-abstract/data.json')).toBe(false)
  })

  it('publishes n-1’s surface, record, works and declared works — not its studies, nights or material', () => {
    const n1Pages = new Set(['n-1/projects/usgs-fixed-depth/index.html', 'n-1/material/ct-logs/x/loaded.json'])
    const n1 = (path: string) => isPublished(path, { n1Pages })
    for (const kept of ['n-1/index.html', 'n-1/record.html', 'n-1/surface/surface.js', 'n-1/atlas/layers/index.json', 'n-1/works/two-nights-deep/index.html', 'n-1/projects/usgs-fixed-depth/index.html', 'n-1/material/ct-logs/x/loaded.json']) {
      expect(n1(kept), kept).toBe(true)
    }
    for (const gone of ['n-1/projects/will-write/index.html', 'n-1/projects/usgs-fixed-depth/build.py', 'n-1/nights/39-fourteenth-night.md', 'n-1/material/night-sky/x.json', 'n-1/reading/CARRY.md', 'n-1/foundation/x.md', 'n-1/README.md', 'n-1/render-check.js', 'n-1/window.json', 'n-1/atlas/consult.py']) {
      expect(n1(gone), gone).toBe(false)
    }
  })

  it('publishes Arch’s works and keeps its record home', () => {
    expect(isPublished('arch/works/arrival/iteration-15/check.js')).toBe(true)
    for (const gone of ['arch/record/2026-08-22-decision-operative-model.md', 'arch/ledger/x.md', 'arch/registers/README.md', 'arch/reading/00-method.md', 'arch/apparatus/phase-0-prompt.md', 'arch/material/operative-model.md', 'arch/BALANCE.md']) {
      expect(isPublished(gone), gone).toBe(false)
    }
  })

  it('keeps Machine Attention’s finished archive whole', () => {
    for (const path of ['attention/index.html', 'attention/ledger.html', 'attention/future/x/index.html', 'attention/notes.md']) {
      expect(isPublished(path), path).toBe(true)
    }
  })

  it('never decides a page the site renders itself, nor anything of the house', () => {
    const isMirrored = () => false
    expect(classify('field/papers/cycle-006/index.html', { isMirrored })).toMatchObject({ published: true, reason: 'page' })
    expect(classify('arch/index.html', { isMirrored })).toMatchObject({ published: true, reason: 'page' })
    expect(classify('index.html')).toMatchObject({ published: true, reason: 'house' })
    expect(classify('protocol/2026-10-17/index.html')).toMatchObject({ published: true, reason: 'house' })
  })
})

describe('the working-material rule inside a published work', () => {
  it('names the work a file belongs to', () => {
    expect(workFolderOf('studio/werke-html/w/sub/x.py')).toBe('studio/werke-html/w')
    expect(workFolderOf('arch/works/README.md')).toBe('arch/works')
    expect(workFolderOf('studio/presentations/cycle-008/x.py')).toBeNull()
  })

  it('takes working material by type, and never a file a work is made of', () => {
    for (const ext of ['py', 'md', 'txt', 'jsonl', 'log', 'sh', 'ipynb', 'gz', 'tsv']) {
      expect(isWorkingMaterial(`studio/werke-html/w/file.${ext}`), ext).toBe(true)
    }
    for (const ext of ['html', 'js', 'mjs', 'css', 'json', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'mp3', 'wav', 'ogg', 'mp4', 'webm', 'woff', 'woff2', 'ttf', 'csv', 'wasm']) {
      expect(isWorkingMaterial(`studio/werke-html/w/file.${ext}`), ext).toBe(false)
    }
  })

  it('takes the nightly faces’ briefs, reports and coder runs by place, whatever their type', () => {
    for (const folder of ['briefs', 'reports', 'coderA', 'coderB', 'coderC']) {
      expect(isWorkingMaterial(`error-as-method/works-html/w/${folder}/x.json`), folder).toBe(true)
    }
    expect(isWorkingMaterial('error-as-method/works-html/w/makers/x.json')).toBe(false)
    // only in the faces: a Studio work may keep a folder of that name
    expect(isWorkingMaterial('studio/werke-html/w/reports/x.json')).toBe(false)
  })

  it('keeps a working file the work itself names, and a work still in progress whole', () => {
    const path = 'studio/werke-html/w/build.py'
    expect(classify(path)).toMatchObject({ published: false, reason: 'working material' })
    expect(classify(path, { isReferenced: (p) => p === path })).toMatchObject({ published: true, reason: 'referenced' })
    expect(classify(path, { inProgress: new Set(['studio/werke-html/w']) })).toMatchObject({ published: true, reason: 'in progress' })
  })

  it('reads “in progress” the way the Studio writes it into a work’s meta.json', () => {
    expect(isInProgress({ status: 'in progress: increment 1 of 3, 2026-10-16' })).toBe(true)
    expect(isInProgress({ status: 'In-Progress' })).toBe(true)
    expect(isInProgress({ status: 'presented 2026-10-16 (session 177) as the Studio’s work for cycle 008' })).toBe(false)
    expect(isInProgress({})).toBe(false)
    expect(isInProgress(null)).toBe(false)
  })
})

describe('what a page loads', () => {
  it('reads sources, stylesheets, fetches and quoted asset names — never a link a visitor follows', () => {
    const html = [
      '<link rel="stylesheet" href="surface/surface.css">',
      '<script src="surface/surface.js"></script>',
      '<img src="../stills/a.png" alt="">',
      '<a href="../languages.html">a study</a>',
      '<a href="build.py">source</a>',
      "<script>fetch('askings.json'); fetch('../../material/ct-logs/run/crt.json'); const f = 'figures.csv'</script>",
      '<a href="https://example.org/x.json">elsewhere</a>',
    ].join('\n')
    expect(loadedAssets(html, 'n-1/works/w/index.html')).toEqual([
      'n-1/material/ct-logs/run/crt.json',
      'n-1/works/stills/a.png',
      'n-1/works/w/askings.json',
      'n-1/works/w/figures.csv',
      'n-1/works/w/surface/surface.css',
      'n-1/works/w/surface/surface.js',
    ])
  })

  it('reads the works n-1’s own front page lists', () => {
    const margin = { works: [{ href: 'works/below-the-threshold/' }, { href: 'projects/unicode-admission/before-anyone-asked/' }, { title: 'no address' }] }
    expect(n1MarginWorks(margin)).toEqual(['n-1/works/below-the-threshold/index.html', 'n-1/projects/unicode-admission/before-anyone-asked/index.html'])
    expect(n1MarginWorks(null)).toEqual([])
  })
})

// ── the prune, on a fixture ───────────────────────────────────────────────────────────────────

describe('the prune, on a built site in miniature', () => {
  const base = mkdtempSync(join(tmpdir(), 'publication-'))
  const dist = join(base, 'dist')
  const pub = join(base, 'public')
  afterAll(() => rmSync(base, { recursive: true, force: true }))

  const put = (root: string, path: string, text = 'x') => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  // what the mirrors bring: written to public/ and, as the build copies it, to dist/
  const MIRRORED: Record<string, string> = {
    'atelier/presentations/cycle-001/index.html': '<p>presentation</p>',
    'atelier/presentations/cycle-001/notes.md': 'kept whole',
    'atelier/window/index.html': '<p>closing report</p>',
    'atelier/window/cycle-001-session-2/index.html': '<p>a session</p>',
    'atelier/werke-html/w1/index.html': '<a href="data.py">how it was made</a>',
    'atelier/werke-html/w1/data.py': 'print()',
    'atelier/werke-html/w1/notes.md': 'nobody names me',
    'atelier/werke-html/w1/figure.png': 'png',
    'field/artifacts/a1/index.html': '<p>an artifact</p>',
    'field/closing-report/index.html': '<p>report</p>',
    'field/closing-report/run.py': 'print()',
    'studio/werke-html/s1/index.html': '<p>a work</p>',
    'studio/werke-html/s1/build.py': 'print()',
    'studio/werke-html/s2/index.html': '<p>growing</p>',
    'studio/werke-html/s2/build.py': 'print()',
    'studio/werke-html/s2/SCORE.md': 'the score',
    'error-as-method/works-html/f1/index.html': "<script>fetch('reports/summary.json')</script>",
    'error-as-method/works-html/f1/reports/summary.json': '{}',
    'error-as-method/works-html/f1/reports/other.json': '{}',
    'error-as-method/works-html/f1/briefs/b1.md': 'a brief',
    'error-as-method/works-html/f1/log.txt': 'a log',
    'error-as-method/2026-10-16-x/figure.svg': '<svg/>',
    'n-1/index.html': '<script src="surface/surface.js"></script>',
    'n-1/surface/surface.js': "fetch('atlas/layers/index.json')",
    'n-1/atlas/layers/index.json': '[]',
    'n-1/atlas/consult.py': 'print()',
    'n-1/nights/01-first-night.md': '# Night 1',
    'n-1/projects/p1/index.html': "<script>fetch('data.json'); fetch('../../material/m/x.json')</script>",
    'n-1/projects/p1/data.json': '{}',
    'n-1/projects/p1/notes.md': 'notes',
    'n-1/projects/p2/index.html': '<p>a study</p>',
    'n-1/material/m/x.json': '{}',
    'n-1/material/m/y.json': '{}',
    'attention/index.html': '<p>archive</p>',
    'arch/works/w/index.html': '<p>bare</p>',
    'arch/works/w/README.md': 'how it is rebuilt',
    'arch/record/r.md': 'record',
    'arch/BALANCE.md': 'balance',
  }
  // what the build renders itself: in dist/ only
  const PAGES = ['index.html', 'atelier/works/index.html', 'error-as-method/2026-10-16-x/index.html', 'arch/index.html']
  for (const [path, text] of Object.entries(MIRRORED)) {
    put(pub, path, text)
    put(dist, path, text)
  }
  for (const path of PAGES) put(dist, path, '<p>page</p>')
  put(base, 'src/content/studio/works/s2/meta.json', JSON.stringify({ status: 'in progress: increment 1 of 3, 2026-10-16' }))
  // a rule that shadows a published file, so the warning has something to report
  put(dist, '_redirects', '/attention/* /elsewhere 301\n')

  const result = prunePublication({ dist, publicDir: pub, root: base, readWorks: () => new Set(['n-1/projects/p1/index.html']) })
  const gone = new Set(result.removed)

  it('removes the window’s session folders, the Field’s artifacts, n-1’s and Arch’s non-works and unnamed working files', () => {
    expect([...gone].sort()).toEqual([
      'arch/BALANCE.md',
      'arch/record/r.md',
      'arch/works/w/README.md',
      'atelier/werke-html/w1/notes.md',
      'atelier/window/cycle-001-session-2/index.html',
      'error-as-method/works-html/f1/briefs/b1.md',
      'error-as-method/works-html/f1/log.txt',
      'error-as-method/works-html/f1/reports/other.json',
      'field/artifacts/a1/index.html',
      'n-1/atlas/consult.py',
      'n-1/material/m/y.json',
      'n-1/nights/01-first-night.md',
      'n-1/projects/p1/notes.md',
      'n-1/projects/p2/index.html',
      'studio/werke-html/s1/build.py',
    ])
    for (const path of gone) expect(existsSync(join(dist, path)), path).toBe(false)
  })

  it('keeps presentations, closing reports, works, the window’s front page and what a kept page loads', () => {
    for (const path of Object.keys(MIRRORED).filter((p) => !gone.has(p))) expect(existsSync(join(dist, path)), path).toBe(true)
    for (const path of ['atelier/window/index.html', 'atelier/presentations/cycle-001/notes.md', 'field/closing-report/run.py', 'atelier/werke-html/w1/data.py', 'error-as-method/works-html/f1/reports/summary.json', 'n-1/projects/p1/data.json', 'n-1/material/m/x.json', 'studio/werke-html/s2/build.py', 'studio/werke-html/s2/SCORE.md']) {
      expect(gone.has(path), path).toBe(false)
    }
  })

  it('never touches a page the site renders itself', () => {
    for (const path of PAGES) expect(existsSync(join(dist, path)), path).toBe(true)
  })

  it('leaves no empty directory behind', () => {
    for (const dir of ['atelier/window/cycle-001-session-2', 'field/artifacts', 'n-1/nights', 'arch/record', 'error-as-method/works-html/f1/briefs']) {
      expect(existsSync(join(dist, dir)), dir).toBe(false)
    }
  })

  it('counts per practice, and says so in one line', () => {
    expect(result.practices.field).toEqual({ kept: 1 + 1, removed: 1 })
    expect(result.practices.attention).toEqual({ kept: 1, removed: 0 })
    const line = summaryLine(result)
    expect(line).toMatch(/^publication rule \(2026-10-17\): \d+ mirrored files, \d+ kept, 15 removed — kept\/removed per practice: /)
    expect(line).toContain('field 2/1')
    expect(line.split('\n')).toHaveLength(1)
  })

  it('reports a redirect that would take a published file off the site', () => {
    expect(result.shadowed.some((s) => s.startsWith('/attention/ → /elsewhere'))).toBe(true)
    expect(result.warnings.some((w) => w.includes('caught by a redirect rule'))).toBe(true)
  })

  it('decides without deleting on a dry run', () => {
    const dry = prunePublication({ dist: pub, publicDir: pub, root: base, readWorks: () => new Set(['n-1/projects/p1/index.html']), dryRun: true })
    expect(dry.removed.length).toBe(15)
    for (const path of Object.keys(MIRRORED)) expect(existsSync(join(pub, path)), path).toBe(true)
  })

  it('never fails for a missing directory', () => {
    const empty = mkdtempSync(join(tmpdir(), 'publication-empty-'))
    try {
      expect(() => prunePublication({ dist: join(empty, 'nowhere'), publicDir: join(empty, 'nothing'), root: empty })).not.toThrow()
      expect(prunePublication({ dist: empty, publicDir: empty, root: empty }).removed).toEqual([])
    } finally {
      rmSync(empty, { recursive: true, force: true })
    }
  })

  it('is an Astro integration that logs one line and never throws', () => {
    const integration = publicationPrune()
    const lines: string[] = []
    const logger = { info: (m: string) => lines.push(`info ${m}`), warn: (m: string) => lines.push(`warn ${m}`), error: (m: string) => lines.push(`error ${m}`) }
    const hooks = integration.hooks as unknown as Record<string, (options: unknown) => void>
    hooks['astro:config:done']!({ config: { publicDir: new URL(`file://${join(base, 'public')}/`), root: new URL(`file://${base}/`) } })
    expect(() => hooks['astro:build:done']!({ dir: new URL(`file://${join(base, 'no-dist')}/`), logger })).not.toThrow()
    expect(lines.some((l) => l.startsWith('info publication rule'))).toBe(true)
  })
})

// ── the redirects ─────────────────────────────────────────────────────────────────────────────

describe('public/_redirects, read the way Cloudflare Pages reads it', () => {
  it('stays inside both budgets, with every exact rule above the first pattern', () => {
    const budget = redirectBudget(rules)
    expect(budget.static).toBeLessThanOrEqual(budget.maxStatic)
    expect(budget.dynamic).toBeLessThanOrEqual(budget.maxDynamic)
    const first = rules.findIndex((r) => !r.static)
    expect(rules.slice(first).filter((r) => !/\*|:[A-Za-z]/.test(r.from)).map((r) => r.from)).toEqual([])
  })

  it('compiles a pattern as Cloudflare does: a splat may be empty, a placeholder may not', () => {
    expect(compilePattern('/a/*').test('/a/')).toBe(true)
    expect(compilePattern('/a/*').test('/a')).toBe(false)
    expect(compilePattern('/w/:dir/*').test('/w/index.html')).toBe(false)
    expect(compilePattern('/w/:dir/*').test('/w/cycle-1/')).toBe(true)
    expect(compilePattern('/w/cycle-:rest').test('/w/cycle-1')).toBe(true)
  })

  it('answers an exact rule before any pattern, and the patterns in order', () => {
    const own = parseRedirects('/a/b /exact 301\n/a/* /first 301\n/a/:x /second 301\n')
    expect(matchRedirect(own, '/a/b')?.location).toBe('/exact')
    expect(matchRedirect(own, '/a/c')?.location).toBe('/first')
  })

  it('counts every rule below the first pattern as dynamic, as Cloudflare does', () => {
    const own = parseRedirects('/x /y 301\n/a/* /b 301\n/c /d 301\n')
    expect(redirectBudget(own)).toMatchObject({ static: 1, dynamic: 2 })
  })

  it('names the addresses Pages serves a file at', () => {
    expect(servedAt('atelier/window/index.html')).toEqual(['/atelier/window/', '/atelier/window', '/atelier/window/index.html'])
    expect(servedAt('n-1/record.html')).toEqual(['/n-1/record.html', '/n-1/record'])
    expect(servedAt('n-1/surface/surface.js')).toEqual(['/n-1/surface/surface.js'])
  })
})

/** Every route deleted on 2026-10-17, with an address it served and where that address leads now. */
const RETIRED: [string, string, string | null][] = [
  // [deleted page file, an address it served, where it leads — null: the address must be caught]
  ['src/pages/atelier/journal.astro', '/atelier/journal', `${GH}/ulysses/tree/main/journal`],
  ['src/pages/atelier/journal.astro', '/atelier/journal/', `${GH}/ulysses/tree/main/journal`],
  ['src/pages/atelier/journal/[slug].astro', '/atelier/journal/s9/', `${GH}/ulysses/blob/main/journal/2026-06-30-sitzung-9.md`],
  ['src/pages/atelier/journal/[slug].astro', '/atelier/journal/note-a-cap-with-no-unit/', `${GH}/ulysses/blob/main/journal/2026-09-19-a-cap-with-no-unit.md`],
  ['src/pages/atelier/journal/[slug].astro', '/atelier/journal/s9', `${GH}/ulysses/tree/main/journal`],
  ['src/pages/atelier/lines/[id].astro', '/atelier/lines/2026-07-19-null-island/', `${GH}/ulysses/tree/main/projects/2026-07-19-null-island/`],
  ['src/pages/atelier/texts.astro', '/atelier/texts/', `${GH}/ulysses/tree/main/works`],
  ['src/pages/atelier/texts/[slug].astro', '/atelier/texts/genealogie/', `${GH}/ulysses/blob/main/works/genealogie.md`],
  ['src/pages/atelier/protocol.astro', '/atelier/protocol', `${GH}/ulysses/blob/main/PROTOCOL.md`],
  ['src/pages/atelier/requests.astro', '/atelier/requests/', `${GH}/ulysses/blob/main/REQUESTS.md`],
  ['src/pages/atelier/requests/archive.astro', '/atelier/requests/archive/', `${GH}/ulysses/blob/main/REQUESTS-ARCHIVE.md`],
  ['src/pages/atelier/archive/cockpit.astro', '/atelier/archive/cockpit/', '/atelier'],
  ['src/pages/field/journal.astro', '/field/journal/', `${GH}/field-research/tree/main/journal`],
  ['src/pages/field/journal/[anchor].astro', '/field/journal/cs-1/', `${GH}/field-research/blob/main/journal/2026-07-01.md`],
  ['src/pages/field/journal/[anchor].astro', '/field/journal/pre-2026-07-01-8/', `${GH}/field-research/blob/main/journal/2026-07-01.md`],
  ['src/pages/field/protocol.astro', '/field/protocol/', `${GH}/field-research/blob/main/PROTOCOL.md`],
  ['src/pages/field/requests.astro', '/field/requests', `${GH}/field-research/blob/main/REQUESTS.md`],
  ['src/pages/field/requests/archive.astro', '/field/requests/archive', `${GH}/field-research/blob/main/REQUESTS-ARCHIVE.md`],
  ['src/pages/studio/journal.astro', '/studio/journal', `${GH}/studio/tree/main/journal`],
  ['src/pages/studio/journal/[anchor].astro', '/studio/journal/cs-99/', `${GH}/studio/blob/main/journal/2026-08-16-session-99.md`],
  ['src/pages/studio/protocol.astro', '/studio/protocol', `${GH}/studio/blob/main/PROTOCOL.md`],
  ['src/pages/studio/requests.astro', '/studio/requests/', `${GH}/studio/blob/main/REQUESTS.md`],
  ['src/pages/studio/requests/archive.astro', '/studio/requests/archive/', `${GH}/studio/blob/main/REQUESTS-ARCHIVE.md`],
  ['src/pages/error-as-method/genealogy.astro', '/error-as-method/genealogy/', `${GH}/error-as-method`],
  ['src/pages/error-as-method/position.astro', '/error-as-method/position', `${GH}/error-as-method`],
  ['src/pages/error-as-method/register.astro', '/error-as-method/register/', `${GH}/error-as-method`],
  ['src/pages/error-as-method/reading.astro', '/error-as-method/reading', `${GH}/error-as-method`],
  ['src/pages/arch/read/[...path].astro', '/arch/read/BALANCE/', `${GH}/arch/blob/main/BALANCE.md`],
  ['src/pages/arch/read/[...path].astro', '/arch/read/ledger/2026-08-23-session-11-two-perceptions/', `${GH}/arch/blob/main/ledger/2026-08-23-session-11-two-perceptions.md`],
  ['src/pages/arch/read/[...path].astro', '/arch/read/works/arrival/README', `${GH}/arch/blob/main/works/arrival/README.md`],
  ['src/pages/plenum/index.astro', '/plenum', `${GH}/data-snack-plenum`],
  ['src/pages/plenum/record.astro', '/plenum/record/', `${GH}/data-snack-plenum`],
  ['src/pages/plenum/protocol.astro', '/plenum/protocol/', `${GH}/data-snack-plenum`],
  ['src/pages/plenum/requests.astro', '/plenum/requests', `${GH}/data-snack-plenum`],
  ['src/pages/plenum/requests/archive.astro', '/plenum/requests/archive/', `${GH}/data-snack-plenum`],
]

describe('every route retired on 2026-10-17 is gone and redirected', () => {
  it.each(RETIRED)('%s — %s', (file, address, target) => {
    expect(existsSync(file), `${file} still exists`).toBe(false)
    expect(go(address)).toBe(target)
  })

  it('leads a door and the 301 of the page it replaced to the same place', () => {
    for (const practice of ['atelier', 'field', 'studio'] as const) {
      const doors = REPOSITORY_DOORS[practice]
      expect(go(`/${practice}/journal/`)).toBe(doors.journal)
      expect(go(`/${practice}/protocol/`)).toBe(doors.protocol)
      expect(go(`/${practice}/requests/`)).toBe(doors.requests)
      expect(go(`/${practice}/requests/archive/`)).toBe(doors.requestsArchive)
    }
  })

  it('lands a journal session on the file the mirror holds it in', () => {
    for (const [address, file] of [
      ['/atelier/journal/s9/', 'src/content/atelier/journal/2026-06-30-sitzung-9.md'],
      ['/field/journal/cs-1/', 'src/content/field/journal/2026-07-01.md'],
      ['/studio/journal/cs-99/', 'src/content/studio/journal/2026-08-16-session-99.md'],
    ] as const) {
      expect(go(address)).toMatch(new RegExp(`/blob/main/${file.split('/').slice(3).join('/')}$`))
      expect(existsSync(file), file).toBe(true)
    }
  })
})

describe('the files the build stopped copying lead to their repositories', () => {
  it.each([
    ['/atelier/window/cycle-008-session-5/', `${GH}/ulysses/tree/main/window/cycle-008-session-5`],
    ['/atelier/window/cycle-008-session-5/index.html', `${GH}/ulysses/tree/main/window/cycle-008-session-5`],
    ['/atelier/window/cycle-008-session-5', `${GH}/ulysses/tree/main/window/cycle-008-session-5`],
    ['/field/artifacts', `${GH}/field-research/tree/main/artifacts`],
    ['/field/artifacts/2026-10-16-the-end-sent-apart/', `${GH}/field-research/tree/main/artifacts/2026-10-16-the-end-sent-apart/`],
    ['/n-1/nights/39-fourteenth-night.md', `${GH}/n-1/blob/main/nights/39-fourteenth-night.md`],
    ['/n-1/projects/will-write/', `${GH}/n-1/blob/main/projects/will-write/`],
    ['/n-1/projects/unicode-admission/', `${GH}/n-1/tree/main/projects/unicode-admission`],
    ['/n-1/projects/unicode-admission/languages', `${GH}/n-1/blob/main/projects/unicode-admission/languages.html`],
    ['/n-1/README.md', `${GH}/n-1/blob/main/README.md`],
    ['/arch/record/2026-08-22-decision-operative-model.md', `${GH}/arch/blob/main/record/2026-08-22-decision-operative-model.md`],
    ['/arch/BALANCE.md', `${GH}/arch/blob/main/BALANCE.md`],
  ])('%s', (address, target) => {
    expect(go(address)).toBe(target)
  })
})

/** Files that stay published — no redirect may catch any address they are served at. */
const KEPT = [
  'index.html',
  'atelier/index.html',
  'atelier/works/index.html',
  'atelier/werke/2026-06-29-cerfs-margin/index.html',
  'atelier/window/index.html',
  'atelier/presentations/cycle-008/index.html',
  'atelier/werke-html/2026-07-04-attractor/index.html',
  'field/index.html',
  'field/instruments/index.html',
  'field/papers/cycle-006/index.html',
  'field/werke/2026-07-01-calibration-gap/index.html',
  'field/presentations/cycle-006/index.html',
  'field/closing-report/index.html',
  'field/chronicle.json',
  'studio/index.html',
  'studio/works/index.html',
  'studio/werke-html/2026-10-16-filed-under/index.html',
  'studio/presentations/cycle-008/index.html',
  'studio/closing-report/index.html',
  'studio/chronicle.json',
  'error-as-method/index.html',
  'error-as-method/2026-10-16-told-true/index.html',
  'error-as-method/2026-10-16-told-true/figure.svg',
  'error-as-method/works-html/2026-10-16-told-true/index.html',
  'n-1/index.html',
  'n-1/record.html',
  'n-1/surface/surface.js',
  'n-1/surface/margin.json',
  'n-1/atlas/layers/index.json',
  'n-1/works/below-the-threshold/index.html',
  'n-1/projects/usgs-fixed-depth/index.html',
  'n-1/projects/elbe-low-water/the-cut/index.html',
  'n-1/projects/met-date-intervals/dialects/index.html',
  'n-1/projects/unicode-admission/before-anyone-asked/index.html',
  'n-1/projects/transcribers-notes/silently/index.html',
  'n-1/projects/minor-planet-names/named-into-the-sky/index.html',
  'n-1/projects/light-characters/within-sight-of-itself/index.html',
  'n-1/material/ct-logs/2026-09-24-closing-asking/crt-sh.frankbueltge.de.full.json',
  'attention/index.html',
  'attention/ledger.html',
  'arch/index.html',
  'arch/works/arrival/iteration-15/us6000tmta.html',
  'encounters/index.html',
  'ecology/index.html',
]

describe('no redirect takes a published file off the site', () => {
  it.each(KEPT)('%s', (path) => {
    for (const address of servedAt(path)) expect(go(address), address).toBeNull()
  })
})

// ── the links that name a newest piece ────────────────────────────────────────────────────────

describe('a link to a piece points where the piece is read', () => {
  const mirrored = (...paths: string[]) => ({ isMirrored: (p: string) => paths.includes(p) })

  it('links a session’s window or artifact in the practice’s repository', () => {
    expect(publishedHref('/atelier/window/cycle-008-session-5/', mirrored('atelier/window/cycle-008-session-5/index.html'))).toBe(
      `${GH}/ulysses/tree/main/window/cycle-008-session-5`,
    )
    expect(publishedHref('/field/artifacts/2026-10-16-the-end-sent-apart/', mirrored('field/artifacts/2026-10-16-the-end-sent-apart/index.html'))).toBe(
      `${GH}/field-research/tree/main/artifacts/2026-10-16-the-end-sent-apart`,
    )
  })

  it('keeps the address of a work, a presentation and a page the site renders', () => {
    expect(publishedHref('/studio/werke-html/2026-10-16-filed-under/', mirrored('studio/werke-html/2026-10-16-filed-under/index.html'))).toBe(
      '/studio/werke-html/2026-10-16-filed-under/',
    )
    expect(publishedHref('/atelier/presentations/cycle-008/', mirrored('atelier/presentations/cycle-008/index.html'))).toBe('/atelier/presentations/cycle-008/')
    expect(publishedHref('/field/werke/2026-07-01-calibration-gap/', mirrored())).toBe('/field/werke/2026-07-01-calibration-gap/')
    expect(publishedHref('/encounters', mirrored())).toBe('/encounters')
    expect(publishedHref('https://example.org/', mirrored())).toBe('https://example.org/')
  })

  it('links an n-1 study in n-1’s repository and keeps a declared work here', () => {
    const ctx = { ...mirrored('n-1/projects/light-characters/index.html', 'n-1/projects/usgs-fixed-depth/index.html'), n1Pages: new Set(['n-1/projects/usgs-fixed-depth/index.html']) }
    expect(publishedHref('/n-1/projects/light-characters/', ctx)).toBe(`${GH}/n-1/tree/main/projects/light-characters`)
    expect(publishedHref('/n-1/projects/usgs-fixed-depth/', ctx)).toBe('/n-1/projects/usgs-fixed-depth/')
  })

  it('maps a mirrored path to its place in the repository', () => {
    expect(repoPlaceOf('studio/werke-html/2026-10-16-filed-under')).toEqual({ practice: 'studio', path: 'works/2026-10-16-filed-under' })
    expect(repoPlaceOf('error-as-method/works-html/x/index.html')).toEqual({ practice: 'error-as-method', path: 'works/x/index.html' })
    expect(repoPlaceOf('error-as-method/x/figure.svg')).toEqual({ practice: 'error-as-method', path: 'works/x/figure.svg' })
    expect(repoPlaceOf('attention/index.html')).toBeNull()
    expect(repoPlaceOf('protocol/index.html')).toBeNull()
  })

  it('links a journal session at its own file in the practice’s repository', () => {
    expect(sessionHref({ practice: 'field', source: 'src/content/field/journal/2026-07-01.md' })).toBe(`${GH}/field-research/blob/main/journal/2026-07-01.md`)
    expect(sessionHref({ practice: 'atelier', source: 'src/content/atelier/journal/2026-06-30-sitzung-9.md' })).toBe(`${GH}/ulysses/blob/main/journal/2026-06-30-sitzung-9.md`)
  })
})

describe('the rule’s own shape', () => {
  it('names a repository for every mirror it prunes, and keeps the attention archive whole', () => {
    for (const [practice, mirror] of Object.entries(MIRRORS)) {
      if (practice === 'attention') {
        expect(mirror.keep).toEqual(['attention/**'])
        continue
      }
      expect(mirror.repo, practice).not.toBeNull()
    }
  })
})

// ── the mirror trim ───────────────────────────────────────────────────────────────────────────
//
// The integrates used to copy a practice's whole repository into public/ and commit it, and the
// build pruned dist/ afterwards: the site published little, and the repository grew by several
// hundred files a day that no page, count or score read (2026-10-17). The trim applies the same
// decision to the copy before it is committed, and keeps beside it what the build reads.

/** The inputs the brief of 2026-10-17 names as the ones that must keep arriving, and the readers
 *  found by tracing every file the build and the tests open. Journals, the BULLETIN, PROTOCOL and
 *  REQUESTS mirrors, the Studio's chronicle and the attention export live under src/ and never
 *  pass through the trim at all; what is listed here is what lives in public/. */
const KEEPS_ARRIVING = [
  // presentations: the summary every cycle's card reads, and the Field's paper
  'atelier/presentations/cycle-008/SUMMARY.md',
  'field/presentations/cycle-008/SUMMARY.md',
  'studio/presentations/cycle-008/SUMMARY.md',
  'field/presentations/cycle-006/paper.md',
  // the register's titles: an artifact's and a window session's page
  'field/artifacts/2026-10-16-the-clock-and-the-record/index.html',
  'field/artifacts/cycle-003/2026-09-08-a-name/index.html',
  'atelier/window/cycle-008-session-5/index.html',
  // the long work
  'studio/werke-html/2026-10-16-filed-under/SCORE.md',
  // n-1: the dowry, the window file, the nights the gallery draws, the pages the shelf walks
  'n-1/DOWRY.md',
  'n-1/window.json',
  'n-1/nights/67-forty-first-night.md',
  'n-1/projects/unicode-admission/asking.html',
  'n-1/projects/met-date-intervals/dialects/WORK.md',
  'n-1/works/two-nights-deep/FORM.md',
  'n-1/atlas/layers/2026-10-16.json',
  // Arch: the facts the room is built from
  'arch/BALANCE.md',
  'arch/DOWRY.md',
  'arch/record/r1.md',
  'arch/registers/i7-virtuality-register.md',
  'arch/reading/00-method.md',
  'arch/works/arrival/README.md',
  // the retired archive, whole
  'attention/future/gdacs-eq-1.html',
]

describe('what the build reads stays in the mirror', () => {
  it.each(KEEPS_ARRIVING)('%s', (path) => {
    expect(isPublished(path) || isReadByBuild(path), path).toBe(true)
  })

  it('is working material nobody opens, nor reads, that goes', () => {
    for (const path of [
      'field/artifacts/2026-10-16-x/data/series.tsv',
      'field/artifacts/2026-10-16-x/analyse.py',
      'field/artifacts/2026-10-16-x/README.md',
      'atelier/window/cycle-008-session-5/data.json',
      'atelier/window/cycle-008-session-5/model.js',
      'studio/werke-html/2026-10-16-filed-under/build.py',
      'error-as-method/works-html/2026-10-16-x/reports/r1.md',
      'error-as-method/works-html/2026-10-16-x/makers/m01/scratch/a.txt',
      'n-1/REGISTER.md',
      'n-1/REQUESTS.md',
      'n-1/material/m/x.json',
      'n-1/reading/00-protocol.md',
      'n-1/projects/minor-planet-names/names.json',
      'n-1/projects/will-write/notes.md',
    ]) {
      expect(isPublished(path) || isReadByBuild(path), path).toBe(false)
    }
  })

  it('names no entry that the publication rule itself would already publish, so the list stays the exception', () => {
    // A glob that only repeats the rule hides which files are an exception to it.
    for (const glob of BUILD_READS) {
      // a glob that opens with `*/` stands for any practice's folder
      const samples = (glob.startsWith('*/') ? ['atelier', 'field', 'studio'].map((p) => `${p}/${glob.slice(2)}`) : [glob]).map((g) =>
        g.replace(/\*\*/g, 'x/y').replace(/\*/g, 'x'),
      )
      for (const sample of samples) expect(isPublished(sample), `${glob} (${sample}) is published anyway`).toBe(false)
    }
  })
})

describe('the mirror trim, on a public/ in miniature', () => {
  const base = mkdtempSync(join(tmpdir(), 'trim-'))
  afterAll(() => rmSync(base, { recursive: true, force: true }))
  const put = (root: string, path: string, text = 'x') => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  const FILES: Record<string, string> = {
    'field/artifacts/a1/index.html': '<title>an artifact</title>',
    'field/artifacts/a1/data/series.tsv': 'a\tb',
    'field/artifacts/a1/analyse.py': 'print()',
    'field/artifacts/cycle-003/a2/index.html': '<title>a nested one</title>',
    'field/artifacts/cycle-003/a2/figure.png': 'png',
    'field/presentations/cycle-001/index.html': '<p>presentation</p>',
    'field/presentations/cycle-001/SUMMARY.md': 'a summary',
    'field/presentations/cycle-001/paper.md': 'the paper',
    'atelier/window/index.html': '<p>closing report</p>',
    'atelier/window/cycle-001-session-1/index.html': '<title>a session</title>',
    'atelier/window/cycle-001-session-1/model.js': 'x',
    'atelier/window/cycle-001-session-1/data.json': '{}',
    'studio/werke-html/s1/index.html': '<p>a work</p>',
    'studio/werke-html/s1/build.py': 'print()',
    'studio/werke-html/s2/index.html': '<p>the long work</p>',
    'studio/werke-html/s2/SCORE.md': 'the score',
    'studio/werke-html/s2/build.py': 'print()',
    'error-as-method/works-html/f1/index.html': "<script>fetch('reports/summary.json')</script>",
    'error-as-method/works-html/f1/reports/summary.json': '{}',
    'error-as-method/works-html/f1/reports/r1.md': 'a report',
    'error-as-method/works-html/f1/briefs/b1.md': 'a brief',
    'error-as-method/2026-10-16-x/figure.svg': '<svg/>',
    'n-1/index.html': '<script src="surface/surface.js"></script>',
    'n-1/surface/surface.js': "fetch('atlas/layers/index.json')",
    'n-1/atlas/layers/index.json': '[]',
    'n-1/DOWRY.md': 'dowry',
    'n-1/window.json': '{}',
    'n-1/REGISTER.md': 'the register',
    'n-1/nights/01-first-night.md': '# Night 1',
    'n-1/projects/p1/index.html': "<script>fetch('data.json')</script>",
    'n-1/projects/p1/data.json': '{}',
    'n-1/projects/p2/index.html': '<p>a study</p>',
    'n-1/projects/p2/data.json': '{}',
    'n-1/projects/p2/WORK.md': 'dated',
    'n-1/material/m/x.json': '{}',
    'attention/index.html': '<p>archive</p>',
  }
  const stage = (name: string) => {
    const root = join(base, name)
    for (const [path, text] of Object.entries(FILES)) put(join(root, 'public'), path, text)
    put(root, 'src/content/studio/works/s2/meta.json', JSON.stringify({ status: 'in progress: increment 1 of 3' }))
    return { root, pub: join(root, 'public') }
  }
  const listing = (dir: string, prefix = ''): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? listing(join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`],
    )
  const trim = (root: string, pub: string, only?: string[], dryRun = false) =>
    prunePublication({
      dist: pub,
      publicDir: pub,
      root,
      readWorks: () => new Set(['n-1/projects/p1/index.html']),
      only,
      keep: isReadByBuild,
      redirects: false,
      dryRun,
    })

  const { root, pub } = stage('all')
  const before = listing(pub)
  const result = trim(root, pub)
  const after = listing(pub)
  const gone = new Set(result.removed)

  it('removes working material nothing reads, and nothing else', () => {
    expect([...gone].sort()).toEqual([
      'error-as-method/works-html/f1/briefs/b1.md',
      'error-as-method/works-html/f1/reports/r1.md',
      'field/artifacts/a1/analyse.py',
      'field/artifacts/a1/data/series.tsv',
      'field/artifacts/cycle-003/a2/figure.png',
      'atelier/window/cycle-001-session-1/data.json',
      'atelier/window/cycle-001-session-1/model.js',
      'n-1/REGISTER.md',
      'n-1/material/m/x.json',
      'n-1/projects/p2/data.json',
      'studio/werke-html/s1/build.py',
    ].sort())
    expect(result.removedBytes).toBeGreaterThan(0)
    expect(after.length).toBe(before.length - gone.size)
  })

  it('keeps what is published, what a published page names and what the build reads', () => {
    for (const path of [
      'field/presentations/cycle-001/SUMMARY.md',
      'field/presentations/cycle-001/paper.md',
      'field/artifacts/a1/index.html',
      'field/artifacts/cycle-003/a2/index.html',
      'atelier/window/index.html',
      'atelier/window/cycle-001-session-1/index.html',
      'studio/werke-html/s2/SCORE.md',
      'studio/werke-html/s2/build.py', // the long work is in progress: it stays exactly as mirrored
      'error-as-method/works-html/f1/reports/summary.json', // the face fetches it
      'n-1/DOWRY.md',
      'n-1/window.json',
      'n-1/nights/01-first-night.md',
      'n-1/projects/p1/data.json', // a work the practice declared loads it
      'n-1/projects/p2/WORK.md',
      'attention/index.html',
    ]) {
      expect(existsSync(join(pub, path)), path).toBe(true)
    }
  })

  it('leaves no empty directory behind', () => {
    for (const dir of ['field/artifacts/a1/data', 'error-as-method/works-html/f1/briefs', 'n-1/material']) {
      expect(existsSync(join(pub, dir)), dir).toBe(false)
    }
  })

  it('is idempotent: a second pass over a trimmed mirror removes nothing', () => {
    expect(trim(root, pub).removed).toEqual([])
  })

  it('touches only the practice it is given', () => {
    const one = stage('one')
    const r = trim(one.root, one.pub, ['field'])
    expect(r.removed.every((p) => p.startsWith('field/'))).toBe(true)
    expect(existsSync(join(one.pub, 'n-1/REGISTER.md'))).toBe(true)
    expect(existsSync(join(one.pub, 'field/artifacts/a1/analyse.py'))).toBe(false)
  })

  it('decides without deleting on a dry run', () => {
    const dry = stage('dry')
    const r = trim(dry.root, dry.pub, undefined, true)
    expect(r.removed.length).toBe(gone.size)
    expect(listing(dry.pub).length).toBe(before.length)
  })

  it('never changes what the build publishes: the prune of a trimmed mirror leaves the same dist', () => {
    // The whole point of the trim being the prune's own decision. Build a dist from the untrimmed
    // copy and one from the trimmed copy, prune both the way the build does, and compare them.
    const distOf = (name: string, source: string, rootDir: string) => {
      const dist = join(base, name)
      cpSync(source, dist, { recursive: true })
      put(dist, 'index.html', '<p>a page</p>')
      prunePublication({ dist, publicDir: source, root: rootDir, readWorks: () => new Set(['n-1/projects/p1/index.html']) })
      return listing(dist).sort()
    }
    const untrimmed = stage('untrimmed')
    const trimmedRoot = stage('trimmed')
    trim(trimmedRoot.root, trimmedRoot.pub)
    expect(distOf('dist-from-trimmed', trimmedRoot.pub, trimmedRoot.root)).toEqual(distOf('dist-from-untrimmed', untrimmed.pub, untrimmed.root))
  })
})

describe('the open cycle, published in progress (2026-10-20)', () => {
  it('reads the cycle only while it is in its working phase', () => {
    expect(openCycleOf({ cycle: 9, phase: 'working' })).toBe(9)
    expect(openCycleOf({ cycle: 9, phase: 'convening' })).toBeNull()
    expect(openCycleOf(null)).toBeNull()
    expect(openCycleOf({ cycle: '9', phase: 'working' })).toBeNull()
  })

  it('publishes the open cycle’s artifact folders whole, and the closed ones not at all', () => {
    const ctx = { openCycle: 9 }
    expect(classify('atelier/artifacts/cycle-009/the-wolfs-ledger/plate3.json', ctx)).toMatchObject({ published: true, reason: 'in progress' })
    expect(classify('field/artifacts/cycle-009/after-the-empty-warnings/data/results32.json', ctx).published).toBe(true)
    expect(classify('field/artifacts/cycle-008/some-study/index.html', ctx).published).toBe(false)
    expect(classify('field/artifacts/cycle-009/after-the-empty-warnings/index.html').published).toBe(false)
  })

  it('links an open-cycle piece on the site, and a closed one in the repository', () => {
    const ctx = { openCycle: 9, isMirrored: () => true }
    expect(publishedHref('/field/artifacts/cycle-009/after-the-empty-warnings/', ctx)).toBe('/field/artifacts/cycle-009/after-the-empty-warnings/')
    expect(publishedHref('/field/artifacts/cycle-008/x/', ctx)).toMatch(/^https:\/\/github\.com\/frankbueltge\/field-research\//)
  })

  it('keeps the open cycle on the site past the Field’s artifact redirect, and nothing else', () => {
    const text = readFileSync('public/_redirects', 'utf8')
    const rules = parseRedirects(withOpenCycleRewrites(text, 9))
    const open = matchRedirect(rules, '/field/artifacts/cycle-009/after-the-empty-warnings/')
    expect(open?.rule.status).toBe(200)
    expect(open?.location).toBe('/field/artifacts/cycle-009/after-the-empty-warnings/')
    expect(matchRedirect(rules, '/field/artifacts/cycle-008/x/')?.location).toMatch(/^https:\/\/github\.com\//)
    expect(withOpenCycleRewrites(text, null)).toBe(text)
    // the inserted rules stay inside the dynamic budget
    const budget = redirectBudget(rules)
    expect(budget.dynamic).toBeLessThanOrEqual(budget.maxDynamic)
    expect(budget.static).toBe(redirectBudget(parseRedirects(text)).static)
  })
})
