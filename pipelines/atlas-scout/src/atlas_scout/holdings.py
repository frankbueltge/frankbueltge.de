"""Das Dataset Register aus dem, was die eigenen Werke abrufen.

Frank, 2026-07-28 (Wortlaut privat): ob das Haus nicht in den Holdings ohnehin schon
öffentliche Daten abrufe und selbst welche sammle. — Ja. Und das ist die Antwort auf die Frage, wie man
gezielt nach passenden Datensätzen sucht: **gar nicht suchen.**

Am 27.07. wurde das Register auf Null zurückgebaut, weil 16.516 gesammelte Einträge mit
der Forschung null Schnittmenge hatten. Am 28.07. wurden fünf Wege gemessen, Datensätze
zu FINDEN — DataCite-Rückverweise, OpenAlex-Nachbarschaft, drei Themensuchen. Ergebnis:
1, 0, 0, 0 und 38 unpassende. Die ganze Zeit lagen 62 nachweislich benutzte Datenquellen
im eigenen Repo, in den Pipelines der Holdings.

Dieselbe Umkehrung wie beim Paper-Katalog, eine Ebene weiter: Der Ausgangspunkt ist nicht
„was gibt es", sondern „was wird benutzt". Ein Abruf im Quelltext einer laufenden
Pipeline ist der härteste Gebrauchsbeleg, den es gibt — härter als ein Zitat, denn er
läuft jede Nacht.

**Was hier gelesen wird:** die Pipelines unter `pipelines/*/src/**/*.py` und die
Abrufskripte unter `scripts/`. Rein lesend, kein Netzzugriff beim Sammeln — die Prüfung
des Zugriffswegs ist ein eigener Schritt.

**Was NICHT als Datenquelle gilt** (Ausschlussliste unten): Paketverzeichnisse,
Dokumentation, die eigene Domain, Code-Hoster. Der Scout ruft sie auf, aber sie sind
Werkzeug, nicht Gegenstand — dieselbe Unterscheidung wie Messobjekt gegen Quelle in
`praxen.py`.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

# Wo die Werke ihre Daten holen.
GELESENE_PFADE = (
    "pipelines/*/src/**/*.py",
    "pipelines/*/*.py",
    "scripts/*.ts",
    "scripts/*.mjs",
)

# Hosts, die zwar abgerufen werden, aber keine Datenquelle SIND: Paketverzeichnisse,
# Dokumentation, Code-Hoster, die eigene Domain. Werkzeug, nicht Gegenstand.
KEINE_QUELLE = (
    "github", "githubusercontent", "schema.org", "w3.org", "localhost", "example.",
    "python.org", "astro.build", "pypi", "readthedocs", "tailwind", "npmjs", "mozilla",
    "ietf.org", "gnu.org", "frankbueltge.de", "docs.", "127.0.0.1", "0.0.0.0",
)

# Wissenschaftliche Nachweise gehören in den PAPER-Katalog, nicht ins Datensatz-Register.
# Ohne diese Trennung stünde derselbe Gegenstand in beiden Beständen.
GEHOERT_ZU_PAPERS = ("doi.org", "arxiv.org", "openalex", "crossref", "ncbi.nlm.nih.gov")

MUSTER_URL = re.compile(r'https?://[a-zA-Z0-9._-]+\.[a-z]{2,}(?:/[^\s"\'`,)\]}]*)?')

# Platzhalter in Vorlagen: f-strings (`{jahr}`), printf (`%s`), Shell/JS (`${…}`).
# Eine Vorlage ist KEINE Adresse — sie zu prüfen erzeugt einen falschen Befund.
MUSTER_VORLAGE = re.compile(r"[{}]|%[sd]|\$\{")


def ist_vorlage(url: str) -> bool:
    """Ob die Adresse einen Platzhalter trägt und darum nicht abrufbar ist.

    Beobachtet am 2026-07-28: `https://ars.electronica.art/starts-prize/en/winners/
    winners{jahr}` wurde vom URL-Muster bei `{jahr` abgeschnitten und dann geprüft —
    Ergebnis HTTP 404. Das ist kein Befund über die Quelle, sondern über meinen
    Ausschnitt. Ein Register, das Zugriffswege bescheinigt, darf so etwas nicht als
    „nicht erreichbar" führen."""
    return bool(MUSTER_VORLAGE.search(url))


@dataclass(frozen=True)
class Bezug:
    """Ein Abruf: welches Werk holt was, aus welcher Datei."""

    werk: str  # der Pipeline-/Skriptname — das Werk, das die Quelle benutzt
    datei: str  # Repo-relativer Pfad, der Beleg
    url: str  # die abgerufene Adresse, wörtlich aus dem Quelltext


