import { describe, expect, it } from 'vitest'
import { BATCH_SIZE, RECORD_CONTRACT, releaseBatches, serializeRecord, toRecordFile } from './record'
import { CONSENT_LINES, CONSENT_VERSION, consentDigest } from './consent'
import { ANSWERS } from './fixtures'
import type { StoredAnswers } from './store'

const stored = (i: number, day: string): StoredAnswers => ({ id: `s-${i.toString(16).padStart(16, '0')}`, day, consent: CONSENT_VERSION, answers: ANSWERS })
const payload = (entries: unknown[]) => ({ ok: true, study: 'studio-what-you-heard', work: 'studio:the-remainder', batch_size: BATCH_SIZE, entries })

describe('releaseBatches and the record file', () => {
  it('releases whole batches without the day, and nothing below one', () => {
    expect(releaseBatches([stored(1, '2026-10-27')])).toEqual([])
    const out = releaseBatches(Array.from({ length: BATCH_SIZE + 2 }, (_, i) => stored(i, '2026-10-27')))
    expect(out).toHaveLength(BATCH_SIZE)
    expect(out.every((e) => e.batch === 1 && !('day' in e))).toBe(true)
  })

  it('writes the same text for the same record, one answer set per line, and refuses a day', () => {
    const entries = releaseBatches(Array.from({ length: BATCH_SIZE }, (_, i) => stored(i, '2026-10-27')))
    const f = toRecordFile(payload(entries), 'test')
    expect(f).toMatchObject({ $contract: RECORD_CONTRACT, licence: 'CC0-1.0', entries_count: BATCH_SIZE })
    const text = serializeRecord(f)
    expect(JSON.parse(text)).toEqual(f)
    expect(text.split('\n').filter((l) => l.includes('"id":"s-')).length).toBe(BATCH_SIZE)
    expect(() => toRecordFile(payload([{ ...entries[0]!, day: '2026-10-27' }]), 'test')).toThrow()
    expect(() => toRecordFile({ ok: false, reason: 'standby' }, 'test')).toThrow()
  })
})

describe('the house consent text for studies', () => {
  /** Every consent text an answer set was ever given under, by version. Add a line when the text
   *  changes — never edit one: stored answers carry the version they were given under. */
  const GIVEN: Record<string, string> = { '2026-10-27': 'afd120f4' }
  it('names who asks, what is kept and not, where it goes, why it cannot be taken back, and who is responsible', () => {
    expect(CONSENT_LINES.map((l) => l.label)).toEqual(['Who asks', 'What is kept', 'What is not', 'Where it goes', 'Why it cannot be taken back', 'Who is responsible'])
    const all = CONSENT_LINES.map((l) => l.text).join(' ')
    for (const word of ['approved', 'CC0', 'batches of at least five', 'without the day', '30 days', 'not even the bot check', '16 or older', 'privacy policy', 'material']) {
      expect(all).toContain(word)
    }
    expect(GIVEN[CONSENT_VERSION]).toBe(consentDigest())
  })
})
