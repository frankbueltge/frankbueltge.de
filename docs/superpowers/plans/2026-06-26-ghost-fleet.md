# The Ghost Fleet — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax. **Mirror the existing `pipelines/round-number/` and `pipelines/redaction/` packages and the `src/components/pages/RoundNumberPage.astro` / `src/pages/round-number/**` frontend exactly** — same structure, same conventions. This plan specifies only the Ghost-Fleet-specific pieces in full; for anything mechanical, copy the round-number analogue and swap names.

**Goal:** Build „The Ghost Fleet" / *Die Geisterflotte* — a Gegenmessung instrument that counts deliberate AIS disabling (vessels "going dark") from the GFW Events API, foregrounding gaps in protected/contested waters, with a daily index + a forensic "case of the day".

**Architecture:** Python pipeline `pipelines/ghost-fleet/` (installable, pytest): `gfw.py` (API client, Bearer token, pagination, retry) → `build.py`/`select.py` (PURE: normalise, window/plausibility filter, region salience, rank, index) → `run.py` (IO, writes `src/data/ghost-fleet/<date>.json` + `latest.json`). Astro frontend mirrors Round-Number. Nightly GitHub Actions workflow with the `GFW_TOKEN` secret.

**Tech Stack:** Python 3.12 (httpx; pytest), Astro 5 + Tailwind v4 (TS, vitest), GitHub Actions.

## Global Constraints
- Bilingual DE/EN (EN at `/`, DE at `/de/`), mirror-file pattern.
- Git is the archive; site reads committed JSON at build time.
- No LLM. No illegality/intent accusation against any vessel or state — copy must say "intentional" is ML-estimated, not proof; legitimate reasons exist.
- Determinism + test protection for `select`/`build`; the network layer (`gfw.py`) is mocked in tests.
- Provenance: each case links the GFW vessel page. Secrets redacted from error strings.
- Naming: title "The Ghost Fleet", DE "Die Geisterflotte", route `/ghost-fleet`, Methodenblatt `/werke/ghost-fleet`, i18n prefix `gf.`, OG slug `ghost-fleet`, data dir `src/data/ghost-fleet/`, pipeline `pipelines/ghost-fleet/` (package `ghost_fleet`), git bot `Gegenmessung <gegenmessung@frankbueltge.de>`.
- Data path: flat `src/data/ghost-fleet/<YYYY-MM-DD>.json` + `latest.json`.

## Confirmed GFW facts (live-verified 2026-06-26)
- `GET https://gateway.api.globalfishingwatch.org/v3/events` · `datasets[0]=public-global-gaps-events:latest` · params `start-date`,`end-date` (ISO date), `limit`,`offset` (offset REQUIRED when limit sent) · header `Authorization: Bearer <token>`.
- Response: `{ total: int, entries: [event...] }`. Event keys: `id`, `start`, `end`, `position{lat,lon}`, `regions{mpa[],mpaNoTake[],eez[],eez12Nm[],highSeas[],rfmo[],fao[]}`, `vessel{id,name,ssvid,flag,type}`, `gap{durationHours,distanceKm,intentionalDisabling,offPosition{lat,lon},onPosition{lat,lon},...}`.
- Raw data contains artifacts (a 9-year "gap" was observed) → must cap duration + window on `end`.
- GFW vessel URL: `https://globalfishingwatch.org/vessel/<vessel.id>`.

---

## Task 1: Scaffold (package `ghost_fleet`)
Copy `pipelines/round-number/pyproject.toml` → `pipelines/ghost-fleet/pyproject.toml`, changing `name = "ghost-fleet"`, `description`, and `[tool.setuptools.packages.find]`/package-data to `ghost_fleet`. **Add dependency `httpx>=0.27`** (round-number had none). Add `.gitignore` (`.venv/`,`__pycache__/`,`*.egg-info/`). `src/ghost_fleet/__init__.py` with `PIPELINE_VERSION="0.1.0"`, `SCHEMA_VERSION="1"`. Smoke test `tests/test_smoke.py`. Create venv, `pip install -e ".[dev]"`, pytest. Commit `feat(ghost-fleet): scaffold`.

