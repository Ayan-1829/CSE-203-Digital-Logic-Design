/* ===================== demos1.js : chapters 1-7 ===================== */
const DEMOS = {};
const panel = (title, sub, ...kids) => h('div', { class: 'demo', style: { marginBottom: '20px' } }, title ? h('h3', null, title) : null, sub ? h('p', { class: 'sub' }, sub) : null, ...kids);
const fld = (label, ...kids) => h('label', { class: 'fld' }, label, ...kids);
const powSup = (exp, base = '2') => h('span', null, base, h('sup', null, exp < 0 ? '−' + (-exp) : String(exp)));

/* Live block diagram: a labelled box with input lines on the left and output lines on the right,
   each line lit up (var(--hi)) when its value is 1, dimmed (var(--lo)) when 0. Lines flagged
   `accent` (control/enable lines, as opposed to data lines) are drawn in orange instead.
   `ctrls` (optional) are select-style lines entering from the BOTTOM with an upward arrow —
   the usual textbook way to set a MUX/DEMUX's select lines apart from its data lines. */
function blockDiagram(title, ins, outs, ctrls) {
  ctrls = ctrls || [];
  const rows = Math.max(ins.length, outs.length), boxW = 116, boxX = 148, boxY = 15, boxH = 34 * rows + 16;
  const boxBottom = boxY + boxH, ctrlH = ctrls.length ? 62 : 0;
  const W = 400, H = boxBottom + ctrlH + 15;
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, style: { width: '100%', maxWidth: `calc(${W} * var(--u))`, display: 'block', margin: '0 auto' }, role: 'img', 'aria-label': title + ' block diagram' });
  svg.append(sv('rect', { x: boxX, y: boxY, width: boxW, height: boxH, rx: 10, fill: 'var(--sheet)', stroke: 'var(--ink)', 'stroke-width': 2 }));
  const lines = title.split('\n');
  lines.forEach((line, i) => svg.append(sv('text', { x: boxX + boxW / 2, y: boxY + boxH / 2 + (i - (lines.length - 1) / 2) * 17 + 5, 'text-anchor': 'middle', class: 'lt', style: { fontWeight: 700, fontSize: '15px', fill: 'var(--ink)' } }, line)));
  const place = (arr, lineX1, lineX2, textX, anchor) => arr.forEach((it, i) => {
    const y = boxY + (i + 1) * (boxH / (arr.length + 1));
    const color = it.on ? (it.accent ? 'var(--accent)' : 'var(--hi)') : (it.accent ? 'var(--accent)' : 'var(--lo)');
    svg.append(sv('line', { x1: lineX1, x2: lineX2, y1: y, y2: y, stroke: color, 'stroke-width': it.on ? 3 : 2 }));
    svg.append(sv('text', { x: textX, y: y - 7, 'text-anchor': anchor, class: 'lt', style: { fontWeight: it.on ? 700 : 500, fill: it.accent ? 'var(--accent-ink)' : (it.on ? 'var(--ink)' : 'var(--ink-2)') } }, it.label));
  });
  place(ins, 24, boxX, 20, 'end');
  place(outs, boxX + boxW, W - 24, W - 20, 'start');
  ctrls.forEach((c, i) => {
    const x = boxX + (i + 1) * (boxW / (ctrls.length + 1)), yTip = boxBottom + 8, yBase = boxBottom + ctrlH - 8, color = c.on ? 'var(--accent)' : 'var(--lo)';
    svg.append(sv('line', { x1: x, y1: yBase, x2: x, y2: yTip + 8, stroke: color, 'stroke-width': c.on ? 3 : 2 }));
    svg.append(sv('polygon', { points: `${x},${yTip} ${x - 6},${yTip + 11} ${x + 6},${yTip + 11}`, fill: color }));
    svg.append(sv('text', { x, y: yBase + 13, 'text-anchor': 'middle', class: 'lt', style: { fontWeight: c.on ? 700 : 500, fill: c.on ? 'var(--accent-ink)' : 'var(--ink-2)' } }, c.label));
  });
  return svg;
}

