# Cron-Migration: GCP Cloud Run → GitHub Actions

Ziel: die nächtlichen Pipelines von GCP/Vercel-Abhängigkeit lösen, wo es **sauber** geht.
Wichtige Erkenntnis: **nicht alle gehören auf GitHub Actions** — manche hängen an GCP-eigenen
APIs oder an Quellen, die Datacenter-IPs blocken. Ehrlicher Map:

## Wo läuft was — und warum

| Pipeline | Quellen | Lauft auf | Secrets nötig |
|---|---|---|---|
| **Gegenmessung** (Consensus, Pattern, Tell, Correction) | GDELT, PubMed, Philly-Fed RTDSM, eigenes Archiv | **GitHub Actions** ✅ | **keine** |
| **Half-Life** | Wikidata, Wikimedia | **GitHub Actions** ✅ | **keine** |
| **The Protocol** | 12 Quellen, u. a. **GDELT via BigQuery**, FIRMS, EIA | **GCP Cloud Run** (BigQuery nativ) | FIRMS_MAP_KEY, EIA_API_KEY, GCP-Creds |
| **Parallax** | Wikipedia + **Vertex-AI-Gemini** (LLM) | **GCP Cloud Run** (Vertex nativ) | GCP-Creds |
| **The Policy** (praemie) | **FRED** (blockt Datacenter-IPs!), NOAA, FEMA, CA DOI | **GCP Cloud Run** | keine, aber FRED-Risiko auf GH |

**Empfehlung:** Gegenmessung + Half-Life nach GitHub Actions (erledigt). **The Protocol,
Parallax, The Policy bleiben auf GCP Cloud Run** — sie brauchen GCP-APIs (BigQuery/Vertex)
bzw. FRED funktioniert nur von der GCP-IP. Diese Cron-Jobs kosten **Cent-Beträge**, *nicht*
die €21/Monat (die kommen von data-snack + datavism → Phase 2: Hetzner). Den Cron für diese
drei auf GitHub Actions zu zwingen würde die GCP-Abhängigkeit *nicht* entfernen (BigQuery/
Vertex laufen weiter auf GCP) — nur den Runner verschieben. Lohnt nicht.

## GitHub-Secrets-Anleitung

**Für die zwei migrierten Pipelines (Gegenmessung, Half-Life): keine Secrets nötig.**
Sie nutzen ausschließlich keylose Quellen, und das Committen läuft über den nativen
`GITHUB_TOKEN`, den GitHub Actions automatisch bereitstellt (Workflow hat `permissions: contents: write`).

**Falls du The Protocol / Parallax doch auf GitHub Actions ziehen willst** (nicht empfohlen,
s. o.), unter **GitHub → Repo → Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Wofür | Woher |
|---|---|---|
| `FIRMS_MAP_KEY` | NASA-FIRMS-Brände (Protocol) | https://firms.modaps.eosdis.nasa.gov/api/map_key/ |
| `EIA_API_KEY` | EIA-Ölpreis (Protocol) | https://www.eia.gov/opendata/register.php |
| `GCP_SA_KEY` | BigQuery (Protocol) + Vertex-AI-Gemini (Parallax) | GCP-Service-Account-JSON, Rollen `bigquery.jobUser` + `aiplatform.user`; im Workflow via `google-github-actions/auth@v2` einbinden, `GOOGLE_CLOUD_PROJECT=data-snack` |

`GITHUB_TOKEN` ist **nicht** als Secret anzulegen — den stellt GitHub nativ.

## Doppelläufe vermeiden (wichtig!)

Sobald eine Pipeline auf GitHub Actions bestätigt läuft, den entsprechenden **GCP-Scheduler
pausieren**, sonst committen beide:

```bash
# erledigt:
gcloud scheduler jobs pause gegenmessung-nightly --project=data-snack --location=europe-west1
# nach Bestätigung des Half-Life-Workflows:
gcloud scheduler jobs pause halbwertszeit-nightly --project=data-snack --location=europe-west1
# protokoll-/praemie-/parallaxe-nightly bleiben aktiv (laufen weiter auf GCP).
```

## Stand

- **Gegenmessung** → GitHub Actions (`.github/workflows/gegenmessung.yml`), GCP-Scheduler pausiert. ✅
- **Half-Life** → GitHub Actions (`.github/workflows/halbwertszeit.yml`); GCP-Scheduler pausieren, sobald ein Lauf grün war.
- **Protocol / Parallax / Policy** → bleiben auf GCP Cloud Run (BigQuery/Vertex/FRED). Cent-Kosten.
- Hosting frankbueltge.de → Cloudflare Pages (separater Schritt, behebt die Vercel-Sperre).
