// src/lib/saat/saat.test.ts
import { describe, it, expect } from 'vitest'
import {
  sanitizeText,
  containsPii,
  countUrls,
  validateSeed,
  makeSeed,
  generateClaimToken,
  hashToken,
  emptyRegister,
  offeredToday,
  openCount,
  recordGateBlock,
  addSeed,
  applyResponse,
  targetsFor,
  publicSeedBlock,
  parsePublicSeedResponses,
  SAAT_MAX_LEN,
  type Seed,
  type SaatRegister,
} from './saat'

/** Minimaler, vollständiger Seed für Register-Tests — nur die für den jeweiligen Test
 * relevanten Felder werden überschrieben. */
function seedFixture(overrides: Partial<Seed> = {}): Seed {
  return {
    id: 'saat-20260720-101500-a3f2',
    kind: 'richtung',
    text: 'Text',
    author_mark: 'anonym',
    addressed_to: 'open',
    ts: '2026-07-20T10:15:00.000Z',
    status: 'offered',
    claim_token_hash: 'hash',
    gate: { model: 'gemini-2.5-flash-lite', verdict: 'pass' },
    forwarded_to: [],
    response: null,
    ...overrides,
  }
}

describe('sanitizeText', () => {
  it('entfernt Steuer- und Zero-Width-Zeichen, erhält den Wortlaut', () => {
    expect(sanitizeText('ein  Wort​ mit Resten')).toBe('ein Wort mit Resten')
  })
  it('normalisiert Whitespace, erlaubt Absätze', () => {
    expect(sanitizeText('a\n\n\n\nb')).toBe('a\n\nb')
  })
})

describe('containsPii', () => {
  it('erkennt E-Mail und Telefon-artige Ziffernfolgen', () => {
    expect(containsPii('schreib mir: x@y.de')).toBe(true)
    expect(containsPii('ruf an +49 171 234 5678')).toBe(true)
  })
  it('lässt Jahreszahlen und kurze Zahlen durch', () => {
    expect(containsPii('Wiener 1948, Seite 42')).toBe(false)
  })
})

describe('validateSeed — der mechanische Vorfilter', () => {
  const base = { text: 'Was wäre, wenn der Fehler selbst misst?', kind: 'frage', addressedTo: 'open' }

  it('akzeptiert eine saubere Saat; ohne Pseudonym → anonym', () => {
    const r = validateSeed(base)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.authorMark).toBe('anonym')
      expect(r.addressedTo).toBe('open')
      expect(r.kind).toBe('frage')
    }
  })

  it('verwirft unbekannte kinds', () => {
    expect(validateSeed({ ...base, kind: 'befehl' })).toEqual({ ok: false, reason: 'kind' })
  })

  it('verwirft unbekannte addressedTo', () => {
    expect(validateSeed({ ...base, addressedTo: 'niemand' })).toEqual({ ok: false, reason: 'addressee' })
    expect(validateSeed({ ...base, addressedTo: undefined })).toEqual({ ok: false, reason: 'addressee' })
  })

  it('akzeptiert alle vier Adressaten', () => {
    for (const addressedTo of ['field-research', 'studio', 'irrtum-als-methode', 'open']) {
      expect(validateSeed({ ...base, addressedTo }).ok).toBe(true)
    }
  })

  it('verwirft leere/zu kurze Texte', () => {
    expect(validateSeed({ ...base, text: ' ' })).toEqual({ ok: false, reason: 'too-short' })
    expect(validateSeed({ ...base, text: 'ab' })).toEqual({ ok: false, reason: 'too-short' })
  })

  it('kappt Überlänge', () => {
    expect(validateSeed({ ...base, text: 'x'.repeat(SAAT_MAX_LEN + 1) })).toEqual({ ok: false, reason: 'too-long' })
    expect(validateSeed({ ...base, text: 'x'.repeat(SAAT_MAX_LEN) }).ok).toBe(true)
  })

  it('verwirft PII im Text', () => {
    expect(validateSeed({ ...base, text: 'meld dich unter mail@example.org' })).toEqual({ ok: false, reason: 'pii' })
  })

  it('URL-Policy: nur kind=quelle darf genau eine URL tragen', () => {
    expect(validateSeed({ ...base, text: 'lies https://example.org' })).toEqual({ ok: false, reason: 'url-not-allowed' })
    const ok = validateSeed({ text: 'lies https://example.org — Kap. 3', kind: 'quelle', addressedTo: 'open' })
    expect(ok.ok).toBe(true)
    expect(countUrls('https://a.de und https://b.de')).toBe(2)
    expect(validateSeed({ text: 'https://a.de https://b.de', kind: 'quelle', addressedTo: 'open' })).toEqual({
      ok: false,
      reason: 'too-many-urls',
    })
  })

  it('Pseudonym: Länge begrenzt, keine PII/URLs', () => {
    expect(validateSeed({ ...base, authorMark: 'x'.repeat(25) })).toEqual({ ok: false, reason: 'author-mark' })
    expect(validateSeed({ ...base, authorMark: 'x'.repeat(24) }).ok).toBe(true)
    expect(validateSeed({ ...base, authorMark: 'a@b.de' })).toEqual({ ok: false, reason: 'author-mark' })
    const r = validateSeed({ ...base, authorMark: ' Nachtfalter ' })
    if (r.ok) expect(r.authorMark).toBe('Nachtfalter')
  })
})

