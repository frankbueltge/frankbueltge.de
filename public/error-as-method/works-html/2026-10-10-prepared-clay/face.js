// face.js -- the visitor guesses each maker's preparation before the reveal. Data from face-data.js (window.FACE).
(function () {
  var F = window.FACE, grid = document.getElementById('grid'), score = document.getElementById('score');
  var NAMES = { T: 'a table', P: 'sentences', I: 'a picture' };
  document.getElementById('snipT').textContent = F.snip.T;
  document.getElementById('snipP').textContent = F.snip.P;
  var guesses = {};
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function update() {
    var n = 0, hit = 0;
    F.works.forEach(function (w) { if (guesses[w.id]) { n++; if (guesses[w.id] === w.arm) hit++; } });
    score.textContent = n + ' of 12 guessed' + (n ? ', ' + hit + ' right (chance is 4 in 12). The coder, blind like you, got ' + F.coderHits + '.' : '.');
    if (n === 12) document.getElementById('after').style.display = 'block';
  }
  F.works.forEach(function (w) {
    var card = el('div', 'w'); card.id = 'w-' + w.id;
    var a = el('a', 'shot'); a.href = 'makers/' + w.id + '/index.html'; a.target = '_blank'; a.rel = 'noopener';
    var img = el('img'); img.src = 'thumbs/' + w.id + '.png'; img.alt = 'Screenshot of one maker’s work'; img.loading = 'lazy';
    a.appendChild(img); card.appendChild(a);
    var body = el('div', 'body'); var ask = el('div', 'ask'); ask.appendChild(el('span', null, 'Given:'));
    ['T', 'P', 'I'].forEach(function (k) {
      var b = el('button', 'k-' + k, k); b.type = 'button'; b.title = NAMES[k];
      b.addEventListener('click', function () {
        if (guesses[w.id]) return; guesses[w.id] = k; b.classList.add('mine'); card.classList.add('done');
        var v = card.querySelector('.verdict'); v.className = 'verdict ' + (k === w.arm ? 'hit' : 'miss');
        v.textContent = (k === w.arm ? 'Right: ' : 'No: ') + 'this maker got ' + NAMES[w.arm] + '.'; update();
      });
      ask.appendChild(b);
    });
    body.appendChild(ask);
    var rv = el('div', 'reveal');
    rv.appendChild(el('div', 'verdict'));
    var t = el('div'); t.appendChild(el('span', 'title', w.title)); t.appendChild(document.createTextNode(' · ' + w.id)); rv.appendChild(t);
    rv.appendChild(el('div', null, 'Coder guessed ' + NAMES[w.coder.guess] + ' (' + w.coder.conf + '/3): ' + w.coder.why));
    rv.appendChild(el('div', null, 'Carried into the page: ' + w.carried));
    rv.appendChild(el('div', 'note', w.note));
    body.appendChild(rv); card.appendChild(body); grid.appendChild(card);
  });
  document.getElementById('all').addEventListener('click', function () {
    F.works.forEach(function (w) { var c = document.getElementById('w-' + w.id); c.classList.add('done');
      var v = c.querySelector('.verdict'); if (!guesses[w.id]) { v.className = 'verdict'; v.textContent = 'This maker got ' + NAMES[w.arm] + '.'; } });
    document.getElementById('after').style.display = 'block';
  });
  document.getElementById('reset').addEventListener('click', function () { location.reload(); });
  var after = document.getElementById('after'); after.style.display = 'none';
  after.innerHTML = F.afterHTML;
  update();
})();
