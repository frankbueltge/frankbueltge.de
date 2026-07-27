// Die dreizehn Felder der gemeinsamen Themenkarte — eine Quelle für alle Flächen.
//
// Die Nummern sind BINDEND. Sie stehen genauso in
// `pipelines/atlas-scout/src/atlas_scout/themen.py` (dort mit den Suchbegriffen, die den
// Scout steuern) und landen als `clusters` im Werke-Atlas bzw. als `felder` im
// Paper-Katalog. Wer hier eine Nummer ändert, ändert die Karte — und muss themen.py
// mitziehen.
//
// Warum ausgelagert (2026-07-27): Die Labels standen inline in AtlasPage.astro. Mit dem
// Paper-Katalog kam eine zweite Fläche dazu, die dieselben Felder benennt — und eine
// Kopie wäre die erste, die still veraltet. Genau davor warnt die Design-Notiz zum
// Rückbau (§3): Das alte Relevanzkriterium scheiterte auch daran, dass es eine VERALTETE
// Fassung der Themenkarte kannte und die Erweiterung um die Felder 8–13 nie bekam.
//
// Felder 1–7 kartieren Daten, KI und Macht (erste Fassung 2026). Felder 8–13 sind die
// Erweiterung vom 2026-07-25: Datenkunst, die nicht von Macht handelt.

export const THEMEN_LABELS_EN: Record<number, string> = {
  1: 'Material & planetary AI cost',
  2: 'AI in war / kill cloud',
  3: 'Counter-forensics / OSINT',
  4: 'Provenance / authenticity',
  5: 'Decolonial / more-than-human',
  6: 'Data justice / data feminism',
  7: 'AI self-consumption / quantum',
  8: 'Perception & scale',
  9: 'Time & archive',
  10: 'Error & noise',
  11: 'Body & intimacy',
  12: 'Language & generativity',
  13: 'Material & senses',
}

export const THEMEN_LABELS_DE: Record<number, string> = {
  1: 'Material- & planetare KI-Kosten',
  2: 'KI im Krieg / Kill Cloud',
  3: 'Counter-Forensics / OSINT',
  4: 'Provenance / Authentizität',
  5: 'Dekolonial / more-than-human',
  6: 'Data Justice / Data-Feminismus',
  7: 'KI-Selbstverzehr / Quanten',
  8: 'Wahrnehmung & Maßstab',
  9: 'Zeit & Archiv',
  10: 'Fehler & Rauschen',
  11: 'Körper & Intimität',
  12: 'Sprache & Generativität',
  13: 'Material & Sinne',
}

/** Die Site ist English-only; dies ist die Fassung, die Flächen ohne Locale-Umschaltung
 *  benutzen. AtlasPage hält seine eigene Umschaltung, solange sie dort noch steht. */
export const THEMEN_LABELS = THEMEN_LABELS_EN

/** Drei Familien, damit die Karte bei dreizehn Feldern lesbar bleibt. */
export const FAMILIE: Record<number, string> = {
  1: 'macht', 2: 'macht', 3: 'macht', 4: 'macht', 5: 'macht', 6: 'macht', 7: 'macht',
  8: 'erkenntnis', 9: 'erkenntnis', 10: 'erkenntnis',
  11: 'ausdruck', 12: 'ausdruck', 13: 'ausdruck',
}

export const FAMILIE_LABEL_EN: Record<string, string> = {
  macht: 'power',
  erkenntnis: 'knowing',
  ausdruck: 'expression',
}

export const FAMILIE_LABEL_DE: Record<string, string> = {
  macht: 'Macht',
  erkenntnis: 'Erkenntnis',
  ausdruck: 'Ausdruck',
}