/* ---------- gate explorer (used on Home and Chapter 3) ---------- */
function gateExplorer(root, opts = {}) {
  let type = opts.gate || 'AND', a = 0, b = 0;
  const gateBox = h('div', { class: 'scrollx', style: { minHeight: '64px' } });
  const ledA = led(0), body = h('div');
  const tt = h('div', { class: 'scrollx' });
  const swA = tsw('A', 0, (v) => { a = v; paint(); }), swB = tsw('B', 0, (v) => { b = v; paint(); });
  const gsel = seg(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'].map((g) => ({ v: g, l: g })), type, (v) => { type = v; paint(); });
  function paint() {
    const two = type !== 'NOT', out = gateEval(type, two ? [a, b] : [a]);
    swB.el.style.display = two ? '' : 'none';
    clear(gateBox); gateBox.append(gateSvg(type, { ins: two ? [a, b] : [a], out, scale: opts.small ? 1.1 : 1.5 }));
    ledA.set(out);
    const rows = two ? [[0, 0], [0, 1], [1, 0], [1, 1]] : [[0], [1]];
    clear(tt);
    tt.append(h('table', { class: 'tt' }, h('thead', null, h('tr', null, (two ? ['A', 'B'] : ['A']).map((x) => h('th', null, x)), h('th', null, 'Y'))),
      h('tbody', null, rows.map((r) => h('tr', { class: r[0] === a && (!two || r[1] === b) ? 'act' : '' }, r.map((x) => h('td', null, x)), h('td', null, gateEval(type, r)))))));
  }
  const top = h('div', { class: 'row', style: { marginBottom: '12px' } }, gsel.el);
  const io = h('div', { class: 'row', style: { gap: '20px', alignItems: 'center' } }, h('div', { class: 'row tight', style: { flexDirection: 'column', alignItems: 'flex-start' } }, swA.el, swB.el), gateBox, h('div', { class: 'row tight' }, ledA.el, h('span', { class: 'small muted' }, 'Y')));
  root.append(top, io, h('div', { class: 'gap' }, tt));
  paint();
}

/* ---------- Chapter 1 ---------- */
DEMOS[1] = (root) => {
  const N = 8, S = 16, bits = [1, 0, 1, 1, 0, 0, 1, 0];
  let amt = 0.25, mode = 'digital', noise = [];
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.9;
  const regen = () => { noise = range(N * S).map(gauss); };
  regen();
  const box = h('div', { class: 'scrollx' }), info = h('div', { class: 'out', style: { marginTop: '10px' } });
  function draw() {
    const W = 660, H = 230, x0 = 10, x1 = 650, Y = (v) => 205 - (v + 0.4) * (185 / 1.8), X = (i) => x0 + (i / (N * S - 1)) * (x1 - x0);
    const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Signal with noise', style: { width: '100%', maxWidth: `calc(${W} * var(--u))` } });
    const clean = range(N * S).map((i) => mode === 'digital' ? bits[Math.floor(i / S)] : 0.5 + 0.34 * Math.sin((i / (N * S)) * 2 * Math.PI * 2.2) + 0.14 * Math.sin((i / (N * S)) * 2 * Math.PI * 5.1));
    const noisy = clean.map((v, i) => v + noise[i] * amt * 1.7);
    const line = (arr, cls, style) => sv('polyline', { fill: 'none', 'stroke-width': cls, points: arr.map((v, i) => X(i) + ',' + Y(v)).join(' '), style });
    svg.append(sv('rect', { x: 0, y: 0, width: W, height: H, fill: 'var(--sheet-2)', rx: 6 }));
    let rec = [];
    if (mode === 'digital') {
      svg.append(sv('line', { x1: x0, x2: x1, y1: Y(0.5), y2: Y(0.5), stroke: 'var(--ink-3)', 'stroke-dasharray': '6 5' }), sv('text', { x: x1 - 4, y: Y(0.5) - 5, 'text-anchor': 'end', class: 'lt' }, 'decision threshold'));
      for (let b = 0; b <= N; b++) svg.append(sv('line', { x1: X(b * S - 0.5), x2: X(b * S - 0.5), y1: 10, y2: H - 10, stroke: 'var(--line)' }));
      rec = bits.map((_, b) => (noisy[b * S + S / 2] > 0.5 ? 1 : 0));
    }
    svg.append(line(clean, 3, { stroke: 'var(--ink-3)', opacity: 0.55 }), line(noisy, 2.4, { stroke: 'var(--hi)' }));
    if (mode === 'digital') {
      bits.forEach((bit, b) => {
        const si = b * S + S / 2, ok = rec[b] === bit;
        svg.append(sv('circle', { cx: X(si), cy: Y(noisy[si]), r: 5, fill: ok ? 'var(--ok)' : 'var(--bad)', stroke: 'var(--sheet)', 'stroke-width': 1.5 }));
      });
    }
    box.replaceChildren(svg);
    if (mode === 'digital') {
      const errs = rec.filter((v, i) => v !== bits[i]).length;
      const bitRowEl = (label, arr, against) => h('div', { class: 'row', style: { alignItems: 'center', gap: '10px', margin: '3px 0' } },
        h('span', { class: 'small muted', style: { width: '5.5em', flex: 'none' } }, label),
        h('div', { class: 'bits' }, arr.map((b, i) => h('div', { class: 'bit ro' + (b ? ' on' : '') + (against && against[i] !== b ? ' bad' : ''), 'aria-label': `bit ${i + 1}: ${b}` }, b))));
      info.replaceChildren(bitRowEl('Sent', bits), bitRowEl('Recovered', rec, bits),
        h('div', { class: 'sev sev-' + (errs === 0 ? 'ok' : errs === 1 ? 'low' : errs < 4 ? 'mid' : 'high') }, errs ? `${errs} bit${errs > 1 ? 's' : ''} wrong (marked orange above, same column as the sent bit). The dots mark each sample: an orange dot means that reading landed on the wrong side of the 0.5 threshold.` : 'All bits recovered exactly: every dot landed on the correct side of the threshold, so the noise disappeared.'));
    } else {
      const rms = Math.sqrt(clean.reduce((s, v, i) => s + (noisy[i] - v) ** 2, 0) / clean.length);
      const pct = (rms * 100).toFixed(1);
      const verdict = rms === 0
        ? ['ok', 'No noise added: the received signal is exactly the signal that was sent.', 'RMS error: 0% of full scale.']
        : rms < 0.05
          ? ['low', 'Slight distortion: the waveform still looks right, but every value is a little off.', `RMS error: ${pct}% of full scale. Small, but it cannot be removed, because nothing marks which part is noise.`]
          : rms < 0.15
            ? ['mid', 'Noticeable distortion: the shape is recognisable, but the exact values are lost.', `RMS error: ${pct}% of full scale. A receiver cannot tell the noise apart from the real signal, so the error is kept.`]
            : rms < 0.35
              ? ['high', 'Heavy distortion: the noise hides much of the original waveform.', `RMS error: ${pct}% of full scale. The true values cannot be recovered. Switch to Digital signal at this noise level to compare.`]
              : ['high', 'Severe distortion: what arrives is mostly noise.', `RMS error: ${pct}% of full scale. The original signal is effectively lost. At the same noise level, a digital signal usually still recovers most of its bits.`];
      info.replaceChildren(h('div', { class: 'sev sev-' + verdict[0] }, h('div', null, verdict[1]), h('div', null, verdict[2])));
    }
  }
  const range1 = h('input', { type: 'range', min: 0, max: 100, value: 25, 'aria-label': 'Noise level', oninput: (e) => { amt = e.target.value / 100; draw(); } });
  const m = seg([{ v: 'digital', l: 'Digital signal' }, { v: 'analog', l: 'Analog signal' }], mode, (v) => { mode = v; draw(); });
  const p1 = panel('Noise: analog vs. digital', 'Grey is the clean signal, blue is what arrives. In digital mode, the dot on each bit shows exactly where it was sampled against the threshold. Raise the noise and compare what each kind of signal can recover.',
    h('div', { class: 'row', style: { marginBottom: '10px' } }, m.el, fld('Noise level', range1), h('button', { type: 'button', class: 'btn sm', onclick: () => { regen(); draw(); } }, 'New noise')), box, info);
  draw();
  // byte toggler
  const dec = h('div', { class: 'out' });
  const br = bitRow(8, 65, (v) => upd(v), { label: 'Bit' });
  function upd(v) {
    dec.replaceChildren(h('div', null, 'Decimal ', h('b', null, v), '   Hex ', h('b', null, '0x' + v.toString(16).toUpperCase().padStart(2, '0')), '   Patterns in 8 bits: ', h('b', null, 256)),
      h('div', null, 'As an ASCII character: ', h('b', null, v >= 33 && v < 127 ? String.fromCharCode(v) : v === 32 ? '(space)' : '(non-printing)')));
  }
  const p2 = panel('Bits and bytes', 'Click the bits to build a byte. The same 8 bits can be a number or a character, depending on how a system reads them.', br.el, h('div', { class: 'gap' }, dec));
  upd(65);
  root.append(p1, p2);
};

/* ---------- Chapter 2 ---------- */
const DIG = '0123456789ABCDEF';
const BASE_NAME = { 2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal' };
function parseBase(str, base) {
  str = str.trim().toUpperCase(); if (!str) return { err: 'Type a number.' };
  let neg = false; if (str[0] === '-') { neg = true; str = str.slice(1); }
  const parts = str.split('.'); if (parts.length > 2) return { err: 'Only one point is allowed.' };
  const ip = parts[0], fp = parts[1] || '', ok = DIG.slice(0, base);
  for (const ch of ip + fp) if (!ok.includes(ch)) return { err: `"${ch}" is not a base-${base} digit.` };
  if (!ip && !fp) return { err: 'Type a number.' };
  let v = 0; for (const ch of ip) v = v * base + ok.indexOf(ch);
  let f = 0, w = 1 / base; for (const ch of fp) { f += ok.indexOf(ch) * w; w /= base; }
  if (v > 2 ** 40) return { err: 'That number is too large for this calculator.' };
  return { val: (v + f) * (neg ? -1 : 1), neg, ip: ip.replace(/^0+(?=.)/, ''), fp };
}
function toBase(val, base, maxFrac = 12) {
  const neg = val < 0; val = Math.abs(val); const ip = Math.floor(val); let fr = val - ip;
  let s = ip.toString(base).toUpperCase();
  if (fr > 1e-12) { s += '.'; let k = 0; while (fr > 1e-9 && k < maxFrac) { fr *= base; const d = Math.floor(fr + 1e-9); s += DIG[d]; fr -= d; k++; } }
  return (neg ? '-' : '') + s;
}
/* -- shared "how it's done" building blocks, reused by the calculator and the four one-way demos -- */
function divisionSteps(n, base) {
  let x = n; const rows = [];
  while (x > 0 && rows.length < 32) { const q = Math.floor(x / base), r = x % base; rows.push([`${x} ÷ ${base}`, q, DIG[r]]); x = q; }
  return rows;
}
function fracToBinarySteps(fr, maxBits = 12) {
  let f = fr; const rows = []; let bits = '';
  for (let k = 0; k < maxBits && f > 1e-9; k++) { f *= 2; const d = Math.floor(f + 1e-9); rows.push([k + 1, +f.toFixed(6), d]); bits += d; f -= d; }
  return { rows, bits };
}
/* one target's card: integer content on top, fraction content beneath it — left out entirely
   (not just noted as absent) whenever that target has no fractional part */
function targetCard(cardCls, intNode, fracNode, label, resultVal) {
  return h('div', { class: `conv-card ${cardCls}` },
    h('h4', { class: 'conv-card-title' }, '→ ', label),
    h('div', { class: 'conv-parts' },
      h('div', null, h('h5', { style: { margin: '0 0 6px' } }, 'Integer'), intNode),
      fracNode ? h('div', null, h('h5', { style: { margin: '0 0 6px' } }, 'Fraction'), fracNode) : null),
    h('p', { class: 'out fit', style: { marginTop: '10px' } }, `${label}: `, h('b', { class: 'mono' }, resultVal)));
}
/* show the target cards one at a time behind tabs, so a whole conversion fits on one screen.
   `st` keeps the chosen tab across re-runs (typing a new number keeps the same tab open). */
function cardTabs(cards, labels, st) {
  if (!(st.i < cards.length)) st.i = 0;
  const body = h('div'), tabs = h('div', { class: 'tabs', role: 'tablist' });
  const show = () => { body.replaceChildren(cards[st.i]); [...tabs.children].forEach((b, k) => { b.classList.toggle('on', k === st.i); b.setAttribute('aria-selected', String(k === st.i)); }); };
  labels.forEach((l, k) => tabs.append(h('button', { type: 'button', role: 'tab', onclick: () => { st.i = k; show(); } }, l)));
  show();
  return h('div', null, tabs, body);
}
/* repeated multiplication of a fraction by `base`: one row per digit, read top-down */
function fracSteps(fr, base, maxDigits = 8) {
  let f = fr; const rows = []; let digits = '';
  for (let k = 0; k < maxDigits && f > 1e-9; k++) { f *= base; const d = Math.floor(f + 1e-9); rows.push([`${+(f / base).toFixed(6)} × ${base}`, +f.toFixed(6), DIG[d]]); digits += DIG[d]; f -= d; }
  return { rows, digits };
}
/* if both bases are powers of one smaller base (2, 4, 8, 16 or 3, 9), return it and the two exponents */
function sharedRoot(a, b) {
  for (let r = 2; r <= 16; r++) {
    const pw = (x) => { let p = 0, y = 1; while (y < x) { y *= r; p++; } return y === x ? p : 0; };
    const p = pw(a), q = pw(b);
    if (p && q) return { r, p, q };
  }
  return null;
}
function decToBinaryBlock(iv, fr) {
  const ivBits = iv > 0 ? iv.toString(2) : '0';
  const fracInfo = fracToBinarySteps(fr);
  const intNode = iv === 0 ? h('p', { class: 'small muted' }, 'Integer part is 0.')
    : iv >= 1e6 ? h('p', { class: 'small muted' }, 'Too large to show every step.')
    : h('div', null, h('div', { class: 'scrollx' }, tableEl(['Division', 'Quotient', 'Remainder'], divisionSteps(iv, 2))),
        h('p', { class: 'small muted' }, 'Read the remainders from the bottom up: ', h('b', { class: 'mono' }, ivBits)));
  const fracNode = fr <= 1e-9 ? null : h('div', null, h('div', { class: 'scrollx' }, tableEl(['Step', '× 2', 'Bit'], fracInfo.rows)),
    h('p', { class: 'small muted' }, 'Read the bits from the top down: ', h('b', { class: 'mono' }, fracInfo.bits)));
  const node = targetCard('dec', intNode, fracNode, 'Binary', ivBits + (fracInfo.bits ? '.' + fracInfo.bits : ''));
  return { cards: [node], ivBits, fracBits: fracInfo.bits };
}
function groupTable(bits, size, padLeft) {
  if (!bits) return { node: h('p', { class: 'small muted' }, 'Nothing to group.'), digits: '' };
  const padLen = (size - (bits.length % size)) % size;
  const padded = padLeft ? '0'.repeat(padLen) + bits : bits + '0'.repeat(padLen);
  const groups = []; for (let i = 0; i < padded.length; i += size) groups.push(padded.slice(i, i + size));
  const rows = groups.map((g) => [g, parseInt(g, 2), DIG[parseInt(g, 2)]]);
  const digits = groups.map((g) => DIG[parseInt(g, 2)]).join('');
  return { node: h('div', null,
    padLen ? h('p', { class: 'small muted' }, `Pad with ${padLen} ${padLeft ? 'leading' : 'trailing'} zero${padLen > 1 ? 's' : ''}: `, h('code', null, padded)) : null,
    h('div', { class: 'scrollx' }, tableEl(['Group', 'Value', 'Digit'], rows)),
    h('p', { class: 'out fit' }, 'Result: ', h('b', { class: 'mono' }, digits))), digits };
}
function targetGroupCard(cardCls, label, ivBits, fracBits, size) {
  const gI = groupTable(ivBits, size, true), gF = fracBits ? groupTable(fracBits, size, false) : null;
  return targetCard(cardCls, gI.node, gF ? gF.node : null, label, gI.digits + (gF ? '.' + gF.digits : ''));
}
function binGroupBlock(ivBits, fracBits) {
  return { cards: [targetGroupCard('oct', 'Octal', ivBits, fracBits, 3), targetGroupCard('hex', 'Hex', ivBits, fracBits, 4)] };
}
function weightTable(bits, dir) {
  let sum = 0; const rows = [];
  for (let i = 0; i < bits.length; i++) { const exp = dir > 0 ? (bits.length - 1 - i) : -(i + 1); const bit = +bits[i], val = bit * Math.pow(2, exp); sum += val; rows.push([bit, powSup(exp), +val.toFixed(6)]); }
  return { node: h('div', null, h('div', { class: 'scrollx' }, tableEl(['Bit', 'Weight', 'Value'], rows)), h('p', { class: 'out fit' }, 'Sum = ', h('b', null, +sum.toFixed(6)))), sum };
}
function binToDecBlock(ivBits, fracBits) {
  const wI = ivBits === '0' ? { node: h('p', { class: 'small muted' }, 'Integer part is 0.'), sum: 0 } : weightTable(ivBits, 1);
  const wF = fracBits ? weightTable(fracBits, -1) : null;
  const node = targetCard('dec', wI.node, wF ? wF.node : null, 'Decimal', +(wI.sum + (wF ? wF.sum : 0)).toFixed(6));
  return { cards: [node], ivBits, fracBits };
}
function digitExpand(str, base, size) {
  const ok = DIG.slice(0, base);
  const rows = [...str].map((ch) => [ch, ok.indexOf(ch), bin(ok.indexOf(ch), size)]);
  return { rows, bits: rows.map((r) => r[2]).join('') };
}
function digitExpandBlock(ip, fp, base, size, toName, cardCls) {
  const iEx = digitExpand(ip || '0', base, size), fEx = fp ? digitExpand(fp, base, size) : null;
  const ivBits = iEx.bits.replace(/^0+(?=.)/, '') || '0', fracBits = fEx ? fEx.bits : '';
  const intNode = h('div', null, h('div', { class: 'scrollx' }, tableEl(['Digit', 'Value', toName], iEx.rows)), h('p', { class: 'out fit' }, 'Result: ', h('b', { class: 'mono' }, ivBits)));
  const fracNode = fEx ? h('div', null, h('div', { class: 'scrollx' }, tableEl(['Digit', 'Value', toName], fEx.rows)), h('p', { class: 'out fit' }, 'Result: ', h('b', { class: 'mono' }, fEx.bits))) : null;
  const node = targetCard(cardCls, intNode, fracNode, toName, ivBits + (fracBits ? '.' + fracBits : ''));
  return { cards: [node], ivBits, fracBits };
}
DEMOS[2] = (root) => {
  let base = 10, nb = 8;
  const inp = h('input', { type: 'text', value: '45.625', size: 16, 'aria-label': 'Number to convert', oninput: () => run() });
  const out = h('div'), signed = h('div');
  const bs = seg([{ v: 2, l: 'Binary' }, { v: 8, l: 'Octal' }, { v: 10, l: 'Decimal' }, { v: 16, l: 'Hex' }], 10, (v) => { base = v; run(); });
  const ns = seg([4, 8, 16].map((k) => ({ v: k, l: k + ' bits' })), 8, (v) => { nb = v; run(); });
  function run() {
    const r = parseBase(inp.value, base);
    clear(out); clear(signed);
    if (r.err) { out.append(h('p', { class: 'bad' }, r.err)); return; }
    const v = r.val;
    out.append(tableEl(['Base', 'Value'], [['Binary (2)', toBase(v, 2)], ['Octal (8)', toBase(v, 8)], ['Decimal (10)', toBase(v, 10)], ['Hexadecimal (16)', toBase(v, 16)]], 'doc'));
    const iv = Math.floor(Math.abs(v)), fr = Math.abs(v) - iv;
    // signed formats always use the integer part, even if the typed value has a fraction
    const sv = v < 0 ? -iv : iv;
    const lo = -(2 ** (nb - 1)), hi = 2 ** (nb - 1) - 1, mask = 2 ** nb;
    const rows = [];
    const inSM = iv <= hi, inTC = sv >= lo && sv <= hi;
    const sm = sv >= 0 ? bin(sv, nb) : '1' + bin(iv, nb - 1), oc = sv >= 0 ? bin(sv, nb) : bin(((mask - 1) - iv), nb), tc = bin(((sv % mask) + mask) % mask, nb);
    rows.push(['Sign-magnitude', inSM ? sm : 'out of range', `±${hi}`], ["1's complement", inSM ? oc : 'out of range', `±${hi}`], ["2's complement", inTC ? tc : 'out of range', `${lo} to ${hi}`]);
    signed.append(h('h4', { style: { margin: '14px 0 6px' } }, `Signed representations in ${nb} bits`),
      fr > 1e-9 ? h('p', { class: 'small muted' }, `(using the integer part, ${iv}, since signed formats hold whole numbers)`) : null,
      h('div', { class: 'scrollx' }, tableEl(['Format', 'Bits', 'Range'], rows)));
    const inGray = iv <= mask - 1;
    const bcd = String(iv).split('').map((d) => bin(+d, 4)).join(' ');
    signed.append(h('div', { class: 'out', style: { marginTop: '12px' } },
      h('div', null, 'BCD of ', h('b', null, iv), ': ', h('b', null, bcd)),
      h('div', null, `Gray code of ${iv} in ${nb} bits: `, inGray ? h('span', null, h('b', null, bin(iv, nb)), ' → ', h('b', null, bin(iv ^ (iv >> 1), nb))) : h('span', { class: 'bad' }, `${iv} does not fit in ${nb} bits`))));
  }
  const bcdOut = h('div');
  const ia = h('input', { type: 'number', min: 0, max: 99, value: 58, style: { width: '4.5em' }, 'aria-label': 'First BCD number', oninput: () => bcdRun() });
  const ib = h('input', { type: 'number', min: 0, max: 99, value: 27, style: { width: '4.5em' }, 'aria-label': 'Second BCD number', oninput: () => bcdRun() });
  function bcdRun() {
    const A = Math.max(0, Math.min(99, Math.floor(+ia.value || 0))), B = Math.max(0, Math.min(99, Math.floor(+ib.value || 0)));
    const da = [Math.floor(A / 10), A % 10], db = [Math.floor(B / 10), B % 10];
    let carry = 0; const rows = [], res = [], steps = [];
    for (let i = 1; i >= 0; i--) {
      const name = i === 1 ? 'Units' : 'Tens';
      const raw = da[i] + db[i] + carry, need = raw > 9;
      const fixed = need ? raw + 6 : raw; res[i] = fixed & 15; const cout = need ? 1 : 0;
      rows.push([name, bin(da[i], 4), bin(db[i], 4), carry, bin(raw, 5) + ` (${raw})`, need ? '+ 0110' : 'none', bin(fixed & 15, 4), cout]);
      steps.push(h('li', null,
        h('b', null, name, ': '), bin(da[i], 4), ' + ', bin(db[i], 4), carry ? ' + carry-in 1' : ' + carry-in 0',
        ' = ', bin(raw, 5), ` (decimal ${raw})`, '. ',
        need
          ? h('span', null, `${raw} is greater than 9, so this isn't a valid BCD digit — add 0110 (6) to skip the six unused codes: `, bin(raw, 5), ' + 0110 = ', bin(fixed, 6), `. Keep the low 4 bits as the digit (`, h('b', null, bin(fixed & 15, 4)), `) and carry 1 into the next digit.`)
          : h('span', null, `${raw} is 9 or less, so it's already a valid BCD digit — no correction needed, no carry out.`)));
      carry = cout;
    }
    const total = A + B;
    clear(bcdOut).append(
      h('details', { class: 'reveal', style: { margin: '0 0 10px' } }, h('summary', null, 'Why add 0110 (6)?'), h('p', { class: 'sub', style: { margin: '6px 0 0' } }, `Each decimal digit of A and B is stored in its own 4-bit BCD group. Add corresponding groups (plus any carry from the digit before), starting from the units. A 4-bit binary adder can only ever produce 0000–1111 (0–15), but BCD only uses 0000–1001 (0–9) — so whenever the raw sum lands in the unused range 10–15, or overflows past 15 into a carry, add 0110 (6) to jump over the six unused codes and back into a valid digit. That's exactly what pushes a carry into the next digit, the same way carrying works in ordinary decimal addition.`)),
      h('ol', { style: { margin: '0 0 12px', paddingLeft: '22px' } }, steps),
      h('div', { class: 'scrollx' }, tableEl(['Digit', 'A', 'B', 'Carry in', 'Binary sum', 'Correction', 'BCD digit', 'Carry out'], rows)),
      h('p', { class: 'out', style: { marginTop: '10px' } }, `${A} + ${B} = `, h('b', null, total), '  →  BCD ', h('b', null, (carry ? bin(1, 4) + ' ' : '') + res.map((d) => bin(d, 4)).join(' '))));
  }
  /* -- one-way demos: pick a starting base, convert into the other three, steps shown -- */
  function oneWayPanel(fromBase, defaultVal) {
    const inp2 = h('input', { type: 'text', value: defaultVal, size: 16, 'aria-label': `${BASE_NAME[fromBase]} number`, oninput: () => run2() });
    const out2 = h('div'), body2 = h('div'), tab = { i: 0 };
    function run2() {
      const r = parseBase(inp2.value, fromBase);
      clear(out2); clear(body2);
      if (r.err) { out2.append(h('p', { class: 'bad' }, r.err)); return; }
      const v = r.val, others = [2, 8, 10, 16].filter((b) => b !== fromBase);
      out2.append(h('p', { class: 'out conv-sum' }, others.map((b) => h('span', null, `${BASE_NAME[b]}: `, h('b', null, toBase(v, b))))));
      if (fromBase === 10) {
        const iv = Math.floor(Math.abs(v)), fr = Math.abs(v) - iv;
        const step1 = decToBinaryBlock(iv, fr), octHex = binGroupBlock(step1.ivBits, step1.fracBits);
        body2.append(h('h4', { style: { margin: '10px 0 6px' } }, 'Decimal to binary, octal and hex (binary first, by division — octal and hex then group those bits)'),
          cardTabs([...step1.cards, ...octHex.cards], ['1 · Binary', '2 · Octal', '2 · Hex'], tab));
      } else if (fromBase === 2) {
        const ivBits = r.ip || '0', fracBits = r.fp || '';
        const dec = binToDecBlock(ivBits, fracBits), octHex = binGroupBlock(ivBits, fracBits);
        body2.append(h('h4', { style: { margin: '10px 0 6px' } }, 'Binary to decimal, octal and hex'),
          cardTabs([...dec.cards, ...octHex.cards], ['Decimal', 'Octal', 'Hex'], tab));
      } else {
        const size = fromBase === 8 ? 3 : 4, srcCls = fromBase === 8 ? 'oct' : 'hex';
        const step1 = digitExpandBlock(r.ip, r.fp, fromBase, size, 'Binary', srcCls);
        const other = fromBase === 8 ? { size: 4, cls: 'hex', label: 'Hex' } : { size: 3, cls: 'oct', label: 'Octal' };
        const dec = binToDecBlock(step1.ivBits, step1.fracBits);
        const otherCard = targetGroupCard(other.cls, other.label, step1.ivBits, step1.fracBits, other.size);
        body2.append(h('h4', { style: { margin: '10px 0 6px' } }, `${BASE_NAME[fromBase]} to binary, decimal and ${other.label.toLowerCase()} (binary first, by expanding each digit — decimal and ${other.label.toLowerCase()} then come from those bits)`),
          cardTabs([...step1.cards, ...dec.cards, otherCard], ['1 · Binary', '2 · Decimal', '2 · ' + other.label], tab));
      }
    }
    return { inp: inp2, out: out2, body: body2, run: run2 };
  }
  /* -- any base to any base (2–16): through decimal, with the shortcut named when one exists -- */
  const baseOpts = (sel) => [...Array(15)].map((_, k) => h('option', { value: k + 2, selected: k + 2 === sel ? '' : null }, `Base ${k + 2}`));
  const anyInp = h('input', { type: 'text', value: '2012', size: 14, 'aria-label': 'Number to convert', oninput: () => anyRun() });
  const anyFrom = h('select', { 'aria-label': 'From base', onchange: () => anyRun() }, baseOpts(3));
  const anyTo = h('select', { 'aria-label': 'To base', onchange: () => anyRun() }, baseOpts(5));
  const anyOut = h('div');
  function anyRun() {
    const b1 = +anyFrom.value, b2 = +anyTo.value, r = parseBase(anyInp.value, b1);
    clear(anyOut);
    if (r.err) { anyOut.append(h('p', { class: 'bad' }, r.err)); return; }
    const sign = r.neg ? '−' : '', dec = Math.abs(r.val), iv = Math.floor(dec), fr = dec - iv;
    const fs = fracSteps(fr, b2), res = sign + (iv.toString(b2).toUpperCase()) + (fs.digits ? '.' + fs.digits : '');
    const decStr = sign + +dec.toFixed(8);
    const src = (r.ip || '0') + (r.fp ? '.' + r.fp : '');
    anyOut.append(h('p', { class: 'out conv-sum' }, h('span', null, h('b', null, sign + src), h('sub', null, b1), ' = ', h('b', null, decStr), h('sub', null, 10), ' = ', h('b', null, res), h('sub', null, b2))));
    // step 1: place values
    let step1;
    if (b1 === 10) step1 = h('p', { class: 'small muted' }, 'The number is already decimal, so there is nothing to do in this step.');
    else {
      const rows = [], ok = DIG.slice(0, b1);
      [...(r.ip || '0')].forEach((ch, k, a) => { const e = a.length - 1 - k; rows.push([ch, ok.indexOf(ch), powSup(e, String(b1)), +(ok.indexOf(ch) * b1 ** e).toFixed(8)]); });
      [...r.fp].forEach((ch, k) => { const e = -(k + 1); rows.push([ch, ok.indexOf(ch), powSup(e, String(b1)), +(ok.indexOf(ch) * b1 ** e).toFixed(8)]); });
      step1 = h('div', null, h('div', { class: 'scrollx' }, tableEl(['Digit', 'Value', 'Place value', 'Value × place'], rows)),
        h('p', { class: 'out fit' }, 'Add them: ', h('b', null, +dec.toFixed(8))));
    }
    // step 2: divide (integer part) and multiply (fraction) by the new base
    let step2;
    if (b2 === 10) step2 = h('p', { class: 'small muted' }, 'The target is decimal, so the answer is the result of step 1.');
    else step2 = h('div', { class: 'conv-parts' },
      h('div', null, h('h5', { style: { margin: '0 0 6px' } }, 'Integer'),
        iv === 0 ? h('p', { class: 'small muted' }, 'Integer part is 0.')
          : h('div', null, h('div', { class: 'scrollx' }, tableEl(['Division', 'Quotient', 'Remainder'], divisionSteps(iv, b2))),
            h('p', { class: 'small muted' }, 'Read the remainders from the bottom up: ', h('b', { class: 'mono' }, iv.toString(b2).toUpperCase())))),
      fs.rows.length ? h('div', null, h('h5', { style: { margin: '0 0 6px' } }, 'Fraction'),
        h('div', { class: 'scrollx' }, tableEl(['Multiply', 'Product', 'Digit'], fs.rows)),
        h('p', { class: 'small muted' }, 'Read the digits from the top down: ', h('b', { class: 'mono' }, fs.digits))) : null);
    anyOut.append(h('div', { class: 'dp any-steps' },
      h('div', { class: 'conv-card dec' }, h('h4', { class: 'conv-card-title' }, `Step 1 · base ${b1} → decimal`), step1),
      h('div', { class: 'conv-card hex' }, h('h4', { class: 'conv-card-title' }, `Step 2 · decimal → base ${b2}`), step2)));
    const sr = b1 !== b2 ? sharedRoot(b1, b2) : null;
    if (b1 === b2) anyOut.append(h('p', { class: 'note' }, 'Both bases are the same, so the number does not change.'));
    else if (sr) anyOut.append(h('p', { class: 'note' }, h('b', null, 'Shortcut: '),
      `${b1} and ${b2} are both powers of ${sr.r}, so you can skip decimal. `,
      sr.p === 1 ? `The digits are already base ${sr.r}` : `Write each base-${b1} digit as ${sr.p} base-${sr.r} digits`,
      sr.q === 1 ? '; that string is the answer: ' : `, then regroup them in blocks of ${sr.q} from the point: `,
      h('b', { class: 'mono' }, sign + toBase(dec, sr.r)), sr.q === 1 ? '' : [' → ', h('b', { class: 'mono' }, res)]));
  }
  const decP = oneWayPanel(10, '45.625'), binP = oneWayPanel(2, '101101.101'), octP = oneWayPanel(8, '55.5'), hexP = oneWayPanel(16, '2D.A');
  root.append(
    panel('Base-conversion calculator', 'Type a number, choose its base and read it in the others. Fractions work too.',
      h('div', { class: 'row', style: { marginBottom: '4px' } }, bs.el, inp, ns.el),
      h('p', { class: 'small muted', style: { marginBottom: '8px' } }, 'The bit width only sets the range for the signed formats and Gray code — e.g. 8 bits gives a two’s-complement range of −128 to +127.'),
      h('div', { class: 'cols calc-cols' }, out, signed)),
    panel('BCD adder', 'Add two decimal numbers (0–99) digit by digit. When a 4-bit sum exceeds 9, add 0110 and carry 1.',
      h('div', { class: 'row tight', style: { marginBottom: '10px' } }, ia, h('span', null, '+'), ib), bcdOut),
    panel('Decimal → binary, octal, hex', 'Type a decimal number and see it converted step by step.', h('div', { class: 'row conv-top' }, fld('Decimal', decP.inp), decP.out), decP.body),
    panel('Binary → decimal, octal, hex', 'Type a binary number (0s and 1s only) and see it converted step by step.', h('div', { class: 'row conv-top' }, fld('Binary', binP.inp), binP.out), binP.body),
    panel('Octal → binary, decimal, hex', 'Type an octal number (digits 0–7) and see it converted step by step.', h('div', { class: 'row conv-top' }, fld('Octal', octP.inp), octP.out), octP.body),
    panel('Hex → binary, decimal, octal', 'Type a hexadecimal number (digits 0–9, A–F) and see it converted step by step.', h('div', { class: 'row conv-top' }, fld('Hex', hexP.inp), hexP.out), hexP.body),
    panel('Any base → any base', 'Type a number, pick its base and the base you want. Digits above 9 are A–F, so bases 2 to 16 work, fractions too.',
      h('div', { class: 'row conv-top' }, fld('Number', anyInp), fld('From', anyFrom), fld('To', anyTo)), anyOut));
  run(); bcdRun(); decP.run(); binP.run(); octP.run(); hexP.run(); anyRun();
};

/* ---------- Chapter 3 ---------- */
DEMOS[3] = (root) => {
  const inp = h('input', { type: 'text', value: "AB + A'C + BC", size: 30, 'aria-label': 'Boolean expression', oninput: () => run() });
  const res = h('div'), inp2 = h('input', { type: 'text', value: "A'C + AB", size: 24, 'aria-label': 'Second expression', oninput: () => eq() }), eqOut = h('span', { class: 'mono' });
  const chips = ["AB + A'C + BC", '(A+B)(A+C)', "A + A'B", "(AB)'(A'+B)(B'+B)", 'A⊕B⊕C', "AB + A'B' + A'B"];
  function eq() {
    try { const a = parseExpr(inp.value), b = parseExpr(inp2.value); const same = equivalent(a, b); eqOut.className = 'mono ' + (same ? 'ok' : 'bad'); eqOut.textContent = same ? 'Equivalent: same truth table.' : 'Not equivalent.'; } catch (e) { eqOut.className = 'mono bad'; eqOut.textContent = e.message; }
  }
  let showC = false;
  function run() {
    clear(res);
    let ast; try { ast = parseExpr(inp.value); } catch (e) { res.append(h('p', { class: 'bad', role: 'alert' }, e.message)); return; }
    const vars = sortedVars(ast);
    if (vars.length > 6) { res.append(h('p', { class: 'bad' }, 'Use six variables or fewer.')); return; }
    const t = tableOf(ast, vars), m = minimize(vars, t);
    const lo = litCount(ast), ls = m.sop.expr === '0' || m.sop.expr === '1' ? 0 : m.sop.cover.reduce((s, p) => s + vars.length - pop(p.mask), 0);
    const rows = t.map((f, i) => [...vars.map((_, k) => (i >> (vars.length - 1 - k)) & 1), f]);
    const circ = h('div', { style: { marginTop: '12px' } });
    res.append(
      h('div', { class: 'dp tt-side' },
        h('div', null, h('h4', null, 'Truth table'), h('div', { class: 'scrollx', style: { maxHeight: '42vh', overflowY: 'auto' } }, tableEl([...vars, 'F'], rows))),
        h('div', null,
          h('h4', null, 'Results'),
          h('div', { class: 'out' },
            h('div', null, 'You typed:  ', h('b', null, astStr(ast)), ` (${lo} literals)`),
            h('div', null, 'Canonical SOP:  ', h('b', null, sigma(m.ones))),
            h('div', null, 'Canonical POS:  ', h('b', null, 'ΠM(' + m.zeros.join(', ') + ')')),
            h('div', null, 'Minimal SOP:  ', h('b', null, m.sop.expr)),
            h('div', null, 'Minimal POS:  ', h('b', null, m.pos.expr)),
            h('div', null, 'Dual:  ', h('b', null, astStr(dualAst(ast)))),
            h('div', null, 'Complement (DeMorgan):  ', h('b', null, astStr(nnf(ast, true))))),
          h('p', { class: 'small muted', style: { margin: '8px 0' } }, ls < lo ? `The minimal SOP uses ${ls} literals, ${lo - ls} fewer than what you typed.` : 'Your expression is already as small as the minimal SOP.'),
          h('div', { class: 'row tight' }, h('button', { type: 'button', class: 'btn sm pri', onclick: () => { showC = !showC; run(); } }, showC ? 'Hide the circuit' : 'Show minimal SOP as a circuit'), vars.length <= 4 ? h('a', { class: 'btn sm', href: '04-universal-gates-and-k-maps.html#s=14' }, 'Try it on a K-map') : null),
          circ)));
    if (showC) { try { createLab(circ, { compact: true, locked: true, netlist: layoutExpr(parseExpr(m.sop.expr)) }); } catch (e) { circ.append(h('p', { class: 'bad' }, e.message)); } }
    eq();
  }
  const cbar = h('div', { class: 'row tight', style: { marginBottom: '12px' } }, chips.map((c) => h('button', { type: 'button', class: 'btn sm', onclick: () => { inp.value = c; run(); } }, c)));
  const p1 = panel('Boolean expression simplifier', "Use letters for variables, + for OR, ⊕ for XOR, ' after a letter or bracket for NOT, and write AND by placing terms side by side. Or use the ·, + and ⊕ buttons.",
    cbar, h('div', { class: 'row', style: { marginBottom: '10px', alignItems: 'flex-end' } }, exprField('Expression', inp), exprField('Equivalent to another expression?', inp2), eqOut), res);
  const gp = panel('Gates: switches, symbols and LEDs', 'Pick a gate, flip its input switches and watch the output LED and the highlighted truth-table row.', h('div'));
  gateExplorer(gp.lastChild, { gate: 'AND' });
  root.append(p1, gp);
  run();
};

/* ---------- Chapter 4 ---------- */
DEMOS[4] = (root) => {
  const p = panel('Interactive K-map', 'Click cells to set 1, X or 0. Groups, prime implicants and the simplified expression update as you go. Try the examples in the list.', h('div'));
  mountKMap(p.lastChild, { n: 4 });
  root.append(p);
};

/* ---------- Chapter 5 ---------- */
DEMOS[5] = (root) => {
  let A = 11, B = 6, sub = 0;
  const box = h('div'), flags = h('div', { class: 'out', style: { marginTop: '12px' } });
  const ba = bitRow(4, A, (v) => { A = v; run(); }, { label: 'A bit', prefix: 'a' }), bb = bitRow(4, B, (v) => { B = v; run(); }, { label: 'B bit', prefix: 'b' });
  const ms = seg([{ v: 0, l: 'Add (M = 0)' }, { v: 1, l: 'Subtract (M = 1)' }], 0, (v) => { sub = v; run(); });
  const leds = { gt: led(0), eq: led(0), lt: led(0) };
  function run() {
    const M = sub, be = M ? (~B) & 15 : B; let c = M; const cs = [c], ss = [];
    for (let i = 0; i < 4; i++) { const a = (A >> i) & 1, b = (be >> i) & 1, s = a ^ b ^ c, co = (a & b) | (a & c) | (b & c); ss.push(s); c = co; cs.push(c); }
    const sum = ss.reduce((x, s, i) => x | (s << i), 0), cout = cs[4];
    const cell = (v, hl) => h('td', { class: hl ? 'hl' : '' }, v);
    const cols = [3, 2, 1, 0];
    clear(box).append(h('div', { class: 'scrollx' }, h('table', { class: 'tt' },
      h('thead', null, h('tr', null, h('th', null, ''), cols.map((i) => h('th', null, 'FA' + i)))),
      h('tbody', null,
        h('tr', null, h('th', null, 'A'), cols.map((i) => cell((A >> i) & 1))),
        h('tr', null, h('th', null, M ? "B ⊕ M (= B′)" : 'B ⊕ M (= B)'), cols.map((i) => cell((be >> i) & 1))),
        h('tr', null, h('th', null, 'Carry in'), cols.map((i) => cell(cs[i], cs[i]))),
        h('tr', null, h('th', null, 'Sum'), cols.map((i) => cell(ss[i], ss[i]))),
        h('tr', null, h('th', null, 'Carry out'), cols.map((i) => cell(cs[i + 1], cs[i + 1])))))));
    const sA = A >= 8 ? A - 16 : A, sB = B >= 8 ? B - 16 : B, sS = sum >= 8 ? sum - 16 : sum, ovf = cs[3] ^ cs[4];
    const bcdTxt = !M && A <= 9 && B <= 9 ? (() => { const raw = A + B; return `BCD check: ${bin(A, 4)} + ${bin(B, 4)} = ${bin(raw, 5)}` + (raw > 9 ? `, above 1001, so add 0110 → ${bin(raw + 6, 5)}, which is BCD digits 0001 ${bin((raw + 6) & 15, 4)}` : ', a valid BCD digit'); })() : '';
    clear(flags).append(
      h('div', null, 'Result bits ', h('b', null, bin(sum, 4)), '   Carry out ', h('b', null, cout)),
      h('div', null, 'Unsigned: ', h('b', null, A), M ? ' − ' : ' + ', h('b', null, B), ' = ', h('b', null, M ? (A - B) : (A + B)), M ? '' : ` (${cout ? 'carry set, 5th bit lost in 4 bits' : 'fits in 4 bits'})`, M ? (cout ? '   (no borrow)' : '   (borrow occurred)') : ''),
      h('div', null, "Signed (2's complement): ", h('b', null, sA), M ? ' − ' : ' + ', h('b', null, sB), ' → circuit gives ', h('b', null, sS), '   ', h('span', { class: ovf ? 'bad' : 'ok' }, ovf ? 'Overflow (carry into MSB ≠ carry out)' : 'No overflow')),
      bcdTxt ? h('div', { class: 'muted' }, bcdTxt) : '');
    leds.gt.set(A > B); leds.eq.set(A === B); leds.lt.set(A < B);
  }
  root.append(panel('4-bit adder / subtractor', 'Set A and B. In subtract mode the XOR gates invert B and the carry-in is 1, so the same adder computes A + B′ + 1.',
    h('div', { class: 'row', style: { gap: '26px', marginBottom: '14px' } }, fld('A', ba.el), fld('B', bb.el), fld('Mode', ms.el)), box, flags,
    h('div', { class: 'row', style: { marginTop: '14px' } }, h('b', { class: 'small' }, 'Magnitude comparator (unsigned)'), h('span', { class: 'row tight' }, leds.gt.el, 'A > B'), h('span', { class: 'row tight' }, leds.eq.el, 'A = B'), h('span', { class: 'row tight' }, leds.lt.el, 'A < B'))));
  run();
};

/* ---------- Chapter 6 ---------- */
DEMOS[6] = (root) => {
  const t = tabs([{ id: 'dec', label: 'Decoder' }, { id: 'enc', label: 'Encoder' }, { id: 'mux', label: 'Multiplexer' }, { id: 'dem', label: 'Demultiplexer' }], 'dec', (id, body) => {
    if (id === 'dec') {
      let n = 2, en = 1, val = 0;
      const outs = h('div', { class: 'row tight' }), eqn = h('div', { class: 'out', style: { marginTop: '10px' } }), inWrap = h('div'), diagram = h('div', { class: 'fig' });
      const sw = tsw('Enable', 1, (v) => { en = v; run(); });
      const ns = seg([{ v: 1, l: '1-to-2' }, { v: 2, l: '2-to-4' }, { v: 3, l: '3-to-8' }], 2, (v) => { n = v; val = 0; build(); });
      let br;
      function build() { br = bitRow(n, val, (v) => { val = v; run(); }, { label: 'Input' }); clear(inWrap).append(br.el); run(); }
      const names = () => 'ABC'.slice(0, n);
      function run() {
        clear(outs);
        for (let i = 0; i < (1 << n); i++) { const on = en && i === val, l = led(on); outs.append(h('div', { class: 'bitc' }, l.el, h('small', null, 'Y' + i))); }
        const nm = names().split(''), term = nm.map((v, i) => (((val >> (n - 1 - i)) & 1) ? v : v + "'")).join('');
        eqn.textContent = en ? `Input ${bin(val, n)} → Y${val} = ${term} = 1, all other outputs 0` : 'Enable = 0: every output is 0';
        const ins = nm.map((v, i) => ({ label: v, on: (val >> (n - 1 - i)) & 1 })).concat([{ label: 'EN', on: en, accent: true }]);
        const outsSpec = range(1 << n).map((i) => ({ label: 'Y' + i, on: en && i === val }));
        clear(diagram).append(blockDiagram(`${n}-to-${1 << n}\nDECODER`, ins, outsSpec));
      }
      body.append(h('p', { class: 'sub' }, `A decoder turns an n-bit code into one active line. Bit labels below run from the most significant bit (left) to bit 0.`), h('div', { class: 'row', style: { gap: '20px', marginBottom: '14px' } }, ns.el, sw.el), inWrap, diagram, h('div', { class: 'gap' }, outs), eqn);
      build();
    } else if (id === 'enc') {
      let bits = 3, mode = 'basic', ds = 0;
      const outEl = h('div', { class: 'out', style: { marginTop: '12px' } }), diagram = h('div', { class: 'fig' }), row = h('div', { class: 'row', style: { gap: '14px', flexWrap: 'wrap' } });
      const ms = seg([{ v: 'basic', l: 'Basic encoder' }, { v: 'prio', l: 'Priority encoder' }], 'basic', (v) => { mode = v; run(); });
      const ns = seg([{ v: 1, l: '2-to-1' }, { v: 2, l: '4-to-2' }, { v: 3, l: '8-to-3' }], 3, (v) => { bits = v; ds = 0; build(); });
      let sws;
      function build() {
        const N = 1 << bits;
        sws = range(N).map((i) => tsw('D' + i, 0, (v) => { ds = v ? ds | (1 << i) : ds & ~(1 << i); run(); }));
        clear(row).append(...sws.map((s) => s.el)); run();
      }
      function run() {
        const N = 1 << bits, act = range(N).filter((i) => (ds >> i) & 1);
        let code, note = '';
        if (mode === 'prio') { code = act.length ? act[act.length - 1] : 0; note = act.length ? `Highest active input is D${code}, so the output is ${bin(code, bits)}.` : 'No input is active, so V = 0 and the code is ignored.'; }
        else { code = act.reduce((a, i) => a | i, 0); note = act.length > 1 ? `More than one input is active. OR-ing the codes gives ${bin(code, bits)}, which is wrong. This is why priority encoders exist.` : act.length === 1 ? `Only D${act[0]} is active, so the output is ${bin(code, bits)}.` : 'No input is active.'; }
        outEl.replaceChildren(h('div', null, `${N}-to-${bits} encoder   `, bits > 1 ? `A${bits - 1}…A0` : 'A0', ' = ', h('b', null, bin(code, bits)), '   V = ', h('b', null, act.length ? 1 : 0)), h('div', { class: act.length > 1 && mode === 'basic' ? 'bad' : 'muted' }, note));
        const ins = range(N).map((i) => ({ label: 'D' + i, on: (ds >> i) & 1 }));
        const outsSpec = range(bits).map((b) => ({ label: 'A' + (bits - 1 - b), on: (code >> (bits - 1 - b)) & 1 })).concat([{ label: 'V', on: act.length ? 1 : 0, accent: true }]);
        clear(diagram).append(blockDiagram(`${N}-to-${bits}\nENCODER`, ins, outsSpec));
      }
      body.append(h('p', { class: 'sub' }, 'Turn on the data inputs. Try two at once in both modes.'), h('div', { class: 'row', style: { gap: '20px', marginBottom: '12px' } }, ns.el, ms.el), row, diagram, outEl);
      build();
    } else if (id === 'mux') {
      let bits = 2, s = 0, d = 0b0110;
      const outEl = h('div', { class: 'out', style: { marginTop: '12px' } }), y = led(0), diagram = h('div', { class: 'fig' }), row = h('div', { class: 'row', style: { gap: '14px', flexWrap: 'wrap' } }), selWrap = h('div');
      const ns = seg([{ v: 1, l: '2-to-1' }, { v: 2, l: '4-to-1' }, { v: 3, l: '8-to-1' }], 2, (v) => { bits = v; s = 0; d = 0; build(); });
      let ds;
      function build() {
        const N = 1 << bits;
        ds = range(N).map((i) => tsw('I' + i, (d >> i) & 1, (v) => { d = v ? d | (1 << i) : d & ~(1 << i); run(); }));
        clear(row).append(...ds.map((x) => x.el));
        clear(selWrap).append(bitRow(bits, s, (v) => { s = v; run(); }, { label: 'Select S', prefix: 'S' }).el);
        run();
      }
      function run() {
        const N = 1 << bits, o = (d >> s) & 1; y.set(o);
        outEl.replaceChildren(h('div', null, `Select = ${bin(s, bits)} → the output follows I${s}`), h('div', null, 'Y = ', h('b', null, `I${s} = ${o}`)));
        ds.forEach((x, i) => x.el.style.fontWeight = i === s ? '800' : '');
        const ins = range(N).map((i) => ({ label: 'I' + i, on: (d >> i) & 1 }));
        const ctrls = range(bits).map((b) => ({ label: 'S' + (bits - 1 - b), on: (s >> (bits - 1 - b)) & 1 }));
        clear(diagram).append(blockDiagram(`${N}-to-1\nMUX`, ins, [{ label: 'Y', on: o }], ctrls));
      }
      body.append(h('p', { class: 'sub' }, 'The select lines (entering the box from below) choose which data input reaches the output.'),
        h('div', { class: 'row', style: { gap: '20px', marginBottom: '12px' } }, ns.el), row, h('div', { class: 'row', style: { gap: '26px', marginTop: '12px' } }, fld('Select lines', selWrap), h('span', { class: 'row tight' }, y.el, h('b', null, 'Y'))), diagram, outEl);
      build();
    } else if (id === 'dem') {
      let bits = 2, s = 0, din = 1;
      const outs = h('div', { class: 'row tight' }), sw = tsw('Data input D', 1, (v) => { din = v; run(); }), diagram = h('div', { class: 'fig' }), selWrap = h('div');
      const ns = seg([{ v: 1, l: '1-to-2' }, { v: 2, l: '1-to-4' }, { v: 3, l: '1-to-8' }], 2, (v) => { bits = v; s = 0; build(); });
      function build() { clear(selWrap).append(bitRow(bits, s, (v) => { s = v; run(); }, { label: 'Select S', prefix: 'S' }).el); run(); }
      function run() {
        const N = 1 << bits; clear(outs);
        for (let i = 0; i < N; i++) { const l = led(i === s && din); outs.append(h('div', { class: 'bitc' }, l.el, h('small', null, 'Y' + i))); }
        const ins = [{ label: 'D', on: din }];
        const ctrls = range(bits).map((b) => ({ label: 'S' + (bits - 1 - b), on: (s >> (bits - 1 - b)) & 1 }));
        const outsSpec = range(N).map((i) => ({ label: 'Y' + i, on: i === s && din }));
        clear(diagram).append(blockDiagram(`1-to-${N}\nDEMUX`, ins, outsSpec, ctrls));
      }
      body.append(h('p', { class: 'sub' }, 'The single data input is routed to the output chosen by the select lines (entering from below). Every other output stays 0.'),
        h('div', { class: 'row', style: { gap: '20px', marginBottom: '14px' } }, ns.el, sw.el), selWrap, diagram, outs);
      build();
    }
  });
  root.append(panel('Select-line simulation', 'Choose a circuit, then flip inputs and select lines.', t.el));
};

/* ---------- Chapter 7 ---------- */
DEMOS[7] = (root) => {
  const TYPES = [{ v: 'srl', l: 'SR latch (gated)' }, { v: 'dl', l: 'D latch' }, { v: 'srff', l: 'SR flip-flop' }, { v: 'dff', l: 'D flip-flop' }, { v: 'jkff', l: 'JK flip-flop' }, { v: 'tff', l: 'T flip-flop' }];
  let type = 'dff', q = 0, prev = 0, clk = 0, auto = false, step = 0, timer = null;
  const inp = { S: 0, R: 0, D: 0, J: 0, K: 0, T: 0 }, hist = { CLK: [], Q: [] };
  Object.keys(inp).forEach((k) => { hist[k] = []; });
  const wave = h('div', { class: 'scrollx' }), stat = h('div', { class: 'out', style: { marginTop: '10px' } }), ctl = h('div', { class: 'row', style: { gap: '16px' } }), tbl = h('div', { class: 'scrollx', style: { marginTop: '12px' } });
  const clkSw = tsw('CLK', 0, (v) => { if (!auto) { clk = v; } });
  const pinsOf = (t) => ({ srl: ['S', 'R'], srff: ['S', 'R'], dl: ['D'], dff: ['D'], jkff: ['J', 'K'], tff: ['T'] }[t]);
  const isLatch = () => type === 'srl' || type === 'dl';
  function buildCtl() {
    clear(ctl); pinsOf(type).forEach((k) => { const s = tsw(k, inp[k], (v) => { inp[k] = v; }); ctl.append(s.el); }); ctl.append(clkSw.el);
  }
  function compute() {
    const rise = clk && !prev, act = isLatch() ? clk : rise, note = [];
    let inv = false;
    if (act) {
      if (type === 'srl' || type === 'srff') { if (inp.S && inp.R) { q = null; inv = true; } else if (inp.S) q = 1; else if (inp.R) q = 0; }
      else if (type === 'dl' || type === 'dff') q = inp.D;
      else if (type === 'jkff') { if (q === null) q = inp.J && !inp.K ? 1 : (!inp.J && inp.K ? 0 : null); else q = inp.J && inp.K ? q ^ 1 : inp.J ? 1 : inp.K ? 0 : q; }
      else if (type === 'tff') { if (q !== null && inp.T) q ^= 1; else if (q === null && inp.T) q = null; }
    }
    prev = clk; return { inv, act };
  }
  function tick() {
    if (auto) { clk = (step % 4) < 2 ? 1 : 0; clkSw.set(clk, true); }
    const r = compute();
    hist.CLK.push(clk); pinsOf(type).forEach((k) => hist[k].push(inp[k])); hist.Q.push(q === null ? undefined : q);
    Object.keys(hist).forEach((k) => { if (hist[k].length > 24) hist[k].shift(); });
    step++;
    const traces = [{ name: 'CLK', data: hist.CLK }, ...pinsOf(type).map((k) => ({ name: k, data: hist[k] })), { name: 'Q', data: hist.Q }];
    clear(wave).append(waveSvg(traces, { n: 24, step: 26, labelW: 44 }));
    stat.replaceChildren(h('div', null, `Q = `, h('b', null, q === null ? '? (invalid)' : q), `   Q′ = `, h('b', null, q === null ? '?' : q ^ 1)), h('div', { class: r.inv ? 'bad' : 'muted' }, r.inv ? 'S = R = 1 is the invalid input. The output is undefined.' : r.act ? (isLatch() ? 'Clock is high: a latch is transparent, so Q follows its inputs now.' : 'Rising edge: the flip-flop just sampled its inputs.') : (isLatch() ? 'Clock is low: the latch holds its value.' : 'No rising edge: the flip-flop holds its value.')));
    showTable();
  }
  function showTable() {
    const rows = { srl: [['0', '0', 'Hold'], ['0', '1', 'Reset (Q = 0)'], ['1', '0', 'Set (Q = 1)'], ['1', '1', 'Invalid']], dl: [['0', '', 'Q = 0'], ['1', '', 'Q = 1']], jkff: [['0', '0', 'Hold'], ['0', '1', 'Reset'], ['1', '0', 'Set'], ['1', '1', 'Toggle']], tff: [['0', '', 'Hold'], ['1', '', 'Toggle']] };
    rows.srff = rows.srl; rows.dff = rows.dl;
    const ks = pinsOf(type), cur = ks.map((k) => String(inp[k]));
    clear(tbl).append(h('table', { class: 'tt' }, h('thead', null, h('tr', null, ks.map((k) => h('th', null, k)), h('th', null, isLatch() ? 'Operation while CLK = 1' : 'Operation at rising edge'))),
      h('tbody', null, rows[type].map((r) => h('tr', { class: r.slice(0, ks.length).join('|') === cur.join('|') ? 'act' : '' }, r.slice(0, ks.length).map((x) => h('td', null, x)), h('td', null, r[2]))))));
  }
  function reset() { q = 0; prev = 0; clk = 0; step = 0; clkSw.set(0, true); Object.keys(hist).forEach((k) => { hist[k] = []; }); tick(); }
  const ts = seg(TYPES, type, (v) => { type = v; q = 0; Object.keys(hist).forEach((k) => { hist[k] = []; }); buildCtl(); tick(); });
  const cm = seg([{ v: 0, l: 'Manual clock' }, { v: 1, l: 'Auto clock' }], 0, (v) => { auto = !!v; clkSw.el.style.opacity = auto ? 0.5 : 1; });
  let running = false;
  const runBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => { running = !running; runBtn.textContent = running ? 'Pause' : 'Run'; runBtn.classList.toggle('on', running); clearInterval(timer); if (running) timer = setInterval(tick, 550); } }, 'Run');
  App.onCleanup(() => clearInterval(timer));
  root.append(panel('Clock and timing-diagram simulator', 'Each step is one time unit. Set the inputs, then press Step (or Run). With the manual clock, flip CLK yourself. Try this: with a D latch, raise CLK, then change D while CLK is high. Repeat with a D flip-flop.',
    h('div', { class: 'row', style: { marginBottom: '12px' } }, ts.el), h('div', { class: 'row', style: { marginBottom: '12px' } }, cm.el, h('button', { type: 'button', class: 'btn sm pri', onclick: tick }, 'Step'), runBtn, h('button', { type: 'button', class: 'btn sm', onclick: () => reset() }, 'Reset')),
    ctl, h('div', { class: 'gap' }, wave), stat, tbl));
  buildCtl(); tick();
};

