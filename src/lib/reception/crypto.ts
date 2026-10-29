// src/lib/reception/crypto.ts — the owner cookie and the day hash (2026-10-17). Web Crypto only, so
// the same code runs in the Pages Functions and in the tests.
//
// THE OWNER COOKIE. The architect opens `/api/reception/owner?k=<RECEPTION_OWNER_KEY>` once per device
// and receives a cookie that is valid for a year: `<payload>.<signature>`, the payload a base64url
// JSON {v, iat, exp}, the signature an HMAC-SHA-256 over it with a key derived from the secret. The
// cookie carries no identity and no secret; it can be checked and it cannot be forged or extended.
// Changing the secret ends every cookie at once. The key itself is never logged, echoed or stored.
//
// THE DAY HASH. A visitor is counted, never identified (duty 3 of .claude/rules/runtime-and-works.md):
// one rating per work per visitor per day is enforced with an HMAC of IP and user agent under a
// random salt that exists for one UTC day and is then deleted, so yesterday's hashes cannot be
// recomputed from the running database. The hashes go with their day (./store.ts). D1's
// point-in-time recovery keeps earlier states, salts included, for up to 30 days, for the account
// owner only; the form and the privacy notice say so.

import { constantTimeEqual } from '../zentrale/auth'

export const OWNER_COOKIE = '__Host-reception-owner'
export const OWNER_COOKIE_DAYS = 365
const OWNER_COOKIE_VERSION = 1
/** A shorter secret is treated as no secret: the owner path stays in standby rather than run weak. */
export const MIN_OWNER_KEY_LENGTH = 32
/** Clock skew tolerated for a cookie issued "in the future". */
const SKEW_S = 300

const enc = new TextEncoder()

export function base64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64url(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) return null
  try {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4))
    return Uint8Array.from(bin, (c) => c.charCodeAt(0))
  } catch {
    return null
  }
}

export const hex = (bytes: Uint8Array): string => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')

async function hmac(keyBytes: Uint8Array<ArrayBuffer>, message: string): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(message)))
}

/** The cookie's signing key, derived from the secret so the secret itself never signs anything. */
const cookieKey = (secret: string): Promise<Uint8Array<ArrayBuffer>> => hmac(enc.encode(secret), 'reception-owner-cookie-v1')

export function ownerKeyConfigured(secret: string | undefined | null): secret is string {
  return typeof secret === 'string' && secret.length >= MIN_OWNER_KEY_LENGTH
}

/** Whether the key a request carries is the configured one. Both sides are hashed first, so the
 *  comparison runs over equal lengths and says nothing about the secret's. */
export async function ownerKeyMatches(given: unknown, secret: string | undefined | null): Promise<boolean> {
  if (!ownerKeyConfigured(secret) || typeof given !== 'string' || given.length === 0 || given.length > 512) return false
  const digest = async (s: string) => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s))))
  return constantTimeEqual(await digest(given), await digest(secret))
}

/** A fresh cookie value, valid for OWNER_COOKIE_DAYS from `nowS` (seconds since the epoch). */
export async function issueOwnerCookie(secret: string, nowS: number): Promise<string> {
  const payload = base64url(enc.encode(JSON.stringify({ v: OWNER_COOKIE_VERSION, iat: nowS, exp: nowS + OWNER_COOKIE_DAYS * 86400 })))
  const sig = base64url(await hmac(await cookieKey(secret), payload))
  return `${payload}.${sig}`
}

/** Whether a cookie value was issued with this secret and has not expired. Anything else — a
 *  missing secret, a malformed value, a changed byte, an expired or future-dated payload — is false. */
export async function verifyOwnerCookie(value: string | null | undefined, secret: string | undefined | null, nowS: number): Promise<boolean> {
  if (!ownerKeyConfigured(secret) || typeof value !== 'string' || value.length > 1024) return false
  const dot = value.indexOf('.')
  if (dot <= 0 || dot !== value.lastIndexOf('.')) return false
  const payload = value.slice(0, dot)
  const sig = value.slice(dot + 1)
  const expected = base64url(await hmac(await cookieKey(secret), payload))
  if (!constantTimeEqual(sig, expected)) return false
  const bytes = fromBase64url(payload)
  if (!bytes) return false
  let claims: unknown
  try {
    claims = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return false
  }
  if (!claims || typeof claims !== 'object') return false
  const { v, iat, exp } = claims as { v?: unknown; iat?: unknown; exp?: unknown }
  if (v !== OWNER_COOKIE_VERSION || typeof iat !== 'number' || typeof exp !== 'number') return false
  return iat <= nowS + SKEW_S && exp > nowS
}

/** One cookie's value from a Cookie header, or null. */
export function readCookie(header: string | null | undefined, name: string): string | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim()
  }
  return null
}

/** `__Host-` binds the cookie to this host, over HTTPS, for every path: it cannot be set by another
 *  subdomain or narrowed to one. Strict: it never travels with a request another site starts. */
export const ownerSetCookie = (value: string): string =>
  `${OWNER_COOKIE}=${value}; Max-Age=${OWNER_COOKIE_DAYS * 86400}; Path=/; HttpOnly; Secure; SameSite=Strict`

export const ownerClearCookie = (): string => `${OWNER_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`

/** The UTC day of a moment, `YYYY-MM-DD`. */
export const dayOf = (d: Date): string => d.toISOString().slice(0, 10)

/** Random bytes as hex — a day's salt, an entry's id. */
export function randomHex(bytes: number): string {
  return hex(crypto.getRandomValues(new Uint8Array(bytes)))
}

/** A visitor's hash for one day: the same person and browser give the same value until the salt is
 *  deleted at the end of the UTC day; nothing in it can be turned back into the address. */
export async function dayHash(salt: string, ip: string, userAgent: string): Promise<string> {
  return hex((await hmac(enc.encode(salt), `${ip}\n${userAgent}`)).slice(0, 16))
}
