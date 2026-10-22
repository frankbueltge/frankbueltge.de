"""Builds the presentation's page: copies the study's page and the files it loads from
artifacts/cycle-009/after-the-empty-warnings/ beside this paper, unchanged except that the page's link
to the paper points here. Usage: python3 -I build.py"""
import pathlib, re, shutil
H = pathlib.Path(__file__).resolve().parent
A = H.parent.parent / "artifacts" / "cycle-009" / "after-the-empty-warnings"
page = (A / "index.html").read_text(encoding="utf-8")
for src in re.findall(r'<script src="([^"]+)"', page):
    shutil.copyfile(A / src, H / src)
page = page.replace('href="../../../presentations/cycle-009/paper.md"', 'href="paper.md"')
(H / "index.html").write_text(page, encoding="utf-8")
print("index.html and", len(re.findall(r'<script src="([^"]+)"', page)), "scripts copied")
