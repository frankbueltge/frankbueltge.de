// src/lib/post/brevo.test.ts
import { describe, it, expect } from 'vitest'
import { isEmail, brevoMissing, brevoDoiRequest, brevoReplyRequest, brevoId, hookAuthorized, subscriberFromHook, NEED } from './brevo'

describe('isEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(isEmail('a.reader@example.org')).toBe(true)
    expect(isEmail('  padded@example.org ')).toBe(true)
  })

  it('refuses what is clearly not an address — the letterbox contact field is free-form', () => {
    // The contact field accepts "email or similar": a Mastodon handle or a phone number may
    // legitimately sit there. The reply-by-email button must not offer itself for those.
    expect(isEmail('@user@mastodon.social')).toBe(false)
    expect(isEmail('+49 170 000000')).toBe(false)
    expect(isEmail('just words')).toBe(false)
    expect(isEmail('')).toBe(false)
    expect(isEmail(undefined)).toBe(false)
    expect(isEmail('a@b.c')).toBe(false) // TLD too short to be real
  })

  it('caps the length — 320 is the RFC ceiling, beyond it nothing is deliverable', () => {
    expect(isEmail(`${'x'.repeat(320)}@example.org`)).toBe(false)
  })
})

describe('brevoMissing', () => {
  it('names every absent key so standby can say what is missing (spec D4)', () => {
    expect(brevoMissing({}, NEED.subscribe)).toEqual([
      'BREVO_API_KEY',
      'BREVO_LIST_ID',
      'BREVO_DOI_TEMPLATE_ID',
    ])
  })

  it('an empty string is missing — a blank secret must not count as configured', () => {
    expect(brevoMissing({ BREVO_API_KEY: '  ' }, NEED.reply)).toEqual([
      'BREVO_API_KEY',
      'BREVO_SENDER_EMAIL',
    ])
  })

  it('complete env → nothing missing', () => {
    expect(
      brevoMissing({ BREVO_API_KEY: 'k', BREVO_SENDER_EMAIL: 'hello@frankbueltge.de' }, NEED.reply),
    ).toEqual([])
  })
})

describe('brevoDoiRequest', () => {
  const req = brevoDoiRequest({
    apiKey: 'k',
    email: ' reader@example.org ',
    listId: 7,
    templateId: 3,
    redirectionUrl: 'https://frankbueltge.de/post/?subscribed=1',
  })

  it('targets the double-opt-in endpoint — the visitor confirms before the list holds them', () => {
    expect(req.url).toBe('https://api.brevo.com/v3/contacts/doubleOptinConfirmation')
  })

  it('carries list, template, redirect and the trimmed address', () => {
    const body = JSON.parse(req.init.body)
    expect(body).toEqual({
      email: 'reader@example.org',
      includeListIds: [7],
      templateId: 3,
      redirectionUrl: 'https://frankbueltge.de/post/?subscribed=1',
    })
  })

  it('authenticates via the api-key header', () => {
    expect(req.init.headers['api-key']).toBe('k')
  })
})

describe('brevoReplyRequest', () => {
  const req = brevoReplyRequest({
    apiKey: 'k',
    senderEmail: 'hello@frankbueltge.de',
    senderName: 'Frank Bültge',
    to: 'reader@example.org',
    subject: 'Re: your letter',
    text: 'Answered in plain text.',
  })

  it('is a plain-text transactional send from the verified sender', () => {
    expect(req.url).toBe('https://api.brevo.com/v3/smtp/email')
    const body = JSON.parse(req.init.body)
    expect(body.sender).toEqual({ email: 'hello@frankbueltge.de', name: 'Frank Bültge' })
    expect(body.to).toEqual([{ email: 'reader@example.org' }])
    expect(body.textContent).toBe('Answered in plain text.')
    expect(body.htmlContent).toBeUndefined()
  })

  it('replyTo goes to the sender — a further answer lands in a human mailbox, not a loop', () => {
    expect(JSON.parse(req.init.body).replyTo).toEqual({ email: 'hello@frankbueltge.de' })
  })
})

describe('hookAuthorized', () => {
  const SECRET = 'a-long-random-shared-secret'

  it('accepts the right ?k=, refuses a wrong or absent one', () => {
    expect(hookAuthorized(`https://frankbueltge.de/api/brevo-hook?k=${SECRET}`, SECRET)).toBe(true)
    expect(hookAuthorized('https://frankbueltge.de/api/brevo-hook?k=wrong', SECRET)).toBe(false)
    expect(hookAuthorized('https://frankbueltge.de/api/brevo-hook', SECRET)).toBe(false)
  })

  it('an unset or short secret fails closed — never an open webhook', () => {
    expect(hookAuthorized('https://x/api/brevo-hook?k=', '')).toBe(false)
    expect(hookAuthorized('https://x/api/brevo-hook?k=short', 'short')).toBe(false)
    expect(hookAuthorized('https://x/api/brevo-hook?k=undefined', undefined)).toBe(false)
  })
})

describe('subscriberFromHook', () => {
  it('reads email and list ids in both of Brevo’s casings', () => {
    expect(subscriberFromHook({ email: 'a@example.org', list_id: [3] })).toEqual({ email: 'a@example.org', listIds: [3] })
    expect(subscriberFromHook({ email: 'a@example.org', listId: 3 })).toEqual({ email: 'a@example.org', listIds: [3] })
  })

  it('an unreadable payload degrades to nulls instead of throwing — a subscription is still a subscription', () => {
    expect(subscriberFromHook('not json-shaped')).toEqual({ email: null, listIds: [] })
    expect(subscriberFromHook({ email: 42, list_id: 'three' })).toEqual({ email: null, listIds: [] })
  })
})

describe('brevoId', () => {
  it('parses a positive integer id from env', () => {
    expect(brevoId('42')).toBe(42)
  })

  it('a typo lands in standby semantics, not in a runtime error a visitor gets blamed for', () => {
    expect(brevoId('list-42')).toBeNull()
    expect(brevoId('')).toBeNull()
    expect(brevoId('0')).toBeNull()
    expect(brevoId(undefined)).toBeNull()
  })
})
