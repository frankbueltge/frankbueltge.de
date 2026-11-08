// src/lib/bluesky/post.ts — what the Bluesky poster says, and which pick is next (2026-11-08).
//
// The poster (scripts/bluesky/post-selected.ts) announces the selected works on Bluesky, one pick
// per run, in the shelf's order (Frank's decision of 2026-11-08, wording private; the switch is
// src/config/bluesky.ts). Everything that decides what a post says lives here, without a network,
// so the tests can hold it:
//
//   · the text: only words the site has already published — the head the shelf reads from the
//     pick's record (title, maker, date) and the pick's own sentence. Nothing is written for
//     Bluesky, so nothing can say more than the site does;
//   · the next pick: the first in the shelf's order whose address the account has not posted;
//   · the link card: the page's own og tags, which Bluesky's card service would read as well;
//   · the self-label that tells Bluesky and its readers the account is automated.

/** Bluesky's limit for a post's text, in graphemes. */
export const POST_LIMIT = 300
/** The largest image a link card may carry, in bytes. */
export const BLOB_LIMIT = 1_000_000

/** The fields of a shelf card (src/lib/ops/selected-works.ts, ShelfCard) a post is made of. */
export interface PickForPost {
  title: string
  maker: string
  /** when, in words, as the card prints it: "14 October 2026", "read every day since …" */
  when: string
  sentence: string
  href: string
}

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
const segments = (text: string): string[] => Array.from(segmenter.segment(text), (s) => s.segment)

/** The length Bluesky counts: graphemes, not code units. */
export const graphemes = (text: string): number => segments(text).length

/**
 * The key a pick and a post are matched by: the address made absolute, without query, fragment or
 * trailing slash, so `/ducking`, `/ducking/` and `https://frankbueltge.de/ducking/` are one.
 */
export function addressKey(href: string, origin: string): string {
  const url = new URL(href, origin)
  return `${url.protocol}//${url.host.toLowerCase()}${url.pathname.replace(/\/+$/, '')}`
}

/** A sentence ends with its stop; the lab's register lines carry none. */
const closed = (sentence: string): string => {
  const s = sentence.trim()
  return /[.!?…]$/.test(s) ? s : `${s}.`
}

/** The text cut to at most `limit` graphemes, at a word where one is near, closed by an ellipsis. */
export function clip(text: string, limit: number): string {
  if (graphemes(text) <= limit) return text
  if (limit < 1) return ''
  let cut = segments(text).slice(0, limit - 1).join('')
  const space = cut.lastIndexOf(' ')
  if (space > cut.length / 2) cut = cut.slice(0, space)
  return `${cut.replace(/[\s,;:—–-]+$/u, '')}…`
}

/** The post's text: the head the shelf prints, a blank line, and the pick's sentence. */
export function composeText(pick: PickForPost): string {
  const head = `${pick.title} — ${pick.maker}, ${pick.when}`
  const room = POST_LIMIT - graphemes(head) - 2
  if (room < 1) return clip(head, POST_LIMIT)
  return `${head}\n\n${clip(closed(pick.sentence), room)}`
}

/** The first pick, in the shelf's order, that the account has not posted and the house has not set aside. */
export function nextPick<T extends { href: string }>(
  picks: readonly T[],
  posted: ReadonlySet<string>,
  skip: readonly string[],
  origin: string,
): T | null {
  const aside = new Set(skip.map((s) => addressKey(s, origin)))
  return (
    picks.find((pick) => {
      const key = addressKey(pick.href, origin)
      return !posted.has(key) && !aside.has(key)
    }) ?? null
  )
}

interface LinkFeature {
  $type?: string
  uri?: unknown
}
interface PostValue {
  embed?: { external?: { uri?: unknown }; media?: { external?: { uri?: unknown } } }
  facets?: { features?: LinkFeature[] }[]
}

/**
 * Every address the account's posts point at, as keys: a link card's address, and every link in
 * a post's text, so a pick posted by hand is not posted again by the workflow.
 */
