/* ===================== lab.js : circuit simulator ===================== */
const FF_TYPES = ['DFF', 'JKFF', 'TFF'];
const isFF = (t) => FF_TYPES.includes(t);
const isGate = (t) => GATE_W[t] !== undefined;
const CLK_PIN = { DFF: 1, TFF: 1, JKFF: 1 };
const PD_CACHE = {};
function pinDefs(type) {
  if (PD_CACHE[type]) return PD_CACHE[type];
  let d;
  if (isGate(type)) d = { ins: gateInputsY(type).map((y) => ({ x: 0, y })), outs: [{ x: GATE_W[type], y: 20 }], w: GATE_W[type], h: 40 };
  else switch (type) {
    case 'SWITCH': case 'CLOCK': d = { ins: [], outs: [{ x: 48, y: 16 }], w: 48, h: 32 }; break;
    case 'LED': d = { ins: [{ x: 0, y: 16 }], outs: [], w: 44, h: 32 }; break;
    case 'PROBE': d = { ins: [{ x: 0, y: 14 }], outs: [], w: 44, h: 28 }; break;
    case 'DFF': d = { ins: [{ x: 0, y: 15, n: 'D' }, { x: 0, y: 45, n: 'CLK' }], outs: [{ x: 64, y: 15, n: 'Q' }, { x: 64, y: 45, n: "Q'" }], w: 64, h: 60 }; break;
    case 'TFF': d = { ins: [{ x: 0, y: 15, n: 'T' }, { x: 0, y: 45, n: 'CLK' }], outs: [{ x: 64, y: 15, n: 'Q' }, { x: 64, y: 45, n: "Q'" }], w: 64, h: 60 }; break;
    case 'JKFF': d = { ins: [{ x: 0, y: 12, n: 'J' }, { x: 0, y: 33, n: 'CLK' }, { x: 0, y: 54, n: 'K' }], outs: [{ x: 64, y: 12, n: 'Q' }, { x: 64, y: 54, n: "Q'" }], w: 64, h: 66 }; break;
    default: d = { ins: [], outs: [], w: 40, h: 40 };
  }
  PD_CACHE[type] = d; return d;
}
const PAL = [
  ['Inputs', [['SWITCH', 'Switch'], ['CLOCK', 'Clock']]],
  ['Outputs', [['LED', 'LED'], ['PROBE', 'Probe']]],
  ['Gates', [['AND', 'AND'], ['OR', 'OR'], ['NOT', 'NOT'], ['NAND', 'NAND'], ['NOR', 'NOR'], ['XOR', 'XOR'], ['XNOR', 'XNOR'], ['BUF', 'Buffer']]],
  ['Storage', [['DFF', 'D flip-flop'], ['JKFF', 'JK flip-flop'], ['TFF', 'T flip-flop']]]
];

