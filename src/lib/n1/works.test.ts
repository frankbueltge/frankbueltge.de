// The readers the house's log and board use, against a small mirror built for the test: the
// rules are the shelf's (shelf.test.ts); what is held here is how they reach the rows — which
// night leads where, and which works the log files.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { lastN1Night, N1_RECORD_HREF, newestN1Page, readN1Nights, readN1Works } from './works'

let root: string

const put = (path: string, text: string): void => {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
}
const html = (title: string, first: string): string =>
  `<!doctype html><html><head><title>${title}</title></head><body><h1>${title}</h1><p>${first}</p></body></html>`

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'n1-mirror-'))
  put('works/first-work/index.html', html('First Work', 'A work laid down under a form document, long ago.'))
  put('works/first-work/FORM.md', '# First Work\n\n*Laid down 2026-08-16, night 03 (record 16).*\n')
  put('works/second-work/index.html', html('Second Work', 'A work declared in a work document instead.'))
  put('works/second-work/WORK.md', '# Second Work\n\n*Declared 2026-09-27, night 38 (record 64).*\n')
  put('works/unformed/index.html', html('Unformed', 'A page under works that nothing dates yet.'))
  put('projects/admission/index.html', html('The order of admission', 'A writing system does not enter the standard once.'))
  put('projects/admission/languages.html', html('When a language is complete', 'A script can be present for years before its letters.'))
  put('projects/admission/template.html', html('Template', 'Not a page.'))

  put('nights/2026-08-15-founder-note.md', '# Founder’s note — the surface\n\nNo night heading here.\n')
  put('nights/77-fifty-first-night.md', '# Night 51 — 2026-10-08, project 5, session 3: put back\n\n- **Decided:** no work declared.\n')
  put(
    'nights/78-fifty-second-night.md',
    '# Night 52 — 2026-10-09, project 6, session 1: the order of admission\n\n' +
      '- **Built:** `projects/admission/index.html`, static small multiples. No work declared.\n',
  )
  put(
    'nights/79-fifty-third-night.md',
    '# Night 53 — 2026-10-10, project 6, session 2: when a language is complete\n\n' +
      '- **Built:** `projects/admission/languages.html` (chart plus a specimen).\n',
  )
  put(
    'nights/80-fifty-fourth-night.md',
    '# Night 54 — 2026-10-11, project 6, session 3: a page that never landed\n\n' +
      '- **Built:** `projects/admission/letters.html`, not yet pushed.\n',
  )
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe('n-1’s nights', () => {
  it('reads every night in the record’s own order, in the practice’s own words', () => {
    const nights = readN1Nights(join(root, 'nights'))
    expect(nights.map((n) => n.record)).toEqual([77, 78, 79, 80])
    expect(nights[2]).toMatchObject({
      record: 79,
      date: '2026-10-10',
      title: 'Night 53 — project 6, session 2: when a language is complete',
    })
    expect(lastN1Night(join(root, 'nights'))?.record).toBe(80)
  })

  it('leads a night to the page its record says it built', () => {
    const built = new Map(readN1Nights(join(root, 'nights')).map((n) => [n.record, n.built]))
    expect(built.get(78)).toBe('/n-1/projects/admission/')
    expect(built.get(79)).toBe('/n-1/projects/admission/languages.html')
  })

  it('leads nowhere new where the night built no page — or names one the mirror does not hold', () => {
    const built = new Map(readN1Nights(join(root, 'nights')).map((n) => [n.record, n.built]))
    expect(built.get(77)).toBeNull()
    expect(built.get(80)).toBeNull()
    expect(N1_RECORD_HREF).toBe('/n-1/record.html')
  })

  it('is an empty record where the mirror has no nights at all', () => {
    expect(readN1Nights(join(root, 'no-such-directory'))).toEqual([])
  })
})

describe('n-1’s works and its newest page', () => {
  it('files a work under the day its form or its work document gives, newest first', () => {
    expect(readN1Works(join(root, 'works'))).toEqual([
      { id: 'second-work', title: 'Second Work', date: '2026-09-27', href: '/n-1/works/second-work/' },
      { id: 'first-work', title: 'First Work', date: '2026-08-16', href: '/n-1/works/first-work/' },
    ])
  })

  it('leaves a work no record dates off the log rather than dating it by guess', () => {
    expect(readN1Works(join(root, 'works')).some((w) => w.id === 'unformed')).toBe(false)
  })

  it('names the newest page a visitor can open, work or study', () => {
    expect(newestN1Page(root)).toMatchObject({
      title: 'When a language is complete',
      date: '2026-10-10',
      href: '/n-1/projects/admission/languages.html',
      kind: 'study',
    })
  })

  it('names none where the mirror holds no page', () => {
    expect(newestN1Page(join(root, 'no-such-directory'))).toBeNull()
  })
})
