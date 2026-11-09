// Paper-Katalog (/papers) — Typen und reine Hilfsfunktionen.
//
// The second of the two catalogues that fall out of the same search (Frank's decision of
// 2026-07-27, wording private: datasets go to the register, papers get a catalogue of their own).
// Warum getrennt vom Register: Die Praxen zitieren ganz überwiegend PAPER, nicht
// Datensätze — gemessen am 27.07. waren von 89 je zitierten DOIs null im Dataset-Register.
// Ein Katalog, der nur Datensätze führt, hätte die Forschung nur zur Hälfte bedient.
//
// Abgrenzung zu `src/data/atelier/atlas.json` (Assays Theorie-Atlas, 98 Einträge): Der
// ist die Bibliothek EINER Praxis und bleibt es. Dieser Katalog ist ökologieweit und
// vermerkt je Eintrag, WER ihn zitiert. Überschneidung ist erlaubt und wird sichtbar —
// ein Eintrag, den mehrere Praxen brauchen, ist ein stärkerer Eintrag, kein doppelter.
//
// Herkunft der Daten: pipelines/atlas-scout (praxen.py sammelt, was die Praxen zitieren;
// katalog.py löst die Kennungen bei OpenAlex bzw. arXiv auf). Committet, nicht zur
// Bauzeit geholt — kuratiert heißt klein genug fürs Repo.
import eintraegeRaw from '@/data/register/papers.json'
import abgelehntRaw from '@/data/register/abgelehnt.json'

/** Woher der Begründungssatz stammt, absteigend nach Gewicht.
 *  Die Fläche macht den Unterschied sichtbar, statt ihn einzuebnen:
 *  `praxis`   — eine Praxis hat ihn selbst geschrieben, wörtlich übernommen
 *  `urteil`   — die Urteilsroutine, von einem benannten Modell (siehe `urteil`)
 *  `gebrauch` — nur der Beleg, wer wann zitiert hat; sagt DASS, nicht WARUM */
export type RelevanceSource = 'praxis' | 'urteil' | 'gebrauch'

/** Nachweis des Urteilsschritts. Nur gesetzt bei `relevanz_herkunft === 'urteil'`.
 *  Ohne diesen Block wäre ein maschinell geschriebener Satz von einem der Praxis nicht
 *  zu unterscheiden — und genau das darf nicht passieren. */
export interface Urteil {
  modell: string
  am: string
  /** `abstract` | `volltext` | `fundstelle` — worauf sich das Urteil stützt. */
  grundlage: string
  sitzung: string
}

export type VerifyStatus = 'verified' | 'toVerify'

/** Die zwei Wege, auf denen ein Katalog wächst (Frank, 2026-07-28):
 *  `praxis` = eine Praxis benutzt oder führt den Text · `scout` = in der
 *  Zitationsnachbarschaft gefunden, als Anreicherung. */
export type Weg = 'praxis' | 'scout'

/** Warum der Eintrag AUFGENOMMEN wurde — eine angewandte Regel, kein Urteil über den
 *  Inhalt (das ist `relevanz`). Der Unterschied ist der ganze Punkt: Das alte Register
 *  konnte nicht sagen, warum ein Eintrag drinstand, weil es keine Regel gab, die man
 *  hätte nennen können. */
export type Aufnahmegrund = 'zitiert' | 'kuratiert' | 'nachbarschaft'

export interface PaperEntry {
  id: string
  /** Wörtlich aus der Quelle. */
  titel: string
  urheber: string[]
  jahr: number | null
  /** Zeitschrift, Verlag, Repositorium — wörtlich; leer, wenn die Quelle nichts nennt. */
  ort: string
  /** DOI oder `arXiv:<id>`, so wie die Quelle sie selbst führt. */
  kennung: string
  /** Weitere Kennungen desselben Textes — vor allem die Preprint-Fassung neben der
   *  veröffentlichten. Beim Zusammenführen von Dubletten verschwindet keine Kennung:
   *  Wer über die arXiv-Nummer sucht, soll den Eintrag finden. */
  weitere_kennungen: string[]
  url: string
  frei_zugaenglich: boolean
  /** Felder 1–13 der gemeinsamen Themenkarte (themen.py / AtlasPage CLUSTER).
   *  Leer heißt „noch nicht eingeordnet" — nie ein geratenes Feld. */
  felder: number[]
  zusammenfassung: string

