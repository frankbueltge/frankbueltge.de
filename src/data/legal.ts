import type { Locale } from '@/lib/site'

export type LegalPage = {
  metaTitle: string
  heading: string
  draftNote?: string
  sections: { heading: string; paragraphs: string[] }[]
}

const impressumDe: LegalPage = {
  metaTitle: 'Impressum',
  heading: 'Impressum',
  sections: [
    { heading: 'Angaben gemäß § 5 DDG', paragraphs: ['Frank Bueltge', 'c/o Autorenglück #98451', 'Albert-Einstein-Str. 47', '02977 Hoyerswerda', 'Deutschland'] },
    { heading: 'Kontakt', paragraphs: ['E-Mail: hello@frankbueltge.de'] },
    { heading: 'Verantwortlich nach § 18 Abs. 2 MStV', paragraphs: ['Frank Bueltge', 'Anschrift wie oben'] },
    {
      heading: 'Haftung für Inhalte und Links',
      paragraphs: [
        'Inhalte wurden mit größter Sorgfalt erstellt; für Richtigkeit, Vollständigkeit und Aktualität wird keine Gewähr übernommen.',
        'Für Inhalte verlinkter externer Seiten (u. a. data-snack.com, datavism.org, LinkedIn) ist der jeweilige Anbieter verantwortlich.',
      ],
    },
  ],
}

const impressumEn: LegalPage = {
  metaTitle: 'Imprint',
  heading: 'Imprint',
  sections: [
    { heading: 'Information pursuant to § 5 DDG', paragraphs: ['Frank Bueltge', 'c/o Autorenglück #98451', 'Albert-Einstein-Str. 47', '02977 Hoyerswerda', 'Germany'] },
    { heading: 'Contact', paragraphs: ['Email: hello@frankbueltge.de'] },
    { heading: 'Responsible for content pursuant to § 18 (2) MStV', paragraphs: ['Frank Bueltge', 'address as above'] },
    {
      heading: 'Liability for content and links',
      paragraphs: [
        'Content was created with the greatest care; no guarantee is given for accuracy, completeness or timeliness.',
        'The respective provider is responsible for the content of linked external sites (incl. data-snack.com, datavism.org, LinkedIn).',
      ],
    },
  ],
}

