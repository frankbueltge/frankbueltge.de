#!/usr/bin/env python3
"""Check 82 (session 280, 2026-11-19): compare the blind second coding with the first, and chase the weakest claim.

Reads coding80.json and coding81.json (the first coding), check82/second/*.json (the second coding, by readers who
saw neither the first coding nor this script) and check82/adjudication.json (the conductor's third reading of the
disagreements that move a figure on the page). Writes results82.json and data82.js. Standard library only.

Agreement is Cohen's kappa on the items both codings code. The new readings of the check (does a source hold the
result the sentence states; the model's access, the materials' access, whether the model can still be used; what a
pass mark is applied to) have no first coding: they are reported as read, and adjudicated where the page rests a
figure on them.
"""
import hashlib
import json
import math
import os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
CHK = os.path.join(HERE, "check82")


def rd(path):
    with open(os.path.join(HERE, path), encoding="utf-8") as f:
        return json.load(f)


def sha(path):
    with open(os.path.join(HERE, path), "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def kappa(pairs):
    """Cohen's kappa for nominal codes; pairs is a list of (a, b)."""
    n = len(pairs)
    if n == 0:
        return None
    po = sum(1 for a, b in pairs if a == b) / n
    ca, cb = Counter(a for a, _ in pairs), Counter(b for _, b in pairs)
    pe = sum(ca[k] * cb.get(k, 0) for k in ca) / (n * n)
    if pe == 1:
        return 1.0 if po == 1 else 0.0
    return round((po - pe) / (1 - pe), 2)


def agree(pairs):
    n = len(pairs)
    k = sum(1 for a, b in pairs if a == b)
    return {"n": n, "agree": k, "share": round(100 * k / n, 1) if n else None, "kappa": kappa(pairs),
            "confusion": {f"{a} | {b}": v for (a, b), v in sorted(Counter(pairs).items(), key=lambda x: -x[1])}}


def wilson(k, n, z=1.96):
    if n == 0:
        return [None, None]
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [round(100 * (c - h) / d, 1), round(100 * (c + h) / d, 1)]


def load_second():
    out = {}
    folder = os.path.join(CHK, "second")
    for name in sorted(os.listdir(folder)):
        if name.endswith(".json"):
            with open(os.path.join(folder, name), encoding="utf-8") as f:
                d = json.load(f)
            out[d["sheet"]] = d
    return out


def main():
    c80 = {r["id"]: r for r in rd("coding80.json")["rows"]}
    k81 = rd("coding81.json")
    s80 = {s["id"]: s for s in rd("sentences80.json")["sentences"]}
    sec = load_second()
    adj_path = os.path.join(CHK, "adjudication.json")
    adj = json.load(open(adj_path, encoding="utf-8")) if os.path.exists(adj_path) else {"items": []}
    A = {}
    for a in adj["items"]:
        A[(a["study"], str(a["item"]), a["code"])] = a

    def final(study, item, code, first, second):
        a = A.get((study, str(item), code))
        return a["final"] if a else first

    # ---------- study 80 ----------
    s2 = {}
    for name in ("s80-a", "s80-b"):
        for it in sec[name]["items"]:
            s2[it["id"]] = it
    assert set(s2) == set(c80), (len(s2), len(c80))
    yn = lambda v: "yes" if v in (True, "yes") else "no"
    about = [(yn(c80[i]["about"]), s2[i]["about"]) for i in c80]
    both = [i for i in c80 if yn(c80[i]["about"]) == "yes" and s2[i]["about"] == "yes"]
    grade = [(c80[i]["grade"], s2[i]["grade"]) for i in both]
    tests = [(c80[i]["tests"], s2[i]["tests"]) for i in both]
    passp = [(yn(c80[i]["pass"]), s2[i]["pass"] or "no") for i in both]
    setter = [(c80[i].get("setter"), s2[i].get("setter")) for i in both
              if yn(c80[i]["pass"]) == "yes" and s2[i]["pass"] == "yes"]
    kept2 = [i for i in s2 if s2[i]["about"] == "yes"]
    g2 = Counter(s2[i]["grade"] for i in kept2)
    t2 = Counter(s2[i]["tests"] for i in kept2)
    gt2 = {}
    for i in kept2:
        gt2.setdefault(s2[i]["tests"], Counter())[s2[i]["grade"]] += 1
    p2 = [i for i in kept2 if s2[i]["pass"] == "yes"]
    measured1 = sorted(i for i in c80 if c80[i].get("grade") == "measured" and yn(c80[i]["about"]) == "yes")
    measured2 = sorted(i for i in kept2 if s2[i]["grade"] == "measured")
    study80 = {
        "items": len(c80),
        "about": agree(about),
        "kept_by_both": len(both),
        "kept_first": sum(1 for i in c80 if yn(c80[i]["about"]) == "yes"),
        "kept_second": len(kept2),
        "grade": agree(grade),
        "tests": agree(tests),
        "pass": agree(passp),
        "setter": agree(setter),
        "second_totals": {
            "grade": dict(g2), "tests": dict(t2),
            "grade_by_tests": {k: dict(v) for k, v in gt2.items()},
            "open_share": {g: [gt2.get(g, Counter())["open"], sum(gt2.get(g, Counter()).values()),
                               round(100 * gt2.get(g, Counter())["open"] / max(1, sum(gt2.get(g, Counter()).values())), 1)]
                           for g in ("control", "capability")},
            "pass_marks": len(p2),
            "setters": dict(Counter(s2[i].get("setter") for i in p2)),
            "pass_ids": sorted(p2),
        },
        "about_set_aside_by_second": len([i for i in c80 if yn(c80[i]["about"]) == "yes" and s2[i]["about"] == "no"]),
        "about_set_aside_in_3_2": len([i for i in c80 if yn(c80[i]["about"]) == "yes" and s2[i]["about"] == "no"
                                       and s80[i]["section"].startswith("3.2")]),
        "measured_first": len(measured1),
        "measured_second": len(measured2),
        "measured_both": len(set(measured1) & set(measured2)),
        "measured_first_only": sorted(set(measured1) - set(measured2)),
        "p119_second": {"developer": sum(1 for i in p2 if s2[i].get("setter") == "developer"), "n": len(p2),
                        "public_body": sum(1 for i in p2 if s2[i].get("setter") == "public body"),
                        "held": len(p2) >= 5 and 3 * sum(1 for i in p2 if s2[i].get("setter") == "developer") >= 2 * len(p2)
                        and not any(s2[i].get("setter") == "public body" for i in p2)},
        "measured_second_only": sorted(set(measured2) - set(measured1)),
    }
    t35 = sec["s80-a"].get("table35") or {}
    study80["table35_second"] = {
        "rows": t35.get("rows"),
        "pass_mark_rows": sum(1 for r in t35.get("row_list", []) if r.get("names_pass_mark")),
        "public_body_setter_rows": sum(1 for r in t35.get("row_list", []) if r.get("public_body_named_as_setter")),
        "first_rows": len(k81["framework_table"]["rows"]),
    }

    study80_measured_both = sorted(set(measured1) & set(measured2))

    # ---------- study 81 ----------
    first = {s["ref"]: s for s in k81["sources"]}
    second = {}
    for name, d in sec.items():
        if name.startswith("s81-"):
            for it in d["items"]:
                second[str(it["ref"])] = it
    assert set(second) == set(first), sorted(set(first) ^ set(second))
    refs = sorted(first, key=int)
    t1 = lambda r: first[r]["test"] if first[r]["test"] in ("yes", "no") else "unreached"
    t2_ = lambda r: second[r]["test"]
    test = [(t1(r), t2_(r)) for r in refs]
    bt = [r for r in refs if t1(r) == "yes" and t2_(r) == "yes"]
    runner = [(first[r]["runner"], second[r]["runner"]) for r in bt]
    outside = [(first[r]["outside"], second[r]["outside"]) for r in bt]
    rer = [("rerunnable" if first[r]["outside"] == "rerunnable" else "not",
            "rerunnable" if second[r]["outside"] == "rerunnable" else "not") for r in bt]
    mkp = lambda v: "maker part" if v in ("maker", "maker and others") else "no maker"
    makerpart = [(mkp(first[r]["runner"]), mkp(second[r]["runner"])) for r in bt]
    passs = [(first[r]["pass"], second[r]["pass"]) for r in bt]
    T2 = [r for r in refs if t2_(r) == "yes"]

    # final codes: first coding, unless the conductor's third reading of a disagreement says otherwise
    F = {}
    for r in refs:
        F[r] = {k: final("81", r, k, first[r].get(k), second[r].get(k)) for k in ("test", "runner", "pass", "outside")}
    TF = [r for r in refs if F[r]["test"] == "yes"]

    # holds: per sentence and source (second reading, adjudicated where the page rests on it)
    pairs = []
    for r in refs:
        for p in second[r].get("pairs", []):
            h = final("81h", f"{p['sentence']}-{r}", "holds", None, p["holds"]) or p["holds"]
            pairs.append({"sentence": p["sentence"], "ref": r, "holds": h, "second": p["holds"],
                          "quote": p.get("quote", ""), "where": p.get("where", "")})
    hold_any = {r: any(p["holds"] == "holds" for p in pairs if p["ref"] == r) for r in refs}
    hold_some = {r: any(p["holds"] in ("holds", "partly") for p in pairs if p["ref"] == r) for r in refs}
    # the weakest claim: rerunnable tests that hold the result
    rer_final = [r for r in TF if F[r]["outside"] == "rerunnable"]
    rer_hold = [r for r in rer_final if hold_any[r]]
    rer_holdp = [r for r in rer_final if hold_some[r]]
    rer2 = [r for r in T2 if second[r]["outside"] == "rerunnable"]
    raw_hold = {r: any(p.get("holds") == "holds" for p in second[r].get("pairs", [])) for r in refs}
    rer2_hold = [r for r in rer2 if raw_hold[r]]  # P125 reads the second coding as it came, before any third reading

    # sentence level
    rows81 = {}
    d81 = open(os.path.join(HERE, "data81.js"), encoding="utf-8").read()
    D81 = json.loads(d81[d81.index("=") + 1:].rstrip().rstrip(";"))
    for row in D81["rows"]:
        rows81[row["id"]] = row
    grp81 = {s["ref"]: set(s["groups"]) for s in D81["sources"]}
    sent = {}
    for i, row in rows81.items():
        srcs = row["sources"]
        ts = [r for r in srcs if F[r]["test"] == "yes"]
        any_rer = [r for r in ts if F[r]["outside"] == "rerunnable"]
        held = [p for p in pairs if p["sentence"] == i and p["holds"] == "holds"]
        held_rer = [p for p in held if p["ref"] in any_rer]
        sent[i] = {
            "tests": row["tests"],
            "sources": srcs,
            "any_rerunnable": bool(any_rer),
            "all_rerunnable": bool(ts) and len(any_rer) == len(ts),
            "held_by_any": bool(held),
            "held_by_rerunnable": bool(held_rer),
            "holds": {p["ref"]: p["holds"] for p in pairs if p["sentence"] == i},
        }
    n_sent = len(sent)
    sent_counts = {
        "measured": n_sent,
        "any_rerunnable": sum(v["any_rerunnable"] for v in sent.values()),
        "all_rerunnable": sum(v["all_rerunnable"] for v in sent.values()),
        "held_by_any_source": sum(v["held_by_any"] for v in sent.values()),
        "held_by_rerunnable": sum(v["held_by_rerunnable"] for v in sent.values()),
        "no_source_holds": sorted(i for i, v in sent.items() if v["sources"] and not v["held_by_any"]),
        "contradicted": sorted({p["sentence"] for p in pairs if p["holds"] == "contradicts"}),
        "on_evaluation": rd("results80.json")["on_evaluation"],
    }

    # the core: sentences both readers grade measured, and the sources behind them
    core_ids = sorted(set(study80_measured_both) & set(rows81))
    core_refs = sorted({r for i in core_ids for r in rows81[i]["sources"]}, key=int)
    core_t = [r for r in core_refs if F[r]["test"] == "yes"]
    core_rer = [r for r in core_t if F[r]["outside"] == "rerunnable"]
    core_rh = [r for r in core_rer if hold_any[r]]
    core = {"sentences": len(core_ids), "sources": len(core_refs), "test_sources": len(core_t),
            "rerunnable": len(core_rer), "rerunnable_and_holds": len(core_rh),
            "maker_part": sum(1 for r in core_t if F[r]["runner"] in ("maker", "maker and others")),
            "sentences_held_by_rerunnable": sum(1 for i in core_ids if sent[i]["held_by_rerunnable"])}
    sent_counts["none_holds_even_partly"] = sorted(
        i for i, v in sent.items() if v["sources"] and not any(h in ("holds", "partly") for h in v["holds"].values()))

    access = {
        "model_access_of_rerunnable": dict(Counter(second[r].get("model_access") for r in rer_final)),
        "materials_access_of_rerunnable": dict(Counter(second[r].get("materials_access") for r in rer_final)),
        "available_today_of_rerunnable": dict(Counter(second[r].get("available_today") for r in rer_final)),
        "model_access_all": dict(Counter(second[r].get("model_access") for r in T2)),
        "available_today_all": dict(Counter(second[r].get("available_today") for r in T2)),
    }
    open_now = [r for r in rer_final if second[r].get("model_access") == "open weights"
                and second[r].get("materials_access") == "public"]
    hosted = [r for r in rer_final if second[r].get("model_access") == "public product or API"]
    hosted_gone = [r for r in hosted if second[r].get("available_today") == "no"]

    pass_kinds = {}
    for r in refs:
        kinds = sorted({k["kind"] for k in second[r].get("pass_applies_to", []) if k.get("kind")})
        if kinds:
            pass_kinds[r] = kinds
    pass_final = [r for r in TF if F[r]["pass"] not in (None, "none")]

    study81 = {
        "sources": len(refs),
        "test": agree(test),
        "test_by_both": len(bt),
        "runner": agree(runner),
        "maker_part": agree(makerpart),
        "outside": agree(outside),
        "rerunnable_or_not": agree(rer),
        "pass": agree(passs),
        "second_totals": {
            "test_sources": len(T2),
            "runner": dict(Counter(second[r]["runner"] for r in T2)),
            "outside": dict(Counter(second[r]["outside"] for r in T2)),
            "pass": dict(Counter(second[r]["pass"] for r in T2)),
            "rerunnable": len(rer2),
            "rerunnable_and_holds": len(rer2_hold),
        },
        "final_totals": {
            "test_sources": len(TF),
            "runner": dict(Counter(F[r]["runner"] for r in TF)),
            "outside": dict(Counter(F[r]["outside"] for r in TF)),
            "rerunnable": {"k": len(rer_final), "n": len(TF), "share": round(100 * len(rer_final) / len(TF), 1),
                           "ci": wilson(len(rer_final), len(TF))},
            "rerunnable_and_holds": {"k": len(rer_hold), "n": len(TF),
                                     "share": round(100 * len(rer_hold) / len(TF), 1),
                                     "ci": wilson(len(rer_hold), len(TF)), "refs": rer_hold},
            "rerunnable_and_holds_at_least_partly": {"k": len(rer_holdp), "n": len(TF),
                                                     "share": round(100 * len(rer_holdp) / len(TF), 1)},
            "rerunnable_open_weights_public_materials": {"k": len(open_now), "refs": open_now},
            "rerunnable_hosted": {"k": len(hosted), "gone_today": hosted_gone},
            "pass_refs": pass_final,
        },
        "holds": {
            "pairs": len(pairs),
            "codes": dict(Counter(p["holds"] for p in pairs)),
            "codes_second": dict(Counter(p["second"] for p in pairs)),
            "sources_holding_any": sum(hold_any.values()),
        },
        "sentences": sent_counts,
        "core": core,
        "runner_final_by_rerunnable": {
            "third party": [sum(1 for r in TF if F[r]["runner"] == "third party" and F[r]["outside"] == "rerunnable"),
                            sum(1 for r in TF if F[r]["runner"] == "third party")],
            "maker part": [sum(1 for r in TF if F[r]["runner"] in ("maker", "maker and others") and F[r]["outside"] == "rerunnable"),
                           sum(1 for r in TF if F[r]["runner"] in ("maker", "maker and others"))]},
        "rerunnable_holds_by_runner": dict(Counter(F[r]["runner"] for r in rer_hold)),
        "rerunnable_holds_by_group": {g: [sum(1 for r in rer_hold if g in grp81[r]), sum(1 for r in rer_final if g in grp81[r]),
                                          sum(1 for r in TF if g in grp81[r])] for g in ("capability", "control")},
        "access": access,
        "pass_applies_to": pass_kinds,
        "changed_by_adjudication": sorted(f"{k[0]}:{k[1]}:{k[2]}" for k in A),
    }

    # ---------- the nine ----------
    n1 = {c["aiid"]: c for c in k81["nine"]}
    n2 = {it["aiid"]: it for it in sec["nine"]["items"]}
    assert set(n1) == set(n2)
    nine = {
        "outside": agree([(n1[a]["outside"], n2[a]["outside"]) for a in sorted(n1)]),
        "rerunnable_or_not": agree([("rerunnable" if n1[a]["outside"] == "rerunnable" else "not",
                                     "rerunnable" if n2[a]["outside"] == "rerunnable" else "not") for a in sorted(n1)]),
        "model_unavailable_both": sum(1 for a in n1 if n1[a]["outside"] in ("closed", "model closed")
                                      and n2[a]["outside"] in ("closed", "model closed")),
        "rerunnable_second": sum(1 for a in n2 if n2[a]["outside"] == "rerunnable"),
        "model_access_second": dict(Counter(n2[a].get("model_access") for a in n2)),
        "atelier_test_for": dict(Counter(c["test_for"] for c in rd("check82/atelier_test_for.json")["cases"])),
    }

    # ---------- predictions ----------
    P123 = (study80["grade"]["kappa"] or 0) >= 0.60 and (study80["tests"]["kappa"] or 0) >= 0.60
    P124 = (study81["runner"]["kappa"] or 0) >= 0.60 and (study81["outside"]["kappa"] or 0) >= 0.50
    P125 = len(rer2_hold) <= len(T2) / 2

    res = {
        "check": 82, "session": 280, "date": "2026-11-19", "cycle": 16, "programme_step": 4,
        "predictions_file_sha256": sha("PREDICTIONS82.md"),
        "codebook_file_sha256": sha("check82/CODEBOOK.md"),
        "report_sha256": "e2a35f439cafade360e4df4a2f91f217a16174bd1231f97e64f7208ffa93e225",
        "study80": study80, "study81": study81, "nine": nine,
        "predictions": {"P123": P123, "P124": P124, "P125": P125},
        "predictions_held": sum([P123, P124, P125]), "predictions_informative": 3,
    }
    with open(os.path.join(HERE, "results82.json"), "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    page = {"R": res,
            "pairs": pairs,
            "sources": {r: {"final": F[r], "second": {k: second[r].get(k) for k in (
                "test", "runner", "pass", "outside", "model_access", "materials_access", "available_today", "models")},
                "first": {k: first[r].get(k) for k in ("test", "runner", "pass", "outside")},
                "hold_any": hold_any[r], "hold_some": hold_some[r],
                "pass_applies_to": second[r].get("pass_applies_to", [])} for r in refs},
            "sentences": sent,
            "adjudication": adj["items"],
            "nine": {str(a): {"second": n2[a]["outside"], "second_model_access": n2[a].get("model_access"),
                              "atelier_test_for": next(c["test_for"] for c in rd("check82/atelier_test_for.json")["cases"] if c["aiid"] == a)}
                     for a in sorted(n2)},
            "s80_disagree": [{"id": i, "page": s80[i]["page"], "text": s80[i]["text"],
                              "first": {k: c80[i].get(k) for k in ("about", "grade", "tests", "pass", "setter")},
                              "second": {k: s2[i].get(k) for k in ("about", "grade", "tests", "pass", "setter")}}
                             for i in sorted(c80)
                             if (yn(c80[i]["about"]), c80[i].get("grade"), c80[i].get("tests"), yn(c80[i].get("pass")))
                             != (s2[i]["about"], s2[i].get("grade"), s2[i].get("tests"), s2[i].get("pass") or "no")]}
    with open(os.path.join(HERE, "data82.js"), "w", encoding="utf-8") as f:
        f.write("window.D82=" + json.dumps(page, ensure_ascii=False) + ";\n")
    print(json.dumps({"P": res["predictions"], "s80": {k: study80[k]["kappa"] for k in ("about", "grade", "tests", "pass")},
                      "s81": {k: study81[k]["kappa"] for k in ("test", "runner", "outside", "pass", "rerunnable_or_not", "maker_part")},
                      "rer_final": study81["final_totals"]["rerunnable"], "rer_hold": study81["final_totals"]["rerunnable_and_holds"]["k"],
                      "holds": study81["holds"]["codes"], "sent": {k: v for k, v in sent_counts.items() if not isinstance(v, list)}},
                     indent=1))


if __name__ == "__main__":
    main()