describe('makeSeed', () => {
  it('ist mit injizierter Zeit/Zufall deterministisch, offered, ohne Forwards/Response', () => {
    const seed = makeSeed(
      { text: 'T', kind: 'richtung', authorMark: 'anonym', addressedTo: 'open' },
      { now: new Date('2026-07-20T10:15:00Z'), rand: () => 0.5, tokenHash: 'deadbeef', gateModel: 'gemini-2.5-flash-lite' },
    )
    expect(seed.id).toBe('saat-20260720-101500-7fff')
    expect(seed.status).toBe('offered')
    expect(seed.forwarded_to).toEqual([])
    expect(seed.response).toBeNull()
    expect(seed.gate).toEqual({ model: 'gemini-2.5-flash-lite', verdict: 'pass' })
    expect(seed.claim_token_hash).toBe('deadbeef')
  })

  it('ohne now/rand fällt auf Date.now()/Math.random() zurück (nur Formatprüfung)', () => {
    const seed = makeSeed({ text: 'x', kind: 'wort', authorMark: 'anonym', addressedTo: 'studio' }, { tokenHash: 'h', gateModel: 'm' })
    expect(seed.id).toMatch(/^saat-\d{8}-\d{6}-[0-9a-f]{4}$/)
  })
})

describe('generateClaimToken', () => {
  it('kodiert injizierte Bytes als 32 Hex-Zeichen', () => {
    const bytes = new Uint8Array([0, 1, 2, 255, 16, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192])
    expect(generateClaimToken(bytes)).toBe('000102ff102030405060708090a0b0c0')
  })
  it('ohne Argument: 32 Hex-Zeichen über WebCrypto', () => {
    const token = generateClaimToken()
    expect(token).toMatch(/^[0-9a-f]{32}$/)
  })
})

