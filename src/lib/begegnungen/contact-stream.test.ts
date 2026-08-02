import { describe, expect, it } from 'vitest'
import {
  buildContactStream,
  chronicleRows,
  crossingIdsIn,
  journalRows,
  namesIn,
  partitionStream,
  plenumRows,
  requestsRows,
  sortStream,
  streamTally,
  streamVoices,
  voiceFromContentPath,
  type StreamRow,
} from './contact-stream'

// ————————————————————————————————————————————————— the name test ————————————

describe('namesIn', () => {
  it('finds the proper name of a sibling practice', () => {
    expect(namesIn('a bounded review offered to Ulysses', 'meridian')).toEqual(['ulysses'])
    expect(namesIn('the Ensemble answered the same evening', 'ulysses')).toEqual(['ensemble'])
    expect(namesIn('mirrored from field-research', 'ensemble')).toEqual(['meridian'])
  })

  it('never reports the record’s own house — a practice writing its own name is not contact', () => {
    expect(namesIn('Ulysses ruled that “instantiates” does not hold', 'ulysses')).toEqual([])
    expect(namesIn('Meridian’s own workboard', 'meridian')).toEqual([])
  })

  it('refuses the lowercase common nouns that made the first draft of this rule useless', () => {
    // Every one of these is a real sentence from the committed records.
    expect(namesIn('A work that shows all six previous works as an ensemble', 'ulysses')).toEqual([])
    expect(namesIn('1854 Photography studio interview', 'ulysses')).toEqual([])
    expect(namesIn('at both ends and empty in the middle', 'ensemble')).toEqual([])
    expect(namesIn('degrees by studio project', 'ulysses')).toEqual([])
  })

  it('reads “the Meridian Research Runtime” as the tool, not as the collective too', () => {
    expect(namesIn('signed for the Meridian Research Runtime', 'ulysses')).toEqual(['mrr'])
    expect(namesIn('the MRR note in REQUESTS.md', 'ulysses')).toEqual(['mrr'])
  })

  it('still reads the collective where the same span names both', () => {
    const found = namesIn('MRR filed it; Meridian had not adopted it', 'ulysses')
    expect(found).toContain('mrr')
    expect(found).toContain('meridian')
  })

  it('does not carry a global regex’s lastIndex from one call into the next', () => {
    const text = 'Ulysses and Ulysses again'
    expect(namesIn(text, 'meridian')).toEqual(['ulysses'])
    expect(namesIn(text, 'meridian')).toEqual(['ulysses'])
  })

  it('names nobody for anything that is not a string', () => {
    for (const junk of [null, undefined, 42, {}, [], '']) {
      expect(namesIn(junk, 'ulysses')).toEqual([])
    }
  })
})

describe('crossingIdsIn', () => {
  it('reads both families of id, deduplicated and lowercased', () => {
    expect(crossingIdsIn('ji-2026-002 answered; see ENC-2026-005 and ji-2026-002 again')).toEqual([
      'ji-2026-002',
      'enc-2026-005',
    ])
  })

  it('reads nothing from a span that carries none, and never throws', () => {
    expect(crossingIdsIn('no ids here')).toEqual([])
    expect(crossingIdsIn(null)).toEqual([])
    expect(crossingIdsIn(7)).toEqual([])
  })
})

describe('voiceFromContentPath', () => {
  it('maps a mirror path to the practice whose record it is', () => {
    expect(voiceFromContentPath('/src/content/field/REQUESTS.md')).toBe('meridian')
    expect(voiceFromContentPath('/src/content/studio/REQUESTS.md')).toBe('ensemble')
    expect(voiceFromContentPath('/src/content/atelier/REQUESTS.md')).toBe('ulysses')
    expect(voiceFromContentPath('/src/content/plenum/REQUESTS.md')).toBe('plenum')
  })

  it('answers unknown for a folder that does not exist yet, rather than guessing', () => {
    expect(voiceFromContentPath('/src/content/somewhere-new/REQUESTS.md')).toBe('unknown')
    expect(voiceFromContentPath('nonsense')).toBe('unknown')
  })
})

