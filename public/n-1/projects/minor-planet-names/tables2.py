"""Project 9 session 2: reference tables from public listings (no names).

Usage: python3 tables2.py MPC_ARCHIVE_HTML WGSBN_ARCHIVE_HTML -> tables2.json
  MPC archive table: https://minorplanetcenter.net/iau/ECS/MPCArchive/MPCArchive_TBL.html (batch date, MPC page range)
  WGSBN archive:     https://www.wgsbn-iau.org/files/Bulletins/ (volume, issue, date)
"""
import json, re, sys

mpc = open(sys.argv[1], encoding="latin1").read()
rows = []
for tr in re.findall(r"<tr>(.*?)</tr>", mpc, re.S):
    d = re.search(r"(\d{4}/\d\d/\d\d)", tr)
    m = re.search(r"<i>MPC</i>\s*(\d+)\s*-\s*(\d+)", tr)
    if d and m:
        rows.append([int(m.group(1)), int(m.group(2)), d.group(1)])
wg = re.sub(r"<[^>]+>", " ", open(sys.argv[2], encoding="utf8").read())
bulls = {}
MON = {m: i + 1 for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"])}
for v, i, y, mo, dd in re.findall(r"Volume\s+(\d+),\s*#(\d+)\s*\((\d{4})\s+([A-Za-z]+)\.?\s+(\d+)\)", wg):
    bulls[f"{int(v)}-{int(i)}"] = f"{y}-{MON.get(mo, MON.get(mo[:3], 0)):02d}-{int(dd):02d}"
json.dump({"mpc_batches": sorted(rows), "wgsbn_bulletins": bulls}, open("tables2.json", "w"), indent=0)
print(len(rows), "MPC batches;", len(bulls), "bulletins;", sorted(rows)[0], sorted(rows)[-1])
