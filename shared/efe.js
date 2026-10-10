/* English for Everyone · Level 2 Beginner — 공통 엔진 (페이지 구성 + 문제 풀이) */
(function (global) {
  'use strict';
  const EFE = {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ───────── 작은 DOM 도우미 ───────── */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    kids.flat(Infinity).forEach(k => { if (k == null || k === false) return; el.append(k.nodeType ? k : document.createTextNode(String(k))); });
    return el;
  }
  EFE.h = h; EFE.$ = $; EFE.$$ = $$;
  const stripTags = s => String(s).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

  /* ───────── 단원 정보 ───────── */
  const UNITS = [
    { n: 1, en: 'Talking about yourself', ko: '자신에 대해 말하기', pages: '12–15' },
    { n: 2, en: 'Talking about routines', ko: '일상과 습관 말하기', pages: '16–19' },
    { n: 3, en: 'Today I’m wearing…', ko: '지금 입고 있는 것·하고 있는 일 말하기', pages: '20–23' },
    { n: 4, en: 'What’s happening?', ko: '지금 무슨 일이 일어나는지 묻기', pages: '24–27' },
    { n: 5, en: 'Types of verbs', ko: '동사의 종류: 동작동사와 상태동사', pages: '28–29' }
  ];
  EFE.UNITS = UNITS;

  /* ───────── 저장소 (실패해도 동작) ───────── */
  const KEY = 'efe.l2.progress.v1';
  let mem = {};
  try { mem = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { mem = {}; }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* 무시 */ } }
  EFE.stored = () => mem;
  let U = 0;
  const bucket = () => (mem['u' + U] = mem['u' + U] || { done: {}, best: {}, chk: {}, total: 0 });

  /* ───────── 음성 (브라우저 TTS) ───────── */
  let voice = null, token = 0;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    const vs = speechSynthesis.getVoices();
    return vs.find(v => /en[-_]US/i.test(v.lang) && /(Samantha|Google US|Jenny|Aria|Zira|Female)/i.test(v.name)) ||
      vs.find(v => /en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); };
    voice = pickVoice();
  }
  function utter(text, rate) {
    const u = new SpeechSynthesisUtterance(stripTags(text));
    u.lang = 'en-US'; u.rate = rate || 0.92; if (voice) u.voice = voice;
    return u;
  }
  EFE.say = function (text, btn) {
    if (!('speechSynthesis' in window)) { toast('이 브라우저는 음성 읽기를 지원하지 않아요.'); return; }
    token++; speechSynthesis.cancel();
    $$('.spk.on').forEach(b => b.classList.remove('on'));
    const u = utter(text);
    if (btn) { btn.classList.add('on'); u.onend = u.onerror = () => btn.classList.remove('on'); }
    setTimeout(() => speechSynthesis.speak(u), 60);
  };
  EFE.sayAll = function (lines, btn) {
    if (!('speechSynthesis' in window)) { toast('이 브라우저는 음성 읽기를 지원하지 않아요.'); return; }
    token++; const my = token; speechSynthesis.cancel();
    $$('.spk.on,.audio .btn.on').forEach(b => b.classList.remove('on'));
    let i = 0; if (btn) btn.classList.add('on');
    const next = () => {
      if (my !== token || i >= lines.length) { if (btn) btn.classList.remove('on'); return; }
      const u = utter(lines[i++]); u.onend = () => setTimeout(next, 650); u.onerror = () => btn && btn.classList.remove('on');
      speechSynthesis.speak(u);
    };
    setTimeout(next, 60);
  };
  EFE.stopSay = () => { token++; if ('speechSynthesis' in window) speechSynthesis.cancel(); $$('.spk.on,.audio .btn.on').forEach(b => b.classList.remove('on')); };
  function spk(text, extra) {
    const b = h('button', { class: 'spk', type: 'button', title: '듣기', 'aria-label': '듣기: ' + stripTags(text) }, '🔊');
    b.addEventListener('click', e => { e.stopPropagation(); EFE.say(text, b); });
    if (extra) b.style.cssText = extra;
    return b;
  }
  EFE.spk = spk;
  function toast(msg) {
    const t = h('div', { style: { position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)', background: '#222', color: '#fff', padding: '10px 18px', borderRadius: '12px', zIndex: 100, fontSize: '14px' } }, msg);
    document.body.append(t); setTimeout(() => t.remove(), 2600);
  }
  document.addEventListener('click', e => {           // [data-say] 클릭 → 읽어 주기
    const t = e.target.closest('[data-say]');
    if (t && !e.target.closest('button,a,input,select,label')) EFE.say(t.getAttribute('data-say') === '' ? t.textContent : t.getAttribute('data-say'));
  });

  /* ───────── 정답 비교 ───────── */
  function norm(s, exact) {
    s = String(s == null ? '' : s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[“”]/g, '"');
    if (!exact) s = s.replace(/n't\b/g, ' not').replace(/'m\b/g, ' am').replace(/'re\b/g, ' are');
    s = s.replace(/["]/g, '').replace(/[.?!,;:]+/g, ' ').replace(/\s+/g, ' ').trim();
    return s;
  }
  EFE.norm = norm;
  const same = (u, answers, exact) => { const n = norm(u, exact); return n !== '' && answers.some(a => norm(a, exact) === n); };

  /* ───────── 레슨용 위젯 ───────── */
  EFE.vgrid = function (list, opt) {
    opt = opt || {};
    return h('div', { class: 'vgrid' + (opt.big ? ' big' : '') }, list.map(v => {
      const [pic, word, ko, say] = v;
      const c = h('div', { class: 'vcard', tabindex: 0, role: 'button', 'aria-label': word + ' ' + (ko || '') },
        h('div', { class: 'e', html: pic }), h('div', { class: 'w' }, word), ko ? h('div', { class: 'm' }, ko) : null);
      const go = () => EFE.say(say || word);
      c.addEventListener('click', go); c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      return c;
    }));
  };
  EFE.excards = function (list) {
    return h('div', { class: 'exs' }, list.map(x => {
      const c = h('div', { class: 'exc', 'data-say': stripTags(x.en) },
        h('div', { class: 'pic', html: x.pic }),
        h('div', { class: 'tx' }, h('span', { html: x.en }), x.ko ? h('span', { class: 'ko' }, x.ko) : null));
      return c;
    }));
  };
  EFE.switcher = function (el, states, onChange) {
    const out = h('div', { class: 'sw-out' }), bar = h('div', { class: 'sw' });
    states.forEach((s, i) => {
      const b = h('button', { type: 'button', class: i ? '' : 'on' }, s.name);
      b.addEventListener('click', () => { $$('button', bar).forEach(x => x.classList.remove('on')); b.classList.add('on'); show(i); });
      bar.append(b);
    });
    function show(i) { out.innerHTML = ''; const c = states[i].node || h('div', { html: states[i].html }); out.append(c); if (onChange) onChange(i, out); }
    el.append(bar, out); show(0);
  };
  /* 퍼즐 조각 문장 만들기 */
  EFE.puzzle = function (el, cfg) {
    const cols = [], sel = [], texts = [];
    const row = h('div', { class: 'puz' });
    const out = h('div', { class: 'puz-out' });
    const nm = o => (Array.isArray(o) ? o[0] : o), sv = o => (Array.isArray(o) ? o[1] : o);
    function render(flashIdx) {
      cfg.pieces.forEach((p, i) => {
        if (p.opts) texts[i] = sv(p.opts[sel[i] || 0]);
        else if (p.derive) texts[i] = p.derive(texts, sel);
        else texts[i] = p.text;
        const c = cols[i];
        c.piece.textContent = p.opts ? nm(p.opts[sel[i] || 0]) : (p.derive ? (p.show ? p.show(texts, sel) : texts[i]) : (p.show || p.text));
        if (flashIdx === i || (flashIdx != null && p.derive)) { c.piece.classList.remove('flash'); void c.piece.offsetWidth; c.piece.classList.add('flash'); }
      });
      const s = (cfg.sentence ? cfg.sentence(texts, sel) : texts.join(' ')).replace(/\s+/g, ' ').trim();
      out.innerHTML = ''; out.append(h('span', null, s)); out.append(spk(s));
      if (cfg.extra) { const x = cfg.extra(texts, sel); if (x) out.append(h('div', { class: 'ko-note', style: { fontSize: '16px', fontWeight: 500, marginTop: '4px' }, html: x })); }
    }
    cfg.pieces.forEach((p, i) => {
      sel[i] = p.def || 0;
      const piece = h('div', { class: 'piece ' + (p.cls || '') });
      const col = h('div', { class: 'col' }, h('div', { class: 'lab ' + (p.cls || '') }, p.label), piece);
      if (p.opts) {
        const opts = h('div', { class: 'opts' + (p.row ? ' row' : '') });
        p.opts.forEach((o, j) => {
          const b = h('button', { type: 'button', class: 'opt' + (j === (p.def || 0) ? ' on' : '') }, nm(o));
          b.addEventListener('click', () => { sel[i] = j; $$('.opt', opts).forEach((x, k) => x.classList.toggle('on', k === j)); render(i); });
          opts.append(b);
        });
        col.append(opts);
      }
      cols.push({ piece }); row.append(col);
    });
    el.append(row, out); render();
  };

  /* ───────── 페이지 뼈대 ───────── */
  EFE.chrome = function (cfg) {
    U = cfg.unit; document.body.dataset.unit = U;
    const u = UNITS[U - 1];
    document.title = `Unit ${u.n} · ${u.en} — English for Everyone Level 2`;
    const nav = UNITS.map(x => `<a href="../Unit${x.n}/" ${x.n === U ? 'aria-current="page" style="background:var(--accent-soft);color:var(--accent-d);font-weight:800"' : ''}>${x.n}</a>`).join('');
    const top = h('header', { class: 'topbar' }, h('div', { class: 'wrap' },
      h('a', { class: 'home', href: '../', html: `<span class="badge">U${u.n}</span><span>English for Everyone · Level 2</span>` }),
      h('span', { class: 'sp' }),
      h('nav', { class: 'nav', 'aria-label': '단원 이동', html: '<span style="font-size:12px;color:var(--muted);margin-right:4px">단원</span>' + nav }),
      h('div', { class: 'prog', html: '<span id="progtxt">0 / 0</span><div class="bar"><i id="progbar"></i></div>' })));
    const goals = h('div', { class: 'goals' }, (cfg.goals || []).map(g => h('div', { class: 'goal' }, h('b', null, g[0]), h('span', null, g[1]), h('small', null, g[2]))));
    const hero = h('section', { class: 'hero wrap' },
      h('span', { class: 'no' }, String(u.n).padStart(2, '0')), h('h1', null, u.en),
      h('p', { class: 'ko' }, cfg.intro || u.ko), goals, h('div', { class: 'toc', id: 'toc' }));
    document.body.prepend(top, hero);
    const prev = UNITS[U - 2], next = UNITS[U];
    const foot = h('div', { class: 'wrap' },
      h('div', { class: 'summary' }, h('h3', null, '📊 내 풀이 기록'), h('div', { class: 'sumgrid', id: 'sumgrid' }),
        h('p', { class: 'ko-note' }, '이 기록은 지금 쓰는 이 기기의 브라우저에만 저장돼요. ',
          h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { if (confirm('이 단원의 풀이 기록을 모두 지울까요?')) { delete mem['u' + U]; persist(); location.reload(); } } }, '이 단원 기록 지우기'),
          ' ', /teacher/.test(location.search) ? h('button', { class: 'btn sm', type: 'button', onclick: () => EFE.revealAll() }, '교사용: 전체 정답 펼치기') : null)),
      h('div', { class: 'unitnav' },
        prev ? h('a', { href: `../Unit${prev.n}/`, html: `<small>← 이전 단원</small>Unit ${prev.n} · ${prev.en}` }) : h('a', { href: '../', html: '<small>← 처음으로</small>전체 단원 목록' }),
        next ? h('a', { class: 'nx', href: `../Unit${next.n}/`, html: `<small>다음 단원 →</small>Unit ${next.n} · ${next.en}` }) : h('a', { class: 'nx', href: '../', html: '<small>마지막 단원 완료!</small>전체 단원 목록 →' })),
      h('footer', null,
        h('p', null, `DK ⟨English for Everyone, Course Book Level 2 Beginner⟩ ${u.pages}쪽 학습용 보조 사이트 · 모든 도해와 그림은 새로 제작했고 교재 삽화는 포함하지 않았습니다.`),
        h('p', null, '🔊 듣기 문제(소리)는 교재 음원이 아니라 브라우저 음성 합성(TTS)이 읽어 주는 대본입니다. 공식 음원은 www.dkefe.com 에서 들을 수 있어요.')));
    document.body.append(foot);
  };

  /* ───────── 문제 카드 공통 ───────── */
  const defs = {};
  EFE.def = (id, spec) => { defs[id] = spec; };
  EFE._defs = defs;
  const exs = {};      // id → {el, inst, spec}
  const TYPES = {};

  function mountEx(ph) {
    const id = ph.getAttribute('data-ex'); const spec = defs[id];
    if (!spec) { console.warn('exercise def missing', id); return; }
    const inst = TYPES[spec.type](spec);
    const sid = 'ex-' + id.replace(/\./g, '-');
    const res = h('span', { class: 'res' });
    const note = h('div', { class: 'exnote tip' });
    const bCheck = h('button', { class: 'btn', type: 'button', 'data-act': 'check' }, '✔ 확인하기');
    const bShow = h('button', { class: 'btn ghost', type: 'button', 'data-act': 'reveal' }, '👁 정답 보기');
    const bReset = h('button', { class: 'btn ghost', type: 'button', 'data-act': 'reset' }, '↺ 다시 풀기');
    const bar = h('div', { class: 'exbar' }, bCheck, bShow, bReset, res);
    const card = h('section', { class: 'mod ex', id: sid, 'data-label': id },
      h('div', { class: 'mod-head' }, h('span', { class: 'n' }, id),
        h('h2', null, h('span', { html: spec.en }), spec.ko ? h('small', null, spec.ko) : null),
        h('span', { class: 'donebadge' }, '완료 ✓')),
      h('div', { class: 'mod-body' }, spec.intro ? h('div', { class: 'exnote show tip', style: { display: 'block' }, html: spec.intro }) : null, inst.node, bar, note));
    const b = bucket();
    function finish(r, revealed) {
      if (revealed) { res.className = 'res mid'; res.textContent = '정답을 확인했어요. 다시 풀기로 도전해 보세요!'; return; }
      const pct = r.total ? r.ok / r.total : 0;
      res.className = 'res ' + (pct === 1 ? 'good' : pct >= .6 ? 'mid' : 'low');
      res.textContent = pct === 1 ? `🎉 ${r.total}문제 모두 정답!` : `${r.total}문제 중 ${r.ok}문제 정답 — 틀린 곳을 고쳐 다시 확인해 보세요.`;
      b.best[id] = [Math.max(b.best[id] ? b.best[id][0] : 0, r.ok), r.total];
      if (pct === 1) { b.done[id] = 1; card.classList.add('done'); sparkle(card); }
      if (pct < 1 && spec.tip) { note.innerHTML = '<b>💡 힌트</b> ' + spec.tip; note.classList.add('show'); } else note.classList.remove('show');
      persist(); EFE.refresh();
    }
    bCheck.addEventListener('click', () => { EFE.stopSay(); finish(inst.check(), false); });
    bShow.addEventListener('click', () => { EFE.stopSay(); inst.reveal(); finish({}, true); });
    bReset.addEventListener('click', () => { EFE.stopSay(); inst.reset(); res.textContent = ''; res.className = 'res'; note.classList.remove('show'); card.classList.remove('done'); delete b.done[id]; persist(); EFE.refresh(); });
    if (b.done[id]) card.classList.add('done');
    ph.replaceWith(card); exs[id] = { el: card, inst, spec };
  }
  function sparkle(card) {
    const r = card.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const em = ['⭐', '🎉', '✨', '🌟'];
    for (let i = 0; i < 9; i++) {
      const s = h('div', { class: 'sparkle' }, em[i % em.length]);
      s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = Math.min(Math.max(r.top + 40, 60), innerHeight - 80) + 'px';
      s.style.setProperty('--dx', (Math.random() * 260 - 130) + 'px'); s.style.setProperty('--dy', (-Math.random() * 120 - 30) + 'px');
      document.body.append(s); setTimeout(() => s.remove(), 1200);
    }
  }
  EFE.revealAll = () => Object.values(exs).forEach(x => x.el.querySelector('[data-act=reveal]').click());

  EFE.refresh = function () {
    const all = Object.keys(exs); const b = bucket(); b.total = all.length;
    const done = all.filter(id => b.done[id]).length;
    const t = $('#progtxt'), bar = $('#progbar');
    if (t) t.textContent = `${done} / ${all.length} 완료`;
    if (bar) bar.style.width = (all.length ? done / all.length * 100 : 0) + '%';
    $$('#toc a[data-id]').forEach(a => a.classList.toggle('done', !!b.done[a.getAttribute('data-id')]));
    const sg = $('#sumgrid');
    if (sg) { sg.innerHTML = ''; all.forEach(id => { const s = b.best[id]; sg.append(h('a', { class: 'sumcell' + (b.done[id] ? ' done' : ''), href: '#ex-' + id.replace(/\./g, '-') }, h('span', null, id), h('span', null, b.done[id] ? '✓ 완료' : (s ? `${s[0]}/${s[1]}` : '–')))); }); }
    persist();
  };

  /* 체크리스트 */
  EFE.checklist = function (el, items, key) {
    const b = bucket();
    el.className = 'checklist';
    el.append(h('h3', null, `${String(U).padStart(2, '0')} ✓ CHECKLIST`));
    items.forEach((t, i) => {
      const inp = h('input', { type: 'checkbox' }); inp.checked = !!b.chk[i];
      inp.addEventListener('change', () => { b.chk[i] = inp.checked ? 1 : 0; persist(); });
      el.append(h('label', null, inp, t));
    });
  };

  /* ───────── 유형: 빈칸 채우기 / 쓰기 / 그림 보고 말하기 ───────── */
  TYPES.fill = function (spec) {
    const node = h('div', { class: 'exbody' });
    const rowsAll = []; let lastFocus = null;
    if (spec.audio) node.append(audioBar(spec.audio));
    let bankEl = null;
    if (spec.bank) {
      bankEl = h('div', { class: 'bank', 'aria-label': '보기 단어' });
      spec.bank.forEach(w => {
        const ex = typeof w === 'object' && w.ex; const t = ex ? w.t : w;
        const c = h('button', { class: 'chip' + (ex ? ' ex' : ''), type: 'button' }, t);
        if (!ex) c.addEventListener('click', () => {
          let target = lastFocus && !lastFocus.disabled ? lastFocus : null;
          if (!target || (target.value && !target.dataset.bank)) target = rowsAll.flatMap(r => r.inputs).find(i => !i.el.value && !i.fixed);
          const el = target && (target.el || target); if (!el) return;
          el.value = t; el.dataset.bank = '1'; el.classList.remove('ok', 'bad', 'rev'); markBank(); el.focus();
        });
        bankEl.append(c);
      });
      node.append(bankEl);
    }
    function markBank() { if (!bankEl) return; const vals = rowsAll.flatMap(r => r.inputs).map(i => norm(i.el.value)); $$('.chip', bankEl).forEach(c => { if (!c.classList.contains('ex')) c.classList.toggle('used', vals.includes(norm(c.textContent))); }); }
    function mkInput(seg, fixedVal) {
      const inp = h('input', { class: 'gap' + (seg.w === 'full' ? ' wide' : ''), type: 'text', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', 'aria-label': '빈칸' });
      if (seg.w && seg.w !== 'full') inp.style.width = seg.w + 'px';
      if (seg.ph) inp.placeholder = seg.ph;
      if (fixedVal != null) { inp.value = fixedVal; inp.disabled = true; inp.classList.add('ok'); }
      inp.addEventListener('focus', () => { lastFocus = inp; });
      inp.addEventListener('input', () => { inp.classList.remove('ok', 'bad', 'rev'); delete inp.dataset.bank; markBank(); });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); const all = $$('input.gap:not(:disabled)', node); const i = all.indexOf(inp); if (i < all.length - 1) all[i + 1].focus(); else $('[data-act=check]', node.closest('.mod')).click(); }
      });
      return inp;
    }
    function lineOf(segs, rec, ex) {
      const line = h('div', { class: 'itemline' });
      segs.forEach(s => {
        if (typeof s === 'string') line.append(h('span', { html: s }));
        else if (s.a) { const i = mkInput(s, ex ? s.a[0] : null); rec.inputs.push({ el: i, a: s.a, exact: !!s.x, fixed: !!ex }); line.append(i); if (s.ph) line.append(h('span', { class: 'ph' }, s.ph)); }
        else if (s.t) line.append(h('span', { class: s.cls || '', html: s.t }));
      });
      return line;
    }
    function renderItem(it, no, ex) {
      const rec = { inputs: [], it, ex };
      const row = h('div', { class: 'item' + (ex ? ' example' : '') }, h('span', { class: 'no' }, ex ? '예시' : no));
      if (it.pic) row.append(h('div', { class: 'pic', html: it.pic, style: it.picw ? { width: it.picw, flex: 'none' } : null }));
      const body = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' } });
      if (it.head) body.append(h('div', { class: 'itemhead', html: it.head }));
      const rows = it.rows || [it.segs];
      rows.forEach(r => {
        let segs = r, label = null; if (r && r.label) { segs = r.segs; label = r.label; }
        const ln = lineOf(segs, rec, ex);
        if (label) ln.prepend(h('span', { class: 'lb' + (/✘|neg/i.test(label) ? ' n' : '') }, label));
        body.append(ln);
      });
      rec.say = it.say || (spec.say ? sentenceOf(it) : null);
      if (rec.say) { rec.spk = spk(rec.say); rec.spk.style.display = ex ? '' : 'none'; body.lastChild.append(rec.spk); }
      row.append(body); rec.row = row; return row && { row, rec };
    }
    function sentenceOf(it) { return (it.rows || [it.segs]).map(r => (r.segs || r).map(s => typeof s === 'string' ? stripTags(s) : (s.a ? s.a[0] : (s.cls === 'ph' ? '' : stripTags(s.t || '')))).join('').replace(/\s+/g, ' ')).join(' '); }
    if (spec.example) { const r = renderItem(spec.example, 0, true); node.append(r.row); }
    spec.items.forEach((it, i) => { const r = renderItem(it, i + 1, false); rowsAll.push(r.rec); node.append(r.row); });
    return {
      node,
      check() {
        let ok = 0;
        rowsAll.forEach(r => {
          let good = true;
          r.inputs.forEach(i => { const g = same(i.el.value, i.a, i.exact); i.el.classList.remove('rev'); i.el.classList.toggle('ok', g); i.el.classList.toggle('bad', !g); if (!g) good = false; });
          r.rec = r; r.row.classList.toggle('ok', good); r.row.classList.toggle('bad', !good);
          if (r.spk) r.spk.style.display = good ? '' : 'none';
          if (good) ok++;
        });
        return { ok, total: rowsAll.length };
      },
      reveal() {
        rowsAll.forEach(r => { r.inputs.forEach(i => { i.el.value = i.a[0]; i.el.classList.remove('ok', 'bad'); i.el.classList.add('rev'); }); r.row.classList.remove('ok', 'bad'); if (r.spk) r.spk.style.display = ''; }); markBank();
      },
      reset() {
        rowsAll.forEach(r => { r.inputs.forEach(i => { i.el.value = ''; i.el.classList.remove('ok', 'bad', 'rev'); delete i.el.dataset.bank; }); r.row.classList.remove('ok', 'bad'); if (r.spk) r.spk.style.display = 'none'; }); markBank();
      }
    };
  };
  TYPES.write = TYPES.fill;      // 같은 방식(문장 쓰기)

  /* ───────── 유형: 3칸 표 (2.10) ───────── */
  TYPES.grid = function (spec) {
    const node = h('div', { class: 'exbody' });
    const table = h('table', { class: 'ft' }, h('thead', null, h('tr', null, spec.cols.map(c => h('th', null, c)))));
    const body = h('tbody'); const cells = [];
    if (spec.example) body.append(h('tr', { class: 'example' }, spec.example.map(t => h('td', null, h('em', { class: 'fixed' }, t)))));
    spec.rows.forEach((r, ri) => {
      const rec = { cells: [], tr: null };
      const tr = h('tr', null, r.map(c => {
        if (typeof c === 'string') return h('td', null, c);
        const inp = h('input', { class: 'gap wide', type: 'text', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false', 'aria-label': '빈칸' });
        inp.addEventListener('input', () => inp.classList.remove('ok', 'bad', 'rev'));
        rec.cells.push({ el: inp, a: c.a, x: !!c.x }); return h('td', null, inp);
      }));
      rec.tr = tr; cells.push(rec); body.append(tr);
    });
    table.append(body); node.append(h('div', { class: 'tbl-scroll' }, table));
    return {
      node,
      check() {
        let ok = 0;
        cells.forEach(r => { let good = true; r.cells.forEach(c => { const g = same(c.el.value, c.a, c.x); c.el.classList.remove('rev'); c.el.classList.toggle('ok', g); c.el.classList.toggle('bad', !g); if (!g) good = false; }); if (good) ok++; });
        return { ok, total: cells.length };
      },
      reveal() { cells.forEach(r => r.cells.forEach(c => { c.el.value = c.a[0]; c.el.classList.remove('ok', 'bad'); c.el.classList.add('rev'); })); },
      reset() { cells.forEach(r => r.cells.forEach(c => { c.el.value = ''; c.el.classList.remove('ok', 'bad', 'rev'); })); }
    };
  };

  /* ───────── 유형: 틀린 단어 줄 긋기 ───────── */
  TYPES.choice = function (spec) {
    const node = h('div', { class: 'exbody' });
    const recs = [];
    function mk(it, no, ex) {
      const rec = { cut: ex ? 1 - it.ans : null, it };
      const xo = h('span', { class: 'xo' });
      const btns = it.opts.map((o, i) => {
        const b = h('button', { type: 'button', 'aria-pressed': 'false' }, o);
        if (!ex) b.addEventListener('click', () => { rec.cut = rec.cut === i ? null : i; sync(); xo.classList.remove('ok', 'bad', 'rv'); row.classList.remove('ok', 'bad'); });
        return b;
      });
      btns.forEach((b, i) => { if (i) xo.append(h('span', { class: 'sl' }, '/')); xo.append(b); });
      function sync() { btns.forEach((b, i) => { b.classList.toggle('cut', rec.cut === i); b.setAttribute('aria-pressed', rec.cut === i ? 'true' : 'false'); }); }
      const row = h('div', { class: 'item' + (ex ? ' example' : '') }, h('span', { class: 'no' }, ex ? '예시' : no),
        h('div', { class: 'itemline' }, h('span', { html: it.pre || '' }), xo, h('span', { html: it.post || '' })));
      if (ex) sync();
      rec.xo = xo; rec.row = row; rec.sync = sync; rec.btns = btns; return rec;
    }
    if (spec.example) node.append(mk(spec.example, 0, true).row);
    spec.items.forEach((it, i) => { const r = mk(it, i + 1, false); recs.push(r); node.append(r.row); });
    return {
      node,
      check() {
        let ok = 0;
        recs.forEach(r => { const good = r.cut === 1 - r.it.ans; r.xo.classList.remove('rv'); r.xo.classList.toggle('ok', good); r.xo.classList.toggle('bad', !good); r.row.classList.toggle('ok', good); r.row.classList.toggle('bad', !good); if (good) ok++; });
        return { ok, total: recs.length };
      },
      reveal() { recs.forEach(r => { r.cut = 1 - r.it.ans; r.sync(); r.xo.classList.remove('ok', 'bad'); r.xo.classList.add('rv'); r.row.classList.remove('ok', 'bad'); }); },
      reset() { recs.forEach(r => { r.cut = null; r.sync(); r.xo.classList.remove('ok', 'bad', 'rv'); r.row.classList.remove('ok', 'bad'); }); }
    };
  };

  /* ───────── 유형: 객관식 / 참·거짓 ───────── */
  function audioBar(a) {
    const box = h('div');
    const bar = h('div', { class: 'audio' });
    const play = h('button', { class: 'btn', type: 'button' }, '▶ 전체 듣기 (Listen)');
    play.addEventListener('click', () => { if (play.classList.contains('on')) EFE.stopSay(); else EFE.sayAll(a.lines, play); });
    bar.append(play, h('span', { class: 'audionote' }, '브라우저 음성(TTS)으로 읽어 줘요 · 소리가 나지 않으면 기기 볼륨을 확인하세요'));
    box.append(bar);
    if (a.lines && a.show !== false) box.append(h('details', { class: 'tr' }, h('summary', null, '📝 듣기 대본 보기 (다 풀고 나서 확인해 보세요)'), h('div', { html: a.lines.map(l => stripTags(l)).join('<br>') })));
    return box;
  }
  TYPES.mcq = function (spec) {
    const node = h('div', { class: 'exbody' }); const recs = [];
    if (spec.audio) node.append(audioBar(spec.audio));
    let uid = 0; const gid = 'g' + Math.random().toString(36).slice(2, 7);
    function mk(it, no, ex) {
      const rec = { it, sel: ex ? it.ans : null, labels: [] };
      const name = gid + (uid++);
      const grp = h('div', { class: 'radgrp', role: 'radiogroup' });
      it.opts.forEach((o, i) => {
        const inp = h('input', { type: 'radio', name, value: i }); if (ex) { inp.checked = i === it.ans; inp.disabled = true; }
        const lab = h('label', { class: 'rad' + (ex && i === it.ans ? ' on' : '') }, inp, h('span', { html: o }));
        inp.addEventListener('change', () => { rec.sel = i; rec.labels.forEach((l, k) => l.className = 'rad' + (k === i ? ' on' : '')); row.classList.remove('ok', 'bad'); });
        rec.labels.push(lab); grp.append(lab);
      });
      const left = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 } }, it.q ? h('div', { html: it.q, style: { fontWeight: 600 } }) : null, grp);
      const row = h('div', { class: 'item' + (ex ? ' example' : '') }, h('span', { class: 'no' }, ex ? '예시' : no), left);
      if (it.say) row.append(spk(it.say));
      rec.row = row; rec.inputs = $$('input', grp); return rec;
    }
    if (spec.example) node.append(mk(spec.example, 0, true).row);
    spec.items.forEach((it, i) => { const r = mk(it, i + 1, false); recs.push(r); node.append(r.row); });
    return {
      node,
      check() {
        let ok = 0;
        recs.forEach(r => { const good = r.sel === r.it.ans; r.row.classList.toggle('ok', good); r.row.classList.toggle('bad', !good); r.labels.forEach((l, i) => { l.classList.toggle('right', r.sel === i && good); l.classList.toggle('wrong', r.sel === i && !good); }); if (good) ok++; });
        return { ok, total: recs.length };
      },
      reveal() { recs.forEach(r => { r.sel = r.it.ans; r.inputs.forEach((x, i) => x.checked = i === r.it.ans); r.labels.forEach((l, i) => l.className = 'rad' + (i === r.it.ans ? ' right' : '')); r.row.classList.remove('ok', 'bad'); }); },
      reset() { recs.forEach(r => { r.sel = null; r.inputs.forEach(x => x.checked = false); r.labels.forEach(l => l.className = 'rad'); r.row.classList.remove('ok', 'bad'); }); }
    };
  };
  TYPES.tf = function (spec) {
    const s2 = Object.assign({}, spec, { items: spec.items.map(i => ({ q: i.t, opts: ['True &nbsp;<small>참</small>', 'False &nbsp;<small>거짓</small>'], ans: i.a ? 0 : 1, say: i.say })) });
    if (spec.example) s2.example = { q: spec.example.t, opts: ['True &nbsp;<small>참</small>', 'False &nbsp;<small>거짓</small>'], ans: spec.example.a ? 0 : 1, say: spec.example.say };
    return TYPES.mcq(s2);
  };

  /* ───────── 유형: 선 잇기(짝 맞추기) ───────── */
  const PAL = ['#e8710a', '#7b3fa0', '#0d8a7a', '#1f78c8', '#c2417c', '#8a6d00', '#d4423a'];
  TYPES.match = function (spec) {
    const node = h('div', { class: 'exbody' });
    const pairs = new Map(); let active = null;      // left idx → right idx
    const L = [], R = [];
    const wrap = h('div', { class: 'match' });
    const cl = h('div', { class: 'colm' }), cr = h('div', { class: 'colm' });
    const mkBtn = (txt, cls, fixed) => { const b = h('button', { type: 'button', class: 'mbtn' + (fixed ? ' fixed' : '') }, h('span', { html: txt }), h('i', { class: 'pb' })); if (fixed) b.disabled = true; return b; };
    if (spec.example) { cl.append(mkBtn(spec.example.l, '', true)); }
    spec.left.forEach((t, i) => { const b = mkBtn(t); b.addEventListener('click', () => { active = i; paint(); }); L.push(b); cl.append(b); });
    spec.right.forEach((t, j) => {
      if (spec.example && j === spec.example.at) { cr.append(mkBtn(t, '', true)); R.push(null); return; }
      const b = mkBtn(t); b.addEventListener('click', () => {
        if (active == null) { toast('먼저 왼쪽 질문을 하나 고르세요.'); return; }
        for (const [k, v] of pairs) if (v === j) pairs.delete(k);
        pairs.set(active, j); active = null; paint();
      }); R.push(b); cr.append(b);
    });
    wrap.append(cl, cr); node.append(wrap);
    function paint(mark) {
      L.concat(R).forEach(b => { if (b) { b.classList.remove('paired', 'act', 'ok', 'bad'); b.querySelector('.pb').style.display = ''; } });
      pairs.forEach((j, i) => {
        const col = PAL[i % PAL.length];
        [L[i], R[j]].forEach(b => { b.classList.add('paired'); const pb = b.querySelector('.pb'); pb.style.background = col; pb.textContent = i + 1; b.style.borderColor = col; });
        if (mark) { const g = spec.ans[i] === j; L[i].classList.add(g ? 'ok' : 'bad'); R[j].classList.add(g ? 'ok' : 'bad'); }
      });
      L.concat(R).forEach(b => { if (b && !b.classList.contains('paired')) b.style.borderColor = ''; });
      if (active != null) L[active].classList.add('act');
    }
    return {
      node,
      check() { let ok = 0; spec.left.forEach((_, i) => { if (pairs.get(i) === spec.ans[i]) ok++; }); paint(true); return { ok, total: spec.left.length }; },
      reveal() { pairs.clear(); spec.ans.forEach((j, i) => pairs.set(i, j)); active = null; paint(); },
      reset() { pairs.clear(); active = null; paint(); }
    };
  };

  /* ───────── 유형: 차트 문장 만들기 ───────── */
  TYPES.builder = function (spec) {
    const node = h('div', { class: 'exbody' });
    const charts = spec.charts.map(ch => {
      const sel = ch.cols.map(c => c.lock ? 0 : -1);
      const found = new Set(); const foundEl = h('div', { class: 'found' });
      const msg = h('div', { class: 'bmsg', role: 'status' });
      const chart = h('div', { class: 'chart' });
      ch.cols.forEach((c, ci) => {
        const col = h('div', { class: 'cc' + (c.lock ? ' lock' : '') }, c.hint ? h('small', null, c.hint) : null);
        const opts = h('div', { class: 'opts' });
        c.opts.forEach((o, oi) => { const b = h('button', { type: 'button', class: 'opt' + (c.lock ? ' on' : '') }, o); if (!c.lock) b.addEventListener('click', () => { sel[ci] = oi; $$('.opt', opts).forEach((x, k) => x.classList.toggle('on', k === oi)); msg.textContent = ''; }); else b.disabled = true; opts.append(b); });
        col.append(opts); chart.append(col);
        if (ci < ch.cols.length - 1) chart.append(h('span', { style: { alignSelf: 'center', color: 'var(--accent)', fontSize: '22px' } }, '→'));
      });
      const add = h('button', { class: 'btn', type: 'button' }, '문장 만들기 ＋');
      const meter = h('div', { class: 'meter' }, h('i')); const cnt = h('b', null, `0 / ${ch.target}`);
      add.addEventListener('click', () => {
        if (sel.some(s => s < 0)) { msg.className = 'bmsg bad'; msg.textContent = '각 칸에서 하나씩 골라 주세요.'; return; }
        const parts = ch.cols.map((c, i) => c.opts[sel[i]]);
        const text = ch.join(parts);
        const v = ch.valid(sel.map((s, i) => ch.cols[i].opts[s]), sel);
        if (v !== true) { msg.className = 'bmsg bad'; msg.textContent = '✘ ' + text + ' — ' + (v || '맞지 않는 조합이에요.'); return; }
        if (found.has(text)) { msg.className = 'bmsg dup'; msg.textContent = '이미 만든 문장이에요. 다른 조합을 찾아보세요!'; return; }
        found.add(text); msg.className = 'bmsg good'; msg.textContent = '✔ 맞아요! ' + text;
        foundEl.append(h('span', { class: 'f' }, text, spk(text))); update(); EFE.say(text);
      });
      function update() { cnt.textContent = `${found.size} / ${ch.target}`; meter.firstChild.style.width = (found.size / ch.target * 100) + '%'; }
      const el = h('div', null, ch.title ? h('p', { class: 'instr', style: { fontSize: '15px' } }, ch.title) : null, chart, h('div', { class: 'tool' }, add, cnt), meter, msg, foundEl);
      node.append(el);
      return { ch, found, foundEl, update, sel, el, add };
    });
    const all = [];
    return {
      node,
      check() { let ok = 0, total = 0; charts.forEach(c => { ok += c.found.size; total += c.ch.target; }); return { ok, total }; },
      reveal() {
        charts.forEach(c => {
          const cols = c.ch.cols; const rec = [];
          (function rec2(i, picked) { if (i === cols.length) { if (c.ch.valid(picked.map((p, k) => cols[k].opts[p]), picked) === true) rec.push(picked.slice()); return; } for (let o = 0; o < cols[i].opts.length; o++) { picked.push(o); rec2(i + 1, picked); picked.pop(); } })(0, []);
          rec.forEach(p => { const t = c.ch.join(p.map((o, k) => cols[k].opts[o])); if (!c.found.has(t)) { c.found.add(t); c.foundEl.append(h('span', { class: 'f' }, t, spk(t))); } }); c.update();
        });
      },
      reset() { charts.forEach(c => { c.found.clear(); c.foundEl.innerHTML = ''; c.update(); }); }
    };
  };

  /* ───────── 유형: 그림 카드 + 이름 고르기 ───────── */
  TYPES.imgselect = function (spec) {
    const node = h('div', { class: 'exbody' }); const recs = [];
    if (spec.audio) node.append(audioBar(spec.audio));
    const cards = h('div', { class: 'cards' });
    function mk(c, no, ex) {
      const sel = h('select', { 'aria-label': '이름 고르기' }, h('option', { value: '' }, '— 고르세요 —'), spec.names.map(n => h('option', { value: n }, n)));
      if (ex) { sel.append(h('option', { value: c.ans }, c.ans)); sel.value = c.ans; sel.disabled = true; }
      const el = h('div', { class: 'card' + (ex ? ' example' : '') }, h('div', { class: 'art', html: c.svg }),
        h('div', { class: 'cb' }, h('span', { class: 'no', style: { background: ex ? '#8b93a5' : 'var(--accent)', color: '#fff', borderRadius: '99px', padding: '0 9px', fontSize: '13px', fontWeight: 800 } }, ex ? '예시' : no), sel));
      sel.addEventListener('change', () => { el.classList.remove('ok', 'bad'); sel.classList.remove('ok', 'bad'); });
      return { el, sel, c };
    }
    if (spec.example) cards.append(mk(spec.example, 0, true).el);
    spec.cards.forEach((c, i) => { const r = mk(c, i + 1, false); recs.push(r); cards.append(r.el); });
    node.append(cards);
    if (spec.namesShow) node.append(h('div', { class: 'bank' }, spec.namesShow.map(n => h('span', { class: 'chip', style: { cursor: 'default' } }, n))));
    return {
      node,
      check() { let ok = 0; recs.forEach(r => { const g = r.sel.value === r.c.ans; r.el.classList.toggle('ok', g); r.el.classList.toggle('bad', !g); r.sel.classList.toggle('ok', g); r.sel.classList.toggle('bad', !g); if (g) ok++; }); return { ok, total: recs.length }; },
      reveal() { recs.forEach(r => { r.sel.value = r.c.ans; r.el.classList.remove('ok', 'bad'); r.sel.classList.remove('ok', 'bad'); }); },
      reset() { recs.forEach(r => { r.sel.value = ''; r.el.classList.remove('ok', 'bad'); r.sel.classList.remove('ok', 'bad'); }); }
    };
  };

  /* ───────── 유형: 그림 보고 말하기/쓰기 (카드 + 입력줄) ───────── */
  TYPES.picsay = function (spec) {
    const node = h('div', { class: 'exbody' }); const recs = [];
    const grid = h('div', { class: 'cards', style: { gridTemplateColumns: spec.cols || 'repeat(auto-fit,minmax(260px,1fr))' } });
    function mk(c, no, ex) {
      const rec = { inputs: [], c };
      const lines = h('div', { class: 'sayline' });
      (c.lines || [{ a: c.a }]).forEach(L => {
        const inp = h('input', { class: 'gap wide', type: 'text', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false', placeholder: L.ph || (ex ? '' : '문장을 써 보세요'), 'aria-label': '답 쓰기' });
        if (ex) { inp.value = L.a[0]; inp.disabled = true; inp.classList.add('ok'); }
        inp.addEventListener('input', () => inp.classList.remove('ok', 'bad', 'rev'));
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const all = $$('input.gap:not(:disabled)', node), i = all.indexOf(inp); if (i < all.length - 1) all[i + 1].focus(); else $('[data-act=check]', node.closest('.mod')).click(); } });
        rec.inputs.push({ el: inp, a: L.a });
        const row = h('div', { class: 'row' }, L.label ? h('span', { class: 'lb' + (L.neg ? ' n' : '') }, L.label) : null, inp);
        if (!ex) { const s = spk(L.a[0]); s.style.display = 'none'; rec.inputs[rec.inputs.length - 1].spk = s; row.append(s); } else row.append(spk(L.a[0]));
        lines.append(row);
      });
      const el = h('div', { class: 'card' + (ex ? ' example' : '') }, h('div', { class: 'art' + (c.pair ? ' pair' : ''), html: c.svg }),
        h('div', { class: 'cb' }, h('span', { class: 'no', style: { background: ex ? '#8b93a5' : 'var(--accent)', color: '#fff', borderRadius: '99px', padding: '0 9px', fontSize: '13px', fontWeight: 800 } }, ex ? '예시' : no),
          c.q ? h('div', { style: { fontWeight: 700 } }, c.q, spk(c.q, 'margin-left:8px')) : null, lines));
      rec.el = el; return rec;
    }
    if (spec.example) grid.append(mk(spec.example, 0, true).el);
    spec.items.forEach((c, i) => { const r = mk(c, i + 1, false); recs.push(r); grid.append(r.el); });
    node.append(grid);
    return {
      node,
      check() {
        let ok = 0;
        recs.forEach(r => { let good = true; r.inputs.forEach(i => { const g = same(i.el.value, i.a); i.el.classList.remove('rev'); i.el.classList.toggle('ok', g); i.el.classList.toggle('bad', !g); if (i.spk) i.spk.style.display = g ? '' : 'none'; if (!g) good = false; }); r.el.classList.toggle('ok', good); r.el.classList.toggle('bad', !good); if (good) ok++; });
        return { ok, total: recs.length };
      },
      reveal() { recs.forEach(r => { r.inputs.forEach(i => { i.el.value = i.a[0]; i.el.classList.remove('ok', 'bad'); i.el.classList.add('rev'); if (i.spk) i.spk.style.display = ''; }); r.el.classList.remove('ok', 'bad'); }); },
      reset() { recs.forEach(r => { r.inputs.forEach(i => { i.el.value = ''; i.el.classList.remove('ok', 'bad', 'rev'); if (i.spk) i.spk.style.display = 'none'; }); r.el.classList.remove('ok', 'bad'); }); }
    };
  };

  /* ───────── 유형: 단어 찾기 + 분류 (5.3) ───────── */
  TYPES.wordsearch = function (spec) {
    const node = h('div', { class: 'exbody' });
    const R = spec.grid.length, C = spec.grid[0].length;
    const cells = []; const foundWords = new Map();   // word → {color, cat}
    let start = null; const COL = ['#e8710a', '#7b3fa0', '#0d8a7a', '#1f78c8', '#c2417c', '#8a6d00', '#d4423a', '#4a6fa5'];
    const grid = h('div', { class: 'ws', style: { gridTemplateColumns: `repeat(${C},auto)` }, role: 'grid' });
    const msg = h('div', { class: 'bmsg', role: 'status' });
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const b = h('button', { type: 'button', 'aria-label': `${spec.grid[r][c]} ${r + 1}행 ${c + 1}열` }, spec.grid[r][c]);
      b.addEventListener('click', () => pick(r, c)); cells.push(b); grid.append(b);
    }
    const at = (r, c) => cells[r * C + c];
    function clearStart() { if (start) { at(start.r, start.c).classList.remove('start'); start = null; } }
    function pick(r, c) {
      if (!start) { start = { r, c }; at(r, c).classList.add('start'); msg.className = 'bmsg'; msg.textContent = '끝나는 글자를 클릭하세요.'; return; }
      const dr = r - start.r, dc = c - start.c, n = Math.max(Math.abs(dr), Math.abs(dc));
      const s0 = start; clearStart();
      if (n === 0 || !(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) { bad('가로·세로·대각선으로 일직선이어야 해요.'); return; }
      const sr = Math.sign(dr), sc = Math.sign(dc); let w = '', path = [];
      for (let i = 0; i <= n; i++) { const rr = s0.r + sr * i, cc = s0.c + sc * i; w += spec.grid[rr][cc]; path.push(at(rr, cc)); }
      const rw = w.split('').reverse().join('');
      const hit = spec.words.find(x => x.toUpperCase() === w || x.toUpperCase() === rw);
      if (!hit) { path.forEach(p => { p.classList.add('shake'); setTimeout(() => p.classList.remove('shake'), 350); }); bad(`“${w}” 은(는) 찾아야 하는 동사가 아니에요.`); return; }
      if (foundWords.has(hit)) { bad('이미 찾은 단어예요.'); return; }
      const col = COL[foundWords.size % COL.length];
      path.forEach(p => { p.classList.add('hit'); p.style.background = col; });
      foundWords.set(hit, { col, cat: null, path }); msg.className = 'bmsg good'; msg.textContent = `✔ 찾았어요: ${hit.toUpperCase()}`; renderChips(); EFE.say(hit);
    }
    function bad(t) { msg.className = 'bmsg bad'; msg.textContent = t; }
    const pool = h('div', { class: 'sortbox' });
    const meter = h('div', { class: 'meter' }, h('i')); const cnt = h('b');
    function renderChips() {
      pool.innerHTML = '';
      const unsorted = h('div', { class: 'bx', style: { gridColumn: '1/-1' } }, h('h4', null, `찾은 동사 FOUND ${foundWords.size} / ${spec.words.length}  — 각 동사 옆에서 Action 또는 State를 고르세요`));
      foundWords.forEach((v, w) => {
        const bA = h('button', { type: 'button', class: v.cat === 'action' ? 'on' : '' }, 'Action'), bS = h('button', { type: 'button', class: v.cat === 'state' ? 'on' : '' }, 'State');
        bA.addEventListener('click', () => { v.cat = 'action'; v.mark = null; renderChips(); }); bS.addEventListener('click', () => { v.cat = 'state'; v.mark = null; renderChips(); });
        unsorted.append(h('span', { class: 'fw' + (v.mark || ''), style: { borderColor: v.mark ? '' : v.col } }, w, bA, bS, spk(w)));
      });
      pool.append(unsorted);
      const A = h('div', { class: 'bx' }, h('h4', null, 'ACTION VERBS 동작동사')), S = h('div', { class: 'bx' }, h('h4', null, 'STATE VERBS 상태동사'));
      let a = 0, s = 0;
      foundWords.forEach((v, w) => { if (v.cat === 'action') { a++; A.append(h('div', { class: 'fw' + (v.mark || '') }, `${a}. ${w}`)); } if (v.cat === 'state') { s++; S.append(h('div', { class: 'fw' + (v.mark || '') }, `${s}. ${w}`)); } });
      pool.append(A, S);
      cnt.textContent = `${foundWords.size} / ${spec.words.length}`; meter.firstChild.style.width = (foundWords.size / spec.words.length * 100) + '%';
    }
    renderChips();
    const hintBtn = h('button', { class: 'btn ghost sm', type: 'button' }, '💡 첫 글자 힌트');
    hintBtn.addEventListener('click', () => {
      const w = spec.words.find(x => !foundWords.has(x)); if (!w) return;
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { if (spec.pos[w] && spec.pos[w][0] === r && spec.pos[w][1] === c) { const b = at(r, c); b.classList.add('shake'); b.style.outline = '3px solid var(--warn)'; setTimeout(() => { b.style.outline = ''; b.classList.remove('shake'); }, 1800); } }
      bad(`힌트: “${w[0].toUpperCase()}…” 로 시작하는 동사가 남아 있어요 (${w.length}글자).`);
    });
    node.append(h('p', { class: 'ko-note' }, '👆 단어의 첫 글자를 누르고, 마지막 글자를 누르세요. (가로·세로·대각선, 거꾸로도 가능)'), grid, h('div', { class: 'tool' }, cnt, hintBtn), meter, msg, pool);
    return {
      node,
      check() {
        let ok = 0; foundWords.forEach((v, w) => { const g = v.cat && spec.cats[w] === v.cat; v.mark = v.cat ? (g ? ' ok' : ' bad') : ' bad'; if (g) ok++; });
        renderChips(); return { ok, total: spec.words.length };
      },
      reveal() {
        spec.words.forEach(w => { if (!foundWords.has(w)) { const p = spec.path[w].map(([r, c]) => at(r, c)); const col = COL[foundWords.size % COL.length]; p.forEach(x => { x.classList.add('hit'); x.style.background = col; }); foundWords.set(w, { col, cat: null, path: p }); } });
        foundWords.forEach((v, w) => { v.cat = spec.cats[w]; v.mark = ''; }); renderChips();
      },
      reset() { foundWords.forEach(v => v.path.forEach(p => { p.classList.remove('hit'); p.style.background = ''; })); foundWords.clear(); clearStart(); msg.textContent = ''; renderChips(); }
    };
  };

  /* ───────── 시작 ───────── */
  EFE.go = function () {
    $$('[data-ex]').forEach(mountEx);
    // 목차
    const toc = $('#toc');
    if (toc) {
      toc.append(h('span', { class: 't' }, '바로가기'));
      $$('.mod[data-label]').forEach(m => {
        const lesson = m.classList.contains('lesson');
        toc.append(h('a', { href: '#' + m.id, class: lesson ? 'lesson' : '', 'data-id': lesson ? null : m.getAttribute('data-label'), title: lesson ? '학습' : '연습문제' }, (lesson ? '📘 ' : '✎ ') + m.getAttribute('data-label')));
      });
    }
    EFE.refresh();
  };
  global.EFE = EFE;
})(window);
