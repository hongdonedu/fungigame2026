/* 모듈 4·5 라이브 아카이브 엔진
 * data.js(내용) + config.js(API 주소) + games.js(게임)를 읽어 모듈별 페이지를 그립니다.
 * 페이지에서 window.MODID = 'm4' | 'm5' 를 먼저 정해 주세요. */
(function(){
'use strict';
const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MID=window.MODID==='m5'?'m5':'m4';
const API=(window.API_URL||'').trim();
const ONLINE=/^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)[:/])/.test(API);
const ART='../art/';
const art=n=>ART+n+'.webp';
const P=window.PARTS, L=window.LENS, W=window.SHEETS;
const GC=['#3b6fe0','#f08a24','#8a5cf6','#1f9d6b','#e5484d','#c98a00','#0e9fb5','#db2777','#5f9a12','#6d4fd8','#52607a'];
const gcol=g=>GC[(Number(g)-1)%GC.length]||'#64748b';
const GROUPS=11;

/* ───────── 모듈 설정 ───────── */
const MODS={
 m4:{parts:[1,2,3,4], name:'모듈 4', title:'다시 짓는 내 수업', sub:'모듈 4 · 나의 AI 융합수업 Re-design 하기',
  when:'11월 8일(일) 11:00 – 16:00 · 점심 13:00 – 14:00', img:'cover', brand:'redi_wave',
  h1:'여섯 렌즈로 보고,<br><em>다시 짓는 내 수업</em>',
  lines:['평가 → 성찰 → 재설계 → 환류','내 수업을 한 바퀴 돌려 AIEDAP Re-design 지도안까지'],
  deck:{t:'모듈4 [AI창작] 최일훈 11/8(일) 11:00-16:00', pptx:'../files/m4_choi_1108.pptx', gs:'https://docs.google.com/presentation/d/1lQvF3wPF07fjwiM5fJ27skIWf0sAk3Tr/edit'},
  game:{route:'game', id:'lens', n:'렌즈 탐정 게임', ic:'🔍', d:'수업 장면을 보고 어느 렌즈인지 빠르게 맞혀요', img:'game_lens'},
  other:{href:'../m5/', n:'모듈 5 아카이브', d:'16:00 – 18:00 · 계속 자라는 마스터교원'},
  ai:['evidence','lens','problem','bpr','feedback','sentence','free'],
  timer:['share7','share3','one','t2','t5','t10','t25'],
  sheets:['W1','W2','W3','W4','W5','W6','W7']},
 m5:{parts:[5], name:'모듈 5', title:'계속 자라는 마스터교원', sub:'모듈 5 · 마스터교원 역량 개발을 위한 지속적 전문성 개발',
  when:'11월 8일(일) 16:00 – 18:00 · 정시 종료', img:'part5', brand:'redi_heart',
  h1:'오늘이 끝이 아니라,<br><em>계속 자라는 출발점</em>',
  lines:['G역량 · AIEDAP 역량 진단 · 나의 성장 계획','AX 시대의 교사 전문성은 ___ 이다'],
  deck:{t:'모듈5 [AI창작] 최일훈 11/8(일) 16:00-18:00', pptx:'../files/m5_choi_1108.pptx', gs:'https://docs.google.com/presentation/d/1T2ooa8JGAkecFk3UGSwrt7-IlCipwFb9/edit'},
  game:{route:'life', id:'life', n:'성장 인생게임', ic:'🎲', d:'주사위를 굴려 입문가에서 개척자까지, 성장 카드를 모아요', img:'game_life'},
  other:{href:'../m4/', n:'모듈 4 아카이브', d:'11:00 – 16:00 · 다시 짓는 내 수업'},
  ai:['plan','free'],
  timer:['m5','t2','t5','t10'],
  sheets:['W8'],
  survey:'https://forms.gle/LFGYfRnQcZBjdCbA6', code:'658SMRVK'}
};
const M=MODS[MID];

/* 차시 안에서 함께 나누는 보드 (예전 패들렛 자리) */
const POSTS={
 s2:{a:'p_vote',kind:'vote',q:'학생 A와 학생 B, 누구에게 더 높은 점수를 주시겠어요?',opts:['학생 A','학생 B'],ph:'이유 한 줄',scope:'all'},
 s4:{a:'p_evid',q:'더 확인하고 싶은 학습의 증거 한 가지',from:'W1.more',ph:'예) 생성 결과를 비교하고 고른 이유를 쓰는 칸',scope:'group'},
 s7:{a:'p_prob',q:'내가 가장 먼저 풀고 싶은 핵심 문제 한 줄',from:'W4.prob',ph:'제 수업에서 가장 먼저 풀고 싶은 문제는 ___입니다. ___ 장면에서 ___했기 때문입니다.',scope:'group',spin:'1인 1분 말하기 순서'},
 s11:{a:'p_change',q:'가장 크게 바뀐 지점 한 줄',from:'W5.big',ph:'기존 수업과 달라진 것 한 가지',scope:'group'},
 s14:{a:'p_sent',q:'나의 Re-design 한 문장',sentence:'W7',ph:'기존에는 ___ 한 수업이었지만, 학생이 ___ 할 수 있도록 ___ 을/를 중심으로 다시 설계하였습니다.',scope:'all',spin:'한 문장 발표자 뽑기'},
 s15:{a:'p_why',q:'AX 시대, 교사에게 전문성 개발이 필요한 이유는?',ph:'한 줄로',scope:'all'},
 s18:{a:'p_plan',q:'나의 단기 계획 한 줄 (무엇을 · 언제까지 · 누구와)',from:'W8.short',ph:'예) 12월까지 학년 연구회에서 Re-design 수업 1회 공개',scope:'group',spin:'1인 2분 공유 순서'},
 s19:{a:'p_one',kind:'word',q:'AX 시대의 교사 전문성은 ___ 이다',from:'W8.one',ph:'빈칸에 들어갈 말 (예: 함께 자라는 힘)',scope:'all'}
};
const ACT_NAME={p_vote:'학생 A·B 투표',p_evid:'더 확인할 증거',p_prob:'핵심 문제',p_change:'바뀐 지점',p_sent:'Re-design 한 문장',p_why:'전문성 개발 이유',p_plan:'단기 계획',p_one:'교사 전문성은 ___',p_life:'성장 카드'};
Object.keys(W).forEach(k=>{ACT_NAME[k]=k+' '+W[k].t;});
const AIBTN={s4:'evidence',s6:'lens',s7:'problem',s9:'bpr',s10:'bpr',s13:'feedback',s14:'sentence',s18:'plan'};
const TASKS={
 evidence:['학습의 증거 찾기','1차시','🔎','창작 과정 6단계별로 이미 남은 증거와 더 남길 증거를 표로'],
 lens:['여섯 렌즈로 성찰','2차시','🌈','렌즈마다 효과적이었던 장면 · 다시 생각해볼 장면'],
 problem:['핵심 문제 후보','2차시','🎯','가장 먼저 풀 문제 후보 2개와 근거'],
 bpr:['B–P–R 재설계 초안','3차시','🛠️','Before–Problem–Re-design과 여섯 설계 요소 표'],
 feedback:['동료 피드백 문장','4차시','🤝','여섯 관점으로 강점 → 근거 → 제안'],
 sentence:['Re-design 한 문장','4차시','✍️','강조점이 다른 한 문장 3가지'],
 plan:['성장 계획 코치','모듈 5','🌱','G역량과 이어지는 단기·장기 계획 표'],
 free:['자유 질문','언제나','💬','무엇이든 물어보기']
};

/* ───────── 내용 손보기 (패들렛 → 우리 반 보드) ───────── */
const S=window.STEPS.filter(s=>M.parts.indexOf(s.part)>=0).map(s=>Object.assign({},s));
const byId=id=>S.find(s=>s.id===id);
(function tune(){
  if(W.W1) W.W1.rows=W.W1.rows.map(r=>r[0]==='more'?['more','더 확인하고 싶은 증거 한 가지','1차시 정리 — 아래 보드에 올릴 한 줄']:r);
  const o={
   s1:{how:['AIEDAP에 로그인해 내 지도안과 성찰 보고서를 열어 둡니다','오른쪽 위 ‘🪑 모둠·이름’을 눌러 원탁 번호(1~11)와 이름을 적어요','활동지는 이 기기에 자동 저장되고, ‘📤 보드에 올리기’를 누르면 모둠과 나눠요','막히면 ‘🤖 리디에게 묻기’ — 내 지도안을 붙여 넣거나 캡처해서 물어봐요']},
   s2:{lead:'같은 과제, 다른 과정. 두 학생 중 누구에게 더 높은 점수를 주시겠어요? 아래 보드에서 투표하고 이유를 한 줄 남겨 주세요.',share:null},
   s4:{how:['AIEDAP에 올린 내 지도안을 옆에 띄워요','평가하고 싶은 학습을 2~3개만 고릅니다','각 학습의 증거를 짝지어 적어요','‘더 확인하고 싶은 증거 한 가지’를 아래 보드에 올려요'],share:null},
   s7:{share:null},
   s14:{how:['반영할 피드백 고르기 (W6)','AIEDAP 지도안 수정·최종 저장','수료 제출: 공유마당 공유 + 대시보드 제출','한 문장 완성 (W7) → 아래 보드에 올리기'],share:null},
   s15:{share:null,time:'16:00 · 10분'},
   s16:{time:'16:10 · 15분'},
   s17:{time:'16:35 · 20분'},
   s18:{share:null,time:'16:55 · 35분'},
   s19:{time:'17:30 · 30분',blocks:[]}
  };
  S.forEach(s=>{if(o[s.id])Object.assign(s,o[s.id]);});
  const s5=byId('s5'); if(s5) s5.blocks=[{k:'gamecall'}].concat(s5.blocks||[]);
  const s12=byId('s12'); if(s12) s12.blocks=(s12.blocks||[]).concat([{k:'spincall',t:'팀 나누기 · 발표 순서 정하기'}]);
  if(MID==='m5'){
    const i=S.findIndex(s=>s.id==='s16');
    S.splice(i+1,0,{id:'s16g',part:5,short:'성장 인생게임 (체험)',time:'16:25 · 10분',title:'게임으로 먼저 걸어 보는 나의 성장 경로',img:'game_life',
      lead:'주사위를 굴려 입문가(Lv.1)에서 개척자(Lv.6)까지 올라가 봐요. 칸마다 실제로 해 볼 수 있는 전문성 개발 활동이 나오고, 모은 성장 카드는 바로 다음 ‘나의 성장 계획’의 재료가 됩니다.',
      how:['혼자 하거나, 원탁 한 화면에 2~4명이 함께 해요','칸에 멈추면 카드를 읽고 “나라면 언제 해 볼까?” 한마디','게임이 끝나면 모은 카드가 모둠 보드에 올라가요','마음에 드는 카드 1장을 W8 계획에 옮겨 적어요'],
      blocks:[{k:'life'}]});
    const s19=byId('s19');
    s19.blocks=[{k:'finale'}];
    S.forEach((s,j)=>{s.num=j+1;});
  }
})();

