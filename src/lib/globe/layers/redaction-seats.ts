// src/lib/globe/layers/redaction-seats.ts — what an institution took back, at the institution's
// own seat.
//
// /redaction's first chamber diffs the Wayback snapshots of a curated list of official pages every
// night and, on the days something was taken away, holds the removals with both versions linked.
// This layer puts one mark per institution that lost content on a day, at the seat that institution
// publishes from — the WHO's office in Geneva, the Census Bureau's in Suitland — and its value is
// the number of WORDS that institution lost that day, which is the figure /redaction prints beside
// every row of its ledger (src/lib/redaction/format.ts, `tokensLabel`).
//
// THE HONESTY RULE OF THIS LAYER: the mark is the SEAT OF an institution, never the place a page
// was written, hosted or read. A removal happens in a document, and a document has no coordinate;
// the one thing about it that stands somewhere on the earth is the body that published it and then
// did not. So every record carries `labelKind: 'seat'` outright — this layer has no station case at
// all, because a removal is never taken at an instrument — and the card, the plate's own <title>
// and the table all say "seat of" before they say anything else.
//
// Two smaller decisions, both visible in the words:
//   · An institution with several removals on one day is ONE mark, not several: they would stack on
//     the same point and read as one anyway. The value is the day's total for that institution, and
//     the locator names the LARGEST of them — the same rule /redaction uses to pick the day it
//     headlines — so the receipt leads to a specific row rather than to a group.
//   · The label is the watch-list's own, quoted and never translated. The list was written in
//     German and /redaction renders those labels unchanged on its English page; a globe that
//     silently re-worded them would be quoting a file it had edited.
//
// A night the watch found nothing is not an empty layer with nothing to say. It draws nothing and
// states, from the record's own counts, that the archive took nothing back across the pages it
// watched — which is a result, not a gap.
import { tokensLabel } from '@/lib/redaction/format'
import type { Redaction, RedactionData } from '@/lib/redaction/types'
import { redactionSeatFor, seatById, seatPoint } from '../seats'
import { archiveDays, dayPath, readDay, readJson } from './archive'
import { EMPTY_FRAME, type GlobeLayer, type LayerFrame, type LayerRecord } from './types'

const DIR = 'src/data/redaction'
const DAYS = archiveDays(DIR)
const NEWEST = DAYS[DAYS.length - 1]

const nf = new Intl.NumberFormat('en-GB')

/** What the two kinds of removal ARE, in the words /redaction uses for them: a `removal` strikes
 *  passages out of a page that is still there, a `deletion` is the whole page gone from the record. */
const KIND_WORDS: Readonly<Record<Redaction['kind'], string>> = Object.freeze({
  removal: 'passages struck out',
  deletion: 'the whole page gone from the record',
})

const READOUT = {
  mark: '{institution} · {words} taken back',
  place: 'the seat of the institution that published the page and then took part of it back — never where the page was written',
  caution:
    'a removal happens in a document and a document has no coordinate: the only thing about it standing anywhere on the earth is the body that published it',
  quiet: 'On this day the archive took nothing back across the {watched} pages it watched.',
  unverifiable: '{unverifiable} of the watched pages could not be verified at all and are counted, never diffed.',
  unplaced: 'The seat of {seats} carries no coordinate on Wikidata, so what it took back is stated and not drawn.',
}

/** The institutions that lost content on one day, each with its removals in the file's own order.
 *  Ascending by institution, so two builds group them the same way. */
export function byInstitution(redactions: readonly Redaction[]): Array<{ institution: string; rows: Array<{ index: number; row: Redaction }> }> {
  const groups = new Map<string, Array<{ index: number; row: Redaction }>>()
  redactions.forEach((row, index) => {
    const rows = groups.get(row.institution)
    if (rows) rows.push({ index, row })
    else groups.set(row.institution, [{ index, row }])
  })
  return [...groups.entries()]
    .map(([institution, rows]) => ({ institution, rows }))
    .sort((a, b) => a.institution.localeCompare(b.institution))
}

/** The removal a record leads to: the one that took the most words that day, and on a tie the one
 *  the file wrote first. The same rule /redaction picks its headline removal by. */
export function largestOf(rows: ReadonlyArray<{ index: number; row: Redaction }>): { index: number; row: Redaction } {
  return rows.reduce((best, entry) => (entry.row.removed_tokens > best.row.removed_tokens ? entry : best))
}

function wordsFor(institution: string, rows: ReadonlyArray<{ index: number; row: Redaction }>, total: number): string {
  const largest = largestOf(rows).row
  const one = `${largest.label} · ${KIND_WORDS[largest.kind]} · ${tokensLabel(largest.removed_tokens, 'en')}`
  if (rows.length === 1) return `${institution} · ${one}`
  return `${institution} · ${nf.format(rows.length)} removals · ${tokensLabel(total, 'en')} in all · the largest: ${one}`
}

function frameOf(day: string): LayerFrame {
  const data = readDay<RedactionData>(DIR, day, DAYS)
  if (!data) return EMPTY_FRAME(day)

  const file = dayPath(DIR, day)
  const notes: string[] = []
  const unverifiable = data.unverifiable?.count ?? 0
  if (unverifiable > 0) notes.push(READOUT.unverifiable.replace('{unverifiable}', nf.format(unverifiable)))

  if (data.redactions.length === 0) {
    notes.unshift(READOUT.quiet.replace('{watched}', nf.format(data.watched_count)))
    return EMPTY_FRAME(day, notes.join(' '))
  }

  const records: LayerRecord[] = []
  const unplaced: string[] = []

  for (const { institution, rows } of byInstitution(data.redactions)) {
    // an institution the seat table cannot place throws here, in the build, naming it — the globe
    // never draws one mark fewer than the archive holds
    const seatId = redactionSeatFor(institution)
    const seat = seatById(seatId)
    const at = seatPoint(seatId)
    if (!at) {
      if (!unplaced.includes(seat.label)) unplaced.push(seat.label)
      continue
    }
    const total = rows.reduce((sum, entry) => sum + entry.row.removed_tokens, 0)
    const largest = largestOf(rows)
    records.push({
      key: `redaction-seats:${day}:${seatId}`,
      at,
      value: total,
      // never seat.labelKind: a removal is never taken at an instrument, so this layer has no
      // station case, and saying so here rather than inheriting it keeps the claim explicit
      labelKind: 'seat',
      receipt: {
        file,
        locator: `redactions[${largest.index}] · ${largest.row.id}`,
        words: `${wordsFor(institution, rows, total)} — ${seat.label}`,
        url: largest.row.after.url,
      },
    })
  }

  if (unplaced.length > 0) notes.push(READOUT.unplaced.replace('{seats}', unplaced.join(', ')))
  return notes.length === 0 ? { day, records } : { day, records, note: notes.join(' ') }
}

const newest = readJson<RedactionData>(dayPath(DIR, NEWEST))

export const redactionSeatsLayer: GlobeLayer = {
  id: 'redaction-seats',
  title: 'Editorial Deadline, at the seats',
  kind: 'stations',
  owner: { line: 'counter-measurement' },
  asOf: newest.date,
  source: {
    file: `${DIR}/<day>.json`,
    name:
      `${newest.source.name} — one mark per institution that lost content that day, at the seat it publishes ` +
      'from; the value is the number of words it took back, and the mark is the seat of a body, never the place a page was written',
    url: 'https://frankbueltge.de/redaction',
    license: newest.source.license,
  },
  days: DAYS,
  frame: frameOf,
  readout: READOUT,
}