---

## Task 2: `build.normalize` (raw GFW event → clean event) — PURE, TDD
**Files:** Create `src/ghost_fleet/build.py`; Test `tests/test_normalize.py`

**Produces:** `normalize(raw: dict) -> dict | None`. Maps a raw GFW gap event to:
```
{ "id", "vessel": {"name","flag","type"}, "start", "end", "duration_hours": float,
  "off": {"lat","lon"}, "on": {"lat","lon"},
  "regions": {"mpa": bool, "no_take": bool, "eez": list[str], "high_seas": bool},
  "gfw_url": "https://globalfishingwatch.org/vessel/<vessel.id>" }
```
Returns `None` if `id`, `vessel`, `gap.durationHours`, `start` or `end` are missing. `mpa = bool(regions.mpa)`, `no_take = bool(regions.mpaNoTake)`, `high_seas = bool(regions.highSeas)`, `eez = regions.eez or []`. `off = gap.offPosition`, `on = gap.onPosition` (fall back to `position` if onPosition missing).

- [ ] Test: a full raw event (use a trimmed copy of the real shape below) → normalised dict with `duration_hours` float, `regions.no_take is True` when `mpaNoTake` non-empty, `gfw_url` correct. Missing-vessel raw → None.
- [ ] Implement, run, commit.

Real raw event shape for the fixture (trimmed):
```json
{"id":"abc","type":"gap","start":"2026-06-10T00:00:00.000Z","end":"2026-06-12T06:00:00.000Z",
 "position":{"lat":14.2,"lon":145.0},
 "regions":{"mpa":["x"],"mpaNoTake":["y"],"eez":["8314"],"highSeas":[],"rfmo":["WCPFC"]},
 "vessel":{"id":"v1","name":"DONGWON NO.16","ssvid":"440825000","flag":"KOR","type":"fishing"},
 "gap":{"durationHours":54.0,"distanceKm":120,"intentionalDisabling":true,
        "offPosition":{"lat":14.2,"lon":145.0},"onPosition":{"lat":15.1,"lon":146.2}}}
```

---

## Task 3: `select` (filter, salience, rank, index) — PURE, TDD
**Files:** Create `src/ghost_fleet/select.py`; Test `tests/test_select.py`

**Constants:** `WINDOW_DAYS = 7`, `MAX_DURATION_HOURS = 1440` (60 days — longer = artifact/ongoing), `REGION_WEIGHT = {"no_take":4,"mpa":3,"eez":2,"high_seas":1}`.

**Produces (all operate on *normalised* events):**
- `ended_within(ev, today: date, days=WINDOW_DAYS) -> bool` — `0 <= (today - date(ev["end"])) .days <= days` (parse `end` ISO).
- `plausible(ev, max_hours=MAX_DURATION_HOURS) -> bool` — `0 < ev["duration_hours"] <= max_hours`.
- `salience(ev) -> int` — `region_weight*100000 + int(min(ev["duration_hours"], max))`; `region_weight` = 4 if `no_take` else 3 if `mpa` else 2 if `eez` else 1 (high seas / none).
- `rank(events) -> str | None` — id of max salience; tie-break: smaller `id`. None if empty.
- `index(events, total: int) -> dict` — `{ "total": total, "dark_hours_examined": round(sum durations,1), "in_mpa": count mpa, "in_no_take": count no_take, "on_high_seas": count high_seas }`.

- [ ] Tests: `ended_within` true/false across the 7-day edge; `plausible` rejects 0 and >1440h; `salience` orders no_take > mpa > eez > high_seas, duration tie-breaks within a region; `rank` deterministic + None on empty; `index` sums/counts correctly.
- [ ] Implement, run, commit `feat(ghost-fleet): selection logic (tested)`.

---

## Task 4: `gfw.py` (API client) — mocked tests
**Files:** Create `src/ghost_fleet/gfw.py`; Test `tests/test_gfw.py`

