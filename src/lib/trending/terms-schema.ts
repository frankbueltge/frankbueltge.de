/** The validating twin of ./terms-types.ts. Registered as a content collection in
 *  src/content.config.ts, so a committed terms file that drifts from `trending-terms/1` fails
 *  `astro check` and the build; also used by ./terms-data.ts to parse the files again at build
 *  time, so a reader can never receive a shape the contract does not promise.
 *
 *  Tolerant exactly where the contract says `| null`: a platform that returned nothing
 *  (`counts.<platform>: null`), a term with no Wikipedia article, a ratio with an empty prior
 *  window, a candidate without a sample. Nothing here supplies a default number — an absent
 *  count stays absent rather than becoming a zero the pipeline never measured. */
import { z } from 'zod/v4'

const termStatus = z.enum(['emerging', 'rising', 'established', 'fading', 'quiet'])

const count = z.object({
  d1: z.number(),
  d7: z.number(),
  d30: z.number(),
  capped: z.boolean().default(false),
})

const sourceReport = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  status: z.enum(['ok', 'partial', 'unavailable']),
  note: z.string().default(''),
  retrieved_at: z.string().nullable().default(null),
})

const receipt = z.object({
  platform: z.string(),
  title: z.string(),
  url: z.string(),
  date: z.string(),
})

const term = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  term: z.string(),
  aliases: z.array(z.string()).default([]),
  added: z.string(),
  origin: z.enum(['editorial', 'discovered']),
  note: z.string().default(''),
  wikipedia_article: z.string().nullable().default(null),
  counts: z.record(z.string(), count.nullable()),
  total: z.object({ d1: z.number(), d7: z.number(), d30: z.number() }),
  ratio: z.number().nullable().default(null),
  status: termStatus,
  first_seen: z.string(),
  receipts: z.array(receipt).default([]),
})

const candidate = z.object({
  ngram: z.string(),
  docs_recent: z.number(),
  docs_prior: z.number(),
  ratio: z.number().nullable().default(null),
  platforms: z.array(z.string()).default([]),
  sample: z.object({ title: z.string(), url: z.string(), date: z.string() }).nullable().default(null),
})

export const trendingTermsSchema = z.object({
  $contract: z.literal('trending-terms/1'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  generated_at: z.string(),
  pipeline_version: z.string(),
  method_version: z.string(),
  windows: z.object({ d1: z.number(), d7: z.number(), d30: z.number() }),
  sources: z.array(sourceReport),
  terms: z.array(term),
  candidates: z.array(candidate).default([]),
  summary: z.object({
    terms_total: z.number(),
    // partial on purpose: a run in which nothing is fading writes no `fading` key, and the
    // page reads a missing key as none rather than as a zero somebody typed.
    by_status: z.partialRecord(termStatus, z.number()).default({}),
    candidates_total: z.number(),
  }),
})
