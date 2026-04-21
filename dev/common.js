/* ============================================================
   common.js — Dajoong Live2D | 공통 스크립트
   모든 페이지에서 로드됩니다.
   ============================================================ */

/* ── 페이지 전환 페이드 ──────────────────────────────────── */
(function () {
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity 0.45s ease';
  window.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.style.opacity = '1';
      });
    });
  });

  /* 현재 페이지 파일명 추출 (예: "works.html") */
  function currentFile() {
    var p = window.location.pathname;
    return p.substring(p.lastIndexOf('/') + 1) || 'index.html';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('mailto') ||
        href.startsWith('http') || a.target === '_blank') return;

    /* 순수 앵커(#section) → 그냥 스크롤 */
    if (href.startsWith('#')) {
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    /* 같은 페이지 앵커(works.html#samples) → 스크롤만 */
    var parts   = href.split('#');
    var file    = parts[0];
    var anchor  = parts[1] || '';
    if (file === currentFile() || file === '') {
      e.preventDefault();
      if (anchor) {
        var el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    /* 다른 페이지 → 페이드 후 이동 */
    e.preventDefault();
    document.documentElement.style.opacity = '0';
    setTimeout(function () { window.location.href = href; }, 420);
  });
})();


/* ── 페이지 진입 시 URL 해시로 자동 스크롤 ─────────────── */
window.addEventListener('DOMContentLoaded', function () {
  var hash = window.location.hash;
  if (hash) {
    setTimeout(function () {
      var el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  }
});

/* ── 캘린더 위젯 ─────────────────────────────────────────── */
var SHEET_ID = '1l661Zg-lTXwDhpKZ3yeK7MWqDMc4ySu7omRg1qbmzhs';

var CAL_EVENTS_FALLBACK = [
  { date: '2025-12-08', type: 'open',  label: 'LD 모델 전신 시작' },
  { date: '2026-01-12', type: 'close', label: 'LD 모델 전신 완료' },
  { date: '2026-01-07', type: 'open',  label: 'LD 모델 전신 시작' },
  { date: '2026-01-21', type: 'close', label: 'LD 모델 전신 완료' },
  { date: '2026-02-01', type: 'open',  label: '개인 작품 작업 시작' },
  { date: '2026-02-28', type: 'close', label: '개인 작품 작업 완료' },
  { date: '2026-03-12', type: 'open',  label: 'LD 모델 및 파츠 시작' },
  { date: '2026-03-26', type: 'close', label: 'LD 모델 및 파츠 완료' },
  { date: '2026-03-23', type: 'open',  label: '동물,오너캐 타입 모델 작업 시작' },
  { date: '2026-04-06', type: 'close', label: '동물,오너캐 타입 모델 작업 완료' },
  { date: '2026-04-17', type: 'open',  label: '메모리얼 애니메이션 작업 시작' },
  { date: '2026-05-01', type: 'close', label: '메모리얼 애니메이션 작업 완료' }
];

var CAL_EVENTS = CAL_EVENTS_FALLBACK.slice();

function loadCalEvents(callback) {
  if (!SHEET_ID) { callback(); return; }
  var url = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID
          + '/gviz/tq?tqx=out:json&tq=' + encodeURIComponent('select *');
  fetch(url)
    .then(function(res){ return res.text(); })
    .then(function(text){
      var jsonStr = text.replace(/^[\s\S]*?\(/, '').replace(/\);?\s*$/, '');
      var json = JSON.parse(jsonStr);
      var cols = json.table.cols.map(function(c){ return (c.label||'').split('\n')[0].toLowerCase().trim(); });
      var rows = json.table.rows.map(function(r){
        var obj = {};
        cols.forEach(function(col, i){
          var cell = r.c[i];
          if (!cell || cell.v == null) { obj[col] = ''; return; }
          var val = String(cell.v);
          var dm = val.match(/^Date\((\d+),(\d+),(\d+)\)$/);
          if (dm) val = dm[1]+'-'+String(parseInt(dm[2])+1).padStart(2,'0')+'-'+String(dm[3]).padStart(2,'0');
          obj[col] = val.trim();
        });
        return obj;
      }).filter(function(e){ return e.date && e.type && e.label; });
      if (rows.length) CAL_EVENTS = rows;
      callback();
    })
    .catch(function(){ callback(); });
}

var calYear, calMonth, calOpen = false;

function toDate(str){ var p=str.split('-'); return new Date(+p[0],+p[1]-1,+p[2]); }

function buildRanges(){
  var opens = CAL_EVENTS.filter(function(e){return e.type==='open';}).map(function(e){return toDate(e.date);}).sort(function(a,b){return a-b;});
  var closes= CAL_EVENTS.filter(function(e){return e.type==='close';}).map(function(e){return toDate(e.date);}).sort(function(a,b){return a-b;});
  var ranges=[]; opens.forEach(function(o,i){ if(closes[i]) ranges.push({open:o,close:closes[i]}); });
  return ranges;
}

function calInit(){ var now=new Date(); calYear=now.getFullYear(); calMonth=now.getMonth(); calRender(); }

function calToggle(){
  calOpen=!calOpen;
  var panel=document.getElementById('cal-panel');
  var widget=document.getElementById('cal-widget');
  if(!panel||!widget) return;
  panel.setAttribute('aria-hidden',String(!calOpen));
  widget.classList.toggle('cal-is-open',calOpen);
}

function calMove(dir){
  calMonth+=dir;
  if(calMonth>11){calMonth=0;calYear++;} if(calMonth<0){calMonth=11;calYear--;}
  calRender();
}

function calRender(){
  var months=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  var titleEl=document.getElementById('cal-title');
  if(titleEl) titleEl.textContent=calYear+'년 '+months[calMonth];
  var first=new Date(calYear,calMonth,1).getDay();
  var days=new Date(calYear,calMonth+1,0).getDate();
  var today=new Date(); today.setHours(0,0,0,0);
  var ranges=buildRanges();
  var grid=document.getElementById('cal-grid');
  if(!grid) return;
  grid.innerHTML='';
  var eventMap={};
  CAL_EVENTS.forEach(function(e){ eventMap[e.date]=e; });
  for(var i=0;i<first;i++){ var emp=document.createElement('span'); emp.className='cal-cell empty'; emp.innerHTML='<span class="cal-num"></span>'; grid.appendChild(emp); }
  for(var d=1;d<=days;d++){
    var mm=String(calMonth+1).padStart(2,'0'); var dd=String(d).padStart(2,'0');
    var key=calYear+'-'+mm+'-'+dd; var cur=toDate(key); var ev=eventMap[key]; var col=(first+d-1)%7;
    var el=document.createElement('span'); el.className='cal-cell';
    if(cur.getTime()===today.getTime()) el.classList.add('cal-today');
    if(ev&&ev.type==='open') el.classList.add('is-open');
    if(ev&&ev.type==='close') el.classList.add('is-close');
    ranges.forEach(function(r){
      var inRange=cur>=r.open&&cur<=r.close;
      var isOpen=cur.getTime()===r.open.getTime(); var isClose=cur.getTime()===r.close.getTime();
      var isSingle=r.open.getTime()===r.close.getTime();
      if(!inRange) return;
      el.classList.add('in-range');
      var bar=document.createElement('span'); bar.className='cal-bar';
      if(isSingle){ bar.style.display='none'; }
      else if(isOpen){ bar.classList.add('cal-bar-start'); if(col===6) bar.classList.add('cal-bar-week-end'); }
      else if(isClose){ bar.classList.add('cal-bar-end'); if(col===0) bar.classList.add('cal-bar-week-start'); }
      else{ if(col===0) bar.classList.add('cal-bar-week-start'); if(col===6) bar.classList.add('cal-bar-week-end'); }
      el.appendChild(bar);
    });
    var num=document.createElement('span'); num.className='cal-num'; num.textContent=d; el.appendChild(num);
    grid.appendChild(el);
  }
  var evList=document.getElementById('cal-events');
  if(!evList) return;
  var padMonth=String(calMonth+1).padStart(2,'0');
  var thisMonth=CAL_EVENTS.filter(function(e){ return e.date.startsWith(calYear+'-'+padMonth); });
  if(thisMonth.length===0){ evList.innerHTML='<p class="cal-no-ev">이번 달 일정 없음</p>'; }
  else{
    evList.innerHTML=thisMonth.map(function(e){
      var day=parseInt(e.date.split('-')[2]);
      return '<div class="cal-ev-item"><span class="cal-dot '+e.type+'"></span><span class="cal-ev-day">'+day+'일</span><span class="cal-ev-label">'+e.label+'</span></div>';
    }).join('');
  }
}

window.calToggle = calToggle;
window.calMove   = calMove;

document.addEventListener('DOMContentLoaded', function(){
  loadCalEvents(function(){ calInit(); });
});

/* ── 섹션 입장 & Reveal 애니메이션 ───────────────────────── */
document.addEventListener('DOMContentLoaded', function(){
  var sections = document.querySelectorAll('.section-hidden');
  if(sections.length){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('section-visible'); obs.unobserve(e.target); } });
    },{ threshold:0.06, rootMargin:'0px 0px -40px 0px' });
    sections.forEach(function(el){ obs.observe(el); });
  }
  var items = document.querySelectorAll('.reveal');
  if(items.length){
    var obs2 = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-visible'); obs2.unobserve(e.target); } });
    },{ threshold:0.08 });
    items.forEach(function(el){ obs2.observe(el); });
  }
});