  /** Warum der Eintrag ZÄHLT — Urteil über den Inhalt. */
  relevanz: string
  relevanz_herkunft: RelevanceSource
  /** Nur bei `relevanz_herkunft === 'urteil'` gesetzt. */
  urteil?: Urteil | null

  /** Woher er KOMMT und warum er aufgenommen wurde — Regel, nicht Urteil. */
  weg: Weg
  aufnahmegrund: Aufnahmegrund
  /** Wo genau: `ulysses/journal/2026-07-01.md` bzw. die kuratierte Sammlung.
   *  Ohne mindestens eine Fundstelle ist ein Eintrag nicht belegt. */
  fundstellen: string[]

  /** Prüfung des Zugriffswegs. Bestätigt sind nur 200/203/206 — HTTP 202 ist keine
   *  Bestätigung (die figshare-Familie antwortet automatisierten Anfragen so). */
  geprueft: boolean
  pruef_status: number | null
  pruef_vermerk: string | null
  /** Who cites the entry: a practice or house key, labelled by `praxisLabel`. */
  zitiert_von: string[]
  /** ISO-Datum der jüngsten Nennung — das Maß für „gerade in Arbeit". */
  zuletzt_gebraucht: string | null
  verify_status: VerifyStatus
  /** The day the catalogue's builder first wrote this paper (stamped since 2026-10-05 by
   *  katalog.py, stamp_first_seen, against the catalogue committed before the run). Null for a
   *  paper already there when the stamp began; absent in a catalogue written earlier. */
  first_seen_on?: string | null
}

export const PAPERS = eintraegeRaw as unknown as PaperEntry[]

/** Ein zurückgenommener Eintrag. Das Verzeichnis hält fest, WAS entfernt wurde, nicht
 *  nur DASS — die vollständige Kopie macht die Rücknahme prüfbar und umkehrbar. */
export interface Ablehnung {
  id: string
  kennung: string
  titel: string
  /** `kein-zitat` | `falsch-aufgeloest` | `dublette` — geschlossene Liste. Ein freier
   *  Grund würde das Verzeichnis in eine Erlaubnis verwandeln, alles zu entfernen. */
  grund: string
  /** Wo die Kennung steht und was dort wirklich steht. Ohne ihn wäre die Ablehnung
   *  eine Behauptung. */
  beleg: string
  wer: string
  am: string
  sitzung: string
}

/** Was aus dem Katalog zurückgenommen wurde. Steht auf der Fläche, weil ein
 *  Ablehnungsverzeichnis, das niemand sieht, keines ist: Ein Katalog, der still
 *  entfernen kann, ist nicht prüfbarer als einer, der still aufnimmt. */
export const ABGELEHNT = abgelehntRaw as unknown as Ablehnung[]

const ablehnungsGruende: Record<string, string> = {
  'kein-zitat': 'the identifier is there, but its occurrence is not a citation',
  'falsch-aufgeloest': 'the identifier resolves to a different work than the citing text names',
  dublette: 'the same work is already in the catalogue under another identifier',
}

export const ablehnungsGrundLabel = (g: string): string => ablehnungsGruende[g] ?? g

/** Anzeigename einer Praxis. Unbekannte Schlüssel zeigen sich wörtlich, statt dass die
 *  Seite eine Zugehörigkeit rät. */
const praxisNamen: Record<string, string> = {
  atelier: 'Atelier',
  field: 'Field',
  studio: 'Studio',
  // Meridian is the Field's own name for itself, not a second practice (wording canon). The
  // scout keys the two apart because they sat in different repos; a reader sees one practice.
  meridian: 'Field',
  // 2026-10-04: the nightly line (error-as-method), read by the scout again since its fork.
  // Named with its line since 2026-11-09: "Ulysses" alone next to "Atelier" read as a fifth
  // practice to anyone who does not know the history of the name.
  nightly: 'Ulysses (nightly line)',
  // 2026-11-04: the lab's other houses, read by the scout since that day.
  attention: 'Machine Attention',
  middle: 'The Middle',
  'n-1': 'n-1',
  arch: 'Arch',
  observatory: 'The State Before the Interface',
}
export const praxisLabel = (p: string): string => praxisNamen[p] ?? p

