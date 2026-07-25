#!/bin/bash
# Nächtlicher Atlas-Scout auf dem eigenen Rechner.
#
# Dasselbe wie der nächtliche GitHub-Actions-Lauf, nur lokal — für alle, die den Scout
# auf dem eigenen Rechner laufen lassen wollen statt in Actions. Es braucht weder
# Schlüssel noch Modell: OpenAlex und ArtBase sind beide schlüsselfrei.
#
# Einrichten:
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

# 3. Werke: zwei der sechs neuen Felder je Nacht (ArtBase, schlüsselfrei).
ERSTES=$(( 8 + (10#$(date -u +%j) * 2) % 6 ))
ZWEITES=$(( 8 + (10#$(date -u +%j) * 2 + 1) % 6 ))
for FELD in "$ERSTES" "$ZWEITES"; do
  vermerk "Werke, Feld $FELD"
  "$PYTHON" -m atlas_scout.run --atlas werke --thema "$FELD" 2>&1 | tee -a "$PROTOKOLL"
done

# 4. Aufnehmen: reihum über die Felder, gedeckelt, als "toVerify" markiert.
vermerk "Aufnahme"
"$PYTHON" -m atlas_scout.aufnahme --hoechstzahl 30 2>&1 | tee -a "$PROTOKOLL"

vermerk "── Lauf beendet ──"
