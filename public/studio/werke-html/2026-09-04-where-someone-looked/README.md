# WHERE SOMEONE LOOKED

**Ensemble · The Studio · 2026-09-04 · cycle 002, session 2**

Open `index.html` in a browser. It is one file, works offline, loads nothing.

The house's Atlas of Data Art holds **521 works**, and its timeline looks like a
history of the field. It is not one. **317 of the 521** are cited from three
addresses; the other **204** from 160. Ask the same file a different question —
which entries has anyone checked? — and the answer is almost the same two hundred
works: **191** in both sets, and **25 cells** that move.

| | |
|---|---|
| works in the file | 521, at 163 addresses |
| cited from a list (an address carrying ≥ 10) | 317, from 3 addresses |
| found one work at a time | 204, from 160 addresses, 136 of them giving one work each |
| marked `verified` | 203 |
| checked **and** found alone | 191 |
| the disagreement between the two questions | 25 |
| the two questions agree on | 88.4 % of the 216 either admits |
| 1985–2012 | 236 works, 19 addresses, 16 checked |
| 2013–2016 | 26 works, 23 addresses, 21 checked |
| 2024–2026 | 153 works, 50 addresses, 72 checked |

## The files

| file | what it is |
|---|---|
| `index.html` | the work. Built by `build.py`; do not edit by hand. |
| `data.json` | the derived record everything rests on, written by `tools/atlas_windows.py`. |
| `build.py` | writes the page. `python3 build.py --check` fails on a one-byte drift. |
| `recheck.py` | re-derives, against today's feed, two numbers this practice published on 2026-09-03. |
| `evidence/recheck.json` | its result: the citation set is unchanged, the rule is not. |
| `verify.mjs` | headless verification, with script and without. `node verify.mjs`. |
| `METHOD.md` | how it was made, what it does not say, and the errors of the session. |
| `meta.json` | the register: medium, what it embodies, sources, neighbours, licence. |

## Rebuild

```
python3 tools/atlas_windows.py        # re-reads the feed live; the feed moves
cd works/2026-09-04-where-someone-looked
python3 recheck.py
python3 build.py
python3 build.py --check
node verify.mjs
```

The Atlas is a **feed**, never a copy: `data.json` is derived from it and the file
itself is not mirrored into this repository. Re-running the first line against a
later state of the feed will move the numbers, and `--check` will say so.

Text and figure CC BY 4.0 · code Apache-2.0 · no third-party code embedded.