/* ───────── 저장 ───────── */
const KEY='aiedap-live-v1';
let store={};
try{store=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){store={};}
store.v=store.v||{};store.t=store.t||{};store.done=store.done||{};store.sent=store.sent||{};store.local=store.local||[];store.aiHist=store.aiHist||[];
if(!store.dev) store.dev='d'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
let saveT=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}
save();
const me=()=>store.me||null;
const mineD=()=>store.dev.slice(-6);
function stamp(){const d=new Date();return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');}
const v=k=>store.v[k]||'';

/* ───────── API ───────── */
async function apiGet(q){
  const r=await fetch(API+'?'+new URLSearchParams(q).toString(),{cache:'no-store'});
  return r.json();
}
async function apiPost(body){
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
  return r.json();
}
let SERVER={ok:false,ai:false,checked:false};
async function ping(){
  if(!ONLINE){SERVER={ok:false,ai:false,checked:true};drawMe();return;}
  try{const j=await apiGet({});SERVER={ok:!!j.ok,ai:!!j.ai,checked:true};}catch(e){SERVER={ok:false,ai:false,checked:true};}
  drawMe();
  if(/^#ai/.test(location.hash)&&!SERVER.ai)render(true);
}
function localList(q){
  const seen={};const out=[];
  for(let i=store.local.length-1;i>=0;i--){const r=store.local[i];
    if(q.activity&&r.a!==q.activity)continue; if(r.m!==MID)continue;
    const k=r.d+'|'+r.a; if(seen[k])continue; seen[k]=1;
    if(q.group&&String(r.g)!==String(q.group))continue; out.push(r);}
  return out;
}
async function submit(a,summary,data,choice){
  const m=me(); if(!m){joinModal(()=>submit(a,summary,data,choice));return false;}
  const row={t:stamp(),a:a,g:String(m.g),n:m.n,d:mineD(),s:summary,c:choice||'',data:data||{},m:MID};
  store.sent[a]=stamp(); save();
  if(!ONLINE){store.local.push(row);save();toast('이 기기에 올렸어요 (체험 모드)');refreshAll();return true;}
  try{
    const j=await apiPost({action:'submit',module:MID,activity:a,group:m.g,name:m.n,device:store.dev,summary:summary,choice:choice||'',data:data||{}});
    if(!j.ok) throw new Error(j.error||'실패');
    toast('보드에 올렸어요 🎉'); refreshAll(); return true;
  }catch(e){toast('올리지 못했어요. 잠시 뒤 다시 눌러 주세요');return false;}
}
async function postScore(game,score,ms,detail){
  const m=me()||{g:'',n:'익명'};
  if(!ONLINE){store.local.push({m:MID,a:'score:'+game,g:m.g,n:m.n,d:mineD(),s:detail,score:score,ms:ms,t:stamp()});save();refreshAll();return;}
  try{await apiPost({action:'score',game:game,group:m.g,name:m.n,device:store.dev,score:score,ms:ms||0,detail:detail||''});refreshAll();}catch(e){}
}

/* ───────── 화면 밝기 · 도우미 ───────── */
window.toggleTheme=function(){
  const r=document.documentElement;
  const dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme=dark?'light':'dark';
  try{localStorage.setItem('aiedap-theme',r.dataset.theme);}catch(e){}
};
try{const t=localStorage.getItem('aiedap-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}
function toast(m){const t=$('#toast');t.textContent=m||'복사했어요';t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),1900);}
window.toast=toast;
function copy(text,msg){
  const ok=()=>toast(msg||'복사했어요');
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(ok,fallback);}else fallback();
  function fallback(){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok();}catch(e){toast('복사하지 못했어요');}ta.remove();}
}
window.zoom=function(src){$('#lbi').src=src;$('#lb').classList.add('on');};
function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}

/* ───────── 모달 ───────── */
let modalClose=null;
function modal(html,cls,onClose){
  closeModal();
  const m=document.createElement('div');m.className='modal';m.id='modal';
  m.innerHTML=`<div class="mbox ${cls||''}" role="dialog" aria-modal="true"><button class="mx" aria-label="닫기">✕</button>${html}</div>`;
  m.addEventListener('click',e=>{if(e.target===m||e.target.closest('.mx'))closeModal();});
  document.body.appendChild(m);requestAnimationFrame(()=>m.classList.add('on'));
  modalClose=onClose||null;return m;
}
function closeModal(){const m=$('#modal');if(m){m.remove();}if(modalClose){const f=modalClose;modalClose=null;try{f();}catch(e){}}}
window.closeModal=closeModal;

/* ───────── 모둠·이름 등록 ───────── */
function drawMe(){
  const b=$('#meBtn'); if(!b)return;
  const m=me();
  const dot=ONLINE?(SERVER.ok?'<i class="on" title="보드 연결됨"></i>':(SERVER.checked?'<i class="off" title="연결 확인 중 · 체험 모드"></i>':'<i></i>')):'<i class="off" title="체험 모드"></i>';
  b.innerHTML=m?`${dot}<span class="gb" style="--g:${gcol(m.g)}">${esc(m.g)}</span>${esc(m.n)}`:`${dot}🪑 모둠·이름 등록`;
}
function joinModal(after){
  const m=me()||{};
  const grid=Array.from({length:GROUPS},(_,i)=>i+1).map(g=>`<button class="gpick ${String(m.g)===String(g)?'on':''}" data-g="${g}" style="--g:${gcol(g)}">${g}<small>모둠</small></button>`).join('');
  const el=modal(`<div class="join"><img src="${art('redi_wave')}" alt=""><h2>몇 번 원탁에 앉으셨나요?</h2><p>원탁 번호(1~11)와 이름을 적으면 활동지와 한 줄 생각을 모둠·반 전체와 나눌 수 있어요. 이름은 보드에만 보이고, 언제든 바꿀 수 있어요.</p>
   <div class="ggrid">${grid}</div>
   <label class="nm">이름 <input id="jName" maxlength="20" placeholder="예) 김리디" value="${esc(m.n||'')}"></label>
   <div class="btns" style="justify-content:center"><button class="b r" id="jGo">이렇게 참여할게요</button><button class="b w" id="jLater">나중에</button></div>
   ${ONLINE?'':'<p class="mini">지금은 체험 모드예요. 적은 내용은 이 기기에만 저장됩니다.</p>'}</div>`,'narrow');
  let g=m.g||'';
  $$('.gpick',el).forEach(b=>b.onclick=()=>{g=b.dataset.g;$$('.gpick',el).forEach(x=>x.classList.toggle('on',x===b));$('#jName').focus();});
  $('#jLater',el).onclick=()=>{store.skipJoin=1;save();closeModal();};
  const go=()=>{
    const n=$('#jName').value.trim();
    if(!g){toast('원탁 번호를 골라 주세요');return;}
    if(!n){toast('이름을 적어 주세요');$('#jName').focus();return;}
    store.me={g:String(g),n:n};save();closeModal();drawMe();toast(g+'모둠 '+n+' 선생님, 반가워요!');
    if(ONLINE) apiPost({action:'join',module:MID,group:g,name:n,device:store.dev}).catch(()=>{});
    if(typeof after==='function') after(); else render();
  };
  $('#jGo',el).onclick=go;
  $('#jName',el).addEventListener('keydown',e=>{if(e.key==='Enter')go();});
}
window.joinModal=joinModal;

/* ───────── 사이드바 ───────── */
function buildSide(){
  $('#brandImg').src=art(M.brand);
  $('#brandT').textContent=M.title;
  $('#brandS').textContent=M.sub;
  let h=`<a href="#home" data-r="home">🏠 처음 화면 · 오늘의 흐름</a>`;
  M.parts.forEach(k=>{
    const p=P[k];
    h+=`<div class="pt">${esc(p.k)}<span>${esc(p.time)}</span></div>`;
    S.filter(s=>s.part==k).forEach(s=>{h+=`<a href="#${s.id}" data-r="${s.id}">${s.num}. ${esc(s.short)}${store.done[s.id]?'<span class="ck">✔</span>':''}</a>`;});
  });
  $('#nav').innerHTML=h;
  const tools=[
   ['#ai','🤖','리디에게 묻기 (AI)',MID==='m4'?'내 지도안을 렌즈로 함께 보기':'나의 성장 계획 코치'],
   ['#'+M.game.route,M.game.ic,M.game.n,M.game.d],
   ['#roulette','🎡','구슬 룰렛','발표 순서 · 모둠 뽑기'],
   ['#sheets','📝','내 활동지 모음','자동 저장 · 보드에 올리기'],
   ['#board','📌','우리 반 보드','모둠별 생각 모아 보기'],
   ['#timer','⏱️','공유 타이머',MID==='m4'?'7분 × 4명 · 큰 화면':'2분씩 · 큰 화면']
  ];
  if(MID==='m4'){tools.push(['#lens','🌈','여섯 렌즈 한눈에','모듈 1 상기용'],['#case','🌿','강사 사례','우리 동네 생물 탐정']);}
  tools.push(['#live','📺','큰 화면 (강사용)','실시간 제출 현황']);
  $('#tools').innerHTML=tools.map(t=>`<a href="${t[0]}" data-r="${t[0].slice(1)}"><span class="ic">${t[1]}</span><span>${esc(t[2])}<small>${esc(t[3])}</small></span></a>`).join('');
  const deck=`<a href="${M.deck.pptx}" download><span class="ic">📥</span><span>강의 자료 PPT 받기<small>${esc(M.deck.t)}</small></span></a>`+
   `<a href="${M.deck.gs}" target="_blank" rel="noopener"><span class="ic">🖥️</span><span>강의 자료 보기 ↗<small>Google 슬라이드</small></span></a>`;
  $('#links').innerHTML=deck+window.LINKS.filter(t=>t[0]!=='PADLET').map(t=>`<a href="${t[0]}" target="_blank" rel="noopener"><span class="ic">${t[1]}</span><span>${esc(t[2])} ↗<small>${esc(t[3])}</small></span></a>`).join('')+
   `<a href="${M.other.href}" class="swap"><span class="ic">➡️</span><span>${esc(M.other.n)}<small>${esc(M.other.d)}</small></span></a>`;
}
function markNav(r){
  $$('.nav a,.ext a').forEach(a=>a.classList.toggle('on',a.dataset.r===r));
  $('.side').classList.remove('open');
}

