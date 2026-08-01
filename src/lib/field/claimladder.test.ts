// The claim figure is derived or it is not drawn: every number, every statement and every path in
// "The claim under review" comes out of the committed MRR export, and this file feeds the builder
// the REAL files rather than a fixture, so a re-export that changes the record changes the figure —
// or fails here.
//
// The two things worth failing loudly over, both tested below: a missing verification body (a
// figure about verification must not draw itself with a verification missing), and the conflict-of-
// interest declarations reaching the table verbatim (hiding them would be the dishonest choice).
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import parallax from '@/data/meridian/parallax.json'
import {
  CLAIM_COLUMNS,
  buildClaimModel,
  buildClaimSvg,
  claimNameLines,
  claimRows,
  objectFileName,
  type ClaimInput,
  type ExportObject,
  type ParallaxExport,
} from './claimladder'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const OBJECT_DIR = `${ROOT}src/data/meridian/export/objects`

const objects: Record<string, ExportObject> = Object.fromEntries(
  readdirSync(OBJECT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => [f, JSON.parse(readFileSync(`${OBJECT_DIR}/${f}`, 'utf8')) as ExportObject]),
)

const input: ClaimInput = { parallax: parallax as unknown as ParallaxExport, objects }
const model = buildClaimModel(input)

describe('the model is read off the export, never typed in', () => {
  it('carries the claim as the export states it', () => {
    expect(model.status).toBe('contested')
    expect(model.supporting).toBe(parallax.claim.supporting)
    expect(model.contradicting).toBe(parallax.claim.contradicting)
    expect(model.verifications).toHaveLength(parallax.claim.verification_count)
    expect(model.claimUrn).toBe(parallax.claim.urn)
  })

  it('takes the ceiling from the ruling issued for THIS claim’s analysis', () => {
    expect(model.ruledCeiling).toBe('associational_unadjusted')
    expect(model.rungs.find((r) => r.ruled)?.ceiling).toBe(model.ruledCeiling)
    // the export carries a second ruling, for the other analysis — it must not be the one picked
    const otherRuling = Object.values(objects).find(
      (o) => o.kind === 'MethodRuling' && o.applies_to_analysis !== model.analysis,
    )
    expect(otherRuling).toBeDefined()
    expect(model.rulingUrn).not.toBe(otherRuling!.id)
  })

  it('keeps every finding statement verbatim, at its declared severity', () => {
    const fromExport = parallax.verifications.flatMap((v) => v.findings)
    expect(model.findings).toHaveLength(fromExport.length)
    for (const f of fromExport) {
      const drawn = model.findings.find((m) => m.statement === f.statement)
      expect(drawn, `finding not carried verbatim: ${f.statement.slice(0, 60)}…`).toBeDefined()
      expect(drawn!.severity).toBe(f.severity)
    }
  })

  it('walks the findings by severity — material before minor', () => {
    const severities = model.findings.map((f) => f.severity)
    expect(severities.lastIndexOf('material')).toBeLessThan(severities.indexOf('minor'))
  })

  it('closes the more confident caliper in tighter — the figure’s one derived encoding', () => {
    const [a, b] = model.verifications
    const reach = (v: (typeof model.verifications)[number]) => Math.abs(v.x - 700)
    expect(a.confidence).toBeLessThan(b.confidence)
    expect(reach(a)).toBeGreaterThan(reach(b))
    // and neither jaw's INNER POINT ever reaches inside the claim block it is measuring: the jaw
    // arm is 26 units long, the block is 116 wide from its centre
    for (const v of model.verifications) expect(reach(v) - 26).toBeGreaterThan(116)
  })

  it('wraps the analysis name instead of letting it run out past its own plate', () => {
    expect(claimNameLines('instantiation-vs-reference-classification')).toEqual([
      'instantiation-vs-',
      'reference-classification',
    ])
    expect(claimNameLines('short-name')).toEqual(['short-name'])
    // a long name with nowhere to break stays one line rather than being cut mid-word
    expect(claimNameLines('averyverylongsinglewordwithnohyphenatall')).toHaveLength(1)
  })

  it('names every file it drew from, and each one exists', () => {
    expect(model.provenance).toContain('src/data/meridian/parallax.json')
    for (const v of model.verifications) expect(model.provenance).toContain(v.evidencePath)
    for (const path of model.provenance) {
      const file = path.split(' § ')[0]
      expect(() => readFileSync(`${ROOT}${file}`, 'utf8'), `${file} is named as provenance but missing`).not.toThrow()
    }
  })

  it('derives an object’s file name from its urn rather than hardcoding it', () => {
    expect(objectFileName('urn:mrr:verification:01KY4RMN5CACRH52BEKZ54RXYH')).toBe(
      'urn_mrr_verification_01KY4RMN5CACRH52BEKZ54RXYH.json',
    )
  })
})

