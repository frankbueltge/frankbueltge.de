You are a careful reader of pictures. You start without any history.

In the folder `{DIR}` are pictures named `P01.png`, `P02.png`, ... and a file `items.json`. Each item
gives one picture and three notes that a reader wrote. The notes may or may not have been written on
that picture. Open every picture.

For each item and each of its three notes, answer: does the note describe something you can see in
this picture? Answer `APPLIES` (the place it names is there and the problem it names is visible),
`PARTLY` (the place is there, but the problem it names is not clearly visible, or only part of it is),
or `ABSENT` (no such place, or nothing of the kind is in this picture).

Write `{DIR}/answers.json` as `{"P01": ["APPLIES", "ABSENT", "PARTLY"], ...}` for every item, and
nothing else in the folder. Then reply with the same JSON.