@dataclass(frozen=True)
class Quelle:
    host: str
    bezuege: tuple[Bezug, ...]

    @property
    def werke(self) -> tuple[str, ...]:
        """Welche Werke die Quelle benutzen. Mehrere = ein tragenderer Eintrag."""
        return tuple(sorted({b.werk for b in self.bezuege}))

    @property
    def adressen(self) -> tuple[str, ...]:
        """Die tatsächlich abgerufenen Adressen — nie konstruiert, nur gefunden."""
        return tuple(sorted({b.url for b in self.bezuege}))


def _werk_von(pfad: Path) -> str:
    """Der Name des Werks, das diese Datei ausführt."""
    teile = pfad.parts
    if teile[0] == "pipelines" and len(teile) > 1:
        return teile[1]
    return "scripts"


def sammle(wurzel: Path) -> tuple[list[Quelle], list[str]]:
    """Liest die Pipelines und gibt die benutzten Datenquellen zurück.

    Rückgabe: (Quellen, Vermerke). Vermerke halten fest, was übersprungen wurde und
    warum — ein Ausschluss ohne Begründung wäre ein stiller Filter.
    """
    gefunden: dict[str, list[Bezug]] = {}
    vermerke: list[str] = []
    ausgeschlossen: dict[str, int] = {}

    dateien = sorted({p for m in GELESENE_PFADE for p in wurzel.glob(m)})
    for pfad in dateien:
        if ".venv" in pfad.parts or "test" in pfad.name or "__pycache__" in pfad.parts:
            continue
        try:
            roh = pfad.read_text(encoding="utf-8", errors="ignore")
        except OSError as fehler:
            vermerke.append(f"{pfad}: unlesbar ({type(fehler).__name__})")
            continue

        relativ = pfad.relative_to(wurzel)
        werk = _werk_von(relativ)
        for url in MUSTER_URL.findall(roh):
            host = url.split("/")[2].lower()
            if any(a in host for a in KEINE_QUELLE):
                ausgeschlossen[host] = ausgeschlossen.get(host, 0) + 1
                continue
            if any(a in host for a in GEHOERT_ZU_PAPERS):
                ausgeschlossen[f"{host} (→ Paper-Katalog)"] = (
                    ausgeschlossen.get(f"{host} (→ Paper-Katalog)", 0) + 1
                )
                continue
            gefunden.setdefault(host, []).append(
                Bezug(werk=werk, datei=str(relativ), url=url)
            )

    for host, n in sorted(ausgeschlossen.items(), key=lambda x: -x[1]):
        vermerke.append(f"übersprungen: {host} ({n}×) — Werkzeug, nicht Gegenstand")

    quellen = [
        Quelle(host=host, bezuege=tuple(bezuege))
        for host, bezuege in sorted(gefunden.items())
    ]
    return quellen, vermerke


# ── Vom Abruf zum Registereintrag ────────────────────────────────────────────────────

import html  # noqa: E402
import json  # noqa: E402
import time  # noqa: E402

import httpx  # noqa: E402

from .verify import KOPF, pruefe  # noqa: E402

PAUSE = 0.4


def _seitentitel(text: str) -> str:
    """Der `<title>` der Quelle, wörtlich. Kein Titel ⇒ leer, nichts erfunden.

    Entities werden aufgelöst (`&#8211;` → „–"): Sie sind Transportkodierung, nicht
    Wortlaut. Was die Seite ANZEIGT, ist der Titel — nicht, wie ihr HTML ihn schreibt.
    """
    treffer = re.search(r"<title[^>]*>(.*?)</title>", text, re.S | re.I)
    if not treffer:
        return ""
    titel = html.unescape(re.sub(r"<[^>]+>", "", treffer.group(1)))
    return re.sub(r"\s+", " ", titel).strip()[:180]


def _gebrauchsbeleg(quelle: Quelle) -> str:
    """Der Satz, der sagt, DASS diese Quelle zählt: Welches Werk holt sie, und wo steht das.

    Bei Datensätzen ist dieser Beleg stärker als bei Papern. Ein Zitat sagt „jemand hat
    das einmal gelesen"; ein Abruf im Quelltext einer laufenden Pipeline sagt „das läuft
    jede Nacht". Die Begründung ist damit nicht bloß behauptet, sondern in Betrieb.
    """
    werke = list(quelle.werke)
    liste = werke[0] if len(werke) == 1 else ", ".join(werke[:-1]) + f" and {werke[-1]}"
    return f"Retrieved by this ecology's own {liste} pipeline on every run."


