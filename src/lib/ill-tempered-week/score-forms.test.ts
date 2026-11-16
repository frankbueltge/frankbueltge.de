// The scores of the forms the week chose, held to the renderers they mirror and to records those renderers wrote
// (fixtures/: weeks 42 to 46 pressed locally in each form on 2026-11-16; week 46's handover with its leads set by hand,
// since no week of the ten measured was a handover).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import type { OverlookedForm, TurnForm, UnisonForm } from './albums'
import { describeForm, FORM, hitForm, layoutForm, nowForm, overlookedFormScore, turnFormScore, unisonFormScore } from './score-forms'

const here = 'src/lib/ill-tempered-week'
const fixture = <T,>(name: string): T => JSON.parse(readFileSync(join(here, 'fixtures', `form-${name}.json`), 'utf8')) as T
const UNISON = readFileSync('scripts/ill-tempered-week/itw/forms_unison.py', 'utf8')
const TURN = readFileSync('scripts/ill-tempered-week/itw/forms_turn.py', 'utf8')
const OVERLOOKED = readFileSync('scripts/ill-tempered-week/itw/forms_overlooked.py', 'utf8')

const unisons: [string, UnisonForm][] = ['2026-W42-unison-held', '2026-W43-unison-mosaic', '2026-W44-unison-break', '2026-W46-unison-handover'].map((n) => [n, fixture<UnisonForm>(n)])
const overlookeds: [string, OverlookedForm][] = ['2026-W42-overlooked-held', '2026-W43-overlooked-mosaic', '2026-W44-overlooked-break', '2026-W46-overlooked-handover'].map((n) => [n, fixture<OverlookedForm>(n)])
const turns: [string, TurnForm][] = ['2026-W42-turn-held', '2026-W43-turn-mosaic', '2026-W44-turn-break', '2026-W46-turn-handover'].map((n) => [n, fixture<TurnForm>(n)])

describe('the renderers’ fixed times', () => {
  it('match itw/forms_unison.py', () => {
    expect(UNISON).toContain(`HELD_DAY_S = ${FORM.heldDay.toFixed(1)}`)
    expect(UNISON).toContain(`HELD_GLIDE_S = ${FORM.heldGlide}`)
    expect(UNISON).toContain(`HELD_RELEASE_S = ${FORM.heldRelease.toFixed(1)}`)
    expect(UNISON).toContain(`SAID_AFTER_S = ${FORM.saidAfter.toFixed(1)}`)
    expect(UNISON).toContain(`BRASS_AFTER_S = ${FORM.brassAfter.toFixed(1)}`)
    expect(UNISON).toContain(`note(hz, HELD_DAY_S * 0.8, int(30 + 70 * d['agreement']), release=${FORM.brassRelease}`)
    expect(UNISON).toContain(`note(hz, 7.0, vel=72, release=2.5`)
    expect(FORM.pedalNote).toBe(7.0 + 2.5)
    expect(UNISON).toContain(`t += ${FORM.pedalStep}`)
    expect(UNISON).toContain(`put(said, t + ${FORM.mosaicSaidAfter}, x, 0.6)`)
    expect(UNISON).toContain(`note(hz, 0.6, int(50 + 70 * d['agreement']), release=0.4`)
    expect(FORM.mosaicBrass).toBe(0.6 + 0.4)
  })

  it('match itw/forms_turn.py: a turn is still a bar of every beat and a silent bar of two', () => {
    expect(TURN).toContain(`'kind': 'all'`)
    expect(TURN).toContain(`'s': 2 * BAR, 'day': i, 'kind': 'said'`)
  })
})

describe.each(unisons)('Unison, %s', (_, u) => {
  const s = unisonFormScore(u)

  it('draws every war signal once, in the row of its story, inside the piece', () => {
    const events = u.parts.flatMap((p) => (p.form === 'stroke' ? [] : (p.days as { events: unknown[] }[]).flatMap((d) => d.events)))
    const notes = s.marks.filter((m) => m.kind === 'lead' || m.kind === 'other')
    expect(notes).toHaveLength(events.length)
    const rows = new Set(s.rows.map((r) => r.id))
    for (const m of notes) {
      expect(rows.has(m.row)).toBe(true)
      expect(m.t0).toBeGreaterThanOrEqual(0)
      expect(m.t0).toBeLessThan(s.seconds)
    }
  })

  it('gives every day of the week once, in time order, with brass exactly on its peak days', () => {
    expect(s.days.map((d) => d.day)).toHaveLength(7)
    s.days.slice(1).forEach((d, i) => expect(d.from).toBeGreaterThan(s.days[i]!.from))
    const peaks = u.parts.flatMap((p) => (p.form === 'stroke' ? [] : p.days.filter((d) => d.peak).map((d) => d.day)))
    expect(s.marks.filter((m) => m.kind === 'brass').map((m) => m.id.slice(2)).sort()).toEqual(peaks.sort())
  })

  it('draws what its form is: held without blocks, a mosaic without a pedal, a break with one stroke, a handover with one step', () => {
    const kinds = new Set([...s.marks.map((m) => m.kind), ...s.regions.map((g) => g.kind)])
    if (u.form === 'held') expect([kinds.has('pedal'), kinds.has('block'), kinds.has('step')]).toEqual([true, false, false])
    if (u.form === 'mosaic') expect([kinds.has('pedal'), kinds.has('block')]).toEqual([false, true])
    if (u.form === 'break') expect(s.regions.filter((g) => g.kind === 'stroke')).toHaveLength(1)
    if (u.form === 'handover') expect(s.regions.filter((g) => g.kind === 'step')).toHaveLength(1)
  })

  it('lays out at a phone’s width and a desk’s, every mark inside the drawing, and answers the pointer', () => {
    for (const w of [360, 960]) {
      const l = layoutForm(s, w)
      for (const line of l.lines) {
        for (const m of line.marks) {
          expect(m.x).toBeGreaterThanOrEqual(l.frame.left - 0.1)
          expect(m.x + m.w).toBeLessThanOrEqual(l.frame.width + 0.1)
        }
      }
      const first = l.lines[0]!.marks.find((m) => m.kind === 'lead' || m.kind === 'other')!
      const hit = hitForm(s, l, first.x + 0.5, first.y + first.h / 2)
      expect(hit?.id).toBeTruthy()
      expect(describeForm(s, hit!.id!)).not.toBeNull()
    }
    expect(nowForm(s, s.days[2]!.from + 0.5).length).toBeGreaterThan(10)
  })
})

