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
      h('tbody', null, rows.map((r) => h('tr', { class: r[0] === a && (one || r[1] === b) ? 'act' : '' }, r.map((x) => h('td', null, x)), h('td', null, gateEval(gate, r)), h('td', { style: { textAlign: 'left', fontFamily: 'var(--f-ui)' } }, words(r)))))));
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
    const a = sv('svg', { viewBox: '0 0 460 190', style: { width: '100%', maxWidth: 'calc(460 * var(--u))' }, role: 'img', 'aria-label': 'Two switches in series with a lamp' });
    a.append(wire('M40,50 H100', so), wire('M172,50 H240', so), wire('M312,50 H420 V78', so), wire('M420,114 V150 H40 V110', so), wire('M40,90 V50', so),
      battery(40, 92), sw(100, 50, st.s[0], so, 0, 'series'), sw(240, 50, st.s[1], so, 1, 'series'), lamp(420, 96, so));
    const p = sv('svg', { viewBox: '0 0 460 235', style: { width: '100%', maxWidth: 'calc(460 * var(--u))' }, role: 'img', 'aria-label': 'Two switches in parallel with a lamp' });
    p.append(wire('M40,140 V50 H110', on1), wire('M182,50 H330', on1), wire('M330,50 V95', on1), wire('M40,140 H110', on2), wire('M182,140 H330', on2), wire('M330,140 V95', on2),
      wire('M330,95 H400 V132', po), wire('M400,168 V215 H40 V180', po), wire('M40,160 V140', po),
      battery(40, 160), sw(110, 50, st.p[0], on1, 0, 'parallel'), sw(110, 140, st.p[1], on2, 1, 'parallel'), lamp(400, 150, po));
    clear(box).append(h('div', { class: 'rl-analogy' },
      h('div', null, h('h4', null, 'Series: both switches must be closed'), a, h('p', { class: 'small' }, `Lamp is ${so ? 'ON' : 'OFF'}. This is an AND: current flows only if switch 1 AND switch 2 are closed.`)),
      h('div', null, h('h4', null, 'Parallel: either switch is enough'), p, h('p', { class: 'small' }, `Lamp is ${po ? 'ON' : 'OFF'}. This is an OR: current flows if switch 1 OR switch 2 (or both) is closed.`))));
  }
  root.append(box); draw();
}

/* ---------- switch analogies for the rest of the basic gates ---------- */
const wireX = (d, on) => sv('path', { d, fill: 'none', stroke: on ? 'var(--hi)' : 'var(--lo)', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
function lampX(x, y, on) {
  const g = sv('g');
  if (on) g.append(sv('circle', { cx: x, cy: y, r: 30, fill: 'var(--led)', opacity: 0.25 }));
  g.append(sv('circle', { cx: x, cy: y, r: 18, fill: on ? 'var(--led)' : 'var(--led-off)', stroke: 'var(--ink)', 'stroke-width': 2.5 }),
    sv('path', { d: `M${x - 12},${y - 12} L${x + 12},${y + 12} M${x + 12},${y - 12} L${x - 12},${y + 12}`, stroke: 'var(--ink)', 'stroke-width': 2 }));
  return g;
}
function batteryX(x, y, labelY = y + 10) {
  const g = sv('g');
  g.append(sv('line', { x1: x - 14, y1: y, x2: x + 14, y2: y, stroke: 'var(--ink)', 'stroke-width': 2.5 }), sv('line', { x1: x - 8, y1: y + 10, x2: x + 8, y2: y + 10, stroke: 'var(--ink)', 'stroke-width': 6 }), sv('text', { x: x + 22, y: labelY, class: 'lt' }, 'battery'));
  return g;
}
/* visClosed: whether the contact is drawn made (this is what the wire highlighting follows). wireOn: whether current actually reaches this point. labelText is shown verbatim, so callers control whether it reads as the raw input or its complement. */
function swX(x, y, visClosed, wireOn, labelText, onclick) {
  const g = sv('g', { style: { cursor: 'pointer' }, tabindex: '0', role: 'switch', 'aria-checked': String(!!visClosed), 'aria-label': labelText,
    onclick, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onclick(); } } });
  g.append(sv('rect', { x: x - 6, y: y - 34, width: 84, height: 50, fill: 'transparent' }), sv('circle', { cx: x, cy: y, r: 5, fill: 'var(--ink)' }), sv('circle', { cx: x + 72, cy: y, r: 5, fill: 'var(--ink)' }),
    sv('line', { x1: x, y1: y, x2: visClosed ? x + 72 : x + 62, y2: visClosed ? y : y - 30, stroke: wireOn ? 'var(--hi)' : 'var(--ink)', 'stroke-width': 4, 'stroke-linecap': 'round' }),
    sv('text', { x: x + 36, y: y + 26, 'text-anchor': 'middle', class: 'lt' }, labelText));
  return g;
}

