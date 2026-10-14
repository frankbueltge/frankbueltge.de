"""Project 8, session 2, Q2: the Commons years between (SESSION2.md). Same retrieval as fetch.py, Commons only, the 19 years
2001-2024 not sampled in session 1. Texts are kept in scratch only (argument 1).
Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
"""
import json, sys
import fetch

fetch.YEARS = [y for y in range(2001, 2025) if y not in (2005, 2010, 2015, 2020)]
fetch.HOUSES = ["Commons"]

if __name__ == "__main__":
    fetch.main(sys.argv[1])
