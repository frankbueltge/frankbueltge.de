// src/lib/comma/ooni.ts — one minute of OONI's web tests, read into what Comma needs (2026-11-13).
//
// OONI Probe runs on volunteers' phones and computers. Its web test asks the volunteer's own network for a page and
// compares the answer with the one a control on an open network gets. Every test arrives as one row of OONI's
// measurement list; Comma keeps four facts of it and drops the rest: when it started, in which country, the URL it
// asked for (only to find the page's category), and what came back. What came back is one of four states, and a test
// is given exactly one of them, the strongest that applies:
//   confirmed  the network showed a known blockpage, the state's own notice (proof)
//   anomaly    the local answer differed from the control's, by DNS, connection or content (suspicion)
//   failure    the test itself failed
//   open       the page arrived as it does elsewhere

export type State = 'confirmed' | 'anomaly' | 'failure' | 'open'

export interface Test {
  /** milliseconds since the epoch, as the volunteer's device dated the test */
  at: number
  /** two-letter country code */
  cc: string
  state: State
  /** the page that was asked for */
  url: string
  /** OONI's id of the test, for a link to its entry in OONI Explorer; empty when OONI's row had none that looks right */
  uid: string
}

interface Row {
  measurement_uid?: unknown
  measurement_start_time?: unknown
  probe_cc?: unknown
  input?: unknown
  anomaly?: unknown
  confirmed?: unknown
  failure?: unknown
}

/** OONI's measurement ids look like "20261112194029.003293_IR_webconnectivity_5413b98f121d3aad"; nothing else
 *  is passed on, so no string from a third party reaches a link unchecked. */
export const UID = /^\d{14}\.\d{6}_[A-Z]{2}_[a-z0-9]+_[0-9a-f]{16}$/

export function stateOf(row: Pick<Row, 'anomaly' | 'confirmed' | 'failure'>): State {
  if (row.confirmed === true) return 'confirmed'
  if (row.anomaly === true) return 'anomaly'
  if (row.failure === true) return 'failure'
  return 'open'
}

/** OONI writes "2026-11-12T19:38:05.000000Z"; six fractional digits are more than every browser's parser takes, and
 *  the tests are dated to the second, so only the seconds are read. */
export function timeOf(stamp: unknown): number | null {
  if (typeof stamp !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(stamp)) return null
  const ms = Date.parse(`${stamp.slice(0, 19)}Z`)
  return Number.isFinite(ms) ? ms : null
}

/** The tests of one window [from, to) in OONI's measurement list. Anything malformed is skipped, never guessed. */
export function testsOf(json: unknown, from: number, to: number): Test[] {
  const results = (json as { results?: unknown } | null)?.results
  if (!Array.isArray(results)) return []
  const out: Test[] = []
  for (const r of results as Row[]) {
    const at = timeOf(r?.measurement_start_time)
    if (at === null || at < from || at >= to) continue
    if (typeof r.probe_cc !== 'string' || !/^[A-Z]{2}$/.test(r.probe_cc)) continue
    out.push({
      at,
      cc: r.probe_cc,
      state: stateOf(r),
      url: typeof r.input === 'string' ? r.input : '',
      uid: typeof r.measurement_uid === 'string' && UID.test(r.measurement_uid) ? r.measurement_uid : '',
    })
  }
  return out.sort((a, b) => a.at - b.at)
}

/** The host of a tested URL without "www.", for naming a blocked news outlet on the page. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}
