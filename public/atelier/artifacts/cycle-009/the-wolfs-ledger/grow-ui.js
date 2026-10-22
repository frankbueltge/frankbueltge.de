// Section 7, how the work grew (2026-10-22, fourth session): one column per state in PROCESS.json, as tall as the page was.
(function () {
  const S = window.PROCESS, g = document.getElementById('grow'), x = document.getElementById('growx');
  const max = Math.max(...S.map(s => s.height)), fmt = n => n.toLocaleString('en-US');
  const read = document.getElementById('grow-read'), img = document.getElementById('grow-img'), full = document.getElementById('grow-full');
  const view = document.getElementById('grow-view'); let cur = S.length - 1;
  S.forEach((s, i) => {
    const b = document.createElement('button'); b.style.height = (100 * s.height / max) + '%';
    b.setAttribute('aria-label', `State ${s.n}, ${s.date}`); b.innerHTML = `<span>${s.n}</span>`; b.onclick = () => show(i); g.appendChild(b);
    const l = document.createElement('span'); l.textContent = s.date.slice(5); x.appendChild(l);
  });
  function show(i) {
    cur = i; const s = S[i];
    [...g.children].forEach((b, j) => b.setAttribute('aria-pressed', j === i));
    const was = i ? ` It grew by ${fmt(s.height - S[i - 1].height)} px from state ${i}.` : '';
    read.innerHTML = `<b>State ${s.n}, ${s.date}</b> · ${s.session}${s.commit ? ' · commit ' + s.commit : ''}<br>${s.changed}<br>` +
      `<span class="note">The page was ${fmt(s.height)} px long at 1100 px wide.${was}</span>`;
    img.src = s.shot; img.alt = `The Wolf's Ledger as it stood at state ${s.n}, ${s.date}`; full.href = s.shot; view.scrollTop = 0;
    window.__grow = { n: s.n, height: s.height, src: s.shot };
  }
  document.getElementById('grow-prev').onclick = () => show(Math.max(0, cur - 1));
  document.getElementById('grow-next').onclick = () => show(Math.min(S.length - 1, cur + 1));
  show(cur);
})();
