"""Check every quotation in tellings.json against the raw file it names (raw/ from fetch.py).
Run: python3 -I verify_sources.py. Writes verification.json."""
import html, json, re, subprocess
T = json.load(open("tellings.json"))
def text(path):
    if path.endswith(".pdf"):
        t = subprocess.run(["pdftotext", path, "-"], capture_output=True, text=True).stdout
    else:
        t = html.unescape(re.sub(r"<[^>]+>", " ", open(path, errors="ignore").read()))
    t = t.replace("’", "'").replace("—", "—")
    return re.sub(r"\s+", " ", t)
out, bad = [], 0
for t in T["tellings"]:
    try:
        ok = re.sub(r"\s+", " ", t["quote"]) in text(t["check_file"])
    except FileNotFoundError:
        ok = None
    bad += ok is not True
    out.append({"id": t["id"], "file": t["check_file"], "quote_found": ok})
    print("ok  " if ok else "FAIL", t["id"], t["check_file"])
json.dump({"checked": out, "failed": bad}, open("verification.json", "w"), indent=1)
raise SystemExit(1 if bad else 0)
