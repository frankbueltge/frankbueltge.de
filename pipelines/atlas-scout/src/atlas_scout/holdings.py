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


# ── The practices' works (since 2026-11-04) ──────────────────────────────────────────
#
# Until this day the register read only the site's own pipelines. Frank asked whether
# everything the practices use was in the catalogues (2026-11-04, wording private); measured
# that day, the works of the practices and the lab's other houses fetched 86 public data
# sources the register did not hold — GBIF, the National Weather Service, NASA JPL's
# small-body API, HDX, FEWS NET, USGS water services, Eurostat, seismic FDSN services.
#
# A practice repository is not a pipeline directory: its code links documentation, papers,
# artists' pages and examples far more often than it fetches data (over 800 hosts in the
# same code). So the reading is narrower here than for the site's own pipelines, by two
# conditions that must both hold:
#
#   1. Where: a code file of the practice (comment lines skipped) or a file in which a work
#      declares what it fetched (`sources*.json`, `SOURCES.md`, `DATA.md`, `datasets.json`,
#      and the `data_sources` field of a work's `meta.json` — the declaration the practices'
#      constitutions ask for since 2026-11-04).
#   2. What: the address has the shape of data — an API or query endpoint, a data host, a
#      download of a data file — rather than the shape of a page to read.
#
# What the conditions drop is not lost: papers go to the paper catalogue, and a page a work
# read is a reading, not a dataset.

PRAXIS_CODE = (".py", ".mjs", ".js", ".ts", ".sh")
PRAXIS_ERKLAERUNG = re.compile(r"^(sources?[\w-]*\.json|SOURCES\.md|DATA\.md|datasets\.json)$", re.I)
PRAXIS_UEBERSPRUNGEN = frozenset(
    {".git", "node_modules", "__pycache__", ".venv", "dist", "build", ".astro", "vendor",
     "vendored", "tests", "test", "fixtures", "archive"}
)
# The shape of data. A host label that names a data service (`api.`, `bills-api.`, `data.`,
# `opendata.`, `catalog.` …), a path that names an endpoint (`/api/`, `/tap/`, `/fdsnws/`,
# `/sparql`, `/graphql` …), or a file a work downloads as data.
MUSTER_DATENFORM = re.compile(
    r"^https?://(?:[\w-]+\.)*(?:[\w]+-)?(?:api|data|opendata|catalog|catalogue|dataverse|"
    r"tap\w*|dumps|download|ftp|stats?|waterservices)(?:-[\w-]+)?\."
    r"|/api/|/apis/|/rest/|/tap/|/sparql|/interpreter|/fdsnws/|/odata/|/graphql|/download"
    r"|/datasets?/|/data/|/opendata|/query\b"
    r"|\.(?:csv|tsv|json|jsonl|geojson|zip|gz|zst|xlsx?|nc|parquet|ndjson|pgn|dat|txt)(?:[?#]|$)",
    re.I,
)
# Addresses that have that shape and are still not data: tooling and infrastructure files.
MUSTER_KEINE_DATEN = re.compile(
    r"robots\.txt|sitemap|pythonhosted|jsdelivr|unpkg|cdnjs|cran\.r-project|\.pdf(?:[?#]|$)"
    r"|/wiki/|fonts\.|tiles?\.|/tile/|example|\.invalid|localhost|anthropic|openai|tavily"
    r"|rfc-editor|/licenses?/",
    re.I,
)
KOMMENTARZEILE = re.compile(r"^\s*(?:#|//|\*|/\*)")


def _praxis_texte(pfad: Path, roh: str) -> list[str]:
    """The lines of a practice file that can hold a fetched address."""
    if pfad.name == "meta.json":
        try:
            daten = json.loads(roh)
        except (json.JSONDecodeError, RecursionError):
            return []
        erklaert = daten.get("data_sources") if isinstance(daten, dict) else None
        return [json.dumps(erklaert)] if erklaert else []
    if pfad.suffix in PRAXIS_CODE:
        return [z for z in roh.splitlines() if not KOMMENTARZEILE.match(z)]
    return roh.splitlines()


