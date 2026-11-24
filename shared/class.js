/* English for Everyone · Level 2 — 우리반 모드
 *  ① 반 코드 + 이름 + PIN 로그인  ② 실시간 우리반 순위(공개 MQTT 브로커)
 *  ③ 🎙 마이크 녹음 + 발음 인식 점수(브라우저 음성 인식)  ④ 단원별 Speaking Challenge
 *  단원 페이지에서는 efe.js 다음에, 메인 페이지에서는 마지막에 불러옵니다.
 */
(function () {
  'use strict';
  if (window.EFEC) return;

  /* ───────── 기본 도우미 ───────── */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 무시 */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* 무시 */ } }
  };
  const UNIT = +(document.body.dataset.unit || 0);
  const IS_UNIT = UNIT > 0 && !!window.EFE;
  const PARAMS = new URLSearchParams(location.search);
  const TEACHER = PARAMS.has('teacher');
  const HUES = [28, 272, 170, 208, 334, 200, 22, 250, 150, 350, 190, 212, 40, 290, 162];
  const UNIT_EX = [8, 5, 7, 6, 3, 4, 5, 4, 4, 4, 3, 4, 5, 4, 6];
  function toast(msg) {
    let t = $('#clToast');
    if (!t) { t = document.createElement('div'); t.id = 'clToast'; t.className = 'cl-toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.innerHTML = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2800);
  }
  const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); };
  async function sha(s) {
    try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join(''); }
    catch (e) { return fnv(s) + fnv(s + '#') + fnv('#' + s); }
  }
  const cleanRoom = r => String(r || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  const cleanName = n => String(n || '').replace(/\s+/g, ' ').trim().slice(0, 20);
  const COLORS = ['#e2711d', '#2a9d8f', '#3f86bd', '#7a4c93', '#d4607a', '#5b8c3a', '#b5651d', '#1d4e89', '#c44536', '#6c757d'];
  const colorOf = s => COLORS[parseInt(fnv(String(s)), 36) % COLORS.length];
  const avatar = n => `<span class="cl-av" style="background:${colorOf(n)}">${esc((String(n || '?').trim()[0] || '?').toUpperCase())}</span>`;

  /* ───────── 스타일 ───────── */
  const css = `
.cl-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,#e6dfd2);background:var(--card,#fff);color:var(--ink,#1f2430);border-radius:99px;padding:5px 11px;font:600 13px/1.2 inherit;cursor:pointer;white-space:nowrap}
.cl-pill:hover{border-color:var(--accent,#e2711d)}
.cl-dot{display:inline-block;vertical-align:middle;width:8px;height:8px;border-radius:50%;background:#bbb}
.cl-pill .cl-dot{width:8px;height:8px;border-radius:50%;background:#bbb;flex:none}
.cl-dot.on{background:#1b9a5f;box-shadow:0 0 0 3px #1b9a5f33}.cl-dot.wait{background:#e29a00}
.cl-pill.gold{background:linear-gradient(135deg,#ffcf4a,#f59e0b);border-color:#e7a10b;color:#3b2500}
.cl-pill.pulse{animation:clPulse 1s ease 3}
@keyframes clPulse{50%{transform:scale(1.08);box-shadow:0 0 0 6px #f59e0b44}}
@media(max-width:640px){.cl-pill .cl-nm{display:none}.cl-pill{padding:5px 9px}}
.cl-toast{position:fixed;left:50%;bottom:22px;transform:translate(-50%,30px);opacity:0;background:#1f2430;color:#fff;padding:10px 18px;border-radius:12px;z-index:2147483100;font-size:14px;transition:.25s;pointer-events:none;max-width:92vw;text-align:center}
.cl-toast.show{opacity:1;transform:translate(-50%,0)}
.cl-av{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;color:#fff;font-weight:800;font-size:13px;flex:none}
.cl-modal{position:fixed;inset:0;background:#0007;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px}
.cl-modal[hidden]{display:none}
.cl-card{background:var(--card,#fff);color:var(--ink,#1f2430);border-radius:18px;padding:22px;width:min(420px,100%);box-shadow:0 20px 60px #0005;max-height:92vh;overflow:auto}
.cl-card h3{margin:0 0 4px;font-size:20px}.cl-card p.cl-sub{margin:0 0 14px;color:var(--muted,#5d6577);font-size:13.5px}
.cl-field{display:block;font-size:13px;font-weight:700;color:var(--muted,#5d6577);margin:10px 0 0}
.cl-field input{display:block;width:100%;margin-top:4px;padding:10px 12px;border:1.5px solid var(--line,#e6dfd2);border-radius:10px;font:600 16px inherit;background:var(--bg,#fbf7f0);color:var(--ink,#1f2430)}
.cl-field input:focus{outline:none;border-color:var(--accent,#e2711d)}
.cl-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.cl-btn{border:0;background:var(--accent,#e2711d);color:#fff;border-radius:10px;padding:10px 16px;font:700 14px inherit;cursor:pointer}
.cl-btn:disabled{opacity:.5;cursor:default}
.cl-btn.ghost{background:transparent;color:var(--ink,#1f2430);border:1.5px solid var(--line,#e6dfd2)}
.cl-btn.sm{padding:6px 11px;font-size:13px}.cl-btn.red{background:#d4423a}
.cl-err{color:#d4423a;font-size:13px;min-height:18px;margin:8px 0 0}
.cl-note{font-size:12.5px;color:var(--muted,#5d6577);background:var(--bg,#fbf7f0);border-radius:10px;padding:9px 11px;margin:12px 0 0;line-height:1.5}
.cl-drawer{position:fixed;top:0;right:0;bottom:0;width:min(400px,100%);background:var(--card,#fff);color:var(--ink,#1f2430);z-index:2147482000;box-shadow:-10px 0 40px #0003;transform:translateX(105%);transition:transform .28s;display:flex;flex-direction:column}
.cl-drawer.open{transform:none}
.cl-dh{display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:1px solid var(--line,#e6dfd2)}
.cl-dh h3{margin:0;font-size:17px;flex:1}
.cl-live{font-size:11px;font-weight:800;color:#fff;background:#d4423a;border-radius:6px;padding:2px 6px;letter-spacing:.06em}
.cl-live.off{background:#9aa3b2}
.cl-db{padding:14px 16px;overflow:auto;flex:1}
.cl-tabs{display:flex;gap:6px;margin-bottom:12px}
.cl-tabs button{flex:1;border:1.5px solid var(--line,#e6dfd2);background:transparent;border-radius:10px;padding:7px;font:700 13px inherit;color:var(--muted,#5d6577);cursor:pointer}
.cl-tabs button.on{background:var(--accent,#e2711d);border-color:var(--accent,#e2711d);color:#fff}
.cl-me{display:flex;gap:10px;align-items:center;background:var(--accent-soft,#fdeedf);border-radius:14px;padding:12px;margin-bottom:12px}
.cl-me b{font-size:15px}.cl-me small{display:block;color:var(--muted,#5d6577);font-size:12px}
.cl-me .cl-big{margin-left:auto;font-size:26px;font-weight:800;color:var(--accent-d,#a34d0c);text-align:right;line-height:1}
.cl-me .cl-big small{font-size:11px;font-weight:600}
.cl-lb{display:flex;flex-direction:column;gap:6px}
.cl-lr{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:12px;border:1px solid var(--line,#e6dfd2)}
.cl-lr.me{border:2px solid var(--accent,#e2711d);background:var(--accent-soft,#fdeedf)}
.cl-lr .rk{width:26px;text-align:center;font-weight:800;color:var(--muted,#5d6577)}
.cl-lr .nm{font-weight:700;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-lr .nm small{display:block;font-weight:500;font-size:11.5px;color:var(--muted,#5d6577)}
.cl-lr .sc{font-weight:800;font-size:16px}
.cl-empty{color:var(--muted,#5d6577);text-align:center;padding:22px 8px;font-size:14px}
.cl-rules{font-size:12px;color:var(--muted,#5d6577);margin-top:14px;line-height:1.6;border-top:1px dashed var(--line,#e6dfd2);padding-top:10px}
.cl-mic{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;border:1.5px solid var(--line,#e6dfd2);background:var(--card,#fff);font-size:14px;cursor:pointer;vertical-align:middle;margin-left:4px;padding:0;line-height:1;flex:none}
.cl-mic:hover{border-color:#d4423a;background:#fde8e6}
.cl-mic.got{border-color:#1b9a5f}
.cl-mic.corner{position:absolute;top:6px;right:6px;width:26px;height:26px;font-size:12px;z-index:2;opacity:.85}
.cl-mic.corner:hover{opacity:1}
.cl-rel{position:relative}
.cl-coach{position:fixed;left:0;right:0;bottom:0;z-index:2147482500;display:flex;justify-content:center;padding:0 10px 10px;pointer-events:none}
.cl-coach[hidden]{display:none}
.cl-ci{pointer-events:auto;background:var(--card,#fff);color:var(--ink,#1f2430);width:min(620px,100%);border-radius:20px;box-shadow:0 -6px 40px #0004;border:1px solid var(--line,#e6dfd2);padding:16px 18px 18px;animation:clUp .25s ease}
@keyframes clUp{from{transform:translateY(40px);opacity:0}}
.cl-ch{display:flex;align-items:flex-start;gap:10px}
.cl-ch .lab{font-size:11.5px;font-weight:800;letter-spacing:.06em;color:var(--muted,#5d6577)}
.cl-ch .tx{font-size:20px;font-weight:700;line-height:1.35;margin:2px 0 0}
.cl-x{margin-left:auto;border:0;background:transparent;font-size:20px;cursor:pointer;color:var(--muted,#5d6577);padding:2px 6px}
.cl-state{display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap}
.cl-recdot{width:14px;height:14px;border-radius:50%;background:#d4423a;animation:clBlink 1s infinite;flex:none}
@keyframes clBlink{50%{opacity:.25}}
.cl-meter{flex:1;min-width:90px;height:10px;border-radius:9px;background:var(--line,#e6dfd2);overflow:hidden}
.cl-meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#1b9a5f,#e29a00,#d4423a);transition:width .08s}
.cl-interim{width:100%;color:var(--muted,#5d6577);font-style:italic;min-height:20px;font-size:14.5px}
.cl-res{display:flex;gap:16px;align-items:center;margin-top:14px;flex-wrap:wrap}
.cl-ring{--p:0;--c:#1b9a5f;width:84px;height:84px;border-radius:50%;background:conic-gradient(var(--c) calc(var(--p)*3.6deg),var(--line,#e6dfd2) 0);display:flex;align-items:center;justify-content:center;flex:none}
.cl-ring span{width:66px;height:66px;border-radius:50%;background:var(--card,#fff);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:21px}
.cl-verdict{font-weight:800;font-size:17px}
.cl-heard{font-size:14px;color:var(--muted,#5d6577);margin-top:3px}
.cl-diff{margin-top:6px;font-size:16px;line-height:1.9}
.cl-diff span{padding:1px 4px;border-radius:5px;margin-right:2px}
.cl-diff .ok{background:#e3f6ec;color:#11683f}.cl-diff .miss{background:#fde8e6;color:#a32a23;text-decoration:underline wavy}
.cl-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.cl-acts a{text-decoration:none}
.cl-pts{display:inline-block;background:#fff4d6;color:#7a4a00;border-radius:8px;padding:2px 8px;font-weight:800;font-size:13px;margin-left:6px}
/* Speaking challenge */
.cl-sp-list{display:grid;gap:8px}
.cl-sp{display:flex;align-items:center;gap:10px;border:1.5px solid var(--line,#e6dfd2);border-radius:14px;padding:10px 12px;background:var(--card,#fff)}
.cl-sp.pass{border-color:#1b9a5f;background:color-mix(in srgb,#1b9a5f 7%,var(--card,#fff))}
.cl-sp .no{width:26px;height:26px;border-radius:50%;background:var(--accent-soft,#fdeedf);color:var(--accent-d,#a34d0c);font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex:none}
.cl-sp .t{flex:1;font-weight:600;font-size:16.5px;min-width:0}
.cl-sp .t small{display:block;font-weight:500;font-size:12px;color:var(--muted,#5d6577)}
.cl-sp .best{font-weight:800;font-size:14px;min-width:44px;text-align:right}
.cl-sp .b{border:1.5px solid var(--line,#e6dfd2);background:var(--card,#fff);border-radius:10px;padding:6px 10px;cursor:pointer;font-size:14px;line-height:1}
.cl-sp .b.rec{background:#d4423a;border-color:#d4423a;color:#fff}
.cl-sp .b:disabled{opacity:.35;cursor:default}
@media(max-width:560px){.cl-sp{flex-wrap:wrap}.cl-sp .t{flex-basis:calc(100% - 40px)}}
.cl-spgrid{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:16px;align-items:start}
@media(max-width:820px){.cl-spgrid{grid-template-columns:1fr}}
.cl-box{border:1.5px solid var(--line,#e6dfd2);border-radius:14px;padding:12px;background:var(--card,#fff)}
.cl-box h4{margin:0 0 10px;font-size:15px;display:flex;align-items:center;gap:8px}
/* index dashboard */
.cl-dash{margin-top:34px;background:var(--card,#fff);border:2px solid var(--line,#e6dfd2);border-radius:18px;padding:20px}
.cl-dash h2{margin:0;font-size:24px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.cl-dtop{display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin:12px 0 16px}
.cl-tbl-wrap{overflow:auto;border:1px solid var(--line,#e6dfd2);border-radius:12px}
.cl-tbl{border-collapse:collapse;width:100%;font-size:13.5px;min-width:760px}
.cl-tbl th,.cl-tbl td{padding:7px 6px;border-bottom:1px solid var(--line,#e6dfd2);text-align:center;white-space:nowrap}
.cl-tbl th{background:var(--bg,#fdf8f1);font-size:12px;color:var(--mut,#6b645a);position:sticky;top:0}
.cl-tbl td.nm{text-align:left;font-weight:700}
.cl-tbl tr.me td{background:#fff4d6}
@media (prefers-color-scheme:dark){.cl-tbl tr.me td{background:#3a2f12}.cl-diff .ok{background:#14372a;color:#8be0b2}.cl-diff .miss{background:#3d1d1b;color:#ffb0a8}.cl-pts{background:#3a2f12;color:#ffd27a}}
.cl-tbl td.tot{font-weight:800;font-size:15px}
.cl-heat{display:inline-block;min-width:34px;border-radius:7px;padding:2px 4px;font-weight:700}
.cl-qr{display:flex;gap:12px;align-items:center;font-size:13px}
.cl-qr img{width:110px;height:110px;border-radius:10px;border:1px solid var(--line,#e6dfd2);background:#fff}
.cl-fab{position:fixed;right:14px;bottom:14px;z-index:2147481000;border:0;border-radius:99px;padding:11px 16px;font:800 14px inherit;color:#3b2500;background:linear-gradient(135deg,#ffcf4a,#f59e0b);box-shadow:0 8px 24px #0003;cursor:pointer}
@media print{.cl-fab,.cl-coach,.cl-drawer,.cl-mic{display:none!important}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.append(st);

  /* ───────── 프로필 ───────── */
  const PKEY = 'efe.class.profile';
  let prof = LS.get(PKEY, null);              // {room,name,uid,ph,since}
  const viewRoom = () => cleanRoom(PARAMS.get('room')) || (prof && prof.room) || cleanRoom(LS.get('efe.class.view', ''));
  const logged = () => !!(prof && prof.uid);

  /* ───────── 실시간 저장소 (공개 MQTT 브로커의 retained 메시지) ─────────
   *  u/<uid>          {n, ph, at, ts}        참가자
   *  s/<uid>/<unit>   {n, ex:{id:[ok,total]}, sp:{key:pct}, nx, ts}   단원 점수
   *  x/<uid>          {ts}                   교사가 삭제한 학생
   *  meta/reset       {ts}                   교사가 반 초기화
   */
  const BROKERS = [
    { name: 'EMQX', url: 'wss://broker.emqx.io:8084/mqtt' },
    { name: 'HiveMQ', url: 'wss://broker.hivemq.com:8884/mqtt' },
    { name: 'Mosquitto', url: 'wss://test.mosquitto.org:8081' }
  ];
  if (PARAMS.get('broker')) BROKERS.unshift({ name: 'Custom', url: PARAMS.get('broker') });
  const NS = 'dainedu-efe-l2-v1';
  const RT = {
    room: '', store: new Map(), client: null, connected: false, synced: false, verified: false,
    bi: +LS.get('efe.class.srv', 0) || 0, listeners: new Set(), _tm: null, waiters: [],
    base() { return `${NS}/${this.room}/`; },
    mineKey() { return `efe.class.mine.${this.room}.${prof ? prof.uid : 'x'}`; },
    mine() { return logged() ? LS.get(this.mineKey(), {}) : {}; },
    on(fn) { this.listeners.add(fn); return fn; },
    emit() { clearTimeout(this._tm); this._tm = setTimeout(() => this.listeners.forEach(f => { try { f(); } catch (e) { console.error(e); } }), 120); },
    put(path, obj) {
      if (!logged()) return;
      const m = this.mine();
      if (obj == null) { delete m[path]; this.store.delete(path); } else { obj.ts = Date.now(); m[path] = obj; this.store.set(path, obj); }
      LS.set(this.mineKey(), m); this.emit();
      if (this.client && this.connected && this.verified) this.client.publish(this.base() + path, obj == null ? '' : JSON.stringify(obj), { retain: true, qos: 1 });
    },
    raw(path, obj) { if (this.client && this.connected) this.client.publish(this.base() + path, obj == null ? '' : JSON.stringify(obj), { retain: true, qos: 1 }); },
    setRoom(room) {
      room = cleanRoom(room);
      if (room === this.room && this.client) return;
      this.room = room; this.store.clear(); this.synced = false; this.verified = false;
      const m = this.mine(); for (const k in m) this.store.set(k, m[k]);
      this.emit();
      if (room) loadMqtt(() => this.connect()); else this.disconnect();
    },
    disconnect() { if (this.client) { try { this.client.end(true); } catch (e) { /* 무시 */ } } this.client = null; this.connected = false; this.status(); },
    connect() {
      this.disconnect(); if (!this.room || !window.mqtt) { this.status(); return; }
      const b = BROKERS[this.bi % BROKERS.length];
      const c = mqtt.connect(b.url, { clientId: 'efe_' + Math.random().toString(36).slice(2, 12), clean: true, connectTimeout: 9000, reconnectPeriod: 4000, keepalive: 40 });
      this.client = c; this.synced = false; this.verified = false;
      const failT = setTimeout(() => { if (!this.connected && this.client === c) { this.bi = (this.bi + 1) % BROKERS.length; this.connect(); } }, 11000);
      c.on('connect', () => {
        clearTimeout(failT); this.connected = true; LS.set('efe.class.srv', this.bi); this.status();
        c.subscribe(this.base() + '#', { qos: 1 });
        setTimeout(() => { if (this.client === c) { this.synced = true; this.afterSync(); } }, 1600);
      });
      c.on('message', (topic, payload) => {
        if (this.client !== c) return;
        const path = topic.slice(this.base().length), s = payload.toString();
        if (!s) this.store.delete(path); else { try { this.store.set(path, JSON.parse(s)); } catch (e) { /* 무시 */ } }
        if (this.synced && (path === 'meta/reset' || path.startsWith('x/'))) this.applyTombs();
        this.emit();
      });
      c.on('close', () => { if (this.client === c) { this.connected = false; this.status(); } });
      c.on('error', () => { /* 재연결은 라이브러리가 처리 */ });
    },
    applyTombs() {
      if (!logged()) return;
      const rs = this.store.get('meta/reset'), tb = this.store.get('x/' + prof.uid);
      const cut = Math.max(rs ? rs.ts || 0 : 0, tb ? tb.ts || 0 : 0);
      if (!cut) return;
      const m = this.mine(); let changed = false;
      for (const k in m) if ((m[k].ts || 0) < cut) { delete m[k]; this.store.delete(k); changed = true; }
      if (changed) LS.set(this.mineKey(), m);
      if (tb && (prof.since || 0) < tb.ts && !this.store.get('u/' + prof.uid)) {
        toast('선생님이 이 반의 내 기록을 삭제했어요. 다시 로그인해 주세요.'); logout(true); return;
      }
      if (changed) { for (const k in m) this.store.set(k, m[k]); toast('선생님이 반 점수를 초기화했어요.'); this.emit(); }
    },
    afterSync() {
      this.applyTombs();
      if (logged()) {
        const u = this.store.get('u/' + prof.uid);
        if (u && u.ph && u.ph !== prof.ph) { toast('⚠️ 이 반에 같은 이름이 다른 PIN으로 등록돼 있어요.'); logout(true); openLogin('같은 이름이 다른 PIN으로 이미 등록돼 있어요. 이름에 번호나 성을 붙여 주세요.'); }
        else { this.verified = true; this.adopt(); this.publishMine(); presence(); }
      }
      this.status(); this.emit();
      const w = this.waiters; this.waiters = []; w.forEach(f => f());
    },
    adopt() {                       // 다른 기기에서 쌓은 내 점수를 이 기기로 합치기
      const m = this.mine(), me = prof.uid;
      for (const [k, v] of this.store) {
        if (!(k.startsWith('s/' + me + '/'))) continue;
        m[k] = mergeRec(m[k], v);
      }
      LS.set(this.mineKey(), m); for (const k in m) this.store.set(k, m[k]);
    },
    publishMine() { const m = this.mine(); for (const k in m) if (this.client && this.connected) this.client.publish(this.base() + k, JSON.stringify(m[k]), { retain: true, qos: 1 }); },
    ready(ms) { return new Promise(res => { if (this.synced) return res(true); const t = setTimeout(() => res(false), ms || 9000); this.waiters.push(() => { clearTimeout(t); res(true); }); }); },
    status() {
      $$('.cl-dot').forEach(d => { d.className = 'cl-dot ' + (this.connected && this.synced ? 'on' : this.room ? 'wait' : ''); });
      $$('.cl-live').forEach(d => d.classList.toggle('off', !(this.connected && this.synced)));
      const b = BROKERS[this.bi % BROKERS.length];
      $$('.cl-statusTxt').forEach(e => { e.textContent = !this.room ? '반 코드 없음' : this.connected ? (this.synced ? `반 ${this.room} · 실시간 연결됨 (${b.name})` : '동기화 중…') : '연결 중… (점수는 이 기기에 저장되고 연결되면 자동 공유돼요)'; });
    }
  };
  function loadMqtt(cb) {
    if (window.mqtt) return cb();
    if (loadMqtt.q) { loadMqtt.q.push(cb); return; }
    loadMqtt.q = [cb];
    const srcs = ['https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js', 'https://cdn.jsdelivr.net/npm/mqtt@5.10.1/dist/mqtt.min.js'];
    const tryLoad = i => {
      if (i >= srcs.length) { RT.status(); return; }
      const s = document.createElement('script'); s.src = srcs[i];
      s.onload = () => { const q = loadMqtt.q; loadMqtt.q = null; q.forEach(f => f()); };
      s.onerror = () => tryLoad(i + 1);
      document.head.append(s);
    };
    tryLoad(0);
  }
  function mergeRec(a, b) {
    if (!a) return b ? JSON.parse(JSON.stringify(b)) : b; if (!b) return a;
    const r = { n: a.n || b.n, ex: Object.assign({}, a.ex), sp: Object.assign({}, a.sp), nx: Math.max(a.nx || 0, b.nx || 0), ts: Math.max(a.ts || 0, b.ts || 0) };
    for (const id in (b.ex || {})) { const x = b.ex[id], y = r.ex[id]; if (!y || x[0] / x[1] > y[0] / y[1]) r.ex[id] = x; }
    for (const k in (b.sp || {})) r.sp[k] = Math.max(r.sp[k] || 0, b.sp[k]);
    return r;
  }
  function presence() { if (logged() && RT.verified) RT.put('u/' + prof.uid, { n: prof.name, ph: prof.ph, at: UNIT }); }

  /* ───────── 점수 계산 ───────── */
  const exPts = rec => { let p = 0; for (const id in (rec && rec.ex || {})) { const [ok, tot] = rec.ex[id]; if (!tot) continue; p += Math.round(ok / tot * 10) + (ok === tot ? 5 : 0); } return p; };
  const spList = rec => Object.values(rec && rec.sp || {}).sort((a, b) => b - a).slice(0, 10);
  const spPts = rec => spList(rec).reduce((a, v) => a + Math.round(v / 10), 0);
  const perfectN = rec => Object.values(rec && rec.ex || {}).filter(([o, t]) => t && o === t).length;
  const spokenN = rec => Object.values(rec && rec.sp || {}).filter(v => v >= 70).length;
  function roster() {
    const out = {};
    const get = uid => (out[uid] = out[uid] || { uid, name: '', units: {}, ex: 0, sp: 0, total: 0, ts: 0, at: 0 });
    for (const [k, v] of RT.store) {
      const p = k.split('/');
      if (p[0] === 'u' && v) { const s = get(p[1]); s.name = v.n || s.name; s.at = v.at || 0; s.ts = Math.max(s.ts, v.ts || 0); }
      else if (p[0] === 's' && v) {
        const s = get(p[1]); if (!s.name) s.name = v.n || '';
        const e = exPts(v), sp = spPts(v);
        s.units[p[2]] = { ex: e, sp, pts: e + sp, perfect: perfectN(v), nx: v.nx || UNIT_EX[p[2] - 1] || 0, spoken: spokenN(v) };
        s.ex += e; s.sp += sp; s.total += e + sp; s.ts = Math.max(s.ts, v.ts || 0);
      }
    }
    return Object.values(out).filter(s => s.name);
  }
  function lbHTML(rows, opt) {
    opt = opt || {};
    if (!rows.length) return `<div class="cl-empty">${opt.empty || '아직 점수가 없어요. 첫 번째 주인공이 되어 보세요! 🚀'}</div>`;
    const medal = ['🥇', '🥈', '🥉'];
    return `<div class="cl-lb">${rows.map((r, i) => `<div class="cl-lr ${logged() && r.uid === prof.uid ? 'me' : ''}"><span class="rk">${medal[i] || i + 1}</span>${avatar(r.name)}<span class="nm">${esc(r.name)}${r.sub ? `<small>${r.sub}</small>` : ''}</span><span class="sc">${r.score}<small style="font-size:11px;font-weight:600">점</small></span></div>`).join('')}</div>`;
  }
  const sortRows = rows => rows.sort((a, b) => b.score - a.score || (a.ts || 0) - (b.ts || 0));

  /* ───────── 문제 점수 반영 ───────── */
  const revealed = new Set();
  let nagged = false;
  function unitRec() { return mergeRec(RT.store.get(`s/${prof.uid}/${UNIT}`), RT.mine()[`s/${prof.uid}/${UNIT}`]) || { n: prof.name, ex: {}, sp: {} }; }
  function saveUnitRec(mut) {
    if (!logged()) return 0;
    const rec = unitRec(); const before = exPts(rec) + spPts(rec);
    mut(rec); rec.n = prof.name; rec.nx = $$('.mod.ex').length || rec.nx || UNIT_EX[UNIT - 1];
    const gain = exPts(rec) + spPts(rec) - before;
    if (gain > 0 || !RT.store.has(`s/${prof.uid}/${UNIT}`)) RT.put(`s/${prof.uid}/${UNIT}`, rec);
    return gain;
  }
  function nag() {
    if (nagged) return; nagged = true;
    toast('🔐 로그인하면 점수가 <b>우리반 순위</b>에 올라가요!');
    const p = $('#clMe'); if (p) { p.classList.remove('pulse'); void p.offsetWidth; p.classList.add('pulse'); }
  }
  document.addEventListener('efe:result', e => {
    const d = e.detail || {}; if (!IS_UNIT || d.unit !== UNIT) return;
    if (d.reset) { revealed.delete(d.id); return; }
    if (d.revealed) { revealed.add(d.id); return; }
    if (!logged()) { nag(); return; }
    if (revealed.has(d.id)) { toast('👁 정답 보기를 한 문제는 순위에 반영되지 않아요. “다시 풀기” 후 도전!'); return; }
    if (!d.total) return;
    const gain = saveUnitRec(rec => { const p = rec.ex[d.id]; if (!p || d.ok / d.total > p[0] / p[1]) rec.ex[d.id] = [d.ok, d.total]; });
    if (gain > 0) setTimeout(() => toast(`🏆 +${gain}점! 우리반 순위에 반영됐어요`), 700);
  });

  /* ───────── 영어 비교용 정규화 ───────── */
  const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
  const TENS = ',,twenty,thirty,forty,fifty,sixty,seventy,eighty,ninety'.split(',');
  function numW(n) {
    n = +n; if (!isFinite(n) || n > 9999) return String(n);
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
    if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numW(n % 100) : '');
    if (n % 100 === 0 && n % 1000 !== 0 && n < 10000 && n >= 1100) return numW(Math.floor(n / 100)) + ' hundred';
    return numW(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + numW(n % 1000) : '');
  }
  function nrm(s) {
    s = ' ' + String(s || '').toLowerCase().replace(/[’‘`´]/g, "'").replace(/[“”]/g, '"') + ' ';
    s = s.replace(/°\s*c\b/g, ' degrees celsius').replace(/°\s*f\b/g, ' degrees fahrenheit').replace(/°/g, ' degrees');
    s = s.replace(/(\d+):00/g, '$1').replace(/(\d+):(\d\d)/g, '$1 $2').replace(/\bo'?\s?clock\b/g, ' ');
    s = s.replace(/\ba\.m\.?/g, 'am').replace(/\bp\.m\.?/g, 'pm').replace(/(\d)(am|pm)\b/g, '$1 $2');
    s = s.replace(/(\d+)(st|nd|rd|th)\b/g, '$1').replace(/\$(\d+)/g, '$1 dollars').replace(/(\d+)%/g, '$1 percent');
    s = s.replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b|\bcannot\b/g, 'can not').replace(/\bshan't\b/g, 'shall not');
    s = s.replace(/n't\b/g, ' not').replace(/'m\b/g, ' am').replace(/'re\b/g, ' are').replace(/'ve\b/g, ' have').replace(/'ll\b/g, ' will').replace(/'d\b/g, ' would');
    s = s.replace(/\b(it|he|she|that|what|where|who|there|here|how|this|when|why|let)'s\b/g, (m, w) => w === 'let' ? 'let us' : w + ' is');
    s = s.replace(/\d+/g, d => ' ' + numW(d) + ' ');
    s = s.replace(/\bokay\b/g, 'ok').replace(/\bmr\.?\s/g, 'mister ').replace(/\bmrs\.?\s/g, 'missus ').replace(/\bms\.?\s/g, 'miss ');
    s = s.replace(/'/g, '').replace(/[-–—/]/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    return s;
  }
  function charSim(a, b) {
    if (!a || !b) return 0; if (a === b) return 1;
    const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
    return 1 - prev[n] / Math.max(m, n);
  }
  function wordDiff(target, heard) {           // 목표 문장의 각 단어가 들렸는지(LCS)
    const tw = target.split(' '), hw = heard.split(' ');
    const L = Array.from({ length: tw.length + 1 }, () => new Array(hw.length + 1).fill(0));
    for (let i = tw.length - 1; i >= 0; i--) for (let j = hw.length - 1; j >= 0; j--) L[i][j] = tw[i] === hw[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const ok = new Array(tw.length).fill(false); let i = 0, j = 0;
    while (i < tw.length && j < hw.length) { if (tw[i] === hw[j]) { ok[i] = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
    return ok;
  }
  function score(target, alts) {
    const t = nrm(target); let best = { pct: 0, heard: alts[0] || '' };
    alts.forEach(a => { const p = Math.round(charSim(t, nrm(a)) * 100); if (p > best.pct) best = { pct: p, heard: a }; });
    return best;
  }
  const keyOf = text => 'k' + fnv(nrm(text));

  /* ───────── 🎙 녹음 + 발음 인식 ───────── */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const CAN_REC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  const recs = new Map();     // key → {url, ext}
  let srOnly = false; try { srOnly = sessionStorage.getItem('efe.class.srOnly') === '1'; } catch (e) { /* 무시 */ }
  const Coach = { el: null, busy: false, stopFn: null, text: '', key: '' };
  function coachEl() {
    if (Coach.el) return Coach.el;
    const el = document.createElement('div'); el.className = 'cl-coach notranslate'; el.hidden = true; el.setAttribute('translate', 'no');
    el.innerHTML = `<div class="cl-ci" role="dialog" aria-label="말하기 연습"><div class="cl-ch"><div style="min-width:0"><div class="lab">🎙 SPEAK · 소리 내어 따라 말하기</div><div class="tx" id="clTx"></div></div><button class="cl-x" type="button" aria-label="닫기">✕</button></div><div id="clBody"></div></div>`;
    document.body.append(el);
    el.querySelector('.cl-x').onclick = () => closeCoach();
    Coach.el = el; return el;
  }
  function closeCoach() { if (Coach.stopFn) Coach.stopFn(true); if (Coach.el) Coach.el.hidden = true; }
  function say(text) { if (window.EFE && EFE.say) EFE.say(text); else if ('speechSynthesis' in window) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = .92; speechSynthesis.speak(u); } }
  function openCoach(text, opts) {
    opts = opts || {};
    if (Coach.busy) { if (Coach.stopFn) Coach.stopFn(); return; }
    if (window.EFE && EFE.stopSay) EFE.stopSay(); else if ('speechSynthesis' in window) speechSynthesis.cancel();
    const el = coachEl(); el.hidden = false;
    Coach.text = text; Coach.key = keyOf(text); Coach.onDone = opts.onDone;
    $('#clTx', el).textContent = text;
    capture(text);
  }
  async function capture(text, retrySrOnly) {
    const body = $('#clBody', Coach.el);
    if (!SR && !CAN_REC) { body.innerHTML = `<p class="cl-note">이 브라우저는 마이크 녹음을 지원하지 않아요. <b>Chrome · Edge · Safari</b> 최신 버전을 사용해 주세요.</p>`; return; }
    Coach.busy = true;
    body.innerHTML = `<div class="cl-state"><span class="cl-recdot"></span><b>듣고 있어요… 지금 말하세요!</b><div class="cl-meter"><i id="clMeter"></i></div><button class="cl-btn sm red" type="button" id="clStop">⏹ 멈추기</button><div class="cl-interim" id="clInterim">${SR ? '' : '이 브라우저는 발음 인식이 안 돼서 녹음만 해요. 말한 뒤 ⏹ 를 눌러 주세요.'}</div></div>`;
    let stream = null, recorder = null, chunks = [], recog = null, ac = null, raf = 0, ended = false, alts = [], err = '', cancelled = false;
    const useRec = CAN_REC && !(srOnly && SR);
    const finish = () => {
      if (ended) return; ended = true; Coach.busy = false; Coach.stopFn = null;
      cancelAnimationFrame(raf); if (ac) ac.close().catch(() => { });
      const done = () => { if (stream) stream.getTracks().forEach(t => t.stop()); if (!cancelled) showResult(text, alts, err, retrySrOnly); };
      if (recorder && recorder.state !== 'inactive') { recorder.onstop = () => { saveBlob(); done(); }; try { recorder.stop(); } catch (e) { done(); } } else done();
    };
    const saveBlob = () => {
      if (!chunks.length) return;
      const type = recorder.mimeType || 'audio/webm'; const blob = new Blob(chunks, { type });
      const old = recs.get(Coach.key); if (old) URL.revokeObjectURL(old.url);
      recs.set(Coach.key, { url: URL.createObjectURL(blob), ext: /mp4|aac|m4a/.test(type) ? 'm4a' : /ogg/.test(type) ? 'ogg' : 'webm' });
      document.dispatchEvent(new CustomEvent('efec:rec', { detail: { key: Coach.key } }));
    };
    Coach.stopFn = cancel => {
      if (cancel) cancelled = true;
      if (recog) { try { recog.stop(); } catch (e) { finish(); } } else finish();
    };
    $('#clStop').onclick = () => Coach.stopFn && Coach.stopFn();
    try {
      if (useRec) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(m => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m));
        recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        recorder.start();
        try {   // 소리 크기 표시
          ac = new (window.AudioContext || window.webkitAudioContext)(); const an = ac.createAnalyser(); an.fftSize = 512;
          ac.createMediaStreamSource(stream).connect(an); const buf = new Uint8Array(an.fftSize);
          const tick = () => { an.getByteTimeDomainData(buf); let mx = 0; for (const v of buf) mx = Math.max(mx, Math.abs(v - 128)); const m = $('#clMeter'); if (m) m.style.width = Math.min(100, mx / 70 * 100) + '%'; raf = requestAnimationFrame(tick); };
          tick();
        } catch (e) { /* 미터 없이 진행 */ }
      }
    } catch (e) {
      Coach.busy = false;
      body.innerHTML = `<p class="cl-note">🎙 마이크를 쓸 수 없어요. 주소창 왼쪽 🔒 → <b>마이크 허용</b>으로 바꾼 뒤 다시 눌러 주세요.${location.protocol === 'file:' ? '<br>(파일로 열면 마이크가 막힐 수 있어요. 웹 주소로 열어 주세요.)' : ''}</p>`;
      return;
    }
    if (SR) {
      recog = new SR(); recog.lang = 'en-US'; recog.interimResults = true; recog.maxAlternatives = 5; recog.continuous = false;
      recog.onresult = ev => {
        let fin = null, interim = '';
        for (const r of ev.results) { if (r.isFinal) fin = r; else interim += r[0].transcript; }
        if (fin) alts = Array.from(fin).map(a => a.transcript);
        const im = $('#clInterim'); if (im) im.textContent = fin ? fin[0].transcript : interim;
      };
      recog.onerror = ev => { err = ev.error || 'error'; };
      recog.onend = () => {
        if (err === 'audio-capture' && useRec && !retrySrOnly) {           // 녹음과 인식을 동시에 못 하는 기기 → 인식만
          srOnly = true; try { sessionStorage.setItem('efe.class.srOnly', '1'); } catch (e) { /* 무시 */ } ended = true; Coach.busy = false;
          if (recorder && recorder.state !== 'inactive') try { recorder.stop(); } catch (e) { /* 무시 */ }
          if (stream) stream.getTracks().forEach(t => t.stop()); cancelAnimationFrame(raf);
          setTimeout(() => capture(text, true), 250); return;
        }
        setTimeout(finish, 250);
      };
      try { recog.start(); } catch (e) { err = 'start'; finish(); return; }
      setTimeout(() => { if (!ended && recog) try { recog.stop(); } catch (e) { /* 무시 */ } }, 12000);
    } else {
      const words = text.split(/\s+/).length; setTimeout(() => { if (!ended) finish(); }, Math.min(10000, 2500 + words * 600));
    }
  }
  function showResult(text, alts, err, srOnlyMode) {
    const body = $('#clBody', Coach.el); if (!body) return;
    const r = recs.get(Coach.key);
    const recBtns = r ? `<button class="cl-btn ghost sm" type="button" id="clPlay">▶ 내 녹음 듣기</button><a class="cl-btn ghost sm" id="clDl" href="${r.url}" download="EfE-U${UNIT || 0}-${nrm(text).split(' ').slice(0, 5).join('_') || 'speaking'}.${r.ext}">⬇ 녹음 저장</a>` : '';
    const common = `<button class="cl-btn ghost sm" type="button" id="clNative">🔊 원어민 발음</button>${recBtns}<button class="cl-btn sm" type="button" id="clAgain">🎙 다시 녹음</button>`;
    let html;
    if (!SR) {
      html = `<p class="cl-note">이 브라우저는 <b>발음 인식</b>을 지원하지 않아 점수는 나오지 않아요. 녹음을 듣고 원어민 발음과 비교해 보세요. (점수는 Chrome · Edge · Safari에서)</p>`;
    } else if (!alts.length) {
      const why = { 'no-speech': '소리가 들리지 않았어요. 마이크 가까이에서 또렷하게 말해 보세요.', 'not-allowed': '마이크 권한이 꺼져 있어요. 주소창의 🔒에서 마이크를 허용해 주세요.', 'service-not-allowed': '음성 인식이 막혀 있어요. 브라우저 설정에서 음성 인식을 허용해 주세요.', network: '음성 인식은 인터넷 연결이 필요해요.', 'audio-capture': '마이크를 찾을 수 없어요.' }[err] || '잘 알아듣지 못했어요. 다시 한 번 말해 볼까요?';
      html = `<p class="cl-note">🤔 ${why}</p>`;
    } else {
      const sc = score(text, alts), pct = sc.pct;
      const ok = wordDiff(nrm(text), nrm(sc.heard));
      const verdict = pct >= 90 ? '🌟 Excellent!' : pct >= 75 ? '👍 Great job!' : pct >= 55 ? '🙂 Good — 조금만 더!' : '💪 다시 도전!';
      const color = pct >= 75 ? '#1b9a5f' : pct >= 55 ? '#e29a00' : '#d4423a';
      let gain = 0, msg = '';
      if (IS_UNIT && logged()) gain = saveUnitRec(rec => { rec.sp = rec.sp || {}; rec.sp[Coach.key] = Math.max(rec.sp[Coach.key] || 0, pct); });
      else if (IS_UNIT && !logged()) msg = '<div class="cl-heard">🔐 로그인하면 말하기 점수도 우리반 순위에 올라가요.</div>';
      html = `<div class="cl-res"><div class="cl-ring" style="--p:${pct};--c:${color}"><span>${pct}</span></div><div style="flex:1;min-width:200px"><div class="cl-verdict">${verdict}${gain > 0 ? `<span class="cl-pts">+${gain}점</span>` : ''}</div><div class="cl-heard">들린 문장: “${esc(sc.heard)}”</div><div class="cl-diff">${nrm(text).split(' ').map((w, i) => `<span class="${ok[i] ? 'ok' : 'miss'}">${esc(w)}</span>`).join(' ')}</div>${msg}</div></div>`;
      if (Coach.onDone) try { Coach.onDone(pct); } catch (e) { /* 무시 */ }
    }
    if (srOnlyMode) html += `<p class="cl-note">ℹ️ 이 기기는 녹음과 발음 인식을 동시에 할 수 없어 <b>인식만</b> 했어요.</p>`;
    body.innerHTML = html + `<div class="cl-acts">${common}</div>`;
    $('#clNative').onclick = () => say(text);
    $('#clAgain').onclick = () => capture(text);
    const pb = $('#clPlay'); if (pb) pb.onclick = () => playRec(Coach.key);
  }
  let player = null;
  function playRec(key) { const r = recs.get(key); if (!r) return; if (player) player.pause(); player = new Audio(r.url); player.play().catch(() => toast('재생할 수 없어요.')); }

  /* ───────── 문장 모으기 + 마이크 버튼 붙이기 ───────── */
  const BAD = /[\/→←·=+…|]|[\u3131-\uD79D]|\.\.\./;
  const isSentence = t => { t = String(t || '').trim(); const w = t.split(/\s+/).length; return t.length >= 6 && t.length <= 110 && w >= 2 && /^[A-Z"'‘“0-9]/.test(t) && /[.?!]["'’”]?$/.test(t) && !BAD.test(t); };
  const isWord = t => { t = String(t || '').trim(); return t.length >= 2 && t.length <= 30 && /^[A-Za-z][A-Za-z '’-]*$/.test(t); };
  function spkText(b) {
    const al = b.getAttribute('aria-label') || '';
    if (al.startsWith('듣기:')) return al.slice(3).trim();
    const oc = b.getAttribute('onclick') || ''; const m = oc.match(/EFE\.say\('((?:\\.|[^'\\])*)'/);
    if (m) return m[1].replace(/\\(.)/g, '$1');
    const p = b.closest('[data-say]'); return p ? (p.getAttribute('data-say') || '') : '';
  }
  function micBtn(text, corner) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cl-mic' + (corner ? ' corner' : ''); b.textContent = '🎙';
    b.title = '따라 말하기 (녹음 + 발음 점수)'; b.setAttribute('aria-label', '따라 말하기: ' + text); b.dataset.clText = text;
    b.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); openCoach(text); });
    return b;
  }
  function decorate(root) {
    if (!IS_UNIT) return;
    $$('.spk', root).forEach(b => {
      if (b.dataset.clDone || b.closest('#clSpeak')) return; b.dataset.clDone = 1;
      const t = spkText(b).replace(/\s+/g, ' ').trim(); if (!(isSentence(t) || isWord(t))) return;
      b.after(micBtn(t));
    });
    $$('.mod.lesson .exc[data-say], .mod.lesson .vcard', root).forEach(c => {
      if (c.dataset.clDone) return; c.dataset.clDone = 1;
      const t = c.classList.contains('vcard') ? ($('.w', c) || {}).textContent : c.getAttribute('data-say');
      if (!t || !(isSentence(t) || isWord(t))) return;
      if (getComputedStyle(c).position === 'static') c.classList.add('cl-rel');
      c.append(micBtn(t.trim(), true));
    });
    $$('.mod.lesson [data-say]', root).forEach(c => {
      if (c.dataset.clDone || c.closest('svg') || c.classList.contains('exc') || $('.spk', c)) return; c.dataset.clDone = 1;
      const t = (c.getAttribute('data-say') || '').trim(); if (!isSentence(t)) return;
      if (/^(TD|TH|TR|TABLE|TBODY)$/.test(c.tagName)) return;
      c.append(micBtn(t));
    });
  }
  function collectSentences() {
    const seen = new Set(), sents = [], words = [];
    const add = (arr, t) => { t = String(t || '').replace(/\s+/g, ' ').trim(); const k = nrm(t); if (!k || seen.has(k)) return; seen.add(k); arr.push(t); };
    $$('.mod.lesson').forEach(m => {
      $$('[data-say]', m).forEach(e => { const t = e.getAttribute('data-say'); if (isSentence(t)) add(sents, t); });
      $$('.spk', m).forEach(b => { const t = spkText(b); if (isSentence(t)) add(sents, t); });
      $$('.vcard .w', m).forEach(w => { const t = w.textContent; if (isWord(t)) add(words, t); });
    });
    const spread = (arr, n) => arr.length <= n ? arr.slice() : Array.from({ length: n }, (_, i) => arr[Math.floor(i * arr.length / n)]);
    let list = spread(sents, 10);
    if (list.length < 10) list = list.concat(spread(words, 10 - list.length));
    return list;
  }

  /* ───────── 단원 페이지: Speaking Challenge ───────── */
  function buildSpeak() {
    const list = (window.EFE_SPEAK && EFE_SPEAK[UNIT]) || collectSentences();
    if (!list.length) return;
    const flow = $('#flow') || $('main'); if (!flow) return;
    const sec = document.createElement('section'); sec.className = 'mod lesson'; sec.id = 'clSpeak'; sec.setAttribute('data-label', '🎙 말하기');
    sec.innerHTML = `<div class="mod-head"><span class="n">🎙</span><h2><span class="k">SPEAKING CHALLENGE</span> 소리 내어 말하기<small>🔊 듣고 → 🎙 녹음하면 발음 정확도를 바로 알려 줘요 · 높은 점수는 우리반 순위에 반영!</small></h2></div>
      <div class="mod-body"><div class="cl-spgrid"><div><div class="cl-sp-list" id="clSpList"></div>
      <p class="cl-note">🎧 조용한 곳에서 마이크 가까이 또렷하게 말해 주세요. 녹음은 이 기기에만 남고 서버로 올라가지 않아요(⬇로 저장 가능). 발음 인식은 <b>Chrome · Edge · Safari</b>에서 돼요. 페이지 곳곳의 <b>🎙</b> 버튼으로도 연습할 수 있어요.</p></div>
      <div class="cl-box"><h4>🏆 이 단원 말하기 TOP <span class="cl-live">LIVE</span></h4><div id="clSpTop"></div></div></div></div>`;
    const cl = $('#checklist'); if (cl && cl.parentNode === flow) flow.insertBefore(sec, cl); else flow.append(sec);
    const toc = $('#toc'); if (toc) { const a = document.createElement('a'); a.href = '#clSpeak'; a.textContent = '🎙 말하기'; a.className = 'lesson'; toc.append(a); }
    const box = $('#clSpList');
    const draw = () => {
      const rec = logged() ? unitRec() : null;
      box.innerHTML = list.map((t, i) => {
        const k = keyOf(t), best = rec && rec.sp ? rec.sp[k] : null;
        const cnt = Array.from(RT.store).filter(([kk, v]) => kk.startsWith('s/') && kk.endsWith('/' + UNIT) && v && v.sp && v.sp[k] >= 70).length;
        return `<div class="cl-sp ${best >= 70 ? 'pass' : ''}" data-i="${i}"><span class="no">${i + 1}</span><span class="t">${esc(t)}${RT.room ? `<small>우리반 성공(70%↑) ${cnt}명</small>` : ''}</span>
          <button class="b" type="button" data-act="say" title="원어민 발음">🔊</button><button class="b" type="button" data-act="rec" title="녹음하고 점수 받기">🎙</button><button class="b" type="button" data-act="play" title="내 녹음 듣기" ${recs.has(k) ? '' : 'disabled'}>▶</button>
          <span class="best" style="color:${best >= 75 ? 'var(--ok,#1b9a5f)' : best >= 55 ? 'var(--warn,#e29a00)' : 'var(--muted,#5d6577)'}">${best != null ? best + '%' : '–'}</span></div>`;
      }).join('');
      const rows = sortRows(roster().filter(s => s.units[UNIT] && s.units[UNIT].sp > 0).map(s => ({ uid: s.uid, name: s.name, score: s.units[UNIT].sp, ts: s.ts, sub: `70%↑ ${s.units[UNIT].spoken}문장` }))).slice(0, 5);
      $('#clSpTop').innerHTML = RT.room ? lbHTML(rows, { empty: '아직 아무도 녹음하지 않았어요.' }) : '<div class="cl-empty">로그인하면 우리반 말하기 순위가 보여요.</div>';
    };
    box.addEventListener('click', e => {
      const b = e.target.closest('button[data-act]'); if (!b) return; const t = list[+b.closest('.cl-sp').dataset.i];
      if (b.dataset.act === 'say') say(t); else if (b.dataset.act === 'rec') openCoach(t); else playRec(keyOf(t));
    });
    document.addEventListener('efec:rec', draw);
    RT.on(draw); draw();
  }

  /* ───────── 로그인 창 ───────── */
  let modal = null;
  function openLogin(errMsg) {
    if (!modal) { modal = document.createElement('div'); modal.className = 'cl-modal'; modal.hidden = true; document.body.append(modal); modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; }); }
    if (logged()) {
      modal.innerHTML = `<div class="cl-card"><h3>👤 ${esc(prof.name)}</h3><p class="cl-sub">반 코드 <b>${esc(prof.room)}</b>로 로그인되어 있어요.</p>
        <p class="cl-note"><span class="cl-dot"></span> <span class="cl-statusTxt"></span></p>
        <div class="cl-row" style="margin-top:16px"><button class="cl-btn" type="button" id="clRankOpen">🏆 우리반 순위 보기</button><button class="cl-btn ghost" type="button" id="clOut">로그아웃</button><button class="cl-btn ghost" type="button" id="clClose">닫기</button></div>
        <p class="cl-note">💻 학교 공용 컴퓨터라면 수업이 끝난 뒤 꼭 <b>로그아웃</b>해 주세요.</p></div>`;
      $('#clOut', modal).onclick = () => { logout(); modal.hidden = true; };
      $('#clClose', modal).onclick = () => modal.hidden = true;
      $('#clRankOpen', modal).onclick = () => { modal.hidden = true; if (IS_UNIT) openDrawer(); else { const d = $('#class'); if (d) d.scrollIntoView({ behavior: 'smooth' }); } };
      RT.status(); modal.hidden = false; return;
    }
    const room = viewRoom();
    modal.innerHTML = `<div class="cl-card"><h3>🔐 우리반 로그인</h3><p class="cl-sub">반 코드·이름·PIN으로 들어오면 내 점수가 반 친구들과 실시간으로 비교돼요.</p>
      <label class="cl-field">반 코드 (선생님이 알려 준 코드)<input id="clRoom" maxlength="12" autocomplete="off" placeholder="예: KCIS7A" value="${esc(room)}" style="text-transform:uppercase"></label>
      <label class="cl-field">이름 (반에서 부르는 이름)<input id="clName" maxlength="20" autocomplete="off" placeholder="예: Minji Kim"></label>
      <label class="cl-field">PIN 숫자 4자리 (처음이면 새로 정하기)<input id="clPin" maxlength="4" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="••••" type="password"></label>
      <div class="cl-err" id="clErr">${esc(errMsg || '')}</div>
      <div class="cl-row" style="margin-top:10px"><button class="cl-btn" type="button" id="clGo">로그인</button><button class="cl-btn ghost" type="button" id="clCancel">취소</button></div>
      <p class="cl-note">처음 로그인하면 이 <b>이름 + PIN</b>이 반에 등록돼요. 다른 기기에서도 같은 반 코드·이름·PIN으로 로그인하면 점수가 이어져요. 공개 실시간 서버를 쓰므로 비밀번호처럼 중요한 숫자는 쓰지 마세요.</p></div>`;
    modal.hidden = false;
    const go = async () => {
      const r = cleanRoom($('#clRoom').value), n = cleanName($('#clName').value), p = $('#clPin').value.trim(), errEl = $('#clErr'), btn = $('#clGo');
      if (!r) return errEl.textContent = '반 코드를 입력해 주세요.';
      if (n.length < 2) return errEl.textContent = '이름을 2글자 이상 입력해 주세요.';
      if (!/^\d{4}$/.test(p)) return errEl.textContent = 'PIN은 숫자 4자리예요.';
      btn.disabled = true; btn.textContent = '확인 중…'; errEl.textContent = '';
      const nn = n.toLowerCase();
      const uid = 'u' + (await sha(`efe|${r}|${nn}`)).slice(0, 12), ph = (await sha(`pin|${r}|${nn}|${p}`)).slice(0, 16);
      if (RT.room !== r || !RT.client) { prof = null; RT.setRoom(r); }
      const ok = await RT.ready(9000);
      const u = RT.store.get('u/' + uid);
      if (ok && u && u.ph && u.ph !== ph) { btn.disabled = false; btn.textContent = '로그인'; errEl.textContent = '이 반에 같은 이름이 다른 PIN으로 등록돼 있어요. PIN을 다시 확인하거나, 이름에 성·번호를 붙여 주세요.'; return; }
      prof = { room: r, name: n, uid, ph, since: Date.now() }; LS.set(PKEY, prof); LS.set('efe.class.view', r);
      if (ok) { RT.verified = true; RT.adopt(); RT.publishMine(); presence(); }
      modal.hidden = true; renderMe(); RT.emit();
      toast(ok ? `👋 Welcome, ${esc(n)}! 이제 점수가 반 ${esc(r)} 순위에 올라가요.` : `👋 ${esc(n)} 로그인 (오프라인) — 연결되면 자동으로 공유돼요.`);
    };
    $('#clGo', modal).onclick = go; $('#clCancel', modal).onclick = () => modal.hidden = true;
    $$('input', modal).forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }));
    setTimeout(() => { if (!modal.contains(document.activeElement)) (room ? $('#clName', modal) : $('#clRoom', modal)).focus(); }, 50);
  }
  function logout(silent) {
    prof = null; LS.del(PKEY); RT.verified = false;
    if (!silent) toast('로그아웃했어요. 👋');
    const r = cleanRoom(LS.get('efe.class.view', ''));
    RT.disconnect(); RT.room = '#'; RT.setRoom(r);          // 다시 연결 (로그인 없이 순위만 보기)
    renderMe(); RT.emit();
  }

  /* ───────── 단원 페이지: 상단 버튼 + 순위 서랍 ───────── */
  let drawer = null, dTab = 'unit';
  function renderMe() {
    const p = $('#clMe'); if (!p) return;
    p.innerHTML = `<span class="cl-dot"></span><span class="cl-nm">${logged() ? esc(prof.name) : '로그인'}</span>`;
    p.title = logged() ? `반 ${prof.room} · ${prof.name}` : '우리반 로그인';
    RT.status();
  }
  function openDrawer() { if (!drawer) buildDrawer(); drawer.classList.add('open'); drawDrawer(); }
  function buildDrawer() {
    drawer = document.createElement('aside'); drawer.className = 'cl-drawer'; drawer.setAttribute('aria-label', '우리반 순위');
    drawer.innerHTML = `<div class="cl-dh"><h3>🏆 우리반 순위</h3><span class="cl-live off">LIVE</span><button class="cl-x" type="button" aria-label="닫기">✕</button></div><div class="cl-db" id="clDb"></div>`;
    document.body.append(drawer);
    drawer.querySelector('.cl-x').onclick = () => drawer.classList.remove('open');
    RT.on(() => { if (drawer.classList.contains('open')) drawDrawer(); });
  }
  function drawDrawer() {
    const db = $('#clDb'); if (!db) return;
    if (!RT.room) { db.innerHTML = `<div class="cl-empty">🔐 로그인하면 우리반 친구들과<br>점수를 실시간으로 겨룰 수 있어요!<br><br><button class="cl-btn" type="button" id="clDLogin">로그인</button></div>${rulesHTML()}`; $('#clDLogin').onclick = () => openLogin(); return; }
    const all = roster();
    const me = logged() ? all.find(s => s.uid === prof.uid) : null, mu = me && me.units[UNIT];
    const rowsU = sortRows(all.filter(s => s.units[UNIT]).map(s => { const u = s.units[UNIT]; return { uid: s.uid, name: s.name, score: u.pts, ts: s.ts, sub: `문제 ${u.ex} · 말하기 ${u.sp} · 만점 ${u.perfect}/${u.nx}` }; }));
    const rowsA = sortRows(all.map(s => ({ uid: s.uid, name: s.name, score: s.total, ts: s.ts, sub: `문제 ${s.ex} · 말하기 ${s.sp} · ${Object.keys(s.units).length}개 단원` })));
    const rows = dTab === 'unit' ? rowsU : rowsA;
    const myRank = logged() ? rows.findIndex(r => r.uid === prof.uid) + 1 : 0;
    db.innerHTML = (logged() ? `<div class="cl-me">${avatar(prof.name)}<div><b>${esc(prof.name)}</b><small>반 ${esc(prof.room)} · ${dTab === 'unit' ? `Unit ${UNIT}` : '전체'} ${myRank ? myRank + '위 / ' + rows.length + '명' : '아직 기록 없음'}</small><small>문제 ${dTab === 'unit' ? (mu ? mu.ex : 0) : (me ? me.ex : 0)}점 · 말하기 ${dTab === 'unit' ? (mu ? mu.sp : 0) : (me ? me.sp : 0)}점</small></div><div class="cl-big">${dTab === 'unit' ? (mu ? mu.pts : 0) : (me ? me.total : 0)}<br><small>점</small></div></div>`
      : `<div class="cl-me"><div style="flex:1">반 <b>${esc(RT.room)}</b> 순위를 보고 있어요.<small>로그인하면 내 점수도 올라가요.</small></div><button class="cl-btn sm" type="button" id="clDLogin">로그인</button></div>`) +
      `<div class="cl-tabs"><button type="button" data-t="unit" class="${dTab === 'unit' ? 'on' : ''}">Unit ${UNIT}</button><button type="button" data-t="all" class="${dTab === 'all' ? 'on' : ''}">전체 단원</button></div>` +
      lbHTML(rows.slice(0, 30)) +
      `<p style="margin:14px 0 0;font-size:13px"><a href="../#class">📊 전체 대시보드 (단원별 표) →</a></p>` + rulesHTML() +
      `<p class="cl-note" style="margin-top:10px"><span class="cl-dot"></span> <span class="cl-statusTxt"></span></p>`;
    $$('.cl-tabs button', db).forEach(b => b.onclick = () => { dTab = b.dataset.t; drawDrawer(); });
    const lb = $('#clDLogin'); if (lb) lb.onclick = () => openLogin();
    RT.status();
  }
  const rulesHTML = () => `<div class="cl-rules"><b>점수 규칙</b><br>✎ 연습문제: 맞힌 비율 × 10점 + 만점 보너스 5점 (문제마다 최고 기록)<br>🎙 말하기: 발음 정확도 10%당 1점 (단원별 최고 10문장, 문장당 최대 10점)<br>👁 정답 보기를 누른 뒤 푼 문제는 점수에 들어가지 않아요.</div>`;
  function mountUnitUI() {
    const bar = $('.topbar .wrap'); if (!bar) return;
    const me = document.createElement('button'); me.type = 'button'; me.className = 'cl-pill'; me.id = 'clMe'; me.onclick = () => openLogin();
    const rk = document.createElement('button'); rk.type = 'button'; rk.className = 'cl-pill gold'; rk.id = 'clRank'; rk.innerHTML = '🏆<span class="cl-nm"> 우리반</span>'; rk.title = '우리반 순위'; rk.onclick = () => openDrawer();
    const prog = $('.prog', bar); bar.insertBefore(me, prog); bar.insertBefore(rk, prog);
    renderMe();
    buildSpeak();
    decorate(document);
    const flow = $('#flow') || document.body;
    new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.matches && n.matches('.spk')) decorate(n.parentNode); else if (n.querySelector && n.querySelector('.spk')) decorate(n); } }).observe(flow, { childList: true, subtree: true });
  }

  /* ───────── 메인 페이지: 우리반 대시보드 ───────── */
  function mountIndexUI() {
    const wrap = $('main.wrap') || $('main'); if (!wrap) return;
    const sec = document.createElement('section'); sec.className = 'cl-dash'; sec.id = 'class';
    const note = $('.note', wrap); if (note) wrap.insertBefore(sec, note); else wrap.append(sec);
    const sub = $('.sub', wrap);
    if (sub) { const p = document.createElement('div'); p.className = 'cl-row'; p.style.margin = '-12px 0 22px'; p.innerHTML = `<button class="cl-pill" type="button" id="clMe"></button><a class="cl-pill gold" href="#class" style="text-decoration:none">🏆 우리반 순위</a>`; sub.after(p); $('#clMe').onclick = () => openLogin(); renderMe(); }
    const draw = () => {
      const all = roster(); const rows = all.sort((a, b) => b.total - a.total || a.ts - b.ts);
      const maxU = HUES.map((_, i) => Math.max(1, ...rows.map(s => (s.units[i + 1] || {}).pts || 0)));
      const share = RT.room ? `${location.origin}${location.pathname}?room=${RT.room}` : '';
      const head = `<h2>🏆 우리반 대시보드 <span class="cl-live off">LIVE</span></h2>
        <div class="cl-dtop">${logged() ? `${avatar(prof.name)}<div><b>${esc(prof.name)}</b> · 반 <b>${esc(prof.room)}</b><br><small style="color:var(--mut,#6b645a)">${(() => { const i = rows.findIndex(s => s.uid === prof.uid); return i >= 0 ? `${i + 1}위 / ${rows.length}명 · 총 ${rows[i].total}점` : '아직 점수가 없어요 — 단원에 들어가 문제를 풀거나 🎙 말하기를 해 보세요!'; })()}</small></div><button class="cl-btn ghost sm" type="button" id="clLogout">로그아웃</button>`
          : `<button class="cl-btn" type="button" id="clLogin">🔐 로그인하고 경쟁 시작</button><span style="font-size:13px;color:var(--mut,#6b645a)">또는 반 코드로 순위만 보기</span><input id="clView" maxlength="12" placeholder="반 코드" value="${esc(RT.room)}" style="padding:8px 10px;border-radius:10px;border:1.5px solid var(--line,#eadfce);font:700 14px inherit;width:120px;text-transform:uppercase;background:transparent;color:inherit"><button class="cl-btn ghost sm" type="button" id="clViewGo">보기</button>`}
          <span style="margin-left:auto;font-size:12.5px;color:var(--mut,#6b645a)"><span class="cl-dot"></span> <span class="cl-statusTxt"></span></span></div>`;
      let table;
      if (!RT.room) table = `<div class="cl-empty">반 코드로 로그인하면 반 친구들의 점수가 여기에 실시간으로 표시돼요.<br>선생님은 반 코드(예: <b>KCIS7A</b>)를 정해서 학생들에게 알려 주세요.</div>`;
      else if (!rows.length) table = `<div class="cl-empty">반 <b>${esc(RT.room)}</b>에 아직 점수가 없어요. 첫 번째로 도전해 보세요! 🚀</div>`;
      else table = `<div class="cl-tbl-wrap"><table class="cl-tbl"><thead><tr><th>순위</th><th style="text-align:left">이름</th><th>총점</th><th>✎ 문제</th><th>🎙 말하기</th>${HUES.map((_, i) => `<th><a href="Unit${i + 1}/" style="color:inherit">U${i + 1}</a></th>`).join('')}${TEACHER ? '<th>관리</th>' : ''}</tr></thead><tbody>${rows.map((s, i) => `<tr class="${logged() && s.uid === prof.uid ? 'me' : ''}"><td>${['🥇', '🥈', '🥉'][i] || i + 1}</td><td class="nm">${avatar(s.name)} ${esc(s.name)}</td><td class="tot">${s.total}</td><td>${s.ex}</td><td>${s.sp}</td>${HUES.map((h, j) => { const u = s.units[j + 1]; if (!u) return '<td style="color:#bbb">·</td>'; const a = Math.max(.12, u.pts / maxU[j]); return `<td><span class="cl-heat" title="Unit ${j + 1}: 문제 ${u.ex} · 말하기 ${u.sp} · 만점 ${u.perfect}/${u.nx}" style="background:hsl(${h} 75% 50% / ${a.toFixed(2)});color:${a > .55 ? '#fff' : 'inherit'}">${u.pts}</span></td>`; }).join('')}${TEACHER ? `<td><button class="cl-btn ghost sm" type="button" data-del="${s.uid}">삭제</button></td>` : ''}</tr>`).join('')}</tbody></table></div>`;
      const teacher = TEACHER ? `<div class="cl-dtop" style="margin-top:16px;border-top:1px dashed var(--line,#eadfce);padding-top:14px">
          <div style="flex:1;min-width:260px"><b>👩‍🏫 교사용 도구</b><br><span style="font-size:13px;color:var(--mut,#6b645a)">학생에게 링크/QR을 공유하면 반 코드가 미리 채워져요.</span><div class="cl-row" style="margin-top:8px"><label style="font-size:13px">반 코드 <input id="clTRoom" maxlength="12" value="${esc(RT.room)}" style="padding:6px 8px;border-radius:8px;border:1.5px solid var(--line,#eadfce);font:700 14px inherit;width:110px;text-transform:uppercase;background:transparent;color:inherit"></label><button class="cl-btn ghost sm" type="button" id="clTGo">이 반 보기</button>${RT.room ? `<button class="cl-btn ghost sm" type="button" id="clCopy">🔗 링크 복사</button><button class="cl-btn ghost sm" type="button" id="clCsv">⬇ CSV 내보내기</button><button class="cl-btn red sm" type="button" id="clReset">반 점수 초기화</button>` : ''}</div></div>
          ${RT.room ? `<div class="cl-qr"><img alt="QR" src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(share)}"><div style="max-width:200px;word-break:break-all"><b>${esc(RT.room)}</b><br>${esc(share)}</div></div>` : ''}</div>` : '';
      sec.innerHTML = head + table + rulesHTML() + teacher;
      const q = id => $('#' + id, sec);
      if (q('clLogin')) q('clLogin').onclick = () => openLogin();
      if (q('clLogout')) q('clLogout').onclick = () => logout();
      const view = () => { const r = cleanRoom((q('clView') || q('clTRoom')).value); if (!r) return; LS.set('efe.class.view', r); RT.setRoom(r); };
      if (q('clViewGo')) { q('clViewGo').onclick = view; q('clView').onkeydown = e => { if (e.key === 'Enter') view(); }; }
      if (q('clTGo')) q('clTGo').onclick = view;
      if (q('clCopy')) q('clCopy').onclick = () => { navigator.clipboard && navigator.clipboard.writeText(share).then(() => toast('링크를 복사했어요 🔗')); };
      if (q('clCsv')) q('clCsv').onclick = () => {
        const hdr = ['순위', '이름', '총점', '문제', '말하기', ...HUES.map((_, i) => 'U' + (i + 1))];
        const lines = [hdr].concat(rows.map((s, i) => [i + 1, s.name, s.total, s.ex, s.sp, ...HUES.map((_, j) => (s.units[j + 1] || {}).pts || 0)]));
        const csv = '\ufeff' + lines.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `EfE_L2_${RT.room}_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      };
      if (q('clReset')) q('clReset').onclick = () => {
        if (!RT.connected) return toast('실시간 서버에 연결된 뒤 다시 눌러 주세요.');
        if (!confirm(`반 ${RT.room}의 모든 학생 점수와 등록을 지울까요? 되돌릴 수 없어요.`)) return;
        for (const k of [...RT.store.keys()]) if (k !== 'meta/reset') RT.raw(k, null);
        RT.raw('meta/reset', { ts: Date.now() }); RT.store.clear(); RT.emit(); toast('반 점수를 초기화했어요.');
      };
      $$('[data-del]', sec).forEach(b => b.onclick = () => {
        const uid = b.dataset.del, s = rows.find(r => r.uid === uid);
        if (!RT.connected) return toast('실시간 서버에 연결된 뒤 다시 눌러 주세요.');
        if (!confirm(`${s ? s.name : uid} 학생의 기록을 삭제할까요?`)) return;
        for (const k of [...RT.store.keys()]) if (k === 'u/' + uid || k.startsWith('s/' + uid + '/')) { RT.raw(k, null); RT.store.delete(k); }
        RT.raw('x/' + uid, { ts: Date.now() }); RT.emit();
      });
      // 단원 카드에 내 점수 표시
      if (logged()) { const me = rows.find(s => s.uid === prof.uid); $$('a.card').forEach(a => { const m = (a.getAttribute('href') || '').match(/Unit(\d+)/); if (!m) return; let t = $('.cl-cpts', a); if (!t) { t = document.createElement('div'); t.className = 'cl-cpts pc'; a.append(t); } const u = me && me.units[m[1]]; t.textContent = u ? `🏆 내 점수 ${u.pts}점 (문제 ${u.ex} · 말하기 ${u.sp})` : ''; }); }
      RT.status();
    };
    RT.on(draw); draw();
  }

  /* ───────── 시작 ───────── */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (drawer) drawer.classList.remove('open'); if (Coach.el && !Coach.el.hidden) closeCoach(); } });
  if (IS_UNIT) mountUnitUI(); else mountIndexUI();
  const r0 = viewRoom(); if (r0) RT.setRoom(r0);
  window.EFEC = { RT, openLogin, openCoach, nrm, score, roster, profile: () => prof };
})();