/* ───────── 처음 화면 ───────── */
function home(){
  const tl=M.parts.map(k=>{const p=P[k];const first=S.find(s=>s.part==k);
    const tag={1:'평가',2:'성찰',3:'재설계',4:'환류',5:'성장'}[k];
    const brk=k==2?'<div class="brk">🍱 점심 13:00 – 14:00</div>':(k==5?'<div class="brk">🔔 18:00 정시 종료</div>':'');
    return `<a href="#${first.id}" style="--c:${p.c}"><div class="t">${esc(p.time)}</div><h4>${esc(p.k)}</h4><p>${esc(p.t)}</p><span class="tag">${tag}</span>${brk}</a>`;}).join('');
  const parts=M.parts.map(k=>{const p=P[k],st=S.filter(s=>s.part==k);
    return `<div class="card part"><img src="${art(p.img+'_s')}" alt="" loading="lazy" onerror="this.style.visibility='hidden'" onclick="zoom('${art(p.img)}')" style="cursor:zoom-in"><div class="in"><div class="k">${esc(p.k)} · ${esc(p.time)}</div><h3>${esc(p.t)}</h3><ol>${st.map(s=>`<li><a href="#${s.id}"><b>${s.num}</b>${esc(s.short)}${store.done[s.id]?' ✔':''}</a></li>`).join('')}</ol></div></div>`;}).join('');
  const m=me();
  $('#main').innerHTML=`
  <section class="hero"><img class="bg" src="${art(M.img)}" alt="" onerror="this.style.display='none'"><div class="shade"></div>
   <div class="tx"><span class="pill">2026 AIEDAP 마스터교원 신규연수 · 경남 초등 1회차 · AI 기반 창작</span>
   <h1>${M.h1}</h1>
   <p>${esc(M.sub)}</p>${M.lines.map(x=>`<p>${esc(x)}</p>`).join('')}
   <p style="color:#b9c6f2;font-size:14px;margin-top:10px">${esc(M.when)} · 해운대 센트럴 호텔 3층 대연회장 · 원탁 11모둠 · 강사 최일훈</p>
   <div class="btns"><button class="b y" onclick="joinModal()">${m?`🪑 ${esc(m.g)}모둠 · ${esc(m.n)} (바꾸기)`:'🪑 모둠·이름 등록하기'}</button><a class="b g" href="#${S[0].id}">${MID==='m4'?'1차시부터 시작 →':'모듈 5 시작 →'}</a><a class="b g" href="#ai">🤖 리디에게 묻기</a></div></div></section>

  ${MID==='m4'?`<div class="notice"><b>📌 수료 제출 · 꼭 확인</b>다시 설계한 지도안을 <b>두 곳 모두</b> 올려야 수료로 인정돼요. ① AIEDAP 공유마당에 공유 ② 나의 역량 분석 대시보드 › 수료 제출물 제출 › 「AI융합수업설계지도안 제출」 <a href="#s14">4차시에서 함께 해요 →</a></div>`:
   `<div class="notice"><b>📌 먼저 확인</b>모듈 4에서 다시 설계한 지도안을 ① 공유마당에 공유하고 ② 대시보드 › 수료 제출물 › 「AI융합수업설계지도안 제출」에 올렸나요? 마지막 활동에서 사후 역량 진단 코드와 만족도 조사를 안내해요.</div>`}

  <h2 class="sec">오늘의 흐름<small>${MID==='m4'?'평가 → 성찰 → 재설계 → 환류':'이해 → 진단 → 계획 → 공유'}</small></h2>
  <div class="tl" style="grid-template-columns:repeat(${M.parts.length},1fr)">${tl}</div>

  <h2 class="sec">이 아카이브로 이렇게 함께해요</h2>
  <div class="grid g4 how4">
   <button class="card pad hcard" onclick="joinModal()"><span>🪑</span><b>① 모둠·이름 등록</b><p>원탁 번호 1~11과 이름. 보드에서 우리 모둠끼리 모여 보여요.</p></button>
   <a class="card pad hcard" href="#sheets"><span>📝</span><b>② 활동지에 적기</b><p>적는 즉시 이 기기에 저장. ‘📤 보드에 올리기’로 모둠과 나눠요.</p></a>
   <a class="card pad hcard" href="#board"><span>📌</span><b>③ 보드에서 나누기</b><p>모둠별 생각이 실시간으로 모이고, 🎡 룰렛으로 발표자를 뽑아요.</p></a>
   <a class="card pad hcard" href="#ai"><span>🤖</span><b>④ 리디에게 묻기</b><p>${MID==='m4'?'내 지도안을 붙여 넣거나 캡처하면 렌즈로 함께 봐 줘요.':'내 역량과 목표를 적으면 성장 계획을 함께 짜 줘요.'}</p></a>
  </div>

  <h2 class="sec">${MID==='m4'?'네 장면':'오늘의 장면'}<small>장면을 누르면 활동으로 바로 갑니다</small></h2>
  <div class="grid ${MID==='m4'?'g4':'g2'}">${parts}${MID==='m5'?gameCard():''}</div>

  <h2 class="sec">${MID==='m4'?'쉬어 가며 한 판<small>모둠 대항 점수는 큰 화면에 모여요</small>':'함께 쓰는 도구'}</h2>
  <div class="grid g2">${MID==='m4'?gameCard(1):`<a class="card gcard big" href="#ai"><img src="${art('redi_laptop')}" alt=""><div class="in"><span class="k">🤖 AI 도우미</span><b>리디 · 성장 계획 코치</b><p>대시보드에서 본 내 수준과 목표를 적으면 G역량과 이어지는 단기·장기 계획 표를 함께 짜 줘요.</p></div></a>`}${spinCard()}</div>

  <h2 class="sec">강의 자료</h2>
  <div class="deck card"><img src="${art(M.img+'_s')}" alt="" onerror="this.src='${art(M.img)}'"><div><b>${esc(M.deck.t)}</b><p>강의 화면을 다시 보고 싶을 때 내려받거나 바로 열어 보세요.</p>
   <div class="btns"><a class="b r" href="${M.deck.pptx}" download>📥 PPT 내려받기</a><a class="b w" href="${M.deck.gs}" target="_blank" rel="noopener">🖥️ Google 슬라이드로 보기 ↗</a><a class="b w" href="${M.other.href}">➡️ ${esc(M.other.n)}</a></div></div></div>
  <div class="foot">강사 최일훈 (명진초) · 표준 교안: 2026 AIEDAP 마스터교원 신규연수 ${esc(M.name)} · 그림: ChatGPT로 만든 이미지${MID==='m4'?' · <a href="#helper">보조강사 진행 안내</a>':''}</div>`;
}
function gameCard(big){
  return `<a class="card gcard ${big?'big':''}" href="#${M.game.route}"><img src="${art(M.game.img)}" alt="" onerror="this.src='${art('redi_idea')}'"><div class="in"><span class="k">${M.game.ic} 체험 게임</span><b>${esc(M.game.n)}</b><p>${esc(M.game.d)}</p></div></a>`;
}
function spinCard(){
  return `<a class="card gcard big" href="#roulette"><img src="${art('game_roulette')}" alt="" onerror="this.src='${art('redi_thumbs')}'"><div class="in"><span class="k">🎡 함께 나누기</span><b>구슬 룰렛</b><p>우리 모둠 이름을 넣고 구슬을 굴려 발표 순서와 발표자를 정해요.</p></div></a>`;
}

/* ───────── 블록 ───────── */
function block(b){
  if(b.k==='html') return b.h;
  if(b.k==='cmp') return `${b.t?`<h2 class="sec">${esc(b.t)}</h2>`:''}<div class="cmp"><div class="a"><h4>${b.a[0]}</h4><ul>${b.a.slice(1).map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="bb"><h4>${b.b[0]}</h4><ul>${b.b.slice(1).map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`;
  if(b.k==='case') return `<div class="case"><div class="h"><img src="${art('redi_magnifier')}" alt="">🌿 ${esc(b.t)} <a href="#case" style="margin-left:auto;font-size:13px;color:var(--mint)">사례 전체 보기 →</a></div>${b.h}</div>`;
  if(b.k==='lenses') return `<div class="lenses">${L.map(l=>`<div class="lens" style="--c:${l.c}"><h5>${l.n}</h5><p>${esc(l.q)}</p></div>`).join('')}</div>`;
  if(b.k==='xo') return `<h2 class="sec">${esc(b.t)}</h2><div class="xo"><div class="x"><b>✕ 이렇게 쓰기보다</b>${b.x.map(esc).join('<br>')}</div><div class="o"><b>○ 이렇게 장면으로</b>${b.o.map(esc).join('<br><br>')}</div></div>`;
  if(b.k==='gamecall') return `<a class="warm" href="#game"><img src="${art('game_lens')}" alt="" onerror="this.src='${art('redi_magnifier')}'"><div><b>🔍 3분 몸풀기 · 렌즈 탐정 게임</b><p>어제 배운 여섯 렌즈, 아직 손에 붙어 있나요? 수업 장면 카드를 보고 어느 렌즈인지 빠르게 맞혀 보세요. 모둠 점수는 큰 화면에 모여요.</p><span class="b y sm">게임 시작 →</span></div></a>`;
  if(b.k==='spincall') return `<div class="warm"><img src="${art('game_roulette')}" alt="" onerror="this.src='${art('redi_thumbs')}'"><div><b>🎡 ${esc(b.t)}</b><p>우리 모둠 이름으로 구슬을 굴려 두 팀(4명 + 3~4명)을 나누거나 발표 순서를 정해요.</p><button class="b y sm" onclick="spinGroup()">우리 모둠 룰렛 돌리기</button> <a class="b w sm" href="#roulette">룰렛 화면 크게 →</a></div></div>`;
  if(b.k==='life') return `<div class="card lifebox"><div id="lifeBox" class="gamebox"></div></div><div class="btns"><a class="b w sm" href="#life">게임만 크게 보기 →</a></div>${wallBox('p_life','group',{title:'우리 모둠이 모은 성장 카드',kind:'cards'})}`;
  if(b.k==='finale') return finale();
  return '';
}

/* ───────── 활동지 ───────── */
function sheetHTML(id){
  const s=W[id]; let body='';
  if(s.type==='rows'){
    body=s.rows.map(r=>`<div class="row"><label>${esc(r[1])}<small>${esc(r[2])}</small></label><textarea data-k="${id}.${r[0]}" rows="2" placeholder="${esc(r[2]||'')}">${esc(v(id+'.'+r[0]))}</textarea></div>`).join('');
  }else if(s.type==='lens'){
    body=`<div class="hd"><span>렌즈</span><span>효과적이었던 점 (장면으로)</span><span>다시 생각해볼 점 (장면으로)</span></div>`+
     L.map(l=>`<div class="lensrow" style="--c:${l.c}"><div class="nm">${l.n}<small style="display:block;font-weight:400;color:var(--sub);font-size:12px;line-height:1.4">${esc(l.q)}</small></div><textarea data-k="${id}.${l.id}_g" rows="3">${esc(v(id+'.'+l.id+'_g'))}</textarea><textarea data-k="${id}.${l.id}_r" rows="3">${esc(v(id+'.'+l.id+'_r'))}</textarea></div>`).join('');
  }else if(s.type==='sentence'){
    body=`<div class="sentence">${s.parts[0]} `+s.keys.map((k,i)=>`<input data-k="${id}.${k}" value="${esc(v(id+'.'+k))}" placeholder="${['예) 결과물 완성에 집중','예) 수정 이유를 설명','예) 선택·수정 기록'][i]}"> ${s.parts[i+1]}`).join(' ')+`</div>`;
  }
  const sent=store.sent[id];
  return `<div class="card ws" data-sheet="${id}"><div class="top"><b class="wid">${id}</b><h4>${esc(s.t)}</h4><span class="sv" id="sv-${id}">${store.t[id]?'저장됨 '+store.t[id]:'적으면 자동 저장'}</span></div>${body}
  <div class="acts"><button class="b r sm" onclick="sendSheet('${id}')">📤 보드에 올리기${sent?` <small>(${sent} 올림 · 다시 올리면 바뀜)</small>`:''}</button><button class="b w sm" onclick="peer('${id}',this)">👀 우리 모둠 ${id} 보기</button><button class="b w sm" onclick="copySheet('${id}')">📋 복사</button></div>
  <div class="peer" id="peer-${id}"></div></div>`;
}
function sheetText(id,noHead){
  const s=W[id]; let t=noHead?'':`[${id}] ${s.t}\n`;
  if(s.type==='rows') s.rows.forEach(r=>{const x=v(id+'.'+r[0]);if(x||!noHead)t+=`- ${r[1]}: ${x}\n`;});
  else if(s.type==='lens') L.forEach(l=>{const g=v(id+'.'+l.id+'_g'),r=v(id+'.'+l.id+'_r');if(g||r||!noHead)t+=`- ${l.n} | 효과적: ${g} | 다시 생각: ${r}\n`;});
  else if(s.type==='sentence') t+=sentenceOf(id)+'\n';
  return t;
}
function sentenceOf(id){const s=W[id];return s.parts[0]+' '+s.keys.map((k,i)=>(v(id+'.'+k)||'____')+' '+s.parts[i+1]).join(' ');}
function filled(id){const s=W[id];return Object.keys(store.v).some(k=>k.indexOf(id+'.')===0&&String(store.v[k]).trim());}
window.copySheet=id=>copy(sheetText(id),id+' 활동지를 복사했어요');
window.sendSheet=async function(id){
  if(!filled(id)){toast('먼저 활동지를 적어 주세요');return;}
  const data={};Object.keys(store.v).forEach(k=>{if(k.indexOf(id+'.')===0)data[k.slice(id.length+1)]=store.v[k];});
  const ok=await submit(id,sheetText(id,true).trim(),data,'');
  if(ok){const p=$('#peer-'+id);if(p&&!p.innerHTML)peer(id);render(true);}
};
window.peer=function(id,btn){
  const p=$('#peer-'+id); if(!p)return;
  if(p.innerHTML&&btn){p.innerHTML='';return;}
  p.innerHTML=wallBox(id,'group',{title:'우리 모둠 '+id,kind:'sheet',full:1});
  refreshAll();
};
window.copyAll=()=>copy(M.sheets.map(id=>sheetText(id)).join('\n'),'활동지 전체를 복사했어요');
window.downloadAll=()=>download(`${M.name}_내활동지.txt`,`${M.title} — ${M.name} 활동지 (${new Date().toLocaleString('ko-KR')})\n\n`+M.sheets.map(id=>sheetText(id)).join('\n'));
window.clearAll=function(){
  if(!confirm('이 기기에 저장된 '+M.name+' 활동지 내용을 모두 지울까요?'))return;
  Object.keys(store.v).forEach(k=>{if(M.sheets.indexOf(k.split('.')[0])>=0)delete store.v[k];});save();render();toast('지웠어요');
};
document.addEventListener('input',e=>{
  const k=e.target.dataset&&e.target.dataset.k; if(!k)return;
  store.v[k]=e.target.value; const id=k.split('.')[0];
  store.t[id]=stamp();
  clearTimeout(saveT); saveT=setTimeout(()=>{save();$$('#sv-'+id).forEach(x=>x.textContent='저장됨 '+store.t[id]);},350);
});

