// src/lib/comma/links.ts — where a mark of Comma's score may lead (2026-11-13). Pure, and strict, because every part of a
// link here comes from third-party data: an id, a country code or a URL from OONI's rows.
//
// Every heard test links to its own entry in OONI Explorer, the public record of that one measurement, with the
// network, the answers and the evidence. A country links to OONI's page for that country. The tested website itself is
// linked only when it is a news outlet: never a porn or gambling page, never a personal page; their OONI entry names
// them for whoever wants to look.

import { UID } from './ooni'

const EXPLORER = 'https://explorer.ooni.org'

export const entryLink = (uid: string): string | null => (UID.test(uid) ? `${EXPLORER}/m/${uid}` : null)

export const countryLink = (cc: string): string | null => (/^[A-Z]{2}$/.test(cc) ? `${EXPLORER}/country/${cc}` : null)

/** The outlet's own front page, for a news site only; the origin alone, never a path from the row. */
export function siteLink(url: string, category: string | null): string | null {
  if (category !== 'NEWS') return null
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    return `${u.protocol}//${u.host}/`
  } catch {
    return null
  }
}
