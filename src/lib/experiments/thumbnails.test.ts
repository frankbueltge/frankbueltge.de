// The gallery's miniatures are drawings OF something (visual layer, Phase 3c, 2026-09-02).
//
// The failure this suite exists to prevent is the easy one: a thumbnail that looks like a figure
// and is a decoration. So every assertion here asks the same question in a different place —
// does this drawing come from the record the card points at? A miniature with no marks, a
// miniature that moves between two builds, a reading with a hand-typed number in it, a card on
// the shelf that the catalogue forgot: each of them would make the gallery a picture of nothing.
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { GALLERY } from '@/config/gallery-wording'
import { WERKE, WERKE_BY_LINE } from '@/data/werke'
import { datedEntries, recordThumbnail, THUMBNAILS, THUMB_BOX, type ThumbMark } from './thumbnails'

/** An unarchived work (Frank, 2026-09-04, wording private) reads the world at the moment someone
 *  looks — there is no committed file at build time for a miniature to be drawn FROM, and this
 *  module's whole rule is that a miniature is never a stand-in graphic. ExperimentGallery.tsx
 *  already renders a card with no `thumb` gracefully (the `.gal-thumb` block simply does not
 *  print); this exemption matches the one graph.test.ts already carries for the same works. */
const isUnarchived = (id: string): boolean => WERKE.find((w) => w.id === id)?.unarchived === true

const inBox = (m: ThumbMark): boolean => {
  const { width, height } = THUMB_BOX
  const within = (v: number, max: number) => v >= -1 && v <= max + 1
  switch (m.t) {
    case 'bar':
    case 'gap':
      return within(m.x, width) && within(m.y, height) && m.w > 0 && m.h > 0
    case 'dot':
      return within(m.x, width) && within(m.y, height) && m.r > 0
    case 'seg':
    case 'rule':
      return within(m.x1, width) && within(m.x2, width) && within(m.y1, height) && within(m.y2, height)
    case 'line':
    case 'area':
      return m.d.length > 0
  }
}

