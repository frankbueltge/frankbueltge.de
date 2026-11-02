// src/lib/notify/operator.ts — what the operator's bells say (2026-11-02).
//
// Frank asked for a mail whenever somebody offers a seed, rates a work or takes part in a reading or
// a study (2026-11-02, wording private). The rail is the letterbox's (src/lib/post/brevo.ts): duty
// mails TO the operator, never mail to anyone outside, so "nothing sends itself" stays untouched.
//
// A bell carries the letterbox bell's measure: what happened and where, never what a visitor wrote.
// No seed text, no note, no name, no answer.
//   · a seed    — at once: its kind, its addressee and the writer's chosen mark, as the letter bell
//                 names the sender mark. The seed waits in a private queue until the operator acts.
//   · a rating  — at once: the work, the score and whether a note came with it. The reception keeps
//                 the time of a rating anyway and shows it with the note. At most
//                 RATING_MAILS_PER_DAY a day; the last one says so, and the daily mail counts them all.
//   · readings and study answers — once a day, counted per round and per study, for the day before.
//                 Both promise their readers that the house keeps the day and not the hour
//                 (src/lib/reading/consent.ts, src/lib/study/consent.ts); a mail per arrival would keep
//                 the hour in the operator's mailbox.
//
// Operator mail is German, the Steuerzentrale's language (spec 2026-08-01-rueckweg-email-design.md).
// Nothing in here performs IO: ./handlers.ts counts and sends.
import { brevoMissing, brevoReplyRequest, isEmail, NEED, type BrevoRequest } from '../post/brevo'

export const SITE = 'https://frankbueltge.de'

/** Rating bells per UTC day; the daily mail counts every rating regardless. */
export const RATING_MAILS_PER_DAY = 10

export interface OperatorMail {
  subject: string
  text: string
}

/** Every piece a bell needs that the environment lacks; empty means armed. */
export function operatorMissing(env: Record<string, unknown>): string[] {
  const missing = brevoMissing(env, NEED.reply)
  if (!isEmail(env.BREVO_NOTIFY_TO)) missing.push('BREVO_NOTIFY_TO')
  return missing
}

/** The Brevo request for one bell, or null while the rail is not armed. */
export function operatorRequest(env: Record<string, unknown>, mail: OperatorMail): BrevoRequest | null {
  if (operatorMissing(env).length > 0) return null
  const name = typeof env.BREVO_SENDER_NAME === 'string' && env.BREVO_SENDER_NAME.trim() !== '' ? env.BREVO_SENDER_NAME : undefined
  return brevoReplyRequest({
    apiKey: env.BREVO_API_KEY as string,
    senderEmail: env.BREVO_SENDER_EMAIL as string,
    senderName: name,
    to: env.BREVO_NOTIFY_TO as string,
    subject: mail.subject,
    text: mail.text,
  })
}

const ADDRESSEE: Record<string, string> = {
  'field-research': 'The Field (Meridian)',
  studio: 'The Studio (Ensemble)',
  ulysses: 'The Atelier (Assay)',
  open: 'alle drei Praxen',
}

const SEED_KIND: Record<string, string> = { frage: 'Frage', quelle: 'Quelle', wort: 'Wort', richtung: 'Richtung' }

export function seedMail(seed: { id: string; kind: string; addressedTo: string; authorMark: string }): OperatorMail {
  const to = ADDRESSEE[seed.addressedTo] ?? seed.addressedTo
  return {
    subject: `Neue Saat wartet auf Freigabe — an ${to}`,
    text: [
      `Art: ${SEED_KIND[seed.kind] ?? seed.kind}`,
      `An: ${to}`,
      `Von: ${seed.authorMark}`,
      `Kennung: ${seed.id}`,
      '',
      'Lesen, freigeben oder verwerfen in der Steuerzentrale:',
      `${SITE}/steuerzentrale/`,
    ].join('\n'),
  }
}

/**
 * The bell for one visitor's rating, or null once the day's bells are used up. `n` counts the day's
 * visitor ratings with this one, so the bell that reaches the limit can say that it does.
 */