/** Klartext für den Aufnahmegrund. Er beantwortet „warum steht das hier?" in einem
 *  Halbsatz — die Fundstelle daneben belegt es. */
const gruendeText: Record<Aufnahmegrund, string> = {
  zitiert: 'cited in the practice’s own writing',
  kuratiert: 'held in the practice’s own reading list',
  nachbarschaft: 'found in the citation neighbourhood of an entry',
}
export const grundLabel = (g: Aufnahmegrund): string => gruendeText[g] ?? g

/** Wenn ein Urteil geschrieben wurde, ohne dass jemand festhielt WER — dann sagt die
 *  Fläche genau das. Ein nicht zugeordneter Satz ist etwas anderes als ein zugeordneter,
 *  und beides ist etwas anderes als ein Satz aus einer Praxis. Der Fall trat am
 *  2026-07-30 ein: 52 fertige Urteile lagen im Repo, geschrieben von einer Sitzung, die
 *  niemand mehr benennen konnte. Seither trägt die Urteilsdatei ihre Herkunft selbst. */
export const HERKUNFT_UNBEKANNT = new Set(['nicht festgehalten', 'unbekannt', ''])

export const urteilLabel = (u: Urteil | null | undefined): string => {
  if (!u) return 'written by a model — no record of which'
  const wer = HERKUNFT_UNBEKANNT.has(u.modell)
    ? 'a model whose identity was not recorded'
    : u.modell
  return `written by ${wer} on ${u.am}, from the ${u.grundlage}`
}

/** Klartext für den Prüfbefund. Ungeprüft heißt ungeprüft — nicht „nicht erreichbar". */
export const pruefLabel = (e: Pick<PaperEntry, 'geprueft' | 'pruef_status'>): string =>
  e.geprueft ? `access confirmed (HTTP ${e.pruef_status})` : 'access not yet confirmed'

/** Autorenzeile: bis zu drei Namen, danach „et al." — gekürzt, nicht erfunden. */
export const authorLine = (urheber: string[]): string => {
  if (urheber.length === 0) return 'author not stated'
  if (urheber.length <= 3) return urheber.join(', ')
  return `${urheber.slice(0, 3).join(', ')} et al.`
}

/** The key a practice is filtered by. Meridian and Field are one practice under two repo
 *  keys; the catalogue's facets and "cited by" lines show them once. */
export const practiceKey = (p: string): string => (p === 'meridian' ? 'field' : p)

/** The practices that cite an entry, each once, in the order the entry names them. */
export const citedBy = (e: Pick<PaperEntry, 'zitiert_von'>): string[] => [
  ...new Set(e.zitiert_von.map(practiceKey)),
]

// ── Read, or tested inside a work (2026-11-09) ───────────────────────────────────────────
//
// Measured on 2026-11-09: 2,978 of the 3,972 entries were found ONLY in the data folders of
// works — 2,342 in the Field's "The Dial" alone, 574 in "Does it know it is known". Those works
// tested thousands of identifiers as their material (resolution, retrieval); the identifiers
// are the experiment's sample, not the practice's reading. They filled the catalogue with
// "LIST OF FIGURES", "Chapter Nine" and dictionary headwords, under a page that says "what the
// practices actually read". The rule below separates them. It is the same test the scout
// already applies to ask such seeds last (pipelines/atlas-scout/src/atlas_scout/katalog.py,
// `_ist_datenablage`): a data folder, a data.json, or a .jsonl log. Nothing is deleted — the
// feeds keep every entry, and the page lists the works the references were tested in.

const isDataStore = (file: string): boolean => {
  const parts = file.toLowerCase().split('/')
  const last = parts[parts.length - 1] ?? ''
  return parts.slice(0, -1).includes('data') || last === 'data.json' || last.endsWith('.jsonl')
}