/* Buffer: switch in series with the lamp, same idea as AND/OR. */
function bufferNotAnalogy(root) {
  const st = { buf: 0, not: 0 };
  const box = h('div', { class: 'scrollx' });
  function bufferSvg(val, onclick) {
    const on = !!val;
    const svg = sv('svg', { viewBox: '0 0 360 190', style: { width: '100%', maxWidth: 'calc(360 * var(--u))' }, role: 'img', 'aria-label': 'One switch with a lamp' });
    svg.append(wireX('M40,50 H100', on), wireX('M172,50 H310 V78', on), wireX('M310,114 V150 H40 V110', on), wireX('M40,90 V50', on),
      batteryX(40, 92), swX(100, 50, on, on, `A = ${val}`, onclick), lampX(310, 96, on));
    return { svg, on };
  }
  /* NOT: the switch is wired in PARALLEL with the lamp, not in series. Closing it shorts the lamp out
     (current takes the easy path through the switch instead), so the lamp goes off exactly when A turns on. */
  function notSvg(val, onclick) {
    const branchOn = !!val, mainOn = !branchOn;
    const svg = sv('svg', { viewBox: '0 0 360 220', style: { width: '100%', maxWidth: 'calc(360 * var(--u))' }, role: 'img', 'aria-label': 'A switch wired in parallel with the lamp, to short it out' });
    svg.append(
      // current always reaches the split point and always returns to the battery afterward,
      // whichever of the two paths (lamp or short) it actually took in between
      wireX('M40,110 V50 H120', true), wireX('M120,50 H192', mainOn), wireX('M228,50 H300', mainOn), wireX('M300,50 V170 H40 V130', true),
      wireX('M120,50 V140 H156', branchOn), wireX('M228,140 H300 V50', branchOn),
      batteryX(40, 110), lampX(210, 50, mainOn), swX(156, 140, branchOn, branchOn, `A = ${val}`, onclick));
    return { svg, on: mainOn };
  }
  function draw() {
    const bufR = bufferSvg(st.buf, () => { st.buf ^= 1; draw(); });
    const notR = notSvg(st.not, () => { st.not ^= 1; draw(); });
    clear(box).append(h('div', { class: 'rl-analogy' },
      h('div', null, h('h4', null, 'Buffer: the lamp just follows the switch'), bufR.svg, h('p', { class: 'small' }, `Lamp is ${bufR.on ? 'ON' : 'OFF'}. A buffer's output is simply its input, repeated — handy for boosting a weak signal without changing what it means.`)),
      h('div', null, h('h4', null, 'NOT: a switch wired around the lamp, not into its path'), notR.svg, h('p', { class: 'small' }, `Lamp is ${notR.on ? 'ON' : 'OFF'}. Closing switch A gives current an easy shortcut straight past the lamp — it "shorts" the lamp out, so the lamp goes dark exactly when A turns on, and lights up again once A opens and current has nowhere to go but through it.`))));
  }
  root.append(box); draw();
}

/* NAND and NOR reuse the exact AND/OR wiring shapes (series = AND, parallel = OR), but as a shorting
   branch wired around the lamp instead of as the lamp's only path — the same trick as NOT, just with
   the AND/OR switch combination doing the shorting instead of a single switch. */
