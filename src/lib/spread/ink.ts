// src/lib/spread/ink.ts — reads the field's ink from the frame's own CSS custom properties, the
// same seam LivingGlobe.tsx's `parseInk`/`readInk` use for its WebGL layer (this house's
// established way of handing a token-driven colour to a canvas, which cannot read a stylesheet
// class the way markup can). No hex literal lives here or anywhere in Spread: `--sp-*` custom
// properties in spread.css only ever alias `var(--color-*)`, so there is nothing for
// scripts/drift-check.mjs's identity-colour rule to mark, and no PALETTE record to keep.
export type RGB = [number, number, number]

/** `#rrggbb`, `#rgb`, `rgb()`/`rgba()` → an RGB tuple; anything else is null so a caller can fall
 *  back rather than paint a broken value. */
export function parseColor(value: string): RGB | null {
  const v = value.trim()
  if (!v) return null
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v)
  if (hex) {
    const h = hex[1]!.length === 3 ? hex[1]!.split('').map((c) => c + c).join('') : hex[1]!
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const nums = v
    .replace(/^rgba?\(/i, '')
    .replace(/\)$/, '')
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(Number)
  if (nums.length >= 3 && nums.slice(0, 3).every((n) => Number.isFinite(n))) {
    return [Math.round(nums[0]!), Math.round(nums[1]!), Math.round(nums[2]!)]
  }
  return null
}

export function rgba([r, g, b]: RGB, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export interface FieldInk {
  mark: RGB
  band: RGB
  grid: RGB
  muted: RGB
  /** the recorded live front ink, worn only while the venues disagree (spread.css's header) */
  flare: RGB
}

/** The field's four inks, read off the element that carries `--sp-*` (spread.css). A token that
 *  fails to parse falls back to a neutral grey so a broken variable never paints black on black. */
export function readFieldInk(el: Element): FieldInk {
  const cs = getComputedStyle(el)
  const token = (name: string, fallback: RGB): RGB => parseColor(cs.getPropertyValue(name)) ?? fallback
  return {
    mark: token('--sp-mark', [244, 244, 245]),
    band: token('--sp-band', [194, 194, 200]),
    grid: token('--sp-grid', [36, 36, 39]),
    flare: token('--sp-flare', [127, 208, 232]),
    muted: token('--sp-muted', [163, 163, 168]),
  }
}
