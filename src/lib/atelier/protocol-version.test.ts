import { describe, it, expect } from 'vitest'
import { parseProtocol } from './protocol-version'

describe('parseProtocol', () => {
  it('reads the version and adoption date from the older "Adopted <date>" phrasing', () => {
    const info = parseProtocol('# Research Protocol v6 — the work-line protocol, sharpened\n\nAdopted 2026-08-08 —')
    expect(info.version).toBe('6')
    expect(info.adopted).toBe('2026-08-08')
  })

  it('reads the research ecology v3 protocols’ "Decided by … at the reading of" phrasing', () => {
    const info = parseProtocol(
      '# Research Protocol v7 — one shared question, the artistic-research corner\n\n' +
        '*Research ecology v3. Decided by the architect (Frank Bültge) at the reading of\n' +
        '2026-08-30 — the reading planned for 2026-09-05, held early at his decision —*',
    )
    expect(info.version).toBe('7')
    expect(info.adopted).toBe('2026-08-30')
  })

  it('fails loudly on a mirror with no version, rather than defaulting to one', () => {
    expect(() => parseProtocol('# Some other heading')).toThrow(/no "Research Protocol vN" heading/)
  })
})