def baue_register(quellen: list[Quelle], *, grenze: int | None = None) -> list[dict]:
    """Prüft jede Quelle und baut die Registereinträge.

    Geprüft wird die tatsächlich im Quelltext stehende Adresse — nie eine konstruierte.
    Antwortet sie nicht, bleibt der Eintrag trotzdem stehen, aber mit dem Vermerk: Ein
    Werk, das eine nicht erreichbare Quelle abruft, ist selbst ein Befund.
    """
    eintraege: list[dict] = []
    with httpx.Client(follow_redirects=True, headers=KOPF, timeout=20.0) as client:
        for quelle in (quellen[:grenze] if grenze else quellen):
            # Eine abrufbare Adresse bevorzugen; gibt es nur Vorlagen, wird das gesagt.
            echte = [a for a in quelle.adressen if not ist_vorlage(a)]
            adresse = echte[0] if echte else quelle.adressen[0]
            if not echte:
                befund = None
                vermerk = "Adresse ist eine Vorlage mit Platzhalter, nicht abrufbar"
                status = None
            else:
                befund = pruefe(adresse, client)
                status = befund.status
                # 401/403 heißt „braucht Anmeldung", nicht „weg". Für ein Register, das
                # Zugriffswege bescheinigt, ist das der wichtigere Unterschied: Die
                # Quelle existiert, sie ist nur nicht offen.
                if status in (401, 403):
                    vermerk = f"Zugang erfordert Anmeldung oder Schlüssel (HTTP {status})"
                else:
                    vermerk = befund.vermerk
            titel = ""
            if befund and befund.aufgeloest:
                try:
                    antwort = client.get(adresse)
                    if "html" in antwort.headers.get("content-type", ""):
                        titel = _seitentitel(antwort.text)
                except httpx.HTTPError:
                    pass  # Der Prüfbefund steht schon; ein fehlender Titel bleibt leer.
            time.sleep(PAUSE)


            eintraege.append({
                "id": quelle.host.replace(".", "-"),
                # Ohne Seitentitel steht der Host da — wörtlich und nachprüfbar, statt
                # dass ein Name erfunden wird.
                "titel": titel or quelle.host,
                "host": quelle.host,
                "adressen": list(quelle.adressen),
                "zugriff_url": adresse,
                "geprueft": bool(befund and befund.aufgeloest),
                "pruef_status": status,
                "pruef_vermerk": vermerk,
                # Getrennt vom Prüfbefund: „braucht Schlüssel" ist eine Eigenschaft der
                # Quelle, kein Fehler des Registers.
                "zugang_gesperrt": status in (401, 403),
                "nur_vorlage": not echte,
                "relevanz": _gebrauchsbeleg(quelle),
                "relevanz_herkunft": "gebrauch",
                "weg": "praxis",
                # Neuer Aufnahmegrund, stärker als `zitiert`: Die Quelle wird im Betrieb
                # abgerufen, nicht nur einmal gelesen.
                "aufnahmegrund": "benutzt",
                "fundstellen": sorted({b.datei for b in quelle.bezuege}),
                "benutzt_von": list(quelle.werke),
                "verify_status": "toVerify",
            })
    return eintraege


# ── The dates the register carries (since 2026-10-05) ────────────────────────────────
#
# Until this day neither an entry nor its probe carried a date, so the site's signal log —
# the stream of everything in the house that changes daily, each row dated by its own
# record — had nothing to file the register under. From now on every run stamps three
# dates per entry, each kept by comparing with the register committed before the run:
#
#   probed_on                the day of the probe pass whose result the entry carries
#   first_seen_on            the run that first wrote the source
#   reachability_changed_on  the run whose probe moved it to another state of access
#
# Nothing is backfilled. A source already in the register when the stamp began gets null
# for its first appearance. The committed history could date most of them (the first commit
# of this file that holds the id), but until its reset on 2026-07-28 this file held another
# register altogether, so such a derivation would first have to decide where its own history
# begins; null is what the record states without that decision. A reachability date stays
# null until a probe sees the state change. The run day is the only clock reading here: it
# records when this run happened, and is never given to anything that happened before it.

_DAY = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _day(value: object) -> str | None:
    """A carried date, if it is one — anything else is not a date the record holds."""
    return value if isinstance(value, str) and _DAY.match(value) else None


