// The shelf is derived, never authored: which files are pages, what each page calls itself, how
// it opens, and the day the practice's own record gives it. Every rule is held here against
// fixtures shaped like the practice's real files, and then once against the mirror on disk —
// the integrate rewrites that mirror every night, so a guard that only tested the functions
// would not notice the night the practice changes how it writes a record.
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { FRAME_MARKER, frameStandaloneWork } from '@/lib/engines/work-frame'
import {
  buildShelf,
  builtLine,
  builtPages,
  datePage,
  discoverPages,
  firstSentence,
  n1PageHref,
  n1PageKind,
  namesPage,
  pageTitle,
  readN1Shelf,
  type NightRecord,
  type PracticeRecord,
} from './shelf'

const MIRROR = fileURLToPath(new URL('../../../public/n-1', import.meta.url))

const page = (body: string, title = 'A Page'): string =>
  `<!doctype html><html><head><title>${title}</title><style>p{margin:0}</style></head><body><main>${body}</main></body></html>`

const night = (record: number, date: string, body: string, label = `Night ${record - 26}`): NightRecord => ({
  record,
  label,
  date,
  title: 'a night',
  text: `# ${label} — ${date}, a night\n\n${body}\n`,
})

const record = (over: Partial<PracticeRecord> = {}): PracticeRecord => ({ nights: [], forms: {}, atlas: [], ...over })

describe('which mirrored files are pages a visitor opens', () => {
  it('takes a work’s index and every page under projects/', () => {
    expect(n1PageKind('works/two-nights-deep/index.html')).toBe('work')
    expect(n1PageKind('projects/usgs-fixed-depth/index.html')).toBe('study')
    expect(n1PageKind('projects/elbe-low-water/the-cut/index.html')).toBe('study')
    expect(n1PageKind('projects/unicode-admission/languages.html')).toBe('study')
  })

  it('leaves out build templates, the record and everything outside the two directories', () => {
    expect(n1PageKind('projects/usgs-fixed-depth/template.html')).toBeNull()
    expect(n1PageKind('works/the-days-end-to-end/template.html')).toBeNull()
    expect(n1PageKind('record.html')).toBeNull()
    expect(n1PageKind('index.html')).toBeNull()
    expect(n1PageKind('material/night-sky/2026-08-22-selection/hourly-listing.html')).toBeNull()
    expect(n1PageKind('projects/usgs-fixed-depth/JOURNAL.md')).toBeNull()
  })

  it('discovers the pages among a walk of the mirror, in a stable order', () => {
    expect(
      discoverPages([
        'works/b/index.html',
        'record.html',
        'projects/p/template.html',
        'projects/p/second.html',
        'works/a/index.html',
        'projects/p/index.html',
      ]),
    ).toEqual(['projects/p/index.html', 'projects/p/second.html', 'works/a/index.html', 'works/b/index.html'])
  })

  it('addresses an index by its directory and any other page by its file', () => {
    expect(n1PageHref('works/two-nights-deep/index.html')).toBe('/n-1/works/two-nights-deep/')
    expect(n1PageHref('projects/unicode-admission/languages.html')).toBe('/n-1/projects/unicode-admission/languages.html')
  })
})

describe('a page’s own title', () => {
  it('is its <title>', () => {
    expect(pageTitle(page('<h1>Legible only below</h1>', 'Legible Only Below — study'))).toBe('Legible Only Below — study')
  })

  it('falls back to its <h1> where it carries none, and reads entities', () => {
    expect(pageTitle('<html><body><h1>What the  Catalogue&rsquo;s <em>Depths</em> Decide</h1></body></html>')).toBe(
      'What the Catalogue’s Depths Decide',
    )
  })

  it('is null where the page names itself nowhere', () => {
    expect(pageTitle('<html><body><p>No heading here.</p></body></html>')).toBeNull()
  })
})

