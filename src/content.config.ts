import { defineCollection, z } from 'astro:content'
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

export const collections = { lab }