function nandNorAnalogy(root) {
  const state = { n: [0, 0], r: [0, 0] };
  const box = h('div', { class: 'scrollx' });
  function nandSvg(a, b, onA, onB) {
    const branchOn = !!(a && b), mainOn = !branchOn;
    const svg = sv('svg', { viewBox: '0 0 460 220', style: { width: '100%', maxWidth: 'calc(460 * var(--u))' }, role: 'img', 'aria-label': 'Two switches in series, wired as a shorting branch around the lamp' });
    svg.append(
      wireX('M40,110 V50 H120', true), wireX('M120,50 H232', mainOn), wireX('M268,50 H420', mainOn), wireX('M420,50 V170 H40 V130', true),
      wireX('M120,50 V140 H140', branchOn), wireX('M212,140 H280', branchOn), wireX('M352,140 H420 V50', branchOn),
      batteryX(40, 110), lampX(250, 50, mainOn),
      swX(140, 140, !!a, branchOn, `A = ${a}`, onA), swX(280, 140, !!b, branchOn, `B = ${b}`, onB));
    return { svg, on: mainOn };
  }
  function norSvg(a, b, onA, onB) {
    // A single trunk taps off the main wire before the lamp, splits into the two switches
    // (stacked in the middle of the diagram), and both rejoin the same wire on the way to the
    // battery — the same shape as two switches in parallel across a lamp in a textbook diagram.
    const vcA = !!a, vcB = !!b, branchOn = vcA || vcB, onA_ = branchOn && vcA, onB_ = branchOn && vcB, mainOn = !branchOn;
    const svg = sv('svg', { viewBox: '0 0 460 230', style: { width: '100%', maxWidth: 'calc(460 * var(--u))' }, role: 'img', 'aria-label': 'Two switches in parallel, tapped off the middle of a branch that shorts the lamp' });
    svg.append(
      wireX('M40,190 V50 H120', true), wireX('M120,50 H262', mainOn), wireX('M298,50 H420', mainOn),
      wireX('M420,50 V110', mainOn), wireX('M420,110 V230 H40 V190', true),
      wireX('M120,50 V110', branchOn), wireX('M120,110 H190', onA_), wireX('M120,110 V170 H190', onB_),
      wireX('M262,110 H330', onA_), wireX('M262,170 H330 V110', onB_), wireX('M330,110 H420', branchOn),
      batteryX(40, 190), lampX(280, 50, mainOn),
      swX(190, 110, vcA, onA_, `A = ${a}`, onA), swX(190, 170, vcB, onB_, `B = ${b}`, onB));
    return { svg, on: mainOn };
  }
  function draw() {
    const nandR = nandSvg(state.n[0], state.n[1], () => { state.n[0] ^= 1; draw(); }, () => { state.n[1] ^= 1; draw(); });
    const norR = norSvg(state.r[0], state.r[1], () => { state.r[0] ^= 1; draw(); }, () => { state.r[1] ^= 1; draw(); });
    clear(box).append(h('div', { class: 'rl-analogy' },
      h('div', null, h('h4', null, 'NAND: an AND pair, shorting the lamp'), nandR.svg, h('p', { class: 'small' }, `Lamp is ${nandR.on ? 'ON' : 'OFF'}. The two switches are wired in series, exactly like AND — so that branch only completes (and shorts the lamp out) when both A and B are closed. Any other combination leaves the branch open, so current has to go through the lamp.`)),
      h('div', null, h('h4', null, 'NOR: an OR pair, shorting the lamp'), norR.svg, h('p', { class: 'small' }, `Lamp is ${norR.on ? 'ON' : 'OFF'}. The two switches are wired in parallel, exactly like OR — so the branch shorts the lamp out if A or B (or both) is closed. Only when both stay open does the lamp get any current.`))));
  }
  root.append(box); draw();
}

