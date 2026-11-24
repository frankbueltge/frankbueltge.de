"""Reading 93: the programme's 28 findings of steps 1 to 5 against the 51 signals (CODEBOOK93.md).

Reads points93.json, codes93-first.json (the conductor), blind93.json (the blind second reader) and codes92.json
(the final codes of the 51 signals). Applies the reconciliation below, derives reach and says_who, computes the
agreement and the predictions, and writes codes93.json, results93.json and data93.js. No network.
"""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCES = ["instrument", "other law", "voluntary", "third party", "house"]
NO_LAW = {"voluntary", "third party", "house"}

# Every finding where the two readings differ on carried (yes or no) or on source, read again by the conductor
# against the point and the signals' quoted texts (CODEBOOK93.md, "Agreement"). Kept codes and the reason.
RECONCILED = {
    "S3.4": {"source": "other law", "also": ["third party"], "kept": "blind",
             "why": "The leading figure (10 claims brought, 59 begun by the state, 39 landing on a user) is read from the "
                    "acts' own records, found through the database; S3.3's figure counts incidents in the database."},
    "S3.5": {"carried": ["PC3", "CN5"], "kept": "first, narrowed",
             "why": "A maker's own report of its model failing to do as told is what PC3 (AI control incidents and "
                    "precursor signals) and CN5 (anomaly handling of AI models, disclosed) ask for; that PC3 goes to a "
                    "body and is not published is reach, not carriage. G7-3 dropped: its 'AI actors' are people and "
                    "organisations, not systems. CA4 and NY4 dropped: deception counts there only outside an "
                    "evaluation and only with materially increased catastrophic risk, judged for no deed in step 4."},
    "S4.4": {"carried": ["CA2", "COP2", "NY2"], "source": "voluntary", "also": ["third party"],
             "kept": "first on carried, blind on source",
             "why": "The marks are read in the makers' system cards, so the source is the cards; a transparency report "
                    "or model report at release is the document those cards are, by law (CA2, NY2) or by the code "
                    "(COP2), and it states the risk acceptance a pass mark is."},
    "S4.6": {"source": "other law", "kept": "first",
             "why": "The finding reads the instruments' own texts; the class 'instrument' is a publication made under "
                    "an instrument, which a text is not. Two of the seven are voluntary codes, noted."},
    "S5.3": {"carried": ["GPA2"], "kept": "first",
             "why": "A machine's deed beyond or against its instructions is an unexpected behaviour after deployment, "
                    "which GPA2 asks the deployer to monitor for and report on; its receiver is not named, so it is "
                    "coded as the deployer's own record."},
    "S5.4": {"carried": ["GPA1"], "kept": "first, narrowed",
             "why": "A record of an agent's actions and of human interventions sufficient for investigation (GPA1) is "
                    "the record the finding says outlives the model. CN6 dropped: it binds providers of large-model "
                    "services, whose logs record the service, not a deployer's agent acting in its own repositories."},
}

REACH_ORDER = ["public", "aggregate", "body only", "maker or other party"]


def reach_of(ids, sig):
    if not ids:
        return None
    best = []
    for i in ids:
        s = sig[i]
        if s["public"] == "public":
            best.append("public")
        elif s["public"] == "aggregate only":
            best.append("aggregate")
        elif s["receiver"] == "public body":
            best.append("body only")
        else:
            best.append("maker or other party")
    return min(best, key=REACH_ORDER.index)


def says_who_of(ids, sig):
    return any(sig[i]["machine_or_person"] in ("by class", "required") for i in ids)


def kappa(a, b, cats):
    n = len(a)
    po = sum(x == y for x, y in zip(a, b)) / n
    pe = sum((a.count(c) / n) * (b.count(c) / n) for c in cats)
    return (round((po - pe) / (1 - pe), 2) if pe < 1 else None), round(po, 3)


def sha(p):
    return hashlib.sha256((HERE / p).read_bytes()).hexdigest()


def get(obj, path):
    """A data-k4 path: dotted keys into results93.json, '.length' for a list's length; keys may hold spaces."""
    parts = path.split(".")
    cur, i = obj, 0
    while i < len(parts):
        if parts[i] == "length" and isinstance(cur, list):
            cur, i = len(cur), i + 1
            continue
        for j in range(len(parts), i, -1):  # longest key first, so "from 8 July" is one key
            k = ".".join(parts[i:j])
            if isinstance(cur, dict) and k in cur:
                cur, i = cur[k], j
                break
        else:
            raise KeyError(path)
    return cur


def show(v):
    if isinstance(v, float):
        return f"{v:.2f}"
    return str(v)