/** True when every place an entry was found is a data store of a work, never prose. */
export const isTestedInWork = (e: Pick<PaperEntry, 'fundstellen'>): boolean =>
  e.fundstellen.length > 0 && e.fundstellen.every(isDataStore)

/** The work a data-store finding belongs to: the path up to its data folder or file. */
export const workOfFinding = (file: string): string => {
  const parts = file.split('/')
  const i = parts.findIndex((p, k) => k < parts.length - 1 && p.toLowerCase() === 'data')
  return parts.slice(0, i >= 0 ? i : parts.length - 1).join('/')
}

const RANK: Record<RelevanceSource, number> = { praxis: 0, urteil: 1, gebrauch: 2 }
const titleKey = (e: PaperEntry): string | null => {
  const t = e.titel
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  // A short title ("Making", "Groups") is too common to prove two entries are one text.
  return t.length >= 20 && e.jahr ? `${t}|${e.jahr}` : null
}

/** One card per text. The scout keeps a DOI and a handle, or a preprint and its journal
 *  version, apart when their first authors are written differently ("Craig Batty" and "Craig
 *  Batty & Arezou Zalipour"); the page folds entries with the same full title and year into
 *  one, led by the DOI, and keeps every other identifier as "also". */
export const mergeSameText = (entries: PaperEntry[]): PaperEntry[] => {
  const byKey = new Map<string, PaperEntry[]>()
  const out: (PaperEntry | string)[] = []
  for (const e of entries) {
    const k = titleKey(e)
    if (!k) {
      out.push(e)
      continue
    }
    const group = byKey.get(k)
    if (group) group.push(e)
    else {
      byKey.set(k, [e])
      out.push(k)
    }
  }
  return out.map((x) => {
    if (typeof x !== 'string') return x
    const group = byKey.get(x)!
    if (group.length === 1) return group[0]
    const lead = group.find((e) => e.kennung.startsWith('10.')) ?? group[0]
    const best = [...group].sort((a, b) => RANK[a.relevanz_herkunft] - RANK[b.relevanz_herkunft])[0]
    const others = group.filter((e) => e !== lead)
    const dates = group.map((e) => e.zuletzt_gebraucht).filter((d): d is string => !!d).sort()
    return {
      ...lead,
      relevanz: best.relevanz,
      relevanz_herkunft: best.relevanz_herkunft,
      urteil: best.urteil,
      verify_status: group.some((e) => e.verify_status === 'verified') ? 'verified' : lead.verify_status,
      weitere_kennungen: [
        ...new Set([...(lead.weitere_kennungen ?? []), ...others.flatMap((e) => [e.kennung, ...(e.weitere_kennungen ?? [])])]),
      ].filter((k) => k !== lead.kennung),
      zitiert_von: [...new Set(group.flatMap((e) => e.zitiert_von))],
      fundstellen: [...new Set(group.flatMap((e) => e.fundstellen))],
      felder: [...new Set(group.flatMap((e) => e.felder))].sort((a, b) => a - b),
      frei_zugaenglich: group.some((e) => e.frei_zugaenglich),
      zuletzt_gebraucht: dates[dates.length - 1] ?? null,
    }
  })
}

/** What the practices read: the catalogue /papers shows. */
export const READING: PaperEntry[] = mergeSameText(PAPERS.filter((p) => !isTestedInWork(p)))

/** Identifiers a work tested as its material, kept in the feeds and summarised on the page. */
export const TESTED_IN_WORK: PaperEntry[] = PAPERS.filter(isTestedInWork)

/** The works those identifiers were tested in, largest first. */
export const testedInWorkSummary = (entries: PaperEntry[] = TESTED_IN_WORK) => {
  const m = new Map<string, number>()
  for (const e of entries) {
    for (const w of new Set(e.fundstellen.map(workOfFinding))) m.set(w, (m.get(w) ?? 0) + 1)
  }
  return [...m.entries()].map(([work, n]) => ({ work, n })).sort((a, b) => b.n - a.n)
}
