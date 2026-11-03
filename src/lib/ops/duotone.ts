// src/lib/ops/duotone.ts — every still on the entrance in the page's own two tones (2026-11-03).
//
// The calm homepage (docs/design_handoff_homepage_calm/README.md §5): the lab's and the ecology's
// pictures — makers' stills and shots of the pieces' own pages alike — are set in two colours,
// so nothing grey stands against the cream ground. One file per theme, written when the picture
// is cut (scripts/shelf-stills.ts, scripts/shelf-shots.ts): `<key>.webp` for the light theme,
// `<key>.dark.webp` for the dark one; the stylesheet shows the theme's (edition.css, .ed-duo).
//
// The mapping, as the handoff gives it: a pixel's luminance (0.2126 R + 0.7152 G + 0.0722 B), laid
// linearly from ink to paper, and pure paper from 85 % brightness up, so the grey ground of a
// page shot does not survive as a tint. A dark picture (mean luminance under half) is inverted
// first, so every picture lands on paper. Pure: the scripts hand it the pixels sharp decoded.

export interface Duotone {
  /** the colour of the darkest pixel */
  ink: string
  /** the colour of every pixel from `PAPER_FROM` up */
  paper: string
}

export const DUOTONES = {
  light: { ink: '#161412', paper: '#fbf8f1' },
  dark: { ink: '#ece6d9', paper: '#221f1b' },
} as const satisfies Record<'light' | 'dark', Duotone>

/** the brightness from which a pixel is pure paper */
export const PAPER_FROM = 0.85

const rgbOf = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** A pixel's luminance, 0–1, by the handoff's weights on the stored (gamma-encoded) values. */
export const luminance = (r: number, g: number, b: number): number => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

/** The colour a luminance maps to, as [r, g, b]. */
export function toneOf(l: number, tone: Duotone): [number, number, number] {
  const t = Math.min(1, Math.max(0, l) / PAPER_FROM)
  const ink = rgbOf(tone.ink)
  const paper = rgbOf(tone.paper)
  return [0, 1, 2].map((c) => Math.round(ink[c] + (paper[c] - ink[c]) * t)) as [number, number, number]
}

/** Whether a picture is dark enough to be inverted before toning: its mean luminance under half. */
export function isDark(pixels: Uint8Array | Buffer, channels: number): boolean {
  let sum = 0
  let n = 0
  for (let i = 0; i + 2 < pixels.length; i += channels) {
    sum += luminance(pixels[i], pixels[i + 1], pixels[i + 2])
    n++
  }
  return n > 0 && sum / n < 0.5
}

/**
 * The picture in two tones: raw RGB(A) pixels in, raw RGB pixels out (alpha dropped; a still
 * has none worth keeping). `invert` is decided once per picture (isDark), so its light and dark
 * file agree on which way round it is.
 */
export function duotone(pixels: Uint8Array | Buffer, channels: number, tone: Duotone, invert: boolean): Uint8Array {
  // a table per luminance step: 256 entries instead of one mapping per pixel
  const table = Array.from({ length: 256 }, (_, i) => toneOf((invert ? 255 - i : i) / 255, tone))
  const out = new Uint8Array((pixels.length / channels) * 3)
  for (let i = 0, o = 0; i + 2 < pixels.length; i += channels, o += 3) {
    const step = Math.round(luminance(pixels[i], pixels[i + 1], pixels[i + 2]) * 255)
    const [r, g, b] = table[step]
    out[o] = r
    out[o + 1] = g
    out[o + 2] = b
  }
  return out
}