/* ───────── 한 줄 보드 (POST) ───────── */
function postBox(sid){
  const p=POSTS[sid]; if(!p)return '';
  let pre='';
  if(p.from) pre=v(p.from);
  if(p.sentence&&filled(p.sentence)) pre=sentenceOf(p.sentence);
  const opts=p.kind==='vote'?`<div class="opts">${p.opts.map(o=>`<button class="opt" data-c="${esc(o)}" onclick="pickOpt(this)">${esc(o)}</button>`).join('')}</div>`:'';
  const pre2=p.kind==='word'?`<div class="wordq">AX 시대의 교사 전문성은 <input id="pi-${p.a}" maxlength="40" placeholder="${esc(p.ph)}" value="${esc(store.v['post.'+p.a]||pre)}"> 이다</div>`:
    `<textarea id="pi-${p.a}" rows="2" maxlength="600" placeholder="${esc(p.ph||'')}" data-k="post.${p.a}">${esc(store.v['post.'+p.a]||pre)}</textarea>`;
  return `<div class="postbox card" data-a="${p.a}"><div class="ph"><img src="${art('redi_heart')}" alt=""><div><span class="k">함께 나누기 · ${p.scope==='all'?'반 전체 보드':'모둠 보드'}</span><h3>${esc(p.q)}</h3></div></div>
   ${opts}${pre2}
   <div class="btns" style="margin-top:10px"><button class="b r" onclick="sendPost('${sid}')">📤 보드에 올리기</button>${p.from||p.sentence?`<button class="b w sm" onclick="pullPost('${sid}')">📝 활동지에서 가져오기</button>`:''}${store.sent[p.a]?`<span class="mini">✔ ${store.sent[p.a]}에 올렸어요 · 고쳐서 다시 올리면 바뀌어요</span>`:''}</div>
   ${wallBox(p.a,p.scope,{kind:p.kind||'cards',spin:p.spin})}</div>`;
}
window.pickOpt=function(btn){$$('.opt',btn.parentNode).forEach(x=>x.classList.toggle('on',x===btn));};
window.pullPost=function(sid){const p=POSTS[sid];const el=$('#pi-'+p.a);let x='';if(p.from)x=v(p.from);if(p.sentence)x=filled(p.sentence)?sentenceOf(p.sentence):'';if(!x){toast('활동지에 아직 적은 내용이 없어요');return;}el.value=x;store.v['post.'+p.a]=x;save();};
window.sendPost=async function(sid){
  const p=POSTS[sid]; const el=$('#pi-'+p.a); const txt=(el.value||'').trim();
  let choice='';
  if(p.kind==='vote'){const o=$(`.postbox[data-a="${p.a}"] .opt.on`);if(!o){toast('먼저 학생 A 또는 B를 골라 주세요');return;}choice=o.dataset.c;}
  if(!txt&&!choice){toast('한 줄을 적어 주세요');el.focus();return;}
  store.v['post.'+p.a]=txt;save();
  const ok=await submit(p.a,choice?`[${choice}] ${txt}`:txt,{},choice);
  if(ok) render(true);
};

/* ───────── 보드(wall) ───────── */
function wallBox(a,scope,o){
  o=o||{};
  return `<div class="wall" data-a="${a}" data-scope="${scope||'group'}" data-kind="${o.kind||'cards'}" ${o.full?'data-full="1"':''} ${o.big?'data-big="1"':''}>
   <div class="whead"><b>${esc(o.title||ACT_NAME[a]||a)}</b><span class="wtabs"><button data-s="group" class="${scope!=='all'?'on':''}">우리 모둠</button><button data-s="all" class="${scope==='all'?'on':''}">반 전체</button></span>
   <span class="wcount"></span><button class="b w sm" data-act="spin">🎡 ${esc(o.spin||'룰렛')}</button><button class="b w sm" data-act="re" title="새로 고침">↻</button></div>
   <div class="wbody"><div class="wempty">불러오는 중…</div></div></div>`;
}
document.addEventListener('click',e=>{
  const t=e.target.closest('.wall .wtabs button');
  if(t){const w=t.closest('.wall');w.dataset.scope=t.dataset.s;$$('.wtabs button',w).forEach(x=>x.classList.toggle('on',x===t));loadWall(w);return;}
  const a=e.target.closest('.wall [data-act]');
  if(a){const w=a.closest('.wall');if(a.dataset.act==='re')loadWall(w);else spinFromWall(w);}
});
async function fetchRows(a,scope,full){
  const m=me();
  const q={action:'list',module:MID,activity:a};
  if(scope==='group'){if(!m)return {need:true,rows:[]};q.group=m.g;}
  if(full)q.full='1';
  if(!ONLINE) return {rows:localList(q)};
  const j=await apiGet(q); if(!j.ok)throw new Error(j.error); return {rows:j.rows||[]};
}
async function loadWall(w){
  const body=$('.wbody',w); const a=w.dataset.a, scope=w.dataset.scope, kind=w.dataset.kind, full=w.dataset.full==='1';
  let res;
  try{res=await fetchRows(a,scope,full);}catch(e){if(!w._rows)body.innerHTML='<div class="wempty">보드를 불러오지 못했어요. 잠시 뒤 ↻ 를 눌러 주세요.</div>';return;}
  if(res.need){body.innerHTML=`<div class="wempty"><button class="b y sm" onclick="joinModal()">🪑 모둠·이름 등록</button> 을 하면 우리 모둠 보드가 보여요.</div>`;$('.wcount',w).textContent='';return;}
  const rows=res.rows; w._rows=rows;
  $('.wcount',w).textContent=rows.length?rows.length+'명':'';
  if(!rows.length){body.innerHTML=`<div class="wempty">${scope==='group'?'우리 모둠에서 아직 아무도 올리지 않았어요. 첫 번째로 올려 주세요!':'아직 올라온 생각이 없어요.'}</div>`;return;}
  const sorted=rows.slice().sort((x,y)=>scope==='all'?(Number(x.g)-Number(y.g))||String(x.t).localeCompare(String(y.t)):String(x.t).localeCompare(String(y.t)));
  let h='';
  if(kind==='vote'){
    const opts=(POSTS.s2&&POSTS.s2.opts)||[];const cnt={};rows.forEach(r=>{cnt[r.c]=(cnt[r.c]||0)+1;});const tot=rows.length||1;
    h+=`<div class="tally">${opts.map((o,i)=>`<div class="tb"><span>${esc(o)}</span><div class="tbar"><i style="width:${Math.round(100*(cnt[o]||0)/tot)}%;background:${i?'var(--l2)':'var(--l1)'}"></i></div><b>${cnt[o]||0}표</b></div>`).join('')}</div>`;
  }
  if(kind==='word'){
    h+=`<div class="words">${sorted.map((r,i)=>`<div class="word ${r.d===mineD()?'mine':''}" style="--g:${gcol(r.g)};--r:${(i%5-2)*1.2}deg"><small>AX 시대의 교사 전문성은</small><b>${esc(r.s)}</b><small>이다 — ${esc(r.g)}모둠 ${esc(r.n)}</small></div>`).join('')}</div>`;
  }else{
    h+=`<div class="wcards ${kind==='sheet'||w.dataset.big?'wide':''}">${sorted.map(r=>`<div class="wc ${r.d===mineD()?'mine':''}" style="--g:${gcol(r.g)}"><div class="wh"><span class="gb" style="--g:${gcol(r.g)}">${esc(r.g)}</span><b>${esc(r.n)}</b>${r.c&&kind==='vote'?`<em>${esc(r.c)}</em>`:''}<small>${esc(r.t)}</small></div><div class="wt">${esc(kind==='vote'?String(r.s).replace(/^\[[^\]]*\]\s*/,''):r.s)}</div></div>`).join('')}</div>`;
  }
  body.innerHTML=h;
}
let poll=null;
function refreshAll(){
  $$('.wall').forEach(loadWall);
  $$('[data-live="stats"]').forEach(loadStats);
  $$('[data-live="scores"]').forEach(loadScores);
}
function startPoll(){
  clearInterval(poll);
  if(!$('.wall,[data-live]'))return;
  refreshAll();
  const every=$('#liveBoard')?12000:20000;
  poll=setInterval(()=>{if(!document.hidden)refreshAll();},every+Math.round(Math.random()*3000));
}

/* ───────── 룰렛 ───────── */
let spinInst=null;
function destroySpin(){try{spinInst&&spinInst.destroy&&spinInst.destroy();}catch(e){}spinInst=null;}
function mountRoulette(box,names,title,mode){
  destroySpin();
  if(!(window.AG&&AG.games&&AG.games.roulette)){box.innerHTML='<div class="wempty">룰렛을 불러오지 못했어요. 새로 고침해 주세요.</div>';return;}
  box.innerHTML='';
  spinInst=AG.games.roulette(box,{names:names,title:title||'발표자 뽑기',mode:mode||'first',banner:false,onPick:n=>{toast('🎉 '+n+'!');}});
}
function namesPrompt(names,title,cb){
  const el=modal(`<div class="spinsetup"><h2>🎡 ${esc(title)}</h2><p>구슬에 들어갈 이름을 한 줄에 하나씩 적어 주세요. (2명 이상)</p><textarea id="spNames" rows="8">${esc((names||[]).join('\n'))}</textarea><div class="btns"><button class="b r" id="spGo">구슬 굴리기</button></div></div>`,'narrow');
  $('#spGo',el).onclick=()=>{const n=$('#spNames').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean);if(n.length<2){toast('이름을 두 개 이상 적어 주세요');return;}cb(n);};
}
function spinModal(names,title){
  const go=n=>{const el=modal(`<div class="spinwrap"><div id="spinBox" class="gamebox"></div></div>`,'wide',destroySpin);mountRoulette($('#spinBox',el),n,title,'first');};
  if(!names||names.length<2) namesPrompt(names,title,go); else go(names);
}
async function groupNames(){
  const m=me(); if(!m)return [];
  let names=[];
  try{
    if(ONLINE){const j=await apiGet({action:'members',group:m.g});names=(j.members||[]).map(x=>x.n);}
    else names=[m.n];
  }catch(e){}
  if(names.indexOf(m.n)<0)names.push(m.n);
  return Array.from(new Set(names.filter(Boolean)));
}
window.spinGroup=async function(){
  if(!me()){joinModal(()=>spinGroup());return;}
  const n=await groupNames();
  spinModal(n,me().g+'모둠 순서 정하기');
};
function spinFromWall(w){
  const rows=w._rows||[];
  let names=rows.map(r=>w.dataset.scope==='all'?`${r.n} (${r.g}모둠)`:r.n);
  names=Array.from(new Set(names));
  spinModal(names,'보드에 올린 사람 중에서 뽑기');
}
function roulettePage(){
  const m=me();
  $('#main').innerHTML=`${head('구슬 룰렛','함께 나누기','구슬을 굴려 순서와 발표자를 정해요','이름을 넣고 구슬을 떨어뜨리면 핀에 부딪히며 굴러가요. 처음 도착한 구슬(또는 마지막 구슬)이 뽑혀요. 원탁 한 화면에 띄워 함께 보면 더 재밌어요.','game_roulette')}
   <div class="card pad spinsrc"><b>누구를 넣을까요?</b>
    <div class="btns"><button class="b y sm" data-src="group">🪑 우리 모둠 등록자</button><button class="b w sm" data-src="all">🏫 반 전체 등록자</button><button class="b w sm" data-src="groups">1~11 모둠 번호</button><button class="b w sm" data-src="lens">여섯 렌즈</button><button class="b w sm" data-src="clear">직접 입력</button></div>
    <textarea id="rNames" rows="4" placeholder="한 줄에 하나씩 · 쉼표로 나눠도 돼요"></textarea>
    <div class="btns"><label class="mini">제목 <input id="rTitle" value="${m?esc(m.g)+'모둠 발표 순서':'발표자 뽑기'}" style="width:220px"></label><label class="mini"><input type="radio" name="rMode" value="first" checked> 1등 도착이 당첨</label><label class="mini"><input type="radio" name="rMode" value="last"> 꼴찌가 당첨</label><button class="b r" id="rGo">구슬 굴리기 🎡</button></div></div>
   <div class="card spinpage"><div id="rBox" class="gamebox"></div></div>`;
  const setNames=a=>{$('#rNames').value=a.join('\n');};
  $$('.spinsrc [data-src]').forEach(b=>b.onclick=async()=>{
    const s=b.dataset.src;
    if(s==='group'){if(!me()){joinModal(()=>render());return;}setNames(await groupNames());$('#rTitle').value=me().g+'모둠 발표 순서';}
    else if(s==='all'){try{const j=ONLINE?await apiGet({action:'members'}):{members:me()?[{n:me().n,g:me().g}]:[]};setNames((j.members||[]).map(x=>`${x.n} (${x.g}모둠)`));$('#rTitle').value='반 전체 발표자';}catch(e){toast('불러오지 못했어요');}}
    else if(s==='groups'){setNames(Array.from({length:GROUPS},(_,i)=>(i+1)+'모둠'));$('#rTitle').value='발표 모둠 뽑기';}
    else if(s==='lens'){setNames(L.map(l=>l.n+' 렌즈'));$('#rTitle').value='오늘 집중할 렌즈';}
    else setNames([]);
  });
  $('#rGo').onclick=()=>{
    const n=$('#rNames').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean);
    if(n.length<2){toast('이름을 두 개 이상 넣어 주세요');return;}
    mountRoulette($('#rBox'),n,$('#rTitle').value,($('input[name=rMode]:checked')||{}).value);
    $('#rBox').scrollIntoView({behavior:'smooth',block:'start'});
  };
  if(m){groupNames().then(n=>{if(!$('#rNames').value)setNames(n);});}
}

