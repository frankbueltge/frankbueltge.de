"""Project 8, session 3: apply SESSION3.md's rule. Reads scratch (speakers.json, papers.json), writes q3_rows.json (ids, dates,
flags, paper ids; no names, no titles) and, in scratch, the reading sheet for the 20-promise check. Prints no shares.
Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
"""
import datetime as dt, json, os, random, re, sys

YEARS = [2005, 2010, 2015, 2020, 2025]
TITLES = ("Lord", "Baroness", "Earl", "Viscount", "Countess", "Duke", "Marquess", "Lady")
STOP = set("about after their there these which other would should could house lords commons committee debate report motion "
           "order question questions statement second third reading amendment amendments stage regulations minister "
           "government letter between".split())
LETTER = re.compile(r"\bletters?\b", re.I)


def surname(name, house):
    name = (name or "").strip()
    if not name:
        return None
    if house == "Lords":
        w = name.split()
        if w and w[0] == "The":
            w = w[1:]
        if len(w) >= 3 and w[0] == "Bishop" and w[1] == "of":
            return " ".join(w[2:])
        if w and w[0] in TITLES:
            rest = " ".join(w[1:])
            if rest.startswith("of "):  # territorial title: Earl of X (deviation, JOURNAL3 item 2)
                return rest[3:]
            return rest.split(" of ")[0]
        return w[-1] if w else None
    return name.split()[-1]


def words(s):
    return {w.lower() for w in re.findall(r"[A-Za-z]+", s or "") if len(w) >= 5 and w.lower() not in STOP}


def main(scratch):
    rows = [r for r in json.load(open("session1_rows.json")) if r["promise"] and r["year"] in YEARS]
    sp = json.load(open(os.path.join(scratch, "speakers.json")))
    pp = json.load(open(os.path.join(scratch, "papers.json")))
    papers = [p for y in pp.values() for p in y["items"]]
    for p in papers:
        p["_d"] = dt.date.fromisoformat(p["dateReceived"][:10])
    papers.sort(key=lambda p: p["_d"])
    out, sheet = [], {}
    for r in rows:
        s = sp.get(r["id"].lower())
        rec = {k: r[k] for k in ("id", "house", "year", "date", "bill", "debate_id")}
        if s is None:
            rec["found"] = False
            out.append(rec)
            continue
        sn = surname(s["name"], r["house"])
        d0 = dt.date.fromisoformat(r["date"])
        d1 = d0 + dt.timedelta(days=60)
        pat = re.compile(r"\b" + re.escape(sn) + r"\b", re.I) if sn else None
        dw = words(r["debate"])
        prim, strict = [], []
        for p in papers:
            if p["_d"] < d0 or p["_d"] > d1:
                continue
            hs = p.get("houses") or []
            if hs and r["house"] not in hs:
                continue
            t = p.get("title") or ""
            if not LETTER.search(t) or not pat or not pat.search(t):
                continue
            prim.append(p["paperId"])
            if dw & words(t):
                strict.append(p["paperId"])
        rec |= {"found": True, "surname_ok": bool(sn), "letter_back": bool(prim), "on_topic": bool(strict),
                "papers": prim, "papers_on_topic": strict}
        out.append(rec)
        sheet[r["id"]] = {"name": s["name"], "debate": r["debate"], "text": s["text"],
                          "titles": {p["paperId"]: p["title"] for p in papers if p["paperId"] in prim}}
    json.dump(out, open("q3_rows.json", "w"), indent=0)
    cand = sorted(r["id"] for r in out if r.get("letter_back") and not r["bill"])
    pick = random.Random(20261015).sample(cand, min(20, len(cand)))
    json.dump([{"id": i} | sheet[i] for i in pick], open(os.path.join(scratch, "reading_sheet.json"), "w"), indent=1)
    print("frame", len(out), "found", sum(1 for r in out if r["found"]), "papers", len(papers), "sheet", len(pick))


if __name__ == "__main__":
    main(sys.argv[1])
