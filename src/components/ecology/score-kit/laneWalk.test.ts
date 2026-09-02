import { describe, expect, it } from 'vitest'
import { buildSegments } from '@/lib/dataviz/stepper'
import { isWalkKey, walkTo } from './laneWalk'

const marks = [
  { id: 'a1', lane: 'a' },
  { id: 'a2', lane: 'a' },
  { id: 'a3', lane: 'a' },
  { id: 'b1', lane: 'b' },
  { id: 'b2', lane: 'b' },
]
const walk = buildSegments(marks, (m) => m.lane)

describe('the keyboard walk along a lane', () => {
  it('steps within the lane and stops at its ends', () => {
    expect(walkTo(walk, 0, 'ArrowRight')).toBe(1)
    expect(walkTo(walk, 2, 'ArrowRight')).toBe(2)
    expect(walkTo(walk, 3, 'ArrowLeft')).toBe(3)
    expect(walkTo(walk, 4, 'ArrowLeft')).toBe(3)
  })

  it('jumps to the ends of the lane the mark is on, never into a neighbour', () => {
    expect(walkTo(walk, 1, 'Home')).toBe(0)
    expect(walkTo(walk, 1, 'End')).toBe(2)
    expect(walkTo(walk, 3, 'End')).toBe(4)
  })

  it('stays put on an index outside the walk', () => {
    expect(walkTo(walk, -1, 'ArrowRight')).toBe(-1)
    expect(walkTo(walk, 9, 'Home')).toBe(9)
  })

  it('recognises exactly the four walk keys', () => {
    for (const k of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) expect(isWalkKey(k)).toBe(true)
    for (const k of ['ArrowUp', 'Enter', 'Escape', '0']) expect(isWalkKey(k)).toBe(false)
  })
})