/* ===================== demos2.js : chapters 8-13 ===================== */

/* ---------- Chapter 8: FSM ---------- */
function buildMachine(kind, overlap) {
  if (kind === 'moore') {
    return { kind, st: ['S0', 'S1', 'S2', 'S3'], nx: { S0: ['S0', 'S1'], S1: ['S2', 'S1'], S2: ['S0', 'S3'], S3: overlap ? ['S2', 'S1'] : ['S0', 'S1'] }, out: { S0: 0, S1: 0, S2: 0, S3: 1 },
      pos: { S0: [70, 115], S1: [225, 45], S2: [225, 190], S3: [385, 115] }, desc: { S0: 'nothing useful seen', S1: 'last bit was 1', S2: 'last two bits were 10', S3: 'saw 101' } };
  }
  return { kind, st: ['S0', 'S1', 'S2'], nx: { S0: ['S0', 'S1'], S1: ['S2', 'S1'], S2: ['S0', overlap ? 'S1' : 'S0'] }, out: { S0: [0, 0], S1: [0, 0], S2: [0, 1] },
    pos: { S0: [70, 115], S1: [240, 45], S2: [240, 190] }, desc: { S0: 'nothing useful seen', S1: 'last bit was 1', S2: 'last two bits were 10' } };
}
DEMOS[8] = (root) => {
  let kind = 'moore', overlap = true, M = buildMachine(kind, overlap), cur = 'S0', last = null, stream = [];
  const dia = h('div', { class: 'scrollx' }), strm = h('div', { class: 'row tight', style: { minHeight: '38px', margin: '10px 0' } }), tbl = h('div'), eqs = h('div');
  function edges() {
    const map = {};
    M.st.forEach((s) => [0, 1].forEach((x) => { const to = M.nx[s][x], key = s + '>' + to; const lab = M.kind === 'moore' ? String(x) : `${x}/${M.out[s][x]}`; (map[key] = map[key] || { from: s, to, labs: [] }).labs.push(lab); }));
    return Object.values(map);
  }
  function draw() {
    const R = 25, svg = sv('svg', { viewBox: '-34 -50 504 310', role: 'img', 'aria-label': 'State diagram', style: { width: '100%', maxWidth: 'calc(504 * var(--u))' } });
    const all = edges(), has = (a, b) => all.some((e) => e.from === a && e.to === b);
    all.forEach((e) => {
      const hot = last && last.from === e.from && last.to === e.to, [x1, y1] = M.pos[e.from], [x2, y2] = M.pos[e.to];
      const stroke = hot ? 'var(--hi)' : 'var(--ink-3)', sw = hot ? 3.4 : 2, label = e.labs.join(', ');
      let d, lx, ly, tip;
      if (e.from === e.to) {
        const up = y1 < 100 ? -1 : 1; d = `M${x1 - 11},${y1 + up * 23} C${x1 - 42},${y1 + up * 78} ${x1 + 42},${y1 + up * 78} ${x1 + 11},${y1 + up * 23}`; lx = x1; ly = y1 + up * 70 + (up > 0 ? 12 : -4); tip = [x1 + 11, y1 + up * 23, x1 + 11 - (x1 + 42), y1 + up * 23 - (y1 + up * 78)];
        if (e.from === 'S0') { d = `M${x1 - 23},${y1 - 10} C${x1 - 80},${y1 - 40} ${x1 - 80},${y1 + 40} ${x1 - 23},${y1 + 10}`; lx = x1 - 72; ly = y1 + 4; tip = [x1 - 23, y1 + 10, -23 + 80, 10 - 40 + 0]; tip[2] = (x1 - 23) - (x1 - 80); tip[3] = 10 - 40; }
      } else {
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, off = has(e.to, e.from) ? 34 : 0;
        const cx = (x1 + x2) / 2 - uy * off, cy = (y1 + y2) / 2 + ux * off;
        const s0 = [x1, y1], t0 = [x2, y2], dirS = [cx - x1, cy - y1], dirT = [cx - x2, cy - y2], ls = Math.hypot(...dirS), lt = Math.hypot(...dirT);
        const sx = s0[0] + dirS[0] / ls * R, sy = s0[1] + dirS[1] / ls * R, ex = t0[0] + dirT[0] / lt * (R + 3), ey = t0[1] + dirT[1] / lt * (R + 3);
        d = `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`; tip = [ex, ey, ex - cx, ey - cy];
        lx = 0.25 * sx + 0.5 * cx + 0.25 * ex - uy * 13; ly = 0.25 * sy + 0.5 * cy + 0.25 * ey + ux * 13;
      }
      const tl = Math.hypot(tip[2], tip[3]) || 1, ux2 = tip[2] / tl, uy2 = tip[3] / tl, bx = tip[0] - ux2 * 11, by = tip[1] - uy2 * 11;
      svg.append(sv('path', { d, fill: 'none', stroke, 'stroke-width': sw }), sv('polygon', { points: `${tip[0]},${tip[1]} ${bx - uy2 * 5.5},${by + ux2 * 5.5} ${bx + uy2 * 5.5},${by - ux2 * 5.5}`, fill: stroke }), sv('text', { x: lx, y: ly + 5, 'text-anchor': 'middle', class: 'lt m', style: { fontSize: '17px', fill: hot ? 'var(--hi)' : 'var(--ink-2)' } }, label));
    });
    M.st.forEach((s) => {
      const [x, y] = M.pos[s], on = s === cur;
      svg.append(sv('circle', { cx: x, cy: y, r: R, fill: on ? 'var(--hi)' : 'var(--sheet)', stroke: 'var(--ink)', 'stroke-width': 2.2 }),
        sv('text', { x, y: y + 7, 'text-anchor': 'middle', class: 'lt big', style: { fontSize: '19px', fill: on ? '#fff' : 'var(--ink)' } }, s));
      if (M.kind === 'moore') svg.append(sv('text', { x, y: y + R + 18, 'text-anchor': 'middle', class: 'lt m', style: { fontSize: '16px' } }, 'y=' + M.out[s]));
    });
    clear(dia).append(svg);
  }
  function tables() {
    const n = M.st.length, nf = clog2(n), code = (s) => M.st.indexOf(s);
    const rows = M.st.map((s) => [`${s}  (${bin(code(s), nf)})`, M.nx[s][0], M.nx[s][1], M.kind === 'moore' ? M.out[s] : `${M.out[s][0]} / ${M.out[s][1]}`]);
    clear(tbl).append(h('h4', { style: { margin: '14px 0 6px' } }, 'State table and state assignment'), h('div', { class: 'scrollx' }, tableEl(['Present state (code)', 'Next, x = 0', 'Next, x = 1', M.kind === 'moore' ? 'Output y' : 'Output y (x=0 / x=1)'], rows)),
      h('p', { class: 'small muted' }, `${n} states need ⌈log₂${n}⌉ = ${nf} flip-flops (A is the most significant state bit).`));
    // D equations
    const vars = ['A', 'B', 'X'], size = 8, fnBit = (bit) => range(size).map((i) => { const c = i >> 1, x = i & 1; if (c >= n) return 2; const to = code(M.nx[M.st[c]][x]); return (to >> bit) & 1; });
    const fA = minimize(vars, fnBit(1)), fB = minimize(vars, fnBit(0));
    let fy;
    if (M.kind === 'moore') { const t = range(4).map((c) => (c < n ? M.out[M.st[c]] : 2)); fy = minimize(['A', 'B'], t); }
    else fy = minimize(vars, range(size).map((i) => { const c = i >> 1, x = i & 1; return c >= n ? 2 : M.out[M.st[c]][x]; }));
    clear(eqs).append(h('h4', { style: { margin: '14px 0 6px' } }, 'Design with two D flip-flops (equations derived by K-map minimisation)'),
      h('div', { class: 'out' }, h('div', null, 'D_A = ', h('b', null, fA.sop.expr)), h('div', null, 'D_B = ', h('b', null, fB.sop.expr)), h('div', null, 'y = ', h('b', null, fy.sop.expr))),
      h('p', { class: 'small muted' }, n < 4 ? 'The unused state 11 is treated as a don’t-care, which is what keeps these equations short. A real design should also check that state 11 returns to a valid state.' : 'All four codes are used, so there are no unused states.'));
  }
  function paintStream() {
    clear(strm);
    if (!stream.length) strm.append(h('span', { class: 'muted small' }, 'Press 0 or 1 to feed input bits.'));
    stream.forEach((s) => strm.append(h('span', { class: 'bit ro' + (s.y ? ' on' : ''), title: s.y ? 'Output y = 1: pattern 101 detected' : 'y = 0' }, s.x)));
    if (stream.length) strm.append(h('span', { class: 'small ' + (stream[stream.length - 1].y ? 'ok' : 'muted') }, stream[stream.length - 1].y ? 'Detected 101 (output 1).' : 'Output y = 0.'));
  }
  function feed(x) {
    const from = cur, to = M.nx[cur][x], y = M.kind === 'moore' ? M.out[to] : M.out[cur][x];
    cur = to; last = { from, to }; stream.push({ x, y }); if (stream.length > 16) stream.shift(); draw(); paintStream();
  }
  function rebuild() { M = buildMachine(kind, overlap); cur = 'S0'; last = null; stream = []; draw(); paintStream(); tables(); }
  const ks = seg([{ v: 'moore', l: 'Moore machine (4 states)' }, { v: 'mealy', l: 'Mealy machine (3 states)' }], 'moore', (v) => { kind = v; rebuild(); });
  const os = seg([{ v: 1, l: 'Overlapping' }, { v: 0, l: 'Non-overlapping' }], 1, (v) => { overlap = !!v; rebuild(); });
  root.append(panel('Sequence detector: 101', 'Feed bits into the machine and watch the current state and the transition taken. Moore outputs sit on states (y=…), Mealy outputs sit on the arrows (input/output). Try 1 0 1 0 1 in both overlap modes.',
    h('div', { class: 'row', style: { marginBottom: '8px' } }, ks.el, os.el),
    // diagram (with the design equations under it) beside the controls and state table, so the
    // whole detector fits one screen instead of stacking
    h('div', { class: 'cols sim-cols' },
      h('div', null, dia, eqs),
      h('div', null,
        h('div', { class: 'row tight' }, h('button', { type: 'button', class: 'btn pri', onclick: () => feed(0) }, 'Input 0'), h('button', { type: 'button', class: 'btn pri', onclick: () => feed(1) }, 'Input 1'),
          h('button', { type: 'button', class: 'btn sm', onclick: () => { [1, 0, 1, 0, 1].forEach(feed); } }, 'Feed 1 0 1 0 1'), h('button', { type: 'button', class: 'btn sm', onclick: () => { cur = 'S0'; last = null; stream = []; draw(); paintStream(); } }, 'Reset')),
        strm, tbl))));
  rebuild();
};

