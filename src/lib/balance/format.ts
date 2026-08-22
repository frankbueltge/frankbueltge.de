/** Balance — pure display helpers (tested in format.test.ts). */

/** Signed fixed-decimal number: 1.234 -> "+1.23", -0.5 -> "−0.50" (typographic minus). */
export function signed(n: number, digits = 2): string {
  const s = Math.abs(n).toFixed(digits)
  return n < 0 ? `−${s}` : `+${s}`
}

/** Plain fixed-decimal with typographic minus for negatives. */
export function fixed(n: number, digits = 2): string {
  const s = Math.abs(n).toFixed(digits)
  return n < 0 ? `−${s}` : s
}

/** "[−1.20 … −0.40]" CI label. */
export function ciLabel(ci: [number, number], digits = 2): string {
  return `[${fixed(ci[0], digits)} … ${fixed(ci[1], digits)}]`
}

/** One human sentence for the day's headline gap direction. */
export function directionSentence(name: string, direction: 'self_brighter' | 'world_brighter'): string {
  return direction === 'self_brighter'
    ? `${name}'s own press writes about ${name} in brighter language than the world's press does.`
    : `The world's press writes about ${name} in brighter language than its own press does.`
}

/** GKG timestamp "20260812T221500Z"-ish window label -> "2026-08-12 22:15 UTC". Falls through untouched on surprises. */
export function windowLabel(window: string): string {
  const m = window.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})\d{2} \.\. (\d{4})(\d{2})(\d{2})(\d{2})(\d{2})\d{2} UTC$/)
  if (!m) return window
  return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]} UTC — ${m[6]}-${m[7]}-${m[8]} ${m[9]}:${m[10]} UTC`
}
