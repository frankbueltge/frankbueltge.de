import type { Locale } from '@/lib/site'

export type LegalPage = {
  metaTitle: string
  heading: string
  draftNote: string
  sections: { heading: string; paragraphs: string[] }[]
}

const impressumDe: LegalPage = {
  metaTitle: 'Impressum',
  heading: 'Impressum',
  draftNote:
    'ENTWURF: Platzhalter — vor Veröffentlichung durch echte Daten ersetzen und rechtlich prüfen lassen.',
  sections: [
    { heading: 'Angaben gemäß § 5 DDG', paragraphs: ['[Vollständiger Name]', '[Straße und Hausnummer]', '[PLZ und Ort]', '[Land]'] },
    { heading: 'Kontakt', paragraphs: ['E-Mail: [deine-adresse@frankbueltge.de]'] },
    { heading: 'Verantwortlich nach § 18 Abs. 2 MStV', paragraphs: ['[Vollständiger Name, Anschrift wie oben]'] },
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
  draftNote: 'DRAFT: placeholders — replace with real, legally reviewed details before going live.',
  sections: [
    { heading: 'Information pursuant to § 5 DDG', paragraphs: ['[Full name]', '[Street and number]', '[Postal code and city]', '[Country]'] },
    { heading: 'Contact', paragraphs: ['Email: [your-address@frankbueltge.de]'] },
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
  draftNote: 'ENTWURF/VORLAGE: beschreibt den technischen Stand, ist aber rechtlich zu prüfen, bevor sie live geht.',
  sections: [
    { heading: 'Verantwortlicher', paragraphs: ['[Vollständiger Name], [Anschrift], [E-Mail] — siehe Impressum.'] },
    { heading: 'Hosting', paragraphs: ['Gehostet über Cloudflare Pages (Cloudflare, Inc.). Beim Aufruf werden technisch notwendige Server-Logs verarbeitet (Art. 6 Abs. 1 lit. f DSGVO).'] },
    { heading: 'Schriftarten', paragraphs: ['Schriftarten werden lokal ausgeliefert (self-hosted). Keine Übertragung an Dritte.'] },
    { heading: 'Cookies & Reichweitenmessung', paragraphs: ['Diese Seite setzt keine Tracking-Cookies und kein geräteübergreifendes Tracking. Zur anonymen Reichweitenmessung kommt Cloudflare Web Analytics zum Einsatz — cookielos, ohne Fingerprinting und ohne personenbezogene Daten. Erfasst werden nur aggregierte Kennzahlen wie Seitenaufrufe, Referrer (Herkunft), Länder und Gerätetypen (Art. 6 Abs. 1 lit. f DSGVO).'] },
    { heading: 'Deine Rechte', paragraphs: ['Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch sowie Beschwerde bei einer Aufsichtsbehörde.'] },
  ],
}

const datenschutzEn: LegalPage = {
  metaTitle: 'Privacy Policy',
  heading: 'Privacy Policy',
  draftNote: 'DRAFT/TEMPLATE: reflects the technical setup but must be legally reviewed before going live.',
  sections: [
    { heading: 'Controller', paragraphs: ['[Full name], [address], [email] — see the imprint.'] },
    { heading: 'Hosting', paragraphs: ['Hosted on Cloudflare Pages (Cloudflare, Inc.). Technically necessary server logs are processed on access (Art. 6(1)(f) GDPR).'] },
    { heading: 'Fonts', paragraphs: ['Fonts are served locally (self-hosted). No data sent to third parties.'] },
    { heading: 'Cookies & analytics', paragraphs: ['This site sets no tracking cookies and does no cross-device tracking. For anonymous reach measurement it uses Cloudflare Web Analytics — cookieless, without fingerprinting and without personal data. Only aggregate metrics such as page views, referrers (origin), countries and device types are collected (Art. 6(1)(f) GDPR).'] },
    { heading: 'Your rights', paragraphs: ['Access, rectification, erasure, restriction, portability, objection, and the right to lodge a complaint with a supervisory authority.'] },
  ],
}

export const impressum: Record<Locale, LegalPage> = { de: impressumDe, en: impressumEn }
export const datenschutz: Record<Locale, LegalPage> = { de: datenschutzDe, en: datenschutzEn }
