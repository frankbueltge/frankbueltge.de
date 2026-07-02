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
})

describe('checkForbidden — links yes, loads no', () => {
  it('allows citation links and plain-text URLs', () => {
    const src = `<a href="https://doi.org/10.1089/big.2016.0047">Chouldechova 2017</a>
      See https://www.propublica.org/article/machine-bias for the dataset.`
    expect(checkForbidden(src)).toEqual([])
  })
  it('rejects external script src', () => {
    expect(checkForbidden(`<script src="https://evil.example/x.js"></script>`).join(' '))
      .toContain('external resource')
  })
  it('rejects fetch() and dynamic import() of external URLs', () => {
    expect(checkForbidden(`fetch("https://api.example.com/data")`)).toHaveLength(1)
    expect(checkForbidden(`import("https://cdn.example.com/mod.js")`)).toHaveLength(1)
  })
  it('rejects external img src, css url() and @import', () => {
    expect(checkForbidden(`<img src="https://cdn.example.com/a.png">`)).toHaveLength(1)
    expect(checkForbidden(`.x { background: url(https://cdn.example.com/b.png) }`)).toHaveLength(1)
    expect(checkForbidden(`@import "https://cdn.example.com/style.css";`)).toHaveLength(1)
  })
  it('rejects Worker/WebSocket/EventSource and XHR open', () => {
    expect(checkForbidden(`new Worker("https://evil.example/w.js")`)).toHaveLength(1)
    expect(checkForbidden(`new WebSocket("https://evil.example/ws")`)).toHaveLength(1)
    expect(checkForbidden(`xhr.open("GET", "https://evil.example/api")`)).toHaveLength(1)
  })
  it('allows w3/schema hosts even in loading contexts (svg namespaces)', () => {
    expect(checkForbidden(`<image src="https://www.w3.org/2000/svg" />`)).toEqual([])
  })
  it('rejects JSX-style src={\`url\`} attributes', () => {
    expect(checkForbidden('const x = <img src={`https://cdn.example.com/a.png`} />')).toHaveLength(1)
  })
  it('dedupes: same URL in two loading contexts is reported once', () => {
    const src = `fetch("https://evil.example/x")\nnew WebSocket("https://evil.example/x")`
    expect(checkForbidden(src)).toHaveLength(1)
  })
})

describe('checkForbidden — location access', () => {
  it('flags window.location access', () => {
    expect(checkForbidden(`window.location = 'https://evil.example'`)).toContain('navigation: window.location')
  })
})

describe('checkForbidden — srcset / object / embed / meta refresh', () => {
  it('rejects a malicious later srcset candidate', () => {
    const src = `<img srcset="https://www.w3.org/img/a.png 1x, https://evil.example/exfil.png 2x">`
    expect(checkForbidden(src).join(' ')).toContain('evil.example')
  })
  it('allows srcset whose candidates are all allowlisted hosts', () => {
    expect(checkForbidden(`<img srcset="https://www.w3.org/a.png 1x, https://schema.org/b.png 2x">`)).toEqual([])
  })
  it('rejects object/embed data and meta refresh URLs', () => {
    expect(checkForbidden(`<object data="https://evil.example/x.svg"></object>`)).toHaveLength(1)
    expect(checkForbidden(`<embed src="https://evil.example/x.swf">`)).toHaveLength(1)
    expect(checkForbidden(`<meta http-equiv="refresh" content="0;url=https://evil.example/">`)).toHaveLength(1)
  })
})