describe('a page’s own first sentence', () => {
  it('is the first sentence of the first paragraph after the heading', () => {
    const html = page(
      '<h1>The order of admission</h1><p class="lede">A writing system does not enter the Unicode standard once. It enters in instalments.</p>',
    )
    expect(firstSentence(html)).toBe('A writing system does not enter the Unicode standard once.')
  })

  it('passes over a byline: a line with no full stop is not a sentence', () => {
    const html = page(
      '<h1>The Days, End to End</h1><p class="sub">Remainder, 2026 · data art, with sound · built 27 September 2026</p>' +
        '<p>The world\'s clocks count a day as 86,400 seconds. The Earth almost never takes exactly that.</p>',
    )
    expect(firstSentence(html)).toBe("The world's clocks count a day as 86,400 seconds.")
  })

  it('takes an opening beat together with what follows it', () => {
    expect(firstSentence(page('<h1>The Cut</h1><p>You have one chisel. The river is falling. Cut when it is lowest.</p>'))).toBe(
      'You have one chisel. The river is falling.',
    )
    expect(firstSentence(page('<h1>Legible only below</h1><p>A study. The dates carved on three stones.</p>'))).toBe(
      'A study. The dates carved on three stones.',
    )
  })

  it('does not end a sentence at an abbreviation, an initial or a decimal', () => {
    expect(
      firstSentence(page('<h1>T</h1><p>A museum writes &ldquo;ca. 1850&rdquo; on a label and stores two numbers beside it. Here is what they are.</p>')),
    ).toBe('A museum writes “ca. 1850” on a label and stores two numbers beside it.')
    expect(firstSentence(page('<h1>T</h1><p>The U. S. Geological Survey gives every earthquake a depth of 10.0 km. Nobody measured it.</p>'))).toBe(
      'The U. S. Geological Survey gives every earthquake a depth of 10.0 km.',
    )
    expect(firstSentence(page('<h1>T</h1><p>The U.S. Geological Survey, i.e. the agency, gives a depth. Nobody measured it.</p>'))).toBe(
      'The U.S. Geological Survey, i.e. the agency, gives a depth.',
    )
    // a lower-case letter is a word, not an initial
    expect(firstSentence(page('<h1>T</h1><p>Every reading is filed under a letter, from a to z, never under a. The rest follows from that.</p>'))).toBe(
      'Every reading is filed under a letter, from a to z, never under a.',
    )
  })

  it('keeps a question whole', () => {
    expect(
      firstSentence(page('<h1>How Sure Is a Planet</h1><p>When two papers measure the same planet, how often do they disagree? Every line below is one thing.</p>')),
    ).toBe('When two papers measure the same planet, how often do they disagree?')
  })

  it('never reads the strip the site adds as the page’s own words', () => {
    const framed = frameStandaloneWork(page('<h1>T</h1><p>The page begins here, in its own words.</p>'), 'n-1', null)
    expect(framed).toContain(FRAME_MARKER)
    expect(firstSentence(framed)).toBe('The page begins here, in its own words.')
  })

  it('reads prose, not machinery: scripts, figures and tables are passed over', () => {
    const html = page(
      '<h1>T</h1><script>var s = "Not this. Nor this.";</script><figure><p>A caption. Not the opening.</p></figure>' +
        '<noscript><p>Without scripts. Nothing.</p></noscript><p>The first thing the page says to a reader.</p>',
    )
    expect(firstSentence(html)).toBe('The first thing the page says to a reader.')
  })

  it('is null where the page opens with no sentence at all', () => {
    expect(firstSentence(page('<h1>T</h1><p class="sub">a study — 26 September 2026</p><svg><text>x.</text></svg>'))).toBeNull()
  })
})

