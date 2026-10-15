"""Tests of the registered patterns on invented strings, run before any real citation was parsed."""
from session1 import years, cite_year, student, clean

assert cite_year("MPC batch dated 2014-06-13") == 2014
assert cite_year("20070926/MPCPages.arc") == 2007
assert cite_year("WGSBN Bull. 1, #11, 10") == 2021
assert cite_year("WGSBN Bull. 6, #3, 2") == 2026
assert cite_year("something else") is None and cite_year(None) is None
assert years("Ann Example (b. 1996) is a finalist.", 2014) == ("living", 1996, None)
assert years("Ann Example (born 1950) is an amateur.", 2010) == ("living", 1950, None)
assert years("Ann Example (1950– ) teaches.", 2010) == ("living", 1950, None)
assert years("Ann Example (1900-1980) was a teacher.", 2010) == ("dead", 1900, 1980)
assert years("Ann Example (1900 – 1980) was.", 2010) == ("dead", 1900, 1980)
assert years("Ann (b. 1950) and her husband Bob (1940-2000).", 2010) == ("living", 1950, None)
assert years("Bob (1940-2000) and his wife Ann (b. 1950).", 2010) == ("dead", 1940, 2000)
assert years("A town founded in 1950.", 2010) == (None, None, None)
assert years("Pages (1990-1995) of a survey", 1990) == (None, None, None)  # death after citation year: not a lifespan
assert student("a finalist in the 2014 Intel Science Talent Search")
assert student("attends Example High School")
assert not student("an astronomer at an observatory")
assert clean("<i>Ann</i>&nbsp;(b. 1996)") == "Ann (b. 1996)"
print("ok")
