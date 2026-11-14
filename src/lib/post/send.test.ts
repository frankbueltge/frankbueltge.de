// How a letter leaves the post office (2026-11-14): the send block of a packet, the operator's two
// links, and the record that it was sent. Sending itself is nowhere in this code: a human does it.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { sendOf as sendOfScript, SEND_BODY_MAX } from '../../../scripts/post/send-block.mjs'
import { noteOf, record as recordScript } from '../../../scripts/post/record.mjs'
import { deliverySchema, loadLedger, MAILTO_BODY_MAX, mailtoOf, readyToSend, recordIssueUrl, recordTitle, type Delivery } from './ledger'

// The two scripts are plain modules; their shapes are stated here once.
const sendOf = sendOfScript as (packet: unknown, baseDir: string) => { send?: unknown; send_problem?: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const record = recordScript as (input: { title: string; body: string; today: string; ledger: unknown[]; manual: unknown[] }) => any

const dir = mkdtempSync(join(tmpdir(), 'packet-'))
afterAll(() => rmSync(dir, { recursive: true, force: true }))
const LETTER = 'Dear data desk, this study is built on your record of chip owners and found three things.'
writeFileSync(join(dir, 'letter.txt'), `${LETTER}\r\n\r\n`)
mkdirSync(join(dir, 'sub'))
writeFileSync(join(dir, 'sub', 'long.txt'), 'x'.repeat(SEND_BODY_MAX + 1))

describe('the send block of a packet', () => {
  it('is optional', () => {
    expect(sendOf({}, dir)).toEqual({})
  })

  it('reads the letter beside the packet and keeps only what the page needs', () => {
    expect(sendOf({ send: { kind: 'email', to: 'data@example.org', subject: ' A study built on your data ' } }, dir)).toEqual({
      send: { kind: 'email', to: 'data@example.org', subject: 'A study built on your data', body: LETTER },
    })
    expect(sendOf({ send: { kind: 'form', url: 'https://example.org/submit', subject: 'A work', body_file: 'letter.txt' } }, dir)).toEqual({
      send: { kind: 'form', url: 'https://example.org/submit', subject: 'A work', body: LETTER },
    })
  })

  it('never stops the ledger: a block it cannot use becomes a reason in plain words', () => {
    const bad = (send: unknown) => sendOf({ send }, dir).send_problem as string
    expect(bad('by mail')).toMatch(/not an object/)
    expect(bad({ kind: 'fax', subject: 's' })).toMatch(/email.*form/)
    expect(bad({ kind: 'email', to: 'a@example.org, b@example.org', subject: 'One subject' })).toMatch(/one mail address/)
    expect(bad({ kind: 'form', url: 'http://example.org/form', subject: 'One subject' })).toMatch(/https/)
    expect(bad({ kind: 'email', to: 'a@example.org', subject: 'two\nlines' })).toMatch(/one line/)
    expect(bad({ kind: 'email', to: 'a@example.org', subject: 'One subject', body_file: '../outside.txt' })).toMatch(/inside the packet/)
    expect(bad({ kind: 'email', to: 'a@example.org', subject: 'One subject', body_file: 'missing.txt' })).toMatch(/not there/)
    expect(bad({ kind: 'email', to: 'a@example.org', subject: 'One subject', body_file: 'sub/long.txt' })).toMatch(/longer than/)
    expect(bad({ kind: 'email', to: 'a@example.org', subject: 'One subject', body: 'too short' })).toMatch(/empty/)
  })
})

const base: Delivery = {
  id: '2026-11-a-letter',
  practice: 'field',
  piece: 'A study of acts',
  receiver: 'An institute, its data desk',
  receiver_channel: 'data@example.org, as published on its data page',
  status: 'prepared',
  as_of: '2026-11-14',
  record_url: 'https://github.com/frankbueltge/field-research/tree/main/deliveries/a-letter',
  note: 'Lies ready.',
  derived_from: 'deliveries/a-letter/packet.json',
  send: { kind: 'email', to: 'data@example.org', subject: 'A study & its data', body: LETTER },
}

describe('the operator’s two links', () => {
  it('hands him a finished mail while the text fits a mail link', () => {
    const link = mailtoOf(base.send!)!
    expect(link.carriesBody).toBe(true)
    expect(link.href.startsWith('mailto:data@example.org?subject=A%20study%20%26%20its%20data&body=Dear%20data%20desk')).toBe(true)
    const long = mailtoOf({ ...base.send!, body: 'x'.repeat(MAILTO_BODY_MAX + 1) })!
    expect(long.carriesBody).toBe(false)
    expect(long.href).toBe('mailto:data@example.org?subject=A%20study%20%26%20its%20data')
  })

  it('gives no mail link for a letter that goes through a form', () => {
    expect(mailtoOf({ kind: 'form', url: 'https://example.org/submit', subject: 'A work', body: LETTER })).toBeNull()
  })

  it('prefills the issue whose title the record reads', () => {
    expect(recordTitle('sent', base.id)).toBe('Post sent: 2026-11-a-letter')
    const url = new URL(recordIssueUrl('sent', base.id))
    expect(url.pathname).toBe('/frankbueltge/frankbueltge.de/issues/new')
    expect(url.searchParams.get('title')).toBe('Post sent: 2026-11-a-letter')
  })

  it('counts as ready only what lies prepared with a letter that can be sent', () => {
    expect(readyToSend([base, { ...base, id: '2026-11-b', status: 'sent' }, { ...base, id: '2026-11-c', send: undefined }]).map((d) => d.id)).toEqual([base.id])
  })

  it('the committed ledger parses with its send blocks, and each can be handed over', () => {
    for (const d of loadLedger()) {
      if (!d.send) continue
      expect(d.send.kind === 'email' ? mailtoOf(d.send) : d.send.url, d.id).toBeTruthy()
    }
  })
})

describe('the record that a letter was sent', () => {
  const ledger = [base, { ...base, id: '2026-08-older', as_of: '2026-08-01', send: undefined }]
  const run = (title: string, body = '', today = '2026-11-20', l: Delivery[] = ledger, manual: unknown[] = []) =>
    record({ title, body, today, ledger: l, manual })

  it('writes sent into both ledgers, as a whole entry of its own', () => {
    const out = run('Post sent: 2026-11-a-letter')
    expect(out.ok).toBe(true)
    const entry = out.ledger.find((e: Delivery) => e.id === base.id)
    expect(entry).toMatchObject({ status: 'sent', as_of: '2026-11-20', note: 'Sent by the operator on 2026-11-20.', derived_from: base.derived_from })
    expect(deliverySchema.safeParse(entry).success).toBe(true)
    // the site-side copy stands without the practice's packet, and without the mark of a derived entry
    expect(out.manual).toHaveLength(1)
    expect(out.manual[0].derived_from).toBeUndefined()
    expect(deliverySchema.safeParse(out.manual[0]).success).toBe(true)
    expect(out.ledger[0].id).toBe(base.id) // newest first
    expect(ledger[0].status).toBe('prepared') // the input is not touched
  })

  it('takes the operator’s own line for the ledger', () => {
    expect(noteOf('Opened from /post.\n  note:  with the recording of 12 minutes  \nmore')).toBe('with the recording of 12 minutes')
    expect(noteOf('no such line')).toBeNull()
    const out = run('Post sent: 2026-11-a-letter', 'Note: with the recording')
    expect(out.ledger.find((e: Delivery) => e.id === base.id).note).toBe('Sent by the operator on 2026-11-20. with the recording')
  })

  it('records an answer or silence only for a letter that was sent', () => {
    expect(run('Post answered: 2026-11-a-letter')).toMatchObject({ ok: false })
    const sent = run('Post sent: 2026-11-a-letter')
    const answered = run('Post answered: 2026-11-a-letter', '', '2026-12-01', sent.ledger, sent.manual)
    expect(answered.ok).toBe(true)
    expect(answered.manual).toHaveLength(1)
    expect(answered.ledger.find((e: Delivery) => e.id === base.id).status).toBe('answered')
    expect(run('Post sent: 2026-11-a-letter', '', '2026-12-02', sent.ledger, sent.manual)).toMatchObject({ ok: false })
  })

  it('changes nothing for a title it does not understand or a letter it does not know', () => {
    expect(run('Post sent: 2026-11-a-letter; rm -rf')).toMatchObject({ ok: false })
    expect(run('Post withdrawn: 2026-11-a-letter')).toMatchObject({ ok: false })
    expect(run('Post sent: 2026-11-nobody')).toMatchObject({ ok: false })
  })
})
