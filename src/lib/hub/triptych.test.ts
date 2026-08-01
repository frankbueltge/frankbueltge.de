// Guard for the entrance's triptych. The claim the three cards make is structural, not
// decorative: each thumbnail is a FRAGMENT of the room's own figure, drawn by the room's own
// builder, and it is the NEWEST fragment that practice has on the record. Both halves of that
// claim are checked here — against the real committed data wherever this repo carries it, and
// against fixtures for the shapes the real data does not currently contain.
import { describe, expect, it } from 'vitest'
import chronicleUpstream from '@/data/field/chronicle.upstream.json'
import studioChronicle from '@/data/studio/chronicle.upstream.json'
import stageData from '@/data/studio/stage.curated.json'
import meta018 from '@/components/field/werke/2026-07-25-no-signal-to-extend/meta.json'
import meta019 from '@/components/field/werke/2026-07-26-unable-to-ring-its-own-bell/meta.json'
import parallax from '@/data/meridian/parallax.json'
import nativeSpeaker from '@/content/studio/works/2026-07-13-native-speaker/meta.json'
import noWay from '@/content/studio/works/2026-07-17-no-way-of-knowing/meta.json'
import recovery from '@/content/studio/works/2026-07-21-recovery/meta.json'
import oneTap from '@/content/studio/works/2026-07-23-one-tap/meta.json'
import noPart from '@/content/studio/works/2026-07-30-no-part/meta.json'
import { gauntletPlate, gauntletTour, type GauntletChronicleEntry } from '@/lib/tour/field-gauntlet'
import { buildControlSvg, type ControlInput } from '@/lib/field/strip'
import { buildSeasonModel, buildSeasonFloorSvg, type SeasonKill } from '@/lib/studio/season'
import { buildPassageModel, buildPassageSvg, type PassageInput, type PassageModel } from '@/lib/atelier/passage'
import {
  ATELIER_THUMB_PROVENANCE,
  FIELD_THUMB_DAYS,
  FIELD_THUMB_PROVENANCE,
  STUDIO_THUMB_CROP,
  lastMarkedDays,
  latestLine,
  latestLitMark,
  passageThumbSvg,
  plateThumbSvg,
  provenanceLine,
  seasonThumbSvg,
} from './triptych'

// ——— the real season, and the real gauntlet plate ————————————————————————————————
const seasonModel = buildSeasonModel({
  chronicle: studioChronicle,
  metas: {
    '2026-07-13-native-speaker': nativeSpeaker,
    '2026-07-17-no-way-of-knowing': noWay,
    '2026-07-21-recovery': recovery,
    '2026-07-23-one-tap': oneTap,
    '2026-07-30-no-part': noPart,
  },
  kills: stageData.kills as SeasonKill[],
})

const plate = gauntletPlate({
  chronicle: chronicleUpstream as GauntletChronicleEntry[],
  instrument018: { title: meta018.title, date: meta018.date },
  instrument019: { title: meta019.title, date: meta019.date },
  parallax,
})

// ——— a small passage sheet: three lines, opened on three different days ———————————
const HARBOURS: PassageInput['harbours'] = {
  PUBLISH: { label: 'published', hint: 'through the gate' },
  PUBLICATION_CANDIDATE: { label: 'at the gate', hint: 'waiting on a human' },
  ARCHIVE_AS_STUDY: { label: 'kept as study', hint: 'not published, kept' },
  KILL: { label: 'closed unfinished', hint: 'closed on its own condition' },
  OPEN: { label: 'still open', hint: 'being worked' },
}

// Ten lines, so the sheet is taller than one cropped band — a three-line fixture is SHORTER than
// the band the crop opens, and every assertion about cropping would pass vacuously.
const DISPOSITIONS = ['KILL', 'PUBLISH', 'ARCHIVE_AS_STUDY', 'PUBLICATION_CANDIDATE']
const sheet = (): PassageModel =>
  buildPassageModel({
    projects: Array.from({ length: 10 }, (_, i) => {
      const created = `2026-07-${String(i + 1).padStart(2, '0')}`
      const last = i === 9
      return {
        id: `${created}-question-${i + 1}`,
        title: last ? 'Newest question' : `Question ${i + 1}`,
        status: last ? 'ACTIVE' : 'CLOSED',
        disposition: last ? '' : DISPOSITIONS[i % DISPOSITIONS.length],
        created,
        dateien: last ? ['SCORE.md'] : ['SCORE.md', 'DECISION.md'],
      }
    }),
    journalIds: ['journal/2026-07-11-question-10-a-first-move'],
    today: '2026-07-12',
    prose: {},
    ledgers: {},
    harbours: HARBOURS,
  })

const GAP_LINE = 'the record states no closing cost'

