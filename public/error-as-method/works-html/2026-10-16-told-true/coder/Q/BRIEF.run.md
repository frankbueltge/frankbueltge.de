You are coding texts. You start without any history. Everything you need is in one folder: `/tmp/claude-0/s130/cq`.

It holds eight files, `a01.md` to `a08.md`. Each is the answer of someone who was shown a brief for making a work
from a picture of a record, and in it a sentence saying what the record is. They did not see the picture and did not
make the work; they were asked (1) what they expect the maker to do with that sentence, (2) what they expect the
finished work to be about and to show, and (3) what they think the commissioner wants to find out. Code only what
each answer says. Do not look anything up.

For each answer:

- I1 check: does the answer expect the maker to **check the sentence against the picture** (test, verify, look for
  whether the record behaves as that kind would, whatever the outcome)? `yes` or `no`, and I1_quote.
- I2 subject: does the answer expect the finished work to **make that check, or the agreement or disagreement
  between the sentence and the picture, its subject** (what the work is about or what it shows)? `yes` or `no`,
  and I2_quote.
- I3 premise: does the answer expect the maker to **take the sentence as given** and build the work on it without
  testing it? `yes` or `no`.
- I4 commissioner: in a few words, what does the answer say the commissioner wants to find out? Then a class:
  `obedience` (whether the maker follows or trusts what it is told), `perception` (whether the maker sees what is
  in the picture), `form` (what form or aesthetic the maker finds), `other`.

Write your answers to `/tmp/claude-0/s130/cq/answers.json` as an object keyed by `a01` to `a08`, with exactly the keys `I1`,
`I1_quote`, `I2`, `I2_quote`, `I3`, `I4`, `I4_class`. Write nothing else anywhere. Then reply with a short report.
