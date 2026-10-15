// face.js -- draws one row per maker from window.ROWS (face-data.js, built by build.py).
(function () {
  var ARMS = [['R', 'Eye required', 'told: render your work at least once before you finish'],
              ['O', 'Eye offered', 'told: use it as often or as little as you like'],
              ['N', 'No eye', 'no viewer; the brief of experiment 12']];
  var root = document.getElementById('rows'), box = document.getElementById('box');
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function shot(r, src, full, cap, isFinal) {
    var c = el('div', 'cell'), b = el('button', 'shot' + (isFinal ? ' final' : ''));
    b.type = 'button'; var i = new Image(); i.src = src; i.alt = r.title + ', ' + cap; i.loading = 'lazy';
    b.appendChild(i); b.addEventListener('click', function () {
      box.querySelector('img').src = full; box.querySelector('p').textContent = r.m + ' · ' + r.title + ' · ' + cap; box.classList.add('on');
    });
    c.appendChild(b); c.appendChild(el('div', 'cap', cap)); return c;
  }
  box.addEventListener('click', function () { box.classList.remove('on'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.classList.remove('on'); });
  ARMS.forEach(function (a) {
    var sec = el('section', 'arm'); sec.appendChild(el('h2', null, a[1]));
    sec.appendChild(el('div', 'small', a[2]));
    window.ROWS.filter(function (r) { return r.arm === a[0]; }).forEach(function (r) {
      var row = el('div', 'row'), who = el('div', 'who');
      who.appendChild(el('b', null, '“' + r.title + '”'));
      who.appendChild(el('div', 'small', r.m + (r.looks ? ' · ' + r.looks + (r.looks === 1 ? ' look' : ' looks') : ' · no look recorded')));
      row.appendChild(who);
      var right = el('div'), strip = el('div', 'strip');
      if (r.looks) {
        for (var k = 1; k <= r.looks; k++) {
          var n = (k < 10 ? '0' : '') + k;
          strip.appendChild(shot(r, 'thumbs/' + r.m + '-' + n + '.jpg', 'makers/' + r.m + '/renders/' + n + '.png', 'look ' + k, false));
          var ch = r.changed[k - 1], j = el('div', 'join ' + (ch ? 'ch' : 'st'));
          j.appendChild(el('i')); j.appendChild(document.createTextNode(ch ? 'changed' : 'stop'));
          strip.appendChild(j);
        }
      } else {
        var v = el('div', 'cell'), vv = el('div', 'void', r.code === 'PICTURE' ? 'looked once by its own means; no copy kept' : 'never saw a picture; checked by numbers');
        v.appendChild(vv); v.appendChild(el('div', 'cap', 'no viewer')); strip.appendChild(v);
        var j2 = el('div', 'join'); j2.appendChild(document.createTextNode('→')); strip.appendChild(j2);
      }
      strip.appendChild(shot(r, 'thumbs/' + r.m + '-final.jpg', 'shots/' + r.m + '.png', 'handed in', true));
      right.appendChild(strip);
      right.appendChild(el('p', 'quote', '“' + r.quote + '”'));
      var d = el('div', 'def'), s = el('b', null, r.defects.length + (r.defects.length === 1 ? ' defect' : ' defects'));
      d.appendChild(s); d.appendChild(document.createTextNode(' the blind coder saw in the final' + (r.defects.length ? ': ' + r.defects.join('; ') : '')));
      right.appendChild(d);
      if (r.same !== null) {
        var f = el('div', 'def', 'First look to final, blind coder: ' + ['another work', 'same idea, form changed', 'same work, finish changed', 'the same work'][r.same] +
          (r.form.length ? ' (form: ' + r.form.join('; ') + ')' : ''));
        right.appendChild(f);
      }
      row.appendChild(right); sec.appendChild(row);
    });
    root.appendChild(sec);
  });
})();