// ————————————————————————————————————————————————— the mirrors ——————————————

describe('requestsRows', () => {
  const path = '/src/content/atelier/REQUESTS.md'

  it('keeps a heading that names another practice, with the date wherever the heading puts it', () => {
    const rows = requestsRows(
      path,
      ['## 2026-07-30 — Back to Meridian on the Paper Catalogue', 'body'].join('\n'),
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].date).toBe('2026-07-30')
    expect(rows[0].voice).toBe('ulysses')
    expect(rows[0].names).toEqual(['meridian'])
    expect(rows[0].by).toBe('requests-heading')
  })

  it('reads all three date positions the four mirrors actually use', () => {
    const raw = [
      '## 2026-07-30 — a note to Ulysses',
      '## Team note — 2026-07-25 — Offer: a joint inquiry (ji-2026-002)',
      '## Response (Ulysses, 2026-07-26) — to the Ensemble',
    ].join('\n\n')
    expect(requestsRows('/src/content/field/REQUESTS.md', raw).map((r) => r.date)).toEqual([
      '2026-07-30',
      '2026-07-25',
      '2026-07-26',
    ])
  })

  it('sees a heading written inside a blockquote — half the seed headings are', () => {
    const rows = requestsRows(path, '> ### 2026-08-01 — Seed for ji-2026-002')
    expect(rows).toHaveLength(1)
    expect(rows[0].crossings).toEqual(['ji-2026-002'])
  })

  it('skips the unfilled template line three of the four mirrors carry verbatim', () => {
    expect(requestsRows(path, '> ## YYYY-MM-DD — Request title, with Meridian')).toEqual([])
  })

  it('skips a sub-heading that names a sibling without being a contact', () => {
    // Both are real headings from one long reply; neither is an exchange.
    const raw = ['### 1. What now exists on the MRR side', '### (2) Meridian’s key as a trust anchor'].join('\n\n')
    expect(requestsRows(path, raw)).toEqual([])
  })

  it('keeps a sub-heading that names a crossing by id — that is how Local Commitments are written', () => {
    const rows = requestsRows('/src/content/studio/REQUESTS.md', '> ### Local Commitment — ji-2026-002, Ensemble')
    expect(rows).toHaveLength(1)
    expect(rows[0].date).toBeNull()
    expect(rows[0].voice).toBe('ensemble')
  })

  it('ignores every heading that names nobody', () => {
    expect(requestsRows(path, '## Seeds from the public\n## Open requests')).toEqual([])
  })

  it('never throws on a mirror that is empty, missing or not a string', () => {
    for (const junk of [null, undefined, '', 42, {}]) {
      expect(() => requestsRows(path, junk)).not.toThrow()
      expect(requestsRows(path, junk)).toEqual([])
    }
  })
})

// ————————————————————————————————————————————————— the Plenum ———————————————

describe('plenumRows', () => {
  const sitting = {
    date: '2026-07-22',
    session: 'Session 14',
    goodsInward: {
      text: 'Read the collective’s WORKBOARD.md via web research.',
      source: 'src/content/plenum/journal/2026-07-22.md',
      label: 'Wareneingang (standing item)',
    },
    ecologyNames: ['Meridian / the Field'],
    href: '/plenum/record#cs-14',
    source: 'src/content/plenum/journal/2026-07-22.md',
  }

  it('reuses the plenum dossier’s own extraction rather than re-parsing the minutes', () => {
    const rows = plenumRows([sitting])
    expect(rows).toHaveLength(1)
    expect(rows[0].by).toBe('goods-inward')
    expect(rows[0].voice).toBe('plenum')
    expect(rows[0].names).toEqual(['meridian'])
    expect(rows[0].source).toBe('src/content/plenum/journal/2026-07-22.md')
    expect(rows[0].href).toBe('/plenum/record#cs-14')
  })

  it('skips a sitting with no goods-inward section', () => {
    expect(plenumRows([{ ...sitting, goodsInward: null }])).toEqual([])
  })

  it('never throws on a shape the plenum module might return tomorrow', () => {
    for (const junk of [null, undefined, 'x', 42, [null], [{ goodsInward: 'a string' }]]) {
      expect(() => plenumRows(junk as never)).not.toThrow()
    }
  })
})

