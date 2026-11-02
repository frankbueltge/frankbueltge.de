import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { WERKE } from '@/data/werke'
import { CODE, SITE_REPO, SURFACES, codeUrl, sourceFor, werkAt } from './source-code'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const tree = (dir: string) => `${SITE_REPO}/tree/main/${dir}`

describe('every work names its code', () => {
  it('has an entry for every work in the register, and none for a work it does not hold', () => {
    const ids = WERKE.map((w) => w.id).sort()
    expect(Object.keys(CODE).sort()).toEqual(ids)
  })

  it('names directories of this repository that exist', () => {
    for (const [id, code] of Object.entries(CODE)) {
      if (code.startsWith('https://')) continue
      const dir = ROOT + code
      expect(existsSync(dir) && statSync(dir).isDirectory(), `${id}: ${code} is not a directory of this repository`).toBe(true)
    }
  })

  it('links public GitHub addresses only, and never the mirror that stopped in July', () => {
    const urls = [...Object.values(CODE).map(codeUrl), ...SURFACES.map(([, url]) => url)]
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/github\.com\/frankbueltge\/[a-z0-9.-]+(\/tree\/main\/[\w./-]+)?$/)
      expect(url).not.toContain('lab-pipelines')
    }
  })
})

describe('a page finds its source', () => {
  it('resolves every method sheet under /werke to its work', () => {
    const sheets = readdirSync(ROOT + 'src/pages/werke')
      .filter((f) => f.endsWith('.astro') && f !== 'index.astro')
      .map((f) => `/werke/${f.replace(/\.astro$/, '')}`)
    expect(sheets.length).toBeGreaterThan(15)
    for (const sheet of sheets) {
      const werk = werkAt(sheet)
      expect(werk, `${sheet} belongs to no work in the register`).not.toBeNull()
      expect(sourceFor(sheet), sheet).toBe(codeUrl(CODE[werk!.id]))
    }
  })

  it('gives a work’s own page the same source as its sheet', () => {
    for (const w of WERKE) expect(sourceFor(w.href), w.href).toBe(codeUrl(CODE[w.id]))
  })

  it('reads the addresses as they are served, with or without the trailing slash', () => {
    expect(sourceFor('/werke/ducking/')).toBe(tree('src/lib/ducking'))
    expect(sourceFor('/ducking')).toBe(tree('src/lib/ducking'))
    expect(sourceFor('/werke/bycatch/')).toBe(tree('pipelines/beifang'))
    expect(sourceFor('/werke/headroom')).toBe(tree('src/lib/spielraum'))
    expect(sourceFor('/policy/')).toBe(tree('pipelines/protokoll/src/protokoll/praemie'))
    expect(sourceFor('/werke/attention/')).toBe('https://github.com/frankbueltge/machine-attention/tree/main/foreknown')
    expect(sourceFor('/trending/ledger/')).toBe(tree('pipelines/trending'))
    expect(sourceFor('/atelier/works/x/')).toBe('https://github.com/frankbueltge/ulysses')
    expect(sourceFor('/encounters/')).toBe('https://github.com/frankbueltge/research-ecology')
    expect(sourceFor('/experiments/')).toBe(SITE_REPO)
  })

  it('gives no line where a page has no code of its own, rather than a wrong one', () => {
    for (const path of ['/', '/about/', '/imprint/', '/werke/', '/werke/no-such-sheet/', '/fieldwork/']) {
      expect(sourceFor(path), path).toBeNull()
    }
  })
})

describe('the byline', () => {
  it('keeps no list of its own', () => {
    const byline = readFileSync(ROOT + 'src/components/AuthorByline.astro', 'utf8')
    expect(byline).toContain('sourceFor(')
    expect(byline).not.toContain('github.com')
  })
})