/* ---------- preset netlists ---------- */
function NL(list, wires) {
  return {
    comps: list.map(([id, type, x, y, label, v]) => ({ id, type, x, y, label: label || '', v: v || 0, q: 0 })),
    wires: wires.map(([fc, fp, tc, tp]) => ({ fc, fp, tc, tp }))
  };
}
const PRESETS = {
  'not-nand': ['NOT from one NAND', () => NL([['a', 'SWITCH', 30, 50, 'A'], ['g', 'NAND', 170, 50], ['y', 'LED', 300, 54, 'Y']], [['a', 0, 'g', 0], ['a', 0, 'g', 1], ['g', 0, 'y', 0]])],
  'and-nand': ['AND from two NAND gates', () => NL([['a', 'SWITCH', 30, 40, 'A'], ['b', 'SWITCH', 30, 110, 'B'], ['g1', 'NAND', 150, 66], ['g2', 'NAND', 270, 66], ['y', 'LED', 390, 70, 'Y']],
    [['a', 0, 'g1', 0], ['b', 0, 'g1', 1], ['g1', 0, 'g2', 0], ['g1', 0, 'g2', 1], ['g2', 0, 'y', 0]])],
  'or-nand': ['OR from three NAND gates', () => NL([['a', 'SWITCH', 30, 30, 'A'], ['b', 'SWITCH', 30, 130, 'B'], ['n1', 'NAND', 150, 30], ['n2', 'NAND', 150, 130], ['n3', 'NAND', 290, 80], ['y', 'LED', 420, 84, 'Y']],
    [['a', 0, 'n1', 0], ['a', 0, 'n1', 1], ['b', 0, 'n2', 0], ['b', 0, 'n2', 1], ['n1', 0, 'n3', 0], ['n2', 0, 'n3', 1], ['n3', 0, 'y', 0]])],
  'not-nor': ['NOT from one NOR', () => NL([['a', 'SWITCH', 30, 50, 'A'], ['g', 'NOR', 170, 50], ['y', 'LED', 300, 54, 'Y']], [['a', 0, 'g', 0], ['a', 0, 'g', 1], ['g', 0, 'y', 0]])],
  'or-nor': ['OR from two NOR gates', () => NL([['a', 'SWITCH', 30, 40, 'A'], ['b', 'SWITCH', 30, 110, 'B'], ['g1', 'NOR', 150, 66], ['g2', 'NOR', 270, 66], ['y', 'LED', 390, 70, 'Y']],
    [['a', 0, 'g1', 0], ['b', 0, 'g1', 1], ['g1', 0, 'g2', 0], ['g1', 0, 'g2', 1], ['g2', 0, 'y', 0]])],
  'and-nor': ['AND from three NOR gates', () => NL([['a', 'SWITCH', 30, 30, 'A'], ['b', 'SWITCH', 30, 130, 'B'], ['n1', 'NOR', 150, 30], ['n2', 'NOR', 150, 130], ['n3', 'NOR', 290, 80], ['y', 'LED', 420, 84, 'Y']],
    [['a', 0, 'n1', 0], ['a', 0, 'n1', 1], ['b', 0, 'n2', 0], ['b', 0, 'n2', 1], ['n1', 0, 'n3', 0], ['n2', 0, 'n3', 1], ['n3', 0, 'y', 0]])],
  'half-adder': ['Half adder', () => NL([['a', 'SWITCH', 30, 40, 'A'], ['b', 'SWITCH', 30, 120, 'B'], ['x', 'XOR', 200, 30], ['n', 'AND', 200, 120], ['s', 'LED', 330, 34, 'S'], ['c', 'LED', 330, 124, 'C']],
    [['a', 0, 'x', 0], ['b', 0, 'x', 1], ['a', 0, 'n', 0], ['b', 0, 'n', 1], ['x', 0, 's', 0], ['n', 0, 'c', 0]])],
  'full-adder': ['Full adder (two half adders + OR)', () => NL([['a', 'SWITCH', 30, 30, 'A'], ['b', 'SWITCH', 30, 110, 'B'], ['ci', 'SWITCH', 30, 200, 'Cin'],
    ['x1', 'XOR', 150, 40], ['a1', 'AND', 150, 110], ['x2', 'XOR', 290, 70], ['a2', 'AND', 290, 160], ['o', 'OR', 430, 130], ['s', 'LED', 440, 70, 'S'], ['co', 'LED', 540, 134, 'Cout']],
    [['a', 0, 'x1', 0], ['b', 0, 'x1', 1], ['a', 0, 'a1', 0], ['b', 0, 'a1', 1], ['x1', 0, 'x2', 0], ['ci', 0, 'x2', 1], ['x1', 0, 'a2', 0], ['ci', 0, 'a2', 1], ['a1', 0, 'o', 0], ['a2', 0, 'o', 1], ['x2', 0, 's', 0], ['o', 0, 'co', 0]])],
  'sr-latch': ['SR latch from two NOR gates', () => NL([['r', 'SWITCH', 30, 30, 'R'], ['s', 'SWITCH', 30, 170, 'S'], ['n1', 'NOR', 200, 40], ['n2', 'NOR', 200, 150], ['q', 'LED', 340, 44, 'Q'], ['qb', 'LED', 340, 154, "Q'"]],
    [['r', 0, 'n1', 0], ['s', 0, 'n2', 0], ['n2', 0, 'n1', 1], ['n1', 0, 'n2', 1], ['n1', 0, 'q', 0], ['n2', 0, 'qb', 0]])],
  'd-ff': ['D flip-flop', () => NL([['d', 'SWITCH', 30, 40, 'D'], ['k', 'CLOCK', 30, 130, 'CLK'], ['f', 'DFF', 180, 50], ['q', 'LED', 310, 54, 'Q'], ['qb', 'LED', 310, 94, "Q'"]],
    [['d', 0, 'f', 0], ['k', 0, 'f', 1], ['f', 0, 'q', 0], ['f', 1, 'qb', 0]])],
  'jk-ff': ['JK flip-flop', () => NL([['j', 'SWITCH', 30, 30, 'J'], ['k', 'CLOCK', 30, 100, 'CLK'], ['kk', 'SWITCH', 30, 170, 'K'], ['f', 'JKFF', 180, 60], ['q', 'LED', 320, 66, 'Q'], ['qb', 'LED', 320, 116, "Q'"]],
    [['j', 0, 'f', 0], ['k', 0, 'f', 1], ['kk', 0, 'f', 2], ['f', 0, 'q', 0], ['f', 1, 'qb', 0]])],
  'div2': ['Divide-by-2 (D flip-flop, Q\u2032 to D)', () => NL([['k', 'CLOCK', 30, 90, 'CLK'], ['f', 'DFF', 180, 60], ['q', 'LED', 320, 64, 'Q']], [['k', 0, 'f', 1], ['f', 1, 'f', 0], ['f', 0, 'q', 0]])],
  'ripple-3': ['3-bit ripple counter (T flip-flops)', () => NL([['one', 'SWITCH', 30, 20, '1', 1], ['k', 'CLOCK', 30, 120, 'CLK'],
    ['f0', 'TFF', 160, 60], ['f1', 'TFF', 330, 60], ['f2', 'TFF', 500, 60], ['l0', 'LED', 236, 6, 'Q0'], ['l1', 'LED', 406, 6, 'Q1'], ['l2', 'LED', 576, 6, 'Q2']],
    [['one', 0, 'f0', 0], ['one', 0, 'f1', 0], ['one', 0, 'f2', 0], ['k', 0, 'f0', 1], ['f0', 1, 'f1', 1], ['f1', 1, 'f2', 1], ['f0', 0, 'l0', 0], ['f1', 0, 'l1', 0], ['f2', 0, 'l2', 0]])],
  'sync-3': ['3-bit synchronous counter', () => NL([['one', 'SWITCH', 30, 20, '1', 1], ['k', 'CLOCK', 30, 130, 'CLK'],
    ['f0', 'TFF', 170, 50], ['f1', 'TFF', 340, 50], ['f2', 'TFF', 510, 50], ['g', 'AND', 430, 170],
    ['l0', 'LED', 246, 0, 'Q0'], ['l1', 'LED', 416, 0, 'Q1'], ['l2', 'LED', 586, 0, 'Q2']],
    [['one', 0, 'f0', 0], ['k', 0, 'f0', 1], ['k', 0, 'f1', 1], ['k', 0, 'f2', 1], ['f0', 0, 'f1', 0], ['f0', 0, 'g', 0], ['f1', 0, 'g', 1], ['g', 0, 'f2', 0], ['f0', 0, 'l0', 0], ['f1', 0, 'l1', 0], ['f2', 0, 'l2', 0]])],
  'shift-4': ['4-bit shift register (serial in, parallel out)', () => NL([['d', 'SWITCH', 30, 50, 'D'], ['k', 'CLOCK', 30, 160, 'CLK'],
    ['f0', 'DFF', 160, 60], ['f1', 'DFF', 300, 60], ['f2', 'DFF', 440, 60], ['f3', 'DFF', 580, 60],
    ['l0', 'LED', 236, 6, 'Q0'], ['l1', 'LED', 376, 6, 'Q1'], ['l2', 'LED', 516, 6, 'Q2'], ['l3', 'LED', 656, 6, 'Q3']],
    [['d', 0, 'f0', 0], ['k', 0, 'f0', 1], ['k', 0, 'f1', 1], ['k', 0, 'f2', 1], ['k', 0, 'f3', 1], ['f0', 0, 'f1', 0], ['f1', 0, 'f2', 0], ['f2', 0, 'f3', 0],
      ['f0', 0, 'l0', 0], ['f1', 0, 'l1', 0], ['f2', 0, 'l2', 0], ['f3', 0, 'l3', 0]])],
  'demorgan': ['DeMorgan: (AB)\u2032 equals A\u2032 + B\u2032', () => NL([['a', 'SWITCH', 30, 30, 'A'], ['b', 'SWITCH', 30, 110, 'B'], ['g1', 'NAND', 160, 30], ['y1', 'LED', 290, 34, '(AB)\u2032'],
    ['na', 'NOT', 130, 100], ['nb', 'NOT', 130, 160], ['o', 'OR', 250, 120], ['y2', 'LED', 360, 124, 'A\u2032+B\u2032']],
    [['a', 0, 'g1', 0], ['b', 0, 'g1', 1], ['g1', 0, 'y1', 0], ['a', 0, 'na', 0], ['b', 0, 'nb', 0], ['na', 0, 'o', 0], ['nb', 0, 'o', 1], ['o', 0, 'y2', 0]])],
  'mux-2to1': ['2-to-1 multiplexer', () => NL([['i0', 'SWITCH', 30, 20, 'I0'], ['i1', 'SWITCH', 30, 100, 'I1'], ['s', 'SWITCH', 30, 190, 'S'], ['n', 'NOT', 120, 180],
    ['a1', 'AND', 250, 20], ['a2', 'AND', 250, 100], ['o', 'OR', 380, 60], ['y', 'LED', 480, 64, 'Y']],
    [['s', 0, 'n', 0], ['n', 0, 'a1', 1], ['i0', 0, 'a1', 0], ['i1', 0, 'a2', 0], ['s', 0, 'a2', 1], ['a1', 0, 'o', 0], ['a2', 0, 'o', 1], ['o', 0, 'y', 0]])],
  'decoder-2to4': ['2-to-4 decoder', () => NL([['a', 'SWITCH', 30, 60, 'A'], ['b', 'SWITCH', 30, 180, 'B'], ['na', 'NOT', 110, 20], ['nb', 'NOT', 110, 140],
    ['d0', 'AND', 260, 0], ['d1', 'AND', 260, 70], ['d2', 'AND', 260, 140], ['d3', 'AND', 260, 210],
    ['y0', 'LED', 380, 4, 'Y0'], ['y1', 'LED', 380, 74, 'Y1'], ['y2', 'LED', 380, 144, 'Y2'], ['y3', 'LED', 380, 214, 'Y3']],
    [['a', 0, 'na', 0], ['b', 0, 'nb', 0], ['na', 0, 'd0', 0], ['nb', 0, 'd0', 1], ['na', 0, 'd1', 0], ['b', 0, 'd1', 1], ['a', 0, 'd2', 0], ['nb', 0, 'd2', 1], ['a', 0, 'd3', 0], ['b', 0, 'd3', 1],
      ['d0', 0, 'y0', 0], ['d1', 0, 'y1', 0], ['d2', 0, 'y2', 0], ['d3', 0, 'y3', 0]])]
};
const PRESET_ORDER = ['demorgan', 'not-nand', 'and-nand', 'or-nand', 'not-nor', 'or-nor', 'and-nor', 'half-adder', 'full-adder', 'mux-2to1', 'decoder-2to4', 'sr-latch', 'd-ff', 'jk-ff', 'div2', 'ripple-3', 'sync-3', 'shift-4'];
const presetNetlist = (k) => PRESETS[k][1]();

