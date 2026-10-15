#!/bin/bash
# The sixteenth asking - procedure of night 16 (revised after night 15's slips):
# the same function that makes each request writes its dated log line, and every
# attempt's body goes to its own numbered file.
WORK="$(dirname "$0")"
LOG=/home/user/n-1/material/ct-logs/2026-08-31-sixteenth-asking/attempts.log
declare -A COUNT
ask() {
  local name="$1" url="$2"
  COUNT[$name]=$(( ${COUNT[$name]:-0} + 1 ))
  local n=${COUNT[$name]}
  local body="$WORK/raw-$name-$n"
  local ts http bytes sum
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  http=$(curl -sS -m 60 -o "$body" -w '%{http_code}' "$url" 2>>"$LOG" || echo 000)
  if [ -s "$body" ]; then
    bytes=$(stat -c%s "$body"); sum=$(sha256sum "$body" | cut -d' ' -f1)
  else
    bytes=0; sum=
  fi
  echo "$ts  $name attempt $n  http=$http  bytes=$bytes  sha256=$sum" >> "$LOG"
  echo "$http"
}
ask certspotter-exact 'https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer'
ask certspotter-zone 'https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer'
for i in 1 2 3 4 5 6 7 8; do
  h=$(ask crtsh-exact 'https://crt.sh/?q=n-1.frankbueltge.de&output=json')
  [ "$h" = 200 ] && break
  sleep $((i*7))
done
for i in 1 2 3 4 5 6 7 8; do
  h=$(ask crtsh-zone 'https://crt.sh/?q=frankbueltge.de&output=json')
  [ "$h" = 200 ] && break
  sleep $((i*7))
done
