// src/lib/apparatus/topology.test.ts — the machine-checked half of the apparatus map.
//
// topology.ts is a human-readable account of how this ecology is wired. This file reads the real
// .github/workflows/*.yml with node:fs and fails the moment the account drifts from them — the
// same split as src/lib/redirects.test.ts, which guards the redirect matrix against the file
// Cloudflare actually serves.
//
// It exists because the page this map replaces admitted its own weakness in its header: "it is
// prose, not a build-time report against the workflow files." On 2026-08-03 that prose listed
// four gates while the repository held twenty-seven workflows, and three workflows that commit
// to main never reached production because deploy-cf.yml waited on names that no longer existed.
// A comment cannot fail. A test can.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DOMAIN_IDS, EDGES, NODES, domainOf, nodeById, repoRefs, workflowClaims } from './topology'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const WORKFLOW_DIR = `${ROOT}.github/workflows`

const read = (repoRelative: string): string => readFileSync(`${ROOT}${repoRelative}`, 'utf8')

/** The `name:` a workflow declares — the string GitHub matches `workflow_run` against. */
function declaredName(source: string): string | null {
  return source.match(/^name:[ \t]*(.+?)[ \t]*$/m)?.[1] ?? null
}

/** Every `- cron: '…'` under this workflow's schedule block, in file order. */
function declaredCron(source: string): string[] {
  return [...source.matchAll(/^\s*-\s*cron:\s*['"]?([^'"#\n]+?)['"]?\s*(?:#.*)?$/gm)].map((m) => m[1].trim())
}

/** The `types: [...]` of this workflow's repository_dispatch trigger. */
function dispatchTypes(source: string): string[] {
  const block = source.match(/repository_dispatch:\s*\n\s*types:\s*\[([^\]]*)\]/)
  return block ? block[1].split(',').map((t) => t.trim()).filter(Boolean) : []
}

const workflowFiles = readdirSync(WORKFLOW_DIR).filter((f) => f.endsWith('.yml'))

/** declared name → file, for every workflow in the repository. */
const namesInRepo = new Map<string, string>()
for (const file of workflowFiles) {
  const name = declaredName(readFileSync(`${WORKFLOW_DIR}/${file}`, 'utf8'))
  if (name) namesInRepo.set(name, file)
}

const deployCf = read('.github/workflows/deploy-cf.yml')

/** The workflow names deploy-cf.yml waits on, comments stripped. */
function deployTriggerNames(): string[] {
  const block = deployCf.match(/workflow_run:\s*\n\s*workflows:\s*\n((?:[ \t]*(?:#.*|-[ \t].*)\n)+)/)
  if (!block) return []
  return block[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).replace(/\s*#.*$/, '').trim())
    .filter(Boolean)
}

/**
 * Does this workflow stage a path that only exists in THIS repository, and then push? That pair
 * is what separates a workflow committing site data from one writing a refusal letter into a
 * practice's own repository — the integrate workflows do both in the same file, and only the
 * first has to reach production. Checked empirically on 2026-08-03: all twenty workflows that
 * push stage a `src/` path, and exactly one of them (the pull-request sluice) pushes somewhere
 * other than main.
 */
const commitsSiteData = (source: string): boolean =>
  /git add\s+(-A\s+)?(src|public|pipelines)\//.test(source) && /git push/.test(source)

/**
 * Workflows that commit site data but are deliberately absent from the deploy trigger list.
 * Each needs a reason here, so that "not listed" is always either a recorded decision or a
 * failing test — never an oversight, which is exactly how the three defects of 2026-08-03
 * survived.
 */
const NOT_A_MAIN_COMMITTER: Record<string, string> = {
  'engine-site-pr.yml':
    'pushes to a pull-request branch and to the engine repositories, never to main — the human merge fires on:push normally',
}

describe('the apparatus map describes the workflows this repository actually has', () => {
  it('claims at least one workflow, and every claimed file exists', () => {
    const claims = workflowClaims()
    expect(claims.length).toBeGreaterThan(0)
    for (const c of claims) {
      expect(existsSync(`${ROOT}${c.ref}`), `${c.claimedBy} names ${c.ref}, which does not exist`).toBe(true)
    }
  })

  it.each(workflowClaims())('$claimedBy declares the name and cadence the map prints', (claim) => {
    const source = read(claim.ref)
    expect(declaredName(source), `${claim.ref} declares a different name than the map prints`).toBe(claim.workflowName)
    if (claim.cron) {
      expect(declaredCron(source), `${claim.ref} runs on a different schedule than the map prints`).toEqual(claim.cron)
    }
  })

  it('points only at files that exist', () => {
    const missing = repoRefs().filter((r) => !existsSync(`${ROOT}${r.ref}`))
    expect(missing.map((m) => `${m.claimedBy} → ${m.ref}`)).toEqual([])
  })
})

describe('every workflow that commits to main reaches production', () => {
  // This is the map's central claim, and the one the prose page could not make.
  it('every name deploy-cf.yml waits on resolves to a workflow that exists', () => {
    const dead = deployTriggerNames().filter((n) => !namesInRepo.has(n))
    expect(
      dead,
      'deploy-cf.yml waits on a workflow_run name no workflow declares — GitHub matches by declared ' +
        'name, so this trigger silently matches nothing and that data never reaches production',
    ).toEqual([])
  })

  it('every workflow that commits site data is either triggered or explicitly excused', () => {
    const listed = new Set(deployTriggerNames())
    const unreachable: string[] = []
    for (const file of workflowFiles) {
      const source = readFileSync(`${WORKFLOW_DIR}/${file}`, 'utf8')
      if (!commitsSiteData(source)) continue
      if (file in NOT_A_MAIN_COMMITTER) continue
      const name = declaredName(source)
      if (name && !listed.has(name)) unreachable.push(`${file} (name: ${name})`)
    }
    expect(
      unreachable,
      'this workflow pushes to the repository but is not in deploy-cf.yml — pushes made with the ' +
        "built-in token do not fire on:push, so its data would only go live on someone else's deploy",
    ).toEqual([])
  })

  it('names a reason for every workflow excused from the trigger list', () => {
    for (const [file, reason] of Object.entries(NOT_A_MAIN_COMMITTER)) {
      expect(existsSync(`${WORKFLOW_DIR}/${file}`), `${file} is excused but does not exist`).toBe(true)
      expect(reason.length, `${file} is excused without a reason`).toBeGreaterThan(20)
    }
  })
})

describe('every dispatch edge names a trigger the receiving workflow accepts', () => {
  const dispatchEdges = EDGES.filter((e) => e.kind === 'repository_dispatch' && e.ref)

  it('has dispatch edges to check', () => {
    expect(dispatchEdges.length).toBeGreaterThan(0)
  })

  it.each(dispatchEdges)('$from → $to arrives at a workflow that listens for a dispatch', (edge) => {
    const source = read(edge.ref as string)
    expect(
      dispatchTypes(source).length,
      `${edge.ref} carries no repository_dispatch trigger, but the map draws one into it`,
    ).toBeGreaterThan(0)
  })

  it('quotes a dispatch type that the receiving workflow really declares', () => {
    for (const edge of dispatchEdges) {
      const quoted = edge.mechanism.match(/`([a-z-]+-landed)`/)?.[1]
      if (!quoted) continue
      const types = dispatchTypes(read(edge.ref as string))
      expect(types, `${edge.ref} does not accept \`${quoted}\`, which ${edge.from} → ${edge.to} claims it sends`).toContain(quoted)
    }
  })
})

describe('the topology holds together as a graph', () => {
  it('gives every node a unique id', () => {
    const ids = NODES.map((n) => n.id)
    expect(ids.length).toBe(new Set(ids).size)
  })

  it('resolves both ends of every edge', () => {
    const dangling = EDGES.filter((e) => !nodeById(e.from) || !nodeById(e.to)).map((e) => `${e.from} → ${e.to}`)
    expect(dangling).toEqual([])
  })

  it('leaves no node unconnected — an island would be a claim nobody can follow', () => {
    const touched = new Set(EDGES.flatMap((e) => [e.from, e.to]))
    expect(NODES.filter((n) => !touched.has(n.id)).map((n) => n.id)).toEqual([])
  })

  it('carries appearance nowhere — colour belongs to the stylesheet (ADR 0010)', () => {
    expect(read('src/lib/apparatus/topology.ts')).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})

describe('the map keeps the two undertakings apart', () => {
  // The first version of this figure stood the ecology's gates and the lab's nightly instruments
  // side by side as though they were one thing. One repository carries both; that is a fact about
  // the apparatus, and the figure has to say which is which rather than blur them.
  it('gives every node a domain, and names no domain for a node that does not exist', () => {
    const ids = new Set(NODES.map((n) => n.id))
    expect(NODES.filter((n) => !domainOf(n.id)).map((n) => n.id)).toEqual([])
    expect(DOMAIN_IDS.filter((id) => !ids.has(id))).toEqual([])
  })

  it('puts every voice, gate and mirror in the ecology, and no instrument in it', () => {
    for (const n of NODES) {
      const d = domainOf(n.id)
      if (n.layer === 'practices' || n.layer === 'gates') {
        expect(d, `${n.id} is a ${n.layer} node but not in the ecology`).toBe('ecology')
      }
      // the counter-measurement line belongs to the Experiments, never to the ecology
      if (n.id === 'in-protokoll' || n.id === 'in-gegenmessung') expect(d).toBe('lab')
    }
  })

  it('leaves the ecology standing on its own — filtering to it strands no part of it', () => {
    const eco = NODES.filter((n) => domainOf(n.id) === 'ecology').map((n) => n.id)
    const inside = new Set(eco)
    for (const id of eco) {
      const touches = EDGES.some((e) => (e.from === id && inside.has(e.to)) || (e.to === id && inside.has(e.from)))
      expect(touches, `${id} is in the ecology but connects to nothing else in it`).toBe(true)
    }
  })

  it('carries all three domains, so the distinction is drawn and not merely declared', () => {
    const seen = new Set(NODES.map((n) => domainOf(n.id)))
    expect([...seen].sort()).toEqual(['ecology', 'lab', 'shared'])
  })
})

describe('the map says how far it can vouch for each edge', () => {
  it('marks every edge either derived or declared', () => {
    for (const e of EDGES) expect(['derived', 'declared']).toContain(e.checked)
  })

  it('backs every derived edge with a file it can be read out of', () => {
    const unbacked = EDGES.filter((e) => e.checked === 'derived' && !e.ref).map((e) => `${e.from} → ${e.to}`)
    expect(unbacked, 'an edge cannot claim to be derived without naming where from').toEqual([])
  })

  it('gives every severed edge its evidence in plain language', () => {
    for (const e of EDGES.filter((x) => x.severed)) {
      expect(e.severed!.length, `${e.from} → ${e.to} is drawn severed without saying why`).toBeGreaterThan(40)
      expect(e.ref, `${e.from} → ${e.to} is drawn severed without naming the record`).toBeTruthy()
    }
  })
})
