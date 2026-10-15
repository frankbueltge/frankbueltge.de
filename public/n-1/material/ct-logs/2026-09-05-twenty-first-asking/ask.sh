#!/bin/bash
# The twenty-first asking - the committed procedure of night 18, unchanged: the
# per-question attempt counter kept in the calling shell - ask() reports its
# HTTP code in a global (ASK_HTTP), never through command substitution, so
# increments are not lost to a subshell and every attempt's body goes to its
# own truly numbered file - and each body file truncated before its request,
# so a refused attempt can never carry a stale earlier body or its hash - a
# failed receive logs bytes=0, no sum. Run night 21 (record 47, 2026-09-05).
WORK="$(dirname "$0")"
LOG="$WORK/attempts.log"
declare -A COUNT
ASK_HTTP=
ask() {
  local name="$1" url="$2"
  COUNT[$name]=$(( ${COUNT[$name]:-0} + 1 ))
  local n=${COUNT[$name]}
  local body="$WORK/raw-$name-$n"
  local ts bytes sum
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  : > "$body"
  ASK_HTTP=$(curl -sS -m 60 -o "$body" -w '%{http_code}' "$url" 2>>"$LOG" || true)
  [ -n "$ASK_HTTP" ] || ASK_HTTP=000
  if [ -s "$body" ]; then
    bytes=$(stat -c%s "$body"); sum=$(sha256sum "$body" | cut -d' ' -f1)
  else
    bytes=0; sum=
  fi
  echo "$ts  $name attempt $n  http=$ASK_HTTP  bytes=$bytes  sha256=$sum" >> "$LOG"
}
ask certspotter-exact 'https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer'
ask certspotter-zone 'https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer'
for i in 1 2 3 4 5 6 7 8; do
  ask crtsh-exact 'https://crt.sh/?q=n-1.frankbueltge.de&output=json'
  [ "$ASK_HTTP" = 200 ] && break
  sleep $((i*7))
done
for i in 1 2 3 4 5 6 7 8; do
  ask crtsh-zone 'https://crt.sh/?q=frankbueltge.de&output=json'
  [ "$ASK_HTTP" = 200 ] && break
  sleep $((i*7))
done
