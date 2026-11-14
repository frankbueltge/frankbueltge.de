// The licence of Common Ground changes on a date, and the archive straddles it. A day that was
// dedicated under CC0 must keep saying so however late its page is rebuilt, and a day after the
// step must ask to be named in every edition a reader or a machine can reach.
import { describe, expect, it } from 'vitest'
import { fixtureDay, fixtureAudience } from './fixtures'
import { datasetLd } from './jsonld'
import {
  ATTRIBUTION_FROM,
  attributionField,
  CC0_URL,
  CC_BY_URL,
  CREDIT_LINE,
  CREDIT_URL,
  dataLicence,
  LAST_CC0,
  LICENCE_FIELD_ARCHIVE,
  licenceField,
  licenceSentence,
} from './licence'
import { renderMarkdown } from './markdown'
import { fixtureTerm, fixtureTerms } from './terms-fixtures'
import { termDatasetLd, termsDatasetLd } from './terms-jsonld'
import { renderTermsMarkdown } from './terms-markdown'

describe('the data licence of Common Ground', () => {
  it('is CC0 up to the last dedicated ledger and CC BY 4.0 from the next one', () => {
    expect(dataLicence('2026-09-02')).toMatchObject({ spdx: 'CC0-1.0', url: CC0_URL, attribution: false })
    expect(dataLicence(LAST_CC0)).toMatchObject({ spdx: 'CC0-1.0', attribution: false })
    expect(dataLicence(ATTRIBUTION_FROM)).toMatchObject({ spdx: 'CC-BY-4.0', url: CC_BY_URL, attribution: true })
    expect(dataLicence('2027-01-01')).toMatchObject({ spdx: 'CC-BY-4.0', attribution: true })
  })

  it('has no gap and no overlap between the two', () => {
    const next = new Date(`${LAST_CC0}T00:00:00Z`)
    next.setUTCDate(next.getUTCDate() + 1)
    expect(next.toISOString().slice(0, 10)).toBe(ATTRIBUTION_FROM)
  })

  it('treats a file that does not exist yet as a new one', () => {
    expect(dataLicence(null).attribution).toBe(true)
    expect(dataLicence(undefined).attribution).toBe(true)
  })

  it('tells a reader of either kind of day that the other exists', () => {
    const before = licenceSentence(LAST_CC0)
    expect(before).toContain('CC0 1.0 for this ledger')
    expect(before).toContain('CC BY 4.0')
    expect(before).toContain(CREDIT_LINE)
    const after = licenceSentence(ATTRIBUTION_FROM)
    expect(after.startsWith('CC BY 4.0')).toBe(true)
    expect(after).toContain(CREDIT_LINE)
    expect(after).toContain(`up to ${LAST_CC0} stay CC0 1.0`)
  })

  it('keeps the envelope of a dedicated day byte for byte', () => {
    // A committed day is promised to return the same bytes; this is the string those days were
    // published with.
    expect(licenceField('2026-09-02')).toBe('CC0-1.0 (data), per the licence line of 2026-07-26')
    expect(attributionField('2026-09-02')).toEqual({})
  })

  it('asks a machine reader of a later day for the name and the link', () => {
    expect(licenceField(ATTRIBUTION_FROM)).toMatch(/^CC-BY-4\.0 \(data\)/)
    expect(licenceField(ATTRIBUTION_FROM)).toContain(CREDIT_URL)
    expect(attributionField(ATTRIBUTION_FROM)).toEqual({
      attribution: { name: 'Common Ground', url: CREDIT_URL, required: true },
    })
  })

  it('names both licences where an envelope spans the step', () => {
    expect(LICENCE_FIELD_ARCHIVE).toContain('CC-BY-4.0')
    expect(LICENCE_FIELD_ARCHIVE).toContain('CC0-1.0')
    expect(LICENCE_FIELD_ARCHIVE).toContain(ATTRIBUTION_FROM)
    expect(LICENCE_FIELD_ARCHIVE).toContain(LAST_CC0)
  })
})

describe('the editions follow the date of the ledger', () => {
  const canonical = 'https://frankbueltge.de/trending/2026-11-15/'
  const later = () => ({ ...fixtureDay(), date: ATTRIBUTION_FROM })
  const laterTerms = () => ({ ...fixtureTerms(), date: ATTRIBUTION_FROM })

  it('the day ledger as a dataset', () => {
    expect(datasetLd(fixtureDay(), canonical)).not.toHaveProperty('creditText')
    const ld = datasetLd(later(), canonical)
    expect(ld.license).toBe(CC_BY_URL)
    expect(ld).toMatchObject({ creditText: CREDIT_LINE })
  })

  it('the day ledger as Markdown', () => {
    const md = renderMarkdown(later(), fixtureAudience())
    expect(md).toContain('CC BY 4.0: free to use, with the source named and linked')
    expect(md).toContain('(data CC BY 4.0).')
    expect(renderMarkdown(fixtureDay(), fixtureAudience())).toContain('(data CC0 1.0).')
  })

  it('the watchlist and one term as datasets', () => {
    expect(termsDatasetLd(laterTerms(), 'https://frankbueltge.de/trending/topics/')).toMatchObject({
      license: CC_BY_URL,
      creditText: CREDIT_LINE,
    })
    expect(
      termDatasetLd(laterTerms(), fixtureTerm(), 'https://frankbueltge.de/trending/topics/loop-engineering/'),
    ).toMatchObject({ license: CC_BY_URL, creditText: CREDIT_LINE })
  })

  it('the watchlist as Markdown', () => {
    const md = renderTermsMarkdown(laterTerms())
    expect(md).toContain('CC BY 4.0: free to use, with the source named and linked')
    expect(md).toContain('(data CC BY 4.0).')
    expect(renderTermsMarkdown(fixtureTerms())).toContain('(data CC0 1.0).')
  })
})
