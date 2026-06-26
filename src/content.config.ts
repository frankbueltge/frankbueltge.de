import { defineCollection } from 'astro:content'
import { z } from 'zod/v4'
import { glob } from 'astro/loaders'

// Lab = data-stories. Bilingual via folder structure: src/content/lab/<slug>/<lang>.mdx
// → entry.id === "<slug>/<lang>". (We deliberately do NOT use a `slug` frontmatter field —
// it is reserved by Astro and collides across locales.)
const lab = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lab' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    updated: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    embed: z.enum(['conversions']).optional(),
  }),
})

// Protokoll = kanonische Tages-JSONs der Pipeline (src/content/protokoll/<jahr>/<datum>.json).
// Die Prosa entsteht erst im Renderer — JSON ist das Archiv.
const protokoll = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/protokoll' }),
  schema: z.object({
    date: z.string(),
    generated_at: z.string(),
    schema_version: z.string(),
    pipeline_version: z.string(),
    entries: z.array(
      z.object({
        top_id: z.string(),
        status: z.enum(['ok', 'unavailable', 'implausible']),
        unit: z.string(),
        cadence: z.string(),
        source: z.object({ name: z.string(), url: z.string(), license: z.string() }),
        retrieved_at: z.string(),
        value: z.number().nullable().default(null),
        as_of: z.string().nullable().default(null),
        comparison: z
          .object({
            label: z.enum(['prev_day', 'prev_month', 'prev_year_day', 'prev_observation_day']),
            value: z.number(),
          })
          .nullable()
          .default(null),
        label: z.string().nullable().default(null),
        record: z.boolean().default(false),
        note: z.string().nullable().default(null),
        // Schema 2: TOP „Verluste" — Liste dokumentierter Großereignisse (sonst null).
        events: z
          .array(z.object({
            date: z.string(),
            label_de: z.string(),
            label_en: z.string(),
            deaths: z.number(),
          }))
          .nullable()
          .default(null),
      }),
    ),
  }),
})

export const collections = { lab, protokoll }