/* ---------- Chapter 9: counters ---------- */
DEMOS[9] = (root) => {
  let mode = 'up', nb = 3, N = 6, up = 1, cnt = 0, bits = [1, 0, 0, 0], running = false, timer = null, half = 600, ticks = 0;
  const hist = { clk: [], q: [[], [], [], []] };
  const led0 = h('div', { class: 'row tight', style: { gap: '14px' } }), info = h('div', { class: 'out', style: { marginTop: '10px' } }), wave = h('div', { class: 'scrollx', style: { marginTop: '10px' } }), seqBox = h('div', { class: 'row tight', style: { marginTop: '10px' } });
  const width = () => (mode === 'ring' || mode === 'johnson' ? 4 : mode === 'mod' ? Math.max(1, clog2(N)) : nb);
  const cur = () => (mode === 'ring' || mode === 'johnson' ? bits.slice() : range(width()).map((i) => (cnt >> (width() - 1 - i)) & 1));
  function reset() { cnt = 0; bits = mode === 'ring' ? [1, 0, 0, 0] : [0, 0, 0, 0]; ticks = 0; hist.clk = []; hist.q = [[], [], [], []]; paint(); }
  function next() {
    if (mode === 'up') cnt = (cnt + 1) % (1 << nb);
    else if (mode === 'down') cnt = (cnt - 1 + (1 << nb)) % (1 << nb);
    else if (mode === 'updown') cnt = (cnt + (up ? 1 : -1) + (1 << nb)) % (1 << nb);
    else if (mode === 'mod') cnt = (cnt + 1) % N;
    else if (mode === 'ring') bits = [bits[3], bits[0], bits[1], bits[2]];
    else bits = [1 - bits[3], bits[0], bits[1], bits[2]];
  }
  function tick() {
    next(); ticks++;
    const b = cur(), w = b.length;
    [1, 0].forEach((c) => { hist.clk.push(c); for (let i = 0; i < 4; i++) hist.q[i].push(i < w ? b[w - 1 - i] : undefined); });
    Object.keys(hist).forEach(() => { });
    while (hist.clk.length > 24) { hist.clk.shift(); hist.q.forEach((a) => a.shift()); }
    paint();
  }
  function paint() {
    const b = cur(), w = b.length, val = b.reduce((a, v) => (a << 1) | v, 0);
    clear(led0); b.forEach((v, i) => { const l = led(v); led0.append(h('div', { class: 'bitc' }, l.el, h('small', null, 'Q' + (w - 1 - i)))); });
    let extra = '';
    if (mode === 'mod') extra = `MOD-${N} uses ${N} of ${1 << w} states, so ${(1 << w) - N} are unused (truncated). Reset when the count reaches ${N}.`;
    else if (mode === 'ring') extra = 'Ring counter: 4 flip-flops, 4 states, a single 1 circulates. Output frequency f/4.';
    else if (mode === 'johnson') extra = 'Johnson counter: 4 flip-flops, 8 states. The complement of the last stage feeds the first. Output frequency f/8.';
    else extra = mode === 'down' ? 'Down counter: the count decreases by 1 each clock and wraps from 0 to the maximum.' : mode === 'updown' ? 'Up/down counter: the control input selects the direction.' : 'Binary up counter. Ripple version: each stage clocks the next (delay accumulates). Synchronous version: one shared clock, T inputs from AND gates.';
    const div = (mode === 'ring' || mode === 'johnson' || mode === 'mod') ? '' : range(w).map((k) => `Q${k}: f/${2 ** (k + 1)}`).join('    ');
    info.replaceChildren(h('div', null, 'State ', h('b', null, b.join('')), '   decimal ', h('b', null, mode === 'ring' || mode === 'johnson' ? '-' : val), '   clock pulses ', h('b', null, ticks)), div ? h('div', { class: 'muted' }, 'Frequency division  ' + div) : '', h('div', { class: 'muted' }, extra));
    const tr = [{ name: 'CLK', data: hist.clk }]; for (let i = Math.min(w, 4) - 1; i >= 0; i--) tr.push({ name: 'Q' + i, data: hist.q[i] });
    clear(wave).append(waveSvg(tr, { n: 24, step: 24, labelW: 40 }));
    // sequence chips
    clear(seqBox);
    if (mode === 'ring' || mode === 'johnson') { const seq = []; let t = mode === 'ring' ? [1, 0, 0, 0] : [0, 0, 0, 0]; for (let i = 0; i < (mode === 'ring' ? 4 : 8); i++) { seq.push(t.join('')); t = mode === 'ring' ? [t[3], t[0], t[1], t[2]] : [1 - t[3], t[0], t[1], t[2]]; } seq.forEach((s) => seqBox.append(h('span', { class: 'btn sm' + (s === b.join('') ? ' on' : ''), style: { cursor: 'default' } }, s))); }
    else { const total = mode === 'mod' ? N : 1 << nb; range(total).forEach((i) => seqBox.append(h('span', { class: 'btn sm' + (i === val ? ' on' : ''), style: { cursor: 'default', minWidth: '38px' } }, i))); }
  }
  const modes = seg([{ v: 'up', l: 'Up' }, { v: 'down', l: 'Down' }, { v: 'updown', l: 'Up/down' }, { v: 'mod', l: 'MOD-N' }, { v: 'ring', l: 'Ring' }, { v: 'johnson', l: 'Johnson' }], 'up', (v) => { mode = v; opt(); reset(); });
  const nbs = seg([2, 3, 4].map((k) => ({ v: k, l: k + ' bits' })), 3, (v) => { nb = v; reset(); });
  const Nin = h('input', { type: 'range', min: 2, max: 16, value: 6, 'aria-label': 'Modulus N', oninput: (e) => { N = +e.target.value; Nl.textContent = 'N = ' + N; reset(); } }), Nl = h('span', { class: 'mono' }, 'N = 6');
  const upsw = tsw('UP', 1, (v) => { up = v; paint(); });
  const optBox = h('div', { class: 'row', style: { gap: '18px' } });
  function opt() {
    clear(optBox);
    if (['up', 'down', 'updown'].includes(mode)) optBox.append(nbs.el);
    if (mode === 'updown') optBox.append(upsw.el);
    if (mode === 'mod') optBox.append(fld('Modulus', h('span', { class: 'row tight' }, Nin, Nl)));
  }
  const runBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => { running = !running; runBtn.textContent = running ? 'Pause clock' : 'Run clock'; runBtn.classList.toggle('on', running); clearInterval(timer); if (running) timer = setInterval(tick, half); } }, 'Run clock');
  const spd = h('input', { type: 'range', min: 150, max: 1300, value: 700, 'aria-label': 'Clock speed', oninput: (e) => { half = 1450 - e.target.value; if (running) { clearInterval(timer); timer = setInterval(tick, half); } } });
  App.onCleanup(() => clearInterval(timer));
  root.append(panel('Live counter simulation', 'Pick a counter, then pulse the clock. The LEDs show the flip-flop outputs and the timing diagram shows how each output divides the clock.',
    h('div', { class: 'row', style: { marginBottom: '12px' } }, modes.el), optBox,
    h('div', { class: 'row', style: { margin: '14px 0' } }, h('button', { type: 'button', class: 'btn sm pri', onclick: tick }, 'Clock pulse'), runBtn, fld('Speed', spd), h('button', { type: 'button', class: 'btn sm', onclick: reset }, 'Reset')),
    led0, info, seqBox, wave));
  opt(); reset();
};