/* ── 사이드 네비게이션 ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function(){
  var sideNav = document.getElementById('side-nav');
  if(!sideNav) return;
  var sectionIds = Array.from(sideNav.querySelectorAll('a[href^="#"]')).map(function(a){ return a.getAttribute('href').slice(1); });
  var targets = sectionIds.map(function(id){ return document.getElementById(id); }).filter(Boolean);
  var links = Array.from(sideNav.querySelectorAll('a[href^="#"]'));
  function setActive(id){ links.forEach(function(a){ a.classList.toggle('is-active', a.getAttribute('href')==='#'+id); }); }
  if(targets.length){
    var obs = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting) setActive(e.target.id); }); },{ rootMargin:'-40% 0px -55% 0px', threshold:0 });
    targets.forEach(function(el){ obs.observe(el); });
    var firstSection = document.querySelector('.section-hero, #hero, section');
    if(firstSection){
      var showObs = new IntersectionObserver(function(entries){ entries.forEach(function(e){ sideNav.classList.toggle('is-visible',!e.isIntersecting); }); },{ threshold:0.3 });
      showObs.observe(firstSection);
    }
  }
  links.forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var target = document.querySelector(a.getAttribute('href'));
      if(target) target.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });
});

/* ── 배경 파티클 ─────────────────────────────────────────── */
(function(){
  var canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, particles = [];
  var COLORS = ['#9FA8FF','#C2CAFF','#FFC2E3','#9EEAE1','#d4b9ff'];
  function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
  function Particle(){ this.reset(true); }
  Particle.prototype.reset = function(init){
    this.x=Math.random()*W; this.y=init?Math.random()*H:H+10;
    this.r=Math.random()*1.8+.5; this.vx=(Math.random()-.5)*.3; this.vy=-(Math.random()*.4+.1);
    this.alpha=Math.random()*.45+.15; this.color=COLORS[Math.floor(Math.random()*COLORS.length)];
    this.tw=Math.random()*.018+.004; this.td=Math.random()>.5?1:-1;
  };
  Particle.prototype.update=function(){ this.x+=this.vx; this.y+=this.vy; this.alpha+=this.tw*this.td; if(this.alpha>.7||this.alpha<.08)this.td*=-1; if(this.y<-10)this.reset(false); };
  Particle.prototype.draw=function(){ ctx.save(); ctx.globalAlpha=this.alpha; ctx.fillStyle=ctx.shadowColor=this.color; ctx.shadowBlur=7; ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill(); ctx.restore(); };
  function init(){ resize(); particles=[]; var n=Math.floor((W*H)/8500); for(var i=0;i<n;i++) particles.push(new Particle()); }
  function loop(){ ctx.clearRect(0,0,W,H); particles.forEach(function(p){p.update();p.draw();}); requestAnimationFrame(loop); }
  window.addEventListener('resize', init);
  init(); loop();
})();

/* ── 커스텀 커서 + 스파클 트레일 ────────────────────────── */
(function(){
  var dot=document.getElementById('cursor-dot');
  var ring=document.getElementById('cursor-ring');
  var canvas=document.getElementById('cursor-canvas');
  if(!dot||!ring||!canvas) return;
  var ctx=canvas.getContext('2d');
  var mx=-300,my=-300,rx=-300,ry=-300;
  var SC=['#9FA8FF','#FFC2E3','#9EEAE1','#fff','#d4b9ff','#ffe0f5'];
  function resize(){ canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
  resize(); window.addEventListener('resize',resize);
  document.addEventListener('mousemove',function(e){ mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; });
  (function ringLoop(){ rx+=(mx-rx)*.13; ry+=(my-ry)*.13; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(ringLoop); })();
  var hov='a,button,.price-card,.plan-card,.i-card,.notice-item,.collab-link,[data-type-buttons] button,.sp-item';
  document.addEventListener('mouseover',function(e){ if(e.target.closest(hov)) document.body.classList.add('cursor-hover'); });
  document.addEventListener('mouseout',function(e){ if(e.target.closest(hov)) document.body.classList.remove('cursor-hover'); });
  document.addEventListener('mousedown',function(){ document.body.classList.add('cursor-click'); });
  document.addEventListener('mouseup',function(){ document.body.classList.remove('cursor-click'); });
  function drawStar(x,y,r,alpha,color,rot){ ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=ctx.shadowColor=color; ctx.shadowBlur=8; ctx.translate(x,y); ctx.rotate(rot); ctx.beginPath(); for(var i=0;i<5;i++){ var a1=(i*4*Math.PI)/5-Math.PI/2; var a2=((i*4+2)*Math.PI)/5-Math.PI/2; ctx.lineTo(Math.cos(a1)*r,Math.sin(a1)*r); ctx.lineTo(Math.cos(a2)*(r*.4),Math.sin(a2)*(r*.4)); } ctx.closePath(); ctx.fill(); ctx.restore(); }
  function makeParticle(x,y,burst){ var angle=Math.random()*Math.PI*2; var spd=burst?(Math.random()*5+2.5):(Math.random()*1.6+.4); return {x:x,y:y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd-(burst?0:.5),r:Math.random()*(burst?4:2.5)+1.2,alpha:1,decay:burst?.028:.022,color:SC[Math.floor(Math.random()*SC.length)],rot:Math.random()*Math.PI*2,rotV:(Math.random()-.5)*.18,star:Math.random()>.45,gravity:.035,drag:burst?.93:1}; }
  var particles=[],lastX=-999,lastY=-999;
  document.addEventListener('mousemove',function(){ var dx=mx-lastX,dy=my-lastY; if(dx*dx+dy*dy>100){ for(var i=0;i<2;i++) particles.push(makeParticle(mx,my,false)); lastX=mx; lastY=my; } });
  document.addEventListener('click',function(e){ for(var i=0;i<16;i++) particles.push(makeParticle(e.clientX,e.clientY,true)); });
  (function loop(){ ctx.clearRect(0,0,canvas.width,canvas.height); particles=particles.filter(function(p){return p.alpha>.01;}); particles.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.vx*=p.drag; p.vy*=p.drag; p.vy+=p.gravity; p.alpha-=p.decay; p.rot+=p.rotV; if(p.star) drawStar(p.x,p.y,p.r,p.alpha,p.color,p.rot); else{ ctx.save(); ctx.globalAlpha=p.alpha; ctx.fillStyle=ctx.shadowColor=p.color; ctx.shadowBlur=9; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.restore(); } }); requestAnimationFrame(loop); })();
})();

