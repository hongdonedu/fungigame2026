/* 모듈 4·5 아카이브 데이터 — 내용을 고칠 때는 이 파일만 고치면 됩니다. */
window.CFG = {
  // 운영진이 회차 패들렛 주소를 알려 주면 따옴표 안에 붙여 넣으세요. 비어 있으면 '운영진 안내 패들렛'으로만 표시됩니다.
  padlet: "https://padlet.com/oneteacher/ai-4-5-s0255959i70cs9rx93rp",
  storeKey: "aiedap-m45-gn1-v1"
};

window.LENS = [
  {id:"edu", n:"교육적", c:"var(--l1)", q:"AI 활용이 학습목표 달성에 기여했는가? 성취기준과 AI 활동이 어떻게 연결되었는가?"},
  {id:"lrn", n:"학습자", c:"var(--l2)", q:"학생이 스스로 생각하고 선택할 기회가 어디 있었나? AI 결과를 검토·수정한 흔적이 있나?"},
  {id:"tec", n:"기술적", c:"var(--l3)", q:"기술이 수업 목적과 학생 수준에 맞았나? 그 도구를 고른 이유는?"},
  {id:"evl", n:"평가", c:"var(--l4)", q:"학생의 사고 과정과 AI 활용 과정을 어떻게 확인했나? 어떤 학습의 증거가 남았나?"},
  {id:"eth", n:"윤리적", c:"var(--l5)", q:"AI의 한계와 책임을 어떻게 다루었나? 오류·편향·저작권·개인정보는?"},
  {id:"exe", n:"실행", c:"var(--l6)", q:"시간·기기·학생 여건에서 실행 가능했나? 다른 교실에서 하려면 무엇이 필요한가?"}
];

window.PARTS = {
  1:{k:"모듈 4 · 1차시", t:"결과물 너머, 학습의 증거", time:"11:00 – 11:50", img:"part1", c:"var(--l1)"},
  2:{k:"모듈 4 · 2차시", t:"여섯 렌즈로 내 수업 다시 보기", time:"12:00 – 12:50", img:"part2", c:"var(--l2)"},
  3:{k:"모듈 4 · 3차시", t:"연결 지점을 다시 짓기", time:"14:00 – 14:50", img:"part3", c:"var(--l3)"},
  4:{k:"모듈 4 · 4차시", t:"모둠에서 주고받기", time:"15:00 – 15:50", img:"part4", c:"var(--l4)"},
  5:{k:"모듈 5", t:"마스터교원으로 계속 자라기", time:"16:00 – 18:00", img:"part5", c:"var(--l5)"}
};

/* 활동지 정의 — type: rows(라벨+입력) | lens(6렌즈 표) | sentence(빈칸 문장) */
window.SHEETS = {
  W1:{t:"내 수업의 학습목표와 학습의 증거", part:1, type:"rows", rows:[
    ["my","내 수업","학년 · 교과 · 수업 주제 한 줄"],
    ["g1","평가하고 싶은 학습 ①","예) 자신의 창작 의도를 구체화한다"],
    ["e1","→ 그 학습의 증거","예) 아이디어, 스토리보드"],
    ["g2","평가하고 싶은 학습 ②","예) 다양한 표현을 비교하여 적절한 것을 선택한다"],
    ["e2","→ 그 학습의 증거","예) 생성 결과 비교, 선택 및 미선택의 이유"],
    ["g3","평가하고 싶은 학습 ③","예) 자신의 의도에 맞게 표현을 수정한다"],
    ["e3","→ 그 학습의 증거","예) 수정 전과 후 비교, 수정 이유"],
    ["g4","평가하고 싶은 학습 ④","예) 자신의 창작 과정을 설명하고 성찰한다"],
    ["e4","→ 그 학습의 증거","예) 최종 작품, 창작 성찰 기록"],
    ["now","지금 수업에 실제로 남아 있는 증거","활동지, 프롬프트 기록, 수정 전·후 결과물 등"],
    ["more","더 확인하고 싶은 증거 한 가지","1차시 정리 — 패들렛에 올릴 한 줄"]
  ]},
  W2:{t:"교육과정에서 출발하기", part:2, type:"rows", rows:[
    ["std","성취기준","예) [6실05-05] 인공지능이 만들어지는 과정을 체험하고…"],
    ["core","학습 목표 기반 핵심 학습 과정","학생이 실제로 해야 하는 수행을 순서대로"],
    ["sup","AI가 학습을 넓혀 준 장면","(지원) 구체적인 장면으로"],
    ["warn","AI 때문에 주의할 점","(주의) 대신해 버린 수행, 오류, 과의존 등"]
  ]},
  W3:{t:"여섯 렌즈 성찰표", part:2, type:"lens"},
  W4:{t:"Re-design의 출발점", part:2, type:"rows", rows:[
    ["keep","유지하고 싶은 부분","효과가 확인된 장면"],
    ["re","다시 설계하고 싶은 부분",""],
    ["prob","가장 먼저 해결할 문제 한 가지와 이유","성찰표에서 찾은 근거와 함께"],
    ["dir","개선 방향","도구를 바꾸는 것 말고, 무엇의 연결을 바꿀지"]
  ]},
  W5:{t:"Before – Problem – Re-design", part:3, type:"rows", rows:[
    ["before","Before","기존 수업에서는 어떤 상황이 있었나?"],
    ["problem","Problem","성찰로 발견한 핵심 문제는?"],
    ["redesign","Re-design","그 문제를 풀기 위해 무엇을 어떻게 바꾸었나?"],
    ["el","함께 바뀌는 설계 요소","학습 목표 · 학습 활동 · 기술의 역할 · 학생의 사고 · 교사의 지원 · 학습의 증거 중"],
    ["big","가장 크게 바뀐 지점","3차시 정리"],
    ["ask","동료에게 피드백 받고 싶은 부분","4차시에 들고 갈 질문 하나"]
  ]},
  W6:{t:"받은 피드백 기록", part:4, type:"rows", rows:[
    ["f1","피드백 ① (관점 · 내용)","예) 주도성 — 수정 이유를 쓰는 칸이 있으면 좋겠다"],
    ["f2","피드백 ② (관점 · 내용)",""],
    ["f3","피드백 ③ (관점 · 내용)",""],
    ["pick","반영할 것과 이유","모두 반영하지 않아도 돼요. 내 수업 맥락에 맞는 것만"],
    ["skip","이번에는 반영하지 않을 것과 이유",""]
  ]},
  W7:{t:"나의 Re-design 한 문장", part:4, type:"sentence", parts:["기존에는","한 수업이었지만, 학생이","할 수 있도록","을/를 중심으로 다시 설계하였습니다."], keys:["a","b","c"]},
  W8:{t:"나의 전문성 개발 계획", part:5, type:"rows", rows:[
    ["lv","지금 나의 역량 수준","AIEDAP 역량분석 대시보드에서 확인 (Lv.?)"],
    ["str","강점 역량",""],
    ["weak","보완이 필요한 역량",""],
    ["goal","목표 레벨과 그 이유",""],
    ["short","단기 계획 (6개월 이내)","예) 권역 AI 융합수업 선도교사 활동, AI 융합 연구모임"],
    ["long","장기 계획 (1년 이상)","예) 마스터교원 연수 강사 활동, AI 융합수업 모형 개발"],
    ["one","AX 시대의 교사 전문성은 ___ 이다","모듈 5 마무리 한 문장"]
  ]}
};

