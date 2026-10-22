import { describe, expect, it } from 'vitest'
import {
  OWNER_COOKIE,
  base64url,
  dayHash,
  dayOf,
  fromBase64url,
  issueOwnerCookie,
  ownerClearCookie,
  ownerKeyConfigured,
  ownerKeyMatches,
  ownerSetCookie,
  readCookie,
  verifyOwnerCookie,
} from './crypto'

const KEY = 'a-test-owner-key-that-is-long-enough-0123456789'
const NOW = 1_792_000_000

describe('the owner cookie', () => {
  it('verifies a cookie issued with the same secret', async () => {
    const value = await issueOwnerCookie(KEY, NOW)
    expect(await verifyOwnerCookie(value, KEY, NOW)).toBe(true)
    expect(await verifyOwnerCookie(value, KEY, NOW + 364 * 86400)).toBe(true)
  })

  it('expires after a year', async () => {
    const value = await issueOwnerCookie(KEY, NOW)
    expect(await verifyOwnerCookie(value, KEY, NOW + 365 * 86400)).toBe(false)
  })

  it('refuses a cookie issued in the future beyond the skew', async () => {
    const value = await issueOwnerCookie(KEY, NOW + 3600)
    expect(await verifyOwnerCookie(value, KEY, NOW)).toBe(false)
  })

  it('refuses a cookie signed with another secret', async () => {
    const value = await issueOwnerCookie(`${KEY}-other`, NOW)
    expect(await verifyOwnerCookie(value, KEY, NOW)).toBe(false)
  })

  it('refuses any tampering with payload or signature', async () => {
    const value = await issueOwnerCookie(KEY, NOW)
    const [payload, sig] = value.split('.') as [string, string]
    const claims = JSON.parse(new TextDecoder().decode(fromBase64url(payload)!))
    const extended = base64url(new TextEncoder().encode(JSON.stringify({ ...claims, exp: claims.exp + 10 * 365 * 86400 })))
    expect(await verifyOwnerCookie(`${extended}.${sig}`, KEY, NOW)).toBe(false)
    const flipped = sig.slice(0, -1) + (sig.endsWith('A') ? 'B' : 'A')
    expect(await verifyOwnerCookie(`${payload}.${flipped}`, KEY, NOW)).toBe(false)
    for (const bad of ['', '.', payload, `${payload}.`, `.${sig}`, `${payload}.${sig}.x`, 'x'.repeat(2000)]) {
      expect(await verifyOwnerCookie(bad, KEY, NOW)).toBe(false)
    }
  })

  it('is off without a secret, and with a short one', async () => {
    const value = await issueOwnerCookie(KEY, NOW)
    expect(await verifyOwnerCookie(value, undefined, NOW)).toBe(false)
    expect(await verifyOwnerCookie(value, 'short', NOW)).toBe(false)
    expect(ownerKeyConfigured('short')).toBe(false)
    expect(ownerKeyConfigured(KEY)).toBe(true)
  })

  it('carries no secret and no identity', async () => {
    const value = await issueOwnerCookie(KEY, NOW)
    expect(value).not.toContain(KEY)
    const claims = JSON.parse(new TextDecoder().decode(fromBase64url(value.split('.')[0]!)!))
    expect(Object.keys(claims).sort()).toEqual(['exp', 'iat', 'v'])
  })

  it('is set HttpOnly, Secure, SameSite=Strict, host-bound, for a year', () => {
    const header = ownerSetCookie('abc.def')
    expect(header.startsWith(`${OWNER_COOKIE}=abc.def;`)).toBe(true)
    expect(OWNER_COOKIE.startsWith('__Host-')).toBe(true)
    for (const part of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', `Max-Age=${365 * 86400}`]) expect(header).toContain(part)
    expect(header).not.toMatch(/Domain=/i)
    expect(ownerClearCookie()).toContain('Max-Age=0')
  })

  it('reads one cookie from a header', () => {
    expect(readCookie(`a=1; ${OWNER_COOKIE}=x.y; b=2`, OWNER_COOKIE)).toBe('x.y')
    expect(readCookie('a=1', OWNER_COOKIE)).toBeNull()
    expect(readCookie(null, OWNER_COOKIE)).toBeNull()
  })
})

describe('the owner key', () => {
  it('matches only the configured key', async () => {
    expect(await ownerKeyMatches(KEY, KEY)).toBe(true)
    expect(await ownerKeyMatches(`${KEY}x`, KEY)).toBe(false)
    expect(await ownerKeyMatches(KEY.slice(1), KEY)).toBe(false)
    expect(await ownerKeyMatches('', KEY)).toBe(false)
    expect(await ownerKeyMatches(undefined, KEY)).toBe(false)
    expect(await ownerKeyMatches(KEY, undefined)).toBe(false)
  })
})

describe('the day hash', () => {
  it('is stable within a salt and changes with it, and holds no address', async () => {
    const a = await dayHash('salt-1', '203.0.113.5', 'UA')
    expect(a).toMatch(/^[0-9a-f]{32}$/)
    expect(await dayHash('salt-1', '203.0.113.5', 'UA')).toBe(a)
    expect(await dayHash('salt-2', '203.0.113.5', 'UA')).not.toBe(a)
    expect(await dayHash('salt-1', '203.0.113.6', 'UA')).not.toBe(a)
    expect(a).not.toContain('203')
  })

  it('names the UTC day', () => {
    expect(dayOf(new Date('2026-10-17T23:59:59Z'))).toBe('2026-10-17')
    expect(dayOf(new Date('2026-10-18T00:00:00Z'))).toBe('2026-10-18')
  })
})