/* ---------- Chapter 10: registers ---------- */
DEMOS[10] = (root) => {
  const t = tabs([{ id: 'shift', label: 'Shift register' }, { id: 'rtl', label: 'Register transfer' }], 'shift', (id, body) => {
    if (id === 'shift') {
      let reg = 0, data = 0b10110010, ser = 1, mode = 'shr', outb = null; const log = [];
      const R = bitRow(8, 0, null, { readonly: true, label: 'Register bit' }), Dd = bitRow(8, data, (v) => { data = v; }, { label: 'Parallel data bit' });
      const logEl = h('div', { class: 'out', style: { marginTop: '10px', minHeight: '54px' } }), so = h('span', { class: 'mono' }, '–');
      const serSw = tsw('Serial in', 1, (v) => { ser = v; });
      const ms = seg([{ v: 'hold', l: 'Hold' }, { v: 'load', l: 'Parallel load' }, { v: 'shr', l: 'Shift right' }, { v: 'shl', l: 'Shift left' }, { v: 'clr', l: 'Clear' }], 'shr', (v) => { mode = v; });
      function pulse() {
        const before = reg; outb = null;
        if (mode === 'load') reg = data; else if (mode === 'clr') reg = 0;
        else if (mode === 'shr') { outb = reg & 1; reg = (reg >> 1) | (ser << 7); } else if (mode === 'shl') { outb = (reg >> 7) & 1; reg = ((reg << 1) & 255) | ser; }
        R.set(reg, true); so.textContent = outb === null ? '–' : outb;
        log.unshift(`${bin(before, 8)} → ${bin(reg, 8)}   (${{ hold: 'hold', load: 'load', shr: 'shift right, serial in ' + ser, shl: 'shift left, serial in ' + ser, clr: 'clear' }[mode]})`); if (log.length > 5) log.pop();
        logEl.replaceChildren(...log.map((l) => h('div', null, l)));
      }
      body.append(h('p', { class: 'sub' }, 'Choose an operation and press Clock pulse. Shift right with serial in = SISO/SIPO behaviour (read the parallel bits any time). Parallel load then shifting out is PISO.'),
        h('div', { class: 'row', style: { marginBottom: '12px' } }, ms.el), h('div', { class: 'row', style: { gap: '24px', marginBottom: '12px' } }, fld('Parallel data in', Dd.el), serSw.el),
        fld('8-bit register', R.el), h('div', { class: 'row', style: { margin: '12px 0' } }, h('button', { type: 'button', class: 'btn pri', onclick: pulse }, 'Clock pulse'), h('span', null, 'Serial out bit: ', so), h('button', { type: 'button', class: 'btn sm', onclick: () => { reg = 0; R.set(0, true); so.textContent = '–'; log.length = 0; logEl.replaceChildren(); } }, 'Reset')), logEl);
    } else {
      let r1 = 0b00001111, r2 = 0b10101010, p = 1;
      const R1 = bitRow(8, r1, (v) => { r1 = v; }, { label: 'R1 bit', prefix: '' }), R2 = bitRow(8, r2, (v) => { r2 = v; }, { label: 'R2 bit', prefix: '' }), R3 = bitRow(8, 0, null, { readonly: true, label: 'R3 bit' });
      const OPS = { 'R2 ← R1': () => ({ r2: r1 }), 'R1 ← R1 + 1': () => ({ r1: (r1 + 1) & 255 }), 'R3 ← R1 AND R2': () => ({ r3: r1 & r2 }), 'R3 ← R1 OR R2': () => ({ r3: r1 | r2 }), 'R3 ← R1 XOR R2': () => ({ r3: r1 ^ r2 }), 'R1 ← 0': () => ({ r1: 0 }), 'R1 ← shl R1': () => ({ r1: (r1 << 1) & 255 }) };
      const sel = h('select', { 'aria-label': 'Register transfer' }, Object.keys(OPS).map((k) => h('option', { value: k }, k)));
      const logEl = h('div', { class: 'out', style: { marginTop: '10px', minHeight: '44px' } }), log = [];
      const psw = tsw('P', 1, (v) => { p = v; });
      const hex = (v) => '0x' + v.toString(16).toUpperCase().padStart(2, '0');
      function exec() {
        const name = sel.value;
        if (!p) { log.unshift(`P = 0, so "P: ${name}" does nothing.`); } else {
          const r = OPS[name](); if (r.r1 !== undefined) { r1 = r.r1; R1.set(r1, true); } if (r.r2 !== undefined) { r2 = r.r2; R2.set(r2, true); } if (r.r3 !== undefined) R3.set(r.r3, true);
          log.unshift(`P: ${name}   →   R1 = ${hex(r1)}, R2 = ${hex(r2)}`);
        }
        if (log.length > 5) log.pop(); logEl.replaceChildren(...log.map((l) => h('div', null, l)));
      }
      body.append(h('p', { class: 'sub' }, 'Registers R1 and R2 are editable. R3 receives logic results. A transfer with a control condition P happens only when P = 1.'),
        h('div', { style: { display: 'grid', gap: '10px' } }, fld('R1', R1.el), fld('R2', R2.el), fld('R3', R3.el)),
        h('div', { class: 'row', style: { margin: '14px 0' } }, psw.el, sel, h('button', { type: 'button', class: 'btn pri', onclick: exec }, 'Execute')), logEl);
    }
  });
  root.append(panel('Bit-shifting simulator', 'Watch bits move under a clock, then try register-to-register transfers.', t.el));
};

