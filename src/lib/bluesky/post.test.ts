import { describe, expect, it } from 'vitest'
import { BLUESKY } from '@/config/bluesky'
import { readShelf } from '@/lib/ops/selected-works'
import {
  addressKey,
  BOT_LABEL,
  clip,
  composeText,
  decodeEntities,
  graphemes,
  nextPick,
  pdsOf,
  POST_LIMIT,
  postedAddresses,
  postRecord,
  readPageCard,
  withBotLabel,
} from './post'

const ORIGIN = 'https://frankbueltge.de'

// Every pick below is invented for the test; the last block reads the real shelf.
const pick = (over: Partial<Parameters<typeof composeText>[0]> = {}) => ({
  title: 'An Invented Work',
  maker: 'The Studio',
  when: '14 October 2026',
  sentence: 'A sentence the shelf already prints, about a record nobody reads whole.',
  href: '/studio/werke-html/an-invented-work/',
  ...over,
})

describe('the text of a post', () => {
  it('is the head the shelf prints, a blank line and the pick’s own sentence', () => {
    expect(composeText(pick())).toBe(
      'An Invented Work — The Studio, 14 October 2026\n\nA sentence the shelf already prints, about a record nobody reads whole.',
    )
  })

  it('closes a register line that carries no stop, and leaves a closed one alone', () => {
    expect(composeText(pick({ sentence: 'A desk for the world’s attention' }))).toMatch(/attention\.$/)
    expect(composeText(pick({ sentence: 'Is it heard?' }))).toMatch(/heard\?$/)
  })

  it('never exceeds Bluesky’s limit, and cuts a long sentence at a word with an ellipsis', () => {
    const long = pick({ sentence: 'word '.repeat(200).trim() })
    const text = composeText(long)
    expect(graphemes(text)).toBeLessThanOrEqual(POST_LIMIT)
    expect(text.endsWith('word…')).toBe(true)
  })

  it('counts graphemes, as Bluesky does, not code units', () => {
    expect(graphemes('👩‍👩‍👧')).toBe(1)
    expect(graphemes('é')).toBe(1) // e and a combining accent
    const flags = pick({ sentence: '🇩🇪'.repeat(400) })
    expect(graphemes(composeText(flags))).toBeLessThanOrEqual(POST_LIMIT)
  })

  it('clips only what is too long', () => {
    expect(clip('short', 10)).toBe('short')
    expect(clip('far too long for this', 0)).toBe('')
    expect(graphemes(clip('far too long for this', 8))).toBeLessThanOrEqual(8)
  })
})

describe('which pick is next', () => {
  it('reads one address in all its spellings', () => {
    const key = addressKey('/ducking', ORIGIN)
    expect(addressKey('/ducking/', ORIGIN)).toBe(key)
    expect(addressKey('https://frankbueltge.de/ducking/?ref=bsky#top', ORIGIN)).toBe(key)
    expect(addressKey('https://FrankBueltge.de/ducking', ORIGIN)).toBe(key)
    expect(addressKey('/balance', ORIGIN)).not.toBe(key)
  })

  it('is the first in the shelf’s order that the account has not posted', () => {
    const picks = [pick({ href: '/a/' }), pick({ href: '/b' }), pick({ href: '/c/' })]
    expect(nextPick(picks, new Set(), [], ORIGIN)?.href).toBe('/a/')
    expect(nextPick(picks, new Set([addressKey('/a', ORIGIN)]), [], ORIGIN)?.href).toBe('/b')
  })

  it('passes over what the house set aside, by path or by URL', () => {
    const picks = [pick({ href: '/a/' }), pick({ href: '/b/' }), pick({ href: '/c/' })]
    expect(nextPick(picks, new Set(), ['/a', 'https://frankbueltge.de/b/'], ORIGIN)?.href).toBe('/c/')
  })

  it('is nothing once every pick is out', () => {
    const picks = [pick({ href: '/a/' })]
    expect(nextPick(picks, new Set([addressKey('/a/', ORIGIN)]), [], ORIGIN)).toBeNull()
  })

  it('finds the addresses in the account’s posts: link cards, cards beside a quote, links in the text', () => {
    const keys = postedAddresses(
      [
        { embed: { $type: 'app.bsky.embed.external', external: { uri: 'https://frankbueltge.de/a/' } } },
        { embed: { $type: 'app.bsky.embed.recordWithMedia', media: { external: { uri: 'https://frankbueltge.de/b' } } } },
        {
          facets: [
            { features: [{ $type: 'app.bsky.richtext.facet#link', uri: 'https://frankbueltge.de/c/' }] },
            { features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'dataart' }] },
          ],
        },
        { embed: { external: { uri: 'not a url at all' } } },
        null,
        { text: 'a post without a link' },
      ],
      ORIGIN,
    )
    expect([...keys].sort()).toEqual(['/a', '/b', '/c'].map((p) => addressKey(p, ORIGIN)))
  })
})

