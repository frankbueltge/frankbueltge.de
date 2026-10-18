// src/lib/engines/share-card.ts — the preview image of a shared practice page (2026-10-18).
//
// Two kinds, and only two, after the shelf's rule (src/config/selected-works.ts: no picture is made
// up). Where the page's maker committed a still of it, the preview IS that still, cut to the
// 1200 × 630 a link preview shows (cropped from the top, where a work's page begins, and scaled; no
// word added). Where none exists, the preview is a card on the paper ground (src/styles/paper.css):
// the practice in its own voice colour, the page's own title, what it is, and the site's address.
// It shows nothing the page does not say.
//
// The card is drawn with CanvasKit (Skia in WebAssembly), the renderer the house's other link cards
// already use (astro-og-canvas), with the paper's own type: Literata for what is said, Schibsted
// Grotesk for what is labelled, both self-hosted; JetBrains Mono stands behind them for any glyph
// they lack. The still is cut with sharp, which ships with Astro's image service. Nothing here is
// fetched, and nothing depends on the clock: the same page gives the same picture.

import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

export const CARD = { width: 1200, height: 630 } as const

/** The paper ground's tokens (src/styles/paper.css, light theme), as the card paints them. */
export const PAPER = {
  ground: '#f3efe6',
  ink: '#161412',
  ink2: '#3a352d',
  muted: '#6a645a',
  rule: '#d8d2c4',
} as const

/** Each practice's voice on paper (paper.css, `--pp-c-*`), and the step its small text uses. */
export const VOICE: Record<string, { mark: string; text: string }> = {
  field: { mark: '#2c6aa3', text: '#2c6aa3' },
  atelier: { mark: '#7548dc', text: '#7548dc' },
  studio: { mark: '#bf5427', text: '#aa4b23' },
}
const NEUTRAL_VOICE = { mark: PAPER.ink, text: PAPER.ink }
export const voiceOf = (practice: string) => VOICE[practice] ?? NEUTRAL_VOICE

export interface CardInput {
  /** the practice, in its own name: `The Field · Meridian` */
  kicker: string
  title: string
  /** what the page is, and when: `presentation · cycle 007 · 12 October 2026` */
  line: string | null
  /** the mirror namespace, for the voice colour */
  practice: string
}

// ── fonts ───────────────────────────────────────────────────────────────────────────────────

const FONT_FILES = (root: string) => [
  { family: 'Literata', file: join(root, 'node_modules/@fontsource-variable/literata/files/literata-latin-wght-normal.woff2') },
  { family: 'Literata Ext', file: join(root, 'node_modules/@fontsource-variable/literata/files/literata-latin-ext-wght-normal.woff2') },
  { family: 'Schibsted', file: join(root, 'node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2') },
  { family: 'Schibsted Ext', file: join(root, 'node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-ext-wght-normal.woff2') },
  { family: 'JetBrains Mono', file: join(root, 'src/assets/og-fonts/JetBrainsMono-Regular.ttf') },
]
const SERIF = ['Literata', 'Literata Ext', 'JetBrains Mono']
const SANS = ['Schibsted', 'Schibsted Ext', 'JetBrains Mono']

// The CanvasKit module's own types are not worth importing for the dozen calls made here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CK = any

interface Renderer {
  ck: CK
  fonts: CK
}

let renderer: Promise<Renderer> | null = null

async function getRenderer(root: string): Promise<Renderer> {
  renderer ??= (async () => {
    const require = createRequire(join(root, 'package.json'))
    const wasm = require.resolve('canvaskit-wasm/bin/full/canvaskit.wasm')
    const mod = (await import('canvaskit-wasm/full')) as unknown as { default: (opts: object) => Promise<CK> }
    const ck = await mod.default({ locateFile: (file: string) => join(wasm, '..', file) })
    const fonts = ck.TypefaceFontProvider.Make()
    for (const { family, file } of FONT_FILES(root)) {
      if (existsSync(file)) fonts.registerFont(new Uint8Array(readFileSync(file)), family)
    }
    return { ck, fonts }
  })()
  try {
    return await renderer
  } catch (e) {
    renderer = null
    throw e
  }
}

const rgb = (ck: CK, hex: string) => {
  const n = Number.parseInt(hex.slice(1), 16)
  return ck.Color((n >> 16) & 255, (n >> 8) & 255, n & 255, 1)
}

// ── the card ────────────────────────────────────────────────────────────────────────────────

const PAD_X = 84
const RULE_W = 14
const TOP = 62
const FOOT_Y = 538
/** Title sizes, largest first, each with the lines it may take: a long title gets smaller type
 *  and a fourth line before it is cut. */
const TITLE_SIZES = [
  { size: 70, lines: 3 },
  { size: 62, lines: 3 },
  { size: 56, lines: 3 },
  { size: 50, lines: 4 },
  { size: 44, lines: 4 },
] as const

