/**
 * AIEDAP 마스터교원 신규연수 · 모듈 4·5 실습 백엔드 (Google Apps Script 웹 앱)
 * 2026-11-08 경남 초등 1차 · AI 기반 창작 분반 · 강사 최일훈
 * ─────────────────────────────────────────────────────────────
 * ▣ 스크립트 속성 (왼쪽 ⚙ 프로젝트 설정 › 스크립트 속성)
 *   GEMINI_API_KEY  (필수) Google AI Studio 키 — 코드에 직접 쓰지 마세요
 *   MODEL           (선택) 먼저 써 볼 모델 이름. 비우면 아래 MODELS 순서대로
 *   SHEET_ID        (자동) 처음 실행 때 응답 스프레드시트를 만들어 저장
 * ▣ 배포: 배포 › 새 배포 › 유형 '웹 앱' › 실행 사용자 '나' › 액세스 '모든 사용자'
 * ▣ 시트에서 줄을 지우면 그 응답은 보드에서 사라집니다(부적절한 글 정리용).
 */

const PROPS = PropertiesService.getScriptProperties();
const CACHE = CacheService.getScriptCache();
const MODELS = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite'];
const SCAN = 5000; // 최근 몇 줄까지 읽을지
const TABS = {
  members:   { name: '참여자',         head: ['시각', '모듈', '모둠', '이름', '기기ID'] },
  responses: { name: '활동 응답',      head: ['시각', '모듈', '활동', '모둠', '이름', '기기ID', '요약', '선택', '내용(JSON)'] },
  ai:        { name: 'AI 도우미 기록', head: ['시각', '모듈', '작업', '모둠', '이름', '기기ID', '입력 요약', '첨부 수', '모델', 'AI 응답'] },
  scores:    { name: '게임 점수',      head: ['시각', '게임', '모둠', '이름', '기기ID', '점수', '시간(ms)', '세부'] }
};

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
    return out_({ ok: true, service: 'aiedap-m45', ai: !!PROPS.getProperty('GEMINI_API_KEY'), time: now_() });
  } catch (err) { return out_({ ok: false, error: String(err) }); }
}

/* 활동별 응답: 같은 기기·같은 활동은 마지막 제출 1건만 */
function list_(p) {
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

/* ───────── 쓰기 (POST, text/plain JSON) ───────── */
function doPost(e) {
  let b = {};
  try { b = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return out_({ ok: false, error: 'bad json' }); }
  if (b.action === 'ai') { try { return out_(ai_(b)); } catch (err) { return out_({ ok: false, error: String(err) }); } }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    if (b.action === 'join') {
      sheet_('members').appendRow([now_(), b.module || '', String(b.group || ''), clip_(b.name, 30), clip_(b.device, 40)]);
      CACHE.removeAll(['M|', 'M|' + String(b.group || ''), 'T|', 'T|m4', 'T|m5']);
      return out_({ ok: true });
    }
    if (b.action === 'submit') {
      if (!b.activity) return out_({ ok: false, error: 'activity 없음' });
      sheet_('responses').appendRow([now_(), b.module || '', b.activity, String(b.group || ''), clip_(b.name, 30), clip_(b.device, 40),
        clip_(b.summary, 1500), clip_(b.choice, 60), clip_(JSON.stringify(b.data || {}), 40000)]);
      const keys = [];
      ['', String(b.group || '')].forEach(g => [0, 1].forEach(f => keys.push(['L', b.module || '', b.activity, g, f].join('|'))));
      keys.push('T|' + (b.module || ''), 'T|');
      CACHE.removeAll(keys);
      return out_({ ok: true });
    }
    if (b.action === 'score') {
      sheet_('scores').appendRow([now_(), b.game || '', String(b.group || ''), clip_(b.name, 30), clip_(b.device, 40),
        Number(b.score) || 0, Number(b.ms) || 0, clip_(b.detail, 500)]);
      CACHE.removeAll(['S|' + (b.game || ''), 'S|']);
      return out_({ ok: true });
    }
    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
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
  free: '[자유 질문] 교사의 질문에 연수 맥락(모듈 4: 평가→성찰→재설계→환류 / 모듈 5: 지속적 전문성 개발)에 맞게 답하세요.'
};

function ai_(b) {
  const key = PROPS.getProperty('GEMINI_API_KEY');
  if (!key) return { ok: false, error: '강사가 아직 AI 키를 연결하지 않았어요. 잠시 뒤 다시 시도해 주세요.' };
  const dev = clip_(b.device || 'x', 40);
  const ck = 'ai_' + dev;
  const cnt = Number(CACHE.get(ck) || 0);
  if (cnt >= 12) return { ok: false, error: '조금 쉬었다가 다시 물어봐 주세요 (한 기기당 10분에 12번).' };
  CACHE.put(ck, String(cnt + 1), 600);

  const task = TASKS[b.task] ? b.task : 'free';
  const text = clip_(b.text, 30000);
  const files = (b.images || []).slice(0, 4).filter(x => x && x.data && /^(image\/(png|jpeg|webp|heic|heif)|application\/pdf)$/.test(x.mime || ''));
  if (!text.trim() && !files.length) return { ok: false, error: '분석할 내용(글, 캡처 이미지, PDF)을 넣어 주세요.' };

  const parts = [{ text: TASKS[task] + (b.extra ? '\n\n[교사의 요청] ' + clip_(b.extra, 600) : '') + '\n\n--- 교사가 제공한 자료 ---\n' + (text || '(글 없음 · 첨부 파일 참고)') }];
  files.forEach(x => parts.push({ inline_data: { mime_type: x.mime, data: x.data } }));
  const payload = JSON.stringify({
    system_instruction: { parts: [{ text: SYS }] },
    contents: [{ role: 'user', parts: parts }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
  });
  const models = [PROPS.getProperty('MODEL')].concat(MODELS).filter((m, i, a) => m && a.indexOf(m) === i);
  let answer = '', used = '', lastErr = '';
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
        answer = c && c.content && c.content.parts ? c.content.parts.map(p => p.text || '').join('').trim() : '';
        used = models[i];
        if (!answer) lastErr = '빈 응답 (' + ((c && c.finishReason) || '이유 없음') + ')';
      } else {
        lastErr = models[i] + ' ' + code + ' ' + clip_((j.error && j.error.message) || res.getContentText(), 160);
        if (code === 400 && /API key/i.test(lastErr)) break;
      }
    } catch (err) { lastErr = String(err); }
  }
  try {
    sheet_('ai').appendRow([now_(), b.module || '', task, String(b.group || ''), clip_(b.name, 30), dev,
      clip_(text, 300), files.length, used, clip_(answer || ('오류: ' + lastErr), 40000)]);
  } catch (e) {}
  if (answer) return { ok: true, text: answer, model: used };
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
