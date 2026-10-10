"""The Correction reads the Philadelphia Fed workbook even when its document properties are odd.

From 2026-08-03 to 2026-08-24 every Monday run died inside openpyxl's property reader, before a
single cell was read, and the page kept showing the reading of 2026-07-27. The fixture below
rebuilds that failure: a valid vintage table whose `dcterms:modified` carries a date without a
time.
"""
import io
import re
import zipfile

import openpyxl
import pandas as pd
import pytest


def workbook(modified: str | None) -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["DATE", "EMPLOY25M1", "EMPLOY25M2"])
    ws.append(["2024:12", 159000, 158500])
    ws.append(["2025:01", 159200, 158700])
    buf = io.BytesIO()
    wb.save(buf)
    if modified is None:
        return buf.getvalue()
    out = io.BytesIO()
    with zipfile.ZipFile(io.BytesIO(buf.getvalue())) as src, zipfile.ZipFile(out, "w") as dst:
        for item in src.infolist():
            data = src.read(item.filename)
            if item.filename == "docProps/core.xml":
                data = re.sub(rb"(<dcterms:modified[^>]*>)[^<]*(</dcterms:modified>)",
                              rb"\g<1>" + modified.encode() + rb"\g<2>", data)
            dst.writestr(item, data)
    return out.getvalue()


def test_fixture_reproduces_the_august_failure():
    with pytest.raises(TypeError, match="datetime"):
        pd.read_excel(io.BytesIO(workbook("2026-08-01")), index_col=0)


@pytest.mark.parametrize("modified", [None, "2026-08-01", "not a date", "2026-08-01T12:00:00Z"])
def test_reads_the_vintages_whatever_the_properties_say(refresh, modified):
    df = refresh.read_vintages(workbook(modified))
    assert list(df.index) == ["2024:12", "2025:01"]
    assert df.loc["2025:01"].tolist() == [159200, 158700]
