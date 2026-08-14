"""BigQuery access to GDELT's Global Difference Graph — the chamber's one
GCP step (G1 path, active since 2026-08-09).

Runs via the `bq` CLI so the pipeline stays stdlib-only. Every query commits
its trace (query text is versioned here; job ID and bytes billed are captured
at run time — job history expires after 180 days). When `bq` is absent or
unauthenticated the chamber degrades honestly: the day is written with the
GDG section marked unavailable, never fabricated.

License notice: Data: The GDELT Project — https://www.gdeltproject.org/
(citation + link travel with every derived committed file).
"""
from __future__ import annotations

import json
import re
import subprocess
import time
from dataclasses import dataclass, field

DEFAULT_PROJECT = "gen-lang-client-0843427097"  # the house project (gcp-activation doc)
TABLE = "`gdelt-bq.gdeltv2.gdg_partitioned`"

# DAY-partitioned on fetchdate_check (not _PARTITIONTIME) — verified 2026-08-14.
QUERY_COUNTS = (
    "SELECT status, COUNT(*) AS c FROM " + TABLE
    + " WHERE DATE(fetchdate_check) = '{day}' GROUP BY status ORDER BY c DESC"
)
QUERY_TITLES = (
    "SELECT page_url, page_domain_root, page_title, title_new,"
    " FORMAT_TIMESTAMP('%FT%TZ', fetchdate_orig) AS fetched_orig,"
    " FORMAT_TIMESTAMP('%FT%TZ', fetchdate_check) AS fetched_check"
    " FROM " + TABLE
    + " WHERE DATE(fetchdate_check) = '{day}'"
    " AND status = 'PAGE_TITLECHANGE' AND page_lang = 'en'"
    " AND page_title IS NOT NULL AND title_new IS NOT NULL"
)

_DAY = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class GdgError(RuntimeError):
    pass


@dataclass
class GdgResult:
    available: bool
    day: str
    counts: dict[str, int] = field(default_factory=dict)
    rows: list[dict] = field(default_factory=list)
    traces: list[dict] = field(default_factory=list)
    note: str | None = None


def _run_bq(args: list[str], *, timeout: int = 600) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["bq", *args], capture_output=True, text=True, timeout=timeout, check=False
    )


def _job_trace(job_id: str, project: str, runner=_run_bq) -> dict:
    r = runner(["show", "--job=true", "--format=json", f"--project_id={project}", job_id])
    if r.returncode != 0:
        return {"job_id": job_id, "note": "trace fetch failed"}
    stats = json.loads(r.stdout).get("statistics", {})
    return {
        "job_id": job_id,
        "project": project,
        "created": stats.get("creationTime"),
        "bytes_billed": int(stats.get("query", {}).get("totalBytesBilled", 0)),
    }


def _query(sql: str, job_id_base: str, project: str, runner=_run_bq) -> tuple[list[dict], dict]:
    """Run one query with a deterministic, traceable job ID; a rerun of the
    same night gets a `_rN` suffix instead of colliding."""
    last_err = ""
    for attempt in range(1, 7):
        if attempt == 1:
            job_id = job_id_base  # the nightly normal case: one clean, dated id
        elif attempt < 6:
            job_id = f"{job_id_base}_r{attempt}"
        else:
            job_id = f"{job_id_base}_t{int(time.time())}"  # rerun storms cannot collide
        r = runner([
            "query", f"--project_id={project}", "--use_legacy_sql=false",
            "--format=json", "--max_rows=100000",  # bq silently caps at 100 otherwise
            f"--job_id={job_id}", "--quiet", sql,
        ])
        if r.returncode == 0:
            rows = json.loads(r.stdout or "[]")
            return rows, _job_trace(job_id, project, runner)
        last_err = (r.stderr or r.stdout or "").strip()[-500:]
        if "already exists" not in last_err.lower():
            break
    raise GdgError(last_err or "bq query failed")


def fetch_day(day: str, *, project: str = DEFAULT_PROJECT, runner=_run_bq) -> GdgResult:
    if not _DAY.match(day):
        raise ValueError(f"not a date: {day!r}")
    stamp = day.replace("-", "")
    try:
        counts_rows, t1 = _query(
            QUERY_COUNTS.format(day=day), f"world_gdg_counts_{stamp}", project, runner
        )
        title_rows, t2 = _query(
            QUERY_TITLES.format(day=day), f"world_gdg_titles_{stamp}", project, runner
        )
    except (GdgError, FileNotFoundError, subprocess.TimeoutExpired, json.JSONDecodeError) as e:
        return GdgResult(False, day, note=f"GDG unavailable: {e}")

    counts = {r["status"]: int(r["c"]) for r in counts_rows if r.get("status")}
    return GdgResult(True, day, counts, title_rows, [t1, t2])
