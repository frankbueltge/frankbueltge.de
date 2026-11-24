// The weeks build on each other: the page's names for the devices held to the renderer's rule
// (scripts/ill-tempered-week/itw/progression.py), and every album on file that builds on another held to that rule.
// These tests also run in the nightly press before a pressing is committed, so each states what any correct pressing
// satisfies.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { readAlbums, type Album, type Device, type Progression } from './albums'
import { contrapunctus, DEVICES, devicesText, DOES, list, OF_VERDICT, progressionText, WHY } from './progression'

const RULE = readFileSync('scripts/ill-tempered-week/itw/progression.py', 'utf8')
const RENDERERS = {
  overlooked: readFileSync('scripts/ill-tempered-week/itw/overlooked.py', 'utf8'),
  unison: readFileSync('scripts/ill-tempered-week/itw/unison.py', 'utf8'),
  turn: readFileSync('scripts/ill-tempered-week/itw/turn.py', 'utf8'),
}
const albums = readAlbums()

describe('the rule, as the page names it', () => {
  it('runs through the devices in the renderer’s order and asks for the renderer’s device for each verdict', () => {
    expect(RULE).toContain(`DEVICES = (${DEVICES.map((d) => `'${d}'`).join(', ')})`)
    expect(RULE).toContain(`OF_VERDICT = {${Object.entries(OF_VERDICT).map(([v, d]) => `'${v}': '${d}'`).join(', ')}}`)
  })

  it('says what every device does in every piece, and each renderer describes every device', () => {
    for (const [piece, source] of Object.entries(RENDERERS)) {
      for (const d of DEVICES) {
        expect(source, `${piece}: ${d}`).toMatch(new RegExp(`^ {4}${d} {2,}\\S`, 'm'))
        expect(DOES[piece as keyof typeof DOES][d].length, `${piece}: ${d}`).toBeGreaterThan(20)
      }
    }
    for (const v of ['break', 'held', 'handover', 'mosaic', 'standing'] as const) expect(WHY[v].length).toBeGreaterThan(10)
  })

  it('writes a list and an album’s name', () => {
    expect(list(['stretto'])).toBe('stretto')
    expect(list(['stretto', 'inversion', 'diminution'])).toBe('stretto, inversion and diminution')
    expect(contrapunctus('2026-W47')).toBe('Contrapunctus 47')
    expect(contrapunctus('2027-W01')).toBe('Contrapunctus 1')
  })
})

const progression = (over: Partial<Progression>): Progression => ({
  cycle: 1, step: 0, from: '2026-W47', taken_over: [], verdict: null, asked: null, added: null, devices: [], second: null, ...over,
})

describe('an album’s place in its cycle, in words', () => {
  it('says nothing for an album pressed before the weeks built on each other', () => {
    expect(progressionText({})).toBeNull()
  })

  it('tells the first album under the rule what it took over, before and after its week is complete', () => {
    expect(progressionText({ progression: progression({}) })).toBe(
      'Cycle 1. Contrapunctus 47 was pressed before the weeks built on each other and hands on no device, so this album begins the first cycle. Until its week is complete it plays no device, and with the seventh day the week’s character chooses the one it adds, which then stays in every album after it until the cycle is complete.',
    )
    expect(progressionText({ progression: progression({ step: 1, verdict: 'mosaic', asked: 'stretto', added: 'stretto', devices: ['stretto'] }) })).toBe(
      'Cycle 1, step 1 of 6. Contrapunctus 47 was pressed before the weeks built on each other and hands on no device, so this album begins the first cycle; it adds stretto, because the story leading the web’s attention kept changing.',
    )
  })

  it('names the devices an album keeps, and the next in the order where its week asked for one in force', () => {
    const p = progression({ from: '2026-W48', taken_over: ['stretto'], step: 2, verdict: 'mosaic', asked: 'stretto', added: 'inversion', devices: ['stretto', 'inversion'] })
    expect(progressionText({ progression: p })).toBe(
      'Cycle 1, step 2 of 6. It keeps the device of Contrapunctus 48, stretto, and adds inversion, because the story leading the web’s attention kept changing, which asks for stretto; that was already in force, so the next in the order comes in.',
    )
    expect(progressionText({ progression: { ...p, verdict: null, asked: null, added: null, step: 1, devices: ['stretto'] } })).toContain('until its week is complete it plays that device')
  })

  it('begins the next cycle after a complete one', () => {
    const p = progression({ cycle: 2, from: '2026-W53', step: 1, verdict: 'held', asked: 'augmentation', added: 'augmentation', devices: ['augmentation'] })
    expect(progressionText({ progression: p })).toBe(
      'Cycle 2, step 1 of 6. Contrapunctus 53 completed cycle 1, so this album begins cycle 2; it adds augmentation, because one story held the web’s attention all week.',
    )
  })

  it('says what a piece’s devices do, and whose motif the second subject is', () => {
    expect(devicesText('overlooked', { devices: [] })).toBeNull()
    expect(devicesText('turn', undefined)).toBeNull()
    expect(devicesText('unison', { devices: ['stretto'] })).toBe(`This album’s device in Unison: stretto: ${DOES.unison.stretto}.`)
    const second = { week: '2026-W47', day: '2026-11-22', field: 'nature', text: 't', instrument: 'FluteSusVib', eighths: 8, motif: [] }
    const text = devicesText('overlooked', { devices: ['stretto', 'second subject'], second })!
    expect(text).toContain('This album’s 2 devices in Overlooked')
    expect(text).toContain('the motif Contrapunctus 47 ended on, Sunday’s, from nature, air and water')
  })
})