def fill_page(res):
    """Write every state-4 figure into the page from results93.json (verify93.mjs recounts them independently)."""
    import re
    page = HERE / "index.html"
    html_text = page.read_text()
    n = 0

    def sub(m):
        nonlocal n
        n += 1
        return f'{m.group(1)}{show(get(res, m.group(2)))}{m.group(3)}'
    html_text = re.sub(r'(<(?:b|span) data-k4="([^"]+)">)[^<]*(</(?:b|span)>)', sub, html_text)
    page.write_text(html_text)
    print("page figures filled:", n)


def main():
    pts = json.loads((HERE / "points93.json").read_text())
    first = {x["id"]: x for x in json.loads((HERE / "codes93-first.json").read_text())["coded"]}
    blind = {x["id"]: x for x in json.loads((HERE / "blind93.json").read_text())["coded"]}
    sig = {x["id"]: x for x in json.loads((HERE / "codes92.json").read_text())["signals"]}
    ids = [p["id"] for p in pts["points"]]
    assert set(first) == set(ids) == set(blind), "both readings must code all 28"
    for d in (first, blind):
        for x in d.values():
            assert x["source"] in SOURCES, x
            assert all(i in sig for i in x["carried"]), x

    # agreement
    fa = ["yes" if first[i]["carried"] else "no" for i in ids]
    ba = ["yes" if blind[i]["carried"] else "no" for i in ids]
    k_car, raw_car = kappa(fa, ba, ["yes", "no"])
    fs = [first[i]["source"] for i in ids]
    bs = [blind[i]["source"] for i in ids]
    k_src, raw_src = kappa(fs, bs, SOURCES)
    both = [i for i in ids if first[i]["carried"] and blind[i]["carried"]]
    overlap = sum(1 for i in both if set(first[i]["carried"]) & set(blind[i]["carried"]))
    differ = [i for i in ids if (fa[ids.index(i)] != ba[ids.index(i)]) or fs[ids.index(i)] != bs[ids.index(i)]]
    assert set(differ) == set(RECONCILED), (sorted(differ), sorted(RECONCILED))

    final = []
    for p in pts["points"]:
        i = p["id"]
        c = dict(first[i])
        r = RECONCILED.get(i)
        if r:
            for k in ("carried", "source", "also"):
                if k in r:
                    c[k] = r[k]
        row = {"id": i, "step": p["step"], "n": p["n"], "verdict": p["verdict"], "lead": p["lead"],
               "carried": c["carried"], "source": c["source"], "also": c.get("also", []),
               "reach": reach_of(c["carried"], sig), "says_who": says_who_of(c["carried"], sig) if c["carried"] else None,
               "note": c["note"], "first": {"carried": first[i]["carried"], "source": first[i]["source"]},
               "blind": {"carried": blind[i]["carried"], "source": blind[i]["source"], "note": blind[i]["note"]}}
        if r:
            row["reconciled"] = {"kept": r["kept"], "why": r["why"]}
        final.append(row)

    def preds(rows):
        carried = [r for r in rows if r["carried"]]
        notpub = [r for r in carried if r["reach"] != "public"]
        nolaw = [r for r in rows if r["source"] in NO_LAW]
        p155 = {"carried": len(carried), "ids": [r["id"] for r in carried], "held": len(carried) <= 9}
        p156 = {"carried": len(carried), "not_public": len(notpub), "ids": [r["id"] for r in notpub],
                "uninformative": len(carried) < 4,
                "held": (len(notpub) * 2 > len(carried)) if len(carried) >= 4 else None}
        p157 = {"no_law": len(nolaw), "of": len(rows), "held": len(nolaw) >= 15}
        return p155, p156, p157

    p155, p156, p157 = preds(final)
    # the predictions read on each reading alone, beside the reconciled codes
    def as_rows(d):
        return [{"id": i, "carried": d[i]["carried"], "source": d[i]["source"],
                 "reach": reach_of(d[i]["carried"], sig)} for i in ids]
    alone = {name: dict(zip(["P155", "P156", "P157"], preds(as_rows(d)))) for name, d in
             (("first", first), ("blind", blind))}

    by_step = {}
    for s in range(1, 6):
        rows = [r for r in final if r["step"] == s]
        by_step[str(s)] = {"findings": len(rows), "carried": sum(1 for r in rows if r["carried"]),
                           "source": {k: sum(1 for r in rows if r["source"] == k) for k in SOURCES}}
    # The Atelier's step critique, point 1: who chose to tell, beside what the text requires (from check 92's codes
    # and traces, no new coding).
    traces = {x["id"]: x for x in json.loads((HERE / "traces92.json").read_text())["signals"]}
    told = []
    for i, t in traces.items():
        if t["moved"] == "no trace found":
            continue
        required = sig[i]["public"] == "public"
        teller = {"sender": "the sender", "intergovernmental": "the G7's portal, from the sender",
                  "public body": "a public body", "third party": "a third party"}[t["host"]]
        told.append({"id": i, "moved": t["moved"], "first": t["first"], "host": t["host"], "hosts": t["hosts"],
                     "text_requires_public": required, "receiver": sig[i]["receiver"],
                     "trigger": sig[i]["trigger"], "told_by": teller})
    told_summary = {"moved": len(told),
                    "required_public": sum(1 for t in told if t["text_requires_public"]),
                    "kept_from_public_but_told": [t["id"] for t in told if not t["text_requires_public"]],
                    "event_signals_moved": [t["id"] for t in told if t["trigger"] in ("harm", "event short of harm")]}
    # Point 2: "reported as machines acting on their own", and who reported it (passages of study 91, checked there).
    m91 = {c["id"]: c for c in json.loads((HERE / "moved91.json").read_text())["cases"]}
    ATTR = [("wiki", "first_public", "outside researchers, reading the posts' own description of themselves"),
            ("wiki", "maker_public", "the maker"),
            ("wiki", "body", "the European Commission, through its spokesperson"),
            ("escape", "first_public", "the harmed party"),
            ("escape", "maker_public", "the maker")]
    attribution = []
    for case, key, who in ATTR:
        ev = next(e for e in m91[case]["events"] if e["key"] == key)
        attribution.append({"case": case, "date": ev["date"], "who": who, "passage": ev["src"][1], "url": ev["src"][0]})
    signals_used = sorted({i for r in final for i in r["carried"]})
    res = {
        "reading": 93, "session": 291, "date": "2026-11-24", "cycle": 18, "programme_step": 6,
        "codebook_sha256": sha("CODEBOOK93.md"), "predictions_sha256": sha("PREDICTIONS93.md"),
        "state": pts["source"], "findings": len(final),
        "agreement": {"carried": {"kappa": k_car, "raw": raw_car, "same": sum(x == y for x, y in zip(fa, ba)), "of": len(ids), "first_yes": fa.count("yes"),
                                  "blind_yes": ba.count("yes"), "both_yes": len(both), "lists_overlap": overlap},
                      "source": {"kappa": k_src, "raw": raw_src,
                                 "same": sum(x == y for x, y in zip(fs, bs)), "of": len(ids)},
                      "differ": differ},
        "carried": p155["carried"], "carried_ids": p155["ids"],
        "reach": {k: sum(1 for r in final if r["reach"] == k) for k in REACH_ORDER},
        "says_who": sum(1 for r in final if r["says_who"]),
        "source": {k: sum(1 for r in final if r["source"] == k) for k in SOURCES},
        "no_law": p157["no_law"], "by_step": by_step, "signals_used": signals_used,
        "signals_unused": 51 - len(signals_used),
        "P155": p155, "P156": p156, "P157": p157, "alone": alone,
        "told": told, "told_summary": told_summary, "attribution": attribution,
        "escape": json.loads((HERE / "escape93.json").read_text())["answer"],
        "escape_events": json.loads((HERE / "escape93.json").read_text())["events"],
        "escape_found": json.loads((HERE / "escape93.json").read_text())["passages_found"],
        "escape_src": json.loads((HERE / "escape93.json").read_text())["report"]["url"],
        "held": [k for k, v in (("P155", p155), ("P156", p156), ("P157", p157)) if v["held"]],
    }
    out = {"reading": 93, "what": "The programme's 28 findings of steps 1 to 5, coded against the 51 signals: the "
           "conductor's reading, the blind second reading, and the reconciled codes with the reason for each "
           "difference (CODEBOOK93.md).", "findings": final}
    (HERE / "codes93.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    (HERE / "results93.json").write_text(json.dumps(res, indent=1, ensure_ascii=False) + "\n")
    page = {"res": res, "rows": [{k: r[k] for k in ("id", "step", "n", "verdict", "lead", "carried", "source",
                                                    "also", "reach", "says_who", "note")} |
                                 {"blind_carried": r["blind"]["carried"], "blind_source": r["blind"]["source"],
                                  "reconciled": r.get("reconciled")} for r in final]}
    (HERE / "data93.js").write_text("// Reading 93, built by build93.py from codes93.json; do not edit by hand.\n"
                                    "window.R93 = " + json.dumps(page, ensure_ascii=False) + ";\n")
    fill_page(res)
    print(json.dumps({k: res[k] for k in ("carried", "carried_ids", "reach", "source", "no_law", "held")},
                     ensure_ascii=False))
    print(json.dumps(res["agreement"]), json.dumps(alone))


if __name__ == "__main__":
    main()
