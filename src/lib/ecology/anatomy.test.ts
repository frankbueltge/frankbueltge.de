// RETIRED WITH THE PYRAMID ENTRANCE (2026-08-30, research ecology v3). Until that day this
// file held every anatomy quote against the mirrored constitutions — the currency rule as
// forty tests. The v3 rebuild replaced the constitutions and retired the surface, so the
// quotes froze (see the note atop anatomy.ts) and the against-the-mirror assertions went
// with the surface. The file itself stays: the notation register of a shipped work points
// at it (src/lib/notation/register.test.ts §7.1), and a register of the shipped must keep
// resolving. What remains testable is that the frozen record is intact.
import { describe, expect, it } from 'vitest'
import { practiceById } from './anatomy'

describe('the anatomy, frozen at its v2 state', () => {
  it('still carries all three practices, so the archived surface would still render', () => {
    for (const id of ['atelier', 'field', 'studio'] as const) {
      const practice = practiceById(id)
      expect(practice).toBeDefined()
      expect(practice!.protocolTitle.text.length).toBeGreaterThan(0)
    }
  })
})
