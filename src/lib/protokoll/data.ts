import { getCollection } from 'astro:content'
import type { ProtokollDay } from './types'

export async function getProtokollDays(): Promise<ProtokollDay[]> {
  const all = await getCollection('protokoll')
  return all.map((e) => e.data as ProtokollDay).sort((a, b) => b.date.localeCompare(a.date))
}

export async function getLatestProtokoll(): Promise<ProtokollDay | undefined> {
  return (await getProtokollDays())[0]
}

export async function getProtokollByDate(date: string): Promise<ProtokollDay | undefined> {
  return (await getProtokollDays()).find((d) => d.date === date)
}
