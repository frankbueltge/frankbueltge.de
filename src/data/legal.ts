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
    // 2026-11-14 (legal review; AI Act Art. 50(4) applies since 2026-08-02): the machine-made pages say so
    // at their foot (src/lib/engines/legal-line.ts), and the imprint says it once for the whole site.
    {
      heading: 'KI-erzeugte Inhalte',
      paragraphs: [
        'Die Werke, Präsentationen und Berichte der maschinell betriebenen Forschungspraktiken dieser Website (The Atelier, The Field, The Studio, Machine Attention, n-1, Error as Method und Arch) werden von einem KI-System selbstständig recherchiert, geschrieben und gebaut und so veröffentlicht, wie das System sie hinterlassen hat. Sie werden vor der Veröffentlichung nicht von einem Menschen redigiert. Ihre Seiten sagen das an ihrem Fuß. Für Hinweise auf Fehler oder auf Inhalte, die Rechte verletzen: hello@frankbueltge.de.',
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
    {
      heading: 'AI-generated content',
      paragraphs: [
        'The works, presentations and reports of the machine-run research practices on this website (The Atelier, The Field, The Studio, Machine Attention, n-1, Error as Method and Arch) are researched, written and built by an AI system working autonomously, and are published as the system left them. No person edits them before publication. Their pages say so at their foot. To report an error, or content that infringes rights: hello@frankbueltge.de.',
      ],
    },
  ],
}

