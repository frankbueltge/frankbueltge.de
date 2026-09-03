// src/config/globe-wording.ts — every visitor-facing string of the living globe (G1, the room,
// 2026-09-03). The island, the room and the entrance frame own no words: they receive these.
//
// Three rules this file keeps, all three tested in globe-wording.test.ts:
//   · NO TYPED NUMBER. Anything with a count, a date or a day in it is a FUNCTION taking that
//     value as an argument, or a TEMPLATE with a named placeholder the island fills. A number
//     written into a sentence goes stale the next night, silently (docs/wording-kanon.md,
//     "Schwarze Liste"), and this globe's whole claim is that its numbers come from committed
//     files.
//   · THE ISLAND HALF IS PLAIN. Astro serialises an island's props to JSON, so a function cannot
//     cross that boundary: everything under `island` is a plain string or a `{placeholder}`
//     template, and the island's only arithmetic is choosing between a singular and a plural.
//     (The frame's half above it may use functions freely — it renders on the server.)
//   · A MARK IS SAID IN WORDS, NEVER IN A BARE PAIR OF COORDINATES. `placePhrase` renders the
//     record's own `labelKind` — the centroid of a polygon, the seat of an institution, the site
//     of an instrument, the point a transponder fell silent — because a card that prints two
//     numbers for all four lies about three of them.
import type { LabelKind, LayerRecord } from '@/lib/globe/layers/types'

const count = (n: number): string => new Intl.NumberFormat('en-GB').format(n)
const plural = (n: number, one: string, many: string): string => `${count(n)} ${n === 1 ? one : many}`

/** A count and its noun, as a pair of templates the island picks between on `{n}`. */
export interface PluralWording {
  one: string
  many: string
}

/** The phrases that turn a record's `labelKind` into a sentence. Compass letters are here rather
 *  than in the code because they are words a reader reads. */
export interface PlaceWording extends Record<LabelKind, string> {
  point: string
  seat: string
  centroid: string
  station: string
  gap: string
  /** a country resolved through the crosswalk, with no coordinate of its own in the record; its
   *  placeholder is `{code}` and not the code system's own name, because that name carries a digit
   *  and the digit guard is over the whole file, template placeholders included */
  country: string
  north: string
  south: string
  east: string
  west: string
}

export interface IslandWording {
  figureLabel: string
  status: { loading: string; live: string; still: string; noWebgl: string; failed: string }
  controls: {
    layersLabel: string
    layersHint: string
    dayLabel: string
    dayAria: string
    dayOf: string
    play: string
    pause: string
    playHint: string
    readMarks: string
    readMarksHint: string
    inFront: string
    loading: string
    failed: string
    empty: string
    on: string
    off: string
    provenance: string
    marks: PluralWording
    days: PluralWording
  }
  card: {
    label: string
    kindLabel: string
    layerLabel: string
    dayLabel: string
    placeLabel: string
    fileLabel: string
    close: string
    open: string
    prev: string
    next: string
    hint: string
    position: string
    kinds: Record<LabelKind, string>
  }
  place: PlaceWording
  readout: string
}

/** Fills `{name}` placeholders. The island carries its own copy of this three-line function; it is
 *  exported here so the frame can resolve the same templates on the server. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')
}

/** A coordinate pair as a reader says it — never the naked pair, always inside a phrase below. */
export function degrees(lon: number, lat: number, words: PlaceWording): string {
  const ns = lat >= 0 ? words.north : words.south
  const ew = lon >= 0 ? words.east : words.west
  return `${Math.abs(lat).toFixed(1)}°${ns}, ${Math.abs(lon).toFixed(1)}°${ew}`
}

/** What the mark stands for, in the record's own kind. The one sentence pattern the tables, the
 *  cards and the readout all share, so a reader learns it once. */
export function placePhrase(record: LayerRecord, words: PlaceWording): string {
  if (Array.isArray(record.at)) {
    const at = degrees(record.at[0], record.at[1], words)
    return fill(words[record.labelKind] ?? words.point, { at })
  }
  if ('from' in record.at) {
    return fill(words.gap, {
      from: degrees(record.at.from[0], record.at.from[1], words),
      to: degrees(record.at.to[0], record.at.to[1], words),
    })
  }
  return fill(words.country, { code: record.at.iso3 })
}

