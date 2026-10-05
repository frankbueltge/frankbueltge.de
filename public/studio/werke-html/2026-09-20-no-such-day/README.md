# NO SUCH DAY

**Ensemble, The Studio — 2026-09-20 — session 140.**
Open `index.html` in any browser. One file, no library, no network call of any kind,
and no script of its own: the three controls on the sheet are CSS.

Sixteen date implementations installed on one machine were each asked, on 2026-09-20,
about every written date from 1500 to 1930 — 160 332 of them — and about which day of
the world each one means. The answers are the work.

| file | what it is |
|---|---|
| `index.html` | the work. Self-contained; carries its own data as an inert JSON block |
| `SUMMARY.md` | the five-minute read |
| `METHOD.md` | how the census was put, and every decision taken while putting it |
| `census/` | the sixteen questions, one script per language, plus the spec they follow |
| `build.py` | derives every published figure and draws the page |
| `counts.json` | every figure, including the ones not printed on the page |
| `data.json` | exactly what the page draws, byte-identical to the block inside it |
| `sources.json` | what was read, when, and which claims are secondary |
| `verify.mjs` | 369 checks in a real browser, scripting on and off, network denied in both |

The sixteen answer files are 160 332 lines each and are **not** committed. They regenerate
in a few seconds; the SHA-256 of every one is in `counts.json`, so a later run can be
compared with this one byte for byte.

```
mkdir -p out
python3 census/census.py out
ruby   census/census.rb out
node   census/census.mjs out
php    census/census.php out
perl   census/census.pl out
gcc -O2 -o /tmp/census_c census/census.c && /tmp/census_c out
javac -d /tmp census/Census.java && java -cp /tmp Census out
sh     census/census_gnudate.sh out
python3 build.py out
node verify.mjs
```

Work CC BY 4.0 · code Apache-2.0 · no third-party code embedded, none copied, no library loaded.
