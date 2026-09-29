const LEGACY = false;

/* ===================== core.js ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------- light/dark theme toggle, shared by every page ---------- */
(function () {
  const KEY = 'dld-theme';
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }
  function effective() {
    if (saved === 'dark' || saved === 'light') return saved;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  function apply() {
    if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
    else document.documentElement.removeAttribute('data-theme');
  }
  const SUN = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19"></path>';
  const MOON = '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"></path>';
  function paint(btn) {
    const dark = effective() === 'dark', label = btn.querySelector('span'), icon = btn.querySelector('.btn-ic');
    if (label) label.textContent = dark ? 'Light mode' : 'Dark mode'; else btn.textContent = dark ? 'Light mode' : 'Dark mode';
    if (icon) icon.innerHTML = dark ? SUN : MOON;
    btn.setAttribute('aria-pressed', String(dark));
  }
  apply();
  const btn = document.getElementById('btn-theme');
  if (btn) {
    paint(btn);
    btn.addEventListener('click', () => {
      saved = effective() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, saved); } catch (e) { /* storage unavailable */ }
      apply(); paint(btn);
    });
  }
})();

function mk(ns, tag, attrs, kids) {
  const e = ns ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'html') e.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') { for (const p in v) { if (p.slice(0, 2) === '--') e.style.setProperty(p, v[p]); else e.style[p] = v[p]; } }
    else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else e.setAttribute(k, v);
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return e;
}
const h = (tag, attrs, ...kids) => mk(false, tag, attrs, kids);
const sv = (tag, attrs, ...kids) => mk(true, tag, attrs, kids);
const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };

const App = {
  cleanups: [], pendingLab: null,
  onCleanup(fn) { this.cleanups.push(fn); },
  runCleanups() { while (this.cleanups.length) { try { this.cleanups.pop()(); } catch (e) { /* ignore */ } } },
  timer(fn, ms) { const id = setInterval(fn, ms); this.onCleanup(() => clearInterval(id)); return id; },
  go(hash) { location.hash = hash; }
};

/* ---------- storage (localStorage guarded by try/catch) ---------- */
const Store = (() => {
  const KEY = 'dld-slides-v1';
  let mem = {};
  try { const raw = localStorage.getItem(KEY); if (raw) mem = JSON.parse(raw) || {}; } catch (e) { mem = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* storage unavailable */ } };
  return {
    get(k, d) { return mem[k] === undefined ? d : mem[k]; },
    set(k, v) { mem[k] = v; save(); },
    sub(k, id) { return (mem[k] || {})[id]; },
    setSub(k, id, v) { mem[k] = mem[k] || {}; mem[k][id] = v; save(); },
    delSub(k, id) { if (mem[k]) { delete mem[k][id]; save(); } },
    reset() { mem = {}; save(); }
  };
})();
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

