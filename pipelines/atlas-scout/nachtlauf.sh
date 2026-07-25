#!/bin/bash
# Nächtlicher Atlas-Scout auf dem eigenen Rechner.
#
# Warum lokal und nicht in GitHub Actions: Die Nachbarschaft und die thematischen Sweeps
# laufen dort bereits (OpenAlex ist schlüsselfrei, siehe .github/workflows/atlas-scout.yml).
# Der Werke-Schritt braucht ein Modell, und ein per `ant auth login` angelegtes Profil
# lebt in ~/.config/anthropic — Actions sieht es nicht. Wer das Abo nutzt statt eines
# API-Keys, lässt diesen Schritt deshalb hier laufen.
#
# Einrichten:
#   ant auth login
#   launchctl load ~/Library/LaunchAgents/de.frankbueltge.atlas-scout.plist
#
# Von Hand:
#   pipelines/atlas-scout/nachtlauf.sh

set -uo pipefail

WURZEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PYTHON="$WURZEL/pipelines/atlas-scout/.venv/bin/python"
PROTOKOLL="$WURZEL/pipelines/atlas-scout/nachtlauf.log"
cd "$WURZEL" || exit 1

export ATLAS_SCOUT_MAILTO="${ATLAS_SCOUT_MAILTO:-f.bueltge@gmail.com}"

vermerk () { echo "[$(date -u +%FT%TZ)] $*" | tee -a "$PROTOKOLL"; }

vermerk "── Lauf beginnt ──"

# 1. Nachbarschaft: deterministische Rotation über den Tag im Jahr, damit der Atlas
#    über die Nächte einmal umrundet wird.
ANZAHL=10
VERSATZ=$(( 10#$(date -u +%j) * ANZAHL ))
vermerk "Nachbarschaft (Versatz $VERSATZ)"
"$PYTHON" -m atlas_scout.run --atlas theorie --anzahl "$ANZAHL" --versatz "$VERSATZ" \
  2>&1 | tee -a "$PROTOKOLL"

# 2. Thematischer Sweep: eines der sechs neuen Felder, rotierend.
FELD=$(( 8 + 10#$(date -u +%j) % 6 ))
vermerk "Thematischer Sweep, Feld $FELD"
"$PYTHON" -m atlas_scout.run --atlas theorie --thema "$FELD" 2>&1 | tee -a "$PROTOKOLL"

# 3. Werke aus Ausstellungsmeldungen — braucht ein Modell.
if ant auth status >/dev/null 2>&1 && ant auth status 2>&1 | grep -q "not configured"; then
  vermerk "kein ant-Profil — Werke-Schritt übersprungen (ant auth login)"
elif [ -z "${ANTHROPIC_API_KEY:-}" ] && ! command -v ant >/dev/null 2>&1; then
  vermerk "weder ant-Profil noch API-Key — Werke-Schritt übersprungen"
else
  vermerk "Werke aus Meldungen"
  "$PYTHON" -m atlas_scout.run --atlas werke --anzahl 25 2>&1 | tee -a "$PROTOKOLL"
fi

vermerk "── Lauf beendet ──"
