#!/usr/bin/env bash
# Gegenmessung — nächtlicher Sammel-Lauf (ein Cloud Run Job für alle vier Instrumente).
# Klont das Repo, läuft die Refresh-Skripte, committet die geänderten Daten-JSONs zurück
# (→ Pages-Rebuild). Consensus + Pattern täglich; Tell + Correction wöchentlich (Montag).
set -euo pipefail
: "${GITHUB_TOKEN:?GITHUB_TOKEN fehlt}"
: "${GITHUB_REPO:?GITHUB_REPO fehlt}"

WORK="$(mktemp -d)"
git clone --depth 1 "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git" "$WORK/repo"
cd "$WORK/repo"
git config user.name "Gegenmessung"
git config user.email "gegenmessung@frankbueltge.de"

DOW="$(date -u +%u)"   # 1 = Montag … 7 = Sonntag
run () { echo ">> $1"; python3 "$1" || echo "!! $1 fehlgeschlagen — übersprungen, kein Abbruch"; }

run pipelines/consensus/refresh.py
run pipelines/pattern/refresh.py
if [ "$DOW" = "1" ]; then
  run pipelines/tell/refresh.py
  run pipelines/revision/refresh.py
fi

git add src/data/consensus src/data/pattern src/data/tell src/data/revision 2>/dev/null || true
if git diff --cached --quiet; then
  echo "Keine Änderungen — nichts zu committen."
else
  git commit -m "gegenmessung: nightly refresh ($(date -u +%F))"
  for i in 1 2 3; do
    if git pull --rebase --autostash origin main && git push origin HEAD:main; then
      echo "Gepusht."; break
    fi
    echo "Push-Versuch $i fehlgeschlagen, neu versuchen …"; sleep 5
  done
fi
