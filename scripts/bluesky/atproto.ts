// scripts/bluesky/atproto.ts — the few calls the selected-works poster makes to Bluesky (2026-11-08).
//
// Plain fetch against the AT Protocol's XRPC endpoints, no client library: a handle resolved to
// its account and data server, a session opened with an app password, the account's own posts
// listed, a picture uploaded, a record read, written or created. Nothing here decides anything;
// src/lib/bluesky/post.ts does, and scripts/bluesky/post-selected.ts runs it.
//
// No secret is ever printed. An error carries the method, the HTTP status and the server's own
// message, which never echoes the password.

import { pdsOf } from '../../src/lib/bluesky/post.ts'

/** Where Bluesky resolves handles for anyone, without an account. */
export const PUBLIC_API = 'https://public.api.bsky.app'
/** Bluesky's own entryway: where its accounts sign in when their data server is unknown. */
export const ENTRYWAY = 'https://bsky.social'
export const USER_AGENT = 'frankbueltge.de selected-works poster (+https://frankbueltge.de/dossier/)'

interface Call {
  params?: Record<string, string>
  /** a JSON body: the call is a procedure (POST) */
  body?: unknown
  /** raw bytes with their media type: an upload (POST) */
  bytes?: { data: Uint8Array; type: string }
  token?: string
}

export async function xrpc<T>(service: string, method: string, call: Call = {}): Promise<T> {
  const url = new URL(`/xrpc/${method}`, service)
  for (const [key, value] of Object.entries(call.params ?? {})) url.searchParams.set(key, value)
  const headers: Record<string, string> = { 'user-agent': USER_AGENT }
  if (call.token) headers.authorization = `Bearer ${call.token}`
  let body: Uint8Array | string | undefined
  if (call.bytes) {
    headers['content-type'] = call.bytes.type
    body = call.bytes.data
  } else if (call.body !== undefined) {
    headers['content-type'] = 'application/json'
    body = JSON.stringify(call.body)
  }
  const res = await fetch(url, { method: body === undefined ? 'GET' : 'POST', headers, body })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method}: HTTP ${res.status} ${text.slice(0, 300)}`)
  return (text ? JSON.parse(text) : {}) as T
}

export interface Account {
  did: string
  /** the account's data server, where its repository lives */
  pds: string
}

/** A handle's account and data server, read publicly: the handle's DID, then the DID's document. */
export async function resolveAccount(handle: string): Promise<Account> {
  const { did } = await xrpc<{ did: string }>(PUBLIC_API, 'com.atproto.identity.resolveHandle', { params: { handle } })
  const docUrl = did.startsWith('did:plc:')
    ? `https://plc.directory/${did}`
    : did.startsWith('did:web:')
      ? `https://${did.slice('did:web:'.length)}/.well-known/did.json`
      : null
  if (!docUrl) throw new Error(`resolveAccount: no way to read ${did}`)
  const res = await fetch(docUrl, { headers: { 'user-agent': USER_AGENT } })
  if (!res.ok) throw new Error(`resolveAccount: ${docUrl} answered HTTP ${res.status}`)
  return { did, pds: pdsOf(await res.json()) ?? ENTRYWAY }
}

export interface Session extends Account {
  accessJwt: string
}

/** A session opened with an app password, on the account's own data server. */
export async function openSession(account: Account, handle: string, appPassword: string): Promise<Session> {
  const session = await xrpc<{ accessJwt: string; did: string; didDoc?: unknown }>(account.pds, 'com.atproto.server.createSession', {
    body: { identifier: handle, password: appPassword },
  })
  return { did: session.did, pds: pdsOf(session.didDoc) ?? account.pds, accessJwt: session.accessJwt }
}

/** Every post in the account's repository, as stored: the record values, newest first. */
export async function listPosts(account: Account): Promise<unknown[]> {
  const values: unknown[] = []
  let cursor: string | undefined
  do {
    const page = await xrpc<{ records: { value: unknown }[]; cursor?: string }>(account.pds, 'com.atproto.repo.listRecords', {
      params: { repo: account.did, collection: 'app.bsky.feed.post', limit: '100', ...(cursor ? { cursor } : {}) },
    })
    values.push(...page.records.map((r) => r.value))
    cursor = page.records.length > 0 ? page.cursor : undefined
  } while (cursor)
  return values
}

/** A record of the account's repository with the version it was read at, or null where none is stored. */
export async function getRecord<T>(account: Account, collection: string, rkey: string): Promise<{ value: T; cid: string } | null> {
  try {
    return await xrpc<{ value: T; cid: string }>(account.pds, 'com.atproto.repo.getRecord', {
      params: { repo: account.did, collection, rkey },
    })
  } catch (error) {
    if (/RecordNotFound/.test(String(error))) return null
    throw error
  }
}

/** Writes a record in place; with `swapCid`, only if nobody changed it since it was read. */
export async function putRecord(session: Session, collection: string, rkey: string, record: unknown, swapCid?: string): Promise<void> {
  await xrpc(session.pds, 'com.atproto.repo.putRecord', {
    token: session.accessJwt,
    body: { repo: session.did, collection, rkey, record, ...(swapCid ? { swapRecord: swapCid } : {}) },
  })
}

export async function uploadBlob(session: Session, data: Uint8Array, type: string): Promise<unknown> {
  const { blob } = await xrpc<{ blob: unknown }>(session.pds, 'com.atproto.repo.uploadBlob', {
    token: session.accessJwt,
    bytes: { data, type },
  })
  return blob
}

export async function createRecord(session: Session, collection: string, record: unknown): Promise<{ uri: string; cid: string }> {
  return xrpc(session.pds, 'com.atproto.repo.createRecord', {
    token: session.accessJwt,
    body: { repo: session.did, collection, record },
  })
}
