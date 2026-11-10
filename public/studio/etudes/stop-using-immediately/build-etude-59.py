#!/usr/bin/env python3
"""
Generator for etude-59b-one-object.html.

Builds a single self-contained HTML file that reproduces one CPSC recall
notice (RecallNumber 26591) whole: every string taken programmatically from
the source JSON, character for character, no retyping, no correction. The
five product photographs are read from disk and base64-inlined as data: URIs.

Source of record: recalls-2026-07-01_2026-08-02.json (NOT the cpsc.gov HTML
page). The record used is not hard-coded by RecallNumber: it is the first
record, in the source's own order (RecallDate ascending, then RecallNumber
ascending), whose Remedies text matches /stop using[^.]*immediately/i. That
rule is applied here, live, and the count of records it skipped before
matching is printed, so a stranger can re-derive the choice from the file.

Session-59 rebuild note (staging voice's finding, same night): the first
build placed the five photographs after every text field, following the
Artist's own bullet-list order in ARTIST-REFORM-59.md §6. The staging voice
went to the JSON record's own key order and found `Images` sits at key
index 10 of 22 — immediately after `Products`, before `Injuries`,
`Retailers`, `Distributors`, `Hazards` and `Remedies` — which is also what
"One scroll. Object first, then the document." requires. This script now
derives that relation from the live record (see `derive_key_order` and the
assertion in `build()`) and places the image block accordingly: right after
the Product field, before Description onward. That is the one change from
the first build. The old output (etude-59-one-object.html) is left
untouched as evidence; this script no longer reproduces it.

Run:
    python3 build-etude-59.py

Writes:
    etude-59b-one-object.html   (next to this script)
"""

import base64
import html
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent  # /home/user/studio

JSON_PATH = REPO / "projects/cpsc-recall-channel/observation/recalls-2026-07-01_2026-08-02.json"
IMAGE_DIR = REPO / "projects/cpsc-recall-channel/observation/26591"
MANIFEST_PATH = IMAGE_DIR / "MANIFEST.json"
OUT_PATH = HERE / "etude-59b-one-object.html"

SOURCE_ENDPOINT = (
    "https://www.saferproducts.gov/RestWebServices/Recall"
    "?format=json&RecallDateStart=2026-07-01&RecallDateEnd=2026-08-02"
)
SOURCE_SHA256 = "cf45ebec3c0748cf644c1cf7da5fc99e2ebb00f477434dac0a0eeb09e4784da1"
ANALYSE_SCRIPT_NAME = "analyse.py"

REMEDY_PATTERN = re.compile(r"stop using[^.]*immediately", re.IGNORECASE)


def esc(s):
    """HTML-escape a string. Never edits, corrects or normalises it."""
    if s is None:
        return ""
    return html.escape(str(s), quote=True)


def paragraphs(s):
    """
    Render a string's literal newlines as paragraph breaks (the one
    transformation the spec permits). Everything else in the string
    travels unchanged, escaped only for HTML safety.
    """
    if s is None:
        return ""
    parts = str(s).split("\n")
    return "".join(f"<p>{esc(p)}</p>" for p in parts if p != "" or len(parts) == 1)


def paragraph_join(*strings):
    """
    Join several already-separate source strings (e.g. product name and its
    unit count, two distinct JSON fields placed on one line by the notice's
    own field order) into a single paragraph, space-separated. Each string
    is escaped; none of their characters are altered.
    """
    parts = [esc(s) for s in strings if s]
    return f"<p>{' &mdash; '.join(parts)}</p>" if parts else ""


def remedy_text_of(record):
    rem = record.get("Remedies") or []
    return " ".join(x.get("Name", "") for x in rem if isinstance(x, dict))


def select_record(all_records):
    """
    The rule that chose the record, stated before it was applied:
    the first record in the source's own order (RecallDate ascending,
    then RecallNumber ascending) whose Remedies text matches
    /stop using[^.]*immediately/i.
    """
    ordered = sorted(
        all_records,
        key=lambda r: (str(r.get("RecallDate", "")), str(r.get("RecallNumber", ""))),
    )
    skipped = 0
    for r in ordered:
        if REMEDY_PATTERN.search(remedy_text_of(r)):
            return r, skipped
        skipped += 1
    raise SystemExit("No record in the source matches the remedy pattern.")


def first_name(list_of_dicts, key="Name"):
    """Pull the first item's Name field from CPSC's list-of-one-dict fields."""
    if not list_of_dicts:
        return ""
    item = list_of_dicts[0]
    if isinstance(item, dict):
        return item.get(key, "")
    return str(item)