describe('the link card, read from the page', () => {
  it('takes the page’s og tags, in either attribute order, and makes the image absolute', () => {
    const html = `<html><head><title>Fallback</title>
      <meta property="og:title" content="An Invented Work">
      <meta content="What it is, &amp; what it isn&#39;t &#x2014; told plainly." property="og:description">
      <meta property="og:image" content="/og/an-invented-work.png"></head></html>`
    expect(readPageCard(html, 'https://frankbueltge.de/studio/werke-html/an-invented-work/')).toEqual({
      title: 'An Invented Work',
      description: 'What it is, & what it isn\'t — told plainly.',
      image: 'https://frankbueltge.de/og/an-invented-work.png',
    })
  })

  it('falls back to the title and the plain description where the og tags are missing', () => {
    const html = `<title>A Bare Page</title><meta name="description" content='Said in single quotes.'>`
    expect(readPageCard(html, ORIGIN)).toEqual({ title: 'A Bare Page', description: 'Said in single quotes.', image: undefined })
  })

  it('decodes the references a tag may carry, and leaves unknown ones as they are', () => {
    expect(decodeEntities('the world&rsquo;s &ldquo;crowd&rdquo; &hellip; &#8211; &unknown;')).toBe('the world’s “crowd” … – &unknown;')
  })
})

describe('the account', () => {
  it('finds its data server in its DID document', () => {
    const doc = {
      id: 'did:plc:invented',
      service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.example/' }],
    }
    expect(pdsOf(doc)).toBe('https://pds.example')
    expect(pdsOf({ service: [{ id: '#other', type: 'Other', serviceEndpoint: 'https://x.example' }] })).toBeNull()
    expect(pdsOf(null)).toBeNull()
  })

  it('gains the bot label with every other field of its profile kept', () => {
    const avatar = { $type: 'blob', ref: { $link: 'bafkreiinvented' }, mimeType: 'image/png', size: 1234 }
    const profile = {
      $type: 'app.bsky.actor.profile',
      displayName: 'Invented works',
      description: 'An invented bio.',
      avatar,
      labels: { $type: 'com.atproto.label.defs#selfLabels', values: [{ val: '!no-unauthenticated' }] },
    }
    const next = withBotLabel(profile)
    expect(next).toEqual({
      ...profile,
      labels: { $type: 'com.atproto.label.defs#selfLabels', values: [{ val: '!no-unauthenticated' }, { val: BOT_LABEL }] },
    })
    expect(next?.avatar).toBe(avatar)
    expect(profile.labels.values).toHaveLength(1) // the record read is not changed in place
  })

  it('writes nothing when the label is there, and a profile of its own when none exists', () => {
    expect(withBotLabel({ $type: 'app.bsky.actor.profile', labels: { values: [{ val: BOT_LABEL }] } })).toBeNull()
    expect(withBotLabel(null)).toEqual({
      $type: 'app.bsky.actor.profile',
      labels: { $type: 'com.atproto.label.defs#selfLabels', values: [{ val: BOT_LABEL }] },
    })
  })

  it('posts a link card, with a picture only when there is one', () => {
    const card = { uri: 'https://frankbueltge.de/a/', title: 'A', description: 'B' }
    const bare = postRecord('text', card, '2026-11-08T12:00:00.000Z')
    expect(bare).toEqual({
      $type: 'app.bsky.feed.post',
      text: 'text',
      createdAt: '2026-11-08T12:00:00.000Z',
      langs: ['en'],
      embed: { $type: 'app.bsky.embed.external', external: card },
    })
    const thumb = { $type: 'blob', ref: { $link: 'bafkreiinvented' }, mimeType: 'image/png', size: 1 }
    expect(postRecord('text', { ...card, thumb }, 'now').embed.external.thumb).toBe(thumb)
  })
})

describe('the switch and the real shelf', () => {
  it('names a handle or nothing, and sets aside only addresses', () => {
    if (BLUESKY.handle) expect(BLUESKY.handle).toMatch(/^(?!@)([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i)
    for (const entry of BLUESKY.skip) expect(() => addressKey(entry, ORIGIN)).not.toThrow()
  })

  it('fits every pick on the shelf into one post that names it', () => {
    const shelf = readShelf()
    expect(shelf.length).toBeGreaterThan(0)
    for (const card of shelf) {
      const text = composeText(card)
      expect(graphemes(text), card.key).toBeLessThanOrEqual(POST_LIMIT)
      expect(text.startsWith(`${card.title} — ${card.maker}`), card.key).toBe(true)
    }
  })
})
