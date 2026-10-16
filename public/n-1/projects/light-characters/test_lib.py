"""Invented strings only, written before any volume was parsed."""
from lib import key, position, nm_range, cls, km

assert key("Fl.(2)W.\nperiod 10s \nfl. 1.0s, ec. 1.0s \n") == ("Fl.(2)W.", 10.0, "rhythmic")
assert key("F.G.\n") == ("F.G.", None, "fixed")
assert key("Q.W.\n") == ("Q.W.", None, "unparsed")
assert key("Iso. W. R. G.\nperiod 4s\n") == ("Iso.W.R.G.", 4.0, "rhythmic")
assert key("Fl.R.\nperiod 2.5s \n") == ("Fl.R.", 2.5, "rhythmic")
assert key("") == (None, None, "unparsed") and key(None)[2] == "unparsed"
assert key("F.R.\nperiod 6s") [2] == "rhythmic"   # a period decides; stated rule
la, lo = position('46°15\'34.96"N \n72°37\'48.37"W'); assert abs(la - 46.259711) < 1e-5 and abs(lo + 72.630103) < 1e-5
la, lo = position('0°44\'31.5"S \n48°30\'22.5"W'); assert la < 0 and lo < 0
assert position('51°14\'00"N \n56°48\'00"W') == (51 + 14 / 60, -(56 + 48 / 60))
assert position('10°N \n20°E') == (10.0, 20.0)
assert position("garbage") is None and position(None) is None
assert nm_range("17\n13") == 17 and nm_range("5") == 5 and nm_range(None) is None and nm_range("") is None
assert [cls(x) for x in (None, 3, 8, 14, 15)] == ["unknown", "minor", "middle", "middle", "major"]
assert abs(km((0, 0), (0, 1)) - 111.19) < 0.05
print("ok")
