/* 다시 짓는 내 수업 — 화면 그리기 (data.js의 내용을 읽어 페이지를 만듭니다) */
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const C=window.CFG, P=window.PARTS, S=window.STEPS, W=window.SHEETS, L=window.LENS;

/* ── 저장 (이 기기 브라우저에만) ── */
let store={};
try{store=JSON.parse(localStorage.getItem(C.storeKey)||'{}')||{};}catch(e){store={};}
store.v=store.v||{}; store.done=store.done||{};
let saveT=null;
function save(){try{localStorage.setItem(C.storeKey,JSON.stringify(store));}catch(e){}}
function stamp(){const d=new Date();return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');}

/* ── 화면 밝기 ── */
window.toggleTheme=function(){
  const r=document.documentElement;
  const dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme=dark?'light':'dark';
  try{localStorage.setItem('aiedap-theme',r.dataset.theme);}catch(e){}
};
try{const t=localStorage.getItem('aiedap-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}

/* ── 작은 도우미 ── */
function toast(m){const t=$('#toast');t.textContent=m||'복사했어요';t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),1600);}
window.toast=toast;
function copy(text,msg){
  const ok=()=>toast(msg||'복사했어요');
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(ok,()=>fallback());}else fallback();
  function fallback(){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok();}catch(e){toast('복사하지 못했어요');}ta.remove();}
}
window.zoom=function(src){$('#lbi').src=src;$('#lb').classList.add('on');};
window.go=function(id){location.hash='#'+id;};
const art=n=>'art/'+n+'.webp';
const isMascot=n=>/^redi_/.test(n);
function padletHref(){return C.padlet||'#board';}
function padletAttr(){return C.padlet?' target="_blank" rel="noopener"':'';}

/* ── 사이드바 ── */
function buildSide(){
  let h=`<a href="#home" data-r="home">🏠 처음 화면 · 오늘의 흐름</a>`;
  Object.keys(P).forEach(k=>{
    const p=P[k];
    h+=`<div class="pt">${esc(p.k)}<span>${esc(p.time)}</span></div>`;
    S.filter(s=>s.part==k).forEach(s=>{
      h+=`<a href="#${s.id}" data-r="${s.id}">${s.num}. ${esc(s.short)}${store.done[s.id]?'<span class="ck">✔</span>':''}</a>`;
    });
  });
  $('#nav').innerHTML=h;
  $('#tools').innerHTML=window.TOOLS.map(t=>`<a href="${t[0]}" data-r="${t[0].slice(1)}"><span class="ic">${t[1]}</span><span>${esc(t[2])}<small>${esc(t[3])}</small></span></a>`).join('');
  $('#links').innerHTML=window.LINKS.map(t=>{
    if(t[0]==='PADLET') return `<a href="${padletHref()}"${padletAttr()} class="${C.padlet?'':'need'}"><span class="ic">${t[1]}</span><span>${esc(t[2])}<small>${C.padlet?esc(t[3]):'주소는 운영진 안내 · 올릴 것 보기'}</small></span></a>`;
    return `<a href="${t[0]}" target="_blank" rel="noopener"><span class="ic">${t[1]}</span><span>${esc(t[2])} ↗<small>${esc(t[3])}</small></span></a>`;
  }).join('');
}
function markNav(r){
  document.querySelectorAll('.nav a,.ext a').forEach(a=>a.classList.toggle('on',a.dataset.r===r));
  document.querySelector('.side').classList.remove('open');
}

