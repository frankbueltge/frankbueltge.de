"""Session 2 rules on invented strings only, run before any re-fetched citation or sampled bulletin entry is read."""
from session2_lib import parse_cref, section_of, occasion_year, mpc_date

assert parse_cref("WGSBN Bull. 6, #11, 28") == (6, 11, 28)
assert parse_cref("WGSBN Bull. 1,#2,7") == (1, 2, 7)
assert parse_cref("20030318/MPCPages.arc") is None

toc = "Table of Contents\nNew Names of Minor Planets......8\n  (101) Alpha = 1999 AA..........8\nErrata.....12\n"
bull = toc + ("\n" * 3) + (
    "                 New Names of Minor Planets\n"
    "(101) Alpha = 1999 AA\nDiscovery: x\n   Ann Example (b. 1990) was a finalist in the 2008 Example Science Fair.\n\n"
    "                              Errata\n"
    "MPC 12345          -07      For Exampel read Example\n"
    "                                   [(202) citation]\n"
    "Bull. 2, #3, 4     -01      For x read y\n"
    "                                   [(303) name]\n"
    "                 Corrected Discovery Information\n"
    "(404) Delta = 2001 BB\n")
assert section_of(bull, 101) == ("new", None), section_of(bull, 101)
assert section_of(bull, 202) == ("erratum", "MPC 12345"), section_of(bull, 202)
assert section_of(bull, 303) == ("erratum", "Bull. 2, #3, 4"), section_of(bull, 303)
assert section_of(bull, 404) == ("other", None)
assert section_of(bull, 505) == ("not found", None)
assert section_of(bull, 10) == ("not found", None)  # (101) must not match (10)

assert occasion_year("Ann Example (b. 1990) was a finalist in the 2008 Example Science Fair.") == 2008
assert occasion_year("Bo Example (1931-2015) taught ...") is None
assert occasion_year("Cy Example (2001- ) mentored a finalist in the 2019 Example Talent Search.") == 2019
assert occasion_year("Di Example was awarded first place in the 2012 Example Fair and in 2013 ...") == 2012
assert occasion_year("No year here at 12345 or 1949 or 2031.") is None
assert mpc_date(57950, [(57000, 58000, "2006/06/01"), (58001, 59000, "2006/07/01")]) == "2006/06/01"
assert mpc_date(1, [(57000, 58000, "2006/06/01")]) is None
print("all pass")
