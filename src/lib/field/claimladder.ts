// src/lib/field/claimladder.ts — "The claim under review": the Field's signature figure, built at
// BUILD TIME from committed data only and drawn in the practice's own lab-plate grammar (ADR 0010:
// millimetre paper, hairlines, stamps, a caveat flag, margin notes — nothing shared with the
// atelier's sheet or the studio's stage).
//
// WHOSE VOICE IS WHOSE, and it is load-bearing (docs/wording-kanon.md, enc-2026-005):
//   · the CLAIM is the Meridian collective's — an interpretive classification it proposed;
//   · the LADDER, the RULING that caps what the claim may say, the two VERIFICATIONS and this
//     whole machine-readable record are the Meridian Research Runtime's — the architect's
//     ENGINEERING LINE, never the collective's research voice.
// The figure draws the second reviewing the first. Nothing in this module may attribute the
// runtime's ruling to the collective, and /on-record (the full export) belongs to the same
// engineering line.
//
// Pure and deterministic, the contract every generator in this repo carries: same inputs ⇒
// byte-identical SVG. No clock, no randomness, no network — every number below is read out of a
// committed JSON file, and a missing one FAILS the build rather than being defaulted into a
// plausible-looking figure.

import { escapeXml } from '@/lib/dataviz/geometry'
import { envelopeBand, ladderRungs, mmGrid, type LadderRung } from './strip'

// ---------------------------------------------------------------- inputs (injected, not imported)
// Injected rather than imported so this module stays pure and its test can feed it the real
// committed files through ordinary node imports (same pattern as studio/season.ts).

export interface ParallaxFinding {
  severity: string
  statement: string
}

export interface ParallaxVerification {
  urn: string
  recommendation: string
  confidence: number
  finding_count: number
  inspected: number
  reviewer_role: string
  findings: ParallaxFinding[]
}

export interface ParallaxExport {
  export_meta: { date_published: string; object_count: number; standard: string }
  claim: {
    urn: string
    content_hash: string
    analysis: string
    type: string
    status: string
    supporting: number
    contradicting: number
    verification_count: number
  }
  verifications: ParallaxVerification[]
  sources: { total: number; primary: number; secondary: number }
  dissent: { invariant: string; preserved: boolean }
}

/** One object body out of src/data/meridian/export/objects/ — only the fields this figure reads.
 *  The bodies carry far more; nothing else is touched. */
export interface ExportObject {
  id?: string
  kind?: string
  applies_to_analysis?: string
  ruled_ceiling?: string
  ruling_basis?: string
  conflicts_of_interest?: string[]
  [field: string]: unknown
}

export interface ClaimInput {
  parallax: ParallaxExport
  /** every object body, keyed by its FILE NAME inside src/data/meridian/export/objects/ */
  objects: Record<string, ExportObject>
}

// ---------------------------------------------------------------- model

export type ClaimFamily = 'ruling' | 'claim' | 'review' | 'evidence'

export interface ClaimMark {
  /** stable identity — the DOM data-key a tour scene and the client script address */
  key: string
  family: ClaimFamily
  /** the readout's first line */
  label: string
  /** the readout's and the panel's body — verbatim from the export where there is a verbatim */
  detail: string
  /** the committed file this mark's substance comes from */
  source: string
  /** figure-space anchor, so a call-out can be lettered at the mark it names */
  x: number
  y: number
  /** the finding this mark opens the detail panel at, if any */
  findingIndex?: number
}

export interface ClaimFinding {
  key: string
  severity: string
  /** verbatim from the export — never trimmed, never re-typed */
  statement: string
  verificationUrn: string
  recommendation: string
  confidence: number
  /** the committed object file the statement was read from */
  evidencePath: string
}

