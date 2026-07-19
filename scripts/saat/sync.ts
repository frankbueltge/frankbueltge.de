// scripts/saat/sync.ts — Status-Rückfluss der „Öffentlichen Saat" (Design-Spec
// 2026-07-20, §5 "Status-Rückfluss", §9-Checkliste). Läuft via `npx tsx` als Teil des
// requests-watchdog-Workflows (2×/Tag), Node-APIs erlaubt.
//
// Zugriffsmuster bewusst gespiegelt vom bestehenden Watchdog (.github/workflows/
// requests-watchdog.yml): REQUESTS.md der drei Engine-Repos kommt roh von
// raw.githubusercontent.com — öffentliche Repos, kein Token nötig (das ist keine
// GitHub-REST-API mit Rate-Limit, sondern GitHub's Rohdatei-CDN). Ein einzelnes Repo, das
// gerade nicht lesbar ist, ist wie beim Watchdog kein harter Fehler — es wird übersprungen
// und protokolliert; "echte Fehler" im Sinn des Exit-Codes sind nur Dinge, die den Sync
// selbst kaputt machen (Register nicht lesbar/schreibbar, unerwartete Exceptions).
//
// Was dieses Skript tut (Spec §5):
//   1. parsePublicSeedResponses(md) je Engine-Repo → applyResponse() aufs Register.
//   2. Forward-Reconciliation: eine Seed-id, die in einer REQUESTS.md steht aber im Register
//      nicht in forwarded_to verzeichnet ist, wird nachgetragen (Register-Schreibzugriff –
//      das ist reine Bestandsaufnahme, kein Schreiben in Engine-Repos). Umgekehrt: gilt eine
//      Seed laut Register als an ein Repo weitergeleitet, taucht ihre id dort aber gar nicht
//      auf, wird das nur als Warnung auf stdout gemeldet — das Nachtragen in Engine-Repos
//      bleibt der Intake-Function vorbehalten (functions/api/saat.js), dieses Skript schreibt
//      nie in die Engine-Repos.
//   3. Register nur schreiben, wenn sich inhaltlich etwas geändert hat (Idempotenz: ein
//      zweiter Lauf ohne neue Antworten ist ein no-op, byte-identisches JSON).

import { readFileSync, writeFileSync } from 'node:fs'
import { parsePublicSeedResponses, applyResponse, SAAT_ENGINE_REPOS, type SaatRegister } from '../../src/lib/saat/saat'

const REGISTER_PATH = 'src/data/saat/register.json'
const GITHUB_OWNER = 'frankbueltge'
const FETCH_TIMEOUT_MS = 30_000

// Jede Seed-id, die irgendwo im Abschnitt "## Seeds from the public" auftaucht — mit oder
// ohne Response-Zeile. parsePublicSeedResponses (saat.ts) liefert nur die BEANTWORTETEN
// Blöcke; für die Forward-Reconciliation brauchen wir aber auch die unbeantworteten. Gleiche
// Abschnittsgrenzen wie der Parser dort (Heading bis zur nächsten "## "), damit ein Seed-Id-
// Treffer außerhalb des öffentlichen Abschnitts (z. B. in "Seeds from the team") nie zählt.
const SEED_ID_RE = /saat-\d{8}-\d{6}-[0-9a-f]{4}/g

function seedIdsInPublicSection(md: string): Set<string> {
  const headingMatch = /^## Seeds from the public\s*$/im.exec(md)
  if (!headingMatch) return new Set()
  const bodyStart = headingMatch.index + headingMatch[0].length
  const rest = md.slice(bodyStart)
  const nextHeadingMatch = /^## /m.exec(rest)
  const body = nextHeadingMatch ? rest.slice(0, nextHeadingMatch.index) : rest
  return new Set(body.match(SEED_ID_RE) ?? [])
}

/** Roh-Read von raw.githubusercontent.com — dasselbe Muster wie im Python-Watchdog
 * (urllib.request.urlopen auf dieselbe URL-Form). Rückgabe null heißt "übersprungen",
 * kein geworfener Fehler — der Aufrufer entscheidet, ob das den Exit-Code beeinflusst. */
