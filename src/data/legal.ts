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
      heading: 'Öffentliche Saat (/saat)',
      paragraphs: [
        'Unter /saat kannst du dieser Forschung eine Saat anbieten — Text, Art, Pseudonym und Adressat. Nimmt das Gate sie an, werden genau diese Angaben öffentlich im Register veröffentlicht (Git-versioniert, dauerhaft einsehbar) unter CC BY-NC-SA 4.0; mit dem Absenden stimmst du dieser Veröffentlichung zu (Art. 6 Abs. 1 lit. a DSGVO). Eine E-Mail-Adresse wird dabei ausdrücklich nicht erhoben.',
        'Zur Begrenzung der Einreichungen wird aus IP-Adresse und User-Agent ein Hash gebildet, der nur flüchtig im Arbeitsspeicher der Funktion existiert und nie gespeichert wird (Art. 6 Abs. 1 lit. f DSGVO). Die Bot-Prüfung übernimmt Cloudflare Turnstile; dabei gelten die Datenschutzhinweise von Cloudflare.',
        'Die Inhaltsprüfung übernimmt ein KI-Modell (aktuell gemini-2.5-flash-lite, Google AI Studio); der vollständige Prüftext ist auf /saat wörtlich veröffentlicht. Vom Gate blockierte Inhalte werden nicht gespeichert — erfasst wird nur ein Zähler je Ablehnungsgrund.',
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
      heading: 'Public seeding (/saat)',
      paragraphs: [
        'At /saat you can offer this research a seed — text, kind, pseudonym, and addressee. If the gate accepts it, exactly these fields are published in the public register (Git-versioned, permanently viewable) under CC BY-NC-SA 4.0; submitting constitutes consent to that publication (Art. 6(1)(a) GDPR). No email address is collected.',
        'To rate-limit submissions, IP address and user agent are hashed; the hash exists only ephemerally in the function’s memory and is never stored (Art. 6(1)(f) GDPR). Bot screening is done by Cloudflare Turnstile; Cloudflare’s own privacy notice applies to that check.',
        'Content review is done by a named AI model (currently gemini-2.5-flash-lite, Google AI Studio); the full review prompt is published verbatim on /saat. Content blocked by this gate is not stored — only a counter per rejection reason is kept.',
      ],
    },
    { heading: 'Your rights', paragraphs: ['Access, rectification, erasure, restriction, portability, objection, and the right to lodge a complaint with a supervisory authority.'] },
  ],
}

export const impressum: Record<Locale, LegalPage> = { de: impressumDe, en: impressumEn }
export const datenschutz: Record<Locale, LegalPage> = { de: datenschutzDe, en: datenschutzEn }