const datenschutzDe: LegalPage = {
  metaTitle: 'Datenschutzerklärung',
  heading: 'Datenschutzerklärung',
  sections: [
    { heading: 'Verantwortlicher', paragraphs: ['Frank Bueltge, c/o Autorenglück #98451, Albert-Einstein-Str. 47, 02977 Hoyerswerda. E-Mail: hello@frankbueltge.de — siehe Impressum.'] },
    { heading: 'Hosting', paragraphs: ['Gehostet über Cloudflare Pages (Cloudflare, Inc.). Beim Aufruf werden technisch notwendige Server-Logs verarbeitet (Art. 6 Abs. 1 lit. f DSGVO).'] },
    { heading: 'Schriftarten', paragraphs: ['Schriftarten werden lokal ausgeliefert (self-hosted). Keine Übertragung an Dritte.'] },
    { heading: 'Cookies & Reichweitenmessung', paragraphs: ['Diese Seite setzt keine Tracking-Cookies und kein geräteübergreifendes Tracking. Zur anonymen Reichweitenmessung kommt Umami zum Einsatz — cookielos, ohne Fingerprinting und ohne personenbezogene Profile. Umami wird first-party über einen Proxy auf dieser Domain ausgeliefert (Endpunkt /stats), sodass der Browser keine Drittanbieter-Anfrage stellt; der Proxy leitet die aggregierten Zugriffsdaten serverseitig an eine selbst betriebene Umami-Instanz auf eigener EU-Infrastruktur (Frankfurt, Vercel + Neon) weiter — kein Drittland-Transfer. Erfasst werden nur aggregierte Kennzahlen wie Seitenaufrufe, Referrer (Herkunft), Länder und Gerätetypen; die IP-Adresse wird zur Länderbestimmung übertragen und nur gehasht verarbeitet, nicht gespeichert (Art. 6 Abs. 1 lit. f DSGVO).'] },
    {
      heading: 'Öffentliche Saat (/seed)',
      paragraphs: [
        'Unter /seed kannst du dieser Forschung eine Saat anbieten — Text, Art, Pseudonym und Adressat. Nimmt das Gate sie an, wird die Einreichung zunächst privat zur Sichtung vorgehalten (kurzfristiger Zwischenspeicher, kein öffentlicher Zugriff) und erst nach manueller Freigabe öffentlich im Register veröffentlicht (Git-versioniert, dauerhaft einsehbar) unter CC BY-NC-SA 4.0; wird sie nicht freigegeben, wird sie verworfen und nicht veröffentlicht. Mit dem Absenden stimmst du der Veröffentlichung im Falle der Freigabe zu (Art. 6 Abs. 1 lit. a DSGVO). Eine E-Mail-Adresse wird dabei ausdrücklich nicht erhoben.',
        'Zur Begrenzung der Einreichungen wird aus IP-Adresse und User-Agent ein Hash gebildet, der nur flüchtig im Arbeitsspeicher der Funktion existiert und nie gespeichert wird (Art. 6 Abs. 1 lit. f DSGVO). Die Bot-Prüfung übernimmt Cloudflare Turnstile; dabei gelten die Datenschutzhinweise von Cloudflare.',
        'Die Inhaltsprüfung übernimmt ein KI-Modell (aktuell gemini-2.5-flash-lite, Google AI Studio); der vollständige Prüftext ist auf /seed wörtlich veröffentlicht. Vom Gate blockierte Inhalte werden nicht gespeichert — erfasst wird nur ein Zähler je Ablehnungsgrund.',
      ],
    },
    {
      heading: 'Dataset Register (/datasets)',
      paragraphs: [
        'Das Dataset Register weist Datensätze nach, auf die sich die Forschung dieser Ökologie tatsächlich stützt. Die Angaben stammen aus den öffentlichen Schnittstellen der Quellkataloge und werden wörtlich übernommen — Titel, Herausgeber, Erscheinungsjahr, Lizenz, Zugriffsweg sowie die Namen der Urheberinnen und Urheber.',
        'Am 27. Juli 2026 wurde das Register auf Null zurückgebaut: Der bis dahin veröffentlichte Bestand von 16.516 Einträgen — darunter 20.082 Personennamen und 15.240 ORCID-Kennungen — ist von dieser Website vollständig entfernt worden, ebenso die zugehörigen 8.590 Einzelseiten. Der Neuaufbau erfolgt kuratiert und in kleinem Umfang; jeder Eintrag wird einzeln begründet.',
        'Soweit dabei personenbezogene Daten verarbeitet werden — die Namen der an einem Datensatz beteiligten Personen —, ist Rechtsgrundlage das berechtigte Interesse an einem nachprüfbaren wissenschaftlichen Nachweis (Art. 6 Abs. 1 lit. f DSGVO). Die Angaben sind von den Betroffenen selbst im wissenschaftlichen Kontext veröffentlicht worden; sie werden unverändert wiedergegeben, nicht angereichert, nicht mit anderen Quellen verknüpft und nicht zu Profilen verdichtet.',
        'Wer die Nennung des eigenen Namens im Register nicht wünscht, kann der Verarbeitung widersprechen (Art. 21 DSGVO) — formlos per E-Mail an hello@frankbueltge.de unter Angabe des Eintrags. Der Eintrag wird dann aus dem veröffentlichten Bestand entfernt. Dasselbe gilt für Hinweise auf fehlerhafte Angaben oder auf Einträge, die dort nicht hingehören.',
        'Die früheren Stände des Registers wurden als versionierte Snapshots im zugehörigen öffentlichen Code-Repositorium (dataset-hub) veröffentlicht und bestehen dort als Archiv fort — ebenso in dessen Versionsgeschichte. Eine Entfernung wirkt für künftige Stände; auf den Fortbestand der Archivstände wird hier ausdrücklich hingewiesen. Ein Widerspruch nach Art. 21 DSGVO wird auch dort umgesetzt.',
      ],
    },
    { heading: 'Deine Rechte', paragraphs: ['Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch sowie Beschwerde bei einer Aufsichtsbehörde.'] },
  ],
}