async function fetchRequestsMd(repo: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repo}/main/REQUESTS.md`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!res.ok) {
      console.error(`${repo}: REQUESTS.md nicht lesbar (HTTP ${res.status}) — übersprungen`)
      return null
    }
    return await res.text()
  } catch (e) {
    console.error(`${repo}: REQUESTS.md nicht lesbar (${e instanceof Error ? e.message : String(e)}) — übersprungen`)
    return null
  }
}

function readRegister(): SaatRegister {
  return JSON.parse(readFileSync(REGISTER_PATH, 'utf8')) as SaatRegister
}

async function main(): Promise<number> {
  const before = readRegister()
  const beforeJson = JSON.stringify(before)
  let register = before

  // Ids je Repo merken (aus demselben Fetch) — die Forward-Warnung in Schritt 2 braucht sie.
  const idsByRepo = new Map<string, Set<string>>()
  let unreachableRepos = 0

  for (const repo of SAAT_ENGINE_REPOS) {
    const md = await fetchRequestsMd(repo)
    if (md === null) {
      unreachableRepos++
      continue
    }

    const idsInFile = seedIdsInPublicSection(md)
    idsByRepo.set(repo, idsInFile)

    // 1) Antworten der Praxis übernehmen (Watchdog-Parser aus saat.ts, Spec §5/§6).
    for (const r of parsePublicSeedResponses(md)) {
      const before2 = register
      register = applyResponse(register, r.id, { practice: repo, decision: r.decision, note: r.note, date: r.date })
      if (register !== before2) {
        console.log(`${repo}: ${r.id} → ${r.decision} (${r.persona}, ${r.date})`)
      }
    }

    // 2a) Forward-Reconciliation — nachtragen: Seed steht in dieser REQUESTS.md, ist im
    // Register für dieses Repo aber noch nicht als weitergeleitet vermerkt.
    register = {
      ...register,
      seeds: register.seeds.map((seed) => {
        if (idsInFile.has(seed.id) && !seed.forwarded_to.includes(repo)) {
          console.log(`${repo}: ${seed.id} nachgetragen in forwarded_to`)
          return { ...seed, forwarded_to: [...seed.forwarded_to, repo] }
        }
        return seed
      }),
    }
  }

  // 2b) Forward-Reconciliation — Warnung: Register hält eine Seed für an <repo> weitergeleitet,
  // die REQUESTS.md von <repo> zeigt ihre id aber nicht (nur für Repos, die wir lesen konnten —
  // ein unerreichbares Repo ist kein Beweis für einen fehlgeschlagenen Forward). Es wird NICHTS
  // geschrieben — das Nachtragen in Engine-Repos bleibt der Intake-Function vorbehalten.
  let missingForwardWarnings = 0
  for (const seed of register.seeds) {
    for (const repo of seed.forwarded_to) {
      const idsInFile = idsByRepo.get(repo)
      if (idsInFile && !idsInFile.has(seed.id)) {
        missingForwardWarnings++
        console.warn(
          `WARNUNG: ${seed.id} gilt im Register als an ${repo} weitergeleitet, fehlt aber in dessen REQUESTS.md`,
        )
      }
    }
  }

  const afterJson = JSON.stringify(register)
  if (afterJson !== beforeJson) {
    writeFileSync(REGISTER_PATH, JSON.stringify(register, null, 2) + '\n')
    console.log(`${REGISTER_PATH} aktualisiert`)
  } else {
    console.log('keine Änderung — Register bereits konsistent (idempotent)')
  }

  if (unreachableRepos > 0) {
    console.error(`${unreachableRepos}/${SAAT_ENGINE_REPOS.length} Engine-Repos nicht lesbar — wie beim Watchdog kein harter Fehler, nächster Lauf holt nach`)
  }
  if (missingForwardWarnings > 0) {
    console.error(`${missingForwardWarnings} Forward-Inkonsistenz(en) gemeldet — keine harten Fehler, siehe WARNUNG-Zeilen oben`)
  }

  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(`saat-sync fehlgeschlagen: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`)
    process.exit(1)
  })
