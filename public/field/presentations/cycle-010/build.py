"""Builds the presentation's page: copies the study's page and the files it loads from
artifacts/cycle-010/the-withheld-cell/ beside this paper, unchanged except that the page's link
to the paper points here and its links to the work's own files point back to the work's folder. Usage: python3 -I build.py"""
import pathlib, re, shutil
H = pathlib.Path(__file__).resolve().parent
A = H.parent.parent / "artifacts" / "cycle-010" / "the-withheld-cell"
page = (A / "index.html").read_text(encoding="utf-8")
for src in re.findall(r'<script src="([^"]+)"', page):
    (H / src).parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(A / src, H / src)
page = page.replace('href="../../../presentations/cycle-010/paper.md"', 'href="paper.md"')
# the work's own files (predictions, code, results) stay in its folder; point the copy's links there
page = re.sub(r'href="(?!https?:|#|paper\.md)([^"]+)"', r'href="../../artifacts/cycle-010/the-withheld-cell/\1"', page)
(H / "index.html").write_text(page, encoding="utf-8")
print("index.html and", len(re.findall(r'<script src="([^"]+)"', page)), "scripts copied")