window.STEPS = [
/* ───────── PART 1 · 1차시 평가 ───────── */
{id:"s1", part:1, num:1, short:"오늘의 지도 · 준비", time:"11:00 · 5분", title:"오늘은 내 수업을 한 바퀴 돌려 보는 날", img:"redi_wave",
 lead:"새 도구를 배우는 시간이 아니라, 이미 설계·실천·성찰한 내 AI 융합수업을 평가 → 성찰 → 재설계 → 환류로 한 바퀴 돌려 보는 시간이에요.",
 how:["AIEDAP에 로그인해 내 지도안과 성찰 보고서를 열어 둡니다","오늘의 패들렛을 열어 둡니다 (운영진 안내)","이 아카이브의 ‘내 활동지’에 적으면 이 기기에 자동 저장돼요","모둠은 원탁 7~8명, 4차시 공유는 두 팀(4명 + 3~4명)으로 해요"],
 blocks:[
  {k:"cmp", t:"어제 모듈 1과 무엇이 다를까요?", a:["어제 · 모듈 1","우수 사례를","렌즈 <b>하나</b>로 분석","의사결정 지점에서 ‘나라면?’ 기록"], b:["오늘 · 모듈 4","<b>내 수업</b>을","렌즈 <b>여섯 개 모두</b>로 성찰","성찰을 다시 쓰는 게 아니라 <b>재설계</b>까지"]},
  {k:"html", h:`<h2 class="sec">오늘 남길 것</h2><div class="grid g4 keep1">
   <div class="card pad"><span class="dot" style="--c:var(--l1)"></span><b>1차시</b><br>더 확인할 학습의 증거</div>
   <div class="card pad"><span class="dot" style="--c:var(--l2)"></span><b>2차시</b><br>여섯 렌즈 성찰 · 핵심 문제</div>
   <div class="card pad"><span class="dot" style="--c:var(--l3)"></span><b>3차시</b><br>Re-design 지도안 초안</div>
   <div class="card pad"><span class="dot" style="--c:var(--l4)"></span><b>4차시</b><br>피드백 · Re-design 한 문장</div></div>`}
 ],
 tips:["렌즈 여섯 개는 어제 모듈 1에서 써 보셨으니 다시 설명하지 않고 바로 씁니다. 헷갈리면 왼쪽 ‘여섯 렌즈 한눈에’를 열어 보세요."]},

{id:"s2", part:1, num:2, short:"결과물만으로 알 수 있을까?", time:"11:05 · 10분", title:"결과물만으로 학생의 학습을 알 수 있을까요?", img:"part1",
 lead:"같은 과제, 다른 과정. 두 학생 중 누구에게 더 높은 점수를 주시겠어요? 패들렛에 투표하고 이유를 한 줄 남겨 주세요.",
 blocks:[
  {k:"html", h:`<div class="quote"><b>오늘의 창작 과제</b> · 생성형 AI를 활용하여 ‘우리 학교를 소개하는 포스터’ 만들기</div>
  <div class="scroll"><table class="t"><tr><th>학생 A</th><th>학생 B</th></tr>
  <tr><td>생성형 AI에 바로 프롬프트 입력</td><td>자신의 아이디어를 먼저 스케치</td></tr>
  <tr><td>첫 번째 결과가 마음에 들어 선택</td><td>생성형 AI로 여러 표현 방법 탐색</td></tr>
  <tr><td>생성된 이미지와 문구를 활용하여 완성</td><td>생성 결과를 비교하고 일부는 제외</td></tr>
  <tr><td>시각적으로 완성도 높은 포스터 제작</td><td>자신의 의도에 맞게 이미지와 문구 수정</td></tr></table></div>`},
  {k:"case", t:"강사 수업에서는", h:`<p>5학년 여섯 모둠이 만든 ‘우리 동네 생물 홍보 챗봇’과 Canva 홍보 포스터. 겉으로 보면 여섯 모둠 모두 ‘완성’한 결과물이에요.</p><p><b>그런데 이것만 보고 누가 무엇을 배웠는지 말할 수 있을까요?</b> 학습을 판단하려면 어떤 정보가 더 필요할지 떠올려 보세요.</p>`}
 ],
 share:"투표 + 이유 한 줄 → 패들렛 ‘1차시’ 칸",
 tips:["결과물의 좋고 나쁨보다 ‘학생의 학습을 확인하는 데 무엇이 더 필요한가’에 초점을 맞춥니다."]},

{id:"s3", part:1, num:3, short:"창작 과정의 학습의 증거", time:"11:15 · 15분", title:"창작 과정마다 남는 학습의 증거", img:"redi_magnifier",
 lead:"결과물은 AI가 대신 만들어 줄 수 있어요. 그럼 학생의 학습은 어디에 남을까요? 카드를 뒤집어 창작 과정과 학습의 증거를 짝지어 보세요.",
 blocks:[
  {k:"memory"},
  {k:"html", h:`<details class="fold"><summary>📋 정리표로 한눈에 보기</summary><div class="scroll"><table class="t"><tr><th>창작 과정</th><th>학습의 증거</th></tr>
  <tr><td class="k">의도 · 발상</td><td>아이디어 메모, 초기 스케치, 스토리보드</td></tr>
  <tr><td class="k">AI와 상호작용</td><td>프롬프트, 질문 및 응답 기록</td></tr>
  <tr><td class="k">선택 및 판단</td><td>생성 결과 비교, 선택 및 미선택의 이유</td></tr>
  <tr><td class="k">수정 및 재구성</td><td>수정 전과 후 비교, 수정 이유</td></tr>
  <tr><td class="k">완성</td><td>최종 창작물</td></tr>
  <tr><td class="k">성찰</td><td>창작 과정 설명, 자기 평가, 동료 피드백</td></tr></table></div></details>`},
  {k:"html", h:`<h2 class="sec">사례로 점검하기<small>우리 지역을 소개하는 AI 그림책 만들기</small></h2>
  <p style="color:var(--sub)">지역의 특징을 조사해 이야기를 구성하고, 생성형 AI로 그림책의 이미지와 일부 표현을 만드는 수업이에요. Q1. 확인하고 싶은 학습 목표는? Q2. 그것을 확인하려면 어떤 증거가 필요할까요?</p>
  <div class="scroll"><table class="t"><tr><th>평가하고 싶은 학습</th><th>학습의 증거</th></tr>
  <tr><td>자신의 창작 의도를 구체화한다</td><td>아이디어, 스토리보드</td></tr>
  <tr><td>다양한 표현을 비교하여 적절한 것을 선택한다</td><td>생성 결과 비교, 선택 및 미선택의 이유</td></tr>
  <tr><td>자신의 의도에 맞게 표현을 수정한다</td><td>수정 전과 후 비교, 수정 이유</td></tr>
  <tr><td>자신의 창작 과정을 설명하고 성찰한다</td><td>최종 작품, 창작 성찰 기록</td></tr></table></div>`},
  {k:"case", nolink:1, t:"강사 수업에 남은 학습의 증거 · AI 네이처 멘토 (초3 생체모방 발명교실)", h:`<p style="margin:0 0 10px;color:var(--sub)">관찰 → 연결 → 발명 → 소감 단계마다 학생이 쓴 것이 앱 기록에 그대로 남았어요. AI 멘토는 답을 주지 않고 되묻고, 고르는 일은 학생 몫으로 남겼어요.</p><div class="scroll"><table class="t"><tr><th>창작 과정</th><th>AI 네이처 멘토 수업에 남은 증거</th></tr>
  <tr><td class="k">의도 · 발상</td><td>생물 관찰 ‘비밀 카드’(무엇이 · 어떻게 · 왜), 생활 속 문제 한 줄</td></tr>
  <tr><td class="k">AI와 상호작용</td><td>AI 멘토의 칭찬 · 되묻는 질문 2개와 학생의 답 (대화 기록)</td></tr>
  <tr><td class="k">선택 및 판단</td><td>AI가 내민 생물 후보 3개 중 고른 생물과 고른 이유</td></tr>
  <tr><td class="k">수정 및 재구성</td><td>내 그림과 AI 그림 비교 메모 <small style="color:var(--sub)">“AI 그림에는 발이 없어요. 그래서 저는 발을 그렸어요.”</small></td></tr>
  <tr><td class="k">완성</td><td>발명품 이름 · 설명 · 그림 (발명 갤러리)</td></tr>
  <tr><td class="k">성찰</td><td>친구 댓글 · 좋아요, 소감 ‘자연은 나에게 ○○이다’, 생물 지킴이 약속</td></tr></table></div>`},
  {k:"html", h:`<h2 class="sec">평가 기준을 다시 써 보면</h2><div class="scroll"><table class="t"><tr><th>전</th><th>후</th></tr>
  <tr><td>주제에 맞는 이미지를 완성도 있게 만들었다.</td><td>자신의 창작 의도에 따라 AI가 생성한 여러 표현을 비교하고, 적절한 결과를 선택 및 수정하여 작품에 반영하였다.</td></tr>
  <tr><td>AI를 활용하여 이야기를 제작하였다.</td><td>자신의 아이디어를 바탕으로 AI의 결과를 검토하고 선택 및 수정하여 이야기를 구체화하였다.</td></tr>
  <tr><td>(강사 수업 예) 모둠 챗봇을 완성하여 발표하였다.</td><td>챗봇의 답변을 자신이 정리한 자료와 비교하여 오류를 찾고, 정보 카드를 고쳐 다시 학습시켰다.</td></tr></table></div>`}
 ],
 tips:["평가 항목을 잘게 나누기보다, 학습목표와 바로 이어지는 핵심 증거 몇 가지를 찾는 것이 목표예요."]},

{id:"s4", part:1, num:4, short:"내 수업의 목표와 증거 (실습)", time:"11:30 · 20분", title:"내 수업의 학습목표와 학습의 증거 정리하기", img:"redi_idea",
 lead:"내가 실천한 AI 기반 창작수업을 떠올리며, 평가하고 싶은 학습과 그 증거를 짝지어 적어 봅니다. 마지막 칸 한 줄이 1차시 정리예요.",
 how:["AIEDAP에 올린 내 지도안을 옆에 띄워요","평가하고 싶은 학습을 2~4개 고릅니다 (칸마다 예시 있음)","각 학습의 증거를 짝지어 적어요","‘더 확인하고 싶은 증거 한 가지’를 패들렛에 올려요"],
 sheet:"W1",
 blocks:[{k:"html", h:`<div class="quote">정리 문장 틀 — “내 수업의 학습목표는 ____이고, 그것을 확인하려면 ____이(가) 더 남아야 한다.”</div>`}],
 share:"‘더 확인하고 싶은 증거 한 가지’ → 패들렛 ‘1차시’ 칸 · 2차시 성찰로 이어집니다",
 tips:["평가 도구를 새로 만드는 시간이 아니에요. ‘무엇을 증거로 볼 것인가’를 판단하는 데 집중해요."]},

/* ───────── PART 2 · 2차시 성찰 ───────── */
{id:"s5", part:2, num:5, short:"교육과정에서 출발하기", time:"12:00 · 15분", title:"내 수업에서 AI는 학생의 교과 학습과 창작을 넓혔을까?", img:"part2",
 lead:"1차시에 찾은 학습의 증거를 떠올리며, 성취기준과 핵심 학습 과정에서 출발해 내 수업을 다시 봅니다.",
 blocks:[
  {k:"html", h:`<div class="scroll"><table class="t"><tr><th>교과</th><th>AI 활용 예시</th><th>성찰 질문</th></tr>
  <tr><td class="k">국어</td><td>아이디어, 문장, 초안 생성</td><td>내용을 생성·조직하고 자신의 표현으로 고쳐 쓰는 과정이 있었는가?</td></tr>
  <tr><td class="k">음악</td><td>리듬, 가사, 배경음악 생성</td><td>음악적 의도와 선택 및 변형 과정이 있었는가?</td></tr>
  <tr><td class="k">미술</td><td>이미지 생성 및 수정</td><td>발상과 표현 의도, 선택 및 수정의 과정이 드러났는가?</td></tr>
  <tr><td class="k">사회 / 과학 등</td><td>포스터, 영상, 카드뉴스 제작</td><td>교과 개념의 이해와 표현이 AI 생성물의 완성도에 가려지지 않았는가?</td></tr>
  <tr><td class="k">과학 / 실과</td><td>관찰 자료로 챗봇 제작</td><td>직접 관찰한 자료가 근거가 되고, AI의 답을 그 사실과 비교하였는가?</td></tr></table></div>`},
  {k:"case", t:"강사의 작성 예", h:`<p><b>교육과정 기반 수업 정보</b> · 5학년 실과 ‘디지털 사회와 인공지능’ [6실05-03] [6실05-05]</p><p><b>핵심 학습 과정</b> · 자료 수집·구조화 → 챗봇 제작 → 답변 검증·수정 → 공유</p><p><b>AI가 미친 영향</b> · (지원) 내가 준 자료가 답이 되는 과정을 확인 / (주의) 보충 조사는 ‘사실 확인 필수’</p>`}
 ],
 sheet:"W2",
 links:[["2022 개정 교육과정 (국가교육과정정보센터)","https://ncic.re.kr"]],
 tips:["성취기준을 적는 데서 멈추지 말고, 실제 학생의 수행과 어떻게 이어졌는지를 확인해요."]},

{id:"s6", part:2, num:6, short:"여섯 렌즈 성찰표 (실습)", time:"12:15 · 20분", title:"여섯 렌즈로 내 수업 다시 보기", img:"part2",
 lead:"어제는 우수 사례를 렌즈 하나로 보았다면, 오늘은 내 수업을 렌즈 여섯 개 모두로 봅니다. 렌즈마다 ‘효과적이었던 점’과 ‘다시 생각해볼 점’을 장면으로 적어요.",
 blocks:[
  {k:"lenses"},
  {k:"xo", t:"좋았다·아쉬웠다 대신, 장면으로 쓰기", x:["학생들의 참여도가 좋았다.","AI에 의존하는 것이 아쉬웠다."], o:["AI가 만든 이미지를 비교한 뒤 자신의 스케치와 가장 가까운 이미지를 선택하고 이유를 설명하였다.","5모둠 중 3개 모둠이 AI가 만든 문구를 수정하지 않고 그대로 사용하였다."]},
  {k:"case", t:"강사 수업을 여섯 렌즈로 본 예", h:`<div class="scroll"><table class="t"><tr><th>관점</th><th>효과적이었던 점</th><th>다시 생각해볼 점</th></tr>
  <tr><td class="k" style="color:var(--l1)">교육적</td><td>직접 모은 자료가 챗봇의 근거가 되어 ‘AI가 만들어지는 과정’을 체험함</td><td>실천 다짐이 실제 실천으로 이어졌는가 (실제 실천 p = .053)</td></tr>
  <tr><td class="k" style="color:var(--l2)">학습자</td><td>챗봇이 틀리자 학생이 카드를 다시 열어 고치고 다시 올림</td><td>더 어려운 과제에 도전할 선택지가 있었는가</td></tr>
  <tr><td class="k" style="color:var(--l3)">기술적</td><td>올린 자료를 근거로 답해, 답과 원본을 비교할 수 있었음</td><td>소스 정리에 시간이 걸렸다는 학생 반응</td></tr>
  <tr><td class="k" style="color:var(--l4)">평가</td><td>검증표(○·△·×)와 보완 전·후 카드로 판단 과정을 확인함</td><td>7차시 다짐 이후의 실천을 확인할 증거가 있었는가</td></tr>
  <tr><td class="k" style="color:var(--l5)">윤리적</td><td>사용 수칙을 안내하고 검증 3단계로 환각을 직접 찾게 함</td><td>사용 수칙 지도를 프로그램 초반으로 당길 필요</td></tr>
  <tr><td class="k" style="color:var(--l6)">실행</td><td>공원 탐사와 챗봇 제작에서 참여도가 뚜렷하게 높았음</td><td>교사·교육용 계정 환경이 갖춰져야 다른 교실에서도 가능</td></tr></table></div>`}
 ],
 sheet:"W3",
 tips:["모든 렌즈를 같은 양으로 채우지 않아도 돼요. 의미 있는 장면이 있는 렌즈부터 적어요.","여섯 렌즈는 따로 노는 체크리스트가 아니에요. 한 장면이 여러 렌즈에 걸칠 수 있어요."]},

{id:"s7", part:2, num:7, short:"핵심 문제 한 가지", time:"12:35 · 15분", title:"가장 먼저 풀고 싶은 문제 한 가지", img:"redi_thumbs",
 lead:"성찰표에서 찾은 근거로, 유지할 것과 다시 설계할 것을 나누고 가장 먼저 해결할 문제 한 가지를 고릅니다. 3차시에 그대로 들고 가요.",
 sheet:"W4",
 blocks:[
  {k:"case", t:"강사가 정한 출발점", h:`<p><b>유지하고 싶은 부분</b> · 직접 관찰한 자료로 AI를 가르치는 흐름, 검증 3단계</p><p><b>다시 설계하고 싶은 부분</b> · 사용 수칙을 지도하는 시점, 7차시 이후의 실천</p><p><b>가장 먼저 해결할 문제</b> · 다짐은 뚜렷이 늘었지만(3.88 → 4.34) 실제 실천은 상승 경향에 그침(3.81 → 4.07, p = .053). 7차시 다짐 뒤에 실천을 확인하는 차시가 없었음</p><p><b>개선 방향</b> · 실천 기록이 다시 챗봇의 자료가 되게 함 (다짐 → 실천 기록 → 소스 추가 → 챗봇 업데이트)</p>`}
 ],
 share:"모둠에서 1인 1분씩 ‘내 핵심 문제’ 말하기 → 패들렛 ‘2차시’ 칸에 한 줄",
 tips:["AI 도구를 새로 넣거나 바꾸는 것을 곧바로 개선으로 보지 않아요.","3차시에 그대로 쓸 수 있게 ‘누가, 어느 장면에서’가 드러나게 적어요."]},

/* ───────── PART 3 · 3차시 재설계 ───────── */
{id:"s8", part:3, num:8, short:"Re-design은 연결을 다시 짓기", time:"14:00 · 15분", title:"Re-design = 수업의 연결 지점을 다시 설계하는 것", img:"part3",
 lead:"도구 하나를 바꾸는 것이 아니라, 학습 목표부터 학습의 증거까지 여섯 요소의 연결을 다시 짓는 일이에요. 하나를 바꾸면 맞물린 다른 요소도 함께 바뀝니다.",
 blocks:[
  {k:"cmp", t:"단순 수정과 Re-design", a:["단순 수정","AI 도구를 바꾸거나 추가","활동 하나를 더 넣기","평가 문구만 손보기"], b:["Re-design","2차시 핵심 문제에서 출발","여섯 요소의 <b>연결</b>을 점검","바뀐 요소가 서로 맞물리는지 확인"]},
  {k:"html", h:`<h2 class="sec">여섯 가지 설계 요소</h2><div class="hexwrap">
   <div class="hex"><span>🎯</span><div><b>학습 목표</b><small>성취기준과 정합성</small></div></div>
   <div class="hex"><span>🧩</span><div><b>학습 활동</b><small>목표에 이르는 수행</small></div></div>
   <div class="hex"><span>🤖</span><div><b>기술의 역할</b><small>AI를 왜, 언제 쓰나</small></div></div>
   <div class="hex"><span>💭</span><div><b>학생의 사고</b><small>생각·선택·판단의 자리</small></div></div>
   <div class="hex"><span>🤝</span><div><b>교사의 지원</b><small>발문, 양식, 안내</small></div></div>
   <div class="hex"><span>📂</span><div><b>학습의 증거</b><small>무엇이 남는가</small></div></div></div>`},
  {k:"case", t:"강사 수업의 연결 다시 짓기", h:`<div class="scroll"><table class="t"><tr><th>설계 요소</th><th>기존</th><th>Re-design</th></tr>
  <tr><td class="k">학습 목표</td><td>보전 실천을 다짐한다</td><td>실천하고, 그 기록을 공유한다</td></tr>
  <tr><td class="k">학습 활동</td><td>7차시 다짐 기록으로 마침</td><td>실천 기록과 후속 차시 추가</td></tr>
  <tr><td class="k">기술의 역할</td><td>정보 카드로 답하는 챗봇</td><td>실천 기록이 더해지는 챗봇</td></tr>
  <tr><td class="k">학생의 사고</td><td>답이 카드와 같은지 판단</td><td>챗봇에 넣을 기록을 선별</td></tr>
  <tr><td class="k">교사의 지원</td><td>검증 3단계 안내</td><td>기록 양식과 선별 기준 제공</td></tr>
  <tr><td class="k">학습의 증거</td><td>검증표, 보완 전·후 카드</td><td>실천 기록, 답변 전·후 비교</td></tr></table></div>`},
  {k:"html", h:`<h2 class="sec">참고할 설계 원리<small>표준안 수록 연구</small></h2><div class="grid g3">
   <div class="card pad"><b>목표–내용–방법–평가 일관성</b><p style="margin:6px 0 0;color:var(--sub);font-size:14.5px">성취기준과 정합성 검토, 학습자 발달 수준에 맞는 목표, 문제해결역량과의 연결</p></div>
   <div class="card pad"><b>교과 간 내용 조직</b><p style="margin:6px 0 0;color:var(--sub);font-size:14.5px">교과 지식·기술·태도 분석, 공통 핵심어로 성취기준 연계</p></div>
   <div class="card pad"><b>인공지능(기술) 융합</b><p style="margin:6px 0 0;color:var(--sub);font-size:14.5px">학습자 특성과 학습 목표에 맞는 AI 도구 선택</p></div></div>
   <p style="font-size:12.5px;color:var(--sub)">출처: 홍수민(2026). 문제해결역량을 위한 인공지능 융합교육 수업설계 모형 및 원리 개발 연구. 서울대학교 박사학위논문. / 오유나 외(2025). 비판적 사고 함양을 위한 PBL 기반 생성형 AI 활용 질문 활동 수업 모형 개발. 교육공학연구, 41(1).</p>`}
 ],
 tips:["Re-design의 출발점은 언제나 2차시에 고른 ‘핵심 문제 한 가지’예요."]},

{id:"s9", part:3, num:9, short:"Before–Problem–Re-design", time:"14:15 · 10분", title:"Before – Problem – Re-design으로 정리하기", img:"redi_idea",
 lead:"바꿀 방향을 세 줄로 먼저 정리하면, AIEDAP 지도안을 고칠 때 길을 잃지 않아요. 함께 바뀌는 설계 요소도 표시해 둡니다.",
 sheet:"W5",
 blocks:[
  {k:"case", t:"강사의 Before – Problem – Re-design", h:`<div class="scroll"><table class="t"><tr><th>구분</th><th>강사의 수업</th></tr>
  <tr><td class="k">Before</td><td>7차시에 ‘나의 실천 한 가지’를 다짐으로 기록하고 마침</td></tr>
  <tr><td class="k">Problem</td><td>다짐은 뚜렷이 늘었지만, 실제 실천은 상승 경향에 그침<br>언어적 실천의지 3.88 → 4.34 / 실제 실천 3.81 → 4.07 (p = .053)</td></tr>
  <tr><td class="k">Re-design</td><td>실천 기록을 챗봇의 새 자료로 추가하고, 달라진 답을 확인하는 후속 차시를 둠</td></tr></table></div>`}
 ],
 tips:["‘가장 크게 바뀐 지점’과 ‘피드백 받고 싶은 부분’ 두 칸은 4차시 모둠 공유에서 그대로 씁니다."]},

{id:"s10", part:3, num:10, short:"AIEDAP에서 지도안 고치기 (실습)", time:"14:25 · 25분", title:"AIEDAP 사이트에서 Re-design 지도안 작성하기", img:"redi_laptop",
 lead:"오늘 가장 긴 실습이에요. 내 지도안을 열어 바꿀 요소를 고치고, 검증 절차로 점검한 뒤 저장합니다. 강사와 보조강사 선생님들이 모둠을 돌며 도와드려요.",
 how:["AIEDAP › AI 융합수업 설계에서 내 지도안 열기","핵심 문제 한 줄을 지도안 맨 위에 적기","바꿀 요소 표시 → 맞물린 요소도 함께 고치기","검증 절차로 점검하고 ‘피드백 받을 수 있는 초안’으로 저장"],
 blocks:[
  {k:"html", h:`<div class="btns" style="margin-top:0"><a class="b r" href="https://www.aiedap.or.kr/ai-class/generator" target="_blank">AIEDAP AI 융합수업 설계 열기 ↗</a><a class="b w" href="https://www.aiedap.or.kr" target="_blank">AIEDAP 홈 ↗</a></div>`},
  {k:"html", h:`<h2 class="sec">막힐 때 · 우수 사례에 이렇게 물어봐요<small>선택 활동</small></h2>
  <p style="color:var(--sub)">권역별 우수 사례집을 Gemini 노트북에 넣고 질문해 보세요. 답을 받으면 인용 표시를 눌러 원문과 대조합니다. 최종 설계 판단은 선생님이 해요.</p>
  <div class="grid g3"><div class="card pad">“학생이 AI 결과를 검토하거나 수정하는 활동을 찾아 표로 정리해 줘.”</div><div class="card pad">“내 수업과 비슷한 사례를 골라 AI의 역할과 활용 시점을 비교해 줘.”</div><div class="card pad">“각 사례의 평가 계획에서 ‘학습의 증거’로 볼 수 있는 것을 뽑아 줘.”</div></div>
  <div class="btns"><a class="b w sm" href="https://notebooklm.google.com" target="_blank">Gemini 노트북(NotebookLM) ↗</a><a class="b w sm" href="https://gemini.google.com" target="_blank">제미나이 ↗</a></div>`}
 ],
 tips:["사이트 입력 자체가 목적이 되지 않게, 고칠 때마다 ‘이게 내 핵심 문제를 푸는가?’를 물어요.","생성형 AI는 아이디어를 넓히는 데만 보조로 쓰고, 고르고 판단하는 일은 내가 합니다."]},

{id:"s11", part:3, num:11, short:"3차시 정리", time:"14:45 · 5분", title:"바뀐 지점 하나, 받고 싶은 피드백 하나", img:"redi_thumbs",
 lead:"완성보다 피드백을 받을 수 있는 초안이 목표예요. 활동지 W5의 마지막 두 칸을 채우고 4차시로 갑니다.",
 blocks:[{k:"html", h:`<div class="grid g2"><div class="card pad"><b style="color:var(--blue)">가장 크게 바뀐 지점</b><p style="margin:6px 0 0;color:var(--sub)">기존 수업과 달라진 것 한 가지</p></div><div class="card pad"><b style="color:var(--blue)">피드백 받고 싶은 부분</b><p style="margin:6px 0 0;color:var(--sub)">동료가 보아 주었으면 하는 곳 한 가지</p></div></div>`}],
 sheet:"W5"},

/* ───────── PART 4 · 4차시 공유·환류 ───────── */
{id:"s12", part:4, num:12, short:"공유 규칙: 두 팀으로", time:"15:00 · 5분", title:"7~8명 모둠을 두 팀으로 (4명 + 3~4명)", img:"part4",
 lead:"발표 대회가 아니라 서로의 설계를 검토하고 고칠 점을 찾는 시간이에요. 원탁 7~8명이 두 팀(4명 + 3~4명)으로 나누어, 한 사람에 7분씩 돌아갑니다. 3명 팀은 21분, 4명 팀은 28분이에요.",
 blocks:[
  {k:"html", h:`<div class="grid g3">
   <div class="card pad" style="border-top:6px solid var(--l1)"><b style="font-size:20px">3분 · 설명</b><p style="margin:6px 0 0;color:var(--sub)">Before – Problem – Re-design과 피드백 받고 싶은 부분</p></div>
   <div class="card pad" style="border-top:6px solid var(--l4)"><b style="font-size:20px">3분 · 피드백</b><p style="margin:6px 0 0;color:var(--sub)">여섯 관점 가운데 하나를 골라 근거와 함께</p></div>
   <div class="card pad" style="border-top:6px solid var(--l6)"><b style="font-size:20px">1분 · 기록</b><p style="margin:6px 0 0;color:var(--sub)">받은 피드백을 적고 다음 사람으로</p></div></div>
   <div class="btns"><a class="b r" href="#timer">공유 타이머 열기 (7분 × 4명)</a></div>`},
  {k:"html", h:`<h2 class="sec">함께 지킬 약속</h2><div class="grid g3"><div class="card pad">👍 <b>강점 먼저</b><br><span style="color:var(--sub)">잘 작동한 요소를 구체적 장면으로</span></div><div class="card pad">🔎 <b>근거와 함께</b><br><span style="color:var(--sub)">“좋다” 대신 어느 설계 요소, 어떤 학생 행동인지</span></div><div class="card pad">🤝 <b>함께 대안 찾기</b><br><span style="color:var(--sub)">어려웠던 점은 발표자의 문제가 아니라 함께 풀 문제로</span></div></div>`}
 ],
 tips:["어제 모듈 1 오후에는 실천 사례 자체를 나눴어요. 오늘은 ‘바꾼 지점’만 나눕니다."]},

{id:"s13", part:4, num:13, short:"6관점 동료 피드백", time:"15:05 · 28분", title:"여섯 관점으로 동료의 Re-design 보기", img:"redi_heart",
 lead:"듣는 사람은 여섯 관점 가운데 하나를 골라, 근거를 들어 피드백해요. 받은 피드백은 바로 기록합니다.",
 blocks:[
  {k:"html", h:`<div class="scroll"><table class="t"><tr><th>관점</th><th>이렇게 물어요</th></tr>
  <tr><td class="k">정합성</td><td>목표 – 활동 – AI – 평가가 연결되어 있는가?</td></tr>
  <tr><td class="k">기술의 역할</td><td>AI를 사용해야 하는 이유가 분명한가?</td></tr>
  <tr><td class="k">주도성</td><td>학생이 생각하고, 선택하고, 판단하는 지점이 충분한가?</td></tr>
  <tr><td class="k">증거</td><td>학생의 학습을 확인할 증거가 있는가?</td></tr>
  <tr><td class="k">성찰</td><td>학생이 자신의 창작과 AI 활용을 돌아보는가?</td></tr>
  <tr><td class="k">실행 가능성</td><td>실제 교실에서 실행 가능한가?</td></tr></table></div>
  <div class="quote"><b>피드백 문장 틀</b> · “○○ 장면이 잘 작동할 것 같아요(강점). ○○ 관점에서 보면 ○○를 더해 보면 어떨까요?(제안)”</div>`}
 ],
 sheet:"W6",
 tips:["시간이 남으면 두 팀이 ‘가장 크게 바뀐 점’을 1분씩 서로 들려주세요. 모둠 전원이 모두의 재설계를 알게 돼요. 3명 팀은 남는 7분을 이렇게 쓰면 좋아요."]},

{id:"s14", part:4, num:14, short:"반영하고 한 문장으로", time:"15:35 · 15분", title:"골라서 반영하고, 한 문장으로 정리하기", img:"part4",
 lead:"받은 피드백을 모두 반영할 필요는 없어요. 내 학습목표와 학생, 교실 환경에 맞는 것을 골라 AIEDAP 지도안을 고치고, 나의 Re-design을 한 문장으로 남깁니다.",
 how:["반영할 피드백 고르기 (W6)","AIEDAP 지도안 수정·최종 저장","수료 제출: 공유마당 공유 + 대시보드 제출","한 문장 완성 (W7) → 패들렛 ‘4차시’ 칸"],
 sheet:"W7",
 blocks:[{k:"html", h:`<div class="tip" style="border-color:var(--gold);background:var(--goldS)"><b>수료 제출</b>다시 설계한 지도안을 <b>두 곳 모두</b> 올려야 수료로 인정돼요. ① AIEDAP 공유마당에 공유 ② 나의 역량 분석 대시보드 › 수료 제출물 제출 › 「AI융합수업설계지도안 제출」</div>`},{k:"case", t:"강사의 한 문장", h:`<p>기존에는 <b>실천을 다짐하고 끝나는</b> 수업이었지만, 학생이 <b>자신의 실천을 기록하고 그 기록으로 챗봇을 다시 가르칠</b> 수 있도록 <b>‘실천 기록이 AI의 자료가 되는 흐름’</b>을 중심으로 다시 설계하였습니다.</p>`},
  {k:"html", h:`<div class="quote" style="text-align:center;font-size:17px"><b>평가 → 성찰 → 재설계 → 환류</b><br>오늘 한 바퀴가 다음 수업의 출발점이 됩니다.</div>`}],
 share:"나의 Re-design 한 문장 → 패들렛 ‘4차시’ 칸",
 tips:["기술 활용 자체가 아니라 ‘학생에게 기대하는 변화’와 ‘핵심 설계 변화’가 문장 안에서 이어지게 써요."]},

/* ───────── PART 5 · 모듈 5 ───────── */
{id:"s15", part:5, num:15, short:"왜 전문성 개발인가", time:"16:00", title:"AX 시대, 교사가 계속 자라야 하는 이유", img:"part5",
 lead:"연수의 마지막 모듈이에요. 마스터교원으로서 앞으로 어떻게 성장할지 계획을 세우고 모둠에서 나눕니다.",
 blocks:[
  {k:"html", h:`<div class="tip" style="border-color:var(--gold);background:var(--goldS)"><b>먼저 확인</b>수료 제출물 — 모듈 4에서 다시 설계한 지도안을 ① 공유마당에 공유하고 ② 나의 역량 분석 대시보드 › 수료 제출물 제출 › 「AI융합수업설계지도안 제출」에 올렸나요? 두 곳 모두 해야 수료로 인정돼요.</div>
  <div class="quote" style="font-size:18px">“AI 시대의 교육혁신은 교사의 역량에 달려있다”<br><small style="color:var(--sub)">「대한민국 인공지능 행동계획」(2026. 2. 25., 국가인공지능전략위원회)</small></div>
  <h2 class="sec">교원 AI·디지털 교육역량체계의 3대 핵심가치</h2><div class="grid g3">
   <div class="card pad"><b>인간의 존엄성을 위한 교육</b><p style="margin:6px 0 0;color:var(--sub);font-size:14.5px">Ⓐ AI·디지털 기반 교육 이해 · Ⓑ 윤리적 실천</p></div>
   <div class="card pad"><b>모든 학생의 성장</b><p style="margin:6px 0 0;color:var(--sub);font-size:14.5px">Ⓒ 수업 및 학습자 분석 · Ⓓ 교수·학습 및 평가 설계 · Ⓔ 교수·학습 실행 · Ⓕ 평가 실행</p></div>
   <div class="card pad"><b>교사 전문성</b><p style="margin:6px 0 0;color:var(--sub);font-size:14.5px">Ⓖ AI·디지털 기반 교사 전문성 개발</p></div></div>
   <p style="font-size:12.5px;color:var(--sub)">출처: 한국교육학술정보원(2026). 교원 AI·디지털 교육 역량체계</p>`}
 ],
 share:"질문 — “AX 시대, 교사에게 전문성 개발이 필요한 이유는?” 한 줄 → 패들렛 ‘모듈 5’ 칸"},

{id:"s16", part:5, num:16, short:"G역량과 성장 단계", time:"16:15", title:"G역량: 교사 전문성 개발이라는 내비게이터", img:"redi_idea",
 lead:"G역량은 이미 배운 A~F 역량을 통합하고 조율하는 ‘메타 역량’이에요. 지속적 전문성 개발은 연수에서 끝나지 않고 실천과 공유로 이어집니다.",
 blocks:[
  {k:"html", h:`<div class="grid g3">
   <div class="card pad" style="border-top:6px solid var(--l1)"><b>G1 · 전문성 영역 이해</b><p style="margin:6px 0 0;color:var(--sub);font-size:14.5px">역량체계 이해, 교수·학습 혁신 이해, 디지털 생산자와 윤리적 활용</p></div>
   <div class="card pad" style="border-top:6px solid var(--l3)"><b>G2 · 전문성 계획 수립</b><p style="margin:6px 0 0;color:var(--sub);font-size:14.5px">역량체계 기반 자기 진단, 맞춤형 개발 경로, AI 학습 자원 확보</p></div>
   <div class="card pad" style="border-top:6px solid var(--l4)"><b>G3 · 실천 기반 성찰과 협력적 성장</b><p style="margin:6px 0 0;color:var(--sub);font-size:14.5px">학습공동체 공동 실천, 콘텐츠 제작과 공유·확산, 실천 기록 기반 성찰과 환류</p></div></div>
  <div class="quote">연수 → 수업 실천 → 성찰과 공유 → 학교·지역 확산 → 교육혁신 기여 <small style="color:var(--sub)">· 실천가(Lv.3)에서 개척자(Lv.6)로</small></div>
  <h2 class="sec">AIEDAP 교사 전문성 수준</h2>
  <table class="lv">
   <tr><td style="--c:#2a3f9e">Lv.6</td><td class="n">개척자</td><td>새로운 도구와 방법론을 개발하고, 정책에 영향을 미치며 미래 교육을 선도하는 롤모델</td></tr>
   <tr><td style="--c:#3b5bd0">Lv.5</td><td class="n">선도자</td><td>교육적 활용 비전을 가지고 조직 변화를 주도, 동료 멘토링과 정책 수립으로 교육 혁신을 이끔</td></tr>
   <tr><td style="--c:#4f7ae6">Lv.4</td><td class="n">전문가</td><td>창의적·비판적으로 활용해 교육 혁신을 주도하며 동료를 지원하고 조직 변화를 이끌어 냄</td></tr>
   <tr><td style="--c:#6d93ef">Lv.3</td><td class="n">실천가</td><td>효과적으로 활용하려 노력하나 최적의 적용을 찾기 위해 지속적인 전문성 개발이 필요</td></tr>
   <tr><td style="--c:#93afee">Lv.2</td><td class="n">탐색가</td><td>수업 도입을 시도하지만 체계적 접근이 부족해 지속적 학습과 협력이 필요</td></tr>
   <tr><td style="--c:#b7c8ef">Lv.1</td><td class="n">입문가</td><td>교육적 잠재력은 인식하지만 실제 활용에 익숙하지 않아 지원과 연수가 필요</td></tr></table>
   <p style="font-size:12.5px;color:var(--sub)">출처: 교육부(2026. 3.). AI·디지털 기반 교육혁신을 지원하기 위한 2026년 AIEDAP 사업 기본계획</p>`}
 ]},

{id:"s17", part:5, num:17, short:"AIEDAP에서 내 역량 확인 (실습)", time:"16:35", title:"AIEDAP에서 내 역량 확인하기", img:"redi_laptop",
 lead:"AI 융합 통합 지원 플랫폼에서 내 역량 수준을 확인하고, 나에게 맞는 연수·활동과 학습 자원을 찾아봅니다.",
 how:["aiedap.or.kr 로그인","‘나의 역량분석 대시보드’에서 역량 수준·강점·보완 확인","맞춤형 연수/활동 추천 검색","우수 AI 융합 수업 사례 콘텐츠와 e-포트폴리오 둘러보기"],
 blocks:[
  {k:"html", h:`<div class="grid g3">
   <div class="card pad"><b style="color:var(--blue)">1단계 · 자기 진단</b><p style="margin:6px 0 0;color:var(--sub)">나의 역량 수준은 Lv. 몇인가요? 강점 역량과 보완이 필요한 역량은?</p></div>
   <div class="card pad"><b style="color:var(--blue)">2단계 · 맞춤형 경로</b><p style="margin:6px 0 0;color:var(--sub)">추천 연수·활동 가운데 보완 역량을 채울 것을 골라요</p></div>
   <div class="card pad"><b style="color:var(--blue)">3단계 · AI 학습 자원</b><p style="margin:6px 0 0;color:var(--sub)">우수 AI 융합 수업 사례 콘텐츠로 자원 네트워크 만들기</p></div></div>
   <div class="btns"><a class="b r" href="https://www.aiedap.or.kr/training/cpd" target="_blank">AIEDAP 지속적 전문성 개발 ↗</a><a class="b w" href="https://www.aiedap.or.kr" target="_blank">AIEDAP 홈 ↗</a></div>`}
 ]},

{id:"s18", part:5, num:18, short:"나의 성장 계획 (실습·공유)", time:"16:55", title:"나의 지속적 전문성 개발 계획 세우기", img:"part5",
 lead:"목표 레벨을 정하고, 이번 연수를 바탕으로 한 단기(6개월 이내)·장기(1년 이상) 계획을 적은 뒤 모둠에서 1인 2분씩 나눕니다.",
 sheet:"W8",
 share:"모둠에서 1인 2분씩 공유 → 단기 계획 한 줄을 패들렛 ‘모듈 5’ 칸에",
 tips:["계획은 ‘무엇을, 언제까지, 누구와’가 보이면 실천으로 이어지기 쉬워요."]},

{id:"s19", part:5, num:19, short:"한 문장과 사후 역량 측정", time:"17:30", title:"AX 시대의 교사 전문성은 ___ 이다", img:"end",
 lead:"오늘의 마지막 한 문장을 남기고, 사후 역량 측정으로 연수를 마칩니다.",
 blocks:[{k:"html", h:`<div class="grid g2"><div class="card pad"><b style="font-size:18px">한 문장 남기기</b><p style="color:var(--sub);margin:6px 0 0">W8 마지막 칸을 채워 패들렛에 올려요.</p></div><div class="card pad"><b style="font-size:18px">사후 역량 측정</b><p style="color:var(--sub);margin:6px 0 0">역량 코드는 연수마다 달라요. 당일 화면의 안내를 따라 주세요.</p></div></div>
 <div class="quote" style="text-align:center">끝까지 함께해 주셔서 고맙습니다. 18:00에 마칩니다.</div>`}]}
];

