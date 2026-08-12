// src/lib/society/stage.test.ts — the two things a camera in a room can get wrong.
//
// It can look at nothing (a framing that has drifted off the composition, or a beat nobody
// decided a shot for), and it can cut something essential out of the picture on a screen
// whose shape nobody tested. Both are arithmetic, so both are tests rather than a look.

import { describe, expect, it } from 'vitest'
import { AGENT_POS, NODE_R } from './layout'
import { SCORE } from './score'
import {
  beatsWithoutShot,
  COMPOSITION_MID,
  fitToViewport,
  FRAMINGS,
  FRAMINGS_PORTRAIT,
  frameRect,
  lerpRect,
  place,
  shotFor,
  siteFrame,
  SHOTS,
  SOCIETY,
  STAGE,
  transformFor,
  viewBoxOf,
  WORLD,
  type Rect,
} from './stage'

const contains = (outer: Rect, inner: Rect) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.w <= outer.x + outer.w &&
  inner.y + inner.h <= outer.y + outer.h

const STAGE_RECT: Rect = { x: 0, y: 0, w: STAGE.w, h: STAGE.h }

/** Where the constellation actually is, on the stage, discs and all. */
function societyBounds(): Rect {
  const pts = Object.values(AGENT_POS).map((p) => place(SOCIETY, p.x, p.y))
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const pad = NODE_R * SOCIETY.k
  return {
    x: Math.min(...xs) - pad,
    y: Math.min(...ys) - pad,
    w: Math.max(...xs) - Math.min(...xs) + pad * 2,
    h: Math.max(...ys) - Math.min(...ys) + pad * 2,
  }
}

/** The table, in stage coordinates: world y 182, world x 0…100 → local 20…380. */
function tableBounds(): Rect {
  const a = place(WORLD, 20, 182)
  const b = place(WORLD, 380, 182)
  return { x: a.x, y: a.y, w: b.x - a.x, h: 1 }
}

describe('the composition sits on its own stage', () => {
  it('the society is inside the stage, and in its upper part', () => {
    const s = societyBounds()
    expect(contains(STAGE_RECT, s)).toBe(true)
    expect(s.y + s.h).toBeLessThan(STAGE.h * 0.7)
  })

  it('the table is inside the stage, and below the society', () => {
    const t = tableBounds()
    const s = societyBounds()
    expect(t.x).toBeGreaterThanOrEqual(0)
    expect(t.x + t.w).toBeLessThanOrEqual(STAGE.w)
    expect(t.y).toBeGreaterThan(s.y + s.h)
    expect(t.y).toBeLessThan(STAGE.h)
  })

  it('the two pictures are stacked, not side by side — the senses face the world', () => {
    // the whole point of one coordinate space: the table is under the constellation, so
    // the gap between them can carry the relationship without a rule drawn in it
    const s = societyBounds()
    const t = tableBounds()
    const sMid = s.x + s.w / 2
    const tMid = t.x + t.w / 2
    expect(Math.abs(sMid - tMid)).toBeLessThan(STAGE.w * 0.06)
  })

  it('a placement renders as one transform, spelled out in one place', () => {
    // the numbers are free to be tuned; what must not drift is that the transform and the
    // arithmetic in `place` describe the same placement, or the visitor's pointer lands
    // somewhere other than where the picture says it did
    for (const p of [SOCIETY, WORLD]) {
      expect(transformFor(p)).toBe(`translate(${p.tx} ${p.ty}) scale(${p.k})`)
      const pt = place(p, 100, 50)
      expect(pt.x).toBeCloseTo(p.tx + 100 * p.k)
      expect(pt.y).toBeCloseTo(p.ty + 50 * p.k)
    }
    expect(viewBoxOf({ x: 1, y: 2, w: 3, h: 4 })).toBe('1 2 3 4')
  })
})

