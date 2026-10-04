/* ===================== art.js : one decorative illustration per topic ===================== */
/* Shown on each topic's title slide and as a thumbnail in the topic list.
   Mount with <span class="topic-art" data-art="3" aria-hidden="true"></span>; colours come from the
   theme variables, so the drawings follow light and dark mode. */
const TOPIC_ART = (() => {
  const bg = '<circle cx="200" cy="165" r="142" class="ta-bg"/>';
  const head = (id) => `<defs><marker id="ta${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ta-fill-ink"/></marker></defs>`;
  const arrow = (id) => `marker-end="url(#ta${id})"`;
  return {
    /* 1. Introduction: an analog wave becomes a digital signal of 0s and 1s */
    1: `${bg}
      <rect x="62" y="70" width="276" height="80" rx="14" class="ta-card"/>
      <path d="M78,110 C100,70 122,70 144,110 S188,150 210,110 S254,70 276,110 S310,140 322,118" class="ta-line"/>
      <rect x="62" y="176" width="276" height="88" rx="14" class="ta-card"/>
      <path d="M78,244 H118 V196 H168 V244 H198 V196 H278 V244 H322" class="ta-line-acc"/>
      <text x="98" y="226" class="ta-m">0</text><text x="143" y="226" class="ta-m">1</text><text x="183" y="226" class="ta-m">0</text><text x="238" y="226" class="ta-m">1</text>
      <text x="200" y="58" class="ta-s">analog → digital</text>`,
    /* 2. Number systems: one value in binary, decimal and hex */
    2: `${bg}
      ${[0, 1, 2, 3].map((i) => `<rect x="${86 + i * 58}" y="84" width="52" height="62" rx="10" class="${'1011'[i] === '1' ? 'ta-soft2' : 'ta-card'}"/><text x="${112 + i * 58}" y="125" class="ta-m ta-big">${'1011'[i]}</text><text x="${112 + i * 58}" y="70" class="ta-s">${[8, 4, 2, 1][i]}</text>`).join('')}
      <rect x="92" y="186" width="96" height="62" rx="14" class="ta-ac"/><text x="140" y="226" class="ta-m ta-big ta-on-ac">11</text>
      <rect x="212" y="186" width="96" height="62" rx="14" class="ta-acc"/><text x="260" y="226" class="ta-m ta-big ta-on-ac">B</text>
      <text x="140" y="276" class="ta-s">decimal</text><text x="260" y="276" class="ta-s">hex</text>`,
    /* 3. Boolean algebra and gates: an AND gate with its truth */
    3: `${bg}
      <path d="M126,92 H196 A73,73 0 0 1 196,238 H126 Z" class="ta-soft1"/>
      <path d="M66,124 H126 M66,206 H126 M269,165 H334" class="ta-line"/>
      <circle cx="66" cy="124" r="9" class="ta-acc"/><circle cx="66" cy="206" r="9" class="ta-acc"/><circle cx="334" cy="165" r="12" class="ta-acc"/>
      <text x="66" y="104" class="ta-m">A</text><text x="66" y="238" class="ta-m">B</text>
      <text x="190" y="173" class="ta-m ta-big">&amp;</text>
      <rect x="250" y="40" width="110" height="46" rx="12" class="ta-card"/><text x="305" y="70" class="ta-m">A·B</text>`,
    /* 4. Universal gates and K-maps: a 4×4 map with a group of 1s */
    4: `${bg}
      ${[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${104 + c * 48}" y="70 " width="48" height="48" class="ta-card" transform="translate(0 ${r * 48})"/>`).join('')).join('')}
      ${[[1, 1], [1, 2], [2, 1], [2, 2], [0, 3]].map(([r, c]) => `<text x="${128 + c * 48}" y="${102 + r * 48}" class="ta-m">1</text>`).join('')}
      <rect x="148" y="114" width="104" height="104" rx="18" class="ta-ring-acc"/>
      <text x="200" y="290" class="ta-s">group the 1s</text>`,
    /* 5. Combinational logic: a half adder block */
    5: `${bg}
      <rect x="128" y="88" width="144" height="154" rx="16" class="ta-soft1"/>
      <text x="200" y="176" class="ta-m ta-big">Σ</text>
      <path d="M66,126 H128 M66,204 H128 M272,126 H334 M272,204 H334" class="ta-line"/>
      <text x="56" y="132" class="ta-m" text-anchor="end">A</text><text x="56" y="210" class="ta-m">B</text>
      <text x="350" y="132" class="ta-m">S</text><text x="350" y="210" class="ta-m">C</text>
      <rect x="140" y="262" width="120" height="36" rx="18" class="ta-acc"/><text x="200" y="286" class="ta-s ta-on-ac">1 + 1 = 10</text>`,
    /* 6. Decoders, encoders and multiplexers: a 4-to-1 MUX */
    6: `${bg}
      <path d="M150,70 L250,110 V220 L150,260 Z" class="ta-soft2"/>
      <text x="200" y="172" class="ta-m">MUX</text>
      ${[0, 1, 2, 3].map((i) => `<path d="M78,${100 + i * 44} H150" class="ta-line"/><circle cx="78" cy="${100 + i * 44}" r="8" class="${i === 2 ? 'ta-acc' : 'ta-faint'}"/>`).join('')}
      <path d="M250,165 H330" class="ta-line-acc"/><circle cx="330" cy="165" r="10" class="ta-acc"/>
      <path d="M185,250 V292 M215,238 V292" class="ta-line"/>
      <text x="200" y="312" class="ta-s">select = 10</text>`,
    /* 7. Latches and flip-flops: a D flip-flop with a clock */
    7: `${bg}
      <rect x="136" y="78" width="128" height="170" rx="12" class="ta-soft1"/>
      <path d="M136,206 L156,218 L136,230" class="ta-line"/>
      <path d="M72,120 H136 M72,218 H136 M264,120 H330 M264,206 H330" class="ta-line"/>
      <text x="160" y="128" class="ta-m">D</text><text x="240" y="128" class="ta-m">Q</text><text x="240" y="214" class="ta-m">Q̄</text>
      <path d="M44,276 H74 V250 H104 V276 H134 V250 H164 V276 H194" class="ta-line-acc"/>
      <text x="300" y="290" class="ta-s">clock edge</text>`,
    /* 8. State machines: three states and transitions */
    8: `${head(8)}${bg}
      <circle cx="110" cy="120" r="40" class="ta-soft1"/><circle cx="290" cy="120" r="40" class="ta-soft1"/><circle cx="200" cy="246" r="40" class="ta-soft2"/>
      <circle cx="200" cy="246" r="32" class="ta-ring-thin"/>
      <text x="110" y="127" class="ta-m">S0</text><text x="290" y="127" class="ta-m">S1</text><text x="200" y="253" class="ta-m">S2</text>
      <path d="M150,110 Q200,84 250,110" class="ta-line" ${arrow(8)}/>
      <path d="M278,158 Q262,212 236,226" class="ta-line" ${arrow(8)}/>
      <path d="M164,226 Q132,206 118,160" class="ta-line" ${arrow(8)}/>
      <text x="200" y="88" class="ta-s">1</text><text x="282" y="208" class="ta-s">1</text><text x="118" y="210" class="ta-s">0</text>`,
    /* 9. Counters: three flip-flops counting up */
    9: `${head(9)}${bg}
      ${[0, 1, 2].map((i) => `<rect x="${86 + i * 80}" y="96" width="68" height="86" rx="12" class="ta-soft1"/><text x="${120 + i * 80}" y="152" class="ta-m ta-big">${'011'[i]}</text>`).join('')}
      <path d="M120,214 Q200,262 280,214" class="ta-line" ${arrow(9)}/>
      <rect x="150" y="236" width="100" height="44" rx="22" class="ta-acc"/><text x="200" y="265" class="ta-m ta-on-ac">+1</text>
      <text x="200" y="74" class="ta-s">3 → 4 → 5 …</text>`,
    /* 10. Registers: a shift register moving bits right */
    10: `${head(10)}${bg}
      ${[0, 1, 2, 3].map((i) => `<rect x="${80 + i * 62}" y="122" width="56" height="70" rx="10" class="${i === 0 ? 'ta-soft2' : 'ta-card'}"/><text x="${108 + i * 62}" y="166" class="ta-m ta-big">${'1101'[i]}</text>`).join('')}
      <path d="M90,226 H300" class="ta-line-acc" ${arrow(10)}/>
      <path d="M40,157 H78" class="ta-line" ${arrow(10)}/>
      <text x="200" y="100" class="ta-s">shift right</text>`,
    /* 11. Memory and error correction: a memory grid with a parity bit */
    11: `${bg}
      <rect x="90" y="68" width="220" height="190" rx="14" class="ta-card"/>
      ${[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${108 + c * 38}" y="${86 + r * 40}" width="30" height="30" rx="5" class="${c === 4 ? 'ta-soft2' : (r + c) % 3 ? 'ta-faint' : 'ta-ac'}"/>`).join('')).join('')}
      ${[0, 1, 2, 3].map((r) => `<path d="M62,${101 + r * 40} H90 M310,${101 + r * 40} H338" class="ta-line"/>`).join('')}
      <text x="200" y="290" class="ta-s">data + parity</text>`,
    /* 12. ROM and programmable logic: an AND–OR array with fuses */
    12: `${bg}
      ${[0, 1, 2, 3].map((i) => `<path d="M${120 + i * 44},64 V266" class="ta-line-thin"/>`).join('')}
      ${[0, 1, 2, 3].map((i) => `<path d="M90,${96 + i * 46} H310" class="ta-line-thin"/>`).join('')}
      ${[[0, 0], [1, 1], [3, 1], [2, 2], [0, 3], [3, 3], [1, 0]].map(([c, r]) => `<circle cx="${120 + c * 44}" cy="${96 + r * 46}" r="9" class="${r % 2 ? 'ta-acc' : 'ta-ac'}"/>`).join('')}
      <rect x="300" y="78" width="60" height="174" rx="10" class="ta-soft2"/><text x="330" y="172" class="ta-m">OR</text>
      <text x="186" y="296" class="ta-s">programmed links</text>`,
    /* 13. Digital systems: a processor chip */
    13: `${bg}
      <rect x="116" y="82" width="168" height="168" rx="16" class="ta-soft1"/>
      <rect x="152" y="118" width="96" height="96" rx="10" class="ta-ac"/><text x="200" y="174" class="ta-m ta-on-ac">CPU</text>
      ${[0, 1, 2, 3, 4].map((i) => { const p = 104 + i * 30; return `<path d="M${p},60 V82 M${p + 12},250 V272 M94,${p} H116 M284,${p + 12} H306" class="ta-line"/>`; }).join('')}`,
  };
})();

(function mountTopicArt() {
  document.querySelectorAll('[data-art]').forEach((el) => {
    const art = TOPIC_ART[el.getAttribute('data-art')];
    if (art) el.innerHTML = `<svg viewBox="0 0 400 320" class="ta-svg" focusable="false">${art}</svg>`;
  });
})();