export interface ClaimVerificationView {
  key: string
  urn: string
  recommendation: string
  confidence: number
  reviewerRole: string
  inspected: number
  findings: ClaimFinding[]
  conflictsOfInterest: string[]
  evidencePath: string
  /** the caliper's jaw position — see CALIPER_NEAR/CALIPER_SPAN */
  x: number
  /** which side the caliper closes in from */
  side: 'left' | 'right'
}

export interface ClaimModel {
  claimUrn: string
  analysis: string
  claimType: string
  status: string
  supporting: number
  contradicting: number
  contentHash: string
  ruledCeiling: string
  rulingUrn: string
  rulingBasis: string
  rungs: LadderRung[]
  verifications: ClaimVerificationView[]
  /** every finding, ordered by severity (material before minor) — the order the detail panel steps */
  findings: ClaimFinding[]
  sources: { total: number; primary: number; secondary: number }
  dissent: { invariant: string; preserved: boolean }
  datePublished: string
  marks: ClaimMark[]
  counts: Record<ClaimFamily, number>
  provenance: string[]
}

// ---------------------------------------------------------------- geometry constants
// Millimetre-paper coordinates. Fixed numbers, not derived from content, so the plate keeps the
// same physical proportions whatever the export happens to carry.

const W = 1240
const H = 640
const GRID = { x0: 24, x1: 1216, y0: 40, y1: 600 }

const LADDER = { x0: 64, x1: 196, top: 120, step: 40, labelX: 206 }
const CLAIM = { cx: 700, cy: LADDER.top + 3 * LADDER.step, halfW: 116, halfH: 40 }

/** the closest a caliper jaw may come to the claim block, and how far the remaining confidence
 *  spreads it — the figure's one derived encoding, declared in its own key line and repeated in
 *  the table: the tighter the jaw, the higher the verification's own stated confidence */
const CALIPER_NEAR = 156
const CALIPER_SPAN = 400

const FINDING_RAIL_Y = 336
const FINDING_PITCH = 26
const SEVERITY_LEN: Record<string, number> = { material: 42, minor: 22 }
const SEVERITY_FALLBACK = 30

/** one decimal, so a derived coordinate never drags a float tail into the committed SVG */
const round = (n: number) => Math.round(n * 10) / 10

const EVIDENCE = { baseline: 540, primaryX: 700, secondaryX: 880, pitch: 22, tall: 46, short: 22 }
const DISSENT = { x: 64, y: 470, runTo: 660 }

/** material before minor, then export order — the order the detail panel walks and the table lists */
const SEVERITY_ORDER = ['material', 'minor']
const severityRank = (s: string) => {
  const i = SEVERITY_ORDER.indexOf(s)
  return i === -1 ? SEVERITY_ORDER.length : i
}

const EXPORT_DIR = 'src/data/meridian/export/objects'
const PARALLAX_PATH = 'src/data/meridian/parallax.json'
const SPEC_PATH =
  'docs/meridian-research-runtime-spec-v0.2.0/MERIDIAN_RESEARCH_RUNTIME_SPEC_v0.2.0.md § 5.1'

/** `urn:mrr:verification:01KY…` → `urn_mrr_verification_01KY….json`, the export's own file naming.
 *  Derived, never typed out: a re-export with new ULIDs must not need this file edited. */
export function objectFileName(urn: string): string {
  return `${urn.replace(/:/g, '_')}.json`
}

// ---------------------------------------------------------------- builder

/**
 * Derives the whole figure from the committed export. Every lookup that could silently produce a
 * half-figure throws instead: a missing verification body, a ruling that does not exist for this
 * claim's analysis, or more than one such ruling. A figure about verification that quietly drew
 * itself with a piece missing would be the exact failure it is about.
 */
