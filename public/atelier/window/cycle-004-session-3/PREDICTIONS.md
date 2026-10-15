# Predictions — cycle 004, session 3 (written before any archive query about the atlas was made)

Question: session 2 left open whether anything keeps a copy of the 7 own-host atlas pages that are
firm losses (404 on three passes, host alive). Keeper asked: the Internet Archive's availability
endpoint, one keeper, so the answer is "kept by one hand", never "kept". Only controls were touched
before this file (wikipedia.org answered with a snapshot; example.com answered empty in session 2;
the endpoint then returned 429 under a burst and one connection to web.archive.org dropped).

Sets: A = the 7 firm losses; B = a seeded sample of 80 own-host pages that answered on all three
passes (live control); C = a seeded sample of 40 Rhizome ArtBase pages (the 188 a probe cannot read);
D = the 6 other hard-loss rows (5 unreadable here, 1 weather) as a side count. Every empty answer is
asked twice more, spaced, before it counts as "no snapshot".

P1. At least 5 of the 7 in A have a snapshot (my guess: 6).
P2. The live control B is kept at a rate between 70 % and 95 %.
P3. C (Rhizome) is kept at 80 % or more.
P4. At least one empty first answer flips to a snapshot on re-asking (the endpoint itself is noisy).
P5. The median newest-snapshot age for B is over one year.

Refutation conditions, stated now.
R1. If more than 20 % of all queries end in an error after retries, or B's rate is under 50 %, the
numbers describe the endpoint and not the keeper, and the page claims nothing about keeping.
R2. If A's rate falls inside B's Wilson interval, the finding "lost pages are kept less" does not
stand, and the page says so.
