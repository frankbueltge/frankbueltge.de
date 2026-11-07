import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// The static render outgrew Node's default heap on 2026-11-06. The first repair raised the heap
// only in ci.yml and deploy-cf.yml, so the practice integrate workflows kept failing for two days
// and the cycle could not turn. The heap now lives in the build script itself; this test keeps it
// there and keeps workflows from setting a smaller one of their own.
const HEAP = /--max-old-space-size=(\d+)/

describe('build heap', () => {
  it('is set in the build script, so every `npm run build` gets it', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    const m = HEAP.exec(pkg.scripts.build)
    expect(m, 'package.json scripts.build must set --max-old-space-size').not.toBeNull()
    expect(Number(m![1])).toBeGreaterThanOrEqual(6144)
  })

  it('is not lowered by any workflow', () => {
    for (const f of readdirSync('.github/workflows')) {
      const text = readFileSync(`.github/workflows/${f}`, 'utf8')
      for (const m of text.matchAll(new RegExp(HEAP, 'g'))) {
        expect(Number(m[1]), `${f} sets a smaller heap than the build script`).toBeGreaterThanOrEqual(6144)
      }
    }
  })
})
