/**
 * AIEDAP 마스터교원 신규연수 · 모듈 4·5 실습 백엔드 (Google Apps Script 웹 앱)
 * 2026-11-08 경남 초등 1차 · AI 기반 창작 분반 · 강사 최일훈
 * ─────────────────────────────────────────────────────────────
 * ▣ 스크립트 속성 (왼쪽 ⚙ 프로젝트 설정 › 스크립트 속성)
 *   GEMINI_API_KEY  (필수) Google AI Studio 키 — 코드에 직접 쓰지 마세요
 *   MODEL           (선택) 먼저 써 볼 모델 이름. 비우면 아래 MODELS 순서대로
 *   SHEET_ID        (자동) 처음 실행 때 응답 스프레드시트를 만들어 저장
 *   ADMIN_PIN       (필수) '추가 정보'에 강사 공지로 고정할 때 쓰는 숫자 — 코드에 쓰지 말고 속성에만
 *   RESET_PIN       (필수) 보드 비우기(관리자 리셋) 암호 — 코드에 쓰지 말고 속성에만 (저장소가 공개라서)
 * ▣ 배포: 배포 › 새 배포 › 유형 '웹 앱' › 실행 사용자 '나' › 액세스 '모든 사용자'
 * ▣ 시트에서 줄을 지우면 그 응답은 보드에서 사라집니다(부적절한 글 정리용).
 * ▣ 보드의 🧹 버튼(관리자 암호)으로 비우면, 지운 줄은 '지운 기록' 탭으로 옮겨 보관합니다.
 */

const PROPS = PropertiesService.getScriptProperties();
const CACHE = CacheService.getScriptCache();
const MODELS = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
const SCAN = 5000; // 최근 몇 줄까지 읽을지
const TABS = {
  members:   { name: '참여자',         head: ['시각', '모듈', '모둠', '이름', '기기ID'] },
  responses: { name: '활동 응답',      head: ['시각', '모듈', '활동', '모둠', '이름', '기기ID', '요약', '선택', '내용(JSON)'] },
  ai:        { name: 'AI 도우미 기록', head: ['시각', '모듈', '작업', '모둠', '이름', '기기ID', '입력 요약', '첨부 수', '모델', 'AI 응답'] },
  scores:    { name: '게임 점수',      head: ['시각', '게임', '모둠', '이름', '기기ID', '점수', '시간(ms)', '세부'] },
  links:     { name: '추가 정보',      head: ['시각', 'ID', '제목', '주소', '설명', '이름', '모둠', '기기ID', '고정', '삭제'] },
  trash:     { name: '지운 기록',      head: ['지운 시각', '원래 탭', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  reacts:    { name: '하트·댓글',      head: ['시각', '모듈', '활동', '대상', '종류', '모둠', '이름', '기기ID', '내용'] }
};
function adminPin_() { return String(PROPS.getProperty('ADMIN_PIN') || ''); }
function resetPin_() { return String(PROPS.getProperty('RESET_PIN') || ''); }
const GAMES = { m4: ['lens', 'memory'], m5: ['life'] };

/* ───────── 스프레드시트 ───────── */
function ss_() {
  const id = PROPS.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  const ss = SpreadsheetApp.create('AIEDAP 모듈4·5 실습 응답 (2026-11-08 경남 초등 1차 · AI창작 · 최일훈)');
  PROPS.setProperty('SHEET_ID', ss.getId());
  const first = ss.getSheets()[0];
  Object.keys(TABS).forEach(k => sheet_(k, ss));
  try { ss.deleteSheet(first); } catch (e) {}
  return ss;
}
function sheet_(key, ss) {
  ss = ss || ss_();
  const t = TABS[key];
  let s = ss.getSheetByName(t.name);
  if (!s) {
    s = ss.insertSheet(t.name);
    s.appendRow(t.head);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, t.head.length).setFontWeight('bold').setBackground('#e8eefc');
  }
  return s;
}
function now_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'); }
function clip_(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) + '…' : s; }
function out_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function tail_(s, cols) {
  const n = s.getLastRow();
  if (n < 2) return [];
  const start = Math.max(2, n - SCAN + 1);
  return s.getRange(start, 1, n - start + 1, cols).getValues();
}
function cached_(key, ttl, fn) {
  try { const c = CACHE.get(key); if (c) return JSON.parse(c); } catch (e) {}
  const v = fn();
  try { const j = JSON.stringify(v); if (j.length < 95000) CACHE.put(key, j, ttl); } catch (e) {}
  return v;
}
function hhmm_(t) {
  if (t instanceof Date) return Utilities.formatDate(t, 'Asia/Seoul', 'HH:mm');
  const m = String(t).match(/(\d{1,2}:\d{2})(:\d{2})?\s*$/); return m ? m[1] : String(t);
}

/* ───────── 읽기 (GET) ───────── */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'list') return out_({ ok: true, rows: list_(p) });
    if (p.action === 'members') return out_({ ok: true, members: members_(p) });
    if (p.action === 'scores') return out_({ ok: true, rows: scores_(p) });
    if (p.action === 'stats') return out_({ ok: true, stats: stats_(p) });
    if (p.action === 'links') return out_({ ok: true, rows: links_() });
    if (p.action === 'room') return out_({ ok: true, room: roomGet_(roomKey_(p)) });
    return out_({ ok: true, service: 'aiedap-m45', ai: !!PROPS.getProperty('GEMINI_API_KEY'), time: now_() });
  } catch (err) { return out_({ ok: false, error: String(err) }); }
}

