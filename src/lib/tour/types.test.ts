import { describe, expect, it } from 'vitest'
import { jsonScriptPayload, readJsonScript } from '@/lib/dataviz/runtime'
import type { FocusState } from './types'

// Tour.astro serves each scene's FocusState as a `<script type="application/json"
// id="dv-focus-<scene id>">` payload (the same server-serialize / client-parse pair runtime.ts's
// own tests already cover for a flat record) — this file proves the round trip specifically for
// FocusState's actual shape: an optional nullable `filter`, an optional `annotate` array of
// objects, and a `select` that may be entirely absent, none of which the existing runtime.test.ts
// fixtures exercise.

function fakeDoc(id: string, textContent: string | null) {
  return { getElementById: (wantedId: string) => (wantedId === id ? { textContent } : null) }
}

describe('FocusState JSON round-trip (jsonScriptPayload / readJsonScript)', () => {
  it('round-trips a minimal FocusState (only the required `figure` field)', () => {
    const focus: FocusState = { figure: 'fig-1' }
    const payload = jsonScriptPayload(focus)
    const doc = fakeDoc('dv-focus-scene-one', payload)
    expect(readJsonScript<FocusState>('dv-focus-scene-one', doc)).toEqual(focus)
  })

  it('round-trips every optional field together, including a nullable filter and an annotate array', () => {
    const focus: FocusState = {
      figure: 'fig-1',
      select: 'mark-7',
      filter: ['field', 'atelier'],
      dim: ['studio'],
      annotate: [
        { key: 'mark-7', text: 'the crossing point' },
        { key: 'mark-9', text: 'a second call-out' },
      ],
    }
    const payload = jsonScriptPayload(focus)
    const doc = fakeDoc('dv-focus-scene-two', payload)
    expect(readJsonScript<FocusState>('dv-focus-scene-two', doc)).toEqual(focus)
  })

  it('round-trips an explicit `filter: null` as null, not undefined — the two are distinct per types.ts', () => {
    const focus: FocusState = { figure: 'fig-1', filter: null }
    const payload = jsonScriptPayload(focus)
    const doc = fakeDoc('dv-focus-scene-three', payload)
    const roundTripped = readJsonScript<FocusState>('dv-focus-scene-three', doc)
    expect(roundTripped.filter).toBeNull()
    expect('filter' in roundTripped).toBe(true)
  })

  it('escapes an annotate text containing a literal "</script>" so it cannot break out of its payload', () => {
    const focus: FocusState = { figure: 'fig-1', annotate: [{ key: 'k', text: 'quoting </script><script>bad' }] }
    const payload = jsonScriptPayload(focus)
    expect(payload).not.toContain('</script>')
    const doc = fakeDoc('dv-focus-scene-four', payload)
    expect(readJsonScript<FocusState>('dv-focus-scene-four', doc)).toEqual(focus)
  })
})