/* XOR and XNOR: a bridge of two series pairs in parallel, using SOP form directly (XOR = AB′ + A′B, XNOR = AB + A′B′) */
function xorXnorAnalogy(root) {
  const st = { xa: 0, xb: 0, na: 0, nb: 0 };
  const box = h('div', { class: 'scrollx' });
  function bridge(aVal, bVal, row1, row2, onA, onB) {
    const vc = (val, inv) => (inv ? !val : !!val);
    const r1a = vc(aVal, row1.aInv), r1b = vc(bVal, row1.bInv), r1 = r1a && r1b;
    const r2a = vc(aVal, row2.aInv), r2b = vc(bVal, row2.bInv), r2 = r2a && r2b;
    const lampOn = r1 || r2;
    const labA = (inv) => `${inv ? "A′" : 'A'} = ${inv ? (aVal ? 0 : 1) : aVal}`;
    const labB = (inv) => `${inv ? "B′" : 'B'} = ${inv ? (bVal ? 0 : 1) : bVal}`;
    const svg = sv('svg', { viewBox: '0 0 560 235', style: { width: '100%', maxWidth: 'calc(560 * var(--u))' }, role: 'img', 'aria-label': 'Bridge circuit with four switches and a lamp' });
    svg.append(wireX('M40,140 V50 H110', r1), wireX('M182,50 H250', r1), wireX('M322,50 H420 V95', r1),
      wireX('M40,140 H110', r2), wireX('M182,140 H250', r2), wireX('M322,140 H420 V95', r2),
      wireX('M420,95 H480 V132', lampOn), wireX('M480,168 V215 H40 V180', lampOn), wireX('M40,160 V140', lampOn),
      batteryX(40, 160, 198),
      swX(110, 50, r1a, r1, labA(row1.aInv), onA), swX(250, 50, r1b, r1, labB(row1.bInv), onB),
      swX(110, 140, r2a, r2, labA(row2.aInv), onA), swX(250, 140, r2b, r2, labB(row2.bInv), onB),
      lampX(480, 150, lampOn));
    return { svg, lampOn };
  }
  function draw() {
    const xorR = bridge(st.xa, st.xb, { aInv: false, bInv: true }, { aInv: true, bInv: false }, () => { st.xa ^= 1; draw(); }, () => { st.xb ^= 1; draw(); });
    const xnorR = bridge(st.na, st.nb, { aInv: false, bInv: false }, { aInv: true, bInv: true }, () => { st.na ^= 1; draw(); }, () => { st.nb ^= 1; draw(); });
    clear(box).append(h('div', { class: 'rl-analogy' },
      h('div', null, h('h4', null, 'XOR: on when the inputs disagree'), xorR.svg, h('p', { class: 'small' }, `Lamp is ${xorR.lampOn ? 'ON' : 'OFF'}. The top row conducts when A is 1 and B is 0; the bottom row conducts when A is 0 and B is 1. Either path lights the lamp — this is exactly the two-way staircase-light switch.`)),
      h('div', null, h('h4', null, 'XNOR: on when the inputs agree'), xnorR.svg, h('p', { class: 'small' }, `Lamp is ${xnorR.lampOn ? 'ON' : 'OFF'}. The top row conducts when both are 1; the bottom row when both are 0. It's the mirror image of XOR: swap which pair of contacts is inverted, and "different" turns into "the same".`))));
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
  document.querySelectorAll('[data-switch-analogy-bufnot]').forEach((ph) => bufferNotAnalogy(ph));
  document.querySelectorAll('[data-switch-analogy-nandnor]').forEach((ph) => nandNorAnalogy(ph));
  document.querySelectorAll('[data-switch-analogy-xorxnor]').forEach((ph) => xorXnorAnalogy(ph));
  document.querySelectorAll('[data-gates]').forEach((ph) => ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'].forEach((t) => ph.append(h('div', { class: 'gatefig-item' }, gateSvg(t, { scale: 1.25 }), h('div', { class: 'small muted' }, GATE_LABEL[t])))));
  document.querySelectorAll('.quiz-host').forEach((ph) => { const j = ph.parentNode.querySelector('script.quiz-json'); if (j) mountQuiz(ph, JSON.parse(j.textContent), ph.getAttribute('data-quiz-key')); });
}