/* ── 처음 화면 ── */
function home(){
  const parts=Object.keys(P).map(k=>{
    const p=P[k], st=S.filter(s=>s.part==k);
    return `<div class="card part"><img src="${art(p.img+'_s')}" alt="" loading="lazy" onerror="this.style.visibility='hidden'" onclick="zoom('${art(p.img)}')" style="cursor:zoom-in"><div class="in"><div class="k">${esc(p.k)} · ${esc(p.time)}</div><h3>${esc(p.t)}</h3><ol>${st.map(s=>`<li><a href="#${s.id}"><b>${s.num}</b>${esc(s.short)}${store.done[s.id]?' ✔':''}</a></li>`).join('')}</ol></div></div>`;
  }).join('');
  const tl=Object.keys(P).map(k=>{const p=P[k];const first=S.find(s=>s.part==k);
    const tag={1:'평가',2:'성찰',3:'재설계',4:'환류',5:'성장'}[k];
    const brk=k==2?'<div class="brk">🍱 점심 13:00 – 14:00</div>':(k==5?'<div class="brk">🔔 18:00 정시 종료</div>':'');
    return `<a href="#${first.id}" style="--c:${p.c}"><div class="t">${esc(p.time)}</div><h4>${esc(p.k)}</h4><p>${esc(p.t)}</p><span class="tag">${tag}</span>${brk}</a>`;}).join('');
  $('#main').innerHTML=`
  <section class="hero"><img class="bg" src="${art('cover')}" alt="" onerror="this.style.display='none'"><div class="shade"></div>
   <div class="tx"><span class="pill">2026 AIEDAP 마스터교원 신규연수 · 경남 초등 1회차 · AI 기반 창작</span>
   <h1>여섯 렌즈로 보고,<br><em>다시 짓는 내 수업</em></h1>
   <p>모듈 4 · 나의 AI 융합수업 Re-design 하기</p><p>모듈 5 · 마스터교원 역량 개발을 위한 지속적 전문성 개발</p>
   <p style="color:#b9c6f2;font-size:14px;margin-top:10px">11월 8일(일) 11:00 – 18:00 · 해운대 센트럴 호텔 3층 대연회장 · 원탁 11개(7~8명씩)</p>
   <div class="btns"><a class="b y" href="#s1">1차시부터 시작하기 →</a><a class="b g" href="#sheets">📝 내 활동지</a><a class="b g" href="#timer">⏱️ 공유 타이머</a></div></div></section>

  <h2 class="sec">오늘의 흐름<small>평가 → 성찰 → 재설계 → 환류, 그리고 성장</small></h2>
  <div class="tl">${tl}</div>

  <h2 class="sec">다섯 장면<small>장면을 누르면 활동으로 바로 갑니다</small></h2>
  <div class="grid g5">${parts}</div>

  <h2 class="sec">이렇게 함께 써요</h2>
  <div class="grid g3">
   <a class="card pad" href="#sheets" style="text-decoration:none"><b style="font-size:18px">📝 내 활동지</b><p style="margin:6px 0 0;color:var(--sub)">각 활동 화면에서 바로 적어요. 이 기기에 자동 저장되고, 마지막에 한 번에 복사하거나 파일로 내려받을 수 있어요.</p></a>
   <a class="card pad" href="#timer" style="text-decoration:none"><b style="font-size:18px">⏱️ 모둠 공유 타이머</b><p style="margin:6px 0 0;color:var(--sub)">4차시 ‘설명 3분 · 피드백 3분 · 기록 1분’을 네 사람이 돌아가며. 끝날 때 소리가 나요.</p></a>
   <a class="card pad" href="${padletHref()}"${padletAttr()} style="text-decoration:none"><b style="font-size:18px">📌 오늘의 패들렛</b><p style="margin:6px 0 0;color:var(--sub)">따로 가입하지 않아요. 운영진이 안내한 회차 패들렛에 차시별로 한 줄씩 올려 서로의 생각을 봅니다.</p></a>
  </div>

  <h2 class="sec">패들렛에 올릴 한 줄</h2>
  <div class="scroll"><table class="t"><tr><th>칸</th><th>올릴 것</th><th>언제</th></tr>
   <tr><td class="k">1차시</td><td>투표와 이유 한 줄 · 더 확인하고 싶은 학습의 증거 한 가지</td><td>11:15 · 11:50</td></tr>
   <tr><td class="k">2차시</td><td>내가 가장 먼저 풀고 싶은 핵심 문제 한 줄</td><td>12:50</td></tr>
   <tr><td class="k">4차시</td><td>나의 Re-design 한 문장</td><td>15:50</td></tr>
   <tr><td class="k">모듈 5</td><td>전문성 개발이 필요한 이유 · 단기 계획 한 줄 · “AX 시대의 교사 전문성은 ___이다”</td><td>16:00 – 18:00</td></tr></table></div>

  <div class="share"><img src="art/redi_heart.webp" alt=""><div><b>리디(Redi)가 함께해요</b><br>여섯 빛깔 점은 여섯 렌즈예요. 막히면 왼쪽 ‘여섯 렌즈 한눈에’와 ‘강사 사례’를 열어 보세요.</div></div>
  <div class="foot">강사 최일훈 (명진초) · 표준 교안: 2026 AIEDAP 마스터교원 신규연수 모듈 4·5 · 그림: ChatGPT로 만든 이미지 · <a href="#helper">보조강사 진행 안내</a></div>`;
}