export function buildClaimModel(input: ClaimInput): ClaimModel {
  const { parallax, objects } = input
  const claim = parallax.claim

  // the ruling that governs THIS claim: the MethodRuling issued for the claim's own analysis
  const rulings = Object.entries(objects).filter(
    ([, o]) => o.kind === 'MethodRuling' && o.applies_to_analysis === claim.analysis,
  )
  if (rulings.length !== 1) {
    throw new Error(
      `buildClaimModel: expected exactly one MethodRuling for analysis "${claim.analysis}", found ${rulings.length}`,
    )
  }
  const [rulingFile, ruling] = rulings[0]
  if (!ruling.ruled_ceiling) throw new Error(`buildClaimModel: ruling ${rulingFile} carries no ruled_ceiling`)

  const rungs = ladderRungs(ruling.ruled_ceiling, { top: LADDER.top, step: LADDER.step })

  // the two verifications, in the export's own order, closing in from opposite sides
  const verifications: ClaimVerificationView[] = parallax.verifications.map((v, vi) => {
    const file = objectFileName(v.urn)
    const body = objects[file]
    if (!body) throw new Error(`buildClaimModel: verification body ${EXPORT_DIR}/${file} is not in the export`)
    if (v.findings.length !== v.finding_count) {
      throw new Error(
        `buildClaimModel: ${v.urn} declares ${v.finding_count} findings and carries ${v.findings.length}`,
      )
    }
    const side: 'left' | 'right' = vi % 2 === 0 ? 'left' : 'right'
    const reach = CALIPER_NEAR + (1 - v.confidence) * CALIPER_SPAN
    const evidencePath = `${EXPORT_DIR}/${file}`
    return {
      key: `verification:${v.urn}`,
      urn: v.urn,
      recommendation: v.recommendation,
      confidence: v.confidence,
      reviewerRole: v.reviewer_role,
      inspected: v.inspected,
      conflictsOfInterest: body.conflicts_of_interest ?? [],
      evidencePath,
      side,
      x: round(side === 'left' ? CLAIM.cx - reach : CLAIM.cx + reach),
      findings: v.findings.map((f, fi) => ({
        key: `finding:${vi}-${fi}`,
        severity: f.severity,
        statement: f.statement,
        verificationUrn: v.urn,
        recommendation: v.recommendation,
        confidence: v.confidence,
        evidencePath,
      })),
    }
  })

  // the panel's walking order: severity first, export order within a severity
  const findings = verifications
    .flatMap((v) => v.findings)
    .slice()
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.key.localeCompare(b.key))
  const findingPos = new Map(findings.map((f, i) => [f.key, i]))

  const marks: ClaimMark[] = []

  for (const rung of rungs) {
    marks.push({
      key: `rung:${rung.ceiling}`,
      family: 'ruling',
      label: rung.ceiling,
      detail: rung.ruled
        ? `the ceiling this claim was ruled to — the runtime refuses claim language above it (ruling ${ruling.id ?? rulingFile}, basis ${ruling.ruling_basis ?? 'deterministic_rule'})`
        : rung.permitted
          ? 'weaker than the ruled ceiling — permitted language'
          : 'above the ruled ceiling — language the runtime refuses for this claim',
      source: `${EXPORT_DIR}/${rulingFile}`,
      x: LADDER.x1,
      y: rung.y,
    })
  }

  marks.push({
    key: 'claim',
    family: 'claim',
    label: claim.analysis,
    detail:
      `${claim.type} claim, status ${claim.status} — ${claim.supporting} supporting, ` +
      `${claim.contradicting} contradicting, ${claim.verification_count} verifications. ${claim.content_hash}`,
    source: PARALLAX_PATH,
    x: CLAIM.cx,
    y: CLAIM.cy,
    findingIndex: 0,
  })

  for (const v of verifications) {
    marks.push({
      key: v.key,
      family: 'review',
      label: `${v.recommendation} · confidence ${v.confidence.toFixed(2)}`,
      detail: `${v.reviewerRole} — ${v.findings.length} finding${v.findings.length === 1 ? '' : 's'}, ${v.inspected} inspected`,
      source: v.evidencePath,
      x: v.x,
      y: CLAIM.cy,
      findingIndex: v.findings[0] ? findingPos.get(v.findings[0].key) : undefined,
    })
    v.findings.forEach((f, fi) => {
      marks.push({
        key: f.key,
        family: 'review',
        label: `${f.severity} finding · ${v.recommendation}`,
        detail: f.statement,
        source: f.evidencePath,
        x: findingTickX(v, fi),
        y: FINDING_RAIL_Y,
        findingIndex: findingPos.get(f.key),
      })
    })
  }

  marks.push({
    key: 'evidence:primary',
    family: 'evidence',
    label: `primary sources · ${parallax.sources.primary}`,
    detail: `${parallax.sources.primary} of ${parallax.sources.total} evidence anchors are primary sources`,
    source: PARALLAX_PATH,
    x: EVIDENCE.primaryX,
    y: EVIDENCE.baseline,
  })
  marks.push({
    key: 'evidence:secondary',
    family: 'evidence',
    label: `secondary sources · ${parallax.sources.secondary}`,
    detail: `${parallax.sources.secondary} of ${parallax.sources.total} evidence anchors are secondary sources`,
    source: PARALLAX_PATH,
    x: EVIDENCE.secondaryX,
    y: EVIDENCE.baseline,
  })
  marks.push({
    key: 'dissent',
    family: 'ruling',
    label: `dissent ${parallax.dissent.preserved ? 'preserved' : 'not preserved'} · ${parallax.dissent.invariant}`,
    detail:
      'the two verifications disagree and both stay on the record — the runtime keeps dissent rather than averaging it away',
    source: PARALLAX_PATH,
    x: DISSENT.x,
    y: DISSENT.y,
  })

  const counts: Record<ClaimFamily, number> = { ruling: 0, claim: 0, review: 0, evidence: 0 }
  for (const m of marks) counts[m.family]++

  return {
    claimUrn: claim.urn,
    analysis: claim.analysis,
    claimType: claim.type,
    status: claim.status,
    supporting: claim.supporting,
    contradicting: claim.contradicting,
    contentHash: claim.content_hash,
    ruledCeiling: ruling.ruled_ceiling,
    rulingUrn: ruling.id ?? rulingFile,
    rulingBasis: ruling.ruling_basis ?? 'deterministic_rule',
    rungs,
    verifications,
    findings,
    sources: parallax.sources,
    dissent: parallax.dissent,
    datePublished: parallax.export_meta.date_published,
    marks,
    counts,
    provenance: [
      PARALLAX_PATH,
      `${EXPORT_DIR}/${objectFileName(claim.urn)}`,
      `${EXPORT_DIR}/${rulingFile}`,
      ...verifications.map((v) => v.evidencePath),
      SPEC_PATH,
    ],
  }
}

