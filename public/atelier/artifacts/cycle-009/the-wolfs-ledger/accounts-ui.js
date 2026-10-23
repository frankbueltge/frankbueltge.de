// Coda IV, corrected (2026-10-23): the office's two accounts, and two more records; choosing one moves coda IV's count.
(() => {
  const $ = id => document.getElementById(id), A = window.ACCOUNTS, S = window.SURVEY;
  const st = { k: 'storm_data' };
  const tag = a => a.official === true ? 'the office calls this its official report' : a.official === false ? 'links the official report' : 'a national record';
  $('ac-cards').innerHTML = A.accounts.map(a => `<button class="card" data-k="${a.key}" aria-pressed="false" style="border-left-color:var(${a.D3 === 1 ? '--accent' : '--calm'})">` +
    `<b>McLoud ${a.D3} injured</b>, Stillwater ${a.B4}<span class="d">${a.name}</span><span class="d">${tag(a)}${a.sentence ? '; a sentence names the one injured' : a.sentence === false ? '; no sentence of anyone hurt' : ''}</span></button>`).join('');
  function pick(k) {
    st.k = k; const a = A.accounts.find(x => x.key === k), s = S.sweep[a.D3];
    document.querySelectorAll('#ac-cards .card').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.k === k)));
    const k32 = $('sv-k'); k32.value = a.D3; k32.dispatchEvent(new Event('input'));
    $('ac-read').innerHTML = `<b>${a.name}: McLoud ${a.D3} injured.</b> ` + (a.official ? 'This is the account the office’s own page calls official. ' : a.official === false ? 'This page defers, in its own words, to the report beside it. ' : '') +
      `On it the Field's model reads ${s.irr.toFixed(3)} (${s.lo.toFixed(3)}–${s.hi.toFixed(3)}), and a longer record would rule out ${s.first_of_two === 'habit' ? 'the village of habit first, the order coda I read' : 'the village that learns first, the order reversed'}. The interval figure above now shows this count.` +
      (a.day_ok ? ` Its day in Oklahoma: ${a.day_ok} injured.` : '');
  }
  document.querySelectorAll('#ac-cards .card').forEach(c => c.onclick = () => pick(c.dataset.k));
  const sd = A.accounts.find(x => x.key === 'storm_data'), sp = A.accounts.find(x => x.key === 'spc');
  for (const [id, v] of Object.entries({ 'ac-printed': A.sources.storm_data.printed.replace(/(\d\d)\/(\d\d)\/(\d{4})/, '$3-$1-$2'), 'ac-sd3': sd.D3, 'ac-spc3': sp.D3, 'ac-sdb4': sd.B4 })) $(id).textContent = v;
  window.__accounts = () => ({ k: st.k, n: +$('sv-k').value, read: $('ac-read').innerText });
  // open on the official account without moving coda IV's slider (it already shows 32)
  document.querySelector('#ac-cards .card[data-k="storm_data"]').setAttribute('aria-pressed', 'true');
  $('ac-read').innerHTML = '<b>Choose an account.</b> The official report is marked: its 32 is what coda IV’s figure shows now.';
})();
