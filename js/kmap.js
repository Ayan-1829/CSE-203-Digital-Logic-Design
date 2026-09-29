/* ===================== kmap.js : K-map component ===================== */
const KVARS = ['A', 'B', 'C', 'D'];
const GCOL = ['#1E3A5F', '#E08A00', '#5B8FD0', '#A64B00', '#6B7C93', '#9CBCE6'];
function kLayout(n) {
  if (n === 2) return { rb: 1, cb: 1, rg: [0, 1], cg: [0, 1], rv: ['A'], cv: ['B'] };
  if (n === 3) return { rb: 1, cb: 2, rg: [0, 1], cg: [0, 1, 3, 2], rv: ['A'], cv: ['B', 'C'] };
  return { rb: 2, cb: 2, rg: [0, 1, 3, 2], cg: [0, 1, 3, 2], rv: ['A', 'B'], cv: ['C', 'D'] };
}
const kMin = (L, ri, ci) => (L.rg[ri] << L.cb) | L.cg[ci];
const K_EXAMPLES = [
  { label: 'Course example (4 variables, don\u2019t cares)', n: 4, ones: [1, 3, 7, 11, 15], dcs: [0, 2, 5] },
  { label: 'XOR pattern (3 variables)', n: 3, ones: [2, 3, 4, 5], dcs: [] },
  { label: 'Two equal solutions (3 variables)', n: 3, ones: [0, 1, 2, 5, 6, 7], dcs: [] },
  { label: 'Wrap-around (4 variables)', n: 4, ones: [0, 1, 2, 4, 5, 6, 8, 9, 12, 13, 14], dcs: [] }
];

