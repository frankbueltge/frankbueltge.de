/** Deterministische Befund-Sätze aus dem maschinell gehobenen Wochen-Delta (Spec §1). */
import type { BeifangBefund } from './types'
import { PUBLISHER_LABELS } from './types'

export function renderBefund(b: BeifangBefund, locale: 'de' | 'en'): string {
  const de = locale === 'de'
  const p = b.params as Record<string, string | number>
  const pub = PUBLISHER_LABELS[String(p.publisher)] ?? String(p.publisher)
  switch (b.kind) {
    case 'baseline':
      return de
        ? 'Erste Messung — Vergleichswerte entstehen ab der zweiten Sitzung.'
        : 'First measurement — comparisons begin with the second run.'
    case 'blockade_neu':
      return de
        ? `Neu in dieser Woche: ${pub} verweigert die Messung (${p.panel_id}).`
        : `New this week: ${pub} refuses the measurement (${p.panel_id}).`
    case 'entity_neu':
      return de
        ? `Neu im Netz der Verlagsseiten: ${p.entity}, auf ${p.pages} Seiten.`
        : `New in the publishers' network: ${p.entity}, on ${p.pages} pages.`
    case 'median_delta':
      return de
        ? `Größte Verschiebung: ${pub}, Median ${p.von} → ${p.zu} Tracker-Hosts.`
        : `Largest shift: ${pub}, median ${p.von} → ${p.zu} tracker hosts.`
    default:
      return de
        ? 'Keine wesentliche Veränderung gegenüber der Vorwoche.'
        : 'No substantial change from the previous week.'
  }
}
