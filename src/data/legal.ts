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
    // 2026-10-11, with the entrance's "since your last visit" (src/lib/ops/since.ts). The wording
    // follows the line proposed in the design handoff of that day; whether the opt-in satisfies
    // § 25 TDDDG as intended is for a lawyer to confirm, not for this file to assert.
    { heading: 'Startseite: „remember my visits“', paragraphs: ['Nur wenn du diese Funktion auf der Startseite einschaltest, speichert die Seite im lokalen Speicher deines Browsers einen Zeitstempel deines letzten Besuchs, um zu markieren, was seitdem neu ist. Er wird nicht an uns übertragen, es wird kein Cookie gesetzt, und ein weiterer Klick auf dieselbe Schaltfläche löscht ihn wieder. Ohne Einschalten wird nichts gespeichert.'] },
    {
      heading: 'Öffentliche Saat (/seed)',
      paragraphs: [
        'Unter /seed kannst du dieser Forschung eine Saat anbieten — Text, Art, Pseudonym und Adressat. Nimmt das Gate sie an, wird die Einreichung zunächst privat zur Sichtung vorgehalten (kurzfristiger Zwischenspeicher, kein öffentlicher Zugriff) und erst nach manueller Freigabe öffentlich im Register veröffentlicht (Git-versioniert, dauerhaft einsehbar) unter CC BY-NC-SA 4.0; wird sie nicht freigegeben, wird sie verworfen und nicht veröffentlicht. Mit dem Absenden stimmst du der Veröffentlichung im Falle der Freigabe zu (Art. 6 Abs. 1 lit. a DSGVO). Eine E-Mail-Adresse wird dabei ausdrücklich nicht erhoben.',
        'Zur Begrenzung der Einreichungen wird aus IP-Adresse und User-Agent ein Hash gebildet, der nur flüchtig im Arbeitsspeicher der Funktion existiert und nie gespeichert wird (Art. 6 Abs. 1 lit. f DSGVO). Die Bot-Prüfung übernimmt Cloudflare Turnstile; dabei gelten die Datenschutzhinweise von Cloudflare.',
        'Die Inhaltsprüfung übernimmt ein KI-Modell (aktuell gemini-2.5-flash-lite, Google AI Studio); der vollständige Prüftext ist auf /seed wörtlich veröffentlicht. Vom Gate blockierte Inhalte werden nicht gespeichert — erfasst wird nur ein Zähler je Ablehnungsgrund.',
      ],
    },
    {
      heading: 'Rezeption: Bewertungen und Notizen (/reception)',
      paragraphs: [
        'Unter jedem veröffentlichten Werk dieser Website kannst du eine Bewertung von 1 bis 5 abgeben und auf Wunsch eine Notiz (höchstens 600 Zeichen) mit einem frei gewählten Namen oder Kürzel (höchstens 60 Zeichen) hinterlassen. Gespeichert werden die Bewertung, Notiz und Name, sofern angegeben, das Werk und der Zeitpunkt, in einer Datenbank von Cloudflare (D1). Bewertung und Notiz sind sofort öffentlich sichtbar, unter dem Werk und auf /reception. Jede Nacht wird der öffentliche Teil als datierte Datei im öffentlichen Git-Archiv dieser Website festgehalten und den Forschungspraktiken in ihren eigenen öffentlichen Repositorien übergeben, wo sie ihn als Material lesen. Eine Notiz wird unter CC BY-NC-SA 4.0 veröffentlicht; mit dem Häkchen stimmst du der Veröffentlichung zu (Art. 6 Abs. 1 lit. a DSGVO). Eine E-Mail-Adresse wird nicht erhoben.',
        'Damit jedes Werk je Person und Tag nur einmal bewertet werden kann, wird aus IP-Adresse und User-Agent mit einem täglich neu erzeugten Zufallsschlüssel ein Hash gebildet und mit dem Werk und dem Tag gespeichert, ohne Uhrzeit. Schlüssel und Hashes eines Tages werden nach dessen Ende (UTC) gelöscht, spätestens in der folgenden Nacht. Dieselbe Technik zählt die Meldungen einer Notiz. IP-Adressen werden nicht gespeichert (Art. 6 Abs. 1 lit. f DSGVO; berechtigtes Interesse am Schutz vor Missbrauch). Die Datenbank hält für die Wiederherstellung frühere Stände bis zu 30 Tage vor, Schlüssel und Hashes eingeschlossen; darauf hat nur der Betreiber Zugriff. Nach diesen 30 Tagen lässt sich kein Hash mehr jemandem zuordnen. Für Besucherinnen und Besucher wird kein Cookie gesetzt.',
        'Die Bot-Prüfung übernimmt Cloudflare Turnstile; dabei gelten die Datenschutzhinweise von Cloudflare. Eine Notiz prüft vor der Veröffentlichung ein KI-Modell (aktuell gemini-2.5-flash-lite, Google AI Studio) allein auf Spam, Beleidigungen, personenbezogene Daten Dritter und an Maschinen gerichtete Anweisungen; der vollständige Prüftext steht wörtlich auf dem Formular. Abgelehnte Notizen werden nicht gespeichert, erfasst wird nur ein Zähler je Ablehnungsgrund. Drei Meldungen von verschiedenen Personen blenden eine Notiz aus, bis der Betreiber sie gelesen hat.',
        'Der Betreiber setzt auf seinen eigenen Geräten ein technisch notwendiges Cookie, das seine eigenen Notizen als seine kennzeichnet (§ 25 Abs. 2 Nr. 2 TDDDG). Es enthält keine Kennung und wird für niemanden sonst gesetzt. Einträge bleiben gespeichert, solange die Datenbank besteht; die nächtlichen Dateien bleiben samt Versionsgeschichte im Git-Archiv. Wer eine eigene Notiz entfernt haben möchte, schreibt formlos an hello@frankbueltge.de und nennt Werk und Datum. Die Entfernung wirkt für die Website und für künftige Stände des Archivs; ein Widerspruch nach Art. 21 DSGVO wird auch im Archiv umgesetzt.',
      ],
    },
    {
      heading: 'Kataloge (/papers, /datasets)',
      paragraphs: [
        'Die Kataloge verzeichnen Veröffentlichungen und Datensätze, auf die sich die Forschung dieser Ökologie stützt. Titel, Urheberinnen und Urheber, Erscheinungsjahr, Fundstelle und Zugriffsweg werden wörtlich aus den öffentlichen Schnittstellen der Quellkataloge übernommen.',
        'Damit werden personenbezogene Daten verarbeitet: die Namen der an einer Veröffentlichung beteiligten Personen. Rechtsgrundlage ist das berechtigte Interesse an einem nachprüfbaren wissenschaftlichen Nachweis (Art. 6 Abs. 1 lit. f DSGVO). Die Angaben sind von den Betroffenen selbst im wissenschaftlichen Kontext veröffentlicht worden; sie werden unverändert wiedergegeben, nicht angereichert, nicht mit anderen Quellen verknüpft und nicht zu Profilen verdichtet.',
        'Wer die Nennung des eigenen Namens nicht wünscht, kann der Verarbeitung widersprechen (Art. 21 DSGVO) — formlos per E-Mail an hello@frankbueltge.de unter Angabe des Eintrags. Der Eintrag wird dann entfernt. Dasselbe gilt für Hinweise auf fehlerhafte Angaben oder auf Einträge, die dort nicht hingehören.',
        'Frühere Stände wurden als versionierte Snapshots im öffentlichen Repositorium dataset-hub veröffentlicht und bestehen dort samt Versionsgeschichte fort. Eine Entfernung wirkt für künftige Stände; ein Widerspruch nach Art. 21 DSGVO wird auch im Archiv umgesetzt.',
      ],
    },
    {
      heading: 'Briefkasten & Kontaktformular (/post, /contact)',
      paragraphs: [
        'Über den Briefkasten des Postamts (/post) und das Kontaktformular (/contact) kannst du Nachrichten senden. Sie landen in einer privaten Warteschlange (Cloudflare Workers KV) und werden ausschließlich von mir gelesen — sie werden nicht veröffentlicht und nicht als Anweisung an ein KI-Modell weitergegeben. Die Angabe einer Kontaktmöglichkeit (z. B. E-Mail-Adresse) ist freiwillig und dient allein der Beantwortung deiner Nachricht (Art. 6 Abs. 1 lit. a DSGVO). Nachrichten werden nach Bearbeitung aus der Warteschlange gelöscht; eine Kontaktangabe gelangt zu keinem Zeitpunkt in das öffentliche Git-Archiv dieser Website.',
        'Zur Begrenzung der Einsendungen wird aus IP-Adresse und User-Agent ein Hash gebildet, der nur flüchtig im Arbeitsspeicher der Funktion existiert und nie gespeichert wird (Art. 6 Abs. 1 lit. f DSGVO). Die Bot-Prüfung übernimmt Cloudflare Turnstile; dabei gelten die Datenschutzhinweise von Cloudflare.',
        'Über den Eingang einer Nachricht wird der Betreiber per E-Mail benachrichtigt; diese Benachrichtigung enthält die Absender-Kennung und die Betreffzeile, nicht aber den Inhalt der Nachricht oder eine hinterlassene Kontaktangabe.',
      ],
    },
    {
      heading: 'E-Mail-Versand & Digest (Brevo)',
      paragraphs: [
        'Für den Versand von E-Mails — Antworten auf Nachrichten mit hinterlassener E-Mail-Adresse sowie den abonnierbaren Digest — nutze ich Brevo (Sendinblue GmbH, Köpenicker Str. 126, 10179 Berlin) als Auftragsverarbeiter (Art. 28 DSGVO). Die Verarbeitung findet in der EU statt.',
        'Der Digest ist ein unregelmäßiger Newsletter über neue Arbeiten dieser Website. Die Anmeldung läuft im Double-Opt-in-Verfahren: Deine Adresse wird erst nach Bestätigung per E-Mail in die Empfängerliste aufgenommen (Art. 6 Abs. 1 lit. a DSGVO). Jede E-Mail enthält einen Abmeldelink; mit der Abmeldung wird die Adresse aus der Liste entfernt. Die Adresse wird ausschließlich bei Brevo gespeichert — nie im öffentlichen Archiv dieser Website — und nicht an Dritte weitergegeben. Über eine bestätigte Anmeldung wird der Betreiber per E-Mail benachrichtigt.',
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
    { heading: 'Homepage: “remember my visits”', paragraphs: ['Only if you switch this feature on, on the homepage, does the page store a timestamp of your last visit in your browser’s local storage, to mark what is new since then. It is not transmitted to us, no cookie is set, and one more click on the same button deletes it. Unless you switch it on, nothing is stored.'] },
    {
      heading: 'Public seeding (/seed)',
      paragraphs: [
        'At /seed you can offer this research a seed — text, kind, pseudonym, and addressee. If the gate accepts it, the submission is first held privately for review (a short-lived holding store, no public access) and is published in the public register (Git-versioned, permanently viewable) under CC BY-NC-SA 4.0 only after manual approval; if it is not approved, it is discarded and never published. Submitting constitutes consent to publication in the event of approval (Art. 6(1)(a) GDPR). No email address is collected.',
        'To rate-limit submissions, IP address and user agent are hashed; the hash exists only ephemerally in the function’s memory and is never stored (Art. 6(1)(f) GDPR). Bot screening is done by Cloudflare Turnstile; Cloudflare’s own privacy notice applies to that check.',
        'Content review is done by a named AI model (currently gemini-2.5-flash-lite, Google AI Studio); the full review prompt is published verbatim on /seed. Content blocked by this gate is not stored — only a counter per rejection reason is kept.',
      ],
    },
    {
      heading: 'Reception: ratings and notes (/reception)',
      paragraphs: [
        'Below every work this website publishes you can give a rating from 1 to 5 and, if you like, leave a note (at most 600 characters) with a name or mark of your choice (at most 60 characters). The rating, the note and the name if given, the work and the time are stored in a Cloudflare database (D1). Rating and note are public at once, below the work and on /reception. Every night the public part is kept as a dated file in this website’s public Git archive and handed to the research practices in their own public repositories, where they read it as material. A note is published under CC BY-NC-SA 4.0; ticking the box is consent to its publication (Art. 6(1)(a) GDPR). No email address is collected.',
        'So that each work can be rated only once per person and day, IP address and user agent are hashed with a random key that is new every day, and the hash is stored with the work and the day, without the time. A day’s key and hashes are deleted after the day (UTC) is over, by the following night at the latest. The same technique counts the reports of a note. IP addresses are not stored (Art. 6(1)(f) GDPR; legitimate interest in protection against abuse). For recovery, the database keeps earlier states for up to 30 days, keys and hashes included; only the operator has access to them. After those 30 days no hash can be linked to anyone. No cookie is set for visitors.',
        'Bot screening is done by Cloudflare Turnstile; Cloudflare’s own privacy notice applies to that check. Before it is published, a note is checked by a named AI model (currently gemini-2.5-flash-lite, Google AI Studio) for spam, abuse, personal data of third parties and instructions addressed to machines, and for nothing else; the full prompt is published verbatim on the form. Refused notes are not stored; only a counter per refusal reason is kept. Three reports from different people hide a note until the operator has read it.',
        'On his own devices the operator sets a technically necessary cookie that marks his own notes as his (Section 25(2) no. 2 TDDDG). It carries no identifier and is set for nobody else. Entries are kept as long as the database exists; the nightly files remain in the Git archive with its version history. To have a note of your own removed, write informally to hello@frankbueltge.de, naming the work and the date. The removal takes effect for the website and for future states of the archive; an objection under Art. 21 GDPR is carried out in the archive as well.',
      ],
    },
    {
      heading: 'Catalogues (/papers, /datasets)',
      paragraphs: [
        'The catalogues record publications and datasets this ecology’s research relies on. Title, creators, year, source location and access route are reproduced verbatim from the public interfaces of the source catalogues.',
        'This means personal data is processed: the names of people involved in a publication. The legal basis is the legitimate interest in a verifiable scholarly record (Art. 6(1)(f) GDPR). The information was published by those people themselves in a scholarly context; it is reproduced unchanged, not enriched, not linked with other sources, and not compiled into profiles.',
        'Anyone who does not want their name listed can object to the processing (Art. 21 GDPR) — informally by email to hello@frankbueltge.de, naming the entry. The entry will then be removed. The same applies to reports of incorrect entries or entries that do not belong there.',
        'Earlier states were published as versioned snapshots in the public dataset-hub repository and remain there, including its version history. A removal takes effect for future states; an objection under Art. 21 GDPR is carried out in the archive as well.',
      ],
    },
    {
      heading: 'Letterbox & contact form (/post, /contact)',
      paragraphs: [
        'Through the post office letterbox (/post) and the contact form (/contact) you can send messages. They land in a private queue (Cloudflare Workers KV) and are read by me alone — they are not published and not fed to any AI model as instruction. Leaving a contact detail (e.g. an email address) is voluntary and serves solely to answer your message (Art. 6(1)(a) GDPR). Messages are deleted from the queue after handling; a contact detail never enters this website’s public Git archive.',
        'To rate-limit submissions, IP address and user agent are hashed; the hash exists only ephemerally in the function’s memory and is never stored (Art. 6(1)(f) GDPR). Bot screening is done by Cloudflare Turnstile; Cloudflare’s own privacy notice applies to that check.',
        'The operator is notified by email when a message arrives; that notification carries the sender mark and the regarding line, but neither the message text nor any contact detail left behind.',
      ],
    },
    {
      heading: 'Email dispatch & digest (Brevo)',
      paragraphs: [
        'For sending email — replies to messages that left an email address, and the subscribable digest — I use Brevo (Sendinblue GmbH, Köpenicker Str. 126, 10179 Berlin) as a processor (Art. 28 GDPR). Processing takes place in the EU.',
        'The digest is an irregular newsletter about new work on this site. Sign-up is double opt-in: your address joins the recipient list only after you confirm by email (Art. 6(1)(a) GDPR). Every mail carries an unsubscribe link; unsubscribing removes the address from the list. The address is stored at Brevo only — never in this website’s public archive — and is not shared with third parties. The operator is notified by email of a confirmed sign-up.',
      ],
    },
    { heading: 'Your rights', paragraphs: ['Access, rectification, erasure, restriction, portability, objection, and the right to lodge a complaint with a supervisory authority.'] },
  ],
}

export const impressum: Record<Locale, LegalPage> = { de: impressumDe, en: impressumEn }
export const datenschutz: Record<Locale, LegalPage> = { de: datenschutzDe, en: datenschutzEn }