/* 활동별 응답: 같은 기기·같은 활동은 마지막 제출 1건만 */
function list_(p) {
  const rows = listRows_(p);
  const R = reacts_(p.module || '', p.activity || '');
  return rows.map(r => { const x = R[r.d]; return x ? Object.assign({}, r, { h: x.h, cm: x.c }) : r; });
}
/* 하트·댓글: 대상(글쓴이 기기 끝 6자리)별로 모음. 하트는 같은 기기가 다시 누르면 취소 */
function reacts_(mod, act) {
  return cached_('R|' + mod + '|' + act, 6, () => {
    const vals = tail_(sheet_('reacts'), 9);
    const m = {};
    vals.forEach(r => {
      if (String(r[1]) !== mod || String(r[2]) !== act) return;
      const t = String(r[3]); const o = m[t] || (m[t] = { h: [], c: [] });
      const dev = String(r[7]).slice(-6);
      if (r[4] === 'heart') { const i = o.h.indexOf(dev); if (i >= 0) o.h.splice(i, 1); else o.h.push(dev); }
      else if (r[4] === 'comment') o.c.push({ t: hhmm_(r[0]), g: String(r[5]), n: String(r[6]), s: String(r[8]), d: dev });
    });
    Object.keys(m).forEach(t => { m[t].c = m[t].c.slice(-30); });
    return m;
  });
}
/* 모둠 함께 하는 게임 방: 캐시에 상태만 두고, 각 기기는 같은 이벤트 순서를 받아 같은 화면을 그린다 */
function roomKey_(b) { return 'GR|' + String(b.module || '') + '|' + String(b.group || '') + '|' + String(b.game || 'life'); }
function roomGet_(k) {
  try { const c = CACHE.get(k); if (c) return JSON.parse(c); } catch (e) {}
  return { gen: 1, players: [], started: false, seed: 0, ev: [] };
}
function room_(b) {
  const k = roomKey_(b), d6 = clip_(b.device, 40).slice(-6), op = String(b.op || '');
  if (!b.group || !d6) return { ok: false, error: '모둠 등록이 필요해요.' };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const r = roomGet_(k);
    const me = r.players.find(x => x.d === d6);
    if (op === 'join') {
      if (me) me.n = clip_(b.name, 16) || me.n;
      else if (!r.started && r.players.length < 8) r.players.push({ d: d6, n: clip_(b.name, 16) || '선생님', ready: false });
    } else if (op === 'ready') {
      if (me && !r.started) {
        me.ready = !!b.ready;
        if (r.players.length && r.players.every(x => x.ready)) { r.started = true; r.seed = 1 + Math.floor(Math.random() * 2147483000); r.ev = []; }
      }
    } else if (op === 'go') {
      if (me && !r.started) {
        me.ready = true;
        r.players = r.players.filter(x => x.ready);
        r.started = true; r.seed = 1 + Math.floor(Math.random() * 2147483000); r.ev = [];
      }
    } else if (op === 'leave') {
      if (!r.started) r.players = r.players.filter(x => x.d !== d6);
    } else if (op === 'ev') {
      if (!r.started || !me) return { ok: false, error: '게임에 참여한 기기가 아니에요.', room: r };
      if (Number(b.seq) !== r.ev.length) return { ok: true, stale: true, room: r };
      r.ev.push({ k: String(b.k || '').slice(0, 8), v: b.v == null ? null : String(b.v).slice(0, 8), d: d6 });
    } else if (op === 'reset') {
      if (me) { r.gen = (r.gen || 1) + 1; r.started = false; r.seed = 0; r.ev = []; r.players.forEach(x => { x.ready = false; }); }
    }
    CACHE.put(k, JSON.stringify(r), 21600);
    return { ok: true, room: r };
  } finally { lock.releaseLock(); }
}
function react_(b) {
  const mod = String(b.module || ''), act = String(b.activity || ''), tgt = String(b.target || '').slice(-6);
  const kind = b.kind === 'comment' ? 'comment' : 'heart';
  const dev = clip_(b.device, 40);
  if (!mod || !act || !tgt || !dev) return { ok: false, error: '대상을 알 수 없어요.' };
  if (dev.slice(-6) === tgt) return { ok: false, error: '내 글에는 남길 수 없어요.' };
  const text = kind === 'comment' ? clip_(b.text, 200).trim() : '';
  if (kind === 'comment' && !text) return { ok: false, error: '댓글을 적어 주세요.' };
  const ck = 'rx_' + dev, cnt = Number(CACHE.get(ck) || 0);
  if (cnt >= 60) return { ok: false, error: '조금 쉬었다가 다시 해 주세요.' };
  CACHE.put(ck, String(cnt + 1), 600);
  append_('reacts', [now_(), mod, act, tgt, kind, String(b.group || ''), clip_(b.name, 30), dev, text]);
  CACHE.remove('R|' + mod + '|' + act);
  return { ok: true, r: reacts_(mod, act)[tgt] || { h: [], c: [] } };
}
function listRows_(p) {
  const full = p.full === '1';
  const key = ['L', p.module || '', p.activity || '', p.group || '', full ? 1 : 0].join('|');
  return cached_(key, 6, () => {
    const vals = tail_(sheet_('responses'), full ? 9 : 8);
    const seen = {}, rows = [];
    for (let i = vals.length - 1; i >= 0 && rows.length < 400; i--) {
      const r = vals[i];
      if (p.module && String(r[1]) !== String(p.module)) continue;
      if (p.activity && String(r[2]) !== String(p.activity)) continue;
      const k = r[5] + '|' + r[2];
      if (seen[k]) continue;
      seen[k] = 1;
      if (p.group && String(r[3]) !== String(p.group)) continue;
      const row = { t: hhmm_(r[0]), a: r[2], g: String(r[3]), n: r[4], d: String(r[5]).slice(-6), s: full ? String(r[6]) : clip_(r[6], 420), c: r[7] };
      if (full) { try { row.data = JSON.parse(r[8] || '{}'); } catch (e) { row.data = {}; } }
      rows.push(row);
    }
    return rows;
  });
}

