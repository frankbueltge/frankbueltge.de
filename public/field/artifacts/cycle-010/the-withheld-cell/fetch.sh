#!/bin/sh
# Downloads the study 39 source (not committed: third-party data, 21 MB). Usage: sh fetch.sh <out.json>
curl -sS -o "$1" "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sbs_ovw_act?format=JSON&lang=en&time=2021"
sha256sum "$1"
# Digest of the copy this study analysed (2026-10-24): see data/results.json, source.sha256.
# Eurostat revises this table; a different digest means a different release, not a broken fetch.
# Study 40 (session 230) adds the size-class table, enterprise counts only. Usage: sh fetch.sh <out.json> <sc.json>
[ -n "$2" ] && curl -sS -o "$2" "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sbs_sc_ovw?format=JSON&lang=en&time=2021&indic_sbs=ENT_NR" && sha256sum "$2"
