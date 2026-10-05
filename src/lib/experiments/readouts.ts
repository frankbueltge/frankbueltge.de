// src/lib/experiments/readouts.ts — the reading of the day, per experiment, composed from ONE record.
//
// Two surfaces state the same reading since 2026-10-05: the gallery's card on /experiments
// (thumbnails.ts, which reads each experiment's newest file) and the signal log on the entrance
// (src/lib/ops/live-sources.ts, which reads every dated file of the same archive). One composer per
// experiment, here, so a reading cannot be worded one way on the shelf and another in the log.
//
// Every composer takes the parsed record and returns null when the record does not carry what the
// sentence needs. An archive's oldest days were written under earlier schemas — the Protocol's
// first nights kept no index, Bycatch's first runs measured from two vantages that no longer exist
// — and a field that is missing must never be read as a zero: "0 pages measured" would be a
// finding the record never made. The wording is GALLERY.readouts; every figure is the record's.

import { GALLERY } from '@/config/gallery-wording'

const R = GALLERY.readouts

/** Thousands-separated integer, en-GB — the gallery's and the ops room's one way of counting. */
export const count = (n: number): string => new Intl.NumberFormat('en-GB').format(Math.round(n))
export const decimal = (n: number, digits = 2): string =>
  new Intl.NumberFormat('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
export const percent = (share: number): string =>
  new Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 0 }).format(share)
/** A calendar year is a name, not a quantity: 1998, never "1,998" (which `count` would print — and
 *  did, on two cards, until this module took the composition over on 2026-10-05). */
export const year = (n: number): string => String(Math.round(n))

type Rec = Record<string, unknown>
const obj = (v: unknown): Rec | null => (v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Rec) : null)
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim().length > 0 ? v : null)
const list = (v: unknown): unknown[] | null => (Array.isArray(v) ? v : null)
/** The value at a path through nested objects, or undefined where the path breaks. */
const at = (v: unknown, ...path: string[]): unknown => path.reduce<unknown>((o, k) => obj(o)?.[k], v)

/** The experiments whose reading is a function of one committed record — the ids of werke.ts. */
export type ReadoutId =
  | 'protokoll'
  | 'beifang'
  | 'trending'
  | 'round-number'
  | 'tell'
  | 'redaction'
  | 'pattern'
  | 'praemie'
  | 'parallaxe'
  | 'consensus'
  | 'invoked-past'
  | 'balance'
  | 'correction'
  | 'ghost-fleet'

export const READOUTS: Record<ReadoutId, (record: unknown) => string | null> = {
  /** the night's entries, and how many of them worsened — absent before the index existed */
  protokoll(day) {
    const entries = list(at(day, 'entries'))
    const worsened = num(at(day, 'index', 'worsened'))
    return entries && worsened !== null ? R.protokoll(count(entries.length), count(worsened)) : null
  },

  /** pages measured and pages that refused — read from the automat vantage, the only one the
   *  current runs keep; a run without it was measured differently and states nothing here */
  beifang(run) {
    const results = list(at(run, 'vantages', 'automat', 'results'))
    if (!results) return null
    const blocked = results.filter((r) => typeof obj(r)?.third_party_requests !== 'number').length
    return R.beifang(count(results.length - blocked), count(blocked))
  },

  /** topics converging, and the fewest platforms any of them ran on */
  trending(day) {
    const converging = num(at(day, 'summary', 'converging'))
    const topics = list(at(day, 'topics'))
    if (converging === null || !topics) return null
    const platforms = Math.min(...topics.map((t) => num(obj(t)?.platform_count) ?? Infinity), Infinity)
    return R.trending(count(converging), count(Number.isFinite(platforms) ? platforms : 0))
  },

  /** the day's defendant and the verdict the pipeline wrote — never re-derived here */
  'round-number'(record) {
    const pick = str(at(record, 'pick'))
    const picked = (list(at(record, 'series')) ?? []).map(obj).find((s) => s !== null && s.id === pick) ?? null
    const name = str(picked?.name)
    const verdict = str(at(picked, 'benford', 'verdict'))
    return name && verdict ? R['round-number'](name, verdict) : null
  },

  tell(record) {
    const word = str(at(record, 'headline', 'word'))
    const fold = num(at(record, 'headline', 'fold'))
    return word && fold !== null ? R.tell(word, decimal(fold, 1)) : null
  },

  redaction(record) {
    const watched = num(at(record, 'watched_count'))
    const changed = num(at(record, 'changed_count'))
    return watched !== null && changed !== null ? R.redaction(count(watched), count(changed)) : null
  },

  pattern(record) {
    const a = str(at(record, 'headline', 'a_label', 'en'))
    const b = str(at(record, 'headline', 'b_label', 'en'))
    const r = num(at(record, 'headline', 'r'))
    return a && b && r !== null ? R.pattern(a, b, decimal(r, 2)) : null
  },

  praemie(record) {
    const base = num(at(record, 'premium', 'base_year'))
    const change = num(at(record, 'premium', 'change_pct_since_base'))
    return base !== null && change !== null ? R.praemie(year(base), percent(change / 100)) : null
  },

  parallaxe(record) {
    const topics = list(at(record, 'topics'))
    const mean = num(at(record, 'mean_omission_index'))
    return topics && mean !== null ? R.parallaxe(count(topics.length), decimal(mean, 2)) : null
  },

  consensus(record) {
    const outlets = num(at(record, 'headline', 'domain_count'))
    const hours = num(at(record, 'headline', 'span_hours'))
    return outlets !== null && hours !== null ? R.consensus(count(outlets), decimal(hours, 1)) : null
  },

  'invoked-past'(record) {
    const invoked = num(at(record, 'headline', 'year'))
    const times = num(at(record, 'headline', 'times_its_neighbourhood'))
    return invoked !== null && times !== null ? R['invoked-past'](year(invoked), decimal(times, 1)) : null
  },

  balance(record) {
    const country = str(at(record, 'headline', 'name'))
    const gap = num(at(record, 'headline', 'gap'))
    return country && gap !== null ? R.balance(country, decimal(gap, 1)) : null
  },

  correction(record) {
    const down = num(at(record, 'systematic', 'revised_down'))
    const months = num(at(record, 'systematic', 'months'))
    return down !== null && months !== null ? R.correction(count(down), count(months)) : null
  },

  /** the picked vessel (the first, where the record names none) and its hours dark */
  'ghost-fleet'(record) {
    const events = (list(at(record, 'events')) ?? []).map(obj).filter((e): e is Rec => e !== null)
    const pick = str(at(record, 'pick'))
    const picked = events.find((e) => e.id === pick) ?? events[0]
    const vessel = str(at(picked, 'vessel', 'name'))
    const hours = num(picked?.duration_hours)
    return vessel && hours !== null ? R['ghost-fleet'](vessel, count(hours)) : null
  },
}