window.TOOLS = [
  ["#sheets","📝","내 활동지 모음","자동 저장 · 한 번에 복사"],
  ["#timer","⏱️","모둠 공유 타이머","7분 × 4명 · 큰 화면"],
  ["#lens","🔍","여섯 렌즈 한눈에","모듈 1 상기용"],
  ["#case","🌿","강사 사례","우리 동네 생물 탐정"]
];

window.LINKS = [
  ["https://www.aiedap.or.kr/ai-class/generator","🧭","AI 융합수업 설계","AIEDAP · 3차시 지도안"],
  ["https://www.aiedap.or.kr/ai-class/reflection","🪞","AI 융합수업 성찰","AIEDAP · 내 성찰 보고서"],
  ["https://www.aiedap.or.kr/training/cpd","🌱","지속적 전문성 개발","AIEDAP · 모듈 5"],
  ["https://www.aiedap.or.kr","🏠","AIEDAP 홈","로그인 · 역량분석 대시보드"],
  ["PADLET","📌","오늘의 패들렛","운영진 안내 회차 패들렛"],
  ["https://ncic.re.kr","📚","2022 개정 교육과정","국가교육과정정보센터"],
  ["https://notebooklm.google.com","📒","Gemini 노트북","우수 사례에 질문하기"],
  ["https://gemini.google.com","✨","제미나이","아이디어 보조 (선택)"]
];

