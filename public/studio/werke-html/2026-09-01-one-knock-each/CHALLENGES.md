# The hand check behind the classifier

`probe.py` decides mechanically whether a 2xx answer was the page asked for or a page
about the caller. A machine deciding that is exactly the kind of claim this room does not
publish unread, and it is a claim about a named third party's document. So every door the
classifier selected was then fetched again and read here by hand, on 2026-09-01. This
file is that reading.

## The five it selected

| Door | Status | Bytes | What the page is, read here |
|---|---|---|---|
| Springer – Nature Publishing Group | 200 | 3,038 | Title `Client Challenge`. Body is a `<noscript>` block reading *JavaScript is disabled in your browser. Please enable JavaScript to proceed.* plus a loading-error message. No policy text of any kind. |
| Springer – Biomed Central (BMC) | 200 | 3,038 | Byte-for-byte the same challenge page as above, at a different address. |
| BioMed Central (BMC) | 200 | 3,038 | The same again — the third of three identical challenge pages. |
| Royal Society of Chemistry | 200 | 6,889 | Reached after one 302 to a path with no relation to the policy URL. Title `Verification Check`; the visible text is *select the correct color · are you human? · submit*. |
| IEEE | 202 | 2,047 | No title. Loads a third-party web-application-firewall challenge script and says *in order to continue, we need to verify that you're not a robot. This requires JavaScript.* |

All five confirmed: not one is the page the census recorded, and not one contains the
route, the sentence or the address.

## What it did not select, and why that matters

The first marker list also held `captcha` and `access denied`. Read by hand, the six
pages `captcha` selected — Springer, Frontiers, ACS, BMJ, FASEB, International Scientific
Information — are ordinary policy pages that merely embed a form widget; four of the six
delivered their route sentence in full. `access denied` selected MDPI, whose answer is a
372-byte refusal under HTTP 403 and is classified by its status line like every other
refusal. Both markers are struck in `probe.py`, where the struck list is kept beside the
working one rather than deleted.

## The other seven read by hand

The seven doors that opened without their route sentence were fetched and read here too,
because "the page came and the sentence did not" is the claim the work turns on.

- **Springer, PLoS, Taylor & Francis, ECDC** — the sentence is present and ends one word
  early. The missing word is the address. This is measured, not eyeballed: `make-data.py`
  records `stops_at_address` where the address occurs in the published sentence, does not
  occur in the run of words that arrived, and the arrived run is shorter than the sentence.
- **Dove Press, ASBMB, Cellular Physiol Biochem Press** — the whole sentence arrived and
  the address it points to is not in the bytes.
- **SAGE Publications** — the census quotes this row with an elision, so the sentence test
  cannot pass by construction. Its address did arrive, and it is counted as delivered.
- **Hindawi / Wiley** — a 223,743-byte page that yields 3,606 characters of text; the
  content is assembled by script after delivery. Counted as opened without the sentence,
  which is what it is.

## What was not done

Nobody was written to. Nothing was submitted to any form. No page fetched in the making of
this work is stored in this repository; what survives is the status, four headers, a byte
count, a hash, the tests, and — for quotation — the first 200 characters of visible text.