/* ── 블록 ── */
function block(b){
  if(b.k==='html') return b.h;
  if(b.k==='cmp') return `${b.t?`<h2 class="sec">${esc(b.t)}</h2>`:''}<div class="cmp"><div class="a"><h4>${b.a[0]}</h4><ul>${b.a.slice(1).map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="bb"><h4>${b.b[0]}</h4><ul>${b.b.slice(1).map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`;
  if(b.k==='case') return `<div class="case"><div class="h"><img src="art/redi_magnifier.webp" alt="">🌿 ${esc(b.t)} <a href="#case" style="margin-left:auto;font-size:13px;color:var(--mint)">사례 전체 보기 →</a></div>${b.h}</div>`;
  if(b.k==='lenses') return `<div class="lenses">${L.map(l=>`<div class="lens" style="--c:${l.c}"><h5>${l.n}</h5><p>${esc(l.q)}</p></div>`).join('')}</div>`;
  if(b.k==='xo') return `<h2 class="sec">${esc(b.t)}</h2><div class="xo"><div class="x"><b>✕ 이렇게 쓰기보다</b>${b.x.map(esc).join('<br>')}</div><div class="o"><b>○ 이렇게 장면으로</b>${b.o.map(esc).join('<br><br>')}</div></div>`;
  return '';
}

/* ── 활동지 ── */
function v(k){return store.v[k]||'';}
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
  return `<div class="card ws" data-sheet="${id}"><div class="top"><b style="background:var(--blue);color:#fff;border-radius:20px;padding:2px 11px;font-size:13px">${id}</b><h4>${esc(s.t)}</h4><span class="sv" id="sv-${id}">${store.t&&store.t[id]?'저장됨 '+store.t[id]:'적으면 자동 저장'}</span></div>${body}
  <div class="acts"><button class="b w sm" onclick="copySheet('${id}')">📋 이 활동지 복사</button><a class="b w sm" href="${padletHref()}"${padletAttr()}>📌 패들렛 열기</a></div></div>`;
}
function sheetText(id){
  const s=W[id]; let t=`[${id}] ${s.t}\n`;
  if(s.type==='rows') s.rows.forEach(r=>{t+=`- ${r[1]}: ${v(id+'.'+r[0])}\n`;});
  else if(s.type==='lens') L.forEach(l=>{t+=`- ${l.n} | 효과적: ${v(id+'.'+l.id+'_g')} | 다시 생각: ${v(id+'.'+l.id+'_r')}\n`;});
  else if(s.type==='sentence') t+=s.parts[0]+' '+s.keys.map((k,i)=>(v(id+'.'+k)||'____')+' '+s.parts[i+1]).join(' ')+'\n';
  return t;
}
window.copySheet=id=>copy(sheetText(id),id+' 활동지를 복사했어요');
window.copyAll=()=>copy(Object.keys(W).map(sheetText).join('\n'),'활동지 전체를 복사했어요');
window.downloadAll=function(){
  const txt='다시 짓는 내 수업 — 모듈 4·5 활동지 ('+new Date().toLocaleString('ko-KR')+')\n\n'+Object.keys(W).map(sheetText).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain;charset=utf-8'}));a.download='모듈4-5_내활동지.txt';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
};
window.clearAll=function(){
  if(!confirm('이 기기에 저장된 활동지 내용을 모두 지울까요?'))return;
  store.v={};store.t={};save();render();toast('지웠어요');
};
document.addEventListener('input',e=>{
  const k=e.target.dataset&&e.target.dataset.k; if(!k)return;
  store.v[k]=e.target.value; const id=k.split('.')[0];
  store.t=store.t||{}; store.t[id]=stamp();
  clearTimeout(saveT); saveT=setTimeout(()=>{save();document.querySelectorAll('#sv-'+id).forEach(x=>x.textContent='저장됨 '+store.t[id]);},350);
});

