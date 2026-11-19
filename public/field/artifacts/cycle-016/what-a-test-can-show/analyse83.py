"""Study 83 and the paper's figures (session 281, 2026-11-19; cycle 016, step 4, the paper).

Reads coding83.json (the seven public instruments the report names, coded twice and decided), data82.js (the check's
final codes of the 48 test sources and 41 measured sentences), org83.json (the organisation behind each source, by a
fixed rule) and atelier_can_would83.json (the Atelier's reading of how each repeatable test on control brings its
behaviour about). Writes results83.json and data83.js.

Usage: python3 -I analyse83.py
"""
import hashlib
import json
import math
import random
from collections import Counter, defaultdict

CODES = ("binding", "requires_evaluation", "control", "pass_mark", "outside_evaluation", "results")


def load_js(path):
    t = open(path, encoding="utf-8").read()
    return json.loads(t[t.index("{"):t.rindex("}") + 1])


def wilson(k, n, z=1.96):
    if n == 0:
        return [0.0, 0.0]
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [round(100 * (c - h) / d, 1), round(100 * (c + h) / d, 1)]


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def main():
    C = json.load(open("coding83.json", encoding="utf-8"))
    D82 = load_js("data82.js")
    ORG = json.load(open("org83.json", encoding="utf-8"))["sources"]
    AT = json.load(open("atelier_can_would83.json", encoding="utf-8"))
    D81 = json.load(open("coding81.json", encoding="utf-8"))

    # ---- study 83: the seven instruments
    inst = C["instruments"]
    final = {i["n"]: i["final"] for i in inst}
    agree = {c: sum(1 for i in inst if i["first"][c] == i["second"][c]) for c in CODES}
    totals = {c: dict(Counter(final[n][c] for n in final)) for c in CODES}
    names = {i["n"]: i["short"] for i in inst}
    by = lambda c, v: [names[n] for n in sorted(final) if final[n][c] == v]
    p126 = totals["pass_mark"].get("set by the instrument", 0) == 0 and totals["pass_mark"].get("left to the developer", 0) >= 2
    p127 = totals["control"].get("named", 0) >= 4
    p128 = totals["outside_evaluation"].get("required", 0) <= 2 and totals["results"].get("published in full", 0) == 0
    s83 = {
        "instruments": len(inst),
        "agreement": {c: [agree[c], len(inst)] for c in CODES},
        "agreement_all_codes": [sum(agree.values()), len(inst) * len(CODES)],
        "disagreements_decided": len(C["adjudication"]),
        "changed_by_adjudication": [f"{a['n']}:{a['code']}" for a in C["adjudication"] if a["final"] != a["first"]],
        "totals": totals,
        "law": by("binding", "law"),
        "voluntary": by("binding", "voluntary"),
        "pass_left_to_developer": by("pass_mark", "left to the developer"),
        "pass_power_to_set": by("pass_mark", "power to set"),
        "pass_none": by("pass_mark", "none"),
        "pass_set_by_instrument": by("pass_mark", "set by the instrument"),
        "control_named": by("control", "named"),
        "control_not_named": by("control", "not named"),
        "outside_required": by("outside_evaluation", "required"),
        "results_to_public_body": by("results", "to a public body"),
        "results_published_in_full": by("results", "published in full"),
        "law_with_control_named": [names[n] for n in sorted(final) if final[n]["binding"] == "law" and final[n]["control"] == "named"],
        "law_with_outside_required": [names[n] for n in sorted(final) if final[n]["binding"] == "law" and final[n]["outside_evaluation"] == "required"],
        "predictions": {"P126": p126, "P127": p127, "P128": p128},
        "predictions_held": sum([p126, p127, p128]),
    }

    # ---- every share against the 201 sentences on evaluation (critique of the second state)
    R = D82["R"]["study81"]["sentences"]
    N = R["on_evaluation"]
    shares = {}
    for key, label in (("measured", "report a measured result"), ("held_by_any_source", "held in full by at least one source"),
                       ("any_rerunnable", "cite at least one test an outsider could repeat on paper"),
                       ("all_rerunnable", "cite only tests an outsider could repeat on paper"),
                       ("held_by_rerunnable", "held in full by a test an outsider could repeat")):
        k = R[key]
        shares[key] = {"label": label, "k": k, "of_41": [k, R["measured"], round(100 * k / R["measured"], 1)],
                       "of_201": [k, N, round(100 * k / N, 1)], "ci_201": wilson(k, N)}

    # ---- grouped by the organisation behind each test source
    src = D82["sources"]
    tests = [r for r, s in src.items() if s["final"]["test"] == "yes"]
    rh = {r: (src[r]["final"]["outside"] == "rerunnable" and bool(src[r]["hold_any"])) for r in tests}
    rer = {r: src[r]["final"]["outside"] == "rerunnable" for r in tests}
    unit = {r: (ORG[r]["org"] if r in ORG else "paper " + r) for r in tests}
    units = defaultdict(list)
    for r in tests:
        units[unit[r]].append(r)
    named = {u: rs for u, rs in units.items() if not u.startswith("paper ")}
    u_rh = [u for u, rs in units.items() if any(rh[r] for r in rs)]
    u_rer = [u for u, rs in units.items() if any(rer[r] for r in rs)]
    # cluster bootstrap of the source-level share: units drawn with replacement
    rnd = random.Random(20261119)
    keys = sorted(units)
    draws = []
    for _ in range(10000):
        pick = [keys[rnd.randrange(len(keys))] for _ in keys]
        k = sum(sum(1 for r in units[u] if rh[r]) for u in pick)
        n = sum(len(units[u]) for u in pick)
        draws.append(100 * k / n)
    draws.sort()
    org = {
        "test_sources": len(tests),
        "units": len(units),
        "named_organisations": {u: sorted(rs, key=int) for u, rs in sorted(named.items())},
        "sources_in_named": sum(len(rs) for rs in named.values()),
        "units_with_rerunnable_and_holds": [len(u_rh), len(units), round(100 * len(u_rh) / len(units), 1), wilson(len(u_rh), len(units))],
        "units_with_rerunnable": [len(u_rer), len(units), round(100 * len(u_rer) / len(units), 1)],
        "source_share_rh": [sum(rh.values()), len(tests), round(100 * sum(rh.values()) / len(tests), 1)],
        "source_share_rh_wilson": wilson(sum(rh.values()), len(tests)),
        "source_share_rh_cluster_bootstrap": [round(draws[249], 1), round(draws[9749], 1)],
        "rh_by_unit": {u: [r for r in rs if rh[r]] for u, rs in sorted(units.items()) if any(rh[r] for r in rs)},
        "makers_named": sorted(u for u in named if u in ("Anthropic", "OpenAI", "Google", "Meta", "Hippocratic AI")),
        "maker_sources": sum(len(named[u]) for u in named if u in ("Anthropic", "OpenAI", "Google", "Meta", "Hippocratic AI")),
    }

    # ---- what the tests on control can establish
    D81js = load_js("data81.js")
    grp = {s["ref"]: set(s["groups"]) for s in D81js["sources"]}
    ctrl = [r for r in tests if "control" in grp.get(r, set())]
    how = {t["ref"]: t for t in AT["tests"]}
    rows = []
    for r in sorted(ctrl, key=int):
        rows.append({"ref": r, "outside": src[r]["final"]["outside"], "runner": src[r]["final"]["runner"],
                     "holds": bool(src[r]["hold_any"]), "rerunnable_and_holds": rh[r],
                     "how": how[r]["how"] if r in how else None, "also": how[r].get("also") if r in how else None,
                     "core": how[r].get("core") if r in how else None,
                     "models": src[r]["second"].get("models")})
    c_rh = [x for x in rows if x["rerunnable_and_holds"]]
    control = {
        "test_sources": len(rows),
        "rerunnable": sum(1 for x in rows if x["outside"] == "rerunnable"),
        "rerunnable_and_holds": len(c_rh),
        "how": dict(Counter(x["how"] for x in c_rh)),
        "core": [x["ref"] for x in c_rh if x["core"]],
        "untold": sum(1 for x in c_rh if x["how"] == "untold"),
        "not_rerunnable": [x["ref"] for x in rows if x["outside"] != "rerunnable"],
        "not_rerunnable_runner": dict(Counter(x["runner"] for x in rows if x["outside"] != "rerunnable")),
        "rows": rows,
    }

    out = {
        "study": 83, "session": 281, "date": "2026-11-19", "cycle": 16, "programme_step": 4,
        "codebook_sha256": sha("CODEBOOK83.md"), "predictions_sha256": sha("PREDICTIONS83.md"),
        "study83": s83, "shares_of_201": shares, "by_organisation": org, "control_tests": control,
        "nine_apart": {"cases": len(D82["nine"]) if isinstance(D82["nine"], list) else D82["R"]["nine"]["rerunnable_or_not"]["n"],
                       "rerunnable": D82["R"]["nine"]["rerunnable_second"]},
    }
    json.dump(out, open("results83.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    page = {"R": out, "inst": [{k: i[k] for k in ("n", "name", "short", "url", "read", "final", "quotes")} for i in inst]}
    open("data83.js", "w", encoding="utf-8").write("window.D83=" + json.dumps(page, ensure_ascii=False) + ";\n")
    print(json.dumps({"agree": s83["agreement_all_codes"], "totals": totals, "pred": s83["predictions"],
                      "shares": {k: v["of_201"] for k, v in shares.items()},
                      "org": {k: org[k] for k in ("units", "units_with_rerunnable_and_holds", "source_share_rh_cluster_bootstrap", "sources_in_named")},
                      "control": {k: control[k] for k in ("test_sources", "rerunnable", "rerunnable_and_holds", "how", "core", "not_rerunnable_runner")}},
                     indent=1))


if __name__ == "__main__":
    main()