**Produces:**
- `class SourceUnavailable(Exception)`.
- `fetch_gaps(token: str, *, client: httpx.Client, start: str, end: str, cap: int = 1500, page: int = 100) -> tuple[list[dict], int]` — pages `/v3/events` (gaps dataset) with `limit=page&offset=k` until `cap` reached or entries exhausted; returns `(events, total)` where `total` is the API's `total`. Retry/backoff like `pipelines/redaction/src/redaction/cdx.py`; raise `SourceUnavailable` on HTTP error; **redact the token** (never put the Authorization header / token in an error string).

Endpoint/params exactly as in "Confirmed GFW facts". Auth header `Authorization: Bearer <token>`.

- [ ] Tests (httpx.MockTransport): a 2-page response (`total`=150, pages of 100 then 50) → returns 150 events + total 150; `cap=100` stops after one page; HTTP 500 after retries → `SourceUnavailable` with the token NOT in the message.
- [ ] Implement, run, commit.

---

## Task 5: `run.py` (orchestration + IO) — mocked test
**Files:** Create `src/ghost_fleet/run.py`; Test `tests/test_run.py`

**Produces:** `run(*, client, token, today: date) -> dict` (fetch → normalise → filter `ended_within`+`plausible` → `index` → `rank` → top-12-by-salience events → `build.day_record`; writes nothing). `main(argv=None) -> int` — CLI `--repo-root`,`--date`; token from env `GFW_TOKEN`; writes `src/data/ghost-fleet/<date>.json` + `latest.json`. Query window: `start = today-10d`, `end = today`.

`build.day_record(date_iso, generated_at, window: dict, index: dict, events_top: list[dict], pick: str|None) -> dict` and `build.to_json(record)` (sorted keys, indent 2, newline) — add to `build.py` (Task 2 file). Window dict: `{from, to, ended_within_days: 7, examined: len(filtered), capped: bool}`. Record top-level: `date, generated_at, schema_version, pipeline_version, window, index, pick, events, source`. `source = {"name":"Global Fishing Watch — Events API (AIS gaps)","url":"https://globalfishingwatch.org/our-apis/","license":"GFW non-commercial; attribution required"}`.

- [ ] Test: mocked client returns a handful of raw events (some in-window/plausible, one artifact >1440h, one old) → `run` keeps the right ones, `pick` set, `index.total` passed through. Full suite green.
- [ ] Implement, run, commit.

---

## Task 6: TS types + format — vitest
**Files:** `src/lib/ghost-fleet/types.ts`, `format.ts`, `format.test.ts`. Mirror `src/lib/round-number/`.
- `types.ts`: `GhostFleetData`, `GfEvent`, `Index`, `Window` — match `day_record` exactly.
- `format.ts`: `hoursLabel(h, locale)` ("54 h" / "54 Std."), `coord(lat, lon)` → e.g. `14.2°N, 145.0°E`, `dateLabel(iso, locale)` (copy from round-number), `flagLabel`/region helpers as needed.
- [ ] vitest tests for `hoursLabel` + `coord`. Implement, run, commit.

---

## Task 7: Frontend pages + Methodenblatt
**Files:** `src/components/pages/GhostFleetPage.astro`, `MethodenblattGhostFleet.astro`, four routes (`src/pages/ghost-fleet/index.astro`, `src/pages/de/ghost-fleet/index.astro`, `src/pages/werke/ghost-fleet.astro`, `src/pages/de/werke/ghost-fleet.astro`), seed `src/data/ghost-fleet/latest.json` (`pick:null`, empty events/index).

