import { describe, expect, it } from 'vitest'
import { renderBefund } from './befund'

describe('renderBefund', () => {
  it('baseline', () => {
    expect(renderBefund({ kind: 'baseline', params: {} }, 'de'))
      .toBe('Erste Messung — Vergleichswerte entstehen ab der zweiten Sitzung.')
    expect(renderBefund({ kind: 'baseline', params: {} }, 'en'))
      .toBe('First measurement — comparisons begin with the second run.')
  })
  it('entity_neu', () => {
    expect(renderBefund({ kind: 'entity_neu', params: { entity: 'LiveRamp', pages: 3 } }, 'de'))
      .toBe('Neu im Netz der Verlagsseiten: LiveRamp, auf 3 Seiten.')
  })
  it('blockade_neu', () => {
    expect(renderBefund({ kind: 'blockade_neu', params: { panel_id: 'elsevier-03', publisher: 'elsevier' } }, 'en'))
      .toBe('New this week: Elsevier refuses the measurement (elsevier-03).')
  })
  it('median_delta + unveraendert', () => {
    expect(renderBefund({ kind: 'median_delta', params: { publisher: 'wiley', von: 10, zu: 14 } }, 'de'))
      .toBe('Größte Verschiebung: Wiley, Median 10 → 14 Tracker-Hosts.')
    expect(renderBefund({ kind: 'unveraendert', params: {} }, 'de'))
      .toBe('Keine wesentliche Veränderung gegenüber der Vorwoche.')
  })
})
