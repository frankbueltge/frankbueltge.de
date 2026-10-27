import { describe, expect, it } from 'vitest'
import { BATCH_SIZE, RECORD_CONTRACT, releaseBatches, serializeRecord, toRecordFile } from './record'
import { CONSENT_LINES, CONSENT_VERSION, consentDigest } from './consent'
import { ANSWERS } from './fixtures'
import type { StoredAnswers } from './store'

const stored = (i: number, day: string): StoredAnswers => ({ id: `s-${i.toString(16).padStart(16, '0')}`, day, consent: CONSENT_VERSION, manifest: 'a'.repeat(64), answers: ANSWERS })
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
    expect(() => toRecordFile(payload([{ ...entries[0]!, manifest: undefined }]), 'test')).toThrow(/manifest/)
    expect(() => toRecordFile({ ok: false, reason: 'standby' }, 'test')).toThrow()
  })
})

describe('the house consent text for studies', () => {
  /** Every consent text an answer set was ever given under, by version. Add a line when the text
   *  changes — never edit one: stored answers carry the version they were given under. (The text of
   *  2026-10-27 never took an answer: it claimed the frame was the only way in, which a work on the
   *  same origin could disprove, and was replaced before the studies went live.) */
  const GIVEN: Record<string, string> = { '2026-10-28': '2aa422b3' }
  it('names who asks, the work and the frame, what is kept and not, where it goes, why it cannot be taken back, and who is responsible', () => {
    expect(CONSENT_LINES.map((l) => l.label)).toEqual([
      'Who asks',
      'The work and this frame',
      'What is kept',
      'What is not',
      'Where it goes',
      'Why it cannot be taken back',
      'Who is responsible',
    ])
    const all = CONSENT_LINES.map((l) => l.text).join(' ')
    for (const word of [
      'approved',
      'the operator approved the questions, not the code',
      'which version of the questions',
      'how long you took',
      'CC0',
      'batches of at least five',
      'without the day',
      '30 days',
      'this frame has sent nothing, not even the bot check',
      '16 or older',
      'privacy policy',
      'material',
    ]) {
      expect(all).toContain(word)
    }
    expect(GIVEN[CONSENT_VERSION]).toBe(consentDigest())
  })
})
