// Die Protokoll-Version wird aus dem gespiegelten PROTOCOL.md ABGELEITET, nie hartkodiert
// (Aktualitäts-Regel, Frank 2026-07-25): am 24.07. sagten die Site-Seiten noch „v4",
// während die Praxis auf v5 lief — hartkodierte Versionsnummern driften zwangsläufig.
// Fail-loud statt Fallback: ein Spiegel ohne erkennbare Version ist ein Integrationsfehler,
// kein Anlass für eine stille Default-Zahl (Muster: lib/field/latest.ts).

export interface ProtocolInfo {
  /** e.g. '5' — from the mirrored constitution's own heading. */
  version: string
  /** e.g. '2026-07-24' — the adoption date, when the mirror states one. */
  adopted?: string
}

export function parseProtocol(raw: string): ProtocolInfo {
  const version = raw.match(/Research Protocol v(\d+)/)?.[1]
  if (!version) {
    throw new Error(
      'atelier/protocol-version: mirrored PROTOCOL.md carries no "Research Protocol vN" heading — mirror broken or format changed',
    )
  }
  const adopted = raw.match(/Adopted (\d{4}-\d{2}-\d{2})/)?.[1]
  return { version, adopted }
}
