/** The validating twin of ./types.ts. Registered as content collections in src/content.config.ts,
 *  so `astro check` / `astro build` refuse a committed day that drifts from the contract; also
 *  used by ./data.ts to parse the files at build time. Tolerant where the contract says
 *  `|null` — an unavailable audience still has a shape, never a guessed number. */
import { z } from 'zod/v4'

const link = z.object({
  title: z.string(),
  url: z.string(),
  publisher: z.string().nullable().default(null),
})

const signal = z.object({
  source: z.string(),
  label: z.string(),
  url: z.string().nullable().default(null),
  rank: z.number(),
  magnitude: z.number().nullable().default(null),
  magnitude_unit: z.string(),
  geo: z.string().nullable().default(null),
  links: z.array(link).default([]),
  meta: z.record(z.string(), z.unknown()).default({}),
})

const sourceReport = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  licence: z.string(),
  status: z.enum(['ok', 'partial', 'unavailable']),
  note: z.string().default(''),
  retrieved_at: z.string().nullable().default(null),
  as_of: z.string().nullable().default(null),
  count: z.number().default(0),
})

const topicSignal = z.object({
  source: z.string(),
  geo: z.string().nullable().default(null),
  label: z.string(),
  url: z.string().nullable().default(null),
  rank: z.number(),
  magnitude: z.number().nullable().default(null),
  magnitude_unit: z.string(),
})

const topic = z.object({
  id: z.string(),
  label: z.string(),
  platforms: z.array(z.string()),
  platform_count: z.number(),
  score: z.number(),
  category: z.string().nullable().default(null),
  first_seen: z.string(),
  days_hot: z.number(),
  signals: z.array(topicSignal),
  links: z.array(link).default([]),
  wikipedia: z
    .object({ lang: z.string(), article: z.string(), views: z.number() })
    .nullable()
    .default(null),
})

/** The run's own grade of its record — the first loop around the pipeline. Optional because
 *  the first committed days predate the rubric; a missing grade is shown as none, never as ok. */
export const selfCheckSchema = z.object({
  rubric_version: z.string(),
  ok: z.boolean(),
  passed: z.number(),
  total: z.number(),
  checks: z.array(z.object({ id: z.string(), ok: z.boolean(), note: z.string() })),
})

export const trendingDaySchema = z.object({
  $contract: z.literal('trending-day/1'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  generated_at: z.string(),
  pipeline_version: z.string(),
  method_version: z.string(),
  sources: z.array(sourceReport),
  signals: z.record(z.string(), z.array(signal)),
  topics: z.array(topic),
  summary: z.object({
    topics_total: z.number(),
    converging: z.number(),
    sources_ok: z.number(),
    sources_total: z.number(),
    top_labels: z.array(z.string()),
  }),
  quality: selfCheckSchema.optional(),
})

const audienceStatus = z.enum(['ok', 'unavailable'])
const audienceClass = z.enum(['browser', 'search', 'ai-retrieval', 'ai-user-fetch', 'ai-training', 'other-bot'])

export const trendingAudienceSchema = z.object({
  $contract: z.literal('trending-audience/1'),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  generated_at: z.string(),
  edge: z.object({
    status: audienceStatus,
    note: z.string().default(''),
    source: z.string(),
    window: z.tuple([z.string(), z.string()]).nullable().default(null),
    sample_interval_avg: z.number().nullable().default(null),
    total: z.number().nullable().default(null),
    paths: z.record(z.string(), z.number()).nullable().default(null),
    classes: z.record(z.string(), z.number()).nullable().default(null),
    bots: z
      .array(
        z.object({
          name: z.string(),
          class: audienceClass,
          requests: z.number(),
          ok_2xx: z.number().default(0),
          other_status: z.number().default(0),
        }),
      )
      .default([]),
  }),
  umami: z.object({
    status: audienceStatus,
    note: z.string().default(''),
    source: z.string(),
    pageviews: z.number().nullable().default(null),
    visitors: z.number().nullable().default(null),
  }),
})