/* ---------- Chapter 11: memory ---------- */
DEMOS[11] = (root) => {
  const t = tabs([{ id: 'rw', label: 'Read and write' }, { id: 'cap', label: 'Capacity and expansion' }, { id: 'ecc', label: 'Error correction' }], 'rw', (id, body) => {
    if (id === 'rw') {
      const mem = [0x3C, 0xA5, 0x00, 0xFF, 0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC, 0xDE, 0xF0, 0x01, 0x02, 0x04, 0x08];
      let addr = 0, data = 0x5A, cs = 1, wr = 0, bus = 'Hi-Z';
      const tb = h('div', { class: 'scrollx' }), dec = h('div', { class: 'row tight' }), busEl = h('span', { class: 'mono' });
      const A = bitRow(4, 0, (v) => { addr = v; paint(); }, { label: 'Address bit', prefix: 'A' }), Dd = bitRow(8, data, (v) => { data = v; }, { label: 'Data in bit', prefix: 'D' });
      const csw = tsw('CS (chip select)', 1, (v) => { cs = v; paint(); }), rs = seg([{ v: 0, l: 'Read' }, { v: 1, l: 'Write' }], 0, (v) => { wr = v; });
      const hx = (v) => v.toString(16).toUpperCase().padStart(2, '0');
      function paint() {
        clear(dec); for (let i = 0; i < 16; i++) { const l = led(cs && i === addr); dec.append(h('div', { class: 'bitc' }, l.el, h('small', null, i))); }
        clear(tb).append(h('table', { class: 'mem' }, h('thead', null, h('tr', null, h('th', null, 'Address'), h('th', null, 'Contents (binary)'), h('th', null, 'Hex'))),
          h('tbody', null, mem.map((v, i) => h('tr', { class: i === addr ? 'sel' : '' }, h('td', null, bin(i, 4)), h('td', null, bin(v, 8)), h('td', null, hx(v)))))));
        busEl.textContent = bus;
      }
      function exec() {
        if (!cs) { bus = 'Hi-Z (chip not selected)'; }
        else if (wr) { mem[addr] = data; bus = `wrote 0x${hx(data)} to address ${bin(addr, 4)}`; }
        else bus = `read 0x${hx(mem[addr])} = ${bin(mem[addr], 8)}`;
        paint();
      }
      body.append(h('p', { class: 'sub' }, 'A 16 × 8 memory has 4 address lines and 8 data lines. The decoder lights one word line. Set address, data and mode, then press Execute (the write or read strobe).'),
        h('div', { class: 'row', style: { gap: '26px', marginBottom: '12px' } }, fld('Address lines', A.el), fld('Data in (used for writes)', Dd.el)),
        h('div', { class: 'row', style: { gap: '20px', marginBottom: '12px' } }, csw.el, rs.el, h('button', { type: 'button', class: 'btn pri', onclick: exec }, 'Execute')),
        h('div', { class: 'out', style: { marginBottom: '12px' } }, 'Data bus: ', busEl), fld('Address decoder output (word lines)', dec), h('div', { class: 'gap' }, tb));
      paint();
    } else if (id === 'cap') {
      let n = 10, m = 8;
      const out = h('div', { class: 'out', style: { marginTop: '10px' } }), ex = h('div', { class: 'out', style: { marginTop: '10px' } });
      const ni = h('input', { type: 'number', min: 1, max: 24, value: 10, style: { width: '80px' }, 'aria-label': 'Address lines', oninput: () => { n = Math.max(1, Math.min(24, +ni.value || 1)); calc(); } });
      const ms = seg([1, 4, 8, 16, 32].map((k) => ({ v: k, l: k + '' })), 8, (v) => { m = v; calc(); });
      const SH = [['1K × 4', 1024, 4], ['1K × 8', 1024, 8], ['2K × 8', 2048, 8], ['4K × 8', 4096, 8], ['8K × 8', 8192, 8], ['16K × 8', 16384, 8], ['4K × 16', 4096, 16], ['8K × 16', 8192, 16], ['16K × 16', 16384, 16]];
      let ci = 1, ti = 3;
      const cSel = h('select', { 'aria-label': 'Chip size', onchange: (e) => { ci = +e.target.value; calc(); } }, SH.slice(0, 5).map((s, i) => h('option', { value: i, selected: i === ci }, s[0])));
      const tSel = h('select', { 'aria-label': 'Target memory', onchange: (e) => { ti = +e.target.value; calc(); } }, SH.map((s, i) => h('option', { value: i, selected: i === ti }, s[0])));
      function calc() {
        const w = 2 ** n, bits = w * m;
        out.replaceChildren(h('div', null, `${n} address lines select `, powSup(n), ` = `, h('b', null, w.toLocaleString()), ' locations.'), h('div', null, `Capacity = ${w.toLocaleString()} × ${m} = `, h('b', null, bits.toLocaleString()), ` bits = `, h('b', null, (bits / 8).toLocaleString()), ' bytes', bits / 8 >= 1024 ? ` (${(bits / 8192).toLocaleString(undefined, { maximumFractionDigits: 2 })} KB)` : ''));
        const C = SH[ci], T = SH[ti];
        if (T[1] % C[1] || T[2] % C[2]) ex.replaceChildren('The target size is not a whole number of these chips.');
        else {
          const rows = T[1] / C[1], cols = T[2] / C[2], k = clog2(rows);
          ex.replaceChildren(h('div', null, `Target ${T[0]} from ${C[0]} chips: `, h('b', null, rows * cols + ' chips')), h('div', null, `Word expansion: ${rows} chip${rows > 1 ? 's' : ''} deep`, k ? ` (${k} extra address bit${k > 1 ? 's' : ''} into a ${k}-to-${rows} decoder driving chip selects).` : ' (no extra decoding needed).'), h('div', null, `Bit expansion: ${cols} chip${cols > 1 ? 's' : ''} wide`, cols > 1 ? ' (chips share address lines; their data lines are placed side by side).' : '.'), h('div', { class: 'muted' }, `Total address lines: ${clog2(T[1])}, of which ${clog2(C[1])} go to every chip.`));
        }
      }
      body.append(h('p', { class: 'sub' }, 'Capacity from address and data lines, then how many chips a larger memory needs.'), h('div', { class: 'row', style: { gap: '22px' } }, fld('Address lines n', ni), fld('Bits per word', ms.el)), out,
        h('h4', { style: { margin: '20px 0 8px' } }, 'Memory expansion'), h('div', { class: 'row' }, fld('Available chip', cSel), fld('Memory to build', tSel)), ex);
      calc();
    } else {
      // Hamming(7,4) + overall parity (SEC-DED)
      let d = 0b1011; let cw;
      const encode = (dv) => { const d1 = (dv >> 3) & 1, d2 = (dv >> 2) & 1, d3 = (dv >> 1) & 1, d4 = dv & 1; const c = [0, 0, 0, 0, 0, 0, 0, 0]; c[3] = d1; c[5] = d2; c[6] = d3; c[7] = d4; c[1] = d1 ^ d2 ^ d4; c[2] = d1 ^ d3 ^ d4; c[4] = d2 ^ d3 ^ d4; c[0] = c[1] ^ c[2] ^ c[3] ^ c[4] ^ c[5] ^ c[6] ^ c[7]; return c; };
      cw = encode(d);
      const cwEl = h('div', { class: 'row tight' }), res = h('div', { class: 'out', style: { marginTop: '12px' } });
      const NAMES = ['p0', 'p1', 'p2', 'd1', 'p3', 'd2', 'd3', 'd4'];
      const Db = bitRow(4, d, (v) => { d = v; cw = encode(d); paint(); }, { label: 'Data bit', prefix: 'd', noIdx: true });
      function paint() {
        clear(cwEl);
        [1, 2, 3, 4, 5, 6, 7, 0].forEach((pos) => cwEl.append(h('div', { class: 'bitc' }, h('button', { type: 'button', class: 'bit' + (cw[pos] ? ' on' : ''), 'aria-label': `Flip ${NAMES[pos]}`, onclick: () => { cw[pos] ^= 1; paint(); } }, cw[pos]), h('small', null, NAMES[pos] + (pos ? ' @' + pos : '')))));
        const s = (cw[1] ^ cw[3] ^ cw[5] ^ cw[7]) | ((cw[2] ^ cw[3] ^ cw[6] ^ cw[7]) << 1) | ((cw[4] ^ cw[5] ^ cw[6] ^ cw[7]) << 2), P = cw.reduce((a, b) => a ^ b, 0);
        let msg, cls, fixed = cw.slice();
        if (!s && !P) { msg = 'No error detected.'; cls = 'ok'; }
        else if (s && P) { fixed[s] ^= 1; msg = `Single error at position ${s} (${NAMES[s]}). Corrected by flipping it back.`; cls = 'ok'; }
        else if (!s && P) { fixed[0] ^= 1; msg = 'Single error in the overall parity bit p0. Data is fine.'; cls = 'ok'; }
        else { msg = 'Two errors detected. The syndrome is unreliable, so the word cannot be corrected.'; cls = 'bad'; }
        const dv = (fixed[3] << 3) | (fixed[5] << 2) | (fixed[6] << 1) | fixed[7];
        res.replaceChildren(h('div', null, 'Syndrome (p3 p2 p1) = ', h('b', null, bin(s, 3)), ' = ', h('b', null, s), '   Overall parity check = ', h('b', null, P)), h('div', { class: cls }, msg), h('div', null, 'Recovered data d1 d2 d3 d4 = ', h('b', null, cls === 'bad' ? '??' : bin(dv, 4))));
      }
      body.append(h('p', { class: 'sub' }, 'Set four data bits. The circuit adds Hamming check bits p1, p2, p3 and an overall parity bit p0 (SEC-DED). Click bits in the stored word to inject one error, then a second one.'), fld('Data bits d1 d2 d3 d4', Db.el),
        h('div', { style: { margin: '14px 0 6px' } }, fld('Stored 8-bit word (click a bit to flip it)', cwEl)), h('div', { class: 'row tight', style: { marginTop: '8px' } }, h('button', { type: 'button', class: 'btn sm', onclick: () => { cw = encode(d); paint(); } }, 'Remove errors')), res);
      paint();
    }
  });
  root.append(panel('Memory workbench', 'Read and write a small RAM, size a memory, and correct a flipped bit.', t.el));
};

