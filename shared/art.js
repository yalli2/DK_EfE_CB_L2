/* English for Everyone · Level 2 — 직접 그린 SVG 그림 모음 (교재 삽화 아님) */
(function (global) {
  'use strict';
  const ART = {};
  const f1 = n => (+n).toFixed(1);
  ART.svg = (vb, inner, label, extra) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label || ''}" ${extra || ''}>${inner}</svg>`;

  /* ───── 사람 그림 ───── */
  const SK = { a: '#f6d2b0', b: '#e2ac80', c: '#b9794f', d: '#8d5a3a' };
  ART.SK = SK;
  function limb(x, y, len, ang, w, col) {
    const a = ang * Math.PI / 180, x2 = x + Math.sin(a) * len, y2 = y + Math.cos(a) * len;
    return { svg: `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`, x: x2, y: y2 };
  }
  function fig(o) {
    o = Object.assign({ x: 0, y: 0, s: 1, skin: SK.a, top: '#3b82f6', pants: '#374151', hair: '#2b2118', hs: 'short', hat: null, hc: '#222', skirt: null, arms: [-12, 12], legs: [-5, 5], al: 26, ll: 34, tie: null, shoes: '#2a2a2a', face: 1 }, o);
    let g = `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${o.s})">`;
    if (o.hs === 'long') g += `<rect x="-11.5" y="-93" width="23" height="34" rx="10" fill="${o.hair}"/>`;
    // legs
    const legCol = o.skirt ? o.skin : o.pants, lw = o.skirt ? 6 : 8, ll = o.skirt ? o.ll - 6 : o.ll, hy = o.skirt ? -30 : -36;
    [-4.5, 4.5].forEach((hx, i) => {
      const L = limb(hx, hy, ll, o.legs[i], lw, legCol); g += L.svg;
      g += `<ellipse cx="${f1(L.x + (o.legs[i] > 40 ? 3 : 0))}" cy="${f1(L.y + 1)}" rx="5.2" ry="3.2" fill="${o.shoes}"/>`;
    });
    g += `<rect x="-10" y="-72" width="20" height="38" rx="8" fill="${o.top}"/>`;
    if (o.skirt) g += `<path d="M-10.5,-46 L10.5,-46 L17,-22 L-17,-22 Z" fill="${o.skirt}"/>`;
    if (o.tie) g += `<path d="M0,-70 L-3,-66 L0,-48 L3,-66 Z" fill="${o.tie}"/>`;
    const hands = [];
    [-9, 9].forEach((sx, i) => { const A = limb(sx, -66, o.al, o.arms[i], 7, o.top); g += A.svg; hands.push(A); });
    hands.forEach(A => { g += `<circle cx="${f1(A.x)}" cy="${f1(A.y)}" r="4.3" fill="${o.skin}"/>`; });
    g += `<rect x="-3.5" y="-76" width="7" height="8" fill="${o.skin}"/>`;
    g += `<circle cx="0" cy="-85" r="10.5" fill="${o.skin}"/>`;
    if (o.hs === 'short') g += `<path d="M-10.8,-84 A10.8,10.8 0 0 1 10.8,-84 Q4,-91 -10.8,-84Z" fill="${o.hair}"/>`;
    if (o.hs === 'long') g += `<path d="M-11,-83 A11,11 0 0 1 11,-83 Q0,-93 -11,-83Z" fill="${o.hair}"/>`;
    if (o.face) g += `<circle cx="-3.6" cy="-85" r="1.1" fill="#2b2118"/><circle cx="3.6" cy="-85" r="1.1" fill="#2b2118"/><path d="M-3,-80.5 Q0,-78 3,-80.5" stroke="#2b2118" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    if (o.hat === 'brim') g += `<ellipse cx="0" cy="-92" rx="17" ry="4.2" fill="${o.hc}"/><path d="M-9,-92 Q-9,-107 0,-107 Q9,-107 9,-92Z" fill="${o.hc}"/>` + (o.flowers ? `<circle cx="-6" cy="-95" r="2.6" fill="#ff6fa8"/><circle cx="-1" cy="-97" r="2.6" fill="#ff9ac1"/><circle cx="5" cy="-95" r="2.6" fill="#ff6fa8"/>` : '<rect x="-9" y="-97" width="18" height="3.2" fill="#555"/>');
    if (o.hat === 'cap') g += `<path d="M-10.8,-88 A10.8,10.8 0 0 1 10.8,-88Z" fill="${o.hc}"/><rect x="2" y="-90" width="14" height="3" rx="1.5" fill="${o.hc}"/>`;
    if (o.hat === 'hard') g += `<path d="M-11.5,-90 A11.5,10 0 0 1 11.5,-90Z" fill="${o.hc}"/><rect x="-13" y="-91" width="26" height="3" rx="1.5" fill="${o.hc}"/>`;
    if (o.hat === 'phones') g += `<path d="M-11.5,-85 A11.5,12 0 0 1 11.5,-85" stroke="#333" stroke-width="2.6" fill="none"/><rect x="-14" y="-88" width="5" height="9" rx="2.4" fill="#e23d3d"/><rect x="9" y="-88" width="5" height="9" rx="2.4" fill="#e23d3d"/>`;
    return g + '</g>';
  }
  ART.fig = fig;
  const person = (o, vb) => ART.svg(vb || '-45 -118 90 124', fig(o), '사람 그림');
  ART.portrait = (o, bg) => ART.svg('-48 -112 96 120', `<rect x="-48" y="-112" width="96" height="120" rx="8" fill="${bg || '#f3e9da'}"/>` + fig(Object.assign({ y: -4, s: 1.05 }, o)), '인물 사진 그림');

  /* ───── 시계 ───── */
  ART.clock = function (hh, mm, size) {
    const a = ((hh % 12) + mm / 60) * 30 - 90, b = mm * 6 - 90, r = Math.PI / 180;
    let t = '';
    for (let i = 0; i < 12; i++) { const q = i * 30 * r; t += `<line x1="${f1(50 + 40 * Math.cos(q))}" y1="${f1(50 + 40 * Math.sin(q))}" x2="${f1(50 + (i % 3 ? 44 : 37) * Math.cos(q))}" y2="${f1(50 + (i % 3 ? 44 : 37) * Math.sin(q))}" stroke="currentColor" stroke-width="${i % 3 ? 1.5 : 3}"/>`; }
    return `<svg viewBox="0 0 100 100" width="${size || 64}" height="${size || 64}" role="img" aria-label="${hh}:${String(mm).padStart(2, '0')}" style="color:var(--ink)"><circle cx="50" cy="50" r="47" fill="var(--card)" stroke="var(--accent)" stroke-width="4"/>${t}<line x1="50" y1="50" x2="${f1(50 + 24 * Math.cos(a * r))}" y2="${f1(50 + 24 * Math.sin(a * r))}" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="50" y1="50" x2="${f1(50 + 35 * Math.cos(b * r))}" y2="${f1(50 + 35 * Math.sin(b * r))}" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="50" r="3.5" fill="var(--accent)"/></svg>`;
  };

  /* ───── 국기(단순화) ───── */
  ART.flag = function (c) {
    const w = 60, h = 40; let s = '';
    if (c === 'fr') s = `<rect width="20" height="40" fill="#2a4aa8"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#e23d3d"/>`;
    if (c === 'uk') s = `<rect width="60" height="40" fill="#25427d"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#d6283b" stroke-width="3"/><path d="M30,0V40M0,20H60" stroke="#fff" stroke-width="12"/><path d="M30,0V40M0,20H60" stroke="#d6283b" stroke-width="7"/>`;
    if (c === 'ca') s = `<rect width="60" height="40" fill="#fff"/><rect width="15" height="40" fill="#d6283b"/><rect x="45" width="15" height="40" fill="#d6283b"/><path d="M30,9 L33,16 L38,14 L36,22 L40,22 L32,28 L32,33 L30,33 L28,33 L28,28 L20,22 L24,22 L22,14 L27,16Z" fill="#d6283b"/>`;
    if (c === 'us') s = `<rect width="60" height="40" fill="#fff"/><path d="M0,3 H60 M0,9 H60 M0,15 H60 M0,21 H60 M0,27 H60 M0,33 H60 M0,39 H60" stroke="#d6283b" stroke-width="3.2"/><rect width="26" height="22" fill="#25427d"/><circle cx="6" cy="5" r="1.4" fill="#fff"/><circle cx="13" cy="5" r="1.4" fill="#fff"/><circle cx="20" cy="5" r="1.4" fill="#fff"/><circle cx="9" cy="11" r="1.4" fill="#fff"/><circle cx="16" cy="11" r="1.4" fill="#fff"/><circle cx="6" cy="17" r="1.4" fill="#fff"/><circle cx="13" cy="17" r="1.4" fill="#fff"/><circle cx="20" cy="17" r="1.4" fill="#fff"/>`;
    if (c === 'nz') s = `<rect width="60" height="40" fill="#25427d"/><rect width="28" height="20" fill="#25427d"/><path d="M0,0 L28,20 M28,0 L0,20" stroke="#fff" stroke-width="4"/><path d="M14,0V20M0,10H28" stroke="#fff" stroke-width="6"/><path d="M14,0V20M0,10H28" stroke="#d6283b" stroke-width="3"/><circle cx="44" cy="8" r="2.4" fill="#d6283b" stroke="#fff"/><circle cx="50" cy="20" r="2.4" fill="#d6283b" stroke="#fff"/><circle cx="40" cy="30" r="2.4" fill="#d6283b" stroke="#fff"/><circle cx="46" cy="34" r="2" fill="#d6283b" stroke="#fff"/>`;
    if (c === 'au') s = `<rect width="60" height="40" fill="#25427d"/><rect width="28" height="20" fill="#25427d"/><path d="M0,0 L28,20 M28,0 L0,20" stroke="#fff" stroke-width="4"/><path d="M14,0V20M0,10H28" stroke="#fff" stroke-width="6"/><path d="M14,0V20M0,10H28" stroke="#d6283b" stroke-width="3"/><circle cx="14" cy="30" r="3.5" fill="#fff"/><circle cx="44" cy="10" r="2.5" fill="#fff"/><circle cx="50" cy="22" r="2.5" fill="#fff"/><circle cx="40" cy="30" r="2.5" fill="#fff"/><circle cx="46" cy="34" r="2" fill="#fff"/>`;
    return ART.svg(`0 0 ${w} ${h}`, `<g stroke="#00000022" stroke-width="1">${s}</g><rect width="60" height="40" fill="none" stroke="#0003" stroke-width="1.5" rx="2"/>`, c + ' flag');
  };

  /* ───── 의류 아이콘 (viewBox 64) ───── */
  const cl = (inner, label) => ART.svg('0 0 64 64', inner, label);
  ART.clothes = {
    dress: c => cl(`<path d="M24,6 L28,6 L32,14 L36,6 L40,6 L44,18 L38,26 L48,58 L16,58 L26,26 L20,18Z" fill="${c}"/><path d="M26,26 H38" stroke="#0003" stroke-width="2"/>`, 'dress'),
    skirt: c => cl(`<path d="M20,14 H44 L54,56 H10Z" fill="${c}"/><rect x="20" y="10" width="24" height="6" rx="2" fill="${c}" stroke="#0003"/><path d="M30,20 L26,56 M38,20 L42,56" stroke="#0002" stroke-width="2"/>`, 'skirt'),
    jacket: c => cl(`<path d="M22,8 L32,16 L42,8 L58,18 L52,34 L46,30 V58 H18 V30 L12,34 L6,18Z" fill="${c}"/><path d="M32,16 V58" stroke="#0004" stroke-width="2"/><path d="M22,8 L32,28 L42,8" fill="none" stroke="#0004" stroke-width="2"/><circle cx="35" cy="34" r="1.6" fill="#0006"/><circle cx="35" cy="44" r="1.6" fill="#0006"/>`, 'jacket'),
    jeans: c => cl(`<path d="M16,6 H48 L50,58 H35 L32,24 L29,58 H14Z" fill="${c}"/><path d="M16,12 H48" stroke="#fff6" stroke-width="2" stroke-dasharray="3 2"/><path d="M32,12 V24" stroke="#0004" stroke-width="2"/>`, 'jeans'),
    hat: c => cl(`<ellipse cx="32" cy="42" rx="28" ry="8" fill="${c}"/><path d="M16,42 Q16,12 32,12 Q48,12 48,42Z" fill="${c}"/><rect x="16" y="32" width="32" height="6" fill="#0005"/>`, 'hat'),
    suit: c => cl(`<path d="M22,6 L32,14 L42,6 L58,16 L53,36 L46,32 V60 H18 V32 L11,36 L6,16Z" fill="${c}"/><path d="M26,8 L32,14 L38,8 L32,40Z" fill="#fff"/><path d="M32,14 L29.5,18 L32,36 L34.5,18Z" fill="#c0392b"/><path d="M22,6 L32,30 L26,8Z M42,6 L32,30 L38,8Z" fill="#0003"/>`, 'suit'),
    tie: c => cl(`<path d="M26,6 H38 L36,16 L42,52 L32,60 L22,52 L28,16Z" fill="${c}"/><path d="M27,12 H37" stroke="#0004" stroke-width="2"/>`, 'tie'),
    boots: c => cl(`<path d="M10,6 H26 V36 L40,40 Q46,42 46,50 V54 H10Z" fill="${c}"/><path d="M40,14 H54 V36 L58,40 Q62,44 60,50 V54 H40Z" fill="${c}" opacity=".85"/><rect x="10" y="50" width="36" height="4" fill="#0004"/>`, 'boots'),
    coat: c => cl(`<path d="M22,6 L32,14 L42,6 L58,16 L56,60 H46 V30 L44,34 V60 H20 V34 L18,30 V60 H8 L6,16Z" fill="${c}"/><path d="M32,14 V60" stroke="#0004" stroke-width="2"/><circle cx="29" cy="28" r="1.8" fill="#0006"/><circle cx="29" cy="38" r="1.8" fill="#0006"/><circle cx="29" cy="48" r="1.8" fill="#0006"/>`, 'coat'),
    sweater: c => cl(`<path d="M22,8 Q32,16 42,8 L60,20 L54,38 L46,34 V58 H18 V34 L10,38 L4,20Z" fill="${c}"/><path d="M22,8 Q32,16 42,8" fill="none" stroke="#0004" stroke-width="3"/><path d="M18,52 H46 M18,46 H46" stroke="#0003" stroke-width="1.5"/>`, 'sweater'),
    shirt: c => cl(`<path d="M22,8 L32,14 L42,8 L58,18 L52,32 L46,28 V58 H18 V28 L12,32 L6,18Z" fill="${c}"/><path d="M24,8 L32,22 L40,8" fill="#fff" stroke="#0003" stroke-width="1.5"/>`, 'shirt'),
    shoes: c => cl(`<path d="M6,38 H28 L34,44 H58 Q60,44 60,48 V52 H6Z" fill="${c}"/><rect x="6" y="50" width="54" height="4" fill="#0004"/><path d="M14,38 L22,44 M20,38 L27,44" stroke="#fff" stroke-width="2"/>`, 'shoes'),
    top: c => cl(`<path d="M20,8 L26,8 Q32,16 38,8 L44,8 L56,20 L50,28 L44,24 V56 H20 V24 L14,28 L8,20Z" fill="${c}"/>`, 'top'),
    pants: c => cl(`<path d="M16,6 H48 L50,58 H36 L32,26 L28,58 H14Z" fill="${c}"/>`, 'pants')
  };

  /* ───── 전자기기 아이콘 ───── */
  ART.gadgets = {
    tablet: () => cl(`<rect x="12" y="6" width="40" height="52" rx="5" fill="#374151"/><rect x="16" y="12" width="32" height="40" rx="1" fill="#8fd0ff"/><circle cx="32" cy="55" r="1.6" fill="#9aa3ad"/>`, 'tablet'),
    computer: () => cl(`<rect x="6" y="6" width="52" height="34" rx="3" fill="#374151"/><rect x="10" y="10" width="44" height="26" fill="#8fd0ff"/><rect x="28" y="40" width="8" height="8" fill="#6b7280"/><rect x="18" y="47" width="28" height="3" rx="1.5" fill="#6b7280"/><rect x="10" y="53" width="44" height="6" rx="2" fill="#9aa3ad"/>`, 'computer'),
    smartphone: () => cl(`<rect x="20" y="4" width="24" height="56" rx="5" fill="#374151"/><rect x="23" y="10" width="18" height="40" fill="#ffd27a"/><circle cx="32" cy="55" r="1.8" fill="#9aa3ad"/>`, 'smartphone'),
    console: () => cl(`<rect x="8" y="12" width="48" height="12" rx="2" fill="#374151"/><rect x="12" y="16" width="14" height="2" fill="#8fd0ff"/><rect x="4" y="34" width="24" height="16" rx="8" fill="#555"/><rect x="36" y="34" width="24" height="16" rx="8" fill="#555"/><path d="M10,42 H18 M14,38 V46" stroke="#fff" stroke-width="2"/><circle cx="48" cy="40" r="2" fill="#6bd16b"/><circle cx="53" cy="44" r="2" fill="#ff6b6b"/>`, 'games console'),
    headphones: () => cl(`<path d="M12,38 V30 A20,20 0 0 1 52,30 V38" fill="none" stroke="#374151" stroke-width="5"/><rect x="8" y="34" width="12" height="20" rx="5" fill="#e23d3d"/><rect x="44" y="34" width="12" height="20" rx="5" fill="#e23d3d"/>`, 'headphones'),
    ereader: () => cl(`<rect x="12" y="4" width="40" height="56" rx="4" fill="#4b5563"/><rect x="16" y="8" width="32" height="40" fill="#eef0e8"/><path d="M20,15 H44 M20,21 H44 M20,27 H44 M20,33 H36" stroke="#555" stroke-width="2"/><rect x="26" y="52" width="12" height="3" rx="1.5" fill="#9aa3ad"/>`, 'e-reader')
  };

  /* ───── 장면 (3.13, 4.11 등) ───── */
  const V = '0 0 300 190';
  const bg = (sky, ground, gy) => `<rect width="300" height="190" fill="${sky}"/><rect y="${gy}" width="300" height="${190 - gy}" fill="${ground}"/>`;
  const track = '<path d="M0 160H300M0 178H300" stroke="#fff" stroke-width="2" opacity=".8"/>';
  const tree = (x) => `<rect x="${x - 17}" y="44" width="34" height="118" rx="6" fill="#8a5a33"/><circle cx="${x}" cy="48" r="44" fill="#4caf50"/><circle cx="${x - 30}" cy="64" r="26" fill="#43a047"/><circle cx="${x + 30}" cy="64" r="26" fill="#43a047"/>`;
  const car = (x, y, c) => `<g transform="translate(${x},${y})"><path d="M0,40 Q0,28 14,26 L30,8 Q36,2 46,2 H84 Q94,2 100,10 L112,26 Q124,28 124,40 V50 H0Z" fill="${c}"/><path d="M34,10 H54 V26 H24Z M60,10 H84 L96,26 H60Z" fill="#cfe8ff"/><circle cx="28" cy="50" r="12" fill="#222"/><circle cx="28" cy="50" r="5" fill="#999"/><circle cx="96" cy="50" r="12" fill="#222"/><circle cx="96" cy="50" r="5" fill="#999"/></g>`;
  ART.scene = {
    run: () => ART.svg(V, bg('#dff0ff', '#d9825f', 140) + track + `<path d="M36 96h26M28 112h30M40 126h22" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>` + fig({ x: 118, y: 168, s: 1.15, arms: [-65, 62], legs: [-42, 34], top: '#e23d3d', hair: '#2b2118' }) + fig({ x: 200, y: 160, s: 1.05, arms: [60, -62], legs: [36, -38], top: '#1f78c8', skin: SK.c, hair: '#111', pants: '#222' }), 'two people running'),
    runNo: () => ART.svg(V, bg('#dff0ff', '#a9b1bb', 140) + track + fig({ x: 112, y: 170, s: 1.1, arms: [-14, 24], legs: [-4, 4], top: '#e23d3d' }) + fig({ x: 190, y: 164, s: 1.05, arms: [-70, 12], legs: [-4, 4], top: '#1f78c8', skin: SK.c, hair: '#111', pants: '#222' }), 'two people standing and talking'),
    climb: () => ART.svg(V, bg('#dff0ff', '#6cc069', 160) + tree(150) + fig({ x: 152, y: 118, s: .72, arms: [-158, 158], legs: [-26, 24], top: '#f08a1c', pants: '#374151', face: 0 }) + fig({ x: 108, y: 174, s: .95, arms: [-150, 160], legs: [-18, 14], top: '#7b3fa0', skin: SK.b, hair: '#2b2118' }), 'two people climbing a tree'),
    climbNo: () => ART.svg(V, bg('#dff0ff', '#6cc069', 160) + tree(150) + fig({ x: 84, y: 176, s: 1, arms: [-12, 12], top: '#f08a1c' }) + fig({ x: 222, y: 176, s: 1, arms: [-12, 12], top: '#7b3fa0', skin: SK.b }), 'two people standing near a tree'),
    surf: () => {
      const wave = '<path d="M0,120 Q30,92 60,120 T120,120 T180,120 T240,120 T300,120 V190 H0Z" fill="#2f9bd8"/><path d="M0,140 Q30,118 60,140 T120,140 T180,140 T240,140 T300,140 V190 H0Z" fill="#1f86c2"/>';
      const board = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="34" ry="5" fill="${c}"/>`;
      return ART.svg(V, `<rect width="300" height="190" fill="#bfe6ff"/><circle cx="262" cy="30" r="16" fill="#ffd54a"/>` + wave + board(110, 118, '#ff7043') + fig({ x: 110, y: 117, s: .85, arms: [-78, 78], legs: [-20, 20], top: '#e23d3d', pants: '#222' }) + board(204, 124, '#ffd54a') + fig({ x: 204, y: 123, s: .85, arms: [-60, 80], legs: [-16, 24], top: '#1f78c8', skin: SK.c, pants: '#222' }), 'two people surfing');
    },
    surfNo: () => ART.svg(V, `<rect width="300" height="190" fill="#bfe6ff"/><circle cx="262" cy="30" r="16" fill="#ffd54a"/><path d="M0,70 Q30,56 60,70 T120,70 T180,70 T240,70 T300,70 V100 H0Z" fill="#2f9bd8"/><rect y="98" width="300" height="92" fill="#f2d49b"/>` + `<ellipse cx="60" cy="150" rx="6" ry="30" transform="rotate(12 60 150)" fill="#ff7043"/>` + fig({ x: 130, y: 172, s: .85, arms: [-20, 24], legs: [84, 94], top: '#e23d3d', pants: '#222' }) + fig({ x: 210, y: 176, s: .85, arms: [-28, 10], legs: [-84, -94], top: '#1f78c8', skin: SK.c, pants: '#222' }), 'two people sitting on the beach'),
    wash: () => ART.svg(V, bg('#dff0ff', '#b5bcc6', 120) + car(88, 92, '#d6283b') + fig({ x: 60, y: 176, s: .95, arms: [30, 78], legs: [-6, 6], top: '#1f78c8' }) + fig({ x: 238, y: 172, s: .95, arms: [-80, -30], legs: [-6, 6], top: '#2e9d62', skin: SK.c }) + `<circle cx="150" cy="104" r="6" fill="#fff" stroke="#8fd0ff"/><circle cx="170" cy="96" r="4" fill="#fff" stroke="#8fd0ff"/><circle cx="130" cy="112" r="4" fill="#fff" stroke="#8fd0ff"/><circle cx="196" cy="108" r="5" fill="#fff" stroke="#8fd0ff"/>`, 'two people washing a car'),
    washNo: () => ART.svg(V, bg('#dff0ff', '#b5bcc6', 120) + car(88, 92, '#d6283b') + fig({ x: 50, y: 178, s: .95, arms: [-12, 12], top: '#1f78c8' }) + fig({ x: 252, y: 176, s: .95, arms: [-12, 12], top: '#2e9d62', skin: SK.c }), 'two people standing near a car'),
    alvita: () => ART.svg(V, `<rect width="300" height="190" fill="#efe6d8"/><rect y="150" width="300" height="40" fill="#cdb99b"/><rect x="150" y="10" width="86" height="150" rx="6" fill="#8a5a33"/><rect x="157" y="17" width="72" height="136" rx="3" fill="#d7ecf7"/>` + fig({ x: 193, y: 152, s: .98, arms: [-24, 26], top: '#3e9b4f', hair: '#1a1a1a', hs: 'long', skin: SK.c, pants: '#6d5a99' }) + `<rect x="40" y="60" width="6" height="90" fill="#555"/><path d="M26,60 L60,60 L52,34 L34,34Z" fill="#2b3a67"/><rect x="30" y="148" width="26" height="5" fill="#555"/>`, 'woman wearing a green sweater in front of a mirror'),
    emir: () => ART.svg(V, `<rect width="300" height="190" fill="#dff0ff"/><g fill="#9ab0c4"><rect x="20" y="70" width="22" height="70"/><rect x="46" y="50" width="26" height="90"/><rect x="76" y="80" width="20" height="60"/><rect x="100" y="60" width="24" height="80"/><rect x="128" y="86" width="18" height="54"/></g><path d="M0,140 H300 V190 H0Z" fill="#8f98a3"/><path d="M130,190 L150,140 L170,140 L230,190Z" fill="#6f7782"/><path d="M150,185 L158,142" stroke="#ffd54a" stroke-width="3" stroke-dasharray="8 6"/><rect x="190" y="52" width="86" height="52" rx="4" fill="#1f7a46" stroke="#fff" stroke-width="3"/><rect x="230" y="104" width="6" height="52" fill="#666"/><text x="233" y="74" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">New York</text><text x="226" y="94" text-anchor="middle" font-size="10" fill="#fff" font-family="sans-serif">Next exit</text><path d="M256,80 l10,10 M266,90 v-8 M266,90 h-8" stroke="#fff" stroke-width="3" fill="none"/>`, 'road sign: New York, next exit'),
    books: () => ART.svg(V, bg('#e5f1ff', '#aeb6bf', 150) + `<g fill="#b0c4d9"><rect x="0" y="60" width="40" height="90"/><rect x="250" y="40" width="50" height="110"/></g>` +
      fig({ x: 80, y: 176, s: .95, arms: [38, -50], legs: [-5, 6], top: '#6fb7e8', skirt: '#1c2f5a', hair: '#2b2118', hs: 'long', skin: SK.d }) + `<rect x="66" y="108" width="22" height="16" rx="2" fill="#c0392b" transform="rotate(-8 77 116)"/>` +
      fig({ x: 150, y: 176, s: 1, arms: [34, -34], legs: [-5, 6], top: '#9b9b9b', pants: '#3b3b3b', hair: '#b5651d' }) + `<rect x="140" y="104" width="22" height="16" rx="2" fill="#2e7d32"/>` +
      fig({ x: 222, y: 176, s: .95, arms: [38, -50], legs: [-5, 6], top: '#6fb7e8', skirt: '#1c2f5a', hair: '#d9a441', hs: 'long' }) + `<rect x="208" y="108" width="22" height="16" rx="2" fill="#1565c0" transform="rotate(-8 219 116)"/>`, 'three students holding books'),
    laptop: () => ART.svg(V, `<rect width="300" height="190" fill="#f1f1ec"/><rect y="150" width="300" height="40" fill="#c9c2b4"/><rect x="190" y="30" width="80" height="100" fill="#fff" stroke="#999" stroke-width="3"/><path d="M200,50 H260 M200,66 H250 M200,82 H258" stroke="#bbb" stroke-width="3"/><rect x="20" y="86" width="62" height="40" fill="#8a5a33"/><rect x="28" y="70" width="34" height="18" rx="2" fill="#333"/>` +
      fig({ x: 150, y: 178, s: 1.05, arms: [32, -6], legs: [-30, 26], top: '#3a3a3a', pants: '#7a1f4d', hair: '#c0622b', hs: 'long' }) + `<rect x="152" y="104" width="30" height="20" rx="2" fill="#2d3340" transform="rotate(-8 167 114)"/><rect x="155" y="107" width="24" height="13" fill="#8fd0ff" transform="rotate(-8 167 114)"/>`, 'woman carrying a laptop')
  };

  /* ───── 3.6 인물 사진(그림) ───── */
  ART.portraits = {
    dad: () => ART.portrait({ top: '#8c8f94', pants: '#8c8f94', tie: '#223a6b', hair: '#3a3a3a', skin: SK.a, arms: [-8, 8] }),
    emma: () => ART.portrait({ top: '#d6283b', skirt: '#d6283b', hair: '#6b3f1d', hs: 'long', hat: 'brim', hc: '#1f1f1f', flowers: true, skin: SK.a, arms: [-10, 10] }, '#f6e3e3'),
    max: () => ART.portrait({ top: '#1d1d1f', pants: '#1d1d1f', tie: '#c0392b', hair: '#111', hat: 'brim', hc: '#1d1d1f', skin: SK.c, arms: [-8, 8] }, '#e8e6ee'),
    julie: () => ART.portrait({ top: '#2f9e4e', skirt: '#2563c9', hair: '#1a1a1a', hs: 'long', skin: SK.b, arms: [-10, 10] }, '#e3f1e8'),
    cousin: () => ART.portrait({ top: '#f2c01e', pants: '#8a1f2d', hair: '#a8541f', hs: 'long', skin: SK.d, arms: [-10, 10] }, '#faf0cf')
  };

  /* ───── 활동 아이콘 (4.4, 4.5) ───── */
  const ic = (inner, label) => ART.svg('0 0 100 100', `<rect width="100" height="100" rx="12" fill="#eef6ff"/>` + inner, label);
  ART.act = {
    garden: () => ic(`<rect y="82" width="100" height="18" fill="#7bc77a"/><path d="M62,82 V56 M74,82 V50 M86,82 V60" stroke="#2e7d32" stroke-width="3"/><circle cx="62" cy="52" r="6" fill="#ff6fa8"/><circle cx="74" cy="46" r="6" fill="#ffd54a"/><circle cx="86" cy="56" r="6" fill="#ff7043"/>` + fig({ x: 32, y: 90, s: .78, arms: [58, 70], legs: [-6, 6], top: '#3e9b4f', skin: SK.b, hat: 'brim', hc: '#c9a24a' }) + `<path d="M50,50 L58,56 L52,64 L44,58Z" fill="#6b8fb3"/><path d="M58,58 l6,8 M60,56 l8,5" stroke="#8fd0ff" stroke-width="2"/>`, 'gardening'),
    cook: () => ic(`<rect y="82" width="100" height="18" fill="#d8cfc0"/><rect x="48" y="58" width="48" height="26" rx="3" fill="#6b7280"/><circle cx="62" cy="58" r="0" /><rect x="58" y="42" width="28" height="16" rx="3" fill="#374151"/><path d="M66,38 q-4,-8 0,-14 M76,38 q-4,-8 0,-14" stroke="#9aa3ad" stroke-width="2.5" fill="none"/>` + fig({ x: 28, y: 90, s: .82, arms: [38, 70], legs: [-6, 6], top: '#e8e8e8', hair: '#2b2118', hat: 'cap', hc: '#fff' }), 'cooking'),
    music: () => ic(`<text x="62" y="36" font-size="22" fill="#7b3fa0" font-family="sans-serif">♪</text><text x="76" y="56" font-size="26" fill="#1f78c8" font-family="sans-serif">♫</text><text x="22" y="30" font-size="18" fill="#c2417c" font-family="sans-serif">♪</text>` + fig({ x: 48, y: 96, s: .86, arms: [-10, 10], legs: [-6, 6], top: '#c2417c', skirt: '#3a3a3a', hair: '#3b2412', hs: 'long', hat: 'phones' }), 'listening to music'),
    read: () => ic(`<rect x="12" y="68" width="76" height="8" rx="3" fill="#8a5a33"/><rect x="18" y="76" width="6" height="16" fill="#8a5a33"/><rect x="76" y="76" width="6" height="16" fill="#8a5a33"/>` + fig({ x: 44, y: 98, s: .74, arms: [50, 40], legs: [78, 82], top: '#2e7d6b', pants: '#374151', hair: '#2b2118', skin: SK.b }) + `<rect x="54" y="52" width="22" height="16" rx="2" fill="#f4f4f4" stroke="#555" stroke-width="2"/><path d="M65,52 V68" stroke="#555" stroke-width="1.5"/>`, 'reading a book'),
    relax: () => ic(`<circle cx="82" cy="20" r="10" fill="#ffd54a"/><rect x="16" y="26" width="8" height="46" fill="#8a5a33"/><circle cx="20" cy="26" r="20" fill="#4caf50"/><rect y="82" width="100" height="18" fill="#7bc77a"/><path d="M34,78 L90,78 L84,66 L48,56 L38,66Z" fill="#e8a33d"/><path d="M40,80 L36,92 M86,80 L90,92" stroke="#8a5a33" stroke-width="3"/><circle cx="76" cy="54" r="7" fill="${SK.a}"/><path d="M42,66 Q60,56 70,58 L80,62" stroke="#1f78c8" stroke-width="9" stroke-linecap="round" fill="none"/>`, 'relaxing in the yard'),
    hold: () => ic(`<rect y="84" width="100" height="16" fill="#cfd6df"/>` + fig({ x: 44, y: 94, s: .86, arms: [28, 62], legs: [-5, 5], top: '#d6483b', skin: SK.b, hair: '#6b3f1d', hs: 'long' }) + `<ellipse cx="58" cy="52" rx="13" ry="7" fill="#ffd9a8"/><circle cx="68" cy="50" r="6" fill="#f6d2b0"/><rect x="48" y="50" width="16" height="8" rx="4" fill="#fff"/>`, 'holding a baby'),
    carry: () => ic(`<rect y="84" width="100" height="16" fill="#cfd6df"/>` + fig({ x: 50, y: 94, s: .86, arms: [18, -14], legs: [-8, 8], top: '#7b3fa0', pants: '#1c9aa8', hair: '#2b2118', hs: 'long' }) + `<g><path d="M66,62 L84,62 L82,86 H68Z" fill="#e23d3d"/><path d="M70,62 q5,-12 10,0" fill="none" stroke="#7a1010" stroke-width="2"/></g><g><path d="M16,60 L32,60 L31,82 H18Z" fill="#f2c01e"/><path d="M20,60 q4,-10 8,0" fill="none" stroke="#7a5f00" stroke-width="2"/></g>`, 'carrying shopping bags'),
    clean: () => ic(`<rect y="70" width="100" height="30" fill="#c9a77d"/><rect x="0" y="66" width="100" height="6" fill="#a8845a"/>` + fig({ x: 32, y: 96, s: .86, arms: [50, 70], legs: [-5, 5], top: '#1f9d8b', skin: SK.b, hair: '#2b2118' }) + `<rect x="50" y="56" width="26" height="14" rx="3" fill="#ffe14a"/><path d="M80,40 l6,-8 M84,50 l8,-4 M76,36 l2,-9" stroke="#ffd54a" stroke-width="3" stroke-linecap="round"/><circle cx="84" cy="58" r="4" fill="#fff" stroke="#8fd0ff"/>`, 'cleaning the table'),
    use: () => ic(`<rect y="84" width="100" height="16" fill="#cfd6df"/>` + fig({ x: 32, y: 96, s: .76, arms: [46, 54], legs: [78, 84], top: '#5b6bd0', pants: '#374151', hair: '#d9a441', hs: 'long' }) + `<rect x="46" y="52" width="26" height="34" rx="3" fill="#374151" transform="rotate(8 59 69)"/><rect x="49" y="56" width="20" height="26" fill="#8fd0ff" transform="rotate(8 59 69)"/>`, 'using a tablet')
  };

  global.ART = ART;
})(window);
