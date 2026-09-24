/* ===================== extras.js : drills, reference, projects helpers ===================== */
const GF_URL = 'https://gate-forge.netlify.app';
const subs = { 2: '₂', 8: '₈', 10: '₁₀', 16: '₁₆' };
const SUP_DIG = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const supN = (n) => String(n).split('').map((c) => SUP_DIG[c] || c).join('');
const DRILLS = [
  { id: 'base', label: 'Base conversion', gen() {
    const [f, t] = pick([[10, 2], [2, 10], [2, 16], [16, 2], [8, 2], [2, 8], [16, 10], [10, 16]]); const v = 9 + rnd(240);
    return { q: `Convert ${v.toString(f).toUpperCase()}${subs[f]} to base ${t}.`, ans: v.toString(t).toUpperCase(), norm: (s) => s.trim().toUpperCase().replace(/^0+(?=.)/, '').replace(/\s/g, '') };
  } },
  { id: 'twos', label: "8-bit 2's complement", gen() {
    const v = pick([-1, 1]) * (1 + rnd(127));
    return { q: `Write ${v} as an 8-bit two's complement number.`, ans: bin((v + 256) % 256, 8), hint: v < 0 ? 'Write the positive value, invert every bit, add 1.' : 'A positive number is its plain binary value.' };
  } },
  { id: 'gray', label: 'Gray code', gen() {
    const v = rnd(16), toGray = rnd(2);
    return toGray ? { q: `Convert binary ${bin(v, 4)} to Gray code.`, ans: bin(v ^ (v >> 1), 4), hint: 'Keep the first bit, then XOR each bit with the bit to its left.' }
      : { q: `Convert Gray code ${bin(v ^ (v >> 1), 4)} to binary.`, ans: bin(v, 4), hint: 'Keep the first bit, then XOR the previous binary bit with the next Gray bit.' };
  } },
  { id: 'bcd', label: 'BCD', gen() { const v = 10 + rnd(90); return { q: `Write ${v} in BCD (four bits per decimal digit).`, ans: String(v).split('').map((d) => bin(+d, 4)).join(''), hint: 'Encode each decimal digit separately.' }; } },
  { id: 'simp', label: 'Simplify a function', gen() {
    const ones = shuffle(range(8)).slice(0, 3 + rnd(3)).sort((a, b) => a - b), fn = range(8).map((i) => (ones.includes(i) ? 1 : 0)), m = minimize(['A', 'B', 'C'], fn);
    return { q: `Write a minimal sum of products for F(A,B,C) = Σm(${ones.join(', ')}). Type it like AB' + C.`, ans: m.sop.expr, custom(inp) {
      try { const a = parseExpr(inp), vs = ['A', 'B', 'C']; if (!tableOf(a, vs).every((x, i) => x === fn[i])) return { ok: false, msg: 'That expression gives a different truth table.' };
        const lits = litCount(a), best = m.sop.cover.reduce((s, p) => s + 3 - pop(p.mask), 0);
        return lits <= best ? { ok: true, msg: 'Correct and minimal.' } : { ok: false, msg: `Correct function, but not minimal: ${lits} literals, and ${best} are enough.` };
      } catch (e) { return { ok: false, msg: e.message }; } }, hint: 'Draw a 3-variable K-map and group the 1s.' };
  } },
  { id: 'ff', label: 'Flip-flop next state', gen() {
    const t = pick(['D', 'T', 'JK']), q0 = rnd(2);
    if (t === 'D') { const d = rnd(2); return { q: `A D flip-flop has Q = ${q0} and D = ${d}. What is Q after the clock edge?`, ans: String(d) }; }
    if (t === 'T') { const T = rnd(2); return { q: `A T flip-flop has Q = ${q0} and T = ${T}. What is Q after the clock edge?`, ans: String(T ? q0 ^ 1 : q0) }; }
    const j = rnd(2), k = rnd(2), nq = j && k ? q0 ^ 1 : j ? 1 : k ? 0 : q0; return { q: `A JK flip-flop has Q = ${q0}, J = ${j}, K = ${k}. What is Q after the clock edge?`, ans: String(nq), hint: '00 hold, 01 reset, 10 set, 11 toggle.' };
  } },
  { id: 'mod', label: 'Counter size', gen() { const N = 3 + rnd(38); return { q: `How many flip-flops does a MOD-${N} counter need at minimum?`, ans: String(clog2(N)), hint: 'Find the smallest n with 2ⁿ ≥ N.' }; } },
  { id: 'mem', label: 'Memory capacity', gen() { const n = 4 + rnd(9), m = pick([4, 8, 16]); return { q: `A memory has ${n} address lines and ${m}-bit words. How many bits does it store in total?`, ans: String((2 ** n) * m), hint: `Locations = 2${supN(n)} = ${2 ** n}. Multiply by the word width.` }; } }
];
function mountDrills(root) {
  let cur = DRILLS[0], item = null, streak = 0;
  const st = Store.get('drills', { done: 0, right: 0 });
  const qEl = h('div', { class: 'qtext' }), inp = h('input', { type: 'text', size: 26, 'aria-label': 'Your answer', autocomplete: 'off', onkeydown: (e) => { if (e.key === 'Enter') check(); } }), fb = h('div', { style: { minHeight: '28px', margin: '10px 0' }, role: 'status' }), tally = h('span', { class: 'muted small' });
  function newQ() { item = cur.gen(); qEl.textContent = item.q; inp.value = ''; clear(fb); inp.focus(); paintTally(); }
  const paintTally = () => { tally.textContent = `Streak ${streak}   ·   ${st.right} correct of ${st.done} answered`; };
  function check() {
    if (!inp.value.trim()) return;
    let r;
    if (item.custom) r = item.custom(inp.value);
    else { const norm = item.norm || ((s) => s.replace(/\s/g, '').toUpperCase()); r = norm(inp.value) === norm(item.ans) ? { ok: true, msg: 'Correct.' } : { ok: false, msg: 'Not quite. The answer is ' + item.ans + '.' + (item.hint ? ' Hint: ' + item.hint : '') }; }
    st.done++; if (r.ok) { st.right++; streak++; } else streak = 0; Store.set('drills', st); paintTally();
    fb.replaceChildren(h('span', { class: r.ok ? 'ok' : 'bad' }, r.msg), !r.ok && item.custom ? h('span', { class: 'muted' }, ' Answer: ' + item.ans) : '');
  }
  const ds = seg(DRILLS.map((d) => ({ v: d.id, l: d.label })), cur.id, (v) => { cur = DRILLS.find((d) => d.id === v); newQ(); });
  root.append(h('div', { class: 'demo' }, h('h3', null, 'Drills'), h('p', { class: 'sub' }, 'Endless questions with instant checking. Press Enter to check.'), h('div', { class: 'row', style: { marginBottom: '14px' } }, ds.el), qEl,
    h('div', { class: 'row' }, inp, h('button', { type: 'button', class: 'btn pri', onclick: check }, 'Check'), h('button', { type: 'button', class: 'btn', onclick: newQ }, 'New question'),
      h('button', { type: 'button', class: 'btn sm', onclick: () => { if (item) fb.replaceChildren(h('span', { class: 'muted' }, 'Answer: ' + item.ans)); } }, 'Show answer')), fb, tally));
  newQ();
}