function members_(p) {
  return cached_('M|' + (p.group || ''), 8, () => {
    const vals = tail_(sheet_('members'), 5);
    const seen = {}, rows = [];
    for (let i = vals.length - 1; i >= 0; i--) {
      const r = vals[i];
      const k = String(r[4] || r[3]);
      if (seen[k]) continue;
      seen[k] = 1;
      if (p.group && String(r[2]) !== String(p.group)) continue;
      rows.push({ g: String(r[2]), n: r[3] });
    }
    return rows.reverse();
  });
}

function scores_(p) {
  return cached_('S|' + (p.game || ''), 8, () => {
    const vals = tail_(sheet_('scores'), 8);
    const best = {};
    vals.forEach(r => {
      if (p.game && String(r[1]) !== String(p.game)) return;
      const k = r[4] + '|' + r[1];
      const o = { t: hhmm_(r[0]), game: r[1], g: String(r[2]), n: r[3], score: Number(r[5]) || 0, ms: Number(r[6]) || 0, detail: clip_(r[7], 160) };
      const b = best[k];
      if (!b || o.score > b.score || (o.score === b.score && o.ms && o.ms < b.ms)) best[k] = o;
    });
    return Object.keys(best).map(k => best[k])
      .sort((a, b) => b.score - a.score || (a.ms || 9e9) - (b.ms || 9e9)).slice(0, 120);
  });
}

function stats_(p) {
  return cached_('T|' + (p.module || ''), 8, () => {
    const vals = tail_(sheet_('responses'), 6);
    const seen = {}, by = {};
    for (let i = vals.length - 1; i >= 0; i--) {
      const r = vals[i];
      if (p.module && String(r[1]) !== String(p.module)) continue;
      const k = r[5] + '|' + r[2];
      if (seen[k]) continue;
      seen[k] = 1;
      const a = r[2], g = String(r[3]);
      by[a] = by[a] || {};
      by[a][g] = (by[a][g] || 0) + 1;
    }
    const mem = members_({});
    const perGroup = {};
    mem.forEach(m => { perGroup[m.g] = (perGroup[m.g] || 0) + 1; });
    return { byActivity: by, members: mem.length, perGroup: perGroup };
  });
}

