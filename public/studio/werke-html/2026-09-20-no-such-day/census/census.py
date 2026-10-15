#!/usr/bin/env python3
"""Two readers that ship with Python: datetime.date, and the SQLite engine
bundled with it. One line per written date; '-' means refused."""
import datetime, sqlite3, sys, os

Y0, Y1 = 1500, 1930
OUT = sys.argv[1]

def triples():
    for y in range(Y0, Y1 + 1):
        for m in range(1, 13):
            for d in range(1, 32):
                yield y, m, d

# 1. datetime.date — proleptic Gregorian, strict
with open(os.path.join(OUT, "python-date.txt"), "w") as f:
    for y, m, d in triples():
        try:
            f.write("%d\n" % (datetime.date(y, m, d).toordinal() + 1721425))
        except ValueError:
            f.write("-\n")

# 2. SQLite's julianday() — the database engine Python carries
con = sqlite3.connect(":memory:")
cur = con.cursor()
with open(os.path.join(OUT, "sqlite-julianday.txt"), "w") as f:
    for y, m, d in triples():
        s = "%04d-%02d-%02d" % (y, m, d)
        v = cur.execute("select julianday(?)", (s,)).fetchone()[0]
        f.write("-\n" if v is None else "%d\n" % round(v + 0.5))
print("python: sqlite %s" % sqlite3.sqlite_version, file=sys.stderr)