/* ───────── 게임 ───────── */
let gameInst=null;
function destroyGame(){try{gameInst&&gameInst.destroy&&gameInst.destroy();}catch(e){}gameInst=null;}
function noGames(box){box.innerHTML='<div class="wempty">게임을 불러오지 못했어요. 새로 고침해 주세요.</div>';}
function lensGamePage(){
  $('#main').innerHTML=`${head('렌즈 탐정 게임','체험 게임 · 2차시 몸풀기','장면을 보고, 어느 렌즈일까?','수업 장면 카드가 하나씩 나와요. 여섯 렌즈 중 가장 잘 맞는 렌즈를 골라 보세요. 빠르고 정확할수록 점수가 올라가고, 점수는 모둠 대항으로 큰 화면에 모여요.','game_lens')}
   ${me()?'':'<div class="notice"><b>🪑 점수를 모둠에 보태려면</b><button class="b y sm" onclick="joinModal()">모둠·이름 등록</button></div>'}
   <div class="card"><div id="gBox" class="gamebox"></div></div>
   <h2 class="sec">명예의 전당<small>한 사람의 최고 점수만 · 모둠 평균</small></h2><div data-live="scores" data-game="lens"></div>
   <div class="navbtm"><a class="b w" href="#s5">← 2차시로 돌아가기</a><a class="b r" href="#s6">여섯 렌즈 성찰표 쓰러 가기 →</a></div>`;
  if(!(window.AG&&AG.games&&AG.games.lensQuiz))return noGames($('#gBox'));
  gameInst=AG.games.lensQuiz($('#gBox'),{banner:false,onFinish:r=>{postScore('lens',r.score,r.ms,`${r.correct!=null?r.correct:''}/${r.total||''} 정답`);}});
}
function lifePlayers(){return me()?[me().n]:['나'];}
function mountLife(box){
  destroyGame();
  if(!(window.AG&&AG.games&&AG.games.lifeGame))return noGames(box);
  box.innerHTML='';
  gameInst=AG.games.lifeGame(box,{players:lifePlayers(),banner:false,onFinish:r=>{
    const ps=(r&&r.players)||[];
    const mine=ps.find(p=>me()&&p.name===me().n)||ps[0];
    if(!mine)return;
    const cards=(mine.cards||[]).map(c=>`${c.g?'['+c.g+'] ':''}${c.title}`);
    submit('p_life',`Lv.${mine.lv} ${mine.lvName||''}에 도착 · 모은 카드: ${cards.join(', ')||'없음'}`,{lv:mine.lv,cards:mine.cards||[]},'Lv.'+mine.lv);
    postScore('life',Number(mine.lv)||0,r.ms||0,(mine.cards||[]).length+'장');
  }});
}
function lifePage(){
  $('#main').innerHTML=`${head('성장 인생게임','체험 게임 · 모듈 5','입문가에서 개척자까지, 주사위로 걸어 보기','칸마다 실제로 해 볼 수 있는 전문성 개발 활동이 나와요. 모은 성장 카드는 ‘나의 성장 계획(W8)’의 재료가 됩니다.','game_life')}
   <div class="card lifebox"><div id="lifeBox" class="gamebox"></div></div>
   ${wallBox('p_life','group',{title:'우리 모둠이 모은 성장 카드',kind:'cards'})}
   <h2 class="sec">가장 높이 오른 선생님들</h2><div data-live="scores" data-game="life"></div>
   <div class="navbtm"><a class="b w" href="#s16g">← 활동으로</a><a class="b r" href="#s18">나의 성장 계획 세우기 →</a></div>`;
  mountLife($('#lifeBox'));
}
async function loadScores(el){
  const game=el.dataset.game;
  let rows=[];
  try{
    if(ONLINE){const j=await apiGet({action:'scores',game:game});rows=j.rows||[];}
    else rows=store.local.filter(r=>r.a==='score:'+game).map(r=>({g:r.g,n:r.n,score:r.score,ms:r.ms,detail:r.s,t:r.t})).sort((a,b)=>b.score-a.score);
  }catch(e){return;}
  if(!rows.length){el.innerHTML='<div class="wempty">아직 기록이 없어요. 첫 기록의 주인공이 되어 보세요!</div>';return;}
  const grp={};rows.forEach(r=>{if(!r.g)return;(grp[r.g]=grp[r.g]||[]).push(r.score);});
  const gl=Object.keys(grp).map(g=>({g:g,avg:grp[g].reduce((a,b)=>a+b,0)/grp[g].length,n:grp[g].length})).sort((a,b)=>b.avg-a.avg);
  const unit=game==='life'?'Lv.':'';
  el.innerHTML=`<div class="grid g2"><div class="card pad"><b>🏅 개인</b><ol class="rank">${rows.slice(0,10).map((r,i)=>`<li class="${i<3?'top':''}"><span class="gb" style="--g:${gcol(r.g)}">${esc(r.g||'-')}</span>${esc(r.n)}<b>${unit}${r.score}</b>${r.ms?`<small>${(r.ms/1000).toFixed(1)}초</small>`:''}</li>`).join('')}</ol></div>
   <div class="card pad"><b>🏆 모둠 평균</b><div class="gbars">${gl.map(x=>`<div><span class="gb" style="--g:${gcol(x.g)}">${esc(x.g)}</span><div class="tbar"><i style="width:${Math.max(6,Math.round(100*x.avg/(gl[0].avg||1)))}%;background:${gcol(x.g)}"></i></div><b>${unit}${x.avg.toFixed(game==='life'?1:0)}</b><small>${x.n}명</small></div>`).join('')}</div></div></div>`;
}