def all_names(list_of_dicts, key="Name"):
    out = []
    for item in list_of_dicts or []:
        if isinstance(item, dict):
            v = item.get(key, "")
        else:
            v = str(item)
        if v:
            out.append(v)
    return out


def load_image_data_uri(path):
    raw = path.read_bytes()
    b64 = base64.b64encode(raw).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"


def derive_key_order(record):
    """
    The JSON record's own key order, as written by the source (Python's
    json.load preserves object key order; nothing here reorders it). Used
    to derive — not assume — where the Images field sits relative to the
    other fields this page displays.
    """
    return list(record.keys())


def verify_images_position(key_order):
    """
    Confirm, from the live record, that Images sits after Products and
    before Injuries, Retailers, Distributors, Hazards and Remedies — the
    relation the staging voice found and the reason the image block moves.
    Raises if a future record's shape no longer supports it, rather than
    silently keeping a placement decision the data no longer backs.
    """
    idx = {k: i for i, k in enumerate(key_order)}
    images_idx = idx["Images"]
    after = idx["Products"]
    before_fields = ["Injuries", "Retailers", "Distributors", "Hazards", "Remedies"]
    if images_idx <= after:
        raise SystemExit("Images does not follow Products in the source's key order.")
    for field in before_fields:
        if images_idx >= idx[field]:
            raise SystemExit(f"Images does not precede {field} in the source's key order.")


def build():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        all_records = json.load(f)

    record, skipped = select_record(all_records)
    recall_number = str(record.get("RecallNumber", ""))
    print(f"selection: skipped {skipped} records before matching; selected RecallNumber {recall_number}",
          file=sys.stderr)

    key_order = derive_key_order(record)
    print(f"source key order ({len(key_order)} keys): {key_order}", file=sys.stderr)
    verify_images_position(key_order)
    print("verified: Images follows Products and precedes Injuries, Retailers, "
          "Distributors, Hazards, Remedies in the source's own key order — "
          "image block placed accordingly, right after the Product field.",
          file=sys.stderr)

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # Fields, taken programmatically, in the notice's own field order per §6:
    # Title, RecallDate, RecallNumber, product name + NumberOfUnits,
    # Description, Hazard, Remedy (full text), Injuries, Retailers line,
    # Distributor, country of manufacture, ConsumerContact, notice URL,
    # then all five images with captions in the notice's own order.
    title = record.get("Title", "")
    recall_date = record.get("RecallDate", "")
    products = record.get("Products") or []
    product_name = first_name(products, "Name")
    number_of_units = products[0].get("NumberOfUnits", "") if products else ""
    description = record.get("Description", "")
    hazard = first_name(record.get("Hazards") or [])
    remedy = first_name(record.get("Remedies") or [])
    injuries = first_name(record.get("Injuries") or [])
    retailers_line = first_name(record.get("Retailers") or [])
    distributor = first_name(record.get("Distributors") or [])
    manufacturer_countries = all_names(record.get("ManufacturerCountries") or [], "Country")
    consumer_contact = record.get("ConsumerContact", "")
    notice_url = record.get("URL", "")
    images_json = record.get("Images") or []

    # Cross-reference JSON's Images list order/captions against the on-disk
    # manifest order (both are the notice's own order); use the manifest for
    # the file path, and the JSON's own Caption string as the text of record.
    if len(images_json) != len(manifest["images"]):
        raise SystemExit("Image count mismatch between JSON record and manifest.")

    image_entries = []
    for i, (img_json, img_manifest) in enumerate(zip(images_json, manifest["images"]), start=1):
        caption = img_json.get("Caption", "")
        file_name = img_manifest["file"]
        file_path = IMAGE_DIR / file_name
        data_uri = load_image_data_uri(file_path)
        image_entries.append({
            "order": i,
            "caption": caption,
            "data_uri": data_uri,
            "source_url": img_json.get("URL", ""),
        })

    html_out = render_html(
        title=title,
        recall_date=recall_date,
        recall_number=recall_number,
        product_name=product_name,
        number_of_units=number_of_units,
        description=description,
        hazard=hazard,
        remedy=remedy,
        injuries=injuries,
        retailers_line=retailers_line,
        distributor=distributor,
        manufacturer_countries=manufacturer_countries,
        consumer_contact=consumer_contact,
        notice_url=notice_url,
        image_entries=image_entries,
    )

    OUT_PATH.write_text(html_out, encoding="utf-8")
    print(f"wrote {OUT_PATH} ({len(html_out.encode('utf-8'))} bytes)", file=sys.stderr)


