// Until Another Hand, state 3: the check, written into the work where a visitor meets it. Every figure is read from
// data/check.js (check.py), data/programme.js (programme.py), data/window.js and data/clocks.js; none is typed in.
(function () {
  'use strict';
  var K = window.CHECK, KS = K.signer, KR = K.reverts, FQ = K.field_question, P = window.PROG, S = P.summary,
    W = window.WINDOW, C = window.CLOCKS;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function link(repo, c) { return '<a href="https://github.com/frankbueltge/' + repo + '/commit/' + c + '">' + repo + ' ' + c.slice(0, 7) + '</a>'; }
  var TAG = { held: '<span class="tag">held</span>', corrected: '<span class="tag corr">corrected</span>', withdrawn: '<span class="tag wd">withdrawn</span>', answered: '<span class="tag">answered</span>' };
  var site = KR.list.filter(function (a) { return a.repo === 'frankbueltge.de'; });
  var said = KR.list.filter(function (a) { return a.subject_says; })[0];
  var law = C.clocks.filter(function (c) { return c.binding === 'law'; }), vol = C.clocks.filter(function (c) { return c.binding !== 'law'; });
  var lawAw = law.filter(function (c) { return c.clock === 'awareness'; }).length;
  var lawNone = law.filter(function (c) { return c.clock === 'none'; });
  var FC = FQ.classes, fqAt = FC['a later write over the deed’s lines, which closed the window'] + FC['the mending, which closed the window'];
  var fqBefore = FC['the window closed first, at a commit that rewrote none of the deed’s lines'] + FC['the mending, after it'];
  var A = P.cases.filter(function (c) { return c.id === 'A'; })[0];
  var widened = A.today.filter(function (p) { return /cycle-014|whose-gate/.test(p.path) && !p.marked; }).length;
  var L = P.excluded.filter(function (e) { return /case L of state 2/.test(e.what); }).length;
  var studio = S.addressed.filter(function (a) { return a.who === 'studio'; })[0], field = S.addressed.filter(function (a) { return a.who === 'field'; })[0];
  var items = [
    [TAG.withdrawn, '<b>“Another hand.”</b> Of the ' + KS.by_a_later_commit + ' windows that a later commit closed, ' + KS.same_signer +
      ' closed under one of the deed’s own Git names and addresses, ' + KS.same_architect + ' of them the architect’s, and ' + KS.same_within_1h +
      ' within the hour; ' + KS.other_signer + ' under another name. Under the architect’s name sign both he and the sessions working for him, so Git cannot say whether a second hand or the same one came back. The window runs until the next deed on the deed’s lines, whoever made it; the sections below say so, and the title stays as the question the record cannot answer.'],
    [TAG.corrected, '<b>“The house never reverted anything.”</b> Git’s sentence <span class="mono">This reverts commit</span> stands ' + KR.sentence + ' times in ' +
      KR.house_commits.toLocaleString('en') + ' commits, as stated. But ' + KR.acts + ' commits undo an earlier one exactly, path by path, without it: ' +
      (KR.acts - site.length) + ' in the nightly line’s repository, a landing workflow’s feedback note written and taken out again, and ' + site.length + ' in the site’s, among them ' +
      link(said.repo, said.undo) + ', whose subject says “revert” and names no commit. None undoes a deed of the log.'],
    [TAG.corrected, '<b>“The house’s only dated record of knowing.”</b> The log is a decision log: it writes a deed down when the answer is decided, so its day falls at the mending by its genre, and the mending’s commit is itself a dated record. The figure stands; the tile now names what the log is.'],
    [TAG.corrected, '<b>“The clocks the law sets.”</b> Of the ' + C.clocks.length + ' clocks, ' + law.length + ' are set by law and ' + vol.length + ' by voluntary codes; of the ' + law.length +
      ' in law, ' + lawAw + ' run from the reporter’s knowing and ' + lawNone.length + ' (' + lawNone.map(function (c) { return esc(c.instrument); }).join(', ') + ') names no start. The Field’s blind second coding of 23 November kept all seven clock codes.'],
    [TAG.corrected, '<b>Section IV, its cases.</b> One case withdrawn under the method’s own record rule (' + L + ': its only page before the correction was this practice’s critique quoting it as refuted), leaving ' + S.cases +
      ', ' + S.late + ' of them late. The key of the step-1 rise widened to “334 times”: the Studio’s step-2 work and its presentation state it so on ' + widened +
      ' pages, unmarked, and the programme’s state noted this on 15 November without addressing it to anyone.'],
    [TAG.corrected, '<b>Section IV, today.</b> Re-read on ' + P.built + '. The Studio marked its step-1 pages on ' + studio.iso.slice(0, 10) + ' (' + link(studio.repo, studio.commit) + ') and the Field its summary and paper on ' +
      field.iso.slice(0, 10) + ' (' + link(field.repo, field.commit) + '), each on this practice’s offer of 22 November. Pages still asserting a corrected claim: ' + S.pages_asserting_today + ', all of the one case the state noted and addressed to no one. The medians of state 2 are dropped: the finding is one of place, not of hours.'],
    [TAG.held, '<b>The window itself.</b> The Field re-measured it on its ' + FQ.pairs + ' deeds with a real <span class="mono">git revert</span> and agreed on ' + FQ.check92.remeasured_agree + ' of ' + FQ.check92.remeasured + '; without this work’s exclusion of the log’s own file, ' + FQ.check92.no_exclusion_earlier + ' of them would close earlier (its check 92, ' + link('field-research', FQ.check92.at) + '). The Waghmare and Sufi “merge-state exception” the critique asked after concerns a soft reset, not the revert used here (section V).'],
    [TAG.answered, '<b>The Field’s question</b>, whether the window is a clock of reading: by commit the earliest later trace is the closing commit in ' + fqAt + ' of ' + FQ.pairs + ', not the ' + FQ.field_hours_at + ' its hours gave, and before ' + fqBefore +
      ' more the window had closed without any of the deed’s lines rewritten; the Field’s own check reads the same. It clocks the first write over a deed, not the first sight of it (section II).'],
  ];
  document.getElementById('checklist').innerHTML = items.map(function (it) { return '<li>' + it[0] + it[1] + '</li>'; }).join('');
})();
