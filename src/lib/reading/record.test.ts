import { describe, expect, it } from 'vitest'
import { BATCH_SIZE, RECORD_CONTRACT, releaseBatches, serializeRecord, toRecordFile } from './record'
import type { StoredReading } from './reading'

const SOURCE = 'https://frankbueltge.de/api/reading/record?round=after-cycle-010'
const hex = (i: number) => i.toString(16).padStart(16, '0')
const stored = (i: number, day: string): StoredReading => ({
  id: `t-${hex(i)}`,
  day,
  consent: '2026-10-26',
  primed: i % 4 === 0,
  votes: [['hunger', 'cop31', 0, 1800], ['ebola', 'el-nino', 2, 2400]],
  estimates: [['aid-cut', 40, 6000]],
})
const payload = (entries: unknown[]) => ({ ok: true, round: 'after-cycle-010', batch_size: BATCH_SIZE, entries })

describe('releaseBatches', () => {
  it('releases only whole batches, oldest first, each reading without its day', () => {
    const finished = Array.from({ length: 2 * BATCH_SIZE + 3 }, (_, i) => stored(i, i < BATCH_SIZE ? '2026-10-27' : '2026-10-28'))
    const out = releaseBatches(finished)
    expect(out).toHaveLength(2 * BATCH_SIZE)
    expect(out.filter((e) => e.batch === 1).map((e) => e.id).sort()).toEqual(finished.slice(0, BATCH_SIZE).map((e) => e.id).sort())
    expect(out.every((e) => !('day' in e))).toBe(true)
  })

  it('releases nothing below one batch', () => {
    expect(releaseBatches([stored(1, '2026-10-27')])).toEqual([])
  })
})

describe('toRecordFile', () => {
  it('keeps the released readings in batch and id order under CC0, with nothing the record did not hold', () => {
    const entries = releaseBatches(Array.from({ length: BATCH_SIZE }, (_, i) => stored(BATCH_SIZE - i, '2026-10-27')))
    const f = toRecordFile(payload([...entries].reverse().map((e) => ({ ...e, extra: 'dropped' }))), SOURCE)
    expect(f).toMatchObject({ $contract: RECORD_CONTRACT, licence: 'CC0-1.0', batch_size: BATCH_SIZE, readings: BATCH_SIZE })
    expect(f.entries.map((e) => e.id)).toEqual([...f.entries.map((e) => e.id)].sort())
    expect(Object.keys(f.entries[0]!)).toEqual(['id', 'batch', 'consent', 'primed', 'votes', 'estimates'])
  })

  it('writes nothing from an answer in standby, a malformed reading, or one that carries its day', () => {
    const ok = releaseBatches(Array.from({ length: BATCH_SIZE }, (_, i) => stored(i, '2026-10-27')))[0]!
    expect(() => toRecordFile({ ok: false, reason: 'standby' }, SOURCE)).toThrow()
    expect(() => toRecordFile(payload([{ ...ok, id: 't-1' }]), SOURCE)).toThrow()
    expect(() => toRecordFile(payload([{ ...ok, votes: [['a', 'b', 7, 1]] }]), SOURCE)).toThrow()
    expect(() => toRecordFile(payload([{ ...ok, primed: 'no' }]), SOURCE)).toThrow()
    expect(() => toRecordFile(payload([{ ...ok, day: '2026-10-27' }]), SOURCE)).toThrow()
  })
})

describe('serializeRecord', () => {
  it('is valid JSON, one reading per line, and the same text for the same record', () => {
    const entries = releaseBatches(Array.from({ length: BATCH_SIZE }, (_, i) => stored(i, '2026-10-27')))
    const f = toRecordFile(payload(entries), SOURCE)
    const text = serializeRecord(f)
    expect(JSON.parse(text)).toEqual(f)
    expect(text.split('\n').filter((l) => l.includes('"id":"t-')).length).toBe(BATCH_SIZE)
    expect(serializeRecord(toRecordFile(payload(JSON.parse(text).entries), SOURCE))).toBe(text)
  })

  it('writes an empty round as an empty list', () => {
    const text = serializeRecord(toRecordFile(payload([]), SOURCE))
    expect(JSON.parse(text).entries).toEqual([])
  })
})
