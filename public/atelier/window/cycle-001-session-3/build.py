#!/usr/bin/env python3
"""Condense the four burst-search runs into the one data.json the page cites.

The raw runs are committed beside this file in `data/`; nothing here recomputes
anything, it only selects. `run-df-global` is the primary run — channels ordered
by document frequency, noise estimated over each record as a whole. The other
three are the controls:

    run-alpha-global   the same search with the channel axis alphabetised
    run-df-local       the same search with the noise estimated in a sliding
                       window of +/- 15 active days
    run-alpha-local    both changes at once

    python3 window/cycle-001-session-3/build.py
"""
from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
RUNS = ["df-global", "alpha-global", "df-local", "alpha-local"]
PRIMARY = "df-global"


def load(name: str) -> dict:
    return json.loads((HERE / "data" / f"run-{name}.json").read_text(encoding="utf-8"))


def slim_event(e: dict) -> dict:
    """The raw runs keep full precision; the page states two decimals, so the
    file the page is checked against states two decimals too."""
    out = {k: e[k] for k in ("day_first", "day_last", "dt", "df", "k0",
                             "power", "dof", "log10p", "top_terms", "top5_share")}
    out["log10p"] = round(out["log10p"], 2)
    out["power"] = round(out["power"], 1)
    return out


def main() -> None:
    runs = {name: load(name) for name in RUNS}
    p = runs[PRIMARY]
    dets = [d["key"] for d in p["detectors"]]

    out = {
        "generated": p["generated"],
        "source": {
            "authors": "W. G. Anderson, P. R. Brady, J. D. E. Creighton, E. E. Flanagan",
            "title": ("An excess power statistic for detection of burst sources of "
                      "gravitational radiation"),
            "journal": "Physical Review D 63, 042003 (2001)",
            "arxiv": "arXiv:gr-qc/0008066",
            "url": "https://arxiv.org/abs/gr-qc/0008066",
            "read": "2026-09-01",
            "sha256_pdf": "cb3e40491b9dca920a5f60d01c1132d95b8ce270b979c006ad5b9cbe123d7256",
        },
        "params": p["params"],
        "vocab_size": p["vocab_size"],
        "channels_used": len(p["channels"]),
        "detectors": [
            {k: d[k] for k in ("key", "name", "repo", "dir", "units", "active_days",
                               "first_day", "last_day", "date_sources", "provenance",
                               "live_channels", "tiles_searched")}
            for d in p["detectors"]
        ],
        "tiles_total": sum(d["tiles_searched"] for d in p["detectors"]),
        "units_total": sum(d["units"] for d in p["detectors"]),
        "runs": {},
    }

    for name, r in runs.items():
        out["runs"][name] = {
            "order": r["order"], "baseline": r["baseline"], "window": r["window"],
            "coincidences": len(r["coincidences"]),
            "detectors": {
                d["key"]: {
                    "analytic_cut_log10p": d["analytic_cut_log10p"],
                    "tiles_over_analytic_cut": d["tiles_over_analytic_cut"],
                    "events_over_analytic_cut": d["events_over_analytic_cut"],
                    "null": d["null"],
                    "null_all_log10p": d["null_all_log10p"],
                    "empirical_cut_log10p": d["empirical_cut_log10p"],
                    "events": [slim_event(e) for e in d["events"]],
                    "n_events": len(d["events"]),
                }
                for d in r["detectors"]
            },
        }

    # the two numbers the whole page turns on
    chi2 = {k: sum(out["runs"][n]["detectors"][k]["events_over_analytic_cut"]
                   for n in RUNS) for k in dets}
    out["totals"] = {
        "chi2_events_primary": sum(
            out["runs"][PRIMARY]["detectors"][k]["events_over_analytic_cut"] for k in dets),
        "surviving_events_primary": sum(
            out["runs"][PRIMARY]["detectors"][k]["n_events"] for k in dets),
        "surviving_events_all_runs": sum(
            out["runs"][n]["detectors"][k]["n_events"] for n in RUNS for k in dets),
        "chi2_events_all_runs": sum(chi2.values()),
        "coincidences_all_runs": sum(out["runs"][n]["coincidences"] for n in RUNS),
    }

    # the plane the figure draws, primary run, Atelier
    plane = p["planes"]["atelier"]
    days, loud = plane["days"], plane["loud"]
    ev1 = out["runs"][PRIMARY]["detectors"]["atelier"]["events"][0]
    inside = range(days.index(ev1["day_first"]), days.index(ev1["day_last"]) + 1)
    n_in = sum(1 for j, _k, _z in loud if j in inside)
    out["plane_atelier"] = {
        "days": days, "loud": loud, "loud_count": len(loud),
        # a strain reading is signed and symmetric about zero; a word rate is
        # bounded below by zero, so a two-sigma deficit is nearly unreachable
        # while a surplus is unbounded. The count says how one-sided that is.
        "loud_negative": sum(1 for _j, _k, z in loud if z < 0),
        "per_day_all": round(len(loud) / len(days), 1),
        "per_day_in_event_1": round(n_in / len(inside), 1),
        "per_day_outside_event_1": round((len(loud) - n_in) / (len(days) - len(inside)), 1),
    }

    (HERE / "data.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
    t = out["totals"]
    print(f"data.json: {out['units_total']} units, {out['tiles_total']} tiles, "
          f"chi2 events {t['chi2_events_primary']} -> surviving {t['surviving_events_primary']} "
          f"(all four runs: {t['chi2_events_all_runs']} -> {t['surviving_events_all_runs']}), "
          f"coincidences {t['coincidences_all_runs']}")


if __name__ == "__main__":
    main()