describe('the fragment each card shows is the practice’s newest', () => {
  it('the atelier crops to the line opened most recently', () => {
    expect(latestLine(sheet())).toBe('2026-07-10-question-10')
  })

  it('the studio crops to the position lit most recently — never to a strike or a return', () => {
    const key = latestLitMark(seasonModel)
    const mark = seasonModel.marks.find((m) => m.key === key)!
    expect(['premiered', 'withdrawn']).toContain(mark.state)
    const litDates = seasonModel.marks
      .filter((m) => m.state === 'premiered' || m.state === 'withdrawn')
      .map((m) => m.date)
    expect(mark.date).toBe([...litDates].sort().at(-1))
    // strikes and returns exist on this floor and are still not eligible
    expect(seasonModel.marks.some((m) => m.state === 'struck')).toBe(true)
    expect(seasonModel.marks.some((m) => m.state === 'returned')).toBe(true)
  })

  it('the field keeps the last marked days of the tape, not the last calendar days', () => {
    const fragment = lastMarkedDays(plate, FIELD_THUMB_DAYS)
    const markedDays = [...new Set(plate.marks.map((m) => m.date))].sort()
    const kept = [...new Set(fragment.marks.map((m) => m.date))].sort()
    expect(kept).toEqual(markedDays.slice(-FIELD_THUMB_DAYS))
    // every mark on those days came along, and nothing older did
    expect(fragment.marks.every((m) => m.date >= kept[0])).toBe(true)
    expect(fragment.marks.length).toBeLessThan(plate.marks.length)
  })

  it('refuses a sheet, a floor or a tape it cannot cut a fragment from', () => {
    const empty = { ...sheet(), lines: [] }
    expect(() => latestLine(empty)).toThrow(/no lines/)
    expect(() => latestLitMark({ ...seasonModel, marks: [] })).toThrow(/no lit position/)
    expect(() => lastMarkedDays({ ...plate, marks: [] }, 3)).toThrow(/no marks/)
    expect(() => lastMarkedDays(plate, 0)).toThrow(/at least one day/)
  })
})

describe('lastMarkedDays cuts the tape without redrawing it', () => {
  const fragment = lastMarkedDays(plate, FIELD_THUMB_DAYS)

  it('keeps the resting pen’s day of clear tape where the full plate has one', () => {
    const lastMark = [...new Set(fragment.marks.map((m) => m.date))].sort().at(-1)!
    const lastDay = fragment.days.at(-1)!
    expect(lastDay > lastMark).toBe(true)
    expect(plate.days).toContain(lastDay)
  })

  it('invents no clear day where the plate ends on its last mark', () => {
    const tight: ControlInput = { ...plate, days: plate.days.slice(0, plate.days.length - 1) }
    const cut = lastMarkedDays(tight, 1)
    expect(cut.days.at(-1)).toBe([...new Set(tight.marks.map((m) => m.date))].sort().at(-1))
  })

  it('drops a standing obligation anchored outside the window rather than re-anchoring it', () => {
    const fragmentOfOne = lastMarkedDays(plate, 1)
    expect(plate.obligation).toBeDefined()
    expect(fragmentOfOne.days).not.toContain(plate.obligation!.fromDate)
    expect(fragmentOfOne.obligation).toBeUndefined()
  })

  it('keeps an obligation whose anchor day is inside the window', () => {
    const anchored: ControlInput = {
      ...plate,
      obligation: { fromDate: [...new Set(plate.marks.map((m) => m.date))].sort().at(-1)!, label: 'still standing' },
    }
    expect(lastMarkedDays(anchored, 1).obligation).toEqual(anchored.obligation)
  })

  it('leaves the plate it was handed untouched', () => {
    const before = JSON.stringify(plate)
    lastMarkedDays(plate, 2)
    expect(JSON.stringify(plate)).toBe(before)
  })
})