function mountKMap(root, opts = {}) {
  const st = { n: opts.n || 4, mode: 'sop', view: 'cover', step: 0, cells: null, env: { A: 0, B: 0, C: 0, D: 0 }, msg: '' };
  st.cells = Array(1 << st.n).fill(0);
  const box = h('div');
  root.append(box);
  let focusM = null;

  function setCells(n, ones, dcs) {
    st.n = n; st.cells = Array(1 << n).fill(0);
    ones.forEach((m) => { st.cells[m] = 1; }); (dcs || []).forEach((m) => { st.cells[m] = 2; });
    st.step = 0; st.msg = ''; render();
  }
  function fromText(txt) {
    txt = txt.trim();
    if (!txt) { st.msg = 'Type minterms such as Σm(1,3,7) + d(0,2), maxterms such as ΠM(0,2,4) + d(5), or an expression such as AB + A\'C.'; render(); return; }
    try {
      if (/[ΣσΠπ]|[mM]\s*\(|d\s*\(|^[\d,\s]+$/.test(txt)) {
        const nums = (s) => (s.match(/\d+/g) || []).map(Number);
        const dm = txt.match(/d\s*\(([^)]*)\)/i);
        const mm = txt.match(/(?:^|[^A-Za-z])m\s*\(([^)]*)\)/); // lowercase m( ) = minterms (SOP)
        const MM = txt.match(/(?:^|[^A-Za-z])M\s*\(([^)]*)\)/); // uppercase M( ) = maxterms (POS)
        const dcs = dm ? nums(dm[1]) : [];
        let ones;
        if (MM) {
          const zeros = nums(MM[1]);
          const mx = Math.max(0, ...zeros, ...dcs);
          const n = Math.max(2, Math.min(4, mx < 4 ? 2 : mx < 8 ? 3 : mx < 16 ? 4 : 5));
          if (n > 4) throw new Error('This lab handles up to 4 variables (maxterms 0 to 15).');
          ones = range(1 << n).filter((i) => !zeros.includes(i) && !dcs.includes(i));
          setCells(Math.max(n, st.n === 4 ? 4 : n), ones, dcs);
          return;
        }
        ones = mm ? nums(mm[1]) : nums(dm ? txt.replace(dm[0], '') : txt);
        const mx = Math.max(0, ...ones, ...dcs);
        const n = Math.max(2, Math.min(4, mx < 4 ? 2 : mx < 8 ? 3 : mx < 16 ? 4 : 5));
        if (n > 4) throw new Error('This lab handles up to 4 variables (minterms 0 to 15).');
        setCells(Math.max(n, st.n === 4 ? 4 : n), ones, dcs);
      } else {
        const ast = parseExpr(txt), vs = sortedVars(ast);
        const top = Math.max(...vs.map((v) => KVARS.indexOf(v)));
        if (vs.some((v) => KVARS.indexOf(v) < 0)) throw new Error('Use the variables A, B, C and D only.');
        const n = Math.max(2, top + 1);
        const t = tableOf(ast, KVARS.slice(0, n));
        setCells(n, range(1 << n).filter((i) => t[i] === 1), []);
      }
    } catch (e) { st.msg = e.message; render(); }
  }

  function render() {
    const { n } = st, L = kLayout(n), vars = KVARS.slice(0, n), N = 1 << n;
    const m = minimize(vars, st.cells), res = st.mode === 'sop' ? m.sop : m.pos;
    const target = st.mode === 'sop' ? 1 : 0;
    const tCells = st.mode === 'sop' ? m.ones : m.zeros;
    const cover = res.cover, ess = res.essential;
    let gsel;
    if (st.view === 'all') gsel = res.primes.slice();
    else if (st.view === 'steps') gsel = cover.slice(0, st.step);
    else gsel = cover.slice();
    const groups = gsel.map((p, i) => ({ p, color: GCOL[i % GCOL.length], essential: ess.includes(p), set: new Set(p.cells) }));
    const R = 1 << L.rb, C = 1 << L.cb;
    const cur = range(n).reduce((a, i) => a | (st.env[vars[i]] << (n - 1 - i)), 0);
    const termStr = (p) => (st.mode === 'sop' ? termSOP(p, vars) : termPOS(p, vars));

    // ----- controls
    const nSeg = seg([2, 3, 4].map((k) => ({ v: k, l: k + ' variables' })), n, (k) => { st.n = k; st.cells = Array(1 << k).fill(0); st.step = 0; st.msg = ''; render(); });
    const modeSeg = seg([{ v: 'sop', l: 'Group 1s (SOP)' }, { v: 'pos', l: 'Group 0s (POS)' }], st.mode, (v) => { st.mode = v; st.step = 0; render(); });
    const viewSeg = seg([{ v: 'cover', l: 'Minimal cover' }, { v: 'all', l: 'All prime implicants' }, { v: 'steps', l: 'Step by step' }], st.view, (v) => { st.view = v; st.step = 0; render(); });
    const inp = h('input', { type: 'text', size: 26, placeholder: "Σm(1,3,7,11,15) + d(0,2,5)   or   AB + A'C", 'aria-label': 'Fill map from minterms or expression', onkeydown: (e) => { if (e.key === 'Enter') fromText(inp.value); } });
    const exSel = h('select', { 'aria-label': 'Example functions', onchange: (e) => { const ex = K_EXAMPLES[+e.target.value]; if (ex) setCells(ex.n, ex.ones, ex.dcs); } },
      h('option', { value: '' }, 'Load an example'), K_EXAMPLES.map((ex, i) => h('option', { value: i }, ex.label)));
    const controls = h('div', null,
      h('div', { class: 'row', style: { marginBottom: '8px' } }, nSeg.el, modeSeg.el, viewSeg.el),
      h('div', { class: 'row tight', style: { marginBottom: '10px', alignItems: 'flex-end' } }, exprField('Minterms or expression', inp, { canonical: true }), h('button', { type: 'button', class: 'btn sm pri', onclick: () => fromText(inp.value) }, 'Fill map'), exSel,
        h('button', { type: 'button', class: 'btn sm', onclick: () => { st.cells = Array(N).fill(0); st.step = 0; st.msg = ''; render(); } }, 'Clear map')),
      st.msg ? h('p', { class: 'bad small', role: 'alert' }, st.msg) : null);

    // ----- map
    const grid = h('div', { class: 'kmap', role: 'grid', 'aria-label': n + ' variable Karnaugh map', style: { gridTemplateColumns: `auto repeat(${C}, auto)` } });
    grid.append(h('div', { class: 'kcorner' }, L.rv.join('') + ' \\ ' + L.cv.join('')));
    for (let ci = 0; ci < C; ci++) grid.append(h('div', { class: 'kh' }, bin(L.cg[ci], L.cb)));
    for (let ri = 0; ri < R; ri++) {
      grid.append(h('div', { class: 'kh' }, bin(L.rg[ri], L.rb)));
      for (let ci = 0; ci < C; ci++) {
        const mi = kMin(L, ri, ci), v = st.cells[mi];
        const b = h('button', { type: 'button', class: 'kcell' + (v === 1 ? ' v1' : v === 2 ? ' vx' : '') + (mi === cur && st.showCur ? ' cur' : ''), 'data-m': mi,
          'aria-label': `Cell m${mi}, value ${v === 2 ? 'don\u2019t care' : v}. Click to change.`,
          onclick: () => { st.cells[mi] = (st.cells[mi] + 1) % 3; st.step = 0; focusM = mi; render(); } }, h('small', null, 'm' + mi), v === 2 ? 'X' : String(v));
        groups.forEach((g, gi) => {
          if (!g.set.has(mi)) return;
          const nb = [ri > 0 ? kMin(L, ri - 1, ci) : null, ci < C - 1 ? kMin(L, ri, ci + 1) : null, ri < R - 1 ? kMin(L, ri + 1, ci) : null, ci > 0 ? kMin(L, ri, ci - 1) : null];
          const out = nb.map((x) => x === null || !g.set.has(x)); // top,right,bottom,left
          const off = 3 * gi + 1;
          b.append(h('i', { style: {
            position: 'absolute', pointerEvents: 'none', borderStyle: 'solid', borderColor: g.color,
            top: (out[0] ? off : 0) + 'px', right: (out[1] ? off : 0) + 'px', bottom: (out[2] ? off : 0) + 'px', left: (out[3] ? off : 0) + 'px',
            borderWidth: `${out[0] ? 3 : 0}px ${out[1] ? 3 : 0}px ${out[2] ? 3 : 0}px ${out[3] ? 3 : 0}px`
          } }));
        });
        grid.append(b);
      }
    }

    // ----- results
    const exprNode = () => {
      if (res.expr === '0' || res.expr === '1') return res.expr;
      const parts = res.cover.map((p) => {
        const gi = groups.findIndex((g) => g.p === p);
        return h('span', { style: { color: gi >= 0 ? groups[gi].color : 'inherit' } }, termStr(p));
      });
      const out = [];
      parts.forEach((s, i) => { if (i && st.mode === 'sop') out.push(' + '); out.push(s); });
      return out;
    };
    const legend = h('ul', { class: 'klegend' });
    groups.forEach((g) => legend.append(h('li', null, h('span', { class: 'sw', style: { background: g.color } }), h('span', { class: 'tm' }, termStr(g.p)),
      h('span', { class: 'muted small' }, (st.mode === 'sop' ? 'cells ' : 'cells ') + g.p.cells.join(', ')), h('span', { class: 'tg' }, g.essential ? 'essential' : (st.view === 'all' ? 'not essential' : 'covers the rest')))));
    if (!groups.length && tCells.length) legend.append(h('li', null, h('span', { class: 'muted' }, st.view === 'steps' ? 'Press "Next step" to reveal the first group.' : 'No groups yet.')));
    if (!tCells.length) legend.append(h('li', null, h('span', { class: 'muted' }, st.mode === 'sop' ? 'Click cells to set them to 1 (twice for X, three times for 0).' : 'There are no 0 cells, so the function is always 1.')));

    // step text
    let stepBox = null;
    if (st.view === 'steps') {
      let txt = '';
      if (st.step === 0) txt = 'Start: every ' + target + ' must end up inside at least one group. Essential prime implicants come first.';
      else if (st.step <= cover.length) {
        const p = cover[st.step - 1];
        if (ess.includes(p)) { const only = tCells.find((c) => p.cells.includes(c) && res.primes.filter((q) => q.cells.includes(c)).length === 1); txt = `Group ${st.step} is essential: cell ${only} belongs to no other prime implicant, so ${termStr(p)} must be in the answer.`; }
        else txt = `Group ${st.step}: ${termStr(p)} is picked to cover the remaining ${target}s with as few extra groups as possible.`;
        if (st.step === cover.length) txt += ' Every ' + target + ' is now covered.';
      }
      stepBox = h('div', null, h('p', { class: 'note', style: { margin: '10px 0' } }, txt),
        h('div', { class: 'row tight' },
          h('button', { type: 'button', class: 'btn sm pri', disabled: st.step >= cover.length, onclick: () => { st.step++; render(); } }, 'Next step'),
          h('button', { type: 'button', class: 'btn sm', onclick: () => { st.step = cover.length; render(); } }, 'Show all groups'),
          h('button', { type: 'button', class: 'btn sm', onclick: () => { st.step = 0; render(); } }, 'Restart')));
    }
    const other = st.mode === 'sop' ? m.pos : m.sop;
    const side = h('div', null,
      h('h3', null, st.mode === 'sop' ? 'Simplified sum of products' : 'Simplified product of sums'),
      h('div', { class: 'eqbox' }, 'F = ', exprNode()),
      h('p', { class: 'small muted', style: { margin: '0 0 6px' } }, `${st.mode === 'sop' ? 'Minterms' : 'Maxterms'}: ${tCells.length ? (st.mode === 'sop' ? sigma(m.ones) : 'ΠM(' + m.zeros.join(', ') + ')') : 'none'}${m.dcs.length ? ' · don\u2019t cares: ' + m.dcs.join(', ') : ''}`),
      h('p', { class: 'small muted', style: { margin: '0 0 6px' } }, `Prime implicants: ${res.primes.length}, essential: ${ess.length}. ${st.mode === 'sop' ? 'Product-of-sums form' : 'Sum-of-products form'}: ${other.expr}`),
      stepBox, legend,
      LEGACY ? null : h('details', { class: 'reveal', style: { marginTop: '14px' } }, h('summary', null, 'Show the truth table'), h('div', { class: 'scrollx', style: { marginTop: '8px', maxHeight: '320px', overflowY: 'auto' } },
        tableEl(['m', ...vars, 'F'], range(N).map((i) => [i, ...vars.map((_, q) => (i >> (n - 1 - q)) & 1), st.cells[i] === 2 ? 'X' : st.cells[i]])))));

    const circBox = h('div', { style: { marginTop: '12px' } });
    if (st.showCirc) { try { createLab(circBox, { compact: true, locked: true, netlist: layoutExpr(parseExpr(res.expr)) }); } catch (e) { circBox.append(h('p', { class: 'bad' }, e.message)); } }
    // ----- test with switches
    let val = null; try { val = res.expr === '0' ? 0 : res.expr === '1' ? 1 : evalAst(parseExpr(res.expr), st.env); } catch (e) { val = null; }
    const cv = st.cells[cur];
    const outLed = led(val);
    const swRow = h('div', { class: 'row' }, vars.map((vn) => { const s = tsw(vn, st.env[vn], (x) => { st.env[vn] = x; st.showCur = true; render(); }); return s.el; }),
      h('span', { class: 'row tight' }, outLed.el, h('span', { class: 'mono' }, 'F = ' + (val === null ? '–' : val))),
      h('span', { class: 'small muted' }, `Input ${bin(cur, n)} is cell m${cur}, which holds ${cv === 2 ? 'X (don\u2019t care)' : cv}.`));
    const tester = h('div', { class: 'ktester' }, h('h4', null, 'Test the result with switches'),
      h('p', { class: 'small muted', style: { margin: '0 0 8px', maxWidth: '68ch' } }, 'Flip the input switches. The yellow outline shows which cell the inputs select, and the LED shows what the simplified expression outputs.'),
      swRow,
      h('div', { class: 'row', style: { marginTop: '12px' } }, h('button', { type: 'button', class: 'btn pri', onclick: () => { st.showCirc = !st.showCirc; render(); } }, st.showCirc ? 'Hide the circuit' : 'Show this as a circuit'),
        LEGACY ? h('button', { type: 'button', class: 'btn', onclick: () => { App.pendingLab = { expr: res.expr }; App.go('#/logic-lab'); } }, 'Build this circuit in Logic Lab') : null),
      circBox);

    clear(box);
    // the switch tester sits under the results in the right-hand column, so the map, the answer and
    // the tester all share one screen instead of stacking
    side.append(tester);
    box.append(controls, h('div', { class: 'kwrap' }, h('div', { class: 'scrollx' }, grid), side));
    if (focusM !== null) { const f = box.querySelector(`[data-m="${focusM}"]`); if (f && f.focus) f.focus(); focusM = null; }
  }
  render();
  return { render, setCells };
}
