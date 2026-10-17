// src/lib/practice-shell.test.ts
import { describe, it, expect } from 'vitest'
import type { RailItem } from './practice-shell'
import { ATELIER_GRAMMAR } from '@/config/atelier-wording'
import { FIELD_GRAMMAR } from '@/config/field-wording'
import { STUDIO_GRAMMAR } from '@/config/studio-wording'

const RAILS: Record<string, readonly RailItem[]> = {
  atelier: ATELIER_GRAMMAR.rail,
  field: FIELD_GRAMMAR.rail,
  studio: STUDIO_GRAMMAR.rail,
}

describe('practice rails conform to the shared RailItem shape', () => {
  for (const [practice, rail] of Object.entries(RAILS)) {
    describe(practice, () => {
      it('is non-empty', () => {
        expect(rail.length).toBeGreaterThan(0)
      })

      it('every item has a label, href and hint string', () => {
        for (const item of rail) {
          expect(typeof item.label).toBe('string')
          expect(item.label.length).toBeGreaterThan(0)
          expect(typeof item.href).toBe('string')
          expect(item.href.length).toBeGreaterThan(0)
          expect(typeof item.hint).toBe('string')
          expect(item.hint.length).toBeGreaterThan(0)
        }
      })

      // Until 2026-10-17 every rail item was a page of this site. Since the publication rule
      // (src/lib/engines/publication.mjs) three of them open the practice's own repository, and an
      // item that leaves the site says so in its label.
      it('every href is a site-relative path, or the practice repository an item says it opens', () => {
        for (const item of rail) {
          if (item.href.startsWith('/')) continue
          expect(item.href).toMatch(/^https:\/\/github\.com\/frankbueltge\//)
          expect(item.label).toContain('↗ in the repository')
        }
      })
    })
  }
})