def reachability(entry: dict) -> str:
    """The register's four states of access, read in the order the site reads them
    (src/lib/register.ts, `zugangLabel`): access confirmed, gated, template, no answer.

    A move between two of them is a change of reachability. A new HTTP code inside one
    state — a 404 that becomes a 500 — is not: the source answers no better or worse.
    """
    if entry.get("geprueft"):
        return "confirmed"
    if entry.get("zugang_gesperrt"):
        return "gated"
    if entry.get("nur_vorlage"):
        return "template"
    return "no answer"


def stamp_register(entries: list[dict], previous: list[dict] | None, today: str) -> list[dict]:
    """Dates every entry of this run against the register committed before it.

    - `probed_on`: today, for every entry this run probed; null for an address that is
      only a template, which no run probes.
    - `first_seen_on`: today for a source the previous register did not hold; otherwise
      carried — null, if the source was there before the stamp began.
    - `reachability_changed_on`: today when the state of access differs from the previous
      register's; otherwise carried. Null for a new source (it has not changed — it has
      appeared) and for one unchanged since the stamp began.

    Identity is the entry id, which is the host: the register keeps one entry per host.
    """
    before = {
        e["id"]: e for e in (previous or []) if isinstance(e, dict) and isinstance(e.get("id"), str)
    }
    stamped: list[dict] = []
    for entry in entries:
        prior = before.get(entry["id"])
        if prior is None:
            first_seen, changed = today, None
        else:
            first_seen = _day(prior.get("first_seen_on"))
            changed = (
                today
                if reachability(prior) != reachability(entry)
                else _day(prior.get("reachability_changed_on"))
            )
        stamped.append({
            **entry,
            "probed_on": None if entry.get("nur_vorlage") else today,
            "first_seen_on": first_seen,
            "reachability_changed_on": changed,
        })
    return stamped


def main(argv: list[str] | None = None) -> int:
    import argparse
    from datetime import datetime, timezone

    parser = argparse.ArgumentParser(
        description="Dataset Register aus den Datenquellen der eigenen Werke."
    )
    parser.add_argument("--wurzel", type=Path, default=Path("."))
    parser.add_argument("--grenze", type=int, default=None)
    args = parser.parse_args(argv)
    # The run day, read once before the probe pass: the date every probe of this run carries.
    today = datetime.now(timezone.utc).date().isoformat()

    quellen, vermerke = sammle(args.wurzel)
    print(f"Datenquellen in den Werken: {len(quellen)}")
    for v in vermerke[:8]:
        print(f"   {v}")

    eintraege = baue_register(quellen, grenze=args.grenze)
    erreichbar = sum(1 for e in eintraege if e["geprueft"])
    print(f"Einträge: {len(eintraege)} · Zugriff bestätigt: {erreichbar}")

    # Dieselbe Bewahrung wie im Paper-Katalog: Urteile und Abnahmen folgen aus keiner
    # Quelle und kämen durch keinen Abruf zurück. Der Neubau darf sie nicht löschen.
    ziel = args.wurzel / "src/data/register/datasets.json"
    # The register committed before this run: what the dates below are kept against.
    vorher_liste: list[dict] | None = None
    if ziel.is_file():
        vorher_liste = json.loads(ziel.read_text(encoding="utf-8"))
        alt = {e["id"]: e for e in vorher_liste}
        bewahrt = 0
        for e in eintraege:
            vorher = alt.get(e["id"])
            if not vorher:
                continue
            if vorher.get("relevanz_herkunft") == "urteil":
                e["relevanz"] = vorher["relevanz"]
                e["relevanz_herkunft"] = "urteil"
                e["urteil"] = vorher.get("urteil")
                bewahrt += 1
            if vorher.get("verify_status") == "verified":
                e["verify_status"] = "verified"
        print(f"Urteile aus dem Vorlauf übernommen: {bewahrt}")

    eintraege = stamp_register(eintraege, vorher_liste, today)
    added = sum(1 for e in eintraege if e["first_seen_on"] == today)
    changed = sum(1 for e in eintraege if e["reachability_changed_on"] == today)
    probed = sum(1 for e in eintraege if e["probed_on"] == today)
    print(f"dated {today}: probed {probed} · first seen {added} · reachability changed {changed}")

    ziel.write_text(
        json.dumps(sorted(eintraege, key=lambda e: e["host"]), indent=1, ensure_ascii=False)
        + "\n",
        encoding="utf-8",
    )
    print(f"geschrieben: {ziel}")
    return 0


if __name__ == "__main__":
    import sys

    sys.exit(main())
