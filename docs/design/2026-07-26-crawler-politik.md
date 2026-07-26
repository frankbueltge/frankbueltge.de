# Crawler-Politik: zitieren ja, trainieren nein

**Datum:** 2026-07-26 · **Status:** ENTSCHIEDEN (Frank) · **Umsetzung:** `public/robots.txt`
committet; **eine Handlung steht aus** (Cloudflare-Dashboard, siehe §3)

## 1. Befund (gemessen am 2026-07-26)

Die live ausgelieferte `robots.txt` war **nicht** die aus dem Repo. Cloudflare schob
einen eigenen „Managed content"-Block davor, der Trainings- *und* Retrieval-Crawler
sperrte. Gemessene Antworten der Startseite je Kennung:

| Kennung | Antwort |
|---|---|
| Browser, Googlebot, curl, beliebige eigene Kennung | 200 |
| ClaudeBot, GPTBot, OAI-SearchBot, PerplexityBot | **403** |

Klassisches SEO war intakt, KI-Sichtbarkeit vollständig zu. Die Einstellung stammte
aus einer Cloudflare-Voreinstellung, nicht aus einer Entscheidung Franks.

Messvorbehalt, ehrlich: Die Kennungen wurden von außen gesetzt; Cloudflare prüft bei
echten Bots zusätzlich die Herkunfts-IP. Ob verifizierte Retrieval-Agenten ebenfalls
403 erhielten oder nur die gefälschten, ist von außen nicht entscheidbar — sicher ist
nur die Sperre der Trainings-Crawler laut ausgeliefertem Regelwerk.

## 2. Entscheidung

**Zitieren ja, trainieren nein.** Retrieval- und Suchagenten sind willkommen: Sie holen
eine Seite, wenn jemand eine Frage stellt, und verlinken zurück. Trainings-Crawler nicht.

Begründung:
- **Die Sichtbarkeit, um die es geht, entsteht im Retrieval-Weg**, nicht im Training.
  Zitate mit Link stammen von Suchagenten; Trainingspräsenz ist unüberprüfbar, nicht
  zitierfähig und um Jahre verzögert.
- **Widerspruchsfreiheit:** Werke und Texte stehen nichtkommerziell (CC BY-NC-SA);
  kommerzielles Training wäre kommerzielle Nutzung. Eine Trainingsfreigabe würde
  einräumen, was die eigene Lizenz untersagt.
- **Rechte Dritter:** Teile der Inhalte sind abgeleitet (GDELT, GISTEMP, geerntete
  Fremdmetadaten). Eine pauschale Trainingsfreigabe würde Rechte einräumen, die nicht
  bei uns liegen — eine Behauptung ohne Deckung, das Gegenteil des Hausprinzips.
- **Umkehrbarkeit:** Training lässt sich später öffnen; einmal aufgenommen, ist es
  nicht zurückzuholen.
- **Personenbezug:** Das Impressum trägt die gesetzlich verlangte Anschrift.
  Suchindexierung ist rücknehmbar, Aufnahme in Modellgewichte praktisch nicht —
  deshalb sind Impressum und Datenschutz für Retrieval-Agenten gesperrt.

Maschinenlesbarkeit bleibt davon unberührt: Der Dataset-Bestand ist CC0, versioniert
und vollständig herunterladbar. Wer Daten will, bekommt sie auf dem ehrlichen Weg —
besser, als jeder Crawl liefern könnte.

## 3. Ausstehende Handlung (nur Frank)

Zwei Einstellungen, beide unter `dash.cloudflare.com` → Zone **frankbueltge.de**.
(Die Menübezeichnungen wandern zwischen Cloudflare-Versionen; maßgeblich ist, was die
Prüfbefehle unten anschließend sagen.)

**a) Verwaltete robots.txt abschalten** — Sidebar **AI Crawl Control** (früher „AI
Audit"), dort der Abschnitt zur robots.txt-Verwaltung: „Managed robots.txt" bzw.
„Content Signals" auf **aus**. Ergebnis: Cloudflare hört auf, den eigenen Block
auszuliefern, und `public/robots.txt` aus dem Repo wird sichtbar. Solange das an ist,
ist die committete Datei wirkungslos.

**b) Die Kantensperre differenzieren** — im selben Bereich stehen die einzelnen
Crawler mit Allow/Block. Gewünscht:

| gesperrt lassen (Training) | freigeben (Retrieval, zitiert mit Link) |
|---|---|
| GPTBot · ClaudeBot · CCBot · Google-Extended · meta-externalagent · Bytespider · Applebot-Extended | OAI-SearchBot · ChatGPT-User · Claude-SearchBot · Claude-User · PerplexityBot · Perplexity-User · Applebot · Amazonbot |

Falls es die Einzelsteuerung im Tarif nicht gibt, ersatzweise unter **Security → Bots**
den Schalter „Block AI Scrapers and Crawlers" auf **aus** stellen — dann trägt allein
die robots.txt die Politik. Das ist schwächer (robots.txt ist eine Bitte, kein Zaun),
aber besser als die jetzige Pauschalsperre, die auch die zitierenden Agenten aussperrt.

Danach nachprüfen:

```bash
curl -s https://frankbueltge.de/robots.txt | head -20     # eigene Datei sichtbar?
curl -s -o /dev/null -w "%{http_code}\n" -A "OAI-SearchBot/1.0" https://frankbueltge.de/   # 200 erwartet
curl -s -o /dev/null -w "%{http_code}\n" -A "GPTBot/1.2"       https://frankbueltge.de/   # gesperrt bleibt gesperrt
```

## 4. Technische Notiz

`/steuerzentrale` wird **nicht** per `Disallow` gesperrt. Die Seite trägt bereits
`<meta name="robots" content="noindex">`, und ein Crawler muss sie abrufen dürfen, um
dieses Tag zu lesen. Ein `Disallow` würde das Tag verbergen, während die nackte URL
weiterhin gelistet werden könnte. Die Daten dahinter liegen ohnehin hinter einer
authentifizierten API (401 gemessen).
