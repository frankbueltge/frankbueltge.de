// The guard of Common Time (2026-11-08). The pressings are rendered by scripts/common-time/press.py,
// once a week, and committed; nothing else ties a pressing to the ledger it claims to play. This
// does, from three sides:
//
//   1. the sound: every score names an audio file that exists and has the sha256 it records;
//   2. the ledger: every day the score read is still the committed day file it hashed;
//   3. the rule: the arrangement is decided again here (arrangement.ts) from the ledger alone, and
//      the score must say the same: theme, each day's melody, the ornaments at their sixteenths,
//      the counts. A renderer that drifted from its published rule turns red here.
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { arrange, crowdPerBar, motif, ornamentSlots, topicsOf, type LedgerTopic } from './arrangement'
import { audioHref, CONTRACT, readPressings, weekName, weekSpan, clock, dayShort } from './score'

const ROOT = process.cwd()
const pressings = readPressings()
const sha = (path: string): string => createHash('sha256').update(readFileSync(join(ROOT, path))).digest('hex')

interface LedgerDay {
  topics?: (LedgerTopic & { label: string })[]
  signals?: Record<string, unknown[]>
}
const ledgerDays = readdirSync(join(ROOT, 'src/data/trending'))
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  .map((f) => f.slice(0, 10))
  .sort()
const ledger = (day: string): LedgerDay | null => {
  const path = join(ROOT, 'src/data/trending', `${day}.json`)
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as LedgerDay) : null
}

describe('the pressings', () => {
  it('has at least one week to play', () => {
    expect(pressings.length).toBeGreaterThan(0)
  })

  it.each(pressings.map((p) => [p.week, p] as const))('%s keeps its contract and its seven days', (_, p) => {
    expect(p.$contract).toBe(CONTRACT)
    expect(p.days).toHaveLength(7)
    expect(p.sections.map((s) => s.day)).toEqual(p.days)
    expect(new Date(`${p.days[0]}T12:00:00Z`).getUTCDay()).toBe(1) // a Monday
  })
})

describe('the sound', () => {
  it.each(pressings.map((p) => [p.week, p] as const))('%s has the audio it names, byte for byte', (_, p) => {
    expect(existsSync(join(ROOT, p.audio.file)), `${p.audio.file} is missing`).toBe(true)
    expect(sha(p.audio.file)).toBe(p.audio.sha256)
    expect(audioHref(p)).toBe(`/common-time/${p.week}.m4a`)
  })

  it.each(pressings.map((p) => [p.week, p] as const))('%s is mastered to the house level', (_, p) => {
    expect(Math.abs(p.audio.lufs + 14)).toBeLessThan(0.3)
    expect(p.audio.true_peak_dbtp).toBeLessThanOrEqual(-1)
  })
})

describe('the ledger', () => {
  it.each(pressings.map((p) => [p.week, p] as const))('%s read day files that are still the committed ones', (_, p) => {
    for (const s of p.sections) {
      if (s.missing) {
        expect(ledger(s.day), `${s.day} is marked missing but is in the ledger`).toBeNull()
        continue
      }
      expect(s.receipt!.file).toBe(`src/data/trending/${s.day}.json`)
      expect(sha(s.receipt!.file), `${s.day} changed after it was pressed`).toBe(s.receipt!.sha256)
    }
  })
})

describe('the rule', () => {
  it.each(pressings.map((p) => [p.week, p] as const))('%s is what the ledger arranges to', (_, p) => {
    // the labels as first recorded, up to the week's last day: the melodies are made from them
    const firstLabel = new Map<string, string>()
    let signalsMax = 0
    for (const day of ledgerDays) {
      if (day > p.days.at(-1)!) break
      const t = ledger(day)!
      for (const tp of t.topics ?? []) if (!firstLabel.has(tp.id)) firstLabel.set(tp.id, tp.label)
      signalsMax = Math.max(signalsMax, Object.values(t.signals ?? {}).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0))
    }
    expect(p.archive.signals_max).toBe(signalsMax)

    const days = p.days.map((day) => ({ day, topics: topicsOf(ledger(day)?.topics ?? []) }))
    const plan = arrange(days)
    expect(p.theme?.id ?? null).toBe(plan.theme)
    if (p.theme) {
      expect(p.theme.days).toBe(plan.themeDays)
      expect(p.theme.motif).toEqual(motif(firstLabel.get(p.theme.id)!))
    }
    for (const [i, s] of p.sections.entries()) {
      const d = days[i]!
      expect(s.converging).toBe(d.topics.length)
      expect(s.theme.present).toBe(d.topics.some((tp) => tp.id === plan.theme))
      expect(s.melody?.id ?? undefined).toBe(plan.melody[s.day])
      if (s.melody) {
        expect(s.melody.motif).toEqual(motif(firstLabel.get(s.melody.id)!))
        expect(s.melody.families).toEqual(d.topics.find((tp) => tp.id === s.melody!.id)!.families)
      }
      expect(s.ornaments.map(({ id, slot }) => ({ id, slot }))).toEqual(ornamentSlots(d.topics, plan, s.day))
      const signals = Object.values(ledger(s.day)?.signals ?? {}).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0)
      expect(s.signals).toBe(signals)
      expect(s.crowd_per_bar).toBe(crowdPerBar(signals, signalsMax))
    }
  })
})

describe('the melodies are names', () => {
  it('sings the vowels of a name on F G A C D, the last vowel of a word held', () => {
    // Google Gemini: o o e | e i i  →  C C G | G A A
    expect(motif('Google Gemini')).toEqual([
      [3, 1], [3, 1], [1, 2], [1, 1], [2, 1], [2, 2],
    ])
  })

  it('reads accents as their letters and drops what has no Latin vowel', () => {
    expect(motif('Peña')).toEqual([[1, 1], [4, 2]])
    expect(motif('شبكة')).toEqual([[0, 2]])
  })

  it('keeps at most eight notes', () => {
    expect(motif("Paraguay's president Santiago Peña resigns").length).toBe(8)
  })
})

describe('the words on the page', () => {
  it('names weeks and spans the way the page prints them', () => {
    expect(weekName('2026-W45')).toBe('Week 45, 2026')
    expect(weekSpan(['2026-11-02', '2026-11-08'])).toBe('2 to 8 November 2026')
    expect(weekSpan(['2026-09-28', '2026-10-04'])).toBe('28 September to 4 October 2026')
    expect(clock(123)).toBe('2:03')
    expect(dayShort('2026-11-02')).toBe('Mon 2')
  })
})
