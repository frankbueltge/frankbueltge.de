// scripts/post/send-block.mjs — how a packet goes out (2026-11-14).
//
// Read by sync-post-ledger.mjs for every packet and every site-side entry, and by the tests.
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// A packet may say how it is sent: by mail to an address the receiver published, or through a form
// or call page. The text that leaves is a plain file beside the packet, so the page can hand the
// human who sends it a finished mail. The block is optional, and a block that cannot be read never
// stops the ledger: the packet enters without it and says why, on the page, where the practice and
// the operator both see it.
const SEND_KINDS = new Set(['email', 'form'])
export const SEND_SUBJECT_MAX = 160
export const SEND_BODY_MAX = 6000

/** The resolved send block of one packet: { send } on success, { send_problem } when it cannot be used, {} when there is none. */
export function sendOf(packet, baseDir) {
  const s = packet.send
  if (s === undefined || s === null) return {}
  const no = (why) => ({ send_problem: why })
  if (typeof s !== 'object' || Array.isArray(s)) return no('"send" is not an object')
  if (!SEND_KINDS.has(s.kind)) return no('send.kind must be "email" or "form"')
  if (s.kind === 'email' && !(typeof s.to === 'string' && /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(s.to))) {
    return no('send.to is not one mail address')
  }
  if (s.kind === 'form' && !(typeof s.url === 'string' && /^https:\/\/[^\s]+$/.test(s.url))) {
    return no('send.url is not an https address')
  }
  if (typeof s.subject !== 'string' || s.subject.trim() === '' || s.subject.length > SEND_SUBJECT_MAX || /[\r\n]/.test(s.subject)) {
    return no(`send.subject must be one line of at most ${SEND_SUBJECT_MAX} characters`)
  }
  let body = s.body
  if (body === undefined) {
    const file = s.body_file ?? 'letter.txt'
    if (typeof file !== 'string' || file.startsWith('/') || file.split('/').includes('..')) return no('send.body_file must be a path inside the packet')
    const path = join(baseDir, file)
    if (!existsSync(path) || !statSync(path).isFile()) return no(`the letter's text, ${file}, is not there`)
    body = readFileSync(path, 'utf8')
  }
  if (typeof body !== 'string') return no('send.body is not text')
  body = body.replace(/\r\n/g, '\n').trim()
  if (body.length < 20) return no("the letter's text is empty")
  if (body.length > SEND_BODY_MAX) return no(`the letter's text is longer than ${SEND_BODY_MAX} characters`)
  return {
    send: { kind: s.kind, ...(s.kind === 'email' ? { to: s.to } : { url: s.url }), subject: s.subject.trim(), body },
  }
}
