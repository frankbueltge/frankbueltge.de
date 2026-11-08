// scripts/bluesky/post-selected.ts — announce the next selected work on Bluesky (2026-11-08).
//
//   npx tsx scripts/bluesky/post-selected.ts        (the workflow runs it daily)
//
// One post per run: the first pick of the shelf, in its order, whose address the account has not
// posted yet (Frank's decision of 2026-11-08, wording private). It posts only when
// src/config/bluesky.ts names the account AND the app password is in the environment
// (BLUESKY_APP_PASSWORD, a repository secret); otherwise, or with DRY_RUN=true, it rehearses:
// it prints what it would post and changes nothing anywhere.
//
// What it reads: the shelf from the records in this checkout (src/lib/ops/selected-works.ts), the
// account's own posts from its repository (so no ledger is kept here and no commit follows a post),
// and the pick's live page for the link card: og:title, og:description and og:image, the tags
// Bluesky's own card service reads. The maker's committed still stands in only where a page names
// no image; a page that cannot be read gets a card in the shelf's words and no picture.
//
// Before its first post the account is given the self-label that marks it as automated, every
// other field of its profile kept. The workflow: .github/workflows/bluesky-selected.yml.

import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { BLUESKY } from '../../src/config/bluesky.ts'
import {
  BLOB_LIMIT,
  composeText,
  graphemes,
  nextPick,
  type PageCard,
  POST_LIMIT,
  postedAddresses,
  postRecord,
  type ProfileRecord,
  readPageCard,
  withBotLabel,
} from '../../src/lib/bluesky/post.ts'
import { readShelf } from '../../src/lib/ops/selected-works.ts'
import { SITE } from '../../src/lib/site.ts'
import {
  type Account,
  createRecord,
  getRecord,
  listPosts,
  openSession,
  putRecord,
  resolveAccount,
  type Session,
  uploadBlob,
  USER_AGENT,
} from './atproto.ts'

const handle = BLUESKY.handle.trim().replace(/^@/, '')
const appPassword = process.env.BLUESKY_APP_PASSWORD?.trim() ?? ''
const rehearsal = process.env.DRY_RUN === 'true' || !handle || !appPassword

const stepSummary = process.env.GITHUB_STEP_SUMMARY
function say(line = ''): void {
  console.log(line)
  if (stepSummary) appendFileSync(stepSummary, `${line}\n`)
}

interface Picture {
  data: Uint8Array<ArrayBuffer>
  type: string
  from: string
}

const STILL_TYPES: Record<string, string> = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' }

/** A picture from the web for the card, or why there is none. */
async function fetchPicture(url: string): Promise<Picture | string> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': USER_AGENT } })
    if (!res.ok) return `${url} answered HTTP ${res.status}`
    const type = (res.headers.get('content-type') ?? '').split(';')[0].trim()
    if (!type.startsWith('image/')) return `${url} is not a picture (${type || 'no type'})`
    const data = new Uint8Array(await res.arrayBuffer())
    if (data.byteLength > BLOB_LIMIT) return `${url} has ${data.byteLength} bytes, more than a card may carry`
    return { data, type, from: url }
  } catch (error) {
    return `${url} could not be read (${String(error)})`
  }
}

/** The maker's committed still for the card, or why there is none. */
function stillPicture(src: string): Picture | string {
  const path = join(process.cwd(), 'public', src)
  const type = STILL_TYPES[extname(src).toLowerCase()]
  if (!type || !existsSync(path)) return `no still at public${src}`
  const data = new Uint8Array(readFileSync(path))
  if (data.byteLength > BLOB_LIMIT) return `the still has ${data.byteLength} bytes, more than a card may carry`
  return { data, type, from: `public${src}` }
}

/** Gives the account the bot self-label once; every other field of its profile stays as it is. */
async function labelAsBot(session: Session): Promise<boolean> {
  const current = await getRecord<ProfileRecord>(session, 'app.bsky.actor.profile', 'self')
  const next = withBotLabel(current?.value ?? null)
  if (!next) return false
  await putRecord(session, 'app.bsky.actor.profile', 'self', next, current?.cid)
  return true
}

const shelf = readShelf()
say('## Selected works on Bluesky')
say()
if (rehearsal) {
  const why = !handle
    ? 'src/config/bluesky.ts names no account yet'
    : !appPassword
      ? 'the secret BLUESKY_APP_PASSWORD is not set'
      : 'DRY_RUN is set'
  say(`Rehearsal, nothing is posted: ${why}.`)
} else {
  say(`Posting as @${handle}.`)
}
say(`Picks on the shelf: ${shelf.length}.`)

// The account's posts decide what is still to come; a rehearsal reads them too where it can.
let account: Account | null = null
if (handle) {
  try {
    account = await resolveAccount(handle)
  } catch (error) {
    if (!rehearsal) throw error
    say(`Could not read @${handle} (${String(error)}); counting no posts.`)
  }
}
const session: Session | null = !rehearsal && account ? await openSession(account, handle, appPassword) : null
const posted = account ? postedAddresses(await listPosts(session ?? account), SITE.url) : new Set<string>()
say(`Addresses the account has posted: ${posted.size}.`)

const pick = nextPick(shelf, posted, BLUESKY.skip, SITE.url)
if (!pick) {
  say('Every pick is out; nothing to post.')
  process.exit(0)
}

const address = new URL(pick.href, SITE.url).href
let pageUrl = address
let page: PageCard | null = null
try {
  const res = await fetch(address, { headers: { 'user-agent': USER_AGENT } })
  if (res.ok) {
    pageUrl = res.url || address
    page = readPageCard(await res.text(), pageUrl)
  } else {
    say(`Warning: ${address} answered HTTP ${res.status}; the card uses the shelf's words and no picture.`)
  }
} catch (error) {
  say(`Warning: ${address} could not be read (${String(error)}); the card uses the shelf's words and no picture.`)
}

let picture: Picture | null = null
if (page?.image) {
  const got = await fetchPicture(page.image)
  if (typeof got === 'string') say(`Warning: ${got}; the card goes without a picture.`)
  else picture = got
} else if (page && pick.still) {
  const got = stillPicture(pick.still.src)
  if (typeof got === 'string') say(`Note: ${got}; the card goes without a picture.`)
  else picture = got
}

const text = composeText(pick)
const card = { uri: pageUrl, title: page?.title ?? pick.title, description: page?.description ?? pick.sentence }

say()
say(`Next pick: ${pick.title} (${address})`)
say(`Text, ${graphemes(text)} of ${POST_LIMIT} graphemes:`)
for (const line of text.split('\n')) say(`> ${line}`)
say(`Card: ${card.title} | ${card.description}`)
say(`Card link: ${card.uri}`)
say(`Picture: ${picture ? `${picture.from} (${picture.type}, ${picture.data.byteLength} bytes)` : 'none'}`)

if (!session) process.exit(0)

if (await labelAsBot(session)) say('The account now carries the bot label.')
const thumb = picture ? await uploadBlob(session, picture.data, picture.type) : undefined
const created = await createRecord(session, 'app.bsky.feed.post', postRecord(text, { ...card, thumb }, new Date().toISOString()))
say(`Posted: https://bsky.app/profile/${handle}/post/${created.uri.split('/').pop()}`)
