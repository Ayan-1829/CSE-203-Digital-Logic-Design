/* ===================== steps.js : step-by-step builds and row explorers ===================== */
/* [data-steps] shows a figure or a derivation one step at a time. Inside it:
     data-at="k"    hidden before step k; class "shown" from step k on, "now" at step k
     data-on="k"    always visible; class "on" from step k on (wires light up and flow)
     data-x="k"     crossed out from step k on
     data-hl="k j"  class "hl" at the listed steps only
   Back / Next / Play / Show all buttons and "Step k of n" are added above it.
   [data-rows] is a truth table with an explanation per row: clicking a row (tr[data-r], or a button
   with data-r) shows the .rx-card with the same data-r, and Play walks through every row once.
   Without JavaScript everything stays visible. */
(function () {
  const nums = (el, a) => (el.getAttribute(a) || '').split(/\s+/).filter(Boolean).map(Number);
  const ATTRS = ['data-at', 'data-on', 'data-x', 'data-hl'];
  const PLAY = '▶ Play', PAUSE = '❚❚ Pause';

  function mountSteps(root) {
    const els = Array.from(root.querySelectorAll(ATTRS.map((a) => '[' + a + ']').join(',')));
    const n = Math.max(1, ...els.map((e) => Math.max(0, ...ATTRS.flatMap((a) => nums(e, a)))));
    let cur = 1, timer = 0;
    const back = h('button', { type: 'button', class: 'btn sm', onclick: () => { stop(); go(cur - 1); } }, '◀ Back');
    const next = h('button', { type: 'button', class: 'btn sm pri', onclick: () => { stop(); go(cur + 1); } }, 'Next ▶');
    const play = h('button', { type: 'button', class: 'btn sm', onclick: () => (timer ? stop() : start()) }, PLAY);
    const all = h('button', { type: 'button', class: 'btn sm', onclick: () => { stop(); go(n); } }, 'Show all');
    const count = h('span', { class: 'st-n', 'aria-live': 'polite' });
    root.prepend(h('div', { class: 'st-bar' }, back, next, play, all, count));
    root.classList.add('st-on');

    function go(k) {
      cur = Math.max(1, Math.min(n, k));
      els.forEach((e) => {
        const at = nums(e, 'data-at')[0], on = nums(e, 'data-on')[0], x = nums(e, 'data-x')[0];
        if (at) { e.classList.toggle('shown', cur >= at); e.classList.toggle('now', cur === at); }
        if (on) e.classList.toggle('on', cur >= on);
        if (x) e.classList.toggle('x', cur >= x);
        if (e.hasAttribute('data-hl')) e.classList.toggle('hl', nums(e, 'data-hl').includes(cur));
      });
      back.disabled = cur === 1; next.disabled = all.disabled = cur === n;
      count.textContent = 'Step ' + cur + ' of ' + n;
    }
    function start() {
      if (cur === n) go(1);
      play.textContent = PAUSE;
      timer = setInterval(() => { if (cur < n) go(cur + 1); if (cur === n) stop(); }, 1800);
    }
    function stop() { clearInterval(timer); timer = 0; play.textContent = PLAY; }
    go(1);
  }

  function mountRows(root) {
    const rows = Array.from(root.querySelectorAll('tr[data-r], button[data-r]'));
    const cards = Array.from(root.querySelectorAll('.rx-card[data-r]'));
    let timer = 0, cur = 0;
    const play = h('button', { type: 'button', class: 'btn sm', onclick: () => (timer ? stop() : start()) }, PLAY);
    const bar = root.querySelector('.st-bar');
    if (bar) bar.append(play);
    root.classList.add('js');

    function pick(i) {
      cur = i;
      rows.forEach((r, j) => { r.classList.toggle('on', j === i); r.setAttribute('aria-pressed', String(j === i)); });
      cards.forEach((c) => c.classList.toggle('on', c.getAttribute('data-r') === rows[i].getAttribute('data-r')));
    }
    rows.forEach((r, i) => {
      r.addEventListener('click', () => { stop(); pick(i); });
      if (r.tagName === 'BUTTON') return;
      r.tabIndex = 0; r.setAttribute('role', 'button');
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stop(); pick(i); } });
    });
    function start() {
      play.textContent = PAUSE;
      pick(0);
      timer = setInterval(() => { if (cur < rows.length - 1) pick(cur + 1); else stop(); }, 2400);
    }
    function stop() { clearInterval(timer); timer = 0; play.textContent = PLAY; }
    pick(+(root.getAttribute('data-rows') || 0));
  }

  document.querySelectorAll('[data-steps]').forEach(mountSteps);
  document.querySelectorAll('[data-rows]').forEach(mountRows);
})();