describe('every thumbnail is a still, and a real crop', () => {
  const atelier = passageThumbSvg(sheet(), { label: 'atelier fragment', gapLine: GAP_LINE })
  const field = plateThumbSvg(plate, { label: 'field fragment', svgId: 'hub-thumb-field' })
  const studio = seasonThumbSvg(seasonModel, { label: 'studio fragment' })
  const all = { atelier, field, studio }

  it('carries no interaction hook — a card is a picture, its link is the control', () => {
    for (const [name, svg] of Object.entries(all)) {
      expect(svg, `${name} thumbnail`).not.toContain('tabindex')
      expect(svg, `${name} thumbnail`).not.toContain('role="button"')
    }
    // The atelier and the studio drop their mark keys in `still` mode outright; the field's plate
    // keeps its keys in the markup (the tour's own stills need them to carry a baked focus) and
    // makes them inert by dropping the tab stop. Nothing binds to them on the hub — there is no
    // figure-ready handshake on this page — so the keys are dead attributes, and the contract that
    // actually matters is the one asserted above: nothing here is focusable or clickable.
    expect(atelier).not.toContain('data-key')
    expect(studio).not.toContain('data-key')
  })

  it('is drawn by the practice’s own builder, in the practice’s own classes', () => {
    expect(atelier).toContain('class="at-proc-svg"')
    expect(atelier).toContain('class="pr-band')
    expect(field).toContain('id="hub-thumb-field"')
    expect(field).toContain('class="gridline"')
    expect(studio).toContain('class="st-sf"')
    expect(studio).toContain('class="st-sf-pool"')
  })

  it('is really cropped — never the whole figure shrunk into a card', () => {
    const viewBox = (svg: string) => /viewBox="([^"]+)"/.exec(svg)![1]
    expect(viewBox(atelier)).not.toBe(viewBox(buildPassageSvg(sheet(), { gapLine: GAP_LINE })))
    expect(viewBox(studio)).toBe(
      viewBox(buildSeasonFloorSvg(seasonModel, { cropTo: latestLitMark(seasonModel), cropBox: STUDIO_THUMB_CROP })),
    )
    expect(viewBox(studio)).not.toBe(viewBox(buildSeasonFloorSvg(seasonModel)))
    // the field's fragment fits to its own marks, so its box is narrower than the full plate's
    const box = (svg: string) => Number(viewBox(svg).split(' ')[2])
    expect(box(field)).toBeLessThan(box(buildControlSvg({ ...plate, fitToMarks: false })))
  })

  it('is pure: the same committed record yields a byte-identical picture', () => {
    expect(passageThumbSvg(sheet(), { label: 'atelier fragment', gapLine: GAP_LINE })).toBe(atelier)
    expect(plateThumbSvg(plate, { label: 'field fragment', svgId: 'hub-thumb-field' })).toBe(field)
    expect(seasonThumbSvg(seasonModel, { label: 'studio fragment' })).toBe(studio)
  })

  it('names itself for a screen reader with the label the card gave it', () => {
    expect(atelier).toContain('aria-label="atelier fragment"')
    expect(field).toContain('aria-label="field fragment"')
    expect(studio).toContain('aria-label="studio fragment"')
  })
})

describe('the crop window keeps the stage a stage', () => {
  it('holds the curtain line and the lamp bar in frame', () => {
    const [, y, , h] = seasonThumbSvg(seasonModel, { label: 'x' })
      .match(/viewBox="([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+)"/)!
      .slice(1)
      .map(Number)
    // the floor's curtain line sits at y = 150 and the lamp bar 22 above it
    expect(y).toBeLessThanOrEqual(128)
    expect(y + h).toBeGreaterThan(150)
  })

  it('clamps a window larger than the figure to the figure', () => {
    const huge = buildSeasonFloorSvg(seasonModel, {
      cropTo: latestLitMark(seasonModel),
      cropBox: { width: 9000, height: 9000 },
    })
    expect(huge).toContain(`viewBox="0 0 ${seasonModel.width} ${seasonModel.height}"`)
  })
})

describe('provenanceLine', () => {
  it('names every file the picture was derived from, in one phrasing for all three cards', () => {
    expect(provenanceLine('derived at build time from', ATELIER_THUMB_PROVENANCE)).toBe(
      'derived at build time from src/content/atelier/projects/*/SCORE.md · ' +
        'src/content/atelier/projects/*/DECISION.md · src/content/atelier/journal/*.md',
    )
  })

  it('refuses a picture with no named source', () => {
    expect(() => provenanceLine('derived at build time from', [])).toThrow(/no named source/)
  })

  it('names what the FIELD PICTURE reads, not what the field tour quotes', () => {
    // The obvious reuse — gauntletTour.provenance — is a superset: it also lists the files the
    // tour's quotes are verified against (verification exports, the runtime spec), and the plate
    // draws from none of them. Crediting a source a drawing never touched is the same failure as
    // leaving one out, so the two lists are checked to be different on purpose.
    expect([...FIELD_THUMB_PROVENANCE]).not.toEqual(gauntletTour.provenance)
    for (const path of FIELD_THUMB_PROVENANCE) {
      expect(path.startsWith('src/'), path).toBe(true)
    }
    // every source the plate really reads is named
    expect(FIELD_THUMB_PROVENANCE.some((p) => p.includes('field/chronicle'))).toBe(true)
    expect(FIELD_THUMB_PROVENANCE.some((p) => p.includes('field/werke'))).toBe(true)
    expect(FIELD_THUMB_PROVENANCE.some((p) => p.includes('parallax.json'))).toBe(true)
    // …and nothing the quotes alone reach
    expect(FIELD_THUMB_PROVENANCE.some((p) => p.includes('verification'))).toBe(false)
  })
})
