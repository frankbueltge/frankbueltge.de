// src/lib/comma/testlists.ts — which kind of page a tested URL is, from Citizen Lab's test lists (2026-11-13).
//
// The URLs OONI tests come from the lists Citizen Lab and others keep on GitHub: one global list and one per country,
// each URL with a category (Citizen Lab and Others, URL Testing Lists Intended for Discovering Website Censorship,
// 2014, CC BY-NC-SA 4.0). OONI's own category filter reads the same lists; on the window of 2026-11-12 19:38 UTC the
// two agreed on 2,267 of 2,268 tests. The visitor's browser loads the lists it needs straight from GitHub, which
// allows that; this site keeps no copy.

export const LIST_BASE = 'https://raw.githubusercontent.com/citizenlab/test-lists/master/lists/'

export const listUrl = (cc: string | 'global'): string => `${LIST_BASE}${cc === 'global' ? 'global' : cc.toLowerCase()}.csv`

/** One URL as the lists and OONI both spell it, give or take "www." and a trailing slash. */
export function urlKey(url: string): string {
  try {
    const u = new URL(url.trim())
    const path = u.pathname.replace(/\/+$/, '') || '/'
    return `${u.hostname.toLowerCase().replace(/^www\./, '')}${path}`
  } catch {
    return ''
  }
}

/** The first two fields of a CSV line (url, category_code), quotes respected; the notes after them are not read. */
function firstTwo(line: string): [string, string] | null {
  const fields: string[] = []
  let i = 0
  while (fields.length < 2 && i <= line.length) {
    if (line[i] === '"') {
      let j = i + 1
      let value = ''
      while (j < line.length) {
        if (line[j] === '"' && line[j + 1] === '"') {
          value += '"'
          j += 2
        } else if (line[j] === '"') {
          break
        } else {
          value += line[j]
          j += 1
        }
      }
      fields.push(value)
      i = line.indexOf(',', j) + 1 || line.length + 1
    } else {
      const comma = line.indexOf(',', i)
      fields.push(comma === -1 ? line.slice(i) : line.slice(i, comma))
      i = comma === -1 ? line.length + 1 : comma + 1
    }
  }
  return fields.length === 2 ? [fields[0]!, fields[1]!] : null
}

export function parseList(csv: string): Map<string, string> {
  const out = new Map<string, string>()
  const lines = csv.split(/\r?\n/)
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const pair = firstTwo(line)
    if (!pair) continue
    const key = urlKey(pair[0])
    const category = pair[1].trim().toUpperCase()
    if (key && /^[A-Z]{2,6}$/.test(category) && !out.has(key)) out.set(key, category)
  }
  return out
}

export interface Lists {
  global: Map<string, string> | null
  byCountry: Map<string, Map<string, string>>
}

/** The country's own list first, then the global one; null when neither names the URL. */
export function categoryOf(url: string, cc: string, lists: Lists): string | null {
  const key = urlKey(url)
  if (!key) return null
  return lists.byCountry.get(cc)?.get(key) ?? lists.global?.get(key) ?? null
}
