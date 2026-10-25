#!/bin/sh
# Downloads the 27 national SBS quality reports for reference year 2021 (study 41; not committed:
# third-party pages). Usage: sh fetch_meta.sh <outdir>. Digests of the copies analysed: data/results-3.json, source.metadata.
mkdir -p "$1"
for c in at be bg cy cz de dk ee el es fi fr hr hu ie it lt lu lv mt nl pl pt ro se si sk; do
  curl -sS -o "$1/sbs_essbs21_$c.htm" "https://ec.europa.eu/eurostat/cache/metadata/EN/sbs_essbs21_$c.htm"
done
sha256sum "$1"/*.htm