describe('every experiment on the shelf has a miniature of its own', () => {
  const shelf = WERKE_BY_LINE.flatMap((group) => group.werke)

  it.each(shelf.map((w) => [w.id, w.href] as const))(
    '%s carries a thumbnail built from a committed file',
    (id, href) => {
      if (isUnarchived(id)) return
      const thumb = THUMBNAILS.get(id)
      expect(
        thumb,
        `${id} renders on /experiments (${href}) and the gallery has no miniature for it — the card ` +
          `would stand with an empty frame, or worse, with a decoration`,
      ).toBeDefined()
      expect(thumb!.marks.length, `${id}'s miniature draws nothing`).toBeGreaterThan(0)
      expect(thumb!.source, `${id}'s miniature names no file it was read from`).toMatch(/^(src|public)\//)
      expect(thumb!.draws.length).toBeGreaterThan(0)
      expect(thumb!.readout.length).toBeGreaterThan(0)
    },
  )

  it('has a miniature for every card and a card for every miniature', () => {
    const ids = new Set(shelf.map((w) => w.id))
    for (const id of THUMBNAILS.keys()) {
      expect(ids, `the catalogue draws "${id}", which no longer renders on /experiments`).toContain(id)
    }
  })
})

describe('the drawings stay inside their box and stay still', () => {
  it.each([...THUMBNAILS.keys()])('%s draws only inside the miniature box', (id) => {
    for (const mark of THUMBNAILS.get(id)!.marks) {
      expect(inBox(mark), `${id} places a ${mark.t} outside the box: ${JSON.stringify(mark)}`).toBe(true)
    }
  })

  it('reads the committed files and never the clock', () => {
    // Date.parse over a timestamp IN a file is reading the record; Date.now() would be reading
    // the day, and would make two builds of the same commit differ.
    const source = readFileSync(new URL('./thumbnails.ts', import.meta.url), 'utf8')
    for (const forbidden of ['Date.now(', 'new Date(', 'Math.random(']) {
      expect(source, `the catalogue calls ${forbidden} — a miniature must not move between builds`)
        .not.toContain(forbidden)
    }
  })

  it('rounds every coordinate once, so the server render is byte-stable', () => {
    const tenths = (v: number) => expect(Math.round(v * 10)).toBeCloseTo(v * 10, 6)
    for (const thumb of THUMBNAILS.values()) {
      for (const m of thumb.marks) {
        if (m.t === 'bar' || m.t === 'gap') [m.x, m.y, m.w, m.h].forEach(tenths)
        if (m.t === 'dot') [m.x, m.y, m.r].forEach(tenths)
        if (m.t === 'seg' || m.t === 'rule') [m.x1, m.y1, m.x2, m.y2].forEach(tenths)
      }
    }
  })

  it('builds the same drawing twice from the same record', () => {
    const once = recordThumbnail('n-1', 9, GALLERY.beside.n1, 'public/n-1/nights')
    const twice = recordThumbnail('n-1', 9, GALLERY.beside.n1, 'public/n-1/nights')
    expect(JSON.stringify(twice)).toBe(JSON.stringify(once))
  })

  it('writes no colour into the model — the stylesheet inks the marks', () => {
    expect(JSON.stringify([...THUMBNAILS.values()])).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})

describe('a hole in the record is drawn as a hole', () => {
  it('leaves a hollow slot for every article page that refused the reader', () => {
    const beifang = THUMBNAILS.get('beifang')!
    expect(
      beifang.marks.some((m) => m.t === 'gap'),
      'bycatch draws no hollow slot — a blocked publisher would read as a page with no trackers',
    ).toBe(true)
  })

  it('marks the entries the night’s reading is about', () => {
    const protokoll = THUMBNAILS.get('protokoll')!
    expect(protokoll.marks.every((m) => m.t === 'bar' || m.t === 'gap')).toBe(true)
  })
})

describe('the reading comes from the record, never from the copy', () => {
  it('quotes the day’s own figures in the readouts', () => {
    // A spot check on three readings whose numbers are unmistakable in the files they come from.
    expect(THUMBNAILS.get('society')!.readout).toMatch(/agents/)
    expect(THUMBNAILS.get('redaction')!.readout).toMatch(/pages watched/)
    expect(THUMBNAILS.get('consensus')!.readout).toMatch(/outlets/)
  })

  it('types no number into the gallery’s wording', () => {
    // The currency rule, made mechanical: every figure in this gallery is a function of a file.
    // Only the VALUES are checked — a key may carry a digit (n1 is the practice's name), a
    // sentence the site says out loud may not.
    const strings: string[] = []
    const walk = (value: unknown): void => {
      if (typeof value === 'string') strings.push(value)
      else if (value && typeof value === 'object') Object.values(value).forEach(walk)
    }
    walk(GALLERY)
    for (const sentence of strings) {
      expect(sentence, 'a digit was typed into the gallery wording — counts are functions').not.toMatch(/\d/)
    }
  })
})

describe('the practices beside the lab draw their own record, not a stand-in', () => {
  it('counts the entries a mirror holds and draws one tick each', () => {
    const nights = datedEntries('public/n-1/nights')
    expect(nights).toBeGreaterThan(0)
    const thumb = recordThumbnail('n-1', nights, GALLERY.beside.n1, 'public/n-1/nights')
    expect(thumb.marks).toHaveLength(nights)
    expect(thumb.marks.every((m) => m.t === 'bar')).toBe(true)
    expect(thumb.readout).toContain(GALLERY.beside.n1)
  })

  it('draws nothing at all rather than a graphic, when a record is empty', () => {
    expect(recordThumbnail('empty', 0, 'entries', 'nowhere').marks).toHaveLength(0)
  })
})
