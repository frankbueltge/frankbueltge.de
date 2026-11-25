"""Study 94, part B -- the deeds' names, recounted from Git (CODEBOOK94.md, part B).

Answers the Atelier's handoff ho-2026-11-24-atelier-2. Reads the 75 deeds of the Atelier's data/window.json at
ulysses c9f43f0 that name their commits, and reads every commit from the repositories' own Git: author, committer,
and whether the commit's own message says that a machine session made it. The Atelier's counts by name
(data/present.json at the same commit) are read only after this count, and compared.

Usage: python3 names94.py <directory holding the clones: frankbueltge.de, ulysses, studio, ...>
Needs full commit history in each clone (a blobless or treeless clone is enough). Writes names94.json beside itself.
"""
import collections, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ATELIER_COMMIT = "c9f43f0c789fb72f34edd79656defa6bb1bc8d31"
WINDOW = "artifacts/cycle-018/until-another-hand/data/window.json"
PRESENT = "artifacts/cycle-018/until-another-hand/data/present.json"
ARCHITECT = "Frank Bültge"
PERSONAS = {"Ulysses", "Meridian", "Ensemble", "Assay", "Protokollführung", "Katalog-Scout", "Gegenmessung"}
SESSION = re.compile(r"(?im)^[A-Za-z-]*-Session:\s*https?://|/code/session_[A-Za-z0-9]+")
COAUTHOR = re.compile(r"(?im)^co-authored-by:\s*(.+)$")
PR = re.compile(r"\(#(\d+)\)|Merge pull request #(\d+)")


def git(root, repo, *args):
    r = subprocess.run(["git", "-C", os.path.join(root, repo), *args], capture_output=True, text=True)
    return r.returncode, r.stdout


def main(root):
    rc, raw = git(root, "ulysses", "show", f"{ATELIER_COMMIT}:{WINDOW}")
    assert rc == 0, "window.json not readable at the Atelier's commit"
    W = json.loads(raw)
    named = [d for d in W["deeds"] if d.get("commits")]
    rows, commits = [], {}
    for d in named:
        authors, committers, says_machine, coauthors, prs = set(), set(), False, [], []
        for repo, h in d["commits"]:
            rc, out = git(root, repo, "show", "-s", "--format=%H%x00%an%x00%cn%x00%B", h)
            assert rc == 0 and out.strip(), f"{repo} {h} not readable"
            full, an, cn, body = out.split("\x00", 3)
            authors.add(an)
            committers.add(cn)
            sess = bool(SESSION.search(body))
            co = [c.strip() for c in COAUTHOR.findall(body)]
            pr = [a or b for a, b in PR.findall(body)]
            says_machine |= sess or bool(co)
            coauthors += co
            prs += pr
            commits[f"{repo}@{full[:12]}"] = {"author": an, "committer": cn, "session_link": sess,
                                              "coauthor_trailer": bool(co), "pull_request": pr[:1] or None}
        rows.append({"row": d["row"], "n": d["n"], "authors": sorted(authors), "committers": sorted(committers),
                     "persona_author": bool(authors & PERSONAS),
                     "architect_only": authors == {ARCHITECT},
                     "says_machine_in_message": says_machine, "merged_through_forge": bool(prs)})
    n = len(rows)
    only_arch = sum(r["architect_only"] for r in rows)
    with_arch = sum(ARCHITECT in r["authors"] for r in rows)
    res = {
        "what": "Study 94, part B: the 75 deeds of the Atelier's window.json (ulysses c9f43f0) that name their commits, "
                "each commit read from the repositories' Git on 2026-11-25: author, committer, and whether its own "
                "message says that a machine session made it (a session link or trailer, or a co-author trailer).",
        "window_sha256": hashlib.sha256(raw.encode("utf-8")).hexdigest(),
        "deeds": n, "commits": len(commits),
        "architect_only": only_arch, "with_architect": with_arch, "persona_only": n - with_arch,
        "by_authors": {" + ".join(k): v for k, v in collections.Counter(tuple(r["authors"]) for r in rows).most_common()},
        "committer_forge": sum("GitHub" in r["committers"] for r in rows),
        "architect_only_says_machine": sum(r["architect_only"] and r["says_machine_in_message"] for r in rows),
        "architect_only_through_forge": sum(r["architect_only"] and r["merged_through_forge"] for r in rows),
        "says_machine_in_message": sum(r["says_machine_in_message"] for r in rows),
        "rows": rows, "commit_reads": commits,
    }
    # control: the same two marks across each repository's whole history, so a zero above is the deeds', not the reader's
    control = {}
    for repo in sorted({c[0] for d in named for c in d["commits"]}):
        rc, log = git(root, repo, "log", "origin/main", "--format=%x01%B")
        msgs = log.split("\x01")[1:]
        control[repo] = {"commits": len(msgs), "session_link": sum(bool(SESSION.search(m)) for m in msgs),
                         "coauthor_trailer": sum(bool(COAUTHOR.search(m)) for m in msgs)}
    res["control"] = control
    # only now: the Atelier's own count, for comparison
    rc, praw = git(root, "ulysses", "show", f"{ATELIER_COMMIT}:{PRESENT}")
    P = json.loads(praw)["deeds"]
    theirs = {(r["row"], r["n"]): sorted(r["names"]) for r in P["rows"]}
    agree = sum(theirs.get((r["row"], r["n"])) == r["authors"] for r in rows)
    res["atelier"] = {"read": P["read"], "only_architect": P["only_architect"], "with_architect": P["with_architect"],
                      "only_personas": P["only_personas"], "rows_agreeing": agree, "rows": len(theirs),
                      "present_sha256": hashlib.sha256(praw.encode("utf-8")).hexdigest()}
    json.dump(res, open(os.path.join(HERE, "names94.json"), "w"), indent=1, ensure_ascii=False)
    print("deeds", n, "commits", len(commits), "architect only", only_arch, "with", with_arch,
          "| says machine in message", res["says_machine_in_message"], "of which architect-only",
          res["architect_only_says_machine"], "| architect-only through forge", res["architect_only_through_forge"])
    print("Atelier:", res["atelier"])


if __name__ == "__main__":
    main(sys.argv[1])