/* ---------- small utils ---------- */
const range = (n) => Array.from({ length: n }, (_, i) => i);
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const bin = (n, w) => (n >>> 0).toString(2).padStart(w || 1, '0');
const pop = (x) => { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; };
const clog2 = (n) => { let k = 0; while ((1 << k) < n) k++; return k; };
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ---------- widgets ---------- */
function tsw(label, init, onChange) {
  let v = init ? 1 : 0;
  const val = h('span', { class: 'val' }, String(v));
  const el = h('button', { type: 'button', class: 'tsw' + (v ? ' on' : ''), role: 'switch', 'aria-checked': String(!!v), 'aria-label': 'Switch ' + label },
    label ? h('span', null, label) : null, h('span', { class: 'track' }, h('span', { class: 'knob' })), val);
  const api = {
    el, get: () => v,
    set(x, silent) { v = x ? 1 : 0; el.classList.toggle('on', !!v); el.setAttribute('aria-checked', String(!!v)); val.textContent = String(v); if (!silent && onChange) onChange(v); }
  };
  el.addEventListener('click', () => api.set(v ? 0 : 1));
  return api;
}
function led(init) {
  const el = h('span', { class: 'led' + (init ? ' on' : ''), role: 'img', 'aria-label': 'LED' });
  return { el, set(v) { el.classList.toggle('on', !!v); el.setAttribute('aria-label', v ? 'LED on' : 'LED off'); } };
}
function seg(options, value, onChange) {
  const opts = options.map((o) => (typeof o === 'object' ? o : { v: o, l: String(o) }));
  let cur = value;
  const btns = opts.map((o) => h('button', { type: 'button', class: o.v === cur ? 'on' : '', onclick: () => api.set(o.v) }, o.l));
  const el = h('div', { class: 'seg', role: 'group' }, btns);
  const api = {
    el, get: () => cur,
    set(v, silent) { cur = v; opts.forEach((o, i) => btns[i].classList.toggle('on', o.v === v)); if (!silent && onChange) onChange(v); }
  };
  return api;
}
function insertAtCursor(input, text, caretFromEnd) {
  const start = input.selectionStart == null ? input.value.length : input.selectionStart;
  const end = input.selectionEnd == null ? input.value.length : input.selectionEnd;
  input.value = input.value.slice(0, start) + text + input.value.slice(end);
  const pos = start + text.length - (caretFromEnd || 0);
  input.focus();
  input.setSelectionRange(pos, pos);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
/* boxed field for typing Boolean expressions: a button row (AND/OR/XOR, and optionally Σm()/ΠM()) above the input */
function exprField(label, input, opts = {}) {
  const ops = [['·', 'AND', '·', 0], ['+', 'OR', '+', 0], ['⊕', 'XOR', '⊕', 0]];
  if (opts.canonical) {
    ops.push(['Σm()', 'Sum of minterms', 'Σm()', 1], ['ΠM()', 'Product of maxterms', 'ΠM()', 1]);
  }
  const tools = h('div', { class: 'eqin-ops' }, ops.map(([sym, name, ins, caret]) =>
    h('button', { type: 'button', class: 'eqop', 'aria-label': 'Insert ' + name + ' (' + sym + ')', title: name + ' (' + sym + ')', onclick: () => insertAtCursor(input, ins, caret) }, sym)));
  return h('div', { class: 'eqin' },
    h('div', { class: 'eqin-top' }, h('span', { class: 'eqin-label' }, label), tools),
    h('div', { class: 'eqin-body' }, input));
}
function tabs(items, initial, render) {
  const body = h('div');
  const bar = h('div', { class: 'tabs', role: 'tablist' });
  let cl = [];
  const reg = (fn) => cl.push(fn);
  const closeAll = () => { cl.forEach((f) => { try { f(); } catch (e) { /* ignore */ } }); cl = []; };
  const btns = items.map((it) => h('button', { type: 'button', role: 'tab', onclick: () => sel(it.id) }, it.label));
  btns.forEach((b) => bar.append(b));
  function sel(id) {
    closeAll();
    items.forEach((it, i) => btns[i].classList.toggle('on', it.id === id));
    clear(body); render(id, body, reg);
  }
  App.onCleanup(closeAll);
  const el = h('div', null, bar, body);
  sel(initial || items[0].id);
  return { el, sel };
}
/* multi-bit toggle row. MSB first. */
function bitRow(n, value, onChange, opts = {}) {
  let v = value | 0;
  const cells = [];
  const el = h('div', { class: 'bits', role: 'group', 'aria-label': opts.label || 'bits' });
  for (let i = n - 1; i >= 0; i--) {
    const b = h('button', { type: 'button', class: 'bit', 'aria-label': (opts.label || 'bit') + ' ' + i, onclick: () => { if (opts.readonly) return; v ^= (1 << i); paint(); onChange && onChange(v); } }, '0');
    if (opts.readonly) b.classList.add('ro');
    cells[i] = b;
    el.append(h('div', { class: 'bitc' }, opts.noIdx ? null : h('small', null, (opts.prefix || '') + i), b));
  }
  function paint() { for (let i = 0; i < n; i++) { const on = (v >> i) & 1; cells[i].textContent = on; cells[i].classList.toggle('on', !!on); } }
  paint();
  return { el, get: () => v, set(x, silent) { v = x & ((1 << n) - 1); paint(); if (!silent && onChange) onChange(v); }, mark(i, on) { cells[i].classList.toggle('mk', on); } };
}
function tableEl(headers, rows, cls) {
  return h('table', { class: cls || 'tt' },
    h('thead', null, h('tr', null, headers.map((x) => h('th', null, x)))),
    h('tbody', null, rows.map((r) => h('tr', null, r.map((c) => h('td', null, c))))));
}
const revealEl = (label, html) => h('details', { class: 'reveal' }, h('summary', null, label || 'Show answer'), h('div', { class: 'ans', html }));

/* waveform strip (logic analyser style). traces: [{name,data:[0/1/undefined]}] */
function waveSvg(traces, opts = {}) {
  const step = opts.step || 26, rowH = opts.rowH || 30, lw = opts.labelW || 46, n = opts.n || Math.max(8, ...traces.map((t) => t.data.length));
  const H = traces.length * rowH + 6, W = lw + n * step + 6;
  const svg = sv('svg', { class: 'wave', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Timing diagram', style: { maxHeight: `min(calc(${H} * var(--u)), 32vh)` } });
  for (let i = 0; i <= n; i++) svg.append(sv('line', { class: 'wg', x1: lw + i * step, x2: lw + i * step, y1: 0, y2: H }));
  traces.forEach((t, r) => {
    const y0 = r * rowH + 4, hi = y0 + 5, lo = y0 + rowH - 9;
    svg.append(sv('text', { x: 2, y: y0 + rowH / 2 + 3 }, t.name));
    let d = '', prev;
    const off = Math.max(0, t.data.length - n);
    for (let i = 0; i < n; i++) {
      const val = t.data[i + off];
      if (val === undefined) { prev = undefined; continue; }
      const x = lw + i * step, y = val ? hi : lo;
      if (prev === undefined) d += `M${x},${y}`; else if (prev !== val) d += `L${x},${prev ? hi : lo}L${x},${y}`;
      d += `L${x + step},${y}`; prev = val;
    }
    svg.append(sv('path', { class: 'wl', d }));
  });
  return svg;
}

/* ===================== Boolean engine ===================== */
function tokenize(src) {
  const toks = []; let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[A-Za-z]/.test(ch)) { toks.push({ k: 'var', v: ch.toUpperCase() }); i++; continue; }
    if (ch === '0' || ch === '1') { toks.push({ k: 'const', v: +ch }); i++; continue; }
    if (ch === '+' || ch === '|' || ch === '∨') { toks.push({ k: 'or' }); i++; continue; }
    if (ch === '*' || ch === '·' || ch === '&' || ch === '∧' || ch === '.') { toks.push({ k: 'and' }); i++; continue; }
    if (ch === '⊕' || ch === '^') { toks.push({ k: 'xor' }); i++; continue; }
    if (ch === "'" || ch === '’') { toks.push({ k: 'post' }); i++; continue; }
    if (ch === '!' || ch === '~' || ch === '¬') { toks.push({ k: 'pre' }); i++; continue; }
    if (ch === '(') { toks.push({ k: '(' }); i++; continue; }
    if (ch === ')') { toks.push({ k: ')' }); i++; continue; }
    throw new Error('Unexpected character "' + ch + '". Use letters for variables, + for OR, ⊕ for XOR, \' for NOT.');
  }
  return toks;
}
function parseExpr(src) {
  const toks = tokenize(src); let p = 0;
  if (!toks.length) throw new Error('Type an expression, for example AB + A\'C.');
  const peek = () => toks[p], next = () => toks[p++];
  function parseOr() { let a = parseXor(); while (peek() && peek().k === 'or') { next(); a = { t: 'or', a, b: parseXor() }; } return a; }
  function parseXor() { let a = parseAnd(); while (peek() && peek().k === 'xor') { next(); a = { t: 'xor', a, b: parseAnd() }; } return a; }
  function parseAnd() {
    let a = parseUnary();
    for (;;) {
      const t = peek();
      if (t && t.k === 'and') { next(); a = { t: 'and', a, b: parseUnary() }; }
      else if (t && (t.k === 'var' || t.k === 'const' || t.k === '(' || t.k === 'pre')) a = { t: 'and', a, b: parseUnary() };
      else break;
    }
    return a;
  }
  function parseUnary() {
    const t = peek();
    if (t && t.k === 'pre') { next(); return { t: 'not', a: parseUnary() }; }
    let e = primary();
    while (peek() && peek().k === 'post') { next(); e = { t: 'not', a: e }; }
    return e;
  }
  function primary() {
    const t = next();
    if (!t) throw new Error('The expression ends too early.');
    if (t.k === 'var') return { t: 'var', n: t.v };
    if (t.k === 'const') return { t: 'const', v: t.v };
    if (t.k === '(') { const e = parseOr(); const c = next(); if (!c || c.k !== ')') throw new Error('A closing ) is missing.'); return e; }
    throw new Error('An operand is missing before an operator.');
  }
  const ast = parseOr();
  if (p < toks.length) throw new Error('Unexpected symbol near the end of the expression.');
  return ast;
}
function astVars(n, s = new Set()) {
  if (n.t === 'var') s.add(n.n); else if (n.a) { astVars(n.a, s); if (n.b) astVars(n.b, s); }
  return s;
}
const sortedVars = (ast) => Array.from(astVars(ast)).sort();
function evalAst(n, env) {
  switch (n.t) {
    case 'var': return env[n.n] ? 1 : 0;
    case 'const': return n.v;
    case 'not': return evalAst(n.a, env) ? 0 : 1;
    case 'and': return evalAst(n.a, env) && evalAst(n.b, env) ? 1 : 0;
    case 'or': return evalAst(n.a, env) || evalAst(n.b, env) ? 1 : 0;
    case 'xor': return evalAst(n.a, env) ^ evalAst(n.b, env);
  }
  return 0;
}
/* outputs indexed by minterm number; vars[0] is the MSB */
function tableOf(ast, vars) {
  const n = vars.length, out = [];
  for (let m = 0; m < (1 << n); m++) {
    const env = {};
    vars.forEach((v, i) => { env[v] = (m >> (n - 1 - i)) & 1; });
    out.push(evalAst(ast, env));
  }
  return out;
}
const PREC = { or: 1, xor: 2, and: 3, not: 4, var: 5, const: 5 };
function astStr(n, parent = 0) {
  let s;
  switch (n.t) {
    case 'var': return n.n;
    case 'const': return String(n.v);
    case 'not': {
      if (n.a.t === 'var') return n.a.n + "'";
      return '(' + astStr(n.a, 0) + ")'";
    }
    case 'and': s = astStr(n.a, 3) + astStr(n.b, 3); break;
    case 'or': s = astStr(n.a, 1) + ' + ' + astStr(n.b, 1); break;
    case 'xor': s = astStr(n.a, 2) + ' ⊕ ' + astStr(n.b, 2); break;
  }
  return PREC[n.t] < parent ? '(' + s + ')' : s;
}
function xorExpand(n) { return { t: 'or', a: { t: 'and', a: n.a, b: { t: 'not', a: n.b } }, b: { t: 'and', a: { t: 'not', a: n.a }, b: n.b } }; }
function nnf(n, neg) {
  switch (n.t) {
    case 'var': return neg ? { t: 'not', a: n } : n;
    case 'const': return { t: 'const', v: neg ? 1 - n.v : n.v };
    case 'not': return nnf(n.a, !neg);
    case 'and': return neg ? { t: 'or', a: nnf(n.a, true), b: nnf(n.b, true) } : { t: 'and', a: nnf(n.a, false), b: nnf(n.b, false) };
    case 'or': return neg ? { t: 'and', a: nnf(n.a, true), b: nnf(n.b, true) } : { t: 'or', a: nnf(n.a, false), b: nnf(n.b, false) };
    case 'xor': return nnf(xorExpand(n), neg);
  }
}
function dualAst(n) {
  switch (n.t) {
    case 'var': return n;
    case 'const': return { t: 'const', v: 1 - n.v };
    case 'not': return { t: 'not', a: dualAst(n.a) };
    case 'and': return { t: 'or', a: dualAst(n.a), b: dualAst(n.b) };
    case 'or': return { t: 'and', a: dualAst(n.a), b: dualAst(n.b) };
    case 'xor': return dualAst(xorExpand(n));
  }
}
function litCount(n) { if (n.t === 'var') return 1; if (n.t === 'const') return 0; return litCount(n.a) + (n.b ? litCount(n.b) : 0); }

/* ---- Quine-McCluskey ---- */
function qm(n, ones, dcs) {
  dcs = (dcs || []).filter((d) => !ones.includes(d));
  const all = Array.from(new Set([...ones, ...dcs]));
  if (!ones.length) return { primes: [], cover: [], essential: [] };
  let cur = all.map((m) => ({ val: m, mask: 0, cells: [m] }));
  const primes = new Map();
  while (cur.length) {
    const nxt = new Map(), used = new Set();
    for (let i = 0; i < cur.length; i++) for (let j = i + 1; j < cur.length; j++) {
      const a = cur[i], b = cur[j];
      if (a.mask !== b.mask) continue;
      const d = a.val ^ b.val;
      if (d && (d & (d - 1)) === 0) {
        const val = a.val & b.val, mask = a.mask | d, key = val + ':' + mask;
        used.add(i); used.add(j);
        if (!nxt.has(key)) nxt.set(key, { val, mask, cells: Array.from(new Set([...a.cells, ...b.cells])).sort((x, y) => x - y) });
      }
    }
    cur.forEach((c, i) => { if (!used.has(i)) primes.set(c.val + ':' + c.mask, c); });
    cur = Array.from(nxt.values());
  }
  const P = Array.from(primes.values()).sort((a, b) => pop(a.mask) - pop(b.mask) || a.val - b.val);
  const covers = (p, m) => p.cells.includes(m);
  const essential = [];
  ones.forEach((m) => { const c = P.filter((p) => covers(p, m)); if (c.length === 1 && !essential.includes(c[0])) essential.push(c[0]); });
  let need = ones.filter((m) => !essential.some((p) => covers(p, m)));
  let best = null;
  const cost = (sel) => [sel.length, sel.reduce((s, p) => s + (n - pop(p.mask)), 0)];
  const rest = P.filter((p) => !essential.includes(p));
  (function dfs(remaining, chosen) {
    if (best) { const c = cost(chosen); if (c[0] > best.c[0] || (c[0] === best.c[0] && c[1] >= best.c[1])) return; }
    if (!remaining.length) { best = { sel: chosen.slice(), c: cost(chosen) }; return; }
    const m = remaining[0];
    for (const p of rest) {
      if (chosen.includes(p) || !covers(p, m)) continue;
      chosen.push(p);
      dfs(remaining.filter((x) => !covers(p, x)), chosen);
      chosen.pop();
    }
  })(need, []);
  const extra = best ? best.sel : [];
  return { primes: P, essential, cover: [...essential, ...extra] };
}
function termSOP(p, vars) {
  const n = vars.length; let s = '';
  for (let i = 0; i < n; i++) { const bit = 1 << (n - 1 - i); if (p.mask & bit) continue; s += vars[i] + ((p.val & bit) ? '' : "'"); }
  return s || '1';
}
function termPOS(p, vars) {
  const n = vars.length, parts = [];
  for (let i = 0; i < n; i++) { const bit = 1 << (n - 1 - i); if (p.mask & bit) continue; parts.push(vars[i] + ((p.val & bit) ? "'" : '')); }
  if (!parts.length) return '0';
  return parts.length === 1 ? parts[0] : '(' + parts.join('+') + ')';
}
/* fn: array of 0/1/2(X) indexed by minterm */
function minimize(vars, fn) {
  const n = vars.length, N = 1 << n;
  const ones = range(N).filter((i) => fn[i] === 1), zeros = range(N).filter((i) => fn[i] === 0), dcs = range(N).filter((i) => fn[i] === 2);
  const sop = qm(n, ones, dcs), pos = qm(n, zeros, dcs);
  sop.expr = !ones.length ? '0' : sop.cover.map((p) => termSOP(p, vars)).join(' + ');
  if (ones.length + dcs.length === N && ones.length) sop.expr = '1';
  pos.expr = !zeros.length ? '1' : pos.cover.map((p) => termPOS(p, vars)).join('');
  if (zeros.length + dcs.length === N && zeros.length) pos.expr = '0';
  return { ones, zeros, dcs, sop, pos };
}
function equivalent(a, b) {
  const vs = Array.from(new Set([...astVars(a), ...astVars(b)])).sort();
  const ta = tableOf(a, vs), tb = tableOf(b, vs);
  return ta.every((x, i) => x === tb[i]);
}
const sigma = (ones, dcs) => 'Σm(' + ones.join(', ') + ')' + (dcs && dcs.length ? ' + d(' + dcs.join(', ') + ')' : '');

/* ===================== gate geometry ===================== */
const GATE_W = { AND: 44, OR: 44, XOR: 50, NAND: 52, NOR: 52, XNOR: 58, NOT: 44, BUF: 36 };
const GATE_LABEL = { AND: 'AND', OR: 'OR', XOR: 'XOR', NAND: 'NAND', NOR: 'NOR', XNOR: 'XNOR', NOT: 'NOT', BUF: 'Buffer' };
function gateEval(type, ins) {
  const a = ins[0] ? 1 : 0, b = ins[1] ? 1 : 0;
  switch (type) {
    case 'AND': return a & b; case 'OR': return a | b; case 'NAND': return (a & b) ^ 1; case 'NOR': return (a | b) ^ 1;
    case 'XOR': return a ^ b; case 'XNOR': return (a ^ b) ^ 1; case 'NOT': return a ^ 1; case 'BUF': return a;
  }
  return 0;
}
/* svg pieces for a gate body. Local coords: inputs at x=0, output at GATE_W[type]. */
function gateBody(type) {
  const els = [];
  const andP = 'M0,0 H24 A20,20 0 0 1 24,40 H0 Z';
  const orP = 'M0,0 Q20,0 44,20 Q20,40 0,40 Q12,20 0,0 Z';
  const bubble = (x) => sv('circle', { cx: x, cy: 20, r: 4, class: 'gsym' });
  const leads = (ys, x2) => ys.map((y) => sv('line', { class: 'gsym-line', x1: 0, y1: y, x2, y2: y }));
  switch (type) {
    case 'AND': els.push(sv('path', { class: 'gsym', d: andP })); break;
    case 'NAND': els.push(sv('path', { class: 'gsym', d: andP }), bubble(48)); break;
    case 'OR': els.push(...leads([10, 30], 6), sv('path', { class: 'gsym', d: orP })); break;
    case 'NOR': els.push(...leads([10, 30], 6), sv('path', { class: 'gsym', d: orP }), bubble(48)); break;
    case 'XOR': case 'XNOR':
      els.push(...leads([10, 30], 8), sv('path', { class: 'gsym', d: orP, transform: 'translate(6,0)' }), sv('path', { class: 'gsym-line', d: 'M0,0 Q12,20 0,40' }));
      if (type === 'XNOR') els.push(bubble(54));
      break;
    case 'NOT': els.push(sv('path', { class: 'gsym', d: 'M0,4 L36,20 L0,36 Z' }), bubble(40)); break;
    case 'BUF': els.push(sv('path', { class: 'gsym', d: 'M0,4 L36,20 L0,36 Z' })); break;
  }
  return els;
}
const gateInputsY = (type) => (type === 'NOT' || type === 'BUF') ? [20] : [10, 30];
/* standalone symbol with lead wires, used in reference and gate explorer */
function gateSvg(type, opts = {}) {
  const w = GATE_W[type], ys = gateInputsY(type), pad = 22;
  const svg = sv('svg', { viewBox: `${-pad} -4 ${w + pad * 2} 48`, width: (w + pad * 2) * (opts.scale || 1.3), role: 'img', 'aria-label': GATE_LABEL[type] + ' gate symbol' });
  ys.forEach((y, i) => svg.append(sv('line', { class: 'w ' + (opts.ins && opts.ins[i] ? 'hi' : ''), x1: -pad, y1: y, x2: 0, y2: y })));
  svg.append(sv('line', { class: 'w ' + (opts.out ? 'hi' : ''), x1: w, y1: 20, x2: w + pad, y2: 20 }));
  gateBody(type).forEach((e) => svg.append(e));
  return svg;
}