def sammle_praxen(
    repos: Path, praxen: dict[str, str] | None = None
) -> tuple[list[Quelle], list[str]]:
    """Reads the practice repositories under `repos` and returns the data sources their
    works fetch. Each Bezug names the practice as the work and `<repo>/<path>` as the
    evidence. Returns (sources, notes); a missing repository is a note, never silence."""
    from .praxen import FREMDES_MATERIAL, PRAXEN

    gefunden: dict[str, list[Bezug]] = {}
    vermerke: list[str] = []
    for praxis, repo_name in (praxen or PRAXEN).items():
        repo = repos / repo_name
        if not repo.is_dir():
            vermerke.append(f"{repo_name}: nicht gefunden — Ausfall, nicht leer")
            continue
        for pfad in sorted(repo.rglob("*")):
            relativ = pfad.relative_to(repo)
            if PRAXIS_UEBERSPRUNGEN & set(relativ.parts) or not pfad.is_file():
                continue
            if relativ.parts and relativ.parts[0] in FREMDES_MATERIAL.get(repo_name, ()):
                continue
            erklaerung = PRAXIS_ERKLAERUNG.match(pfad.name) or pfad.name == "meta.json"
            if not erklaerung and (pfad.suffix not in PRAXIS_CODE or ".min." in pfad.name):
                continue
            if "test" in pfad.name:
                continue
            try:
                roh = pfad.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            if len(roh) > 500_000:  # a bundled library or a data dump, not a work's code
                continue
            for zeile in _praxis_texte(pfad, roh):
                for url in MUSTER_URL.findall(zeile):
                    host = url.split("/")[2].lower()
                    if any(a in host for a in KEINE_QUELLE + GEHOERT_ZU_PAPERS):
                        continue
                    if MUSTER_KEINE_DATEN.search(url) or not MUSTER_DATENFORM.search(url):
                        continue
                    gefunden.setdefault(host, []).append(
                        Bezug(werk=praxis, datei=f"{repo_name}/{relativ}", url=url)
                    )
    quellen = [Quelle(host=h, bezuege=tuple(b)) for h, b in sorted(gefunden.items())]
    return quellen, vermerke


def vereinige(*listen: list[Quelle]) -> list[Quelle]:
    """One source per host across the site's pipelines and the practices' works."""
    je_host: dict[str, list[Bezug]] = {}
    for liste in listen:
        for quelle in liste:
            je_host.setdefault(quelle.host, []).extend(quelle.bezuege)
    return [Quelle(host=h, bezuege=tuple(dict.fromkeys(b))) for h, b in sorted(je_host.items())]


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


# The practices and houses as the register names them in a sentence.
PRAXIS_NAMEN = {
    "atelier": "the Atelier", "field": "the Field", "studio": "the Studio",
    "meridian": "Meridian", "nightly": "the nightly line", "attention": "Machine Attention",
    "middle": "the Middle", "n-1": "n-1", "arch": "Arch",
    "observatory": "The State Before the Interface",
}


def _liste(namen: list[str]) -> str:
    return namen[0] if len(namen) == 1 else ", ".join(namen[:-1]) + f" and {namen[-1]}"


def _gebrauchsbeleg(quelle: Quelle) -> str:
    """Der Satz, der sagt, DASS diese Quelle zählt: Welches Werk holt sie, und wo steht das.

    Bei Datensätzen ist dieser Beleg stärker als bei Papern. Ein Zitat sagt „jemand hat
    das einmal gelesen"; ein Abruf im Quelltext einer laufenden Pipeline sagt „das läuft
    jede Nacht". Die Begründung ist damit nicht bloß behauptet, sondern in Betrieb.
    """
    werke = [w for w in quelle.werke if w not in PRAXIS_NAMEN]
    praxen = [PRAXIS_NAMEN[w] for w in quelle.werke if w in PRAXIS_NAMEN]
    saetze = []
    if werke:
        saetze.append(f"Retrieved by this ecology's own {_liste(werke)} pipeline on every run.")
    if praxen:
        saetze.append(f"Fetched in the works of {_liste(praxen)}.")
    return " ".join(saetze)


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


# ── Datasets the practices cite by DOI (since 2026-11-04) ────────────────────────────
#
# The second gap measured on 2026-11-04: practices cite datasets by DOI (Zenodo, GBIF,
# Harvard Dataverse, the British Geological Survey's seismic network …) — at least 22 such
# identifiers in prose and work files, none in the register. A DOI does not say what it
# names; its registration agency and the agency's own record do. So: every DOI the
# practices cite (the same seed the paper catalogue reads) is grouped by prefix, each prefix
# asked once which agency registers it (doi.org/ra), and only DataCite DOIs are looked up
# in DataCite. A DOI enters the register only when DataCite itself types it as a Dataset —
# never because its prefix looks like a repository.

DOI_RA = "https://doi.org/ra/"
DATACITE = "https://api.datacite.org/dois/"
DATENSATZ_TYPEN = frozenset({"Dataset"})
PAUSE_DOI = 0.2


def _doi_id(doi: str) -> str:
    return "doi-" + re.sub(r"[^a-z0-9]+", "-", doi.lower()).strip("-")