def render_html(*, title, recall_date, recall_number, product_name, number_of_units,
                 description, hazard, remedy, injuries, retailers_line, distributor,
                 manufacturer_countries, consumer_contact, notice_url, image_entries):

    # Country of manufacture: reproduce the source's own strings, joined by
    # ", " if more than one — no flag, no map, no emphasis added.
    country_text = ", ".join(manufacturer_countries)

    images_html = []
    for entry in image_entries:
        images_html.append(
            "<figure class=\"photo\">"
            f"<img src=\"{entry['data_uri']}\" alt=\"{esc(entry['caption'])}\">"
            f"<figcaption>{esc(entry['caption'])}</figcaption>"
            "</figure>"
        )
    images_block = "\n".join(images_html)

    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<style>
  html, body {{
    margin: 0;
    padding: 0;
    background: #faf9f6;
    color: #141414;
  }}
  body {{
    font-family: Georgia, 'Iowan Old Style', 'Times New Roman', serif;
    line-height: 1.5;
    padding: 2rem 1rem 3rem 1rem;
  }}
  .sheet {{
    max-width: 62ch;
    margin: 0 auto;
  }}
  h1 {{
    font-size: 1.3rem;
    font-weight: normal;
    margin: 0 0 1.25rem 0;
  }}
  .field {{
    margin: 0 0 1.25rem 0;
  }}
  .field .label {{
    font-size: 0.85rem;
    margin: 0 0 0.15rem 0;
  }}
  .field .value p {{
    margin: 0 0 0.6rem 0;
  }}
  .field .value p:last-child {{
    margin-bottom: 0;
  }}
  .remedy .value {{
    font-size: 2.6em;
    line-height: 1.3;
  }}
  .remedy .value p {{
    margin: 0 0 0.5rem 0;
  }}
  .photos {{
    margin: 2rem 0;
  }}
  figure.photo {{
    margin: 0 0 1.75rem 0;
  }}
  figure.photo img {{
    display: block;
    max-width: 360px;
    width: 100%;
    height: auto;
  }}
  figure.photo figcaption {{
    font-size: 0.85rem;
    margin-top: 0.35rem;
  }}
  footer {{
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid #ccc;
    font-size: 0.7rem;
    line-height: 1.5;
  }}
</style>
</head>
<body>
<div class="sheet">

<h1>{esc(title)}</h1>

<div class="field">
  <div class="label">Recall date</div>
  <div class="value">{paragraphs(recall_date)}</div>
</div>

<div class="field">
  <div class="label">Recall number</div>
  <div class="value">{paragraphs(recall_number)}</div>
</div>

<div class="field">
  <div class="label">Product</div>
  <div class="value">{paragraph_join(product_name, number_of_units)}</div>
</div>

<div class="photos">
{images_block}
</div>

<div class="field">
  <div class="label">Description</div>
  <div class="value">{paragraphs(description)}</div>
</div>

<div class="field">
  <div class="label">Hazard</div>
  <div class="value">{paragraphs(hazard)}</div>
</div>

<div class="field remedy">
  <div class="label">Remedy</div>
  <div class="value">{paragraphs(remedy)}</div>
</div>

<div class="field">
  <div class="label">Injuries</div>
  <div class="value">{paragraphs(injuries)}</div>
</div>

<div class="field">
  <div class="label">Sold at</div>
  <div class="value">{paragraphs(retailers_line)}</div>
</div>

<div class="field">
  <div class="label">Distributor</div>
  <div class="value">{paragraphs(distributor)}</div>
</div>

<div class="field">
  <div class="label">Manufactured in</div>
  <div class="value">{paragraphs(country_text)}</div>
</div>

<div class="field">
  <div class="label">Consumer contact</div>
  <div class="value">{paragraphs(consumer_contact)}</div>
</div>

<div class="field">
  <div class="label">Notice</div>
  <div class="value">{paragraphs(notice_url)}</div>
</div>

<footer>
  <p>[S]</p>
  <p>Source: U.S. Consumer Product Safety Commission. CPSC has not endorsed this study.</p>
  <p>{esc(SOURCE_ENDPOINT)}<br>sha256 {esc(SOURCE_SHA256)}<br>{esc(ANALYSE_SCRIPT_NAME)}</p>
  <p>Study, session 59. Not a work. Discardable.</p>
</footer>

</div>
</body>
</html>
"""
    return doc


if __name__ == "__main__":
    build()
