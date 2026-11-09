// Guard for The Ill-Tempered Week: every album on file must be what its own record says it is, read from the
// ledger it names (src/data/ill-tempered-week/*.json, written by scripts/ill-tempered-week/press.py).
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FIELD, INSTRUMENT, clock, readAlbums, span, weekNumber } from './albums'

const albums = readAlbums()

const isoDays = (week: string): string[] => {
  const [y, w] = week.split('-W').map(Number)
  const jan4 = new Date(Date.UTC(y!, 0, 4))
  const monday = new Date(jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * 86400000 + (w! - 1) * 7 * 86400000)
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * 86400000).toISOString().slice(0, 10))
}

const ledgerTexts = (day: string): string[] => {
  const file = JSON.parse(readFileSync(`src/data/trending/${day}.json`, 'utf8')) as {
    signals: Record<string, { label: string }[]>
  }
  return Object.values(file.signals).flat().map((s) => s.label)
}

describe('clock', () => {
  it('cuts the seconds the way an audio player counts them', () => {
    expect(clock(166.8)).toBe('2:46')
    expect(clock(337.2)).toBe('5:37')
    expect(clock(59.99)).toBe('0:59')
  })
})

describe('The Ill-Tempered Week', () => {
  it('has at least one album, and the first is Contrapunctus 45', () => {
    expect(albums.length).toBeGreaterThan(0)
    expect(albums[0]!.week).toBe('2026-W45')
  })

  for (const a of albums) {
    describe(a.title, () => {
      it('is named after its ISO week and holds that week’s first days, in order', () => {
        expect(a.work).toBe('The Ill-Tempered Week')
        expect(a.title).toBe(`Contrapunctus ${weekNumber(a.week)}`)
        expect(a.days).toEqual(isoDays(a.week).slice(0, a.days.length))
        expect(span(a.days).length).toBeGreaterThan(0)
      })

      it('read the day files it names, as they are committed now', () => {
        for (const day of a.days) {
          const rel = `src/data/trending/${day}.json`
          expect(a.receipts[rel], rel).toBeDefined()
          expect(createHash('sha256').update(readFileSync(rel)).digest('hex')).toBe(a.receipts[rel])
        }
      })

      it('is complete exactly when the week is, and then has all three pieces', () => {
        expect(a.complete).toBe(a.days.length === 7)
        expect(a.pieces.overlooked.edition).toBe(a.days.length)
        if (a.complete) {
          expect(a.pieces.unison).toBeDefined()
          expect(a.pieces.turn).toBeDefined()
        }
      })

      it('has every piece’s audio beside it', () => {
        for (const p of Object.values(a.pieces)) {
          expect(existsSync(join('public', p!.audio)), p!.audio).toBe(true)
          expect(p!.true_peak_dbtp).toBeLessThanOrEqual(-1.0)
        }
      })

      it('Overlooked: one day per day so far, each a field not heard before that week, each headline from that day’s ledger', () => {
        const o = a.pieces.overlooked
        expect(o.days.map((d) => d.day)).toEqual(a.days)
        expect(new Set(o.days.map((d) => d.field)).size).toBe(o.days.length)
        for (const d of o.days) {
          expect(FIELD[d.field], d.field).toBeDefined()
          expect(INSTRUMENT[d.instrument], d.instrument).toBeDefined()
          expect(ledgerTexts(d.day).some((label) => label.includes(d.text) || d.text.includes(label.slice(0, 40))), d.text).toBe(true)
          expect(d.attention).toBeGreaterThanOrEqual(0)
          expect(d.attention).toBeLessThanOrEqual(1)
        }
      })

      if (a.pieces.unison) {
        it('Unison: the peak comes exactly where the press agreed at least 30 %, never on the last day', () => {
          const u = a.pieces.unison!
          u.days.forEach((d, i) => {
            expect(d.agreement).toBeGreaterThan(0)
            expect(d.agreement).toBeLessThanOrEqual(1)
            expect(d.peak).toBe(d.agreement >= 0.3 && i < u.days.length - 1)
            expect(d.said === null).toBe(!d.peak)
          })
        })
      }

      if (a.pieces.turn) {
        it('Turn: the week turns on the first day with at least twice the mean of the days before, from the third day on', () => {
          const t = a.pieces.turn!
          const counts = t.days.map((d) => d.signals)
          const expected = counts.findIndex((c, i) => i >= 2 && c >= 2 * (counts.slice(0, i).reduce((s, x) => s + x, 0) / i))
          expect(t.days.findIndex((d) => d.turn)).toBe(expected)
          expect(t.harmonics).toMatchObject({ search: 5, news: 6, social: 7, tech: 9 })
        })
      }
    })
  }
})
