// src/lib/ill-tempered-week/score-forms.ts — the score of a piece pressed in a form the week chose (2026-11-16; the
// method doc's section on the week choosing its form). The standing scores (score-overlooked.ts, score-unison.ts,
// score-turn.ts) draw the albums pressed before and are not touched; this module draws Unison and Turn in the held,
// mosaic, break and handover forms from their records (itw/forms_unison.py, itw/forms_turn.py).
//
// One drawing for every form: a row per voice, time from left to right, broken into lines at day starts like the
// standing scores. A held form draws long notes and no day as a day; a mosaic draws its blocks and the silence
// between them; a break draws both with the stroke between; a handover draws the pedal's step. Pure and browser-free:
// the island (src/components/ill-tempered-week/FormScore.tsx) mounts what this returns and computes nothing it claims.
import type { Character, ChosenForm, Form, OverlookedForm, TurnForm, UnisonForm } from './albums'
import { dayName, dayShort, frameFor, hzLabel, mmss, r1, spanAt, tickStep, ticksBetween, timeAtX, xAt, type Frame, type Span } from './score'

/** The renderers' fixed times, as itw/forms_unison.py and itw/forms_turn.py write them (score-forms.test.ts reads
 *  them back from the source). */
export const FORM = {
  /** held: a note glides this long and dies away over the release */
  heldGlide: 4.5,
  heldRelease: 2.0,
  /** held: the day's length, the brass entering after the day begins and holding 0.8 of a day, then its release */
  heldDay: 14.0,
  brassAfter: 1.0,
  brassRelease: 2.5,
  /** held: the sentence begins this long into a peak day */
  saidAfter: 3.0,
  /** held: each bowed note of the pedal lasts this long with its release; a new one every pedalStep seconds */
  pedalNote: 9.5,
  pedalStep: 4.5,
  /** mosaic: the sentence begins this long into a peak block; the opening brass lasts this long with its release */
  mosaicSaidAfter: 0.4,
  mosaicBrass: 1.0,
  /** the break: the timpani stroke rings this long */
  stroke: 4.0,
  /** Overlooked held: the wall's notes last this long plus their release, a new chord every wallStep seconds */
  wallNote: 6.0,
  wallRelease: 2.5,
  wallStep: 4.0,
  /** Overlooked: a motif's eighth, and the rest of four eighths between its repetitions */
  pulse: 0.2,
  motifRest: 4,
} as const

export type MarkKind = 'lead' | 'other' | 'pedal' | 'brass' | 'said' | 'beat' | 'beat-full'
export type RegionKind = 'block' | 'leadband' | 'stroke' | 'step' | 'turn' | 'cut'

export interface FRow {
  id: string
  label: string
  short: string
}

export interface FMark {
  id: string
  row: string
  t0: number
  t1: number
  kind: MarkKind
  /** 0 to 1: a note's attention (drawn as its weight of ink), a bar's share of its family's beats (drawn as height) */
  weight: number
  head: string
  body: string
}

export interface FRegion {
  id: string
  t0: number
  t1: number
  kind: RegionKind
  /** a lead band shades one row; every other region spans the line */
  row?: string
  head: string
  body: string
}

export interface FDay {
  index: number
  day: string
  from: number
  /** what the day did in this form, one line */
  note: string
  said: string | null
}

export interface FormScore {
  piece: 'overlooked' | 'unison' | 'turn'
  form: ChosenForm
  week: string
  seconds: number
  rows: FRow[]
  marks: FMark[]
  regions: FRegion[]
  days: FDay[]
  /** the legend: the kinds this score draws, each once, with what it means here */
  legend: { kind: MarkKind | RegionKind; text: string }[]
}

const pct = (x: number): string => `${Math.round(100 * x)} %`
const r3 = (x: number): number => Math.round(x * 1000) / 1000
const storyRow = (s: string | null): string => `story:${s ?? '—'}`
/** A note that rings past the piece's end (the press trims the audio there) is drawn to the end. */
const clamp = <T extends { t0: number; t1: number }>(xs: T[], end: number, cut: number | null = null): T[] =>
  xs.map((x) => {
    // what was held before a break ends at the stroke: the press cuts it there
    const stop = cut !== null && x.t0 < cut ? Math.min(end, cut) : end
    return x.t1 > stop ? { ...x, t1: stop } : x
  })