function findingTickX(v: ClaimVerificationView, index: number): number {
  const n = v.findings.length
  return round(v.x + (index - (n - 1) / 2) * FINDING_PITCH)
}

// ---------------------------------------------------------------- SVG

export interface ClaimRenderOptions {
  /** families drawn at full strength; empty or absent means all of them */
  filter?: string[]
  /** mark keys drawn de-emphasized without being removed */
  dim?: string[]
  /** the one mark key drawn as chosen */
  select?: string
  /** free call-outs lettered at the marks they name */
  annotate?: { key: string; text: string }[]
  /** a still carries no focus hooks — no tabindex behind a scene's prose */
  still?: boolean
  /** the SVG element's own id (a page may carry several renditions) */
  svgId?: string
  /** accessible name */
  label?: string
  /** the plate's own head line */
  headline?: string
  /** the band label over the permitted region of the ladder */
  permittedLabel?: string
  /** margin notes: [ladder, calipers, evidence] — the field's own left-margin voice */
  marginNotes?: { ladder: string; calipers: string; evidence: string }
}

/** Builds the claim plate as one SVG string. Appearance lives entirely in field-plate.css under
 *  `.field-surface` (ADR 0010); this function emits classes and geometry, never a colour. */
export function buildClaimSvg(model: ClaimModel, opts: ClaimRenderOptions = {}): string {
  const on = (m: ClaimMark) => !opts.filter?.length || opts.filter.includes(m.family)
  const dimmed = (m: ClaimMark) => opts.dim?.includes(m.key) ?? false
  const byKey = new Map(model.marks.map((m) => [m.key, m]))

  const attrs = (m: ClaimMark, cls: string): string => {
    const parts = [`class="${cls}"`, `data-family="${m.family}"`]
    if (on(m)) parts.push('data-on=""')
    if (dimmed(m)) parts.push('data-dim=""')
    if (opts.select === m.key) parts.push('data-sel=""')
    if (!opts.still) parts.push(`data-key="${escapeXml(m.key)}"`, 'tabindex="0"', 'role="button"')
    return parts.join(' ')
  }
  const mark = (key: string) => {
    const m = byKey.get(key)
    if (!m) throw new Error(`buildClaimSvg: mark "${key}" is not in the model`)
    return m
  }

  const s: string[] = []
  s.push(
    `<svg id="${escapeXml(opts.svgId ?? 'claim-plate')}" class="fd-claim" viewBox="0 0 ${W} ${H}" role="img"` +
      ` preserveAspectRatio="xMidYMid meet" aria-label="${escapeXml(opts.label ?? defaultLabel(model))}">`,
  )
  s.push(mmGrid(GRID.x0, GRID.x1, GRID.y0, GRID.y1))

  // ——— plate head ——————————————————————————————————————————————————————————
  s.push(`<path class="fd-hair" d="M${GRID.x0} 72 H${GRID.x1}"/>`)
  if (opts.headline) {
    s.push(`<text class="t-plate" x="${GRID.x0 + 6}" y="64">${escapeXml(opts.headline)}</text>`)
  }
  s.push(
    `<text class="t-n" x="${GRID.x1 - 6}" y="64" text-anchor="end">` +
      `${escapeXml(`${model.claimUrn} · ${model.status}`)}</text>`,
  )

  // ——— the decision ladder, and the band of language the ruling permits ——————
  const lastRung = model.rungs[model.rungs.length - 1]
  const firstPermitted = model.rungs.find((r) => r.permitted)!
  s.push(
    envelopeBand({
      x0: 52,
      x1: 340,
      yTop: firstPermitted.y - 20,
      yBottom: lastRung.y + 22,
      label: opts.permittedLabel,
      // ABOVE the band, in the clear gap between the last refused rung and the ruled one: lettered
      // inside, it ran straight across the two ladder stiles and the ruled rung's own bar
      labelAt: 'above',
    }),
  )
  s.push(`<path class="fd-stile" d="M${LADDER.x0} ${LADDER.top - 22} V${lastRung.y + 22} M${LADDER.x1} ${LADDER.top - 22} V${lastRung.y + 22}"/>`)
  for (const rung of model.rungs) {
    const m = mark(`rung:${rung.ceiling}`)
    const cls = rung.ruled ? 'fd-rung fd-rung-ruled' : rung.permitted ? 'fd-rung' : 'fd-rung fd-rung-refused'
    s.push(
      `<g ${attrs(m, cls)}>` +
        `<path class="fd-rung-bar" d="M${LADDER.x0} ${rung.y} H${LADDER.x1}"/>` +
        `<text class="fd-rung-lab" x="${LADDER.labelX}" y="${rung.y + 4}">${escapeXml(rung.ceiling)}</text>` +
        `<rect class="fd-hit" x="${LADDER.x0 - 6}" y="${rung.y - 14}" width="${LADDER.labelX + 190 - LADDER.x0}" height="28"/>` +
        `<title>${escapeXml(`${rung.ceiling} — ${m.detail}`)}</title></g>`,
    )
  }

  // ——— the claim, stamped on the rung the ruling gave it ————————————————————
  const claimMark = mark('claim')
  const cx = CLAIM.cx
  const cy = CLAIM.cy
  const nameLines = claimNameLines(model.analysis)
  s.push(`<path class="fd-leader" d="M${LADDER.labelX + 194} ${cy} H${cx - CLAIM.halfW}"/>`)
  s.push(
    `<g ${attrs(claimMark, 'fd-claim-block')}>` +
      `<rect class="fd-claim-plate" x="${cx - CLAIM.halfW}" y="${cy - CLAIM.halfH}" width="${CLAIM.halfW * 2}" height="${CLAIM.halfH * 2}"/>` +
      `<text class="fd-claim-status" x="${cx}" y="${cy - 20}" text-anchor="middle">${escapeXml(model.status.toUpperCase())}</text>` +
      nameLines
        .map(
          (line, i) =>
            `<text class="fd-claim-name" x="${cx}" y="${cy - 2 + i * 16}" text-anchor="middle">${escapeXml(line)}</text>`,
        )
        .join('') +
      `<text class="fd-claim-tally" x="${cx}" y="${cy + 32}" text-anchor="middle">` +
      `${escapeXml(`${model.supporting} supporting · ${model.contradicting} contradicting`)}</text>` +
      `<title>${escapeXml(`${model.analysis} — ${claimMark.detail}`)}</title></g>`,
  )

  // ——— the two calipers, closing in from opposite sides ————————————————————
  for (const v of model.verifications) {
    const m = mark(v.key)
    const dir = v.side === 'left' ? 1 : -1 // the direction the jaw points, toward the claim
    const jawTop = cy - 52
    const jawBottom = cy + 52
    const tip = v.x + dir * 26
    s.push(
      `<g ${attrs(m, `fd-caliper fd-caliper-${v.recommendation}`)}>` +
        `<path class="fd-caliper-beam" d="M${v.x} ${jawTop} V${jawBottom}"/>` +
        `<path class="fd-caliper-jaw" d="M${v.x} ${jawTop} H${tip} M${v.x} ${jawBottom} H${tip}"/>` +
        `<path class="fd-caliper-point" d="M${tip} ${cy - 9} V${cy + 9}"/>` +
        `<text class="fd-caliper-rec" x="${v.x}" y="${jawTop - 26}" text-anchor="middle">${escapeXml(v.recommendation.toUpperCase())}</text>` +
        `<text class="fd-caliper-conf" x="${v.x}" y="${jawTop - 12}" text-anchor="middle">` +
        `${escapeXml(`confidence ${v.confidence.toFixed(2)} · ${v.findings.length} finding${v.findings.length === 1 ? '' : 's'}`)}</text>` +
        `<rect class="fd-hit" x="${v.x - 22}" y="${jawTop - 34}" width="44" height="${jawBottom - jawTop + 40}"/>` +
        `<title>${escapeXml(`${v.recommendation} (confidence ${v.confidence.toFixed(2)}) — ${m.detail}`)}</title></g>`,
    )

    // findings: a tick per finding on the caliper's own rail, its length the severity
    s.push(`<path class="fd-hair" d="M${findingTickX(v, 0) - 12} ${FINDING_RAIL_Y} H${findingTickX(v, v.findings.length - 1) + 12}"/>`)
    v.findings.forEach((f, fi) => {
      const fm = mark(f.key)
      const len = SEVERITY_LEN[f.severity] ?? SEVERITY_FALLBACK
      const fx = findingTickX(v, fi)
      s.push(
        `<g ${attrs(fm, `fd-finding fd-finding-${f.severity}`)}>` +
          `<path class="fd-finding-tick" d="M${fx} ${FINDING_RAIL_Y} V${FINDING_RAIL_Y + len}"/>` +
          `<rect class="fd-hit" x="${fx - 11}" y="${FINDING_RAIL_Y - 4}" width="22" height="${len + 10}"/>` +
          `<title>${escapeXml(`${f.severity} — ${f.statement}`)}</title></g>`,
      )
    })
    s.push(
      `<text class="t-n" x="${v.x}" y="${FINDING_RAIL_Y + 60}" text-anchor="middle">` +
        `${escapeXml(severityTally(v.findings))}</text>`,
    )
  }

  // ——— evidence anchors: a tick column, primary and secondary kept apart ————
  const ev = [
    { m: mark('evidence:primary'), n: model.sources.primary, x: EVIDENCE.primaryX, len: EVIDENCE.tall, cls: 'fd-anchor-primary' },
    { m: mark('evidence:secondary'), n: model.sources.secondary, x: EVIDENCE.secondaryX, len: EVIDENCE.short, cls: 'fd-anchor-secondary' },
  ]
  for (const group of ev) {
    const width = Math.max(0, group.n - 1) * EVIDENCE.pitch
    s.push(
      `<g ${attrs(group.m, `fd-anchors ${group.cls}`)}>` +
        `<path class="fd-hair" d="M${group.x - 10} ${EVIDENCE.baseline} H${group.x + width + 10}"/>` +
        Array.from({ length: group.n }, (_, i) => {
          const x = group.x + i * EVIDENCE.pitch
          return `<path class="fd-anchor" d="M${x} ${EVIDENCE.baseline} V${EVIDENCE.baseline - group.len}"/>`
        }).join('') +
        `<text class="t-n" x="${group.x}" y="${EVIDENCE.baseline + 18}">${escapeXml(group.m.label)}</text>` +
        `<rect class="fd-hit" x="${group.x - 12}" y="${EVIDENCE.baseline - group.len - 6}" width="${width + 26}" height="${group.len + 30}"/>` +
        `<title>${escapeXml(`${group.m.label} — ${group.m.detail}`)}</title></g>`,
    )
  }

  // ——— the dissent invariant: the caveat flag and its standing line ————————
  const dissent = mark('dissent')
  s.push(
    `<g ${attrs(dissent, 'fd-dissent')}>` +
      `<path class="flag-pole" d="M${DISSENT.x} ${DISSENT.y - 34} V${DISSENT.y + 6}"/>` +
      `<path class="flag" d="M${DISSENT.x} ${DISSENT.y - 34} l16 5 l-16 5 Z"/>` +
      `<path class="obl-f" d="M${DISSENT.x} ${DISSENT.y + 6} H${DISSENT.runTo}"/>` +
      `<text class="t-cav" x="${DISSENT.x + 22}" y="${DISSENT.y - 26}">${escapeXml(dissent.label)}</text>` +
      `<rect class="fd-hit" x="${DISSENT.x - 8}" y="${DISSENT.y - 42}" width="${DISSENT.runTo - DISSENT.x + 16}" height="56"/>` +
      `<title>${escapeXml(`${dissent.label} — ${dissent.detail}`)}</title></g>`,
  )

  // ——— margin notes: a lab hand's word over each region, on its own underline ————
  if (opts.marginNotes) {
    const jaws = model.verifications.map((v) => v.x)
    const left = Math.min(...jaws, cx) - 30
    const right = Math.max(...jaws, cx) + 30
    s.push(marginNote(opts.marginNotes.ladder, LADDER.x0, LADDER.top - 32, 276))
    s.push(marginNote(opts.marginNotes.calipers, left, cy - 104, right - left))
    s.push(marginNote(opts.marginNotes.evidence, EVIDENCE.primaryX, EVIDENCE.baseline - 70, 470))
  }

  // ——— a scene's call-outs, lettered at the marks they name ————————————————
  for (const note of opts.annotate ?? []) {
    const m = byKey.get(note.key)
    if (!m) continue
    s.push(
      `<g class="fd-note"><path d="M${m.x} ${m.y + 14} V${m.y + 34}"/>` +
        `<text x="${m.x}" y="${m.y + 50}" text-anchor="middle">${escapeXml(note.text)}</text></g>`,
    )
  }

  s.push('</svg>')
  return s.join('\n')
}