/** The card on the paper ground, as PNG bytes. */
export async function renderCard(input: CardInput, root: string = process.cwd()): Promise<Uint8Array> {
  const { ck, fonts } = await getRenderer(root)
  const surface = ck.MakeSurface(CARD.width, CARD.height)
  if (!surface) throw new Error('CanvasKit could not make a surface')
  const canvas = surface.getCanvas()
  const voice = voiceOf(input.practice)
  canvas.clear(rgb(ck, PAPER.ground))

  const paint = new ck.Paint()
  paint.setAntiAlias(true)
  // the practice's voice, as the edge of the sheet
  paint.setColor(rgb(ck, voice.mark))
  canvas.drawRect(ck.XYWHRect(0, 0, RULE_W, CARD.height), paint)

  const width = CARD.width - PAD_X - 72
  const paragraph = (text: string, style: object, maxLines?: number) => {
    const builder = ck.ParagraphBuilder.MakeFromFontProvider(
      new ck.ParagraphStyle({ textStyle: style, maxLines, ellipsis: maxLines ? '…' : undefined, textAlign: ck.TextAlign.Left }),
      fonts,
    )
    builder.addText(text)
    const p = builder.build()
    p.layout(width)
    builder.delete()
    return p
  }

  // the kicker: the practice, in its voice
  const kicker = paragraph(input.kicker.toUpperCase(), {
    color: rgb(ck, voice.text),
    fontFamilies: SANS,
    fontSize: 23,
    letterSpacing: 2.6,
    fontVariations: [{ axis: 'wght', value: 640 }],
  }, 1)
  canvas.drawParagraph(kicker, PAD_X, TOP)
  const titleTop = TOP + kicker.getHeight() + 30

  // the title: the largest size at which it stands whole, else the smallest, cut with "…"
  const line = input.line
    ? paragraph(input.line, { color: rgb(ck, PAPER.muted), fontFamilies: SANS, fontSize: 27, heightMultiplier: 1.3, fontVariations: [{ axis: 'wght', value: 430 }] }, 2)
    : null
  const room = FOOT_Y - 40 - titleTop - (line ? line.getHeight() + 26 : 0)
  let title = null
  for (const { size, lines } of TITLE_SIZES) {
    title?.delete()
    title = paragraph(input.title, { color: rgb(ck, PAPER.ink), fontFamilies: SERIF, fontSize: size, heightMultiplier: 1.14, fontVariations: [{ axis: 'wght', value: 450 }] }, lines)
    if (!title.didExceedMaxLines() && title.getHeight() <= room) break
  }
  canvas.drawParagraph(title, PAD_X, titleTop)
  if (line) canvas.drawParagraph(line, PAD_X, titleTop + title.getHeight() + 26)

  // the foot: a hairline, and the address of the house the page stands in
  paint.setColor(rgb(ck, PAPER.rule))
  canvas.drawRect(ck.XYWHRect(PAD_X, FOOT_Y, CARD.width - PAD_X - 72, 2), paint)
  const foot = paragraph('frankbueltge.de', { color: rgb(ck, PAPER.ink2), fontFamilies: SANS, fontSize: 25, fontVariations: [{ axis: 'wght', value: 520 }] }, 1)
  canvas.drawParagraph(foot, PAD_X, FOOT_Y + 22)

  const image = surface.makeImageSnapshot()
  const png = image.encodeToBytes() as Uint8Array | null
  for (const p of [kicker, title, line, foot]) p?.delete()
  image.delete()
  paint.delete()
  surface.delete()
  if (!png) throw new Error('CanvasKit could not encode the card')
  return png
}

// ── the maker's still ───────────────────────────────────────────────────────────────────────

/** The largest window of the card's proportions a picture holds: centred across, from the top. */
export function stillWindow(width: number, height: number): { left: number; top: number; width: number; height: number } {
  const ratio = CARD.width / CARD.height
  const w = Math.min(width, Math.round(height * ratio))
  const h = Math.min(height, Math.round(w / ratio))
  return { left: Math.round((width - w) / 2), top: 0, width: w, height: h }
}

/** A maker's still, cut to the card's frame, as JPEG bytes. */
export async function renderStill(file: string): Promise<Uint8Array> {
  const sharp = (await import('sharp')).default
  const image = sharp(file, { failOn: 'error' })
  const { width = 0, height = 0 } = await image.metadata()
  if (width < 200 || height < 100) throw new Error(`a still of ${width} × ${height} is too small to show`)
  const buffer = await image
    .extract(stillWindow(width, height))
    .resize(CARD.width, CARD.height)
    .flatten({ background: PAPER.ground })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()
  return new Uint8Array(buffer)
}