/* ---------- expression -> netlist ---------- */
function flattenOp(n, t, out = []) { if (n.t === t) { flattenOp(n.a, t, out); flattenOp(n.b, t, out); } else out.push(n); return out; }
function layoutExpr(ast) {
  const vars = sortedVars(ast), comps = [], wires = [], usedY = {};
  let k = 0;
  const add = (type, x, y, label, v) => { const c = { id: 'n' + (++k), type, x, y, label: label || '', v: v || 0, q: 0 }; comps.push(c); return c; };
  const conn = (r, c, pin) => wires.push({ fc: r.c.id, fp: r.pin, tc: c.id, tp: pin });
  const X = (col) => 30 + col * 112;
  const place = (col, y) => { usedY[col] = usedY[col] || []; while (usedY[col].some((u) => Math.abs(u - y) < 54)) y += 54; usedY[col].push(y); return y; };
  const sw = {}, nots = {};
  vars.forEach((v, i) => { const y = 30 + i * 74; usedY[0] = usedY[0] || []; usedY[0].push(y); const c = add('SWITCH', X(0), y, v); sw[v] = { c, pin: 0, col: 0, y: y + 16 }; });
  function build(n) {
    switch (n.t) {
      case 'var': return sw[n.n];
      case 'const': { const y = place(0, 30 + vars.length * 74); const c = add('SWITCH', X(0), y, String(n.v), n.v); return { c, pin: 0, col: 0, y: y + 16 }; }
      case 'not': {
        if (n.a.t === 'var' && nots[n.a.n]) return nots[n.a.n];
        const ch = build(n.a), col = ch.col + 1, y = place(col, ch.y - 20), c = add('NOT', X(col), y);
        conn(ch, c, 0);
        const r = { c, pin: 0, col, y: y + 20 };
        if (n.a.t === 'var') nots[n.a.n] = r;
        return r;
      }
      case 'xor': {
        const a = build(n.a), b = build(n.b), col = Math.max(a.col, b.col) + 1, y = place(col, (a.y + b.y) / 2 - 20), c = add('XOR', X(col), y);
        conn(a, c, 0); conn(b, c, 1); return { c, pin: 0, col, y: y + 20 };
      }
      default: {
        const args = flattenOp(n, n.t).map(build);
        let acc = args[0];
        for (let i = 1; i < args.length; i++) {
          const b = args[i], col = Math.max(acc.col, b.col) + 1, y = place(col, (acc.y + b.y) / 2 - 20), c = add(n.t === 'and' ? 'AND' : 'OR', X(col), y);
          conn(acc, c, 0); conn(b, c, 1); acc = { c, pin: 0, col, y: y + 20 };
        }
        return acc;
      }
    }
  }
  const root = build(ast);
  const col = root.col + 1, y = Math.max(10, root.y - 16), l = add('LED', X(col), y, 'F');
  conn(root, l, 0);
  return { comps, wires };
}

