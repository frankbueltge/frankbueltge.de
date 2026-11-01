// src/lib/ducking/figure.ts — the geometry of the desk (2026-11-01). The island draws what this says.
import { toPosition } from './mix'

/** One fader's box, in SVG units. The cap travels between the two ends of the slot. */
export const FADER = { width: 30, height: 320, capWidth: 26, capHeight: 34 } as const

const TRAVEL = FADER.height - FADER.capHeight

/** The top of the cap for a position. */
export const capY = (position: number): number => Math.round((1 - position) * TRAVEL * 10) / 10

/** The position for a y inside the fader's box, reading the cap by its middle. */
export const positionAt = (y: number): number => Math.min(1, Math.max(0, 1 - (y - FADER.capHeight / 2) / TRAVEL))

/** The marks of the scale, in percent. Each is ten times the one below; under the last is the floor, zero. */
export const SCALE: readonly { share: number; label: string }[] = [
  { share: 1, label: '100' },
  { share: 0.1, label: '10' },
  { share: 0.01, label: '1' },
  { share: 0.001, label: '.1' },
  { share: 0.0001, label: '.01' },
  { share: 0, label: '0' },
]

export const scaleY = (share: number): number => capY(toPosition(share)) + FADER.capHeight / 2

/** A filled lane across the record: the ten matters' joint share, day by day, scaled to its own peak. */
export function lanePath(shares: readonly number[], width: number, height: number): string {
  if (shares.length < 2) return ''
  const peak = Math.max(...shares) || 1
  const x = (i: number) => (i / (shares.length - 1)) * width
  const y = (v: number) => height - (v / peak) * (height - 2)
  const top = shares.map((v, i) => `${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' L')
  return `M0 ${height} L${top} L${width} ${height}Z`
}
