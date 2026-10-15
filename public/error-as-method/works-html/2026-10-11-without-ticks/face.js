// face.js -- three lenses on 9 September 2009, the twelve works by preparation, and the ledger of what was named.
(function () {
  var F = window.FACE;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  var snip = document.getElementById('snip'), parts = F.snip.split(F.hitRow);
  snip.appendChild(document.createTextNode(parts[0])); snip.appendChild(el('mark', null, F.hitRow)); snip.appendChild(document.createTextNode(parts[1]));
  document.getElementById('lensT').textContent = F.hitRow;
  function lens(id, src, w, h, p, span) {      // span: source pixels shown across the lens
    var e = document.getElementById(id);
    function fit() { var W = e.clientWidth, s = W / span; e.style.backgroundImage = 'url(' + src + ')';
      e.style.backgroundSize = (w * s) + 'px ' + (h * s) + 'px';
      e.style.backgroundPosition = (W / 2 - p.x * s) + 'px ' + (e.clientHeight / 2 - p.y * s) + 'px'; }
    fit(); window.addEventListener('resize', fit);
  }
  lens('lensI', 'materials/births.png', 1100, 500, F.lens.png, 160);
  lens('lensL', 'materials/births.jpg', 480, 220, F.lens.jpg, 70);
  var NAMES = { T: 'the table', I: 'the picture with axes', L: 'the lossy picture' }, box = document.getElementById('works'), cards = {};
  ['T', 'I', 'L'].forEach(function (a) {
    var h = el('h3', 'arm k-' + a, a + ': given ' + NAMES[a]); box.appendChild(h);
    var g = el('div', 'grid'); box.appendChild(g);
    F.works.filter(function (w) { return w.arm === a; }).forEach(function (w) {
      var c = el('div', 'w'), l = el('a'); l.href = 'makers/' + w.id + '/index.html'; l.target = '_blank'; l.rel = 'noopener';
      var i = el('img'); i.src = 'thumbs/' + w.id + '.png'; i.alt = 'Screenshot of ' + w.title; i.loading = 'lazy'; l.appendChild(i); c.appendChild(l);
      var b = el('div', 'b'); b.appendChild(el('div', 't', w.title)); b.appendChild(el('span', 'chip', w.id));
      b.appendChild(el('span', 'chip', w.unit)); b.appendChild(el('span', 'chip', w.form.toLowerCase())); c.appendChild(b); g.appendChild(c); cards[w.id] = c;
    });
  });
  var t = document.getElementById('ledger'), thead = el('thead'), hr = el('tr'); hr.appendChild(el('th'));
  F.works.forEach(function (w, i) { var th = el('th', 'k-' + w.arm + (i % 4 === 0 ? ' gap' : ''), w.arm + ' ' + w.id.slice(1)); th.title = w.title; hr.appendChild(th); });
  thead.appendChild(hr); t.appendChild(thead); var tb = el('tbody'); t.appendChild(tb); var on = null;
  F.named.forEach(function (k) {
    var tr = el('tr'), th = el('th', 'row', k); tr.appendChild(th);
    F.works.forEach(function (w, i) { tr.appendChild(el('td', (w.named[k] ? 'y' : 'n') + (i % 4 === 0 ? ' gap' : ''))); });
    th.addEventListener('click', function () {
      if (on) on.classList.remove('on'); if (on === tr) { on = null; F.works.forEach(function (w) { cards[w.id].classList.remove('dim'); }); return; }
      on = tr; tr.classList.add('on'); F.works.forEach(function (w) { cards[w.id].classList.toggle('dim', !w.named[k]); });
    });
    tb.appendChild(tr);
  });
})();
