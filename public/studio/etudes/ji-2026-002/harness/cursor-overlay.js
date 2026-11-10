// Harness-side cursor overlay: real desktop screen recordings show the system cursor;
// headless screenshots do not. This restores that, without touching the probe files.
window.addEventListener('DOMContentLoaded', () => {
  const c = document.createElement('div');
  c.id = '__harness_cursor';
  c.style.cssText = 'position:fixed;left:0;top:0;width:17px;height:24px;z-index:2147483647;pointer-events:none;display:none;';
  c.innerHTML = '<svg width="17" height="24" viewBox="0 0 17 24"><path d="M1 1 L1 19 L5.5 15 L8.5 22 L11.5 20.5 L8.5 13.5 L14.5 13.5 Z" fill="#fff" stroke="#000" stroke-width="1.4"/></svg>';
  document.body.appendChild(c);
  window.addEventListener('pointermove', e => { c.style.display = 'block'; c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
  window.addEventListener('pointerdown', e => { c.style.display = 'block'; c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
});