/* ---------- the lab component ---------- */
function createLab(root, opts) {
  opts = Object.assign({ compact: false, locked: false, preset: null, netlist: null, caption: '' }, opts || {});
  const VW = 960, VH = 520;
  let comps = [], wires = [], byId = {}, wIn = {}, sel = null, wiring = null, drag = null, running = false, timer = null, half = 600;
  let hist = [], undo = [], wid = 1, msgTimer = null;

  const svg = sv('svg', { class: 'labcanvas', viewBox: `0 0 ${VW} ${VH}`, tabindex: '0', role: 'application', 'aria-label': 'Circuit canvas. Click switches to toggle them.' });
  const bg = sv('rect', { x: 0, y: 0, width: VW, height: VH, fill: 'transparent' });
  const gW = sv('g'), gC = sv('g'), gR = sv('g');
  svg.append(bg, gW, gC, gR);
  const status = h('div', { class: 'small muted', role: 'status', 'aria-live': 'polite', style: { minHeight: '22px', margin: '6px 0' } });
  const waveBox = h('div', { class: 'scrollx', style: { marginTop: '10px' } });
  const analysis = h('div', { style: { marginTop: '12px' } });
  const el = h('div', { class: 'lab' });

  const say = (m) => { status.textContent = m || ''; clearTimeout(msgTimer); if (m) msgTimer = setTimeout(() => { status.textContent = ''; }, 6000); };
  const uid = (p) => { let i = 1; while (byId[p + i]) i++; return p + i; };
  function reindex() {
    byId = {}; wIn = {};
    comps.forEach((c) => { byId[c.id] = c; });
    wires.forEach((w) => { wIn[w.tc + '|' + w.tp] = w; });
  }
  const iv = (c, i) => { const w = wIn[c.id + '|' + i]; if (!w) return 0; const s = byId[w.fc]; return s ? (s.out[w.fp] ? 1 : 0) : 0; };
  const mkComp = (o) => Object.assign({ v: 0, q: 0, label: '', prevClk: 0, out: isFF(o.type) ? [0, 1] : [0] }, o);

  function settle(initial) {
    for (let it = 0; it < 90; it++) {
      let ch = false;
      for (const c of comps) {
        if (c.type === 'SWITCH' || c.type === 'CLOCK') { const o = c.v ? 1 : 0; if (c.out[0] !== o) { c.out[0] = o; ch = true; } }
        else if (isGate(c.type)) { const o = gateEval(c.type, [iv(c, 0), iv(c, 1)]); if (c.out[0] !== o) { c.out[0] = o; ch = true; } }
      }
      const upd = [];
      for (const c of comps) {
        if (!isFF(c.type)) continue;
        const clk = iv(c, CLK_PIN[c.type]);
        if (initial) { c.prevClk = clk; continue; }
        if (clk && !c.prevClk) {
          let nq = c.q;
          if (c.type === 'DFF') nq = iv(c, 0);
          else if (c.type === 'TFF') nq = iv(c, 0) ? c.q ^ 1 : c.q;
          else { const j = iv(c, 0), k = iv(c, 2); nq = j && k ? c.q ^ 1 : j ? 1 : k ? 0 : c.q; }
          upd.push([c, nq]);
        }
        c.prevClk = clk;
      }
      for (const [c, nq] of upd) if (c.q !== nq) { c.q = nq; ch = true; }
      for (const c of comps) if (isFF(c.type)) {
        if (c.out[0] !== c.q || c.out[1] !== (c.q ^ 1)) { c.out[0] = c.q; c.out[1] = c.q ^ 1; ch = true; }
      }
      if (!ch) break;
    }
  }

  /* ----- history / waveform ----- */
  const TRACE_ORDER = { CLOCK: 0, SWITCH: 1, LED: 2, PROBE: 3 };
  function sample() {
    const s = {};
    comps.forEach((c) => { if (c.type in TRACE_ORDER) s[c.id] = (c.type === 'LED' || c.type === 'PROBE') ? iv(c, 0) : c.out[0]; });
    hist.push(s); if (hist.length > 40) hist.shift();
    drawWave();
  }
  function drawWave() {
    clear(waveBox);
    const tr = comps.filter((c) => c.type in TRACE_ORDER).sort((a, b) => TRACE_ORDER[a.type] - TRACE_ORDER[b.type] || a.y - b.y);
    if (!tr.length || !hist.length || (opts.compact && !opts.wave && !comps.some((c) => c.type === 'CLOCK'))) { waveBox.style.display = 'none'; return; }
    waveBox.style.display = '';
    waveBox.append(waveSvg(tr.map((c) => ({ name: c.label || c.type, data: hist.map((s) => s[c.id]) })), { n: 24, step: opts.compact ? 22 : 28, labelW: 50 }));
  }

  /* ----- topology ----- */
  function snapshot() { undo.push(JSON.stringify(serialize())); if (undo.length > 30) undo.shift(); }
  function serialize() {
    return { comps: comps.map((c) => ({ id: c.id, type: c.type, x: c.x, y: c.y, label: c.label, v: c.v, q: c.q })), wires: wires.map((w) => ({ fc: w.fc, fp: w.fp, tc: w.tc, tp: w.tp })) };
  }
  function load(nl, keepUndo) {
    if (!keepUndo) snapshot();
    comps = nl.comps.map((c) => mkComp({ id: c.id, type: c.type, x: c.x, y: c.y, label: c.label || '', v: c.v ? 1 : 0, q: c.q ? 1 : 0 }));
    wires = nl.wires.map((w, i) => ({ id: 'w' + (wid++), fc: w.fc, fp: w.fp, tc: w.tc, tp: w.tp }));
    reindex(); sel = null; wiring = null; hist = [];
    settle(true); sample(); draw();
    if (opts.compact) fit();
  }
  function fit() {
    if (!comps.length) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    comps.forEach((c) => { const d = pinDefs(c.type); x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y - 14); x1 = Math.max(x1, c.x + d.w); y1 = Math.max(y1, c.y + d.h + 20); });
    const pad = 24; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
    const w = Math.max(x1 - x0, 300), hh = Math.max(y1 - y0, 140);
    svg.setAttribute('viewBox', `${x0} ${y0} ${w} ${hh}`);
    bg.setAttribute('x', x0); bg.setAttribute('y', y0); bg.setAttribute('width', w); bg.setAttribute('height', hh);
    svg.style.maxHeight = Math.min(340, hh * 1.25) + 'px';
  }
  function labelFor(type) {
    const used = new Set(comps.map((c) => c.label));
    if (type === 'SWITCH') { for (const L of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') if (!used.has(L)) return L; return 'S' + comps.length; }
    if (type === 'LED') { for (const L of ['Y', 'Z', 'X', 'W', 'V', 'U']) if (!used.has(L)) return L; return 'L' + comps.length; }
    if (type === 'CLOCK') return used.has('CLK') ? 'CLK' + (comps.length) : 'CLK';
    if (type === 'PROBE') { let i = 1; while (used.has('P' + i)) i++; return 'P' + i; }
    return '';
  }
  function addComp(type, x, y) {
    snapshot();
    if (x === undefined) {
      outer: for (let r = 0; r < 7; r++) for (let cI = 0; cI < 9; cI++) {
        const px = 40 + cI * 100, py = 30 + r * 72;
        if (!comps.some((c) => Math.abs(c.x - px) < 90 && Math.abs(c.y - py) < 62)) { x = px; y = py; break outer; }
      }
      if (x === undefined) { x = 40; y = 30; }
    }
    const c = mkComp({ id: uid('c'), type, x, y, label: labelFor(type) });
    comps.push(c); reindex(); settle(true); sel = { kind: 'comp', id: c.id }; sample(); draw();
  }
  function removeWire(w) { wires = wires.filter((x) => x !== w); reindex(); }
  function connect(fc, fp, tc, tp) {
    snapshot();
    const old = wIn[tc + '|' + tp]; if (old) wires = wires.filter((x) => x !== old);
    wires.push({ id: 'w' + (wid++), fc, fp, tc, tp }); reindex(); settle(true); sample(); draw();
  }
  function deleteSel() {
    if (!sel) { say('Select a component or wire first.'); return; }
    snapshot();
    if (sel.kind === 'comp') { comps = comps.filter((c) => c.id !== sel.id); wires = wires.filter((w) => w.fc !== sel.id && w.tc !== sel.id); }
    else wires = wires.filter((w) => w.id !== sel.id);
    sel = null; reindex(); settle(true); sample(); draw();
  }
  function undoOp() {
    if (!undo.length) { say('Nothing to undo.'); return; }
    const nl = JSON.parse(undo.pop()); load(nl, true);
  }

  /* ----- runtime ----- */
  function userChange() { settle(false); sample(); draw(); }
  function tick() {
    const cl = comps.filter((c) => c.type === 'CLOCK'); if (!cl.length) return;
    cl.forEach((c) => { c.v ^= 1; }); userChange();
  }
  function setRun(on) {
    running = on; clearInterval(timer);
    if (on) timer = setInterval(tick, half);
    if (runBtn) { runBtn.textContent = on ? 'Pause clock' : 'Run clock'; runBtn.classList.toggle('on', on); }
  }
  App.onCleanup(() => { clearInterval(timer); clearTimeout(msgTimer); });
  function resetStates() {
    comps.forEach((c) => { if (isFF(c.type)) { c.q = 0; } if (c.type === 'CLOCK') c.v = 0; });
    settle(true); hist = []; sample(); draw();
  }

  /* ----- drawing ----- */
  const outPos = (c, i) => { const d = pinDefs(c.type); return [c.x + d.outs[i].x, c.y + d.outs[i].y]; };
  const inPos = (c, i) => { const d = pinDefs(c.type); return [c.x + d.ins[i].x, c.y + d.ins[i].y]; };
  const bez = (x1, y1, x2, y2) => { const dx = Math.max(34, Math.abs(x2 - x1) / 2); return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`; };
  function drawComp(c) {
    const d = pinDefs(c.type), g = sv('g', { class: 'comp', 'data-id': c.id, transform: `translate(${c.x},${c.y})` });
    const T = (x, y, txt, cls, anchor) => sv('text', { class: cls || 'lt', x, y, 'text-anchor': anchor || 'middle' }, txt);
    if (isGate(c.type)) {
      g.append(sv('rect', { x: -4, y: -4, width: d.w + 8, height: 48, fill: 'transparent' }));
      gateBody(c.type).forEach((e) => g.append(e));
      g.append(T(d.w / 2, 58, GATE_LABEL[c.type]));
    } else if (c.type === 'SWITCH' || c.type === 'CLOCK') {
      g.append(sv('rect', { class: 'cbody', width: 48, height: 32, rx: 5 }));
      if (c.type === 'SWITCH') g.append(sv('circle', { class: 'knob', cx: c.v ? 34 : 14, cy: 16, r: 9, fill: c.v ? 'var(--hi)' : 'var(--lo)' }));
      else {
        g.append(sv('polyline', { class: 'gsym-line', points: '6,23 6,9 16,9 16,23 26,23 26,9 36,9', style: { stroke: c.v ? 'var(--hi)' : 'var(--ink-3)' } }));
        g.append(sv('circle', { class: 'knob', cx: 40, cy: 16, r: 4.5, fill: c.v ? 'var(--hi)' : 'var(--lo)' }));
      }
      g.append(T(24, -7, c.label, 'lt big'));
    } else if (c.type === 'LED') {
      const on = iv(c, 0);
      g.append(sv('line', { class: 'gsym-line', x1: 0, y1: 16, x2: 14, y2: 16 }));
      if (on) g.append(sv('circle', { cx: 26, cy: 16, r: 17, fill: 'none', stroke: 'var(--led)', 'stroke-width': 4, opacity: 0.3 }));
      g.append(sv('circle', { class: 'ledc', cx: 26, cy: 16, r: 12, fill: on ? 'var(--led)' : 'var(--led-off)' }));
      g.append(T(26, 44, c.label, 'lt big'));
    } else if (c.type === 'PROBE') {
      g.append(sv('rect', { class: 'cbody', width: 44, height: 28, rx: 4 }));
      g.append(T(26, 19, String(iv(c, 0)), 'lt big m'));
      g.append(T(22, -6, c.label));
    } else {
      g.append(sv('rect', { class: 'cbody', width: 64, height: d.h, rx: 5 }));
      d.ins.forEach((p) => {
        g.append(T(7, p.y + 4, p.n === 'CLK' ? '' : p.n, 'lt big', 'start'));
        if (p.n === 'CLK') g.append(sv('path', { d: `M0,${p.y - 7} L9,${p.y} L0,${p.y + 7}`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.8 }), T(13, p.y + 4, 'CLK', 'lt', 'start'));
      });
      d.outs.forEach((p) => g.append(T(57, p.y + 4, p.n, 'lt big', 'end')));
      g.append(T(32, d.h / 2 + 4, 'Q=' + c.q, 'lt m'));
      g.append(T(32, -7, { DFF: 'D flip-flop', JKFF: 'JK flip-flop', TFF: 'T flip-flop' }[c.type]));
    }
    d.ins.forEach((p, i) => g.append(sv('circle', { class: 'pin' + (iv(c, i) ? ' hi' : ''), cx: p.x, cy: p.y, r: 4.5 })));
    d.outs.forEach((p, i) => g.append(sv('circle', { class: 'pin' + (c.out[i] ? ' hi' : ''), cx: p.x, cy: p.y, r: 4.5 })));
    if (!opts.locked) {
      d.ins.forEach((p, i) => g.append(sv('circle', { class: 'pinhit', cx: p.x, cy: p.y, r: 11, 'data-pin': '1', 'data-c': c.id, 'data-k': 'in', 'data-p': i })));
      d.outs.forEach((p, i) => g.append(sv('circle', { class: 'pinhit', cx: p.x, cy: p.y, r: 11, 'data-pin': '1', 'data-c': c.id, 'data-k': 'out', 'data-p': i })));
    }
    if (sel && sel.kind === 'comp' && sel.id === c.id) g.append(sv('rect', { class: 'csel', x: -8, y: -12, width: d.w + 16, height: d.h + 22, rx: 6 }));
    return g;
  }
  function draw() {
    clear(gW); clear(gC); clear(gR);
    wires.forEach((w) => {
      const a = byId[w.fc], b = byId[w.tc]; if (!a || !b) return;
      const [x1, y1] = outPos(a, w.fp), [x2, y2] = inPos(b, w.tp);
      const d = bez(x1, y1, x2, y2), on = a.out[w.fp];
      gW.append(sv('path', { class: 'w' + (on ? ' hi' : '') + (sel && sel.kind === 'wire' && sel.id === w.id ? ' sel' : ''), d }));
      if (!opts.locked) gW.append(sv('path', { class: 'whit', d, 'data-wire': w.id }));
    });
    comps.forEach((c) => gC.append(drawComp(c)));
    if (wiring) {
      const a = byId[wiring.c]; if (a) { const [x1, y1] = outPos(a, wiring.p); gR.append(sv('path', { class: 'w rub', d: bez(x1, y1, wiring.x, wiring.y) })); }
    }
  }

  /* ----- pointer handling ----- */
  function toSvg(e) {
    try { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const m = svg.getScreenCTM(); if (m) return p.matrixTransform(m.inverse()); } catch (err) { /* fall through */ }
    return { x: e.clientX, y: e.clientY };
  }
  function pinAt(pt) {
    let best = null, bd = 16 * 16;
    comps.forEach((c) => pinDefs(c.type).ins.forEach((p, i) => { const dd = (c.x + p.x - pt.x) ** 2 + (c.y + p.y - pt.y) ** 2; if (dd < bd) { bd = dd; best = { c: c.id, p: i }; } }));
    return best;
  }
  svg.addEventListener('pointerdown', (e) => {
    const pt = toSvg(e), t = e.target;
    const closest = (s) => (t.closest ? t.closest(s) : null);
    if (opts.locked) {
      const ce = closest('.comp'); if (!ce) return;
      const c = byId[ce.getAttribute('data-id')];
      if (c && c.type === 'SWITCH') { c.v ^= 1; userChange(); } else if (c && c.type === 'CLOCK' && !running) { c.v ^= 1; userChange(); }
      return;
    }
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    const pe = closest('[data-pin]');
    if (pe) {
      const cid = pe.getAttribute('data-c'), kind = pe.getAttribute('data-k'), pi = +pe.getAttribute('data-p');
      if (kind === 'out') { wiring = { c: cid, p: pi, x: pt.x, y: pt.y }; sel = null; draw(); return; }
      if (wiring) { connect(wiring.c, wiring.p, cid, pi); wiring = null; draw(); return; }
      const w = wIn[cid + '|' + pi];
      if (w) { snapshot(); removeWire(w); wiring = { c: w.fc, p: w.fp, x: pt.x, y: pt.y }; draw(); }
      return;
    }
    const ce = closest('.comp');
    if (ce) {
      const c = byId[ce.getAttribute('data-id')];
      if (wiring) { wiring = null; }
      sel = { kind: 'comp', id: c.id };
      drag = { id: c.id, dx: pt.x - c.x, dy: pt.y - c.y, moved: false, x0: pt.x, y0: pt.y, snap: false };
      draw(); return;
    }
    const we = closest('[data-wire]');
    if (we) { sel = { kind: 'wire', id: we.getAttribute('data-wire') }; wiring = null; draw(); return; }
    wiring = null; sel = null; draw();
  });
  svg.addEventListener('pointermove', (e) => {
    if (opts.locked) return;
    const pt = toSvg(e);
    if (wiring) { wiring.x = pt.x; wiring.y = pt.y; draw(); }
    if (drag) {
      const c = byId[drag.id]; if (!c) return;
      if (!drag.moved && Math.hypot(pt.x - drag.x0, pt.y - drag.y0) < 4) return;
      if (!drag.snap) { snapshot(); drag.snap = true; }
      drag.moved = true;
      c.x = Math.max(0, Math.min(VW - 40, Math.round((pt.x - drag.dx) / 10) * 10));
      c.y = Math.max(0, Math.min(VH - 40, Math.round((pt.y - drag.dy) / 10) * 10));
      draw();
    }
  });
  svg.addEventListener('pointerup', (e) => {
    if (opts.locked) return;
    const pt = toSvg(e);
    if (wiring) {
      const p = pinAt(pt);
      if (p && (Math.hypot(pt.x - wiring.x, pt.y - wiring.y) > 6 || true)) {
        const src = byId[wiring.c], start = src ? outPos(src, wiring.p) : [0, 0];
        if (Math.hypot(pt.x - start[0], pt.y - start[1]) > 16) { connect(wiring.c, wiring.p, p.c, p.p); wiring = null; draw(); }
      }
    }
    if (drag) {
      const c = byId[drag.id];
      if (c && !drag.moved) {
        if (c.type === 'SWITCH') { c.v ^= 1; userChange(); }
        else if (c.type === 'CLOCK') { if (running) say('Pause the clock to toggle it by hand.'); else { c.v ^= 1; userChange(); } }
      }
      drag = null;
    }
  });
  svg.addEventListener('keydown', (e) => {
    if (opts.locked) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSel(); }
    else if (e.key === 'Escape') { wiring = null; sel = null; draw(); }
  });

  /* ----- analysis (truth table + expressions) ----- */
  function truthTable() {
    const sw = comps.filter((c) => c.type === 'SWITCH').sort((a, b) => (a.label > b.label ? 1 : -1));
    const outs = comps.filter((c) => c.type === 'LED' || c.type === 'PROBE').sort((a, b) => a.y - b.y || a.x - b.x);
    if (!sw.length || !outs.length) return { err: 'Add at least one switch and one LED (or probe) to read a truth table.' };
    if (comps.some((c) => isFF(c.type) || c.type === 'CLOCK')) return { err: 'This circuit has clocked parts, so a truth table does not describe it. Use the timing diagram instead.' };
    if (sw.length > 6) return { err: 'A truth table needs six switches or fewer.' };
    const saved = sw.map((c) => c.v), n = sw.length, rows = [];
    for (let m = 0; m < (1 << n); m++) {
      sw.forEach((c, i) => { c.v = (m >> (n - 1 - i)) & 1; }); settle(false);
      rows.push({ ins: sw.map((c) => c.v), outs: outs.map((o) => iv(o, 0)) });
    }
    sw.forEach((c, i) => { c.v = saved[i]; }); settle(false);
    return { sw, outs, rows };
  }
  function showTruth() {
    clear(analysis);
    const t = truthTable();
    if (t.err) { analysis.append(h('p', { class: 'muted' }, t.err)); return; }
    analysis.append(h('div', { class: 'scrollx' }, tableEl([...t.sw.map((c) => c.label), ...t.outs.map((c) => c.label)], t.rows.map((r) => [...r.ins, ...r.outs]))));
    const okL = t.sw.every((c) => /^[A-Z]$/.test(c.label)) && new Set(t.sw.map((c) => c.label)).size === t.sw.length;
    if (okL) {
      const vars = t.sw.map((c) => c.label);
      t.outs.forEach((o, oi) => {
        const m = minimize(vars, t.rows.map((r) => r.outs[oi]));
        analysis.append(h('p', { class: 'out', style: { marginTop: '8px' } }, `${o.label} = `, h('b', null, m.sop.expr), '   ', h('span', { class: 'muted' }, sigma(m.ones))));
      });
    }
  }
  function buildExpr(str) {
    try {
      const ast = parseExpr(str);
      if (sortedVars(ast).length > 7) throw new Error('Use seven variables or fewer.');
      snapshot(); load(layoutExpr(ast), true);
      say('Built "' + astStr(ast) + '". Toggle the switches to test it.');
      return true;
    } catch (err) { say(err.message); return false; }
  }

  /* ----- toolbar ----- */
  let runBtn = null;
  const hasClock = () => comps.some((c) => c.type === 'CLOCK');
  if (!opts.compact) {
    const pal = h('div', { class: 'palette', role: 'toolbar', 'aria-label': 'Add components' });
    PAL.forEach(([name, items]) => pal.append(h('div', { class: 'pg' }, h('span', { class: 'pgl' }, name), items.map(([t, l]) => h('button', { type: 'button', class: 'btn sm', onclick: () => addComp(t) }, l)))));
    runBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => { if (!hasClock()) { say('Add a clock first.'); return; } setRun(!running); } }, 'Run clock');
    const speed = h('input', { type: 'range', min: 150, max: 1400, value: 1550 - half, 'aria-label': 'Clock speed', oninput: (e) => { half = 1550 - (+e.target.value); if (running) setRun(true); } });
    const exSel = h('select', { 'aria-label': 'Example circuits' }, h('option', { value: '' }, 'Example circuits'), PRESET_ORDER.map((k) => h('option', { value: k }, PRESETS[k][0])));
    const io = h('textarea', { rows: 4, style: { width: '100%', display: 'none', marginTop: '8px' }, 'aria-label': 'Circuit JSON', spellcheck: 'false' });
    const exprIn = h('input', { type: 'text', placeholder: "AB + A'C", 'aria-label': 'Boolean expression', size: 22, onkeydown: (e) => { if (e.key === 'Enter') buildExpr(exprIn.value); } });
    const acts = h('div', { class: 'row tight', style: { marginBottom: '8px' } },
      runBtn,
      h('button', { type: 'button', class: 'btn sm', onclick: () => { if (!hasClock()) say('Add a clock first.'); else { if (running) setRun(false); tick(); } } }, 'Step clock'),
      h('label', { class: 'small muted' }, 'Speed ', speed),
      h('button', { type: 'button', class: 'btn sm', onclick: undoOp }, 'Undo'),
      h('button', { type: 'button', class: 'btn sm', onclick: deleteSel }, 'Delete selected'),
      h('button', { type: 'button', class: 'btn sm', onclick: () => { setRun(false); resetStates(); say('Flip-flops and clocks reset to 0.'); } }, 'Reset states'),
      h('button', { type: 'button', class: 'btn sm', onclick: () => { setRun(false); load({ comps: [], wires: [] }); say('Canvas cleared. Undo brings it back.'); } }, 'Clear'));
    const acts2 = h('div', { class: 'row tight', style: { marginBottom: '8px' } },
      exSel, h('button', { type: 'button', class: 'btn sm', onclick: () => { if (exSel.value) { setRun(false); load(presetNetlist(exSel.value)); say('Loaded: ' + PRESETS[exSel.value][0]); } } }, 'Load example'),
      h('span', { style: { width: '10px' } }),
      h('button', { type: 'button', class: 'btn sm', onclick: () => { say(lsSet('dld-lab-save', JSON.stringify(serialize())) ? 'Circuit saved in this browser.' : 'Saving is unavailable here. Use Export instead.'); } }, 'Save'),
      h('button', { type: 'button', class: 'btn sm', onclick: () => { const s = lsGet('dld-lab-save'); if (!s) { say('No saved circuit yet.'); return; } try { load(JSON.parse(s)); say('Saved circuit loaded.'); } catch (err) { say('The saved circuit could not be read.'); } } }, 'Load saved'),
      h('button', { type: 'button', class: 'btn sm', onclick: () => { io.style.display = 'block'; io.value = JSON.stringify(serialize()); io.select && io.select(); say('Circuit JSON is in the box below. Copy it to keep it.'); } }, 'Export'),
      h('button', { type: 'button', class: 'btn sm', onclick: () => { io.style.display = 'block'; try { const nl = JSON.parse(io.value); if (!nl.comps || !nl.wires) throw new Error('x'); load(nl); say('Imported.'); } catch (err) { say('Paste circuit JSON in the box, then press Import again.'); } } }, 'Import'));
    const acts3 = h('div', { class: 'row tight', style: { marginBottom: '10px' } },
      h('label', { class: 'fld' }, 'Boolean expression to circuit', h('span', { class: 'row tight' }, exprIn, h('button', { type: 'button', class: 'btn sm pri', onclick: () => buildExpr(exprIn.value) }, 'Build circuit'))),
      h('span', { style: { width: '10px' } }),
      h('label', { class: 'fld' }, 'Circuit to truth table', h('button', { type: 'button', class: 'btn sm pri', onclick: showTruth }, 'Show truth table and expression')));
    el.append(pal, acts, acts2, acts3, h('div', { class: 'scrollx' }, svg), status, h('p', { class: 'small muted', style: { margin: '2px 0 8px' } }, 'Drag a component to move it. Drag from an output pin (right side) to an input pin (left side) to draw a wire. Click a switch to toggle it. Select a wire or component and press Delete to remove it.'), waveBox, analysis, io);
  } else {
    runBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => setRun(!running) }, 'Run clock');
    const bar = h('div', { class: 'row tight', style: { marginTop: '8px' } });
    let tabOpen = false;
    const tblBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => { tabOpen = !tabOpen; if (tabOpen) showTruth(); else clear(analysis); tblBtn.textContent = tabOpen ? 'Hide truth table' : 'Show truth table'; } }, 'Show truth table');
    bar.append(runBtn,
      h('button', { type: 'button', class: 'btn sm', onclick: () => { if (running) setRun(false); tick(); } }, 'Step clock'),
      h('button', { type: 'button', class: 'btn sm', onclick: () => { setRun(false); resetStates(); } }, 'Reset'),
      LEGACY ? h('button', { type: 'button', class: 'btn sm', onclick: () => { App.pendingLab = { netlist: serialize() }; App.go('#/logic-lab'); } }, 'Open in Logic Lab') : null,
      !LEGACY && !opts.noTable ? tblBtn : null);
    const hasClk = () => hasClock();
    el.append(svg, waveBox, bar, status, analysis);
    const upd = () => { const seqC = comps.some((c) => isFF(c.type) || c.type === 'CLOCK'); runBtn.style.display = hasClk() ? '' : 'none'; bar.children[1].style.display = hasClk() ? '' : 'none'; bar.children[2].style.display = hasClk() ? '' : 'none'; tblBtn.style.display = seqC ? 'none' : ''; if (tabOpen) showTruth(); };
    const _load = load; load = (nl, k) => { _load(nl, k); upd(); };
  }
  root.append(el);
  if (opts.netlist) load(opts.netlist, true);
  else if (opts.preset) load(presetNetlist(opts.preset), true);
  else { settle(true); sample(); draw(); }
  return { el, load, serialize, buildExpr, setRun, get comps() { return comps; }, get wires() { return wires; }, settle, truthTable, addComp, connect };
}