export function postedAddresses(values: readonly unknown[], origin: string): Set<string> {
  const keys = new Set<string>()
  for (const value of values as (PostValue | null)[]) {
    const uris: unknown[] = [
      value?.embed?.external?.uri,
      value?.embed?.media?.external?.uri,
      ...(value?.facets ?? []).flatMap((f) =>
        (f.features ?? []).filter((x) => x.$type === 'app.bsky.richtext.facet#link').map((x) => x.uri),
      ),
    ]
    for (const uri of uris) {
      // a post's links are absolute; anything else is not an address, and never one of ours
      if (typeof uri !== 'string' || !URL.canParse(uri)) continue
      keys.add(addressKey(uri, origin))
    }
  }
  return keys
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  ndash: '–',
  mdash: '—',
  hellip: '…',
}

/** HTML's character references: the named ones a meta tag tends to use, and every numeric one. */
export const decodeEntities = (text: string): string =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, ref: string) => {
    if (ref[0] !== '#') return ENTITIES[ref.toLowerCase()] ?? whole
    const code = ref[1].toLowerCase() === 'x' ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10)
    return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : whole
  })

/** What a link card shows, as the page states it in its own tags. */
export interface PageCard {
  title?: string
  description?: string
  /** absolute */
  image?: string
}

/** The page's og tags, falling back to its title and description; the image made absolute. */
export function readPageCard(html: string, pageUrl: string): PageCard {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []
  const meta = (name: string): string | undefined => {
    for (const tag of tags) {
      const key = /\b(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]
      if (key?.toLowerCase() !== name) continue
      const content = /\bcontent\s*=\s*"([^"]*)"/i.exec(tag)?.[1] ?? /\bcontent\s*=\s*'([^']*)'/i.exec(tag)?.[1]
      if (content !== undefined) return decodeEntities(content).trim()
    }
    return undefined
  }
  const titleTag = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]
  const image = meta('og:image')
  return {
    title: meta('og:title') ?? (titleTag ? decodeEntities(titleTag).trim() : undefined),
    description: meta('og:description') ?? meta('description'),
    image: image ? new URL(image, pageUrl).href : undefined,
  }
}

/** The account's data server, as its DID document names it; null where it names none. */
export function pdsOf(didDoc: unknown): string | null {
  const services = (didDoc as { service?: { id?: string; type?: string; serviceEndpoint?: unknown }[] } | null)?.service
  const pds = (services ?? []).find((s) => s.id?.endsWith('#atproto_pds') && s.type === 'AtprotoPersonalDataServer')
  return typeof pds?.serviceEndpoint === 'string' ? pds.serviceEndpoint.replace(/\/+$/, '') : null
}

/** The self-label that marks an account as automated. */
export const BOT_LABEL = 'bot'

export type ProfileRecord = Record<string, unknown> & {
  labels?: { $type?: string; values?: { val: string }[] }
}

/**
 * The profile with the bot self-label added and every other field kept as it was (name, bio,
 * avatar, banner); null when the label is already there and nothing needs writing. A missing
 * profile becomes one that carries the label alone.
 */
export function withBotLabel(profile: ProfileRecord | null): ProfileRecord | null {
  const base: ProfileRecord = profile ?? { $type: 'app.bsky.actor.profile' }
  const values = base.labels?.values ?? []
  if (values.some((v) => v.val === BOT_LABEL)) return null
  return {
    ...base,
    labels: { ...base.labels, $type: 'com.atproto.label.defs#selfLabels', values: [...values, { val: BOT_LABEL }] },
  }
}

/** A post with a link card: the record the account's repository receives. */
export function postRecord(
  text: string,
  card: { uri: string; title: string; description: string; thumb?: unknown },
  createdAt: string,
) {
  return {
    $type: 'app.bsky.feed.post',
    text,
    createdAt,
    langs: ['en'],
    embed: {
      $type: 'app.bsky.embed.external',
      external: {
        uri: card.uri,
        title: card.title,
        description: card.description,
        ...(card.thumb ? { thumb: card.thumb } : {}),
      },
    },
  }
}