describe('every framing looks at something', () => {
  it('the named framings lie on the stage', () => {
    for (const [name, r] of Object.entries(FRAMINGS)) {
      expect(contains(STAGE_RECT, r), `framing "${name}" runs off the stage`).toBe(true)
    }
  })

  it('"mind" holds the whole constellation', () => {
    expect(contains(FRAMINGS.mind, societyBounds())).toBe(true)
  })

  it('"wide" holds the constellation and the table together', () => {
    const t = tableBounds()
    expect(contains(FRAMINGS.wide, societyBounds())).toBe(true)
    expect(t.y).toBeGreaterThan(FRAMINGS.wide.y)
    expect(t.y).toBeLessThan(FRAMINGS.wide.y + FRAMINGS.wide.h)
  })

  it('"ground" holds the table and the senses that watch it', () => {
    const t = tableBounds()
    expect(t.y).toBeGreaterThan(FRAMINGS.ground.y)
    expect(t.y).toBeLessThan(FRAMINGS.ground.y + FRAMINGS.ground.h)
    const senses = place(SOCIETY, AGENT_POS['see-block'].x, AGENT_POS['see-block'].y)
    expect(senses.y).toBeGreaterThan(FRAMINGS.ground.y)
  })

  it('a site framing stays on the stage anywhere along the table, and is centred on it', () => {
    for (let x = 0; x <= 100; x += 5) {
      const f = siteFrame(x)
      expect(contains(STAGE_RECT, f), `site ${x} runs off the stage`).toBe(true)
      // the table must be in it, or the camera is looking at empty air
      const t = tableBounds()
      expect(t.y).toBeGreaterThan(f.y)
      expect(t.y).toBeLessThan(f.y + f.h)
    }
  })

  it('the tower site is actually framed on the tower', () => {
    const f = siteFrame(64)
    const tower = place(WORLD, 20 + 64 * 3.6, 182)
    expect(tower.x).toBeGreaterThan(f.x)
    expect(tower.x).toBeLessThan(f.x + f.w)
  })
})

describe('a vertical terminal is framed, not squeezed', () => {
  const PORTRAIT_ASPECTS = [9 / 16, 10 / 16, 3 / 4]

  it('every portrait framing shares the composition\'s centre', () => {
    // this is the whole fix: the slack a tall screen forces has to fall evenly around the
    // picture rather than all beneath it, and that is a property of where the region is
    // centred, not of how tall it is written
    const s = societyBounds()
    const t = tableBounds()
    expect(COMPOSITION_MID.y).toBeCloseTo((s.y + t.y) / 2, -1)
    for (const [name, r] of Object.entries(FRAMINGS_PORTRAIT)) {
      expect(r.x + r.w / 2, `portrait "${name}" is off-centre horizontally`).toBeCloseTo(
        COMPOSITION_MID.x,
      )
      expect(r.y + r.h / 2, `portrait "${name}" is off-centre vertically`).toBeCloseTo(
        COMPOSITION_MID.y,
      )
    }
  })

  it('the portrait shots are three distances, not three subjects', () => {
    // on a tall screen the fit is driven by width, so two regions of the same width show
    // exactly the same thing and the camera would never appear to move
    const widths = Object.values(FRAMINGS_PORTRAIT).map((r) => r.w)
    expect(new Set(widths).size).toBe(widths.length)
    expect(FRAMINGS_PORTRAIT.wide.w).toBeGreaterThan(FRAMINGS_PORTRAIT.mind.w)
    expect(FRAMINGS_PORTRAIT.mind.w).toBeGreaterThan(FRAMINGS_PORTRAIT.ground.w)
  })

  it.each(PORTRAIT_ASPECTS)(
    'at aspect %f the composition is centred in what is actually shown',
    (aspect) => {
      const s = societyBounds()
      const t = tableBounds()
      const contentMid = (s.y + t.y) / 2
      for (const name of ['wide', 'mind', 'ground'] as const) {
        const shown = fitToViewport(frameRect(name, 64, true), aspect)
        const above = contentMid - shown.y
        const below = shown.y + shown.h - contentMid
        expect(
          Math.abs(above - below) / shown.h,
          `portrait "${name}" at ${aspect} has its slack all on one side`,
        ).toBeLessThan(0.05)
      }
    },
  )

  it.each(PORTRAIT_ASPECTS)('at aspect %f nothing essential is cut off', (aspect) => {
    const t = tableBounds()
    for (const name of ['wide', 'mind'] as const) {
      const shown = fitToViewport(frameRect(name, 64, true), aspect)
      expect(contains(shown, societyBounds()), `portrait "${name}" cropped the society`).toBe(true)
    }
    // the ground shot is allowed to lose the constellation's edges — it is about the table
    for (const name of ['wide', 'mind', 'ground'] as const) {
      const shown = fitToViewport(frameRect(name, 64, true), aspect)
      expect(t.x, `portrait "${name}" cropped the table`).toBeGreaterThanOrEqual(shown.x)
      expect(t.x + t.w).toBeLessThanOrEqual(shown.x + shown.w)
      expect(t.y).toBeGreaterThan(shown.y)
      expect(t.y).toBeLessThan(shown.y + shown.h)
    }
  })

  it.each(PORTRAIT_ASPECTS)(
    'at aspect %f a site shot still keeps most of the constellation in frame',
    (aspect) => {
      // panning the full distance to a site on a narrow screen puts the frame's edge
      // through the agents; the portrait camera leans instead of travelling
      const s = societyBounds()
      for (let x = 0; x <= 100; x += 10) {
        const shown = fitToViewport(siteFrame(x, true), aspect)
        const lost =
          Math.max(0, shown.x - s.x) + Math.max(0, s.x + s.w - (shown.x + shown.w))
        expect(lost / s.w, `portrait site ${x} at ${aspect} cuts off too much`).toBeLessThan(0.15)
      }
    },
  )

  it('a portrait site shot is taller than a landscape one, and still on the stage', () => {
    for (let x = 0; x <= 100; x += 10) {
      const p = siteFrame(x, true)
      expect(contains(STAGE_RECT, p), `portrait site ${x} runs off the stage`).toBe(true)
      expect(p.h).toBeGreaterThan(siteFrame(x, false).h)
    }
  })
})

