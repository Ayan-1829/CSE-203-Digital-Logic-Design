/* ===================== reallife.js : real-life gate examples + page mounting ===================== */
const REAL_LIFE = {
  AND: {
    title: 'AND: every condition must be true', scene: 'Microwave oven',
    story: 'A microwave only runs when the door is closed AND the start button is pressed. If either one is missing, nothing happens. That is an AND gate: the output is 1 only when all inputs are 1.',
    a: { label: 'Door', on: 'closed', off: 'open' }, b: { label: 'Start button', on: 'pressed', off: 'not pressed' }, y: { label: 'Microwave', on: 'runs', off: 'stays off' },
    expr: 'Y = A · B', rule: 'Output is 1 only when A and B are both 1.',
    more: ['Push-button car start: brake pedal pressed AND key fob inside the car.', 'Bank vault that opens only when two managers turn their keys.', 'Washing machine: door locked AND water level reached before the drum spins.']
  },
  OR: {
    title: 'OR: any one condition is enough', scene: 'Burglar alarm',
    story: 'A house alarm sounds if the front door sensor OR the window sensor is triggered. It also sounds if both are triggered. That is an OR gate: the output is 1 when at least one input is 1.',
    a: { label: 'Front door sensor', on: 'triggered', off: 'quiet' }, b: { label: 'Window sensor', on: 'triggered', off: 'quiet' }, y: { label: 'Alarm', on: 'sounds', off: 'silent' },
    expr: 'Y = A + B', rule: 'Output is 1 when A or B (or both) is 1.',
    more: ['Elevator call: a button on any floor summons the car.', 'Smoke alarm network: any detector can trigger the siren.', 'Hall light with two motion sensors: either one turns it on.']
  },
  NOT: {
    title: 'NOT: the opposite', scene: 'Street light',
    story: 'A light sensor reports whether it is daylight. The street lamp must be ON when it is NOT daylight. That is a NOT gate (an inverter): the output is the opposite of the input.',
    a: { label: 'Light sensor', on: 'sees daylight', off: 'sees dark' }, y: { label: 'Street lamp', on: 'on', off: 'off' },
    expr: 'Y = A′', rule: 'Output is 1 when the input is 0, and 0 when the input is 1.',
    more: ['Fridge light: on when the door is NOT closed.', 'Car door warning: the reminder is on when the door is NOT locked.', 'Every "normally closed" contact in an industrial control panel.']
  },
  NAND: {
    title: 'NAND: alarm unless everything is OK', scene: 'Lift safety warning',
    story: 'A warning lamp on a lift is ON unless BOTH checks pass: all doors are locked AND the load is within the limit. The lamp goes off only when both conditions are true. That is NAND: AND followed by NOT. NAND is a universal gate that every chip can be built from.',
    a: { label: 'Lift doors', on: 'locked', off: 'not locked' }, b: { label: 'Load', on: 'within limit', off: 'overloaded' }, y: { label: 'Warning lamp', on: 'on', off: 'off' },
    expr: 'Y = (A · B)′', rule: 'Output is 0 only when A and B are both 1.',
    more: ['Machine guard: the "unsafe" light is on unless the guard is closed AND the operator’s hands are clear.', 'Processor chips and flash memory are built mostly from NAND gates.']
  },
  NOR: {
    title: 'NOR: true only when nothing is active', scene: 'Vacant sign',
    story: 'A meeting-room sign shows VACANT only when NEITHER the door sensor NOR the motion sensor detects anyone. If either one fires, the sign stays off. That is NOR: OR followed by NOT.',
    a: { label: 'Door sensor', on: 'triggered', off: 'quiet' }, b: { label: 'Motion sensor', on: 'detects someone', off: 'detects no one' }, y: { label: 'VACANT sign', on: 'on', off: 'off' },
    expr: 'Y = (A + B)′', rule: 'Output is 1 only when A and B are both 0.',
    more: ['"All clear" light on a rail crossing: no train on either track.', 'Reset circuit that releases only when no fault input is active.']
  },
  XOR: {
    title: 'XOR: the two inputs differ', scene: 'Two-way staircase light',
    story: 'A stair light has one switch downstairs and one upstairs. Flipping either switch changes the light. The light is ON when the two switches are in different positions. That is XOR: the output is 1 when the inputs are different.',
    a: { label: 'Downstairs switch', on: 'up', off: 'down' }, b: { label: 'Upstairs switch', on: 'up', off: 'down' }, y: { label: 'Stair light', on: 'on', off: 'off' },
    expr: 'Y = A ⊕ B', rule: 'Output is 1 when A and B are different.',
    more: ['Adders: the sum bit of a half adder is A ⊕ B.', 'Parity check: XOR of all bits tells you if the count of 1s is odd.', 'Encryption: XOR a message with a key, then XOR again to get the message back.']
  },
  XNOR: {
    title: 'XNOR: the two inputs are equal', scene: 'Redundant sensors agree',
    story: 'An aircraft or industrial plant reads the same temperature from two sensors. An "AGREE" lamp lights when both sensors give the same answer (both say hot, or both say normal). If they disagree, the lamp goes off and a technician checks them. That is XNOR: the output is 1 when the inputs are equal.',
    a: { label: 'Sensor 1', on: 'reads overheating', off: 'reads normal' }, b: { label: 'Sensor 2', on: 'reads overheating', off: 'reads normal' }, y: { label: 'AGREE lamp', on: 'on', off: 'off' },
    expr: 'Y = (A ⊕ B)′', rule: 'Output is 1 when A and B are equal.',
    more: ['Comparators: two bits are equal when XNOR of them is 1.', 'Password or code check: each digit compared with XNOR, then all results ANDed.']
  }
};

