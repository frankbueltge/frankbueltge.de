// src/lib/atelier/lineText.test.ts
import { describe, it, expect } from 'vitest'
import { ohneFrontmatter, ersterAbsatz, aufSatzKuerzen, ohneAuszeichnung, absicht, urteil, zugTitel } from './lineText'

// Wörtliche Ausschnitte aus den gespiegelten Akten (Stand 2026-07-30).
const SCORE_NULL_ISLAND = `---
project_id: 2026-07-19-null-island
title: "Null Island — the coordinate 0°N 0°E read as a catch-basin of error"
disposition: ARCHIVE_AS_STUDY
---

# Project score — Null Island

## 1. Source situation

**Concrete object, encounter, material or technical condition**

The coordinate **0°N 0°E** — the intersection of the Equator and the Prime Meridian, in
the Gulf of Guinea, where there is no land. This point is a technical condition of the
world's mapping infrastructure, not a metaphor.

1. **A null value given a location.** In most geocoders a record defaults to \`0,0\`.
`

const DECISION_NULL_ISLAND = `---
project_id: 2026-07-19-null-island
disposition: ARCHIVE_AS_STUDY
---

# Decision — Null Island, closed as a study

Closed by the practice's own judgement inside the standing delegation (Protocol v4 §5.5:
archive requires no human approval; reasons and traces preserved).

**Why a study and not a work.** The compose-or-archive decision weighed two candidate forms.
`

const JOURNAL = `# 2026-07-30 — The switch and the setting

**Work-line:** \`2026-07-23-negative-parallax\` · tick 14 · home operation

Two ticks ago I invented a rule for myself without calling it one.
`

describe('ohneFrontmatter', () => {
  it('schneidet den Frontmatter-Block ab, lässt Text ohne Frontmatter unangetastet', () => {
    expect(ohneFrontmatter(SCORE_NULL_ISLAND).startsWith('# Project score')).toBe(true)
    expect(ohneFrontmatter('# Nur Text')).toBe('# Nur Text')
  })
})

describe('ersterAbsatz', () => {
  it('überspringt Überschriften und fett gesetzte Vorspannzeilen', () => {
    const a = ersterAbsatz(SCORE_NULL_ISLAND)!
    expect(a.startsWith('The coordinate')).toBe(true)
    expect(a).not.toContain('Concrete object')
    expect(a).not.toContain('#')
  })

  it('überspringt Aufzählungen, Zitate und Tabellen', () => {
    const md = '# H\n\n- eine Liste, die lang genug wäre, um sonst durchzugehen und Prosa vorzutäuschen\n\n> ein Zitat, ebenfalls lang genug für die Mindestlänge dieser Prüfung hier\n\nEchter Fließtext, der lang genug ist, um als Absatz erkannt zu werden — hier steht er.'
    expect(ersterAbsatz(md)!.startsWith('Echter Fließtext')).toBe(true)
  })

  it('zu kurze Blöcke zählen nicht als Absatz', () => {
    expect(ersterAbsatz('# H\n\n(none yet)\n')).toBeNull()
  })
})

describe('aufSatzKuerzen', () => {
  it('kürzt an der Satzgrenze', () => {
    const t = `${'a'.repeat(120)}. ${'b'.repeat(300)}`
    const k = aufSatzKuerzen(t, 200)
    expect(k.endsWith('.')).toBe(true)
    expect(k.length).toBeLessThanOrEqual(200)
  })

  it('ohne Satzgrenze wird sichtbar gekürzt, nicht stillschweigend', () => {
    const k = aufSatzKuerzen(`${'wort '.repeat(200)}`, 100)
    expect(k.endsWith('…')).toBe(true)
  })

  it('kurzer Text bleibt unangetastet', () => {
    expect(aufSatzKuerzen('kurz', 100)).toBe('kurz')
  })
})

describe('ohneAuszeichnung', () => {
  it('nimmt fett, kursiv, Code und Links heraus', () => {
    expect(ohneAuszeichnung('Die **Marke** und *ihr* `Wert` in [einem Text](https://x)')).toBe(
      'Die Marke und ihr Wert in einem Text',
    )
  })
})

describe('absicht', () => {
  it('nimmt die work_intention der Arbeitslinie, wenn es sie gibt', () => {
    const wi = 'A work that holds the three-level displacement of error together — that error is not lodged in the number.'
    expect(absicht(SCORE_NULL_ISLAND, wi)!.startsWith('A work that holds')).toBe(true)
  })

  it('fällt sonst auf den ersten Absatz der SCORE zurück (ältere v4-Projekte)', () => {
    expect(absicht(SCORE_NULL_ISLAND, undefined)!.startsWith('The coordinate 0°N 0°E')).toBe(true)
  })

  it('leere oder zu kurze work_intention zählt nicht als Auskunft', () => {
    expect(absicht(SCORE_NULL_ISLAND, '   ')!.startsWith('The coordinate')).toBe(true)
    expect(absicht(SCORE_NULL_ISLAND, 42)!.startsWith('The coordinate')).toBe(true)
  })
})

describe('urteil', () => {
  it('zieht die Begründung aus der DECISION', () => {
    expect(urteil(DECISION_NULL_ISLAND)!.startsWith("Closed by the practice's own judgement")).toBe(true)
  })

  it('ohne DECISION gibt es kein Urteil — es wird keins erfunden', () => {
    expect(urteil(undefined)).toBeNull()
    expect(urteil('# Decision\n\n(kurz)')).toBeNull()
  })
})

describe('zugTitel', () => {
  it('nimmt die Überschrift und streicht das Datum', () => {
    expect(zugTitel(JOURNAL, '2026-07-30-negative-parallax-the-switch.md')).toBe('The switch and the setting')
  })

  it('ohne Überschrift wird der Dateiname lesbar gemacht', () => {
    expect(zugTitel('kein heading hier', '2026-07-30-the-mark-that-is-not-propagated.md')).toBe(
      'The mark that is not propagated',
    )
  })
})
