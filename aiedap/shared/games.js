/*! AIEDAP 아카이브 · 체험 게임 모듈 v1 (vanilla JS, 빌드 없음)
 *
 *  AG.games.roulette(container, {names, title, mode:'first'|'last', onPick(name), autoStart, banner})
 *  AG.games.lensQuiz(container, {onFinish({score,total,ms,answers,correct,title}), seconds, banner})
 *  AG.games.lifeGame(container, {players, onFinish({players:[{name,lv,lvName,cards}]}), maxRounds, autoStart, banner})
 *
 *  - 모두 {destroy()}를 돌려준다.
 *  - 그림은 AG.artBase(기본 '../art/')에서 불러온다. 없는 그림은 조용히 숨긴다.
 *  - names / players를 넘기면 설정 화면을 건너뛰고 바로 시작한다(autoStart:false로 끌 수 있음).
 */
(() => {
  'use strict';
  const AG = (window.AG = window.AG || {});
  const GAMES = (AG.games = AG.games || {});
  GAMES.version = '1.0';
  const art = (f) => (AG.artBase || '../art/') + f;

  /* ───────────────────────── 공통 도우미 ───────────────────────── */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const optImgs = (root) => $$(root, 'img[data-opt]').forEach((im) => {
    const kill = () => im.remove();
    im.addEventListener('error', kill, { once: true });
    if (im.complete && !im.naturalWidth) kill();
  });
  const heroHTML = (o) => `
    <div class="ag-hero ${o.cls || ''}">
      ${o.banner ? `<img class="ag-banner" data-opt src="${art(o.banner)}" alt="">` : ''}
      <div class="ag-hero-in"><img class="ag-mascot" data-opt src="${art(o.mascot)}" alt="">
        <div><div class="ag-kicker">${o.kicker}</div><h3 class="ag-disp">${o.title}</h3><p>${o.text}</p></div></div>
    </div>`;

  /* 타이머·이벤트를 한꺼번에 치우는 수명 관리자 */
  function life() {
    const ts = new Set(), is = new Set(), ls = [];
    const L = {
      dead: false,
      after(fn, ms) { const id = setTimeout(() => { ts.delete(id); if (!L.dead) fn(); }, ms); ts.add(id); return id; },
      every(fn, ms) { const id = setInterval(() => { if (!L.dead) fn(); }, ms); is.add(id); return id; },
      clear(id) { if (!id) return; clearTimeout(id); clearInterval(id); ts.delete(id); is.delete(id); },
      on(el, ev, fn, o) { el.addEventListener(ev, fn, o); ls.push([el, ev, fn, o]); },
      wait(ms) { return new Promise((res) => { L.after(res, ms); }); },
      kill() { L.dead = true; ts.forEach(clearTimeout); is.forEach(clearInterval); ts.clear(); is.clear(); ls.forEach((x) => x[0].removeEventListener(x[1], x[2], x[3])); ls.length = 0; },
    };
    return L;
  }

  /* 효과음: 첫 클릭(사용자 동작) 뒤에만 소리를 낸다 */
  const Snd = (() => {
    let ctx = null, muted = false, lastBump = 0, lastDing = 0;
    try { muted = localStorage.getItem('ag-games-muted') === '1'; } catch (e) { /* 저장소 없음 */ }
    const ensure = () => {
      if (muted) return null;
      try {
        if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      } catch (e) { return null; }
      return ctx;
    };
    const tone = (f, d, type, vol, when) => {
      if (!ctx || muted) return;
      try {
        const t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.03);
      } catch (e) { /* 소리 실패는 무시 */ }
    };
    return {
      isMuted: () => muted,
      label: () => (muted ? '🔇' : '🔊'),
      toggle() { muted = !muted; try { localStorage.setItem('ag-games-muted', muted ? '1' : '0'); } catch (e) { /* */ } if (!muted) ensure(); return muted; },
      unlock: ensure,
      play(k) {
        if (muted || !ctx) return;
        const now = performance.now();
        switch (k) {
          case 'tick': tone(660, 0.12, 'square', 0.05); break;
          case 'go': tone(990, 0.28, 'square', 0.07); break;
          case 'bump': if (now - lastBump < 80) return; lastBump = now; tone(rand(520, 900), 0.06, 'triangle', 0.035); break;
          case 'ding': if (now - lastDing < 120) return; lastDing = now; tone(1320, 0.16, 'sine', 0.06); break;
          case 'ok': tone(660, 0.1, 'sine', 0.09); tone(990, 0.16, 'sine', 0.09, 0.09); break;
          case 'no': tone(220, 0.22, 'sawtooth', 0.05); break;
          case 'dice': tone(rand(300, 520), 0.04, 'square', 0.035); break;
          case 'hop': tone(rand(680, 820), 0.05, 'sine', 0.05); break;
          case 'card': tone(523, 0.08, 'triangle', 0.07); tone(784, 0.14, 'triangle', 0.07, 0.07); break;
          case 'lvup': [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.16, 'square', 0.05, i * 0.08)); break;
          case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.09, i * 0.12)); tone(1047, 0.6, 'sine', 0.07, 0.5); break;
          default:
        }
      },
    };
  })();
  GAMES.sound = Snd;

  /* 색종이 */
  function confetti(host, ms = 2600) {
    if (!host || !host.isConnected) return;
    const cv = document.createElement('canvas'); cv.className = 'ag-confetti'; host.appendChild(cv);
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = host.clientWidth || 300, h = host.clientHeight || 300;
    cv.width = w * dpr; cv.height = h * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr);
    const cols = ['#3b6fe0', '#f08a24', '#8a5cf6', '#1f9d6b', '#e5484d', '#ffbf2e', '#ff6bc1'];
    const ps = Array.from({ length: 150 }, (_, i) => ({ x: w / 2 + rand(-60, 60), y: h * 0.38, vx: rand(-7, 7), vy: rand(-12, -3), r: rand(5, 9), a: rand(0, 6), va: rand(-0.3, 0.3), c: cols[i % cols.length] }));
    const t0 = performance.now();
    const step = (t) => {
      const e = t - t0; c.clearRect(0, 0, w, h);
      for (const p of ps) { p.vy += 0.24; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va; c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.globalAlpha = Math.max(0, 1 - e / ms); c.fillStyle = p.c; c.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); c.restore(); }
      if (e < ms && cv.isConnected) requestAnimationFrame(step); else cv.remove();
    };
    requestAnimationFrame(step);
  }

  /* ═════════════════════════ 1. 마블 룰렛 ═════════════════════════ */
  const RW = 400, RG = 900, RVMAX = 760;
  const maxY = (a) => a.reduce((b, m) => (!b || m.y > b.y ? m : b), null);
  const minY = (a) => a.reduce((b, m) => (!b || m.y < b.y ? m : b), null);

  function rlMap() {
    const segs = [], pegs = [], rots = [], labels = [];
    const S = (x1, y1, x2, y2, o = {}) => segs.push({ x1, y1, x2, y2, w: o.w || 3, e: o.e == null ? 0.3 : o.e, c: o.c || '#8fb0ff', gate: !!o.gate, lo: Math.min(y1, y2), hi: Math.max(y1, y2) });
    const P = (x, y, r, o = {}) => pegs.push({ x, y, r, e: o.e == null ? 0.45 : o.e, c: o.c || '#dfe7ff', bump: !!o.bump, hit: -9 });
    const R = (cx, cy, L, om, a0 = 0) => rots.push({ cx, cy, L, om, a0, w: 4, e: 0.35, c: '#ffbf2e', x1: 0, y1: 0, x2: 0, y2: 0 });
    const WM = (cx, cy, L, om, a0 = 0) => { R(cx, cy, L, om, a0); R(cx, cy, L, om, a0 + Math.PI / 2); };
    const B = (x, y, r) => P(x, y, r, { bump: true, e: 1.05, c: '#ff5c93' });
    const H = 3260, finishY = 3080;
    let x, y, r, k;
    S(0, -600, 0, H, { w: 4, c: '#4f66c4' }); S(RW, -600, RW, H, { w: 4, c: '#4f66c4' });
    S(0, 150, RW, 150, { gate: true, w: 4, c: '#ffbf2e' });
    labels.push([40, '🚦 출발 대기']);
    // 핀 숲
    labels.push([200, '🌲 핀 숲']);
    for (r = 0, y = 230; y <= 630; r++, y += 44) for (x = r % 2 ? 50 : 75; x <= RW - 50; x += 50) P(x, y, 5);
    // 지그재그 언덕
    labels.push([672, '⛰️ 지그재그 언덕']);
    for (k = 0, y = 690; k < 5; k++, y += 110) { if (k % 2 === 0) S(0, y, 300, y + 56); else S(RW, y, 100, y + 56); }
    // 회전 날개
    labels.push([1262, '🌀 회전 날개']);
    R(105, 1320, 150, 2.4, 0); R(295, 1320, 150, -2.4, Math.PI / 2);
    R(200, 1470, 170, 1.7, 0.3);
    R(95, 1600, 130, -2.8, 0); R(305, 1600, 130, 2.8, 1);
    R(200, 1730, 170, -1.9, 0);
    // 범퍼 광장
    labels.push([1806, '💥 범퍼 광장']);
    S(0, 1820, 160, 1930); S(RW, 1820, 240, 1930);
    B(200, 2030, 16); B(110, 2100, 16); B(290, 2100, 16); B(200, 2180, 13); B(50, 2190, 11); B(350, 2190, 11);
    // 풍차 마을
    labels.push([2252, '🌬️ 풍차 마을']);
    WM(110, 2320, 120, 1.8); WM(290, 2320, 120, -1.8, 0.4);
    S(0, 2400, 46, 2430); S(RW, 2400, 354, 2430);
    WM(200, 2480, 150, 1.4, 0.4);
    S(0, 2565, 60, 2605); S(RW, 2565, 340, 2605);
    // 마지막 질주
    labels.push([2652, '🏁 마지막 질주']);
    for (r = 0, y = 2680; y <= 2880; r++, y += 50) for (x = r % 2 ? 95 : 60; x <= RW - 55; x += 70) { if (r === 2 && (x === 130 || x === 270)) B(x, y, 10); else P(x, y, r % 2 ? 6 : 8); }
    S(0, 2930, 150, 3010); S(RW, 2930, 250, 3010);
    return { H, finishY, segs, pegs, rots, labels };
  }

  function rlSpawn(names) {
    const n = names.length, r = n <= 12 ? 10 : n <= 24 ? 8.5 : 7, gap = r * 2 + 5, per = Math.floor((RW - 40) / gap);
    return shuffle(names.map((nm, i) => ({ nm, i }))).map((o, k) => {
      const hue = Math.round((o.i * 137.508 + 8) % 360), row = Math.floor(k / per), col = k % per, y = 150 - 4 - r - row * gap;
      return { name: o.nm, short: o.nm.length > 6 ? o.nm.slice(0, 6) + '…' : o.nm, col: `hsl(${hue},85%,60%)`, colD: `hsl(${hue},75%,38%)`, r, x: 20 + r + col * gap + rand(-2, 2), y, vx: rand(-15, 15), vy: 0, fin: 0, best: y, st: 0, nud: 0 };
    });
  }

  function rlResolve(m, nx, ny, e, svx, svy, h) {
    const rvx = m.vx - svx, rvy = m.vy - svy, vn = rvx * nx + rvy * ny;
    if (vn >= 0) return vn;
    const tx = -ny, ty = nx;
    const vt = (rvx * tx + rvy * ty) * (1 - 0.4 * h);
    const out = -vn * e;
    m.vx = svx + nx * out + tx * vt; m.vy = svy + ny * out + ty * vt;
    return vn;
  }

  function rlSeg(m, ax, ay, bx, by, hw, e, rot, h) {
    const abx = bx - ax, aby = by - ay, l2 = abx * abx + aby * aby;
    let t = l2 > 0 ? ((m.x - ax) * abx + (m.y - ay) * aby) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const cx = ax + abx * t, cy = ay + aby * t, dx = m.x - cx, dy = m.y - cy, rr = m.r + hw, d2 = dx * dx + dy * dy;
    if (d2 >= rr * rr) return;
    let nx, ny;
    if (d2 < 1e-8) { const l = Math.sqrt(l2) || 1; nx = aby / l; ny = -abx / l; if (ny > 0) { nx = -nx; ny = -ny; } }
    else { const d = Math.sqrt(d2); nx = dx / d; ny = dy / d; }
    m.x = cx + nx * rr; m.y = cy + ny * rr;
    let svx = 0, svy = 0;
    if (rot) { svx = -rot.om * (cy - rot.cy); svy = rot.om * (cx - rot.cx); }
    rlResolve(m, nx, ny, e, svx, svy, h);
  }

  function rlFinish(R, m) {
    m.fin = ++R.finN; R.finished.push(m);
    const k = m.fin - 1, per = Math.max(1, Math.floor((RW - 30) / (m.r * 2 + 6)));
    m.x = 15 + m.r + (k % per) * (m.r * 2 + 6); m.y = R.map.finishY + 46 + Math.floor(k / per) * (m.r * 2 + 10); m.vx = m.vy = 0;
  }

  function rlStep(R, dt) {
    const map = R.map, ms = R.ms, n = ms.length, sub = clamp(Math.ceil(dt / 0.0022), 2, 24), h = dt / sub;
    const segs = map.segs, pegs = map.pegs, rots = map.rots;
    for (let s = 0; s < sub; s++) {
      R.t += h;
      for (const o of rots) { const a = o.a0 + o.om * R.t, hx = Math.cos(a) * o.L / 2, hy = Math.sin(a) * o.L / 2; o.x1 = o.cx - hx; o.y1 = o.cy - hy; o.x2 = o.cx + hx; o.y2 = o.cy + hy; }
      for (let i = 0; i < n; i++) {
        const m = ms[i]; if (m.fin) continue;
        m.vy += RG * h;
        const sp = m.vx * m.vx + m.vy * m.vy;
        if (sp > RVMAX * RVMAX) { const q = RVMAX / Math.sqrt(sp); m.vx *= q; m.vy *= q; }
        m.x += m.vx * h; m.y += m.vy * h;
      }
      for (let i = 0; i < n; i++) {
        const a = ms[i]; if (a.fin) continue;
        for (let j = i + 1; j < n; j++) {
          const b = ms[j]; if (b.fin) continue;
          const dx = b.x - a.x, dy = b.y - a.y, rr = a.r + b.r;
          if (dx > rr || dx < -rr || dy > rr || dy < -rr) continue;
          const d2 = dx * dx + dy * dy; if (d2 >= rr * rr) continue;
          let d = Math.sqrt(d2), nx, ny;
          if (d < 1e-6) { nx = Math.random() < 0.5 ? 1 : -1; ny = 0; d = 0; } else { nx = dx / d; ny = dy / d; }
          const ov = (rr - d) / 2;
          a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) { const jj = -0.8 * rv; a.vx -= jj * nx; a.vy -= jj * ny; b.vx += jj * nx; b.vy += jj * ny; }
        }
      }
      for (let i = 0; i < n; i++) {
        const m = ms[i]; if (m.fin) continue;
        for (const o of segs) { if (m.y + m.r + o.w < o.lo || m.y - m.r - o.w > o.hi) continue; rlSeg(m, o.x1, o.y1, o.x2, o.y2, o.w, o.e, null, h); }
        for (const o of rots) { const ext = o.L / 2 + m.r + o.w; if (Math.abs(m.y - o.cy) > ext || Math.abs(m.x - o.cx) > ext) continue; rlSeg(m, o.x1, o.y1, o.x2, o.y2, o.w, o.e, o, h); }
        for (const o of pegs) {
          const dx = m.x - o.x, dy = m.y - o.y, rr = m.r + o.r;
          if (dx > rr || dx < -rr || dy > rr || dy < -rr) continue;
          const d2 = dx * dx + dy * dy; if (d2 >= rr * rr || d2 < 1e-8) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
          m.x = o.x + nx * rr; m.y = o.y + ny * rr;
          rlResolve(m, nx, ny, o.e, 0, 0, h);
          if (o.bump) {
            const vo = m.vx * nx + m.vy * ny;
            if (vo < 300) { m.vx += (300 - vo) * nx; m.vy += (300 - vo) * ny; }
            if (R.t - o.hit > 0.12) { o.hit = R.t; R.bumps++; }
          }
        }
        if (m.y > map.finishY) rlFinish(R, m);
      }
    }
  }

  GAMES._rl = { map: rlMap, spawn: rlSpawn, step: rlStep }; // 시뮬레이션 점검용

  GAMES.roulette = function (container, opts = {}) {
    const L = life();
    const root = document.createElement('div'); root.className = 'ag ag-rl'; container.appendChild(root);
    let mode = opts.mode === 'last' ? 'last' : 'first';
    let namesText = (opts.names || []).join('\n');
    let R = null, raf = 0, ro = null, stage = null, cv = null, ctx = null, bg = null;
    const V = { cw: 0, ch: 0, dpr: 1, s: 1, ox: 0, viewH: 400 };

    const parseNames = (txt) => {
      const out = [];
      String(txt || '').split(/[\n,]+/).forEach((s) => {
        s = s.trim(); if (!s) return;
        let k = 1; const m = s.match(/^(.+?)\s*\*\s*(\d+)$/);
        if (m) { s = m[1].trim(); k = clamp(parseInt(m[2], 10) || 1, 1, 10); }
        for (let i = 0; i < k && out.length < 40; i++) out.push(s.slice(0, 24));
      });
      return out;
    };

    function stopRace() {
      if (raf) cancelAnimationFrame(raf); raf = 0;
      R = null;
      if (ro) { ro.disconnect(); ro = null; }
      try { if (document.fullscreenElement && root.contains(document.fullscreenElement)) document.exitFullscreen().catch(() => {}); } catch (e) { /* */ }
    }

    function setup() {
      stopRace();
      root.innerHTML = `
        ${heroHTML({ cls: 'ag-hero-rl', banner: opts.banner ? 'game_roulette.webp' : '', mascot: 'redi_wave.webp', kicker: '🎱 MARBLE ROULETTE', title: esc(opts.title || '마블 룰렛'), text: '이름을 넣고 START! 구슬들이 핀 숲·회전 날개·범퍼를 지나 결승선까지 달려요.' })}
        <div class="ag-panel ag-rl-setup">
          <div class="ag-lab">참가자 <b class="ag-cnt">0</b>명 <span>줄바꿈·쉼표로 구분 · <code>이름*2</code>는 구슬 2개 · 최대 40개</span></div>
          <textarea class="ag-names" rows="6" placeholder="예)&#10;1모둠&#10;2모둠&#10;3모둠">${esc(namesText)}</textarea>
          <div class="ag-quick">
            <button type="button" data-q="g11">1~11모둠</button><button type="button" data-q="n4">1~4번</button><button type="button" data-q="n6">1~6번</button><button type="button" data-q="n8">1~8번</button><button type="button" data-q="mix">🔀 섞기</button><button type="button" data-q="clr">지우기</button>
          </div>
          <div class="ag-row">
            <div class="ag-seg" role="group" aria-label="당첨 방식"><button type="button" data-m="first">🥇 1등 당첨</button><button type="button" data-m="last">🐢 꼴등 당첨</button></div>
            <span class="ag-sp"></span>
            <button type="button" class="ag-btn ag-big ag-go">START ▶</button>
          </div>
          <p class="ag-warn" hidden></p>
        </div>`;
      optImgs(root);
      const ta = $(root, '.ag-names'), cnt = $(root, '.ag-cnt'), warn = $(root, '.ag-warn');
      const upd = () => { namesText = ta.value; cnt.textContent = parseNames(ta.value).length; warn.hidden = true; };
      ta.addEventListener('input', upd); upd();
      const seq = (n, suf) => Array.from({ length: n }, (_, i) => `${i + 1}${suf}`).join('\n');
      $$(root, '[data-q]').forEach((b) => b.addEventListener('click', () => {
        const q = b.dataset.q;
        if (q === 'g11') ta.value = seq(11, '모둠');
        else if (q === 'clr') ta.value = '';
        else if (q === 'mix') ta.value = shuffle(ta.value.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean)).join('\n');
        else ta.value = seq(+q.slice(1), '번');
        upd();
      }));
      const segBtns = $$(root, '[data-m]');
      const syncSeg = () => segBtns.forEach((b) => b.classList.toggle('on', b.dataset.m === mode));
      segBtns.forEach((b) => b.addEventListener('click', () => { mode = b.dataset.m; syncSeg(); }));
      syncSeg();
      $(root, '.ag-go').addEventListener('click', () => {
        const names = parseNames(ta.value);
        if (names.length < 2) { warn.hidden = false; warn.textContent = '이름을 2개 이상 넣어 주세요.'; ta.focus(); return; }
        Snd.unlock(); startRace(names);
      });
    }

    function startRace(names) {
      stopRace();
      V.cw = 0;
      root.innerHTML = `
        <div class="ag-rl-stage">
          <canvas class="ag-rl-cv" aria-label="마블 룰렛 경주"></canvas>
          <div class="ag-rl-bar">
            <span class="ag-pill">${mode === 'first' ? '🥇 1등 당첨' : '🐢 꼴등 당첨'}</span>
            <span class="ag-pill ag-rl-left"></span>
            <span class="ag-pill ag-rl-fast" hidden>⏩ 가속!</span>
            <span class="ag-sp"></span>
            <button type="button" class="ag-ic" data-a="snd" title="소리 켜기/끄기">${Snd.label()}</button>
            <button type="button" class="ag-ic" data-a="fs" title="전체 화면">⛶</button>
            <button type="button" class="ag-ic ag-wide" data-a="back" title="이름·방식 바꾸기">✎ 설정</button>
          </div>
          <ol class="ag-rl-rank"></ol>
          <div class="ag-rl-cd"></div>
          <div class="ag-rl-res" hidden></div>
        </div>
        <div class="ag-rl-cap">${opts.title ? '🎯 ' + esc(opts.title) + ' · ' : ''}구슬 ${names.length}개 · ${mode === 'first' ? '가장 먼저 결승선에 닿는 구슬이 당첨!' : '마지막까지 남는 구슬이 당첨!'}</div>`;
      stage = $(root, '.ag-rl-stage'); cv = $(root, '.ag-rl-cv'); ctx = cv.getContext('2d');
      $(root, '[data-a="snd"]').addEventListener('click', (e) => { Snd.toggle(); e.currentTarget.textContent = Snd.label(); });
      $(root, '[data-a="fs"]').addEventListener('click', toggleFs);
      $(root, '[data-a="back"]').addEventListener('click', setup);
      if (window.ResizeObserver) { ro = new ResizeObserver(() => resize()); ro.observe(stage); }
      resize();
      const r = { names: names.slice(), map: rlMap(), t: 0, phase: 'count', finished: [], finN: 0, winner: null, camY: -30, ts: 1, runT: 0, last: performance.now(), hudAt: 0, bumps: 0, bumpsSeen: 0, finSeen: 0, fast: false, focus: null, forced: false };
      r.ms = rlSpawn(names);
      R = r;
      countdown(r);
      raf = requestAnimationFrame(frame);
    }

    function countdown(r) {
      const cd = $(root, '.ag-rl-cd');
      const show = (t, s) => { cd.textContent = t; cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop'); Snd.play(s); };
      show('3', 'tick');
      L.after(() => { if (R === r) show('2', 'tick'); }, 800);
      L.after(() => { if (R === r) show('1', 'tick'); }, 1600);
      L.after(() => { if (R !== r) return; show('GO!', 'go'); r.phase = 'run'; r.map.segs = r.map.segs.filter((s) => !s.gate); }, 2400);
      L.after(() => { if (R === r) cd.textContent = ''; }, 3200);
    }

    function resize() {
      if (!stage || !cv) return;
      const cw = stage.clientWidth, ch = stage.clientHeight;
      if (!cw || !ch) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cw === V.cw && ch === V.ch && dpr === V.dpr) return;
      cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
      const s = Math.min((cw - 12) / RW, ch / 540);
      Object.assign(V, { cw, ch, dpr, s, ox: (cw - RW * s) / 2, viewH: ch / s });
      bg = ctx.createLinearGradient(0, 0, 0, ch); bg.addColorStop(0, '#111c4e'); bg.addColorStop(1, '#1f1347');
      if (R) draw(R);
    }

    function toggleFs() {
      try {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
        else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
      } catch (e) { /* 전체 화면 미지원 */ }
    }

    function frame(now) {
      raf = 0;
      if (L.dead || !R) return;
      const r = R, dtr = Math.min(0.05, Math.max(0, (now - r.last) / 1000));
      r.last = now;
      let act = r.ms.filter((m) => !m.fin);
      let ts = 1;
      if (r.phase === 'run') {
        r.runT += dtr;
        if (!r.winner) {
          if (mode === 'first') { const ld = maxY(act); if (ld && r.map.finishY - ld.y < 230) ts = 0.38; }
          else if (act.length === 2 && r.map.finishY - Math.max(act[0].y, act[1].y) < 200) ts = 0.38;
          if (ts === 1 && r.runT > 38) { ts = 1.8; r.fast = true; }
          if (r.runT > 75 && act.length) { r.forced = true; declare(r, mode === 'first' ? maxY(act) : minY(act)); }
        }
      }
      r.ts += (ts - r.ts) * Math.min(1, dtr * 6);
      const dts = dtr * r.ts;
      if (dts > 0) rlStep(r, dts);
      if (r.phase === 'run') unstick(r, dts);
      act = r.ms.filter((m) => !m.fin);
      if (r.phase === 'run' && !r.winner) {
        if (mode === 'first' && r.finished.length) declare(r, r.finished[0]);
        else if (mode === 'last') { if (act.length === 1) declare(r, act[0]); else if (!act.length) declare(r, r.finished[r.finished.length - 1]); }
      }
      if (r.bumps !== r.bumpsSeen) { r.bumpsSeen = r.bumps; Snd.play('bump'); }
      if (r.finished.length !== r.finSeen) { r.finSeen = r.finished.length; Snd.play('ding'); }
      camera(r, act, dtr); draw(r); hud(r, act, now);
      if (R === r && !L.dead) raf = requestAnimationFrame(frame);
    }

    function unstick(r, dt) {
      if (dt <= 0) return;
      for (const m of r.ms) {
        if (m.fin) continue;
        if (m.y > m.best + 6) { m.best = m.y; m.st = 0; m.nud = 0; continue; }
        m.st += dt;
        if (m.st > 2.2) {
          m.st = 1; m.nud++;
          if (m.nud >= 4) { m.y += 34; m.x = clamp(m.x + rand(-50, 50), 24, RW - 24); m.vx = 0; m.vy = 80; m.nud = 0; m.best = m.y; m.st = 0; }
          else { m.vx += rand(-1, 1) * 260; m.vy -= rand(120, 230); }
        }
      }
    }

    function declare(r, m) {
      if (r.winner || !m) return;
      r.winner = m; r.phase = 'end';
      try { if (typeof opts.onPick === 'function') opts.onPick(m.name); } catch (e) { console.warn('[AG.roulette] onPick', e); }
      L.after(() => { if (R === r) showResult(r); }, r.forced ? 500 : 1400);
    }

    function camera(r, act, dtr) {
      let target;
      if (r.phase === 'count') target = -30;
      else {
        let f = r.winner;
        if (!f) f = mode === 'first' ? maxY(act) : (r.finished.length >= Math.ceil(r.ms.length / 2) || act.length <= 2 ? minY(act) : maxY(act));
        r.focus = f;
        target = f ? f.y - V.viewH * 0.45 : r.camY;
      }
      target = clamp(target, -60, r.map.H - V.viewH + 10);
      r.camY += (target - r.camY) * Math.min(1, dtr * 3.2);
    }

    function draw(r) {
      if (!ctx || !V.cw) return;
      const c = ctx, { s, ox, dpr, cw, ch } = V, map = r.map, y0 = r.camY - 40, y1 = r.camY + V.viewH + 40;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.fillStyle = bg; c.fillRect(0, 0, cw, ch);
      c.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, -dpr * s * r.camY);
      c.fillStyle = 'rgba(130,160,255,0.075)'; c.fillRect(0, y0, RW, y1 - y0);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = `${15 / s}px Jua, "Noto Sans KR", sans-serif`;
      c.fillStyle = 'rgba(255,255,255,0.30)';
      for (const l of map.labels) if (l[0] > y0 && l[0] < y1) c.fillText(l[1], RW / 2, l[0]);
      const fy = map.finishY;
      if (fy + 40 > y0 && fy - 40 < y1) {
        const sq = 10;
        for (let x = 0, k = 0; x < RW; x += sq, k++) { c.fillStyle = k % 2 ? '#ffffff' : '#1a2240'; c.fillRect(x, fy - sq, sq, sq); c.fillStyle = k % 2 ? '#1a2240' : '#ffffff'; c.fillRect(x, fy, sq, sq); }
        c.fillStyle = '#ffbf2e'; c.font = `${17 / s}px Jua, "Noto Sans KR", sans-serif`; c.fillText('FINISH', RW / 2, fy - 26);
      }
      c.lineCap = 'round';
      for (const o of map.segs) { if (o.hi < y0 || o.lo > y1) continue; c.strokeStyle = o.c; c.lineWidth = o.w * 2; c.beginPath(); c.moveTo(o.x1, o.y1); c.lineTo(o.x2, o.y2); c.stroke(); }
      for (const o of map.rots) {
        if (o.cy + o.L / 2 < y0 || o.cy - o.L / 2 > y1) continue;
        c.beginPath(); c.moveTo(o.x1, o.y1); c.lineTo(o.x2, o.y2);
        c.strokeStyle = 'rgba(255,191,46,0.28)'; c.lineWidth = o.w * 2 + 7; c.stroke();
        c.strokeStyle = o.c; c.lineWidth = o.w * 2; c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(o.cx, o.cy, 3.2, 0, 6.3); c.fill();
      }
      for (const o of map.pegs) {
        if (o.y + o.r < y0 || o.y - o.r > y1) continue;
        c.beginPath(); c.arc(o.x, o.y, o.r, 0, 6.3);
        if (o.bump) {
          const fl = Math.max(0, 1 - (r.t - o.hit) / 0.25);
          c.fillStyle = fl > 0 ? '#ffffff' : o.c; c.fill(); c.lineWidth = 3; c.strokeStyle = '#ffd1e1'; c.stroke();
          if (fl > 0) { c.beginPath(); c.arc(o.x, o.y, o.r + 8 * fl + 2, 0, 6.3); c.strokeStyle = `rgba(255,92,147,${fl})`; c.lineWidth = 2.5; c.stroke(); }
        } else { c.fillStyle = o.c; c.fill(); }
      }
      const fs = 11.5 / s, nameFont = `700 ${fs}px "Noto Sans KR", sans-serif`;
      c.font = nameFont; c.lineJoin = 'round';
      for (const m of r.ms) {
        if (m.y + m.r + 24 < y0 || m.y - m.r - 24 > y1) continue;
        const g = c.createRadialGradient(m.x - m.r * 0.35, m.y - m.r * 0.4, m.r * 0.1, m.x, m.y, m.r);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, m.col); g.addColorStop(1, m.col);
        c.beginPath(); c.arc(m.x, m.y, m.r, 0, 6.3); c.fillStyle = g; c.fill();
        c.lineWidth = 1 / s; c.strokeStyle = 'rgba(0,0,0,.35)'; c.stroke();
        if (m === r.focus || m === r.winner) {
          c.beginPath(); c.arc(m.x, m.y, m.r + (4 + Math.sin(r.t * 8) * 1.5) / s, 0, 6.3);
          c.strokeStyle = m === r.winner ? '#ffbf2e' : '#ffffff'; c.lineWidth = 2.4 / s; c.stroke();
        }
        if (m.fin) {
          c.fillStyle = '#1a2240'; c.font = `800 ${m.r}px "Noto Sans KR", sans-serif`; c.fillText(String(m.fin), m.x, m.y + 0.5); c.font = nameFont;
        } else {
          const ty = m.y - m.r - fs * 0.8;
          c.lineWidth = 3.2 / s; c.strokeStyle = 'rgba(8,12,40,.9)'; c.strokeText(m.short, m.x, ty);
          c.fillStyle = '#ffffff'; c.fillText(m.short, m.x, ty);
        }
      }
      // 미니맵
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const wide = ox >= 64, mw = wide ? 22 : 6, mx = wide ? cw - ox / 2 - 11 : cw - 9, my = 60, mh = ch - 80, k = mh / map.H;
      c.fillStyle = 'rgba(255,255,255,0.10)'; c.fillRect(mx, my, mw, mh);
      c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(mx, my + Math.max(0, r.camY) * k, mw, V.viewH * k);
      c.fillStyle = '#ffbf2e'; c.fillRect(mx - 3, my + map.finishY * k, mw + 6, 2);
      for (const m of r.ms) { c.fillStyle = m.col; c.beginPath(); c.arc(mx + (wide ? (m.x / RW) * mw : mw / 2), my + clamp(m.y, 0, map.H) * k, wide ? 2.6 : 2.2, 0, 6.3); c.fill(); }
    }

    function hud(r, act, now) {
      if (now - r.hudAt < 200) return;
      r.hudAt = now;
      const rank = $(root, '.ag-rl-rank'); if (!rank) return;
      const order = r.finished.concat(act.slice().sort((a, b) => b.y - a.y)), n = order.length, max = V.cw < 640 ? 3 : 12;
      rank.hidden = r.phase === 'count';
      let a = 0, b = Math.min(n, max), html = '';
      if (mode === 'last' && n > max) { a = n - max; b = n; html += `<li class="ag-more">🏁 ${a}명 먼저 통과</li>`; }
      for (let i = a; i < b; i++) {
        const m = order[i];
        const cls = [m.fin ? 'fin' : '', m === r.winner ? 'win' : '', !m.fin && m === r.focus ? 'lead' : ''].join(' ').trim();
        html += `<li class="${cls}"><b>${i + 1}</b><i style="background:${m.col}"></i><span>${esc(m.name)}</span>${m.fin ? '<em>🏁</em>' : ''}${mode === 'last' && i === n - 1 && !m.fin ? '<em>🐢</em>' : ''}</li>`;
      }
      if (mode === 'first' && n > max) html += `<li class="ag-more">… 외 ${n - max}명</li>`;
      rank.innerHTML = html;
      const left = $(root, '.ag-rl-left'); if (left) left.textContent = `🏁 ${r.finished.length}/${n} · ⏱ ${Math.floor(r.runT)}초`;
      const mood = $(root, '.ag-rl-fast');
      if (mood) {
        const slow = !r.winner && r.phase === 'run' && r.ts < 0.7, fast = r.fast && r.ts > 1.3;
        mood.hidden = !(slow || fast);
        mood.textContent = slow ? '🎬 슬로 모션' : '⏩ 가속!';
      }
    }

    function showResult(r) {
      const w = r.winner, box = $(root, '.ag-rl-res'); if (!box || !w) return;
      const left = r.names.slice(), wi = left.indexOf(w.name); if (wi >= 0) left.splice(wi, 1);
      box.hidden = false;
      box.innerHTML = `<div class="ag-rl-card">
          <img class="ag-mascot" data-opt src="${art('redi_thumbs.webp')}" alt="">
          <div class="ag-kicker">${mode === 'first' ? '🥇 가장 먼저 도착!' : '🐢 마지막까지 남은 구슬!'}${r.forced ? ' · 시간 종료 판정' : ''}</div>
          <div class="ag-rl-win" style="--c:${w.colD}">${esc(w.name)}</div>
          <p class="ag-rl-sub">${opts.title ? esc(opts.title) + ' · ' : ''}축하해요! 🎉</p>
          <div class="ag-rl-acts">
            <button type="button" class="ag-btn" data-a="again">🔁 다시 굴리기</button>
            <button type="button" class="ag-btn ag-ghost" data-a="minus" ${left.length < 2 ? 'disabled' : ''}>➖ 당첨자 빼고 다시</button>
            <button type="button" class="ag-btn ag-ghost" data-a="edit">✏️ 이름 바꾸기</button>
          </div>
        </div>`;
      optImgs(box);
      $(box, '[data-a="again"]').addEventListener('click', () => startRace(r.names));
      $(box, '[data-a="minus"]').addEventListener('click', () => { namesText = left.join('\n'); startRace(left); });
      $(box, '[data-a="edit"]').addEventListener('click', setup);
      confetti(stage, 2800); Snd.play('win');
    }

    const initial = parseNames(namesText);
    const auto = opts.autoStart != null ? !!opts.autoStart : initial.length >= 2;
    if (auto && initial.length >= 2) { Snd.unlock(); startRace(initial); } else setup();

    return {
      destroy() { stopRace(); L.kill(); root.remove(); },
      start(names) { const n = names ? parseNames(names.join('\n')) : parseNames(namesText); if (n.length >= 2) startRace(n); },
    };
  };

  /* ═════════════════════════ 2. 렌즈 맞히기 ═════════════════════════ */
  const LENS = [
    { k: '교육적', q: '학습목표와 관련있는가?', ico: '🎯' },
    { k: '학습자', q: '학생이 스스로 생각하고 선택하였는가?', ico: '🙋' },
    { k: '기술적', q: '해당 생성형 AI의 활용이 적절하였는가?', ico: '🛠️' },
    { k: '평가', q: '학습의 증거를 충분히 확인하였는가?', ico: '📊' },
    { k: '윤리적', q: '책임 있는 창작이 이루어졌는가?', ico: '🛡️' },
    { k: '실행', q: '실제 교실에서 실행 가능한가?', ico: '🏫' },
  ];
  GAMES.LENSES = LENS;
  const LQ = [
    { ico: '📚', a: 0, also: 3, s: 'AI로 만든 생물 그림책이 정말 화려해요. 그런데 이번 차시 목표인 ‘생물의 특징을 관찰해 설명하기’는 책 어디에도 드러나지 않아요.', why: '결과물이 멋져도 학습목표와 이어지지 않으면 AI 활동이 목적이 되어 버려요. 산출물 안에 성취기준이 드러나는지 먼저 점검해요.' },
    { ico: '🎵', a: 0, also: null, s: '노래 생성 AI로 ‘우리 동네 생물 노래’를 만들기 전에, 가사 쓰기가 국어 성취기준 ‘대상의 특징을 살려 표현하기’와 어떻게 이어지는지 설계표에 적어 두었어요.', why: 'AI 도구보다 성취기준이 먼저! 활동과 목표의 연결을 설계 단계에서 확인하는 것이 교육적 렌즈예요.' },
    { ico: '📋', a: 1, also: 3, s: '학생들이 주제만 입력하자 AI가 이야기 전체를 써 줬고, 학생들은 그대로 복사해서 발표했어요.', why: '생각하고 고르는 일을 AI가 대신했어요. 학생이 아이디어를 내고, 결과를 고르고, 고쳐 쓰는 단계가 있어야 해요.' },
    { ico: '🖼️', a: 1, also: null, s: 'AI가 그린 그림 세 장 중 하나를 학생이 직접 고르고, 왜 골랐는지와 무엇을 고쳐 달라고 다시 요청할지 스스로 정하게 했어요.', why: '선택의 이유와 수정 방향을 학생이 정하니 주도권이 학생에게 있어요. 학습자 렌즈의 좋은 예예요.' },
    { ico: '⏳', a: 2, also: 5, s: '관찰 기록만 하면 되는 활동인데 영상 생성 AI까지 쓰다 보니, 한 차시가 영상 만들어지기를 기다리다 끝났어요.', why: '목적에 비해 과한 도구를 골랐어요. 이 활동에 꼭 필요한 AI 기능이 무엇인지 따져 보는 것이 기술적 렌즈예요.' },
    { ico: '🎨', a: 2, also: null, s: '장면을 그림으로 표현하는 활동인데 글만 쓰는 챗봇을 쓰다 보니 학생들이 답답해했어요. 이미지 생성 도구로 바꾸자 활동이 살아났어요.', why: '활동 목적에 맞는 AI 도구를 골랐는지가 핵심이에요. 도구의 기능과 활동의 결이 맞아야 해요.' },
    { ico: '🧾', a: 3, also: 0, s: '수업이 끝나고 남은 건 AI가 만든 멋진 포스터뿐. 학생이 무엇을 배웠는지 보여 줄 기록은 하나도 없었어요.', why: '결과물만으로는 학습을 확인하기 어려워요. 과정 기록, 성찰, 루브릭처럼 학습의 증거를 남길 장치가 필요해요.' },
    { ico: '📝', a: 3, also: 1, s: '프롬프트를 어떻게 바꿔 갔는지 ‘수정 기록지’에 남기게 하고, 그 과정을 루브릭으로 평가했어요.', why: '수정 과정 자체를 학습의 증거로 삼았어요. 평가 렌즈가 잘 작동한 사례예요.' },
    { ico: '©️', a: 4, also: null, s: '유명 만화 캐릭터 이름을 넣어 그림을 만들고, AI 사용 표시 없이 학교 누리집에 올렸어요.', why: '저작권과 AI 사용 표시는 책임 있는 창작의 기본이에요. 공개 전에 출처와 AI 활용 여부를 밝혀요.' },
    { ico: '🙅', a: 4, also: null, s: '친구 얼굴 사진을 AI에 넣어 우스꽝스러운 그림을 만들려는 학생이 있었어요. 그래서 초상권·개인정보 약속을 함께 정했어요.', why: '다른 사람의 얼굴과 정보는 동의 없이 쓰지 않아요. 창작 전에 윤리 약속을 세우는 것이 윤리적 렌즈예요.' },
    { ico: '📶', a: 5, also: 2, s: '계획은 완벽했는데, 학생 25명이 동시에 접속하자 와이파이가 끊기고 로그인에만 20분을 썼어요.', why: '교실의 네트워크, 계정, 시간 여건을 미리 확인해야 해요. 실제 교실에서 돌아가는지가 실행 렌즈예요.' },
    { ico: '🗂️', a: 5, also: 2, s: '회원가입이 필요 없는 도구를 고르고, 접속이 안 될 때를 대비해 종이 활동지도 함께 준비했어요.', why: '플랜 B까지 준비한 계획은 어떤 교실에서도 실행할 수 있어요. 실행 렌즈의 모범 사례예요.' },
  ];

  GAMES.lensQuiz = function (container, opts = {}) {
    const L = life();
    const root = document.createElement('div'); root.className = 'ag ag-lq'; container.appendChild(root);
    const LIM = opts.seconds || 15;
    let S = null, tick = 0;

    function intro() {
      L.clear(tick); S = null;
      root.innerHTML = `
        ${heroHTML({ cls: 'ag-hero-lq', banner: opts.banner ? 'game_lens.webp' : '', mascot: 'redi_magnifier.webp', kicker: '🔍 LENS DETECTIVE', title: '렌즈 맞히기', text: `교실 장면 ${LQ.length}개를 읽고 <b>가장 먼저 꺼내야 할 렌즈</b>를 ${LIM}초 안에 골라요. 빠를수록, 연속으로 맞힐수록 보너스!` })}
        <div class="ag-lq-lenses">${LENS.map((l, i) => `<div class="ag-lq-lens" style="--c:var(--ag-l${i + 1})"><b>${l.ico} ${l.k}</b><span>${l.q}</span></div>`).join('')}</div>
        <div class="ag-row"><span class="ag-hint">⌨️ 키보드 1~6으로도 고를 수 있어요</span><span class="ag-sp"></span><button type="button" class="ag-btn ag-big" data-a="go">도전 시작 ▶</button></div>`;
      optImgs(root);
      $(root, '[data-a="go"]').addEventListener('click', () => { Snd.unlock(); begin(); });
    }

    function begin() {
      S = { qs: shuffle(LQ), i: 0, ok: 0, pts: 0, streak: 0, best: 0, answers: [], t0: performance.now(), qt: 0, locked: false };
      ask();
    }

    function ask() {
      const q = S.qs[S.i];
      S.locked = false; S.qt = performance.now();
      root.innerHTML = `
        <div class="ag-lq-top">
          <span class="ag-pill">🔍 ${S.i + 1} / ${S.qs.length}</span>
          <span class="ag-pill ag-lq-pts">⭐ ${S.pts}점</span>
          <span class="ag-pill ag-lq-stk" ${S.streak >= 2 ? '' : 'hidden'}>🔥 ${S.streak}연속</span>
          <span class="ag-sp"></span><span class="ag-pill ag-lq-sec">⏱ ${LIM}초</span>
        </div>
        <div class="ag-lq-timer"><i></i></div>
        <div class="ag-panel ag-lq-scene">
          <div class="ag-lq-ico">${q.ico}</div>
          <div><div class="ag-kicker">교실 장면</div><p>${esc(q.s)}</p><div class="ag-lq-ask">이 장면에서 <b>가장 먼저</b> 꺼내야 할 렌즈는?</div></div>
        </div>
        <div class="ag-lq-opts">${LENS.map((l, i) => `<button type="button" class="ag-lq-opt" data-i="${i}" style="--c:var(--ag-l${i + 1})"><span class="ag-lq-k"><em>${i + 1}</em>${l.ico} ${l.k}</span><small>${l.q}</small></button>`).join('')}</div>
        <div class="ag-lq-fb" hidden></div>`;
      $$(root, '.ag-lq-opt').forEach((b) => b.addEventListener('click', () => answer(+b.dataset.i)));
      const bar = $(root, '.ag-lq-timer i'), sec = $(root, '.ag-lq-sec');
      L.clear(tick);
      tick = L.every(() => {
        if (!S || S.locked) return;
        const left = Math.max(0, LIM - (performance.now() - S.qt) / 1000);
        bar.style.transform = `scaleX(${left / LIM})`;
        bar.classList.toggle('hot', left < 5);
        sec.textContent = `⏱ ${Math.ceil(left)}초`;
        if (left <= 0) answer(-1);
      }, 100);
    }

    function answer(i) {
      if (!S || S.locked) return;
      S.locked = true; L.clear(tick);
      const q = S.qs[S.i], ms = Math.round(performance.now() - S.qt), ok = i === q.a;
      let gain = 0;
      if (ok) {
        S.ok++; S.streak++; S.best = Math.max(S.best, S.streak);
        gain = 100 + Math.round((50 * Math.max(0, LIM - ms / 1000)) / LIM) + Math.min(60, (S.streak - 1) * 20);
        S.pts += gain; Snd.play('ok');
      } else { S.streak = 0; Snd.play('no'); }
      S.answers.push({ q: q.s, pick: i >= 0 ? LENS[i].k : '(시간 초과)', answer: LENS[q.a].k, correct: ok, ok, ms, gain });
      $$(root, '.ag-lq-opt').forEach((b, k) => { b.disabled = true; b.classList.add(k === q.a ? 'ok' : k === i ? 'bad' : 'dim'); });
      const pts = $(root, '.ag-lq-pts'); if (pts) pts.textContent = `⭐ ${S.pts}점`;
      const stk = $(root, '.ag-lq-stk'); if (stk) { stk.hidden = S.streak < 2; stk.textContent = `🔥 ${S.streak}연속`; }
      const fb = $(root, '.ag-lq-fb'), last = S.i + 1 >= S.qs.length, A = LENS[q.a];
      fb.hidden = false; fb.className = 'ag-lq-fb ' + (ok ? 'ok' : 'bad');
      fb.innerHTML = `
        <div class="ag-lq-fbh">${ok ? `🎉 정답! <b>+${gain}</b>` : i < 0 ? '⏰ 시간 초과!' : '🤔 아쉬워요!'}
          <span>정답 · <b style="color:var(--ag-l${q.a + 1})">${A.ico} ${A.k} 렌즈</b></span></div>
        <div class="ag-lq-std">“${A.q}”</div>
        <p>${esc(q.why)}</p>
        ${q.also != null ? `<div class="ag-lq-also">함께 보면 좋은 렌즈 · <b style="color:var(--ag-l${q.also + 1})">${LENS[q.also].ico} ${LENS[q.also].k}</b> — ${LENS[q.also].q}</div>` : ''}
        <div class="ag-row"><span class="ag-sp"></span><button type="button" class="ag-btn" data-a="next">${last ? '결과 보기 🏆' : '다음 장면 ▶'}</button></div>`;
      const nb = $(fb, '[data-a="next"]');
      nb.addEventListener('click', next);
      try { nb.focus({ preventScroll: true }); fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { /* */ }
    }

    function next() {
      if (!S) return;
      S.i++;
      if (S.i >= S.qs.length) result(); else ask();
    }

    function result() {
      const total = S.qs.length, ms = Math.round(performance.now() - S.t0), r = S.ok / total;
      const grade = r >= 0.9 ? ['🏆', '렌즈 장인', '여섯 렌즈를 자유자재로! 동료의 지도안도 봐 줄 수 있겠어요.']
        : r >= 0.7 ? ['🔍', '렌즈 탐정', '핵심을 잘 짚었어요. 헷갈린 렌즈만 한 번 더 살펴봐요.']
        : r >= 0.5 ? ['🌱', '렌즈 견습생', '감이 오고 있어요! 렌즈 질문을 소리 내어 읽으며 다시 도전!']
        : ['👓', '렌즈 새내기', '괜찮아요. 여섯 질문을 옆에 두고 한 번 더 해 볼까요?'];
      const per = LENS.map((l, i) => { const qs = S.qs.map((q, k) => ({ q, a: S.answers[k] })).filter((x) => x.q.a === i); return { l, i, n: qs.length, ok: qs.filter((x) => x.a && x.a.correct).length }; });
      const wrong = S.qs.map((q, k) => ({ q, a: S.answers[k] })).filter((x) => x.a && !x.a.correct);
      root.innerHTML = `
        <div class="ag-hero ag-lq-end">
          <div class="ag-hero-in"><img class="ag-mascot" data-opt src="${art(r >= 0.7 ? 'redi_thumbs.webp' : 'redi_heart.webp')}" alt="">
            <div><div class="ag-kicker">${grade[0]} 나의 렌즈 등급</div><h3 class="ag-disp">${grade[1]}</h3><p>${grade[2]}</p></div></div>
          <div class="ag-lq-stats">
            <div><b>${S.ok}<small>/${total}</small></b><span>정답</span></div>
            <div><b>${S.pts}</b><span>점수</span></div>
            <div><b>${S.best}</b><span>최고 연속</span></div>
            <div><b>${Math.round(ms / 1000)}</b><span>걸린 시간(초)</span></div>
          </div>
        </div>
        <div class="ag-lq-bars">${per.map((p) => `<div class="ag-lq-bar" style="--c:var(--ag-l${p.i + 1})"><b>${p.l.ico} ${p.l.k}</b><span>${Array.from({ length: p.n }, (_, k) => `<i class="${k < p.ok ? 'on' : ''}"></i>`).join('')}</span><em>${p.ok}/${p.n}</em></div>`).join('')}</div>
        ${wrong.length ? `<details class="ag-panel ag-lq-review"><summary>🔁 다시 볼 장면 ${wrong.length}개</summary>${wrong.map((x) => `<div class="ag-lq-rv"><p>${x.q.ico} ${esc(x.q.s)}</p><div>내 답 <b>${esc(x.a.pick)}</b> → 정답 <b style="color:var(--ag-l${x.q.a + 1})">${LENS[x.q.a].k}</b> · ${esc(x.q.why)}</div></div>`).join('')}</details>` : ''}
        <div class="ag-row"><span class="ag-sp"></span><button type="button" class="ag-btn ag-ghost" data-a="home">처음으로</button><button type="button" class="ag-btn" data-a="again">🔁 다시 도전</button></div>`;
      optImgs(root);
      $(root, '[data-a="again"]').addEventListener('click', begin);
      $(root, '[data-a="home"]').addEventListener('click', intro);
      if (r >= 0.7) { confetti(root, 2400); Snd.play('win'); }
      const out = { score: S.pts, total, correct: S.ok, ms, answers: S.answers, points: S.pts, best: S.best, title: grade[1] };
      try { if (typeof opts.onFinish === 'function') opts.onFinish(out); } catch (e) { console.warn('[AG.lensQuiz] onFinish', e); }
    }

    L.on(document, 'keydown', (e) => {
      if (!S || S.locked || !root.isConnected || !root.offsetParent) return;
      const ae = document.activeElement;
      if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
      if (e.key >= '1' && e.key <= '6' && $(root, '.ag-lq-opt')) { e.preventDefault(); answer(+e.key - 1); }
    });

    intro();
    return { destroy() { L.kill(); S = null; root.remove(); } };
  };

  /* ═════════════════════════ 3. 마스터교원 인생게임 ═════════════════════════ */
  const LV = ['입문가', '탐색가', '실천가', '전문가', '선도자', '개척자'];
  const ZONES = [0, 5, 10, 16, 22, 27];
  const lvOf = (pos) => { let l = 1; ZONES.forEach((z, i) => { if (pos >= z) l = i + 1; }); return l; };
  const TILES = ['start', 'G1', 'chance', 'G2', 'G1', 'G3', 'trial', 'G2', 'fork', 'G1', 'G3', 'chance', 'G2', 'trial', 'G3', 'G1', 'G2', 'fork', 'G3', 'trial', 'chance', 'G1', 'G3', 'G2', 'trial', 'G3', 'chance', 'G1', 'trial', 'G2', 'G3', 'goal'];
  const GOAL = TILES.length - 1;
  const TT = {
    start: { ico: '🚩', lab: '출발', cls: 'st' }, goal: { ico: '🏆', lab: '개척자', cls: 'goal' },
    G1: { ico: '📘', lab: 'G1', cls: 'g1' }, G2: { ico: '🧭', lab: 'G2', cls: 'g2' }, G3: { ico: '🤝', lab: 'G3', cls: 'g3' },
    chance: { ico: '⭐', lab: '찬스', cls: 'ch' }, trial: { ico: '⚡', lab: '시련', cls: 'tr' }, fork: { ico: '🔀', lab: '갈림길', cls: 'fk' },
  };
  const GI = {
    G1: { name: '전문성 영역 이해', short: '영역 이해', c: '#3b6fe0' },
    G2: { name: '전문성 계획 수립', short: '계획 수립', c: '#8a5cf6' },
    G3: { name: '실천 기반 성찰과 협력적 성장', short: '성찰·협력', c: '#1f9d6b' },
  };
  const CARDS = {
    G1: [
      { title: '역량체계 지도 펼치기', sub: '역량체계 이해', desc: '교원 역량체계의 영역과 하위 요소를 내 말로 한 장에 정리했어요.', q: '지금 내 위치를 지도에 찍는다면 어디쯤일까요?' },
      { title: '역량 언어로 말하기', sub: '역량체계 이해', desc: '내 수업 사례를 역량체계의 용어로 동료에게 설명해 보았어요.', q: '내 수업을 한 문장의 역량 언어로 말하면?' },
      { title: '수업 혁신 사례 탐방', sub: '교수·학습 혁신 이해', desc: 'AI 창작 수업 사례 세 개를 보고 공통된 설계 원리를 찾았어요.', q: '내 수업에 가져오고 싶은 원리 하나는?' },
      { title: '여섯 렌즈로 다시 보기', sub: '교수·학습 혁신 이해', desc: '내 지도안을 여섯 렌즈로 점검하고 한 곳을 고쳤어요.', q: '가장 많이 고친 렌즈는 무엇이었나요?' },
      { title: '디지털 생산자 되기', sub: '디지털 생산자와 윤리적 활용', desc: 'AI로 수업 자료를 직접 만들고 출처와 AI 사용을 표시했어요.', q: '내가 만든 자료에 꼭 넣을 표시는?' },
      { title: '윤리 약속 세우기', sub: '디지털 생산자와 윤리적 활용', desc: '학생들과 AI 창작 약속(저작권·초상권·개인정보)을 함께 정했어요.', q: '우리 반 약속 1번은 무엇으로 할까요?' },
    ],
    G2: [
      { title: '역량 자기 진단', sub: '역량체계 기반 자기 진단', desc: '나의 역량분석 대시보드로 강점과 보완점을 확인했어요.', q: '가장 키우고 싶은 역량 하나는?' },
      { title: '거울과 창문', sub: '역량체계 기반 자기 진단', desc: '자기 진단 결과와 동료가 본 나의 모습을 나란히 비교했어요.', q: '동료가 말해 준 나의 강점은?' },
      { title: '나만의 성장 경로', sub: '맞춤형 개발 경로', desc: '한 학기 동안의 배움·실천·공유 계획을 3단계로 세웠어요.', q: '다음 달에 할 첫 단계는?' },
      { title: '작은 목표 쪼개기', sub: '맞춤형 개발 경로', desc: '큰 목표를 매주 실천할 수 있는 작은 목표로 나눴어요.', q: '이번 주에 할 수 있는 가장 작은 실천은?' },
      { title: 'AI 도구 서랍 정리', sub: 'AI 학습 자원 확보', desc: '수업에 쓸 AI 도구를 목적별로 정리하고 연령 기준도 확인했어요.', q: '내 서랍에 꼭 넣을 도구 하나는?' },
      { title: '배움 자원 모으기', sub: 'AI 학습 자원 확보', desc: '연수 자료·사례집·커뮤니티를 한곳에 모아 두었어요.', q: '가장 자주 찾아갈 배움터는?' },
    ],
    G3: [
      { title: '함께 수업 짜기', sub: '학습공동체 공동 실천', desc: '모둠 선생님들과 AI 창작 수업을 함께 설계했어요.', q: '함께라서 더 좋아진 점은?' },
      { title: '수업 나눔의 날', sub: '학습공동체 공동 실천', desc: '동료 수업을 참관하고 여섯 렌즈로 피드백을 나눴어요.', q: '동료에게 받고 싶은 피드백은?' },
      { title: '공유마당 업로드', sub: '콘텐츠 제작과 공유·확산', desc: '내 지도안과 활동지를 공유마당에 올렸어요.', q: '다른 선생님이 바로 쓰려면 무엇을 덧붙일까요?' },
      { title: '우리 학교 미니 연수', sub: '콘텐츠 제작과 공유·확산', desc: '배운 내용을 학교 동료들에게 30분 미니 연수로 나눴어요.', q: '30분 안에 꼭 전할 한 가지는?' },
      { title: '실천 일지 쓰기', sub: '실천 기록 기반 성찰과 환류', desc: '수업 뒤 잘된 점·아쉬운 점·다음 시도를 기록했어요.', q: '오늘 수업의 한 줄 성찰은?' },
      { title: '피드백 반영 2차 수업', sub: '실천 기록 기반 성찰과 환류', desc: '학생 반응을 반영해 수업을 고쳐 다시 실행했어요.', q: '다음 수업에서 바꿀 한 가지는?' },
    ],
  };
  const CHANCE = [
    { t: '동료의 응원 메시지', d: '“선생님 자료 덕분에 저도 해 봤어요!” 힘이 솟아요.', eff: 'fwd', n: 2, tag: '2칸 앞으로' },
    { t: '우수 사례 선정', d: '내 수업 사례가 공유마당 추천 글이 되었어요.', eff: 'fwd', n: 3, tag: '3칸 앞으로' },
    { t: '영감이 번쩍!', d: '출근길에 수업 아이디어가 떠올랐어요.', eff: 'again', tag: '한 번 더 굴리기' },
    { t: '멘토 선생님과의 만남', d: '선배 마스터교원이 성장 경로를 함께 짜 주었어요.', eff: 'card', g: 'G2', tag: 'G2 카드 받기' },
    { t: '학생의 한마디', d: '“선생님, 이 수업 또 해요!”', eff: 'card', g: 'G3', tag: 'G3 카드 받기' },
  ];
  const TRIAL = [
    { t: '와이파이 대란', d: '25명이 동시에 접속하자 네트워크가 멈췄어요.', eff: 'back', n: 2, tag: '2칸 뒤로', tip: '플랜 B(종이 활동지)를 챙기면 실행 렌즈가 단단해져요.' },
    { t: '업무 폭탄', d: '갑자기 몰려온 업무로 이번 주 실천을 미뤄요.', eff: 'skip', tag: '한 번 쉬기', tip: '작은 목표로 쪼개 두면 다시 시작하기 쉬워요.' },
    { t: '저작권 경고', d: 'AI 그림에 유명 캐릭터가 섞여 있었어요.', eff: 'back', n: 1, tag: '1칸 뒤로', tip: '출처·AI 사용 표시를 습관으로!' },
    { t: '계획대로 안 된 수업', d: 'AI가 엉뚱한 결과만 내서 수업이 흔들렸어요.', eff: 'reflect', tag: '성찰하면 G3 카드!', tip: '실천 일지에 기록하면 시련도 성장 카드가 돼요.' },
    { t: '번아웃 경고등', d: '혼자 다 하려다 지쳐 버렸어요.', eff: 'skip', tag: '한 번 쉬기', tip: '학습공동체에 도움을 요청해 보세요.' },
  ];
  const REFLECT = { title: '시련 성찰 일지', sub: '실천 기록 기반 성찰과 환류', desc: '잘 안 된 수업을 기록하고 원인과 다음 시도를 정리했어요.', q: '이번 시련에서 배운 한 가지는?' };
  const NEXT = {
    G1: '역량체계와 여섯 렌즈를 내 수업의 언어로 다시 정리해 보기',
    G2: '나의 역량분석 대시보드로 자기 진단하고, 한 학기 성장 경로 3단계 세우기',
    G3: '학습공동체에서 수업 하나를 함께 실천하고 공유마당에 올리기',
  };
  const TOK = ['#2a5bd7', '#e5484d', '#1f9d6b', '#f08a24', '#8a5cf6', '#d99a00', '#0ea5b7', '#db2777'];
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const diceHTML = (n) => Array.from({ length: 9 }, (_, i) => `<span class="${PIPS[n].includes(i) ? 'on' : ''}"></span>`).join('');
  const legendHTML = () => ['G1', 'G2', 'G3', 'chance', 'trial', 'fork'].map((k) => `<span class="ag-leg ag-t-${TT[k].cls}">${TT[k].ico} ${GI[k] ? `${k} ${GI[k].short}` : TT[k].lab}</span>`).join('');
  const gCount = (p) => { const c = { G1: 0, G2: 0, G3: 0 }; p.cards.forEach((x) => { c[x.g] = (c[x.g] || 0) + 1; }); return c; };
  const initialOf = (s) => { const t = String(s).trim(); const m = t.match(/^\d+/); return m ? m[0].slice(0, 2) : t.slice(0, 1); };

  GAMES.lifeGame = function (container, opts = {}) {
    const L = life();
    const root = document.createElement('div'); root.className = 'ag ag-lg'; container.appendChild(root);
    const maxRound = opts.maxRounds || 12;
    const given = (Array.isArray(opts.players) ? opts.players : []).map((x) => String(typeof x === 'string' ? x : (x && x.name) || '').trim()).filter(Boolean).slice(0, 8);
    let names = given.length ? given.slice() : ['1번 선생님', '2번 선생님', '3번 선생님', '4번 선생님'];
    let st = null, GL = null, ro = null;

    function cleanup() { if (GL) GL.kill(); GL = null; if (ro) { ro.disconnect(); ro = null; } st = null; }

    function setup() {
      cleanup();
      root.innerHTML = `
        ${heroHTML({ cls: 'ag-hero-lg', banner: opts.banner ? 'game_life.webp' : '', mascot: 'redi_idea.webp', kicker: '🎲 GROWTH BOARD GAME', title: '마스터교원 인생게임', text: '주사위를 굴려 <b>입문가</b>에서 <b>개척자</b>까지! 칸마다 G1·G2·G3 성장 카드를 모으며 나의 전문성 성장 경로를 그려 봐요.' })}
        <div class="ag-panel ag-lg-setup">
          <div class="ag-lab">플레이어 <b class="ag-pn"></b>명 <span>1~8명 · 한 화면에서 돌아가며</span><span class="ag-btns"><button type="button" class="ag-ic" data-a="minus" aria-label="플레이어 빼기">－</button><button type="button" class="ag-ic" data-a="plus" aria-label="플레이어 더하기">＋</button></span></div>
          <div class="ag-lg-pin"></div>
          <div class="ag-lg-legend">${legendHTML()}</div>
          <ul class="ag-lg-rules">
            <li>🎲 주사위만큼 이동하고, 도착한 칸의 카드를 펼쳐요.</li>
            <li>📘🧭🤝 G1·G2·G3 칸에서는 <b>성장 카드</b>를 모아요. 카드의 ‘생각해 보기’에 한마디씩 답해 보세요.</li>
            <li>⭐ 찬스는 도약, ⚡ 시련은 잠깐 멈춤! 🔀 갈림길에서는 길을 직접 골라요.</li>
            <li>🏆 가장 먼저 <b>개척자</b> 칸에 닿거나 ${maxRound}라운드가 끝나면 게임 끝!</li>
          </ul>
          <div class="ag-row"><span class="ag-sp"></span><button type="button" class="ag-btn ag-big" data-a="start">🎲 게임 시작</button></div>
        </div>`;
      optImgs(root);
      const pin = $(root, '.ag-lg-pin'), pn = $(root, '.ag-pn');
      const draw = () => {
        pn.textContent = names.length;
        pin.innerHTML = names.map((n, i) => `<label style="--c:${TOK[i]}"><i class="ag-dot"></i><input type="text" maxlength="16" value="${esc(n)}" data-i="${i}" aria-label="${i + 1}번 플레이어 이름"></label>`).join('');
        $$(pin, 'input').forEach((inp) => inp.addEventListener('input', () => { names[+inp.dataset.i] = inp.value; }));
      };
      draw();
      $(root, '[data-a="minus"]').addEventListener('click', () => { if (names.length > 1) { names.pop(); draw(); } });
      $(root, '[data-a="plus"]').addEventListener('click', () => { if (names.length < 8) { names.push(`${names.length + 1}번 선생님`); draw(); } });
      $(root, '[data-a="start"]').addEventListener('click', () => { Snd.unlock(); start(); });
    }

    function start() {
      cleanup();
      GL = life();
      const ps = names.map((n, i) => ({ id: i, name: String(n).trim() || `${i + 1}번`, col: TOK[i % TOK.length], pos: 0, cards: [], skip: false, lv: 1 }));
      st = { players: ps, turn: 0, round: 1, busy: false, auto: false, over: false, cols: 0, pending: null, t0: Date.now(), decks: { G1: shuffle(CARDS.G1), G2: shuffle(CARDS.G2), G3: shuffle(CARDS.G3) } };
      root.innerHTML = `
        <div class="ag-lg-top">
          <div class="ag-disp ag-lg-title">🎲 마스터교원 인생게임</div>
          <span class="ag-pill ag-lg-round"></span><span class="ag-sp"></span>
          <button type="button" class="ag-ic ag-wide" data-a="auto" title="자동으로 끝까지 진행">⏩ 자동</button>
          <button type="button" class="ag-ic" data-a="snd" title="소리 켜기/끄기">${Snd.label()}</button>
          <button type="button" class="ag-ic" data-a="quit" title="처음 화면으로">✕</button>
        </div>
        <div class="ag-lg-main">
          <div class="ag-panel ag-lg-turn">
            <div class="ag-lg-who"></div>
            <div class="ag-lg-roll"><div class="ag-dice" aria-hidden="true">${diceHTML(1)}</div><button type="button" class="ag-btn ag-big" data-a="roll">🎲 주사위 굴리기</button></div>
            <div class="ag-lg-msg" aria-live="polite"></div>
          </div>
          <div class="ag-lg-boardwrap"><div class="ag-lg-board"></div></div>
          <div class="ag-panel ag-lg-side"><ul class="ag-lg-ps"></ul><div class="ag-lg-legend">${legendHTML()}</div></div>
        </div>
        <div class="ag-modal" hidden></div>`;
      $(root, '[data-a="roll"]').addEventListener('click', () => { Snd.unlock(); turn(); });
      $(root, '[data-a="auto"]').addEventListener('click', toggleAuto);
      $(root, '[data-a="snd"]').addEventListener('click', (e) => { Snd.toggle(); e.currentTarget.textContent = Snd.label(); });
      $(root, '[data-a="quit"]').addEventListener('click', (e) => {
        const b = e.currentTarget;
        if (b.dataset.arm) { setup(); return; }
        b.dataset.arm = '1'; b.textContent = '나갈까요?'; b.classList.add('ag-wide', 'ag-warnbtn');
        GL.after(() => { if (b.isConnected) { delete b.dataset.arm; b.textContent = '✕'; b.classList.remove('ag-wide', 'ag-warnbtn'); } }, 2400);
      });
      const wrap = $(root, '.ag-lg-boardwrap');
      if (window.ResizeObserver) { ro = new ResizeObserver(() => { if (!st) return; const c = colsFor(); if (c !== st.cols) renderBoard(); else placeTokens(); }); ro.observe(wrap); }
      renderBoard(); syncUI();
      say(`🚩 ${esc(ps[0].name)} 님부터 시작! 주사위를 굴려 주세요.`);
    }

    const colsFor = () => { const w = ($(root, '.ag-lg-boardwrap') || {}).clientWidth || 0; return w >= 700 ? 8 : w >= 500 ? 6 : 5; };

    function renderBoard() {
      const board = $(root, '.ag-lg-board'); if (!board || !st) return;
      const cols = colsFor(); st.cols = cols;
      board.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      board.innerHTML = TILES.map((t, i) => {
        const row = Math.floor(i / cols), c = i % cols, col = row % 2 ? cols - 1 - c : c, zi = ZONES.indexOf(i), m = TT[t];
        return `<div class="ag-tile ag-t-${m.cls}" data-i="${i}" style="grid-row:${row + 1};grid-column:${col + 1}"><span class="ag-tno">${i}</span>${zi >= 0 ? `<span class="ag-zone">Lv.${zi + 1} ${LV[zi]}</span>` : ''}<span class="ag-tico">${m.ico}</span><span class="ag-tlab">${m.lab}</span></div>`;
      }).join('') + st.players.map((p) => `<div class="ag-tok" data-p="${p.id}" style="--c:${p.col}" title="${esc(p.name)}"><i>${esc(initialOf(p.name))}</i></div>`).join('');
      placeTokens();
    }

    function placeTokens() {
      const board = $(root, '.ag-lg-board'); if (!board || !st) return;
      const groups = {};
      st.players.forEach((p) => { (groups[p.pos] = groups[p.pos] || []).push(p); });
      Object.keys(groups).forEach((pos) => {
        const tile = $(board, `.ag-tile[data-i="${pos}"]`); if (!tile) return;
        const g = groups[pos], n = g.length, cx = tile.offsetLeft + tile.offsetWidth / 2, cy = tile.offsetTop + tile.offsetHeight / 2 + 4;
        const rad = n === 1 ? 0 : Math.min(18, tile.offsetWidth * 0.24);
        g.forEach((p, k) => {
          const el = $(board, `.ag-tok[data-p="${p.id}"]`); if (!el) return;
          const ang = (k / n) * Math.PI * 2 - Math.PI / 2;
          el.style.transform = `translate(${cx + Math.cos(ang) * rad}px, ${cy + Math.sin(ang) * rad}px) translate(-50%, -50%)`;
          el.classList.toggle('cur', !st.over && p.id === st.players[st.turn].id);
        });
      });
    }

    function hop(p) {
      const el = $(root, `.ag-tok[data-p="${p.id}"]`); if (!el) return;
      el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop');
    }

    function say(html) { const el = $(root, '.ag-lg-msg'); if (el) el.innerHTML = html; }

    function toast(txt) {
      const b = $(root, '.ag-lg-board'); if (!b) return;
      const t = document.createElement('div'); t.className = 'ag-toast'; t.textContent = txt; b.appendChild(t);
      setTimeout(() => t.remove(), 1800);
    }

    function renderPlayers(flash) {
      const ul = $(root, '.ag-lg-ps'); if (!ul || !st) return;
      ul.innerHTML = st.players.map((p, i) => {
        const c = gCount(p);
        return `<li class="${i === st.turn && !st.over ? 'cur' : ''} ${flash === p.id ? 'got' : ''}" style="--c:${p.col}"><i class="ag-dot"></i><div class="ag-pn-name"><b>${esc(p.name)}${p.skip ? ' 😴' : ''}</b><small>Lv.${p.lv} ${LV[p.lv - 1]} · ${p.pos}칸</small></div><span class="ag-gc g1" title="G1 카드">${c.G1}</span><span class="ag-gc g2" title="G2 카드">${c.G2}</span><span class="ag-gc g3" title="G3 카드">${c.G3}</span></li>`;
      }).join('');
    }

    function syncUI() {
      if (!st) return;
      const p = st.players[st.turn];
      const who = $(root, '.ag-lg-who');
      if (who) who.innerHTML = `<i class="ag-dot" style="--c:${p.col}"></i><span>${esc(p.name)} 님 차례</span><small>Lv.${p.lv} ${LV[p.lv - 1]}</small>`;
      const rb = $(root, '[data-a="roll"]');
      if (rb) { rb.disabled = st.busy || st.over || st.auto; rb.textContent = st.auto ? '⏩ 자동 진행 중…' : '🎲 주사위 굴리기'; }
      const ab = $(root, '[data-a="auto"]'); if (ab) { ab.classList.toggle('on', st.auto); ab.textContent = st.auto ? '⏸ 멈춤' : '⏩ 자동'; }
      const rd = $(root, '.ag-lg-round'); if (rd) rd.textContent = `라운드 ${Math.min(st.round, maxRound)} / ${maxRound}`;
      renderPlayers(); placeTokens();
    }

    function toggleAuto() {
      if (!st || st.over) return;
      Snd.unlock();
      st.auto = !st.auto; syncUI();
      if (st.auto) { if (st.pending) GL.after(() => st && st.pending && st.pending(0), 350); else if (!st.busy) turn(); }
    }

    function drawCard(g) {
      if (!st.decks[g].length) st.decks[g] = shuffle(CARDS[g]);
      return Object.assign({ g }, st.decks[g].pop());
    }

    function modal(html, buttons, color) {
      return new Promise((res) => {
        const m = $(root, '.ag-modal'); if (!m) return;
        m.hidden = false;
        m.innerHTML = `<div class="ag-mcard" style="--c:${color || '#2a5bd7'}" role="dialog" aria-modal="true">${html}<div class="ag-macts">${buttons.map((b, i) => `<button type="button" class="ag-btn ${i ? 'ag-ghost' : ''}" data-v="${i}">${b.t}</button>`).join('')}</div></div>`;
        let done = false, autoId = 0;
        const finish = (i) => {
          if (done) return; done = true; GL.clear(autoId);
          if (st) st.pending = null;
          m.hidden = true; m.innerHTML = '';
          res(buttons[clamp(i, 0, buttons.length - 1)].v);
        };
        $$(m, 'button[data-v]').forEach((b) => b.addEventListener('click', () => finish(+b.dataset.v)));
        st.pending = (i) => finish(buttons.length > 1 ? Math.floor(Math.random() * buttons.length) : i);
        if (st.auto) autoId = GL.after(() => st.pending && st.pending(0), 650);
        try { $(m, 'button').focus({ preventScroll: true }); } catch (e) { /* */ }
      });
    }

    const cardHTML = (c, p) => `
      <div class="ag-mhead"><span>${c.g}</span>${GI[c.g].name}</div>
      <div class="ag-mico">${TT[c.g].ico}</div>
      <div class="ag-msub">${esc(c.sub)}</div>
      <h4>${esc(c.title)}</h4><p>${esc(c.desc)}</p>
      <div class="ag-think">💭 <b>생각해 보기</b> · ${esc(c.q)}</div>
      <div class="ag-mwho"><i class="ag-dot" style="--c:${p.col}"></i> ${esc(p.name)} 님의 성장 카드</div>`;
    const eventHTML = (head, ico, c, p) => `
      <div class="ag-mhead">${head}</div>
      <div class="ag-mico">${ico}</div>
      <h4>${esc(c.t)}</h4><p>${esc(c.d)}</p>
      <div class="ag-mtag">${esc(c.tag)}</div>
      ${c.tip ? `<div class="ag-think">💡 ${esc(c.tip)}</div>` : ''}
      <div class="ag-mwho"><i class="ag-dot" style="--c:${p.col}"></i> ${esc(p.name)} 님</div>`;

    async function moveBy(p, n) {
      const dir = n > 0 ? 1 : -1;
      let steps = Math.abs(n);
      while (steps-- > 0) {
        const np = clamp(p.pos + dir, 0, GOAL); if (np === p.pos) break;
        p.pos = np; placeTokens(); hop(p); Snd.play('hop');
        await GL.wait(st.auto ? 110 : 230);
      }
      const tile = $(root, `.ag-tile[data-i="${p.pos}"]`);
      if (tile) { tile.classList.remove('land'); void tile.offsetWidth; tile.classList.add('land'); }
      const lv = lvOf(p.pos);
      if (lv > p.lv) {
        p.lv = lv; Snd.play('lvup'); toast(`🎉 ${p.name} · Lv.${lv} ${LV[lv - 1]}!`);
        confetti($(root, '.ag-lg-boardwrap'), 1600);
        await GL.wait(st.auto ? 350 : 800);
      }
      renderPlayers();
    }

    async function rollDice() {
      const dice = $(root, '.ag-dice'); if (!dice) return 1;
      dice.classList.add('rolling');
      const t0 = performance.now(), dur = st.auto ? 300 : 750;
      while (performance.now() - t0 < dur) { dice.innerHTML = diceHTML(1 + Math.floor(Math.random() * 6)); Snd.play('dice'); await GL.wait(70); }
      const v = 1 + Math.floor(Math.random() * 6);
      dice.innerHTML = diceHTML(v); dice.classList.remove('rolling');
      return v;
    }

    async function landOn(p) {
      const t = TILES[p.pos];
      if (t === 'G1' || t === 'G2' || t === 'G3') {
        const c = drawCard(t);
        await modal(cardHTML(c, p), [{ t: '🃏 성장 카드 받기', v: 1 }], GI[t].c);
        p.cards.push(c); Snd.play('card'); renderPlayers(p.id);
        say(`🃏 ${esc(p.name)} 님 <b>${t}</b> 카드 「${esc(c.title)}」 획득!`);
      } else if (t === 'chance') {
        const c = pick(CHANCE);
        await modal(eventHTML('⭐ 찬스 카드', '⭐', c, p), [{ t: '좋아요!', v: 1 }], '#d99a00');
        if (c.eff === 'fwd') { say(`⭐ ${esc(c.t)} → ${c.n}칸 도약!`); await moveBy(p, c.n); }
        else if (c.eff === 'again') { say(`⭐ ${esc(p.name)} 님 한 번 더!`); return { again: true }; }
        else if (c.eff === 'card') { const cd = drawCard(c.g); p.cards.push(cd); Snd.play('card'); renderPlayers(p.id); say(`⭐ ${c.g} 카드 「${esc(cd.title)}」 획득!`); }
      } else if (t === 'trial') {
        const c = pick(TRIAL);
        await modal(eventHTML('⚡ 시련 카드', '⚡', c, p), [{ t: '받아들이기', v: 1 }], '#e5484d');
        if (c.eff === 'back') { say(`⚡ ${esc(c.t)} → ${c.n}칸 뒤로…`); await moveBy(p, -c.n); }
        else if (c.eff === 'skip') { p.skip = true; say(`⚡ ${esc(c.t)} → 다음 차례 한 번 쉬기`); }
        else if (c.eff === 'reflect') { p.cards.push(Object.assign({ g: 'G3' }, REFLECT)); Snd.play('card'); renderPlayers(p.id); say('⚡→🌱 시련을 기록했더니 G3 성장 카드가 되었어요!'); }
      } else if (t === 'fork') {
        const v = await modal(`
          <div class="ag-mhead">🔀 갈림길</div><div class="ag-mico">🔀</div>
          <h4>어느 길로 갈까요?</h4><p>빠르게 혼자 갈까요, 동료와 함께 갈까요?</p>
          <div class="ag-mwho"><i class="ag-dot" style="--c:${p.col}"></i> ${esc(p.name)} 님의 선택</div>`,
        [{ t: '🚀 도전의 길 · 3칸 전진', v: 'a' }, { t: '🤝 동행의 길 · 1칸 + G3 카드', v: 'b' }], '#0ea5b7');
        if (v === 'a') { say('🚀 도전의 길! 3칸 전진'); await moveBy(p, 3); }
        else { const cd = drawCard('G3'); p.cards.push(cd); Snd.play('card'); say(`🤝 동행의 길! 「${esc(cd.title)}」 카드 + 1칸`); await moveBy(p, 1); }
      }
      renderPlayers();
      return {};
    }

    async function turn() {
      if (!st || st.busy || st.over) return;
      st.busy = true; syncUI();
      const p = st.players[st.turn];
      let again = false;
      if (p.skip) {
        p.skip = false; say(`😴 ${esc(p.name)} 님은 이번 차례를 쉬어요.`); renderPlayers();
        await GL.wait(st.auto ? 500 : 1100);
      } else {
        const d = await rollDice();
        say(`🎲 ${esc(p.name)} 님 <b>${d}</b>!`);
        await moveBy(p, d);
        if (p.pos >= GOAL) return finish('goal', p);
        const r = await landOn(p);
        if (p.pos >= GOAL) return finish('goal', p);
        again = !!(r && r.again);
      }
      if (!again) { st.turn = (st.turn + 1) % st.players.length; if (st.turn === 0) st.round++; }
      if (st.round > maxRound) return finish('round', null);
      st.busy = false; syncUI();
      if (st.auto) GL.after(turn, 380);
    }

    function finish(reason, winner) {
      if (!st || st.over) return;
      st.over = true; st.auto = false; st.busy = false;
      const S = st;
      const ranked = S.players.slice().sort((a, b) => b.pos - a.pos || b.cards.length - a.cards.length);
      const out = ranked.map((p, i) => ({ name: p.name, lv: p.lv, lvName: LV[p.lv - 1], pos: p.pos, rank: i + 1, cards: p.cards.map((c) => ({ title: c.title, g: c.g, desc: c.desc })) }));
      const medal = ['🥇', '🥈', '🥉'];
      const suggest = (p) => {
        const c = gCount(p), keys = ['G1', 'G2', 'G3'], min = Math.min(c.G1, c.G2, c.G3), max = Math.max(c.G1, c.G2, c.G3);
        if (min === max && max > 0) return '모은 카드 중 하나를 골라 다음 주에 바로 실천하기';
        const g = keys.filter((k) => c[k] === min)[0];
        return `<b>${g}</b>(${GI[g].short}) 카드가 가장 적어요 → ${NEXT[g]}`;
      };
      cleanup();
      root.innerHTML = `
        ${heroHTML({ cls: 'ag-lg-end', mascot: 'redi_heart.webp', kicker: reason === 'goal' ? '🏆 개척자 도착!' : `⏰ ${maxRound}라운드 종료`, title: winner ? `${esc(winner.name)} 님이 가장 먼저 개척자가 되었어요!` : '오늘의 성장 여정 결과', text: '모은 성장 카드를 보며 서로의 ‘다음 한 걸음’을 이야기해 보세요. 카드는 <b>나의 성장 계획</b>의 재료가 돼요.' })}
        <div class="ag-lg-rank">${ranked.map((p, i) => {
          const c = gCount(p);
          return `<div class="ag-panel ag-lg-pr" style="--c:${p.col}">
            <div class="ag-lg-prh"><span class="ag-medal">${medal[i] || `${i + 1}위`}</span><i class="ag-dot"></i><b class="ag-lg-pname">${esc(p.name)}</b><span class="ag-pill">Lv.${p.lv} ${LV[p.lv - 1]}</span><span class="ag-gcs"><span class="ag-gc g1">G1 ${c.G1}장</span><span class="ag-gc g2">G2 ${c.G2}장</span><span class="ag-gc g3">G3 ${c.G3}장</span></span></div>
            <div class="ag-lg-cards">${p.cards.length ? p.cards.map((cd) => `<span class="ag-chip ${cd.g.toLowerCase()}" title="${esc(cd.desc)}">${esc(cd.title)}</span>`).join('') : '<span class="ag-hint">아직 모은 카드가 없어요</span>'}</div>
            <div class="ag-next">👣 <b>나의 다음 한 걸음</b> · ${suggest(p)}</div>
          </div>`;
        }).join('')}</div>
        <div class="ag-row"><span class="ag-sp"></span><button type="button" class="ag-btn ag-ghost" data-a="new">👥 새로 시작</button><button type="button" class="ag-btn" data-a="again">🔁 같은 멤버로 다시</button></div>`;
      optImgs(root);
      $(root, '[data-a="again"]').addEventListener('click', start);
      $(root, '[data-a="new"]').addEventListener('click', setup);
      confetti(root, 3000); Snd.play('win');
      try { if (typeof opts.onFinish === 'function') opts.onFinish({ players: out, winner: winner ? winner.name : null, reason, rounds: Math.min(S.round, maxRound), ms: Date.now() - S.t0 }); } catch (e) { console.warn('[AG.lifeGame] onFinish', e); }
    }

    const auto = opts.autoStart != null ? !!opts.autoStart : given.length > 0;
    if (auto) start(); else setup();
    return { destroy() { cleanup(); L.kill(); root.remove(); } };
  };
})();
