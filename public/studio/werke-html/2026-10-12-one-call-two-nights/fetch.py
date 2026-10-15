"""Fetch the published tellings this work reads. Writes raw/ (not committed) and raw-manifest.json.
Run: python3 -I fetch.py. Pages change; a later run may differ, and verify_sources.py says where."""
import hashlib, json, os, time, urllib.request
SRC = {
    "raw/nsarchive-ebb371.html": "https://nsarchive2.gwu.edu/nukevault/ebb371/",
    "raw/schlosser-notes.pdf": "https://www.chbeck.de/media/2825/inh_schlossercommandandcontrol_978-3-406-65595-1_1a_anmerkungen.pdf",
    "raw/chatham-2014.pdf": "https://www.chathamhouse.org/sites/default/files/field/field_document/20140428TooCloseforComfortNuclearUseLewisWilliamsPelopidasAghlani.pdf",
    "raw/wikipedia-close-calls.html": "https://en.wikipedia.org/wiki/List_of_nuclear_close_calls",
    "raw/newyorker-2016.html": "https://www.newyorker.com/news/news-desk/world-war-three-by-mistake",
    "raw/aca-2019.html": "https://www.armscontrol.org/act/2019-12/focus/nuclear-false-warnings-and-risk-catastrophe",
}
os.makedirs("raw", exist_ok=True)
man = {"note": "raw/ is not committed. Each file's source, size and SHA-256 as fetched; fetch.py rebuilds raw/.", "files": {}}
for path, url in SRC.items():
    b, err = None, None
    for i in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (studio-research)"})
            with urllib.request.urlopen(req, timeout=60) as r: b = r.read(); break
        except Exception as e:
            err = e; time.sleep(2 ** (i + 1))
    if b is None:
        man["files"][path] = {"url": url, "error": str(err)}; print(path, "FAILED", err); continue
    open(path, "wb").write(b)
    man["files"][path] = {"url": url, "fetched_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                          "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
    print(path, len(b))
json.dump(man, open("raw-manifest.json", "w"), indent=1)
