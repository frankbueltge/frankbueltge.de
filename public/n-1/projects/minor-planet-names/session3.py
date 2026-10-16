"""Project 9 session 3: the registered run (SESSION3.md).

Usage: python3 session3.py CACHE_DIR PDF_DIR ARCHIVE_TABLE_HTML
  CACHE_DIR: SBDB answers re-fetched with fetch3.py; PDF_DIR: MPC batch PDFs and their pdftotext output (downloaded here if absent);
  ARCHIVE_TABLE_HTML: https://minorplanetcenter.net/iau/ECS/MPCArchive/MPCArchive_TBL.html
Writes session3_rows.json (numbers, years, batch dates, headings, flags, MPC pages; no names, no text) and session3.json.
"""
import json, os, re, statistics, subprocess, sys, time, urllib.request
from session2_lib import mpc_date
from session3_lib import classify

UA = "n-1-remainder/1.0 (+https://github.com/frankbueltge/n-1)"
cache, pdfdir, tbl = sys.argv[1:4]
os.makedirs(pdfdir, exist_ok=True)
links = set(re.findall(r'MPCArchive/(\d{4}/MPC_\d{8})\.pdf', open(tbl, encoding="latin1").read()))
tables = json.load(open("tables2.json"))
rows2 = {r["n"]: r for r in json.load(open("rows2.json"))}


def batch_of(cref):
    m = re.search(r"MPC batch dated (\d{4})-(\d\d)-(\d\d)", cref or "") or re.match(r"(\d{4})(\d\d)(\d\d)/", cref or "")
    return "".join(m.groups()) if m else None


def text_of(b):
    t = os.path.join(pdfdir, f"MPC_{b}.txt")
    if os.path.exists(t):
        return open(t, encoding="utf8", errors="replace").read()
    key = f"{b[:4]}/MPC_{b}"
    if key not in links:
        return None
    p = os.path.join(pdfdir, f"MPC_{b}.pdf")
    for attempt in range(4):
        try:
            req = urllib.request.Request(f"https://minorplanetcenter.net/iau/ECS/MPCArchive/{key}.pdf", headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r:
                open(p, "wb").write(r.read())
            break
        except Exception as e:
            print("error", b, e, file=sys.stderr)
            time.sleep(2 ** (attempt + 1))
    else:
        return None
    subprocess.run(["pdftotext", p, t], check=True)
    os.remove(p)  # keep only the text, in scratch
    time.sleep(1)
    return open(t, encoding="utf8", errors="replace").read()


def band(a):
    return None if a is None else a // 5 * 5


rows = []
for n, r2 in rows2.items():
    if not (r2["cited"] and not r2["wgsbn"]):
        continue
    d = json.load(open(os.path.join(cache, f"{n}.json"))).get("discovery") or {}
    b = batch_of(d.get("cref"))
    r = {"n": n, "batch": b, "same_cite_year": (int(b[:4]) if b else None) == r2["cite_year"], "testable": False,
         "kind": None, "heading": None, "refers": False, "mpc_page": None, "earliest_date": None,
         "naming_year": r2["naming_year"], "redated3": False}
    if b and b >= "19791101":
        t = text_of(b)
        if t is not None:
            r["testable"] = True
            kind, head, refers, page = classify(t, n)
            r.update(kind=kind, heading=head, refers=refers, mpc_page=page)
            if page and (kind == "correction" or refers):
                ed = mpc_date(page, tables["mpc_batches"])
                if ed and ed.replace("/", "") < b:
                    r["earliest_date"] = ed
                    r["naming_year"] = int(ed[:4])
                    r["redated3"] = r["naming_year"] != r2["naming_year"]
    rows.append(r)

by = {r["n"]: r for r in rows}
# ages with session 2's and tonight's re-dating together
living_before, living_after, moved = [], [], 0
for n, r2 in rows2.items():
    if r2["status"] != "living" or r2["birth"] is None or r2.get("naming_unknown"):
        continue
    ny = by[n]["naming_year"] if n in by else r2["naming_year"]
    if ny is None:
        continue
    a0, a1 = r2["age"], ny - r2["birth"]
    living_before.append(a0)
    living_after.append(a1)
    moved += band(a0) != band(a1)


def bands(ages):
    c = {}
    for a in ages:
        c[band(a)] = c.get(band(a), 0) + 1
    return dict(sorted(c.items()))


tst = [r for r in rows if r["testable"]]
found = [r for r in tst if r["kind"] != "not found"]
outside = [r for r in found if r["kind"] != "new"]
new = [r for r in found if r["kind"] == "new"]
ref = [r for r in new if r["refers"]]
bb = bands(living_after)
out = {
    "mpc_dated": len(rows),
    "cite_year_matches_s2": sum(r["same_cite_year"] for r in rows),
    "untestable_before_archive": sum(1 for r in rows if r["batch"] and r["batch"] < "19791101"),
    "untestable_no_batch_in_cref": sum(1 for r in rows if not r["batch"]),
    "untestable_pdf_missing": sum(1 for r in rows if r["batch"] and r["batch"] >= "19791101" and not r["testable"]),
    "testable": len(tst), "batches_read": len({r["batch"] for r in tst}),
    "kinds": {k: sum(1 for r in tst if r["kind"] == k) for k in ("new", "correction", "other", "not found")},
    "headings_outside_new": sorted({r["heading"] or "" for r in outside}),
    "refers": len(ref), "redated3": sum(r["redated3"] for r in rows),
    "living_with_age": len(living_after), "moved_band": moved,
    "bands_before": bands(living_before), "bands_after": bb,
    "median_age_after": statistics.median(living_after) if living_after else None,
    "P13_outside_share": round(len(outside) / len(found), 4) if found else None,
    "P13": bool(found) and len(outside) / len(found) <= 0.05,
    "P14_found_share": round(len(found) / len(tst), 4) if tst else None,
    "P14": bool(tst) and len(found) / len(tst) >= 0.95,
    "P15_refers_share": round(len(ref) / len(new), 4) if new else None,
    "P15": bool(new) and len(ref) / len(new) <= 0.02,
    "P16_largest_band": max(bb, key=bb.get) if bb else None,
    "P16": bool(bb) and max(bb, key=bb.get) == 15,
    "P17_moved_share": round(moved / len(living_after), 4) if living_after else None,
    "P17": bool(living_after) and moved / len(living_after) <= 0.02,
}
json.dump(rows, open("session3_rows.json", "w"), indent=0)
json.dump(out, open("session3.json", "w"), indent=1)
print(json.dumps(out, indent=1))