function realLife(root, gate) {
  const cfg = REAL_LIFE[gate], one = gate === 'NOT';
  let a = 0, b = 0;
  const toggle = (spec, get, set) => {
    const btn = h('button', { type: 'button', class: 'rl-toggle', 'aria-pressed': 'false' });
    const paint = () => { btn.setAttribute('aria-pressed', String(!!get())); btn.classList.toggle('on', !!get()); btn.replaceChildren(h('span', { class: 'rl-name' }, spec.label), h('span', { class: 'rl-state' }, get() ? spec.on : spec.off, h('b', null, ' = ' + get()))); };
    btn.addEventListener('click', () => { set(get() ? 0 : 1); update(); });
    btn._paint = paint; paint(); return btn;
  };
  const tA = toggle(cfg.a, () => a, (v) => { a = v; }), tB = one ? null : toggle(cfg.b, () => b, (v) => { b = v; });
  const gateBox = h('div', { class: 'rl-gate' }), outBox = h('div', { class: 'rl-out' }), ttBox = h('div', { class: 'scrollx' });
  const rows = one ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
  const words = (r) => { const y = gateEval(gate, r); const parts = [cfg.a.label + ': ' + (r[0] ? cfg.a.on : cfg.a.off)]; if (!one) parts.push(cfg.b.label + ': ' + (r[1] ? cfg.b.on : cfg.b.off)); return parts.join('; ') + ' → ' + cfg.y.label + ' ' + (y ? cfg.y.on : cfg.y.off); };
  function update() {
    tA._paint(); if (tB) tB._paint();
    const ins = one ? [a] : [a, b], y = gateEval(gate, ins);
    clear(gateBox).append(gateSvg(gate, { ins, out: y, scale: 1.15 }));
    clear(outBox).append(h('span', { class: 'led big' + (y ? ' on' : '') }), h('div', null, h('div', { class: 'rl-outname' }, cfg.y.label), h('div', { class: 'rl-outstate' }, y ? cfg.y.on : cfg.y.off, h('b', null, ' = ' + y))));
    clear(ttBox).append(h('table', { class: 'tt' }, h('thead', null, h('tr', null, (one ? ['A'] : ['A', 'B']).map((x) => h('th', null, x)), h('th', null, 'Y'), h('th', { style: { textAlign: 'left' } }, 'In words'))),
      h('tbody', null, rows.map((r) => h('tr', { class: r[0] === a && (one || r[1] === b) ? 'act' : '' }, r.map((x) => h('td', null, x)), h('td', null, gateEval(gate, r)), h('td', { style: { textAlign: 'left', fontFamily: 'var(--f-head)' } }, words(r)))))));
  }
  root.append(h('div', { class: 'rl' },
    h('div', { class: 'rl-story' }, h('div', { class: 'rl-scene' }, cfg.scene), h('p', null, cfg.story),
      h('div', { class: 'rl-rule' }, h('b', null, cfg.expr), '   ', cfg.rule),
      h('h4', null, 'More places you meet it'), h('ul', null, cfg.more.map((m) => h('li', null, m)))),
    h('div', { class: 'rl-play' }, h('h4', null, 'Try it: click the inputs'), h('div', { class: 'rl-row' }, h('div', { class: 'rl-inputs' }, tA, tB), gateBox, outBox), ttBox)));
  update();
}