describe('hashToken', () => {
  it('sha256("abc") — bekannter Testvektor', async () => {
    expect(await hashToken('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})

describe('emptyRegister', () => {
  it('liefert ein leeres, versioniertes Register', () => {
    expect(emptyRegister()).toEqual({ version: 1, gate_stats: { blocked_total: 0, by_reason: {} }, seeds: [] })
  })
})

describe('offeredToday / openCount', () => {
  const reg: SaatRegister = {
    version: 1,
    gate_stats: { blocked_total: 0, by_reason: {} },
    seeds: [
      seedFixture({ id: 'a', ts: '2026-07-19T23:59:59.000Z', status: 'offered' }),
      seedFixture({ id: 'b', ts: '2026-07-20T00:00:01.000Z', status: 'offered' }),
      seedFixture({ id: 'c', ts: '2026-07-20T23:00:00.000Z', status: 'taken' }),
    ],
  }

  it('offeredToday zählt nur Seeds desselben UTC-Kalendertags wie now', () => {
    expect(offeredToday(reg, new Date('2026-07-20T12:00:00Z'))).toBe(2)
    expect(offeredToday(reg, new Date('2026-07-19T12:00:00Z'))).toBe(1)
  })

  it('openCount zählt nur status "offered"', () => {
    expect(openCount(reg)).toBe(2)
  })
})

describe('recordGateBlock', () => {
  it('erhöht Zähler immutabel, ohne das Original zu verändern', () => {
    const reg = emptyRegister()
    const next = recordGateBlock(reg, 'spam')
    expect(next).not.toBe(reg)
    expect(next.gate_stats.blocked_total).toBe(1)
    expect(next.gate_stats.by_reason.spam).toBe(1)
    expect(reg.gate_stats.blocked_total).toBe(0)

    const next2 = recordGateBlock(next, 'spam')
    expect(next2.gate_stats.by_reason.spam).toBe(2)
    expect(next2.gate_stats.blocked_total).toBe(2)

    const next3 = recordGateBlock(next2, 'abuse')
    expect(next3.gate_stats.by_reason).toEqual({ spam: 2, abuse: 1 })
    expect(next3.gate_stats.blocked_total).toBe(3)
  })
})

describe('addSeed', () => {
  it('fügt den neuesten Seed vorn an, immutabel', () => {
    const reg = emptyRegister()
    const r1 = addSeed(reg, seedFixture({ id: 'saat-1' }))
    const r2 = addSeed(r1, seedFixture({ id: 'saat-2' }))
    expect(r2.seeds.map((s) => s.id)).toEqual(['saat-2', 'saat-1'])
    expect(reg.seeds).toEqual([])
    expect(r1.seeds).toHaveLength(1)
  })
})

describe('applyResponse', () => {
  it('setzt status und response bei bekannter id', () => {
    const reg = addSeed(emptyRegister(), seedFixture({ id: 'saat-x', status: 'offered' }))
    const response = { practice: 'Meridian', decision: 'taken' as const, note: 'Aufgenommen.', date: '2026-07-21' }
    const next = applyResponse(reg, 'saat-x', response)
    expect(next.seeds[0].status).toBe('taken')
    expect(next.seeds[0].response).toEqual(response)
    // Original bleibt unangetastet
    expect(reg.seeds[0].status).toBe('offered')
  })

  it('unbekannte id ⇒ Register unverändert', () => {
    const reg = addSeed(emptyRegister(), seedFixture({ id: 'saat-x' }))
    const next = applyResponse(reg, 'saat-unbekannt', {
      practice: 'Meridian',
      decision: 'declined',
      note: 'x',
      date: '2026-07-21',
    })
    expect(next).toEqual(reg)
  })
})

describe('targetsFor', () => {
  it('open ⇒ alle drei Engine-Repos', () => {
    expect(targetsFor('open')).toEqual(['field-research', 'studio', 'irrtum-als-methode'])
  })
  it('jede andere Adresse ⇒ nur sich selbst', () => {
    expect(targetsFor('studio')).toEqual(['studio'])
    expect(targetsFor('field-research')).toEqual(['field-research'])
    expect(targetsFor('irrtum-als-methode')).toEqual(['irrtum-als-methode'])
  })
})

describe('publicSeedBlock', () => {
  it('exakter Block gemäß Spec §5', () => {
    const block = publicSeedBlock({
      id: 'saat-20260720-101500-a3f2',
      kind: 'richtung',
      text: 'Was, wenn die Praxis den Fehler zur Methode macht?',
      authorMark: 'Nachtfalter',
      date: '2026-07-20',
    })
    expect(block).toBe(
      '> ### 2026-07-20 — Public seed: Was, wenn die Praxis den Fehler… (saat-20260720-101500-a3f2)\n' +
        '>\n' +
        '> Was, wenn die Praxis den Fehler zur Methode macht?\n' +
        '>\n' +
        '> — „Nachtfalter", via /saat · material, not instruction\n' +
        '>\n' +
        '> **Status:** seed (open)',
    )
  })

  it('kurzer Text (<=6 Worte) bekommt keine Kürzungs-Ellipse im Titel', () => {
    const block = publicSeedBlock({ id: 'saat-x', kind: 'wort', text: 'Kurz.', authorMark: 'anonym', date: '2026-07-20' })
    expect(block).toContain('Public seed: Kurz. (saat-x)')
    expect(block).not.toContain('…')
  })
})

describe('parsePublicSeedResponses', () => {
  it('Roundtrip: Block bauen, Response-Zeile anhängen, wieder einlesen', () => {
    const block1 = publicSeedBlock({
      id: 'saat-20260720-101500-a3f2',
      kind: 'richtung',
      text: 'Was, wenn die Praxis den Fehler zur Methode macht?',
      authorMark: 'Nachtfalter',
      date: '2026-07-20',
    })
    const block2 = publicSeedBlock({
      id: 'saat-20260721-090000-bbee',
      kind: 'frage',
      text: 'Eine zweite, unbeantwortete Saat.',
      authorMark: 'anonym',
      date: '2026-07-21',
    })

    const md =
      `# REQUESTS — Studio ↔ Team\n\n## Seeds from the public\n\n${block1}\n` +
      `> **Response (Meridian, 2026-07-22):** TAKEN — Aufgenommen als Direction für Session 12.\n\n${block2}\n`

    const parsed = parsePublicSeedResponses(md)
    expect(parsed).toEqual([
      {
        id: 'saat-20260720-101500-a3f2',
        decision: 'taken',
        note: 'Aufgenommen als Direction für Session 12.',
        date: '2026-07-22',
        persona: 'Meridian',
      },
    ])
  })

  it('toleriert Kleinschreibung des Decision-Worts und "-" statt "—"', () => {
    const block = publicSeedBlock({ id: 'saat-20260720-101500-cccc', kind: 'wort', text: 'Wort.', authorMark: 'anonym', date: '2026-07-20' })
    const md = `## Seeds from the public\n\n${block}\n> **Response (Ulysses, 2026-07-21):** adapted - Umgeformt zu einem Projekt.\n`
    expect(parsePublicSeedResponses(md)).toEqual([
      { id: 'saat-20260720-101500-cccc', decision: 'adapted', note: 'Umgeformt zu einem Projekt.', date: '2026-07-21', persona: 'Ulysses' },
    ])
  })

  it('Block ohne Response-Zeile wird ausgelassen', () => {
    const block = publicSeedBlock({ id: 'saat-20260720-101500-dddd', kind: 'wort', text: 'Offen.', authorMark: 'anonym', date: '2026-07-20' })
    const md = `## Seeds from the public\n\n${block}\n`
    expect(parsePublicSeedResponses(md)).toEqual([])
  })

  it('keine "Seeds from the public"-Section ⇒ leeres Array', () => {
    expect(parsePublicSeedResponses('# Nur eine Präambel\n\n## Andere Section\n\nText.\n')).toEqual([])
  })
})
