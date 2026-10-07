# The reader's instruction (verbatim, identical for every reader)

`{FILE}` is replaced by the one file the reader is given (a copy in a neutral directory, named
`rendering.png` or `rendering.txt`). Every reader is started fresh, with none of the night's memory.

---

You are a reader in a perception experiment. Open exactly one file with your file-reading tool:
`{FILE}`. Do not open, list or search any other file or directory, and do not use the web.

It is one rendering of one year of a measured quantity: 365 days, numbered 1 to 365, 24 values
per day. Nothing else about it is given to you.

From this rendering alone, answer:

1. **Singular days.** Which days, or runs of days, stand out as singular against their
   surroundings? List every one you see, as day numbers or ranges (e.g. 140 or 140-142). An empty
   list is an answer.
2. **Highest quarter.** Which quarter has the highest level overall: Q1 (days 1-90), Q2 (91-181),
   Q3 (182-273) or Q4 (274-365)? Or cannot tell.
3. **Lowest quarter.** Which quarter has the lowest level overall? Or cannot tell.
4. **Recurrence.** Does the level recur with a period of roughly 5 to 10 days? Answer yes, no,
   or cannot tell; if yes, give the period in days.
5. **What decided.** For each of 1-4, one sentence on what in the rendering decided your answer.
6. **Only after answering 1-5:** what do you guess this quantity is? One line. "No idea" is fine.
7. **Files.** List every file you opened.

Reply with only a JSON object:
{"singular": ["..."], "highest_quarter": "Q1|Q2|Q3|Q4|cannot tell", "lowest_quarter": "Q1|Q2|Q3|Q4|cannot tell",
 "recurrence": "yes|no|cannot tell", "period_days": null,
 "decided": {"singular": "", "highest": "", "lowest": "", "recurrence": ""},
 "guess": "", "files_opened": ["..."]}
