import { getCollection } from 'astro:content'
import type { BeifangRun } from './types'

export async function getBeifangRuns(): Promise<BeifangRun[]> {
  const all = await getCollection('beifang')
  return all.map((e) => e.data as BeifangRun).sort((a, b) => b.date.localeCompare(a.date))
}

export async function getLatestBeifang(): Promise<BeifangRun | undefined> {
  return (await getBeifangRuns())[0]
}