// ---------------------------------------------------------------------------------------------------------------
// Every album on file that builds on another, held to the rule (a port of progression.plan, for the check only)
// ---------------------------------------------------------------------------------------------------------------

const previous = (all: Album[], week: string): Album | undefined => all.filter((a) => a.week < week && a.complete).at(-1)

function expected(all: Album[], a: Album): { cycle: number; have: Device[]; from: string | null } {
  const prev = previous(all, a.week)
  const p = prev?.progression
  if (!p) return { cycle: 1, have: [], from: prev?.week ?? null }
  if (p.devices.length >= DEVICES.length) return { cycle: p.cycle + 1, have: [], from: prev!.week }
  return { cycle: p.cycle, have: [...p.devices], from: prev!.week }
}

describe('every album on file that builds on the one before', () => {
  const ruled = albums.filter((a) => a.progression)
  it.runIf(ruled.length === 0)('(none on file yet)', () => expect(ruled).toHaveLength(0))

  for (const a of ruled) {
    describe(a.title, () => {
      const p = a.progression!

      it('takes over the devices of the newest complete album before it, and its cycle', () => {
        const e = expected(albums, a)
        expect(p.from).toBe(e.from)
        expect(p.cycle).toBe(e.cycle)
        expect(p.taken_over).toEqual(e.have)
      })

      it('adds one device exactly when its week is complete: the verdict’s own, else the next in the order', () => {
        expect(p.added !== null).toBe(a.complete)
        expect(p.verdict !== null).toBe(a.complete)
        if (p.added) {
          const asked = OF_VERDICT[p.verdict!] ?? null
          expect(p.asked).toBe(asked)
          expect(p.taken_over).not.toContain(p.added)
          if (asked && !p.taken_over.includes(asked) && (asked !== 'second subject' || p.from !== null)) expect(p.added).toBe(asked)
          else expect(p.added).toBe(DEVICES.find((d) => !p.taken_over.includes(d) && (d !== 'second subject' || p.from !== null)))
        }
        expect(p.devices).toEqual([...p.taken_over, ...(p.added ? [p.added] : [])])
        expect(p.step).toBe(p.devices.length)
        expect(p.verdict === null || p.verdict === a.character?.verdict).toBe(true)
      })

      it('plays its devices in every piece, and takes the second subject from the album it builds on', () => {
        for (const piece of Object.values(a.pieces)) expect((piece as { devices?: Device[] }).devices ?? []).toEqual(p.devices)
        if (p.devices.includes('second subject')) {
          expect(p.second?.week).toBe(p.from)
          expect(p.second!.motif.length).toBeGreaterThan(0)
          for (const piece of Object.values(a.pieces)) expect((piece as { second?: unknown }).second).toEqual(p.second)
        } else {
          expect(p.second).toBeNull()
        }
        expect(a.character?.form ?? 'standing').toBe('standing')
      })
    })
  }
})
