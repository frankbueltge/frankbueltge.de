import { describe, expect, it } from 'vitest'
import { getTrendingDays } from './data'
import { JACCARD_MIN, MEMORY_DAYS, jaccard, labelTokens, recallTopic, sameTopic } from './memory'

const tokens = (label: string) => [...labelTokens(label)]

describe('a label as comparable words', () => {
  // Every expectation in this block is what the pipeline's own tokens() returns for the same
  // label (pipelines/trending/src/trending/normalize.py), run on 2026-11-14.
  it('folds accents and case, splits underscores and hyphens, drops function words', () => {
    expect(tokens('Páez of the State-of-the_Union')).toEqual(['paez', 'state', 'union'])
    expect(tokens('Death of Gloria Steinem')).toEqual(['death', 'gloria', 'steinem'])
    expect(tokens('iPhone 18 Pro')).toEqual(['iphone', '18', 'pro'])
  })

  it('splits a spaceless CamelCase tag, and only a spaceless one', () => {
    expect(tokens('TextureTuesday')).toEqual(tokens('Texture Tuesday'))
    expect(tokens('MakeABookAboutZoos')).toEqual(['book', 'zoos'])
    expect(tokens('iPhone 18 Pro')).not.toContain('phone')
  })

  it('folds case the way casefold does, where toLowerCase alone would not', () => {
    expect(tokens('Fußball heute')).toEqual(['fussball'])
    expect(tokens('FUSSBALL HEUTE')).toEqual(['fussball'])
    // A set, so the capitals and the accented lower case fold to one word, final sigma included.
    expect(tokens('ΟΔΥΣΣΕΑΣ Οδυσσέας')).toEqual(['οδυσσεασ'])
  })

  it('strips only the marks the pipeline strips', () => {
    // Devanagari vowel signs are marks of combining class zero: the pipeline keeps them, they
    // end a word, and the single letters left over are dropped. Stripping every mark instead
    // would glue the letters into words the pipeline never compared.
    expect(tokens('हिंदी')).toEqual([])
    expect(tokens('क्या हाल')).toEqual(['कय'])
    expect(tokens('ภาษาไทย')).toEqual(['ภาษาไทย'])
    expect(tokens('ミリシタextreme生配信')).toEqual(['ミリシタextreme生配信'])
  })

  it('keeps no one-character word and nothing of an empty label', () => {
    expect(tokens('A b C')).toEqual([])
    expect(tokens('')).toEqual([])
    expect(tokens('AI')).toEqual(['ai'])
  })
})

describe('the same topic on another morning', () => {
  it('measures shared words over all words', () => {
    expect(jaccard(new Set(['a', 'b']), new Set(['b', 'c']))).toBeCloseTo(1 / 3)
    expect(jaccard(new Set(['a', 'b']), new Set(['a', 'b']))).toBe(1)
    expect(jaccard(new Set(), new Set(['a']))).toBe(0)
  })

  it('accepts the same id whatever the label, and another id when enough words are shared', () => {
    expect(sameTopic({ id: 'x', label: 'one thing' }, { id: 'x', label: 'another matter entirely' })).toBe(true)
    // The case that the id rule alone lost: the second morning is named by a different source.
    expect(
      sameTopic({ id: 'death-of-gloria-steinem', label: 'Death of Gloria Steinem' }, { id: 'gloria-steinem', label: 'gloria steinem' }),
    ).toBe(true)
    expect(sameTopic({ id: 'a', label: 'Google Gemini' }, { id: 'b', label: 'Google Maps' })).toBe(false)
  })

  it('takes its threshold and its reach from the pipeline, not from a copy', async () => {
    const rules = (await import('../../../pipelines/trending/src/trending/data/rules.json')).default
    expect(JACCARD_MIN).toBe(rules.jaccard_min)
    expect(MEMORY_DAYS).toBe(rules.memory_days)
  })
})

describe('recalling a topic from the archive', () => {
  const archive = [
    { date: '2026-09-01', topics: [{ id: 'gloria-steinem', label: 'gloria steinem' }] },
    { date: '2026-09-02', topics: [{ id: 'something-else', label: 'something else' }] },
    { date: '2026-09-03', topics: [{ id: 'gloria-steinem', label: 'gloria steinem' }] },
    { date: '2026-09-04', topics: [{ id: 'steinem-gloria', label: 'Steinem, Gloria' }] },
  ]
  const topic = { id: 'death-of-gloria-steinem', label: 'Death of Gloria Steinem' }

  it('counts the unbroken run up to the day and remembers the earliest sighting', () => {
    expect(recallTopic(topic, archive, '2026-09-05')).toEqual({ firstSeen: '2026-09-01', daysHot: 3 })
  })

  it('reads only the days before the one it is asked about', () => {
    expect(recallTopic(topic, archive, '2026-09-03')).toEqual({ firstSeen: '2026-09-01', daysHot: 1 })
    expect(recallTopic(topic, archive, '2026-09-01')).toEqual({ firstSeen: '2026-09-01', daysHot: 1 })
  })

  it('lets a calendar day with no file break the run', () => {
    expect(recallTopic(topic, archive, '2026-09-06')).toEqual({ firstSeen: '2026-09-01', daysHot: 1 })
  })
})

describe('the two readings of the memory rule', () => {
  // The site draws "what stayed" by a second implementation of the rule the pipeline writes
  // `days_hot` by. Whether the two agree is not argued in a comment; it is counted here, topic
  // by topic, against what the pipeline committed.
  const days = getTrendingDays()
  const CHECKED_THROUGH = '2026-11-14'

  const compare = (subset: typeof days) => {
    let topics = 0
    const differing: string[] = []
    for (const day of subset) {
      for (const t of day.topics) {
        topics++
        const recall = recallTopic(t, days, day.date)
        if (recall.daysHot !== t.days_hot || recall.firstSeen !== t.first_seen) {
          differing.push(`${day.date} ${t.id}: site ${recall.daysHot}/${recall.firstSeen}, ledger ${t.days_hot}/${t.first_seen}`)
        }
      }
    }
    return { topics, differing }
  }

  it('reproduces first_seen and days_hot of every topic committed through 2026-11-14', () => {
    const { topics, differing } = compare(days.filter((d) => d.date <= CHECKED_THROUGH))
    expect(topics).toBeGreaterThan(900)
    expect(differing).toEqual([])
  })

  it('still agrees with the pipeline on the mornings committed since', () => {
    // These files arrive every night without a human in the loop, and this suite stands in
    // front of the deploy. One exotic label must not stop the site, so the newer mornings are
    // held to a rate instead of to zero: a real change of the rule in normalize.py or
    // converge.py moves far more than one topic in fifty, and then memory.ts has to follow.
    const { topics, differing } = compare(days.filter((d) => d.date > CHECKED_THROUGH))
    expect(differing.length, differing.slice(0, 5).join('\n')).toBeLessThanOrEqual(Math.ceil(topics / 50))
  })
})
