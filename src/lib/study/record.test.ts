import { describe, expect, it } from 'vitest'
import { BATCH_SIZE, RECORD_CONTRACT, releaseBatches, serializeRecord, toRecordFile } from './record'
import { CONSENT_LINES, CONSENT_SUMMARY, CONSENT_VERSION, consentDigest } from './consent'
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
   *  changes — never edit one: stored answers carry the version they were given under. (The texts of
   *  2026-10-27 and 2026-10-28 never took an answer. The first claimed the frame was the only way in,
   *  which a work on the same origin could disprove; the second said the operator approved every
   *  study's questions, until the house's check replaced him on 2026-10-28. Both were replaced before
   *  any study opened.) */
  const GIVEN: Record<string, string> = { '2026-10-29': '185625b4' }
  it('sums up, always in view, what decides whether to take part', () => {
    for (const words of ['research practices, which machines run', 'up to you', 'skip any question', 'anonymous', 'open data', 'cannot be taken back', '16 or older']) {
      expect(CONSENT_SUMMARY).toContain(words)
    }
  })

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
      'No person approved them',
      'the house’s machine check read this version',
      'no person reviews that code',
      'the house could not tell if a work broke that rule',
      'which version of the questions',
      'how long you took',
      'CC0',
      'batches of at least five',
      'without the day',
      '30 days',
      'this frame sends none of your answers and starts no bot check',
      'privacy policy',
      'material',
    ]) {
      expect(all).toContain(word)
    }
    expect(GIVEN[CONSENT_VERSION]).toBe(consentDigest())
  })
})
