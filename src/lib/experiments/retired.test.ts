import { existsSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { WERKE, WERKE_RETIRED } from '@/data/werke'
import { archiveHref, archiveLine, archiveSpan, RETIRED_NOTICE } from './retired'

describe('archiveSpan reads the nights from the filenames alone', () => {
  it('ignores latest.json and anything not named for a day, and counts each day once', () => {
    expect(archiveSpan(['2026-06-26.json', 'latest.json', '2026-06-25.json', 'register.json', '2026-06-26.json'])).toEqual({
      nights: 2,
      first: '2026-06-25',
      last: '2026-06-26',
    })
  })
  it('returns null where there is no dated night to call an archive', () => {
    expect(archiveSpan(['latest.json'])).toBeNull()
  })
})

describe('archiveHref points at the record that stays', () => {
  it('opens the directory of a dated archive, and the commit history of a single snapshot', () => {
    expect(archiveHref({ path: 'src/data/ghost-fleet', kind: 'dated' })).toBe(
      'https://github.com/frankbueltge/frankbueltge.de/tree/main/src/data/ghost-fleet',
    )
    expect(archiveHref({ path: 'src/data/pattern/latest.json', kind: 'history' })).toBe(
      'https://github.com/frankbueltge/frankbueltge.de/commits/main/src/data/pattern/latest.json',
    )
  })
})

describe('a retired archive stays as it was left', () => {
  it('has retired works to check — the three of 2026-10-17 at least', () => {
    expect(WERKE_RETIRED.map((w) => w.id).sort()).toEqual(expect.arrayContaining(['ghost-fleet', 'pattern', 'round-number']))
  })

  it('holds no night after the day the instrument was retired', () => {
    // The guard that matters once the workflows are gone: a nightly file dated after the
    // retirement would mean something still writes into an archive the page calls closed.
    for (const w of WERKE.filter((x) => x.retired?.archive.kind === 'dated')) {
      const span = archiveSpan(readdirSync(w.retired!.archive.path))
      expect(span, `${w.id}: ${w.retired!.archive.path} holds no dated night`).not.toBeNull()
      expect(span!.last <= w.retired!.on, `${w.id}: a night after ${w.retired!.on} in a retired archive`).toBe(true)
    }
  })

  it('names a file that exists where the archive is a single snapshot', () => {
    for (const w of WERKE.filter((x) => x.retired?.archive.kind === 'history')) {
      expect(existsSync(w.retired!.archive.path), `${w.id}: ${w.retired!.archive.path}`).toBe(true)
    }
  })

  it('says where the archive is, in the sentence the notice prints', () => {
    for (const w of WERKE_RETIRED) {
      expect(archiveLine(w.retired!.archive)).toContain(w.retired!.archive.path)
    }
  })
})

describe('the frame around the reason carries no reading', () => {
  it('has no digit typed into any of its literal strings', () => {
    for (const [key, value] of Object.entries(RETIRED_NOTICE)) {
      if (typeof value === 'string') expect(value, key).not.toMatch(/\d/)
    }
  })
})
