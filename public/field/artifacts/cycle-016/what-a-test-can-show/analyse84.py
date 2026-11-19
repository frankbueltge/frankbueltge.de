#!/usr/bin/env python3
"""Check 84 (session 282, 2026-11-19, after the presentation): are the models of the repeatable tests still there?

Reads models84.json (every model named for the 28 tests repeatable on paper, its status read today on its maker's own
page, by CODEBOOK84.md), check82/second/s81-*.json (the second reading's model and availability codes, as the page
presented them), results82.json (which tests are repeatable and which hold the cited result) and PREDICTIONS84.md.
Writes results84.json and data84.js. Standard library only.

Every count is made twice: on the codebook's rule for an unversioned GPT-4o (the earliest listed snapshot) and on the
other reading (the latest). The page and the predictions use the first and report the second beside it.
"""
import glob
import hashlib
import json
import os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
OFFERED = ("offered", "offered, end set")
HOSTED_PAGES = ("openai", "anthropic", "gemini-api", "vertex", "xai", "grayswan")


def rd(path):
    with open(os.path.join(HERE, path), encoding="utf-8") as f:
        return json.load(f)


def sha(path):
    with open(os.path.join(HERE, path), "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def main():
    M = rd("models84.json")
    models = M["models"]
    r82 = rd("results82.json")["study81"]
    second = {}
    for f in sorted(glob.glob(os.path.join(HERE, "check82", "second", "s81-*.json"))):
        with open(f, encoding="utf-8") as fh:
            for it in json.load(fh)["items"]:
                second[str(it["ref"])] = it
    holds = r82["final_totals"]["rerunnable_and_holds"]["refs"]
    tests = {t["ref"]: t for t in M["tests"]}
    hosted9 = sorted((r for r in tests if second[r].get("model_access") == "public product or API"), key=int)
    assert len(tests) == r82["final_totals"]["rerunnable"]["k"] == 28, len(tests)
    assert set(holds) <= set(tests)
    assert len(hosted9) == r82["final_totals"]["rerunnable_hosted"]["k"] == 9, hosted9
    for t in tests.values():
        for k in t["models"] + t.get("cited", []):
            assert k == "gpt-4o*" or k in models, k

    def resolve(keys, reading):
        return [M["gpt4o_assumed"][reading] if k == "gpt-4o*" else k for k in keys]

    def status(k):
        return models[k]["status"]

    def code_test(keys):
        if not keys:
            return "not settled"
        st = [status(k) for k in keys]
        ret = sum(s == "retired" for s in st)
        off = sum(s in OFFERED for s in st)
        nf = sum(s == "not found" for s in st)
        if ret == 0:
            return "all offered" if nf == 0 else "not settled"
        if off == 0 and nf == 0:
            return "all retired"
        if off == 0:
            return "retired, rest not found"
        return "some retired"

    def code_cited(keys):
        if not keys:
            return "not settled"
        st = [status(k) for k in keys]
        if any(s == "retired" for s in st):
            return "cannot"
        if all(s in OFFERED for s in st):
            return "can"
        return "not settled"

    out = {"what": "Check 84: the models of the 28 tests repeatable on paper, read on their makers' own pages on "
                   "2026-11-19 (models84.json, CODEBOOK84.md).",
           "models84_sha256": sha("models84.json"), "predictions_file_sha256": sha("PREDICTIONS84.md"),
           "codebook_sha256": sha("CODEBOOK84.md"), "readings": {}}
    per_test = {}
    for reading in ("earliest", "latest"):
        T = {}
        for ref, t in tests.items():
            keys = resolve(t["models"], reading)
            # a hosted model named by name: read on a maker's page (the 'line' entries of addendum 2 name no model)
            hosted = [k for k in keys if models[k]["page"] in HOSTED_PAGES]
            T[ref] = {"code": code_test(keys),
                      "any_retired": any(status(k) == "retired" for k in keys),
                      "names_hosted": bool(hosted),
                      "retired": [k for k in keys if status(k) == "retired"],
                      "offered": [k for k in keys if status(k) in OFFERED],
                      "not_found": [k for k in keys if status(k) == "not found"]}
            if "cited" in t:
                ck = resolve(t["cited"], reading)
                T[ref]["cited_code"] = code_cited(ck)
                ends = [models[k]["date"] for k in ck if status(k) == "offered, end set"]
                T[ref]["cited_first_end"] = min(ends) if ends else None
        per_test[reading] = T
        codes = Counter(v["code"] for v in T.values())
        cited = {r: T[r]["cited_code"] for r in holds}
        names_hosted = [r for r, v in T.items() if v["names_hosted"]]
        p129 = all(T[r]["any_retired"] for r in hosted9)
        can = sorted((r for r, c in cited.items() if c == "can"), key=int)
        p130 = len(can) <= 3
        p131 = all(T[r]["any_retired"] for r in names_hosted)
        out["readings"][reading] = {
            "test_codes": dict(codes),
            "any_retired": sorted((r for r, v in T.items() if v["any_retired"]), key=int),
            "hosted9_any_retired": sorted((r for r in hosted9 if T[r]["any_retired"]), key=int),
            "names_hosted": sorted(names_hosted, key=int),
            "names_hosted_without_retired": sorted((r for r in names_hosted if not T[r]["any_retired"]), key=int),
            "cited_codes": dict(Counter(cited.values())),
            "cited_can": can,
            "cited_can_after_2026_12_01": sorted((r for r in can if T[r]["cited_first_end"] is None
                                                  or T[r]["cited_first_end"] > "2026-12-01"), key=int),
            "predictions": {"P129": p129, "P130": p130, "P131": p131},
        }
    # as presented: the second reading's one lookup per source
    out["as_presented"] = {"available_today_of_rerunnable": dict(Counter(str(second[r].get("available_today")) for r in tests)),
                           "hosted9_no": sorted((r for r in hosted9 if second[r].get("available_today") == "no"), key=int)}
    # the presented "no" codes, read again
    out["presented_no_confirmed"] = sorted((r for r in tests if second[r].get("available_today") == "no"
                                            and per_test["earliest"][r]["any_retired"]), key=int)
    out["presented_yes_now"] = {r: per_test["earliest"][r]["code"] for r in tests if second[r].get("available_today") == "yes"}
    # the Studio's claims, read against the makers' pages
    sc = M["studio"]["claims"]
    checks = [(c["ref"], k, "retired", status(k) == "retired") for c in sc for k in c["retired"]] + \
             [(c["ref"], k, "offered", status(k) in OFFERED) for c in sc for k in c["offered"]]
    out["studio"] = {"claims": len(checks), "hold": sum(1 for *_, ok in checks if ok),
                     "failed": [f"{r} {k} {w}" for r, k, w, ok in checks if not ok],
                     "tests_with_a_retired_model": f"{sum(1 for c in sc if c['retired'])} of {len(sc)}",
                     "hosted9": hosted9}
    # the distinct models named, and when the retired ones went
    named = sorted({k for t in tests.values() for k in resolve(t["models"], "earliest")})
    by = Counter(status(k) for k in named)
    ret = [k for k in named if status(k) == "retired"]
    out["models_named"] = {"distinct": len(named), "by_status": dict(by),
                           "retired_after_feb_2026": sorted(k for k in ret if models[k]["date"] > "2026-02-28"),
                           "retired_by_feb_2026": sorted(k for k in ret if models[k]["date"] <= "2026-02-28"),
                           "end_set": sorted((k for k in named if status(k) == "offered, end set"),
                                             key=lambda k: models[k]["date"])}
    out["per_test"] = per_test
    out["predictions"] = out["readings"]["earliest"]["predictions"]
    out["predictions_held"] = sum(out["predictions"].values())
    with open(os.path.join(HERE, "results84.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
    page = {"R": out, "models": models, "tests": [tests[r] for r in sorted(tests, key=int)],
            "holds": holds, "hosted9": hosted9, "pages": M["pages"],
            "presented": {r: second[r].get("available_today") for r in tests},
            "gpt4o": M["gpt4o_assumed"]}
    with open(os.path.join(HERE, "data84.js"), "w", encoding="utf-8") as f:
        f.write("window.D84=" + json.dumps(page, ensure_ascii=False) + ";\n")
    E = out["readings"]["earliest"]
    print(json.dumps({k: E[k] for k in ("test_codes", "cited_codes", "cited_can", "cited_can_after_2026_12_01",
                                         "names_hosted_without_retired", "predictions")}, indent=1))
    print("latest:", json.dumps({k: out["readings"]["latest"][k] for k in ("test_codes", "cited_codes", "cited_can",
                                                                           "names_hosted_without_retired", "predictions")}))
    print("studio:", out["studio"])
    print("models:", out["models_named"]["distinct"], out["models_named"]["by_status"],
          len(out["models_named"]["retired_after_feb_2026"]), "after Feb 2026")
    print("presented:", out["as_presented"], out["presented_no_confirmed"], out["presented_yes_now"])


if __name__ == "__main__":
    main()
