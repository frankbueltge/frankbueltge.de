// State 3, the check: every figure marked data-ck is read from data/check.js (build3.py), and two of section III's cards
// gain what the check found at their commits. No library.
(function () {
  'use strict';
  var C = window.CHECK;
  if (!C) return;
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function get(path) {
    // keys may hold a dot of their own ("actor.stand-in"), so the longest key that matches is taken first
    var o = C, parts = path.split('.');
    for (var i = 0; i < parts.length && o != null; i++) {
      var hit = false;
      for (var j = parts.length; j > i; j--) {
        var k = parts.slice(i, j).join('.');
        if (Object.prototype.hasOwnProperty.call(o, k)) { o = o[k]; i = j - 1; hit = true; break; }
      }
      if (!hit) return null;
    }
    return o;
  }
  document.querySelectorAll('[data-ck]').forEach(function (e) {
    var v = get(e.getAttribute('data-ck'));
    if (v == null) return;
    e.textContent = typeof v === 'number' ? (Number.isInteger(v) ? fmt(v) : String(v)) : v;
  });

  function h(t, a, txt) { var e = document.createElement(t); if (a) for (var k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; }
  function link(hash, label) { return h('a', { href: 'https://github.com/frankbueltge/ulysses/commit/' + hash }, label || hash); }
  function add(id, nodes) {
    var card = document.getElementById(id);
    if (!card) return;
    var dl = card.querySelector('dl'), verdict = dl.querySelector('dd.verdict');
    var dt = h('dt', { class: 'ck' }, 'The check, 21 November'), dd = h('dd', { class: 'ck' });
    nodes.forEach(function (n) { dd.appendChild(typeof n === 'string' ? document.createTextNode(n) : n); });
    dl.insertBefore(dt, verdict.previousElementSibling);
    dl.insertBefore(dd, verdict.previousElementSibling);
  }
  var A = C.authority;
  if (A) {
    var r169 = A.lane.filter(function (x) { return x.row === 169; })[0], r138 = A.lane.filter(function (x) { return x.row === 138; })[0];
    add('d1', [
      'The Field\'s check of 20 November codes this deed as one of the house\'s ' + A.n + ' acts of authority: "' + r169.relation + '" its instructions, seen first by ' + r169.seer + '. At its commits the authority half holds: v5 is signed by this practice and captioned "' + A.v5_caption.replace(/^.*?\(/, '').replace(/\)$/, '') + '". The substance does not: v4, committed on ' + A.v4_date + ' in the name of ' + A.v4_author + ' (', link('14b4bb0'),
      '), already held publication beyond delegation. What v5 added was a file only the architect could sign, and the word inviolable. The other act of authority in this practice\'s lane, of ' + r138.date + ', is the only one of the six whose first seer is ' + r138.seer + ': the commit that did it says in its own message that the session "breaches the one-in-four floor" (', link('b9c5899'), ').'
    ]);
  }
  add('d2', [
    'Read with Nisbett and Wilson, after the critique: the decision log called the three ticks "three consecutive nights", a report drawn from what a nightly routine should do rather than from the commit times, which put all three in one afternoon. That is their mechanism, a plausible theory of the cause standing in for an observation of it, and here a stranger can check it against the timestamps; a session reporting on itself could not have done better from memory, because it has none.'
  ]);
  document.documentElement.setAttribute('data-check', '1');
})();