describe('what a night’s record says it built', () => {
  const N53 = [
    '- **Predictions:** 5 registered; P1 held.',
    '- **Built:** `projects/unicode-admission/languages.html` (chart plus a specimen; render-checked). No work declared.',
    '- **Conjecture:** why any letter waited.',
  ].join('\n')

  it('reads the Built line, and only that line', () => {
    expect(builtLine(N53)).toContain('languages.html')
    expect(builtLine(N53)).not.toContain('Conjecture')
    expect(builtLine('## What ran\n\nA first study built (`projects/earth-rotation/study-1/`).')).toBeNull()
  })

  it('follows the line onto the lines it wraps to', () => {
    const wrapped =
      '- **Found:** the gauge rewrote 36 readings.\n' +
      '- **Built:** *The Cut* (`projects/elbe-low-water/the-cut/`), a candidate work: replay of 3,360\n' +
      '  Dresden readings, one chisel. Surface line and `window.json` updated.\n' +
      '- **Neighbours:** none.'
    expect(builtLine(wrapped)).toContain('window.json')
    expect(builtPages(wrapped)).toEqual(['projects/elbe-low-water/the-cut/index.html'])
  })

  it('names the page by its file, or by its directory', () => {
    expect(builtPages(N53)).toEqual(['projects/unicode-admission/languages.html'])
    expect(builtPages('- **Built:** `projects/met-date-intervals/dialects/` — a page.')).toEqual([
      'projects/met-date-intervals/dialects/index.html',
    ])
    expect(builtPages('- **Built:** a station-count figure on `projects/usgs-fixed-depth/index.html`. Still not a work.')).toEqual([
      'projects/usgs-fixed-depth/index.html',
    ])
  })

  it('builds no page where the line names none, or names only what is not a page', () => {
    expect(builtPages('- **Built:** the page gains a time view; render-checked at two widths.')).toEqual([])
    expect(builtPages('- **Built:** nothing new; *The Cut* rebuilt on four windows.')).toEqual([])
    expect(builtPages('- **Built:** `projects/usgs-fixed-depth/build.py` and `projects/usgs-fixed-depth/template.html`.')).toEqual([])
    expect(builtPages('- **Found:** see `projects/usgs-fixed-depth/index.html`.')).toEqual([])
  })
})

describe('whether a record names a page', () => {
  it('counts the file, and the directory of an index', () => {
    expect(namesPage('The page is `works/two-nights-deep/index.html`.', 'works/two-nights-deep/index.html')).toBe(true)
    expect(namesPage('built (`projects/earth-rotation/study-1/`). Every day', 'projects/earth-rotation/study-1/index.html')).toBe(true)
  })

  it('does not count a sibling file, a longer path or a page of another name', () => {
    const form = 'Full deliberation: `works/below-the-threshold/FORM.md` and `works/below-the-threshold/{CANDIDATE,FORM}.md`.'
    expect(namesPage(form, 'works/below-the-threshold/index.html')).toBe(false)
    expect(namesPage('see `projects/unicode-admission/languages.html`', 'projects/unicode-admission/index.html')).toBe(false)
    expect(namesPage('see `archive/projects/x/study-1/index.html`', 'projects/x/study-1/index.html')).toBe(false)
  })

  it('counts a project’s root directory only on the Built line: it is named long before a page stands in it', () => {
    const opened = '- **Opened:** project 6, files under `projects/unicode-admission/`.'
    expect(namesPage(opened, 'projects/unicode-admission/index.html')).toBe(false)
    expect(namesPage('- **Built:** `projects/unicode-admission/`, static small multiples.', 'projects/unicode-admission/index.html')).toBe(true)
    expect(namesPage('- **Opened:** `projects/unicode-admission/index.html`', 'projects/unicode-admission/index.html')).toBe(true)
  })
})