/* ───────── 리디 AI 도우미 ───────── */
let aiFiles=[];
let aiBusy=false;
function aiPage(task){
  task=M.ai.indexOf(task)>=0?task:(store.aiTask&&M.ai.indexOf(store.aiTask)>=0?store.aiTask:M.ai[0]);
  store.aiTask=task;save();
  const ready=ONLINE&&SERVER.ai;
  const hist=store.aiHist.filter(h=>h.m===MID);
  $('#main').innerHTML=`${head('리디에게 묻기','AI 도우미 · Gemini','내 수업을 리디와 함께 다시 보기',MID==='m4'?'AIEDAP 지도안·성찰 보고서 내용을 붙여 넣거나, 화면을 캡처해서 넣으면 리디가 오늘 차시의 관점으로 함께 봐 줘요. 판단은 선생님이 하고, 리디는 근거가 될 장면을 짚어 줍니다.':'역량분석 대시보드에서 확인한 내 수준과 강점·보완 역량, 목표를 적으면 G역량과 이어지는 성장 계획을 함께 짜 줘요.','redi_laptop')}
   ${ONLINE?(SERVER.checked&&!SERVER.ai?'<div class="notice warn"><b>⏳ 아직 준비 중</b>강사가 AI 연결을 마치면 바로 쓸 수 있어요. 그동안 자료를 넣어 두세요.</div>':''):'<div class="notice warn"><b>체험 모드</b>지금은 서버에 연결되지 않아 AI 분석을 쓸 수 없어요. 연수 당일에는 바로 쓸 수 있어요.</div>'}
   <div class="aitasks">${M.ai.map(k=>`<button class="atask ${k===task?'on':''}" data-t="${k}"><span>${TASKS[k][2]}</span><b>${TASKS[k][0]}</b><small>${TASKS[k][1]} · ${TASKS[k][3]}</small></button>`).join('')}</div>
   <div class="grid aigrid">
    <div class="card pad">
     <b>① 내 수업 자료</b> <small class="mini">${MID==='m4'?'지도안·성찰 보고서를 복사해 붙여 넣기':'대시보드에서 본 내 수준·강점·보완 역량·목표'}</small>
     <textarea id="aiText" rows="9" placeholder="${MID==='m4'?'예) 5학년 실과 · [6실05-05] · 우리 동네 생물을 소개하는 챗봇 만들기\n학습목표: …\n활동 흐름: 1) … 2) …\n평가: …\n성찰: …':'예) 현재 Lv.3 실천가 · 강점: D 설계 · 보완: F 평가 실행\n목표: 1년 안에 Lv.4 · 학교에서 AI 융합수업 공유 모임 만들기'}">${esc(store.aiText&&store.aiText[MID]||'')}</textarea>
     <div class="drop" id="aiDrop" tabindex="0"><b>② 캡처·사진·PDF 넣기</b><span>여기로 끌어다 놓거나, 누르거나, <kbd>Ctrl</kbd>+<kbd>V</kbd>로 붙여 넣기 · 최대 4개</span><input type="file" id="aiFile" accept="image/*,application/pdf" multiple hidden></div>
     <div class="thumbs" id="aiThumbs"></div>
     <label class="mini chk"><input type="checkbox" id="aiSheets" ${store.aiSheets===false?'':'checked'}> 내 활동지(${M.sheets.join('·')})에 적은 내용도 함께 보내기</label>
     <input id="aiExtra" class="inp" maxlength="300" placeholder="③ 리디에게 덧붙일 말 (선택) · 예) 평가 렌즈를 특히 자세히" value="">
     <div class="btns"><button class="b r big" id="aiGo" ${ready?'':''}>🤖 리디에게 ${TASKS[task][0]} 받기</button></div>
     <p class="mini">🔒 학생 이름·얼굴 등 개인정보는 가리고 넣어 주세요. 보낸 내용은 연수 운영 기록(강사 시트)에 남습니다. AI의 답은 참고 자료이고, 판단은 선생님이 해요.</p>
    </div>
    <div class="card pad airesult" id="aiOut">${hist.length?aiCard(hist[0]):`<div class="aiwait"><img src="${art('redi_magnifier')}" alt=""><p>왼쪽에 자료를 넣고 버튼을 누르면<br>여기에 리디의 분석이 나타나요.</p></div>`}</div>
   </div>
   ${hist.length>1?`<h2 class="sec">이전 답 다시 보기</h2><div class="aihist">${hist.slice(0,6).map((h,i)=>`<button class="b w sm" data-h="${i}">${TASKS[h.task]?TASKS[h.task][2]+' '+TASKS[h.task][0]:''} · ${esc(h.t)}</button>`).join('')}</div>`:''}`;
  $$('.atask').forEach(b=>b.onclick=()=>{location.hash='#ai/'+b.dataset.t;});
  $('#aiText').addEventListener('input',e=>{store.aiText=store.aiText||{};store.aiText[MID]=e.target.value;clearTimeout(saveT);saveT=setTimeout(save,400);});
  $('#aiSheets').onchange=e=>{store.aiSheets=e.target.checked;save();};
  const drop=$('#aiDrop'),fi=$('#aiFile');
  drop.onclick=()=>fi.click();
  drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')fi.click();};
  fi.onchange=()=>{addFiles(fi.files);fi.value='';};
  drop.ondragover=e=>{e.preventDefault();drop.classList.add('on');};
  drop.ondragleave=()=>drop.classList.remove('on');
  drop.ondrop=e=>{e.preventDefault();drop.classList.remove('on');addFiles(e.dataTransfer.files);};
  $('#aiGo').onclick=()=>aiSend(task);
  $$('.aihist [data-h]').forEach(b=>b.onclick=()=>{$('#aiOut').innerHTML=aiCard(hist[Number(b.dataset.h)]);bindAiCard();});
  drawThumbs();bindAiCard();
}
document.addEventListener('paste',e=>{
  if(!$('#aiDrop'))return;
  const items=Array.from((e.clipboardData||{}).items||[]).filter(i=>i.kind==='file');
  if(!items.length)return;
  e.preventDefault();addFiles(items.map(i=>i.getAsFile()).filter(Boolean));
});
function readAsB64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(file);});}
function shrink(file){
  return new Promise((res,rej)=>{
    const img=new Image();const u=URL.createObjectURL(file);
    img.onload=()=>{const max=1600;const k=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
      const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);
      const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
      const d=c.toDataURL('image/jpeg',0.85);URL.revokeObjectURL(u);res({name:file.name||'캡처',mime:'image/jpeg',data:d.split(',')[1],thumb:d});};
    img.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('이미지를 읽지 못했어요'));};
    img.src=u;
  });
}
async function addFiles(list){
  for(const f of Array.from(list||[])){
    if(aiFiles.length>=4){toast('파일은 4개까지 넣을 수 있어요');break;}
    try{
      if(/^image\//.test(f.type)) aiFiles.push(await shrink(f));
      else if(f.type==='application/pdf'){if(f.size>12e6){toast('PDF가 너무 커요 (12MB 이하)');continue;}aiFiles.push({name:f.name,mime:'application/pdf',data:await readAsB64(f),thumb:''});}
      else toast('이미지나 PDF만 넣을 수 있어요 (한글 파일은 캡처하거나 내용을 복사해 주세요)');
    }catch(e){toast(e.message||'파일을 읽지 못했어요');}
  }
  drawThumbs();
}
function drawThumbs(){
  const t=$('#aiThumbs');if(!t)return;
  t.innerHTML=aiFiles.map((f,i)=>`<div class="th">${f.thumb?`<img src="${f.thumb}" alt="">`:`<span>📄</span>`}<small>${esc(f.name)}</small><button aria-label="빼기" data-i="${i}">✕</button></div>`).join('');
  $$('button',t).forEach(b=>b.onclick=()=>{aiFiles.splice(Number(b.dataset.i),1);drawThumbs();});
}
async function aiSend(task){
  if(aiBusy)return;
  const text=($('#aiText').value||'').trim();
  let full=text;
  if($('#aiSheets').checked){const st=M.sheets.filter(filled).map(id=>sheetText(id)).join('\n');if(st)full+=(full?'\n\n':'')+'[연수 활동지에 적은 내용]\n'+st;}
  if(!full&&!aiFiles.length){toast('자료를 붙여 넣거나 캡처를 넣어 주세요');$('#aiText').focus();return;}
  if(!ONLINE){toast('체험 모드에서는 AI를 쓸 수 없어요');return;}
  aiBusy=true;
  const btn=$('#aiGo');btn.disabled=true;btn.textContent='리디가 읽는 중…';
  $('#aiOut').innerHTML=`<div class="aiwait busy"><img src="${art('redi_magnifier')}" alt=""><p><b>리디가 자료를 꼼꼼히 읽고 있어요</b><br>보통 10~40초 걸려요. 이 화면을 그대로 두세요.</p><div class="dots"><i></i><i></i><i></i></div></div>`;
  const m=me()||{};
  try{
    const j=await apiPost({action:'ai',module:MID,task:task,text:full,extra:($('#aiExtra').value||'').trim(),images:aiFiles.map(f=>({mime:f.mime,data:f.data})),device:store.dev,group:m.g||'',name:m.n||''});
    if(!j.ok)throw new Error(j.error||'응답 없음');
    const h={m:MID,task:task,t:stamp(),text:j.text};
    store.aiHist.unshift(h);store.aiHist=store.aiHist.slice(0,12);save();
    if($('#aiOut')){$('#aiOut').innerHTML=aiCard(h);bindAiCard();}
  }catch(e){
    if($('#aiOut'))$('#aiOut').innerHTML=`<div class="aiwait"><img src="${art('redi_wave')}" alt=""><p><b>앗, 답을 받지 못했어요</b><br>${esc(e.message||e)}</p><button class="b r sm" onclick="document.getElementById('aiGo').click()">다시 시도</button></div>`;
  }finally{
    aiBusy=false;const b=$('#aiGo');if(b){b.disabled=false;b.textContent='🤖 리디에게 '+TASKS[task][0]+' 받기';}
  }
}
function aiCard(h){
  return `<div class="aihead"><img src="${art('redi_idea')}" alt=""><div><b>${TASKS[h.task]?TASKS[h.task][2]+' '+TASKS[h.task][0]:'리디의 답'}</b><small>${esc(h.t)} · 참고용 · 판단은 선생님이</small></div><span class="sp"></span><button class="b w sm" data-ai="copy">📋 복사</button><button class="b w sm" data-ai="save">⬇️ 저장</button></div><div class="md">${md(h.text)}</div>`;
}
function bindAiCard(){
  const out=$('#aiOut');if(!out)return;
  const h=()=>store.aiHist.filter(x=>x.m===MID)[0];
  $$('[data-ai]',out).forEach(b=>b.onclick=()=>{const md0=out.querySelector('.md');const txt=md0?md0.innerText:'';if(b.dataset.ai==='copy')copy(txt,'리디의 답을 복사했어요');else download('리디_'+(h()?TASKS[h().task][0]:'답')+'.txt',txt);});
}
function md(t){
  const lines=esc(t).replace(/&lt;br\s*\/?&gt;/g,'<br>').split(/\r?\n/);
  let h='',list=null,tbl=[];
  const inl=s=>s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g,'$1<i>$2</i>').replace(/`([^`]+)`/g,'<code>$1</code>');
  const endList=()=>{if(list){h+=`</${list}>`;list=null;}};
  const endTbl=()=>{if(!tbl.length)return;const rows=tbl.filter(r=>!/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(r));
    const cells=r=>r.replace(/^\s*\|/,'').replace(/\|\s*$/,'').split('|').map(c=>inl(c.trim()));
    if(rows.length){h+=`<div class="scroll"><table class="t"><tr>${cells(rows[0]).map(c=>`<th>${c}</th>`).join('')}</tr>${rows.slice(1).map(r=>`<tr>${cells(r).map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;}
    tbl=[];};
  lines.forEach(raw=>{
    const l=raw.trimEnd();
    if(/^\s*\|.*\|\s*$/.test(l)){endList();tbl.push(l);return;} endTbl();
    let m;
    if(!l.trim()){endList();return;}
    if((m=l.match(/^(#{1,6})\s+(.*)$/))){endList();h+=`<h${m[1].length<=2?4:5}>${inl(m[2])}</h${m[1].length<=2?4:5}>`;return;}
    if(/^\s*(-{3,}|\*{3,})\s*$/.test(l)){endList();h+='<hr>';return;}
    if((m=l.match(/^\s*[-*•]\s+(.*)$/))){if(list!=='ul'){endList();h+='<ul>';list='ul';}h+=`<li>${inl(m[1])}</li>`;return;}
    if((m=l.match(/^\s*\d+[.)]\s+(.*)$/))){if(list!=='ol'){endList();h+='<ol>';list='ol';}h+=`<li>${inl(m[1])}</li>`;return;}
    if((m=l.match(/^\s*&gt;\s?(.*)$/))){endList();h+=`<div class="quote">${inl(m[1])}</div>`;return;}
    endList();h+=`<p>${inl(l)}</p>`;
  });
  endList();endTbl();
  return h;
}

/* ───────── 큰 화면 (강사용) ───────── */
function liveActs(){
  const posts=Object.keys(POSTS).filter(k=>S.some(s=>s.id===k)).map(k=>POSTS[k].a);
  if(MID==='m5')posts.push('p_life');
  return posts.concat(M.sheets);
}
function livePage(sel){
  const acts=liveActs();
  sel=acts.indexOf(sel)>=0?sel:acts[0];
  const kind=a=>a==='p_vote'?'vote':(a==='p_one'?'word':(/^W/.test(a)?'sheet':'cards'));
  $('#main').innerHTML=`<div class="livehead"><div><span class="k">📺 큰 화면 · ${esc(M.name)}</span><h1>지금 우리 반은</h1></div><div class="lbtns"><button class="b w sm" onclick="document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()">⛶ 전체 화면</button><button class="b y sm" onclick="spinGroups()">🎡 발표 모둠 뽑기</button><a class="b w sm" href="#timer">⏱️ 타이머</a></div></div>
   <div id="liveBoard" data-live="stats"><div class="wempty">불러오는 중…</div></div>
   <div class="lacts">${acts.map(a=>`<a class="b ${a===sel?'r':'w'} sm" href="#live/${a}">${esc(ACT_NAME[a]||a)}</a>`).join('')}</div>
   ${wallBox(sel,'all',{kind:kind(sel),big:1,full:/^W/.test(sel)?1:0,title:ACT_NAME[sel]})}
   ${MID==='m4'?'<h2 class="sec">렌즈 탐정 게임 · 명예의 전당</h2><div data-live="scores" data-game="lens"></div>':'<h2 class="sec">성장 인생게임 · 가장 높이 오른 선생님</h2><div data-live="scores" data-game="life"></div>'}`;
}
window.spinGroups=()=>spinModal(Array.from({length:GROUPS},(_,i)=>(i+1)+'모둠'),'발표 모둠 뽑기');
async function loadStats(el){
  let st;
  try{
    if(ONLINE){const j=await apiGet({action:'stats',module:MID});if(!j.ok)throw 0;st=j.stats;}
    else{const by={};localList({}).forEach(r=>{by[r.a]=by[r.a]||{};by[r.a][r.g]=(by[r.a][r.g]||0)+1;});st={byActivity:by,members:me()?1:0,perGroup:me()?{[me().g]:1}:{}};}
  }catch(e){return;}
  const acts=liveActs();
  const gs=Array.from({length:GROUPS},(_,i)=>String(i+1));
  const tot=a=>Object.values(st.byActivity[a]||{}).reduce((x,y)=>x+y,0);
  el.innerHTML=`<div class="stat lstat"><div><b>${st.members||0}</b><small>등록한 선생님</small></div>${acts.slice(0,3).map(a=>`<div><b>${tot(a)}</b><small>${esc(ACT_NAME[a])}</small></div>`).join('')}</div>
   <div class="scroll"><table class="t gm"><tr><th>모둠</th><th>등록</th>${acts.map(a=>`<th title="${esc(ACT_NAME[a])}">${esc(/^W/.test(a)?a:ACT_NAME[a])}</th>`).join('')}</tr>
   ${gs.map(g=>{const n=(st.perGroup||{})[g]||0;return `<tr><td><span class="gb" style="--g:${gcol(g)}">${g}</span></td><td>${n||'·'}</td>${acts.map(a=>{const c=(st.byActivity[a]||{})[g]||0;const r=n?Math.min(1,c/n):(c?1:0);return `<td class="hm" style="--h:${r}">${c||'·'}</td>`;}).join('')}</tr>`;}).join('')}</table></div>`;
}

/* ───────── 활동 화면 ───────── */
function head(title,k,h1,lead,img){
  const mas=/^redi_/.test(img);
  return `<div class="card shead"><div class="tx"><div class="badge"><b>${esc(title)}</b><span>${esc(k)}</span></div><h1>${esc(h1)}</h1><p>${esc(lead)}</p></div>
   <div class="im" ${mas?'style="background:radial-gradient(circle at 50% 60%,#fff,var(--blueS) 70%)"':''}><img src="${art(img)}" alt="" ${mas?'style="object-fit:contain;padding:18px"':`onclick="zoom(this.src)" style="cursor:zoom-in"`} onerror="this.style.display='none'"></div></div>`;
}
function aiBox(task){
  return `<a class="aicall" href="#ai/${task}"><img src="${art('redi_laptop')}" alt=""><div><b>🤖 막히면 리디에게 · ${TASKS[task][0]}</b><p>${MID==='m4'?'내 지도안을 붙여 넣거나 캡처해서 넣으면, '+TASKS[task][3]+'(으)로 함께 봐 줘요.':'내 역량과 목표를 적으면 '+TASKS[task][3]+'(으)로 정리해 줘요.'}</p></div><span class="b y sm">리디 열기 →</span></a>`;
}
function step(s){
  const p=P[s.part], i=S.indexOf(s), prev=S[i-1], next=S[i+1];
  const mas=/^redi_/.test(s.img);
  const im=mas?`<div class="im" style="background:radial-gradient(circle at 50% 60%,#ffffff,var(--blueS) 70%)"><img src="${art(s.img)}" alt="" style="object-fit:contain;padding:18px"></div>`
              :`<div class="im"><img src="${art(/^game_/.test(s.img)?s.img:s.img+'_s')}" alt="" onclick="zoom('${art(s.img)}')" style="cursor:zoom-in" onerror="this.style.display='none'"></div>`;
  let h=`<div class="card shead"><div class="tx"><div class="badge"><b>STEP ${s.num}</b><span>${esc(p.k)} · ${esc(p.t)}</span><i>${esc(s.time)}</i></div><h1>${esc(s.title)}</h1><p>${esc(s.lead)}</p></div>${im}</div>`;
  if(s.how) h+=`<h2 class="sec">이렇게 해요</h2><div class="how">${s.how.map((x,j)=>`<div><b>${j+1}</b><span>${esc(x)}</span></div>`).join('')}</div>`;
  const last=s.id==='s19';
  if(last&&POSTS[s.id]) h+=`<h2 class="sec">📌 마지막 한 문장</h2>`+postBox(s.id);
  if(s.blocks) h+=(last?'<h2 class="sec">🔔 마치기 전에</h2>':'')+s.blocks.map(b=>`<div style="margin-top:18px">${block(b)}</div>`).join('');
  if(AIBTN[s.id]&&M.ai.indexOf(AIBTN[s.id])>=0) h+=aiBox(AIBTN[s.id]);
  if(s.sheet) h+=`<h2 class="sec">✍️ 내 활동지<small>적는 즉시 이 기기에 저장 · 📤 로 모둠과 나누기</small></h2>`+sheetHTML(s.sheet);
  if(!last&&POSTS[s.id]) h+=`<h2 class="sec">📌 함께 나누기</h2>`+postBox(s.id);
  if(s.links) h+=`<div class="btns">${s.links.map(l=>`<a class="b w sm" href="${l[1]}" target="_blank" rel="noopener">${esc(l[0])} ↗</a>`).join('')}</div>`;
  if(s.share) h+=`<div class="share"><img src="${art('redi_heart')}" alt=""><div><b>함께 나누기</b><br>${esc(s.share)}</div></div>`;
  if(s.tips) h+=s.tips.map(t=>`<div class="tip"><b>TIP</b>${esc(t)}</div>`).join('');
  h+=`<div class="navbtm">${prev?`<a class="b w" href="#${prev.id}">← ${prev.num}. ${esc(prev.short)}</a>`:'<a class="b w" href="#home">← 처음 화면</a>'}
   <button class="b ${store.done[s.id]?'w':'r'}" onclick="toggleDone('${s.id}')">${store.done[s.id]?'✔ 완료했어요 (취소)':'이 활동 완료 ✔'}</button>
   ${next?`<a class="b w" href="#${next.id}">${next.num}. ${esc(next.short)} →</a>`:(MID==='m4'?`<a class="b y" href="../m5/">모듈 5로 →</a>`:'<a class="b w" href="#sheets">내 활동지 모아 보기 →</a>')}</div>`;
  $('#main').innerHTML=h;
  if($('#lifeBox'))mountLife($('#lifeBox'));
}
window.toggleDone=function(id){store.done[id]=!store.done[id];save();buildSide();render(true);};
function finale(){
  const code=M.code||'';
  return `<div class="grid g2 fin"><div class="card pad"><b style="font-size:19px">① 사후 역량 진단</b><p style="color:var(--sub);margin:6px 0 10px">운영진 안내에 따라 사후 역량 진단을 할 때 아래 코드를 입력해요.</p>
    <div class="code" id="codeBox"><button class="b y" onclick="this.parentNode.classList.add('on');">🔑 코드 보기</button><b>${esc(code)}</b><button class="b w sm" onclick="event.stopPropagation();navigator.clipboard&&navigator.clipboard.writeText('${esc(code)}');toast('코드를 복사했어요')">복사</button></div>
    <div class="btns"><a class="b w sm" href="https://www.aiedap.or.kr" target="_blank" rel="noopener">AIEDAP 바로 가기 ↗</a></div></div>
   <div class="card pad"><b style="font-size:19px">② 만족도 조사</b><p style="color:var(--sub);margin:6px 0 10px">오늘 연수에 대한 의견을 남겨 주세요. 2~3분이면 충분해요.</p>
    <div class="btns"><a class="b r" href="${M.survey}" target="_blank" rel="noopener">📝 만족도 조사 열기 ↗</a></div></div></div>
   <div class="quote" style="text-align:center;font-size:17px">평가 → 성찰 → 재설계 → 환류, 그리고 계속 자라기.<br>끝까지 함께해 주셔서 고맙습니다. 18:00에 마칩니다.</div>`;
}

/* ───────── 활동지 모음 · 보드 모음 ───────── */
function sheets(){
  $('#main').innerHTML=`<div class="card shead"><div class="tx"><div class="badge"><b>내 활동지</b><span>${M.sheets[0]}${M.sheets.length>1?' – '+M.sheets[M.sheets.length-1]:''}</span></div><h1>오늘 적은 것을 한곳에서</h1><p>각 활동 화면에서 적은 내용이 여기에도 그대로 보여요. 이 기기의 브라우저에 저장되고, ‘📤 보드에 올리기’를 누른 것만 모둠과 강사에게 보여요. 끝나면 복사하거나 파일로 내려받아 두세요.</p>
   <div class="btns"><button class="b r" onclick="copyAll()">📋 전체 복사</button><button class="b w" onclick="downloadAll()">⬇️ 텍스트 파일로 저장</button><button class="b w" onclick="print()">🖨️ 인쇄 · PDF</button><button class="b w" onclick="clearAll()">🧹 모두 지우기</button></div></div>
   <div class="im" style="background:radial-gradient(circle at 50% 60%,#fff,var(--blueS) 70%)"><img src="${art('redi_idea')}" alt="" style="object-fit:contain;padding:18px"></div></div>`+
   M.sheets.map(id=>`<h2 class="sec" style="margin-top:30px">${esc(P[W[id].part].k)}<small>${esc(P[W[id].part].t)}</small></h2>`+sheetHTML(id)).join('');
}
function board(sel){
  const acts=Object.keys(POSTS).filter(k=>S.some(s=>s.id===k)).map(k=>({sid:k,a:POSTS[k].a}));
  if(MID==='m5')acts.splice(acts.length-1,0,{sid:'s16g',a:'p_life'});
  const cur=acts.find(x=>x.a===sel)||acts[0];
  const p=POSTS[cur.sid];
  $('#main').innerHTML=`${head('우리 반 보드','함께 나누기','모둠별 생각을 한눈에','차시마다 올린 한 줄과 활동지가 여기에 모여요. 우리 모둠만 보거나 반 전체를 볼 수 있고, 🎡 를 누르면 올린 사람 중에서 발표자를 뽑아요.','redi_thumbs')}
   <div class="lacts">${acts.map(x=>`<a class="b ${x===cur?'r':'w'} sm" href="#board/${x.a}">${esc(ACT_NAME[x.a])}</a>`).join('')}<a class="b w sm" href="#sheets">📝 활동지(W) 보드는 각 활동지 아래 👀</a></div>
   ${p?postBox(cur.sid):wallBox(cur.a,'group',{title:ACT_NAME[cur.a]})}
   <div class="btns"><a class="b w" href="#${cur.sid}">이 활동 화면으로 →</a><button class="b y" onclick="spinGroup()">🎡 우리 모둠 룰렛</button></div>`;
}

/* ───────── 여섯 렌즈 · 강사 사례 · 보조강사 · 타이머 ───────── */
function lens(){
  $('#main').innerHTML=`${head('여섯 렌즈','모듈 1에서 배운 성찰의 관점','여섯 렌즈 한눈에','어제는 우수 사례를 렌즈 하나로 보았어요. 오늘은 내 수업을 여섯 렌즈 모두로 봅니다. 한 장면이 여러 렌즈에 걸쳐도 괜찮아요.','part2')}
  <div style="margin-top:18px">${block({k:'lenses'})}</div>
  <div style="margin-top:18px">${block({k:'gamecall'})}</div>
  ${block({k:'xo',t:'장면으로 쓰는 연습',x:['학생들의 참여도가 좋았다.','AI에 의존하는 것이 아쉬웠다.'],o:['AI가 만든 이미지를 비교한 뒤 자신의 스케치와 가장 가까운 이미지를 선택하고 이유를 설명하였다.','5모둠 중 3개 모둠이 AI가 만든 문구를 수정하지 않고 그대로 사용하였다.']})}
  <h2 class="sec">렌즈와 4차시 피드백 관점은 이렇게 이어져요</h2>
  <div class="scroll"><table class="t"><tr><th>성찰 렌즈 (2차시)</th><th>피드백 관점 (4차시)</th><th>함께 보는 질문</th></tr>
  <tr><td class="k" style="color:var(--l1)">교육적</td><td>정합성</td><td>목표 – 활동 – AI – 평가가 이어지는가?</td></tr>
  <tr><td class="k" style="color:var(--l3)">기술적</td><td>기술의 역할</td><td>AI를 써야 하는 이유가 분명한가?</td></tr>
  <tr><td class="k" style="color:var(--l2)">학습자</td><td>주도성</td><td>학생이 생각·선택·판단하는 지점이 충분한가?</td></tr>
  <tr><td class="k" style="color:var(--l4)">평가</td><td>증거 · 성찰</td><td>학습을 확인할 증거와 돌아보는 자리가 있는가?</td></tr>
  <tr><td class="k" style="color:var(--l5)">윤리적</td><td>(모든 관점에 함께)</td><td>오류·편향·저작권·개인정보를 다루었는가?</td></tr>
  <tr><td class="k" style="color:var(--l6)">실행</td><td>실행 가능성</td><td>실제 교실에서 해낼 수 있는가?</td></tr></table></div>`;
}
function caseP(){
  const c=window.CASE;
  $('#main').innerHTML=`<section class="hero" style="min-height:440px"><img class="bg" src="${art('case')}" alt="" onerror="this.style.display='none'"><div class="shade"></div>
   <div class="tx"><span class="pill">강사의 AI 기반 창작수업 사례</span><h1 style="font-size:50px">우리 동네<br><em>생물 탐정</em></h1><p>AI에게 우리 동네 생물을 가르치고, 우리가 만든 챗봇으로 보전을 알리다</p><p style="color:#b9c6f2;font-size:14px">1~4차시의 ‘강사 사례’ 상자는 모두 이 수업을 예로 들었어요.</p></div></section>
  <h2 class="sec">수업 한눈에</h2>
  <div class="scroll"><table class="t">${c.meta.map(m=>`<tr><td class="k">${esc(m[0])}</td><td>${esc(m[1])}</td></tr>`).join('')}</table></div>
  <h2 class="sec">7차시 흐름</h2>
  <div class="grid g3">${c.flow.map((f,i)=>`<div class="card pad" style="border-top:5px solid ${['var(--l1)','var(--l2)','var(--l4)','var(--l3)','var(--l5)','var(--l6)'][i%6]}">${esc(f)}</div>`).join('')}</div>
  <h2 class="sec">세 번의 의사결정 지점<small>나라면 어떻게 했을까요? 생각한 뒤 열어 보세요</small></h2>
  ${c.dps.map((d,i)=>`<div class="dp"><div class="q"><span>의사결정 ${i+1}</span> · ${esc(d.q)} <small style="color:var(--sub);font-weight:400">(${esc(d.when)})</small></div><details><summary>강사는 이렇게 했어요</summary><p style="margin:8px 0 0">${esc(d.a)}</p></details></div>`).join('')}
  <h2 class="sec">학생에게 남은 변화<small>사전 → 사후 (5점)</small></h2>
  <div class="stat">${c.stats.map(s=>`<div><b>${s[0]}</b><small>${esc(s[1])}</small></div>`).join('')}</div>
  <p style="font-size:13px;color:var(--sub)">${esc(c.note)}</p>
  <h2 class="sec">학생의 목소리</h2>
  <div class="voice">${c.voices.map(x=>`<div>${esc(x)}</div>`).join('')}</div>
  <h2 class="sec">그리고 오늘 강사가 다시 짓는 것</h2>
  <div class="case"><div class="h"><img src="${art('redi_idea')}" alt="">Before – Problem – Re-design</div>
   <p><b>Before</b> · 7차시에 ‘나의 실천 한 가지’를 다짐으로 기록하고 마침</p>
   <p><b>Problem</b> · 다짐은 뚜렷이 늘었지만(3.88 → 4.34) 실제 실천은 상승 경향에 그침(3.81 → 4.07, p = .053)</p>
   <p><b>Re-design</b> · 다짐 → 실천 기록 → 챗봇 소스 추가 → 달라진 답 확인. 실천 기록이 다시 AI의 자료가 되는 흐름</p></div>
  <div class="navbtm"><a class="b w" href="#home">← 처음 화면</a><a class="b r" href="#s1">1차시로 →</a></div>`;
}
function helper(){
  $('#main').innerHTML=`<div class="card pad"><div class="badge"><b>보조강사 선생님께</b><span>모듈 4 · 1~4차시</span></div><h1 style="font-size:28px;margin:12px 0 6px">함께 돌아 주실 곳</h1><p style="color:var(--sub);margin:0">원탁 11모둠(7~8명씩)을 보조강사 다섯 분이 2~3모둠씩 맡아 주세요. 오전(1·2차시) 안영우·조항신·감다영·이정원·최혜림 선생님, 오후(3·4차시) 이동익·조항신·감다영·최혜림·조준혁 선생님. 모듈 5는 보조 배정이 없습니다.</p></div>
  <div class="scroll" style="margin-top:16px"><table class="t"><tr><th>시간</th><th>활동</th><th>도와주실 일</th></tr>
   <tr><td class="k">11:00</td><td>1차시 · 준비, 학생 A/B</td><td>AIEDAP 로그인과 내 지도안·성찰 보고서 열기, 이 아카이브에서 🪑 모둠·이름 등록 확인</td></tr>
   <tr><td class="k">11:30</td><td>1차시 · W1 작성</td><td>“평가하고 싶은 학습이 학습목표와 바로 이어지나요?” 질문하며 순회 · 📤 보드에 올리기 안내</td></tr>
   <tr><td class="k">12:00</td><td>2차시 · 렌즈 게임 → 성찰표</td><td>3분 몸풀기 게임 후, ‘좋았다·아쉬웠다’ 대신 장면으로 쓰도록 안내. 막히면 🤖 리디(여섯 렌즈)로 연결</td></tr>
   <tr><td class="k">12:35</td><td>2차시 · 1인 1분</td><td>🎡 룰렛으로 순서 정하고 타이머 ‘1분씩’</td></tr>
   <tr><td class="k">14:25</td><td>3차시 · AIEDAP 지도안 25분</td><td>가장 바쁜 시간. 지도안 불러오기·저장 오류 해결, ‘도구 바꾸기’에 머물면 핵심 문제로 되돌리는 질문</td></tr>
   <tr><td class="k">15:00</td><td>4차시 · 4+4 공유</td><td>팀 나누기(🎡), 7분 타이머(설명 3·피드백 3·기록 1), 피드백이 근거와 함께인지 확인</td></tr>
   <tr><td class="k">15:35</td><td>4차시 · 반영·저장·제출</td><td>AIEDAP 최종 저장, <b>공유마당 공유 + 대시보드 수료 제출물</b> 두 곳 제출 확인, 한 문장 보드 공유</td></tr></table></div>
  <div class="tip"><b>함께 지킬 것</b>연수생 앞에서 다른 교안이나 강사를 평가하지 않기 · 이수 기준이나 조기 퇴실은 개별 안내하지 않고 운영진께 연결하기</div>
  <div class="tip"><b>큰 화면</b>왼쪽 ‘📺 큰 화면’에서 모둠별 제출 현황을 볼 수 있어요. 아직 안 올린 모둠부터 돌아 주세요.</div>
  <div class="navbtm"><a class="b w" href="#home">← 처음 화면</a><a class="b r" href="#live">📺 큰 화면 →</a></div>`;
}
const PRESETS={
  share7:{n:'4차시 공유 · 7분 × 4명',seq:[].concat(...[1,2,3,4].map(p=>[[p+'번 설명',180],[p+'번 피드백',180],[p+'번 기록',60]]))},
  share3:{n:'4차시 공유 · 7분 × 3명',seq:[].concat(...[1,2,3].map(p=>[[p+'번 설명',180],[p+'번 피드백',180],[p+'번 기록',60]]))},
  m5:{n:'모듈 5 · 2분씩 (최대 8명)',seq:[1,2,3,4,5,6,7,8].map(p=>[p+'번 발표',120])},
  one:{n:'2차시 · 1분씩 (최대 8명)',seq:[1,2,3,4,5,6,7,8].map(p=>[p+'번 핵심 문제',60])},
  t2:{n:'2분',seq:[['2분',120]]},t5:{n:'5분',seq:[['5분',300]]},t10:{n:'10분',seq:[['10분',600]]},t25:{n:'25분 · 지도안 작성',seq:[['AIEDAP 지도안 작성',1500]]}
};
const T={key:M.timer[0],i:0,left:PRESETS[M.timer[0]].seq[0][1],run:false,iv:null};
function beep(n){try{const a=new (window.AudioContext||window.webkitAudioContext)();for(let k=0;k<(n||2);k++){const o=a.createOscillator(),g=a.createGain();o.frequency.value=k%2?660:880;o.connect(g);g.connect(a.destination);const t0=a.currentTime+k*0.28;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.3,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+.24);o.start(t0);o.stop(t0+.26);}}catch(e){}}
function fmt(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function tDraw(){
  const P0=PRESETS[T.key], cur=P0.seq[T.i]; if(!$('#tBig'))return;
  $('#tBig').textContent=fmt(Math.max(0,T.left));
  $('#tPh').textContent=cur?cur[0]:'끝!';
  $('#tBar').style.width=cur?(100*(1-T.left/cur[1]))+'%':'100%';
  $('#tSeq').innerHTML=P0.seq.map((s,j)=>`<span class="${j===T.i?'on':(j<T.i?'done':'')}">${esc(s[0])}</span>`).join('');
  $('#tGo').textContent=T.run?'⏸ 잠시 멈춤':'▶ 시작';
}
function tTick(){
  if(!T.run)return; T.left--;
  if(T.left<=0){const P0=PRESETS[T.key];beep(3);T.i++;if(T.i>=P0.seq.length){T.run=false;clearInterval(T.iv);T.left=0;tDraw();return;}T.left=P0.seq[T.i][1];}
  tDraw();
}
window.tGo=function(){T.run=!T.run;clearInterval(T.iv);if(T.run){if(T.i>=PRESETS[T.key].seq.length){T.i=0;T.left=PRESETS[T.key].seq[0][1];}T.iv=setInterval(tTick,1000);}tDraw();};
window.tSet=function(k){T.key=k;T.i=0;T.left=PRESETS[k].seq[0][1];T.run=false;clearInterval(T.iv);timer();};
window.tNext=function(){const s=PRESETS[T.key].seq;if(T.i<s.length-1){T.i++;T.left=s[T.i][1];}tDraw();};
window.tReset=function(){tSet(T.key);};
window.tFull=function(){const el=$('#tBox');if(document.fullscreenElement)document.exitFullscreen();else if(el.requestFullscreen)el.requestFullscreen();};
function timer(){
  $('#main').innerHTML=`<div class="card timer" id="tBox" style="background:var(--paper)"><div class="badge" style="justify-content:center"><b>공유 타이머</b><span>${esc(PRESETS[T.key].n)}</span></div>
   <div class="ph" id="tPh" style="margin-top:14px"></div><div class="big" id="tBig"></div><div class="bar"><i id="tBar"></i></div><div class="seq" id="tSeq"></div>
   <div class="btns" style="justify-content:center"><button class="b r" id="tGo" onclick="tGo()">▶ 시작</button><button class="b w" onclick="tNext()">⏭ 다음 사람</button><button class="b w" onclick="tReset()">↺ 처음부터</button><button class="b w" onclick="tFull()">⛶ 크게 보기</button><button class="b y" onclick="spinGroup()">🎡 순서 뽑기</button></div>
   <div class="presets">${M.timer.map(k=>`<button class="b ${k===T.key?'y':'w'} sm" onclick="tSet('${k}')">${esc(PRESETS[k].n)}</button>`).join('')}</div></div>
   ${MID==='m4'?`<h2 class="sec">4차시 공유는 이렇게</h2>
   <div class="grid g3"><div class="card pad" style="border-top:6px solid var(--l1)"><b>3분 · 설명</b><p style="margin:6px 0 0;color:var(--sub)">Before – Problem – Re-design, 피드백 받고 싶은 부분</p></div><div class="card pad" style="border-top:6px solid var(--l4)"><b>3분 · 피드백</b><p style="margin:6px 0 0;color:var(--sub)">여섯 관점 중 하나 · 강점 먼저, 근거와 함께</p></div><div class="card pad" style="border-top:6px solid var(--l6)"><b>1분 · 기록</b><p style="margin:6px 0 0;color:var(--sub)">받은 피드백을 W6에 적기</p></div></div>
   <div class="btns"><a class="b w" href="#s13">6관점 피드백 화면으로 →</a></div>`:`<h2 class="sec">모듈 5 공유는 이렇게</h2><div class="grid g2"><div class="card pad" style="border-top:6px solid var(--l4)"><b>1인 2분 · 나의 성장 계획</b><p style="margin:6px 0 0;color:var(--sub)">목표 레벨과 이유, 단기 계획 한 가지를 ‘무엇을 · 언제까지 · 누구와’로</p></div><div class="card pad" style="border-top:6px solid var(--l2)"><b>듣는 사람</b><p style="margin:6px 0 0;color:var(--sub)">“함께 할 수 있는 것” 하나를 덧붙여 주세요</p></div></div>`}`;
  tDraw();
}

/* ───────── 라우터 ───────── */
function render(keepScroll){
  destroyGame(); destroySpin();
  const raw=(location.hash||'#home').slice(1)||'home';
  const [r,arg]=raw.split('/');
  const s=S.find(x=>x.id===r);
  if(s) step(s);
  else if(r==='sheets') sheets();
  else if(r==='timer') timer();
  else if(r==='lens'&&MID==='m4') lens();
  else if(r==='case'&&MID==='m4') caseP();
  else if(r==='helper') helper();
  else if(r==='board') board(arg);
  else if(r==='ai') aiPage(arg);
  else if(r==='roulette') roulettePage();
  else if(r==='game'&&MID==='m4') lensGamePage();
  else if(r==='life'&&MID==='m5') lifePage();
  else if(r==='live') livePage(arg);
  else home();
  markNav(r);
  if(!keepScroll&&window._lastR!==raw){window.scrollTo(0,0);}
  window._lastR=raw;
  document.title=(s?s.num+'. '+s.short+' · ':'')+M.title+' · '+M.name;
  startPoll();
}
window.render=render;
window.addEventListener('hashchange',()=>render());
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#lb').classList.remove('on');closeModal();}});
buildSide(); drawMe(); render(); ping();
if(!me()&&!store.skipJoin) setTimeout(()=>{if(!me()&&!$('#modal'))joinModal();},700);
})();