/**
 * Breaks a hyphenated analysis name into at most two lines, at the hyphen nearest the middle.
 * Deterministic (no measurement, no font metrics) and only where the name would otherwise run out
 * past its own plate — which the export's real name does: "instantiation-vs-reference-
 * classification" is forty-one characters and overran the block into the right-hand caliper.
 */
export function claimNameLines(name: string, maxChars = 26): string[] {
  if (name.length <= maxChars) return [name]
  const parts = name.split('-')
  let cut = -1
  let bestDelta = Infinity
  let run = 0
  for (let i = 0; i < parts.length - 1; i++) {
    run += parts[i].length + 1
    const delta = Math.abs(run - name.length / 2)
    if (delta < bestDelta) {
      bestDelta = delta
      cut = run
    }
  }
  return cut > 0 ? [name.slice(0, cut), name.slice(cut)] : [name]
}

function marginNote(text: string, x: number, y: number, width: number): string {
  return (
    `<g class="fd-margin">` +
    `<text x="${round(x)}" y="${y}">${escapeXml(text)}</text>` +
    `<path d="M${round(x)} ${y + 6} H${round(x + width)}"/>` +
    `</g>`
  )
}


function severityTally(findings: readonly ClaimFinding[]): string {
  const counts = new Map<string, number>()
  for (const f of findings) counts.set(f.severity, (counts.get(f.severity) ?? 0) + 1)
  return [...counts.entries()].map(([sev, n]) => `${n} ${sev}`).join(' · ')
}