/* Series (AND) and parallel (OR) switches with a lamp */
function switchAnalogy(root) {
  const st = { s: [0, 0], p: [0, 0] };
  const box = h('div', { class: 'scrollx' });
  function sw(x, y, closed, on, k, grp) {
    const g = sv('g', { style: { cursor: 'pointer' }, tabindex: '0', role: 'switch', 'aria-checked': String(!!closed), 'aria-label': `${grp} switch ${k + 1}`,
      onclick: () => { st[grp === 'series' ? 's' : 'p'][k] ^= 1; draw(); }, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); st[grp === 'series' ? 's' : 'p'][k] ^= 1; draw(); } } });
    g.append(sv('rect', { x: x - 6, y: y - 34, width: 84, height: 50, fill: 'transparent' }), sv('circle', { cx: x, cy: y, r: 5, fill: 'var(--ink)' }), sv('circle', { cx: x + 72, cy: y, r: 5, fill: 'var(--ink)' }),
      sv('line', { x1: x, y1: y, x2: closed ? x + 72 : x + 62, y2: closed ? y : y - 30, stroke: on ? 'var(--hi)' : 'var(--ink)', 'stroke-width': 4, 'stroke-linecap': 'round' }),
      sv('text', { x: x + 36, y: y + 26, 'text-anchor': 'middle', class: 'lt' }, closed ? 'closed' : 'open'));
    return g;
  }
  const wire = (d, on) => sv('path', { d, fill: 'none', stroke: on ? 'var(--hi)' : 'var(--lo)', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const lamp = (x, y, on) => { const g = sv('g'); if (on) g.append(sv('circle', { cx: x, cy: y, r: 30, fill: 'var(--led)', opacity: 0.25 })); g.append(sv('circle', { cx: x, cy: y, r: 18, fill: on ? 'var(--led)' : 'var(--led-off)', stroke: 'var(--ink)', 'stroke-width': 2.5 }), sv('path', { d: `M${x - 12},${y - 12} L${x + 12},${y + 12} M${x + 12},${y - 12} L${x - 12},${y + 12}`, stroke: 'var(--ink)', 'stroke-width': 2 })); return g; };
  const battery = (x, y) => { const g = sv('g'); g.append(sv('line', { x1: x - 14, y1: y, x2: x + 14, y2: y, stroke: 'var(--ink)', 'stroke-width': 2.5 }), sv('line', { x1: x - 8, y1: y + 10, x2: x + 8, y2: y + 10, stroke: 'var(--ink)', 'stroke-width': 6 }), sv('text', { x: x + 22, y: y + 10, class: 'lt' }, 'battery')); return g; };
  function draw() {
    const so = st.s[0] && st.s[1], po = st.p[0] || st.p[1], on1 = po && st.p[0], on2 = po && st.p[1];
    const a = sv('svg', { viewBox: '0 0 460 190', style: { width: '100%', maxWidth: '460px' }, role: 'img', 'aria-label': 'Two switches in series with a lamp' });
    a.append(wire('M40,50 H100', so), wire('M172,50 H240', so), wire('M312,50 H420 V78', so), wire('M420,114 V150 H40 V110', so), wire('M40,90 V50', so),
      battery(40, 92), sw(100, 50, st.s[0], so, 0, 'series'), sw(240, 50, st.s[1], so, 1, 'series'), lamp(420, 96, so));
    const p = sv('svg', { viewBox: '0 0 460 235', style: { width: '100%', maxWidth: '460px' }, role: 'img', 'aria-label': 'Two switches in parallel with a lamp' });
    p.append(wire('M40,140 V50 H110', on1), wire('M182,50 H330', on1), wire('M330,50 V95', on1), wire('M40,140 H110', on2), wire('M182,140 H330', on2), wire('M330,140 V95', on2),
      wire('M330,95 H400 V132', po), wire('M400,168 V215 H40 V180', po), wire('M40,160 V140', po),
      battery(40, 160), sw(110, 50, st.p[0], on1, 0, 'parallel'), sw(110, 140, st.p[1], on2, 1, 'parallel'), lamp(400, 150, po));
    clear(box).append(h('div', { class: 'rl-analogy' },
      h('div', null, h('h4', null, 'Series: both switches must be closed'), a, h('p', { class: 'small' }, `Lamp is ${so ? 'ON' : 'OFF'}. This is an AND: current flows only if switch 1 AND switch 2 are closed.`)),
      h('div', null, h('h4', null, 'Parallel: either switch is enough'), p, h('p', { class: 'small' }, `Lamp is ${po ? 'ON' : 'OFF'}. This is an OR: current flows if switch 1 OR switch 2 (or both) is closed.`))));
  }
  root.append(box); draw();
}

/* ---------- mount everything on a topic page ---------- */
function mountPage() {
  const seen = {};
  document.querySelectorAll('[data-demo]').forEach((ph) => {
    const id = ph.getAttribute('data-demo');
    if (!seen[id]) { const frag = document.createElement('div'); try { DEMOS[id](frag); } catch (e) { frag.append(h('p', { class: 'bad' }, 'This demo could not start: ' + e.message)); } seen[id] = Array.from(frag.children); }
    const part = +(ph.getAttribute('data-part') || 0); const node = seen[id][part]; if (node) ph.append(node);
  });
  document.querySelectorAll('[data-circuit]').forEach((ph) => { const k = ph.getAttribute('data-circuit'); try { createLab(ph, { compact: true, locked: true, preset: k, wave: k === 'sr-latch', noTable: k === 'sr-latch' }); } catch (e) { ph.append(h('p', { class: 'bad' }, e.message)); } });
  document.querySelectorAll('[data-reallife]').forEach((ph) => realLife(ph, ph.getAttribute('data-reallife')));
  document.querySelectorAll('[data-switch-analogy]').forEach((ph) => switchAnalogy(ph));
  document.querySelectorAll('[data-gates]').forEach((ph) => ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'].forEach((t) => ph.append(h('div', { class: 'gatefig-item' }, gateSvg(t, { scale: 1.25 }), h('div', { class: 'small muted' }, GATE_LABEL[t])))));
  document.querySelectorAll('.quiz-host').forEach((ph) => { const j = ph.parentNode.querySelector('script.quiz-json'); if (j) mountQuiz(ph, JSON.parse(j.textContent), ph.getAttribute('data-quiz-key')); });
}