/* ── i18n 번역 ───────────────────────────────────────────── */
(function(){
  var translations = {
    ko: {
      'nav.about':'알아보기','nav.info':'정보','nav.works':'작품','nav.samples':'샘플','nav.price':'가격','nav.contact':'문의하기',
      'hero.sub':'LD · SD · 메모리얼 애니메이션 포트폴리오','sidenav.notice':'공지',
      'notice.title':'공지사항',
      'notice.alert':'※ 작업 전 반드시 확인해주세요.<br>작업 의뢰 시 모든 내용을 확인·동의한 것으로 간주합니다.',
      'notice.n1.title':'일러스트 작업 불가 / 파일 안내','notice.n1.desc':'일러스트 작업은 하지 않습니다. 파츠 분리가 완료된 일러스트 PSD 파일이 필요합니다.',
      'notice.n2.title':'납품 파일 안내','notice.n2.desc':'작업 완료 후 전달되는 파일은 아이콘 이미지를 포함한 .moc3 파일이 전달됩니다. 수정이 가능한 cmo3 파일은 제공하지 않습니다.',
      'notice.n3.title':'스트리밍 안내','notice.n3.desc':'스트리밍을 하고 있습니다. 방송에 송출을 원하지 않는다면 미리 말씀 부탁드립니다.',
      'notice.n4.title':'SNS · 포트폴리오 게시 안내','notice.n4.desc':'모든 작업물은 홍보와 포트폴리오를 위해 SNS와 유튜브에 게시됩니다. 데뷔일까지 공개 지연을 희망하시는 경우 미리 말씀 부탁드립니다.',
      'notice.n5.title':'요청 사항 기재','notice.n5.desc':'결제 전 요청 사항은 상세히 작성 부탁드립니다. 기재되지 않은 사항은 추가 작업 및 수정 시 작업이 어렵거나 추가금이 들 수 있습니다.',
      'notice.n6.title':'저작권 안내','notice.n6.desc':'리깅과 관련된 저작권은 작가(다중)에게 있습니다. 일러스트와 관련된 저작권은 일러스트 작가님에게 있습니다.',
      'notice.n7.title':'작업 일정 안내','notice.n7.desc':'작업 일정은 문의 순이 아닌 결제 순으로 확정됩니다. 일정은 작업 속도에 따라 조금씩 당겨질 수 있으며, 작업이 지연될 시 사전에 미리 연락 드립니다.',
      'notice.n7.desc2':'※ 컨펌 시 연락이 지연되거나 수정 사항이 많을 시 작업 기간이 늘어날 수 있습니다.',
      'notice.n7.desc3':'※ 작업 기간은 평균 기본 모델 기준 2주~4주 정도입니다.',
      'about.greeting':'안녕하세요. Live2D Rigger 다중(Dajoong)입니다.',
      'about.p1':'LD·SD 버추얼 모델을 비롯해 배경 애니메이션과 월페이퍼 작업을 진행하며, 섬세하고 부드러운 모션 구현에 집중하고 있습니다.',
      'about.p2':'모델의 매력을 극대화할 수 있는 리깅 방식을 연구하며, 다양한 스타일의 모델 작업에 대응할 수 있습니다. 클라이언트의 요구에 맞춘 맞춤형 리깅 솔루션을 제공합니다.',
      'about.p3':'여러 작가님들과의 협업 및 상업 제작 경험을 통해 의도에 맞는 결과물을 안정적이고 효율적으로 제작합니다.',
      'about.card.specialty':'전문 분야','about.card.tools':'툴','about.card.style':'스타일',
      'about.card.style1':'자연스럽고 디테일한 리깅','about.card.style2':'다양한 스타일 대응',
      'info.title':'이벤트 &amp; 프로세스',
      'info.event.heading':'이벤트 안내',
      'info.event.e1.title':'리뉴얼 기념 특별 할인','info.event.e1.badge':'리뉴얼 할인','info.event.e1.sub':'조기 마감될 수 있습니다','info.event.e1.desc':'프리미엄 리깅 LD 전신이 리뉴얼 특별 할인',
      'info.event.e2.title':'리뷰 작성 고객 이벤트','info.event.e2.badge':'리뷰 이벤트','info.event.e2.sub':'긍정적인 리뷰를 남겨 주시면 추가 할인 혜택까지','info.event.e2.desc':'리뷰 작성 시 2만원 할인 또는 표정 2종 중 선택 가능합니다',
      'info.collab.heading':'콜라보 안내','info.collab.badge':'콜라보 할인',
      'info.collab.c1.title':'양초 작가님 콜라보 할인','info.collab.c1.sub':'말랑 쫀득한 귀여운 움직임을 원하면 추천','info.collab.c1.desc':'일러스트 5만원 + 리깅 5만원 할인 혜택',
      'info.collab.c2.title':'하노히 작가님 콜라보 할인','info.collab.c2.sub':'단아하고 깔끔한 디자인을 원하면 추천','info.collab.c2.desc':'일러스트 5만원 + 리깅 5만원 할인 혜택',
      'info.collab.c3.title':'피치 작가님 콜라보 할인','info.collab.c3.sub':'만화 같은 분위기의 디자인을 원하면 추천','info.collab.c3.desc':'일러스트 5만원 + 리깅 5만원 할인 혜택',
      'info.collab.c4.title':'뚱땅이 작가님 콜라보 할인','info.collab.c4.sub':'귀엽고 부드러운 움직임을 원하면 추천','info.collab.c4.desc':'일러스트 10만원 + 리깅 5만원 할인 혜택',
      'info.process.heading':'작업 프로세스',
      'info.process.s1.title':'문의','info.process.s1.desc':'작업 요청 및 기본 정보 제공',
      'info.process.s2.title':'파일 확인 및 견적','info.process.s2.desc':'파일 검토 후 상세 견적 제시',
      'info.process.s3.title':'접수 및 입금','info.process.s3.desc':'계약 및 결제',
      'info.process.s4.title':'1차 리깅','info.process.s4.desc':'헤드 및 페이스 구조 제작',
      'info.process.s5.title':'1차 컨펌 및 수정','info.process.s5.desc':'1차 리깅 영상 제공, 피드백 반영 및 개선',
      'info.process.s6.title':'2차 리깅','info.process.s6.desc':'바디 및 소품 디테일 작업',
      'info.process.s7.title':'2차 컨펌 및 수정','info.process.s7.desc':'2차 리깅 영상 제공, 피드백 반영 및 개선',
      'info.process.s8.title':'완성 및 파일 납품','info.process.s8.desc':'최종 파일 전달',
      'info.process.s9.title':'최종 수정 (3차 수정)','info.process.s9.desc':'파일 적용 후 문제 발생 시 수정',
      'info.process.note':'평균 작업 기간은 2–4주이며, 디자인의 복잡도에 따라 조정 가능합니다.',
      'plan.basic':'베이직','plan.premium':'프리미엄',
      'plan.item.faceXYZ':'얼굴 XYZ','plan.item.eyebrow':'눈썹 (위아래, 변형, 각도)',
      'plan.item.eyebrowFacial':'눈썹눈 연동 페이셜','plan.item.blink':'눈깜빡 (윙크)',
      'plan.item.pupilPhysics':'눈동자 물리','plan.item.lashPhysics':'속눈썹 물리',
      'plan.item.mouth9':'입움직임 (9점)','plan.item.mouth12':'입움직임 (12점~)',
      'plan.item.jaw':'입 개폐 연동 턱 리깅','plan.item.bodyXYZ':'몸 XYZ','plan.item.breath':'호흡',
      'plan.item.arm':'팔 흔들림 (손가락 흔들림)','plan.item.camAnim':'캠 이탈 애니메이션 (선택)',
      'plan.item.expr2':'기본 제공 표정 2종','plan.item.noAnim':'(애니메이션 X)',
      'plan.physics.basic':'최대 3단계 물리 지원','plan.physics.basic.sub':'(필요의 경우 4단계 지원)',
      'plan.physics.premium':'최소 3단계 물리 지원','plan.physics.premium.sub':'(필요의 경우 2단계 지원)',
      'plan.note':'베이직과 프리미엄은 움직임 각도, 물리 단계, 전반적인 디테일에서 차이가 있습니다',
      'work.guide.label':'작업 안내','work.process.title':'작업 과정',
      'work.flow.confirm1':'1차 컨펌(수정)','work.flow.confirm2':'2차 컨펌(수정)',
      'work.flow.deliver':'완성 후 전달','work.flow.final':'최종 수정',
      'work.process.d1':'파일 적용 후 문제가 있다면 수정해 드립니다 (최종 수정)',
      'work.process.d2':'오너캐·동물·팬캐 등은 2차 컨펌 없이 1차 컨펌만 진행됩니다.',
      'work.revision.title':'수정 사항',
      'work.revision.d1':'기본적인 수정 사항은 작업 기간에 진행되는 총 2회의 컨펌 및 수정 단계에서 진행됩니다.',
      'work.revision.d1sub':'동물/오너캐의 경우 최종 리깅까지 진행 후 1차 컨펌만 진행합니다.',
      'work.revision.d2':'수정 완료 후 이전 상태로 되돌리거나 과한 번복 요청 시 추가금이 청구될 수 있습니다.',
      'work.revision.d3':'리깅 실수 및 오류가 있는 경우 무료로 수정해 드립니다. 파일 적용 후 오류 발견 시 편히 말해 주세요.',
      'work.copyright.title':'저작권',
      'work.copyright.d1':'리깅 데이터의 저작권은 기본적으로 리거(다중)에게 귀속됩니다.',
      'work.copyright.d2':'의뢰인은 본 리깅 결과물을 방송, 영상 제작, SNS 등 목적에 한하여 이용할 수 있습니다.',
      'work.copyright.d3':'리깅 데이터의 재판매·양도·공유는 허용되지 않습니다.',
      'works.more':'더 많은 작업 보기 →','works.price':'가격 확인하기 →',
      'samples.title':'리깅 샘플','samples.subtitle':'리깅 작업의 다양한 샘플을 확인해보세요.',
      'samples.fullbody.title':'전신 리깅','samples.fullbody.desc':'자연스럽고 부드러운 움직임을 구현합니다.',
      'samples.fullbody.x':'X 축 움직임','samples.fullbody.y':'Y 축 움직임','samples.fullbody.z':'Z 축 움직임',
      'samples.fullbody.note':'캐릭터의 체형과 디자인에 따라 움직임은 변경될 수 있습니다.',
      'samples.eyes.title':'눈 물리','samples.eyes.desc':'다양한 스타일의 눈을 생동감 있게 표현합니다.',
      'samples.eyes.odd':'몽환적인 눈빛을 살린 디테일한 물리 표현','samples.eyes.green':'초롱초롱한 눈동자의 자연스러운 물리 움직임','samples.eyes.red':'섬세한 속눈썹과 눈동자의 부드러운 물리',
      'samples.mouth.title':'입 움직임','samples.mouth.desc':'발화 스타일에 맞게 선택할 수 있는 세 가지 입 구조입니다',
      'samples.mouth.9pt':'단순한 9점 구조로 일반 대화에 적합','samples.mouth.12pt':'세밀한 12점 구조로 대화와 감정 표현에 적합','samples.mouth.vbridger':'Vbridger 사용으로 섬세한 감정 표현에 적합',
      'samples.expr.title':'표정 효과','samples.expr.desc':'단축키 한 번으로 개성 있는 감정을 표현해보세요',
      'samples.expr.contempt':'차갑고 날카로운 눈빛으로 경멸감을 표현','samples.expr.annoy':'순간적인 짜증과 불쾌감을 생동감 있게 연출','samples.expr.heart':'설레고 사랑스러운 순간을 하트눈으로 표현',
      'samples.exprAnim.title':'표정 애니메이션','samples.exprAnim.desc':'캐릭터 위에 자연스럽게 재생되는 감정 연출 효과입니다',
      'samples.exprAnim.tear':'눈가를 타고 흐르는 자연스러운 눈물 연출','samples.exprAnim.sweat':'긴장감과 당황스러움을 식은땀으로 표현',
      'samples.arm.title':'팔 움직임','samples.arm.desc':'캐릭터의 콘셉트에 맞는 팔 움직임 예시입니다',
      'samples.arm.game':'게임기를 이용해 게임 화면에 몰입감을 올릴 수 있습니다','samples.arm.wand':'캐릭터 컨셉에 맞는 아이템으로 다양한 연출','samples.arm.wave':'손을 흔들며 인사하는 디테일한 표현',
      'samples.costume.title':'의상 및 헤어','samples.costume.desc':'의상과 헤어 변경으로 같은 캐릭터도 전혀 다른 분위기를 연출할 수 있습니다.',
      'samples.costume.hair':'머리 색상을 바꿔 전혀 다른 분위기를 연출','samples.costume.outfit':'의상 교체로 캐릭터 콘셉트를 폭넓게 표현','samples.costume.hairstyle':'헤어 스타일 변경으로 같은 캐릭터도 새로운 느낌으로',
      'price.title':'가격',
      'price.badge.ld':'Live2D','price.badge.premium':'Premium','price.badge.sd':'SD','price.badge.bg':'Animation',
      'price.label.full':'전신','price.label.half':'반신','price.label.base':'기본가','price.label.from':' ~',
      'price.intro':'기본 안내 요금입니다. 프로젝트 요구사항에 따라 견적이 달라집니다.<br>상세 견적은 파일 구조와 요구 사항 확인 후 안내드립니다.',
      'price.basic.desc':'자연스러운 XYZ 움직임과 안정적인 물리를 제공합니다.',
      'price.basic.f1':'얼굴 · 몸 XYZ 움직임','price.basic.f2':'눈썹 변형 · 각도 / 눈깜빡 (윙크)',
      'price.basic.f3':'입움직임 9점 / 입 개폐 연동 턱','price.basic.f4':'호흡 · 팔 흔들림 (손가락 포함)',
      'price.basic.f5':'기본 표정 2종 포함','price.basic.f6':'최대 3단계 물리 지원',
      'price.basic.period':'예상 작업 기간: 14일–30일 · 수정 2회 + 적용 후 1회',
      'price.prem.desc':'높은 물리 단계와 세밀한 디테일로 풍부한 움직임을 제공합니다.',
      'price.prem.f1':'얼굴 · 몸 XYZ 움직임','price.prem.f2':'눈썹눈 연동 페이셜 / 눈깜빡 (윙크)',
      'price.prem.f3':'입움직임 12점~ / 입 개폐 연동 턱','price.prem.f4':'속눈썹 물리 / 눈동자 물리',
      'price.prem.f5':'호흡 · 팔 흔들림 (손가락 포함)','price.prem.f6':'기본 표정 2종 포함',
      'price.prem.f7':'최소 3단계 물리 지원',
      'price.prem.period':'예상 작업 기간: 14일–30일 · 수정 2회 + 적용 후 1회',
      'price.ld.f1':'자연스러운 XYZ 움직임 제공','price.ld.f4':'기본 표정 2종 포함',
      'price.sd.desc':'작고 귀여운 SD 모델 리깅. 가볍고 빠른 리깅을 제공합니다.',
      'price.sd.f2':'단순한 입 모양','price.sd.period':'예상 작업 기간: 7일–14일 · 수정 2회 + 적용 후 1회',
      'price.bg.title':'배경 / 월페이퍼 애니메이션',
      'price.bg.desc':'반복되는 루프형 애니메이션과 월페이퍼를 제작합니다.',
      'price.bg.f1':'자연스럽게 반복되는 애니메이션 제작','price.bg.f2':'기본 mp4 포맷 제공 (GIF 추가 가능)',
      'price.bg.f3':'GIF는 파일 특성상 깨짐이 있을 수 있음','price.bg.f4':'복잡도에 따라 금액 협의',
      'price.bg.period':'예상 작업 기간: 7일–14일 · 수정 최대 2회',
      'price.note':'정확한 견적은 아트워크(PSD/PNG)와 요구사항 확인 후 산정됩니다.',
      'price.cta':'DM으로 상세 문의하기',
    },
    en: {
      'nav.about':'About','nav.info':'Info','nav.works':'Works','nav.samples':'Samples','nav.price':'Price','nav.contact':'Contact',
      'hero.sub':'LD · SD · Memorial Animation Portfolio','sidenav.notice':'Notice',
      'notice.title':'Notice',
      'notice.alert':'※ We are not responsible for issues arising from not reading the notices.<br>By placing a commission, you agree to all the terms listed here.',
      'notice.n1.title':'No Illustration Work / File Requirements','notice.n1.desc':'Illustration work is not available. A fully separated PSD file with all parts is required.',
      'notice.n2.title':'Delivery File Info','notice.n2.desc':'The delivered file will be a .moc3 file including an icon image. The editable .cmo3 source file is not provided.',
      'notice.n3.title':'Streaming Notice','notice.n3.desc':'I stream on occasion. Please let me know in advance if you do not wish your model to appear on stream.',
      'notice.n4.title':'SNS & Portfolio Posting','notice.n4.desc':'All completed works may be posted on SNS and YouTube for promotion and portfolio purposes. Please inform me in advance if you wish to delay the reveal until your debut date.',
      'notice.n5.title':'Request Details','notice.n5.desc':'Please describe all requests in detail before payment. Items not specified may be difficult to add later or may incur additional charges.',
      'notice.n6.title':'Copyright Notice','notice.n6.desc':'The copyright for the rigging belongs to the rigger (Dajoong). The copyright for the illustration belongs to the respective illustrator.',
      'notice.n7.title':'Work Schedule','notice.n7.desc':'Work schedules are confirmed by order of payment, not inquiry. Schedules may be moved up depending on work pace; delays will be communicated in advance.',
      'notice.n7.desc2':'※ Delays in confirmation responses or a large number of revisions may extend the work period.',
      'notice.n7.desc3':'※ Average work duration is approximately 2–4 weeks for a standard model.',
      'about.greeting':'Hello, I\'m Dajoong — a Live2D Rigger.',
      'about.p1':'I work on LD/SD virtual models, background animations, and wallpapers, with a focus on creating smooth, detailed motion.',
      'about.p2':'I continually research rigging methods to maximize the appeal of each model and can handle a wide variety of styles. I provide customized rigging solutions tailored to each client\'s needs.',
      'about.p3':'Through collaboration with multiple artists and commercial production experience, I deliver results that match your vision reliably and efficiently.',
      'about.card.specialty':'Specialty','about.card.tools':'Tools','about.card.style':'Style',
      'about.card.style1':'Natural & Detailed Rigging','about.card.style2':'Versatile Style Support',
      'info.title':'Events &amp; Process',
      'info.event.heading':'Events',
      'info.event.e1.title':'Renewal Special Discount','info.event.e1.badge':'Renewal Sale','info.event.e1.sub':'May end early','info.event.e1.desc':'Special discount on Premium LD Full-Body rigging',
      'info.event.e2.title':'Review Event','info.event.e2.badge':'Review Event','info.event.e2.sub':'Leave a positive review and receive extra benefits','info.event.e2.desc':'Get ₩20,000 off or 2 extra expressions of your choice',
      'info.collab.heading':'Collaborations','info.collab.badge':'Collab Discount',
      'info.collab.c1.title':'Yangcho Artist Collab','info.collab.c1.sub':'Recommended for soft & bouncy cute movement','info.collab.c1.desc':'₩50,000 off illustration + ₩50,000 off rigging',
      'info.collab.c2.title':'Hanohi Artist Collab','info.collab.c2.sub':'Recommended for elegant and clean design','info.collab.c2.desc':'₩50,000 off illustration + ₩50,000 off rigging',
      'info.collab.c3.title':'Peach Artist Collab','info.collab.c3.sub':'Recommended for manga-style design','info.collab.c3.desc':'₩50,000 off illustration + ₩50,000 off rigging',
      'info.collab.c4.title':'Ddungddangi Artist Collab','info.collab.c4.sub':'Recommended for cute and smooth movement','info.collab.c4.desc':'₩100,000 off illustration + ₩50,000 off rigging',
      'info.process.heading':'Work Process',
      'info.process.s1.title':'Inquiry','info.process.s1.desc':'Submit work request and basic info',
      'info.process.s2.title':'File Review & Quote','info.process.s2.desc':'Review files and provide detailed estimate',
      'info.process.s3.title':'Acceptance & Payment','info.process.s3.desc':'Contract and payment',
      'info.process.s4.title':'1st Rigging','info.process.s4.desc':'Head & face structure creation',
      'info.process.s5.title':'1st Review & Revision','info.process.s5.desc':'Provide 1st rigging video, apply feedback',
      'info.process.s6.title':'2nd Rigging','info.process.s6.desc':'Body & prop detail work',
      'info.process.s7.title':'2nd Review & Revision','info.process.s7.desc':'Provide 2nd rigging video, apply feedback',
      'info.process.s8.title':'Completion & Delivery','info.process.s8.desc':'Final file delivery',
      'info.process.s9.title':'Final Revision (3rd)','info.process.s9.desc':'Fix any issues found after applying the file',
      'info.process.note':'Average work period is 2–4 weeks, adjustable based on design complexity.',
      'plan.basic':'Basic','plan.premium':'Premium',
      'plan.item.faceXYZ':'Face XYZ','plan.item.eyebrow':'Eyebrows (Up/Down, Deform, Angle)',
      'plan.item.eyebrowFacial':'Eyebrow-Eye Linked Facial','plan.item.blink':'Blink (Wink)',
      'plan.item.pupilPhysics':'Pupil Physics','plan.item.lashPhysics':'Eyelash Physics',
      'plan.item.mouth9':'Mouth (9pt)','plan.item.mouth12':'Mouth (12pt+)',
      'plan.item.jaw':'Jaw Link Rigging','plan.item.bodyXYZ':'Body XYZ','plan.item.breath':'Breathing',
      'plan.item.arm':'Arm Sway (Fingers)','plan.item.camAnim':'Cam-out Animation (Optional)',
      'plan.item.expr2':'2 Default Expressions','plan.item.noAnim':'(No Animation)',
      'plan.physics.basic':'Up to 3-layer physics','plan.physics.basic.sub':'(4-layer if needed)',
      'plan.physics.premium':'Min. 3-layer physics','plan.physics.premium.sub':'(2-layer if needed)',
      'plan.note':'Basic and Premium differ in motion range, physics layers, and overall detail.',
      'work.guide.label':'Work Guide','work.process.title':'Work Flow',
      'work.flow.confirm1':'1st Review','work.flow.confirm2':'2nd Review',
      'work.flow.deliver':'Delivery','work.flow.final':'Final Fix',
      'work.process.d1':'If issues arise after applying the file, revisions are available (Final Revision).',
      'work.process.d2':'For OC/animal/fan characters, only 1st review is conducted.',
      'work.revision.title':'Revisions',
      'work.revision.d1':'Standard revisions are handled during the 2 review stages within the work period.',
      'work.revision.d1sub':'For animal/OC types, only 1st review after full rigging is conducted.',
      'work.revision.d2':'Reverting completed revisions or excessive back-and-forth may incur additional charges.',
      'work.revision.d3':'Rigging errors are fixed for free. Please let me know if you find any after applying the file.',
      'work.copyright.title':'Copyright',
      'work.copyright.d1':'The copyright for rigging data belongs to the rigger (Dajoong) by default.',
      'work.copyright.d2':'The client may use the rigging output for streaming, video production, SNS, etc.',
      'work.copyright.d3':'Reselling, transferring, or sharing the rigging data is not permitted.',
      'works.more':'View More Works →','works.price':'Check Pricing →',
      'samples.title':'Rigging Samples','samples.subtitle':'Explore a variety of rigging samples.',
      'samples.fullbody.title':'Full Body Rigging','samples.fullbody.desc':'Smooth and natural motion implementation.',
      'samples.fullbody.x':'X-axis movement','samples.fullbody.y':'Y-axis movement','samples.fullbody.z':'Z-axis movement',
      'samples.fullbody.note':'Movements may vary depending on the character\'s body type and design.',
      'samples.eyes.title':'Eye Physics','samples.eyes.desc':'Vibrant expression of eyes in various styles.',
      'samples.eyes.odd':'Detailed physics bringing out a dreamy gaze','samples.eyes.green':'Natural physics for bright, sparkling eyes','samples.eyes.red':'Smooth physics for delicate lashes and pupils',
      'samples.mouth.title':'Mouth Movement','samples.mouth.desc':'Three mouth structures to match your speech style.',
      'samples.mouth.9pt':'Simple 9-point structure for casual conversation','samples.mouth.12pt':'Detailed 12-point structure for expressive speech','samples.mouth.vbridger':'Ideal for nuanced expression with Vbridger',
      'samples.expr.title':'Expression Effects','samples.expr.desc':'Express unique emotions with a single hotkey.',
      'samples.expr.contempt':'Cold, sharp gaze to convey contempt','samples.expr.annoy':'Vivid portrayal of instant irritation','samples.expr.heart':'Heart-eye moment for a sweet, lovestruck look',
      'samples.exprAnim.title':'Expression Animations','samples.exprAnim.desc':'Emotion effect animations that play naturally over your character.',
      'samples.exprAnim.tear':'Natural tear effect flowing down the eye','samples.exprAnim.sweat':'Cold sweat to express tension and panic',
      'samples.arm.title':'Arm Movement','samples.arm.desc':'Examples of arm movement matching the character\'s concept.',
      'samples.arm.game':'Game controller for immersive gaming-on-stream feel','samples.arm.wand':'Various props for diverse concept expression','samples.arm.wave':'Detailed wave greeting animation',
      'samples.costume.title':'Costume & Hair','samples.costume.desc':'Costume and hair changes let the same character look completely different.',
      'samples.costume.hair':'Hair color change for a totally different vibe','samples.costume.outfit':'Outfit swap for wider concept expression','samples.costume.hairstyle':'Hairstyle change gives a fresh feel to the same character',
      'price.title':'Pricing',
      'price.badge.ld':'Live2D','price.badge.premium':'Premium','price.badge.sd':'SD','price.badge.bg':'Animation',
      'price.label.full':'Full','price.label.half':'Half','price.label.base':'Base','price.label.from':' ~',
      'price.intro':'These are base reference prices. Quotes vary by project requirements.<br>Detailed estimates are provided after reviewing file structure and requirements.',
      'price.basic.desc':'Natural XYZ movement with stable physics.',
      'price.basic.f1':'Face & Body XYZ movement','price.basic.f2':'Eyebrow deform & angle / Blink (Wink)',
      'price.basic.f3':'Mouth 9pt / Jaw link','price.basic.f4':'Breathing & arm sway (fingers included)',
      'price.basic.f5':'2 default expressions included','price.basic.f6':'Up to 3-layer physics',
      'price.basic.period':'Est. work period: 14–30 days · 2 revisions + 1 post-delivery',
      'price.prem.desc':'Rich movement with high-precision physics and fine detail.',
      'price.prem.f1':'Face & Body XYZ movement','price.prem.f2':'Eyebrow-eye linked facial / Blink (Wink)',
      'price.prem.f3':'Mouth 12pt+ / Jaw link','price.prem.f4':'Eyelash physics / Pupil physics',
      'price.prem.f5':'Breathing & arm sway (fingers included)','price.prem.f6':'2 default expressions included',
      'price.prem.f7':'Min. 3-layer physics',
      'price.prem.period':'Est. work period: 14–30 days · 2 revisions + 1 post-delivery',
      'price.ld.f1':'Natural XYZ movement','price.ld.f4':'2 default expressions included',
      'price.sd.desc':'Cute SD model rigging. Light and quick.',
      'price.sd.f2':'Simple mouth shapes','price.sd.period':'Est. work period: 7–14 days · 2 revisions + 1 post-delivery',
      'price.bg.title':'Background / Wallpaper Animation',
      'price.bg.desc':'Loop animations and wallpapers.',
      'price.bg.f1':'Natural looping animation','price.bg.f2':'mp4 format (GIF add-on available)',
      'price.bg.f3':'GIF quality may degrade due to format limitations','price.bg.f4':'Price varies by complexity',
      'price.bg.period':'Est. work period: 7–14 days · Up to 2 revisions',
      'price.note':'Accurate quotes are calculated after reviewing artwork (PSD/PNG) and requirements.',
      'price.cta':'Contact via DM',
    },
    ja: {
      'nav.about':'紹介','nav.info':'情報','nav.works':'作品','nav.samples':'サンプル','nav.price':'料金','nav.contact':'お問い合わせ',
      'hero.sub':'LD · SD · メモリアルアニメーション ポートフォリオ','sidenav.notice':'お知らせ',
      'notice.title':'お知らせ',
      'notice.alert':'※ ご依頼前に必ずご確認ください。<br>依頼された時点で全ての内容を確認・同意したものとみなします。',
      'notice.n1.title':'イラスト作業不可 / ファイルについて','notice.n1.desc':'イラスト作業は承っておりません。パーツ分けが完了したPSDファイルが必要です。',
      'notice.n2.title':'納品ファイルについて','notice.n2.desc':'納品ファイルはアイコン画像を含む.moc3ファイルとなります。編集可能な.cmo3ファイルは提供しておりません。',
      'notice.n3.title':'配信について','notice.n3.desc':'配信を行っております。配信への使用を希望されない場合は事前にお知らせください。',
      'notice.n4.title':'SNS・ポートフォリオ掲載について','notice.n4.desc':'全ての作品はプロモーションおよびポートフォリオとしてSNSおよびYouTubeに掲載されます。デビュー日まで公開を遅らせたい場合は事前にお知らせください。',
      'notice.n5.title':'ご要望の記載','notice.n5.desc':'お支払い前にご要望を詳しくご記載ください。記載のない事項は後から追加が難しい場合や追加料金が発生する場合があります。',
      'notice.n6.title':'著作権について','notice.n6.desc':'リギングに関する著作権は制作者（다중）に帰属します。イラストの著作権はイラストレーターに帰属します。',
      'notice.n7.title':'作業スケジュールについて','notice.n7.desc':'作業スケジュールはお問い合わせ順ではなく、お支払い順で確定されます。',
      'notice.n7.desc2':'※ 確認の遅延や修正が多い場合、作業期間が延びる場合があります。',
      'notice.n7.desc3':'※ 平均的な作業期間は基本モデルで約2〜4週間です。',
      'about.greeting':'こんにちは。Live2D Rigger ダジュン（Dajoong）です。',
      'about.p1':'LD・SDバーチャルモデルをはじめ、背景アニメーションや壁紙制作も行っており、繊細で滑らかなモーション表現に注力しています。',
      'about.p2':'モデルの魅力を最大限に引き出すリギング方法を研究し、様々なスタイルに対応可能です。クライアントのご要望に合わせたカスタムリギングソリューションを提供します。',
      'about.p3':'多くのイラストレーターとのコラボや商業制作経験を通じ、ご意向に沿った成果物を安定・効率的に制作します。',
      'about.card.specialty':'専門分野','about.card.tools':'ツール','about.card.style':'スタイル',
      'about.card.style1':'自然で細かいリギング','about.card.style2':'多様なスタイルに対応',
      'info.title':'イベント &amp; プロセス',
      'info.event.heading':'イベント案内',
      'info.event.e1.title':'リニューアル記念特別割引','info.event.e1.badge':'リニューアル割引','info.event.e1.sub':'早期終了の場合あり','info.event.e1.desc':'プレミアムリギング LD全身が特別割引',
      'info.event.e2.title':'レビューイベント','info.event.e2.badge':'レビューイベント','info.event.e2.sub':'ポジティブなレビューで追加割引特典','info.event.e2.desc':'レビュー作成で₩20,000割引または表情2種プレゼント',
      'info.collab.heading':'コラボ案内','info.collab.badge':'コラボ割引',
      'info.collab.c1.title':'양초作家コラボ割引','info.collab.c1.sub':'ふわふわ可愛い動きを求めるなら','info.collab.c1.desc':'イラスト₩50,000 + リギング₩50,000割引',
      'info.collab.c2.title':'하노히作家コラボ割引','info.collab.c2.sub':'上品でクリーンなデザインを求めるなら','info.collab.c2.desc':'イラスト₩50,000 + リギング₩50,000割引',
      'info.collab.c3.title':'피치作家コラボ割引','info.collab.c3.sub':'漫画風のデザインを求めるなら','info.collab.c3.desc':'イラスト₩50,000 + リギング₩50,000割引',
      'info.collab.c4.title':'뚱땅이作家コラボ割引','info.collab.c4.sub':'可愛くふわふわな動きを求めるなら','info.collab.c4.desc':'イラスト₩100,000 + リギング₩50,000割引',
      'info.process.heading':'作業プロセス',
      'info.process.s1.title':'お問い合わせ','info.process.s1.desc':'作業依頼と基本情報の提供',
      'info.process.s2.title':'ファイル確認・見積もり','info.process.s2.desc':'ファイル確認後に詳細見積もり提示',
      'info.process.s3.title':'受付・お支払い','info.process.s3.desc':'契約および決済',
      'info.process.s4.title':'1次リギング','info.process.s4.desc':'ヘッド・フェイス構造制作',
      'info.process.s5.title':'1次確認・修正','info.process.s5.desc':'1次リギング動画提供、フィードバック反映',
      'info.process.s6.title':'2次リギング','info.process.s6.desc':'ボディ・小道具ディテール作業',
      'info.process.s7.title':'2次確認・修正','info.process.s7.desc':'2次リギング動画提供、フィードバック反映',
      'info.process.s8.title':'完成・納品','info.process.s8.desc':'最終ファイル納品',
      'info.process.s9.title':'最終修正（3次修正）','info.process.s9.desc':'ファイル適用後に問題があれば修正',
      'info.process.note':'平均作業期間は2〜4週間で、デザインの複雑さにより調整可能です。',
      'plan.basic':'ベーシック','plan.premium':'プレミアム',
      'plan.item.faceXYZ':'顔XYZ','plan.item.eyebrow':'眉（上下・変形・角度）',
      'plan.item.eyebrowFacial':'眉目連動フェイシャル','plan.item.blink':'まばたき（ウィンク）',
      'plan.item.pupilPhysics':'瞳物理','plan.item.lashPhysics':'まつ毛物理',
      'plan.item.mouth9':'口の動き（9点）','plan.item.mouth12':'口の動き（12点〜）',
      'plan.item.jaw':'開口連動顎リギング','plan.item.bodyXYZ':'体XYZ','plan.item.breath':'呼吸',
      'plan.item.arm':'腕揺れ（指含む）','plan.item.camAnim':'カムアウトアニメーション（選択）',
      'plan.item.expr2':'デフォルト表情2種付き','plan.item.noAnim':'（アニメーションなし）',
      'plan.physics.basic':'最大3段階物理対応','plan.physics.basic.sub':'（必要に応じて4段階対応）',
      'plan.physics.premium':'最低3段階物理対応','plan.physics.premium.sub':'（必要に応じて2段階対応）',
      'plan.note':'ベーシックとプレミアムは動きの角度、物理段階、全体的なディテールに差があります。',
      'work.guide.label':'作業ガイド','work.process.title':'作業の流れ',
      'work.flow.confirm1':'1次確認（修正）','work.flow.confirm2':'2次確認（修正）',
      'work.flow.deliver':'完成・納品','work.flow.final':'最終修正',
      'work.process.d1':'ファイル適用後に問題があれば修正します（最終修正）。',
      'work.process.d2':'オーナーキャラ・動物・ファンキャラ等は1次確認のみ行います。',
      'work.revision.title':'修正について',
      'work.revision.d1':'基本的な修正は作業期間中の合計2回の確認・修正ステップで行います。',
      'work.revision.d1sub':'動物・オーナーキャラの場合は最終リギング後に1次確認のみ行います。',
      'work.revision.d2':'修正完了後に以前の状態に戻す、または過度な変更要求は追加料金が発生する場合があります。',
      'work.revision.d3':'リギングミスやエラーがある場合は無料で修正します。ファイル適用後にエラーを発見した場合はお気軽にお知らせください。',
      'work.copyright.title':'著作権',
      'work.copyright.d1':'リギングデータの著作権は基本的にリガー（다중）に帰属します。',
      'work.copyright.d2':'依頼者は本リギング成果物を配信・映像制作・SNS等の目的で使用できます。',
      'work.copyright.d3':'リギングデータの再販・譲渡・共有は許可されておりません。',
      'works.more':'もっと見る →','works.price':'料金を確認する →',
      'samples.title':'リギングサンプル','samples.subtitle':'様々なリギングサンプルをご覧ください。',
      'samples.fullbody.title':'全身リギング','samples.fullbody.desc':'自然で滑らかな動きを実現します。',
      'samples.fullbody.x':'X軸の動き','samples.fullbody.y':'Y軸の動き','samples.fullbody.z':'Z軸の動き',
      'samples.fullbody.note':'キャラクターの体型やデザインによって動きは変わる場合があります。',
      'samples.eyes.title':'目の物理','samples.eyes.desc':'様々なスタイルの目を生き生きと表現します。',
      'samples.eyes.odd':'幻想的な目線を生かした細かい物理表現','samples.eyes.green':'キラキラした瞳の自然な物理の動き','samples.eyes.red':'繊細なまつ毛と瞳の滑らかな物理',
      'samples.mouth.title':'口の動き','samples.mouth.desc':'発話スタイルに合わせて選べる3種類の口構造',
      'samples.mouth.9pt':'シンプルな9点構造で普通の会話に最適','samples.mouth.12pt':'細かい12点構造で会話と感情表現に最適','samples.mouth.vbridger':'Vbridger使用で繊細な感情表現に最適',
      'samples.expr.title':'表情エフェクト','samples.expr.desc':'ショートカットキー一つで個性的な感情を表現',
      'samples.expr.contempt':'冷たく鋭い視線で侮蔑感を表現','samples.expr.annoy':'瞬間的なイライラと不快感を生き生きと演出','samples.expr.heart':'ドキドキした愛らしい瞬間をハート目で表現',
      'samples.exprAnim.title':'表情アニメーション','samples.exprAnim.desc':'キャラクターに自然に再生される感情演出エフェクト',
      'samples.exprAnim.tear':'目元を流れる自然な涙の演出','samples.exprAnim.sweat':'緊張感と戸惑いを冷や汗で表現',
      'samples.arm.title':'腕の動き','samples.arm.desc':'キャラクターのコンセプトに合った腕の動きの例',
      'samples.arm.game':'ゲームコントローラーでゲーム画面への没入感を演出','samples.arm.wand':'コンセプトに合ったアイテムで多彩な演出','samples.arm.wave':'手を振って挨拶するディテールな表現',
      'samples.costume.title':'衣装・ヘア','samples.costume.desc':'衣装やヘアを変えることで同じキャラクターでも全く異なる雰囲気を演出できます。',
      'samples.costume.hair':'髪の色を変えて全く異なる雰囲気を演出','samples.costume.outfit':'衣装チェンジでキャラクターのコンセプトを幅広く表現','samples.costume.hairstyle':'ヘアスタイル変更で同じキャラクターでも新鮮な印象に',
      'price.title':'料金',
      'price.badge.ld':'Live2D','price.badge.premium':'Premium','price.badge.sd':'SD','price.badge.bg':'Animation',
      'price.label.full':'全身','price.label.half':'半身','price.label.base':'基本価格','price.label.from':' 〜',
      'price.intro':'基本参考料金です。プロジェクトの要件によって見積もりが異なります。<br>詳細な見積もりはファイル構造と要件を確認後にご案内します。',
      'price.basic.desc':'自然なXYZ動作と安定した物理表現を提供します。',
      'price.basic.f1':'顔・体 XYZ動作','price.basic.f2':'眉変形・角度 / まばたき（ウィンク）',
      'price.basic.f3':'口の動き9点 / 顎リンク','price.basic.f4':'呼吸・腕揺れ（指含む）',
      'price.basic.f5':'デフォルト表情2種付き','price.basic.f6':'最大3段階物理対応',
      'price.basic.period':'予想作業期間：14〜30日 · 修正2回 + 適用後1回',
      'price.prem.desc':'高精度の物理と細かいディテールで豊かな動きを提供します。',
      'price.prem.f1':'顔・体 XYZ動作','price.prem.f2':'眉目連動フェイシャル / まばたき（ウィンク）',
      'price.prem.f3':'口の動き12点〜 / 顎リンク','price.prem.f4':'まつ毛・瞳物理',
      'price.prem.f5':'呼吸・腕揺れ（指含む）','price.prem.f6':'デフォルト表情2種付き',
      'price.prem.f7':'最低3段階物理対応',
      'price.prem.period':'予想作業期間：14〜30日 · 修正2回 + 適用後1回',
      'price.ld.f1':'自然なXYZ動作','price.ld.f4':'デフォルト表情2種付き',
      'price.sd.desc':'かわいらしいSDモデルのリギング。軽快でスピーディーな対応。',
      'price.sd.f2':'シンプルな口の形','price.sd.period':'予想作業期間：7〜14日 · 修正2回 + 適用後1回',
      'price.bg.title':'背景 / 壁紙アニメーション',
      'price.bg.desc':'ループ型アニメーションと壁紙を制作します。',
      'price.bg.f1':'自然にループするアニメーション制作','price.bg.f2':'mp4形式で提供（GIF追加可能）',
      'price.bg.f3':'GIFはファイルの特性上、画質が低下する場合があります','price.bg.f4':'複雑さにより金額要相談',
      'price.bg.period':'予想作業期間：7〜14日 · 最大2回修正',
      'price.note':'正確な見積もりはアートワーク（PSD/PNG）と要件の確認後に算定されます。',
      'price.cta':'DMでお問い合わせ',
    }
  };

  var currentLang = 'ko';
  function applyLang(lang){
    var t=translations[lang]; if(!t) return; currentLang=lang;
    document.querySelectorAll('[data-i18n]').forEach(function(el){ var k=el.getAttribute('data-i18n'); if(t[k]!==undefined) el.innerHTML=t[k]; });
    document.querySelectorAll('.lang-btn').forEach(function(btn){ btn.classList.toggle('lang-active',btn.getAttribute('data-lang')===lang); });
    document.documentElement.lang=lang;
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.lang-btn').forEach(function(btn){ btn.addEventListener('click',function(){ applyLang(btn.getAttribute('data-lang')); }); });
    var bl=navigator.language.toLowerCase();
    if(bl.startsWith('ja')) applyLang('ja');
    else if(!bl.startsWith('ko')) applyLang('en');
  });
})();