const datenschutzDe: LegalPage = {
  metaTitle: 'Datenschutzerklärung',
  heading: 'Datenschutzerklärung',
  sections: [
    { heading: 'Verantwortlicher', paragraphs: ['Frank Bueltge, c/o Autorenglück #98451, Albert-Einstein-Str. 47, 02977 Hoyerswerda. E-Mail: hello@frankbueltge.de — siehe Impressum.'] },
    {
      heading: 'Hosting',
      paragraphs: [
        'Gehostet über Cloudflare Pages (Cloudflare, Inc., USA). Beim Aufruf werden technisch notwendige Server-Logs verarbeitet (Art. 6 Abs. 1 lit. f DSGVO).',
        // 2026-11-14: the audience file of /trending (pipelines/trending, trending-audience/2) was not named here.
        'Für /trending liest ein nächtlicher Lauf zusätzlich Cloudflares zusammengefasste Zugriffsstatistik (Anfragen je Land, verweisende Hosts und die Art des abrufenden Programms, etwa Suchmaschine oder Browser) und veröffentlicht diese Summen auf der Seite. IP-Adressen oder Kennungen einzelner Besuche werden dabei weder gelesen noch gespeichert.',
      ],
    },
    { heading: 'Schriftarten', paragraphs: ['Schriftarten werden lokal ausgeliefert (self-hosted). Keine Übertragung an Dritte. Das gilt auch für die Werke der Forschungspraktiken: Verweise auf fremde Schrift-Dienste (etwa Google Fonts) werden beim Bau der Website aus ihren Seiten entfernt.'] },
    { heading: 'Cookies & Reichweitenmessung', paragraphs: ['Diese Seite setzt keine Tracking-Cookies und kein geräteübergreifendes Tracking. Zur anonymen Reichweitenmessung kommt Umami zum Einsatz — cookielos, ohne Fingerprinting und ohne personenbezogene Profile. Umami wird first-party über einen Proxy auf dieser Domain ausgeliefert (Endpunkt /stats), sodass der Browser keine Drittanbieter-Anfrage stellt; der Proxy leitet die aggregierten Zugriffsdaten serverseitig an eine selbst betriebene Umami-Instanz auf eigener EU-Infrastruktur (Frankfurt, Vercel + Neon) weiter — kein Drittland-Transfer. Erfasst werden nur aggregierte Kennzahlen wie Seitenaufrufe, Referrer (Herkunft), Länder und Gerätetypen; die IP-Adresse wird zur Länderbestimmung übertragen und nur gehasht verarbeitet, nicht gespeichert (Art. 6 Abs. 1 lit. f DSGVO).'] },
    // 2026-10-11, with the entrance's "since your last visit" (src/lib/ops/since.ts). The wording
    // follows the line proposed in the design handoff of that day; whether the opt-in satisfies
    // § 25 TDDDG as intended is for a lawyer to confirm, not for this file to assert.
    { heading: 'Startseite: „remember my visits“', paragraphs: ['Nur wenn du diese Funktion auf der Startseite einschaltest, speichert die Seite im lokalen Speicher deines Browsers einen Zeitstempel deines letzten Besuchs, um zu markieren, was seitdem neu ist. Er wird nicht an uns übertragen, es wird kein Cookie gesetzt, und ein weiterer Klick auf dieselbe Schaltfläche löscht ihn wieder. Ohne Einschalten wird nichts gespeichert.'] },
    // 2026-11-14, after a legal review of the site: what the browser keeps besides the visit stamp, and
    // which works make the browser ask a third party directly. The list of services is a dated state.
    {
      heading: 'Lokaler Speicher deines Browsers',
      paragraphs: [
        'Wenn du die helle oder dunkle Ansicht umschaltest, merkt sich dein Browser diese Wahl in seinem lokalen Speicher. Unter /analytics-opt-out kannst du die Reichweitenmessung für deinen Browser abschalten; auch dieser Schalter ist ein Eintrag im lokalen Speicher. Einige Werke der Forschungspraktiken legen dort ihren eigenen Zustand ab, zum Beispiel was du in einem Werk schon geöffnet oder eingegeben hast oder welchen Stand du zuletzt gesehen hast. Nichts davon wird an uns übertragen, es wird kein Cookie gesetzt, und du kannst die Einträge jederzeit über die Website-Daten deines Browsers löschen.',
      ],
    },
    {
      heading: 'Werke, die Inhalte bei Dritten abrufen',
      paragraphs: [
        'Einige Werke lesen die Welt, während du sie ansiehst. Dein Browser fragt dann nicht nur diese Website, sondern unmittelbar den Dienst, von dem die Daten oder Bilder stammen. Dieser Dienst erfährt dabei deine IP-Adresse, die üblichen Angaben einer Browser-Anfrage (etwa den Browser-Typ) und dass die Anfrage von dieser Website kommt. Wir setzen dabei kein Cookie und geben keine weiteren Daten weiter. Rechtsgrundlage ist das berechtigte Interesse, eine Quelle unmittelbar und unverändert zu zeigen (Art. 6 Abs. 1 lit. f DSGVO). Für die Verarbeitung beim jeweiligen Dienst gelten dessen eigene Datenschutzhinweise.',
        'Stand 14. November 2026 betrifft das: Spread (/spread) verbindet deinen Browser beim Öffnen der Seite mit den öffentlichen Kursdaten-Schnittstellen der Handelsplätze Coinbase, Kraken, Bitstamp und Binance. Comma (/comma) lädt, sobald du das Zuhören startest, die Testlisten des Citizen Lab von GitHub (raw.githubusercontent.com); die Messdaten von OONI holt dagegen diese Website für dich. Die Seite /seed lädt das Register der Saaten ebenfalls von GitHub. Einige Werke des Studios zeigen Fotos aus den offenen Daten von iNaturalist, die bei Amazon Web Services liegen, und lesen Wetterwarnungen beim Iowa Environmental Mesonet der Iowa State University (USA).',
        'Die Forschungspraktiken veröffentlichen laufend neue Werke. Ein Werk, das Daten bei Dritten abruft, nennt den Dienst in der Regel bei seinen Quellenangaben. Skripte fremder Anbieter laufen auf dieser Website nirgends.',
      ],
    },
    {
      heading: 'Öffentliche Saat (/seed)',
      paragraphs: [
        'Unter /seed kannst du dieser Forschung eine Saat anbieten — Text, Art, Pseudonym und Adressat. Nimmt das Gate sie an, wird die Einreichung zunächst privat zur Sichtung vorgehalten (kurzfristiger Zwischenspeicher, kein öffentlicher Zugriff) und erst nach manueller Freigabe öffentlich im Register veröffentlicht (Git-versioniert, dauerhaft einsehbar) unter CC BY-NC-SA 4.0; wird sie nicht freigegeben, wird sie verworfen und nicht veröffentlicht. Mit dem Absenden stimmst du der Veröffentlichung im Falle der Freigabe zu (Art. 6 Abs. 1 lit. a DSGVO). Eine E-Mail-Adresse wird dabei ausdrücklich nicht erhoben.',
        'Zur Begrenzung der Einreichungen wird aus IP-Adresse und User-Agent ein Hash gebildet, der nur flüchtig im Arbeitsspeicher der Funktion existiert und nie gespeichert wird (Art. 6 Abs. 1 lit. f DSGVO). Die Bot-Prüfung übernimmt Cloudflare Turnstile; dabei gelten die Datenschutzhinweise von Cloudflare.',
        'Die Inhaltsprüfung übernimmt ein KI-Modell (aktuell gemini-2.5-flash-lite, Google AI Studio); der vollständige Prüftext ist auf /seed wörtlich veröffentlicht. Vom Gate blockierte Inhalte werden nicht gespeichert — erfasst wird nur ein Zähler je Ablehnungsgrund.',
        'Über eine eingegangene Saat wird der Betreiber per E-Mail benachrichtigt; die Benachrichtigung nennt Art, Adressat und Pseudonym, nicht aber den Text.',
      ],
    },
    {
      heading: 'Rezeption: Bewertungen und Notizen (/reception)',
      paragraphs: [
        'Unter jedem veröffentlichten Werk dieser Website kannst du eine Bewertung von 1 bis 5 abgeben und auf Wunsch eine Notiz (höchstens 600 Zeichen) mit einem frei gewählten Namen oder Kürzel (höchstens 60 Zeichen) hinterlassen. Gespeichert werden die Bewertung, Notiz und Name, sofern angegeben, das Werk und der Zeitpunkt, in einer Datenbank von Cloudflare (D1). Bewertung und Notiz sind sofort öffentlich sichtbar, unter dem Werk und auf /reception. Jede Nacht wird der öffentliche Teil als datierte Datei im öffentlichen Git-Archiv dieser Website festgehalten und den Forschungspraktiken in ihren eigenen öffentlichen Repositorien übergeben, wo sie ihn als Material lesen. Eine Notiz wird unter CC BY-NC-SA 4.0 veröffentlicht; mit dem Häkchen stimmst du der Veröffentlichung zu (Art. 6 Abs. 1 lit. a DSGVO). Eine E-Mail-Adresse wird nicht erhoben.',
        'Damit jedes Werk je Person und Tag nur einmal bewertet werden kann, wird aus IP-Adresse und User-Agent mit einem täglich neu erzeugten Zufallsschlüssel ein Hash gebildet und mit dem Werk und dem Tag gespeichert, ohne Uhrzeit. Schlüssel und Hashes eines Tages werden nach dessen Ende (UTC) gelöscht, spätestens am folgenden Tag. Dieselbe Technik zählt die Meldungen einer Notiz. IP-Adressen werden nicht gespeichert (Art. 6 Abs. 1 lit. f DSGVO; berechtigtes Interesse am Schutz vor Missbrauch). Die Datenbank hält für die Wiederherstellung frühere Stände bis zu 30 Tage vor, Schlüssel und Hashes eingeschlossen; darauf hat nur der Betreiber Zugriff. Nach diesen 30 Tagen lässt sich kein Hash mehr jemandem zuordnen. Für Besucherinnen und Besucher wird kein Cookie gesetzt.',
        'Die Bot-Prüfung übernimmt Cloudflare Turnstile; dabei gelten die Datenschutzhinweise von Cloudflare. Eine Notiz prüft vor der Veröffentlichung ein KI-Modell (aktuell gemini-2.5-flash-lite, Google AI Studio) allein auf Spam, Beleidigungen, personenbezogene Daten Dritter und an Maschinen gerichtete Anweisungen; der vollständige Prüftext steht wörtlich auf dem Formular. Abgelehnte Notizen werden nicht gespeichert, erfasst wird nur ein Zähler je Ablehnungsgrund. Drei Meldungen von verschiedenen Personen blenden eine Notiz aus, bis der Betreiber sie gelesen hat.',
        'Der Betreiber setzt auf seinen eigenen Geräten ein technisch notwendiges Cookie, das seine eigenen Notizen als seine kennzeichnet (§ 25 Abs. 2 Nr. 2 TDDDG). Es enthält keine Kennung und wird für niemanden sonst gesetzt. Einträge bleiben gespeichert, solange die Datenbank besteht; die nächtlichen Dateien bleiben samt Versionsgeschichte im Git-Archiv. Wer eine eigene Notiz entfernt haben möchte, schreibt formlos an hello@frankbueltge.de und nennt Werk und Datum. Die Entfernung wirkt für die Website und für künftige Stände des Archivs; ein Widerspruch nach Art. 21 DSGVO wird auch im Archiv umgesetzt.',
        'Über eine neue Bewertung wird der Betreiber per E-Mail benachrichtigt, höchstens zehnmal am Tag; die Benachrichtigung nennt Werk und Punktzahl und ob eine Notiz dabei ist, nicht aber Notiz oder Namen. Einmal am Tag erhält er außerdem die Zahl der Bewertungen des Vortags je Werk.',
      ],
    },
    {
      heading: 'Third Reading (/third-reading)',
      paragraphs: [
        'Unter /third-reading kannst du die Themen eines Lagebilds der Forschungsökologie paarweise nach Dringlichkeit beurteilen und einige Größenordnungen schätzen. Mitmachen ist freiwillig und setzt deine Einwilligung voraus, die du vor der ersten Wahl erteilst (Art. 6 Abs. 1 lit. a DSGVO); teilnehmen darf, wer 16 Jahre oder älter ist. Gesendet wird erst, wenn du am Ende ausdrücklich auf „Add my reading to the record“ drückst; erst dann startet auch die Bot-Prüfung. Bis dahin verlässt nichts deinen Browser, und ein Abbruch speichert nichts.',
        'Gespeichert werden deine Wahlen und Schätzungen, wie lange jede gedauert hat, der Tag (nicht die Uhrzeit), die Fassung des Einwilligungstextes und ob du die Auswertung der Seite während desselben Besuchs vor dem Absenden geöffnet hast, unter einer zufälligen Kennung in einer Datenbank von Cloudflare (D1). Nicht gespeichert werden IP-Adresse, Cookie, Konto oder irgendetwas, das eine Lesung dir oder einem anderen Besuch zuordnet. Veröffentlicht werden die Lesungen als offene Daten (CC0) im öffentlichen Git-Archiv dieser Website, und zwar erst nach Ablauf ihres Tages, nur in Paketen von mindestens fünf und ohne den Tag, sodass sich keine Lesung dem Zeitpunkt ihrer Abgabe zuordnen lässt.',
        'Damit je Person und Tag nur eine Lesung je Runde gezählt wird und eine Adresse höchstens drei Lesungen am Tag abgeben kann, werden aus IP-Adresse und User-Agent sowie aus der IP-Adresse allein mit einem täglich neu erzeugten Zufallsschlüssel Hashes gebildet. Schlüssel und Hashes eines Tages werden spätestens am folgenden Tag gelöscht, danach lässt sich kein Hash mehr jemandem zuordnen (Art. 6 Abs. 1 lit. f DSGVO; berechtigtes Interesse am Schutz vor Mehrfach- und Missbrauchseinsendungen). Die Datenbank hält für die Wiederherstellung frühere Stände bis zu 30 Tage vor; darauf hat nur der Betreiber Zugriff. Die Bot-Prüfung übernimmt Cloudflare Turnstile; dabei gelten die Datenschutzhinweise von Cloudflare.',
        'Weil eine gespeicherte Lesung keinerlei Bezug zu deiner Person enthält, kann sie dir nachträglich nicht mehr zugeordnet und deshalb auch nicht gezielt gelöscht werden; darauf weist die Seite vor der ersten Wahl hin.',
        'Einmal am Tag erhält der Betreiber per E-Mail die Zahl der am Vortag gespeicherten Lesungen je Runde: nur diese Zahl, keine Lesung und keine Uhrzeit.',
      ],
    },
    {
      heading: 'Erhebungen in Werken der Praxen (/studies)',
      paragraphs: [
        'Einige Werke der Forschungspraktiken (Atelier, Field, Studio) und der Nachtlinie stellen ihren Betrachterinnen und Betrachtern Fragen. Was gefragt wird, legt die jeweilige Praxis in einer öffentlichen Datei neben dem Werk fest; eine Erhebung läuft erst, nachdem eine maschinelle Prüfung dieser Website genau diese Fassung der Datei gelesen und durchgelassen hat. Die Prüfung übernimmt ein KI-Modell (aktuell gemini-2.5-flash-lite, Google AI Studio) mit einem auf /studies wörtlich veröffentlichten Prüftext; es liest allein die Fragen der Praxis, nie Antworten oder Angaben über die Teilnehmenden. Ein Mensch gibt die Fragen nicht frei, der Betreiber kann aber jede Erhebung jederzeit stoppen. Mitmachen ist freiwillig und setzt deine Einwilligung voraus, die du im eingebetteten Rahmen dieser Website erteilst, bevor etwas gesendet wird (Art. 6 Abs. 1 lit. a DSGVO); teilnehmen darf, wer 16 Jahre oder älter ist. Der Rahmen zeigt dir deine Antworten, bevor etwas gesendet wird, und sendet erst, wenn du dort auf „Add my answers to the record“ drückst; erst dann startet auch die Bot-Prüfung.',
        'Die Fragen stellt das Werk der Praxis; es hält deine Antworten, bis es sie dem Rahmen übergibt. Der Rahmen ist der einzige Weg, den die Website einem Werk zum Senden von Antworten gibt. Den Programmcode des Werks schreibt die Praxis selbst, und ihre Verfassung verbietet ihm, Antworten auf anderem Weg zu behalten oder zu versenden. Den Code des Werks prüft niemand; weil das Werk auf derselben Website läuft wie der Rahmen, kann der Browser diese Regel nicht erzwingen, und der Betreiber könnte einen Verstoß nicht erkennen.',
        'Gespeichert werden deine Antworten, der Tag (nicht die Uhrzeit), die Fassung des Einwilligungstextes und die Fassung der Fragen (als Prüfsumme der geprüften Datei), unter einer zufälligen Kennung in einer Datenbank von Cloudflare (D1). Nicht gespeichert werden IP-Adresse, Cookie, Konto, die Dauer deiner Antworten oder irgendetwas, das Antworten dir oder einem anderen Besuch zuordnet. Aus Freitext-Antworten werden unsichtbare Zeichen entfernt; vor dem Speichern prüft sie dasselbe KI-Modell wie die Notizen der Rezeption (aktuell gemini-2.5-flash-lite, Google AI Studio) allein auf Spam, Beleidigungen, personenbezogene Daten Dritter und an Maschinen gerichtete Anweisungen; abgelehnte Antworten werden nicht gespeichert. Veröffentlicht werden die Antworten als offene Daten (CC0) im öffentlichen Git-Archiv dieser Website, und zwar erst nach Ablauf ihres Tages, nur in Paketen von mindestens fünf und ohne den Tag; die fragende Praxis erhält jede Nacht denselben Datensatz.',
        'Damit je Person und Tag nur eine Antwort je Erhebung gezählt wird und eine Adresse jeder Erhebung höchstens drei Antworten am Tag geben kann, werden aus IP-Adresse und User-Agent sowie aus der IP-Adresse allein mit einem täglich neu erzeugten Zufallsschlüssel Hashes gebildet. Schlüssel und Hashes eines Tages werden spätestens am folgenden Tag gelöscht, danach lässt sich kein Hash mehr jemandem zuordnen (Art. 6 Abs. 1 lit. f DSGVO; berechtigtes Interesse am Schutz vor Mehrfach- und Missbrauchseinsendungen). Die Datenbank hält für die Wiederherstellung frühere Stände bis zu 30 Tage vor; darauf hat nur der Betreiber Zugriff. Die Bot-Prüfung übernimmt Cloudflare Turnstile; dabei gelten die Datenschutzhinweise von Cloudflare.',
        'Weil gespeicherte Antworten keinerlei Bezug zu deiner Person enthalten, können sie dir nachträglich nicht mehr zugeordnet und deshalb auch nicht gezielt gelöscht werden; darauf weist der Rahmen hin, bevor etwas gesendet wird.',
        'Einmal am Tag erhält der Betreiber per E-Mail die Zahl der am Vortag gespeicherten Antworten je Erhebung: nur diese Zahl, keine Antworten und keine Uhrzeit.',
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
    // 2026-11-14: names that reach the site with a source's own label, an atlas entry or a letter's address.
    {
      heading: 'Namen in Trending, im Atlas und im Postamt',
      paragraphs: [
        'Common Ground (/trending) übernimmt, was öffentliche Quellen als ihre meistbeachteten Themen ausweisen, mit der Bezeichnung der Quelle: Schlagzeilen, Titel von Wikipedia-Artikeln, Suchbegriffe. Darin kommen Namen von Personen vor, über die öffentlich berichtet wird. Bis zum Tagesstand vom 14. November 2026 wurde bei den neuesten Produkten von Product Hunt außerdem der Name der Person festgehalten, die das Produkt dort eingestellt hat, so wie der öffentliche Feed ihn nennt; seitdem wird er nicht mehr übernommen. Der Atlas (/atlas) nennt Künstlerinnen und Künstler zusammen mit ihren öffentlich gezeigten Arbeiten. Das Postamt (/post) nennt die Empfängerinnen und Empfänger vorbereiteter Briefe in ihrer beruflichen Funktion.',
        'Rechtsgrundlage ist das berechtigte Interesse an einem nachprüfbaren Nachweis dessen, was öffentlich verhandelt und gezeigt wird (Art. 6 Abs. 1 lit. f DSGVO). Die Angaben stammen aus allgemein zugänglichen Quellen, werden nicht angereichert und nicht zu Profilen verdichtet.',
        'Wer die Nennung des eigenen Namens nicht wünscht, kann widersprechen (Art. 21 DSGVO): formlos per E-Mail an hello@frankbueltge.de unter Angabe der Seite und des Eintrags. Der Eintrag wird dann entfernt oder unkenntlich gemacht, auch in den archivierten Tagesständen und in den Fassungen für Maschinen.',
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
        'Für den Versand von E-Mails — Antworten auf Nachrichten mit hinterlassener E-Mail-Adresse, den abonnierbaren Digest und die oben genannten Benachrichtigungen an den Betreiber — nutze ich Brevo (Sendinblue GmbH, Köpenicker Str. 126, 10179 Berlin) als Auftragsverarbeiter (Art. 28 DSGVO). Die Verarbeitung findet in der EU statt.',
        'Der Digest ist ein unregelmäßiger Newsletter über neue Arbeiten dieser Website. Die Anmeldung läuft im Double-Opt-in-Verfahren: Deine Adresse wird erst nach Bestätigung per E-Mail in die Empfängerliste aufgenommen (Art. 6 Abs. 1 lit. a DSGVO). Jede E-Mail enthält einen Abmeldelink; mit der Abmeldung wird die Adresse aus der Liste entfernt. Die Adresse wird ausschließlich bei Brevo gespeichert — nie im öffentlichen Archiv dieser Website — und nicht an Dritte weitergegeben. Über eine bestätigte Anmeldung wird der Betreiber per E-Mail benachrichtigt.',
      ],
    },
    // 2026-11-14: recipients outside the EU and the right to withdraw a consent were not named.
    {
      heading: 'Empfänger und Drittländer',
      paragraphs: [
        'Diese Website nutzt Dienste von Anbietern mit Sitz in den USA: Cloudflare, Inc. (Hosting, Datenbank, Warteschlange und Bot-Prüfung), Google LLC (das KI-Modell, das Einreichungen, Notizen und Freitext-Antworten prüft) und GitHub, Inc. (das öffentliche Git-Archiv, in dem veröffentlichte Saaten, Bewertungen, Notizen und Antworten festgehalten werden). Dabei können personenbezogene Daten in die USA übermittelt werden. Grundlage ist der Angemessenheitsbeschluss der EU-Kommission zum EU-US Data Privacy Framework vom 10. Juli 2023, unter dem diese Anbieter zertifiziert sind, ergänzt durch die Standardvertragsklauseln in ihren Vertragsbedingungen.',
      ],
    },
    {
      heading: 'Deine Rechte',
      paragraphs: [
        'Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch sowie Beschwerde bei einer Aufsichtsbehörde, zum Beispiel bei der deines Wohnorts.',
        'Eine Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen, formlos per E-Mail an hello@frankbueltge.de; den Digest bestellst du über den Abmeldelink in jeder E-Mail ab. Was bis zum Widerruf geschehen ist, bleibt rechtmäßig. Wo eine Einsendung ohne jeden Bezug zu deiner Person gespeichert wurde (Third Reading, Erhebungen in Werken), lässt sie sich dir nicht mehr zuordnen und deshalb nicht einzeln entfernen; darauf weist die jeweilige Seite vor dem Absenden hin.',
      ],
    },
  ],
}

const datenschutzEn: LegalPage = {
  metaTitle: 'Privacy Policy',
  heading: 'Privacy Policy',
  sections: [
    { heading: 'Controller', paragraphs: ['Frank Bueltge, c/o Autorenglück #98451, Albert-Einstein-Str. 47, 02977 Hoyerswerda. Email: hello@frankbueltge.de — see the imprint.'] },
    {
      heading: 'Hosting',
      paragraphs: [
        'Hosted on Cloudflare Pages (Cloudflare, Inc., USA). Technically necessary server logs are processed on access (Art. 6(1)(f) GDPR).',
        'For /trending a nightly run also reads Cloudflare’s aggregated access statistics (requests per country, referring hosts and the kind of program that asked, such as a search engine or a browser) and publishes these totals on the page. No IP address and no identifier of a single visit is read or stored for it.',
      ],
    },
    { heading: 'Fonts', paragraphs: ['Fonts are served locally (self-hosted). No data sent to third parties. This holds for the works of the research practices as well: references to font services of other providers (such as Google Fonts) are removed from their pages when the site is built.'] },
    { heading: 'Cookies & analytics', paragraphs: ['This site sets no tracking cookies and does no cross-device tracking. For anonymous reach measurement it uses Umami — cookieless, without fingerprinting and without personal profiles. Umami is served first-party through a proxy on this domain (the /stats endpoint), so the browser makes no third-party request; the proxy forwards the aggregated request data server-side to our own self-hosted Umami instance on EU infrastructure (Frankfurt, Vercel + Neon) — no third-country transfer. Only aggregate metrics such as page views, referrers (origin), countries and device types are collected; the IP address is transmitted for country lookup and processed only in hashed form, not stored (Art. 6(1)(f) GDPR).'] },
    { heading: 'Homepage: “remember my visits”', paragraphs: ['Only if you switch this feature on, on the homepage, does the page store a timestamp of your last visit in your browser’s local storage, to mark what is new since then. It is not transmitted to us, no cookie is set, and one more click on the same button deletes it. Unless you switch it on, nothing is stored.'] },
    {
      heading: 'Your browser’s local storage',
      paragraphs: [
        'When you switch between the light and the dark view, your browser remembers that choice in its local storage. At /analytics-opt-out you can switch the reach measurement off for your browser; that switch is an entry in local storage as well. Some works of the research practices keep their own state there, for example what you have already opened or entered in a work, or which state you saw last. None of it is sent to us, no cookie is set, and you can delete the entries at any time through your browser’s site data.',
      ],
    },
    {
      heading: 'Works that fetch content from third parties',
      paragraphs: [
        'Some works read the world while you look at them. Your browser then asks not only this website but the service the data or images come from, directly. That service learns your IP address, the usual details of a browser request (such as the browser type) and that the request comes from this website. We set no cookie in the course of it and pass on no further data. The legal basis is the legitimate interest in showing a source directly and unchanged (Art. 6(1)(f) GDPR). The service’s own privacy notice applies to its processing.',
        'As of 14 November 2026 this concerns: Spread (/spread) connects your browser, when the page opens, to the public market data interfaces of the trading venues Coinbase, Kraken, Bitstamp and Binance. Comma (/comma) loads the Citizen Lab’s test lists from GitHub (raw.githubusercontent.com) once you start listening; OONI’s measurements, by contrast, are fetched for you by this website. The page /seed loads the register of seeds from GitHub as well. Some works of the Studio show photographs from iNaturalist’s open data, hosted at Amazon Web Services, and read weather warnings from the Iowa Environmental Mesonet of Iowa State University (USA).',
        'The research practices keep publishing new works. A work that fetches data from a third party as a rule names the service among its sources. Scripts of other providers run nowhere on this website.',
      ],
    },
    {
      heading: 'Public seeding (/seed)',
      paragraphs: [
        'At /seed you can offer this research a seed — text, kind, pseudonym, and addressee. If the gate accepts it, the submission is first held privately for review (a short-lived holding store, no public access) and is published in the public register (Git-versioned, permanently viewable) under CC BY-NC-SA 4.0 only after manual approval; if it is not approved, it is discarded and never published. Submitting constitutes consent to publication in the event of approval (Art. 6(1)(a) GDPR). No email address is collected.',
        'To rate-limit submissions, IP address and user agent are hashed; the hash exists only ephemerally in the function’s memory and is never stored (Art. 6(1)(f) GDPR). Bot screening is done by Cloudflare Turnstile; Cloudflare’s own privacy notice applies to that check.',
        'Content review is done by a named AI model (currently gemini-2.5-flash-lite, Google AI Studio); the full review prompt is published verbatim on /seed. Content blocked by this gate is not stored — only a counter per rejection reason is kept.',
        'The operator is notified by email when a seed arrives; that notification names its kind, its addressee and the pseudonym, but not the text.',
      ],
    },
    {
      heading: 'Reception: ratings and notes (/reception)',
      paragraphs: [
        'Below every work this website publishes you can give a rating from 1 to 5 and, if you like, leave a note (at most 600 characters) with a name or mark of your choice (at most 60 characters). The rating, the note and the name if given, the work and the time are stored in a Cloudflare database (D1). Rating and note are public at once, below the work and on /reception. Every night the public part is kept as a dated file in this website’s public Git archive and handed to the research practices in their own public repositories, where they read it as material. A note is published under CC BY-NC-SA 4.0; ticking the box is consent to its publication (Art. 6(1)(a) GDPR). No email address is collected.',
        'So that each work can be rated only once per person and day, IP address and user agent are hashed with a random key that is new every day, and the hash is stored with the work and the day, without the time. A day’s key and hashes are deleted after the day (UTC) is over, by the end of the following day at the latest. The same technique counts the reports of a note. IP addresses are not stored (Art. 6(1)(f) GDPR; legitimate interest in protection against abuse). For recovery, the database keeps earlier states for up to 30 days, keys and hashes included; only the operator has access to them. After those 30 days no hash can be linked to anyone. No cookie is set for visitors.',
        'Bot screening is done by Cloudflare Turnstile; Cloudflare’s own privacy notice applies to that check. Before it is published, a note is checked by a named AI model (currently gemini-2.5-flash-lite, Google AI Studio) for spam, abuse, personal data of third parties and instructions addressed to machines, and for nothing else; the full prompt is published verbatim on the form. Refused notes are not stored; only a counter per refusal reason is kept. Three reports from different people hide a note until the operator has read it.',
        'On his own devices the operator sets a technically necessary cookie that marks his own notes as his (Section 25(2) no. 2 TDDDG). It carries no identifier and is set for nobody else. Entries are kept as long as the database exists; the nightly files remain in the Git archive with its version history. To have a note of your own removed, write informally to hello@frankbueltge.de, naming the work and the date. The removal takes effect for the website and for future states of the archive; an objection under Art. 21 GDPR is carried out in the archive as well.',
        'The operator is notified by email of a new rating, at most ten times a day; the notification names the work and the score and whether a note came with it, but neither the note nor the name. Once a day he also receives the number of the previous day’s ratings per work.',
      ],
    },
    {
      heading: 'Third Reading (/third-reading)',
      paragraphs: [
        'At /third-reading you can judge the matters of one of the research ecology’s briefings in pairs by urgency and estimate a few magnitudes. Taking part is voluntary and requires your consent, which you give before the first choice (Art. 6(1)(a) GDPR); you must be 16 or older. Nothing is sent until you press “Add my reading to the record” at the end; only then does the bot check start. Until then nothing leaves your browser, and stopping stores nothing.',
        'What is stored, under a random id, in a Cloudflare database (D1): your choices and estimates, how long each took, the day (not the time), the version of the consent text, and whether you opened the page’s results during the same visit before sending. Not stored: your IP address, a cookie, an account, or anything that links a reading to you or to another visit. Readings are published as open data (CC0) in this website’s public Git archive only once their day is over, only in batches of at least five, and without the day, so that no reading can be matched to the moment it was given.',
        'So that only one reading per round is counted per person and day, and one address can give at most three readings a day, hashes are formed from IP address and user agent, and from the IP address alone, with a random key created fresh each day. A day’s key and hashes are deleted by the end of the following day at the latest, after which no hash can be linked to anyone (Art. 6(1)(f) GDPR; legitimate interest in protection against repeated and abusive submissions). For recovery, the database keeps earlier states for up to 30 days; only the operator has access to them. The bot check is provided by Cloudflare Turnstile; Cloudflare’s privacy notice applies.',
        'Because a stored reading contains nothing that relates to you, it cannot be attributed to you afterwards and therefore cannot be deleted on request; the page says so before the first choice.',
        'Once a day the operator receives by email the number of readings stored the day before, per round: that number only, no reading and no time of day.',
      ],
    },
    {
      heading: 'Studies in the practices’ works (/studies)',
      paragraphs: [
        'Some works of the research practices (Atelier, Field, Studio) and of Ulysses (Error as Method) ask the people who see them. The practice sets out what it asks in a public file beside the work; a study runs only after a machine check of this website has read and passed exactly that version of the file. The check is done by an AI model (currently gemini-2.5-flash-lite, Google AI Studio) with a prompt published verbatim on /studies; it reads only the practice’s questions, never answers or anything about the people who take part. No person approves the questions, but the operator can stop any study at any time. Taking part is voluntary and requires your consent, which you give in this website’s embedded frame before anything is sent (Art. 6(1)(a) GDPR); you must be 16 or older. The frame shows you your answers before anything is sent, and sends nothing until you press “Add my answers to the record” there; only then does the bot check start.',
        'The questions are asked by the practice’s work, which holds your answers until it hands them to the frame. The frame is the only way this website gives a work to send answers. The work’s code is written by the practice, and its constitution forbids it to keep or send answers any other way. No one reviews the work’s code; because the work runs on the same website as the frame, the browser cannot enforce that rule, and the operator could not tell if a work broke it.',
        'What is stored, under a random id, in a Cloudflare database (D1): your answers, the day (not the time), the version of the consent text and the version of the questions (as a checksum of the checked file). Not stored: your IP address, a cookie, an account, how long you took, or anything that links answers to you or to another visit. Written answers lose invisible characters, and before storage they are checked by the same AI model as the reception’s notes (currently gemini-2.5-flash-lite, Google AI Studio), solely for spam, abuse, personal data of third parties and instructions aimed at machines; refused answers are not stored. Answers are published as open data (CC0) in this website’s public Git archive only once their day is over, only in batches of at least five, and without the day; the practice that asked receives the same record every night.',
        'So that only one answer set per study is counted per person and day, and one address can give each study at most three a day, hashes are formed from IP address and user agent, and from the IP address alone, with a random key created fresh each day. A day’s key and hashes are deleted by the end of the following day at the latest, after which no hash can be linked to anyone (Art. 6(1)(f) GDPR; legitimate interest in protection against repeated and abusive submissions). For recovery, the database keeps earlier states for up to 30 days; only the operator has access to them. The bot check is provided by Cloudflare Turnstile; Cloudflare’s privacy notice applies.',
        'Because stored answers contain nothing that relates to you, they cannot be attributed to you afterwards and therefore cannot be deleted on request; the frame says so before anything is sent.',
        'Once a day the operator receives by email the number of answer sets stored the day before, per study: that number only, no answers and no time of day.',
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
      heading: 'Names in Trending, the Atlas and the post office',
      paragraphs: [
        'Common Ground (/trending) takes over what public sources declare as their most noticed topics, in the source’s own words: headlines, titles of Wikipedia articles, search terms. Names of people who are publicly reported on occur in them. Up to the day file of 14 November 2026 the name of the person who submitted a product to Product Hunt was kept with its newest products, as the public feed gives it; since then it is no longer taken. The Atlas (/atlas) names artists together with their publicly shown works. The post office (/post) names the receivers of prepared letters in their professional role.',
        'The legal basis is the legitimate interest in a verifiable record of what is publicly discussed and shown (Art. 6(1)(f) GDPR). The information comes from generally accessible sources, is not enriched and is not compiled into profiles.',
        'Anyone who does not want their name listed can object (Art. 21 GDPR), informally by email to hello@frankbueltge.de, naming the page and the entry. The entry is then removed or made unrecognisable, in the archived day files and in the editions for machines as well.',
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
        'For sending email — replies to messages that left an email address, the subscribable digest and the notifications to the operator named above — I use Brevo (Sendinblue GmbH, Köpenicker Str. 126, 10179 Berlin) as a processor (Art. 28 GDPR). Processing takes place in the EU.',
        'The digest is an irregular newsletter about new work on this site. Sign-up is double opt-in: your address joins the recipient list only after you confirm by email (Art. 6(1)(a) GDPR). Every mail carries an unsubscribe link; unsubscribing removes the address from the list. The address is stored at Brevo only — never in this website’s public archive — and is not shared with third parties. The operator is notified by email of a confirmed sign-up.',
      ],
    },
    {
      heading: 'Recipients and third countries',
      paragraphs: [
        'This website uses services of providers based in the USA: Cloudflare, Inc. (hosting, database, queue and bot check), Google LLC (the AI model that checks submissions, notes and free-text answers) and GitHub, Inc. (the public Git archive in which published seeds, ratings, notes and answers are recorded). Personal data may be transferred to the USA in the course of it. The basis is the European Commission’s adequacy decision on the EU-US Data Privacy Framework of 10 July 2023, under which these providers are certified, supplemented by the standard contractual clauses in their terms.',
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: [
        'Access, rectification, erasure, restriction, portability, objection, and the right to lodge a complaint with a supervisory authority, for example the one where you live.',
        'You can withdraw a consent at any time with effect for the future, informally by email to hello@frankbueltge.de; you leave the digest through the unsubscribe link in every mail. What happened before the withdrawal stays lawful. Where a submission was stored without any reference to you (Third Reading, studies in works), it can no longer be attributed to you and so cannot be removed singly; the page says so before you send.',
      ],
    },
  ],
}

export const impressum: Record<Locale, LegalPage> = { de: impressumDe, en: impressumEn }
export const datenschutz: Record<Locale, LegalPage> = { de: datenschutzDe, en: datenschutzEn }
