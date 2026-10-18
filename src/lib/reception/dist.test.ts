import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BAND_CLASS, WIDGET_SRC, astroWorks, barePages, injectReception, receptionBand, receptionDist, stripReception, titleOf } from './dist'
import { frameStandaloneWork, FRAME_MARKER } from '../engines/work-frame'
import { PRACTICE_POLICY } from '../engines/practice-policy'

const work = { id: 'studio:foo', title: 'Foo & "Bar"', kind: 'work' as const }

function tree(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'reception-dist-'))
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true })
    writeFileSync(join(dir, rel), text)
  }
  return dir
}

const page = (title: string, body = '<p>work</p>') => `<!doctype html><html><head><title>${title}</title></head><body>${body}</body></html>`

describe('the reception band', () => {
  it('stands below the work and above the frame’s way out, and is the same after a second run', () => {
    const framed = frameStandaloneWork(page('Foo'), 'studio', 'A wall text.')
    const once = injectReception(framed, work)
    expect(injectReception(once, work)).toBe(once)
    expect(stripReception(once)).toBe(framed)
    expect(once.indexOf(`<section class="${BAND_CLASS}"`)).toBeLessThan(once.indexOf(`<footer class="${FRAME_MARKER} ${FRAME_MARKER}--foot"`))
    expect(once.indexOf('<p>work</p>')).toBeLessThan(once.indexOf(`<section class="${BAND_CLASS}"`))
  })

  it('goes before </body> on a page without a frame', () => {
    const out = injectReception(page('P'), work)
    expect(out.indexOf(`<section class="${BAND_CLASS}"`)).toBeLessThan(out.indexOf('</body>'))
  })

  it('escapes the title and works without scripts', () => {
    const band = receptionBand(work)
    expect(band).toContain('data-reception-title="Foo &amp; &quot;Bar&quot;"')
    expect(band).toContain('href="/reception/rate?work=studio%3Afoo"')
    expect(band).toContain(`<script data-reception-band src="${WIDGET_SRC}" defer></script>`)
    // under the practices' policy: one same-origin script, no inline script, no inline style attribute
    expect(band).not.toMatch(/<script(?![^>]*\bsrc=)/)
    expect(band).not.toMatch(/\sstyle=/)
    expect(PRACTICE_POLICY).toContain("script-src 'self'")
    expect(PRACTICE_POLICY).toContain("connect-src 'self'")
    expect(PRACTICE_POLICY).toContain('frame-src https:')
  })

  it('reads a page’s title', () => {
    expect(titleOf('<title> The Foreknown &mdash; x &amp; y </title>')).toBe('The Foreknown &mdash; x & y')
    expect(titleOf('<p>none</p>')).toBeNull()
  })
})

describe('the built site', () => {
  const root = tree({
    'src/content/studio/works/foo/meta.json': JSON.stringify({ title: 'Foo' }),
    'src/data/nightly/works/bar/meta.json': JSON.stringify({ title: 'Bar' }),
    'src/data/nightly/works/bar/work.md': 'text',
    'src/data/nightly/works/stage-only/meta.json': JSON.stringify({ title: 'Stage Only' }),
  })
  const dist = tree({
    'studio/werke-html/foo/index.html': frameStandaloneWork(page('Foo page'), 'studio', null),
    'studio/werke-html/foo/sub/index.html': page('A page inside the work'),
    'studio/presentations/cycle-008/index.html': page('Filed Under'),
    'studio/presentations/notes/index.html': page('Not a cycle'),
    'field/closing-report/index.html': page('The Field — Closing Report'),
    'attention/index.html': page('The Foreknown'),
    'error-as-method/works-html/bar/index.html': page('Bar face'),
    'error-as-method/bar/index.html': page('Bar text', '<section class="rcp-host" data-reception-work="error-as-method:bar" data-reception-title="Bar" data-reception-kind="work" data-reception-page="astro"></section>'),
    'error-as-method/stage-only/index.html': page('Stage'),
    'consensus/index.html': page('Consensus', '<section data-reception-work="lab:consensus" data-reception-title="Consensus &amp; co" data-reception-kind="experiment" data-reception-page="astro"></section>'),
    'about/index.html': page('About'),
    'arch/works/arrival/index.html': page('Arrival'),
  })

  it('finds the bare works, presentations, reports and archives, and only those', () => {
    const found = barePages(dist, root).map((p) => `${p.work.id} ${p.work.kind} ${p.work.title} ${p.work.href}`)
    expect(found).toEqual([
      'field:closing-report report The Field — Closing Report /field/closing-report/',
      'studio:foo work Foo /studio/werke-html/foo/',
      'studio:cycle-008 presentation Filed Under /studio/presentations/cycle-008/',
      'attention:the-foreknown archive The Foreknown /attention/',
      'error-as-method:bar work Bar /error-as-method/works-html/bar/',
      'error-as-method:stage-only work Stage Only /error-as-method/stage-only/',
    ])
  })

  it('reads the works Astro rendered back from their blocks', () => {
    expect(astroWorks(dist).map((w) => `${w.id} ${w.title} ${w.href}`).sort()).toEqual(['error-as-method:bar Bar /error-as-method/bar/', 'lab:consensus Consensus & co /consensus/'])
  })

  it('bands every bare work and lists every ratable work once, the rendered page first', () => {
    const report = receptionDist(dist, root)
    expect(report).toMatchObject({ banded: 6, astro: 2, works: 7, failed: [] })
    const list = JSON.parse(readFileSync(join(dist, 'reception/works.json'), 'utf8'))
    expect(list.schema).toBe(1)
    expect(list.works.map((w: { id: string }) => w.id)).toEqual([
      'attention:the-foreknown',
      'error-as-method:bar',
      'error-as-method:stage-only',
      'field:closing-report',
      'lab:consensus',
      'studio:cycle-008',
      'studio:foo',
    ])
    expect(list.works.find((w: { id: string }) => w.id === 'error-as-method:bar').href).toBe('/error-as-method/bar/')
    expect(readFileSync(join(dist, 'studio/werke-html/foo/index.html'), 'utf8')).toContain('data-reception-work="studio:foo"')
    expect(readFileSync(join(dist, 'studio/werke-html/foo/sub/index.html'), 'utf8')).not.toContain(BAND_CLASS)
    expect(readFileSync(join(dist, 'arch/works/arrival/index.html'), 'utf8')).not.toContain(BAND_CLASS)
    expect(readFileSync(join(dist, 'about/index.html'), 'utf8')).not.toContain(BAND_CLASS)
    // a second build step over the same tree changes nothing
    const before = readFileSync(join(dist, 'attention/index.html'), 'utf8')
    receptionDist(dist, root)
    expect(readFileSync(join(dist, 'attention/index.html'), 'utf8')).toBe(before)
  })
})

describe('the build', () => {
  it('ends with the reception step, after the wall texts are framed anew', () => {
    // The band stands outside the frame, so the frame's rewrite must come first; and every build —
    // the integrate gates, CI and the deploy — writes the list the endpoints accept.
    const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('../../../package.json', import.meta.url)), 'utf8'))
    expect(pkg.scripts.build).toBe('astro build && tsx scripts/engines/frame-dist.ts && tsx scripts/reception/dist.ts')
  })
})