/** The stroke of a break, where the held part is cut. */
const strokeAt = (parts: readonly { form: string; at_s?: number }[]): number | null => parts.find((p) => p.form === 'stroke')?.at_s ?? null

/** How the page names an album's form in a sentence. */
export const FORM_PHRASE: Record<Form, string> = { standing: 'This album is in the standing form.', held: 'This album is held.', mosaic: 'This album is a mosaic.', break: 'This album breaks.', handover: 'This album hands over.' }

// ---------------------------------------------------------------------------------------------------------------
// Unison
// ---------------------------------------------------------------------------------------------------------------

export function unisonFormScore(u: UnisonForm): FormScore {
  const rows: FRow[] = []
  const seen = new Set<string>()
  const addRow = (id: string, label: string, short = label) => {
    if (!seen.has(id)) {
      seen.add(id)
      rows.push({ id, label, short })
    }
  }
  const marks: FMark[] = []
  const regions: FRegion[] = []
  const days: FDay[] = []
  const legend = new Map<MarkKind | RegionKind, string>()
  let hasPedal = false

  for (const p of u.parts) {
    if (p.form === 'held') {
      if (p.lead) addRow(storyRow(p.lead), `${p.lead} · on A`, p.lead)
      for (const [story, h] of Object.entries(p.degrees).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))) addRow(storyRow(story), `${story} · ${h}/8`, story)
    }
  }
  for (const p of u.parts) {
    if (p.form === 'mosaic') for (const story of Object.keys(p.sounds)) addRow(storyRow(story), story)
  }
  const anyNone = u.parts.some((p) => p.form !== 'stroke' && p.days.some((d) => (d.events as { story: string | null }[]).some((e) => e.story === null)))
  if (anyNone) addRow(storyRow(null), 'no story named', 'none')

  for (const p of u.parts) {
    if (p.form === 'stroke') {
      regions.push({ id: `stroke`, t0: p.at_s, t1: r3(p.at_s + FORM.stroke), kind: 'stroke', head: `The break · ${dayShort(p.day)}`,
        body: 'One timpani stroke on A and silence: the sharpest overnight change of the week. What was held breaks into blocks.' })
      legend.set('stroke', 'The break: one timpani stroke and silence, the day the web’s attention changed most overnight.')
      continue
    }
    if (p.form === 'held') {
      hasPedal = true
      let seg: { t0: number; t1: number; hz: number } | null = null
      const segs: { t0: number; t1: number; hz: number }[] = []
      for (const g of p.ground) {
        const end = r3(g.from_s + FORM.pedalNote)
        if (seg && Math.abs(seg.hz - g.hz) < 0.01) seg.t1 = Math.max(seg.t1, end)
        else {
          seg = { t0: g.from_s, t1: end, hz: g.hz }
          segs.push(seg)
        }
      }
      segs.forEach((s, k) => {
        marks.push({ id: `pedal-${p.from_s}-${k}`, row: 'pedal', t0: s.t0, t1: s.t1, kind: 'pedal', weight: 1,
          head: `Pedal · ${hzLabel(s.hz)}`, body: Math.abs(s.hz - 55) < 0.01 ? 'Double basses on A, never broken: no day is heard as a day.' : 'A whole tone above A (9/8): the ground moved on the day the lead passed.' })
        if (k > 0) regions.push({ id: `step-${k}`, t0: s.t0, t1: r3(s.t0 + 4), kind: 'step', head: 'The handover', body: `The pedal glides up a whole tone, to ${hzLabel(s.hz)}, and stays: the day the week’s lead passed to another story.` })
      })
      legend.set('pedal', 'The pedal: double basses on A from the first second to the last.')
      if (segs.length > 1) legend.set('step', 'The handover: the pedal steps up a whole tone on the day the lead passed, and stays.')
      p.days.forEach((d) => {
        days.push({ index: days.length, day: d.day, from: d.from_s, said: d.said,
          note: `held · ${d.signals} war signals · ${d.lead ?? 'no story'} led, ${pct(d.agreement)} agreed${d.peak ? ' · brass' : ''}` })
        d.events.forEach((e, j) => {
          marks.push({ id: `h-${d.day}-${j}`, row: storyRow(e.story), t0: e.at_s, t1: r3(e.at_s + FORM.heldGlide + FORM.heldRelease),
            kind: e.lead ? 'lead' : 'other', weight: e.attention,
            head: `${e.story ?? 'No story named'} · ${dayShort(d.day)}`,
            body: `${e.text} — ${hzLabel(e.from_hz)}${Math.abs(e.from_hz - e.to_hz) > 0.05 ? ` gliding to ${hzLabel(e.to_hz)}, ${pct(d.agreement)} of the way to A` : ', on A'}` })
        })
        if (d.peak) {
          const t0 = r3(d.from_s + FORM.brassAfter)
          marks.push({ id: `b-${d.day}`, row: 'brass', t0, t1: r3(t0 + 0.8 * p.day_s + FORM.brassRelease), kind: 'brass', weight: d.agreement,
            head: `Brass · ${dayShort(d.day)}`, body: `Horn, trombone and tuba hold bare octaves of A: ${pct(d.agreement)} of the day’s war signals named ${d.lead}.` })
        }
        if (d.said) {
          const t0 = r3(d.from_s + FORM.saidAfter)
          marks.push({ id: `s-${d.day}`, row: 'voice', t0, t1: r3(t0 + (d.said_s ?? 4)), kind: 'said', weight: 1, head: `Said · ${dayShort(d.day)}`, body: d.said })
        }
      })
      legend.set('lead', 'A signal naming the week’s leading story: a held note on an octave of A. Darker, more attended.')
      legend.set('other', 'A signal naming another story: a note on that story’s own degree, gliding towards A as far as its day agreed.')
    } else {
      p.days.forEach((d) => {
        days.push({ index: days.length, day: d.day, from: d.from_s, said: d.said,
          note: `block of ${r1(d.to_s - d.from_s)} s · ${d.signals} war signals · ${d.lead ?? 'no story'} led, ${pct(d.agreement)} agreed${d.peak ? ' · brass' : ''}` })
        regions.push({ id: `blk-${d.day}`, t0: d.from_s, t1: d.to_s, kind: 'block', head: `${dayName(d.day)} · a block`,
          body: `${d.signals} war signals in ${r1(d.to_s - d.from_s)} s, as long as the day’s share of the week; a cut and silence after.` })
        if (d.lead) regions.push({ id: `lb-${d.day}`, t0: d.from_s, t1: d.to_s, kind: 'leadband', row: storyRow(d.lead), head: `${d.lead} leads ${dayName(d.day)}`, body: `Its sound beats the ground of the block; ${pct(d.agreement)} of the day’s war signals named it.` })
        d.events.forEach((e, j) => {
          marks.push({ id: `m-${d.day}-${j}`, row: storyRow(e.story ?? d.lead), t0: e.at_s, t1: r3(e.at_s + Math.max(0.12, 0.9 * d.step_s)),
            kind: e.lead ? 'lead' : 'other', weight: e.attention, head: `${e.story ?? 'No story named'} · ${dayShort(d.day)}`, body: `${e.text} — ${e.sound}, ${hzLabel(e.hz)}` })
        })
        if (d.peak) marks.push({ id: `b-${d.day}`, row: 'brass', t0: d.from_s, t1: r3(d.from_s + FORM.mosaicBrass), kind: 'brass', weight: d.agreement, head: `Brass · ${dayShort(d.day)}`, body: `The block opens with brass on the lead’s tone: ${pct(d.agreement)} agreed on ${d.lead}.` })
        if (d.said) {
          const t0 = r3(d.from_s + FORM.mosaicSaidAfter)
          marks.push({ id: `s-${d.day}`, row: 'voice', t0, t1: r3(t0 + (d.said_s ?? 4)), kind: 'said', weight: 1, head: `Said · ${dayShort(d.day)}`, body: d.said })
        }
      })
      legend.set('block', 'A day as a block, as long as its share of the week’s war signals; silence between blocks.')
      legend.set('leadband', 'The day’s leading story: its sound beats the ground of the block.')
      if (!legend.has('lead')) legend.set('lead', 'A signal naming the day’s leading story: a short note at its hour.')
      if (!legend.has('other')) legend.set('other', 'A signal naming another story: its own sound cuts in.')
    }
  }
  if (marks.some((m) => m.kind === 'brass')) {
    addRow('brass', 'brass')
    legend.set('brass', `Brass where at least ${pct(u.peak_agreement)} of a day’s war signals named its leading story.`)
  }
  if (marks.some((m) => m.kind === 'said')) {
    addRow('voice', 'said')
    legend.set('said', 'The day’s most attended war headline, said.')
  }
  if (hasPedal) addRow('pedal', 'pedal A', 'pedal')
  const order: (MarkKind | RegionKind)[] = ['lead', 'other', 'block', 'leadband', 'brass', 'said', 'pedal', 'step', 'stroke']
  return {
    piece: 'unison', form: u.form, week: u.week, seconds: u.seconds, rows, marks: clamp(marks, u.seconds, strokeAt(u.parts)), regions: clamp(regions, u.seconds), days,
    legend: order.filter((k) => legend.has(k)).map((k) => ({ kind: k, text: legend.get(k)! })),
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Overlooked
// ---------------------------------------------------------------------------------------------------------------

export function overlookedFormScore(o: OverlookedForm): FormScore {
  const rows: FRow[] = [{ id: 'voice', label: 'said', short: 'said' }]
  const marks: FMark[] = []
  const regions: FRegion[] = []
  const days: FDay[] = []
  const legend = new Map<MarkKind | RegionKind, string>()
  const fieldRow = (field: string, instrument: string) => {
    const id = `field:${field}`
    if (!rows.some((r) => r.id === id)) rows.push({ id, label: `${field} · ${instrument}`, short: field })
    return id
  }
  for (const p of o.parts) {
    if (p.form === 'stroke') {
      regions.push({ id: 'stroke', t0: p.at_s, t1: r3(p.at_s + FORM.stroke), kind: 'stroke', head: `The break · ${dayShort(p.day)}`, body: 'One timpani stroke on A and silence: the sharpest overnight change of the week. What was held breaks into blocks.' })
      legend.set('stroke', 'The break: one timpani stroke and silence, the day the web’s attention changed most overnight.')
      continue
    }
    for (const d of p.days) {
      const row = fieldRow(d.field, d.instrument)
      const named = 'named' in d ? ` · its field named ${d.named} time${d.named === 1 ? '' : 's'} that day` : ''
      days.push({ index: days.length, day: d.day, from: d.from_s, said: d.text,
        note: `${p.form === 'held' ? 'inside the wall' : `a block, the motif ${d.repeats}×`} · ${d.field}, ${d.instrument}${named}` })
      marks.push({ id: `said-${d.day}`, row: 'voice', t0: d.said_s, t1: r3(d.said_s + d.speech_s), kind: 'said', weight: 1, head: `Said · ${dayShort(d.day)}`, body: d.text })
      const span = (d.motif_eighths + FORM.motifRest) * FORM.pulse
      for (let r = 0; r < d.repeats; r++) {
        d.motif.forEach((n, k) => {
          const t0 = r3(d.motif_from_s + r * span + n.step * FORM.pulse)
          marks.push({ id: `m-${d.day}-${r}-${k}`, row, t0, t1: r3(t0 + Math.max(0.12, 0.95 * n.eighths * FORM.pulse)), kind: 'lead', weight: Math.min(1, 0.4 + d.attention),
            head: `${d.field} · ${dayShort(d.day)}`, body: `The motif of “${d.text}”, ${d.instrument}, ${hzLabel(n.hz)}` })
        })
      }
      if (p.form === 'mosaic' && 'to_s' in d) {
        regions.push({ id: `blk-${d.day}`, t0: d.from_s, t1: d.to_s, kind: 'block', head: `${dayName(d.day)} · a block`, body: `The headline alone, then its motif ${d.repeats}×, then silence.` })
      }
    }
    if (p.form === 'held') {
      let seg: { t0: number; t1: number; ratio: number } | null = null
      const segs: { t0: number; t1: number; ratio: number }[] = []
      for (const g of p.ground) {
        const end = r3(g.from_s + FORM.wallNote + FORM.wallRelease)
        if (seg && Math.abs(seg.ratio - g.ratio) < 1e-6) seg.t1 = Math.max(seg.t1, end)
        else segs.push((seg = { t0: g.from_s, t1: end, ratio: g.ratio }))
      }
      segs.forEach((g, k) => {
        marks.push({ id: `wall-${p.from_s}-${k}`, row: 'wall', t0: g.t0, t1: g.t1, kind: 'pedal', weight: 1, head: 'The wall',
          body: g.ratio === 1 ? 'Strings on A’s harmonic chord, never stopping, louder than what is said inside it.' : 'The wall a whole tone higher (9/8): the ground moved on the day the lead passed.' })
        if (k > 0) regions.push({ id: `step-${k}`, t0: g.t0, t1: r3(g.t0 + 4), kind: 'step', head: 'The handover', body: 'The wall’s chord moves up a whole tone and stays: the day the week’s lead passed to another story.' })
      })
      legend.set('pedal', 'The wall: strings on A’s harmonic chord that never stop, louder than what is said inside them.')
      if (segs.length > 1) legend.set('step', 'The handover: the wall moves up a whole tone on the day the lead passed, and stays.')
    } else {
      legend.set('block', 'A day as a block: the headline alone, its motif as often as its field was named that day (at most four), then silence.')
    }
  }
  if (marks.some((m) => m.kind === 'pedal')) rows.push({ id: 'wall', label: 'the wall', short: 'wall' })
  legend.set('said', 'The day’s least attended headline, said once in its field’s voice.')
  legend.set('lead', 'Its motif: the headline’s speech melody on the pulse, played by its field’s instrument.')
  const order: (MarkKind | RegionKind)[] = ['said', 'lead', 'block', 'pedal', 'step', 'stroke']
  return { piece: 'overlooked', form: o.form, week: o.week, seconds: o.seconds, rows, marks: clamp(marks, o.seconds, strokeAt(o.parts)), regions: clamp(regions, o.seconds), days,
    legend: order.filter((k) => legend.has(k)).map((k) => ({ kind: k, text: legend.get(k)! })) }
}

// ---------------------------------------------------------------------------------------------------------------
// Turn
// ---------------------------------------------------------------------------------------------------------------

export const FAMILIES = ['search', 'news', 'social', 'tech'] as const

export function turnFormScore(r: TurnForm): FormScore {
  const rows: FRow[] = FAMILIES.map((f) => ({ id: f, label: `${f} · ${r.harmonics[f]}`, short: f }))
  const marks: FMark[] = []
  const regions: FRegion[] = []
  const days: FDay[] = []
  let ratio = 1
  r.bars.forEach((b, k) => {
    const d = r.days[b.day]!
    if (!days.some((x) => x.index === b.day) && b.kind !== 'cut') {
      const len = r.bars.find((x) => x.day === b.day && x.kind === 'bar')?.s ?? b.s
      const oct = b.octave ? ` · an octave ${b.octave > 0 ? 'up' : 'down'}` : ''
      days[b.day] = { index: b.day, day: d.day, from: b.from_s, said: d.said, note: `${d.signals} AI signals · ${len.toFixed(2)} s a bar${oct}${d.turn ? ' · the turn' : ''}` }
    }
    if (b.kind === 'cut') {
      regions.push({ id: `cut-${k}`, t0: b.from_s, t1: r3(b.from_s + b.s), kind: 'cut', head: 'Silence', body: 'A cut: the day ends and nothing rings on.' })
      return
    }
    if ((b.ratio ?? 1) !== ratio) {
      ratio = b.ratio ?? 1
      regions.push({ id: `step-${k}`, t0: b.from_s, t1: r3(b.from_s + b.s), kind: 'step', head: 'The handover', body: 'From here the whole rhythmicon sounds a whole tone higher (9/8): the day the week’s lead passed.' })
    }
    if (b.kind === 'said') {
      marks.push({ id: `said-${k}`, row: 'voice', t0: b.from_s, t1: r3(b.from_s + b.s), kind: 'said', weight: 1, head: `Said · ${dayShort(d.day)}`, body: d.said ?? 'The silent bar.' })
      return
    }
    if (b.kind === 'all') regions.push({ id: `turn-${k}`, t0: b.from_s, t1: r3(b.from_s + b.s), kind: 'turn', head: `The turn · ${dayShort(d.day)}`, body: 'One bar in which every family sings all its beats: the day the count first doubled the mean of the days before.' })
    for (const f of FAMILIES) {
      const k2 = b.pulses[f] ?? 0
      if (k2 <= 0) continue
      const h = r.harmonics[f]!
      marks.push({ id: `${k}-${f}`, row: f, t0: b.from_s, t1: r3(b.from_s + b.s), kind: k2 >= h ? 'beat-full' : 'beat', weight: k2 / h,
        head: `${f} · ${dayShort(d.day)}`, body: `${k2} of ${h} beats in a bar of ${b.s.toFixed(2)} s` })
    }
  })
  if (marks.some((m) => m.kind === 'said')) rows.push({ id: 'voice', label: 'said', short: 'said' })
  const legend: FormScore['legend'] = [
    { kind: 'beat', text: 'One bar of one family, as full as its beats sound: one for each AI signal it had, up to its harmonic number.' },
    { kind: 'beat-full', text: 'Every beat of the bar.' },
  ]
  if (regions.some((g) => g.kind === 'turn')) legend.push({ kind: 'turn', text: 'The turn: one bar of every beat, then a silent bar with the day’s most attended AI headline said.' })
  if (regions.some((g) => g.kind === 'cut')) legend.push({ kind: 'cut', text: 'Silence between the days’ blocks: a cut, nothing rings on.' })
  if (regions.some((g) => g.kind === 'step')) legend.push({ kind: 'step', text: 'The handover: from here the rhythmicon sounds a whole tone higher.' })
  return { piece: 'turn', form: r.form, week: r.week, seconds: r.seconds, rows, marks: clamp(marks, r.seconds), regions: clamp(regions, r.seconds), days: days.filter(Boolean), legend }
}

// ---------------------------------------------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------------------------------------------

export interface LaidMark {
  id: string
  kind: MarkKind
  x: number
  y: number
  w: number
  h: number
  /** 1 to 4: the ink a note carries for its attention */
  ink: number
}

export interface LaidRegion {
  id: string
  kind: RegionKind
  x: number
  y: number
  w: number
  h: number
}

export interface FLine {
  span: Span
  y: number
  rowsTop: number
  rowsBottom: number
  height: number
  rows: { id: string; label: string; y: number }[]
  marks: LaidMark[]
  regions: LaidRegion[]
  days: { index: number; x: number; label: string }[]
  ticks: { x: number; label: string }[]
}

export interface FormLayout {
  frame: Frame
  rowH: number
  lines: FLine[]
  height: number
}

export function layoutForm(s: FormScore, width: number): FormLayout {
  const frame = frameFor(width, s.seconds, s.days.map((d) => d.from), 3, { wide: 132, narrow: 70 })
  const rowH = s.piece === 'turn' ? 14 : 11
  const head = 16
  const lines: FLine[] = []
  let y = 4
  for (const span of frame.spans) {
    const rowsTop = y + head
    const rows = s.rows.map((r, k) => ({ id: r.id, label: frame.narrow ? r.short : r.label, y: rowsTop + k * rowH }))
    const rowsBottom = rowsTop + s.rows.length * rowH
    const rowY = new Map(rows.map((r) => [r.id, r.y]))
    const clipX = (t0: number, t1: number): [number, number] | null => {
      const a = Math.max(t0, span.t0)
      const b = Math.min(t1, span.t1)
      return b > a ? [r1(xAt(frame, span, a)), r1(xAt(frame, span, b))] : null
    }
    const marks: LaidMark[] = []
    for (const m of s.marks) {
      const c = clipX(m.t0, m.t1)
      const ry = rowY.get(m.row)
      if (!c || ry === undefined) continue
      const beat = m.kind === 'beat' || m.kind === 'beat-full'
      const h = beat ? Math.max(2, r1(m.weight * (rowH - 3))) : m.kind === 'pedal' ? 4 : m.kind === 'brass' || m.kind === 'said' ? rowH - 4 : 4
      marks.push({ id: m.id, kind: m.kind, x: c[0], w: Math.max(1, r1(c[1] - c[0] - (beat ? 0.6 : 0))), y: r1(beat ? ry + rowH - 1.5 - h : ry + (rowH - h) / 2), h,
        ink: Math.min(4, 1 + Math.floor(m.weight * 4)) })
    }
    const regions: LaidRegion[] = []
    for (const g of s.regions) {
      const c = clipX(g.t0, g.t1)
      if (!c) continue
      const ry = g.row ? rowY.get(g.row) : undefined
      if (g.row && ry === undefined) continue
      regions.push({ id: g.id, kind: g.kind, x: c[0], w: Math.max(1, r1(c[1] - c[0])), y: ry ?? rowsTop - 2, h: ry !== undefined ? rowH : rowsBottom - rowsTop + 4 })
    }
    const days = s.days
      .filter((d) => d.from >= span.t0 - 1e-6 && d.from < span.t1)
      .map((d) => ({ index: d.index, x: r1(xAt(frame, span, d.from)), label: frame.narrow ? dayShort(d.day).slice(0, 3) : dayShort(d.day) }))
    const step = tickStep(frame.pxPerSecond)
    const ticks = ticksBetween(span.t0, span.t1, step).map((t) => ({ x: r1(xAt(frame, span, t)), label: mmss(t) }))
    const height = rowsBottom - y + 22
    lines.push({ span, y, rowsTop, rowsBottom, height, rows, marks, regions, days, ticks })
    y += height + 14
  }
  return { frame, rowH, lines, height: y }
}

/** The moment and the mark under a point of the drawing (the row first, then the latest mark sounding there). */
export function hitForm(s: FormScore, l: FormLayout, x: number, y: number): { t: number; id: string | null } | null {
  const line = l.lines.find((ln) => y >= ln.y && y <= ln.rowsBottom + 6)
  if (!line || x < l.frame.left - 2 || x > l.frame.right + 2) return null
  const t = timeAtX(l.frame, line.span, x)
  const row = line.rows.find((r) => y >= r.y && y < r.y + l.rowH)
  if (!row) return { t, id: null }
  const pad = 2 / l.frame.pxPerSecond
  const hit = s.marks.filter((m) => m.row === row.id && m.t0 - pad <= t && t <= m.t1 + pad).sort((a, b) => b.t0 - a.t0)[0]
  if (hit) return { t, id: hit.id }
  const region = s.regions.find((g) => (g.row === undefined || g.row === row.id) && g.kind !== 'block' && g.t0 <= t && t <= g.t1)
  return { t, id: region?.id ?? null }
}

export function describeForm(s: FormScore, id: string): { head: string; body: string } | null {
  const m = s.marks.find((x) => x.id === id) ?? s.regions.find((x) => x.id === id)
  return m ? { head: m.head, body: m.body } : null
}

/** One line for the moment: the day, and what sounds. */
export function nowForm(s: FormScore, t: number): string {
  const day = [...s.days].reverse().find((d) => d.from <= t + 1e-6)
  const cut = s.regions.find((g) => (g.kind === 'cut' || g.kind === 'stroke') && g.t0 <= t && t < g.t1)
  if (cut) return cut.head
  if (!day) return 'Before the first day.'
  const said = s.marks.find((m) => m.kind === 'said' && m.t0 <= t && t < m.t1)
  return `${dayName(day.day)} · ${day.note}${said ? ` · said: ${said.body}` : ''}`
}

/** The line holding a moment, for the playhead (the same rule as the standing scores). */
export const lineAt = (l: FormLayout, t: number): number => l.lines.findIndex((ln) => ln.span.index === spanAt(l.frame, t).index)

// ---------------------------------------------------------------------------------------------------------------
// The page's words for a form
// ---------------------------------------------------------------------------------------------------------------

/** Why the album took its form, from its character and its days: one sentence for the top of the album. */
export function whyForm(c: Character, days: readonly string[]): string {
  const leads = c.leads
  const most = [...new Set(leads)].sort((a, b) => leads.filter((x) => x === b).length - leads.filter((x) => x === a).length)[0]
  const pass = leads.findIndex((l, i) => i >= 2 && l !== leads[0] && leads.slice(i).every((x) => x === l))
  switch (c.form) {
    case 'held':
      return `One story, ${most}, led the web’s attention on ${c.hold} days running, so this album is held: its pieces run as one unbroken sound, and no day is heard as a day.`
    case 'mosaic':
      return `The story leading the web’s attention changed ${c.changes} times in seven days (${leads.join(', ')}), so this album is a mosaic: each day is a block of its own, with silence between.`
    case 'break':
      return `On ${c.break_day ? dayName(c.break_day) : 'one day'} the web’s attention changed more overnight than on any other day of the week (a distance of ${c.break.toFixed(2)} between the fields’ shares, 0.30 or more counts), so this album breaks there: held before, a stroke and silence, blocks after.`
    case 'handover':
      return `The lead passed from ${leads[0]} to ${leads[pass]} on ${days[pass] ? dayName(days[pass]) : 'one day'} and held to the end, so this album is held, and on that day its ground moves up a whole tone.`
    default:
      return ''
  }
}

/** What the piece does in its form, for the paragraph above its score. */
export function formText(piece: 'overlooked' | 'unison' | 'turn', form: ChosenForm): string {
  const overlooked: Record<ChosenForm, string> = {
    held: 'Each day, the headline that drew the least attention on its own platform, among all thirteen fields and from a field not heard before that week, is said once, and its field’s instrument plays its speech melody as a motif. Here they are said inside a wall of strings on A’s harmonic chord that never stops and is louder than they are: the week held its attention elsewhere, and nothing that was overlooked gathers.',
    mosaic: 'Each day, the headline that drew the least attention on its own platform, among all thirteen fields and from a field not heard before that week, is said once, alone. Then its field’s instrument plays its speech melody as a motif, as many times as its field was named that day (at most four), and the day ends in silence. Each day stands alone.',
    break: 'The least attended headline of each day, said and played as its field’s motif: inside a wall of strings until the break, then one timpani stroke and silence, then each day as a block of its own.',
    handover: 'The least attended headline of each day, said and played as its field’s motif inside a wall of strings that never stops; on the day the lead passed, the wall moves up a whole tone and stays.',
  }
  if (piece === 'overlooked') return overlooked[form]
  const unison: Record<ChosenForm, string> = {
    held: 'Every signal that named war and violence is one held string note at its hour. A signal naming the week’s leading story sounds on an octave of A; any other story has a degree of its own and glides towards A as far as its day agreed. Double basses hold A from the first second to the last. Where at least 30 % of a day’s war signals named the week’s lead, horn, trombone and tuba hold bare octaves of A and the day’s most attended war headline is said.',
    mosaic: 'Every signal that named war and violence is one short note at its hour, in a block per day as long as the day’s share of the week’s war signals, with silence between. Each story has a sound of its own, the first to appear the first of eight; the day’s leading story beats the ground of its block, and the others cut in. Where at least 30 % of a day’s war signals named its leading story, the block opens with brass and the day’s most attended war headline.',
    break: 'Held until the break: every war signal a held string note, the leading story on A, double basses beneath. On the day of the break one timpani stroke and silence; from there each day is a block of short notes, each story in its own sound, with silence between. Brass and a said headline where a day agreed at least 30 %.',
    handover: 'Held: every war signal a held string note, the leading story on A, the others gliding towards it as far as their day agreed, double basses beneath. On the day the lead passed, the basses glide up a whole tone and stay there: the ground of the week moved. Brass and a said headline where a day agreed at least 30 %.',
  }
  const turn: Record<ChosenForm, string> = {
    held: 'One tempo and one pattern for the whole week: each platform family pulses its mean daily count of AI signals, up to its harmonic number (search 5, news 6, social 7, tech 9). The days differ only in how dense the ticks are; the turn, where there is one, is the only event.',
    mosaic: 'Each day a block of its own: its own tempo (a busy day faster), its own pattern (the day’s counts by family), its own register (an octave up for a day at least twice the mean, down for one at most half), then a cut and silence.',
    break: 'One tempo and one pattern until the break; then each day a block of its own tempo, pattern and register, cut apart by silence.',
    handover: 'One tempo and one pattern for the whole week; from the day the lead passed, the whole rhythmicon sounds a whole tone higher.',
  }
  return (piece === 'unison' ? unison : turn)[form]
}

/** One sentence per piece and form for the album's track list. */
export function formSays(piece: 'overlooked' | 'unison' | 'turn', form: ChosenForm): string {
  const says: Record<'overlooked' | 'unison' | 'turn', Record<ChosenForm, string>> = {
    overlooked: {
      held: 'Each day’s least attended headline said and played inside a wall of strings that never stops.',
      mosaic: 'Each day’s least attended headline alone, then its motif, then silence: a block per day.',
      break: 'Inside a wall of strings until the day attention changed most, then a stroke, and a block per day.',
      handover: 'Inside a wall of strings that moves up a whole tone on the day the lead passed.',
    },
    unison: {
      held: 'Every war signal a held string note over a pedal on A; the week’s leading story on A, the others gliding towards it as far as each day agreed.',
      mosaic: 'Every war signal a short note, a block per day with silence between, each story in a sound of its own.',
      break: 'Held until the day attention changed most, then a timpani stroke, and blocks after.',
      handover: 'Held over a pedal on A that moves up a whole tone on the day the lead passed.',
    },
    turn: {
      held: 'The signals about AI as a rhythmicon in one tempo all week; the turn, if any, the only event.',
      mosaic: 'The signals about AI as a rhythmicon, a block per day in its own tempo and register.',
      break: 'One tempo until the break, then a block per day in its own tempo and register.',
      handover: 'One tempo all week, a whole tone higher from the day the lead passed.',
    },
  }
  return says[piece][form]
}