/* ── 활동 화면 ── */
function step(s){
  const p=P[s.part], i=S.indexOf(s), prev=S[i-1], next=S[i+1];
  const mas=isMascot(s.img);
  const im=mas?`<div class="im" style="background:radial-gradient(circle at 50% 60%,#ffffff,${'var(--blueS)'} 70%)"><img src="${art(s.img)}" alt="" style="object-fit:contain;padding:18px"></div>`
              :`<div class="im"><img src="${art(s.img+'_s')}" alt="" onclick="zoom('${art(s.img)}')" style="cursor:zoom-in" onerror="this.style.display='none'"></div>`;
  let h=`<div class="card shead"><div class="tx"><div class="badge"><b>STEP ${s.num}</b><span>${esc(p.k)} · ${esc(p.t)}</span><i>${esc(s.time)}</i></div><h1>${esc(s.title)}</h1><p>${esc(s.lead)}</p></div>${im}</div>`;
  if(s.how) h+=`<h2 class="sec">이렇게 해요</h2><div class="how">${s.how.map((x,j)=>`<div><b>${j+1}</b><span>${esc(x)}</span></div>`).join('')}</div>`;
  if(s.blocks) h+=s.blocks.map(b=>`<div style="margin-top:18px">${block(b)}</div>`).join('');
  if(s.sheet) h+=`<h2 class="sec">✍️ 내 활동지<small>적는 즉시 이 기기에 저장돼요</small></h2>`+sheetHTML(s.sheet);
  if(s.links) h+=`<div class="btns">${s.links.map(l=>`<a class="b w sm" href="${l[1]}" target="_blank" rel="noopener">${esc(l[0])} ↗</a>`).join('')}</div>`;
  if(s.share) h+=`<div class="share"><img src="art/redi_heart.webp" alt=""><div><b>함께 나누기</b><br>${esc(s.share)}<br><a class="b y sm" href="${padletHref()}"${padletAttr()}>📌 패들렛 열기</a> ${s.part==4||/1분|2분/.test(s.share)?'<a class="b g sm" href="#timer">⏱️ 타이머</a>':''}</div></div>`;
  if(s.tips) h+=s.tips.map(t=>`<div class="tip"><b>TIP</b>${esc(t)}</div>`).join('');
  h+=`<div class="navbtm">${prev?`<a class="b w" href="#${prev.id}">← ${prev.num}. ${esc(prev.short)}</a>`:'<span></span>'}
   <button class="b ${store.done[s.id]?'w':'r'}" onclick="toggleDone('${s.id}')">${store.done[s.id]?'✔ 완료했어요 (취소)':'이 활동 완료 ✔'}</button>
   ${next?`<a class="b w" href="#${next.id}">${next.num}. ${esc(next.short)} →</a>`:'<a class="b w" href="#sheets">내 활동지 모아 보기 →</a>'}</div>`;
  $('#main').innerHTML=h;
}
window.toggleDone=function(id){store.done[id]=!store.done[id];save();buildSide();render();};

/* ── 활동지 모음 ── */
function sheets(){
  $('#main').innerHTML=`<div class="card shead"><div class="tx"><div class="badge"><b>내 활동지</b><span>W1 – W8</span></div><h1>오늘 적은 것을 한곳에서</h1><p>각 활동 화면에서 적은 내용이 여기에도 그대로 보여요. 이 기기의 브라우저에만 저장되니, 끝나면 복사하거나 파일로 내려받아 두세요.</p>
   <div class="btns"><button class="b r" onclick="copyAll()">📋 전체 복사</button><button class="b w" onclick="downloadAll()">⬇️ 텍스트 파일로 저장</button><button class="b w" onclick="print()">🖨️ 인쇄 · PDF</button><button class="b w" onclick="clearAll()">🧹 모두 지우기</button></div></div>
   <div class="im" style="background:radial-gradient(circle at 50% 60%,#fff,var(--blueS) 70%)"><img src="art/redi_idea.webp" alt="" style="object-fit:contain;padding:18px"></div></div>`+
   Object.keys(W).map(id=>`<h2 class="sec" style="margin-top:30px">${esc(P[W[id].part].k)}<small>${esc(P[W[id].part].t)}</small></h2>`+sheetHTML(id)).join('');
}