describe('the builder fails loud rather than drawing a half figure', () => {
  it('refuses a verification whose body is not in the export', () => {
    const thinned = { ...objects }
    delete thinned[objectFileName(parallax.verifications[0].urn)]
    expect(() => buildClaimModel({ ...input, objects: thinned })).toThrow(/is not in the export/)
  })

  it('refuses a claim with no ruling for its analysis', () => {
    const noRuling = Object.fromEntries(Object.entries(objects).filter(([, o]) => o.kind !== 'MethodRuling'))
    expect(() => buildClaimModel({ ...input, objects: noRuling })).toThrow(/expected exactly one MethodRuling/)
  })

  it('refuses a verification whose declared finding count disagrees with its findings', () => {
    const bent = structuredClone(parallax) as unknown as ParallaxExport
    bent.verifications[0].finding_count = 99
    expect(() => buildClaimModel({ ...input, parallax: bent })).toThrow(/declares 99 findings/)
  })
})

describe('the table floor carries what the figure cannot', () => {
  const rows = claimRows(model)

  it('has one row per finding plus one declared conflict of interest per verification', () => {
    expect(rows).toHaveLength(model.findings.length + model.verifications.length)
    expect(rows.filter((r) => r.severity === 'conflict of interest (declared)')).toHaveLength(2)
  })

  it('quotes the export’s own conflict-of-interest declarations verbatim', () => {
    const coi = rows.filter((r) => r.severity === 'conflict of interest (declared)')
    for (const v of model.verifications) {
      for (const declaration of v.conflictsOfInterest) {
        expect(coi.some((r) => r.statement.includes(declaration))).toBe(true)
      }
    }
    // the sentence the whole record turns on — the same human behind reviewer and reviewed
    expect(coi.map((r) => r.statement).join(' ')).toContain('the same responsible human')
  })

  it('names an evidence path on every row', () => {
    for (const r of rows) expect(r.evidence).toMatch(/^src\/data\/meridian\/export\/objects\//)
  })

  it('declares columns the rows actually fill', () => {
    for (const c of CLAIM_COLUMNS) for (const r of rows) expect(typeof r[c.key]).toBe('string')
  })
})

describe('the plate is pure, complete and keyed', () => {
  it('renders byte-identically for the same input', () => {
    expect(buildClaimSvg(model)).toBe(buildClaimSvg(structuredClone(model)))
  })

  it('draws a keyed, focusable group for every mark in the model', () => {
    const svg = buildClaimSvg(model)
    for (const m of model.marks) expect(svg).toContain(`data-key="${m.key}"`)
    expect(svg.match(/tabindex="0"/g) ?? []).toHaveLength(model.marks.length)
  })

  it('carries every finding statement in a native title — nothing needs JavaScript to be read', () => {
    const svg = buildClaimSvg(model)
    for (const f of model.findings) {
      // the SVG is XML-escaped; compare on the escaped form of the first clause
      const head = f.statement.slice(0, 40).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
      expect(svg).toContain(head)
    }
  })

  it('honours filter, dim and select without moving a mark', () => {
    const plain = buildClaimSvg(model)
    const focused = buildClaimSvg(model, { filter: ['review'], dim: ['claim'], select: 'dissent' })
    expect(focused).toContain('data-dim=""')
    expect(focused).toContain('data-sel=""')
    // same geometry, different attributes: every rung bar path is unchanged
    for (const rung of model.rungs) {
      const d = `d="M64 ${rung.y} H196"`
      expect(plain).toContain(d)
      expect(focused).toContain(d)
    }
  })

  it('a still has no tab stops and no mark keys', () => {
    const still = buildClaimSvg(model, { still: true, svgId: 'still-a' })
    expect(still).not.toContain('tabindex')
    expect(still).not.toContain('data-key')
    expect(still).toContain('id="still-a"')
  })

  it('draws the permitted-language band as an ink wash with a dashed edge', () => {
    const svg = buildClaimSvg(model, { permittedLabel: 'PERMITTED BY THE RULING' })
    expect(svg).toContain('class="env-wash"')
    expect(svg).toContain('class="env-edge"')
    expect(svg).toContain('PERMITTED BY THE RULING')
  })

  it('refuses to annotate a mark it does not carry, and refuses an unknown key outright', () => {
    expect(buildClaimSvg(model, { annotate: [{ key: 'nope', text: 'x' }] })).not.toContain('>x<')
    const broken = structuredClone(model)
    broken.marks = broken.marks.filter((m) => m.key !== 'dissent')
    expect(() => buildClaimSvg(broken)).toThrow(/is not in the model/)
  })
})
