import { describe, expect, it } from 'vitest'
import { numberWord } from '@/lib/atelier/sessions'
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

/** The doors carry the shortest path into each practice's own guided tour (WP7). The targets are
 *  hand-picked literals — an anchor on the room's tour wrapper, or the tour's OWN ROOM once a
 *  practice has moved its tour off its entrance (the atelier's moved in the dossier rebuild,
 *  the field's followed on 2026-08-01 when its entrance became the instrument dossier) — not
 *  derived from the tour ids, so nothing but a test keeps a renamed anchor or a relocated tour
 *  from turning a door link into a scroll to nowhere. */
describe('NAMING.doors tour links', () => {
  const TOUR_TARGETS: Record<string, string> = {
    ulysses: '/atelier/how-a-line-ends',
    meridian: '/field/how-a-claim-came-off',
    ensemble: '/studio/how-a-premiere-returned',
  }

  it('gives every practice door its tour, and The Middle none', () => {
    for (const door of NAMING.doors.items) {
      expect(door.tourHref, `door ${door.id}`).toBe(TOUR_TARGETS[door.id])
    }
    expect(NAMING.doors.items.find((d) => d.id === 'conductor')?.tourHref).toBeUndefined()
  })

  it('points each tour link behind its own door (an anchor on the hub, or a room under it)', () => {
    // All three tours live in their own rooms since the dossier rebuilds — the anchor form
    // stays legal for any future tour that starts life on its practice's entrance.
    for (const door of NAMING.doors.items) {
      if (!door.tourHref) continue
      const behindOwnDoor =
        door.tourHref.startsWith(`${door.href}#`) || door.tourHref.startsWith(`${door.href}/`)
      expect(behindOwnDoor, `door ${door.id}`).toBe(true)
    }
  })
})

/** The guest voice (2026-08-02). The Plenum is data-snack.com's resident collective, not a
 *  practice of this house: it gets linked wherever its voice already sounds, and nowhere else.
 *  Every rule below is one somebody could break with a well-meant edit — a fifth door, an ordinal
 *  that goes stale, a "tour" label on a house that keeps no tour here. */
describe('the Plenum as a guest voice', () => {
  const GUEST_ROOM = '/plenum'

  it('gets no door: the four doors stay the practices and The Middle', () => {
    expect(NAMING.doors.items).toHaveLength(4)
    for (const door of NAMING.doors.items) {
      expect(door.href, `door ${door.id}`).not.toBe(GUEST_ROOM)
    }
  })

  it('names itself under the doors, and links into its own room', () => {
    const { guest } = NAMING.doors
    expect(guest.href).toBe(GUEST_ROOM)
    expect(guest.label).toBe(GUEST_ROOM)
    expect(guest.lead).toContain('Plenum')
    // the house it belongs to is named, so the line cannot be read as a fifth practice
    expect(guest.lead).toContain('data-snack.com')
  })

  it('states a rule, not an instance — no ordinal that a fifth voice would falsify', () => {
    // Same guard as the triptych's captions, same reason: the score's lanes move with the record,
    // and a line saying "the fourth lane" would be untrue the day a voice joins or leaves.
    expect(NAMING.doors.guest.lead).not.toMatch(/\d/)
    expect(NAMING.doors.guest.lead).not.toMatch(/\b(fourth|fifth)\b/i)
    expect(NAMING.doors.guest.lead.endsWith('→')).toBe(true)
  })

  it('gets a way in from its Maschinenraum row — but never the practices\' tour label', () => {
    expect(NAMING.maschinenraum.guestHref).toBe(GUEST_ROOM)
    expect(NAMING.maschinenraum.guestLabel).not.toBe(NAMING.maschinenraum.tourLabel)
    expect(NAMING.maschinenraum.guestLabel.endsWith('→')).toBe(true)
  })

  it('is reached from its own house’s card, and only from that one', () => {
    const withResident = NAMING.travel.items.filter((it) => it.resident)
    expect(withResident.map((it) => it.name)).toEqual(['data-snack.com'])
    const resident = withResident[0]!.resident!
    expect(resident.href).toBe(GUEST_ROOM)
    expect(resident.label).toBe(GUEST_ROOM)
    expect(resident.lead).toContain('Plenum')
    expect(resident.lead.endsWith('→')).toBe(true)
    expect(resident.lead).not.toMatch(/\d/)
  })

  it('promises minutes on this site, never the work — the snacks are cooked in their own house', () => {
    // The works register states the same boundary from its side ("keeps its texts elsewhere — it
    // is not counted here"). A travel line offering the collective's WORK here would contradict a
    // sentence that already stands on /works, and only one of the two would ever get corrected.
    const lead = NAMING.travel.items.find((it) => it.resident)!.resident!.lead
    expect(lead).toMatch(/minutes/)
    expect(NAMING.worksRegister.provenanceTail).toContain('Plenum')
  })
})

/** The triptych: three cards, one per practice, each pointing at that practice's tour. The copy
 *  rules it has to keep are the ones that go stale silently if nobody checks them. */
describe('NAMING.triptych', () => {
  const cards = NAMING.triptych.cards

  it('carries one card per practice door, in the doors\' own order', () => {
    const practiceDoors = NAMING.doors.items.filter((d) => d.tourHref)
    expect(cards.map((c) => c.id)).toEqual(practiceDoors.map((d) => d.id))
  })

  it('sends each card to the same tour its door does', () => {
    for (const card of cards) {
      const door = NAMING.doors.items.find((d) => d.id === card.id)
      expect(card.href, `card ${card.id}`).toBe(door?.tourHref)
    }
  })

  it('names as many vocabularies in the kicker as there are cards', () => {
    // Same guard as the catalogues line above, same reason: the number carries the sentence, so
    // it must be counted rather than remembered.
    const word = numberWord(cards.length).toUpperCase()
    expect(NAMING.triptych.kicker).toBe(`${word} DOORS, ${word} VOCABULARIES`)
  })

  it('writes captions as rules, not as instances — the fragments move with the record', () => {
    for (const card of cards) {
      // no digits and no ISO dates: a caption that named today's line, day or work would be
      // untrue by the next nightly, and nothing on the page would say so
      expect(card.caption, `caption ${card.id}`).not.toMatch(/\d/)
      expect(card.cta, `cta ${card.id}`).not.toMatch(/\d/)
      expect(card.caption.length, `caption ${card.id}`).toBeGreaterThan(80)
      expect(card.cta.endsWith('→'), `cta ${card.id}`).toBe(true)
    }
  })
})
