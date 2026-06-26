import { getCollection, type CollectionEntry } from 'astro:content'
import type { Locale } from '@/lib/site'

export type LabItem = { entry: CollectionEntry<'lab'>; slug: string; lang: Locale }

/** entry.id is "<slug>/<lang>" (from the folder structure). */
function parse(entry: CollectionEntry<'lab'>): LabItem {
  const [slug, lang] = entry.id.split('/')
  return { entry, slug, lang: (lang as Locale) ?? 'en' }
}

export async function getLabPosts(locale: Locale): Promise<LabItem[]> {
  const all = await getCollection('lab')
  return all
    .map(parse)
    .filter((x) => x.lang === locale && !x.entry.data.draft)
    .sort((a, b) => new Date(b.entry.data.date).getTime() - new Date(a.entry.data.date).getTime())
}

export async function getLabEntry(slug: string, locale: Locale): Promise<LabItem | undefined> {
  const items = (await getCollection('lab')).map(parse)
  return items.find((x) => x.slug === slug && x.lang === locale) ?? items.find((x) => x.slug === slug)
}

export async function getLabSlugs(): Promise<string[]> {
  const all = await getCollection('lab')
  return [...new Set(all.map(parse).filter((x) => !x.entry.data.draft).map((x) => x.slug))]
}
