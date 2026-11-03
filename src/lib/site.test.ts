import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SITE } from './site'

// The role line names Frank's work and will change when that does. Most surfaces read
// SITE.role; these repeat it as text, because they are plain files, share images baked at
// build time or dictionary strings. Change SITE.role and this goes red until each of them
// follows; the eyebrow is held the same way in naming.test.ts.
const REPEATS = [
  'public/llms.txt',
  'README.md',
  'package.json',
  'src/i18n/ui.ts',
  'src/lib/og.ts',
  'src/data/about.ts',
  'src/config/dossier-wording.ts',
]

describe('the role line', () => {
  it.each(REPEATS)('stands in %s as SITE.role has it', (file) => {
    expect(readFileSync(new URL(`../../${file}`, import.meta.url), 'utf-8')).toContain(SITE.role.en)
  })
})
