# Schlankes, gemeinsames Image für alle vier Gegenmessungs-Pipelines.
# Die Skripte selbst leben im Repo (zur Laufzeit geklont) — das Image ändert sich nur,
# wenn sich die Abhängigkeiten ändern → minimale Artifact-Registry-Last.
FROM python:3.12-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Correction braucht pandas/openpyxl (XLSX), Pattern numpy. Consensus/Tell sind stdlib.
RUN pip install --no-cache-dir "pandas>=2,<3" openpyxl numpy

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
