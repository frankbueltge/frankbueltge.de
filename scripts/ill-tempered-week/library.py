#!/usr/bin/env python3
"""Fetch the part of the VSCO 2 Community Edition that the ill-tempered week plays.

The library (Versilian Studios, CC0, version 1.1.0) is about 3 GB; the pieces play two dozen of its instruments,
about 1.2 GB. This script reads which instruments the renderer names (every quoted name in itw/*.py that is an
instrument file at the library's top), checks that every sample those instruments map is under the library root,
and only when one is missing downloads the release archive, checks its sha256 against the one pinned below and
extracts the instrument files and the missing samples. A sample is written under the spelling its instrument file
uses, so the sampler finds it on a case-sensitive file system as it does on a Mac.

  python scripts/ill-tempered-week/library.py [DEST]     # DEST defaults to ~/samples/VSCO-2-CE

The library root is DEST/VSCO-2-CE-1.1.0, the default VSCO_ROOT of itw/sampler.py. The nightly workflow
(.github/workflows/ill-tempered-week.yml) keeps DEST in its cache, so the archive is downloaded once, and again only
when a piece names an instrument the cache does not hold.
"""
import hashlib
import re
import shutil
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from itw import sampler  # noqa: E402  (parse() is the sampler's own reading of an instrument file)

URL = 'https://codeload.github.com/sgossner/VSCO-2-CE/zip/refs/tags/1.1.0'
SHA256 = '4a4446628df0e1a12aaee58e9f65f8fa7cde51971e961abb1b43083a6d3a8ab7'
TOP = 'VSCO-2-CE-1.1.0'


def named_instruments(root: Path) -> list[str]:
    """Every quoted name in the renderer that is an instrument file at the library's top."""
    names: set[str] = set()
    for src in sorted((HERE / 'itw').glob('*.py')):
        names |= set(re.findall(r"""['"]([A-Za-z][A-Za-z0-9-]*)['"]""", src.read_text()))
    return sorted(n for n in names if (root / f'{n}.sfz').is_file())


def missing(root: Path, instruments: list[str]) -> list[str]:
    """The samples these instruments map that are not under the root, relative to it as the instrument files spell them."""
    top = root.resolve()
    out: set[str] = set()
    for name in instruments:
        for region in sampler.parse(root / f'{name}.sfz'):
            if not region['sample'].is_file():
                out.add(region['sample'].relative_to(top).as_posix())
    return sorted(out)


def fetch(into: Path) -> Path:
    """Download the release archive into a temporary file beside the library and hold it to the pinned sha256."""
    into.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(suffix='.zip', dir=into)
    digest = hashlib.sha256()
    with urllib.request.urlopen(URL, timeout=300) as response, open(fd, 'wb') as out:
        while chunk := response.read(1 << 22):
            out.write(chunk)
            digest.update(chunk)
    if digest.hexdigest() != SHA256:
        Path(name).unlink()
        raise SystemExit(f'{URL} has sha256 {digest.hexdigest()}, not the pinned {SHA256}: nothing extracted')
    print(f'archive checked: sha256 {SHA256}')
    return Path(name)


def extract(archive: Path, root: Path, samples: list[str] | None) -> int:
    """Write archive members under the root: with samples None, the instrument files at the archive's top under
    their own names; otherwise those samples, found without regard to case, under the spelling given."""
    with zipfile.ZipFile(archive) as z:
        inside = {}
        for m in z.infolist():
            if not m.is_dir() and '/' in m.filename:
                inside[m.filename.split('/', 1)[1]] = m
        lower = {rel.lower(): m for rel, m in inside.items()}

        def put(m: zipfile.ZipInfo, rel: str) -> None:
            dest = root / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            with z.open(m) as src, open(dest, 'wb') as out:
                shutil.copyfileobj(src, out, 1 << 22)

        if samples is None:
            tops = [rel for rel in inside if '/' not in rel and rel.lower().endswith('.sfz')]
            for rel in tops:
                put(inside[rel], rel)
            return len(tops)
        lost = [rel for rel in samples if rel.lower() not in lower]
        if lost:
            raise SystemExit(f'{len(lost)} samples the instruments map are not in the archive, first {lost[0]}')
        for rel in samples:
            put(lower[rel.lower()], rel)
        return len(samples)


def main() -> None:
    dest = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path.home() / 'samples' / 'VSCO-2-CE'
    root = dest / TOP
    archive = None
    try:
        if not any(root.glob('*.sfz')):
            archive = fetch(dest)
            print(f'instrument files extracted: {extract(archive, root, None)}')
        instruments = named_instruments(root)
        if not instruments:
            raise SystemExit(f'the renderer names no instrument found under {root}')
        lacking = missing(root, instruments)
        if lacking:
            archive = archive or fetch(dest)
            print(f'samples extracted: {extract(archive, root, lacking)}')
            lacking = missing(root, instruments)
        if lacking:
            raise SystemExit(f'{len(lacking)} samples still missing after extraction, first {lacking[0]}')
        print(f'{len(instruments)} instruments ready under {root}: {", ".join(instruments)}')
    finally:
        if archive is not None:
            archive.unlink(missing_ok=True)


if __name__ == '__main__':
    main()
