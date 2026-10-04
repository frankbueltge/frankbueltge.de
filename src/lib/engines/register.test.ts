import { readdirSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadArtifacts, type ArtifactEntry } from '@/lib/ecology/v3'
import { collectWorks, hrefFor, type LatestWork } from './latest'
import {
  NIGHTLY_FORK_DIR,
  WORK_SOURCES,
  allWorks,
  artifactSource,
  buildRegister,
  forkedNightlyWorks,
  isListedArtifact,
  registerCount,
  summarise,
  summariseRegister,
} from './register'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))

/** The register's only claim is completeness, so the tripwire is a second, independent count:
 *  read the work directories off the disk and compare with what the globs delivered. A source
 *  that silently stops matching (a renamed directory, a moved namespace) would otherwise leave
 *  a page that still looks full. */
describe('allWorks covers every committed work source', () => {
  const works = allWorks()

  it('finds as many works as there are meta.json files on disk', () => {
    const onDisk = WORK_SOURCES.flatMap(({ ns, kind, dir }) => {
      const abs = `${ROOT}${dir}`
      if (!existsSync(abs)) return []
      return readdirSync(abs)
        .filter((slug) => existsSync(`${abs}/${slug}/meta.json`))
        .map((slug) => `${ns}/${kind}/${slug}`)
    })
    expect(onDisk.length).toBeGreaterThan(0)
    expect(works.map((w) => `${w.ns}/${w.kind}/${w.slug}`).sort()).toEqual(onDisk.sort())
  })

  it('carries all three practices', () => {
    expect(new Set(works.map((w) => w.ns))).toEqual(new Set(['atelier', 'field', 'studio']))
  })

  it('gives every entry a date, a title and a link', () => {
    for (const w of works) {
      expect(w.date, `${w.ns}/${w.slug} date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(w.title.length, `${w.ns}/${w.slug} title`).toBeGreaterThan(0)
      // A work's link is the one its own source declares. Four of the five sources declare
      // nothing and get the derived address; the fifth — the forked nightly line, whose works
      // live at an address of their own — declares a stage, and is named rather than excused.
      const expected =
        w.dir === NIGHTLY_FORK_DIR ? `/error-as-method/${w.slug}/` : hrefFor(w.ns, w.kind, w.slug, 'stage')
      expect(w.href, `${w.ns}/${w.slug} href`).toBe(expected)
    }
  })

  it('links html works to their own stage, not to the practice front page', () => {
    const html = works.filter((w) => w.kind === 'html' && w.dir !== NIGHTLY_FORK_DIR)
    expect(html.length).toBeGreaterThan(0)
    for (const w of html) {
      expect(w.href).toBe(`/${w.ns}/werke-html/${w.slug}/`)
      // the stage is a static file in public/ — a link that is not built is a link that 404s
      expect(existsSync(`${ROOT}public/${w.ns}/werke-html/${w.slug}/index.html`), w.slug).toBe(true)
    }
  })

  it('links the forked line\'s works to their own mirrored page, which has a text to render', () => {
    // The same obligation as the stage check above, for the source that cannot satisfy it the
    // same way: there is no public/ stage here, there is a mirrored work.md and a route that
    // renders it. A link with nothing behind it is a 404 either way.
    const forked = works.filter((w) => w.dir === NIGHTLY_FORK_DIR)
    for (const w of forked) {
      expect(w.href).toBe(`/error-as-method/${w.slug}/`)
      const text = existsSync(`${ROOT}${NIGHTLY_FORK_DIR}/${w.slug}/work.md`)
      const stage = existsSync(`${ROOT}public/error-as-method/${w.slug}/index.html`)
      expect(text || stage, `${w.slug} has neither a mirrored text nor a stage`).toBe(true)
      expect(existsSync(`${ROOT}src/pages/error-as-method/[slug].astro`)).toBe(true)
    }
  })

  it('links astro works to their own page, which exists as a route', () => {
    const astro = works.filter((w) => w.kind === 'astro')
    expect(astro.length).toBeGreaterThan(0)
    for (const w of astro) {
      expect(w.href).toBe(`/${w.ns}/werke/${w.slug}`)
      expect(existsSync(`${ROOT}src/pages/${w.ns}/werke/${w.slug}.astro`), w.slug).toBe(true)
    }
  })

  it('lists the withdrawn work instead of hiding it, and quotes its own marker', () => {
    const withdrawn = works.filter((w) => w.state === 'withdrawn')
    expect(withdrawn.length).toBeGreaterThan(0)
    for (const w of withdrawn) {
      expect(w.withdrawnNote?.startsWith('WITHDRAWN'), w.slug).toBe(true)
      expect(w.withdrawnOn, w.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('orders newest first and stays stable across calls', () => {
    const dates = works.map((w) => w.date)
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates)
    expect(allWorks().map((w) => w.slug)).toEqual(works.map((w) => w.slug))
  })
})

describe('summarise', () => {
  it('counts the practices, the kinds and the withdrawals it was given', () => {
    const s = summarise([
      { ns: 'field', kind: 'astro', slug: 'a', title: 'A', date: '2026-07-02', href: '/x', state: 'published' },
      { ns: 'atelier', kind: 'html', slug: 'b', title: 'B', date: '2026-07-01', href: '/y', state: 'published' },
      { ns: 'studio', kind: 'html', slug: 'c', title: 'C', date: '2026-07-03', href: '/z', state: 'withdrawn' },
    ])
    expect(s).toMatchObject({
      total: 3,
      withdrawn: 1,
      byNs: { field: 1, atelier: 1, studio: 1 },
      byKind: { astro: 1, html: 2 },
      first: '2026-07-01',
      last: '2026-07-03',
    })
  })

  it('agrees with the register it describes', () => {
    const works = allWorks()
    const s = summarise(works)
    expect(s.byNs.atelier + s.byNs.field + s.byNs.studio).toBe(s.total)
    expect(s.byKind.astro + s.byKind.html).toBe(s.total)
    expect(s.total).toBe(works.length)
  })
})

/** The register and the entrance read the same works, so they must agree about them: the
 *  register's first rows ARE the strip, apart from the link an html work gets. */
describe('the register and the hub LATEST strip agree', () => {
  it('starts with the same works the entrance shows newest-first', () => {
    const registerTop = allWorks().slice(0, 8).map((w) => `${w.ns}/${w.slug}`)
    const stripTop = collectWorks(WORK_SOURCES).slice(0, 8).map((w) => `${w.ns}/${w.slug}`)
    expect(registerTop).toEqual(stripTop)
  })
})

// ---------------------------------------------------------------------------------------------
// The register as /ecology prints it (2026-10-04): works AND session artifacts. Until this day
// the page read allWorks() alone, and since research ecology v3 two of the three practices land
// one artifact per session outside any meta.json — the register showed the Studio's September
// and the Field's and the Atelier's August.

const work = (over: Partial<LatestWork> & Pick<LatestWork, 'ns' | 'slug' | 'date'>): LatestWork => ({
  kind: 'html',
  title: over.slug,
  href: `/${over.ns}/werke-html/${over.date}-${over.slug}/`,
  state: 'published',
  ...over,
})

const artifact = (over: Partial<ArtifactEntry> & Pick<ArtifactEntry, 'practice' | 'slug' | 'href'>): ArtifactEntry => ({
  date: null,
  cycle: null,
  fromWorksRegister: false,
  ...over,
})

describe('buildRegister, against fixtures', () => {
  const works = [
    work({ ns: 'studio', slug: 'come-in', date: '2026-08-31' }),
    work({ ns: 'atelier', slug: 'a-night', date: '2026-09-28', dir: NIGHTLY_FORK_DIR, href: '/error-as-method/a-night/' }),
    work({ ns: 'field', kind: 'astro', slug: 'an-instrument', date: '2026-08-05', href: '/field/werke/an-instrument' }),
  ]
  const artifacts = [
    artifact({ practice: 'field', slug: 'the-label-and-the-species', date: '2026-10-04', href: '/field/artifacts/2026-10-04-the-label-and-the-species/' }),
    artifact({ practice: 'atelier', slug: 'cycle-004-session-1', date: '2026-10-03', cycle: 4, title: 'Who still answers', href: '/atelier/window/cycle-004-session-1/' }),
    artifact({ practice: 'field', slug: 'yield-of-a-loop', date: '2026-08-31', cycle: 1, title: 'Yield of a loop', href: '/field/artifacts/cycle-001/2026-08-31-yield-of-a-loop/' }),
    // the Studio's artifact IS its work — the register already lists it
    artifact({ practice: 'studio', slug: 'come-in', date: '2026-08-31', title: 'COME IN', href: '/studio/werke-html/2026-08-31-come-in/', fromWorksRegister: true }),
    // a window no record dates
    artifact({ practice: 'atelier', slug: 'cycle-004-session-9', cycle: 4, title: 'Nobody dated this', href: '/atelier/window/cycle-004-session-9/' }),
  ]
  const { rows, undated } = buildRegister({ works, artifacts })

  it('lists every work and every dated artifact the works register does not already carry', () => {
    expect(rows.map((r) => `${r.kind}:${r.house}:${r.slug}`)).toEqual([
      'artifact:field:the-label-and-the-species',
      'artifact:atelier:cycle-004-session-1',
      'work:nightly-line:a-night',
      // one day, two houses: the doors' order (atelier, field, studio) decides, not the kind
      'artifact:field:yield-of-a-loop',
      'work:studio:come-in',
      'work:field:an-instrument',
    ])
  })

  it('puts a house’s work before its artifact of the same day', () => {
    const sameDay = buildRegister({
      works: [work({ ns: 'field', kind: 'astro', slug: 'w', date: '2026-09-01', href: '/field/werke/w' })],
      artifacts: [artifact({ practice: 'field', slug: 'a', date: '2026-09-01', href: '/field/artifacts/2026-09-01-a/' })],
    })
    expect(sameDay.rows.map((r) => r.kind)).toEqual(['work', 'artifact'])
  })

  it('names the undated artifact instead of dating it or dropping it silently', () => {
    expect(undated.map((a) => a.slug)).toEqual(['cycle-004-session-9'])
    expect(rows.some((r) => r.slug === 'cycle-004-session-9')).toBe(false)
  })

  it('titles an artifact by its own page, and by its slug read as words where it has none', () => {
    expect(rows.find((r) => r.slug === 'cycle-004-session-1')?.title).toBe('Who still answers')
    expect(rows.find((r) => r.slug === 'the-label-and-the-species')?.title).toBe('the label and the species')
  })

  it('files the nightly line’s works under the line, in the Atelier’s colour, never under the Atelier', () => {
    const night = rows.find((r) => r.slug === 'a-night')!
    expect(night).toMatchObject({ kind: 'work', house: 'nightly-line', ns: 'atelier' })
    const s = summariseRegister(rows)
    expect(s.byHouse['nightly-line']).toEqual({ works: 1, artifacts: 0 })
    expect(s.byHouse.atelier).toEqual({ works: 0, artifacts: 1 })
  })

  it('counts per house and per kind, so an artifact is never counted as a work', () => {
    expect(summariseRegister(rows)).toMatchObject({
      total: 6,
      works: 3,
      artifacts: 3,
      withdrawn: 0,
      byHouse: {
        atelier: { works: 0, artifacts: 1 },
        field: { works: 1, artifacts: 2 },
        studio: { works: 1, artifacts: 0 },
        'nightly-line': { works: 1, artifacts: 0 },
      },
      first: '2026-08-05',
      last: '2026-10-04',
    })
  })

  it('does not list an artifact twice even when its own flag forgets it is a work', () => {
    const twice = artifact({ practice: 'studio', slug: 'come-in', date: '2026-08-31', href: '/studio/werke-html/2026-08-31-come-in/' })
    const again = buildRegister({ works, artifacts: [twice] })
    expect(again.rows.filter((r) => r.href === twice.href)).toHaveLength(1)
    expect(again.rows.find((r) => r.href === twice.href)?.kind).toBe('work')
  })

  it('names the committed layout each artifact row was read from', () => {
    expect(artifactSource({ href: '/field/artifacts/cycle-003/2026-09-12-what-a-description-is-for/' })).toBe(
      'public/field/artifacts/cycle-NNN/<date>-<slug>/',
    )
    expect(artifactSource({ href: '/field/artifacts/2026-10-04-the-label-and-the-species/' })).toBe(
      'public/field/artifacts/<date>-<slug>/',
    )
    expect(artifactSource({ href: '/atelier/window/cycle-004-session-1/' })).toBe('public/atelier/window/cycle-NNN[-session-n]/')
    // the cycle's own window, with no session in its name, comes from the same place
    expect(artifactSource({ href: '/atelier/window/cycle-001/' })).toBe('public/atelier/window/cycle-NNN[-session-n]/')
  })
})

describe('the register on /ecology, against the committed record', () => {
  const { rows } = buildRegister()
  const listed = loadArtifacts().filter(isListedArtifact)

  // (a) Since 2026-08-30 the Field and the Atelier leave artifacts, not works; the committed
  // mirror holds them, so the register must too — and its newest row per practice must be the
  // practice's newest dated output, not a work of August.
  it('carries the Field’s and the Atelier’s artifacts of the shared question, newest included', () => {
    for (const practice of ['field', 'atelier'] as const) {
      const shipped = listed.filter((a) => a.practice === practice && a.date! > '2026-08-30')
      expect(shipped.length, `${practice}: the mirror holds no v3 artifact`).toBeGreaterThan(0)
      const inRegister = new Set(rows.filter((r) => r.kind === 'artifact' && r.house === practice).map((r) => r.href))
      for (const a of shipped) expect(inRegister, `${a.href} is missing from the register`).toContain(a.href)
      const newest = [...shipped].sort((x, y) => y.date!.localeCompare(x.date!))[0]!
      expect(rows.find((r) => r.house === practice)!.date >= newest.date!).toBe(true)
    }
  })

  it('lists every work and every listed artifact, and nothing else', () => {
    expect(rows.filter((r) => r.kind === 'work')).toHaveLength(allWorks().length)
    expect(rows.filter((r) => r.kind === 'artifact')).toHaveLength(listed.length)
  })

  // (b)
  it('lists nothing twice — one row per address', () => {
    const hrefs = rows.map((r) => r.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('is dated on every row and newest first', () => {
    const dates = rows.map((r) => r.date)
    for (const d of dates) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates)
  })

  // (c)
  it('never counts the nightly line’s works as the Atelier’s', () => {
    const forked = forkedNightlyWorks()
    expect(forked.length, 'the fork mirror is empty — this test would prove nothing').toBeGreaterThan(0)
    const forkedHrefs = new Set(forked.map((w) => w.href))
    for (const r of rows) {
      if (r.kind === 'work' && forkedHrefs.has(r.href)) expect(r.house, r.href).toBe('nightly-line')
      if (r.house === 'atelier' && r.kind === 'work') expect(r.work.dir, r.href).not.toBe(NIGHTLY_FORK_DIR)
    }
    const s = summariseRegister(rows)
    expect(s.byHouse['nightly-line'].works).toBe(forked.length)
    expect(s.byHouse.atelier.works).toBe(allWorks().filter((w) => w.ns === 'atelier' && w.dir !== NIGHTLY_FORK_DIR).length)
  })

  // (d)
  it('gives the catalogues card exactly the number the register page counts', () => {
    expect(registerCount()).toBe(rows.length)
    expect(summariseRegister(rows).total).toBe(rows.length)
    const card = readFileSync(`${ROOT}src/components/pages/CataloguesPage.astro`, 'utf8')
    expect(card).toMatch(/'\/ecology#register':\s*registerCount\(\)/)
    const page = readFileSync(`${ROOT}src/components/ecology/WorksRegisterSection.astro`, 'utf8')
    expect(page).toMatch(/const \{ rows, undated \} = buildRegister\(\)/)
    expect(page).toMatch(/const summary = summariseRegister\(rows\)/)
    // the works alone are not the register any more — the page must not import them separately
    expect(page).not.toMatch(/import \{[^}]*\ballWorks\b[^}]*\} from '@\/lib\/engines\/register'/)
  })
})
