import { describe, expect, it } from 'vitest'
import { NAMING } from './naming'

/** Kanon-Regel: Zahlen werden aus Daten gerendert, nie in Beschreibungstexte geschrieben.
 *  Die Catalogues-Einleitung ist die begründete Ausnahme — dort trägt das Zahlwort den
 *  Satzbau („Three reference works that grow on their own"). Ausnahmen brauchen einen
 *  Wächter, sonst sind sie nur unbemerkte Schulden: Als am 2026-07-27 der Paper-Katalog
 *  dazukam, stand dort „Two". */
describe('NAMING.catalogues', () => {
  const ZAHLWORT: Record<number, string> = {
    2: 'Two',
    3: 'Three',
    4: 'Four',
    5: 'Five',
  }

  it('nennt so viele Nachschlagewerke, wie Karten da sind', () => {
    const anzahl = NAMING.catalogues.items.length
    const erwartet = ZAHLWORT[anzahl]
    expect(erwartet, `kein Zahlwort für ${anzahl} hinterlegt`).toBeDefined()
    expect(NAMING.catalogues.sub.startsWith(`${erwartet} reference works`)).toBe(true)
  })

  it('gibt jeder Karte Namen, Adresse und Beschreibung', () => {
    for (const item of NAMING.catalogues.items) {
      expect(item.name.length).toBeGreaterThan(0)
      expect(item.href.startsWith('/')).toBe(true)
      expect(item.description.length).toBeGreaterThan(40)
    }
  })

  it('führt keine Ziffern in den Beschreibungstexten', () => {
    // Zahlen gehören in die Daten, nicht in den Wortlaut — sie veralten dort still.
    for (const item of NAMING.catalogues.items) {
      expect(item.description, `Ziffer in „${item.name}"`).not.toMatch(/\d/)
    }
  })
})
