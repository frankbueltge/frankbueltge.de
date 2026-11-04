#!/usr/bin/env python3
"""Offline verification of the artifact 'nobody read this' (session 166, 2026-09-21).

Needs no network. Recomputes every derived number from the committed data rather than
trusting it, re-counts the correction's occurrences in the two audited artifacts, and
cross-checks every headline figure on index.html and SUMMARY.md against data.json.

Usage: python3 check.py            (from this directory, or anywhere)
Exit code 0 if every check passes; 1 otherwise, with each failure named.
"""
import collections
import hashlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OK, FAIL = [], []


def check(name, cond, detail=""):
    (OK if cond else FAIL).append(f"{name}{(' — ' + str(detail)) if detail else ''}")


def load(rel):
    with open(os.path.join(HERE, rel), encoding="utf-8") as fh:
        return json.load(fh)


def sha(path):
    with open(path, "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()


# --------------------------------------------------------------- Fleiss' kappa
def fleiss_kappa(assignments):
    """Written out rather than imported. assignments: list of {category: count}."""
    if len(assignments) < 2:
        return None
    ns = {sum(a.values()) for a in assignments}
    if len(ns) != 1:
        return None
    n = ns.pop()
    if n < 2:
        return None
    cats = sorted({c for a in assignments for c in a})
    N = len(assignments)
    P_i = [(sum(a.get(c, 0) ** 2 for c in cats) - n) / (n * (n - 1)) for a in assignments]
    P_bar = sum(P_i) / N
    p_j = [sum(a.get(c, 0) for a in assignments) / (N * n) for c in cats]
    P_e = sum(p * p for p in p_j)
    return None if P_e == 1 else (P_bar - P_e) / (1 - P_e)


def kappa_selftest():
    """Two fixtures with answers computable by hand, so the formula is not trusted blind."""
    perfect = [{"x": 4}, {"y": 4}, {"x": 4}, {"y": 4}]
    check("kappa: perfect agreement over two equally used categories is 1.0",
          abs(fleiss_kappa(perfect) - 1.0) < 1e-12, fleiss_kappa(perfect))
    split = [{"x": 2, "y": 2}] * 4
    check("kappa: every item split 2-2 by four raters gives a negative kappa",
          fleiss_kappa(split) < 0, fleiss_kappa(split))
    one_cat = [{"x": 4}] * 4
    check("kappa: undefined when one category takes everything (P_e = 1)",
          fleiss_kappa(one_cat) is None)


# --------------------------------------------------------------- the data
def main():
    data = load("data/data.json")
    items = load("data/items.json")
    corr = load("data/correction.json")
    leak = load("data/leak-check.json")
    app = load("data/apparatus.json")
    src = load("data/sources.json")

    kappa_selftest()

    # ---- the frozen references (K5)
    for path, digest in data["k5_reference_digests"].items():
        check(f"K5: {path} is unchanged", sha(os.path.join(ROOT, path)) == digest)

    # ---- items and payloads
    for arm in ("A", "B"):
        its = items["items"][arm]
        ids = [i["item_id"] for i in its]
        check(f"arm {arm}: item ids are unique", len(set(ids)) == len(ids))
        check(f"arm {arm}: every item has a reference label",
              all(i.get("reference") for i in its))
        n_sent = sum(1 for i in its if i["kind"] == "sentinel")
        check(f"arm {arm}: exactly 4 sentinels, as pre-registered", n_sent == 4, n_sent)
        check(f"arm {arm}: payload item count matches the manifest",
              items["payloads"][arm]["n_items"] == len(its))
        check(f"arm {arm}: K4 leaves no residual hit", leak[arm]["residual_hits"] == 0,
              leak[arm]["residual_hits"])

    # ---- arm A references come from the committed 2026-09-19 adjudication
    adjA = json.load(open(os.path.join(
        ROOT, "artifacts/2026-09-19-the-second-hand/data/adjudication.json")))
    refs = collections.Counter(c["verdict"] for c in adjA["cases"])
    mine = collections.Counter(i["reference"] for i in items["items"]["A"]
                               if i["kind"] == "case")
    check("arm A: the 11 references are exactly the 2026-09-19 verdicts", refs == mine,
          f"{dict(refs)} vs {dict(mine)}")
    check("arm A: 11 cases", sum(mine.values()) == 11, sum(mine.values()))

    # ---- arm B references come from the committed 2026-09-20 adjudication
    adjB = json.load(open(os.path.join(
        ROOT, "artifacts/2026-09-20-the-same-text-twice/data/adjudication.json")))
    labels = {str(e["n"]): e["verdict"] for e in adjB["classes"]}
    for i in items["items"]["B"]:
        if i["klass"] == "sentinel":
            continue
        check(f"arm B: item {i['item_id']} carries its class's committed label",
              labels[i["klass"]] == i["reference"], i["klass"])
    check("arm B: all ten committed classes are represented",
          {i["klass"] for i in items["items"]["B"]} - {"sentinel"} == set(labels),
          sorted({i["klass"] for i in items["items"]["B"]}))

    # ---- recompute every scored number from the raw votes, under both readings
    for arm in ("A", "B"):
        rec = data["arms"][arm]
        check(f"arm {arm}: every dispatched worker has a sentinel record",
              set(rec["sentinels"]) == set(rec["workers_dispatched"]))
        check(f"arm {arm}: the K3 void list follows from the sentinel records",
              sorted(w for w, v in rec["sentinels"].items() if v["void_under_K3"])
              == rec["workers_void_under_K3"])
        for tag in ("K3", "ALL"):
            r = rec[tag]
            if r is None:
                continue
            nw = len(r["workers"])
            maj = 0
            for row in r["per_item"]:
                tally = collections.Counter(row["votes"].values())
                top = tally.most_common()
                m = top[0][0] if top and (len(top) == 1 or top[0][1] > top[1][1]) else None
                check(f"arm {arm}/{tag} {row['item']}: recorded majority is the majority",
                      m == row["majority"], f"{m} vs {row['majority']}")
                check(f"arm {arm}/{tag} {row['item']}: tally matches the votes",
                      dict(tally) == row["tally"])
                check(f"arm {arm}/{tag} {row['item']}: only scored workers voted",
                      set(row["votes"]) <= set(r["workers"]))
                if m == row["reference"]:
                    maj += 1
            check(f"arm {arm}/{tag}: majority-matches-reference count is right",
                  maj == r["majority_matches_reference"],
                  f"{maj} vs {r['majority_matches_reference']}")
            k = fleiss_kappa([collections.Counter(row["votes"].values())
                              for row in r["per_item"] if len(row["votes"]) == nw])
            rk = r["fleiss_kappa_items"]
            check(f"arm {arm}/{tag}: Fleiss' kappa over items recomputes",
                  (k is None and rk is None) or abs(k - rk) < 1e-12, f"{k} vs {rk}")
            una = [row["item"] for row in r["per_item"]
                   if len(set(row["votes"].values())) == 1 and len(row["votes"]) == nw
                   and next(iter(row["votes"].values())) != row["reference"]]
            check(f"arm {arm}/{tag}: the unanimous-against-us list is right",
                  una == r["unanimous_against_reference"],
                  f"{una} vs {r['unanimous_against_reference']}")
            if arm == "B":
                nc = sum(1 for v in r["per_class"].values() if v["matches_reference"])
                check(f"arm B/{tag}: class-level match count is right",
                      nc == r["classes_majority_matches_reference"],
                      f"{nc} vs {r['classes_majority_matches_reference']}")
                check("arm B: eleven class entries covering the ten classes are scored",
                      r["n_classes"] == 11, r["n_classes"])

    # ---- the predictions are decided by the data, not asserted
    for p in data["predictions"]:
        check(f"prediction {p['n']} carries a verdict",
              p["verdict"] in ("CONFIRMED", "REFUTED"), p["verdict"])
    check("the confirmed/refuted tally matches the predictions",
          data["predictions_confirmed"] + data["predictions_refuted"] == len(data["predictions"]))
    check("prediction 5 is decided by the unanimous-against-us lists",
          (data["predictions"][4]["verdict"] == "CONFIRMED")
          == bool(data["arms"]["A"]["ALL"]["unanimous_against_reference"]
                  + data["arms"]["B"]["ALL"]["unanimous_against_reference"]))

    # ---- the correction, re-counted from the audited files themselves
    tot = 0
    for f in corr["files"]:
        text = open(os.path.join(ROOT, f["path"]), encoding="utf-8").read()
        n = len(re.findall("person", text, re.I))
        check(f"correction: {f['path']} still holds {f['n']} occurrences of the word",
              n == f["n"], n)
        check(f"correction: {f['path']} is unchanged",
              sha(os.path.join(ROOT, f["path"])) == f["sha256"])
        tot += n
    check("correction: the total is right", tot == corr["total_occurrences"], tot)
    check("correction: 14 of them are in the two artifacts",
          corr["in_the_two_artifacts"] == 14, corr["in_the_two_artifacts"])
    check("correction: none of the audited files was edited by this session",
          all(sha(os.path.join(ROOT, f["path"])) == f["sha256"] for f in corr["files"]))

    # ---- no third-party source text is committed with this artifact
    for dirpath, _, names in os.walk(os.path.join(HERE, "data")):
        for n in names:
            p = os.path.join(dirpath, n)
            blob = open(p, encoding="utf-8").read()
            check(f"no licence text committed: {n} holds no long verbatim run",
                  not re.search(r"Permission is hereby granted, free of charge, to any person "
                                r"obtaining a copy of this software and associated "
                                r"documentation files", blob))

    # ---- the apparatus register discloses the workers
    check("apparatus: ten dispatched workers are recorded",
          app["dispatched_workers"]["n"] == 10)
    check("apparatus: the arm counts add up to the workers dispatched",
          sum(app["dispatched_workers"]["arms"].values())
          == app["dispatched_workers"]["n"])
    disc = load("data/worker-disclosures.json")
    check("every dispatched worker has a tool disclosure on the record",
          len(disc["arm_A"]) + len(disc["arm_B"]) == app["dispatched_workers"]["n"])
    check("the K3 selection effect is stated, not just the kappa it produces",
          "manufactured by the kill condition" in json.dumps(data["the_K3_selection_effect"]))
    check("the three bad tests set tonight are on the record",
          len(data["findings"]["bad_tests_set_tonight"]) == 3)
    check("defect 6 records whether it moves a published number",
          "No" in data["findings"]["defect_6"]["does_it_move_a_published_number"])
    check("apparatus: the provider and the requested tier are named",
          bool(app["dispatched_workers"]["provider"])
          and bool(app["dispatched_workers"]["model_requested"]))
    check("sources: every source records the level at which it was read",
          bool(src["read_level"]) and len(src["sources"]) == 3)
    check("sources: kappa bands are declared unread rather than quoted",
          any("Landis" in str(x) for x in src["not_read_and_named_as_such"]))

    # ---- the page and the summary state only numbers that are in the data
    page = open(os.path.join(HERE, "index.html"), encoding="utf-8").read()
    summ = open(os.path.join(HERE, "SUMMARY.md"), encoding="utf-8").read()
    for label, value in data["headline"].items():
        check(f"page states {label} = {value}", str(value) in page, value)
        check(f"summary states {label} = {value}", str(value) in summ, value)
    for claim in data["page_claims"]:
        check(f"page carries the claim: {claim[:70]}", claim in page)
    for claim in data["summary_claims"]:
        check(f"summary carries the claim: {claim[:70]}", claim in summ)
    check("the page and the summary agree on the arm A figure",
          ("<b>10</b> of 11" in page) and ("**10 of 11**" in summ))
    check("page names no product, company or tool vendor",
          not re.search(r"anthropic|openai|gpt|gemini|llama|sonnet|opus|claude", page, re.I))
    check("summary names no product, company or tool vendor",
          not re.search(r"anthropic|openai|gpt|gemini|llama|sonnet|opus|claude", summ, re.I))
    check("page attaches no verbal band to kappa",
          not re.search(r"(substantial|moderate|almost perfect|fair) agreement", page, re.I))

    tam = load("data/tamper-check.json")
    check("the tamper harness caught every corruption it applied",
          tam["caught"] == tam["corruptions"] == 20, tam)
    check("page states the tamper result",
          f"{tam['caught']} of {tam['corruptions']}" in page)
    total = len(OK) + len(FAIL) + 1
    check(f"page states this script's own assertion count ({total})",
          f"{total} checks" in page, total)

    print(f"{len(OK)} checks passed, {len(FAIL)} failed")
    for f in FAIL:
        print("  FAIL:", f)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