describe.each(turns)('Turn, %s', (_, r) => {
  const s = turnFormScore(r)

  it('draws a cell for every sounding family of every bar, never more beats than its harmonic', () => {
    const cells = r.bars.filter((b) => b.kind === 'bar' || b.kind === 'all').reduce((n, b) => n + Object.values(b.pulses).filter((k) => k > 0).length, 0)
    const beats = s.marks.filter((m) => m.kind === 'beat' || m.kind === 'beat-full')
    expect(beats).toHaveLength(cells)
    for (const m of beats) expect(m.weight).toBeLessThanOrEqual(1)
  })

  it('gives every day once, and draws its form', () => {
    expect(s.days).toHaveLength(7)
    const cuts = s.regions.filter((g) => g.kind === 'cut').length
    if (r.form === 'held' || r.form === 'handover') expect(cuts).toBe(0)
    if (r.form === 'mosaic') expect(cuts).toBe(7)
    if (r.form === 'break') expect(cuts).toBeGreaterThan(0)
    if (r.form === 'handover') expect(s.regions.filter((g) => g.kind === 'step')).toHaveLength(1)
  })

  it('lays out inside the drawing at any width', () => {
    for (const w of [360, 960]) {
      const l = layoutForm(s, w)
      for (const line of l.lines) for (const m of line.marks) expect(m.x + m.w).toBeLessThanOrEqual(l.frame.width + 0.1)
    }
  })
})

describe('Overlooked’s fixed times', () => {
  it('match itw/forms_overlooked.py', () => {
    expect(OVERLOOKED).toContain(`WALL_NOTE_S = ${FORM.wallNote.toFixed(1)}`)
    expect(OVERLOOKED).toContain(`WALL_RELEASE_S = ${FORM.wallRelease}`)
    expect(OVERLOOKED).toContain(`WALL_STEP_S = ${FORM.wallStep.toFixed(1)}`)
    expect(OVERLOOKED).toContain(`span = (m['length'] + ${FORM.motifRest}) * PULSE`)
    expect(OVERLOOKED).toContain('PULSE = overlooked.PULSE')
  })
})

describe.each(overlookeds)('Overlooked, %s', (_, o) => {
  const s = overlookedFormScore(o)
  const days = o.parts.flatMap((p) => (p.form === 'stroke' ? [] : p.days))

  it('says every day once and plays every motif note as often as the record says', () => {
    expect(s.days).toHaveLength(7)
    expect(s.marks.filter((m) => m.kind === 'said')).toHaveLength(7)
    const notes = days.reduce((n, d) => n + d.motif.length * d.repeats, 0)
    expect(s.marks.filter((m) => m.kind === 'lead')).toHaveLength(notes)
    for (const m of s.marks) expect(m.t1).toBeLessThanOrEqual(s.seconds + 0.01)
  })

  it('a field is heard once a week, and its row is named for its instrument', () => {
    expect(new Set(days.map((d) => d.field)).size).toBe(7)
    for (const d of days) expect(s.rows.find((r) => r.id === `field:${d.field}`)?.label).toContain(d.instrument)
  })

  it('draws its form', () => {
    const kinds = new Set([...s.marks.map((m) => m.kind), ...s.regions.map((g) => g.kind)])
    if (o.form === 'held') expect([kinds.has('pedal'), kinds.has('block')]).toEqual([true, false])
    if (o.form === 'mosaic') expect([kinds.has('pedal'), kinds.has('block')]).toEqual([false, true])
    if (o.form === 'break') expect([kinds.has('pedal'), kinds.has('block'), kinds.has('stroke')]).toEqual([true, true, true])
    if (o.form === 'handover') expect(s.regions.filter((g) => g.kind === 'step')).toHaveLength(1)
    for (const w of [360, 960]) for (const line of layoutForm(s, w).lines) for (const m of line.marks) expect(m.x + m.w).toBeLessThanOrEqual(w + 0.1)
  })
})
