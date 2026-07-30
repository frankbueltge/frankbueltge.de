// src/data/meridian/runtime-log.test.ts
//
// Das Journal der MRR-Linie ist der einzige Ort, an dem die Site den Stand der Runtime
// NACH dem committeten Export erzählt (/on-record steht bei dessen Datum still). Es wird
// von Hand nachgetragen — also sichert dieser Test die Eigenschaften, auf die sich die
// Darstellung und der Frische-Wächter (scripts/drift-check.mjs, Prüfung 5) verlassen.
import { describe, it, expect } from 'vitest'
import log from './runtime-log.json'

const entries = log.entries

describe('MRR runtime log', () => {
  it('has entries — an empty log would silently claim there is nothing to report', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  it('dates every entry as a plain ISO day', () => {
    for (const e of entries) expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('reads newest first (the rendered order is the file order)', () => {
    const dates = entries.map((e) => e.date)
    expect([...dates].sort().reverse()).toEqual(dates)
  })

  it('backs every entry with a full 40-char commit sha', () => {
    for (const e of entries) expect(e.commit).toMatch(/^[0-9a-f]{40}$/)
  })

  it('links each entry at the commit it names — the claim must be checkable', () => {
    for (const e of entries) {
      expect(e.url).toBe(`https://github.com/frankbueltge/${e.repo}/commit/${e.commit}`)
    }
  })

  it('names only repositories of the runtime line', () => {
    for (const e of entries) {
      expect(['meridian-runtime', 'frankbueltge.de']).toContain(e.repo)
    }
  })

  it('says something in every entry — no headline without its finding', () => {
    for (const e of entries) {
      expect(e.headline.length).toBeGreaterThan(10)
      expect(e.note.length).toBeGreaterThan(40)
    }
  })
})
