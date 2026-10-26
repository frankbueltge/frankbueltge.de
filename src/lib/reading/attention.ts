// src/lib/reading/attention.ts — the second reading: how loud the web was about each matter (2026-10-26).
//
// Read from Common Ground's committed day files (src/data/trending/<date>.json) over the round's
// window, by one disclosed rule, so anyone can count again from the same files:
//
//   · a SIGNAL names a matter when its label or the title of one of its links contains one of the
//     matter's terms as a whole word (case folded, diacritics stripped, hyphens read as spaces), and
//     none of the matter's exclusions (a term's known false friends: "hunger stones" are not hunger);
//     each signal counts once, however many terms it carries;
//   · a day is CONVERGED for a matter when one of that day's converging topics names it the same way.
//
// Every counted signal is kept as a receipt, so the page can show what a number was counted from.
// This is not the briefing's own count: the briefing counted raw occurrences in the files, which
// counts one signal once per field it appears in, and names no terms. The method sheet says so.
import type { TrendingDay } from '@/lib/trending/types'
import type { Matter, Round } from './round'

export interface AttentionReceipt {
  date: string
  source: string
  label: string
  url: string | null
}

export interface MatterAttention {
  matter: string
  /** signals in the window that name the matter */
  signals: number
  /** days in the window on which a converging topic named it */
  converged_days: number
  /** newest first */
  receipts: AttentionReceipt[]
}

export interface AttentionReading {
  window: { from: string; to: string }
  /** the committed days the window found — fewer than its length when a day file is missing */
  days: string[]
  matters: MatterAttention[]
}

/** Case folded, diacritics stripped, every dash and slash read as a space. */
export function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[\-‐-―_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** A test for "names one of these terms as a whole word". */
export function namer(terms: readonly string[]): (text: string) => boolean {
  const patterns = terms
    .map(fold)
    .filter(Boolean)
    .map((t) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(t)}(?![\\p{L}\\p{N}])`, 'u'))
  return (text) => {
    const f = fold(text)
    return patterns.some((p) => p.test(f))
  }
}

const textsOf = (label: string, links: readonly { title: string }[] | undefined): string[] => [label, ...(links ?? []).map((l) => l.title)]

/** What the count needs of a matter. */
type Counted = Pick<Matter, 'id' | 'terms' | 'exclude'>

function readMatter(m: Counted, days: readonly TrendingDay[]): MatterAttention {
  const includes = namer(m.terms)
  const excludes = namer(m.exclude ?? [])
  const names = (text: string): boolean => includes(text) && !excludes(text)
  const receipts: AttentionReceipt[] = []
  let converged = 0
  for (const day of days) {
    for (const [source, signals] of Object.entries(day.signals)) {
      for (const s of signals) {
        if (textsOf(s.label, s.links).some(names)) receipts.push({ date: day.date, source, label: s.label, url: s.url })
      }
    }
    if (day.topics.some((t) => textsOf(t.label, t.links).some(names) || t.signals.some((s) => names(s.label)))) converged++
  }
  receipts.sort((a, b) => b.date.localeCompare(a.date) || a.source.localeCompare(b.source) || a.label.localeCompare(b.label))
  return { matter: m.id, signals: receipts.length, converged_days: converged, receipts }
}

/** The attention reading of a round, from whichever committed days fall in its window. */
export function readAttention(round: { matters: readonly Counted[]; attention_window: Round['attention_window'] }, allDays: readonly TrendingDay[]): AttentionReading {
  const { from, to } = round.attention_window
  const days = allDays.filter((d) => d.date >= from && d.date <= to).sort((a, b) => a.date.localeCompare(b.date))
  return {
    window: { from, to },
    days: days.map((d) => d.date),
    matters: round.matters.map((m) => readMatter(m, days)),
  }
}

/** Signals per matter id, for comparisons ("which of two was louder"). */
export const signalsById = (a: AttentionReading): Record<string, number> => Object.fromEntries(a.matters.map((m) => [m.matter, m.signals]))