const datenschutzEn: LegalPage = {
  metaTitle: 'Privacy Policy',
  heading: 'Privacy Policy',
  sections: [
    { heading: 'Controller', paragraphs: ['Frank Bueltge, c/o Autorenglück #98451, Albert-Einstein-Str. 47, 02977 Hoyerswerda. Email: hello@frankbueltge.de — see the imprint.'] },
    { heading: 'Hosting', paragraphs: ['Hosted on Cloudflare Pages (Cloudflare, Inc.). Technically necessary server logs are processed on access (Art. 6(1)(f) GDPR).'] },
    { heading: 'Fonts', paragraphs: ['Fonts are served locally (self-hosted). No data sent to third parties.'] },
    { heading: 'Cookies & analytics', paragraphs: ['This site sets no tracking cookies and does no cross-device tracking. For anonymous reach measurement it uses Umami — cookieless, without fingerprinting and without personal profiles. Umami is served first-party through a proxy on this domain (the /stats endpoint), so the browser makes no third-party request; the proxy forwards the aggregated request data server-side to our own self-hosted Umami instance on EU infrastructure (Frankfurt, Vercel + Neon) — no third-country transfer. Only aggregate metrics such as page views, referrers (origin), countries and device types are collected; the IP address is transmitted for country lookup and processed only in hashed form, not stored (Art. 6(1)(f) GDPR).'] },
    {
      heading: 'Public seeding (/seed)',
      paragraphs: [
        'At /seed you can offer this research a seed — text, kind, pseudonym, and addressee. If the gate accepts it, the submission is first held privately for review (a short-lived holding store, no public access) and is published in the public register (Git-versioned, permanently viewable) under CC BY-NC-SA 4.0 only after manual approval; if it is not approved, it is discarded and never published. Submitting constitutes consent to publication in the event of approval (Art. 6(1)(a) GDPR). No email address is collected.',
        'To rate-limit submissions, IP address and user agent are hashed; the hash exists only ephemerally in the function’s memory and is never stored (Art. 6(1)(f) GDPR). Bot screening is done by Cloudflare Turnstile; Cloudflare’s own privacy notice applies to that check.',
        'Content review is done by a named AI model (currently gemini-2.5-flash-lite, Google AI Studio); the full review prompt is published verbatim on /seed. Content blocked by this gate is not stored — only a counter per rejection reason is kept.',
      ],
    },
    {
      heading: 'Dataset Register (/datasets)',
      paragraphs: [
        'The Dataset Register records datasets this ecology’s research actually relies on. Its entries come from the public interfaces of source catalogues and are reproduced verbatim — title, publisher, year, licence, access route, together with the names of the creators.',
        'On 27 July 2026 the register was rolled back to zero: the holding published until then — 16,516 entries, among them 20,082 personal names and 15,240 ORCID identifiers — was removed from this website in full, along with the 8,590 individual pages that carried it. It is being rebuilt curated and small, with every entry justified one at a time.',
        'Where personal data is processed in the course of this — the names of people involved in a dataset — the legal basis is the legitimate interest in a verifiable scholarly record (Art. 6(1)(f) GDPR). The information was published by those people themselves in a scholarly context; it is reproduced unchanged, not enriched, not linked with other sources, and not compiled into profiles.',
        'Anyone who does not want their name listed can object to the processing (Art. 21 GDPR) — informally by email to hello@frankbueltge.de, naming the entry. The entry will then be removed from the published record. The same applies to reports of incorrect entries or entries that do not belong there.',
        'Earlier states of the register were published as versioned snapshots in the associated public code repository (dataset-hub) and remain there as an archive, as do earlier states in its version history. A removal takes effect for future states; the persistence of the archived ones is stated here explicitly. An objection under Art. 21 GDPR is carried out there as well.',
      ],
    },
    { heading: 'Your rights', paragraphs: ['Access, rectification, erasure, restriction, portability, objection, and the right to lodge a complaint with a supervisory authority.'] },
  ],
}

export const impressum: Record<Locale, LegalPage> = { de: impressumDe, en: impressumEn }
export const datenschutz: Record<Locale, LegalPage> = { de: datenschutzDe, en: datenschutzEn }