describe('the day the practice’s record gives a page', () => {
  const nights = [
    night(63, '2026-09-26', 'A first study built (`projects/earth-rotation/study-1/`).'),
    night(64, '2026-09-27', 'Declared (`works/the-days-end-to-end/`, `WORK.md`). The study `projects/earth-rotation/study-1/` stays.'),
    night(79, '2026-10-10', '- **Built:** `projects/unicode-admission/languages.html`.'),
  ]

  it('is the first night that names it', () => {
    expect(datePage('projects/earth-rotation/study-1/index.html', record({ nights }))).toEqual({
      date: '2026-09-26',
      source: 'night',
      record: 63,
    })
    expect(datePage('works/the-days-end-to-end/index.html', record({ nights }))?.date).toBe('2026-09-27')
  })

  it('reads the nights in the record’s own order, whatever order they arrive in', () => {
    expect(datePage('projects/earth-rotation/study-1/index.html', record({ nights: [...nights].reverse() }))?.record).toBe(63)
  })

  it('falls back to the page’s own form or work document', () => {
    const forms = {
      'works/two-nights-deep/FORM.md': '# Two Nights Deep\n\n*Laid down 2026-08-25, night 12 (record 37) — the schedule’s hour.',
      'works/the-days/WORK.md': '# The Days\n\n*Declared 2026-09-27, night 38 (record 64).',
      'projects/met/dialects/WORK.md': '# Same Words — declared a modest work (session 3, 2026-10-07)\n',
    }
    expect(datePage('works/two-nights-deep/index.html', record({ forms }))).toEqual({ date: '2026-08-25', source: 'form', record: null })
    expect(datePage('works/the-days/index.html', record({ forms }))?.date).toBe('2026-09-27')
    expect(datePage('projects/met/dialects/index.html', record({ forms }))?.date).toBe('2026-10-07')
  })

  it('prefers the night to the form: the form may be written a session after the page', () => {
    const forms = { 'projects/met/dialects/WORK.md': '# declared a modest work (session 3, 2026-10-07)' }
    const built = [night(70, '2026-10-06', '- **Built:** `projects/met/dialects/` — a page.')]
    expect(datePage('projects/met/dialects/index.html', record({ nights: built, forms }))).toMatchObject({
      date: '2026-10-06',
      source: 'night',
    })
  })

  it('falls back to the first atlas layer that refers to it', () => {
    const atlas = [
      { created: '2026-10-08', refs: ['projects/x/index.html'] },
      { created: '2026-10-07', refs: ['projects/x/JOURNAL.md', 'projects/x/index.html'] },
      { created: '2026-10-01', refs: ['projects/x/SELECTION.md'] },
    ]
    expect(datePage('projects/x/index.html', record({ atlas }))).toEqual({ date: '2026-10-07', source: 'atlas', record: null })
  })

  it('gives no date where the record gives none — never a guessed one', () => {
    expect(datePage('projects/x/index.html', record())).toBeNull()
    expect(datePage('projects/x/index.html', record({ nights: [night(80, 'undated', '`projects/x/index.html`')] }))).toBeNull()
  })
})

describe('the shelf', () => {
  const pages = [
    { path: 'works/old/index.html', html: page('<h1>Old</h1><p>The oldest work on the shelf stands here.</p>', 'Old Work') },
    { path: 'projects/a/index.html', html: page('<h1>A</h1><p>The first of two pages built on one day.</p>', 'A') },
    { path: 'projects/b/index.html', html: page('<h1>B</h1><p>The second of two pages built on one day.</p>', 'B') },
    { path: 'projects/c/extra.html', html: page('<h1>C</h1>', 'No Record Names Me') },
    { path: 'projects/c/template.html', html: page('<h1>T</h1>', 'Template') },
  ]
  const shelf = buildShelf(
    pages,
    record({
      nights: [
        night(16, '2026-08-16', 'The work: `works/old/index.html`.'),
        night(72, '2026-10-07', '- **Built:** `projects/a/index.html`.'),
        night(75, '2026-10-07', '- **Built:** `projects/b/index.html`.'),
      ],
    }),
  )

  it('lists every page newest first, the later night first within a day, the undated last', () => {
    expect(shelf.map((p) => p.path)).toEqual([
      'projects/b/index.html',
      'projects/a/index.html',
      'works/old/index.html',
      'projects/c/extra.html',
    ])
    expect(shelf.at(-1)).toMatchObject({ date: null, dateSource: null, title: 'No Record Names Me', sentence: null })
  })

  it('carries each page’s own words, its kind and its address', () => {
    expect(shelf[2]).toEqual({
      path: 'works/old/index.html',
      href: '/n-1/works/old/',
      kind: 'work',
      title: 'Old Work',
      sentence: 'The oldest work on the shelf stands here.',
      date: '2026-08-16',
      dateSource: 'night',
      record: 16,
    })
  })
})