describe('the camera fits the screen instead of letterboxing it', () => {
  const ASPECTS = [16 / 9, 4 / 3, 21 / 9, 1, 9 / 16, 3 / 4]

  it.each(ASPECTS)('at aspect %f the viewBox has the screen\'s shape exactly', (aspect) => {
    for (const name of ['wide', 'mind', 'ground'] as const) {
      const fitted = fitToViewport(FRAMINGS[name], aspect)
      expect(Math.abs(fitted.w / fitted.h - aspect)).toBeLessThan(1e-6)
    }
  })

  it.each(ASPECTS)('at aspect %f a framing is never cropped, only grown', (aspect) => {
    for (const name of ['wide', 'mind', 'ground'] as const) {
      const r = FRAMINGS[name]
      const fitted = fitToViewport(r, aspect)
      expect(contains(fitted, r), `framing "${name}" lost content at ${aspect}`).toBe(true)
    }
  })

  it('a portrait terminal still sees the whole constellation when looking at the mind', () => {
    // the composition is stacked, so a tall screen reveals more rather than cutting sides
    const fitted = fitToViewport(FRAMINGS.mind, 9 / 16)
    expect(contains(fitted, societyBounds())).toBe(true)
  })

  it('a very wide projection still sees the whole table when looking at the ground', () => {
    const fitted = fitToViewport(FRAMINGS.ground, 21 / 9)
    const t = tableBounds()
    expect(t.x).toBeGreaterThanOrEqual(fitted.x)
    expect(t.x + t.w).toBeLessThanOrEqual(fitted.x + fitted.w)
  })

  it('a move between framings starts where it was and ends where it was sent', () => {
    const a = FRAMINGS.wide
    const b = FRAMINGS.mind
    expect(lerpRect(a, b, 0)).toEqual(a)
    expect(lerpRect(a, b, 1)).toEqual(b)
    const mid = lerpRect(a, b, 0.5)
    expect(mid.x).toBeCloseTo((a.x + b.x) / 2)
  })
})

describe('the shot list is complete', () => {
  it('every beat of the score has somewhere for the camera to look', () => {
    expect(beatsWithoutShot()).toEqual([])
  })

  it('no shot is written for a beat that does not exist', () => {
    const ids = new Set(SCORE.map((b) => b.id))
    for (const id of Object.keys(SHOTS)) {
      expect(ids.has(id), `shot "${id}" has no beat`).toBe(true)
    }
  })

  it('a silent beat never sits on the constellation alone', () => {
    // seventeen seconds of a still picture with no words reads as a broken installation;
    // pulling back puts the world in frame, and the world is always moving
    for (const beat of SCORE) {
      expect(shotFor(beat.id, true), `silent "${beat.id}" holds on the mind`).not.toBe('mind')
    }
    // and it changes nothing for a beat that is speaking
    expect(shotFor('invite', false)).toBe('mind')
    expect(shotFor('building', true)).toBe('site')
  })

  it('the beats about the world look at the world, and the beats about the parts look up', () => {
    expect(frameRect(SHOTS.building)).toEqual(frameRect('site'))
    expect(SHOTS.nobody).toBe('mind')
    expect(SHOTS.invite).toBe('mind')
    // the piece opens and closes on the whole thing: a mind, and the world it is in
    expect(SHOTS.open).toBe('wide')
    expect(SHOTS.forget).toBe('wide')
  })
})