/* ---------- Chapter 12: ROM / PLA ---------- */
DEMOS[12] = (root) => {
  const t = tabs([{ id: 'rom', label: 'ROM' }, { id: 'pla', label: 'PLA / PAL' }], 'rom', (id, body) => {
    if (id === 'rom') {
      let rom = range(8).map((i) => { const a = (i >> 2) & 1, b = (i >> 1) & 1, c = i & 1; return (((a & b) | (a & c) | (b & c)) << 1) | (a ^ b ^ c); });
      let addr = 0;
      const tb = h('div', { class: 'scrollx' }), outs = h('div', { class: 'row tight' });
      const A = bitRow(3, 0, (v) => { addr = v; paint(); }, { label: 'Address bit', prefix: 'A' });
      function paint() {
        clear(tb).append(h('table', { class: 'tt' }, h('thead', null, h('tr', null, h('th', null, 'A2 A1 A0'), ['D3', 'D2', 'D1', 'D0'].map((x) => h('th', null, x)))),
          h('tbody', null, rom.map((w, i) => h('tr', { class: i === addr ? 'act' : '' }, h('td', null, bin(i, 3)), [3, 2, 1, 0].map((b) => h('td', null, h('button', { type: 'button', class: 'btn sm' + ((w >> b) & 1 ? ' on' : ''), style: { minWidth: '34px' }, 'aria-label': `Word ${i} bit ${b}`, onclick: () => { rom[i] ^= (1 << b); paint(); } }, (w >> b) & 1))))))));
        clear(outs); [3, 2, 1, 0].forEach((b) => { const l = led((rom[addr] >> b) & 1); outs.append(h('div', { class: 'bitc' }, l.el, h('small', null, 'D' + b))); });
      }
      const presets = h('div', { class: 'row tight', style: { marginBottom: '12px' } },
        h('button', { type: 'button', class: 'btn sm', onclick: () => { rom = range(8).map((i) => { const a = (i >> 2) & 1, b = (i >> 1) & 1, c = i & 1; return (((a & b) | (a & c) | (b & c)) << 1) | (a ^ b ^ c); }); paint(); } }, 'Full adder (D1 = Cout, D0 = Sum)'),
        h('button', { type: 'button', class: 'btn sm', onclick: () => { rom = range(8).map((i) => (i * i) & 15); paint(); } }, 'Squares (mod 16)'), h('button', { type: 'button', class: 'btn sm', onclick: () => { rom = Array(8).fill(0); paint(); } }, 'Clear'));
      body.append(h('p', { class: 'sub' }, 'An 8 × 4 ROM: 3 address lines, 4 output bits. The address is the input of a logic function, and each row stores the function values. Click bits to reprogram it.'), presets, h('div', { class: 'row', style: { gap: '26px', marginBottom: '12px' } }, fld('Address (inputs)', A.el), fld('Word read out', outs)), tb);
      paint();
    } else {
      let and = range(4).map(() => Array(6).fill(0)), or = [Array(4).fill(0), Array(4).fill(0)], pal = false, inp = [0, 0, 0];
      const grid = h('div', { class: 'scrollx' }), res = h('div', { class: 'out', style: { marginTop: '12px' } }), tt = h('div', { class: 'scrollx', style: { marginTop: '12px' } });
      const LIT = ['A', "A'", 'B', "B'", 'C', "C'"], FIXED = [[1, 1, 0, 0], [0, 0, 1, 1]];
      const evalP = (k, v) => { const cols = and[k].map((x, i) => (x ? i : -1)).filter((i) => i >= 0); if (!cols.length) return 0; return cols.every((c) => { const val = v[c >> 1]; return (c & 1) ? !val : !!val; }) ? 1 : 0; };
      const orRow = (f) => (pal ? FIXED[f] : or[f]);
      const calc = (v) => { const p = range(4).map((k) => evalP(k, v)); return { p, f: [0, 1].map((f) => (orRow(f).some((x, k) => x && p[k]) ? 1 : 0)) }; };
      const sws = ['A', 'B', 'C'].map((n, i) => tsw(n, 0, (v) => { inp[i] = v; paint(); }));
      function paint() {
        const cur = calc(inp);
        clear(grid).append(h('div', { class: 'row', style: { gap: '30px', alignItems: 'flex-start' } },
          h('div', null, h('h4', null, 'AND array (programmable)'), h('table', { class: 'plaGrid' }, h('thead', null, h('tr', null, h('th', null, ''), LIT.map((l) => h('th', null, l)), h('th', null, 'P'))),
            h('tbody', null, and.map((row, k) => h('tr', null, h('th', null, 'P' + (k + 1)), row.map((v, c) => h('td', null, h('button', { type: 'button', class: v ? 'on' : '', 'aria-label': `P${k + 1} uses ${LIT[c]}`, onclick: () => { and[k][c] ^= 1; paint(); } }, v ? '×' : '·'))), h('td', { class: cur.p[k] ? 'act' : '' }, cur.p[k])))))),
          h('div', null, h('h4', null, pal ? 'OR array (fixed in a PAL)' : 'OR array (programmable)'), h('table', { class: 'plaGrid' }, h('thead', null, h('tr', null, h('th', null, ''), range(4).map((k) => h('th', null, 'P' + (k + 1))), h('th', null, 'F'))),
            h('tbody', null, [0, 1].map((f) => h('tr', null, h('th', null, 'F' + (f + 1)), orRow(f).map((v, k) => h('td', null, h('button', { type: 'button', class: (v ? 'on' : '') + (pal ? ' fix' : ''), 'aria-label': `F${f + 1} includes P${k + 1}`, onclick: () => { if (!pal) { or[f][k] ^= 1; paint(); } } }, v ? '×' : '·'))), h('td', { class: cur.f[f] ? 'act' : '' }, cur.f[f]))))))));
        const term = (k) => { const cols = and[k].map((x, i) => (x ? LIT[i] : '')).filter(Boolean); return cols.join(''); };
        const eq = (f) => { const ts = orRow(f).map((x, k) => (x && term(k) ? term(k) : '')).filter(Boolean); return ts.length ? ts.join(' + ') : '0'; };
        res.replaceChildren(h('div', null, 'F1 = ', h('b', null, eq(0))), h('div', null, 'F2 = ', h('b', null, eq(1))), h('div', { class: 'muted' }, pal ? 'PAL: only the AND array is programmable, so each output is limited to its own fixed pair of product terms (F1 = P1 + P2, F2 = P3 + P4).' : 'PLA: both arrays are programmable, so a product term can feed any output or several outputs.'));
        clear(tt).append(tableEl(['A', 'B', 'C', 'F1', 'F2'], range(8).map((i) => { const v = [(i >> 2) & 1, (i >> 1) & 1, i & 1], r = calc(v); return [...v, r.f[0], r.f[1]]; }), 'tt'));
        [...tt.querySelectorAll('tbody tr')].forEach((tr, i) => { if (i === ((inp[0] << 2) | (inp[1] << 1) | inp[2])) tr.className = 'act'; });
      }
      const ps = seg([{ v: 0, l: 'PLA' }, { v: 1, l: 'PAL' }], 0, (v) => { pal = !!v; paint(); });
      const load = () => { and = [[1, 0, 1, 0, 0, 0], [0, 1, 0, 0, 1, 0], [1, 0, 0, 0, 1, 0], [0, 0, 1, 0, 1, 0]]; or = [[1, 1, 0, 0], [0, 0, 1, 1]]; paint(); };
      body.append(h('p', { class: 'sub' }, 'Click a cross-point to connect a fuse. The AND array picks input literals for each product term P1–P4, and the OR array picks which product terms feed each output. Load the lecture example, then flip A, B and C.'),
        h('div', { class: 'row', style: { marginBottom: '12px' } }, ps.el, h('button', { type: 'button', class: 'btn sm pri', onclick: load }, "Load F1 = AB + A′C, F2 = AC + BC"), h('button', { type: 'button', class: 'btn sm', onclick: () => { and = range(4).map(() => Array(6).fill(0)); or = [Array(4).fill(0), Array(4).fill(0)]; paint(); } }, 'Clear all')),
        h('div', { class: 'row', style: { gap: '18px', marginBottom: '12px' } }, ...sws.map((s) => s.el)), grid, res, tt);
      load();
    }
  });
  root.append(panel('Programmable-logic simulation', 'A ROM is a lookup table. A PLA gives you AND and OR arrays to program directly.', t.el));
};