// ————————————————————————————————————————————————— the chronicles ———————————

describe('chronicleRows', () => {
  const base = { voice: 'ensemble' as const, source: 'src/data/studio/chronicle.upstream.json' }

  it('keeps a session summary that names a crossing by its id', () => {
    const rows = chronicleRows({
      ...base,
      entries: [{ date: '2026-07-25', collective_session: 40, move: 'build', summary: 'The ji-2026-002 form-étude built.', anchor: 'cs-40' }],
      href: (a) => `/studio/journal/${a}/`,
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].label).toBe('session 40 · build')
    expect(rows[0].href).toBe('/studio/journal/cs-40/')
    expect(rows[0].by).toBe('chronicle-named')
  })

  it('drops a summary that names nobody, and a summary that only names its own house', () => {
    const rows = chronicleRows({
      ...base,
      entries: [
        { date: '2026-07-20', summary: 'A repair session; nothing travelled.' },
        { date: '2026-07-21', summary: 'The Ensemble restaged One Tap.' },
      ],
    })
    expect(rows).toEqual([])
  })

  it('never throws on entries that are not entries', () => {
    for (const junk of [null, undefined, 'x', [null, 7, { summary: {} }]]) {
      expect(() => chronicleRows({ ...base, entries: junk as never })).not.toThrow()
    }
  })
})

// ————————————————————————————————————————————————— the journal ——————————————

describe('journalRows', () => {
  const path = '/src/content/atelier/journal/2026-07-22-hammond-review.md'
  const raw = [
    '---',
    'layout: journal',
    '---',
    '',
    '# 2026-07-22 — The Hammond review',
    '',
    'The morning tick handled the MRR Hammond-row review, and the register entry',
    'enc-2026-005 was accepted.',
    '',
    '## A later section',
  ].join('\n')

  it('quotes the entry’s opening paragraph, unwrapped, with a link to its own page', () => {
    const rows = journalRows(path, raw)
    expect(rows).toHaveLength(1)
    expect(rows[0].date).toBe('2026-07-22')
    expect(rows[0].label).toBe('The Hammond review')
    expect(rows[0].text).toContain('MRR Hammond-row review')
    expect(rows[0].text).not.toContain('\n')
    expect(rows[0].href).toBe('/atelier/journal/2026-07-22-hammond-review/')
    expect(rows[0].names).toEqual(['mrr'])
    expect(rows[0].crossings).toEqual(['enc-2026-005'])
  })

  it('drops an entry that names nobody', () => {
    expect(journalRows(path, '# 2026-07-22 — A quiet tick\n\nNothing travelled today.')).toEqual([])
  })

  it('never throws on an entry with no heading, no frontmatter or no content', () => {
    for (const junk of [null, undefined, '', '---\n---\n', 'Ulysses', 42]) {
      expect(() => journalRows(path, junk)).not.toThrow()
    }
  })
})

// ————————————————————————————————————————————————— assembly —————————————————

const row = (over: Partial<StreamRow>): StreamRow => ({
  id: 'r',
  date: '2026-07-25',
  voice: 'ulysses',
  names: [],
  crossings: [],
  label: 'l',
  text: 't',
  source: 's',
  href: null,
  by: 'requests-heading',
  ...over,
})