function defaultLabel(model: ClaimModel): string {
  return (
    `The claim under review: one ${model.claimType} claim, status ${model.status}, standing on the ` +
    `${model.ruledCeiling} rung of the runtime's claim-language ladder, with ${model.verifications.length} ` +
    `dissenting verifications closing in on it (${model.findings.length} findings) and ${model.sources.total} ` +
    `evidence anchors below. The same record follows as a table.`
  )
}

// ---------------------------------------------------------------- the table floor

export interface ClaimRow {
  severity: string
  statement: string
  verification: string
  evidence: string
  [column: string]: string
}

/** The claim table's columns — here rather than in the component so the figure and the record
 *  beside it cannot drift apart. Typed structurally to match TableFallback.astro's TableColumn
 *  without importing an .astro module into a pure library. */
export const CLAIM_COLUMNS: { key: string; label: string; nowrap?: boolean }[] = [
  { key: 'severity', label: 'severity', nowrap: true },
  { key: 'statement', label: 'statement (verbatim)' },
  { key: 'verification', label: 'verification' },
  { key: 'evidence', label: 'evidence path' },
]

/**
 * One row per finding, plus one CONFLICT-OF-INTEREST row per verification, quoting the export's own
 * declaration verbatim. The COI rows are not decoration: both verifications declare that the same
 * responsible human stands behind reviewer and reviewed, and a figure about adversarial review that
 * left that out of its own record would be making the reader's judgement for them.
 */
export function claimRows(model: ClaimModel): ClaimRow[] {
  const findingRows: ClaimRow[] = model.findings.map((f) => ({
    severity: f.severity,
    statement: f.statement,
    verification: `${f.verificationUrn} — ${f.recommendation}, confidence ${f.confidence.toFixed(2)}`,
    evidence: f.evidencePath,
  }))
  const coiRows: ClaimRow[] = model.verifications
    .filter((v) => v.conflictsOfInterest.length > 0)
    .map((v) => ({
      severity: 'conflict of interest (declared)',
      statement: v.conflictsOfInterest.join(' — '),
      verification: `${v.urn} — ${v.recommendation}, confidence ${v.confidence.toFixed(2)}`,
      evidence: v.evidencePath,
    }))
  return [...findingRows, ...coiRows]
}
