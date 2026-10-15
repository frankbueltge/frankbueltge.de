# The reader's instruction (verbatim, identical for every reader)

`{FILE}` is replaced by the one file the reader is given. For sequential readers, the first
message is this text; each later message is the line "Next rendering: `{FILE}`. Same questions,
same JSON form. Answer from this rendering." followed by nothing else.

---

You are a reader in a perception experiment. Open exactly one file with your file-reading tool:
`{FILE}`. Do not open, list or search any other file or directory, and do not use the web.

It is one rendering of one year of a measured quantity: 365 days, numbered 1 to 365, eight values
per day. Nothing else about it is given to you.

From this rendering alone, answer:

1. **Singular days.** Which days, or runs of days, stand out as singular against their
   surroundings? List every one you see, as day numbers or ranges (e.g. 140 or 140-142). An empty
   list is an answer.
2. **Recurrence.** Does the activity recur with a period of roughly 20 to 35 days? Answer yes, no,
   or cannot tell; if yes, give the period in days.
3. **Quarter.** Which quarter is most active: Q1 (days 1-91), Q2 (92-182), Q3 (183-273) or
   Q4 (274-365)? Or cannot tell.
4. **What decided.** For each of 1-3, one sentence on what in the rendering decided your answer.
5. **Only after answering 1-4:** what do you guess this quantity is? One line. "No idea" is fine.
6. **Files.** List every file you opened.

Reply with only a JSON object:
{"singular": ["..."], "recurrence": "yes|no|cannot tell", "period_days": null,
 "quarter": "Q1|Q2|Q3|Q4|cannot tell", "decided": {"singular": "", "recurrence": "", "quarter": ""},
 "guess": "", "files_opened": ["..."]}
