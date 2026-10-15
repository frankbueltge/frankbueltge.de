# The makers' folders

`<id>/first/` is the maker's folder at its first hand-in; `<id>/second/` at its second, after the
return. `data.js` is not copied (identical to `../data.js`, checked by `collect.py`). Each folder's
`renders/` holds the viewer's pictures, its copies of `index.html` at each render, and `log.jsonl`.

To keep the repository small, every render file in `second/renders/` that is byte-identical to the
file of the same name in `first/renders/` was removed after collection (they are the renders from
before the return). `second/renders/log.jsonl` is complete and lists all of them.