// ————————————————————————————————————————— the mirror on disk ——————————————

describe('the mirror as it stands', () => {
  const shelf = readN1Shelf(MIRROR)

  // the eleven that stood on 2026-10-10 — the shelf may grow, it must not lose one of these
  const STANDING = [
    'works/below-the-threshold/index.html',
    'works/the-days-end-to-end/index.html',
    'works/two-nights-deep/index.html',
    'projects/earth-rotation/study-1/index.html',
    'projects/elbe-low-water/study-1/index.html',
    'projects/elbe-low-water/the-cut/index.html',
    'projects/exoplanet-discord/index.html',
    'projects/met-date-intervals/dialects/index.html',
    'projects/unicode-admission/index.html',
    'projects/unicode-admission/languages.html',
    'projects/usgs-fixed-depth/index.html',
  ]

  it('finds the works and the studies the practice has built, each with its own words and a day', () => {
    for (const path of STANDING) {
      const p = shelf.find((x) => x.path === path)
      expect(p, path).toBeDefined()
      expect(p!.title, path).not.toBe(path)
      expect(p!.sentence, path).toBeTruthy()
      expect(p!.date, path).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
    expect(shelf.some((p) => p.path.endsWith('template.html'))).toBe(false)
  })

  // A page the practice builds tomorrow may open with a figure and no sentence, and that is a
  // page, not a fault — so the general rule is only what must hold for any page at all.
  it('leads every entry to a file that exists, and never quotes the site’s own strip as the page', () => {
    for (const p of shelf) {
      expect(existsSync(`${MIRROR}/${p.path}`), p.path).toBe(true)
      expect(p.sentence ?? '', p.path).not.toMatch(/added by the site/i)
    }
  })

  it('dates the pages from the practice’s own record, newest first', () => {
    const dated = shelf.filter((p) => p.date)
    for (const p of dated) expect(p.date, p.path).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(dated.map((p) => p.date)).toEqual([...dated.map((p) => p.date)].sort().reverse())
    // an undated page is allowed, and stands after every dated one
    expect(shelf.slice(dated.length).every((p) => p.date === null)).toBe(true)
    // two dates the practice states in so many words, on the pages themselves
    expect(shelf.find((p) => p.path === 'works/the-days-end-to-end/index.html')?.date).toBe('2026-09-27')
    expect(shelf.find((p) => p.path === 'works/below-the-threshold/index.html')?.date).toBe('2026-08-16')
  })

  // THE GUARD ON THE INTEGRATE. n1-integrate.yml wipes and re-copies the mirror and then frames
  // it; if that step ever ran without the shelf, the front door would lose it silently and the
  // next visitor would be back to links buried in the text.
  it('stands on the practice’s front door: every page, by its own title, under the site’s note', () => {
    const door = readFileSync(`${MIRROR}/index.html`, 'utf8')
    expect(door).toContain(`class="${FRAME_MARKER}__shelf"`)
    expect(door).toMatch(/added by the site/)
    for (const p of shelf) expect(door, p.path).toContain(`href="${p.href}"`)
    // the shelf is above the practice's own page, not somewhere inside it
    expect(door.indexOf(`class="${FRAME_MARKER}__shelf"`)).toBeLessThan(door.indexOf('<main'))
    // and it is exactly what the current mirror derives — not a shelf of some earlier night
    const entries = shelf.map(({ href, title, kind, date, sentence }) => ({ href, title, kind, date, sentence }))
    expect(
      frameStandaloneWork(door, 'n-1', null, { atHouseIndex: true, shelf: entries }) === door,
      'the front door’s shelf is stale — run: npx tsx scripts/engines/reframe-works.ts n-1',
    ).toBe(true)
  })
})
