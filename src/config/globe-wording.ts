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
  /** a country resolved through the crosswalk, with no coordinate of its own in the record. Its
   *  placeholder is `{name}`: until G3's second evening it was the alpha-3 code, and the card read
   *  "centroid of the country QAT" at a reader with no way of knowing that meant Qatar. The record
   *  now carries the crosswalk's own name beside the code, so the phrase can say the country */
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
  return fill(words.country, { name: record.at.name })
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

  // ── the guided stories (G2, 2026-09-03) ─────────────────────────────────────
  //
  // The same division every tour on this site keeps (src/lib/tour/field-gauntlet.ts): the FRAME is
  // here — the room's own heading, each story's title and standfirst, and every scene's kicker,
  // heading and lead. It says what a reader is about to read and makes no claim of its own; it
  // carries no count, no date and no coordinate, and the digit guard above proves it. The
  // SUBSTANCE is every quote in src/lib/tour/globe-stories.ts, byte-exact from a committed file
  // and checked against the real filesystem by that module's own test.
  stories: {
    heading: 'Guided stories',
    lead:
      'Three readings of this archive. A story asks the globe for a set of layers, a night and a place to stand, ' +
      'and the last scene of two of them opens the card on one mark. Scroll, and the globe follows the scene you ' +
      'are reading; take hold of the sphere and it stays where you put it until the next scene asks for a new view. ' +
      'Every sentence in quotation marks is a sentence out of a committed file, at the position named beneath it.',
    hint:
      'Without JavaScript — and where you asked for reduced motion, or where the pointer is coarse on a short ' +
      'screen — each story reads as an ordinary article with previous and next buttons instead of the scroll, and ' +
      'the plate, the legend and the tables above and below it stand unchanged.',

    fleet: {
      title: 'A night of the ghost fleet',
      standfirst:
        'One night out of the vessel record, read from the file it was written into: what the night examined, the ' +
        'longest silence in it, where that silence began and ended — and what the line drawn between the two ends ' +
        'does not claim.',
      scenes: {
        night: {
          kicker: 'THE NIGHT AS IT WAS WRITTEN',
          heading: 'One night, and how much it looked at',
          lead:
            'Before any vessel is named, the night’s own file says how much it examined and where the silences fell: ' +
            'inside somebody’s exclusive economic zone, or out on the high seas where nobody’s rules reach.',
        },
        pick: {
          kicker: 'THE LONGEST SILENCE',
          heading: 'The gap the night itself picked out',
          lead:
            'Every night’s file names one event as its pick, and on this night the pick is also the longest gap in ' +
            'it. The vessel’s own row says who fell quiet, under which flag, and for how long.',
        },
        off: {
          kicker: 'WHERE THE RECORD STOPS',
          heading: 'The point the transponder fell silent',
          lead:
            'The first of the two coordinates a gap carries. It is not where the vessel was going and not where it ' +
            'was: it is the last place it was visible, and the waters it was in when it stopped being so.',
        },
        on: {
          kicker: 'WHERE THE RECORD RESUMES',
          heading: 'The point it spoke again, and the two ends of the silence',
          lead:
            'The second coordinate, with the timestamps the record puts on either end. What sits between them is ' +
            'precisely what nobody holds — not this house, not the source, not the fleet’s own registry.',
        },
        arc: {
          kicker: 'WHAT THE ARC DOES NOT SAY',
          heading: 'A line between two points, and no claim about the way',
          lead:
            'The globe draws the shortest path between the two ends, because a great circle is the one line that ' +
            'invents nothing. The method sheet says what that costs, and the card on the mark says it again.',
        },
      },
    },

    sky: {
      title: 'The sky over the reader',
      standfirst:
        'The fleet that photographs the earth, drawn where it is at this moment — over a vantage that is not yours. ' +
        'This globe reads no location of anybody looking at it: it stands over one address on file, and the row ' +
        'that places that address names the item it was taken from.',
      scenes: {
        instant: {
          kicker: 'THE ONE MOMENT ON THIS GLOBE',
          heading: 'Elements, not a night',
          lead:
            'The archive keeps the fleet’s current orbital elements and no set per past night. So this layer draws ' +
            'on one day only — the day its elements were taken — and on that day it moves, which is the single ' +
            'declared exception to a globe where everything else stands still at the night it was written.',
        },
        vantage: {
          kicker: 'A VANTAGE, NOT A LOCATION',
          heading: 'The house’s own window, and it is fixed',
          lead:
            'Nothing here asks where you are. No location of the visitor is read, requested, inferred or guessed: ' +
            'the ground point this scene looks down on is a seat out of the archive’s own list of addresses, put ' +
            'there by a coordinate somebody else published, with the rule that placed it written beside it.',
        },
        named: {
          kicker: 'WHAT PASSES OVER IT',
          heading: 'Named instruments, and who is named as holding them',
          lead:
            'Every point on this layer is a satellite with a name and a catalogue entry, and where the second ' +
            'source carries an owner the card says the owner. Two of them fly as a pair over the same ground, and ' +
            'the same house is named for both.',
        },
        empty: {
          kicker: 'THE EXCEPTION, KEPT WHERE IT WAS DECLARED',
          heading: 'Why every other night of this layer is empty',
          lead:
            'Scrub one night back and this layer draws nothing at all, and states its reason in its own words. ' +
            'Propagating tonight’s orbits into a past night would produce hundreds of confident points nobody ' +
            'ever observed — smooth, plausible, and made up.',
        },
      },
    },

    minutes: {
      title: 'The planet’s minutes',
      standfirst:
        'Readings taken by nobody in this house and published by somebody: a season of nightly minutes, walked from ' +
        'the first night on file to the last night this story was written from. Each reading stands where it is ' +
        'published from — and exactly one of them stands where it was measured.',
      scenes: {
        first: {
          kicker: 'THE FIRST NIGHT ON FILE',
          heading: 'Where the minutes begin',
          lead:
            'The oldest night the whole archive holds. The carbon-dioxide reading comes off a mountain in the ' +
            'Pacific, which makes it the one mark on this layer standing where the measuring actually happened — ' +
            'and the file notes, in its own field, that the reading set a record.',
        },
        hole: {
          kicker: 'THE NIGHT A SOURCE DID NOT ANSWER',
          heading: 'A hole that is allowed to stay a hole',
          lead:
            'One reading could not be taken. It is not zeroed, not carried over from the night before and not ' +
            'quietly dropped: the minutes keep the error the source returned, the globe draws nothing where that ' +
            'reading would have stood, and the layer counts what it did not draw.',
        },
        ice: {
          kicker: 'THE ICE AT BOTH ENDS',
          heading: 'Two hemispheres, one address',
          lead:
            'The northern and the southern ice are read by the same body, so both marks stand on the same office in ' +
            'the mountains of Colorado. Halfway through a season in which the two readings walk in opposite ' +
            'directions, that is worth saying out loud: the mark is an address, not an ice edge.',
        },
        older: {
          kicker: 'A NUMBER OLDER THAN THE NIGHT',
          heading: 'The date a reading is as of',
          lead:
            'A monthly index published out of an office in Rome sits inside a nightly file, so the night carries a ' +
            'number that is months old — and says so, on the row, in a field of its own. A seat is an address, ' +
            'never a measurement site.',
        },
        last: {
          kicker: 'THE LAST NIGHT THIS STORY WALKS',
          heading: 'The same reading, a season later',
          lead:
            'Back to the mountain, with the year-ago comparison the file carries beside the reading. The card that ' +
            'opens here holds the committed file and the position inside it, which is the only thing this globe ' +
            'has ever asked to be believed on.',
        },
      },
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
      country: 'centroid of {name}',
      north: 'N',
      south: 'S',
      east: 'E',
      west: 'W',
    },
    readout: '{layer} · {words} · {place}',
  } satisfies IslandWording,
}
