import { describe, it, expect } from 'vitest'
import { enginePrs, isEngineHead, prExcerpt, validateSitePrAction } from './sitePrs'

const apiPr = (over: Record<string, unknown> = {}) => ({
  number: 93,
  title: 'Insel im Rhizom',
  html_url: 'https://github.com/frankbueltge/frankbueltge.de/pull/93',
  created_at: '2026-07-19T02:10:00Z',
  body: 'Die Karte soll die Insel halten.\n\n---\n*Vorschlag von Ulysses aus [`site-prs/x`](u); Schleuse grün am 2026-07-19. Gemergt wird nur nach menschlichem Review.*',
  head: { ref: 'atelier/pr-insel-swerve' },
  ...over,
})

describe('isEngineHead', () => {
  it('erkennt die drei Engine-Namespaces', () => {
    expect(isEngineHead('atelier/pr-insel')).toBe(true)
    expect(isEngineHead('field/pr-karte-2')).toBe(true)
    expect(isEngineHead('studio/pr-a')).toBe(true)
  })
  it('lehnt alles andere ab', () => {
    expect(isEngineHead('feat/zentrale-site-prs')).toBe(false)
    expect(isEngineHead('atelier/pr-Böse')).toBe(false)
    expect(isEngineHead('plenum/pr-x')).toBe(false)
    expect(isEngineHead('atelier/pr-')).toBe(false)
    expect(isEngineHead(null)).toBe(false)
  })
})

describe('prExcerpt', () => {
  it('schneidet die Schleusen-Fußzeile ab', () => {
    expect(prExcerpt(apiPr().body)).toBe('Die Karte soll die Insel halten.')
  })
  it('kollabiert Whitespace und kürzt lange Bodies', () => {
    const long = `${'a '.repeat(300)}ende`
    const e = prExcerpt(long)
    expect(e.length).toBeLessThanOrEqual(401)
    expect(e.endsWith('…')).toBe(true)
  })
  it('übersteht fehlenden Body', () => {
    expect(prExcerpt(null)).toBe('')
  })
})

describe('enginePrs', () => {
  it('mappt einen Schleusen-PR mit Persona und Slug', () => {
    expect(enginePrs([apiPr()])).toEqual([
      {
        number: 93,
        ns: 'atelier',
        persona: 'Ulysses',
        label: 'Atelier · Ulysses',
        slug: 'insel-swerve',
        title: 'Insel im Rhizom',
        url: 'https://github.com/frankbueltge/frankbueltge.de/pull/93',
        branch: 'atelier/pr-insel-swerve',
        createdAt: '2026-07-19T02:10:00Z',
        excerpt: 'Die Karte soll die Insel halten.',
      },
    ])
  })
  it('überspringt fremde PRs (menschliche Branches) still', () => {
    expect(enginePrs([apiPr({ head: { ref: 'feat/hub-work-first' } }), apiPr()])).toHaveLength(1)
  })
  it('sortiert als Warteschlange: älteste zuerst', () => {
    const prs = enginePrs([
      apiPr({ number: 2, created_at: '2026-07-20T00:00:00Z' }),
      apiPr({ number: 1, created_at: '2026-07-19T00:00:00Z' }),
    ])
    expect(prs.map((p) => p.number)).toEqual([1, 2])
  })
  it('übersteht Nicht-Arrays und kaputte Einträge', () => {
    expect(enginePrs(null)).toEqual([])
    expect(enginePrs([null, 42, { head: null }])).toEqual([])
  })
})

describe('validateSitePrAction', () => {
  it('akzeptiert merge und close, mit und ohne Kommentar', () => {
    expect(validateSitePrAction({ number: 93, action: 'merge' })).toEqual({ ok: true })
    expect(validateSitePrAction({ number: 93, action: 'close', comment: 'überholt' })).toEqual({ ok: true })
  })
  it('lehnt ungültige Nummern, Aktionen und Kommentare ab', () => {
    expect(validateSitePrAction({ number: 0, action: 'merge' }).ok).toBe(false)
    expect(validateSitePrAction({ number: 93, action: 'delete' }).ok).toBe(false)
    expect(validateSitePrAction({ number: 93, action: 'close', comment: 42 }).ok).toBe(false)
    expect(validateSitePrAction({ number: 93, action: 'close', comment: 'x'.repeat(2001) }).ok).toBe(false)
    expect(validateSitePrAction(null).ok).toBe(false)
  })
})