function refSections() {
  const gates = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'], expr = { AND: 'A·B', OR: 'A + B', NOT: "A′", NAND: '(A·B)′', NOR: '(A + B)′', XOR: 'A ⊕ B', XNOR: '(A ⊕ B)′' };
  const desc = { AND: '1 only if all inputs are 1', OR: '1 if any input is 1', NOT: 'Inverts the input', NAND: '0 only if all inputs are 1', NOR: '1 only if all inputs are 0', XOR: '1 if the inputs differ', XNOR: '1 if the inputs are equal' };
  const gt = h('table', { class: 'doc' }, h('thead', null, h('tr', null, ['Gate', 'Symbol', 'Expression', 'Output'].map((x) => h('th', null, x)))),
    h('tbody', null, gates.map((g) => h('tr', null, h('td', null, g), h('td', null, gateSvg(g, { scale: 0.85 })), h('td', { class: 'm' }, expr[g]), h('td', null, desc[g])))));
  const T = (html) => h('div', { html });
  return [
    { t: 'Number systems', k: 'binary octal decimal hexadecimal radix conversion 2 complement bcd gray ascii', el: T('<table class="doc"><thead><tr><th>Base</th><th>Symbols</th><th>Bits per digit</th></tr></thead><tbody><tr><td>Binary (2)</td><td class="m">0 1</td><td>1</td></tr><tr><td>Octal (8)</td><td class="m">0–7</td><td>3</td></tr><tr><td>Decimal (10)</td><td class="m">0–9</td><td>–</td></tr><tr><td>Hex (16)</td><td class="m">0–9 A–F</td><td>4</td></tr></tbody></table><div class="formula">2’s complement = invert all bits, add 1<br>n-bit range: −2ⁿ⁻¹ … 2ⁿ⁻¹−1<br>Binary to Gray: G = B ⊕ (B >> 1)<br>BCD: add 0110 if group > 1001 or carry</div>') },
    { t: 'Boolean laws', k: 'boolean algebra laws identity demorgan absorption duality distributive', el: T('<table class="doc"><tbody><tr><td>Identity</td><td class="m">A+0 = A · A·1 = A</td></tr><tr><td>Null</td><td class="m">A+1 = 1 · A·0 = 0</td></tr><tr><td>Idempotent</td><td class="m">A+A = A · AA = A</td></tr><tr><td>Complement</td><td class="m">A+A′ = 1 · AA′ = 0</td></tr><tr><td>Distributive</td><td class="m">A(B+C) = AB+AC · A+BC = (A+B)(A+C)</td></tr><tr><td>Absorption</td><td class="m">A+AB = A · A(A+B) = A</td></tr><tr><td>DeMorgan</td><td class="m">(A+B)′ = A′B′ · (AB)′ = A′+B′</td></tr><tr><td>Useful</td><td class="m">A+A′B = A+B · XY+X′Z+YZ = XY+X′Z</td></tr></tbody></table>') },
    { t: 'Logic gates', k: 'gates and or not nand nor xor xnor symbols truth table', el: h('div', null, gt, LEGACY ? null : h('div', { class: 'scrollx', style: { marginTop: '14px' } }, tableEl(['A', 'B', 'AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'], [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => [a, b, ...['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'].map((t) => gateEval(t, [a, b]))])))) },
    { t: 'Minterms and maxterms', k: 'minterm maxterm canonical sop pos sigma pi', el: T('<div class="formula">Minterm m<sub>j</sub>: product, variable complemented where bit = 0<br>Maxterm M<sub>j</sub>: sum, variable complemented where bit = 1<br>F = Σm(ones) = ΠM(zeros)<br>m<sub>j</sub>′ = M<sub>j</sub></div>') },
    { t: 'K-map rules', k: 'karnaugh map k-map grouping prime implicant essential dont care', el: T('<ul><li>Gray-code order 00, 01, 11, 10 on the edges.</li><li>Groups of 1, 2, 4, 8, 16 cells; rectangles only; wrap around edges.</li><li>Largest groups, fewest groups, overlap allowed.</li><li>SOP: group 1s. POS: group 0s and complement the literals.</li><li>Essential prime implicants first. Use X only when it enlarges a group.</li></ul>') },
    { t: 'Arithmetic circuits', k: 'half adder full adder subtractor comparator bcd adder overflow ripple carry', el: T('<div class="formula">HA:  S = A⊕B   C = AB<br>FA:  S = A⊕B⊕Cin   Cout = AB + Cin(A⊕B)<br>HS:  D = A⊕B   Bout = A′B<br>FS:  D = A⊕B⊕Bin   Bout = A′B + A′Bin + B·Bin<br>A − B = A + B′ + 1<br>Signed overflow: c<sub>in,MSB</sub> ⊕ c<sub>out,MSB</sub><br>1-bit compare: G = AB′  E = (A⊕B)′  L = A′B</div>') },
    { t: 'Decoders, encoders, multiplexers', k: 'decoder encoder priority mux demux multiplexer select', el: T('<div class="formula">2-to-4 decoder: Yi = minterm i<br>4-to-2 encoder: A = D2+D3, B = D1+D3<br>2-to-1 MUX: Y = S′I0 + S·I1<br>4-to-1 MUX: Y = Σ (select minterm)·Ii<br>n select lines → 2ⁿ data inputs<br>Decoder with enable = DEMUX</div>') },
    { t: 'Flip-flop tables', k: 'flip flop sr jk d t characteristic excitation latch', el: T('<div class="formula">D:  Q+ = D<br>T:  Q+ = T⊕Q<br>JK: Q+ = JQ′ + K′Q<br>SR: Q+ = S + R′Q  (SR = 0)</div><table class="doc"><thead><tr><th>Q → Q+</th><th>D</th><th>T</th><th>J K</th><th>S R</th></tr></thead><tbody><tr><td class="m">0 → 0</td><td class="m">0</td><td class="m">0</td><td class="m">0 X</td><td class="m">0 X</td></tr><tr><td class="m">0 → 1</td><td class="m">1</td><td class="m">1</td><td class="m">1 X</td><td class="m">1 0</td></tr><tr><td class="m">1 → 0</td><td class="m">0</td><td class="m">1</td><td class="m">X 1</td><td class="m">0 1</td></tr><tr><td class="m">1 → 1</td><td class="m">1</td><td class="m">0</td><td class="m">X 0</td><td class="m">X 0</td></tr></tbody></table>') },
    { t: 'Sequential design', k: 'state machine moore mealy state reduction flip flops number', el: T('<div class="formula">Flip-flops for N states = ⌈log₂N⌉<br>Moore: y = f(state)   Mealy: y = f(state, input)<br>D flip-flop: D = next state<br>Steps: spec, states, diagram, table, reduce, assign, equations, circuit, verify</div>') },
    { t: 'Counters and registers', k: 'counter ripple synchronous mod ring johnson frequency division shift register', el: T('<div class="formula">MOD-N flip-flops: 2ⁿ ≥ N<br>Sync up counter: T0 = 1, T1 = Q0, T2 = Q0Q1, T3 = Q0Q1Q2<br>Ring: n states   Johnson: 2n states<br>Stage k of a binary counter: f / 2<sup>k+1</sup><br>Shift right: bits move to LSB, serial in at MSB</div>') },
    { t: 'Memory', k: 'memory ram sram dram address capacity chip select expansion', el: T('<div class="formula">Locations = 2ⁿ   Capacity = 2ⁿ × m bits<br>Chips for expansion = (Twords/Cwords) × (Tbits/Cbits)<br>Extra address bits = log₂(Twords/Cwords)<br>SRAM: no refresh   DRAM: refresh, dense</div>') },
    { t: 'ROM, PLA and PAL', k: 'rom pla pal programmable logic mask prom eprom eeprom flash', el: T('<table class="doc"><thead><tr><th>Device</th><th>AND array</th><th>OR array</th></tr></thead><tbody><tr><td>ROM</td><td>Fixed (decoder)</td><td>Programmable</td></tr><tr><td>PLA</td><td>Programmable</td><td>Programmable</td></tr><tr><td>PAL</td><td>Programmable</td><td>Fixed</td></tr></tbody></table><p>ROM size for n inputs and m outputs: 2ⁿ × m. Mask ROM: factory. PROM: once. EPROM: UV erase. EEPROM: electrical. Flash: electrical, by block.</p>') }
  ];
}