/* ---------- Chapter 13: applications ---------- */
DEMOS[13] = (root) => {
  const t = tabs([{ id: 'alu', label: '4-bit ALU' }, { id: 'tl', label: 'Traffic light' }, { id: 'lock', label: 'Digital lock' }], 'alu', (id, body, reg) => {
    if (id === 'alu') {
      let A = 6, B = 3, op = 0; const res = h('div', { class: 'out', style: { marginTop: '12px' } });
      const OPS = ['A + B', 'A − B', 'A AND B', 'A OR B', 'A XOR B', 'NOT A', 'A + 1', 'Pass B'];
      const ba = bitRow(4, A, (v) => { A = v; run(); }, { label: 'A bit', prefix: 'a' }), bb = bitRow(4, B, (v) => { B = v; run(); }, { label: 'B bit', prefix: 'b' });
      const os = h('select', { 'aria-label': 'ALU operation', onchange: (e) => { op = +e.target.value; run(); } }, OPS.map((o, i) => h('option', { value: i }, `${bin(i, 3)}  ${o}`)));
      function run() {
        let r = 0, c = 0, v = 0;
        if (op === 0) { const s = A + B; r = s & 15; c = s > 15 ? 1 : 0; v = ((A ^ r) & (B ^ r) & 8) ? 1 : 0; }
        else if (op === 1) { const s = A + ((~B) & 15) + 1; r = s & 15; c = s > 15 ? 1 : 0; v = ((A ^ B) & (A ^ r) & 8) ? 1 : 0; }
        else if (op === 2) r = A & B; else if (op === 3) r = A | B; else if (op === 4) r = A ^ B; else if (op === 5) r = (~A) & 15; else if (op === 6) { const s = A + 1; r = s & 15; c = s > 15 ? 1 : 0; v = A === 7 ? 1 : 0; } else r = B;
        res.replaceChildren(h('div', null, 'Result ', h('b', null, bin(r, 4)), `   (unsigned ${r}, signed ${r >= 8 ? r - 16 : r})`),
          h('div', null, 'Flags:  Z = ', h('b', null, r === 0 ? 1 : 0), '   N = ', h('b', null, (r >> 3) & 1), '   C = ', h('b', null, c), '   V = ', h('b', null, v)),
          h('div', { class: 'muted' }, 'Inside: an adder-subtractor for op 000 and 001, gates for the logic operations, and a multiplexer driven by the op code to pick the result.'));
      }
      body.append(h('p', { class: 'sub' }, 'Choose A, B and an operation. The op code (3 select lines) picks which result reaches the output.'), h('div', { class: 'row', style: { gap: '26px', marginBottom: '12px' } }, fld('A', ba.el), fld('B', bb.el), fld('Operation (select lines)', os)), res); run();
    } else if (id === 'tl') {
      const S = [{ n: 'North–South green', ns: 'g', ew: 'r', d: 4 }, { n: 'North–South yellow', ns: 'y', ew: 'r', d: 2 }, { n: 'East–West green', ns: 'r', ew: 'g', d: 4 }, { n: 'East–West yellow', ns: 'r', ew: 'y', d: 2 }];
      let s = 0, tcount = 0, run = false, timer = null;
      const road = h('div', { class: 'road' }), info = h('div', { class: 'out', style: { marginTop: '12px' } });
      const lights = (c) => h('div', { class: 'tl' }, ['r', 'y', 'g'].map((k) => h('i', { class: k + (c === k ? ' on' : '') })));
      function paint() {
        clear(road).append(h('div', null, h('div', { class: 'small muted' }, 'North–South'), lights(S[s].ns)), h('div', null, h('div', { class: 'small muted' }, 'East–West'), lights(S[s].ew)));
        info.replaceChildren(h('div', null, 'State: ', h('b', null, S[s].n), `   flip-flops A B = ${bin(s, 2)}`), h('div', null, `Timer counter: ${tcount} of ${S[s].d} clock ticks`), h('div', { class: 'muted' }, 'The FSM changes state when the counter reaches the duration, then the counter resets.'));
      }
      function tick() { tcount++; if (tcount >= S[s].d) { s = (s + 1) % 4; tcount = 0; } paint(); }
      const rb = h('button', { type: 'button', class: 'btn sm', onclick: () => { run = !run; rb.textContent = run ? 'Pause' : 'Run'; rb.classList.toggle('on', run); clearInterval(timer); if (run) timer = setInterval(tick, 700); } }, 'Run');
      reg(() => clearInterval(timer));
      body.append(h('p', { class: 'sub' }, 'A four-state FSM (2 flip-flops) selects the lights. A counter provides the timing: 4 ticks for green, 2 for yellow.'), h('div', { class: 'row', style: { marginBottom: '14px' } }, h('button', { type: 'button', class: 'btn sm pri', onclick: tick }, 'Clock tick'), rb, h('button', { type: 'button', class: 'btn sm', onclick: () => { s = 0; tcount = 0; paint(); } }, 'Reset')), road, info); paint();
    } else {
      let code = '1011', st = 0, log = [], unlocked = false;
      const disp = h('div', { class: 'out', style: { marginTop: '12px' } }), l = led(0);
      const cs = seg(['1011', '0110', '101', '1100'].map((c) => ({ v: c, l: c })), code, (v) => { code = v; st = 0; log = []; unlocked = false; paint(); });
      function nextState(s, x) {
        const cand = code.slice(0, s) + x; for (let k = Math.min(cand.length, code.length); k >= 0; k--) if (cand.endsWith(code.slice(0, k))) return k; return 0;
      }
      function press(x) { st = nextState(st, x); log.push(x); if (log.length > 14) log.shift(); unlocked = st === code.length; paint(); }
      function paint() {
        l.set(unlocked);
        disp.replaceChildren(h('div', null, `FSM state: `, h('b', null, unlocked ? 'UNLOCKED' : `matched ${st} of ${code.length} digits`)), h('div', null, 'Inputs so far: ', h('b', null, log.join(' ') || '–')), h('div', { class: 'muted' }, `${code.length + 1} states, so ${clog2(code.length + 1)} flip-flops. A wrong press falls back to the longest prefix still matched.`));
      }
      body.append(h('p', { class: 'sub' }, 'Choose a secret code and enter it with the two buttons. The FSM tracks how much of the code has been matched.'), h('div', { class: 'row', style: { marginBottom: '12px' } }, fld('Secret code', cs.el)),
        h('div', { class: 'row', style: { gap: '18px' } }, h('div', { class: 'keypad' }, h('button', { type: 'button', class: 'btn pri', onclick: () => press('0') }, '0'), h('button', { type: 'button', class: 'btn pri', onclick: () => press('1') }, '1')), h('span', { class: 'row tight' }, l.el, h('b', null, 'Unlocked')), h('button', { type: 'button', class: 'btn sm', onclick: () => { st = 0; log = []; unlocked = false; paint(); } }, 'Lock again')), disp); paint();
    }
  });
  root.append(panel('Mini digital systems', 'Blocks from earlier chapters working together.', t.el));
};