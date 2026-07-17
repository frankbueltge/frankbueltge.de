// src/lib/zentrale/auth.test.ts
import { describe, it, expect } from 'vitest'
import { constantTimeEqual, checkToken } from './auth'

describe('constantTimeEqual', () => {
  it('gleiche Strings → true', () => {
    expect(constantTimeEqual('geheim-123', 'geheim-123')).toBe(true)
  })
  it('unterschiedliche Strings gleicher Länge → false', () => {
    expect(constantTimeEqual('geheim-123', 'geheim-124')).toBe(false)
  })
  it('gleiches Präfix, unterschiedliche Länge → false (kein Length-Shortcut)', () => {
    expect(constantTimeEqual('geheim', 'geheim-123')).toBe(false)
    expect(constantTimeEqual('geheim-123', 'geheim')).toBe(false)
  })
  it('leere Strings sind gleich', () => {
    expect(constantTimeEqual('', '')).toBe(true)
  })
})

describe('checkToken', () => {
  it('korrektes Token → true', () => {
    expect(checkToken('geheim-123', 'geheim-123')).toBe(true)
  })
  it('falsches Token → false', () => {
    expect(checkToken('falsch', 'geheim-123')).toBe(false)
  })
  it('fehlender Header → false', () => {
    expect(checkToken(null, 'geheim-123')).toBe(false)
  })
  it('fehlendes/leeres Secret → false (fail closed)', () => {
    expect(checkToken('irgendwas', undefined)).toBe(false)
    expect(checkToken('irgendwas', null)).toBe(false)
    expect(checkToken('irgendwas', '')).toBe(false)
  })
})