export function ratingMail(r: { work: string; score: number; note: boolean; n: number }): OperatorMail | null {
  if (r.n > RATING_MAILS_PER_DAY) return null
  const lines = [
    `Werk: ${r.work}`,
    `Bewertung: ${r.score} von 5`,
    `Notiz: ${r.note ? 'ja, öffentlich unter dem Werk' : 'nein'}`,
    '',
    `Alle Bewertungen: ${SITE}/reception/`,
  ]
  if (r.n === RATING_MAILS_PER_DAY) {
    lines.push('', `Das ist die ${RATING_MAILS_PER_DAY}. Bewertungsmail heute. Weitere Bewertungen bis Mitternacht (UTC) zählt die Tagesmail.`)
  }
  return { subject: `Neue Bewertung: ${r.score} von 5 für ${r.work}`, text: lines.join('\n') }
}

export interface DayCounts {
  ratings: { work: string; n: number; average: number; notes: number }[]
  readings: { round: string; n: number }[]
  studies: { study: string; n: number }[]
}

const total = (rows: { n: number }[]): number => rows.reduce((sum, r) => sum + r.n, 0)
const counted = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

/** 2026-11-02 → 2.11.2026 */
export const germanDate = (day: string): string => {
  const [y, m, d] = day.split('-').map(Number)
  return `${d}.${m}.${y}`
}

/** The day before `now`, as a UTC date. */
export const previousDay = (now: Date): string =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)).toISOString().slice(0, 10)

/** One day's participation as one mail, or null when nobody took part. */
export function dailyMail(day: string, c: DayCounts): OperatorMail | null {
  const ratings = total(c.ratings)
  const readings = total(c.readings)
  const answers = total(c.studies)
  if (ratings + readings + answers === 0) return null
  const summary = [
    ratings > 0 ? counted(ratings, 'Bewertung', 'Bewertungen') : null,
    readings > 0 ? counted(readings, 'Lesung', 'Lesungen') : null,
    answers > 0 ? counted(answers, 'Studienantwort', 'Studienantworten') : null,
  ]
    .filter((part): part is string => part !== null)
    .join(', ')
  const lines = [`Am ${germanDate(day)} (UTC) auf frankbueltge.de: ${summary}.`]
  if (ratings > 0) {
    lines.push('', 'Bewertungen')
    for (const r of c.ratings) {
      lines.push(`  ${r.work}: ${r.n}×, im Schnitt ${r.average.toFixed(1).replace('.', ',')}${r.notes > 0 ? `, ${r.notes} mit Notiz` : ''}`)
    }
    lines.push(`  ${SITE}/reception/`)
  }
  if (readings > 0) {
    lines.push('', 'Third Reading')
    for (const r of c.readings) lines.push(`  Runde ${r.round}: ${r.n}`)
    lines.push(`  ${SITE}/third-reading/`)
  }
  if (answers > 0) {
    lines.push('', 'Studien')
    for (const s of c.studies) lines.push(`  ${s.study}: ${s.n}`)
    lines.push(`  ${SITE}/studies/`)
  }
  lines.push(
    '',
    'Lesungen und Antworten kommen nur gezählt und erst am Folgetag: Ihre Seiten versprechen, dass die Website den Tag speichert, nicht die Uhrzeit.',
  )
  return { subject: `frankbueltge.de am ${germanDate(day)}: ${summary}`, text: lines.join('\n') }
}

/** The one-off mail that shows the rail works. */
export function testMail(now: Date): OperatorMail {
  return {
    subject: 'Benachrichtigungen von frankbueltge.de: Testmail',
    text: [
      'Diese Mail zeigt, dass die Benachrichtigungen ankommen. Ab jetzt meldet sich die Website',
      '  · sofort, wenn jemand eine Saat einreicht: Art, Adressat und Pseudonym, nie der Text;',
      `  · sofort, wenn jemand ein Werk bewertet: Werk und Punktzahl, nie Notiz oder Name, höchstens ${RATING_MAILS_PER_DAY}-mal am Tag;`,
      '  · einmal am Tag mit den Bewertungen, Lesungen (Third Reading) und Studienantworten des Vortags, nur gezählt, und nur, wenn es welche gab.',
      '',
      'Briefe und bestätigte Digest-Anmeldungen melden sich wie bisher.',
      '',
      `Gesendet am ${germanDate(now.toISOString().slice(0, 10))} um ${now.toISOString().slice(11, 16)} UTC.`,
    ].join('\n'),
  }
}
