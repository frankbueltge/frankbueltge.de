# Gegenmessung — nächtlicher Sammel-Job

Ein **gemeinsamer** Cloud Run Job für alle vier Gegenmessungs-Instrumente
(The Consensus, The Correction, The Tell, The Pattern). Er klont das Repo, läuft die
Refresh-Skripte und committet die geänderten Daten-JSONs zurück (→ Pages-Rebuild).

- **Consensus + Pattern:** täglich. **Tell + Correction:** wöchentlich (Montag) —
  ihre Quellen (PubMed-Jahresdaten, RTDSM-Monatsdaten) ändern sich täglich kaum.
- Ein schlankes Image (`Dockerfile`); die Logik lebt im Repo, nicht im Image →
  minimale Artifact-Registry-Last. Image ändert sich nur bei Dependency-Wechsel.

## Betrieb (GCP, Projekt `data-snack`, Region `europe-west1`)

Spiegelt das Protokoll-Setup: Service-Account `protokoll-runner`, Secret
`protokoll-github-token` (GitHub Fine-Grained PAT, nur dieses Repo, Contents R/W).

```bash
# Image neu bauen (nur nötig, wenn sich Dockerfile/Dependencies ändern):
gcloud builds submit pipelines/gegenmessung \
  --tag europe-west1-docker.pkg.dev/data-snack/werke/gegenmessung:latest --project data-snack

# Job (einmalig angelegt):
gcloud run jobs create gegenmessung \
  --image europe-west1-docker.pkg.dev/data-snack/werke/gegenmessung:latest \
  --region europe-west1 --project data-snack \
  --service-account protokoll-runner@data-snack.iam.gserviceaccount.com \
  --set-secrets GITHUB_TOKEN=protokoll-github-token:latest \
  --set-env-vars GITHUB_REPO=frankbueltge/frankbueltge.de \
  --memory 1Gi --cpu 1 --task-timeout 900 --max-retries 1

# Scheduler (täglich 6:00 UTC, nach den anderen Pipelines):
gcloud scheduler jobs create http gegenmessung-nightly \
  --project data-snack --location europe-west1 \
  --schedule "0 6 * * *" --time-zone "Etc/UTC" \
  --uri "https://run.googleapis.com/v2/projects/data-snack/locations/europe-west1/jobs/gegenmessung:run" \
  --http-method POST \
  --oauth-service-account-email protokoll-runner@data-snack.iam.gserviceaccount.com

# Manuell auslösen / Logs:
gcloud run jobs execute gegenmessung --region europe-west1 --project data-snack
gcloud logging read 'resource.labels.job_name=gegenmessung' --project data-snack --limit 50
```

## Betriebshinweise

- **GDELT** (Consensus) drosselt die DOC-API hart (HTTP 429), auch aus Cloud Run. Das
  Skript pacet/retryt und nimmt, was es kriegt; an schlechten Tagen fallen Beats aus
  (im `stats.per_beat` je Tag ausgewiesen). Härtung später: längeres Pacing oder ein Key.
- **The Pattern** liest das wachsende Protokoll-Archiv — mit mehr Tagen aussagekräftiger.
- Lokaler Trockenlauf eines Instruments: `npm run consensus:refresh` (bzw. `correction:`,
  `tell:`, `pattern:refresh`) — schreibt JSON, committet nichts.
