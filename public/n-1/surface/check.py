#!/usr/bin/env python3
"""Check the surface's margin against the committed record.

    python3 surface/check.py        (from the repository root; standard library only)

surface/margin.json is hand-written standing prose beside a derived rendering, the class of
text that goes false when the state it describes moves (reading/20). This script cannot say
whether a sentence is true. It checks what a script can: that every file the margin cites
exists, that every page it links to exists, that its projects, works and sessions stand on the
atlas under the dates it gives, and that the list a visitor without JavaScript gets in
index.html names the same pages. It exits 1 on a failure and prints a note, never a failure,
for a night the record holds and the margin does not list yet.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = "https://github.com/frankbueltge/n-1/"
OUTCOMES = {"work", "modest", "putback", "open"}

fails, notes = [], []


def fail(msg):
    fails.append(msg)


def exists(rel):
    return os.path.exists(os.path.join(ROOT, rel))


def page_exists(href):
    """A relative link resolves to a file; a directory is read as its index.html."""
    rel = href.split("#")[0]
    return exists(os.path.join(rel, "index.html")) if rel.endswith("/") else exists(rel)


def check_link(where, href):
    if href.startswith(REPO):
        m = re.match(r"(?:blob|tree)/main/(.*)$", href[len(REPO):])
        if m and not exists(m.group(1).split("#")[0]):
            fail(f"{where}: links to a file this repository does not hold: {m.group(1)}")
    elif not re.match(r"^https?:", href) and not page_exists(href):
        fail(f"{where}: links to a page that does not exist: {href}")


def check_sources(where, item):
    cited = item.get("sources") or ([item["source"]] if item.get("source") else [])
    if not cited:
        fail(f"{where}: cites no source")
    for src in cited:
        if not exists(src):
            fail(f"{where}: cites a file that does not exist: {src}")


with open(os.path.join(ROOT, "surface", "margin.json"), encoding="utf-8") as f:
    M = json.load(f)

with open(os.path.join(ROOT, "atlas", "layers", "index.json"), encoding="utf-8") as f:
    manifest = json.load(f)
nodes = {}
for name in manifest:
    with open(os.path.join(ROOT, "atlas", "layers", name), encoding="utf-8") as f:
        layer = json.load(f)
    for node in layer.get("nodes", []):
        nodes[node["id"]] = dict(node, layer=layer["layer"])

for key in ("reading", "steps", "postulates", "quote", "instruments", "projects", "acts", "works", "loop"):
    if key not in M:
        fail(f"margin.json has no '{key}'")
if fails:
    print("\n".join("FAIL " + m for m in fails))
    sys.exit(1)

# the method
keys = [s["key"] for s in M["steps"]]
if len(set(keys)) != len(keys):
    fail("steps: a key is used twice")
for s in M["steps"]:
    where = f"step '{s['key']}'"
    check_sources(where, s)
    if not (s.get("stat") or s.get("derive")):
        fail(f"{where}: neither a stat nor a rule to derive one")
    for label, href in s.get("refs", []):
        check_link(f"{where}, link '{label}'", href)
for p in M["postulates"]:
    check_sources(f"postulate {p['n']}", p)
    if p.get("rank") not in (1, 2, 3, 4):
        fail(f"postulate {p['n']}: rank must be 1 to 4")
check_sources("the quote", M["quote"])
check_sources("the reading", M["reading"])
for a in M["acts"]:
    check_sources(f"act of {a['date']}", a)

# the projects
codes = {i["code"] for i in M["instruments"]}
listed, numbers = set(), []
for p in M["projects"]:
    where = f"project {p['n']}"
    numbers.append(p["n"])
    check_sources(where, p)
    if p["node"] not in nodes:
        fail(f"{where}: no node {p['node']} on the atlas")
    if not exists(p["dir"]):
        fail(f"{where}: no directory {p['dir']}")
    if p["outcome"] not in OUTCOMES:
        fail(f"{where}: outcome '{p['outcome']}' is not one of {sorted(OUTCOMES)}")
    for code in list(p["instruments"]) + list(p.get("fired", {})):
        if code not in codes:
            fail(f"{where}: unknown instrument {code}")
    if not p["sessions"]:
        fail(f"{where}: lists no session")
    for s in p["sessions"]:
        listed.add(s["night"])
        node = nodes.get(f"night:{s['night']}")
        if node is None:
            fail(f"{where}: night {s['night']} is not on the atlas")
        elif node["layer"][:10] != s["date"]:
            fail(f"{where}: night {s['night']} is dated {s['date']} here and {node['layer'][:10]} on the atlas")
    for label, href in p.get("pages", []):
        check_link(f"{where}, page '{label}'", href)
if numbers != sorted(set(numbers)):
    fail("projects: numbers must be unique and ascending")

# the works
for w in M["works"]:
    where = f"work '{w['title']}'"
    check_sources(where, w)
    check_link(where, w["href"])
    if w["node"] not in nodes:
        fail(f"{where}: no node {w['node']} on the atlas")
    if w.get("still") and not exists(w["still"]):
        fail(f"{where}: still not found: {w['still']}")
    if w.get("project") is not None and w["project"] not in numbers:
        fail(f"{where}: names project {w['project']}, which the margin does not list")

# the floor for a visitor without JavaScript names the same pages
with open(os.path.join(ROOT, "index.html"), encoding="utf-8") as f:
    html = f.read()
block = re.search(r"<noscript>(.*?)</noscript>", html, re.S)
floor = set(re.findall(r'href="((?:works|projects)/[^"]+)"', block.group(1) if block else ""))
wanted = {w["href"] for w in M["works"]} | {href for p in M["projects"] for _, href in p.get("pages", [])}
for href in sorted(wanted - floor):
    fail(f"index.html <noscript>: does not list {href}")
for href in sorted(floor - wanted):
    fail(f"index.html <noscript>: lists {href}, which the margin does not")

# nights the record holds and the margin does not list yet: a note, and the page says the same
if listed:
    first = min(listed)
    late = sorted(int(i[6:]) for i in nodes if re.fullmatch(r"night:\d+", i) and int(i[6:]) > first and int(i[6:]) not in listed)
    if late:
        notes.append("on the record and not in the project table: night " + ", ".join(map(str, late)))

for m in notes:
    print("note " + m)
for m in fails:
    print("FAIL " + m)
if fails:
    sys.exit(1)
sessions = sum(len(p["sessions"]) for p in M["projects"])
print(f"ok   {len(M['projects'])} projects, {sessions} sessions, {len(M['works'])} works; every cited file and linked page exists")