window.CASE = {
  meta:[["대상","명진초 5학년 1개 반 21명 (6모둠)"],["기간","7차시 · 실과·과학·창의적 체험활동 연계"],["장소","교실, 명진근린공원, 디지털미래교육센터"],["성취기준","[6실05-03] [6실05-05]"],["유형","AI 기반 창작 · 학생 직접 활용(모둠)"],["도구","Google Lens·AI 도감, 패들렛, 구글 독스, 제미나이(보충 조사), NotebookLM, Canva"]],
  flow:["1차시 문제 인식 — 우리 곁의 생물을 얼마나 알까?","2차시 AI 도감·렌즈 판별 연습 — “AI도 틀릴 수 있다”","3차시 명진근린공원 현장 탐사 — 패들렛에 이름·사진·장소·특징","4차시 생물 정보 카드 — AI가 학습할 자료로 구조화","5~6차시 NotebookLM 챗봇 제작 — 검증 3단계로 확인·보완","7차시 챗봇 시연·동료 평가·홍보 포스터·실천 다짐"],
  dps:[
   {q:"AI 도감이 알려 준 이름, 그대로 기록해도 될까?", when:"2~3차시", a:"먼저 틀려 보게 하고, 눈으로 다시 확인하게 했습니다. 2차시 판별 연습으로 ‘AI도 틀릴 수 있다’를 직접 확인하고, 3차시에는 잎 모양·꽃 색 같은 특징을 비교한 뒤 기록했어요. 모둠마다 서로 다른 생물 6종 이상을 기록했습니다."},
   {q:"어떤 AI에게, 무엇을 가르치게 할까?", when:"4~5차시", a:"올린 자료를 근거로 답하는 NotebookLM을 골라, 학생이 쓴 생물 정보 카드를 소스로 올렸어요. 보충 조사는 ‘사실 확인 필수’ 규칙을 두었습니다. 학생 소감: “정보를 더 줄수록 똑똑해져서 내가 선생님이 된 기분이었다.”"},
   {q:"챗봇이 우리 카드에 없는 말을 할 때, 교사가 고쳐 줄까 학생이 찾게 할까?", when:"5~6차시 · 핵심 장면", a:"틀린 답을 고치는 일을 학생에게 맡겼어요. ① 출처 확인 ② 원본 비교 ③ 보완·재업로드의 검증 3단계로 찾고, 활동지 검증표에 ○·△·×로 기록했습니다. 같은 질문에 답이 달라지는 것을 확인하며 “내가 AI를 가르쳤다”는 말이 나왔어요."}
  ],
  stats:[["4.26","환경태도 (3.91 → , p < .001)"],["4.03","자기효능감 (3.78 → , p < .001)"],["4.34","언어적 실천의지 (3.88 → , p < .001)"],["4.07","실제 실천 (3.81 → , p = .053)"]],
  voices:["“챗봇에 소스를 추가하는 재미가 있다. 정보를 더 줄수록 똑똑해져서 내가 선생님이 된 기분이었다.”","“평소에는 우리가 AI의 도움을 받는데, AI를 우리가 직접 가르치니 내가 똑똑해진 것 같다.”"],
  note:"사전·사후 모두 응답한 20명, 대응표본 t검정 (1개 학급). 만족 이상 90%(21명 중 19명). 공동 실천: 최일훈·이상우 (B.I.O. 특공대)"
};
