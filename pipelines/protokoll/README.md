# Protokoll-Pipeline — Runbook

Nächtlicher Cloud Run Job. Schreibt `src/content/protokoll/<jahr>/<datum>.json`
per GitHub-Commit (Autorin „Protokollführung") → Pages-Rebuild.

## Lokal

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev,bq]"
pytest -q
# Trockenlauf (schreibt ins Repo, committet nichts):
export FIRMS_MAP_KEY=... EIA_API_KEY=...
python -m protokoll.run --dry-run --repo-root ../..
```

Ohne Keys/GCP-Login laufen die betroffenen TOPs auf „Feststellung entfällt" —
amtlich korrekt, aber für echte Sitzungen Keys setzen und
`gcloud auth application-default login` ausführen (GDELT).

## GCP-Deploy (einmalig)

```bash
PROJECT=<PROJECT_ID>; REGION=europe-west1
gcloud config set project $PROJECT
gcloud services enable run.googleapis.com cloudscheduler.googleapis.com \
  artifactregistry.googleapis.com cloudbuild.googleapis.com \
  bigquery.googleapis.com secretmanager.googleapis.com

gcloud artifacts repositories create werke --repository-format=docker --location=$REGION

# Service Account + Rechte
gcloud iam service-accounts create protokoll-runner
SA=protokoll-runner@$PROJECT.iam.gserviceaccount.com
gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA \
  --role=roles/bigquery.jobUser
gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA \
  --role=roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA \
  --role=roles/run.invoker

# Secrets (GitHub Fine-Grained PAT: nur dieses Repo, Contents Read/Write)
echo -n "<github-pat>"  | gcloud secrets create protokoll-github-token --data-file=-
echo -n "<firms-key>"   | gcloud secrets create protokoll-firms-key  --data-file=-
echo -n "<eia-key>"     | gcloud secrets create protokoll-eia-key    --data-file=-

# Build + Job
gcloud builds submit . --tag $REGION-docker.pkg.dev/$PROJECT/werke/protokoll:latest
gcloud run jobs create protokoll \
  --image $REGION-docker.pkg.dev/$PROJECT/werke/protokoll:latest \
  --region $REGION --service-account $SA --max-retries 1 --task-timeout 10m \
  --set-secrets "GITHUB_TOKEN=protokoll-github-token:latest,FIRMS_MAP_KEY=protokoll-firms-key:latest,EIA_API_KEY=protokoll-eia-key:latest" \
  --set-env-vars "GITHUB_REPO=frankbueltge/frankbueltge.de"

# Nächtlich 03:30 UTC
gcloud scheduler jobs create http protokoll-nightly --location $REGION \
  --schedule "30 3 * * *" --time-zone "Etc/UTC" --http-method POST \
  --uri "https://run.googleapis.com/v2/projects/$PROJECT/locations/$REGION/jobs/protokoll:run" \
  --oauth-service-account-email $SA

# Budget-Alert (Console): Billing → Budgets → 10 EUR/Monat, Alarm bei 50/90/100 %.
```

## Update deployen

```bash
gcloud builds submit . --tag $REGION-docker.pkg.dev/$PROJECT/werke/protokoll:latest
gcloud run jobs update protokoll --image $REGION-docker.pkg.dev/$PROJECT/werke/protokoll:latest --region $REGION
```

## Manueller Lauf / Backfill

```bash
gcloud run jobs execute protokoll --region $REGION            # heute
gcloud run jobs execute protokoll --region $REGION --args="--date,2026-06-10"
```

## Redaktionelle Pflege

- `src/protokoll/data/refugees.json`: bei UNHCR-Global-Trends-Veröffentlichung aktualisieren.
- `src/protokoll/data/food.json`: monatlich nach FAO-FPI-Release aktualisieren.
- `src/protokoll/data/../adapters/population.py`: Konstanten nach neuer UN-WPP-Revision prüfen (Warnung ab 2027-07-01).
- Danach: neues Image deployen (s. o.).