def baue_doi_eintraege(
    repos: Path, vorher: list[dict] | None = None
) -> tuple[list[dict], list[str]]:
    """Register entries for the DataCite datasets the practices cite. An entry the committed
    register already holds is carried with fresh evidence of use and no new lookup."""
    from .praxen import sammle as sammle_saat

    saat = sammle_saat(repos)
    frueher = {e.get("id"): e for e in (vorher or []) if isinstance(e, dict)}
    vermerke: list[str] = []
    eintraege: list[dict] = []
    koerner = [k for k in saat.koerner if k.art == "doi"]
    agentur: dict[str, str | None] = {}

    with httpx.Client(follow_redirects=True, headers=KOPF, timeout=20.0) as client:
        for korn in koerner:
            doi = korn.kennung.rstrip("*.")
            eid = _doi_id(doi)
            beleg = {
                "fundstellen": sorted({f"{f.repo}/{f.datei}" for f in korn.fundstellen}),
                "benutzt_von": list(korn.praxen),
            }
            titel = (frueher.get(eid) or {}).get("titel")
            if not titel:
                titel = _datacite_datensatz(client, doi, agentur, vermerke)
                if not titel:
                    continue
            adresse = f"https://doi.org/{doi}"
            # Probed on every run like every other entry: the date the register stamps is
            # the date of a probe that happened.
            befund = pruefe(adresse, client)
            status = befund.status
            eintraege.append({
                "id": eid,
                "titel": titel,
                "host": "doi.org",
                "adressen": [adresse],
                "zugriff_url": adresse,
                "geprueft": bool(befund.aufgeloest),
                "pruef_status": status,
                "pruef_vermerk": (
                    f"Zugang erfordert Anmeldung oder Schlüssel (HTTP {status})"
                    if status in (401, 403) else befund.vermerk
                ),
                "zugang_gesperrt": status in (401, 403),
                "nur_vorlage": False,
                "relevanz": _doi_beleg(korn),
                "relevanz_herkunft": "gebrauch",
                "weg": "praxis",
                "aufnahmegrund": "zitiert",
                **beleg,
                "verify_status": "toVerify",
            })
    return eintraege, vermerke


def _datacite_datensatz(
    client: httpx.Client, doi: str, agentur: dict[str, str | None], vermerke: list[str]
) -> str | None:
    """The DataCite title of `doi` if DataCite registers it and types it as a Dataset; the
    DOI itself when such a record has no title; None for anything else."""
    praefix = doi.split("/")[0]
    if praefix not in agentur:
        try:
            antwort = client.get(DOI_RA + praefix)
            daten = antwort.json() if antwort.status_code == 200 else []
            agentur[praefix] = (daten[0] or {}).get("RA") if daten else None
        except (httpx.HTTPError, ValueError, IndexError, AttributeError):
            agentur[praefix] = None
            vermerke.append(f"Agentur für {praefix} nicht erfragbar — Ausfall")
        time.sleep(PAUSE_DOI)
    if agentur[praefix] != "DataCite":
        return None
    try:
        antwort = client.get(DATACITE + doi)
    except httpx.HTTPError as fehler:
        vermerke.append(f"DataCite {doi}: {type(fehler).__name__} — Ausfall")
        return None
    time.sleep(PAUSE_DOI)
    if antwort.status_code != 200:
        if antwort.status_code != 404:
            vermerke.append(f"DataCite {doi}: HTTP {antwort.status_code} — Ausfall")
        return None
    attr = ((antwort.json() or {}).get("data") or {}).get("attributes") or {}
    if (attr.get("types") or {}).get("resourceTypeGeneral") not in DATENSATZ_TYPEN:
        return None
    titel = next((t.get("title") for t in attr.get("titles") or [] if t.get("title")), "")
    # Without a recorded title the DOI stands — never a name made up for it.
    return re.sub(r"\s+", " ", titel).strip()[:180] or doi


def _doi_beleg(korn) -> str:
    namen = [PRAXIS_NAMEN.get(p, p) for p in korn.praxen]
    return f"Cited as a dataset (DataCite: Dataset) by {_liste(namen)}."


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
    parser.add_argument(
        "--repos", type=Path, default=None,
        help="directory holding the practice repositories side by side (since 2026-11-04)",
    )
    args = parser.parse_args(argv)
    # The run day, read once before the probe pass: the date every probe of this run carries.
    today = datetime.now(timezone.utc).date().isoformat()

    quellen, vermerke = sammle(args.wurzel)
    print(f"Datenquellen in den Werken: {len(quellen)}")
    for v in vermerke[:8]:
        print(f"   {v}")
    if args.repos:
        aus_praxen, praxis_vermerke = sammle_praxen(args.repos)
        print(f"Datenquellen in den Werken der Praxen: {len(aus_praxen)}")
        for v in praxis_vermerke:
            print(f"   {v}")
        quellen = vereinige(quellen, aus_praxen)
        print(f"zusammen: {len(quellen)} Quellen")

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

    if args.repos:
        doi_eintraege, doi_vermerke = baue_doi_eintraege(args.repos, vorher_liste)
        print(f"zitierte Datensätze (DataCite): {len(doi_eintraege)}")
        for v in doi_vermerke:
            print(f"   {v}")
        eintraege += doi_eintraege

    if vorher_liste is not None:
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
