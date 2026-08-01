import { describe, expect, it } from 'vitest'
import { isOn, toggle } from './filter'

describe('toggle — single mode', () => {
  it('selects a key when nothing is selected', () => {
    expect(toggle([], 'a', 'single')).toEqual(['a'])
  })
  it('replaces the selection with a different key (ProcessFigure legend behavior)', () => {
    expect(toggle(['a'], 'b', 'single')).toEqual(['b'])
  })
  it('clears the selection when the already-active key is clicked again', () => {
    expect(toggle(['a'], 'a', 'single')).toEqual([])
  })
})

describe('toggle — multi mode', () => {
  it('adds a key that is not yet selected, keeping the others', () => {
    expect(toggle(['a'], 'b', 'multi')).toEqual(['a', 'b'])
  })
  it('removes a key that is already selected, keeping the others', () => {
    expect(toggle(['a', 'b', 'c'], 'b', 'multi')).toEqual(['a', 'c'])
  })
  it('selects the first key from an empty selection', () => {
    expect(toggle([], 'a', 'multi')).toEqual(['a'])
  })
})

describe('isOn', () => {
  it('is true for every mark when no filter is active (empty selection)', () => {
    expect(isOn([], 'anything')).toBe(true)
  })
  it('is true only for a selected key once a filter is active', () => {
    expect(isOn(['a'], 'a')).toBe(true)
    expect(isOn(['a'], 'b')).toBe(false)
  })
  it('supports multi-select: on for any of several selected keys', () => {
    expect(isOn(['a', 'c'], 'c')).toBe(true)
    expect(isOn(['a', 'c'], 'b')).toBe(false)
  })
})
