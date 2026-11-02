import { describe, expect, it } from 'vitest'
import { dailyMail, germanDate, operatorMissing, operatorRequest, previousDay, RATING_MAILS_PER_DAY, ratingMail, seedMail, testMail } from './operator'

const ARMED = { BREVO_API_KEY: 'key-for-tests', BREVO_SENDER_EMAIL: 'hello@example.org', BREVO_NOTIFY_TO: 'operator@example.org' }

describe('the rail the bells ride', () => {
  it('names every missing piece, the operator’s address included', () => {
    expect(operatorMissing({})).toEqual(['BREVO_API_KEY', 'BREVO_SENDER_EMAIL', 'BREVO_NOTIFY_TO'])
    expect(operatorMissing({ ...ARMED, BREVO_NOTIFY_TO: 'not an address' })).toEqual(['BREVO_NOTIFY_TO'])
    expect(operatorMissing(ARMED)).toEqual([])
  })

  it('builds nothing while unarmed, and once armed a mail to the operator alone', () => {
    expect(operatorRequest({}, { subject: 's', text: 't' })).toBeNull()
    const req = operatorRequest(ARMED, { subject: 's', text: 't' })
    expect(req?.url).toBe('https://api.brevo.com/v3/smtp/email')
    const body = JSON.parse(req?.init.body ?? '{}')
    expect(body.to).toEqual([{ email: 'operator@example.org' }])
    expect(body.sender).toEqual({ email: 'hello@example.org' })
  })
})

describe('what a bell carries', () => {
  it('names a seed by kind, addressee and mark, and points to where it waits', () => {
    const mail = seedMail({ id: 'saat-20261102-abc123', kind: 'frage', addressedTo: 'open', authorMark: 'river' })
    expect(mail.subject).toBe('Neue Saat wartet auf Freigabe — an alle drei Praxen')
    expect(mail.text).toContain('Art: Frage')
    expect(mail.text).toContain('Von: river')
    expect(mail.text).toContain('Kennung: saat-20261102-abc123')
    expect(mail.text).toContain('https://frankbueltge.de/steuerzentrale/')
  })

  it('names a practice by its house name', () => {
    expect(seedMail({ id: 'x', kind: 'wort', addressedTo: 'ulysses', authorMark: 'anonymous' }).subject).toContain('The Atelier (Assay)')
  })

  it('rings for a rating up to the day’s limit, says so at the limit, and is quiet after it', () => {
    const first = ratingMail({ work: 'studio:tide', score: 4, note: true, n: 1 })
    expect(first?.subject).toBe('Neue Bewertung: 4 von 5 für studio:tide')
    expect(first?.text).toContain('Notiz: ja')
    expect(first?.text).not.toContain('Bewertungsmail heute')
    expect(ratingMail({ work: 'studio:tide', score: 2, note: false, n: RATING_MAILS_PER_DAY })?.text).toContain(`${RATING_MAILS_PER_DAY}. Bewertungsmail heute`)
    expect(ratingMail({ work: 'studio:tide', score: 2, note: false, n: RATING_MAILS_PER_DAY + 1 })).toBeNull()
  })
})

describe('the daily mail', () => {
  it('is not sent for a day nobody took part', () => {
    expect(dailyMail('2026-11-01', { ratings: [], readings: [], studies: [] })).toBeNull()
  })

  it('counts per work, round and study, and names the day but no time of day', () => {
    const mail = dailyMail('2026-11-01', {
      ratings: [{ work: 'lab:ducking', n: 2, average: 4.5, notes: 1 }],
      readings: [{ round: 'after-cycle-011', n: 1 }],
      studies: [{ study: 'field:tempo', n: 3 }],
    })
    expect(mail?.subject).toBe('frankbueltge.de am 1.11.2026: 2 Bewertungen, 1 Lesung, 3 Studienantworten')
    expect(mail?.text).toContain('lab:ducking: 2×, im Schnitt 4,5, 1 mit Notiz')
    expect(mail?.text).toContain('Runde after-cycle-011: 1')
    expect(mail?.text).toContain('field:tempo: 3')
    expect(mail?.text).not.toMatch(/\d{1,2}:\d{2}/)
  })

  it('leaves out what nobody did', () => {
    const mail = dailyMail('2026-11-01', { ratings: [{ work: 'lab:ducking', n: 1, average: 3, notes: 0 }], readings: [], studies: [] })
    expect(mail?.subject).toBe('frankbueltge.de am 1.11.2026: 1 Bewertung')
    expect(mail?.text).not.toContain('Third Reading')
    expect(mail?.text).not.toContain('Studien\n')
    expect(mail?.text).not.toContain('mit Notiz')
  })
})

describe('days', () => {
  it('finds the day before across a month and a year', () => {
    expect(previousDay(new Date('2026-11-01T00:05:00Z'))).toBe('2026-10-31')
    expect(previousDay(new Date('2027-01-01T23:59:00Z'))).toBe('2026-12-31')
  })

  it('writes a date the German way', () => {
    expect(germanDate('2026-11-02')).toBe('2.11.2026')
  })
})

it('the test mail says what will ring, and when it was sent', () => {
  const mail = testMail(new Date('2026-11-02T21:55:00Z'))
  expect(mail.text).toContain(`höchstens ${RATING_MAILS_PER_DAY}-mal am Tag`)
  expect(mail.text).toContain('am 2.11.2026 um 21:55 UTC')
})