describe('sortStream', () => {
  it('reads newest first and sends an undated row to the end', () => {
    const sorted = sortStream([
      row({ id: 'a', date: null }),
      row({ id: 'b', date: '2026-07-21' }),
      row({ id: 'c', date: '2026-07-27' }),
    ])
    expect(sorted.map((r) => r.id)).toEqual(['c', 'b', 'a'])
  })

  it('is stable for two rows the records date identically', () => {
    expect(sortStream([row({ id: 'b' }), row({ id: 'a' })]).map((r) => r.id)).toEqual(['a', 'b'])
  })
})

describe('buildContactStream', () => {
  it('counts one contact once, even though the four mirrors carry the broadcast four times', () => {
    const note = '## Team note — 2026-07-25 — Offer: a joint inquiry (ji-2026-002)'
    const rows = buildContactStream({
      requests: {
        '/src/content/atelier/REQUESTS.md': note,
        // the same practice's own mirror, re-copied — one contact, not two
        '/src/content/atelier/REQUESTS.md.bak': note,
        '/src/content/field/REQUESTS.md': note,
      },
      plenum: [],
      chronicles: [],
      journal: {},
    })
    expect(rows).toHaveLength(2)
    expect(rows.map((r) => r.voice).sort()).toEqual(['meridian', 'ulysses'])
  })

  it('never throws on an input that is not the shape it expects', () => {
    const junk = { requests: null, plenum: null, chronicles: null, journal: null } as never
    expect(() => buildContactStream(junk)).not.toThrow()
    expect(buildContactStream(junk)).toEqual([])
    expect(() => buildContactStream(undefined as never)).not.toThrow()
  })
})

describe('partitionStream', () => {
  const crossings = [
    { id: 'ji-2026-002', matchIds: ['ji-2026-002'] },
    { id: 'enc-2026-005-atlas-lent-not-lifted', matchIds: ['enc-2026-005-atlas-lent-not-lifted', 'enc-2026-005'] },
  ]

  it('files a row with the one crossing it names — the short id the practices actually write', () => {
    const { byCrossing, standing } = partitionStream([row({ id: 'x', crossings: ['enc-2026-005'] })], crossings)
    expect(byCrossing['enc-2026-005-atlas-lent-not-lifted']).toHaveLength(1)
    expect(standing).toEqual([])
  })

  it('leaves a row naming TWO crossings in the standing stream — it belongs to neither alone', () => {
    const { byCrossing, standing } = partitionStream(
      [row({ id: 'x', crossings: ['ji-2026-002', 'enc-2026-005'] })],
      crossings,
    )
    expect(standing).toHaveLength(1)
    expect(byCrossing['ji-2026-002']).toEqual([])
  })

  it('leaves a row naming an unknown crossing in the standing stream rather than dropping it', () => {
    const { standing } = partitionStream([row({ id: 'x', crossings: ['ji-2027-099'] })], crossings)
    expect(standing).toHaveLength(1)
  })

  it('never throws on crossings that are not crossings', () => {
    expect(() => partitionStream([row({})], null as never)).not.toThrow()
  })
})

describe('streamTally and streamVoices', () => {
  const rows = [
    row({ id: '1', by: 'requests-heading', voice: 'ulysses', names: ['mrr'] }),
    row({ id: '2', by: 'goods-inward', voice: 'plenum', names: ['meridian'] }),
    row({ id: '3', by: 'goods-inward', voice: 'plenum', names: ['meridian'] }),
  ]

  it('counts every rule, including the ones that produced nothing', () => {
    const tally = streamTally(rows)
    expect(tally).toHaveLength(4)
    expect(tally.find((t) => t.rule === 'goods-inward')?.count).toBe(2)
    expect(tally.find((t) => t.rule === 'journal-named')?.count).toBe(0)
  })

  it('counts a voice both where it writes and where it is named', () => {
    const voices = streamVoices(rows)
    expect(voices.find((v) => v.voice === 'plenum')?.count).toBe(2)
    expect(voices.find((v) => v.voice === 'meridian')?.count).toBe(2)
    expect(voices.find((v) => v.voice === 'ulysses')?.count).toBe(1)
  })
})