function multiplierWidget() {
  let A = 5, B = 6; const box = h('div');
  const ba = bitRow(3, A, (v) => { A = v; run(); }, { label: 'A bit', prefix: 'a' }), bb = bitRow(3, B, (v) => { B = v; run(); }, { label: 'B bit', prefix: 'b' });
  function run() {
    const cols = [5, 4, 3, 2, 1, 0];
    const rows = [0, 1, 2].map((j) => { const bj = (B >> j) & 1; return { j, cells: [0, 1, 2].map((i) => bj & ((A >> i) & 1)) }; });
    const head = h('thead', null, h('tr', null, h('th', null, 'Row'), cols.map((k) => h('th', null, 'p' + k))));
    const body = h('tbody', null,
      rows.map((r) => h('tr', null, h('th', null, `A × b${r.j}`), cols.map((k) => { const idx = k - r.j; return h('td', null, idx >= 0 && idx <= 2 ? r.cells[idx] : ''); }))),
      h('tr', { class: 'act' }, h('th', null, 'Product'), cols.map((k) => h('td', null, ((A * B) >> k) & 1))));
    clear(box).append(h('div', { class: 'scrollx' }, h('table', { class: 'tt' }, head, body)),
      h('p', { class: 'out', style: { marginTop: '10px' } }, `${A} × ${B} = `, h('b', null, A * B), ` = ${bin(A * B, 6)}   (9 AND gates make the partial products; adders sum the shifted rows)`));
  }
  const w = h('div', null, h('div', { class: 'row', style: { gap: '24px', marginBottom: '12px' } }, fld('A (3 bits)', ba.el), fld('B (3 bits)', bb.el)), box); run(); return w;
}
const VIVA = [
  ['Why are NAND and NOR universal gates?', 'Each can build NOT (tie the inputs), and then AND and OR by DeMorgan’s laws, so any function can be built from one gate type.'],
  ['When is a K-map useful?', 'For simplifying functions of two to four variables (up to about six with care), because it shows adjacent minterms visually and gives minimal SOP or POS.'],
  ['Combinational vs. sequential?', 'Combinational outputs depend only on present inputs. Sequential outputs also depend on stored state.'],
  ['Why are flip-flops clocked?', 'The clock makes every state change happen at one known instant, which makes timing predictable and avoids races.'],
  ['Decoder vs. encoder?', 'A decoder turns a binary code into one active line. An encoder turns one active line into a binary code.'],
  ['How can a MUX implement a Boolean function?', 'Use the variables as select lines and connect the data inputs to the function values (constants, or the leftover variable and its complement).'],
  ['How is the flip-flop count for a MOD-N counter found?', 'The smallest n with 2ⁿ ≥ N.'],
  ['Why is state reduction useful?', 'Merging equivalent states can save flip-flops and combinational logic without changing the external behaviour.'],
  ['How does memory decoding work?', 'A decoder converts address bits into a single select line for a location or chip, and chip selects enable only the addressed device.'],
  ['What are PLA and PAL?', 'Programmable logic devices with an AND array and an OR array. In a PLA both are programmable. In a PAL only the AND array is.']
];