export const GLOBE = {
  // ── the sheet, rendered on the server ────────────────────────────────────────
  sheet: {
    kicker: 'COUNTER-MEASUREMENT',
    title: 'Living Globe',
    sub: 'One globe over everything this house measures on the earth — every mark carrying the file it came from and the day it was written.',
    badges: ['LIVE DATA', 'EXPERIMENT', 'COUNTER-MEASUREMENT'],
    caption: (day: string, marks: number, layers: number) =>
      `The newest day the archive holds (${day}): ${plural(marks, 'mark', 'marks')} from ${plural(layers, 'layer', 'layers')}. ` +
      'Switch a layer on or off, walk the day axis, point at a mark to read it — and the tables below carry all of them, ' +
      'with or without a browser that can draw a globe.',
    recordHeading: 'The record of this day',
    recordLead:
      'One table per layer, holding every mark the plate draws with the file and the locator it was read from. ' +
      'Nothing on this globe is reachable only by pointing at it.',
    tableSummary: (title: string, marks: number, day: string) =>
      `${title} — ${plural(marks, 'mark', 'marks')} on ${day}, as a table`,
    tableCaption: (title: string, day: string) =>
      `Every mark of the ${title} layer on ${day}, with the committed file each one was read from.`,
    tableProvenance: (file: string, name: string, license: string, href: string) =>
      `${file} · ${name} · ${license} · records at ${href}`,
    columns: { mark: 'Mark', where: 'Where it stands', read: 'Read from' },
    foot: (days: number, first: string, newest: string) =>
      `Built at build time from committed files only: ${plural(days, 'day', 'days')} of archive, from ${first} to ${newest}. ` +
      'The day axis is the union of the days the layers themselves hold, read from the archive’s own filenames — never from a clock. ' +
      'Country marks stand at the centroid of a country’s polygon and say so; an institution’s mark stands at its seat and says so; ' +
      'only a reading actually taken at a site is called a station.',
    footSources:
      'Geography: Natural Earth via world-atlas (public domain). Each layer’s own source, licence and as-of date stand beside it in the legend',
    links: {
      method: { label: 'method sheet', href: '/werke/globe' },
      manifest: { label: 'manifest', href: '/globe/layers.json' },
      experiments: { label: 'the other experiments', href: '/experiments' },
    },
  },

  // ── the plate's accessible name and description ──────────────────────────────
  floor: {
    title: 'The living globe',
    desc: (day: string, marks: number, layers: number) =>
      `Every layer of the archive on ${day}, on one equirectangular plate: ${plural(marks, 'mark', 'marks')} from ` +
      `${plural(layers, 'layer', 'layers')}, each carrying its own record, its file and its day.`,
    mark: (layerTitle: string, words: string, place: string) => `${layerTitle} · ${words} · ${place}`,
  },

  // ── the entrance's compact form ──────────────────────────────────────────────
  entrance: {
    floorTitle: 'The sky over the record',
    floorDesc: (day: string, marks: number, layers: number) =>
      `The archive on ${day}: ${plural(marks, 'mark', 'marks')} from ${plural(layers, 'layer', 'layers')} — ` +
      'the earth-observation fleet at the positions its elements were taken at, and the vessels that switched their transponder off, ' +
      'each drawn from where it went dark to where it came back.',
    more: { label: 'the whole globe →', href: '/globe' },
  },

  // ── the island: plain strings and templates only ─────────────────────────────
  island: {
    figureLabel: 'the living globe — every layer of the archive on one earth',
    status: {
      loading: 'the globe is loading',
      live: 'live · drag to turn, scroll to zoom, a mark opens its record',
      still: 'held still — you asked for reduced motion',
      noWebgl: 'no WebGL here — the plate stands, and every mark is in the tables below',
      failed: 'the globe did not load — the plate stands, and every mark is in the tables below',
    },
    controls: {
      layersLabel: 'The layers',
      layersHint:
        'One layer stands in front and wears its own colour; the others hold their places in mono ink. The last one you switch on is the one in front.',
      dayLabel: 'The day',
      dayAria: 'the day the globe draws',
      dayOf: '{day} · {index} of {of}',
      play: 'walk the days',
      pause: 'hold',
      playHint: 'a day a second, from here to the newest',
      readMarks: 'read the marks',
      readMarksHint: 'opens the first mark of the layer in front; the arrow keys walk the rest',
      inFront: 'in front',
      loading: 'fetching this layer’s records',
      failed: 'this layer’s records did not load — its table below still holds them',
      empty: 'nothing on this day',
      on: '{title}, switch off',
      off: '{title}, switch on',
      provenance: '{file} · as of {asOf} · {marks} on this day',
      marks: { one: '{n} mark', many: '{n} marks' },
      days: { one: '{n} day on file', many: '{n} days on file' },
    },
    card: {
      label: 'a mark of the {layer} layer',
      kindLabel: 'Kind',
      layerLabel: 'Layer',
      dayLabel: 'Day',
      placeLabel: 'What the mark is',
      fileLabel: 'Read from',
      close: 'close',
      open: 'the source →',
      prev: 'previous mark',
      next: 'next mark',
      hint: 'the arrow keys walk this layer’s marks, escape closes',
      position: '{index} of {of} in {layer}',
      kinds: {
        point: 'a point the record itself carries',
        seat: 'the address a reading is published from, not the place it was taken',
        centroid: 'the middle of a country’s polygon, standing for the whole country',
        station: 'an instrument at its own site — the one case where the mark is the measurement',
        gap: 'where a record stopped and where it resumed; the line between them is the shortest path, never the path taken',
      },
    },
    place: {
      point: 'over {at}',
      seat: 'seat of the body that publishes it, at {at}',
      centroid: 'centroid of a country, at {at}',
      station: 'station at {at}',
      gap: 'gap from {from} to {to}',
      country: 'centroid of the country {code}',
      north: 'N',
      south: 'S',
      east: 'E',
      west: 'W',
    },
    readout: '{layer} · {words} · {place}',
  } satisfies IslandWording,
}