/* 추가 정보 게시판: 고정 글 먼저, 그다음 최신 순 */
function links_() {
  return cached_('K', 5, () => {
    const vals = tail_(sheet_('links'), 10);
    const rows = [];
    for (let i = vals.length - 1; i >= 0 && rows.length < 300; i--) {
      const r = vals[i];
      if (String(r[9]) === 'Y' || !r[1]) continue;
      rows.push({ id: String(r[1]), t: hhmm_(r[0]), title: String(r[2]), url: String(r[3]), desc: String(r[4]), n: String(r[5]), g: String(r[6]), d: String(r[7]).slice(-6), pin: String(r[8]) === 'Y' });
    }
    return rows.filter(x => x.pin).concat(rows.filter(x => !x.pin));
  });
}
function cleanUrl_(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (/\s/.test(u) || /^(javascript|data|vbscript|file):/i.test(u) || /^(?!https?:)[a-z][a-z0-9+.-]*:\/\//i.test(u)) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u.replace(/^\/+/, '');
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(u) ? clip_(u, 800) : '';
}

/* ───────── 쓰기 (POST, text/plain JSON) ───────── */
/* 여러 명이 동시에 appendRow 하면 줄이 서로 덮일 수 있어(실측: 40명 중 34줄 유실) 반드시 잠근다.
   스프레드시트 열기·줄 만들기는 잠금 밖에서, 잠금 안에서는 붙이고 flush만 해서 대기 시간을 줄인다. */
function append_(key, row) {
  const sh = sheet_(key);
  const lock = LockService.getScriptLock();
  lock.waitLock(28000);
  try { sh.appendRow(row); SpreadsheetApp.flush(); }
  finally { lock.releaseLock(); }
}
/* 조건에 맞는 줄을 '지운 기록' 탭으로 옮기고 원래 탭에서 빼기. 잠금 안에서만 부른다. */
function moveRows_(key, pred) {
  const sh = sheet_(key);
  const n = sh.getLastRow();
  if (n < 2) return { n: 0, acts: [] };
  const cols = TABS[key].head.length;
  const rng = sh.getRange(2, 1, n - 1, cols);
  const vals = rng.getValues();
  const keep = [], gone = [];
  vals.forEach(r => (pred(r) ? gone : keep).push(r));
  if (!gone.length) return { n: 0, acts: [] };
  const tr = sheet_('trash');
  const stamp = now_(), tab = TABS[key].name;
  const pad = r => { const a = [stamp, tab].concat(r.slice(0, 10)); while (a.length < 12) a.push(''); return a; };
  tr.getRange(tr.getLastRow() + 1, 1, gone.length, 12).setValues(gone.map(pad));
  SpreadsheetApp.flush();
  rng.clearContent();
  if (keep.length) sh.getRange(2, 1, keep.length, cols).setValues(keep);
  const acts = {};
  if (key === 'responses') gone.forEach(r => { acts[String(r[2])] = 1; });
  return { n: gone.length, acts: Object.keys(acts) };
}
function reset_(b) {
  const dev = clip_(b.device, 40);
  const tk = 'rst_' + dev;
  const tries = Number(CACHE.get(tk) || 0);
  if (tries >= 6) return { ok: false, error: '잠시 뒤에 다시 해 주세요 (암호를 여러 번 틀렸어요).' };
  if (!resetPin_()) return { ok: false, error: '관리자 암호가 아직 설정되지 않았어요 (스크립트 속성 RESET_PIN).' };
  if (String(b.pin || '') !== resetPin_()) { CACHE.put(tk, String(tries + 1), 600); return { ok: false, error: '관리자 암호가 맞지 않아요.' }; }
  const mod = String(b.module || ''), act = String(b.activity || ''), all = b.scope === 'module';
  if (!mod || (!all && !act)) return { ok: false, error: '비울 보드를 알 수 없어요.' };
  const games = GAMES[mod] || [];
  let res, mem = { n: 0 }, sc = { n: 0 };
  const lock = LockService.getScriptLock();
  lock.waitLock(28000);
  try {
    res = moveRows_('responses', r => String(r[1]) === mod && (all || String(r[2]) === act));
    moveRows_('reacts', r => String(r[1]) === mod && (all || String(r[2]) === act));
    if (all) {
      mem = moveRows_('members', r => String(r[1]) === mod);
      sc = moveRows_('scores', r => games.indexOf(String(r[1])) >= 0);
    }
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  const gs = [''];
  for (let g = 1; g <= 30; g++) gs.push(String(g));
  const keys = ['T|', 'T|' + mod, 'S|'];
  games.forEach(g => keys.push('S|' + g));
  gs.forEach(g => keys.push('M|' + g));
  const acts = res.acts.slice();
  if (act && acts.indexOf(act) < 0) acts.push(act);
  acts.forEach(a => gs.forEach(g => [0, 1].forEach(f => keys.push(['L', mod, a, g, f].join('|'), ['L', '', a, g, f].join('|')))));
  acts.forEach(a => keys.push('R|' + mod + '|' + a));
  for (let i = 0; i < keys.length; i += 400) CACHE.removeAll(keys.slice(i, i + 400));
  CACHE.remove(tk);
  return { ok: true, removed: res.n, members: mem.n, scores: sc.n };
}

function doPost(e) {
  let b = {};
  try { b = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return out_({ ok: false, error: 'bad json' }); }
  if (b.action === 'ai') { try { return out_(ai_(b)); } catch (err) { return out_({ ok: false, error: String(err) }); } }
  try {
    if (b.action === 'join') {
      append_('members', [now_(), b.module || '', String(b.group || ''), clip_(b.name, 30), clip_(b.device, 40)]);
      CACHE.removeAll(['M|', 'M|' + String(b.group || ''), 'T|', 'T|m4', 'T|m5']);
      return out_({ ok: true });
    }
    if (b.action === 'react') return out_(react_(b));
    if (b.action === 'room') return out_(room_(b));
    if (b.action === 'submit') {
      if (!b.activity) return out_({ ok: false, error: 'activity 없음' });
      append_('responses', [now_(), b.module || '', b.activity, String(b.group || ''), clip_(b.name, 30), clip_(b.device, 40),
        clip_(b.summary, 1500), clip_(b.choice, 60), clip_(JSON.stringify(b.data || {}), 40000)]);
      const keys = [];
      ['', String(b.group || '')].forEach(g => [0, 1].forEach(f => keys.push(['L', b.module || '', b.activity, g, f].join('|'))));
      keys.push('T|' + (b.module || ''), 'T|');
      CACHE.removeAll(keys);
      return out_({ ok: true });
    }
    if (b.action === 'post') {
      const dev = clip_(b.device, 40);
      const ck = 'post_' + dev;
      const cnt = Number(CACHE.get(ck) || 0);
      if (cnt >= 12) return out_({ ok: false, error: '조금 쉬었다가 올려 주세요 (10분에 12개까지).' });
      const url = cleanUrl_(b.url);
      const title = clip_(String(b.title || '').trim(), 80) || (url ? url.replace(/^https?:\/\//, '').slice(0, 60) : '');
      if (!title && !url) return out_({ ok: false, error: '제목이나 주소를 적어 주세요.' });
      if (b.url && !url) return out_({ ok: false, error: '주소 형식을 확인해 주세요 (https://…).' });
      const pinned = b.pin && String(b.pin) === adminPin_();
      if (b.pin && !pinned) return out_({ ok: false, error: '강사 PIN이 맞지 않아요.' });
      const id = Utilities.getUuid().slice(0, 8);
      append_('links', [now_(), id, title, url, clip_(b.desc, 500), clip_(b.name || '익명', 30), String(b.group || ''), dev, pinned ? 'Y' : '', '']);
      CACHE.put(ck, String(cnt + 1), 600);
      CACHE.remove('K');
      return out_({ ok: true, id: id, pinned: !!pinned });
    }
    if (b.action === 'unpost') {
      const s = sheet_('links');
      const lock = LockService.getScriptLock();
      lock.waitLock(20000);
      try {
        const n = s.getLastRow();
        if (n < 2) return out_({ ok: false, error: '없음' });
        const ids = s.getRange(2, 2, n - 1, 1).getValues();
        for (let i = ids.length - 1; i >= 0; i--) {
          if (String(ids[i][0]) !== String(b.id)) continue;
          const dev = String(s.getRange(i + 2, 8).getValue());
          if (dev !== String(b.device) && (!adminPin_() || String(b.pin || '') !== adminPin_())) return out_({ ok: false, error: '내가 올린 글만 지울 수 있어요.' });
          s.getRange(i + 2, 10).setValue('Y');
          SpreadsheetApp.flush();
          CACHE.remove('K');
          return out_({ ok: true });
        }
        return out_({ ok: false, error: '글을 찾지 못했어요.' });
      } finally { lock.releaseLock(); }
    }
    if (b.action === 'reset') return out_(reset_(b));
    if (b.action === 'score') {
      append_('scores', [now_(), b.game || '', String(b.group || ''), clip_(b.name, 30), clip_(b.device, 40),
        Number(b.score) || 0, Number(b.ms) || 0, clip_(b.detail, 500)]);
      CACHE.removeAll(['S|' + (b.game || ''), 'S|']);
      return out_({ ok: true });
    }
    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: /lock|잠금|timed out|시간/i.test(String(err)) ? '지금 제출이 몰려 있어요. 다시 눌러 주세요.' : String(err) });
  }
}

/* ───────── AI 도우미 '리디' (Gemini) ───────── */
const SYS = [
  '당신은 2026 AIEDAP 마스터교원 신규연수(모듈 4·5, AI 기반 창작 분반)의 실습 도우미 "리디"입니다.',
  '상대는 이미 AI 기반 창작 수업을 설계·실천·성찰한 초등 교사입니다. 교사가 자기 수업을 스스로 평가·성찰·재설계하도록 돕습니다.',
  '원칙 ① 교사의 판단을 대신하지 말고, 근거가 되는 "장면"을 짚어 생각을 열어 주세요.',
  '원칙 ② 제공된 자료에 없는 내용은 지어내지 말고 "자료에서 확인되지 않음 → 이렇게 확인해 보세요"로 쓰세요.',
  '원칙 ③ AI 도구를 바꾸거나 더하는 것만으로 개선이라고 하지 마세요. 학습 목표·학습 활동·기술의 역할·학생의 사고·교사의 지원·학습의 증거 사이의 연결을 보세요.',
  '원칙 ④ 학생 실명 등 개인정보가 보이면 언급하지 말고 "개인정보는 가려 주세요"라고 한 줄 알려 주세요.',
  '형식: 한국어 존댓말, 짧은 개조식. 소제목은 "## ", 비교는 마크다운 표. 전체 분량은 A4 한 쪽 이내. 인사말·맺음말 없이 바로 본론.'
].join('\n');

const LENS = '교육적(AI 활용이 학습목표 달성에 기여했는가) · 학습자(학생이 스스로 생각하고 선택했는가) · 기술적(그 생성형 AI 활용이 목적과 수준에 맞았는가) · 평가(학습의 증거를 충분히 확인했는가) · 윤리적(책임 있는 창작이었는가: 오류·편향·저작권·개인정보) · 실행(실제 교실에서 실행 가능한가)';

const TASKS = {
  evidence: '[모듈4 1차시 · 학습의 증거] 이 수업의 학습목표를 한두 줄로 정리하고, 창작 과정 6단계(의도·발상 / AI와 상호작용 / 선택·판단 / 수정·재구성 / 완성 / 성찰)별로 "자료에 이미 남아 있는 학습의 증거"와 "더 남기면 좋을 증거"를 표로 보여 주세요. 마지막에 "내 수업의 학습목표는 ___이고, 그것을 확인하려면 ___이(가) 더 남아야 한다." 문장 예시 1개.',
  lens: '[모듈4 2차시 · 여섯 렌즈 성찰] 여섯 렌즈 ' + LENS + ' 로 이 수업을 보세요. 렌즈마다 "효과적이었던 점"과 "다시 생각해볼 점"을 판단어(좋았다/아쉬웠다)가 아니라 구체적 장면으로 1~2개씩 표로 쓰세요(열: 렌즈 | 효과적이었던 장면 | 다시 생각해볼 장면). 자료에 근거가 없으면 교사에게 던질 질문으로 바꾸세요. 마지막에 "가장 먼저 풀 핵심 문제 후보" 2개와 각각의 근거.',
  problem: '[모듈4 2차시 · 핵심 문제] 유지하고 싶은 부분과 다시 설계하고 싶은 부분을 나누고, 가장 먼저 해결할 핵심 문제 후보 2개를 제시하세요. 후보마다 근거 장면과 "도구 교체가 아닌" 개선 방향을 한 줄씩. 마지막에 "제 수업에서 가장 먼저 풀고 싶은 문제는 ___입니다. ___ 장면에서 ___했기 때문입니다." 예시 문장.',
  bpr: '[모듈4 3차시 · Re-design] Before–Problem–Re-design 세 줄 초안을 쓰고, 여섯 설계 요소(학습 목표 · 학습 활동 · 기술의 역할 · 학생의 사고 · 교사의 지원 · 학습의 증거)별 "기존 → Re-design" 표를 만드세요. 하나를 바꿀 때 맞물려 바뀌어야 하는 요소를 표시하고, AIEDAP 지도안을 고칠 때 스스로 확인할 검증 질문 3개.',
  feedback: '[모듈4 4차시 · 동료 피드백] 이 Re-design을 여섯 관점(정합성: 목표–활동–AI–평가 연결 / 기술의 역할: AI를 써야 하는 이유 / 주도성: 학생이 생각·선택·판단하는 지점 / 증거: 학습 확인 증거 / 성찰: 학생이 창작과 AI 활용을 돌아보는가 / 실행 가능성)으로 보고, 관점별로 "강점 → 근거 → 제안" 순서의 피드백 문장을 쓰세요. 문장 틀: "○○ 장면이 잘 작동할 것 같아요. ○○ 관점에서 보면 ○○를 더해 보면 어떨까요?" 마지막에 발표자에게 던질 질문 2개.',
  sentence: '[모듈4 4차시 · 한 문장] "기존에는 ___ 한 수업이었지만, 학생이 ___ 할 수 있도록 ___ 을/를 중심으로 다시 설계하였습니다." 형식으로 이 수업의 Re-design 한 문장을 서로 다른 강조점으로 3가지 쓰세요. 기술 활용 자체가 아니라 학생에게 기대하는 변화와 핵심 설계 변화가 이어지게.',
  plan: '[모듈5 · 성장 계획 코치] 교사가 적은 현재 수준·강점·보완 역량·목표를 바탕으로, G역량(G1 전문성 영역 이해 / G2 전문성 계획 수립 / G3 실천 기반 성찰과 협력적 성장)과 연결해 단기(6개월 이내)·장기(1년 이상) 실행 계획을 "무엇을 | 언제까지 | 누구와 | 어떤 증거로" 표로 제안하세요. AIEDAP 활용(역량분석 대시보드 자기 진단, 맞춤형 연수·활동 추천, 우수 AI 융합 수업 사례 콘텐츠, e-포트폴리오)을 자연스럽게 넣고, 마지막에 "AX 시대의 교사 전문성은 ___ 이다" 문장 예시 2개.',
  free: '[자유 질문] 교사의 질문에 연수 맥락(모듈 4: 평가→성찰→재설계→환류 / 모듈 5: 지속적 전문성 개발)에 맞게 답하세요.',
  fill_w1: '[모듈4 1차시 · W1 초안 채우기] 교사가 올린 AI 융합수업 설계안(지도안)을 읽고 W1 활동지 초안을 만드세요. ' +
    '"평가하고 싶은 학습"은 설계안의 성취기준·학습목표에서 출발해 학생이 하는 수행을 "~한다" 문장으로 2~4개(예: 자신의 창작 의도를 구체화한다 / 다양한 표현을 비교하여 적절한 것을 선택한다 / 자신의 의도에 맞게 표현을 수정한다 / 자신의 창작 과정을 설명하고 성찰한다). ' +
    '"그 학습의 증거"는 그 수업 활동에서 실제로 남는 구체물(활동지 칸, 대화·프롬프트 기록, 비교표, 수정 전·후, 발표·성찰 기록 등). 설계안에 없는 활동은 지어내지 말고, 설계안에 남지 않는 증거는 끝에 "(추가 제안)"이라고 붙이세요. ' +
    '반드시 JSON 객체 하나만 출력: {"my":"학년 · 교과 · 수업 주제 한 줄","g1":"","e1":"","g2":"","e2":"","g3":"","e3":"","g4":"","e4":"","now":"설계안에 이미 남는 증거(쉼표로)","more":"더 확인하고 싶은 증거 한 가지(한 줄)"}. 값마다 90자 이내, 해당 없으면 빈 문자열.',
  fill_w2: '[모듈4 2차시 · W2 초안 채우기] 교사가 올린 AI 융합수업 설계안을 2022 개정 교육과정 총론(아래 요약)과 [별책2 성취기준 원문]에 비추어 읽고 W2 활동지 초안을 쓰세요. ' +
    'codes: 설계안이 다루는 성취기준 코드 배열(설계안에 코드가 없으면 별책2에서 가장 가까운 코드를 추정). std: 그 성취기준 원문(별책2 문장 그대로, 추정한 것은 끝에 "(추정)"). ' +
    'core: 학습 목표에 비추어 학생이 실제로 해야 하는 핵심 수행을 4~6단계로 "→"로 이어 쓰기. sup: AI가 학습을 넓혀 주는 구체적인 장면 1~2개("(지원)"으로 시작). ' +
    'warn: AI가 학생의 수행을 대신하거나 오류·과의존이 생길 수 있는 지점 1~2개와 확인 방법("(주의)"로 시작). 총론의 "결과만이 아니라 결과에 이르는 학습 과정 확인", "깊이 있는 학습", "언어·수리·디지털 기초소양"을 근거로 하세요. ' +
    '반드시 JSON 객체 하나만 출력: {"codes":[""],"std":"","core":"","sup":"","warn":""}. 값마다 220자 이내.',
  fill_w3: '[모듈4 2차시 · W3 여섯 렌즈 성찰표 초안] 교사가 올린 자료(실천한 AI 융합수업의 지도안·수업 기록·성찰 메모·학생 산출물 등)와 [이 교사가 W1·W2에 적은 내용]을 여섯 렌즈로 읽고, 렌즈마다 "효과적이었던 점"과 "다시 생각해볼 점"을 한두 문장으로 쓰세요. ' +
    '좋았다·아쉬웠다 같은 판단어가 아니라 자료에 나온 구체적 장면으로 쓰세요(좋은 예: "AI가 만든 그림을 비교한 뒤 자기 스케치와 가장 가까운 것을 고르고 이유를 설명함" / "5모둠 중 3모둠이 AI 문구를 고치지 않고 그대로 씀"). ' +
    '렌즈 기준: 교육적=AI 활동이 성취기준·학습목표와 이어졌나, 학생이 교과의 핵심 학습 과정을 직접 했나 / 학습자=AI 전에 자기 생각이 있었나, 비교·선택·수정의 주체가 학생이었나 / 기술적=그 도구가 목표와 학생 수준에 맞았나, 더 단순한 방법은 없었나 / 평가=결과물뿐 아니라 사고·선택·수정의 증거가 남았나 / 윤리적=AI 결과를 그대로 믿지 않게 했나, 출처 표시·개인정보·편향 / 실행=시간·기기·로그인·학생 수준 차이, 다른 교실에서도 가능한가. ' +
    '자료에 그 렌즈의 근거가 없으면 지어내지 말고 "확인 필요: ~ 장면이 있었나요?"처럼 교사에게 묻는 문장으로 쓰세요. 학생 실명은 쓰지 마세요. ' +
    '반드시 JSON 객체 하나만 출력: {"edu_g":"","edu_r":"","lrn_g":"","lrn_r":"","tec_g":"","tec_r":"","evl_g":"","evl_r":"","eth_g":"","eth_r":"","exe_g":"","exe_r":""}. _g는 효과적이었던 점, _r은 다시 생각해볼 점. 값마다 120자 이내.',
  fill_w4: '[모듈4 2차시 · W4 Re-design의 출발점] 교사가 올린 자료(실천한 AI 융합수업의 지도안·수업 기록·성찰 메모 등)와 [이 교사가 W1~W3에 적은 내용]을 읽고 Re-design의 출발점에 대한 의견을 쓰세요. ' +
    'keep: 유지하고 싶은 부분(효과가 확인된 구체적 장면). re: 다시 설계하고 싶은 부분. prob: 가장 먼저 해결할 문제 한 가지와 그 이유(성찰표·자료의 장면을 근거로, "~ 장면에서 ~했기 때문"). dir: 개선 방향(AI 도구를 바꾸거나 더하는 것이 아니라 학습 목표·학습 활동·기술의 역할·학생의 사고·교사의 지원·학습의 증거 사이의 무엇의 연결을 바꿀지). ' +
    '판단어가 아니라 장면으로 쓰고, 자료에 근거가 없으면 지어내지 말고 "확인 필요: ~?"처럼 교사에게 묻는 문장으로 쓰세요. 학생 실명은 쓰지 마세요. ' +
    '반드시 JSON 객체 하나만 출력: {"keep":"","re":"","prob":"","dir":""}. 값마다 150자 이내.',
  fill_w5: '[모듈4 3차시 · W5 Before–Problem–Re-design] 교사가 올린 자료(지도안·수업 기록·성찰 메모 등)와 [이 교사가 W1~W4에 적은 내용]을 읽고 B–P–R 세 줄에 대한 의견을 쓰세요. ' +
    'before: 기존 수업에서 실제로 있었던 상황. problem: 성찰로 발견한 핵심 문제 하나. redesign: 그 문제를 풀기 위해 무엇을 어떻게 바꿀지(도구 교체가 아니라 활동·증거·AI의 역할 등 연결의 변화). el: 함께 바뀌는 설계 요소와 어떻게 바뀌는지(예: 학습 목표(설계 → 설계하고 고친 이유 설명), 학습의 증거(…)). big: 가장 크게 바뀐 지점 한 줄. ask: 동료에게 피드백 받고 싶은 질문 하나. ' +
    '자료에 근거가 없으면 지어내지 말고 "확인 필요: ~?"처럼 교사에게 묻는 문장으로 쓰세요. 학생 실명은 쓰지 마세요. ' +
    '반드시 JSON 객체 하나만 출력: {"before":"","problem":"","redesign":"","el":"","big":"","ask":""}. 값마다 150자 이내.'
};
const CURRIC = [
  '[2022 개정 교육과정 총론 핵심 — 별책2 초등학교 교육과정 Ⅰ·Ⅱ장]',
  '· 구성의 중점: 디지털 전환·기후·생태환경 변화에 능동적으로 대응하는 주도성, 언어·수리·디지털 기초소양, 깊이 있는 학습(교과 간 연계와 통합, 삶과 연계된 학습, 학습에 대한 성찰), 학생 참여형 수업, 문제 해결 및 사고의 과정을 중시하는 평가.',
  '· 핵심역량: 자기관리 · 지식정보처리 · 창의적 사고 · 심미적 감성 · 협력적 소통 · 공동체.',
  '· 교수·학습: 단편적 지식 암기를 지양하고 교과의 핵심 아이디어를 중심으로 지식·이해, 과정·기능, 가치·태도를 연계 / 실생활 맥락에서 이해·적용 / 자신의 학습 과정과 전략을 점검·개선하는 자기주도 학습 / 실험·관찰·조사 등 탐구 활동 / 개별 학습과 소집단 협동 학습 / 지능정보기술을 활용한 학생 맞춤형 학습.',
  '· 평가: 성취기준에 근거해 교수·학습과 평가를 일관되게 / 학습의 결과만이 아니라 결과에 이르기까지의 학습 과정을 확인하고 환류 / 인지적·정의적 측면 균형, 학생 스스로 평가할 기회 / 배울 기회를 주지 않은 내용과 기능은 평가하지 않음 / 수행평가 내실화 / 지능정보기술을 활용한 맞춤형 평가.'
].join('\n');

function ai_(b) {
  const key = PROPS.getProperty('GEMINI_API_KEY');
  if (!key) return { ok: false, error: '강사가 아직 AI 키를 연결하지 않았어요. 잠시 뒤 다시 시도해 주세요.' };
  const dev = clip_(b.device || 'x', 40);
  const ck = 'ai_' + dev;
  const cnt = Number(CACHE.get(ck) || 0);
  if (cnt >= 12) return { ok: false, error: '조금 쉬었다가 다시 물어봐 주세요 (한 기기당 10분에 12번).' };
  CACHE.put(ck, String(cnt + 1), 600);

  const task = TASKS[b.task] ? b.task : 'free';
  const text = clip_(b.text, 45000);
  const fill = /^fill_/.test(task);
  const files = (b.images || []).slice(0, 4).filter(x => x && x.data && /^(image\/(png|jpeg|webp|heic|heif)|application\/pdf)$/.test(x.mime || ''));
  if (!text.trim() && !files.length) return { ok: false, error: '분석할 내용(글, 캡처 이미지, PDF)을 넣어 주세요.' };

  const parts = [{ text: TASKS[task] + (b.extra ? '\n\n[교사의 요청] ' + clip_(b.extra, 600) : '') +
    (fill ? '\n\n' + CURRIC : '') + (b.std ? '\n\n[별책2 성취기준 원문 — 설계안에서 찾은 코드]\n' + clip_(b.std, 6000) : '') +
    '\n\n--- 교사가 제공한 자료 ---\n' + (text || '(글 없음 · 첨부 파일 참고)') }];
  files.forEach(x => parts.push({ inline_data: { mime_type: x.mime, data: x.data } }));
  const payload = JSON.stringify({
    system_instruction: { parts: [{ text: SYS + '\n[여섯 렌즈 = 모듈 1에서 배운 성찰 관점] ' + LENS + '\n[여섯 설계 요소 = 3차시 Re-design에서 바꾸는 것] 학습 목표 · 학습 활동 · 기술의 역할 · 학생의 사고 · 교사의 지원 · 학습의 증거 (렌즈와 혼동하지 말 것)' }] },
    contents: [{ role: 'user', parts: parts }],
    generationConfig: fill ? { temperature: 0.3, maxOutputTokens: 12288, responseMimeType: 'application/json' } : { temperature: 0.4, maxOutputTokens: 16384 }
  });
  const models = [PROPS.getProperty('MODEL')].concat(MODELS).filter((m, i, a) => m && a.indexOf(m) === i);
  let answer = '', used = '', lastErr = '', finish = '';
  for (let i = 0; i < models.length && !answer; i++) {
    try {
      const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + models[i] + ':generateContent', {
        method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        headers: { 'x-goog-api-key': key }, payload: payload
      });
      const code = res.getResponseCode();
      let j = {};
      try { j = JSON.parse(res.getContentText() || '{}'); } catch (e) {}
      if (code === 200) {
        const c = (j.candidates || [])[0];
        answer = c && c.content && c.content.parts ? c.content.parts.filter(p => !p.thought).map(p => p.text || '').join('').trim() : '';
        used = models[i]; finish = (c && c.finishReason) || '';
        /* 생각(thinking)에 토큰을 다 써서 답이 잘리면 다음 모델로 다시 시도 */
        if (finish === 'MAX_TOKENS' && (fill || answer.length < 200)) { lastErr = '답이 길이 제한에 걸림'; answer = ''; continue; }
        if (!answer) lastErr = '빈 응답 (' + ((c && c.finishReason) || '이유 없음') + ')';
      } else {
        const e2 = models[i] + ' ' + code + ' ' + clip_((j.error && j.error.message) || res.getContentText(), 160);
        if (!lastErr || code !== 404) lastErr = e2;
        if (code === 400 && /API key/i.test(lastErr)) break;
      }
    } catch (err) { lastErr = String(err); }
  }
  try {
    sheet_('ai').appendRow([now_(), b.module || '', task, String(b.group || ''), clip_(b.name, 30), dev,
      clip_(text, 300), files.length, used, clip_(answer || ('오류: ' + lastErr), 40000)]);
  } catch (e) {}
  if (answer) return { ok: true, text: answer + (finish === 'MAX_TOKENS' ? '\n\n> (답이 길어 끝부분이 잘렸어요. 자료를 나눠서 다시 물어봐 주세요.)' : ''), model: used, finish: finish };
  const busy = /429|RESOURCE_EXHAUSTED|quota/i.test(lastErr);
  return { ok: false, error: busy ? '지금 질문이 몰려 있어요. 30초 뒤 다시 눌러 주세요.' : 'AI 응답을 받지 못했어요. (' + lastErr + ')' };
}

/* ───────── 강사용 점검 (편집기에서 함수 선택 › 실행) ───────── */
function setup() {
  const ss = ss_();
  Object.keys(TABS).forEach(k => sheet_(k, ss));
  Logger.log('응답 시트: ' + ss.getUrl());
  Logger.log('AI 키 연결: ' + (PROPS.getProperty('GEMINI_API_KEY') ? '됨' : '아직 (스크립트 속성 GEMINI_API_KEY)'));
}
function testAI() {
  Logger.log(JSON.stringify(ai_({ task: 'free', text: '여섯 렌즈를 한 줄씩 소개해 줘', device: 'test-' + Date.now() })));
}
