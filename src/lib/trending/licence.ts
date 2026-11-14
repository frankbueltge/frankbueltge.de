/** The data licence of Common Ground, by the date of the ledger.
 *
 *  Up to the ledger of 2026-11-14 every day file and every run of the arcs was dedicated to the
 *  public domain under CC0 1.0, like all data of the lab (licence line of 2026-07-26). From the
 *  ledger of 2026-11-15 Common Ground is the dated exception to that line: its data is CC BY 4.0,
 *  free to use for any purpose as long as the source is named and linked (decided on 2026-11-14
 *  at Frank's request, wording private; LICENSE.md carries the exception).
 *
 *  A dedication is not withdrawn. The earlier files keep CC0, so the licence follows the date of
 *  the file and never the day a page was built: an archive day rebuilt next year still says what
 *  it was published under. */

/** The first ledger that asks to be named. */
export const ATTRIBUTION_FROM = '2026-11-15'
/** The last ledger dedicated under CC0. */
export const LAST_CC0 = '2026-11-14'

export const CC0_URL = 'https://creativecommons.org/publicdomain/zero/1.0/'
export const CC_BY_URL = 'https://creativecommons.org/licenses/by/4.0/'

/** What a reuse names, and where it links. */
export const CREDIT_NAME = 'Common Ground'
export const CREDIT_URL = 'https://frankbueltge.de/trending'
export const CREDIT_LINE = `${CREDIT_NAME}, ${CREDIT_URL}`

export interface DataLicence {
  spdx: 'CC0-1.0' | 'CC-BY-4.0'
  label: 'CC0 1.0' | 'CC BY 4.0'
  url: string
  /** True where a reuse has to name and link the source. */
  attribution: boolean
}

const ZERO: DataLicence = { spdx: 'CC0-1.0', label: 'CC0 1.0', url: CC0_URL, attribution: false }
const BY: DataLicence = { spdx: 'CC-BY-4.0', label: 'CC BY 4.0', url: CC_BY_URL, attribution: true }

/** ISO dates compare as strings; a missing date is a file not written yet, which is a new one. */
export function dataLicence(date: string | null | undefined): DataLicence {
  return !date || date >= ATTRIBUTION_FROM ? BY : ZERO
}

/** One sentence for a page footer or a Markdown edition. It names both sides of the step, so
 *  a reader of either kind of day learns that the other exists. */
export function licenceSentence(date: string | null | undefined): string {
  return dataLicence(date).attribution
    ? `CC BY 4.0: free to use, with the source named and linked (${CREDIT_LINE}). Ledgers up to ${LAST_CC0} stay CC0 1.0.`
    : `CC0 1.0 for this ledger. From the ledger of ${ATTRIBUTION_FROM} the data is CC BY 4.0: name and link ${CREDIT_LINE}.`
}

/** The `licence` string of one dated JSON envelope. A CC0 day keeps the string it was published
 *  with, byte for byte: a committed day is promised to return the same bytes. */
export function licenceField(date: string | null | undefined): string {
  return dataLicence(date).attribution
    ? `CC-BY-4.0 (data): name and link ${CREDIT_LINE}. Exception to the licence line of 2026-07-26, in force from the ledger of ${ATTRIBUTION_FROM}; earlier ledgers stay CC0-1.0`
    : 'CC0-1.0 (data), per the licence line of 2026-07-26'
}

/** The `licence` string of an envelope that spans days on both sides of the step. */
export const LICENCE_FIELD_ARCHIVE =
  `CC-BY-4.0 (data) from the ledger of ${ATTRIBUTION_FROM}: name and link ${CREDIT_LINE}. ` +
  `CC0-1.0 (data) for the ledgers up to ${LAST_CC0}, per the licence line of 2026-07-26`

/** The attribution a JSON envelope carries beside its licence, or nothing on a CC0 day. */
export function attributionField(date: string | null | undefined): { attribution: { name: string; url: string; required: true } } | Record<string, never> {
  return dataLicence(date).attribution ? { attribution: { name: CREDIT_NAME, url: CREDIT_URL, required: true } } : {}
}
