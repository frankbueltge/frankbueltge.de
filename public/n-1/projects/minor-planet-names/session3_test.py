"""Project 9 session 3: the registered rules on invented strings (no real citation text), run before any parsing."""
from session3_lib import classify, headings

T = """MINOR PLANET CIRCULARS
OBSERVATIONS OF MINOR PLANETS
(1234) 2001 AB 2001 01 01.1 obs
SUMMARY OF NEW NUMBERINGS
(1234) = 2001 AB
NEW NAMES OF MINOR PLANETS
(1234) Exampleton = 2001 AB
Discovered 2001 Jan. 1 by A. Person at Somewhere.
Invented Person (b. 1990) is an invented honouree.
(5678) Otherplace = 1999 XY
Discovered 1999 Dec. 2 by B. Person at Elsewhere.
This citation replaces that on MPC 41234. Invented (1900-1980) was invented.
ERRATA
(9012) Thirdname = 1998 QQ
Discovered 1998 by C. at D.
On MPC 33333, the citation should read: Invented (b. 1950) ...
CORRECTED OBSERVATIONS
(3456) 1997 ZZ 1997 01 01
"""
assert [h for _, h in headings(T)][:3] == ["MINOR PLANET CIRCULARS", "OBSERVATIONS OF MINOR PLANETS", "SUMMARY OF NEW NUMBERINGS"]
assert classify(T, 1234) == ("new", "NEW NAMES OF MINOR PLANETS", False, None), classify(T, 1234)
assert classify(T, 5678) == ("new", "NEW NAMES OF MINOR PLANETS", True, 41234), classify(T, 5678)
assert classify(T, 9012) == ("correction", "ERRATA", True, 33333), classify(T, 9012)
assert classify(T, 3456) == ("other", "CORRECTED OBSERVATIONS", False, None), classify(T, 3456)
assert classify(T, 7777)[0] == "not found"
assert classify(T, 123)[0] == "not found"  # no prefix match
print("session3_test: all pass")
