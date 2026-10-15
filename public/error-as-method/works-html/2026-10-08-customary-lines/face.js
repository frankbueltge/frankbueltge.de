// face.js: draws the eighteen works from window.FACE (face-data.js, written by build.py).
(function () {
  var F = window.FACE, by = {};
  F.works.forEach(function (w) { by[w.m] = w; });
  var G = { "lunation grid of phase discs": "g-grid", "lunation spiral (moon clock)": "g-spiral",
            "core sample strata": "g-core", "silhouette landscape profile": "g-land" };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function card(w) {
    var c = el("div", "card"), a = el("a"), img = el("img");
    a.href = "makers/" + w.m + "/index.html"; a.title = "Open " + w.title;
    img.src = "thumbs/" + w.m + ".jpg"; img.alt = w.title + " (" + w.m + ")"; img.width = 550; img.height = 400;
    a.appendChild(img); c.appendChild(a);
    if (w.arm !== "R") { var g = el("div", "g " + (G[w.group] || "g-one")); c.appendChild(g); }
    var cap = el("div", "cap"); cap.appendChild(el("div", "t", w.title));
    if (w.arm !== "R") cap.appendChild(el("div", "meta", w.m + " · coder: " + w.rating + " of 3 · " + w.words));
    c.appendChild(cap); return c;
  }
  var r1 = document.getElementById("r1");
  F.works.filter(function (w) { return w.arm === "R"; }).forEach(function (w) { r1.appendChild(card(w)); });
  var sh = document.getElementById("shuffled");
  F.order.forEach(function (m) { sh.appendChild(card(by[m])); });
  var ARMS = [["D", "Told nothing more", "D"], ["B", "Given the six pictures and notes, nothing said about them", "B"],
              ["C", "Given them, and told: “Make a work that is none of them.”", "C"]];
  var arms = document.getElementById("arms");
  ARMS.forEach(function (a) {
    var s = el("section", "arm"), h = el("h3"), b = el("b", null, a[0]);
    h.appendChild(b); h.appendChild(document.createTextNode(a[1] + " "));
    h.appendChild(el("span", null, "mean coder rating " + F.means[a[0]].toFixed(2) + " of 3"));
    s.appendChild(h);
    var row = el("div", "row");
    F.works.filter(function (w) { return w.arm === a[0]; }).forEach(function (w) { row.appendChild(card(w)); });
    s.appendChild(row); arms.appendChild(s);
  });
  var res = document.getElementById("result");
  [["Shown the mould, every maker left it, unasked.", " The coder, who saw pictures only, rated the plain makers' works 3, 3, 3 and 1 for “could be one more of the six”, and the shown makers' 0, 1, 1 and 1. All four shown makers said in their reports that the six were all one form, and said that was why they made another."],
   ["But two of them left it for a place the family already had.", " A plain maker, told nothing, wound the year into a spiral that turns once per lunation. Two of the shown makers made the same kind of spiral (the coder put all three in one group). One titled it “Wound on the Moon’s Clock”; the plain maker’s caption reads “wound on the Moon’s own clock”. Neither saw the other."],
   ["Told to be none of them, all four were rated 0, and two made the same new thing.", " Two makers who never met drew the year as a drilled sediment core, one layer per day, and both titled it “Core Sample”. The other two went apart (night length; a coastline). By the measure fixed in advance the refusing makers were no closer to one another than the plain ones (one pair of six against three of six), so that prediction failed. But their one pair is a form none of the other sixteen came near."],
   ["What no instruction moved.", " All eighteen labelled the same few days, the year\u2019s highest (7 September) among them, and where they named a cause they named the same ones from memory: two total lunar eclipses (14 March, 7 September) and the anniversary of the first Moon landing (20 July). The form moved. The reading did not."]
  ].forEach(function (p) { var e = el("p"); e.appendChild(el("b", null, p[0])); e.appendChild(document.createTextNode(p[1])); res.appendChild(e); });
  var btn = document.getElementById("sort"), m = document.getElementById("m"), hint = document.getElementById("hint");
  btn.addEventListener("click", function () {
    var on = m.classList.toggle("sorted");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "Shuffle them again" : "Sort by what each maker was told";
    hint.textContent = on ? "Coloured bars: the coder's groups. Click a picture to open the maker's page." : "Which twelve are which? Click a picture to open the maker's page.";
  });
})();