function mountReference(root) {
  const secs = refSections();
  const q = h('input', { type: 'text', size: 30, placeholder: 'Search, for example: mux, 2\u2019s complement', 'aria-label': 'Search the reference', oninput: () => paint() });
  const list = h('div', { style: { marginTop: '20px' } }), empty = h('p', { class: 'muted' }, 'Nothing matches that search.');
  root.append(h('div', { class: 'row' }, q), list);
  const nodes = secs.map((s) => h('section', { class: 'refsec', 'data-k': (s.t + ' ' + s.k).toLowerCase() }, h('h3', null, s.t), s.el));
  nodes.forEach((n) => list.append(n)); list.append(empty);
  function paint() {
    const t = q.value.trim().toLowerCase(); let shown = 0;
    nodes.forEach((n) => { const ok = !t || n.getAttribute('data-k').includes(t) || n.textContent.toLowerCase().includes(t); n.style.display = ok ? '' : 'none'; if (ok) shown++; });
    empty.style.display = shown ? 'none' : '';
  }
  paint();
}
function mountProjects(root) {
  const checks = Store.get('checks', {});
  document.querySelectorAll('[data-checklist]').forEach((ul) => {
    const pid = ul.getAttribute('data-checklist');
    ul.querySelectorAll('input[type=checkbox]').forEach((cb, i) => { const k = pid + ':' + i; cb.checked = !!checks[k]; cb.addEventListener('change', () => { const c = Store.get('checks', {}); if (cb.checked) c[k] = true; else delete c[k]; Store.set('checks', c); }); });
  });
  document.querySelectorAll('[data-multiplier]').forEach((ph) => ph.append(multiplierWidget()));
}