**Mirror `RoundNumberPage.astro` exactly.** Content:
- header: h1 "The Ghost Fleet" + `t(locale,'gf.sub')` + date.
- pending (`index.total===0 && events.length===0`) → `gf.empty`.
- else: **case of the day** (the `pick` event): kicker „Der Fall des Tages"/"The case of the day"; vessel name + flag + type; a line „verschwunden bei {off} → wieder aufgetaucht bei {on}"; „{hours} dunkel"; region badge (No-Take/MPA/EEZ/Hohe See); GFW link. Then the **index line** (big number = `index.total`): „Schiffe wurden zuletzt dunkel — {in_no_take}+{in_mpa} in Schutzgebieten, zusammen {dark_hours_examined} Dunkel-Stunden (geprüft)". Then **other cases** list (vessel, flag, hours, region, GFW ↗). Footer note: intent is ML-estimated, no illegality claim, method-sheet link.
- Methodenblatt: mirror `MethodenblattRoundNumber.astro` sections (was es ist; 1 Quellen=GFW gap events; 2 Kadenz=täglich, Fenster 7 Tage; 3 Verarbeitung=Abruf→Normalisieren→Filter→Salienz/Index/Pick; AI/ML block — GFWs Intentions-ML offengelegt, „likely"; 4 Grenzen per spec §6; 5 Compute=leichte API-Abrufe mit Token; 6 Änderungsprotokoll v1). Link `→ pipelines/ghost-fleet`.
- [ ] `npm run check` clean. Commit.

---

## Task 8: Wire-up
- `src/i18n/ui.ts`: add to `de` & `en` `gf.title`='The Ghost Fleet', `gf.sub` (de „Schiffe, die ihren Transponder bewusst abschalten — gezählt, wo sie sich am meisten verstecken." / en "Ships that switch off their transponder on purpose — counted where they hide most."), `gf.empty` (de „Die erste Feststellung folgt mit dem nächsten nächtlichen Lauf." / en "The first finding follows with the next nightly run.").
- `src/lib/og.ts`: add `'ghost-fleet': { title:'The Ghost Fleet', description:'…' }` to `OG_PAGES` + `if (p.startsWith('/ghost-fleet') || p.startsWith('/werke/ghost-fleet')) return 'ghost-fleet'`.
- `src/data/werke.ts`: add `ghost-fleet` Werk (status 'live', href '/ghost-fleet', line Gegenmessung, DE/EN subtitle+description per spec).
- `package.json`: `"ghost-fleet:refresh": "pipelines/ghost-fleet/.venv/bin/python -m ghost_fleet.run --repo-root ."`.
- [ ] `npm run check && npm run test` green. Commit.

---

## Task 9: CI + nightly workflow
- `.github/workflows/ghost-fleet.yml`: mirror `round-number.yml` (cron `0 4 * * *`), but **the run step needs the token**: `env: GFW_TOKEN: ${{ secrets.GFW_TOKEN }}` on the "run" step; install `./pipelines/ghost-fleet`; `python -m ghost_fleet.run --repo-root .`; commit `src/data/ghost-fleet` as bot `Gegenmessung`; push-retry loop.
- `.github/workflows/ci.yml`: add a `ghost-fleet` pytest job (mirror the `round-number` job, working-directory `pipelines/ghost-fleet`).
- [ ] Commit.

---

## Task 10 (OPUS, not delegated): real data + verify + deploy
- [ ] Set the `GFW_TOKEN` GitHub secret.
- [ ] Live run (sandbox disabled) with the token → inspect `latest.json`: real cases, plausible durations (no 9-year artifacts), region attribution sane, GFW links resolve, **no intent/illegality overclaim**.
- [ ] `npm run check && npm run test && npm run build` clean.
- [ ] Screenshot the rendered case-of-the-day; critical review.
- [ ] **Only if clean:** merge `feat/ghost-fleet` → `main`, deploy, verify live. **If anything is off, HOLD and report.**

## Self-Review (against spec)
§2 source → Task 4 ✓ · §3 window/index/pick → Tasks 3,5 ✓ · §4 data model → Tasks 2,5,6 ✓ · §5 provenance/error-as-form → Tasks 4,5 ✓ · §6 limits → Task 7 Methodenblatt ✓ · §7 gate → across ✓ · §8 pipeline/determinism → Tasks 2-5,9 ✓ · §9 frontend → Tasks 6-8 ✓ · §10 tests → pytest+vitest ✓ · §11 non-goals → honored ✓.
No placeholders (open tuning params are constants set in Task 3). Types: normalised-event shape (Task 2) === TS `GfEvent` (Task 6) === `day_record.events` (Task 5).

## Notes for the executor
- All work on `feat/ghost-fleet`. Merge/deploy is Opus-only (Task 10), and only on clean data.
- Keep test assertions intact; if a bound is borderline, adjust inputs not assertions.
- Never log/commit the token. Never claim a vessel did something illegal.