/* ── 여섯 렌즈 한눈에 ── */
function lens(){
  $('#main').innerHTML=`<div class="card shead"><div class="tx"><div class="badge"><b>여섯 렌즈</b><span>모듈 1에서 배운 성찰의 관점</span></div><h1>여섯 렌즈 한눈에</h1><p>어제는 우수 사례를 렌즈 하나로 보았어요. 오늘은 내 수업을 여섯 렌즈 모두로 봅니다. 한 장면이 여러 렌즈에 걸쳐도 괜찮아요.</p><div class="btns"><a class="b r" href="#s6">여섯 렌즈 성찰표 쓰러 가기 →</a></div></div>
  <div class="im"><img src="${art('part2')}" alt="" onclick="zoom(this.src)" style="cursor:zoom-in" onerror="this.style.display='none'"></div></div>
  <div style="margin-top:18px">${block({k:'lenses'})}</div>
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

/* ── 강사 사례 ── */
function caseP(){
  const c=window.CASE;
  $('#main').innerHTML=`<section class="hero" style="min-height:440px"><img class="bg" src="${art('case')}" alt="" onerror="this.style.display='none'"><div class="shade"></div>
   <div class="tx"><span class="pill">강사의 AI 기반 창작수업 사례</span><h1 style="font-size:50px">우리 동네<br><em>생물 탐정</em></h1><p>AI에게 우리 동네 생물을 가르치고, 우리가 만든 챗봇으로 보전을 알리다</p><p style="color:#b9c6f2;font-size:14px">오늘 1~4차시의 ‘강사 사례’ 상자는 모두 이 수업을 예로 들었어요.</p></div></section>
  <h2 class="sec">수업 한눈에</h2>
  <div class="scroll"><table class="t">${c.meta.map(m=>`<tr><td class="k">${esc(m[0])}</td><td>${esc(m[1])}</td></tr>`).join('')}</table></div>
  <h2 class="sec">7차시 흐름</h2>
  <div class="grid g3">${c.flow.map((f,i)=>`<div class="card pad" style="border-top:5px solid ${['var(--l1)','var(--l2)','var(--l4)','var(--l3)','var(--l5)','var(--l6)'][i]}">${esc(f)}</div>`).join('')}</div>
  <h2 class="sec">세 번의 의사결정 지점<small>나라면 어떻게 했을까요? 생각한 뒤 열어 보세요</small></h2>
  ${c.dps.map((d,i)=>`<div class="dp"><div class="q"><span>의사결정 ${i+1}</span> · ${esc(d.q)} <small style="color:var(--sub);font-weight:400">(${esc(d.when)})</small></div><details><summary>강사는 이렇게 했어요</summary><p style="margin:8px 0 0">${esc(d.a)}</p></details></div>`).join('')}
  <h2 class="sec">학생에게 남은 변화<small>사전 → 사후 (5점)</small></h2>
  <div class="stat">${c.stats.map(s=>`<div><b>${s[0]}</b><small>${esc(s[1])}</small></div>`).join('')}</div>
  <p style="font-size:13px;color:var(--sub)">${esc(c.note)}</p>
  <h2 class="sec">학생의 목소리</h2>
  <div class="voice">${c.voices.map(x=>`<div>${esc(x)}</div>`).join('')}</div>
  <h2 class="sec">그리고 오늘 강사가 다시 짓는 것</h2>
  <div class="case"><div class="h"><img src="art/redi_idea.webp" alt="">Before – Problem – Re-design</div>
   <p><b>Before</b> · 7차시에 ‘나의 실천 한 가지’를 다짐으로 기록하고 마침</p>
   <p><b>Problem</b> · 다짐은 뚜렷이 늘었지만(3.88 → 4.34) 실제 실천은 상승 경향에 그침(3.81 → 4.07, p = .053)</p>
   <p><b>Re-design</b> · 다짐 → 실천 기록 → 챗봇 소스 추가 → 달라진 답 확인. 실천 기록이 다시 AI의 자료가 되는 흐름</p></div>
  <div class="navbtm"><a class="b w" href="#home">← 처음 화면</a><a class="b r" href="#s1">1차시로 →</a></div>`;
}

/* ── 공유 타이머 ── */
const PRESETS={
  share7:{n:'4차시 공유 · 7분 × 4명',seq:[].concat(...[1,2,3,4].map(p=>[[p+'번 설명',180],[p+'번 피드백',180],[p+'번 기록',60]]))},
  share3:{n:'4차시 공유 · 7분 × 3명',seq:[].concat(...[1,2,3].map(p=>[[p+'번 설명',180],[p+'번 피드백',180],[p+'번 기록',60]]))},
  m5:{n:'모듈 5 · 2분씩 (최대 8명)',seq:[1,2,3,4,5,6,7,8].map(p=>[p+'번 발표',120])},
  one:{n:'2차시 · 1분씩 (최대 8명)',seq:[1,2,3,4,5,6,7,8].map(p=>[p+'번 핵심 문제',60])},
  t2:{n:'2분',seq:[['2분',120]]},t5:{n:'5분',seq:[['5분',300]]},t10:{n:'10분',seq:[['10분',600]]},t25:{n:'25분 · 지도안 작성',seq:[['AIEDAP 지도안 작성',1500]]}
};
const T={key:'share7',i:0,left:180,run:false,iv:null};
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
  $('#main').innerHTML=`<div class="card timer" id="tBox" style="background:var(--paper)"><div class="badge" style="justify-content:center"><b>모둠 공유 타이머</b><span>${esc(PRESETS[T.key].n)}</span></div>
   <div class="ph" id="tPh" style="margin-top:14px"></div><div class="big" id="tBig"></div><div class="bar"><i id="tBar"></i></div><div class="seq" id="tSeq"></div>
   <div class="btns" style="justify-content:center"><button class="b r" id="tGo" onclick="tGo()">▶ 시작</button><button class="b w" onclick="tNext()">⏭ 다음 사람</button><button class="b w" onclick="tReset()">↺ 처음부터</button><button class="b w" onclick="tFull()">⛶ 크게 보기</button></div>
   <div class="presets">${Object.keys(PRESETS).map(k=>`<button class="b ${k===T.key?'y':'w'} sm" onclick="tSet('${k}')">${esc(PRESETS[k].n)}</button>`).join('')}</div></div>
   <h2 class="sec">4차시 공유는 이렇게</h2>
   <div class="grid g3"><div class="card pad" style="border-top:6px solid var(--l1)"><b>3분 · 설명</b><p style="margin:6px 0 0;color:var(--sub)">Before – Problem – Re-design, 피드백 받고 싶은 부분</p></div><div class="card pad" style="border-top:6px solid var(--l4)"><b>3분 · 피드백</b><p style="margin:6px 0 0;color:var(--sub)">여섯 관점 중 하나 · 강점 먼저, 근거와 함께</p></div><div class="card pad" style="border-top:6px solid var(--l6)"><b>1분 · 기록</b><p style="margin:6px 0 0;color:var(--sub)">받은 피드백을 W6에 적기</p></div></div>
   <div class="btns"><a class="b w" href="#s13">6관점 피드백 화면으로 →</a></div>`;
  tDraw();
}

/* ── 패들렛 안내 ── */
function board(){
  $('#main').innerHTML=`<div class="card shead"><div class="tx"><div class="badge"><b>오늘의 패들렛</b><span>회차 공용 보드</span></div><h1>따로 가입하지 않고, 한 보드에서 나눠요</h1><p>${C.padlet?'아래 버튼으로 회차 패들렛을 열어요.':'패들렛 주소는 운영진이 연수 당일 안내합니다. 안내받은 주소로 들어가 차시별 칸에 한 줄씩 올려 주세요.'}</p>${C.padlet?`<div class="btns"><a class="b r" href="${C.padlet}" target="_blank" rel="noopener">📌 패들렛 열기 ↗</a></div>`:''}</div>
  <div class="im" style="background:radial-gradient(circle at 50% 60%,#fff,var(--blueS) 70%)"><img src="art/redi_thumbs.webp" alt="" style="object-fit:contain;padding:18px"></div></div>
  <h2 class="sec">어느 칸에 무엇을</h2>
  <div class="scroll"><table class="t"><tr><th>칸</th><th>올릴 것</th><th>활동</th></tr>
   <tr><td class="k">1차시</td><td>학생 A·B 투표와 이유 / 더 확인하고 싶은 학습의 증거 한 가지</td><td><a href="#s2">STEP 2</a> · <a href="#s4">STEP 4</a></td></tr>
   <tr><td class="k">2차시</td><td>가장 먼저 풀고 싶은 핵심 문제 한 줄</td><td><a href="#s7">STEP 7</a></td></tr>
   <tr><td class="k">4차시</td><td>나의 Re-design 한 문장</td><td><a href="#s14">STEP 14</a></td></tr>
   <tr><td class="k">모듈 5</td><td>전문성 개발이 필요한 이유 / 단기 계획 한 줄 / AX 시대의 교사 전문성은 ___이다</td><td><a href="#s15">STEP 15</a> · <a href="#s18">18</a> · <a href="#s19">19</a></td></tr></table></div>
  <div class="tip"><b>TIP</b>활동지의 ‘📋 이 활동지 복사’ 버튼으로 복사한 뒤 패들렛에 붙여 넣으면 빨라요. 개인 정보(학생 이름·사진)는 올리지 않아요.</div>`;
}

/* ── 보조강사 진행 안내 ── */
function helper(){
  $('#main').innerHTML=`<div class="card pad"><div class="badge"><b>보조강사 선생님께</b><span>모듈 4 · 1~4차시</span></div><h1 style="font-size:28px;margin:12px 0 6px">함께 돌아 주실 곳</h1><p style="color:var(--sub);margin:0">원탁 11모둠(7~8명씩)을 보조강사 다섯 분이 2~3모둠씩 맡아 주세요. 출석 서명은 2차시마다 운영진이 진행합니다. 모듈 5(16:00~18:00)는 보조 배정이 없습니다.</p></div>
  <div class="scroll" style="margin-top:16px"><table class="t"><tr><th>시간</th><th>활동</th><th>도와주실 일</th></tr>
   <tr><td class="k">11:00</td><td>1차시 · 준비, 학생 A/B</td><td>AIEDAP 로그인과 내 지도안·성찰 보고서 열기, 패들렛 접속 확인</td></tr>
   <tr><td class="k">11:30</td><td>1차시 · W1 작성</td><td>“평가하고 싶은 학습이 학습목표와 바로 이어지나요?” 질문하며 순회</td></tr>
   <tr><td class="k">12:00</td><td>2차시 · 성찰표</td><td>‘좋았다·아쉬웠다’ 대신 장면으로 쓰도록 안내, 렌즈를 모두 같은 양으로 채우지 않아도 됨</td></tr>
   <tr><td class="k">12:35</td><td>2차시 · 1인 1분</td><td>모둠 공유 시간 관리 (타이머 ‘1분씩’)</td></tr>
   <tr><td class="k">14:25</td><td>3차시 · AIEDAP 지도안 25분</td><td>가장 바쁜 시간. 지도안 불러오기·저장 오류 해결, ‘도구 바꾸기’에 머물면 핵심 문제로 되돌리는 질문</td></tr>
   <tr><td class="k">15:00</td><td>4차시 · 4+4 공유</td><td>팀 나누기, 7분 타이머(설명 3·피드백 3·기록 1), 피드백이 근거와 함께인지 확인</td></tr>
   <tr><td class="k">15:35</td><td>4차시 · 반영·저장</td><td>AIEDAP 최종 저장 확인, 한 문장 패들렛 공유 확인</td></tr></table></div>
  <div class="tip"><b>함께 지킬 것</b>연수생 앞에서 다른 교안이나 강사를 평가하지 않기 · 이수 기준이나 조기 퇴실은 개별 안내하지 않고 운영진께 연결하기</div>
  <div class="navbtm"><a class="b w" href="#home">← 처음 화면</a></div>`;
}

/* ── 라우터 ── */
function render(){
  const r=(location.hash||'#home').slice(1)||'home';
  const s=S.find(x=>x.id===r);
  if(s) step(s);
  else if(r==='sheets') sheets();
  else if(r==='timer') timer();
  else if(r==='lens') lens();
  else if(r==='case') caseP();
  else if(r==='board') board();
  else if(r==='helper') helper();
  else home();
  markNav(r);
  if(window._lastR!==r){window.scrollTo(0,0);window._lastR=r;}
  document.title=(s?s.num+'. '+s.short+' · ':'')+'다시 짓는 내 수업';
}
window.render=render;
window.addEventListener('hashchange',render);
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#lb').classList.remove('on');});
buildSide(); render();
})();
