"""The Other Half — cycle 007 presentation (2026-10-12).

Reads the three sessions of cycle 007 and the Field's study 10, and asks of every row in the
cycle's three records which half of a near-miss sentence it writes in its own words.

usage: python3 analyse.py <field_study10_results.json>
  (https://raw.githubusercontent.com/frankbueltge/field-research/main/
   artifacts/2026-10-12-near-to-the-same-thing/data/results.json; only the numbers used are
   copied into results.json, with the file's sha256)
writes results.json
"""
import hashlib, json, sys, collections
from pathlib import Path

HERE = Path(__file__).resolve().parent
W = HERE.parent.parent / "window"
FIELD_URL = ("https://github.com/frankbueltge/field-research/blob/main/"
             "artifacts/2026-10-12-near-to-the-same-thing/data/results.json")

coding = json.loads((W / "cycle-007-session-1/coding.json").read_text())
sky = json.loads((W / "cycle-007-session-2/data.json").read_text())["rows"]
s3 = json.loads((W / "cycle-007-session-3/results.json").read_text())["rows"]
r1 = {x["id"]: x for x in json.loads((HERE / "reader1.json").read_text())}
r2 = {x["id"]: x for x in json.loads((HERE / "reader2.json").read_text())}
fpath = Path(sys.argv[1])
field = json.loads(fpath.read_text())
CAT = {"war", "detonation"}


def half(a, c, m):
    if a and c and m:
        return "whole"
    if c and m:
        return "right"          # a catastrophe marked as missed, no hinge
    if a and m:
        return "left"           # a hinge marked as decisive, no catastrophe
    return "neither"


# 1. the lists (session 1): M is yes by construction (an entry on a list of close calls)
lists = []
for e in coding["events"]:
    for en in e["entries"]:
        a, c = en["hinge"], en["cons"] in CAT
        lists.append(dict(ev=e["id"], name=e["name"], year=e["year"], k=en["k"],
                          hinge=en.get("quote") if a else None, actor=en.get("actor"),
                          cons=en["cons"], cons_quote=en.get("cons_quote"),
                          h=half(a, c, True)))

# 2. the first sentences (session 3), two readings by CODEBOOK.md
sents = []
for x in s3:
    i = x["event"]
    h1 = half(r1[i]["A"], r1[i]["C"], r1[i]["M"])
    h2 = half(r2[i]["A"], r2[i]["C"], r2[i]["M"])
    sents.append(dict(ev=i, label=x["label"], when=x["when"], nm_date=x["nm_date"],
                      lag=x["lag_years"], sentence=x["sentence"], source=x["source"],
                      url=x["url"], dk=[x["c1"], x["c2"]], h=[h1, h2],
                      why=[r1[i]["why"], r2[i]["why"]],
                      abc=[[r1[i][k] for k in "ACM"], [r2[i][k] for k in "ACM"]]))

# 3. the sky (session 2): the record writes a distance and no half; the class is mine
skyrows = [dict(des=r["des"], cd=r["cd"], ld=r["r_ld"], cls=r["cls"]) for r in sky]


def tally(hs):
    c = collections.Counter(hs)
    return {k: c.get(k, 0) for k in ("whole", "left", "right", "neither")}


T = {"lists": tally(x["h"] for x in lists),
     "sentences_r1": tally(x["h"][0] for x in sents),
     "sentences_r2": tally(x["h"][1] for x in sents),
     "sky": tally("neither" for _ in skyrows)}
agree_h = sum(x["h"][0] == x["h"][1] for x in sents)
agree_cells = sum(a == b for x in sents for a, b in zip(*x["abc"]))
dis = [[x["ev"], x["h"][0], x["h"][1]] for x in sents if x["h"][0] != x["h"][1]]

# whole sentences, by wait and by Danto kind
whole_any = [x for x in sents if "whole" in x["h"]]
whole_both = [x for x in sents if x["h"] == ["whole", "whole"]]

# 4. the joint: events held by the lists, by a first sentence and by the Field's study 10
ids1 = {e["id"]: e for e in coding["events"]}
pe = field["per_event"]
joint = []
for x in sents:
    if x["ev"] in ids1:
        es = [l for l in lists if l["ev"] == x["ev"]]
        joint.append(dict(ev=x["ev"], name=ids1[x["ev"]]["name"], year=ids1[x["ev"]]["year"],
                          keepers=[[l["k"], l["h"]] for l in es],
                          lists_whole=sum(l["h"] == "whole" for l in es),
                          first=x["h"], first_year=x["nm_date"][:4], lag=x["lag"],
                          field=pe[x["ev"]], same=ids1[x["ev"]]["same"]))

# what a visitor can join: for each of the 14 list events, every left half and every right half
# held by some keeper, and whether any single keeper wrote both
joinable = []
for e in coding["events"]:
    es = [l for l in lists if l["ev"] == e["id"]]
    L = [l["k"] for l in es if l["hinge"]]
    R = [l["k"] for l in es if l["cons"] in CAT]
    one = [l["k"] for l in es if l["h"] == "whole"]
    joinable.append(dict(ev=e["id"], L=L, R=R, one_hand=one,
                         only_by_two=bool(L and R and not one)))

out = dict(
    inputs=dict(field_sha256=hashlib.sha256(fpath.read_bytes()).hexdigest(), field_url=FIELD_URL,
                session1=f"window/cycle-007-session-1/coding.json",
                session2="window/cycle-007-session-2/data.json",
                session3="window/cycle-007-session-3/results.json"),
    tally=T,
    readers=dict(agree_half=agree_h, n=len(sents), agree_cells=agree_cells, cells=3 * len(sents),
                 disagreements=dis),
    whole_sentences=dict(any=[x["ev"] for x in whole_any], both=[x["ev"] for x in whole_both],
                         lags=[x["lag"] for x in whole_any],
                         min_lag=min((x["lag"] for x in whole_any), default=None),
                         median_all=sorted(x["lag"] for x in sents)[len(sents) // 2]),
    sky_cls=dict(collections.Counter(r["cls"] for r in skyrows)),
    field=dict(pairs=field["pairs"], ci95=field["ci95_by_event"]["share_same"],
               kappa=field["readers_kappa"]["kappa"], kappa_ci95=field["readers_kappa"]["kappa_ci95"]),
    joint=joint,
    joinable=joinable,
    only_by_two=[j["ev"] for j in joinable if j["only_by_two"]],
    lists=lists, sentences=sents, sky=skyrows,
)
(HERE / "results.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
print(json.dumps({k: out[k] for k in ("tally", "readers", "whole_sentences", "sky_cls",
                                       "only_by_two")}, indent=1))
for j in joint:
    print(j["ev"], j["name"], j["keepers"], "first:", j["first"], j["lag"], "field:", j["field"])
