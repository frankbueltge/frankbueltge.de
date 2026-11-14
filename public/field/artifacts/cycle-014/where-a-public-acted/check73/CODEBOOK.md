# Codebook — acts of public bodies on AI compute (second, independent coding)

Each item is one dated act of a public body. You get its id, date, body, a short subject, the URL(s) of the
record(s) it was read from, and possibly a URL of a later record. Fetch the record(s) yourself and code the
act ONLY from what the records say (and, for `after`, from later records you find). Do not use memory as
evidence. If a record will not load, say so in `notes` and code what you can, marking uncertain fields "?".

Fields (use exactly these values):

- `point`: chip (export/sale of AI chips) | site (land, building, zoning, environmental permit, moratorium on
  data centres) | power (grid connection or own generation, incl. an air permit for generators) | deal (merger,
  investment, contract review) | model (the running model or service, its training or operation).
- `effect`: stopped (refused, prohibited, voided, or a requirement that brought the thing to a halt) |
  delayed (moratorium, pause or suspension with a time limit or later lifted) | conditioned (allowed on terms
  the body set).
- `form`: rule (binds a class) | case (addressed to a named project, firm or transaction).
- `level`: sub (municipal, county, state/province/region) | nat (national) | supra.
- `kind`: elected (elected body: council, board of commissioners, legislature) | agency (executive agency or
  ministry/government) | regulator (independent regulator) | court.
- `terr`: inside (the compute/building stands in the acting public's territory) | elsewhere (bound abroad) |
  na (model point).
- `grounds`: a list, from the act's own stated reasons, chosen from: national security; personal data; power
  or grid; water; land, noise or the neighbourhood; air (or "water or air" for an air permit); competition /
  consumer protection; the model's output; AI risk (capability or control of models as such); procedure;
  other: <text>.
- `named`: the holder or frontier developer named in the record, if one of: Google, Microsoft, Meta, Amazon,
  Oracle, xAI (or X as its vehicle), OpenAI, Anthropic, Google DeepMind — else null. (Another named firm, e.g.
  a chip maker or a local LLC, is NOT a holder: put it in `notes`.)
- `size`: what size of the thing acted on the record itself states: money | land | power (MW) | floor area |
  chips | none. Give the text in `size_text`.
- `after`: the act's state on 2026-11-14: stands | lifted (lifted or loosened) | gone around (the thing went
  ahead by another route or in another form) | superseded (replaced by a wider/later rule) | unknown. Give the
  record you rely on in `after_source` and say if it is first-hand (the body's or the party's own document) or
  second-hand (press).

Output: a JSON array, one object per item, with the fields above plus `id`, `after_source`,
`after_firsthand` (true/false), `notes` (one sentence max). Nothing else.
